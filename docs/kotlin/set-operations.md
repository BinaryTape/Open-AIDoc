[//]: # (title: Set 特有操作)

Kotlin 集合包中包含用于 Set 常见操作的扩展函数：查找交集、合并或从彼此中扣除集合。

要将两个集合合并为一个，请使用 [`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 函数。它可以以中缀形式 `a union b` 使用。
请注意，对于有序集合，操作数的顺序非常重要。在结果集合中，第一个操作数的元素排在第二个操作数的元素之前：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 按照顺序输出
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

要查找两个集合的交集（同时存在于两个集合中的元素），请使用 [`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html) 函数。
要查找不存在于另一个集合中的集合元素，请使用 [`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html) 函数。
这两个函数也可以通过中缀形式调用，例如 `a intersect b`：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 输出相同
    println(numbers intersect setOf("two", "one"))
    // [one, two]
    println(numbers subtract setOf("three", "four"))
    // [one, two]
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true"}

要查找存在于两个集合之一但不存在于其交集中的元素，也可以使用 `union()` 函数。
对于这种操作（称为对称差），可以计算两个集合之间的差集并合并结果：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 合并差集 
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true"}

您也可以将 `union()`、`intersect()` 和 `subtract()` 函数应用于列表（List）。
但是，它们的结果_始终_是一个 `Set`。在此结果中，所有重复元素都会合并为一个，并且无法使用索引访问：

```kotlin
fun main() {
//sampleStart
    val list1 = listOf(1, 1, 2, 3, 5, 8, -1)
    val list2 = listOf(1, 1, 2, 2, 3, 5)

    // 两个列表交集的结果是一个 Set
    println(list1 intersect list2)
    // [1, 2, 3, 5]

    // 相等的元素合并为一个
    println(list1 union list2)
    // [1, 2, 3, 5, 8, -1]
//sampleEnd
}
```
{kotlin-runnable="true"}