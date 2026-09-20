[//]: # (title: Ktor Server 中的 Digest 摘要认证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许你在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

Digest 摘要认证方案是用于访问控制和身份验证的 [HTTP 框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分。在这种方案中，哈希函数会在用户名和密码通过网络发送之前对其进行处理。

Ktor 支持 [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616)（HTTP Digest 摘要访问认证），它通过现代安全功能增强了旧的 RFC 2617，包括更强大的哈希算法、保护质量 (QoP) 选项以及用于保护隐私的用户名哈希。

Ktor 允许你使用 Digest 摘要认证来登录用户并保护特定的 [路由](server-routing.md)。你可以在 [Ktor Server 中的身份验证与授权](server-auth.md) 章节中获取有关 Ktor 身份验证的通用信息。

> Digest 摘要认证提供比 [基本认证](server-basic-auth.md) 更强的安全性，因为密码永远不会以明文形式发送。然而，建议在生产环境中使用 [HTTPS/TLS](server-ssl.md) 以增加传输层安全性。

## 添加依赖项 {id="add_dependencies"}

要启用 `digest` 身份验证，你需要在构建脚本中包含 `%artifact_name%` 构件：

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

## Digest 摘要认证流程 {id="flow"}

Digest 摘要认证流程如下：

1. 客户端向服务器应用程序中的特定 [路由](server-routing.md) 发起不带 `Authorization` 标头的请求。
2. 服务器向客户端返回 `401` (Unauthorized) 响应状态，并使用 `WWW-Authenticate` 响应标头提供信息，说明该路由受 Digest 摘要认证方案保护。一个典型的 `WWW-Authenticate` 标头如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   在 Ktor 中，你可以在 [配置](#configure-provider) `digest` 身份验证提供程序时指定 realm、支持的算法、保护质量以及生成 nonce 值的方式。

3. 通常客户端会显示一个登录对话框，用户可以在其中输入凭据。然后，客户端会发起带有以下 `Authorization` 标头的请求：

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=SHA-512-256,
           qop=auth,
           nc=00000001,
           cnonce="0a4f113b",
           response="6629fae49393a05397450978507c4ef1"
   ```
   {style="block"}

   `response` 值按以下方式生成：

    * `HA1 = H(username:realm:password)`，其中 `H` 是配置的哈希算法（例如 SHA-512-256）
   > 这部分 [存储](#digest-table) 在服务器上，可供 Ktor 用于验证用户凭据。

    * `HA2 = H(method:digestURI)`（适用于 `qop=auth`）或 `HA2 = H(method:digestURI:H(entityBody))`（适用于 `qop=auth-int`）

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. 服务器 [验证](#configure-provider) 客户端发送的凭据并返回请求的内容。在使用 QoP 成功通过身份验证后，服务器还会返回 `Authentication-Info` 标头以进行双向认证。

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

### 步骤 1：选择哈希算法 {id="choose-algorithms"}

Ktor 为 Digest 摘要认证支持多种哈希算法。你可以使用 `algorithms` 属性配置服务器接受的算法：

| 算法 | 常量 | 安全级别 | 备注 |
|------------------|------------------------------------|-----------------|-------------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **推荐** | 安全性最强，建议用于新实现 |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **推荐** | 会话变体 - 在 HA1 中包含客户端 nonce |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 良好 | 生产环境最低推荐 |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 良好 | 会话变体 - 在 HA1 中包含客户端 nonce |
| MD5              | `DigestAlgorithm.MD5`              | **已弃用** | 仅用于向后兼容 |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **已弃用** | 会话变体 - 仅用于旧版兼容 |

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Access to the '/' path"
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        // ...
    }
}
```

当配置了多个算法时，服务器会发送多个 `WWW-Authenticate` 标头，允许客户端选择它们支持的最强算法。

> 默认算法为 `SHA-512-256` 和 `MD5`（用于与旧版本客户端的向后兼容）。

#### 会话算法（-sess 变体） {id="sess-algorithms"}

`-sess` 算法变体（例如 `SHA-512-256-sess`、`SHA-256-sess`、`MD5-sess`）修改了 `HA1` 哈希的计算方式。会话算法计算 `H(H(username:realm:password):nonce:cnonce)`，而不是存储 `H(username:realm:password)`，其中 `cnonce` 是客户端提供的 nonce。

**优点：**

- 会话特定的哈希可防止预计算字典攻击
- 某个会话的哈希泄露不会暴露密码，也不会对其他会话造成帮助

**缺点：**

- 服务器必须为每个身份验证请求计算哈希（不能使用预计算的值）

对于大多数应用程序，标准（非会话）算法已经足够，尤其是与 SHA-512-256 等强哈希函数配合使用时。

### 步骤 2：提供带有摘要的用户表 {id="digest-table"}

`digest` 身份验证提供程序使用摘要消息的 `HA1` 部分来验证用户凭据，因此你可以提供一个包含用户名及其对应 `HA1` 哈希值的用户表。

由于不同的算法会产生不同的哈希值，你需要为你支持的每种算法存储适当的哈希值，或者根据客户端请求的算法动态计算哈希值：

```kotlin
val userPasswords: Map<String, String> = mapOf(
    "jetbrains" to "foobar",
    "admin" to "password"
)

fun computeHash(
    userName: String,
    realm: String,
    password: String,
    algorithm: DigestAlgorithm
): ByteArray =
    algorithm.toDigester()
        .digest("$userName:$realm:$password".toByteArray(UTF_8))
```

### 步骤 3：配置 Digest 提供程序 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 身份验证提供程序通过 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 类公开其设置。在下面的示例中，指定了以下设置：

* `realm` 属性设置要在 `WWW-Authenticate` 标头中传递的 realm。
* `algorithms` 属性指定要接受的哈希算法。
* `digestProvider` 函数获取指定用户名和算法的摘要 `HA1` 部分。
* （可选）`validate` 函数允许你将凭据映射到自定义 principal。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = myRealm
        // 同时支持现代 SHA-512-256
        // 和旧版 MD5 客户端
        algorithms = listOf(
            DigestAlgorithm.SHA_512_256,
            DigestAlgorithm.MD5
        )
        digestProvider { userName, realm, algorithm ->
            // 使用请求的算法计算
            // H(username:realm:password)
            userPasswords[userName]?.let { password ->
                computeHash(
                    userName, realm, password, algorithm
                )
            }
        }
        validate { credentials ->
            if (credentials.userName.isNotEmpty()) {
                CustomPrincipal(
                    credentials.userName,
                    credentials.realm
                )
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
        类型安全身份验证方案 API 为实验性功能。可能会随时弃用或更改。需要显式选择启用 (Opt-in)。详情请参阅
        <a href="server-typed-auth.md#prerequisites">启用 API</a>。
    </p>
</note>

`digest()` 函数为你选择的 principal 类型创建一个方案。无需 `install(Authentication)` 步骤：该方案是一个值，你可以将其传递给需要它的路由。

```kotlin
data class CustomPrincipal(
    val userName: String,
    val realm: String
)

val digestAuth = digest<CustomPrincipal>("auth-digest") {
    realm = myRealm
    // 同时支持现代 SHA-512-256
    // 和旧版 MD5 客户端
    algorithms = listOf(
        DigestAlgorithm.SHA_512_256,
        DigestAlgorithm.MD5
    )
    digestProvider { userName, realm, algorithm ->
        // 使用请求的算法计算
        // H(username:realm:password)
        userPasswords[userName]?.let { password ->
            computeHash(userName, realm, password, algorithm)
        }
    }
    validate { credentials ->
        if (credentials.userName.isNotEmpty()) {
            CustomPrincipal(
                credentials.userName,
                credentials.realm
            )
        } else {
            null
        }
    }
}
```

类型安全的 `digest()` 函数仅在 JVM 上可用。如需查看完整 API，请参阅[类型安全身份验证](server-typed-auth.md)。

</TabItem>
</Tabs>

`digestProvider` 函数接收三个形参：

- `userName` – 客户端请求中的用户名
- `realm` - 配置的 realm
- `algorithm` – 客户端正在使用的哈希算法

你应该返回使用指定算法计算的 `HA1` 哈希，如果未找到用户，则返回 `null`。

你还可以使用 [nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 属性来指定如何生成 nonce 值。

### 步骤 4：配置保护质量 {id="configure-qop"}

保护质量 (QoP) 决定了摘要计算中包含的内容：

- `DigestQop.AUTH` – 仅身份验证（默认）。摘要包括请求方法和 URI。
- `DigestQop.AUTH_INT` – 带有完整性保护的身份验证。摘要还包括请求正文，提供防止篡改的保护。

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure API"
        supportedQop = listOf(
            DigestQop.AUTH,
            DigestQop.AUTH_INT
        )
        // ...
    }
}
```

> 使用 `auth-int` 时，请求正文会在身份验证期间被消耗。如果你需要在路由处理程序中访问正文，请安装 [DoubleReceive](server-double-receive.md) 插件。

### 步骤 5：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置好 `digest` 提供程序后，你可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。在身份验证成功的情况下，你可以在路由处理程序中使用 `call.principal` 函数检索经过身份验证的 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)，并获取经过身份验证的用户名。

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            val user = call.principal<CustomPrincipal>()
            call.respondText("Hello, ${user?.userName}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

将方案传递给 `authenticateWith()`。在该代码块内部，`call.principal` 即为你指定的 principal 类型且永远不为 `null`，因此无需转换或进行 null 检查：

```kotlin
routing {
    authenticateWith(digestAuth) {
        get("/") {
            val user = call.principal
            call.respondText("Hello, ${user.userName}!")
        }
    }
}
```

</TabItem>
</Tabs>

## 高级配置 {id="advanced"}

### 用户哈希支持 {id="userhash"}

RFC 7616 引入了用户名哈希 (`userhash`) 以保护隐私。启用后，客户端可以发送用户名的哈希版本，而不是明文用户名。

要支持用户名哈希，请配置 `userHashResolver`：

```kotlin
val users = listOf("alice", "bob", "charlie")

install(Authentication) {
    digest("auth-digest") {
        realm = "Private API"
        userHashResolver { userhash, realm, algorithm ->
            // 从哈希中查找实际用户名
            users.find { username ->
                val digester = algorithm.toDigester()
                val bytes = "$username:$realm".toByteArray()
                hex(digester.digest(bytes)) == userhash
            }
        }
        digestProvider { userName, realm, algorithm ->
            // ...
        }
    }
}
```

配置 `userHashResolver` 后，服务器会在 `WWW-Authenticate` 质询标头中宣告 `userhash=true`。

### 严格 RFC 7616 模式 {id="strict-mode"}

为了在没有旧版客户端要求的新应用程序中获得最高安全性，请使用 `strictRfc7616Mode()`：

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // 在严格模式下，算法永远不会是 MD5
        }
    }
}
```

严格模式：

- 移除了 MD5 算法（仅允许 SHA-256、SHA-512-256 及其会话变体）
- 强制使用 UTF-8 字符集

### UTF-8 字符集支持 {id="charset"}

`digest` 身份验证提供程序为包含非 ASCII 字符的用户名和密码支持 UTF-8 字符集：

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // 这是默认值
        // ...
    }
}
```

### Authentication-Info 标头 {id="auth-info"}

在使用 QoP 成功通过身份验证后，服务器会自动返回 `Authentication-Info` 标头，其中包含：

- `rspauth` - 用于双向认证的响应认证值
- `nextnonce` - 供客户端使用的下一个 nonce
- `qop`、`nc`、`cnonce` - 身份验证参数的回显

这允许客户端验证服务器的身份（双向认证）。

## 安全建议 {id="security"}

1. **使用 SHA-512-256 或 SHA-256** - 避免在生产环境中使用 MD5；它仅出于向后兼容性而包含。

2. **使用 `strictRfc7616Mode()`** - 适用于没有旧版客户端要求的新应用程序。

3. **实现适当的 nonce 管理** – 使用自定义 `NonceManager` 以防止分布式环境中的重放攻击。

4. **考虑 `auth-int`** - 当请求正文完整性对你的应用程序很重要时。

5. **启用 `userhash`** - 以保护用户名的隐私。

6. **始终使用 HTTPS** – 仅靠 Digest 摘要认证并不能加密流量；在生产环境中务必使用 TLS。