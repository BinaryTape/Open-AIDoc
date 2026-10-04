[//]: # (title: Kotlin Multiplatform 入門指南)

## 從何處開始 {id="where-to-start"}

1. 了解 Kotlin Multiplatform (KMP) 與 Compose Multiplatform (CMP)：
   [它們是什麼、各自的優勢以及使用案例](kmp-overview.md)。
2. [在範例專案中試用 KMP](quickstart.md)，了解其組織方式以及如何在不同平台上執行。

## 學習 KMP 基礎知識 {id="learn-kmp-basics"}

基礎知識包括：

* [了解 KMP / CMP 專案的組織架構](multiplatform-discover-project.md)。
  涵蓋內容：
    * 共享模組中的通用程式碼與平台專屬程式碼。
    * 目標平台宣告。
* [為 KMP 專案新增相依性](multiplatform-add-dependencies.md)。
    * 有關多平台與平台專屬相依性組織的實用範例，請參閱我們的[範例](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)。
    * 導向該範例最終狀態的教學可[在說明文件中取得](multiplatform-upgrade-app.md)。
* 如果你已經熟悉 KMP，請確保你掌握了一般專案的[建議專案結構](multiplatform-project-recommended-structure.md)最新資訊。
  該結構考慮了 Android Gradle 外掛程式 9.0 版本對 KMP 專案需求的影響，
  並涵蓋：
    * 模組結構（獨立的應用程式模組，並將共用程式碼模組作為程式庫使用）。
    * 建立新的應用程式模組，以及從 AGP 8 所使用的舊結構進行移轉。
* 由 JetBrains 技術傳教士錄製的[專案結構建議影片](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## 共用程式碼 {id="share-code"}

在 KMP 專案中共用程式碼有不同的方式，並具有某些平台專屬特性：

* 從應用程式模組呼叫通用程式碼的基本範例已在新手教學中涵蓋：
    * [適用於原生 UI 與共用邏輯](multiplatform-upgrade-app.md)
    * [適用於共用 UI 與邏輯](compose-multiplatform-new-project.md)
* [如何存取平台專屬 API](multiplatform-connect-to-apis.md)：
    * 盡可能使用多平台庫。
    * 當沒有合適的多平台庫可用時，使用 `expect`/`actual` 機制。
* 雖然從 Android Kotlin 呼叫共用的 Kotlin 程式碼相對直觀，但 iOS 互通性需要一些時間熟悉：
    * 一般而言，互通程式碼越少越好，因此為了獲得更順暢的體驗，我們建議仰賴 Compose Multiplatform 來建構所有平台的大部分 UI。
    * [了解如何將共用程式碼與 iOS 應用程式整合](multiplatform-ios-integration-overview.md#local-integration)（本文件引用的所有範例均設定了 iOS 整合範例）。
      > CocoaPods 封裝管理員目前普遍正被淘汰，轉而採用 Swift Package Manager，
      > 我們不建議在全新專案中使用它。
      >
      {style="note"}   
    * 查看包含使 Kotlin 協同程式在 iOS 上運行的[範例與教學](multiplatform-upgrade-app.md)。
    * 請參閱有關在 [KMP iOS 應用程式中使用既有 SPM 套件](multiplatform-spm-import.md)的指南。
    * 閱讀[從 Kotlin 呼叫 Swift / ObjC 以及反向呼叫的深入說明](https://kotlinlang.org/docs/native-objc-interop.html)。
    * 了解更直接的 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 方式（目前處於 Alpha 階段）。
    

## 探索生態系統 {id="discover-the-ecosystem"}

完整的跨平台庫目錄可在 [klibs.io](https://klibs.io/) 取得：

* 大多數熱門情境都已具備健全的解決方案，
  且通常有可替代的方案：
  資料庫可選用 [SQLDelight](https://sqldelight.github.io/sqldelight/) 與 [Room](https://developer.android.com/kotlin/multiplatform/room)，網路連線可選用 [Ktor](https://ktor.io/) 與 [OkHttp](https://square.github.io/okhttp/)，圖片載入可選用 [Coil](https://coil-kt.github.io/coil/) 等等。
* 提供了為最常見使用案例使用多平台庫建置的應用程式範例：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final)
      以及對應的[教學](multiplatform-ktor-sqldelight.md)。
    * [多平台 Jetcaster 應用程式](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)，
      由[原始 Android 範例](https://github.com/android/compose-samples/tree/main/Jetcaster)轉換而來。

## 建立 KMP 程式庫 {id="create-a-kmp-library"}

如果你決定將共用程式碼打包為多平台庫，請查看以下說明文件頁面：

* [基礎程式庫教學](create-kotlin-multiplatform-library.md)
* [KMP 程式庫的發佈配置](multiplatform-publish-lib-setup.md)
* 關於將建置產物發佈至 [Maven Central](multiplatform-publish-libraries-to-maven.md) 與 [npm](multiplatform-publish-libraries-to-npm.md) 的教學

## 發佈建置產物 {id="publish-the-artifacts"}

* 閱讀[發佈 KMP 應用程式的通用文章](multiplatform-publish-apps.md)。
* 切勿遺漏 Apple App Store 所要求的[隱私權清單](multiplatform-privacy-manifest.md)。

## 使用 AI 進行 KMP 開發 {id="using-ai-for-kmp-development"}

### 開始之前 {id="before-you-start"}

#### 使用免費的 Junie 存取權限 {id="use-the-free-junie-access"}

Junie 是一款 JetBrains AI Agent。
對於 Shipaton 參賽者，JetBrains 提供 Junie CLI Agent 的 EAP 版本免費存取權限。
你也可以透過 [JetBrains IDE 中的 AI 聊天功能](https://www.jetbrains.com/ai-ides/#getstarted)使用 Junie Agent。

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">領取你的 Junie 存取權限</a>

#### 設定並提交 AGENTS.md {id="set-up-and-commit-agents-md"}

AI Agent 在探索不熟悉的程式碼庫時非常仰賴 AGENTS.md 檔案，
因此準確且全面的上下文可以顯著提升其洞察與生成程式碼的品質。
例如，僅僅註明你的專案使用 Kotlin Multiplatform 就能幫助避免許多跨平台問題。

若要了解其格式並查看範例，請瀏覽 [AGENTS.md](https://agents.md/) 網站。

#### 設定有用的 MCP 伺服器 {id="configure-useful-mcp-servers"}

以下 MCP 伺服器對於在 KMP 環境中建構應用程式的 AI Agent 非常有用：

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) 伺服器
  有助於尋找合適的多平台庫。
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) 伺服器
  允許 Agent 快速反覆運算 UI。

### 建構功能 {id="build-features"}

#### 使用規劃模式 {id="use-planning-mode"}

對於較大的任務與分散式工作，大多數 Agent 都支援**規劃模式**（planning mode），這有助於分解任務
並產生清晰的逐步指示，你可以在真正開始產生程式碼之前先行驗證。

花時間審查並完善規劃模式下的工作成果，通常能在實作以下項目時獲得顯著更好的成效：
* 從頭開始實作面向使用者的功能、
* 架構變更、
* 程式庫整合、
* 大型重構作業。

#### 驗證 AI 產生的變更 {id="validate-ai-generated-changes"}

除了 AI 本身的非確定性之外，Kotlin Multiplatform 還引入了難以全面涵蓋的多層面上下文。
例如，變更在某個平台上實作良好且運作正常，但在另一個平台上卻造成中斷的情況十分常見。

為了解決這個問題，明確定義具體的驗收標準是個好方法：

* 引入變更後，只要有目標專屬測試可用，就執行這些測試。
* 在認定任務完成之前，驗證所有已設定的 KMP 目標均可成功建置。
* 審查實作程式碼，避免平台專屬 API 洩漏至通用程式碼中：
  這可能導致 Agent（以及人類）在後續階段誤用這些 API。

#### 使用 Kotlin AI 技能 {id="use-kotlin-ai-skills"}

Kotlin 團隊建立並維護旨在解決 Kotlin 專屬問題的 AI 技能。
請查看[技能儲存庫](https://github.com/Kotlin/kotlin-agent-skills)並為你的 Agent 安裝相關技能。

#### 使用 Swift Package Manager 整合原生 iOS 程式庫 {id="use-swift-package-manager-to-integrate-native-ios-libraries"}

對於尚無多平台庫支援的 iOS 功能，
你可能需要整合原生 iOS 程式庫。
我們建議使用 SwiftPM 套件以及[相應的 DSL](multiplatform-spm-import.md) 來配置此類相依性。

Kotlin 團隊維護了一項[旨在從 CocoaPods 移轉至 SwiftPM 的 AI 技能](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)，
該技能在從頭開始設定 SwiftPM 整合時也很有幫助。

#### 設定 Agent 編排 {id="set-up-agent-orchestration"}

JetBrains Air 提供 Agent 編排功能，可透過協調多個 Agent 同時處理專案的不同部分來加快工作進度。

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">試用 Air</a>

### 反覆運算 UI {id="iterate-on-ui"}

#### 使用 Figma 產生 UI 設計與 Compose 程式碼 {id="use-figma-to-generate-ui-designs-and-compose-code"}

[Figma MCP 伺服器](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
有助於將設計轉換為 Compose 程式碼。

若要從頭開始產生 UI 設計，可以考慮使用 [Google Stitch](https://stitch.withgoogle.com/) 或 [Figma Make](https://www.figma.com/make/)。

#### 使用 Gemini CLI 作為處理 Compose UI 任務的 Agent {id="use-gemini-cli-as-the-agent-for-compose-ui-tasks"}

我們在利用 Google 的模型（包括 [Flash 系列](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable)中的模型）產生 Compose 程式碼時，看到了持續優異的成效。
它在生成速度、權杖消耗量和 UI 品質之間達到了良好的平衡。

#### 使用 Compose Hot Reload 反覆運算 UI {id="use-compose-hot-reload-to-iterate-on-ui"}

[Compose Hot Reload](compose-hot-reload.md) 支援近乎即時的 UI 更新，能立即反映你 — 或你的 Agent — 在 Compose 程式碼中所做的變更。

為了協助 Agent 處理 UI，你可以將 [Compose Hot Reload MCP 伺服器](compose-hot-reload.md#mcp-server-for-ai-agents)新增到你的 Agent 設定中。
這讓 Agent 能夠直接觸發重新載入、擷取螢幕截圖，甚至與 UI 進行互動。

## 學習資源目錄 {id="learning-resources-catalog"}

所有提及的資源，連同更深入的指南與第三方內容，均已收錄在[學習資源](kmp-learning-resources.md)頁面中。