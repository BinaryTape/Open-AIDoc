[//]: # (title: Kotlin 1.2 的最新变化)

<web-summary>阅读 Kotlin 1.2 版本说明，涵盖新语言功能、Kotlin Multiplatform、JVM 和 JS 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_发布日期：2017 年 11 月 28 日_

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

多平台项目是 Kotlin 1.2 中的一项新**实验性**功能，允许你在 Kotlin 支持的目标平台（JVM、JavaScript 以及未来的 Native）之间复用代码。在一个多平台项目中，有三种模块：

* *公共 (common)* 模块包含不特定于任何平台的代码，以及不带实现的平台相关 API 声明。
* *平台 (platform)* 模块包含公共模块中平台相关声明在特定平台上的实现，以及其他平台相关的代码。
* 普通模块针对特定平台，既可以是平台模块的依赖项，也可以依赖于平台模块。

当你为特定平台编译多平台项目时，会同时生成公共部分和平台特定部分的代码。

多平台项目支持的一个关键功能是可以通过 *expected* 和 *actual* 声明来表达公共代码对平台特定部分的依赖。*expected* 声明指定了一个 API（类、接口、注解、顶级声明等）。*actual* 声明则是该 API 的平台相关实现，或者是引用外部库中现有 API 实现的类型别名。示例如下：

在公共代码中：

```kotlin
// 预期的平台特定 API：
expect fun hello(world: String): String

fun greet() {
    // 使用预期的 API：
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

有关构建多平台项目的详细信息和步骤，请参阅[多平台编程文档](https://kotlinlang.org/docs/multiplatform/get-started.html)。

## 其他语言功能 {id="other-language-features"}

### 注解中的数组字面量 {id="array-literals-in-annotations"}

从 Kotlin 1.2 开始，注解的数组实参可以使用新的数组字面量语法传递，而不再需要使用 `arrayOf` 函数：

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

数组字面量语法仅限于注解实参。

### Lateinit 顶级属性和局部变量 {id="lateinit-top-level-properties-and-local-variables"}

`lateinit` 修饰符现在可以用于顶级属性和局部变量。例如，当作为构造函数实参传递给一个对象的 lambda 引用了另一个必须稍后定义的对象时，可以使用局部变量：

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 三个节点的循环：
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 检查 lateinit 变量是否已初始化 {id="check-whether-a-lateinit-var-is-initialized"}

你现在可以通过属性引用上的 `isInitialized` 来检查 lateinit 变量是否已初始化：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 带默认函数参数的内联函数 {id="inline-functions-with-default-functional-parameters"}

内联函数现在允许为其内联的函数参数提供默认值：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 显式转换的信息用于类型推断 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin 编译器现在可以在类型推断中使用来自类型转换的信息。如果你调用一个返回类型形参 `T` 的泛型方法，并将返回值转换为特定类型 `Foo`，编译器现在会理解该调用的 `T` 需要绑定到 `Foo` 类型。

这对 Android 开发者尤为重要，因为编译器现在可以正确分析 Android API level 26 中的泛型 `findViewById` 调用：

```kotlin
val button = findViewById(R.id.button) as Button
```

### 智能转换改进 {id="smart-cast-improvements"}

当一个变量由安全调用表达式赋值并进行 null 检查时，智能转换现在也会应用于安全调用的接收者：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

此外，对于仅在 lambda 之前被修改的局部变量，现在允许在 lambda 中进行智能转换：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 支持 ::foo 作为 this::foo 的简写 {id="support-for-foo-as-a-shorthand-for-this-foo"}

指向 `this` 成员的绑定可调用引用现在可以不写显式接收者，使用 `::foo` 代替 `this::foo`。这也使得在引用外部接收者成员的 lambda 中使用可调用引用更加方便。

### 破坏性变更：try 块后可靠的智能转换 {id="breaking-change-sound-smart-casts-after-try-blocks"}

此前，Kotlin 会将在 `try` 块内进行的赋值用于块后的智能转换，这可能会破坏类型安全和 null 安全并导致运行时故障。此版本修复了该问题，使智能转换更加严格，但会破坏一些依赖此类智能转换的代码。

要切换回旧的智能转换行为，请将回退标志 `-Xlegacy-smart-cast-after-try` 作为编译器参数传递。该标志将在 Kotlin 1.3 中被弃用。

### 弃用：数据类重写 copy {id="deprecation-data-classes-overriding-copy"}

当数据类派生自一个已经拥有相同签名的 `copy` 函数的类型时，为该数据类生成的 `copy` 实现会使用基类型的默认值，这会导致违反直觉的行为；如果基类型中没有默认参数，则会在运行时失败。

在 Kotlin 1.2 中，导致 `copy` 冲突的继承已被弃用并会发出警告，在 Kotlin 1.3 中将成为错误。

### 弃用：枚举条目中的嵌套类型 {id="deprecation-nested-types-in-enum-entries"}

在枚举条目内部，由于初始化逻辑的问题，定义非 `inner class` 的嵌套类型已被弃用。这在 Kotlin 1.2 中会导致警告，在 Kotlin 1.3 中将成为错误。

### 弃用：vararg 的单个命名实参 {id="deprecation-single-named-argument-for-vararg"}

为了与注解中的数组字面量保持一致，以命名形式为 vararg 参数传递单个条目（`foo(items = i)`）已被弃用。请使用扩展运算符配合相应的数组工厂函数：

```kotlin
foo(items = *arrayOf(1))
```

存在一种优化可以移除此类情况下冗余的数组创建，从而防止性能下降。单实参形式在 Kotlin 1.2 中产生警告，并将在 Kotlin 1.3 中移除。

### 弃用：继承 Throwable 的泛型类的内部类 {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

继承自 `Throwable` 的泛型类型的内部类可能会在 throw-catch 场景中违反类型安全，因此已被弃用。在 Kotlin 1.2 中会发出警告，在 Kotlin 1.3 中将成为错误。

### 弃用：修改只读属性的支持字段 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

在自定义 getter 中通过赋值 `field = ...` 来修改只读属性的支持字段已被弃用。在 Kotlin 1.2 中会发出警告，在 Kotlin 1.3 中将成为错误。

## 标准库 {id="standard-library"}

### Kotlin 标准库构件与拆分包 {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 标准库现在与 Java 9 模块系统完全兼容，该系统禁止拆分包（多个 jar 文件在同一个包中声明类）。为了支持这一点，引入了新的构件 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8`，它们取代了旧的 `kotlin-stdlib-jre7` 和 `kotlin-stdlib-jre8`。

从 Kotlin 的角度来看，新构件中的声明在相同的包名下可见，但在 Java 中具有不同的包名。因此，切换到新构件不需要对源代码进行任何更改。

为确保与新模块系统兼容而做的另一项更改是从 `kotlin-reflect` 库中移除了 `kotlin.reflect` 包中已弃用的声明。如果你正在使用它们，需要切换到使用 `kotlin.reflect.full` 包中的声明，该包自 Kotlin 1.1 起受到支持。

### windowed, chunked, zipWithNext {id="windowed-chunked-zipwithnext"}

针对 `Iterable<T>`、`Sequence<T>` 和 `CharSequence` 的新扩展涵盖了诸如缓冲或批处理（`chunked`）、滑动窗口和计算滑动平均值（`windowed`）以及处理后续元素对（`zipWithNext`）等用例：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### fill, replaceAll, shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

添加了一组用于操作列表的扩展函数：用于 `MutableList` 的 `fill`、`replaceAll` 和 `shuffle`，以及用于只读 `List` 的 `shuffled`：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### kotlin-stdlib 中的数学运算 {id="math-operations-in-kotlin-stdlib"}

为了满足长期以来的需求，Kotlin 1.2 添加了用于数学运算的 `kotlin.math` API，该 API 在 JVM 和 JS 中是通用的，包含以下内容：

* 常量：`PI` 和 `E`
* 三角函数：`cos`、`sin`、`tan` 及其反函数：`acos`、`asin`、`atan`、`atan2`
* 双曲函数：`cosh`、`sinh`、`tanh` 及其反函数：`acosh`、`asinh`、`atanh`
* 幂运算：`pow`（扩展函数）、`sqrt`、`hypot`、`exp`、`expm1`
* 对数函数：`log`、`log2`、`log10`、`ln`、`ln1p`
* 取整：
    * `ceil`、`floor`、`truncate`、`round`（向最近的偶数取整）函数
    * `roundToInt`、`roundToLong`（向最近的整数取整）扩展函数
* 符号和绝对值：
    * `abs` 和 `sign` 函数
    * `absoluteValue` 和 `sign` 扩展属性
    * `withSign` 扩展函数
* 两个值的 `max` 和 `min`
* 二进制表示：
    * `ulp` 扩展属性
    * `nextUp`、`nextDown`、`nextTowards` 扩展函数
    * `toBits`、`toRawBits`、`Double.fromBits`（这些位于 `kotlin` 包中）

同样的一组函数（但不含常量）也适用于 `Float` 实参。

### BigInteger 和 BigDecimal 的运算符和转换 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2 引入了一组用于操作 `BigInteger` 和 `BigDecimal` 以及从其他数字类型创建它们的函数。包括：

* 用于 `Int` 和 `Long` 的 `toBigInteger`
* 用于 `Int`、`Long`、`Float`、`Double` 和 `BigInteger` 的 `toBigDecimal`
* 算术和按位运算符函数：
    * 二元运算符 `+`、`-`、`*`、`/`、`%` 和中缀函数 `and`、`or`、`xor`、`shl`、`shr`
    * 一元运算符 `-`、`++`、`--` 和 `inv` 函数

### 浮点数到位的转换 {id="floating-point-to-bits-conversions"}

添加了用于将 `Double` 和 `Float` 与其位表示进行相互转换的新函数：

* `toBits` 和 `toRawBits` 为 `Double` 返回 `Long`，为 `Float` 返回 `Int`
* `Double.fromBits` 和 `Float.fromBits` 用于从位表示创建浮点数

### Regex 现在是可序列化的 {id="regex-is-now-serializable"}

`kotlin.text.Regex` 类现已变为 `Serializable`，可以用于可序列化的层次结构中。

### 如果可用，Closeable.use 会调用 Throwable.addSuppressed {id="closeable-use-calls-throwable-addsuppressed-if-available"}

当在关闭资源期间抛出异常且之前已有其他异常抛出时，`Closeable.use` 函数会调用 `Throwable.addSuppressed`。

要启用此行为，你的依赖项中需要包含 `kotlin-stdlib-jdk7`。

## JVM 后端 {id="jvm-backend"}

### 构造函数调用归一化 {id="constructor-calls-normalization"}

自 1.0 版本以来，Kotlin 就支持带有复杂控制流的表达式，例如 try-catch 表达式和内联函数调用。根据 Java 虚拟机规范，此类代码是有效的。遗憾的是，当此类表达式出现在构造函数调用的实参中时，一些字节码处理工具不能很好地处理此类代码。

为了减轻此类字节码处理工具用户的负担，我们添加了一个命令行编译器选项（`-Xnormalize-constructor-calls=MODE`），告诉编译器为此类构造生成更像 Java 的字节码。这里的 `MODE` 是以下之一：

* `disable`（默认）– 以与 Kotlin 1.0 和 1.1 相同的方式生成字节码。
* `enable` – 为构造函数调用生成类 Java 的字节码。这可能会改变类加载和初始化的顺序。
* `preserve-class-initialization` – 为构造函数调用生成类 Java 的字节码，确保保留类初始化顺序。这可能会影响应用程序的整体性能；仅当你拥有在多个类之间共享并在类初始化时更新的复杂状态时才使用它。

“手动”解决方法是将带有控制流的子表达式的值存储在变量中，而不是直接在调用实参中对其求值。这类似于 `-Xnormalize-constructor-calls=enable`。

### Java 默认方法调用 {id="java-default-method-calls"}

在 Kotlin 1.2 之前，针对 JVM 1.6 编译时，重写 Java 默认方法的接口成员在进行 super 调用时会产生警告：`Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'`。在 Kotlin 1.2 中，这改为**错误**，因此要求所有此类代码必须针对 JVM 目标 1.8 进行编译。

### 破坏性变更：x.equals(null) 对平台类型的行为一致性 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

在映射到 Java 原生类型（`Int!`、`Boolean!`、`Short!`、`Long!`、`Float!`、`Double!`、`Char!`）的平台类型上调用 `x.equals(null)` 时，如果 `x` 为 null，此前会错误地返回 `true`。从 Kotlin 1.2 开始，在平台类型的 null 值上调用 `x.equals(...)` 将**抛出 NPE**（但 `x == ...` 不会）。

要返回到 1.2 之前的行为，请将标志 `-Xno-exception-on-explicit-equals-for-boxed-null` 传递给编译器。

### 破坏性变更：修复平台 null 通过内联扩展接收者逃逸的问题 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

在平台类型的 null 值上调用的内联扩展函数此前不会检查接收者是否为 null，从而允许 null 逃逸到其他代码中。Kotlin 1.2 在调用站点强制执行此检查，如果接收者为 null 则抛出异常。

要切换回旧行为，请将回退标志 `-Xno-receiver-assertions` 传递给编译器。

## JavaScript 后端 {id="javascript-backend"}

### 默认启用 TypedArrays 支持 {id="typedarrays-support-enabled-by-default"}

将 Kotlin 原生数组（如 `IntArray`、`DoubleArray`）转换为 [JavaScript 类型化数组](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) 的 JS 类型化数组支持此前是一项可选功能，现在已默认启用。

## 工具 {id="tools"}

### 将警告视为错误 {id="warnings-as-errors"}

编译器现在提供了一个将所有警告视为错误的选项。在命令行上使用 `-Werror`，或使用以下 Gradle 代码段：

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```
