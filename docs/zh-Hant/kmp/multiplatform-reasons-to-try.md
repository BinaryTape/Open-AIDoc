[//]: # (title: 採用 Kotlin Multiplatform 並增強專案效能的十個理由)

<web-summary>探索為何應該在專案中使用 Kotlin Multiplatform 的十個理由。了解各大公司的實際案例，並開始在多平台開發中使用這項技術。</web-summary>

在當今多元的技術環境中，
開發人員面臨著建置可跨多個平台無縫運作的應用程式的挑戰， 
同時還需最佳化開發時間並提高使用者生產力。 
Kotlin Multiplatform (KMP) 提供了一種解決方案，讓您能夠為多個平台建立應用程式， 
促進跨平台程式碼重用，同時保持原生程式設計的優勢。

在本文中，我們將探討開發人員應該考慮在現有或新專案中使用 
Kotlin Multiplatform 的十個理由，以及為何 KMP 持續獲得廣大關注。

**採用率穩定上升：** 根據最近兩次的[開發者生態系統調查](https://devecosystem-2025.jetbrains.com/)，Kotlin Multiplatform 的使用率在短短一年內成長了一倍以上——從 2024 年的 7% 增加到 2025 年的 18%。這種快速增長彰顯了該技術日益增強的發展動能以及開發人員對其充滿信心。

![在最近兩次開發者生態系統調查的受訪者中，KMP 的使用率從 2024 年的 7% 增加到 2025 年的 18%](kmp-growth-deveco.svg){width=700}

## 為什麼應該在專案中嘗試 Kotlin Multiplatform {id="why-you-should-try-kotlin-multiplatform-in-your-projects"}

無論您是希望提高開發效率還是探索新技術，
您都會發現本文很有幫助。
本文說明了 Kotlin Multiplatform 的一些實用優勢， 
例如簡化開發、支援多個平台以及提供強大的工具生態系統。
您還能看到來自真實公司的案例研究。

1. [Kotlin Multiplatform 協助您避免程式碼重複](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform 支援廣泛的平台清單](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin 提供簡化的程式碼共用機制](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform 實現了彈性的多平台開發](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [借助 Kotlin Multiplatform 解決方案，您可以共用 UI 程式碼](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [您可以在現有和新專案中使用 Kotlin Multiplatform](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [借助 Kotlin Multiplatform，您可以開始逐步共用程式碼](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform 已被跨國企業採用](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform 提供強大的工具支援](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform 擁有龐大且熱心支援的社群](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform 協助您避免程式碼重複 {id="1-kotlin-multiplatform-helps-you-avoid-code-duplication"}

中國最大的中文搜尋引擎百度推出了針對年輕受眾的應用程式——_Wonder App_。 
以下是他們在使用傳統應用程式開發時面臨的一些問題：

* 應用程式體驗不一致：Android 應用程式與 iOS 應用程式的運作方式不同。
* 驗證業務邏輯的成本高昂：使用相同業務邏輯的 iOS 和 Android 開發人員的工作需要獨立檢查，從而導致高額成本。
* 升級與維護成本高：重複撰寫業務邏輯既複雜又耗時，進而增加了應用程式的升級和維護成本。

百度團隊決定嘗試 Kotlin Multiplatform，首先從統一資料層開始：
資料模型、RESTful API 請求、JSON 資料剖析和快取邏輯。

接著，他們決定採用 Model-View-Intent (MVI) 使用者介面模式， 
該模式讓您可以透過 Kotlin Multiplatform 統一介面邏輯。 
他們還共用了底層資料、處理邏輯以及 UI 處理邏輯。 

這項實驗證明非常成功，取得了以下成果：

* 在 Android 和 iOS 應用程式中提供一致的體驗。
* 降低了維護和測試成本。
* 顯著提升了團隊內部的生產力。

[![探索實際的 Kotlin Multiplatform 使用案例](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform 支援廣泛的平台清單 {id="2-kotlin-multiplatform-supports-an-extensive-list-of-platforms"}

Kotlin Multiplatform 的關鍵優勢之一是其對各類平台的廣泛支援， 
使其成為開發人員的多功能選擇。
這些平台包括 Android、iOS、桌面、Web（JavaScript 與 WebAssembly）和伺服器（Java 虛擬機）。

_Quizlet_ 是一個透過測驗輔助學習和練習的熱門教育平台， 
是彰顯 Kotlin Multiplatform 優勢的另一個案例研究。
該平台每月擁有約 5,000 萬活躍使用者，其中 1,000 萬來自 Android。 
該應用程式在 Apple App Store 的教育類別中排名前 10。

Quizlet 團隊曾嘗試過 JavaScript、React Native、C++、Rust 和 Go 等技術， 
但面臨了效能、穩定性以及跨平台實作各異等各種挑戰。 
最後，他們在 Android、iOS 和 Web 上選擇了 Kotlin Multiplatform。 
以下是使用 KMP 為 Quizlet 團隊帶來的優勢：

* 在封裝／列集 (marshaling) 物件時提供更型別安全的 API。
* iOS 上的評分演算法比 JavaScript 快了 25%。
* Android 應用程式大小從 18 MB 減少到 10 MB。
* 改善開發者體驗。
* 提高了包括 Android、iOS、後端和 Web 開發者在內的團隊成員編寫共用程式碼的興趣。

[![開始使用 Kotlin Multiplatform](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin 提供簡化的程式碼共用機制 {id="3-kotlin-provides-simplified-code-sharing-mechanisms"}

在程式設計語言的世界中，Kotlin 以其實用主義方法脫穎而出，
這意味著它優先考慮以下特性：

* **可讀性優於簡潔性**。雖然簡潔的程式碼很有吸引力，但 Kotlin 深知清晰度至關重要。 
  目標不僅僅是縮短程式碼，而是消除不必要的樣板程式碼，以提高可讀性和可維護性。

* **程式碼重用優於單純的表現力**。這不僅僅是為了解決許多問題，而是為了識別模式並建立可重用的程式庫。藉由利用現有解決方案並擷取共通性， 
  Kotlin 讓開發人員能夠最大化其程式碼的效率。

* **互通性優於原創性**。Kotlin 沒有重新發明輪子， 
  而是欣然擁抱與 Java 等成熟語言的相容性。 
  這種互通性不僅能無縫整合廣大的 Java 生態系統，還促進了對經過驗證的實務和以往經驗教訓的採納。

* **安全性與工具支援優於完備性**。Kotlin 使開發人員能夠儘早發現錯誤， 
  確保您的程式不會陷入無效狀態。 
  透過在編譯期間或在 IDE 中編寫程式碼時偵測問題， 
  Kotlin 增強了軟體的可靠性，將執行階段錯誤的風險降至最低。

關鍵要點是，Kotlin 對可讀性、重用性、互通性和安全性的重視， 
使該語言成為開發人員極具吸引力的選擇，並提高了他們的生產力。

### 4. Kotlin Multiplatform 實現了彈性的多平台開發 {id="4-kotlin-multiplatform-allows-for-flexible-multiplatform-development"}

有了 Kotlin Multiplatform，開發人員不再需要在原生開發與跨平台開發之間做出艱難抉擇。 
他們可以選擇共用哪些內容，以及哪些內容使用原生方式編寫。

在 Kotlin Multiplatform 出現之前，開發人員必須以原生方式編寫所有內容。

![Kotlin Multiplatform 出現之前：以原生方式編寫所有程式碼](kmp-before-new.svg){width=700}

Kotlin Multiplatform 讓您可以選擇適合專案的程式碼共用層級。

1) [同時共用邏輯與 UI](compose-multiplatform-new-project.md)：為了實現最大程度的重用與更快的交付速度，您可以將 Kotlin Multiplatform 與 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 結合，不僅可以共用業務邏輯和展示邏輯，還可以共用使用者介面程式碼。這使得在 Android、iOS、桌面和 Web 之間維護統一的程式碼庫成為可能，同時仍可在需要時與平台專屬 API 進行整合。這種方法有助於簡化開發，並確保跨平台的一致行為。

2) [在保留原生 UI 的同時共用邏輯](multiplatform-upgrade-app.md)：如果以平台專屬的視覺行為或 UX 保真度為優先，您可以選擇僅共用資料與業務邏輯。透過這種結構，每個平台都保留其原生 UI 層，同時受益於通用、一致的邏輯實作。這種方法非常適合希望在不改變現有 UI 工作流程的情況下減少重複工作的團隊。

3) [共用一小部分邏輯](multiplatform-ktor-sqldelight.md)：Kotlin Multiplatform 也可以透過共用特定的一組邏輯來逐步導入，例如驗證、領域計算或驗證流程。當您想要提高跨平台的一致性和穩定性而又不想進行重大的架構變更時，這個選項非常適合。

![借助 Kotlin Multiplatform 和 Compose Multiplatform：開發人員可以共用業務邏輯、展示邏輯，甚至 UI 邏輯](kmp-after-new.svg){width=700}

現在，除了平台專屬的程式碼之外，您幾乎可以共用任何內容。

### 5. 借助 Kotlin Multiplatform 解決方案，您可以共用 UI 程式碼 {id="5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code"}

JetBrains 提供了 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，這是一個基於 Kotlin 和 Jetpack Compose 的宣告式架構，用於在多個平台之間共用使用者介面， 
包括 Android（透過 Jetpack Compose）、iOS、桌面和 Web (Beta)。

_Instabee_ 是一家專門從事電子商務業務的最後一哩綜合物流平台， 
在 Compose Multiplatform 仍處於 Alpha 階段時，就開始在他們的 Android 和 iOS 應用程式中使用它來共用 UI 邏輯。

Compose Multiplatform 有一個官方範例稱為 [ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)，
可在 Android、iOS、桌面和 Web 上執行，並與地圖和相機等原生元件整合。
此外還有一個社群範例，即 [紐約時報 App (New York Times App)](https://github.com/xxfast/NYTimes-KMP) 複製版， 
它甚至可以在智慧手錶作業系統 Wear OS 上執行。 
查看這份 [Kotlin Multiplatform 和 Compose Multiplatform 範例清單](multiplatform-samples.md) 以了解更多範例。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. 您可以在現有和新專案中使用 Kotlin Multiplatform {id="6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects"}

讓我們看看以下兩種情境：

* **在現有專案中使用 KMP**

  再次以百度的 Wonder App 為例。 
  團隊已經擁有了 Android 和 iOS 應用程式，他們只是將邏輯統一。 
  他們開始逐步統一更多的程式庫和更多的邏輯，進而實現了跨平台共用的統一程式碼庫。

* **在新專案中使用 KMP**

  線上平台與社群媒體網站 _9GAG_ 嘗試了 Flutter 和 React Native 等不同技術，
  但最終選擇了 Kotlin Multiplatform，這使他們能夠調和應用程式在兩個平台上的行為。
  他們首先從建立 Android 應用程式開始，然後在 iOS 上將 Kotlin Multiplatform 專案作為相依性匯入使用。

### 7. 借助 Kotlin Multiplatform，您可以開始逐步共用程式碼 {id="7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually"}

您可以漸進式地開始，從常數等簡單元素入手，並逐步遷移電子郵件驗證等常見公用程式。
您也可以編寫或遷移您的業務邏輯，例如交易程序或使用者身分驗證。

> 我們與 Google 團隊攜手，以 Jetcaster 為例建立了一份實用的遷移指南，其中包含一個每個提交都代表正常運作狀態的存放庫。 
> [了解如何逐步從 Android 遷移到 Kotlin Multiplatform](migrate-from-android.md)。
{style="note"}

### 8. Kotlin Multiplatform 已被跨國企業採用 {id="8-kotlin-multiplatform-is-already-used-by-global-companies"}

KMP 已經被全球許多大型公司所使用，包括 Forbes、Philips、Cash App、Meetup、Autodesk 等等。您可以在[案例研究頁面](https://kotlinlang.org/case-studies/?type=multiplatform)閱讀所有他們的故事。

2023 年 11 月，JetBrains 宣布 Kotlin Multiplatform 正式進入穩定版 (Stable)，
吸引了更多公司和團隊對該技術產生興趣。在 Google I/O 2024 上，Google 宣布[官方支援使用 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html) 在 Android 和 iOS 之間共用業務邏輯。

### 9. Kotlin Multiplatform 提供強大的工具支援 {id="9-kotlin-multiplatform-provides-powerful-tooling-support"}

在處理 Kotlin Multiplatform 專案時，您隨手即可使用強大的工具。

* **IntelliJ IDEA**。透過 IntelliJ IDEA 2025.2.2，您可以安裝 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)，它提供 iOS 應用程式的基本啟動和偵錯功能、環境預檢 (preflight environment checks) 以及其他實用的 KMP 功能。
* **Android Studio**。Android Studio 是 Kotlin Multiplatform 開發的另一個穩定解決方案。透過 Android Studio Otter 2025.2.1，您可以安裝相同的 Kotlin Multiplatform IDE 外掛程式，以獲得基本的 iOS 啟動與偵錯支援、環境預檢以及其他多平台工具支援。
* **Compose Hot Reload**：[Compose Hot Reload](compose-hot-reload.md) 讓您在進行 Compose Multiplatform 專案開發時，能夠快速迭代並試驗 UI 變更。目前適用於包含桌面目標且相容於 Java 21 或更早版本的專案。

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**。Apple 的 IDE 可用於建立 Kotlin Multiplatform 應用程式的 iOS 部分。
  Xcode 是 iOS 應用程式開發的標準工具，提供用於編碼、偵錯和設定的豐富工具。
  不過，Xcode 僅限 Mac。

### 10. Kotlin Multiplatform 擁有龐大且熱心支援的社群 {id="10-kotlin-multiplatform-boasts-a-large-and-supportive-community"}

Kotlin 與 Kotlin Multiplatform 擁有非常熱心支援的社群。以下是幾個您可以找到問題答案的地方：

* [Kotlinlang Slack 工作區](https://slack-chats.kotlinlang.org/)。
  此工作區擁有約 60,000 名成員，並設有幾個專門討論跨平台開發的相關頻道，
  例如 [#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform)、
  [#compose](https://slack-chats.kotlinlang.org/c/compose) 
  以及 [#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios)。
* [Kotlin X](https://twitter.com/kotlin)。在這裡，您將找到快速的專家見解和最新消息，包括無數的多平台實用秘訣。
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw)。
  我們的 YouTube 頻道為視覺學習者提供實用教學、專家直播以及其他出色的教育內容。
* [Kodee's Kotlin 彙總 (Kodee's Kotlin Roundup)](https://lp.jetbrains.com/subscribe-to-kotlin-news/)。 
  如果您希望掌握動態的 Kotlin 和 Kotlin Multiplatform 生態系統的最新動態，
  請訂閱我們的定期電子報！

Kotlin Multiplatform 生態系統正在蓬勃發展。它受到全球無數 Kotlin 開發人員的熱情推動與維護。
為了協助社群探索這個不斷擴展的領域，[klibs.io](http://klibs.io) 提供了一份精選的 Kotlin Multiplatform 程式庫目錄，使尋找常見使用案例的可靠解決方案變得更加容易。

下圖顯示每年建立的 Kotlin Multiplatform 程式庫數量：

![每年建立的 Kotlin Multiplatform 程式庫數量](kmp-libs-over-years.png){width=700}

正如您所看到的，2021 年出現了明顯增長，從那時起程式庫數量就一直持續上升。

## 為什麼選擇 Kotlin Multiplatform 而非其他跨平台技術？ {id="why-choose-kotlin-multiplatform-over-other-cross-platform-technologies"}

在[不同的跨平台解決方案](cross-platform-frameworks.topic)之間進行選擇時， 
權衡各自的優缺點至關重要。您還可以探索 Kotlin Multiplatform 與其他技術的橫向比較，包括 [React Native](kotlin-multiplatform-react-native.topic) 和 [Flutter](kotlin-multiplatform-flutter.md)。

以下是 Kotlin Multiplatform 為何可能是您理想選擇的關鍵原因分析：

* **出色的工具支援，易於使用**。Kotlin Multiplatform 充分利用 Kotlin，為開發人員提供優異的工具支援和易用性。
* **原生程式設計**。使用原生方式編寫非常容易。
  借助 [expected 與 actual 宣告](multiplatform-expect-actual.md)，
  您可以讓多平台應用程式存取平台專屬 API。
* **優異的跨平台效能**。使用 Kotlin 編寫的共用程式碼會針對不同的目標編譯成不同的輸出格式：
  針對 Android 編譯為 Java 位元組碼，針對 iOS 編譯為原生二進位檔，從而確保所有平台上的良好效能。
* **AI 支援的程式碼產生**。您可以利用 [Junie](https://www.jetbrains.com/junie/) 支援的程式碼產生來加速多平台開發，Junie 是 JetBrains 的編碼代理程式，支援跨共用程式碼與平台專屬程式碼的更高效工作流程。

如果您已經決定嘗試 Kotlin Multiplatform，這裡有一些提示可協助您開始：

* **從小處著手**。從小型共用元件或常數開始，讓團隊熟悉 Kotlin Multiplatform 的工作流程和優勢。
* **制定計畫**。制定明確的實驗計畫，對預期成果以及實作和分析方法提出假設。
  定義參與共用程式碼編寫的角色，並建立有效發佈變更的工作流程。
* **評估並舉行回顧會議**。與您的團隊舉行回顧會議，以評估實驗的成功狀況，
  並識別任何挑戰或需要改進的地方。
  如果對您有效，您可能希望擴大範圍並共用更多程式碼。
  如果沒有，您需要了解該實驗未成功的原因。

[![親自體驗 Kotlin Multiplatform！立即開始](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

對於那些想要協助團隊開始使用 Kotlin Multiplatform 的人，我們準備了一份包含實用提示的[詳細指南](multiplatform-introduce-your-team.md)。

如您所見，Kotlin Multiplatform 已經成功被許多大型企業用於建置 
具備原生外觀 UI 的高效能跨平台應用程式，並在這些平台之間有效地重複使用程式碼， 
同時保持原生程式設計的優勢。