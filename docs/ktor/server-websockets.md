[//]: # (title: Ktor Server 中的 WebSockets)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="WebSockets"/>
<var name="package_name" value="io.ktor.server.websocket"/>
<var name="artifact_name" value="ktor-server-websockets"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="server-websockets"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
WebSockets 插件允许您在服务器和客户端之间创建多路通信会话。
</link-summary>

<snippet id="websockets-description">

WebSocket 是一种协议，它通过单个 TCP 连接在用户的浏览器和服务器之间提供全双工通信会话。它对于创建需要与服务器进行实时数据传输的应用特别有用。

Ktor 在服务器端和客户端都支持 WebSocket 协议。

</snippet>

Ktor 允许您：

* 配置基础 WebSocket 设置，例如帧大小、ping 周期等。
* 处理用于在服务器和客户端之间交换消息的 WebSocket 会话。
* 添加 WebSocket 扩展。例如，您可以使用 [Deflate](server-websocket-deflate.md) 扩展或实现 [自定义扩展](server-websocket-extensions.md)。

> 要了解客户端的 WebSocket 支持，请参阅 [WebSockets 客户端插件](client-websockets.topic)。

> 对于单向通信会话，请考虑使用 [服务器发送事件 (SSE)](server-server-sent-events.topic)。在服务器需要向客户端发送基于事件的更新时，SSE 特别有用。
>
{style="note"}

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
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

## 安装 WebSockets {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件安装到应用，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。
    下面的代码片段显示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（<code>Application</code> 类的扩展函数）内部。
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

或者，您可以通过传递 [WebSocketOptions](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-web-sockets/-web-socket-options/index.html) 在 `install` 代码块内配置插件：

* 使用 `pingPeriod` 属性指定 ping 之间的时间间隔。
* 使用 `timeout` 属性设置连接关闭前的超时时间。
* 使用 `maxFrameSize` 属性设置可以接收或发送的最大帧。
* 使用 `masking` 属性指定是否启用掩码。
* 使用 `contentConverter` 属性设置序列化/反序列化的转换器。

```kotlin
install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    maxFrameSize = Long.MAX_VALUE
    masking = false
}
```

## 处理 WebSockets 会话 {id="handle-sessions"}

### API 概览 {id="api-overview"}

安装并配置 `WebSockets` 插件后，您可以定义一个端点来处理 WebSocket 会话。要在服务器上定义 WebSocket 端点，请在 [routing](server-routing.md#define_route) 代码块中调用 `webSocket` 函数：

```kotlin
routing { 
    webSocket("/echo") {
       // 处理 WebSocket 会话
    }
}
```

在此示例中，当使用 [默认配置](server-configuration-file.topic) 时，服务器接受指向 `ws://localhost:8080/echo` 的 WebSocket 请求。

在 `webSocket` 代码块中，您可以定义 WebSocket 会话的处理程序，该会话由 [DefaultWebSocketServerSession](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-default-web-socket-server-session/index.html) 类表示。
代码块中提供以下函数和属性：

* 使用 `send` 函数向客户端发送文本内容。
* 使用 `incoming` 和 `outgoing` 属性访问用于接收和发送 WebSocket 帧的通道。帧由 `Frame` 类表示。
* 使用 `close` 函数发送带有指定原因的关闭帧。

在处理会话时，您可以检查帧类型，例如：

* `Frame.Text` 是文本帧。对于此帧类型，您可以使用 `Frame.Text.readText()` 读取其内容。
* `Frame.Binary` 是二进制帧。对于此类型，您可以使用 `Frame.Binary.readBytes()` 读取其内容。

> 请注意，`incoming` 通道不包含控制帧，例如 ping/pong 或关闭帧。
> 要处理控制帧并重组分段帧，请使用 [webSocketRaw](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/web-socket-raw.html) 函数来处理 WebSocket 会话。
>
{style="note"}

> 要获取有关客户端的信息（例如客户端的 IP 地址），请使用 `call` 属性。详细了解 [常规请求信息](server-requests.md#request_information)。

下面，我们将查看使用此 API 的示例。

### 示例：处理单个会话 {id="handle-single-session"}

下面的示例展示了如何创建 `echo` WebSocket 端点以处理与一个客户端的会话：

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

有关完整示例，请参阅 [server-websockets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets)。

### 示例：处理多个会话 {id="handle-multiple-session"}

为了高效地管理多个 WebSocket 会话并处理广播，您可以利用 Kotlin 的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)。
这种方法为管理 WebSocket 通信提供了一种可扩展且并发友好的方法。以下是实现此模式的方法：

1. 定义用于广播消息的 `SharedFlow`：

```kotlin
val messageResponseFlow = MutableSharedFlow<MessageResponse>()
val sharedFlow = messageResponseFlow.asSharedFlow()
```

2. 在您的 WebSocket 路由中，实现广播和消息处理逻辑：

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

`runCatching` 代码块处理传入消息并将其发送到 `SharedFlow`，然后由其广播给所有收集器。

通过使用此模式，您可以高效地管理多个 WebSocket 会话，而无需手动跟踪单个连接。这种方法非常适合具有许多并发 WebSocket 连接的应用，并提供了一种干净、响应式的方式来处理消息广播。

有关完整示例，请参阅 [server-websockets-sharedflow](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets-sharedflow)。

## WebSocket API 与 Ktor {id="websocket-api"}

来自 [WebSocket API 的标准事件](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 以以下方式映射到 Ktor：

* `onConnect` 发生在代码块开始处。
* `onMessage` 发生在成功读取消息（例如，使用 `incoming.receive()`）或使用挂起迭代 `for(frame in incoming)` 之后。
* `onClose` 发生在 `incoming` 通道关闭时。这将完成挂起迭代，或者在尝试接收消息时抛出 `ClosedReceiveChannelException`。
* `onError` 等同于其他异常。

在 `onClose` 和 `onError` 中，都会设置 `closeReason` 属性。

在以下示例中，仅当抛出异常（`ClosedReceiveChannelException` 或其他异常）时，才会退出无限循环：

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