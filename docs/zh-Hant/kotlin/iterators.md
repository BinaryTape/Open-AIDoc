[//]: # (title: 迭代集合)

若要遍歷集合元素，Kotlin 標準函式庫支援常用的*迭代器 (iterator)* 機制——在不暴露集合底層結構的情況下，依序存取元素的物件。當你需要逐一處理集合中的所有元素時（例如列印值或對它們進行類似的更新），迭代器非常有用。

對於 [`Iterable<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html) 介面的繼承者（包括 `Set` 與 `List`），可以透過呼叫 [`iterator()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/iterator.html) 函式來取得迭代器。

一旦取得迭代器，它會指向集合的第一個元素；呼叫 [`next()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterator/next.html) 函式會傳回該元素，並將迭代器位置移動到下一個元素（如果存在）。

一旦迭代器越過最後一個元素，就無法再用來擷取元素，也無法重設回先前的任何位置。若要再次迭代該集合，請建立一個新的迭代器。

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

另一種遍歷 `Iterable` 集合的方式是眾所皆知的 `for` 迴圈。在集合上使用 `for` 時，你會隱式取得迭代器。因此，下列程式碼等同於上述範例：

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

最後，還有一個實用的 `forEach()` 函式，可讓你自動迭代集合並對每個元素執行指定的程式碼。因此，同一個範例如下所示：

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

對於 List，有一種特殊的迭代器實作：[`ListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/index.html)。它支援雙向迭代 List：向前與向後。

向後迭代是由 [`hasPrevious()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/has-previous.html) 與 [`previous()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous.html) 函式所實作。此外，`ListIterator` 透過 [`nextIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/next-index.html) 與 [`previousIndex()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list-iterator/previous-index.html) 函式提供有關元素索引的資訊。

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

具備雙向迭代的能力，意味著 `ListIterator` 在到達最後一個元素後仍然可以使用。

## 可變迭代器 {id="mutable-iterators"}

若要迭代可變集合，可以使用 [`MutableIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/index.html)，它擴充了 `Iterator` 並新增元素移除函式 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-iterator/remove.html)。因此，你可以在迭代集合時從中移除元素。 

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

除了移除元素之外，[`MutableListIterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/index.html) 還可以在迭代 List 時，透過 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/add.html) 與 [`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list-iterator/set.html) 函式插入與取代元素。

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