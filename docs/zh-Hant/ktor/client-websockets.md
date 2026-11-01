<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-websockets" title="Ktor Client 中的 WebSockets">
    <show-structure for="chapter" depth="3"/>
    <primary-label ref="client-plugin"/>
    <var name="example_name" value="client-websockets"/>
    <var name="artifact_name" value="ktor-client-websockets"/>
    <var name="ktor_version_catalog_name" value="ktorLibs.client.websockets"/>
    <tldr>
        <p>
            <b>必要相依性</b>：<code>io.ktor:ktor-client-websockets</code>
        </p>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        Websockets 外掛程式可讓您在伺服器與用戶端之間建立多向通訊工作階段。
    </link-summary>
    WebSocket 是一種通訊協定，可透過單一 TCP 連線在使用者瀏覽器與伺服器之間提供全雙工通訊工作階段。它對於建立需要往返伺服器進行即時資料傳輸的應用程式特別有用。
    Ktor 在伺服器端與用戶端均支援 WebSocket 協定。
    <p>用戶端的 Websockets 外掛程式可讓您處理與伺服器交換訊息的 WebSocket 工作階段。</p>
    <note>
        <p>並非所有引擎都支援 WebSockets。有關受支援引擎的概述，請參閱<a href="client-engines.md#limitations">限制</a>。</p>
    </note>
    <tip>
        <p>若要了解伺服器端的 WebSocket 支援，請參閱 <Links href="server-websockets.md" summary="Websockets 外掛程式可讓您在伺服器與用戶端之間建立多向通訊工作階段。">Ktor Server 中的 WebSockets</Links>。</p>
    </tip>
    <chapter title="新增相依性" id="add_dependencies">
        <p>若要使用 <code>WebSockets</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：</p>
        <tabs group="languages">
            <tab title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    implementation(%ktor_version_catalog_name%)"/>
                <note>
                    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
                    Ktor 版本目錄</a>來指定 Ktor 相依性。
                </note>
            </tab>
            <tab title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    implementation %ktor_version_catalog_name%"/>
                <note>
                    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
                    Ktor 版本目錄</a>來指定 Ktor 相依性。
                </note>
            </tab>
            <tab title="Maven" group-key="maven">
                <code-block lang="XML" code="                    &lt;dependency&gt;&#10;                        &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                        &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                        &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;                    &lt;/dependency&gt;"/>
            </tab>
        </tabs>
        <tip>
            若要進一步了解 Ktor 用戶端所需的構件，請參閱 <Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
        </tip>
    </chapter>
    <chapter title="安裝 WebSockets" id="install_plugin">
        <p>若要安裝 <code>WebSockets</code> 外掛程式，請將其傳遞給<a href="client-create-and-configure.md#configure-client">用戶端配置區塊</a>內的 <code>install</code> 函式：</p>
        <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.websocket.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(WebSockets)&#10;            }"/>
    </chapter>
    <chapter title="配置" id="configure_plugin">
        <p>或者，您也可以透過傳遞
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/-web-sockets/-config/index.html">WebSockets.Config</a>
            所支援的屬性，在 <code>install</code> 區塊內配置該外掛程式。
        </p>
        <deflist>
            <def id="maxFrameSize">
                <title><code>maxFrameSize</code></title>
                設定可接收或傳送的最大 <code>Frame</code> 大小。
            </def>
            <def id="contentConverter">
                <title><code>contentConverter</code></title>
                設定序列化／反序列化的轉換器。
            </def>
            <def id="pingIntervalMillis">
                <title><code>pingIntervalMillis</code></title>
                以 <code>Long</code> 格式指定 Ping 之間的時間間隔。
            </def>
            <def id="pingInterval">
                <title><code>pingInterval</code></title>
                以 <code>Duration</code> 格式指定 Ping 之間的時間間隔。
            </def>
        </deflist>
        <warning>
            <p><code>pingInterval</code> 與 <code>pingIntervalMillis</code> 屬性不適用於 OkHttp 引擎。若要為 OkHttp 設定 Ping 間隔，您可以使用
                <a href="client-engines.md#okhttp">引擎配置</a>：
            </p>
            <code-block lang="kotlin" code="                import io.ktor.client.engine.okhttp.OkHttp&#10;&#10;                val client = HttpClient(OkHttp) {&#10;                    engine {&#10;                        preconfigured = OkHttpClient.Builder()&#10;                            .pingInterval(20, TimeUnit.SECONDS)&#10;                            .build()&#10;                    }&#10;                }"/>
        </warning>
        <p>
            在以下範例中，WebSockets 外掛程式配置了 20 秒
            （<code>20_000</code> 毫秒）的 Ping 間隔，以自動傳送 Ping 訊框並保持 WebSocket
            連線運作：
        </p>
        <code-block lang="kotlin" code="    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }"/>
    </chapter>
    <chapter title="使用 WebSocket 工作階段" id="working-wtih-session">
        <p>用戶端的 WebSocket 工作階段由
            <a href="https://api.ktor.io/ktor-websockets/io.ktor.websocket/-default-web-socket-session/index.html">DefaultClientWebSocketSession</a>
            介面表示。此介面公開了讓您可以傳送與接收 WebSocket 訊框，以及關閉工作階段的 API。
        </p>
        <chapter title="存取 WebSocket 工作階段" id="access-session">
            <p>
                <code>HttpClient</code> 提供了兩種主要存取 WebSocket 工作階段的方式：
            </p>
            <list>
                <li>
                    <p><a
                            href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/web-socket.html">webSocket()</a>
                        函式接受 <code>DefaultClientWebSocketSession</code> 作為區塊引數。</p>
                    <code-block lang="kotlin" code="                        runBlocking {&#10;                            client.webSocket(&#10;                                method = HttpMethod.Get,&#10;                                host = &quot;127.0.0.1&quot;,&#10;                                port = 8080,&#10;                                path = &quot;/echo&quot;&#10;                            ) {&#10;                                // this: DefaultClientWebSocketSession&#10;                            }&#10;                        }"/>
                </li>
                <li>
                    <a
                        href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/web-socket-session.html">webSocketSession()</a>
                    函式傳回 <code>DefaultClientWebSocketSession</code> 執行個體，並允許您在 <code>runBlocking</code> 或 <code>launch</code> 作用域之外存取工作階段。
                </li>
            </list>
        </chapter>
        <chapter title="處理 WebSocket 工作階段" id="handle-session">
            <p>在函式區塊內，您可以為指定路徑定義處理常式。區塊內提供以下函式與屬性：</p>
            <deflist>
                <def id="send">
                    <title><code>send()</code></title>
                    使用 <code>send()</code> 函式向伺服器傳送文字內容。
                </def>
                <def id="outgoing">
                    <title><code>outgoing</code></title>
                    使用 <code>outgoing</code> 屬性存取用於傳送 WebSocket 訊框的通道。訊框由 <code>Frame</code> 類別表示。
                </def>
                <def id="incoming">
                    <title><code>incoming</code></title>
                    使用 <code>incoming</code> 屬性存取用於接收 WebSocket 訊框的通道。訊框由 <code>Frame</code> 類別表示。
                </def>
                <def id="close">
                    <title><code>close()</code></title>
                    使用 <code>close()</code> 函式傳送帶有指定原因的關閉訊框。
                </def>
            </deflist>
        </chapter>
        <chapter title="訊框類型" id="frame-types">
            <p>
                您可以檢查 WebSocket 訊框的類型並進行相應處理。常見的訊框類型包括：
            </p>
            <list>
                <li><code>Frame.Text</code> 代表文字訊框。使用
                    <code>Frame.Text.readText()</code> 來讀取其內容。
                </li>
                <li><code>Frame.Binary</code> 代表二進位訊框。使用 <code>Frame.Binary.readBytes()</code>
                    來讀取其內容。
                </li>
                <li><code>Frame.Close</code> 代表關閉訊框。使用 <code>Frame.Close.readReason()</code>
                    來取得工作階段關閉的原因。
                </li>
            </list>
        </chapter>
        <chapter title="範例" id="example">
            <p>以下範例建立了 <code>echo</code> WebSocket 端點，並展示如何向伺服器傳送及從伺服器接收訊息。</p>
            <code-block lang="kotlin"
                        include-symbol="main" code="package com.example&#10;&#10;import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.http.*&#10;import io.ktor.websocket.*&#10;import kotlinx.coroutines.*&#10;import java.util.*&#10;&#10;fun main() {&#10;    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.webSocket(method = HttpMethod.Get, host = &quot;127.0.0.1&quot;, port = 8080, path = &quot;/echo&quot;) {&#10;            while(true) {&#10;                val othersMessage = incoming.receive() as? Frame.Text&#10;                println(othersMessage?.readText())&#10;                val myMessage = Scanner(System.`in`).next()&#10;                if(myMessage != null) {&#10;                    send(myMessage)&#10;                }&#10;            }&#10;        }&#10;    }&#10;    client.close()&#10;}"/>
            <p>有關完整範例，請參閱
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-websockets">client-websockets</a>。
            </p>
        </chapter>
    </chapter>
</topic>