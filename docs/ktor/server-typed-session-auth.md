[//]: # (title: 类型安全的会话身份验证)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>、<code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
类型安全身份验证方案 API 的会话方案为路由提供了非 null 凭据，并支持对存储会话的读写访问。
</link-summary>

`session` 方案是[类型安全身份验证方案 API](server-typed-auth.md) 的一部分。它将命名提供程序的[会话身份验证](server-session-auth.md)组合在一起的两项内容分离开来：

* **会话 (session)** 是您为调用方存储的值，例如访问令牌或用户 ID。
* **凭据 (principal)** 是路由处理程序所处理的内容，例如完整的用户记录。

在受保护的路由内部，`call.session` 为您提供存储的会话，`call.principal` 为您提供凭据。两者均为非 null 且具有正确的类型。

<note>
    <p>
        类型安全身份验证方案 API 属于实验性功能。可能随时会被弃用或更改。
        使用需要选择启用 (Opt-in)。如需了解更多详情，请参阅
        <a href="server-typed-auth.md#prerequisites">启用 API</a>。
    </p>
</note>

## 创建会话方案 {id="create-scheme"}

`session<S, P>()` 工厂函数第一个参数接收会话类型，第二个参数接收凭据类型。`validate` 块用于将会话转换为凭据，或者返回 `null` 以拒绝该会话。

默认情况下，没有有效会话的请求会收到 `401 Unauthorized` 响应。对于浏览器应用程序，您可以将调用方重定向到登录页面。设置 `onUnauthorized` 处理程序以更改响应：

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

传递给 `authenticateWith()` 的处理程序会覆盖对应路由上的该处理程序。有关完整的优先级顺序，请参阅[处理失败](server-typed-auth.md#failures)。

## 选择传输方式 {id="transport"}

`transport` 属性控制会话在客户端与服务器之间的传输方式：

| 传输方式                            | 客户端持有的内容                       | 会话数据存放位置                      |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | Cookie 中的会话 ID                  | 在服务器上的 `SessionStorage` 中      |
| `SessionTransportType.HeaderId` | Header 中的会话 ID                  | 在服务器上的 `SessionStorage` 中      |
| `SessionTransportType.Cookie`   | Cookie 中序列化后的会话             | 在客户端                             |
| `SessionTransportType.Header`   | Header 中序列化后的会话             | 在客户端                             |

默认方式是基于内存存储的 `CookieId`，它将数据保存在服务器上：

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

`SessionStorageMemory` 在重启时会丢失所有内容，且不能在实例之间共享，因此仅适用于本地开发。
在生产环境中，请使用持久化存储（如 `directorySessionStorage()`）或您自定义的 `SessionStorage` 实现。

> `Cookie` 和 `Header` 传输方式会将实际会话值发送到客户端。该值代表调用方的身份，因此若缺乏保护措施，客户端可能会伪造该值并冒充任何人登录。如果使用按值传输方式，请添加类似 `SessionTransportTransformerEncrypt` 的转换器：
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

会话方案通过 [Sessions](server-sessions.md) 插件读取会话，因此必须在任何路由使用该方案之前安装该插件。将方案传递给 `install()`，Ktor 就会应用您配置的传输方式：

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

如果您自行配置 `Sessions`，请在配置块内部调用 `applyTransport()`，以便方案与插件在名称、类型和传输方式上保持一致：

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

如果缺少该插件，或者它没有与方案名称和会话类型匹配的提供程序，则该方案将在启动时失败。

## 读取和更改会话 {id="read-write"}

在受会话方案保护的路由内部，`call.session` 是一个可读写属性：

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

| 访问器                      | 用途                                                        |
|--------------------------|------------------------------------------------------------|
| `call.session`           | 读取或替换会话。                                             |
| `call.updateSession { }` | 读取会话，应用您的更改，存储结果并将其返回。                   |
| `call.clearSession()`    | 移除会话，这会退出调用方的登录状态。                           |

当新值依赖于旧值时，请使用 `updateSession`：

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

在 `authenticateWithOptional()` 内部可能根本不存在会话，因此 `call.session` 不可用。此时请使用 `call.sessionOrNull`：

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

## 登录与退出登录 {id="login-logout"}

方案上的 `setSession()` 和 `clearSession()` 可以在任何路由上工作，无论该路由是否受该方案保护。

登录应放置在不受该方案保护的路由上。因为调用方此时还没有会话，受保护的路由会在处理程序运行之前拒绝该请求：

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

## 在身份验证期间更新会话 {id="transform-session"}

使用 `transformSession` 可以在执行 `validate` 之前，作为身份验证过程的一部分更改存储的会话。这对于携带即将过期令牌的会话非常有用。

返回本次请求要使用的会话，或者返回 `null` 以拒绝它。仅当您返回的值与传入的值不同时，Ktor 才会将会话写回：

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

## 添加 CSRF 保护 {id="csrf"}

Cookie 传输方式会在每次请求时自动发送会话，包括由其他网站发起的请求。使用 `csrfProtection {}` 块为该方案保护的路由安装 [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) 插件：

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

> 要了解有关角色、可选身份验证以及该 API 其余部分的更多信息，请参阅[类型安全身份验证](server-typed-auth.md)。
> 
> 有关使用 `Sessions` 插件的更多详情，请参阅 [Sessions](server-sessions.md)。
> 
{style="tip"}