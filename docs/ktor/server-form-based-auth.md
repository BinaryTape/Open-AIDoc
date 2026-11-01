[//]: # (title: Ktor Server 中的表单身份验证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

表单身份验证使用 [Web 表单](https://developer.mozilla.org/en-US/docs/Learn/Forms)收集凭据信息并对用户进行身份验证。
要在 Ktor 中创建 Web 表单，可以使用 [HTML DSL](server-html-dsl.md#html_response)，或者在 JVM [模板引擎](server-templating.md)（如 FreeMarker、Velocity 等）中进行选择。

> 鉴于在使用表单身份验证时用户名和密码以明文形式传输，你需要使用 [HTTPS/TLS](server-ssl.md) 来保护敏感信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `form` 身份验证，需要在构建脚本中包含 `%artifact_name%` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 表单身份验证流程 {id="flow"}

表单身份验证流程大致如下：

1. 未经身份验证的客户端向服务器应用程序中的特定[路由](server-routing.md)发起请求。
2. 服务器返回一个至少包含基于 HTML 的 Web 表单的 HTML 页面，提示用户输入用户名和密码。 
   > Ktor 允许你使用 [Kotlin DSL](server-html-dsl.md) 构建表单，或者也可以在各种 JVM 模板引擎（如 FreeMarker、Velocity 等）之间进行选择。
3. 当用户提交用户名和密码后，客户端向服务器发起包含 Web 表单数据（其中包括用户名和密码）的请求。
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   在 Ktor 中，你需要[指定形参名称](#configure-provider)，用于获取用户名和密码。

4. 服务器[验证](#configure-provider)客户端发送的凭据并响应所请求的内容。

## 安装表单身份验证 {id="install"}
要安装 `form` 身份验证提供程序，请在 `install` 块内调用 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    form {
        // 配置表单身份验证
    }
}
```

你可以选择指定[提供程序名称](server-auth.md#provider-name)，该名称可用于[对指定路由进行身份验证](#authenticate-route)。

## 配置表单身份验证 {id="configure"}

### 第 1 步：配置表单提供程序 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="命名提供程序" group-key="classic">

`form` 身份验证提供程序通过 [FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html) 类公开其设置。在以下示例中，指定了以下设置：
* `userParamName` 和 `passwordParamName` 属性指定用于获取用户名和密码的形参名称。
* `validate` 函数验证用户名和密码。
  `validate` 函数检查 `UserPasswordCredential`，并在身份验证成功时返回 `UserIdPrincipal`，若身份验证失败则返回 `null`。
* `challenge` 函数指定在身份验证失败时执行的操作。例如，你可以重定向回登录页面或发送 [UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            val message = "Credentials are not valid"
            val status = HttpStatusCode.Unauthorized
            call.respond(status, message)
        }
    }
}
```

</TabItem>
<TabItem title="类型安全" group-key="typed">

<note>
    <p>
        类型安全身份验证方案 API 是一项实验性功能。它可能会随时被移除或更改。
        需要显式选择启用 (Opt-in)。有关更多详情，请参阅
        <a href="server-typed-auth.md#prerequisites">类型安全身份验证文档</a>。
    </p>
</note>

`form()` 函数为你选择的 Principal 类型创建方案。无需 `install(Authentication)`
步骤：该方案是一个值，你可以直接传递给需要它的路由。

```kotlin
data class User(val name: String)

val formAuth = form<User>("auth-form") {
    usernameField = "username"
    passwordField = "password"
    validate { credentials ->
        val isValid = credentials.name == "jetbrains" &&
            credentials.password == "foobar"
        if (isValid) User(credentials.name) else null
    }
    onUnauthorized = {
        val message = "Credentials are not valid"
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}
```

有两个名称与经典提供程序不同。表单字段为 `usernameField` 和 `passwordField`，而非
`userParamName` 和 `passwordParamName`。失败处理程序为 `onUnauthorized` 而非 `challenge`。有关完整 API，请参阅[类型安全身份验证](server-typed-auth.md)。

</TabItem>
</Tabs>

> 与 `basic` 身份验证相同，你也可以使用 [UserHashedTableAuth](server-basic-auth.md#validate-user-hash) 来验证保存在内存表中（存储用户名与密码哈希）的用户。

### 第 2 步：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="命名提供程序" group-key="classic">

配置 `form` 提供程序后，你需要定义接收数据的 `post` 路由。
然后，将此路由添加到 **[authenticate](server-auth.md#authenticate-route)** 函数内部。
在身份验证成功的情况下，可以在路由处理程序内使用 `call.principal` 函数检索已验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取已验证用户的名称。

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="类型安全" group-key="typed">

定义发送表单数据的 `post` 路由，并将其包装在 `authenticateWith()` 中。在该代码块内部，
`call.principal` 即为你的 Principal 类型且绝不为 `null`：

```kotlin
routing {
    authenticateWith(formAuth) {
        post("/login") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

你可以使用 [Session 身份验证](server-session-auth.md)来存储已登录用户的 ID。
例如，当用户首次使用 Web 表单登录时，你可以将用户名保存到 Cookie 会话中，并在后续请求中使用 `session` 提供程序授权该用户。