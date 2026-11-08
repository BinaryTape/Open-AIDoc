[//]: # (title: 集合操作概述)

Kotlin 标准库提供了丰富的函数用于对集合执行各种操作。这包括简单的操作（例如获取或添加元素），以及更复杂的操作（包括搜索、排序、过滤、转换等）。

## 扩展函数与成员函数 {id="extension-and-member-functions"}

标准库中声明集合操作的方式有两种：集合接口的[成员函数](classes.md)以及[扩展函数](extensions.md#extension-functions)。

成员函数定义了对于某种集合类型而言必不可少的操作。例如，[`Collection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 包含用于检查集合是否为空的 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/is-empty.html) 函数；[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 包含用于通过索引访问元素的 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 等。

当你创建自己的集合接口实现时，必须实现其成员函数。为了更轻松地创建新实现，可以使用标准库中集合接口的骨架实现：[`AbstractCollection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-collection/index.html)、[`AbstractList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-list/index.html)、[`AbstractSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-set/index.html)、[`AbstractMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-map/index.html) 及其可变对应项。

其他集合操作均声明为扩展函数。这些操作包括过滤、转换、排序以及其他集合处理函数。

## 通用操作 {id="common-operations"}

通用操作既适用于[只读集合也适用于可变集合](collections-overview.md#read-only-and-mutable-collections)。通用操作分为以下几类：

* [转换](collection-transformations.md)
* [过滤](collection-filtering.md)
* [`plus` 与 `minus` 运算符](collection-combine.md)
* [分组](collection-grouping.md)
* [获取集合部分内容](collection-parts.md)
* [获取单个元素](collection-elements.md)
* [排序](collection-ordering.md)
* [聚合操作](collection-aggregate.md)

这些页面中介绍的操作都会返回其结果，而不会影响原始集合。例如，过滤操作会生成一个包含所有与过滤谓词匹配的元素的*新集合*。此类操作的结果应存储在变量中，或者以其他某种方式使用（例如传递给其他函数）。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    numbers.filter { it.length > 3 }  // `numbers` 没有发生任何变化，结果已丢失
    println("numbers are still $numbers")
    val longerThan3 = numbers.filter { it.length > 3 } // 结果存储在 `longerThan3` 中
    println("numbers longer than 3 chars are $longerThan3")
//sampleEnd
}
```
{kotlin-runnable="true"}

对于某些集合操作，可以选择指定*目标 (destination)* 对象。目标是一个可变集合，函数会将生成的结果项附加到该目标中，而不是在新的对象中返回它们。对于带目标的操作，有单独的函数，其名称带有 `To` 后缀，例如用 [`filterTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-to.html) 代替 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)，或用 [`associateTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-to.html) 代替 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html)。这些函数将目标集合作为附加形参传入。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val filterResults = mutableListOf<String>()  // 目标对象
    numbers.filterTo(filterResults) { it.length > 3 }
    numbers.filterIndexedTo(filterResults) { index, _ -> index == 0 }
    println(filterResults) // 包含两个操作的结果
//sampleEnd
}

```
{kotlin-runnable="true"}

为了方便起见，这些函数会将目标集合返回，因此你可以直接在函数调用的对应实参中创建该集合：

```kotlin

fun main() {
    val numbers = listOf("one", "two", "three", "four")
//sampleStart
    // 将数字直接过滤到一个新的哈希集中，
    // 从而消除结果中的重复项
    val result = numbers.mapTo(HashSet()) { it.length }
    println("distinct item lengths are $result")
//sampleEnd
}
```
{kotlin-runnable="true"}

带有目标对象的函数可用于过滤、关联、分组、展平以及其他操作。有关目标操作的完整列表，请参阅 [Kotlin 集合参考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html)。

## 写入操作 {id="write-operations"}

对于可变集合，还存在会更改集合状态的*写入操作*。此类操作包括添加、移除和更新元素。写入操作列在[写入操作](collection-write.md)以及[List 专属操作](list-operations.md#list-write-operations)和[Map 专属操作](map-operations.md#map-write-operations)的对应章节中。

对于某些操作，存在执行相同操作的成对函数：一个就地应用操作，另一个将结果作为独立集合返回。例如，[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html) 就地对可变集合进行排序，因此其状态会发生改变；而 [`sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) 则会创建一个新集合，其中按排序顺序包含相同的元素。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val sortedNumbers = numbers.sorted()
    println(numbers == sortedNumbers)  // false
    numbers.sort()
    println(numbers == sortedNumbers)  // true
//sampleEnd
}
```
{kotlin-runnable="true"}