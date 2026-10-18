[//]: # (title: Kotlin AI 技能)
[//]: # (description: 了解什麼是 Kotlin AI 技能、它們如何協助 AI 代理，以及在哪裡可以找到可用的技能。)

Kotlin AI 技能 (skills) 是可重複使用的指示，旨在協助 AI 代理 (agent)
更可靠地執行特定於 Kotlin 的任務。

技能會在 AI 代理開始執行任務之前，為其提供所需的上下文。
例如，技能可以指向相關的 API、定義先決條件，
或提供逐步的工作流程指引。

Kotlin AI 技能有助於代理產出更精確的結果，並減少您親自解說任務所花費的時間。
對團隊而言，技能還能為常見任務提供共享架構，確保每個人都能獲得一致的結果。

<a href="https://github.com/Kotlin/kotlin-agent-skills" as="button" mode="rock" icon="arrow-right" icon-position="right">探索 Kotlin AI 技能</a>

Kotlin AI 技能遵循 [Agent Skills 標準](https://agentskills.io/home)，因此您可以搭配
相容的 AI 代理使用，例如 [Junie](https://www.jetbrains.com/junie/)、Claude Code、OpenAI Codex、Google Gemini
以及 GitHub Copilot。

## 設定 AI 技能 {id="set-up-ai-skills"}

了解如何設定與使用 AI 技能：

* [在終端中使用代理](https://github.com/Kotlin/kotlin-agent-skills#installation)
* 在 IDE 中：
  * [IntelliJ IDEA](https://www.jetbrains.com/help/ai-assistant/agent-skills.html)
  * [Android Studio](https://developer.android.com/tools/agents/android-skills)

## 支援的工作流程 {id="supported-workflows"}

您可以針對不同的 Kotlin 專屬情境使用 Kotlin AI 技能。探索 AI 技能可以
協助您處理的各種任務。

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-ai-skills">
    <panel>
        <title>將 Java 原始檔轉換為 Kotlin</title>
        <p>將您的 Java 原始檔轉換為符合慣用法的 Kotlin，同時保留既有行為並套用 Kotlin 專屬的慣例。<br/>
        若要了解更多，請參閱<a href="mixing-java-kotlin-intellij.md">我們的教學</a>。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-java-to-kotlin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-java-to-kotlin">AI skill</a>
    </panel>
    <panel>
        <title>將多平台專案遷移至 AGP 9</title>
        <p>將您的 Kotlin Multiplatform 專案遷移至 AGP 9，並讓 AI 代理套用所需的專案和 Gradle 配置變更。<br/>
        若要了解更多，請參閱<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html">我們的指南</a>。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-agp9-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-agp9-migration">AI skill</a>
    </panel>
    <panel>
        <title>設計 JPA 實體對應</title>
        <p>為 Spring Data JPA 和 Hibernate 設計可靠的 Kotlin 實體，包括識別身分、關聯性、條件約束、擷取策略以及常見的 ORM 陷阱。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-backend-jpa-entity-mapping" as="button" icon="arrow-right" icon-position="right" id="kotlin-backend-jpa-entity-mapping">AI skill</a>
    </panel>
    <panel>
        <title>從 CocoaPods 遷移至 SwiftPM</title>
        <p>將 Kotlin Multiplatform 專案從 CocoaPods 相依性遷移至 Swift Package Manager 相依性。<br/>
         若要了解更多，請參閱<a href="https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html">我們的指南</a>。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-cocoapods-spm-migration">AI skill</a>
    </panel>
    <panel>
        <title>遷移至不可變集合 0.5.x</title>
        <p>將專案更新至 <code>kotlinx.collections.immutable</code> 程式庫的 <code>0.5.x</code> 版本，並替換已棄用的持久性集合操作。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-immutable-collections-0-5-x-migration" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-immutable-collections-0-5-x-migration">AI skill</a>
    </panel>
    <panel>
        <title>改善 Kotlin/Native 組建效能</title>
        <p>診斷緩慢的 Kotlin/Native 和 iOS 組建，並取得針對編譯、連結、快取、目標與 CI 配置的具體調整建議。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-native-build-performance" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-native-build-performance">AI skill</a>
    </panel>
    <panel>
        <title>將 Gradle 專案遷移至 Kotlin Toolchain</title>
        <p>將整個以 Gradle 為基礎的 Kotlin 專案遷移至 <a href="https://kotlin-toolchain.org/latest/">Kotlin Toolchain</a>，包括其配置、外掛程式和 CI 工作流程。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-project" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-project">AI skill</a>
    </panel>
    <panel>
        <title>將 Gradle 外掛程式轉換為 Kotlin Toolchain 外掛程式</title>
        <p>將現有的 Gradle 外掛程式重新實作為本機 Kotlin Toolchain 外掛程式。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-gradle-to-kotlin-toolchain-plugin" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-gradle-to-kotlin-toolchain-plugin">AI skill</a>
    </panel>
    <panel>
        <title>使用 Kotlin Toolchain 建置專案</title>
        <p>使用 Kotlin Toolchain 建立、配置、建置、測試及封裝 Kotlin 與 Java 專案。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain">AI skill</a>
    </panel>
    <panel>
        <title>建立 Kotlin Toolchain 外掛程式</title>
        <p>建立用於自訂建置任務、程式碼產生、驗證或封裝的本機外掛程式。</p>
        <a href="https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-kotlin-toolchain-plugin-authoring" as="button" icon="arrow-right" icon-position="right" id="kotlin-tooling-kotlin-toolchain-plugin-authoring">AI skill</a>
    </panel>
</panels>

## 參與貢獻並分享回饋 {id="contribute-and-share-feedback"}

Kotlin AI 技能皆為開源專案。歡迎測試現有的技能，並透過[回報問題](https://github.com/Kotlin/kotlin-agent-skills/issues/new)來分享您的回饋。

您也可以貢獻新的技能或改進既有技能。如需詳細資訊，請參閱[貢獻指南](https://github.com/Kotlin/kotlin-agent-skills/blob/main/CONTRIBUTING.md)。

## 取得支援 {id="get-support"}

如果您有任何疑問或遇到問題，請在 ![Slack](slack.svg){width=25}{type="joined"} Slack 尋求協助：[取得邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並在 `#ai` 頻道分享您的經驗。