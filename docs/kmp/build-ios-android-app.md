<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd" id="build-ios-android-app" title="如何开发 Android 与 iOS 应用（以及何时使用 Kotlin Multiplatform）">
  <web-summary>探索如何开发 Android 与 iOS 应用，比较架构和框架，并了解 Kotlin Multiplatform 的适用场景。</web-summary>
  <p>在同时为 iOS 和 Android 进行开发时，第一个重大的决策是架构方面的：是采用完全原生开发，还是通过跨平台方法共享代码？这一选择会影响上市时间、成本以及团队随时间推移面临的复杂度。原生开发可以最大限度地提高平台控制力和精致度，但也需要维护两个代码库。<a href="cross-platform-mobile-development.topic">跨平台</a>开发承诺通过共享逻辑实现更快的交付并降低成本，但也引发了关于性能、灵活性和长期可维护性的正当担忧。</p>
  <p>这不仅仅是一个理论上的争论。根据 <a href="https://devecosystem-2025.jetbrains.com/">2025 开发者生态系统现状</a> 报告，跨平台和代码共享技术的使用率在 2024 年至 2025 年间翻了一倍多，这表明越来越多的团队正在寻找在保持原生质量体验的同时复用代码的方法。</p>
  <!--![在最近两次开发者生态系统调查的受访者中，KMP 的使用率从 2024 年的 7% 增长到 2025 年的 18%](kmp-growth-deveco.svg){width=700}-->
  <img src="kmp-growth-deveco.svg" alt="在最近两次开发者生态系统调查的受访者中，KMP 的使用率从 2024 年的 7% 增长到 2025 年的 18%" width="700"/>
  <p>在本文中，我们将从实际角度审视原生和跨平台方法。我们不会提供一种通用的解决方案，而是将探讨团队在规划、架构和交付中遇到的权衡。你将获得更清晰的对比，并为选择最适合你的产品、团队和约束条件的方案奠定更好的基础。</p>
  <chapter title="如何开发 Android 与 iOS 应用：三种主要的架构方案"
           id="main-architecture-options">
    <p>一旦决定在 iOS 和 Android 上发布应用，下一个战略考虑就是如何构建跨平台的开发结构。这个决定将影响你构建、发布和后续演进应用的方式。</p>
    <chapter title="完全原生开发" id="fully-native-development">
      <p>完全原生开发将 iOS 和 Android 视为不同的产品。你使用 Apple 的工具和框架创建一个应用，使用 Google 的工具和框架创建另一个应用，并使用每个平台的原生语言、UI 系统和 SDK。这两个代码库可能会共享想法和设计，但在技术上保持独立，且每个平台在自己的生态系统和发布周期内演进。</p>
    </chapter>
    <chapter title="跨平台框架（Flutter、React Native 等）" id="cross-platform-frameworks">
      <p><a href="cross-platform-frameworks.topic">跨平台框架</a>（如 Flutter 和 React Native）旨在围绕单一代码库统一开发。这种方法允许团队共享业务逻辑和 UI 代码，通过跨平台层在不同操作系统上渲染应用。其承诺非常直接：一个代码库，两个平台，以及从创意到发布更高效的路径。</p>
    </chapter>
    <chapter title="灵活的代码共享 (Kotlin Multiplatform)" id="flexible-code-sharing">
      <p><a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform (KMP)</a> 提供了更广泛的代码共享选项。它不要求“全有或全无”的决策，而是让团队能够仅共享与产品相关的部分，同时保持构建完全原生体验的灵活性。</p>
      <!--![KMP 渐进式采用示意图：共享部分逻辑且不共享 UI，共享全部逻辑但不共享 UI，共享逻辑和 UI](kmp-graphic.png){width="700"}-->
      <img src="kmp-graphic.png" alt="KMP 渐进式采用示意图：共享部分逻辑且不共享 UI，共享全部逻辑但不共享 UI，共享逻辑和 UI" width="700"/>
      <a href="https://kotlinlang.org/multiplatform/"><img src="discover-kmp.svg" alt="探索 Kotlin Multiplatform" width="600" style="block"/></a>
      <!--[![探索 Kotlin Multiplatform](discover-kmp.svg){width="600" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)-->
      <p>在接下来的部分中，我们将了解这三种方法在实际项目中的运作方式，以及它们对日常开发的意义。</p>
    </chapter>
  </chapter>
  <chapter title="Android 和 iOS 的完全原生开发" id="fully-native-development-for-android-and-ios">
    <p>完全原生开发涉及创建两个独立的应用程序：一个使用 Apple 工具开发 iOS 版，一个使用 Google 工具开发 Android 版。每个平台都有自己的代码库、开发流水线和发布流程。在实践中，你是在构建两个解决相同问题但生存于不同生态系统中的产品。</p>
    <p>这种方法的主要好处是<b>平台忠实度</b>。原生应用直接使用平台的 UI 框架、交互模式和无障碍技术，这使得开发在每种设备上都感觉良好的体验变得更加容易。由于中间没有抽象层，动画、手势和导航都能按预期工作，且没有性能开销。</p>
    <p>另一个主要优势是<b>快速访问平台 API</b>。当 Apple 或 Google 推出新的系统功能、SDK 或硬件能力时，原生应用可以立即集成它们。无需等待跨平台层跟进并暴露这些 API，这对于需要尖端操作系统功能或深度系统集成的产品来说非常重要。</p>
    <chapter title="考量因素" id="native-considerations">
      <p>其中一个权衡是<b>增加的维护成本</b>。两个代码库不可避免地会导致在功能开发、错误修复、测试和长期演进中的重复劳动。维护两个代码库还需要为每个平台雇用专家，这增加了成本并降低了需要同时在各处实施的改进速度。</p>
      <p>当平台特定的 UX 是关键差异点、你希望早期或深度访问操作系统功能，或者你已经拥有成熟且独立的 iOS 和 Android 团队时，原生开发是一个强有力的选择。对于共享逻辑有限但对 UI、性能或硬件集成要求很高的产品，它也是一个很好的解决方案。</p>
    </chapter>
  </chapter>
  <chapter title="用于跨平台移动开发的框架" id="frameworks-for-cross-platform-mobile-development">
    <p>跨平台框架采用了一种直接的方法来进行跨平台开发：它们不创建两个不同的界面，而是使用单一的渲染层来驱动 iOS 和 Android 上的应用。团队创建一套统一的 UI 组件和一个通用的应用程序层，框架将其转换为每个平台可以显示和交互的内容。在实践中，用户界面和业务逻辑一样是可以复用的。</p>
    <p>最明显的优势是<b>提高了 UI 代码复用率</b>。大量的代码（有时甚至是大部分代码）可以包含在单个代码库中。这使得对齐功能和同时向两个平台推送更新变得更加容易。因此，团队通常能更快实现 iOS 和 Android 之间的功能对等，因为新功能、修复和 UI 升级通常只需实现一次。</p>
    <p>当<b>一致性和交付速度比精细的平台细节更重要</b>时，这种范式特别有吸引力。统一的 UI 层消除了平台团队之间的协作开销，同时也简化了规划、测试和发布管理。从产品的角度来看，它还降低了一个平台在功能或视觉设计上落后于另一个平台的风险。</p>
    <chapter title="考量因素" id="cross-platform-considerations">
      <p>然而，跨平台框架也带来了<b>抽象的权衡</b>。渲染层位于你的代码和操作系统之间，因此你并非直接使用平台的 UI 框架。虽然这种抽象抹平了许多差异，但它可能会使某些原生行为、交互或边缘情况难以定义或调整。当你需要超出抽象层提供的功能时，你经常不得不深入到平台特定的代码中。</p>
      <p>此外还有<b>对生态系统和插件的依赖</b>。框架及其配套工具支持新的操作系统功能、设备能力和第三方 SDK。如果某些内容尚不可用，团队可能不得不等待、构建自定义连接器或调整其路线图。</p>
      <p>简而言之，跨平台框架优化了跨平台的复用和同步，具有明显的优势，也存在结构性的局限。</p>
    </chapter>
  </chapter>
  <chapter title="Kotlin Multiplatform：灵活的代码共享" id="kotlin-multiplatform-flexible-code-sharing">
    <p>Kotlin Multiplatform 的运作方式更像是一系列选项，而非单一的架构选择。它不要求对共享代码库进行“全有或全无”的承诺。团队可以决定共享代码的哪些部分以及何时共享。</p>
    <p>在这个范围的一端，<a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a>（Kotlin Multiplatform 生态系统中的一个声明式 UI 框架）允许团队跨多个平台共享用户界面。当项目受益于统一的设计系统、一致的交互模式以及 iOS 和 Android 上的单一展示层，同时仍编译为原生目标时，这非常有用。在这种设置下，屏幕、导航和 UI 状态驻留在共享代码中，而每个平台保留其应用程序入口点和操作系统特定的集成。</p>
    <a href="https://kotlinlang.org/compose-multiplatform/"><img src="explore-compose.svg" alt="探索 Compose Multiplatform" width="500"/></a>
    <p>你可以将共享限制在系统中一小部分定义明确的部分，例如定价引擎、验证模块或同步策略，这些部分在两个平台上都需要相同的行为。这实现了渐进式采用：团队可以从单个共享模块开始，衡量其影响，并随时间推移进行扩展。随着需求的变化，共享代码和平台特定代码之间的界限可以发生位移。</p>
    <p>对于具有 Kotlin 经验的团队来说，这是一个合乎逻辑的选择。Android 保持使用 Kotlin，iOS 通过使用 Swift 或 SwiftUI 保持原生。目标不是最大化代码共享，而是根据需要共享代码以降低成本或风险，且不约束产品决策。</p>
    <p>在实践中，Kotlin Multiplatform 并不是要在原生和跨平台之间做选择。它是为了保持架构的灵活性，并且仅在能够交付明确、实用价值的地方共享代码。</p>
    <a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-success-stories.svg" alt="从 Kotlin Multiplatform 成功案例中学习" width="500"/></a>
    <chapter title="考量因素" id="flexible-considerations">
      <list>
        <li><b>需要清晰的架构边界：</b> 团队需要决定哪些内容属于共享代码，哪些属于平台代码，这增加了一些架构规划工作。</li>
        <li><b>跨平台协调：</b> 共享模块意味着 Android 和 iOS 团队需要就发布以及共享逻辑的更改达成一致。</li>
        <li><b>生态系统成熟度因用例而异：</b> 某些库或集成可能仍需要平台特定的实现。</li>
      </list>
    </chapter>
  </chapter>
  <chapter title="比较原生、跨平台框架和 Kotlin Multiplatform" id="comparing-native-cross-platform-frameworks-and-kotlin-multiplatform">
    <p>下表总结了原生开发、跨平台框架和 Kotlin Multiplatform 之间的关键区别。</p>
    <table style="both">
      <tr>
        <td></td>
        <td>完全原生开发</td>
        <td>跨平台框架 (Flutter, React Native)</td>
        <td>灵活的代码共享 (Kotlin Multiplatform)</td>
      </tr>
      <tr>
        <td>代码共享</td>
        <td width="250">无</td>
        <td width="250">共享大部分或全部代码</td>
        <td width="250">选择性：从小型模块到应用程序的大部分内容</td>
      </tr>
      <tr>
        <td>UI 策略</td>
        <td>每个平台完全原生 (SwiftUI/UIKit, Compose/Views)</td>
        <td>单一共享 UI 层渲染或桥接到原生</td>
        <td>既可以是完全原生的 UI，也可以通过 Compose Multiplatform 共享 UI</td>
      </tr>
      <tr>
        <td>API 访问</td>
        <td>完全、立即访问所有平台 API</td>
        <td>通过插件/桥接间接访问</td>
        <td>通过平台层完全访问；共享代码保持与平台无关</td>
      </tr>
      <tr>
        <td>最适合场景</td>
        <td>注重平台特定 UX、性能或深层操作系统的应用</td>
        <td>优先考虑单一代码库和更跨平台功能对等的团队</td>
        <td>想要原生 UX 但也想减少业务逻辑重复的团队</td>
      </tr>
      <tr>
        <td>主要权衡</td>
        <td>重复的业务逻辑，更高的开发和维护成本</td>
        <td>对原生 UX 的控制力较弱，且依赖框架/插件生态系统</td>
        <td>需要清晰的架构边界和一定的跨平台协调</td>
      </tr>
    </table>
    <p>通过 Kotlin Multiplatform，团队可以自主选择共享的内容和时机。也许你想从小处着手，只共享业务逻辑或 UI 的一部分，然后随着时间的推移逐渐集成更多内容。这使得共享变成渐进式且可逆的，而不是一次性博弈，从而将架构变成一个灵活、演进的决策，而非固定的承诺。</p>
    <p>你可以在这些对比中深入了解 Kotlin Multiplatform：<a href="https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-flutter.html">Kotlin Multiplatform 和 Flutter</a>，以及 <a href="https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-react-native.html">Kotlin Multiplatform vs. React Native</a>。</p>
  </chapter>
  <chapter title="如何为 Android 和 iOS 应用选择正确的方法"
           id="how-to-choose-the-right-approach">
    <p>在完全原生开发和不同的跨平台解决方案之间做出选择是一个关键的架构决策。</p>
    <chapter title="平台原生 UX 的重要性" id="importance-of-platform-native-ux">
      <p>首先要考虑的维度是平台原生 UX 的重要性。如果你的产品依赖于对平台规范的严格遵守、特殊的交互或深度的操作系统集成，那么保持完整原生 UI 控制的方法可以降低长期风险。如果平台间的视觉和交互差异不那么重要，那么为了提高复用率，共享 UI 层可能是一个合理的权衡。</p>
    </chapter>
    <chapter title="所需逻辑共享的程度" id="degree-of-logic-sharing-required">
      <p>另一个考量因素是所需的逻辑共享水平。某些产品在不同平台上需要类似的业务规则、数据模型和工作流，而另一段产品则受益于共享 UI 层的大部分内容。你和你的团队需要明确系统中哪些组件必须表现一致，哪些组件预期会有所不同。这有助于防止共享不足（重复关键逻辑）和过度共享（强行制造虚假的一致性）。</p>
    </chapter>
    <chapter title="架构决策的可逆性" id="reversibility-of-architectural-decisions">
      <p>架构决策的可逆性是另一个重要的考虑因素。某些选项会将你锁定在特定的结构中，以后更改的代价会很高，尤其是当 UI 和底层功能密不可分时。允许你逐渐移动通用代码和平台特定代码之间边界的架构，可以降低未来转型和重构的成本。</p>
    </chapter>
    <chapter title="预期的产品寿命和演进" id="expected-product-lifespan-and-evolution">
      <p>最后，考虑产品的预期寿命和演进。对于将经历重大变化、增加功能或适应新平台能力的产品，保持职责清晰分离且依赖有限的设计会更受益。目标不是立即实现复用最大化，而是选择一种随着产品的增长和变化使变更变得可控的方法。</p>
    </chapter>
  </chapter>
  <chapter title="双平台开发中的常见错误" id="common-mistakes-in-dual-platform-development">
    <chapter title="将不同平台视为完全相同" id="treating-platforms-as-identical">
      <p>最常见的错误之一是将所有平台视为完全相同。iOS 和 Android 具有不同的用户预期、系统行为和技术限制。在两个平台上使用相同的交互模式或流程可能会让各处的体验都感觉有些偏差，即使实现了功能对等也是如此。功能一致性比视觉或行为的一致性更重要。</p>
    </chapter>
    <chapter title="不考虑 UX 地过度共享 UI" id="oversharing-ui-without-ux-consideration">
      <p>另一个常见问题是不考虑 UX 影响地过度共享 UI。共享屏幕和组件可能会减少开发时间，但也可能抹平平台规范并限制原生交互模式的使用。当用户界面变得过于通用时，产品的可用性、无障碍性和长期精致度都会受到损害。</p>
    </chapter>
    <chapter title="低估维护成本" id="underestimating-maintenance-costs">
      <p>团队经常低估维护成本。双平台应用不仅使测试和发布工作翻倍，还增加了协调开销，暴露出更多边缘情况，并增加了需要支持的操作系统版本和设备范围。忽视这一现实会导致发布流程薄弱并增加技术债务。</p>
    </chapter>
    <chapter title="锁定在不可逆的架构中" id="locking-into-irreversible-architecture">
      <p>致力于不可逆的架构是另一个结构性错误。根据你采取的方法，以后改变关于哪些内容应该共享、哪些应该是平台特定的想法可能会代价高昂。当产品方向或平台需求发生变化时，这些僵化的边界会将常规演进变成大规模的重构工作。</p>
    </chapter>
    <chapter title="忽视团队专业知识" id="ignoring-team-expertise">
      <p>最后，忽视团队专业知识会导致不必要的摩擦。一个在纸面上看起来不错的架构，如果与构建它的人员的技能、经验和工作流不匹配，在实践中可能会失败。可持续的开发速度通常是通过使技术选择与（而非背离）团队的实际工作流对齐来实现的。</p>
    </chapter>
  </chapter>
  <chapter title="常见问题解答" id="faq">
    <p><b>我可以从一个代码库创建 Android 和 iOS 应用吗？</b></p>
    <p>是的，根据你采取的方法，你可以从同一个代码库为两个平台构建应用。Kotlin Multiplatform 允许你选择共享的内容。你可以共享逻辑和 UI，也可以在保持 UI 完全原生的同时共享逻辑，或者只共享一部分逻辑。</p>
    <p><b>跨平台比原生更好吗？</b></p>
    <p>没有哪种方法是普遍更好的；它们针对不同的目标进行了优化。跨平台解决方案通常能减少重复并加快功能对等的速度，但原生开发提供了对平台行为和用户体验的完全控制。正确的选择取决于原生 UX、性能特性和平台特定集成对你的项目有多重要。</p>
    <p><b>通过 Kotlin Multiplatform 可以共享什么？</b></p>
    <p>通过 Kotlin Multiplatform，你可以选择共享的内容。你可以将 Kotlin 与 Compose Multiplatform 结合使用，共享高达 100% 的应用代码（包括 UI），同时仍能与原生 API 集成。或者，你可以共享逻辑但保持 UI 为原生。Kotlin Multiplatform 允许你共享从小型、针对性模块到整个应用程序组件的所有内容。领域模型、业务规则、网络、缓存和状态管理都是可以共享的代码示例。</p>
    <p><b>Kotlin Multiplatform 生产就绪了吗？</b></p>
    <p>是的，Kotlin Multiplatform 已被众多团队用于生产环境，以共享业务逻辑，并在某些情况下共享 UI。核心工具和语言支持保持稳定，而专业库和用例的成熟度则有所不同。与任何架构决策一样，根据你的产品的技术和组织需求对其进行测试至关重要。</p>
    <a href="get-started.topic"><img src="get-started-with-kmp.svg" alt="开始使用 Kotlin Multiplatform" width="500"/></a>
  </chapter>
  <chapter title="结论" id="conclusion">
    <p>构建 Android 和 iOS 应用没有单一的正确方法。关键在于将其视为架构决策而非工具偏好。平台原生 UX 要求、对一致业务逻辑的需求以及未来变更的成本，应该指导你在共享代码和平台特定代码之间划定界限。</p>
    <p>与其优化最大程度的复用，不如优化适应性。像 Kotlin Multiplatform 这样让你能够随时间调整共享内容的方法，往往能随着产品的演进而更好地保持生命力。正确的选择应支持当下的目标，同时使未来的变更变得可控。</p>
  </chapter>
</topic>