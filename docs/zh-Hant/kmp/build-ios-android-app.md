<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd" id="build-ios-android-app" title="如何建置 Android 與 iOS 應用程式（以及何時使用 Kotlin Multiplatform）">
  <web-summary>探索如何建置 Android 與 iOS 應用程式，比較結構與架構，並了解 Kotlin Multiplatform 的適用場景。</web-summary>
  <p>在同時為 iOS 和 Android 進行開發時，第一個重大的決策是架構性的：您是要採用完全原生開發，還是透過跨平台方式共享程式碼？這個選擇會影響上市時間、成本，以及您的團隊隨著時間推移將面臨的複雜程度。原生開發可實現最大限度的平台控制與精緻度，但也需要維護兩套程式碼庫。<a href="cross-platform-mobile-development.topic">跨平台</a> 承諾透過共享邏輯來加快交付速度並降低成本，但也引發了對效能、靈活性和長期可維護性的疑慮。</p>
  <p>這不僅僅是理論上的辯論。根據 <a href="https://devecosystem-2025.jetbrains.com/">2025 開發者生態系現狀</a> 報告，跨平台與共享程式碼技術的使用率在 2024 年至 2025 年間翻了一倍以上，這顯示越來越多的團隊正在尋找在保持原生品質體驗的同時重用程式碼的方法。</p>
  <!--![KMP usage increased from 7% in 2024 to 18% in 2025 among respondents to the last two Developer Ecosystem surveys](kmp-growth-deveco.svg){width=700}-->
  <img src="kmp-growth-deveco.svg" alt="在最近兩次的開發者生態系調查受訪者中，KMP 的使用率從 2024 年的 7% 增加到 2025 年的 18%" width="700"/>
  <p>在本文中，我們將從實際層面檢視原生與跨平台方法。我們不會提供一套放諸四海皆準的解決方案，而是會探討團隊在規劃、架構和交付中遇到的權衡。您將獲得更清晰的比較，並能有更好的基礎來選擇最適合您的產品、團隊和限制條件的選項。</p>
  <chapter title="如何建置 Android 與 iOS 應用程式：三種主要的架構選項"
           id="main-architecture-options">
    <p>一旦您決定在 iOS 和 Android 上同時發佈，下一個策略考量就是如何建構跨平台的開發架構。這項決定將影響您建置、發佈及演進應用程式的方式。</p>
    <chapter title="完全原生開發" id="fully-native-development">
      <p>完全原生開發將 iOS 和 Android 視為不同的產品。您使用 Apple 的工具與架構建立一個應用程式，並使用 Google 的工具建立另一個，分別使用各平台的原生語言、UI 系統和 SDK。這兩個程式碼庫可能會共享構思與設計，但在技術上仍保持獨立，且每個平台都在各自的生態系統和發佈週期內演進。</p>
    </chapter>
    <chapter title="跨平台架構 (Flutter, React Native 等)" id="cross-platform-frameworks">
      <p><a href="cross-platform-frameworks.topic">跨平台架構</a>（例如 Flutter 和 React Native）旨在圍繞單一程式碼庫統一開發。這種方法允許團隊共享業務邏輯與 UI 程式碼，並透過跨平台層在各個作業系統上渲染應用程式。其承諾非常直接：一個程式碼庫、兩個平台，以及一條從構思到發佈的高效路徑。</p>
    </chapter>
    <chapter title="彈性的程式碼共享 (Kotlin Multiplatform)" id="flexible-code-sharing">
      <p><a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform (KMP)</a> 提供了更廣泛的程式碼共享選項。它不需要「全有或全無」的決策，而是讓團隊能夠僅共享與其產品相關的部分，同時保持建置完全原生體驗的靈活性。</p>
      <!--![Illustration of gradual KMP adoption: share part of logic and none of the UI, share all logic without UI, share logic and UI](kmp-graphic.png){width="700"}-->
      <img src="kmp-graphic.png" alt="KMP 漸進式採用示意圖：共享部分邏輯但不共享 UI、共享所有邏輯但不共享 UI、共享邏輯與 UI" width="700"/>
      <a href="https://kotlinlang.org/multiplatform/"><img src="discover-kmp.svg" alt="探索 Kotlin Multiplatform" width="600" style="block"/></a>
      <!--[![Discover Kotlin Multiplatform](discover-kmp.svg){width="600" style="block"}](https://www.jetbrains.com/kotlin-multiplatform/)-->
      <p>在接下來的章節中，我們將了解這三種方法在實際專案中如何運作，以及它們對日常開發的意義。</p>
    </chapter>
  </chapter>
  <chapter title="適用於 Android 與 iOS 的完全原生開發" id="fully-native-development-for-android-and-ios">
    <p>完全原生開發涉及建立兩個獨立的應用程式：一個使用 Apple 工具的 iOS 版，另一個使用 Google 工具的 Android 版。每個平台都有自己的程式碼庫、開發管線和發佈流程。實際上，您是在建置兩個解決相同問題但存在於不同生態系統中的產品。</p>
    <p>這種方法的主要好處是 <b>平台忠實度</b>。原生應用程式直接使用平台的 UI 架構、互動模式和無障礙技術，這使得開發在每台裝置上都感覺良好的體驗變得更加容易。由於中間沒有抽象層，動畫、手勢和導航都能如預期運作，且沒有效能額外開銷。</p>
    <p>另一個主要優點是 <b>快速存取平台 API</b>。當 Apple 或 Google 推出新的系統功能、SDK 或硬體能力時，原生應用程式可以立即採用。不需要等待跨平台層趕上並開放這些 API，這對於需要尖端作業系統功能或深度系統整合的產品來說非常重要。</p>
    <chapter title="注意事項" id="native-considerations">
      <p>權衡之一是 <b>增加維護成本</b>。兩套程式碼庫不可避免地會導致功能開發、錯誤修正、測試和長期演進方面的重複勞動。維護兩個程式碼庫還需要為每個平台聘請專家，這會增加成本並減慢需要同時在所有平台上實施的改進速度。</p>
      <p>當特定平台的 UX 是關鍵差異化因素、您希望早期或深度存取作業系統功能，或者您已經擁有成熟且獨立的 iOS 和 Android 團隊時，原生開發是一個強大的選擇。對於共享邏輯有限但 UI、效能或硬體整合需求較高的產品，這也是一個很好的解決方案。</p>
    </chapter>
  </chapter>
  <chapter title="用於跨平台行動開發的架構" id="frameworks-for-cross-platform-mobile-development">
    <p>跨平台架構採取了一種直接的跨平台開發方法：與其建立兩個不同的介面，不如使用單一渲染層來驅動 iOS 和 Android 上的應用程式。團隊建立一組 UI 組件和一個大體一致的應用程式層，架構會將其轉換為每個平台可以顯示並互動的內容。實際上，使用者介面與業務邏輯一樣是可重用的。</p>
    <p>最明顯的優點是 <b>提高 UI 程式碼重用率</b>。大量的程式碼（有時甚至是大部分）可以包含在單一程式碼庫中。這使得對齊功能和同時向兩個平台推出更新變得更加容易。因此，團隊通常能更快地實現 iOS 和 Android 之間的功能對等，因為新功能、修正和 UI 升級通常只需實作一次。</p>
    <p>當 <b>一致性和交付速度比精細的平台特定細節更重要時</b>，這種範式特別具有吸引力。統一的 UI 層消除了平台團隊之間的協作開銷，同時也簡化了規劃、測試和發佈管理。從產品的角度來看，它還降低了一個平台在功能或視覺設計上落後於另一個平台的風險。</p>
    <chapter title="注意事項" id="cross-platform-considerations">
      <p>然而，跨平台架構也帶來了 <b>抽象權衡</b>。渲染層位於您的程式碼與作業系統之間，因此您並非直接使用平台 UI 架構。雖然這種抽象平滑了許多差異，但它可能會使某些原生行為、互動或邊緣情況難以定義或調整。當您需要超越抽象層提供的功能時，通常必須深入到平台特定的程式碼中。</p>
      <p>還存在 <b>生態系統和外掛程式依賴性</b>。架構及其配套工具支援新的作業系統功能、裝置能力和第三方 SDK。如果某些功能尚未推出，團隊可能不得不等待、建置自訂連接器或調整其藍圖。</p>
      <p>簡而言之，跨平台架構優化了跨平台重用與同步，具有明顯的優點，但也存在結構性限制。</p>
    </chapter>
  </chapter>
  <chapter title="Kotlin Multiplatform：彈性的程式碼共享" id="kotlin-multiplatform-flexible-code-sharing">
    <p>Kotlin Multiplatform 運作起來更像是一系列選項，而非單一的架構選擇。它不要求對共享程式碼庫進行「全有或全無」的承諾。團隊可以決定共享程式碼的哪些部分以及何時共享。</p>
    <p>在這一系列選項的一端，<a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a>（Kotlin Multiplatform 生態系統中的宣告式 UI 架構）允許團隊跨多個平台共享使用者介面。當專案受益於統一的設計系統、一致的互動模式以及跨 iOS 和 Android 的單一呈現層時，這會非常有用，同時仍能編譯為原生目標。在這種設定中，螢幕、導航和 UI 狀態存在於共享程式碼中，而每個平台則保留其應用程式進入點與作業系統特定的整合。</p>
    <a href="https://kotlinlang.org/compose-multiplatform/"><img src="explore-compose.svg" alt="探索 Compose Multiplatform" width="500"/></a>
    <p>您可以將共享限制在系統中一個小型、定義明確的部分，例如定價引擎、驗證模組或同步策略，這些部分在兩個平台上都需要相同的行為。這實現了漸進式採用：團隊可以從單一共享模組開始，衡量其影響，並隨著時間推移進行擴充。共享程式碼與平台特定程式碼之間的界限可以隨著需求的變化而移動。</p>
    <p>對於具有 Kotlin 經驗的團隊來說，這是一個合理的選擇。Android 保持使用 Kotlin，iOS 則透過使用 Swift 或 SwiftUI 保持原生。目標不是最大化程式碼共享，而是根據需要共享程式碼，以降低成本或風險，且不限制產品決策。</p>
    <p>實際上，Kotlin Multiplatform 並非在原生與跨平台之間做選擇，而是為了保持架構的靈活性，並僅在能帶來明確、實際價值的地方共享程式碼。</p>
    <a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-success-stories.svg" alt="從 Kotlin Multiplatform 成功案例中學習" width="500"/></a>
    <chapter title="注意事項" id="flexible-considerations">
      <list>
        <li><b>需要明確的架構界限：</b> 團隊需要決定哪些內容屬於共享程式碼，哪些屬於平台程式碼，這增加了一些架構規劃工作。</li>
        <li><b>跨平台協調：</b> 共享模組意味著 Android 和 iOS 團隊需要在發佈和共享邏輯的變更上保持一致。</li>
        <li><b>生態系統成熟度因使用案例而異：</b> 某些程式庫或整合可能仍需要平台特定的實作。</li>
      </list>
    </chapter>
  </chapter>
  <chapter title="原生、跨平台架構與 Kotlin Multiplatform 的比較" id="comparing-native-cross-platform-frameworks-and-kotlin-multiplatform">
    <p>下表總結了原生開發、跨平台架構與 Kotlin Multiplatform 之間的主要差異。</p>
    <table style="both">
      <tr>
        <td></td>
        <td>完全原生開發</td>
        <td>跨平台架構 (Flutter, React Native)</td>
        <td>彈性的程式碼共享 (Kotlin Multiplatform)</td>
      </tr>
      <tr>
        <td>程式碼共享</td>
        <td width="250">無</td>
        <td width="250">大部分或全部程式碼共享</td>
        <td width="250">選擇性：從小型模組到應用程式的大部分</td>
      </tr>
      <tr>
        <td>UI 策略</td>
        <td>針對每個平台完全原生 (SwiftUI/UIKit, Compose/Views)</td>
        <td>單一共享 UI 層（渲染或橋接至原生）</td>
        <td>完全原生 UI 或透過 Compose Multiplatform 共享 UI</td>
      </tr>
      <tr>
        <td>API 存取</td>
        <td>完全且立即存取所有平台 API</td>
        <td>透過外掛程式/橋接器間接存取</td>
        <td>透過平台層完全存取；共享程式碼保持平台無關性</td>
      </tr>
      <tr>
        <td>最適合場景</td>
        <td>重視平台特定 UX、效能或深度系統整合的應用程式</td>
        <td>優先考慮單一程式碼庫並追求跨平台功能對等速度的團隊</td>
        <td>希望擁有原生 UX 但也想減少業務邏輯重複的團隊</td>
      </tr>
      <tr>
        <td>主要權衡</td>
        <td>重複的業務邏輯、較高的開發與維護成本</td>
        <td>對原生 UX 的控制力較弱，且依賴架構/外掛程式生態系統</td>
        <td>需要明確的架構界限和一些跨平台協調</td>
      </tr>
    </table>
    <p>透過 Kotlin Multiplatform，團隊可以選擇共享什麼以及何時共享。也許您想從小處著手，僅共享業務邏輯或一部分 UI，然後逐漸整合更多內容。這使得共享成為漸進式且可逆的，而非一次性的賭注，將架構變成一種靈活、演進的決策，而非固定的承諾。</p>
    <p>您可以在這些比較中深入了解 Kotlin Multiplatform：<a href="https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-flutter.html">Kotlin Multiplatform 與 Flutter</a>，以及 <a href="https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-react-native.html">Kotlin Multiplatform vs. React Native</a>。</p>
  </chapter>
  <chapter title="如何為 Android 與 iOS 應用程式選擇正確的方法"
           id="how-to-choose-the-right-approach">
    <p>在完全原生開發與不同的跨平台解決方案之間做出選擇，是一項關鍵的架構決策。</p>
    <chapter title="平台原生 UX 的重要性" id="importance-of-platform-native-ux">
      <p>要考量的第一個維度是平台原生 UX 的重要性。如果您的產品依賴嚴格遵守平台規範、專業互動或深度作業系統整合，那麼保持完全原生 UI 控制的方法可以降低長期風險。如果平台之間的視覺與互動差異不太重要，那麼共享 UI 層可能是為了增加重用率而做出的合理權衡。</p>
    </chapter>
    <chapter title="所需邏輯共享的程度" id="degree-of-logic-sharing-required">
      <p>另一個考量點是所需的邏輯共享程度。某些產品在各個平台上需要相似的業務規則、資料模型和工作流，而其他產品則受益於共享大部分的 UI 層。您與您的團隊需要釐清哪些系統組件必須執行一致，哪些預期會有所不同。這有助於防止共享不足（重複的關鍵邏輯）與過度共享（強加錯誤的同質性）。</p>
    </chapter>
    <chapter title="架構決策的可逆性" id="reversibility-of-architectural-decisions">
      <p>架構決策的可逆性是另一種重要的考量因素。某些選項會將您鎖定在特定的結構中，以後要更改的代價很高，特別是當 UI 與底層功能密不可分時。允許您逐漸移動通用程式碼與平台特定程式碼之間界限的架構，可以降低未來轉向與重構的成本。</p>
    </chapter>
    <chapter title="預期的產品壽命與演進" id="expected-product-lifespan-and-evolution">
      <p>最後，考慮產品預期的壽命與演進。將經歷重大變更、增加功能或適應新平台能力的產品，受益於職責清晰分離且依賴有限的設計。目標不是立即實現最大化重用，而是選擇一種隨著產品增長與變化而使變更易於管理的方法。</p>
    </chapter>
  </chapter>
  <chapter title="雙平台開發中的常見錯誤" id="common-mistakes-in-dual-platform-development">
    <chapter title="將不同平台視為完全相同" id="treating-platforms-as-identical">
      <p>最常見的錯誤之一是將所有平台視為完全相同。iOS 和 Android 具有不同的使用者期望、系統行為和技術限制。在兩個平台上使用相同的互動模式或流程可能會讓每個地方的體驗都感覺有點不對勁，即使實現了功能對等。功能一致性比視覺或行為的同質性更重要。</p>
    </chapter>
    <chapter title="未考慮 UX 的 UI 過度共享" id="oversharing-ui-without-ux-consideration">
      <p>另一種常見問題是未考慮 UX 影響的 UI 過度共享。共享螢幕與組件可能會縮短開發時間，但也可能抹平平台規範並限制原生互動模式的使用。當使用者介面變得過於通用時，產品在可用性、無障礙和長期精緻度方面都會受到影響。</p>
    </chapter>
    <chapter title="低估維護成本" id="underestimating-maintenance-costs">
      <p>團隊經常低估維護成本。雙平台應用程式不僅僅是讓測試與發佈工作翻倍；它們還增加了協調開銷、暴露更多邊緣情況，並增加了需要支援的作業系統版本和裝置範圍。忽視這一現實會導致發佈流程薄弱並增加技術債。</p>
    </chapter>
    <chapter title="鎖定於不可逆的架構" id="locking-into-irreversible-architecture">
      <p>致力於不可逆的架構是另一種結構性錯誤。根據您採用的方法，稍後更改關於哪些內容應共享、哪些內容應平台特定的想法可能會代價高昂。當產品方向或平台需求發生變化時，這些僵化的界限會將例行演進轉化為大規模的重構工作。</p>
    </chapter>
    <chapter title="忽視團隊專業知識" id="ignoring-team-expertise">
      <p>最後，忽視團隊專業知識會導致不必要的摩擦。如果一項架構與建置它的人員的技能、經驗和工作流不匹配，那麼它在紙面上看起來再好，在實踐中也可能會失敗。持續的開發速度通常是透過將技術選擇與（而非違背）團隊的實際工作流對齊來實現的。</p>
    </chapter>
  </chapter>
  <chapter title="常見問題" id="faq">
    <p><b>我可以從一個程式碼庫建立 Android 和 iOS 應用程式嗎？</b></p>
    <p>可以，視您採用的方法而定，您可以從同一個程式碼庫為兩個平台進行建置。Kotlin Multiplatform 讓您可以選擇共享什麼。您可以共享邏輯與 UI、僅共享邏輯並保持 UI 完全原生，或僅共享一小部分邏輯。</p>
    <p><b>跨平台比原生更好嗎？</b></p>
    <p>這兩種方法都沒有絕對的好壞；它們針對不同的目標進行優化。跨平台解決方案通常能減少重複並加快功能對等的速度，但原生開發則提供了對平台行為與使用者體驗的完全控制。正確的選擇取決於原生 UX、效能特性和平台特定整合對您的專案有多重要。</p>
    <p><b>使用 Kotlin Multiplatform 可以共享什麼？</b></p>
    <p>透過 Kotlin Multiplatform，您可以選擇共享什麼。您可以搭配使用 Kotlin 與 Compose Multiplatform 來共享高達 100% 的應用程式程式碼（包括 UI），同時仍能與原生 API 整合。或者，您可以共享邏輯但保持 UI 原生。Kotlin Multiplatform 允許您共享從小型、具針對性的模組到整個應用程式組件的所有內容。領域模型、業務規則、網路、快取和狀態管理都是可以共享的程式碼範例。</p>
    <p><b>Kotlin Multiplatform 可以用於正式環境嗎？</b></p>
    <p>可以，Kotlin Multiplatform 已被眾多團隊用於正式環境中，以共享業務邏輯，並在某些情況下共享 UI。核心工具與語言支援保持穩定，而專業庫與使用案例的成熟度則各不相同。與任何架構決策一樣，根據您的產品技術與組織需求對其進行測試至關重要。</p>
    <a href="get-started.topic"><img src="get-started-with-kmp.svg" alt="開始使用 Kotlin Multiplatform" width="500"/></a>
  </chapter>
  <chapter title="結語" id="conclusion">
    <p>建置 Android 與 iOS 應用程式沒有單一正確的方法。關鍵在於將此視為一項架構決策，而非工具偏好。平台原生 UX 需求、對一致業務邏輯的需求，以及未來變更的成本，都應該引導您劃定共享程式碼與平台特定程式碼之間的界限。</p>
    <p>與其追求最大化重用，不如追求適應性。像 Kotlin Multiplatform 這樣讓您能隨著時間調整共享內容的方法，往往能隨著產品的演進而有更好的表現。正確的選擇能支援今天的目標，同時保持明天的變更可控。</p>
  </chapter>
</topic>