[//]: # (title: iOS 與 Android 應用程式開發：跨平台技術如何提供協助)

<web-summary>iOS 與 Android 應用程式開發並不一定意味著重複的工作。了解跨平台技術和 Kotlin Multiplatform 如何降低成本、加快交付速度並保持應用程式的原生特性。</web-summary>

*重要要點：*

* 分別建置 iOS 與 Android 應用程式會導致重複的工作、更高的成本、更慢的發佈速度，以及頻繁的功能對等性問題。
* 跨平台方法藉由讓團隊跨兩個平台共用邏輯、架構，有時甚至是 UI，來減輕這些痛點。
* 基於 Web 和以 UI 為中心的架構雖然能加速開發，但往往會帶來效能限制、抽象層以及外掛程式開銷。
* Kotlin Multiplatform 提供了靈活、循序漸進的程式碼共用途徑——提供原生效能、強大的工具支援，以及透過 Compose Multiplatform 共用從小型模組到完整 UI 的任何內容的選項。
* 選擇正確的跨平台策略需要評估效能需求、團隊專業知識、生態系統成熟度、原生 API 存取能力、長期可維護性以及整體擁有成本。

為 iOS 和 Android 同時建置行動應用程式，感覺就像是用兩艘船航行在同一片海域，每艘船都有自己的船員、工具和規則。隨著應用程式規模擴大和業務需求增長，重複的工作、分歧的功能以及平行程式碼庫的負擔，僅僅是團隊面臨的冰山一角。

許多團隊現在不再將 iOS 和 Android 視為完全獨立的個體，而是將不需要保持區隔的層級結合在一起。在 Kotlin 開發者中，這涵蓋了從使用 [Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) 共用核心邏輯並保留原生 UI，到使用 [Compose Multiplatform](https://kotlinlang.org/compose-multiplatform/) 在 Android、iOS、Web 和桌面端共用邏輯與 UI。

![逐步採用 KMP 的示意圖：共用部分邏輯且不共用 UI、共用所有邏輯而不共用 UI、共用邏輯和 UI](kmp-graphic.png){width="700"}

跨平台開發不再是一種妥協，而是一項戰略選擇。在探索當今的跨平台技術之前，讓我們先回顧一下為什麼它們對於[同時為 iOS 和 Android 建置應用程式](build-ios-android-app.topic)的團隊來說，會成為顛覆性的變革。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="700" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)

## 團隊分別開發 iOS 與 Android 時面臨的 11 個痛點 {id="11-pains-teams-face-when-developing-for-ios-and-android-separately"}

無論團隊經驗多麼豐富，在同時針對 Android 和 iOS 進行建置時，注定會遇到以下至少幾個問題：

1. *雙倍工作量，雙倍維護* – 所有內容都建置兩次會消耗時間和精力，將基本升級轉變成無休止的雙軌馬拉松。例如，[Perk](https://builders.travelperk.com/compose-multiplatform-at-perk-a-pragmatic-look-at-our-journey-so-far-fedd666e9726)「花費了數年時間將相同功能重複實作兩次」。
2. *持續不斷的功能對等性掙扎* – 一個平台進展迅速，而另一個平台進度落後，導致產品節奏不穩定，最終讓團隊和使用者都感到困擾。
3. *分歧的使用者體驗* – 設計決策可能會分道揚鑣，破壞一致性並讓你的品牌看起來像是兩個完全不同的產品。
4. *更高的工程成本* – 擁有兩個程式碼庫需要更多工程師、精力和資金，這只會增加成本而無法產生附加價值。
5. *更慢的開發週期* – 每個功能都必須遵循較慢平台的步調，延長了時程並延誤了發佈。
6. *更大的測試負擔* – 隨著 QA 團隊需要處理隨每次迭代而不斷增長的裝置矩陣和平台特性，其工作量也會倍增。
7. *雙重偵錯* – 團隊不僅需要建置功能兩次，還必須偵錯兩次；在最壞的情況下，還必須修復相同的錯誤兩次。
8. *跨團隊的知識孤島* – 特定平台的專業知識阻礙了協作，將團隊變成了孤立的知識島嶼。
9. *產品推進速度降低* – 當團隊疲於應付冗餘任務，而非交付新功能或重大改進等實質性變革時，前進的動能就會減緩。
10. *平台優先級衝突* – 團隊會遇到技術限制，被迫做出無法完全滿足任一平台的產品妥協。
11. *平台慣例的差異*（UI、UX 和導覽）– Android 和 iOS 模式存在分歧，需要獨特的設計路徑，這會對連貫性產生負面影響並減緩決策制定。

幸運的是，在緩解這些問題方面，你有幾種跨平台技術可供選擇——每種技術都有其自身的優勢，但也有一定的限制。

## 跨平台開發前來解救 {id="cross-platform-development-to-the-rescue"}

跨平台行動開發透過跨平台共用程式碼，減少了 iOS 和 Android 應用程式中的重複工作。不同的方法提供了不同的權衡、彈性與原生整合能力。如需更深入的介紹，請參閱我們關於[什麼是跨平台行動開發](cross-platform-mobile-development.topic)的總覽。

### 基於 Web 和混合式的解決方案 {id="web-based-and-hybrid-solutions"}

這些解決方案允許以 Web 為主的團隊利用現有的 JavaScript、CSS 和瀏覽器工具，降低學習曲線並加快初期工作速度。重用程式碼的能力是一大優勢，因為單一程式碼庫可以跨多個平台，並將重複工作降至最低。迭代週期通常很快，允許團隊在不經過應用程式商店延遲的情況下發佈更新，而且 UI 改進通常需要顯著較少的工程工作。

然而，這類應用程式所提供的效能通常無法與原生解決方案相提並論。複雜的動畫、繁重的互動和龐大的資料流在真實裝置上往往顯得遲緩。存取原生 API 需要橋接或外掛程式，這會帶來一系列問題，例如脆弱性、版本不符和偵錯複雜度。以這種方式建置的應用程式通常難以處理離線功能、手勢管理和特定平台的元素。

隨著時間推移，渲染、回應能力和原生整合方面的限制會不斷累積，導致難以消除的技術債。

### 跨平台架構 {id="cross-platform-frameworks"}

React Native 和 Flutter 等跨平台架構旨在透過提供在 iOS 和 Android 上執行的共用 UI 層來減少碎片化。它們透過共用 UI 邏輯、熱重載以及由龐大外掛程式生態系統支援的豐富元件庫，協助團隊改善功能對等性、加快原型設計並減少重複工作。

其權衡是在原生平台之上增加了一個抽象層。隨著作業系統版本的演進，這一層可能會引入新的失敗點、參差不齊的程式庫品質，以及在整合原生 API 或效能關鍵功能時帶來額外的複雜性。若要深入了解廣泛使用的選項，請參閱我們對一些[最受歡迎的跨平台應用程式開發架構](cross-platform-frameworks.topic)的總覽。

### Kotlin Multiplatform：透過 Compose Multiplatform 共用程式碼與 UI {id="kotlin-multiplatform-shared-code-and-uis-with-compose-multiplatform"}

Kotlin Multiplatform 是 JetBrains 推出的一項開源技術，可讓你在 Android、iOS、桌面、Web 和伺服器之間共用程式碼，同時保留原生開發的優勢。

[KMP 已在生產環境中使用](https://kotlinlang.org/case-studies/?type=multiplatform)，採用者涵蓋從新創公司到 Google、Duolingo、Forbes、Philips、McDonald's、Bolt、H&M、百度、快手和嗶哩嗶哩等科技巨頭。他們選擇 KMP 是因為其適應性、原生效能、提供原生使用者體驗的能力、成本效益，以及能夠輕鬆循序漸進採用的特點。

**是什麼讓 Kotlin Multiplatform 與其他跨平台技術與眾不同？**

* 它不需要從頭重寫應用程式 – 你可以保留現有的 iOS/Android 應用程式和基礎結構，而不需要用 Kotlin 重建所有內容。
* 它允許循序漸進地採用 – 你可以一次只為一個模組、一個功能或一個層級採用 Multiplatform。
* 它可以與開發人員已有的技能無縫協同 – 你的 Kotlin 開發人員可以使用他們已熟知的工具為所有平台進行建置，這意味著無需額外招聘，並且只需極少的適應時間。特別是 Android 開發人員，由於他們已經精通 Kotlin，因此可以從第一天起就維持高生產力。
* 它具有高度彈性 – 你可以共用獨立的模組（如網路或儲存），然後隨著時間推移逐步擴展共用程式碼。你也可以共用所有業務邏輯同時保持 UI 原生，或者逐步將 UI 轉換為 Compose Multiplatform，而無需放棄存取原生 UI 元件（包括視訊播放器或地圖等複雜元件）。
* 它配備了出色的工具支援 – IntelliJ IDEA 和 Android Studio 透過 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)為 KMP 提供智慧 IDE 支援，其中包括通用 UI 預覽、[Compose Hot Reload](compose-hot-reload.md) 以及其他提升生活品質的功能。此外，JetBrains 的 AI 編碼代理 Junie 可以處理 KMP 任務，讓你的團隊能更快速地推進並專注於功能開發。
* 它提供原生效能 – Kotlin Multiplatform 使用 Kotlin/Native 在不希望使用或無法使用虛擬機器的情況下（例如在 iOS 上）產生原生二進位檔並直接存取平台 API。這允許在建立平台無關程式碼的同時，獲得接近原生的效能：

![Compose Multiplatform 基準測試](compose-multiplatform-benchmarks.png){width="700"}

### Kotlin Multiplatform 特別適用的場景 {id="scenarios-where-kotlin-multiplatform-is-particularly-helpful"}

Kotlin Multiplatform 可以處理[廣泛的專案類型](use-cases-examples.md)，從使用 Compose Multiplatform 建置的 MVP 到具有複雜架構的大規模商業應用程式。它的彈性允許團隊選擇發佈多少程式碼，而無需遵循全有或全無的策略。這種多功能性使 KMP 成為希望整合邏輯、同時保留平台特定層級並確保其 UI 具有原生質感的組織的絕佳替代方案。

**建置全新專案的新創公司**

新創公司受惠於共用程式碼庫，這讓他們能夠節省時間和資源，特別是在開發 MVP 時。Kotlin Multiplatform 搭配 Compose Multiplatform 能夠實作 UI 與邏輯共用、快速原型設計，以及混合原生與共用 UI 的彈性，協助團隊更快將應用程式推向應用程式商店並交付至使用者手中。

**中小型企業**

中小型企業可以透過共用核心邏輯來加速開發，同時根據自身需求保留使用原生或共用使用者介面的選項。Kotlin Multiplatform 允許逐步採用，減少開銷並支援平台特定的自訂。

**企業**

擁有大型複雜應用程式的企業使用 Kotlin Multiplatform 來確保跨平台業務邏輯的一致性。它能成功地與正式環境程式碼共存，支援漸進式整合，並充分利用團隊的 Kotlin 技能，而無需採用全新的技術堆疊。

**代理商/接案公司**

代理商受益於 KMP 賦予團隊跨平台重用程式碼的能力，使他們能夠以精簡的團隊滿足緊迫的時程要求。它在加快交付時間的同時，確保了應用程式行為的一致性。

**擴展至新平台的公司**

KMP 透過重用現有程式碼庫，同時保持原生效能和 UI 彈性，協助公司快速進入新平台。這種方法在速度與特定平台的體驗之間取得了平衡。

**開發 SDK 的團隊**

KMP 將共用的 Kotlin 程式碼編譯為平台特定的二進位檔，無縫整合到原生專案中。它支援平台 API，並在原生與跨平台 UI 之間提供彈性，非常適合 SDK 開發。各平台團隊可以使用各自的語言（例如 Swift）輕鬆地與 Kotlin Multiplatform 程式庫互動。

## 如何為你的 iOS 和 Android 專案選擇合適的跨平台技術 {id="how-to-choose-the-right-cross-platform-technology-for-your-ios-and-android-project"}

### 明確你的主要需求 {id="identify-your-primary-requirements"}

首先規劃出產品的核心架構。它是否需要極致流暢的動畫、硬體層級的功能，或是近乎即時的效能？

透過儘早定義這些需求，你可以建立選擇技術的指南針，自然支援你想要提供的使用者體驗——從而避免日後需要使用繁瑣的變通方案來解決架構限制。

### 考慮團隊目前的勝任能力 {id="consider-your-team-s-current-competencies"}

架構的成效取決於使用它的團隊。如果你的工程師在特定技術上投入深厚，選擇一款與其能力互補的產品可以保持高昂士氣並加速上手過程。例如，如果你的團隊已經具備強大的 Kotlin 專業知識，採用 Kotlin Multiplatform 可以讓他們跨平台發揮既有技能，減少阻力並加快交付速度。

相反地，強迫團隊進入未知領域可能會減緩進度、引發緊張情緒並導致技術錯誤。使解決方案與當前技能組合保持一致可以保持動能並縮短見效時間。

### 評估生態系統 {id="evaluate-the-ecosystem"}

每個架構都依賴其環境來運作。高品質的程式庫減少了重新建立核心元件的需求。頻繁的更新，特別是與作業系統升級同步發佈的更新，標誌著一個健全且可行的專案。

評估這些標準可以防止你選擇一個會在未來需求的重壓下停滯不前或崩潰的解決方案。例如，Flutter 開發者受益於 [pub.dev](http://pub.dev) 上的豐富生態系統，而 Kotlin 團隊則可以利用 [klibs.io](http://klibs.io) 上的共用程式庫。

行動應用程式很少是獨立存在的；它們依賴分析工具、支付服務提供商、驗證 SDK 和裝置功能。請檢查你正在考慮的架構是否針對你需要的服務擁有可靠且維護良好的外掛程式。某些領域的不良支援會導致變通方案、脆弱的整合，或需要編寫新的原生模組，從而降低跨平台程式設計的優勢。

### 評估與原生 API 的互動 {id="evaluate-interaction-with-native-apis"}

並非所有架構都能同樣良好地與原生 API 通訊。有些架構提供了深入、文件完備的橋接，以簡潔安全的方式公開底層功能。其他架構則嚴重依賴第三方外掛程式或需要新的原生模組，這增加了複雜度。
了解這些整選路徑的無縫程度、可靠性和適應性至關重要。這樣你才能確保未來的功能不會受到架構限制的束縛。

例如，Kotlin Multiplatform 允許團隊在不犧牲原生效能的情況下跨平台共用邏輯。它還允許直接從 Kotlin 無縫存取所有可用的裝置 SDK，而無需你編寫任何配接器或橋接函式。

### 檢查效能基準測試 {id="check-performance-benchmarks"}

徹底檢查基準測試資料，特別是冷啟動時間、壓力下的 UI 回應能力以及整體記憶體使用量。某些架構在建立簡單介面方面表現出色，但在處理動畫、手勢或大型資料集時卻顯得吃力。測試真實的效能指標有助於在應用程式面對真實裝置和高流量環境時避免意外。

例如，將適用於 iOS 的 Compose Multiplatform 1.8.0 效能與原生 iOS 應用程式進行比較時，我們發現：

* 啟動時間與原生應用程式相當，因此第一個影格在兩個平台上出現的速度一樣快。
* 捲動效能與 SwiftUI 相當，即使在高更新率裝置上也是如此。
* 與具有相同 UI 邏輯和資源的完全原生 SwiftUI 應用程式相比，Compose Multiplatform 僅使 iOS 應用程式的大小增加了約 9 MB。

### 學習曲線 {id="learning-curve"}

評估有關該架構的可用學習資源的數量和品質。
例如，Kotlin Multiplatform 開發者可以使用豐富的教育資料庫——[此處為概覽](kmp-learning-resources.md)。

### 評估擁有成本 {id="assess-the-cost-of-ownership"}

除了初期開發之外，每個架構都伴隨著隱性成本。人才的可用性會影響招聘延遲和薪資。在欠缺發展的程式庫中可能需要建置和維護自訂外掛程式。

從所選架構遷移出去可能極具挑戰性，特別是當架構決策將你的應用程式與其內部機制綁定在一起時。評估整個生命週期的成本能讓你做出經得起時間考驗且符合財務效益的選擇。

### 檢視真實案例研究 {id="review-real-world-case-studies"}

案例研究展示了架構在真實壓力下的運作方式，例如規模擴展問題、效能瓶頸、團隊流程以及未預期的限制。開發與你的應用程式類似的團隊能提供相關見解，因此案例研究可以揭示僅靠技術文件可能無法涵蓋的盲點。它們還能協助你了解一項技術在面對擁有大量使用者和開發人員的複雜應用程式時的擴展能力。

一個很好的例子來自 Duolingo，該公司每週在 iOS 和 Android 上向 176 個國家/地區的超過 4,000 萬日活躍使用者發佈更新。Duolingo 開發者分享了他們使用 Kotlin Multiplatform 的經驗，解釋了 KMP 如何協助他們在規模化下更快地發佈：

> 對 Duolingo 來說，一個令人興奮的趨勢是，我們在內部使用 Kotlin Multiplatform 
> 越多，就發現自己在發佈速度方面越快。
> 事實證明，當你學會了某樣東西之後，你就會變得非常擅長它。[…] 
> 現在背後有了更多的信心，我們也正在累積這些知識。
>
{style="tip"}

如果你想觀看完整故事，可以觀看[案例研究影片](https://youtu.be/RJtiFt5pbfs?si=2bSmGci5NXNNfYUn)。

[![探索真實世界的 Kotlin Multiplatform 使用案例](kmp-use-cases-1.svg){width="700" style="block"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

### 考量支援組織以確保長久發展 {id="consider-the-supporting-organization-to-ensure-longevity"}

架構的長期健康狀況反映了支援該架構的組織的穩定性。強大的支援通常意味著持續的投資、頻繁的修訂以及與產業趨勢的一致性。

候選架構的發展藍圖能預覽該架構的未來走向——以及該路徑是否與你的專案發展保持一致。選擇具有長遠未來的工具可以防止你的團隊依賴過時的技術。

## 結論 {id="conclusion"}

為 iOS 和 Android 建置應用程式不再需要感覺像是在兩個獨立的世界之間奔波。現代跨平台解決方案允許團隊在保持原生品質的同時進行協作、聚焦並加快推進速度。無論你是共用一部分功能還是共用所有程式碼，這些工具都提供了各種技術來配合不同的產品現實狀況和團隊能力。

隨著我們走向一個將多平台開發視為常態而非例外的世界，問題不再是是否要在 iOS 和 Android 之間共用程式碼，而是你該如何在不危及產品願景的情況下共用它。

透過仔細審查需求、團隊能力、效能預期和長期可維護性，你可以選擇一個能夠放大自身優勢的解決方案，同時讓團隊能夠專注於真正重要的事情：在使用者擁有的每部裝置上提供卓越的體驗。

如果你已經準備好加速交付、減少重複工作並實現行動架構的現代化，現在正是探索 Kotlin Multiplatform 及其能為你的團隊帶來的優勢的最佳時機。