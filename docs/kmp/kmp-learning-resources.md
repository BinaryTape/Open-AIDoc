[//]: # (title: 学习资源)

<web-summary>选择最适合你 KMP 经验水平的学习资料。</web-summary>

我们收集了 30 多份精选的 Kotlin Multiplatform (KMP) 与 Compose Multiplatform 学习资料。按技能水平浏览，找到契合你经验的教程、课程与文章：

🌱 **初级**。通过 JetBrains 和 Google 官方教程学习 KMP 与 Compose 基础知识。使用 Room、Ktor 和 SQLDelight 等核心库构建简单应用。

🌿 **中级**。通过共享 ViewModel、基于 Koin 的依赖注入以及整洁架构开发实际应用。通过 JetBrains 及社区讲师的课程展开学习。

🌳 **高级**。进阶到面向后端和游戏开发的全方位 KMP 工程实践，获取关于大型多团队项目架构扩展与技术落地的指导。

🧩 **库作者**。创建并发布可复用的 KMP 库。借助 JetBrains 官方工具和模板学习 API 设计、Dokka 文档生成以及 Maven 发布。

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

**你将学到**

</th>
<th>

**价格**

</th>
<th>

**预估时间**

</th>
</tr>

</thead>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Overview](kmp-overview.md)

文章

</td>
<td>
JetBrains
</td>

<td>
KMP 的核心价值、实际用例，以及选择合适学习路线的指导。
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

[Create Your First KMP App](multiplatform-upgrade-app.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何搭建 KMP 项目，并在保持 UI 完全原生的同时在 Android 和 iOS 之间共享简单的业务逻辑。
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

[Get Started With Kotlin Multiplatform (Google Codelab)](https://developer.android.com/codelabs/kmp-get-started)

教程

</td>
<td>
Google

Android
</td>

<td>
如何向现有 Android 项目中添加共享 KMP 模块并与 iOS 集成，使用 SKIE 插件从 Kotlin 代码生成符合惯用法的 Swift API。
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

[Create Your First Compose Multiplatform App](compose-multiplatform-new-project.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何从零开始构建一个完整的 Compose Multiplatform 应用，涵盖基础 UI 组件、状态管理和资源处理，逐步从简单模板演进为一个可运行于 Android、iOS、桌面端和 Web 的时区功能应用。
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

[Create a Multiplatform App Using Ktor and SQLDelight](multiplatform-ktor-sqldelight.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何使用 Ktor 进行网络通信、使用 SQLDelight 作为本地数据库来构建共享数据层，并将其连接到分别使用 Android 的 Jetpack Compose 和 iOS 的 SwiftUI 构建的原生 UI。
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

[Expected and Actual Declarations](multiplatform-expect-actual.md)

文章

</td>
<td>
JetBrains
</td>

<td>
用于从通用代码访问平台特定 API 的核心 expect/actual 机制，涵盖使用函数、属性和类等不同策略。
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

[Using Platform-Specific APIs in KMP Apps](https://www.youtube.com/watch?v=bSNumV04y_w)

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

[KMP for Android Developers](https://learnkmp.com/)

视频课程

</td>
<td>
Mykola Miroshnychenko

PayHip
</td>

<td>
如何通过掌握 expect/actual 和源集等 KMP 基础知识，将现有的 Android 开发技能拓展到 iOS，并使用诸如用于网络的 Ktor、用于依赖注入的 Koin、Nav3 以及用于持久化的 Room 等现代库来构建完整的应用技术栈。
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

[Kotlin Multiplatform Masterclass](https://www.udemy.com/course/kotlin-multiplatform-masterclass/)

视频课程

</td>
<td>
Petros Efthymiou

Udemy
</td>

<td>
如何从零开始应用整洁架构和 MVI 来构建完整的 KMP 应用程序，并将核心库——Ktor、SQLDelight 和 Koin——与原生的 Jetpack Compose 和 SwiftUI UI 进行集成。
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

[Compose Multiplatform Full Course 2025 | Zero to Hero](https://www.youtube.com/watch?v=Z92zJzL-6z0&list=PL0pXjGnY7PORAoIX2q7YG2sotapCp4hyl)

视频课程

</td>
<td>
Code with FK

YouTube
</td>

<td>
如何完全使用 Compose Multiplatform 构建一个功能完备的完整应用程序，从基础逐步进阶到高级实际功能，如 Firebase 身份验证、基于 SQLDelight 的离线支持和实时更新。
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

[Kotlin Multiplatform Development](https://www.linkedin.com/learning/kotlin-multiplatform-development)

视频课程

</td>
<td>
Colin Lee

LinkedIn Learning
</td>

<td>
在 Compose Multiplatform 与原生 UI 之间的架构选型、Swift 互操作性基础，以及用于网络、持久化和依赖注入的核心 KMP 生态系统的全面概述。
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

[Kotlin Multiplatform by Tutorials (Third Edition)](https://www.kodeco.com/books/kotlin-multiplatform-by-tutorials/v3.0)

图书

</td>
<td>
Kodeco Team (Kevin D. Moore, Carlos Mota, Saeed Taheri)
</td>

<td>
通过将原生 UI 连接到用于网络、序列化和持久化的 KMP 共享模块来实现代码共享的基础知识。你还将了解如何应用依赖注入、测试和现代架构来构建可维护且可扩展的实际应用。
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

[Make Your Android Application Work on iOS](multiplatform-integrate-in-existing-app.md)

教程

</td>
<td>
JetBrains
</td>

<td>
将现有 Android 应用迁移到 KMP 的实用步骤：通过将其业务逻辑提取到一个共享模块中，供原始 Android 应用和新的原生 iOS 项目共同使用。
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

[Migrate Existing Apps to Room KMP (Google Codelab)](https://developer.android.com/codelabs/kmp-migrate-room)

教程

</td>
<td>
Google

Android
</td>

<td>
如何将现有的 Android Room 数据库迁移到共享 KMP 模块中，使你能够在 Android 和 iOS 上复用熟悉的 DAO 和实体。
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

[How to Share ViewModels in Compose Multiplatform (with Dependency Injection!)](https://www.youtube.com/watch?v=O85qOS7U3XQ)

视频教程

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
如何在 Compose Multiplatform 项目中使用 Koin 进行依赖注入来实现共享 ViewModel，让你只需编写一次状态管理逻辑。
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

[The Compose Multiplatform Crash Course 2025](https://www.youtube.com/watch?v=WT9-4DXUqsM)

视频课程

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
如何使用整洁架构从零构建一个完整的生产级图书阅读应用，涵盖现代 KMP 技术栈，包括用于网络通信的 Ktor、用于本地数据库的 Room、用于依赖注入的 Koin 以及多平台导航。
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

[Building Industry-Level Multiplatform Apps With KMP](https://pl-coding.com/kmp/)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何通过在原生 UI（Jetpack Compose 和 SwiftUI）之间共享 ViewModel 和业务逻辑来构建实际的翻译应用，涵盖从整洁架构到双平台单元测试、UI 测试及端到端测试的完整开发生命周期。
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

[Building Industry-Level Compose Multiplatform Android and iOS Apps](https://pl-coding.com/cmp-mobile)

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

[Ultimate Compose Multiplatform: Android/iOS and Testing](https://www.udemy.com/course/ultimate-compose-multiplatform-androidios-testing-kotlin/)

视频课程

</td>
<td>
Hamidreza Sahraei

Udemy

</td>

<td>
如何完全使用 Compose Multiplatform 构建功能丰富的虚拟加密钱包应用，不仅涵盖核心技术栈（Ktor、Room、Koin），还包括稳健的单元测试/UI 测试以及生物识别身份验证等高级平台集成。
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

[Kotlin/Swift Interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)

文章

</td>
<td>
JetBrains

GitHub
</td>

<td>
与 iOS（Obj-C/Swift）的互操作性、SKIE、KMP-NativeCoroutines、语言功能缺失的变通方案、Swift 导出以及双向互操作。
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

[Multi-Modular Ecommerce App for Android and iOS (KMP)](https://www.udemy.com/course/multi-modular-ecommerce-app-for-android-ios-kmp/)

视频课程

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
完整的产品生命周期：从在 Figma 中设计电商应用 UI，到使用 Compose Multiplatform 共享 UI 构建完整的多模块应用，同时创建并集成包含 Firebase 身份验证、数据库及自动化云函数服务的完整后端。
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

[Exploring Ktor with Kotlin Multiplatform and Compose](https://www.linkedin.com/learning/exploring-ktor-with-kotlin-multiplatform-and-compose)

视频课程

</td>
<td>
Troy Miles

LinkedIn Learning
</td>

<td>
如何构建全栈 Kotlin 应用：先创建并部署安全的 Ktor 后端到 AWS，然后使用 Kotlin Multiplatform 构建带有共享代码的原生客户端来调用你的 API。
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

[Full-Stack Game Development - Kotlin and Compose Multiplatform](https://www.udemy.com/course/full-stack-game-development-kotlin-compose-multiplatform/)

视频课程

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
如何使用 Compose Multiplatform 构建完整的 2D 游戏，涵盖物理系统、碰撞检测和精灵表动画，以及如何将其部署到 Android、iOS、桌面端和 Web（通过 Kotlin/Wasm）。
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

[Philipp Lackner Full-Stack Bundle: KMP and Spring Boot](https://pl-coding.com/full-stack-bundle)

视频课程

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
如何架构、构建和部署完整的全栈聊天应用程序，涵盖从基于 WebSocket 的多模块 Spring Boot 后端，到离线优先的 Compose Multiplatform 客户端（Android、iOS、桌面端、Web）以及完整的 CI/CD 流水线。
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

[KMP for Native Mobile Teams](https://touchlab.co/kmp-teams-intro)

系列文章

</td>
<td>
Touchlab
</td>

<td>
如何在成熟的原生移动团队中推进完整的 KMP 落地过程：从获得初步支持、开展技术试点，到通过可持续的实际工作流扩展共享代码库。
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

[API Guidelines for Multiplatform Library Building](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

文档

</td>
<td>
JetBrains
</td>

<td>
如何设计多平台库的公共 API，遵循关键最佳做法以最大化代码复用并确保广泛的平台兼容性。
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

[Create Your Kotlin Multiplatform Library](create-kotlin-multiplatform-library.md)

教程

</td>
<td>
JetBrains
</td>

<td>
如何使用官方入门模板、配置本地 Maven 发布、构建库结构以及配置发布。
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

[Documentation with Dokka](https://kotlinlang.org/docs/dokka-introduction.html)

文档

</td>
<td>
JetBrains
</td>

<td>
如何使用 Dokka 自动为你的 KMP 库生成多种格式的专业 API 文档，并支持 Kotlin/Java 混合项目。
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

[KMP Library Template](https://github.com/Kotlin/multiplatform-library-template)

GitHub 模板

</td>
<td>
JetBrains

GitHub
</td>

<td>
如何使用官方模板快速搭建新的 KMP 库项目，该模板预配置了构建设置和发布的最佳做法。
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

[Publish to Maven Central](multiplatform-publish-libraries-to-maven.md)

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

[Kotlin Multiplatform Libraries](https://www.linkedin.com/learning/kotlin-multiplatform-libraries)

视频课程

</td>
<td>
LinkedIn Learning
</td>

<td>
创建 KMP 库的完整生命周期，从有效的 API 设计和代码共享策略，到最终分发与最佳做法。
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

<TabItem id="beginner" title="🌱 初级">

<include element-id="source" use-filter="empty,beginner" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="intermediate" title="🌿 中级">

<include element-id="source" use-filter="empty,intermediate" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="advanced" title="🌳 高级">

<include element-id="source" use-filter="empty,advanced" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="lib-authors" title="🧩 库作者">

<include element-id="source" use-filter="empty,lib-authors" from="kmp-learning-resources.md"/>

</TabItem>

</Tabs>