<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-server-sent-events" title="Ktor Client 中的 Server-Sent Events" help-id="sse_client">
    <show-structure for="chapter" depth="2"/>
    <primary-label ref="client-plugin"/>
    <tldr>
        <var name="example_name" value="client-sse"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        SSE 外掛程式允許用戶端透過 HTTP 連線從伺服器接收以事件為基礎的更新。
    </link-summary>
    <p>
        Server-Sent Events (SSE) 是一種允許伺服器透過 HTTP 連線持續向用戶端推送事件的技術。當伺服器需要傳送以事件為基礎的更新，而不需要用戶端重複輪詢伺服器時，這項技術特別有用。
    </p>
    <p>
        Ktor 支援的 SSE 外掛程式提供了一種簡單明瞭的方法，用於在伺服器與用戶端之間建立單向連線。
    </p>
    <tip>
        <p>若要了解更多有關伺服器端支援的 SSE 外掛程式，請參閱
            <Links href="server-server-sent-events.topic" summary="SSE 外掛程式允許伺服器透過 HTTP 連線向用戶端傳送以事件為基礎的更新。">SSE 伺服器外掛程式</Links>。
        </p>
    </tip>
    <chapter title="新增相依性" id="add_dependencies">
        <p>
            <code>SSE</code> 僅需要 <Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">ktor-client-core</Links> 構件，不需要任何特定的相依性。
        </p>
    </chapter>
    <chapter title="安裝 SSE" id="install_plugin">
        <p>
            若要安裝 <code>SSE</code> 外掛程式，請在<a href="client-create-and-configure.md#configure-client">用戶端配置區塊</a>內將其傳遞給 <code>install</code> 函式：
        </p>
        <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
    </chapter>
    <chapter title="配置 SSE 外掛程式" id="configure">
        <p>
            您可以選擇透過設定
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a>
            類別所支援的屬性，在 <code>install</code> 區塊內配置 SSE 外掛程式。
        </p>
        <chapter title="SSE 重新連線" id="sse-reconnect">
            <p>
                若要啟用自動重新連線，請將
                <code>maxReconnectionAttempts</code> 設定為大於 <code>0</code> 的值。您也可以使用 <code>reconnectionTime</code> 來配置各次嘗試之間的延遲：
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
            <p>
                若與伺服器的連線中斷，用戶端將會等待指定的
                <code>reconnectionTime</code> 後再嘗試重新連線。它最多會嘗試指定的
                <code>maxReconnectionAttempts</code> 次數來重新建立連線。
            </p>
        </chapter>
        <chapter title="篩選事件" id="filter-events">
            <p>
                在以下範例中，SSE 外掛程式已安裝至 HTTP 用戶端中，並配置為在傳入串流 (incoming flow) 中包含僅含有註解的事件，以及僅含有 <code>retry</code> 欄位的事件：
            </p>
            <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
        </chapter>
        <chapter title="回應緩衝" id="response-buffering">
            <p>
                SSE 回應本質上是串流傳輸，這使得擷取完整的主體變得不切實際。您可以啟用診斷緩衝區，以便在 SSE 串流失敗時安全地擷取回應主體。此緩衝區僅包含已處理的資料（無需從網路重新讀取），並專門用於失敗時的記錄與錯誤分析。
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    bufferPolicy = SSEBufferPolicy.LastEvents(10)&#10;                }"/>
            <p>
                您也可以針對個別呼叫配置緩衝區：
            </p>
            <code-block lang="kotlin" code="                client.sse(url, {&#10;                    bufferPolicy(SSEBufferPolicy.All)&#10;                }) {&#10;                    // ...&#10;                }"/>
            <chapter title="緩衝策略" id="buffer-policies">
                <p>
                    <code>SSEBufferPolicy</code> 型別提供了數種用於儲存已處理 SSE 資料的策略。這些策略控制了在記憶體中保留多少串流資料，以便在發生錯誤時可供使用。
                </p>
                <deflist>
                    <def id="buffer-off">
                        <title><code>Off</code>（預設）</title>
                        不進行緩衝。
                    </def>
                    <def id="buffer-lastlines">
                        <title><code>LastLines(n)</code></title>
                        保留最後 n 行。
                    </def>
                    <def id="buffer-lastevent">
                        <title><code>LastEvent</code></title>
                        保留最後一個已完成的 SSE 事件。
                    </def>
                    <def id="buffer-lastevents">
                        <title><code>LastEvents(n)</code></title>
                        保留最後 n 個已完成的 SSE 事件。
                    </def>
                    <def id="buffer-all">
                        <title><code>All</code></title>
                        保留截至目前為止已處理的所有事件。
                        <note>對於長期運行的串流，請謹慎使用。</note>
                    </def>
                </deflist>
                <p>
                    發生失敗時，您可以使用 <code>response?.bodyAsText()</code> 來存取緩衝區，而無需從網路重新讀取。
                </p>
            </chapter>
        </chapter>
    </chapter>
    <chapter title="處理 SSE 工作階段" id="handle-sse-sessions">
        <p>
            用戶端的 SSE 工作階段由
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html">
                <code>ClientSSESession</code>
            </a>
            介面表示。此介面公開了讓您能夠從伺服器接收伺服器發送事件的 API。
        </p>
        <chapter title="存取 SSE 工作階段" id="access-sse-session">
            <p><code>HttpClient</code> 允許您透過以下方式之一存取 SSE 工作階段：</p>
            <list>
                <li>
                    <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse.html">
                        <code>sse()</code>
                    </a>
                    函式會建立 SSE 工作階段，並允許您對其進行操作。
                </li>
                <li>
                    <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html">
                        <code>sseSession()</code>
                    </a>
                    函式允許您開啟一個 SSE 工作階段。
                </li>
            </list>
            <p>若要指定 URL 端點，您可以從兩個選項中進行選擇：</p>
            <list>
                <li>使用 <code>urlString</code> 參數將整個 URL 指定為字串。</li>
                <li>分別使用 <code>schema</code>、<code>host</code>、<code>port</code> 和 <code>path</code> 參數來指定通訊協定配置 (scheme)、網域名稱、連接埠號碼與路徑名稱。</li>
            </list>
            <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
            <note>
                <code>ClientSSESession</code> 和 <code>ClientSSESessionWithDeserialization</code> 執行個體僅在該工作階段期間有效。當 <code>serverSentEvents { ... }</code> 區塊完成或連線關閉時，它們的作用域會自動取消。
            </note>
            <p>可選地，以下參數可用於配置連線：</p>
            <deflist>
                <def id="reconnectionTime-param">
                    <title><code>reconnectionTime</code></title>
                    設定重新連線延遲。
                </def>
                <def id="showCommentEvents-param">
                    <title><code>showCommentEvents</code></title>
                    指定是否在傳入串流中顯示僅包含註解的事件。
                </def>
                <def id="showRetryEvents-param">
                    <title><code>showRetryEvents</code></title>
                    指定是否在傳入串流中顯示僅包含 <code>retry</code> 欄位的事件。
                </def>
                <def id="deserialize-param">
                    <title><code>deserialize</code></title>
                    用於將 <code>TypedServerSentEvent</code> 的 <code>data</code> 欄位轉換為物件的反序列化函式。如需詳細資訊，請參閱
                    <a href="#deserialization">反序列化</a>。
                </def>
            </deflist>
        </chapter>
        <chapter title="SSE 工作階段區塊" id="sse-session-block">
            <p>
                在 Lambda 引數內，您可以存取
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a>
                上下文。區塊內提供以下屬性：
            </p>
            <deflist>
                <def id="call">
                    <title><code>call</code></title>
                    發起該工作階段的相關 <code>HttpClientCall</code>。
                </def>
                <def id="incoming">
                    <title><code>incoming</code></title>
                    傳入的伺服器發送事件串流。
                </def>
            </deflist>
            <p>
                以下範例使用 <code>events</code> 端點建立一個新的 SSE 工作階段，透過 <code>incoming</code> 屬性讀取事件，並印出接收到的
                <a href="https://api.ktor.io/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a>。
            </p>
            <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>如需完整範例，請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>。
            </p>
        </chapter>
        <chapter title="反序列化" id="deserialization">
            <p>
                SSE 外掛程式支援將伺服器發送事件反序列化為型別安全的 Kotlin 物件。此功能在處理來自伺服器的結構化資料時特別有用。
            </p>
            <p>
                若要啟用反序列化，請在 SSE 存取函式上使用 <code>deserialize</code> 參數提供自訂反序列化函式，並使用
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html">
                    <code>ClientSSESessionWithDeserialization</code>
                </a>
                類別來處理反序列化後的事件。
            </p>
            <p>
                以下是使用 <code>kotlinx.serialization</code> 反序列化 JSON 資料的範例：
            </p>
            <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
            <p>如需完整範例，請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>。
            </p>
        </chapter>
    </chapter>
</topic>