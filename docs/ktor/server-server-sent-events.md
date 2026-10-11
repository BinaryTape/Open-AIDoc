<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="server-server-sent-events" title="Ktor Server 中的 Server-Sent Events" help-id="sse_server">
    <show-structure for="chapter" depth="2"/>
    <primary-label ref="server-plugin"/>
    <var name="plugin_name" value="SSE"/>
    <var name="example_name" value="server-sse"/>
    <var name="package_name" value="io.ktor.server.sse"/>
    <var name="artifact_name" value="ktor-server-sse"/>
    <tldr>
        <p>
            <b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
        </p>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        SSE 插件允许服务器通过 HTTP 连接向客户端发送基于事件的更新。
    </link-summary>
    <snippet id="sse-description">
        <p>
            Server-Sent Events (SSE) 是一种允许服务器通过 HTTP 连接持续向客户端推送事件的技术。
            当服务器需要发送基于事件的更新而无需客户端反复轮询服务器时，该技术尤为实用。
        </p>
        <p>
            Ktor 支持的 SSE 插件提供了一种在服务器与客户端之间创建单向连接的简便方法。
        </p>
    </snippet>
    <tip>
        <p>要详细了解客户端支持的 SSE 插件，请参阅
            <Links href="/ktor/client-server-sent-events" summary="The SSE plugin allows a client to receive event-based updates from a server over an HTTP connection.">SSE 客户端插件</Links>。
        </p>
    </tip>
    <note>
        <p>
            对于双向/多向通信，请考虑使用 <Links href="/ktor/server-websockets" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">WebSocket</Links>。它们使用 WebSocket 协议在服务器与客户端之间提供全双工通信。
        </p>
    </note>
    <chapter title="局限性" id="limitations">
        <p>
            Ktor 不支持对 SSE 响应进行数据压缩。
            如果您使用了 <Links href="/ktor/server-compression" summary="Required dependencies: io.ktor:%artifact_name% Code example: %example_name% Native server support: ✖️">Compression</Links> 插件，它默认会跳过对 SSE 响应的压缩。
        </p>
    </chapter>
    <chapter title="添加依赖项" id="add_dependencies">
        <p>
            要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到您的构建脚本中：
        </p>
        <tabs group="languages">
            <tab title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
            </tab>
            <tab title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
            </tab>
            <tab title="Maven" group-key="maven">
                <code-block lang="XML" code="                    &lt;dependency&gt;&#10;                        &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                        &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                        &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;                    &lt;/dependency&gt;"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="安装 SSE" id="install_plugin">
        <p>
            要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序中，
            请将其传递给指定<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模块</Links>中的 <code>install</code> 函数。
            以下示例演示了如何安装 <code>%plugin_name%</code>：
        </p>
        <list>
            <li>
                在 <code>embeddedServer()</code> 函数调用中。
            </li>
            <li>
                在 <code>Application</code> 类上显式定义的 <code>module()</code> 扩展函数中。
            </li>
        </list>
        <tabs>
            <tab title="embeddedServer">
                <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;                    import io.ktor.server.application.*&#10;                    import %package_name%.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, port = 8080) {&#10;                            install(%plugin_name%)&#10;                            // ...&#10;                        }.start(wait = true)&#10;                    }"/>
            </tab>
            <tab title="module">
                <code-block lang="kotlin" code="                    import io.ktor.server.application.*&#10;                    import %package_name%.*&#10;                    // ...&#10;                    fun Application.module() {&#10;                        install(%plugin_name%)&#10;                        // ...&#10;                    }"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="处理 SSE 会话" id="handle-sessions">
        <p>
            安装 <code>SSE</code> 插件后，即可添加路由来处理 SSE 会话。
            为此，请在 <a href="#define_route">routing</a> 代码块中调用 <code>sse()</code> 函数。配置 SSE 路由有两种方式：
        </p>
        <list type="decimal">
            <li>
                <p>指定具体的 URL 路径：</p>
                <code-block lang="kotlin" code="                    routing {&#10;                        sse(&amp;quot;/events&amp;quot;) {&#10;                            // send events to clients&#10;                        }&#10;                    }"/>
            </li>
            <li>
                <p>
                    不指定路径：
                </p>
                <code-block lang="kotlin" code="                    routing {&#10;                        sse {&#10;                            // send events to clients&#10;                        }&#10;                    }"/>
            </li>
        </list>
        <chapter title="SSE 会话代码块" id="session-block">
            <p>
                在 <code>sse</code> 代码块中，您需要定义指定路径的处理程序，由
                <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/-server-s-s-e-session/index.html">
                    <code>ServerSSESession</code>
                </a>
                类表示。代码块中提供了以下函数和属性：</p>
            <deflist>
                <def id="send">
                    <title><code>send()</code></title>
                    创建并向客户端发送一个 <code>ServerSentEvent</code>。
                </def>
                <def id="call">
                    <title><code>call</code></title>
                    发起该会话的关联接收 <code>ApplicationCall</code>。
                </def>
                <def id="close">
                    <title><code>close()</code></title>
                    关闭会话并终止与客户端的连接。当所有 <code>send()</code> 操作完成后，<code>close()</code> 方法会自动被调用。
                    <note>
                        使用 <code>close()</code> 函数关闭会话不会向客户端发送终止事件。若要在关闭会话前指示 SSE 流结束，请使用 <code>send()</code> 函数发送一个特定事件。
                    </note>
                </def>
            </deflist>
        </chapter>
        <chapter title="示例：处理单个会话" id="handle-single-session">
            <p>
                以下示例演示了如何在 <code>/events</code> 端点上设置 SSE 会话，通过 SSE 通道发送 6 个独立的事件，每个事件之间间隔 1 秒（1000 毫秒）：
            </p>
            <code-block lang="kotlin" code="    routing {&#10;        sse(&quot;/events&quot;) {&#10;            repeat(6) {&#10;                send(ServerSentEvent(&quot;this is SSE #$it&quot;))&#10;                delay(1000)&#10;            }&#10;        }&#10;    }"/>
            <p>有关完整示例，请参阅
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-sse">server-sse</a>。
            </p>
        </chapter>
        <chapter title="SSE 心跳" id="heartbeat">
            <p>
                心跳通过定期发送事件，确保 SSE 连接在空闲期间保持活跃状态。只要会话处于活动状态，服务器就会按配置的时间间隔发送指定事件。
            </p>
            <p>
                要在 SSE 路由处理程序中启用并配置心跳，请使用
                <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/heartbeat.html">
                    <code>.heartbeat()</code>
                </a>
                函数：
            </p>
            <code-block lang="kotlin" code="        sse(&quot;/heartbeat&quot;) {&#10;            heartbeat {&#10;                period = 10.milliseconds&#10;                event = ServerSentEvent(&quot;heartbeat&quot;)&#10;            }&#10;            // ...&#10;        }"/>
            <p>
                在此示例中，每隔 10 毫秒发送一次心跳事件以维持连接。
            </p>
            <p>
                您还可以使用 <code>eventProvider</code> 属性动态生成心跳事件：
            </p>
            <code-block lang="kotlin" code="        sse(&quot;/heartbeat-custom&quot;) {&#10;            heartbeat {&#10;                period = 30.milliseconds&#10;                eventProvider = {&#10;                    ServerSentEvent(data = &quot;ts=${Clock.System.now()}&quot;)&#10;                }&#10;            }&#10;            // ...&#10;        }"/>
            <p>
                设置后，每个心跳周期都会调用 <code>eventProvider</code> 来生成一个 <code>ServerSentEvent</code>。这使得心跳事件能够包含动态内容，例如时间戳或状态信息。
            </p>
            <p>
                如果同时配置了 <code>event</code> 和 <code>eventProvider</code>，则 <code>eventProvider</code> 优先于 <code>event</code>。
            </p>
        </chapter>
        <chapter title="序列化" id="serialization">
            <p>
                要启用序列化，请使用 SSE 路由上的 <code>serialize</code> 参数提供自定义序列化函数。在处理程序内部，您可以使用
                <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/-server-s-s-e-session-with-serialization/index.html">
                    <code>ServerSSESessionWithSerialization</code>
                </a>
                类来发送序列化后的事件：
            </p>
            <code-block lang="kotlin" code="@Serializable&#10;data class Customer(val id: Int, val firstName: String, val lastName: String)&#10;&#10;@Serializable&#10;data class Product(val id: Int, val prices: List&lt;Int&gt;)&#10;&#10;fun Application.module() {&#10;    install(SSE)&#10;&#10;    routing {&#10;        // example with serialization&#10;        sse(&quot;/json&quot;, serialize = { typeInfo, it -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.encodeToString(serializer, it)&#10;        }) {&#10;            send(Customer(0, &quot;Jet&quot;, &quot;Brains&quot;))&#10;            send(Product(0, listOf(100, 200)))&#10;        }&#10;    }&#10;}"/>
            <p>
                此示例中的 <code>serialize</code> 函数负责将数据对象转换为 JSON，然后将其放入 <code>ServerSentEvent</code> 的 <code>data</code> 字段中。
            </p>
            <p>有关完整示例，请参阅
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-sse">server-sse</a>。
            </p>
        </chapter>
    </chapter>
</topic>