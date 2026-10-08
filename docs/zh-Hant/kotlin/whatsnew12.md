[//]: # (title: Kotlin 1.2 的新功能)

<web-summary>閱讀 Kotlin 1.2 版本說明，涵蓋新的語言特性、Kotlin Multiplatform、JVM 和 JS 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_發佈日期：2017 年 11 月 28 日_

## 目錄 {id="table-of-contents"}

* [多平台專案](#multiplatform-projects-experimental)
* [其他語言特性](#other-language-features)
* [標準函式庫](#standard-library)
* [JVM 後端](#jvm-backend)
* [JavaScript 後端](#javascript-backend)

> 關於 Kotlin 版本週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 多平台專案（實驗性） {id="multiplatform-projects-experimental"}

多平台專案是 Kotlin 1.2 中的一項新**實驗性**功能，允許你在 Kotlin 支援的目標平台（JVM、JavaScript，以及未來的 Native）之間重複使用程式碼。在一個多平台專案中，你有三種模組：

* *通用 (common)* 模組包含不特定於任何平台的程式碼，以及不含實作的平台相關 API 宣告。
* *平台 (platform)* 模組包含通用模組中平台相關宣告在特定平台上的實作，以及其他平台相關程式碼。
* 常規模組針對特定平台，可以作為平台模組的相依性，或者依賴於平台模組。

當你為特定平台編譯多平台專案時，會同時產生通用部分和平台特定部分的程式碼。

多平台專案支援的一個關鍵特性，是可以透過 *expected* 與 *actual* 宣告，來表達通用程式碼對平台特定部分的相依性。一個 *expected* 宣告指定了一個 API（類別、介面、註解、頂層宣告等）。一個 *actual* 宣告則是該 API 的平台相關實作，或者是指向外部程式庫中既有實作的型別別名。範例如下：

在通用程式碼中：

```kotlin
// expected 平台特定 API：
expect fun hello(world: String): String

fun greet() {
    // 使用 expected API：
    val greeting = hello("multiplatform world")
    println(greeting)
}

expect class URL(spec: String) {
    open fun getHost(): String
    open fun getPath(): String
}
```

在 JVM 平台程式碼中：

```kotlin
actual fun hello(world: String): String =
    "Hello, $world, on the JVM platform!"

// 使用既有的平台特定實作：
actual typealias URL = java.net.URL
```

詳情及建置多平台專案的步驟，請參閱[多平台程式設計文件](https://kotlinlang.org/docs/multiplatform/get-started.html)。

## 其他語言特性 {id="other-language-features"}

### 註解中的陣列常值 {id="array-literals-in-annotations"}

從 Kotlin 1.2 開始，註解的陣列引數可以使用新的陣列常值語法來傳遞，而不必使用 `arrayOf` 函式：

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

陣列常值語法僅限用於註解引數。

### Lateinit 頂層屬性和區域變數 {id="lateinit-top-level-properties-and-local-variables"}

`lateinit` 修飾詞現在可以用於頂層屬性和區域變數。後者可以用在例如：當一個作為建構函式引數傳遞給某物件的 lambda 參照到另一個必須稍後定義的物件時：

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 三個節點的循環：
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 檢查 lateinit 變數是否已初始化 {id="check-whether-a-lateinit-var-is-initialized"}

你現在可以透過在屬性參照上使用 `isInitialized` 來檢查 `lateinit` 變數是否已初始化：

```kotlin
class Foo {
    lateinit var lateinitVar: String

    fun initializationLogic() {
//sampleStart
        println("isInitialized before assignment: " + this::lateinitVar.isInitialized)
        lateinitVar = "value"
        println("isInitialized after assignment: " + this::lateinitVar.isInitialized)
//sampleEnd
    }
}

fun main(args: Array<String>) {
	Foo().initializationLogic()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 具有預設功能參數的內嵌函式 {id="inline-functions-with-default-functional-parameters"}

內嵌函式現在允許為其內嵌的功能參數提供預設值：

```kotlin
//sampleStart
inline fun <E> Iterable<E>.strings(transform: (E) -> String = { it.toString() }) =
    map { transform(it) }

val defaultStrings = listOf(1, 2, 3).strings()
val customStrings = listOf(1, 2, 3).strings { "($it)" } 
//sampleEnd

fun main(args: Array<String>) {
    println("defaultStrings = $defaultStrings")
    println("customStrings = $customStrings")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 顯式轉換的資訊用於型別推論 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin 編譯器現在可以在型別推論中使用型別轉換的資訊。如果你呼叫一個回傳型別參數 `T` 的泛型方法，並將回傳值轉換為特定型別 `Foo`，編譯器現在會理解該次呼叫的 `T` 需要繫結至型別 `Foo`。

這對 Android 開發人員尤為重要，因為編譯器現在可以正確分析 Android API level 26 中的泛型 `findViewById` 呼叫：

```kotlin
val button = findViewById(R.id.button) as Button
```

### 智慧轉換改進 {id="smart-cast-improvements"}

當一個變數是從安全呼叫運算式指派並進行 null 檢查時，智慧轉換現在也會套用到安全呼叫的接收者上：

```kotlin
fun countFirst(s: Any): Int {
//sampleStart
    val firstChar = (s as? CharSequence)?.firstOrNull()
    if (firstChar != null)
    return s.count { it == firstChar } // s: Any 被智慧轉換為 CharSequence

    val firstItem = (s as? Iterable<*>)?.firstOrNull()
    if (firstItem != null)
    return s.count { it == firstItem } // s: Any 被智慧轉換為 Iterable<*>
//sampleEnd
    return -1
}

fun main(args: Array<String>) {
  val string = "abacaba"
  val countInString = countFirst(string)
  println("called on \"$string\": $countInString")

  val list = listOf(1, 2, 3, 1, 2)
  val countInList = countFirst(list)
  println("called on $list: $countInList")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

此外，現在允許在 lambda 中對僅在 lambda 之前修改的區域變數進行智慧轉換：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val flag = args.size == 0
    var x: String? = null
    if (flag) x = "Yahoo!"

    run {
        if (x != null) {
            println(x.length) // x 被智慧轉換為 String
        }
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 支援將 ::foo 作為 this::foo 的簡寫 {id="support-for-foo-as-a-shorthand-for-this-foo"}

對 `this` 成員的繫結可呼叫參照現在可以不寫顯式接收者，寫成 `::foo` 而非 `this::foo`。這也使得在參照外部接收者成員的 lambda 中，使用可呼叫參照變得更加方便。

### 破壞性變更：try 區塊後更健全的智慧轉換 {id="breaking-change-sound-smart-casts-after-try-blocks"}

早先，Kotlin 會將 `try` 區塊內的指派用於區塊後的智慧轉換，這可能會破壞型別安全與 null 安全，並導致執行時期失敗。此版本修正了此問題，使智慧轉換更加嚴格，但也破壞了一些依賴此類智慧轉換的程式碼。

若要切換回舊的智慧轉換行為，請傳遞備援旗標 `-Xlegacy-smart-cast-after-try` 作為編譯器引數。此旗標將在 Kotlin 1.3 中被棄用。

### 棄用：資料類別覆寫 copy {id="deprecation-data-classes-overriding-copy"}

當一個資料類別衍生自一個已經具有相同簽章之 `copy` 函式的型別時，為該資料類別產生的 `copy` 實作會使用基底型別的預設值，導致不直觀的行為，或者如果基底型別中沒有預設參數，則會在執行時期失敗。

導致 `copy` 衝突的繼承在 Kotlin 1.2 中已變更為棄用並發出警告，並將在 Kotlin 1.3 中變更為錯誤。

### 棄用：列舉成員中的巢狀型別 {id="deprecation-nested-types-in-enum-entries"}

在列舉成員內部定義非 `inner class` 的巢狀型別由於初始化邏輯中的問題已被棄用。這在 Kotlin 1.2 中會引起警告，並將在 Kotlin 1.3 中變更為錯誤。

### 棄用：vararg 的單個具名引數 {id="deprecation-single-named-argument-for-vararg"}

為了與註解中的陣列常值保持一致，以具名形式為可變參數 (vararg) 參數傳遞單個項目（`foo(items = i)`）已被棄用。請配合使用展開運算子與相應的陣列工廠函式：

```kotlin
foo(items = *arrayOf(1))
```

在這種情況下有一項最佳化會移除多餘的陣列建立，從而防止效能下降。單個引數形式在 Kotlin 1.2 中會產生警告，並將在 Kotlin 1.3 中移除。

### 棄用：繼承 Throwable 的泛型類別之內部類別 {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

繼承自 `Throwable` 的泛型型別的內部類別可能會在 throw-catch 場景中違反型別安全，因此已被棄用，在 Kotlin 1.2 中發出警告，在 Kotlin 1.3 中變更為錯誤。

### 棄用：修改唯讀屬性的支援欄位 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

在自訂獲取方法 (getter) 中透過指派 `field = ...` 來修改唯讀屬性的支援欄位已被棄用，在 Kotlin 1.2 中發出警告，在 Kotlin 1.3 中變更為錯誤。

## 標準函式庫 {id="standard-library"}

### Kotlin 標準函式庫構件與拆分套件 {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 標準函式庫現在與 Java 9 模組系統完全相容，該系統禁止拆分套件（多個 jar 檔案在同一個套件中宣告類別）。為了支援這一點，引入了新的構件 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8`，用來取代舊的 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8`。

從 Kotlin 的角度來看，新構件中的宣告在相同的套件名稱下可見，但對於 Java 來說具有不同的套件名稱。因此，切換到新構件不需要對你的原始碼進行任何更改。

另一個為確保與新模組系統相容而做的更改，是從 `kotlin-reflect` 程式庫中移除了 `kotlin.reflect` 套件中已棄用的宣告。如果你之前正在使用它們，則需要切換到使用 `kotlin.reflect.full` 套件中的宣告，該套件從 Kotlin 1.1 起就已支援。

### windowed、chunked、zipWithNext {id="windowed-chunked-zipwithnext"}

用於 `Iterable<T>`、`Sequence<T>` 和 `CharSequence` 的新擴充功能涵蓋了諸如緩衝或批次處理 (`chunked`)、滑動視窗和計算滑動平均 (`windowed`)，以及處理後續項目對 (`zipWithNext`) 等使用案例：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..9).map { it * it }

    val chunkedIntoLists = items.chunked(4)
    val points3d = items.chunked(3) { (x, y, z) -> Triple(x, y, z) }
    val windowed = items.windowed(4)
    val slidingAverage = items.windowed(4) { it.average() }
    val pairwiseDifferences = items.zipWithNext { a, b -> b - a }
//sampleEnd

    println("items: $items\n")

    println("chunked into lists: $chunkedIntoLists")
    println("3D points: $points3d")
    println("windowed by 4: $windowed")
    println("sliding average by 4: $slidingAverage")
    println("pairwise differences: $pairwiseDifferences")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### fill、replaceAll、shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

為操作列表添加了一組擴充函式：用於 `MutableList` 的 `fill`、`replaceAll` 和 `shuffle`，以及用於唯讀 `List` 的 `shuffled`：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..5).toMutableList()
    
    items.shuffle()
    println("Shuffled items: $items")
    
    items.replaceAll { it * 2 }
    println("Items doubled: $items")
    
    items.fill(5)
    println("Items filled with 5: $items")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### kotlin-stdlib 中的數學運算 {id="math-operations-in-kotlin-stdlib"}

為了滿足長期以來的需求，Kotlin 1.2 加入了用於數學運算的 `kotlin.math` API，該 API 在 JVM 和 JS 中是通用的，包含以下內容：

* 常數：`PI` 和 `E`
* 三角函式：`cos`、`sin`、`tan` 及其反函式：`acos`、`asin`、`atan`、`atan2`
* 雙曲函式：`cosh`、`sinh`、`tanh` 及其反函式：`acosh`、`asinh`、`atanh`
* 指數運算：`pow`（擴充函式）、`sqrt`、`hypot`、`exp`、`expm1`
* 對數：`log`、`log2`、`log10`、`ln`、`ln1p`
* 捨入：
    * `ceil`、`floor`、`truncate`、`round`（四捨六入五取偶）函式
    * `roundToInt`、`roundToLong`（四捨五入）擴充函式
* 符號與絕對值：
    * `abs` 和 `sign` 函式
    * `absoluteValue` 和 `sign` 擴充屬性
    * `withSign` 擴充函式
* 兩個值的 `max` 和 `min`
* 二進位表示：
    * `ulp` 擴充屬性
    * `nextUp`、`nextDown`、`nextTowards` 擴充函式
    * `toBits`、`toRawBits`、`Double.fromBits`（這些位於 `kotlin` 套件中）

同樣的一組函式（但不含常數）也可用於 `Float` 引數。

### BigInteger 和 BigDecimal 的運算子與轉換 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2 引入了一組用於操作 `BigInteger` 和 `BigDecimal` 以及從其他數值型別建立它們的函式。這些包括：

* 用於 `Int` 和 `Long` 的 `toBigInteger`
* 用於 `Int`、`Long`、`Float`、`Double` 和 `BigInteger` 的 `toBigDecimal`
* 算術與按位運算子函式：
    * 二元運算子 `+`、`-`、`*`、`/`、`%` 以及中綴函式 `and`、`or`、`xor`、`shl`、`shr`
    * 一元運算子 `-`、`++`、`--`，以及函式 `inv`

### 浮點數到位元的轉換 {id="floating-point-to-bits-conversions"}

新增了用於將 `Double` 和 `Float` 與其位元表示互相轉換的函式：

* `toBits` 和 `toRawBits` 對 `Double` 回傳 `Long`，對 `Float` 回傳 `Int`
* `Double.fromBits` 和 `Float.fromBits` 用於從位元表示建立浮點數

### Regex 現在是可序列化的 {id="regex-is-now-serializable"}

`kotlin.text.Regex` 類別已變更為 `Serializable`，現在可以用於可序列化的階層結構中。

### Closeable.use 會在可用時呼叫 Throwable.addSuppressed {id="closeable-use-calls-throwable-addsuppressed-if-available"}

當在關閉資源期間於其他例外之後拋出例外時，`Closeable.use` 函式現在會呼叫 `Throwable.addSuppressed`。

要啟用此行為，你需要在相依性中包含 `kotlin-stdlib-jdk7`。

## JVM 後端 {id="jvm-backend"}

### 建構函式呼叫標準化 {id="constructor-calls-normalization"}

自 1.0 版本以來，Kotlin 就支援具有複雜控制流的運算式，例如 try-catch 運算式和內嵌函式呼叫。根據 Java 虛擬機規範，此類程式碼是有效的。不幸的是，當此類運算式出現在建構函式呼叫的引數中時，某些位元組碼處理工具無法很好地處理此類程式碼。

為了減輕此類位元組碼處理工具使用者的問題，我們新增了一個命令列編譯器選項（`-Xnormalize-constructor-calls=MODE`），告訴編譯器為此類結構產生更像 Java 的位元組碼。這裡的 `MODE` 是以下之一：

* `disable`（預設）– 以與 Kotlin 1.0 和 1.1 相同的方式產生位元組碼。
* `enable` – 為建構函式呼叫產生類 Java 的位元組碼。這可能會改變類別載入和初始化的順序。
* `preserve-class-initialization` – 為建構函式呼叫產生類 Java 的位元組碼，確保保留類別初始化順序。這可能會影響應用程式的整體效能；僅在你有多個類別之間共用且在類別初始化時更新的複雜狀態時才使用它。

「手動」的解決方法是將具有控制流的子運算式的值儲存在變數中，而不是直接在呼叫引數中對其進行求值。這類似於 `-Xnormalize-constructor-calls=enable`。

### Java 預設方法呼叫 {id="java-default-method-calls"}

在 Kotlin 1.2 之前，介面成員在針對 JVM 1.6 時覆寫 Java 預設方法，會在 super 呼叫中產生警告：`Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'`。在 Kotlin 1.2 中，這改為一個**錯誤**，因此要求任何此類程式碼都必須以 JVM target 1.8 編譯。

### 破壞性變更：平台型別 x.equals(null) 的一致行為 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

在映射到 Java 基本型別（`Int!`、`Boolean!`、`Short!`、`Long!`、`Float!`、`Double!`、`Char!`）的平台型別上呼叫 `x.equals(null)` 時，當 `x` 為 null 時會錯誤地回傳 `true`。從 Kotlin 1.2 開始，在平台型別的 null 值上呼叫 `x.equals(...)` 會**拋出 NPE**（但 `x == ...` 則不會）。

要回到 1.2 之前的行為，請將旗標 `-Xno-exception-on-explicit-equals-for-boxed-null` 傳遞給編譯器。

### 破壞性變更：修正平台 null 透過內嵌擴充接收者逃逸的問題 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

在平台型別的 null 值上呼叫的內嵌擴充函式不會檢查接收者是否為 null，因此會允許 null 逃逸到其他程式碼中。Kotlin 1.2 在呼叫點強制執行此檢查，如果接收者為 null 則拋出例外。

若要切換到舊的行為，請將備援旗標 `-Xno-receiver-assertions` 傳遞給編譯器。

## JavaScript 後端 {id="javascript-backend"}

### 預設啟用 TypedArrays 支援 {id="typedarrays-support-enabled-by-default"}

將 Kotlin 原始陣列（如 `IntArray`、`DoubleArray`）轉換為 [JavaScript 有型別陣列 (typed arrays)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) 的 JS 有型別陣列支援，先前是一項可選擇加入的功能，現在已預設啟用。

## 工具 {id="tools"}

### 警告視同錯誤 {id="warnings-as-errors"}

編譯器現在提供了一個選項，將所有警告視為錯誤。在命令列上使用 `-Werror`，或使用以下 Gradle 片段：

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```
