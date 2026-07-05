[//]: # (title: Ktor 版本)

<show-structure for="chapter" depth="2"/>

Ktor 遵循 [語意化版本](https://semver.org/)：

- _主要版本_ (x.0.0) 包含不相容的 API 變更。
- _次要版本_ (x.y.0) 提供回溯相容的新功能。
- _修正版本_ (x.y.z) 包含回溯相容的修正。

對於每個主要和次要版本，我們還會提供多個預覽 (EAP) 版本，供您在正式發佈前嘗試新功能。如需更多詳細資訊，請參閱 [早期體驗體計劃](https://ktor.io/eap/)。

## Gradle 外掛程式 {id="gradle"}

[Gradle Ktor 外掛程式](https://github.com/ktorio/ktor-build-plugins) 與架構處於相同的發佈週期。
您可以在 [Gradle 外掛程式入口網站](https://plugins.gradle.org/plugin/io.ktor.plugin) 找到所有外掛程式版本。

## IntelliJ Ultimate 外掛程式 {id="intellij"}

[IntelliJ Ktor 外掛程式](https://www.jetbrains.com/help/idea/ktor.html) 的發佈獨立於 Ktor 架構，
並使用與 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) 相同的發佈週期。

### 更新至新版本 {id="update"}

IntelliJ Ktor 外掛程式允許您將 Ktor 專案遷移到最新版本。
您可以從 [遷移專案](https://www.jetbrains.com/help/idea/ktor.html#migrate) 章節了解更多資訊。

## 版本詳情 {id="release-details"}

下表列出了最新 Ktor 版本的詳細資訊。

<table>

<tr>
<td>版本</td><td>發佈日期</td><td>重點摘要</td>
</tr>

<tr>
<td>3.5.1</td><td>2026 年 6 月 26 日</td><td>
<p>
一個修正版本，包含 OpenAPI 外掛程式改進、擴展的身分驗證 KDoc 文件，以及涵蓋 Kotlin 2.4 編譯器相容性、HTTP 與快取行為、身分驗證、WebRTC 穩定性，以及跨 JVM、Darwin、Android 與 Windows 的平台特定問題等廣泛的錯誤修正。
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
一個次要版本，引入了 RFC 7616 摘要身分驗證支援、適用於 OkHttp 與 Apache5 的自訂 DNS 解析器配置、請求參數輔助函式，以及針對配置、工作階段 (sessions) 與 JavaScript 相容性的其他改進。
如需更多資訊，請參閱 <Links href="/ktor/whats-new-350" summary="undefined">Ktor 3.5.0 的新功能</Links>。
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
一個專注於穩定性的修正版本，修正了 OpenAPI 架構推斷、用戶端引擎生命週期問題，以及數個並行與平台特定錯誤。
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
一個修正版本，透過分配優化與 WebSocket 修正改進了用戶端與引擎效能，並解決了涉及 OpenAPI、記錄功能、GraalVM 相容性、Netty、Darwin、相依注入、壓縮、憑證固定以及 Kotlin/Native 的一系列廣泛問題。
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
一個修正版本，包含重要的迴歸修正，包括解決了
<a href="whats-new-340.md#use-engine-dispatcher">使用引擎分派器 (dispatcher) 執行 HttpStatement</a> 的問題，並恢復了正確的 <code>StreamResetException</code> 傳遞。它還包含效能改進、OpenAPI 增強，以及跨引擎與平台的多項穩定性修正。
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
一個次要版本，引入了執行階段產生的 OpenAPI 規格、Zstd 和 Jackson 3 支援、OkHttp 的雙工串流，以及數十項增強整個架構可靠性的錯誤修正。
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
一個修正版本，在 Jetty 用戶端上新增了純文字 HTTP/2 (h2c) 支援，改進了記錄功能與 OpenAPI 產生，並修正了引擎、SSE 處理、重複回應、HTTP/2 標頭和用戶端快取中的錯誤。
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
一個修正版本，為 Darwin 新增了 SOCKS 代理支援，優化了 WebRTC 用戶端目標和 Java 代理處理，並修正了 HTTP 重試、OpenAPI、快取以及 Android 上的 Netty 等多項問題。
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
一個修正版本，將 Kotlin 更新至 2.2.20，並修正了多項問題，包括 Content-Length 剖析錯誤、<code>ClientSSESession</code> 遺漏序列化器、Netty 配置與關閉錯誤，並新增了對在 bootJar 內提供靜態資源服務的支援。
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
一個次要版本，引入了實驗性 OpenAPI 產生預覽、改進的靜態內容處理、適用於 Android 和 JS/Wasm 的 WebRTC 用戶端等主要功能，並升級至 Jetty、OkHttp 和 Kotlin 2.2。如需更多資訊，請參閱 <Links href="/ktor/whats-new-330" summary="undefined">Ktor 3.3.0 的新功能</Links>。
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
一個修正版本，對 YAML 配置處理、DI 解析以及 Wasm/JS 穩定性進行了改進，同時修正了多部分 (multipart) 剖析、CIO <code>100 Continue</code> 回應格式化、<code>ByteReadChannel</code> 中的無限讀取迴圈以及伺服器關閉等問題。
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
一個修正版本，改進了 SSE 欄位序列化順序，並解決了多項問題，包括 CORS 預檢處理、測試應用程式串流、配置反序列化錯誤，以及跨平台遺漏標頭的問題——包括影響 wasmJs 和 Darwin 目標的 3.2.1 迴歸問題。
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
一個修正版本，包含對時間 API、範本化和發佈的改進，以及針對外掛程式行為、Netty、OkHttp 和 3.2.0 中引入的啟動問題的關鍵錯誤修正。
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
一個次要版本，引入了型別化配置反序列化、新的相依注入和 HTMX 模組、Gradle 版本型錄支援以及掛起 (suspend) 模組支援。如需更多資訊，請參閱 <Links href="/ktor/whats-new-320" summary="undefined">Ktor 3.2.0 的新功能</Links>。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025 年 5 月 5 日</td><td><p>
一個修正版本，包含效能改進（如更快的位元組操作和多部分處理）以及更安全的權杖重新整理處理。它還修正了計量指標中的記憶體問題、改進了標header行為，並解決了 WebSockets、OkHttp、Apache5 和 Netty 的錯誤，此外還更新了 JTE 以支援 Kotlin 2.1.0。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025 年 3 月 27 日</td><td><p>
一個修正版本，將 Kotlin 更新至 2.1.20 並修正了各種問題，包括 Base64 解碼、驗證權杖清除、Android 伺服器啟動錯誤、WebSocket 標頭格式化以及 SSE 工作階段取消。 
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025 年 2 月 24 日</td><td><p>
一個修正版本，改進了記錄功能並修正了 WebSocket 逾時處理。它修正了多個錯誤，包括 HTTP 快取不一致、表單資料複製錯誤、gzip 處理當機以及導致區段池損壞的並行問題。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025 年 2 月 11 日</td><td><p>
一個次要版本，引入了多種 SSE 功能，並擴展了 CIO 引擎與 WebSocket 支援。它增強了平台相容性、記錄功能與身分驗證，同時修正了與位元組通道處理、HTTP 請求失敗及並行問題相關的關鍵錯誤。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024 年 12 月 18 日</td><td><p>
一個包含各種錯誤修正的修正版本，包括修正 <code>browserProductionWebpack</code> 中的組建錯誤、gzip 內容處理以及 <code>FormFieldLimit</code> 配置覆寫。此版本還包含核心效能改進以及正確的測試應用程式關閉。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024 年 12 月 4 日</td><td><p>
一個修正版本，解決了與回應損壞、主體截斷、連線處理以及錯誤標頭相關的多個錯誤，並擴展了二進位編碼支援和 Android 的效能增強。 
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024 年 11 月 20 日</td><td><p>
一個包含錯誤修正、安全性修正與改進的修正版本，包括新增對 <code>watchosDeviceArm64</code> 目標的支援。  
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024 年 10 月 29 日</td><td><p>
一個包含用戶端與伺服器記錄功能改進以及各種錯誤修正的修正版本。  
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024 年 10 月 9 日</td><td><p>
一個包含改進與錯誤修正的主要版本，包括新增對 Android Native 目標的支援。
如需關於破壞性變更的更多資訊，請參閱 <Links href="/ktor/migrating-3" summary="undefined">遷移指南</Links>。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024 年 10 月 2 日</td><td><p>
一個主要版本候選版，包含各種具有破壞性變更的改進、錯誤修正以及功能，例如對 XML 的多平台支援。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024 年 9 月 9 日</td><td><p>
一個包含重大改進與錯誤修正的主要版本候選版。此更新增強了回溯相容性，並提供擴展的 <code>staticZip</code> 支援。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024 年 7 月 15 日</td><td><p>
一個包含各種改進與錯誤修正的主要預覽版本，包括 SSE 支援改進以及適用於 Kotlin/Wasm 的 Ktor 用戶端。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024 年 6 月 20 日</td><td><p>
一個修正版本，包含 Ktor Core 和 Ktor Server 的錯誤修正，以及 Netty 和 OpenAPI 的版本更新。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024 年 5 月 9 日</td><td><p>
一個修正版本，包含針對測試用戶端引擎套用通訊端逾時的錯誤修正。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024 年 4 月 8 日</td><td><p>
一個修正版本，包含 CallLogging 和 SSE 伺服器外掛程式的各種錯誤修正、改進的 Android 用戶端記錄功能等。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024 年 3 月 4 日</td><td><p>
一個修正版本，包含 ContentNegotiation 用戶端外掛程式的錯誤修正，以及新增對透過 HTTP 傳送安全 Cookie 的支援。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024 年 1 月 31 日</td><td><p>
一個修正版本，包含 URLBuilder、CORS 和 WebSocket 外掛程式的各種錯誤修正。
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
一個修正版本，包含 ContentNegotiation、WebSockets 中的錯誤修正，以及 Native Server 中的記憶體使用量修正。
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
一個包含各種改進與錯誤修正的主要預覽版本，包括用戶端與伺服器 SSE 支援。
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
一個修正版本，包含對 2.3.5 中破壞性變更的修正以及各種其他錯誤修正。
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
一個修正版本，包含 Darwin 與 Apache5 引擎配置中的修正。
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
一個修正版本，包含 HTTP Cookie 標頭與 NoTransformationFoundException 錯誤的錯誤修正。
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
一個包含 <code>linuxArm64</code> 用戶端與伺服器支援以及各種錯誤修正的修正版本。
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
一個將 Kotlin 版本升級至 <code>1.8.22</code> 並包含各種錯誤修正的修正版本。
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
一個包含伺服器配置改進以及各種錯誤修正的修正版本。
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
一個功能版本，新增了對多個配置檔案、路由中的正規表示式模式等支援。
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
一個包含 HTTP 用戶端、路由和 ContentNegotiation 各種錯誤修正的修正版本。
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
一個修正版本，包含 OAuth2 的多平台功能以及各種錯誤修正。
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
一個修正版本，包含針對 <code>2.2.1</code> 的錯誤修正、Swagger 外掛程式的改進與修正等。
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
一個針對 <code>2.2.0</code> 中 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 錯誤的修正版本。
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
一個包含多項功能的版本，包括 Swagger UI 代管、新的外掛程式 API、工作階段 (Sessions) 的多平台支援等。
如需更多資訊，請參閱 <Links href="/ktor/migration-to-22x" summary="undefined">從 2.0.x 遷移至 2.2.x</Links> 指南。
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
一個包含各種錯誤修正的修正版本。
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
一個包含路由、測試引擎與 Ktor 用戶端錯誤修正的修正版本。
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
一個包含 Ktor 用戶端與伺服器各種錯誤修正的修正版本。
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
一個次要版本，新增了對 YAML 配置的支援以及各種其他改進與錯誤修正。
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
一個包含錯誤修正並將 <code>kotlinx.coroutines</code> 版本升級至 <code>1.6.2</code> 的修正版本。
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
一個包含各種改進、錯誤修正以及相依性版本升級的修正版本。
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
一個包含各種錯誤修正並將 Kotlin 版本更新至 <code>1.6.21</code> 的修正版本。
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
一個包含更新的 API 文件與各種新功能的主要版本。如需關於破壞性變更以及如何從 <code>1.x.x</code> 遷移的更多資訊，請參閱 <Links href="/ktor/migration-to-20x" summary="undefined">遷移指南</Links>。
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
一個包含相依性版本升級的修正版本。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看變更記錄</a>
</p>
</td>
</tr>

</table>