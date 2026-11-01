[//]: # (title: Ktor 3.3.0 新功能)

<show-structure for="chapter,procedure" depth="2"/>

_[發佈日期：2025 年 9 月 11 日](releases.md#release-details)_

Ktor 3.3.0 在伺服器、用戶端及工具方面帶來了新功能。以下是此功能版本的重要亮點：

* [靜態資源的自訂備援機制](#custom-fallback)
* [OpenAPI 規格產生](#openapi-spec-gen)
* [HTTP/2 明文 (h2c) 支援](#http2-h2c-support)
* [實驗性 WebRTC 用戶端](#webrtc-client)

## Ktor 伺服器 {id="ktor-server"}

### 靜態資源的自訂備援 {id="custom-fallback"}

Ktor 3.3.0 為靜態內容引入了全新的 `fallback()` 函式，讓您能在找不到請求的資源時自訂處理行為。

與一律提供相同備援檔案的 `default()` 不同，`fallback()` 讓您可以存取原始請求路徑以及目前的 `ApplicationCall`。您可以使用它進行重新導向、傳回自訂狀態碼，或是動態提供不同的檔案。

若要定義自訂備援行為，請在 `staticFiles()`、`staticResources()`、`staticZip()` 或 `staticFileSystem()` 中使用 `fallback()` 函式：

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // absolute path
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // relative path
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 靜態內容的 LastModified 與 ETag 標頭 {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0 引入了對靜態資源 `ETag` 與 `LastModified` 標頭的支援。安裝 [`ConditionalHeaders`](server-conditional-headers.md) 外掛程式後，您可以處理條件式標頭，以避免在內容自上次請求以來未曾變更時傳送內容主體：

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

這些值會依據每個資源動態計算，並套用至回應中。

您也可以使用預定義的提供者，例如使用資源內容的 SHA‑256 雜湊來產生強 `ETag`：

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 開發模式自動重新載入的限制 {id="development-mode-auto-reload-limitations"}

在 Ktor 3.2.0 中，引入的[對 suspend 模組函式的支援](whats-new-320.md#suspendable-module-functions)導致了一個迴歸問題：使用阻塞式模組參照的應用程式無法正常執行自動重新載入。

此迴歸問題在 3.3.0 中依然存在，自動重新載入仍然僅適用於 `suspend` 函式模組與配置參照。

支援的模組宣告範例：

```kotlin
// 支援 — suspend 函式參照
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 支援 — 配置參照 (application.conf / application.yaml)
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

我們計劃在未來的版本中恢復對阻塞式函式參照的支援。在此之前，於 `development` 模式下請優先使用 `suspend` 模組或配置參照。

### HTTP/2 明文 (h2c) 支援 {id="http2-h2c-support"}

Ktor 3.3.0 為 Netty 引擎引入了對 HTTP/2 明文 (h2c) 的支援，允許在不使用 TLS 加密的情況下進行 HTTP/2 通訊。
此設定通常用於受信任的環境中，例如本機測試或內部私有網路。

若要啟用 h2c，請在引擎配置中將 `enableH2c` 旗標設為 true。
如需更多資訊，請參閱 [不含 TLS 的 HTTP/2](server-http2.md#http2-without-tls)。

## Ktor 用戶端 {id="ktor-client"}

### SSE 回應主體緩衝區 {id="sse-response-body-buffer"}

在此之前，由於重複取用 (double-consume) 的問題，在 SSE 發生錯誤後嘗試呼叫 `response.bodyAsText()` 會失敗。

Ktor 3.3.0 引入了可配置的診斷緩衝區，讓您可以擷取已處理的 SSE 資料以進行偵錯與錯誤處理。

您可以在安裝 [SSE 外掛程式](client-server-sent-events.topic)時進行全域緩衝區配置：

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

或是針對個別呼叫進行配置：

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

隨著 SSE 串流被取用，用戶端會在記憶體緩衝區中保留已處理資料的快照（無需從網路重新讀取）。如果發生錯誤，您可以安全地呼叫 `response?.bodyAsText()` 以用於記錄或診斷。

如需更多資訊，請參閱 [回應緩衝](client-server-sent-events.topic#response-buffering)。

### WebRTC 用戶端 {id="webrtc-client"}

此版本引入了實驗性 WebRTC 用戶端支援，適用於多平台專案中的點對點即時通訊。

WebRTC 可支援視訊通話、多人遊戲和協作工具等應用程式。在此版本中，您現在可以使用統一的 Kotlin API，在 JavaScript/Wasm 與 Android 目標之間建立對等連線並交換資料通道。未來的版本計劃支援其他目標，例如 iOS、JVM 桌面版以及 Native。

您可以透過為平台選擇引擎並提供配置來建立 `WebRtcClient`，就像建立 `HttpClient` 一樣：

<Tabs group="platform" id="create-webrtc-client">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
val jsClient = WebRtcClient(JsWebRtc) {
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val androidClient = WebRtcClient(AndroidWebRtc) {
    context = appContext // 必要：提供 Android context
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 相同配置，無需額外的 context
}
```

</TabItem>

<TabItem title="JVM" group-key="jvm">

```kotlin
val jvmClient = WebRtcClient(JvmWebRtc) {
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>
</Tabs>

建立完成後，用戶端可以使用互動式連線建立 (ICE) 來建立點對點連線。交涉完成後，對等端即可開啟資料通道並交換訊息。

```kotlin
val connection = client.createPeerConnection()

// 新增遠端 ICE 候選項（透過您的信令通道接收）
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 等待所有本機候選項收集完成
connection.awaitIceGatheringComplete()

// 監聽傳入的資料通道事件
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// 建立通道並傳送／接收訊息
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

如需有關用法和限制的詳細資訊，請參閱 [WebRTC 用戶端](client-webrtc.md)文件。

### 更新 OkHttp 版本 {id="updated-okhttp-version"}

在 Ktor 3.3.0 中，Ktor 用戶端的 `OkHttp` 引擎已升級為使用 OkHttp 5.1.0（先前為 4.12.0）。此主要版本升級可能會為直接與 OkHttp 互動的專案引入 API 變更。這類專案應驗證相容性。

### 統一的 OkHttp SSE 工作階段 {id="unified-okhttp-sse-session"}

OkHttp 引擎現在使用 Server-Sent Events (SSE) 的標準 API，取代了先前引入的 `OkHttpSSESession`。
此變更統一了所有用戶端引擎的 SSE 處理方式，並解決了 OkHttp 專用實作的限制。

## Gradle 外掛程式 {id="gradle-plugin"}

### OpenAPI 規格產生 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0 透過 Gradle 外掛程式與編譯器外掛程式引入了實驗性的 OpenAPI 產生功能。這讓您能夠在組建時期直接從應用程式程式碼產生 OpenAPI 規格。

它提供以下功能：
- 分析 Ktor 路由定義並合併巢狀路由、本機擴充與資源路徑。
- 剖析前面的 KDoc 註解以提供 OpenAPI 元資料，包含：
    - 路徑、查詢、標頭、cookie 和主體參數
    - 回應代碼與型別
    - 安全性、說明、棄用資訊以及外部文件連結
- 從 `call.receive()` 與 `call.respond()` 推論請求和回應主體。

#### 產生 OpenAPI 規格 {id="generate-the-openapi-specification"}

若要從您的 Ktor 路由與 KDoc 註解產生 OpenAPI 規格檔案，請使用以下指令：

```shell
./gradlew buildOpenApi
```

#### 提供規格內容服務 {id="serve-the-specification"}

若要讓產生的規格在執行時期可用，您可以使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 外掛程式。

以下範例在 OpenAPI 端點提供產生的規格檔案：

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

如需有關此功能的更多詳細資訊，請參閱 [OpenAPI 規格產生](openapi-spec-generation.md)。

## 共用 {id="shared"}

### 更新 Jetty 版本 {id="updated-jetty-version"}

Jetty 伺服器與用戶端引擎已升級為使用 Jetty 12。對於大多數應用程式而言，此升級完全向下相容，但用戶端與伺服器程式碼現在會在內部利用已更新的 Jetty API。

如果您的專案直接使用 Jetty API，請注意這會帶來破壞性變更。如需更多詳細資訊，請參閱 [Jetty 官方遷移指南](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html)。