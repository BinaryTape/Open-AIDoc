[//]: # (title: Kotlin Multiplatform 快速入門指南)

## 從何處開始

1. 了解 Kotlin Multiplatform (KMP) 與 Compose Multiplatform (CMP)：
   [它們是什麼、其優勢與使用案例](kmp-overview.md)。
2. [在範例專案中嘗試 KMP](quickstart.md)，查看其組織方式以及如何在不同平台上執行。

## 學習 KMP 基礎知識

基礎知識包括：

* [了解 KMP / CMP 專案的組織方式](multiplatform-discover-project.md)。
  這涵蓋：
    * 共享模組中的通用與平台特定程式碼。
    * 目標平台宣告。
* [為 KMP 專案新增相依性](multiplatform-add-dependencies.md)。
    * 有關多平台與平台特定相依性組織的實際範例，請參閱我們的[範例](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)。
    * 引導至該範例最終狀態的教學可在[文件中查閱](multiplatform-upgrade-app.md)。
* 如果您已熟悉 KMP，請確保您已掌握針對一般專案的[推薦專案結構](multiplatform-project-recommended-structure.md)。
  它考量了 Android Gradle plugin 9.0 的發佈如何影響 KMP 專案的需求，並涵蓋：
    * 模組結構（具有作為程式庫使用的共享程式碼模組的獨立應用程式模組）。
    * 建立新的應用程式模組，並從與 AGP 8 搭配使用的舊結構進行轉移。
* 由 JetBrains 技術傳教士錄製的[專案結構建議影片](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## 共享程式碼

在 KMP 專案中共享程式碼有多種方式，並具有一些平台特性：

* 從應用程式模組呼叫通用程式碼的基礎範例涵蓋在引導教學中：
    * [針對原生 UI 與共享邏輯](multiplatform-create-first-app.md)
    * [針對共享 UI 與邏輯](compose-multiplatform-create-first-app.md)
* [如何存取平台特定 API](multiplatform-connect-to-apis.md)：
    * 盡可能使用多平台程式庫。
    * 當沒有合適的多平台程式庫可用時，請使用 `expect`/`actual` 機制。
* 雖然從 Android Kotlin 呼叫共享 Kotlin 相對直接，但 iOS 互通性需要一些時間來了解：
    * 一般而言，互通性越少越好，因此為了獲得更流暢的體驗，我們建議依賴 Compose Multiplatform 為所有平台建置大部分的 UI。
    * [了解如何將您的共享程式碼與 iOS 應用程式整合](multiplatform-ios-integration-overview.md#local-integration)（本文件中引用的所有範例都有 iOS 整合設定的示例）。
      > CocoaPods 封裝管理員通常正逐漸被 Swift Package Manager 取代，我們不建議在新的專案中使用它。
      >
      {style="note"}   
    * 查看包含讓 Kotlin 協同程式與 iOS 搭配運作的[範例與教學](multiplatform-upgrade-app.md#add-more-dependencies)。
    * 參閱在您的 [KMP iOS 應用程式中使用現有 SPM 套件](multiplatform-spm-import.md)的指南。
    * 閱讀[從 Kotlin 呼叫 Swift / ObjC](https://kotlinlang.org/docs/native-objc-interop.html) 以及反向呼叫的深入說明。
    * 了解更直接的 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 方法（目前為 Alpha 版本）。
    

## 探索生態系統

[klibs.io](https://klibs.io/) 提供多平台程式庫的完整型錄：

* 最受歡迎的案例已由強大的解決方案涵蓋，通常也有可用的替代方案：
  資料庫使用 [SQLDelight](https://sqldelight.github.io/sqldelight/) 與 [Room](https://developer.android.com/kotlin/multiplatform/room)，網路連線使用 [Ktor](https://ktor.io/) 與 [OkHttp](https://square.github.io/okhttp/)，圖片載入使用 [Coil](https://coil-kt.github.io/coil/) 等等。
* 提供了針對最熱門使用案例使用多平台程式庫建置的應用程式範例：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) 以及對應的[教學](multiplatform-ktor-sqldelight.md)。
    * 從[原始 Android 範例](https://github.com/android/compose-samples/tree/main/Jetcaster)轉換而來的[多平台 Jetcaster 應用程式](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## 建立 KMP 程式庫

如果您決定將您的共享程式碼打包成多平台程式庫，請查看以下文件頁面：

* [基礎程式庫教學](create-kotlin-multiplatform-library.md)
* [KMP 程式庫的發佈配置](multiplatform-publish-lib-setup.md)
* 將建置產物發佈到 [Maven Central](multiplatform-publish-libraries-to-maven.md) 與 [npm](multiplatform-publish-libraries-to-npm.md) 的教學

## 發佈建置產物

* 閱讀[發佈 KMP 應用程式的通用文章](multiplatform-publish-apps.md)。
* 別忘了 Apple App Store 所要求的[隱私權資訊清單](multiplatform-privacy-manifest.md)。

## 使用 AI 進行 KMP 開發

### 在您開始之前

#### 使用免費的 Junie 存取權限

Junie 是一款 JetBrains AI 代理。
針對 Shipaton 參賽者，JetBrains 提供免費存取 Junie CLI 代理 EAP 版本的權限。
您也可以透過 [IntelliJ IDE 中的 AI 對話功能](https://www.jetbrains.com/ai-ides/#getstarted)使用您的 Junie 代理。

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">領取您的 Junie 存取權限</a>

#### 設定並提交 AGENTS.md

AI 代理在探索陌生的程式碼庫時高度依賴 AGENTS.md 檔案，
因此準確且完整的上下文可以顯著提升其洞察與產生程式碼的品質。
例如，簡單地註明您的專案使用 Kotlin Multiplatform，就能幫助避免許多跨平台問題。

若要了解格式並查看範例，請造訪 [AGENTS.md](https://agents.md/) 網站。

#### 設定實用的 MCP 伺服器

這些 MCP 伺服器對於在 KMP 環境中建置應用程式的 AI 代理非常有用：

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) 伺服器
  有助於尋找合適的多平台程式庫。
* [Compose 熱重載](compose-hot-reload.md#mcp-server-for-ai-agents)伺服器
  允許代理快速迭代 UI。

### 建置功能

#### 使用計畫模式

對於較大的任務與分散式工作，大多數代理都支援**計畫模式**，這有助於分解任務
並產生清晰的逐步指示，讓您在正式開始產生程式碼前進行驗證。

花時間審查並精煉在計畫模式下完成的工作結果，通常在實作以下內容時能產生明顯更好的效果：
* 從頭開始開發面向使用者的功能、
* 架構變更、
* 程式庫整合、
* 大型重構。

#### 驗證 AI 產生的變更

除了 AI 一般的非決定性之外，Kotlin Multiplatform 還引入了難以全面涵蓋的多面向上下文。
例如，常見的情況是變更在一個平台上實作良好且運作正常，卻破壞了另一個平台。

為了解決這個問題，定義明確的驗收標準是一個好主意：

* 在引入變更後執行目標平台特定的測試（如果有的話）。
* 在認為任務完成前，驗證所有配置的 KMP 目標平台均已成功組建。
* 審查實作中是否有平台特定 API 洩漏到通用程式碼中：
  這可能會導致代理（以及人類）在後續階段中使用這些 API。

#### 使用 Kotlin AI 技能

Kotlin 團隊建置並維護旨在解決 Kotlin 特定問題的 AI 技能。
請參閱[技能儲存庫](https://github.com/Kotlin/kotlin-agent-skills)並為您的代理安裝技能。

#### 使用 Swift Package Manager 整合原生 iOS 程式庫

對於尚未有多平台程式庫支援的 iOS 功能，
您可能需要整合原生 iOS 程式庫。
我們建議使用 SwiftPM 套件與[對應的 DSL](multiplatform-spm-import.md) 來配置此類相依性。

Kotlin 團隊維護了一個[旨在將 CocoaPods 遷移至 SwiftPM 的 AI 技能](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)，
這對於從頭開始設定 SwiftPM 整合也很有幫助。

#### 設定代理編排

JetBrains Air 提供代理編排功能，可透過協調多個代理
同時處理專案的不同部分來加速工作。

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">嘗試使用 Air</a>

### 迭代 UI

#### 使用 Figma 產生 UI 設計與 Compose 程式碼

[Figma MCP 伺服器](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
可以幫助將設計轉換為 Compose 程式碼。

若要從頭開始產生 UI 設計，請考慮使用 [Google Stitch](https://stitch.withgoogle.com/) 或 [Figma Make](https://www.figma.com/make/)。

#### 使用 Gemini CLI 作為 Compose UI 任務的代理

我們在使用 Google 的模型（包括 [Flash 系列](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable)模型）產生 Compose 程式碼時，看到了一貫良好的結果。
它在生成速度、Token 消耗與 UI 品質之間取得了良好的平衡。

#### 使用 Compose 熱重載迭代 UI

[Compose 熱重載](compose-hot-reload.md)可實現近乎即時的 UI 更新，反映您（或您的代理）
在 Compose 程式碼中所做的變更。

為了幫助代理處理 UI，您可以將 [Compose 熱重載 MCP 伺服器](compose-hot-reload.md#mcp-server-for-ai-agents)
新增至您的代理配置中。
它使代理能夠直接觸發重載、擷取螢幕截圖，甚至與 UI 進行互動。

## 學習資源型錄

所有提到的資源，以及更深入的指南與第三方內容，都收錄在[學習資源](kmp-learning-resources.md)頁面中。