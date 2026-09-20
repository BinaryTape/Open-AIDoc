[//]: # (title: Ktor 3.6.0 の新機能)

<show-structure for="chapter,procedure" depth="3"/>

_[リリース日: 2026年9月17日](releases.md#release-details)_

Ktor 3.6.0 では、サーバーとクライアントの両方にわたってさまざまな改善が行われました。この機能リリースの主なハイライトは以下のとおりです。

* [Netty サーバーエンジンにおける実験的な HTTP/3 サポート](#http3)
* [Kotlin Multiplatform 向けのデフォルトクライアントエンジン](#default-engines)
* [実験的な型付き認証サポート](#typed-auth)
* [実験的な OpenID Connect プラグイン](#oidc)
* [JVM 上での WebRTC クライアントサポート](#webrtc-jvm-support)

## Ktor Server {id="ktor-server"}

### リクエストパラメーターの追加の型サポート {id="additional-type-support-for-request-parameters"}

Ktor 3.6.0 では、リクエストパラメーターを型付きの値に変換する際にデフォルトでサポートされる型のセットが拡張されました。

以下の型が新たにサポートされます。

* `Byte`
* `java.lang.Byte`
* `UByte`
* `UInt`
* `UShort`
* `ULong`
* `Uuid`

例えば、プロパティ委任（property delegation）を通じて、ルートハンドラー内で直接 `Uuid` パラメーターを取得できます。

```kotlin
get {
    val uuid: Uuid by call.parameters
}
```

### 事前圧縮された静的ファイルに対する Zstandard（zstd）および DEFLATE サポート {id="zstandard-zstd-and-deflate-support-for-pre-compressed-static-files"}

Ktor で、Zstandard（zstd）および DEFLATE 形式で事前圧縮された静的コンテンツを配信できるようになりました。

新しい形式を有効にするには、`preCompressed()` 関数で `CompressedFileType.ZSTD` および `CompressedFileType.DEFLATE` の enum 定数を使用します。

```kotlin
staticResources("staticResources", "public") {
    preCompressed(
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

### OpenAPI タグの説明 {id="openapi-tag-descriptions"}

[`openAPI {}`](server-openapi.md) および [`swaggerUI {}`](server-swagger-ui.md) 設定ブロックで直接、OpenAPI タグの説明を定義できるようになりました。

```kotlin
swaggerUI("/swagger") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

タグの説明は、生成された OpenAPI ドキュメントのトップレベルのメタデータに追加されます。

### 新しい `ApplicationCall.respondHtmlPartial()` 関数 {id="new-applicationcall-respondhtmlpartial-function"}

部分的な HTML コンテンツで応答するための `.respondHtmlFragment()` に代わり、新しい `.respondHtmlPartial()` 関数が導入されました。

この関数はラムダレシーバーとして `TagConsumer<Appendable>` を使用するため、テーブルのセルなどの制限のない HTML コンテンツを返すことができます。

```kotlin
call.respondHtmlPartial(HttpStatusCode.Created) {
    td { +"Created!" }
}
```

非推奨となった `.respondHtmlFragment()` 関数は `FlowContent` を使用していたため、返せる HTML 要素が制限されていました。現在は `.respondHtmlPartial()` が推奨され、非推奨となっています。

### Netty {id="netty"}

#### HTTP/3 サポート {id="http3"}
<primary-label ref="experimental"/>

Netty サーバーエンジンに、QUIC 経由の [HTTP/3](server-http3.md) の実験的サポートが含まれるようになりました。

HTTP/3 を有効にするには、SSL コネクターを設定し、Netty エンジン設定で `enableHttp3()` 関数を呼び出します。

```kotlin
embeddedServer(Netty, environment, {
    // SSL コネクターが必須です
    sslConnector(
        keyStore = keyStore,
        keyAlias = "server",
        keyStorePassword = { "changeit".toCharArray() },
        privateKeyPassword = { "changeit".toCharArray() }
    ) {
        port = 8443
        host = "0.0.0.0"
    }

    enableHttp3 {
        quicTokenHandler = HmacQuicTokenHandler() // オプション
        quicMaxIdleTimeout = 30.seconds
        quicInitialMaxData = 10_000_000
        quicInitialMaxStreamDataBidirectionalLocal = 1_000_000
        quicInitialMaxStreamDataBidirectionalRemote = 1_000_000
        quicInitialMaxStreamsBidirectional = 100
        udpSocketCount = 1
        udpReceiveBufferSize = 0
        udpSendBufferSize = 0
        configureQuicServerCodec = { /* オプションの低レベル Netty チューニング */ }
    }
}) { /* アプリケーション */ }.start(wait = true)
```

`enableHttp3 {}` ブロックを使用して、接続タイムアウト、フロー制御の制限、UDP ソケット設定など、QUIC 固有のオプションを設定することもできます。

#### HTTP/2 over TLS と併用した h2c の利用 {id="use-h2c-alongside-http-2-over-tls"}

Netty サーバーエンジンで、[平文による HTTP/2（h2c: HTTP/2 over cleartext）](server-http2.md#http2-without-tls) と HTTP/2 over TLS を同じサーバー上で配信できるようになりました。

これにより、平文コネクターと SSL コネクターを設定した上で、HTTP/2 と h2c の両方を有効にすることができます。

```kotlin
embeddedServer(Netty, configure = {
    connector {
        port = 8080
    }
    sslConnector(...) {
        port = 8443
    }

    enableHttp2 = true
    enableH2c = true
}) {
    // ...
}
```

平文コネクターが h2c 接続を受け入れ、SSL コネクターが HTTP/2 over TLS を配信します。

### 認証済みプリンシパルによるレート制限 {id="rate-limiting-with-auth"}

[`RateLimit`](server-rate-limit.md) プラグインが、リクエストの検証中に認証プリンシパル（authentication principal）へアクセスできるようになりました。

これにより、`rateLimit()` 関数を `authenticate()` の内側にネストし、`requestKey()` 関数内で `call.principal()` を使用して認証されたユーザーごとにレート制限を適用できます。

```kotlin
install(Authentication) {
    basic("auth") { validate { UserIdPrincipal(it.name) } }
}

install(RateLimit) {
    register(RateLimitName("per-user")) {
        rateLimiter(limit = 10, refillPeriod = 60.seconds)
        requestKey {
            call.principal<UserIdPrincipal>()?.name ?: "anonymous"
        }
    }
}

routing {
    authenticate("auth") {
        rateLimit(RateLimitName("per-user")) {
            get("/api") { call.respondText("OK") }
        }
    }
}
```

また、認証前にレート制限を適用するために `rateLimit()` を `authenticate()` の外側に配置することも可能です。レート制限が認証済みプリンシパルに依存しない場合は、このアプローチを使用してください。

### 型安全な認証スキーム API {id="typed-auth"}
<primary-label ref="experimental"/>

Ktor 3.6.0 では、実験的な[型安全な認証スキーム API](server-typed-auth.md)が導入されました。名前付きプロバイダーをインストールして文字列で参照する代わりに、スキームの値を作成してそれを必要とするルートに渡します。保護されたルート内では、`call.principal` はそのスキームのプリンシパル型を持ち、非 `null` であることが保証されます。

```kotlin
data class User(val id: String, val email: String)

val jwtAuth = jwt<User>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential ->
        val payload = credential.payload
        User(
            id = payload.subject,
            email = payload.getClaim("email").asString()
        )
    }
}

routing {
    authenticateWith(jwtAuth) {
        get("/profile") {
            call.respondText(call.principal.email)
        }
    }
}
```

この API には、オプトインの[ロールチェック](server-typed-auth.md#roles)、[匿名フォールバック](server-typed-auth.md#anonymous)、型付き[セッション](server-typed-session-auth.md)、および [OAuth 2.0](server-oauth2-flows.md) のサポートも追加されています。

> 型安全な認証スキーム API には `@ExperimentalKtorApi` のマークが付けられており、Kotlin 2.4.0 または `-Xcontext-parameters` コンパイラーオプションを必要とする Kotlin context parameters（コンテキストパラメーター）を使用しています。既存の [`install(Authentication)` API](server-auth.md) も引き続きサポートされており、同じアプリケーション内で両方の API を使用できます。
> 
{style="note"}

### OpenID Connect プラグイン {id="oidc"}
<primary-label ref="experimental"/>

Ktor 3.6.0 では、実験的な [OpenID Connect プラグイン](server-oidc.md)が追加されました。ディスカバリー、JWKS 解決、JWT 検証、OAuth コールバックを個別に設定する代わりに、発行者（issuer）URL を使用してプロバイダーを登録するだけで、型付き認証スキームを取得できます。

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        bearer { audience = setOf("my-api") }
    }

    routing {
        authenticateWith(google.jwtBearer) {
            get("/me") {
                call.respond(call.principal.userInfo)
            }
        }
    }
}
```

このプラグインは、受信したアクセストークンを検証する[リソースサーバー](server-oidc-resource-server.md)と、セッション、ログアウト、トークンリフレッシュを伴う[ブラウザーログイン](server-oidc-browser-login.md)の両方をサポートしています。PKCE を使用した認可コードフロー、トークンイントロスペクション（RFC 7662）、リソースインジケーター（RFC 8707）、保護されたリソースのメタデータ（RFC 9728）を実装しています。

> このプラグインには `@ExperimentalKtorApi` のマークが付けられており、型安全なスキーム API 上に構築され、JVM でのみ利用可能です。
> 
{style="note"}

### `ApplicationCall.receive()` における Null 許容リクエストボディ {id="nullable-request-bodies-with-applicationcall-receive"}

Ktor で、`ApplicationCall.receive()` 関数での Null 許容（nullable）型引数がサポートされるようになりました。

`.receiveNullable()` 関数は非推奨になりました。リクエストボディが `null` になり得る場合は、Null 許容型を指定した `.receive()` を使用してください。

<compare first-title="3.5.x" second-title="3.6.0">

```kotlin
 post("/") {
    val payload = call.receiveNullable<Payload?>()
}
```

```kotlin
 post("/") {
    val payload = call.receive<Payload?>()
}
```

</compare>

これにより、想定されるリクエストの仕様（コントラクト）が型によって明示的になります。

* `receive<MyType>()` は、非 null 値を要求します。
* `receive<MyType?>()` は、値または `null` を受け入れます。

例えば、エンドポイントで既存の通知設定をクリアするために `null` を使用できます。

```kotlin
@Serializable
data class NotificationPreferences(
    val emailEnabled: Boolean,
    val pushEnabled: Boolean,
)

put("/users/{userId}/notification-preferences") {
    val userId = call.parameters.getOrFail("userId")
    val preferences = call.receive<NotificationPreferences?>()

    if (preferences == null) {
        preferenceService.clear(userId)
    } else {
        preferenceService.update(userId, preferences)
    }

    call.respond(HttpStatusCode.NoContent)
}
```

非 Null 許容型での `.receive()` の呼び出しは、従来どおり動作し続けます。レスポンス API への影響はありません。

## Ktor Client {id="ktor-client"}

### マルチプラットフォームプロジェクト向けのデフォルトクライアントエンジン {id="default-engines"}

Ktor 3.6.0 では、[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) プロジェクト向けに厳選された HTTP [クライアントエンジン](client-engines.md)のセットを提供する `ktor-client-engine-defaults` アーティファクトが導入されました。

`commonMain` ソースセットに依存関係を追加します。

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                api("io.ktor:ktor-client-engine-defaults:3.6.0")
            }
        }
    }
}
```

これで、エンジンを指定せずに `HttpClient` を作成できるようになります。

```kotlin
val client = HttpClient()
```

各ターゲットプラットフォームに対して、Ktor は `ktor-client-engine-defaults` によって提供されるデフォルトエンジンを使用します。複数のエンジンが利用可能な場合、クライアントは優先度が最も高いエンジンを選択します。デフォルトでは `CIO` の優先度が最も低いため、クライアントは `CIO` よりも利用可能な他のエンジンを選択します。

現在マルチプラットフォームプロジェクトにおいて、サポートされているすべてのターゲットで `CIO` を使用している場合は、`CIO` の依存関係を `ktor-client-engine-defaults` に置き換えることを検討してください。これにより、共通ソースセットからエンジンの選択ロジックを排除しつつ、Ktor が各プラットフォームに最適化されたデフォルトエンジンを提供できるようになります。

エンジン固有の設定や動作が必要な場合は、引き続き[特定のクライアントエンジンを宣言](client-dependencies.md#kmp-specific-engine)することもできます。

### JVM 向け WebRTC クライアントサポート {id="webrtc-jvm-support"}
<primary-label ref="experimental"/>

実験的な [WebRTC クライアント](client-webrtc.md)が、JVM デスクトップアプリケーションをサポートするようになりました。

JVM 実装では [webrtc-java](https://github.com/devopvoid/webrtc-java) ネイティブ WebRTC バインディングが使用されており、ピア接続、音声および動画トラック、データチャネル、接続統計情報のサポートが提供されます。

JVM サポートには現在、プラットフォーム固有の制限がいくつかあります。詳細については、[WebRTC クライアント](client-webrtc.md)のドキュメントを参照してください。

### HTTP キャッシュ用のマルチプラットフォームファイルストレージ {id="multiplatform-file-storage-for-http-caching"}

[`HttpCache`](client-caching.md) プラグインが、マルチプラットフォームのファイルストレージをサポートするようになりました。

以前は、`FileStorage()` 関数は JVM でのみ利用可能で、`java.io.File` を必要としていました。現在は `kotlinx-io` ライブラリが使用されており、サポートされている任意のプラットフォームで `Path` を使用して永続的なファイルベースのキャッシングを設定できます。

<compare type="top-bottom" first-title="3.5.x" second-title="3.6.0">

```kotlin
val client = HttpClient {
    install(HttpCache) {
        val cacheFile = Files.createDirectories(Paths.get("build/cache")).toFile()
        publicStorage(FileStorage(cacheFile))
    }
}
```

```kotlin
val client = HttpClient {
    install(HttpCache) {
        publicStorage(FileStorage(Path("build/cache")))
    }
}
```

</compare>

これにより、`FileStorage()` に渡す前に `File` を作成する JVM 固有のセットアップが置き換えられます。

### `ContentNegotiation` における `Accept` ヘッダーのマージ制御 {id="control-accept-header-merging-in-contentnegotiation"}

クライアントの [`ContentNegotiation`](client-serialization.md) プラグインが、登録されたコンテンツタイプを既存の `Accept` ヘッダーとマージする方法を制御できるようになりました。

デフォルトでは、`ContentNegotiation` プラグインは、リクエストの `Accept` ヘッダーにまだ含まれていない登録済みのコンテンツタイプを追加します。

`Accept` ヘッダーを明示的に設定し、プラグインによって登録済みコンテンツタイプが追加されないようにしたい場合は、`acceptHeaderMergeStrategy` プロパティを `ContentTypeMergeStrategy.SkipIfPresent` に設定します。

```kotlin
install(ContentNegotiation) {
    register(ContentType.Application.Json, noOpJsonConverter)
    acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
}
```

`SkipIfPresent` を指定すると、プラグインは既存の `Accept` ヘッダーをそのまま保持します。リクエストに `Accept` ヘッダーが含まれていない場合、プラグインは通常どおり登録されたコンテンツタイプを追加します。

### CIO クライアントエンジンにおける非同期 DNS 解決 {id="asynchronous-dns-resolution-in-the-cio-client-engine"}

このリリースでは、[`CIO` クライアントエンジン](client-engines.md#cio)におけるカスタム DNS 解決のサポートが追加されました。

JVM 上では、`CIO` エンジンはこれまでシステムの DNS 解決に依存しており、スレッドをブロックする可能性がありました。現在は、`CIO` エンジン設定の `dnsResolver` プロパティを使用して DNS 解決をオーバーライドできるようになりました。

例えば、`CioDnsResolver()` 関数を使用して、特定の DNS サーバー経由でホスト名を非同期に解決し、タイムアウトを設定できます。

```kotlin
HttpClient(CIO) {
    engine {
        dnsResolver = CioDnsResolver(
            server = "1.1.1.1",
            timeout = 3.seconds
        )
    }
}
```

### JavaScript クライアントエンジンにおける `fetch()` のオーバーライド {id="override-fetch-in-the-javascript-client-engine"}

[JavaScript クライアントエンジン](client-engines.md#js)で使用されるグローバルな `fetch()` 関数をオーバーライドできるようになりました。

カスタム実装を提供するには、`Js` エンジン設定で `fetch` プロパティを設定します。

```kotlin
val client = HttpClient(Js) {
    engine {
        fetch = { url, init ->
            Promise.reject(IllegalStateException("Networking not available"))
        }
    }
}
```

これは、[AWS WAF](https://aws.amazon.com/waf/) など独自の `fetch()` ラッパーを提供する JavaScript ライブラリと統合する場合に役立ちます。`fetch` を設定しない場合、エンジンは引き続きグローバルな `fetch()` 関数を使用します。

## Shared {id="shared"}

### クッキーヘッダーの解析時に重複したクッキーを保持 {id="preserve-duplicate-cookies-when-parsing-cookie-headers"}

同じ名前を持つ複数のクッキーが含まれる `Cookie` ヘッダーを解析するために、`parseClientCookies()` 関数を使用できるようになりました。

`Map<String, String>` を返し、重複した名前に対して最後の値のみを保持する `parseClientCookiesHeader()` 関数とは異なり、`parseClientCookies()` 関数は `List<Pair<String, String>>` を返し、重複するクッキーのエントリを保持します。

```kotlin
val header = "name=value1; name=value2"

val cookies = parseClientCookies(header)
// [("name", "value1"), ("name", "value2")]

val cookieMap = parseClientCookiesHeader(header)
// {"name"="value2"}
```

重複するクッキー名を保持する必要がある場合は、`parseClientCookies()` を使用してください。