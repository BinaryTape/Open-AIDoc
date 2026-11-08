[//]: # (title: 序列)

除集合外，Kotlin 标准库还包含另一种类型——_序列_ ([`Sequence<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence/index.html))。
与集合不同，序列并不包含元素，而是在迭代时生成它们。
序列提供了与 [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) 相同的函数，但对多步集合处理采用了另一种方式。

当 `Iterable` 的处理包含多个步骤时，它们是急切（eagerly）执行的：每个处理步骤都会完成并返回其结果——一个中间集合。后续步骤在此集合上执行。而序列的多步处理则尽可能惰性（lazily）执行：只有在请求整个处理链的结果时，才会进行实际计算。

操作的执行顺序也有所不同：`Sequence` 针对每一个单独的元素逐个执行所有处理步骤。而 `Iterable` 则是对整个集合完成每个步骤后，再继续执行下一个步骤。

因此，序列使你能够避免构建中间步骤的结果，从而提高整个集合处理链的性能。然而，序列的惰性特性会带来一些开销，在处理较小的集合或进行较简单的计算时，这种开销可能会很明显。因此，你应该同时考虑 `Sequence` 与 `Iterable`，并根据你的具体情况决定哪一种更合适。

## 构造 {id="construct"}

### 从元素构造 {id="from-elements"}

要创建序列，可调用 [`sequenceOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence-of.html) 函数，并将元素作为其实参列出。

```kotlin
val numbersSequence = sequenceOf("four", "three", "two", "one")
```

### 从 Iterable 构造 {id="from-an-iterable"}

如果你已经拥有一个 `Iterable` 对象（例如 `List` 或 `Set`），可以通过调用 [`asSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-sequence.html) 从中创建序列。

```kotlin
val numbers = listOf("one", "two", "three", "four")
val numbersSequence = numbers.asSequence()

```

### 从函数构造 {id="from-a-function"}

创建序列的另一种方法是通过计算其元素的函数来构建它。
要基于函数构建序列，可以调用 [`generateSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/generate-sequence.html)，并将该函数作为实参传入。此外，你还可以选择将第一个元素指定为显式值或函数调用的结果。
当所提供的函数返回 `null` 时，序列生成便会停止。因此，下面示例中的序列是无限的。

```kotlin

fun main() {
//sampleStart
    val oddNumbers = generateSequence(1) { it + 2 } // `it` 是上一个元素
    println(oddNumbers.take(5).toList())
    //println(oddNumbers.count())     // 错误：该序列是无限的
//sampleEnd
}
```
{kotlin-runnable="true"}

要使用 `generateSequence()` 创建有限序列，需提供一个在生成所需最后一个元素后返回 `null` 的函数。

```kotlin

fun main() {
//sampleStart
    val oddNumbersLessThan10 = generateSequence(1) { if (it < 8) it + 2 else null }
    println(oddNumbersLessThan10.count())
//sampleEnd
}
```
{kotlin-runnable="true"}

### 从分块构造 {id="from-chunks"}

最后，还有一个函数允许你逐个或按任意大小的分块来生成序列元素——即 [`sequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence.html) 函数。
该函数接受一个包含 [`yield()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield.html) 和 [`yieldAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield-all.html) 函数调用的 lambda表达式。
它们向序列消费者返回一个元素，并暂停 `sequence()` 的执行，直到消费者请求下一个元素。`yield()` 接受单个元素作为实参；`yieldAll()` 可以接受 `Iterable` 对象、`Iterator` 或另一个 `Sequence`。作为 `yieldAll()` 实参的 `Sequence` 可以是无限的。但是，此类调用必须放在最后：其后的所有调用都将永远不会执行。

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

根据对状态的要求，序列操作可以分为以下几组：

* _无状态（Stateless）_ 操作不需要状态，独立处理每个元素，例如 [`map()`](collection-transformations.md#map) 或 [`filter()`](collection-filtering.md)。无状态操作也可以需要少量恒定状态来处理元素，例如 [`take()` 或 `drop()`](collection-parts.md)。
* _有状态（Stateful）_ 操作需要大量状态，通常与序列中的元素数量成正比。

如果某个序列操作返回另一个延迟生成的序列，则称其为_中间（intermediate）_操作。否则，该操作为_末端（terminal）_操作。末端操作的示例包括 [`toList()`](constructing-collections.md#copy) 或 [`sum()`](collection-aggregate.md)。序列元素只能通过末端操作检索。

序列可以被多次迭代；但是，某些序列实现可能会限制自身只能迭代一次。这会在其各自的文档中特别说明。

## 序列处理示例 {id="sequence-processing-example"}

我们通过一个示例来看看 `Iterable` 和 `Sequence` 之间的区别。 

### Iterable {id="iterable"}

假设你有一个单词列表。以下代码筛选出长度大于三个字符的单词，并打印前四个满足条件的单词长度。

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

运行此代码时，你会看到 `filter()` 和 `map()` 函数按照它们在代码中出现的顺序执行。首先，你会看到针对所有元素的 `filter:`，然后是针对筛选后保留元素的 `length:`，最后是最后两行的输出。 

列表处理过程如下：

![列表处理](list-processing.svg)

### Sequence {id="sequence"}

现在我们用序列来实现相同的功能：

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
    // 末端操作：以 List 形式获取结果
    println(lengthsSequence.toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

该代码的输出表明，只有在构建结果列表时才会调用 `filter()` 和 `map()` 函数。因此，首先会看到文本行 `"Lengths of.."`，然后序列处理才开始。注意，对于筛选后保留的元素，map 会在筛选下一个元素之前执行。当结果大小达到 4 时，处理停止，因为这是 `take(4)` 能返回的最大可能大小。

序列处理过程如下所示：

![序列处理](sequence-processing.svg) {width="700"}

在此示例中，与使用列表的方式相比，元素的延迟处理以及找到四个元素后即停止的机制减少了操作次数。