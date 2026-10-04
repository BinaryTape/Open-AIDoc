[//]: # (title: 什麼是 Kotlin Multiplatform)
[//]: # (description: Kotlin Multiplatform 是 JetBrains 推出的一項開源技術，支援在 Android、iOS、桌面、Web 與伺服器之間共用程式碼。)

Kotlin Multiplatform (KMP) 是 JetBrains 推出的一項開源技術，支援在 Android、iOS、桌面、Web 與伺服器之間共用程式碼，同時保有原生開發的優勢。

搭配 Compose Multiplatform，你還可以在多個平台間共用 UI 程式碼，實現最大程度的程式碼重複使用。

## 為什麼企業選擇 KMP {id="why-companies-choose-kmp"}

### 成本效益與更快速的交付 {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatform 有助於簡化技術與組織流程：

* 透過跨平台共用邏輯與 UI 程式碼，你可以減少重複開發與維護成本。這也讓同時在多個平台上發布新功能成為可能。
* 團隊協作變得更加輕鬆，因為共用程式碼中包含統一的邏輯，使團隊成員之間的知識轉移更簡單，並減少專門平台團隊之間的重複工作。

除了能加快產品上市時間外，有 **55%** 的使用者表示採用 KMP 後改善了協作關係，且有 **65%** 的團隊表示效能與品質有所提升（取自 2024 年第二季 KMP 調查報告）。

從新創公司到全球企業，各種規模的組織都在生產環境中使用 KMP。
Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和嗶哩嗶哩等公司採用 KMP，正是著眼於其彈性、原生效能、提供原生使用者體驗的能力、成本效益以及對逐步採用的支援。[進一步了解採用 KMP 的公司](https://kotlinlang.org/case-studies/?type=multiplatform)。

### 程式碼共用的彈性 {id="flexibility-of-code-sharing"}

你可以按照自己的步調共用程式碼：共用獨立的模組（例如網路連線或存儲），並隨著時間推進逐步擴展共用程式碼的範圍。
你也可以共用所有的商業邏輯但保留原生 UI，或是使用 Compose Multiplatform 逐步遷移 UI。

![逐步採用 KMP 的圖解：共用部分邏輯且不共用 UI、共用全部邏輯但不共用 UI、共用邏輯與 UI](kmp-graphic.png){width="700"}

### iOS 上的原生質感 {id="native-feel-on-ios"}

你可以完全使用 SwiftUI 或 UIKit 來建置 UI、透過 Compose Multiplatform 在 Android 與 iOS 上打造一致的體驗，或是根據需求混合搭配原生與共用的 UI 程式碼。

無論採用哪種方式，你都能打造出在各個平台上都具備原生質感的應用程式：

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 原生效能 {id="native-performance"}

Kotlin Multiplatform 利用 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 產生原生二進制檔案，並在不適合或無法使用虛擬機的環境（例如 iOS）中直接存取平台 API。

這有助於在撰寫無關平台的程式碼時，依然能獲得接近原生的效能：

![展示 Compose Multiplatform 與 SwiftUI 在 iPhone 13 與 iPhone 16 的 iOS 上效能相當的圖表](cmp-ios-performance.png){width="700"}

### 無縫的工具鏈支援 {id="seamless-tooling"}

IntelliJ IDEA 與 Android Studio 透過 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 為 KMP 提供智慧 IDE 支援，具備共用 UI 預覽、[Compose Multiplatform 熱重載 (hot reload)](compose-hot-reload.md)、跨語言導覽、重構作業，以及跨 Kotlin 與 Swift 程式碼的偵錯功能。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 賦能的開發 {id="ai-powered-development"}

讓 JetBrains 的 AI 編碼代理 [Junie](https://jetbrains.com/junie) 協助處理 KMP 任務，讓你的團隊開發更加迅速。

## 探索 Kotlin Multiplatform 使用案例 {id="discover-kotlin-multiplatform-use-cases"}

看看各家企業與開發人員如何享受共用 Kotlin 程式碼帶來的好處：

* 在我們的[案例研究頁面](https://kotlinlang.org/case-studies/?type=multiplatform)深入了解企業如何成功在程式碼庫中導入 KMP。
* 在我們[精選的範例清單](multiplatform-samples.md)以及 GitHub 的 [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 主題中查看豐富的範例應用程式。

## 學習基本概念 {id="learn-the-basics"}

若想快速體驗 KMP 的實際運作，請參考[快速入門指南](quickstart.md)。
你將設定開發環境並在不同平台上執行範例應用程式。

選擇使用案例
: * 若想建立一個在平台間同時共用 UI 與商業邏輯程式碼的應用程式，請參考[共用邏輯與 UI 教學](compose-multiplatform-new-project.md)。
  * 若想了解如何將 Android 應用程式轉變為多平台應用程式，請參閱我們的[遷移教學](multiplatform-integrate-in-existing-app.md)。
  * 若想了解如何在不共用 UI 實作的情況下共用部分程式碼，請參考[共用邏輯教學](multiplatform-upgrade-app.md)。

深入技術細節
: * 從[基本專案結構](multiplatform-discover-project.md)開始了解。
  * 了解各種可用的[程式碼共用機制](multiplatform-share-on-platforms.md)。
  * 了解 KMP 專案中[相依性的運作方式](multiplatform-add-dependencies.md)。
  * 評估不同的 [iOS 整合方式](multiplatform-ios-integration-overview.md)。
  * 了解 KMP 如何針對各種目標平台[編譯程式碼](multiplatform-configure-compilations.md)並[建置二進制檔案](multiplatform-build-native-binaries.md)。
  * 閱讀有關[發布多平台應用程式](multiplatform-publish-apps.md)或[發布多平台程式庫](multiplatform-publish-lib-setup.md)的內容。

## 探索 Kotlin Multiplatform 程式庫生態系統 {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

數以千計的多平台程式庫可用於網路連線、存儲、相依注入、測試、UI、序列化等領域。

歡迎在 JetBrains 維護的搜尋平台 [klibs.io](https://klibs.io) 上瀏覽這些程式庫。

## 大規模導入 Kotlin Multiplatform {id="adopt-kotlin-multiplatform-at-scale"}

在團隊中採用跨平台架構可能是一項挑戰。
若想了解跨平台開發的優勢以及潛在問題的解決方案，請參考我們提供的高階概述：

* [什麼是跨平台行動開發？](cross-platform-mobile-development.topic)：提供跨平台應用程式的不同方法與實作的概述。
* [如何向團隊介紹多平台行動開發](multiplatform-introduce-your-team.md)：提供向團隊引入跨平台開發的策略。
* [採用 Kotlin Multiplatform 為專案注入強大動力的十大理由](multiplatform-reasons-to-try.md)：列出選擇 Kotlin Multiplatform 作為跨平台解決方案的各項原因。