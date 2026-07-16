[//]: # (title: Ktor Server 中的 Digest 摘要认证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>所需依赖</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许你在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

Digest 摘要认证方案是用于访问控制和身份验证的 [HTTP 框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分。在这种方案中，哈希函数会在用户名和密码通过网络发送之前对其进行处理。

Ktor 允许你使用 Digest 摘要认证来登录用户并保护特定的 [路由](server-routing.md)。你可以在 [Ktor Server 中的身份验证与授权](server-auth.md) 章节中获取有关 Ktor 身份验证的通用信息。

## 添加依赖 {id="add_dependencies"}
要启用 `digest` 身份验证，你需要在构建脚本中包含 `%artifact_name%` 构件：

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

## Digest 摘要认证流程 {id="flow"}

Digest 摘要认证流程如下：

1. 客户端向服务器应用程序中的特定 [路由](server-routing.md) 发起不带 `Authorization` 标头的请求。
2. 服务器向客户端返回 `401` (Unauthorized) 响应状态，并使用 `WWW-Authenticate` 响应标头提供信息，说明该路由受 Digest 摘要认证方案保护。一个典型的 `WWW-Authenticate` 标头如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

   在 Ktor 中，你可以在 [配置](#configure-provider) `digest` 身份验证提供程序时指定 realm 以及生成 nonce 值的方式。

3. 通常客户端会显示一个登录对话框，用户可以在其中输入凭据。然后，客户端会发起带有以下 `Authorization` 标头的请求：

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` 值按以下方式生成：
   
   a. `HA1 = MD5(username:realm:password)`
   > 这部分 [存储](#digest-table) 在服务器上，可供 Ktor 用于验证用户凭据。
   
   b. `HA2 = MD5(method:digestURI)`
   
   c. `response = MD5(HA1:nonce:HA2)`

4. 服务器 [验证](#configure-provider) 客户端发送的凭据并返回请求的内容。

## 安装 Digest 摘要认证 {id="install"}
要安装 `digest` 身份验证提供程序，请在 `install` 块内调用 [digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // 配置 digest 身份验证
    }
}
```
你可以选择性地指定一个 [提供程序名称](server-auth.md#provider-name)，该名称可用于 [验证指定的路由](#authenticate-route)。

## 配置 Digest 摘要认证 {id="configure"}

要了解如何在 Ktor 中配置不同身份验证提供程序的通用概念，请参阅 [配置身份验证](server-auth.md#configure)。在本节中，我们将了解 `digest` 身份验证提供程序的特定配置。

### 步骤 1：提供带有摘要的用户表 {id="digest-table"}

`digest` 身份验证提供程序使用摘要消息的 `HA1` 部分来验证用户凭据。因此，你可以提供一个包含用户名和相应 `HA1` 哈希值的用户表。在下面的示例中，`getMd5Digest` 函数用于生成 `HA1` 哈希：

```kotlin
fun getMd5Digest(str: String): ByteArray = MessageDigest.getInstance("MD5").digest(str.toByteArray(UTF_8))

val myRealm = "Access to the '/' path"
val userTable: Map<String, ByteArray> = mapOf(
    "jetbrains" to getMd5Digest("jetbrains:$myRealm:foobar"),
    "admin" to getMd5Digest("admin:$myRealm:password")
)
```

### 步骤 2：配置 Digest 提供程序 {id="configure-provider"}

`digest` 身份验证提供程序通过 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 类公开其设置。在下面的示例中，指定了以下设置：
* `realm` 属性设置要在 `WWW-Authenticate` 标头中传递的 realm。
* `digestProvider` 函数为指定的用户名获取摘要的 `HA1` 部分。
* （可选）`validate` 函数允许你将凭据映射到自定义 Principal。

```kotlin
fun Application.main() {
    install(Authentication) {
        digest("auth-digest") {
            realm = myRealm
            digestProvider { userName, realm ->
                userTable[userName]
            }
            validate { credentials ->
                if (credentials.userName.isNotEmpty()) {
                    CustomPrincipal(credentials.userName, credentials.realm)
                } else {
                    null
                }
            }
        }
    }
}

data class CustomPrincipal(val userName: String, val realm: String)
```

你还可以使用 [nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 属性来指定如何生成 nonce 值。

### 步骤 3：保护特定资源 {id="authenticate-route"}

配置好 `digest` 提供程序后，你可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。在身份验证成功的情况下，你可以在路由处理程序中使用 `call.principal` 函数检索经过身份验证的 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)，并获取经过身份验证的用户名。

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            call.respondText("Hello, ${call.principal<CustomPrincipal>()?.userName}!")
        }
    }
}