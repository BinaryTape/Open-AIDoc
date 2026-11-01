[//]: # (title: Kotlin 1.3 新功能)

<web-summary>閱讀 Kotlin 1.3 版本資訊，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及對 Gradle 與 Maven 建置工具的支援。</web-summary>

_發佈日期：2018 年 10 月 29 日_

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 協同程式正式發佈 {id="coroutines-release"}

經過長期且廣泛的實戰測試，協同程式現已正式發佈！這意味著從 Kotlin 1.3 開始，語言支援與 API 均已[完全穩定](components-stability.md)。請查看全新的[協同程式概觀](coroutines-overview.md)頁面。

Kotlin 1.3 引入了掛起函式（suspend-functions）的可呼叫參照，並在反射 API 中支援協同程式。

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.3 持續改進並完善 Native 目標平台。詳情請參閱 [Kotlin/Native 概觀](native-overview.md)。

## 多平台專案 {id="multiplatform-projects"}

在 1.3 中，我們徹底重構了多平台專案的模型，以提高表達能力與靈活性，並使共用程式碼更加容易。此外，Kotlin/Native 現在也作為目標平台之一受到支援！

與舊模型的主要差異如下：

  * 在舊模型中，通用程式碼與平台專屬程式碼需要放在由 `expectedBy` 相依性連結的不同模組中。現在，通用程式碼與平台專屬程式碼位於同一模組的不同原始碼根目錄下，使專案設定更簡單。
  * 現在針對各種受支援的平台提供了大量的[預設平台設定](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)。
  * [相依性設定](https://kotlinlang.org/docs/multiplatform/multiplatform-add-dependencies.html)已變更；現在相依性是針對每個原始碼根目錄分別指定的。
  * 原始碼集現在可以在任意平台的子集之間共用（例如，在以 JS、Android 和 iOS 為目標的模組中，你可以擁有僅在 Android 和 iOS 之間共用的原始碼集）。
  * 現在支援[發佈多平台程式庫](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

如需更多資訊，請參閱[多平台程式設計文件](https://kotlinlang.org/docs/multiplatform/get-started.html)。

## 契約 (Contracts) {id="contracts"}

Kotlin 編譯器執行廣泛的靜態分析以提供警告並減少樣板程式碼。其中最顯著的功能之一就是智慧轉換（smartcasts）——具備根據執行的型別檢查自動執行轉換的能力：

```kotlin
fun foo(s: String?) {
    if (s != null) s.length // Compiler automatically casts 's' to 'String'
}
```

然而，一旦將這些檢查擷取到單獨的函式中，所有的智慧轉換就會立即消失：

```kotlin
fun String?.isNotNull(): Boolean = this != null

fun foo(s: String?) {
    if (s.isNotNull()) s.length // No smartcast :(
}
```

為了改善此類情況下的表現，Kotlin 1.3 引入了稱為*契約 (contracts)* 的實驗性機制。

*契約*允許函式以編譯器能夠理解的方式明確描述其行為。目前支援兩大類情況：

* 透過宣告函式呼叫結果與傳入引數值之間的關係，改進智慧轉換分析：

```kotlin
fun require(condition: Boolean) {
    // This is a syntax form which tells the compiler:
    // "if this function returns successfully, then the passed 'condition' is true"
    contract { returns() implies condition }
    if (!condition) throw IllegalArgumentException(...)
}

fun foo(s: String?) {
    require(s is String)
    // s is smartcast to 'String' here, because otherwise
    // 'require' would have thrown an exception
}
```

* 改善存在高階函數時的變數初始化分析：

```kotlin
fun synchronize(lock: Any?, block: () -> Unit) {
    // It tells the compiler:
    // "This function will invoke 'block' here and now, and exactly one time"
    contract { callsInPlace(block, EXACTLY_ONCE) }
}

fun foo() {
    val x: Int
    synchronize(lock) {
        x = 42 // Compiler knows that lambda passed to 'synchronize' is called
               // exactly once, so no reassignment is reported
    }
    println(x) // Compiler knows that lambda will be definitely called, performing
               // initialization, so 'x' is considered to be initialized here
}
```

### stdlib 中的契約 {id="contracts-in-stdlib"}

`stdlib` 已經開始使用契約，進而改進了上述的分析能力。這部分的契約是**穩定的**，這意味著你現在就可以從改進後的分析中受益，無需任何額外的選擇加入（opt-in）：

```kotlin
//sampleStart
fun bar(x: String?) {
    if (!x.isNullOrEmpty()) {
        println("length of '$x' is ${x.length}") // Yay, smartcast to not-null!
    }
}
//sampleEnd
fun main() {
    bar(null)
    bar("42")
}
```
{kotlin-runnable="true"}

### 自訂契約 {id="custom-contracts"}

你可以為自己的函式宣告契約，但這項功能是**實驗性的**，因為目前的語法處於早期原型階段，極有可能會發生變更。另外請注意，目前 Kotlin 編譯器不會驗證契約，因此編寫正確且合理的契約是程式設計師的責任。

自訂契約是透過呼叫提供 DSL 作用域的 `contract` stdlib 函式來引入的：

```kotlin
fun String?.isNullOrEmpty(): Boolean {
    contract {
        returns(false) implies (this@isNullOrEmpty != null)
    }
    return this == null || isEmpty()
}
```

有關語法的詳細資訊以及相容性注意事項，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/kotlin-contracts.md)。

## 將 when 的主詞捕獲至變數中 {id="capturing-when-subject-in-a-variable"}

在 Kotlin 1.3 中，現在可以將 `when` 的主詞（subject）捕獲到變數中：

```kotlin
fun Request.getBody() =
        when (val response = executeRequest()) {
            is Success -> response.body
            is HttpError -> throw HttpException(response.status)
        }
```

雖然先前已經可以在 `when` 前面擷取此變數，但 `when` 中的 `val` 將其作用域正確限制在 `when` 的主體內，進而防止命名空間污染。[在此參閱有關 `when` 的完整文件](control-flow.md#when-expressions-and-statements)。

## 介面伴生物件中的 @JvmStatic 與 @JvmField {id="jvmstatic-and-jvmfield-in-companions-of-interfaces"}

在 Kotlin 1.3 中，可以使用註解 `@JvmStatic` 和 `@JvmField` 標記介面的 `companion` 物件成員。在 class 檔案中，此類成員將被提升到對應的介面並標記為 `static`。

例如，以下 Kotlin 程式碼：

```kotlin
interface Foo {
    companion object {
        @JvmField
        val answer: Int = 42

        @JvmStatic
        fun sayHello() {
            println("Hello, world!")
        }
    }
}
```

等同於以下 Java 程式碼：

```java
interface Foo {
    public static int answer = 42;
    public static void sayHello() {
        // ...
    }
}
```

## 註解類別中的巢狀宣告 {id="nested-declarations-in-annotation-classes"}

在 Kotlin 1.3 中，註解可以包含巢狀類別、介面、物件以及伴隨物件：

```kotlin
annotation class Foo {
    enum class Direction { UP, DOWN, LEFT, RIGHT }
    
    annotation class Bar

    companion object {
        fun foo(): Int = 42
        val bar: Int = 42
    }
}
```

## 無參數 main 函式 {id="parameterless-main"}

按照慣例，Kotlin 程式的入口點是一個簽章類似於 `main(args: Array<String>)` 的函式，其中 `args` 代表傳遞給程式的命令列引數。然而，並非所有應用程式都支援命令列引數，因此該參數最終通常未被使用。

Kotlin 1.3 引入了不帶參數的更簡潔形式的 `main`。現在 Kotlin 的 "Hello, World" 短了 19 個字元！

```kotlin
fun main() {
    println("Hello, world!")
}
```
{kotlin-runnable="true"}

## 大參數數量的函式 {id="functions-with-big-arity"}

在 Kotlin 中，函式型別表示為接收不同數量參數的泛型類別：`Function0<R>`、`Function1<P0, R>`、`Function2<P0, P1, R>`、…… 這種做法的問題在於此清單是有限的，目前在 `Function22` 處結束。

Kotlin 1.3 放寬了這一限制，並增加了對具有更大參數數量（arity）的函式支援：

```kotlin
fun trueEnterpriseComesToKotlin(block: (Any, Any, ... /* 42 more */, Any) -> Any) {
    block(Any(), Any(), ..., Any())
}
```

## 漸進模式 (Progressive mode) {id="progressive-mode"}

Kotlin 非常重視程式碼的穩定性與回溯相容性：Kotlin 相容性政策規定破壞性變更（例如：使原本可正常編譯的程式碼無法再編譯的變更）只能在主要版本（**1.2**、**1.3** 等）中引入。

我們相信很多使用者希望能夠使用更快的週期，讓關鍵的編譯器錯誤修復能夠立即套用，使程式碼更加安全且正確。因此，Kotlin 1.3 引入了編譯器的*漸進 (progressive)* 模式，可以透過向編譯器傳遞引數 `-progressive` 來啟用。

在漸進模式下，語言語意的一些修正可以立即套用。所有這些修正都有兩個重要特點：

* 它們保留了原始碼與舊版編譯器的回溯相容性，這意味著所有能被漸進式編譯器編譯的程式碼，都能被非漸進式編譯器正常編譯。
* 它們只會在某種意義上讓程式碼*更安全*——例如，某些不健全的智慧轉換可能會被禁止，產生的程式碼行為可能會變更為更可預測／更穩定等。

啟用漸進模式可能需要你重寫部分程式碼，但改動不應太大——在漸進模式下啟用的所有修正都經過精心挑選、審查，並提供工具移轉協助。我們預期對於快速更新至最新語言版本、積極維護的程式碼庫來說，漸進模式會是一個極佳的選擇。

## 內嵌類別 (Inline classes) {id="inline-classes"}

>內嵌類別目前處於 [Alpha](components-stability.md) 階段。它們未來可能會發生不相容的變更，並需要手動移轉。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上向我們提供回饋。
> 詳情請參閱[參考資料](inline-classes.md)。
>
{style="warning"}

Kotlin 1.3 引入了一種新的宣告類型——`inline class`。內嵌類別可以被視為一般類別的受限版本，特別是內嵌類別必須恰好具有一個屬性：

```kotlin
inline class Name(val s: String)
```

Kotlin 編譯器將利用這項限制主動最佳化內嵌類別的執行時期表示，並在可能的情況下將其實例替換為底層屬性的值，進而消除建構函式呼叫、減輕垃圾收集負擔，並啟用其他最佳化：

```kotlin
inline class Name(val s: String)
//sampleStart
fun main() {
    // In the next line no constructor call happens, and
    // at the runtime 'name' contains just string "Kotlin"
    val name = Name("Kotlin")
    println(name.s) 
}
//sampleEnd
```
{kotlin-runnable="true"}

詳情請參閱內嵌類別的[參考資料](inline-classes.md)。

## 無正負號整數 {id="unsigned-integers"}

> 無正負號整數目前處於 [Beta](components-stability.md) 階段。
> 其實作已接近穩定，但未來可能需要移轉步驟。
> 我們將盡力減少你必須進行的任何變更。
>
{style="warning"}

Kotlin 1.3 引入了無正負號整數型別：

* `kotlin.UByte`：無正負號 8 位元整數，範圍從 0 到 255
* `kotlin.UShort`：無正負號 16 位元整數，範圍從 0 到 65535
* `kotlin.UInt`：無正負號 32 位元整數，範圍從 0 到 2^32 - 1
* `kotlin.ULong`：無正負號 64 位元整數，範圍從 0 到 2^64 - 1

有正負號型別的大多數功能在無正負號對應型別中也同樣受支援：

```kotlin
fun main() {
//sampleStart
// You can define unsigned types using literal suffixes
val uint = 42u 
val ulong = 42uL
val ubyte: UByte = 255u

// You can convert signed types to unsigned and vice versa via stdlib extensions:
val int = uint.toInt()
val byte = ubyte.toByte()
val ulong2 = byte.toULong()

// Unsigned types support similar operators:
val x = 20u + 22u
val y = 1u shl 8
val z = "128".toUByte()
val range = 1u..5u
//sampleEnd
println("ubyte: $ubyte, byte: $byte, ulong2: $ulong2")
println("x: $x, y: $y, z: $z, range: $range")
}
```
{kotlin-runnable="true"}

詳情請參閱[參考資料](unsigned-integer-types.md)。

## @JvmDefault {id="jvmdefault"}

>`@JvmDefault` 目前為[實驗功能](components-stability.md)。它隨時可能被棄用或變更。
> 請僅用於評估目的。歡迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上向我們提供回饋。
>
{style="warning"}

Kotlin 針對多種 Java 版本，包括不允許介面包含預設方法的 Java 6 和 Java 7。為了方便起見，Kotlin 編譯器繞過了該限制，但此因應措施與 Java 8 引入的 `default` 方法不相容。

這可能會成為 Java 互通性的一個問題，因此 Kotlin 1.3 引入了 `@JvmDefault` 註解。使用此註解標記的方法將為 JVM 產生為 `default` 方法：

```kotlin
interface Foo {
    // Will be generated as 'default' method
    @JvmDefault
    fun foo(): Int = 42
}
```

> 警告！使用 `@JvmDefault` 標記你的 API 會對二進位相容性產生重大影響。
在生產環境中使用 `@JvmDefault` 之前，請務必仔細閱讀[參考頁面](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default/index.html)。
>
{style="warning"}

## 標準函式庫 {id="standard-library"}

### 多平台亂數產生 {id="multiplatform-random"}

在 Kotlin 1.3 之前，所有平台上都沒有統一產生亂數的方法——我們不得不依賴平台專屬的解決方案，例如 JVM 上的 `java.util.Random`。本版本透過引入在所有平台上均可使用的 `kotlin.random.Random` 類別解決了這個問題：

```kotlin
import kotlin.random.Random

fun main() {
//sampleStart
    val number = Random.nextInt(42)  // number is in range [0, limit)
    println(number)
//sampleEnd
}
```
{kotlin-runnable="true"}

### isNullOrEmpty 與 orEmpty 擴充函式 {id="isnullorempty-and-orempty-extensions"}

stdlib 中已經存在針對某些型別的 `isNullOrEmpty` 和 `orEmpty` 擴充函式。如果接收者為 `null` 或為空，前者傳回 `true`；如果接收者為 `null`，後者則備援為空執行個體。Kotlin 1.3 為集合、Map 和物件陣列提供了類似的擴充函式。

### 在兩個現有陣列之間複製元素 {id="copy-elements-between-two-existing-arrays"}

針對現有陣列型別（包括無正負號陣列）的 `array.copyInto(targetArray, targetOffset, startIndex, endIndex)` 函式，使得以純 Kotlin 實作基於陣列的容器變得更加容易。

```kotlin
fun main() {
//sampleStart
    val sourceArr = arrayOf("k", "o", "t", "l", "i", "n")
    val targetArr = sourceArr.copyInto(arrayOfNulls<String>(6), 3, startIndex = 3, endIndex = 6)
    println(targetArr.contentToString())
    
    sourceArr.copyInto(targetArr, startIndex = 0, endIndex = 3)
    println(targetArr.contentToString())
//sampleEnd
}
```
{kotlin-runnable="true"}

### associateWith {id="associatewith"}

在擁有鍵清單並希望透過將每個鍵與特定值關聯來建立 Map 是一種相當常見的情境。以前可以透過 `associate { it to getValue(it) }` 函式來實現，但現在我們引入了更有效率且更易於探索的替代方案：`keys.associateWith { getValue(it) }`。

```kotlin
fun main() {
//sampleStart
    val keys = 'a'..'f'
    val map = keys.associateWith { it.toString().repeat(5).capitalize() }
    map.forEach { println(it) }
//sampleEnd
}
```

### ifEmpty 與 ifBlank 函式 {id="ifempty-and-ifblank-functions"}

集合、Map、物件陣列、字元序列和序列現在都具有 `ifEmpty` 函式，允許指定當接收者為空時將代替其使用的備援值：

```kotlin
fun main() {
//sampleStart
    fun printAllUppercase(data: List<String>) {
        val result = data
        .filter { it.all { c -> c.isUpperCase() } }
            .ifEmpty { listOf("<no uppercase>") }
        result.forEach { println(it) }
    }
    
    printAllUppercase(listOf("foo", "Bar"))
    printAllUppercase(listOf("FOO", "BAR"))
//sampleEnd
}
```
{kotlin-runnable="true"}

此外，字元序列與字串還具有 `ifBlank` 擴充函式，其作用與 `ifEmpty` 相同，但會檢查字串是否全為空白字元而不僅僅是為空。

```kotlin
fun main() {
//sampleStart
    val s = "    \n"
    println(s.ifBlank { "<blank>" })
    println(s.ifBlank { null })
//sampleEnd
}
```
{kotlin-runnable="true"}

### 反射中的密封類別 {id="sealed-classes-in-reflection"}

我們在 `kotlin-reflect` 中新增了一個新的 API，可用於列舉 `sealed` 類別的所有直接子型別，即 `KClass.sealedSubclasses`。

### 較小的變更 {id="smaller-changes"}

* `Boolean` 型別現在擁有伴生物件。
* `Any?.hashCode()` 擴充函式，針對 `null` 傳回 0。
* `Char` 現在提供 `MIN_VALUE` 與 `MAX_VALUE` 常數。
* 基本型別伴生物件中新增了 `SIZE_BYTES` 與 `SIZE_BITS` 常數。

## 工具 {id="tooling"}

### IDE 中的程式碼風格支援 {id="code-style-support-in-ide"}

Kotlin 1.3 引入了在 IntelliJ IDEA 中對[推薦程式碼風格](coding-conventions.md)的支援。請查看[此頁面](code-style-migration-guide.md)以取得移轉指南。

### kotlinx.serialization {id="kotlinx-serialization"}

[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 是一個在 Kotlin 中為物件（反）序列化提供多平台支援的程式庫。以前它是一個獨立專案，但自 Kotlin 1.3 起，它與其他編譯器外掛程式一樣隨 Kotlin 編譯器版本一同發佈。主要差別在於你無需手動確認 Serialization IDE 外掛程式是否與你使用的 Kotlin IDE 外掛程式版本相容：現在 Kotlin IDE 外掛程式已直接包含序列化！

詳情請參閱[此處](https://github.com/Kotlin/kotlinx.serialization#current-project-status)。

> 儘管 kotlinx.serialization 現在隨 Kotlin 編譯器發佈套件一同提供，但在 Kotlin 1.3 中它仍被視為實驗功能。
>
{style="warning"}

### 指令碼更新 {id="scripting-update"}

>指令碼編寫目前為[實驗功能](components-stability.md)。它隨時可能被棄用或變更。
> 請僅用於評估目的。歡迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上向我們提供回饋。
>
{style="warning"}

Kotlin 1.3 持續演進並改進指令碼 API，為指令碼自訂引入了一些實驗性支援，例如新增外部屬性、提供靜態或動態相依性等等。

如需其他詳細資訊，請參閱 [KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md)。

### 草稿檔支援 {id="scratches-support"}

Kotlin 1.3 引入了對可執行 Kotlin *暫存檔 / 草稿檔 (scratch files)* 的支援。*草稿檔*是帶有 .kts 副檔名的 Kotlin 指令碼檔案，你可以直接在編輯器中執行並取得求值結果。

詳情請參閱常規的[草稿檔文件](https://www.jetbrains.com/help/idea/scratches.html)。