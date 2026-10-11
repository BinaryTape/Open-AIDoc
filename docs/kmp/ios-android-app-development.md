[//]: # (title: iOS 与 Android 应用开发：跨平台技术如何提供帮助)

<web-summary>iOS 与 Android 应用开发并不意味着重复劳动。了解跨平台技术与 Kotlin Multiplatform 如何降低成本、加快交付速度并保持应用的原生体验。</web-summary>

*核心要点：*

* 分别构建 iOS 和 Android 应用会导致重复劳动、更高的成本、更慢的发布周期以及频繁的功能对齐（feature parity）问题。
* 跨平台方法通过让团队在两个平台上共享逻辑、架构，甚至有时共享 UI，来缓解这些痛点。
* 基于 Web 和以 UI 为中心的框架能够加快开发速度，但往往会带来性能限制、抽象层以及插件开销。
* Kotlin Multiplatform 提供了一条灵活且渐进式的代码共享路径——提供原生性能、强大的工具支持，并支持通过 Compose Multiplatform 共享从小型模块到完整 UI 的任何内容。
* 选择合适的跨平台策略需要综合评估性能需求、团队技术专长、生态系统成熟度、原生 API 访问能力、长期可维护性以及总体拥有成本。

同时为 iOS 和 Android 构建移动应用，感觉就像是用两艘各自拥有独立船员、工具和规则的船在同一片海域上航行。随着应用规模的扩大和业务需求的增长，重复的工作、分化的功能特性以及维护并行代码库的负担，仅仅是团队所面临挑战的冰山一角。

许多团队不再将 iOS 和 Android 视为完全独立的个体，而是开始整合无需保持差异的层。对于 Kotlin 开发者而言，其范围涵盖从通过 [Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) 共享核心逻辑同时保留原生 UI，到借助 [Compose Multiplatform](https://kotlinlang.org/compose-multiplatform/) 在 Android、iOS、Web 和桌面端同时共享逻辑与 UI。

![渐进式采用 KMP 的示意图：共享部分逻辑且不共享 UI、共享全部逻辑且不共享 UI、共享逻辑与 UI](kmp-graphic.png){width="700"}

跨平台开发不再是一种妥协，而是一项战略抉择。在深入探讨当今的跨平台技术之前，我们先来回顾一下为什么它们能够为[同时构建 iOS 和 Android 应用](build-ios-android-app.topic)的团队带来颠覆性的变革。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="700" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)

## 分别开发 iOS 和 Android 时团队面临的 11 大痛点 {id="11-pains-teams-face-when-developing-for-ios-and-android-separately"}

无论团队经验多么丰富，当同时针对 Android 和 iOS 进行开发时，必然会遇到以下几个问题：

1. *双倍工作量，双倍维护成本* – 所有内容都要构建两次，不仅耗费时间和精力，还将基础升级变成了一场无休止的双轨马拉松。例如，[Perk](https://builders.travelperk.com/compose-multiplatform-at-perk-a-pragmatic-look-at-our-journey-so-far-fedd666e9726)“花费了数年时间将相同的功能重复实现两次”。
2. *持续的功能对齐困境* – 一个平台进展迅速而另一个平台滞后，导致产品节奏紊乱，最终给团队和用户都带来困扰。
3. *不一致的用户体验* – 设计决策可能出现分歧，从而破坏一致性，让您的品牌产品看起来像是两个截然不同的事物。
4. *更高的工程成本* – 维护两套代码库需要更多工程师、精力和资金，这在没有产生额外价值的情况下增加了成本。
5. *更慢的开发周期* – 每个功能都必须跟随进度较慢的平台的节奏，从而拉长了排期并推迟了发布。
6. *更重的测试负担* – 随着每次迭代中设备矩阵和平台特殊特性的增加，QA 团队的工作量成倍增加。
7. *双倍调试工作* – 团队不仅需要构建两次功能，还必须调试两次，在最糟糕的情况下，还要修复相同的错误两次。
8. *团队间的知识孤岛* – 平台专属的技术专长阻碍了协作，使团队沦为孤立的知识孤岛。
9. *产品推进速度降低* – 当团队忙于应付冗余任务，而不是交付新功能或重大改进等实质性变更时，推进势头就会减缓。
10. *平台优先级冲突* – 团队会遇到技术约束，被迫做出无法令两个平台都完全满意的产品妥协。
11. *平台规范的差异*（UI、UX 和导航）– Android 和 iOS 的模式各不相同，需要各自独立的设计路线，从而对凝聚力产生负面影响并拖慢决策制定。

幸运的是，在缓解这些问题方面，您有多种跨平台技术可供选择——每种技术都有各自的优势，但也存在一定的局限性。

## 跨平台开发：化解困境的良方 {id="cross-platform-development-to-the-rescue"}

跨平台移动开发通过在不同平台间共享代码，减少了 iOS 和 Android 应用中的重复工作。不同的方案在权衡取舍、灵活性和原生集成度方面各有不同。如需更深入的介绍，请参阅我们关于[什么是跨平台移动开发](cross-platform-mobile-development.topic)的概述。

### 基于 Web 和混合解决方案 {id="web-based-and-hybrid-solutions"}

这些解决方案允许以 Web 为核心的团队直接使用现有的 JavaScript、CSS 和浏览器工具链，从而降低学习曲线并加快早期开发进度。代码复用能力是一大显著优势，因为单个代码库可以覆盖多个平台且重复率极低。迭代周期通常很快，使团队能够在不经过应用商店审核延迟的情况下发布更新，并且 UI 改进通常所需的工程工作量要少得多。

然而，此类应用提供的性能通常无法与原生解决方案相提并论。复杂的动画、密集的交互以及庞大的数据流在真实设备上往往显得迟缓。访问原生 API 需要依赖桥接（bridge）或插件，这会带来一系列问题，例如脆弱性、版本不匹配和调试复杂性。以此类方式构建的应用通常在离线功能、手势管理和平台特定元素方面表现挣扎。

随着时间的推移，在渲染、响应能力和原生集成方面的限制会不断累积，最终形成极难消除的技术债务。

### 跨平台框架 {id="cross-platform-frameworks"}

像 React Native 和 Flutter 这样的跨平台框架旨在通过提供可在 iOS 和 Android 上运行的共享 UI 层来减少碎片化。它们借助共享的 UI 逻辑、热重载以及由庞大插件生态系统支持的丰富组件库，帮助团队改善功能对齐、加快原型设计并减少重复工作。

权衡之处在于原生平台之上增加了一个额外的抽象层。随着操作系统版本的演进，该抽象层可能会引入新的故障点、不均匀的库质量，并在集成原生 API 或对性能要求苛刻的功能时带来额外的复杂性。有关常用选项的详细了解，请参阅我们对一些[最受欢迎的跨平台应用开发框架](cross-platform-frameworks.topic)的概述。

### Kotlin Multiplatform：借助 Compose Multiplatform 共享代码和 UI {id="kotlin-multiplatform-shared-code-and-uis-with-compose-multiplatform"}

Kotlin Multiplatform 是 JetBrains 推出的一项开源技术，它允许您在 Android、iOS、桌面端、Web 和服务器端之间共享代码，同时保留原生开发的优势。

从初创公司到 Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和哔哩哔哩等科技巨头，[KMP 已被广泛应用于生产环境中](https://kotlinlang.org/case-studies/?type=multiplatform)。他们选择 KMP 是因为它的适应性、原生性能、提供原生用户体验的能力、成本效益，以及易于渐进式采用的特点。

**是什么让 Kotlin Multiplatform 有别于其他跨平台技术？**

* 无需从头重写应用 – 您可以保留现有的 iOS/Android 应用和基础架构，而不必用 Kotlin 重建一切。
* 支持渐进式采用 – 您可以一次针对一个模块、一个功能或一个层级采用 Multiplatform。
* 契合开发者现有的技能储备 – 您的 Kotlin 开发者可以使用他们已熟知的工具为所有平台进行开发，这意味着无需额外招聘，上手成本极低。尤其是 Android 开发者，由于已经具备丰富的 Kotlin 经验，从第一天起就能高效产出。
* 具备极高的灵活性 – 您可以共享离散的模块（如网络请求或存储），然后随着时间推移逐步扩展共享代码。您也可以在保留原生 UI 的同时共享所有业务逻辑，或者逐步将 UI 迁移至 Compose Multiplatform，同时不会失去对原生 UI 组件（包括视频播放器或地图等复杂组件）的访问能力。
* 配备完善的工具链 – IntelliJ IDEA 和 Android Studio 通过 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)为 KMP 提供智能 IDE 支持，其中包括通用 UI 预览、[Compose 热重载](compose-hot-reload.md)以及其他提升开发体验的功能。此外，JetBrains 的 AI 编码智能体 Junie 可以处理 KMP 任务，让您的团队能够更快推进并专注于功能开发。
* 提供原生性能 – 在不希望或无法使用虚拟机的场景下（例如 iOS），Kotlin Multiplatform 利用 Kotlin/Native 生成原生二进制文件并直接访问平台 API。这使得在编写与平台无关的代码的同时，能够实现接近原生的性能：

![Compose Multiplatform 基准测试](compose-multiplatform-benchmarks.png){width="700"}

### Kotlin Multiplatform 尤为适用的场景 {id="scenarios-where-kotlin-multiplatform-is-particularly-helpful"}

Kotlin Multiplatform 可以应对[各种类型的项目](use-cases-examples.md)，从使用 Compose Multiplatform 构建的 MVP 到具有复杂架构的大型业务应用。它的灵活性使团队能够自主选择发布多少代码，而无需遵循“非全即无”的极端策略。这种通用性使 KMP 成为那些希望整合逻辑同时保留特定平台层并确保其 UI 保持原生体验的组织的绝佳选择。

**构建全新起步项目的初创公司**

初创公司可以受益于共享代码库，从而节省时间和资源，这对于 MVP 尤为重要。Kotlin Multiplatform 结合 Compose Multiplatform 能够实现 UI 和逻辑共享、快速原型设计，以及混合使用原生 UI 和共享 UI 的灵活性，帮助团队更快地将应用推向应用商店并交付到用户手中。

**中小型企业**

中小型企业可以通过共享核心逻辑来加速开发，同时根据需求保留使用原生或共享用户界面的选择。Kotlin Multiplatform 支持渐进式采用，降低了开销并支持平台专属的定制。

**大型企业**

拥有大型复杂应用的企业使用 Kotlin Multiplatform 来确保跨平台业务逻辑的一致性。它能够与生产代码良好共存，支持增量集成，并充分利用团队的 Kotlin 技能，而无需引入全新的技术栈。

**外包与代理机构**

代理机构可以受益于 KMP 赋予团队的跨平台代码复用能力，使他们能够以精简的团队满足紧张的项目排期。它在确保应用行为一致的同时加快了交付周期。

**正在扩展到新平台的公司**

KMP 通过复用现有代码库，同时保持原生性能和 UI 灵活性，帮助公司快速进入新平台。这种方法在速度与平台专属体验之间取得了平衡。

**开发 SDK 的团队**

KMP 将共享的 Kotlin 代码编译为平台专属的二进制文件，与原生项目无缝集成。它支持平台 API，并在原生 UI 与跨平台 UI 之间提供灵活性，是 SDK 开发的理想之选。平台团队可以使用各自的语言（如 Swift）便捷地与 Kotlin Multiplatform 库进行交互。

## 如何为您的 iOS 和 Android 项目选择合适的跨平台技术 {id="how-to-choose-the-right-cross-platform-technology-for-your-ios-and-android-project"}

### 明确您的核心需求 {id="identify-your-primary-requirements"}

首先梳理产品的核心所在。它是否需要如丝般顺滑的动画、硬件级功能还是近乎即时的性能响应？

通过及早明确这些需求，您可以建立起选择技术的指南针，从而自然地支持您想要交付的体验——避免后续因框架限制而不得不采用繁琐的变通方案。

### 考虑团队当前的技术能力 {id="consider-your-team-s-current-competencies"}

框架的成效取决于使用它的团队。如果您的工程师在特定技术上已有深厚积累，选择一款与他们能力相辅相成的产品可以保持高昂的士气并实现快速上手。例如，如果您的团队已经拥有扎实的 Kotlin 专业知识，采用 Kotlin Multiplatform 可以让他们在跨平台开发中充分发挥现有技能，减少阻力并加快交付速度。

相反，强行让团队涉足未知领域可能会拖慢进度、引发矛盾并导致技术失误。使解决方案与现有技能相契合有助于保持势头并缩短见效时间。

### 评估生态系统 {id="evaluate-the-ecosystem"}

每个框架的运作都依赖于其所处的环境。高质量的库可以减少重新构建核心组件的需求。频繁的更新，尤其是与操作系统升级同步的更新，是项目健壮且充满活力的标志。

评估这些标准有助于防止您选择一个未来可能停滞不前或无法承受后续需求重负的解决方案。例如，Flutter 开发者可以从 [pub.dev](http://pub.dev) 上的丰富生态中受益，而 Kotlin 团队可以利用 [klibs.io](http://klibs.io) 上的共享库。

移动应用很少是孤立存在的；它们依赖分析工具、支付服务商、身份验证 SDK 和设备功能。请确保您所考虑的框架为您所需的服务提供了可靠且维护良好的插件。在某些领域支持不足会导致诸如变通方案、脆弱的集成或需要编写新原生模块等问题，从而削弱跨平台编程带来的优势。

### 评估与原生 API 的交互能力 {id="evaluate-interaction-with-native-apis"}

并非所有框架与原生 API 的交互表现都同样出色。有些框架提供了深度且文档完备的桥接机制，以整洁且安全的方式公开底层功能。另一些则严重依赖第三方插件或需要编写新的原生模块，这会增加复杂性。
了解这些集成路径的无缝程度、可靠性和适应性至关重要。只有这样，您才能确保未来的功能不会受到框架自身限制的制约。

例如，Kotlin Multiplatform 允许团队在不牺牲原生性能的情况下跨平台共享逻辑。它还允许直接从 Kotlin 无缝访问可用设备 SDK 的全部功能，无需编写任何适配器或桥接函数。

### 查看性能基准测试 {id="check-performance-benchmarks"}

深入检查基准测试数据，特别是冷启动时间、压力下的 UI 响应能力以及整体内存消耗。有些框架在创建简单界面方面表现优异，但在处理动画、手势或大型数据集时显得力不从心。测试真实的性能指标有助于避免应用在面对真实设备和高流量场景时出现意外状况。

例如，将适用于 iOS 的 Compose Multiplatform 1.8.0 性能与原生 iOS 应用进行对比，我们发现：

* 启动时间与原生应用相当，因此两个平台上的首帧渲染速度一样快。
* 即使在高刷新率设备上，滚动性能也与 SwiftUI 持平。
* 与具有相同 UI 逻辑和资源的全原生 SwiftUI 应用相比，Compose Multiplatform 仅为 iOS 应用增加了约 9 MB 的体积。

### 学习曲线 {id="learning-curve"}

评估关于该框架的可用学习资源的数量和质量。
例如，Kotlin Multiplatform 开发者可以使用丰富的教学材料库——[点击此处查看概述](kmp-learning-resources.md)。

### 评估拥有成本 {id="assess-the-cost-of-ownership"}

除了初始开发之外，每个框架都会带来隐性成本。人才储备情况会影响招聘周期和薪资水平。对于不够成熟的库，可能需要自行构建和维护自定义插件。

从已选定的框架迁移可能会非常困难，尤其是当架构决策使应用深度绑定其内部实现时。评估整体生命周期成本有助于您做出经得起时间考验且符合财务效益的抉择。

### 查阅真实案例研究 {id="review-real-world-case-studies"}

案例研究展示了框架在面对现实压力（如扩展问题、性能瓶颈、团队流程和不可预见的限制）时的实际运行表现。开发与您类似应用的团队能提供极具参考价值的见解，因此案例研究可以揭示仅凭技术文档无法展现的盲区。它们还能帮助您了解某项技术在面对拥有大量用户和开发人员的复杂应用时的扩展能力。

一个典型的例子来自 Duolingo，该公司每周在 176 个国家/地区向超过 4000 万日活跃用户发布 iOS 和 Android 版本。Duolingo 开发者分享了他们使用 Kotlin Multiplatform 的经验，阐述了 KMP 如何帮助他们在规模化阶段实现更快的交付：

> 对于 Duolingo 来说，一个令人振奋的趋势是：我们在内部使用 Kotlin Multiplatform 越多，在交付速度上的提升就越显著。事实证明，当你掌握了一项技术后，就会变得非常精通。[……] 现在我们对此充满信心，并且正在不断积累这些知识储备。
>
{style="tip"}

如果您想了解完整故事，可以观看[案例研究视频](https://youtu.be/RJtiFt5pbfs?si=2bSmGci5NXNNfYUn)。

[![探索真实的 Kotlin Multiplatform 用例](kmp-use-cases-1.svg){width="700" style="block"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

### 考量支持组织以确保长期生命力 {id="consider-the-supporting-organization-to-ensure-longevity"}

框架的长期健康状况反映了支持它的组织的稳定性。强大的技术后盾通常意味着持续的投入、频繁的版本迭代以及与行业趋势的紧密契合。

拟选框架的路线图展示了该框架的未来发展方向——以及该路径是否与您项目的发展演进保持一致。选择一个具有长远前景的工具，可以避免团队陷入依赖过时技术的境地。

## 总结 {id="conclusion"}

针对 iOS 和 Android 进行开发，不再必须面对周旋于两个独立世界的繁琐局面。现代跨平台解决方案使团队能够在保持原生品质的同时协同合作、专注投入并加快推进步伐。无论您是共享部分功能还是共享所有代码，这些工具都提供了多样化的技术手段，以契合不同的产品实际情况和团队能力。

随着我们迈向一个以多平台开发为常态而非例外的时代，核心问题不再是在 iOS 和 Android 之间是否要共享代码，而是如何在不损害产品愿景的前提下进行共享。

通过对需求、团队能力、性能预期以及长期可维护性的审慎评估，您可以挑选出能够放大自身优势的解决方案，同时让团队专注于真正重要的事情：为用户拥有的每台设备提供卓越的使用体验。

如果您准备好加快交付步伐、减少重复劳动并重构现代化的移动架构，现在正是探索 Kotlin Multiplatform 及其能为您的团队带来的诸多优势的绝佳时机。