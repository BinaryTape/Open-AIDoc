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
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
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
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
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

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

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

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        类型安全身份验证方案 API 是实验性功能。它可能会随时被移除或更改。
        需要选择加入（Opt-in）。有关更多详细信息，请参阅
        <a href="server-typed-auth.md#prerequisites">启用 API</a>。
    </p>
</note>

`bearer()` 函数为您选择的 principal 类型创建一个方案。无需执行 `install(Authentication)`
步骤：该方案是一个值，您可以将其传递给需要它的路由。

```kotlin
data class User(val name: String)

val bearerAuth = bearer<User>("auth-bearer") {
    realm = "Access to the '/' path"
    validate { tokenCredential ->
        if (tokenCredential.token == "abc123") {
            User("jetbrains")
        } else {
            null
        }
    }
}
```

请注意名称的变化：经典提供程序使用 `authenticate`，而类型安全方案与其他类型安全方案一样使用 `validate`。它返回您的 principal 类型，如果身份验证失败则返回 `null`。

您还可以设置 `authHeader` 以从除 `Authorization` 标头之外的其他位置读取令牌，并设置 `authSchemes` 以接受 `Bearer` 之外的其他方案。有关完整 API，请参阅[类型安全身份验证](server-typed-auth.md)。

</TabItem>
</Tabs>

### 第 2 步：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置完 `bearer` 提供程序后，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。如果身份验证成功，您可以在路由处理程序中使用 `call.principal` 函数检索已验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取已验证用户的名称。

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

将方案传递给 `authenticateWith()`。在该块内，`call.principal` 即为您指定的 principal 类型且绝不为 `null`，因此不需要进行转换或 null 检查：

```kotlin
routing {
    authenticateWith(bearerAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>