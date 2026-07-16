[//]: # (title: Ktor Server 中的 WebSockets)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="WebSockets"/>
<var name="package_name" value="io.ktor.server.websocket"/>
<var name="artifact_name" value="ktor-server-websockets"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="server-websockets"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
WebSockets 外掛程式可讓您在伺服器與用戶端之間建立多向通訊工作階段。
</link-summary>

<snippet id="websockets-description">

WebSocket 是一種協定，可透過單一 TCP 連線在使用者瀏覽器與伺服器之間提供全雙工通訊工作階段。它對於建立需要與伺服器進行即時資料傳輸的應用程式特別有用。

Ktor 在伺服器端與用戶端均支援 WebSocket 協定。

</snippet>

Ktor 允許您：

* 配置基本的 WebSocket 設定，例如框架大小、ping 週期等等。
* 處理 WebSocket 工作階段，以便在伺服器與用戶端之間交換訊息。
* 新增 WebSocket 擴充套件。例如，您可以使用 [Deflate](server-websocket-deflate.md) 擴充套件或實作 [自訂擴充套件](server-websocket-extensions.md)。

> 若要了解用戶端的 WebSocket 支援，請參閱 [WebSockets 用戶端外掛程式](client-websockets.topic)。

> 對於單向通訊工作階段，請考慮使用 [Server-Sent Events (SSE)](server-server-sent-events.topic)。當伺服器需要向用戶端傳送基於事件的更新時，SSE 特別有用。
>
{style="note"}

## 新增相依性 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## 安裝 WebSockets {id="install_plugin"}

<p>
    要將 <code>%plugin_name%</code> 外掛程式安裝到應用程式，請將其傳遞給指定 <Links href="/ktor/server-modules" summary="模組允許您透過對路由進行分組來建構應用程式。">模組</Links> 中的 <code>install</code> 函式。
    下方的程式碼片段顯示如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫中。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 中，該模組是 <code>Application</code> 類別的擴充函式。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## 配置 WebSockets {id="configure"}

（選用）您可以透過傳遞 [WebSocketOptions](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-web-sockets/-web-socket-options/index.html) 在 `install` 區塊內配置外掛程式：

* 使用 `pingPeriod` 屬性指定 ping 之間的時間間隔。
* 使用 `timeout` 屬性設定連線關閉前的逾時時間。
* 使用 `maxFrameSize` 屬性設定可接收或傳送的最大框架（Frame）大小。
* 使用 `masking` 屬性指定是否啟用遮罩。
* 使用 `contentConverter` 屬性設定用於序列化/反序列化的轉換器。

```kotlin
install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    maxFrameSize = Long.MAX_VALUE
    masking = false
}
```

## 處理 WebSockets 工作階段 {id="handle-sessions"}

### API 總覽 {id="api-overview"}

安裝並配置 `WebSockets` 外掛程式後，您可以定義一個端點來處理 WebSocket 工作階段。要在伺服器上定義 WebSocket 端點，請在 [routing](server-routing.md#define_route) 區塊內呼叫 `webSocket` 函式：

```kotlin
routing { 
    webSocket("/echo") {
       // 處理 WebSocket 工作階段
    }
}
```

在此範例中，當使用 [預設配置](server-configuration-file.topic) 時，伺服器會接受發送至 `ws://localhost:8080/echo` 的 WebSocket 請求。

在 `webSocket` 區塊內，您定義 WebSocket 工作階段的處理常式，該工作階段由 [DefaultWebSocketServerSession](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-default-web-socket-server-session/index.html) 類別表示。
區塊內提供以下函式和屬性：

* 使用 `send` 函式向用戶端傳送文字內容。
* 使用 `incoming` 和 `outgoing` 屬性來存取用於接收和傳送 WebSocket 框架的通道。框架由 `Frame` 類別表示。
* 使用 `close` 函式傳送帶有指定原因的關閉框架。

處理工作階段時，您可以檢查框架類型，例如：

* `Frame.Text` 是文字框架。對於此框架類型，您可以使用 `Frame.Text.readText()` 讀取其內容。
* `Frame.Binary` 是二進制框架。對於此類型，您可以使用 `Frame.Binary.readBytes()` 讀取其內容。

> 請注意，`incoming` 通道不包含控制框架，例如 ping/pong 或關閉框架。
> 要處理控制框架並重新組裝分段框架，請使用 [webSocketRaw](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/web-socket-raw.html) 函式來處理 WebSocket 工作階段。
>
{style="note"}

> 要獲取有關用戶端的資訊（例如用戶端的 IP 地址），請使用 `call` 屬性。了解 [一般請求資訊](server-requests.md#request_information)。

下面，我們將看看使用此 API 的範例。

### 範例：處理單一工作階段 {id="handle-single-session"}

下方的範例顯示如何建立 `echo` WebSocket 端點來處理與單一用戶端的工作階段：

```kotlin
routing {
    webSocket("/echo") {
        send("Please enter your name")
        for (frame in incoming) {
            frame as? Frame.Text ?: continue
            val receivedText = frame.readText()
            if (receivedText.equals("bye", ignoreCase = true)) {
                close(CloseReason(CloseReason.Codes.NORMAL, "Client said BYE"))
            } else {
                send(Frame.Text("Hi, $receivedText!"))
            }
        }
    }
}
```

如需完整範例，請參閱 [server-websockets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets)。

### 範例：處理多個工作階段 {id="handle-multiple-session"}

為了有效地管理多個 WebSocket 工作階段並處理廣播，您可以利用 Kotlin 的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)。這種方法為管理 WebSocket 通訊提供了一種可擴展且並行友善的方法。以下是實作此模式的方法：

1. 定義一個用於廣播訊息的 `SharedFlow`：

```kotlin
val messageResponseFlow = MutableSharedFlow<MessageResponse>()
val sharedFlow = messageResponseFlow.asSharedFlow()
```

2. 在您的 WebSocket 路由中，實作廣播和訊息處理邏輯：

```kotlin

        webSocket("/ws") {
            send("You are connected to WebSocket!")

            val job = launch {
                sharedFlow.collect { message ->
                    send(message.message)
                }
            }

            runCatching {
                incoming.consumeEach { frame ->
                    if (frame is Frame.Text) {
                        val receivedText = frame.readText()
                        val messageResponse = MessageResponse(receivedText)
                        messageResponseFlow.emit(messageResponse)
                    }
                }
            }.onFailure { exception ->
                println("WebSocket exception: ${exception.localizedMessage}")
            }.also {
                job.cancel()
            }
        }
```

`runCatching` 區塊處理傳入訊息並將其發射到 `SharedFlow`，然後由 `SharedFlow` 廣播給所有收集者。

透過使用此模式，您可以有效地管理多個 WebSocket 工作階段，而無需手動追蹤個別連線。這種方法非常適合具有許多並行 WebSocket 連線的應用程式，並提供了一種乾淨、反應式的方法來處理訊息廣播。

如需完整範例，請參閱 [server-websockets-sharedflow](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets-sharedflow)。

## WebSocket API 與 Ktor {id="websocket-api"}

來自 [WebSocket API 的標準事件](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 以以下方式對應到 Ktor：

* `onConnect` 發生在區塊的開頭。
* `onMessage` 發生在成功讀取訊息（例如透過 `incoming.receive()`）或使用暫停的反覆運算（suspended iteration）與 `for(frame in incoming)` 之後。
* `onClose` 發生在 `incoming` 通道關閉時。這會完成暫停的反覆運算，或在嘗試接收訊息時拋出 `ClosedReceiveChannelException`。
* `onError` 等同於其他例外。

在 `onClose` 和 `onError` 中，都會設定 `closeReason` 屬性。

在以下範例中，只有在引發例外（`ClosedReceiveChannelException` 或其他例外）時才會退出無窮迴圈：

```kotlin
webSocket("/echo") {
    println("onConnect")
    try {
        for (frame in incoming){
            val text = (frame as Frame.Text).readText()
            println("onMessage")
            received += text
            outgoing.send(Frame.Text(text))
        }
    } catch (e: ClosedReceiveChannelException) {
        println("onClose ${closeReason.await()}")
    } catch (e: Throwable) {
        println("onError ${closeReason.await()}")
        e.printStackTrace()
    }
}