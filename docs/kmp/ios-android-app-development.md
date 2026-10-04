[//]: # (title: iOS 与 Android 应用开发：跨平台技术如何提供助力)

<web-summary>iOS 与 Android 应用开发并不意味着重复劳动。了解跨平台技术与 Kotlin Multiplatform 如何降低成本、加快交付速度并保持应用的原生特性。</web-summary>

*核心要点：*

* 分别开发 iOS 和 Android 应用会导致重复劳动、更高的成本、更慢的发布速度以及频繁的功能对齐问题。
* 跨平台方法通过让团队在两个平台之间共享逻辑、架构，甚至有时还可以共享 UI，来缓解这些痛点。
* 基于 Web 和以 UI 为中心的框架能够加快开发速度，但往往会引入性能限制、抽象层以及插件开销。
* Kotlin Multiplatform 提供了一条灵活、渐进式的代码共享路径——提供原生性能、强大的工具支持，并可通过 Compose Multiplatform 选择共享从小型模块到完整 UI 的任意内容。
* 选择正确的跨平台策略需要综合评估性能需求、团队专业技术、生态系统成熟度、原生 API 访问能力、长期可维护性以及总体拥有成本。

同时为 iOS 和 Android 构建移动应用，感觉就像是用两艘船航行在同一片海域上，每艘船都有自己的船员、工具和规则。随着应用规模的扩大和业务需求的增长，重复劳动、功能分化以及维护并行代码库的负担，仅仅是团队面临的问题的冰山一角。

许多团队不再将 iOS 和 Android 视为完全独立的个体，而是开始将无需保持差异的层合并起来。在 Kotlin 开发者中，这种实践涵盖了从使用 [Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) 共享核心逻辑并保留原生 UI，到使用 [Compose Multiplatform](https://kotlinlang.org/compose-multiplatform/) 在 Android、iOS、Web 和桌面端之间同时共享逻辑和 UI。

![逐步采用 KMP 的示意图：共享部分逻辑而不共享 UI、共享全部逻辑而不共享 UI、共享逻辑和 UI](kmp-graphic.png){width="700"}

跨平台开发已不再是一种妥协，而是一种战略选择。在探索当今的跨平台技术之前，我们先来回顾一下为什么它们对于[同时面向 iOS 和 Android 进行构建](build-ios-android-app.topic)的团队来说是如此颠覆性的变革。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="700" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)

## 团队分别开发 iOS 与 Android 应用时面临的 11 大痛点 {id="11-pains-teams-face-when-developing-for-ios-and-android-separately"}

不论团队经验多么丰富，在同时面向 Android 和 iOS 进行构建时，都难免会遇到以下至少几个问题：

1. *双倍工作量，双倍维护成本* – 所有内容都要构建两次，这耗费了大量的时间和精力，将基础升级变成了无休止的双轨马拉松。例如，[Perk](https://builders.travelperk.com/compose-multiplatform-at-perk-a-pragmatic-look-at-our-journey-so-far-fedd666e9726) “花了数年时间将相同的功能重新实现两次”。
2. *无休止的功能对齐困境* – 一个平台进展迅速，而另一个平台滞后，导致产品节奏不稳定，最终令团队和用户都感到困扰。
3. *分化的用户体验* – 设计决策可能会出现分歧，从而破坏一致性，使您的品牌看起来像是两个完全不同的产品。
4. *更高的工程成本* – 拥有两个代码库需要更多的工程师、精力和资金，这在没有产生额外价值的情况下增加了成本。
5. *更慢的开发周期* – 每个功能都必须迁就进度较慢的平台，拉长了排期并推迟了发布。
6. *更繁重的测试负担* – 随着每次迭代中设备矩阵和平台特异性问题的增加，QA 团队的工作量也会翻倍。
7. *双倍调试* – 团队不仅需要构建两次功能，还必须调试两次，在最坏的情况下，还要修复相同的错误两次。
8. *团队之间的知识孤岛* – 平台特定的专业知识阻碍了协作，使团队变成了孤立的知识岛屿。
9. *产品推进速度降低* – 当团队疲于应对冗余任务，而不是交付新功能或重大改进等实质性变更时，势头就会减弱。
10. *平台优先级冲突* – 团队会遇到技术限制，被迫做出无法完全满足任何一方平台的产品妥协。
11. *平台约定存在差异*（UI、UX 和导航）– Android 和 iOS 的模式各不相同，需要独特的专门设计路径，这会对内聚性产生负面影响，并拖慢决策制定。

幸运的是，在缓解这些问题方面，您有多种跨平台技术可供选择——每种技术都有自己的优势，但也存在一定的局限性。

## 跨平台开发前来破局 {id="cross-platform-development-to-the-rescue"}

移动跨平台开发通过在多平台之间共享代码，减少了 iOS 和 Android 应用中的重复工作。不同的方案在权衡取舍、灵活性和原生集成度方面各有不同。如需更深入的介绍，请参阅我们关于[什么是跨平台移动开发](cross-platform-mobile-development.topic)的概述。

### 基于 Web 与混合解决方案 {id="web-based-and-hybrid-solutions"}

这些解决方案允许专注于 Web 的团队使用现有的 JavaScript、CSS 和浏览器工具链，从而降低学习曲线并加快早期开发工作。复用代码的能力是一大显著优势，因为单个代码库可以覆盖多个平台，同时最大限度地减少重复。迭代周期通常很快，使团队能够避开应用商店的审核延迟直接发布更新，并且 UI 改进通常只需要显著减少的工程工作量。

然而，此类应用所提供的性能通常无法与原生解决方案相提并论。在真实设备上，复杂的动画、繁重的交互和庞大的数据流往往会显得迟缓。访问原生 API 需要桥接或插件，这会带来一系列问题，如脆弱性、版本不匹配和调试复杂性。以此类方式构建的应用往往难以良好处理离线功能、手势管理和平台特定元素。

随着时间的推移，渲染、响应速度和原生集成方面的限制会不断累积，导致极难消除的技术债务。

### 跨平台框架 {id="cross-platform-frameworks"}

像 React Native 和 Flutter 这样的跨平台框架旨在通过提供在 iOS 和 Android 上运行的共享 UI 层来减少碎片化。它们通过共享 UI 逻辑、热重载以及由庞大插件生态系统支持的丰富组件库，帮助团队改善功能对齐、加快原型设计并减少重复劳动。

其代价是在原生平台之上增加了一个额外的抽象层。随着操作系统版本的演进，该层可能会引入新的故障点、不均衡的库质量，并在集成原生 API 或对性能要求严苛的功能时带来额外的复杂性。如需深入了解广泛使用的选项，请参阅我们对一些[最受欢迎的跨平台应用开发框架](cross-platform-frameworks.topic)的概述。

### Kotlin Multiplatform：通过 Compose Multiplatform 共享代码与 UI {id="kotlin-multiplatform-shared-code-and-uis-with-compose-multiplatform"}

Kotlin Multiplatform 是 JetBrains 推出的一项开源技术，它允许您在 Android、iOS、桌面、Web 和服务器之间共享代码，同时保留原生开发的优势。

[KMP 已在生产环境中被广泛采用](https://kotlinlang.org/case-studies/?type=multiplatform)，用户涵盖从初创公司到 Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和哔哩哔哩等科技巨头。他们选择 KMP 是因为它的适应性、原生性能、提供原生用户体验的能力、成本效益以及逐步采用的便利性。

**是什么让 Kotlin Multiplatform 与其他跨平台技术有所不同？**

* 无需从头重写应用 – 您可以保留现有的 iOS/Android 应用和基础架构，而无需用 Kotlin 重建一切。
* 支持增量采用 – 您可以一次针对一个模块、一个功能或一个层级采用 Multiplatform。
* 契合开发者现有的技能栈 – 您的 Kotlin 开发者可以使用他们已经熟悉的工具为所有平台进行构建，这意味着无需额外招聘，上手成本极低。Android 开发者尤其可以从第一天起就高效产出，因为他们已经具备丰富的 Kotlin 经验。
* 灵活性 – 您可以共享诸如网络请求或存储等独立的模块，然后随着时间的推移逐步扩展共享代码。您也可以在保留原生 UI 的同时共享所有业务逻辑，或者逐步将 UI 迁移到 Compose Multiplatform，同时不会失去对原生 UI 组件的访问权限，包括视频播放器或地图等复杂组件。
* 拥有完善的工具链支持 – IntelliJ IDEA 和 Android Studio 通过 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)为 KMP 提供智能 IDE 支持，其中包括通用 UI 预览、[Compose Multiplatform 热重载](compose-hot-reload.md)、跨语言导航、重构操作以及跨 Kotlin 和 Swift 代码的调试工具。此外，JetBrains 的 AI 编码智能体 Junie 可以处理 KMP 任务，以便您的团队能够更快地推进并专注于功能开发。
* 提供原生性能 – Kotlin Multiplatform 使用 Kotlin/Native 在不适合或无法使用虚拟机的场景（例如 iOS）下直接生成原生二进制文件并访问平台 API。这使得在编写与平台无关的代码的同时，能够获得接近原生的性能：

![Compose Multiplatform 基准测试](compose-multiplatform-benchmarks.png){width="700"}

### Kotlin Multiplatform 特别有助益的场景 {id="scenarios-where-kotlin-multiplatform-is-particularly-helpful"}

Kotlin Multiplatform 能够应对[各种各样的项目](use-cases-examples.md)，从使用 Compose Multiplatform 构建的 MVP 到具有复杂架构的大规模业务应用程序。其灵活性允许团队自行决定发布多少共享代码，而无需遵循“非全即无”的策略。这种通用性使 KMP 成为那些希望整合逻辑、同时保留平台特定层并确保 UI 保持原生体验的组织的绝佳选择。

**开发全新绿地项目的创业公司**

创业公司能够从共享代码库中获益，从而节省时间和资源，尤其是对于 MVP 而言。Kotlin Multiplatform 结合 Compose Multiplatform 支持 UI 和逻辑共享、快速原型设计，以及混合原生和共享 UI 的灵活性，帮助团队更快地将应用推向应用商店并交付到用户手中。

**中小企业**

中小企业可以通过共享核心逻辑来加速开发，同时根据需求保留使用原生或共享用户界面的选择权。Kotlin Multiplatform 支持渐进式采用，降低了开销并支持平台特定的定制化。

**大型企业**

拥有大型复杂应用的企业使用 Kotlin Multiplatform 来确保跨平台业务逻辑的一致性。它能够成功地与现有生产代码共存，支持增量集成，并充分利用团队的 Kotlin 技能，而无需引入全新的技术栈。

**外包与代理机构**

机构受益于 KMP 赋予团队跨平台复用代码的能力，使他们能够以精简的团队满足紧迫的项目交付周期。它在加快交付速度的同时确保了一致的应用行为。

**拓展至新平台的公司**

KMP 通过复用现有代码库，同时保持原生性能和 UI 灵活性，帮助公司快速进军新平台。这种方法在速度与平台特定体验之间取得了平衡。

**开发 SDK 的团队**

KMP 将共享的 Kotlin 代码编译为平台特定的二进制文件，与原生项目无缝集成。它支持平台 API，并在原生 UI 与跨平台 UI 之间提供灵活性，使其成为 SDK 开发的理想之选。平台团队可以使用他们各自的语言（例如 Swift）便捷地与 Kotlin Multiplatform 库进行交互。

## 如何为您的 iOS 和 Android 项目选择合适的跨平台技术 {id="how-to-choose-the-right-cross-platform-technology-for-your-ios-and-android-project"}

### 明确您的核心需求 {id="identify-your-primary-requirements"}

首先梳理产品的核心。它是否需要极其顺滑的动画、硬件级别的功能还是近乎即时的性能？

通过尽早明确这些要求，您可以为选择能够自然支持所期望体验的技术建立指南，从而避免日后使用需要繁琐变通方案的框架。

### 考量团队现有的能力储备 {id="consider-your-team-s-current-competencies"}

框架的有效性取决于使用它的团队。如果您的工程师在特定技术上投入较深，选择能够补充其能力的产品可以保持高昂的士气并实现快速上手。例如，如果您的团队已经拥有扎实的 Kotlin 专业知识，采用 Kotlin Multiplatform 可以让他们跨平台发挥现有技能，从而减少阻力并加快交付。

相反，强迫团队进入未知领域可能会减慢进度、引发紧张情绪并导致技术错误。让技术方案契合当前的技能储备，可以保持前进势头并缩短见效时间。

### 评估生态系统 {id="evaluate-the-ecosystem"}

每个框架的运作都依赖于其生态环境。高质量的库可以减少重新构建核心组件的需求。频繁的更新，尤其是配合操作系统升级发布的更新，表明该项目稳健且充满活力。

评估这些标准可以防止您选择一个未来可能会停滞不前或在日益增长的需求重压下崩溃的解决方案。例如，Flutter 开发者受益于 [pub.dev](http://pub.dev) 上的丰富生态系统，而 Kotlin 团队则可以利用 [klibs.io](http://klibs.io) 上的共享库。

移动应用很少是孤立存在的；它们依赖于分析工具、支付服务商、身份验证 SDK 和设备功能。请确保您考虑的框架为您所需的服务提供了可靠且维护良好的插件。某些领域的支持不足会导致变通方案、脆弱的集成或编写全新原生模块的需求，从而削弱跨平台开发的优势。

### 评估与原生 API 的交互能力 {id="evaluate-interaction-with-native-apis"}

并非所有框架与原生 API 的交互能力都同样出色。有些框架提供了深入且文档完备的桥接机制，以整洁安全的方式公开底层功能。其他框架则高度依赖第三方插件或需要编写全新的原生模块，这增加了复杂性。
了解这些集成路径的无缝性、可靠性和适应性至关重要。这是确保未来的功能不受框架限制束缚的关键所在。

以 Kotlin Multiplatform 为例，它允许团队在不牺牲原生性能的前提下跨平台共享逻辑。它还允许直接从 Kotlin 无缝访问所有可用的设备 SDK，无需编写任何适配器或桥接函数。

### 查阅性能基准测试 {id="check-performance-benchmarks"}

深入检查基准测试数据，特别是冷启动时间、高负载下的 UI 响应以及整体内存占用。有些框架擅长创建简单的界面，但在处理动画、手势或大型数据集时却力不从心。测试真实性能指标有助于避免应用在真实设备和高流量环境下出现意料之外的问题。

例如，将 Compose Multiplatform 1.8.0 for iOS 与原生 iOS 应用的性能进行对比，我们发现：

* 启动时间与原生应用相当，因此首帧在两个平台上的呈现速度一样快。
* 即使在高刷新率设备上，滑动性能也与 SwiftUI 不相上下。
* 与具有相同 UI 逻辑和资产的完全原生 SwiftUI 应用相比，Compose Multiplatform 仅使 iOS 应用体积增加了约 9 MB。

### 学习曲线 {id="learning-curve"}

评估围绕该框架可用学习资源的数量和质量。
例如，Kotlin Multiplatform 开发者可以使用丰富的教学资料库——[这里有一份概览](kmp-learning-resources.md)。

### 评估拥有成本 {id="assess-the-cost-of-ownership"}

除了初始开发成本外，每个框架都会伴随隐性成本。人才储备情况会影响招聘周期和薪酬成本。在生态不成熟的库中，可能需要自行构建和维护自定义插件。

未来脱离所选框架的迁移可能会非常困难，尤其是当架构决策使您的应用与其内部机制紧密绑定时。评估整个生命周期的总体成本，有助于您做出经得起时间考验且符合财务效益的选择。

### 参考真实案例研究 {id="review-real-world-case-studies"}

案例研究展示了框架在面临真实压力时的表现，例如扩展性问题、性能瓶颈、团队工作流程以及意料之外的限制。开发与您类似应用的团队能提供极具参考价值的见解，因此案例研究可以揭示单靠技术文档无法体现的盲区。它们还可以帮助您了解一项技术在面对拥有庞大用户群体和开发者规模的复杂应用时的扩展表现。

一个很好的例子来自 Duolingo，他们每周在 176 个国家/地区面向超过 4000 万日活跃用户发布 iOS 和 Android 应用。Duolingo 开发者分享了他们使用 Kotlin Multiplatform 的经验，阐述了 KMP 如何帮助他们在规模化阶段实现更快的发布速度：

> 对 Duolingo 来说，一个令人振奋的趋势是，我们在内部使用 Kotlin Multiplatform 越多，就越发现在发布节奏上明显提速。
> 事实证明，只要掌握了它，你就会变得非常擅长。[……]
> 现在我们对它充满了信心，并且正在不断积累这方面的知识。
>
{style="tip"}

如果您想了解完整故事，可以观看[案例研究视频](https://youtu.be/RJtiFt5pbfs?si=2bSmGci5NXNNfYUn)。

[![探索真实世界的 Kotlin Multiplatform 用例](kmp-use-cases-1.svg){width="700" style="block"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

### 考察支持机构以确保长期可行性 {id="consider-the-supporting-organization-to-ensure-longevity"}

框架的长期健康状况反映了支持它的机构的稳定性。强大的后盾通常意味着持续的投资、频繁的修订以及紧跟行业趋势的发展步伐。

预期框架的技术路线图可以让您提前了解该框架的未来发展方向——以及该路径是否与您项目的发展相符。选择一个具有长远前景的工具，可以避免您的团队依赖过时的技术。

## 结语 {id="conclusion"}

面向 iOS 和 Android 构建应用，不再必须像在两个独立的世界之间周旋。现代跨平台解决方案让团队在保持原生品质的同时，能够实现协同、专注和提速。无论您是共享某个功能模块还是共享全部代码，这些工具都能提供多样化的手段来满足不同的产品实际情况和团队能力。

随着我们迈向一个以多平台开发为常态而非例外的时代，核心问题不再是在 iOS 和 Android 之间是否共享代码，而在于如何在不损害产品愿景的前提下进行共享。

通过仔细审视需求、团队能力、性能预期以及长期可维护性，您可以选择一个能够放大自身优势的方案，同时让团队将精力集中在真正重要的事情上：在用户拥有的每一台设备上提供卓越的体验。

如果您已经准备好加快交付、减少重复劳动并实现移动架构的现代化，那么现在正是探索 Kotlin Multiplatform 及其能为您的团队带来的价值的最佳时机。