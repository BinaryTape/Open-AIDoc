[//]: # (title: Ktor 發佈版本)

<show-structure for="chapter" depth="2"/>

Ktor 遵循[語意化版本](https://semver.org/)（Semantic Versioning）：

- _主要版本_ (x.0.0) 包含不相容的 API 變更。
- _次要版本_ (x.y.0) 提供回溯相容的新功能。
- _修補版本_ (x.y.z) 包含回溯相容的修復。

對於每個主要和次要版本，我們還會推出數個預覽版（EAP）供您在正式發佈前體驗新功能。若要了解更多詳細資訊，請參閱[早期體驗體計劃](https://ktor.io/eap/)。

## Gradle 外掛程式 {id="gradle"}

[Gradle Ktor 外掛程式](https://github.com/ktorio/ktor-build-plugins)與此架構處於相同的發佈週期。
您可以在 [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin) 上找到所有外掛程式版本。

## IntelliJ Ultimate 外掛程式 {id="intellij"}

[IntelliJ Ktor 外掛程式](https://www.jetbrains.com/help/idea/ktor.html)是獨立於 Ktor 架構發佈的，並與 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) 採用相同的發佈週期。

### 更新至新版本 {id="update"}

IntelliJ Ktor 外掛程式可讓您將 Ktor 專案遷移至最新版本。
您可以從[遷移專案](https://www.jetbrains.com/help/idea/ktor.html#migrate)一節了解更多資訊。

## 版本詳細資訊 {id="release-details"}

下表列出了最新 Ktor 發佈版本的詳細資訊。

<table>

<tr>
<td>版本</td><td>發佈日期</td><td>重點更新</td>
</tr>

<tr>
<td>3.6.1</td><td>2026 年 10 月 30 日</td><td>
<p>
此修補版本修復了連線管理、請求取消、串流、WebSocket 以及特定平台引擎的各種問題，同時改進了路由、HTTP 相容性與資源處理。
</p>
<var name="version" value="3.6.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.6.0</td><td>2026 年 9 月 17 日</td><td>
<p>
此次要版本為 Netty 新增了實驗性的 HTTP/3 支援、Kotlin Multiplatform 的預設用戶端引擎、JVM WebRTC 支援，以及用戶端與伺服器端的其他功能和改進。
</p>
若要了解更多詳細資訊，請參閱 <Links href="whats-new-360.md" summary="">Ktor 3.6.0 新功能</Links>。
<var name="version" value="3.6.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.5.2</td><td>2026 年 8 月 4 日</td><td>
<p>
此修補版本著重於穩定性與效能，增強了速率限制支援、恢復了文字處理效能，並修復了 I/O 處理、OpenAPI 及配置問題。
</p>
<var name="version" value="3.5.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.5.1</td><td>2026 年 6 月 26 日</td><td>
<p>
此修補版本包含 OpenAPI 外掛程式的改進、擴充的認證 KDoc 文件，以及涵蓋 Kotlin 2.4 編譯器相容性、HTTP 與快取行為、認證、WebRTC 穩定性，以及 JVM、Darwin、Android 和 Windows 上特定平台問題的大量錯誤修正。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026 年 5 月 15 日</td><td>
<p>
此次要版本引入了 RFC 7616 Digest 認證支援、適用於 OkHttp 和 Apache5 的自訂 DNS 解析器配置、請求參數幫助函式，以及針對配置、工作階段和 JavaScript 相容性的其他改進。
若要了解更多詳細資訊，請參閱 <Links href="whats-new-350.md" summary="">Ktor 3.5.0 新功能</Links>。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026 年 4 月 22 日</td><td>
<p>
此修補版本著重於穩定性，修復了 OpenAPI 架構推論、用戶端引擎生命週期問題，以及數個並行和特定平台錯誤。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026 年 3 月 27 日</td><td>
<p>
此修補版本透過配置最佳化和 WebSocket 修復改善了用戶端與引擎的效能，並解決了涵蓋 OpenAPI、記錄、GraalVM 相容性、Netty、Darwin、相依注入、壓縮、憑證綁定以及 Kotlin/Native 的廣泛問題。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026 年 3 月 4 日</td><td>
<p>
此修補版本包含重要的迴歸修復，包括解決 <a href="whats-new-340.md#use-engine-dispatcher">3.4.0 中引入的 Flow 不變性錯誤</a>，並恢復適當的 <code>StreamResetException</code> 傳播。它還包含效能改進、OpenAPI 增強功能，以及跨引擎與平台的多項穩定性修復。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026 年 1 月 23 日</td><td>
<p>
此次要版本引入了執行時期產生的 OpenAPI 規格、Zstd 和 Jackson 3 支援、適用於 OkHttp 的雙工串流，以及數十項強化整個架構可靠性的錯誤修復。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025 年 11 月 26 日</td><td>
<p>
此修補版本在 Jetty Client 上新增了明文 HTTP/2 (h2c) 支援、改進了記錄與 OpenAPI 產生，並修復了引擎、SSE 處理、重複回應、HTTP/2 標頭以及用戶端快取中的錯誤。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025 年 11 月 5 日</td><td>
<p>
此修補版本新增了對 Darwin 的 SOCKS 代理支援，完善了 WebRTC 用戶端目標和 Java 代理處理，並修復了 Android 上 HTTP 重試、OpenAPI、快取和 Netty 中的多個問題。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025 年 10 月 8 日</td><td>
<p>
此修補版本將 Kotlin 更新至 2.2.20，修復了包括 Content-Length 剖析錯誤、<code>ClientSSESession</code> 序列化程式遺失、Netty 配置和關閉錯誤在內的多個問題，並新增了在 bootJar 內提供靜態資源的支援。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025 年 9 月 11 日</td><td>
<p>
此次要版本引入了諸如實驗性 OpenAPI 產生預覽、改進的靜態內容處理、適用於 Android 和 JS/Wasm 的 WebRTC 用戶端等主要功能，並升級至 Jetty、OkHttp 和 Kotlin 2.2。如需詳細資訊，請參閱 <Links href="whats-new-330.md" summary="">Ktor 3.3.0 新功能</Links>。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025 年 7 月 29 日</td><td>
<p>
此修補版本對 YAML 配置處理、相依注入解析和 Wasm/JS 穩定性進行了改進，並修復了 multipart 剖析、CIO <code>100 Continue</code> 回應格式化、<code>ByteReadChannel</code> 中的無限讀取迴圈，以及伺服器關閉問題。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025 年 7 月 14 日</td><td>
<p>
此修補版本改進了 SSE 欄位序列化順序，並解決了數個問題，包括 CORS 預檢處理、測試應用程式串流、配置反序列化錯誤，以及跨平台遺失標頭的問題——包括影響 wasmJs 和 Darwin 目標的 3.2.1 迴歸問題。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025 年 7 月 4 日</td><td>
<p>
此修補版本包含對時間 API、範本製作和發佈的改進，以及對 3.2.0 中引入的外掛程式行為、Netty、OkHttp 和啟動問題的重大錯誤修復。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025 年 6 月 12 日</td><td>
<p>
此次要版本引入了具型別的配置反序列化、全新相依注入和 HTMX 模組、Gradle version catalog 支援，以及 suspend 模組支援。如需詳細資訊，請參閱 <Links href="whats-new-320.md" summary="">Ktor 3.2.0 新功能</Links>。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025 年 5 月 5 日</td><td><p>
此修補版本包含效能改進，例如更快速的位元組操作和 multipart 處理，以及更安全的權杖重新整理處理。它還修復了指標中的記憶體問題、改進了標頭行為，解決了涵蓋 WebSocket、OkHttp、Apache5 和 Netty 的錯誤，並更新 JTE 以支援 Kotlin 2.1.0。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025 年 3 月 27 日</td><td><p>
此修補版本將 Kotlin 更新至 2.1.20，並修復了各種問題，包括 Base64 解碼、認證權杖清除、Android 伺服器啟動錯誤、WebSocket 標頭格式化和 SSE 工作階段取消。
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025 年 2 月 24 日</td><td><p>
此修補版本改進了記錄並修復了 WebSocket 逾時處理。它修復了多個錯誤，包括 HTTP 快取不一致、表單資料複製錯誤、gzip 處理當機，以及導致區段集區損壞的並行問題。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025 年 2 月 11 日</td><td><p>
此次要版本引入了各種 SSE 功能，並擴充了 CIO 引擎和 WebSocket 支援。它增強了平台相容性、記錄和認證，同時修復了與位元組通道處理、HTTP 請求失敗和並行問題相關的重要錯誤。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024 年 12 月 18 日</td><td><p>
此修補版本包含各種錯誤修正，包括修復 <code>browserProductionWebpack</code> 中的建置錯誤、gzip 壓縮內容處理，以及 <code>FormFieldLimit</code> 配置覆寫問題。此版本還包含核心效能改進和適當的測試應用程式關閉。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024 年 12 月 4 日</td><td><p>
此修補版本解決了與回應損壞、截斷主體、連線處理和不正確標頭相關的多個錯誤修復，並提供擴充的二進位編碼支援以及 Android 的效能增強。
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024 年 11 月 20 日</td><td><p>
此修補版本包含錯誤修正、安全修補程式和改進，包括新增對 <code>watchosDeviceArm64</code> 目標的支援。
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024 年 10 月 29 日</td><td><p>
此修補版本包含用戶端與伺服器端記錄的改進，以及各種錯誤修正。
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024 年 10 月 9 日</td><td><p>
此主要版本包含改進與錯誤修正，包括新增對 Android Native 目標的支援。
若要了解有關重大變更的更多資訊，請參閱<Links href="migrating-3.md" summary="">遷移指南</Links>。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024 年 10 月 2 日</td><td><p>
此主要版本候選版包含各種具有重大變更的改進、錯誤修正和功能，例如對 XML 的多平台支援。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024 年 9 月 9 日</td><td><p>
此主要版本候選版包含重大的改進和錯誤修正。此更新增強了回溯相容性，並提供了擴充的 <code>staticZip</code> 支援。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024 年 7 月 15 日</td><td><p>
此主要預發佈版本包含各種改進和錯誤修正，包括 SSE 支援改進以及適用於 Kotlin/Wasm 的 Ktor 用戶端。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024 年 6 月 20 日</td><td><p>
此修補版本包含 Ktor Core 和 Ktor Server 中的錯誤修正，以及 Netty 和 OpenAPI 的版本更新。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024 年 5 月 9 日</td><td><p>
此修補版本包含為 Test Client 引擎套用通訊端逾時的錯誤修正。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024 年 4 月 8 日</td><td><p>
此修補版本包含針對 CallLogging 和 SSE 伺服器外掛程式的各種錯誤修正、改進的 Android 用戶端記錄等。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024 年 3 月 4 日</td><td><p>
此修補版本包含 ContentNegotiation 用戶端外掛程式的錯誤修正，並新增了透過 HTTP 傳送安全 Cookie 的支援。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024 年 1 月 31 日</td><td><p>
此修補版本包含針對 URLBuilder、CORS 和 WebSocket 外掛程式的各種錯誤修正。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023 年 12 月 7 日</td><td>
<p>
此修補版本包含 ContentNegotiation、WebSocket 中的錯誤修正，以及 Native Server 中的記憶體使用量改善。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023 年 11 月 23 日</td><td>
<p>
此主要預發佈版本包含各種改進和錯誤修正，包括用戶端與伺服器端 SSE 支援。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023 年 11 月 7 日</td><td>
<p>
此修補版本包含針對 2.3.5 中重大變更的修復以及其他各種錯誤修正。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023 年 10 月 5 日</td><td>
<p>
此修補版本包含 Darwin 和 Apache5 引擎配置中的修復。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023 年 8 月 31 日</td><td>
<p>
此修補版本包含 HTTP Cookie 標頭和 NoTransformationFoundException 錯誤的錯誤修正。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023 年 8 月 1 日</td><td>
<p>
此修補版本包含對 <code>linuxArm64</code> 的用戶端與伺服器端支援，以及各種錯誤修正。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023 年 6 月 28 日</td><td>
<p>
此修補版本將 Kotlin 版本升級至 <code>1.8.22</code>，並包含各種錯誤修正。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023 年 5 月 31 日</td><td>
<p>
此修補版本包含伺服器配置的改進以及各種錯誤修正。
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023 年 4 月 19 日</td><td>
<p>
此功能發佈版本新增了對多個組態檔、Routing 中的正規表示式模式等功能的支援。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023 年 2 月 28 日</td><td>
<p>
此修補版本包含 HTTP 用戶端、Routing 和 ContentNegotiation 中的各種錯誤修正。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023 年 1 月 31 日</td><td>
<p>
此修補版本包含 OAuth2 的多平台功能以及各種錯誤修正。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023 年 1 月 3 日</td><td>
<p>
此修補版本包含 <code>2.2.1</code> 的錯誤修正，以及 Swagger 外掛程式中的改進和修復等。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022 年 12 月 7 日</td><td>
<p>
此修補版本修復了 <code>2.2.0</code> 中的 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 錯誤。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022 年 12 月 7 日</td><td>
<p>
此多功能發佈版本包含 Swagger UI 託管、全新外掛程式 API、Sessions 的多平台支援等。
如需詳細資訊，請參閱<Links href="migration-to-22x.md" summary="">從 2.0.x 遷移至 2.2.x</Links>指南。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022 年 10 月 26 日</td><td>
<p>
此修補版本包含各種錯誤修正。
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022 年 9 月 29 日</td><td>
<p>
此修補版本包含 Routing、Testing 引擎和 Ktor 用戶端中的錯誤修正。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022 年 9 月 6 日</td><td>
<p>
此修補版本包含 Ktor 用戶端和伺服器端中的各種錯誤修正。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022 年 8 月 11 日</td><td>
<p>
此次要版本新增了對 YAML 配置的支援，以及其他各種改進和錯誤修正。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022 年 6 月 28 日</td><td>
<p>
此修補版本包含錯誤修正，並將 <code>kotlinx.coroutines</code> 版本升級至 <code>1.6.2</code>。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022 年 5 月 27 日</td><td>
<p>
此修補版本包含各種改進、錯誤修正和相依性版本升級。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022 年 4 月 28 日</td><td>
<p>
此修補版本包含各種錯誤修正，並將 Kotlin 版本更新至 <code>1.6.21</code>。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022 年 4 月 11 日</td><td>
<p>
此主要版本更新了 API 文件並提供各種新功能。如需有關重大變更以及如何從 <code>1.x.x</code> 遷移的詳細資訊，請參閱<Links href="migration-to-20x.md" summary="">遷移指南</Links>。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022 年 3 月 15 日</td><td>
<p>
此修補版本包含相依性版本升級。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上檢視變更記錄</a>
</p>
</td>
</tr>

</table>