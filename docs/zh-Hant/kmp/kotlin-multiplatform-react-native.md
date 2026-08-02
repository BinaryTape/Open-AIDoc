<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="kotlin-multiplatform-react-native"
       title="Kotlin Multiplatform vs. React Native：跨平台比較">
    <web-summary>探索結合 Compose Multiplatform 的 Kotlin Multiplatform 與 React Native 在程式碼共用、生態系統和 UI 渲染方面的比較 —— 並了解哪種工具堆疊最適合您的團隊。
    </web-summary>
    <tip>
        <p>這篇比較文章強調，Kotlin Multiplatform 在 Android 和 iOS 上提供真正的原生體驗，並能完全存取平台 API，表現非常出色。
            KMP 對於專注於效能、可維護性以及原生外觀與感受的團隊特別有吸引力，尤其是在使用 Compose Multiplatform 共用 UI 程式碼時。
            同時，React Native 可能適合擁有 JavaScript 專業知識的團隊，特別是對於快速原型設計。</p>
    </tip>
    <p>跨平台開發已顯著改變了團隊建置應用程式的方式，使他們能夠從共用的程式碼庫為多個平台交付應用程式。這種方法簡化了開發流程，並有助於確保跨裝置的一致使用者體驗。</p>
    <p>之前，為 Android 和 iOS 進行建置意指需要維護兩個獨立的程式碼庫（通常由不同的團隊負責），這導致了重複的工作以及平台之間的明顯差異。跨平台解決方案加快了上市時間並提高了整體效率。</p>
    <p>在現有的工具中，Kotlin Multiplatform、React Native 和 Flutter 是採用最廣泛的三個選項。在本文中，我們將深入探討這兩者，以幫助您為產品和團隊選擇合適的方案。</p>
    <chapter title="Kotlin Multiplatform 與 Compose Multiplatform" id="kotlin-multiplatform-and-compose-multiplatform">
        <p><a href="https://www.jetbrains.com/kotlin-multiplatform/">Kotlin Multiplatform (KMP)</a> 是一項由 JetBrains 開發的開源技術，支援在 Android、iOS、桌面 (Windows、macOS、Linux)、Web 和後端之間共用程式碼。它允許開發人員在多個環境中重複使用 Kotlin，同時保持原生能力和效能。</p>
        <p>採用率正在穩定上升：在過去兩次的 <a href="https://www.jetbrains.com/lp/devecosystem-2024/">開發者生態系統調查</a> 中，Kotlin Multiplatform 的使用率在一年內翻了一倍多 —— 從 2024 年的 7% 增加到 2025 年的 18% —— 這是其發展勢頭日益強勁的明顯標誌。</p>
        <img src="kmp-growth-deveco.svg"
             alt="在過去兩次的開發者生態系統調查中，KMP 的使用率從 2024 年s的 7% 增加到 2025 年的 18%"
             width="700"/>
        <p><a href="https://www.jetbrains.com/kotlin-multiplatform/"><img src="discover-kmp.svg"
                                                                          alt="探索 Kotlin Multiplatform"
                                                                          style="block"
                                                                          width="500"/></a></p>
        <p>透過 KMP，您可以選擇您的共用策略：從共用除應用程式進入點之外的所有程式碼，到共用單一邏輯片段 (例如網路或資料庫模組)，或是共用商業邏輯同時保持 UI 原生。</p>
        <p>若要跨平台共用 UI 程式碼，您可以使用 <a
                href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/">Compose Multiplatform</a>
            —— 這是 JetBrains 基於 Kotlin Multiplatform 和 Google 的 Jetpack Compose 建置的現代宣告式架構。它在 <a href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/?_gl=1*dcswc7*_gcl_au*MTE5NzY3MzgyLjE3NDk3MDk0NjI.*FPAU*MTE5NzY3MzgyLjE3NDk3MDk0NjI.*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NTA2NzU0MzQkbzM2JGcxJHQxNzUwNjc1NjEwJGo2MCRsMCRoMA..">iOS</a>、Android 和桌面平台上已達穩定階段，Web 支援目前處於 Beta 階段。</p>
        <p><a href="https://www.jetbrains.com/compose-multiplatform/"><img src="explore-compose.svg"
                                                                           alt="探索 Compose Multiplatform"
                                                                           style="block"
                                                                           width="500"/></a></p>
        <p>Kotlin Multiplatform 最初在 Kotlin 1.2 (2017) 中推出，並於 2023 年 11 月達到 <a
                href="https://blog.jetbrains.com/kotlin/2023/11/kotlin-multiplatform-stable/">穩定狀態</a>。在 Google I/O 2024 上，Google 宣布 <a
                    href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">正式支援使用 Kotlin Multiplatform</a> 在 Android 和 iOS 之間共用商業邏輯。
        </p>
    </chapter>
    <chapter title="React Native" id="react-native">
        <p>React Native 是一個開源架構，用於使用 <a
                href="https://reactjs.org/">React</a> (一個用於 Web 和原生使用者介面的程式庫) 和應用程式平台的原生能力來建置 Android 和 iOS 應用程式。React Native 允許開發人員使用 JavaScript 存取其平台的 API，並使用 React 組建 (可重複使用、可嵌套程式碼的組合) 來描述 UI 的外觀和行為。</p>
        <p>React Native 於 2015 年 1 月在 React.js Conf 上首次發表。同年晚些時候，Meta 在 F8 2015 上發佈了 React Native，並自此一直維護至今。</p>
        <p>雖然 Meta 負責監督 React Native 產品，但 <a
                href="https://github.com/facebook/react-native/blob/HEAD/ECOSYSTEM.md">React Native 生態系統</a>
            由合作夥伴、核心貢獻者和活躍的社群組成。如今，該架構由全球各地的個人和公司貢獻支援。</p>
    </chapter>
    <chapter title="Kotlin Multiplatform vs. React Native：並列比較"
             id="kotlin-multiplatform-vs-react-native-side-by-side-comparison">
        <table style="both">
            <tr>
                <td></td>
                <td><b>Kotlin Multiplatform</b></td>
                <td><b>React Native</b></td>
            </tr>
            <tr>
                <td><b>建立者</b></td>
                <td>JetBrains</td>
                <td>Meta</td>
            </tr>
            <tr>
                <td><b>語言</b></td>
                <td>Kotlin</td>
                <td>JavaScript, TypeScript</td>
            </tr>
            <tr>
                <td><b>彈性與程式碼重複使用</b></td>
                <td>共用您想要的程式碼庫的任何部分，包括商業邏輯和/或 UI，比例從 1% 到 100%。您可以逐步採用它，或從頭開始使用它來建置跨平台的原生感應用程式。
                </td>
                <td>跨平台重複使用商業邏輯和 UI 組建，從單一功能到完整的應用程式。將 React Native 新增到現有的原生應用程式中，以建置新的畫面或使用者流程。
                </td>
            </tr>
            <tr>
                <td><b>軟件包、相依性與生態系統</b></td>
                <td>軟件包可從 <a href="https://central.sonatype.com/">Maven Central</a> 和其他存儲庫獲取，包括
                    <p><a href="https://klibs.io">klibs.io</a>，旨在簡化 KMP 程式庫的搜尋。</p>
                    <p>此 <a href="https://github.com/terrakok/kmp-awesome">清單</a> 包含一些最受歡迎的 KMP 程式庫和工具。</p></td>
                <td><a href="https://reactnative.dev/docs/libraries">React Native 程式庫</a> 通常使用 Node.js 封裝管理員 (例如 <a href="https://docs.npmjs.com/cli/npm">npm CLI</a> 或 <a href="https://classic.yarnpkg.com/en/">Yarn Classic</a>) 從 <a href="https://www.npmjs.com/">npm 註冊表</a> 安裝。
                </td>
            </tr>
            <tr>
                <td><b>建置工具</b></td>
                <td>Gradle (加上用於針對 Apple 裝置之應用程式的 Xcode)。</td>
                <td>React Native 命令列工具和 <a href="https://metrobundler.dev/">Metro bundler</a>，它們在底層呼叫針對 Android 的 Gradle 和針對 iOS 的 Xcode 建置系統。
                </td>
            </tr>
            <tr>
                <td><b>目標環境</b></td>
                <td>Android、iOS、Web、桌面和伺服器端。</td>
                <td>Android、iOS、Web 和桌面。
                    <p>對 Web 和桌面的支援是透過社群和合作夥伴主導的專案提供的，例如 <a
                            href="https://github.com/necolas/react-native-web">React Native Web</a>、<a
                            href="https://github.com/microsoft/react-native-windows">React Native Windows</a> 和 <a
                            href="https://github.com/microsoft/react-native-macos">React Native macOS</a>。</p></td>
            </tr>
            <tr>
                <td><b>編譯</b></td>
                <td>為桌面和 Android 編譯為 JVM 位元組碼，為 Web 編譯為 JavaScript 或 Wasm，並為原生平台編譯為平台特定的二進制檔。
                </td>
                <td>React Native 使用 Metro 來建置 JavaScript 程式碼和資源。
                    <p>React Native 隨附內建版本的 <a
                            href="https://reactnative.dev/docs/hermes">Hermes</a>，它會在組建期間將 JavaScript 編譯為 Hermes 位元組碼。React Native 還支援使用 JavaScriptCore 作為 <a
                                href="https://reactnative.dev/docs/javascript-environment">JavaScript 引擎</a>。</p>
                    <p>原生程式碼在 Android 上由 Gradle 編譯，在 iOS 上由 Xcode 編譯。</p></td>
            </tr>
            <tr>
                <td><b>與原生 API 的通訊</b></td>
                <td>得益於 Kotlin 與 Swift/Objective-C 和 JavaScript 的互通性，可以直接從 Kotlin 程式碼存取原生 API。
                </td>
                <td>React Native 公開了一組 API，用於將您的原生程式碼連接到您的 JavaScript 應用程式程式碼：Native Modules 和 Native Components。新架構使用 <a
                            href="https://github.com/reactwg/react-native-new-architecture/blob/main/docs/turbo-modules.md">Turbo Native Module</a> 和 <a
                            href="https://github.com/reactwg/react-native-new-architecture/blob/main/docs/fabric-native-components.md">Fabric Native Components</a> 來實現類似的結果。
                </td>
            </tr>
            <tr>
                <td><b>UI 渲染</b></td>
                <td><a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> 可用於跨平台共用 UI，其基於 Google 的 Jetpack Compose，使用與 OpenGL、ANGLE (將 OpenGL ES 2 或 3 呼叫轉換為原生 API)、Vulkan 和 Metal 相容的 Skia 引擎。
                </td>
                <td>React Native 包含一組核心的平台無關原生組建，例如 <code>View</code>、<code>Text</code> 和 <code>Image</code>，它們直接對應到平台的原生 UI 建置塊，例如 iOS 上的 <code>UIView</code> 和 Android 上的 <code>android.view</code>。
                </td>
            </tr>
            <tr>
                <td><b>UI 開發迭代</b></td>
                <td>即便是從通用程式碼中也可以預覽 UI。
                    <p>透過 <a href="compose-hot-reload.md">Compose Hot Reload</a>，您可以立即查看 UI 變更，而無需重新啟動應用程式或遺失其狀態。</p></td>
                <td><a href="https://reactnative.dev/docs/fast-refresh">Fast Refresh</a> 是 React Native 的一項功能，可讓您針對 React 組建中的變更獲得近乎即時的回饋。
                </td>
            </tr>
            <tr>
                <td><b>使用該技術的公司</b></td>
                <td>
                    <a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>,
                    <a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>, <a
                        href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald's</a>,
                    <a href="https://youtu.be/5lkZj4v4-ks?si=DoW00DU7CYkaMmKc">Google Workspace</a>, <a
                        href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>, <a
                        href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>,
                    <a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>, <a
                        href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>, <a
                        href="https://touchlab.co/">TouchLab</a>, <a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a>,
                    以及更多列於我們的 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 案例研究中。</a></td>
                <td>Facebook, <a href="https://engineering.fb.com/2024/10/02/android/react-at-meta-connect-2024/">Instagram</a>,
                    <a href="https://devblogs.microsoft.com/react-native/">Microsoft Office</a>, <a
                            href="https://devblogs.microsoft.com/react-native/">Microsoft Outlook</a>, Amazon Shopping,
                    <a href="https://medium.com/mercari-engineering/why-we-decided-to-rewrite-our-ios-android-apps-from-scratch-in-react-native-9f1737558299">Mercari</a>,
                    Tableau, <a href="https://github.com/wordpress-mobile/gutenberg-mobile">WordPress</a>, <a
                            href="https://nearform.com/work/puma-scaling-across-the-globe/">Puma</a>, PlayStation
                    App，以及更多列於 <a href="https://reactnative.dev/showcase">React Native 展示區</a>。
                </td>
            </tr>
        </table>
        <p>您也可以查看 <a href="kotlin-multiplatform-flutter.md">Kotlin Multiplatform 與 Flutter</a> 的比較。</p>
    </chapter>
    <chapter title="為您的專案選擇合適的跨平台技術"
             id="choosing-the-right-cross-platform-technology-for-your-project">
        <p>決定跨平台架構並不是要尋找一個通用的解決方案 —— 而是要為您的專案目標、技術需求和團隊專業知識選擇最合適的方案。無論您是建置具有複雜 UI 的功能豐富產品，還是旨在利用現有技能快速發佈，正確的選擇都將取決於您的具體優先事項。請考慮您對 UI 自定義需要多少控制權、長期穩定性的重要性，以及您計畫支援哪些平台。</p>
        <p>經驗豐富的 JavaScript 團隊可能會發現 React Native 是一個切實的選擇，尤其是對於快速原型設計。另一方面，Kotlin Multiplatform 提供不同層級的整合：它產生完全原生的 Android 應用程式，並在 iOS 上編譯為原生二進制檔，且能無縫存取原生 API。UI 可以是完全原生的，也可以透過 Compose Multiplatform 共用，並使用高效能繪圖引擎進行精美的渲染。這使得 KMP 對於優先考慮原生外觀與感受、可維護性和效能，同時仍受益於程式碼共用的團隊特別有吸引力。</p>
        <p>您可以在我們關於如何為下一個專案選擇合適的 <a
                href="cross-platform-frameworks.topic">跨平台開發架構</a> 的詳細文章中找到更多指南。</p>
    </chapter>
    <chapter title="常見問題" id="frequently-asked-questions">
        <p>
            <control>問：Kotlin Multiplatform 是否已生產就緒？</control>
        </p>
        <p>答：Kotlin Multiplatform 是一項穩定技術，已準備好用於生產。這意指即使在最保守的使用情境下，您也可以使用 Kotlin Multiplatform 在 Android、iOS、桌面 (JVM)、伺服器端 (JVM) 和 Web 之間共用程式碼。</p>
        <p>Compose Multiplatform 是一個用於建置跨平台共用 UI 的架構 (由 Kotlin Multiplatform 和 Google 的 Jetpack Compose 驅動)，在 iOS、Android 和桌面平台上已達穩定階段。Web 支援目前處於 Beta 階段。</p>
        <p>如果您想進一步了解 Kotlin Multiplatform 的總體方向，請參閱我們的部落格文章：<a href="https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/">Kotlin Multiplatform 和 Compose Multiplatform 的後續發展</a>。</p>
        <p>
            <control>問：Kotlin Multiplatform 是否優於 React Native？</control>
        </p>
        <p>答：Kotlin Multiplatform 和 React Native 各有優勢，選擇取決於您專案的特定目標、技術需求和團隊專業知識。在上面的比較中，我們概述了在程式碼共用、建置工具、編譯和生態系統等方面的關鍵差異，以幫助您決定哪種方案最適合您的使用案例。</p>
        <p>
            <control>問：Google 是否支援 Kotlin Multiplatform？</control>
        </p>
        <p>答：在 Google I/O 2024 上，Google 宣布 <a
                href="https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html">正式支援在 Android 上使用 Kotlin Multiplatform</a>，以便在 Android 和 iOS 之間共用商業邏輯。</p>
        <p>
            <control>問：Kotlin Multiplatform 值得學習嗎？</control>
        </p>
        <p>答：如果您有興趣在 Android、iOS、桌面和 Web 之間共用程式碼，同時保持原生效能和彈性，那麼 Kotlin Multiplatform 非常值得學習。它由 JetBrains 支援，且 Google 官方支援在 Android 上使用它來共用 Android 和 iOS 之間的商業邏輯。此外，結合 Compose Multiplatform 的 KMP 正被越來越多建置多平台應用程式的公司在生產環境中採用。
        </p>
    </chapter>
</topic>