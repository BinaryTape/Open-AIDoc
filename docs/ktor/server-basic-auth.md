[//]: # (title: Ktor Server 中的基本身份验证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>代码示例</b>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>，<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，并允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links> 支持</b>：✅
</p>
</tldr>

基本身份验证 (Basic authentication) 方案是用于访问控制和身份验证的 [HTTP 框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)的一部分。在此方案中，用户凭据以使用 Base64 编码的用户名/密码对的形式进行传输。

Ktor 允许您使用基本身份验证进行用户登录并保护特定的[路由](server-routing.md)。您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)章节中获取有关 Ktor 身份验证的一般信息。

> 鉴于基本身份验证以明文形式传递用户名和密码，您需要使用 [HTTPS/TLS](server-ssl.md) 来保护敏感信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `basic` 身份验证，您需要在构建脚本中包含 `%artifact_name%` 构件：

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

## 基本身份验证流程 {id="flow"}

基本身份验证流程如下：

1. 客户端向服务器应用程序中的特定[路由](server-routing.md)发起不带 `Authorization` 标头的请求。
2. 服务器向客户端返回 `401` (Unauthorized) 响应状态，并使用 `WWW-Authenticate` 响应标头提供信息，说明已使用基本身份验证方案来保护该路由。典型的 `WWW-Authenticate` 标头如下所示：
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   在 Ktor 中，您可以在[配置](#configure-provider) `basic` 身份验证提供程序时，使用相应的属性指定 realm 和 charset。

3. 通常，客户端会显示一个登录对话框，用户可以在其中输入凭据。然后，客户端发起带有 `Authorization` 标头的请求，该标头包含使用 Base64 编码的用户名和密码对，例如：
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 服务器[验证](#configure-provider)客户端发送的凭据并返回请求的内容。

## 安装基本身份验证 {id="install"}
要安装 `basic` 身份验证提供程序，请在 `install` 块内调用 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 配置基本身份验证
    }
}
```

您可以选择指定一个[提供程序名称](server-auth.md#provider-name)，该名称可用于[对指定路由进行身份验证](#authenticate-route)。

## 配置基本身份验证 {id="configure"}

要了解如何在 Ktor 中配置不同身份验证提供程序的一般概念，请参阅[配置身份验证](server-auth.md#configure)。在本节中，我们将了解 `basic` 身份验证提供程序的配置细节。 

### 第一步：配置 basic 提供程序 {id="configure-provider"}

`basic` 身份验证提供程序通过 [BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 类公开其设置。在下面的示例中，指定了以下设置：
* `realm` 属性设置要在 `WWW-Authenticate` 标头中传递的领域值。
* `validate` 函数验证用户名和密码。

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
   
`validate` 函数检查 `UserPasswordCredential`，并在身份验证成功的情况下返回 `UserIdPrincipal`，如果身份验证失败则返回 `null`。 
> 您还可以使用 [UserHashedTableAuth](#validate-user-hash) 来验证存储在内存表中的用户，该表保存了用户名和密码哈希。

### 第二步：保护特定资源 {id="authenticate-route"}

配置完 `basic` 提供程序后，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。在身份验证成功的情况下，您可以在路由处理程序中使用 `call.principal` 函数检索已通过身份验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取已通过身份验证的用户名称。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

## 使用 UserHashedTableAuth 进行验证 {id="validate-user-hash"}

Ktor 允许您使用 [UserHashedTableAuth](#validate-user-hash) 来[验证](#configure-provider)存储在内存表中的用户，该表保存了用户名和密码哈希。这可以确保即使您的数据源泄露，也不会泄露用户密码。

要使用 `UserHashedTableAuth` 验证用户，请按照以下步骤操作：

1. 使用 [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html) 函数创建一个具有指定算法和盐提供者的摘要函数：
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") { "ktor${it.length}" }
   ```

2. 初始化 `UserHashedTableAuth` 的新实例并指定以下属性：
   * 使用 `table` 属性提供用户名和加密密码的映射表。
   * 将摘要函数分配给 `digester` 属性。
   
   ```kotlin
   val hashedUserTable = UserHashedTableAuth(
       table = mapOf(
           "jetbrains" to digestFunction("foobar"),
           "admin" to digestFunction("password")
       ),
       digester = digestFunction
   )
   ```
   
3. 在 `validate` 函数内部，调用 [UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html) 函数来验证用户，如果凭据有效，则返回 `UserIdPrincipal` 实例：

   ```kotlin
   install(Authentication) {
       basic("auth-basic-hashed") {
           realm = "Access to the '/' path"
           validate { credentials ->
               hashedUserTable.authenticate(credentials)
           }
       }
   }