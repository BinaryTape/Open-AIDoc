[//]: # (title: 用于 Kotlin 开发的 IDE)

<web-summary>JetBrains 为 IntelliJ IDEA、Android Studio 和 Visual Studio Code 提供官方 Kotlin IDE 支持。</web-summary>

JetBrains 为以下 IDE 和代码编辑器提供官方 Kotlin 支持：[IntelliJ IDEA](#intellij-idea) 和 [Android Studio](#android-studio)。
您还可以为 [Visual Studio Code](#visual-studio-code) 安装由 JetBrains 提供的官方 Kotlin 扩展程序，该扩展目前处于 [Alpha](components-stability.md#stability-levels-explained) 阶段。

其他 IDE 和代码编辑器仅提供由 Kotlin 社区支持的插件。

## IntelliJ IDEA {id="intellij-idea"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 是一款专为 JVM 语言（如 Kotlin 和 Java）设计的 IDE，旨在最大程度提高开发者生产力。
它通过提供智能代码补全、静态代码分析和重构操作，为您处理常规和重复性任务。
它让您专注于软件开发中充满乐趣的部分，使其不仅高效，而且成为一种愉快的体验。

Kotlin 插件随每个 IntelliJ IDEA 版本内置。
每个 IDEA 版本都会引入新功能和升级，以改进 IDE 中 Kotlin 开发者的体验。
请参阅 [IntelliJ IDEA 最新变化](https://www.jetbrains.com/idea/whatsnew/)以了解 Kotlin 的最新更新和改进。

在[官方文档](https://www.jetbrains.com/help/idea/discover-intellij-idea.html)中详细了解有关 IntelliJ IDEA 的信息。

## Android Studio {id="android-studio"}

[Android Studio](https://developer.android.com/studio) 是官方的 Android 应用开发 IDE，基于 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。
除了 IntelliJ 强大的代码编辑器和开发者工具外，Android Studio 还提供了更多功能，可提高您构建 Android 应用时的生产力。

Kotlin 插件随每个 Android Studio 版本内置。

在[官方文档](https://developer.android.com/studio/intro)中详细了解有关 Android Studio 的信息。

## Visual Studio Code {id="visual-studio-code"}
<primary-label ref="alpha"/>

[Visual Studio Code](https://code.visualstudio.com/) 是一款拥有丰富扩展程序的代码编辑器，其中包括[由 JetBrains 提供的官方 Kotlin 扩展程序](https://marketplace.visualstudio.com/items?itemName=JetBrains.kotlin-server)。

该 Kotlin 扩展程序通过 Kotlin 语言服务器提供代码补全、导航、调试以及其他 Kotlin 开发功能。

有关详细信息，请参阅 [Kotlin 语言服务器与 Visual Studio Code](kotlin-lsp.md#kotlin-in-visual-studio-code)。

## 其他 IDE 支持 {id="other-ide-support"}

JetBrains 不为其他 IDE 提供官方 Kotlin 插件。
您可以将 [Kotlin 语言服务器](kotlin-lsp.md)与其他代码编辑器结合使用。

要在没有 IDE 相关功能（如代码格式设置、调试工具、重构）的文本编辑器中使用 Kotlin，您可以从 Kotlin [GitHub Releases](%kotlinLatestUrl%) 下载最新的 Kotlin 命令行编译器 (`kotlin-compiler-%kotlinVersion%.zip`) 并[手动安装](command-line.md#manual-install)。此外，您还可以使用软件包管理器，例如 [Homebrew](command-line.md#homebrew)、[SDKMAN!](command-line.md#sdkman) 和 [Snap 软件包](command-line.md#snap-package)。

## 与 Kotlin 语言版本的兼容性 {id="compatibility-with-the-kotlin-language-versions"}

对于 IntelliJ IDEA 和 Android Studio，Kotlin 插件随每个版本内置。
当新的 Kotlin 版本发布时，这些工具将建议自动将 Kotlin 更新到最新版本。
请参阅 [Kotlin 版本发布](releases.md#ide-support)中的最新支持语言版本。

## IDE 中的 AI 支持 {id="ai-support-in-ides"}

IntelliJ IDEA 和 Android Studio 通过内置的 AI 功能以及与 AI 编码智能体（AI coding agent）的集成，支持 AI 辅助的 Kotlin 开发。根据您的工作流，您可以直接在 IDE 中使用 AI、连接外部智能体，或将 AI 工具与 Kotlin 专属指导相结合。

有关可用 AI 工具的概览及适用时机，请参阅 [](ai-for-development.md)。

## 下一步 {id="what-s-next"}

* [在 IntelliJ IDEA 中创建控制台应用程序](jvm-get-started.md)
* [使用 Android Studio 创建您的第一个跨平台移动应用](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)