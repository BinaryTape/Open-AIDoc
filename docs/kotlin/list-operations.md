[//]: # (title: List 特有操作)

[`List`](collections-overview.md#list) 是 Kotlin 中最常用的内置集合类型。通过索引访问列表中的元素为列表提供了一组强大的操作。 

## 按索引检索元素 {id="retrieve-elements-by-index"}

列表支持所有常见的元素检索操作：`elementAt()`、`first()`、`last()` 以及[检索单个元素](collection-elements.md)中列出的其他操作。
列表的特有之处在于可以通过索引访问元素，因此读取元素的最简单方式就是按索引检索它。
这可以通过 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 函数（将索引作为实参传入）或简写的 `[index]` 语法来完成。

如果列表大小小于指定的索引，则会抛出异常。
还有另外两个函数可以帮助你避免此类异常： 

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) 允许你提供一个函数，用于在集合中不存在该索引时计算要返回的默认值。
* [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) 返回 `null` 作为默认值。 

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

## 检索列表的部分 {id="retrieve-list-parts"}

除[检索集合的部分](collection-parts.md)中的常见操作外，列表还提供了 [`subList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/sub-list.html) 函数，该函数以列表形式返回指定元素范围的视图。
因此，如果原始集合中的某个元素发生改变，先前创建的子列表中该元素也会发生改变，反之亦然。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.subList(3, 6))
//sampleEnd
}
```
{kotlin-runnable="true"}

## 查找元素位置 {id="find-element-positions"}

### 线性查找 {id="linear-search"}

在任何列表中，都可以使用 [`indexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of.html) 和 [`lastIndexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-index-of.html) 函数来查找元素的位置。
它们返回列表中与给定实参相等的元素的第一个和最后一个位置。
如果不存在此类元素，这两个函数都返回 `-1`。

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

还有一对接收谓词并搜索与之匹配的元素的函数：

* [`indexOfFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-first.html) 返回与谓词匹配的*第一个元素的索引*，如果不存在此类元素则返回 `-1`。
* [`indexOfLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-last.html) 返回与谓词匹配的*最后一个元素的索引*，如果不存在此类元素则返回 `-1`。

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

### 已排序列表中的二分查找 {id="binary-search-in-sorted-lists"}

在列表中搜索元素还有另一种方法——[二分查找](https://en.wikipedia.org/wiki/Binary_search_algorithm)。
它的运行速度明显快于其他内置搜索函数，但*要求列表按特定排序规则（自然顺序或函数形参中提供的其他规则）升序[排序](collection-ordering.md)*。
否则，结果是未定义的。 

要在已排序列表中搜索元素，请调用 [`binarySearch()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/binary-search.html) 函数并将该值作为实参传入。
如果存在该元素，函数会返回其索引；否则，它会返回 `(-insertionPoint - 1)`，其中 `insertionPoint` 是应当插入此元素以使列表保持有序的索引。
如果存在多个具有给定值的元素，搜索可能会返回它们中任意一个的索引。

你还可以指定要搜索的索引范围：在此情况下，函数仅在提供的两个索引之间进行搜索。

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

#### Comparator 二分查找 {id="comparator-binary-search"}

当列表元素不是 `Comparable` 时，应提供一个 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/) 用于二分查找。
列表必须按照此 `Comparator` 升序排序。来看一个示例：

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

这里有一个非 `Comparable` 的 `Product` 实例列表，以及一个定义顺序的 `Comparator`：如果产品 `p1` 的价格低于产品 `p2` 的价格，则产品 `p1` 排在产品 `p2` 之前。
因此，在拥有一个按此顺序升序排列的列表后，我们使用 `binarySearch()` 来查找指定 `Product` 的索引。

当列表使用不同于自然顺序的排序规则时，自定义比较器也很方便，例如对 `String` 元素使用不区分大小写的顺序。 

```kotlin

fun main() {
//sampleStart
    val colors = listOf("Blue", "green", "ORANGE", "Red", "yellow")
    println(colors.binarySearch("RED", String.CASE_INSENSITIVE_ORDER)) // 3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### Comparison 二分查找 {id="comparison-binary-search"}

使用 _comparison_（比较）函数的二分查找允许你在不提供显式搜索值的情况下查找元素。
相反，它接收一个将元素映射为 `Int` 值的比较函数，并搜索该函数返回零的元素。
列表必须根据提供的函数按升序排列；换句话说，比较的返回值必须从一个列表元素到下一个列表元素依次递增。

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

基于 comparator 和 comparison 的二分查找同样可以在列表的特定范围内执行。

## 列表写操作 {id="list-write-operations"}

除[集合写操作](collection-write.md)中描述的集合修改操作之外，[可变](collections-overview.md#collection-types)列表还支持特有的写操作。
这些操作通过使用索引访问元素来扩展列表的修改能力。

### 添加 {id="add"}

要将元素添加到列表中的特定位置，请使用 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 和 [`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html)，并将元素插入的位置作为额外实参提供。
该位置之后的所有元素都会向右移动。

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

列表还提供了一个用于替换指定位置元素的函数——[`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/set.html) 及其运算符形式 `[]`。`set()` 不会改变其他元素的索引。

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

[`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) 会将集合中的所有元素直接替换为指定的值。

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

要从列表中移除特定位置的元素，请使用 [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 函数，并将该位置作为实参提供。
被移除元素之后的所有元素的索引都会减 1。

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

在[集合排序](collection-ordering.md)中，我们介绍了按特定顺序检索集合元素的操作。
对于可变列表，标准库提供了类似的扩展函数，用于就地执行相同的排序操作。
当你对一个列表实例应用此类操作时，它会直接改变该实例中元素的顺序。

就地排序函数的名称与适用于只读列表的函数类似，但没有 `ed/d` 后缀：

* 所有排序函数名称中使用 `sort*` 代替 `sorted*`：[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html)、[`sortDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-descending.html)、[`sortBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-by.html) 等。
* 使用 [`shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 代替 `shuffled()`。
* 使用 [`reverse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reverse.html) 代替 `reversed()`。

在可变列表上调用 [`asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html) 会返回另一个可变列表，它是原始列表的反转视图。该视图中的更改会反映在原始列表中。
以下示例展示了可变列表的排序函数：

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