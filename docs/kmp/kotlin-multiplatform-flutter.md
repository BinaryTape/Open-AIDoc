# Kotlin Multiplatform 与 Flutter：跨平台开发解决方案

<web-summary>本文探讨了 Kotlin Multiplatform 和 Flutter，帮助您了解它们的功能并为您的跨平台项目选择合适的技术方案。</web-summary> 

在日新月异的技术世界中，开发者一直在寻求高效的框架和工具来帮助他们构建高质量的应用程序。然而，在可用的选项之间进行选择时，切忌过度执着于寻找所谓的“最佳”方案，因为这种方式未必总能带来最适合的选择。

每个项目都是独一无二的，并具有特定的需求。本文旨在帮助您理清选择思路，更深入地了解哪种技术（例如 Kotlin Multiplatform 还是 Flutter）最适合您的项目，从而做出明智的决策。

## 跨平台开发：现代应用程序构建的统一方法 {id="cross-platform-development-a-unified-approach-to-modern-application-building"}

跨平台开发提供了一种使用单一代码库构建可在多个平台运行的应用程序的方法，无需为每个系统重复编写相同的功能。虽然它通常与[移动开发](cross-platform-mobile-development.topic)（同时面向 Android 和 iOS）联系在一起，但该方法的应用远不止于移动端，还涵盖了 Web、桌面甚至服务器端环境。

其核心思想是在最大化代码复用的同时，确保在必要时仍能实现特定于平台的功能，从而简化开发流程并减少维护工作量。团队可以加快开发周期、降低成本并确保跨平台的一致性，这使得跨平台开发成为当今日益多元化的应用程序格局中的明智之选。

## Kotlin Multiplatform 与 Flutter：简化跨平台开发 {id="kotlin-multiplatform-and-flutter-streamlining-development-across-platforms"}

Flutter 和 Kotlin Multiplatform 是两款流行的跨平台技术，能够简化跨不同平台的应用程序开发。

### Flutter {id="flutter"}

[Flutter](https://flutter.dev/) 是一个开源框架，用于从单一代码库构建原生编译的多平台应用程序。它允许您在 Android、iOS、Web、桌面（Windows、macOS、Linux）和嵌入式系统上创建丰富的应用体验——所有这些都来自单一且共享的应用代码库。Flutter 应用使用 Dart 编程语言编写。Flutter 由 Google 提供支持并使用。

Flutter 最初于 2014 年以 Sky 之名推出，[Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/) 于 2018 年 12 月在 Flutter Live 期间正式发布。

Flutter 开发者社区庞大且高度活跃，持续提供改进和支持。Flutter 允许使用由 Flutter 和 Dart 生态系统中的开发者所贡献的共享软件包。

### Kotlin Multiplatform {id="kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)（KMP）是由 JetBrains 构建的开源技术，允许开发者针对 Android、iOS、Web、桌面（Windows、macOS、Linux）以及服务器端创建应用程序，使他们能够在这些平台之间高效复用 Kotlin 代码，同时保留原生编程的优势。

借助 Kotlin Multiplatform，您有多种选择：您可以共享除应用入口点之外的所有代码，共享单项逻辑（例如网络或数据库模块），或者在保留原生 UI 的同时共享业务逻辑。

![Kotlin Multiplatform 是一种可复用高达 100% 代码的技术](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform 最初于 2017 年作为 Kotlin 1.2 的一部分推出。2023 年 11 月，Kotlin Multiplatform 达到稳定状态。在 Google I/O 2024 期间，Google 宣布[支持 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)，用于在 Android 和 iOS 之间共享业务逻辑。

如果您想详细了解 Kotlin Multiplatform 的总体发展方向，请参阅我们的博客文章：[Kotlin Multiplatform 和 Compose Multiplatform 的未来展望](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform {id="compose-multiplatform"}

您可以使用 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 编写跨多个平台的共享 UI 代码。这是由 JetBrains 开发的现代声明式框架，基于 Kotlin Multiplatform 和 Google 的 Jetpack Compose 构建。

Compose Multiplatform 目前在 [iOS 上已达到稳定状态](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)，在 Android 和桌面端也已稳定，而在 Web 端处于 Beta 阶段。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

我们的专题文章概述了 [Compose Multiplatform 与 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md) 之间的关系，重点介绍了二者的关键差异。

### Kotlin Multiplatform 与 Flutter：概述 {id="kotlin-multiplatform-and-flutter-an-overview"}

<table style="both">
    
<tr>
<td></td>
        <td><b>Kotlin Multiplatform</b></td>
        <td><b>Flutter</b></td>
</tr>

    
<tr>
<td><b>创建者</b></td>
        <td>JetBrains</td>
        <td>Google</td>
</tr>

    
<tr>
<td><b>语言</b></td>
        <td>Kotlin</td>
        <td>Dart</td>
</tr>

    
<tr>
<td><b>灵活性与代码复用</b></td>
        <td>可以共享代码库中的任意部分（包括业务逻辑和/或 UI），从 1% 到 100% 均可。</td>
        <td>掌控应用程序的每一个像素，在所有平台上实现 100% 代码共享，创建定制化和自适应设计。</td>
</tr>

    
<tr>
<td><b>软件包、依赖项与生态系统</b></td>
        <td>可从 <a href="https://central.sonatype.com/">Maven Central</a> 以及其他仓库获取软件包，包括
            <p><a href="https://klibs.io">klibs.io</a>，旨在简化 KMP 库的搜索。</p>
            <p>该<a href="https://github.com/terrakok/kmp-awesome">列表</a>包含了一些最热门的 KMP 库和工具。</p> </td>
        <td>可从 <a href="https://pub.dev/">Pub.dev</a> 获取软件包。</td>
</tr>

    
<tr>
<td><b>构建工具</b></td>
        <td>Gradle（面向 Apple 设备的应用需配合 Xcode）。</td>
        <td>Flutter 命令行工具（底层使用 Gradle 和 Xcode）。</td>
</tr>

    
<tr>
<td><b>代码共享</b></td>
        <td>Android、iOS、Web、桌面端和服务器端。</td>
        <td>Android、iOS、Web、桌面端和嵌入式设备。</td>
</tr>

    
<tr>
<td><b>编译</b></td>
        <td>在桌面端和 Android 上编译为 JVM 字节码，在 Web 端编译为 JavaScript 或 Wasm，在原生平台编译为平台特定二进制文件</td>
        <td>Debug 构建在虚拟机中运行 Dart 代码。
        <p>Release 构建为原生平台输出平台特定二进制文件，为 Web 端输出 JavaScript/Wasm。</p>
        </td>
</tr>

    
<tr>
<td><b>与原生 API 的通信</b></td>
        <td>可以使用 <Links href="multiplatform-expect-actual.md" summary="">expect/actual 声明</Links>直接从 Kotlin 代码访问原生 API。</td>
        <td>可以使用<a href="https://docs.flutter.dev/platform-integration/platform-channels">平台通道（platform channels）</a>与宿主平台进行通信。</td>
</tr>

    
<tr>
<td><b>UI 渲染</b></td>
        <td>可以使用 <a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> 实现跨平台 UI 共享。它基于 Google 的 Jetpack Compose，采用 Skia 引擎，该引擎兼容 OpenGL、ANGLE（可将 OpenGL ES 2 或 3 调用转换为原生 API）、Vulkan 和 Metal。</td>
        <td>Flutter 微件使用自研的 <a href="https://docs.flutter.dev/perf/impeller">Impeller 引擎</a>渲染在屏幕上，根据平台和设备的不同，通过 Metal、Vulkan 或 OpenGL 直接与 GPU 通信。</td>
</tr>

    
<tr>
<td><b>UI 开发迭代</b></td>
        <td>即使在公共代码中也可以使用 UI 预览。
        <p>借助 <Links href="compose-hot-reload.md" summary="">Compose Hot Reload</Links>，您可以在无需重启应用或丢失其状态的情况下即时查看 UI 更改。</p></td>
        <td>为 VS Code 和 Android Studio 提供了 IDE 插件。</td>
</tr>

    
<tr>
<td><b>使用该技术的公司</b></td>
        <td>我们的 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 案例研究</a>中列出了 <a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、<a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>、<a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a> 等更多公司。</td>
        <td><a href="https://flutter.dev/showcase">Flutter Showcase</a> 上列出了 <a href="https://flutter.dev/showcase/xiaomi">Xiaomi</a>、<a href="https://flutter.dev/showcase/wolt">Wolt</a>、<a href="https://flutter.dev/showcase/universal-studios">Universal Studios</a>、<a href="https://flutter.dev/showcase/alibaba-group">Alibaba Group</a>、<a href="https://flutter.dev/showcase/bytedance">ByteDance</a>、<a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>、<a href="https://flutter.dev/showcase/ebay">eBay Motors</a>、<a href="https://flutter.dev/showcase/google-pay">Google Pay</a>、<a href="https://flutter.dev/showcase/so-vegan">So Vegan</a> 等更多公司。</td>
</tr>

</table>

[![探索全球公司利用 Kotlin Multiplatform 进行跨平台开发的实际用例。](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

您还可以查看 Google 的博客文章：[让开发者的跨平台开发更加轻松](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)，该文章为如何为您的项目选择合适的技术栈提供了指导。

如果您想了解 Kotlin Multiplatform 与 Flutter 的更多对比，还可以观看 Philipp Lackner 制作的 [KMP 与 Flutter 对比视频](https://www.youtube.com/watch?v=dzog64ENKG0)。在该视频中，他从代码共享、UI 渲染、性能以及这两种技术的未来发展等方面分享了一些有趣的见解。

通过仔细评估您的具体业务需求、目标和任务，您可以确定最符合您要求的跨平台解决方案。