[//]: # (title: Kotlin 1.5.0 最新变化)

<web-summary>阅读 Kotlin 1.5.0 发布说明，涵盖新的语言功能、Kotlin Multiplatform、JVM、Native、JS 的更新，以及对 Gradle 和 Maven 构建工具的支持。</web-summary>

_[发布日期：2021 年 5 月 5 日](releases.md#release-history)_

Kotlin 1.5.0 引入了新的语言功能、稳定的基于 IR 的 JVM 编译器后端、性能改进，以及一些演进性变化，例如稳定实验性功能和弃用过时功能。

您还可以在 [发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/) 中找到这些变化的概述。

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 语言功能

Kotlin 1.5.0 带来了 [1.4.30 预览版](whatsnew1430.md#language-features) 中推出的新语言功能的稳定版本：
* [JVM 记录支持](#jvm-records-support)
* [密封接口](#sealed-interfaces) 和 [密封类改进](#package-wide-sealed-class-hierarchies)
* [内联类](#inline-classes)

有关这些功能的详细描述，请参阅 [这篇博客文章](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/) 以及 Kotlin 文档的相关页面。

### JVM 记录支持

Java 正在快速演进，为了确保 Kotlin 保持与其互操作，我们引入了对 Java 最新功能之一——[记录类 (record classes)](https://openjdk.java.net/jeps/395) 的支持。

Kotlin 对 JVM 记录的支持包括双向互操作性：
* 在 Kotlin 代码中，您可以像使用带有属性的典型类一样使用 Java 记录类。
* 要在 Java 代码中将 Kotlin 类用作记录，请将其声明为 `data` 类并标注 `@JvmRecord` 注解。

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

[详细了解在 Kotlin 中使用 JVM 记录](jvm-records.md)。

<video src="https://www.youtube.com/v/iyEWXyuuseU" title="Kotlin 1.5.0 对 JVM 记录的支持"/>

### 密封接口

Kotlin 接口现在可以使用 `sealed` 修饰符，其对接口的作用方式与对类相同：密封接口的所有实现在编译时都是已知的。

```kotlin
sealed interface Polygon
```

您可以利用这一事实，例如编写穷举式的 `when` 表达式。

```kotlin
fun draw(polygon: Polygon) = when (polygon) {
   is Rectangle -> // ...
   is Triangle -> // ...
   // 不再需要 else - 所有可能的实现都已覆盖
}

```

此外，密封接口支持更灵活的受限类层次结构，因为一个类可以直接继承多个密封接口。

```kotlin
class FilledRectangle: Polygon, Fillable
```

[详细了解密封接口](sealed-classes.md)。

<video src="https://www.youtube.com/v/d_Mor21W_60" title="密封接口与密封类改进"/>

### 整个包范围内的密封类层次结构

密封类现在可以在同一编译单元和同一包的所有文件中拥有子类。此前，所有子类都必须出现在同一个文件中。

直接子类可以是顶级类，也可以嵌套在任意数量的其他命名类、命名接口或命名对象中。

密封类的子类必须具有正确限定的名称——它们不能是局部对象或匿名对象。

[详细了解密封类层次结构](sealed-classes.md#inheritance)。

### 内联类

内联类是[基于值的 (value-based)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md)类的一个子集，仅持有值。您可以将它们用作某种类型值的包装器，而不会产生内存分配带来的额外开销。

可以通过在类名前加上 `value` 修饰符来声明内联类：

```kotlin
value class Password(val s: String)
```

JVM 后端还需要一个特殊的 `@JvmInline` 注解：

```kotlin
@JvmInline
value class Password(val s: String)
```

`inline` 修饰符现在已被弃用并会触发警告。

[详细了解内联类](inline-classes.md)。

<video src="https://www.youtube.com/v/LpqvtgibbsQ" title="从内联类到值类"/>

## Kotlin/JVM

Kotlin/JVM 获得了一系列改进，包括内部改进和面向用户的改进。以下是其中最显著的变化：

* [稳定的 JVM IR 后端](#stable-jvm-ir-backend)
* [新的默认 JVM 目标：1.8](#new-default-jvm-target-1-8)
* [通过 invokedynamic 实现 SAM 适配器](#sam-adapters-via-invokedynamic)
* [通过 invokedynamic 实现 Lambda 表达式](#lambdas-via-invokedynamic)
* [弃用 @JvmDefault 和旧的 Xjvm-default 模式](#deprecation-of-jvmdefault-and-old-xjvm-default-modes)
* [处理为 null 性注解的改进](#improvements-to-handling-nullability-annotations)

### 稳定的 JVM IR 后端

Kotlin/JVM 编译器的 [基于 IR 的后端](whatsnew14.md#new-jvm-ir-backend) 现在已达到 [稳定 (Stable)](components-stability.md) 状态并默认启用。

从 [Kotlin 1.4.0](whatsnew14.md) 开始，基于 IR 的后端的早期版本已提供预览，现在它已成为语言版本 `1.5` 的默认设置。对于较早的语言版本，默认仍使用旧后端。

您可以在 [这篇博客文章](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/) 中找到关于 IR 后端的优势及其未来发展的更多细节。

如果您在 Kotlin 1.5.0 中需要使用旧后端，可以将以下行添加到项目的配置文件中：

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

### 新的默认 JVM 目标：1.8

Kotlin/JVM 编译的默认目标版本现在为 `1.8`。`1.6` 目标已被弃用。

如果您需要为 JVM 1.6 构建，仍可以切换到该目标。了解具体方法：

* [在 Gradle 中](gradle-compiler-options.md#attributes-specific-to-jvm)
* [在 Maven 中](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [在命令行编译器中](compiler-reference.md#jvm-target-version)

### 通过 invokedynamic 实现 SAM 适配器

Kotlin 1.5.0 现在使用动态调用 (`invokedynamic`) 来编译 SAM（单个抽象方法）转换：
* 如果 SAM 类型是 [Java 接口](java-interop.md#sam-conversions)，则对任何表达式生效
* 如果 SAM 类型是 [Kotlin 函数式接口](fun-interfaces.md#sam-conversions)，则对 lambda 生效

新实现使用了 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-)，编译期间不再生成辅助包装类。这减小了应用程序 JAR 包的大小，从而提高了 JVM 启动性能。

要回退到基于匿名类生成的旧实现方案，请添加编译器选项 `-Xsam-conversions=class`。

了解如何在 [Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options) 和 [命令行编译器](compiler-reference.md#compiler-options) 中添加编译器选项。

### 通过 invokedynamic 实现 Lambda 表达式

> 将普通的 Kotlin lambda 编译为 invokedynamic 是 [实验性的 (Experimental)](components-stability.md)。它可能随时被删除或更改。
> 需要手动启用（详情见下文），且仅应将其用于评估目的。我们希望在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-45375) 上收到您对此功能的反馈。
>
{style="warning"}

Kotlin 1.5.0 引入了对将普通 Kotlin lambda（未转换为函数式接口实例的 lambda）编译为动态调用 (`invokedynamic`) 的实验性支持。该实现通过使用 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) 生成更轻量的二进制文件，该方法实际上会在运行时生成必要的类。目前，与普通 lambda 编译相比，它有三个限制：

* 编译为 invokedynamic 的 lambda 不可序列化。
* 对此类 lambda 调用 `toString()` 产生的字符串表示形式可读性较低。
* 实验性的 [`reflect`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API 不支持通过 `LambdaMetafactory` 创建的 lambda。

要尝试此功能，请添加 `-Xlambdas=indy` 编译器选项。如果您能通过此 [YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-45375) 分享您的反馈，我们将不胜感激。

了解如何在 [Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options) 和 [命令行编译器](compiler-reference.md#compiler-options) 中添加编译器选项。

### 弃用 @JvmDefault 和旧的 Xjvm-default 模式

在 Kotlin 1.4.0 之前，存在 `@JvmDefault` 注解以及 `-Xjvm-default=enable` 和 `-Xjvm-default=compatibility` 模式。它们用于为 Kotlin 接口中的任何特定非抽象成员创建 JVM 默认方法。

在 Kotlin 1.4.0 中，我们 [引入了新的 `Xjvm-default` 模式](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)，用于为整个项目开启默认方法生成。

在 Kotlin 1.5.0 中，我们将弃用 `@JvmDefault` 和旧的 Xjvm-default 模式：`-Xjvm-default=enable` 和 `-Xjvm-default=compatibility`。

[详细了解 Java 互操作中的默认方法](java-to-kotlin-interop.md#default-methods-in-interfaces)。

### 处理为 null 性注解的改进

Kotlin 支持通过 [为 null 性注解 (nullability annotations)](java-interop.md#nullability-annotations) 处理来自 Java 的类型为 null 性信息。Kotlin 1.5.0 为该功能引入了多项改进：

* 它可以读取用作依赖项的已编译 Java 库中类型参数上的为 null 性注解。
* 支持针对以下目标的 `TYPE_USE` 为 null 性注解：
  * 数组
  * 可变参数 (Varargs)
  * 字段
  * 类型形参及其边界
  * 基类和接口的类型实参
* 如果一个为 null 性注解有多个适用于某种类型的目标，且其中一个目标是 `TYPE_USE`，则优先使用 `TYPE_USE`。
  例如，如果 `@Nullable` 同时支持 `TYPE_USE` 和 `METHOD` 作为目标，方法签名 `@Nullable String[] f()` 将变为 `fun f(): Array<String?>!`。

对于这些新支持的情况，从 Kotlin 调用 Java 时使用错误的类型为 null 性会产生警告。使用 `-Xtype-enhancement-improvements-strict-mode` 编译器选项可为此类情况启用严格模式（报错）。

[详细了解空安全和平台类型](java-interop.md#null-safety-and-platform-types)。

## Kotlin/Native

Kotlin/Native 现在具有更好的性能和稳定性。显著变化包括：
* [性能改进](#performance-improvements)
* [停用内存泄漏检查器](#deactivation-of-the-memory-leak-checker)

### 性能改进

在 1.5.0 中，Kotlin/Native 获得了一系列性能改进，提升了编译和执行速度。

[编译器缓存 (Compiler caches)](https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/#kotlin-native) 现在在调试模式下支持 `linuxX64`（仅限 Linux 宿主机）和 `iosArm64` 目标。启用编译器缓存后，除了第一次之外，大多数调试编译的速度都会快得多。测量结果显示，在我们的测试项目中速度提升了约 200%。

要为新目标使用编译器缓存，请通过在项目的 `gradle.properties` 中添加以下行来启用：
* 对于 `linuxX64`：`kotlin.native.cacheKind.linuxX64=static`
* 对于 `iosArm64`：`kotlin.native.cacheKind.iosArm64=static`

如果您在启用编译器缓存后遇到任何问题，请将其报告给我们的问题跟踪器 [YouTrack](https://kotl.in/issue)。

其他改进加速了 Kotlin/Native 代码的执行：
* 琐碎的属性访问器会被内联。
* 字符串字面量上的 `trimIndent()` 会在编译期间求值。

### 停用内存泄漏检查器

内置的 Kotlin/Native 内存泄漏检查器已默认禁用。

它最初是为内部使用而设计的，只能在有限的情况下发现泄漏，而不能发现所有泄漏。此外，后来发现它存在可能导致应用程序崩溃的问题。因此，我们决定关闭内存泄漏检查器。

内存泄漏检查器在某些情况下仍然有用，例如单元测试。对于这些情况，您可以通过添加以下代码行来启用它：

```kotlin
Platform.isMemoryLeakCheckerActive = true
```

请注意，不建议为应用程序运行时启用该检查器。

## Kotlin/JS

Kotlin/JS 在 1.5.0 中获得了演进性变化。我们正在继续努力将 [JS IR 编译器后端](js-ir-compiler.md) 推进至稳定状态，并发布了其他更新：

* [Webpack 升级至版本 5](#upgrade-to-webpack-5)
* [支持 IR 编译器的框架和库](#frameworks-and-libraries-for-the-ir-compiler)

### 升级至 Webpack 5

Kotlin/JS Gradle 插件现在对浏览器目标使用 Webpack 5 而非 Webpack 4。这是一次重大的 Webpack 升级，带来了不兼容的更改。如果您使用的是自定义 Webpack 配置，请务必查看 [Webpack 5 发布说明](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)。

[详细了解使用 Webpack 打包 Kotlin/JS 项目](js-project-setup.md#webpack-bundling)。

### 支持 IR 编译器的框架和库

> Kotlin/JS IR 编译器处于 [Alpha](components-stability.md) 阶段。未来可能会发生不兼容的变化，并需要手动迁移。
> 我们希望在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上收到您对此功能的反馈。
>
{style="warning"}

在开发基于 IR 的 Kotlin/JS 编译器后端的同时，我们鼓励并帮助库作者以 `both` 模式构建其项目。这意味着他们能够为两种 Kotlin/JS 编译器产出构件，从而壮大新编译器的生态系统。

许多著名的框架和库已经支持 IR 后端：[KVision](https://kvision.io/)、[fritz2](https://www.fritz2.dev/)、[doodle](https://github.com/nacular/doodle) 等。如果您在项目中使用它们，已经可以使用 IR 后端进行构建并体验其带来的好处。

如果您正在编写自己的库，请以 'both' 模式编译，以便您的客户也可以在新的编译器中使用它。

## Kotlin Multiplatform

在 Kotlin 1.5.0 中，[为每个平台选择测试依赖项的过程已简化](#simplified-test-dependencies-usage-in-multiplatform-projects)，现在由 Gradle 插件自动完成。

新的 [获取字符类别的 API 现在可在多平台项目中使用](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)。

## 标准库

标准库获得了一系列变化和改进，从稳定实验性部分到添加新功能：

* [稳定的无符号整数类型](#stable-unsigned-integer-types)
* [稳定的与区域性无关的文本大小写转换 API](#stable-locale-agnostic-api-for-upper-lowercasing-text)
* [稳定的字符到整数转换 API](#stable-char-to-integer-conversion-api)
* [稳定的 Path API](#stable-path-api)
* [向下取整除法和 mod 运算符](#floored-division-and-the-mod-operator)
* [Duration API 变化](#duration-api-changes)
* [新的获取字符类别的 API 现在可在多平台代码中使用](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)
* [新的集合函数 firstNotNullOf()](#new-collections-function-firstnotnullof)
* [String?.toBoolean() 的严格版本](#strict-version-of-string-toboolean)

您可以在 [这篇博客文章](https://blog.jetbrains.com/kotlin/2021/04/kotlin-1-5-0-rc-released) 中了解更多关于标准库变化的信息。

<video src="https://www.youtube.com/v/MyTkiT2I6-8" title="标准库新功能"/>

### 稳定的无符号整数类型

`UInt`、`ULong`、`UByte`、`UShort` 无符号整数类型现在已达到 [稳定 (Stable)](components-stability.md) 状态。这些类型上的运算、区间和数列也是如此。无符号数组及其运算仍处于 Beta 阶段。

[详细了解无符号整数类型](unsigned-integer-types.md)。

### 稳定的与区域性无关的文本大小写转换 API

此版本引入了新的与区域性无关的文本大小写转换 API。它提供了 `toLowerCase()`、`toUpperCase()`、`capitalize()` 和 `decapitalize()` 等 API 函数的替代方案，这些函数是区域性敏感的。新 API 可帮助您避免因不同的区域设置而产生的错误。

Kotlin 1.5.0 提供了以下完全 [稳定 (Stable)](components-stability.md) 的替代方案：

* 对于 `String` 函数：

  |**早期版本**|**1.5.0 替代方案**|
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* 对于 `Char` 函数：

  |**早期版本**|**1.5.0 替代方案**|
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> 对于 Kotlin/JVM，还有带有显式 `Locale` 形参的 `uppercase()`、`lowercase()` 和 `titlecase()` 重载函数。
>
{style="note"}

旧的 API 函数被标记为弃用，并将在未来版本中移除。

请参阅 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-case-conversions.md) 中文本处理函数的完整变化列表。

### 稳定的字符到整数转换 API

从 Kotlin 1.5.0 开始，新的字符到代码和字符到数字转换函数已达到 [稳定 (Stable)](components-stability.md) 状态。这些函数取代了现有的 API 函数，后者经常与类似的字符串到整数转换混淆。

新 API 消除了这种命名混淆，使代码行为更加透明和清晰。

此版本引入的 `Char` 转换分为以下几组命名清晰的函数：

* 获取 `Char` 的整数代码以及从给定代码构造 `Char` 的函数：

 ```kotlin
 fun Char(code: Int): Char
 fun Char(code: UShort): Char
 val Char.code: Int
 ```

* 将 `Char` 转换为其所代表的数字值的函数：

 ```kotlin
 fun Char.digitToInt(radix: Int): Int
 fun Char.digitToIntOrNull(radix: Int): Int?
 ```

* `Int` 的扩展函数，用于将其代表的非负单数字转换为对应的 `Char` 表示：

 ```kotlin
 fun Int.digitToChar(radix: Int): Char
 ```

旧的转换 API，包括 `Number.toChar()` 及其实现（除了 `Int.toChar()` 之外的所有实现）以及用于转换为数值类型的 `Char` 扩展（如 `Char.toInt()`），现在已被弃用。

[在 KEEP 中详细了解字符到整数转换 API](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md)。

### 稳定的 Path API

带有针对 `java.nio.file.Path` 的扩展的 [实验性 Path API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io.path/java.nio.file.-path/) 现在已达到 [稳定 (Stable)](components-stability.md) 状态。

```kotlin
// 使用除法 (/) 运算符构造路径
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory"

// 列出目录中的文件
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

[详细了解 Path API](whatsnew1420.md#extensions-for-java-nio-file-path)。

### 向下取整除法和 mod 运算符

标准库中新增了用于模运算的操作：
* `floorDiv()` 返回 [向下取整除法](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions) 的结果。适用于整数类型。
* `mod()` 返回向下取整除法的余数（_模数_）。适用于所有数值类型。

这些操作看起来与现有的 [整数除法](numbers.md#integer-division) 和 [rem()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/rem.html) 函数（或 `%` 运算符）非常相似，但它们在负数上的工作方式不同：
* `a.floorDiv(b)` 与普通的 `/` 不同之处在于 `floorDiv` 将结果向下舍入（向较小的整数方向），而 `/` 将结果截断为更接近 0 的整数。
* `a.mod(b)` 是 `a` 与 `a.floorDiv(b) * b` 之间的差值。它的结果要么为零，要么与 `b` 符号相同，而 `a % b` 的符号可能不同。

```kotlin
fun main() {
//sampleStart
    println("向下取整除法 -5/3: ${(-5).floorDiv(3)}")
    println( "模数: ${(-5).mod(3)}")
    
    println("截断除法 -5/3: ${-5 / 3}")
    println( "余数: ${-5 % 3}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Duration API 变化

> Duration API 处于 [实验性 (Experimental)](components-stability.md) 阶段。它可能随时被删除或更改。
> 仅将其用于评估目的。我们希望在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上收到您对此功能的反馈。
>
{style="warning"}

存在一个实验性的 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 类，用于表示不同时间单位的时长。在 1.5.0 中，Duration API 发生了以下变化：

* 内部值表示现在使用 `Long` 而非 `Double` 以提供更好的精度。
* 引入了新的用于转换为特定 `Long` 类型时间单位的 API。它将取代旧的使用 `Double` 值的 API，后者现已被弃用。例如，[`Duration.inWholeMinutes`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/in-whole-minutes.html) 返回以 `Long` 表示的时长值，取代了 `Duration.inMinutes`。
* 引入了新的伴生函数，用于从数字构造 `Duration`。例如，[`Duration.seconds(Int)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/seconds.html) 创建一个表示整数秒数的 `Duration` 对象。旧的扩展属性（如 `Int.seconds`）现已被弃用。

```kotlin
import kotlin.time.Duration
import kotlin.time.ExperimentalTime

@ExperimentalTime
fun main() {
//sampleStart
    val duration = Duration.milliseconds(120000)
    println("在 ${duration.inWholeMinutes} 分钟内有 ${duration.inWholeSeconds} 秒")
//sampleEnd
}
```
{validate="false"}

### 新的获取字符类别的 API 现在可在多平台代码中使用

Kotlin 1.5.0 引入了新的 API，用于在多平台项目中根据 Unicode 获取字符的类别。现在所有平台和公共代码中都可以使用几个函数。

用于检查字符是否为字母或数字的函数：
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

其他一些函数：
* [`Char.isDefined()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-defined.html)
* [`Char.isISOControl()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-i-s-o-control.html)

属性 [`Char.category`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/category.html) 及其返回类型枚举类 [`CharCategory`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-char-category/)（指示字符根据 Unicode 的常规分类）现在也可在多平台项目中使用。

[详细了解字符](characters.md)。

### 新的集合函数 firstNotNullOf()

新的 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 和 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 函数结合了 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 与 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 或 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)。它们使用自定义选择器函数映射原始集合，并返回第一个非 null 值。如果没有这样的值，`firstNotNullOf()` 会抛出异常，而 `firstNotNullOfOrNull()` 返回 null。

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

### String?.toBoolean() 的严格版本

两个新函数引入了现有 [String?.toBoolean()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean.html) 的大小写敏感严格版本：
* [`String.toBooleanStrict()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict.html) 对除了字面量 `true` 和 `false` 之外的所有输入抛出异常。
* [`String.toBooleanStrictOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict-or-null.html) 对除了字面量 `true` 和 `false` 之外的所有输入返回 null。

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

## kotlin-test 库
[kotlin-test](https://kotlinlang.org/api/latest/kotlin.test/) 库引入了一些新功能：
* [简化了多平台项目中的测试依赖项使用](#simplified-test-dependencies-usage-in-multiplatform-projects)
* [自动为 Kotlin/JVM 源集选择测试框架](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* [断言函数更新](#assertion-function-updates)

### 简化了多平台项目中的测试依赖项使用

现在您可以使用 `kotlin-test` 依赖项在 `commonTest` 源集中添加测试依赖项，Gradle 插件将为每个测试源集推断对应的平台依赖项：
* JVM 源集使用 `kotlin-test-junit`，请参阅 [自动为 Kotlin/JVM 源集选择测试框架](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* Kotlin/JS 源集使用 `kotlin-test-js`
* 公共源集使用 `kotlin-test-common` 和 `kotlin-test-annotations-common`
* Kotlin/Native 源集不需要额外的构件

此外，您可以在任何共享或平台特定的源集中使用 `kotlin-test` 依赖项。

现有的具有显式依赖项的 kotlin-test 设置将继续在 Gradle 和 Maven 中工作。

详细了解 [在测试库上设置依赖项](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### 自动为 Kotlin/JVM 源集选择测试框架

Gradle 插件现在会自动选择并添加对测试框架的依赖。您只需要在公共源集中添加 `kotlin-test` 依赖项即可。

Gradle 默认使用 JUnit 4。因此，`kotlin("test")` 依赖项会解析为 JUnit 4 的变体，即 `kotlin-test-junit`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test")) // 这将传递性地引入 
                                               // 对 JUnit 4 的依赖
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
                implementation kotlin("test") // 这将传递性地引入 
                                              // 对 JUnit 4 的依赖
            }
        }
    }
}
```

</tab>
</tabs>

您可以通过在测试任务中调用 [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 或 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) 来选择 JUnit 5 或 TestNG：

```groovy
tasks {
    test {
        // 启用 TestNG 支持
        useTestNG()
        // 或
        // 启用 JUnit Platform (即 JUnit 5) 支持
        useJUnitPlatform()
    }
}
```

您可以通过在项目的 `gradle.properties` 中添加 `kotlin.test.infer.jvm.variant=false` 来禁用自动测试框架选择。

详细了解 [在测试库上设置依赖项](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### 断言函数更新

此版本带来了新的断言函数并改进了现有函数。

`kotlin-test` 库现在具有以下功能：

* **检查值的类型**

  您可以使用新的 `assertIs<T>` 和 `assertIsNot<T>` 来检查值的类型：

  ```kotlin
  @Test
  fun testFunction() {
      val s: Any = "test"
      assertIs<String>(s)  // 如果断言失败，则抛出 AssertionError 并提及 s 的实际类型
      // 由于 assertIs 中的契约，现在可以打印 s.length
      println("${s.length}")
  }
  ```

  由于类型擦除，在以下示例中，此断言函数仅检查 `value` 是否为 `List` 类型，而不会检查它是否为特定 `String` 元素类型的列表：`assertIs<List<String>>(value)`。

* **比较数组、序列和任意可迭代对象的容器内容**

  新增了一组重载的 `assertContentEquals()` 函数，用于为未实现 [结构相等](equality.md#structural-equality) 的不同集合比较内容：

  ```kotlin
  @Test
  fun test() {
      val expectedArray = arrayOf(1, 2, 3)
      val actualArray = Array(3) { it + 1 }
      assertContentEquals(expectedArray, actualArray)
  }
  ```

* **为 `Double` 和 `Float` 类型新增 `assertEquals()` 和 `assertNotEquals()` 重载**

  `assertEquals()` 函数新增了重载，使得以绝对精度比较两个 `Double` 或 `Float` 数字成为可能。精度值通过函数的第三个参数指定：

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

  现在您可以使用 `assertContains()` 函数检查集合或元素是否包含某些内容。您可以将其用于具有 `contains()` 运算符的 Kotlin 集合和元素，例如 `IntRange`、`String` 等：

  ```kotlin
  @Test
  fun test() {
      val sampleList = listOf<String>("sample", "sample2")
      val sampleString = "sample"
      assertContains(sampleList, sampleString)  // 集合中的元素
      assertContains(sampleString, "amp")       // 字符串中的子串
  }
  ```

* **`assertTrue()`、`assertFalse()`、`expect()` 函数现在是内联的**

  从现在起，您可以将这些函数用作内联函数，因此可以在 lambda 表达式内部调用 [挂起函数](composing-suspending-functions.md)：

  ```kotlin
  @Test
  fun test() = runBlocking<Unit> {
      val deferred = async { "Kotlin is nice" }
      assertTrue("应存在 Kotlin 子串") {
          deferred.await() .contains("Kotlin")
      }
  }
  ```

## kotlinx 库

随 Kotlin 1.5.0 一起，我们发布了新版本的 kotlinx 库：
* `kotlinx.coroutines` [1.5.0-RC](#coroutines-1-5-0-rc)
* `kotlinx.serialization` [1.2.1](#serialization-1-2-1)
* `kotlinx-datetime` [0.2.0](#datetime-0-2-0)

### Coroutines 1.5.0-RC

`kotlinx.coroutines` [1.5.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) 已经发布，包含：
* [新的通道 API](channels.md)
* 稳定的 [响应式集成](async-programming.md#reactive-extensions)
* 以及更多

从 Kotlin 1.5.0 开始，[实验性协程](whatsnew14.md#exclusion-of-the-deprecated-experimental-coroutines) 已被禁用，且不再支持 `-Xcoroutines=experimental` 标志。

在 [更新日志](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) 和 [`kotlinx.coroutines` 1.5.0 发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/) 中了解更多。

<video src="https://www.youtube.com/v/EVLnWOcR0is" title="kotlinx.coroutines 1.5.0"/>

### Serialization 1.2.1

`kotlinx.serialization` [1.2.1](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) 已经发布，包含：
* JSON 序列化性能改进
* JSON 序列化中支持多个名称
* 实验性的从 `@Serializable` 类生成 .proto 架构的功能
* 以及更多

在 [更新日志](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) 和 [`kotlinx.serialization` 1.2.1 发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-serialization-1-2-released/) 中了解更多。

<video src="https://www.youtube.com/v/698I_AH8h6s" title="kotlinx.serialization 1.2.1"/>

### dateTime 0.2.0

`kotlinx-datetime` [0.2.0](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) 已经发布，包含：
* `@Serializable` 的 Datetime 对象
* 规范化了 `DateTimePeriod` 和 `DatePeriod` 的 API
* 以及更多

在 [更新日志](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) 和 [`kotlinx-datetime` 0.2.0 发布博客文章](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-datetime-0-2-0-is-out/) 中了解更多。

## 迁移到 Kotlin 1.5.0

IntelliJ IDEA 和 Android Studio 会在 Kotlin 插件 1.5.0 可用时提示更新。

要将现有项目迁移到 Kotlin 1.5.0，只需将 Kotlin 版本更改为 `1.5.0` 并重新导入 Gradle 或 Maven 项目。[了解如何更新到 Kotlin 1.5.0](releases.md#update-to-a-new-kotlin-version)。

要使用 Kotlin 1.5.0 开始一个新项目，请更新 Kotlin 插件并通过 **File** | **New** | **Project** 运行项目向导。

新的命令行编译器可在 [GitHub 发布页面](https://github.com/JetBrains/kotlin/releases/tag/v1.5.0) 下载。

Kotlin 1.5.0 是一个 [特性版本](kotlin-evolution-principles.md#language-and-tooling-releases)，因此可能会为语言带来不兼容的变化。在 [Kotlin 1.5 兼容性指南](compatibility-guide-15.md) 中可以找到此类变化的详细列表。