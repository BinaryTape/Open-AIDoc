[//]: # (title: 採用 Kotlin Multiplatform 並為您的專案增強動能的十個理由)

<web-summary>探索在專案中使用 Kotlin Multiplatform 的十個理由。查看來自各公司的真實案例，並開始在您的多平台開發中使用這項技術。</web-summary>

在當今多元的技術領域中，開發者面臨著建立跨多個平台無縫運行應用程式的挑戰，同時還需優化開發時間並提高使用者生產力。Kotlin Multiplatform (KMP) 提供了一種解決方案，讓您可以為多個平台建立應用程式，促進程式碼在這些平台之間的重用，同時保留原生程式設計的優勢。

在本文中，我們將探討開發者應考慮在現有或新專案中使用 Kotlin Multiplatform 的十個理由，以及為什麼 KMP 能持續獲得高度關注。

**採用率正穩定增長：** 根據最近兩次的 [Developer Ecosystem 調查](https://devecosystem-2025.jetbrains.com/)，Kotlin Multiplatform 的使用率在短短一年內增長了一倍以上 —— 從 2024 年的 7% 增加到 2025 年的 18%。這種快速增長凸顯了這項技術不斷增強的勢頭以及開發者對其的信心。

![根據最近兩次 Developer Ecosystem 調查的受訪者，KMP 的使用率從 2024 年的 7% 增加到 2025 年的 18%](kmp-growth-deveco.svg){width=700}

## 為什麼您應該在專案中嘗試 Kotlin Multiplatform

無論您是希望提高開發效率還是探索新技術，本文都將對您有所幫助。它解釋了 Kotlin Multiplatform 的一些實際優勢，例如簡化開發、支援多個平台以及提供強大的工具生態系統。您還將看到來自真實公司的案例研究。

1. [Kotlin Multiplatform 幫助您避免程式碼重複](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform 支援廣泛的平台列表](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin 提供簡化的程式碼共用機制](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform 允許靈活的多平台開發](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [透過 Kotlin Multiplatform 解決方案，您可以共用 UI 程式碼](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [您可以在現有和新專案中使用 Kotlin Multiplatform](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [透過 Kotlin Multiplatform，您可以開始逐步共用您的程式碼](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform 已被全球企業使用](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform 提供強大的工具支援](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform 擁有龐大且支援度高的社群](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform 幫助您避免程式碼重複

百度，這家最大的中文搜尋引擎，推出了針對年輕受眾的 *Wonder App*。以下是他們在傳統應用程式開發中面臨的一些問題：

* 應用程式體驗不一致：Android 應用程式的運作方式與 iOS 應用程式不同。
* 驗證商業邏輯的成本高昂：使用相同商業邏輯的 iOS 和 Android 開發者的工作需要獨立檢查，這導致了高昂的成本。
* 升級和維護成本高：重複商業邏輯既複雜又耗時，這增加了應用程式的升級和維護成本。

百度團隊決定嘗試 Kotlin Multiplatform，首先從統一資料層開始：資料模型、RESTful API 請求、JSON 資料解析和快取邏輯。

接著，他們決定採用 Model-View-Intent (MVI) 使用者介面模式，這讓您可以使用 Kotlin Multiplatform 統一介面邏輯。他們還共用了低階資料、處理邏輯和 UI 處理邏輯。

這項實驗非常成功，並帶來了以下結果：

* Android 和 iOS 應用程式之間的一致體驗。
* 降低了維護和測試成本。
* 顯著提高了團隊內的生產力。

[![探索真實世界的 Kotlin Multiplatform 使用案例](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform 支援廣泛的平台列表

Kotlin Multiplatform 的核心優勢之一是其對各種平台的廣泛支援，使其成為開發者的多功能選擇。這些平台包括 Android、iOS、桌面、Web (JavaScript 和 WebAssembly) 以及伺服器 (Java 虛擬機)。

*Quizlet* 是一個流行的教育平台，透過測驗協助學習和練習，它是另一個突顯 Kotlin Multiplatform 優勢的案例研究。該平台每月約有 5000 萬名活躍使用者，其中 Android 使用者佔 1000 萬。該應用程式在 Apple App Store 的教育類別中排名前 10。

Quizlet 團隊曾嘗試過 JavaScript、React Native、C++、Rust 和 Go 等技術，但面臨了效能、穩定性以及各平台實作差異等各種挑戰。最終，他們選擇了 Kotlin Multiplatform 用於 Android、iOS 和 Web。以下是使用 KMP 為 Quizlet 團隊帶來的益處：

* 在編組物件時提供更具型別安全的 API。
* iOS 上的評分演算法比 JavaScript 快 25%。
* Android 應用程式大小從 18 MB 減少到 10 MB。
* 提升了開發者體驗。
* 團隊成員 (包括 Android、iOS、後端和 Web 開發者) 對編寫共用程式碼的興趣增加。

[![開始使用 Kotlin Multiplatform](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin 提供簡化的程式碼共用機制

在程式語言的世界中，Kotlin 以其實用主義的方法脫穎而出，這意味著它優先考慮以下特性：

* **易讀性優於簡潔性**。雖然簡潔的程式碼很吸引人，但 Kotlin 明白清晰度至關重要。目標不僅是縮短程式碼，而是消除不必要的樣板程式碼，從而增強易讀性和可維護性。

* **程式碼重用優於純粹的表現力**。這不僅僅是為了解決許多問題，而是為了識別模式並建立可重用的程式庫。藉由利用現有解決方案並提取共通性， Kotlin 讓開發者能夠最大化其程式碼的效率。

* **互通性優於原創性**。Kotlin 不再重新發明輪子，而是擁抱與 Java 等成熟語言的相容性。這種互通性不僅允許與廣大的 Java 生態系統無縫整合，還促進了對過往經驗中已證實的實踐和教訓的採用。

* **安全性與工具優於完備性**。Kotlin 讓開發者能夠及早發現錯誤，確保您的程式不會進入無效狀態。透過在編譯期間或在 IDE 中編寫程式碼時偵測問題，Kotlin 增強了軟體的可靠性，將執行時錯誤的風險降至最低。

關鍵在於 Kotlin 對易讀性、重用性、互通性和安全性的強調，使該語言成為開發者的極佳選擇，並提高了他們的生產力。

### 4. Kotlin Multiplatform 允許靈活的多平台開發

藉由 Kotlin Multiplatform，開發者不再需要在原生開發與跨平台開發之間做出選擇。他們可以選擇共用什麼以及原生編寫什麼。

在 Kotlin Multiplatform 出現之前，開發者必須以原生方式編寫所有內容。

![在 Kotlin Multiplatform 之前：以原生方式編寫所有程式碼](kmp-before-new.svg){width=700}

Kotlin Multiplatform 讓您選擇適合專案的程式碼共用程度。

1) [同時共用邏輯與 UI](compose-multiplatform-create-first-app.md)：為了實現最大程度的重用和更快的交付，您可以透過將 Kotlin Multiplatform 與 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 結合，不僅共用商業和展示邏輯，還能共用使用者介面程式碼。這使得在 Android、iOS、桌面和 Web 上維持統一的程式碼庫成為可能，同時在需要時仍能與平台特定的 API 整合。這種方法有助於簡化開發並確保跨平台的一致行為。

2) [共用邏輯同時保留原生 UI](multiplatform-create-first-app.md)：如果平台特定的視覺行為或 UX 還原度是首要任務，您可以選擇僅共用資料和商業邏輯。透過這種結構，每個平台都保留其原生 UI 層，同時受益於共同且一致的邏輯實作。這種方法非常適合希望減少重複工作而不改變現有 UI 工作流程的團隊。

3) [共用一小部分邏輯](multiplatform-ktor-sqldelight.md)：Kotlin Multiplatform 也可以透過共用特定的邏輯子集 (如驗證、領域計算或驗證流程) 來逐步引入。當您希望在不進行大型架構更改的情況下提高跨平台的一致性和穩定性時，此選項非常有效。

![藉由 Kotlin Multiplatform 和 Compose Multiplatform：開發者可以共用商業邏輯、展示邏輯，甚至 UI 邏輯](kmp-after-new.svg){width=700}

現在，除了平台特定的程式碼外，您幾乎可以共用任何內容。

### 5. 透過 Kotlin Multiplatform 解決方案，您可以共用 UI 程式碼

JetBrains 提供了 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，這是一個基於 Kotlin 和 Jetpack Compose 的宣告式架構，用於跨多個平台共用使用者介面，包括 Android (透過 Jetpack Compose)、iOS、桌面和 Web (Beta)。

*Instabee* 是一個專門為電子商務企業提供最後一英里物流的平台，他們在該技術仍處於 Alpha 狀態時，就開始在 Android 和 iOS 應用程式中使用 Compose Multiplatform，並共用了 UI 邏輯。

Compose Multiplatform 有一個官方範例稱為 [ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)，它可以執行於 Android、iOS、桌面和 Web，並與地圖和相機等原生組件整合。還有一個社群範例 —— [New York Times App](https://github.com/xxfast/NYTimes-KMP) 複製版，它甚至可以執行於 Wear OS (智慧型手錶作業系統) 上。請查看此 [Kotlin Multiplatform 和 Compose Multiplatform 範例列表](multiplatform-samples.md) 以了解更多範例。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. 您可以在現有和新專案中使用 Kotlin Multiplatform

讓我們來看看以下兩種情境：

* **在現有專案中使用 KMP**

  同樣以百度的 Wonder App 為例。團隊原本就已經有 Android 和 iOS 應用程式，他們只是統一了邏輯。他們開始逐步統一更多程式庫和更多邏輯，最終實現了跨平台共用的統一程式碼庫。

* **在新專案中使用 KMP**

  *9GAG* 是一個線上平台和社群媒體網站，曾嘗試過 Flutter 和 React Native 等不同技術，但最終選擇了 Kotlin Multiplatform，這讓他們能夠對齊應用程式在兩個平台上的行為。他們首先建立了 Android 應用程式，接著在 iOS 上將 Kotlin Multiplatform 專案作為相依性使用。

### 7. 透過 Kotlin Multiplatform，您可以開始逐步共用您的程式碼

您可以從簡單的元素 (如常數) 開始增量進行，並逐步遷移常用公用程式 (如電子郵件驗證)。您也可以編寫或遷移您的商業邏輯，例如交易處理或使用者身分驗證。

> 我們與 Google 團隊合作，以 Jetcaster 為例，建立了一份實用的遷移指南，其中包含一個每個提交 (commit) 都代表一個運作狀態的存儲庫。
> [了解如何逐步從 Android 遷移到 Kotlin Multiplatform](migrate-from-android.md)。
{style="note"}

### 8. Kotlin Multiplatform 已被全球企業使用

KMP 已被世界各地許多大型公司使用，包括 Forbes、Philips、Cash App、Meetup、Autodesk 等。您可以在 [案例研究頁面](https://kotlinlang.org/case-studies/?type=multiplatform) 閱讀他們所有的故事。

2023 年 11 月，JetBrains 宣佈 Kotlin Multiplatform 已進入 Stable (穩定) 階段，吸引了更多公司和團隊對該技術的興趣。在 Google I/O 2024 上，Google 宣佈 [正式支援使用 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html) 在 Android 和 iOS 之間共用商業邏輯。

### 9. Kotlin Multiplatform 提供強大的工具支援

在開發 Kotlin Multiplatform 專案時，您可以隨手使用強大的工具。

* **IntelliJ IDEA**。透過 IntelliJ IDEA 2025.2.2，您可以安裝 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)，它提供了 iOS 應用程式的基本啟動與偵錯功能、環境預檢 (preflight environment checks) 以及其他實用的 KMP 功能。
* **Android Studio**。Android Studio 是另一個穩定的 Kotlin Multiplatform 開發解決方案。透過 Android Studio Otter 2025.2.1，您可以安裝相同的 Kotlin Multiplatform IDE 外掛程式，以獲得基本的 iOS 啟動和偵錯支援、環境預檢以及額外的多平台工具。
* **Compose Hot Reload**：[Compose Hot Reload](compose-hot-reload.md) 讓您在開發 Compose Multiplatform 專案時，能快速反覆運算並實驗 UI 更改。目前適用於包含桌面目標且與 Java 21 或更早版本相容的專案。

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**。Apple 的 IDE 可用於建立 Kotlin Multiplatform 應用程式的 iOS 部分。Xcode 是 iOS 應用程式開發的標準，提供了大量用於編碼、偵錯和配置的工具。但是，Xcode 僅限 Mac 使用。

### 10. Kotlin Multiplatform 擁有龐大且支援度高的社群

Kotlin 和 Kotlin Multiplatform 擁有一個非常具支援性的社群。以下是幾個您可以找到問題答案的地方。

* [Kotlinlang Slack 工作區](https://slack-chats.kotlinlang.org/)。該工作區擁有約 60,000 名成員，並設有幾個專門用於跨平台開發的相關頻道，如 [#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform)、[#compose](https://slack-chats.kotlinlang.org/c/compose) 以及 [#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios)。
* [Kotlin X](https://twitter.com/kotlin)。在這裡，您可以找到快速的專家見解和最新消息，包括無數的多平台技巧。
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw)。我們的 YouTube 頻道為視覺學習者提供實用的教學、與專家的直播以及其他優秀的教育內容。
* [Kodee's Kotlin Roundup](https://lp.jetbrains.com/subscribe-to-kotlin-news/)。如果您想隨時掌握動態的 Kotlin 和 Kotlin Multiplatform 生態系統的最新更新，請訂閱我們的定期通訊！

Kotlin Multiplatform 生態系統正在蓬勃發展。它受到全球眾多 Kotlin 開發者的熱情培育。為了幫助社群在這個不斷擴張的領域中導航， [klibs.io](http://klibs.io) 提供了一個精選的 Kotlin Multiplatform 程式庫目錄，讓您更容易發現針對常見使用案例的可靠解決方案。

以下圖表顯示了每年建立的 Kotlin Multiplatform 程式庫數量：

![每年建立的 Kotlin Multiplatform 程式庫數量](kmp-libs-over-years.png){width=700}

如您所見，2021 年有明顯的增長，且程式庫數量自此之後未曾停止增長。

## 為什麼選擇 Kotlin Multiplatform 而非其他跨平台技術？

在 [不同的跨平台解決方案](cross-platform-frameworks.topic) 之間做選擇時，權衡其優缺點至關重要。您還可以探索 Kotlin Multiplatform 與其他技術的並排比較，包括 [React Native](kotlin-multiplatform-react-native.topic) 和 [Flutter](kotlin-multiplatform-flutter.md)。

以下是為什麼 Kotlin Multiplatform 可能是您的正確選擇的關鍵原因分析：

* **出色的工具，易於使用**。Kotlin Multiplatform 利用 Kotlin 的優勢，為開發者提供出色的工具和易用性。
* **原生程式設計**。編寫原生內容非常容易。感謝 [expected 和 actual 宣告](multiplatform-expect-actual.md)，您可以讓多平台應用程式存取平台特定的 API。
* **優異的跨平台效能**。使用 Kotlin 編寫的共用程式碼會針對不同目標編譯成不同的輸出格式：Android 為 Java 位元組碼，iOS 為原生二進制檔，確保所有平台都具有良好的效能。
* **AI 驅動的程式碼產生**。您可以利用 [Junie](https://www.jetbrains.com/junie/) 驅動的程式碼產生來加速多平台開發，Junie 是 JetBrains 的編碼代理程式，支援在共用和平台特定程式碼之間實現更高效的工作流程。

如果您已經決定嘗試 Kotlin Multiplatform，以下是一些有助於您入門的小技巧：

* **從小處著手**。從小的共用組件或常數開始，讓團隊熟悉 Kotlin Multiplatform 的工作流程和優點。
* **建立計畫**。制定明確的實驗計畫，假設預期結果以及實作與分析的方法。定義貢獻共用程式碼的角色，並建立有效分發更改的工作流程。
* **評估並進行回顧**。與您的團隊召開回顧會議，評估實驗的成功程度，並識別任何挑戰或需要改進的地方。如果對您有效，您可能想要擴大範圍並共用更多程式碼。如果沒有，您需要了解該實驗未成功的原因。

[![查看 Kotlin Multiplatform 的實際應用！現在就開始](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

對於那些想要幫助團隊入門 Kotlin Multiplatform 的人，我們準備了一份包含實用技巧的 [詳細指南](multiplatform-introduce-your-team.md)。

如您所見，Kotlin Multiplatform 已經成功被許多大型公司用於構建具有原生外觀 UI 的高效能跨平台應用程式，有效地在它們之間重用程式碼，同時維持原生程式設計的優勢。