[//]: # (title: Ktor 3.3.0 の新機能)

<show-structure for="chapter,procedure" depth="2"/>

_[リリース日: 2025年9月11日](releases.md#release-details)_

Ktor 3.3.0 では、サーバー、クライアント、ツールの各領域にわたって新しい機能が提供されます。この機能リリースの主なハイライトは以下のとおりです:

* [静的リソース向けのカスタムフォールバックメカニズム](#custom-fallback)
* [OpenAPI 仕様の生成](#openapi-spec-gen)
* [HTTP/2 クリアテキスト (h2c) サポート](#http2-h2c-support)
* [実験的な WebRTC クライアント](#webrtc-client)

## Ktor Server {id="ktor-server"}

### 静的リソース向けのカスタムフォールバック {id="custom-fallback"}

Ktor 3.3.0 では、静的コンテンツ向けに新しい `fallback()` 関数が導入され、リクエストされたリソースが見つからない場合のカスタム動作を定義できるようになりました。

常に同じフォールバックファイルを提供する `default()` とは異なり、`fallback()` では元のリクエストパスと現在の `ApplicationCall` にアクセスできます。これを利用して、リダイレクトやカスタムステータスコードの返却、異なるファイルの動的な提供が可能です。

カスタムフォールバックの動作を定義するには、`staticFiles()`、`staticResources()`、`staticZip()`、または `staticFileSystem()` 内で `fallback()` 関数を使用します:

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 絶対パス
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 相対パス
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 静的コンテンツ向けの LastModified および ETag ヘッダー {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0 では、静的リソースに対する `ETag` および `LastModified` ヘッダーのサポートが導入されました。[`ConditionalHeaders`](server-conditional-headers.md) プラグインがインストールされている場合、前回の要求からコンテンツが変更されていないときに本文の送信を避けるため、条件付きヘッダーを処理できます:

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

値は各リソースに基づいて動的に計算され、レスポンスに適用されます。

また、定義済みのプロバイダーを使用して、例えばリソースコンテンツの SHA‑256 ハッシュを用いた強い `ETag` を生成することも可能です:

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 開発モードにおける自動リロードの制限 {id="development-mode-auto-reload-limitations"}

Ktor 3.2.0 で導入された [suspend モジュール関数のサポート](whats-new-320.md#suspendable-module-functions) により、ブロッキングなモジュール参照を使用するアプリケーションで自動リロードが機能しなくなるリグレッションが発生しました。

このリグレッションは 3.3.0 でも残っており、自動リロードは引き続き `suspend` 関数のモジュールおよび設定参照でのみ機能します。

サポート対象のモジュール宣言の例:

```kotlin
// サポート対象 — suspend 関数の参照
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// サポート対象 — 設定の参照 (application.conf / application.yaml)
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

将来のリリースでブロッキング関数の参照のサポートを復元する予定です。それまでは、`development` モードでは `suspend` モジュールまたは設定参照を使用することをお勧めします。

### HTTP/2 クリアテキスト (h2c) サポート {id="http2-h2c-support"}

Ktor 3.3.0 では、Netty エンジン向けに HTTP/2 over cleartext (h2c) のサポートが導入され、TLS 暗号化なしでの HTTP/2 通信が可能になりました。
このセットアップは通常、ローカルテストやプライベートネットワークなどの信頼できる環境で使用されます。

h2c を有効にするには、エンジン設定で `enableH2c` フラグを true に設定します。
詳細については、[HTTP/2 without TLS](server-http2.md#http2-without-tls) を参照してください。

## Ktor Client {id="ktor-client"}

### SSE レスポンスボディバッファ {id="sse-response-body-buffer"}

これまでは、SSE エラーの発生後に `response.bodyAsText()` を呼び出そうとすると、二重消費の問題により失敗していました。

Ktor 3.3.0 では、デバッグやエラーハンドリングのために、すでに処理された SSE データをキャプチャできる設定可能な診断バッファが導入されました。

[SSE プラグイン](client-server-sent-events.topic) のインストール時に、バッファをグローバルに設定できます:

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

または呼び出しごとに設定することもできます:

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

SSE ストリームが消費されると、クライアントは処理されたデータのスナップショットを（ネットワークから再読み込みすることなく）インメモリバッファに保持します。エラーが発生した場合でも、ログ記録や診断のために安全に `response?.bodyAsText()` を呼び出すことができます。

詳細については、[Response buffering](client-server-sent-events.topic#response-buffering) を参照してください。

### WebRTC クライアント {id="webrtc-client"}

本リリースでは、マルチプラットフォームプロジェクトにおけるピアツーピア（P2P）リアルタイム通信のための実験的な WebRTC クライアントサポートが導入されます。

WebRTC は、ビデオ通話、マルチプレイヤーゲーム、コラボレーションツールなどのアプリケーションを実現します。本リリースにより、JavaScript/Wasm および Android ターゲット間で、統一された Kotlin API を使用してピア接続の確立やデータチャネルのやり取りができるようになりました。iOS、JVM デスクトップ、Native などの追加ターゲットは、今後のリリースで予定されています。

`HttpClient` と同様に、プラットフォームに応じたエンジンを選択し設定を提供することで、`WebRtcClient` を作成できます:

<Tabs group="platform" id="create-webrtc-client">
<TabItem title="JS/Wasm" group-key="js-wasm">

```kotlin
val jsClient = WebRtcClient(JsWebRtc) {
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>
<TabItem title="Android" group-key="android">

```kotlin
val androidClient = WebRtcClient(AndroidWebRtc) {
    context = appContext // 必須: Android の context を提供
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>

<TabItem title="iOS" group-key="ios">

```kotlin
val iosClient = WebRtcClient(IosWebRtc) {
    // 同様の設定、追加の context は不要
}
```

</TabItem>

<TabItem title="JVM" group-key="jvm">

```kotlin
val jvmClient = WebRtcClient(JvmWebRtc) {
    defaultConnectionConfig = {
        iceServers = listOf(WebRtc.IceServer("stun:stun.l.google.com:19302"))
    }
}
```

</TabItem>
</Tabs>

作成後、クライアントは Interactive Connectivity Establishment (ICE) を使用してピアツーピア接続を確立できます。ネゴシエーションが完了すると、ピア同士でデータチャネルを開いてメッセージを交換できます。

```kotlin
val connection = client.createPeerConnection()

// リモート ICE candidate を追加（シグナリングチャネル経由で受信）
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// すべてのローカル candidate の収集が完了するまで待機
connection.awaitIceGatheringComplete()

// 受信したデータチャネルのイベントをリッスン
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// チャネルを作成してメッセージを送受信
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

使用方法および制限事項の詳細については、[WebRTC client](client-webrtc.md) のドキュメントを参照してください。

### OkHttp のバージョン更新 {id="updated-okhttp-version"}

Ktor 3.3.0 では、Ktor クライアントの `OkHttp` エンジンが OkHttp 5.1.0（以前は 4.12.0）を使用するようにアップグレードされました。このメジャーバージョンアップにより、OkHttp と直接やり取りするプロジェクトでは API の変更が発生する可能性があります。該当するプロジェクトでは互換性を確認してください。

### 統一された OkHttp SSE セッション {id="unified-okhttp-sse-session"}

OkHttp エンジンは、以前導入された `OkHttpSSESession` に代わり、Server-Sent Events (SSE) の標準 API を使用するようになりました。
この変更により、すべてのクライアントエンジンで SSE の処理が統一され、OkHttp 固有の実装による制限が解消されます。

## Gradle プラグイン {id="gradle-plugin"}

### OpenAPI 仕様の生成 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0 では、Gradle プラグインとコンパイラプラグインを介した実験的な OpenAPI 生成機能が導入されました。これにより、ビルド時にアプリケーションコードから直接 OpenAPI 仕様を生成できます。

以下の機能を提供します:
- Ktor のルート定義を解析し、ネストされたルート、ローカル拡張、およびリソースパスをマージする。
- 直前の KDoc アノテーションをパースして、以下を含む OpenAPI メタデータを提供する:
    - パス、クエリ、ヘッダー、Cookie、およびボディパラメータ
    - レスポンスコードと型
    - セキュリティ、説明、非推奨情報、および外部ドキュメントリンク
- `call.receive()` および `call.respond()` からリクエストボディとレスポンスボディを推論する。

#### OpenAPI 仕様の生成 {id="generate-the-openapi-specification"}

Ktor のルートと KDoc アノテーションから OpenAPI 仕様ファイルを生成するには、次のコマンドを実行します:

```shell
./gradlew buildOpenApi
```

#### 仕様の提供 {id="serve-the-specification"}

生成された仕様を実行時に利用可能にするには、[OpenAPI](server-openapi.md) プラグインまたは [SwaggerUI](server-swagger-ui.md) プラグインを使用できます。

次の例では、生成された仕様ファイルを OpenAPI エンドポイントで提供します:

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

この機能の詳細については、[OpenAPI specification generation](openapi-spec-generation.md) を参照してください。

## 共通 {id="shared"}

### Jetty のバージョン更新 {id="updated-jetty-version"}

Jetty サーバーおよびクライアントエンジンが Jetty 12 を使用するようにアップグレードされました。ほとんどのアプリケーションにとって、このアップグレードは完全な後方互換性がありますが、クライアントおよびサーバーのコードは内部で更新された Jetty API を利用するようになっています。

プロジェクトで Jetty API を直接使用している場合は、破壊的変更が存在することに注意してください。詳細については、[公式の Jetty 移行ガイド](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html) を参照してください。