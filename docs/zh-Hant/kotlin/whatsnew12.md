[//]: # (title: Kotlin 1.2 的新功能)

<web-summary>閱讀 Kotlin 1.2 版本資訊，內容涵蓋新的語言特性、Kotlin 多平台、JVM 與 JS 的更新，以及對 Gradle 和 Maven 的建置工具支援。</web-summary>

_發布日期：2017 年 11 月 28 日_

## 目錄 {id="table-of-contents"}

* [多平台專案](#multiplatform-projects-experimental)
* [其他語言特性](#other-language-features)
* [標準程式庫](#standard-library)
* [JVM 後端](#jvm-backend)
* [JavaScript 後端](#javascript-backend)

> 有關 Kotlin 發布週期的資訊，請參閱 [Kotlin 發布流程](releases.md)。
>
{style="tip"}

## 多平台專案（實驗功能） {id="multiplatform-projects-experimental"}

多平台專案是 Kotlin 1.2 中的一項全新**實驗功能**，可讓你在 Kotlin 支援的目標平台（JVM、JavaScript，以及未來的 Native）之間重複使用程式碼。在多平台專案中，共有三種模組：

* *通用 (common)* 模組包含不特定於任何平台的程式碼，以及不含實作的平台相依 API 宣告。
* *平台 (platform)* 模組包含針對特定平台實作通用模組中平台相依宣告的程式碼，以及其他平台相依程式碼。
* 一般模組以特定平台為目標，既可以作為平台模組的相依項，也可以依賴平台模組。

當你為特定平台編譯多平台專案時，將會同時產生通用部分與平台特定部分的程式碼。

多平台專案支援的一個關鍵特性，是能夠透過 *expected* 與 *actual* 宣告來表達通用程式碼對平台特定部分的相依性。*expected* 宣告指定了 API（類別、介面、註解、最上層宣告等）。*actual* 宣告則是該 API 的平台相依實作，或是參照外部程式庫中該 API 現有實作的型別別名。範例如下：

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

// 使用現有的平台特定實作：
actual typealias URL = java.net.URL
```

有關建置多平台專案的詳細資訊與步驟，請參閱[多平台程式設計文件](https://kotlinlang.org/docs/multiplatform/get-started.html)。

## 其他語言特性 {id="other-language-features"}

### 註解中的陣列常值 {id="array-literals-in-annotations"}

從 Kotlin 1.2 開始，註解的陣列引數可以使用新的陣列常值語法傳遞，而無需使用 `arrayOf` 函式：

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

陣列常值語法僅限於註解引數中使用。

### lateinit 最上層屬性與區域變數 {id="lateinit-top-level-properties-and-local-variables"}

`lateinit` 修飾詞現在可用於最上層屬性和區域變數。例如，當傳遞給某物件作為建構函式引數的 Lambda 參照了另一個必須在稍後定義的物件時，就可以使用後者：

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
{kotlin-runnable="true"}

### 檢查 lateinit var 是否已初始化 {id="check-whether-a-lateinit-var-is-initialized"}

你現在可以透過屬性參照上的 `isInitialized` 來檢查 lateinit var 是否已初始化：

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
{kotlin-runnable="true"}

### 具有預設函式參數的內嵌函式 {id="inline-functions-with-default-functional-parameters"}

內嵌函式現在允許為其內嵌的函式參數設定預設值：

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
{kotlin-runnable="true"}

### 來自明確轉換的資訊可用於型別推論 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin 編譯器現在可以在型別推論中使用來自型別轉換的資訊。如果你呼叫傳回型別參數 `T` 的泛型方法，並將傳回值轉換為特定型別 `Foo`，編譯器現在會理解該次呼叫的 `T` 需要繫結到型別 `Foo`。

這對 Android 開發人員尤為重要，因為編譯器現在可以正確分析 Android API level 26 中的泛型 `findViewById` 呼叫：

```kotlin
val button = findViewById(R.id.button) as Button
```

### 智慧轉換改進 {id="smart-cast-improvements"}

當變數由安全呼叫運算式指派並進行 null 檢查時，智慧轉換現在也會套用至安全呼叫的接收者：

```kotlin
fun countFirst(s: Any): Int {
//sampleStart
    val firstChar = (s as? CharSequence)?.firstOrNull()
    if (firstChar != null)
    return s.count { it == firstChar } // s: Any 智慧轉換為 CharSequence

    val firstItem = (s as? Iterable<*>)?.firstOrNull()
    if (firstItem != null)
    return s.count { it == firstItem } // s: Any 智慧轉換為 Iterable<*>
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
{kotlin-runnable="true"}

此外，在 Lambda 內，現在允許對僅在 Lambda 之前被修改的區域變數進行智慧轉換：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val flag = args.size == 0
    var x: String? = null
    if (flag) x = "Yahoo!"

    run {
        if (x != null) {
            println(x.length) // x 智慧轉換為 String
        }
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### 支援使用 ::foo 作為 this::foo 的簡寫 {id="support-for-foo-as-a-shorthand-for-this-foo"}

繫結到 `this` 成員的可呼叫參照現在可以不寫出明確的接收者，使用 `::foo` 取代 `this::foo`。這也使得可呼叫參照在參照外層接收者成員的 Lambda 中更加方便使用。

### 破壞性變更：try 區塊後更健全的智慧轉換 {id="breaking-change-sound-smart-casts-after-try-blocks"}

以往，Kotlin 會使用在 `try` 區塊內部進行的指派來推導該區塊之後的智慧轉換，這可能會破壞型別安全與 null 安全，並導致執行期失敗。此版本修復了這個問題，使智慧轉換更加嚴格，但這會破壞某些依賴此類智慧轉換的程式碼。

若要切換回舊的智慧轉換行為，請傳入備援旗標 `-Xlegacy-smart-cast-after-try` 作為編譯器引數。該旗標將在 Kotlin 1.3 中被棄用。

### 棄用：資料類別覆寫 copy {id="deprecation-data-classes-overriding-copy"}

當資料類別衍生自一個已包含相同簽章之 `copy` 函式的型別時，為該資料類別產生的 `copy` 實作會使用來自超型別的預設值，從而導致違反直覺的行為；或者在超型別中沒有預設參數時於執行期發生失敗。

導致 `copy` 衝突的繼承在 Kotlin 1.2 中已遭棄用並會產生警告，且在 Kotlin 1.3 中將成為錯誤。

### 棄用：列舉項目中的巢狀型別 {id="deprecation-nested-types-in-enum-entries"}

在列舉項目內部定義非 `inner class` 的巢狀型別，由於初始設定邏輯中的問題已被棄用。這在 Kotlin 1.2 中會產生警告，並在 Kotlin 1.3 中成為錯誤。

### 棄用：vararg 的單一具名引數 {id="deprecation-single-named-argument-for-vararg"}

為了與註解中的陣列常值保持一致，傳遞單一項目給具名形式的 vararg 參數（`foo(items = i)`）已被棄用。請使用展開運算子搭配對應的陣列工廠函式：

```kotlin
foo(items = *arrayOf(1))
```

在這種情況下有一項最佳化措施可以移除多餘的陣列建立，從而避免效能下降。單一引數的形式在 Kotlin 1.2 中會產生警告，並預計在 Kotlin 1.3 中移除。

### 棄用：繼承 Throwable 的泛型類別內部類別 {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

繼承自 `Throwable` 的泛型型別內部類別可能會在 throw-catch 場景中破壞型別安全性，因此已被棄用；在 Kotlin 1.2 中會產生警告，在 Kotlin 1.3 中將成為錯誤。

### 棄用：修改唯讀屬性的支援欄位 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

在自訂 getter 中透過指定 `field = ...` 來修改唯讀屬性的支援欄位已被棄用；在 Kotlin 1.2 中會產生警告，在 Kotlin 1.3 中將成為錯誤。

## 標準程式庫 {id="standard-library"}

### Kotlin 標準程式庫構件與分割套件 {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 標準程式庫現在完全相容於 Java 9 模組系統，該系統禁止分割套件（多個 JAR 檔在同一個套件中宣告類別）。為了支援此特性，引入了新的構件 `kotlin-stdlib-jdk7` 與 `kotlin-stdlib-jdk8`，用以取代舊的 `kotlin-stdlib-jre7` 與 `kotlin-stdlib-jre8`。

從 Kotlin 的角度來看，新構件中的宣告在相同的套件名稱下可見，但對 Java 而言具有不同的套件名稱。因此，切換到新構件不需要對原始碼進行任何修改。

為確保與新模組系統相容而進行的另一項變更，是從 `kotlin-reflect` 程式庫中移除了 `kotlin.reflect` 套件中已棄用的宣告。如果你曾使用過它們，則需要改為使用 `kotlin.reflect.full` 套件中的宣告，該套件自 Kotlin 1.1 起開始受支援。

### windowed、chunked、zipWithNext {id="windowed-chunked-zipwithnext"}

針對 `Iterable<T>`、`Sequence<T>` 與 `CharSequence` 的新擴充函式涵蓋了諸如緩衝或批次處理（`chunked`）、滑動視窗與計算滑動平均值（`windowed`），以及處理相鄰項目對（`zipWithNext`）等使用案例：

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
{kotlin-runnable="true"}

### fill、replaceAll、shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

為操作清單新增了一組擴充函式：用於 `MutableList` 的 `fill`、`replaceAll` 和 `shuffle`，以及用於唯讀 `List` 的 `shuffled`：

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
{kotlin-runnable="true"}

### kotlin-stdlib 中的數學運算 {id="math-operations-in-kotlin-stdlib"}

為了滿足長期以來的需求，Kotlin 1.2 新增了在 JVM 與 JS 通用的數學運算 API `kotlin.math`，其中包含以下內容：

* 常數：`PI` 與 `E`
* 三角函式：`cos`、`sin`、`tan` 及其反函式：`acos`、`asin`、`atan`、`atan2`
* 雙曲函式：`cosh`、`sinh`、`tanh` 及其反函式：`acosh`、`asinh`、`atanh`
* 指數與冪運算：`pow`（擴充函式）、`sqrt`、`hypot`、`exp`、`expm1`
* 對數：`log`、`log2`、`log10`、`ln`、`ln1p`
* 捨入：
    * `ceil`、`floor`、`truncate`、`round`（四捨六入五成雙 / half to even）函式
    * `roundToInt`、`roundToLong`（捨入至整數）擴充函式
* 符號與絕對值：
    * `abs` 與 `sign` 函式
    * `absoluteValue` 與 `sign` 擴充屬性
    * `withSign` 擴充函式
* 兩數的 `max` 與 `min`
* 二進位表示法：
    * `ulp` 擴充屬性
    * `nextUp`、`nextDown`、`nextTowards` 擴充函式
    * `toBits`、`toRawBits`、`Double.fromBits`（這些位於 `kotlin` 套件中）

相同的函式集（但不包含常數）也適用於 `Float` 引數。

### BigInteger 與 BigDecimal 的運算子和轉換 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2 引入了一組用於操作 `BigInteger` 與 `BigDecimal` 以及從其他數值型別建立它們的函式。包括：

* 用於 `Int` 與 `Long` 的 `toBigInteger`
* 用於 `Int`、`Long`、`Float`、`Double` 與 `BigInteger` 的 `toBigDecimal`
* 算術與位元運算子函式：
    * 二元運算子 `+`、`-`、`*`、`/`、`%` 以及中綴函式 `and`、`or`、`xor`、`shl`、`shr`
    * 一元運算子 `-`、`++`、`--`，以及函式 `inv`

### 浮點數轉換為位元表示法 {id="floating-point-to-bits-conversions"}

新增了用於將 `Double` 與 `Float` 與其位元表示法相互轉換的函式：

* `toBits` 與 `toRawBits`：對 `Double` 傳回 `Long`，對 `Float` 傳回 `Int`
* `Double.fromBits` 與 `Float.fromBits`：用於從位元表示法建立浮點數

### Regex 現在可序列化 {id="regex-is-now-serializable"}

`kotlin.text.Regex` 類別現已實作 `Serializable`，可用於可序列化的階層結構中。

### Closeable.use 在可用時會呼叫 Throwable.addSuppressed {id="closeable-use-calls-throwable-addsuppressed-if-available"}

當在發生其他例外之後關閉資源期間擲出例外時，`Closeable.use` 函式會呼叫 `Throwable.addSuppressed`。

若要啟用此行為，你需要在相依性中引入 `kotlin-stdlib-jdk7`。

## JVM 後端 {id="jvm-backend"}

### 建構函式呼叫正規化 {id="constructor-calls-normalization"}

自 1.0 版以來，Kotlin 就支援具有複雜控制流程的運算式，例如 try-catch 運算式與內嵌函式呼叫。根據 Java 虛擬機規格，此類程式碼是合法的。遺憾的是，當此類運算式出現在建構函式呼叫的引數中時，某些位元組碼處理工具無法妥善處理這類程式碼。

為了減輕使用此類位元組碼處理工具的使用者所面臨的問題，我們新增了一個命令列編譯器選項（`-Xnormalize-constructor-calls=MODE`），指示編譯器針對此類建構產生更接近 Java 風格的位元組碼。此處的 `MODE` 可為以下之一：

* `disable`（預設值）– 以與 Kotlin 1.0 和 1.1 相同的方式產生位元組碼。
* `enable` – 為建構函式呼叫產生 Java 風格的位元組碼。這可能會改變類別載入與初始化的順序。
* `preserve-class-initialization` – 為建構函式呼叫產生 Java 風格的位元組碼，確保保留類別初始化順序。這可能會影響應用程式的整體效能；僅當你有多個類別共用並在類別初始化時更新的複雜狀態時，才建議使用此選項。

「手動」替代方案是將具有控制流程的子運算式的值存放在變數中，而不是直接在呼叫引數內對其進行求值。這類似於 `-Xnormalize-constructor-calls=enable`。

### Java 預設方法呼叫 {id="java-default-method-calls"}

在 Kotlin 1.2 之前，針對 JVM 1.6 目標覆寫 Java 預設方法的介面成員在進行 super 呼叫時會產生警告：`Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'`。在 Kotlin 1.2 中，這將改為擲出**錯誤**，從而要求所有此類程式碼必須以 JVM 目標 1.8 進行編譯。

### 破壞性變更：平台型別 x.equals(null) 的一致行為 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

在對應到 Java 原生型別（`Int!`、`Boolean!`、`Short!`、`Long!`、`Float!`、`Double!`、`Char!`）的平台型別上呼叫 `x.equals(null)` 時，若 `x` 為 null，過去曾錯誤地傳回 `true`。從 Kotlin 1.2 開始，在平台型別的 null 值上呼叫 `x.equals(...)` **會擲出 NPE**（但 `x == ...` 則不會）。

若要回復至 1.2 之前的行為，請向編譯器傳入旗標 `-Xno-exception-on-explicit-equals-for-boxed-null`。

### 破壞性變更：修復平台 null 透過內嵌擴充接收者外洩的問題 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

在平台型別的 null 值上呼叫內嵌擴充函式時，先前並未檢查接收者是否為 null，因而會導致 null 外洩至其他程式碼中。Kotlin 1.2 在呼叫點強制執行此項檢查，若接收者為 null 則會擲出例外。

若要切換至舊行為，請向編譯器傳入備援旗標 `-Xno-receiver-assertions`。

## JavaScript 後端 {id="javascript-backend"}

### 預設啟用 TypedArrays 支援 {id="typedarrays-support-enabled-by-default"}

將 Kotlin 原生陣列（例如 `IntArray`、`DoubleArray`）轉換為 [JavaScript 型別化陣列 (TypedArrays)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) 的 JS 型別化陣列支援，先前為選擇性加入 (opt-in) 功能，現在已預設啟用。

## 工具 {id="tools"}

### 將警告視為錯誤 {id="warnings-as-errors"}

編譯器現在提供了一個將所有警告視為錯誤的選項。在命令列中使用 `-Werror`，或使用以下 Gradle 程式碼片段：

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```