[//]: # (title: List 特定操作)

[`List`](collection-types.md#list) 是 Kotlin 中最常用的內建集合型別。透過索引存取清單元素，為清單提供了一套強大的操作功能。

## 依索引檢索元素 {id="retrieve-elements-by-index"}

清單支援所有用於元素檢索的通用操作：`elementAt()`、`first()`、`last()` 以及[檢索單一元素](collection-elements.md)中列出的其他操作。
清單的特殊之處在於能以索引存取元素，因此讀取元素最簡單的方法就是透過索引來檢索。
這可以透過 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 函式（將索引作為引數傳入）或簡寫的 `[index]` 語法來完成。

如果清單大小小於指定的索引，將會擲出例外。
還有另外兩個函式可以幫助你避免此類例外：

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) 讓你可以提供一個函式，用於計算當集合中不存在該索引時所傳回的預設值。
* [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) 傳回 `null` 作為預設值。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.get(0))
    println(numbers[0])
    //numbers.get(5)                         // exception!
    println(numbers.getOrNull(5))             // null
    println(numbers.getOrElse(5, {it}))        // 5
//sampleEnd
}
```
{kotlin-runnable="true"}

## 檢索清單的部分內容 {id="retrieve-list-parts"}

除了[檢索集合的部分內容](collection-parts.md)的常用操作之外，清單還提供了 [`subList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/sub-list.html) 函式，能將指定元素範圍的檢視（view）作為清單傳回。
因此，如果原始集合的元素發生變更，先前建立的子清單中的元素也會隨之變更，反之亦然。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.subList(3, 6))
//sampleEnd
}
```
{kotlin-runnable="true"}

## 尋找元素位置 {id="find-element-positions"}

### 線性搜尋 {id="linear-search"}

在任何清單中，你都可以使用 [`indexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of.html) 與 [`lastIndexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-index-of.html) 函式來尋找元素的位置。
它們會傳回清單中與給定引數相等的元素的第一個和最後一個位置。
如果沒有此類元素，兩個函式都會傳回 `-1`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4, 2, 5)
    println(numbers.indexOf(2))
    println(numbers.lastIndexOf(2))
//sampleEnd
}
```
{kotlin-runnable="true"}

還有一對函式接受述詞（predicate）並搜尋符合該述詞的元素：

* [`indexOfFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-first.html) 傳回符合述詞的*第一個元素的索引*；若不存在此類元素，則傳回 `-1`。
* [`indexOfLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-last.html) 傳回符合述詞的*最後一個元素的索引*；若不存在此類元素，則傳回 `-1`。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    println(numbers.indexOfFirst { it > 2})
    println(numbers.indexOfLast { it % 2 == 1})
//sampleEnd
}
```
{kotlin-runnable="true"}

### 已排序清單中的二元搜尋 {id="binary-search-in-sorted-lists"}

在清單中搜尋元素還有另一種方法——[二元搜尋 (binary search)](https://en.wikipedia.org/wiki/Binary_search_algorithm)。
它的執行速度明顯快於其他內建搜尋函式，但*要求清單必須根據某種順序（自然順序或函式參數中提供的順序）依遞增順序[排序](collection-ordering.md)*。
否則，搜尋結果將是未定義的。

要在已排序的清單中搜尋元素，請呼叫 [`binarySearch()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/binary-search.html) 函式並將該值作為引數傳入。
如果存在該元素，函式會傳回其索引；否則，它會傳回 `(-insertionPoint - 1)`，其中 `insertionPoint` 是該元素應該被插入的位置索引，以使清單維持排序狀態。
如果存在多個具有給定值的元素，則搜尋可能會傳回其中任何一個元素的索引。

你也可以指定搜尋的索引範圍：在這種情況下，函式僅在提供的兩個索引之間進行搜尋。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.sort()
    println(numbers)
    println(numbers.binarySearch("two"))  // 3
    println(numbers.binarySearch("z")) // -5
    println(numbers.binarySearch("two", 0, 2))  // -3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### 比較器二元搜尋 {id="comparator-binary-search"}

當清單元素未實作 `Comparable` 時，你應該提供一個 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/) 以用於二元搜尋。
清單必須根據此 `Comparator` 依遞增順序排序。讓我們看一個範例：

```kotlin

data class Product(val name: String, val price: Double)

fun main() {
//sampleStart
    val productList = listOf(
        Product("WebStorm", 49.0),
        Product("AppCode", 99.0),
        Product("DotTrace", 129.0),
        Product("ReSharper", 149.0))

    println(productList.binarySearch(Product("AppCode", 99.0), compareBy<Product> { it.price }.thenBy { it.name }))
//sampleEnd
}
```
{kotlin-runnable="true"}

此處是一個未實作 `Comparable` 的 `Product` 執行個體清單，以及一個定義順序的 `Comparator`：如果產品 `p1` 的價格小於產品 `p2` 的價格，則 `p1` 排在 `p2` 之前。
因此，在清單已按照此順序遞增排序的情況下，我們使用 `binarySearch()` 來尋找指定 `Product` 的索引。

當清單使用不同於自然順序的排序方式時，自訂比較器也非常方便，例如針對 `String` 元素使用不區分大小寫的順序。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("Blue", "green", "ORANGE", "Red", "yellow")
    println(colors.binarySearch("RED", String.CASE_INSENSITIVE_ORDER)) // 3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### 比較函式二元搜尋 {id="comparison-binary-search"}

使用*比較 (comparison)* 函式的二元搜尋讓你在無需提供明確搜尋值的情況下尋找元素。
相反地，它接受一個將元素對應到 `Int` 值的比較函式，並搜尋該函式傳回零的元素。
清單必須根據提供的函式依遞增順序排序；換句話說，比較的傳回值必須從前一個清單元素到後一個元素逐漸增大。

```kotlin

import kotlin.math.sign
//sampleStart
data class Product(val name: String, val price: Double)

fun priceComparison(product: Product, price: Double) = sign(product.price - price).toInt()

fun main() {
    val productList = listOf(
        Product("WebStorm", 49.0),
        Product("AppCode", 99.0),
        Product("DotTrace", 129.0),
        Product("ReSharper", 149.0))

    println(productList.binarySearch { priceComparison(it, 99.0) })
}
//sampleEnd
```
{kotlin-runnable="true"}

比較器二元搜尋和比較函式二元搜尋也都可以針對清單的特定範圍執行。

## List 寫入操作 {id="list-write-operations"}

除了[集合寫入操作](collection-write.md)中描述的集合修改操作之外，[可變](collections-overview.md#read-only-and-mutable-collections)清單還支援特定的寫入操作。
這些操作使用索引來存取元素，以擴展清單的修改功能。

### 新增 {id="add"}

要將元素新增至清單中的特定位置，請使用 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 和 [`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html)，並提供元素插入的位置作為額外引數。
該位置之後的所有元素都會向右平移。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "five", "six")
    numbers.add(1, "two")
    numbers.addAll(2, listOf("three", "four"))
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 更新 {id="update"}

清單還提供了一個用於取代給定位置元素的函式——[`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/set.html) 及其運算子形式 `[]`。`set()` 不會改變其他元素的索引。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "five", "three")
    numbers[1] =  "two"
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) 則是直接將集合中的所有元素替換為指定的值。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.fill(3)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 移除 {id="remove"}

若要從清單中的特定位置移除元素，請使用 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 函式並提供該位置作為引數。
被移除元素之後的所有元素索引都會減一。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)    
    numbers.removeAt(1)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 排序 {id="sort"}

在[集合排序](collection-ordering.md)中，我們介紹了以特定順序檢索集合元素的操作。
對於可變清單，標準函式庫提供了類似的擴充函式，能就地（in-place）執行相同的排序操作。
當你對某個清單執行個體套用此類操作時，該執行個體內部的元素順序將會直接改變。

就地排序函式的名稱與套用於唯讀清單的函式相似，但沒有 `ed/d` 後綴：

* 在所有排序函式的名稱中以 `sort*` 代替 `sorted*`：[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html)、[`sortDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-descending.html)、[`sortBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-by.html) 等。
* 以 [`shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 代替 `shuffled()`。
* 以 [`reverse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reverse.html) 代替 `reversed()`。

在可變清單上呼叫 [`asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html) 會傳回另一個可變清單，它是原始清單的反轉檢視。在該檢視中的變更會反映在原始清單中。
以下範例示範了可變清單的排序函式：

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")

    numbers.sort()
    println("Sort into ascending: $numbers")
    numbers.sortDescending()
    println("Sort into descending: $numbers")

    numbers.sortBy { it.length }
    println("Sort into ascending by length: $numbers")
    numbers.sortByDescending { it.last() }
    println("Sort into descending by the last letter: $numbers")
    
    numbers.sortWith(compareBy<String> { it.length }.thenBy { it })
    println("Sort by Comparator: $numbers")

    numbers.shuffle()
    println("Shuffle: $numbers")

    numbers.reverse()
    println("Reverse: $numbers")
//sampleEnd
}
```
{kotlin-runnable="true"}