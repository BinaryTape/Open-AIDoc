<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="kmp-for-ios" title="iOS 版 Kotlin Multiplatform：关于集成、性能和工作流的误解">
<show-structure for="chapter,procedure" depth="1"/>
<web-summary>Kotlin Multiplatform 适用于 iOS 吗？了解它如何与 Swift 集成、对性能的影响，以及它如何适配真实的 iOS 开发工作流。</web-summary>
<p>如果你已经从事 iOS 应用开发多年，你可能会有这样的疑问：使用 Kotlin Multiplatform 会损失性能吗？我是否在放弃 Swift 的强大功能和优雅特性？开发者体验会不会像是在使用某种“二等公民”式的权宜之计？
    这些是大多数资深 iOS 工程师在面对 KMP 时都会提出的问题。</p>
<p>本文根据实际使用经验，剖析了 iOS 开发者对 Kotlin Multiplatform 最常见的一些顾虑，旨在让你对 Kotlin Multiplatform 的 iOS 开发实际感受有一个切实的了解。</p>
<chapter title="Kotlin Multiplatform 对 iOS 开发者意味着什么" id="what-kotlin-multiplatform-means-for-ios-developers">
    <p>Kotlin Multiplatform 是一项允许你按需共享代码的技术——从单个模块到大部分业务逻辑，甚至在合适的情况下，还可以使用 <a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a> 共享 UI。</p>
    <p>它并不是要取代原生开发。相反，KMP 让你在跨平台共享代码的同时，能够完全控制哪些部分保持原生。</p>
    <p>在最高层面上，KMP 赋能团队能够：</p>
    <list>
        <li>无缝共享业务逻辑。</li>
        <li>让 Kotlin 代码可以从 Swift 中调用。</li>
        <li>在 Kotlin 代码中充分利用 iOS API 的强大功能。</li>
        <li>使用 Compose Multiplatform 创建可以嵌入 SwiftUI 的屏幕，或者完全用 Kotlin 构建整个用户界面。</li>
        <li>直接从 Kotlin 代码中使用 MapKit 或 AVFoundation 等平台特定框架。</li>
    </list>
    <p><a as="button" href="https://kotlinlang.org/multiplatform/" mode="rock" icon="arrow-right" icon-position="right">探索 Kotlin Multiplatform</a></p>
    <chapter title="KMP 仅仅是又一个跨平台抽象层吗？" id="is-kmp-merely-another-cross-platform-abstraction-layer">
        <p>并非如此——KMP 不会取代 SwiftUI 或 UIKit。相反，它是对原生开发的补充。</p>
        <p>在实践中，这意味着你可以：</p>
        <list>
            <li>利用原生 Swift 代码，在 SwiftUI 或 UIKit 中创建 UI。</li>
            <li>直接访问 iOS API，无需包装器或间接层。</li>
            <li>在任何有价值的地方集成共享代码，而不是默认在所有地方集成。</li>
        </list>
    </chapter>
    <chapter id="is-kmp-useful-for-ios-developers" title="KMP 对 iOS 开发者真的有用吗？">
        <p>虽然 KMP 是 Kotlin 生态系统的一部分，但它并不仅限于 Android——它是一种在跨平台共享功能的通用方法，iOS 团队可以根据自己的需求来使用它。</p>
        <p>对于面临逻辑重复、跨平台行为不一致以及维护成本不断攀升的团队来说，它尤为有用。使用共享层可以消除重复，同时保持完全的原生控制。</p>
        <p>核心原则很简单：</p>
        <list>
            <li>共享合理的部分，例如业务逻辑、数据和网络。</li>
            <li>保持必要的部分原生，例如平台特定的功能，并根据每个项目决定 UI 是共享还是原生。</li>
            <li>随着时间的推移，根据需要调整这种平衡。</li>
        </list>
    </chapter>
    <p>Kotlin Multiplatform 不是一个以 Android 为中心的解决方案；它是一项通用的技术，可以帮助开发团队在不损失原生体验的情况下提高一致性。</p>
    <p>关于 KMP 的性能、复杂性和原生控制权丧失的误解往往流传甚广，但这些并不能准确反映它的实际工作方式。让我们用基于经验的答案来逐一化解这些误解。</p>
</chapter>
<chapter title="误解：跨平台框架会损害 iOS 的性能和体验" id="myth-cross-platform-frameworks-compromise-ios-performance-and-experience">
    <p>一个常见的顾虑是 Kotlin Multiplatform 会损害 iOS 应用的性能或体验。这种假设通常源于以往使用 React Native 等带有桥接器或专有运行时的框架的经验。</p>
    <p>KMP 的运行方式不同。它使用 LLVM（与 Swift 相同的工具链系列）为 iOS 生成共享代码。这里没有 JavaScript 桥接，没有集成的运行时层，在你的代码和 iOS 之间也没有抽象。这意味着你的应用将继续作为完全原生的二进制文件运行，其性能特征与典型的 iOS 开发保持一致。</p>
</chapter>
<chapter title="误解：Kotlin Multiplatform 是一项小众或有风险的技术" id="myth-kotlin-multiplatform-is-a-niche-or-risky-technology">
    <p>你可能仍然会将 Kotlin Multiplatform 与其早期的实验阶段联系在一起。然而，Kotlin Multiplatform 已于 2023 年 11 月正式达到 Stable 状态，并已在所有支持的平台上实现生产就绪。KMP <a href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios">已被</a> 许多知名公司用于真实的、大规模的 iOS 应用程序中，例如 <a href="https://youtu.be/5lkZj4v4-ks?si=OHg0v60urRqxuZZi">Google</a>、<a href="https://2025.kotlinconf.com/talks/812400/">Duolingo</a>、<a href="https://medium.com/booking-com-development/kotlin-multiplatform-in-production-two-real-world-use-cases-from-booking-com-46ffe13a773d">Booking.com</a>、<a href="https://youtu.be/VVf6txPZk3Y?si=6PVoeS8Pa0-QHUsT">Sony</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a> 和 <a href="https://www.youtube.com/watch?v=HSIhkB5bGJs">McDonald's</a>。</p>
    <p>生态系统也在持续成熟：用于 iOS 的 Compose Multiplatform 已在 2025 年达到 Stable 状态，使得除了共享业务逻辑外，构建生产就绪的共享 UI 也成为可能。根据 2025 年 Kotlin Multiplatform 调查，KMP 现在被认为具备生产可行性，约 70% 的插件用户表示满意或非常满意，约 80% 的用户正在使用 Compose Multiplatform。</p>
    <p><a as="button" href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios" mode="rock" icon="arrow-right" icon-position="right">探索真实的 KMP 用例</a></p>
    <p>KMP 由 Kotlin 的开发者 JetBrains 提供支持。它不是一个边缘项目，而是一项战略投资，将通过强大的工具、定期更新和不断增长的生态系统支持持续演进。</p>
    <chapter title="那么，采用 KMP 安全吗？" id="is-it-safe-to-adopt-kmp">
        <p>KMP 已在金融科技、电子商务和移动出行等广泛行业，以及医疗保健、媒体娱乐、旅游和物流等领域经过了实战检验。它得到了积极的维护和升级。最重要的是，它支持渐进式采用，降低了风险。</p>
        <p>核心要点：</p>
        <list>
            <li>你永远不会被锁定，可以根据需要扩大或缩小使用规模。</li>
            <li>即使你停止使用共享代码，你的 iOS 应用仍然保持完全原生。</li>
        </list>
        <p>Kotlin Multiplatform 是一个成熟的、生产就绪的解决方案，各团队目前正利用它来应对真实的跨平台挑战，而无需冒险改变整个架构。</p>
    </chapter>
</chapter>
<chapter title="误解：Kotlin Multiplatform 仅适用于 Android 开发者" id="myth-kotlin-multiplatform-is-only-for-android-developers">
    <p>Kotlin Multiplatform 常被感知为“Android 优先”，iOS 开发者只是顺带参与。</p>
    <p>Kotlin 是一种通用语言，KMP 中的共享代码只是代码库的另一个方面，并不是由单一平台拥有的。iOS 开发者可以阅读并贡献代码，塑造 API，并影响跨平台设计。</p>
    <p>在实践中，各团队采用不同的模式。许多 iOS 开发者继续主要使用 Swift 工作，尤其是在 UI 密集型功能上，而共享业务逻辑则由团队协作开发，或由专注于跨平台代码的工程师开发。</p>
    <p>这带来了更好的协作：团队共同拥有逻辑的所有权，减少了不一致性，并能一次性修复问题，避免了重复劳动。</p>
    <chapter title="你会作为 iOS 开发者被边缘化吗？" id="will-you-be-sidelined-as-an-ios-developer">
        <p>KMP 并不会贬低 iOS 工程师；它将他们的角色扩展到了共享层，使他们在保持对原生体验所有权的同时，拥有平等的影向力。如果你愿意，iOS UI 可以保持原生，Swift 依然至关重要，iOS 开发者保留对平台决策的控制权。</p>
    </chapter>
</chapter>
<chapter title="误解：我的 iOS 工作流将变得更加复杂" id="myth-my-ios-workflow-will-become-more-complicated">
    <p>关于 KMP 的主要顾虑之一是它可能会干扰已建立的 iOS 工作流。如果你已经经历了 Objective-C → Swift → SwiftUI 的转变以及不断的工具链更迭，增加“又一个东西”的想法可能会让人感到疲惫。这种顾虑是合理的，这也正是 Kotlin Multiplatform 被设计为渐进式采用而非一蹴而就的原因。</p>
    <p>你不需要一夜之间接受一套全新的工具链。对于许多 iOS 开发者来说，可以从仅消费一个共享模块开始使用 KMP。这意味着在评估其有用性时，你的日常工作流可以保持相对不受影向。</p>
    <p>随着深入使用，学习曲线是平缓的，而非全盘接收：</p>
    <list>
        <li>从使用共享的 Kotlin API 开始。</li>
        <li>学习足够的 Kotlin 知识以阅读和排查共享代码。</li>
        <li>在合适的情况下为共享逻辑做贡献。</li>
    </list>
    <chapter title="采用 KMP 会拖慢你的速度吗？" id="will-adopting-kmp-slow-you-down">
        <p>理解配置确实需要一些初始开销。但使用共享逻辑并避免并行实现可以节省时间，而且工具比你预期的要轻量：</p>
        <list>
            <li>无需更换 Xcode 作为你的主要环境。</li>
            <li>不强制迁移到陌生的 UI 框架。</li>
            <li>构建序列的复杂性通常在你的主 iOS 工作流之外进行管理。</li>
        </list>
        <p>你可以继续以一贯的方式创建 iOS 应用。KMP 只是为其增加了一个共享层，在为你提供额外自由的同时，并不要求你完全重置。</p>
    </chapter>
</chapter>
<chapter title="误解：Kotlin Multiplatform 会生成不地道的 Swift API" id="myth-kotlin-multiplatform-produces-non-idiomatic-swift-apis">
    <p>Kotlin Multiplatform 中的 Swift 互操作性仍然是一个受关注的问题。目前，Kotlin 代码是通过 Objective-C 桥接呈现给 iOS 的，这可能会让 Swift API 感觉不够自然，特别是在命名、为 null 性、泛型或异步模式方面。</p>
    <p>是的，如果管理不当，它确实感觉不像 Swift。然而，如果在开发共享代码时考虑到 iOS，构建优秀的 Swift API 是可能的。以下是一些最佳做法：</p>
    <list>
        <li>保持 API 简单且目标明确。</li>
        <li>避免无法正确转换的 Kotlin 模式。</li>
        <li>根据需要添加薄薄的 Swift 包装器。</li>
        <li>直接在 Xcode 中验证 API。</li>
    </list>
    <p>你还可以观看演讲录像“<a href="https://youtu.be/P_5ZEtK05kc?si=qgnAPV5_MwAEn0RJ">Kotlin Multiplatform 炼金术：让你的 Swift 互操作点石成金</a>”。</p>
    <p>Kotlin 的新工具——特别是 <a href="https://kotlinlang.org/docs/native-swift-export.html">Swift Export</a> ——正在迈向一个未来的愿景，即 Kotlin API 将更直接、更地道地与 Swift 集成，从而进一步减少摩擦。</p>
    <p>Swift Export 旨在移除 Objective-C 层，而 <a href="https://github.com/kotlin-hands-on/kotlin-swift-interopedia">Interopedia</a> 则作为实用文档，帮助开发者了解 Kotlin 代码是如何暴露给 Swift 的，以及应该预期哪些模式。像 <a href="https://github.com/rickclephas/KMP-NativeCoroutines">KMP-NativeCoroutines</a> 和 <a href="https://github.com/touchlab/SKIE">SKIE</a> 这样的库更进一步，磨平了当前互操作模型中的棱角，改进了协程映射到 Swift async/await 的方式，并使生成的 API 对 Swift 更加友好。</p>
</chapter>
<chapter title="误解：共享 UI 意味着失去原生的 iOS 体验" id="myth-sharing-ui-means-losing-native-ios-experience">
    <p>一种普遍的错觉是，使用 Kotlin Multiplatform 需要放弃完全原生的 iOS UI。事实并非如此。</p>
    <p>KMP 根本不要求共享 UI。你可以只共享底层功能，而让其余部分保持原生：</p>
    <list>
        <li>UI 可以使用 SwiftUI 或 UIKit 编写，利用原生 Swift 代码。</li>
        <li>动画和交互可以保持完全原生。</li>
        <li>平台 API 可以直接访问，无需包装器。</li>
    </list>
</chapter>
    <chapter title="那么，你的应用会不再感觉像是一个 iOS 应用吗？" id="so-will-your-app-no-longer-feel-like-an-ios-app">
    <p>不会，因为没有必要放弃原生 UI。</p>
    </chapter>
    <chapter title="你必须使用共享 UI 吗？" id="do-you-have-to-use-a-shared-ui">
    <p>这一策略完全是可选的，由每个团队自行定义。核心前提很简单：Kotlin Multiplatform 不会限制你设计界面的方式。你可以使用 SwiftUI 或 UIKit 保持完全原生的 UI，使用 Compose Multiplatform 引入共享 UI，或者根据你的需求结合这两种方法。</p>
    <p>你最常用的屏幕（如仪表板和核心产品流程）通常最好使用完全原生的 UI 实现，这样可以发挥最大性能和平台特定的打磨。对于影向力较低的区域，Compose Multiplatform 非常契合。诸如设置页面或不常使用的流程（如身份验证）是共享 Compose UI 的理想候选，在这些地方，开发速度和代码重用比深度原生优化的需求更重要。</p>
    <p>重要的是，Compose Multiplatform 与传统的 iOS UI 之间存在互操作性，这意味着你可以将共享组件与原生视图并排嵌入，或者随着时间的推移逐步采用它们。这允许团队在不预先承诺单一方法的情况下演进其 UI 策略。</p>
    </chapter>
<p><a as="button" href="https://kotlinlang.org/compose-multiplatform/" mode="rock" icon="arrow-right" icon-position="right">探索 Compose Multiplatform</a>
    </p>
<chapter title="误解：采用 Kotlin Multiplatform 意味着不再需要 Swift" id="myth-adopting-kotlin-multiplatform-means-no-more-swift">
    <p>一个常见的担忧是，引入 Kotlin Multiplatform 会使 Swift 变得过时。但 KMP 并不是来取代它的——Swift 仍然是 iOS 开发的核心。</p>
    <p>你继续为所有让 iOS 应用感觉像 iOS 的部分编写 Swift 代码：</p>
    <list>
        <li>使用 SwiftUI 或 UIKit 的 UI。</li>
        <li>导航、动画和用户交互。</li>
        <li>平台特定的功能和集成。</li>
        <li>应用生命周期和系统 API。</li>
    </list>
    <p>KMP 只是在旁边增加了一个共享层。这意味着 iOS 开发者继续拥有原生体验，共享业务逻辑通常是跨平台的共同努力，一些 iOS 工程师会贡献 Kotlin 代码，而另一些则主要关注 Swift。</p>
    <chapter title="那么，你会停止编写 Swift 吗？" id="will-stop-writing-swift">
    <p>不会，你仍然会将大部分时间花在 Swift 上。而且，随着你对跨平台逻辑获得新见解并影向共享架构决策，你的角色将会得到扩展。</p>
</chapter>
</chapter>
<chapter title="在现有项目中集成 Kotlin Multiplatform iOS" id="kotlin-multiplatform-ios-integration-in-an-existing-project">
    <p>在现有应用中进行 Kotlin Multiplatform iOS 集成的最佳方法是从小处着手。你不必推翻重做应用、重构一切，也不必从第一天起就致力于全盘跨平台。</p>
    <p>在现实中，共享模块通常以以下形式提供给 iOS：</p>
    <list>
        <li>从通用代码创建的框架。</li>
        <li>用于在构建目标中部署的 XCFramework。</li>
        <li>根据团队的工作流，可能会使用 Swift Package Manager 集成依赖项，或者采用自定义设置。</li>
    </list>
    <p>关键点在于集成并不是天生具有侵入性的。你并没有替换应用的架构、UI 层或现有的 Swift 代码。你正在创建一个共享模块，你的 iOS 代码可以在任何合理的地方使用它。</p>
    <p>这就是为什么一个切实的起点通常是一个小的、低风险的区域，例如：</p>
    <list>
        <li>数据模型</li>
        <li>验证逻辑</li>
        <li>网络</li>
        <li>单个功能模块</li>
    </list>
    <p>这允许团队在保持原始 iOS 体验的同时，观察 KMP 如何适配代码库。大多数团队选择渐进式采用：他们引入通用代码来解决特定问题，然后仅在收益切实可见时才进行扩展。这使得所有权易于维护。</p>
    <chapter title="如何安全地开始使用 KMP？" id="how-do-you-start-safely-with-kmp">
        <p>选择一个孤立的问题，限制范围，并将 KMP 视为项目的增量而非重置。</p>
    </chapter>
</chapter>
<p>
    <a as="button" href="get-started.topic" mode="rock" icon="arrow-right" icon-position="right">Kotlin Multiplatform 快速入门</a>
    </p>
<chapter title="何时适合（以及何时不适合）使用 Kotlin Multiplatform" id="when-kotlin-multiplatform-makes-sense-and-when-it-doesnt">
    <p>当 iOS 和 Android 逻辑之间存在重叠，且这种重复开始带来困扰时，Kotlin Multiplatform 就非常有意义。对于那些希望在跨平台共享业务规则、网络、数据处理或领域逻辑的同时保持原生 iOS 体验的团队来说，它尤为有价值。</p>
    <p>KMP 通常在以下情况下是<b>理想选择</b>：</p>
    <list>
        <li>iOS 和 Android 应用使用相同的基础产品逻辑。</li>
        <li>团队需要两次修复相同的错误。</li>
        <li>平台行为持续出现不同步的情况。</li>
    </list>
    <p>它在以下情况下可能<b>不太适合</b>：</p>
    <list>
        <li>应用程序具有高度的平台特定性。</li>
        <li>大部分复杂性存在于 UI 层。</li>
        <li>没有足够的逻辑来证明额外的设置和协调成本是合理的。</li>
    </list>
</chapter>
<chapter title="结论" id="conclusion">
    <p>使用 KMP，你可以减少重复，同时增加一个需要维护的共享层。你在实现一致性的同时，引入了跨团队协调，并保持了原生 UI，但需要接受一定的互操作性和工具复杂性。</p>
    <p>当共享代码能提供清晰的价值时（无论是小的、专注的逻辑片段还是较大的领域层），且不逾越到那些由平台处理更好的领域时，Kotlin Multiplatform 的效果最佳。</p>
</chapter>
<chapter title="常见问题解答" id="frequently-asked-questions">
    <deflist >
        <def title="Android 和 iOS 之间实际可以共享多少代码？">
            没有固定的百分比；大多数团队共享业务逻辑、网络和数据层。确切的数量取决于你的应用以及平台之间的重叠程度。在某些情况下，团队还会选择使用 Compose Multiplatform 共享部分 UI——同时仍然在 iOS 上实现原生的外观和感觉，或者将其与 SwiftUI 或 UIKit 无缝结合。
        </def>
        <def title="Kotlin Multiplatform 会影响 iOS 应用性能吗？">
            没有内在影响。共享代码是原生编译的，因此性能与典型的 iOS 代码相当——问题仅在于代码的编写方式，而非 KMP 本身。
        </def>
    </deflist>
    <p><b>Android 和 iOS 之间实际可以共享多少代码？</b></p>
    <p>没有固定的百分比；大多数团队共享业务逻辑、网络和数据层。确切的数量取决于你的应用以及平台之间的重叠程度。带有 Compose Multiplatform 的 Kotlin Multiplatform 允许你共享多达 100% 的应用代码（包括 UI），同时仍然可以与原生 API 集成。</p>
    <p><b>Kotlin Multiplatform 会影响 iOS 应用性能吗？</b></p>
    <p>没有内在影响。共享代码是原生编译的，因此性能与典型的 iOS 代码相当。</p>
    <p><b>Kotlin Multiplatform 如何与 Swift 配合工作？</b></p>
    <p>共享的 Kotlin 代码会被转换为 Swift 可以使用的原生框架。在当前的模式中，互操作性依赖于 Objective-C 桥接，这可能会引入一些摩擦。展望未来，这一点正在演进：JetBrains 的 Swift Export 旨在完全移除 Objective-C 层，从而实现与 Swift 更加直接、地道的集成。</p>
    <p><b>iOS 开发者需要学习 Kotlin 才能使用 KMP 吗？</b></p>
    <p>不一定。你可以从消费共享的 Kotlin 代码开始，然后在需要调试或做贡献时逐步学习 Kotlin。</p>
    <p><b>我必须通过 Kotlin Multiplatform 共享 UI 吗？</b></p>
    <p>不，UI 共享是可选的。许多团队保持 iOS UI 完全原生，仅共享底层功能。但由于在 iOS 上的效果非常自然，越来越多的公司选择共享 UI 代码。</p>
</chapter>
</topic>