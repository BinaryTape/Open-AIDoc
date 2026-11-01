[//]: # (title: 集合转换操作)

Kotlin 标准库提供了一组用于集合*转换*的扩展函数。
这些函数会根据提供的转换规则，从现有集合构建出新的集合。
在本页中，我们将概述可用的集合转换函数。

## Map {id="map"}

*映射*（mapping）转换会根据对另一个集合中元素调用函数的结果来创建集合。
基本的映射函数是 [`map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html)。
它将给定的 lambda 表达式应用于后续的每个元素，并返回 lambda 结果构成的列表。
结果的顺序与元素的原始顺序相同。
如果要在转换中额外使用元素索引作为参数，请使用 [`mapIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed.html)。  

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

如果转换对某些元素生成了 `null`，你可以通过调用 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 函数代替 `map()`，或者调用 [`mapIndexedNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed-not-null.html) 代替 `mapIndexed()`，从而从结果集合中过滤掉 `null`。

```kotlin

fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3)
    println(numbers.mapNotNull { if ( it == 2) null else it * 3 })
    println(numbers.mapIndexedNotNull { idx, value -> if (idx == 0) null else value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

转换 Map 时，你有两种选择：转换键而保持值不变，反之亦然。
要对键应用给定的转换，请使用 [`mapKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-keys.html)；
相应地，[`mapValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-values.html) 用于转换值。
这两个函数使用的转换都以 Map 条目作为参数，因此你可以同时对其键和值进行操作。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    println(numbersMap.mapKeys { it.key.uppercase() })
    println(numbersMap.mapValues { it.value + it.key.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

## Zip {id="zip"}

*压缩*（zipping）转换是指由两个集合中相同位置的元素构建键值对。
在 Kotlin 标准库中，这是通过 [`zip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip.html) 扩展函数完成的。

当在某个集合或数组上调用该函数并将另一个集合（或数组）作为参数传入时，`zip()` 会返回由 `Pair` 对象构成的 `List`。接收者集合的元素将作为这些键值对中的第一个元素。

如果集合的大小不同，则 `zip()` 的结果大小为较小集合的大小；较大集合的末尾元素将不会包含在结果中。

`zip()` 还可以使用中缀形式 `a zip b` 调用。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    println(colors zip animals)

    val twoAnimals = listOf("fox", "bear")
    println(colors.zip(twoAnimals))
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以使用带有转换函数的 `zip()`，该函数接受两个形参：接收者元素和实参元素。在这种情况下，结果 `List` 包含对具有相同位置的接收者元素与实参元素构成的每对元素调用转换函数的返回值。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    
    println(colors.zip(animals) { color, animal -> "The ${animal.replaceFirstChar { it.uppercase() }} is $color"})
//sampleEnd
}
```
{kotlin-runnable="true"}

当你拥有一个 `Pair` 的 `List` 时，你可以执行反向转换——*解压*（unzipping）——从这些键值对中构建出两个列表：

* 第一个列表包含原始列表中每个 `Pair` 的第一个元素。 
* 第二个列表包含第二个元素。

要解压键值对列表，请调用 [`unzip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/unzip.html)。

```kotlin

fun main() {
//sampleStart
    val numberPairs = listOf("one" to 1, "two" to 2, "three" to 3, "four" to 4)
    println(numberPairs.unzip())
//sampleEnd
}
```
{kotlin-runnable="true"}

## Associate {id="associate"}

*关联*（association）转换允许根据集合元素以及与其关联的某些值构建 Map。
在不同的关联类型中，元素既可以作为关联 Map 中的键，也可以作为值。

基本关联函数 [`associateWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-with.html) 会创建一个 `Map`，其中原始集合的元素作为键，并通过给定的转换函数根据这些元素生成相应的值。如果两个元素相等，则只有最后一个元素会保留在 Map 中。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

对于以集合元素作为值来构建 Map，可以使用函数 [`associateBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-by.html)。
它接受一个根据元素的值返回键的函数。如果两个元素的键相等，则只有最后一个元素会保留在 Map 中。

调用 `associateBy()` 时还可以传入一个值转换函数。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.associateBy { it.first().uppercaseChar() })
    println(numbers.associateBy(keySelector = { it.first().uppercaseChar() }, valueTransform = { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

另一种构建键和值都以某种方式从集合元素生成的 Map 的方法是函数 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html)。 
它接受一个返回 `Pair` 的 lambda 表达式：对应 Map 条目的键和值。

请注意，`associate()` 会生成短期的 `Pair` 对象，这可能会影响性能。
因此，应在性能要求不苛刻或相比其他选项更合适时使用 `associate()`。

后者的一个示例是键和对应的值需要一起从某个元素生成时。 

```kotlin

fun main() {
data class FullName (val firstName: String, val lastName: String)

fun parseFullName(fullName: String): FullName {
    val nameParts = fullName.split(" ")
    if (nameParts.size == 2) {
        return FullName(nameParts[0], nameParts[1])
    } else throw Exception("Wrong name format")
}

//sampleStart
    val names = listOf("Alice Adams", "Brian Brown", "Clara Campbell")
    println(names.associate { name -> parseFullName(name).let { it.lastName to it.firstName } })  
//sampleEnd
}
```
{kotlin-runnable="true"}

在此示例中，我们首先对元素调用转换函数，然后通过该函数结果的属性构建键值对。

## Flatten {id="flatten"}

如果你在操作嵌套集合，可能会发现标准库中用于平铺访问嵌套集合元素的函数非常有用。

第一个函数是 [`flatten()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flatten.html)。
你可以在集合的集合上调用它，例如由 `Set` 组成的 `List`。
该函数返回包含所有嵌套集合元素的一个单独的 `List`。

```kotlin

fun main() {
//sampleStart
    val numberSets = listOf(setOf(1, 2, 3), setOf(4, 5, 6), setOf(1, 2))
    println(numberSets.flatten())
//sampleEnd
}
```
{kotlin-runnable="true"}

另一个函数——[`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) 提供了处理嵌套集合的灵活方式。它接受一个将集合元素映射到另一个集合的函数。
因此，`flatMap()` 返回对所有元素应用该函数后的返回值构成的单个列表。
也就是说，`flatMap()` 的行为相当于依次调用 `map()`（映射结果为一个集合）和 `flatten()`。

```kotlin

data class StringContainer(val values: List<String>)

fun main() {
//sampleStart
    val containers = listOf(
        StringContainer(listOf("one", "two", "three")),
        StringContainer(listOf("four", "five", "six")),
        StringContainer(listOf("seven", "eight"))
    )
    println(containers.flatMap { it.values })
//sampleEnd
}

```
{kotlin-runnable="true"}

## 字符串表示 {id="string-representation"}

如果你需要以可读格式检索集合内容，请使用将集合转换为字符串的函数：[`joinToString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to-string.html) 和 [`joinTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to.html)。

`joinToString()` 会根据提供的实参，从集合元素构建出单个 `String`。
`joinTo()` 执行相同操作，但将结果附加到给定的 [`Appendable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-appendable/index.html) 对象。

当使用形参的默认值调用时，这些函数返回的结果类似于在集合上调用 `toString()`：由逗号加空格分隔的各元素字符串表示形式构成的 `String`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println(numbers)         
    println(numbers.joinToString())
    
    val listString = StringBuffer("The list of numbers: ")
    numbers.joinTo(listString)
    println(listString)
//sampleEnd
}
```
{kotlin-runnable="true"}

要构建自定义的字符串表示形式，你可以在函数实参 `separator`、`prefix` 和 `postfix` 中指定其参数。生成的字符串将以 `prefix` 开头，以 `postfix` 结尾。除最后一个元素外，每个元素后面都会跟着 `separator`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")    
    println(numbers.joinToString(separator = " | ", prefix = "start: ", postfix = ": end"))
//sampleEnd
}
```
{kotlin-runnable="true"}

对于较大的集合，你可能需要指定 `limit`——包含在结果中的元素数量。
如果集合大小超过了 `limit`，则所有其他元素将被 `truncated` 实参的单个值替换。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..100).toList()
    println(numbers.joinToString(limit = 10, truncated = "<...>"))
//sampleEnd
}
```
{kotlin-runnable="true"}

最后，若要自定义元素本身的表示形式，请提供 `transform` 函数。 

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.joinToString { "Element: ${it.uppercase()}"})
//sampleEnd
}
```
{kotlin-runnable="true"}