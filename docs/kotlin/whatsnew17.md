[//]: # (title: Kotlin 1.7.0 最新变化)

<web-summary>阅读 Kotlin 1.7.0 发布说明，涵盖新语言功能、Kotlin Multiplatform、JVM、Native、JS 的更新，以及对 Gradle 和 Maven 构建工具的支持。</web-summary>

<tldr>
   <p>适用于 IntelliJ IDEA 2021.2、2021.3 和 2022.1 的 Kotlin 1.7.0 IDE 支持现已推出。</p>
</tldr>

_[发布日期：2022 年 6 月 9 日](releases.md#release-history)_

Kotlin 1.7.0 已正式发布。该版本推出了全新 Kotlin/JVM K2 编译器的 Alpha 版本，稳定了多项语言功能，并为 JVM、JS 和 Native 平台带来了性能提升。

以下是该版本的主要更新列表：

* [全新的 Kotlin K2 编译器现已进入 Alpha 阶段](#new-kotlin-k2-compiler-for-the-jvm-in-alpha)，并带来了显著的性能提升。它目前仅适用于 JVM，且所有编译器插件（包括 kapt）均无法与其配合使用。
* [Gradle 增量编译的新方法](#a-new-approach-to-incremental-compilation)。增量编译现已支持在依赖的非 Kotlin 模块内所做的更改，并与 Gradle 完全兼容。
* 我们稳定了[选择加入要求注解](#stable-opt-in-requirements)、[绝对不可空类型](#stable-definitely-non-nullable-types)以及[构建器推断](#stable-builder-inference)。
* [类型实参现已引入下划线运算符](#underscore-operator-for-type-arguments)。当指定了其他类型时，你可以使用它来自动推断某个实参的类型。
* [此版本允许通过委托给内联类的内联值来实现接口](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)。你现在可以创建在大多数情况下都不会分配内存的轻量级包装器。

你还可以在此视频中查看变更简要概述：

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="Kotlin 1.7.0 最新变化"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 适用于 JVM 的全新 Kotlin K2 编译器进入 Alpha 阶段 {id="new-kotlin-k2-compiler-for-the-jvm-in-alpha"}

此 Kotlin 版本引入了全新 Kotlin K2 编译器的 **Alpha** 版本。新编译器的目标是加快新语言功能的开发速度，统一 Kotlin 支持的所有平台，带来性能提升，并为编译器扩展提供 API。

我们此前已经发布了关于新编译器及其优势的详细说明：

* [通往全新 Kotlin 编译器之路 (The Road to the New Kotlin Compiler)](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 编译器：自顶向下的视角 (K2 Compiler: a Top-Down View)](https://www.youtube.com/watch?v=db19VFLZqJM)

需要指出的是，在全新 K2 编译器的 Alpha 版本中，我们主要专注于性能改进，且它仅适用于 JVM 项目。它不支持 Kotlin/JS、Kotlin/Native 或其他多平台项目，并且包括 [kapt](kapt.md) 在内的所有编译器插件都无法与其配合使用。

我们的基准测试在内部项目中显示出了卓越的成效：

| 项目 | 当前 Kotlin 编译器性能 | 全新 K2 Kotlin 编译器性能 | 性能提升 |
|---------------|-------------------------------------|------------------------------------|-------------------|
| Kotlin        | 2.2 KLOC/s                          | 4.8 KLOC/s                         | ~ x2.2            |
| YouTrack      | 1.8 KLOC/s                          | 4.2 KLOC/s                         | ~ x2.3            |
| IntelliJ IDEA | 1.8 KLOC/s                          | 3.9 KLOC/s                         | ~ x2.2            |
| Space         | 1.2 KLOC/s                          | 2.8 KLOC/s                         | ~ x2.3            |

> KLOC/s 性能数字代表编译器每秒处理的千行代码数。
>
> {style="tip"}

你可以在自己的 JVM 项目中检验性能提升，并将其与旧编译器的结果进行对比。若要启用 Kotlin K2 编译器，请使用以下编译器选项：

```bash
-Xuse-k2
```

此外，K2 编译器[包含多项错误修复](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved)。请注意，此列表中即使处于 **State: Open** 状态的问题，实际上也已在 K2 中修复。

后续的 Kotlin 版本将继续提高 K2 编译器的稳定性并提供更多功能，敬请期待！

如果你在使用 Kotlin K2 编译器时遇到任何性能问题，请[向我们的问题跟踪器报告](https://kotl.in/issue)。

## 语言 {id="language"}

Kotlin 1.7.0 引入了对通过委托实现的支持以及用于类型实参的全新下划线运算符。它还稳定了在之前版本中作为预览版引入的多项语言功能：

* [通过委托给内联类的内联值来实现接口](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [用于类型实参的下划线运算符](#underscore-operator-for-type-arguments)
* [稳定的构建器推断](#stable-builder-inference)
* [稳定的选择加入要求](#stable-opt-in-requirements)
* [稳定的绝对不可空类型](#stable-definitely-non-nullable-types)

### 允许通过委托给内联类的内联值来实现接口 {id="allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class"}

如果你想为某个值或类实例创建轻量级包装器，则必须手动实现所有接口方法。通过委托实现可以解决这个问题，但在 1.7.0 之前，它无法与内联类配合使用。这一限制现已被移除，因此你现在可以创建在大多数情况下都不会分配内存的轻量级包装器。

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

### 用于类型实参的下划线运算符 {id="underscore-operator-for-type-arguments"}

Kotlin 1.7.0 引入了用于类型实参的下划线运算符 `_`。当指定了其他类型时，你可以使用它来自动推断某个类型实参：

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

> 你可以在变量列表中的任意位置使用下划线运算符来推断类型实参。
>
{style="note"}

### 稳定的构建器推断 {id="stable-builder-inference"}

构建器推断是一种特殊的类型推断，在调用泛型构建器函数时非常有用。它通过调用其 lambda 表达式实参内的其他调用所提供的类型信息，来帮助编译器推断调用的类型实参。

从 1.7.0 开始，如果常规类型推断无法获取足够的类型信息，构建器推断将自动激活，而无需指定在 [1.6.0 中引入](whatsnew16.md#changes-to-builder-inference)的 `-Xenable-builder-inference` 编译器选项。

[了解如何编写自定义泛型构建器](using-builders-with-builder-inference.md)。

### 稳定的选择加入要求 {id="stable-opt-in-requirements"}

[选择加入要求](opt-in-requirements.md)现已进入[稳定 (Stable)](components-stability.md) 状态，不再需要额外的编译器配置。

在 1.7.0 之前，选择加入功能本身需要实参 `-opt-in=kotlin.RequiresOptIn` 来避免警告。现在已不再需要该实参；不过，你仍然可以使用编译器实参 `-opt-in` 为其他注解或[模块](opt-in-requirements.md#opt-in-a-module)选择加入。

### 稳定的绝对不可空类型 {id="stable-definitely-non-nullable-types"}

在 Kotlin 1.7.0 中，绝对不可空类型已晋升为[稳定 (Stable)](components-stability.md) 状态。它们在扩展泛型 Java 类和接口时提供了更好的互操作性。

你可以使用新语法 `T & Any` 在使用处将泛型类型形参标记为绝对不可空。该语法形式源自[交叉类型 (Intersection types)](https://en.wikipedia.org/wiki/Intersection_type) 的表示法，目前限制为：`&` 左侧为带有可空上界的类型形参，右侧为不可空的 `Any`：

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // 正确
    elvisLike<String>("", "").length
    // 错误：'null' 不能作为非 null 类型的值
    elvisLike<String>("", null).length

    // 正确
    elvisLike<String?>(null, "").length
    // 错误：'null' 不能作为非 null 类型的值
    elvisLike<String?>(null, null).length
}
```

在[此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) 中详细了解绝对不可空类型。

## Kotlin/JVM {id="kotlin-jvm"}

此版本为 Kotlin/JVM 编译器带来了性能改进以及新的编译器选项。此外，对函数式接口构造函数的 Callable 引用已达到稳定状态。请注意，自 1.7.0 起，Kotlin/JVM 编译的默认目标版本为 `1.8`。

* [编译器性能优化](#compiler-performance-optimizations)
* [新编译器选项 `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [稳定的对函数式接口构造函数的 Callable 引用](#stable-callable-references-to-functional-interface-constructors)
* [移除了 JVM 目标版本 1.6](#removed-jvm-target-version-1-6)

### 编译器性能优化 {id="compiler-performance-optimizations"}

Kotlin 1.7.0 引入了针对 Kotlin/JVM 编译器的性能改进。根据我们的基准测试，与 Kotlin 1.6.0 相比，编译时间[平均缩短了 10%](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)。得益于字节码后处理的改进，大量使用内联函数的项目（例如[使用 `kotlinx.html` 的项目](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)）编译速度将更快。

### 新编译器选项：-Xjdk-release {id="new-compiler-option-xjdk-release"}

Kotlin 1.7.0 引入了一个新的编译器选项 `-Xjdk-release`。此选项类似于 [javac 的命令行 `--release` 选项](http://openjdk.java.net/jeps/247)。`-Xjdk-release` 选项用于控制目标字节码版本，并将类路径中 JDK 的 API 限制为指定的 Java 版本。例如，即使依赖项中的 JDK 版本为 9 或更高版本，`kotlinc -Xjdk-release=1.8` 也不允许引用 `java.lang.Module`。

> 此选项[无法保证](https://youtrack.jetbrains.com/issue/KT-29974)对每种 JDK 发行版都生效。
>
{style="note"}

请在[此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to)中留下你的反馈。

### 稳定的对函数式接口构造函数的 Callable 引用 {id="stable-callable-references-to-functional-interface-constructors"}

对函数式接口构造函数的 [Callable 引用](fun-interfaces.md#pass-callable-references-to-sam-parameters)现已达到[稳定 (Stable)](components-stability.md) 状态。了解如何使用 Callable 引用从[带有构造函数的接口迁移到函数式接口](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)。

请在 [YouTrack](https://youtrack.jetbrains.com/newissue?project=kt) 中报告你发现的任何问题。

### 移除了 JVM 目标版本 1.6 {id="removed-jvm-target-version-1-6"}

Kotlin/JVM 编译的默认目标版本为 `1.8`。`1.6` 目标已被移除。

请迁移到 JVM 目标版本 1.8 或更高版本。了解如何为以下工具更新 JVM 目标版本：

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [命令行编译器](compiler-reference.md#jvm-target-version)

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.7.0 包含了对 Objective-C 和 Swift 互操作性的变更，并稳定了之前版本中引入的功能。它还为新内存管理器带来了性能提升以及其他更新：

* [新内存管理器的性能提升](#performance-improvements-for-the-new-memory-manager)
* [与 JVM 和 JS IR 后端统一的编译器插件 ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [支持独立的 Android 可执行文件](#support-for-standalone-android-executables)
* [与 Swift async/await 互操作：返回 `Void` 代替 `KotlinUnit`](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [禁止未声明的异常穿透 Objective-C 桥接](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [改进的 CocoaPods 集成](#improved-cocoapods-integration)
* [覆盖 Kotlin/Native 编译器下载 URL](#overriding-the-kotlin-native-compiler-download-url)

### 新内存管理器的性能提升 {id="performance-improvements-for-the-new-memory-manager"}

> 全新的 Kotlin/Native 内存管理器处于 [Alpha](components-stability.md) 阶段。
> 未来它可能会发生不兼容的变更，并需要手动迁移。
> 我们非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中提供反馈。
>
{style="note"}

新内存管理器仍处于 Alpha 阶段，但它正朝着[稳定 (Stable)](components-stability.md) 迈进。此版本为新内存管理器带来了显著的性能提升，尤其是在垃圾回收（GC）方面。特别是，在 [1.6.20 中引入](whatsnew1620.md)的清理（sweep）阶段并发实现现在已默认启用。这有助于减少应用程序因 GC 而暂停的时间。新的 GC 调度程序能够更好地选择 GC 频率，特别是在较大的堆中。

此外，我们专门优化了调试二进制文件，确保在内存管理器的实现代码中使用了恰当的优化级别和链接时优化。这帮助我们在基准测试中将调试二进制文件的执行时间缩短了约 30%。

尝试在你的项目中使用新的内存管理器以查看其工作效果，并在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中与我们分享你的反馈。

### 与 JVM 和 JS IR 后端统一的编译器插件 ABI {id="unified-compiler-plugin-abi-with-jvm-and-js-ir-backends"}

从 Kotlin 1.7.0 开始，Kotlin Multiplatform Gradle 插件默认对 Kotlin/Native 使用可嵌入的编译器 jar。此[功能在 1.6.0 中宣布](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)为实验性功能，现在已稳定并可供使用。

此项改进对于库作者非常方便，因为它改善了编译器插件的开发体验。在此版本之前，你必须为 Kotlin/Native 提供单独的工件，但现在你可以为 Native 和其他受支持的平台使用相同的编译器插件工件。

> 此功能可能需要插件开发者对其现有插件执行迁移步骤。
>
> 了解如何在[此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-48595)中为更新做好插件准备。
>
{style="warning"}

### 支持独立的 Android 可执行文件 {id="support-for-standalone-android-executables"}

Kotlin 1.7.0 提供了针对 Android Native 目标生成标准可执行文件的完整支持。该功能在 [1.6.20 中引入](whatsnew1620.md#support-for-standalone-android-executables)，现在已默认启用。

如果你希望回滚到 Kotlin/Native 生成共享库的先前行为，请使用以下设置：

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### 与 Swift async/await 互操作：返回 Void 代替 KotlinUnit {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

Kotlin `suspend` 函数在 Swift 中现在返回 `Void` 类型，而不是 `KotlinUnit`。这是改进与 Swift 的 `async`/`await` 互操作性的结果。该功能在 [1.6.20 中引入](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)，此版本默认启用了该行为。

你不再需要使用 `kotlin.native.binary.unitSuspendFunctionObjCExport=proper` 属性来为这类函数返回正确的类型。

### 禁止未声明的异常穿透 Objective-C 桥接 {id="prohibited-undeclared-exceptions-through-objective-c-bridges"}

当你从 Swift/Objective-C 代码调用 Kotlin 代码（或反之）且该代码抛出异常时，该异常应当由发生异常的代码进行处理，除非你通过适当的转换明确允许在语言之间转发异常（例如使用 `@Throws` 注解）。

此前，Kotlin 存在另一种非预期的行为：在某些情况下，未声明的异常可能会从一种语言“泄露”到另一种语言。Kotlin 1.7.0 修复了该问题，现在此类情况将导致程序终止。

因此，例如，如果你在 Kotlin 中有一个 `{ throw Exception() }` lambda 表达式并从 Swift 调用它，在 Kotlin 1.7.0 中，该异常一旦到达 Swift 代码就会立即终止程序。在之前的 Kotlin 版本中，此类异常可能会泄露到 Swift 代码中。

`@Throws` 注解将继续照常工作。

### 改进的 CocoaPods 集成 {id="improved-cocoapods-integration"}

从 Kotlin 1.7.0 开始，如果你想在项目中集成 CocoaPods，不再需要安装 `cocoapods-generate` 插件。

在此之前，你需要同时安装 CocoaPods 依赖管理器和 `cocoapods-generate` 插件才能使用 CocoaPods，例如在 Kotlin Multiplatform Mobile 项目中处理 [iOS 依赖项](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)。

现在配置 CocoaPods 集成变得更加简单，并且我们解决了在 Ruby 3 及更高版本上无法安装 `cocoapods-generate` 的问题。现在也支持在 Apple M1 上表现更佳的最新 Ruby 版本。

了解如何配置[初始 CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)。

### 覆盖 Kotlin/Native 编译器下载 URL {id="overriding-the-kotlin-native-compiler-download-url"}

从 Kotlin 1.7.0 开始，你可以自定义 Kotlin/Native 编译器的下载 URL。当持续集成 (CI) 环境中禁止外部链接时，这非常有用。

要覆盖默认的基础 URL `https://download.jetbrains.com/kotlin/native/builds`，请使用以下 Gradle 属性：

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> 下载程序会将 Native 版本和目标操作系统附加到此基础 URL 之后，以确保下载实际的编译器分发包。
>
{style="note"}

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS 对 [JS IR 编译器后端](js-ir-compiler.md) 进行了进一步改进，并带来了其他可以改善开发体验的更新：

* [新 IR 后端的性能提升](#performance-improvements-for-the-new-ir-backend)
* [使用 IR 时成员名称的代码精简](#minification-for-member-names-when-using-ir)
* [通过 IR 后端中的 Polyfill 支持旧版浏览器](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [从 js 表达式动态加载 JavaScript 模块](#dynamically-load-javascript-modules-from-js-expressions)
* [为 JavaScript 测试运行程序指定环境变量](#specify-environment-variables-for-javascript-test-runners)

### 新 IR 后端的性能提升 {id="performance-improvements-for-the-new-ir-backend"}

此版本带来了一些重大更新，旨在改善你的开发体验：

* Kotlin/JS 的增量编译性能得到了显著提升。构建 JS 项目所需的时间更短。现在，在许多情况下，增量重新构建的速度已基本与旧版后端持平。
* Kotlin/JS 最终打包产物占用的空间更少，因为我们大幅减小了最终工件的体积。对于某些大型项目，我们测得生产包体积相比旧版后端减少了多达 20%。
* 接口的类型检查性能有了数量级的提升。
* Kotlin 生成更高质量的 JS 代码。

### 使用 IR 时成员名称的代码精简 {id="minification-for-member-names-when-using-ir"}

Kotlin/JS IR 编译器现在利用其关于 Kotlin 类和函数关系的内部信息来应用更高效的代码精简 (Minification)，缩短函数、属性和类的名称。这减小了最终打包应用程序的体积。

当你在生产模式下构建 Kotlin/JS 应用程序时，这种代码精简会自动应用，并且默认处于启用状态。要禁用成员名称精简，请使用 `-Xir-minimized-member-names` 编译器标志：

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### 通过 IR 后端中的 Polyfill 支持旧版浏览器 {id="support-for-older-browsers-via-polyfills-in-the-ir-backend"}

Kotlin/JS 的 IR 编译器后端现在包含了与旧版后端相同的 Polyfill。这允许使用新编译器编译的代码在不支持 Kotlin 标准库所使用的全部 ES2015 方法的旧版浏览器中运行。只有项目中实际使用到的 Polyfill 才会包含在最终的包中，从而将其对包体积的潜在影响降至最低。

使用 IR 编译器时，此功能默认启用，无需额外配置。

### 从 js 表达式动态加载 JavaScript 模块 {id="dynamically-load-javascript-modules-from-js-expressions"}

在处理 JavaScript 模块时，大多数应用程序使用静态导入，其用法已在 [JavaScript 模块集成](js-modules.md) 中涵盖。然而，Kotlin/JS 此前缺少一种在应用程序运行时动态加载 JavaScript 模块的机制。

从 Kotlin 1.7.0 开始，`js` 块中支持 JavaScript 的 `import` 语句，允许你在运行时动态将软件包引入应用程序：

```kotlin
val myPackage = js("import('my-package')")
```

### 为 JavaScript 测试运行程序指定环境变量 {id="specify-environment-variables-for-javascript-test-runners"}

为了微调 Node.js 软件包解析或将外部信息传递给 Node.js 测试，你现在可以指定 JavaScript 测试运行程序所使用的环境变量。要定义环境变量，请在构建脚本中的 `testTask` 块内使用带有键值对的 `environment()` 函数：

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

## 标准库 {id="standard-library"}

在 Kotlin 1.7.0 中，标准库迎来了一系列变更和改进。它们引入了新功能，稳定了实验性功能，并统一了 Native、JS 和 JVM 对命名捕获组的支持：

* [min() 和 max() 集合函数返回不可空结果](#min-and-max-collection-functions-return-as-non-nullable)
* [在特定索引处进行正则表达式匹配](#regular-expression-matching-at-specific-indices)
* [扩展对先前语言和 API 版本的支持](#extended-support-for-previous-language-and-api-versions)
* [通过反射访问注解](#access-to-annotations-via-reflection)
* [稳定的深递归函数](#stable-deep-recursive-functions)
* [默认时间源基于内联类的时间标记](#time-marks-based-on-inline-classes-for-default-time-source)
* [针对 Java Optional 的新实验性扩展函数](#new-experimental-extension-functions-for-java-optionals)
* [在 JS 和 Native 中支持命名捕获组](#support-for-named-capturing-groups-in-js-and-native)

### min() 和 max() 集合函数返回不可空结果 {id="min-and-max-collection-functions-return-as-non-nullable"}

在 [Kotlin 1.4.0](whatsnew14.md) 中，我们将 `min()` 和 `max()` 集合函数重命名为 `minOrNull()` 和 `maxOrNull()`。这些新名称更好地反映了它们的行为——如果接收者集合为空，则返回 null。这也有助于使函数的行为与整个 Kotlin 集合 API 中使用的命名约定保持一致。

`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 也是如此，它们都在 Kotlin 1.4.0 中获得了各自的 *OrNull() 同义函数。受此变更影响的旧函数被逐步弃用。

Kotlin 1.7.0 重新引入了原始函数名称，但返回类型为不可空。新的 `min()`、`max()`、`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 函数现在严格返回集合元素，或者抛出异常。

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 在特定索引处进行正则表达式匹配 {id="regular-expression-matching-at-specific-indices"}

在 [1.5.30 中引入](whatsnew1530.md#matching-with-regex-at-a-particular-position)的 `Regex.matchAt()` 和 `Regex.matchesAt()` 函数现已达到稳定状态。它们提供了一种检查正则表达式在 `String` 或 `CharSequence` 中的特定位置是否完全匹配的方法。

`matchesAt()` 检查是否存在匹配项并返回布尔值结果：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 正则表达式：一个数字、点、一个数字、点、一个或多个数字
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()` 如果找到匹配项则返回该匹配项，如果未找到则返回 `null`：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

我们非常感谢你在[此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-34021)中提供反馈。

### 扩展对先前语言和 API 版本的支持 {id="extended-support-for-previous-language-and-api-versions"}

为了支持库作者开发可在广泛的先前 Kotlin 版本中使用的库，并应对 Kotlin 主要版本发布频率增加的情况，我们扩展了对先前语言和 API 版本的支持。

在 Kotlin 1.7.0 中，我们支持之前的三个语言和 API 版本，而不是两个。这意味着 Kotlin 1.7.0 支持开发低至目标版本 1.4.0 的库。有关向后兼容性的更多信息，请参阅[兼容性选项](kotlin-evolution-principles.md#compatibility-options)。

### 通过反射访问注解 {id="access-to-annotations-via-reflection"}

最初在 [1.6.0 中引入](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target)的 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 扩展函数现已达到[稳定 (Stable)](components-stability.md) 状态。该[反射](reflection.md)函数返回元素上指定类型的所有注解，包括单独应用的注解和重复注解。

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

### 稳定的深递归函数 {id="stable-deep-recursive-functions"}

自 [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines) 起，深递归函数就已作为实验性功能提供，而在 Kotlin 1.7.0 中它们已达到[稳定 (Stable)](components-stability.md) 状态。使用 `DeepRecursiveFunction`，你可以定义一个将其调用堆栈保存在堆上而不是使用实际调用堆栈的函数。这允许你运行非常深层次的递归计算。要调用深递归函数，只需 `invoke` 它即可。

在此示例中，深递归函数用于递归计算二叉树的深度。即使此示例函数递归调用自身 100,000 次，也不会抛出 `StackOverflowError`：

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

当代码中的递归深度超过 1000 次调用时，请考虑使用深递归函数。

### 默认时间源基于内联类的时间标记 {id="time-marks-based-on-inline-classes-for-default-time-source"}

Kotlin 1.7.0 通过将 `TimeSource.Monotonic` 返回的时间标记更改为内联值类，提升了时间测量功能的性能。这意味着调用诸如 `markNow()`、`elapsedNow()`、`measureTime()` 和 `measureTimedValue()` 等函数时，不会为其 `TimeMark` 实例分配包装类。尤其是在测量属于热点路径的代码段时，这有助于最大程度地减少测量对性能的影响：

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 返回的 `TimeMark` 是内联类
    val elapsedDuration = mark.elapsedNow()
}
```

> 只有在静态已知获取 `TimeMark` 的时间源为 `TimeSource.Monotonic` 时，此优化才可用。
>
{style="note"}

### 针对 Java Optional 的新实验性扩展函数 {id="new-experimental-extension-functions-for-java-optionals"}

Kotlin 1.7.0 配备了新的便捷函数，简化了在 Java 中使用 `Optional` 类的工作。这些新函数可用于在 JVM 上拆包和转换 Optional 对象，有助于使 Java API 的使用更加简洁。

`getOrNull()`、`getOrDefault()` 和 `getOrElse()` 扩展函数允许你在值存在时获取 `Optional` 的值。否则，你将分别获得 `null`、默认值或函数返回的值：

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

`toList()`、`toSet()` 和 `asSequence()` 扩展函数将存在的 `Optional` 的值转换为列表、集合或序列，否则返回空集合。`toCollection()` 扩展函数将 `Optional` 的值追加到现有的目标集合中：

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

这些扩展函数在 Kotlin 1.7.0 中作为实验性功能引入。你可以在[此 KEEP](https://github.com/Kotlin/KEEP/pull/291) 中了解有关 `Optional` 扩展的更多信息。一如既往，我们欢迎你在 [Kotlin 问题跟踪器](https://kotl.in/issue)中提供反馈。

### 在 JS 和 Native 中支持命名捕获组 {id="support-for-named-capturing-groups-in-js-and-native"}

从 Kotlin 1.7.0 开始，不仅在 JVM 上，在 JS 和 Native 平台上也支持命名捕获组。

要为捕获组命名，请在正则表达式中使用 (`?<name>group`) 语法。要获取捕获组匹配的文本，请调用新引入的 [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 函数并传入组名。

#### 按名称检索匹配的捕获组值 {id="retrieve-matched-group-value-by-name"}

考虑这个匹配城市坐标的示例。要获取正则表达式匹配的捕获组集合，请使用 [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html)。对比使用 `value` 按编号（索引）和按名称检索捕获组内容的方式：

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 按名称
    println(match.groups[2]?.value) // "TX" — 按编号
}
```

#### 命名后向引用 {id="named-backreferencing"}

你现在还可以在后向引用捕获组时使用组名。后向引用会匹配捕获组先前匹配过的相同文本。为此，请在正则表达式中使用 `\k<name>` 语法：

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 替换表达式中的命名捕获组 {id="named-groups-in-replacement-expressions"}

命名捕获组引用可用于替换表达式。考虑将输入中所有与指定正则表达式匹配的项替换为替换表达式的 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 函数，以及仅替换第一个匹配项的 [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 函数。

替换字符串中出现的 `${name}` 将被替换为具有指定名称的捕获组所对应的子序列。你可以对比捕获组引用中按名称和按索引的替换：

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 按名称
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 按编号
}
```

## Gradle {id="gradle"}

此版本引入了新的构建报告、对 Gradle 插件变体的支持、kapt 中的新统计信息等等：

* [增量编译的新方法](#a-new-approach-to-incremental-compilation)
* [用于跟踪编译器性能的新构建报告](#build-reports-for-kotlin-compiler-tasks)
* [调整最低支持的 Gradle 和 Android Gradle 插件版本](#bumping-minimum-supported-versions)
* [支持 Gradle 插件变体](#support-for-gradle-plugin-variants)
* [Kotlin Gradle 插件 API 的更新](#updates-in-the-kotlin-gradle-plugin-api)
* [通过 plugins API 提供 sam-with-receiver 插件](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [编译任务的变更](#changes-in-compile-tasks)
* [kapt 中每个注解处理器生成文件的新统计信息](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [弃用 kotlin.compiler.execution.strategy 系统属性](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [移除已弃用的选项、方法和插件](#removal-of-deprecated-options-methods-and-plugins)

### 增量编译的新方法 {id="a-new-approach-to-incremental-compilation"}

> 增量编译的新方法目前处于[实验性 (Experimental)](components-stability.md) 阶段。它可能会在任何时候被移除或更改。
> 需要显式选择加入（详见下文）。我们建议你仅出于评估目的使用它，非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供反馈。
>
{style="warning"}

在 Kotlin 1.7.0 中，我们重构了跨模块更改的增量编译。现在增量编译也支持在依赖的非 Kotlin 模块内所做的更改，并与 [Gradle 构建缓存](https://docs.gradle.org/current/userguide/build_cache.html)兼容。对避免重复编译 (compilation avoidance) 的支持也得到了改进。

如果你使用构建缓存或频繁在非 Kotlin Gradle 模块中进行更改，我们预计你将从新方法中获益最多。我们在 Kotlin 项目的 `kotlin-gradle-plugin` 模块上进行的测试表明，对于命中缓存后的更改，性能提升超过 80%。

要试用这种新方法，请在 `gradle.properties` 中设置以下选项：

```none
kotlin.incremental.useClasspathSnapshot=true
```

> 增量编译的新方法目前仅适用于 Gradle 构建系统中的 JVM 后端。
>
{style="note"}

在[这篇博客文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)中了解增量编译新方法在底层的实现原理。

我们的计划是稳定这项技术，并增加对其他后端（例如 JS）和构建系统的支持。如果你在此编译方案中遇到任何问题或异常行为，非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提交报告。谢谢！

Kotlin 团队非常感谢 [Ivan Gavrilovic](https://github.com/gavra0)、[Hung Nguyen](https://github.com/hungvietnguyen)、[Cédric Champeau](https://github.com/melix) 以及其他外部贡献者的帮助。

### Kotlin 编译器任务的构建报告 {id="build-reports-for-kotlin-compiler-tasks"}

> Kotlin 构建报告处于[实验性 (Experimental)](components-stability.md) 阶段。它们可能会在任何时候被移除或更改。
> 需要显式选择加入（详见下文）。请仅出于评估目的使用它们。非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中对它们提供反馈。
>
{style="warning"}

Kotlin 1.7.0 引入了有助于跟踪编译器性能的构建报告。报告包含不同编译阶段的持续时间以及编译无法进行增量编译的原因。

当你想要调查编译器任务的问题时，构建报告会非常有用，例如：

* 当 Gradle 构建耗时过长，而你想了解性能不佳的根本原因时。
* 当同一个项目的编译时间出现差异，有时需要几秒钟，有时需要几分钟时。

要启用构建报告，请在 `gradle.properties` 中声明保存构建报告输出的位置：

```none
kotlin.build.report.output=file
```

提供以下值（及其组合）：

* `file` 将构建报告保存在本地文件中。
* `build_scan` 将构建报告保存在[构建扫描 (build scan)](https://scans.gradle.com/) 的 `custom values` 部分中。

  > Gradle Enterprise 插件限制了自定义值的数量及其长度。在大型项目中，某些值可能会丢失。
  >
  {style="note"}

* `http` 使用 HTTP(S) 发送构建报告。POST 方法以 JSON 格式发送指标。数据可能会因版本而异。你可以在 [Kotlin 仓库](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)中查看所发送数据的当前版本。

分析长时间运行编译的构建报告可以帮助你解决两种常见情况：

* 构建不是增量构建。分析原因并修复根本问题。
* 构建是增量构建，但耗时过长。尝试重组源文件——拆分大文件、将独立的类保存在不同文件中、重构庞大的类、在不同文件中声明顶层函数等等。

在[这篇博客文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/)中了解有关新构建报告的更多信息。

欢迎你在自己的基础设施中试用构建报告。如果你有任何反馈、遇到任何问题或希望提出改进建议，请随时在我们的[问题跟踪器](https://youtrack.jetbrains.com/newIssue)中报告。谢谢！

### 调整最低支持的版本 {id="bumping-minimum-supported-versions"}

从 Kotlin 1.7.0 开始，支持的最低 Gradle 版本为 6.7.1。为了支持 [Gradle 插件变体](#support-for-gradle-plugin-variants)和新的 Gradle API，我们不得不[提高支持的版本](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1)。未来，得益于 Gradle 插件变体功能，我们应该不需要频繁提高最低支持版本。

此外，支持的最低 Android Gradle 插件版本现在为 3.6.4。

### 支持 Gradle 插件变体 {id="support-for-gradle-plugin-variants"}

Gradle 7.0 为 Gradle 插件作者引入了一项新功能——[带变体的插件 (plugins with variants)](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)。此功能使得在保持对 7.1 以下 Gradle 版本的兼容性的同时，更容易添加对新 Gradle 功能的支持。详细了解 [Gradle 中的变体选择](https://docs.gradle.org/current/userguide/variant_model.html)。

借助 Gradle 插件变体，我们可以为不同的 Gradle 版本发布不同的 Kotlin Gradle 插件变体。其目标是在对应于受支持的最早 Gradle 版本的 `main` 变体中支持基础的 Kotlin 编译。每个变体都将包含来自对应版本的 Gradle 功能实现。最新的变体将支持最广泛的 Gradle 功能集。通过这种方式，我们可以在功能受限的情况下扩展对旧版 Gradle 的支持。

目前，Kotlin Gradle 插件仅有两个变体：

* 适用于 Gradle 6.7.1–6.9.3 版本的 `main`
* 适用于 Gradle 7.0 及更高版本的 `gradle70`

在未来的 Kotlin 版本中，我们可能会添加更多变体。

要检查你的构建使用的是哪个变体，请启用 [`--info` 日志级别](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)，并在输出中查找以 `Using Kotlin Gradle plugin` 开头的字符串，例如 `Using Kotlin Gradle plugin main variant`。

> 以下是针对 Gradle 中变体选择的一些已知问题的变通方案：
> * [pluginManagement 中的 ResolutionStrategy 对具有多变体的插件不起作用](https://github.com/gradle/gradle/issues/20545)
> * [当插件作为 `buildSrc` 常用依赖项添加时，插件变体会被忽略](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

请在[此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants)中留下你的反馈。

### Kotlin Gradle 插件 API 的更新 {id="updates-in-the-kotlin-gradle-plugin-api"}

Kotlin Gradle 插件 API 工件迎来了几项改进：

* 为具有用户可配置输入的 Kotlin/JVM 和 Kotlin/kapt 任务提供了新的接口。
* 提供了一个新的 `KotlinBasePlugin` 接口，所有 Kotlin 插件都继承自该接口。当你希望在应用任何 Kotlin Gradle 插件（JVM、JS、Multiplatform、Native 和其他平台）时触发某些配置操作，请使用此接口：

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // 在此处配置你的操作
  }
  ```
  你可以在[此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin)中留下关于 `KotlinBasePlugin` 的反馈。

* 我们为 Android Gradle 插件在其内部自行配置 Kotlin 编译奠定了基础，这意味着你无需在构建中添加 Kotlin Android Gradle 插件。关注 [Android Gradle 插件发布公告](https://developer.android.com/studio/releases/gradle-plugin)以了解添加的支持并进行体验！

### 通过 plugins API 提供 sam-with-receiver 插件 {id="the-sam-with-receiver-plugin-is-available-via-the-plugins-api"}

[sam-with-receiver 编译器插件](sam-with-receiver-plugin.md)现已可通过 [Gradle plugins DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) 使用：

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### 编译任务的变更 {id="changes-in-compile-tasks"}

在此版本中，编译任务迎来了许多更改：

* Kotlin 编译任务不再继承 Gradle 的 `AbstractCompile` 任务。它们仅继承 `DefaultTask`。
* `AbstractCompile` 任务具有 `sourceCompatibility` 和 `targetCompatibility` 输入。由于不再继承 `AbstractCompile` 任务，这些输入在 Kotlin 用户脚本中将不再可用。
* `SourceTask.stableSources` 输入不再可用，你应该使用 `sources` 输入。`setSource(...)` 方法仍然可用。
* 所有编译任务现在都使用 `libraries` 输入来指定编译所需的库列表。`KotlinCompile` 任务仍保留已弃用的 Kotlin 属性 `classpath`，该属性将在未来版本中被移除。
* 编译任务仍然实现 `PatternFilterable` 接口，该接口允许对 Kotlin 源代码进行筛选。`sourceFilesExtensions` 输入已被移除，推荐使用 `PatternFilterable` 方法。
* 已弃用的 `Gradle destinationDir: File` 输出已被替换为 `destinationDirectory: DirectoryProperty` 输出。
* Kotlin/Native 的 `AbstractNativeCompile` 任务现在继承 `AbstractKotlinCompileTool` 基类。这是将 Kotlin/Native 构建工具整合到所有其他工具中的第一步。

请在[此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-32805)中留下你的反馈。

### kapt 中每个注解处理器生成文件的新统计信息 {id="statistics-of-generated-files-by-each-annotation-processor-in-kapt"}

`kotlin-kapt` Gradle 插件已经支持[报告每个处理器的性能统计信息](https://github.com/JetBrains/kotlin/pull/4280)。从 Kotlin 1.7.0 开始，它还可以报告每个注解处理器生成的文件数量统计信息。

这对于跟踪构建过程中是否存在未使用的注解处理器非常有用。你可以使用生成的报告找出触发不必要注解处理器的模块，并更新这些模块以防止该情况发生。

分两步启用统计信息：

* 在你的 `build.gradle.kts` 中将 `showProcessorStats` 标志设置为 `true`：

  ```kotlin
  kapt {
      showProcessorStats = true
  }
  ```

* 在你的 `gradle.properties` 中将 `kapt.verbose` Gradle 属性设置为 `true`：
  
  ```none
  kapt.verbose=true
  ```

> 你还可以通过[命令行选项 `verbose`](kapt.md#cli) 启用详细输出。
>
{style="note"}

统计信息将以 `info` 级别显示在日志中。你将看到 `Annotation processor stats:` 行，其后是每个注解处理器执行时间的统计信息。在这些行之后，将显示 `Generated files report:` 行，其后是每个注解处理器生成文件数量的统计信息。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

请在[此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann)中留下你的反馈。

### 弃用 kotlin.compiler.execution.strategy 系统属性 {id="deprecation-of-the-kotlin-compiler-execution-strategy-system-property"}

Kotlin 1.6.20 引入了[用于定义 Kotlin 编译器执行策略的新属性](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)。在 Kotlin 1.7.0 中，旧的系统属性 `kotlin.compiler.execution.strategy` 已进入弃用周期，推荐使用新属性。

当使用 `kotlin.compiler.execution.strategy` 系统属性时，你将收到一条警告。该属性将在未来版本中删除。要保留旧的行为，请将该系统属性替换为同名的 Gradle 属性。例如，你可以在 `gradle.properties` 中这样做：

```none
kotlin.compiler.execution.strategy=out-of-process
```

你还可以使用编译任务属性 `compilerExecutionStrategy`。在[编译器执行策略页面](compiler-execution-strategy.md)上了解有关此内容的更多信息。

### 移除已弃用的选项、方法和插件 {id="removal-of-deprecated-options-methods-and-plugins"}

#### 移除 useExperimentalAnnotation 方法 {id="removal-of-the-useexperimentalannotation-method"}

在 Kotlin 1.7.0 中，我们完成了对 `useExperimentalAnnotation` Gradle 方法的弃用周期。请改用 `optIn()` 在模块中选择加入使用 API。

例如，如果你的 Gradle 模块是多平台模块：

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

详细了解 Kotlin 中的[选择加入要求](opt-in-requirements.md)。

#### 移除已弃用的编译器选项 {id="removal-of-deprecated-compiler-options"}

我们已经完成了对几个编译器选项的弃用周期：

* `kotlinOptions.jdkHome` 编译器选项在 1.5.30 中被弃用，并在当前版本中已被移除。如果 Gradle 构建包含此选项，现在将会失败。我们建议你使用自 Kotlin 1.5.30 以来一直支持的 [Java 工具链](whatsnew1530.md#support-for-java-toolchains)。
* 已弃用的 `noStdlib` 编译器选项也已被移除。Gradle 插件使用 `kotlin.stdlib.default.dependency=true` 属性来控制是否存在 Kotlin 标准库。

> 编译器实参 `-jdkHome` 和 `-no-stdlib` 仍然可用。
>
{style="note"}

#### 移除已弃用的插件 {id="removal-of-deprecated-plugins"}

在 Kotlin 1.4.0 中，`kotlin2js` 和 `kotlin-dce-plugin` 插件已被弃用，并且在此版本中已被移除。请使用新的 `org.jetbrains.kotlin.js` 插件代替 `kotlin2js`。当正确配置 Kotlin/JS Gradle 插件时，无效代码消除 (DCE) 便可正常工作。

在 Kotlin 1.6.0 中，我们将 `KotlinGradleSubplugin` 类的弃用级别更改为 `ERROR`。开发者曾使用此类编写编译器插件。在此版本中，[该类已被移除](https://youtrack.jetbrains.com/issue/KT-48831/)。请改用 `KotlinCompilerPluginSupportPlugin` 类。

> 最佳做法是在整个项目中使用 1.7.0 及更高版本的 Kotlin 插件。
>
{style="tip"}

#### 移除已弃用的协程 DSL 选项和属性 {id="removal-of-the-deprecated-coroutines-dsl-option-and-property"}

我们移除了已弃用的 `kotlin.experimental.coroutines` Gradle DSL 选项以及在 `gradle.properties` 中使用的 `kotlin.coroutines` 属性。现在你只需使用_[挂起函数](coroutines-basics.md)_或在构建脚本中[添加 `kotlinx.coroutines` 依赖项](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)。

在[协程指南](coroutines-guide.md)中详细了解协程。

#### 移除工具链扩展方法中的类型转换 {id="removal-of-the-type-cast-in-the-toolchain-extension-method"}

在 Kotlin 1.7.0 之前，使用 Kotlin DSL 配置 Gradle 工具链时，必须强制转换为 `JavaToolchainSpec` 类：

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

现在，你可以省略 `(this as JavaToolchainSpec)` 部分：

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## 迁移到 Kotlin 1.7.0 {id="migrating-to-kotlin-1-7-0"}

### 安装 Kotlin 1.7.0 {id="install-kotlin-1-7-0"}

IntelliJ IDEA 2022.1 和 Android Studio Chipmunk (212) 会自动建议将 Kotlin 插件更新到 1.7.0。

> 对于 IntelliJ IDEA 2022.2、Android Studio Dolphin (213) 或 Android Studio Electric Eel (221)，Kotlin 插件 1.7.0 将随即将推出的 IntelliJ IDEA 和 Android Studio 更新一起提供。
> 
{style="note"}

新的命令行编译器可在 [GitHub 发布页面](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0)下载。

### 迁移现有项目或使用 Kotlin 1.7.0 启动新项目 {id="migrate-existing-or-start-a-new-project-with-kotlin-1-7-0"}

* 要将现有项目迁移到 Kotlin 1.7.0，请将 Kotlin 版本更改为 `1.7.0` 并重新导入 Gradle 或 Maven 项目。[了解如何更新到 Kotlin 1.7.0](releases.md#update-to-a-new-kotlin-version)。

* 要使用 Kotlin 1.7.0 启动新项目，请更新 Kotlin 插件并从 **File** | **New** | **Project** 运行项目向导。

### Kotlin 1.7.0 兼容性指南 {id="compatibility-guide-for-kotlin-1-7-0"}

Kotlin 1.7.0 是一个功能版本，因此可能会带来与你为该语言早期版本编写的代码不兼容的更改。
在 [Kotlin 1.7.0 兼容性指南](compatibility-guide-17.md)中查找此类更改的详细列表。