[//]: # (title: Ktor Server 中的认证与授权)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication"/>
<var name="package_name" value="io.ktor.server.auth"/>
<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
Authentication 插件处理 Ktor 中的认证与授权。
</link-summary>

Ktor 提供了 [Authentication](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication/index.html) 插件来处理认证与授权。典型使用场景包括用户登录、授予对特定资源的访问权限，以及在各方之间安全地传输信息。你还可以将 `Authentication` 与 [会话](server-sessions.md) 结合使用，以在请求之间保留用户信息。

> 在客户端，Ktor 提供了 [Authentication](client-auth.md) 插件来处理认证与授权。

## 支持的认证类型 {id="supported"}
Ktor 支持以下认证与授权方案：

### HTTP 认证 {id="http-auth"}
HTTP 为访问控制和认证提供了一个 [通用框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。在 Ktor 中，你可以使用以下 HTTP 认证方案：
* [Basic](server-basic-auth.md) - 使用 `Base64` 编码提供用户名和密码。如果未结合 HTTPS 使用，通常不建议使用。
* [Digest](server-digest-auth.md) - 一种认证方法，通过对用户名和密码应用哈希函数，以加密形式传输用户凭据。
* [Bearer](server-bearer-auth.md) - 一种涉及称为持有者令牌 (bearer tokens) 的安全令牌的认证方案。
  Bearer 认证方案作为 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分使用，但你也可以为授权持有者令牌提供自定义逻辑。
* [API Key](server-api-key-auth.md) - 一种简单的认证方法，客户端在标头中传递密钥。

### 基于表单的认证 {id="form-auth"}
[基于表单](server-form-based-auth.md) 的认证使用 [Web 表单](https://developer.mozilla.org/en-US/docs/Learn/Forms) 来收集凭据信息并认证用户。

### JSON Web 令牌 (JWT) {id="jwt"}
[JSON Web Token](server-jwt.md) 是一个开放标准，用于作为 JSON 对象在各方之间安全地传输信息。你可以将 JSON Web 令牌用于授权：当用户登录后，每个请求都将包含一个令牌，允许用户访问该令牌许可的资源。在 Ktor 中，你可以使用 `jwt` 认证来验证令牌并校验其中包含的声明 (claims)。

### LDAP {id="ldap"}
[LDAP](server-ldap.md) 是一个用于目录服务认证的开放式跨平台协议。Ktor 提供了 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函数，用于根据指定的 LDAP 服务器认证用户凭据。

### OAuth {id="oauth"}
[OAuth](server-oauth.md) 是用于保护 API 访问的开放标准。Ktor 中的 `oauth` 提供者允许你使用外部提供者（如 Google、Facebook、Twitter 等）实现认证。

### 会话 {id="sessions"}
[会话](server-sessions.md) 提供了一种在不同 HTTP 请求之间持久化数据的机制。典型用例包括存储已登录用户的 ID、购物车内容或在客户端保留用户偏好设置。在 Ktor 中，已经拥有关联会话的用户可以使用 `session` 提供者进行认证。详细了解如何从 [Ktor Server 中的会话认证](server-session-auth.md) 执行此操作。

### 自定义 {id="custom"}
Ktor 还提供了用于创建 [自定义插件](server-custom-plugins.md) 的 API，可用于实现你自己的插件来处理认证与授权。
例如，在检查认证凭据后执行 `AuthenticationChecked` [钩子](server-custom-plugins.md#call-handling)，它允许你实现授权：[custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization)。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，你需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
</p>
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

注意，某些认证提供者（如 [JWT](server-jwt.md) 和 [LDAP](server-ldap.md)）需要额外的构件。

## 安装 Authentication {id="install"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序，请在指定的 <Links href="/ktor/server-modules" summary="模块允许你通过对路由进行分组来构建应用程序。">模块</Links>中将其传递给 <code>install</code> 函数。
    下面的代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（它是 <code>Application</code> 类的扩展函数）中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## 配置 Authentication {id="configure"}
在 [安装 Authentication](#install) 之后，你可以按照以下步骤配置并使用 `Authentication`：

### 步骤 1：选择认证提供者 {id="choose-provider"}

要使用特定的认证提供者，例如 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或 [form](server-form-based-auth.md)，你需要在 `install` 块中调用相应的函数。例如，要使用 basic 认证，请调用 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 配置 basic 认证
    }
}
```

在此函数内部，你可以 [配置](#configure-provider) 该提供者特有的设置。

### 步骤 2：指定提供者名称 {id="provider-name"}

用于 [使用特定提供者](#choose-provider) 的函数可选地允许你指定提供者名称。下面的代码示例分别使用 `"auth-basic"` 和 `"auth-form"` 名称安装了 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 和 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 提供者：

```kotlin
install(Authentication) {
    basic("auth-basic") {
        // 配置 basic 认证
    }
    form("auth-form") {
        // 配置 form 认证
    }
    // ...
}
```
{disable-links="false"}

这些名称稍后可用于使用不同的提供者来 [认证不同的路由](#authenticate-route)。
> 注意，提供者名称应该是唯一的，并且你只能定义一个不带名称的提供者。
>
{style="note"}

### 步骤 3：配置提供者 {id="configure-provider"}

每种 [提供者类型](#choose-provider) 都有其自己的配置。例如，[`BasicAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 类为 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数提供选项。该类中的关键函数是 [`validate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/validate.html)，它负责验证用户名和密码。以下代码示例演示了其用法：

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```

要理解 `validate()` 函数的工作原理，我们需要引入两个术语：

* **principal (主体)** 是一个可以被认证的实体：用户、计算机、服务等。在 Ktor 中，各种认证提供者可能会使用不同的主体。例如，`basic`、`digest` 和 `form` 提供者认证 [`UserIdPrincipal`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，而 `jwt` 提供者验证 [`JWTPrincipal`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html)。
  > 你还可以创建自定义主体。这在以下情况下可能很有用：
  > - 将凭据映射到自定义主体允许你在 [路由处理程序](#get-principal) 中拥有关于已认证主体的额外信息。
  > - 如果你使用 [会话认证](server-session-auth.md)，主体可能是一个存储会话数据的数据类。
* **credential (凭据)** 是一组供服务器认证主体的属性：用户名/密码对、API 密钥等。例如，`basic` 和 `form` 提供者使用 [`UserPasswordCredential`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 来验证用户名和密码，而 `jwt` 验证 [`JWTCredential`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html)。

因此，`validate()` 函数检查指定的凭据，并在认证成功时返回一个主体 `Any`，如果认证失败则返回 `null`。

> 要根据特定标准跳过认证，请使用 [`skipWhen()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-provider/-config/skip-when.html)。例如，如果 [会话](server-sessions.md) 已存在，你可以跳过 `basic` 认证：
> ```kotlin
> basic {
>     skipWhen { call -> call.sessions.get<UserSession>() != null }
> }

### 步骤 4：保护特定资源 {id="authenticate-route"}

最后一步是保护应用程序中的特定资源。你可以通过使用 [`authenticate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/authenticate.html) 函数来实现。该函数接受两个可选参数：

- 用于认证嵌套路由的 [提供者名称](#provider-name)。
  下面的代码片段使用名为 _auth-basic_ 的提供者来保护 `/login` 和 `/orders` 路由：
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
- 用于解析嵌套认证提供者的策略。
  该策略由 [`AuthenticationStrategy`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-strategy/index.html) 枚举值表示。

  例如，客户端应为所有使用 `AuthenticationStrategy.Required` 策略注册的提供者提供认证数据。
  在下面的代码片段中，只有通过了 [会话认证](server-session-auth.md) 的用户才能尝试使用 basic 认证访问 `/admin` 路由：
   ```kotlin
   routing {
       authenticate("auth-session", strategy = AuthenticationStrategy.Required) {
           get("/hello") {
               // ...
           }    
           authenticate("auth-basic", strategy = AuthenticationStrategy.Required) {
               get("/admin") {
                   // ...
               }
           }  
       }
   }
   ```

> 有关完整示例，请参阅 [auth-form-session-nested](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session-nested)。

### 步骤 5：在路由处理程序中获取主体 {id="get-principal"}

认证成功后，你可以使用 `call.principal()` 函数在路由处理程序中检索已认证的主体。该函数接受由 [配置的认证提供者](#configure-provider) 返回的特定主体类型。在以下示例中，使用 `call.principal()` 获取 `UserIdPrincipal` 并获取已认证用户的名称。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

如果你使用 [会话认证](server-session-auth.md)，主体可能是一个存储会话数据的数据类。因此，你需要将此数据类传递给 `call.principal()`：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
    }
}
```

在 [嵌套认证提供者](#authenticate-route) 的情况下，你可以将 [提供者名称](#provider-name) 传递给 `call.principal()` 以获取所需提供者的主体。

在下面的示例中，传递 `"auth-session"` 值以获取最顶层会话提供者的主体：

```kotlin
authenticate("auth-session", strategy = AuthenticationStrategy.Required) {
    authenticate("auth-basic", strategy = AuthenticationStrategy.Required) {
        get("/admin") {
            val userSession = call.principal<UserSession>("auth-session")
        }
    }
}