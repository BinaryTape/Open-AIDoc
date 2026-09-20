[//]: # (title: OpenID Connect 浏览器登录)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
通过 OpenID Connect 提供商登录用户。该插件会创建登录和回调路由，并通过会话保持用户登录状态。
</link-summary>

本主题介绍如何使用 OpenID Connect 从浏览器登录用户、管理其会话，以及处理注销和令牌刷新。

> 要验证由 OpenID Connect 提供商颁发的令牌，请参阅[OpenID Connect 资源服务器](server-oidc-resource-server.md)。
> 
> 有关服务发现和插件设置，请参阅 [OpenID Connect](server-oidc.md)。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 插件属于实验性功能，仅在 JVM 上可用，并且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用
        <Links href="/ktor/server-typed-auth" summary="The type-safe authentication scheme API binds the principal type to the route, so you can read a non-null principal without
casts or null checks.">类型安全身份验证 API</Links>，该 API 需要 Kotlin 上下文形参。
    </p>
</note>

## 流程运作方式 {id="flow"}

1. 用户打开 `/oidc/{name}/login`。
2. Ktor 将用户重定向到提供商，附带 `state`、`nonce` 和 PKCE 质询。
3. 用户在提供商处登录并批准请求的作用域。
4. 提供商带着授权码将用户重定向回 `/oidc/{name}/callback`。
5. Ktor 用授权码兑换令牌，验证 ID 令牌，并存储会话。
6. `onAuthenticated` 处理程序运行。

该插件会创建以下路由：

| 路由                    | 方法   | 创建时机                  |
|-------------------------|--------|---------------------------|
| `/oidc/{name}/login`    | `GET`  | 始终                      |
| `/oidc/{name}/callback` | `GET`  | 始终                      |
| `/oidc/{name}/logout`   | `POST` | 当您调用 `logout()` 时    |
| `/oidc/{name}/refresh`  | `POST` | 当您调用 `refresh()` 时   |

将回调路由作为允许的重定向 URI 注册到您的提供商。

## 登录用户 {id="oauth"}

若要处理成功登录，请配置 OAuth 凭据并使用 `onAuthenticated` 处理程序：

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        oauth {
            clientId = System.getenv("GOOGLE_CLIENT_ID")
            clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
            onAuthenticated { idToken ->
                val subject = idToken.userInfo.subject
                userService.recordLogin(subject)
                call.respondRedirect("/dashboard")
            }
        }
    }
}
```

`onAuthenticated` 处理程序在成功回调的末尾运行一次，此时会话已被存储。
如果没有此处理程序，成功的登录将响应 `200 OK` 且正文为空。

`scopes` 属性默认为 `listOf("openid", "profile", "email")`。赋值会替换默认列表而不是追加，并且生成的列表必须仍包含 `openid`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    scopes = listOf("openid", "email", "calendar.read")
}
```

将 `fetchUserInfo = true` 设置为检索提供商未包含在 ID 令牌中的声明。这会在每次登录时向 UserInfo 端点添加一个请求。

> 将客户端密钥存储在源代码之外的配置文件中。有关详细信息，请参阅[从配置文件进行配置](server-oidc.md#config-file)。
>
{style="tip"}

## 自定义路由 {id="paths"}

您可以自定义所有生成的路径。`loginUri` 和 `redirectUri` 属性接受 `URLBuilder` 代码块，而 `logout()` 和 `refresh()` 接受 `path`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    loginUri = { path("auth", "google", "signin") }
    redirectUri = { path("auth", "google", "callback") }
    logout(path = "/auth/google/signout")
    refresh(path = "/auth/google/renew")
}
```

`redirectUri` 属性必须与在提供商处注册的重定向 URI 匹配。更改此值时，请更新注册的重定向 URI。

这些构建器都不支持查询参数。插件会拒绝包含查询参数的路径。

## 使用会话保护路由 {id="session"}

`provider.session` 方案对具有现有会话的用户进行身份验证。在代码块内，`call.principal` 是一个 `OidcToken.Id`：

```kotlin
routing {
    authenticateWith(google.session) {
        get("/dashboard") {
            val user = call.principal.userInfo
            call.respondText("Hello ${user.name}")
        }
    }
}
```

若要使用特定于应用程序的主体而不是 OIDC 令牌，可以使用 `mapPrincipal()` 映射该方案：

```kotlin
data class AppUser(val id: String, val email: String?)

val sessionAuth = google.session.mapPrincipal { token ->
    val info = token.userInfo
    userService.find(info.subject) ?: AppUser(
        id = info.subject,
        email = info.email
    )
}
```

> 有关详细信息，请参阅[将令牌映射到应用程序主体](server-oidc.md#map-principal)。
> 
{style="tip"}

## 配置会话 {id="sessions"}

会话默认启用。使用 `sessions { }` 代码块配置 Cookie 名称或会话存储：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    sessions {
        name = "GOOGLE_SESSION"
        storage = directorySessionStorage(
            File("build/.sessions")
        )
        cookie {
            cookie.path = "/"
            cookie.maxAgeInSeconds = 3600
        }
    }
}
```

Cookie 名称默认为 `{PROVIDER_NAME}_SESSION`。在非开发模式下，插件会设置 `HttpOnly`、`SameSite=Lax` 和 `Secure`。仅在需要时重写这些设置。

传输方式始终为 `SessionTransportType.CookieId` 且无法更改。只有会话 ID 会发送到浏览器。ID 令牌、访问令牌和刷新令牌保留在服务端的 `storage` 中。

会话存储默认为 `SessionStorageMemory()`，该存储在应用程序重启时会丢失所有会话，并且不会在实例之间共享会话。在部署到生产环境之前，请配置持久化或共享存储。

> 有关使用会话的详细信息，请参阅[会话](server-sessions.md)。
> 
{style="tip"}

## 防范 CSRF {id="csrf"}

插件生成的路由受到来源检查的保护：

```kotlin
sessions {
    csrfProtection {
        originMatchesHost()
    }
}
```

此保护默认启用，因此仅在需要更改时才配置此代码块。

您可以使用 `disableCsrfProtection()` 函数禁用 CSRF 保护。但是，注销和刷新路由接受来自浏览器的包含会话 Cookie 的 `POST` 请求，因此这些路由应保持受 CSRF 保护。

## 注销用户 {id="logout"}

若要注销用户，请使用 `logout()` 函数：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    logout(
        postLogoutRedirectUri = { path("signed-out") }
    )
}
```

对 `/oidc/google/logout` 发送 `POST` 请求将清除会话并响应 `303 See Other`，将用户重定向到提供商的 `end_session_endpoint`。

提供商必须在其发现文档中声明 `end_session_endpoint`。Ktor 在注册路由时会检查此项，因此缺少此项的提供商将导致您的应用程序启动失败，而不是在注销时失败。如果您的提供商不支持此端点，请直接清除会话，而不是调用 `logout()`。

传入处理程序以运行额外逻辑或提供自定义响应，而不是重定向：

```kotlin
logout {
    call.respondRedirect("/goodbye")
}
```

注销不会撤销提供商处的刷新令牌。

## 保持会话最新 {id="refresh"}

ID 令牌会过期。默认情况下，插件不会刷新它们。一旦令牌超过其 `exp` 值，会话将被清除，用户必须重新登录。

若要自动刷新令牌，请配置刷新策略：

```kotlin
sessions {
    tokenRefreshStrategy = OidcTokenRefreshStrategy.Auto(
        beforeExpiry = 30.seconds
    )
}
```

刷新后的令牌必须具有与现有令牌相同的 `sub` 值。否则，刷新后的令牌将被丢弃。

对于自动刷新，请使用 `OidcTokenRefreshStrategy.Auto`。对于自定义刷新行为，请使用 `OidcTokenRefreshStrategy.Custom`：

```kotlin
sessions {
    val custom = OidcTokenRefreshStrategy.Custom { provider, token, now ->
        val expiresAt = token.claims.expiresAt
        val stale = expiresAt != null && expiresAt <= now + 5.minutes
        val refreshToken = token.refreshToken
        if (stale && refreshToken != null) {
            provider.refreshToken(refreshToken).idToken
        } else {
            token
        }
    }
    tokenRefreshStrategy = custom
}
```

返回 `token` 以保留现有会话，返回新的 `OidcToken.Id` 以替换已存储的会话，或者在没有可用的刷新令牌时返回 `null`。如果回调返回 `null` 或抛出异常，则会话在当前令牌有效期间保持可用，并在过期后清除。要立即终止会话，请改用 [Sessions](server-sessions.md) 插件将其清除。

该回调针对通过会话方案认证的每个请求都会运行，因此请保持其操作轻量。请使用 `now` 形参而不是直接读取时钟，这样请求内的所有时间比较都使用相同的值。

`now` 形参和 `claims.expiresAt` 是 `kotlin.time.Instant`，属于实验性功能。比较它们的策略除了插件所需的选择启用之外，还需要 `@OptIn(ExperimentalTime::class)`。

您还可以为按需刷新添加路由：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    refresh()
}
```

对 `/oidc/google/refresh` 发送 `POST` 请求在成功时响应 `200 OK`，在无法刷新会话时响应 `401 Unauthorized`。在收到 `401` 响应时，现有会话将保持不变，直到其令牌过期。

### 手动刷新令牌 {id="manual-refresh"}

对于不使用所生成的刷新路由的情况（例如计划作业或在调用下游 API 之前进行刷新），请调用提供商上的 `refreshToken()` 函数：

```kotlin
val refreshToken = call.principal.refreshToken
if (refreshToken != null) {
    val result = google.refreshToken(refreshToken)
    val newIdToken = result.idToken
    if (newIdToken != null) {
        call.session = newIdToken
    }
}
```

`OidcTokenRefreshResult` 携带原始令牌响应：`accessToken`、`refreshToken`、`expiresIn`、`tokenType` 和 `scope`。当提供商未返回 ID 令牌时，`idToken` 属性为 null，因此在存储会话之前请对其进行检查。

在刷新期间，提供商可能会抛出以下异常：
* 当提供商拒绝请求时抛出 `ResponseException`。
* 当返回的令牌未通过验证时抛出 `OidcTokenRejectedException`。
* 当无法验证 ID 令牌时抛出 `OidcSigningKeyUnavailableException`。有关详细信息，请参阅[处理服务端验证失败](server-oidc-resource-server.md#errors-500)。

具有相同刷新令牌的并发调用会共享对提供商的单个请求。结果将在 `tokenRefreshCacheTtl` 期间复用，因此无需额外的同步。

> 没有 `exp` 声明的 ID 令牌绝不会被视为已过期或被刷新。只要 Cookie 有效，会话就保持有效。
>
{style="note"}

## 无会话登录 {id="no-session"}

如果您自己管理会话或签发自己的令牌，请禁用插件的会话支持：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    disableSessions()
    onAuthenticated { idToken ->
        val token = myTokenService.issue(idToken.userInfo)
        call.respondText(token)
    }
}
```

禁用会话时，`onAuthenticated` 是必需的。在此模式下，`provider.session`、`logout()` 和 `refresh()` 函数不可用。

## 使用多个提供商 {id="multiple"}

为每个签发者注册一个身份提供商。每个提供商都有自己的路由、Cookie 和身份验证方案：

```kotlin
val google = oidc.identityProvider("google") {
    issuer = "https://accounts.google.com"
    oauth {
        clientId = System.getenv("GOOGLE_CLIENT_ID")
        clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    }
}

val github = oidc.identityProvider("github-idp") {
    issuer = "https://idp.example.com"
    oauth {
        clientId = System.getenv("IDP_CLIENT_ID")
        clientSecret = System.getenv("IDP_CLIENT_SECRET")
    }
}
```

在上述示例中，登录页面链接到 `/oidc/google/login` 和 `/oidc/github-idp/login`。若要允许任一提供商对相同路由进行身份验证，请将两者映射到共享的主体类型，并使用 `authenticateWithAnyOf()` 函数。

## 请求限定作用域的令牌 {id="resource-indicators"}

使用 `resourceIndicators` 属性（[RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)）为特定 API 请求访问令牌：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    resourceIndicators = listOf("https://api.example.com")
}
```

该值应与 API 在其[受保护资源元数据](server-oidc-resource-server.md#protected-resource)中发布的标识符相匹配。

## 了解 PKCE {id="pkce"}

授权码通过用户的浏览器返回，并经过不受您控制的软件。另一个应用程序（例如注册了相同 URL 方案的恶意应用或日志记录代理）可能会获取该授权码并尝试兑换令牌。

PKCE（[RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)）可以防止授权码在没有额外密钥的情况下被使用。在重定向用户之前，Ktor 会生成一个称为 _verifier_ 的随机密钥，并且仅将其 SHA-256 哈希值（即 _challenge_）发送给提供商。当 Ktor 稍后兑换授权码时，它会出示 verifier，提供商会检查其哈希值是否与所存储的 challenge 相符。

verifier 在授权请求期间不会发送给提供商，也不能被浏览器脚本读取。Ktor 将其与 `state` 和 `nonce` 值一起存储在插件设置的 AES-256-GCM 加密 Cookie 中，因此浏览器仅持有它没有密钥的密文。解密该 Cookie 需要您的 `stateEncryptionKey`。

Ktor 在每次登录时都使用 PKCE。`codeChallengeMethod` 默认为 `CodeChallengeMethod.S256`，且仅支持 `S256`。自定义质询方法会被拒绝。由于 verifier 存储在该 Cookie 中，因此登录存在[时间限制](#errors-state)。

## 处理登录错误 {id="errors"}

### 响应登录失败 {id="errors-handler"}

当无法完成回调时，`onAuthenticationFailed` 处理程序会运行：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    onAuthenticationFailed { cause ->
        val reason = (cause as? AuthenticationFailedCause.Error)
            ?.message
        call.application.log.info("Login failed: $reason")
        call.respondRedirect("/oidc/google/login")
    }
}
```

该处理程序接收的是 `AuthenticationFailedCause`，而不是异常。
`AuthenticationFailedCause.Error` 提供了包含失败详细信息的 `message`。

如果没有处理程序，登录失败将响应 `401 Unauthorized` 且正文为空。对于浏览器应用程序，您可以将用户重定向到登录路由以启动新的身份验证流程。

该处理程序应生成响应。如果未生成响应，Ktor 将回退到失败时注册的质询，或者在没有可用质询时响应 `401 Unauthorized`。

当令牌端点以 `invalid_grant` 拒绝授权码时（这发生在授权码已过期或已被使用时），重定向回提供商会被注册为回退方案。如果处理程序未作出响应，登录流程将重新开始。

重新启动流程很有用，例如当用户刷新回调页面并尝试重复使用相同的授权码时。但风险在于它可能会循环重复。然而，重复的 invalid_grant 响应可能会造成重定向循环。当每个授权码都失败时（例如因为客户端密钥不正确或系统时钟导致授权码看似已过期），就可能发生这种情况。

若要阻止回退重定向，请在处理程序内作出响应。若要允许重试一次，请跟踪是否已经发生过重试：

```kotlin
onAuthenticationFailed { cause ->
    val retried =
        call.request.cookies["oidc_retry"] != null
    if (cause is OAuth2InvalidGrantError && !retried) {
        call.response.cookies.append(
            name = "oidc_retry",
            value = "1",
            maxAge = 120,
            path = "/",
            httpOnly = true
        )
        call.respondRedirect("/oidc/google/login")
    } else {
        call.response.cookies.append(
            name = "oidc_retry",
            value = "",
            maxAge = 0,
            path = "/"
        )
        call.application.log.warn("Login failed: $cause")
        call.respond(HttpStatusCode.Unauthorized)
    }
}
```

短期的 Cookie 会记录是否已经发生过重试。第二次失败将返回错误而不是再次重定向。该 Cookie 会在此错误时被清除，并在两分钟后自动过期，因此下一次登录不会受到影响。

### 登录时间窗口为 10 分钟 {id="errors-state"}

`state`、`nonce` 和 PKCE verifier 保存在加密的 Cookie 中，该 Cookie 在 10 分钟后过期。这是不可配置的。

打开登录页面后离开、并在一个小时后返回的用户，其回调将会失败。在应用程序重启时登录正在进行中的用户也是如此，除非您配置了 `stateEncryptionKey`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    stateEncryptionKey = OidcStateEncryptionKey.of(stateKey)
}
```

该密钥长度必须恰好为 32 字节。如果没有显式密钥，插件会为每个进程生成一个新密钥。因此，正在进行的登录在应用程序重启后将失败，并且无法在负载均衡器背后的多个实例之间继续。您可以使用 `OidcStateEncryptionKey.rotating(current, previous)` 来轮换密钥，而不会使已经在进行中的登录流程失效。

过期的登录和伪造的回调会产生相同的失败，因此处理程序无法区分它们。这就是为什么重定向回登录路由是默认行为。

### 身份验证失败原因 {id="errors-causes"}

| 原因                                   | 典型缘由                                                                        |
|----------------------------------------|---------------------------------------------------------------------------------|
| 提供商返回了 `error=`                  | 用户拒绝授权                                                                    |
| 状态 Cookie 缺失或已过期               | 超过了 10 分钟的时间窗口，或者在没有 `stateEncryptionKey` 的情况下发生重启        |
| 无法解密状态 Cookie                    | 伪造的回调，或轮换了密钥                                                        |
| `iss` 不匹配或缺失                     | 提供商混淆（[RFC 9207](https://www.rfc-editor.org/rfc/rfc9207)）                |
| `nonce` 不匹配                         | 重放的 ID 令牌                                                                  |
| `at_hash` 不匹配                       | ID 令牌与访问令牌不匹配                                                          |
| 响应不包含 `id_token`                  | 提供商运行的不是 OIDC 流程                                                      |
| ID 令牌验证失败                        | 签名、签发者、受众、`exp`、`iat`、`azp` 或 `sub` 验证失败                        |
| 令牌端点返回错误                       | 过期或重复使用的授权码                                                          |

### 处理提供商可用性错误 {id="errors-500"}

某些失败永远不会到达 `onAuthenticationFailed`，而是作为 `500 Internal Server Error` 呈现。有关详细信息，请参阅[处理服务端验证失败](server-oidc-resource-server.md#errors-500)。

这可能在自动令牌刷新期间发生。使用 `OidcTokenRefreshStrategy.Auto` 时，刷新会在处理常规请求的过程中运行。因此，如果提供商不可用，请求可能会以 `500` 响应失败。

会话的处理方式取决于刷新失败的原因：

| 失败情况                                        | 会话                                         | 结果                                                              |
|-------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|
| 刷新的令牌无效                                  | 清除                                         | `401`，并且 Cookie 被移除。会话无法恢复                           |
| 提供商不可达或返回错误                          | 保留，除非已过期                             | 异常向上抛出，因此为 `500`                                        |
| 响应中没有 ID 令牌，或 `sub` 已更改             | 在依然有效期间保留，一旦过期则清除           | 在旧令牌过期前正常工作                                            |

会话清除后，下一个受保护的请求将未经身份验证，用户必须重新登录。

> 要了解更多有关发现、会话安全默认设置和测试的信息，请参阅 [OpenID Connect](server-oidc.md)。
> 
> 有关在 API 中验证令牌的信息，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)。
> 
> 有关会话存储和 Cookie 配置，请参阅[会话](server-sessions.md)。
> 
{style="tip"}