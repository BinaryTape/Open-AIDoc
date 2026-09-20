[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行時期或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

<link-summary>
OpenID Connect 外掛程式允許你使用提供者的探索文件 (discovery document)，從發行者 URL 配置權杖驗證與瀏覽器登入。
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) 是建構在 OAuth 2.0 之上的身分識別層。
OAuth 2.0 提供了委派授權的架構，而 OIDC 則透過允許用戶端驗證終端使用者的身分來增加身分驗證功能。它會在 ID 權杖中提供身分資訊。

`Oidc` 外掛程式支援以下典型情境：

* **保護 API。** 在允許存取受保護的路由之前，驗證 OpenID Connect 提供者發行的權杖。如需詳細資訊，請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md)。
* **登入使用者。** 將使用者重新導向至 OpenID Connect 提供者進行身分驗證，並在登入後處理回呼 (callback)。如需詳細資訊，請參閱 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。

這兩種情境皆從提供者的發行者 URL 開始。外掛程式會讀取提供者的探索文件，並分析出端點、簽章金鑰以及支援的演算法。

<note>
    <p>
        OpenID Connect 外掛程式為實驗功能，僅適用於 JVM，且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用了
        <Links href="/ktor/server-typed-auth" summary="型別安全的身分驗證配置 API 將主體型別繫結到路由，因此你可以讀取非 null 的主體而無需進行轉型或 null 檢查。">型別安全驗證 API</Links>，該 API 需要 Kotlin context parameters。
    </p>
</note>

## 新增相依性 {id="add_dependencies"}

若要使用 `Oidc` 外掛程式，請將 `%artifact_name%` 構件新增至你的組建指令碼中：

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

> 此構件僅適用於 JVM。
> 
{style="note"}

## 註冊身分提供者 {id="register"}

安裝 `Oidc` 外掛程式並為每個發行者註冊身分提供者：

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

`identityProvider()` 函式在回傳前會擷取探索文件，因此必須從掛起函式中呼叫，例如 [掛起應用程式模組](server-modules.md#concurrent-modules)。

提供者名稱會用於產生的路由路徑與身分驗證配置 (scheme) 名稱中。它必須包含小寫字母、數字和連字號分隔的區段。例如，`google` 和 `my-idp` 是有效的名稱，而 `Google` 和 `my_idp` 則無效。

每個提供者名稱和發行者都必須是唯一的。重複註冊相同的名稱或發行者會擲出 `IllegalArgumentException`。

`identityProvider()` 函式會回傳一個 `OidcProvider`，供你用來保護路由。根據其配置，該提供者最多公開三種身分驗證配置以供搭配 `authenticateWith()` 使用：

| 配置方式 | Scheme | 保護目標 |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }` | `provider.jwtBearer` | 接收 JWT 存取權杖的 API |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 接收不透明 (opaque) 存取權杖的 API |
| `oauth { }` | `provider.session` | 位於瀏覽器登入之後的路由 |

讀取尚未配置的 scheme 會擲出 `IllegalStateException`。該例外訊息會指出啟用該 scheme 所需的配置區塊。

> 如需更多詳細資訊，請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md) 與 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。
> 
{style="tip"}

## 探索機制的運作方式 {id="discovery"}

外掛程式會擷取 `<issuer>/.well-known/openid-configuration`，然後從中讀取提供者端點和簽章金鑰。你不需要手動配置授權端點、權杖端點或 JWKS URL。

探索文件中的 `issuer` 值必須與你配置的 `issuer` 完全相符，包含任何結尾斜線。這項比較是一項安全性檢查，因此外掛程式不會對任一數值進行正規化。

在初始請求之後，外掛程式會按照 `discoveryRefreshInterval`（預設為 15 分鐘）指定的間隔重新讀取該文件。這使得金鑰輪替能套用到你的應用程式而無需重新啟動：

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

若要停用定期探索重新整理，請將 `discoveryRefreshInterval` 設定為 `Duration.ZERO`。

## 處理探索失敗 {id="discovery-errors"}

探索失敗在 [應用程式啟動期間](#discovery-errors-startup) 與 [應用程式執行期間](#discovery-errors-runtime) 的處理方式不同。

### 啟動時 {id="discovery-errors-startup"}

如果初始探索請求失敗，`identityProvider()` 會擲出 `OidcDiscoveryException`。該例外會脫離你的模組函式，且應用程式將不會啟動。

預設情況下，外掛程式會進行一次探索嘗試。如果你的提供者在啟動期間可能暫時無法使用，請增加嘗試次數：

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

重試適用於網路與 HTTP 錯誤。重試不適用於配置錯誤，例如發行者不符或探索文件缺少必要的端點。這些錯誤會立即失敗並擲出 `IllegalArgumentException`。

### 執行時 {id="discovery-errors-runtime"}

如果定期重新整理失敗，外掛程式會繼續使用最近擷取的探索文件。它會在 `discoveryRefreshFailureDelay`（預設為一分鐘）之後重試，並持續重試直到成功為止。

重新整理失敗預設不會記錄。若要監控它們，請訂閱 `OidcMetadataRefreshFailed` 事件：

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

## 設定靜態中繼資料 {id="static-metadata"}

如果提供者端點已知，或者在測試時需要靜態配置，請使用 `metadata` 屬性：

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

設定 `metadata` 會略過初始探索請求，並停用該提供者的定期探索重新整理。隨後你的應用程式需負責保持中繼資料為最新狀態，包括在金鑰輪替之後。

靜態文件中的發行者仍必須與配置的 `issuer` 相符。JWKS 端點仍會透過 HTTP 存取。若要在測試期間避免該請求，請參閱 [無外部提供者的測試](#testing)。

## 權杖型別 {id="tokens"}

每種身分驗證 [scheme](#register) 都會產生特定的主體型別 (principal type)，因此路由一律清楚其持有的內容：

| Scheme | 主體 (Principal) | 來源 |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session` | `OidcToken.Id` | 瀏覽器登入 |
| `provider.jwtBearer` | `OidcToken.Access` | 在本機驗證的 JWT 存取權杖 |
| `provider.introspectionBearer` | `OidcToken.Introspected` | 由提供者檢查的存取權杖 |

`OidcToken.Id` 與 `OidcToken.Access` 公開 `claims` 用於原始 JWT 宣告，以及 `userInfo` 用於正規化的使用者欄位，例如 `subject`、`name` 與 `email`。`OidcToken.Introspected` 則公開 `introspection`。

## 將權杖對應至應用程式主體 {id="map-principal"}

路由通常會處理特定於應用程式的主體，而非直接處理 OIDC 權杖。使用 `.mapPrincipal()` 函式可建立一個能產生你的應用程式型別的新身分驗證配置：

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

回傳 `null` 會拒絕該請求。你可以利用此行為，在對應的應用程式帳戶已不存在時拒絕有效的權杖。

主體對應是在 scheme 為路由進行身分驗證時執行，而非在 OAuth 回呼期間執行。例如，如果已登入的使用者隨後從資料庫中移除，該使用者將在下一次請求時被拒絕，而不是繼續保留有效的應用程式工作階段。

## 從設定檔進行設定 {id="config-file"}

請將用戶端密鑰 (client secret) 儲存在設定檔中，而非原始碼中。例如在你的 <Path>application.yaml</Path> 檔案中：

```yaml
ktor:
  oidc:
    google:
      issuer: "https://accounts.google.com"
      clientId: "$GOOGLE_CLIENT_ID"
      clientSecret: "$GOOGLE_CLIENT_SECRET"
      scopes: ["openid", "profile", "email"]
```

`$GOOGLE_CLIENT_ID` 與 `$GOOGLE_CLIENT_SECRET` 參照環境變數。

> 如需使用設定檔的詳細資訊，請參閱 [檔案中的設定](server-configuration-file.topic)。
> 
{style="tip"}

接著你可以將該設定讀取為 `OidcEnvConfig`：

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

外掛程式不會自動載入此設定。`OidcEnvConfig` 是一個用於讀取數值的便利型別。你的應用程式決定這些值的來源以及如何套用它們。

## 設定權杖驗證 {id="jwt-config"}

使用 `jwt {}` 區塊來設定權杖的驗證方式。預設值已具備安全性，因此僅在必要時進行變更：

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

* `clockSkew` 指定套用於 `exp` 和 `nbf` 的寬限時間。預設為 60 秒。
* `allowedAlgorithms` 限制接受的簽章演算法。若未設定此選項，ID 權杖將遞補使用探索文件所宣告的演算法。僅能指定 RSA 和 EC 演算法。
* `jwkCache` 與 `jwkRateLimit` 控制查詢 JWKS 端點的頻率。速率限制預設啟用為每分鐘 10 個請求。如果超出限制，請求將失敗並出現 `OidcSigningKeyUnavailableException`，而非直接拒絕權杖。請配置此限制以因應預期的快取未命中流量高峰。如需詳細資訊，請參閱 [處理伺服器端驗證失敗](server-oidc-resource-server.md#errors-500)。

無論配置如何，`none` 演算法和所有 HMAC 演算法（`HS256`、`HS384`、`HS512`）一律會被拒絕。共享密鑰並不是驗證第三方發行之權杖的安全方式。

`jwkProviderFactory` 無法與 `jwkCache` 或 `jwkRateLimit` 同時使用。如果你提供自訂的 JWK 提供者工廠，你的應用程式需負責處理快取。

## 無外部提供者的測試 {id="testing"}

`OpenIdTestKeys` 會在記憶體中產生金鑰組，並發行以該金鑰簽署的權杖。結合靜態中繼資料，這能為你提供完整的 OIDC 設定且無須發出網路呼叫，同時仍會執行真正的發行者、受眾、演算法和簽章檢查：

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

`jwt(keys)` 函式會將驗證器設定為使用記憶體內的公開金鑰，並限制允許的演算法，因此不會發出 JWKS 請求。

使用 `keys.accessToken { }` 建立存取權杖，並使用 `keys.idToken(subject) { }` 建立 ID 權杖。兩者皆接受 `issuer`、`audience`、`expiresAt` 和自訂的 `claim()` 值。

若要測試 EC 簽章，請使用 `OpenIdTestKeys.ec()` 函式而非 `rsa()` 函式。

## 檢閱正式環境的安全性設定 {id="production"}

外掛程式會套用以下安全性預設值：

* 每次登入皆啟用 PKCE，並使用 `S256`。
* 授權狀態儲存在具備 10 分鐘有效期的 AES-256-GCM 加密 Cookie 中。
* Session Cookie 設為 `HttpOnly` 和 `SameSite=Lax`，且在開發模式之外設為 `Secure`。
* 外掛程式產生的路由皆已啟用 CSRF 保護。
* 每個 ID 權杖都會檢查 `nonce` 和 `at_hash`。

在部署至生產環境之前，請檢閱下列設定：

| 設定 | 預設值 | 變更原因 |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | 每個程序一個新的隨基金鑰 | 處理中的登入會在重新啟動時中斷，且無法跨執行個體運作 |
| `sessions { storage }` | `SessionStorageMemory()` | 工作階段會在重新啟動時遺失，且不會在執行個體之間共享 |
| `bearer { audience }` | — | 不得包含你的 OAuth `clientId`。請參閱 [請勿將你的用戶端 ID 重複用作受眾](server-oidc-resource-server.md#audience-overlap) |
| `initialDiscoveryAttempts` | `1` | 提供者的單次緩慢回應可能會阻止你的應用程式啟動 |
| `jwt { clockSkew }` | `60.seconds` | 如果你的時鐘已高度同步，請調低該值 |
| `discoveryRefreshInterval` | `15.minutes` | 如果你的提供者經常輪替金鑰，請縮短間隔 |
| `codeChallengeMethod` | `S256` | 保持 PKCE 啟用 |
| `sessions { csrfProtection }` | `originMatchesHost()` | 保持 CSRF 保護啟用 |

當前三個設定使用上述預設值時，外掛程式會在啟動時記錄警告。請考慮在生產環境中將這些警告視為錯誤。

## 已實作的規範 {id="specs"}

外掛程式實作了授權碼流程及其功能所使用的相關規範：

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — ID 權杖驗證，包含 `nonce`、`azp` 和 `at_hash`
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [探索機制的運作方式](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) — [登出使用者](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 授權碼流程
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — Bearer 權杖與 `WWW-Authenticate` 質詢
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) — [權杖內部檢查 (token introspection)](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) — [資源指示項 (resource indicators)](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 授權回應參數
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) — [受保護資源中繼資料](server-oidc-resource-server.md#protected-resource)

## 限制 {id="limitations"}

* 外掛程式僅適用於 JVM。
* API 仍為實驗功能，未來可能會有所變動。
* 僅支援授權碼流程。不支援隱含 (implicit) 流程與混合 (hybrid) 流程。
* PKCE 固定為 `S256`。自訂 challenge 方法會被拒絕。
* 不支援加密的 (JWE) UserInfo 回應。
* 不支援未回傳 ID 權杖的登入回呼。若要針對未實作 OIDC 的提供者進行僅使用存取權杖的登入，請使用 [`oauth`](server-oauth.md) 提供者。
* 不會從探索機制讀取內部檢查端點。你必須明確進行配置。