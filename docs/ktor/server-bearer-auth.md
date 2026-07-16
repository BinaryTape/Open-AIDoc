[//]: # (title: Ktor Server 中的 Bearer 身份验证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

Bearer 身份验证方案是用于访问控制和身份验证的 [HTTP 框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分。该方案涉及被称为 Bearer 令牌的安全性令牌。Bearer 身份验证方案通常作为 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分使用，但您也可以为授权 Bearer 令牌提供自定义逻辑。

您可以在 [Ktor Server 中的身份验证与授权](server-auth.md) 章节中获取有关 Ktor 身份验证的一般信息。

> Bearer 身份验证应仅通过 [HTTPS/TLS](server-ssl.md) 使用。

## 添加依赖项 {id="add_dependencies"}
要启用 `bearer` 身份验证，您需要在构建脚本中包含 `%artifact_name%` 构件：

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

## Bearer 身份验证流程 {id="flow"}

通常，Bearer 身份验证流程如下所示：

1. 用户成功通过身份验证并获得访问授权后，服务器向客户端返回一个访问令牌。
2. 客户端可以使用在 `Bearer` 方案的 `Authorization` 标头中传递的令牌向受保护的资源发起请求。
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. 服务器接收请求并[验证](#configure)令牌。
4. 验证通过后，服务器响应受保护资源的内容。

## 安装 Bearer 身份验证 {id="install"}
要安装 `bearer` 身份验证提供程序，请在 `install` 块中调用 [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // 配置 bearer 身份验证
    }
}
```

您可以选择指定一个[提供程序名称](server-auth.md#provider-name)，该名称可用于[对指定路由进行身份验证](#authenticate-route)。

## 配置 Bearer 身份验证 {id="configure"}

要了解如何在 Ktor 中配置不同身份验证提供程序的一般概念，请参阅[配置身份验证](server-auth.md#configure)。在本节中，我们将介绍 `bearer` 身份验证提供程序的具体配置。

### 第 1 步：配置 Bearer 提供程序 {id="configure-provider"}

`bearer` 身份验证提供程序通过 [BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) 类暴露其设置。在下面的示例中，指定了以下设置：
* `realm` 属性设置要在 `WWW-Authenticate` 标头中传递的 realm。
* `authenticate` 函数检查客户端发送的令牌，并在身份验证成功时返回 `UserIdPrincipal`，如果身份验证失败则返回 `null`。

```kotlin
install(Authentication) {
    bearer("auth-bearer") {
        realm = "Access to the '/' path"
        authenticate { tokenCredential ->
            if (tokenCredential.token == "abc123") {
                UserIdPrincipal("jetbrains")
            } else {
                null
            }
        }
    }
}
```

### 第 2 步：保护特定资源 {id="authenticate-route"}

配置完 `bearer` 提供程序后，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。如果身份验证成功，您可以在路由处理程序中使用 `call.principal` 函数检索已验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取已验证用户的名称。

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}