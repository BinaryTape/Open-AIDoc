[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.oidc"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
OpenID Connect 插件允许您利用提供者的发现文档（discovery document），基于颁发者 URL 配置令牌验证和浏览器登录。
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) 是建立在 OAuth 2.0 之上的身份层。
OAuth 2.0 提供了一个委托授权框架，而 OIDC 则通过允许客户端验证最终用户的身份来添加身份验证功能。它在 ID 令牌（ID token）中提供身份信息。

`Oidc` 插件支持以下典型场景：

* **保护 API。** 在允许访问受保护的路由之前，验证由 OpenID Connect 提供者颁发的令牌。有关详细信息，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)。
* **用户登录。** 将用户重定向到 OpenID Connect 提供者进行身份验证，并在登录后处理回调。有关详细信息，请参阅 [OpenID Connect 浏览器登录](server-oidc-browser-login.md)。

这两种场景均始于提供者的颁发者 URL。该插件会读取提供者的发现文档，并解析出端点、签名密钥以及支持的算法。

<note>
    <p>
        OpenID Connect 插件为实验性功能，仅在 JVM 上可用，并且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用
        <Links href="server-typed-auth.md" summary="类型安全身份验证方案 API 将主体类型绑定到路由，因此您无需进行类型转换或 null 检查即可读取非 null 主体。">类型安全身份验证 API</Links>，该 API 需要 Kotlin 上下文形参。
    </p>
</note>

## 添加依赖项 {id="add_dependencies"}

要使用 `Oidc` 插件，请将 `%artifact_name%` 工件添加到构建脚本中：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上面的代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上面的代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 该工件仅适用于 JVM。
> 
{style="note"}

## 注册身份提供者 {id="register"}

安装 `Oidc` 插件并为每个颁发者注册一个身份提供者：

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

`identityProvider()` 函数在返回之前会检索发现文档，因此必须从挂起函数中调用它，例如[挂起应用程序模块](server-modules.md#concurrent-modules)。

提供者名称用于生成的路由路径和身份验证方案名称中。它必须包含小写字母、数字以及由连字符分隔的分段。例如，`google` 和 `my-idp` 是有效名称，而 `Google` 和 `my_idp` 则无效。

每个提供者名称和颁发者必须唯一。多次注册相同的名称或颁发者将抛出 `IllegalArgumentException`。

`identityProvider()` 函数返回一个 `OidcProvider`，可用于保护路由。根据其配置，提供者最多公开三种身份验证方案，供与 `authenticateWith()` 配合使用：

| 配置方式                           | 方案                             | 保护对象                               |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }`                   | `provider.jwtBearer`           | 接收 JWT 访问令牌的 API                |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 接收不透明访问令牌（opaque access token）的 API |
| `oauth { }`                    | `provider.session`             | 位于浏览器登录后的路由                    |

读取尚未配置的方案将抛出 `IllegalStateException`。异常消息会指明启用该方案所需的配置块。

> 欲了解更多详情，请参阅 [OpenID Connect 资源服务器](server-oidc-resource-server.md)和 [OpenID Connect 浏览器登录](server-oidc-browser-login.md)。
> 
{style="tip"}

## 发现机制的工作原理 {id="discovery"}

该插件检索 `<issuer>/.well-known/openid-configuration`，然后从中读取提供者端点和签名密钥。您无需手动配置授权端点、令牌端点或 JWKS URL。

发现文档中的 `issuer` 值必须与您配置的 `issuer` 完全匹配，包括任何尾随斜杠。此项比较是一项安全检查，因此插件不会对任一值进行规范化处理。

在初始请求之后，插件会按照 `discoveryRefreshInterval` 指定的间隔重新读取文档，默认为 15 分钟。这样可以让密钥轮换在无需重启的情况下同步到应用程序：

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

要禁用定期发现刷新，请将 `discoveryRefreshInterval` 设置为 `Duration.ZERO`。

## 处理发现失败 {id="discovery-errors"}

发现失败在[应用程序启动期间](#discovery-errors-startup)和[应用程序运行期间](#discovery-errors-runtime)的处理方式有所不同。

### 启动时 {id="discovery-errors-startup"}

如果初始发现请求失败，`identityProvider()` 会抛出 `OidcDiscoveryException`。异常会脱离模块函数，应用程序将不会启动。

默认情况下，插件会进行一次发现尝试。如果在启动期间提供者可能会暂时不可用，请增加尝试次数：

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

重试适用于网络和 HTTP 错误。它们不适用于配置错误，例如颁发者不匹配或发现文档缺少必需端点。这些错误会立即失败并抛出 `IllegalArgumentException`。

### 运行时 {id="discovery-errors-runtime"}

如果定期刷新失败，插件将继续使用最近检索到的发现文档。它会在 `discoveryRefreshFailureDelay`（默认为 1 分钟）后重试，并持续重试直到成功。

默认情况下不会记录刷新失败日志。要对其进行监控，请订阅 `OidcMetadataRefreshFailed` 事件：

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

如果提前知晓提供者端点，或者需要用于测试的静态配置，请使用 `metadata` 属性：

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

设置 `metadata` 会跳过初始发现请求，并禁用该提供者的定期发现刷新。此时您的应用程序将负责保持元数据最新，包括在密钥轮换之后。

静态文档中的颁发者仍必须与配置的 `issuer` 匹配。JWKS 端点仍会通过 HTTP 进行访问。如需在测试期间避免该请求，请参阅[在没有外部提供者的情况下进行测试](#testing)。

## 令牌类型 {id="tokens"}

每种身份验证[方案](#register)都会生成特定类型的主体，因此路由始终清楚其持有的内容：

| 方案                             | 主体                       | 来源                                    |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session`             | `OidcToken.Id`           | 浏览器登录                               |
| `provider.jwtBearer`           | `OidcToken.Access`       | 本地验证的 JWT 访问令牌                   |
| `provider.introspectionBearer` | `OidcToken.Introspected` | 由提供者检查的访问令牌                     |

`OidcToken.Id` 和 `OidcToken.Access` 公开用于原始 JWT 声明的 `claims`，以及用于规范化用户字段（如 `subject`、`name` 和 `email`）的 `userInfo`。`OidcToken.Introspected` 则公开 `introspection`。

## 将令牌映射到应用程序主体 {id="map-principal"}

路由通常使用特定于应用程序的主体，而不是 OIDC 令牌。使用 `.mapPrincipal()` 函数创建可生成应用程序类型的全新身份验证方案：

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

返回 `null` 会拒绝请求。您可以使用此行为在对应的应用程序帐户不再存在时拒绝有效令牌。

主体映射在方案对路由进行身份验证时运行，而不是在 OAuth 回调期间运行。例如，如果已登录的用户稍后从数据库中被删除，则该用户将在下一次请求时被拒绝，而不会保留有效的应用程序会话。

## 从配置文件进行配置 {id="config-file"}

将客户端密钥存储在配置文件中而不是源代码中。例如，在 <Path>application.yaml</Path> 文件中：

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

> 有关使用配置文件的更多信息，请参阅[在文件中配置](server-configuration-file.topic)。
> 
{style="tip"}

随后您可以将配置读取为 `OidcEnvConfig`：

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

插件不会自动加载此配置。`OidcEnvConfig` 仅为用于读取这些值的便利类型。由应用程序决定这些值的来源以及如何应用它们。

## 配置令牌验证 {id="jwt-config"}

使用 `jwt {}` 块来配置令牌的验证方式。默认值均符合安全规范，因此仅在需要时进行修改：

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
* `allowedAlgorithms` 限制接受的签名算法。未设置此选项时，ID 令牌会回退为使用发现文档所宣告的算法。只能指定 RSA 和 EC 算法。
* `jwkCache` 和 `jwkRateLimit` 控制查询 JWKS 端点的频率。默认情况下启用速率限制，限制为每分钟 10 个请求。如果超过限制，请求将失败并抛出 `OidcSigningKeyUnavailableException`，而不是直接拒绝令牌。配置此限制以适应预期的峰值缓存未命中流量。有关详细信息，请参阅[处理服务器端验证失败](server-oidc-resource-server.md#errors-500)。

无论如何配置，`none` 算法以及所有 HMAC 算法（`HS256`、`HS384`、`HS512`）始终会被拒绝。使用共享机密并不是验证第三方颁发令牌的安全方法。

`jwkProviderFactory` 不能与 `jwkCache` 或 `jwkRateLimit` 组合使用。如果您提供了自定义的 JWK 提供者工厂，您的应用程序将负责处理缓存。

## 在没有外部提供者的情况下进行测试 {id="testing"}

`OpenIdTestKeys` 可生成内存密钥对，并颁发使用该密钥签名的令牌。结合静态元数据，可以在无需进行任何网络调用的情况下获得完整的 OIDC 设置，同时仍然执行真实的颁发者、受众、算法和签名检查：

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

`jwt(keys)` 函数会将验证器配置为使用内存公钥，并限制允许的算法，因此不会发起 JWKS 请求。

使用 `keys.accessToken { }` 创建访问令牌，使用 `keys.idToken(subject) { }` 创建 ID 令牌。两者均接受 `issuer`、`audience`、`expiresAt` 以及自定义 `claim()` 值。

要测试 EC 签名，请使用 `OpenIdTestKeys.ec()` 函数代替 `rsa()` 函数。

## 生产环境安全设置审查 {id="production"}

插件应用了以下默认安全设置：

* 每次登录均启用 PKCE 并使用 `S256`。
* 授权状态存储在 AES-256-GCM 加密的 Cookie 中，生存期为 10 分钟。
* 会话 Cookie 为 `HttpOnly` 且 `SameSite=Lax`，在非开发模式下为 `Secure`。
* 为插件生成的路由启用了 CSRF 保护。
* 对每个 ID 令牌都会检查 `nonce` 和 `at_hash`。

在部署到生产环境之前，请审查以下设置：

| 设置                             | 默认值                       | 为何要更改                                                                                      |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | 每个进程使用新的随机密钥     | 重启会导致进行中的登录中断，并且跨实例登录会失败                                                  |
| `sessions { storage }`         | `SessionStorageMemory()`     | 重启时会丢失会话，且无法在实例之间共享                                                           |
| `bearer { audience }`          | —                            | 不得包含您的 OAuth `clientId`。请参阅[切勿重复使用您的客户端 ID 作为受众](server-oidc-resource-server.md#audience-overlap) |
| `initialDiscoveryAttempts`     | `1`                          | 提供者单次响应缓慢可能会导致您的应用程序无法启动                                                 |
| `jwt { clockSkew }`            | `60.seconds`                 | 如果您的时钟已高度同步，请调小该值                                                               |
| `discoveryRefreshInterval`     | `15.minutes`                 | 如果您的提供者经常轮换密钥，请缩短此间隔                                                         |
| `codeChallengeMethod`          | `S256`                       | 保持 PKCE 启用                                                                                  |
| `sessions { csrfProtection }`  | `originMatchesHost()`        | 保持 CSRF 保护启用                                                                              |

当使用上述默认值时，插件会在启动时针对前三项设置记录警告。在生产环境中，请考虑将这些警告视为错误。

## 已实现的规范 {id="specs"}

该插件实现了授权码流程及其功能所使用的相关规范：

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — ID 令牌验证，包括 `nonce`、`azp` 和 `at_hash`
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [发现机制的工作原理](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) — [用户注销](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 授权码流程
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — Bearer 令牌与 `WWW-Authenticate` 质询
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) — [令牌自省](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) — [资源指示符](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 授权响应参数
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) — [受保护资源元数据](server-oidc-resource-server.md#protected-resource)

## 局限性 {id="limitations"}

* 插件仅适用于 JVM。
* 该 API 为实验性功能，可能会发生变更。
* 仅支持授权码流程。不支持隐式流程（implicit flow）和混合流程（hybrid flow）。
* PKCE 固定为 `S256`。自定义质询方法会被拒绝。
* 不支持加密的 (JWE) UserInfo 响应。
* 不支持未返回 ID 令牌的登录回调。对于针对未实现 OIDC 的提供者仅通过访问令牌进行登录的情况，请使用 [`oauth`](server-oauth.md) 提供者。
* 自省端点不会从发现文档中读取。您必须显式对其进行配置。