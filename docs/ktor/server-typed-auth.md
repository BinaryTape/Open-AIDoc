[//]: # (title: 类型安全身份验证)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
类型安全身份验证方案 API 将主体类型绑定到路由，因此您无需进行类型转换或 null 检查即可读取非 null 主体。
</link-summary>

Ktor 提供了类型安全身份验证方案 API，可将身份验证方案绑定到主体类型。您只需创建一次方案，将其传递给路由，即可读取主体，无需类型转换或 null 检查。

> 此 API 是 [`install(Authentication)`](server-auth.md) 方式的替代方案。两种 API 均可在同一个应用程序中使用，并且您可以将使用其中一种 API 的路由嵌套在使用另一种 API 的路由内。
> 
{style="tip"}

## 添加依赖项 {id="add_dependencies"}

要使用类型化身份验证，请在构建脚本中添加 `ktor-server-auth` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

如果使用 `jwt` 方案，请添加 `ktor-server-auth-jwt` 构件：

<var name="artifact_name" value="ktor-server-auth-jwt"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.jwt"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

如果使用 `apiKey` 方案，请添加 `ktor-server-auth-api-key` 构件：

<var name="artifact_name" value="ktor-server-auth-api-key"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.apiKey"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 启用此 API {id="prerequisites"}

此 API 标有 `@ExperimentalKtorApi`，因此您必须显式选择启用：

```kotlin
@OptIn(ExperimentalKtorApi::class)
fun Application.module() {
    // ...
}
```

路由构建器使用 Kotlin [上下文形参 (context parameters)](https://kotlinlang.org/docs/context-parameters.html)。Kotlin 2.4.0 默认启用上下文形参。在 Kotlin 2.2.x 或 2.3.x 中，请在构建脚本中启用它们：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}
```

## 定义主体 {id="principal"}

主体 (Principal) 表示您的应用程序与已通过身份验证的调用方关联的身份或其他信息。主体类型必须为非 null。

```kotlin
data class User(
    val id: String,
    val email: String
)
```

## 创建方案 {id="create-scheme"}

每种身份验证方法都提供一个工厂函数，该函数接受主体类型、名称和配置代码块。`validate {}` 代码块返回您的主体类型，或者在凭据被拒绝时返回 `null`：

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

该工厂函数会返回一个值。请将其保存并传递给需要它的路由。

| 工厂函数                               | 构件                       | 说明                                    |
|-------------------------------------|----------------------------|-----------------------------------------|
| `basic<P>()`                        | `ktor-server-auth`         | 参阅 [Ktor Server 中的 Basic 身份验证](server-basic-auth.md)            |
| `digest<P>()`                       | `ktor-server-auth`         | 仅限 JVM。参阅 [Ktor Server 中的 Digest 身份验证](server-digest-auth.md) |
| `bearer<P>()`                       | `ktor-server-auth`         | 参阅 [Ktor Server 中的 Bearer 身份验证](server-bearer-auth.md)           |
| `form<P>()`                         | `ktor-server-auth`         | 参阅 [Ktor Server 中的基于表单的身份验证](server-form-based-auth.md)       |
| `session<S, P>()`                   | `ktor-server-auth`         | 参阅[类型安全 Session 身份验证](server-typed-session-auth.md)    |
| `apiKey<P>()`                       | `ktor-server-auth-api-key` | 参阅 [API Key 身份验证](server-api-key-auth.md)          |
| `jwt<P>()`                          | `ktor-server-auth-jwt`     | 仅限 JVM。参阅 [JSON Web Token](server-jwt.md)         |
| `oauth2()`, `oauth2Session<P, S>()` | `ktor-server-auth`         | 参阅 [OAuth 2.0 流程](server-oauth2-flows.md)          |

方案名称必须唯一。如果创建了两个同名的不同方案，则当路由尝试使用第二个方案时将会失败。

## 保护路由 {id="protect-routes"}

要保护路由，请将方案传递给 `authenticateWith()` 函数。在代码块内，`call.principal` 具有方案所定义的主体类型，并且保证为非 null：

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

## 使身份验证变为可选 {id="optional"}

当某个路由需要同时为已登录和匿名调用方提供服务时，请使用 `authenticateWithOptional()` 函数。在代码块内，使用 `call.principalOrNull` 访问主体：

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

不带凭据的请求会成功处理，且 `call.principalOrNull` 为 `null`。包含无效凭据的请求仍会失败。

## 接受多种方案 {id="any-of"}

使用 `authenticateWithAnyOf()` 函数可以在同一路由上接受多种方案。Ktor 会按照您列出方案的顺序依次尝试，第一个成功的方案将提供主体。

所有方案生成的主体必须符合一个通用类型，您可以在调用时声明该类型：

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

> 在 `authenticateWithAnyOf()` 内部，仅 `call.principal` 可用。属于单个方案的额外内容（例如[会话方案](server-typed-session-auth.md)中的 `call.session`）不可用。
>
{style="note"}

## 允许匿名调用方 {id="anonymous"}

使用 `orAnonymous()` 函数可以构建一个为没有凭据的调用方提供服务的方案。不带凭据的请求将获取您在代码块中返回的主体。包含无效凭据的请求仍会失败。

最终得到的方案，其主体类型是两者的公共超类型：

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

此转换仅在方案生成主体后才会运行。如果转换返回 `null`，请求将被拒绝并返回 `401 Unauthorized`。

## 检查角色 {id="roles"}

角色检查是可选启用的。定义一个实现 `AuthenticationRole` 的角色类型，然后使用 `withRoles()` 构建一个具有角色感知能力的方案：

```kotlin
enum class Role : AuthenticationRole {
    User, Admin, Moderator
}

val roleAuth = jwtAuth.withRoles { user ->
    roleService.resolveRoles(user.id)
}
```

`withRoles {}` 代码块在身份验证成功后针对每个请求运行。可用它从数据库、缓存或主体本身加载角色。

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

通过身份验证但缺少所需角色的调用方将收到 `403 Forbidden`。调用方必须具备集合中的所有角色，而不仅是其中之一。

传递 `roles = null` 可以在不要求任何角色的情况下解析角色。当处理程序需要自行决定时，这非常有用：

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

`roles` 属性仅在具有角色感知能力的路由中存在。在受普通方案保护的路由中，它将无法通过编译。

## 处理失败情况 {id="failures"}

可能会出现两种错误情况，它们会分别处理：

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

Ktor 会按以下顺序查找未授权处理程序：

1. 传递给 `authenticateWith()` 的处理程序。
2. 方案上配置的 `onUnauthorized` 处理程序。
3. 提供程序的默认质询。

如果它们均未响应，请求将失败并返回 `401 Unauthorized`。

对于 `authenticateWithAnyOf()`，处理程序会接收一个方案名称对应失败原因的映射，以便您可以报告每个方案失败的原因：

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

## 与传统 API 结合使用 {id="mixing"}

两种身份验证 API 均可在同一个应用程序中使用。您可以将类型安全路由嵌套在受命名提供程序 API 保护的路由中，也可以将基于提供程序的路由嵌套在类型安全路由中：

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

嵌套的身份验证层会按顺序应用。

## 限制 {id="limitations"}

* 该 API 处于实验阶段。它可能会在次要版本中发生更改。
* 该 API 使用了 Kotlin 上下文形参，需要 Kotlin 2.4.0 或 `-Xcontext-parameters` 编译器选项。
* `authenticateWithAnyOf()` 函数仅提供 `call.principal`。在其中无法使用方案特有的属性（如 `call.session`）。
* LDAP 提供程序没有对应的类型安全实现。请改为在类型化的 `validate {}` 代码块内调用 [`ldapAuthenticate()`](server-ldap.md)。