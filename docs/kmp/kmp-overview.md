[//]: # (title: 什么是 Kotlin Multiplatform)
[//]: # (description: Kotlin Multiplatform 是来自 JetBrains 的一项开源技术，支持在 Android、iOS、桌面端、Web 和服务器之间共享代码。)

Kotlin Multiplatform (KMP) 是来自 JetBrains 的一项开源技术，支持在 Android、iOS、桌面端、Web 和服务器之间共享代码，同时保留原生开发的各项优势。

借助 Compose Multiplatform，你还可以跨多个平台共享 UI 代码，实现最大程度的代码复用。

## 为什么各企业选择 KMP {id="why-companies-choose-kmp"}

### 成本效益与更快的交付速度 {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatform 有助于简化技术和组织流程：

* 通过跨平台共享逻辑和 UI 代码，你可以减少重复工作并降低维护成本。这也使得在多个平台上同步发布功能成为可能。
* 团队协作变得更加轻松，因为统一的逻辑可以在共享代码中访问，从而使团队成员之间的知识传递更加容易，并减少各专属平台团队之间的重复劳动。

除了能更快地推向市场之外，**55%** 的用户表示采用 KMP 后团队协作得到了改善，**65%** 的团队报告称性能和质量有所提升（摘自 2024 年第二季度 KMP 调查报告）。

从初创公司到跨国企业，各种规模的组织都在生产环境中使用了 KMP。诸如 Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和哔哩哔哩等公司均已采用 KMP，原因在于其具备灵活性、原生性能、交付原生用户体验的能力、成本效益以及对渐进式采用的支持。[详细了解已采用 KMP 的企业](https://kotlinlang.org/case-studies/?type=multiplatform)。

### 代码共享的灵活性 {id="flexibility-of-code-sharing"}

你可以按照自己的方式共享代码：共享独立模块（例如网络或存储），并随着时间的推移逐步扩展共享代码。
你还可以共享全部业务逻辑，同时保持 UI 原生化，或者使用 Compose Multiplatform 逐步迁移 UI。

![KMP 渐进式采用示意图：共享部分逻辑且不共享 UI、共享全部逻辑且不共享 UI、共享逻辑与 UI](kmp-graphic.png){width="700"}

### iOS 上的原生质感 {id="native-feel-on-ios"}

你可以完全使用 SwiftUI 或 UIKit 构建 UI，也可以使用 Compose Multiplatform 在 Android 和 iOS 上打造一致的体验，或者根据需要将原生与共享 UI 代码混合搭配使用。

无论采用哪种方式，你都可以构建出在各个平台上都具有原生质感的基础应用：

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 原生性能 {id="native-performance"}

Kotlin Multiplatform 利用 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 生成原生二进制文件，并在不适合或无法使用虚拟机的场景（例如 iOS）中直接访问平台 API。

这有助于在编写平台无关代码的同时，实现接近原生的性能：

![展示 Compose Multiplatform 与 SwiftUI 在 iPhone 13 和 iPhone 16 上的 iOS 性能对比图表](cmp-ios-performance.png){width="700"}

### 无缝的工具链支持 {id="seamless-tooling"}

IntelliJ IDEA 和 Android Studio 通过 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 为 KMP 提供智能 IDE 支持，其中包括通用 UI 预览、[Compose Hot Reload](compose-hot-reload.md) 以及其他提升开发体验的功能。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 赋能的开发体验 {id="ai-powered-development"}

让 JetBrains 的 AI 编码智能体 [Junie](https://jetbrains.com/junie) 来处理 KMP 任务，助力你的团队更加迅速地推进开发。

## 探索 Kotlin Multiplatform 用例 {id="discover-kotlin-multiplatform-use-cases"}

了解企业和开发者如何尽享 Kotlin 共享代码带来的优势：

* 在我们的[案例研究页面](https://kotlinlang.org/case-studies/?type=multiplatform)上了解企业如何在其代码库中成功采用 KMP。
* 在我们的[精选示例列表](multiplatform-samples.md)以及 GitHub [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 主题中查看丰富的示例应用。

## 学习基础知识 {id="learn-the-basics"}

若要快速了解 KMP 的实际运用，请试用[快速入门指南](quickstart.md)。
你将配置开发环境并在不同平台上运行示例应用程序。

选择一个用例
: * 要创建在跨平台间同时共享 UI 和业务逻辑代码的应用，请参阅[共享逻辑与 UI 教程](compose-multiplatform-new-project.md)。
  * 要了解如何将 Android 应用转换为多平台应用，请查看我们的[迁移教程](multiplatform-integrate-in-existing-app.md)。
  * 要了解如何在不共享 UI 实现的情况下共享部分代码，请参阅[共享逻辑教程](multiplatform-upgrade-app.md)。

深入探究技术细节
: * 从[基本项目结构](multiplatform-discover-project.md)开始了解。
  * 了解可用的[代码共享机制](multiplatform-share-on-platforms.md)。
  * 了解 KMP 项目中[依赖项的工作原理](multiplatform-add-dependencies.md)。
  * 了解不同的 [iOS 集成方法](multiplatform-ios-integration-overview.md)。
  * 了解 KMP 如何针对不同目标平台[编译代码](multiplatform-configure-compilations.md)并[构建二进制文件](multiplatform-build-native-binaries.md)。
  * 阅读有关[发布多平台应用](multiplatform-publish-apps.md)或[发布多平台库](multiplatform-publish-lib-setup.md)的内容。

## 探索 Kotlin Multiplatform 库生态系统 {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

成千上万的多平台库可用于网络、存储、依赖注入、测试、UI、序列化等场景。

你可以在由 JetBrains 维护的搜索平台 [klibs.io](https://klibs.io) 上浏览这些库。

## 大规模采用 Kotlin Multiplatform {id="adopt-kotlin-multiplatform-at-scale"}

在团队中采用跨平台框架可能是一项挑战。
若要了解相关优势以及潜在问题的解决方案，请参阅我们对跨平台开发的整体概述：

* [什么是跨平台移动开发？](cross-platform-mobile-development.topic)：概述了跨平台应用程序的不同方法与实现。
* [如何向团队引入多平台移动开发](multiplatform-introduce-your-team.md)：提供了在团队中推行跨平台开发的策略。
* [采用 Kotlin Multiplatform 并为项目赋能的十大理由](multiplatform-reasons-to-try.md)：列出了将 Kotlin Multiplatform 作为跨平台解决方案的理由。