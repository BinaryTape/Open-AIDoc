[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-oauth-google"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

[OAuth](https://oauth.net/) 是用于访问委托的开放标准。OAuth 可用于通过外部提供商（例如 Google、Facebook、Twitter 等）对应用程序的用户进行授权。

`oauth` 提供程序支持授权码流程（authorization code flow）。您可以在一个位置配置 OAuth 参数，Ktor 会自动使用必要的参数向指定的授权服务器发起请求。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)部分获取有关 Ktor 中身份验证与授权的通识信息。

> Ktor 还提供了类型化的 OAuth 2.0 流程。无需配置具名提供程序，您只需创建一个流程值并安装它，Ktor 便会为您创建登录和回调路由。`oauth2Session` 流程还为您提供了一种在登录后保护应用程序路由的方案。请参阅 [OAuth 2.0 流程](server-oauth2-flows.md)。
>
{style="tip"}

> 如果您的提供商支持 OpenID Connect，`Oidc` 插件的功能更为强大。它会读取提供商的发现文档（discovery document），因此您可以配置颁发者（issuer）URL，而无需配置授权、令牌和 JWKS 端点，并且它会为您处理 PKCE、ID 令牌验证、会话以及退出登录。请参阅 [OpenID Connect](server-oidc.md)。
>
{style="tip"}

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请在构建脚本中添加 <code>%artifact_name%</code> 工件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上面的代码片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上面的代码片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 Sessions 插件 {id="install-the-sessions-plugin"}

为了避免客户端每次尝试访问受保护资源时都需要请求授权，您可以在授权成功后将访问令牌存储在会话中。
然后，您可以在受保护路由的处理程序内从当前会话中检索访问令牌，并使用它来请求资源。

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

## OAuth 授权流程 {id="flow"}

Ktor 应用程序中的 OAuth 授权流程大致如下：

1. 用户在 Ktor 应用程序中打开登录页面。
2. Ktor 自动重定向到特定提供商的授权页面，并传递必要的[参数](#configure-oauth-provider)：
    * 用于访问所选提供商 API 的客户端 ID。
    * 指定授权完成后将打开的 Ktor 应用程序页面的回调或重定向 URL。
    * Ktor 应用程序所需的第三方资源作用域。
    * 用于获取访问令牌的授权类型（Authorization Code）。
    * 用于缓解 CSRF 攻击并重定向用户的 `state` 参数。
    * 特定提供商的可选参数。
3. 授权页面显示一个许可同意屏幕，列出 Ktor 应用程序所需的权限级别。这些权限取决于指定的作用域，如[步骤 2：配置 OAuth 提供程序](#configure-oauth-provider)中所配置。
4. 如果用户批准所请求的权限，授权服务器将重定向回指定的重定向 URL，并发送授权码。
5. Ktor 会向指定的访问令牌 URL 再次发起一次自动请求，其中包含以下参数：
    * 授权码。
    * 客户端 ID 和客户端密钥。

   授权服务器通过返回访问令牌进行响应。
6. 随后客户端可以使用此令牌向所选提供商的所需服务发出请求。在大多数情况下，令牌将使用 `Bearer` 方案在 `Authorization` 请求头中发送。
7. 服务验证该令牌，使用其作用域进行授权，并返回所请求的数据。

## 安装 OAuth {id="install"}

要安装 `oauth` 身份验证提供程序，请在 `install` 块内部调用 [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 函数。或者，您也可以[指定提供程序名称](server-auth.md#provider-name)。
例如，要安装名称为 "auth-oauth-google" 的 `oauth` 提供程序，代码如下所示：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // 配置 oauth 身份验证
            urlProvider = { "http://localhost:8080/callback" }
            client = httpClient
        }
    }
}
```

## 配置 OAuth {id="configure-oauth"}

本节演示如何配置 `oauth` 提供程序以使用 Google 对应用程序的用户进行授权。
有关完整的可运行示例，请参阅 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

### 先决条件：创建授权凭据 {id="authorization-credentials"}

要访问 Google API，您需要在 Google Cloud Console 中创建授权凭据。

1. 在 Google Cloud Console 中打开[凭据 (Credentials)](https://console.cloud.google.com/apis/credentials) 页面。
2. 点击 **CREATE CREDENTIALS**（创建凭据）并选择 `OAuth client ID`。
3. 从下拉菜单中选择 `Web application`。
4. 指定以下设置：
    * **已获授权的 JavaScript 来源**：`http://localhost:8080`。
    * **已获授权的重定向 URI**：`http://localhost:8080/callback`。
      在 Ktor 中，[urlProvider](#configure-oauth-provider) 属性用于指定授权完成时将打开的重定向路由。

5. 点击 **CREATE**。
6. 在弹出的对话框中，复制生成的客户端 ID 和客户端密钥，它们将用于配置 `oauth` 提供程序。

### 步骤 1：创建 HTTP 客户端 {id="create-http-client"}

在配置 `oauth` 提供程序之前，您需要创建服务器向 OAuth 服务器发起请求所用的 [HttpClient](client-create-and-configure.md)。需要包含 JSON 序列化器的 [ContentNegotiation](client-serialization.md) 客户端插件，以便[在请求 API 后](#request-api)对接收到的 JSON 数据进行反序列化。

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

客户端实例被传递给 `main` [模块函数](server-modules.md)，以便能够在服务器[测试](server-testing.md)中创建单独的客户端实例。

```kotlin
fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
}
```

### 步骤 2：配置 OAuth 提供程序 {id="configure-oauth-provider"}

下面的代码片段展示了如何创建并配置名为 `auth-oauth-google` 的 `oauth` 提供程序。
对于具有固定 OAuth 设置的提供程序，请使用 `settings` 属性。

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
        // 配置 oauth 身份验证
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
                    // 保存新状态与重定向 URL
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

* `urlProvider` 指定在授权完成时调用的[重定向路由](#redirect-route)。
  > 请确保已将该路由添加到[**已获授权的重定向 URI**](#authorization-credentials)列表中。
* `settings` 属性指定提供程序的静态 OAuth 设置。这些设置由 [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) 类表示，并允许 Ktor 自动向 OAuth 服务器发起请求。对于静态提供程序配置，推荐使用 `settings` 而不是 `providerLookup`，因为这还允许 Ktor 为生成的 [OpenAPI 规范](openapi-spec-generation.md)推断元数据。
* `fallback` 属性通过使用重定向或自定义响应来处理 OAuth 流程错误。
* `client` 属性指定 Ktor 向 OAuth 服务器发起请求所使用的 [HttpClient](#create-http-client)。

> 动态解析特定调用的 OAuth 设置时仍然支持 `providerLookup` 属性。当提供程序配置依赖于请求数据（例如租户特定的凭据或端点）时，请使用该属性。

### 步骤 3：添加登录路由 {id="login-route"}

配置好 `oauth` 提供程序后，您需要在接收 `oauth` 提供程序名称的 `authenticate` 函数内部[创建受保护的登录路由](server-auth.md#authenticate-route)。当 Ktor 收到对该路由的请求时，将自动重定向到 [settings](#configure-oauth-provider) 中定义的 `authorizeUrl`。

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 自动重定向到 'authorizeUrl'
        }
    }
}
```

用户将看到授权页面，其中显示 Ktor 应用程序所需的权限级别。这些权限取决于 [settings](#configure-oauth-provider) 中指定的 `defaultScopes`。

### 步骤 4：添加重定向路由 {id="redirect-route"}

除登录路由外，您还需要为 `urlProvider` 创建重定向路由，如[步骤 2：配置 OAuth 提供程序](#configure-oauth-provider)中所指定。

在该路由内部，您可以使用 `call.principal` 函数检索 [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) 对象。`OAuthAccessTokenResponse` 允许您访问令牌以及 OAuth 服务器返回的其他参数。

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 自动重定向到 'authorizeUrl'
            }

            get("/callback") {
                val currentPrincipal:
                    OAuthAccessTokenResponse.OAuth2? =
                        call.principal()
                // 如果在授权前找不到 URL，则重定向到主页
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

在此示例中，收到令牌后将执行以下操作：

* 将令牌保存在[会话](server-sessions.md)中，其内容可以在其他路由内部进行访问。
* 用户被重定向到下一个发出 Google API 请求的路由。
* 如果未找到所请求的路由，用户将被重定向到 `/home` 路由。

### 步骤 5：向 API 发起请求 {id="request-api"}

在[重定向路由](#redirect-route)内部收到令牌并将其保存到会话后，您可以使用此令牌向外部 API 发起请求。下面的代码片段演示了如何使用 [HttpClient](#create-http-client) 发起此类请求，并通过在 `Authorization` 请求头中发送该令牌来获取用户信息。

创建一个名为 `getPersonalGreeting` 的新函数，该函数将发起请求并返回响应体：

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

然后，您可以在 `get` 路由内调用该函数以检索用户信息：

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

有关完整的可运行示例，请参阅 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。