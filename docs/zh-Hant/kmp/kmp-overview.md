[//]: # (title: 什麼是 Kotlin Multiplatform)
[//]: # (description: Kotlin Multiplatform 是由 JetBrains 開發的開源技術，能在 Android、iOS、桌面、Web 與伺服器之間共用程式碼。)

Kotlin Multiplatform (KMP) 是由 JetBrains 開發的開源技術，能在 Android、iOS、桌面、Web 與伺服器之間共用程式碼，同時保留原生開發的優點。

透過 Compose Multiplatform，您還可以在多個平台之間共用 UI 程式碼，以實現最大程度的程式碼複用。

## 為什麼公司選擇 KMP

### 成本效益與更快的交付速度

Kotlin Multiplatform 有助於簡化技術和組織流程：

* 您可以透過在平台之間共用邏輯和 UI 程式碼，減少重複工作和維護成本。這也讓在多個平台上同步發佈功能成為可能。
* 團隊協作變得更加容易，因為統一的邏輯存在於共用程式碼中，這使得團隊成員之間的知識傳遞更容易，並減少了專門平台團隊之間的重複勞動。

除了更快的上市時間外，根據 KMP 2024 年第二季調查，有 **55%** 的使用者表示採用 KMP 後協作得到改善，且有 **65%** 的團隊表示效能和品質有所提升。

從新創公司到全球企業，各種規模的組織都在正式環境中使用 KMP。包括 Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、Baidu、Kuaishou 和 Bilibili 在內的公司都採用了 KMP，因為它具有靈活性、原生效能、提供原生使用者體驗的能力、成本效益以及對逐步採用的支援。[進一步了解已採用 KMP 的公司](https://kotlinlang.org/case-studies/?type=multiplatform)。

### 程式碼共用的靈活性

您可以根據自己的需求共用程式碼：共用獨立的模組（如網路或儲存），並隨著時間推移逐步擴展共用程式碼。
您也可以在保持 UI 原生的同時共用所有業務邏輯，或者使用 Compose Multiplatform 逐步遷移 UI。

![逐步採用 KMP 的說明：共用部分邏輯且不共用 UI、共用所有邏輯但不含 UI、共用邏輯與 UI](kmp-graphic.png){width="700"}

### iOS 上的原生感

您可以完全使用 SwiftUI 或 UIKit 來建置 UI，使用 Compose Multiplatform 在 Android 和 iOS 上建立統一的體驗，或根據需要混合搭配原生與共用的 UI 程式碼。

無論採用哪種方法，您都可以產出在各個平台上都具有原生感的應用程式： 

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 原生效能

Kotlin Multiplatform 利用 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 產出原生二進位檔，並在不適合或無法使用虛擬機（例如在 iOS 上）的情況下直接存取平台 API。

這有助於在編寫與平台無關的程式碼時，實現接近原生的效能：

![顯示 Compose Multiplatform 與 SwiftUI 在 iPhone 13 和 iPhone 16 的 iOS 上效能相當的圖表](cmp-ios-performance.png){width="700"}

### 無縫的工具支援

IntelliJ IDEA 和 Android Studio 透過 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 為 KMP 提供智慧 IDE 支援，包括通用 UI 預覽、[Compose Multiplatform 的熱重載](compose-hot-reload.md)、跨語言導覽、重構作業，以及針對 Kotlin 和 Swift 程式碼的偵錯。

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 驅動開發

讓 JetBrains 的 AI 編碼代理 [Junie](https://jetbrains.com/junie) 處理 KMP 任務，讓您的團隊能更快速前進。

## 探索 Kotlin Multiplatform 使用案例

看看公司和開發人員如何享受共用 Kotlin 程式碼的好處：

* 在我們的[案例研究頁面](https://kotlinlang.org/case-studies/?type=multiplatform)了解公司如何成功地在程式碼庫中採用 KMP。
* 在我們的[精選範例清單](multiplatform-samples.md)和 GitHub 的 [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 主題中查看廣泛的範例應用程式。

## 學習基礎知識

若要快速查看 KMP 的實際運作，請嘗試[快速入門](quickstart.md)。
您將設定環境並在不同的平台上執行範例應用程式。

選擇使用案例
: * 若要建立一個在平台之間共用 UI 和業務邏輯程式碼的應用程式，請參考[共用邏輯與 UI 教學](compose-multiplatform-create-first-app.md)。
  * 若要了解如何將 Android 應用程式轉換為多平台應用程式，請查看我們的[遷移教學](multiplatform-integrate-in-existing-app.md)。
  * 若要了解如何在不共用 UI 實作的情況下共用部分程式碼，請參考[共用邏輯教學](multiplatform-create-first-app.md)。

深入技術細節
: * 從[基本專案結構](multiplatform-discover-project.md)開始。
  * 了解可用的[程式碼共用機制](multiplatform-share-on-platforms.md)。
  * 查看 KMP 專案中[相依性如何運作](multiplatform-add-dependencies.md)。
  * 考慮不同的 [iOS 整合方法](multiplatform-ios-integration-overview.md)。
  * 了解 KMP 如何針對各種目標[編譯程式碼](multiplatform-configure-compilations.md)並[組建二進位檔](multiplatform-build-native-binaries.md)。
  * 閱讀關於[發佈多平台應用程式](multiplatform-publish-apps.md)或[多平台程式庫](multiplatform-publish-lib-setup.md)的內容。

## 探索 Kotlin Multiplatform 程式庫生態系統

有數以千計的多平台程式庫可用於網路、儲存、相依注入、測試、UI、序列化等。

在 [klibs.io](https://klibs.io) 上瀏覽這些程式庫，這是一個由 JetBrains 維護的搜尋平台。

## 大規模採用 Kotlin Multiplatform

在團隊中採用跨平台架構可能是一項挑戰。
若要了解跨平台開發的優點以及潛在問題的解決方案，請查看我們對跨平台開發的高階總覽：

* [什麼是跨平台行動開發？](cross-platform-mobile-development.topic)：提供跨平台應用程式的不同方法和實作總覽。
* [如何向您的團隊介紹多平台行動開發](multiplatform-introduce-your-team.md)：提供在團隊中引入跨平台開發的策略。
* [採用 Kotlin Multiplatform 並增強您專案的十個理由](multiplatform-reasons-to-try.md)：列出選擇 Kotlin Multiplatform 作為跨平台解決方案的理由。