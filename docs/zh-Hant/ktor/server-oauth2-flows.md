[//]: # (title: OAuth 2.0 流程)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
具型別的 OAuth 2.0 流程會安裝自己的登入與回呼路由，並能透過具型別的工作階段保持使用者登入狀態。
</link-summary>

Ktor 提供兩種具型別的 OAuth 2.0 流程，作為[型別安全驗證架構 API](server-typed-auth.md) 的一部分：

* `oauth2Session` 讓使用者登入、儲存工作階段，並提供用於保護應用程式路由的方案。除非有特殊原因，否則建議使用此方案。
* `oauth2` 讓使用者登入，並在回呼中將權杖傳遞給您。它不會保護後續的路由。

流程並非傳遞給 `authenticateWith()` 的方案。它是您 `install()` 到路由中的一個值，它會為您建立登入與回呼路由。

<note>
    <p>
        型別安全驗證架構 API 是一項實驗功能。它可能隨時被移除或變更。
        需要明確加入 (Opt-in)。如需詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">型別安全驗證文件</a>。
    </p>
</note>

> 本主題介紹具型別的 API。關於傳統的 `oauth` 提供者，請參閱 [OAuth](server-oauth.md)。
>
{style="note"}

## 流程如何運作 {id="flow"}

1. 使用者存取登入路徑。Ktor 將其重新導向至 OAuth 提供者。
2. 使用者在提供者端核准所要求的權限。
3. 提供者攜帶授權碼重新導向回您的回呼路徑。
4. Ktor 將該授權碼兌換為存取權杖。
5. 對於 `oauth2Session`，Ktor 會儲存工作階段並解析 principal，然後執行您的回呼處理常式。

## 使用 oauth2Session 讓使用者登入 {id="oauth2-session"}

流程需要一個 [HttpClient](client-create-and-configure.md) 來呼叫提供者的權杖端點，因此還需新增用戶端引擎相依性，例如 `io.ktor:ktor-client-cio`。

宣告兩個型別：路由所使用的 principal，以及 Ktor 為呼叫者儲存的工作階段。

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

接著建立流程。請注意型別引數的順序：principal 在前，工作階段在後。

```kotlin
val googleAuthorizeUrl =
    "https://accounts.google.com/o/oauth2/auth"
val googleTokenUrl = "https://oauth2.googleapis.com/token"
val profileScope =
    "https://www.googleapis.com/auth/userinfo.profile"

val googleAuth = oauth2Session<User, UserSession>("google") {
    client = HttpClient(CIO)
    settings = OAuthServerSettings.OAuth2ServerSettings(
        name = "google",
        authorizeUrl = googleAuthorizeUrl,
        accessTokenUrl = googleTokenUrl,
        requestMethod = HttpMethod.Post,
        clientId = System.getenv("GOOGLE_CLIENT_ID"),
        clientSecret = System.getenv("GOOGLE_CLIENT_SECRET"),
        defaultScopes = listOf(profileScope)
    )
    loginPath = "/login"
    callback("/callback") {
        call.respondRedirect("/profile")
    }
    sessions {
        sessionCreator = { token ->
            UserSession(token.accessToken)
        }
        validate { session ->
            userService.loadUser(session.accessToken)
        }
    }
}
```

`sessions` 區塊承擔兩項工作：

* `sessionCreator` 將權杖回應轉換為您想要儲存的工作階段。它只在權杖交換完成後立即執行一次。
* `validate` 將儲存的工作階段轉換為 principal。它會在對受保護路由的每個請求上執行。

兩者皆為必要。

安裝該流程並使用 `flow.session` 保護您的路由：

```kotlin
routing {
    install(googleAuth)

    authenticateWith(googleAuth.session) {
        get("/profile") {
            val user = call.principal
            val session = call.session
            val token = session.accessToken
            call.respondText("${user.email} ($token)")
        }
    }
}
```

`install()` 會建立登入路由、建立回呼路由，並為工作階段方案安裝 [Sessions](server-sessions.md) 外掛程式。您無需自行安裝 `Sessions`。

在受保護的路由內部，`call.principal` 是您的 `User`，而 `call.session` 是您的 `UserSession`。請參閱[型別安全工作階段驗證](server-typed-session-auth.md)以了解您可以對工作階段進行的所有操作。

## 受保護的路由不會重新導向 {id="redirects"}

流程為您建立的路由（登入路徑與回呼路徑）會將未驗證的訪客重新導向至 OAuth 提供者。但您使用 `authenticateWith(flow.session)` 保護的路由**不會**重新導向。缺少有效工作階段的請求將會收到 `401 Unauthorized`。

您有兩種方式將使用者引導至提供者：

* 從您的登入頁面連結到 `loginPath`。
* 當工作階段遺失時，自行重新導向至該處：

  ```kotlin
  val googleAuth = oauth2Session<User, UserSession>("google") {
      // ...
      sessions {
          sessionCreator = { token ->
              UserSession(token.accessToken)
          }
          validate { session ->
              userService.loadUser(session.accessToken)
          }
          onUnauthorized = { call.respondRedirect("/login") }
      }
  }
  ```

## 處理登入失敗 {id="errors"}

兩個處理常式涵蓋了登入可能失敗的兩種情況。

流程上的 `onUnauthorized` 處理 OAuth 錯誤，例如使用者拒絕同意、權杖交換失敗、`sessionCreator` 或 `validate` 回傳 `null`：

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 使用多個提供者 {id="provider-lookup"}

設定 `providerLookup` 而非 `settings`，以便針對每個請求選擇提供者。該區塊在路由環境中執行，因此您可以讀取路徑、查詢參數或標頭：

```kotlin
val socialAuth = oauth2Session<User, UserSession>("social") {
    client = HttpClient(CIO)
    providerLookup = {
        when (call.parameters["provider"]) {
            "google" -> googleSettings
            "github" -> githubSettings
            else -> null
        }
    }
    loginPath = "/login/{provider}"
    callback("/callback/{provider}") {
        call.respondRedirect("/profile")
    }
    sessions {
        sessionCreator = { token ->
            UserSession(token.accessToken)
        }
        validate { session ->
            userService.loadUser(session.accessToken)
        }
    }
}
```

請設定 `settings` 或 `providerLookup` 其中之一，不要兩者同時設定。

## 不使用工作階段進行登入 {id="oauth2"}

當您不需要 Ktor 來保護後續路由時（例如在登入後簽發自己的 JWT），請使用 `oauth2`。回呼處理常式會接收權杖回應：

```kotlin
val githubAuthorizeUrl =
    "https://github.com/login/oauth/authorize"
val githubTokenUrl =
    "https://github.com/login/oauth/access_token"

val githubOAuth = oauth2("github") {
    client = HttpClient(CIO)
    settings = OAuthServerSettings.OAuth2ServerSettings(
        name = "github",
        authorizeUrl = githubAuthorizeUrl,
        accessTokenUrl = githubTokenUrl,
        requestMethod = HttpMethod.Post,
        clientId = System.getenv("GITHUB_CLIENT_ID"),
        clientSecret = System.getenv("GITHUB_CLIENT_SECRET")
    )
    loginPath = "/login"
    callback("/callback") { token ->
        val jwt = tokenService.issueToken(token.accessToken)
        call.respondText(jwt)
    }
}

routing {
    install(githubOAuth)
}
```

這裡沒有 `flow.session`，因此沒有任何項目可以傳遞給 `authenticateWith()`。請使用另一個方案（例如 [`jwt`](server-jwt.md)）來保護您的路由。

## 安全性注意事項 {id="security"}

* 請勿將 `clientSecret` 納入版本控制中。請從環境變數或您的[設定檔](server-configuration-file.topic)中讀取它。
* 回呼會在新產生的工作階段 ID 下儲存工作階段，並捨棄隨回呼請求一同傳入的任何工作階段 ID。這可以防止工作階段固定 (session fixation)。
* 預設的工作階段傳輸方式會將工作階段資料保留在伺服器端，且僅向用戶端發送 ID。如果您切換為傳值傳輸方式，請新增轉換器。請參閱[選擇傳輸方式](server-typed-session-auth.md#transport)。

## 後續步驟 {id="next"}

* [型別安全驗證](server-typed-auth.md)介紹了角色、可選驗證以及 API 的其餘部分。
* [型別安全工作階段驗證](server-typed-session-auth.md)介紹了工作階段、傳輸方式以及讓使用者登出。
* [OpenID Connect](server-oidc.md) 透過 OpenID Connect 發行者 URL 為您設定這些流程。