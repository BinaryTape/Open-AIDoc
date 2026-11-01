[//]: # (title: 获取集合的一部分)

Kotlin 标准库包含用于获取集合部分内容的扩展函数。这些函数提供了多种方式来选取结果集合中的元素：显式列出元素的位置、指定结果大小等。 

## Slice {id="slice"}

[`slice()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/slice.html) 返回具有指定索引的集合元素列表。这些索引既可以作为[区间](ranges.md)传递，也可以作为整数值的集合传递。 

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

要从第一个元素开始获取指定数量的元素，请使用 [`take()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take.html) 函数。若要获取最后几个元素，请使用 [`takeLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last.html)。当传入的数值大于集合的大小时，这两个函数都会返回整个集合。  

若要获取除前几个或后几个元素之外的所有元素，请分别调用 [`drop()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop.html) 和 [`dropLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last.html) 函数。 

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

你还可以使用谓词来定义要获取或丢弃的元素数量。有四个与上述类似的函数：

* [`takeWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-while.html) 是带有谓词的 `take()`：它会持续获取元素，直到遇到第一个不匹配该谓词的元素（不包含该元素）。如果集合的第一个元素就不匹配该谓词，则结果为空。
* [`takeLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last-while.html) 与 `takeLast()` 类似：它从集合的末尾开始获取匹配谓词的元素区间。该区间的第一个元素是最后一个不匹配谓词的元素的后一个元素。如果集合的最后一个元素就不匹配该谓词，则结果为空；
* [`dropWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-while.html) 与带有相同谓词的 `takeWhile()` 相反：它返回从第一个不匹配谓词的元素开始直到末尾的所有元素。
* [`dropLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last-while.html) 与带有相同谓词的 `takeLastWhile()` 相反：它返回从开头直到最后一个不匹配谓词的元素。

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

## Chunked {id="chunked"}

要将集合拆分为指定大小的块，请使用 [`chunked()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/chunked.html) 函数。`chunked()` 接受一个实参 —— 分块大小 —— 并返回由给定大小的 `List` 构成的 `List`。第一个块从第一个元素开始并包含 `size` 个元素，第二个块包含接下来的 `size` 个元素，依此类推。最后一个块的大小可能会更小。 

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.chunked(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以立即对返回的各个块应用转换操作。为此，请在调用 `chunked()` 时将转换作为 lambda 表达式传入。lambda 形参即为集合的一个分块。当调用带有转换操作的 `chunked()` 时，这些分块都是临时的 `List`，应当在该 lambda 内部立即被使用完毕。  

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList() 
    println(numbers.chunked(3) { it.sum() })  // `it` 为原始集合的一个分块
//sampleEnd
}
```
{kotlin-runnable="true"}

## Windowed {id="windowed"}

你可以获取给定大小的集合元素的所有可能区间。用于获取它们的函数为 [`windowed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/windowed.html)：它返回一个元素区间列表，效果如同透过给定大小的滑动窗口来观察集合。与 `chunked()` 不同，`windowed()` 返回从集合的*每个*元素开始的元素区间（_窗口_）。所有窗口都作为单个 `List` 的元素返回。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.windowed(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

`windowed()` 提供了带有默认值的形参，具有更高的灵活性：

* `step` 定义了两个相邻窗口的第一个元素之间的距离。默认值为 1，因此结果包含从所有元素开始的窗口。如果将步长增加到 2，你将仅收到从奇数元素开始的窗口：第一个、第三个，依此类推。
* `partialWindows` 包含从集合末尾元素开始且尺寸较小的窗口。例如，如果请求包含三个元素的窗口，则无法为最后两个元素构建完整窗口。在这种情况下，启用 `partialWindows` 会额外包含大小为 2 和 1 的两个列表。

最后，你可以立即对返回的区间应用转换。为此，请在调用 `windowed()` 时将转换作为 lambda 表达式传入。

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

要构建双元素窗口，可以使用专门的函数 —— [`zipWithNext()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip-with-next.html)。它会创建接收者集合中相邻元素的配对。请注意，`zipWithNext()` 并不会将集合拆分成若干对；它会为除最后一个元素之外的*每个*元素创建一个 `Pair`，因此它在 `[1, 2, 3, 4]` 上的结果是 `[[1, 2], [2, 3], [3, 4]]`，而不是 `[[1, 2], [3, 4]]`。`zipWithNext()` 也可以与转换函数一起调用；该函数应接受接收者集合的两个元素作为实参。

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