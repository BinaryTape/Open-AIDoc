<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="kmp-for-ios" title="Kotlin Multiplatform for iOS：關於整合、效能與工作流程的迷思">
    <show-structure for="chapter,procedure" depth="1"/>
    <web-summary>Kotlin Multiplatform 適用於 iOS 嗎？了解它如何與 Swift 整合、對效能的影響，以及如何融入真實的 iOS 開發工作流程。</web-summary>
    <p>如果你已經花了多年時間開發 iOS 應用程式，你可能會想：使用 Kotlin Multiplatform 會影響效能嗎？我是否要放棄 Swift 的強大與優雅？開發人員體驗會像二等公民的權宜之計嗎？
        這些是大多數資深 iOS 工程師在考慮使用 KMP 時會提出的問題。</p>
    <p>這篇文章根據實際使用情況，解析了 iOS 開發人員對 Kotlin Multiplatform 最常見的疑慮，讓你實務地了解 Kotlin Multiplatform 的 iOS 開發究竟是什麼感覺。</p>
    <chapter title="Kotlin Multiplatform 對 iOS 開發人員的意義" id="what-kotlin-multiplatform-means-for-ios-developers">
        <p>Kotlin Multiplatform 是一項技術，允許你根據實際需求分享多寡不一的程式碼——從單一模組到大部分的商務邏輯，甚至在適當的時候，可以使用 <a href="https://kotlinlang.org/compose-multiplatform/">Compose Multiplatform</a> 來分享 UI。</p>
        <p>它並非試圖取代原生開發。相反地，KMP 讓你在跨平台分享程式碼的同時，仍能完全掌控哪些部分保持原生。</p>
        <p>在最高層面上，KMP 讓團隊能夠：</p>
        <list>
            <li>無縫分享商務邏輯。</li>
            <li>讓 Kotlin 程式碼可以從 Swift 中呼叫。</li>
            <li>在 Kotlin 程式碼中使用完整的 iOS API 功能。</li>
            <li>使用 Compose Multiplatform 建立可嵌入 SwiftUI 的畫面，或用 Kotlin 建置整個使用者介面。</li>
            <li>直接從你的 Kotlin 程式碼中使用 MapKit 或 AVFoundation 等平台特定架構。</li>
        </list>
        <p><a as="button" href="https://kotlinlang.org/multiplatform/" mode="rock" icon="arrow-right" icon-position="right">探索 Kotlin Multiplatform</a></p>
        <chapter title="KMP 僅僅是另一個跨平台抽象層嗎？" id="is-kmp-merely-another-cross-platform-abstraction-layer">
            <p>並非如此——KMP 不會取代 SwiftUI 或 UIKit。相反地，它是原生開發的補充。</p>
            <p>在實務上，這意味著你可以：</p>
            <list>
                <li>在 SwiftUI 或 UIKit 中建立 UI，利用原生 Swift 程式碼。</li>
                <li>直接存取 iOS API，無需包裝函式（wrapper）或間接層。</li>
                <li>在能發揮價值的地方整合共享程式碼，而非預設在所有地方都使用。</li>
            </list>
        </chapter>
        <chapter id="is-kmp-useful-for-ios-developers" title="KMP 對 iOS 開發人員真的有用嗎？">
            <p>雖然 KMP 是 Kotlin 生態系統的一部分，但它並不局限於 Android——它是一種在平台間共享功能的通用方法，iOS 團隊可以根據自己的條件來使用它。</p>
            <p>對於面臨邏輯重複、各平台行為不一致以及維護成本不斷上升的團隊來說，它特別有用。使用共享層可以消除重複，同時保持完整的原生控制。</p>
            <p>核心原則很簡單：</p>
            <list>
                <li>分享有意義的部分，例如商務邏輯、資料和網路。</li>
                <li>將需要的部分保持原生，例如平台特定功能，並針對每個專案選擇 UI 是要共享還是原生。</li>
                <li>根據需要隨時間調整平衡。</li>
            </list>
        </chapter>
        <p>Kotlin Multiplatform 並非以 Android 為中心的解決方案；它是一項多功能的技術，可協助開發團隊提高一致性，同時又不失原生體驗。</p>
        <p>圍繞 KMP 常有一些關於效能、複雜性和喪失原生控制權的迷思，但這些迷思並未準確反映其在實務中的運作方式。讓我們用基於經驗的答案來一一解析。</p>
    </chapter>
    <chapter title="迷思：跨平台架構會損害 iOS 的效能與體驗" id="myth-cross-platform-frameworks-compromise-ios-performance-and-experience">
        <p>一個常見的擔憂是 Kotlin Multiplatform 會損害 iOS 應用程式的效能或體驗。這種假設通常是基於先前使用過橋接（bridge）或專有執行時（runtime）之架構（如 React Native）的經驗。</p>
        <p>KMP 的運作方式不同。它使用 LLVM（與 Swift 相同的工具鏈系列）為 iOS 產生共享程式碼。沒有 JavaScript 橋接，沒有整合的執行時層，你的程式碼與 iOS 之間也沒有抽象層。這意味著你的應用程式將繼續以完全原生的二進位檔案運作，效能特性與典型的 iOS 開發一致。</p>
    </chapter>
    <chapter title="迷思：Kotlin Multiplatform 是一項小眾或有風險的技術" id="myth-kotlin-multiplatform-is-a-niche-or-risky-technology">
        <p>你可能仍會將 Kotlin Multiplatform 與其早期的實驗階段聯想在一起。然而，Kotlin Multiplatform 已於 2023 年 11 月正式達到穩定（Stable）狀態，並已在所有支援的平台上準備好投入生產。KMP <a href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios">已被</a>許多知名公司用於真實的大規模 iOS 應用程式中，例如 <a href="https://youtu.be/5lkZj4v4-ks?si=OHg0v60urRqxuZZi">Google</a>、<a href="https://2025.kotlinconf.com/talks/812400/">Duolingo</a>、<a href="https://medium.com/booking-com-development/kotlin-multiplatform-in-production-two-real-world-use-cases-from-booking-com-46ffe13a773d">Booking.com</a>、<a href="https://youtu.be/VVf6txPZk3Y?si=6PVoeS8Pa0-QHUsT">Sony</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a> 以及 <a href="https://www.youtube.com/watch?v=HSIhkB5bGJs">McDonald's</a>。</p>
        <p>生態系統也持續成熟：適用於 iOS 的 Compose Multiplatform 於 2025 年達到穩定狀態，使得除了共享商務邏輯外，建置生產就緒的共享 UI 成為可能。根據 2025 年 Kotlin Multiplatform 調查，KMP 現在被視為生產可行，約 70% 的外掛程式使用者感到滿意或非常滿意，且約 80% 的使用者正在使用 Compose Multiplatform。</p>
        <p><a as="button" href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios" mode="rock" icon="arrow-right" icon-position="right">探索真實的 KMP 使用案例</a></p>
        <p>KMP 由 Kotlin 的開發者 JetBrains 支援。它不是一個業餘專案，而是一項策略性投資，將透過強大的工具支援、定期更新和不斷增長的生態系統支援持續演進。</p>
        <chapter title="那麼，採用 KMP 安全嗎？" id="is-it-safe-to-adopt-kmp">
            <p>KMP 已經在金融科技、電子商務和行動服務等多個行業，以及醫療保健、媒體與娛樂、旅遊和物流等領域經過生產環境的實戰測試。它正被積極維護和升級。最重要的是，它支援漸進式採用，從而降低風險。</p>
            <p>最關鍵的是：</p>
            <list>
                <li>你永遠不會被綁死，可以隨時擴大或縮小使用規模。</li>
                <li>即使你停止使用共享程式碼，你的 iOS 應用程式仍保持完全原生。</li>
            </list>
            <p>Kotlin Multiplatform 是一個成熟且生產就緒的解決方案，開發團隊目前正使用它來應對現實世界的跨平台挑戰，而無需冒整個架構的風險。</p>
        </chapter>
    </chapter>
    <chapter title="迷思：Kotlin Multiplatform 僅適用於 Android 開發人員" id="myth-kotlin-multiplatform-is-only-for-android-developers">
        <p>Kotlin Multiplatform 常被認為是「Android 優先」，iOS 開發人員只是陪跑。</p>
        <p>Kotlin 是一種通用語言，KMP 中的共享程式碼只是程式碼庫的另一個面向，並非由單一平台擁有。iOS 開發人員可以閱讀並貢獻程式碼、塑造 API 並影響跨平台設計。</p>
        <p>在實務上，團隊採用不同的模式。許多 iOS 開發人員繼續主要在 Swift 中工作，特別是在 UI 密集的特性上，而共享商務邏輯則由工程師協作開發或由專注於跨平台程式碼的人員開發。</p>
        <p>這帶來了更好的協作：團隊共同擁有邏輯的所有權，減少不一致性，並只需修復一次問題，而不是重複勞動。</p>
        <chapter title="身為 iOS 開發人員，你會被邊緣化嗎？" id="will-you-be-sidelined-as-an-ios-developer">
            <p>KMP 不會降級 iOS 工程師；它將他們的角色擴展到共享層，讓他們在那裡擁有同等的影響力，同時保持對原生體驗的所有權。如果你願意，iOS UI 可以保持原生，Swift 仍然至關重要，iOS 開發人員保留對平台決策的控制權。</p>
        </chapter>
    </chapter>
    <chapter title="迷思：我的 iOS 工作流程會變得更複雜" id="myth-my-ios-workflow-will-become-more-complicated">
        <p>關於 KMP 的主要擔憂之一是它可能會干擾已建立的 iOS 工作流程。如果你已經經歷過 Objective-C → Swift → SwiftUI 以及不斷變化的工具鏈轉變，增加「另一件事」的想法可能會讓人感到精疲力竭。這種擔憂是合理的，這也是為什麼 Kotlin Multiplatform 設計為漸進式採用而非一次性到位。</p>
        <p>你不需要在一夜之間接受全新的工具鏈。對於許多 iOS 開發人員來說，KMP 可以從僅取用共享模組開始。這意味著當你評估其有用性時，你的日常工作流程可以保持相對不受影響。</p>
        <p>隨著深入使用，學習曲線是漸進的——而非全有或全無：</p>
        <list>
            <li>從使用共享的 Kotlin API 開始。</li>
            <li>了解足夠的 Kotlin 以便閱讀共享程式碼並進行偵錯。</li>
            <li>在合適的時候為共享邏輯做出貢獻。</li>
        </list>
        <chapter title="採用 KMP 會讓你速度變慢嗎？" id="will-adopting-kmp-slow-you-down">
            <p>理解配置時會有一些初始開銷。但使用共享邏輯並避免平行實作可以節省時間，而且工具比你想像的更輕量：</p>
            <list>
                <li>無需更換 Xcode 作為你的主要環境。</li>
                <li>沒有強制遷移到外國 UI 架構的需求。</li>
                <li>組建序列的複雜性通常在你的主要 iOS 工作流程之外進行管理。</li>
            </list>
            <p>你可以繼續以一貫的方式建立 iOS 應用程式。KMP 只是為其增加了一個共享層，在不要求全面重置的情況下為你提供額外的自由度。</p>
        </chapter>
    </chapter>
    <chapter title="迷思：Kotlin Multiplatform 產生的 Swift API 不符合慣用法" id="myth-kotlin-multiplatform-produces-non-idiomatic-swift-apis">
        <p>Kotlin Multiplatform 的 Swift 互通性仍是一個相關的擔憂。目前，Kotlin 程式碼透過 Objective-C 橋接呈現給 iOS，這可能使 Swift API 感覺不那麼自然，特別是在命名、可 null 性、泛型或非同步模式方面。</p>
        <p>是的，如果管理不當，它感覺確實不像 Swift。然而，當開發共享程式碼時考慮到 iOS，建置良好的 Swift API 是可能的。以下是一些最佳實務：</p>
        <list>
            <li>保持 API 簡單且具備意圖。</li>
            <li>避免無法正確轉換的 Kotlin 模式。</li>
            <li>根據需要加入薄薄的 Swift 包裝函式。</li>
            <li>直接在 Xcode 中驗證 API。</li>
        </list>
        <p>你也可以觀看演講錄製：「<a href="https://youtu.be/P_5ZEtK05kc?si=qgnAPV5_MwAEn0RJ">Kotlin Multiplatform 煉金術：將你的 Swift 互通性點石成金</a>」。</p>
        <p>Kotlin 的新工具——特別是 <a href="https://kotlinlang.org/docs/native-swift-export.html">Swift Export</a>——正邁向一個未來，讓 Kotlin API 能更直接且符合慣用法地與 Swift 整合，進一步減少摩擦。</p>
        <p>Swift Export 旨在移除 Objective-C 層，而 <a href="https://github.com/kotlin-hands-on/kotlin-swift-interopedia">Interopedia</a> 則作為實務文件，幫助開發人員理解 Kotlin 程式碼如何暴露給 Swift，以及預期會看到哪些模式。像是 <a href="https://github.com/rickclephas/KMP-NativeCoroutines">KMP-NativeCoroutines</a> 和 <a href="https://github.com/touchlab/SKIE">SKIE</a> 等程式庫更進一步修補了目前互通模型中的不足，改善了協同程式與 Swift async/await 的對應，並使產生的 API 對 Swift 更加友善。</p>
    </chapter>
    <chapter title="迷思：共享 UI 意味著失去原生 iOS 體驗" id="myth-sharing-ui-means-losing-native-ios-experience">
        <p>一種普遍的誤解是使用 Kotlin Multiplatform 需要放棄完全原生的 iOS UI。事實並非如此。</p>
        <p>KMP 根本不要求共享 UI。你可以只共享底層功能，並保持其餘部分原生：</p>
        <list>
            <li>UI 可以使用 SwiftUI 或 UIKit 編寫，利用原生 Swift 程式碼。</li>
            <li>動畫與互動可以保持完全原生。</li>
            <li>平台 API 是直接存取的，不需要包裝函式。</li>
        </list>
    </chapter>
        <chapter title="那麼，你的應用程式會不再感覺像 iOS 應用程式嗎？" id="so-will-your-app-no-longer-feel-like-an-ios-app">
        <p>不，因為沒有必要放棄原生 UI。</p>
        </chapter>
        <chapter title="你必須使用共享 UI 嗎？" id="do-you-have-to-use-a-shared-ui">
        <p>這個策略完全是選配的，由每個團隊自行決定。主要前提很簡單：Kotlin Multiplatform 不會限制你如何設計介面。你可以使用 SwiftUI 或 UIKit 保持完全原生的 UI，使用 Compose Multiplatform 引入共享 UI，或根據需求結合兩種方法。</p>
        <p>你最常用的畫面——如儀表板和核心產品流程——通常最好使用完全原生的 UI 來實作，在那裡你可以發揮最大的效能和平台特定的磨光。對於影響較小的區域，Compose Multiplatform 非常適合。例如設定頁面或不常使用的流程（如身份驗證）是共享 Compose UI 的理想候選者，在這些地方開發速度和程式碼重用比深度的原生優化更重要。</p>
        <p>重要的是，Compose Multiplatform 與傳統 iOS UI 之間具有互通性，這意味著你可以在原生視圖旁邊嵌入共享組件，或隨著時間推移逐漸採用。這讓團隊能夠演進其 UI 策略，而無需預先承諾單一方法。</p>
        </chapter>
    <p><a as="button" href="https://kotlinlang.org/compose-multiplatform/" mode="rock" icon="arrow-right" icon-position="right">探索 Compose Multiplatform</a>
        </p>
    <chapter title="迷思：採用 Kotlin Multiplatform 意味著不再使用 Swift" id="myth-adopting-kotlin-multiplatform-means-no-more-swift">
        <p>一個常見的恐懼是引入 Kotlin Multiplatform 會讓 Swift 變得過時。但 KMP 並不是要取代它——Swift 對於 iOS 開發仍然至關重要。</p>
        <p>你繼續為所有讓 iOS 應用程式感覺像 iOS 的部分編寫 Swift：</p>
        <list>
            <li>使用 SwiftUI 或 UIKit 的 UI。</li>
            <li>導覽、動畫和使用者互動。</li>
            <li>平台特定功能與整合。</li>
            <li>應用程式生命週期與系統 API。</li>
        </list>
        <p>KMP 只是在旁邊增加了一個共享層。這意味著 iOS 開發人員繼續擁有原生體驗，共享商務邏輯通常是跨平台的共同努力，一些 iOS 工程師會貢獻 Kotlin 程式碼，而其他人則主要專注於 Swift。</p>
        <chapter title="那麼，你會停止編寫 Swift 嗎？" id="will-you-stop-writing-swift">
        <p>不，你大部分的時間仍會花在 Swift 上。而且隨著你獲得跨平台邏輯的新洞察並影響共享架構決策，你的角色將會擴展。</p>
    </chapter>
    </chapter>
    <chapter title="現有專案中的 Kotlin Multiplatform iOS 整合" id="kotlin-multiplatform-ios-integration-in-an-existing-project">
        <p>在現有應用程式中進行 Kotlin Multiplatform iOS 整合的最佳方式是從小規模開始。你不需要重新發明應用程式、重構所有內容，或在第一天就承諾採用完整的跨平台方法。</p>
        <p>實際上，共享模組通常以以下形式提供給 iOS：</p>
        <list>
            <li>從通用程式碼建立的架構（framework）。</li>
            <li>用於在組建目標間部署的 XCFramework。</li>
            <li>根據團隊的工作流程，可能會使用 Swift Package Manager 整合相依性，或使用自訂設定。</li>
        </list>
        <p>關鍵點在於整合並非天生具有侵入性。你不是在替換應用程式的架構、UI 層或現有的 Swift 程式碼。你正在建立一個共享模組，讓你的 iOS 程式碼可以在任何有意義的地方使用。</p>
        <p>這就是為什麼一個實際的起點通常是一個小型、低風險的區域，例如：</p>
        <list>
            <li>資料模型</li>
            <li>驗證邏輯</li>
            <li>網路</li>
            <li>單一特性模組</li>
        </list>
        <p>這讓團隊能在保留原始 iOS 體驗的同時，觀察 KMP 如何融入程式碼庫。大多數團隊選擇漸進式採用：他們引入通用程式碼來解決特定問題，然後僅在效益確實存在時才擴展。這使得所有權易於維護。</p>
        <chapter title="如何安全地開始使用 KMP？" id="how-do-you-start-safely-with-kmp">
            <p>選擇一個孤立的問題，限制範圍，並將 KMP 視為專案的增量補充而非重置。</p>
        </chapter>
    </chapter>
    <p>
        <a as="button" href="get-started.topic" mode="rock" icon="arrow-right" icon-position="right">開始使用 Kotlin Multiplatform</a>
        </p>
    <chapter title="何時使用 Kotlin Multiplatform 有意義（以及何時沒有）" id="when-kotlin-multiplatform-makes-sense-and-when-it-doesnt">
        <p>當 iOS 和 Android 邏輯之間存在重疊，且這種重複開始造成困擾時，使用 Kotlin Multiplatform 就很有意義。對於希望在分享跨平台商務規則、網路、資料處理或領域邏輯的同時，保持原生 iOS 體驗的團隊來說，它特別有價值。</p>
        <p>KMP 通常在以下情況是<b>絕佳選擇</b>：</p>
        <list>
            <li>iOS 和 Android 應用程式使用相同的底層產品邏輯。</li>
            <li>團隊需要修復兩次同樣的錯誤。</li>
            <li>平台行為持續發生不同步的情況。</li>
        </list>
        <p>在以下情況可能<b>不太適合</b>：</p>
        <list>
            <li>應用程式高度依賴平台特性。</li>
            <li>大部分的複雜性存在於 UI 層。</li>
            <li>邏輯不足以支撐額外的設定與協調成本。</li>
        </list>
    </chapter>
    <chapter title="結論" id="conclusion">
        <p>使用 KMP，你減少了重複，同時增加了一個需要維護的共享層。你在實現一致性的同時引入了跨團隊協調，並保持原生 UI，但接受了一些互通性和工具的複雜性。</p>
        <p>當共享程式碼能提供明確價值時——無論是小型、集中的邏輯片段還是較大的領域層——且不過度介入那些更適合由平台處理的領域，Kotlin Multiplatform 的效果最佳。</p>
    </chapter>
    <chapter title="常見問題" id="frequently-asked-questions">
        <deflist >
            <def title="實際上 Android 和 iOS 之間可以共享多少程式碼？">
                沒有固定的百分比；大多數團隊會分享商務邏輯、網路和資料層。確切的數量取決於你的應用程式以及平台間的重疊程度。在某些情況下，團隊也會選擇使用 Compose Multiplatform 分享部分 UI——同時仍能在 iOS 上實現原生外觀，或將其與 SwiftUI 或 UIKit 無縫結合。
            </def>
            <def title="Kotlin Multiplatform 會影響 iOS 應用程式的效能嗎？">
                沒有本質上的影響。共享程式碼是原生編譯的，因此效能與典型的 iOS 程式碼相當——問題僅源於程式碼的編寫方式，而非來自 KMP 本身。
            </def>
        </deflist>
        <p><b>實際上 Android 和 iOS 之間可以共享多少程式碼？</b></p>
        <p>沒有固定的百分比；大多數團隊會分享商務邏輯、網路和資料層。確切的數量取決於你的應用程式以及平台間的重疊程度。帶有 Compose Multiplatform 的 Kotlin Multiplatform 允許你共享多達 100% 的應用程式程式碼（包括 UI），同時仍能與原生 API 整合。</p>
        <p><b>Kotlin Multiplatform 會影響 iOS 應用程式的效能嗎？</b></p>
        <p>沒有本質上的影響。共享程式碼是原生編譯的，因此效能與典型的 iOS 程式碼相當。</p>
        <p><b>Kotlin Multiplatform 如何與 Swift 協作？</b></p>
        <p>共享的 Kotlin 程式碼會被轉化為 Swift 可以使用的原生架構。在目前的模型中，互通性依賴於 Objective-C 橋接，這可能會引入一些摩擦。展望未來，這正在演進：JetBrains 的 Swift Export 旨在完全移除 Objective-C 層，實現與 Swift 更直接、更符合慣用法的整合。</p>
        <p><b>iOS 開發人員需要學習 Kotlin 才能使用 KMP 嗎？</b></p>
        <p>不一定。你可以先從取用共享的 Kotlin 程式碼開始，然後根據偵錯或貢獻的需求逐漸學習 Kotlin。</p>
        <p><b>我必須使用 Kotlin Multiplatform 分享 UI 嗎？</b></p>
        <p>不，UI 分享是選配的。許多團隊保持 iOS UI 完全原生，僅分享底層功能。但越來越多的公司選擇分享 UI 程式碼，因為其結果在 iOS 上感覺非常原生。</p>
    </chapter>
</topic>