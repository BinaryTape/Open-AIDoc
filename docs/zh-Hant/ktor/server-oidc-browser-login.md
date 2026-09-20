[//]: # (title: OpenID Connect 瀏覽器登入)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links>支援</b>：✖️
</p>
</tldr>

<link-summary>
透過 OpenID Connect 提供者登入使用者。此外掛程式會建立登入與回呼路由，並透過工作階段保持使用者登入狀態。
</link-summary>

本主題說明如何使用 OpenID Connect 讓使用者從瀏覽器登入、管理其工作階段，並處理登出和權杖重新整理。

> 若要驗證 OpenID Connect 提供者簽發的權杖，請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md)。
> 
> 關於探索和外掛程式設定，請參閱 [OpenID Connect](server-oidc.md)。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect 外掛程式目前為實驗功能，僅適用於 JVM，且需要
        <code>@OptIn(ExperimentalKtorApi::class)</code>。它使用
        <Links href="/ktor/server-typed-auth" summary="型別安全驗證配置 API 會將主體型別繫結至路由，因此您可以讀取非 null 的主體，而無需進行型別轉換或 null 檢查。">型別安全驗證 API</Links>，該 API 需要 Kotlin 上下文參數。
    </p>
</note>

## 流程如何運作 {id="flow"}

1. 使用者開啟 `/oidc/{name}/login`。
2. Ktor 將使用者重新導向至提供者，並附帶 `state`、`nonce` 和 PKCE challenge。
3. 使用者向提供者登入並核准所請求的作用域。
4. 提供者帶著授權碼將使用者傳回至 `/oidc/{name}/callback`。
5. Ktor 使用授權碼交換權杖、驗證 ID 權杖，並儲存工作階段。
6. `onAuthenticated` 處理常式執行。

此外掛程式會建立以下路由：

| 路由                    | 方法   | 建立時機                  |
|-------------------------|--------|---------------------------|
| `/oidc/{name}/login`    | `GET`  | 一律建立                  |
| `/oidc/{name}/callback` | `GET`  | 一律建立                  |
| `/oidc/{name}/logout`   | `POST` | 當您呼叫 `logout()` 時    |
| `/oidc/{name}/refresh`  | `POST` | 當您呼叫 `refresh()` 時   |

請向您的提供者註冊回呼路由作為允許的重新導向 URI。

## 登入使用者 {id="oauth"}

若要處理成功的登入，請設定 OAuth 憑據並使用 `onAuthenticated` 處理常式：

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

在工作階段儲存後，`onAuthenticated` 處理常式會在成功回呼結束時執行一次。如果沒有此處理常式，成功的登入將回應 `200 OK` 且內文為空。

`scopes` 屬性預設為 `listOf("openid", "profile", "email")`。指派值會取代預設清單而非附加至其後，且產生的清單仍必須包含 `openid`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    scopes = listOf("openid", "email", "calendar.read")
}
```

設定 `fetchUserInfo = true` 以擷取提供者未包含在 ID 權杖中的宣告（claims）。這會在每次登入時向 UserInfo 端點發出請求。

> 請將用戶端密鑰儲存在原始碼之外的設定檔中。如需詳細資訊，請參閱[從設定檔進行設定](server-oidc.md#config-file)。
>
{style="tip"}

## 自訂路由 {id="paths"}

您可以自訂所有產生的路徑。`loginUri` 與 `redirectUri` 屬性接受 `URLBuilder` 區塊，而 `logout()` 與 `refresh()` 則接受 `path`：

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

`redirectUri` 屬性必須與向提供者註冊的重新導向 URI 相符。當您變更此值時，請同步更新已註冊的重新導向 URI。

這些建構器都不支援查詢參數。外掛程式會拒絕包含查詢參數的路徑。

## 使用工作階段保護路由 {id="session"}

`provider.session` 配置會使用現有的工作階段驗證使用者。在此區塊內，`call.principal` 為 `OidcToken.Id`：

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

若要使用應用程式專屬的主體而非 OIDC 權杖，請使用 `mapPrincipal()` 映射此配置：

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

> 如需詳細資訊，請參閱[將權杖映射至應用程式主體](server-oidc.md#map-principal)。
> 
{style="tip"}

## 設定工作階段 {id="sessions"}

工作階段預設為啟用。使用 `sessions { }` 區塊來設定 Cookie 名稱或工作階段儲存機制：

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

Cookie 名稱預設為 `{PROVIDER_NAME}_SESSION`。在開發模式之外，外掛程式會設定 `HttpOnly`、`SameSite=Lax` 和 `Secure`。請僅在必要時覆寫這些設定。

傳輸機制固定為 `SessionTransportType.CookieId` 且無法變更。只有工作階段 ID 會傳送至瀏覽器。ID 權杖、存取權杖和 refresh token 則保留在伺服器端的 `storage` 中。

工作階段儲存機制預設為 `SessionStorageMemory()`，當應用程式重新啟動時會遺失所有工作階段，且不會在執行個體之間共用工作階段。在部署至正式環境之前，請設定持久化或共用儲存機制。

> 如需使用工作階段的詳細資訊，請參閱 [Sessions](server-sessions.md)。
> 
{style="tip"}

## 防範 CSRF {id="csrf"}

此外掛程式產生的路由受到來源檢查保護：

```kotlin
sessions {
    csrfProtection {
        originMatchesHost()
    }
}
```

此保護機制預設為啟用，因此僅在需要變更時才設定此區塊。

您可以使用 `disableCsrfProtection()` 函式停用 CSRF 保護。然而，登出與重新整理路由接受來自瀏覽器包含工作階段 Cookie 的 `POST` 請求，因此這些路由應保持受到 CSRF 保護。

## 登出使用者 {id="logout"}

若要登出使用者，請使用 `logout()` 函式：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    logout(
        postLogoutRedirectUri = { path("signed-out") }
    )
}
```

向 `/oidc/google/logout` 發送的 `POST` 請求會清除工作階段並回應 `303 See Other`，將使用者重新導向至提供者的 `end_session_endpoint`。

提供者必須在其探索文件中聲明 `end_session_endpoint`。Ktor 會在註冊路由時檢查此項目，因此若提供者缺少此端點，將會導致應用程式啟動失敗，而不是在登出時才失敗。如果您的提供者不支援此端點，請直接清除工作階段，而不是呼叫 `logout()`。

傳入處理常式以執行額外邏輯或提供自訂回應，而非重新導向：

```kotlin
logout {
    call.respondRedirect("/goodbye")
}
```

登出不會撤銷提供者端的 refresh token。

## 保持工作階段有效 {id="refresh"}

ID 權杖會過期。預設情況下，外掛程式不會重新整理它們。一旦權杖超過其 `exp` 值，工作階段就會被清除，使用者必須重新登入。

若要自動重新整理權杖，請設定重新整理策略：

```kotlin
sessions {
    tokenRefreshStrategy = OidcTokenRefreshStrategy.Auto(
        beforeExpiry = 30.seconds
    )
}
```

重新整理後的權杖必須與現有權杖具有相同的 `sub` 值。否則，重新整理後的權杖將被捨棄。

如需自動重新整理，請使用 `OidcTokenRefreshStrategy.Auto`。如需自訂重新整理行為，請使用 `OidcTokenRefreshStrategy.Custom`：

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

傳回 `token` 以保留現有工作階段，傳回新的 `OidcToken.Id` 以取代已儲存的工作階段，或在沒有可用的重新整理權杖時傳回 `null`。若回呼傳回 `null` 或擲回例外，工作階段在目前權杖仍有效期間保持可用，並在權杖過期時予以清除。若要立即結束工作階段，請改用 [Sessions](server-sessions.md) 外掛程式將其清除。

此回呼會在每個使用工作階段配置進行驗證的請求中執行，因此請保持其處理邏輯輕量化。請使用 `now` 參數而非直接讀取時鐘，以便請求內的所有時間比較都使用相同的值。

`now` 參數和 `claims.expiresAt` 為 `kotlin.time.Instant`，屬於實驗性 API。比較它們的策略除了外掛程式所需的 opt-in 之外，還需要 `@OptIn(ExperimentalTime::class)`。

您也可以新增依需求重新整理的路由：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    refresh()
}
```

向 `/oidc/google/refresh` 發送的 `POST` 請求在成功時回應 `200 OK`，在無法重新整理工作階段時回應 `401 Unauthorized`。當收到 `401` 回應時，現有工作階段會保持不變，直到其權杖過期為止。

### 手動重新整理權杖 {id="manual-refresh"}

對於不使用所產生之重新整理路由的情況（例如排程工作或在呼叫下游 API 之前進行重新整理），請呼叫提供者上的 `refreshToken()` 函式：

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

`OidcTokenRefreshResult` 包含原始權杖回應：`accessToken`、`refreshToken`、`expiresIn`、`tokenType` 和 `scope`。當提供者未傳回 ID 權杖時，`idToken` 屬性為 null，因此在儲存工作階段之前請先進行檢查。

提供者在重新整理期間可能會擲出下列例外：
* 當提供者拒絕請求時擲出 `ResponseException`。
* 當傳回的權杖驗證失敗時擲出 `OidcTokenRejectedException`。
* 當無法驗證 ID 權杖時擲出 `OidcSigningKeyUnavailableException`。如需詳細資訊，請參閱[處理伺服器端驗證失敗](server-oidc-resource-server.md#errors-500)。

使用相同 refresh token 的並行呼叫會共用對提供者的單一請求。結果會在 `tokenRefreshCacheTtl` 時間內重複使用，因此不需要額外的同步處理。

> 沒有 `exp` 宣告的 ID 權杖永遠不會被視為過期或重新整理。只要 Cookie 仍然有效，工作階段就會保持有效。
>
{style="note"}

## 在不使用工作階段的情況下登入 {id="no-session"}

如果您自行管理工作階段或簽發自己的權杖，請停用外掛程式的工作階段支援：

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

當停用工作階段時，`onAuthenticated` 為必填。在此模式下無法使用 `provider.session`、`logout()` 和 `refresh()` 函式。

## 使用多個提供者 {id="multiple"}

為每個簽發者（issuer）註冊一個身分識別提供者。每個提供者都有自己的路由、Cookie 和驗證配置：

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

在上述範例中，登入頁面會連結至 `/oidc/google/login` 和 `/oidc/github-idp/login`。若要允許任一提供者驗證相同的路由，請將兩者都映射至共用的主體型別，並使用 `authenticateWithAnyOf()` 函式。

## 請求具作用域的權杖 {id="resource-indicators"}

使用 `resourceIndicators` 屬性（[RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)）為特定 API 請求存取權杖：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    resourceIndicators = listOf("https://api.example.com")
}
```

該值應與該 API 在其[受保護資源中繼資料](server-oidc-resource-server.md#protected-resource)中發布的識別碼相符。

## 了解 PKCE {id="pkce"}

授權碼會透過使用者的瀏覽器傳回，並經過不受您控制的軟體。其他應用程式（例如註冊了相同 URL 配置的惡意應用程式或記錄代理）可能會獲取該授權碼，並嘗試用它來換取權杖。

PKCE（[RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)）可防止在沒有額外密鑰的情況下使用授權碼。在將使用者重新導向之前，Ktor 會產生一個名為 _verifier_ 的隨機密鑰，且只將其 SHA-256 雜湊值 _challenge_ 發送給提供者。稍後當 Ktor 交換授權碼時，它會出示 verifier，提供者則會檢查該 verifier 的雜湊是否與其儲存的 challenge 相符。

verifier 在授權請求期間不會發送給提供者，且無法由瀏覽器指令碼讀取。Ktor 將其與 `state` 和 `nonce` 值一起儲存在外掛程式所設定的 AES-256-GCM 加密 Cookie 中，因此瀏覽器僅持有其沒有金鑰的密文。解密該 Cookie 需要您的 `stateEncryptionKey`。

Ktor 在每次登入時都會使用 PKCE。`codeChallengeMethod` 預設為 `CodeChallengeMethod.S256`，且僅支援 `S256`。自訂的 challenge 方法會被拒絕。因為 verifier 儲存在該 Cookie 中，所以登入有[時間限制](#errors-state)。

## 處理登入錯誤 {id="errors"}

### 回應失敗的登入 {id="errors-handler"}

當回呼無法完成時，`onAuthenticationFailed` 處理常式會執行：

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

處理常式接收的是 `AuthenticationFailedCause`，而非例外。`AuthenticationFailedCause.Error` 提供了包含失敗詳細資訊的 `message`。

在沒有處理常式的情況下，失敗的登入會回應 `401 Unauthorized` 且內文為空。對於瀏覽器應用程式，您可以將使用者重新導向至登入路由以啟動新的驗證流程。

處理常式應該產生回應。如果沒有產生回應，Ktor 會備援採用失敗所註冊的 challenge，或在沒有可用的 challenge 時回應 `401 Unauthorized`。

當權杖端點將授權碼拒絕為 `invalid_grant`（發生在授權碼已過期或已被使用時）時，會將重新導向回提供者註冊為備援操作。如果處理常式未作出回應，登入流程將重新啟動。

重新啟動流程在某些情況下很有用，例如當使用者重新載入回呼頁面並嘗試重複使用同一個授權碼時。但潛在的風險在於它可能會不斷重複。然而，重複的 invalid_grant 回應可能會導致重新導向迴圈。當每個授權碼都失敗時（例如因為用戶端密鑰不正確，或者系統時鐘導致授權碼顯示為已過期），就可能發生這種情況。

若要防止備援重新導向，請在處理常式內進行回應。若要允許單次重試，請追蹤是否已經進行過重試：

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

一個短期 Cookie 會記錄是否已經進行過重試。第二次失敗時會傳回錯誤而非再次重新導向。該 Cookie 會在發生錯誤時被清除，並在兩分鐘後自動過期，因此不會影響下一次登入。

### 登入時間範圍為 10 分鐘 {id="errors-state"}

`state`、`nonce` 和 PKCE verifier 存放在一個加密 Cookie 中，該 Cookie 會在 10 分鐘後過期。此設定無法變更。

使用者若開啟登入頁面後離開，並在一小時後返回，將會遇到回呼失敗。當應用程式重新啟動而登入正在進行中的使用者亦是如此，除非您設定了 `stateEncryptionKey`：

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    stateEncryptionKey = OidcStateEncryptionKey.of(stateKey)
}
```

金鑰長度必須恰好為 32 位元組。若沒有明確指定金鑰，外掛程式會為每個程序產生一個新金鑰。因此，在應用程式重新啟動後，進行中的登入將會失敗，且無法在負載平衡器背後的不同執行個體之間延續。您可以使用 `OidcStateEncryptionKey.rotating(current, previous)` 來更換金鑰，而不會使已在進行中的登入流程失效。

過期的登入與偽造的回呼會產生相同的失敗結果，因此處理常式無法區分兩者。這就是為什麼預設會重新導向回登入路由。

### 驗證失敗原因 {id="errors-causes"}

| 原因                                   | 常見原因                                                                        |
|----------------------------------------|---------------------------------------------------------------------------------|
| 提供者傳回 `error=`                    | 使用者拒絕同意                                                                  |
| State Cookie 遺失或過期                | 超過 10 分鐘的時間範圍，或在未設定 `stateEncryptionKey` 的情況下重新啟動        |
| 無法解密 State Cookie                  | 偽造的回呼，或輪換了金鑰                                                        |
| `iss` 不相符或遺失                     | 提供者之間的混淆（[RFC 9207](https://www.rfc-editor.org/rfc/rfc9207)）          |
| `nonce` 不相符                         | 重播的 ID 權杖                                                                  |
| `at_hash` 不相符                       | ID 權杖與存取權杖不符                                                           |
| 回應未包含 `id_token`                  | 提供者未執行 OIDC 流程                                                          |
| ID 權杖驗證失敗                        | 簽名、簽發者 (issuer)、受眾 (audience)、`exp`、`iat`、`azp` 或 `sub`            |
| 權杖端點傳回錯誤                       | 授權碼已過期或被重複使用                                                        |

### 處理提供者可用性錯誤 {id="errors-500"}

某些失敗永遠不會到達 `onAuthenticationFailed`，而是直接顯示為 `500 Internal Server Error`。如需詳細資訊，請參閱[處理伺服器端驗證失敗](server-oidc-resource-server.md#errors-500)。

這可能會在自動權杖重新整理期間發生。使用 `OidcTokenRefreshStrategy.Auto` 時，重新整理會在處理一般請求時執行。因此，如果提供者無法使用，該請求可能會失敗並傳回 `500` 回應。

工作階段的後續狀態取決於重新整理失敗的原因：

| 失敗情況                                        | 工作階段                                     | 結果                                                              |
|-------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|
| 重新整理後的權杖無效                            | 清除                                         | `401`，且 Cookie 會被移除。工作階段將永遠無法復原                 |
| 提供者無法連線或傳回錯誤                        | 保留，除非已經過期                           | 例外會向上傳遞，因此傳回 `500`                                    |
| 回應中沒有 ID 權杖，或 `sub` 已變更            | 在仍有效期間保留，過期後清除                 | 持續運作直到舊權杖過期                                            |

在工作階段被清除後，下一個受保護的請求將處於未驗證狀態，使用者必須重新登入。

> 若要深入了解探索、工作階段安全性預設設定和測試，請參閱 [OpenID Connect](server-oidc.md)。
> 
> 關於在 API 中驗證權杖，請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md)。
> 
> 關於工作階段儲存機制與 Cookie 設定，請參閱 [Sessions](server-sessions.md)。
> 
{style="tip"}