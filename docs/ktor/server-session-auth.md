[//]: # (title: Ktor Server 中的会话身份验证)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-auth</code>、<code>io.ktor:ktor-server-sessions</code>
</p>
<var name="example_name" value="auth-form-session"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✖️
</p>
</tldr>

[会话](server-sessions.md)提供了一种在不同 HTTP 请求之间持久化数据的机制。典型用例包括存储已登录用户的 ID、购物车的内容或在客户端保存用户偏好设置。

在 Ktor 中，已经拥有关联会话的用户可以使用 `session` 提供程序进行身份验证。例如，当用户首次使用 [Web 表单](server-form-based-auth.md)登录时，您可以将用户名保存到 Cookie 会话中，并在后续请求中使用 `session` 提供程序对该用户进行授权。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)部分获取有关 Ktor 中身份验证和授权的常规信息。

> Ktor 还提供了类型安全的会话身份验证方案。它为路由处理程序提供非 null 的 principal 以及对存储会话的读写访问权限，并将会话类型与 principal 类型分离开来。请参阅[类型安全的会话身份验证](server-typed-session-auth.md)。
>
{style="tip"}

## 添加依赖项 {id="add_dependencies"}
要启用 `session` 身份验证，您需要在构建脚本中包含以下构件：

* 添加 `ktor-server-sessions` 依赖项以使用会话：

  <var name="artifact_name" value="ktor-server-sessions"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* 添加 `ktor-server-auth` 依赖项以进行身份验证：

  <var name="artifact_name" value="ktor-server-auth"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## 会话身份验证流程 {id="flow"}

使用会话的身份验证流程可能会有所不同，这取决于用户在应用程序中的身份验证方式。让我们看看结合[基于表单的身份验证](server-form-based-auth.md)时的具体流程：

1. 客户端向服务器发送包含 Web 表单数据（包括用户名和密码）的请求。
2. 服务器验证客户端发送的凭据，将用户名保存到 Cookie 会话中，并返回所请求的内容以及包含用户名的 Cookie。
3. 客户端携带 Cookie 对受保护的资源发起后续请求。
4. 根据收到的 Cookie 数据，Ktor 检查该用户是否存在 Cookie 会话，并可选择对接收到的会话数据执行额外的验证。验证成功后，服务器将返回所请求的内容。

## 安装会话身份验证 {id="install"}
要安装 `session` 身份验证提供程序，请在 `install` 块内调用带有必需会话类型的 [session](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/session.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*
//...
install(Authentication) {
    session<UserSession> {
        // 配置会话身份验证
    }
}
```

## 配置会话身份验证 {id="configure"}

本节演示如何通过[基于表单的身份验证](server-form-based-auth.md)验证用户身份，将该用户的信息保存到 Cookie 会话中，然后在后续请求中使用 `session` 提供程序对该用户进行授权。

> 有关完整示例，请参阅
> [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。

### 步骤 1：创建数据类 {id="data-class"}

首先，您需要创建一个用于存储会话数据的数据类：

```kotlin
@Serializable
data class UserSession(val name: String, val count: Int)
```

### 步骤 2：安装并配置会话 {id="install-session"}

创建数据类后，您需要安装并配置 `Sessions` 插件。以下示例安装并配置了一个带有指定 Cookie 路径和过期时间的 Cookie 会话。

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 60
    }
}
```

> 要了解有关配置会话的更多信息，请参阅[会话配置概述](server-sessions.md#configuration_overview)。

### 步骤 3：配置会话身份验证 {id="configure-session-auth"}

`session` 身份验证提供程序通过 [
`SessionAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-session-authentication-provider/-config/index.html)
类公开其设置。在以下示例中，指定了如下设置：

* `validate()` 函数用于检查[会话实例](#data-class)，并在身份验证成功时返回一个 `Any` 类型的 principal。
* `challenge()` 函数指定身份验证失败时执行的操作。例如，您可以重定向回登录页面或发送 [
  `UnauthorizedResponse`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

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

### 步骤 4：在会话中保存用户数据 {id="save-session"}

要将已登录用户的信息保存到会话中，请使用 [
`call.sessions.set()`](server-sessions.md#use_sessions)
函数。

以下示例展示了使用 Web 表单的简单身份验证流程：

```kotlin
authenticate("auth-form") {
    post("/login") {
        val principal =
            call.principal<UserIdPrincipal>()
        val userName = principal?.name.toString()
        val session = UserSession(
            name = userName,
            count = 1
        )
        call.sessions.set(session)
        call.respondRedirect("/hello")
    }
}
```

> 有关基于表单的身份验证流程的更多详细信息，请参阅[基于表单的身份验证](server-form-based-auth.md)文档。

### 步骤 5：保护特定资源 {id="authenticate-route"}

配置 `session` 提供程序后，您可以使用
[`authenticate()`](server-auth.md#authenticate-route) 函数保护应用程序中的特定资源。

身份验证成功后，您可以在路由处理程序内使用 `call.principal()` 函数检索已通过身份验证的 principal（在本例中为 [`UserSession`](#data-class) 实例）：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
        val next = userSession?.copy(
            count = userSession.count + 1
        )
        call.sessions.set(next)
        call.respondText(
            "Hello, ${userSession?.name}! " +
                "Visit count is ${userSession?.count}."
        )
    }
}
```

> 有关完整示例，请参阅
> [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。