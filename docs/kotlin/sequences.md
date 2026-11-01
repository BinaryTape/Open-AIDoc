[//]: # (title: 序列)

除集合之外，Kotlin 标准库还包含另一种类型——*序列* ([`Sequence<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence/index.html))。
与集合不同，序列不包含元素，而是在迭代时生成元素。
序列提供了与 [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) 相同的函数，但针对多步骤集合处理实现了另一种方式。

当对 `Iterable` 的处理包含多个步骤时，它们是及早执行的：每个处理步骤都会完成并返回其结果——一个中间集合。后续步骤在此集合上执行。反之，序列的多步骤处理在可能的情况下是延迟执行的：只有在请求整个处理链的结果时，才会进行实际计算。

操作的执行顺序也有所不同：`Sequence` 会针对每个元素逐一执行所有处理步骤。而 `Iterable` 会针对整个集合完成每个步骤，然后再进入下一步。

因此，序列让您可以避免构建中间步骤的结果，从而提高整个集合处理链的性能。然而，序列的延迟特性也会带来一些开销，在处理较小的集合或进行较简单的计算时，这些开销可能会很明显。因此，您应当同时权衡 `Sequence` 和 `Iterable`，并确定哪一个更适合您的用例。

## 构造 {id="construct"}

### 从元素构造 {id="from-elements"}

要创建序列，请调用 [`sequenceOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence-of.html) 函数，并将元素作为其实参列出。

```kotlin
val numbersSequence = sequenceOf("four", "three", "two", "one")
```

### 从 Iterable 构造 {id="from-an-iterable"}

如果您已经拥有一个 `Iterable` 对象（例如 `List` 或 `Set`），可以通过调用 [`asSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-sequence.html) 从中创建序列。

```kotlin
val numbers = listOf("one", "two", "three", "four")
val numbersSequence = numbers.asSequence()

```

### 从函数构造 {id="from-a-function"}

创建序列的另一种方式是通过用于计算其元素的函数来构建序列。
要基于函数构建序列，请调用 [`generateSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/generate-sequence.html) 并将此函数作为实参传入。可选地，您可以将第一个元素指定为显式值或函数调用的结果。
当提供的函数返回 `null` 时，序列生成便会停止。因此，以下示例中的序列是无限的。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = generateSequence(1) { it + 2 } // `it` 是前一个元素
    println(oddNumbers.take(5).toList())
    //println(oddNumbers.count())     // 错误：序列是无限的
//sampleEnd
}
```
{kotlin-runnable="true"}

要使用 `generateSequence()` 创建有限序列，请提供一个在所需最后一个元素之后返回 `null` 的函数。

```kotlin

fun main() {
//sampleStart
    val oddNumbersLessThan10 = generateSequence(1) { if (it < 8) it + 2 else null }
    println(oddNumbersLessThan10.count())
//sampleEnd
}
```
{kotlin-runnable="true"}

### 从块构造 {id="from-chunks"}

最后，还有一个函数可以让您逐个或按任意大小的块生成序列元素——即 [`sequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence.html) 函数。
该函数接受一个包含对 [`yield()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield.html) 和 [`yieldAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield-all.html) 函数调用的 lambda表达式。
它们会向序列的使用方返回一个元素，并暂停 `sequence()` 的执行，直到使用方请求下一个元素。`yield()` 接受单个元素作为实参；`yieldAll()` 可以接受 `Iterable` 对象、`Iterator` 或另一个 `Sequence`。`yieldAll()` 的 `Sequence` 实参可以是无限的。但是，此类调用必须放在最后：所有后续调用都将永远不会执行。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = sequence {
        yield(1)
        yieldAll(listOf(3, 5))
        yieldAll(generateSequence(7) { it + 2 })
    }
    println(oddNumbers.take(5).toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

## 序列操作 {id="sequence-operations"}

根据状态需求，序列操作可分为以下几类：

* *无状态* (Stateless) 操作不需要状态，并独立处理每个元素，例如 [`map()`](collection-transformations.md#map) 或 [`filter()`](collection-filtering.md)。
   无状态操作在处理元素时也可能需要少量的常量状态，例如 [`take()` 或 `drop()`](collection-parts.md)。
* *有状态* (Stateful) 操作需要大量的状态，通常与序列中的元素数量成正比。

如果某个序列操作返回另一个延迟生成的序列，则称其为*中间操作*。
否则，该操作为*终端操作*。终端操作的示例包括 [`toList()`](constructing-collections.md#copy) 或 [`sum()`](collection-aggregate.md)。只能通过终端操作来检索序列元素。

序列可以多次迭代；但是，某些序列实现可能会限制自身仅能迭代一次。相关内容会在其文档中明确说明。

## 序列处理示例 {id="sequence-processing-example"}

让我们通过一个示例来看一下 `Iterable` 与 `Sequence` 之间的差异。

### Iterable {id="iterable"}

假设您有一个单词列表。下面的代码会筛选长度超过三个字符的单词，并输出前四个此类单词的长度。

```kotlin

fun main() {    
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    val lengthsList = words.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars:")
    println(lengthsList)
//sampleEnd
}
```
{kotlin-runnable="true"}

运行此代码时，您会看到 `filter()` 和 `map()` 函数的执行顺序与它们在代码中出现的顺序相同。首先，对于所有元素都会看到 `filter:`，然后是筛选后剩余元素的 `length:`，最后是最后两行的输出。

列表处理过程如下所示：

![列表处理](list-processing.svg)

### 序列 {id="sequence"}

现在让我们用序列编写相同的逻辑：

```kotlin

fun main() {
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    // 将 List 转换为 Sequence
    val wordsSequence = words.asSequence()

    val lengthsSequence = wordsSequence.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars")
    // 终端操作：以 List 形式获取结果
    println(lengthsSequence.toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

此代码的输出表明，仅在构建结果列表时才会调用 `filter()` 和 `map()` 函数。
因此，您会首先看到文本行 `"Lengths of.."`，然后序列处理才开始。
请注意，对于过滤后留下的元素，在筛选下一个元素之前就已执行了 map。
当结果大小达到 4 时，处理停止，因为这是 `take(4)` 所能返回的最大大小。

序列处理过程如下所示：

![序列处理](sequence-processing.svg) {width="700"}

在此示例中，与使用列表的方式相比，延迟处理元素并在找到四个元素后停止减少了操作次数。