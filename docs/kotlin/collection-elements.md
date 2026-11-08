[//]: # (title: 检索单个元素)

Kotlin 集合提供了一组用于从集合中检索单个元素的函数。
本页描述的函数既适用于列表（List），也适用于 set。

正如[列表的定义](collections-overview.md)所述，列表是有序集合。
因此，列表中的每个元素都有可用于引用的位置。
除了本页描述的函数外，列表还提供了更多通过索引检索和搜索元素的方法。
详细信息请参阅[列表专有操作](list-operations.md)。

相对而言，根据[定义](collections-overview.md)，set 并不是有序集合。
但是，Kotlin 的 `Set` 按特定顺序存储元素。
这些顺序可以是插入顺序（在 `LinkedHashSet` 中）、自然排序顺序（在 `SortedSet` 中）或其他顺序。
set 中元素的顺序也可能是未知的。
在这种情况下，元素依然以某种方式排序，因此依赖元素位置的函数仍然会返回其结果。
但是，调用者无法预测这些结果，除非他们知道所使用的具体 `Set` 实现。

## 按位置检索 {id="retrieve-by-position"}

要检索特定位置的元素，可以使用函数 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html)。
传入一个整数作为实参来调用它，你将获得给定位置上的集合元素。
第一个元素的位置为 `0`，最后一个元素的位置为 `(size - 1)`。
 
`elementAt()` 对于未提供索引访问或在静态类型上未知是否提供索引访问的集合非常有用。
对于 `List`，使用[索引访问运算符](list-operations.md#retrieve-elements-by-index)（`get()` 或 `[]`）更为符合习惯。

```kotlin

fun main() {
//sampleStart
    val numbers = linkedSetOf("one", "two", "three", "four", "five")
    println(numbers.elementAt(3))    

    val numbersSortedSet = sortedSetOf("one", "two", "three", "four")
    println(numbersSortedSet.elementAt(0)) // 元素按升序存储
//sampleEnd
}
```
{kotlin-runnable="true"}

还有用于检索集合的第一个和最后一个元素的实用别名：[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
与 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.first())    
    println(numbers.last())    
//sampleEnd
}
```
{kotlin-runnable="true"}

要在检索不存在位置的元素时避免异常，请使用 `elementAt()` 的安全变体：

* [`elementAtOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-null.html) 当指定位置超出集合边界时返回 null。
* [`elementAtOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-else.html) 额外接受一个 lambda 函数，该函数将一个 `Int` 实参映射为集合元素类型的实例。
   当以越界位置调用时，`elementAtOrElse()` 会返回对给定值调用 lambda 的结果。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.elementAtOrNull(5))
    println(numbers.elementAtOrElse(5) { index -> "The value for index $index is undefined"})
//sampleEnd
}
```
{kotlin-runnable="true"}

## 按条件检索 {id="retrieve-by-condition"}

函数 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 和 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
还允许你在集合中搜索与给定谓词匹配的元素。当使用测试集合元素的谓词调用 `first()` 时，你将获得使谓词返回 `true` 的第一个元素。
反之，带有谓词的 `last()` 返回与其匹配的最后一个元素。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.first { it.length > 3 })
    println(numbers.last { it.startsWith("f") })
//sampleEnd
}
```
{kotlin-runnable="true"}

如果没有元素匹配谓词，这两个函数都会抛出异常。
为避免抛出异常，请改用 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
和 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)：
如果未找到匹配的元素，它们将返回 `null`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.firstOrNull { it.length > 6 })
//sampleEnd
}
```
{kotlin-runnable="true"}

如果这些别名的名称更契合你的场景，可以使用它们：

* 使用 [`find()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find.html) 代替 `firstOrNull()`
* 使用 [`findLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find-last.html) 代替 `lastOrNull()`

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.find { it % 2 == 0 })
    println(numbers.findLast { it % 2 == 0 })
//sampleEnd
}
```
{kotlin-runnable="true"}

## 使用选择器检索 {id="retrieve-with-selector"}

如果在检索元素之前需要对集合进行映射，可以使用函数 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html)。
它结合了 2 种操作：
- 使用选择器函数映射集合
- 返回结果中的第一个非 null 值

如果结果集合中没有非空元素，`firstNotNullOf()` 会抛出 `NoSuchElementException`。
在这种情况下，可使用其对应函数 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html)
返回 null。

```kotlin
fun main() {
//sampleStart
    val list = listOf<Any>(0, "true", false)
    // 将每个元素转换为字符串，并返回符合所需长度的第一个元素
    val longEnough = list.firstNotNullOf { item -> item.toString().takeIf { it.length >= 4 } }
    println(longEnough)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## 随机元素 {id="random-element"}

如果需要检索集合中的任意元素，请调用 [`random()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html) 函数。
你可以在不传实参的情况下调用它，也可以传入一个 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html)
对象作为随机源。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.random())
//sampleEnd
}
```
{kotlin-runnable="true"}

在空集合上，`random()` 会抛出异常。若要改用接收 `null` 的方式，请使用 [`randomOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random-or-null.html)。

## 检查元素是否存在 {id="check-element-existence"}

要检查集合中是否存在某个元素，请使用 [`contains()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains.html) 函数。
如果存在与函数实参 `equals()` 的集合元素，它将返回 `true`。
你可以使用 `in` 关键字以运算符形式调用 `contains()`。

要同时检查多个实例是否存在，请调用 [`containsAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-all.html)，并将这些实例的集合作为实参传入。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.contains("four"))
    println("zero" in numbers)
    
    println(numbers.containsAll(listOf("four", "two")))
    println(numbers.containsAll(listOf("one", "zero")))
//sampleEnd
}
```
{kotlin-runnable="true"}

此外，你可以通过调用 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-empty.html)
或 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 来检查集合是否包含任何元素。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.isEmpty())
    println(numbers.isNotEmpty())
    
    val empty = emptyList<String>()
    println(empty.isEmpty())
    println(empty.isNotEmpty())
//sampleEnd
}
```
{kotlin-runnable="true"}