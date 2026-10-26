[//]: # (title: Ktor 發行版本)

<show-structure for="chapter" depth="2"/>

Ktor 遵循[語意化版本（Semantic Versioning）](https://semver.org/)規範：

- **主版本（Major versions）** (x.0.0) 包含不相容的 API 變更。
- **次版本（Minor versions）** (x.y.0) 提供具備向後相容性的新功能。
- **修補版本（Patch versions）** (x.y.z) 包含具備向後相容性的修正。

針對每個主要與次要版本，我們也會發佈數個預覽（EAP）版本，讓您能在正式發行前搶先試用新功能。如需更多詳細資訊，請參閱[早期體驗體計劃](https://ktor.io/eap/)。

## Gradle 外掛程式 {id="gradle"}

[Gradle Ktor 外掛程式](https://github.com/ktorio/ktor-build-plugins)與該架構採用相同的發行週期。
您可以在 [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin) 上找到所有外掛程式發行版本。

## IntelliJ Ultimate 外掛程式 {id="intellij"}

[IntelliJ Ktor 外掛程式](https://www.jetbrains.com/help/idea/ktor.html)是獨立於 Ktor 架構之外發佈的，
並且採用與 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) 相同的發行週期。

### 更新至新發行版本 {id="update"}

IntelliJ Ktor 外掛程式可協助您將 Ktor 專案遷移至最新版本。
您可以從[遷移專案](https://www.jetbrains.com/help/idea/ktor.html#migrate)章節了解更多資訊。

## 發行詳細資訊 {id="release-details"}

下表列出了最新 Ktor 發行版本的詳細資訊。

<table>

<tr>
<td>版本</td><td>發行日期</td><td>重點摘要</td>
</tr>

<tr>
<td>3.6.0</td><td>2026 年 9 月 17 日</td><td>
<p>
次要發行版本，新增了 Netty 的實驗性 HTTP/3 支援、Kotlin Multiplatform 的預設用戶端引擎、JVM WebRTC 支援，以及用戶端與伺服器端的其他功能和改進。
</p>
若要了解更多，請參閱 <Links href="whats-new-360.md" summary="">Ktor 3.6.0 新功能</Links>。
<var name="version" value="3.6.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.5.2</td><td>2026 年 8 月 4 日</td><td>
<p>
著重於穩定性與效能的修補版本，增強了速率限制（rate limiting）支援、恢復了文字處理效能，並修正了 I/O 處理、OpenAPI 以及配置問題。
</p>
<var name="version" value="3.5.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.5.1</td><td>2026 年 6 月 26 日</td><td>
<p>
修補發行版本，包含 OpenAPI 外掛程式改進、擴充身分驗證 KDoc 文件，以及涵蓋 Kotlin 2.4 編譯器相容性、HTTP 與快取行為、身分驗證、WebRTC 穩定性，以及跨 JVM、Darwin、Android 和 Windows 平台特定問題的廣泛錯誤修正。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026 年 5 月 15 日</td><td>
<p>
次要發行版本，導入了 RFC 7616 摘要式身分驗證（Digest authentication）支援、OkHttp 與 Apache5 的自訂 DNS 解析器配置、請求參數輔助函式，以及配置、工作階段和 JavaScript 相容性方面的其他改進。
若要了解更多，請參閱 <Links href="whats-new-350.md" summary="">Ktor 3.5.0 新功能</Links>。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026 年 4 月 22 日</td><td>
<p>
著重於穩定性的修補版本，修正了 OpenAPI 架構推論、用戶端引擎生命週期問題，以及數個並行與平台特定的錯誤。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026 年 3 月 27 日</td><td>
<p>
修補發行版本，透過分配最佳化與 WebSocket 修正提升了用戶端與引擎效能，並解決了涉及 OpenAPI、記錄（logging）、GraalVM 相容性、Netty、Darwin、相依注入、壓縮、憑證鎖定（certificate pinning）及 Kotlin/Native 的廣泛問題。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026 年 3 月 4 日</td><td>
<p>
包含重要迴歸修正的修補版本，解決了
<a href="whats-new-340.md#use-engine-dispatcher">3.4.0 中引入的 Flow 不變性錯誤</a>並恢復了正確的
<code>StreamResetException</code> 傳遞。同時也包含效能改進、OpenAPI 增強功能，以及跨引擎與平台的多項穩定性修正。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026 年 1 月 23 日</td><td>
<p>
次要發行版本，導入了執行階段產生的 OpenAPI 規格、Zstd 與 Jackson 3 支援、OkHttp 雙工串流（duplex streaming），以及數十項增強整個架構可靠性的錯誤修正。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025 年 11 月 26 日</td><td>
<p>
修補發行版本，為 Jetty Client 新增明文 HTTP/2（h2c）支援、改進記錄與 OpenAPI 產生，並修正引擎、SSE 處理、重複回應、HTTP/2 標頭及用戶端快取中的錯誤。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025 年 11 月 5 日</td><td>
<p>
修補發行版本，為 Darwin 新增 SOCKS 代理支援、微調 WebRTC 用戶端目標與 Java 代理處理，並修正 HTTP 重試、OpenAPI、快取以及 Android 上 Netty 的多個問題。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025 年 10 月 8 日</td><td>
<p>
修補發行版本，將 Kotlin 更新至 2.2.20，並修正數個問題，包括 Content-Length 剖析錯誤、<code>ClientSSESession</code> 缺少序列化器、Netty 配置與關閉錯誤，並新增在 bootJar 內提供靜態資源的支援。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025 年 9 月 11 日</td><td>
<p>
次要發行版本，導入多項重大功能，例如實驗性 OpenAPI 產生預覽、改進的靜態內容處理、適用於 Android 與 JS/Wasm 的 WebRTC 用戶端，並升級至 Jetty、OkHttp 與 Kotlin 2.2。如需更多資訊，請參閱 <Links href="whats-new-330.md" summary="">Ktor 3.3.0 新功能</Links>。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025 年 7 月 29 日</td><td>
<p>
修補發行版本，改進了 YAML 配置處理、相依注入解析以及 Wasm/JS 穩定性，並修正了 multipart 剖析、CIO <code>100 Continue</code> 回應格式化、<code>ByteReadChannel</code> 中的無窮讀取迴圈，以及伺服器關閉問題。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025 年 7 月 14 日</td><td>
<p>
修補發行版本，改進了 SSE 欄位序列化順序，並解決了 CORS preflight 處理、測試應用程式串流、配置反序列化錯誤，以及跨平台遺漏標頭（包含影響 wasmJs 與 Darwin 目標的 3.2.1 迴歸問題）等數個問題。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025 年 7 月 4 日</td><td>
<p>
修補發行版本，改進了時間 API、範本製作與發佈功能，並針對 3.2.0 中引入的外掛程式行為、Netty、OkHttp 和啟動問題提供了關鍵錯誤修正。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025 年 6 月 12 日</td><td>
<p>
次要發行版本，導入了型別化配置反序列化、全新相依注入與 HTMX 模組、Gradle 版本目錄（version catalog）支援，以及 suspend 模組支援。如需更多資訊，請參閱 <Links href="whats-new-320.md" summary="">Ktor 3.2.0 新功能</Links>。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025 年 5 月 5 日</td><td><p>
修補發行版本，包含效能改進（如更快的位元組操作與 multipart 處理）以及更安全的身分驗證權杖重新整理處理。同時修正了指標中的記憶體問題、改善標頭行為，並解決了 WebSockets、OkHttp、Apache5 和 Netty 的相關錯誤，此外還更新了 JTE 以支援 Kotlin 2.1.0。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025 年 3 月 27 日</td><td><p>
修補發行版本，將 Kotlin 更新至 2.1.20，並修正了多個問題，包括 Base64 解碼、驗證權杖清除、Android 伺服器啟動錯誤、WebSocket 標頭格式化以及 SSE 工作階段取消。
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025 年 2 月 24 日</td><td><p>
改進記錄並修正 WebSocket 逾時處理的修補版本。修正了多項錯誤，包括 HTTP 快取不一致、表單資料複製錯誤、gzip 處理當機，以及導致分段集區損壞的並行問題。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025 年 2 月 11 日</td><td><p>
次要發行版本，導入了多項 SSE 功能，並擴充了 CIO 引擎和 WebSocket 支援。增強了平台相容性、記錄與身分驗證，同時修正了與位元組通道處理、HTTP 請求失敗以及並行問題相關的重大錯誤。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024 年 12 月 18 日</td><td><p>
包含多項錯誤修正的修補版本，包含修正 <code>browserProductionWebpack</code> 中的建置錯誤、gzip 內容處理，以及 <code>FormFieldLimit</code> 配置覆寫問題。此發行版本亦包含核心效能改進與正確的測試應用程式關閉處理。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024 年 12 月 4 日</td><td><p>
修補發行版本，解決了與回應損壞、主體遭截斷、連線處理以及錯誤標頭相關的多個問題修正，同時擴充了二進位編碼支援並提升 Android 效能。
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024 年 11 月 20 日</td><td><p>
包含錯誤修正、安全性修補程式與功能改進的修補發行版本，包括新增對 <code>watchosDeviceArm64</code> 目標的支援。
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024 年 10 月 29 日</td><td><p>
修補發行版本，包含用戶端與伺服器端記錄改進，以及各項錯誤修正。
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024 年 10 月 9 日</td><td><p>
包含多項改進與錯誤修正的主要發行版本，包含新增對 Android Native 目標的支援。
如需破壞性變更的詳細資訊，請參閱<Links href="migrating-3.md" summary="">遷移指南</Links>。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024 年 10 月 2 日</td><td><p>
主要候選版本（Release Candidate），包含多項帶有破壞性變更的改進、錯誤修正與新功能（例如對 XML 的多平台支援）。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024 年 9 月 9 日</td><td><p>
包含重大改進與錯誤修正的主要候選版本。此更新強化了向後相容性，並具備擴充的 <code>staticZip</code> 支援。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024 年 7 月 15 日</td><td><p>
具有多項改進與錯誤修正的主要預發行（pre-release）版本，包含 SSE 支援改進以及適用於 Kotlin/Wasm 的 Ktor 用戶端。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024 年 6 月 20 日</td><td><p>
修補發行版本，包含 Ktor Core 與 Ktor Server 中的錯誤修正，以及 Netty 與 OpenAPI 的版本更新。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024 年 5 月 9 日</td><td><p>
修補發行版本，包含將通訊端逾時（socket timeout）套用至 Test Client 引擎的錯誤修正。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024 年 4 月 8 日</td><td><p>
修補發行版本，包含針對 CallLogging 與 SSE 伺服器外掛程式的多項錯誤修正、改進的 Android 用戶端記錄等。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024 年 3 月 4 日</td><td><p>
修補發行版本，包含 ContentNegotiation 用戶端外掛程式的錯誤修正，以及新增透過 HTTP 傳送安全 Cookie 的支援。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024 年 1 月 31 日</td><td><p>
修補發行版本，包含針對 URLBuilder、CORS 和 WebSocket 外掛程式的多項錯誤修正。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023 年 12 月 7 日</td><td>
<p>
修補發行版本，包含 ContentNegotiation、WebSockets 中的錯誤修正，以及 Native Server 中的記憶體使用量問題修復。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023 年 11 月 23 日</td><td>
<p>
包含多項改進與錯誤修正的主要預發行版本，包含用戶端與伺服器端的 SSE 支援。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023 年 11 月 7 日</td><td>
<p>
修補發行版本，包含對 2.3.5 中破壞性變更的修正以及其他各項錯誤修復。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023 年 10 月 5 日</td><td>
<p>
修補發行版本，包含 Darwin 與 Apache5 引擎配置中的修正。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023 年 8 月 31 日</td><td>
<p>
修補發行版本，包含 HTTP Cookie 標頭與 NoTransformationFoundException 錯誤的修正。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023 年 8 月 1 日</td><td>
<p>
修補發行版本，包含對 <code>linuxArm64</code> 的用戶端與伺服器支援以及各項錯誤修正。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023 年 6 月 28 日</td><td>
<p>
修補發行版本，將 Kotlin 版本升級至 <code>1.8.22</code> 並包含各項錯誤修正。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023 年 5 月 31 日</td><td>
<p>
修補發行版本，包含伺服器配置改進與各項錯誤修正。
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023 年 4 月 19 日</td><td>
<p>
功能發行版本，新增對多重組態檔、Routing 中的正規表示式模式等支援。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023 年 2 月 28 日</td><td>
<p>
修補發行版本，包含 HTTP 用戶端、Routing 與 ContentNegotiation 中的各項錯誤修正。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023 年 1 月 31 日</td><td>
<p>
修補發行版本，包含 OAuth2 的多平台功能以及各項錯誤修正。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023 年 1 月 3 日</td><td>
<p>
修補發行版本，包含 <code>2.2.1</code> 的錯誤修正、Swagger 外掛程式中的改進與修正等。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022 年 12 月 7 日</td><td>
<p>
針對 <code>2.2.0</code> 中的 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 錯誤發布的修補版本。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022 年 12 月 7 日</td><td>
<p>
多功能發行版本，包含 Swagger UI 代管、全新外掛程式 API、Sessions 的多平台支援等。
如需更多資訊，請參閱<Links href="migration-to-22x.md" summary="">從 2.0.x 遷移至 2.2.x</Links>指南。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022 年 10 月 26 日</td><td>
<p>
包含各項錯誤修正的修補版本。
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022 年 9 月 29 日</td><td>
<p>
修補發行版本，包含 Routing、Testing 引擎與 Ktor 用戶端中的錯誤修正。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022 年 9 月 6 日</td><td>
<p>
修補發行版本，包含 Ktor 用戶端與伺服器端的各項錯誤修正。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022 年 8 月 11 日</td><td>
<p>
次要發行版本，新增對 YAML 配置的支援以及各項其他改進和錯誤修正。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022 年 6 月 28 日</td><td>
<p>
修補發行版本，包含錯誤修正並將 <code>kotlinx.coroutines</code> 版本升級至 <code>1.6.2</code>。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022 年 5 月 27 日</td><td>
<p>
修補發行版本，包含多項改進、錯誤修正以及相依性版本升級。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022 年 4 月 28 日</td><td>
<p>
修補發行版本，包含各項錯誤修正並將 Kotlin 版本更新至 <code>1.6.21</code>。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022 年 4 月 11 日</td><td>
<p>
主要發行版本，更新了 API 文件並加入多項新功能。如需破壞性變更以及如何從 <code>1.x.x</code> 遷移的更多資訊，請參閱<Links href="migration-to-20x.md" summary="">遷移指南</Links>。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022 年 3 月 15 日</td><td>
<p>
包含相依性版本升級的修補版本。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

</table>