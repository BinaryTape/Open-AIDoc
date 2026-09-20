[//]: # (title: OAuth 2.0 流)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>、<code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
类型化 OAuth 2.0 流会安装其自身的登录和回调路由，并可通过类型化会话保持用户的登录状态。
</link-summary>

Ktor 提供了两个类型化 OAuth 2.0 流，作为[类型安全认证方案 API](server-typed-auth.md) 的一部分：

* `oauth2Session`：让用户登录、存储会话，并为您提供用于保护应用程序路由的方案。除非有特殊原因，否则建议使用此流。
* `oauth2`：让用户登录并在回调中向您提供令牌。它不会保护后续路由。

流并不是传递给 `authenticateWith()` 的方案。它是一个通过 `install()` 安装到路由中的值，会自动为您创建登录和回调路由。

<note>
    <p>
        类型安全认证方案 API 目前处于实验阶段。它可能会随时被废弃或更改。需要显式启用（Opt-in）。有关更多详细信息，请参阅<a href="server-typed-auth.md#prerequisites">启用该 API</a>。
    </p>
</note>

> 本主题介绍类型化 API。关于传统的 `oauth` 提供程序，请参阅 [OAuth](server-oauth.md)。
>
{style="note"}

## 流的工作原理 {id="flow"}

1. 用户访问登录路径。Ktor 将其重定向至 OAuth 提供商。
2. 用户在提供商处批准所请求的权限。
3. 提供商通过授权码重定向回您的回调路径。
4. Ktor 将该授权码兑换为访问令牌。
5. 对于 `oauth2Session`，Ktor 会存储会话并解析主体（principal），然后运行您的回调处理程序。

## 使用 oauth2Session 让用户登录 {id="oauth2-session"}

流需要一个 [HttpClient](client-create-and-configure.md) 来调用提供商的令牌端点，因此还需要添加一个客户端引擎依赖项，例如 `io.ktor:ktor-client-cio`。

声明两个类型：路由使用的主体，以及 Ktor 为调用方存储的会话。

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

然后创建流。请注意类型实参的顺序：主体在前，会话在后。

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

`sessions` 代码块承担两项任务：

* `sessionCreator` 将令牌响应转换为您要存储的会话。它仅在令牌交换完成后运行一次。
* `validate` 将存储的会话转换为主体。针对受保护路由的每个请求都会运行该函数。

两者均为必需项。

安装该流并使用 `flow.session` 保护您的路由：

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

`install()` 会创建登录路由、创建回调路由，并为会话方案安装 [Sessions](server-sessions.md) 插件。您无需自行安装 `Sessions`。

在受保护路由内部，`call.principal` 为您的 `User`，而 `call.session` 为您的 `UserSession`。有关会话支持的所有功能，请参阅[类型安全会话认证](server-typed-session-auth.md)。

## 受保护的路由不会重定向 {id="redirects"}

由流为您创建的路由（登录路径和回调路径）会将未认证的访问者重定向至 OAuth 提供商。但通过 `authenticateWith(flow.session)` 保护的路由**不会**进行重定向。没有有效会话的请求将收到 `401 Unauthorized`。

将用户引导至提供商的方式有两种：

* 从登录页面链接至 `loginPath`。
* 在缺少会话时自行进行重定向：

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

流上的 `onUnauthorized` 处理 OAuth 错误，例如用户拒绝授权、令牌交换失败、`sessionCreator` 或 `validate` 返回 `null`：

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 使用多个提供商 {id="provider-lookup"}

设置 `providerLookup` 而非 `settings`，以便按请求选择提供商。该代码块在路由上下文中运行，因此您可以读取路径、查询形参或标头：

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

设置 `settings` 或 `providerLookup` 之一即可，不要同时设置。

## 在不使用会话的情况下登录 {id="oauth2"}

当您不需要 Ktor 来保护后续路由时（例如在登录后签发自己的 JWT），请使用 `oauth2`。回调处理程序会接收令牌响应：

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

此处没有 `flow.session`，因此没有任何内容可传递给 `authenticateWith()`。请使用其他方案来保护您的路由，例如 [`jwt`](server-jwt.md)。

## 安全注意事项 {id="security"}

* 切勿将 `clientSecret` 保留在源代码管理中。应从环境变量或[配置文件](server-configuration-file.topic)中读取。
* 回调会将该会话存储在新生成的会话 ID 下，并舍弃随回调请求传入的任何会话 ID。这样可以防止会话固定攻击（session fixation）。
* 默认的会话传输机制会将数据保留在服务器端，并仅向客户端发送一个 ID。如果切换为按值传输机制，请添加转换器。请参阅[选择传输机制](server-typed-session-auth.md#transport)。

## 后续步骤 {id="next"}

* [类型安全认证](server-typed-auth.md)介绍了角色、可选认证以及该 API 的其余功能。
* [类型安全会话认证](server-typed-session-auth.md)介绍了会话、传输机制以及用户注销。
* [OpenID Connect](server-oidc.md) 根据 OpenID Connect 签发者 URL 为您自动配置这些流。