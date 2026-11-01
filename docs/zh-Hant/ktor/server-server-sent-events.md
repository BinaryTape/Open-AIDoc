<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="server-server-sent-events" title="Ktor Server 中的 Server-Sent Events" help-id="sse_server">
    <show-structure for="chapter" depth="2"/>
    <primary-label ref="server-plugin"/>
    <var name="plugin_name" value="SSE"/>
    <var name="example_name" value="server-sse"/>
    <var name="package_name" value="io.ktor.server.sse"/>
    <var name="artifact_name" value="ktor-server-sse"/>
    <var name="ktor_version_catalog_name" value="ktorLibs.server.sse"/>
    <tldr>
        <p>
            <b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
        </p>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        SSE 外掛程式允許伺服器透過 HTTP 連線向用戶端傳送以事件為基礎的更新。
    </link-summary>
    <snippet id="sse-description">
        <p>
            Server-Sent Events (SSE) 是一種允許伺服器透過 HTTP 連線持續向用戶端推送事件的技術。當伺服器需要傳送以事件為基礎的更新，而無需用戶端重複輪詢伺服器時，這項技術特別有用。
        </p>
        <p>
            Ktor 支援的 SSE 外掛程式提供了一種在伺服器與用戶端之間建立單向連線的簡便方法。
        </p>
    </snippet>
    <tip>
        <p>若要進一步了解用戶端支援的 SSE 外掛程式，請參閱
            <Links href="client-server-sent-events.topic" summary="SSE 外掛程式允許用戶端透過 HTTP 連線接收來自伺服器的事件式更新。">SSE 用戶端外掛程式</Links>。
        </p>
    </tip>
    <note>
        <p>
            如需多向通訊，請考慮使用 <Links href="server-websockets.md" summary="WebSockets 外掛程式允許你在伺服器與用戶端之間建立多向通訊工作階段。">WebSockets</Links>。它們使用 WebSocket 通訊協定在伺服器與用戶端之間提供全雙工通訊。
        </p>
    </note>
    <chapter title="限制" id="limitations">
        <p>
            Ktor 不支援 SSE 回應的資料壓縮。如果你使用 <Links href="server-compression.md" summary="必要相依性：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✖️">Compression</Links> 外掛程式，它預設會跳過 SSE 回應的壓縮。
        </p>
    </chapter>
    <chapter title="新增相依性" id="add_dependencies">
        <p>
            若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至你的組建指令碼中：
        </p>
        <tabs group="languages">
            <tab title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    implementation(%ktor_version_catalog_name%)"/>
                <note>
                    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor version catalog</a> 來指定 Ktor 相依性。
                </note>
            </tab>
            <tab title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    implementation %ktor_version_catalog_name%"/>
                <note>
                    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor version catalog</a> 來指定 Ktor 相依性。
                </note>
            </tab>
            <tab title="Maven" group-key="maven">
                <code-block lang="XML" code="                    &lt;dependency&gt;&#10;                        &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                        &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                        &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;                    &lt;/dependency&gt;"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="安裝 SSE" id="install_plugin">
        <p>
            若要在應用程式中<a href="server-plugins.md#install">安裝</a> <code>%plugin_name%</code> 外掛程式，請將其傳遞給指定<Links href="server-modules.md" summary="模組允許你透過群組化路由來建構應用程式。">模組</Links>中的 <code>install</code> 函式。以下範例展示如何安裝 <code>%plugin_name%</code>：
        </p>
        <list>
            <li>
                在 <code>embeddedServer()</code> 函式呼叫中。
            </li>
            <li>
                在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式中。
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
    <chapter title="處理 SSE 工作階段" id="handle-sessions">
        <p>
            安裝 <code>SSE</code> 外掛程式後，你可以新增一個路由來處理 SSE 工作階段。為此，請在 <a href="server-routing.md#define_route">routing</a> 區塊內呼叫 <code>sse()</code> 函式。有兩種設定 SSE 路由的方式：
        </p>
        <list type="decimal">
            <li>
                <p>指定特定 URL 路徑：</p>
                <code-block lang="kotlin" code="                    routing {&#10;                        sse(&amp;quot;/events&amp;quot;) {&#10;                            // send events to clients&#10;                        }&#10;                    }"/>
            </li>
            <li>
                <p>
                    不指定路徑：
                </p>
                <code-block lang="kotlin" code="                    routing {&#10;                        sse {&#10;                            // send events to clients&#10;                        }&#10;                    }"/>
            </li>
        </list>
        <chapter title="SSE 工作階段區塊" id="session-block">
            <p>
                在 <code>sse</code> 區塊內，你可以為指定的路徑定義處理常式，該區塊由
                <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/-server-s-s-e-session/index.html">
                    <code>ServerSSESession</code>
                </a>
                類別表示。區塊內提供以下函式與屬性：</p>
            <deflist>
                <def id="send">
                    <title><code>send()</code></title>
                    建立並向用戶端傳送 <code>ServerSentEvent</code>。
                </def>
                <def id="call">
                    <title><code>call</code></title>
                    發起該工作階段所接收到的關聯 <code>ApplicationCall</code>。
                </def>
                <def id="close">
                    <title><code>close()</code></title>
                    關閉工作階段並終止與用戶端的連線。當所有 <code>send()</code> 操作完成時，會自動呼叫 <code>close()</code> 方法。
                    <note>
                        使用 <code>close()</code> 函式關閉工作階段不會向用戶端傳送終止事件。若要在關閉工作階段前指示 SSE 串流結束，請使用 <code>send()</code> 函式傳送特定事件。
                    </note>
                </def>
            </deflist>
        </chapter>
        <chapter title="範例：處理單一工作階段" id="handle-single-session">
            <p>
                以下範例示範如何在 <code>/events</code> 端點上設定 SSE 工作階段，透過 SSE 通道傳送 6 個獨立事件，每個事件之間間隔 1 秒（1000 毫秒）：
            </p>
            <code-block lang="kotlin" code="    routing {&#10;        sse(&quot;/events&quot;) {&#10;            repeat(6) {&#10;                send(ServerSentEvent(&quot;this is SSE #$it&quot;))&#10;                delay(1000)&#10;            }&#10;        }&#10;    }"/>
            <p>完整範例請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-sse">server-sse</a>。
            </p>
        </chapter>
        <chapter title="SSE 心跳機制 (Heartbeat)" id="heartbeat">
            <p>
                心跳機制可透過定期傳送事件，確保 SSE 連線在閒置期間保持活動狀態。只要工作階段保持作用中，伺服器就會按照設定的間隔傳送指定事件。
            </p>
            <p>
                若要啟用並設定心跳機制，請在 SSE 路由處理常式內使用
                <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/heartbeat.html">
                    <code>.heartbeat()</code>
                </a>
                函式：
            </p>
            <code-block lang="kotlin" code="        sse(&quot;/heartbeat&quot;) {&#10;            heartbeat {&#10;                period = 10.milliseconds&#10;                event = ServerSentEvent(&quot;heartbeat&quot;)&#10;            }&#10;            // ...&#10;        }"/>
            <p>
                在此範例中，每 10 毫秒會傳送一次心跳事件以維持連線。
            </p>
            <p>
                你也可以使用 <code>eventProvider</code> 屬性動態產生心跳事件：
            </p>
            <code-block lang="kotlin" code="        sse(&quot;/heartbeat-custom&quot;) {&#10;            heartbeat {&#10;                period = 30.milliseconds&#10;                eventProvider = {&#10;                    ServerSentEvent(data = &quot;ts=${Clock.System.now()}&quot;)&#10;                }&#10;            }&#10;            // ...&#10;        }"/>
            <p>
                設定後，每次心跳觸發時都會叫用 <code>eventProvider</code> 來產生 <code>ServerSentEvent</code>。這使得心跳事件能夠包含動態內容，例如時間戳記或狀態資訊。
            </p>
            <p>
                如果同時設定了 <code>event</code> 和 <code>eventProvider</code>，則 <code>eventProvider</code> 的優先順序高於 <code>event</code>。
            </p>
        </chapter>
        <chapter title="序列化" id="serialization">
            <p>
                若要啟用序列化，請在 SSE 路由上使用 <code>serialize</code> 參數提供自訂序列化函式。在處理常式內部，你可以使用
                <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/-server-s-s-e-session-with-serialization/index.html">
                    <code>ServerSSESessionWithSerialization</code>
                </a>
                類別來傳送序列化事件：
            </p>
            <code-block lang="kotlin" code="@Serializable&#10;data class Customer(val id: Int, val firstName: String, val lastName: String)&#10;&#10;@Serializable&#10;data class Product(val id: Int, val prices: List&lt;Int&gt;)&#10;&#10;fun Application.module() {&#10;    install(SSE)&#10;&#10;    routing {&#10;        // example with serialization&#10;        sse(&quot;/json&quot;, serialize = { typeInfo, it -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.encodeToString(serializer, it)&#10;        }) {&#10;            send(Customer(0, &quot;Jet&quot;, &quot;Brains&quot;))&#10;            send(Product(0, listOf(100, 200)))&#10;        }&#10;    }&#10;}"/>
            <p>
                此範例中的 <code>serialize</code> 函式負責將資料物件轉換為 JSON，接著放入 <code>ServerSentEvent</code> 的 <code>data</code> 欄位中。
            </p>
            <p>完整範例請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-sse">server-sse</a>。
            </p>
        </chapter>
    </chapter>
</topic>