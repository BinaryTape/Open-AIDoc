<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="server-server-sent-events" title="Ktor Serverにおける Server-Sent Events" help-id="sse_server">
<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="plugin_name" value="SSE"/>
<var name="example_name" value="server-sse"/>
<var name="package_name" value="io.ktor.server.sse"/>
<var name="artifact_name" value="ktor-server-sse"/>
<tldr>
        <p>
            <b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
        </p>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
</tldr>
<link-summary>
    SSE プラグインを使用すると、サーバーは HTTP 接続を介してイベントベースの更新をクライアントに送信できます。
</link-summary>
<snippet id="sse-description">
        <p>
            Server-Sent Events（SSE）は、サーバーが HTTP 接続を介してクライアントへ継続的にイベントをプッシュできるようにする技術です。クライアントが繰り返しサーバーをポーリングすることなく、サーバーからイベントベースの更新を送信する必要がある場合に特に役立ちます。
        </p>
        <p>
            Ktor でサポートされている SSE プラグインは、サーバーとクライアント間に単方向接続を作成するためのわかりやすい方法を提供します。
        </p>
</snippet>
<tip>
    <p>クライアント側のサポート向け SSE プラグインの詳細については、
        <Links href="/ktor/client-server-sent-events" summary="The SSE plugin allows a client to receive event-based updates from a server over an HTTP connection.">SSE クライアントプラグイン</Links>
        を参照してください。
    </p>
</tip>
<note>
    <p>
        双方向通信には、<Links href="/ktor/server-websockets" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">WebSockets</Links> の使用を検討してください。WebSocket プロトコルを使用して、サーバーとクライアント間の全二重通信を提供します。
    </p>
</note>
<chapter title="制限事項" id="limitations">
    <p>
        Ktor は SSE レスポンスのデータ圧縮をサポートしていません。
        <Links href="/ktor/server-compression" summary="Required dependencies: io.ktor:%artifact_name% Code example: %example_name% Native server support: ✖️">Compression</Links> プラグインを使用している場合、デフォルトで SSE レスポンスの圧縮はスキップされます。
    </p>
</chapter>
<chapter title="依存関係の追加" id="add_dependencies">
    <p>
        <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
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
<chapter title="SSE のインストール" id="install_plugin">
    <p>
        <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の <code>install</code> 関数に渡します。
        以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
    </p>
    <list>
        <li>
            <code>embeddedServer()</code> 関数呼び出し内でのインストール。
        </li>
        <li>
            <code>Application</code> クラスで明示的に定義された <code>module()</code> 拡張関数内でのインストール。
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
<chapter title="SSE セッションの処理" id="handle-sessions">
    <p>
        <code>SSE</code> プラグインをインストールしたら、SSE セッションを処理するルートを追加できます。
        これを行うには、<a href="#define_route">routing</a> ブロック内で <code>sse()</code> 関数を呼び出します。SSE ルートを設定する方法は2つあります。
    </p>
    <list type="decimal">
        <li>
            <p>特定の URL パスを指定する場合:</p>
            <code-block lang="kotlin" code="                    routing {&#10;                        sse(&amp;quot;/events&amp;quot;) {&#10;                            // send events to clients&#10;                        }&#10;                    }"/>
        </li>
        <li>
            <p>
                パスを指定しない場合:
            </p>
            <code-block lang="kotlin" code="                    routing {&#10;                        sse {&#10;                            // send events to clients&#10;                        }&#10;                    }"/>
        </li>
    </list>
    <chapter title="SSE セッションブロック" id="session-block">
        <p>
            <code>sse</code> ブロック内では、指定されたパスのハンドラーを定義します。これは
            <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/-server-s-s-e-session/index.html">
                <code>ServerSSESession</code>
            </a>
            クラスによって表されます。ブロック内では以下の関数およびプロパティを使用できます。
        </p>
        <deflist>
            <def id="send">
                <title><code>send()</code></title>
                <code>ServerSentEvent</code> を作成し、クライアントへ送信します。
            </def>
            <def id="call">
                <title><code>call</code></title>
                セッションを開始した、関連付けられた受信 <code>ApplicationCall</code> です。
            </def>
            <def id="close">
                <title><code>close()</code></title>
                セッションを閉じ、クライアントとの接続を切断します。すべての <code>send()</code> 操作が完了すると、<code>close()</code> メソッドは自動的に呼び出されます。
                <note>
                    <code>close()</code> 関数を使用してセッションを閉じても、クライアントへ終了イベントは送信されません。セッションを閉じる前に SSE ストリームの終了を示すには、<code>send()</code> 関数を使用して特定のイベントを送信してください。
                </note>
            </def>
        </deflist>
    </chapter>
    <chapter title="例: 単一セッションの処理" id="handle-single-session">
        <p>
            以下の例は、<code>/events</code> エンドポイントで SSE セッションを設定し、それぞれ 1 秒（1000ms）の間隔を空けて SSE チャネル経由で 6 つの個別イベントを送信する方法を示しています。
        </p>
        <code-block lang="kotlin" code="    routing {&#10;        sse(&quot;/events&quot;) {&#10;            repeat(6) {&#10;                send(ServerSentEvent(&quot;this is SSE #$it&quot;))&#10;                delay(1000)&#10;            }&#10;        }&#10;    }"/>
        <p>完全なサンプルコードについては、
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-sse">server-sse</a> を参照してください。
        </p>
    </chapter>
    <chapter title="SSE ハートビート" id="heartbeat">
        <p>
            ハートビートは、定期的にイベントを送信することで、無通信期間中も SSE 接続をアクティブに保ちます。セッションがアクティブである限り、サーバーは設定された間隔で指定されたイベントを送信します。
        </p>
        <p>
            ハートビートを有効にして設定するには、SSE ルートハンドラー内で
            <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/heartbeat.html">
                <code>.heartbeat()</code>
            </a>
            関数を使用します。
        </p>
        <code-block lang="kotlin" code="        sse(&quot;/heartbeat&quot;) {&#10;            heartbeat {&#10;                period = 10.milliseconds&#10;                event = ServerSentEvent(&quot;heartbeat&quot;)&#10;            }&#10;            // ...&#10;        }"/>
        <p>
            この例では、接続を維持するために 10 ミリ秒ごとにハートビートイベントが送信されます。
        </p>
        <p>
            <code>eventProvider</code> プロパティを使用して、ハートビートイベントを動的に生成することもできます。
        </p>
        <code-block lang="kotlin" code="        sse(&quot;/heartbeat-custom&quot;) {&#10;            heartbeat {&#10;                period = 30.milliseconds&#10;                eventProvider = {&#10;                    ServerSentEvent(data = &quot;ts=${Clock.System.now()}&quot;)&#10;                }&#10;            }&#10;            // ...&#10;        }"/>
        <p>
            <code>eventProvider</code> が設定されている場合、各ハートビートのティック（発生時）に呼び出されて <code>ServerSentEvent</code> を生成します。これにより、ハートビートイベントにタイムスタンプやステータス情報などの動的コンテンツを含めることが可能になります。
        </p>
        <p>
            <code>event</code> と <code>eventProvider</code> の両方が設定されている場合は、<code>eventProvider</code> が <code>event</code> よりも優先されます。
        </p>
    </chapter>
    <chapter title="シリアライゼーション" id="serialization">
        <p>
            シリアライゼーションを有効にするには、SSE ルートの <code>serialize</code> パラメーターを使用してカスタムのシリアライゼーション関数を指定します。ハンドラー内では、
            <a href="https://api.ktor.io/ktor-server-sse/io.ktor.server.sse/-server-s-s-e-session-with-serialization/index.html">
                <code>ServerSSESessionWithSerialization</code>
            </a>
            クラスを使用してシリアライズされたイベントを送信できます。
        </p>
        <code-block lang="kotlin" code="@Serializable&#10;data class Customer(val id: Int, val firstName: String, val lastName: String)&#10;&#10;@Serializable&#10;data class Product(val id: Int, val prices: List&lt;Int&gt;)&#10;&#10;fun Application.module() {&#10;    install(SSE)&#10;&#10;    routing {&#10;        // example with serialization&#10;        sse(&quot;/json&quot;, serialize = { typeInfo, it -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.encodeToString(serializer, it)&#10;        }) {&#10;            send(Customer(0, &quot;Jet&quot;, &quot;Brains&quot;))&#10;            send(Product(0, listOf(100, 200)))&#10;        }&#10;    }&#10;}"/>
        <p>
            この例の <code>serialize</code> 関数は、データオブジェクトを JSON に変換する役割を持ち、その JSON が <code>ServerSentEvent</code> の <code>data</code> フィールドに配置されます。
        </p>
        <p>完全なサンプルコードについては、
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-sse">server-sse</a> を参照してください。
        </p>
    </chapter>
</chapter>
</topic>