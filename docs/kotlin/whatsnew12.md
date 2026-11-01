[//]: # (title: Kotlin 1.2 的最新变化)

<web-summary>阅读 Kotlin 1.2 发行说明，涵盖新语言功能、Kotlin 多平台更新、JVM 和 JS，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_发布于：2017 年 11 月 28 日_

## 目录 {id="table-of-contents"}

* [多平台项目](#multiplatform-projects-experimental)
* [其他语言功能](#other-language-features)
* [标准库](#standard-library)
* [JVM 后端](#jvm-backend)
* [JavaScript 后端](#javascript-backend)

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 多平台项目（实验性） {id="multiplatform-projects-experimental"}

多平台项目是 Kotlin 1.2 中的一项全新**实验性**功能，允许你在 Kotlin 支持的目标平台（JVM、JavaScript，以及未来的 Native）之间复用代码。在多平台项目中，包含三种模块：

* *公共*（common）模块：包含不特定于任何平台的代码，以及不包含实现的平台相关 API 声明。
* *平台*（platform）模块：包含针对特定平台的公共模块中平台相关声明的实现，以及其他平台相关代码。
* 常规模块：针对特定平台，它既可以作为平台模块的依赖项，也可以依赖于平台模块。

当为特定平台编译多平台项目时，公共部分和平台特定部分的代码都会被生成。

多平台项目支持的一个关键特性是能够通过 *expected*（期望）和 *actual*（实际）声明来表达公共代码对平台特定部分的依赖。*expected* 声明指定了 API（类、接口、注解、顶层声明等）。*actual* 声明既可以是该 API 的平台相关实现，也可以是指向外部库中该 API 现有实现的类型别名。示例如下：

在公共代码中：

```kotlin
// 期望的平台特定 API：
expect fun hello(world: String): String

fun greet() {
    // 期望 API 的用法：
    val greeting = hello("multiplatform world")
    println(greeting)
}

expect class URL(spec: String) {
    open fun getHost(): String
    open fun getPath(): String
}
```

在 JVM 平台代码中：

```kotlin
actual fun hello(world: String): String =
    "Hello, $world, on the JVM platform!"

// 使用现有的平台特定实现：
actual typealias URL = java.net.URL
```

有关构建多平台项目的详细信息与步骤，请参阅[多平台编程文档](https://kotlinlang.org/docs/multiplatform/get-started.html)。

## 其他语言功能 {id="other-language-features"}

### 注解中的数组文字 {id="array-literals-in-annotations"}

从 Kotlin 1.2 开始，注解的数组实参可以使用新的数组文字语法传递，而无需使用 `arrayOf` 函数：

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

数组文字语法仅限用于注解实参。

### lateinit 顶层属性与局部变量 {id="lateinit-top-level-properties-and-local-variables"}

`lateinit` 修饰符现在可用于顶层属性和局部变量。例如，当作为构造函数实参传递给某个对象的 lambda 引用了另一个稍后才定义的对象时，便可使用局部变量：

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 三个节点构成的环：
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true"}

### 检查 lateinit var 是否已初始化 {id="check-whether-a-lateinit-var-is-initialized"}

现在可以使用属性引用上的 `isInitialized` 来检查 lateinit var 是否已初始化：

```kotlin
class Foo {
    lateinit var lateinitVar: String

    fun initializationLogic() {
//sampleStart
        println("isInitialized before assignment: " + this::lateinitVar.isInitialized)
        lateinitVar = "value"
        println("isInitialized after assignment: " + this::lateinitVar.isInitialized)
//sampleEnd
    }
}

fun main(args: Array<String>) {
	Foo().initializationLogic()
}
```
{kotlin-runnable="true"}

### 带有默认函数形参的内联函数 {id="inline-functions-with-default-functional-parameters"}

内联函数现在允许为其内联的函数形参提供默认值：

```kotlin
//sampleStart
inline fun <E> Iterable<E>.strings(transform: (E) -> String = { it.toString() }) =
    map { transform(it) }

val defaultStrings = listOf(1, 2, 3).strings()
val customStrings = listOf(1, 2, 3).strings { "($it)" } 
//sampleEnd

fun main(args: Array<String>) {
    println("defaultStrings = $defaultStrings")
    println("customStrings = $customStrings")
}
```
{kotlin-runnable="true"}

### 显式转换的信息可用于类型推断 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin 编译器现在可以在类型推断中使用来自类型转换的信息。如果你正在调用一个返回类型形参 `T` 的泛型方法，并将返回值转换为特定类型 `Foo`，编译器现在会理解此调用的 `T` 需要绑定到类型 `Foo`。

这对 Android 开发者尤其重要，因为编译器现在可以正确分析 Android API 级别 26 中的泛型 `findViewById` 调用：

```kotlin
val button = findViewById(R.id.button) as Button
```

### 智能转换改进 {id="smart-cast-improvements"}

当一个变量由安全调用表达式赋值并进行 null 检查时，智能转换现在也会应用于该安全调用的接收者：

```kotlin
fun countFirst(s: Any): Int {
//sampleStart
    val firstChar = (s as? CharSequence)?.firstOrNull()
    if (firstChar != null)
    return s.count { it == firstChar } // s: Any 被智能转换为 CharSequence

    val firstItem = (s as? Iterable<*>)?.firstOrNull()
    if (firstItem != null)
    return s.count { it == firstItem } // s: Any 被智能转换为 Iterable<*>
//sampleEnd
    return -1
}

fun main(args: Array<String>) {
  val string = "abacaba"
  val countInString = countFirst(string)
  println("called on \"$string\": $countInString")

  val list = listOf(1, 2, 3, 1, 2)
  val countInList = countFirst(list)
  println("called on $list: $countInList")
}
```
{kotlin-runnable="true"}

此外，对于仅在 lambda 之前修改过的局部变量，现在也允许在 lambda 内部进行智能转换：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val flag = args.size == 0
    var x: String? = null
    if (flag) x = "Yahoo!"

    run {
        if (x != null) {
            println(x.length) // x 被智能转换为 String
        }
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### 支持将 ::foo 作为 this::foo 的简写 {id="support-for-foo-as-a-shorthand-for-this-foo"}

指向 `this` 成员的绑定可调用引用现在可以不带显式接收者编写，即使用 `::foo` 代替 `this::foo`。这也使得在引用外部接收者成员的 lambda 中使用可调用引用变得更加方便。

### 破坏性变更：try 块之后更可靠的智能转换 {id="breaking-change-sound-smart-casts-after-try-blocks"}

此前，Kotlin 会将在 `try` 块内进行的赋值用于该代码块之后的智能转换，这可能会破坏类型安全与为 null 安全性并导致运行时失败。此版本修复了该问题，使智能转换更加严格，但会破坏一些依赖此类智能转换的代码。

若要切换回旧的智能转换行为，请将回退标志 `-Xlegacy-smart-cast-after-try` 作为编译器参数传递。它将在 Kotlin 1.3 中被弃用。

### 弃用：数据类重写 copy {id="deprecation-data-classes-overriding-copy"}

当数据类派生自一个已具有相同签名的 `copy` 函数的类型时，为该数据类生成的 `copy` 实现会使用来自超类型的默认值，从而导致反直觉的行为，或者在超类型中没有默认形参时在运行时失败。

会导致 `copy` 冲突的继承在 Kotlin 1.2 中已通过警告弃用，并将在 Kotlin 1.3 中成为错误。

### 弃用：枚举项中的嵌套类型 {id="deprecation-nested-types-in-enum-entries"}

在枚举项内部，由于初始化逻辑中的问题，定义非 `inner class` 的嵌套类型已被弃用。这在 Kotlin 1.2 中会引发警告，并将在 Kotlin 1.3 中成为错误。

### 弃用：vararg 的单个具名实参 {id="deprecation-single-named-argument-for-vararg"}

为了与注解中的数组文字保持一致，以具名形式为 vararg 形参传递单个项（`foo(items = i)`）已被弃用。请结合使用扩展运算符与对应的数组工厂函数：

```kotlin
foo(items = *arrayOf(1))
```

在这些情况下有一项优化可消除多余的数组创建，从而防止性能下降。单实参形式在 Kotlin 1.2 中会产生警告，并将在 Kotlin 1.3 中被废除。

### 弃用：继承自 Throwable 的泛型类的内部类 {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

继承自 `Throwable` 的泛型类型的内部类在 throw-catch 场景下可能会破坏类型安全，因此已被弃用，在 Kotlin 1.2 中会产生警告，在 Kotlin 1.3 中会成为错误。

### 弃用：修改只读属性的支持字段 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

在自定义 getter 中通过赋值 `field = ...` 来修改只读属性的支持字段已被弃用，在 Kotlin 1.2 中会产生警告，在 Kotlin 1.3 中会成为错误。

## 标准库 {id="standard-library"}

### Kotlin 标准库构件与拆分包 {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 标准库现已完全兼容 Java 9 模块系统，该系统禁止拆分包（多个 jar 文件在同一个包中声明类）。为了支持该特性，引入了新的构件 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8`，以取代旧的 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8`。

从 Kotlin 的角度来看，新构件中的声明在相同的包名下可见，但对于 Java 则具有不同的包名。因此，切换到新构件不需要对你的源代码进行任何更改。

为确保与新模块系统兼容而做出的另一项更改是：从 `kotlin-reflect` 库中移除了 `kotlin.reflect` 包中的已弃用声明。如果你之前在使用它们，则需要切换为使用 `kotlin.reflect.full` 包中的声明，该包自 Kotlin 1.1 起就已受支持。

### windowed、chunked、zipWithNext {id="windowed-chunked-zipwithnext"}

`Iterable<T>`、`Sequence<T>` 和 `CharSequence` 的新扩展涵盖了诸如缓冲或批处理（`chunked`）、滑动窗口与计算滑动平均值（`windowed`），以及处理后续元素的成对项（`zipWithNext`）等用例：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..9).map { it * it }

    val chunkedIntoLists = items.chunked(4)
    val points3d = items.chunked(3) { (x, y, z) -> Triple(x, y, z) }
    val windowed = items.windowed(4)
    val slidingAverage = items.windowed(4) { it.average() }
    val pairwiseDifferences = items.zipWithNext { a, b -> b - a }
//sampleEnd

    println("items: $items\n")

    println("chunked into lists: $chunkedIntoLists")
    println("3D points: $points3d")
    println("windowed by 4: $windowed")
    println("sliding average by 4: $slidingAverage")
    println("pairwise differences: $pairwiseDifferences")
}
```
{kotlin-runnable="true"}

### fill、replaceAll、shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

添加了一组用于操作列表的扩展函数：适用于 `MutableList` 的 `fill`、`replaceAll` 与 `shuffle`，以及适用于只读 `List` 的 `shuffled`：

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..5).toMutableList()
    
    items.shuffle()
    println("Shuffled items: $items")
    
    items.replaceAll { it * 2 }
    println("Items doubled: $items")
    
    items.fill(5)
    println("Items filled with 5: $items")
//sampleEnd
}
```
{kotlin-runnable="true"}

### kotlin-stdlib 中的数学运算 {id="math-operations-in-kotlin-stdlib"}

为满足长期以来的需求，Kotlin 1.2 添加了 JVM 和 JS 通用的数学运算 API `kotlin.math`，其中包含以下内容：

* 常量：`PI` 与 `E`
* 三角函数：`cos`、`sin`、`tan` 以及它们的反函数：`acos`、`asin`、`atan`、`atan2`
* 双曲函数：`cosh`、`sinh`、`tanh` 以及它们的反函数：`acosh`、`asinh`、`atanh`
* 幂运算：`pow`（扩展函数）、`sqrt`、`hypot`、`exp`、`expm1`
* 对数：`log`、`log2`、`log10`、`ln`、`ln1p`
* 舍入：
    * `ceil`、`floor`、`truncate`、`round`（奇进偶不进，half to even）函数
    * `roundToInt`、`roundToLong`（舍入到整数）扩展函数
* 符号与绝对值：
    * `abs` 与 `sign` 函数
    * `absoluteValue` 与 `sign` 扩展属性
    * `withSign` 扩展函数
* 两个值的 `max` 与 `min`
* 二进制表示：
    * `ulp` 扩展属性
    * `nextUp`、`nextDown`、`nextTowards` 扩展函数
    * `toBits`、`toRawBits`、`Double.fromBits`（这些位于 `kotlin` 包中）

同一组函数（但不包括常量）也适用于 `Float` 实参。

### BigInteger 与 BigDecimal 的运算符和转换 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2 引入了一组用于操作 `BigInteger` 与 `BigDecimal` 以及从其他数字类型创建它们的函数。包括：

* 用于 `Int` 和 `Long` 的 `toBigInteger`
* 用于 `Int`、`Long`、`Float`、`Double` 和 `BigInteger` 的 `toBigDecimal`
* 算术和按位运算符函数：
    * 二元运算符 `+`、`-`、`*`、`/`、`%` 以及中缀函数 `and`、`or`、`xor`、`shl`、`shr`
    * 一元运算符 `-`、`++`、`--` 以及函数 `inv`

### 浮点数与位表示的相互转换 {id="floating-point-to-bits-conversions"}

添加了用于在 `Double` 和 `Float` 与其位表示之间进行相互转换的新函数：

* `toBits` 与 `toRawBits`：对于 `Double` 返回 `Long`，对于 `Float` 返回 `Int`
* `Double.fromBits` 与 `Float.fromBits`：用于从位表示创建浮点数

### Regex 现已可序列化 {id="regex-is-now-serializable"}

`kotlin.text.Regex` 类现已实现 `Serializable`，可在可序列化层次结构中使用。

### Closeable.use 会在可用时调用 Throwable.addSuppressed {id="closeable-use-calls-throwable-addsuppressed-if-available"}

在发生其他异常之后关闭资源期间若抛出异常，`Closeable.use` 函数会调用 `Throwable.addSuppressed`。

要启用此行为，你的依赖项中需要包含 `kotlin-stdlib-jdk7`。

## JVM 后端 {id="jvm-backend"}

### 构造函数调用规范化 {id="constructor-calls-normalization"}

从 1.0 版本开始，Kotlin 就支持包含复杂控制流的表达式，例如 try-catch 表达式和内联函数调用。根据 Java 虚拟机规范，此类代码是有效的。不幸的是，当此类表达式出现在构造函数调用的实参中时，某些字节码处理工具无法很好地处理此类代码。

为了为这些字节码处理工具的用户缓解这一问题，我们添加了一个命令行编译器选项（`-Xnormalize-constructor-calls=MODE`），指示编译器为此类结构生成更接近 Java 风格的字节码。此处的 `MODE` 是以下之一：

* `disable`（默认）– 以与 Kotlin 1.0 和 1.1 相同的方式生成字节码。
* `enable` – 为构造函数调用生成类 Java 的字节码。这可能会改变类的加载和初始化顺序。
* `preserve-class-initialization` – 为构造函数调用生成类 Java 的字节码，同时确保保留类初始化顺序。这可能会影响应用程序的整体性能；仅当你具有在多个类之间共享并在类初始化时更新的复杂状态时才使用此选项。

“手动”变通方法是将具有控制流的子表达式的值存储在变量中，而不是直接在调用实参内部求值。这类似于 `-Xnormalize-constructor-calls=enable`。

### Java 默认方法调用 {id="java-default-method-calls"}

在 Kotlin 1.2 之前，当目标为 JVM 1.6 时，重写 Java 默认方法的接口成员会在 super 调用时产生警告：`Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'`。在 Kotlin 1.2 中，这改为报告**错误**，因此要求所有此类代码必须使用 JVM 目标 1.8 进行编译。

### 破坏性变更：平台类型 x.equals(null) 的行为一致性 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

在映射到 Java 原语类型的平台类型（`Int!`、`Boolean!`、`Short`!、`Long!`、`Float!`、`Double!`、`Char!`）上调用 `x.equals(null)` 时，若 `x` 为 null 会错误地返回 `true`。从 Kotlin 1.2 开始，在平台类型的 null 值上调用 `x.equals(...)` **会抛出 NPE**（但 `x == ...` 不会）。

若要恢复到 1.2 之前的行为，请向编译器传递标志 `-Xno-exception-on-explicit-equals-for-boxed-null`。

### 破坏性变更：修复平台 null 通过内联扩展接收者逃逸的问题 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

在平台类型的 null 值上调用的内联扩展函数之前不会检查接收者是否为 null，从而允许 null 逃逸到其他代码中。Kotlin 1.2 强制在调用站点进行此项检查，若接收者为 null 则抛出异常。

若要切换回旧行为，请向编译器传递回退标志 `-Xno-receiver-assertions`。

## JavaScript 后端 {id="javascript-backend"}

### 默认启用 TypedArrays 支持 {id="typedarrays-support-enabled-by-default"}

将 Kotlin 原语数组（如 `IntArray`、`DoubleArray`）转换为 [JavaScript 类型化数组](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)的 JS 类型化数组支持，此前是一项需主动启用的功能，现在已默认启用。

## 工具 {id="tools"}

### 将警告视为错误 {id="warnings-as-errors"}

编译器现在提供了一个将所有警告视为错误的选项。在命令行中使用 `-Werror`，或使用以下 Gradle 代码段：

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```