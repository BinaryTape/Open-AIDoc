[//]: # (title: OAuth 2.0 流程)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
型別化 OAuth 2.0 流程會安裝自己的登入與回呼路由，並能透過型別化工作階段保持使用者處於登入狀態。
</link-summary>

Ktor 提供了兩種型別化 OAuth 2.0 流程，作為[型別安全驗證配置 API](server-typed-auth.md) 的一部分：

* `oauth2Session` 會為使用者登入、儲存工作階段，並為你提供一個用於保護應用程式路由的配置 (scheme)。除非你有特殊理由不使用，否則建議採用此配置。
* `oauth2` 會為使用者登入，並在回呼中將權杖交給你。它不會保護後續的路由。

流程並非傳遞給 `authenticateWith()` 的 scheme。它是你 `install()` 到路由中的值，並且會自動為你建立登入和回呼路由。

<note>
    <p>
        型別安全驗證配置 API 屬於實驗功能。它隨時可能被移除或變更。需要明確選擇啟用 (opt-in)。更多詳細資訊請參閱
        <a href="server-typed-auth.md#prerequisites">啟用該 API</a>。
    </p>
</note>

> 本主題涵蓋型別化 API。有關傳統的 `oauth` 提供者，請參閱 [OAuth](server-oauth.md)。
>
{style="note"}

## 流程運作方式 {id="flow"}

1. 使用者造訪登入路徑。Ktor 將其重新導向至 OAuth 提供者。
2. 使用者在提供者端批准所請求的權限。
3. 提供者帶著授權碼重新導向回你的回呼路徑。
4. Ktor 使用授權碼交換存取權杖 (access token)。
5. 對於 `oauth2Session`，Ktor 會儲存工作階段並解析 principal，然後執行你的回呼處理常式。

## 使用 oauth2Session 讓使用者登入 {id="oauth2-session"}

流程需要一個 [HttpClient](client-create-and-configure.md) 來呼叫提供者的權杖端點，因此也請新增用戶端引擎相依性，例如 `io.ktor:ktor-client-cio`。

宣告兩個型別：你的路由所使用的 principal，以及 Ktor 為呼叫端儲存的工作階段。

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

然後建立流程。請注意型別引數的順序：principal 在前，工作階段在後。

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

`sessions` 區塊執行兩項任務：

* `sessionCreator` 將權杖回應轉換為你想要儲存的工作階段。它會在權杖交換完成後立即執行一次。
* `validate` 將儲存的工作階段轉換為 principal。它會在每個對受保護路由發送的請求中執行。

兩者皆為必填。

安裝流程並使用 `flow.session` 保護你的路由：

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

`install()` 會建立登入路由、回呼路由，並為工作階段配置安裝 [Sessions](server-sessions.md) 外掛程式。你不需要自行安裝 `Sessions`。

在受保護的路由內部，`call.principal` 即為你的 `User`，而 `call.session` 則是你的 `UserSession`。關於工作階段可執行的所有操作，請參閱[型別安全工作階段驗證](server-typed-session-auth.md)。

## 受保護的路由不會重新導向 {id="redirects"}

流程為你建立的路由（登入路徑與回呼路徑）會將未驗證的訪客重新導向至 OAuth 提供者。但你使用 `authenticateWith(flow.session)` 保護的路由**不會**這樣做。沒有有效工作階段的請求將會收到 `401 Unauthorized`。

你有兩種方式將使用者引導至提供者：

* 從你的登入頁面連結到 `loginPath`。
* 當缺少工作階段時，自行重新導向至該處：

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

有兩個處理常式涵蓋了登入可能失敗的兩種情況。

流程上的 `onUnauthorized` 用於處理 OAuth 錯誤，例如使用者拒絕同意、權杖交換失敗、`sessionCreator` 或 `validate` 回傳 `null`：

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 使用多個提供者 {id="provider-lookup"}

設定 `providerLookup` 而非 `settings`，以便根據每個請求選擇提供者。該區塊在路由上下文中執行，因此你可以讀取路徑、查詢參數或標頭：

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

請設定 `settings` 或 `providerLookup` 其中之一，切勿同時設定兩者。

## 不使用工作階段進行登入 {id="oauth2"}

當你不需要 Ktor 保護後續路由時（例如在登入後簽發你自己的 JWT），請使用 `oauth2`。回呼處理常式會接收權杖回應：

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

這裡沒有 `flow.session`，因此沒有可傳遞給 `authenticateWith()` 的內容。請使用其他配置（例如 [`jwt`](server-jwt.md)）來保護你的路由。

## 安全性注意事項 {id="security"}

* 切勿將 `clientSecret` 納入原始碼管理。請從環境變數或你的[組態檔](server-configuration-file.topic)中讀取。
* 回呼會將工作階段儲存在新產生的 session ID 下，並捨棄隨回呼請求一同送達的任何 session ID。這可防止工作階段固定攻擊 (session fixation)。
* 預設的工作階段傳輸方式會將工作階段資料保留在伺服器端，並且只向用戶端傳送一個 ID。如果你切換至傳值 (by-value) 傳輸方式，請加入轉換器。請參閱[選擇傳輸方式](server-typed-session-auth.md#transport)。

## 後續步驟 {id="next"}

* [型別安全驗證](server-typed-auth.md)涵蓋角色、選用性驗證以及該 API 的其餘部分。
* [型別安全工作階段驗證](server-typed-session-auth.md)涵蓋工作階段、傳輸方式以及將使用者登出。
* [OpenID Connect](server-oidc.md) 可以從 OpenID Connect 發行者 URL 自動為你設定這些流程。