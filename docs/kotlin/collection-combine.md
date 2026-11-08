[//]: # (title: 合并集合)

Kotlin 提供了用于添加与移除集合元素以及合并集合的运算符和函数。这些操作都会返回一个新的只读集合，而原始集合保持不变。

你也可以通过添加或移除元素来修改可变集合。要了解更多信息，请参阅 [](collection-write.md)。

## 添加与移除元素 {id="add-and-remove-elements"}

在 Kotlin 中，你可以使用 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）和 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）运算符来添加或移除集合元素。
第一个操作数是集合，第二个操作数可以是元素或另一个集合。
每个运算符都会返回一个新的只读集合：

* `plus` 返回一个包含原始元素以及来自第二个操作数的一个或多个元素的集合。
* `minus` 返回一个不包含第二个操作数中所指定元素的集合。若该操作数是单个元素，`minus` 会移除其首次出现的项。若第二个操作数是集合，`minus` 则会移除其所有出现过的元素。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    
    println(plusList)
    // [one, two, three, four, five]
   
    println(minusList)
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你还可以对集合使用[复合赋值运算符](operator-overloading.md#augmented-assignments) [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）和 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）：

* 对于存储在由 `var` 声明的变量中的只读集合，这些运算符会使用 `plus` 或 `minus`，并将生成的集合重新赋值给该变量。
* 对于存储在由 `val` 声明的变量中的可变集合，这些运算符会使用 `plusAssign` 或 `minusAssign` 就地修改该集合。

有关 Map 的 `plus` 与 `minus` 运算符的详细信息，请参阅 [Map 专用操作](map-operations.md)。

## 合并两个集合 {id="merge-two-collections"}

要合并两个集合，请使用 [`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 函数。它会返回一个包含两个集合中所有不重复元素的 `Set`。你也可以使用中缀形式调用它：`a union b`。

结果会保留第一个集合的迭代顺序，其后按迭代顺序追加第二个集合中尚未包含的元素：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 交换集合会改变结果的迭代顺序
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 查找两个集合的交集 {id="find-the-intersection-of-two-collections"}

要查找同时存在于两个集合中的元素（交集），请使用 [`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html)。
要查找存在于第一个集合但不存在于第二个集合中的元素，请使用 [`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html)。

这两个函数都返回 `Set`，并且支持中缀表示法（`a intersect b` 与 `a subtract b`）：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 查找同时存在于两个集合中的元素
    println(numbers intersect setOf("two", "one"))
    // [one, two]
   
    // 排除存在于第二个集合中的元素
    println(numbers subtract setOf("three", "four"))
    // [one, two]

    // 重新排序第二个集合不会改变结果
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 查找仅存在于单个集合中的元素 {id="find-elements-present-in-only-one-collection"}

要查找仅存在于两个集合之一的元素，可以对两个集合互相做差集操作，然后使用 `union()` 合并结果。该操作被称为*对称差*（symmetric difference），并返回一个 `Set`：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 合并两个方向上的差集
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}