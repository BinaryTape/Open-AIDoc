<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-server-sent-events" title="Ktor Client 中的 Server-Sent Events" help-id="sse_client">
    <show-structure for="chapter" depth="2"/>
    <primary-label ref="client-plugin"/>
    <tldr>
        <var name="example_name" value="client-sse"/>
        <p>
            <b>代码示例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        SSE 插件允许客户端通过 HTTP 连接从服务器接收基于事件的更新。
    </link-summary>
    <p>
        Server-Sent Events (SSE) 是一种技术，允许服务器通过 HTTP 连接持续推送事件到客户端。在服务器需要发送基于事件的更新而无需客户端重复轮询服务器的场景中，它尤其有用。
    </p>
    <p>
        Ktor 支持的 SSE 插件提供了一种直接的方法，用于在服务器和客户端之间创建单向连接。
    </p>
    <tip>
        <p>关于 SSE 插件服务器端支持的更多信息，请参见
            <Links href="/ktor/server-server-sent-events" summary="The SSE plugin allows a server to send event-based updates to a client over an HTTP connection.">SSE 服务器插件</Links>
            。
        </p>
    </tip>
    <chapter title="添加依赖项" id="add_dependencies">
        <p>
            <code>SSE</code> 仅需要 <Links href="/ktor/client-dependencies" summary="Learn how to add client dependencies to an existing project.">ktor-client-core</Links> artifact，并且不需要任何特定依赖项。
        </p>
    </chapter>
    <chapter title="安装 SSE" id="install_plugin">
        <p>
            要安装 <code>SSE</code> 插件，请在<a href="#configure-client">客户端配置代码块</a>内将其传入 <code>install</code> 函数：
        </p>
        <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
    </chapter>
    <chapter title="配置 SSE 插件" id="configure">
        <p>
            您可以选择在 <code>install</code> 代码块中通过设置 <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a>
            类支持的属性来配置 SSE 插件。
        </p>
        <chapter title="SSE 重新连接" id="sse-reconnect">
            <tldr>
                <p>️️不支持：<code>OkHttp</code></p>
            </tldr>
            <p>
                要为支持的引擎启用自动重新连接，请将 <code>maxReconnectionAttempts</code> 设置为大于 <code>0</code> 的值。您还可以使用
                <code>reconnectionTime</code> 配置尝试之间的延迟：
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
            <p>
                如果与服务器的连接丢失，客户端将等待指定的 <code>reconnectionTime</code>，然后尝试重新连接。它将最多进行
                指定的 <code>maxReconnectionAttempts</code> 次尝试以重新建立连接。
            </p>
        </chapter>
        <chapter title="过滤事件" id="filter-events">
            <p>
                在以下示例中，SSE 插件安装到 HTTP 客户端中，并配置为在传入流中仅包含注释事件和仅包含 <code>retry</code> 字段的事件：
            </p>
            <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
        </chapter>
    </chapter>
    <chapter title="处理 SSE 会话" id="handle-sse-sessions">
        <p>
            客户端的 SSE 会话由 <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html">
                <code>ClientSSESession</code>
            </a> 接口表示。此接口暴露了允许您从服务器接收 Server-Sent Events 的 API。
        </p>
        <chapter title="访问 SSE 会话" id="access-sse-session">
            <p><code>HttpClient</code> 允许您通过以下方式之一访问 SSE 会话：</p>
            <list>
                <li>
                    <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/sse.html">
                        <code>sse()</code>
                    </a>
                    函数创建 SSE 会话并允许您对其进行操作。
                </li>
                <li>
                    <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html">
                        <code>sseSession()</code>
                    </a>
                    函数允许您打开 SSE 会话。
                </li>
            </list>
            <p>要指定 URL 端点，您有两种选择：</p>
            <list>
                <li>使用 <code>urlString</code> 形参将整个 URL 指定为字符串。</li>
                <li>使用 <code>schema</code>、<code>host</code>、<code>port</code> 和 <code>path</code> 形参分别指定协议方案、域名、端口号和路径名。
                </li>
            </list>
            <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
            <p>可选地，以下形参可用于配置连接：</p>
            <deflist>
                <def id="reconnectionTime-param">
                    <title><code>reconnectionTime</code></title>
                    设置重新连接延迟。
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
                    一个反序列化函数，用于将 <code>TypedServerSentEvent</code> 的 <code>data</code> 字段转换为对象。关于更多信息，请参见<a href="#deserialization">反序列化</a>。
                </def>
            </deflist>
        </chapter>
        <chapter title="SSE 会话代码块" id="sse-session-block">
            <p>
                在 lambda 实参中，您可以访问 <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a>
                上下文。代码块中可用以下属性：
            </p>
            <deflist>
                <def id="call">
                    <title><code>call</code></title>
                    发起会话的关联 <code>HttpClientCall</code>。
                </def>
                <def id="incoming">
                    <title><code>incoming</code></title>
                    传入的 Server-Sent Events 流。
                </def>
            </deflist>
            <p>
                以下示例使用 <code>events</code> 端点创建新的 SSE 会话，通过 <code>incoming</code> 属性读取事件并打印接收到的
                <a href="https://api.ktor.io/ktor-shared/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a>
                。
            </p>
            <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>关于完整示例，请参见
                <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/client-sse">client-sse</a>。
            </p>
        </chapter>
        <chapter title="反序列化" id="deserialization">
            <p>
                SSE 插件支持将 Server-Sent Events 反序列化为类型安全的 Kotlin 对象。当处理来自服务器的结构化数据时，此特性尤其有用。
            </p>
            <p>
                要启用反序列化，请使用 SSE 访问函数上的 <code>deserialize</code> 形参提供自定义反序列化函数，并使用
                <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html">
                    <code>ClientSSESessionWithDeserialization</code>
                </a>
                类来处理反序列化后的事件。
            </p>
            <p>
                这是一个使用 <code>kotlinx.serialization</code> 反序列化 JSON 数据的示例：
            </p>
            <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
            <p>关于完整示例，请参见
                <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/client-sse">client-sse</a>。
            </p>
        </chapter>
    </chapter>
</topic>