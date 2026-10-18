[//]: # (title: Kotlin 1.6.20 最新变化)

<web-summary>阅读 Kotlin 1.6.20 发行说明，涵盖新语言功能、Kotlin Multiplatform、JVM、Native、JS 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2022 年 4 月 4 日](releases.md#release-history)_

Kotlin 1.6.20 带来了未来语言功能的预览，将分层结构设为多平台项目的默认结构，并为其他组件带来了渐进式改进。

你也可以在此视频中查看这些变更的简短概览：

<video src="https://www.youtube.com/v/8F19ds109-o" title="Kotlin 1.6.20 最新变化"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 语言 {id="language"}

在 Kotlin 1.6.20 中，你可以试用两项新语言功能：

* [Kotlin/JVM 上下文接收器原型](#prototype-of-context-receivers-for-kotlin-jvm)
* [明确非空类型](#definitely-non-nullable-types)

### Kotlin/JVM 上下文接收器原型 {id="prototype-of-context-receivers-for-kotlin-jvm"}

> 该功能目前仅作为 Kotlin/JVM 的原型提供。启用 `-Xcontext-receivers` 时，
> 编译器将生成无法用于生产代码的预发布二进制文件。
> 请仅在你的实验性项目中使用上下文接收器。
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中向我们提供反馈。
>
{style="warning"}

在 Kotlin 1.6.20 中，你不再受限于只能拥有一个接收器。如果需要更多接收器，可以通过向函数、属性和类的声明中添加上下文接收器，使其变得依赖于上下文（或称为_上下文相关的_）。上下文声明具有以下行为：

* 它要求所有已声明的上下文接收器作为隐式接收器存在于调用者的作用域内。
* 它将已声明的上下文接收器作为隐式接收器引入其自身的主体作用域中。

```kotlin
interface LoggingContext {
    val log: Logger // 此上下文提供对 logger 的引用
}

context(LoggingContext)
fun startBusinessOperation() {
    // 你可以访问 log 属性，因为 LoggingContext 是一个隐式接收器
    log.info("Operation has started")
}

fun test(loggingContext: LoggingContext) {
    with(loggingContext) {
        // 你需要将 LoggingContext 作为隐式接收器放在作用域内，
        // 才能调用 startBusinessOperation()
        startBusinessOperation()
    }
}
```

要在项目中启用上下文接收器，请使用 `-Xcontext-receivers` 编译器选项。
你可以在 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/context-receivers.md#detailed-design) 中找到该功能及其语法的详细说明。

请注意，该实现目前为原型：

* 启用 `-Xcontext-receivers` 后，编译器将生成无法在生产代码中使用的预发布二进制文件
* 目前 IDE 对上下文接收器的支持极少

欢迎在你的练手项目中尝试该功能，并在[此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-42435)中与我们分享你的想法和体验。
如果遇到任何问题，请[提交新问题](https://kotl.in/issue)。

### 明确非空类型 {id="definitely-non-nullable-types"}

> 明确非空类型目前处于 [Beta](components-stability.md) 阶段。它们已经基本稳定，
> 但将来可能需要执行迁移步骤。
> 我们将尽最大努力减少你必须进行的更改。
>
{style="warning"}

为了在扩展泛型 Java 类和接口时提供更好的互操作性，Kotlin 1.6.20 允许你在使用处使用新语法 `T & Any` 将泛型类型形参标记为明确非空。
该语法形式源自[交集类型 (intersection types)](https://en.wikipedia.org/wiki/Intersection_type) 的表示法，目前限制为在 `&` 左侧使用带有可空上界的类型形参，右侧使用非空 `Any`：

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // OK
    elvisLike<String>("", "").length
    // 错误：'null' 不能作为非空类型的值
    elvisLike<String>("", null).length

    // OK
    elvisLike<String?>(null, "").length
    // 错误：'null' 不能作为非空类型的值
    elvisLike<String?>(null, null).length
}
```
{validate="false"}

将语言版本设置为 `1.7` 即可启用该功能：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "1.7"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '1.7'
        }
    }
}
```

</tab>
</tabs>

在 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) 中详细了解明确非空类型。

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 1.6.20 引入了：

* JVM 接口中默认方法的兼容性改进：[面向接口的新 `@JvmDefaultWithCompatibility` 注解](#new-jvmdefaultwithcompatibility-annotation-for-interfaces)以及 [`-Xjvm-default` 模式下的兼容性变更](#compatibility-changes-in-the-xjvm-default-modes)
* [支持在 JVM 后端中对单个模块进行并行编译](#support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend)
* [支持对函数式接口构造函数的可调用引用](#support-for-callable-references-to-functional-interface-constructors)

### 面向接口的新 @JvmDefaultWithCompatibility 注解 {id="new-jvmdefaultwithcompatibility-annotation-for-interfaces"}

Kotlin 1.6.20 引入了新注解 [`@JvmDefaultWithCompatibility`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default-with-compatibility/)：将其与 `-Xjvm-default=all` 编译器选项一起使用，可为任何 Kotlin 接口中的任何非抽象成员[在 JVM 接口中生成默认方法](java-to-kotlin-interop.md#default-methods-in-interfaces)。

如果有客户端使用你在没有 `-Xjvm-default=all` 选项的情况下编译的 Kotlin 接口，它们可能会与使用此选项编译的代码产生二进制不兼容。
在 Kotlin 1.6.20 之前，为避免此类兼容性问题，[推荐的方法](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/#JvmDefaultWithoutCompatibility)是使用 `-Xjvm-default=all-compatibility` 模式，并对不需要此类兼容性的接口使用 `@JvmDefaultWithoutCompatibility` 注解。

这种方法有一些缺点：

* 在添加新接口时，很容易忘记添加该注解。
* 通常非公开部分中的接口比公开 API 中的更多，导致代码中很多地方都会带有该注解。

现在，你可以使用 `-Xjvm-default=all` 模式并使用 `@JvmDefaultWithCompatibility` 注解标记接口。
这样你只需为公开 API 中的所有接口添加一次该注解，而对于新的非公开代码，无需使用任何注解。

欢迎在[此 YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-48217)中留下你对该新注解的反馈。

### -Xjvm-default 模式下的兼容性变更 {id="compatibility-changes-in-the-xjvm-default-modes"}

Kotlin 1.6.20 增加了将默认模式（`-Xjvm-default=disable` 编译器选项）下的模块针对使用 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility` 模式编译的模块进行编译的选项。
与以前一样，如果所有模块都采用 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility` 模式，编译也将成功。
你可以在此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-47000)中留下你的反馈。

Kotlin 1.6.20 弃用了编译器选项 `-Xjvm-default` 的 `compatibility` 和 `enable` 模式。
其他模式的描述中关于兼容性部分有所变更，但总体逻辑保持不变。
你可以查看[更新后的描述](java-to-kotlin-interop.md#compatibility-modes-for-default-methods)。

有关 Java 互操作中默认方法的更多信息，请参阅[互操作性文档](java-to-kotlin-interop.md#default-methods-in-interfaces)以及[这篇博文](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。

### 支持在 JVM 后端中对单个模块进行并行编译 {id="support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend"}

> 支持在 JVM 后端中对单个模块进行并行编译目前处于[实验性 (Experimental)](components-stability.md)阶段。
> 它可能随时被废弃或更改。需要显式选择加入（详见下文），且仅供评估使用。
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-46085) 中向我们提供反馈。
>
{style="warning"}

我们正持续致力于[改善新的 JVM IR 后端编译时间](https://youtrack.jetbrains.com/issue/KT-46768)。
在 Kotlin 1.6.20 中，我们添加了实验性的 JVM IR 后端模式，以并行编译模块中的所有文件。
并行编译最多可将总编译时间减少 15%。

使用[编译器选项](compiler-reference.md#compiler-options) `-Xbackend-threads` 启用实验性并行后端模式。
该选项可使用以下实参：

* `N` 是你想要使用的工作线程数量。它不应大于你的 CPU 核心数；否则，由于线程之间的上下文切换，并行化将不再有效
* `0` 表示为每个 CPU 核心使用一个单独的工作线程

[Gradle](gradle.md) 可以并行运行任务，但从 Gradle 的角度来看，当一个项目（或项目的主要部分）只是一个大任务时，这种并行化帮助不大。
如果你有一个非常庞大的单体模块，请使用并行编译来加快编译速度。
如果你的项目由许多小模块组成，并且构建已经由 Gradle 进行了并行化，那么由于上下文切换，再添加一层并行化可能会损害性能。

> 并行编译存在一些限制：
> * 它不能与 [kapt](kapt.md) 一起使用，因为 kapt 会禁用 IR 后端
> * 其设计本身需要更多的 JVM 堆。堆用量与线程数量成正比
>
{style="note"}

### 支持对函数式接口构造函数的可调用引用 {id="support-for-callable-references-to-functional-interface-constructors"}

> 对函数式接口构造函数的可调用引用支持目前处于[实验性 (Experimental)](components-stability.md)阶段。
> 它可能随时被废弃或更改。需要显式选择加入（详见下文），且仅供评估使用。
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-47939) 中向我们提供反馈。
>
{style="warning"}

对函数式接口构造函数的[可调用引用](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)支持，提供了一种源码兼容的方式来从带有构造函数的接口迁移到[函数式接口](fun-interfaces.md)。

考虑以下代码：

```kotlin
interface Printer {
    fun print()
}

fun Printer(block: () -> Unit): Printer = object : Printer { override fun print() = block() }
```

启用对函数式接口构造函数的可调用引用后，可以将此代码替换为仅包含一个函数式接口声明：

```kotlin
fun interface Printer {
    fun print()
}
```

它的构造函数将隐式创建，任何使用 `::Printer` 函数引用的代码都可以正常编译。例如：

```kotlin
documentsStorage.addPrinter(::Printer)
```
{validate="false"}

通过使用带有 `DeprecationLevel.HIDDEN` 的 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 注解标记旧版 `Printer` 函数，来保持二进制兼容性：

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```
{validate="false"}

使用编译器选项 `-XXLanguage:+KotlinFunInterfaceConstructorReference` 启用此功能。

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native 1.6.20 标志着其新组件的持续开发。我们在与其他平台保持一致的 Kotlin 体验方面又迈出了一步：

* [新内存管理器更新](#an-update-on-the-new-memory-manager)
* [新内存管理器中清理阶段的并发实现](#concurrent-implementation-for-the-sweep-phase-in-new-memory-manager)
* [注解类实例化](#instantiation-of-annotation-classes)
* [与 Swift async/await 互操作：返回 Swift 的 Void 而非 KotlinUnit](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [借助 libbacktrace 获得更优质的堆栈跟踪](#better-stack-traces-with-libbacktrace)
* [支持独立 Android 可执行文件](#support-for-standalone-android-executables)
* [性能改进](#performance-improvements)
* [改进了 cinterop 模块导入期间的错误处理](#improved-error-handling-during-cinterop-modules-import)
* [支持 Xcode 13 库](#support-for-xcode-13-libraries)

### 新内存管理器更新 {id="an-update-on-the-new-memory-manager"}

> 新的 Kotlin/Native 内存管理器目前处于 [Alpha](components-stability.md) 阶段。
> 它可能会发生不兼容的变更，并要求在将来进行手动迁移。
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中向我们提供反馈。
>
{style="note"}

在 Kotlin 1.6.20 中，你可以试用新 Kotlin/Native 内存管理器的 Alpha 版本。
它消除了 JVM 与 Native 平台之间的差异，以便在多平台项目中提供一致的开发者体验。
例如，你可以更轻松地创建适用于 Android 和 iOS 的新跨平台移动应用程序。

新的 Kotlin/Native 内存管理器解除了跨线程共享对象的限制。
它还提供了无泄漏的安全并发编程原语，并且无需任何特殊管理或注解。

新的内存管理器将在未来版本中成为默认设置，因此我们建议你现在就尝试一下。
请查看我们的[博文](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/)以详细了解新的内存管理器并探索演示项目，或者直接转到[迁移说明](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md)自行尝试。

尝试在你的项目中使用新的内存管理器以查看其工作方式，并在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中分享反馈。

### 新内存管理器中清理阶段的并发实现 {id="concurrent-implementation-for-the-sweep-phase-in-new-memory-manager"}

如果你已经切换到在 [Kotlin 1.6 中宣布](whatsnew16.md#preview-of-the-new-memory-manager)的新内存管理器，你可能会注意到执行时间大幅缩短：我们的基准测试显示平均提升了 35%。
从 1.6.20 开始，新内存管理器还提供了清理 (sweep) 阶段的并发实现。
这还将改善性能并减少垃圾回收器暂停的时长。

要为新 Kotlin/Native 内存管理器启用该功能，请传递以下编译器选项：

```bash
-Xgc=cms 
```

欢迎在此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-48526)中分享你对新内存管理器性能的反馈。

### 注解类实例化 {id="instantiation-of-annotation-classes"}

在 Kotlin 1.6.0 中，注解类实例化在 Kotlin/JVM 和 Kotlin/JS 上已达到[稳定 (Stable)](components-stability.md)阶段。
1.6.20 版本则带来了对 Kotlin/Native 的支持。

详细了解[注解类实例化](annotations.md#instantiation)。

### 与 Swift async/await 互操作：返回 Void 而非 KotlinUnit {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

> 与 Swift async/await 的并发互操作性目前处于[实验性 (Experimental)](components-stability.md)阶段。它可能随时被废弃或更改。
> 仅供评估使用。欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-47610) 中向我们提供反馈。
>
{style="warning"}

我们继续推进[与 Swift async/await 的实验性互操作](whatsnew1530.md#experimental-interoperability-with-swift-5-5-async-await)（自 Swift 5.5 起可用）。
Kotlin 1.6.20 与先前版本的不同之处在于它处理带有 `Unit` 返回值类型的 `suspend` 函数的方式。

以前，此类函数在 Swift 中呈现为返回 `KotlinUnit` 的 `async` 函数。但是，与非挂起函数类似，它们正确的返回值类型应为 `Void`。

为了避免破坏现有代码，我们引入了一个 Gradle 属性，使编译器将返回 `Unit` 的挂起函数转换为返回类型为 `Void` 的 Swift `async` 函数：

```none
# gradle.properties
kotlin.native.binary.unitSuspendFunctionObjCExport=proper
```

我们计划在未来的 Kotlin 版本中将此行为设为默认行为。

### 借助 libbacktrace 获得更优质的堆栈跟踪 {id="better-stack-traces-with-libbacktrace"}

> 使用 libbacktrace 解析源码位置目前处于[实验性 (Experimental)](components-stability.md)阶段。它可能随时被废弃或更改。
> 仅供评估使用。欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48424) 中向我们提供反馈。
>
{style="warning"}

Kotlin/Native 现在能够生成包含文件位置和行号的详细堆栈跟踪，
以便更好地调试 `linux*`（`linuxMips32` 和 `linuxMipsel32` 除外）和 `androidNative*` 目标。

该功能底层使用了 [libbacktrace](https://github.com/ianlancetaylor/libbacktrace) 库。
查看以下代码以了解差异示例：

```kotlin
fun main() = bar()
fun bar() = baz()
inline fun baz() {
    error("")
}
```

* **1.6.20 之前：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x227190       kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96
   at 1   example.kexe        0x221e4c       kfun:kotlin.Exception#<init>(kotlin.String?){} + 92
   at 2   example.kexe        0x221f4c       kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92
   at 3   example.kexe        0x22234c       kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92
   at 4   example.kexe        0x25d708       kfun:#bar(){} + 104
   at 5   example.kexe        0x25d68c       kfun:#main(){} + 12
```
{initial-collapse-state="collapsed" collapsible="true"}

* **引入 libbacktrace 的 1.6.20：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x229550    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe        0x22420c    kfun:kotlin.Exception#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe        0x22430c    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe        0x22470c    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
   at 5   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe        0x25fac8    kfun:#bar(){} + 104 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe        0x25fa4c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
```
{initial-collapse-state="collapsed" collapsible="true"}

在已支持在堆栈跟踪中提供文件位置和行号的 Apple 目标上，libbacktrace 为内联函数调用提供了更多详细信息：

* **1.6.20 之前：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10a85a8f8    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x10a855846    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x10a855936    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x10a855c86    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x10a8489a5    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:1)
   at 5   example.kexe    0x10a84891c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

* **引入 libbacktrace 的 1.6.20：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10669bc88    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x106696bd6    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x106696cc6    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x106697016    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
>>  at 5   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe    0x106689d35    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe    0x106689cac    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

要使用 libbacktrace 生成更优质的堆栈跟踪，请将以下行添加到 `gradle.properties`：

```none
# gradle.properties
kotlin.native.binary.sourceInfoType=libbacktrace
```

欢迎在此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-48424)中告诉我们你使用 libbacktrace 调试 Kotlin/Native 的体验。

### 支持独立 Android 可执行文件 {id="support-for-standalone-android-executables"}

以前，Kotlin/Native 中的 Android Native 可执行文件实际上并不是真正的可执行文件，而是可用作 NativeActivity 的共享库。现在提供了一个为 Android Native 目标生成标准可执行文件的选项。

为此，在项目的 `build.gradle(.kts)` 部分中，配置 `androidNative` 目标的可执行文件块。
添加以下二进制选项：

```kotlin
kotlin {
    androidNativeX64("android") {
        binaries {
            executable {
                binaryOptions["androidProgramType"] = "standalone"
            }
        }
    }
}
```

请注意，此功能将在 Kotlin 1.7.0 中成为默认设置。
如果你想保留当前行为，请使用以下设置：

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

感谢 Mattia Iavarone 做出的[实现](https://github.com/jetbrains/kotlin/pull/4624)！

### 性能改进 {id="performance-improvements"}

我们正大力投入于 Kotlin/Native，以[加快编译过程](https://youtrack.jetbrains.com/issue/KT-42294)并改善你的开发体验。

Kotlin 1.6.20 带来了一些性能更新和错误修复，这些更新和修复会影响 Kotlin 生成的 LLVM IR。
根据我们在内部项目上的基准测试，平均实现了以下性能提升：

* 执行时间减少 15%
* release 和 debug 二进制文件的代码大小均减少 20%
* release 二进制文件的编译时间减少 26%

这些变更还使大型内部项目上的 debug 二进制文件编译时间减少了 10%。

为了实现这一目标，我们为某些编译器生成的合成对象实现了静态初始化，改进了针对每个函数构建 LLVM IR 的方式，并优化了编译器缓存。

### 改进了 cinterop 模块导入期间的错误处理 {id="improved-error-handling-during-cinterop-modules-import"}

此版本改进了使用 `cinterop` 工具导入 Objective-C 模块时的错误处理（这在 CocoaPods pod 中很常见）。
以前，如果你在尝试使用 Objective-C 模块时遇到错误（例如处理头文件中的编译错误），收到的错误消息往往信息量不足，例如 `fatal error: could not build module $name`。
我们对此部分 `cinterop` 工具进行了扩展，现在你将收到包含扩展描述的错误消息。

### 支持 Xcode 13 库 {id="support-for-xcode-13-libraries"}

Xcode 13 随附的库在此版本中获得全面支持。
你可以在 Kotlin 代码中的任何位置自由访问它们。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

1.6.20 为 Kotlin Multiplatform 带来了以下重要更新：

* [分层结构支持现在是所有新多平台项目的默认设置](#hierarchical-structure-support-for-multiplatform-projects)
* [Kotlin CocoaPods Gradle 插件新增了多项用于 CocoaPods 集成的实用功能](#kotlin-cocoapods-gradle-plugin)

### 多平台项目的分层结构支持 {id="hierarchical-structure-support-for-multiplatform-projects"}

Kotlin 1.6.20 默认启用了分层结构支持。
自 [Kotlin 1.4.0 引入该功能](whatsnew14.md#sharing-code-in-several-targets-with-the-hierarchical-project-structure)以来，我们大幅改进了前端并使 IDE 导入更加稳定。

以前，在多平台项目中添加代码有两种方法。第一种是将其插入平台专属的源集中，这种方法仅限于单个目标，无法被其他平台重用。
第二种是使用在当前 Kotlin 支持的所有平台之间共享的公共源集。

现在，你可以在几个复用大量公共逻辑和第三方 API 的类似原生目标之间[共享源代码](#better-code-sharing-in-your-project)。
该技术将提供正确的默认依赖项，并在共享代码中找到可用的确切 API。
这消除了复杂的构建设置，无需再使用变通方案来获取在原生目标之间共享源集的 IDE 支持。
它还有助于防止不安全地使用针对其他目标的 API。

该技术对[库作者](#more-opportunities-for-library-authors)也大有裨益，因为分层项目结构允许他们发布和使用针对部分目标子集包含通用 API 的库。

默认情况下，使用分层项目结构发布的库仅与分层结构项目兼容。

#### 在项目中更好地共享代码 {id="better-code-sharing-in-your-project"}

如果没有分层结构支持，就无法直接在_某些_但非_全部_ [Kotlin 目标](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)之间共享代码。
一个常见的例子是在所有 iOS 目标之间共享代码，并访问 iOS 专用的[依赖项](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#connect-platform-specific-libraries)（例如 Foundation）。

得益于分层项目结构支持，你现在可以开箱即用地实现这一点。
在新结构中，源集构成了层次结构。
你可以使用平台专属的语言功能以及针对给定源集所编译至的各个目标可用的依赖项。

例如，考虑一个具有两个目标的典型多平台项目——针对 iOS 设备和模拟器的 `iosArm64` 与 `iosX64`。
Kotlin 工具链可以识别这两个目标具有相同的函数，并允许你从中间源集 `iosMain` 访问该函数。

![iOS 分层结构示例](ios-hierarchy-example.jpg){width=700}

Kotlin 工具链提供了正确的默认依赖项，例如 Kotlin/Native stdlib 或原生库。
此外，Kotlin 工具链将尽力准确寻找共享代码中可用的 API 表面区域。
这可以防止例如在为 Windows 共享的代码中使用 macOS 专属函数的情况。

#### 为库作者提供更多机会 {id="more-opportunities-for-library-authors"}

发布多平台库时，其中间源集的 API 现在会随之一同正确发布，以便使用者使用。
同样，Kotlin 工具链将自动确定使用者源集中可用的 API，同时严密监控不安全的用法，例如在 JS 代码中使用专用于 JVM 的 API。
详细了解[在库中共享代码](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-in-libraries)。

#### 配置与设置 {id="configuration-and-setup"}

从 Kotlin 1.6.20 开始，你的所有新多平台项目都将采用分层项目结构。无需额外设置。

* 如果你之前已经[手动开启了它](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)，可以从 `gradle.properties` 中移除这些已弃用的选项：

  ```none
  # gradle.properties
  kotlin.mpp.enableGranularSourceSetsMetadata=true
  kotlin.native.enableDependencyPropagation=false // 或 'true'，取决于你之前的设置
  ```

* 对于 Kotlin 1.6.20，我们建议使用 [Android Studio 2021.1.1](https://developer.android.com/studio) (Bumblebee) 或更高版本以获得最佳体验。

* 你也可以选择停用。若要禁用分层结构支持，请在 `gradle.properties` 中设置以下选项：

  ```none
  # gradle.properties
  kotlin.mpp.hierarchicalStructureSupport=false
  ```

#### 提供反馈 {id="leave-your-feedback"}

这是对整个生态系统的一项重大更改。欢迎向我们提供反馈，以帮助我们将其做得更好。

立即尝试并在[我们的问题跟踪器](https://kotl.in/issue)中报告你遇到的任何困难。

### Kotlin CocoaPods Gradle 插件 {id="kotlin-cocoapods-gradle-plugin"}

为了简化 CocoaPods 集成，Kotlin 1.6.20 带来了以下功能：

* CocoaPods 插件现在具有为所有已注册目标构建 XCFramework 并生成 Podspec 文件的任务。当你不想直接与 Xcode 集成，但希望构建工件并将其部署到本地 CocoaPods 仓库时，这非常有用。
  
  详细了解[构建 XCFramework](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks)。

* 如果你在项目中使用 [CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)，你通常需要为整个 Gradle 项目指定所需的 Pod 版本。现在你有了更多选项：
  * 直接在 `cocoapods` 块中指定 Pod 版本
  * 继续使用 Gradle 项目版本
  
  如果这些属性均未配置，你将收到一个错误。

* 你现在可以在 `cocoapods` 块中配置 CocoaPod 名称，而无需更改整个 Gradle 项目的名称。

* CocoaPods 插件引入了一个新的 `extraSpecAttributes` 属性，你可以使用该属性在 Podspec 文件中配置以前硬编码的属性，例如 `libraries` 或 `vendored_frameworks`。

```kotlin
kotlin {
    cocoapods {
        version = "1.0"
        name = "MyCocoaPod"
        extraSpecAttributes["social_media_url"] = 'https://twitter.com/kotlin'
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        extraSpecAttributes["libraries"] = 'xml'
    }
}
```

查看完整的 Kotlin CocoaPods Gradle 插件 [DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html)。

## Kotlin/JS {id="kotlin-js"}

Kotlin 1.6.20 中对 Kotlin/JS 的改进主要影响 IR 编译器：

* [针对开发二进制文件的增量编译 (IR)](#incremental-compilation-for-development-binaries-with-ir-compiler)
* [顶层属性默认延迟加载 (IR)](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)
* [项目模块默认输出独立 JS 文件 (IR)](#separate-js-files-for-project-modules-by-default-with-ir-compiler)
* [Char 类优化 (IR)](#char-class-optimization)
* [导出改进（IR 和旧版后端）](#improvements-to-export-and-typescript-declaration-generation)
* [异步测试的 @AfterTest 保障](#aftertest-guarantees-for-asynchronous-tests)

### 借助 IR 编译器针对开发二进制文件进行增量编译 {id="incremental-compilation-for-development-binaries-with-ir-compiler"}

为了使借助 IR 编译器进行 Kotlin/JS 开发更加高效，我们引入了一种新的_增量编译_模式。

在此模式下使用 `compileDevelopmentExecutableKotlinJs` Gradle 任务构建**开发二进制文件**时，编译器会在模块级别缓存先前编译的结果。
它在后续编译中对未更改的源文件直接使用缓存的编译结果，从而使编译完成得更快，尤其是在微小改动时。
请注意，此改进专门针对开发流程（缩短“编辑-构建-调试”循环），不会影响生产工件的构建。

要为开发二进制文件启用增量编译，请将以下行添加到项目的 `gradle.properties` 中：

```none
# gradle.properties
kotlin.incremental.js.ir=true // 默认为 false
```

在我们的测试项目中，新模式使增量编译速度提升了多达 30%。然而，由于需要创建和填充缓存，该模式下的全新构建 (clean build) 变慢了。

请在此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-50203)中告诉我们你在 Kotlin/JS 项目中使用增量编译的体验。

### 借助 IR 编译器默认延迟加载顶层属性 {id="lazy-initialization-of-top-level-properties-by-default-with-ir-compiler"}

在 Kotlin 1.4.30 中，我们展示了 JS IR 编译器中[顶层属性延迟初始化](whatsnew1430.md#lazy-initialization-of-top-level-properties)的原型。
延迟加载消除了在应用程序启动时初始化所有属性的需求，从而缩短了启动时间。
我们的测量结果显示，在真实的 Kotlin/JS 应用程序上速度提升了约 10%。

现在，在对该机制进行了完善和充分测试之后，我们使延迟加载成为 IR 编译器中顶层属性的默认行为。

```kotlin
// 延迟加载
val a = run {
    val result = // 密集计算
        println(result)
    result
} // run 在首次使用该变量时执行
```

如果出于某种原因你需要在应用程序启动时急切初始化属性，请使用 [`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-eager-initialization/) 注解标记它。

### 借助 IR 编译器默认按项目模块生成独立 JS 文件 {id="separate-js-files-for-project-modules-by-default-with-ir-compiler"}

以前，JS IR 编译器提供了为项目模块[生成独立 `.js` 文件的功能](https://youtrack.jetbrains.com/issue/KT-44319)。
这是对默认选项（即为整个项目生成单个 `.js` 文件）的一种替代方案。
单个文件可能会过大且不便使用，因为每当你想要使用项目中的某个函数时，都必须将整个 JS 文件作为依赖项引入。
拆分为多个文件增加了灵活性并减小了此类依赖项的大小。该功能过去可通过 `-Xir-per-module` 编译器选项使用。

从 1.6.20 开始，JS IR 编译器默认按项目模块生成独立的 `.js` 文件。

现在可以通过以下 Gradle 属性将项目编译为单个 `.js` 文件：

```none
# gradle.properties
kotlin.js.ir.output.granularity=whole-program // 默认为 `per-module`
```

在先前的版本中，实验性的按模块模式（通过 `-Xir-per-module=true` 标志可用）会调用每个模块中的 `main()` 函数。这与常规的单 `.js` 模式不一致。从 1.6.20 开始，在这两种情况下都仅在主模块中调用 `main()` 函数。如果确实需要在加载模块时运行某些代码，可以使用带有 `@EagerInitialization` 注解标记的顶层属性。参见[借助 IR 编译器默认延迟加载顶层属性](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)。

### Char 类优化 {id="char-class-optimization"}

现在 Kotlin/JS 编译器在处理 `Char` 类时无需进行装箱（类似于[内联类](inline-classes.md)）。
这加快了 Kotlin/JS 代码中对字符的操作速度。

除了性能提升之外，这也改变了将 `Char` 导出到 JavaScript 的方式：它现在被转换为 `Number`。

### 导出与 TypeScript 声明生成的改进 {id="improvements-to-export-and-typescript-declaration-generation"}

Kotlin 1.6.20 为导出机制（[`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 注解）带来了多项修复和改进，包括 [TypeScript 声明文件 (`.d.ts`) 的生成](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)。
我们添加了导出接口和枚举的功能，并修复了先前报告的某些边缘情况下的导出行为。
欲了解更多详情，请参阅 [YouTrack 中的导出改进列表](https://youtrack.jetbrains.com/issues?q=Project:%20Kotlin%20issue%20id:%20KT-45434,%20KT-44494,%20KT-37916,%20KT-43191,%20KT-46961,%20KT-40236)。

详细了解[从 JavaScript 使用 Kotlin 代码](js-to-kotlin-interop.md)。

### 异步测试的 @AfterTest 保障 {id="aftertest-guarantees-for-asynchronous-tests"}

Kotlin 1.6.20 使 [`@AfterTest`](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-after-test/) 函数可以在 Kotlin/JS 上的异步测试中正常工作。
如果测试函数的返回值类型静态解析为 [`Promise`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/)，编译器现在会将 `@AfterTest` 函数的执行安排到相应的 [`then()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/then.html) 回调中。

## 安全性 {id="security"}

Kotlin 1.6.20 引入了几项功能来提高代码的安全性：

* [在 klib 中使用相对路径](#using-relative-paths-in-klibs)
* [为 Kotlin/JS Gradle 项目持久化 yarn.lock](#persisting-yarn-lock-for-kotlin-js-gradle-projects)
* [默认使用 `--ignore-scripts` 安装 npm 依赖项](#installation-of-npm-dependencies-with-ignore-scripts-by-default)

### 在 klib 中使用相对路径 {id="using-relative-paths-in-klibs"}

`klib` 格式的库[包含](native-libraries.md#library-format)源文件的序列化 IR 表示，其中还包括用于生成正确调试信息的文件路径。
在 Kotlin 1.6.20 之前，存储的文件路径是绝对路径。由于库作者可能不希望共享绝对路径，因此 1.6.20 版本提供了一个替代选项。

如果你正在发布 `klib` 并且希望在工件中仅使用源文件的相对路径，现在可以通过 `-Xklib-relative-path-base` 编译器选项传入一个或多个源文件基准路径：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile::class).configureEach {
    // $base 是源文件的基准路径
    kotlinOptions.freeCompilerArgs += "-Xklib-relative-path-base=$base"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile).configureEach {
    kotlinOptions {
        // $base 是源文件的基准路径
        freeCompilerArgs += "-Xklib-relative-path-base=$base"
    }
}
``` 

</tab>
</tabs>

### 为 Kotlin/JS Gradle 项目持久化 yarn.lock {id="persisting-yarn-lock-for-kotlin-js-gradle-projects"}

> 该功能已反向移植到 Kotlin 1.6.10。
>
{style="note"}

Kotlin/JS Gradle 插件现在提供了持久化 `yarn.lock` 文件的功能，使得无需额外的 Gradle 配置即可锁定项目的 npm 依赖项版本。
该功能通过在项目根目录中添加自动生成的 `kotlin-js-store` 目录改变了默认的项目结构。
它在内部保存 `yarn.lock` 文件。

我们强烈建议将 `kotlin-js-store` 目录及其内容提交到版本控制系统中。
将锁定文件提交到版本控制系统是一项[推荐做法](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)，因为它能确保在所有计算机上（无论是其他机器上的开发环境还是 CI/CD 服务）都使用完全相同的依赖树来构建应用程序。
锁定文件还可以防止在新计算机上检出项目时静默更新 npm 依赖项，这存在安全隐患。

像 [Dependabot](https://github.com/dependabot) 这样的工具也可以解析 Kotlin/JS 项目的 `yarn.lock` 文件，并在你依赖的任何 npm 包受到安全漏洞威胁时提供警告。

如果需要，可以在构建脚本中更改目录和锁定文件的名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
``` 

</tab>
</tabs>

> 更改锁定文件的名称可能会导致依赖项检查工具不再识别该文件。
> 
{style="warning"}

### 默认使用 --ignore-scripts 安装 npm 依赖项 {id="installation-of-npm-dependencies-with-ignore-scripts-by-default"}

> 该功能已反向移植到 Kotlin 1.6.10。
>
{style="note"}

Kotlin/JS Gradle 插件现在默认在安装 npm 依赖项时阻止执行[生命周期脚本](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)。
此项更改旨在降低执行来自受安全威胁的 npm 包中的恶意代码的可能性。

要回滚到旧配置，可以通过在 `build.gradle(.kts)` 中添加以下行来显式启用生命周期脚本执行：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
``` 

</tab>
</tabs>

详细了解 [Kotlin/JS Gradle 项目的 npm 依赖项](js-project-setup.md#npm-dependencies)。

## Gradle {id="gradle"}

Kotlin 1.6.20 为 Kotlin Gradle 插件带来了以下更改：

* 新增用于定义 Kotlin 编译器执行策略的[属性 `kotlin.compiler.execution.strategy` 与 `compilerExecutionStrategy`](#properties-for-defining-kotlin-compiler-execution-strategy)
* [弃用选项 `kapt.use.worker.api`、`kotlin.experimental.coroutines` 和 `kotlin.coroutines`](#deprecation-of-build-options-for-kapt-and-coroutines)
* [移除 `kotlin.parallel.tasks.in.project` 构建选项](#removal-of-the-kotlin-parallel-tasks-in-project-build-option)

### 用于定义 Kotlin 编译器执行策略的属性 {id="properties-for-defining-kotlin-compiler-execution-strategy"}

在 Kotlin 1.6.20 之前，你使用系统属性 `-Dkotlin.compiler.execution.strategy` 来定义 Kotlin 编译器执行策略。
在某些情况下，该属性可能不太方便。
Kotlin 1.6.20 引入了一个同名的 Gradle 属性 `kotlin.compiler.execution.strategy` 以及编译任务属性 `compilerExecutionStrategy`。

系统属性目前仍然有效，但在将来的版本中将被移除。

当前的属性优先级如下：

* 任务属性 `compilerExecutionStrategy` 优先于系统属性和 Gradle 属性 `kotlin.compiler.execution.strategy`。
* Gradle 属性优先于系统属性。

你可以为这些属性分配三种编译器执行策略：

| 策略 | Kotlin 编译器的执行位置 | 增量编译 | 其他特性 |
|---|---|---|---|
| Daemon | 在其自身的守护进程 (daemon process) 中 | 是 | *默认策略*。可以在不同的 Gradle 守护进程之间共享 |
| In process | 在 Gradle 守护进程中 | 否 | 可能与 Gradle 守护进程共享堆内存 |
| Out of process | 每次调用均在单独的进程中 | 否 | — |

因此，`kotlin.compiler.execution.strategy` 属性（系统属性和 Gradle 属性）的可用值为：
1. `daemon`（默认）
2. `in-process`
3. `out-of-process`

在 `gradle.properties` 中使用 Gradle 属性 `kotlin.compiler.execution.strategy`：

```none
# gradle.properties
kotlin.compiler.execution.strategy=out-of-process
```

`compilerExecutionStrategy` 任务属性的可用值为：

1. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.DAEMON`（默认）
2. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.IN_PROCESS`
3. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.OUT_OF_PROCESS`

在 `build.gradle.kts` 构建脚本中使用任务属性 `compilerExecutionStrategy`：

```kotlin
import org.jetbrains.kotlin.gradle.dsl.KotlinCompile
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy

// ...

tasks.withType<KotlinCompile>().configureEach {
    compilerExecutionStrategy.set(KotlinCompilerExecutionStrategy.IN_PROCESS)
}
```

欢迎在此 [YouTrack 任务](https://youtrack.jetbrains.com/issue/KT-49299)中留下你的反馈。

### 弃用 kapt 和协程的构建选项 {id="deprecation-of-build-options-for-kapt-and-coroutines"}

在 Kotlin 1.6.20 中，我们更改了以下属性的弃用级别：

* 我们弃用了通过带有 `kapt.use.worker.api` 的 Kotlin 守护进程运行 [kapt](kapt.md) 的功能——现在它会在 Gradle 的输出中生成警告。
  自 1.3.70 版本以来，[kapt 默认一直使用 Gradle worker](kapt.md#run-kapt-tasks-in-parallel)，我们建议坚持使用此方法。

  我们打算在将来的版本中移除 `kapt.use.worker.api` 选项。

* 我们弃用了 `kotlin.experimental.coroutines` Gradle DSL 选项以及在 `gradle.properties` 中使用的 `kotlin.coroutines` 属性。
  只需使用_挂起函数_或[将 `kotlinx.coroutines` 依赖项添加到](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)你的 `build.gradle(.kts)` 文件中即可。
  
  在[协程指南](coroutines-guide.md)中详细了解协程。

### 移除 kotlin.parallel.tasks.in.project 构建选项 {id="removal-of-the-kotlin-parallel-tasks-in-project-build-option"}

在 Kotlin 1.5.20 中，我们宣布了[弃用构建选项 `kotlin.parallel.tasks.in.project`](whatsnew1520.md#deprecation-of-the-kotlin-parallel-tasks-in-project-build-property)。
该选项已在 Kotlin 1.6.20 中移除。

视项目情况而定，Kotlin 守护进程中的并行编译可能会需要更多内存。
为了减少内存消耗，请[增大 Kotlin 守护进程的堆大小](gradle-compilation-and-caches.md#setting-kotlin-daemon-s-jvm-arguments)。

详细了解 Kotlin Gradle 插件中[当前支持的编译器选项](gradle-compiler-options.md)。