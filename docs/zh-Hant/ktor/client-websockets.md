```xml
<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-websockets" title="Ktor 客戶端中的 WebSockets">
<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>
<var name="example_name" value="client-websockets"/>
<var name="artifact_name" value="ktor-client-websockets"/>
<tldr>
    <p>
        <b>所需依賴項</b>：<code>io.ktor:ktor-client-websockets</code>
    </p>
    <p>
        <b>程式碼範例</b>：
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    Websockets 插件允許您在伺服器與客戶端之間建立多向通訊會話。
</link-summary>
WebSocket 是一種協定，它透過單一 TCP 連線在用戶瀏覽器和伺服器之間提供全雙工通訊會話。這對於建立需要與伺服器進行即時資料傳輸的應用程式特別有用。
Ktor 在伺服器端和客戶端都支援 WebSocket 協定。
<p>客戶端的 WebSockets 插件允許您處理 WebSocket 會話，用於與伺服器交換訊息。</p>
<note>
    <p>並非所有引擎都支援 WebSockets。有關支援引擎的概述，請參閱
        <a href="client-engines.md#limitations">限制</a>。</p>
</note>
<tip>
    <p>要了解伺服器端的 WebSocket 支援，請參閱 <Links href="/ktor/server-websockets" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">Ktor 伺服器中的 WebSockets</Links>。</p>
</tip>
<chapter title="新增依賴項" id="add_dependencies">
    <p>要使用 <code>WebSockets</code>，您需要在構建腳本中包含 <code>%artifact_name%</code> 構件：</p>
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
    <p>
        您可以從 <Links href="/ktor/client-dependencies" summary="Learn how to add client dependencies to an existing project.">新增客戶端依賴項</Links> 了解更多關於 Ktor 客戶端所需的構件。
    </p>
</chapter>
<chapter title="安裝 WebSockets" id="install_plugin">
    <p>要安裝 <code>WebSockets</code> 插件，請將其傳遞給 <a href="#configure-client">客戶端配置塊</a> 內的 <code>install</code> 函數：</p>
    <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.websocket.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(WebSockets)&#10;            }"/>
</chapter>
<chapter title="配置" id="configure_plugin">
    <p>您可以選擇在 <code>install</code> 塊中透過傳遞 <code>WebSockets.Config</code>
        支援的屬性來配置插件。
    </p>
    <deflist>
        <def id="maxFrameSize">
            <title><code>maxFrameSize</code></title>
            設定可以接收或傳送的最大 <code>Frame</code> 大小。
        </def>
        <def id="contentConverter">
            <title><code>contentConverter</code></title>
            設定用於序列化/反序列化的轉換器。
        </def>
        <def id="pingIntervalMillis">
            <title><code>pingIntervalMillis</code></title>
            以 <code>Long</code> 格式指定 ping 之間的持續時間。
        </def>
        <def id="pingInterval">
            <title><code>pingInterval</code></title>
            以 <code>Duration</code> 格式指定 ping 之間的持續時間。
        </def>
    </deflist>
    <warning>
        <p><code>pingInterval</code> 和 <code>pingIntervalMillis</code> 屬性不適用於
            OkHttp 引擎。要為 OkHttp 設定 ping 間隔，您可以使用
            <a href="#okhttp">引擎配置</a>：
        </p>
        <code-block lang="kotlin" code="                import io.ktor.client.engine.okhttp.OkHttp&#10;&#10;                val client = HttpClient(OkHttp) {&#10;                    engine {&#10;                        preconfigured = OkHttpClient.Builder()&#10;                            .pingInterval(20, TimeUnit.SECONDS)&#10;                            .build()&#10;                    }&#10;                }"/>
    </warning>
    <p>
        在以下範例中，WebSockets 插件配置了 20 秒 (<code>20_000</code> 毫秒) 的 ping 間隔，以自動傳送 ping 幀並保持 WebSocket 連線活躍：
    </p>
    <code-block lang="kotlin" code="    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }"/>
</chapter>
<chapter title="使用 WebSocket 會話" id="working-wtih-session">
    <p>客戶端的 WebSocket 會話由
        <code>DefaultClientWebSocketSession</code>
        介面表示。此介面公開了允許您傳送和接收 WebSocket 幀以及關閉會話的 API。
    </p>
    <chapter title="存取 WebSocket 會話" id="access-session">
        <p>
            <code>HttpClient</code> 提供了兩種主要方式來存取 WebSocket 會話：
        </p>
        <list>
            <li>
                <p><code>webSocket()</code> 函數接受 <code>DefaultClientWebSocketSession</code> 作為塊參數。</p>
                <code-block lang="kotlin" code="                        runBlocking {&#10;                            client.webSocket(&#10;                                method = HttpMethod.Get,&#10;                                host = &quot;127.0.0.1&quot;,&#10;                                port = 8080,&#10;                                path = &quot;/echo&quot;&#10;                            ) {&#10;                                // this: DefaultClientWebSocketSession&#10;                            }&#10;                        }"/>
            </li>
            <li>
                <code>webSocketSession()</code>
                函數返回 <code>DefaultClientWebSocketSession</code> 實例，並允許您在 <code>runBlocking</code> 或 <code>launch</code> 作用域之外存取會話。
            </li>
        </list>
    </chapter>
    <chapter title="處理 WebSocket 會話" id="handle-session">
        <p>在函數塊內，您為指定的路徑定義處理程式。以下函數和屬性在此塊中可用：</p>
        <deflist>
            <def id="send">
                <title><code>send()</code></title>
                使用 <code>send()</code> 函數向伺服器傳送文本內容。
            </def>
            <def id="outgoing">
                <title><code>outgoing</code></title>
                使用 <code>outgoing</code> 屬性存取用於傳送 WebSocket 幀的通道。幀由 <code>Frame</code> 類別表示。
            </def>
            <def id="incoming">
                <title><code>incoming</code></title>
                使用 <code>incoming</code> 屬性存取用於接收 WebSocket 幀的通道。幀由 <code>Frame</code> 類別表示。
            </def>
            <def id="close">
                <title><code>close()</code></title>
                使用 <code>close()</code> 函數傳送帶有指定原因的關閉幀。
            </def>
        </deflist>
    </chapter>
    <chapter title="幀類型" id="frame-types">
        <p>
            您可以檢查 WebSocket 幀的類型並據此處理。一些常見的幀類型包括：
        </p>
        <list>
            <li><code>Frame.Text</code> 表示一個文本幀。使用
                <code>Frame.Text.readText()</code> 讀取其內容。
            </li>
            <li><code>Frame.Binary</code> 表示一個二進制幀。使用 <code>Frame.Binary.readBytes()</code>
                讀取其內容。
            </li>
            <li><code>Frame.Close</code> 表示一個關閉幀。使用 <code>Frame.Close.readReason()</code>
                獲取會話關閉的原因。
            </li>
        </list>
    </chapter>
    <chapter title="範例" id="example">
        <p>以下範例創建了 <code>echo</code> WebSocket 端點，並展示了如何向伺服器傳送和從伺服器接收訊息。</p>
        <code-block lang="kotlin"
                    include-symbol="main" code="package com.example&#10;&#10;import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.http.*&#10;import io.ktor.websocket.*&#10;import kotlinx.coroutines.*&#10;import java.util.*&#10;&#10;fun main() {&#10;    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.webSocket(method = HttpMethod.Get, host = &quot;127.0.0.1&quot;, port = 8080, path = &quot;/echo&quot;) {&#10;            while(true) {&#10;                val othersMessage = incoming.receive() as? Frame.Text&#10;                println(othersMessage?.readText())&#10;                val myMessage = Scanner(System.`in`).next()&#10;                if(myMessage != null) {&#10;                    send(myMessage)&#10;                }&#10;            }&#10;        }&#10;    }&#10;    client.close()&#10;}"/>
        <p>有關完整範例，
            請參閱
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/client-websockets">client-websockets</a>。
        </p>
    </chapter>
</chapter>
</topic>