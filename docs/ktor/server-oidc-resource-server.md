[//]: # (title: OpenID Connect 资源服务器)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
验证由 OpenID Connect 提供商签发的访问令牌，无论是在本地作为 JWT 进行验证，还是通过令牌内省进行验证。
</link-summary>

资源服务器是一个接收由他人签发令牌的 API。它不提供登录页面，也不使用浏览器会话。客户端发送访问令牌，服务器在允许访问受保护资源之前对其进行验证。

> 有关浏览器登录的信息，请参阅 [OpenID Connect 浏览器登录](server-oidc-browser-login.md)。
> 
> 有关发现、令牌类型和插件设置的信息，请参阅 [OpenID Connect](server-oidc.md)。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 插件处于实验阶段，仅在 JVM 上可用，并且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用了
        <Links href="server-typed-auth.md" summary="类型安全的身份验证方案 API 将主体类型绑定到路由，因此您无需进行类型转换或 null 检查即可读取非 null 主体。">类型安全身份验证 API</Links>，该 API 需要 Kotlin 上下文形参。
    </p>
</note>

## 验证 JWT 访问令牌 {id="jwt-bearer"}

许多提供商将访问令牌作为已签名的 JSON Web Token (JWT) 签发。配置 API 所期望的受众 (audience)，然后使用 `provider.jwtBearer` 保护路由：

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val auth0 = oidc.identityProvider("auth0") {
        issuer = "https://my-tenant.auth0.com"
        bearer {
            audience = setOf("https://api.example.com")
        }
    }

    routing {
        authenticateWith(auth0.jwtBearer) {
            get("/orders") {
                val subject = call.principal.claims.subject
                call.respondText("Hello $subject")
            }
        }
    }
}
```

`audience` 属性是必需的且不能为空。它在提供商处标识您的 API，通常与 OAuth 客户端 ID 不同。

该插件从 `Authorization: Bearer` 标头读取令牌，从提供商的 JWKS 端点检索签名密钥，并检查签名、签发者 (issuer)、受众 (audience) 和过期时间。

## 验证不透明令牌 {id="introspection"}

并非所有提供商都签发 JWT。*不透明* (opaque) 令牌是没有可读内容的随机字符串，因此您的服务器无法在本地对其进行验证。这是一个经过深思熟虑的权衡：不透明令牌如果被拦截不会泄露任何信息；而且由于每次使用时都会咨询提供商，因此它可以被吊销并立即失效。而 JWT 则在过期前一直保持有效。

为了验证不透明令牌，服务器会使用由 [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) 定义的*令牌内省* (token introspection)。您的服务器将令牌发送到内省端点，对自己进行身份验证，并接收一个响应，指示该令牌是否处于活动状态以及任何相关的元数据，例如 subject、scope、client 和过期时间。

添加 `introspection { }` 块并使用 `provider.introspectionBearer`：

```kotlin
val auth0Issuer = "https://my-tenant.auth0.com"

val auth0 = oidc.identityProvider("auth0") {
    issuer = auth0Issuer
    bearer {
        audience = setOf("https://api.example.com")
        introspection {
            endpoint = "$auth0Issuer/oauth/introspect"
            clientId = "api-client"
            clientSecret = System.getenv("INTROSPECTION_SECRET")
        }
    }
}

routing {
    authenticateWith(auth0.introspectionBearer) {
        get("/orders") {
            val result = call.principal.introspection
            call.respondText("Hello ${result.username}")
        }
    }
}
```

内省端点不是 OpenID Connect 发现文档的一部分，因此请根据提供商的文档显式配置它。在上面的示例中，签发者 URL 存储在局部变量中，因为外部的 `issuer` 属性在 `introspection { }` 块中不可用。

`clientId` 和 `clientSecret` 属性向提供商标识的是您的 API，而不是用户。内省是一项特权操作，因此大多数提供商需要一个单独的、被允许执行该操作的客户端。

默认情况下，该插件使用 HTTP Basic 身份验证。若要改为在表单正文中发送凭据，请设置 `authMethod = ClientAuthenticationMethod.ClientSecretPost`。

仅当响应包含 `active: true`、其受众与您配置的 `audience` 存在交集，且返回的任何 `iss`、`exp` 和 `nbf` 值均有效时，令牌才会被接受。

内省在每次身份验证尝试时都需要进行网络请求，并且取决于提供商的可用性。如果您的提供商签发 JWT，建议优先使用 [JWT 验证](#jwt-bearer)；而在提供商不签发 JWT，或者即时吊销比延迟更重要时，再使用内省。

## 从其他位置读取令牌 {id="token-extractor"}

默认情况下，该插件从 `Authorization` 标头读取令牌。若要从其他位置读取，请配置自定义提取器：

```kotlin
bearer {
    audience = setOf("https://api.example.com")
    tokenExtractor = { call.request.cookies["access_token"] }
}
```

当没有可用令牌时返回 `null`。随后请求将作为未通过身份验证而失败。

## 发布受保护资源元数据 {id="protected-resource"}

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) 允许客户端发现您的 API 信任哪些授权服务器，而无需提前预配。这对于机器对机器 (M2M) 客户端和 MCP 服务器非常有用。

安装插件时配置受保护资源元数据：

```kotlin
val oidc = install(Oidc) {
    protectedResource("https://api.example.com") {
        resourceName = "Orders API"
    }
}
```

这将在 `/.well-known/oauth-protected-resource` 提供一份文档。该插件从已注册的提供商中派生出以下值：

* `authorizationServers` — 拥有 `bearer { }` 块的每个提供商的签发者。
* `scopesSupported` — 这些提供商请求的 scope。
* `bearerMethodsSupported` — 当提供商读取标准授权标头时为 `header`。

显式设置这些属性中的任何一个都可以覆盖派生值。

配置受保护资源还会更改质询 (challenge)。被拒绝的请求将包含指向元数据文档的指针，而不是 `WWW-Authenticate: Bearer` 标头：

```http
WWW-Authenticate: Bearer resource_metadata="https://api.example.com/.well-known/oauth-protected-resource"
```

## 处理身份验证错误 {id="errors"}

### 身份验证错误响应 {id="errors-response"}

被拒绝的令牌会生成带有 `WWW-Authenticate: Bearer` 标头的 `401 Unauthorized`。

质询中不包含 `error`、`error_description` 和 `realm` 形参。因此，客户端无法区分令牌是缺失还是已过期，也无法区分是签名无效还是受众错误。有关诊断被拒绝令牌的详细信息，请参阅[查明令牌被拒绝的原因](#errors-logging)。

以下情况会生成 `401 Unauthorized`：

| 原因                                               | 备注                                               |
|----------------------------------------------------|----------------------------------------------------|
| 无令牌，或 `Authorization` 标头格式错误            |                                                    |
| 签名无效                                           |                                                    |
| 错误的签发者或错误的受众                           |                                                    |
| 令牌已过期                                         | 超过 `clockSkew` 容差后                            |
| `none`、`HS256`、`HS384` 或 `HS512` 算法          | 始终被拒绝                                         |
| 超出 `allowedAlgorithms` 的算法                    |                                                    |
| 未知的 `kid`                                       | 密钥不存在于已获取的 JWKS 文档中                   |
| 内省返回 `active: false`                           |                                                    |
| 内省返回了错误或已过期的受众                       |                                                    |

未知的 `kid` 表示令牌引用了检索到的 JWKS 文档中不存在的密钥，因此会导致 `401 Unauthorized`。

### 处理服务器端验证失败 {id="errors-500"}

某些失败会导致插件无法完成令牌验证，同时又无法确定令牌本身是否无效。这些失败会导致 `500 Internal Server Error`：

| 失败情况                                                                   | 异常                                                           |
|----------------------------------------------------------------------------|----------------------------------------------------------------|
| JWKS 端点不可达                                                            | `OidcSigningKeyUnavailableException`                           |
| 无法解析 JWKS 文档                                                         | `OidcSigningKeyUnavailableException`                           |
| JWKS 请求速率限制耗尽                                                      | `OidcSigningKeyUnavailableException`                           |
| 内省端点不可达或返回非 2xx 状态码                                          | `ResponseException`、`IOException` 或反序列化错误              |
| `fetchUserInfo` 请求在传输层失败                                           | 同上                                                           |
| 会话令牌刷新在传输层失败                                                   | 同上。请参阅[处理登录错误](server-oidc-browser-login.md#errors) |

因此，身份提供商发生故障可能会导致需要身份验证的请求失败并返回 `500 Internal Server Error`。

JWK 请求速率限制默认处于启用状态，并且也可能导致签名密钥查找失败。密钥查找限制为每分钟 10 次请求，并且对缓存中不存在的 kid 进行查找会计入此限制。在突发大量使用之前未见过的密钥签名的令牌时（例如在密钥轮换期间），可能会耗尽该限制。

若要提高限制，请配置 `jwkRateLimit`：

```kotlin
jwt { 
    jwkRateLimit(bucketSize = 60)
}
```

若要返回更合适的响应，请安装 [`StatusPages`](server-status-pages.md) 插件：

```kotlin
install(StatusPages) {
    exception<OidcSigningKeyUnavailableException> { call, cause ->
        val log = call.application.log
        log.error("Signing key unavailable", cause)
        call.respond(HttpStatusCode.ServiceUnavailable)
    }
}
```

`503 Service Unavailable` 表示在身份提供商恢复后，该请求可能会成功。

只有签名密钥失败具有专用的异常类型，并且它是唯一值得像这样进行全局捕获的异常。其余异常表现为 `ResponseException` 或 `IOException`，这些异常也由其他 [HTTP 客户端](client-create-and-configure.md)操作使用。请避免全局处理这些异常类型，因为这可能会导致不相关的故障被误报为提供商故障。建议在可能产生这些异常的操作附近对其进行处理，或者允许它们产生 `500 Internal Server Error`。

### 查明令牌被拒绝的原因 {id="errors-logging"}

令牌拒绝的详细信息会以 `TRACE` 级别记录。若要启用它们，请为插件包配置日志记录。使用 Logback 时，请将以下内容添加到 <Path>logback.xml</Path>（通常位于 <Path>src/main/resources/logback.xml</Path>）：

```xml

<configuration>
    <logger name="io.ktor.server.auth.oidc" level="TRACE"/>
</configuration>
```

每个提供商都在 `io.ktor.server.auth.oidc.OidcProvider[<name>]` 下记录日志，因此您可以仅为单个提供商提高日志级别，而不会受到其他提供商日志的干扰。

日志消息会指明未通过的验证检查，例如：
`JWT algorithm HS256 is not accepted` 或 `JWT kid abc123 does not match any JWK`。

### 自定义 401 响应 {id="errors-custom"}

`bearer {}` 配置不提供身份验证失败处理程序。若要自定义响应，请在受保护的路由上设置 `onUnauthorized` 处理程序：

```kotlin
routing {
    authenticateWith(
        auth0.jwtBearer,
        onUnauthorized = { cause ->
            call.respond(
                HttpStatusCode.Unauthorized,
                mapOf("error" to "invalid_token")
            )
        }
    ) {
        get("/orders") {
            call.respondText("ok")
        }
    }
}
```

路由级处理程序会完全替换内置响应，包括 `WWW-Authenticate` 标头。如果您配置了[受保护资源元数据](#protected-resource)，则 `resource_metadata` 形参也会被移除。如果客户端依赖此标头，请显式添加它。

对于接受多种身份验证方案的路由，请使用 `authenticateWithAnyOf(..., onUnauthorized = ...)`。

### 请勿将客户端 ID 复用为受众 {id="audience-overlap"}

如果 `bearer { audience }` 包含来自 `oauth { }` 块的 `clientId`，则除非提供商使用 `token_use` 或 `typ` 声明对其进行了标记，否则为登录签发的 ID 令牌可能会被误作为您 API 的访问令牌通过验证。并非所有提供商都会添加此类声明。

为您的 API 分配其专属的资源标识符：

```kotlin
oidc.identityProvider("auth0") {
    issuer = "https://my-tenant.auth0.com"
    bearer {
        // 资源标识符，而非登录客户端 ID
        audience = setOf("https://api.example.com")
    }
    oauth {
        clientId = "web-client"
        clientSecret = System.getenv("WEB_CLIENT_SECRET")
    }
}
```

当插件在启动时检测到 API 受众与 OAuth 客户端 ID 之间存在重叠时，会记录一条警告。

> 要了解有关发现、令牌验证设置和测试的更多信息，请参阅 [OpenID Connect](server-oidc.md)。
> 
> 有关使用同一提供商进行浏览器登录的信息，请参阅 [OpenID Connect 浏览器登录](server-oidc-browser-login.md)。
> 
{style="tip"}