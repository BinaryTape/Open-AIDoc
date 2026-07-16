[//]: # (title: Ktor サーバーにおける WebSockets)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="WebSockets"/>
<var name="package_name" value="io.ktor.server.websocket"/>
<var name="artifact_name" value="ktor-server-websockets"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="server-websockets"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
Websocketsプラグインを使用すると、サーバーとクライアントの間で多方向の通信セッションを作成できます。
</link-summary>

<snippet id="websockets-description">

WebSocketは、単一のTCP接続を介して、ユーザーのブラウザとサーバーとの間にフルデュプレックス（全二重）の通信セッションを提供するプロトコルです。これは、サーバーとの間でのリアルタイムなデータ転送を必要とするアプリケーションを作成する場合に特に便利です。

Ktorは、サーバー側とクライアント側の両方でWebSocketプロトコルをサポートしています。

</snippet>

Ktorでは以下のことが可能です。

* フレームサイズ、pingの間隔などの基本的なWebSocket設定を構成する。
* サーバーとクライアント間でメッセージを交換するためのWebSocketセッションを処理する。
* WebSocket拡張機能を追加する。例えば、[Deflate](server-websocket-deflate.md)拡張機能を使用したり、[カスタム拡張機能](server-websocket-extensions.md)を実装したりできます。

> クライアント側でのWebSocketサポートについては、[WebSocketsクライアントプラグイン](client-websockets.topic)を参照してください。

> 一方向の通信セッションについては、[Server-Sent Events (SSE)](server-server-sent-events.topic)の使用を検討してください。SSEは、サーバーがクライアントに対してイベントベースの更新を送信する必要がある場合に特に有用です。
>
{style="note"}

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを含める必要があります。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## WebSocketsのインストール {id="install_plugin"}

<p>
    アプリケーションに<code>%plugin_name%</code>プラグインを<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code>関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code>クラスの拡張関数である、明示的に定義された<code>module</code>内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## WebSocketsの構成 {id="configure"}

オプションとして、`install`ブロック内で[WebSocketOptions](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-web-sockets/-web-socket-options/index.html)を渡すことでプラグインを構成できます。

* `pingPeriod`プロパティを使用して、pingの間隔を指定します。
* `timeout`プロパティを使用して、接続を閉じるまでのタイムアウトを設定します。
* `maxFrameSize`プロパティを使用して、受信または送信可能な最大フレームサイズを設定します。
* `masking`プロパティを使用して、マスキングを有効にするかどうかを指定します。
* `contentConverter`プロパティを使用して、シリアライズ/デシリアライズのためのコンバーターを設定します。

```kotlin
install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    maxFrameSize = Long.MAX_VALUE
    masking = false
}
```

## WebSocketsセッションの処理 {id="handle-sessions"}

### APIの概要 {id="api-overview"}

`WebSockets`プラグインをインストールして構成したら、WebSocketセッションを処理するためのエンドポイントを定義できます。サーバー上でWebSocketエンドポイントを定義するには、[routing](server-routing.md#define_route)ブロック内で`webSocket`関数を呼び出します。

```kotlin
routing { 
    webSocket("/echo") {
       // WebSocketセッションを処理する
    }
}
```

この例では、[デフォルト設定](server-configuration-file.topic)が使用されている場合、サーバーは`ws://localhost:8080/echo`へのWebSocketリクエストを受け入れます。

`webSocket`ブロック内では、[DefaultWebSocketServerSession](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-default-web-socket-server-session/index.html)クラスによって表されるWebSocketセッションのハンドラーを定義します。
ブロック内では、以下の関数とプロパティが利用可能です。

* `send`関数を使用して、テキストコンテンツをクライアントに送信します。
* `incoming`および`outgoing`プロパティを使用して、WebSocketフレームを受信および送信するためのチャネルにアクセスします。フレームは`Frame`クラスによって表されます。
* `close`関数を使用して、指定された理由とともにクローズフレームを送信します。

セッションを処理する際、以下のようにフレームタイプを確認できます。

* `Frame.Text`はテキストフレームです。このフレームタイプでは、`Frame.Text.readText()`を使用してその内容を読み取ることができます。
* `Frame.Binary`はバイナリフレームです。このタイプでは、`Frame.Binary.readBytes()`を使用してその内容を読み取ることができます。

> `incoming`チャネルには、ping/pongやクローズフレームなどの制御フレームは含まれていないことに注意してください。
> 制御フレームを処理したり、断片化されたフレームを再構成したりするには、[webSocketRaw](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/web-socket-raw.html)関数を使用してWebSocketセッションを処理します。
>
{style="note"}

> クライアントに関する情報（クライアントのIPアドレスなど）を取得するには、`call`プロパティを使用します。[一般的なリクエスト情報](server-requests.md#request_information)について詳しく学びましょう。

以下では、このAPIの使用例を見ていきます。

### 例: 単一セッションの処理 {id="handle-single-session"}

以下の例は、1つのクライアントとのセッションを処理するための`echo` WebSocketエンドポイントを作成する方法を示しています。

```kotlin
routing {
    webSocket("/echo") {
        send("Please enter your name")
        for (frame in incoming) {
            frame as? Frame.Text ?: continue
            val receivedText = frame.readText()
            if (receivedText.equals("bye", ignoreCase = true)) {
                close(CloseReason(CloseReason.Codes.NORMAL, "Client said BYE"))
            } else {
                send(Frame.Text("Hi, $receivedText!"))
            }
        }
    }
}
```

完全な例については、[server-websockets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets)を参照してください。

### 例: 複数セッションの処理 {id="handle-multiple-session"}

複数のWebSocketセッションを効率的に管理し、ブロードキャストを処理するために、Kotlinの[`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)を活用できます。このアプローチは、WebSocket通信を管理するための、スケーラブルで並行処理に適した方法を提供します。このパターンの実装方法は以下の通りです。

1. メッセージをブロードキャストするための`SharedFlow`を定義します。

```kotlin
val messageResponseFlow = MutableSharedFlow<MessageResponse>()
val sharedFlow = messageResponseFlow.asSharedFlow()
```

2. WebSocketルート内で、ブロードキャストとメッセージ処理のロジックを実装します。

```kotlin

        webSocket("/ws") {
            send("You are connected to WebSocket!")

            val job = launch {
                sharedFlow.collect { message ->
                    send(message.message)
                }
            }

            runCatching {
                incoming.consumeEach { frame ->
                    if (frame is Frame.Text) {
                        val receivedText = frame.readText()
                        val messageResponse = MessageResponse(receivedText)
                        messageResponseFlow.emit(messageResponse)
                    }
                }
            }.onFailure { exception ->
                println("WebSocket exception: ${exception.localizedMessage}")
            }.also {
                job.cancel()
            }
        }
```

`runCatching`ブロックは受信メッセージを処理し、それらを`SharedFlow`にエミットします。その後、`SharedFlow`はすべてのコレクターにブロードキャストします。

このパターンを使用すると、個々の接続を手動で追跡することなく、複数のWebSocketセッションを効率的に管理できます。このアプローチは、多くの同時接続を持つアプリケーションでも適切にスケールし、メッセージのブロードキャストを処理するためのクリーンでリアクティブな方法を提供します。

完全な例については、[server-websockets-sharedflow](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets-sharedflow)を参照してください。

## WebSocket APIとKtor {id="websocket-api"}

[WebSocket APIの標準イベント](https://developer.mozilla.org/ja/docs/Web/API/WebSockets_API)は、Ktorでは以下のようにマッピングされます。

* `onConnect`はブロックの開始時に発生します。
* `onMessage`は、メッセージの読み取りに成功した後（例えば、`incoming.receive()`を使用した場合）、または`for(frame in incoming)`によるサスペンド・イテレーションを使用している場合に発生します。
* `onClose`は、`incoming`チャネルが閉じられたときに発生します。これによりサスペンド・イテレーションが完了するか、メッセージを受信しようとしたときに`ClosedReceiveChannelException`がスローされます。
* `onError`は他の例外と同等です。

`onClose`と`onError`の両方で、`closeReason`プロパティが設定されます。

次の例では、例外（`ClosedReceiveChannelException`またはその他の例外）が発生したときにのみ、無限ループから抜け出します。

```kotlin
webSocket("/echo") {
    println("onConnect")
    try {
        for (frame in incoming){
            val text = (frame as Frame.Text).readText()
            println("onMessage")
            received += text
            outgoing.send(Frame.Text(text))
        }
    } catch (e: ClosedReceiveChannelException) {
        println("onClose ${closeReason.await()}")
    } catch (e: Throwable) {
        println("onError ${closeReason.await()}")
        e.printStackTrace()
    }
}