[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

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
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links>支援</b>：✅
</p>
</tldr>

[OAuth](https://oauth.net/) 是一種用於存取委派的開放標準。OAuth 可用於透過外部提供者（例如 Google、Facebook、Twitter 等）為應用程式的使用者進行授權。

`oauth` 提供者支援授權碼流程（authorization code flow）。你可以在一個地方設定 OAuth 參數，Ktor 將會自動攜帶必要參數向指定的授權伺服器發出請求。

> 你可以在 [Ktor Server 中的驗證與授權](server-auth.md)章節中取得關於 Ktor 驗證與授權的通論資訊。

> Ktor 也提供了型別化的 OAuth 2.0 流程。你無需設定具名提供者，只需建立流程值並安裝它，Ktor 就會為你建立登入與回呼路由。`oauth2Session` 流程還為你提供了一種在登入後保護應用程式路由的配置方案。請參閱 [OAuth 2.0 流程](server-oauth2-flows.md)。
>
{style="tip"}

> 如果你的提供者支援 OpenID Connect，`Oidc` 外掛程式的功能更為完整。它會讀取提供者的探索文件（discovery document），因此你只需設定發行者（issuer）URL，而不需要手動配置授權、權杖和 JWKS 端點，並且它會自動為你處理 PKCE、ID 權杖驗證、工作階段與登出。請參閱 [OpenID Connect](server-oidc.md)。
>
{style="tip"}

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至你的組建指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 Sessions 外掛程式 {id="install-the-sessions-plugin"}

為了避免用戶端每次存取受保護資源時都要請求授權，你可以在授權成功後將存取權杖儲存在工作階段中。
接著，你可以在受保護路由的處理常式內從目前工作階段中擷取存取權杖，並使用它來請求資源。

```kotlin
import io.ktor.server.sessions.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Sessions) {
        cookie<UserSession>("user_session")
    }
}

@Serializable
data class UserSession(val state: String, val token: String)
```

## OAuth 授權流程 {id="flow"}

Ktor 應用程式中的 OAuth 授權流程可能如下所示：

1. 使用者開啟 Ktor 應用程式中的登入頁面。
2. Ktor 自動重新導向至特定提供者的授權頁面，並傳遞必要的[參數](#configure-oauth-provider)：
    * 用於存取所選提供者 API 的用戶端 ID（client ID）。
    * 指定在完成授權後將開啟之 Ktor 應用程式頁面的回呼或重新導向 URL。
    * Ktor 應用程式所需的第三方資源權限範圍（scopes）。
    * 用於取得存取權杖的授權類型（授權碼，Authorization Code）。
    * 用於防範 CSRF 攻擊及重新導向使用者的 `state` 參數。
    * 特定提供者專屬的選用參數。
3. 授權頁面顯示同意畫面，列出 Ktor 應用程式所需的權限等級。這些權限取決於指定的權限範圍，如[步驟 2：配置 OAuth 提供者](#configure-oauth-provider)中所設定。
4. 如果使用者同意授予所請求的權限，授權伺服器會重新導向回指定的重新導向 URL，並傳送授權碼。
5. Ktor 會自動向指定的存取權杖 URL 發送另一次請求，其中包含以下參數：
    * 授權碼。
    * 用戶端 ID 與用戶端密鑰（client secret）。

   授權伺服器回應並傳回存取權杖。
6. 用戶端接著可以使用此權杖向所選提供者的必要服務發出請求。在多數情況下，權杖會使用 `Bearer` 配置包含在 `Authorization` 標頭中傳送。
7. 該服務驗證權杖，使用其權限範圍進行授權，並傳回請求的資料。

## 安裝 OAuth {id="install"}

若要安裝 `oauth` 驗證提供者，請在 `install` 區塊內呼叫 [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 函式。你可以選擇性地[指定提供者名稱](server-auth.md#provider-name)。
例如，安裝名為 "auth-oauth-google" 的 `oauth` 提供者，其程式碼如下：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // Configure oauth authentication
            urlProvider = { "http://localhost:8080/callback" }
            client = httpClient
        }
    }
}
```

## 配置 OAuth {id="configure-oauth"}

本節示範如何配置 `oauth` 提供者，以便使用 Google 授權你的應用程式使用者。
如需完整的可執行範例，請參閱 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

### 事前準備：建立授權憑據 {id="authorization-credentials"}

若要存取 Google API，你需要在 Google Cloud Console 中建立授權憑據。

1. 開啟 Google Cloud Console 中的 [憑證 (Credentials)](https://console.cloud.google.com/apis/credentials) 頁面。
2. 點擊 **建立憑證** 並選擇 `OAuth 用戶端 ID`。
3. 從下拉式選單中選擇 `網頁應用程式`。
4. 指定以下設定：
    * **已授權的 JavaScript 來源**：`http://localhost:8080`。
    * **已授權的重新導向 URI**：`http://localhost:8080/callback`。
      在 Ktor 中，[urlProvider](#configure-oauth-provider) 屬性用於指定完成授權後開啟的重新導向路由。

5. 點擊 **建立**。
6. 在顯示的對話方塊中，複製所建立的用戶端 ID 與用戶端密鑰，這些資訊將用於配置 `oauth` 提供者。

### 步驟 1：建立 HTTP 用戶端 {id="create-http-client"}

在配置 `oauth` 提供者之前，你需要建立伺服器向 OAuth 伺服器發送請求時所使用的 [HttpClient](client-create-and-configure.md)。在[向 API 發送請求後](#request-api)，需要具有 JSON 序列化程式的 [ContentNegotiation](client-serialization.md) 用戶端外掛程式來還原序列化接收到的 JSON 資料。

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

用戶端執行個體會傳遞給 `main` [模組函式](server-modules.md)，以便能夠在伺服器[測試](server-testing.md)中建立獨立的用戶端執行個體。

```kotlin
fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
}
```

### 步驟 2：配置 OAuth 提供者 {id="configure-oauth-provider"}

下方的程式碼片段展示如何建立並配置名為 `auth-oauth-google` 的 `oauth` 提供者。
對於具有固定 OAuth 設定的提供者，請使用 `settings` 屬性。

```kotlin
val googleAuthorizeUrl =
    "https://accounts.google.com/o/oauth2/auth"
val googleTokenUrl =
    "https://accounts.google.com/o/oauth2/token"
val profileScope =
    "https://www.googleapis.com/auth/userinfo.profile"
val googleClientId =
    System.getenv("GOOGLE_CLIENT_ID").orEmpty()
val googleClientSecret =
    System.getenv("GOOGLE_CLIENT_SECRET").orEmpty()
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // Configure oauth authentication
        urlProvider = { "http://localhost:8080/callback" }
        settings = OAuthServerSettings.OAuth2ServerSettings(
                name = "google",
                authorizeUrl = googleAuthorizeUrl,
                accessTokenUrl = googleTokenUrl,
                requestMethod = HttpMethod.Post,
                clientId = googleClientId,
                clientSecret = googleClientSecret,
                defaultScopes = listOf(profileScope),
                extraAuthParameters =
                    listOf("access_type" to "offline"),
                onStateCreated = { call, state ->
                    // saves new state with redirect url
                    val query = call.request.queryParameters
                    query["redirectUrl"]?.let {
                        redirects[state] = it
                    }
                }
            )
        fallback = { cause ->
            if (cause is OAuth2RedirectError) {
                respondRedirect("/login-after-fallback")
            } else {
                respond(
                    HttpStatusCode.Forbidden,
                    cause.message
                )
            }
        }
        client = httpClient
    }
}
```

* `urlProvider` 指定在完成授權後將叫用的[重新導向路由](#redirect-route)。
  > 請確保此路由已新增至 [**已授權的重新導向 URI**](#authorization-credentials) 清單中。
* `settings` 屬性指定該提供者的靜態 OAuth 設定。這些設定由 [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) 類別表示，並允許 Ktor 自動向 OAuth 伺服器發出請求。對於靜態提供者配置，建議優先使用 `settings` 而非 `providerLookup`，因為這也能讓 Ktor 推論所產生之 [OpenAPI 規格](openapi-spec-generation.md)的元資料。
* `fallback` 屬性透過重新導向或自訂回應來處理 OAuth 流程中的錯誤。
* `client` 屬性指定 Ktor 向 OAuth 伺服器發送請求時所使用的 [HttpClient](#create-http-client)。

> 仍支援使用 `providerLookup` 屬性針對特定呼叫動態解析 OAuth 設定。當提供者設定取決於請求資料（例如特定租戶的憑據或端點）時，請使用該屬性。

### 步驟 3：新增登入路由 {id="login-route"}

配置好 `oauth` 提供者後，你需要在接受 `oauth` 提供者名稱的 `authenticate` 函式內部[建立受保護的登入路由](server-auth.md#authenticate-route)。當 Ktor 收到對此路由的請求時，它會自動重新導向至在[設定](#configure-oauth-provider)中定義的 `authorizeUrl`。

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 自動重新導向至 'authorizeUrl'
        }
    }
}
```

使用者將會看到授權頁面，其中列出 Ktor 應用程式所需的權限等級。這些權限取決於在[設定](#configure-oauth-provider)中指定的 `defaultScopes`。

### 步驟 4：新增重新導向路由 {id="redirect-route"}

除了登入路由之外，你還需要為 `urlProvider` 建立重新導向路由，如[步驟 2：配置 OAuth 提供者](#configure-oauth-provider)中所指定。

在此路由內部，你可以使用 `call.principal` 函式擷取 [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) 物件。`OAuthAccessTokenResponse` 允許你存取 OAuth 伺服器傳回的權杖與其他參數。

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 自動重新導向至 'authorizeUrl'
            }

            get("/callback") {
                val currentPrincipal:
                    OAuthAccessTokenResponse.OAuth2? =
                        call.principal()
                // 如果在授權前未找到 url，則重新導向至首頁
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        val session = UserSession(
                            state,
                            principal.accessToken
                        )
                        call.sessions.set(session)
                        redirects.remove(state)?.let { url ->
                            call.respondRedirect(url)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/home")
            }
        }
    }
```

在此範例中，接收到權杖後會執行以下操作：

* 將權杖儲存在 [Session](server-sessions.md) 中，其內容可在其他路由中存取。
* 將使用者重新導向至下一個發送 Google API 請求的路由。
* 如果找不到請求的路由，則將使用者重新導向至 `/home` 路由。

### 步驟 5：向 API 發出請求 {id="request-api"}

在[重新導向路由](#redirect-route)中收到權杖並將其儲存至工作階段後，你便可以使用此權杖向外部 API 發出請求。下方的程式碼片段展示如何使用 [HttpClient](#create-http-client) 發出此類請求，並透過在 `Authorization` 標頭中傳送此權杖來取得使用者的資訊。

建立名為 `getPersonalGreeting` 的新函式，該函式將發出請求並傳回回應主體：

```kotlin
private suspend fun getPersonalGreeting(
    httpClient: HttpClient,
    userSession: UserSession
): UserInfo = httpClient.get(
    "https://www.googleapis.com/oauth2/v2/userinfo"
) {
    headers {
        val bearer = "Bearer ${userSession.token}"
        append(HttpHeaders.Authorization, bearer)
    }
}.body()
```

接著，你可以在 `get` 路由內呼叫該函式以擷取使用者資訊：

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo =
            getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

如需完整的可執行範例，請參閱 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。