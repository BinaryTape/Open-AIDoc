[//]: # (title: 获取集合部分内容)

Kotlin 标准库包含用于获取集合部分内容的扩展函数。
这些函数提供了多种选择结果集合元素的方式：显式列出元素的位置、指定结果大小等。

## 切片 (Slice) {id="slice"}

[`slice()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/slice.html) 返回具有指定索引的集合元素列表。这些索引既可以作为[区间](ranges.md)传入，也可以作为整数值的集合传入。

```kotlin

fun main() {
//sampleStart    
    val numbers = listOf("one", "two", "three", "four", "five", "six")    
    println(numbers.slice(1..3))
    println(numbers.slice(0..4 step 2))
    println(numbers.slice(setOf(3, 5, 0)))    
//sampleEnd
}
```
{kotlin-runnable="true"}

## Take 与 drop {id="take-and-drop"}

要获取从第一个元素开始的指定数量的元素，请使用 [`take()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take.html) 函数。
要获取最后几个元素，请使用 [`takeLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last.html)。
如果传入的数字大于集合大小，这两个函数都会返回整个集合。

要获取除指定数量的开头或结尾元素之外的所有元素，请分别调用 [`drop()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop.html) 和 [`dropLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last.html) 函数。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.take(3))
    println(numbers.takeLast(3))
    println(numbers.drop(1))
    println(numbers.dropLast(5))
//sampleEnd
}
```
{kotlin-runnable="true"}

您还可以使用谓词来定义要获取或丢弃的元素数量。
有四个与上述函数类似的函数：

* [`takeWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-while.html) 是带有谓词的 `take()`：它会按顺序获取元素，直到遇到第一个不符合谓词的元素（不包括该元素）。如果集合的第一个元素就不符合谓词，则结果为空。
* [`takeLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last-while.html) 与 `takeLast()` 类似：它从集合末尾开始获取符合谓词的元素范围。该范围的第一个元素是紧邻最后一个不符合谓词元素之后的那个元素。如果集合的最后一个元素就不符合谓词，则结果为空；
* [`dropWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-while.html) 与带有相同谓词的 `takeWhile()` 相反：它返回从第一个不符合谓词的元素开始直到末尾的所有元素。
* [`dropLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last-while.html) 与带有相同谓词的 `takeLastWhile()` 相反：它返回从开头到最后一个不符合谓词的元素之间的所有元素。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.takeWhile { !it.startsWith('f') })
    println(numbers.takeLastWhile { it != "three" })
    println(numbers.dropWhile { it.length == 3 })
    println(numbers.dropLastWhile { it.contains('i') })
//sampleEnd
}
```
{kotlin-runnable="true"}

## 分块 (Chunked) {id="chunked"}

要将集合拆分为指定大小的块，请使用 [`chunked()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/chunked.html) 函数。
`chunked()` 接受一个实参——块的大小——并返回由给定大小的 `List` 组成的 `List`。
第一个块从第一个元素开始，包含 `size` 个元素，第二个块包含接下来的 `size` 个元素，以此类推。最后一个块的大小可能较小。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.chunked(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

您还可以立即对返回的块应用转换。
为此，请在调用 `chunked()` 时将转换作为 lambda 表达式传入。
该 lambda 表达式的实参即为集合的一个分块。当使用转换调用 `chunked()` 时，这些块是存活期较短的 `List`，应直接在该 lambda 表达式中消费。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList() 
    println(numbers.chunked(3) { it.sum() })  // `it` 是原始集合的一个分块
//sampleEnd
}
```
{kotlin-runnable="true"}

## 窗口化 (Windowed) {id="windowed"}

您可以检索指定大小的集合元素的所有可能区间。
用于获取它们的函数称为 [`windowed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/windowed.html)：
它返回一个元素区间列表，效果如同您通过给定大小的滑动窗口查看该集合一样。
与 `chunked()` 不同，`windowed()` 返回从集合的*每个*元素开始的元素区间（*窗口*）。
所有窗口都作为单个 `List` 的元素返回。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.windowed(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

`windowed()` 通过带默认值的形参提供了更大的灵活性：

* `step` 定义两个相邻窗口的第一个元素之间的距离。默认值为 1，因此结果包含从所有元素开始的窗口。如果将步长增加到 2，您将只获得从奇数位置元素开始的窗口：第 1 个、第 3 个，依此类推。
* `partialWindows` 包含从集合末尾元素开始的较小尺寸窗口。例如，如果您请求包含 3 个元素的窗口，则无法为最后两个元素构建完整窗口。在这种情况下启用 `partialWindows` 将额外包含大小分别为 2 和 1 的两个列表。

最后，您可以立即对返回的区间应用转换。
为此，请在调用 `windowed()` 时将转换作为 lambda 表达式传入。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..10).toList()
    println(numbers.windowed(3, step = 2, partialWindows = true))
    println(numbers.windowed(3) { it.sum() })
//sampleEnd
}
```
{kotlin-runnable="true"}

要构建包含两个元素的窗口，有一个单独的函数——[`zipWithNext()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip-with-next.html)。
它会创建接收者集合中相邻元素构成的对。
请注意，`zipWithNext()` 不会将集合拆分成对；它会为除最后一个元素之外的*每个*元素创建一个 `Pair`，因此它在 `[1, 2, 3, 4]` 上的结果是 `[[1, 2], [2, 3], [3, 4]]`，而不是 `[[1, 2], [3, 4]]`。
`zipWithNext()` 也可以与转换函数一起调用；该函数应接受接收者集合的两个元素作为实参。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.zipWithNext())
    println(numbers.zipWithNext() { s1, s2 -> s1.length > s2.length})
//sampleEnd
}
```
{kotlin-runnable="true"}