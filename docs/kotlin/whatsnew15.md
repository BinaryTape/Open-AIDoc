[//]: # (title: Kotlin 1.5.0 的最新变化)

<web-summary>阅读 Kotlin 1.5.0 发布说明，涵盖新语言功能、Kotlin Multiplatform 更新、JVM、Native、JS 以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布于：2021 年 5 月 5 日](releases.md#release-history)_

Kotlin 1.5.0 引入了新的语言功能、基于 IR 的稳定 JVM 编译器后端、性能改进，以及诸如使实验性功能稳定化和弃用过时功能等演进性变更。

你还可以在[发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/)中查看变更概述。

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 语言功能 {id="language-features"}

Kotlin 1.5.0 带来了此前在 [1.4.30 中预览](whatsnew1430.md#language-features)的新语言功能的稳定版本：
* [JVM records 支持](#jvm-records-support)
* [密封接口](#sealed-interfaces)与[密封类改进](#package-wide-sealed-class-hierarchies)
* [内联类](#inline-classes)

有关这些功能的详细说明，请参阅[这篇博客文章](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)以及 Kotlin 文档的相应页面。

### JVM records 支持 {id="jvm-records-support"}

Java 正在快速演进，为了确保 Kotlin 与其保持互操作性，我们引入了对其最新功能之一——[record 类](https://openjdk.java.net/jeps/395)的支持。

Kotlin 对 JVM records 的支持包括双向互操作性：
* 在 Kotlin 代码中，你可以像使用带有属性的普通类一样使用 Java record 类。
* 要在 Java 代码中将 Kotlin 类用作 record，请将其声明为 `data` 类并使用 `@JvmRecord` 注解进行标记。

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

[详细了解在 Kotlin 中使用 JVM records](jvm-records.md)。

<video src="https://www.youtube.com/v/iyEWXyuuseU" title="Support for JVM Records in Kotlin 1.5.0"/>

### 密封接口 {id="sealed-interfaces"}

Kotlin 接口现在可以使用 `sealed` 修饰符，其在接口上的作用方式与在类上相同：密封接口的所有实现都在编译时已知。

```kotlin
sealed interface Polygon
```

例如，你可以利用这一特性编写穷尽的 `when` 表达式。

```kotlin
fun draw(polygon: Polygon) = when (polygon) {
   is Rectangle -> // ...
   is Triangle -> // ...
   // 无需 else - 所有可能的实现均已覆盖
}

```

此外，密封接口支持更灵活的受限类层次结构，因为一个类可以直接继承多个密封接口。

```kotlin
class FilledRectangle: Polygon, Fillable
```

[详细了解密封接口](sealed-classes.md)。

<video src="https://www.youtube.com/v/d_Mor21W_60" title="Sealed Interfaces and Sealed Classes Improvements"/>

### 包级别密封类层次结构 {id="package-wide-sealed-class-hierarchies"}

密封类现在可以在同一编译单元和同一包下的所有文件中拥有子类。此前，所有子类都必须出现在同一个文件中。

直接子类可以是顶层的，也可以嵌套在任意数量的其他命名类、命名接口或命名对象中。

密封类的子类必须具有正确限定的名称——它们不能是局部对象或匿名对象。

[详细了解密封类层次结构](sealed-classes.md#inheritance)。

### 内联类 {id="inline-classes"}

内联类是[基于值的 (value-based)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md)类的一个子集，仅用于保存值。你可以将它们用作特定类型值的包装器，而不会产生因内存分配而带来的额外开销。

内联类可以在类名之前使用 `value` 修饰符声明：

```kotlin
value class Password(val s: String)
```

JVM 后端还需要一个特殊的 `@JvmInline` 注解：

```kotlin
@JvmInline
value class Password(val s: String)
```

`inline` 修饰符现在已被弃用并会发出警告。

[详细了解内联类](inline-classes.md)。

<video src="https://www.youtube.com/v/LpqvtgibbsQ" title="From Inline to Value Classes"/>

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin/JVM 迎来了多项改进，包括内部改进和面向用户的改进。其中最值得注意的包括：

* [稳定的 JVM IR 后端](#stable-jvm-ir-backend)
* [新的默认 JVM 目标：1.8](#new-default-jvm-target-1-8)
* [通过 invokedynamic 实现 SAM 适配器](#sam-adapters-via-invokedynamic)
* [通过 invokedynamic 实现 Lambda](#lambdas-via-invokedynamic)
* [弃用 @JvmDefault 和旧的 Xjvm-default 模式](#deprecation-of-jvmdefault-and-old-xjvm-default-modes)
* [改进对为 null 性注解的处理](#improvements-to-handling-nullability-annotations)

### 稳定的 JVM IR 后端 {id="stable-jvm-ir-backend"}

Kotlin/JVM 编译器的[基于 IR 的后端](whatsnew14.md#new-jvm-ir-backend)现已达到 [Stable](components-stability.md) 状态并默认启用。

从 [Kotlin 1.4.0](whatsnew14.md) 开始，基于 IR 的后端早期版本已可供预览，现在它已成为语言版本 `1.5` 的默认设置。对于较早的语言版本，默认仍使用旧后端。

你可以在[这篇博客文章](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)中找到有关 IR 后端的优势及其未来发展的更多详细信息。

如果你需要在 Kotlin 1.5.0 中使用旧后端，可以在项目的配置文件中添加以下代码行：

* 在 Gradle 中：

 <tabs group="build-script">
 <tab title="Kotlin" group-key="kotlin">

 ```kotlin
 tasks.withType<org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile> {
   kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 <tab title="Groovy" group-key="groovy">

 ```groovy
 tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
  kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 </tabs>

* 在 Maven 中：

 ```xml
 <configuration>
     <args>
         <arg>-Xuse-old-backend</arg>
     </args>
 </configuration>
 ```

### 新的默认 JVM 目标：1.8 {id="new-default-jvm-target-1-8"}

Kotlin/JVM 编译的默认目标版本现为 `1.8`。`1.6` 目标已被弃用。

如果你需要针对 JVM 1.6 进行构建，仍可以切换到该目标。了解具体操作方法：

* [在 Gradle 中](gradle-compiler-options.md#attributes-specific-to-jvm)
* [在 Maven 中](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [在命令行编译器中](compiler-reference.md#jvm-target-version)

### 通过 invokedynamic 实现 SAM 适配器 {id="sam-adapters-via-invokedynamic"}

Kotlin 1.5.0 现在使用动态调用 (`invokedynamic`) 来编译 SAM（单一抽象方法）转换：
* 当 SAM 类型为 [Java 接口](java-interop.md#sam-conversions)时，适用于任意表达式
* 当 SAM 类型为 [Kotlin 函数式接口](fun-interfaces.md#sam-conversions)时，适用于 lambda

新的实现使用了 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-)，在编译期间不再生成辅助包装器类。这减小了应用程序的 JAR 大小，从而提高了 JVM 启动性能。

若要回滚到基于匿名类生成的旧实现方案，请添加编译器选项 `-Xsam-conversions=class`。

了解如何在 [Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options) 和[命令行编译器](compiler-reference.md#compiler-options)中添加编译器选项。

### 通过 invokedynamic 实现 Lambda {id="lambdas-via-invokedynamic"}

> 将纯 Kotlin lambda 编译为 invokedynamic 属于[实验性功能](components-stability.md)。它可能会随时被舍弃或更改。
> 需要选择加入（详见下文），且应仅将其用于评估目的。欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-45375) 上向我们提供反馈。
>
{style="warning"}

Kotlin 1.5.0 引入了将纯 Kotlin lambda（未转换为函数式接口实例的 lambda）编译为动态调用 (`invokedynamic`) 的实验性支持。该实现通过使用 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) 生成更轻量的二进制文件，这在运行时能够高效地生成所需的类。目前，与普通 lambda 编译相比，它具有三个限制：

* 编译为 invokedynamic 的 lambda 不可序列化。
* 对此类 lambda 调用 `toString()` 会产生可读性较差的字符串表示形式。
* 实验性的 [`reflect`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API 不支持通过 `LambdaMetafactory` 创建的 lambda。

要试用此功能，请添加 `-Xlambdas=indy` 编译器选项。如果你能使用此 [YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-45375)分享你的反馈，我们将不胜感激。

了解如何在 [Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options) 和[命令行编译器](compiler-reference.md#compiler-options)中添加编译器选项。

### 弃用 @JvmDefault 和旧的 Xjvm-default 模式 {id="deprecation-of-jvmdefault-and-old-xjvm-default-modes"}

在 Kotlin 1.4.0 之前，存在 `@JvmDefault` 注解以及 `-Xjvm-default=enable` 和 `-Xjvm-default=compatibility` 模式。它们用于为 Kotlin 接口中的任何特定非抽象成员创建 JVM 默认方法。

在 Kotlin 1.4.0 中，我们[引入了新的 `Xjvm-default` 模式](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)，该模式为整个项目开启默认方法生成。

在 Kotlin 1.5.0 中，我们将弃用 `@JvmDefault` 和旧的 Xjvm-default 模式：`-Xjvm-default=enable` 与 `-Xjvm-default=compatibility`。

[详细了解 Java 互操作中的默认方法](java-to-kotlin-interop.md#default-methods-in-interfaces)。

### 改进对为 null 性注解的处理 {id="improvements-to-handling-nullability-annotations"}

Kotlin 支持使用[为 null 性注解](java-interop.md#nullability-annotations)来处理来自 Java 的类型为 null 性信息。Kotlin 1.5.0 为该功能引入了多项改进：

* 它会读取用作依赖项的已编译 Java 库中类型实参上的为 null 性注解。
* 它支持将目标为 `TYPE_USE` 的为 null 性注解应用于：
  * 数组
  * 可变实参 (Varargs)
  * 字段
  * 类型形参及其上界
  * 基类和接口的类型实参
* 如果为 null 性注解具有多个适用于某种类型的目标，且其中一个目标为 `TYPE_USE`，则优先使用 `TYPE_USE`。
  例如，如果 `@Nullable` 同时支持 `TYPE_USE` 和 `METHOD` 作为目标，则方法签名 `@Nullable String[] f()` 会转换为 `fun f(): Array<String?>!`。

对于这些新支持的情况，从 Kotlin 调用 Java 时使用错误的类型为 null 性将产生警告。
使用 `-Xtype-enhancement-improvements-strict-mode` 编译器选项可以针对这些情况启用严格模式（带有错误报告）。

[详细了解空安全与平台类型](java-interop.md#null-safety-and-platform-types)。

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native 现在性能更高且更稳定。显著变更包括：
* [性能改进](#performance-improvements)
* [停用内存泄漏检查器](#deactivation-of-the-memory-leak-checker)

### 性能改进 {id="performance-improvements"}

在 1.5.0 中，Kotlin/Native 获得了一组能够加快编译和执行速度的性能改进。

针对 `linuxX64`（仅限 Linux 主机）和 `iosArm64` 目标的调试模式现已支持[编译器缓存](https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/#kotlin-native)。启用编译器缓存后，除首次编译外，大多数调试编译的完成速度都要快得多。测试项目的测量结果显示速度提升了约 200%。

若要为新目标使用编译器缓存，可以通过在项目的 `gradle.properties` 中添加以下代码行来选择加入：
* 针对 `linuxX64`：`kotlin.native.cacheKind.linuxX64=static`
* 针对 `iosArm64`：`kotlin.native.cacheKind.iosArm64=static`

如果启用编译器缓存后遇到任何问题，请将其报告给我们的问题跟踪器 [YouTrack](https://kotl.in/issue)。

其他改进加快了 Kotlin/Native 代码的执行：
* 简单的属性访问器会被内联。
* 字符串文字上的 `trimIndent()` 会在编译期间进行求值。

### 停用内存泄漏检查器 {id="deactivation-of-the-memory-leak-checker"}

内置的 Kotlin/Native 内存泄漏检查器已默认禁用。

它最初是为内部使用而设计的，并且仅能在有限的几种情况下发现泄漏，而无法覆盖所有情况。
此外，后来发现它存在可能导致应用程序崩溃的问题。因此，我们决定关闭该内存泄漏检查器。

内存泄漏检查器在某些情况下仍然有用，例如单元测试。对于这些情况，你可以通过添加以下代码行来启用它：

```kotlin
Platform.isMemoryLeakCheckerActive = true
```

请注意，不建议在应用程序运行时启用该检查器。

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS 在 1.5.0 中迎来演进性变更。我们正在继续推进将 [JS IR 编译器后端](js-ir-compiler.md)转为稳定版的工作，并发布了其他更新：

* [升级到 webpack 5](#upgrade-to-webpack-5)
* [面向 IR 编译器的框架和库](#frameworks-and-libraries-for-the-ir-compiler)

### 升级到 webpack 5 {id="upgrade-to-webpack-5"}

Kotlin/JS Gradle 插件现在针对浏览器目标使用 webpack 5 代替 webpack 4。这是一次重大的 webpack 升级，带来了不兼容的变更。如果你使用的是自定义 webpack 配置，请务必查看 [webpack 5 发布说明](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)。

[详细了解使用 webpack 打包 Kotlin/JS 项目](js-project-setup.md#webpack-bundling)。

### 面向 IR 编译器的框架和库 {id="frameworks-and-libraries-for-the-ir-compiler"}

> Kotlin/JS IR 编译器处于 [Alpha](components-stability.md) 阶段。它未来可能会发生不兼容的变更并需要手动迁移。欢迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上向我们提供反馈。
>
{style="warning"}

在致力于开发基于 IR 的 Kotlin/JS 编译器后端的同时，我们鼓励并帮助库作者在 `both` 模式下构建他们的项目。这意味着他们能够同时为两种 Kotlin/JS 编译器生成构件，从而壮大新编译器的生态系统。

许多知名框架和库已可用于 IR 后端：[KVision](https://kvision.io/)、[fritz2](https://www.fritz2.dev/)、[doodle](https://github.com/nacular/doodle) 等。如果你在项目中使用它们，现在就可以使用 IR 后端进行构建并体验其带来的优势。

如果你正在编写自己的库，请在 'both' 模式下编译它，以便你的用户也可以在新编译器中使用它。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

在 Kotlin 1.5.0 中，[为每个平台选择测试依赖项得到了简化](#simplified-test-dependencies-usage-in-multiplatform-projects)，现在由 Gradle 插件自动完成。

用于获取字符类别的新 [API 现已在多平台项目中可用](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)。

## 标准库 {id="standard-library"}

标准库迎来了一系列变更和改进，从稳定实验性部分到添加新功能：

* [Stable 无符号整数类型](#stable-unsigned-integer-types)
* [用于大写/小写文本的 Stable 非区域性特定 API](#stable-locale-agnostic-api-for-upper-lowercasing-text)
* [Stable 字符到整数转换 API](#stable-char-to-integer-conversion-api)
* [Stable Path API](#stable-path-api)
* [向下取整除法和 mod 运算符](#floored-division-and-the-mod-operator)
* [Duration API 变更](#duration-api-changes)
* [用于获取字符类别的新 API 现已在多平台代码中可用](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)
* [新的集合函数 firstNotNullOf()](#new-collections-function-firstnotnullof)
* [String?.toBoolean() 的严格版本](#strict-version-of-string-toboolean)

你可以在[这篇博客文章](https://blog.jetbrains.com/kotlin/2021/04/kotlin-1-5-0-rc-released)中详细了解标准库的变更。

<video src="https://www.youtube.com/v/MyTkiT2I6-8" title="New Standard Library Features"/>

### Stable 无符号整数类型 {id="stable-unsigned-integer-types"}

`UInt`、`ULong`、`UByte`、`UShort` 无符号整数类型现已达到 [Stable](components-stability.md) 状态。针对这些类型的操作、区间和级数同样如此。无符号数组及其操作仍保持在 Beta 阶段。

[详细了解无符号整数类型](unsigned-integer-types.md)。

### 用于大写/小写文本的 Stable 非区域性特定 API {id="stable-locale-agnostic-api-for-upper-lowercasing-text"}

此版本带来了用于大写/小写文本转换的全新非区域性特定 API。它替代了对区域性敏感的 `toLowerCase()`、`toUpperCase()`、`capitalize()` 和 `decapitalize()` 等 API 函数。新 API 可帮助你避免因不同区域性设置而导致的错误。

Kotlin 1.5.0 提供了以下完全达到 [Stable](components-stability.md) 状态的替代项：

* 针对 `String` 函数：

  |**早期版本**|**1.5.0 替代项**|
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* 针对 `Char` 函数：

  |**早期版本**|**1.5.0 替代项**|
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> 对于 Kotlin/JVM，还提供了带有显式 `Locale` 形参的重载 `uppercase()`、`lowercase()` 和 `titlecase()` 函数。
>
{style="note"}

旧的 API 函数已被标记为废弃，并将在未来的版本中移除。

请在 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-case-conversions.md) 中查看文本处理函数的完整变更列表。

### Stable 字符到整数转换 API {id="stable-char-to-integer-conversion-api"}

从 Kotlin 1.5.0 开始，新的字符到编码以及字符到数字转换函数已达到 [Stable](components-stability.md) 状态。这些函数取代了原有的 API 函数，后者经常与类似的字符串到 Int 转换混淆。

新 API 消除了这种命名混乱，使代码行为更加透明和明确。

该版本引入的 `Char` 转换细分为以下命名明确的函数集：

* 获取 `Char` 的整数编码以及根据给定编码构造 `Char` 的函数：

 ```kotlin
 fun Char(code: Int): Char
 fun Char(code: UShort): Char
 val Char.code: Int
 ```

* 将 `Char` 转换为其所表示的数字数值的函数：

 ```kotlin
 fun Char.digitToInt(radix: Int): Int
 fun Char.digitToIntOrNull(radix: Int): Int?
 ```

* `Int` 的扩展函数，用于将其所表示的非负单个数字转换为相应的 `Char` 表示形式：

 ```kotlin
 fun Int.digitToChar(radix: Int): Char
 ```

旧的转换 API（包括带有具体实现的 `Number.toChar()`（除 `Int.toChar()` 外的所有实现）以及用于转换为数字类型的 `Char` 扩展，如 `Char.toInt()`）现已被弃用。

[在 KEEP 中详细了解字符到整数转换 API](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md)。

### Stable Path API {id="stable-path-api"}

带有 `java.nio.file.Path` 扩展的[实验性 Path API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io.path/java.nio.file.-path/) 现已达到 [Stable](components-stability.md) 状态。

```kotlin
// 使用除号 (/) 运算符构造路径
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory"

// 列出目录中的文件
val kotlinFiles: List<Path> = Path("/home/user").listDirectoryEntries("*.kt")
```

[详细了解 Path API](whatsnew1420.md#extensions-for-java-nio-file-path)。

### 向下取整除法和 mod 运算符 {id="floored-division-and-the-mod-operator"}

标准库中新增了模运算操作：
* `floorDiv()` 返回[向下取整除法](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions)的结果。它适用于整数类型。
* `mod()` 返回向下取整除法的余数（_模数_）。它适用于所有数值类型。

这些操作看起来与现有的[整数除法](numbers.md#integer-division)和 [rem()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/rem.html) 函数（或 `%` 运算符）非常相似，但它们对负数的处理方式有所不同：
* `a.floorDiv(b)` 与常规 `/` 的不同之处在于 `floorDiv` 将结果向下取整（朝向较小的整数），而 `/` 将结果截断为更接近 0 的整数。
* `a.mod(b)` 是 `a` 与 `a.floorDiv(b) * b` 之间的差值。它要么为零，要么与 `b` 的符号相同，而 `a % b` 的符号可能不同。

```kotlin
fun main() {
//sampleStart
    println("Floored division -5/3: ${(-5).floorDiv(3)}")
    println( "Modulus: ${(-5).mod(3)}")
    
    println("Truncated division -5/3: ${-5 / 3}")
    println( "Remainder: ${-5 % 3}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Duration API 变更 {id="duration-api-changes"}

> Duration API 属于[实验性功能](components-stability.md)。它可能会随时被舍弃或更改。
> 请仅将其用于评估目的。欢迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上向我们提供反馈。
>
{style="warning"}

实验性的 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 类用于表示不同时间单位的时长大小。在 1.5.0 中，Duration API 迎来了以下变更：

* 内部值表示现在使用 `Long` 而非 `Double`，以提供更高的精度。
* 提供了用于转换为 `Long` 格式特定时间单位的新 API。它取代了以 `Double` 值运算的旧 API（现已弃用）。例如，[`Duration.inWholeMinutes`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/in-whole-minutes.html) 返回以 `Long` 表示的时长值，并替代了 `Duration.inMinutes`。
* 提供了用于从数字构造 `Duration` 的新伴生函数。例如，[`Duration.seconds(Int)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/seconds.html) 会创建一个表示整数秒数的 `Duration` 对象。旧的扩展属性（如 `Int.seconds`）现已被弃用。

```kotlin
import kotlin.time.Duration
import kotlin.time.ExperimentalTime

@ExperimentalTime
fun main() {
//sampleStart
    val duration = Duration.milliseconds(120000)
    println("There are ${duration.inWholeSeconds} seconds in ${duration.inWholeMinutes} minutes")
//sampleEnd
}
```
{validate="false"}

### 用于获取字符类别的新 API 现已在多平台代码中可用 {id="new-api-for-getting-a-char-category-now-available-in-multiplatform-code"}

Kotlin 1.5.0 引入了在多平台项目中根据 Unicode 获取字符类别的新 API。现在可以在所有平台和通用代码中使用多个函数。

用于检查字符是字母还是数字的函数：
* [`Char.isDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-digit.html)
* [`Char.isLetter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter.html)
* [`Char.isLetterOrDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter-or-digit.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('a', '1', '+')
    val (letterOrDigitList, notLetterOrDigitList) = chars.partition { it.isLetterOrDigit() }
    println(letterOrDigitList) // [a, 1]
    println(notLetterOrDigitList) // [+]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

用于检查字符大小写的函数：
* [`Char.isLowerCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-lower-case.html)
* [`Char.isUpperCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-upper-case.html)
* [`Char.isTitleCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-title-case.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('ǅ', 'ǈ', 'ǋ', 'ǲ', '1', 'A', 'a', '+')
    val (titleCases, notTitleCases) = chars.partition { it.isTitleCase() }
    println(titleCases) // [ǅ, ǈ, ǋ, ǲ]
    println(notTitleCases) // [1, A, a, +]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

其他部分函数：
* [`Char.isDefined()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-defined.html)
* [`Char.isISOControl()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-i-s-o-control.html)

属性 [`Char.category`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/category.html) 及其返回值类型枚举类 [`CharCategory`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-char-category/)（表示字符在 Unicode 中的通用类别）现在也可在多平台项目中使用。

[详细了解字符](characters.md)。

### 新的集合函数 firstNotNullOf() {id="new-collections-function-firstnotnullof"}

新的 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 和 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 函数将 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 与 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 或 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 结合在一起。它们使用自定义选择器函数映射原始集合，并返回第一个非 null 值。如果没有此类值，`firstNotNullOf()` 会抛出异常，而 `firstNotNullOfOrNull()` 则返回 null。

```kotlin
fun main() {
//sampleStart
    val data = listOf("Kotlin", "1.5")
    println(data.firstNotNullOf(String::toDoubleOrNull))
    println(data.firstNotNullOfOrNull(String::toIntOrNull))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### String?.toBoolean() 的严格版本 {id="strict-version-of-string-toboolean"}

两个新函数引入了现有 [String?.toBoolean()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean.html) 的区分大小写严格版本：
* [`String.toBooleanStrict()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict.html) 对除字面值 `true` 和 `false` 之外的所有输入抛出异常。
* [`String.toBooleanStrictOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict-or-null.html) 对除字面值 `true` 和 `false` 之外的所有输入返回 null。

```kotlin
fun main() {
//sampleStart
    println("true".toBooleanStrict())
    println("1".toBooleanStrictOrNull())
    // println("1".toBooleanStrict()) // 抛出异常
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## kotlin-test 库 {id="kotlin-test-library"}
[kotlin-test](https://kotlinlang.org/api/latest/kotlin.test/) 库引入了一些新功能：
* [简化多平台项目中的测试依赖项使用](#simplified-test-dependencies-usage-in-multiplatform-projects)
* [自动为 Kotlin/JVM 源集选择测试框架](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* [断言函数更新](#assertion-function-updates)

### 简化多平台项目中的测试依赖项使用 {id="simplified-test-dependencies-usage-in-multiplatform-projects"}

现在你可以使用 `kotlin-test` 依赖项在 `commonTest` 源集中添加测试依赖项，Gradle 插件将为每个测试源集推断相应的平台依赖项：
* 针对 JVM 源集使用 `kotlin-test-junit`，请参阅[自动为 Kotlin/JVM 源集选择测试框架](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* 针对 Kotlin/JS 源集使用 `kotlin-test-js`
* 针对通用源集使用 `kotlin-test-common` 和 `kotlin-test-annotations-common`
* 针对 Kotlin/Native 源集不需要额外的构件

此外，你可以在任何共享源集或特定于平台的源集中使用 `kotlin-test` 依赖项。

在 Gradle 和 Maven 中，带有显式依赖项的现有 kotlin-test 配置将继续有效。

详细了解[在测试库上设置依赖项](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### 自动为 Kotlin/JVM 源集选择测试框架 {id="automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets"}

Gradle 插件现在可以自动选择并添加对测试框架的依赖项。你只需在通用源集中添加 `kotlin-test` 依赖项即可。

Gradle 默认使用 JUnit 4。因此，`kotlin("test")` 依赖项会解析为 JUnit 4 变体，即 `kotlin-test-junit`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test")) // 这会传递引入
                                               // 对 JUnit 4 的依赖项
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 这会传递引入
                                              // 对 JUnit 4 的依赖项
            }
        }
    }
}
```

</tab>
</tabs>

你可以在测试任务中通过调用 [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 或 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) 来选择 JUnit 5 或 TestNG：

```groovy
tasks {
    test {
        // 启用 TestNG 支持
        useTestNG()
        // 或
        // 启用 JUnit Platform（又名 JUnit 5）支持
        useJUnitPlatform()
    }
}
```

你可以通过在项目的 `gradle.properties` 中添加 `kotlin.test.infer.jvm.variant=false` 来禁用测试框架的自动选择。

详细了解[在测试库上设置依赖项](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### 断言函数更新 {id="assertion-function-updates"}

此版本带来了新的断言函数并改进了现有断言函数。

`kotlin-test` 库现在具备以下功能：

* **检查值的类型**

  你可以使用新的 `assertIs<T>` 和 `assertIsNot<T>` 来检查值的类型：

  ```kotlin
  @Test
  fun testFunction() {
      val s: Any = "test"
      assertIs<String>(s)  // 如果断言失败，则会抛出 AssertionError，其中会提及 s 的实际类型
      // 得益于 assertIs 中的契约，现在可以打印 s.length
      println("${s.length}")
  }
  ```

  由于类型擦除，在以下示例中，此断言函数仅检查 `value` 是否属于 `List` 类型，而不检查它是否是特定 `String` 元素类型的列表：`assertIs<List<String>>(value)`。

* **比较数组、序列和任意可迭代对象的容器内容**

  提供了一组新的重载 `assertContentEquals()` 函数，用于比较未实现[结构相等](equality.md#structural-equality)的不同集合的内容：

  ```kotlin
  @Test
  fun test() {
      val expectedArray = arrayOf(1, 2, 3)
      val actualArray = Array(3) { it + 1 }
      assertContentEquals(expectedArray, actualArray)
  }
  ```

* **针对 `Double` 和 `Float` 数字新增 `assertEquals()` 和 `assertNotEquals()` 重载**

  `assertEquals()` 函数新增了重载，使得能够以绝对精度比较两个 `Double` 或 `Float` 数字。精度值指定为该函数的第三个形参：

  ```kotlin
   @Test
  fun test() {
      val x = sin(PI)

      // 精度参数
      val tolerance = 0.000001

      assertEquals(0.0, x, tolerance)
  }
  ```

* **用于检查集合和元素内容的新函数**

  现在可以使用 `assertContains()` 函数检查集合或元素是否包含某项。
  你可以将其与具有 `contains()` 运算符的 Kotlin 集合和元素一起使用，例如 `IntRange`、`String` 等：

  ```kotlin
  @Test
  fun test() {
      val sampleList = listOf<String>("sample", "sample2")
      val sampleString = "sample"
      assertContains(sampleList, sampleString)  // 集合中的元素
      assertContains(sampleString, "amp")       // 字符串中的子字符串
  }
  ```

* **`assertTrue()`、`assertFalse()`、`expect()` 函数现已为内联函数**

  从现在起，你可以将这些函数用作内联函数，因此可以在 lambda 表达式中调用[挂起函数](composing-suspending-functions.md)：

  ```kotlin
  @Test
  fun test() = runBlocking<Unit> {
      val deferred = async { "Kotlin is nice" }
      assertTrue("Kotlin substring should be present") {
          deferred.await() .contains("Kotlin")
      }
  }
  ```

## kotlinx 库 {id="kotlinx-libraries"}

伴随 Kotlin 1.5.0，我们发布了新版本的 kotlinx 库：
* `kotlinx.coroutines` [1.5.0-RC](#coroutines-1-5-0-rc)
* `kotlinx.serialization` [1.2.1](#serialization-1-2-1)
* `kotlinx-datetime` [0.2.0](#datetime-0-2-0)

### Coroutines 1.5.0-RC {id="coroutines-1-5-0-rc"}

`kotlinx.coroutines` [1.5.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) 现已发布，带来：
* [新的通道 (Channels) API](channels.md)
* 稳定的响应式集成
* 以及更多内容

从 Kotlin 1.5.0 开始，[实验性协程](whatsnew14.md#exclusion-of-the-deprecated-experimental-coroutines)已被禁用，且不再支持 `-Xcoroutines=experimental` 标志。

在[变更日志](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC)和 [`kotlinx.coroutines` 1.5.0 发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/)中了解更多信息。

<video src="https://www.youtube.com/v/EVLnWOcR0is" title="kotlinx.coroutines 1.5.0"/>

### Serialization 1.2.1 {id="serialization-1-2-1"}

`kotlinx.serialization` [1.2.1](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) 现已发布，带来：
* JSON 序列化性能改进
* 在 JSON 序列化中支持多个备选名称
* 实验性支持从 `@Serializable` 类生成 .proto 架构
* 以及更多内容

在[变更日志](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1)和 [`kotlinx.serialization` 1.2.1 发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-serialization-1-2-released/)中了解更多信息。

<video src="https://www.youtube.com/v/698I_AH8h6s" title="kotlinx.serialization 1.2.1"/>

### dateTime 0.2.0 {id="datetime-0-2-0"}

`kotlinx-datetime` [0.2.0](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) 现已发布，带来：
* 支持 `@Serializable` 的 Datetime 对象
* 规范化的 `DateTimePeriod` 和 `DatePeriod` API
* 以及更多内容

在[变更日志](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0)和 [`kotlinx-datetime` 0.2.0 发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-datetime-0-2-0-is-out/)中了解更多信息。

## 迁移到 Kotlin 1.5.0 {id="migrating-to-kotlin-1-5-0"}

IntelliJ IDEA 和 Android Studio 会在 Kotlin 插件 1.5.0 可用时提示更新。

要将现有项目迁移到 Kotlin 1.5.0，只需将 Kotlin 版本更改为 `1.5.0` 并重新导入你的 Gradle 或 Maven 项目。[了解如何更新到 Kotlin 1.5.0](releases.md#update-to-a-new-kotlin-version)。

要使用 Kotlin 1.5.0 启动新项目，请更新 Kotlin 插件并通过 **File** | **New** | **Project** 运行项目向导。

新的命令行编译器可在 [GitHub 发布页面](https://github.com/JetBrains/kotlin/releases/tag/v1.5.0)下载。

Kotlin 1.5.0 是一个功能版本，因此可能会给语言带来不兼容的变更。请在 [Kotlin 1.5 兼容性指南](compatibility-guide-15.md)中找到此类变更的详细列表。