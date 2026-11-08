[//]: # (title: 遍历集合)

为了遍历集合元素，Kotlin 标准库支持常用的*迭代器*（iterator）机制——这类对象提供对元素的顺序访问，而无需公开集合的底层结构。当你需要逐个处理集合的所有元素时（例如打印值或对其进行类似的更新），迭代器非常有用。

对于 [`Iterable<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) 接口的继承者（包括 `Set` 与 `List`），可以通过调用 [`iterator()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/iterator.html) 函数来获取迭代器。

获取迭代器后，它会指向集合的第一个元素；调用 [`next()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterator/next.html) 函数将返回该元素，并将迭代器位置移动到下一个元素（如果存在）。

一旦迭代器遍历完最后一个元素，它就不能再用于检索元素，也无法重置到之前的任何位置。若要再次遍历该集合，需要创建一个新的迭代器。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val numbersIterator = numbers.iterator()
    while (numbersIterator.hasNext()) {
        println(numbersIterator.next())
        // one
        // two
        // three
        // four
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

遍历 `Iterable` 集合的另一种方式是众所周知的 `for` 循环。在集合上使用 `for` 时，会隐式获取迭代器。因此，以下代码与上面的示例等效：

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    for (item in numbers) {
        println(item)
        // one
        // two
        // three
        // four
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

最后，还有一个非常实用的 `forEach()` 函数，它允许你自动遍历集合并为每个元素执行给定的代码。因此，同一个示例也可以写作：

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    numbers.forEach {
        println(it)
        // one
        // two
        // three
        // four
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## List 迭代器 {id="list-iterators"}

对于列表，有一种特殊的迭代器实现：[`ListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/index.html)。它支持双向遍历列表：向前与向后。

反向遍历由函数 [`hasPrevious()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/has-previous.html) 和 [`previous()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous.html) 实现。此外，`ListIterator` 还通过函数 [`nextIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/next-index.html) 和 [`previousIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous-index.html) 提供有关元素索引的信息。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val listIterator = numbers.listIterator()
    while (listIterator.hasNext()) listIterator.next()
    println("Iterating backwards:")
    // Iterating backwards:
    while (listIterator.hasPrevious()) {
        print("Index: ${listIterator.previousIndex()}")
        println(", value: ${listIterator.previous()}")
        // Index: 3, value: four
        // Index: 2, value: three
        // Index: 1, value: two
        // Index: 0, value: one
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

具备双向遍历的能力，意味着 `ListIterator` 在到达最后一个元素后仍可继续使用。

## 可变迭代器 {id="mutable-iterators"}

对于遍历可变集合，提供了 [`MutableIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/index.html)，它扩展了 `Iterator`，并添加了元素移除函数 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/remove.html)。因此，你可以在遍历集合的同时从中移除元素。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four") 
    val mutableIterator = numbers.iterator()
    
    mutableIterator.next()
    mutableIterator.remove()    
    println("After removal: $numbers")
    // After removal: [two, three, four]
//sampleEnd
}
```
{kotlin-runnable="true"}

除了移除元素之外，[`MutableListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/index.html) 还可以在遍历列表时使用 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/add.html) 和 [`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/set.html) 函数插入与替换元素。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "four", "four") 
    val mutableListIterator = numbers.listIterator()
    
    mutableListIterator.next()
    mutableListIterator.add("two")
    println(numbers)
    // [one, two, four, four]
    mutableListIterator.next()
    mutableListIterator.set("three")   
    println(numbers)
    // [one, two, three, four]
//sampleEnd
}
```
{kotlin-runnable="true"}