[//]: # (title: 集合分组)

Kotlin 标准库提供了用于对集合元素进行分组的扩展函数。
基本函数 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 接受一个 lambda 函数并返回一个 `Map`。在此 Map 中，每个键是 lambda 的计算结果，而对应的值则是返回该结果的元素组成的 `List`。例如，可以使用此函数按首字母对 `String` 列表进行分组。

你也可以在调用 `groupBy()` 时传入第二个 lambda 实参——值转换函数。
在带有两个 lambda 的 `groupBy()` 返回结果 Map 中，由 `keySelector` 函数生成的键将映射到值转换函数的结果，而不是原始元素。

以下示例演示了如何使用 `groupBy()` 函数按首字母对字符串进行分组，使用 `for` 运算符遍历返回的 `Map` 中的各个组，然后使用 `valueTransform` 函数将值转换为大写：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // 使用 groupBy() 按首字母对字符串进行分组
    val groupedByFirstLetter = numbers.groupBy { it.first().uppercase() }
    println(groupedByFirstLetter)
    // {O=[one], T=[two, three], F=[four, five]}

    // 遍历每个组并打印键及其关联的值
    for ((key, value) in groupedByFirstLetter) {
        println("Key: $key, Values: $value")
    }
    // Key: O, Values: [one]
    // Key: T, Values: [two, three]
    // Key: F, Values: [four, five]

    // 按首字母对字符串进行分组，并将值转换为大写
    val groupedAndTransformed = numbers.groupBy(keySelector = { it.first() }, valueTransform = { it.uppercase() })
    println(groupedAndTransformed)
    // {o=[ONE], t=[TWO, THREE], f=[FOUR, FIVE]}
//sampleEnd
}
```
{kotlin-runnable="true"}

如果想先对元素进行分组，然后一次性对所有组应用某种操作，可以使用 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 函数。
它会返回一个 [`Grouping`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-grouping/index.html) 类型的实例。`Grouping` 实例允许你以惰性方式对所有组应用操作：这些组实际上是在操作即将执行之前才构建的。

具体来说，`Grouping` 支持以下操作：

* [`eachCount()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/each-count.html) 统计每个组中的元素数量。
* [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 与 [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) 将每个组视为单独的集合执行[折叠与归约](collection-aggregate.md#fold-and-reduce)操作，并返回结果。
* [`aggregate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/aggregate.html) 随后对每个组中的所有元素应用指定操作并返回结果。
  这是在 `Grouping` 上执行任意操作的通用方式。当 fold 或 reduce 无法满足需求时，可以使用它来实现自定义操作。

你可以在返回的 `Map` 上使用 `for` 运算符遍历由 `groupingBy()` 函数创建的各个组。
这使你能够访问每个键以及与该键关联的元素数量。

以下示例演示了如何使用 `groupingBy()` 函数按首字母对字符串进行分组，统计每个组中的元素数量，然后遍历每个组以打印键和元素数量：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // 使用 groupingBy() 按首字母对字符串进行分组，并统计每个组中的元素数量
    val grouped = numbers.groupingBy { it.first() }.eachCount()

    // 遍历每个组并打印键及其关联的值
    for ((key, count) in grouped) {
        println("Key: $key, Count: $count")
        // Key: o, Count: 1
        // Key: t, Count: 2
        // Key: f, Count: 2
    }
//sampleEnd
}
```
{kotlin-runnable="true"}