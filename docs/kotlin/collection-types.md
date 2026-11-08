[//]: # (title: 集合类型)

Kotlin 提供了三种主要的集合类型：[List](#list)、[Set](#set) 与 [Map](#map)。
请根据存储和访问数据的方式来选择集合类型。

## List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 按指定顺序存储元素，并提供对这些元素的索引访问。索引从 0 开始，到 `lastIndex` 结束，即 `(list.size - 1)`。列表中可以包含重复元素，包括对同一对象的多次引用。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println("Number of elements: ${numbers.size}")
    // Number of elements: 4
    
    println("Third element: ${numbers.get(2)}")
    // Third element: three
    
    println("Fourth element: ${numbers[3]}")
    // Fourth element: four

    println("Index of element \"two\": ${numbers.indexOf("two")}")
    // Index of element "two": 1
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 索引访问的性能取决于具体的列表实现。处理列表的所有元素时，相比通过索引重复访问元素，更推荐使用迭代。
>
{style="tip"}

如果两个列表的大小相同，且在相同位置上的元素[结构相等](equality.md#structural-equality)，则这两个列表相等：

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
//sampleStart
    val bob = Person("Bob", 31)
    val people = listOf(Person("Adam", 20), bob, bob)
    val people2 = listOf(Person("Adam", 20), Person("Bob", 31), bob)
    
    println(people == people2)
    // true
    
    bob.age = 32
    println(people == people2)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) 是具有列表专用写操作的 `List`。与[数组](arrays.md)不同，可变列表在添加或移除元素时可以改变大小。
你还可以替换特定位置上的元素。例如：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    // 向列表中添加一个元素
    numbers.add(5)
    // 移除索引为 1 的元素
    numbers.removeAt(1)
    // 替换索引为 0 的元素
    numbers[0] = 0
    
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`MutableList` 的默认实现是 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)。

## Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) 存储唯一的元素。`Set<T>` 接口不保证迭代顺序，具体顺序取决于实现。如果元素类型可空且其实现支持 `null`，则一个 Set 中最多只能包含一个 `null` 元素。

如果两个 Set 的大小相同，且其中一个 Set 的每个元素都在另一个 Set 中具有相等的元素，则这两个 Set 相等：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)
    println("Number of elements: ${numbers.size}")
    // Number of elements: 4
    
    if (numbers.contains(1)) println("1 is in the set")
    // 1 is in the set

    val numbersBackwards = setOf(4, 3, 2, 1)
    println("The sets are equal: ${numbers == numbersBackwards}")
    // The sets are equal: true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableSet<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) 是带有来自 `MutableCollection` 写操作的 `Set`。

[`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) 是 `MutableSet` 的默认实现。它保留了元素的插入顺序。因此，像 `first()` 和 `last()` 这样依赖顺序的函数会返回可预测的结果：

```kotlin
fun main() {
//sampleStart
    // LinkedHashSet 是默认实现
    val numbers = setOf(1, 2, 3, 4)
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    // false
    
    println(numbers.first() == numbersBackwards.last())
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果你不需要可预测的迭代顺序，可以使用另一种实现 [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html)，它比 `LinkedHashSet` 占用更少的内存。由于它不保证迭代顺序，因此不能依赖 `first()` 或 `last()` 按插入顺序返回元素。

## Map {id="map"}

尽管 [`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) 不是 `Collection` 接口的继承者，但它仍是 Kotlin 集合类型。
`Map` 存储*键值对*或*条目*（entry）。键是唯一的，但不同的键可以与相等的值配对。
`Map` 接口提供了特定函数，例如按键访问值、搜索键和值等。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    // All keys: [key1, key2, key3, key4]
    
    println("All values: ${numbersMap.values}")
    // All values: [1, 2, 3, 1]
    
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")
    // Value by key "key2": 2
    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    // The value 1 is in the map
    
    // 使用 containsValue() 检查值，等同于前面的条件
    if (numbersMap.containsValue(1)) println("The value 1 is in the map")
    // The value 1 is in the map
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果键类型可空且其实现支持 `null` 键，则一个 Map 中最多只能包含一个 `null` 键。
对 `null` 值的支持同样取决于值类型和具体实现。

如果两个 Map 包含相同的键值对，则这两个 Map 相等，无论顺序如何：

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
    // The maps are equal: true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableMap<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) 是具有 Map 专用写操作的 `Map`。例如，你可以添加新的键值对或更新与给定键关联的值：

```kotlin
fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    numbersMap["one"] = 11

    println(numbersMap)
    // {one=11, two=2, three=3}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) 是 `MutableMap` 的默认实现。它保留了插入条目的顺序。相应地，[`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) 是另一种不保证其条目顺序的实现。

## ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) 是双端队列的实现。它允许你在双端队列的开头或末尾添加或移除元素。在 Kotlin 中，`ArrayDeque` 还同时扮演着栈和队列数据结构的角色。
`ArrayDeque` 将其元素存储在大小可调的数组中：

```kotlin
fun main() {
    val deque = ArrayDeque(listOf(1, 2, 3))

    deque.addFirst(0)
    deque.addLast(4)
    println(deque)
    // [0, 1, 2, 3, 4]

    println(deque.first())
    // 0
    
    println(deque.last())
    // 4

    deque.removeFirst()
    deque.removeLast()
    println(deque)
    // [1, 2, 3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}