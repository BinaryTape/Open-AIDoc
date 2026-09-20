[//]: # (title: Ktor 3.6.0 的最新变化)

<show-structure for="chapter,procedure" depth="3"/>

_[发布日期：2026 年 9 月 17 日](releases.md#release-details)_

Ktor 3.6.0 在服务端与客户端带来了诸多改进。此功能版本的亮点包括：

* [Netty 服务端引擎中实验性的 HTTP/3 支持](#http3)
* [Kotlin Multiplatform 的默认客户端引擎](#default-engines)
* [实验性的类型安全身份验证支持](#typed-auth)
* [实验性的 OpenID Connect 插件](#oidc)
* [JVM 上的 WebRTC 客户端支持](#webrtc-jvm-support)

## Ktor Server {id="ktor-server"}

### 请求参数的附加类型支持 {id="additional-type-support-for-request-parameters"}

Ktor 3.6.0 扩展了将请求参数转换为类型化值时默认支持的类型集。

现已支持以下类型：

* `Byte`
* `java.lang.Byte`
* `UByte`
* `UInt`
* `UShort`
* `ULong`
* `Uuid`

例如，可以通过属性委托在路由处理程序中直接获取 `Uuid` 参数：

```kotlin
get {
    val uuid: Uuid by call.parameters
}
```

### 预压缩静态文件的 Zstandard (zstd) 与 DEFLATE 支持 {id="zstandard-zstd-and-deflate-support-for-pre-compressed-static-files"}

Ktor 现在可以提供 Zstandard (zstd) 和 DEFLATE 格式的预压缩静态内容。

要启用新格式，请在 `preCompressed()` 函数中使用 `CompressedFileType.ZSTD` 和 `CompressedFileType.DEFLATE` 枚举常量：

```kotlin
staticResources("staticResources", "public") {
    preCompressed(
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

### OpenAPI 标签描述 {id="openapi-tag-descriptions"}

现在可以直接在 [`openAPI {}`](server-openapi.md) 和 [`swaggerUI {}`](server-swagger-ui.md) 配置块中定义 OpenAPI 标签的描述：

```kotlin
swaggerUI("/swagger") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

标签描述会添加到生成的 OpenAPI 文档的顶级元数据中。

### 新的 `ApplicationCall.respondHtmlPartial()` 函数 {id="new-applicationcall-respondhtmlpartial-function"}

新的 `.respondHtmlPartial()` 函数取代了用于响应部分 HTML 内容的 `.respondHtmlFragment()`。

它使用 `TagConsumer<Appendable>` 作为 lambda 接收器，允许返回不受限制的 HTML 内容（例如表格单元格）：

```kotlin
call.respondHtmlPartial(HttpStatusCode.Created) {
    td { +"Created!" }
}
```

已弃用的 `.respondHtmlFragment()` 函数使用的是 `FlowContent`，它对可以返回的 HTML 元素有所限制。现已将其弃用，建议改用 `.respondHtmlPartial()`。

### Netty {id="netty"}

#### HTTP/3 支持 {id="http3"}
<primary-label ref="experimental"/>

Netty 服务端引擎现已包含对基于 QUIC 的 [HTTP/3](server-http3.md) 的实验性支持。

要启用 HTTP/3，请配置 SSL 连接器并在 Netty 引擎配置中调用 `enableHttp3()` 函数：

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

您还可以使用 `enableHttp3 {}` 块来配置 QUIC 专用的选项，例如连接超时、流量控制限制以及 UDP 套接字设置。

#### 结合使用 h2c 与基于 TLS 的 HTTP/2 {id="use-h2c-alongside-http-2-over-tls"}

Netty 服务端引擎现在可以在同一台服务器上同时提供[基于明文的 HTTP/2 (h2c)](server-http2.md#http2-without-tls) 与基于 TLS 的 HTTP/2 服务。

这允许您同时配置明文连接器与 SSL 连接器，然后启用 HTTP/2 和 h2c：

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

明文连接器接受 h2c 连接，而 SSL 连接器则提供基于 TLS 的 HTTP/2 服务。

### 使用已验证主体进行速率限制 {id="rate-limiting-with-auth"}

[`RateLimit`](server-rate-limit.md) 插件现在可以在请求验证期间访问身份验证主体。

这允许将 `rateLimit()` 函数嵌套在 `authenticate()` 内部，并在 `requestKey()` 函数中使用 `call.principal()` 来按已通过身份验证的用户应用速率限制：

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

也可以将 `rateLimit()` 放置在 `authenticate()` 外部，以便在身份验证之前应用速率限制。当速率限制不依赖于已通过身份验证的主体时，可以使用此方法。

### 类型安全的身份验证方案 API {id="typed-auth"}
<primary-label ref="experimental"/>

Ktor 3.6.0 引入了实验性的[类型安全身份验证方案 API](server-typed-auth.md)。无需安装具名提供程序并通过字符串引用它，而是创建一个方案值并将其传递给需要的路由。在受保护的路由内部，`call.principal` 具有该方案的主体类型，并保证为非 `null`：

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

该 API 还增加了可选择加入的[角色检查](server-typed-auth.md#roles)、[匿名回退](server-typed-auth.md#anonymous)、类型化[会话](server-typed-session-auth.md)以及 [OAuth 2.0](server-oauth2-flows.md) 支持。

> 类型安全身份验证方案 API 被标记为 `@ExperimentalKtorApi` 并使用 Kotlin 上下文形参（context parameters），这需要 Kotlin 2.4.0 或 `-Xcontext-parameters` 编译器选项。现有的 [`install(Authentication)` API](server-auth.md) 仍受支持，您可以在同一个应用程序中同时使用这两种 API。
> 
{style="note"}

### OpenID Connect 插件 {id="oidc"}
<primary-label ref="experimental"/>

Ktor 3.6.0 添加了实验性的 [OpenID Connect 插件](server-oidc.md)。无需分别配置发现机制、JWKS 解析、JWT 验证和 OAuth 回调，只需使用提供程序的签发者 URL 注册提供程序，即可获得类型安全的身份验证方案：

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

该插件既支持验证传入访问令牌的[资源服务器](server-oidc-resource-server.md)，也支持带有会话、注销和令牌刷新的[浏览器登录](server-oidc-browser-login.md)。它实现了带 PKCE 的授权码流程、令牌自省 (RFC 7662)、资源指示符 (RFC 8707) 以及受保护资源元数据 (RFC 9728)。

> 该插件被标记为 `@ExperimentalKtorApi`，构建在类型安全方案 API 之上，且仅在 JVM 上可用。
> 
{style="note"}

### 通过 `ApplicationCall.receive()` 支持可为 null 的请求正文 {id="nullable-request-bodies-with-applicationcall-receive"}

Ktor 现在支持在 `ApplicationCall.receive()` 函数中使用可为 null 的类型实参。

`.receiveNullable()` 函数已被弃用。当请求正文可以为 `null` 时，请将 `.receive()` 与可为 null 的类型一起使用：

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

这使得预期的请求协定在类型中更加明确：

* `receive<MyType>()` 需要非 null 值。
* `receive<MyType?>()` 接受一个值或 `null`。

例如，端点可以使用 `null` 来清除现有的通知偏好设置：

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

对 `.receive()` 的非 null 调用将继续照常工作。响应 API 不受影响。

## Ktor Client {id="ktor-client"}

### 多平台项目的默认客户端引擎 {id="default-engines"}

Ktor 3.6.0 引入了 `ktor-client-engine-defaults` 构件，它为 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 项目提供了一组精选的 HTTP [客户端引擎](client-engines.md)。

将依赖项添加到 `commonMain` 源集中：

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

随后便可以在不指定引擎的情况下创建 `HttpClient`：

```kotlin
val client = HttpClient()
```

对于每个目标平台，Ktor 都会使用 `ktor-client-engine-defaults` 提供的默认引擎。如果存在多个可用引擎，客户端会选择优先级最高的引擎。`CIO` 默认具有最低优先级，因此客户端会优先选择其他可用引擎而不是 `CIO`。

如果您的多平台项目当前在所有受支持的目标上都使用 `CIO`，建议考虑将 `CIO` 依赖项替换为 `ktor-client-engine-defaults`。这样可以让 Ktor 为每个平台提供精选的默认引擎，同时无需在公共源集中进行引擎选择。

当需要特定于引擎的配置或行为时，您仍然可以[声明特定的客户端引擎](client-dependencies.md#kmp-specific-engine)。

### JVM 上的 WebRTC 客户端支持 {id="webrtc-jvm-support"}
<primary-label ref="experimental"/>

实验性的 [WebRTC 客户端](client-webrtc.md)现在支持 JVM 桌面应用程序。

JVM 实现使用 [webrtc-java](https://github.com/devopvoid/webrtc-java) 原生 WebRTC 绑定，并提供对对等连接、音频和视频轨道、数据通道以及连接统计信息的支持。

JVM 支持目前存在若干特定于平台的限制。有关更多信息，请参阅 [WebRTC 客户端](client-webrtc.md)文档。

### 用于 HTTP 缓存的多平台文件存储 {id="multiplatform-file-storage-for-http-caching"}

[`HttpCache`](client-caching.md) 插件现在支持多平台文件存储。

此前，`FileStorage()` 函数仅在 JVM 上可用，并且需要 `java.io.File`。现在它使用 `kotlinx-io` 库，允许在任何受支持的平台上使用 `Path` 配置基于文件的持久化缓存。

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

这取代了在将文件传递给 `FileStorage()` 之前必须创建 `File` 的特定于 JVM 的配置方式。

### 控制 `ContentNegotiation` 中的 `Accept` 标头合并 {id="control-accept-header-merging-in-contentnegotiation"}

现在可以控制客户端 [`ContentNegotiation`](client-serialization.md) 插件如何将已注册的内容类型与现有的 `Accept` 标头进行合并。

默认情况下，`ContentNegotiation` 插件会添加请求的 `Accept` 标头中尚未包含的已注册内容类型。

如果显式设置了 `Accept` 标头，并且不希望插件添加已注册的内容类型，请将 `acceptHeaderMergeStrategy` 属性设置为 `ContentTypeMergeStrategy.SkipIfPresent`：

```kotlin
install(ContentNegotiation) {
    register(ContentType.Application.Json, noOpJsonConverter)
    acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
}
```

使用 `SkipIfPresent` 时，插件会保留现有的 `Accept` 标头。如果请求不包含 `Accept` 标头，插件将照常添加已注册的内容类型。

### CIO 客户端引擎中的异步 DNS 解析 {id="asynchronous-dns-resolution-in-the-cio-client-engine"}

此版本增加了对 [`CIO` 客户端引擎](client-engines.md#cio)中自定义 DNS 解析的支持。

在 JVM 上，`CIO` 引擎此前依赖于系统 DNS 解析，这可能会阻塞线程。现在，可以使用 `CIO` 引擎配置中的 `dnsResolver` 属性来重写 DNS 解析。

例如，使用 `CioDnsResolver()` 函数通过指定的 DNS 服务器异步解析主机名并配置超时：

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

### 在 JavaScript 客户端引擎中重写 `fetch()` {id="override-fetch-in-the-javascript-client-engine"}

现在可以重写 [JavaScript 客户端引擎](client-engines.md#js)所使用的全局 `fetch()` 函数。

要提供自定义实现，请在 `Js` 引擎配置中设置 `fetch` 属性：

```kotlin
val client = HttpClient(Js) {
    engine {
        fetch = { url, init ->
            Promise.reject(IllegalStateException("Networking not available"))
        }
    }
}
```

在与提供专属 `fetch()` 包装器的 JavaScript 库（例如 [AWS WAF](https://aws.amazon.com/waf/)）进行集成时，这非常有用。如果不配置 `fetch`，该引擎将继续使用全局 `fetch()` 函数。

## 共享 {id="shared"}

### 解析 Cookie 标头时保留重复的 Cookie {id="preserve-duplicate-cookies-when-parsing-cookie-headers"}

现在可以使用 `parseClientCookies()` 函数来解析包含多个同名 Cookie 的 `Cookie` 标头。

与返回 `Map<String, String>` 且对重复名称仅保留最后一个值的 `parseClientCookiesHeader()` 函数不同，`parseClientCookies()` 函数返回 `List<Pair<String, String>>` 并保留重复的 Cookie 条目：

```kotlin
val header = "name=value1; name=value2"

val cookies = parseClientCookies(header)
// [("name", "value1"), ("name", "value2")]

val cookieMap = parseClientCookiesHeader(header)
// {"name"="value2"}
```

当需要保留重复的 Cookie 名称时，请使用 `parseClientCookies()`。