[//]: # (title: Ktor 3.6.0 新功能)

<show-structure for="chapter,procedure" depth="3"/>

_[發布日期：2026 年 9 月 17 日](releases.md#release-details)_

Ktor 3.6.0 在伺服器與用戶端方面帶來了一系列改進。此功能版本的主要亮點包括：

* [Netty 伺服器引擎中實驗性的 HTTP/3 支援](#http3)
* [Kotlin Multiplatform 的預設用戶端引擎](#default-engines)
* [實驗性的具型別身分驗證支援](#typed-auth)
* [實驗性的 OpenID Connect 外掛程式](#oidc)
* [JVM 上的 WebRTC 用戶端支援](#webrtc-jvm-support)

## Ktor 伺服器 {id="ktor-server"}

### 請求參數的額外型別支援 {id="additional-type-support-for-request-parameters"}

Ktor 3.6.0 擴充了將請求參數轉換為具型別值時預設支援的型別組合。

現已支援以下型別：

* `Byte`
* `java.lang.Byte`
* `UByte`
* `UInt`
* `UShort`
* `ULong`
* `Uuid`

例如，你可以透過屬性委託直接在路由處理常式中取得 `Uuid` 參數：

```kotlin
get {
    val uuid: Uuid by call.parameters
}
```

### 預壓縮靜態檔案支援 Zstandard (zstd) 與 DEFLATE {id="zstandard-zstd-and-deflate-support-for-pre-compressed-static-files"}

Ktor 現在可以提供 Zstandard (zstd) 與 DEFLATE 格式的預壓縮靜態內容。

若要啟用新格式，請在 `preCompressed()` 函式中使用 `CompressedFileType.ZSTD` 與 `CompressedFileType.DEFLATE` 列舉常數：

```kotlin
staticResources("staticResources", "public") {
    preCompressed(
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

### OpenAPI 標籤描述 {id="openapi-tag-descriptions"}

現在可以直接在 [`openAPI {}`](server-openapi.md) 和 [`swaggerUI {}`](server-swagger-ui.md) 設定區塊中為 OpenAPI 標籤定義描述：

```kotlin
swaggerUI("/swagger") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

標籤描述會新增至產生的 OpenAPI 文件的頂層元資料中。

### 新的 `ApplicationCall.respondHtmlPartial()` 函式 {id="new-applicationcall-respondhtmlpartial-function"}

新的 `.respondHtmlPartial()` 函式取代了 `.respondHtmlFragment()`，用於回應部分 HTML 內容。

它使用 `TagConsumer<Appendable>` 作為 Lambda 接收者，讓你可以傳回不受限制的 HTML 內容，例如表格儲存格：

```kotlin
call.respondHtmlPartial(HttpStatusCode.Created) {
    td { +"Created!" }
}
```

已棄用的 `.respondHtmlFragment()` 函式使用 `FlowContent`，限制了可傳回的 HTML 元素。現在已棄用並建議改用 `.respondHtmlPartial()`。

### Netty {id="netty"}

#### HTTP/3 支援 {id="http3"}
<primary-label ref="experimental"/>

Netty 伺服器引擎現在包含對基於 QUIC 的 [HTTP/3](server-http3.md) 的實驗性支援。

若要啟用 HTTP/3，請設定 SSL 連接器並在 Netty 引擎設定中呼叫 `enableHttp3()` 函式：

```kotlin
embeddedServer(Netty, environment, {
    // SSL connector is required
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
        quicTokenHandler = HmacQuicTokenHandler() // Optional
        quicMaxIdleTimeout = 30.seconds
        quicInitialMaxData = 10_000_000
        quicInitialMaxStreamDataBidirectionalLocal = 1_000_000
        quicInitialMaxStreamDataBidirectionalRemote = 1_000_000
        quicInitialMaxStreamsBidirectional = 100
        udpSocketCount = 1
        udpReceiveBufferSize = 0
        udpSendBufferSize = 0
        configureQuicServerCodec = { /* Optional low-level Netty tuning */ }
    }
}) { /* Application */ }.start(wait = true)
```

你也可以使用 `enableHttp3 {}` 區塊來設定 QUIC 特定的選項，例如連線逾時、流量控制限制以及 UDP 通訊端設定。

#### 同時使用 h2c 與基於 TLS 的 HTTP/2 {id="use-h2c-alongside-http-2-over-tls"}

Netty 伺服器引擎現在可以在同一台伺服器上同時提供[基於明文的 HTTP/2 (h2c)](server-http2.md#http2-without-tls) 與基於 TLS 的 HTTP/2 服務。

這允許你設定一個明文連接器和一個 SSL 連接器，然後同時啟用 HTTP/2 和 h2c：

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

明文連接器接受 h2c 連線，而 SSL 連接器則提供基於 TLS 的 HTTP/2 服務。

### 結合身分驗證主體的速率限制 {id="rate-limiting-with-auth"}

[`RateLimit`](server-rate-limit.md) 外掛程式現在可以在請求驗證期間存取身分驗證主體（Principal）。

這允許你將 `rateLimit()` 函式巢狀置於 `authenticate()` 內，並在 `requestKey()` 函式中使用 `call.principal()` 來針對每個已驗證使用者套用速率限制：

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

你也可以將 `rateLimit()` 放在 `authenticate()` 之外，以便在身分驗證之前套用速率限制。當速率限制不相依於已驗證的主體時，可使用此方法。

### 型別安全的身分驗證配置 API {id="typed-auth"}
<primary-label ref="experimental"/>

Ktor 3.6.0 引入了實驗性的[型別安全身分驗證配置 API](server-typed-auth.md)。你不再需要安裝具名提供者並透過字串參照它，而是建立一個配置（scheme）值並將其傳遞給需要的路由。在受保護的路由內部，`call.principal` 具有該配置的主體型別，且保證為非 `null`：

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

此 API 還新增了選擇性加入的[角色檢查](server-typed-auth.md#roles)、[匿名後備機制](server-typed-auth.md#anonymous)、具型別的[工作階段](server-typed-session-auth.md)以及 [OAuth 2.0](server-oauth2-flows.md) 支援。

> 型別安全的身分驗證配置 API 標記有 `@ExperimentalKtorApi` 並使用 Kotlin 上下文參數（context parameters），需要 Kotlin 2.4.0 或 `-Xcontext-parameters` 編譯器選項。現有的 [`install(Authentication)` API](server-auth.md) 仍受支援，你可以在同一個應用程式中同時使用這兩種 API。
> 
{style="note"}

### OpenID Connect 外掛程式 {id="oidc"}
<primary-label ref="experimental"/>

Ktor 3.6.0 新增了實驗性的 [OpenID Connect 外掛程式](server-oidc.md)。你不再需要分別設定探索（discovery）、JWKS 解析、JWT 驗證和 OAuth 回呼，而是使用提供者的簽發者（issuer）URL 註冊該提供者，即可取得具型別的身分驗證配置：

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

該外掛程式同時支援驗證連入存取權杖的[資源伺服器](server-oidc-resource-server.md)，以及具備工作階段、登出和權杖重新整理功能的[瀏覽器登入](server-oidc-browser-login.md)。它實作了帶有 PKCE 的授權碼流程、權杖自我檢查（token introspection，RFC 7662）、資源指示器（RFC 8707）以及受保護資源元資料（RFC 9728）。

> 該外掛程式標記有 `@ExperimentalKtorApi`，建置於型別安全的配置 API 之上，且僅適用於 JVM。
> 
{style="note"}

### 使用 `ApplicationCall.receive()` 支援可為 null 的請求主體 {id="nullable-request-bodies-with-applicationcall-receive"}

Ktor 現在支援在 `ApplicationCall.receive()` 函式中使用可為 null 的型別引數。

`.receiveNullable()` 函式已被棄用。當請求主體可能為 `null` 時，請搭配可為 null 的型別使用 `.receive()`：

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

這使得預期的請求協定在型別中更加明確：

* `receive<MyType>()` 需要非 null 值。
* `receive<MyType?>()` 接受值或 `null`。

例如，端點可以使用 `null` 來清除現有的通知偏好設定：

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

對 `.receive()` 的不可為 null 呼叫仍像以前一樣運作。回應 API 不受影響。

## Ktor 用戶端 {id="ktor-client"}

### 多平台專案的預設用戶端引擎 {id="default-engines"}

Ktor 3.6.0 引入了 `ktor-client-engine-defaults` 構件，為 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 專案提供了一組精心挑選的 HTTP [用戶端引擎](client-engines.md)。

將此相依性新增至 `commonMain` 原始碼集：

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

接著你便可以在不指定引擎的情況下建立 `HttpClient`：

```kotlin
val client = HttpClient()
```

針對每個目標平台，Ktor 會使用 `ktor-client-engine-defaults` 提供的預設引擎。如果有超過一個引擎可用，用戶端會選擇優先順序最高的引擎。預設情況下 `CIO` 的優先順序最低，因此用戶端會優先選擇其他可用引擎，而非 `CIO`。

如果你的多平台專案目前在所有支援的目標上皆使用 `CIO`，請考慮將 `CIO` 相依性替換為 `ktor-client-engine-defaults`。這能讓 Ktor 為每個平台提供精選的預設引擎，同時避免在通用原始碼集中進行引擎選擇。

當你需要特定引擎的設定或行為時，仍然可以[宣告特定的用戶端引擎](client-dependencies.md#kmp-specific-engine)。

### JVM 上的 WebRTC 用戶端支援 {id="webrtc-jvm-support"}
<primary-label ref="experimental"/>

實驗性的 [WebRTC 用戶端](client-webrtc.md)現已支援 JVM 桌面應用程式。

JVM 實作使用 [webrtc-java](https://github.com/devopvoid/webrtc-java) 原生 WebRTC 繫結，並提供對對等連線（peer connections）、音訊與視訊軌道、資料通道以及連線統計資訊的支援。

JVM 支援目前有幾項平台特定的限制。如需更多資訊，請參閱 [WebRTC 用戶端](client-webrtc.md)文件。

### 適用於 HTTP 快取的多平台檔案儲存 {id="multiplatform-file-storage-for-http-caching"}

[`HttpCache`](client-caching.md) 外掛程式現在支援多平台檔案儲存。

先前，`FileStorage()` 函式僅在 JVM 上可用，且需要 `java.io.File`。現在它使用 `kotlinx-io` 程式庫，允許你在任何支援的平台上使用 `Path` 來設定基於檔案的永續快取。

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

這取代了在將其傳遞給 `FileStorage()` 之前先建立 `File` 的 JVM 專屬設定。

### 控制 `ContentNegotiation` 中的 `Accept` 標頭合併 {id="control-accept-header-merging-in-contentnegotiation"}

現在你可以控制用戶端 [`ContentNegotiation`](client-serialization.md) 外掛程式如何將已註冊的內容型別與現有的 `Accept` 標頭進行合併。

預設情況下，`ContentNegotiation` 外掛程式會新增尚未在請求的 `Accept` 標頭中呈現的已註冊內容型別。

如果你明確設定了 `Accept` 標頭，且不希望外掛程式新增已註冊的內容型別，請將 `acceptHeaderMergeStrategy` 屬性設為 `ContentTypeMergeStrategy.SkipIfPresent`：

```kotlin
install(ContentNegotiation) {
    register(ContentType.Application.Json, noOpJsonConverter)
    acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
}
```

使用 `SkipIfPresent` 時，外掛程式會保留現有的 `Accept` 標頭。如果請求未包含 `Accept` 標頭，外掛程式將像往常一樣新增已註冊的內容型別。

### CIO 用戶端引擎中的非同步 DNS 解析 {id="asynchronous-dns-resolution-in-the-cio-client-engine"}

此版本新增了對 [`CIO` 用戶端引擎](client-engines.md#cio)中自訂 DNS 解析的支援。

在 JVM 上，`CIO` 引擎先前依賴系統 DNS 解析，這可能會阻塞執行緒。你現在可以在 `CIO` 引擎設定中使用 `dnsResolver` 屬性覆寫 DNS 解析。

例如，使用 `CioDnsResolver()` 函式透過特定 DNS 伺服器非同步解析主機名稱並設定逾時：

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

### 覆寫 JavaScript 用戶端引擎中的 `fetch()` {id="override-fetch-in-the-javascript-client-engine"}

你現在可以覆寫 [JavaScript 用戶端引擎](client-engines.md#js)所使用的全域 `fetch()` 函式。

若要提供自訂實作，請在 `Js` 引擎設定中設定 `fetch` 屬性：

```kotlin
val client = HttpClient(Js) {
    engine {
        fetch = { url, init ->
            Promise.reject(IllegalStateException("Networking not available"))
        }
    }
}
```

這在與提供自身 `fetch()` 包裝函式（wrapper）的 JavaScript 程式庫（例如 [AWS WAF](https://aws.amazon.com/waf/)）進行整合時非常實用。如果你沒有設定 `fetch`，該引擎將繼續使用全域 `fetch()` 函式。

## 共用 {id="shared"}

### 剖析 Cookie 標頭時保留重複的 Cookie {id="preserve-duplicate-cookies-when-parsing-cookie-headers"}

你現在可以使用 `parseClientCookies()` 函式來剖析包含多個同名 Cookie 的 `Cookie` 標頭。

與傳回 `Map<String, String>` 且對重複名稱僅保留最後一個值的 `parseClientCookiesHeader()` 函式不同，`parseClientCookies()` 函式會傳回 `List<Pair<String, String>>` 並保留重複的 Cookie 項目：

```kotlin
val header = "name=value1; name=value2"

val cookies = parseClientCookies(header)
// [("name", "value1"), ("name", "value2")]

val cookieMap = parseClientCookiesHeader(header)
// {"name"="value2"}
```

當需要保留重複的 Cookie 名稱時，請使用 `parseClientCookies()`。