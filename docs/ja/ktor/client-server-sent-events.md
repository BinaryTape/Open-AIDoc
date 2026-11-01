<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-server-sent-events" title="Ktor Client における Server-Sent Events" help-id="sse_client">
<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<tldr>
    <var name="example_name" value="client-sse"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    SSE プラグインを使用すると、クライアントは HTTP 接続を介してサーバーからイベントベースの更新を受信できます。
</link-summary>
<p>
    Server-Sent Events（SSE）は、サーバーが HTTP 接続を介してクライアントにイベントを継続的にプッシュできるようにする技術です。クライアントがサーバーに対して繰り返しポーリングを行うことなく、サーバーからイベントベースの更新を送信する必要がある場合に特に有用です。
</p>
<p>
    Ktor がサポートする SSE プラグインは、サーバーとクライアント間の単方向接続を作成するための分かりやすい方法を提供します。
</p>
<tip>
    <p>サーバー側のサポートを提供する SSE プラグインの詳細については、
        <Links href="server-server-sent-events.topic" summary="SSE プラグインを使用すると、サーバーは HTTP 接続を介してクライアントにイベントベースの更新を送信できます。">SSE サーバープラグイン</Links>
        を参照してください。
    </p>
</tip>
<chapter title="依存関係の追加" id="add_dependencies">
    <p>
        <code>SSE</code> に必要なのは <Links href="client-dependencies.md" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">ktor-client-core</Links> アーティファクトのみであり、特定の個別依存関係は必要ありません。
    </p>
</chapter>
<chapter title="SSE のインストール" id="install_plugin">
    <p>
        <code>SSE</code> プラグインをインストールするには、<a href="client-create-and-configure.md#configure-client">クライアント構成ブロック</a>内で <code>install</code> 関数に渡します。
    </p>
    <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
</chapter>
<chapter title="SSE プラグインの設定" id="configure">
    <p>
        必要に応じて、<a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a> クラスのサポートされているプロパティを設定することで、<code>install</code> ブロック内で SSE プラグインを構成できます。
    </p>
    <chapter title="SSE の再接続" id="sse-reconnect">
        <p>
            自動再接続を有効にするには、<code>maxReconnectionAttempts</code> を <code>0</code> より大きい値に設定します。また、<code>reconnectionTime</code> を使用して試行間の遅延を設定することもできます。
        </p>
        <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
        <p>
            サーバーへの接続が失われた場合、クライアントは指定された <code>reconnectionTime</code> だけ待機してから再接続を試みます。接続を再確立するために、指定された <code>maxReconnectionAttempts</code> まで試行を繰り返します。
        </p>
    </chapter>
    <chapter title="イベントのフィルタリング" id="filter-events">
        <p>
            以下の例では、SSE プラグインを HTTP クライアントにインストールし、受信フローにコメントのみを含むイベントと <code>retry</code> フィールドのみを含むイベントを含めるように構成しています。
        </p>
        <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
    </chapter>
    <chapter title="レスポンスのバッファリング" id="response-buffering">
        <p>
            SSE レスポンスは本質的にストリーミングであるため、ボディ全体をキャプチャすることは実用的ではありません。SSE ストリームで障害が発生したときにレスポンスボディを安全に取得できるよう、診断用バッファを有効にできます。このバッファには既に処理されたデータのみが含まれ（ネットワークからの再読み込みは行われません）、障害発生時のロギングやエラー分析を目的としています。
        </p>
        <code-block lang="kotlin" code="                install(SSE) {&#10;                    bufferPolicy = SSEBufferPolicy.LastEvents(10)&#10;                }"/>
        <p>
            呼び出しごとにバッファを構成することもできます。
        </p>
        <code-block lang="kotlin" code="                client.sse(url, {&#10;                    bufferPolicy(SSEBufferPolicy.All)&#10;                }) {&#10;                    // ...&#10;                }"/>
        <chapter title="バッファポリシー" id="buffer-policies">
            <p>
                <code>SSEBufferPolicy</code> タイプは、処理された SSE データを保存するためのいくつかの戦略を提供します。これらのポリシーは、ストリームのどの程度をメモリに保持し、エラー発生時に利用可能にするかを制御します。
            </p>
            <deflist>
                <def id="buffer-off">
                    <title><code>Off</code>（デフォルト）</title>
                    バッファリングを行いません。
                </def>
                <def id="buffer-lastlines">
                    <title><code>LastLines(n)</code></title>
                    直近の n 行を保持します。
                </def>
                <def id="buffer-lastevent">
                    <title><code>LastEvent</code></title>
                    最後に完了した SSE イベントを保持します。
                </def>
                <def id="buffer-lastevents">
                    <title><code>LastEvents(n)</code></title>
                    直近の完了した n 個の SSE イベントを保持します。
                </def>
                <def id="buffer-all">
                    <title><code>All</code></title>
                    それまでに処理されたすべてのイベントを保持します。
                    <note>長時間実行されるストリームでは注意して使用してください。</note>
                </def>
            </deflist>
            <p>
                障害が発生した場合は、ネットワークから再読み込みすることなく <code>response?.bodyAsText()</code> を使用してバッファにアクセスできます。
            </p>
        </chapter>
    </chapter>
</chapter>
<chapter title="SSE セッションの処理" id="handle-sse-sessions">
    <p>
        クライアントの SSE セッションは、<a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a> インターフェースによって表されます。このインターフェースは、サーバーから Server-Sent Events を受信するための API を公開しています。
    </p>
    <chapter title="SSE セッションへのアクセス" id="access-sse-session">
        <p><code>HttpClient</code> では、次のいずれかの方法で SSE セッションにアクセスできます。</p>
        <list>
            <li><a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse.html"><code>sse()</code></a> 関数は、SSE セッションを作成し、そのセッションに対する操作を可能にします。
            </li>
            <li><a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html"><code>sseSession()</code></a> 関数を使用すると、SSE セッションを開くことができます。
            </li>
        </list>
        <p>URL エンドポイントを指定するには、2 つのオプションから選択できます。</p>
        <list>
            <li><code>urlString</code> パラメータを使用して、URL 全体を文字列として指定します。</li>
            <li><code>schema</code>、<code>host</code>、<code>port</code>、および <code>path</code> パラメータを使用して、プロトコルスキーム、ドメイン名、ポート番号、パス名をそれぞれ個別に指定します。
            </li>
        </list>
        <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
        <note>
            <code>ClientSSESession</code> および <code>ClientSSESessionWithDeserialization</code> インスタンスは、セッションの継続期間中のみ有効です。これらのスコープは、<code>serverSentEvents { ... }</code> ブロックが完了するか接続が閉じられると自動的にキャンセルされます。
        </note>
        <p>オプションとして、接続を構成するために以下のパラメータが利用可能です。</p>
        <deflist>
            <def id="reconnectionTime-param">
                <title><code>reconnectionTime</code></title>
                再接続の遅延時間を設定します。
            </def>
            <def id="showCommentEvents-param">
                <title><code>showCommentEvents</code></title>
                受信フローにコメントのみを含むイベントを表示するかどうかを指定します。
            </def>
            <def id="showRetryEvents-param">
                <title><code>showRetryEvents</code></title>
                受信フローに <code>retry</code> フィールドのみを含むイベントを表示するかどうかを指定します。
            </def>
            <def id="deserialize-param">
                <title><code>deserialize</code></title>
                <code>TypedServerSentEvent</code> の <code>data</code> フィールドをオブジェクトに変換するためのデシリアライザ関数です。詳細については、<a href="#deserialization">デシリアライゼーション</a>を参照してください。
            </def>
        </deflist>
    </chapter>
    <chapter title="SSE セッションブロック" id="sse-session-block">
        <p>
            ラムダ引数内では、<a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a> コンテキストにアクセスできます。ブロック内では以下のプロパティが使用可能です。
        </p>
        <deflist>
            <def id="call">
                <title><code>call</code></title>
                セッションを開始した関連付けられている <code>HttpClientCall</code>。
            </def>
            <def id="incoming">
                <title><code>incoming</code></title>
                受信する Server-Sent Events のフロー。
            </def>
        </deflist>
        <p>
            以下の例では、<code>events</code> エンドポイントを使用して新しい SSE セッションを作成し、<code>incoming</code> プロパティを介してイベントを読み取り、受信した <a href="https://api.ktor.io/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a> を出力します。
        </p>
        <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
        <p>完全なコード例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a> を参照してください。
        </p>
    </chapter>
    <chapter title="デシリアライゼーション" id="deserialization">
        <p>
            SSE プラグインは、Server-Sent Events からタイプセーフな Kotlin オブジェクトへのデシリアライゼーションをサポートしています。この機能は、サーバーからの構造化データを処理する際に特に便利です。
        </p>
        <p>
            デシリアライゼーションを有効にするには、SSE アクセス関数の <code>deserialize</code> パラメータを使用してカスタムのデシリアライゼーション関数を指定し、<a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html"><code>ClientSSESessionWithDeserialization</code></a> クラスを使用してデシリアライズされたイベントを処理します。
        </p>
        <p>
            以下は、JSON データをデシリアライズするために <code>kotlinx.serialization</code> を使用する例です。
        </p>
        <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
        <p>完全なコード例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a> を参照してください。
        </p>
    </chapter>
</chapter>
</topic>