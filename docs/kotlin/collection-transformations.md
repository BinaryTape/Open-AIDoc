[//]: # (title: 转换集合)

Kotlin 标准库提供了一组用于集合*转换*（transformation）的扩展函数。
这些函数根据提供的转换规则，从现有集合构建出新的集合。
在本页中，我们将简要介绍可用的集合转换函数。

## Map {id="map"}

*映射*（mapping）转换会根据对另一个集合中的元素应用函数所产生的结果来创建新集合。
最基本的映射函数是 [`map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html)。
它将给定的 lambda 表达式应用于后续的每个元素，并返回 lambda 结果构成的列表。
结果的顺序与元素的原始顺序保持一致。 
如果要在转换中将元素索引额外作为实参传入，请使用 [`mapIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed.html)。  

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

如果转换在某些元素上生成了 `null`，你可以通过调用 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 函数代替 `map()`，或者调用 [`mapIndexedNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed-not-null.html) 代替 `mapIndexed()`，从而从结果集合中过滤掉这些 `null` 值。

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

在转换 Map 时，有两种选择：转换键而保持值不变，反之亦然。
要对键应用给定的转换，请使用 [`mapKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-keys.html)；
反过来，[`mapValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-values.html) 用于转换值。
这两个函数使用的转换操作都接受一个 Map 条目作为实参，因此你可以同时操作其键和值。

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

*Zip*（双路合并）转换是指由两个集合中处于相同位置的元素来构建二元组（Pair）。
在 Kotlin 标准库中，这可以通过 [`zip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip.html) 扩展函数完成。

当在某个集合或数组上调用，并以另一个集合（或数组）作为实参时，`zip()` 会返回一个包含 `Pair` 对象的 `List`。接收者集合的元素将作为这些对中的第一个元素。

如果集合的大小不同，`zip()` 的结果大小将取决于较小的集合；较大集合中超出部分的末尾元素将不会包含在结果中。

`zip()` 也可以以中缀形式 `a zip b` 调用。

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

你还可以在调用 `zip()` 时传入一个带有两个形参的转换函数：接收者元素与实参元素。在这种情况下，结果 `List` 将包含在相同位置的接收者元素与实参元素对上调用转换函数的返回值。

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

当你拥有一个 `Pair` 的 `List` 时，你可以执行反向转换——*解压*（unzipping）——从这些对中构建出两个列表：

* 第一个列表包含原始列表中每个 `Pair` 的第一个元素。 
* 第二个列表包含第二个元素。

要解压一个由对构成的列表，请调用 [`unzip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/unzip.html)。

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

*关联*（Association）转换允许基于集合元素以及与之关联的特定值来构建 Map。
在不同的关联类型中，元素既可以作为关联 Map 中的键，也可以作为值。

基本的关联函数 [`associateWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-with.html) 会创建一个 `Map`，其中原始集合的元素作为键，而值则由给定的转换函数根据元素生成。如果两个元素相等，则只有最后一个元素会保留在 Map 中。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

为了构建以集合元素作为值的 Map，可以使用 [`associateBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-by.html) 函数。
它接受一个基于元素的值返回键的函数。如果两个元素的键相等，则只有最后一个会保留在 Map 中。

`associateBy()` 在调用时也可以传入一个值转换函数。

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

另一种构建 Map 的方式是使用 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) 函数，此时键和值都以某种方式从集合元素中生成。
它接受一个返回 `Pair` 的 lambda 表达式，该二元组对应 Map 条目的键与值。

请注意，`associate()` 会产生短生命周期的 `Pair` 对象，这可能会影响性能。
因此，当性能不是关键考量因素，或者相比其他选项更为适用时，才应使用 `associate()`。

后者的一个例子是从一个元素中同时生成键和对应的值。 

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

在这里，我们首先对元素调用转换函数，然后根据该函数结果的属性构建一个二元组。

## Flatten {id="flatten"}

如果你在操作嵌套集合，可能会发现标准库中用于平铺访问嵌套集合元素的函数非常有用。

第一个函数是 [`flatten()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flatten.html)。
你可以在由集合组成的集合上调用它，例如由 `Set` 组成的 `List`。
该函数返回一个包含嵌套集合中所有元素的单一 `List`。

```kotlin

fun main() {
//sampleStart
    val numberSets = listOf(setOf(1, 2, 3), setOf(4, 5, 6), setOf(1, 2))
    println(numberSets.flatten())
//sampleEnd
}
```
{kotlin-runnable="true"}

另一个函数——[`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) 提供了一种灵活的处理嵌套集合的方法。它接受一个将集合元素映射为另一个集合的函数。
因此，`flatMap()` 返回对所有元素应用该函数后的返回值组成的单一列表。
所以，`flatMap()` 的行为相当于依次调用 `map()`（映射结果为一个集合）和 `flatten()`。

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

`joinToString()` 会根据提供的实参从集合元素中构建单个 `String`。
`joinTo()` 执行相同的操作，但会将结果追加到给定的 [`Appendable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-appendable/index.html) 对象中。

当使用形参的默认值调用时，这些函数返回的结果类似于对集合调用 `toString()`：由逗号加空格分隔的各元素字符串表示形式构成的 `String`。

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

要构建自定义的字符串表示，可以在函数实参中指定其形参 `separator`、`prefix` 与 `postfix`。生成的字符串将以 `prefix` 开头，以 `postfix` 结尾。除了最后一个元素外，每个元素后面都会跟着 `separator`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")    
    println(numbers.joinToString(separator = " | ", prefix = "start: ", postfix = ": end"))
//sampleEnd
}
```
{kotlin-runnable="true"}

对于较大的集合，你可能需要指定 `limit`——即包含在结果中的元素数量。
如果集合大小超过了 `limit`，所有其余元素将被替换为 `truncated` 实参指定的单个值。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..100).toList()
    println(numbers.joinToString(limit = 10, truncated = "<...>"))
//sampleEnd
}
```
{kotlin-runnable="true"}

最后，要自定义元素本身的表示形式，请提供 `transform` 函数。 

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.joinToString { "Element: ${it.uppercase()}"})
//sampleEnd
}
```
{kotlin-runnable="true"}