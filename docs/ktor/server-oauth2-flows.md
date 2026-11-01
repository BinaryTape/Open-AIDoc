[//]: # (title: OAuth 2.0 流程)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
类型化的 OAuth 2.0 流程会安装其自有的登录和回调路由，并可以通过类型化会话保持用户的登录状态。
</link-summary>

Ktor 在[类型安全身份验证方案 API](server-typed-auth.md) 中提供了两种类型化的 OAuth 2.0 流程：

* `oauth2Session` 用于让用户登录、存储会话，并为你提供用于保护应用程序路由的方案。除非有特殊理由，否则建议使用此方案。
* `oauth2` 用于让用户登录并在回调中将令牌传递给你。它不会保护后续的路由。

流程并不是传递给 `authenticateWith()` 的方案。它是你 `install()` 到路由中的一个值，并且会自动为你创建登录和回调路由。

<note>
    <p>
        类型安全身份验证方案 API 为实验性功能。它可能随时被废弃或更改。需要显式选择启用（opt-in）。如需了解详情，请参阅
        <a href="server-typed-auth.md#prerequisites">类型安全身份验证文档</a>。
    </p>
</note>

> 本文介绍类型化 API。关于传统的 `oauth` 提供程序，请参阅 [OAuth](server-oauth.md)。
>
{style="note"}

## 流程工作原理 {id="flow"}

1. 用户访问登录路径。Ktor 将其重定向到 OAuth 提供程序。
2. 用户在提供程序处批准所请求的权限。
3. 提供程序携带授权码重定向回你的回调路径。
4. Ktor 使用该授权码交换访问令牌。
5. 对于 `oauth2Session`，Ktor 会存储会话并解析主体 (principal)，然后运行你的回调处理程序。

## 使用 oauth2Session 实现用户登录 {id="oauth2-session"}

流程需要一个 [HttpClient](client-create-and-configure.md) 来调用提供程序的令牌端点，因此还需要添加一个客户端引擎依赖项，例如 `io.ktor:ktor-client-cio`。

声明两个类型：路由所使用的主体，以及 Ktor 为调用方存储的会话。

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

然后创建该流程。请注意类型实参的顺序：主体在前，会话在后。

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

`sessions` 代码块承担两项工作：

* `sessionCreator` 将令牌响应转换为要存储的会话。它在完成令牌交换后立即运行一次。
* `validate` 将存储的会话转换为主体。它会在每次对受保护路由发起请求时运行。

两者都是必需的。

安装该流程并使用 `flow.session` 保护你的路由：

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

`install()` 会创建登录路由、创建回调路由，并为会话方案安装 [Sessions](server-sessions.md) 插件。你无需自行安装 `Sessions`。

在受保护的路由内部，`call.principal` 为你的 `User`，`call.session` 为你的 `UserSession`。有关可以对会话执行的所有操作，请参阅[类型安全会话身份验证](server-typed-session-auth.md)。

## 受保护的路由不会执行重定向 {id="redirects"}

流程为你创建的路由（登录路径和回调路径）会将未通过身份验证的访客重定向到 OAuth 提供程序。而使用 `authenticateWith(flow.session)` 保护的路由**不会**这样做。缺少有效会话的请求将收到 `401 Unauthorized`。

你可以通过两种方式将用户引导至提供程序：

* 从登录页面链接到 `loginPath`。
* 在缺少会话时自行重定向到该处：

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

## 处理登录失败 {id="errors"}

两个处理程序分别涵盖了登录可能失败的两种情况。

流程上的 `onUnauthorized` 用于处理 OAuth 错误，例如用户拒绝授权、令牌交换失败、`sessionCreator` 或 `validate` 返回 `null`：

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 使用多个提供程序 {id="provider-lookup"}

设置 `providerLookup` 而非 `settings`，可以根据每个请求选择相应的提供程序。该代码块在路由上下文中运行，因此你可以读取路径、查询参数或请求头：

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

请设置 `settings` 或 `providerLookup` 其中之一，切勿同时设置。

## 无会话登录 {id="oauth2"}

当你不需要 Ktor 保护后续路由时（例如，在登录后自行签发 JWT），请使用 `oauth2`。回调处理程序会接收令牌响应：

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

此处没有 `flow.session`，因此没有任何内容可传递给 `authenticateWith()`。请使用其他方案保护你的路由，例如 [`jwt`](server-jwt.md)。

## 安全注意事项 {id="security"}

* 切勿将 `clientSecret` 纳入源代码管理中。应从环境变量或你的[配置文件](server-configuration-file.topic)中读取它。
* 回调会将该会话存储在一个新生成的会话 ID 下，并丢弃随回调请求一同传来的任何会话 ID。这可以防止会话固定（session fixation）攻击。
* 默认的会话传输机制会将会话数据保存在服务器端，且仅向客户端发送一个 ID。如果切换为按值传输（by-value transport），请添加一个转换器。参见[选择传输机制](server-typed-session-auth.md#transport)。

## 后续步骤 {id="next"}

* [类型安全身份验证](server-typed-auth.md)涵盖了角色、可选身份验证以及该 API 的其余部分。
* [类型安全会话身份验证](server-typed-session-auth.md)涵盖了会话、传输机制以及用户退出登录。
* [OpenID Connect](server-oidc.md) 可根据 OpenID Connect 签发者 URL 自动为你配置这些流程。