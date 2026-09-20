[//]: # (title: 类型安全身份验证)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
类型安全身份验证方案 API 将主体类型绑定到路由，因此无需转换或进行 null 检查即可读取非 null 主体。
</link-summary>

Ktor 提供了一个类型安全身份验证方案 API，用于将身份验证方案绑定到主体类型。只需创建一次方案，将其传递给路由，即可读取主体，而无需进行转换或 null 检查。

> 该 API 是 [`install(Authentication)`](server-auth.md) 方式的替代方案。两种 API 可以在同一个应用程序中使用，并且可以将使用一种 API 的路由嵌套在使用另一种 API 的路由中。
> 
{style="tip"}

## 添加依赖项 {id="add_dependencies"}

要使用类型化身份验证，请将 `ktor-server-auth` 工件添加到构建脚本中：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

如果使用 `jwt` 方案，请添加 `ktor-server-auth-jwt` 工件：

<var name="artifact_name" value="ktor-server-auth-jwt"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

如果使用 `apiKey` 方案，请添加 `ktor-server-auth-api-key` 工件：

<var name="artifact_name" value="ktor-server-auth-api-key"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 启用 API {id="prerequisites"}

该 API 带有 `@ExperimentalKtorApi` 标记，因此必须显式选择启用：

```kotlin
@OptIn(ExperimentalKtorApi::class)
fun Application.module() {
    // ...
}
```

路由构建器使用 Kotlin [上下文形参](https://kotlinlang.org/docs/context-parameters.html)。Kotlin 2.4.0 默认启用上下文形参。在 Kotlin 2.2.x 或 2.3.x 中，请在构建脚本中启用它们：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}
```

## 定义主体 {id="principal"}

主体代表应用程序与已验证调用方关联的身份或其他信息。主体类型必须为非 null。

```kotlin
data class User(
    val id: String,
    val email: String
)
```

## 创建方案 {id="create-scheme"}

每种身份验证方法都提供了一个工厂函数，该函数接收主体类型、名称和配置块。`validate {}` 块返回主体类型，在凭据被拒绝时返回 `null`：

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    realm = "my-app"
    verifier(jwkProvider, issuer)
    validate { credential ->
        val payload = credential.payload
        User(
            id = payload.subject,
            email = payload.getClaim("email").asString()
        )
    }
}
```

该工厂会返回一个值。将其存储并传递给需要它的路由。

| 工厂                                | 工件                       | 说明                                    |
|-------------------------------------|----------------------------|-----------------------------------------|
| `basic<P>()`                        | `ktor-server-auth`         | 参见 [Ktor Server 中的 Basic 身份验证](server-basic-auth.md)            |
| `digest<P>()`                       | `ktor-server-auth`         | 仅限 JVM。参见 [Ktor Server 中的 Digest 身份验证](server-digest-auth.md) |
| `bearer<P>()`                       | `ktor-server-auth`         | 参见 [Ktor Server 中的 Bearer 身份验证](server-bearer-auth.md)           |
| `form<P>()`                         | `ktor-server-auth`         | 参见 [Ktor Server 中基于表单的身份验证](server-form-based-auth.md)       |
| `session<S, P>()`                   | `ktor-server-auth`         | 参见 [类型安全会话身份验证](server-typed-session-auth.md)    |
| `apiKey<P>()`                       | `ktor-server-auth-api-key` | 参见 [API Key 身份验证](server-api-key-auth.md)          |
| `jwt<P>()`                          | `ktor-server-auth-jwt`     | 仅限 JVM。参见 [JSON Web Token](server-jwt.md)         |
| `oauth2()`, `oauth2Session<P, S>()` | `ktor-server-auth`         | 参见 [OAuth 2.0 流程](server-oauth2-flows.md)          |

方案名称必须是唯一的。如果创建两个同名的不同方案，则当路由尝试使用第二个方案时将会失败。

## 保护路由 {id="protect-routes"}

要保护路由，请将方案传递给 `authenticateWith()` 函数。在代码块内，`call.principal` 具有该方案所定义的主体类型，并保证为非 null：

```kotlin
routing {
    authenticateWith(jwtAuth) {
        get("/profile") {
            val user: User = call.principal
            call.respondText(user.email)
        }
    }
}
```

## 将身份验证设为可选 {id="optional"}

当某个路由需要同时为已登录用户和匿名调用方提供服务时，请使用 `authenticateWithOptional()` 函数。在代码块内，使用 `call.principalOrNull` 访问主体：

```kotlin
routing {
    authenticateWithOptional(jwtAuth) {
        get("/me") {
            val user = call.principalOrNull
            call.respondText(user?.email ?: "anonymous")
        }
    }
}
```

不带凭据的请求会成功处理，并将 `call.principalOrNull` 保持为 `null`。带有无效凭据的请求仍会失败。

## 接受多个方案 {id="any-of"}

使用 `authenticateWithAnyOf()` 函数可以在同一路由上接受多个方案。Ktor 会按照列出的顺序尝试各个方案，第一个成功的方案将提供主体。

所有方案产生的主体都必须符合一个通用类型，并在调用时声明该类型：

```kotlin
interface AppUser {
    val email: String
}

data class JwtUser(
    override val email: String,
    val id: String
) : AppUser

data class ApiUser(override val email: String) : AppUser

val jwtScheme = jwt<JwtUser>("my-jwt") { /* ... */ }
val apiKeyScheme = apiKey<ApiUser>("my-api-key") { /* ... */ }

routing {
    // AppUser is 
    authenticateWithAnyOf<AppUser>(jwtScheme, apiKeyScheme) {
        get("/profile") {
            call.respondText(call.principal.email)
        }
    }
}
```

> 在 `authenticateWithAnyOf()` 内，仅 `call.principal` 可用。属于单个方案的额外内容（例如[会话方案](server-typed-session-auth.md)中的 `call.session`）不可用。
>
{style="note"}

## 允许匿名调用方 {id="anonymous"}

使用 `orAnonymous()` 函数可以构建一个为无凭据调用方提供服务的方案。无凭据的请求将获取代码块返回的主体。带有无效凭据的请求仍会失败。

其结果是一个方案，其主体类型为两者的公共超类型：

```kotlin
interface Identity

data class AuthenticatedUser(val id: String) : Identity
data class GuestUser(val label: String = "guest") : Identity

val feedAuth = jwt<AuthenticatedUser>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential ->
        AuthenticatedUser(credential.payload.subject)
    }
}.orAnonymous { GuestUser() }

routing {
    authenticateWith(feedAuth) {
        get("/feed") {
            when (val user = call.principal) {
                is AuthenticatedUser ->
                    call.respondText(user.id)
                is GuestUser ->
                    call.respondText(user.label)
            }
        }
    }
}
```

## 转换主体 {id="map-principal"}

使用 `mapPrincipal()` 函数可以将主体转换为另一种类型，例如通过从数据库加载用户记录：

```kotlin
data class AppUser(val id: String, val email: String)

val appAuth = jwtAuth.mapPrincipal { jwtUser ->
    userDirectory.find(jwtUser.id)?.let { row ->
        AppUser(id = row.id, email = row.email)
    }
}
```

该转换仅在方案生成主体后运行。如果转换返回 `null`，请求将被拒绝并返回 `401 Unauthorized`。

## 检查角色 {id="roles"}

角色检查是可选的。定义一个实现 `AuthenticationRole` 的角色类型，然后使用 `withRoles()` 构建感知角色的方案：

```kotlin
enum class Role : AuthenticationRole {
    User, Admin, Moderator
}

val roleAuth = jwtAuth.withRoles { user ->
    roleService.resolveRoles(user.id)
}
```

`withRoles {}` 块会在身份验证成功后针对每个请求运行。可以使用它从数据库、缓存或主体本身加载角色。

使用 `roles` 形参声明路由所需的角色：

```kotlin
routing {
    authenticateWith(roleAuth, roles = setOf(Role.Admin)) {
        get("/admin") {
            val userRoles: Set<Role> = call.principal.roles
            call.respondText(userRoles.joinToString { it.name })
        }
    }
}
```

通过身份验证但缺少所需角色的调用方将收到 `403 Forbidden`。调用方必须具备集合中的所有角色，而不仅仅是其中之一。

传递 `roles = null` 可以解析角色而不需要任何特定角色。当处理程序自行做出判断时，这非常有用：

```kotlin
authenticateWith(roleAuth, roles = null) {
    get("/dashboard") {
        if (Role.Admin in call.principal.roles) {
            call.respondText("admin view")
        } else {
            call.respondText("user view")
        }
    }
}
```

`roles` 属性仅存在于感知角色的路由中。在受普通方案保护的路由中，它将无法编译。

## 处理失败 {id="failures"}

可能出现两种错误情况，并且它们是分别处理的：

* `onUnauthorized` 在身份验证失败时运行。默认响应为 `401 Unauthorized`。
* `onForbidden` 在身份验证成功但调用方缺少所需角色时运行。默认响应为 `403 Forbidden`。

在方案上设置处理程序以覆盖使用该方案的所有路由：

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential -> /* ... */ }
    onUnauthorized = { cause ->
        val message = cause.toString()
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}

val roleAuth = jwtAuth.withRoles(
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Not allowed", status = forbidden)
    }
) { user ->
    roleService.resolveRoles(user.id)
}
```

或者在单个路由上设置处理程序，这将覆盖方案级别的处理程序：

```kotlin
authenticateWith(
    roleAuth,
    roles = setOf(Role.Admin),
    onUnauthorized = { call.respondRedirect("/login") },
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Admins only", status = forbidden)
    },
) {
    get("/admin") {
        call.respondText(call.principal.email)
    }
}
```

Ktor 按以下顺序查找未授权处理程序：

1. 传递给 `authenticateWith()` 的处理程序。
2. 在方案上配置的 `onUnauthorized` 处理程序。
3. 提供程序的默认质询。

如果它们都没有响应，请求将失败并返回 `401 Unauthorized`。

对于 `authenticateWithAnyOf()`，处理程序会接收方案名称到失败原因的映射，因此可以报告每个方案失败的原因：

```kotlin
authenticateWithAnyOf<AppUser>(
    jwtScheme,
    apiKeyScheme,
    onUnauthorized = { failures ->
        val schemes = failures.keys.joinToString()
        call.respond(HttpStatusCode.Unauthorized, schemes)
    }
) {
    get("/profile") { /* ... */ }
}
```

## 与经典 API 结合使用 {id="mixing"}

两种身份验证 API 可以在同一个应用程序中使用。可以将类型安全路由嵌套在由命名提供程序 API 保护的路由中，也可以将基于提供程序的路由嵌套在类型安全路由中：

```kotlin
routing {
    authenticate("auth-session") {
        authenticateWith(basicAuth) {
            get("/admin") {
                val basicUser = call.principal
                val sessionUser = 
                    checkNotNull(call.principal<SessionUser>())
                if (basicUser.name == sessionUser.name) {
                    call.respondText("You are ${basicUser.name}!")
                } else {
                    call.respondText("Who are you?")
                }
            }
        }
    }

    authenticate(basicAuth.name) {
        get("/hello") {
            val user = checkNotNull(call.principal<BasicUser>())
            call.respondText("Hello ${user.name}!")
        }
    }
}
```

嵌套的身份验证层将按顺序应用。

## 限制 {id="limitations"}

* 该 API 为实验性功能。它可能会在次要版本中发生更改。
* 该 API 使用 Kotlin 上下文形参，需要 Kotlin 2.4.0 或 `-Xcontext-parameters` 编译器选项。
* `authenticateWithAnyOf()` 函数仅提供 `call.principal`。特定于方案的属性（如 `call.session`）在其中不可用。
* 没有与 LDAP 提供程序等效的类型安全版本。请改为在类型化的 `validate {}` 块内调用 [`ldapAuthenticate()`](server-ldap.md)。