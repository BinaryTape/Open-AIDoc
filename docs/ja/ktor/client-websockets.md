<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-websockets" title="Ktor ClientにおけるWebSockets">
<show-structure for="chapter" depth="3"/>
<primary-label ref="client-plugin"/>
<var name="example_name" value="client-websockets"/>
<var name="artifact_name" value="ktor-client-websockets"/>
<tldr>
    <p>
        <b>必要な依存関係</b>: <code>io.ktor:ktor-client-websockets</code>
    </p>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    WebSocketsプラグインを使用すると、サーバーとクライアント間で多方向の通信セッションを作成できます。
</link-summary>
WebSocketは、単一のTCP接続を介してユーザーのブラウザとサーバー間にフルデュプレックス（全二重）通信セッションを提供するプロトコルです。これは、サーバーとの間でのリアルタイムのデータ転送が必要なアプリケーションを作成する場合に特に有用です。
Ktorは、サーバー側とクライアント側の両方でWebSocketプロトコルをサポートしています。
<p>クライアント用のWebSocketsプラグインを使用すると、サーバーとメッセージを交換するためのWebSocketセッションを処理できます。</p>
<note>
    <p>すべてのエンジンがWebSocketsをサポートしているわけではありません。サポートされているエンジンの概要については、<a href="client-engines.md#limitations">制限事項</a>を参照してください。</p>
</note>
<tip>
    <p>サーバー側のWebSocketサポートについては、<Links href="//server-websockets" summary="WebSocketsプラグインを使用すると、サーバーとクライアント間で多方向の通信セッションを作成できます。">Ktor ServerにおけるWebSockets</Links>を参照してください。</p>
</tip>
<chapter title="依存関係の追加" id="add_dependencies">
    <p><code>WebSockets</code>を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。</p>
    <Tabs group="languages">
        <TabItem title="Gradle (Kotlin)" group-key="kotlin">
            <code-block lang="Kotlin" code="                    implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
        </TabItem>
        <TabItem title="Gradle (Groovy)" group-key="groovy">
            <code-block lang="Groovy" code="                    implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
        </TabItem>
        <TabItem title="Maven" group-key="maven">
            <code-block lang="XML" code="                    &lt;dependency&gt;&#10;                        &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                        &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                        &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;                    &lt;/dependency&gt;"/>
        </TabItem>
    </Tabs>
    <tip>
        Ktorクライアントに必要なアーティファクトの詳細については、<Links href="//client-dependencies" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links>を参照してください。
    </tip>
</chapter>
<chapter title="WebSocketsのインストール" id="install_plugin">
    <p><code>WebSockets</code>プラグインをインストールするには、<a href="#configure-client">クライアント設定ブロック</a>内の <code>install</code> 関数に渡します。</p>
    <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.websocket.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(WebSockets)&#10;            }"/>
</chapter>
<chapter title="設定" id="configure_plugin">
    <p>オプションで、<a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/-web-sockets/-config/index.html">WebSockets.Config</a> のサポートされているプロパティを渡すことで、<code>install</code> ブロック内でプラグインを設定できます。
    </p>
    <deflist>
        <def id="maxFrameSize">
            <title><code>maxFrameSize</code></title>
            受信または送信可能な <code>Frame</code> の最大サイズを設定します。
        </def>
        <def id="contentConverter">
            <title><code>contentConverter</code></title>
            シリアライズ/デシリアライズ用のコンバーターを設定します。
        </def>
        <def id="pingIntervalMillis">
            <title><code>pingIntervalMillis</code></title>
            pingの間隔を <code>Long</code> 形式で指定します。
        </def>
        <def id="pingInterval">
            <title><code>pingInterval</code></title>
            pingの間隔を <code>Duration</code> 形式で指定します。
        </def>
    </deflist>
    <warning>
        <p><code>pingInterval</code> および <code>pingIntervalMillis</code> プロパティは、OkHttpエンジンには適用されません。OkHttpのping間隔を設定するには、<a href="#okhttp">エンジン設定</a>を使用できます。
        </p>
        <code-block lang="kotlin" code="                import io.ktor.client.engine.okhttp.OkHttp&#10;&#10;                val client = HttpClient(OkHttp) {&#10;                    engine {&#10;                        preconfigured = OkHttpClient.Builder()&#10;                            .pingInterval(20, TimeUnit.SECONDS)&#10;                            .build()&#10;                    }&#10;                }"/>
    </warning>
    <p>
        以下の例では、WebSocketsプラグインを20秒（<code>20_000</code>ミリ秒）のping間隔で設定し、pingフレームを自動的に送信してWebSocket接続を維持するようにしています。
    </p>
    <code-block lang="kotlin" code="    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }"/>
</chapter>
<chapter title="WebSocketセッションの操作" id="working-wtih-session">
    <p>クライアントのWebSocketセッションは、<a href="https://api.ktor.io/ktor-websockets/io.ktor.websocket/-default-web-socket-session/index.html">DefaultClientWebSocketSession</a> インターフェースによって表されます。このインターフェースは、WebSocketフレームの送受信やセッションのクローズを可能にするAPIを公開しています。
    </p>
    <chapter title="WebSocketセッションへのアクセス" id="access-session">
        <p>
            <code>HttpClient</code> は、WebSocketセッションにアクセスするための2つの主要な方法を提供します。
        </p>
        <list>
            <li>
                <p><a
                        href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/web-socket.html">webSocket()</a>
                    関数は、ブロック引数として <code>DefaultClientWebSocketSession</code> を受け取ります。</p>
                <code-block lang="kotlin" code="                        runBlocking {&#10;                            client.webSocket(&#10;                                method = HttpMethod.Get,&#10;                                host = &quot;127.0.0.1&quot;,&#10;                                port = 8080,&#10;                                path = &quot;/echo&quot;&#10;                            ) {&#10;                                // this: DefaultClientWebSocketSession&#10;                            }&#10;                        }"/>
            </li>
            <li>
                <a
                    href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/web-socket-session.html">webSocketSession()</a>
                関数は <code>DefaultClientWebSocketSession</code> インスタンスを返し、<code>runBlocking</code> や <code>launch</code> スコープの外でセッションにアクセスすることを可能にします。
            </li>
        </list>
    </chapter>
    <chapter title="WebSocketセッションの処理" id="handle-session">
        <p>関数ブロック内で、指定されたパスのハンドラーを定義します。ブロック内では以下の関数とプロパティが利用可能です。</p>
        <deflist>
            <def id="send">
                <title><code>send()</code></title>
                サーバーにテキストコンテンツを送信するには、<code>send()</code> 関数を使用します。
            </def>
            <def id="outgoing">
                <title><code>outgoing</code></title>
                WebSocketフレームを送信するためのチャネルにアクセスするには、<code>outgoing</code> プロパティを使用します。フレームは <code>Frame</code> クラスによって表されます。
            </def>
            <def id="incoming">
                <title><code>incoming</code></title>
                WebSocketフレームを受信するためのチャネルにアクセスするには、<code>incoming</code> プロパティを使用します。フレームは <code>Frame</code> クラスによって表されます。
            </def>
            <def id="close">
                <title><code>close()</code></title>
                指定された理由でクローズフレームを送信するには、<code>close()</code> 関数を使用します。
            </def>
        </deflist>
    </chapter>
    <chapter title="フレームの種類" id="frame-types">
        <p>
            WebSocketフレームのタイプを確認し、それに応じて処理できます。一般的なフレームタイプは以下の通りです。
        </p>
        <list>
            <li><code>Frame.Text</code> はテキストフレームを表します。内容を読み取るには <code>Frame.Text.readText()</code> を使用します。
            </li>
            <li><code>Frame.Binary</code> はバイナリフレームを表します。内容を読み取るには <code>Frame.Binary.readBytes()</code> を使用します。
            </li>
            <li><code>Frame.Close</code> はクローズフレームを表します。セッション終了の理由を取得するには <code>Frame.Close.readReason()</code> を使用します。
            </li>
        </list>
    </chapter>
    <chapter title="例" id="example">
        <p>以下の例では、<code>echo</code> WebSocketエンドポイントを作成し、サーバーとの間でメッセージを送受信する方法を示します。</p>
        <code-block lang="kotlin"
                    include-symbol="main" code="package com.example&#10;&#10;import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.http.*&#10;import io.ktor.websocket.*&#10;import kotlinx.coroutines.*&#10;import java.util.*&#10;&#10;fun main() {&#10;    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.webSocket(method = HttpMethod.Get, host = &quot;127.0.0.1&quot;, port = 8080, path = &quot;/echo&quot;) {&#10;            while(true) {&#10;                val othersMessage = incoming.receive() as? Frame.Text&#10;                println(othersMessage?.readText())&#10;                val myMessage = Scanner(System.`in`).next()&#10;                if(myMessage != null) {&#10;                    send(myMessage)&#10;                }&#10;            }&#10;        }&#10;    }&#10;    client.close()&#10;}"/>
        <p>完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-websockets">client-websockets</a> を参照してください。
        </p>
    </chapter>
</chapter>
</topic>