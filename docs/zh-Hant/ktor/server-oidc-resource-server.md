[//]: # (title: OpenID Connect 資源伺服器)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links>支援</b>：✖️
</p>
</tldr>

<link-summary>
驗證由 OpenID Connect 提供者簽發的存取權杖，無論是在本機作為 JWT 驗證，還是透過權杖反省 (token introspection) 進行驗證。
</link-summary>

資源伺服器是一種接受由其他人簽發之權杖的 API。它不提供登入頁面，也不使用瀏覽器工作階段。用戶端發送存取權杖，伺服器在允許存取受保護資源之前會先驗證該權杖。

> 若需瀏覽器登入相關資訊，請參閱 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。
> 
> 若需探索 (discovery)、權杖型別以及外掛程式設定相關資訊，請參閱 [OpenID Connect](server-oidc.md)。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 外掛程式為實驗功能，僅適用於 JVM，且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用了
        <Links href="server-typed-auth.md" summary="型別安全的身分驗證配置 API 將 principal 型別繫結到路由，因此你無需型別轉換或 null 檢查即可讀取非 null 的 principal。">型別安全的身分驗證 API</Links>，該 API 需要 Kotlin 上下文參數。
    </p>
</note>

## 驗證 JWT 存取權杖 {id="jwt-bearer"}

許多提供者會將存取權杖簽發為已簽署的 JSON Web Token (JWT)。請配置你的 API 所預期的 audience（受眾），接著使用 `provider.jwtBearer` 保護路由：

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

`audience` 屬性為必填項且不可為空。它在提供者端標識你的 API，並且通常與 OAuth 用戶端 ID 不同。

該外掛程式會從 `Authorization: Bearer` 標頭讀取權杖，從提供者的 JWKS 端點檢索簽名金鑰，並檢查簽章、簽發者 (issuer)、audience 以及到期時間。

## 驗證不透明權杖 {id="introspection"}

並非所有提供者都會簽發 JWT。不透明 (opaque) 權杖是一個沒有可讀內容的隨機字串，因此你的伺服器無法在本機驗證它。這是一種經過權衡的刻意設計：不透明權杖即使被攔截也不會洩漏任何內容，而且由於每次使用時都會向提供者查詢，因此它可以被撤銷並立即失效。相對地，JWT 在過期之前一直有效。

若要驗證不透明權杖，伺服器會使用 [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) 所定義的權杖反省 (token introspection)。你的伺服器會將權杖傳送到反省端點，對自身進行身分驗證，並接收指出該權杖是否處於作用中 (active) 的回應以及任何相關的元資料，例如主體 (subject)、作用域 (scope)、用戶端和到期時間。

新增 `introspection { }` 區塊並使用 `provider.introspectionBearer`：

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

反省端點不屬於 OpenID Connect 探索文件的一部分，因此請根據提供者的文件明確進行配置。在上面的範例中，簽發者 URL 儲存在區域變數中，因為外層的 `issuer` 屬性在 `introspection { }` 區塊中無法存取。

`clientId` 與 `clientSecret` 屬性是用來向提供者標識你的 API，而非使用者。反省是一種特權操作，因此大多數提供者都需要一個被允許執行該操作的獨立用戶端。

預設情況下，該外掛程式使用 HTTP Basic 身分驗證。若要改為在表單主體中發送認證憑據，請設定 `authMethod = ClientAuthenticationMethod.ClientSecretPost`。

只有當回應包含 `active: true`、其受眾與你配置的 `audience` 有交集，且傳回的任何 `iss`、`exp` 和 `nbf` 值均有效時，權杖才會被接受。

反省需要針對每次身分驗證嘗試發出網路請求，並且取決於提供者的可用性。如果你的提供者有簽發 JWT，請優先選擇 [JWT 驗證](#jwt-bearer)；而在提供者未簽發 JWT，或者即時撤銷的重要性高於延遲時，才使用反省。

## 從其他位置讀取權杖 {id="token-extractor"}

預設情況下，該外掛程式會從 `Authorization` 標頭讀取權杖。若要從其他位置讀取，請配置自訂擷取器：

```kotlin
bearer {
    audience = setOf("https://api.example.com")
    tokenExtractor = { call.request.cookies["access_token"] }
}
```

當沒有可用的權杖時傳回 `null`。該請求隨後將因未通過身分驗證而失敗。

## 發佈受保護資源元資料 {id="protected-resource"}

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) 允許用戶端探索你的 API 信任哪些授權伺服器，而不需要事先預先配置。這對於機器對機器 (machine-to-machine) 用戶端和 MCP 伺服器非常有用。

安裝外掛程式時配置受保護資源元資料：

```kotlin
val oidc = install(Oidc) {
    protectedResource("https://api.example.com") {
        resourceName = "Orders API"
    }
}
```

這會在 `/.well-known/oauth-protected-resource` 提供文件。該外掛程式會從已註冊的提供者推導出以下值：

* `authorizationServers` — 每個具有 `bearer { }` 區塊之提供者的簽發者。
* `scopesSupported` — 這些提供者所請求的作用域。
* `bearerMethodsSupported` — `header`，當提供者讀取標準授權標頭時。

明確設定上述任何屬性可覆寫推導出的值。

配置受保護資源也會改變質詢 (challenge)。被拒絕的請求不會傳回一般的 `WWW-Authenticate: Bearer` 標頭，而是包含指向元資料文件的指標：

```http
WWW-Authenticate: Bearer resource_metadata="https://api.example.com/.well-known/oauth-protected-resource"
```

## 處理身分驗證錯誤 {id="errors"}

### 身分驗證錯誤回應 {id="errors-response"}

被拒絕的權杖會產生帶有 `WWW-Authenticate: Bearer` 標頭的 `401 Unauthorized`。

該質詢不包含 `error`、`error_description` 和 `realm` 參數。因此，用戶端無法區分是缺少權杖還是權杖過期，亦無法區分是無效簽章還是錯誤的受眾。有關診斷被拒絕權杖的詳細資訊，請參閱[找出權杖被拒絕的原因](#errors-logging)。

以下情況會產生 `401 Unauthorized`：

| 原因                                               | 附註                                               |
|----------------------------------------------------|----------------------------------------------------|
| 沒有權杖，或格式錯誤的 `Authorization` 標頭          |                                                    |
| 無效簽章                                           |                                                    |
| 錯誤的簽發者或錯誤的 audience                      |                                                    |
| 過期的權杖                                         | 超過 `clockSkew` 寬限時間後                        |
| `none`、`HS256`、`HS384` 或 `HS512` 演算法         | 一律拒絕                                           |
| 不在 `allowedAlgorithms` 內的演算法                |                                                    |
| 未知的 `kid`                                       | 該金鑰不存在於已擷取的 JWKS 文件中                 |
| 反省傳回 `active: false`                           |                                                    |
| 反省傳回錯誤或過期的 audience                      |                                                    |

未知的 `kid` 表示權杖參照的金鑰不存在於擷取的 JWKS 文件中，因此會導致 `401 Unauthorized`。

### 處理伺服器端驗證失敗 {id="errors-500"}

某些失敗會導致外掛程式無法完成權杖驗證，但並非代表權杖本身無效。這些失敗會導致 `500 Internal Server Error`：

| 失敗                                                                       | 例外                                                           |
|----------------------------------------------------------------------------|----------------------------------------------------------------|
| JWKS 端點無法連線                                                          | `OidcSigningKeyUnavailableException`                           |
| 無法剖析 JWKS 文件                                                         | `OidcSigningKeyUnavailableException`                           |
| JWKS 請求速率限制耗盡                                                      | `OidcSigningKeyUnavailableException`                           |
| 反省端點無法連線或回應非 2xx 狀態                                          | `ResponseException`、`IOException` 或反序列化錯誤               |
| `fetchUserInfo` 請求在傳輸層失敗                                           | 同上                                                           |
| 工作階段權杖重新整理在傳輸層失敗                                           | 同上。請參閱[處理登入錯誤](server-oidc-browser-login.md#errors) |

因此，身分提供者的服務中斷可能會導致通過身分驗證的請求以 `500 Internal Server Error` 失敗。

JWK 請求速率限制預設處於啟用狀態，也可能導致簽名金鑰查詢失敗。金鑰查詢限制為每分鐘 10 次請求，且對快取中不存在之 kid 的查詢會計入該限制。若突然湧入由先前未見過的金鑰所簽署的權杖（例如在金鑰輪替期間），可能會耗盡該限制。

若要提高限制，請配置 `jwkRateLimit`：

```kotlin
jwt { 
    jwkRateLimit(bucketSize = 60)
}
```

若要傳回更合適的回應，請安裝 [`StatusPages`](server-status-pages.md) 外掛程式：

```kotlin
install(StatusPages) {
    exception<OidcSigningKeyUnavailableException> { call, cause ->
        val log = call.application.log
        log.error("Signing key unavailable", cause)
        call.respond(HttpStatusCode.ServiceUnavailable)
    }
}
```

`503 Service Unavailable` 表示在身分提供者復原後，該請求可能會成功。

僅有簽名金鑰失敗具有專用的例外型別，而且它是唯一值得像這樣進行全域攔截的例外。其餘失敗則會呈現為 `ResponseException` 或 `IOException`，這些也同樣會用於其他 [HTTP 用戶端](client-create-and-configure.md)操作。請避免在全域處理這些例外型別，因為這可能導致無關的失敗被回報為提供者服務中斷。請在可能產生這些例外的操作附近處理它們，或是允許它們產生 `500 Internal Server Error`。

### 找出權杖被拒絕的原因 {id="errors-logging"}

權杖被拒絕的詳細資訊會在 `TRACE` 層級進行記錄。若要啟用它們，請為外掛程式套件配置記錄功能。使用 Logback 時，請將以下內容新增至通常位於 <Path>src/main/resources/logback.xml</Path> 的 <Path>logback.xml</Path>：

```xml
<configuration>
    <logger name="io.ktor.server.auth.oidc" level="TRACE"/>
</configuration>
```

每個提供者都會在 `io.ktor.server.auth.oidc.OidcProvider[<name>]` 下記錄，因此你可以針對單一提供者提高層級，而不會受到其餘提供者的雜訊干擾。

記錄訊息會標明未通過的驗證檢查，例如：
`JWT algorithm HS256 is not accepted` 或 `JWT kid abc123 does not match any JWK`。

### 自訂 401 回應 {id="errors-custom"}

`bearer {}` 配置不提供身分驗證失敗處理常式。若要自訂回應，請在受保護的路由上設定 `onUnauthorized` 處理常式：

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

路由層級的處理常式會完全取代內建的回應，包含 `WWW-Authenticate` 標頭。如果你配置了[受保護資源元資料](#protected-resource)，`resource_metadata` 參數也會被移除。如果用戶端依賴它，請明確新增該標頭。

對於接受多種身分驗證配置的路由，請使用 `authenticateWithAnyOf(..., onUnauthorized = ...)`。

### 請勿將用戶端 ID 重複用作 audience {id="audience-overlap"}

如果 `bearer { audience }` 包含來自 `oauth { }` 區塊的 `clientId`，則為登入所簽發的 ID 權杖可能會被當作 API 的存取權杖通過驗證，除非提供者以 `token_use` 或 `typ` 宣告標記它。並非所有提供者都會這樣做。

請為你的 API 指派其專屬的資源識別碼：

```kotlin
oidc.identityProvider("auth0") {
    issuer = "https://my-tenant.auth0.com"
    bearer {
        // 資源識別碼，而非登入用戶端 ID
        audience = setOf("https://api.example.com")
    }
    oauth {
        clientId = "web-client"
        clientSecret = System.getenv("WEB_CLIENT_SECRET")
    }
}
```

當外掛程式在啟動時偵測到 API audience 與 OAuth 用戶端 ID 之間存在重疊時，會記錄一則警告。

> 若要了解探索 (discovery)、權杖驗證設定以及測試，請參閱 [OpenID Connect](server-oidc.md)。
> 
> 若需透過相同提供者進行瀏覽器登入，請參閱 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。
> 
{style="tip"}