[//]: # (title: 與 JavaScript 的互通性)

<primary-label ref="beta"/> 

Kotlin/Wasm 允許你在 Kotlin 中使用 JavaScript 程式碼，以及在 JavaScript 中使用 Kotlin 程式碼。

與 [Kotlin/JS](js-overview.md) 一樣，Kotlin/Wasm 編譯器也具備與 JavaScript 的互通性。如果你熟悉 Kotlin/JS 的互通性，你會發現 Kotlin/Wasm 的互通性非常相似。然而，仍有一些關鍵差異需要注意。

> Kotlin/Wasm 處於 [Beta](components-stability.md) 階段。它隨時可能發生變動。請在生產環境之外的場景中使用。我們感謝你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492) 提供回饋。
>
{style="note"}

## 在 Kotlin 中使用 JavaScript 程式碼

學習如何透過 `external` 宣告、包含 JavaScript 程式碼片段的函式，以及 `@JsModule` 註解在 Kotlin 中使用 JavaScript 程式碼。

### 外部宣告 (External declarations)

預設情況下，外部 JavaScript 程式碼在 Kotlin 中是不可見的。要在 Kotlin 中使用 JavaScript 程式碼，你可以透過 `external` 宣告來描述其 API。

#### JavaScript 函式

考慮此 JavaScript 函式： 

```javascript
function greet (name) {
    console.log("Hello, " + name + "!");
}
```

你可以在 Kotlin 中將其宣告為 `external` 函式：

```kotlin
external fun greet(name: String)
```

外部函式沒有主體，你可以像呼叫一般 Kotlin 函式一樣呼叫它：

```kotlin
fun main() {
    greet("Alice")
}
```

#### JavaScript 屬性

考慮此全域 JavaScript 變數：

```javascript
let globalCounter = 0;
```

你可以在 Kotlin 中使用 external `var` 或 `val` 屬性將其宣告：

```kotlin
external var globalCounter: Int
```

這些屬性是在外部初始化的。在 Kotlin 程式碼中，這些屬性不能包含 `= value` 初始化運算式。

#### JavaScript 類別

考慮此 JavaScript 類別：

```javascript
class Rectangle {
    constructor (height, width) {
        this.height = height;
        this.width = width;
    }

    area () {
        return this.height * this.width;
    }
}
```

你可以在 Kotlin 中將其作為外部類別使用：

```kotlin
external class Rectangle(height: Double, width: Double) : JsAny {
    val height: Double
    val width: Double
    fun area(): Double
}
```

`external` 類別內的所有宣告都會被隱含地視為外部宣告。

#### 外部介面 (External interfaces)

你可以在 Kotlin 中描述 JavaScript 物件的形狀 (shape)。考慮此 JavaScript 函式及其傳回內容：

```javascript
function createUser (name, age) {
    return { name: name, age: age };
}
```

查看如何使用 `external interface User` 型別在 Kotlin 中描述其形狀：

```kotlin
external interface User : JsAny {
    val name: String
    val age: Int
}

external fun createUser(name: String, age: Int): User
```

外部介面不包含執行時型別資訊，僅為編譯期概念。因此，與一般介面相比，外部介面有一些限制：
* 你不能將它們用於 `is` 檢查的右側。
* 你不能在類別常值運算式（例如 `User::class`）中使用它們。
* 你不能將它們作為 reified 型別引數傳遞。
* 使用 `as` 轉換至外部介面一律會成功。

#### 外部物件 (External objects)

考慮這些持有物件的 JavaScript 變數：

```javascript
let Counter = {
    value: 0,
    step: 1,
    increment () {
        this.value += this.step;
    }
};
```

你可以在 Kotlin 中將它們作為外部物件使用：

```kotlin
external object Counter : JsAny {
    fun increment()
    val value: Int
    var step: Int
}
```

#### 外部型別階層結構

與一般類別和介面類似，你可以宣告外部宣告來擴充其他外部類別並實作外部介面。然而，你不能在同一個型別階層結構中混合使用外部與非外部宣告。

#### 透過 `@nativeInvoke` 呼叫 JavaScript 物件
<primary-label ref="experimental-opt-in"/>

你可以在 `external` 宣告（類別或介面）的 Kotlin 成員函式上使用 `@nativeInvoke` 註解，使其可以像 JavaScript 函式一樣被呼叫。

使用此註解後，在 Kotlin 中對該函式的每次呼叫都會轉換為對 JavaScript 物件的直接呼叫：

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

> `@nativeInvoke` 註解是在穩定互通性設計出爐之前的臨時解決方案。目前當你使用 `@nativeInvoke` 時，編譯器會回報警告。
>
{style="note"}

### 包含 JavaScript 程式碼的 Kotlin 函式

你可以藉由定義一個包含 `= js("code")` 主體的函式，將 JavaScript 片段加入 Kotlin/Wasm 程式碼中：

```kotlin
fun getCurrentURL(): String =
    js("window.location.href")
```

如果你想執行一個 JavaScript 陳述式區塊，請在字串內使用花括號 `{}` 包圍你的程式碼：

```kotlin
fun setLocalSettings(value: String): Unit = js(
    """{
        localStorage.setItem('settings', value);
}"""
)
```

如果你想傳回一個物件，請使用圓括號 `()` 包圍花括號 `{}`：

```kotlin
fun createJsUser(name: String, age: Int): JsAny =
    js("({ name: name, age: age })")
```

Kotlin/Wasm 會以特殊方式處理 `js()` 函式的呼叫，且其實作有一些限制：
* `js()` 函式呼叫必須提供一個字串常值引數。
* `js()` 函式呼叫必須是函式主體中唯一的運算式。
* `js()` 函式僅允許從套件級別函式中呼叫。
* 必須明確提供函式的傳回型別。
* [型別](#type-correspondence)受到限制，類似於 `external fun`。

Kotlin 編譯器會將程式碼字串放入產生的 JavaScript 檔案中的一個函式裡，並將其匯入為 WebAssembly 格式。Kotlin 編譯器不會驗證這些 JavaScript 片段。如果存在 JavaScript 語法錯誤，將在你執行 JavaScript 程式碼時回報。

> `@JsFun` 註解具有類似的功能，且未來可能會被棄用。
>
{style="note"}

### JavaScript 模組

預設情況下，外部宣告對應於 JavaScript 全域作用域。如果你使用 [`@JsModule` 註解](js-modules.md#jsmodule-annotation)來標註 Kotlin 檔案，則該檔案中所有的外部宣告都會從指定的模組中匯入。

考慮此 JavaScript 程式碼範例：

```javascript
// users.mjs
export let maxUsers = 10;

export class User {
    constructor (username) {
        this.username = username;
    }
}
```

在 Kotlin 中配合 `@JsModule` 註解使用此 JavaScript 程式碼：

```kotlin
// Kotlin
@file:JsModule("./users.mjs")

external val maxUsers: Int

external class User : JsAny {
    constructor(username: String)

    val username: String
}
```

### 陣列互通性

你可以將 JavaScript 的 `JsArray<T>` 複製到 Kotlin 原生的 `Array` 或 `List` 型別中；同樣地，你也可以將這些 Kotlin 型別複製到 `JsArray<T>`。

要將 `JsArray<T>` 轉換為 `Array<T>` 或反之亦然，請使用可用的 [配接器函式 (adapter functions)](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)。

以下是泛型型別之間轉換的範例：

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// 使用 .toJsArray() 將 List 或 Array 轉換為 JsArray
val jsArray: JsArray<JsString> = list.toJsArray()

// 使用 .toArray() 和 .toList() 將其轉換回 Kotlin 型別 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

類似的配接器函式也可用於將型別陣列轉換為其對應的 Kotlin 型別（例如 `IntArray` 和 `Int32Array`）。如需詳細資訊與實作，請參閱 [`kotlinx-browser` 存儲庫](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)。

以下是型別陣列之間轉換的範例：

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // 使用 .toInt32Array() 將 Kotlin IntArray 轉換為 JavaScript Int32Array
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // 使用 toIntArray() 將 JavaScript Int32Array 轉換回 Kotlin IntArray
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

## 在 JavaScript 中使用 Kotlin 程式碼

學習如何藉由使用 `@JsExport` 註解在 JavaScript 中使用你的 Kotlin 程式碼。

### 帶有 @JsExport 註解的函式

要使 Kotlin/Wasm 函式可用於 JavaScript 程式碼，請使用 `@JsExport` 註解：

```kotlin
// Kotlin/Wasm

@JsExport
fun addOne(x: Int): Int = x + 1
```

標記有 `@JsExport` 註解的 Kotlin/Wasm 函式，在產生的 `.mjs` 模組中會以 `default` 匯出的屬性形式出現。然後你可以在 JavaScript 中使用此函式：

```javascript
// JavaScript

import exports from "./module.mjs"

exports.addOne(10)
```

Kotlin/Wasm 編譯器能夠從你 Kotlin 程式碼中的任何 `@JsExport` 宣告產生 TypeScript 定義。這些定義可供 IDE 和 JavaScript 工具使用，以提供程式碼自動補全、協助型別檢查，並讓你在 JavaScript 和 TypeScript 中更輕鬆地使用 Kotlin 程式碼。

Kotlin/Wasm 編譯器會收集所有標記有 `@JsExport` 註解的頂層函式，並自動在 `.d.ts` 檔案中產生 TypeScript 定義。

要產生 TypeScript 定義，請在 `build.gradle.kts` 檔案的 `wasmJs{}` 區塊中加入 `generateTypeScriptDefinitions()` 函式：

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

> 在 Kotlin/Wasm 中產生 TypeScript 宣告檔案是 [實驗性的](components-stability.md#stability-levels-explained)。它隨時可能被捨棄或更改。
>
{style="warning"}

## 型別對應

Kotlin/Wasm 在 JavaScript 互通宣告的簽章中僅允許特定型別。這些限制統一適用於帶有 `external`、`= js("code")` 或 `@JsExport` 的宣告。

查看 Kotlin 型別與 JavaScript 型別的對應方式：

| Kotlin                                                     | JavaScript                        |
|------------------------------------------------------------|-----------------------------------|
| `Byte`, `Short`, `Int`, `Char`, `UByte`, `UShort`, `UInt`, | `Number`                          |
| `Float`, `Double`,                                         | `Number`                          |
| `Long`, `ULong`,                                           | `BigInt`                          |
| `Boolean`,                                                 | `Boolean`                         |
| `String`,                                                  | `String`                          |
| 位於傳回位置的 `Unit`                                          | `undefined`                       |
| 函式型別，例如 `(String) -> Int`                               | Function                          |
| `JsAny` 及其子型別                                          | 任何 JavaScript 值                 |
| `JsReference`                                              | 對 Kotlin 物件的不透明參考 (Opaque reference) |
| 其他型別                                                   | 不支援                             |

你也可以使用這些型別的可為 null 版本。

### JsAny 型別

JavaScript 值在 Kotlin 中使用 `JsAny` 型別及其子型別表示。

Kotlin/Wasm 標準函式庫提供了其中一些型別的表示方式：
* 套件 `kotlin.js`:
    * `JsAny`
    * `JsBoolean`, `JsNumber`, `JsString`
    * `JsArray`
    * `Promise`

你也可以透過宣告 `external` 介面或類別來建立自訂的 `JsAny` 子型別。

### JsReference 型別

Kotlin 值可以使用 `JsReference` 型別作為不透明參考傳遞給 JavaScript。

例如，如果你想將這個 Kotlin 類別 `User` 公開給 JavaScript：

```kotlin
class User(var name: String)
```

你可以使用 `toJsReference()` 函式建立 `JsReference<User>` 並將其傳回給 JavaScript：

```kotlin
@JsExport
fun createUser(name: String): JsReference<User> {
    return User(name).toJsReference()
}
```

這些參考在 JavaScript 中無法直接使用，其行為類似於空的凍結 JavaScript 物件。要操作這些物件，你需要使用 `get()` 方法將更多函式匯出到 JavaScript，並在其中解開參考值：

```kotlin
@JsExport
fun setUserName(user: JsReference<User>, name: String) {
    user.get().name = name
}
```

你可以建立一個類別並從 JavaScript 更改其名稱：

```javascript
import UserLib from "./userlib.mjs"

let user = UserLib.createUser("Bob");
UserLib.setUserName(user, "Alice");
```

### 型別參數

如果 JavaScript 互通宣告具有 `JsAny` 或其子型別的上界 (upper bound)，則可以擁有型別參數。例如：

```kotlin
external fun <T : JsAny> processData(data: JsArray<T>): T
```

## 例外處理

你可以使用 Kotlin 的 `try-catch` 運算式在 Kotlin/Wasm 程式碼中捕捉 JavaScript 例外。例外處理的運作方式如下：

* 從 JavaScript 拋出的例外：在 Kotlin 端可以取得詳細資訊。如果此類例外傳播回 JavaScript，它將不再被封裝到 WebAssembly 中。

* 從 Kotlin 拋出的例外：它們可以在 JavaScript 端作為一般 JS 錯誤被捕捉。

以下範例展示了在 Kotlin 端捕捉 JavaScript 例外：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 列印完整的 JavaScript 堆疊追蹤 
        e.printStackTrace()
    }
}
```

這種例外處理在支援 [`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 功能的現代瀏覽器中可自動運作：

* Chrome 115+
* Firefox 129+
* Safari 18.4+

## Kotlin/Wasm 與 Kotlin/JS 互通性的差異

雖然 Kotlin/Wasm 的互通性與 Kotlin/JS 的互通性有相似之處，但仍有以下關鍵差異需要考慮：

|                         | **Kotlin/Wasm**                                                                                                                                                                                                     | **Kotlin/JS**                                                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **外部列舉**      | 不支援外部列舉類別。                                                                                                                                                                              | 支援外部列舉類別。                                                                                                                     |
| **型別擴充**     | 不支援非外部型別擴充外部型別。                                                                                                                                                                                       | 支援非外部型別。                                                                                                                        |
| **`JsName` 註解** | 僅在標註外部宣告時有效。                                                                                                                                                                                           | 可用於更改一般非外部宣告的名稱。                                                                                                                  |
| **`js()` 函式**       | `js("code")` 函式呼叫允許作為套件級別函式的單一運算式主體。                                                                                                                                                           | `js("code")` 函式可以在任何內容中呼叫，並傳回一個 `dynamic` 值。                                                               |
| **模組系統**      | 僅支援 ES 模組。沒有與 `@JsNonModule` 註解對應的功能。在其 `default` 物件上以屬性形式提供其匯出。僅允許匯出套件級別函式。                                                                                         | 支援 ES 模組和舊版模組系統。提供具名的 ESM 匯出。允許匯出類別與物件。                                    |
| **型別**               | 對所有互通宣告 `external`、`= js("code")` 和 `@JsExport` 統一套用更嚴格的型別限制。允許精選數量的 [內建 Kotlin 型別與 `JsAny` 子型別](#type-correspondence)。 | 允許 `external` 宣告中使用所有型別。限制 [可用於 `@JsExport` 的型別](js-to-kotlin-interop.md#kotlin-types-in-javascript)。 |
| **Long**                | 型別對應於 JavaScript `BigInt`。                                                                                                                                                                            | 在 JavaScript 中可見為自訂類別。                                                                                                            |
| **陣列**              | 目前尚未直接支援互通。你可以改用新的 `JsArray` 型別。                                                                                                                                                                 | 實作為 JavaScript 陣列。                                                                                                                   |
| **其他型別**         | 需要 `JsReference<>` 才能將 Kotlin 物件傳遞給 JavaScript。                                                                                                                                                      | 允許在外部宣告中使用非外部 Kotlin 類別型別。                                                                         |
| **例外處理**  | 你可以使用 `JsException` 和 `Throwable` 型別捕捉任何 JavaScript 例外。                                                                                                                                | 可以使用 `Throwable` 型別捕捉 JavaScript `Error`。可以使用 `dynamic` 型別捕捉任何 JavaScript 例外。                            |
| **動態型別**       | 不支援 `dynamic` 型別。請改用 `JsAny`（參見下方範例程式碼）。                                                                                                                                   | 支援 `dynamic` 型別。                                                                                                                        |

> Kotlin/Wasm 不支援 Kotlin/JS 用於與未型別化或弱型別物件互通的 [動態型別 (dynamic type)](dynamic-type.md)。請改用 `JsAny` 型別來替代 `dynamic` 型別：
>
> ```kotlin
> // Kotlin/JS
> fun processUser(user: dynamic, age: Int) {
>     // ...
>     user.profile.updateAge(age)
>     // ...
> }
>
> // Kotlin/Wasm
> private fun updateUserAge(user: JsAny, age: Int): Unit =
>     js("{ user.profile.updateAge(age); }")
>
> fun processUser(user: JsAny, age: Int) {
>     // ...
>     updateUserAge(user, age)
>     // ...
> }
> ```
>
{style="note"}

## 與 Web 相關的瀏覽器 API

[`kotlinx-browser` 程式庫](https://github.com/kotlin/kotlinx-browser) 是一個獨立的程式庫，提供了 JavaScript 瀏覽器 API，包括：
* 套件 `org.khronos.webgl`:
  * 型別陣列，例如 `Int8Array`。
  * WebGL 型別。
* 套件 `org.w3c.dom.*`:
  * DOM API 型別。
* 套件 `kotlinx.browser`:
  * DOM API 全域物件，例如 `window` 和 `document`。

要使用 `kotlinx-browser` 程式庫中的宣告，請在專案的組建組態檔案中將其新增為相依性：

```kotlin
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}