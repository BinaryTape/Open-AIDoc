[//]: # (title: iOS 與 Android 應用程式開發：跨平台技術如何提供協助)

<web-summary>iOS 與 Android 應用程式開發不一定意味著重複工作。了解跨平台技術和 Kotlin Multiplatform 如何降低成本、加速交付，並保持應用程式的原生特性。</web-summary>

*重點摘要：*

* 分開建置 iOS 與 Android 應用程式會導致重複的工作、更高的成本、更慢的發佈速度，以及頻繁的功能對等問題。
* 跨平台方法透過讓團隊在兩個平台上共用邏輯、架構，偶爾甚至共用 UI，來減輕這些痛點。
* 基於 Web 和以 UI 為中心的架構雖然加速了開發，但往往會帶來效能限制、抽象層以及外掛程式開銷。
* Kotlin Multiplatform 提供了靈活且漸進的程式碼共用途徑——提供原生效能、強大的工具支援，並可選擇透過 Compose Multiplatform 共用從小模組到完整 UI 的任何內容。
* 選擇合適的跨平台策略需要評估效能需求、團隊專業技能、生態系統成熟度、原生 API 存取、長期可維護性以及整體擁有成本。

同時為 iOS 和 Android 建置行動應用程式，一直以來就像用兩艘船航行在同一片海域，各自擁有獨立的船員、工具和規則。隨著應用程式規模擴大和業務需求增長，重複的工作、分歧的功能以及維護平行程式碼庫的負擔，僅僅是團隊所面臨問題的冰山一角。

許多團隊現在不再將 iOS 和 Android 視為完全獨立的兩件事，而是將不需要保持差異的層合併。在 Kotlin 開發者中，這涵蓋了從使用 [Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) 共用核心邏輯同時保留原生 UI，到使用 [Compose Multiplatform](https://kotlinlang.org/compose-multiplatform/) 在 Android、iOS、Web 和桌面平台上同時共用邏輯與 UI。

![漸進式採用 KMP 的示意圖：共用部分邏輯且不共用 UI、共用所有邏輯但不共用 UI、共用邏輯與 UI](kmp-graphic.png){width="700"}

跨平台開發不再是一種妥協，而是一項策略選擇。在深入探討現今的跨平台技術之前，讓我們先回顧為什麼它們會成為[同時針對 iOS 和 Android 建置](build-ios-android-app.topic)應用程式的團隊的重大變革。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="700" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)

## 分開開發 iOS 與 Android 時團隊面臨的 11 個痛點 {id="11-pains-teams-face-when-developing-for-ios-and-android-separately"}

無論團隊經驗多麼豐富，在同時針對 Android 和 iOS 進行建置時，注定會遇到以下幾個問題：

1. *雙倍的工作量、雙倍的維護成本* – 所有功能都要建置兩次，耗費時間與精力，讓基本的升級變成一場無休止的雙軌馬拉松。例如，[Perk](https://builders.travelperk.com/compose-multiplatform-at-perk-a-pragmatic-look-at-our-journey-so-far-fedd666e9726)「花了數年時間重複重新實作相同的功能」。
2. *難以維持功能對等* – 一個平台進展迅速，另一個平台卻落後，導致產品節奏混亂，最終令團隊與使用者感到困擾。
3. *分歧的使用者體驗* – 設計決策可能出現分歧，破壞了一致性，使您的品牌看起來像是兩個截然不同的產品。
4. *更高的工程成本* – 擁有兩個程式碼庫需要更多工程師、心力與資金，這在沒有產生附加價值的情況下增加了成本。
5. *更慢的開發週期* – 每個功能都受限於進度較慢的平台步調，拉長了時程並延遲發佈。
6. *更繁重的測試負擔* – 隨著 QA 團隊要處理每次迭代中不斷增加的裝置矩陣與平台特性差異，他們的工作量成倍增加。
7. *雙重偵錯* – 團隊不僅需要建置功能兩次，還需要對其進行兩次偵錯，在最糟糕的情況下，甚至必須修復相同的錯誤兩次。
8. *團隊間的知識孤島* – 特定平台的專業知識阻礙了協作，將團隊變成了封閉的知識孤島。
9. *產品交付速度降低* – 當團隊忙於處理重複的工作，而不是交付新功能或重大改進等實質變更時，推進動力就會減緩。
10. *平台優先順序衝突* – 團隊遇到技術限制，被迫做出無法完全滿足任何一個平台的產品妥協。
11. *平台慣例的差異*（UI、UX 和導覽）– Android 與 iOS 的模式存在差異，需要各自獨特的設計路徑，進而對連貫性產生負面影響並拖慢決策。

幸運的是，在緩解這些問題方面，有多種跨平台技術可供選擇——每種技術都有各自的優勢，但同時也存在一定的局限性。

## 跨平台開發前來相助 {id="cross-platform-development-to-the-rescue"}

跨平台行動開發透過跨平台共用程式碼，減少了 iOS 和 Android 應用程式中的重複工作。不同的方法提供了不同的權衡、彈性與原生整合度。如需更深入的介紹，請參閱我們關於[什麼是跨平台行動開發](cross-platform-mobile-development.topic)的總覽。

### 基於 Web 的解決方案與混合式解決方案 {id="web-based-and-hybrid-solutions"}

這些解決方案允許專注於 Web 的團隊使用現有的 JavaScript、CSS 和瀏覽器工具，從而降低學習曲線並加快初期工作。重用程式碼的能力是一大優勢，因為單一程式碼庫可以在多個平台上運作，且重複程度極低。迭代週期通常很快，團隊無需等待應用程式商店的審核延遲即可發佈更新，且 UI 改進通常需要顯著較少的工程投入。

然而，此類應用程式提供的效能通常無法與原生解決方案相比。複雜的動畫、繁重的互動和龐大的資料流在實體裝置上往往顯得遲緩。存取原生 API 需要橋接器或外掛程式，這會帶來一系列問題，如脆弱性、版本不符以及偵錯複雜性。以此方式建置的應用程式往往難以應對離線功能、手勢管理和特定平台元素。

隨著時間推移，在轉譯、回應速度以及原生整合方面的限制會不斷累積，導致極難消除的技術債務。

### 跨平台架構 {id="cross-platform-frameworks"}

像 React Native 和 Flutter 這樣的跨平台架構旨在透過提供在 iOS 和 Android 上執行的共用 UI 層來減少碎片化。它們透過共用 UI 邏輯、熱重載以及由龐大外掛程式生態系統支援的豐富元件庫，協助團隊改善功能對等、加速原型製作並減少重複工作。

代價是在原生平台之上增加了一個額外的抽象層。隨著作業系統版本的演進，在整合原生 API 或對效能要求極高的功能時，該層可能會引入新的故障點、參差不齊的程式庫品質以及額外的複雜性。若要深入了解廣泛使用的選項，請參閱我們關於某些[最受歡迎的跨平台應用程式開發架構](cross-platform-frameworks.topic)的總覽。

### Kotlin Multiplatform：透過 Compose Multiplatform 共用程式碼與 UI {id="kotlin-multiplatform-shared-code-and-uis-with-compose-multiplatform"}

Kotlin Multiplatform 是 JetBrains 推出的一項開源技術，可讓您在 Android、iOS、桌面、Web 和伺服器之間共用程式碼，同時保留原生開發的優勢。

從新創公司到 Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、Baidu、Kuaishou 和 Bilibili 等科技巨頭，都在[生產環境中使用 KMP](https://kotlinlang.org/case-studies/?type=multiplatform)。他們選擇 KMP 是因為其適應性、原生效能、提供原生使用者體驗的能力、成本效益，以及能夠輕鬆漸進式採用的特性。

**Kotlin Multiplatform 與其他跨平台技術有何不同？**

* 無需從頭重寫應用程式 – 您可以保留現有的 iOS/Android 應用程式和基礎結構，而不必用 Kotlin 重建一切。
* 支援漸進式採用 – 您可以一次只針對一個模組、一個功能或一個層級採用 Multiplatform。
* 善用開發人員現有的技能 – 您的 Kotlin 開發人員可以使用他們已經熟悉的工具為所有平台進行建置，這意味著無需額外招聘，且上手時間極短。特別是 Android 開發人員，由於他們已經擁有豐富的 Kotlin 經驗，從第一天起就能發揮生產力。
* 具備靈活性 – 您可以共用網路或儲存等獨立模組，然後隨著時間逐步擴展共用程式碼。您也可以在保留原生 UI 的同時共用所有商業邏輯，或者逐步將 UI 轉換為 Compose Multiplatform，同時仍可存取原生 UI 元件（包含視訊播放器或地圖等複雜元件）。
* 擁有出色的工具支援 – IntelliJ IDEA 和 Android Studio 透過 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)為 KMP 提供智慧 IDE 支援，包括通用 UI 預覽、[適用於 Compose Multiplatform 的熱重載](compose-hot-reload.md)、跨語言導覽、重構作業，以及跨 Kotlin 與 Swift 程式碼的偵錯工具。此外，JetBrains 的 AI 編碼助理 Junie 能夠處理 KMP 任務，讓您的團隊能更快前進並專注於功能開發。
* 提供原生效能 – 在不適合或無法使用虛擬機的情況下（例如在 iOS 上），Kotlin Multiplatform 使用 Kotlin/Native 產生原生二進位檔並直接存取平台 API。這允許在編寫平台無關程式碼的同時獲得接近原生的效能：

![Compose Multiplatform 效能基準測試](compose-multiplatform-benchmarks.png){width="700"}

### Kotlin Multiplatform 特別有所助益的場景 {id="scenarios-where-kotlin-multiplatform-is-particularly-helpful"}

Kotlin Multiplatform 可以處理[廣泛的專案類型](use-cases-examples.md)，從使用 Compose Multiplatform 建置的 MVP 到具有複雜架構的大規模商業應用程式。它的彈性讓團隊可以自由選擇要共用多少程式碼，而無需遵循「全有或全無」的策略。這種多功能性使 KMP 成為絕佳的替代方案，適合希望整合邏輯，同時保留特定平台層並確保其 UI 保持原生體驗的組織。

**正在建置全新綠地專案的新創公司**

新創公司受益於共用程式碼庫，這使他們能夠節省時間和資源，特別是在打造 MVP 時。Kotlin Multiplatform 搭配 Compose Multiplatform 支援 UI 與邏輯共用、快速原型製作，以及混合原生與共用 UI 的彈性，幫助團隊更快地將應用程式推向應用程式商店並交到使用者手中。

**中小型企業**

中小型企業可透過共用核心邏輯來加速開發，同時根據需求保留使用原生或共用使用者介面的選擇。Kotlin Multiplatform 允許漸進式採用，從而降低開銷並支援特定平台的自訂。

**大型企業**

擁有龐大且複雜應用程式的大型企業使用 Kotlin Multiplatform 來確保跨平台商業邏輯的一致性。它能順利與生產環境程式碼共存、支援漸進式整合，並發揮團隊現有的 Kotlin 技能，而無需採用全新的技術堆疊。

**軟體代理商與接案團隊**

代理商受惠於 KMP 賦予團隊跨平台重用程式碼的能力，使他們能以小型團隊滿足緊迫的時程要求。它在加速交付時間的同時，確保了應用程式行為的一致性。

**拓展至新平台的公司**

KMP 透過重用現有程式碼庫，同時維持原生效能與 UI 彈性，協助公司快速進軍新平台。這種方法在速度與特定平台的體驗之間取得了平衡。

**開發 SDK 的團隊**

KMP 將共用的 Kotlin 程式碼編譯為特定平台的二進位檔，與原生專案無縫整合。它支援平台 API，並在原生與跨平台 UI 之間提供靈活性，是 SDK 開發的理想之選。各平台團隊可以使用其專屬語言（例如 Swift）輕鬆地與 Kotlin Multiplatform 程式庫進行介面呼叫。

## 如何為您的 iOS 與 Android 專案選擇合適的跨平台技術 {id="how-to-choose-the-right-cross-platform-technology-for-your-ios-and-android-project"}

### 釐清您的主要需求 {id="identify-your-primary-requirements"}

首先規劃出產品的核心。它是否需要絲滑流暢的動畫、硬體層級的功能，或是近乎即時的效能？

藉由儘早確定這些需求，您可以為選擇技術建立明確的方向指標，以自然支援您想要提供的使用體驗——從而避免日後需要繁瑣因應措施的架構。

### 考量團隊現有的專業能力 {id="consider-your-team-s-current-competencies"}

一個架構的成效取決於使用它的團隊。如果您的工程師在特定技術上投入深厚，選擇能補充並發揮其能力的產品可以維持高昂士氣並縮短上手時間。例如，如果您的團隊已經具備深厚的 Kotlin 專業知識，採用 Kotlin Multiplatform 可以讓他們在不同平台間發揮現有技能，減少摩擦並加快交付腳步。

另一方面，強迫團隊進入未知的領域可能會拖慢進度、造成團隊緊張，並導致技術錯誤。使解決方案與現有技能組合保持一致，能維持推進動力並縮短產生實際效益所需的時間。

### 評估生態系統 {id="evaluate-the-ecosystem"}

每個架構都需要依賴其環境才能運作。高品質的程式庫能減少重複建置核心元件的需求。頻繁的更新（特別是與作業系統升級同步發佈的更新）代表著專案健全且具備生命力。

評估這些標準可以避免您選擇一個會停滯不前或在未來需求重壓下崩潰的解決方案。例如，Flutter 開發者受益於 [pub.dev](http://pub.dev) 上的豐富生態系統，而 Kotlin 團隊則可以使用 [klibs.io](http://klibs.io) 上的共用程式庫。

行動應用程式鮮少是獨立存在的；它們依賴分析工具、支付服務提供商、驗證 SDK 和裝置功能。請檢查您正在考慮的架構是否具有針對您所需服務的可靠且維護良好的外掛程式。某些領域的支援不足會導致各種問題，例如需要變通做法、脆弱的整合，或是需要編寫新的原生模組，從而削弱了跨平台開發的優勢。

### 評估與原生 API 的互動 {id="evaluate-interaction-with-native-apis"}

並非所有架構與原生 API 的溝通表現都同樣出色。有些架構提供深入且具備完整文件的橋接機制，以簡潔且安全的方式公開底層功能。其他架構則嚴重依賴第三方外掛程式，或者需要編寫新的原生模組，這增加了複雜性。
了解這些整合路徑有多麼無縫、可靠且具適應性至關重要。這是確保未來功能不會受到架構限制束縛的方法。

例如，Kotlin Multiplatform 允許團隊在不犧牲原生效能的情況下跨平台共用邏輯。它還允許直接從 Kotlin 無縫存取所有可用的裝置 SDK，無需編寫任何配接器或橋接函式。

### 查看效能基準測試 {id="check-performance-benchmarks"}

徹底檢視基準測試資料，特別是冷啟動時間、高壓下的 UI 回應速度以及整體記憶體消耗。某些架構在建立簡單介面方面表現出色，但難以處理動畫、手勢或大型資料集。測試真實的效能指標有助於避免應用程式在實體裝置和高流量環境中出現令人措手不及的問題。

例如，比較適用於 iOS 的 Compose Multiplatform 1.8.0 與原生 iOS 應用程式的效能，我們發現：

* 啟動時間與原生應用程式相當，因此在兩個平台上第一幀畫面的呈現速度一樣快。
* 即便在高更新率裝置上，滾動效能也與 SwiftUI 旗鼓相當。
* 與具有相同 UI 邏輯和資產的完全原生 SwiftUI 應用程式相比，Compose Multiplatform 僅使 iOS 應用程式的大小增加了約 9 MB。

### 學習曲線 {id="learning-curve"}

評估有關該架構的可用學習資源的數量與品質。
例如，Kotlin Multiplatform 開發者可以使用豐富的學習資源庫——[這裡有一份總覽](kmp-learning-resources.md)。

### 評估擁有成本 {id="assess-the-cost-of-ownership"}

除了初期開發成本之外，每個架構都伴隨著隱性成本。人才儲備狀況會影響招聘週期與薪資水準。在生態尚未成熟的程式庫中，可能需要自行建置並維護自訂外掛程式。

遷移出已選用的架構可能極具挑戰性，特別是當架構決策將您的應用程式深度綁定在其內部實作時。評估整個生命週期的總成本，能讓您做出在財務上合理且經得起時間考驗的選擇。

### 檢視實際案例研究 {id="review-real-world-case-studies"}

案例研究展現了架構在面對擴充性問題、效能瓶頸、團隊流程以及意料之外的限制等真實世界壓力時的運作表現。開發與您類似應用程式的團隊能提供極具參考價值的見解，因此案例研究能揭示僅憑技術文件可能無法發現的模糊盲點。它們還能幫助您了解某項技術在擁有龐大使用者與開發者數量的複雜應用程式中的擴充成效。

一個很好的例子來自 Duolingo，該團隊每週向全球 176 個國家、超過 4,000 萬的日活躍使用者發佈 iOS 與 Android 版本。Duolingo 開發者分享了他們使用 Kotlin Multiplatform 的經驗，說明 KMP 如何協助他們在規模化下更快地交付產品：

> 對 Duolingo 而言，一個令人振奮的趨勢是：我們在內部越常使用 Kotlin Multiplatform，
> 就越發現在產品交付速度上有所提升。
> 事實證明，在你學會某樣事物後，你就會變得非常擅長它。[…] 
> 現在我們對此有了更多的信心，並且正在持續累積相關知識。
>
{style="tip"}

如果您想了解完整的故事，可以觀看[案例研究影片](https://youtu.be/RJtiFt5pbfs?si=2bSmGci5NXNNfYUn)。

[![探索實際 Kotlin Multiplatform 使用案例](kmp-use-cases-1.svg){width="700" style="block"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

### 考量支援組織以確保長期發展 {id="consider-the-supporting-organization-to-ensure-longevity"}

架構的長期健全度反映了背後支援組織的穩定性。強大的支援通常意味著持續的投入、頻繁的修訂，以及與產業趨勢保持同步。

候選架構的藍圖可以讓您預覽該架構的未來發展走向——以及該路線是否與您專案的演進方向一致。選擇一個具備長期發展前景的工具，可避免團隊依賴過時的技術。

## 結論 {id="conclusion"}

為 iOS 與 Android 開發應用程式不再意味著必須在兩個獨立的世界之間疲於奔命。現代跨平台解決方案使團隊能夠在維持原生品質的同時，進行協作、保持專注並加快步伐。無論是共用某個功能模組還是共用所有程式碼，這些工具都提供了多種技術來因應不同的產品現狀與團隊能力。

隨著我們邁向一個多平台開發成為常態而非特例的時代，問題已不再是「是否要在 iOS 與 Android 之間共用程式碼」，而是「如何能在不損及產品願景的前提下共用程式碼」。

透過仔細審視需求、團隊能力、效能預期以及長期可維護性，您可以選擇一個能放大自身優勢的解決方案，同時讓團隊專注於真正重要的事情：在使用者擁有的每一台裝置上提供卓越的體驗。

如果您已準備好加速交付、減少重複工作並實現行動架構的現代化，現在正是探索 Kotlin Multiplatform 及其能為您的團隊帶來諸多好處的最佳時機。