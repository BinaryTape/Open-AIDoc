[//]: # (title: 集合概述)

Kotlin 标准库提供了一套全面的工具来管理**集合**（_collections_）——对于待解决的问题意义重大且经常被操作的可变数量项（可能为零）的组合。

集合是大多数编程语言中的常见概念，因此如果您熟悉（例如）Java 或 Python 的集合，可以跳过本篇介绍并直接阅读详细章节。

集合通常包含若干相同类型（及其子类型）的对象。集合中的对象被称为**元素**（_elements_）或**项**（_items_）。例如，一个系的所有学生构成一个集合，可用于计算他们的平均年龄。

以下是与 Kotlin 相关的集合类型：

* **List**（列表）是一个有序集合，可以通过索引（反映其位置的整数）访问元素。元素可以在列表中出现多次。电话号码就是列表的一个示例：它是一组数字，顺序很重要，并且可以重复。
* **Set**（集）是唯一元素的集合。它反映了集的数学抽象：一组没有重复项的对象。通常，Set 中元素的顺序没有意义。例如，彩票上的号码构成一个 Set：它们是唯一的，且顺序不重要。
* **Map**（映射，或**字典**）是一组键值对。键是唯一的，每个键正好映射到一个值。值可以重复。Map 适合用于存储对象之间的逻辑关联，例如员工的 ID 及其职位。

Kotlin 允许您独立于其中存储的对象确切类型来操作集合。换句话说，您将 `String` 添加到 `String` 列表中，与处理 `Int` 或用户自定义类的方式完全相同。因此，Kotlin 标准库提供了泛型接口、类和函数，用于创建、填充和管理任何类型的集合。

集合接口及其相关函数位于 `kotlin.collections` 包中。让我们对其内容进行一番了解。

> 数组不是一种集合类型。有关更多信息，请参阅[数组](arrays.md)。
>
{style="note"}

## 集合类型 {id="collection-types"}

Kotlin 标准库提供了基本集合类型的实现：Set、List 和 Map。每种集合类型都由一对接口表示：

* **只读**接口：提供用于访问集合元素的操作。
* **可变**接口：通过写入操作（添加、移除和更新其元素）扩展对应的只读接口。

请注意，可变集合不必赋值给 [`var`](basic-syntax.md#variables)。即使将可变集合赋值给 `val`，对其进行的写入操作仍然有效。将可变集合赋值给 `val` 的好处是，可以保护对该可变集合的引用不被修改。随着时间的推移，代码规模增长且变得更加复杂时，防止引用的无意修改就变得尤为重要。请尽可能多使用 `val`，以使代码更安全、更健壮。如果您尝试重新为 `val` 集合赋值，将会收到编译错误：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.add("five")   // 允许
    println(numbers)
    //numbers = mutableListOf("six", "seven")      // 编译错误
//sampleEnd

}
```
{kotlin-runnable="true"}

只读集合类型是[协变的](generics.md#variance)。这意味着如果 `Rectangle` 类继承自 `Shape`，则可以在需要 `List<Shape>` 的任何地方使用 `List<Rectangle>`。换句话说，集合类型具有与元素类型相同的子类型关系。Map 在值类型上是协变的，但在键类型上不是。

反过来，可变集合不是协变的；否则，会导致运行时失败。如果 `MutableList<Rectangle>` 是 `MutableList<Shape>` 的子类型，您就可以向其中插入其他 `Shape` 的继承者（例如 `Circle`），从而违背其 `Rectangle` 类型实参约束。

下面是 Kotlin 集合接口的层次结构图：

![集合接口层次结构](collections-diagram.png){width="500"}

让我们详细了解一下这些接口及其实现。若要了解 `Collection`，请阅读下文。若要了解 `List`、`Set` 和 `Map`，您可以阅读相应章节，或者观看 Kotlin 技术布道师 Sebastian Aigner 制作的视频：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

### Collection {id="collection"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 是集合层次结构的根接口。该接口表示只读集合的通用行为：检索大小、检查元素成员资格等。
`Collection` 继承自定义了元素迭代操作的 `Iterable<T>` 接口。您可以将 `Collection` 用作适用于不同集合类型的函数的形参。对于更具体的情况，请使用 `Collection` 的继承者：[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 和 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)。

```kotlin
fun printAll(strings: Collection<String>) {
    for(s in strings) print("$s ")
    println()
}
    
fun main() {
    val stringList = listOf("one", "two", "one")
    printAll(stringList)
    
    val stringSet = setOf("one", "two", "three")
    printAll(stringSet)
}
```
{kotlin-runnable="true"}

[`MutableCollection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-collection/index.html) 是具有写操作（例如 `add` 和 `remove`）的 `Collection`。

```kotlin
fun List<String>.getShortWordsTo(shortWords: MutableList<String>, maxLength: Int) {
    this.filterTo(shortWords) { it.length <= maxLength }
    // 剔除冠词
    val articles = setOf("a", "A", "an", "An", "the", "The")
    shortWords -= articles
}

fun main() {
    val words = "A long time ago in a galaxy far far away".split(" ")
    val shortWords = mutableListOf<String>()
    words.getShortWordsTo(shortWords, 3)
    println(shortWords)
}
```
{kotlin-runnable="true"}

### List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 以指定顺序存储元素，并提供对这些元素的索引访问支持。索引从零（第一个元素的索引）开始，一直到 `lastIndex`（即 `(list.size - 1)`）。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println("Number of elements: ${numbers.size}")
    println("Third element: ${numbers.get(2)}")
    println("Fourth element: ${numbers[3]}")
    println("Index of element \"two\" ${numbers.indexOf("two")}")
//sampleEnd
}
```
{kotlin-runnable="true"}

List 元素（包括 null）可以重复：一个列表可以包含任意数量的相同对象或单个对象的多次出现。如果两个列表具有相同的大小并在相同位置具有[结构相等](equality.md#structural-equality)的元素，则它们被视为相等。

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
//sampleStart
    val bob = Person("Bob", 31)
    val people = listOf(Person("Adam", 20), bob, bob)
    val people2 = listOf(Person("Adam", 20), Person("Bob", 31), bob)
    println(people == people2)
    bob.age = 32
    println(people == people2)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) 是具有特定于列表的写操作的 `List`，例如在特定位置添加或移除元素。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.add(5)
    numbers.removeAt(1)
    numbers[0] = 0
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

如您所见，在某些方面列表与数组非常相似。然而，存在一个重要的区别：数组的大小在初始化时确定且绝不会改变；反之，列表没有预定义的大小；列表的大小可以通过写操作（添加、更新或移除元素）进行改变。

在 Kotlin 中，`MutableList` 的默认实现是 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)，您可以将其视为一种大小可调的数组。

### Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) 存储唯一元素；它们的顺序通常是未定义的。`null` 元素也是唯一的：一个 `Set` 只能包含一个 `null`。如果两个 Set 具有相同的大小，并且对于一个 Set 中的每个元素在另一个 Set 中都存在相等的元素，则这两个 Set 相等。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)
    println("Number of elements: ${numbers.size}")
    if (numbers.contains(1)) println("1 is in the set")

    val numbersBackwards = setOf(4, 3, 2, 1)
    println("The sets are equal: ${numbers == numbersBackwards}")
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) 是带有来自 `MutableCollection` 的写操作的 `Set`。

`MutableSet` 的默认实现 —— [`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) —— 保留了元素插入的顺序。因此，依赖顺序的函数（如 `first()` 或 `last()`）在此类 Set 上会返回可预测的结果。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)  // LinkedHashSet 是默认实现
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    println(numbers.first() == numbersBackwards.last())
//sampleEnd
}
```
{kotlin-runnable="true"}

另一种替代实现 —— [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html) —— 对元素顺序没有任何保证，因此对其调用此类函数会返回不可预测的结果。但是，`HashSet` 存储相同数量的元素所需的内存更少。

### Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) 不是 `Collection` 接口的继承者；但它也是一种 Kotlin 集合类型。`Map` 存储**键值对**（或**条目**）；键是唯一的，但不同的键可以与相同的值配对。`Map` 接口提供了特定函数，例如按键访问值、搜索键和值等。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    println("All values: ${numbersMap.values}")
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    if (numbersMap.containsValue(1)) println("The value 1 is in the map") // 与前一行相同
//sampleEnd
}
```
{kotlin-runnable="true"}

包含相等键值对的两个 Map 是相等的，无论键值对的顺序如何。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) 是具有 Map 写操作的 `Map`，例如，您可以添加新的键值对或更新与给定键关联的值。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    numbersMap["one"] = 11

    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`MutableMap` 的默认实现 —— [`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) —— 在迭代 Map 时会保留元素插入的顺序。反之，另一种替代实现 —— [`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) —— 对元素顺序没有任何保证。

### ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) 是双端队列的实现，它允许您在队列的开头或结尾添加或移除元素。因此，`ArrayDeque` 在 Kotlin 中同时充当了栈（Stack）和队列（Queue）数据结构的角色。在底层，`ArrayDeque` 使用可调大小的数组实现，该数组会在需要时自动调整大小：

```kotlin
fun main() {
    val deque = ArrayDeque(listOf(1, 2, 3))

    deque.addFirst(0)
    deque.addLast(4)
    println(deque) // [0, 1, 2, 3, 4]

    println(deque.first()) // 0
    println(deque.last()) // 4

    deque.removeFirst()
    deque.removeLast()
    println(deque) // [1, 2, 3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}