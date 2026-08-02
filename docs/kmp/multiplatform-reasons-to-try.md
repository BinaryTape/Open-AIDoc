[//]: # (title: 采用 Kotlin Multiplatform 并为您的项目注入强大动力的十个理由)

<web-summary>探索在项目中使用 Kotlin Multiplatform 的十个理由。查看来自公司的真实案例，并开始在您的多平台开发中使用这项技术。</web-summary>

在当今多样化的技术领域中，开发者面临着构建能够跨各种平台无缝运行的应用程序的挑战，同时还需优化开发时间并提高用户生产力。Kotlin Multiplatform (KMP) 提供了一种解决方案，允许您为多个平台创建应用，在保持原生编程优势的同时，促进这些平台之间的代码复用。

在本文中，我们将探讨开发者应考虑在现有或新项目中使用 Kotlin Multiplatform 的十个理由，以及为什么 KMP 能够持续获得巨大的关注。

**采用率稳步上升：** 根据最近两次的 [开发者生态系统调查](https://devecosystem-2025.jetbrains.com/)，Kotlin Multiplatform 的使用量在短短一年内翻了一番多——从 2024 年的 7% 增长到 2025 年的 18%。这种快速增长凸显了该技术日益增强的势头以及开发者对其建立的信心。

![在最近两次开发者生态系统调查的受访者中，KMP 的使用率从 2024 年的 7% 增加到 2025 年的 18%](kmp-growth-deveco.svg){width=700}

## 为什么您应该在项目中尝试 Kotlin Multiplatform

无论您是希望提高开发效率还是探索新技术，本文都会为您提供帮助。它解释了 Kotlin Multiplatform 的一些实际优势，例如简化开发、支持多个平台以及提供强大的工具生态系统。您还将看到来自真实公司的案例研究。

1. [Kotlin Multiplatform 帮助您避免代码重复](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform 支持广泛的平台列表](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin 提供了简化的代码共享机制](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform 允许灵活的多平台开发](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [通过 Kotlin Multiplatform 解决方案，您可以共享 UI 代码](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [您可以在现有和新项目中使用 Kotlin Multiplatform](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [通过 Kotlin Multiplatform，您可以开始逐步共享代码](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform 已被全球公司使用](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform 提供强大的工具支持](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform 拥有庞大且充满支持的社区](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform 帮助您避免代码重复

百度，全球最大的中文搜索引擎，推出了面向年轻受众的应用程序 *Wonder App*。以下是他们在传统应用开发中面临的一些问题：

* 应用体验不一致：Android 应用的运行方式与 iOS 应用不同。
* 验证业务逻辑的成本高：iOS 和 Android 开发者使用相同业务逻辑的工作需要独立检查，这导致了高昂的成本。
* 升级和维护成本高：重复编写业务逻辑既复杂又耗时，这增加了应用的升级和维护成本。

百度团队决定尝试 Kotlin Multiplatform，首先从统一数据层开始：数据模型、RESTful API 请求、JSON 数据解析和缓存逻辑。

随后，他们决定采用 Model-View-Intent (MVI) 用户界面模式，这允许您使用 Kotlin Multiplatform 统一界面逻辑。他们还共享了底层数据、处理逻辑和 UI 处理逻辑。

实验证明非常成功，带来了以下结果：

* Android 和 iOS 应用之间的一致体验。
* 降低了维护和测试成本。
* 显著提高了团队内的生产力。

[![探索真实的 Kotlin Multiplatform 用例](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform 支持广泛的平台列表

Kotlin Multiplatform 的关键优势之一是其对各种平台的广泛支持，使其成为开发者的多功能选择。这些平台包括 Android、iOS、桌面端、Web（JavaScript 和 WebAssembly）以及服务器端（Java 虚拟机）。

*Quizlet* 是一个流行的教育平台，通过测验辅助学习和练习，它是另一个突显 Kotlin Multiplatform 优势的案例研究。该平台每月约有 5000 万活跃用户，其中 Android 用户达 1000 万。该应用在 Apple App Store 的教育类别中排名前十。

Quizlet 团队曾尝试过 JavaScript、React Native、C++、Rust 和 Go 等技术，但在性能、稳定性和跨平台实现差异方面面临各种挑战。最终，他们选择了在 Android、iOS 和 Web 上使用 Kotlin Multiplatform。以下是使用 KMP 为 Quizlet 团队带来的益处：

* 在封送 (marshaling) 对象时提供了更类型安全的 API。
* iOS 上的评分算法比 JavaScript 快 25%。
* 将 Android 应用的大小从 18 MB 减少到 10 MB。
* 提升了开发者体验。
* 增强了包括 Android、iOS、后端和 Web 开发者在内的团队成员编写共享代码的兴趣。

[![开始使用 Kotlin Multiplatform](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin 提供了简化的代码共享机制

在编程语言的世界中，Kotlin 以其务实的方法脱颖而出，这意味着它优先考虑以下特性：

* **可读性优于简洁性**。虽然简洁的代码很有吸引力，但 Kotlin 明白清晰度至关重要。目标不仅仅是缩短代码，而是消除不必要的模板代码 (boilerplate)，从而增强可读性和可维护性。

* **代码复用优于纯粹的表现力**。这不仅仅是解决许多问题——而是识别模式并创建可复用的库。通过利用现有解决方案并提取共同点， Kotlin 使开发者能够最大限度地提高代码效率。

* **互操作性优于原创性**。Kotlin 并没有重新发明轮子，而是拥抱与 Java 等既有语言的兼容性。这种互操作性不仅允许与庞大的 Java 生态系统无缝集成，还有助于采用经过验证的实践和从以往经验中吸取的教训。

* **安全性和工具支持优于完备性**。Kotlin 使开发者能够尽早捕获错误，确保您的程序不会陷入无效状态。通过在编译期间或在 IDE 中编写代码时检测问题，Kotlin 增强了软件的可靠性，将运行时错误的风险降至最低。

关键的一点是，Kotlin 对可读性、复用、互操作性和安全性的强调使该语言成为开发者的引人注目的选择，并提高了他们的生产力。

### 4. Kotlin Multiplatform 允许灵活的多平台开发

通过 Kotlin Multiplatform，开发者不再需要在原生开发和跨平台开发之间做出艰难选择。他们可以自由选择共享哪些内容以及哪些内容采用原生编写。

在 Kotlin Multiplatform 出现之前，开发者必须以原生方式编写所有内容。

![在 Kotlin Multiplatform 之前：原生编写所有代码](kmp-before-new.svg){width=700}

Kotlin Multiplatform 让您可以选择适合项目的代码共享程度。

1) [同时共享逻辑和 UI](compose-multiplatform-create-first-app.md)：为了实现最大程度的复用和更快的交付，您可以将 Kotlin Multiplatform 与 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 结合使用，不仅共享业务和演示逻辑，还共享用户界面代码。这使得在 Android、iOS、桌面端和 Web 上保持统一的代码库成为可能，同时在需要时仍能与平台特定的 API 集成。这种方法有助于简化开发并确保跨平台的一致行为。

2) [在保留原生 UI 的同时共享逻辑](multiplatform-create-first-app.md)：如果平台特定的视觉行为或 UX 保真度是优先考虑的事项，您可以选择仅共享数据和业务逻辑。通过这种结构，每个平台都保留其原生 UI 层，同时受益于共同、一致的逻辑实现。这种方法非常适合希望在不改变现有 UI 工作流的情况下减少重复工作的团队。

3) [共享一小部分逻辑](multiplatform-ktor-sqldelight.md)：Kotlin Multiplatform 也可以通过共享特定的逻辑子集（如验证、领域计算或身份验证流）来逐步引入。当您希望在不进行重大架构更改的情况下提高跨平台的一致性和稳定性时，此选项非常有效。

![通过 Kotlin Multiplatform 和 Compose Multiplatform：开发者可以共享业务逻辑、演示逻辑甚至 UI 逻辑](kmp-after-new.svg){width=700}

现在，除了平台特定代码外，您几乎可以共享任何内容。

### 5. 通过 Kotlin Multiplatform 解决方案，您可以共享 UI 代码

JetBrains 提供了 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，这是一个基于 Kotlin 和 Jetpack Compose 的声明式框架，用于跨多个平台共享用户界面，包括 Android（通过 Jetpack Compose）、iOS、桌面端和 Web（Beta）。

*Instabee* 是一个专门为电子商务企业提供最后一公里物流服务的平台，在该技术仍处于 Alpha 阶段时，他们就开始在 Android 和 iOS 应用程序中使用 Compose Multiplatform 来共享 UI 逻辑。

有一个名为 [ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer) 的 Compose Multiplatform 官方示例，它可以在 Android、iOS、桌面端和 Web 上运行，并集成了地图和相机等原生组件。还有一个社区示例，[New York Times App](https://github.com/xxfast/NYTimes-KMP) 克隆版，它甚至可以在智能手表操作系统 Wear OS 上运行。查看此 [Kotlin Multiplatform 和 Compose Multiplatform 示例](multiplatform-samples.md)列表以了解更多示例。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. 您可以在现有和新项目中使用 Kotlin Multiplatform

让我们来看看以下两种场景：

* **在现有项目中使用 KMP**

  再次以百度的 Wonder App 为例。团队已经拥有了 Android 和 iOS 应用，他们只是统一了逻辑。他们开始逐步统一更多的库和逻辑，最终实现了跨平台共享的统一代码库。

* **在新项目中使用 KMP**

  *9GAG* 是一个在线平台和社交媒体网站，他们尝试了 Flutter 和 React Native 等不同技术，但最终选择了 Kotlin Multiplatform，这使他们能够统一应用在两个平台上的行为。他们首先创建了一个 Android 应用。然后，他们在 iOS 上将 Kotlin Multiplatform 项目作为依赖项进行调用。

### 7. 通过 Kotlin Multiplatform，您可以开始逐步共享代码

您可以循序渐进地开始，从常量等简单元素开始，逐步迁移电子邮件验证等通用工具。您还可以编写或迁移业务逻辑，例如交易流程或用户身份验证。

> 我们与 Google 团队合作，以 Jetcaster 为例，创建了一个实用的迁移指南，其中包括一个每个提交 (commit) 都代表一个工作状态的仓库。
> [查看如何逐步从 Android 迁移到 Kotlin Multiplatform](migrate-from-android.md)。
{style="note"}

### 8. Kotlin Multiplatform 已被全球公司使用

KMP 已被全球许多大型公司使用，包括 Forbes、Philips、Cash App、Meetup、Autodesk 等等。您可以在 [案例研究页面](https://kotlinlang.org/case-studies/?type=multiplatform) 上阅读他们的所有故事。

2023 年 11 月，JetBrains 宣布 Kotlin Multiplatform 现已进入 Stable (稳定版)，吸引了更多公司和团队对该技术的关注。在 Google I/O 2024 上，Google 宣布 [官方支持使用 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html) 在 Android 和 iOS 之间共享业务逻辑。

### 9. Kotlin Multiplatform 提供强大的工具支持

在开发 Kotlin Multiplatform 项目时，您可以利用触手可及的强大工具。

* **IntelliJ IDEA**。通过 IntelliJ IDEA 2025.2.2，您可以安装 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)，该插件提供 iOS 应用的基本启动和调试功能、预检环境检查以及其他实用的 KMP 功能。
* **Android Studio**。Android Studio 是另一个用于 Kotlin Multiplatform 开发的稳定解决方案。通过 Android Studio Otter 2025.2.1，您可以安装相同的 Kotlin Multiplatform IDE 插件，以获得基本的 iOS 启动和调试支持、预检环境检查以及额外的多平台工具。
* **Compose Hot Reload**：[Compose Hot Reload](compose-hot-reload.md) 让您在开发 Compose Multiplatform 项目时能够快速迭代和实验 UI 更改。它目前适用于包含桌面端目标并兼容 Java 21 或更早版本的项目。

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**。Apple 的 IDE 可用于创建 Kotlin Multiplatform 应用的 iOS 部分。Xcode 是 iOS 应用开发的标准工具，提供了大量的编码、调试和配置工具。但是，Xcode 仅限 Mac 使用。

### 10. Kotlin Multiplatform 拥有庞大且充满支持的社区

Kotlin 和 Kotlin Multiplatform 拥有一个非常支持的社区。以下是几个您可以找到问题答案的地方。

* [Kotlinlang Slack 工作区](https://slack-chats.kotlinlang.org/)。该工作区拥有约 60,000 名成员，并设有几个专门用于跨平台开发的频道，如 [#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform)、[#compose](https://slack-chats.kotlinlang.org/c/compose) 以及 [#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios)。
* [Kotlin X](https://twitter.com/kotlin)。在这里，您可以找到快速的专家见解和最新动态，包括大量的多平台技巧。
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw)。我们的 YouTube 频道为视觉学习者提供了实用的教程、与专家的直播以及其他优秀的教育内容。
* [Kodee's Kotlin Roundup](https://lp.jetbrains.com/subscribe-to-kotlin-news/)。如果您想紧跟 Kotlin 和 Kotlin Multiplatform 动态生态系统的最新更新，请订阅我们的定期新闻通讯！

Kotlin Multiplatform 生态系统正在蓬勃发展。全球众多的 Kotlin 开发者正在充满热情地培育它。为了帮助社区在这个不断扩展的领域中导航， [klibs.io](http://klibs.io) 提供了一个精心整理的 Kotlin Multiplatform 库目录，使得为常见用例寻找可靠的解决方案变得更加容易。

以下图表显示了每年创建的 Kotlin Multiplatform 库数量：

![每年创建的 Kotlin Multiplatform 库数量](kmp-libs-over-years.png){width=700}

如您所见，2021 年出现了明显的上升，且库的数量自那时起一直保持增长。

## 为什么选择 Kotlin Multiplatform 而非其他跨平台技术？

在选择 [不同的跨平台解决方案](cross-platform-frameworks.topic) 时，权衡其优缺点至关重要。您还可以探索 Kotlin Multiplatform 与其他技术（包括 [React Native](kotlin-multiplatform-react-native.topic) 和 [Flutter](kotlin-multiplatform-flutter.md)）的并排对比。

以下是 Kotlin Multiplatform 可能是您的正确选择的关键原因分解：

* **出色的工具支持，易于使用**。Kotlin Multiplatform 利用 Kotlin，为开发者提供了出色的工具支持和易用性。
* **原生编程**。编写原生内容非常容易。得益于 [expected 和 actual 声明](multiplatform-expect-actual.md)，您可以让您的多平台应用访问平台特定的 API。
* **出色的跨平台性能**。用 Kotlin 编写的共享代码会根据不同的目标平台编译成不同的输出格式：Android 为 Java 字节码，iOS 为原生二进制文件，确保了所有平台上的良好性能。
* **AI 赋能的代码生成**。您可以通过 [Junie](https://www.jetbrains.com/junie/) 赋能的代码生成来加速多平台开发。Junie 是 JetBrains 的编码代理，支持在共享代码和平台特定代码之间实现更高效的工作流。

如果您已经决定尝试 Kotlin Multiplatform，以下是一些可以帮助您入门的技巧：

* **从小处着手**。从小的共享组件或常量开始，让团队熟悉 Kotlin Multiplatform 的工作流和益处。
* **制定计划**。制定清晰的实验计划，假设预期结果以及实施和分析的方法。定义共享代码贡献的角色，并建立有效分发更改的工作流。
* **评估并运行回顾会议**。与您的团队进行一次回顾会议以评估实验的成功情况，并识别任何挑战或改进领域。如果实验对您有效，您可能希望扩大范围并共享更多代码。如果无效，您需要了解该实验失败的原因。

[![查看 Kotlin Multiplatform 的实际运行！现在就开始](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

对于那些想要帮助团队开始使用 Kotlin Multiplatform 的人，我们准备了一份包含实用技巧的 [详细指南](multiplatform-introduce-your-team.md)。

如您所见，Kotlin Multiplatform 已被许多大型公司成功用于构建具有原生外观 UI 的高性能跨平台应用程序，在这些程序之间有效地复用代码，同时保留了原生编程的优势。