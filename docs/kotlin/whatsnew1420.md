[//]: # (title: Kotlin 1.4.20 的最新变化)

<web-summary>阅读 Kotlin 1.4.20 发布说明，涵盖新的语言功能、Kotlin 多平台、JVM、Native、JS 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2020 年 11 月 23 日](releases.md#release-history)_

Kotlin 1.4.20 提供了许多新的实验性功能，并对现有功能（包括 1.4.0 中添加的功能）进行了修复和改进。

您还可以在[这篇博客文章](https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/)中通过更多示例了解新功能。

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布过程](releases.md)。
>
{style="tip"}

## Kotlin/JVM

Kotlin/JVM 的改进旨在紧跟现代 Java 版本的特性：

- [Java 15 目标](#java-15-target)
- [invokedynamic 字符串串联](#invokedynamic-string-concatenation)

### Java 15 目标

现在 Java 15 已可作为 Kotlin/JVM 的目标版本。

### invokedynamic 字符串串联

> `invokedynamic` 字符串串联处于[实验性](components-stability.md)阶段。它可能随时被删除或更改。需要启用（详情见下文）。请仅出于评估目的使用它。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

Kotlin 1.4.20 可以将字符串串联编译为 JVM 9+ 目标上的 [动态调用](https://docs.oracle.com/javase/7/docs/technotes/guides/vm/multiple-language-support.html#invokedynamic)，从而提高性能。

目前，此功能处于实验性阶段，涵盖以下情况：
- `String.plus` 的运算符形式 (`a + b`)、显式形式 (`a.plus(b)`) 和引用形式 (`(a::plus)(b)`)。
- 内联类和数据类上的 `toString`。
- 字符串模板，但具有单个非常量实参的模板除外（参见 [KT-42457](https://youtrack.jetbrains.com/issue/KT-42457)）。

要启用 `invokedynamic` 字符串串联，请添加 `-Xstring-concat` 编译器选项，并使用以下值之一：
- `indy-with-constants`：使用 [StringConcatFactory.makeConcatWithConstants()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcatWithConstants-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.String-java.lang.Object...-) 对字符串执行 `invokedynamic` 串联。
- `indy`：使用 [StringConcatFactory.makeConcat()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcat-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-) 对字符串执行 `invokedynamic` 串联。
- `inline`：切换回通过 `StringBuilder.append()` 进行的传统串联。

## Kotlin/JS

Kotlin/JS 持续快速演进，在 1.4.20 中您可以发现许多实验性功能和改进：

- [Gradle DSL 变更](#gradle-dsl-changes)
- [新的向导模板](#new-wizard-templates)
- [使用 IR 编译器忽略编译错误](#ignoring-compilation-errors-with-ir-compiler)

### Gradle DSL 变更

Kotlin/JS 的 Gradle DSL 进行了多项更新，简化了项目设置和自定义。这包括 webpack 配置调整、对自动生成的 `package.json` 文件的修改，以及对传递性依赖项的改进控制。

#### webpack 配置的单点设置

浏览器目标现在提供了一个新的配置块 `commonWebpackConfig`。在其中，您可以从单点调整通用设置，而无需为 `webpackTask`、`runTask` 和 `testTask` 重复配置。

要为所有这三个任务默认启用 CSS 支持，请在项目的 `build.gradle(.kts)` 中添加以下代码片段：

```groovy
browser {
    commonWebpackConfig {
        cssSupport.enabled = true
    }
    binaries.executable()
}
```

详细了解[配置 webpack 打包](js-project-setup.md#webpack-bundling)。

#### 从 Gradle 自定义 package.json

为了更好地控制 Kotlin/JS 软件包管理和分发，您现在可以通过 Gradle DSL 向项目文件 [`package.json`](https://nodejs.dev/learn/the-package-json-guide) 添加属性。

要向 `package.json` 添加自定义字段，请在编译的 `packageJson` 块中使用 `customField` 函数：

```kotlin
kotlin {
    js(BOTH) {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

详细了解 [`package.json` 自定义](js-project-setup.md#package-json-customization)。

#### 选择性 Yarn 依赖项解析

> 对选择性 Yarn 依赖项解析的支持处于[实验性](components-stability.md)阶段。它可能随时被删除或更改。请仅出于评估目的使用它。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

Kotlin 1.4.20 提供了一种配置 Yarn [选择性依赖项解析](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/)的方法，该机制用于覆盖您所依赖的软件包的依赖项。

您可以通过 Gradle 中 `YarnPlugin` 内的 `YarnRootExtension` 来使用它。要影响项目软件包的已解析版本，请使用 `resolution` 函数，并传入软件包名称选择器（由 Yarn 指定）和应解析到的版本。

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().apply {
        resolution("react", "16.0.0")
        resolution("processor/decamelize", "3.0.0")
    }
}
```

在这里，您*所有*需要 `react` 的 npm 依赖项都将获得 `16.0.0` 版本，而 `processor` 将获得版本为 `3.0.0` 的依赖项 `decamelize`。

#### 禁用细粒度工作区

> 禁用细粒度工作区处于[实验性](components-stability.md)阶段。它可能随时被删除或更改。请仅出于评估目的使用它。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

为了加快构建时间，Kotlin/JS Gradle 插件仅安装特定 Gradle 任务所需的依赖项。例如，`webpack-dev-server` 软件包仅在您执行某个 `*Run` 任务时安装，而在执行 assemble 任务时不安装。这种行为在并行运行多个 Gradle 进程时可能会带来问题。当依赖项要求发生冲突时，两次 npm 软件包安装可能会导致错误。

为了解决此问题，Kotlin 1.4.20 包含了一个禁用这些所谓*细粒度工作区*的选项。此功能目前通过 Gradle 中 `YarnPlugin` 内的 `YarnRootExtension` 提供。要使用它，请将以下代码片段添加到您的 `build.gradle.kts` 文件中：

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().disableGranularWorkspaces()
}
```

### 新的向导模板

为了在创建项目期间为您提供更方便的自定义方式，Kotlin 的项目向导为 Kotlin/JS 应用程序带来了新的模板：
- **浏览器应用程序 (Browser Application)** - 一个在浏览器中运行的极简 Kotlin/JS Gradle 项目。
- **React 应用程序 (React Application)** - 一个使用适当 `kotlin-wrappers` 的 React 应用。它提供了启用样式表、导航组件或状态容器集成的选项。
- **Node.js 应用程序 (Node.js Application)** - 一个在 Node.js 运行时中运行的极简项目。它带有一个可以直接包含实验性 `kotlinx-nodejs` 软件包的选项。

### 使用 IR 编译器忽略编译错误

> “忽略编译错误”模式处于[实验性](components-stability.md)阶段。它可能随时被删除或更改。需要启用（详情见下文）。请仅出于评估目的使用它。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

Kotlin/JS 的 [IR 编译器](js-ir-compiler.md) 带来了一种新的实验性模式——“带错编译”。在此模式下，即使代码包含错误，您也可以运行代码，例如，当整个应用尚未准备就绪，但您想尝试某些功能时。
 
此模式有两种容错策略：
- `SEMANTIC`：编译器将接受语法正确但在语义上没有意义的代码，例如 `val x: String = 3`。

- `SYNTAX`：编译器将接受任何代码，即使包含语法错误。

要允许带错编译，请添加 `-Xerror-tolerance-policy=` 编译器选项，并使用上述值之一。

[详细了解 Kotlin/JS IR 编译器](js-ir-compiler.md)。

## Kotlin/Native

Kotlin/Native 在 1.4.20 中的优先级是性能和完善现有功能。以下是显著的改进：
  
- [逃逸分析](#escape-analysis)
- [性能改进和错误修复](#performance-improvements-and-bug-fixes)
- [选择性包装 Objective-C 异常](#opt-in-wrapping-of-objective-c-exceptions)
- [CocoaPods 插件改进](#cocoapods-plugin-improvements)
- [支持 Xcode 12 库](#support-for-xcode-12-libraries)

### 逃逸分析

> 逃逸分析机制处于[实验性](components-stability.md)阶段。它可能随时被删除或更改。请仅出于评估目的使用它。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

Kotlin/Native 获得了新 [逃逸分析](https://en.wikipedia.org/wiki/Escape_analysis) 机制的原型。它通过在栈上而不是堆上分配某些对象来提高运行时性能。该机制在我们的基准测试中显示出平均 10% 的性能提升，我们将继续对其进行改进，以进一步加快程序运行速度。

逃逸分析在发布构建的独立编译阶段运行（使用 `-opt` 编译器选项）。

如果您想禁用逃逸分析阶段，请使用 `-Xdisable-phases=EscapeAnalysis` 编译器选项。

### 性能改进和错误修复

Kotlin/Native 在各个组件中都获得了性能改进和错误修复，包括 1.4.0 中添加的组件，例如 [代码共享机制](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)。

### 选择性包装 Objective-C 异常

> Objective-C 异常包装机制处于[实验性](components-stability.md)阶段。它可能随时被删除或更改。需要启用（详情见下文）。请仅出于评估目的使用它。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

Kotlin/Native 现在可以处理运行时从 Objective-C 代码抛出的异常，以避免程序崩溃。

您可以选择将 `NSException` 包装成 `ForeignException` 类型的 Kotlin 异常。它们持有对原始 `NSException` 的引用。这让您可以获取有关根本原因的信息并进行妥善处理。

要启用 Objective-C 异常的包装，请在 `cinterop` 调用中指定 `-Xforeign-exception-mode objc-wrap` 选项，或将 `foreignExceptionMode = objc-wrap` 属性添加到 `.def` 文件。如果您使用 [CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)，请在依赖项的 `pod {}` 构建脚本块中指定该选项，如下所示：

```kotlin
pod("foo") {
    extraOpts = listOf("-Xforeign-exception-mode", "objc-wrap")
}
```

默认行为保持不变：当从 Objective-C 代码抛出异常时，程序将终止。

### CocoaPods 插件改进

Kotlin 1.4.20 继续对 CocoaPods 集成进行了一系列改进。具体来说，您可以尝试以下新功能：

- [改进的任务执行](#improved-task-execution)
- [扩展的 DSL](#extended-dsl)
- [更新的 Xcode 集成](#updated-integration-with-xcode)

#### 改进的任务执行

CocoaPods 插件获得了改进的任务执行流程。例如，如果您添加了一个新的 CocoaPods 依赖项，现有的依赖项不会被重新构建。添加额外的目标也不会影响现有目标的依赖项重构。

#### 扩展的 DSL

向 Kotlin 项目添加 [CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) 依赖项的 DSL 获得了新的功能。

除了本地 Pod 和来自 CocoaPods 仓库的 Pod 之外，您还可以添加对以下类型库的依赖：
* 来自自定义 spec 仓库的库。
* 来自 Git 仓库的远程库。
* 来自归档文件的库（也可通过任意 HTTP 地址访问）。
* 静态库。
* 具有自定义 cinterop 选项的库。

详细了解在 Kotlin 项目中[添加 CocoaPods 依赖项](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-libraries.html)。在 [Kotlin with CocoaPods 示例](https://github.com/Kotlin/kmm-with-cocoapods-sample)中查找示例。

#### 更新的 Xcode 集成

为了与 Xcode 正确配合，Kotlin 需要对 Podfile 进行一些更改：

* 如果您的 Kotlin Pod 有任何 Git、HTTP 或 specRepo Pod 依赖项，您也应该在 Podfile 中指定它。
* 当您从自定义 spec 添加库时，您还应该在 Podfile 的开头指定 spec 的 [位置](https://guides.cocoapods.org/syntax/podfile.html#source)。

现在集成错误在 IDEA 中有详细的描述。因此，如果您的 Podfile 有问题，您将立即知道如何修复。

详细了解[创建 Kotlin pod](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-xcode.html)。

### 支持 Xcode 12 库
    
我们增加了对随 Xcode 12 交付的新库的支持。现在您可以在 Kotlin 代码中使用它们。

## Kotlin 多平台

### 多平台库发布结构的更新 

从 Kotlin 1.4.20 开始，不再有单独的元数据发布。元数据工件现在包含在代表整个库的*根*发布中，当作为依赖项添加到公共源集时，会自动解析为适当的平台特定工件。

详细了解[发布多平台库](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

#### 与早期版本的兼容性

这种结构变化打破了具有[分层项目结构](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)的项目之间的兼容性。如果一个多平台项目及其依赖的库都具有分层项目结构，那么您需要同时将它们更新到 Kotlin 1.4.20 或更高版本。使用 Kotlin 1.4.20 发布的库无法在早期版本发布的项目中使用。

不带分层项目结构的项目和库保持兼容。

## 标准库

Kotlin 1.4.20 的标准库提供了用于处理文件的新扩展以及更好的性能。

- [java.nio.file.Path 的扩展](#extensions-for-java-nio-file-path)
- [改进的 String.replace 函数性能](#improved-string-replace-function-performance)

### java.nio.file.Path 的扩展

> `java.nio.file.Path` 的扩展处于[实验性](components-stability.md)阶段。它们可能随时被删除或更改。需要启用（详情见下文）。请仅出于评估目的使用它们。我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供反馈。
>
{style="warning"}

现在标准库为 `java.nio.file.Path` 提供了实验性扩展。以地道的 Kotlin 方式使用现代 JVM 文件 API 现在与使用 `kotlin.io` 软件包中的 `java.io.File` 扩展类似。

```kotlin
// 使用 div (/) 运算符构造路径
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory" 

// 列出目录中的文件
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

这些扩展在 `kotlin-stdlib-jdk7` 模块的 `kotlin.io.path` 软件包中可用。要使用这些扩展，请[启用](opt-in-requirements.md)实验性注解 `@ExperimentalPathApi`。

### 改进的 String.replace 函数性能

`String.replace()` 的新实现加快了函数执行速度。区分大小写的变体使用基于 `indexOf` 的手动替换循环，而不区分大小写的变体使用正则表达式匹配。

## Kotlin Android 扩展

在 1.4.20 中，Kotlin Android Extensions 插件被弃用，并且 `Parcelable` 实现生成器移至一个单独的插件中。

- [弃用合成视图](#deprecation-of-synthetic-views)
- [用于 Parcelable 实现生成器的新插件](#new-plugin-for-parcelable-implementation-generator)

### 弃用合成视图

*合成视图 (Synthetic views)* 在一段时间前被引入 Kotlin Android Extensions 插件中，以简化与 UI 元素的交互并减少模板代码。现在 Google 提供了一个执行相同功能的原生机制——Android Jetpack 的[视图绑定 (view bindings)](https://developer.android.com/topic/libraries/view-binding)，我们正弃用合成视图以支持后者。

我们将 Parcelable 实现生成器从 `kotlin-android-extensions` 中提取出来，并对其余部分——合成视图——开始弃用周期。目前，它们将继续工作，但会显示弃用警告。将来，您需要将项目切换到另一个解决方案。以下[指南](https://goo.gle/kotlin-android-extensions-deprecation)将帮助您将 Android 项目从 synthetics 迁移到视图绑定。

### 用于 Parcelable 实现生成器的新插件

`Parcelable` 实现生成器现在在新的 `kotlin-parcelize` 插件中可用。请应用此插件而不是 `kotlin-android-extensions`。

>`kotlin-parcelize` 和 `kotlin-android-extensions` 不能在同一个模块中同时应用。
>
{style="note"}

`@Parcelize` 注解已移至 `kotlinx.parcelize` 软件包。

在 [Android 文档](https://developer.android.com/kotlin/parcelize)中详细了解 `Parcelable` 实现生成器。