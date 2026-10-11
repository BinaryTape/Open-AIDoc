[//]: # (title: 什麼是 Kotlin Multiplatform)
[//]: # (description: Kotlin Multiplatform 是一項來自 JetBrains 的開源技術，可讓您在 Android、iOS、桌面、Web 與伺服器之間共享程式碼。)

Kotlin Multiplatform (KMP) 是一項來自 JetBrains 的開源技術，可讓您在 Android、iOS、桌面、Web 與伺服器之間共享程式碼，同時保留原生程式碼開發的優勢。

搭配 Compose Multiplatform，您還可以跨多個平台共享 UI 程式碼，實現最大程度的程式碼重複使用。

## 為什麼企業選擇 KMP {id="why-companies-choose-kmp"}

### 成本效益與更快的交付速度 {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatform 有助於精簡技術與組織流程：

* 您可以透過跨平台共享邏輯與 UI 程式碼來減少重複工作並降低維護成本。這也讓在多個平台上同步發布功能成為可能。
* 團隊協作變得更加輕鬆，因為統一的邏輯可以在共享程式碼中存取，讓團隊成員之間的知識轉移更容易，並減少各專屬平台團隊之間的重複工作量。

除了縮短上市時間外，**55%** 的使用者表示採用 KMP 後協作獲得改善，且 **65%** 的團隊回報效能與品質有所提升（取自 2024 年第二季 KMP 調查）。

從新創公司到跨國企業，各種規模的組織都在實際環境中使用 KMP。Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和嗶哩嗶哩等公司都已採用 KMP，因為它具備靈活性、原生效能、提供原生使用者體驗的能力、成本效益，以及對漸進式採用的支援。[進一步了解已採用 KMP 的公司](https://kotlinlang.org/case-studies/?type=multiplatform)。

### 程式碼共享的靈活性 {id="flexibility-of-code-sharing"}

您可以依照自己的節奏共享程式碼：共享獨立的模組（例如網路或存儲），並隨著時間推進逐步擴展共享程式碼。
您也可以共享所有的商務邏輯，同時保持原生 UI；或者使用 Compose Multiplatform 逐步遷移 UI。

![漸進式 KMP 採用說明：共享部分邏輯且不共享 UI、共享所有邏輯而不共享 UI、共享邏輯與 UI](kmp-graphic.png){width="700"}

### iOS 上的原生體驗 {id="native-feel-on-ios"}

您可以完全使用 SwiftUI 或 UIKit 建置 UI、透過 Compose Multiplatform 在 Android 和 iOS 上打造一致的體驗，或根據需求混合搭配原生與共享的 UI 程式碼。

無論採用哪種方式，您都可以打造出在各個平台上都具有原生觸感的應用程式：

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 原生效能 {id="native-performance"}

Kotlin Multiplatform 利用 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 產生原生二進制檔案，並在不適合或無法使用虛擬機器的環境（例如 iOS）中直接存取平台 API。

這有助於在撰寫與平台無關的程式碼時，實現接近原生的效能：

![顯示 Compose Multiplatform 與 SwiftUI 在 iPhone 13 和 iPhone 16 的 iOS 上具有相近效能的圖表](cmp-ios-performance.png){width="700"}

### 無縫的工具整合 {id="seamless-tooling"}

IntelliJ IDEA 和 Android Studio 透過 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)為 KMP 提供智慧 IDE 支援，其中包括通用 UI 預覽、[Compose Hot Reload](compose-hot-reload.md) 以及其他實用便利的功能。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 賦能的開發 {id="ai-powered-development"}

讓 JetBrains 的 AI 編碼代理 [Junie](https://jetbrains.com/junie) 協助處理 KMP 任務，助您的團隊加速前進。

## 探索 Kotlin Multiplatform 使用案例 {id="discover-kotlin-multiplatform-use-cases"}

看看企業與開發人員如何享受共享 Kotlin 程式碼帶來的優勢：

* 在我們的[案例研究頁面](https://kotlinlang.org/case-studies/?type=multiplatform)中了解各家公司如何成功在程式碼庫中採用 KMP。
* 在我們的[精選範例清單](multiplatform-samples.md)以及 GitHub [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 主題中查看豐富的範例應用程式。

## 學習基礎知識 {id="learn-the-basics"}

若想快速體驗 KMP 的實際運作，請試試[快速入門指南](quickstart.md)。
您將設定好環境並在不同平台上執行範例應用程式。

選擇使用案例
: * 若要建立一個在平台間同時共享 UI 與商務邏輯程式碼的應用程式，請遵循[共享邏輯與 UI 教學](compose-multiplatform-new-project.md)。
  * 若要了解如何將 Android 應用程式轉變為多平台應用程式，請參閱我們的[遷移教學](multiplatform-integrate-in-existing-app.md)。
  * 若想了解如何在不共享 UI 實作的情況下共享部分程式碼，請遵循[共享邏輯教學](multiplatform-upgrade-app.md)。

深入探討技術細節
: * 從[基本專案結構](multiplatform-discover-project.md)開始。
  * 了解現有的[程式碼共享機制](multiplatform-share-on-platforms.md)。
  * 查看在 KMP 專案中[相依性如何運作](multiplatform-add-dependencies.md)。
  * 評估不同的 [iOS 整合方法](multiplatform-ios-integration-overview.md)。
  * 了解 KMP 如何針對各種目標[編譯程式碼](multiplatform-configure-compilations.md)並[建置二進制檔案](multiplatform-build-native-binaries.md)。
  * 閱讀關於[發布多平台應用程式](multiplatform-publish-apps.md)或[多平台程式庫](multiplatform-publish-lib-setup.md)的內容。

## 探索 Kotlin Multiplatform 程式庫生態系統 {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

已有數千個多平台程式庫可用於網路、存儲、相依注入、測試、UI、序列化等領域。

您可以在 JetBrains 維護的搜尋平台 [klibs.io](https://klibs.io) 上瀏覽這些程式庫。

## 大規模採用 Kotlin Multiplatform {id="adopt-kotlin-multiplatform-at-scale"}

在團隊中採用跨平台架構可能是一項挑戰。
若要了解相關優勢及潛在問題的解決方案，請參閱我們關於跨平台開發的高階概觀：

* [什麼是跨平台行動開發？](cross-platform-mobile-development.topic)：提供跨平台應用程式之不同方法與實作的概觀。
* [如何向團隊介紹多平台行動開發](multiplatform-introduce-your-team.md)：提供在團隊中引入跨平台開發的策略。
* [採用 Kotlin Multiplatform 為專案增強動力的十個理由](multiplatform-reasons-to-try.md)：列出採用 Kotlin Multiplatform 作為跨平台解決方案的理由。