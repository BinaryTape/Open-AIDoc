[//]: # (title: 学习资源)

<web-summary>选择最适合您 KMP 经验水平的学习资料。</web-summary>

我们收集了 30 多份精选的 Kotlin Multiplatform (KMP) 和 Compose Multiplatform 学习资料。您可以按技能水平浏览，找到适合您经验的教程、课程和文章：

🌱 **初学者**。通过 JetBrains 和 Google 官方教程学习 KMP 与 Compose 基础。使用 Room、Ktor 和 SQLDelight 等核心库构建简单应用。

🌿 **进阶**。使用共享 ViewModel、基于 Koin 的依赖注入以及整洁架构开发实际应用。通过 JetBrains 及社区讲师的课程进行学习。

🌳 **高级**。进阶到面向后端和游戏开发的全规模 KMP 工程化，并获取针对大型多团队项目的架构扩展和推广采纳指导。

🧩 **库作者**。创建并发布可复用的 KMP 库。借助官方 JetBrains 工具与模板，学习 API 设计、Dokka 文档生成以及 Maven 发布。

<Tabs>
<TabItem id="all-resources" title="全部">

<snippet id="source">
<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**资源 /**

**类型**

</th>
<th>

**创作者 /**
**平台**

</th>

<th>

**您将学到**

</th>
<th>

**价格**

</th>
<th>

**预估耗时**

</th>
</tr>

</thead>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 概览](kmp-overview.md)

文章

</td>
<td>
JetBrains
</td>

<td>
KMP 的核心价值、实际用例以及关于选择合适学习路径的指导。
</td>
<td>
免费
</td>
<td>
30 分钟
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[创建您的首个 KMP 应用](multiplatform-upgrade-app.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何设置 KMP 项目，并在保持 UI 完全原生的同时，在 Android 与 iOS 之间共享简单的业务逻辑。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 入门（Google Codelab）](https://developer.android.com/codelabs/kmp-get-started)

教程

</td>
<td>
Google

Android
</td>

<td>
如何向现有 Android 项目添加共享 KMP 模块并与 iOS 集成，使用 SKIE 插件从 Kotlin 代码生成地道的 Swift API。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[创建您的首个 Compose Multiplatform 应用](compose-multiplatform-new-project.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何从零开始构建一个完整的 Compose Multiplatform 应用，涵盖基础 UI 组件、状态管理以及资源处理，逐步从简单模板演进为一个可在 Android、iOS、桌面端和 Web 端运行的实用时区应用。
</td>
<td>
免费
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[使用 Ktor 和 SQLDelight 创建多平台应用](multiplatform-ktor-sqldelight.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何使用用于网络请求的 Ktor 和用于本地数据库的 SQLDelight 构建共享数据层，并将其连接到使用 Android 上的 Jetpack Compose 和 iOS 上的 SwiftUI 构建的原生 UI。
</td>
<td>
免费
</td>
<td>
4–6 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[预期声明与实际声明](multiplatform-expect-actual.md)

文章

</td>
<td>
JetBrains
</td>

<td>
从通用代码访问平台特定 API 的核心 expect/actual 机制，涵盖使用函数、属性和类等不同策略。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[在 KMP 应用中使用平台特定 API](https://www.youtube.com/watch?v=bSNumV04y_w)

视频教程

</td>
<td>
JetBrains

YouTube
</td>

<td>
在 KMP 应用中使用平台特定代码的最佳做法。
</td>
<td>
免费
</td>
<td>
15 分钟
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[面向 Android 开发者的 KMP](https://learnkmp.com/)

视频课程

</td>
<td>
Mykola Miroshnychenko

PayHip
</td>

<td>
如何通过掌握 expect/actual 和源集（source sets）等 KMP 基础知识，将现有的 Android 开发技能拓展到 iOS，并使用现代化库构建完整的应用技术栈，如用于网络的 Ktor、用于依赖注入的 Koin、Nav3 以及用于持久化的 Room。
</td>
<td>
$39
</td>
<td>
8–12 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 大师课](https://www.udemy.com/course/kotlin-multiplatform-masterclass/)

视频课程

</td>
<td>
Petros Efthymiou

Udemy
</td>

<td>
如何从零开始应用整洁架构和 MVI 来构建完整的 KMP 应用程序，将一系列核心库（Ktor、SQLDelight 和 Koin）与原生 Jetpack Compose 和 SwiftUI UI 进行完整集成。
</td>
<td>
€10–€20
</td>
<td>
6 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Compose Multiplatform 全套课程 2025 | 从零到精通](https://www.youtube.com/watch?v=Z92zJzL-6z0&list=PL0pXjGnY7PORAoIX2q7YG2sotapCp4hyl)

视频课程

</td>
<td>
Code with FK

YouTube
</td>

<td>
如何完全使用 Compose Multiplatform 构建一个功能完备的完整应用程序，从基础逐步进阶到高级实际功能，如 Firebase Authentication、基于 SQLDelight 的离线支持以及实时更新。
</td>
<td>
免费
</td>
<td>
20 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 开发](https://www.linkedin.com/learning/kotlin-multiplatform-development)

视频课程

</td>
<td>
Colin Lee

LinkedIn Learning
</td>

<td>
Compose Multiplatform 与原生 UI 之间的架构选型、Swift 互操作性基础，以及面向网络、持久化和依赖注入的核心 KMP 生态系统的全面概览。
</td>
<td>
约 $30–$40/月
</td>
<td>
3 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[《Kotlin Multiplatform 实战教程》（第三版）](https://www.kodeco.com/books/kotlin-multiplatform-by-tutorials/v3.0)

书籍

</td>
<td>
Kodeco 团队（Kevin D. Moore、Carlos Mota、Saeed Taheri）
</td>

<td>
通过将原生 UI 连接到用于网络、序列化和持久化的 KMP 共享模块来实现代码共享的基础知识。您还将了解如何应用依赖注入、测试和现代架构来构建可维护且可扩展的实际应用。
</td>
<td>
约 $60
</td>
<td>
40–60 小时
</td>
</tr>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[让您的 Android 应用程序在 iOS 上运行](multiplatform-integrate-in-existing-app.md)

教程

</td>
<td>
JetBrains
</td>

<td>
通过将业务逻辑提取到共享模块中，将现有 Android 应用迁移到 KMP 的实用步骤，该共享模块可同时被原始 Android 应用和全新的原生 iOS 项目使用。
</td>
<td>
免费
</td>
<td>
2 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[将现有应用迁移到 Room KMP（Google Codelab）](https://developer.android.com/codelabs/kmp-migrate-room)

教程

</td>
<td>
Google

Android
</td>

<td>
如何将现有的 Android Room 数据库迁移到共享 KMP 模块中，以便在 Android 和 iOS 上复用熟悉的 DAO 和实体。
</td>
<td>
免费
</td>
<td>
2 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[如何在 Compose Multiplatform 中共享 ViewModel（包含依赖注入！）](https://www.youtube.com/watch?v=O85qOS7U3XQ)

视频教程

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
如何在 Compose Multiplatform 项目中使用 Koin 进行依赖注入来实现共享 ViewModel，让您只需编写一次状态管理逻辑。
</td>
<td>
免费
</td>
<td>
30 分钟
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Compose Multiplatform 速成课程 2025](https://www.youtube.com/watch?v=WT9-4DXUqsM)

视频课程

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
如何使用整洁架构从零开始构建一个生产就绪的完整图书阅读应用，涵盖现代 KMP 技术栈，包括用于网络请求的 Ktor、用于本地数据库的 Room、用于依赖注入的 Koin 以及多平台导航。
</td>
<td>
免费
</td>
<td>
5 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[使用 KMP 构建工业级多平台应用](https://pl-coding.com/kmp/)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何通过在原生 UI（Jetpack Compose 和 SwiftUI）之间共享 ViewModel 和业务逻辑来构建一个真实的翻译应用，涵盖从整洁架构到针对双平台的单元测试、UI 测试及端到端测试的整个开发生命周期。
</td>
<td>
约 €99
</td>
<td>
20 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[构建工业级 Compose Multiplatform Android 与 iOS 应用](https://pl-coding.com/cmp-mobile)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何使用完整的 Compose Multiplatform 技术栈从零构建大型离线优先聊天应用，包括用于实时 WebSocket 的 Ktor、用于本地持久化的 Room 以及用于多模块依赖注入的 Koin。
</td>
<td>
约 €199
</td>
<td>
34 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Compose Multiplatform 终极指南：Android/iOS 与测试](https://www.udemy.com/course/ultimate-compose-multiplatform-androidios-testing-kotlin/)

视频课程

</td>
<td>
Hamidreza Sahraei

Udemy

</td>

<td>
如何完全使用 Compose Multiplatform 构建功能丰富的虚拟加密货币钱包应用，不仅涵盖核心技术栈（Ktor、Room、Koin），还包括稳健的单元/UI 测试以及生物识别身份验证等高级平台集成。
</td>
<td>
约 €20
</td>
<td>
8 小时
</td>
</tr>
<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Kotlin/Swift 互操作百科](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)

文章

</td>
<td>
JetBrains

GitHub
</td>

<td>
与 iOS (Obj-C/Swift) 的互操作性、SKIE、KMP-NativeCoroutines、语言特性差异的变通方案、Swift 导出以及双向互操作。
</td>
<td>
免费
</td>
<td>
2 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[适用于 Android 和 iOS 的多模块电商应用 (KMP)](https://www.udemy.com/course/multi-modular-ecommerce-app-for-android-ios-kmp/)

视频课程

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
完整的产品生命周期：从在 Figma 中设计电商应用的 UI，到使用 Compose Multiplatform 将其构建为具有共享 UI 的完整多模块应用，同时使用 Firebase 服务创建并集成包含身份验证、数据库及自动化云函数的完整后端。
</td>
<td>
约 €50
</td>
<td>
30 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[探索 Ktor 与 Kotlin Multiplatform 及 Compose](https://www.linkedin.com/learning/exploring-ktor-with-kotlin-multiplatform-and-compose)

视频课程

</td>
<td>
Troy Miles

LinkedIn Learning
</td>

<td>
如何构建全栈 Kotlin 应用程序：首先创建安全的 Ktor 后端并将其部署到 AWS，然后使用 Kotlin Multiplatform 构建调用该 API 的具有共享代码的原生客户端。
</td>
<td>
约 $30–$40/月
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[全栈游戏开发 - Kotlin 与 Compose Multiplatform](https://www.udemy.com/course/full-stack-game-development-kotlin-compose-multiplatform/)

视频课程

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
如何使用 Compose Multiplatform 构建完整的 2D 游戏，涵盖物理模拟、碰撞检测和精灵表（sprite sheet）动画，以及如何将其部署到 Android、iOS、桌面端和 Web 端（通过 Kotlin/Wasm）。
</td>
<td>
约 €99
</td>
<td>
8–10 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Philipp Lackner 全栈同捆课程：KMP 与 Spring Boot](https://pl-coding.com/full-stack-bundle)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何架构、构建和部署一个完整的全栈聊天应用程序，涵盖从支持 WebSocket 的多模块 Spring Boot 后端，到离线优先的 Compose Multiplatform 客户端（Android、iOS、桌面端、Web 端）以及完整的 CI/CD 流水线。
</td>
<td>
约 €429
</td>
<td>
55 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[面向原生移动团队的 KMP](https://touchlab.co/kmp-teams-intro)

系列文章

</td>
<td>
Touchlab
</td>

<td>
如何在成熟的原生移动团队中推进完整的 KMP 采纳流程：从获得初始支持并开展技术试点，到通过可持续的实际工作流扩展共享代码库。
</td>
<td>
免费
</td>
<td>
6–8 小时
</td>
</tr>

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[多平台库构建 API 指南](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

文档

</td>
<td>
JetBrains
</td>

<td>
如何设计多平台库的公共 API，遵循旨在最大化代码复用并确保广泛平台兼容性的核心最佳做法。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[创建您的 Kotlin Multiplatform 库](create-kotlin-multiplatform-library.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何使用官方入门模板、设置本地 Maven 发布、组织库结构以及配置发布。
</td>
<td>
免费
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[使用 Dokka 生成文档](https://kotlinlang.org/docs/dokka-introduction.html)

文档

</td>
<td>
JetBrains
</td>

<td>
如何使用 Dokka 自动为 KMP 库生成多种格式的专业 API 文档，支持 Kotlin/Java 混合项目。
</td>
<td>
免费
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[KMP 库模板](https://github.com/Kotlin/multiplatform-library-template)

GitHub 模板

</td>
<td>
JetBrains

GitHub
</td>

<td>
如何使用预配置了构建设置和发布最佳做法的官方模板，快速引导并启动新的 KMP 库项目。
</td>
<td>
免费
</td>
<td>
1 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[发布到 Maven Central](multiplatform-publish-libraries-to-maven.md)

教程

</td>
<td>
JetBrains
</td>

<td>
将 KMP 库发布到 Maven Central 的完整分步流程，包括设置凭据、配置发布插件以及通过 CI 实现流程自动化。
</td>
<td>
免费
</td>
<td>
3–4 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Kotlin Multiplatform 库开发](https://www.linkedin.com/learning/kotlin-multiplatform-libraries)

视频课程

</td>
<td>
LinkedIn Learning
</td>

<td>
创建 KMP 库的完整生命周期，从有效的 API 设计和代码共享策略到最终的分发与最佳做法。
</td>
<td>
约 $30–$40/月
</td>
<td>
2–3 小时
</td>
</tr>

<!-- END OF LIB-AUTHORS BLOCK -->

</table>
</snippet>

<!-- END OF REVOKED BLOCK -->

</TabItem>

<TabItem id="beginner" title="🌱 初学者">

<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**资源 /**

**类型**

</th>
<th>

**创作者 /**
**平台**

</th>

<th>

**您将学到**

</th>
<th>

**价格**

</th>
<th>

**预估耗时**

</th>
</tr>

</thead>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 概览](kmp-overview.md)

文章

</td>
<td>
JetBrains
</td>

<td>
KMP 的核心价值、实际用例以及关于选择合适学习路径的指导。
</td>
<td>
免费
</td>
<td>
30 分钟
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[创建您的首个 KMP 应用](multiplatform-upgrade-app.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何设置 KMP 项目，并在保持 UI 完全原生的同时，在 Android 与 iOS 之间共享简单的业务逻辑。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 入门（Google Codelab）](https://developer.android.com/codelabs/kmp-get-started)

教程

</td>
<td>
Google

Android
</td>

<td>
如何向现有 Android 项目添加共享 KMP 模块并与 iOS 集成，使用 SKIE 插件从 Kotlin 代码生成地道的 Swift API。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[创建您的首个 Compose Multiplatform 应用](compose-multiplatform-new-project.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何从零开始构建一个完整的 Compose Multiplatform 应用，涵盖基础 UI 组件、状态管理以及资源处理，逐步从简单模板演进为一个可在 Android、iOS、桌面端和 Web 端运行的实用时区应用。
</td>
<td>
免费
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[使用 Ktor 和 SQLDelight 创建多平台应用](multiplatform-ktor-sqldelight.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何使用用于网络请求的 Ktor 和用于本地数据库的 SQLDelight 构建共享数据层，并将其连接到使用 Android 上的 Jetpack Compose 和 iOS 上的 SwiftUI 构建的原生 UI。
</td>
<td>
免费
</td>
<td>
4–6 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[预期声明与实际声明](multiplatform-expect-actual.md)

文章

</td>
<td>
JetBrains
</td>

<td>
从通用代码访问平台特定 API 的核心 expect/actual 机制，涵盖使用函数、属性和类等不同策略。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[在 KMP 应用中使用平台特定 API](https://www.youtube.com/watch?v=bSNumV04y_w)

视频教程

</td>
<td>
JetBrains

YouTube
</td>

<td>
在 KMP 应用中使用平台特定代码的最佳做法。
</td>
<td>
免费
</td>
<td>
15 分钟
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[面向 Android 开发者的 KMP](https://learnkmp.com/)

视频课程

</td>
<td>
Mykola Miroshnychenko

PayHip
</td>

<td>
如何通过掌握 expect/actual 和源集（source sets）等 KMP 基础知识，将现有的 Android 开发技能拓展到 iOS，并使用现代化库构建完整的应用技术栈，如用于网络的 Ktor、用于依赖注入的 Koin、Nav3 以及用于持久化的 Room。
</td>
<td>
$39
</td>
<td>
8–12 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 大师课](https://www.udemy.com/course/kotlin-multiplatform-masterclass/)

视频课程

</td>
<td>
Petros Efthymiou

Udemy
</td>

<td>
如何从零开始应用整洁架构和 MVI 来构建完整的 KMP 应用程序，将一系列核心库（Ktor、SQLDelight 和 Koin）与原生 Jetpack Compose 和 SwiftUI UI 进行完整集成。
</td>
<td>
€10–€20
</td>
<td>
6 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Compose Multiplatform 全套课程 2025 | 从零到精通](https://www.youtube.com/watch?v=Z92zJzL-6z0&list=PL0pXjGnY7PORAoIX2q7YG2sotapCp4hyl)

视频课程

</td>
<td>
Code with FK

YouTube
</td>

<td>
如何完全使用 Compose Multiplatform 构建一个功能完备的完整应用程序，从基础逐步进阶到高级实际功能，如 Firebase Authentication、基于 SQLDelight 的离线支持以及实时更新。
</td>
<td>
免费
</td>
<td>
20 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform 开发](https://www.linkedin.com/learning/kotlin-multiplatform-development)

视频课程

</td>
<td>
Colin Lee

LinkedIn Learning
</td>

<td>
Compose Multiplatform 与原生 UI 之间的架构选型、Swift 互操作性基础，以及面向网络、持久化和依赖注入的核心 KMP 生态系统的全面概览。
</td>
<td>
约 $30–$40/月
</td>
<td>
3 小时
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[《Kotlin Multiplatform 实战教程》（第三版）](https://www.kodeco.com/books/kotlin-multiplatform-by-tutorials/v3.0)

书籍

</td>
<td>
Kodeco 团队（Kevin D. Moore、Carlos Mota、Saeed Taheri）
</td>

<td>
通过将原生 UI 连接到用于网络、序列化和持久化的 KMP 共享模块来实现代码共享的基础知识。您还将了解如何应用依赖注入、测试和现代架构来构建可维护且可扩展的实际应用。
</td>
<td>
约 $60
</td>
<td>
40–60 小时
</td>
</tr>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

<TabItem id="intermediate" title="🌿 进阶">

<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**资源 /**

**类型**

</th>
<th>

**创作者 /**
**平台**

</th>

<th>

**您将学到**

</th>
<th>

**价格**

</th>
<th>

**预估耗时**

</th>
</tr>

</thead>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[让您的 Android 应用程序在 iOS 上运行](multiplatform-integrate-in-existing-app.md)

教程

</td>
<td>
JetBrains
</td>

<td>
通过将业务逻辑提取到共享模块中，将现有 Android 应用迁移到 KMP 的实用步骤，该共享模块可同时被原始 Android 应用和全新的原生 iOS 项目使用。
</td>
<td>
免费
</td>
<td>
2 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[将现有应用迁移到 Room KMP（Google Codelab）](https://developer.android.com/codelabs/kmp-migrate-room)

教程

</td>
<td>
Google

Android
</td>

<td>
如何将现有的 Android Room 数据库迁移到共享 KMP 模块中，以便在 Android 和 iOS 上复用熟悉的 DAO 和实体。
</td>
<td>
免费
</td>
<td>
2 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[如何在 Compose Multiplatform 中共享 ViewModel（包含依赖注入！）](https://www.youtube.com/watch?v=O85qOS7U3XQ)

视频教程

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
如何在 Compose Multiplatform 项目中使用 Koin 进行依赖注入来实现共享 ViewModel，让您只需编写一次状态管理逻辑。
</td>
<td>
免费
</td>
<td>
30 分钟
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Compose Multiplatform 速成课程 2025](https://www.youtube.com/watch?v=WT9-4DXUqsM)

视频课程

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
如何使用整洁架构从零开始构建一个生产就绪的完整图书阅读应用，涵盖现代 KMP 技术栈，包括用于网络请求的 Ktor、用于本地数据库的 Room、用于依赖注入的 Koin 以及多平台导航。
</td>
<td>
免费
</td>
<td>
5 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[使用 KMP 构建工业级多平台应用](https://pl-coding.com/kmp/)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何通过在原生 UI（Jetpack Compose 和 SwiftUI）之间共享 ViewModel 和业务逻辑来构建一个真实的翻译应用，涵盖从整洁架构到针对双平台的单元测试、UI 测试及端到端测试的整个开发生命周期。
</td>
<td>
约 €99
</td>
<td>
20 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[构建工业级 Compose Multiplatform Android 与 iOS 应用](https://pl-coding.com/cmp-mobile)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何使用完整的 Compose Multiplatform 技术栈从零构建大型离线优先聊天应用，包括用于实时 WebSocket 的 Ktor、用于本地持久化的 Room 以及用于多模块依赖注入的 Koin。
</td>
<td>
约 €199
</td>
<td>
34 小时
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Compose Multiplatform 终极指南：Android/iOS 与测试](https://www.udemy.com/course/ultimate-compose-multiplatform-androidios-testing-kotlin/)

视频课程

</td>
<td>
Hamidreza Sahraei

Udemy

</td>

<td>
如何完全使用 Compose Multiplatform 构建功能丰富的虚拟加密货币钱包应用，不仅涵盖核心技术栈（Ktor、Room、Koin），还包括稳健的单元/UI 测试以及生物识别身份验证等高级平台集成。
</td>
<td>
约 €20
</td>
<td>
8 小时
</td>
</tr>
<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

<TabItem id="advanced" title="🌳 高级">

<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**资源 /**

**类型**

</th>
<th>

**创作者 /**
**平台**

</th>

<th>

**您将学到**

</th>
<th>

**价格**

</th>
<th>

**预估耗时**

</th>
</tr>

</thead>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Kotlin/Swift 互操作百科](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)

文章

</td>
<td>
JetBrains

GitHub
</td>

<td>
与 iOS (Obj-C/Swift) 的互操作性、SKIE、KMP-NativeCoroutines、语言特性差异的变通方案、Swift 导出以及双向互操作。
</td>
<td>
免费
</td>
<td>
2 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[适用于 Android 和 iOS 的多模块电商应用 (KMP)](https://www.udemy.com/course/multi-modular-ecommerce-app-for-android-ios-kmp/)

视频课程

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
完整的产品生命周期：从在 Figma 中设计电商应用的 UI，到使用 Compose Multiplatform 将其构建为具有共享 UI 的完整多模块应用，同时使用 Firebase 服务创建并集成包含身份验证、数据库及自动化云函数的完整后端。
</td>
<td>
约 €50
</td>
<td>
30 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[探索 Ktor 与 Kotlin Multiplatform 及 Compose](https://www.linkedin.com/learning/exploring-ktor-with-kotlin-multiplatform-and-compose)

视频课程

</td>
<td>
Troy Miles

LinkedIn Learning
</td>

<td>
如何构建全栈 Kotlin 应用程序：首先创建安全的 Ktor 后端并将其部署到 AWS，然后使用 Kotlin Multiplatform 构建调用该 API 的具有共享代码的原生客户端。
</td>
<td>
约 $30–$40/月
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[全栈游戏开发 - Kotlin 与 Compose Multiplatform](https://www.udemy.com/course/full-stack-game-development-kotlin-compose-multiplatform/)

视频课程

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
如何使用 Compose Multiplatform 构建完整的 2D 游戏，涵盖物理模拟、碰撞检测和精灵表（sprite sheet）动画，以及如何将其部署到 Android、iOS、桌面端和 Web 端（通过 Kotlin/Wasm）。
</td>
<td>
约 €99
</td>
<td>
8–10 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Philipp Lackner 全栈同捆课程：KMP 与 Spring Boot](https://pl-coding.com/full-stack-bundle)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何架构、构建和部署一个完整的全栈聊天应用程序，涵盖从支持 WebSocket 的多模块 Spring Boot 后端，到离线优先的 Compose Multiplatform 客户端（Android、iOS、桌面端、Web 端）以及完整的 CI/CD 流水线。
</td>
<td>
约 €429
</td>
<td>
55 小时
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[面向原生移动团队的 KMP](https://touchlab.co/kmp-teams-intro)

系列文章

</td>
<td>
Touchlab
</td>

<td>
如何在成熟的原生移动团队中推进完整的 KMP 采纳流程：从获得初始支持并开展技术试点，到通过可持续的实际工作流扩展共享代码库。
</td>
<td>
免费
</td>
<td>
6–8 小时
</td>
</tr>

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

<TabItem id="lib-authors" title="🧩 库作者">

<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**资源 /**

**类型**

</th>
<th>

**创作者 /**
**平台**

</th>

<th>

**您将学到**

</th>
<th>

**价格**

</th>
<th>

**预估耗时**

</th>
</tr>

</thead>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[多平台库构建 API 指南](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

文档

</td>
<td>
JetBrains
</td>

<td>
如何设计多平台库的公共 API，遵循旨在最大化代码复用并确保广泛平台兼容性的核心最佳做法。
</td>
<td>
免费
</td>
<td>
1–2 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[创建您的 Kotlin Multiplatform 库](create-kotlin-multiplatform-library.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何使用官方入门模板、设置本地 Maven 发布、组织库结构以及配置发布。
</td>
<td>
免费
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[使用 Dokka 生成文档](https://kotlinlang.org/docs/dokka-introduction.html)

文档

</td>
<td>
JetBrains
</td>

<td>
如何使用 Dokka 自动为 KMP 库生成多种格式的专业 API 文档，支持 Kotlin/Java 混合项目。
</td>
<td>
免费
</td>
<td>
2–3 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[KMP 库模板](https://github.com/Kotlin/multiplatform-library-template)

GitHub 模板

</td>
<td>
JetBrains

GitHub
</td>

<td>
如何使用预配置了构建设置和发布最佳做法的官方模板，快速引导并启动新的 KMP 库项目。
</td>
<td>
免费
</td>
<td>
1 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[发布到 Maven Central](multiplatform-publish-libraries-to-maven.md)

教程

</td>
<td>
JetBrains
</td>

<td>
将 KMP 库发布到 Maven Central 的完整分步流程，包括设置凭据、配置发布插件以及通过 CI 实现流程自动化。
</td>
<td>
免费
</td>
<td>
3–4 小时
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Kotlin Multiplatform 库开发](https://www.linkedin.com/learning/kotlin-multiplatform-libraries)

视频课程

</td>
<td>
LinkedIn Learning
</td>

<td>
创建 KMP 库的完整生命周期，从有效的 API 设计和代码共享策略到最终的分发与最佳做法。
</td>
<td>
约 $30–$40/月
</td>
<td>
2–3 小时
</td>
</tr>

<!-- END OF LIB-AUTHORS BLOCK -->

</table>

</TabItem>

</Tabs>