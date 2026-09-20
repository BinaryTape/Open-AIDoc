[//]: # (title: OpenID Connect 資源伺服器)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要相依項</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許你在不需要額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links>支援</b>：✖️
</p>
</tldr>

<link-summary>
驗證由 OpenID Connect 提供者簽發的存取權杖，無論是在本機作為 JWT 驗證，還是透過權杖自我檢查（token introspection）進行驗證。
</link-summary>

資源伺服器是接受由他人簽發之權杖的 API。它不提供登入頁面，也不使用瀏覽器工作階段。用戶端發送存取權杖，伺服器在允許存取受保護的資源之前會先驗證該權杖。

> 如需瀏覽器登入的相關資訊，請參閱 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。
> 
> 如需探索（discovery）、權杖型別以及外掛程式設定的相關資訊，請參閱 [OpenID Connect](server-oidc.md)。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 外掛程式目前為實驗性功能，僅適用於 JVM，且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用
        <Links href="/ktor/server-typed-auth" summary="型別安全的身分驗證機制 API 會將 principal 型別繫結至路由，因此你無需轉型或進行 null 檢查即可讀取非 null 的 principal。">型別安全驗證 API</Links>，該 API 需要 Kotlin context 參數。
    </p>
</note>

## 驗證 JWT 存取權杖 {id="jwt-bearer"}

許多提供者會將存取權杖簽發為已簽署的 JSON Web Token (JWT)。設定你的 API 所預期的 audience（受眾），然後使用 `provider.jwtBearer` 保護路由：

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

`audience` 屬性為必填項且不得為空。它用於在提供者端識別你的 API，且通常與 OAuth 用戶端 ID 不同。

該外掛程式會從 `Authorization: Bearer` 標頭中讀取權杖，從提供者的 JWKS 端點擷取簽署金鑰，並檢查簽章、簽發者（issuer）、受眾（audience）以及到期時間（expiry）。

## 驗證不透明權杖 {id="introspection"}

並非所有提供者都會簽發 JWT。*不透明（opaque）* 權杖是一個沒有可讀內容的隨機字串，因此你的伺服器無法在本地對其進行驗證。這是一個深思熟慮的權衡：不透明權杖即使被攔截也不會洩漏任何資訊，而且由於每次使用時都會向提供者進行查詢，因此它可以被撤銷並立即失效。而 JWT 則會一直保持有效，直到其過期為止。

若要驗證不透明權杖，伺服器會使用 [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) 所定義的 *權杖自我檢查（token introspection）*。你的伺服器會將權杖發送至 introspection 端點，驗證自身身分，並接收一個指出該權杖是否處於啟動狀態以及任何相關元資料（例如 subject、scope、用戶端與到期時間）的回應。

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

introspection 端點並非 OpenID Connect 探索文件的一部分，因此請根據提供者的文件進行明確設定。在上述範例中，簽發者 URL 儲存在區域變數中，因為外部的 `issuer` 屬性在 `introspection { }` 區塊中無法使用。

`clientId` 和 `clientSecret` 屬性是向提供者識別你的 API，而不是識別使用者。自我檢查是一項具特權的操作，因此大多數提供者都需要一個獲准執行該操作的獨立用戶端。

預設情況下，該外掛程式使用 HTTP 基本驗證（HTTP Basic authentication）。若改為在表單主體中發送憑據，請設定 `authMethod = ClientAuthenticationMethod.ClientSecretPost`。

只有在回應包含 `active: true`、其受眾與你所設定的 `audience` 有交集，且傳回的任何 `iss`、`exp` 和 `nbf` 值均有效時，權杖才會被接受。

自我檢查需要為每次驗證嘗試發送網路請求，並取決於提供者的可用性。當你的提供者簽發 JWT 時，建議優先使用 [JWT 驗證](#jwt-bearer)；當提供者未簽發 JWT，或即時撤銷相較於延遲更為重要時，請使用自我檢查。

## 從其他位置讀取權杖 {id="token-extractor"}

預設情況下，該外掛程式從 `Authorization` 標頭讀取權杖。若要從其他位置讀取，請設定自訂擷取器：

```kotlin
bearer {
    audience = setOf("https://api.example.com")
    tokenExtractor = { call.request.cookies["access_token"] }
}
```

當沒有可用的權杖時傳回 `null`。該請求隨後將作為未通過驗證而失敗。

## 發布受保護資源元資料 {id="protected-resource"}

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) 允許用戶端探索你的 API 所信任的授權伺服器，而無需事先進行預先設定。這對於機器對機器（M2M）用戶端和 MCP 伺服器非常有用。

在安裝外掛程式時設定受保護資源元資料：

```kotlin
val oidc = install(Oidc) {
    protectedResource("https://api.example.com") {
        resourceName = "Orders API"
    }
}
```

這會在 `/.well-known/oauth-protected-resource` 提供一份文件。該外掛程式會從已註冊的提供者推導出以下值：

* `authorizationServers` — 每個具有 `bearer { }` 區塊之提供者的簽發者。
* `scopesSupported` — 這些提供者所請求的 scope。
* `bearerMethodsSupported` — 當提供者讀取標準授權標頭時為 `header`。

明確設定這些屬性中的任何一項即可覆寫推導出的值。

設定受保護資源也會變更質詢（challenge）。遭拒絕的請求不會傳回 `WWW-Authenticate: Bearer` 標頭，而是會包含指向元資料文件的指標：

```http
WWW-Authenticate: Bearer resource_metadata="https://api.example.com/.well-known/oauth-protected-resource"
```

## 處理驗證錯誤 {id="errors"}

### 驗證錯誤回應 {id="errors-response"}

遭拒絕的權杖會產生帶有 `WWW-Authenticate: Bearer` 標頭的 `401 Unauthorized`。

該質詢不包含 `error`、`error_description` 和 `realm` 參數。因此，用戶端無法區分是缺少權杖還是權杖已過期，或是簽章錯誤還是受眾錯誤。如需診斷遭拒權杖的詳細資訊，請參閱[找出權杖遭拒的原因](#errors-logging)。

以下情況會產生 `401 Unauthorized`：

| 原因 | 附註 |
|---|---|
| 沒有權杖，或 `Authorization` 標頭格式錯誤 | |
| 無效簽章 | |
| 錯誤的簽發者或錯誤的受眾 | |
| 權杖已過期 | 超過 `clockSkew` 寬限期後 |
| `none`、`HS256`、`HS384` 或 `HS512` 演算法 | 一律拒絕 |
| 不在 `allowedAlgorithms` 中的演算法 | |
| 未知的 `kid` | 金鑰不存在於已擷取的 JWKS 文件中 |
| 自我檢查傳回 `active: false` | |
| 自我檢查傳回錯誤或過期的受眾 | |

未知的 `kid` 表示權杖參考了不存在於所擷取 JWKS 文件中的金鑰，因此會導致 `401 Unauthorized`。

### 處理伺服器端驗證失敗 {id="errors-500"}

某些失敗會阻止外掛程式完成權杖驗證，但並未確定權杖本身是否無效。這些失敗會導致 `500 Internal Server Error`：

| 失敗情況 | 例外 |
|---|---|
| JWKS 端點無法連線 | `OidcSigningKeyUnavailableException` |
| JWKS 文件無法剖析 | `OidcSigningKeyUnavailableException` |
| JWKS 請求速率限制已耗盡 | `OidcSigningKeyUnavailableException` |
| introspection 端點無法連線或以非 2xx 狀態回應 | `ResponseException`、`IOException` 或還原序列化錯誤 |
| `fetchUserInfo` 請求在傳輸層級失敗 | 同上 |
| 工作階段權杖重新整理在傳輸層級失敗 | 同上。請參閱[處理登入錯誤](server-oidc-browser-login.md#errors) |

因此，身分提供者的服務中斷可能會導致經過驗證的請求失敗，並傳回 `500 Internal Server Error`。

JWK 請求速率限制預設處於啟用狀態，這也可能導致簽署金鑰查詢失敗。金鑰查詢限制為每分鐘 10 次請求，且查詢快取中不存在的 kid 會計入限制次數。大量使用先前未見之金鑰簽署的權杖（例如在金鑰輪換期間），可能會耗盡此上限。

若要調高限制，請設定 `jwkRateLimit`：

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

`503 Service Unavailable` 表示該請求在身分提供者復原後可能會成功。

僅簽署金鑰失敗具有專屬的例外型別，且它是唯一值得像這樣進行全域捕捉的例外。其餘的失敗會以 `ResponseException` 或 `IOException` 呈現，這兩者也同樣被其他 [HTTP 用戶端](client-create-and-configure.md)操作使用。請避免在全域範圍處理這些例外型別，因為這可能會導致無關的失敗被回報為提供者服務中斷。請在可能產生它們的操作附近就近處理，或者允許它們直接產生 `500 Internal Server Error`。

### 找出權杖遭拒的原因 {id="errors-logging"}

權杖遭拒的詳細資訊會以 `TRACE` 層級記錄。若要啟用，請為該外掛程式套件設定記錄。使用 Logback 時，請將以下內容新增至 <Path>logback.xml</Path>（通常位於 <Path>src/main/resources/logback.xml</Path>）：

```xml

<configuration>
    <logger name="io.ktor.server.auth.oidc" level="TRACE"/>
</configuration>
```

每個提供者都會在 `io.ktor.server.auth.oidc.OidcProvider[<name>]` 下進行記錄，因此你可以單獨調高單一提供者的記錄層級，而不會受到其餘提供者的雜訊干擾。

記錄訊息會指明失敗的驗證檢查，例如：
`JWT algorithm HS256 is not accepted` 或 `JWT kid abc123 does not match any JWK`。

### 自訂 401 回應 {id="errors-custom"}

`bearer {}` 組態並未提供驗證失敗處理常式。若要自訂回應，請在受保護的路由上設定 `onUnauthorized` 處理常式：

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

路由層級的處理常式會完全取代內建的回應，包含 `WWW-Authenticate` 標頭。如果你設定了[受保護資源元資料](#protected-resource)，`resource_metadata` 參數也會被移除。如果用戶端相依於該標頭，請明確將其新增。

對於接受多種驗證機制的路由，請使用 `authenticateWithAnyOf(..., onUnauthorized = ...)`。

### 切勿將你的用戶端 ID 重複用作受眾 {id="audience-overlap"}

如果 `bearer { audience }` 包含了來自 `oauth { }` 區塊的 `clientId`，那麼為登入簽發的 ID 權杖就可能會被視為 API 的存取權杖而通過驗證，除非提供者使用了 `token_use` 或 `typ` 聲明（claim）進行標記。但並非所有提供者都會這麼做。

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

當外掛程式在啟動時偵測到 API 受眾與 OAuth 用戶端 ID 之間存在重疊時，會記錄一則警告。

> 若要了解探索、權杖驗證設定以及測試的相關資訊，請參閱 [OpenID Connect](server-oidc.md)。
> 
> 若要了解使用同一提供者的瀏覽器登入，請參閱 [OpenID Connect 瀏覽器登入](server-oidc-browser-login.md)。
> 
{style="tip"}