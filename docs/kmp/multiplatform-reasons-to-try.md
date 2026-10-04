[//]: # (title: 采用 Kotlin Multiplatform 为项目注入强劲动力的十大理由)

<web-summary>探索在项目中采用 Kotlin Multiplatform 的十大理由。了解来自企业的真实案例，并开始在多平台开发中使用这项技术。</web-summary>

在当今多元化的技术格局中，开发者面临着构建能够在各平台间无缝运行的应用程序的挑战，同时还要优化开发时间并提高用户生产力。Kotlin Multiplatform (KMP) 提供了一种解决方案，允许你针对多个平台创建应用，促进各平台之间的代码复用，同时保持原生编程的优势。

在本文中，我们将探讨开发者应考虑在现有或新项目中使用 Kotlin Multiplatform 的十大理由，以及 KMP 持续受到广泛关注的原因。

**采用率正在稳步上升：**根据最近两次[开发者生态系统调查](https://devecosystem-2025.jetbrains.com/)，Kotlin Multiplatform 的使用率在短短一年内翻了一倍多——从 2024 年的 7% 增长至 2025 年的 18%。这种快速增长突显了该技术日益强劲的发展势头以及开发者对其寄予的信心。

![在最近两次开发者生态系统调查的受访者中，KMP 使用率从 2024 年的 7% 增长至 2025 年的 18%](kmp-growth-deveco.svg){width=700}

## 为什么应该在项目中尝试 Kotlin Multiplatform {id="why-you-should-try-kotlin-multiplatform-in-your-projects"}

无论你是想提高开发效率还是探索新技术，本文都将对你有所帮助。本文阐述了 Kotlin Multiplatform 的一些实际优势，例如简化开发流程、支持多种平台以及提供强大的工具生态系统。你还可以从中找到来自真实企业的案例研究。

1. [Kotlin Multiplatform 帮助你避免代码重复](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform 支持广泛的平台列表](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin 提供简化的代码共享机制](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform 支持灵活的多平台开发](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [借助 Kotlin Multiplatform 解决方案，你可以共享 UI 代码](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [你可以在现有和新项目中使用 Kotlin Multiplatform](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [借助 Kotlin Multiplatform，你可以循序渐进地开始共享代码](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform 已被全球知名企业采用](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform 提供强大的工具支持](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform 拥有庞大且乐于提供支持的社区](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform 帮助你避免代码重复 {id="1-kotlin-multiplatform-helps-you-avoid-code-duplication"}

最大的中文搜索引擎百度推出了面向年轻受众的应用程序 *Wonder App*。以下是他们在传统应用开发中遇到的一些问题：

* 应用体验不一致：Android 应用的表现与 iOS 应用不同。
* 业务逻辑验证成本高：使用相同业务逻辑的 iOS 和 Android 开发者的工作需要分别进行独立检查，从而导致成本居高不下。
* 升级和维护成本高：重复实现业务逻辑既复杂又耗时，这增加了应用的升级和维护成本。

百度团队决定尝试 Kotlin Multiplatform，首先从统一数据层入手：数据模型、RESTful API 请求、JSON 数据解析和缓存逻辑。

随后，他们决定采用 Model-View-Intent (MVI) 用户界面模式，从而借助 Kotlin Multiplatform 统一界面逻辑。他们还共享了底层数据、处理逻辑以及 UI 处理逻辑。

该实验取得了巨大成功，带来了以下成效：

* 在 Android 和 iOS 应用之间实现了始终如一的体验。
* 降低了维护和测试成本。
* 显著提升了团队内部的生产力。

[![探索 Kotlin Multiplatform 真实用例](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform 支持广泛的平台列表 {id="2-kotlin-multiplatform-supports-an-extensive-list-of-platforms"}

Kotlin Multiplatform 的核心优势之一在于其跨多个平台的广泛支持，使其成为开发者的全能之选。这些平台包括 Android、iOS、桌面端、Web（JavaScript 与 WebAssembly）以及服务器端（Java 虚拟机）。

*Quizlet* 是一款通过测验辅助学习和练习的流行教育平台，它作为另一个案例研究，突显了 Kotlin Multiplatform 的优势。该平台每月拥有约 5000 万活跃用户，其中 1000 万位于 Android 平台。该应用在 Apple App Store 的教育类排行榜中位列前 10 名。

Quizlet 团队曾尝试过 JavaScript、React Native、C++、Rust 和 Go 等技术，但在性能、稳定性和跨平台实现差异方面遇到了各种挑战。最终，他们选择在 Android、iOS 和 Web 上采用 Kotlin Multiplatform。使用 KMP 为 Quizlet 团队带来了如下益处：

* 在编组（marshal）对象时获得类型更安全的 API。
* iOS 上的评分算法比 JavaScript 快 25%。
* Android 应用体积从 18 MB 缩减至 10 MB。
* 提升了开发者体验。
* 激发了包括 Android、iOS、后端和 Web 开发者在内的团队成员编写共享代码的兴趣。

[![开始使用 Kotlin Multiplatform](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin 提供简化的代码共享机制 {id="3-kotlin-provides-simplified-code-sharing-mechanisms"}

在编程语言领域中，Kotlin 以其实用主义风格脱颖而出，这意味着它优先考虑以下特性：

* **可读性优于简洁性**。虽然简短的代码很吸引人，但 Kotlin 认识到清晰明了才是首要的。其目标不仅是缩短代码，更在于消除不必要的模板代码，从而提高可读性和可维护性。

* **代码复用优于单纯的表达力**。这不仅仅是为了解决很多问题，更是为了识别通用模式并创建可复用的库。通过利用现有解决方案并提取共性，Kotlin 使开发者能够将代码效率发挥到极致。

* **互操作性优于独创性**。Kotlin 没有另起炉灶，而是拥抱与 Java 等成熟语言的兼容性。这种互操作性不仅实现了与庞大 Java 生态系统的无缝集成，还促进了对成熟实践以及以往经验教训的采纳。

* **安全性与工具支持优于理论完备性**。Kotlin 使开发者能够尽早发现错误，确保程序不会进入无效状态。通过在编译期间或在 IDE 中编写代码时检测问题，Kotlin 增强了软件的可靠性，最大程度降低了运行时错误的风险。

关键在于，Kotlin 对可读性、复用性、互操作性和安全性的重视，使这门语言成为开发者的有力之选，并有效提升了他们的生产力。

### 4. Kotlin Multiplatform 支持灵活的多平台开发 {id="4-kotlin-multiplatform-allows-for-flexible-multiplatform-development"}

借助 Kotlin Multiplatform，开发者不再需要在原生开发和跨平台开发之间做出二选一的抉择。他们可以自由选择哪些部分共享，哪些部分以原生方式编写。

在 Kotlin Multiplatform 出现之前，开发者必须完全使用原生方式编写所有内容。

![Kotlin Multiplatform 之前：所有代码均需以原生方式编写](kmp-before-new.svg){width=700}

Kotlin Multiplatform 允许你选择适合自身项目的代码共享程度。

1) [同时共享逻辑与 UI](compose-multiplatform-new-project.md)：为了实现最大程度的复用并加快交付速度，你可以将 Kotlin Multiplatform 与 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 相结合，不仅共享业务与展示逻辑，还能共享用户界面代码。这使得在 Android、iOS、桌面端和 Web 之间维护统一的代码库成为可能，同时在需要时仍能与平台专属 API 集成。这种方式有助于简化开发流程，并确保跨平台行为的一致性。

2) [共享逻辑的同时保留原生 UI](multiplatform-upgrade-app.md)：如果平台专属的视觉行为或 UX 保真度是优先考量，你可以选择仅共享数据和业务逻辑。采用这种结构，每个平台都可以保留其原生 UI 层，同时受益于统一、一致的逻辑实现。这种方式非常适合希望减少重复劳动而又无需更改现有 UI 工作流的团队。

3) [共享小部分逻辑](multiplatform-ktor-sqldelight.md)：Kotlin Multiplatform 也可以循序渐进地引入，通过共享部分核心逻辑来实现，例如验证规则、领域计算或身份验证流程。当你希望在不进行大规模架构调整的前提下提升跨平台一致性和稳定性时，这种方案十分契合。

![借助 Kotlin Multiplatform 和 Compose Multiplatform：开发者可以共享业务逻辑、展示逻辑乃至 UI 逻辑](kmp-after-new.svg){width=700}

现在，除平台专属代码外，你几乎可以共享任何内容。

### 5. 借助 Kotlin Multiplatform 解决方案，你可以共享 UI 代码 {id="5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code"}

JetBrains 提供了 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，这是一个基于 Kotlin 和 Jetpack Compose 构建的声明式框架，用于在多个平台之间共享用户界面，涵盖 Android（通过 Jetpack Compose）、iOS、桌面端以及 Web（Beta 版）。

*Instabee* 是一家专注于电子商务业务的最后一公里物流平台，在 Compose Multiplatform 仍处于 Alpha 阶段时，便已开始在其 Android 和 iOS 应用程序中使用它来共享 UI 逻辑。

Compose Multiplatform 提供了一个名为 [ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer) 的官方示例，该示例可在 Android、iOS、桌面端和 Web 上运行，并与地图和相机等原生组件进行了集成。社区中也有一款示例——[New York Times App](https://github.com/xxfast/NYTimes-KMP) 的复刻项目，它甚至可以在智能手表操作系统 Wear OS 上运行。查看此 [Kotlin Multiplatform 与 Compose Multiplatform 示例列表](multiplatform-samples.md)以获取更多案例。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. 你可以在现有和新项目中使用 Kotlin Multiplatform {id="6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects"}

我们来看以下两种场景：

* **在现有项目中使用 KMP**

  百度 Wonder App 就是一个绝佳范例。该团队此前已经拥有了 Android 和 iOS 应用，他们所做的只是统一了其中的逻辑。他们开始逐步统一更多的库和更多的逻辑，最终实现了跨平台共享的统一代码库。

* **在新项目中使用 KMP**

  在线平台兼社交媒体网站 *9GAG* 曾尝试过 Flutter 和 React Native 等不同技术，但最终选择了 Kotlin Multiplatform，这使他们能够统一应用在两个平台上的表现。他们首先创建了 Android 应用，然后将 Kotlin Multiplatform 项目作为依赖项供 iOS 端使用。

### 7. 借助 Kotlin Multiplatform，你可以循序渐进地开始共享代码 {id="7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually"}

你可以循序渐进地开始，从常量等简单元素起步，逐步迁移通用工具类（如电子邮箱验证）。你还可以编写或迁移业务逻辑，例如交易处理或用户身份验证流程。

> 我们与 Google 团队合作，以 Jetcaster 为例创建了一份实用的迁移指南，其中包含一个每次提交都代表可运行状态的仓库。
> [了解如何从 Android 循序渐进地迁移到 Kotlin Multiplatform](migrate-from-android.md)。
{style="note"}

### 8. Kotlin Multiplatform 已被全球知名企业采用 {id="8-kotlin-multiplatform-is-already-used-by-global-companies"}

KMP 已经被全球许多大型企业采用，包括福布斯 (Forbes)、飞利浦 (Philips)、Cash App、Meetup、欧特克 (Autodesk) 等等。你可以在[案例研究页面](https://kotlinlang.org/case-studies/?type=multiplatform)阅读所有这些企业的故事。

2023 年 11 月，JetBrains 宣布 Kotlin Multiplatform 进入稳定版 (Stable)，吸引了更多企业和团队对该技术的关注。在 Google I/O 2024 上，Google 宣布[正式支持使用 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html) 在 Android 与 iOS 之间共享业务逻辑。

### 9. Kotlin Multiplatform 提供强大的工具支持 {id="9-kotlin-multiplatform-provides-powerful-tooling-support"}

在开发 Kotlin Multiplatform 项目时，你可以使用触手可及的强大工具。

* **IntelliJ IDEA**。在 IntelliJ IDEA 2025.2.2 中，你可以安装 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)，它为 iOS 应用提供了基础的启动和调试功能、预检环境检查以及其他实用的 KMP 功能。
* **Android Studio**。Android Studio 是用于 Kotlin Multiplatform 开发的另一个稳定解决方案。在 Android Studio Otter 2025.2.1 中，你可以安装相同的 Kotlin Multiplatform IDE 插件，以获得基础的 iOS 启动和调试支持、预检环境检查以及额外的多平台工具。
* **Compose Hot Reload**：[Compose Hot Reload](compose-hot-reload.md) 允许你在开发 Compose Multiplatform 项目时，快速迭代并体验 UI 更改。它目前适用于包含桌面端目标且与 Java 21 或更早版本兼容的项目。

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**。Apple 的 IDE 可用于构建 Kotlin Multiplatform 应用的 iOS 部分。Xcode 是 iOS 应用开发的事实标准，提供了丰富的编码、调试和配置工具。不过，Xcode 仅可在 Mac 上运行。

### 10. Kotlin Multiplatform 拥有庞大且乐于提供支持的社区 {id="10-kotlin-multiplatform-boasts-a-large-and-supportive-community"}

Kotlin 和 Kotlin Multiplatform 拥有一个非常热情的支持社区。以下是一些可以解答你疑问的去处：

* [Kotlinlang Slack 工作区](https://slack-chats.kotlinlang.org/)。该工作区拥有约 60,000 名成员以及多个专注于跨平台开发的相关频道，如 [#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform)、[#compose](https://slack-chats.kotlinlang.org/c/compose) 以及 [#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios)。
* [Kotlin X](https://twitter.com/kotlin)。在这里，你可以获取专家的快速见解和最新动态，包括海量的多平台使用技巧。
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw)。我们的 YouTube 频道提供实用教程、专家直播以及其他适合视觉学习者的优质教学内容。
* [Kodee 的 Kotlin 综述 (Kodee's Kotlin Roundup)](https://lp.jetbrains.com/subscribe-to-kotlin-news/)。如果你希望紧跟充满活力的 Kotlin 和 Kotlin Multiplatform 生态系统的最新进展，欢迎订阅我们的定期简报！

Kotlin Multiplatform 生态系统正在蓬勃发展，受到全球众多 Kotlin 开发者的热心呵护。为了帮助社区更好地探索这一日益扩大的技术版图，[klibs.io](http://klibs.io) 提供了一份经过整理的 Kotlin Multiplatform 库目录，方便大家更轻松地寻找针对常见用例的可靠解决方案。

下图展示了每年创建的 Kotlin Multiplatform 库数量：

![每年创建的 Kotlin Multiplatform 库数量](kmp-libs-over-years.png){width=700}

正如你所见，2021 年出现了明显的激增，自那以后，库的数量一直在持续增长。

## 为什么选择 Kotlin Multiplatform 而非其他跨平台技术？ {id="why-choose-kotlin-multiplatform-over-other-cross-platform-technologies"}

在[不同跨平台解决方案](cross-platform-frameworks.topic)之间做出选择时，权衡其优缺点至关重要。你还可以查看 Kotlin Multiplatform 与其他技术的横向对比，包括 [React Native](kotlin-multiplatform-react-native.topic) 和 [Flutter](kotlin-multiplatform-flutter.md)。

以下是 Kotlin Multiplatform 成为你理想选择的核心理由：

* **出色的工具支持，简单易用**。Kotlin Multiplatform 充分利用了 Kotlin 的优势，为开发者提供了卓越的工具支持和易用性。
* **原生编程**。以原生方式编写内容非常轻松。借助 [expect 与 actual 声明](multiplatform-expect-actual.md)，你可以让多平台应用顺畅访问平台专属 API。
* **出色的跨平台性能**。用 Kotlin 编写的共享代码会被编译为针对不同目标的不同输出格式：适用于 Android 的 Java 字节码，以及适用于 iOS 的原生二进制文件，从而确保在所有平台上都能具备良好的性能。
* **AI 驱动的代码生成**。你可以借助 [Junie](https://www.jetbrains.com/junie/) 提供的代码生成能力加速多平台开发。Junie 是 JetBrains 打造的编码智能体 (coding agent)，支持在共享代码和平台专属代码之间实现更高效率的工作流。

如果你已经决定尝试 Kotlin Multiplatform，这里有几个技巧可以帮助你顺利入门：

* **从小处着手**。从较小的共享组件或常量开始，让团队逐步熟悉 Kotlin Multiplatform 的工作流及其带来的优势。
* **制定方案**。制定清晰的实验方案，对预期成果、实施方案以及分析方法做出假设。明确共享代码的贡献角色，并建立高效分发变更的工作流程。
* **进行评估并开展复盘**。与团队一起召开复盘会议，评估实验的成效，并找出面临的挑战或需要改进的领域。如果实践效果良好，你可以进一步扩大范围并共享更多代码；如果未能达到预期，则需要分析实验未能成功的根本原因。

[![查看 Kotlin Multiplatform 实际应用！立即开始](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

对于希望帮助团队快速上手 Kotlin Multiplatform 的开发者，我们准备了一份包含实用建议的[详细指南](multiplatform-introduce-your-team.md)。

正如你所见，Kotlin Multiplatform 已经被许多大型企业成功运用于构建具备原生质感 UI 的高性能跨平台应用，在各平台之间高效复用代码的同时，依然完整保留了原生编程的各项优势。