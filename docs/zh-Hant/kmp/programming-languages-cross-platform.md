<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="programming-languages-cross-platform"
   title="開發跨平台應用程式的熱門程式語言">
<title>
    開發跨平台應用程式的熱門程式語言
</title>
<web-summary>探索選擇跨平台開發語言時的核心考量因素、熱門技術比較以及真實案例研究。</web-summary>
<p>您可能已經注意到「<a href="cross-platform-mobile-development.topic">跨平台開發</a>」這個詞最近出現得越來越頻繁。的確，跨平台程式設計在軟體開發領域正變得日益普及。這在行動應用程式領域尤為普遍，但其用途絕不僅限於此類應用程式。隨著企業致力於在多種裝置和作業系統上觸及更廣泛的受眾，開發人員正轉向使用能消除平台障礙的多功能語言和架構。</p>
<p>如果您想知道哪種程式語言最能助您開啟跨平台開發之旅，這篇總覽文章將為您指引正確的方向，提供深入見解與真實的使用案例。</p>
<chapter title="了解跨平台開發" id="understanding-cross-platform-development">
    <p>跨平台應用程式開發是指一種開發方法，其中單一程式碼庫可用於建立在多個平台上執行的軟體，例如 iOS、Android、Windows、macOS 和網頁瀏覽器等。這種方法近年來大受歡迎，很大程度上歸功於對行動應用程式日益增長的需求。行動工程師可以在 iOS 和 Android 之間共用部分或全部原始碼，而無需為每個平台開發單獨的應用程式。</p>
    <p>我們有一份專門的指南，您可以在其中閱讀更多關於<a href="native-and-cross-platform.topic">原生與跨平台開發的優點與限制</a>，以及如何在二者之間做出選擇。跨平台開發的一些主要優點包括：</p>
    <list type="decimal">
        <li>
            <p>
                <control>成本效益。</control>
                為每個平台組建單獨的應用程式，在時間和資源方面都可能非常昂貴。透過跨平台開發，開發人員可以編寫一次程式碼並將其部署到多個平台，從而降低開發成本。
            </p>
        </li>
        <li>
            <p>
                <control>開發速度更快。</control>
                這種方法有助於加速開發過程，因為開發人員只需要編寫和維護單一程式碼庫。
            </p>
        </li>
        <li>
            <p>
                <control>高效且靈活的程式碼共用。</control>
                現代跨平台技術使開發人員能夠在多個平台之間重複使用程式碼，同時保持原生程式設計的優勢。
            </p>
        </li>
        <li>
            <p>
                <control>跨平台一致的使用者體驗。</control>
                跨平台開發可確保關鍵行為（例如計算或工作流程）在需要時在不同平台上提供相同的結果。這有助於保持一致性，無論使用者是在何種裝置或作業系統上，都能提供相同的體驗。
            </p>
        </li>
    </list>
    <p>在本文中，我們將討論一些最受歡迎的跨平台開發程式語言。</p>
</chapter>
<chapter title="熱門跨平台程式語言、架構與技術"
         id="popular-cross-platform-programming-languages-frameworks-and-technologies">
    <p>本文重點介紹適合跨平台開發且發展成熟的程式語言。雖然有許多為各種目的設計的語言，但本節將簡要介紹一些最受歡迎的跨平台開發程式語言，以及相關統計數據和支援它們的架構。</p>
    <p>
        <control>總覽與普及度</control>
    </p>
    <table style="header-row">
        <tr>
            <td>語言</td>
            <td>首次出現</td>
            <td>普及度 (<a href="https://survey.stackoverflow.co/2025/technology/">Stack
                Overflow, 2025</a>)</td>
            <td>普及度 (<a href="https://devecosystem-2025.jetbrains.com/">開發者生態系統報告 2025</a>)</td>
        </tr>
        <tr>
            <td>JavaScript</td>
            <td>1995</td>
            <td>#1 (66%)</td>
            <td>#1 (61%)</td>
        </tr>
        <tr>
            <td>Dart</td>
            <td>2011</td>
            <td>#19 (5.9%)</td>
            <td>#16 (8%)</td>
        </tr>
        <tr>
            <td>Kotlin</td>
            <td>2011</td>
            <td>#15 (10.08%)</td>
            <td>#12 (18%)</td>
        </tr>
        <tr>
            <td>C#</td>
            <td>2000</td>
            <td>#8 (27.8%)</td>
            <td>#9 (21%)</td>
        </tr>
        <tr>
            <td>C++</td>
            <td>1985</td>
            <td>#9 (23.5%)</td>
            <td>#8 (25%)</td>
        </tr>
    </table>
    <p>
        <control>生態系統與技術</control>
    </p>
    <table style="header-row">
        <tr>
            <td>語言</td>
            <td>生態系統／工具集</td>
            <td>技術／架構</td>
        </tr>
        <tr>
            <td>JavaScript</td>
            <td>豐富的生態系統、眾多的程式庫、活躍的社群</td>
            <td>React Native, Ionic</td>
        </tr>
        <tr>
            <td>Dart</td>
            <td>不斷成長的生態系統，由 Google 支援</td>
            <td>Flutter</td>
        </tr>
        <tr>
            <td>Kotlin</td>
            <td>擴張中的生態系統，強大的 JetBrains 支援</td>
            <td>Kotlin Multiplatform</td>
        </tr>
        <tr>
            <td>C#</td>
            <td>來自 Microsoft 的強大支援，龐大的生態系統</td>
            <td>.NET MAUI</td>
        </tr>
        <tr>
            <td>C++</td>
            <td>成熟的生態系統，較少的第三方程式庫</td>
            <td>Qt</td>
        </tr>
    </table>
    <p>
        <control>JavaScript</control>
    </p>
    <p>JavaScript 是一種廣泛使用的程式語言，允許開發人員在網頁上加入複雜的功能。隨著 React Native 和 Ionic 等架構的引入，它已成為跨平台應用程式開發的熱門選擇。根據 JetBrains 進行的最新<a href="https://devecosystem-2025.jetbrains.com/">開發者生態系統調查</a>，61% 的開發人員使用 JavaScript，這使其成為最受歡迎的程式語言。</p>
    <p>
        <control>Dart</control>
    </p>
    <p>Dart 是一種物件導向、基於類別的程式語言，由 Google 於 2011 年推出。Dart 是 Flutter 的基礎，Flutter 是由 Google 建立的開源架構，用於從單一程式碼庫組建多平台應用程式。Dart 提供了驅動 Flutter 應用程式的語言和執行階段。</p>
    <p>
        <control>Kotlin</control>
    </p>
    <p>Kotlin 是一種由 JetBrains 開發的現代、成熟的多平台程式語言。根據 <a
            href="https://github.blog/news-insights/octoverse/octoverse-2024/#the-most-popular-programming-languages">Octoverse 報告</a>，它是 2024 年成長速度第五快的語言。它簡潔、安全、可與 Java 及其他語言互通，並且是 Google 偏好的 Android 應用程式開發語言。</p>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/">Kotlin Multiplatform (KMP)</a> 是 JetBrains 的一項技術，允許您為各種平台建立應用程式並跨平台重複使用 Kotlin 程式碼，同時保留原生程式設計的優點。此外，JetBrains 還提供了 Compose Multiplatform，這是一個基於 KMP 和 Jetpack Compose 的宣告式架構，用於跨多個平台共用 UI。2024 年 5 月，Google 宣布正式<a
                href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">支援 Kotlin Multiplatform</a>，用於在 Android 和 iOS 之間共用商業邏輯。</p>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="discover-kmp.svg"
                                                                      alt="探索 Kotlin Multiplatform"
                                                                      width="500" style="block"/></a></p>
    <p>
        <control>C#</control>
    </p>
    <p>C# 是由 Microsoft 開發的跨平台、通用程式語言。C# 是 .NET Framework 最受歡迎的語言。.NET MAUI 是一個用於從單一 C# 程式碼庫為 Android、iOS、Mac 和 Windows 組建原生跨平台桌面與行動應用程式的架構。</p>
    <p>
        <control>C++</control>
    </p>
    <p>C++ 是一種通用程式語言，最初於 1985 年作為 C 程式語言的擴充發佈。Qt 是一個跨平台軟體開發架構，包含一組模組化的 C++ 程式庫類別，並為應用程式開發提供了一系列 API。</p>
</chapter>
<chapter title="選擇跨平台程式語言的關鍵因素"
         id="key-factors-in-selecting-a-cross-platform-programming-language">
    <p>面對現今所有可用的語言、技術和工具，選擇正確的一個可能會讓人不知所措，尤其是如果您才剛踏入跨平台開發的世界。各種跨平台技術都有其獨特的優缺點，但最終，這一切都取決於您要組建的軟體的目標和需求。</p>
    <p>在為您的專案選擇語言或架構時，應牢記幾個重要因素。這些因素包括應用程式類型、其效能與使用者體驗 (UX) 需求、相關工具集以及下文詳述的其他各種考量。</p>
    <p>
        <control>1. 應用程式類型</control>
    </p>
    <p>不同的程式語言和架構在 Windows、macOS、Linux, iOS、Android 和網頁瀏覽器等不同平台上的支援程度不同。某些語言天生更適合特定的平台和專案。</p>
    <p>
        <control>2. 效能與 UX 需求</control>
    </p>
    <p>某些類型的應用程式具有特定的效能和使用者體驗 (UX) 需求，這些需求可以透過不同的標準來衡量，例如速度、回應性、記憶體使用量，以及對 CPU 和 GPU 的消耗。考量您未來的應用程式需要實現的功能，以及您對上述標準的期望參數。</p>
    <tip>
        <p>例如，圖形密集型的遊戲應用程式可能會受益於能高效利用 GPU 的語言。與此同時，商務應用程式可能會優先考慮資料庫整合與網路通訊的便利性。</p>
    </tip>
    <p>
        <control>3. 現有的技能組合與學習曲線</control>
    </p>
    <p>在為下一個專案選擇技術時，開發團隊應考慮到先前的經驗。引入新語言或工具需要時間進行培訓，有時可能會延誤專案。學習曲線越陡峭，團隊達到熟練程度所需的時間就越長。</p>
    <tip>
        <p>例如，如果您的團隊由精通 JavaScript 的開發人員組成，且您缺乏採用新技術的資源，那麼選擇使用 JavaScript 的架構（如 React Native）可能會更有利。</p>
    </tip>
    <p>
        <control>4. 現有的使用案例</control>
    </p>
    <p>另一個要考慮的重要因素是該技術在現實世界中的使用情況。查看成功實作特定跨平台語言或架構的公司的案例研究，可以為這些技術在生產環境中的表現提供寶貴的見解。這可以幫助您評估特定技術是否適合您的專案目標。探索企業利用 Kotlin Multiplatform 開發跨多平台、準備好用於生產環境應用程式的<a
                href="https://kotlinlang.org/case-studies/?type=multiplatform">案例研究</a>。</p>
    <p>例如，<a href="https://kotlinlang.org/case-studies/#mcdonalds-umain">麥當勞應用程式背後的 Umain 團隊</a>已轉向更統一的行動開發方法，在 iOS 和 Android 之間使用共用的 Kotlin 程式碼庫。<a
                href="https://blog.jetbrains.com/kotlin/2021/01/philips-case-study-building-connectivity-platform-with-kotlin-multiplatform/">Philips 使用 KMP</a> 來驅動連網裝置的跨平台 SDK，確保 Android 和 iOS 之間功能一致，而像 <a href="https://kotlinlang.org/case-studies/#9gag">9GAG 這樣的媒體平台則使用它來共用核心內容和資料邏輯</a>，確保功能對等並加快迭代速度。</p>
    <p><a href="https://kotlinlang.org/case-studies/?type=multiplatform"><img src="kmp-use-cases-1.svg"
                                                                              alt="探索真實世界的 Kotlin Multiplatform 使用案例"
                                                                              width="500" style="block"/></a></p>
    <p>
        <control>5. 語言生態系統</control>
    </p>
    <p>語言生態系統的成熟度也起著重要作用。請注意支援多平台開發的工具和程式庫的可用性與品質。例如，JavaScript 擁有龐大數量的程式庫，支援前端架構 (React、Angular、Vue.js)、後端開發 (Express, NestJS) 以及廣泛的其他功能。</p>
    <p>同樣地，Flutter 擁有數量龐大且快速增長的程式庫，也稱為套件 (package) 或外掛程式 (plugin)。雖然 Kotlin Multiplatform 目前的程式庫較少，但其生態系統正在迅速發展，並且該語言正受到全球眾多 Kotlin 開發人員的強化。您可以在 <a href="https://klibs.io/">klibs.io</a> 上已有的數千個程式庫中搜尋特定的多平台程式庫。
    </p>
    <p>
        <control>6. 普及度與社群支援</control>
    </p>
    <p>程式語言及其相關技術的普及度和社群支援值得仔細研究。這不僅僅取決於使用者和程式庫的數量。請注意該語言社群（包括其使用者和貢獻者）的活躍程度和支援程度。尋找可用的部落格、播客、論壇和其他資源。</p>
    <p>
        <control>7. 授權與廠商永續性</control>
    </p>
    <p>開發人員通常會尋找由大型社群或知名組織支援的開源、廠商中立的語言和架構。開源生態系統（如 Kotlin、JavaScript 或 Dart）降低了廠商鎖定的風險，並讓團隊能夠根據需要獨立維護或強化工具。</p>
    <p>同時，廠商支援仍然很重要——由 Google、JetBrains 或 Meta 支援的架構進步更快，且能獲得更頻繁的升級。平衡這些方面至關重要。一個強大的專案通常結合了透明的治理、活躍的社群貢獻以及維護者的長期承諾，從而確保團隊的技術選擇在未來多年內都是可行的。</p>
</chapter>
<chapter title="跨平台開發的未來" id="the-future-of-cross-platform-development">
    <p>隨著跨平台開發的進步，幾種新興趨勢正在影響其未來，將其推向超越基礎程式碼共用、邁向更智慧且更靈活的解決方案。</p>
    <p>
        <control>WebAssembly 與伺服器驅動的 UI</control>
    </p>
    <p>一個顯著的趨勢是 WebAssembly (Wasm) 的興起，它允許高效能程式碼（使用 Rust 或 C++ 等語言編寫）在瀏覽器中與 JavaScript 一併執行。這實現了真正的可攜式應用程式，能在各平台提供接近原生的效能，而無需過度依賴平台特定程式碼。同時，伺服器驅動的 UI 正日益普及，允許開發人員從後端自訂應用程式介面，減少對頻繁用戶端更新的需求並提升跨裝置的一致性。</p>
    <p>
        <control>AI 輔助程式碼產生</control>
    </p>
    <p>另一個重要趨勢是 AI 輔助程式碼產生。由大型語言模型驅動的工具透過建立樣板程式碼、推薦跨平台抽象化，甚至是協助語言間的程式碼翻譯，來加速開發。這降低了進入門檻並加速了交付，特別是對於跨不同平台工作的團隊而言。</p>
    <p>
        <control>Rust 與 Go 在跨平台系統中的崛起</control>
    </p>
    <p>Rust 和 Go 等語言在跨平台後端服務和效能關鍵組件中變得越來越受歡迎。Rust 特別因其記憶體安全性和 WebAssembly 相容性而受到讚譽，而 Go 的簡潔性和並行模型使其非常適合大型跨平台應用程式。</p>
    <p>
        <control>低程式碼與無程式碼的加速</control>
    </p>
    <p>許多企業現在正使用低程式碼和無程式碼平台來快速製作原型，甚至在只需少量工程參與的情況下交付跨平台應用程式。雖然它們無法取代大型程式的全方位開發，但它們大幅縮短了簡單使用案例的上市時間。</p>
    <p>整體而言，跨平台開發的未來正轉向高效能、自動化和多功能性的結合。隨著這些技術的進步，開發人員將能夠在各平台創造更豐富、更快速且更一致的體驗——同時花費更少的時間處理平台特定的複雜性。</p>
    <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="see-kmp-in-action.svg"
                                                                      alt="查看 Kotlin Multiplatform 實際運作情況"
                                                                      width="500" style="block"/></a></p>
    </chapter>
    <chapter title="常見問題" id="frequently-asked-questions">
    <p>
        <control>Q：最受歡迎的跨平台程式語言有哪些？</control>
    </p>
    <p>A：Kotlin、JavaScript、Python、Java、C#、C++ 和 Dart 均屬於最受歡迎的跨平台開發語言。它們的吸引力來自於強大的生態系統、成熟的工具以及廣泛的社群支援，使其成為開發 Web、行動和桌面應用程式的可靠選擇。</p>
    <p>
        <control>Q：Python 適合用於跨平台開發嗎？</control>
    </p>
    <p>是的，Python 具有適應性，非常適合跨平台桌面應用程式和指令碼編寫。Kivy 等架構允許開發人員使用單一程式碼庫建立在多個平台上執行的應用程式。然而，它在原生行動應用程式開發中的應用較少，在該領域 Kotlin、Swift 和 Dart 更為普遍。</p>
    <p>
        <control>Q：如何在 Kotlin、Flutter (Dart) 和 React Native (JavaScript) 之間做出選擇？</control>
    </p>
    <p>正確的選擇取決於幾個關鍵因素：</p>
    <list>
        <li><p>團隊專業知識——透過利用員工已經了解的知識來縮短上手時間。</p></li>
        <li><p>UI 處理方法——Flutter 提供高度可自訂的 UI，但 React Native 依賴原生組件。相比之下，Kotlin Multiplatform 提供更多靈活性。開發人員可以選擇僅共用商業邏輯，同時讓每個平台的 UI 保持完全原生，或者使用 Compose Multiplatform 同時共用邏輯和 UI。</p></li>
        <li><p>效能需求——Kotlin（用於原生 Android）效能最佳，而 Kotlin Multiplatform 能在不犧牲效能的情況下實現跨平台開發。Flutter 憑藉其渲染引擎提供高效能，而 React Native 的效能則可能因橋接和應用程式複雜度而異。</p></li>
        <li><p>社群與生態系統——React Native 擁有最大的生態系統，儘管 Kotlin Multiplatform 和 Flutter 正在迅速擴張。</p></li>
        <li><p>長期支援——JavaScript 擁有最大的生態系統，而 Kotlin Multiplatform 和 Flutter 分別在 JetBrains 和 Google 的強力支持下迅速演進。</p></li>
    </list>
    <p>
        <control>Q：是否可以使用單一語言在多個平台上重複使用程式碼？</control>
    </p>
    <p>A：是的。例如，Kotlin Multiplatform 可以在 Android、iOS、桌面、Web 和伺服器之間共用程式碼，同時保留原生開發的優勢。透過 Compose Multiplatform，您還可以在多個平台之間共用 UI 程式碼，以實現最大的程式碼重用。某些與平台相關的功能（如硬體存取、系統 API 或深層作業系統整合）可能仍需要原生實作或自訂的 expect/actual 模組。</p>
    </chapter>
</topic>