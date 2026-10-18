[//]: # (title: Kotlin 1.1 的新功能)

<web-summary>閱讀 Kotlin 1.1 發行說明，內容涵蓋新語言特性、Kotlin/JVM 與 JS 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_發布日期：2016 年 2 月 15 日_

## 目錄 {id="table-of-contents"}

* [協同程式](#coroutines-experimental)
* [其他語言特性](#other-language-features)
* [標準函式庫](#standard-library)
* [JVM 後端](#jvm-backend)
* [JavaScript 後端](#javascript-backend)

> 有關 Kotlin 發行週期的詳細資訊，請參閱 [Kotlin 發行流程](releases.md)。
>
{style="tip"}

## JavaScript {id="javascript"}

從 Kotlin 1.1 開始，JavaScript 目標平台不再被視為實驗性質。支援所有語言特性，並提供許多用於與前端開發環境整合的新工具。請參閱[下方](#javascript-backend)以取得更詳細的變更清單。

## 協同程式 (實驗功能) {id="coroutines-experimental"}

Kotlin 1.1 的關鍵新功能是*協同程式* (coroutines)，帶來了對 `async`/`await`、`yield` 及類似編程模式的支援。Kotlin 設計的核心特點在於協同程式執行的實作是程式庫的一部分，而非語言本身，因此你不會受限於任何特定的編程典範或並行程式庫。

協同程式實質上是一種輕量級執行緒，可以被暫停並於稍後恢復。協同程式是透過 _[掛起函式 (suspending functions)](coroutines-basics.md)_ 支援的：呼叫此類函式可能會暫停協同程式，而要啟動新的協同程式，我們通常會使用匿名掛起函式（即掛起 Lambda）。

讓我們來看看實作在外部程式庫 [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) 中的 `async`/`await`：

```kotlin
// 在背景執行緒池中執行程式碼
fun asyncOverlay() = async(CommonPool) {
    // 啟動兩個非同步操作
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // 然後將疊加層套用至兩個結果
    applyOverlay(original.await(), overlay.await())
}

// 在 UI 上下文中啟動新的協同程式
launch(UI) {
    // 等待非同步疊加操作完成
    val image = asyncOverlay().await()
    // 然後在 UI 中顯示
    showImage(image)
}
```

在此，`async { ... }` 會啟動一個協同程式；當我們使用 `await()` 時，協同程式的執行會被暫停，同時執行被等待的操作，並在被等待的操作完成時恢復（可能會在不同的執行緒上）。

標準函式庫使用協同程式透過 `yield` 和 `yieldAll` 函式來支援*延遲產生的序列* (lazily generated sequences)。在此類序列中，傳回序列元素的程式碼區塊會在擷取每個元素後暫停，並在請求下一個元素時恢復。以下是一個範例：

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // 產出 i 的平方
          yield(i * i)
      }
      // 產出一個範圍
      yieldAll(26..28)
    }

    // 印出序列
    println(seq.toList())
}
```

執行上述程式碼以查看結果。你可以隨意編輯並再次執行！

如需更多資訊，請參閱[協同程式文件](coroutines-overview.md)與[教學](coroutines-and-channels.md)。

請注意，協同程式目前被視為一項**實驗功能**，這意味著 Kotlin 團隊不承諾在 1.1 正式發布後保證此功能的向下相容性。

## 其他語言特性 {id="other-language-features"}

### 型別別名 {id="type-aliases"}

型別別名允許你為現有型別定義替代名稱。這對於泛型型別（例如集合）以及函式型別最為有用。以下是一個範例：

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 請注意，型別名稱（原始名稱與型別別名）是可互換的：
fun checkLaLaLandIsTheBestMovie(oscarWinners: Map<String, String>) =
        oscarWinners["Best picture"] == "La La Land"
//sampleEnd

fun oscarWinners(): OscarWinners {
    return mapOf(
            "Best song" to "City of Stars (La La Land)",
            "Best actress" to "Emma Stone (La La Land)",
            "Best picture" to "Moonlight" /* ... */)
}

fun main(args: Array<String>) {
    val oscarWinners = oscarWinners()

    val laLaLandAwards = countLaLaLand(oscarWinners)
    println("LaLaLandAwards = $laLaLandAwards (in our small example), but actually it's 6.")

    val laLaLandIsTheBestMovie = checkLaLaLandIsTheBestMovie(oscarWinners)
    println("LaLaLandIsTheBestMovie = $laLaLandIsTheBestMovie")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如需更多詳細資訊，請參閱[型別別名文件](type-aliases.md)與 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md)。

### 繫結的可呼叫參照 {id="bound-callable-references"}

現在可以使用 `::` 運算子取得指向特定物件執行個體之方法或屬性的[成員參照](lambdas.md#function-references)。在過去，這只能使用 Lambda 來表示。以下是一個範例：

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如需更多詳細資訊，請參閱[文件](reflection.md)與 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md)。

### 密封類別與資料類別 {id="sealed-and-data-classes"}

Kotlin 1.1 移除了 Kotlin 1.0 中對密封類別 (sealed class) 和資料類別 (data class) 的一些限制。現在你可以在同一個檔案的最頂層定義頂層密封類別的子類別，而不僅限於作為該密封類別的巢狀類別。資料類別現在也可以繼承其他類別。這可以用來簡潔優雅地定義運算式類別的階層結構：

```kotlin
//sampleStart
sealed class Expr

data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()

fun eval(expr: Expr): Double = when (expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
}
val e = eval(Sum(Const(1.0), Const(2.0)))
//sampleEnd

fun main(args: Array<String>) {
    println("e is $e") // 3.0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如需更多詳細資訊，請閱讀[密封類別文件](sealed-classes.md)，或參閱 [sealed class](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md) 與 [data class](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md) 的 KEEP。

### Lambda 中的解構 {id="destructuring-in-lambdas"}

現在可以使用[解構宣告](destructuring-declarations.md)語法來解包傳遞給 Lambda 的引數。以下是一個範例：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 以前
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 現在
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

請參閱[解構宣告文件](destructuring-declarations.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md) 以取得更多詳細資訊。

### 未使用參數的底線 {id="underscores-for-unused-parameters"}

對於具有多個參數的 Lambda，可以使用 `_` 字元來取代未使用的參數名稱：

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

這在[解構宣告](destructuring-declarations.md)中也同樣適用：

```kotlin
data class Result(val value: Any, val status: String)

fun getResult() = Result(42, "ok").also { println("getResult() returns $it") }

fun main(args: Array<String>) {
//sampleStart
    val (_, status) = getResult()
//sampleEnd
    println("status is '$status'")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如需更多詳細資訊，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md)。

### 數值常值中的底線 {id="underscores-in-numeric-literals"}

就像 Java 8 一樣，Kotlin 現在允許在數值常值中使用底線來分隔數字分組：

```kotlin
//sampleStart
val oneMillion = 1_000_000
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010010
//sampleEnd

fun main(args: Array<String>) {
    println(oneMillion)
    println(hexBytes.toString(16))
    println(bytes.toString(2))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如需更多詳細資訊，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md)。

### 更簡短的屬性語法 {id="shorter-syntax-for-properties"}

對於 getter 定義為運算式主體的屬性，現在可以省略屬性型別：

```kotlin
//sampleStart
    data class Person(val name: String, val age: Int) {
    val isAdult get() = age >= 20 // 屬性型別推論為 'Boolean'
}
//sampleEnd
fun main(args: Array<String>) {
    val akari = Person("Akari", 26)
    println("$akari.isAdult = ${akari.isAdult}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 內嵌屬性存取子 {id="inline-property-accessors"}

如果屬性沒有支援欄位 (backing field)，現在可以使用 `inline` 修飾詞來標記屬性存取子。此類存取子的編譯方式與[內嵌函式](inline-functions.md)相同。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // getter 將會被內聯
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你也可以將整個屬性標記為 `inline`，這樣修飾詞會同時套用至兩個存取子。

如需更多詳細資訊，請參閱[內嵌函式文件](inline-functions.md#inline-properties)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md)。

### 區域委託屬性 {id="local-delegated-properties"}

現在可以在區域變數上使用[委託屬性](delegated-properties.md)語法。一個可能的用途是定義延遲求值的區域變數：

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // 傳回隨機值
        println("The answer is $answer.")   // 在此時計算 answer
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如需更多詳細資訊，請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md)。

### 攔截委託屬性繫結 {id="interception-of-delegated-property-binding"}

對於[委託屬性](delegated-properties.md)，現在可以使用 `provideDelegate` 運算子攔截委託到屬性的繫結過程。例如，如果我們想在繫結前檢查屬性名稱，可以這樣寫：

```kotlin
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(thisRef: MyUI, prop: KProperty<*>): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        ... // 屬性建立
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

class MyUI {
    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

在建立 `MyUI` 執行個體期間，每個屬性都會呼叫 `provideDelegate` 方法，並且它可以立即執行必要的驗證。

如需更多詳細資訊，請參閱[委託屬性文件](delegated-properties.md)。

### 泛型列舉值存取 {id="generic-enum-value-access"}

現在可以用泛型方式列舉列舉類別的值：

```kotlin
//sampleStart
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumValues<T>().joinToString { it.name })
}
//sampleEnd

fun main(args: Array<String>) {
    printAllValues<RGB>() // 印出 RED, GREEN, BLUE
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### DSL 中隱式接收者的作用域控制 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) 註解允許在 DSL 上下文中限制使用外層作用域的接收者。考慮經典的 [HTML 建構器範例](type-safe-builders.md)：

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

在 Kotlin 1.0 中，傳遞給 `td` 的 Lambda 程式碼可以存取三個隱式接收者：傳遞給 `table`、`tr` 以及 `td` 的接收者。這允許你呼叫在該上下文中沒有意義的方法——例如在 `td` 內部呼叫 `tr`，從而將 `<tr>` 標籤放在 `<td>` 內。

在 Kotlin 1.1 中，你可以對此進行限制，使得在傳遞給 `td` 的 Lambda 內，僅能使用定義在 `td` 隱式接收者上的方法。做法是定義帶有 `@DslMarker` 元註解的自訂註解，並將其套用至標籤類別的基底類別上。

如需更多詳細資訊，請參閱[型別安全建構器文件](type-safe-builders.md)與 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md)。

### rem 運算子 {id="rem-operator"}

`mod` 運算子現已棄用，改用 `rem`。相關動機請參閱[此問題](https://youtrack.jetbrains.com/issue/KT-14650)。

## 標準函式庫 {id="standard-library"}

### 字串轉換為數字 {id="string-to-number-conversions"}

String 類別新增了一系列擴充函式，可將其轉換為數字而不會在遇到無效數字時擲出例外：`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` 等。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

此外，整數轉換函式（例如 `Int.toString()`、`String.toInt()`、`String.toIntOrNull()`）都獲得了一個帶有 `radix` 參數的多載，允許指定轉換的進位制（2 到 36）。

### onEach() {id="oneach"}

`onEach` 是一個針對集合與序列的小巧但實用的擴充函式，它允許在操作鏈中對集合／序列的每個元素執行某些操作（可能帶有副作用）。在可迭代物件 (iterable) 上，其行為類似於 `forEach`，但還會將該可迭代物件執行個體進一步回傳。而在序列上，它會傳回一個包裝序列，該序列會在迭代元素時延遲套用給定的操作。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also()、takeIf() 和 takeUnless() {id="also-takeif-and-takeunless"}

這是適用於任何接收者的三個通用擴充函式。

`also` 類似於 `apply`：它接收接收者、對其執行某些操作，並傳回該接收者。差別在於，在 `apply` 內部的區塊中，接收者以 `this` 的形式提供；而在 `also` 內部的區塊中，則以 `it` 的形式提供（如果你願意，也可以為其指定其他名稱）。當你不想遮蔽來自外層作用域的 `this` 時，這會非常方便：

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// 改用 'apply'
fun Block.copy1() = Block().apply {
    this.content = this@copy1.content
}

fun main(args: Array<String>) {
    val block = Block().apply { content = "content" }
    val copy = block.copy()
    println("Testing the content was copied:")
    println(block.content == copy.content)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeIf` 就像是針對單一值的 `filter`。它會檢查接收者是否符合述詞；如果符合則傳回該接收者，否則傳回 `null`。結合 Elvis 運算子 (`?:`) 和提前傳回，可以編寫如下結構：

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 對現有的 outDirFile 執行某些操作
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 在找到關鍵字的情況下，對輸入字串中關鍵字的 index 執行某些操作
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeUnless` 與 `takeIf` 相同，但它採用相反的述詞。當它*不符合*述詞時傳回接收者，否則傳回 `null`。因此上述範例之一可以用 `takeUnless` 改寫如下：

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

當你使用可呼叫參照代替 Lambda 時，使用它也很方便：

```kotlin
private fun testTakeUnless(string: String) {
//sampleStart
    val result = string.takeUnless(String::isEmpty)
//sampleEnd

    println("string = \"$string\"; result = \"$result\"")
}

fun main(args: Array<String>) {
    testTakeUnless("")
    testTakeUnless("abc")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### groupingBy() {id="groupingby"}

此 API 可用於依索引鍵對集合進行分組，並同時折疊每個分組。例如，它可用於統計以每個字母開頭的單字數量：

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 使用 'groupBy' 和 'mapValues' 的另一種方式會建立一個中間 Map，
    // 而 'groupingBy' 方式則是即時計算。
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.toMap() 與 Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

這些函式可用於輕鬆複製 Map：

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

運算子 `plus` 提供了一種將索引鍵-值組新增至唯讀 Map 並產生新 Map 的方法，但過去沒有簡單的方法來執行相反的操作：要從 Map 中移除索引鍵，必須求助於不太直觀的方式，例如 `Map.filter()` 或 `Map.filterKeys()`。現在運算子 `minus` 填補了這一空白。提供了 4 個多載：用於移除單一索引鍵、索引鍵集合、索引鍵序列以及索引鍵陣列。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf("key" to 42)
    val emptyMap = map - "key"
//sampleEnd
    
    println("map: $map")
    println("emptyMap: $emptyMap")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### minOf() 與 maxOf() {id="minof-and-maxof"}

這些函式可用於尋找兩個或三個給定值中的最小值與最大值，其中這些值可以是基本數值或 `Comparable` 物件。如果想要比較本身不可比較的物件，每個函式也都有一個額外接受 `Comparator` 執行個體的多載。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val list1 = listOf("a", "b")
    val list2 = listOf("x", "y", "z")
    val minSize = minOf(list1.size, list2.size)
    val longestList = maxOf(list1, list2, compareBy { it.size })
//sampleEnd
    
    println("minSize = $minSize")
    println("longestList = $longestList")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 類似陣列的 List 具現化函式 {id="array-like-list-instantiation-functions"}

類似於 `Array` 建構函式，現在有一些函式可以建立 `List` 和 `MutableList` 執行個體，並透過呼叫 Lambda 來初始化每個元素：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val squares = List(10) { index -> index * index }
    val mutable = MutableList(10) { 0 }
//sampleEnd

    println("squares: $squares")
    println("mutable: $mutable")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.getValue() {id="map-getvalue"}

這個在 `Map` 上的擴充函式會傳回對應於給定索引鍵的現有值，或者擲出例外並指出找不到哪個索引鍵。如果該 Map 是使用 `withDefault` 產生的，此函式將傳回預設值而非擲出例外。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // 傳回非空 Int 值 42
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 傳回 4
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- 這將會擲出 NoSuchElementException
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 抽象集合 {id="abstract-collections"}

在實作 Kotlin 集合類別時，這些抽象類別可用作基底類別。實作唯讀集合有 `AbstractCollection`、`AbstractList`、`AbstractSet` 與 `AbstractMap`；而對於可變集合，則有 `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet` 和 `AbstractMutableMap`。在 JVM 上，這些抽象可變集合的大部分功能繼承自 JDK 的抽象集合。

### 陣列操作函式 {id="array-manipulation-functions"}

標準函式庫現在提供了一組用於對陣列進行逐元素操作的函式：比較（`contentEquals` 與 `contentDeepEquals`）、雜湊碼計算（`contentHashCode` 與 `contentDeepHashCode`），以及轉換為字串（`contentToString` 與 `contentDeepToString`）。它們同時在 JVM（充當 `java.util.Arrays` 中對應函式的別名）和 JS（實作由 Kotlin 標準函式庫提供）上受到支援。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 實作：型別與雜湊值的亂碼
    println(array.contentToString())  // 格式化為易讀的清單
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## JVM 後端 {id="jvm-backend"}

### Java 8 位元組碼支援 {id="java-8-bytecode-support"}

Kotlin 現在具備產生 Java 8 位元組碼的選項（`-jvm-target 1.8` 命令列選項或 Maven/Gradle 中的對應選項）。目前這不會改變位元組碼的語意（特別是介面中的預設方法和 Lambda 的產生方式與 Kotlin 1.0 完全相同），但我們計劃稍後進一步利用這一點。

### Java 8 標準函式庫支援 {id="java-8-standard-library-support"}

現在有獨立版本的標準函式庫，支援在 Java 7 和 8 中新增的 JDK API。如果你需要存取新 API，請使用 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8` Maven 構件，而不是標準的 `kotlin-stdlib`。這些構件是建置在 `kotlin-stdlib` 之上的微型擴充，並會將其作為傳遞相依性引入你的專案。

### 位元組碼中的參數名稱 {id="parameter-names-in-the-bytecode"}

Kotlin 現在支援在位元組碼中儲存參數名稱。可以使用 `-java-parameters` 命令列選項來啟用此功能。

### 常數內聯 {id="constant-inlining"}

編譯器現在會將 `const val` 屬性的值內聯到使用它們的位置。

### 可變閉包變數 {id="mutable-closure-variables"}

用於在 Lambda 中捕獲可變閉包變數的 Box 類別不再具有 volatile 欄位。這項變更提升了效能，但在某些罕見的使用情境中可能會導致新的資料競爭。如果你受到此影響，需要自行提供存取變數的同步處理。

### javax.script 支援 {id="javax-script-support"}

Kotlin 現在與 [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223) 整合。該 API 允許在執行階段對程式碼片段求值：

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 印出 5
```

請參閱[此處](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)以取得使用該 API 的較大範例專案。

### kotlin.reflect.full {id="kotlin-reflect-full"}

為了[準備支援 Java 9](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)，`kotlin-reflect.jar` 程式庫中的擴充函式和屬性已移至套件 `kotlin.reflect.full`。舊套件 (`kotlin.reflect`) 中的名稱已被棄用，並將在 Kotlin 1.2 中移除。請注意，核心反射介面（例如 `KClass`）是 Kotlin 標準函式庫的一部分，而非 `kotlin-reflect`，因此不受此變更影響。

## JavaScript 後端 {id="javascript-backend"}

### 統一的標準函式庫 {id="unified-standard-library"}

現在可以從編譯為 JavaScript 的程式碼中使用更大一部分的 Kotlin 標準函式庫。特別是，核心類別如集合（`ArrayList`、`HashMap` 等）、例外（`IllegalArgumentException` 等）以及其他一些類別（`StringBuilder`、`Comparator`）現在都定義在 `kotlin` 套件下。在 JVM 上，這些名稱是相應 JDK 類別的型別別名；而在 JS 上，這些類別則實作於 Kotlin 標準函式庫中。

### 更好的程式碼產生 {id="better-code-generation"}

JavaScript 後端現在會產生更多可靜態檢查的程式碼，這對 JS 程式碼處理工具（如壓縮工具、最佳化工具、Lint 工具等）更為友善。

### external 修飾詞 {id="the-external-modifier"}

如果你需要以型別安全的方式從 Kotlin 存取以 JavaScript 實作的類別，可以使用 `external` 修飾詞撰寫 Kotlin 宣告。（在 Kotlin 1.0 中，使用的是 `@native` 註解。）與 JVM 目標平台不同，JS 目標平台允許在類別和屬性上使用 external 修飾詞。例如，以下是如何宣告 DOM（文件物件模型）的 `Node` 類別：

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // 等等
}
```

### 改進的匯入處理 {id="improved-import-handling"}

現在可以更精確地描述應從 JavaScript 模組匯入的宣告。如果在外部宣告上新增 `@JsModule("<module-name>")` 註解，它將在編譯期間正確匯入到模組系統（CommonJS 或 AMD）。例如，在 CommonJS 中，該宣告將透過 `require(...)` 函式匯入。此外，如果你想將宣告匯入為模組或全域 JavaScript 物件，可以使用 `@JsNonModule` 註解。

例如，以下是如何將 JQuery 匯入到 Kotlin 模組中：

```kotlin
external interface JQuery {
    fun toggle(duration: Int = definedExternally): JQuery
    fun click(handler: (Event) -> Unit): JQuery
}

@JsModule("jquery")
@JsNonModule
@JsName("$")
external fun jquery(selector: String): JQuery
```

在此情況下，JQuery 將作為名為 `jquery` 的模組匯入。或者，它也可以作為一個 $-物件使用，具體取決於 Kotlin 編譯器設定使用的模組系統。

你可以在應用程式中這樣使用這些宣告：

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```