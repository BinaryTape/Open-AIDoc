[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.oidc"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，允許你在沒有額外執行階段或虛擬機器的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

<link-summary>
OpenID Connect 外掛程式允許你使用提供者的探索文件 (discovery document)，從簽發者 (issuer) URL 配置權杖驗證與瀏覽器登入。
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) 是建構在 OAuth 2.0 之上的身分層。
雖然 OAuth 2.0 提供了委派授權的架構，但 OIDC 透過允許用戶端驗證終端使用者的身分增加了驗證功能。它在 ID 權杖 (ID token) 中提供身分資訊。

`Oidc` 外掛程式支援以下典型情境：

* **保護 API。** 在允許存取受保護路由之前，先驗證由 OpenID Connect 提供者簽發的權杖。如需詳細資訊，請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md)。
* **讓使用者登入。** 將使用者重新導向至 OpenID Connect 提供者進行驗證，並在登入後處理回呼 (callback)。如需詳細資訊，請參閱 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。

這兩種情境皆從提供者的簽發者 URL 開始。外掛程式會讀取提供者的探索文件，並推算出端點、簽署金鑰以及支援的演算法。

<note>
    <p>
        OpenID Connect 外掛程式為實驗功能，僅適用於 JVM，且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用
        <Links href="server-typed-auth.md" summary="型別安全驗證配置 API 將主體型別繫結至路由，因此你可以在沒有轉換或 null 檢查的情況下讀取非 null 主體。">型別安全驗證 API</Links>，該 API 需要 Kotlin 上下文參數 (context parameters)。
    </p>
</note>

## 新增相依性 {id="add_dependencies"}

若要使用 `Oidc` 外掛程式，請將 `%artifact_name%` 構件新增至你的建置指令碼中：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 此構件僅適用於 JVM。
> 
{style="note"}

## 註冊身分提供者 {id="register"}

安裝 `Oidc` 外掛程式並為每個簽發者註冊身分提供者：

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

`identityProvider()` 函式在回傳前會先擷取探索文件，因此必須從掛起函式中呼叫，例如[掛起應用程式模組](server-modules.md#concurrent-modules)。

提供者名稱會用於產生的路由路徑以及驗證配置 (scheme) 名稱中。它必須包含小寫字母、數字以及由連字號分隔的區段。例如，`google` 與 `my-idp` 是有效名稱，而 `Google` 與 `my_idp` 則不是。

每個提供者名稱與簽發者必須是唯一的。多次註冊相同的名稱或簽發者將拋出 `IllegalArgumentException`。

`identityProvider()` 函式會回傳一個 `OidcProvider`，供你用來保護路由。根據其配置，該提供者最多可公開三種驗證配置以供搭配 `authenticateWith()` 使用：

| 配置方式                           | 配置 (Scheme)                  | 保護對象                              |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }`                   | `provider.jwtBearer`           | 接收 JWT 存取權杖的 API               |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 接收不透明 (opaque) 存取權杖的 API    |
| `oauth { }`                    | `provider.session`             | 位於瀏覽器登入背後的路由              |

讀取尚未配置的配置會拋出 `IllegalStateException`。該例外訊息會指出啟用該配置所需的配置區塊。

> 如需更多詳細資訊，請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md) 與 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。
> 
{style="tip"}

## 探索機制如何運作 {id="discovery"}

外掛程式會擷取 `<issuer>/.well-known/openid-configuration`，然後從中讀取提供者端點與簽署金鑰。你不需要手動配置授權端點、權杖端點或 JWKS URL。

探索文件中的 `issuer` 值必須與你配置的 `issuer` 完全相符，包含任何結尾斜線。此項比較屬於安全性檢查，因此外掛程式不會對任一數值進行正規化處理。

在完成初始請求後，外掛程式會依照 `discoveryRefreshInterval` 指定的間隔重新讀取文件，預設值為 15 分鐘。這使得金鑰輪替能夠在無須重新啟動應用程式的情況下生效：

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

若要停用定期探索重新整理，請將 `discoveryRefreshInterval` 設為 `Duration.ZERO`。

## 處理探索失敗 {id="discovery-errors"}

探索失敗在[應用程式啟動期間](#discovery-errors-startup)與[應用程式執行期間](#discovery-errors-runtime)有不同的處理方式。

### 啟動時 {id="discovery-errors-startup"}

如果初始探索請求失敗，`identityProvider()` 會拋出 `OidcDiscoveryException`。該例外會脫離你的模組函式，且應用程式將無法啟動。

預設情況下，外掛程式只會進行一次探索嘗試。如果你的提供者在啟動期間可能暫時無法連線，可以增加嘗試次數：

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

重試機制適用於網路與 HTTP 錯誤。但不適用於配置錯誤，例如簽發者不符，或是探索文件中缺少必要的端點。這類錯誤會立即失敗並拋出 `IllegalArgumentException`。

### 執行時 {id="discovery-errors-runtime"}

如果定期重新整理失敗，外掛程式會繼續使用最近擷取的探索文件。它會在 `discoveryRefreshFailureDelay`（預設為 1 分鐘）之後重試，並持續重試直到成功為止。

重新整理失敗預設不會被記錄在日誌中。若要監控它們，請訂閱 `OidcMetadataRefreshFailed` 事件：

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

## 配置靜態元資料 {id="static-metadata"}

如果事先已知提供者端點，或是你需要靜態配置進行測試，請使用 `metadata` 屬性：

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

設定 `metadata` 會略過初始探索請求，並停用該提供者的定期探索重新整理。屆時你的應用程式必須負責維持元資料的最新狀態（包含金鑰輪替之後）。

靜態文件中的簽發者仍必須與配置的 `issuer` 相符。JWKS 端點仍會透過 HTTP 進行存取。若要在測試期間避免該請求，請參閱[在沒有外部提供者的情況下進行測試](#testing)。

## 權杖型別 {id="tokens"}

每種驗證[配置](#register)都會產生特定的主體 (principal) 型別，讓路由始終清楚掌握其所持有的內容：

| 配置 (Scheme)                  | 主體 (Principal)         | 來源                                    |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session`             | `OidcToken.Id`           | 瀏覽器登入                              |
| `provider.jwtBearer`           | `OidcToken.Access`       | 本機驗證的 JWT 存取權杖                 |
| `provider.introspectionBearer` | `OidcToken.Introspected` | 由提供者檢查的存取權杖                  |

`OidcToken.Id` 與 `OidcToken.Access` 公開了原始 JWT 宣告的 `claims`，以及正規化使用者欄位（例如 `subject`、`name` 與 `email`）的 `userInfo`。`OidcToken.Introspected` 則公開 `introspection`。

## 將權杖對應至應用程式主體 {id="map-principal"}

路由通常會使用應用程式特定的主體，而非 OIDC 權杖。使用 `.mapPrincipal()` 函式可以建立產生你應用程式型別的新驗證配置：

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

回傳 `null` 會拒絕該請求。你可以利用此行為，在對應的應用程式帳號已不存在時拒絕有效的權杖。

主體對應是在配置驗證路由時執行，而非在 OAuth 回呼期間執行。例如，如果已登入的使用者隨後從你的資料庫中被刪除，該使用者會在下一次請求時被拒絕，而不會保留有效的應用程式工作階段。

## 從設定檔進行配置 {id="config-file"}

請將用戶端密鑰存放在設定檔中，而非原始碼中。例如，在你的 <Path>application.yaml</Path> 檔案中：

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

> 如需更多關於使用設定檔的資訊，請參閱[在檔案中進行配置](server-configuration-file.topic)。
> 
{style="tip"}

接著你可以將該配置讀取為 `OidcEnvConfig`：

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

外掛程式不會自動載入此配置。`OidcEnvConfig` 僅是用於讀取數值的便利型別。你的應用程式決定數值從何處而來以及如何套用。

## 配置權杖驗證 {id="jwt-config"}

使用 `jwt {}` 區塊來配置權杖的驗證方式。預設值已具備安全性，因此僅在必要時進行變更：

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

* `clockSkew` 指定套用於 `exp` 與 `nbf` 的寬限時間。預設為 60 秒。
* `allowedAlgorithms` 限制接受的簽署演算法。未設定此選項時，ID 權杖會回退使用探索文件所宣告的演算法。僅能指定 RSA 與 EC 演算法。
* `jwkCache` 與 `jwkRateLimit` 控制查詢 JWKS 端點的頻率。速率限制預設為每分鐘 10 次請求。若超過限制，請求將失敗並拋出 `OidcSigningKeyUnavailableException`，而非拒絕權杖。請配置此限制以容納預期的快取未命中流量高峰。如需更多資訊，請參閱[處理伺服器端驗證失敗](server-oidc-resource-server.md#errors-500)。

無論配置如何，`none` 演算法與所有 HMAC 演算法（`HS256`、`HS384`、`HS512`）一律會被拒絕。共用密鑰並非驗證第三方簽發權杖的安全方式。

`jwkProviderFactory` 不能與 `jwkCache` 或 `jwkRateLimit` 同時使用。如果你提供自訂的 JWK 提供者處理處理站 (JWK provider factory)，你的應用程式將負責處理快取。

## 在沒有外部提供者的情況下進行測試 {id="testing"}

`OpenIdTestKeys` 會產生記憶體內的金鑰組，並簽發以該金鑰簽署的權杖。結合靜態元資料，這能為你提供無須任何網路呼叫的完整 OIDC 設定，同時仍可執行真實的簽發者、受眾 (audience)、演算法與簽章檢查：

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

`jwt(keys)` 函式會將驗證器配置為使用記憶體內的公開金鑰，並限制允許的演算法，因此不會發出 JWKS 請求。

使用 `keys.accessToken { }` 可建立存取權杖，而 `keys.idToken(subject) { }` 則用於 ID 權杖。兩者皆接受 `issuer`、`audience`、`expiresAt` 與自訂的 `claim()` 數值。

若要測試 EC 簽章，請使用 `OpenIdTestKeys.ec()` 函式取代 `rsa()` 函式。

## 檢查正式環境的安全性設定 {id="production"}

外掛程式套用了以下安全性預設設定：

* 每次登入皆啟用 PKCE，並使用 `S256`。
* 授權狀態存放在以 AES-256-GCM 加密的 Cookie 中，具備 10 分鐘有效期限。
* Session Cookie 具備 `HttpOnly` 與 `SameSite=Lax`，且在開發模式之外具備 `Secure`。
* 為外掛程式產生的路由啟用了 CSRF 防護。
* 針對每個 ID 權杖檢查 `nonce` 與 `at_hash`。

在部署到正式環境之前，請檢查以下設定：

| 設定                           | 預設值                       | 為何需要變更                                                                                    |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | 每個程序產生一個新的隨現金鑰 | 進行中的登入會在重新啟動時中斷，且無法跨執行個體運作                                            |
| `sessions { storage }`         | `SessionStorageMemory()`     | 工作階段會在重新啟動時遺失，且無法在執行個體之間共用                                             |
| `bearer { audience }`          | —                            | 不得包含你的 OAuth `clientId`。請參閱[請勿將用戶端 ID 重複用作受眾 (audience)](server-oidc-resource-server.md#audience-overlap) |
| `initialDiscoveryAttempts`     | `1`                          | 提供者單次緩慢的回應就可能導致你的應用程式無法啟動                                               |
| `jwt { clockSkew }`            | `60.seconds`                 | 如果你的時鐘高度同步，可調低此數值                                                               |
| `discoveryRefreshInterval`     | `15.minutes`                 | 如果你的提供者經常輪替金鑰，請縮短此間隔                                                         |
| `codeChallengeMethod`          | `S256`                       | 保持 PKCE 啟用                                                                                  |
| `sessions { csrfProtection }`  | `originMatchesHost()`        | 保持 CSRF 防護啟用                                                                               |

當前三項設定使用這些預設值時，外掛程式會在啟動時於日誌中輸出警告。請考慮在正式環境中將這些警告視為錯誤。

## 已實作的規格 {id="specs"}

此外掛程式實作了授權碼流程 (authorization code flow) 及其各項功能所使用的相關規格：

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — ID 權杖驗證，包含 `nonce`、`azp` 與 `at_hash`
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [探索機制如何運作](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) — [讓使用者登出](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 授權碼流程
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — Bearer 權杖與 `WWW-Authenticate` 質問 (challenges)
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) — [權杖自我檢查 (token introspection)](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) — [資源指示器 (resource indicators)](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 授權回應參數
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) — [受保護資源元資料](server-oidc-resource-server.md#protected-resource)

## 限制 {id="limitations"}

* 外掛程式僅適用於 JVM。
* 此 API 為實驗性，未來可能會變更。
* 僅支援授權碼流程 (authorization code flow)。不支援隱含流程 (implicit flow) 與混合流程 (hybrid flow)。
* PKCE 固定為 `S256`。自訂質問方法將被拒絕。
* 不支援加密 (JWE) 的 UserInfo 回應。
* 不支援未回傳 ID 權杖的登入回呼。若要針對未實作 OIDC 的提供者進行僅有存取權杖的登入，請使用 [`oauth`](server-oauth.md) 提供者。
* 自我檢查端點 (introspection endpoint) 不會從探索機制中讀取，你必須明確進行配置。