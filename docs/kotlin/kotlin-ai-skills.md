[//]: # (title: Kotlin AI 技能)
[//]: # (description: 了解什么是 Kotlin AI 技能、它们如何协助 AI Agent，以及在何处查找可用技能。)

Kotlin AI 技能是可重用的指令，可帮助 AI Agent 更可靠地执行 Kotlin 特定的任务。

技能会在 AI Agent 开始执行任务之前为其提供所需的上下文。例如，技能可以指向相关 API、定义先决条件，或提供分步工作流指导。

Kotlin AI 技能有助于 Agent 生成更准确的结果，并减少您亲自解释任务所花费的时间。对于团队而言，技能还为常见任务提供了共享框架，从而使每个人都能获得一致的结果。

<a href="https://github.com/Kotlin/kotlin-agent-skills" as="button" mode="rock" icon="arrow-right" icon-position="right">探索 Kotlin AI 技能</a>

Kotlin AI 技能遵循 [Agent Skills 标准](https://agentskills.io/home)，因此您可以将其与兼容的 AI Agent 配合使用，例如 [Junie](https://www.jetbrains.com/junie/)、Claude Code、OpenAI Codex、Google Gemini 以及 GitHub Copilot。

## 设置 AI 技能 {id="set-up-ai-skills"}

了解如何设置和使用 AI 技能：

* [在终端中与 Agent 搭配使用](https://github.com/Kotlin/kotlin-agent-skills#installation)
* 在 IDE 中：
  * [IntelliJ IDEA](https://www.jetbrains.com/help/ai-assistant/agent-skills.html)
  * [Android Studio](https://developer.android.com/tools/agents/android-skills)

## 支持的工作流 {id="supported-workflows"}

您可以将 Kotlin AI 技能用于各种特定于 Kotlin 的场景。探索 AI 技能可以帮助您完成的不同任务。

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-ai-skills">
    <panel>
        <title>将 Java 源文件转换为 Kotlin</title>
        <p>在保持行为不变并应用 Kotlin 特定约定的同时，将您的 Java 源文件转换为符合习惯用法的 Kotlin 代码。<br/>
        在<a href="mixing-java-kotlin-intellij.md">我们的教程</a>中详细了解。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-java-to-kotlin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-java-to-kotlin">AI 技能</a>
    </panel>
    <panel>
        <title>将多平台项目迁移至 AGP 9</title>
        <p>将您的 Kotlin Multiplatform 项目迁移至 AGP 9，并让 AI Agent 应用所需的项目和 Gradle 构建配置变更。<br/>
        在<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html">我们的指南</a>中详细了解。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-agp9-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-agp9-migration">AI 技能</a>
    </panel>
    <panel>
        <title>设计 JPA 实体映射</title>
        <p>为 Spring Data JPA 和 Hibernate 设计可靠的 Kotlin 实体，包括标识、关系、约束、抓取策略以及规避常见的 ORM 陷阱。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-backend-jpa-entity-mapping" as="button" icon="arrow-right" icon-position="right" id="kotlin-backend-jpa-entity-mapping">AI 技能</a>
    </panel>
    <panel>
        <title>从 CocoaPods 迁移至 SwiftPM</title>
        <p>将 Kotlin Multiplatform 项目从 CocoaPods 依赖项迁移至 Swift Package Manager 依赖项。<br/>
         在<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html">我们的指南</a>中详细了解。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-cocoapods-spm-migration">AI 技能</a>
    </panel>
    <panel>
        <title>迁移至不可变集合 0.5.x</title>
        <p>将项目更新至 <code>kotlinx.collections.immutable</code> 库的 <code>0.5.x</code> 版本，并替换已弃用的持久化集合操作。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-immutable-collections-0-5-x-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-immutable-collections-0-5-x-migration">AI 技能</a>
    </panel>
    <panel>
        <title>提高 Kotlin/Native 构建性能</title>
        <p>诊断缓慢的 Kotlin/Native 和 iOS 构建，并获取针对编译、链接、缓存、目标平台和 CI 配置的有针对性的修改建议。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-native-build-performance" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-native-build-performance">AI 技能</a>
    </panel>
    <panel>
        <title>将 Gradle 项目迁移至 Kotlin Toolchain</title>
        <p>将整个基于 Gradle 的 Kotlin 项目迁移至 <a href="https://kotlin-toolchain.org/latest/">Kotlin Toolchain</a>，包括其配置、插件和 CI 工作流。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-project" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-project">AI 技能</a>
    </panel>
    <panel>
        <title>将 Gradle 插件转换为 Kotlin Toolchain 插件</title>
        <p>将现有的 Gradle 插件重新实现为本地 Kotlin Toolchain 插件。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-plugin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-plugin">AI 技能</a>
    </panel>
    <panel>
        <title>使用 Kotlin Toolchain 构建项目</title>
        <p>使用 Kotlin Toolchain 创建、配置、构建、测试和打包 Kotlin 与 Java 项目。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain">AI 技能</a>
    </panel>
    <panel>
        <title>创建 Kotlin Toolchain 插件</title>
        <p>创建用于自定义构建任务、代码生成、验证或打包的本地插件。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain-plugin-authoring" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain-plugin-authoring">AI 技能</a>
    </panel>
</panels>

## 贡献与分享反馈 {id="contribute-and-share-feedback"}

Kotlin AI 技能是开源的。测试可用技能并通过[报告问题](https://github.com/Kotlin/kotlin-agent-skills/issues/new)分享您的反馈。

您也可以贡献新技能或改进现有技能。要了解更多信息，请参阅[贡献指南](https://github.com/Kotlin/kotlin-agent-skills/blob/main/CONTRIBUTING.md)。

## 获取支持 {id="get-support"}

如果您有任何疑问或遇到问题，请在 ![Slack](slack.svg){width=25}{type="joined"} Slack 中寻求帮助：[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，并在 `#ai` 频道中分享您的体验。