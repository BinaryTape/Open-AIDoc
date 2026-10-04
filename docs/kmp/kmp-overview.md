[//]: # (title: 什么是 Kotlin Multiplatform)
[//]: # (description: Kotlin Multiplatform 是来自 JetBrains 的开源技术，允许在 Android、iOS、桌面、Web 和服务器之间共享代码。)

Kotlin Multiplatform (KMP) 是来自 JetBrains 的开源技术，允许在 Android、iOS、桌面、Web 和服务器之间共享代码，同时保留原生开发的优势。

借助 Compose Multiplatform，你还可以跨多个平台共享 UI 代码，实现最大程度的代码复用。

## 为什么企业选择 KMP {id="why-companies-choose-kmp"}

### 成本效益与更快的交付 {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatform 有助于简化技术和组织流程：

* 你可以通过跨平台共享逻辑和 UI 代码来减少重复和维护成本。这还使得在多个平台上同时发布功能成为可能。
* 团队协作变得更加轻松，因为统一的逻辑可以在共享代码中访问，使得团队成员之间的知识传递更加容易，并减少专属平台团队之间的重复工作。

除了加快上市时间外，**55%** 的用户表示在采用 KMP 后协作得到了改善，**65%** 的团队报告性能和质量有所提升（引自 2024 年第二季度 KMP 调查）。

从创业公司到全球性企业，各种规模的组织都在生产环境中使用 KMP。Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、Baidu、Kuaishou 和 Bilibili 等公司采用 KMP 是因为其灵活性、原生性能、提供原生用户体验的能力、成本效益以及对渐进式采用的支持。[详细了解采用 KMP 的公司](https://kotlinlang.org/case-studies/?type=multiplatform)。

### 代码共享的灵活性 {id="flexibility-of-code-sharing"}

你可以按照自己的节奏共享代码：共享独立的模块（如网络或存储），并随着时间的推移逐步扩展共享代码。
你也可以共享所有的业务逻辑而保留原生 UI，或者使用 Compose Multiplatform 逐步迁移 UI。

![渐进式采用 KMP 的图解：共享部分逻辑而不共享 UI、共享所有逻辑而不包含 UI、共享逻辑和 UI](kmp-graphic.png){width="700"}

### iOS 上的原生质感 {id="native-feel-on-ios"}

你可以完全使用 SwiftUI 或 UIKit 构建 UI，使用 Compose Multiplatform 在 Android 和 iOS 上打造一致的体验，或者根据需要混合搭配原生与共享 UI 代码。

无论采用哪种方式，你都可以构建出在各个平台上具有原生质感的应用程序：

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 原生性能 {id="native-performance"}

Kotlin Multiplatform 利用 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 生成原生二进制文件，并在不需要或无法使用虚拟机的情况下（例如在 iOS 上）直接访问平台 API。

这有助于在编写平台无关代码的同时实现接近原生的性能：

![显示 Compose Multiplatform 和 SwiftUI 在 iPhone 13 和 iPhone 16 上的 iOS 性能对比图](cmp-ios-performance.png){width="700"}

### 无缝的工具链 {id="seamless-tooling"}

IntelliJ IDEA 和 Android Studio 通过 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 为 KMP 提供智能 IDE 支持，包括通用 UI 预览、[Compose Multiplatform 的热重载](compose-hot-reload.md)、跨语言导航、重构操作以及跨 Kotlin 和 Swift 代码的调试。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 赋能的开发 {id="ai-powered-development"}

让 JetBrains 的 AI 编码智能体 [Junie](https://jetbrains.com/junie) 处理 KMP 任务，让你的团队能够更快速地推进工作。

## 探索 Kotlin Multiplatform 用例 {id="discover-kotlin-multiplatform-use-cases"}

看看各企业和开发者是如何从共享 Kotlin 代码中获益的：

* 在我们的[案例分析页面](https://kotlinlang.org/case-studies/?type=multiplatform)上了解企业如何在其实际代码库中成功采用 KMP。
* 在我们[精选的示例列表](multiplatform-samples.md)以及 GitHub [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 主题中查看丰富的示例应用。

## 学习基础知识 {id="learn-the-basics"}

要快速体验 KMP 的实际运行效果，请试用[快速入门指南](quickstart.md)。
你将配置你的环境并在不同平台上运行示例应用程序。

选择用例
: * 要创建在平台之间共享 UI 和业务逻辑代码的应用，请参阅[共享逻辑和 UI 教程](compose-multiplatform-new-project.md)。
  * 要了解如何将 Android 应用转换为多平台应用，请查看我们的[迁移教程](multiplatform-integrate-in-existing-app.md)。
  * 要了解如何在不共享 UI 实现的情况下共享部分代码，请参阅[共享逻辑教程](multiplatform-upgrade-app.md)。

深入了解技术细节
: * 从[基本项目结构](multiplatform-discover-project.md)开始。
  * 了解可用的[代码共享机制](multiplatform-share-on-platforms.md)。
  * 查看 KMP 项目中[依赖项的工作方式](multiplatform-add-dependencies.md)。
  * 考虑不同的 [iOS 集成方式](multiplatform-ios-integration-overview.md)。
  * 了解 KMP 如何针对各种目标[编译代码](multiplatform-configure-compilations.md)和[构建二进制文件](multiplatform-build-native-binaries.md)。
  * 阅读有关[发布多平台应用](multiplatform-publish-apps.md)或[多平台库](multiplatform-publish-lib-setup.md)的内容。

## 探索 Kotlin Multiplatform 库生态系统 {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

数以千计的多平台库可用于网络、存储、SQL 注入、测试、UI、序列化等。

在由 JetBrains 维护的搜索平台 [klibs.io](https://klibs.io) 上浏览它们。

## 大规模采用 Kotlin Multiplatform {id="adopt-kotlin-multiplatform-at-scale"}

在团队中采用跨平台框架可能是一项挑战。
要了解潜在问题的优势和解决方案，请查看我们关于跨平台开发的高级概述：

* [什么是跨平台移动开发？](cross-platform-mobile-development.topic)：提供跨平台应用程序的不同方法与实现的概述。
* [如何向你的团队介绍多平台移动开发](multiplatform-introduce-your-team.md)：提供在团队中引入跨平台开发的策略。
* [采用 Kotlin Multiplatform 为项目赋能的十大理由](multiplatform-reasons-to-try.md)：列出选择 Kotlin Multiplatform 作为跨平台解决方案的理由。