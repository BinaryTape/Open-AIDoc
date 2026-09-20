[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
OpenID Connect 插件允许你使用提供者的发现文档，从签发者 URL 配置令牌验证和浏览器登录。
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) 是建立在 OAuth 2.0 之上的身份层。
OAuth 2.0 提供了委托授权框架，而 OIDC 则通过允许客户端验证最终用户的身份来添加身份验证功能。它在 ID 令牌中提供身份信息。

`Oidc` 插件支持以下典型场景：

* **保护 API。** 在允许访问受保护路由之前，验证由 OpenID Connect 提供者签发的令牌。有关详细信息，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)。
* **用户登录。** 将用户重定向到 OpenID Connect 提供者进行身份验证，并在登录后处理回调。有关详细信息，请参阅 [OpenID Connect 浏览器登录](server-oidc-browser-login.md)。

两种场景均从提供者的签发者 URL 开始。该插件会读取提供者的发现文档，并解析出相应的端点、签名密钥以及支持的算法。

<note>
    <p>
        OpenID Connect 插件处于实验性阶段，仅适用于 JVM，并且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用了
        <Links href="/ktor/server-typed-auth" summary="类型安全的身份验证方案 API 将主体类型绑定到路由，因此你无需类型转换或 null 检查即可读取非 null 主体。">类型安全的身份验证 API</Links>，该 API 需要 Kotlin 上下文形参。
    </p>
</note>

## 添加依赖项 {id="add_dependencies"}

要使用 `Oidc` 插件，请将 `%artifact_name%` 工件添加到构建脚本中：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 此工件仅适用于 JVM。
> 
{style="note"}

## 注册身份提供者 {id="register"}

安装 `Oidc` 插件并为每个签发者注册一个身份提供者：

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        bearer {
            audience = setOf("my-api")
        }
    }
}
```

`identityProvider()` 函数在返回前会检索发现文档，因此必须在挂起函数中调用，例如[挂起应用程序模块](server-modules.md#concurrent-modules)。

提供者名称用于生成的路由路径和身份验证方案名称中。它必须包含小写字母、数字以及由连字符分隔的片段。例如，`google` 和 `my-idp` 是有效名称，而 `Google` 和 `my_idp` 则无效。

每个提供者名称和签发者都必须是唯一的。多次注册相同的名称或签发者会抛出 `IllegalArgumentException`。

`identityProvider()` 函数返回一个 `OidcProvider`，你可以用它来保护路由。根据其配置，该提供者最多会公开三个可与 `authenticateWith()` 一起使用的身份验证方案：

| 配置方式                           | 方案                             | 保护对象                              |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }`                   | `provider.jwtBearer`           | 接收 JWT 访问令牌的 API                  |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 接收不透明访问令牌的 API                  |
| `oauth { }`                    | `provider.session`             | 处于浏览器登录保护之下的路由               |

读取尚未配置的方案会抛出 `IllegalStateException`。异常消息会指明启用该方案所需的配置块。

> 有关详细信息，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)与 [OpenID Connect 浏览器登录](server-oidc-browser-login.md)。
> 
{style="tip"}

## 发现机制的工作原理 {id="discovery"}

插件会检索 `<issuer>/.well-known/openid-configuration`，然后从中读取提供者端点和签名密钥。你无需手动配置授权端点、令牌端点或 JWKS URL。

发现文档中的 `issuer` 值必须与配置的 `issuer` 完全匹配，包括任何末尾斜杠。此项比较是一项安全检查，因此插件不会对任一值进行规范化处理。

在初始请求之后，插件会按照 `discoveryRefreshInterval` 指定的间隔重新读取该文档，默认间隔为 15 分钟。这使得密钥轮换无需重启应用程序即可生效：

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

要禁用定期的发现刷新，请将 `discoveryRefreshInterval` 设置为 `Duration.ZERO`。

## 处理发现失败 {id="discovery-errors"}

发现失败在[应用程序启动期间](#discovery-errors-startup)与[应用程序运行期间](#discovery-errors-runtime)的处理方式有所不同。

### 启动时 {id="discovery-errors-startup"}

如果初始发现请求失败，`identityProvider()` 会抛出 `OidcDiscoveryException`。异常会从模块函数中抛出，应用程序将不会启动。

默认情况下，插件会进行一次发现尝试。如果你的提供者在启动期间可能暂时不可用，请增加尝试次数：

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

重试机制适用于网络和 HTTP 错误。不适用于配置错误，例如签发者不匹配，或发现文档中缺少必需的端点。这些错误会立即失败并抛出 `IllegalArgumentException`。

### 运行时 {id="discovery-errors-runtime"}

如果定期刷新失败，插件将继续使用最近检索到的发现文档。它会在 `discoveryRefreshFailureDelay`（默认为 1 分钟）之后重试，并持续重试直至成功。

默认情况下不会记录刷新失败日志。若要监控这些失败，请订阅 `OidcMetadataRefreshFailed` 事件：

```kotlin
monitor.subscribe(OidcMetadataRefreshFailed) { failure ->
    log.warn(
        "OIDC refresh failed for {} ({} in a row)",
        failure.provider.name,
        failure.consecutiveFailures,
        failure.cause
    )
}
```

## 配置静态元数据 {id="static-metadata"}

如果提前已知提供者端点，或者你需要静态配置用于测试，请使用 `metadata` 属性：

```kotlin
val provider = oidc.identityProvider("static") {
    issuer = issuerUrl
    metadata = OpenIdProviderMetadata(
        issuer = issuerUrl,
        authorizationEndpoint = "$issuerUrl/authorize",
        tokenEndpoint = "$issuerUrl/token",
        jwksUri = "$issuerUrl/jwks",
    )
}
```

设置 `metadata` 会跳过初始发现请求，并禁用该提供者的定期发现刷新。之后，你的应用程序将负责保持元数据的最新状态，包括在密钥轮换之后。

静态文档中的签发者仍必须与配置的 `issuer` 相匹配。JWKS 端点仍会通过 HTTP 进行访问。若要在测试期间避免该请求，请参阅[无需外部提供者进行测试](#testing)。

## 令牌类型 {id="tokens"}

每个身份验证[方案](#register)都会生成一个特定的主体类型，因此路由始终清楚其所持有的内容：

| 方案                             | 主体                      | 来源                                    |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session`             | `OidcToken.Id`           | 浏览器登录                               |
| `provider.jwtBearer`           | `OidcToken.Access`       | 本地验证的 JWT 访问令牌                   |
| `provider.introspectionBearer` | `OidcToken.Introspected` | 由提供者检查的访问令牌                     |

`OidcToken.Id` 和 `OidcToken.Access` 提供了用于获取原始 JWT 声明的 `claims`，以及用于获取标准化用户字段（如 `subject`、`name` 和 `email`）的 `userInfo`。`OidcToken.Introspected` 则提供 `introspection`。

## 将令牌映射到应用程序主体 {id="map-principal"}

路由通常使用特定于应用程序的主体，而不是 OIDC 令牌。使用 `.mapPrincipal()` 函数可创建一个能生成你的应用程序类型的新身份验证方案：

```kotlin
data class AppUser(val id: String, val email: String?)

val apiAuth = google.jwtBearer.mapPrincipal { token ->
    val id = token.claims.subject ?: return@mapPrincipal null
    AppUser(id, token.userInfo?.email)
}

routing {
    authenticateWith(apiAuth) {
        get("/me") {
            call.respond(call.principal.id)
        }
    }
}
```

返回 `null` 会拒绝请求。你可以利用此行为，在对应的应用程序账户不再存在时拒绝有效令牌。

主体映射在方案对路由进行身份验证时运行，而不是在 OAuth 回调期间运行。例如，如果已登录的用户稍后从数据库中删除，该用户在下一次请求时将被拒绝，而不会保留有效的应用程序会话。

## 从配置文件配置 {id="config-file"}

将客户端密钥存储在配置文件中，而不是源代码中。例如，在
<Path>application.yaml</Path> 文件中：

```yaml
ktor:
  oidc:
    google:
      issuer: "https://accounts.google.com"
      clientId: "$GOOGLE_CLIENT_ID"
      clientSecret: "$GOOGLE_CLIENT_SECRET"
      scopes: ["openid", "profile", "email"]
```

`$GOOGLE_CLIENT_ID` 和 `$GOOGLE_CLIENT_SECRET` 引用环境变量。

> 有关使用配置文件的更多信息，请参阅[文件中的配置](server-configuration-file.topic)。
> 
{style="tip"}

然后你可以将该配置作为 `OidcEnvConfig` 读取：

```kotlin
val env = environment.config
    .property("ktor.oidc.google")
    .getAs<OidcEnvConfig>()

val google = oidc.identityProvider("google") {
    issuer = env.issuer
    oauth {
        clientId = env.clientId
        clientSecret = env.clientSecret
        scopes = env.scopes
    }
}
```

插件不会自动加载此配置。`OidcEnvConfig` 只是一个用于读取这些值的便捷类型。你的应用程序决定了值的来源以及应用方式。

## 配置令牌验证 {id="jwt-config"}

使用 `jwt {}` 块配置令牌的验证方式。默认设置是安全的，因此仅在需要时进行更改：

```kotlin
oidc.identityProvider("google") {
    issuer = "https://accounts.google.com"
    jwt {
        clockSkew = 30.seconds
        allowedAlgorithms = setOf(
            SignatureAlgorithm.RSA_SHA_256
        )
        jwkCache(maxEntries = 10, duration = 1.hours)
        jwkRateLimit(bucketSize = 10)
    }
}
```

* `clockSkew` 指定应用于 `exp` 和 `nbf` 的容差。默认值为 60 秒。
* `allowedAlgorithms` 限制接受的签名算法。未设置此选项时，ID 令牌将回退到发现文档所声明的算法。只能指定 RSA 和 EC 算法。
* `jwkCache` 和 `jwkRateLimit` 控制查询 JWKS 端点的频率。默认情况下启用速率限制，上限为每分钟 10 次请求。如果超出限制，请求将失败并抛出 `OidcSigningKeyUnavailableException`，而不是直接拒绝令牌。请配置该限制以满足预期的缓存未命中峰值流量。有关详细信息，请参阅[处理服务端验证失败](server-oidc-resource-server.md#errors-500)。

无论如何配置，`none` 算法和所有 HMAC 算法（`HS256`、`HS384`、`HS512`）始终会被拒绝。共享密钥不是验证第三方签发令牌的安全方式。

`jwkProviderFactory` 不能与 `jwkCache` 或 `jwkRateLimit` 一起使用。如果提供了自定义的 JWK 提供者工厂，则你的应用程序需要自行负责缓存。

## 无需外部提供者进行测试 {id="testing"}

`OpenIdTestKeys` 会在内存中生成密钥对，并签发由该密钥签名的令牌。结合静态元数据，可以在不产生任何网络调用的情况下获得完整的 OIDC 设置，同时依然执行真实的签发者、受众、算法和签名检查：

```kotlin
@Test
fun `rejects a token for another audience`() = testApplication {
    val issuerUrl = "https://test-issuer"
    val keys = OpenIdTestKeys.rsa(
        issuer = issuerUrl,
        audience = "my-api"
    )

    application {
        val oidc = install(Oidc)
        val provider = oidc.identityProvider("test") {
            issuer = issuerUrl
            metadata = OpenIdProviderMetadata(
                issuer = issuerUrl,
                authorizationEndpoint = "$issuerUrl/authorize",
                tokenEndpoint = "$issuerUrl/token",
                jwksUri = "$issuerUrl/jwks",
            )
            jwt(keys)
            bearer { audience = setOf("my-api") }
        }

        routing {
            authenticateWith(provider.jwtBearer) {
                get("/protected") {
                    call.respondText(call.principal.value)
                }
            }
        }
    }

    val token = keys.accessToken {
        subject = "user-1"
        audience = "some-other-api"
    }

    val response = client.get("/protected") {
        bearerAuth(token)
    }

    assertEquals(HttpStatusCode.Unauthorized, response.status)
}
```

`jwt(keys)` 函数将验证器配置为使用内存中的公钥并限制所允许的算法，因此不会发起 JWKS 请求。

使用 `keys.accessToken { }` 创建访问令牌，使用 `keys.idToken(subject) { }` 创建 ID 令牌。两者均接受 `issuer`、`audience`、`expiresAt` 以及自定义的 `claim()` 值。

若要测试 EC 签名，请使用 `OpenIdTestKeys.ec()` 函数代替 `rsa()` 函数。

## 检查生产环境的安全设置 {id="production"}

插件应用了以下默认安全设置：

* 每次登录均启用 PKCE 并使用 `S256`。
* 授权状态存储在 AES-256-GCM 加密的 Cookie 中，有效期为 10 分钟。
* 会话 Cookie 具有 `HttpOnly` 和 `SameSite=Lax` 属性，且在开发模式之外具有 `Secure` 属性。
* 为插件生成的路由启用了 CSRF 保护。
* 对每个 ID 令牌均检查 `nonce` 和 `at_hash`。

部署到生产环境之前，请检查以下设置：

| 设置                             | 默认值                          | 更改原因                                                                                            |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | 每个进程一个新的随机密钥                 | 进行中的登录会在重启时中断，并在多个实例之间失败                                                         |
| `sessions { storage }`         | `SessionStorageMemory()`     | 会话在重启时会丢失，且不会在实例之间共享                                                           |
| `bearer { audience }`          | —                            | 不得包含你的 OAuth `clientId`。请参阅[切勿将客户端 ID 重用为受众](server-oidc-resource-server.md#audience-overlap) |
| `initialDiscoveryAttempts`     | `1`                          | 来自提供者的单次缓慢响应可能会阻止应用程序启动                                                           |
| `jwt { clockSkew }`            | `60.seconds`                 | 如果时钟严格同步，可调低此值                                                                       |
| `discoveryRefreshInterval`     | `15.minutes`                 | 如果提供者频繁轮换密钥，请缩短此间隔                                                               |
| `codeChallengeMethod`          | `S256`                       | 保持 PKCE 处于启用状态                                                                            |
| `sessions { csrfProtection }`  | `originMatchesHost()`        | 保持 CSRF 保护处于启用状态                                                                         |

当使用这些默认值时，插件会在启动时为前三项设置记录警告日志。建议在生产环境中将这些警告视为错误。

## 实现的规范 {id="specs"}

该插件实现了授权码流程及其功能所使用的相关规范：

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — ID 令牌验证，包括
  `nonce`、`azp` 和 `at_hash`
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [发现机制的工作原理](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) —
  [用户退出登录](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 授权码流程
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — Bearer 令牌与 `WWW-Authenticate` 质询
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) —
  [令牌内省](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) —
  [资源指示器](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 授权响应参数
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) —
  [受保护资源元数据](server-oidc-resource-server.md#protected-resource)

## 限制 {id="limitations"}

* 该插件仅适用于 JVM。
* API 处于实验性阶段，可能会发生变更。
* 仅支持授权码流程。不支持隐式流程和混合流程。
* PKCE 固定为 `S256`。自定义质询方法会被拒绝。
* 不支持加密的 (JWE) UserInfo 响应。
* 不支持未返回 ID 令牌的登录回调。针对未实现 OIDC 的提供者进行仅含访问令牌的登录，请使用 [`oauth`](server-oauth.md) 提供者。
* 内省端点不会从发现文档中读取。你必须显式进行配置。