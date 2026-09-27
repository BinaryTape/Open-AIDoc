[//]: # (title: 從 Kotlin 使用 JavaScript 程式碼)

Kotlin 最初是為了與 Java 平台輕鬆互通而設計的：它將 Java 類別視為 Kotlin 類別，而 Java 則將 Kotlin 類別視為 Java 類別。

然而，JavaScript 是一種動態型別語言 (dynamically typed language)，這意味著它不會在編譯期檢查型別。你可以透過 [dynamic](dynamic-type.md) 型別從 Kotlin 自由地與 JavaScript 通訊。如果你想利用 Kotlin 型別系統的完整功能，可以為 JavaScript 程式庫建立外部宣告 (external declarations)，這些宣告將被 Kotlin 編譯器和周邊工具所理解。

## 內嵌 JavaScript {id="inline-javascript"}

你可以使用 [`js()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 函式將 JavaScript 程式碼內嵌到你的 Kotlin 程式碼中：

```kotlin
fun jsTypeOf(o: Any): String {
    return js("typeof o")
}
```

JavaScript 程式碼內嵌完整支援 [ES2015 特性](js-project-setup.md#set-an-ecmascript-target)，包括：

* `const` 與 `let` 變數宣告
* ES 類別
* 產生器 (Generators)
* Lambda ([箭頭函式](whatsnew21.md#support-for-generating-es2015-arrow-functions))
* 展開 (Spread) 與其餘 (rest) 運算子
* 範本字串 (Template strings)

因為 `js` 的參數是在編譯期剖析並「原封不動」地翻譯為 JavaScript 程式碼，所以它必須是字串常數。因此，以下程式碼是不正確的：

```kotlin
fun jsTypeOf(o: Any): String {
    return js(getTypeof() + " o") // 錯誤：引數必須是字串常數
    // 編譯器無法求值字串連接
}

fun getTypeof() = "typeof"
```

相反地，例如要內嵌其餘運算子，請使用字串常數：

```kotlin
fun runSumExample() {
    val sum = js("(...nums) => nums.reduce((a, b) => a + b, 0)")
    println(sum(1, 2, 3, 4))
}
```

> 呼叫 `js()` 會傳回 [`dynamic`](dynamic-type.md) 型別的結果，這在編譯期不提供任何型別安全性。
>
{style="note"}

## `external` 修飾符 {id="external-modifier"}

為了告訴 Kotlin 某個宣告是用純 JavaScript 編寫的，你應該使用 `external` 修飾符標記它。當編譯器看到這樣的宣告時，它會假設對應的類別、函式或屬性的實作是由外部提供的（由開發者提供或透過 [npm 相依性](js-project-setup.md#npm-dependencies)），因此不會嘗試從該宣告產生任何 JavaScript 程式碼。這也是為什麼 `external` 宣告不能有主體 (body) 的原因。例如：

```kotlin
external fun alert(message: Any?): Unit

external class Node {
    val firstChild: Node

    fun append(child: Node): Node

    fun removeChild(child: Node): Node

    // 等等
}

external val window: Window
```

請注意，`external` 修飾符會由巢狀宣告繼承。這就是為什麼在範例 `Node` 類別中，成員函式和屬性之前沒有 `external` 修飾符的原因。

`external` 修飾符僅允許用於套件層級的宣告。你不能在非 `external` 類別中宣告 `external` 成員。

### 宣告類別的 (static) 成員 {id="declare-static-members-of-a-class"}

在 JavaScript 中，你可以在原型 (prototype) 或類別本身定義成員：

``` javascript
function MyClass() { ... }
MyClass.sharedMember = function() { /* 實作 */ };
MyClass.prototype.ownMember = function() { /* 實作 */ };
```

Kotlin 中沒有這種語法。然而，在 Kotlin 中我們有 [`companion`](object-declarations.md#companion-objects) 物件。Kotlin 以特殊方式處理 `external` 類別的伴隨物件：它不再預期一個物件，而是將伴隨物件的成員視為類別本身的成員。上述範例中的 `MyClass` 可以描述如下：

```kotlin
external class MyClass {
    companion object {
        fun sharedMember()
    }

    fun ownMember()
}
```

### 宣告具有預設值的參數 {id="declare-parameters-with-default-values"}

如果你正在為具有預設值參數的 JavaScript 函式撰寫外部宣告，請使用 `definedExternally`。這會將預設值的產生委派給 JavaScript 函式本身：

```kotlin
external fun myFunWithOptionalArgs(
    x: Int,
    y: String = definedExternally,
    z: String = definedExternally
)
```

有了這個外部宣告，你可以使用一個必選引數和兩個選用引數來呼叫 `myFunWithOptionalArgs`，其中的預設值由 `myFunWithOptionalArgs` 的 JavaScript 實作計算。

### 擴充 JavaScript 類別 {id="extend-javascript-classes"}

你可以像擴充 Kotlin 類別一樣輕鬆地擴充 JavaScript 類別。只需定義一個 `external open` 類別，並由非 `external` 類別擴充它即可。例如：

```kotlin
open external class Foo {
    open fun run()
    fun stop()
}

class Bar : Foo() {
    override fun run() {
        window.alert("Running!")
    }

    fun restart() {
        window.alert("Restarting")
    }
}
```

有一些限制：

- 當外部基底類別的函式按簽章 (signature) 進行多載時，你不能在衍生類別中覆寫它。
- 你不能覆寫包含具有預設值參數的函式。
- 非外部類別不能被外部類別擴充。

### 外部介面 (external interfaces) {id="external-interfaces"}

JavaScript 沒有介面的概念。當一個函式預期其參數支援 `foo` 和 `bar` 兩個方法時，你只需傳入一個實際具有這些方法的物件即可。

你可以在靜態型別的 Kotlin 中使用介面來表達這個概念：

```kotlin
external interface HasFooAndBar {
    fun foo()

    fun bar()
}

external fun myFunction(p: HasFooAndBar)
```

外部介面的一個典型使用案例是描述設定物件。例如：

```kotlin
external interface JQueryAjaxSettings {
    var async: Boolean

    var cache: Boolean

    var complete: (JQueryXHR, String) -> Unit

    // 等等
}

fun JQueryAjaxSettings(): JQueryAjaxSettings = js("{}")

external class JQuery {
    companion object {
        fun get(settings: JQueryAjaxSettings): JQueryXHR
    }
}

fun sendQuery() {
    JQuery.get(JQueryAjaxSettings().apply {
        complete = { (xhr, data) ->
            window.alert("Request complete")
        }
    })
}
```

外部介面有一些限制：

- 它們不能用於 `is` 檢查的右側。
- 它們不能作為具體化 (reified) 型別引數傳遞。
- 它們不能用於類別常值運算式（例如 `I::class`）。
- 轉換 (cast) 為外部介面的 `as` 操作一律會成功。
    轉換為外部介面會產生「Unchecked cast to external interface」編譯期警告。可以使用 `@Suppress("UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")` 註解來抑制該警告。

    IntelliJ IDEA 也可以自動產生 `@Suppress` 註解。透過燈泡圖示或 Alt-Enter 開啟意圖功能表，然後點擊「Unchecked cast to external interface」檢查旁邊的小箭頭。在此處，你可以選擇抑制範圍，你的 IDE 將相應地在檔案中新增註解。

### 轉換 (Casts) {id="casts"}

除了在無法轉換時拋出 `ClassCastException` 的[「不安全」轉換運算子](typecasts.md#unsafe-cast-operator) `as` 之外，Kotlin/JS 還提供了 [`unsafeCast<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/unsafe-cast.html)。使用 `unsafeCast` 時，在執行時完全不進行型別檢查。例如，考慮以下兩個方法：

```kotlin
fun usingUnsafeCast(s: Any) = s.unsafeCast<String>()
fun usingAsOperator(s: Any) = s as String
```

它們將分別被編譯為：

```javascript
function usingUnsafeCast(s) {
    return s;
}

function usingAsOperator(s) {
    var tmp$;
    return typeof (tmp$ = s) === 'string' ? tmp$ : throwCCE();
}
```

## 相等性 (Equality) {id="equality"}

與其他平台相比，Kotlin/JS 對相等性檢查具有特定的語義。

在 Kotlin/JS 中，Kotlin [參照相等](equality.md#referential-equality)運算子 (`===`) 一律轉換為 JavaScript 的[嚴格相等](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)運算子 (`===`)。

JavaScript 的 `===` 運算子不僅檢查兩個值是否相等，還檢查這兩個值的型別是否相等：

 ```kotlin
fun main() {
    val name = "kotlin"
    val value1 = name.substring(0, 1)
    val value2 = name.substring(0, 1)

    println(value1 === value2)
    // 在 Kotlin/JS 上列印 'true'
    // 在其他平台上列印 'false'
}
 ```

此外，在 Kotlin/JS 中，[`Byte`、`Short`、`Int`、`Float` 和 `Double`](js-to-kotlin-interop.md#kotlin-types-in-javascript) 數值型別在執行時皆以 `Number` JavaScript 型別表示。因此，這五種型別的值是無法區分的：

 ```kotlin
fun main() {
    println(1.0 as Any === 1 as Any)
    // 在 Kotlin/JS 上列印 'true'
    // 在其他平台上列印 'false'
}
 ```

> 有關 Kotlin 中相等性的更多資訊，請參閱 [相等性](equality.md) 文件。
> 
{style="tip"}