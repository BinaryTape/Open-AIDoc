[//]: # (title: Ktor 3.3.0 最新变化)

<show-structure for="chapter,procedure" depth="2"/>

_[发布日期：2025 年 9 月 11 日](releases.md#release-details)_

Ktor 3.3.0 在服务器、客户端和工具方面提供了新功能。以下是此功能版本的亮点：

* [静态资源的自定义回退机制](#custom-fallback)
* [OpenAPI 规范生成](#openapi-spec-gen)
* [HTTP/2 明文 (h2c) 支持](#http2-h2c-support)
* [实验性 WebRTC 客户端](#webrtc-client)

## Ktor Server {id="ktor-server"}

### 静态资源的自定义回退 {id="custom-fallback"}

Ktor 3.3.0 为静态内容引入了一个新的 `fallback()` 函数，允许你在未找到请求的资源时定义自定义行为。

与始终提供相同回退文件的 `default()` 不同，`fallback()` 允许你访问原始请求路径和当前的 `ApplicationCall`。你可以使用它进行重定向、返回自定义状态码或动态提供不同的文件。

要定义自定义回退行为，请在 `staticFiles()`、`staticResources()`、`staticZip()` 或 `staticFileSystem()` 中使用 `fallback()` 函数：

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 绝对路径
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 相对路径
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 静态内容的 LastModified 和 Etag 标头 {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0 引入了对静态资源的 `ETag` 和 `LastModified` 标头的支持。当安装了 [`ConditionalHeaders`](server-conditional-headers.md) 插件时，你可以处理条件标头，以避免在内容自上次请求以来未发生变化时发送内容正文：

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

这些值根据每个资源动态计算并应用于响应。

你还可以使用预定义的提供程序，例如使用资源内容的 SHA‑256 哈希生成强 `ETag`：

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 开发模式自动重载限制 {id="development-mode-auto-reload-limitations"}

在 Ktor 3.2.0 中，引入的 [对 suspend 模块函数的支持](whats-new-320.md#suspendable-module-functions) 导致了一个回归问题，即对于使用阻塞式模块引用的应用程序，自动重载停止工作。

此回归问题在 3.3.0 中仍然存在，自动重载仅适用于 `suspend` 函数模块和配置引用。

受支持的模块声明示例：

```kotlin
// 受支持 — suspend 函数引用
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 受支持 — 配置引用 (application.conf / application.yaml)
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

我们计划在未来的版本中恢复对阻塞式函数引用的支持。在此之前，在 `development` 模式下请优先使用 `suspend` 模块或配置引用。

### HTTP/2 明文 (h2c) 支持 {id="http2-h2c-support"}

Ktor 3.3.0 为 Netty 引擎引入了对基于明文的 HTTP/2 (h2c) 的支持，这允许在没有 TLS 加密的情况下进行 HTTP/2 通信。
这种设置通常用于受信任的环境，例如本地测试或私有网络。

要启用 h2c，请在引擎配置中将 `enableH2c` 标志设置为 true。
有关更多信息，请参阅 [不带 TLS 的 HTTP/2](server-http2.md#http2-without-tls)。

## Ktor Client {id="ktor-client"}

### SSE 响应体缓冲区 {id="sse-response-body-buffer"}

直到现在，在 SSE 错误后尝试调用 `response.bodyAsText()` 会因为二次消耗问题而失败。

Ktor 3.3.0 引入了一个可配置的诊断缓冲区，允许你捕获已处理的 SSE 数据，以便进行调试和错误处理。

你可以在安装 [SSE 插件](client-server-sent-events.topic) 时全局配置缓冲区：

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

或者针对每次调用进行配置：

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

随着 SSE 流被消耗，客户端会在内存缓冲区中维护已处理数据的快照（无需从网络重新读取）。如果发生错误，你可以安全地调用 `response?.bodyAsText()` 用于日志记录或诊断。

有关更多信息，请参阅 [响应缓冲](client-server-sent-events.topic#response-buffering)。

### WebRTC 客户端 {id="webrtc-client"}

此版本为多平台项目中的点对点实时通信引入了实验性 WebRTC 客户端支持。

WebRTC 支持视频通话、多人游戏和协作工具等应用程序。通过此版本，你现在可以使用统一的 Kotlin API 在 JavaScript/Wasm 和 Android 目标上建立对等连接并交换数据通道。计划在未来版本中支持 iOS、JVM 桌面和 Native 等其他目标。

你可以通过选择适合你平台的引擎并提供配置来创建 `WebRtcClient`，类似于 `HttpClient`：

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
    context = appContext // 必需：提供 Android context
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 同样的配置，不需要额外的 context
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

创建后，客户端可以使用交互式连接建立 (ICE) 建立点对点连接。协商完成后，对等点可以打开数据通道并交换消息。

```kotlin
val connection = client.createPeerConnection()

// 添加远程 ICE 候选者（通过你的信令通道接收）
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// 等待所有本地候选者收集完成
connection.awaitIceGatheringComplete()

// 侦听传入的数据通道事件
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// 创建一个通道并发送/接收消息
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

有关用法和限制的更多详细信息，请参阅 [WebRTC 客户端](client-webrtc.md) 文档。

### 更新的 OkHttp 版本 {id="updated-okhttp-version"}

在 Ktor 3.3.0 中，Ktor 客户端的 `OkHttp` 引擎已升级为使用 OkHttp 5.1.0（此前为 4.12.0）。这一主要版本号的提升可能会为直接与 OkHttp 交互的项目引入 API 变化。此类项目应验证兼容性。

### 统一的 OkHttp SSE 会话 {id="unified-okhttp-sse-session"}

OkHttp 引擎现在使用标准的 Server-Sent Events (SSE) API，取代了之前引入的 `OkHttpSSESession`。这一变化统一了所有客户端引擎的 SSE 处理方式，并解决了 OkHttp 特定实现中的局限性。

## Gradle 插件 {id="gradle-plugin"}

### OpenAPI 规范生成 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0 通过 Gradle 插件和编译器插件引入了实验性的 OpenAPI 生成功能。这允许你在构建时直接从应用程序代码生成 OpenAPI 规范。

它提供以下功能：
- 分析 Ktor 路由定义并合并嵌套路由、本地扩展程序和资源路径。
- 解析前面的 KDoc 注解以提供 OpenAPI 元数据，包括：
    - 路径、查询、标头、Cookie 和正文参数
    - 响应代码和类型
    - 安全性、描述、弃用和外部文档链接
- 从 `call.receive()` 和 `call.respond()` 推断请求和响应体。

#### 生成 OpenAPI 规范 {id="generate-the-openapi-specification"}

要从你的 Ktor 路由和 KDoc 注解生成 OpenAPI 规范文件，请使用以下命令：

```shell
./gradlew buildOpenApi
```

#### 提供规范服务 {id="serve-the-specification"}

要使生成的规范在运行时可用，你可以使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 插件。

以下示例在 OpenAPI 端点提供生成的规范文件：

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

有关此功能的更多详细信息，请参阅 [OpenAPI 规范生成](openapi-spec-generation.md)。

## 共享 {id="shared"}

### 更新的 Jetty 版本 {id="updated-jetty-version"}

Jetty 服务器和客户端引擎已升级为使用 Jetty 12。对于大多数应用程序，此升级完全向后兼容，但客户端和服务器代码现在在内部利用更新的 Jetty API。

如果你的项目直接使用 Jetty API，请注意存在破坏性更改。有关更多详细信息，请参考 [Jetty 官方迁移指南](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html)。