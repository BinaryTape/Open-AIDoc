[//]: # (title: Kotlin 1.1 的新功能)

<web-summary>閱讀 Kotlin 1.1 版本說明，內容涵蓋新的語言特性、Kotlin/JVM 與 JS 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_發佈日期：2016 年 2 月 15 日_

## 目錄 {id="table-of-contents"}

* [協同程式](#coroutines-experimental)
* [其他語言特性](#other-language-features)
* [標準函式庫](#standard-library)
* [JVM 後端](#jvm-backend)
* [JavaScript 後端](#javascript-backend)

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈程序](releases.md)。
>
{style="tip"}

## JavaScript {id="javascript"}

從 Kotlin 1.1 開始，JavaScript 目標不再被視為實驗性功能。所有語言特性均已支援，並且有許多與前端開發環境整合的新工具。請參閱[下方](#javascript-backend)以獲取更詳細的變更列表。

## 協同程式 (實驗性) {id="coroutines-experimental"}

Kotlin 1.1 的關鍵新功能是 *協同程式 (coroutines)*，它帶來了 `async`/`await`、`yield` 及類似程式設計模式的支援。Kotlin 設計的關鍵特點是協同程式執行的實作是函式庫的一部分，而非語言本身，因此你不會被綁定在任何特定的程式設計範式或並行函式庫。

協同程式實際上是一種可以被掛起並在稍後恢復的輕量級執行緒。協同程式透過 *暫停函式 (suspending functions)* 得到支援：呼叫此類函式可能會暫停協同程式，而要啟動新的協同程式，我們通常使用匿名暫停函式（即暫停 Lambda）。

讓我們看看在外部函式庫 [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) 中實作的 `async`/`await`：

```kotlin
// 在背景執行緒池中執行程式碼
fun asyncOverlay() = async(CommonPool) {
    // 啟動兩個非同步操作
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // 然後將疊加套用到兩個結果上
    applyOverlay(original.await(), overlay.await())
}

// 在 UI 上下文中啟動新的協同程式
launch(UI) {
    // 等待非同步疊加完成
    val image = asyncOverlay().await()
    // 然後在 UI 中顯示它
    showImage(image)
}
```

在這裡，`async { ... }` 啟動一個協同程式，當我們使用 `await()` 時，協同程式的執行會被暫停，同時執行正在等待的操作，並在等待的操作完成時恢復（可能在不同的執行緒上）。

標準函式庫使用協同程式透過 `yield` 和 `yieldAll` 函式來支援 *延遲產生的序列 (lazily generated sequences)*。在這種序列中，回傳序列元素的程式碼區塊在取得每個元素後會被暫停，並在請求下一個元素時恢復。範例如下：

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // 產生 i 的平方
          yield(i * i)
      }
      // 產生一個範圍
      yieldAll(26..28)
    }

    // 列印序列
    println(seq.toList())
}
```

執行上面的程式碼以查看結果。歡迎隨時編輯並再次執行！

欲了解更多資訊，請參閱 [協同程式文件](coroutines-overview.md) 和 [教學](coroutines-and-channels.md)。

請注意，協同程式目前被視為 **實驗性功能**，這意味著 Kotlin 團隊不承諾在 1.1 正式版本發佈後維持此功能的向後相容性。

## 其他語言特性 {id="other-language-features"}

### 型別別名 {id="type-aliases"}

型別別名 (type alias) 允許你為現有型別定義另一個名稱。這對於像集合這樣的泛型型別以及函式型別最為有用。範例如下：

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 請注意，型別名稱（原始名稱與型別別名）是可以互換的：
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

詳情請參閱 [型別別名文件](type-aliases.md) 和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md)。

### 綁定可呼叫參考 {id="bound-callable-references"}

現在你可以使用 `::` 運算子來獲取指向特定物件執行個體的方法或屬性的 [成員參考](reflection.md#function-references)。以前這只能透過 Lambda 來表達。範例如下：

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

詳情請閱讀 [文件](reflection.md) 和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md)。

### 密封類別與資料類別 {id="sealed-and-data-classes"}

Kotlin 1.1 移除了 Kotlin 1.0 中對密封類別 (sealed classes) 和資料類別 (data classes) 的一些限制。現在你可以在同一個檔案的最上層定義最上層密封類別的子類別，而不僅僅是作為密封類別的巢狀類別。資料類別現在可以繼承其他類別。這可以用來漂亮且簡潔地定義運算式類別的階層結構：

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

詳情請閱讀 [密封類別文件](sealed-classes.md) 或關於 [密封類別](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md) 與 [資料類別](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md) 的 KEEP。

### Lambda 中的解構 {id="destructuring-in-lambdas"}

現在你可以使用 [解構宣告](destructuring-declarations.md) 語法來解包傳遞給 Lambda 的引數。範例如下：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 之前
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

詳情請閱讀 [解構宣告文件](destructuring-declarations.md) 和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md)。

### 未使用參數的底線 {id="underscores-for-unused-parameters"}

對於具有多個參數的 Lambda，你可以使用 `_` 字元來取代你不使用的參數名稱：

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

這在 [解構宣告](destructuring-declarations.md) 中也同樣有效：

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

詳情請閱讀 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md)。

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

詳情請閱讀 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md)。

### 屬性的較短語法 {id="shorter-syntax-for-properties"}

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

如果屬性沒有支援欄位，現在可以使用 `inline` 修飾詞標記屬性存取子。此類存取子的編譯方式與 [內嵌函式](inline-functions.md) 相同。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // getter 將會被內嵌
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你也可以將整個屬性標記為 `inline` —— 這樣修飾詞會套用到兩個存取子上。

詳情請閱讀 [內嵌函式文件](inline-functions.md#inline-properties) 和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md)。

### 區域委派屬性 {id="local-delegated-properties"}

現在你可以在區域變數上使用 [委派屬性](delegated-properties.md) 語法。一種可能的用途是定義延遲求值的區域變數：

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // 回傳隨機值
        println("The answer is $answer.")   // answer 在此時計算
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

詳情請閱讀 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md)。

### 攔截委派屬性綁定 {id="interception-of-delegated-property-binding"}

對於 [委派屬性](delegated-properties.md)，現在可以使用 `provideDelegate` 運算子攔截委派與屬性的綁定。例如，如果我們想在綁定之前檢查屬性名稱，我們可以這樣寫：

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

在建立 `MyUI` 執行個體期間，將為每個屬性呼叫 `provideDelegate` 方法，並且它可以立即執行必要的驗證。

詳情請閱讀 [委派屬性文件](delegated-properties.md)。

### 泛型列舉值存取 {id="generic-enum-value-access"}

現在可以以泛型方式列舉列舉類別的值。

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

### DSL 中隱含接收者的作用域控制 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) 註解允許在 DSL 上下文中限制對外層作用域接收者的使用。考慮典型的 [HTML 建置器範例](type-safe-builders.md)：

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

在 Kotlin 1.0 中，傳遞給 `td` 的 Lambda 中的程式碼可以存取三個隱含接收者：傳遞給 `table`、`tr` 和 `td` 的接收者。這允許你呼叫在該上下文中沒有意義的方法 —— 例如在 `td` 內部呼叫 `tr`，從而在 `<td>` 中放入 `<tr>` 標籤。

在 Kotlin 1.1 中，你可以對此進行限制，使得只有在 `td` 的隱含接收者上定義的方法才能在傳遞給 `td` 的 Lambda 內部使用。你可以透過定義標記有 `@DslMarker` 元註解的註解，並將其套用到標籤類別的基底類別來實現。

詳情請閱讀 [型別安全建置器文件](type-safe-builders.md) 和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md)。

### rem 運算子 {id="rem-operator"}

`mod` 運算子現在已被棄用，改用 `rem`。動機請參閱 [此問題](https://youtrack.jetbrains.com/issue/KT-14650)。

## 標準函式庫 {id="standard-library"}

### 字串轉數字轉換 {id="string-to-number-conversions"}

String 類別中有一組新的擴充功能，可以將字串轉換為數字，而不會在數字無效時拋出例外：`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` 等。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

此外，整數轉換函式（如 `Int.toString()`、`String.toInt()`、`String.toIntOrNull()`）現在都有一個帶有 `radix` 參數的多載，允許指定轉換的進位制（2 到 36）。

### onEach() {id="oneach"}

`onEach` 是一個雖小但很有用的集合和序列擴充函式，它允許在操作鏈中對集合/序列的每個元素執行某些操作（可能有副作用）。在可反覆運算物件上，它的行為類似於 `forEach`，但會進一步回傳該物件執行個體。在序列上，它回傳一個包裝序列，該序列在反覆運算元素時延遲地套用給定的操作。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also()、takeIf() 和 takeUnless() {id="also-takeif-and-takeunless"}

這是三個適用於任何接收者的通用擴充函式。

`also` 類似於 `apply`：它接收接收者，對其執行某些操作，並回傳該接收者。區別在於，在 `apply` 內部的區塊中，接收者以 `this` 的形式可用，而在 `also` 內部的區塊中，它以 `it` 的形式可用（如果你願意，可以給它另一個名稱）。當你不希望遮蔽來自外部作用域的 `this` 時，這非常方便：

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

`takeIf` 就像是針對單個值的 `filter`。它檢查接收者是否符合述句 (predicate)，如果符合則回傳接收者，否則回傳 `null`。結合 Elvis 運算子 (?:) 和提早回傳，它允許編寫如下結構：

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
    // 在找到關鍵字的情況下，對輸入字串中關鍵字的索引執行某些操作
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeUnless` 與 `takeIf` 相同，但它採用反向述句。當接收者 *不* 符合述句時回傳接收者，否則回傳 `null`。因此，上述範例之一可以使用 `takeUnless` 改寫如下：

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

當你使用可呼叫參考而非 Lambda 時，使用它也非常方便：

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

此 API 可用於按鍵對集合進行分組並同時摺疊每個組。例如，它可以用來計算以每個字母開頭的單字數量：

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 使用 'groupBy' 和 'mapValues' 的替代方式會建立一個中間 Map，
    // 而 'groupingBy' 方式則是在過程中即時計算。
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.toMap() 和 Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

這些函式可用於輕鬆複製 Map：

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

`plus` 運算子提供了一種向唯讀 Map 新增鍵值對並產生新 Map 的方法，然而以前沒有一種簡單的方法可以執行相反操作：要從 Map 中移除鍵，你必須求助於不太直觀的方法，如 `Map.filter()` 或 `Map.filterKeys()`。現在 `minus` 運算子填補了這一空白。目前有 4 個多載可用：用於移除單個鍵、鍵集合、鍵序列和鍵陣列。

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

### minOf() 和 maxOf() {id="minof-and-maxof"}

這些函式可用於尋找兩個或三個給定值中的最小值和最大值，其中值為原始數字或 `Comparable` 物件。如果你想比較本身不可比較的物件，每個函式還有一個接受額外 `Comparator` 執行個體的多載。

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

### 類似 Array 的 List 具現化函式 {id="array-like-list-instantiation-functions"}

與 `Array` 建構函式類似，現在有建立 `List` 和 `MutableList` 執行個體並透過呼叫 Lambda 初始化每個元素的函式：

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

此 `Map` 上的擴充功能會回傳與給定鍵對應的現有值，否則拋出例外，並說明未找到哪個鍵。如果 Map 是使用 `withDefault` 產生的，則此函式將回傳預設值而非拋出例外。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // 回傳不可為 null 的 Int 值 42
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 回傳 4
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- 這將會拋出 NoSuchElementException
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 抽象集合 {id="abstract-collections"}

在實作 Kotlin 集合類別時，這些抽象類別可用作基底類別。對於實作唯讀集合，有 `AbstractCollection`、`AbstractList`、`AbstractSet` 和 `AbstractMap`；對於可變集合，有 `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet` 和 `AbstractMutableMap`。在 JVM 上，這些抽象可變集合的大部分功能繼承自 JDK 的抽象集合。

### 陣列操作函式 {id="array-manipulation-functions"}

標準函式庫現在提供了一組用於對陣列進行逐元素操作的函式：比較（`contentEquals` 和 `contentDeepEquals`）、雜湊碼計算（`contentHashCode` 和 `contentDeepHashCode`）以及轉換為字串（`contentToString` 和 `contentDeepToString`）。它們同時支援 JVM（在 JVM 上作為 `java.util.Arrays` 中對應函式的別名）和 JS（在 Kotlin 標準函式庫中提供實作）。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 實作：類型與雜湊值的亂碼
    println(array.contentToString())  // 格式化為清單，較美觀
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## JVM 後端 {id="jvm-backend"}

### Java 8 位元組碼支援 {id="java-8-bytecode-support"}

Kotlin 現在可以選擇產生 Java 8 位元組碼（使用 `-jvm-target 1.8` 命令列選項或 Maven/Gradle 中的對應選項）。目前這不會改變位元組碼的語意（特別是介面中的預設方法和 Lambda 的產生方式與 Kotlin 1.0 完全相同），但我們計劃稍後進一步利用這一點。

### Java 8 標準函式庫支援 {id="java-8-standard-library-support"}

現在有獨立版本的標準函式庫支援 Java 7 和 8 中新增的新 JDK API。如果你需要存取新 API，請使用 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8` Maven 構件，而非標準的 `kotlin-stdlib`。這些構件是 `kotlin-stdlib` 之上的微小擴充，它們會以遞移相依性的方式將其帶入你的專案中。

### 位元組碼中的參數名稱 {id="parameter-names-in-the-bytecode"}

Kotlin 現在支援在位元組碼中儲存參數名稱。可以使用 `-java-parameters` 命令列選項啟用此功能。

### 常數內嵌 {id="constant-inlining"}

編譯器現在會將 `const val` 屬性的值內嵌到使用它們的位置。

### 可變閉包變數 {id="mutable-closure-variables"}

用於在 Lambda 中捕獲可變閉包變數的 Box 類別不再具有 volatile 欄位。此變更提高了效能，但在某些罕見的使用情境下可能會導致新的競爭條件。如果你受此影響，你需要提供自己的同步機制來存取這些變數。

### javax.script 支援 {id="javax-script-support"}

Kotlin 現在與 [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223) 整合。該 API 允許在執行時期求值程式碼片段：

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 印出 5
```

有關使用該 API 的較大範例專案，請參閱 [此處](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)。

### kotlin.reflect.full {id="kotlin-reflect-full"}

為了 [準備支援 Java 9](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)，`kotlin-reflect.jar` 函式庫中的擴充函式和屬性已移至 `kotlin.reflect.full` 套件。舊套件 (`kotlin.reflect`) 中的名稱已棄用，並將在 Kotlin 1.2 中移除。請注意，核心反射介面（如 `KClass`）是 Kotlin 標準函式庫的一部分，而非 `kotlin-reflect`，因此不受此次移動影響。

## JavaScript 後端 {id="javascript-backend"}

### 統一的標準函式庫 {id="unified-standard-library"}

現在可以從編譯為 JavaScript 的程式碼中使用更大一部分的 Kotlin 標準函式庫。特別是關鍵類別如集合（`ArrayList`、`HashMap` 等）、例外（`IllegalArgumentException` 等）以及一些其他類別（`StringBuilder`、`Comparator`）現在都在 `kotlin` 套件下定義。在 JVM 上，這些名稱是对应 JDK 類別的型別別名，而在 JS 上，這些類別是在 Kotlin 標準函式庫中實作的。

### 更好的程式碼產生 {id="better-code-generation"}

JavaScript 後端現在產生更多可靜態檢查的程式碼，這對 JS 程式碼處理工具（如縮減器、優化器、Lint 工具等）更加友好。

### external 修飾詞 {id="the-external-modifier"}

如果你需要以型別安全的方式從 Kotlin 存取 JavaScript 實作的類別，可以使用 `external` 修飾詞撰寫 Kotlin 宣告。（在 Kotlin 1.0 中，則是使用 `@native` 註解。）與 JVM 目標不同，JS 目標允許在類別和屬性上使用 external 修飾詞。例如，以下是你如何宣告 DOM `Node` 類別：

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // 等等
}
```

### 改進的匯入處理 {id="improved-import-handling"}

你現在可以更精確地描述應從 JavaScript 模組匯入的宣告。如果在外部宣告上添加 `@JsModule("<module-name>")` 註解，它將在編譯期間正確匯入到模組系統（CommonJS 或 AMD）。例如，使用 CommonJS 時，宣告將透過 `require(...)` 函式匯入。此外，如果你想將宣告匯入為模組或全域 JavaScript 物件，可以使用 `@JsNonModule` 註解。

例如，以下是你如何將 JQuery 匯入 Kotlin 模組：

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

在這種情況下，JQuery 將被匯入為名為 `jquery` 的模組。或者，它也可以被用作 $-物件，具體取決於 Kotlin 編譯器設定使用的模組系統。

你可以在應用程式中像這樣使用這些宣告：

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```
