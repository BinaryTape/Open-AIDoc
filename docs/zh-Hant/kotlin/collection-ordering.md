[//]: # (title: 排序)

元素的順序是某些集合型別的重要特徵。
例如，若兩個包含相同元素的 List，其元素順序不同，則兩者並不相等。

在 Kotlin 中，可以透過幾種方式來定義物件的順序。

首先是*自然順序*（natural order）。它是針對實作 [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) 介面的型別所定義的。當未指定其他順序時，自然順序會用於對它們進行排序。

大多數內建型別都是可比較的（comparable）：

* 數值型別使用傳統的數值順序：`1` 大於 `0`；`-3.4f` 大於 `-5f`，依此類推。
* `Char` 與 `String` 使用[字典順序](https://en.wikipedia.org/wiki/Lexicographical_order)（lexicographical order）：`b` 大於 `a`；`world` 大於 `hello`。

若要為使用者自訂型別定義自然順序，請讓該型別實作 `Comparable`。
這需要實作 `compareTo()` 函式。`compareTo()` 必須接受另一個相同型別的物件作為引數，並傳回一個整數值以表示哪個物件較大：

* 正值表示接收者物件較大。
* 負值表示它小於引數。
* 零表示兩個物件相等。

以下是一個用於版本排序的類別，該版本由主要部分（major）與次要部分（minor）組成。

```kotlin
class Version(val major: Int, val minor: Int): Comparable<Version> {
    override fun compareTo(other: Version): Int = when {
        this.major != other.major -> this.major compareTo other.major // 中綴形式的 compareTo()
        this.minor != other.minor -> this.minor compareTo other.minor
        else -> 0
    }
}

fun main() {    
    println(Version(1, 2) > Version(1, 3))
    println(Version(2, 0) > Version(1, 5))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

*自訂*順序可讓你依照想要的方式對任何型別的執行個體進行排序。
特別是，你可以為不可比較的物件定義順序，或者為可比較的型別定義自然順序以外的順序。
若要為某個型別定義自訂順序，請為其建立一個 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html)。
`Comparator` 包含 `compare()` 函式：它接受某個類別的兩個執行個體，並傳回兩者之間比較的整數結果。
該結果的解讀方式與上述 `compareTo()` 的結果相同。

```kotlin
fun main() {
//sampleStart
    val lengthComparator = Comparator { str1: String, str2: String -> str1.length - str2.length }
    println(listOf("aaa", "bb", "c").sortedWith(lengthComparator))
//sampleEnd
}
```
{kotlin-runnable="true"}

有了 `lengthComparator`，你就可以依字串的長度而不是預設的字典順序來排列字串。

定義 `Comparator` 的一種更簡短方式是使用標準函式庫中的 [`compareBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.comparisons/compare-by.html) 函式。`compareBy()` 接受一個 Lambda 函式，該函式會從執行個體產生一個 `Comparable` 值，並將自訂順序定義為所產生值的自然順序。

使用 `compareBy()`，上述範例中的長度比較器如下所示：

```kotlin
fun main() {
//sampleStart    
    println(listOf("aaa", "bb", "c").sortedWith(compareBy { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以根據多個條件來定義順序。
例如，若要先按字串長度排序，並在長度相同時按字母順序排序，可以編寫：

```kotlin
fun main() {
//sampleStart
    val sortedStrings = listOf("aaa", "bb", "c", "b", "a", "aa", "ccc")
        .sortedWith { a, b -> 
           when (val compareLengths = a.length.compareTo(b.length)) {
             0 -> a.compareTo(b)
             else -> compareLengths
           }
         }

    println(sortedStrings)
    // [a, b, c, aa, bb, aaa, ccc]
//sampleEnd
}
```
{kotlin-runnable="true"}

由於按多個條件排序是常見的情境，Kotlin 標準函式庫提供了 [`.thenBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/then-by.html) 函式，可用來新增次要排序規則。

例如，你可以將 `compareBy()` 與 `.thenBy()` 結合，就像前一個範例一樣，先依長度對字串排序，再依字母順序排序：

```kotlin
fun main() {
//sampleStart
    val sortedStrings = listOf("aaa", "bb", "c", "b", "a", "aa", "ccc")
        .sortedWith(compareBy<String> { it.length }.thenBy { it })

    println(sortedStrings)
    // [a, b, c, aa, bb, aaa, ccc]
//sampleEnd
}
```
{kotlin-runnable="true"}

Kotlin 集合套件提供了依自然順序、自訂順序甚至是隨機順序對集合進行排序的函式。
在本頁面中，我們將介紹適用於[唯讀](collections-overview.md#collection-types)集合的排序函式。
這些函式會將結果作為一個新的集合傳回，其中包含依所請求順序排列的原始集合元素。
若要了解就地排序[可變](collections-overview.md#collection-types)集合的函式，請參閱 [List 專用操作](list-operations.md#sort)。

## 自然順序 {id="natural-order"}

基本函式 [`.sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) 與 [`.sortedDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-descending.html) 會根據集合元素的自然順序，將元素按遞增和遞減順序排序後傳回。
這些函式適用於由 `Comparable` 元素組成的集合。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println("Sorted ascending: ${numbers.sorted()}")
    println("Sorted descending: ${numbers.sortedDescending()}")
//sampleEnd
}
```
{kotlin-runnable="true"}

## 自訂順序 {id="custom-orders"}
 
對於依自訂順序排序或對不可比較的物件進行排序，有 [`.sortedBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by.html) 與 [`.sortedByDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by-descending.html) 函式。
它們接受一個選擇器函式，將集合元素對應到 `Comparable` 值，並依這些值的自然順序對集合進行排序。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val sortedNumbers = numbers.sortedBy { it.length }
    println("Sorted by length ascending: $sortedNumbers")
    val sortedByLast = numbers.sortedByDescending { it.last() }
    println("Sorted by the last letter descending: $sortedByLast")
//sampleEnd
}
```
{kotlin-runnable="true"}

若要為集合排序定義自訂順序，你可以提供自己的 `Comparator`。
為此，呼叫 [`.sortedWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-with.html) 擴充函式並傳入你的 `Comparator`。
使用此函式，依長度對字串進行排序如下所示：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println("Sorted by length ascending: ${numbers.sortedWith(compareBy { it.length })}")
//sampleEnd
}
```
{kotlin-runnable="true"}

## 檢查排序順序 {id="check-sorted-order"}

你可以使用下列擴充函式來檢查元素是否已經符合指定的順序：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

如果元素符合指定的順序，或者元素少於兩個，這些擴充函式將傳回 `true`。
一旦發現未按順序排列的成對元素，它們就會傳回 `false` 並停止檢查。

對於不保證反覆運算順序的集合（例如 `HashSet`），每次呼叫的結果可能會有所不同。
這同樣適用於未以一致順序產生元素的序列（sequence）。
若要在多次呼叫之間取得相同的結果，請僅在具有保證反覆運算順序的集合（例如 `List`）上使用這些函式。

在檢查 `Double` 與 `Float` 值時，這些函式將 `NaN` 視為大於任何其他值，並將 `-0.0` 視為小於 `0.0`。
此外，`.isSortedBy()` 與 `.isSortedByDescending()` 函式將 `null` 的選擇器結果視為小於任何非 null 值。

當你在序列上呼叫這些函式時，該操作是終端（terminal）操作。
它會消耗該序列以產生一個 `Boolean` 值，而不是傳回另一個序列。

> 這些排序檢查函式也適用於陣列、基本型別陣列以及無正負號陣列。
> 無正負號陣列及其相關操作處於[實驗性](components-stability.md#stability-levels-explained)階段，需要透過 `@ExperimentalUnsignedTypes` 註解明確啟用。
> 
{style="note"}

以下是使用 `.isSorted()` 和 `.isSortedBy()` 函式檢查排序順序的範例：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false

    val descending = listOf(4, 3, 2, 1)
    println(descending.isSortedDescending())
    // true
   
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

## 反向順序 {id="reverse-order"}

你可以使用 [`.reversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reversed.html) 函式以相反順序取得集合。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.reversed())
//sampleEnd
}
```
{kotlin-runnable="true"}

`.reversed()` 擴充函式會傳回一個包含元素副本的新集合。
因此，如果你稍後修改了原始集合，這不會影響先前透過 `.reversed()` 取得的結果。

另一個反轉函式——[`.asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html)——會傳回同一個集合執行個體的反轉檢視，因此若原始 List 不會發生變更，它可能比 `.reversed()` 更輕量且更合適。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val reversedNumbers = numbers.asReversed()
    println(reversedNumbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

若原始 List 是可變的，其所有變更都會反映在其反轉檢視中，反之亦然。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val reversedNumbers = numbers.asReversed()
    println(reversedNumbers)
    numbers.add("five")
    println(reversedNumbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

然而，若該 List 的可變性未知，或者來源根本不是 List，則 `.reversed()` 更為合適，因為其結果是未來不會發生變更的副本。

## 隨機順序 {id="random-order"}

最後，還有一個會傳回包含以隨機順序排列之集合元素的新 `List` 的函式——[`.shuffled()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffled.html)。
呼叫它時可以不帶引數，也可以傳入一個 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html) 物件。

```kotlin
fun main() {
//sampleStart
     val numbers = listOf("one", "two", "three", "four")
     println(numbers.shuffled())
//sampleEnd
}
```
{kotlin-runnable="true"}