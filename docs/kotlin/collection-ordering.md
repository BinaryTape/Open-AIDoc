[//]: # (title: 排序)

元素的顺序是某些集合类型的重要特征。
例如，如果两个列表包含相同的元素，但元素的排序不同，则这两个列表不相等。

在 Kotlin 中，可以通过多种方式定义对象的顺序。

首先是*自然顺序*（natural order）。它是为 [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) 接口的实现所定义的。在未指定其他顺序时，自然顺序用于对它们进行排序。

大多数内置类型都是可比较的：

* 数字类型使用传统的数值顺序：`1` 大于 `0`；`-3.4f` 大于 `-5f`，依此类推。
* `Char` 与 `String` 使用[字典顺序](https://en.wikipedia.org/wiki/Lexicographical_order)：`b` 大于 `a`；`world` 大于 `hello`。

要为用户定义类型定义自然顺序，请让该类型实现 `Comparable` 接口。
这需要实现 `compareTo()` 函数。`compareTo()` 必须接受另一个相同类型的对象作为实参，并返回一个整数值以指示哪个对象更大：

* 正值表示接收者对象更大。
* 负值表示它小于实参。
* 零表示对象相等。

以下是一个用于对由主要部分和次要部分组成版本进行排序的类。

```kotlin
class Version(val major: Int, val minor: Int): Comparable<Version> {
    override fun compareTo(other: Version): Int = when {
        this.major != other.major -> this.major compareTo other.major // 中缀形式的 compareTo()
        this.minor != other.minor -> this.minor compareTo other.minor
        else -> 0
    }
}

fun main() {    
    println(Version(1, 2) > Version(1, 3))
    println(Version(2, 0) > Version(1, 5))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

*自定义*顺序允许你按照喜欢的方式对任意类型的实例进行排序。
特别是，你可以为不可比较的对象定义顺序，或者为可比较类型定义自然顺序之外的顺序。
要为某种类型定义自定义顺序，请为其创建一个 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html)。
`Comparator` 包含 `compare()` 函数：它接受一个类的两个实例，并返回它们之间比较的整数结果。
该结果的解释方式与上述 `compareTo()` 的结果相同。

```kotlin
fun main() {
//sampleStart
    val lengthComparator = Comparator { str1: String, str2: String -> str1.length - str2.length }
    println(listOf("aaa", "bb", "c").sortedWith(lengthComparator))
//sampleEnd
}
```
{kotlin-runnable="true"}

有了 `lengthComparator`，你就可以根据字符串的长度对其进行排列，而不是使用默认的字典顺序。

定义 `Comparator` 的一种更简短的方法是使用标准库中的 [`compareBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.comparisons/compare-by.html) 函数。`compareBy()` 接受一个从实例生成 `Comparable` 值的 lambda 函数，并将自定义顺序定义为所生成值的自然顺序。

使用 `compareBy()` 时，上述示例中的长度比较器如下所示：

```kotlin
fun main() {
//sampleStart    
    println(listOf("aaa", "bb", "c").sortedWith(compareBy { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以基于多个条件定义顺序。
例如，若要按字符串长度排序，并在长度相同时按字母顺序排序，可以编写：

```kotlin
fun main() {
//sampleStart
    val sortedStrings = listOf("aaa", "bb", "c", "b", "a", "aa", "ccc")
        .sortedWith { a, b -> 
           when (val compareLengths = a.length.compareTo(b.length)) {
             0 -> a.compareTo(b)
             else -> compareLengths
           }
         }

    println(sortedStrings)
    // [a, b, c, aa, bb, aaa, ccc]
//sampleEnd
}
```
{kotlin-runnable="true"}

由于按多个条件排序是一个常见场景，Kotlin 标准库提供了 [`.thenBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/then-by.html) 函数，可用于添加次要排序规则。

例如，你可以将 `compareBy()` 与 `.thenBy()` 结合使用，先按字符串长度排序，再按字母顺序排序，就像前面的示例一样：

```kotlin
fun main() {
//sampleStart
    val sortedStrings = listOf("aaa", "bb", "c", "b", "a", "aa", "ccc")
        .sortedWith(compareBy<String> { it.length }.thenBy { it })

    println(sortedStrings)
    // [a, b, c, aa, bb, aaa, ccc]
//sampleEnd
}
```
{kotlin-runnable="true"}

Kotlin 集合包提供了用于按自然顺序、自定义顺序甚至随机顺序对集合进行排序的函数。
在本页面中，我们将介绍适用于[只读](collections-overview.md#collection-types)集合的排序函数。
这些函数将其结果作为新集合返回，其中包含按所请求顺序排列的原始集合元素。
要了解用于就地对[可变](collections-overview.md#collection-types)集合进行排序的函数，请参阅 [List 专属操作](list-operations.md#sort)。

## 自然顺序 {id="natural-order"}

基本函数 [`.sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) 和 [`.sortedDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-descending.html) 会根据集合元素的自然顺序，返回按升序和降序排列的元素序列。
这些函数适用于 `Comparable` 元素的集合。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println("Sorted ascending: ${numbers.sorted()}")
    println("Sorted descending: ${numbers.sortedDescending()}")
//sampleEnd
}
```
{kotlin-runnable="true"}

## 自定义顺序 {id="custom-orders"}
 
对于按自定义顺序排序或对不可比较的对象排序，提供了 [`.sortedBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by.html) 和 [`.sortedByDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by-descending.html) 函数。
它们接受一个将集合元素映射为 `Comparable` 值的选择器函数，并按这些值的自然顺序对集合进行排序。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val sortedNumbers = numbers.sortedBy { it.length }
    println("Sorted by length ascending: $sortedNumbers")
    val sortedByLast = numbers.sortedByDescending { it.last() }
    println("Sorted by the last letter descending: $sortedByLast")
//sampleEnd
}
```
{kotlin-runnable="true"}

要为集合排序定义自定义顺序，可以提供自己的 `Comparator`。
为此，请调用 [`.sortedWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-with.html) 扩展函数并传入你的 `Comparator`。
使用此函数，按长度对字符串排序如下所示：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println("Sorted by length ascending: ${numbers.sortedWith(compareBy { it.length })}")
//sampleEnd
}
```
{kotlin-runnable="true"}

## 检查排序顺序 {id="check-sorted-order"}

你可以使用以下扩展函数来检查元素是否已经遵循指定的顺序：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

如果元素按指定顺序排列或元素少于两个，这些扩展函数将返回 `true`。
一旦发现无序对，它们就会停止检查并返回 `false`。

对于不保证迭代顺序的集合（例如 `HashSet`），不同调用之间的结果可能会有所不同。
这同样适用于不按一致顺序生成元素的序列。
若要在各次调用中获得相同的结果，请仅在具有保证迭代顺序的集合（如 `List`）上使用这些函数。

在检查 `Double` 和 `Float` 值时，这些函数将 `NaN` 视为大于任何其他值，将 `-0.0` 视为小于 `0.0`。
此外，`.isSortedBy()` 和 `.isSortedByDescending()` 函数将 `null` 选择器结果视为小于任何非 null 值。

当你在序列上调用这些函数时，该操作是终端操作。
它会消费该序列以生成一个 `Boolean` 值，而不是返回另一个序列。

> 这些排序顺序函数也可用于数组、基本类型数组和无符号数组。
> 无符号数组及其操作是[实验性的](components-stability.md#stability-levels-explained)，需要使用 `@ExperimentalUnsignedTypes` 注解进行选择加入。
> 
{style="note"}

以下是使用 `.isSorted()` 和 `.isSortedBy()` 函数检查排序顺序的示例：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false

    val descending = listOf(4, 3, 2, 1)
    println(descending.isSortedDescending())
    // true
   
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

## 倒序 {id="reverse-order"}

你可以使用 [`.reversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reversed.html) 函数获取按倒序排列的集合。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.reversed())
//sampleEnd
}
```
{kotlin-runnable="true"}

`.reversed()` 扩展函数返回一个包含元素副本的新集合。
因此，如果你稍后更改原始集合，这不会影响先前获取的 `.reversed()` 结果。

另一个反转函数——[`.asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html)——返回同一个集合实例的反转视图，因此如果原始列表不会改变，它可能比 `.reversed()` 更轻量且更优先选择。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val reversedNumbers = numbers.asReversed()
    println(reversedNumbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

如果原始列表是可变的，其所有更改都会反映在它的反转视图中，反之亦然。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val reversedNumbers = numbers.asReversed()
    println(reversedNumbers)
    numbers.add("five")
    println(reversedNumbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

但是，如果列表的可变性未知，或者源根本不是列表，则 `.reversed()` 更为合适，因为它的结果是一个将来不会改变的副本。

## 随机顺序 {id="random-order"}

最后，还有一个函数可以返回一个新的 `List`，其中包含按随机顺序排列的集合元素——[`.shuffled()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffled.html)。
你可以不带实参调用它，也可以传入一个 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html) 对象。

```kotlin
fun main() {
//sampleStart
     val numbers = listOf("one", "two", "three", "four")
     println(numbers.shuffled())
//sampleEnd
}
```
{kotlin-runnable="true"}