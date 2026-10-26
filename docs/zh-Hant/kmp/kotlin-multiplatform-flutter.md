# Kotlin Multiplatform 與 Flutter：跨平台開發解決方案

<web-summary>本文將深入探討 Kotlin Multiplatform 與 Flutter，協助您了解它們的功能與優勢，並為您的跨平台專案選擇最合適的方案。</web-summary> 

在日新月異的科技世界中，開發者不斷尋求高效率的架構與工具來協助建置高品質的應用程式。然而，在眾多可行的方案中做選擇時，重要的是不要過度執著於尋找所謂「最好」的選項，因為這種思維往往不一定能為您帶來最合適的選擇。

每個專案都是獨一無二的，且擁有各自特定的需求。本文旨在協助您梳理選擇，並更深入了解 Kotlin Multiplatform 或 Flutter 等技術何者最符合您的專案，以便您能做出明智的決策。

## 跨平台開發：打造現代應用程式的統一途徑 {id="cross-platform-development-a-unified-approach-to-modern-application-building"}

跨平台開發提供了一種透過單一程式碼庫建置可跨多個平台執行的應用程式的方法，免去了為每個系統重寫相同功能的麻煩。雖然這項技術通常與[行動開發](cross-platform-mobile-development.topic)（同時鎖定 Android 與 iOS）聯想在一起，但其應用範圍遠遠超出了行動領域，涵蓋了 Web、桌面甚至伺服器端環境。

其核心概念是最大化程式碼重用率，同時確保在必要時仍能實作平台專屬功能，進而簡化開發流程並減少維護工作。團隊可以加快開發週期、降低成本並確保跨平台的一致性，使得跨平台開發在當今日益多樣化的應用程式版圖中成為一項明智的選擇。

## Kotlin Multiplatform 與 Flutter：簡化跨平台開發流程 {id="kotlin-multiplatform-and-flutter-streamlining-development-across-platforms"}

Flutter 與 Kotlin Multiplatform 是兩種廣受歡迎的跨平台技術，它們簡化了跨不同平台的應用程式開發。

### Flutter {id="flutter"}

[Flutter](https://flutter.dev/) 是一個開源架構，用於從單一程式碼庫建置原生編譯的多平台應用程式。它讓您能夠在 Android、iOS、Web、桌面（Windows、macOS、Linux）以及嵌入式系統上打造豐富的應用程式體驗——這一切都來自單一共享的應用程式程式碼庫。Flutter 應用程式使用 Dart 程式語言編寫。Flutter 由 Google 提供支援與採用。

Flutter 最初於 2014 年以 Sky 之名推出，其 [Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/) 於 2018 年 12 月的 Flutter Live 期間正式發表。

Flutter 開發者社群龐大且非常活躍，持續提供改進與支援。Flutter 允許使用由 Flutter 和 Dart 生態系統內開發者所貢獻的共享套件。

### Kotlin Multiplatform {id="kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) 是一項由 JetBrains 打造的開源技術，允許開發者為 Android、iOS、Web、桌面（Windows、macOS、Linux）及伺服器端建立應用程式，使他們能夠在這些平台之間高效率重用 Kotlin 程式碼，同時保有原生程式設計的優勢。

使用 Kotlin Multiplatform，您有豐富多樣的選擇：您可以共享除應用程式入口點之外的所有程式碼、共享單一邏輯片段（例如網路或資料庫模組），或者在保留原生 UI 的同時共享商業邏輯。

![Kotlin Multiplatform 是一項可重用高達 100% 程式碼的技術](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform 最初於 2017 年作為 Kotlin 1.2 的一部分推出。2023 年 11 月，Kotlin Multiplatform 正式進入穩定版。在 Google I/O 2024 期間，Google 宣布其[對 Kotlin Multiplatform 的支援](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)，用於在 Android 與 iOS 之間共享商業邏輯。

如果您想深入了解 Kotlin Multiplatform 的未來發展方向，請參閱我們的部落格文章：[Kotlin Multiplatform 和 Compose Multiplatform 的未來展望](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform {id="compose-multiplatform"}

您可以使用 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 跨多個平台編寫共享的 UI 程式碼。這是一個由 JetBrains 打造的現代宣告式架構，建構於 Kotlin Multiplatform 與 Google 的 Jetpack Compose 之上。

Compose Multiplatform 目前在 [iOS 上已達穩定版](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)，在 Android 和桌面上為穩定版，在 Web 上則處於 Beta 階段。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

我們的專門文章概述了 [Compose Multiplatform 與 Jetpack Compose 的關係](compose-multiplatform-and-jetpack-compose.md)，並強調了它們的主要差異。

### Kotlin Multiplatform 與 Flutter：概觀比較 {id="kotlin-multiplatform-and-flutter-an-overview"}

<table style="both">
    
<tr>
<td></td>
        <td><b>Kotlin Multiplatform</b></td>
        <td><b>Flutter</b></td>
</tr>

    
<tr>
<td><b>開發團隊</b></td>
        <td>JetBrains</td>
        <td>Google</td>
</tr>

    
<tr>
<td><b>程式語言</b></td>
        <td>Kotlin</td>
        <td>Dart</td>
</tr>

    
<tr>
<td><b>靈活性與程式碼重用</b></td>
        <td>隨心所欲共享程式碼庫的任何部分，包含商業邏輯和／或 UI，重用比例從 1% 到 100% 任您選擇。</td>
        <td>精準掌控應用程式的每個像素，打造高度自訂與自動適應的設計，並在所有平台上實現 100% 的程式碼共享。</td>
</tr>

    
<tr>
<td><b>套件、相依性與生態系統</b></td>
        <td>套件可從 <a href="https://central.sonatype.com/">Maven Central</a> 與其他存儲庫取得，包含：
            <p><a href="https://klibs.io">klibs.io</a>，旨在簡化 KMP 程式庫的搜尋。</p>
            <p>這份 <a href="https://github.com/terrakok/kmp-awesome">清單</a> 收錄了一些最受歡迎的 KMP 程式庫與工具。</p> </td>
        <td>套件可從 <a href="https://pub.dev/">Pub.dev</a> 取得。</td>
</tr>

    
<tr>
<td><b>建置工具</b></td>
        <td>Gradle（若目標為 Apple 裝置應用程式則加上 Xcode）。</td>
        <td>Flutter 命令列工具（底層使用 Gradle 與 Xcode）。</td>
</tr>

    
<tr>
<td><b>程式碼共享範圍</b></td>
        <td>Android、iOS、Web、桌面與伺服器端。</td>
        <td>Android、iOS、Web、桌面與嵌入式裝置。</td>
</tr>

    
<tr>
<td><b>編譯方式</b></td>
        <td>針對桌面與 Android 編譯為 JVM 位元組碼，針對 Web 編譯為 JavaScript 或 Wasm，針對原生平台編譯為平台專屬二進制檔。</td>
        <td>Debug 組建會在虛擬機中執行 Dart 程式碼。
        <p>Release 組建針對原生平台輸出平台專屬二進制檔，針對 Web 則輸出 JavaScript/Wasm。</p>
        </td>
</tr>

    
<tr>
<td><b>與原生 API 的通訊</b></td>
        <td>可使用 <Links href="multiplatform-expect-actual.md" summary="">expect/actual 宣告</Links> 直接從 Kotlin 程式碼存取原生 API。</td>
        <td>可使用 <a href="https://docs.flutter.dev/platform-integration/platform-channels">platform channels（平台通道）</a> 與主機平台進行通訊。</td>
</tr>

    
<tr>
<td><b>UI 算繪</b></td>
        <td>可使用基於 Google Jetpack Compose 的 <a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> 來跨平台共享 UI，底層採用相容於 OpenGL、ANGLE（將 OpenGL ES 2 或 3 呼叫轉換為原生 API）、Vulkan 及 Metal 的 Skia 引擎。</td>
        <td>Flutter 小工具 (Widgets) 是使用自訂的 <a href="https://docs.flutter.dev/perf/impeller">Impeller 引擎</a> 算繪在螢幕上，該引擎根據平台與裝置的不同，直接透過 Metal、Vulkan 或 OpenGL 與 GPU 通訊。</td>
</tr>

    
<tr>
<td><b>UI 開發迭代效率</b></td>
        <td>即使在共用程式碼中也可以使用 UI 預覽。
        <p>藉助 <Links href="compose-hot-reload.md" summary="">Compose Hot Reload</Links>，您可以立即看到 UI 變更，無需重啟應用程式或遺失其狀態。</p></td>
        <td>提供適用於 VS Code 與 Android Studio 的 IDE 外掛程式。</td>
</tr>

    
<tr>
<td><b>採用該技術的企業</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、<a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>、<a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">百度 (Baidu)</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a>，更多案例收錄於我們的 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 案例研究</a> 中。</td>
        <td><a href="https://flutter.dev/showcase/xiaomi">小米 (Xiaomi)</a>、<a href="https://flutter.dev/showcase/wolt">Wolt</a>、<a href="https://flutter.dev/showcase/universal-studios">環球影城 (Universal Studios)</a>、<a href="https://flutter.dev/showcase/alibaba-group">阿里巴巴集團 (Alibaba Group)</a>、<a href="https://flutter.dev/showcase/bytedance">字節跳動 (ByteDance)</a>、<a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>、<a href="https://flutter.dev/showcase/ebay">eBay Motors</a>、<a href="https://flutter.dev/showcase/google-pay">Google Pay</a>、<a href="https://flutter.dev/showcase/so-vegan">So Vegan</a>，更多案例收錄於 <a href="https://flutter.dev/showcase">Flutter Showcase</a> 中。</td>
</tr>

</table>

[![探索全球企業利用 Kotlin Multiplatform 進行跨平台開發的實際案例。](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

您也可以閱讀 Google 的部落格文章：[為開發者簡化跨平台開發 (Making Development Across Platforms Easier for Developers)](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)，該文針對如何為您的專案挑選適當的技術堆疊提供了指引。

如果您想尋找更多 Kotlin Multiplatform 與 Flutter 之間的比較，也可以觀看 Philipp Lackner 製作的 [KMP vs. Flutter 影片](https://www.youtube.com/watch?v=dzog64ENKG0)。在這部影片中，他針對這兩項技術在程式碼共享、UI 算繪、效能以及未來的發展前景等方面，分享了相當獨到的觀察。

透過仔細評估您特定的商業需求、目標與任務，您將能找出最符合您需求的跨平台解決方案。