[//]: # (title: Ktor Server における WebSockets)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="WebSockets"/>
<var name="package_name" value="io.ktor.server.websocket"/>
<var name="artifact_name" value="ktor-server-websockets"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.websockets"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="server-websockets"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
Websockets プラグインを使用すると、サーバーとクライアント間で双方向の通信セッションを作成できます。
</link-summary>

<snippet id="websockets-description">

WebSocket は、単一の TCP 接続上でユーザーのブラウザとサーバー間の全二重通信セッションを提供するプロトコルです。サーバーとのリアルタイムなデータ送受信を必要とするアプリケーションの作成に特に役立ちます。

Ktor はサーバー側とクライアント側の両方で WebSocket プロトコルをサポートしています。

</snippet>

Ktor では以下のことが可能です:

* フレームサイズや ping 間隔などの基本的な WebSocket 設定を構成する。
* サーバーとクライアント間でメッセージをやり取りするための WebSocket セッションを処理する。
* WebSocket 拡張機能を追加する。例えば、[Deflate](server-websocket-deflate.md) 拡張機能を使用したり、[カスタム拡張機能](server-websocket-extensions.md)を実装したりできます。

> クライアント側での WebSocket サポートについては、[WebSockets クライアントプラグイン](client-websockets.topic)を参照してください。

> 単方向の通信セッションには、[Server-Sent Events (SSE)](server-server-sent-events.topic) の使用を検討してください。SSE は、サーバーがクライアントにイベントベースの更新を送信する必要がある場合に特に有用です。
>
{style="note"}

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## WebSockets のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスに明示的に定義された <code>module()</code> 拡張関数内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## WebSockets の構成 {id="configure"}

任意で、[WebSocketOptions](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-web-sockets/-web-socket-options/index.html) を渡すことで `install` ブロック内でプラグインを構成できます:

* `pingPeriod` プロパティを使用して、ping の間隔を指定します。
* `timeout` プロパティを使用して、接続が切断されるまでのタイムアウトを設定します。
* `maxFrameSize` プロパティを使用して、送受信可能な最大フレームサイズを設定します。
* `masking` プロパティを使用して、マスキングを有効にするかどうかを指定します。
* `contentConverter` プロパティを使用して、シリアライズ/デシリアライズ用のコンバーターを設定します。

```kotlin
install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    maxFrameSize = Long.MAX_VALUE
    masking = false
}
```

## WebSocket セッションの処理 {id="handle-sessions"}

### API の概要 {id="api-overview"}

`WebSockets` プラグインをインストールして構成したら、WebSocket セッションを処理するエンドポイントを定義できます。サーバー上に WebSocket エンドポイントを定義するには、[ルーティング](server-routing.md#define_route)ブロック内で `webSocket` 関数を呼び出します:

```kotlin
routing { 
    webSocket("/echo") {
       // Handle a WebSocket session
    }
}
```

この例では、[デフォルト設定](server-configuration-file.topic)を使用している場合、サーバーは `ws://localhost:8080/echo` への WebSocket リクエストを受け付けます。

`webSocket` ブロック内で、[DefaultWebSocketServerSession](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-default-web-socket-server-session/index.html) クラスによって表される WebSocket セッションのハンドラーを定義します。
ブロック内では、以下の関数およびプロパティを使用できます:

* `send` 関数を使用して、クライアントにテキストコンテンツを送信します。
* `incoming` および `outgoing` プロパティを使用して、WebSocket フレームの送受信用のチャネルにアクセスします。フレームは `Frame` クラスで表されます。
* `close` 関数を使用して、指定した理由を含むクローズフレームを送信します。

セッションを処理する際、以下のようにフレームタイプを確認できます:

* `Frame.Text` はテキストフレームです。このフレームタイプでは、`Frame.Text.readText()` を使用してその内容を読み取ることができます。
* `Frame.Binary` はバイナリフレームです。このタイプでは、`Frame.Binary.readBytes()` を使用してその内容を読み取ることができます。

> `incoming` チャネルには、ping/pong や close フレームなどの制御フレームが含まれていないことに注意してください。
> 制御フレームを処理し、断片化されたフレームを再構成するには、[webSocketRaw](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/web-socket-raw.html) 関数を使用して WebSocket セッションを処理してください。
>
{style="note"}

> クライアントに関する情報（クライアントの IP アドレスなど）を取得するには、`call` プロパティを使用します。[一般的なリクエスト情報](server-requests.md#request_information)を参照してください。

以下では、この API の使用例を見ていきます。

### 例: 単一セッションの処理 {id="handle-single-session"}

以下の例は、1 つのクライアントとのセッションを処理する `echo` WebSocket エンドポイントを作成する方法を示しています:

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

完全な例については、[server-websockets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets) を参照してください。

### 例: 複数セッションの処理 {id="handle-multiple-session"}

複数の WebSocket セッションを効率的に管理し、ブロードキャストを処理するために、Kotlin の [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) を利用できます。このアプローチにより、WebSocket 通信を管理するためのスケーラブルで並行処理に適した手法が提供されます。このパターンの実装方法は以下のとおりです:

1. メッセージをブロードキャストするための `SharedFlow` を定義します:

```kotlin
val messageResponseFlow = MutableSharedFlow<MessageResponse>()
val sharedFlow = messageResponseFlow.asSharedFlow()
```

2. WebSocket ルートで、ブロードキャストおよびメッセージ処理ロジックを実装します:

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

`runCatching` ブロックは受信したメッセージを処理して `SharedFlow` に送出し（emit）、その後すべてのコレクターにブロードキャストします。

このパターンを使用することで、個々の接続を手動で追跡することなく、複数の WebSocket セッションを効率的に管理できます。この手法は多数の同時 WebSocket 接続を持つアプリケーションにも良好にスケールし、メッセージのブロードキャストを処理するためのクリーンでリアクティブな方法を提供します。

完全な例については、[server-websockets-sharedflow](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets-sharedflow) を参照してください。

## WebSocket API と Ktor {id="websocket-api"}

[WebSocket API の標準イベント](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)は、以下のように Ktor にマッピングされます:

* `onConnect` は、ブロックの開始時に発生します。
* `onMessage` は、メッセージの読み取りに成功した後（例えば `incoming.receive()` を使用した場合）、または `for(frame in incoming)` による中断可能なイテレーション（suspended iteration）を使用した後に発生します。
* `onClose` は、`incoming` チャネルが閉じられたときに発生します。これにより中断可能なイテレーションが完了するか、メッセージを受信しようとしたときに `ClosedReceiveChannelException` がスローされます。
* `onError` は、その他の例外に相当します。

`onClose` と `onError` の両方で、`closeReason` プロパティが設定されます。

以下の例では、例外（`ClosedReceiveChannelException` またはその他の例外）が発生した場合にのみ無限ループが終了します:

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
```