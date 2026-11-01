[//]: # (title: 构造集合)

## 由元素构造 {id="construct-from-elements"}

创建集合最常用的方式是使用标准库函数 [`listOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html)、[`setOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html)、[`mutableListOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html)、[`mutableSetOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html)。如果提供以逗号分隔的集合元素列表作为实参，编译器会自动检测元素类型。创建空集合时，请显式指定类型。

```kotlin
val numbersSet = setOf("one", "two", "three", "four")
val emptySet = mutableSetOf<String>()
```

类似的功能也适用于 Map，可以使用函数 [`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 与 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html)。Map 的键和值作为 `Pair` 对象传递（通常使用中缀函数 `to` 创建）。

```kotlin
val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
```

请注意，`to` 表示法会创建一个短期的 `Pair` 对象，因此建议仅在对性能要求不严苛的情况下使用它。为了避免过度的内存占用，可以使用其他替代方法。例如，你可以创建一个可变 Map，并通过写入操作填充它。[`apply()`](scope-functions.md#apply) 函数有助于在此保持流畅的初始化书写。

```kotlin
val numbersMap = mutableMapOf<String, String>().apply { this["one"] = "1"; this["two"] = "2" }
```

## 使用集合构建器函数创建 {id="create-with-collection-builder-functions"}

创建集合的另一种方式是调用构建器函数——[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html)、[`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html) 或 [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html)。它们会创建一个对应类型的新可变集合，使用[写入操作](collection-write.md)填充元素，并返回包含相同元素的只读集合：

```kotlin
val map = buildMap { // 这是一个 MutableMap<String, Int>，键和值的类型根据下方的 `put()` 调用推断得出
    put("a", 1)
    put("b", 0)
    put("c", 4)
}

println(map) // {a=1, b=0, c=4}
```

## 空集合 {id="empty-collections"}

还有一些用于创建没有任何元素的集合的函数：[`emptyList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-list.html)、[`emptySet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-set.html) 以及 [`emptyMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-map.html)。创建空集合时，应指定集合将容纳的元素类型。

```kotlin
val empty = emptyList<String>()
```

## List 的初始化函数 {id="initializer-functions-for-lists"}

对于 List，有一个类似构造函数的函数，它接受列表大小以及一个根据索引定义元素值的初始化函数。

```kotlin
fun main() {
//sampleStart
    val doubled = List(3, { it * 2 })  // 如果稍后想更改其内容，可以使用 MutableList
    println(doubled)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 具体类型的构造函数 {id="concrete-type-constructors"}

要创建具体类型的集合（如 `ArrayList` 或 `LinkedList`），可以使用这些类型提供的构造函数。`Set` 和 `Map` 的实现也提供了类似的构造函数。

```kotlin
val linkedList = LinkedList<String>(listOf("one", "two", "three"))
val presizedSet = HashSet<Int>(32)
```

## 复制 {id="copy"}

要创建一个与现有集合元素相同的集合，可以使用复制函数。标准库中的集合复制函数会创建引用相同元素的*浅拷贝*集合。因此，对某个集合元素所做的更改会反映在其所有副本中。

诸如 [`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`toMutableList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-mutable-list.html)、[`toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 等集合复制函数会在特定时刻创建集合的快照。其结果是一个包含相同元素的新集合。如果从原集合中添加或移除元素，不会影响副本。副本也可以独立于原集合进行修改。

```kotlin
class Person(var name: String)
fun main() {
//sampleStart
    val alice = Person("Alice")
    val sourceList = mutableListOf(alice, Person("Bob"))
    val copyList = sourceList.toList()
    sourceList.add(Person("Charles"))
    alice.name = "Alicia"
    println("First item's name is: ${sourceList[0].name} in source and ${copyList[0].name} in copy")
    println("List size is: ${sourceList.size} in source and ${copyList.size} in copy")
//sampleEnd
}
```
{kotlin-runnable="true"}

这些函数还可用于将集合转换为其他类型，例如由 List 构建 Set，反之亦然。

```kotlin
fun main() {
//sampleStart
    val sourceList = mutableListOf(1, 2, 3)    
    val copySet = sourceList.toMutableSet()
    copySet.add(3)
    copySet.add(4)    
    println(copySet)
//sampleEnd
}
```
{kotlin-runnable="true"}

或者，你也可以创建指向同一个集合实例的新引用。当使用现有集合初始化集合变量时，就会创建新的引用。因此，当通过某个引用更改该集合实例时，所做的更改会反映在其所有引用中。

```kotlin
fun main() {
//sampleStart
    val sourceList = mutableListOf(1, 2, 3)
    val referenceList = sourceList
    referenceList.add(4)
    println("Source size: ${sourceList.size}")
//sampleEnd
}
```
{kotlin-runnable="true"}

集合初始化可用于限制可变性。例如，如果你创建了一个指向 `MutableList` 的 `List` 引用，当你尝试通过此引用修改集合时，编译器会报错。

```kotlin
fun main() {
//sampleStart 
    val sourceList = mutableListOf(1, 2, 3)
    val referenceList: List<Int> = sourceList
    //referenceList.add(4)            // 编译错误
    sourceList.add(4)
    println(referenceList) // 显示 sourceList 的当前状态
//sampleEnd
}
```
{kotlin-runnable="true"}

## 在其他集合上调用函数 {id="invoke-functions-on-other-collections"}

集合也可以通过对其他集合进行各种操作来创建。例如，[过滤](collection-filtering.md)列表会创建一个由符合筛选条件的元素组成的新列表：

```kotlin
fun main() {
//sampleStart 
    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)
//sampleEnd
}
```
{kotlin-runnable="true"}

[映射](collection-transformations.md#map)会根据转换结果生成一个列表：

```kotlin
fun main() {
//sampleStart 
    val numbers = setOf(1, 2, 3)
    println(numbers.map { it * 3 })
    println(numbers.mapIndexed { idx, value -> value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

[关联](collection-transformations.md#associate)会生成 Map：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

要了解更多信息，请参阅[集合操作概述](collection-operations.md)。