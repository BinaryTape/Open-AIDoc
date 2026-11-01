[//]: # (title: Kotlin 1.1 的最新变化)

<web-summary>阅读 Kotlin 1.1 发行说明，涵盖新语言功能、Kotlin/JVM 与 JS 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_发布时间：2016 年 2 月 15 日_

## 目录 {id="table-of-contents"}

* [协程](#coroutines-experimental)
* [其他语言功能](#other-language-features)
* [标准库](#standard-library)
* [JVM 后端](#jvm-backend)
* [JavaScript 后端](#javascript-backend)

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## JavaScript {id="javascript"}

从 Kotlin 1.1 开始，JavaScript 目标平台不再被视为实验性功能。现已支持所有语言功能，并提供了许多用于与前端开发环境集成的新工具。有关更详细的更改列表，请参阅[下文](#javascript-backend)。

## 协程（实验性） {id="coroutines-experimental"}

Kotlin 1.1 中的关键新功能是*协程*（coroutines），它带来了对 `async`/`await`、`yield` 以及类似编程模式的支持。Kotlin 设计的关键特性在于，协程执行的实现属于库的一部分，而不是语言本身，因此你不会受限于任何特定的编程范式或并发库。

协程本质上是可以被挂起并在稍后恢复的轻量级线程。协程通过 *[挂起函数](coroutines-basics.md)*（suspending functions）提供支持：对这种函数的调用可能会挂起协程，而要启动一个新的协程，我们通常使用匿名挂起函数（即挂起 lambda）。

让我们看一下在外部库 [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) 中实现的 `async`/`await`：

```kotlin
// 在后台线程池中运行代码
fun asyncOverlay() = async(CommonPool) {
    // 启动两个异步操作
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // 然后将图层应用到这两个结果上
    applyOverlay(original.await(), overlay.await())
}

// 在 UI 上下文中启动新协程
launch(UI) {
    // 等待异步图层完成
    val image = asyncOverlay().await()
    // 然后在 UI 中显示它
    showImage(image)
}
```

在这里，`async { ... }` 启动了一个协程；当我们使用 `await()` 时，协程的执行会在所等待的操作执行期间被挂起，并在所等待的操作完成时恢复（可能会在不同的线程上）。

标准库使用协程通过 `yield` 和 `yieldAll` 函数来支持*延迟生成序列*。在这样的序列中，返回序列元素的代码块在获取到每个元素后会被挂起，并在请求下一个元素时恢复。下面是一个示例：

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // 生成 i 的平方
          yield(i * i)
      }
      // 生成一个区间
      yieldAll(26..28)
    }

    // 打印序列
    println(seq.toList())
}
```

运行上面的代码查看结果。你可以随意编辑并重新运行！

欲了解更多信息，请参阅[协程文档](coroutines-overview.md)和[教程](coroutines-and-channels.md)。

请注意，协程目前被视为一项**实验性功能**，这意味着 Kotlin 团队并不承诺在 1.1 最终版本发布后保持该功能的向后兼容性。

## 其他语言功能 {id="other-language-features"}

### 类型别名 {id="type-aliases"}

类型别名允许你为现有类型定义一个替代名称。这对于泛型类型（如集合）以及函数类型最为有用。下面是一个示例：

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 请注意，类型名称（原始类型和类型别名）是可以互换的：
fun checkLaLaLandIsTheBestMovie(oscarWinners: Map<String, String>) =
        oscarWinners["Best picture"] == "La La Land"
//sampleEnd

fun oscarWinners(): OscarWinners {
    return mapOf(
            "Best song" to "City of Stars (La La Land)",
            "Best actress" to "Emma Stone (La La Land)",
            "Best picture" to "Moonlight" /* ... */)
}

fun main(args: Array<String>) {
    val oscarWinners = oscarWinners()

    val laLaLandAwards = countLaLaLand(oscarWinners)
    println("LaLaLandAwards = $laLaLandAwards (in our small example), but actually it's 6.")

    val laLaLandIsTheBestMovie = checkLaLaLandIsTheBestMovie(oscarWinners)
    println("LaLaLandIsTheBestMovie = $laLaLandIsTheBestMovie")
}
```
{kotlin-runnable="true"}

详细信息请参阅[类型别名文档](type-aliases.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md)。

### 绑定的可调用引用 {id="bound-callable-references"}

现在可以使用 `::` 运算符来获取指向特定对象实例的方法或属性的[成员引用](lambdas.md#function-references)。在此之前，这只能通过 lambda 来表示。下面是一个示例：

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true"}

阅读[文档](reflection.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md) 了解更多详情。

### 密封类与数据类 {id="sealed-and-data-classes"}

Kotlin 1.1 移除了 Kotlin 1.0 中对密封类和数据类的一些限制。
现在，你可以在同一个文件的顶层定义顶层密封类的子类，而不仅限于作为密封类的嵌套类。
数据类现在也可以继承其他类。
这可用于清晰优美地定义表达式类的层次结构：

```kotlin
//sampleStart
sealed class Expr

data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()

fun eval(expr: Expr): Double = when (expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
}
val e = eval(Sum(Const(1.0), Const(2.0)))
//sampleEnd

fun main(args: Array<String>) {
    println("e is $e") // 3.0
}
```
{kotlin-runnable="true"}

阅读[密封类文档](sealed-classes.md)或关于[密封类](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md)与[数据类](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md)的 KEEP 了解更多详情。

### lambda 中的析构 {id="destructuring-in-lambdas"}

现在可以使用[析构声明](destructuring-declarations.md)语法来解构传递给 lambda 的实参。下面是一个示例：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 以前
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 现在
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true"}

阅读[析构声明文档](destructuring-declarations.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md) 了解更多详情。

### 未使用形参的下划线 {id="underscores-for-unused-parameters"}

对于包含多个形参的 lambda，你可以使用 `_` 字符来替代未使用的形参名称：

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true"}

这在[析构声明](destructuring-declarations.md)中同样有效：

```kotlin
data class Result(val value: Any, val status: String)

fun getResult() = Result(42, "ok").also { println("getResult() returns $it") }

fun main(args: Array<String>) {
//sampleStart
    val (_, status) = getResult()
//sampleEnd
    println("status is '$status'")
}
```
{kotlin-runnable="true"}

阅读 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md) 了解更多详情。

### 数字字面量中的下划线 {id="underscores-in-numeric-literals"}

正如在 Java 8 中一样，Kotlin 现在允许在数字字面量中使用下划线来分隔数字组：

```kotlin
//sampleStart
val oneMillion = 1_000_000
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010010
//sampleEnd

fun main(args: Array<String>) {
    println(oneMillion)
    println(hexBytes.toString(16))
    println(bytes.toString(2))
}
```
{kotlin-runnable="true"}

阅读 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md) 了解更多详情。

### 属性的更简短语法 {id="shorter-syntax-for-properties"}

对于将 getter 定义为表达式体的属性，现在可以省略属性类型：

```kotlin
//sampleStart
    data class Person(val name: String, val age: Int) {
    val isAdult get() = age >= 20 // 属性类型被推断为 'Boolean'
}
//sampleEnd
fun main(args: Array<String>) {
    val akari = Person("Akari", 26)
    println("$akari.isAdult = ${akari.isAdult}")
}
```
{kotlin-runnable="true"}

### 内联属性访问器 {id="inline-property-accessors"}

如果属性没有支持字段，现在可以使用 `inline` 修饰符标记属性访问器。此类访问器的编译方式与[内联函数](inline-functions.md)相同。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // getter 将被内联
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true"}

你也可以将整个属性标记为 `inline`——此时修饰符将同时应用于两个访问器。

阅读[内联函数文档](inline-functions.md#inline-properties)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md) 了解更多详情。

### 局部委托属性 {id="local-delegated-properties"}

现在可以对局部变量使用[委托属性](delegated-properties.md)语法。一个可能的用例是定义延迟求值的局部变量：

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // 返回随机值
        println("The answer is $answer.")   // 此时计算 answer
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

阅读 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md) 了解更多详情。

### 拦截委托属性绑定 {id="interception-of-delegated-property-binding"}

对于[委托属性](delegated-properties.md)，现在可以使用 `provideDelegate` 运算符拦截委托到属性的绑定过程。
例如，如果我们想在绑定前检查属性名称，可以编写如下代码：

```kotlin
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(thisRef: MyUI, prop: KProperty<*>): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        ... // 属性创建
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

class MyUI {
    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

在创建 `MyUI` 实例期间，会为每个属性调用 `provideDelegate` 方法，并且它可以立即执行必要的验证。

阅读[委托属性文档](delegated-properties.md)了解更多详情。

### 泛型枚举值访问 {id="generic-enum-value-access"}

现在可以以泛型方式枚举枚举类的值。

```kotlin
//sampleStart
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumValues<T>().joinToString { it.name })
}
//sampleEnd

fun main(args: Array<String>) {
    printAllValues<RGB>() // 打印 RED, GREEN, BLUE
}
```
{kotlin-runnable="true"}

### DSL 中隐式接收者的作用域控制 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) 注解允许在 DSL 上下文中限制对外部作用域接收者的使用。
考虑规范的 [HTML 构建器示例](type-safe-builders.md)：

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

在 Kotlin 1.0 中，传递给 `td` 的 lambda 中的代码可以访问三个隐式接收者：传递给 `table`、`tr` 和 `td` 的接收者。这允许你调用在当前上下文中毫无意义的方法——例如在 `td` 内部调用 `tr`，从而把 `<tr>` 标记放到 `<td>` 中。

在 Kotlin 1.1 中，你可以对此进行限制，使得传递给 `td` 的 lambda 内部仅可使用在 `td` 的隐式接收者上定义的方法。为此，你需要定义一个带有 `@DslMarker` 元注解的注解，并将其应用于标记类的基类。

阅读[类型安全构建器文档](type-safe-builders.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md) 了解更多详情。

### rem 运算符 {id="rem-operator"}

`mod` 运算符现已弃用，改用 `rem`。有关动机请参阅[此问题](https://youtrack.jetbrains.com/issue/KT-14650)。

## 标准库 {id="standard-library"}

### 字符串到数字的转换 {id="string-to-number-conversions"}

String 类上增加了一系列新的扩展函数，用于将其转换为数字，而不会在遇到无效数字时抛出异常：`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` 等。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

此外，整数转换函数（如 `Int.toString()`、`String.toInt()`、`String.toIntOrNull()`）都获得了一个带有 `radix` 形参的重载，允许指定转换的基数（2 到 36）。

### onEach() {id="oneach"}

`onEach` 是一个针对集合和序列的短小却实用的扩展函数，允许在操作链中对集合/序列的每个元素执行某种操作（可能带有副作用）。
在可迭代对象上，它的行为类似于 `forEach`，但还会进一步返回该可迭代对象实例。而在序列上，它返回一个包装序列，该序列会在遍历元素时延迟应用给定的操作。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also()、takeIf() 与 takeUnless() {id="also-takeif-and-takeunless"}

这是适用于任何接收者的三个通用扩展函数。
 
`also` 类似于 `apply`：它接收接收者，对其执行某些操作，然后返回该接收者。
不同之处在于，在 `apply` 内部的代码块中，接收者作为 `this` 可用，而在 `also` 内部的代码块中，它作为 `it` 可用（如果你愿意，也可以为它指定其他名称）。
当你不想遮蔽来自外部作用域的 `this` 时，这会非常方便：

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// 改用 'apply'
fun Block.copy1() = Block().apply {
    this.content = this@copy1.content
}

fun main(args: Array<String>) {
    val block = Block().apply { content = "content" }
    val copy = block.copy()
    println("Testing the content was copied:")
    println(block.content == copy.content)
}
```
{kotlin-runnable="true"}

`takeIf` 就像针对单个值的 `filter`。它检查接收者是否满足谓词条件，如果满足则返回该接收者，否则返回 `null`。结合 Elvis 运算符（?:）和提前返回，可以编写如下结构：

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 对已存在的 outDirFile 执行操作
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 在找到的情况下，对输入字符串中关键字的索引执行操作
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true"}

`takeUnless` 与 `takeIf` 相同，但它采用反转的谓词。当接收者*不满足*谓词条件时返回接收者，否则返回 `null`。因此上面的一个示例可以用 `takeUnless` 改写如下：

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

当你使用可调用引用而不是 lambda 时，使用它也很方便：

```kotlin
private fun testTakeUnless(string: String) {
//sampleStart
    val result = string.takeUnless(String::isEmpty)
//sampleEnd

    println("string = \"$string\"; result = \"$result\"")
}

fun main(args: Array<String>) {
    testTakeUnless("")
    testTakeUnless("abc")
}
```
{kotlin-runnable="true"}

### groupingBy() {id="groupingby"}

该 API 可用于按键对集合进行分组并同时折叠每个分组。例如，它可以用于统计以每个字母开头的单词数：

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 使用 'groupBy' 和 'mapValues' 的替代方法会创建一个中间 map，
    // 而 'groupingBy' 方法则是实时计数的。
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true"}

### Map.toMap() 与 Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

这些函数可用于轻松复制 map：

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

`plus` 运算符提供了一种将键值对添加到只读 map 中以生成新 map 的方法，但是之前并没有简单的方法来做相反的操作：要从 map 中移除一个键，你必须借助不够直接的方法，比如 `Map.filter()` 或 `Map.filterKeys()`。
现在 `minus` 运算符填补了这一空白。提供了 4 个重载：分别用于移除单个键、键集合、键序列和键数组。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf("key" to 42)
    val emptyMap = map - "key"
//sampleEnd
    
    println("map: $map")
    println("emptyMap: $emptyMap")
}
```
{kotlin-runnable="true"}

### minOf() 与 maxOf() {id="minof-and-maxof"}

这些函数可用于找出两个或三个给定值中的最小值和最大值，其中这些值为基本数字类型或 `Comparable` 对象。如果你想比较本身不可比较的对象，每个函数还提供了一个接收额外 `Comparator` 实例的重载。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val list1 = listOf("a", "b")
    val list2 = listOf("x", "y", "z")
    val minSize = minOf(list1.size, list2.size)
    val longestList = maxOf(list1, list2, compareBy { it.size })
//sampleEnd
    
    println("minSize = $minSize")
    println("longestList = $longestList")
}
```
{kotlin-runnable="true"}

### 类 Array 的 List 实例化函数 {id="array-like-list-instantiation-functions"}

与 `Array` 构造函数类似，现在提供了创建 `List` 和 `MutableList` 实例并通过调用 lambda 初始化每个元素的函数：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val squares = List(10) { index -> index * index }
    val mutable = MutableList(10) { 0 }
//sampleEnd

    println("squares: $squares")
    println("mutable: $mutable")
}
```
{kotlin-runnable="true"}

### Map.getValue() {id="map-getvalue"}

`Map` 上的这个扩展函数返回与给定键对应的现有值，或者在未找到该键时抛出异常并指明哪个键未找到。
如果该 map 是通过 `withDefault` 创建的，则此函数将返回默认值而不是抛出异常。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // 返回非 null 的 Int 值 42
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 返回 4
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- 这将抛出 NoSuchElementException
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true"}

### 抽象集合 {id="abstract-collections"}

在实现 Kotlin 集合类时，可以将这些抽象类用作基类。
用于实现只读集合的有 `AbstractCollection`、`AbstractList`、`AbstractSet` 和 `AbstractMap`，用于实现可变集合的有 `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet` 和 `AbstractMutableMap`。
在 JVM 上，这些抽象可变集合的大部分功能继承自 JDK 的抽象集合。

### 数组操作函数 {id="array-manipulation-functions"}

标准库现在提供了一组用于对数组进行逐元素操作的函数：比较（`contentEquals` 和 `contentDeepEquals`）、哈希码计算（`contentHashCode` 和 `contentDeepHashCode`）以及转换为字符串（`contentToString` 和 `contentDeepToString`）。它们在 JVM（充当 `java.util.Arrays` 中相应函数的别名）和 JS（在 Kotlin 标准库中提供实现）上均受支持。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 实现：类型加哈希的乱码
    println(array.contentToString())  // 格式化为美观的列表
//sampleEnd
}
```
{kotlin-runnable="true"}

## JVM 后端 {id="jvm-backend"}

### Java 8 字节码支持 {id="java-8-bytecode-support"}

Kotlin 现在支持生成 Java 8 字节码（通过 `-jvm-target 1.8` 命令行选项或 Maven/Gradle 中的相应选项）。目前这不会改变字节码的语义（特别是，接口中的默认方法和 lambda 的生成方式与 Kotlin 1.0 完全相同），但我们计划在后续版本中对此做进一步利用。

### Java 8 标准库支持 {id="java-8-standard-library-support"}

标准库现在提供了独立版本，以支持 Java 7 和 8 中添加的新 JDK API。
如果你需要访问这些新 API，请使用 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8` Maven 构件，而不是标准的 `kotlin-stdlib`。
这些构件是在 `kotlin-stdlib` 之上的微小扩展，它们会将其作为传递依赖项引入到你的项目中。

### 字节码中的形参名称 {id="parameter-names-in-the-bytecode"}

Kotlin 现在支持在字节码中存储形参名称。这可以通过 `-java-parameters` 命令行选项来启用。

### 常量内联 {id="constant-inlining"}

编译器现在会将 `const val` 属性的值内联到使用它们的位置。

### 可变闭包变量 {id="mutable-closure-variables"}

用于在 lambda 中捕获可变闭包变量的装箱类不再具有 volatile 字段。这一更改提升了性能，但在一些罕见的使用场景下可能会导致新的数据竞争。如果你受到此影响，需要自行提供访问变量时的同步控制。

### javax.script 支持 {id="javax-script-support"}

Kotlin 现在集成了 [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223)。
该 API 允许在运行时对代码段进行求值：

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 输出 5
```

有关使用该 API 的更大型示例项目，请参阅[此处](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)。

### kotlin.reflect.full {id="kotlin-reflect-full"}

为了[为 Java 9 支持做好准备](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)，`kotlin-reflect.jar` 库中的扩展函数和属性已移至 `kotlin.reflect.full` 包中。旧包（`kotlin.reflect`）中的名称已被弃用，并将在 Kotlin 1.2 中移除。请注意，核心反射接口（如 `KClass`）属于 Kotlin 标准库的一部分，而非 `kotlin-reflect`，因此不受此迁移的影响。

## JavaScript 后端 {id="javascript-backend"}

### 统一的标准库 {id="unified-standard-library"}

Kotlin 标准库中更大的一部分现在可以从编译为 JavaScript 的代码中使用。
特别是，关键类如集合（`ArrayList`、`HashMap` 等）、异常（`IllegalArgumentException` 等）以及其他一些类（`StringBuilder`、`Comparator`）现在都定义在 `kotlin` 包下。在 JVM 上，这些名称是对应 JDK 类的类型别名，而在 JS 上，这些类在 Kotlin 标准库中实现。

### 更好的代码生成 {id="better-code-generation"}

JavaScript 后端现在生成更多可静态检查的代码，这对 JS 代码处理工具（如压缩器、优化器、Lint 工具等）更加友好。

### external 修饰符 {id="the-external-modifier"}

如果你需要从 Kotlin 以类型安全的方式访问在 JavaScript 中实现的类，可以使用 `external` 修饰符编写 Kotlin 声明。（在 Kotlin 1.0 中使用的是 `@native` 注解。）
与 JVM 目标平台不同，JS 目标平台允许对类和属性使用 `external` 修饰符。
例如，以下是如何声明 DOM `Node` 类：

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // 等等
}
```

### 改进的导入处理 {id="improved-import-handling"}

现在你可以更精确地描述应该从 JavaScript 模块导入的声明。
如果在外部声明上添加 `@JsModule("<module-name>")` 注解，它将在编译期间被正确导入到模块系统（CommonJS 或 AMD）中。例如，使用 CommonJS 时，该声明将通过 `require(...)` 函数导入。
此外，如果你希望将声明作为模块或全局 JavaScript 对象导入，可以使用 `@JsNonModule` 注解。

例如，以下是如何将 JQuery 导入到 Kotlin 模块中：

```kotlin
external interface JQuery {
    fun toggle(duration: Int = definedExternally): JQuery
    fun click(handler: (Event) -> Unit): JQuery
}

@JsModule("jquery")
@JsNonModule
@JsName("$")
external fun jquery(selector: String): JQuery
```

在此情况下，JQuery 将作为名为 `jquery` 的模块导入。或者，也可以作为 `$` 对象使用，具体取决于配置 Kotlin 编译器使用的模块系统。

你可以在应用程序中按如下方式使用这些声明：

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```