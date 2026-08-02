# Kotlin Multiplatform 与 Flutter：跨平台开发解决方案

<web-summary>本文探讨了 Kotlin Multiplatform 与 Flutter，帮助您了解它们的功能并为您的跨平台项目选择合适的方案。</web-summary> 

在飞速发展的技术世界中，开发者一直在寻求高效的框架和工具来帮助他们构建高质量的应用。然而，在可用的选项之间进行选择时，重要的是避免过度强调寻找所谓的“最佳”选项，因为这种方法并不总能带来最合适的选择。

每个项目都是独特的，并且具有特定的要求。本文旨在帮助您权衡选择，并更好地了解哪种技术（如 Kotlin Multiplatform 或 Flutter）最适合您的项目，以便您做出明智的决策。

## 跨平台开发：现代应用构建的统一方法

跨平台开发提供了一种使用单一代码库构建可在多个平台运行的应用的方法，消除了为每个系统重写相同功能的需求。虽然这种方法通常与[移动开发](cross-platform-mobile-development.topic)（针对 Android 和 iOS）相关联，但它已远远超出了移动端的范畴，涵盖了 Web、桌面端甚至服务器端环境。

核心思想是最大限度地提高代码复用率，同时确保在必要时仍能实现平台特定功能，从而简化开发流程并减少维护工作。团队可以加快开发周期、降低成本并确保各平台之间的一致性，这使得跨平台开发成为当今日益多样化的应用格局中的明智选择。

## Kotlin Multiplatform 与 Flutter：简化跨平台开发

Flutter 与 Kotlin Multiplatform 是两种流行的跨平台技术，它们简化了跨不同平台的应用开发。

### Flutter

[Flutter](https://flutter.dev/) 是一个开源框架，用于从单一代码库构建原生编译的多平台应用。它允许您在 Android、iOS、Web、桌面端（Windows、macOS、Linux）和嵌入式系统上创建丰富的应用体验——所有这些都来自单一的共享应用代码库。Flutter 应用使用 Dart 编程语言编写。Flutter 由 Google 提供支持并使用。

[Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/) 最初于 2014 年以 Sky 的名称推出，并于 2018 年 12 月在 Flutter Live 期间正式发布。

Flutter 开发者社区规模庞大且非常活跃，提供持续的改进和支持。Flutter 允许使用由 Flutter 和 Dart 生态系统中的开发者贡献的共享软件包。

### Kotlin Multiplatform

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) 是由 JetBrains 构建的一项开源技术，允许开发者为 Android、iOS、Web、桌面端（Windows、macOS、Linux）和服务器端创建应用，使他们能够高效地在这些平台之间复用 Kotlin 代码，同时保留原生编程的优势。

使用 Kotlin Multiplatform，您有多种选择：您可以分享除应用入口点之外的所有代码，分享单一部分的逻辑（如网络或数据库模块），或者在保持 UI 原生的同时分享业务逻辑。

![Kotlin Multiplatform 是一项可复用高达 100% 代码的技术](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform 最初作为 Kotlin 1.2 的一部分于 2017 年推出。2023 年 11 月，Kotlin Multiplatform 进入稳定阶段。在 Google I/O 2024 期间，Google 宣布其[支持 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)，用于在 Android 和 iOS 之间分享业务逻辑。

如果您想了解有关 Kotlin Multiplatform 总体方向的更多信息，请查看我们的博客文章：[《Kotlin Multiplatform 与 Compose Multiplatform 的后续发展》](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)。

[![发现 Kotlin Multiplatform](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform

您可以使用 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 在多个平台编写共享的 UI 代码。它是 JetBrains 推出的一款现代声明式框架，构建在 Kotlin Multiplatform 和 Google 的 Jetpack Compose 之上。

Compose Multiplatform 目前在 [iOS 上已处于稳定状态](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)，同样稳定的还有 Android 和桌面端，在 Web 端处于 Beta 阶段。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

我们的专题文章概述了 [Compose Multiplatform 与 Jetpack Compose 之间的关系](compose-multiplatform-and-jetpack-compose.md)，并强调了其中的关键区别。

### Kotlin Multiplatform 与 Flutter：概览

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
        <td>可以分享代码库中您想要的任何部分，包括业务逻辑和/或 UI，比例从 1% 到 100% 不等。</td>
        <td>控制应用的每一个像素，以创建自定义且自适应的设计，在所有平台之间实现 100% 的代码共享。</td>
</tr>

    
<tr>
<td><b>软件包、依赖项与生态系统</b></td>
        <td>软件包可从 <a href="https://central.sonatype.com/">Maven Central</a> 和其他仓库获取，包括
            <p><a href="https://klibs.io">klibs.io</a>，旨在简化 KMP 库的搜索。</p>
            <p>此<a href="https://github.com/terrakok/kmp-awesome">列表</a>包含了一些最受欢迎的 KMP 库和工具。</p> </td>
        <td>软件包可从 <a href="https://pub.dev/">Pub.dev</a> 获取。</td>
</tr>

    
<tr>
<td><b>构建工具</b></td>
        <td>Gradle（对于针对 Apple 设备的应用，还需加上 Xcode）。</td>
        <td>Flutter 命令行工具（底层使用 Gradle 和 Xcode）。</td>
</tr>

    
<tr>
<td><b>代码共享</b></td>
        <td>Android、iOS、Web、桌面端和服务器端。</td>
        <td>Android、iOS、Web、桌面端和嵌入式设备。</td>
</tr>

    
<tr>
<td><b>编译</b></td>
        <td>桌面端和 Android 编译为 JVM 字节码，Web 端编译为 JavaScript 或 Wasm，原生平台编译为平台特定二进制文件</td>
        <td>调试构建在虚拟机中运行 Dart 代码。
        <p>发行构建为原生平台输出平台特定二进制文件，为 Web 端输出 JavaScript/Wasm。</p>
        </td>
</tr>

    
<tr>
<td><b>与原生 API 通信</b></td>
        <td>使用 <Links href="/kmp/multiplatform-expect-actual" summary="undefined">expect/actual 声明</Links>，可直接从 Kotlin 代码访问原生 API。</td>
        <td>可以使用<a href="https://docs.flutter.dev/platform-integration/platform-channels">平台通道</a>与宿主平台进行通信。</td>
</tr>

    
<tr>
<td><b>UI 渲染</b></td>
        <td><a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> 可用于在各平台之间共享 UI，它基于 Google 的 Jetpack Compose，使用 Skia 引擎，该引擎兼容 OpenGL、ANGLE（将 OpenGL ES 2 或 3 调用转换为原生 API）、Vulkan 和 Metal。</td>
        <td>Flutter 微件使用自定义的 <a href="https://docs.flutter.dev/perf/impeller">Impeller 引擎</a>渲染在屏幕上，该引擎根据平台和设备直接与 GPU 通信（使用 Metal、Vulkan 或 OpenGL）。</td>
</tr>

    
<tr>
<td><b>UI 开发迭代</b></td>
        <td>即使在公共代码中也可以使用 UI 预览。
        <p>通过 <Links href="/kmp/compose-hot-reload" summary="undefined">Compose Hot Reload</Links>，您可以立即看到 UI 更改，而无需重启应用或丢失其状态。</p></td>
        <td>IDE 插件可用于 VS Code 和 Android Studio。</td>
</tr>

    
<tr>
<td><b>使用该技术的公司</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、<a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>、<a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">百度</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a> 等更多公司已列在我们的 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 案例研究</a>中。</td>
        <td><a href="https://flutter.dev/showcase/xiaomi">小米</a>、<a href="https://flutter.dev/showcase/wolt">Wolt</a>、<a href="https://flutter.dev/showcase/universal-studios">环球影业</a>、<a href="https://flutter.dev/showcase/alibaba-group">阿里巴巴集团</a>、<a href="https://flutter.dev/showcase/bytedance">字节跳动</a>、<a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>、<a href="https://flutter.dev/showcase/ebay">eBay Motors</a>、<a href="https://flutter.dev/showcase/google-pay">Google Pay</a>、<a href="https://flutter.dev/showcase/so-vegan">So Vegan</a> 等更多公司已列在 <a href="https://flutter.dev/showcase">Flutter Showcase</a> 中。</td>
</tr>

</table>

[![探索来自全球公司的真实案例，这些公司利用 Kotlin Multiplatform 进行跨平台开发。](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

您还可以查看 Google 的博客文章：[《让跨平台开发对开发者来说更容易》](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)，该文章为您的项目选择合适的技术栈提供了指导。

如果您正在寻求 Kotlin Multiplatform 与 Flutter 之间的额外对比，还可以观看 Philipp Lackner 的 [KMP vs. Flutter 视频](https://www.youtube.com/watch?v=dzog64ENKG0)。在视频中，他分享了关于这些技术在代码共享、UI 渲染、性能以及两者未来发展方面的一些有趣观察。

通过仔细评估您的特定业务需求、目标和任务，您可以确定最符合您要求的跨平台解决方案。