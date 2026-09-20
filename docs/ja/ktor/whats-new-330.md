[//]: # (title: Ktor 3.3.0 の新機能)

<show-structure for="chapter,procedure" depth="2"/>

_[リリース日: 2025年9月11日](releases.md#release-details)_

Ktor 3.3.0 では、サーバー、クライアント、およびツール全体にわたって新しい機能が導入されました。この機能リリースの主なハイライトは以下の通りです。

* [静的リソース向けのカスタムフォールバックメカニズム](#custom-fallback)
* [OpenAPI 仕様の生成](#openapi-spec-gen)
* [HTTP/2 cleartext (h2c) のサポート](#http2-h2c-support)
* [実験的な WebRTC クライアント](#webrtc-client)

## Ktor Server {id="ktor-server"}

### 静的リソース向けのカスタムフォールバック {id="custom-fallback"}

Ktor 3.3.0 では、静的コンテンツ向けに新しい `fallback()` 関数が導入されました。これにより、リクエストされたリソースが見つからない場合のカスタム動作を定義できるようになります。

常に同じフォールバックファイルを提供する `default()` とは異なり、`fallback()` では、リクエストされた元のパスと現在の `ApplicationCall` にアクセスできます。これを利用して、リダイレクト、カスタムステータスコードの返却、あるいは動的な別のファイルの提供などを行うことができます。

カスタムフォールバックの動作を定義するには、`staticFiles()`、`staticResources()`、`staticZip()`、または `staticFileSystem()` 内で `fallback()` 関数を使用します。

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

### 静的コンテンツの LastModified および ETag ヘッダー {id="lastmodified-and-etag-headers-for-static-content"}

Ktor 3.3.0 では、静的リソースに対する `ETag` および `LastModified` ヘッダーのサポートが導入されました。[`ConditionalHeaders`](server-conditional-headers.md) プラグインがインストールされている場合、条件付きヘッダーを処理して、前回のリクエストからコンテンツが変更されていない場合にボディの送信を回避できます。

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

値は各リソースに基づいて動的に計算され、レスポンスに適用されます。

定義済みのプロバイダーを使用することも可能です。例えば、リソースコンテンツの SHA-256 ハッシュを使用して強力な `ETag` を生成できます。

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

### 開発モードのオートリロードに関する制限事項 {id="development-mode-auto-reload-limitations"}

Ktor 3.2.0 で導入された [suspend モジュール関数のサポート](whats-new-320.md#suspendable-module-functions) により、ブロッキングなモジュール参照を使用するアプリケーションでオートリロードが機能しなくなるリグレッションが発生しました。

このリグレッションは 3.3.0 でも継続しており、オートリロードは `suspend` 関数モジュールおよび構成参照（configuration references）でのみ動作します。

サポートされているモジュール宣言の例：

```kotlin
// サポート対象 — suspend 関数の参照
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// サポート対象 — 構成参照 (application.conf / application.yaml)
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

将来のリリースでブロッキング関数の参照のサポートを復元する予定です。それまでは、`development` モードでは `suspend` モジュールまたは構成参照を使用することを推奨します。

### HTTP/2 cleartext (h2c) のサポート {id="http2-h2c-support"}

Ktor 3.3.0 では、Netty エンジンにおいて HTTP/2 over cleartext (h2c) のサポートが導入されました。これにより、TLS 暗号化なしでの HTTP/2 通信が可能になります。このセットアップは、通常、ローカルテストやプライベートネットワークなどの信頼できる環境で使用されます。

h2c を有効にするには、エンジン設定で `enableH2c` フラグを true に設定します。詳細については、[TLS なしの HTTP/2](server-http2.md#http2-without-tls) を参照してください。

## Ktor Client {id="ktor-client"}

### SSE レスポンスボディのバッファリング {id="sse-response-body-buffer"}

これまで、SSE のエラー発生後に `response.bodyAsText()` を呼び出そうとすると、二重消費（double-consume）の問題により失敗していました。

Ktor 3.3.0 では、デバッグやエラー処理のために、処理済みの SSE データをキャプチャできる構成可能な診断バッファが導入されました。

[SSE プラグイン](client-server-sent-events.topic) のインストール時にバッファをグローバルに設定できます。

```kotlin
install(SSE) {
    bufferPolicy = SSEBufferPolicy.LastEvents(10)
}
```

または、コールごとに設定することも可能です。

```kotlin
client.sse(url, { bufferPolicy(SSEBufferPolicy.All) }) {
    // …
}
```

SSE ストリームが消費される際、クライアントは（ネットワークから再読み込みすることなく）メモリ内バッファに処理済みデータのスナップショットを保持します。エラーが発生した場合、ロギングや診断のために安全に `response?.bodyAsText()` を呼び出すことができます。

詳細については、[Response buffering](client-server-sent-events.topic#response-buffering) を参照してください。

### WebRTC クライアント {id="webrtc-client"}

このリリースでは、マルチプラットフォームプロジェクトにおけるピアツーピア（P2P）リアルタイム通信のための実験的な WebRTC クライアントサポートが導入されました。

WebRTC は、ビデオ通話、マルチプレイヤーゲーム、共同作業ツールなどのアプリケーションを可能にします。このリリースにより、JavaScript/Wasm および Android ターゲットにおいて、統一された Kotlin API を使用してピア接続を確立し、データチャネルを交換できるようになりました。iOS、JVM デスクトップ、および Native などの追加ターゲットは、将来のリリースで計画されています。

`HttpClient` と同様に、プラットフォームに応じたエンジンを選択し、設定を提供することで `WebRtcClient` を作成できます。

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
    // 同じ設定、追加のコンテキストは不要
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

作成されたクライアントは、Interactive Connectivity Establishment (ICE) を使用してピアツーピア接続を確立できます。ネゴシエーションが完了すると、ピア間でデータチャネルを開き、メッセージを交換できるようになります。

```kotlin
val connection = client.createPeerConnection()

// リモート ICE candidate を追加 (シグナリングチャネル経由で受信したもの)
connection.addIceCandidate(WebRtc.IceCandidate(candidateString, sdpMid, sdpMLineIndex))

// ローカル candidate の収集が完了するまで待機
connection.awaitIceGatheringComplete()

// 受信データチャネルイベントをリッスン
connection.dataChannelEvents.collect { event ->
   when (event) {
     is Open -> println("Another peer opened a chanel: ${event.channel}")
     is Closed -> println("Data channel is closed")
     is Closing, is BufferedAmountLow, is Error -> println(event)
   }
}

// チャネルを作成し、メッセージを送受信
val channel = connection.createDataChannel("chat")
channel.send("hello")
val answer = channel.receiveText()
```

使用方法や制限事項の詳細については、[WebRTC クライアント](client-webrtc.md) のドキュメントを参照してください。

### Updated OkHttp version {id="updated-okhttp-version"}

Ktor 3.3.0 では、Ktor クライアントの `OkHttp` エンジンが OkHttp 5.1.0（以前は 4.12.0）を使用するようにアップグレードされました。このメジャーバージョンの更新により、OkHttp と直接やり取りするプロジェクトでは API の変更が発生する可能性があります。そのようなプロジェクトでは互換性を確認してください。

### Unified OkHttp SSE session {id="unified-okhttp-sse-session"}

OkHttp エンジンは、Server-Sent Events (SSE) に標準 API を使用するようになり、以前導入された `OkHttpSSESession` に取って代わりました。この変更により、すべてのクライアントエンジンで SSE の処理が統一され、OkHttp 固有の実装による制限が解消されました。

## Gradle plugin {id="gradle-plugin"}

### OpenAPI 仕様の生成 {id="openapi-spec-gen"}
<primary-label ref="experimental"/>

Ktor 3.3.0 では、Gradle プラグインとコンパイラプラグインを介した実験的な OpenAPI 生成機能が導入されました。これにより、ビルド時にアプリケーションコードから直接 OpenAPI 仕様を生成できるようになります。

以下の機能を提供します。
- Ktor ルート定義を分析し、ネストされたルート、ローカル拡張、およびリソースパスをマージします。
- 直前の KDoc アノテーションを解析して、以下を含む OpenAPI メタデータを提供します。
    - パス、クエリ、ヘッダー、クッキー、およびボディパラメータ
    - レスポンスコードと型
    - セキュリティ、説明、非推奨、および外部リンク
- `call.receive()` および `call.respond()` からリクエストボディとレスポンスボディを推論します。

#### OpenAPI 仕様の生成 {id="generate-the-openapi-specification"}

Ktor のルートと KDoc アノテーションから OpenAPI 仕様ファイルを生成するには、次のコマンドを使用します。

```shell
./gradlew buildOpenApi
```

#### 仕様の提供 {id="serve-the-specification"}

生成された仕様を実行時に利用可能にするには、[OpenAPI](server-openapi.md) または [SwaggerUI](server-swagger-ui.md) プラグインを使用できます。

次の例では、生成された仕様ファイルを OpenAPI エンドポイントで提供します。

```kotlin
routing {
    openAPI("/docs", swaggerFile = "openapi/generated.json")
}
```

この機能の詳細については、[OpenAPI 仕様の生成](openapi-spec-generation.md) を参照してください。

## Shared {id="shared"}

### Updated Jetty version {id="updated-jetty-version"}

Jetty のサーバーおよびクライアントエンジンが Jetty 12 を使用するようにアップグレードされました。ほとんどのアプリケーションにおいて、このアップグレードは完全な後方互換性がありますが、クライアントおよびサーバーのコードは内部的に更新された Jetty API を利用するようになります。

プロジェクトで Jetty API を直接使用している場合は、破壊的な変更があることに注意してください。詳細については、[Jetty 公式移行ガイド](https://jetty.org/docs/jetty/12.1/programming-guide/migration/11-to-12.html) を参照してください。