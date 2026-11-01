[//]: # (title: Kotlin 1.3 的最新变化)

<web-summary>阅读 Kotlin 1.3 发布说明，了解新的语言功能，Kotlin 多平台、JVM、Native、JS 的更新，以及针对 Gradle 和 Maven 的构建工具支持。</web-summary>

_发布日期：2018 年 10 月 29 日_

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 协程正式发布 {id="coroutines-release"}

经过长期且广泛的实战检验，协程现已正式发布！这意味着从 Kotlin 1.3 开始，该语言支持和 API 已经[完全稳定](components-stability.md)。欢迎查看全新的[协程概述](coroutines-overview.md)页面。

Kotlin 1.3 引入了对挂起函数的可调用引用，并在反射 API 中提供了对协程的支持。

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.3 继续对 Native 目标平台进行改进与完善。详情请参阅 [Kotlin/Native 概述](native-overview.md)。

## 多平台项目 {id="multiplatform-projects"}

在 1.3 中，我们彻底重构了多平台项目的模型，以提高表现力和灵活性，并使共享通用代码更加容易。此外，Kotlin/Native 现已作为目标平台之一受到支持！

与旧模型相比，主要差异如下：

  * 在旧模型中，通用代码和平台特定代码需要放在由 `expectedBy` 依赖项链接的单独模块中。现在，通用代码和平台特定代码放在同一模块的不同源根目录中，使项目配置更加简单。
  * 针对不同支持的平台，现在提供了大量的[预设平台配置](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)。
  * [依赖项配置](https://kotlinlang.org/docs/multiplatform/multiplatform-add-dependencies.html)已更改；现在为每个源根目录单独指定依赖项。
  * 源集现在可以在任意平台子集之间共享（例如，在面向 JS、Android 和 iOS 的模块中，可以拥有仅在 Android 和 iOS 之间共享的源集）。
  * 现已支持[发布多平台库](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

有关更多信息，请参阅[多平台编程文档](https://kotlinlang.org/docs/multiplatform/get-started.html)。

## 契约 (Contracts) {id="contracts"}

Kotlin 编译器会进行广泛的静态分析，以提供警告并减少模板代码。其中最显著的功能之一是智能转换（smartcasts）——能够根据已执行的类型检查自动执行类型转换：

```kotlin
fun foo(s: String?) {
    if (s != null) s.length // 编译器会自动将 's' 转换为 'String'
}
```

然而，一旦将这些检查提取到单独的函数中，所有智能转换就会立即失效：

```kotlin
fun String?.isNotNull(): Boolean = this != null

fun foo(s: String?) {
    if (s.isNotNull()) s.length // 没有智能转换 :(
}
```

为了改善此类情况下的行为，Kotlin 1.3 引入了一种名为*契约*（contracts）的实验性机制。

*契约*允许函数以编译器可理解的方式显式描述其行为。目前支持两大类用例：

* 通过声明函数调用结果与传入实参值之间的关系，改进智能转换分析：

```kotlin
fun require(condition: Boolean) {
    // 这种语法形式告诉编译器：
    // “如果该函数成功返回，则传入的 'condition' 为 true”
    contract { returns() implies condition }
    if (!condition) throw IllegalArgumentException(...)
}

fun foo(s: String?) {
    require(s is String)
    // 此处 s 会被智能转换为 'String'，因为否则
    // 'require' 将会抛出异常
}
```

* 在存在高阶函数的情况下，改进变量初始化分析：

```kotlin
fun synchronize(lock: Any?, block: () -> Unit) {
    // 它告诉编译器：
    // “该函数将在此处立即调用 'block'，且仅调用一次”
    contract { callsInPlace(block, EXACTLY_ONCE) }
}

fun foo() {
    val x: Int
    synchronize(lock) {
        x = 42 // 编译器知道传递给 'synchronize' 的 lambda 表达式仅被调用一次，
               // 因此不会报告重新赋值错误
    }
    println(x) // 编译器知道 lambda 表达式必定会被调用并执行初始化，
               // 因此 'x' 在此处被视为已初始化
}
```

### 标准库中的契约 {id="contracts-in-stdlib"}

`stdlib` 已经开始使用契约，从而改善了上述的分析能力。契约的这一部分是**稳定**的，这意味着你现在无需任何额外的选择性加入（opt-in）即可享受改进分析带来的好处：

```kotlin
//sampleStart
fun bar(x: String?) {
    if (!x.isNullOrEmpty()) {
        println("length of '$x' is ${x.length}") // 太棒了，智能转换为非 null！
    }
}
//sampleEnd
fun main() {
    bar(null)
    bar("42")
}
```
{kotlin-runnable="true"}

### 自定义契约 {id="custom-contracts"}

你可以为自己的函数声明契约，但该功能目前处于**实验性**阶段，因为目前的语法处于早期原型状态，极有可能会发生更改。另外请注意，目前 Kotlin 编译器不会验证契约，因此编写正确且完备的契约是程序员的责任。

自定义契约通过调用 `contract` 标准库函数引入，该函数提供了 DSL 作用域：

```kotlin
fun String?.isNullOrEmpty(): Boolean {
    contract {
        returns(false) implies (this@isNullOrEmpty != null)
    }
    return this == null || isEmpty()
}
```

有关语法的详细信息以及兼容性声明，请参阅 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/kotlin-contracts.md)。

## 将 when 主语捕获到变量中 {id="capturing-when-subject-in-a-variable"}

在 Kotlin 1.3 中，现已支持将 `when` 的主语捕获到变量中：

```kotlin
fun Request.getBody() =
        when (val response = executeRequest()) {
            is Success -> response.body
            is HttpError -> throw HttpException(response.status)
        }
```

虽然之前也可以紧接在 `when` 之前提取该变量，但 `when` 中的 `val` 将其作用域正确限制在 `when` 的主体内，从而防止命名空间污染。[在此处查看有关 `when` 的完整文档](control-flow.md#when-expressions-and-statements)。

## 接口伴生对象中的 @JvmStatic 与 @JvmField {id="jvmstatic-and-jvmfield-in-companions-of-interfaces"}

在 Kotlin 1.3 中，可以使用注解 `@JvmStatic` 和 `@JvmField` 标记接口的 `companion` 对象成员。在 class 文件中，这些成员将被提升到相应的接口中并标记为 `static`。

例如，以下 Kotlin 代码：

```kotlin
interface Foo {
    companion object {
        @JvmField
        val answer: Int = 42

        @JvmStatic
        fun sayHello() {
            println("Hello, world!")
        }
    }
}
```

等同于以下 Java 代码：

```java
interface Foo {
    public static int answer = 42;
    public static void sayHello() {
        // ...
    }
}
```

## 注解类中的嵌套声明 {id="nested-declarations-in-annotation-classes"}

在 Kotlin 1.3 中，注解类可以包含嵌套类、接口、对象以及伴生对象：

```kotlin
annotation class Foo {
    enum class Direction { UP, DOWN, LEFT, RIGHT }
    
    annotation class Bar

    companion object {
        fun foo(): Int = 42
        val bar: Int = 42
    }
}
```

## 无参 main 函数 {id="parameterless-main"}

按照惯例，Kotlin 程序的入口点是一个签名类似于 `main(args: Array<String>)` 的函数，其中 `args` 表示传递给程序的命令行实参。然而，并非所有应用程序都支持命令行实参，因此该形参通常最终并未被使用。

Kotlin 1.3 引入了更简洁的不带形参的 `main` 形式。现在 Kotlin 中的“Hello, World”缩短了 19 个字符！

```kotlin
fun main() {
    println("Hello, world!")
}
```
{kotlin-runnable="true"}

## 支持更多形参数量的函数 {id="functions-with-big-arity"}

在 Kotlin 中，函数类型表示为接收不同数量形参的泛型类：`Function0<R>`、`Function1<P0, R>`、`Function2<P0, P1, R>`……这种方法存在一个问题，即该列表是有限的，目前止步于 `Function22`。

Kotlin 1.3 放宽了此限制，并添加了对具有更多形参数量的函数（big arity）的支持：

```kotlin
fun trueEnterpriseComesToKotlin(block: (Any, Any, ... /* 另外 42 个 */, Any) -> Any) {
    block(Any(), Any(), ..., Any())
}
```

## 渐进模式 (Progressive mode) {id="progressive-mode"}

Kotlin 非常注重代码的稳定性和向后兼容性：Kotlin 兼容性策略规定，破坏性更改（例如，使原本可以正常编译的代码无法再编译的更改）只能在主要版本（**1.2**、**1.3** 等）中引入。

我们相信，许多用户可以接受更快的迭代周期，以便立即获取关键的编译器错误修复，从而使代码更安全、更正确。因此，Kotlin 1.3 引入了*渐进*（progressive）编译器模式，可以通过向编译器传递参数 `-progressive` 来启用该模式。

在渐进模式下，语言语义的某些修复可以立即生效。所有这些修复都具有两个重要特性：

* 它们保留了源代码与旧编译器的向后兼容性，这意味着所有能通过渐进式编译器编译的代码，也可以通过非渐进式编译器正常编译。
* 它们在某种意义上只会使代码*更安全*——例如，某些不可靠的智能转换可能会被禁止，生成的代码行为可能会发生变化以变得更加可预测/稳定，等等。

启用渐进模式可能需要你重写部分代码，但工作量通常不会很大——在渐进模式下启用的所有修复都经过精心挑选、审查，并提供了工具迁移支持。我们期望渐进模式对于任何维护积极且迅速更新到最新语言版本的代码库来说，都是一个绝佳的选择。

## 内联类 (Inline classes) {id="inline-classes"}

>内联类处于 [Alpha](components-stability.md) 阶段。它们在未来可能会发生不兼容的变更并需要手动迁移。
> 我们欢迎你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供反馈。
> 详情请参阅[参考文档](inline-classes.md)。
>
{style="warning"}

Kotlin 1.3 引入了一种新的声明类型——`inline class`。内联类可以看作是常规类的受限版本，特别是内联类必须恰好包含一个属性：

```kotlin
inline class Name(val s: String)
```

Kotlin 编译器将利用此限制积极优化内联类的运行时表示，并在可能的情况下将其底层属性的值直接替换其实例，从而消除构造函数调用、减轻垃圾回收压力并启用其他优化：

```kotlin
inline class Name(val s: String)
//sampleStart
fun main() {
    // 下一行代码不会发生构造函数调用，
    // 并且在运行时 'name' 仅包含字符串 "Kotlin"
    val name = Name("Kotlin")
    println(name.s) 
}
//sampleEnd
```
{kotlin-runnable="true"}

详情请参阅内联类[参考文档](inline-classes.md)。

## 无符号整数 {id="unsigned-integers"}

> 无符号整数处于 [Beta](components-stability.md) 阶段。
> 其实现已基本稳定，但未来可能仍需要一些迁移步骤。
> 我们将尽最大努力减少你需要进行的任何更改。
>
{style="warning"}

Kotlin 1.3 引入了无符号整数类型：

* `kotlin.UByte`：无符号 8 位整数，范围为 0 到 255
* `kotlin.UShort`：无符号 16 位整数，范围为 0 到 65535
* `kotlin.UInt`：无符号 32 位整数，范围为 0 到 2^32 - 1
* `kotlin.ULong`：无符号 64 位整数，范围为 0 到 2^64 - 1

有符号类型的大多数功能在无符号对应类型中同样受支持：

```kotlin
fun main() {
//sampleStart
// 可以使用字面值后缀定义无符号类型
val uint = 42u 
val ulong = 42uL
val ubyte: UByte = 255u

// 可以通过 stdlib 扩展在有符号类型和无符号类型之间相互转换：
val int = uint.toInt()
val byte = ubyte.toByte()
val ulong2 = byte.toULong()

// 无符号类型支持类似的运算符：
val x = 20u + 22u
val y = 1u shl 8
val z = "128".toUByte()
val range = 1u..5u
//sampleEnd
println("ubyte: $ubyte, byte: $byte, ulong2: $ulong2")
println("x: $x, y: $y, z: $z, range: $range")
}
```
{kotlin-runnable="true"}

详情请参阅[参考文档](unsigned-integer-types.md)。

## @JvmDefault {id="jvmdefault"}

>`@JvmDefault` 处于[实验性](components-stability.md)阶段。它可能随时被弃用或更改。
> 仅可用于评估目的。我们欢迎你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供反馈。
>
{style="warning"}

Kotlin 面向广泛的 Java 版本，包括不允许在接口中使用默认方法的 Java 6 和 Java 7。为了方便起见，Kotlin 编译器变通解决了该限制，但该变通方案与 Java 8 中引入的 `default` 方法不兼容。

这可能会对 Java 互操作性带来问题，因此 Kotlin 1.3 引入了 `@JvmDefault` 注解。使用此注解标注的方法将针对 JVM 生成为 `default` 方法：

```kotlin
interface Foo {
    // 将生成为 'default' 方法
    @JvmDefault
    fun foo(): Int = 42
}
```

> 警告！使用 `@JvmDefault` 为 API 添加注解会对二进制兼容性产生重大影响。
在生产环境中使用 `@JvmDefault` 之前，请务必仔细阅读[参考页面](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default/index.html)。
>
{style="warning"}

## 标准库 {id="standard-library"}

### 多平台随机数生成 {id="multiplatform-random"}

在 Kotlin 1.3 之前，没有在所有平台上生成随机数的统一方法——我们不得不求助于平台特定的解决方案，例如 JVM 上的 `java.util.Random`。本版本通过引入可在所有平台上使用的 `kotlin.random.Random` 类解决了此问题：

```kotlin
import kotlin.random.Random

fun main() {
//sampleStart
    val number = Random.nextInt(42)  // number 在范围 [0, limit) 内
    println(number)
//sampleEnd
}
```
{kotlin-runnable="true"}

### isNullOrEmpty 与 orEmpty 扩展 {id="isnullorempty-and-orempty-extensions"}

某些类型的 `isNullOrEmpty` 和 `orEmpty` 扩展已在标准库中提供。前者在接收者为 `null` 或为空时返回 `true`，而后者在接收者为 `null` 时回退到空实例。Kotlin 1.3 为集合、映射以及对象数组提供了类似的扩展。

### 在两个现有数组之间复制元素 {id="copy-elements-between-two-existing-arrays"}

针对现有数组类型（包括无符号数组）的 `array.copyInto(targetArray, targetOffset, startIndex, endIndex)` 函数，使在纯 Kotlin 中实现基于数组的容器变得更加容易。

```kotlin
fun main() {
//sampleStart
    val sourceArr = arrayOf("k", "o", "t", "l", "i", "n")
    val targetArr = sourceArr.copyInto(arrayOfNulls<String>(6), 3, startIndex = 3, endIndex = 6)
    println(targetArr.contentToString())
    
    sourceArr.copyInto(targetArr, startIndex = 0, endIndex = 3)
    println(targetArr.contentToString())
//sampleEnd
}
```
{kotlin-runnable="true"}

### associateWith {id="associatewith"}

拥有一个键列表并希望通过将这些键与某个值相关联来构建映射，是一种非常常见的情况。以前可以使用 `associate { it to getValue(it) }` 函数来完成，但现在我们引入了一种更高效且更易探索的替代方案：`keys.associateWith { getValue(it) }`。

```kotlin
fun main() {
//sampleStart
    val keys = 'a'..'f'
    val map = keys.associateWith { it.toString().repeat(5).capitalize() }
    map.forEach { println(it) }
//sampleEnd
}
```

### ifEmpty 与 ifBlank 函数 {id="ifempty-and-ifblank-functions"}

集合、映射、对象数组、字符序列和序列现在都具有 `ifEmpty` 函数，允许指定一个后备值，该值将在接收者为空时替代接收者使用：

```kotlin
fun main() {
//sampleStart
    fun printAllUppercase(data: List<String>) {
        val result = data
        .filter { it.all { c -> c.isUpperCase() } }
            .ifEmpty { listOf("<no uppercase>") }
        result.forEach { println(it) }
    }
    
    printAllUppercase(listOf("foo", "Bar"))
    printAllUppercase(listOf("FOO", "BAR"))
//sampleEnd
}
```
{kotlin-runnable="true"}

此外，字符序列和字符串还具有 `ifBlank` 扩展，其作用与 `ifEmpty` 相同，但它检查字符串是否全部为空格，而不仅仅是为空。

```kotlin
fun main() {
//sampleStart
    val s = "    \n"
    println(s.ifBlank { "<blank>" })
    println(s.ifBlank { null })
//sampleEnd
}
```
{kotlin-runnable="true"}

### 反射中的密封类 {id="sealed-classes-in-reflection"}

我们在 `kotlin-reflect` 中添加了一个新的 API，可用于枚举 `sealed` 类的所有直接子类型，即 `KClass.sealedSubclasses`。

### 细微变更 {id="smaller-changes"}

* `Boolean` 类型现在拥有伴生对象。
* `Any?.hashCode()` 扩展在针对 `null` 时返回 0。
* `Char` 现在提供 `MIN_VALUE` 和 `MAX_VALUE` 常量。
* 基本类型伴生对象中添加了 `SIZE_BYTES` 和 `SIZE_BITS` 常量。

## 工具 {id="tooling"}

### IDE 中的代码样式支持 {id="code-style-support-in-ide"}

Kotlin 1.3 引入了对 IntelliJ IDEA 中[推荐代码样式](coding-conventions.md)的支持。请查看[此页面](code-style-migration-guide.md)了解迁移准则。

### kotlinx.serialization {id="kotlinx-serialization"}

[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) 是一个为 Kotlin 中的对象（反）序列化提供多平台支持的库。以前它是一个独立的项目，但从 Kotlin 1.3 开始，它与其他编译器插件一样随 Kotlin 编译器发行版一起分发。主要区别在于，你无需手动确认序列化 IDE 插件是否与正在使用的 Kotlin IDE 插件版本兼容：现在 Kotlin IDE 插件已经内置了序列化支持！

有关[详情](https://github.com/Kotlin/kotlinx.serialization#current-project-status)请参阅此处。

> 尽管 kotlinx.serialization 现在随 Kotlin 编译器发行版一起分发，但它在 Kotlin 1.3 中仍被视为实验性功能。
>
{style="warning"}

### 脚本更新 {id="scripting-update"}

>脚本功能处于[实验性](components-stability.md)阶段。它可能随时被弃用或更改。
> 仅可用于评估目的。我们欢迎你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供反馈。
>
{style="warning"}

Kotlin 1.3 继续演进和改进脚本 API，引入了对脚本自定义的实验性支持，例如添加外部属性、提供静态或动态依赖项等。

有关更多详细信息，请参阅 [KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md)。

### 临时文件支持 {id="scratches-support"}

Kotlin 1.3 引入了对可运行 Kotlin *临时文件*（scratch files）的支持。*临时文件*是扩展名为 .kts 的 Kotlin 脚本文件，你可以在编辑器中直接运行它并获取求值结果。

有关详细信息，请参阅常规[临时文件文档](https://www.jetbrains.com/help/idea/scratches.html)。