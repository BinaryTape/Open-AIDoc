[//]: # (title: Kotlin 1.1 的最新变化)

<web-summary>阅读 Kotlin 1.1 发布说明，涵盖新增语言功能、Kotlin/JVM 与 JS 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_发布日期：2016 年 2 月 15 日_

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

从 Kotlin 1.1 开始，JavaScript 目标平台不再被视为实验性的。所有语言功能均已得到支持，并且新增了许多用于与前端开发环境集成的工具。有关更详细的变更列表，请参见[下文](#javascript-backend)。

## 协程（实验性） {id="coroutines-experimental"}

Kotlin 1.1 的核心新特性是*协程*，带来了对 `async`/`await`、`yield` 以及类似编程模式的支持。Kotlin 设计的关键特性在于：协程执行的实现属于库的一部分，而非语言本身，因此你不会受限于任何特定的编程范式或并发库。

协程实质上是一种轻量级线程，可以被挂起并在稍后恢复执行。
协程通过 _[挂起函数](coroutines-basics.md)_（suspending function）提供支持：
对这类函数的调用可能会挂起协程，而要启动一个新协程，通常会使用匿名挂起函数（即挂起 lambda）。  

我们来看看在外部库 [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines) 中实现的 `async`/`await`： 

```kotlin
// runs the code in the background thread pool
fun asyncOverlay() = async(CommonPool) {
    // start two async operations
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // and then apply overlay to both results
    applyOverlay(original.await(), overlay.await())
}

// launches new coroutine in UI context
launch(UI) {
    // wait for async overlay to complete
    val image = asyncOverlay().await()
    // and then show it in UI
    showImage(image)
}
```

在这里，`async { ... }` 启动了一个协程；当我们使用 `await()` 时，协程的执行被挂起，等待中的操作继续执行；当所等待的操作完成时，协程被恢复（可能在不同的线程上）。

标准库使用协程通过 `yield` 和 `yieldAll` 函数来支持*惰性生成序列*。
在此类序列中，返回序列元素的代码块在每次获取元素后挂起，并在请求下一个元素时恢复。示例如下：

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // yield a square of i
          yield(i * i)
      }
      // yield a range
      yieldAll(26..28)
    }

    // print the sequence
    println(seq.toList())
}
```

运行上面的代码即可查看结果。欢迎随意编辑并重新运行！

欲了解更多信息，请参阅[协程文档](coroutines-overview.md)和[教程](coroutines-and-channels.md)。

请注意，协程目前被视为一项**实验性功能**，这意味着 Kotlin 团队不承诺在 1.1 正式发布后保持该功能的向后兼容性。

## 其他语言功能 {id="other-language-features"}

### 类型别名 {id="type-aliases"}

类型别名允许你为现有的类型定义一个替代名称。
这对于集合等泛型类型以及函数类型最为有用。
示例如下：

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// Note that the type names (initial and the type alias) are interchangeable:
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

有关更多详细信息，请参阅[类型别名文档](type-aliases.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md)。

### 绑定可调用引用 {id="bound-callable-references"}

现在你可以使用 `::` 运算符获取指向特定对象实例的方法或属性的[成员引用](lambdas.md#function-references)。以往这只能通过 lambda 来表达。
示例如下：

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

阅读[文档](reflection.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md) 了解更多详细信息。

### 密封类与数据类 {id="sealed-and-data-classes"}

Kotlin 1.1 解除了 Kotlin 1.0 中对密封类和数据类的一些限制。
现在你可以在同一个文件的顶级作用域中定义顶级密封类的子类，而不仅限于作为密封类的嵌套类。
数据类现在也可以继承其他类。
这可以用来漂亮且整洁地定义表达式类的继承层次结构：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

阅读[密封类文档](sealed-classes.md)或关于[密封类](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md)和[数据类](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md)的 KEEP 了解更多详细信息。

### Lambda 中的解构 {id="destructuring-in-lambdas"}

现在可以使用[析构声明](destructuring-declarations.md)语法来解包传递给 lambda 的实参。
示例如下：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // before
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // now
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

阅读[析构声明文档](destructuring-declarations.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md) 了解更多详细信息。

### 下划线表示未使用的形参 {id="underscores-for-unused-parameters"}

对于具有多个形参的 lambda，可以使用 `_` 字符来替代未使用的形参名称：

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

这同样适用于[析构声明](destructuring-declarations.md)：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

阅读 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md) 了解更多详细信息。

### 数字字面量中的下划线 {id="underscores-in-numeric-literals"}

正如在 Java 8 中一样，Kotlin 现在允许在数字字面量中使用下划线来分隔数字分组：

```kotlin
//sampleStart
val oneMillion = 1_000_000
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010100
//sampleEnd

fun main(args: Array<String>) {
    println(oneMillion)
    println(hexBytes.toString(16))
    println(bytes.toString(2))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

阅读 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md) 了解更多详细信息。

### 更简短的属性语法 {id="shorter-syntax-for-properties"}

对于 getter 定义为表达式体的属性，现在可以省略属性类型：

```kotlin
//sampleStart
    data class Person(val name: String, val age: Int) {
    val isAdult get() = age >= 20 // Property type inferred to be 'Boolean'
}
//sampleEnd
fun main(args: Array<String>) {
    val akari = Person("Akari", 26)
    println("$akari.isAdult = ${akari.isAdult}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 内联属性访问器 {id="inline-property-accessors"}

如果属性没有支持字段，现在可以使用 `inline` 修饰符标记其属性访问器。
此类访问器的编译方式与[内联函数](inline-functions.md)相同。

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // the getter will be inlined
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你也可以将整个属性标记为 `inline`——这样该修饰符将同时应用于两个访问器。

阅读[内联函数文档](inline-functions.md#inline-properties)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md) 了解更多详细信息。

### 局部委托属性 {id="local-delegated-properties"}

现在可以对局部变量使用[委托属性](delegated-properties.md)语法。
一个潜在的用途是定义惰性计算的局部变量：

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // returns the random value
        println("The answer is $answer.")   // answer is calculated at this point
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

阅读 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md) 了解更多详细信息。

### 拦截委托属性绑定 {id="interception-of-delegated-property-binding"}

对于[委托属性](delegated-properties.md)，现在可以使用 `provideDelegate` 运算符来拦截委托到属性的绑定过程。
例如，如果我们在绑定之前想要检查属性名称，可以这样写：

```kotlin
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(thisRef: MyUI, prop: KProperty<*>): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        ... // property creation
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

class MyUI {
    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

在创建 `MyUI` 实例期间，系统会为每个属性调用 `provideDelegate` 方法，并且该方法可以立即执行必要的验证。

阅读[委托属性文档](delegated-properties.md)了解更多详细信息。

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
    printAllValues<RGB>() // prints RED, GREEN, BLUE
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### DSL 中隐式接收者的作用域控制 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) 注解允许在 DSL 上下文中限制对外部作用域接收者的使用。
思考这个典型的 [HTML 构建器示例](type-safe-builders.md)：

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

在 Kotlin 1.0 中，传递给 `td` 的 lambda 中的代码可以访问三个隐式接收者：传递给 `table`、`tr` 以及 `td` 的接收者。这允许你调用在当前上下文毫无意义的方法——例如在 `td` 内部调用 `tr`，从而把 `<tr>` 标记放入 `<td>` 中。

在 Kotlin 1.1 中，你可以对此进行限制，使得传递给 `td` 的 lambda 内部只能调用 `td` 的隐式接收者上定义的方法。你可以通过定义一个带有 `@DslMarker` 元注解的注解，并将其应用于标记类的基类来实现这一点。

阅读[类型安全构建器文档](type-safe-builders.md)和 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md) 了解更多详细信息。

### rem 运算符 {id="rem-operator"}

`mod` 运算符现已被弃用，改用 `rem` 代替。参见[此 issue](https://youtrack.jetbrains.com/issue/KT-14650) 了解相关原因。

## 标准库 {id="standard-library"}

### 字符串到数字转换 {id="string-to-number-conversions"}

String 类上新增了一组扩展函数，可以在数字无效时不抛出异常直接转换为数字：
`String.toIntOrNull(): Int?`、`String.toDoubleOrNull(): Double?` 等。

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

此外，整数转换函数（如 `Int.toString()`、`String.toInt()`、`String.toIntOrNull()`）都增加了一个带有 `radix` 形参的重载，允许指定转换的基数（2 到 36）。

### onEach() {id="oneach"}

`onEach` 是用于集合和序列的一个虽小但实用的扩展函数，允许在操作链中对集合/序列的每个元素执行某些操作（可能伴有副作用）。
在可迭代对象（Iterable）上，它的行为类似于 `forEach`，但会进一步返回该可迭代对象实例。而在序列上，它返回一个包装序列，该序列会在遍历元素时惰性地应用给定的操作。

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also()、takeIf() 和 takeUnless() {id="also-takeif-and-takeunless"}

这是适用于任何接收者的三个通用扩展函数。
 
`also` 类似于 `apply`：它接收接收者，对其执行某些操作，然后返回该接收者。 
区别在于，在 `apply` 内部的代码块中，接收者以 `this` 的形式可用；而在 `also` 内部的代码块中，接收者以 `it` 的形式可用（如果你愿意，也可以为它指定另一个名称）。
当你不希望遮蔽外部作用域的 `this` 时，这非常有用：

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// using 'apply' instead
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeIf` 类似于针对单个值的 `filter`。它检查接收者是否满足谓词条件，如果满足则返回接收者，如果不满足则返回 `null`。 
结合 Elvis 运算符 (?:) 和提前返回（early return），它允许编写如下结构：

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// do something with existing outDirFile
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // do something with index of keyword in input string, given that it's found
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeUnless` 与 `takeIf` 相同，但它采用相反的谓词条件。当它*不满足*谓词条件时返回接收者，否则返回 `null`。因此，上面的一个示例可以用 `takeUnless` 重写如下：

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

当你使用可调用引用而不是 lambda 时，使用它也会很方便：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### groupingBy() {id="groupingby"}

此 API 可用于按键对集合进行分组并同时折叠每个分组。例如，它可以用于统计以各个字母开头的单词数量：

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // The alternative way that uses 'groupBy' and 'mapValues' creates an intermediate map, 
    // while 'groupingBy' way counts on the fly.
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.toMap() 和 Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

这些函数可用于方便地复制映射（Map）：

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

运算符 `plus` 提供了一种向只读映射添加键值对以生成新映射的方法，但是此前并没有一种简单的方法来执行相反的操作：要从映射中移除键，你必须借助不够直观的方法，例如 `Map.filter()` 或 `Map.filterKeys()`。
现在运算符 `minus` 填补了这一空白。它提供了 4 个重载：用于移除单个键、键集合、键序列以及键数组。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### minOf() 和 maxOf() {id="minof-and-maxof"}

这些函数可用于查找两个或三个给定值中的最小值和最大值，其中值可以是基元数值类型或 `Comparable` 对象。如果你想比较自身不可比较的对象，每个函数还提供了一个接受额外 `Comparator` 实例的重载。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 类似数组的 List 实例化函数 {id="array-like-list-instantiation-functions"}

类似于 `Array` 构造函数，现在有些函数可以创建 `List` 和 `MutableList` 实例，并通过调用 lambda 来初始化每个元素：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.getValue() {id="map-getvalue"}

`Map` 上的这个扩展函数返回与给定键对应的现有值，或者抛出异常并指出未找到哪个键。
如果该映射是通过 `withDefault` 生成的，此函数将返回默认值而不是抛出异常。

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // returns non-nullable Int value 42
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // returns 4
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- this will throw NoSuchElementException
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 抽象集合 {id="abstract-collections"}

在实现 Kotlin 集合类时，这些抽象类可以用作基类。
对于实现只读集合，有 `AbstractCollection`、`AbstractList`、`AbstractSet` 和 `AbstractMap`；
对于可变集合，有 `AbstractMutableCollection`、`AbstractMutableList`、`AbstractMutableSet` 和 `AbstractMutableMap`。
在 JVM 上，这些抽象可变集合的大部分功能继承自 JDK 的抽象集合。

### 数组操作函数 {id="array-manipulation-functions"}

标准库现在提供了一组用于对数组进行逐元素操作的函数：比较
（`contentEquals` 和 `contentDeepEquals`）、哈希码计算（`contentHashCode` 和 `contentDeepHashCode`），
以及转换为字符串（`contentToString` 和 `contentDeepToString`）。它们在 JVM
（充当 `java.util.Arrays` 中相应函数的别名）和 JS（实现在 Kotlin 标准库中提供）上均受支持。

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM implementation: type-and-hash gibberish
    println(array.contentToString())  // nicely formatted as list
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## JVM 后端 {id="jvm-backend"}

### Java 8 字节码支持 {id="java-8-bytecode-support"}

Kotlin 现在具备生成 Java 8 字节码的选项（`-jvm-target 1.8` 命令行选项或 Maven/Gradle 中的相应选项）。目前这不会改变字节码的语义（特别是，接口中的默认方法和 lambda 的生成方式与 Kotlin 1.0 完全相同），但我们计划在后续对此进行更充分的利用。

### Java 8 标准库支持 {id="java-8-standard-library-support"}

标准库现在提供了独立版本，用于支持 Java 7 和 8 中新增的 JDK API。
如果需要访问这些新 API，请使用 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8` Maven 工件来替代标准的 `kotlin-stdlib`。
这些构件是构建在 `kotlin-stdlib` 之上的微小扩展，并将 `kotlin-stdlib` 作为传递依赖项引入你的项目。

### 字节码中的形参名称 {id="parameter-names-in-the-bytecode"}

Kotlin 现在支持在字节码中存储形参名称。这可以通过 `-java-parameters` 命令行选项启用。

### 常量内联 {id="constant-inlining"}

编译器现在会将 `const val` 属性的值内联到使用它们的位置。

### 可变闭包变量 {id="mutable-closure-variables"}

用于在 lambda 中捕获可变闭包变量的装箱类不再具有 volatile 字段。这一变更提升了性能，但在某些罕见的使用场景中可能会导致新的数据竞争。如果你受到此影响，则需要为访问变量提供自己的同步处理。

### javax.script 支持 {id="javax-script-support"}

Kotlin 现在集成了 [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223)。
该 API 允许在运行时对代码段求值：

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // Prints out 5
```

请参阅[此处](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)
了解使用该 API 的更大规模示例项目。

### kotlin.reflect.full {id="kotlin-reflect-full"}

为了[为 Java 9 支持做准备](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)，`kotlin-reflect.jar` 库中的扩展函数和属性已移至 `kotlin.reflect.full` 包中。旧包（`kotlin.reflect`）中的名称已被弃用，并将在 Kotlin 1.2 中移除。请注意，核心反射接口（例如 `KClass`）是 Kotlin 标准库的一部分，而非 `kotlin-reflect`，因此不受此迁移的影响。

## JavaScript 后端 {id="javascript-backend"}

### 统一的标准库 {id="unified-standard-library"}

现在，Kotlin 标准库的绝大部分都可以在编译为 JavaScript 的代码中使用。
特别是，集合（`ArrayList`、`HashMap` 等）、异常（`IllegalArgumentException` 等）以及其他几个核心类（`StringBuilder`、`Comparator`）现在都定义在 `kotlin` 包下。在 JVM 上，这些名称是对应 JDK 类的类型别名；在 JS 上，这些类则在 Kotlin 标准库中实现。

### 更好的代码生成 {id="better-code-generation"}

JavaScript 后端现在可以生成更易于进行静态检查的代码，这对 JS 代码处理工具（如压缩工具、优化器、linter 等）更加友好。

### external 修饰符 {id="the-external-modifier"}

如果需要以类型安全的方式从 Kotlin 访问用 JavaScript 实现的类，可以使用 `external` 修饰符编写 Kotlin 声明。（在 Kotlin 1.0 中，使用的是 `@native` 注解。）
与 JVM 目标不同，JS 目标允许对类和属性使用 external 修饰符。
例如，以下是声明 DOM（文档对象模型）`Node` 类的方式：

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // etc
}
```

### 改进的导入处理 {id="improved-import-handling"}

现在可以更精确地描述应从 JavaScript 模块导入的声明。
如果在外部声明上添加 `@JsModule("<module-name>")` 注解，它将在编译期间被正确导入到模块系统（CommonJS 或 AMD）中。例如，对于 CommonJS，该声明将通过 `require(...)` 函数导入。
此外，如果你希望将声明作为模块或全局 JavaScript 对象导入，可以使用 `@JsNonModule` 注解。

例如，以下是将 JQuery 导入 Kotlin 模块的方法：

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

在这种情况下，JQuery 将作为名为 `jquery` 的模块导入。或者，也可以将其用作 $ 对象，具体取决于 Kotlin 编译器配置使用的模块系统。

你可以在应用程序中按如下方式使用这些声明：

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```