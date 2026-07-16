[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-oauth-google"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

[OAuth](https://oauth.net/) 是一個用於存取委派的開放標準。OAuth 可用於透過外部提供者（例如 Google、Facebook、Twitter 等）對您的應用程式使用者進行授權。

`oauth` 提供者支援授權碼流程。您可以在一個地方設定 OAuth 參數，Ktor 將會自動使用必要的參數向指定的授權伺服器發送請求。

> 您可以在 [Ktor Server 中的身分驗證與授權](server-auth.md) 章節中獲取有關 Ktor 身分驗證與授權的一般資訊。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## 安裝 Sessions 外掛程式

為了避免用戶端每次嘗試存取受保護資源時都要請求授權，您可以在授權成功後將存取權杖儲存在工作階段中。
接著，您可以在受保護路由的處理常式中從目前的工作階段檢索存取權杖，並使用它來請求資源。

```kotlin
import io.ktor.server.sessions.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Sessions) {
        cookie<UserSession>("user_session")
    }
}

@Serializable
data class UserSession(val state: String, val token: String)
```

## OAuth 授權流程 {id="flow"}

Ktor 應用程式中的 OAuth 授權流程可能如下所示：

1. 使用者在 Ktor 應用程式中開啟登入頁面。
2. Ktor 自動重新導向至特定提供者的授權頁面，並傳遞必要的 [參數](#configure-oauth-provider)：
    * 用於存取所選提供者 API 的用戶端 ID。
    * 回呼或重新導向 URL，指定授權完成後將開啟的 Ktor 應用程式頁面。
    * Ktor 應用程式所需的第三方資源範圍 (Scopes)。
    * 用於獲取存取權杖的授權類型（授權碼）。
    * 用於緩解 CSRF 攻擊和重新導向使用者的 `state` 參數。
    * 特定提供者的選用參數。
3. 授權頁面會顯示同意畫面，列出 Ktor 應用程式所需的權限級別。這些權限取決於指定的範圍，如 [步驟 2：設定 OAuth 提供者](#configure-oauth-provider) 中所設定。
4. 如果使用者核准了請求的權限，授權伺服器將重新導向回指定的重新導向 URL 並發送授權碼。
5. Ktor 向指定的存取權杖 URL 發送另一個自動請求，包含以下參數：
    * 授權碼。
    * 用戶端 ID 與用戶端密鑰。

   授權伺服器會傳回存取權杖作為回應。
6. 用戶端隨後可以使用此權杖向所選提供者的所需服務發送請求。在大多數情況下，權杖會使用 `Bearer` 方案在 `Authorization` 標頭中發送。
7. 服務驗證權杖，使用其範圍進行授權，並回傳請求的資料。

## 安裝 OAuth {id="install"}

要安裝 `oauth` 身分驗證提供者，請在 `install` 區塊內呼叫 [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 函式。您可以選擇 [指定提供者名稱](server-auth.md#provider-name)。
例如，要安裝名稱為 "auth-oauth-google" 的 `oauth` 提供者，程式碼如下所示：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // Configure oauth authentication
            urlProvider = { "http://localhost:8080/callback" }
        }
    }
}
```

## 設定 OAuth {id="configure-oauth"}

本節演示如何設定 `oauth` 提供者，以便使用 Google 授權您的應用程式使用者。
如需完整的可執行範例，請參閱 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

### 先決條件：建立授權憑據 {id="authorization-credentials"}

要存取 Google API，您需要在 Google Cloud 控制台中建立授權憑據。

1. 在 Google Cloud 控制台中開啟 [憑據](https://console.cloud.google.com/apis/credentials) 頁面。
2. 點擊 **建立憑據** 並選擇 `OAuth 用戶端 ID`。
3. 從下拉式功能表中選擇 `網頁應用程式`。
4. 指定以下設定：
    * **已授權的 JavaScript 來源**：`http://localhost:8080`。
    * **已授權的重新導向 URI**：`http://localhost:8080/callback`。
      在 Ktor 中，[urlProvider](#configure-oauth-provider) 屬性用於指定授權完成時將開啟的重新導向路由。

5. 點擊 **建立**。
6. 在顯示的對話方塊中，複製建立的用戶端 ID 與用戶端密鑰，這些將用於設定 `oauth` 提供者。

### 步驟 1：建立 HTTP 用戶端 {id="create-http-client"}

在設定 `oauth` 提供者之前，您需要建立 [HttpClient](client-create-and-configure.md)，伺服器將使用它向 OAuth 伺服器發送請求。需要具有 JSON 序列化程式的 [ContentNegotiation](client-serialization.md) 用戶端外掛程式，以便在 [請求 API 之後](#request-api) 反序列化接收到的 JSON 資料。

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

用戶端執行個體會傳遞給 `main` [模組函式](server-modules.md)，以便能夠在伺服器 [測試](server-testing.md) 中建立獨立的用戶端執行個體。

```kotlin
fun Application.main(httpClient: HttpClient = applicationHttpClient) {
}
```

### 步驟 2：設定 OAuth 提供者 {id="configure-oauth-provider"}

下方的程式碼片段展示了如何建立並設定名為 `auth-oauth-google` 的 `oauth` 提供者。

```kotlin
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // Configure oauth authentication
        urlProvider = { "http://localhost:8080/callback" }
        providerLookup = {
            OAuthServerSettings.OAuth2ServerSettings(
                name = "google",
                authorizeUrl = "https://accounts.google.com/o/oauth2/auth",
                accessTokenUrl = "https://accounts.google.com/o/oauth2/token",
                requestMethod = HttpMethod.Post,
                clientId = System.getenv("GOOGLE_CLIENT_ID"),
                clientSecret = System.getenv("GOOGLE_CLIENT_SECRET"),
                defaultScopes = listOf("https://www.googleapis.com/auth/userinfo.profile"),
                extraAuthParameters = listOf("access_type" to "offline"),
                onStateCreated = { call, state ->
                    //saves new state with redirect url value
                    call.request.queryParameters["redirectUrl"]?.let {
                        redirects[state] = it
                    }
                }
            )
        }
        fallback = { cause ->
            if (cause is OAuth2RedirectError) {
                respondRedirect("/login-after-fallback")
            } else {
                respond(HttpStatusCode.Forbidden, cause.message)
            }
        }
        client = httpClient
    }
}
```

* `urlProvider` 指定了授權完成時將呼叫的 [重新導向路由](#redirect-route)。
  > 請確保此路由已新增至 [**已授權的重新導向 URI**](#authorization-credentials) 清單中。
* `providerLookup` 允許您指定所需提供者的 OAuth 設定。這些設定由 [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) 類別表示，並允許 Ktor 向 OAuth 伺服器發送自動請求。
* `fallback` 屬性透過重新導向或自訂回應來處理 OAuth 流程錯誤。
* `client` 屬性指定了 Ktor 用於向 OAuth 伺服器發送請求的 [HttpClient](#create-http-client)。

### 步驟 3：新增登入路由 {id="login-route"}

設定完 `oauth` 提供者後，您需要在接受 `oauth` 提供者名稱的 `authenticate` 函式內部 [建立受保護的登入路由](server-auth.md#authenticate-route)。當 Ktor 收到對此路由的請求時，它將自動重新導向至 [providerLookup](#configure-oauth-provider) 中定義的 `authorizeUrl`。

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // Redirects to 'authorizeUrl' automatically
        }
    }
}
```

使用者將看到授權頁面，列出 Ktor 應用程式所需的權限級別。這些權限取決於 [providerLookup](#configure-oauth-provider) 中指定的 `defaultScopes`。

### 步驟 4：新增重新導向路由 {id="redirect-route"}

除了登入路由之外，您還需要為 `urlProvider` 建立重新導向路由，如 [步驟 2：設定 OAuth 提供者](#configure-oauth-provider) 中所述。

在此路由內部，您可以使用 `call.principal` 函式檢索 [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) 物件。`OAuthAccessTokenResponse` 允許您存取由 OAuth 伺服器傳回的權杖與其他參數。

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // Redirects to 'authorizeUrl' automatically
            }

            get("/callback") {
                val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()
                // redirects home if the url is not found before authorization
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        call.sessions.set(UserSession(state, principal.accessToken))
                        redirects.remove(state)?.let { redirect ->
                            call.respondRedirect(redirect)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/home")
            }
        }
    }
```

在此範例中，接收到權杖後執行以下操作：

* 權杖儲存在 [工作階段](server-sessions.md) 中，其內容可以在其他路由中存取。
* 使用者被重新導向至下一個路由，並在該處向 Google API 發送請求。
* 如果找不到請求的路由，使用者將被重新導向至 `/home` 路由。

### 步驟 5：向 API 發送請求 {id="request-api"}

在 [重新導向路由](#redirect-route) 內部接收權杖並將其儲存到工作階段後，您可以使用此權杖向外部 API 發送請求。下方的程式碼片段展示了如何使用 [HttpClient](#create-http-client) 發送此類請求，並透過在 `Authorization` 標頭中傳送此權杖來獲取使用者的資訊。

建立一個名為 `getPersonalGreeting` 的新函式，該函式將發送請求並傳回回應主體：

```kotlin
private suspend fun getPersonalGreeting(
    httpClient: HttpClient,
    userSession: UserSession
): UserInfo = httpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
    headers {
        append(HttpHeaders.Authorization, "Bearer ${userSession.token}")
    }
}.body()
```

接著，您可以在 `get` 路由中呼叫該函式來檢索使用者的資訊：

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo = getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

如需完整的可執行範例，請參閱 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。