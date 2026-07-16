[//]: # (title: Ktor Server 中的基于表单的身份验证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

基于表单的身份验证使用 [Web 表单](https://developer.mozilla.org/en-US/docs/Learn/Forms)来收集凭据信息并对用户进行身份验证。
要在 Ktor 中创建 Web 表单，您可以使用 [HTML DSL](server-html-dsl.md#html_response) 或在 JVM [模板引擎](server-templating.md)（如 FreeMarker、Velocity 等）中进行选择。

> 鉴于使用基于表单的身份验证时用户名和密码是以明文形式传递的，您需要使用 [HTTPS/TLS](server-ssl.md) 来保护敏感信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `form` 身份验证，您需要在构建脚本中包含 `%artifact_name%` 构件：

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

## 基于表单的身份验证流程 {id="flow"}

基于表单的身份验证流程可能如下所示：

1. 未经身份验证的客户端向服务器应用程序中的特定[路由](server-routing.md)发出请求。
2. 服务器返回一个 HTML 页面，该页面至少包含一个基于 HTML 的 Web 表单，提示用户输入用户名和密码。 
   > Ktor 允许您使用 [Kotlin DSL](server-html-dsl.md) 构建表单，或者您可以在各种 JVM 模板引擎（如 FreeMarker、Velocity 等）中进行选择。
3. 当用户提交用户名和密码时，客户端向服务器发出包含 Web 表单数据（包括用户名和密码）的请求。
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   在 Ktor 中，您需要[指定参数名称](#configure-provider)用于获取用户名和密码。

4. 服务器[验证](#configure-provider)客户端发送的凭据并返回请求的内容。

## 安装表单身份验证 {id="install"}
要安装 `form` 身份验证提供者，请在 `install` 块内调用 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 函数：

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

您可以选择指定一个[提供者名称](server-auth.md#provider-name)，该名称可用于[对指定路由进行身份验证](#authenticate-route)。

## 配置表单身份验证 {id="configure"}

### 第 1 步：配置表单提供者 {id="configure-provider"}
`form` 身份验证提供者通过 [FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html) 类公开其设置。在下面的示例中，指定了以下设置：
* `userParamName` 和 `passwordParamName` 属性指定了用于获取用户名和密码的参数名称。
* `validate` 函数验证用户名和密码。
  `validate` 函数检查 `UserPasswordCredential`，在身份验证成功的情况下返回 `UserIdPrincipal`，如果身份验证失败则返回 `null`。
* `challenge` 函数指定身份验证失败时执行的操作。例如，您可以重定向回登录页面或发送 [UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            call.respond(HttpStatusCode.Unauthorized, "Credentials are not valid")
        }
    }
}
```

> 对于 `basic` 身份验证，您还可以使用 [UserHashedTableAuth](server-basic-auth.md#validate-user-hash) 来验证存储在内存表中的用户，该表保存了用户名和密码哈希。

### 第 2 步：保护特定资源 {id="authenticate-route"}

配置 `form` 提供者后，您需要定义发送数据的 `post` 路由。
然后，将此路由添加到 **[authenticate](server-auth.md#authenticate-route)** 函数中。
在身份验证成功的情况下，您可以在路由处理程序中使用 `call.principal` 函数检索经过身份验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取经过身份验证的用户名。

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

您可以使用[会话身份验证](server-session-auth.md)来存储已登录用户的 ID。
例如，当用户第一次使用 Web 表单登录时，您可以将用户名保存到 Cookie 会话中，并在后续请求中使用 `session` 提供者授权该用户。