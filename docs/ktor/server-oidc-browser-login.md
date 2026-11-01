[//]: # (title: OpenID Connect 浏览器登录)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links> 支持</b>：✖️
</p>
</tldr>

<link-summary>
通过 OpenID Connect 提供商让用户登录。该插件会创建登录和回调路由，并通过会话保持用户的登录状态。
</link-summary>

本主题介绍如何使用 OpenID Connect 让用户从浏览器登录、管理其会话，以及处理注销和令牌刷新。

> 要验证由 OpenID Connect 提供商签发的令牌，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)。
> 
> 有关服务发现和插件设置，请参阅 [OpenID Connect](server-oidc.md)。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 插件目前处于实验性阶段，仅在 JVM 上可用，并且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用了
        <Links href="server-typed-auth.md" summary="类型安全的身份验证方案 API 将主体类型绑定到路由，因此您无需类型转换或 null 检查即可读取非 null 主体。">类型安全身份验证 API</Links>，该 API 需要 Kotlin 上下文形参（context parameters）。
    </p>
</note>

## 流程运作方式 {id="flow"}

1. 用户打开 `/oidc/{name}/login`。
2. Ktor 将用户重定向到提供商，并附带 `state`、`nonce` 和 PKCE 质询。
3. 用户在提供商处登录并批准所请求的作用域。
4. 提供商携带授权码将用户重定向回 `/oidc/{name}/callback`。
5. Ktor 使用授权码换取令牌，验证 ID 令牌，并存储会话。
6. `onAuthenticated` 处理程序运行。

该插件会创建以下路由：

| 路由                    | 方法   | 创建时机                  |
|-------------------------|--------|---------------------------|
| `/oidc/{name}/login`    | `GET`  | 始终                      |
| `/oidc/{name}/callback` | `GET`  | 始终                      |
| `/oidc/{name}/logout`   | `POST` | 当您调用 `logout()` 时    |
| `/oidc/{name}/refresh`  | `POST` | 当您调用 `refresh()` 时   |

请在您的提供商处将回调路由注册为允许的重定向 URI。

## 让用户登录 {id="oauth"}

要处理成功的登录，请配置 OAuth 凭据并使用 `onAuthenticated` 处理程序：

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

`onAuthenticated` 处理程序会在成功回调的末尾运行一次，此时会话已经存储完成。
如果没有此处理程序，成功的登录将返回状态码 `200 OK` 且响应体为空。

`scopes` 属性的默认值为 `listOf("openid", "profile", "email")`。赋值会替换默认列表而不是向其追加内容，并且生成的列表仍必须包含 `openid`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    scopes = listOf("openid", "email", "calendar.read")
}
```

将 `fetchUserInfo` 设置为 `true` 可以检索提供商未包含在 ID 令牌中的声明（claims）。这会在每次登录时向 UserInfo 端点追加一次请求。

> 请将客户端密钥存储在源代码之外的配置文件中。要了解更多信息，请参阅[从配置文件进行配置](server-oidc.md#config-file)。
>
{style="tip"}

## 自定义路由 {id="paths"}

您可以自定义所有生成的路径。`loginUri` 和 `redirectUri` 属性接受 `URLBuilder` 代码块，而 `logout()` 和 `refresh()` 则接受一个 `path`：

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

`redirectUri` 属性必须与向您的提供商注册的重定向 URI 相匹配。当您更改此值时，请同步更新注册的重定向 URI。

这些构建器均不支持查询形参。插件会拒绝包含查询形参的路径。

## 使用会话保护路由 {id="session"}

`provider.session` 方案使用现有会话对用户进行身份验证。在代码块内，`call.principal` 的类型为 `OidcToken.Id`：

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

若要使用应用程序特定的主体代替 OIDC 令牌，请使用 `mapPrincipal()` 映射该方案：

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

> 要了解更多信息，请参阅[将令牌映射到应用程序主体](server-oidc.md#map-principal)。
> 
{style="tip"}

## 配置会话 {id="sessions"}

会话默认处于启用状态。使用 `sessions { }` 代码块来配置 Cookie 名称或会话存储：

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

Cookie 名称默认为 `{PROVIDER_NAME}_SESSION`。在开发模式之外，该插件会设置 `HttpOnly`、`SameSite=Lax` 和 `Secure`。仅在必要时才重写这些设置。

传输方式始终为 `SessionTransportType.CookieId` 且无法更改。只有会话 ID 会发送到浏览器。
ID 令牌、访问令牌和刷新令牌保留在服务端的 `storage` 中。

会话存储默认为 `SessionStorageMemory()`，它会在应用程序重启时丢失所有会话，且无法在各实例之间共享会话。在部署到生产环境之前，请配置持久化或共享存储。

> 有关使用会话的更多信息，请参阅[会话](server-sessions.md)。
> 
{style="tip"}

## 防范 CSRF {id="csrf"}

插件生成的路由受到源检查（origin checks）的保护：

```kotlin
sessions {
    csrfProtection {
        originMatchesHost()
    }
}
```

该保护默认启用，因此仅在需要修改时才配置此代码块。

您可以使用 `disableCsrfProtection()` 函数禁用 CSRF 保护。但是，注销和刷新路由接受来自浏览器且包含会话 Cookie 的 `POST` 请求，因此这些路由应保持 CSRF 防护。

## 让用户注销 {id="logout"}

要让用户注销，请使用 `logout()` 函数：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    logout(
        postLogoutRedirectUri = { path("signed-out") }
    )
}
```

向 `/oidc/google/logout` 发送的 `POST` 请求会清除会话并返回 `303 See Other` 响应，将用户重定向到提供商的 `end_session_endpoint`。

提供商必须在其发现文档中声明 `end_session_endpoint`。Ktor 会在注册路由时对此进行检查，因此若提供商缺少该端点，会导致应用程序无法启动，而不是在注销时才发生失败。如果您的提供商不支持此端点，请直接清除会话，而不是调用 `logout()`。

传入一个处理程序以运行额外的逻辑或提供自定义响应，而不是直接进行重定向：

```kotlin
logout {
    call.respondRedirect("/goodbye")
}
```

注销操作不会撤回提供商处的刷新令牌。

## 保持会话最新 {id="refresh"}

ID 令牌会过期。默认情况下，插件不会自动刷新它们。一旦令牌超过其 `exp` 值，会话就会被清除，用户必须重新登录。

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

返回 `token` 可保留现有会话，返回新的 `OidcToken.Id` 可替换存储的会话，或者在没有可用刷新令牌时返回 `null`。如果回调返回 `null` 或抛出异常，则会话在当前令牌有效期间仍保持可用，并在过期后被清除。若要立即结束会话，请改用 [Sessions](server-sessions.md) 插件将其清除。

该回调会在每次使用会话方案进行身份验证的请求中运行，因此请保持其逻辑轻量。使用 `now` 形参而不是直接读取系统时钟，以便请求内的所有时间比较都使用相同的值。

`now` 形参和 `claims.expiresAt` 属于 `kotlin.time.Instant` 类型，这是一个实验性功能。进行两者比较的策略除了插件所需的选择加入（opt-in）之外，还需要 `@OptIn(ExperimentalTime::class)`。

您还可以添加一个按需刷新的路由：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    refresh()
}
```

向 `/oidc/google/refresh` 发送的 `POST` 请求在成功时响应 `200 OK`，在会话无法刷新时响应 `401 Unauthorized`。收到 `401` 响应时，现有会话将保持不变，直到其令牌过期。

### 手动刷新令牌 {id="manual-refresh"}

对于不使用生成的刷新路由的场景（例如定时作业或在调用下游 API 之前进行刷新），请调用提供商上的 `refreshToken()` 函数：

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

`OidcTokenRefreshResult` 携带原始令牌响应：`accessToken`、`refreshToken`、`expiresIn`、`tokenType` 和 `scope`。当提供商未返回 ID 令牌时，`idToken` 属性为 null，因此在存储会话前请先对其进行检查。

提供商在刷新期间可能会抛出以下异常：
* `ResponseException`：当提供商拒绝请求时抛出。
* `OidcTokenRejectedException`：当返回的令牌未通过验证时抛出。
* `OidcSigningKeyUnavailableException`：当无法验证 ID 令牌时抛出。要了解更多信息，请参阅[处理服务端验证失败](server-oidc-resource-server.md#errors-500)。

使用相同刷新令牌发起的并发调用将共享向提供商发出的单次请求。结果会在 `tokenRefreshCacheTtl` 期间复用，因此无需额外的同步操作。

> 没有 `exp` 声明的 ID 令牌永远不会被视为过期或被刷新。只要 Cookie 有效，会话就始终有效。
>
{style="note"}

## 无会话登录 {id="no-session"}

如果您自行管理会话或签发自己的令牌，请禁用插件的会话支持：

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

当会话被禁用时，必须提供 `onAuthenticated`。在此模式下，`provider.session`、`logout()` 和 `refresh()` 函数均不可用。

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

在上述示例中，登录页面分别链接到 `/oidc/google/login` 和 `/oidc/github-idp/login`。若要允许任意一个提供商对同一路由进行身份验证，请将两者映射到共享的主体类型，并使用 `authenticateWithAnyOf()` 函数。

## 请求限定范围的令牌 {id="resource-indicators"}

使用 `resourceIndicators` 属性（[RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)）为特定 API 请求访问令牌：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    resourceIndicators = listOf("https://api.example.com")
}
```

该值应与 API 在其[受保护资源元数据](server-oidc-resource-server.md#protected-resource)中发布的标识符匹配。

## 理解 PKCE {id="pkce"}

授权码通过用户的浏览器返回，并经过不在您控制范围内的软件。其他应用程序（例如注册了相同 URL scheme 的恶意应用或日志代理）可能会获取该代码并尝试用其换取令牌。

PKCE（[RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)）可以防止在没有额外密钥的情况下使用授权码。在重定向用户之前，Ktor 会生成一个称为验证器（_verifier_）的随机密钥，并且仅将其 SHA-256 哈希值（即质询 _challenge_）发送给提供商。当 Ktor 稍后换取代码时，它会出示该验证器，提供商会验证其哈希值是否与其存储的质询相匹配。

在授权请求期间，验证器不会发送给提供商，也无法被浏览器脚本读取。Ktor 会将验证器与 `state` 和 `nonce` 值一起存储在插件设置的 AES-256-GCM 加密 Cookie 中，因此浏览器仅持有其没有密钥的密文。解密该 Cookie 需要您的 `stateEncryptionKey`。

Ktor 在每次登录时都使用 PKCE。`codeChallengeMethod` 默认为 `CodeChallengeMethod.S256`，且仅支持 `S256`。自定义质询方法会被拒绝。由于验证器存储在该 Cookie 中，因此登录具有[时间限制](#errors-state)。

## 处理登录错误 {id="errors"}

### 响应登录失败 {id="errors-handler"}

当回调无法完成时，`onAuthenticationFailed` 处理程序会运行：

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

如果没有处理程序，失败的登录将响应 `401 Unauthorized` 且响应体为空。对于浏览器应用程序，您可以将用户重定向到登录路由以启动新的身份验证流程。

该处理程序应该生成一个响应。如果未生成响应，Ktor 会回退到失败所注册的质询，或者在没有可用质询时响应 `401 Unauthorized`。

当令牌端点以 `invalid_grant` 拒绝授权码时（通常发生在授权码已过期或已被使用的情况下），重定向回提供商会被注册为回退操作。如果处理程序未作出响应，登录流程将重新开始。

重新启动流程在某些情况下很有用，例如当用户刷新回调页面并尝试重用相同的代码时。
但风险在于它可能会反复发生。重复的 invalid_grant 响应可能会导致重定向死循环。当每个授权码均失败时就会发生这种情况，例如由于客户端密钥不正确或系统时钟导致代码显得已过期。

为防止回退重定向，请在处理程序内部作出响应。若要仅允许单次重试，请跟踪重试是否已经发生：

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

一个短期 Cookie 会记录重试是否已经发生。第二次失败将返回错误而不是再次重定向。该 Cookie 会在出错时被清除，并在两分钟后自动过期，从而不会影响下一次登录。

### 登录窗口期为 10 分钟 {id="errors-state"}

`state`、`nonce` 和 PKCE 验证器保存在加密的 Cookie 中，该 Cookie 将在 10 分钟后过期。此设置不可配置。

如果用户打开登录页面，离开并在一个小时后返回，回调将会失败。同样，在登录过程中如果应用程序重启，该登录也会失败，除非您配置了 `stateEncryptionKey`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    stateEncryptionKey = OidcStateEncryptionKey.of(stateKey)
}
```

密钥长度必须恰好为 32 字节。如果没有显式指定密钥，插件会为每个进程生成一个新密钥。因此，在应用程序重启后，进行中的登录将会失败，并且无法跨负载均衡器后面的多个实例继续进行。您可以使用 `OidcStateEncryptionKey.rotating(current, previous)` 轮换密钥，而不会使已在进行中的登录流程失效。

过期的登录和伪造的回调会产生相同的失败，因此处理程序无法区分它们。这就是为什么默认行为是重定向回登录路由的原因。

### 身份验证失败原因 {id="errors-causes"}

| 原因                                   | 典型原因                                                                        |
|----------------------------------------|---------------------------------------------------------------------------------|
| 提供商返回了 `error=`                  | 用户拒绝了授权同意                                                              |
| state Cookie 缺失或已过期              | 超过了 10 分钟的时间窗口，或者在未配置 `stateEncryptionKey` 的情况下发生了重启  |
| 无法解密 state Cookie                  | 伪造的回调，或者密钥已轮换                                                      |
| `iss` 不匹配或缺失                     | 提供商之间混淆（[RFC 9207](https://www.rfc-editor.org/rfc/rfc9207)）            |
| `nonce` 不匹配                         | 重放的 ID 令牌                                                                  |
| `at_hash` 不匹配                       | ID 令牌与访问令牌不匹配                                                         |
| 响应中不包含 `id_token`                | 提供商未在运行 OIDC 流程                                                        |
| ID 令牌验证失败                        | 签名、签发者、受众、`exp`、`iat`、`azp` 或 `sub` 验证失败                        |
| 令牌端点返回了错误                     | 授权码已过期或被重复使用                                                        |

### 处理提供商可用性错误 {id="errors-500"}

某些失败绝不会传递到 `onAuthenticationFailed`，而是表现为 `500 Internal Server Error`。要了解更多信息，请参阅[处理服务端验证失败](server-oidc-resource-server.md#errors-500)。

这可能会在自动令牌刷新期间发生。使用 `OidcTokenRefreshStrategy.Auto` 时，刷新操作会在处理普通请求的过程中运行。因此，如果提供商不可用，该请求可能会以 `500` 响应失败。

会话的处理方式取决于刷新失败的原因：

| 失败情况                                        | 会话                                         | 结果                                                              |
|-------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|
| 刷新后的令牌无效                                | 清除                                         | 返回 `401`，且 Cookie 被移除。该会话永远无法恢复                  |
| 提供商无法访问或返回错误                        | 保留，除非已经过期                           | 异常向上传播，因此返回 `500`                                      |
| 响应中没有 ID 令牌，或者 `sub` 发生了变化       | 在仍有效期间保留，一旦过期则清除             | 可以继续使用，直到旧令牌过期                                      |

在会话被清除后，下一次受保护的请求将处于未经身份验证的状态，用户必须重新登录。

> 要了解关于服务发现、会话安全默认设置以及测试的更多信息，请参阅 [OpenID Connect](server-oidc.md)。
> 
> 有关在 API 中验证令牌的信息，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)。
> 
> 有关会话存储和 Cookie 配置，请参阅[会话](server-sessions.md)。
> 
{style="tip"}