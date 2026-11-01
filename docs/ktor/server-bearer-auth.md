[//]: # (title: Ktor Server 中的 Bearer 身份验证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，并允许您在无需额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

Bearer 身份验证方案是用于访问控制和身份验证的 [HTTP 框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)的一部分。该方案涉及被称为 bearer 令牌的安全令牌。Bearer 身份验证方案可用作 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分，但您也可以提供自定义逻辑来授权 bearer 令牌。

您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)章节中获取有关 Ktor 身份验证的总体信息。

> Bearer 身份验证应仅在 [HTTPS/TLS](server-ssl.md) 上使用。

## 添加依赖项 {id="add_dependencies"}
要启用 `bearer` 身份验证，您需要在构建脚本中引入 `%artifact_name%` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Bearer 身份验证流程 {id="flow"}

通常，Bearer 身份验证流程可能如下所示：

1. 用户成功通过身份验证并授权访问后，服务器会向客户端返回一个访问令牌。
2. 客户端可以使用 `Bearer` 方案在 `Authorization` 请求头中传递令牌，向受保护资源发起请求。
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. 服务器接收请求并[验证](#configure)令牌。
4. 验证通过后，服务器将返回受保护资源的内容作为响应。

## 安装 bearer 身份验证 {id="install"}
要安装 `bearer` 身份验证提供程序，请在 `install` 代码块中调用 [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // Configure bearer authentication
    }
}
```

您可以选择指定一个[提供程序名称](server-auth.md#provider-name)，该名称可用于[验证指定路由](#authenticate-route)。

## 配置 bearer 身份验证 {id="configure"}

要初步了解如何在 Ktor 中配置不同的身份验证提供程序，请参阅[配置身份验证](server-auth.md#configure)。在本节中，我们将介绍 `bearer` 身份验证提供程序的具体配置。 

### 第 1 步：配置 bearer 提供程序 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`bearer` 身份验证提供程序通过 [BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) 类公开其设置。在以下示例中，指定了以下设置：
* `realm` 属性设置要在 `WWW-Authenticate` 请求头中传递的 realm。
* `authenticate` 函数用于检查客户端发送的令牌；如果身份验证成功，则返回 `UserIdPrincipal`，若验证失败，则返回 `null`。

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
        类型安全的身份验证方案 API 为实验性功能。它可能随时被废弃或更改。
        需要选择启用（Opt-in）。有关更多详细信息，请参阅
        <a href="server-typed-auth.md#prerequisites">类型安全身份验证文档</a>。
    </p>
</note>

`bearer()` 函数会为您选择的主体（principal）类型创建一个方案。此方案无需 `install(Authentication)`
步骤：方案本身就是一个值，您可以将其传递给需要它的路由。

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

请注意名称上的变化：经典提供程序使用 `authenticate`，而类型安全方案与其他类型安全方案类似，使用的是 `validate`。它会返回您指定的主体类型；若身份验证失败，则返回 `null`。

您还可以设置 `authHeader` 以从 `Authorization` 请求头以外的位置读取令牌，并设置 `authSchemes` 以接受除 `Bearer` 以外的方案。有关完整 API，请参阅[类型安全身份验证](server-typed-auth.md)。

</TabItem>
</Tabs>

### 第 2 步：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置好 `bearer` 提供程序后，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。在身份验证成功的情况下，可以在路由处理程序内使用 `call.principal` 函数检索已验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取已验证用户的名称。

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

将方案传递给 `authenticateWith()`。在代码块内，`call.principal` 即为您的主体类型且绝不会为 `null`，因此不需要进行转换或 null 检查：

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