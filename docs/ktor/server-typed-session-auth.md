[//]: # (title: 类型安全的会话身份验证)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>、<code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
类型安全身份验证方案 API 的 session 方案为路由提供了非 null 主体以及对已存储 session 的读写访问权限。
</link-summary>

`session` 方案是[类型安全身份验证方案 API](server-typed-auth.md)的一部分。它分开了具名提供程序[会话身份验证](server-session-auth.md)中绑定在一起的两项内容：

* **session** 是为您调用方存储的值，例如访问令牌或用户 ID。
* **principal** 是路由处理程序所处理的内容，例如完整的用户记录。

在受保护的路由内部，`call.session` 为您提供已存储的 session，`call.principal` 为您提供 principal。两者均为非 null 且类型正确。

<note>
    <p>
        类型安全身份验证方案 API 是实验性的。它可能会随时被弃用或更改。
        需要选择启用（Opt-in）。有关更多详细信息，请参阅
        <a href="server-typed-auth.md#prerequisites">类型安全身份验证文档</a>。
    </p>
</note>

## 创建 session 方案 {id="create-scheme"}

`session<S, P>()` 工厂函数首先接收 session 类型，其次接收 principal 类型。`validate` 代码块将 session 转换为 principal，或者返回 `null` 以拒绝该 session。

默认情况下，缺少有效 session 的请求会收到 `401 Unauthorized`。对于浏览器应用程序，您可以改为将调用方重定向至登录页面。设置 `onUnauthorized` 处理程序即可更改该响应：

```kotlin
data class UserSession(val userId: String)
data class User(val id: String, val email: String)

val sessionAuth = session<UserSession, User>("auth-session") {
    validate { session ->
        userRepository.findById(session.userId)
    }
    onUnauthorized = {
        call.respondRedirect("/login")
    }
}
```

传递给 `authenticateWith()` 的处理程序会针对该路由覆盖此处理程序。有关完整的执行顺序，请参阅[处理失败](server-typed-auth.md#failures)。

## 选择传输方式 {id="transport"}

`transport` 属性控制 session 如何在客户端与服务器之间传输：

| 传输方式 | 客户端持有的内容 | session 数据的存放位置 |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | Cookie 中的 session ID | 服务器端的 `SessionStorage` 中 |
| `SessionTransportType.HeaderId` | 请求头中的 session ID | 服务器端的 `SessionStorage` 中 |
| `SessionTransportType.Cookie` | Cookie 中序列化的 session | 客户端 |
| `SessionTransportType.Header` | 请求头中序列化的 session | 客户端 |

默认是由内存存储支持的 `CookieId`，它将 session 数据保存在服务器上：

```kotlin
val storage = SessionStorageMemory()

val sessionAuth = session<UserSession, User>("auth-session") {
    transport = SessionTransportType.CookieId(storage) {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 3600
        cookie.httpOnly = true
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

`SessionStorageMemory` 在重启时会丢失所有内容，且不在实例之间共享，因此适用于本地开发。在生产环境中，请使用持久化存储，例如 `directorySessionStorage()`，或您自己的 `SessionStorage` 实现。

> `Cookie` 与 `Header` 传输方式会将 session 值发送至客户端。该值代表了调用方的身份，因此在没有保护的情况下，客户端可以伪造它并以任意身份登录。如果您使用按值（by-value）传输方式，请添加一个转换器，例如 `SessionTransportTransformerEncrypt`：
> ```kotlin
> val transformer = SessionTransportTransformerEncrypt(
>     encryptKey, 
>     signKey
> )
> transport = SessionTransportType.Cookie {
>     transform(transformer)
> }
> ```
>
{style="warning"}

## 安装 Sessions 插件 {id="install-sessions"}

session 方案通过 [Sessions](server-sessions.md) 插件读取 session，因此在任何路由使用该方案之前，必须先安装该插件。将该方案传递给 `install()`，Ktor 就会应用您配置的传输方式：

```kotlin
fun Application.module() {
    install(sessionAuth)

    routing {
        authenticateWith(sessionAuth) {
            get("/profile") {
                call.respondText(call.principal.email)
            }
        }
    }
}
```

您也可以将其安装在单个路由子树上：

```kotlin
routing {
    route("/app") {
        install(sessionAuth)

        authenticateWith(sessionAuth) {
            get("/profile") { /* ... */ }
        }
    }
}
```

如果您自行配置 `Sessions`，请在配置块内部调用 `applyTransport()`，以使方案和插件在名称、类型和传输方式上保持一致：

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

如果缺少该插件，或者该插件没有与方案名称和 session 类型相匹配的提供程序，方案将在启动时失败。

## 读取并更改 session {id="read-write"}

在受 session 方案保护的路由内部，`call.session` 是一个可读写属性：

```kotlin
routing {
    authenticateWith(sessionAuth) {
        get("/profile") {
            val session = call.session
            call.respondText("Signed in as ${session.userId}")
        }

        post("/switch-team") {
            val teamId = call.receiveText()
            call.session = call.session.copy(teamId = teamId)
            call.respondText("Switched")
        }
    }
}
```

在同一代码块中可以使用以下访问器：

| 访问器 | 用途 |
|--------------------------|----------------------------------------------------------------------------|
| `call.session` | 读取或替换 session。 |
| `call.updateSession { }` | 读取 session，应用更改，存储结果并将其返回。 |
| `call.clearSession()` | 移除 session，即注销调用方。 |

当新值依赖于旧值时，请使用 `updateSession`：

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

在 `authenticateWithOptional()` 内部，可能完全没有 session，因此 `call.session` 不可用。请改用 `call.sessionOrNull`：

```kotlin
routing {
    authenticateWithOptional(sessionAuth) {
        get("/greeting") {
            val message = when (call.sessionOrNull) {
                null -> "Hello, guest"
                else -> "Welcome back"
            }
            call.respondText(message)
        }
    }
}
```

## 用户登录与注销 {id="login-logout"}

方案上的 `setSession()` 与 `clearSession()` 可在任意路由上使用，无论该路由是否受此方案保护。

登录操作应位于不受该方案保护的路由上。因为调用方此时还没有 session，受保护的路由会在处理程序运行之前就拒绝该请求：

```kotlin
routing {
    post("/login") {
        val credentials = call.receive<LoginRequest>()
        val user = userRepository.authenticate(credentials)
            ?: return@post call.respond(
                HttpStatusCode.Unauthorized
            )

        sessionAuth.setSession(UserSession(userId = user.id))
        call.respondText("Signed in")
    }

    post("/logout") {
        sessionAuth.clearSession()
        call.respondText("Signed out")
    }
}
```

## 在身份验证期间更新 session {id="transform-session"}

使用 `transformSession` 在 `validate` 运行之前更改已存储的 session（作为身份验证的一部分）。这对于携带具有过期时间的令牌的 session 非常有用。

返回要用于本次请求的 session，或者返回 `null` 以拒绝它。仅当您返回的值与传入的值不同时，Ktor 才会将 session 写回：

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    transformSession { session ->
        if (session.expiresAt > Clock.System.now()) {
            session
        } else {
            tokenService.refresh(session.refreshToken)
        }
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

## 添加 CSRF 防护 {id="csrf"}

Cookie 传输方式会在每次请求中自动发送 session，包括从其他站点发起的请求。使用 `csrfProtection {}` 代码块为该方案所保护的路由安装 [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) 插件：

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    csrfProtection {
        allowOrigin("https://app.example.com")
        originMatchesHost()
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

> 要了解更多信息，请参阅[类型安全身份验证](server-typed-auth.md)了解角色、可选身份验证以及该 API 其余内容。
> 
> 有关使用 `Sessions` 插件的更多详细信息，请参阅 [Sessions](server-sessions.md)。
> 
{style="tip"}