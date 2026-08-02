<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="kotlin-multiplatform-react-native"
       title="Kotlin Multiplatform 与 React Native：跨平台对比">
    <web-summary>探索结合了 Compose Multiplatform 的 Kotlin Multiplatform 与 React Native 在代码共享、生态系统以及 UI 渲染方面的对比，并了解哪种工具栈最适合您的团队。
    </web-summary>
    <tip>
        <p>本对比文章强调了 Kotlin Multiplatform 在跨 Android 和 iOS 提供真正的原生体验以及完整访问平台 API 方面的卓越表现。对于注重性能、可维护性和原生外观与体验的团队，尤其是使用 Compose Multiplatform 共享 UI 代码时，KMP 极具吸引力。与此同时，React Native 可能适合拥有 JavaScript 专业知识的团队，尤其是进行快速原型设计时。</p>
    </tip>
    <p>跨平台开发显著改变了团队构建应用程序的方式，使他们能够通过共享代码库为多个平台交付应用。这种方法简化了开发流程，并有助于确保跨设备的一致用户体验。</p>
    <p>以前，为 Android 和 iOS 构建应用意味着维护两个独立的代码库，且通常由不同的团队负责，这导致了重复劳动以及平台间明显的差异。跨平台解决方案加快了上市时间并提高了整体效率。</p>
    <p>在现有工具中，Kotlin Multiplatform、React Native 和 Flutter 作为三种应用最广泛的选项脱颖出。在本文中，我们将深入研究前两者，以帮助您为您的产品和团队选择合适的方案。</p>
    <chapter title="Kotlin Multiplatform 与 Compose Multiplatform" id="kotlin-multiplatform-and-compose-multiplatform">
        <p><a href="https://www.jetbrains.com/kotlin-multiplatform/">Kotlin Multiplatform (KMP)</a> 是由 JetBrains 开发的一项开源技术，能够跨 Android、iOS、桌面端（Windows、macOS、Linux）、Web 和后端实现代码共享。它允许开发者在多个环境中复用 Kotlin，同时保持原生能力和性能。</p>
        <p>采用率正在稳步上升：在过去两次 <a href="https://www.jetbrains.com/lp/devecosystem-2024/">开发者生态系统调查</a> 的受访者中，Kotlin Multiplatform 的使用率在短短一年内增长了一倍多——从 2024 年的 7% 增加到 2025 年的 18%——这是其发展势头日益增强的明确信号。</p>
        <img src="kmp-growth-deveco.svg"
             alt="在过去两次开发者生态系统调查的受访者中，KMP 的使用率从 2024 年的 7% 增长到 2025 年的 18%"
             width="700"/>
        <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="discover-kmp.svg"
                                                                          alt="发现 Kotlin Multiplatform"
                                                                          style="block"
                                                                          width="500"/></a></p>
        <p>通过 KMP，您可以选择您的共享策略：从共享除应用入口点之外的所有代码，到共享单个逻辑片段（如网络或数据库模块），或者在保持 UI 原生的同时共享业务逻辑。</p>
        <p>为了跨平台共享 UI 代码，您可以使用 <a
                href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/">Compose Multiplatform</a> —— 这是 JetBrains 基于 Kotlin Multiplatform 和 Google 的 Jetpack Compose 构建的现代声明式框架。它在 <a href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/?_gl=1*dcswc7*_gcl_au*MTE5NzY3MzgyLjE3NDk3MDk0NjI.*FPAU*MTE5NzY3MzgyLjE3NDk3MDk0NjI.*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NTA2NzU0MzQkbzM2JGcxJHQxNzUwNjc1NjEwJGo2MCRsMCRoMA..">iOS</a>、Android 和桌面端已达到稳定状态，Web 支持目前处于 Beta 阶段。</p>
        <p><a href="https://www.jetbrains.com/compose-multiplatform/"><img src="explore-compose.svg"
                                                                           alt="探索 Compose Multiplatform"
                                                                           style="block"
                                                                           width="500"/></a></p>
        <p>Kotlin Multiplatform 最初在 Kotlin 1.2（2017 年）中引入，并于 2023 年 11 月达到 <a
                href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/">稳定状态</a>。在 Google I/O 2024 上，Google 宣布 <a
                    href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">正式支持使用 Kotlin Multiplatform</a> 在 Android 和 iOS 之间共享业务逻辑。
        </p>
    </chapter>
    <chapter title="React Native" id="react-native">
        <p>React Native 是一个用于构建 Android 和 iOS 应用程序的开源框架，它使用 <a
                href="https://reactjs.org/">React</a>（一个用于 Web 和原生用户界面的库）以及应用平台的原生能力。React Native 允许开发者使用 JavaScript 访问其平台的 API，并使用 React 组件（可复用、可嵌套的代码包）来描述 UI 的外观与行为。</p>
        <p>React Native 最初于 2015 年 1 月在 React.js Conf 上宣布。同年晚些时候，Meta 在 F8 2015 上发布了 React Native，并一直维护至今。</p>
        <p>虽然 Meta 监管 React Native 产品，但 <a
                href="https://github.com/facebook/react-native/blob/HEAD/ECOSYSTEM.md">React Native 生态系统</a> 由合作伙伴、核心贡献者和活跃的社区组成。如今，该框架得到了全球个人和公司的贡献支持。</p>
    </chapter>
    <chapter title="Kotlin Multiplatform vs. React Native：横向对比"
             id="kotlin-multiplatform-vs-react-native-side-by-side-comparison">
        <table style="both">
            <tr>
                <td></td>
                <td><b>Kotlin Multiplatform</b></td>
                <td><b>React Native</b></td>
            </tr>
            <tr>
                <td><b>创建者</b></td>
                <td>JetBrains</td>
                <td>Meta</td>
            </tr>
            <tr>
                <td><b>语言</b></td>
                <td>Kotlin</td>
                <td>JavaScript, TypeScript</td>
            </tr>
            <tr>
                <td><b>灵活性与代码复用</b></td>
                <td>共享您想要的代码库的任何部分，包括业务逻辑和/或 UI，比例从 1% 到 100% 不等。可以逐步采用，也可以从头开始构建具有原生感的跨平台应用。
                </td>
                <td>跨平台复用业务逻辑和 UI 组件，从单个功能到完整应用。将 React Native 添加到现有的原生应用程序中以构建新屏幕或用户流。
                </td>
            </tr>
            <tr>
                <td><b>软件包、依赖项与生态系统</b></td>
                <td>软件包可从 <a href="https://central.sonatype.com/">Maven Central</a> 和其他仓库获取，包括：
                    <p><a href="https://klibs.io">klibs.io</a>，旨在简化 KMP 库的搜索。</p>
                    <p>此 <a href="https://github.com/terrakok/kmp-awesome">列表</a> 包含了一些最受欢迎的 KMP 库和工具。</p></td>
                <td><a href="https://reactnative.dev/docs/libraries">React Native 库</a> 通常使用 Node.js 软件包管理器（如 <a href="https://docs.npmjs.com/cli/npm">npm CLI</a> 或 <a href="https://classic.yarnpkg.com/en/">Yarn Classic</a>）从 <a href="https://www.npmjs.com/">npm 注册表</a> 安装。
                </td>
            </tr>
            <tr>
                <td><b>构建工具</b></td>
                <td>Gradle（针对 Apple 平台的应用还需 Xcode）。</td>
                <td>React Native 命令行工具和 <a href="https://metrobundler.dev/">Metro 打包器</a>，它们在底层为 Android 调用 Gradle，为 iOS 调用 Xcode 构建系统。
                </td>
            </tr>
            <tr>
                <td><b>目标环境</b></td>
                <td>Android, iOS, Web, 桌面端, 以及服务器端。</td>
                <td>Android, iOS, Web, 以及桌面端。
                    <p>对 Web 和桌面端的支持通过社区和合作伙伴领导的项目提供，例如 <a
                            href="https://github.com/necolas/react-native-web">React Native Web</a>、<a
                            href="https://github.com/microsoft/react-native-windows">React Native Windows</a> 和 <a
                            href="https://github.com/microsoft/react-native-macos">React Native macOS</a>。</p></td>
            </tr>
            <tr>
                <td><b>编译</b></td>
                <td>在桌面端和 Android 上编译为 JVM 字节码，在 Web 上编译为 JavaScript 或 Wasm，在原生平台上编译为平台特定二进制文件。
                </td>
                <td>React Native 使用 Metro 构建 JavaScript 代码和资产。
                    <p>React Native 附带了内置版本的 <a
                            href="https://reactnative.dev/docs/hermes">Hermes</a>，它在构建期间将 JavaScript 编译为 Hermes 字节码。React Native 还支持使用 JavaScriptCore 作为 <a
                                href="https://reactnative.dev/docs/javascript-environment">JavaScript 引擎</a>。</p>
                    <p>原生代码在 Android 上由 Gradle 编译，在 iOS 上由 Xcode 编译。</p></td>
            </tr>
            <tr>
                <td><b>与原生 API 的通信</b></td>
                <td>得益于 Kotlin 与 Swift/Objective-C 及 JavaScript 的互操作性，可以直接从 Kotlin 代码访问原生 API。
                </td>
                <td>React Native 公开了一组 API，用于将您的原生代码连接到 JavaScript 应用程序代码：原生模块 (Native Modules) 和原生组件 (Native Components)。新架构 (New Architecture) 使用 <a
                            href="https://github.com/reactwg/react-native-new-architecture/blob/main/docs/turbo-modules.md">Turbo Native Module</a> 和 <a
                            href="https://github.com/reactwg/react-native-new-architecture/blob/main/docs/fabric-native-components.md">Fabric Native Components</a> 来实现类似的效果。
                </td>
            </tr>
            <tr>
                <td><b>UI 渲染</b></td>
                <td><a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> 可用于跨平台共享 UI，它基于 Google 的 Jetpack Compose，使用兼容 OpenGL、ANGLE（将 OpenGL ES 2 或 3 调用转换为原生 API）、Vulkan 和 Metal 的 Skia 引擎。
                </td>
                <td>React Native 包含一组核心的平台无关原生组件，如 <code>View</code>、<code>Text</code> 和 <code>Image</code>，它们直接映射到平台的原生 UI 构建块，例如 iOS 上的 <code>UIView</code> 和 Android 上的 <code>android.view</code>。
                </td>
            </tr>
            <tr>
                <td><b>UI 开发迭代</b></td>
                <td>即使在公共代码中也可以使用 UI 预览。
                    <p>通过 <a href="compose-hot-reload.md">Compose Hot Reload</a>，您可以立即看到 UI 更改，而无需重启应用或丢失其状态。</p></td>
                <td><a href="https://reactnative.dev/docs/fast-refresh">Fast Refresh</a> 是 React Native 的一项功能，可让您针对 React 组件中的更改获得近乎即时的反馈。
                </td>
            </tr>
            <tr>
                <td><b>使用该技术的公司</b></td>
                <td>
                    <a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>,
                    <a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>, <a
                        href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald's</a>,
                    <a href="https://youtu.be/5lkZj4v4-ks?si=DoW00DU7CYkaMmKc">Google Workspace</a>, <a
                        href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>, <a
                        href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>,
                    <a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>, <a
                        href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>, <a
                        href="https://touchlab.co/">TouchLab</a>, <a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a>，
                    以及更多公司列在我们的 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 案例研究</a>中。</td>
                <td>Facebook, <a href="https://engineering.fb.com/2024/10/02/android/react-at-meta-connect-2024/">Instagram</a>,
                    <a href="https://devblogs.microsoft.com/react-native/">Microsoft Office</a>, <a
                            href="https://devblogs.microsoft.com/react-native/">Microsoft Outlook</a>, Amazon Shopping,
                    <a href="https://medium.com/mercari-engineering/why-we-decided-to-rewrite-our-ios-android-apps-from-scratch-in-react-native-9f1737558299">Mercari</a>,
                    Tableau, <a href="https://github.com/wordpress-mobile/gutenberg-mobile">WordPress</a>, <a
                            href="https://nearform.com/work/puma-scaling-across-the-globe/">Puma</a>, PlayStation App，以及更多公司列在 <a href="https://reactnative.dev/showcase">React Native 展示区</a>。
                </td>
            </tr>
        </table>
        <p>您还可以查看 <a href="kotlin-multiplatform-flutter.md">Kotlin Multiplatform 与 Flutter</a> 的对比。</p>
    </chapter>
    <chapter title="为您的项目选择合适的跨平台技术"
             id="choosing-the-right-cross-platform-technology-for-your-project">
        <p>决定使用哪种跨平台框架并不是要寻找一种“一劳永逸”的解决方案，而是要选择最适合您的项目目标、技术要求和团队专业知识的方案。无论您是在构建一个具有复杂 UI 且功能丰富的产品，还是旨在利用现有技能快速发布，正确的选择都取决于您的具体优先级。请考虑您对 UI 自定义的需求程度、长期稳定性的重要性，以及您计划支持哪些平台。</p>
        <p>对于拥有 JavaScript 经验的团队来说，React Native 可能是一个务实的选择，尤其是在进行快速原型设计时。另一方面，Kotlin Multiplatform 提供了不同层次的集成：它生成全原生的 Android 应用，并在 iOS 上编译为原生二进制文件，能够无缝访问原生 API。UI 可以是全原生的，也可以通过 Compose Multiplatform 共享，后者使用高性能图形引擎进行精美渲染。这使得 KMP 对于那些在受益于代码共享的同时，更看重原生外观与体验、可维护性和性能的团队特别有吸引力。</p>
        <p>您可以在我们关于如何为下一个项目选择合适的 <a
                href="cross-platform-frameworks.topic">跨平台开发框架</a> 的详细文章中找到更多指导。</p>
    </chapter>
    <chapter title="常见问题解答" id="frequently-asked-questions">
        <p>
            <control>问：Kotlin Multiplatform 是否已生产就绪？</control>
        </p>
        <p>答：Kotlin Multiplatform 是一项稳定的技术，已准备好在生产环境中使用。这意味着，即使在最保守的使用场景中，您也可以在生产环境中使用 Kotlin Multiplatform 跨 Android、iOS、桌面端 (JVM)、服务器端 (JVM) 和 Web 共享代码。</p>
        <p>Compose Multiplatform 是一个用于跨平台构建共享 UI 的框架（由 Kotlin Multiplatform 和 Google 的 Jetpack Compose 提供支持），它在 iOS、Android 和桌面端已处于稳定状态。Web 支持目前处于 Beta 阶段。</p>
        <p>如果您想了解有关 Kotlin Multiplatform 总体发展方向的更多信息，请查看我们的博客文章：<a href="https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/">Kotlin Multiplatform 和 Compose Multiplatform 的后续计划</a>。</p>
        <p>
            <control>问：Kotlin Multiplatform 是否比 React Native 更好？</control>
        </p>
        <p>答：Kotlin Multiplatform 和 React Native 各有千秋，选择取决于您项目的具体目标、技术要求和团队专业知识。在上面的对比中，我们概述了代码共享、构建工具、编译和生态系统等方面的关键差异，以帮助您决定哪种方案最适合您的用例。</p>
        <p>
            <control>问：Google 是否支持 Kotlin Multiplatform？</control>
        </p>
        <p>答：在 Google I/O 2024 上，Google 宣布 <a
                href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">正式支持在 Android 上使用 Kotlin Multiplatform</a>，以在 Android 和 iOS 之间共享业务逻辑。</p>
        <p>
            <control>问：学习 Kotlin Multiplatform 值得吗？</control>
        </p>
        <p>答：如果您有兴趣跨 Android、iOS、桌面端和 Web 共享代码，同时保留原生性能和灵活性，那么 Kotlin Multiplatform 值得学习。它由 JetBrains 支持，并由 Google 在 Android 上正式支持以在 Android 和 iOS 之间共享业务逻辑。此外，结合了 Compose Multiplatform 的 KMP 正越来越多地被构建多平台应用的公司采用并投入生产。
        </p>
    </chapter>
</topic>