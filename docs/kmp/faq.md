[//]: # (title: 常见问题解答)

## Kotlin Multiplatform {id="kotlin-multiplatform"}

### 什么是 Kotlin Multiplatform？ {id="what-is-kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) 是 JetBrains 推出的一项用于灵活进行跨平台开发的开源技术。它允许你为各种平台创建应用程序，并在这些平台之间高效复用代码，同时保留原生编程的优势。借助 Kotlin Multiplatform，你可以开发适用于 Android、iOS、桌面、Web、服务器端等平台的应用。

### 我可以使用 Kotlin Multiplatform 共享 UI 代码吗？ {id="can-i-share-ui-code-using-kotlin-multiplatform"}

是的，你可以使用 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 来共享 UI，这是 JetBrains 基于 Kotlin 和 [Jetpack Compose](https://developer.android.com/jetpack/compose) 开发的声明式 UI 框架。该框架允许你为 iOS、Android、桌面和 Web 等平台创建共享的 UI 组件，帮助你在不同设备和平台之间保持一致的用户界面。

要了解更多信息，请参阅 [Compose Multiplatform](#compose-multiplatform) 部分。

### Kotlin Multiplatform 支持哪些平台？ {id="what-platforms-does-kotlin-multiplatform-support"}

Kotlin Multiplatform 支持 Android、iOS、桌面、Web、服务器端以及其他平台。详细了解[支持的平台](supported-platforms.md)。

### 我应该在哪个 IDE 中开发我的跨平台应用？ {id="in-which-ide-should-i-work-on-my-cross-platform-app"}

我们推荐使用 IntelliJ IDEA 或 Android Studio 开发 Kotlin Multiplatform 项目。

如果你的 Kotlin Multiplatform 项目的目标平台包括 iOS，则需要在计算机上安装 [Xcode](https://developer.apple.com/xcode/)，以编写特定于 iOS 的代码并运行 iOS 应用程序。

### 如何创建新的 Kotlin Multiplatform 项目？ {id="how-do-i-create-a-new-kotlin-multiplatform-project"}

[创建 Kotlin Multiplatform 应用](get-started.topic)教程提供了创建 Kotlin Multiplatform 项目的分步说明。你可以决定共享哪些内容——仅共享逻辑，还是同时共享逻辑和 UI。

### 我有一个现有的 Android 应用程序。如何将其迁移到 Kotlin Multiplatform？ {id="i-have-an-existing-android-application-how-can-i-migrate-it-to-kotlin-multiplatform"}

[让你的 Android 应用程序在 iOS 上运行](multiplatform-integrate-in-existing-app.md)分步教程介绍了如何让你的 Android 应用程序在 iOS 上配合原生 UI 运行。

[将 Jetpack Compose 应用迁移到 Kotlin Multiplatform](migrate-from-android.md) 是一篇进阶教程，展示了将复杂的 Android 应用程序转换为多平台应用的完整路径，包括将 UI 迁移到 Compose Multiplatform。

### 我可以在哪里获取完整的示例进行体验？ {id="where-can-i-get-complete-examples-to-play-with"}

这里是[实际应用示例列表](multiplatform-samples.md)。

### 我可以在哪里找到实际的 Kotlin Multiplatform 应用程序列表？有哪些公司在生产环境中使用 KMP？ {id="where-can-i-find-a-list-of-real-life-kotlin-multiplatform-applications-what-companies-use-kmp-in-production"}

查看我们的[案例研究列表](https://kotlinlang.org/case-studies/?type=multiplatform)，了解其他已经在生产环境中采用 Kotlin Multiplatform 的公司经验。

### 哪些操作系统支持使用 Kotlin Multiplatform？ {id="which-operating-systems-can-work-with-kotlin-multiplatform"}

如果你要处理共享代码或特定于平台（除 iOS 之外）的代码，可以在你的 IDE 支持的任何操作系统上进行开发。

如果你想编写特定于 iOS 的代码并在模拟器或真机上运行 iOS 应用程序，请使用运行 macOS 的 Mac。这是因为根据 Apple 的要求，iOS 模拟器只能在 macOS 上运行，无法在 Microsoft Windows 或 Linux 等其他操作系统上运行。

详细了解[推荐的 IDE](recommended-ides.md)。

### 如何在 Kotlin Multiplatform 项目中编写并发代码？ {id="how-can-i-write-concurrent-code-in-kotlin-multiplatform-projects"}

你仍然可以使用协程和 Flow 在 Kotlin Multiplatform 项目中编写异步代码。如何调用这些代码取决于从何处进行调用。从 Kotlin 代码调用挂起函数和 Flow 已有详尽的文档说明，尤其是在 Android 平台上。[从 Swift 代码中调用它们](https://kotlinlang.org/docs/native-arc-integration.html#completion-handlers)需要做一些额外的工作，更多详情请参见 [KT-47610](https://youtrack.jetbrains.com/issue/KT-47610)。

当前从 Swift 调用挂起函数和 Flow 的最佳方法是使用诸如 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 之类的插件和库，并结合 Swift 的 `async`/`await` 或 Combine 和 RxSwift 等库。

目前，KMP-NativeCoroutines 是一套更久经考验的解决方案，并且支持通过 `async`/`await`、Combine 以及 RxSwift 的方式处理并发。SKIE 配置起来可能更容易且更为简洁。例如，它将 Kotlin 的 `Flow` 直接映射到 Swift 的 `AsyncSequence`。这两个库都支持正确取消协程。

要了解如何使用它们，请参阅[原生 UI：针对 REST API 请求的共享逻辑](multiplatform-upgrade-app.md)教程。

### 什么是 Kotlin/Native，它与 Kotlin Multiplatform 有什么关系？ {id="what-is-kotlin-native-and-how-does-it-relate-to-kotlin-multiplatform"}

[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 是一项将 Kotlin 代码编译为原生二进制文件的技术，无需虚拟机即可运行。它包括一个针对 Kotlin 编译器的[基于 LLVM 的](https://llvm.org/)后端，以及 Kotlin 标准库的原生实现。

Kotlin/Native 最初设计用于允许针对不需要或无法使用虚拟机的平台（例如嵌入式设备和 iOS）进行编译。当你需要生成不需要额外运行时或虚拟机的自包含程序时，它尤其适用。

例如，在移动应用程序中，使用 Kotlin 编写的共享代码在 Android 上通过 Kotlin/JVM 编译为 JVM 字节码，而在 iOS 上通过 Kotlin/Native 编译为原生二进制文件。这使得与 Kotlin Multiplatform 的集成在两个平台上都能无缝衔接。

![Kotlin/Native and Kotlin/JVM binaries](kotlin-native-and-jvm-binaries.png){width=350}

### 如何为原生平台（iOS、macOS、Linux）加快 Kotlin Multiplatform 模块的编译速度？ {id="how-can-i-speed-up-my-kotlin-multiplatform-module-compilation-for-native-platforms-ios-macos-linux"}

请参阅这些[缩短 Kotlin/Native 编译时间的技巧](https://kotlinlang.org/docs/native-improving-compilation-time.html)。

## Compose Multiplatform {id="compose-multiplatform"}

### 什么是 Compose Multiplatform？ {id="what-is-compose-multiplatform"}

[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 是由 JetBrains 开发的现代化声明式和响应式 UI 框架，它提供了一种仅用少量 Kotlin 代码即可构建用户界面的简便方法。它还允许你编写一次 UI 即可在任意受支持的平台上运行——包括 iOS、Android、桌面（Windows、macOS、Linux）和 Web。

### 它与适用于 Android 的 Jetpack Compose 有什么关系？ {id="how-does-it-relate-to-jetpack-compose-for-android"}

Compose Multiplatform 与 Google 开发的 Android UI 框架 [Jetpack Compose](https://developer.android.com/jetpack/compose) 共享了绝大部分 API。事实上，当你使用 Compose Multiplatform 面向 Android 平台时，你的应用实际上就是在 Jetpack Compose 上运行。Compose Multiplatform 面向的其他平台在底层实现细节上可能与 Android 上的 Jetpack Compose 有所不同，但它们仍然为你提供相同的 API。

有关详情，请参阅[框架关联概述](compose-multiplatform-and-jetpack-compose.md)。

### 我可以在哪些平台之间共享 UI？ {id="between-which-platforms-can-i-share-my-ui"}

我们希望你能够在常见平台的任意组合之间共享 UI——包括 Android、iOS、桌面（Linux、macOS、Windows）和 Web（基于 Wasm）。目前 Compose Multiplatform 在 Android、iOS 和桌面上处于 Stable 状态。更多详情请参见[支持的平台](supported-platforms.md)。

### 我可以在生产环境中使用 Compose Multiplatform 吗？ {id="can-i-use-compose-multiplatform-in-production"}

Compose Multiplatform 的 Android、iOS 和桌面目标均已处于 Stable 状态。你可以在生产环境中使用它们。

基于 WebAssembly 的 Compose Multiplatform for Web 版本目前处于 Beta 阶段，这意味着它已接近完成。你可以使用它，但可能仍会出现迁移问题。它具有与适用于 iOS、Android 和桌面的 Compose Multiplatform 相同的 UI。

### 如何创建新的 Compose Multiplatform 项目？ {id="how-do-i-create-a-new-compose-multiplatform-project"}

[创建具有共享逻辑和 UI 的 Compose Multiplatform 应用](compose-multiplatform-new-project.md)教程提供了为 Android、iOS 和桌面创建包含 Compose Multiplatform 的 Kotlin Multiplatform 项目的分步说明。你还可以观看由 Kotlin 技术布道师 Sebastian Aigner 制作的 YouTube [视频教程](https://www.youtube.com/watch?v=5_W5YKPShZ4)。

### 构建基于 Compose Multiplatform 的应用应该使用哪款 IDE？ {id="what-ide-should-i-use-for-building-apps-with-compose-multiplatform"}

我们推荐使用安装了 [KMP IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform/)的 IntelliJ IDEA 或 Android Studio IDE。

更多详情请参阅[推荐的 IDE 和代码编辑器](recommended-ides.md)。

### 我可以体验演示应用吗？在哪里可以找到？ {id="can-i-play-with-a-demo-application-where-can-i-find-it"}

你可以体验我们的[示例](multiplatform-samples.md)。

### Compose Multiplatform 是否自带微件？ {id="does-compose-multiplatform-come-with-widgets"}

是的，Compose Multiplatform 全面支持 [Material 3](https://m3.material.io/) 微件。

### 我在多大程度上可以自定义 Material 微件的外观？ {id="to-what-extent-can-i-customize-the-appearance-of-material-widgets"}

你可以使用 Material 的主题功能来自定义颜色、字体和内边距。如果你想打造独特的设计，还可以创建自定义微件和布局。

### 我可以在现有的 Kotlin Multiplatform 应用中共享 UI 吗？ {id="can-i-share-the-ui-in-my-existing-kotlin-multiplatform-app"}

如果你的应用程序使用原生 API 来构建 UI（这是最常见的情况），你可以逐步将某些部分重写为 Compose Multiplatform，因为它为此提供了互操作性。你可以使用包装了由 Compose 编写的通用 UI 的特殊互操作视图来替换原生 UI。

### 我有一个使用 Jetpack Compose 的现有 Android 应用程序。要将其迁移到其他平台，我应该怎么做？ {id="i-have-an-existing-android-application-that-uses-jetpack-compose-what-should-i-do-to-migrate-it-to-other-platforms"}

应用程序的迁移包括两个部分：迁移 UI 和迁移逻辑。迁移的复杂程度取决于应用程序的复杂性以及你所使用的 Android 专用库的数量。

有关迁移复杂应用的示例，请参阅[将 Jetpack Compose 应用迁移到 Kotlin Multiplatform](migrate-from-android.md)指南。

你可以无需修改地将大多数屏幕迁移到 Compose Multiplatform。所有 Jetpack Compose 微件均受支持。不过，某些 API 仅在 Android 目标上有效——它们可能是 Android 专有的，或者尚未移植到其他平台。例如，资源处理是特定于 Android 的，因此你需要迁移到 [Compose Multiplatform 资源库](compose-multiplatform-resources.md)或使用社区解决方案。有关仅适用于 Android 的组件的更多信息，请参见当前的[仅限 Android 的 API 列表](compose-android-only-components.md)。

你需要[将业务逻辑迁移到 Kotlin Multiplatform](multiplatform-integrate-in-existing-app.md)。当你尝试将代码移动到共享模块时，使用 Android 依赖项的部分将无法编译，你需要对它们进行重写。

* 你可以重写使用仅限 Android 依赖项的代码，改用多平台库。有些库可能已经支持 Kotlin Multiplatform，因此无需做任何修改。请查看 [klibs.io](https://klibs.io/) 目录或 [KMP-awesome](https://github.com/terrakok/kmp-awesome) 库列表。
* 或者，你可以将通用代码与平台专用逻辑分开，并[提供通用接口](multiplatform-connect-to-apis.md)，根据平台进行不同的实现。在 Android 上，该实现可以使用你现有的功能；而在其他平台（如 iOS）上，你需要为通用接口提供新的实现。

### 我可以将 Compose 屏幕集成到现有的 iOS 应用中吗？ {id="can-i-integrate-compose-screens-into-an-existing-ios-app"}

可以。Compose Multiplatform 支持不同的集成方案。有关与 iOS UI 框架集成的更多信息，请参阅[与 SwiftUI 集成](compose-swiftui-integration.md)以及[与 UIKit 集成](compose-uikit-integration.md)。

### 我可以将 UIKit 或 SwiftUI 组件集成到 Compose 屏幕中吗？ {id="can-i-integrate-uikit-or-swiftui-components-into-a-compose-screen"}

可以。请参阅[与 SwiftUI 集成](compose-swiftui-integration.md)以及[与 UIKit 集成](compose-uikit-integration.md)。

<!-- Need to revise
### What happens when my mobile OS updates and introduces new platform capabilities? {id="what-happens-when-my-mobile-os-updates-and-introduces-new-platform-capabilities"}

You can use them in platform-specific parts of your codebase once Kotlin supports them. We do our best to support them
in the upcoming Kotlin version. All new Android capabilities provide Kotlin or Java APIs, and wrappers over iOS APIs are
generated automatically.
-->

### 当我的移动操作系统更新并更改系统组件的视觉样式或其行为时会发生什么？ {id="what-happens-when-my-mobile-os-updates-and-changes-the-visual-style-of-the-system-components-or-their-behavior"}

操作系统更新后，你的 UI 将保持不变，因为所有组件都是在画布上绘制的。如果你在屏幕中嵌入了原生 iOS 组件，系统更新可能会影响其外观。

## 未来计划 {id="future-plans"}

### Kotlin Multiplatform 未来演进有哪些计划？ {id="what-are-the-plans-for-the-kotlin-multiplatform-evolution"}

JetBrains 正在大力投入，以提供最佳的多平台开发体验并消除多平台用户的现有痛点。我们计划改进 Kotlin Multiplatform 核心技术、与 Apple 生态系统的集成、工具链支持以及我们的 Compose Multiplatform UI 框架。请查看 [Kotlin 路线图中的 Multiplatform 部分](https://kotlinlang.org/docs/roadmap.html#kotlin-roadmap-by-subsystem)。

### Compose Multiplatform 何时会达到 Stable 状态？ {id="when-will-compose-multiplatform-become-stable"}

Compose Multiplatform 在 Android、iOS 和桌面上已达到 Stable 状态，而基于 Wasm 的 Web 支持目前处于 Beta 阶段。我们正在努力推进 Web 平台的稳定版本发布，具体日期有待公布。

有关稳定性状态的更多信息，请参阅[支持的平台](supported-platforms.md)。

### Kotlin 和 Compose Multiplatform 未来对 Web 目标平台的支持情况如何？ {id="what-about-future-support-for-web-targets-in-kotlin-and-compose-multiplatform"}

我们目前正将资源集中在 WebAssembly (Wasm) 上，它展现出了巨大的潜力。你可以尝试体验我们全新的 [Kotlin/Wasm 后端](https://kotlinlang.org/docs/wasm-overview.html)以及基于 Wasm 的 [Compose Multiplatform for Web](https://kotl.in/wasm-compose-example)。

至于 JS 目标平台，Kotlin/JS 后端已经达到了 Stable 状态。在 Compose Multiplatform 中，由于资源有限，我们已将重心从 JS Canvas 转向了 Wasm，我们认为 Wasm 更具前景。

我们还提供了 Compose HTML（之前称为 Compose Multiplatform for web）。它是一个用于在 Kotlin/JS 中操作 DOM（文档对象模型）的附加库，并非用于跨平台共享 UI。

### 是否有改进多平台开发工具的计划？ {id="are-there-any-plans-to-improve-tooling-for-multiplatform-development"}

是的，我们深知目前在多平台工具方面面临的挑战，并正在积极致力于多个领域的改进。

### 你们会提供 Swift 互操作性支持吗？ {id="are-you-going-to-provide-swift-interoperability"}

是的。我们目前正在研究提供与 Swift 直接互操作的各种方法，重点是将 Kotlin 代码导出到 Swift。