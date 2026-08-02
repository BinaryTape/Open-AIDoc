[//]: # (title: Kotlin Multiplatform 快速入门指南)

## 从哪里开始

1. 了解 Kotlin Multiplatform (KMP) 和 Compose Multiplatform (CMP)：
   它们是什么，以及它们的[优势与用例](kmp-overview.md)。
2. [在示例项目中尝试 KMP](quickstart.md)，查看它是如何组织的，以及它是如何在不同平台上运行的。

## 学习 KMP 基础

基础知识包括：

* [了解 KMP / CMP 项目是如何组织的](multiplatform-discover-project.md)。
  内容涵盖：
    * 共享模块中的公共代码和平台特定代码。
    * 目标平台声明。
* [向 KMP 项目添加依赖项](multiplatform-add-dependencies.md)。
    * 有关多平台和平台特定依赖项组织的实际示例，请参阅我们的[示例](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)。
    * 引导至该示例最终状态的教程已[在文档中提供](multiplatform-upgrade-app.md)。
* 如果你已经熟悉 KMP，请确保你已了解针对普通项目的[推荐项目结构](multiplatform-project-recommended-structure.md)。
  该结构考虑了 Android Gradle plugin 9.0 的发布如何影响对 KMP 项目的要求，并涵盖了：
    * 模块结构（带有作为库使用的共享代码模块的独立应用模块）。
    * 创建新的应用模块以及从 AGP 8 使用的旧结构进行迁移。
* 由 JetBrains 技术布道师录制的[关于项目结构的建议视频](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## 共享代码

在 KMP 项目中有不同的方式来共享代码，并带有一些平台特性：

* 入门教程涵盖了从应用模块调用公共代码的基础示例：
    * [针对原生 UI 和共享逻辑](multiplatform-create-first-app.md)
    * [针对共享 UI 和逻辑](compose-multiplatform-create-first-app.md)
* [如何访问平台特定 API](multiplatform-connect-to-apis.md)：
    * 尽可能使用多平台库。
    * 当没有合适的多平台库可用时，使用 `expect`/`actual` 机制。
* 虽然从 Android Kotlin 调用共享 Kotlin 相对简单，但 iOS 互操作性需要一些了解：
    * 通常情况下，互操作越少越好，因此为了获得更流畅的体验，我们建议依靠 Compose Multiplatform 为所有平台构建大部分 UI。
    * [了解如何将共享代码与 iOS 应用集成](multiplatform-ios-integration-overview.md#local-integration)（本文档中引用的所有示例都有设置好的 iOS 集成示例）。
      > CocoaPods 软件包管理器目前正被逐渐淘汰，转而使用 Swift Package Manager，我们不建议在新项目中使用它。
      >
      {style="note"}   
    * 查看包含使 Kotlin 协程在 iOS 上运行的[示例和教程](multiplatform-upgrade-app.md#add-more-dependencies)。
    * 参阅在 [KMP iOS 应用中使用现有 SPM 软件包](multiplatform-spm-import.md)的指南。
    * 阅读[关于从 Kotlin 调用 Swift / ObjC](https://kotlinlang.org/docs/native-objc-interop.html) 以及反之亦然的深入解释。
    * 了解更直接的 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 方法（目前处于 Alpha 阶段）。
    

## 探索生态系统

[klibs.io](https://klibs.io/) 提供了全面的多平台库目录：

* 大多数流行场景已经有了成熟的解决方案，通常还有备选方案：
  数据库使用 [SQLDelight](https://sqldelight.github.io/sqldelight/) 和 [Room](https://developer.android.com/kotlin/multiplatform/room)，网络使用 [Ktor](https://ktor.io/) 和 [OkHttp](https://square.github.io/okhttp/)，图片加载使用 [Coil](https://coil-kt.github.io/coil/)，等等。
* 提供了为最流行用例使用多平台库构建的应用示例：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final)
      以及对应的[教程](multiplatform-ktor-sqldelight.md)。
    * 从[原始 Android 示例](https://github.com/android/compose-samples/tree/main/Jetcaster)转换而来的[多平台 Jetcaster 应用](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## 创建 KMP 库

如果你决定通过使用多平台库来创建共享代码的应用，请查看以下文档页面：

* [基础库教程](create-kotlin-multiplatform-library.md)
* [KMP 库的发布配置](multiplatform-publish-lib-setup.md)
* 关于将构建工件发布到 [Maven Central](multiplatform-publish-libraries-to-maven.md) 和 [npm](multiplatform-publish-libraries-to-npm.md) 的教程

## 发布构建工件

* 阅读[关于发布 KMP 应用的通用文章](multiplatform-publish-apps.md)。
* 不要忘记 Apple App Store 要求的[隐私清单](multiplatform-privacy-manifest.md)。

## 将 AI 用于 KMP 开发

### 在开始之前

#### 使用免费的 Junie 访问权限

Junie 是一款 JetBrains AI 代理。
对于 Shipaton 参赛者，JetBrains 提供免费访问 Junie 命令行代理 EAP 版本的权限。
你也可以通过 [IntelliJ IDE 中的 AI 聊天功能](https://www.jetbrains.com/ai-ides/#getstarted)使用 Junie 代理。

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">领取你的 Junie 访问权限</a>

#### 设置并提交 AGENTS.md

AI 代理在探索陌生的代码库时非常依赖 AGENTS.md 文件，因此准确且全面的上下文可以显著提高其洞察和生成的代码质量。
例如，简单地注明你的项目使用了 Kotlin Multiplatform 就可以帮助避免许多跨平台问题。

要了解该格式并查看示例，请访问 [AGENTS.md](https://agents.md/) 网站。

#### 配置实用的 MCP 服务器

这些 MCP 服务器对于在 KMP 上下文中构建应用的 AI 代理非常有用：

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) 服务器有助于寻找合适的多平台库。
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) 服务器允许代理快速迭代 UI。

### 构建功能

#### 使用规划模式

对于较大的任务和分布式工作，大多数代理支持 **规划模式**，这有助于拆解任务并生成清晰的分步指令，你可以在正式开始代码生成前对其进行验证。

花时间审查和完善在规划模式下完成的工作结果，通常能显著提升以下方面的实现效果：
* 从头开始实现面向用户的功能、
* 架构变更、
* 库集成、
* 大型重构操作。

#### 验证 AI 生成的更改

除了通用的 AI 非确定性外，Kotlin Multiplatform 还引入了难以全面涵盖的多方面上下文。
例如，经常会出现更改在某一平台上实现良好且运行正常，但在另一平台上却导致崩溃的情况。

为了解决这个问题，最好定义具体的验收标准：

* 在引入更改后，只要有可用的平台特定测试，就运行它们。
* 在认为任务完成之前，验证所有配置的 KMP 目标是否都能成功构建。
* 审查实现中是否存在平台特定 API 泄露到公共代码中的情况：这可能会导致代理（以及人类）在后续阶段误用这些 API。 

#### 使用 Kotlin AI 技能

Kotlin 团队构建并维护旨在解决 Kotlin 特定问题的 AI 技能。
请参阅[技能仓库](https://github.com/Kotlin/kotlin-agent-skills)并为你的代理安装这些技能。

#### 使用 Swift Package Manager 集成原生 iOS 库

对于尚无多平台库支持的 iOS 功能，你可能需要集成原生 iOS 库。
我们建议使用 SwiftPM 软件包和[相应的 DSL](multiplatform-spm-import.md) 来配置此类依赖项。

Kotlin 团队维护了一个[旨在将 CocoaPods 迁移至 SwiftPM 的 AI 技能](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)，它对于从头开始设置 SwiftPM 集成也很有用。 

#### 设置代理编排

JetBrains Air 提供代理编排功能，通过协调多个同时处理项目不同部分的代理来帮助加速工作。

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">试用 Air</a>

### 迭代 UI

#### 使用 Figma 生成 UI 设计和 Compose 代码

[Figma MCP 服务器](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)可以帮助将设计转换为 Compose 代码。

若要从头开始生成 UI 设计，请考虑使用 [Google Stitch](https://stitch.withgoogle.com/) 或 [Figma Make](https://www.figma.com/make/)。

#### 使用 Gemini 命令行作为 Compose UI 任务的代理

我们在使用 Google 的模型（包括 [Flash 系列](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable)模型）生成 Compose 代码时，一直能看到不错的结果。
它在生成速度、Token 消耗和 UI 质量之间取得了良好的平衡。

#### 使用 Compose Hot Reload 迭代 UI

[Compose Hot Reload](compose-hot-reload.md) 能够实现近乎实时的 UI 更新，反映你（或你的代理）在 Compose 代码中所做的更改。

为了帮助代理处理 UI 任务，你可以将 [Compose Hot Reload MCP 服务器](compose-hot-reload.md#mcp-server-for-ai-agents)添加到你的代理配置中。
它使代理能够直接触发重新加载、抓屏，甚至与 UI 进行交互。

## 学习资源目录

所有提到的资源，以及更深入的指南和第三方内容，都编目在[学习资源](kmp-learning-resources.md)页面中。