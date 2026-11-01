[//]: # (title: Ktor Server 中的身份验证与授权)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication"/>
<var name="package_name" value="io.ktor.server.auth"/>
<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
Authentication 插件负责在 Ktor 中处理身份验证与授权。
</link-summary>

Ktor 提供了 [Authentication](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication/index.html) 插件来处理身份验证与授权。典型的使用场景包括用户登录、授予对特定资源的访问权限，以及在各方之间安全地传输信息。你还可以将 `Authentication` 与 [Sessions](server-sessions.md) 配合使用，在不同请求之间保留用户信息。

> 在客户端，Ktor 提供了 [Authentication](client-auth.md) 插件来处理身份验证与授权。

## 支持的身份验证类型 {id="supported"}
Ktor 支持以下身份验证与授权方案：

### HTTP 身份验证 {id="http-auth"}
HTTP 为访问控制和身份验证提供了[通用框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。在 Ktor 中，你可以使用以下 HTTP 身份验证方案：
* [Basic](server-basic-auth.md) - 使用 `Base64` 编码提供用户名和密码。如果不与 HTTPS 结合使用，通常不推荐。
* [Digest](server-digest-auth.md) - 一种身份验证方法，通过对用户名和密码应用哈希函数，以加密形式传输用户凭据。
* [Bearer](server-bearer-auth.md) - 一种涉及称为承载令牌（bearer token）的安全令牌的身份验证方案。Bearer 身份验证方案用作 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分，但你也可以提供用于授权承载令牌的自定义逻辑。
* [API Key](server-api-key-auth.md) - 一种简单的身份验证方法，客户端在标头中传递密钥。

### 基于表单的身份验证 {id="form-auth"}
[基于表单](server-form-based-auth.md)的身份验证使用 [Web 表单](https://developer.mozilla.org/en-US/docs/Learn/Forms)来收集凭据信息并验证用户身份。

### JSON Web Tokens (JWT) {id="jwt"}
[JSON Web Token](server-jwt.md) 是一种将信息作为 JSON 对象在各方之间安全传输的开放标准。你可以将 JSON Web Token 用于授权：当用户登录后，每个请求都将包含一个令牌，允许用户访问该令牌所允许的资源。在 Ktor 中，你可以使用 `jwt` 身份验证来验证令牌并校验其中包含的声明（claim）。

### LDAP {id="ldap"}
[LDAP](server-ldap.md) 是一种用于目录服务身份验证的开放跨平台协议。Ktor 提供了 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函数，用于根据指定的 LDAP 服务器对用户凭据进行身份验证。

### OAuth {id="oauth"}
[OAuth](server-oauth.md) 是一种用于保护 API 访问安全的开放标准。Ktor 中的 `oauth` 提供程序允许你使用 Google、Facebook、Twitter 等外部提供程序实现身份验证。

### OpenID Connect {id="oidc"}

[OpenID Connect](server-oidc.md) 是构建在 OAuth 2.0 之上的身份层。`Oidc` 插件会读取提供程序的发现文档，因此你只需配置签发者 URL，而无需配置端点和签名密钥。它可以在 [API](server-oidc-resource-server.md) 中验证访问令牌并运行[浏览器登录](server-oidc-browser-login.md)，包括 PKCE、会话和注销。

该插件目前处于实验性阶段，且仅在 JVM 上可用。

### Session {id="sessions"}
[Session](server-sessions.md) 提供了一种在不同 HTTP 请求之间持久化数据的机制。典型用例包括存储已登录用户的 ID、购物车内容或在客户端保留用户偏好设置。在 Ktor 中，已经拥有关联会话的用户可以使用 `session` 提供程序进行身份验证。请在 [Ktor Server 中的 Session 身份验证](server-session-auth.md)中了解如何执行此操作。

### 自定义 {id="custom"}

Ktor 提供了两种自定义身份验证和授权行为的方法：

* 使用[自定义身份验证提供程序](#custom-auth-provider)。
* 使用[自定义插件](server-custom-plugins.md)实现授权逻辑。例如，你可以使用 `AuthenticationChecked` [钩子](server-custom-plugins.md#call-handling)来验证访问权限。有关详细信息，请参阅 [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization) 示例。

## 类型安全的身份验证方案 API {id="type-safe"}

<primary-label ref="experimental"/>

Ktor 还提供了一个[类型安全的身份验证方案 API](server-typed-auth.md)，可将方案绑定到主体类型。
在受保护的路由内，`call.principal` 即为主体类型，并保证非 `null`，因此无需进行转换或 null 检查。
该 API 还支持选择性加入的[角色检查](server-typed-auth.md#roles)、[匿名回退](server-typed-auth.md#anonymous)、类型化[会话](server-typed-session-auth.md)以及 [OAuth 2.0 流程](server-oauth2-flows.md)。

> 此 API 是本主题中所述命名提供程序方法的替代方案。
> 这两个 API 可以在同一个应用程序中一起使用。有关详细信息，请参阅[类型安全身份验证](server-typed-auth.md)。
>
{style="note"}

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 构件添加到构建脚本中：
</p>
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

请注意，某些身份验证提供程序（例如 [JWT](server-jwt.md) 和 [LDAP](server-ldap.md)）需要额外的构件。

## 安装 Authentication {id="install"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="server-plugins.md#install">安装</a>到应用程序中，请在指定的 <Links href="server-modules.md" summary="模块允许你通过对路由进行分组来组织应用程序结构。">模块</Links>内将其传递给 <code>install</code> 函数。
    以下示例展示了如何安装 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函数调用中。
    </li>
    <li>
        在 <code>Application</code> 类上显式定义的 <code>module()</code> 扩展函数中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## 配置 Authentication {id="configure"}
在[安装 Authentication](#install) 后，你可以按如下方式配置和使用 `Authentication`：

### 步骤 1：选择身份验证提供程序 {id="choose-provider"}

要使用特定的身份验证提供程序，例如 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或 [form](server-form-based-auth.md)，你需要在 `install` 块内部调用相应的函数。例如，要使用 Basic 身份验证，请调用 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 配置 Basic 身份验证
    }
}
```

在此函数内部，你可以[配置](#configure-provider)特定于该提供程序的设置。

> 如果内置提供程序无法满足你的需求，你可以实现[自定义身份验证提供程序](#custom-auth-provider)。
> 
{style="note"}

### 步骤 2：指定提供程序名称 {id="provider-name"}

[使用特定提供程序](#choose-provider)的函数还可以选择允许你指定提供程序名称。以下代码示例分别安装了名称为 `"auth-basic"` 和 `"auth-form"` 的 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 与 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 提供程序：

```kotlin
install(Authentication) {
    basic("auth-basic") {
        // 配置 Basic 身份验证
    }
    form("auth-form") {
        // 配置表单身份验证
    }
    // ...
}
```
{disable-links="false"}

这些名称稍后可用于使用不同的提供程序[对不同路由进行身份验证](#authenticate-route)。
> 请注意，提供程序名称应是唯一的，并且你只能定义一个不带名称的提供程序。
>
{style="note"}

### 步骤 3：配置提供程序 {id="configure-provider"}

每个[提供程序类型](#choose-provider)都有其自身的配置。例如，[`BasicAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 类为 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数提供了选项。该类中的核心函数是 [`validate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/validate.html)，负责验证用户名和密码。以下代码示例演示了其用法：

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```

为了理解 `validate()` 函数的工作原理，我们需要引入两个概念：

* _主体_（principal）是可以被验证身份的实体：用户、计算机、服务等。在 Ktor 中，不同的身份验证提供程序可能会使用不同的主体。例如，`basic`、`digest` 和 `form` 提供程序验证 [`UserIdPrincipal`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，而 `jwt` 提供程序则验证 [`JWTPrincipal`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html)。
  > 你也可以创建自定义主体。这在以下情况下可能会很有用：
  > - 将凭据映射到自定义主体允许你在[路由处理程序](#get-principal)内部获取有关已验证主体的额外信息。
  > - 如果你使用[会话身份验证](server-session-auth.md)，主体可以是一个存储会话数据的数据类。
* _凭据_（credential）是服务器用于对主体进行身份验证的一组属性：用户名/密码对、API 密钥等。例如，`basic` 和 `form` 提供程序使用 [`UserPasswordCredential`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 来验证用户名和密码，而 `jwt` 则验证 [`JWTCredential`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html)。

因此，`validate()` 函数会检查指定的凭据，在身份验证成功时返回一个主体 `Any`，如果身份验证失败则返回 `null`。

> 要根据特定条件跳过身份验证，请使用 [`skipWhen()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-provider/-config/skip-when.html)。例如，如果 [session](server-sessions.md) 已存在，你可以跳过 `basic` 身份验证：
> ```kotlin
> basic {
>     skipWhen { call -> call.sessions.get<UserSession>() != null }
> }

### 步骤 4：保护特定资源 {id="authenticate-route"}

最后一步是保护应用程序中的特定资源。你可以通过使用 [`authenticate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/authenticate.html) 函数来实现这一点。该函数接受两个可选形参：

- 用于对嵌套路由进行身份验证的[提供程序名称](#provider-name)。
  以下代码片段使用名为 _auth-basic_ 的提供程序来保护 `/login` 和 `/orders` 路由：
   ```kotlin
   routing {
       authenticate("auth-basic") {
           get("/login") {
               // ...
           }    
           get("/orders") {
               // ...
           }    
       }
       get("/") {
           // ...
       }
   }
   ```
- 用于解析嵌套身份验证提供程序的策略。
  该策略由 [`AuthenticationStrategy`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-strategy/index.html) 枚举值表示。

  例如，客户端必须为所有使用 `AuthenticationStrategy.Required` 策略注册的提供程序提供身份验证数据。
  在以下代码片段中，只有通过了[会话身份验证](server-session-auth.md)的用户才能尝试使用 Basic 身份验证访问 `/admin` 路由：
   ```kotlin
   routing {
       val required = AuthenticationStrategy.Required
       authenticate("auth-session", strategy = required) {
           get("/hello") {
               // ...
           }
           authenticate("auth-basic", strategy = required) {
               get("/admin") {
                   // ...
               }
           }
       }
   }
   ```

> 有关完整示例，请参阅 [auth-form-session-nested](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session-nested)。

### 步骤 5：在路由处理程序内部获取主体 {id="get-principal"}

身份验证成功后，你可以在路由处理程序内部使用 `call.principal()` 函数检索已验证的主体。该函数接受由[配置的身份验证提供程序](#configure-provider)返回的特定主体类型。在以下示例中，`call.principal()` 用于获取 `UserIdPrincipal` 并取得已验证用户的名称。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

如果你使用[会话身份验证](server-session-auth.md)，主体可能是一个存储会话数据的数据类。因此，你需要将该数据类传递给 `call.principal()`：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
    }
}
```

如果是[嵌套身份验证提供程序](#authenticate-route)，你可以将[提供程序名称](#provider-name)传递给 `call.principal()` 以获取所需提供程序的主体。

在以下示例中，传递了 `"auth-session"` 值以获取最外层会话提供程序的主体：

```kotlin
val required = AuthenticationStrategy.Required
authenticate("auth-session", strategy = required) {
    authenticate("auth-basic", strategy = required) {
        get("/admin") {
            val userSession =
                call.principal<UserSession>(
                    "auth-session"
                )
        }
    }
}
```

## 自定义身份验证提供程序 {id="custom-auth-provider"}

当内置提供程序无法满足你的需求时，可以使用 [`provider()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-config/provider.html) 函数来实现自定义身份验证逻辑：

```kotlin
provider("custom") {
  authenticate { context ->
    val headers = context.call.request.headers
    val exampleHeader = headers["Example-Header"]
    if (exampleHeader == null) {
      val message = "No example header found"
      val cause = AuthenticationFailedCause.Error(message)
      context.challenge(key = this, cause) { challenge, call ->
        call.respondText("Challenge")
        challenge.complete()
      }
    }
  }
}
```

在上述示例中，`provider("custom")` 函数注册了一个命名身份验证提供程序，稍后可以使用 `authenticate("custom")` 将其应用于路由。

在提供程序内部，`authenticate {}` 块会针对每个传入请求执行，并通过上下文对象为你提供对身份验证过程的完全控制。这包括访问当前调用（`context.call`）以及检查标头、形参或其他请求数据的能力。

你可以使用 [`DynamicProviderConfig`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-dynamic-provider-config/index.html) 类提供的选项来配置额外的提供程序行为。