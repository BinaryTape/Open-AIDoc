[//]: # (title: Ktor 3.3.0 新功能)

<show-structure for="chapter,procedure" depth="2"/>

_[發佈日期：2025 年 9 月 11 日](releases.md#release-details)_

Ktor 3.3.0 在伺服器、用戶端及工具方面帶來了新功能。以下是此功能版本的重點摘要：

* [靜態資源的自訂備援機制](#custom-fallback)
* [OpenAPI 規格產生](#openapi-spec-gen)
* [HTTP/2 明文 (h2c) 支援](#http2-h2c-support)
* [實驗性 WebRTC 用戶端](#webrtc-client)

## Ktor Server {id="ktor-server"}

### 靜態資源的自訂備援 {id="custom-fallback"}

Ktor 3.3.0 為靜態內容引入了新的 `fallback()` 函式，允許您在找不到請求的資源時定義自訂行為。

與總是提供相同備援檔案的 `default()` 不同，`fallback()` 讓您可以存取原始請求的路徑和目前的 `ApplicationCall`。您可以使用它來進行重定向、傳回自訂狀態碼或動態提供不同的檔案。

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

### 靜態內容的 LastModified 與 Etag 標頭 {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0 引入了對靜態資源的 `ETag` 與 `LastModified` 標頭的支援。當安裝了 [`ConditionalHeaders`](server-conditional-headers.md) 外掛程式時，您可以處理條件式標頭，以避免在內容自上次請求後未變更的情況下發送內容主體：

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

這些值會根據每個資源動態計算並套用於回應。

您也可以使用預定義的提供者，例如使用資源內容的 SHA‑256 雜湊產生強 `ETag`：

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 開發模式自動重新載入限制 {id="development-mode-auto-reload-limitations"}

在 Ktor 3.2.0 中，引入的 [suspend 模組函式支援](whats-new-320.md#suspendable-module-functions) 導致了一個回歸問題，即在使用阻塞模組參照的應用程式中，自動重新載入停止運作。

此回歸在 3.3.0 中仍然存在，自動重新載入僅在使用 `suspend` 函式模組與配置參照時能繼續運作。

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

我們計劃在未來的版本中恢復對阻塞函式參照的支援。在此之前，請在 `development` 模式下優先使用 `suspend` 模組或配置參照。

### HTTP/2 明文 (h2c) 支援 {id="http2-h2c-support"}

Ktor 3.3.0 為 Netty 引擎引入了 HTTP/2 明文 (h2c) 支援，這允許在沒有 TLS 加密的情況下進行 HTTP/2 通訊。
這種設定通常用於受信任的環境，例如本機測試或私有網路。

若要啟用 h2c，請在引擎配置中將 `enableH2c` 旗標設為 true。
如需更多資訊，請參閱 [不含 TLS 的 HTTP/2](server-http2.md#http2-without-tls)。

## Ktor Client {id="ktor-client"}

### SSE 回應主體緩衝區 {id="sse-response-body-buffer"}

到目前為止，在 SSE 錯誤發生後嘗試呼叫 `response.bodyAsText()` 會因為重複消耗問題而失敗。

Ktor 3.3.0 引入了一個可配置的診斷緩衝區，允許您擷取已處理的 SSE 資料以進行偵錯和錯誤處理。

您可以在安裝 [SSE 外掛程式](client-server-sent-events.topic) 時全域配置緩衝區：

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

或者針對每次呼叫進行配置：

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

當 SSE 串流被消耗時，用戶端會在記憶體緩衝區中維護已處理資料的快照（無需重新從網路讀取）。如果發生錯誤，您可以安全地呼叫 `response?.bodyAsText()` 以進行記錄或診斷。

如需更多資訊，請參閱 [回應緩衝](client-server-sent-events.topic#response-buffering)。

### WebRTC 用戶端 {id="webrtc-client"}

此版本為多平台專案引入了用於點對點即時通訊的實驗性 WebRTC 用戶端支援。

WebRTC 支援視訊通話、多人遊戲和協作工具等應用程式。透過此版本，您現在可以使用統一的 Kotlin API 在 JavaScript/Wasm 和 Android 目標平台上建立對等連線並交換資料通道。我們計劃在未來的版本中增加 iOS、JVM 桌面和 Native 等目標平台。

您可以透過為您的平台選擇引擎並提供配置來建立 `WebRtcClient`，類似於 `HttpClient`：

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
    context = appContext // 必填：提供 Android context
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 相同的配置，不需要額外的 context
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

建立後，用戶端可以使用互動式連接建立 (ICE) 來建立點對點連線。協商完成後，對等方可以開啟資料通道並交換訊息。

```kotlin
val connection = client.createPeerConnection()

// 新增遠端 ICE 候選對象（透過您的信令通道接收）
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 等待所有本機候選對象收集完成
connection.awaitIceGatheringComplete()

// 監聽傳入的資料通道事件
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// 建立通道並發送/接收訊息
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

如需有關用法和限制的更多詳細資訊，請參閱 [WebRTC 用戶端](client-webrtc.md)文件。

### 更新的 OkHttp 版本 {id="updated-okhttp-version"}

在 Ktor 3.3.0 中，Ktor 用戶端的 `OkHttp` 引擎已升級為使用 OkHttp 5.1.0（先前為 4.12.0）。此次主要版本提升可能會為直接與 OkHttp 互動的專案引入 API 變更。此類專案應驗證相容性。

### 統一的 OkHttp SSE 工作階段 {id="unified-okhttp-sse-session"}

OkHttp 引擎現在使用標準的 Server-Sent Events (SSE) API，取代了先前引入的 `OkHttpSSESession`。
此變更統一了所有用戶端引擎的 SSE 處理，並解決了 OkHttp 特定實作的限制。

## Gradle 外掛程式 {id="gradle-plugin"}

### OpenAPI 規格產生 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0 透過 Gradle 外掛程式和編譯器外掛程式引入了實驗性的 OpenAPI 產生功能。這允許您在組建時直接從應用程式程式碼產生 OpenAPI 規格。

它提供以下功能：
- 分析 Ktor 路由定義並合併巢狀路由、區域擴充套件和資源路徑。
- 剖析先前的 KDoc 註解以提供 OpenAPI 元資料，包括：
    - 路徑、查詢、標頭、Cookie 和主體參數
    - 回應代碼和類型
    - 安全性、描述、棄用和外部文件連結
- 從 `call.receive()` 和 `call.respond()` 推斷請求和回應主體。

#### 產生 OpenAPI 規格 {id="generate-the-openapi-specification"}

若要從您的 Ktor 路由和 KDoc 註解產生 OpenAPI 規格檔案，請使用以下指令：

```shell
./gradlew buildOpenApi
```

#### 提供規格服務 {id="serve-the-specification"}

若要在執行時提供產生的規格，您可以使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 外掛程式。

以下範例在 OpenAPI 端點提供產生的規格檔案：

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

如需有關此功能的更多詳細資訊，請參閱 [OpenAPI 規格產生](openapi-spec-generation.md)。

## 共用 {id="shared"}

### 更新的 Jetty 版本 {id="updated-jetty-version"}

Jetty 伺服器和用戶端引擎已升級為使用 Jetty 12。對於大多數應用程式，此升級完全向下相容，但用戶端和伺服器程式碼現在在內部利用更新的 Jetty API。

如果您的專案直接使用 Jetty API，請注意存在中斷性變更。如需更多詳細資訊，請參閱 [Jetty 官方遷移指南](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html)。