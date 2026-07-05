[//]: # (title: Kotlin 1.7.0 最新变化)

<web-summary>阅读 Kotlin 1.7.0 版本说明，了解新语言功能、Kotlin Multiplatform、JVM、Native、JS 的更新，以及 Gradle 和 Maven 的构建工具支持。</web-summary>

<tldr>
   <p>IntelliJ IDEA 2021.2、2021.3 和 2022.1 已提供对 Kotlin 1.7.0 的 IDE 支持。</p>
</tldr>

_[发布日期：2022 年 6 月 9 日](releases.md#release-history)_

Kotlin 1.7.0 已经发布。它揭晓了新 Kotlin/JVM K2 编译器的 Alpha 版本，稳定了语言功能，并为 JVM、JS 和 Native 平台带来了性能提升。

以下是此版本的主要更新列表：

* [新的 Kotlin K2 编译器现在处于 Alpha 阶段](#new-kotlin-k2-compiler-for-the-jvm-in-alpha)，并提供了显著的性能提升。它目前仅适用于 JVM，并且包括 kapt 在内的任何编译器插件都无法与其配合使用。
* [Gradle 中增量编译的新方法](#a-new-approach-to-incremental-compilation)。现在也支持对依赖的非 Kotlin 模块中所做的更改进行增量编译，并与 Gradle 兼容。
* 我们稳定了 [选择性加入要求注解](#stable-opt-in-requirements)、[绝对不可为空类型](#stable-definitely-non-nullable-types) 以及 [构建器推断](#stable-builder-inference)。
* [现在为类型实参提供了下划线操作符](#underscore-operator-for-type-arguments)。在指定其他类型时，您可以使用它来自动推断实参的类型。
* [此版本允许通过委托实现内联类（inline class）的内联值](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)。您现在可以创建在大多数情况下不会分配内存的轻量级包装器。

您还可以在此视频中找到更改的简短概述：

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="Kotlin 1.7.0 最新变化"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布过程](releases.md)。
>
{style="tip"}

## 新的 JVM Kotlin K2 编译器（Alpha 阶段）

此 Kotlin 版本引入了新 Kotlin K2 编译器的 **Alpha** 版本。新编译器旨在加快新语言功能的开发，统一 Kotlin 支持的所有平台，带来性能提升，并为编译器扩展提供 API。

我们已经发布了一些关于新编译器及其优势的详细说明：

* [通往新 Kotlin 编译器之路](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 编译器：自顶向下视图](https://www.youtube.com/watch?v=db19VFLZqJM)

需要指出的是，在 Alpha 版本的新 K2 编译器中，我们主要关注性能提升，并且它仅适用于 JVM 项目。它不支持 Kotlin/JS、Kotlin/Native 或其他多平台项目，并且包括 [kapt](kapt.md) 在内的任何编译器插件都无法与其配合使用。

我们的基准测试在内部项目中显示出了一些出色的结果：

| 项目 | 当前 Kotlin 编译器性能 | 新 K2 Kotlin 编译器性能 | 性能提升 |
|---------------|-----------------------|-----------------------|---------------|
| Kotlin | 2.2 KLOC/s | 4.8 KLOC/s | ~ x2.2 |
| YouTrack | 1.8 KLOC/s | 4.2 KLOC/s | ~ x2.3 |
| IntelliJ IDEA | 1.8 KLOC/s | 3.9 KLOC/s | ~ x2.2 |
| Space | 1.2 KLOC/s | 2.8 KLOC/s | ~ x2.3 |

> KLOC/s 性能数字代表编译器每秒处理的代码行数（以千行为单位）。
>
> {style="tip"}

您可以查看 JVM 项目的性能提升，并将其与旧编译器的结果进行比较。要启用 Kotlin K2 编译器，请使用以下编译器选项：

```bash
-Xuse-k2
```

此外，K2 编译器 [包含许多错误修复](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved)。请注意，即使此列表中的问题状态为 **State: Open**，实际上在 K2 中也已修复。

接下来的 Kotlin 版本将提高 K2 编译器的稳定性并提供更多功能，敬请期待！

如果您在使用 Kotlin K2 编译器时遇到任何性能问题，请 [向我们的问题跟踪器报告](https://kotl.in/issue)。

## 语言

Kotlin 1.7.0 引入了对委托实现的支持以及用于类型实参的新下划线操作符。它还稳定了在之前版本中作为预览引入的几个语言功能：

* [通过委托实现内联类的内联值](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [用于类型实参的下划线操作符](#underscore-operator-for-type-arguments)
* [稳定的构建器推断](#stable-builder-inference)
* [选择性加入要求（Stable）](#stable-opt-in-requirements)
* [绝对不可为空类型（Stable）](#stable-definitely-non-nullable-types)

### 允许通过委托实现内联类（inline class）的内联值

如果您想为值或类实例创建轻量级包装器，则必须手动实现所有接口方法。委托实现解决了这个问题，但在 1.7.0 之前它不适用于内联类。此限制现已移除，因此您现在可以创建在大多数情况下不会分配内存的轻量级包装器。

```kotlin
interface Bar {
    fun foo() = "foo"
}

@JvmInline
value class BarWrapper(val bar: Bar): Bar by bar

fun main() {
    val bw = BarWrapper(object: Bar {})
    println(bw.foo())
}
```

### 用于类型实参的下划线操作符

Kotlin 1.7.0 为类型实参引入了下划线操作符 `_`。在指定其他类型时，您可以使用它来自动推断类型实参：

```kotlin
abstract class SomeClass<T> {
    abstract fun execute(): T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run(): T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // T 被推断为 String，因为 SomeImplementation 派生自 SomeClass<String>
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // T 被推断为 Int，因为 OtherImplementation 派生自 SomeClass<Int>
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```

> 您可以在变量列表的任何位置使用下划线操作符来推断类型实参。
>
{style="note"}

### 稳定的构建器推断

构建器推断是一种特殊的类型推断，在调用泛型构建器函数时非常有用。它通过使用其 lambda 实参中其他调用的类型信息，帮助编译器推断调用的类型实参。

从 1.7.0 开始，如果常规类型推断在不指定 `-Xenable-builder-inference` 编译器选项（该选项 [在 1.6.0 中引入](whatsnew16.md#changes-to-builder-inference)）的情况下无法获得足够的类型信息，则会自动激活构建器推断。

[了解如何编写自定义泛型构建器](using-builders-with-builder-inference.md)。

### 选择性加入要求（Stable）

[选择性加入要求](opt-in-requirements.md) 现在已达到 [Stable](components-stability.md) 状态，不需要额外的编译器配置。

在 1.7.0 之前，选择性加入功能本身需要实参 `-opt-in=kotlin.RequiresOptIn` 以避免警告。现在不再需要此操作；但是，您仍然可以使用编译器实参 `-opt-in` 来选择性加入其他注解或 [模块](opt-in-requirements.md#opt-in-a-module)。

### 绝对不可为空类型（Stable）

在 Kotlin 1.7.0 中，绝对不可为空类型已晋升为 [Stable](components-stability.md)。它们在扩展泛型 Java 类和接口时提供了更好的互操作性。

您可以使用新语法 `T & Any` 在使用处将泛型类型形参标记为绝对不可为空。该语法形式源自 [交集类型](https://en.wikipedia.org/wiki/Intersection_type) 的表示法，现在仅限于在 `&` 左侧带有可为空上界的类型形参，并在右侧带有不可为空的 `Any`：

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // 正常
    elvisLike<String>("", "").length
    // 错误：'null' 不能是不可为空类型的值
    elvisLike<String>("", null).length

    // 正常
    elvisLike<String?>(null, "").length
    // 错误：'null' 不能是不可为空类型的值
    elvisLike<String?>(null, null).length
}
```

在 [此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) 中了解有关绝对不可为空类型的更多信息。

## Kotlin/JVM

此版本为 Kotlin/JVM 编译器带来了性能提升和新的编译器选项。此外，函数式接口构造函数的可调用引用已变为 Stable。请注意，自 1.7.0 起，Kotlin/JVM 编译的默认目标版本为 `1.8`。

* [编译器性能优化](#compiler-performance-optimizations)
* [新编译器选项 `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [函数式接口构造函数的可调用引用（Stable）](#stable-callable-references-to-functional-interface-constructors)
* [移除了 JVM 目标版本 1.6](#removed-jvm-target-version-1-6)

### 编译器性能优化

Kotlin 1.7.0 为 Kotlin/JVM 编译器引入了性能提升。根据我们的基准测试，与 Kotlin 1.6.0 相比，编译时间 [平均减少了 10%](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)。由于字节码后处理的改进，具有大量内联函数用例的项目（例如 [使用 `kotlinx.html` 的项目](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)）将编译得更快。

### 新编译器选项：-Xjdk-release

Kotlin 1.7.0 提供了一个新的编译器选项 `-Xjdk-release`。此选项类似于 [javac 的命令行 `--release` 选项](http://openjdk.java.net/jeps/247)。`-Xjdk-release` 选项控制目标字节码版本，并将类路径中 JDK 的 API 限制为指定的 Java 版本。例如，`kotlinc -Xjdk-release=1.8` 将不允许引用 `java.lang.Module`，即使依赖项中的 JDK 版本为 9 或更高版本。

> 此选项 [不能保证](https://youtrack.jetbrains.com/issue/KT-29974) 对每个 JDK 发行版都有效。
>
{style="note"}

请在 [此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to) 上留下您的反馈。

### 函数式接口构造函数的可调用引用（Stable）

函数式接口构造函数的 [可调用引用](reflection.md#callable-references) 现在已达到 [Stable](components-stability.md) 状态。了解如何使用可调用引用从带有构造函数的接口 [迁移](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface) 到函数式接口。

请在 [YouTrack](https://youtrack.jetbrains.com/newissue?project=kt) 中报告您发现的任何问题。

### 移除了 JVM 目标版本 1.6

Kotlin/JVM 编译的默认目标版本为 `1.8`。`1.6` 目标版本已被移除。

请迁移到 JVM target 1.8 或更高版本。了解如何更新以下各项的 JVM 目标版本：

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [命令行编译器](compiler-reference.md#jvm-target-version)

## Kotlin/Native

Kotlin 1.7.0 包含对 Objective-C 和 Swift 互操作性的更改，并稳定了之前版本中引入的功能格式。它还为新内存管理器带来了性能提升以及其他更新：

* [新内存管理器的性能提升](#performance-improvements-for-the-new-memory-manager)
* [与 JVM 和 JS IR 后端统一的编译器插件 ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [支持独立的 Android 可执行文件](#support-for-standalone-android-executables)
* [与 Swift async/await 的互操作：返回 `Void` 而不是 `KotlinUnit`](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [禁止通过 Objective-C 桥接传递未声明的异常](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [改进的 CocoaPods 集成](#improved-cocoapods-integration)
* [覆盖 Kotlin/Native 编译器下载 URL](#overriding-the-kotlin-native-compiler-download-url)

### 新内存管理器的性能提升

> 新的 Kotlin/Native 内存管理器处于 [Alpha](components-stability.md) 阶段。
> 它将来可能会发生不兼容的变化，并需要手动迁移。
> 感谢您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中提供反馈。
>
{style="note"}

新内存管理器仍处于 Alpha 阶段，但正朝着 [Stable](components-stability.md) 迈进。此版本为新内存管理器提供了显著的性能提升，尤其是在垃圾回收（GC）方面。特别是，[在 1.6.20 中引入](whatsnew1620.md) 的清除阶段（sweep phase）的并发实现现在默认启用。这有助于减少应用程序因 GC 暂停的时间。新的 GC 调度程序在选择 GC 频率方面表现更好，尤其是对于较大的堆。

此外，我们专门优化了调试二进制文件，确保在内存管理器的实现代码中使用了适当的优化级别和链接时优化。这帮助我们在基准测试中将调试二进制文件的执行时间提高了约 30%。

尝试在您的项目中使用新的内存管理器，看看它的表现如何，并在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中与我们分享您的反馈。

### 与 JVM 和 JS IR 后端统一的编译器插件 ABI

从 Kotlin 1.7.0 开始， Kotlin Multiplatform Gradle 插件默认使用 Kotlin/Native 的可嵌入编译器 jar。此 [功能在 1.6.0 中作为实验性发布](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)，现在已达到 Stable 状态并可以使用。

这一改进对库作者非常方便，因为它改进了编译器插件的开发体验。在此版本之前，您必须为 Kotlin/Native 提供单独的构件，但现在您可以为 Native 和其他支持的平台使用相同的编译器插件构件。

> 此功能可能需要插件开发人员对其现有插件采取迁移步骤。
>
> 了解如何在 [此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-48595) 中为更新准备您的插件。
>
{style="warning"}

### 支持独立的 Android 可执行文件

Kotlin 1.7.0 全面支持为 Android Native 目标生成标准可执行文件。该功能 [在 1.6.20 中引入](whatsnew1620.md#support-for-standalone-android-executables)，现在默认启用。

如果您想回退到 Kotlin/Native 生成共享库的先前行为，请使用以下设置：

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### 与 Swift async/await 的互操作：返回 Void 而不是 KotlinUnit

在 Swift 中，Kotlin `suspend` 函数现在返回 `Void` 类型而不是 `KotlinUnit`。这是改进与 Swift 的 `async`/`await` 互操作性的结果。此功能 [在 1.6.20 中引入](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)，此版本默认启用了该行为。

您不再需要使用 `kotlin.native.binary.unitSuspendFunctionObjCExport=proper` 属性来为此类函数返回正确的类型。

### 禁止通过 Objective-C 桥接传递未声明的异常

当您从 Swift/Objective-C 代码调用 Kotlin 代码（反之亦然）且此代码抛出异常时，该异常应由发生异常的代码处理，除非您特别允许在语言之间通过适当的转换转发异常（例如，使用 `@Throws` 注解）。

以前， Kotlin 存在另一种非预期的行为，即在某些情况下，未声明的异常可能会从一种语言“泄漏”到另一种语言。Kotlin 1.7.0 修复了该问题，现在此类情况会导致程序终止。

因此，例如，如果您在 Kotlin 中有一个 `{ throw Exception() }` 的 lambda 表达式并从 Swift 调用它，在 Kotlin 1.7.0 中，一旦异常到达 Swift 代码，它就会终止。在以前的 Kotlin 版本中，此类异常可能会泄漏到 Swift 代码中。

`@Throws` 注解继续像以前一样工作。

### 改进的 CocoaPods 集成

从 Kotlin 1.7.0 开始，如果您想在项目中集成 CocoaPods，不再需要安装 `cocoapods-generate` 插件。

以前，您需要同时安装 CocoaPods 依赖管理器和 `cocoapods-generate` 插件才能使用 CocoaPods，例如，在 Kotlin Multiplatform Mobile 项目中处理 [iOS 依赖项](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)。

现在设置 CocoaPods 集成更加容易，我们解决了在 Ruby 3 及更高版本上无法安装 `cocoapods-generate` 的问题。现在也支持在 Apple M1 上运行得更好的最新 Ruby 版本。

了解如何设置 [初始 CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)。

### 覆盖 Kotlin/Native 编译器下载 URL

从 Kotlin 1.7.0 开始，您可以自定义 Kotlin/Native 编译器的下载 URL。当 CI 上的外部链接被禁止时，这非常有用。

要覆盖默认基准 URL `https://download.jetbrains.com/kotlin/native/builds`，请使用以下 Gradle 属性：

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> 下载器会将原生版本和目标操作系统附加到此基准 URL，以确保其下载实际的编译器发行版。
>
{style="note"}

## Kotlin/JS

Kotlin/JS 的 [JS IR 编译器后端](js-ir-compiler.md) 正在接受进一步的改进，同时也带来了一些其他更新，可以使您的开发体验更好：

* [新 IR 后端的性能提升](#performance-improvements-for-the-new-ir-backend)
* [使用 IR 时成员名称的缩减](#minification-for-member-names-when-using-ir)
* [IR 后端通过 Polyfill 支持旧版浏览器](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [从 js 表达式动态加载 JavaScript 模块](#dynamically-load-javascript-modules-from-js-expressions)
* [为 JavaScript 测试运行程序指定环境变量](#specify-environment-variables-for-javascript-test-runners)

### 新 IR 后端的性能提升

此版本有一些重大更新，应该会改善您的开发体验：

* Kotlin/JS 的增量编译性能得到了显著提升。构建 JS 项目所需的时间更短。现在，增量重新构建在许多情况下应该与旧版后端旗鼓相当。
* Kotlin/JS 最终包（bundle）所需的空间更少，因为我们显著减小了最终构件的大小。对于某些大型项目，我们测得生产包的大小与旧版后端相比减少了高达 20%。
* 接口的类型检查得到了数量级的提升。
* Kotlin 生成了更高质量的 JS 代码

### 使用 IR 时成员名称的缩减

Kotlin/JS IR 编译器现在使用其关于 Kotlin 类和函数关系的内部信息来应用更有效的缩减（minification），从而缩短函数、属性和类的名称。这减小了生成的打包应用程序的大小。

当您在生产模式下构建 Kotlin/JS 应用程序时，会自动应用此类缩减，且默认启用。要禁用成员名称缩减，请使用 `-Xir-minimized-member-names` 编译器标志：

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### IR 后端通过 Polyfill 支持旧版浏览器

Kotlin/JS 的 IR 编译器后端现在包含与旧版后端相同的 Polyfill。这允许使用新编译器编译的代码在不支持 Kotlin 标准库所使用的 ES2015 所有方法的旧版浏览器中运行。只有项目中实际使用的那些 Polyfill 才会包含在最终包中，从而最大限度地减少其对包大小的潜在影响。

使用 IR 编译器时，此功能默认启用，您无需进行配置。

### 从 js 表达式动态加载 JavaScript 模块

在处理 JavaScript 模块时，大多数应用程序使用静态导入，其使用范围涵盖在 [JavaScript 模块集成](js-modules.md) 中。然而， Kotlin/JS 缺少一种在应用程序运行时动态加载 JavaScript 模块的机制。

从 Kotlin 1.7.0 开始， `js` 代码块中支持 JavaScript 的 `import` 语句，允许您在运行时动态地将软件包引入应用程序：

```kotlin
val myPackage = js("import('my-package')")
```

### 为 JavaScript 测试运行程序指定环境变量

为了微调 Node.js 软件包解析或将外部信息传递给 Node.js 测试，您现在可以指定 JavaScript 测试运行程序使用的环境变量。要定义环境变量，请在构建脚本的 `testTask` 代码块中使用带有键值对的 `environment()` 函数：

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

## 标准库

在 Kotlin 1.7.0 中，标准库进行了一系列更改和改进。它们引入了新功能，稳定了实验性功能，并统一了对 Native、JS 和 JVM 的命名捕获组的支持：

* [min() 和 max() 集合函数返回不可为空类型](#min-and-max-collection-functions-return-as-non-nullable)
* [在特定索引处进行正则表达式匹配](#regular-expression-matching-at-specific-indices)
* [对先前语言和 API 版本的扩展支持](#extended-support-for-previous-language-and-api-versions)
* [通过反射访问注解](#access-to-annotations-via-reflection)
* [稳定的深层递归函数](#stable-deep-recursive-functions)
* [默认时间源的基于内联类的时间标记](#time-marks-based-on-inline-classes-for-default-time-source)
* [Java Optional 的新实验性扩展函数](#new-experimental-extension-functions-for-java-optionals)
* [JS 和 Native 中对命名捕获组的支持](#support-for-named-capturing-groups-in-js-and-native)

### min() 和 max() 集合函数返回不可为空类型

在 [Kotlin 1.4.0](whatsnew14.md) 中，我们将 `min()` 和 `max()` 集合函数重命名为 `minOrNull()` 和 `maxOrNull()`。这些新名称更好地反映了它们的行为——如果接收者集合为空则返回 null。这也有助于使函数的行为与整个 Kotlin 集合 API 中使用的命名约定保持一致。

`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 也是如此，它们在 Kotlin 1.4.0 中都获得了 *OrNull() 同义词。受此更改影响的旧函数被逐渐弃用。

Kotlin 1.7.0 重新引入了原始函数名称，但具有不可为空的返回值类型。新的 `min()`、`max()`、`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 函数现在严格返回集合元素或抛出异常。

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 在特定索引处进行正则表达式匹配

[在 1.5.30 中引入](whatsnew1530.md#matching-with-regex-at-a-particular-position) 的 `Regex.matchAt()` 和 `Regex.matchesAt()` 函数现在已达到 Stable 状态。它们提供了一种检查正则表达式是否在 `String` 或 `CharSequence` 的特定位置精确匹配的方法。

`matchesAt()` 检查匹配并返回布尔结果：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 正则表达式：一个数字、点、一个数字、点、一个或多个数字
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()` 如果找到匹配则返回该匹配，否则返回 `null`：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

我们非常感谢您在 [此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-34021) 中提供的反馈。

### 对先前语言和 API 版本的扩展支持

为了支持开发旨在供广泛先前 Kotlin 版本使用的库作者，并应对 Kotlin 主要版本发布频率的增加，我们扩展了对先前语言和 API 版本的影响。

从 Kotlin 1.7.0 开始，我们支持三个先前的语言和 API 版本，而不是两个。这意味着 Kotlin 1.7.0 支持开发目标版本低至 1.4.0 的库。有关向后兼容性的更多信息，请参阅 [兼容性选项](kotlin-evolution-principles.md#compatibility-options)。

### 通过反射访问注解

[`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 扩展函数最初 [在 1.6.0 中引入](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target)，现在已达到 [Stable](components-stability.md) 状态。此 [反射](reflection.md) 函数返回元素上给定类型的所有注解，包括单独应用的和重复的注解。

```kotlin
@Repeatable
annotation class Tag(val name: String)

@Tag("First Tag")
@Tag("Second Tag")
fun taggedFunction() {
    println("I'm a tagged function!")
}

fun main() {
    val x = ::taggedFunction
    val foo = x as KAnnotatedElement
    println(foo.findAnnotations<Tag>()) // [@Tag(name=First Tag), @Tag(name=Second Tag)]
}
```

### 稳定的深层递归函数

深层递归函数自 [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines) 起作为实验性功能提供，现在在 Kotlin 1.7.0 中已达到 [Stable](components-stability.md) 状态。使用 `DeepRecursiveFunction`，您可以定义一个将其调用栈保留在堆上而不是使用实际调用栈的函数。这允许您运行非常深的递归计算。要调用深层递归函数，请 `invoke` 它。

在此示例中，使用深层递归函数来递归计算二叉树的深度。即使此示例函数递归调用自身 100,000 次，也不会抛出 `StackOverflowError`：

```kotlin
class Tree(val left: Tree?, val right: Tree?)

val calculateDepth = DeepRecursiveFunction<Tree?, Int> { t ->
    if (t == null) 0 else maxOf(
        callRecursive(t.left),
        callRecursive(t.right)
    ) + 1
}

fun main() {
    // 生成深度为 100_000 的树
    val deepTree = generateSequence(Tree(null, null)) { prev ->
        Tree(prev, null)
    }.take(100_000).last()

    println(calculateDepth(deepTree)) // 100000
}
```

在递归深度超过 1000 次调用的代码中，请考虑使用深层递归函数。

### 默认时间源的基于内联类的时间标记

Kotlin 1.7.0 通过将 `TimeSource.Monotonic` 返回的时间标记更改为内联值类，提高了时间测量功能的性能。这意味着调用 `markNow()`、`elapsedNow()`、`measureTime()` 和 `measureTimedValue()` 等函数不会为其 `TimeMark` 实例分配包装类。特别是当测量属于热点路径的代码片段时，这有助于最大程度地减少测量对性能的影响：

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 返回的 `TimeMark` 是内联类
    val elapsedDuration = mark.elapsedNow()
}
```

> 仅当获得 `TimeMark` 的时间源静态已知为 `TimeSource.Monotonic` 时，此优化才可用。
>
{style="note"}

### Java Optional 的新实验性扩展函数

Kotlin 1.7.0 带有新的便捷函数，简化了在 Java 中使用 `Optional` 类的过程。这些新函数可用于在 JVM 上拆封和转换可选对象，并有助于使处理 Java API 更加简洁。

`getOrNull()`、`getOrDefault()` 和 `getOrElse()` 扩展函数允许您获取 `Optional` 的值（如果存在）。否则，您将分别获得 `null`、默认值或函数返回的值：

```kotlin
val presentOptional = Optional.of("I'm here!")

println(presentOptional.getOrNull())
// "I'm here!"

val absentOptional = Optional.empty<String>()

println(absentOptional.getOrNull())
// null
println(absentOptional.getOrDefault("Nobody here!"))
// "Nobody here!"
println(absentOptional.getOrElse {
    println("Optional was absent!")
    "Default value!"
})
// "Optional was absent!"
// "Default value!"
```

`toList()`、`toSet()` 和 `asSequence()` 扩展函数将存在的 `Optional` 值转换为列表、集合或序列，否则返回空集合。`toCollection()` 扩展函数将 `Optional` 值附加到已存在的现有目标集合中：

```kotlin
val presentOptional = Optional.of("I'm here!")
val absentOptional = Optional.empty<String>()
println(presentOptional.toList() + "," + absentOptional.toList())
// ["I'm here!"], []
println(presentOptional.toSet() + "," + absentOptional.toSet())
// ["I'm here!"], []
val myCollection = mutableListOf<String>()
absentOptional.toCollection(myCollection)
println(myCollection)
// []
presentOptional.toCollection(myCollection)
println(myCollection)
// ["I'm here!"]
val list = listOf(presentOptional, absentOptional).flatMap { it.asSequence() }
println(list)
// ["I'm here!"]
```

这些扩展函数在 Kotlin 1.7.0 中作为实验性引入。您可以在 [此 KEEP](https://github.com/Kotlin/KEEP/pull/291) 中了解有关 `Optional` 扩展的更多信息。一如既往，我们欢迎您在 [Kotlin 问题跟踪器](https://kotl.in/issue) 中提供反馈。

### JS 和 Native 中对命名捕获组的支持

从 Kotlin 1.7.0 开始，命名捕获组（named capturing groups）不仅在 JVM 上受支持，在 JS 和 Native 平台上也受支持。

要为捕获组命名，请在正则表达式中使用 (`?<name>group`) 语法。要获取由组匹配的文本，请调用新引入的 [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 函数并传递组名。

#### 通过名称检索匹配的组值

考虑这个匹配城市坐标的示例。要获取由正则表达式匹配的组集合，请使用 [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html)。比较通过组编号（索引）和通过名称使用 `value` 检索组内容：

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 通过名称
    println(match.groups[2]?.value) // "TX" — 通过编号
}
```

#### 命名后行引用（Named backreferencing）

现在您还可以在后行引用组时使用组名。后行引用匹配先前由捕获组匹配的相同文本。为此，请在正则表达式中使用 `\k<name>` 语法：

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 替换表达式中的命名组

命名组引用可以与替换表达式一起使用。考虑 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 函数，它将输入中所有出现的指定正则表达式替换为替换表达式；以及 [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 函数，它仅交换第一个匹配项。

替换字符串中出现的 `${name}` 将被替换为与具有指定名称的捕获组相对应的子序列。您可以比较按名称和按索引进行的组引用替换：

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 通过名称
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 通过编号
}
```

## Gradle

此版本引入了新的构建报告、对 Gradle 插件变体的支持、kapt 中的新统计信息等等：

* [增量编译的新方法](#a-new-approach-to-incremental-compilation)
* [用于跟踪编译器性能的新构建报告](#build-reports-for-kotlin-compiler-tasks)
* [Gradle 和 Android Gradle 插件最低支持版本的变化](#bumping-minimum-supported-versions)
* [支持 Gradle 插件变体](#support-for-gradle-plugin-variants)
* [Kotlin Gradle 插件 API 的更新](#updates-in-the-kotlin-gradle-plugin-api)
* [通过插件 API 提供 sam-with-receiver 插件](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [编译任务的变化](#changes-in-compile-tasks)
* [kapt 中每个注解处理器生成文件的最新统计信息](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [弃用 kotlin.compiler.execution.strategy 系统属性](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [移除已弃用的选项、方法和插件](#removal-of-deprecated-options-methods-and-plugins)

### 增量编译的新方法

> 增量编译的新方法处于 [Experimental](components-stability.md) 阶段。它可能随时被丢弃或更改。
> 需要选择性加入（请参阅下面的详细信息）。我们鼓励您仅出于评估目的使用它，我们非常感谢您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供的反馈。
>
{style="warning"}

在 Kotlin 1.7.0 中，我们重新设计了跨模块更改的增量编译。现在，对依赖的非 Kotlin 模块中所做的更改也支持增量编译，并且它与 [Gradle 构建缓存](https://docs.gradle.org/current/userguide/build_cache.html) 兼容。对避免编译的支持也得到了改进。

如果您使用构建缓存或经常在非 Kotlin Gradle 模块中进行更改，我们预计您将看到新方法带来的最显著收益。我们对 `kotlin-gradle-plugin` 模块上的 Kotlin 项目进行的测试显示，对于缓存命中后的更改，其改进超过了 80%。

要尝试这种新方法，请在 `gradle.properties` 中设置以下选项：

```none
kotlin.incremental.useClasspathSnapshot=true
```

> 目前，增量编译的新方法仅适用于 Gradle 构建系统中的 JVM 后端。
>
{style="note"}

在 [这篇博文](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/) 中了解增量编译新方法在底层的实现方式。

我们的计划是稳定这项技术，并增加对其他后端（例如 JS）和构建系统的支持。如果您在此编译方案中遇到任何问题或异常行为，请在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中向我们报告。谢谢！

Kotlin 团队非常感谢 [Ivan Gavrilovic](https://github.com/gavra0)、[Hung Nguyen](https://github.com/hungvietnguyen)、[Cédric Champeau](https://github.com/melix) 以及其他外部贡献者的帮助。

### 用于 Kotlin 编译器任务的构建报告

> Kotlin 构建报告处于 [Experimental](components-stability.md) 阶段。它们可能随时被丢弃或更改。
> 需要选择性加入（请参阅下文详情）。仅出于评估目的使用它们。我们感谢您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中对它们的反馈。
>
{style="warning"}

Kotlin 1.7.0 引入了有助于跟踪编译器性能的构建报告。报告包含不同编译阶段的持续时间以及无法进行增量编译的原因。

当您想调查编译器任务的问题时，构建报告非常方便，例如：

* 当 Gradle 构建耗时过多，并且您想了解性能不佳的根本原因时。
* 当同一项目的编译时间不同时，有时只需几秒钟，有时则需要几分钟。

要启用构建报告，请在 `gradle.properties` 中声明构建报告输出的保存位置：

```none
kotlin.build.report.output=file
```

提供以下值（及其组合）：

* `file` 将构建报告保存在本地文件中。
* `build_scan` 将构建报告保存在 [构建扫描](https://scans.gradle.com/) 的 `custom values` 部分。

  > Gradle Enterprise 插件限制了自定义值的数量及其长度。在大型项目中，某些值可能会丢失。
  >
  {style="note"}

* `http` 使用 HTTP(S) 发布构建报告。POST 方法以 JSON 格式发送指标。数据可能会随版本变化。您可以在 [Kotlin 仓库](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt) 中查看当前版本发送的数据。

分析长时间编译的构建报告可以帮助您解决两个常见案例：

* 构建不是增量的。分析原因并修复底层问题。
* 构建是增量的，但耗时过多。尝试重新组织源文件——拆分大文件、将不同的类保存在不同的文件中、重构大型类、在不同的文件中声明顶层函数等等。

在 [这篇博文](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/) 中了解有关新构建报告的更多信息。

欢迎您在您的基础架构中尝试使用构建报告。如果您有任何反馈、遇到任何问题或想建议改进，请随时在我们的 [问题跟踪器](https://youtrack.jetbrains.com/newIssue) 中报告。谢谢！

### 提升最低支持版本

从 Kotlin 1.7.0 开始，最低支持的 Gradle 版本为 6.7.1。为了支持 [Gradle 插件变体](#support-for-gradle-plugin-variants) 和新的 Gradle API，我们不得不 [提升版本](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1)。将来，由于 Gradle 插件变体功能，我们不应需要如此频繁地提升最低支持版本。

此外，最低支持的 Android Gradle 插件版本现在为 3.6.4。

### 支持 Gradle 插件变体

Gradle 7.0 为 Gradle 插件作者引入了一项新功能——[具有变体的插件](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)。此功能使得在保持对 7.1 以下 Gradle 版本兼容性的同时，更容易添加对新 Gradle 功能的支持。详细了解 [Gradle 中的变体选择](https://docs.gradle.org/current/userguide/variant_model.html)。

通过 Gradle 插件变体，我们可以为不同的 Gradle 版本发布不同的 Kotlin Gradle 插件变体。目标是在 `main` 变体中支持基础 Kotlin 编译，该变体对应于最早支持的 Gradle 版本。每个变体都将包含对应发行版中 Gradle 功能的实现。最新的变体将支持最广泛的 Gradle 功能集。通过这种方式，我们可以通过有限的功能扩展对较旧 Gradle 版本的影响。

目前， Kotlin Gradle 插件只有两个变体：

* `main` 用于 Gradle 6.7.1–6.9.3 版本
* `gradle70` 用于 Gradle 7.0 及更高版本

在未来的 Kotlin 版本中，我们可能会添加更多变体。

要检查您的构建使用哪个变体，请启用 [`--info` 日志级别](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) 并在输出中查找以 `Using Kotlin Gradle plugin` 开头的字符串，例如 `Using Kotlin Gradle plugin main variant`。

> 以下是 Gradle 中变体选择的一些已知问题的解决方法：
> * [pluginManagement 中的 ResolutionStrategy 对多变体插件不起作用](https://github.com/gradle/gradle/issues/20545)
> * [当插件作为 `buildSrc` 公共依赖项添加时，插件变体会被忽略](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

在 [此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants) 上留下您的反馈。

### Kotlin Gradle 插件 API 的更新

Kotlin Gradle 插件 API 构件得到了多项改进：

* 为具有用户可配置输入的 Kotlin/JVM 和 Kotlin/kapt 任务提供了新接口。
* 有一个新的 `KotlinBasePlugin` 接口，所有 Kotlin 插件都继承自该接口。当您想要在应用任何 Kotlin Gradle 插件（JVM、JS、Multiplatform、Native 和其他平台）时触发某些配置操作时，请使用此接口：

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // 在此处配置您的操作
  }
  ```
  您可以在 [此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin) 中留下关于 `KotlinBasePlugin` 的反馈。

* 我们为 Android Gradle 插件在其内部配置 Kotlin 编译奠定了基础，这意味着您无需在构建中添加 Kotlin Android Gradle 插件。
  关注 [Android Gradle 插件发布公告](https://developer.android.com/studio/releases/gradle-plugin) 了解添加的支持并尝试一下！

### 通过插件 API 提供 sam-with-receiver 插件

[sam-with-receiver 编译器插件](sam-with-receiver-plugin.md) 现在可以通过 [Gradle 插件 DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) 获得：

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### 编译任务的变化

编译任务在此版本中有很多变化：

* Kotlin 编译任务不再继承 Gradle 的 `AbstractCompile` 任务。它们仅继承 `DefaultTask`。
* `AbstractCompile` 任务具有 `sourceCompatibility` 和 `targetCompatibility` 输入。由于不再继承 `AbstractCompile` 任务，这些输入在 Kotlin 用户脚本中不再可用。
* `SourceTask.stableSources` 输入不再可用，您应该使用 `sources` 输入。`setSource(...)` 方法仍然可用。
* 所有编译任务现在都使用 `libraries` 输入来获取编译所需的库列表。`KotlinCompile` 任务仍然具有已弃用的 Kotlin 属性 `classpath`，该属性将在未来版本中移除。
* 编译任务仍然实现 `PatternFilterable` 接口，这允许过滤 Kotlin 源文件。移除了 `sourceFilesExtensions` 输入，转而使用 `PatternFilterable` 方法。
* 已弃用的 `Gradle destinationDir: File` 输出被替换为 `destinationDirectory: DirectoryProperty` 输出。
* Kotlin/Native 的 `AbstractNativeCompile` 任务现在继承 `AbstractKotlinCompileTool` 基类。这是将 Kotlin/Native 构建工具集成到所有其他工具中的第一步。

请在 [此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-32805) 中留下您的反馈。

### kapt 中每个注解处理器生成文件的统计信息

`kotlin-kapt` Gradle 插件已经 [报告每个处理器的性能统计信息](https://github.com/JetBrains/kotlin/pull/4280)。从 Kotlin 1.7.0 开始，它还可以报告每个注解处理器生成文件数量的统计信息。

这对于跟踪构建过程中是否存在未使用的注解处理器非常有用。您可以使用生成的报告找到触发不必要注解处理器的模块，并更新模块以防止这种情况发生。

通过两个步骤启用统计信息：

* 在您的 `build.gradle.kts` 中将 `showProcessorStats` 标志设置为 `true`：

  ```kotlin
  kapt {
      showProcessorStats = true
  }
  ```

* 在您的 `gradle.properties` 中将 `kapt.verbose` Gradle 属性设置为 `true`：
  
  ```none
  kapt.verbose=true
  ```

> 您还可以通过 [命令行选项 `verbose`](kapt.md#cli) 启用详细输出。
>
{style="note"}

统计信息将以 `info` 级别出现在日志中。您将看到 `Annotation processor stats:` 行，随后是每个注解处理器执行时间的统计信息。在这些行之后，将出现 `Generated files report:` 行，随后是每个注解处理器生成文件数量的统计信息。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

请在 [此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann) 中留下您的反馈。

### 弃用 kotlin.compiler.execution.strategy 系统属性

Kotlin 1.6.20 [引入了用于定义 Kotlin 编译器执行策略的新属性](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)。在 Kotlin 1.7.0 中，旧系统属性 `kotlin.compiler.execution.strategy` 的弃用周期已经开始，转而支持新属性。

当使用 `kotlin.compiler.execution.strategy` 系统属性时，您将收到警告。此属性将在未来版本中删除。要保留旧行为，请将系统属性替换为同名的 Gradle 属性。例如，您可以在 `gradle.properties` 中执行此操作：

```none
kotlin.compiler.execution.strategy=out-of-process
```

您还可以使用编译任务属性 `compilerExecutionStrategy`。在 [相关页面](compiler-execution-strategy.md) 上了解更多信息。

### 移除已弃用的选项、方法和插件

#### 移除 useExperimentalAnnotation 方法

在 Kotlin 1.7.0 中，我们完成了对 `useExperimentalAnnotation` Gradle 方法的弃用周期。请改用 `optIn()` 以在模块中选择性加入使用 API。

例如，如果您的 Gradle 模块是多平台的：

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

了解有关 Kotlin 中 [选择性加入要求](opt-in-requirements.md) 的更多信息。

#### 移除已弃用的编译器选项

我们已经完成了几个编译器选项的弃用周期：

* `kotlinOptions.jdkHome` 编译器选项在 1.5.30 中被弃用，并在当前版本中被移除。现在，如果 Gradle 构建包含此选项，则会失败。我们鼓励您使用 [Java 工具链](whatsnew1530.md#support-for-java-toolchains)，自 Kotlin 1.5.30 起已支持该功能。
* 已弃用的 `noStdlib` 编译器选项也已被移除。Gradle 插件使用 `kotlin.stdlib.default.dependency=true` 属性来控制 Kotlin 标准库是否存在。

> 编译器参数 `-jdkHome` 和 `-no-stdlib` 仍然可用。
>
{style="note"}

#### 移除已弃用的插件

在 Kotlin 1.4.0 中，`kotlin2js` 和 `kotlin-dce-plugin` 插件被弃用，并在本版本中被移除。请使用新的 `org.jetbrains.kotlin.js` 插件来代替 `kotlin2js`。当正确配置 Kotlin/JS Gradle 插件时，死代码消除 (DCE) 即可工作。

在 Kotlin 1.6.0 中，我们将 `KotlinGradleSubplugin` 类的弃用级别更改为 `ERROR`。开发人员使用此类编写编译器插件。在此版本中，[该类已被移除](https://youtrack.jetbrains.com/issue/KT-48831/)。请改用 `KotlinCompilerPluginSupportPlugin` 类。

> 最佳做法是在整个项目中使用版本为 1.7.0 及更高版本的 Kotlin 插件。
>
{style="tip"}

#### 移除已弃用的协程 DSL 选项和属性

我们移除了已弃用的 `kotlin.experimental.coroutines` Gradle DSL 选项以及在 `gradle.properties` 中使用的 `kotlin.coroutines` 属性。现在，您只需使用 _[挂起函数](coroutines-basics.md)_ 或在构建脚本中 [添加 `kotlinx.coroutines` 依赖项](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library) 即可。

在 [协程指南](coroutines-guide.md) 中了解有关协程的更多信息。

#### 移除工具链扩展方法中的类型转换

在 Kotlin 1.7.0 之前，使用 Kotlin DSL 配置 Gradle 工具链时，必须将类型转换为 `JavaToolchainSpec` 类：

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

现在，您可以省略 `(this as JavaToolchainSpec)` 部分：

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## 迁移到 Kotlin 1.7.0

### 安装 Kotlin 1.7.0

IntelliJ IDEA 2022.1 和 Android Studio Chipmunk (212) 会自动建议将 Kotlin 插件更新到 1.7.0。

> 对于 IntelliJ IDEA 2022.2、Android Studio Dolphin (213) 或 Android Studio Electric Eel (221)，Kotlin 插件 1.7.0 将随即将发布的 IntelliJ IDEA 和 Android Studio 更新一起提供。
> 
{style="note"}

新的命令行编译器可在 [GitHub 发布页面](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0) 下载。

### 使用 Kotlin 1.7.0 迁移现有项目或开始新项目

* 要将现有项目迁移到 Kotlin 1.7.0，请将 Kotlin 版本更改为 `1.7.0` 并重新导入您的 Gradle 或 Maven 项目。[了解如何更新到 Kotlin 1.7.0](releases.md#update-to-a-new-kotlin-version)。

* 要使用 Kotlin 1.7.0 开始一个新项目，请更新 Kotlin 插件并从 **文件** | **新建** | **项目** 运行项目向导。

### Kotlin 1.7.0 兼容性指南

Kotlin 1.7.0 是一个 [功能版本](kotlin-evolution-principles.md#language-and-tooling-releases)，因此可能会带来与您为该语言早期版本编写的代码不兼容的更改。
在 [Kotlin 1.7.0 兼容性指南](compatibility-guide-17.md) 中查找此类更改的详细列表。