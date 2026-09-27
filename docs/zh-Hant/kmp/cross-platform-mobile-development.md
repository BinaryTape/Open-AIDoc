<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="cross-platform-mobile-development"
   title="什麼是跨平台行動開發？"
   help-id="cross-platform-mobile-development">
<web-summary>探索跨平台行動開發，包括其定義、架構比較（Kotlin Multiplatform、Flutter、React Native）以及案例研究。</web-summary>
<p>現今，許多公司面臨著需要為多個平台建置行動應用程式的挑戰，特別是 Android 和 iOS。這就是為什麼跨平台行動開發解決方案已成為最熱門的軟體開發趨勢之一。</p>
<p>根據最近的 <a href="https://42matters.com/stats">應用程式市場數據</a>，Google Play 商店擁有超過 230 萬個應用程式，而 Apple App Store 提供約 220 萬個應用程式，Android 和 iOS 繼續主導著 <a href="https://gs.statcounter.com/os-market-share/mobile/worldwide">全球行動應用程式的分發與使用</a>。</p>
<p>該如何建立一個能觸及 Android 和 iOS 受眾的行動應用程式？在本文中，您將了解為什麼越來越多的行動工程師選擇跨平台或多平台（multiplatform）行動開發方法。</p>
<chapter title="跨平台行動開發：定義與解決方案" id="cross-platform-mobile-development-definition-and-solutions">
    <p>跨平台行動開發（也稱為多平台行動開發）是一種允許團隊使用單一共享程式碼庫為多個平台建置應用程式的方法。工程師不需要開發和維護兩個完全獨立的原生應用程式，而是編寫可以在各平台之間重複使用的公共程式碼。</p>
    <p>現代的 <a href="cross-platform-frameworks.topic">跨平台架構</a> 允許開發人員只需編寫一次應用程式的大部分邏輯，並在 Android 和 iOS 之間共享，從而顯著減少重複勞動並加速交付。例如，<a href="kmp-overview.md">Kotlin Multiplatform</a> 讓工程師可以重複使用其所有的商業邏輯，甚至可以透過 Compose Multiplatform 在平台之間共享 UI 程式碼。</p>
    <p><a href="https://kotlinlang.org/multiplatform/"><img src="discover-kmp.svg" alt="探索 Kotlin Multiplatform" width="600"/></a></p>
    <p>這種高程度的程式碼共享有助於確保各平台之間的使用者體驗一致，減少重複的開發工作，並降低長期維護成本。同時，現代架構允許開發人員在需要時仍能存取原生 API 和平台特定的功能。</p>
    <p>透過將程式碼重複使用與原生整合相結合，跨平台開發為旨在高效觸及 Android 和 iOS 使用者的公司提供了一個平衡的解決方案。</p>
    <chapter title="行動應用程式開發的不同方法" id="different-approaches-to-mobile-app-development">
        <p>跨平台解決方案在過去十年中有了顯著的演進。早期的混合工具（如 Apache Cordova 和 Ionic）實現了基於 Web 的程式碼在平台間共享，但通常效能有限且使用者體驗較差。現代編譯式架構（如 Kotlin Multiplatform 和 Flutter）提供了接近原生的效能和廣泛的程式碼重複使用，同時提供了對原生平台功能的更深層存取。</p>
        <p>建立同時適用於 Android 和 iOS 的應用程式主要有幾種方式：</p>
          <list type="none">
              <li><a href="#1-separate-native-apps-for-each-operating-system">獨立的原生應用程式</a></li>
              <li><a href="#2-progressive-web-apps-pwas">漸進式 Web 應用程式 (PWAs)</a></li>
              <li><a href="#3-cross-platform-apps">跨平台應用程式</a></li>
              <li><a href="#4-hybrid-apps">混合應用程式</a></li>
          </list>
        <chapter title="1. 為每個作業系統開發獨立的原生應用程式" id="1-separate-native-apps-for-each-operating-system">
            <p>在建立原生應用程式時，開發人員會針對特定的作業系統建置應用程式，並依賴專為單一平台設計的工具和程式語言：Android 使用 Kotlin 或 Java，iOS 使用 Swift 或 Objective-C。</p>
            <p>這些工具和語言讓您可以存取特定作業系統的功能，並打造具有直觀介面的回應式應用程式。但如果您想觸及 Android 和 iOS 受眾，您必須建立獨立的應用程式，這會耗費大量的時間與精力。</p>
        </chapter>
        <chapter title="2. 漸進式 Web 應用程式 (PWAs)" id="2-progressive-web-apps-pwas">
            <p>漸進式 Web 應用程式結合了行動應用程式的功能與 Web 開發中使用的解決方案。粗略地說，它們提供了網站和行動應用程式的混合體。開發人員使用 Web 技術（如 JavaScript、HTML、CSS 和 WebAssembly）來建置 PWA。</p>
            <p>Web 應用程式不需要單獨打包或分發，可以直接在網路上發佈。它們可以透過電腦、智慧型手機和平板電腦上的瀏覽器存取，不需要透過 Google Play 或 App Store 安裝。</p>
            <p>缺點是使用者在使用應用程式時無法利用其裝置的所有功能（例如聯絡人、行事曆、電話和其他資產），導致使用者體驗受限。就應用程式效能而言，原生應用程式仍處於領先地位。</p>
        </chapter>
        <chapter title="3. 跨平台應用程式" id="3-cross-platform-apps">
            <p>如前所述，多平台應用程式旨在不同的行動平台上以相同的方式執行。跨平台架構允許您編寫可共享且可重複使用的程式碼，以開發此類應用程式。</p>
            <p>這種方法具有多項優點，例如在時間和成本方面的效率。我們將在後面的章節詳細探討跨平台行動開發的優缺點。</p>
        </chapter>
        <chapter title="4. 混合應用程式" id="4-hybrid-apps">
            <p>在瀏覽網站和論壇時，您可能會注意到有些人會交替使用「<emphasis>跨平台行動開發</emphasis>」和「<emphasis>混合行動開發</emphasis>」這兩個術語。然而，這樣做並不完全準確。</p>
            <p>對於跨平台應用程式，行動工程師可以編寫一次程式碼，然後在不同平台上重複使用。另一方面，混合應用程式開發是結合原生和 Web 技術的方法。它需要將以 Web 開發語言（如 HTML、CSS 或 JavaScript）編寫的程式碼嵌入到原生應用程式中。您可以藉助 Ionic Capacitor 和 Apache Cordova 等架構，使用額外的外掛程式來存取平台的原生功能。</p>
            <p>跨平台與混合開發唯一的相似之處是程式碼的可共享性。在效能方面，混合應用程式與原生應用程式不相上下。由於混合應用程式部署單一程式碼庫，某些功能是特定於特定作業系統的，在其他系統上可能運作不佳。</p>
        </chapter>
    </chapter>
    <chapter title="原生或跨平台應用程式開發：長久的爭論" id="native-or-cross-platform-app-development-a-longstanding-debate">
        <p><a href="native-and-cross-platform.topic">關於原生和跨平台開發的爭論</a> 在技術社群中仍未解決。這兩項技術都在不斷演進，並各有利弊。</p>
        <p>一些專家仍然偏好原生行動開發而非多平台解決方案，認為原生應用程式更強大的效能和更好的使用者體驗是其中一些最重要的優點。</p>
        <p>然而，許多現代企業需要更快速地在 Android 和 iOS 上發佈功能。這正是 Kotlin Multiplatform 等跨平台開發技術可以提供幫助的地方。像 Duolingo 這樣的公司已經 <a href="https://youtu.be/RJtiFt5pbfs?si=jNBydHcHPw-IIEVZ">看到了其影響力</a>。正如其用戶端平台團隊的 John Rodriguez 所指出的：</p>
        <note>
            <p>對於 Duolingo 來說，一個令人興奮的趨勢是，我們在內部使用 Kotlin Multiplatform 越多，我們發現在發佈速度方面就越快。事實證明，在學習了某些東西之後，你就會變得非常擅長。[…] 現在對此有了更多的信心，我們正在建立相關知識。</p>
        </note>
        <p><a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-use-cases-1.svg" alt="探索 Kotlin Multiplatform 案例研究" width="600"/></a></p>
    </chapter>
</chapter>
<chapter title="跨平台行動開發適合您嗎？" id="is-cross-platform-mobile-development-right-for-you">
    <p>選擇跨平台開發通常不僅是出於技術原因，還因為其業務優勢。透過在平台之間共享程式碼，團隊可以減少重複的開發工作，加速功能交付，並簡化長期維護。</p>
    <chapter title="跨平台行動開發的優點" id="benefits-of-cross-platform-mobile-development">
        <p>企業選擇這種方法而非其他選項的原因有很多：</p>
          <list type="none">
              <li><a href="#1-reusable-code">可重複使用的程式碼</a></li>
              <li><a href="#2-time-savings">節省時間</a></li>
              <li><a href="#3-effective-resource-management">有效的資源管理</a></li>
              <li><a href="#4-attractive-opportunities-for-developers">對開發人員具有吸引力的機會</a></li>
              <li><a href="#5-opportunity-to-reach-wider-audiences">觸及更廣泛受眾的機會</a></li>
              <li><a href="#6-quicker-time-to-market-and-customization">更快的上市時間與自訂</a></li>
          </list>
        <chapter title="1. 可重複使用的程式碼" id="1-reusable-code">
            <p>透過跨平台程式設計，行動工程師不需要為每個作業系統編寫新程式碼。使用單一程式碼庫可以讓開發人員減少執行重複性任務的時間，例如 API 呼叫、資料存儲、資料序列化和分析實作。</p>
            <p>Kotlin Multiplatform 等技術讓您只需實作一次應用程式的資料層、商業層和呈現層。或者，您可以逐步採用 KMP。選擇一段經常變動且通常不同步的邏輯（如篩選或排序），將其改為跨平台，然後將其作為共享模組連接到您的專案中。</p>
            <p>在 JetBrains，我們定期進行 Kotlin Multiplatform 調查，並詢問社群成員他們在不同平台之間共享哪些部分的程式碼。</p>
            <img src="survey-results-q1-q2-22.png" alt="Kotlin Multiplatform 使用者可在平台之間共享的程式碼部分" width="700"/>
        </chapter>
        <chapter title="2. 節省時間" id="2-time-savings">
            <p>由於大部分的應用程式邏輯可以在平台之間共享，開發人員可以減少重複的功能開發。這減少了開發工作量，並使團隊能夠更快地向兩個平台交付新功能。</p>
        </chapter>
        <chapter title="3. 有效的資源管理" id="3-effective-resource-management">
            <p>擁有單一程式碼庫有助於團隊更有效地管理資源。與其為 Android 和 iOS 維護獨立的程式碼庫和開發工作流程，團隊可以在共享組件上進行協作，並專注於建置產品功能，而不是重複勞動。</p>
        </chapter>
        <chapter title="4. 對開發人員具有吸引力的機會" id="4-attractive-opportunities-for-developers">
            <p>許多行動工程師將現代跨平台技術視為產品技術堆疊中理想的元素。開發人員在必須執行重複且例行的任務（例如 JSON 解析）時可能會感到厭倦。然而，新技術和任務可以帶回他們的興奮感、動力和工作樂趣。透過這種方式，擁有現代技術堆疊實際上可以讓您更輕鬆地配置行動開發團隊的人員，並讓他們長期保持參與感和熱情。</p>
        </chapter>
        <chapter title="5. 觸及更廣泛受眾的機會" id="5-opportunity-to-reach-wider-audiences">
            <p>您不必在不同平台之間做出選擇。由於您的應用程式與多個作業系統相容，您可以滿足 Android 和 iOS 受眾的需求，並最大化您的觸及範圍。</p>
        </chapter>
        <chapter title="6. 更快的上市時間與自訂" id="6-quicker-time-to-market-and-customization">
            <p>由於您不需要為不同平台建置不同的應用程式，您可以更快地開發並發佈產品。更重要的是，如果您的應用程式需要自訂或轉型，程式設計師更容易對程式碼庫的特定部分進行微調。這也能讓您更快速地回應使用者回饋。</p>
        </chapter>
    </chapter>
    <chapter title="跨平台開發方法的挑戰" id="challenges-of-a-cross-platform-development-approach">
        <p>所有解決方案都有其局限性。技術社群中的一些人認為跨平台程式設計在效能方面仍面臨挑戰。此外，專案負責人可能會擔心他們專注於優化開發過程可能會對應用程式的使用者體驗產生負面影響。</p>
        <p>然而，隨著底層技術的改進，跨平台解決方案正變得日益穩定、可適應且靈活。</p>
        <p>另一個常見的擔憂是，多平台開發無法無縫支援平台的原生功能。然而，透過 Kotlin Multiplatform，您可以使用 Kotlin 的 <a href="multiplatform-expect-actual.md">expected 與 actual 宣告</a> 來讓您的多平台應用程式存取平台特定的 API。expected 與 actual 宣告允許您在公共程式碼中定義您「預期（expect）」能夠在多個平台呼叫相同的函式，並提供「實際（actual）」實作，由於 Kotlin 與 Java 和 Objective-C/Swift 的互通性，這些實作可以與任何平台特定的程式庫互動。</p>
        <p>隨著現代多平台架構的不斷演進，它們越來越能讓行動工程師打造出類似原生的體驗。如果應用程式編寫得好，使用者將無法察覺差異。然而，產品的品質將很大程度上取決於您選擇的跨平台應用程式開發工具。</p>
    </chapter>
</chapter>
<chapter title="跨平台架構比較" id="cross-platform-framework-comparison">
    <p>有幾種架構允許開發人員使用共享程式碼庫來建置跨平台行動應用程式。雖然它們都旨在減少 Android 和 iOS 開發之間的重複工作，但它們在程式語言、渲染方法、效能特性和生態系統成熟度方面有所不同。</p>
    <p>以下概覽比較了當今一些使用最廣泛的跨平台架構。</p>
    <table style="both">
        <tr>
            <td width="160"></td>
            <td width="50"><b>語言</b></td>
            <td width="230"><b>跨平台的程式碼共享</b></td>
            <td width="140"><b>社群成熟度</b></td>
            <td width="130"><b>應用程式範例</b></td>
        </tr>
        <tr>
            <td><b>Kotlin Multiplatform</b></td>
            <td>Kotlin</td>
            <td>
                在平台之間靈活共享商業邏輯與 UI，同時在需要時保留原生平台程式碼。
            </td>
            <td>快速增長</td>
            <td>
                Duolingo, McDonald's,
                Forbes, Philips,
                H&amp;M, Bolt
            </td>
        </tr>
        <tr>
            <td><b>Flutter</b></td>
            <td>Dart</td>
            <td>
                大部分的應用程式邏輯與 UI 都在單一 Dart 程式碼庫中共享。
            </td>
            <td>規模大且成熟</td>
            <td>
                eBay Motors, Alibaba,
                Google Pay,
                ByteDance 應用程式
            </td>
        </tr>
        <tr>
            <td><b>React Native</b></td>
            <td>
                JavaScript,
                TypeScript
            </td>
            <td>
                商業邏輯與 UI 組件在平台之間共享，從單個功能到完整的應用程式皆可。
            </td>
            <td>規模大且成熟</td>
            <td>
                Microsoft Office, Teams,
                Xbox Game Pass;
                Facebook, Instagram
            </td>
        </tr>
        <tr>
            <td><b>.NET MAUI</b></td>
            <td>C#, XAML</td>
            <td>
                商業邏輯與 UI 在單一 C# 程式碼庫中跨平台共享。
            </td>
            <td>已建立</td>
            <td>
                NBC Sports Next,
                Escola Agil,
                Azure App
            </td>
        </tr>
        <tr>
            <td><b>Ionic</b></td>
            <td>JavaScript</td>
            <td>
                大部分的應用程式邏輯與 UI 透過單一基於 Web 的程式碼庫共享，並透過外掛程式存取原生功能。
            </td>
            <td>成熟</td>
            <td>
                T-Mobile,
                BBC (兒童應用程式),
                EA Games
            </td>
        </tr>
        <tr>
            <td><b>NativeScript</b></td>
            <td>
                JavaScript,
                TypeScript
            </td>
            <td>
                大部分的應用程式邏輯與 UI 在單一 JavaScript 或 TypeScript 程式碼庫中跨平台共享。
            </td>
            <td>已建立</td>
            <td>
                Daily Nanny,
                Groov, Breethe
            </td>
        </tr>
    </table>
    <p>您也可以查看關於 <a href="cross-platform-frameworks.topic">最熱門跨平台技術</a> 的更詳細概覽。</p>
    <p><b>Kotlin Multiplatform</b></p>
    <p>Kotlin Multiplatform 使團隊能夠使用 Kotlin 跨平台共享應用程式邏輯。借助 Compose Multiplatform，開發人員可以共享高達 100% 的應用程式程式碼（包括 UI），同時在需要時仍能與原生 API 整合。這種方法允許團隊從單一程式碼庫為 Android、iOS、桌面和 Web 建置應用程式，同時保持原生功能。</p>
    <p><a href="get-started.topic"><img src="get-started-with-kmp.svg" alt="開始使用 Kotlin Multiplatform" width="600"/></a></p>
    <p><b>Flutter</b></p>
    <p>Flutter 是由 Google 建立的跨平台架構，使用 Dart 程式語言及其自己的渲染引擎。由於它控制 UI 渲染層，Flutter 可以在不同平台之間提供一致的視覺效果和強大的效能。詳細探索 <a href="kotlin-multiplatform-flutter.md">Kotlin Multiplatform 與 Flutter</a>，以更好地了解它們的功能並為您的跨平台專案確定合適的選擇。</p>
    <p><b>React Native</b></p>
    <p>React Native 讓開發人員能夠使用 JavaScript 和 React 程式庫建置行動應用程式。它在透過 JavaScript 執行時執行邏輯的同時渲染原生 UI 組件，這使其在具有 Web 開發經驗的團隊中非常受歡迎。查看 <a href="kotlin-multiplatform-react-native.topic">Kotlin Multiplatform 與 React Native</a> 概覽，這可能有助於您為產品和團隊選擇合適的方案。</p>
    <p><b>.NET MAUI</b></p>
    <p>.NET MAUI 是 Microsoft 的跨平台架構，用於使用 C# 和 .NET 生態系統建置原生行動和桌面應用程式。它允許開發人員從單一程式碼庫針對 Android、iOS、macOS 和 Windows 進行開發，並與 Visual Studio 等工具緊密整合。</p>
    <p><b>Ionic</b></p>
    <p>Ionic 是一個使用 HTML、CSS 和 JavaScript 等 Web 技術的混合行動架構。應用程式在 WebView 中執行，並透過外掛程式或原生橋接存取裝置功能，這使得 Ionic 成為具有強大 Web 開發背景團隊的一個不錯選擇。</p>
    <p><b>NativeScript</b></p>
    <p>NativeScript 是一個開源架構，用於使用 JavaScript 或 TypeScript 建置原生行動應用程式。它渲染真正的原生 UI 組件，並提供對平台 API 的直接存取，允許開發人員建立具有原生效能和使用者體驗的跨平台應用程式。</p>
</chapter>
<chapter title="真實世界的 Kotlin Multiplatform 範例" id="real-world-kotlin-multiplatform-examples">
    <p>Duolingo, McDonald's, Netflix, 9GAG, VMware, Cash App, Philips 以及許多其他大公司正 <a href="use-cases-examples.md">日益採用 Kotlin Multiplatform</a>，以從這些效率中獲益，同時保持原生效能和平台特定的使用者體驗。其中一些公司選擇透過共享現有 Kotlin 程式碼中特定、關鍵的部分來增強其應用程式穩定性。其他公司則旨在最大化程式碼重複使用而不損害應用程式品質，並跨行動、桌面、Web 和 TV 共享所有應用程式邏輯，同時在每個平台上保留原生 UI。這種方法的優點從已經採用它的公司的故事中可見一斑。</p>
    <p><b>Duolingo</b></p>
    <p>Duolingo 使用 Kotlin Multiplatform 來協助加速其行動平台間的開發。該公司每週向 176 個國家/地區的 4,000 多萬名每日活躍使用者發佈 Android 和 iOS 更新，團隊報告稱 Kotlin Multiplatform 正日益幫助他們更快地跨平台交付功能。<a href="https://youtu.be/RJtiFt5pbfs?si=b8mndETdH-tplZQA">觀看完整影片</a>。</p>
    <p><b>McDonald’s</b></p>
    <p>McDonald’s 應用程式背後的 Umain 團隊最初為其支付功能採用了 Kotlin Multiplatform，隨後將其擴展到整個行動應用程式。在引入共享 Kotlin 程式碼後，團隊報告稱當機次數減少，且各平台效能均有所提升。這一轉變還幫助團隊從獨立的 Android 和 iOS 團隊轉向更統一的行動開發團隊。<a href="https://youtu.be/uCkYZ-PvCmw?si=eLG2rmq5Hw3yvt0i">觀看完整影片</a>。</p>
    <p><b>Forbes</b></p>
    <p>透過在 iOS 和 Android 之間共享超過 80% 的邏輯，Forbes 現在可以在兩個平台上同步推出新功能，同時保持根據特定平台自訂功能的靈活性。這使團隊能夠更快地創新並回應市場需求。<a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">閱讀完整故事</a>。</p>
    <p><a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-use-cases-1.svg" alt="探索 Kotlin Multiplatform 案例研究" width="600"/></a></p>
    <p>您也可以探索 <a href="multiplatform-reasons-to-try.md">開發人員應該考慮在其現有或新專案中使用 Kotlin Multiplatform 的原因</a>，以及為什麼它能持續獲得關注。</p>
</chapter>
<chapter title="常見問題" id="frequently-asked-questions">
    <p><b>問：什麼是跨平台行動開發？</b></p>
    <p>答：跨平台行動開發（也稱為跨平台應用程式開發）是一種讓您使用單一程式碼庫，即可建置在多個作業系統（如 iOS 和 Android）上執行的應用程式的方法。透過在平台之間共享程式碼，開發人員可以降低成本並加快上市速度。</p>
    <p><b>問：我該如何選擇跨平台架構？</b></p>
    <p>答：請根據您團隊的技能、專案需求和長期產品目標來選擇跨平台架構。例如，對於專注於效能、可維護性以及原生外觀和感覺的團隊來說，Kotlin Multiplatform 特別有吸引力，尤其是在使用 Compose Multiplatform 共享 UI 程式碼時。React Native 通常受到具有 JavaScript 和 React 經驗的團隊青睞，特別是用於快速原型設計。.NET MAUI 對於在 .NET 生態系統中工作的開發人員來說是一個強大的選擇。</p>
    <p><b>問：Kotlin Multiplatform 和 Compose Multiplatform 之間有什麼區別？</b></p>
    <p>答：<a href="https://kotlinlang.org/multiplatform/">Kotlin Multiplatform</a> 是核心技術，讓您可以在多個平台（包括 Android、iOS、桌面、Web 和伺服器）之間共享程式碼。它專注於程式碼重複使用，除非您願意，否則不會取代原生 UI。<a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a> 是一個建立在 Kotlin Multiplatform 之上的可選 UI 架構。它允許您使用類似於 Android 上 Jetpack Compose 的現代宣告式方法跨平台共享使用者介面。您可以使用它從單一程式碼庫為 Android、iOS、桌面和 Web 建置具有視覺吸引力且回應迅速的 UI。</p>
    <p><b>問：最受歡迎的行動開發架構是什麼？</b></p>
    <p>答：跨平台行動應用程式開發的熱門架構包括 Kotlin Multiplatform、Flutter、React Native、.NET MAUI 等。您可以查看 <a href="cross-platform-frameworks.topic">最熱門跨平台技術概覽</a>，找到最適合您需求的一款。</p>
    <p>如果您的團隊在採用新的多平台技術方面需要幫助，我們建議查閱我們的指南：<a href="multiplatform-introduce-your-team.md"><i>如何向您的團隊介紹多平台開發</i></a>。</p>
    <p><a href="get-started.topic"><img src="get-started-with-kmp.svg" alt="開始使用 Kotlin Multiplatform" width="600"/></a></p>
</chapter>
<chapter title="結論" id="conclusion">
    <p>隨著跨平台開發解決方案的不斷演進，與其提供的優點相比，其局限性已顯得微不足道。市場上有各種技術，都適合不同的工作流程和需求。本文討論的每種工具都為考慮嘗試跨平台的團隊提供了廣泛的支援。</p>
    <p>最終，仔細考慮您特定的業務需求、目標和任務，並為您的應用程式制定明確的目標，將有助於您找到最適合的解決方案。</p>
</chapter>
</topic>