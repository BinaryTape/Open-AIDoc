```xml
<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   id="client-server-sent-events" title="Ktor Client 中的伺服器傳送事件" help-id="sse_client">
<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<tldr>
    <var name="example_name" value="client-sse"/>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    SSE 外掛程式允許客戶端透過 HTTP 連線從伺服器接收基於事件的更新。
</link-summary>
<p>
    伺服器傳送事件 (SSE) 是一種允許伺服器透過 HTTP 連線持續向客戶端推送事件的技術。當伺服器需要傳送基於事件的更新而無需客戶端重複輪詢伺服器時，這項技術特別有用。
</p>
<p>
    Ktor 支援的 SSE 外掛程式為伺服器和客戶端之間建立單向連線提供了一種直接的方法。
</p>
<tip>
    <p>要了解更多關於伺服器端支援的 SSE 外掛程式，請參閱
        <Links href="/ktor/server-server-sent-events" summary="SSE 外掛程式允許伺服器透過 HTTP 連線向客戶端傳送基於事件的更新。">SSE 伺服器外掛程式</Links>
        。
    </p>
</tip>
<chapter title="新增依賴項" id="add_dependencies">
    <p>
        <code>SSE</code> 僅需要 <Links href="/ktor/client-dependencies" summary="了解如何向現有專案新增客戶端依賴項。">ktor-client-core</Links> Artifact，且不需要任何特定依賴項。
    </p>
</chapter>
<chapter title="安裝 SSE" id="install_plugin">
    <p>
        要安裝 <code>SSE</code> 外掛程式，請將其傳遞到 <a href="#configure-client">客戶端配置區塊</a> 內的 <code>install</code> 函數中：
    </p>
    <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
</chapter>
<chapter title="配置 SSE 外掛程式" id="configure">
    <p>
        您可以選擇在 <code>install</code> 區塊內配置 SSE 外掛程式，方法是設定 <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a> 類別支援的屬性。
    </p>
    <chapter title="SSE 重新連線" id="sse-reconnect">
        <tldr>
            <p>️️不支援於: <code>OkHttp</code></p>
        </tldr>
        <p>
            要啟用支援引擎的自動重新連線，請將 <code>maxReconnectionAttempts</code> 設定為大於 <code>0</code> 的值。您還可以使用 <code>reconnectionTime</code> 配置嘗試之間的延遲：
        </p>
        <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
        <p>
            如果與伺服器的連線丟失，客戶端將等待指定的 <code>reconnectionTime</code> 時間，然後再嘗試重新連線。它將進行最多指定的 <code>maxReconnectionAttempts</code> 次嘗試以重新建立連線。
        </p>
    </chapter>
    <chapter title="過濾事件" id="filter-events">
        <p>
            在以下範例中，SSE 外掛程式被安裝到 HTTP 客戶端中，並配置為包含在傳入流中僅包含註釋的事件以及僅包含 <code>retry</code> 欄位的事件：
        </p>
        <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
    </chapter>
</chapter>
<chapter title="處理 SSE 會話" id="handle-sse-sessions">
    <p>
        客戶端的 SSE 會話由
        <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html">
            <code>ClientSSESession</code>
        </a>
        介面表示。此介面公開了允許您從伺服器接收伺服器傳送事件的 API。
    </p>
    <chapter title="存取 SSE 會話" id="access-sse-session">
        <p><code>HttpClient</code> 允許您透過以下方式之一存取 SSE 會話：</p>
        <list>
            <li>
                <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/sse.html">
                    <code>sse()</code>
                </a>
                函數建立 SSE 會話並允許您在其上執行操作。
            </li>
            <li>
                <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html">
                    <code>sseSession()</code>
                </a>
                函數允許您開啟 SSE 會話。
            </li>
        </list>
        <p>要指定 URL 端點，您可以選擇兩種方式：</p>
        <list>
            <li>使用 <code>urlString</code> 參數以字串形式指定整個 URL。</li>
            <li>使用 <code>schema</code>、<code>host</code>、<code>port</code> 和 <code>path</code> 參數分別指定協定方案、域名、埠號和路徑名稱。
            </li>
        </list>
        <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
        <p>此外，以下參數可用於配置連線：</p>
        <deflist>
            <def id="reconnectionTime-param">
                <title><code>reconnectionTime</code></title>
                設定重新連線延遲。
            </def>
            <def id="showCommentEvents-param">
                <title><code>showCommentEvents</code></title>
                指定是否在傳入流中顯示僅包含註釋的事件。
            </def>
            <def id="showRetryEvents-param">
                <title><code>showRetryEvents</code></title>
                指定是否在傳入流中顯示僅包含 <code>retry</code> 欄位的事件。
            </def>
            <def id="deserialize-param">
                <title><code>deserialize</code></title>
                一個反序列化器函數，用於將 <code>TypedServerSentEvent</code> 的 <code>data</code> 欄位轉換為物件。有關更多資訊，請參閱
                <a href="#deserialization">反序列化</a>。
            </def>
        </deflist>
    </chapter>
    <chapter title="SSE 會話區塊" id="sse-session-block">
        <p>
            在 lambda 參數中，您可以存取
            <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a>
            上下文。區塊內可用的屬性如下：
        </p>
        <deflist>
            <def id="call">
                <title><code>call</code></title>
                產生該會話的相關聯 <code>HttpClientCall</code>。
            </def>
            <def id="incoming">
                <title><code>incoming</code></title>
                一個傳入的伺服器傳送事件流。
            </def>
        </deflist>
        <p>
            以下範例使用 <code>events</code> 端點建立新的 SSE 會話，透過 <code>incoming</code> 屬性讀取事件並列印接收到的
            <a href="https://api.ktor.io/ktor-shared/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a>
            。
        </p>
        <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
        <p>有關完整範例，請參閱
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/client-sse">client-sse</a>。
        </p>
    </chapter>
    <chapter title="反序列化" id="deserialization">
        <p>
            SSE 外掛程式支援將伺服器傳送事件反序列化為型別安全的 Kotlin 物件。此功能在處理來自伺服器的結構化資料時特別有用。
        </p>
        <p>
            要啟用反序列化，請使用 SSE 存取函數上的 <code>deserialize</code> 參數提供一個自訂反序列化函數，並使用
            <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html">
                <code>ClientSSESessionWithDeserialization</code>
            </a>
            類別來處理反序列化的事件。
        </p>
        <p>
            以下是一個使用 <code>kotlinx.serialization</code> 反序列化 JSON 資料的範例：
        </p>
        <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
        <p>有關完整範例，請參閱
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/client-sse">client-sse</a>。
        </p>
    </chapter>
</chapter>