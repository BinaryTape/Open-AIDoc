[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>

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
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生服务器</Links>支持</b>：✅
</p>
</tldr>

[OAuth](https://oauth.net/) 是一种用于访问委托的开放标准。OAuth 可用于通过 Google、Facebook、Twitter 等外部提供程序来授权应用程序的用户。

`oauth` 提供程序支持授权码流。您可以在一个地方配置 OAuth 参数，Ktor 将自动使用必要的参数向指定的授权服务器发起请求。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)章节中获取有关 Ktor 身份验证与授权的一般信息。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
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

## 安装 Sessions 插件

为了避免客户端每次尝试访问受保护资源时都请求授权，您可以在授权成功后将访问令牌存储在会话中。
然后，您可以在受保护路由的处理程序中从当前会话中检索访问令牌，并使用它来请求资源。

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

## OAuth 授权流 {id="flow"}

Ktor 应用程序中的 OAuth 授权流可能如下所示：

1. 用户在 Ktor 应用程序中打开登录页面。
2. Ktor 自动重定向到特定提供程序的授权页面，并传递必要的[参数](#configure-oauth-provider)：
    * 客户端 ID：用于访问所选提供程序的 API。
    * 回调或重定向 URL：指定授权完成后将打开的 Ktor 应用程序页面。
    * 作用域（Scopes）：Ktor 应用程序所需的第三方资源权限范围。
    * 授权类型（grant type）：用于获取访问令牌（授权码）。
    * `state` 参数：用于缓解 CSRF 攻击并重定向用户。
    * 特定提供程序的其他可选参数。
3. 授权页面会显示一个同意屏幕，列出 Ktor 应用程序所需的权限级别。这些权限取决于[步骤 2：配置 OAuth 提供程序](#configure-oauth-provider)中所配置的作用域。
4. 如果用户批准了请求的权限，授权服务器将重定向回指定的重定向 URL 并发送授权码。
5. Ktor 会向指定的访问令牌 URL 再次发起自动请求，包含以下参数：
    * 授权码。
    * 客户端 ID 和客户端密钥。

   授权服务器通过返回访问令牌进行响应。
6. 客户端随后可以使用此令牌向所选提供程序的所需服务发起请求。在大多数情况下，令牌会使用 `Bearer` 架构在 `Authorization` 标头中发送。
7. 服务验证令牌，使用其作用域进行授权，并返回请求的数据。

## 安装 OAuth {id="install"}

要安装 `oauth` 身份验证提供程序，请在 `install` 块内调用 [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 函数。此外，您可以[指定提供程序名称](server-auth.md#provider-name)。
例如，安装名为 "auth-oauth-google" 的 `oauth` 提供程序如下所示：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // 配置 oauth 身份验证
            urlProvider = { "http://localhost:8080/callback" }
        }
    }
}
```

## 配置 OAuth {id="configure-oauth"}

本节演示如何配置 `oauth` 提供程序，以便通过 Google 授权应用程序的用户。
如需完整的可运行示例，请参阅 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

### 前提条件：创建授权凭据 {id="authorization-credentials"}

要访问 Google API，您需要在 Google Cloud Console 中创建授权凭据。

1. 打开 Google Cloud Console 中的 [Credentials](https://console.cloud.google.com/apis/credentials)（凭据）页面。
2. 点击 **CREATE CREDENTIALS**（创建凭据）并选择 `OAuth client ID`（OAuth 客户端 ID）。
3. 从下拉列表中选择 `Web application`（Web 应用程序）。
4. 指定以下设置：
    * **Authorised JavaScript origins**（已获授权的 JavaScript 来源）：`http://localhost:8080`。
    * **Authorised redirect URIs**（已获授权的重定向 URI）：`http://localhost:8080/callback`。
      在 Ktor 中，[urlProvider](#configure-oauth-provider) 属性用于指定授权完成后将打开的重定向路由。

5. 点击 **CREATE**（创建）。
6. 在弹出的对话框中，复制创建的客户端 ID 和客户端密钥，这些将用于配置 `oauth` 提供程序。

### 步骤 1：创建 HTTP 客户端 {id="create-http-client"}

在配置 `oauth` 提供程序之前，您需要创建 [HttpClient](client-create-and-configure.md)，服务器将使用它向 OAuth 服务器发起请求。需要带有 JSON 序列化程序的 [ContentNegotiation](client-serialization.md) 客户端插件，以便在[请求 API 后](#request-api)对收到的 JSON 数据进行反序列化。

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

客户端实例被传递到 `main` [模块函数](server-modules.md)，以便能够在服务器[测试](server-testing.md)中创建单独的客户端实例。

```kotlin
fun Application.main(httpClient: HttpClient = applicationHttpClient) {
}
```

### 步骤 2：配置 OAuth 提供程序 {id="configure-oauth-provider"}

下面的代码片段显示了如何创建并配置名为 `auth-oauth-google` 的 `oauth` 提供程序。

```kotlin
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // 配置 oauth 身份验证
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
                    // 保存带有重定向 url 值的新状态
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

* `urlProvider` 指定了授权完成后将调用的[重定向路由](#redirect-route)。
  > 请确保已将此路由添加到 [**Authorised redirect URIs**](#authorization-credentials) 列表中。
* `providerLookup` 允许您为所需提供程序指定 OAuth 设置。这些设置由 [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) 类表示，并允许 Ktor 自动向 OAuth 服务器发起请求。
* `fallback` 属性通过响应重定向或自定义响应来处理 OAuth 流错误。
* `client` 属性指定了 Ktor 用来向 OAuth 服务器发起请求的 [HttpClient](#create-http-client)。

### 步骤 3：添加登录路由 {id="login-route"}

配置 `oauth` 提供程序后，您需要在接受 `oauth` 提供程序名称的 `authenticate` 函数内部[创建一个受保护的登录路由](server-auth.md#authenticate-route)。当 Ktor 收到对该路由的请求时，它将自动重定向到 [providerLookup](#configure-oauth-provider) 中定义的 `authorizeUrl`。

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 自动重定向到 'authorizeUrl'
        }
    }
}
```

用户将看到授权页面以及 Ktor 应用程序所需的权限级别。这些权限取决于 [providerLookup](#configure-oauth-provider) 中指定的 `defaultScopes`。

### 步骤 4：添加重定向路由 {id="redirect-route"}

除了登录路由外，您还需要为 `urlProvider` 创建重定向路由，如[步骤 2：配置 OAuth 提供程序](#configure-oauth-provider)中所述。

在此路由内部，您可以使用 `call.principal` 函数检索 [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) 对象。`OAuthAccessTokenResponse` 允许您访问令牌以及由 OAuth 服务器返回的其他参数。

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 自动重定向到 'authorizeUrl'
            }

            get("/callback") {
                val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()
                // 如果在授权前找不到该 url，则重定向回主页
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

在此示例中，接收令牌后执行了以下操作：

* 令牌被保存在 [会话](server-sessions.md) 中，其内容可以在其他路由中访问。
* 用户被重定向到下一个发起 Google API 请求的路由。
* 如果未找到请求的路由，用户将被重定向到 `/home` 路由。

### 步骤 5：发起 API 请求 {id="request-api"}

在[重定向路由](#redirect-route)中收到令牌并将其保存到会话后，您可以使用此令牌向外部 API 发起请求。下面的代码片段显示了如何使用 [HttpClient](#create-http-client) 发起此类请求，并通过在 `Authorization` 标头中发送此令牌来获取用户信息。

创建一个名为 `getPersonalGreeting` 的新函数，它将发起请求并返回响应体：

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

然后，您可以在 `get` 路由中调用该函数来检索用户信息：

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo = getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

如需完整的可运行示例，请参阅 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。