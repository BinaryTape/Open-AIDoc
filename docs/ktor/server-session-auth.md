[//]: # (title: Ktor Server 中的 Session 身份验证)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:ktor-server-auth</code>，<code>io.ktor:ktor-server-sessions</code>
</p>
<var name="example_name" value="auth-form-session"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

[Session](server-sessions.md) 提供了一种在不同 HTTP 请求之间持久化数据的机制。典型用例包括存储已登录用户的 ID、购物车内容或在客户端保留用户偏好。 

在 Ktor 中，已经有关联 session 的用户可以使用 `session` 提供程序进行身份验证。例如，当用户第一次使用 [Web 表单](server-form-based-auth.md)登录时，您可以将用户名保存到 cookie session 中，并在后续请求中使用 `session` 提供程序对该用户进行授权。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)章节中获取有关 Ktor 身份验证与授权的一般信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `session` 身份验证，您需要在构建脚本中包含以下构件：

* 添加 `ktor-server-sessions` 依赖项以使用 session：

  <var name="artifact_name" value="ktor-server-sessions"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

* 添加 `ktor-server-auth` 依赖项以进行身份验证：

  <var name="artifact_name" value="ktor-server-auth"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

## Session 身份验证流程 {id="flow"}

使用 session 的身份验证流程可能会有所不同，这取决于用户在您的应用程序中是如何进行身份验证的。让我们看看使用 [基于表单的身份验证](server-form-based-auth.md)时的情形：

1. 客户端向服务器发送包含 Web 表单数据（包括用户名和密码）的请求。
2. 服务器验证客户端发送的凭据，将用户名保存到 cookie session 中，并返回所请求的内容以及包含用户名的 cookie。
3. 客户端携带 cookie 对受保护的资源发起后续请求。
4. Ktor 根据接收到的 cookie 数据检查该用户是否存在 cookie session，并可选地对接收到的 session 数据执行额外验证。如果验证成功，服务器将返回所请求的内容。

## 安装 session 身份验证 {id="install"}
要安装 `session` 身份验证提供程序，请在 `install` 块内调用带有必需 session 类型的 [session](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/session.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*
//...
install(Authentication) {
    session<UserSession> {
        // 配置 session 身份验证
    }
}
```

## 配置 session 身份验证 {id="configure"}

本节演示了如何使用 [基于表单的身份验证](server-form-based-auth.md)对用户进行身份验证，将有关该用户的信息保存到 cookie session 中，然后在后续请求中使用 `session` 提供程序对该用户进行授权。

> 有关完整示例，请参阅 [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。

### 第 1 步：创建数据类 {id="data-class"}

首先，您需要创建一个用于存储 session 数据的数据类：

```kotlin
@Serializable
data class UserSession(val name: String, val count: Int)
```

### 第 2 步：安装并配置 session {id="install-session"}

创建数据类后，您需要安装并配置 `Sessions` 插件。下面的示例安装并配置了一个带有指定 cookie 路径和过期时间的 cookie session。

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 60
    }
}
```

> 要了解有关配置 session 的更多信息，请参阅 [Session 配置概览](server-sessions.md#configuration_overview)。

### 第 3 步：配置 session 身份验证 {id="configure-session-auth"}

`session` 身份验证提供程序通过 [`SessionAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-session-authentication-provider/-config/index.html) 类公开其设置。在下面的示例中，指定了以下设置：

* `validate()` 函数检查 [session 实例](#data-class)并在身份验证成功的情况下返回 `Any` 类型的项目主体。
* `challenge()` 函数指定了身份验证失败时执行的操作。例如，您可以重定向回登录页面或发送 [`UnauthorizedResponse`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

```kotlin
install(Authentication) {
    session<UserSession>("auth-session") {
        validate { session ->
            if(session.name.startsWith("jet")) {
                session
            } else {
                null
            }
        }
        challenge {
            call.respondRedirect("/login")
        }
    }
}
```

### 第 4 步：在 session 中保存用户数据 {id="save-session"}

要将已登录用户的信息保存到 session，请使用 [`call.sessions.set()`](server-sessions.md#use_sessions) 函数。

以下示例显示了一个使用 Web 表单的简单身份验证流程：

```kotlin
authenticate("auth-form") {
    post("/login") {
        val userName = call.principal<UserIdPrincipal>()?.name.toString()
        call.sessions.set(UserSession(name = userName, count = 1))
        call.respondRedirect("/hello")
    }
}
```

> 有关基于表单的身份验证流程的更多详细信息，请参阅 [基于表单的身份验证](server-form-based-auth.md)文档。

### 第 5 步：保护特定资源 {id="authenticate-route"}

配置好 `session` 提供程序后，您可以使用 [`authenticate()`](server-auth.md#authenticate-route) 函数保护应用程序中的特定资源。

身份验证成功后，您可以在路由处理程序中使用 `call.principal()` 函数检索经过身份验证的主体（在本例中为 [`UserSession`](#data-class) 实例）：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
        call.sessions.set(userSession?.copy(count = userSession.count + 1))
        call.respondText("Hello, ${userSession?.name}! Visit count is ${userSession?.count}.")
    }
}
```

> 有关完整示例，请参阅 [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。