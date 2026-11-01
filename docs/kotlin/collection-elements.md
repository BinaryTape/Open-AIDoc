[//]: # (title: 检索单个元素)

Kotlin 集合提供了一组用于从集合中检索单个元素的函数。
本页介绍的函数既适用于 list 也适用于 set。

正如 [list 的定义](collections-overview.md)所述，list 是一种有序集合。
因此，list 的每个元素都有其位置，可用于对其进行引用。
除了本页介绍的函数之外，list 还提供了更多按索引检索和搜索元素的方法。
有关更多详细信息，请参阅 [List 特有操作](list-operations.md)。

反之，根据[定义](collections-overview.md)，set 并不是有序集合。
然而，Kotlin 的 `Set` 按特定顺序存储元素。
这些顺序可以是插入顺序（在 `LinkedHashSet` 中）、自然排序顺序（在 `SortedSet` 中）或其他顺序。
一组元素的顺序也可以是未知的。
在这些情况下，元素仍然以某种方式排列，因此依赖元素位置的函数仍会返回其结果。
然而，除非调用者知道所使用的具体 `Set` 实现，否则此类结果是不可预测的。

## 按位置检索 {id="retrieve-by-position"}

如需检索特定位置的元素，可以使用函数 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html)。
调用该函数并传入一个整数作为实参，你将获得给定位置的集合元素。
第一个元素的位置是 `0`，最后一个元素的位置是 `(size - 1)`。
 
`elementAt()` 对于不提供索引访问、或在静态层面未知是否提供索引访问的集合非常有用。
对于 `List`，更符合惯用语的做法是使用[索引访问运算符](list-operations.md#retrieve-elements-by-index)（`get()` 或 `[]`）。

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

还有用于检索集合的第一个和最后一个元素的有用别名：[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
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

为避免在检索不存在的位置上的元素时出现异常，请使用 `elementAt()` 的安全变体：

* 当指定位置超出集合边界时，[`elementAtOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-null.html) 返回 null。
* [`elementAtOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-else.html) 额外接受一个将 `Int` 实参映射为集合元素类型实例的 lambda 函数。
   当使用越界位置调用时，`elementAtOrElse()` 返回对给定值执行 lambda 的结果。

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
还允许你在集合中搜索与给定谓词匹配的元素。使用测试集合元素的谓词调用 `first()` 时，你将收到使该谓词返回 `true` 的第一个元素。
反之，带谓词的 `last()` 返回与其匹配的最后一个元素。

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

如果没有元素与谓词匹配，这两个函数都会抛出异常。
为了避免出现异常，请改用 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
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

如果别名的名称更符合你的场景，请使用这些别名：

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

如果需要在检索元素之前映射集合，可以使用函数 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html)。
它结合了 2 个操作：
- 使用选择器函数映射集合
- 返回结果中的第一个非 null 值

如果结果集合中没有非可空元素，`firstNotNullOf()` 将抛出 `NoSuchElementException`。 
在这种情况下，请使用对应的 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 
来返回 null。

```kotlin
fun main() {
//sampleStart
    val list = listOf<Any>(0, "true", false)
    // 将每个元素转换为字符串，并返回第一个达到所需长度的元素
    val longEnough = list.firstNotNullOf { item -> item.toString().takeIf { it.length >= 4 } }
    println(longEnough)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## 随机元素 {id="random-element"}

如果需要检索集合中的任意元素，请调用 [`random()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html) 函数。
你可以在不带实参的情况下调用它，也可以传入一个 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html)
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

在空集合上，`random()` 会抛出异常。若要改为接收 `null`，请使用 [`randomOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random-or-null.html)

## 检查元素是否存在 {id="check-element-existence"}

要检查集合中是否存在某个元素，请使用 [`contains()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains.html) 函数。
如果存在与函数实参 `equals()` 的集合元素，它将返回 `true`。
你可以使用带有 `in` 关键字的运算符形式来调用 `contains()`。

若要同时检查多个实例是否存在，请调用 [`containsAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-all.html)，
并将包含这些实例的集合作为实参传入。

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

此外，你还可以通过调用 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-empty.html)
或 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 来检查集合中是否包含任何元素。

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