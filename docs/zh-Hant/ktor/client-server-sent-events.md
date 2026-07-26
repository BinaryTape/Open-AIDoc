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
        SSE 外掛程式允許用戶端透過 HTTP 連線從伺服器接收基於事件的更新。
    </link-summary>
    <p>
        Server-Sent Events (SSE) 是一種允許伺服器透過 HTTP 連線持續將事件推送到用戶端的技術。當伺服器需要發送基於事件的更新而不需要用戶端重複輪詢伺服器時，這項技術特別有用。
    </p>
    <p>
        Ktor 支援的 SSE 外掛程式提供了一種簡單的方法，用於在伺服器和用戶端之間建立單向連線。
    </p>
    <tip>
        <p>若要進一步了解用於伺服器端支援的 SSE 外掛程式，請參閱
            <Links href="//server-server-sent-events" summary="SSE 外掛程式允許伺服器透過 HTTP 連線向用戶端發送基於事件的更新。">SSE 伺服器外掛程式</Links>
            。
        </p>
    </tip>
    <chapter title="新增相依性" id="add_dependencies">
        <p>
            <code>SSE</code> 僅需要 <Links href="//client-dependencies" summary="了解如何向現有專案新增用戶端相依性。">ktor-client-core</Links> 構件，不需要任何特定的相依性。
        </p>
    </chapter>
    <chapter title="安裝 SSE" id="install_plugin">
        <p>
            要安裝 <code>SSE</code> 外掛程式，請將其傳遞給 <a href="#configure-client">用戶端配置區塊</a> 內的 <code>install</code> 函式：
        </p>
        <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
    </chapter>
    <chapter title="配置 SSE 外掛程式" id="configure">
        <p>
            您可以選擇性地在 <code>install</code> 區塊中，透過設定
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a>
            類別支援的屬性來配置 SSE 外掛程式。
        </p>
        <chapter title="SSE 重新連線" id="sse-reconnect">
            <p>
                要啟用自動重新連線，請將 
                <code>maxReconnectionAttempts</code> 設定為大於 <code>0</code> 的值。您也可以使用 <code>reconnectionTime</code> 來配置兩次嘗試之間的延遲：
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
            <p>
                如果與伺服器的連線中斷，用戶端將在嘗試重新連線之前等待指定的
                <code>reconnectionTime</code>。它最多會進行
                指定的 <code>maxReconnectionAttempts</code> 次嘗試來重新建立連線。
            </p>
        </chapter>
        <chapter title="篩選事件" id="filter-events">
            <p>
                在以下範例中，SSE 外掛程式已安裝到 HTTP 用戶端中，並配置為在傳入流中僅包含包含註解的事件，以及僅包含 <code>retry</code> 欄位的事件：
            </p>
            <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
        </chapter>
        <chapter title="回應緩衝" id="response-buffering">
            <p>
                SSE 回應在本質上是流式的，這使得擷取完整內容主體並不切實際。您可以啟用診斷緩衝區，以便在 SSE 流失敗時安全地檢索回應主體。該緩衝區僅包含已經處理過的資料（不從網路重新讀取），旨在用於失敗情況下的記錄和錯誤分析。
            </p>
            <code-block lang="kotlin" code="                install(SSE) {&#10;                    bufferPolicy = SSEBufferPolicy.LastEvents(10)&#10;                }"/>
            <p>
                您也可以針對每次呼叫進行配置：
            </p>
            <code-block lang="kotlin" code="                client.sse(url, {&#10;                    bufferPolicy(SSEBufferPolicy.All)&#10;                }) {&#10;                    // ...&#10;                }"/>
            <chapter title="緩衝策略" id="buffer-policies">
                <p>
                    <code>SSEBufferPolicy</code> 型別提供了幾種儲存已處理 SSE 資料的策略。這些策略控制了流中有多少內容保留在記憶體中，並在發生錯誤時可供使用。
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
                        保留最後一個完成的 SSE 事件。
                    </def>
                    <def id="buffer-lastevents">
                        <title><code>LastEvents(n)</code></title>
                        保留最後 n 個完成的 SSE 事件。
                    </def>
                    <def id="buffer-all">
                        <title><code>All</code></title>
                        保留目前為止所有已處理的事件。
                        <note>對於長效流，請謹慎使用。</note>
                    </def>
                </deflist>
                <p>
                    發生失敗時，您可以使用 <code>response?.bodyAsText()</code> 存取緩衝區，而無需從網路重新讀取。
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
            介面表示。此介面公開了允許您從伺服器接收伺服器傳送事件的 API。
        </p>
        <chapter title="存取 SSE 工作階段" id="access-sse-session">
            <p><code>HttpClient</code> 允許您透過以下方式之一存取 SSE 工作階段：</p>
            <list>
                <li>
                    <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse.html">
                        <code>sse()</code>
                    </a>
                    函式會建立 SSE 工作階段並允許您對其進行操作。
                </li>
                <li>
                    <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html">
                        <code>sseSession()</code>
                    </a>
                    函式允許您開啟 SSE 工作階段。
                </li>
            </list>
            <p>要指定 URL 端點，您可以從兩個選項中進行選擇：</p>
            <list>
                <li>使用 <code>urlString</code> 參數將整個 URL 指定為字串。</li>
                <li>分別使用 <code>schema</code>、<code>host</code>、<code>port</code> 和 <code>path</code> 參數來指定協定架構、網域名稱、連接埠號和路徑名稱。
                </li>
            </list>
            <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
            <note>
                <code>ClientSSESession</code> 和 <code>ClientSSESessionWithDeserialization</code> 執行個體僅在工作階段持續期間有效。當 <code>serverSentEvents { ... }</code> 區塊完成或連線關閉時，其作用域會自動取消。
            </note>
            <p>此外，還有以下參數可用於配置連線：</p>
            <deflist>
                <def id="reconnectionTime-param">
                    <title><code>reconnectionTime</code></title>
                    設定重新連線延遲。
                </def>
                <def id="showCommentEvents-param">
                    <title><code>showCommentEvents</code></title>
                    指定是否在傳入流中顯示僅包含註解的事件。
                </def>
                <def id="showRetryEvents-param">
                    <title><code>showRetryEvents</code></title>
                    指定是否在傳入流中顯示僅包含 <code>retry</code> 欄位的事件。
                </def>
                <def id="deserialize-param">
                    <title><code>deserialize</code></title>
                    一個反序列化函式，用於將 <code>TypedServerSentEvent</code> 的 <code>data</code> 欄位轉換為物件。如需更多資訊，請參閱 <a href="#deserialization">反序列化</a>。
                </def>
            </deflist>
        </chapter>
        <chapter title="SSE 工作階段區塊" id="sse-session-block">
            <p>
                在 Lambda 引數內，您可以存取
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a>
                內容。區塊內提供以下屬性：
            </p>
            <deflist>
                <def id="call">
                    <title><code>call</code></title>
                    發起該工作階段的關聯 <code>HttpClientCall</code>。
                </def>
                <def id="incoming">
                    <title><code>incoming</code></title>
                    一個傳入的伺服器傳送事件流。
                </def>
            </deflist>
            <p>
                下面的範例建立了一個連接到 <code>events</code> 端點的新 SSE 工作階段，透過 <code>incoming</code> 屬性讀取事件，並列印接收到的
                <a href="https://api.ktor.io/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a>
                。
            </p>
            <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>如需完整範例，請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>。
            </p>
        </chapter>
        <chapter title="反序列化" id="deserialization">
            <p>
                SSE 外掛程式支援將伺服器傳送事件反序列化為型別安全的 Kotlin 物件。此功能在處理來自伺服器的結構化資料時特別有用。
            </p>
            <p>
                要啟用反序列化，請在 SSE 存取函式上使用 <code>deserialize</code> 參數提供自訂的反序列化函式，並使用 
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html">
                    <code>ClientSSESessionWithDeserialization</code>
                </a>
                類別來處理反序列化後的事件。
            </p>
            <p>
                這是一個使用 <code>kotlinx.serialization</code> 反序列化 JSON 資料的範例：
            </p>
            <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
            <p>如需完整範例，請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>。
            </p>
        </chapter>
    </chapter>
</topic>