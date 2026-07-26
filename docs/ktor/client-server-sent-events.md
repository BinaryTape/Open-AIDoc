<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-server-sent-events" title="Ktor Client 中的 Server-Sent Events" help-id="sse_client">
    <show-structure for="chapter" depth="2"/>
    <primary-label ref="client-plugin"/>
    <tldr>
        <var name="example_name" value="client-sse"/>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        SSE 插件允许客户端通过 HTTP 连接接收来自服务器的基于事件的更新。
    </link-summary>
    <p>
        Server-Sent Events (SSE) 是一项允许服务器通过 HTTP 连接持续向客户端推送事件的技术。它在服务器需要发送基于事件的更新而无需客户端反复轮询服务器的情况下特别有用。
    </p>
    <p>
        Ktor 支持的 SSE 插件提供了一种在服务器和客户端之间创建单向连接的简便方法。
    </p>
    <tip>
        <p>要了解更多关于服务器端支持的 SSE 插件的信息，请参阅
            <Links href="//server-server-sent-events" summary="SSE 插件允许服务器通过 HTTP 连接向客户端发送基于事件的更新。">SSE 服务器插件</Links>。
        </p>
    </tip>
    <chapter title="添加依赖项" id="add_dependencies">
        <p>
            <code>SSE</code> 仅需要 <Links href="//client-dependencies" summary="了解如何向现有项目添加客户端依赖项。">ktor-client-core</Links> 构件，不需要任何特定的依赖项。
        </p>
    </chapter>
    <chapter title="安装 SSE" id="install_plugin">
        <p>
            要安装 <code>SSE</code> 插件，请在 <a href="#configure-client">客户端配置块</a> 内将其传递给 <code>install</code> 函数：
        </p>
        <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
    </chapter>
    <chapter title="配置 SSE 插件" id="configure">
        <p>
            您可以选择在 <code>install</code> 块中通过设置 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a> 类支持的属性来配置 SSE 插件。
        </p>
        <chapter title="SSE 重连" id="sse-reconnect">
            <p>
                要启用自动重连，请将 <code>maxReconnectionAttempts</code> 设置为大于 <code>0</code> 的值。您还可以使用 <code>reconnectionTime</code> 配置尝试之间的延迟：
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
            <p>
                如果与服务器的连接丢失，客户端将在尝试重连之前等待指定的 <code>reconnectionTime</code>。它将尝试最多 <code>maxReconnectionAttempts</code> 次来重新建立连接。
            </p>
        </chapter>
        <chapter title="过滤事件" id="filter-events">
            <p>
                在以下示例中，SSE 插件安装到 HTTP 客户端，并配置为在传入流中包含仅包含注释的事件以及仅包含 <code>retry</code> 字段的事件：
            </p>
            <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
        </chapter>
        <chapter title="响应缓冲" id="response-buffering">
            <p>
                SSE 响应本质上是流式的，这使得捕获完整正文变得不切实际。您可以启用诊断缓冲区，以便在 SSE 流失败时安全地检索响应正文。缓冲区仅包含已处理的数据（不会从网络重新读取），旨在用于失败情况下的日志记录和错误分析。
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    bufferPolicy = SSEBufferPolicy.LastEvents(10)&#10;                }"/>
            <p>
                您还可以按调用配置缓冲区：
            </p>
            <code-block lang="kotlin" code="                client.sse(url, {&#10;                    bufferPolicy(SSEBufferPolicy.All)&#10;                }) {&#10;                    // ...&#10;                }"/>
            <chapter title="缓冲策略" id="buffer-policies">
                <p>
                    <code>SSEBufferPolicy</code> 类型提供了几种存储已处理 SSE 数据的策略。这些策略控制内存中保留多少流数据，并在发生错误时使其可用。
                </p>
                <deflist>
                    <def id="buffer-off">
                        <title><code>Off</code>（默认）</title>
                        不缓冲。
                    </def>
                    <def id="buffer-lastlines">
                        <title><code>LastLines(n)</code></title>
                        保留最后 n 行。
                    </def>
                    <def id="buffer-lastevent">
                        <title><code>LastEvent</code></title>
                        保留最后一个完成的 SSE 事件。
                    </def>
                    <def id="buffer-lastevents">
                        <title><code>LastEvents(n)</code></title>
                        保留最后 n 个完成的 SSE 事件。
                    </def>
                    <def id="buffer-all">
                        <title><code>All</code></title>
                        保留到目前为止所有已处理的事件。
                        <note>对于长期存续的流，请谨慎使用。</note>
                    </def>
                </deflist>
                <p>
                    失败时，您可以使用 <code>response?.bodyAsText()</code> 访问缓冲区，而无需从网络重新读取。
                </p>
            </chapter>
        </chapter>
    </chapter>
    <chapter title="处理 SSE 会话" id="handle-sse-sessions">
        <p>
            客户端的 SSE 会话由 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a> 接口表示。该接口公开了允许您接收来自服务器的服务器发送事件的 API。
        </p>
        <chapter title="访问 SSE 会话" id="access-sse-session">
            <p><code>HttpClient</code> 允许您通过以下方式之一访问 SSE 会话：</p>
            <list>
                <li>
                    <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse.html"><code>sse()</code></a> 函数创建 SSE 会话并允许您对其执行操作。
                </li>
                <li>
                    <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html"><code>sseSession()</code></a> 函数允许您打开一个 SSE 会话。
                </li>
            </list>
            <p>要指定 URL 端点，您可以从两个选项中进行选择：</p>
            <list>
                <li>使用 <code>urlString</code> 形参将整个 URL 指定为字符串。</li>
                <li>分别使用 <code>schema</code>、<code>host</code>、<code>port</code> 和 <code>path</code> 形参来指定协议方案、域名、端口号和路径名。</li>
            </list>
            <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
            <note>
                <code>ClientSSESession</code> 和 <code>ClientSSESessionWithDeserialization</code> 实例仅在会话期间有效。当 <code>serverSentEvents { ... }</code> 块完成或连接关闭时，它们的作用域会自动取消。
            </note>
            <p>此外，还有以下形参可用于配置连接：</p>
            <deflist>
                <def id="reconnectionTime-param">
                    <title><code>reconnectionTime</code></title>
                    设置重连延迟。
                </def>
                <def id="showCommentEvents-param">
                    <title><code>showCommentEvents</code></title>
                    指定是否在传入流中显示仅包含注释的事件。
                </def>
                <def id="showRetryEvents-param">
                    <title><code>showRetryEvents</code></title>
                    指定是否在传入流中显示仅包含 <code>retry</code> 字段的事件。
                </def>
                <def id="deserialize-param">
                    <title><code>deserialize</code></title>
                    一个反序列化函数，用于将 <code>TypedServerSentEvent</code> 的 <code>data</code> 字段转换为对象。更多信息请参阅 <a href="#deserialization">反序列化</a>。
                </def>
            </deflist>
        </chapter>
        <chapter title="SSE 会话块" id="sse-session-block">
            <p>
                在 lambda 实参中，您可以访问 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a> 上下文。该块中提供以下属性：
            </p>
            <deflist>
                <def id="call">
                    <title><code>call</code></title>
                    发起会话的相关 <code>HttpClientCall</code>。
                </def>
                <def id="incoming">
                    <title><code>incoming</code></title>
                    传入的服务器发送事件流。
                </def>
            </deflist>
            <p>
                下面的示例创建了一个具有 <code>events</code> 端点的新 SSE 会话，通过 <code>incoming</code> 属性读取事件并打印接收到的 <a href="https://api.ktor.io/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a>。
            </p>
            <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>有关完整示例，请参阅 <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>。</p>
        </chapter>
        <chapter title="反序列化" id="deserialization">
            <p>
                SSE 插件支持将服务器发送事件反序列化为类型安全的 Kotlin 对象。当处理来自服务器的结构化数据时，此功能特别有用。
            </p>
            <p>
                要启用反序列化，请在 SSE 访问函数上使用 <code>deserialize</code> 形参提供自定义反序列化函数，并使用 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html"><code>ClientSSESessionWithDeserialization</code></a> 类来处理反序列化后的事件。
            </p>
            <p>
                以下是使用 <code>kotlinx.serialization</code> 反序列化 JSON 数据的示例：
            </p>
            <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
            <p>有关完整示例，请参阅 <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>。</p>
        </chapter>
    </chapter>
</topic>