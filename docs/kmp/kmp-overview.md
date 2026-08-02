[//]: # (title: 什么是 Kotlin Multiplatform)
[//]: # (description: Kotlin Multiplatform 是由 JetBrains 开发的一项开源技术，支持在 Android、iOS、桌面、Web 和服务器之间共享代码。)

Kotlin Multiplatform (KMP) 是由 JetBrains 开发的一项开源技术，支持在 Android、iOS、桌面、Web 和服务器之间共享代码，同时保留原生开发的优势。

通过使用 Compose Multiplatform，您还可以在多个平台之间共享 UI 代码，实现最大程度的代码复用。

## 为什么公司选择 KMP

### 成本效益与更快的交付速度

Kotlin Multiplatform 有助于简化技术和组织流程：

* 您可以通过跨平台共享逻辑和 UI 代码来减少重复工作并降低维护成本。这也使得在多个平台上同时发布功能成为可能。
* 团队协作变得更加容易，因为统一的逻辑可以在共享代码中访问，这使得团队成员之间的知识传递更加方便，并减少了专门平台团队之间的重复劳动。

除了加快上市时间外，在 2024 年第二季度 KMP 调查中，**55%** 的用户报告称采用 KMP 后协作得到了改善，**65%** 的团队报告称性能和质量得到了提升。

KMP 已被各种规模的组织（从初创公司到全球企业）用于生产环境。Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和哔哩哔哩等公司都采用了 KMP，因为它具有灵活性、原生性能、提供原生用户体验的能力、成本效益以及支持渐进式采用。[详细了解已采用 KMP 的公司](https://kotlinlang.org/case-studies/?type=multiplatform)。

### 代码共享的灵活性

您可以按照您的需求共享代码：共享隔离的模块（如网络或存储），并随着时间的推移逐步扩展共享代码。
您还可以在保留原生 UI 的同时共享所有业务逻辑，或者使用 Compose Multiplatform 逐步迁移 UI。

![渐进式采用 KMP 的插图：共享部分逻辑且不共享 UI、共享所有逻辑而不共享 UI、共享逻辑和 UI](kmp-graphic.png){width="700"}

### iOS 上的原生感

您可以完全使用 SwiftUI 或 UIKit 构建 UI，使用 Compose Multiplatform 在 Android 和 iOS 上创建统一的体验，或者根据需要混合搭配原生与共享 UI 代码。

无论采用哪种方法，您都可以开发出在每个平台上都具有原生感的应用：

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 原生性能

Kotlin Multiplatform 利用 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 生成原生二进制文件，并在不适用或无法使用虚拟机的场景（例如 iOS）中直接访问平台 API。

这有助于在编写平台无关的代码时实现接近原生的性能：

![显示 Compose Multiplatform 和 SwiftUI 在 iPhone 13 和 iPhone 16 上的 iOS 性能对比图表](cmp-ios-performance.png){width="700"}

### 无缝的工具链

IntelliJ IDEA 和 Android Studio 通过 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 为 KMP 提供智能 IDE 支持，包括通用 UI 预览、[Compose Multiplatform 实时重载](compose-hot-reload.md)、跨语言导航、重构操作，以及跨 Kotlin 和 Swift 代码的调试。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 驱动的开发

让 JetBrains 的 AI 编码代理 [Junie](https://jetbrains.com/junie) 处理 KMP 任务，让您的团队能够更快速地推进。

## 探索 Kotlin Multiplatform 用例

了解公司和开发者如何从共享 Kotlin 代码中受益：

* 在我们的[案例研究页面](https://kotlinlang.org/case-studies/?type=multiplatform)上了解各公司如何在其代码库中成功采用 KMP。
* 在我们的[精选示例列表](multiplatform-samples.md)和 GitHub [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 话题中查看各种示例应用。

## 学习基础知识

要快速了解 KMP 的实际应用，请尝试[快速入门](quickstart.md)。
您将设置环境并在不同平台上运行示例应用程序。

选择一个用例
: * 要创建一个在平台之间共享 UI 和业务逻辑代码的应用，请参考[共享逻辑与 UI 教程](compose-multiplatform-create-first-app.md)。
  * 要了解如何将 Android 应用转换为多平台应用，请查看我们的[迁移教程](multiplatform-integrate-in-existing-app.md)。
  * 要了解如何在不共享 UI 实现的情况下共享部分代码，请参考[共享逻辑教程](multiplatform-create-first-app.md)。

深入研究技术细节
: * 从[基本项目结构](multiplatform-discover-project.md)开始。
  * 了解可用的[共享代码机制](multiplatform-share-on-platforms.md)。
  * 了解 KMP 项目中[依赖项的工作原理](multiplatform-add-dependencies.md)。
  * 考虑不同的 [iOS 集成方法](multiplatform-ios-integration-overview.md)。
  * 了解 KMP 如何针对各种目标[编译代码](multiplatform-configure-compilations.md)并[构建原生二进制文件](multiplatform-build-native-binaries.md)。
  * 阅读关于[发布多平台应用](multiplatform-publish-apps.md)或[多平台库](multiplatform-publish-lib-setup.md)的内容。

## 探索 Kotlin Multiplatform 库生态系统

已有数千个多平台库可用于网络、存储、依赖注入、测试、UI、序列化等。

您可以在 [klibs.io](https://klibs.io) 上浏览这些库，这是一个由 JetBrains 维护的搜索平台。

## 规模化采用 Kotlin Multiplatform

在团队中采用跨平台框架可能是一项挑战。
要了解跨平台开发的优势和潜在问题的解决方案，请查看我们对跨平台开发的高级概述：

* [什么是跨平台移动开发？](cross-platform-mobile-development.topic)：概述了跨平台应用的不同方法和实现方式。
* [如何向您的团队介绍多平台移动开发](multiplatform-introduce-your-team.md)：提供了在团队中引入跨平台开发的策略。
* [采用 Kotlin Multiplatform 并助力项目腾飞的十大理由](multiplatform-reasons-to-try.md)：列出了选择 Kotlin Multiplatform 作为跨平台解决方案的理由。