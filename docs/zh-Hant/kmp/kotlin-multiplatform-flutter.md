# Kotlin Multiplatform 與 Flutter：跨平台開發解決方案

<web-summary>本文探討 Kotlin Multiplatform 與 Flutter，協助您了解它們的功能並為您的跨平台專案選擇合適的方案。</web-summary> 

在快速發展的技術領域中，開發人員不斷尋求高效的架構與工具來協助建置高品質的應用程式。然而，在可用的選項中進行選擇時，重要的是避免過度強調尋找所謂的「最佳」選項，因為這種方法並不總是能導向最合適的選擇。

每個專案都是獨特的且有特定的需求。本文旨在協助您引導選擇，並更深入了解哪種技術（如 Kotlin Multiplatform 或 Flutter）最適合您的專案，以便您做出明智的決定。

## 跨平台開發：建置現代應用程式的統一方法

跨平台開發提供了一種方式，可以使用單一程式碼庫建置可在多個平台上執行的應用程式，消除了為每個系統重寫相同功能的必要性。雖然通常與[行動開發](cross-platform-mobile-development.topic)（針對 Android 和 iOS）相關聯，但這種方法遠不止於行動裝置，還涵蓋了 Web、桌面甚至伺服器端環境。

核心概念是極大化程式碼重複使用，同時確保在必要時仍可實作平台特定的特性，從而簡化開發過程並減少維護工作。團隊可以加速開發週期、降低成本並確保跨平台的一致性，使跨平台開發成為當今日益多樣化的應用程式環境中的明智選擇。

## Kotlin Multiplatform 與 Flutter：簡化跨平台開發

Flutter 和 Kotlin Multiplatform 是兩種流行的跨平台技術，可簡化不同平台間應用程式的開發。

### Flutter

[Flutter](https://flutter.dev/) 是一個開源架構，用於從單一程式碼庫建置原生編譯的多平台應用程式。它允許您在 Android、iOS、Web、桌面 (Windows, macOS, Linux) 和嵌入式系統中建立豐富的應用程式體驗——這一切都來自單一、共用的應用程式程式碼庫。Flutter 應用程式使用 Dart 程式語言編寫。Flutter 由 Google 支援並使用。

最初於 2014 年以 Sky 的名稱推出，[Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/) 於 2018 年 12 月在 Flutter Live 期間正式發佈。

Flutter 開發人員社群規模龐大且高度活躍，提供持續的改進與支援。Flutter 允許使用由 Flutter 和 Dart 生態系統中的開發人員貢獻的共用軟件包。

### Kotlin Multiplatform

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) 是由 JetBrains 開發的開源技術，允許開發人員為 Android、iOS、Web、桌面 (Windows, macOS, Linux) 和伺服器端建立應用程式，使他們能夠在這些平台間高效地重複使用 Kotlin 程式碼，同時保留原生程式設計的優點。

透過 Kotlin Multiplatform，您有各種選擇：您可以共用除應用程式入口點以外的所有程式碼、共用單一邏輯部分（如網路或資料庫模組），或在保持 UI 原生的同時共用商務邏輯。

![Kotlin Multiplatform 是一項可用於重複使用高達 100% 程式碼的技術](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform 最初作為 Kotlin 1.2 的一部分於 2017 年推出。2023 年 11 月，Kotlin Multiplatform 進入穩定階段。在 Google I/O 2024 期間，Google 宣佈[支援 Kotlin Multiplatform](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)，用於在 Android 和 iOS 之間共用商務邏輯。

如果您想了解更多關於 Kotlin Multiplatform 的一般發展方向，請參閱我們的部落格文章：[Kotlin Multiplatform 與 Compose Multiplatform 的後續發展](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)。

[![探索 Kotlin Multiplatform](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform

您可以使用 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/) 編寫跨多平台的共用 UI 程式碼，這是 JetBrains 開發的現代宣告式架構，建置於 Kotlin Multiplatform 和 Google 的 Jetpack Compose 之上。

Compose Multiplatform 目前[在 iOS 上已穩定](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)、Android 和桌面端也已穩定，而 Web 端則處於 Beta 階段。

[![探索 Compose Multiplatform](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

我們的專屬文章概述了 [Compose Multiplatform 與 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md) 之間的關係，並強調了關鍵差異。

### Kotlin Multiplatform 與 Flutter：概覽

<table style="both">
    
<tr>
<td></td>
        <td><b>Kotlin Multiplatform</b></td>
        <td><b>Flutter</b></td>
</tr>

    
<tr>
<td><b>建立者</b></td>
        <td>JetBrains</td>
        <td>Google</td>
</tr>

    
<tr>
<td><b>語言</b></td>
        <td>Kotlin</td>
        <td>Dart</td>
</tr>

    
<tr>
<td><b>靈活性與程式碼重複使用</b></td>
        <td>分享您想要的部分程式碼庫，包括商務邏輯及/或 UI，比例從 1% 到 100%。</td>
        <td>控制應用程式的每個像素，以建立自訂且具適應性的設計，並在所有平台間實現 100% 的程式碼共用。</td>
</tr>

    
<tr>
<td><b>軟件包、相依性與生態系統</b></td>
        <td>軟件包可從 <a href="https://central.sonatype.com/">Maven Central</a> 和其他存儲庫獲取，包括
            <p><a href="https://klibs.io">klibs.io</a>，旨在簡化對 KMP 程式庫的搜尋。</p>
            <p>此<a href="https://github.com/terrakok/kmp-awesome">清單</a>包含了一些最受歡迎的 KMP 程式庫與工具。</p> </td>
        <td>軟件包可從 <a href="https://pub.dev/">Pub.dev.</a> 獲取。</td>
</tr>

    
<tr>
<td><b>建置工具</b></td>
        <td>Gradle（針對 Apple 裝置的應用程式還需加上 Xcode）。</td>
        <td>Flutter 命令列工具（底層使用 Gradle 和 Xcode）。</td>
</tr>

    
<tr>
<td><b>程式碼共用</b></td>
        <td>Android、iOS、Web、桌面與伺服器端。</td>
        <td>Android、iOS、Web、桌面與嵌入式裝置。</td>
</tr>

    
<tr>
<td><b>編譯</b></td>
        <td>針對桌面與 Android 編譯為 JVM 位元組碼，在 Web 上編譯為 JavaScript 或 Wasm，並針對原生平台編譯為平台特定的二進制檔案</td>
        <td>偵錯組建在虛擬機中執行 Dart 程式碼。
        <p>發行組建針對原生平台輸出平台特定的二進制檔案，針對 Web 則輸出 JavaScript/Wasm。</p>
        </td>
</tr>

    
<tr>
<td><b>與原生 API 的通訊</b></td>
        <td>原生 API 可使用 <Links href="/kmp/multiplatform-expect-actual" summary="undefined">expect/actual 宣告</Links> 直接從 Kotlin 程式碼存取。</td>
        <td>與主機平台的通訊可使用 <a href="https://docs.flutter.dev/platform-integration/platform-channels">platform channels</a> 進行。</td>
</tr>

    
<tr>
<td><b>UI 渲染</b></td>
        <td><a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a> 可用於跨平台共用 UI，其基於 Google 的 Jetpack Compose，並使用相容於 OpenGL、ANGLE（將 OpenGL ES 2 或 3 呼叫轉換為原生 API）、Vulkan 和 Metal 的 Skia 引擎。</td>
        <td>Flutter widget 使用自訂的 <a href="https://docs.flutter.dev/perf/impeller">Impeller 引擎</a>渲染於螢幕上，該引擎根據平台與裝置直接與 GPU 通訊（使用 Metal、Vulkan 或 OpenGL）。</td>
</tr>

    
<tr>
<td><b>UI 開發的反覆運算</b></td>
        <td>即使在共用程式碼中也可進行 UI 預覽。
        <p>透過 <Links href="/kmp/compose-hot-reload" summary="undefined">Compose Hot Reload</Links>，您可以立即看到 UI 變更，而無需重新啟動應用程式或丟失其狀態。</p></td>
        <td>VS Code 和 Android Studio 均有可用的 IDE 外掛程式。</td>
</tr>

    
<tr>
<td><b>使用該技術的公司</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>、<a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>、<a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>、<a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>、<a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>、<a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>、<a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>、<a href="https://touchlab.co/">TouchLab</a>、<a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a> 等更多公司列於我們的 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 案例研究。</a></td>
        <td><a href="https://flutter.dev/showcase/xiaomi">Xiaomi</a>、<a href="https://flutter.dev/showcase/wolt">Wolt</a>、<a href="https://flutter.dev/showcase/universal-studios">Universal Studios</a>、<a href="https://flutter.dev/showcase/alibaba-group">Alibaba Group</a>、<a href="https://flutter.dev/showcase/bytedance">ByteDance</a>、<a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>、<a href="https://flutter.dev/showcase/ebay">eBay Motors</a>、<a href="https://flutter.dev/showcase/google-pay">Google Pay</a>、<a href="https://flutter.dev/showcase/so-vegan">So Vegan</a> 等更多公司列於 <a href="https://flutter.dev/showcase">Flutter Showcase</a> 中。</td>
</tr>

</table>

[![探索來自全球公司使用 Kotlin Multiplatform 進行跨平台開發的真實案例。](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

您也可以查看 Google 的部落格文章：[讓開發人員更輕鬆地進行跨平台開發](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)，該文章為您的專案選擇合適的技術堆疊提供了指引。

如果您正在尋找 Kotlin Multiplatform 與 Flutter 之間的額外比較，也可以觀看 Philipp Lackner 的 [KMP vs. Flutter 影片](https://www.youtube.com/watch?v=dzog64ENKG0)。在此影片中，他在程式碼共用、UI 渲染、效能以及這兩項技術的未來方面分享了一些有趣的觀察。

透過仔細評估您的特定商務需求、目標和任務，您可以找到最符合您需求的跨平台解決方案。