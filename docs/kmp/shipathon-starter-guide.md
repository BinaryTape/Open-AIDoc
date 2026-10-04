[//]: # (title: Kotlin Multiplatform 入门指南)

## 从何处开始 {id="where-to-start"}

1. 了解 Kotlin Multiplatform (KMP) 和 Compose Multiplatform (CMP)：
   [它们是什么、其优势以及用例](kmp-overview.md)。
2. [在示例项目中体验 KMP](quickstart.md)，了解其组织结构以及在不同平台上的运行方式。

## 学习 KMP 基础知识 {id="learn-kmp-basics"}

基础知识包括：

* [了解 KMP / CMP 项目的组织结构](multiplatform-discover-project.md)。
  其中涵盖：
    * 共享模块中的公共代码与平台特定代码。
    * 目标平台声明。
* [向 KMP 项目添加依赖项](multiplatform-add-dependencies.md)。
    * 有关多平台和平台特定依赖项组织的实际示例，请参阅我们的[示例](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)。
    * 最终实现该示例状态的教程已[收录在文档中](multiplatform-upgrade-app.md)。
* 如果您已经熟悉 KMP，请确保及时跟进常规项目的[推荐项目结构](multiplatform-project-recommended-structure.md)。
  它考虑了 Android Gradle 插件 9.0 的发布对 KMP 项目要求的影响，
  并涵盖：
    * 模块结构（将共享代码模块作为库使用的独立应用模块）。
    * 创建新的应用模块，以及从 AGP 8 所使用的旧结构进行迁移。
* 由 JetBrains 技术布道师录制的[推荐项目结构视频](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## 共享代码 {id="share-code"}

在 KMP 项目中可以通过多种方式共享代码，并具有一些平台特定特性：

* 在入门教程中介绍了从应用模块调用公共代码的基础示例：
    * [针对原生 UI 和共享逻辑](multiplatform-upgrade-app.md)
    * [针对共享 UI 和逻辑](compose-multiplatform-new-project.md)
* [如何访问平台特定 API](multiplatform-connect-to-apis.md)：
    * 尽可能使用多平台库。
    * 没有合适的多平台库可用时，使用 `expect`/`actual` 机制。
* 尽管从 Android Kotlin 调用共享 Kotlin 相对直接，但 iOS 互操作性需要一定的时间去熟悉：
    * 一般来说，互操作越少越好，因此为了获得更流畅的体验，我们建议依靠 Compose Multiplatform 为所有平台构建大部分 UI。
    * [了解如何将共享代码与 iOS 应用集成](multiplatform-ios-integration-overview.md#local-integration)（本文档引用的所有示例均配置了 iOS 集成示例）。
      > CocoaPods 软件包管理器正逐渐被淘汰并让位于 Swift Package Manager，
      > 我们不建议在全新项目中使用它。
      >
      {style="note"}   
    * 查看包含使 Kotlin 协程在 iOS 上运行的[示例与教程](multiplatform-upgrade-app.md)。
    * 参阅关于在 [KMP iOS 应用中使用现有 SPM 包](multiplatform-spm-import.md)的指南。
    * 阅读[从 Kotlin 调用 Swift / ObjC 及其反向调用的深入解析](https://kotlinlang.org/docs/native-objc-interop.html)。
    * 了解更为直接的 [Swift 导出 (Swift export)](https://kotlinlang.org/docs/native-swift-export.html) 方案（目前处于 Alpha 阶段）。

## 探索生态系统 {id="discover-the-ecosystem"}

[klibs.io](https://klibs.io/) 上提供了全面的多平台库目录：

* 大多数热门用例均已有成熟的解决方案覆盖，
  通常还提供了备选方案：
  用于数据库的 [SQLDelight](https://sqldelight.github.io/sqldelight/) 和 [Room](https://developer.android.com/kotlin/multiplatform/room)，用于网络请求的 [Ktor](https://ktor.io/) 和 [OkHttp](https://square.github.io/okhttp/)，用于图片加载的 [Coil](https://coil-kt.github.io/coil/) 等。
* 针对最常见用例使用多平台库构建的应用示例现已提供：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final)
      及相应的[教程](multiplatform-ktor-sqldelight.md)。
    * 从[原生 Android 示例](https://github.com/android/compose-samples/tree/main/Jetcaster)转换而来的[多平台 Jetcaster 应用](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## 创建 KMP 库 {id="create-a-kmp-library"}

如果您决定将共享代码打包为多平台库，请参阅以下文档页面：

* [基础库教程](create-kotlin-multiplatform-library.md)
* [KMP 库的发布配置](multiplatform-publish-lib-setup.md)
* 将构件发布到 [Maven Central](multiplatform-publish-libraries-to-maven.md) 和 [npm](multiplatform-publish-libraries-to-npm.md) 的教程

## 发布构件 {id="publish-the-artifacts"}

* 阅读[发布 KMP 应用的通用文章](multiplatform-publish-apps.md)。
* 别忘了 Apple App Store 所要求的[隐私清单 (privacy manifest)](multiplatform-privacy-manifest.md)。

## 在 KMP 开发中使用 AI {id="using-ai-for-kmp-development"}

### 开始之前 {id="before-you-start"}

#### 获取免费的 Junie 访问权限 {id="use-the-free-junie-access"}

Junie 是 JetBrains 的 AI agent。
JetBrains 为 Shipaton 参与者免费提供 Junie CLI agent 的 EAP 版本访问权限。
您还可以通过 [JetBrains IDE 中的 AI 聊天功能](https://www.jetbrains.com/ai-ides/#getstarted)使用 Junie agent。

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">领取您的 Junie 访问权限</a>

#### 设置并提交 AGENTS.md {id="set-up-and-commit-agents-md"}

AI agent 在探索陌生代码库时严重依赖 AGENTS.md 文件，
因此准确而全面的上下文可以显著提升其洞察与生成代码的质量。
例如，仅需注明您的项目使用 Kotlin Multiplatform，便有助于避免许多跨平台问题。

如需了解格式并查看示例，请访问 [AGENTS.md](https://agents.md/) 网站。

#### 配置实用的 MCP 服务器 {id="configure-useful-mcp-servers"}

这些 MCP 服务器对于在 KMP 上下文中构建应用的 AI agent 非常有用：

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) 服务器
  有助于查找合适的多平台库。
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) 服务器
  允许 agent 快速迭代 UI。

### 构建功能 {id="build-features"}

#### 使用规划模式 {id="use-planning-mode"}

对于较大的任务和分布式工作，大多数 agent 都支持**规划模式 (planning mode)**，这有助于分解任务
并生成清晰的分步说明，供您在正式开始生成代码前进行验证。

花时间审查和完善规划模式下完成的工作成果，通常能在实现以下任务时带来明显更好的效果：
* 从头实现面向用户的功能、
* 架构变更、
* 库集成、
* 大型重构操作。

#### 验证 AI 生成的更改 {id="validate-ai-generated-changes"}

除了 AI 固有的不确定性之外，Kotlin Multiplatform 还引入了难以全面覆盖的多维度上下文。
例如，更改可能在一个平台上实现良好且正常运行，但在另一个平台上出现破坏性问题。

为解决这一问题，明确具体的验收标准是一个好方法：

* 引入更改后，只要有针对特定目标的测试可用，就运行这些测试。
* 在认定任务完成之前，请先验证所有已配置的 KMP 目标均可成功构建。
* 审查实现中是否存在平台特定 API 泄漏到公共代码的情况：
  这会导致 agent（以及开发人员）在后续阶段误用这些 API。

#### 使用 Kotlin AI 技能 {id="use-kotlin-ai-skills"}

Kotlin 团队构建并维护旨在解决 Kotlin 特定问题的 AI 技能 (AI skills)。
请参阅[技能仓库](https://github.com/Kotlin/kotlin-agent-skills)并为您的 agent 安装这些技能。

#### 使用 Swift Package Manager 集成原生 iOS 库 {id="use-swift-package-manager-to-integrate-native-ios-libraries"}

对于尚无多平台库支持的 iOS 功能，
您可能需要集成原生 iOS 库。
我们推荐使用 SwiftPM 包以及[相应的 DSL](multiplatform-spm-import.md) 来配置此类依赖项。

Kotlin 团队维护了一套[用于从 CocoaPods 迁移到 SwiftPM 的 AI 技能](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)，
这对于从头设置 SwiftPM 集成同样非常有用。

#### 设置 Agent 编排 {id="set-up-agent-orchestration"}

JetBrains Air 提供了 Agent 编排功能，通过协调多个 agent
同时处理项目的不同部分，有助于加快开发进度。

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">体验 Air</a>

### 迭代 UI {id="iterate-on-ui"}

#### 使用 Figma 生成 UI 设计与 Compose 代码 {id="use-figma-to-generate-ui-designs-and-compose-code"}

[Figma MCP 服务器](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
有助于将设计转换为 Compose 代码。

如需从头生成 UI 设计，可以考虑使用 [Google Stitch](https://stitch.withgoogle.com/) 或 [Figma Make](https://www.figma.com/make/)。

#### 使用 Gemini CLI 作为处理 Compose UI 任务的 agent {id="use-gemini-cli-as-the-agent-for-compose-ui-tasks"}

在使用 Google 的模型（包括 [Flash 系列](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable)中的模型）生成 Compose 代码时，我们看到了持续优异的表现。
它在生成速度、Token 消耗和 UI 质量之间取得了良好的平衡。

#### 使用 Compose Hot Reload 迭代 UI {id="use-compose-hot-reload-to-iterate-on-ui"}

[Compose Hot Reload](compose-hot-reload.md) 能够实现近乎实时的 UI 更新，反映您——或您的 agent——在 Compose 代码中所做的更改。

为了协助 agent 处理 UI，您可以将 [Compose Hot Reload MCP 服务器](compose-hot-reload.md#mcp-server-for-ai-agents)添加到 agent 配置中。
它使 agent 能够直接触发重载、截取屏幕截图，甚至与 UI 进行交互。

## 学习资源目录 {id="learning-resources-catalog"}

所有上述资源，以及更深入的指南和第三方内容，均收录在[学习资源](kmp-learning-resources.md)页面中。