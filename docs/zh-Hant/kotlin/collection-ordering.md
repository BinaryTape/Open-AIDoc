[//]: # (title: 集合排序)

元素的順序是某些集合類型的一個重要特質。
例如，如果兩個包含相同元素的清單其元素順序不同，則這兩個清單並不相等。

在 Kotlin 中，可以透過幾種方式來定義物件的順序。

首先是*自然*順序（natural order）。它是為 [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) 介面的實作所定義的。當沒有指定其他順序時，自然順序會用於對它們進行排序。

大多數內建型別都是可比較的（comparable）：

* 數值型別使用傳統的數值順序：`1` 大於 `0`；`-3.4f` 大於 `-5f`，依此類推。
* `Char` 和 `String` 使用[字典順序](https://en.wikipedia.org/wiki/Lexicographical_order)：`b` 大於 `a`；`world` 大於 `hello`。

若要為使用者自訂的型別定義自然順序，請讓該型別實作 `Comparable`。
這需要實作 `compareTo()` 函式。`compareTo()` 必須接受另一個相同型別的物件作為引數，並傳回一個整數值以顯示哪個物件較大：

* 正值表示接收者物件較大。
* 負值表示它小於引數。
* 零表示兩個物件相等。

以下是一個用於比較由主要（major）與次要（minor）部分組成的版本類別。

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

*自訂*順序讓你可以按照自己喜歡的方式對任何型別的執行個體進行排序。
特別是，你可以為不可比較的物件定義順序，或者為可比較的型別定義自然順序以外的順序。
若要為某個型別定義自訂順序，請為其建立一個 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html)。
`Comparator` 包含 `compare()` 函式：它接受一個類別的兩個執行個體，並傳回它們之間比較的整數結果。
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

有了 `lengthComparator`，你就可以依照字串的長度而不是預設的字典順序來排列字串。

定義 `Comparator` 的一種較簡短方式是使用標準庫中的 [`compareBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.comparisons/compare-by.html) 函式。`compareBy()` 接受一個 Lambda 函式，該函式會從執行個體產生一個 `Comparable` 值，並將產生的值的自然順序定義為自訂順序。

使用 `compareBy()`，上述範例中的長度比較器看起來如下：

```kotlin
fun main() {
//sampleStart    
    println(listOf("aaa", "bb", "c").sortedWith(compareBy { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以根據多個準則來定義順序。
例如，若要依字串長度排序，並在長度相等時按字母順序排序，你可以這樣寫：

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

由於依多個準則排序是常見的情境，Kotlin 標準庫提供了 [`.thenBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/then-by.html) 函式，你可以用它來新增次要排序規則。

例如，你可以將 `compareBy()` 與 `.thenBy()` 結合使用，先依長度排序字串，再按字母順序排序，就如同前一個範例一樣：

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

Kotlin 集合套件提供了以自然順序、自訂順序甚至是隨機順序對集合進行排序的函式。
在本頁面中，我們將介紹適用於[唯讀](collections-overview.md#read-only-and-mutable-collections)集合的排序函式。
這些函式會將其結果作為新集合傳回，其中包含依要求順序排列的原集合元素。
若要了解就地（in place）排序[可變](collections-overview.md#read-only-and-mutable-collections)集合的函式，請參閱 [List 專用操作](list-operations.md#sort)。

## 自然順序 {id="natural-order"}

基本函式 [`.sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) 與 [`.sortedDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-descending.html) 會根據元素的自然順序，將集合元素按遞增和遞減順序排序後傳回。
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
 
對於以自訂順序排序或對不可比較的物件進行排序，有 [`.sortedBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by.html) 和 [`.sortedByDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by-descending.html) 函式。
它們接受一個選擇器函式，將集合元素對應到 `Comparable` 值，並按這些值的自然順序對集合進行排序。

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
為此，請呼叫 [`.sortedWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-with.html) 擴充函式並傳入你的 `Comparator`。
使用此函式，依字串長度排序看起來如下：

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

你可以使用以下擴充函式來檢查元素是否已經符合指定的順序：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

如果元素處於指定順序，或者元素少於兩個，這些擴充函式會傳回 `true`。
一旦發現順序錯誤的元素配對，它們就會傳回 `false` 並停止檢查。

對於不保證反覆運算順序的集合（例如 `HashSet`），多次呼叫的結果可能會有所不同。
這同樣適用於無法以一致順序產生元素的序列。
若要在多次呼叫中獲得相同結果，請僅在保證反覆運算順序的集合（例如 `List`）上使用這些函式。

檢查 `Double` 和 `Float` 值時，這些函式將 `NaN` 視為大於任何其他值，並將 `-0.0` 視為小於 `0.0`。
此外，`.isSortedBy()` 和 `.isSortedByDescending()` 函式將 `null` 選擇器結果視為小於任何非 null 值。

當你在序列上呼叫這些函式時，該操作為終端操作。
它會耗盡該序列以產生一個 `Boolean` 值，而不是傳回另一個序列。

> 這些排序順序檢查函式也適用於陣列、基本型別陣列和無正負號陣列。
> 無正負號陣列及其相關操作處於[實驗性階段](components-stability.md#stability-levels-explained)，需要使用 `@ExperimentalUnsignedTypes` 註解明確選擇啟用（opt-in）。
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

## 反轉順序 {id="reverse-order"}

你可以使用 [`.reversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reversed.html) 函式以反向順序擷取集合。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.reversed())
//sampleEnd
}
```
{kotlin-runnable="true"}

`.reversed()` 擴充函式會傳回一個包含元素複本的新集合。
因此，如果你稍後修改原始集合，這不會影響先前透過 `.reversed()` 取得的結果。

另一個反轉函式——[`.asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html)——會傳回相同集合執行個體的反轉檢視，因此如果原始清單不會改變，它可能比 `.reversed()` 更輕量且更合適。

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

如果原始清單是可變的，其所有的變更都會反映在其反轉檢視中，反之亦然。

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

然而，如果清單的可變性未知，或者來源根本不是清單，那麼 `.reversed()` 更合適，因為它的結果是一個將來不會改變的複本。

## 隨機順序 {id="random-order"}

最後，還有一個以隨機順序傳回包含集合元素的新 `List` 的函式——[`.shuffled()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffled.html)。
你可以在不傳入引數的情況下呼叫它，也可以傳入一個 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html) 物件。

```kotlin
fun main() {
//sampleStart
     val numbers = listOf("one", "two", "three", "four")
     println(numbers.shuffled())
//sampleEnd
}
```
{kotlin-runnable="true"}