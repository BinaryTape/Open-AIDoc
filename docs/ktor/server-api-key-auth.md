[//]: # (title: API Key 身份验证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth-api-key"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:ktor-server-auth</code>, <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

API Key 身份验证是一种简单的身份验证方法，客户端在请求中（通常是在标头中）传递一个私密密钥。该密钥既作为标识符，也作为身份验证机制。

Ktor 允许您使用 API Key 身份验证来保护[路由](server-routing.md)并验证客户端请求。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)部分获取有关 Ktor 身份验证的一般信息。

> API Key 应当保密并安全传输。建议使用 [HTTPS/TLS](server-ssl.md) 来保护传输中的 API Key。
>
{style="note"}

## 添加依赖项 {id="add_dependencies"}

要启用 API Key 身份验证，请在构建脚本中添加 `ktor-server-auth` 和 `%artifact_name%` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
implementation("io.ktor:%artifact_name%:$ktor_version")
implementation("io.ktor:ktor-server-auth:$ktor_version")
```
</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```Groovy
implementation "io.ktor:%artifact_name%:$ktor_version"
implementation "io.ktor:ktor-server-auth:$ktor_version"

```
</TabItem>

<TabItem title="Maven" group-key="maven">

```xml
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>%artifact_name%-jvm</artifactId>
    <version>${ktor_version}</version>
</dependency>
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-auth</artifactId>
    <version>${ktor_version}</version>
</dependency>
```

</TabItem>
</Tabs>

## API Key 身份验证流程 {id="flow"}

API Key 身份验证流程如下：

1. 客户端向服务器应用程序中的特定[路由](server-routing.md)发起请求，请求头中包含 API Key（通常为 `X-API-Key`）。
2. 服务器使用自定义验证逻辑验证该 API Key。
3. 如果密钥有效，服务器将响应所请求的内容。如果密钥无效或缺失，服务器将响应 `401 Unauthorized` 状态。

## 安装 API Key 身份验证 {id="install"}

要安装 `apiKey` 身份验证提供者，请在 `install(Authentication)` 块内调用 [`apiKey`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/api-key.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    apiKey {
        // 配置 API Key 身份验证
    }
}
```

您可以选择性地指定一个[提供者名称](server-auth.md#provider-name)，用于[对指定路由进行身份验证](#authenticate-route)。

## 配置 API Key 身份验证 {id="configure"}

在本节中，我们将了解 `apiKey` 身份验证提供者的具体配置。

> 要了解如何在 Ktor 中配置不同的身份验证提供者，请参阅[配置身份验证](server-auth.md#configure)。

### 第 1 步：配置 API Key 提供者 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`apiKey` 身份验证提供者通过 [`ApiKeyAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-api-key-authentication-provider/-config/index.html) 类公开其设置。在下面的示例中，指定了以下设置：

* `validate` 函数接收从请求中提取的 API Key，并在身份验证成功时返回 `Principal`，如果身份验证失败则返回 `null`。

这是一个最小示例：

```kotlin
data class AppPrincipal(val key: String) : Principal

install(Authentication) {
    apiKey {
        validate { keyFromHeader ->
            val expectedApiKey = "this-is-expected-key"
            keyFromHeader
                .takeIf { it == expectedApiKey }
                ?.let { AppPrincipal(it) }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        类型安全（type-safe）身份验证方案 API 处于实验阶段。它可能会在任何时候被移除或更改。
        需要选择加入（opt-in）。有关更多详细信息，请参阅
        <a href="server-typed-auth.md#prerequisites">启用 API</a>。
    </p>
</note>

`apiKey()` 函数为您选择的 Principal 类型创建一个方案。无需执行 `install(Authentication)` 步骤：该方案是一个值，您可以将其传递给需要它的路由。

```kotlin
data class AppPrincipal(val key: String)

val apiKeyAuth = apiKey<AppPrincipal>("api-key") {
    validate { keyFromHeader ->
        val expectedApiKey = "this-is-expected-key"
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

与经典的提供者不同，名称是必需的。有关完整的 API，请参阅[类型安全身份验证](server-typed-auth.md)。

</TabItem>
</Tabs>

#### 自定义密钥位置 {id="key-location"}

默认情况下，`apiKey` 提供者会在 `X-API-Key` 标头中查找 API Key。

您可以使用 `headerName` 指定自定义标头：

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

```kotlin
apiKey("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

```kotlin
val apiKeyAuth = apiKey<AppPrincipal>("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
</Tabs>

### 第 2 步：验证 API Key {id="validate"}

验证逻辑取决于您的应用程序需求。以下是常见的方法：

#### 静态密钥比较 {id="static-key"}

对于简单的情况，您可以与预定义的密钥进行比较：

```kotlin
apiKey {
    validate { keyFromHeader ->
        val expectedApiKey = 
            environment.config.property("api.key").getString()
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

> 请将敏感的 API Key 存储在配置文件或环境变量中，不要存储在源代码中。
>
{style="note"}

#### 数据库查询 {id="database-lookup"}

对于多个 API Key，请针对数据库进行验证：

```kotlin
apiKey {
    validate { keyFromHeader ->
        // 在数据库中查找密钥
        val user = database.findUserByApiKey(keyFromHeader)
        user?.let { UserIdPrincipal(it.username) }
    }
}
```

#### 多项验证标准 {id="multiple-criteria"}

您可以实现复杂的验证逻辑：

```kotlin
apiKey {
    validate { keyFromHeader ->
        val apiKey = database.findApiKey(keyFromHeader)

        // 检查密钥是否存在、是否处于活动状态以及是否未过期
        if (apiKey != null &&
            apiKey.isActive &&
            apiKey.expiresAt > Clock.System.now()
        ) {
            UserIdPrincipal(apiKey.userId)
        } else {
            null
        }
    }
}
```

### 第 3 步：配置 Challenge {id="challenge"}

您可以使用 `challenge` 函数自定义身份验证失败时发送的响应：

```kotlin
apiKey {
    validate { key ->
        // 验证逻辑
    }
    challenge { defaultScheme, realm ->
        call.respond(
            HttpStatusCode.Unauthorized,
            "Invalid or missing API key"
        )
    }
}
```

### 第 4 步：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置 `apiKey` 提供者后，您可以使用 [`authenticate`](server-auth.md#authenticate-route) 函数保护应用程序中的特定资源。在身份验证成功的情况下，您可以在路由处理程序中使用 `call.principal` 函数检索经过身份验证的 Principal。

```kotlin
routing {
    authenticate {
        get("/") {
            val principal = call.principal<AppPrincipal>()!!
            val key = principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

将方案传递给 `authenticateWith()`。在代码块内，`call.principal` 就是您的 Principal 类型且绝不为 `null`，因此不需要 `!!`：

```kotlin
routing {
    authenticateWith(apiKeyAuth) {
        get("/") {
            val key = call.principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
</Tabs>

## API Key 身份验证示例 {id="complete-example"}

这是一个完整的 API Key 身份验证最小示例：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

data class AppPrincipal(val key: String) : Principal

fun Application.module() {
    val expectedApiKey = "this-is-expected-key"

    install(Authentication) {
        apiKey {
            validate { keyFromHeader ->
                keyFromHeader
                    .takeIf { it == expectedApiKey }
                    ?.let { AppPrincipal(it) }
            }
        }
    }

    routing {
        authenticate {
            get("/") {
                val principal = call.principal<AppPrincipal>()!!
                call.respondText("Key: ${principal.key}")
            }
        }
    }
}
```

## 最佳做法 {id="best-practices"}

在实现 API Key 身份验证时，请考虑以下最佳做法：

1. **使用 HTTPS**：始终通过 HTTPS 传输 API Key 以防止拦截。
2. **安全存储**：切勿在源代码中硬编码 API Key。请使用环境变量或安全配置管理。
3. **密钥轮换**：实现定期轮换 API Key 的机制。
4. **速率限制**：将 API Key 身份验证与速率限制结合使用以防止滥用。
5. **日志记录**：记录身份验证失败以便进行安全监控，但切勿记录真实的 API Key。
6. **密钥格式**：为 API Key 使用加密安全的随机字符串（例如 UUID 或 base64 编码的随机字节）。
7. **多重密钥**：考虑为每个用户针对不同的应用程序或用途支持多个 API Key。
8. **过期**：实现密钥过期以增强安全性。