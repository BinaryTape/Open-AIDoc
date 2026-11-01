[//]: # (title: Ktor Server 中的 Digest 认证)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

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
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

Digest 认证方案是用于访问控制和认证的 [HTTP 框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)的一部分。在该方案中，用户名和密码在通过网络发送之前会经过哈希函数处理。

Ktor 支持 [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616)（HTTP Digest 访问认证），该标准在旧版 RFC 2617 的基础上进行了增强，引入了现代安全功能，包括更强大的哈希算法、保护质量（Quality of Protection）选项以及用于隐私保护的用户名哈希。

Ktor 允许您使用 Digest 认证来登录用户并保护特定的[路由](server-routing.md)。您可以在 [Ktor Server 中的认证与授权](server-auth.md)部分获取有关 Ktor 认证的常规信息。

> Digest 认证比 [Basic 认证](server-basic-auth.md)提供了更高的安全性，因为密码绝不会以明文形式发送。不过，建议在生产环境中使用 [HTTPS/TLS](server-ssl.md) 以提供额外的传输层安全保障。

## 添加依赖项 {id="add_dependencies"}

要启用 `digest` 认证，您需要在构建脚本中引入 `%artifact_name%` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Digest 认证流程 {id="flow"}

Digest 认证流程如下：

1. 客户端向服务器应用程序中的特定[路由](server-routing.md)发起不带 `Authorization` 标头的请求。
2. 服务器向客户端响应 `401`（Unauthorized）响应状态，并使用 `WWW-Authenticate` 响应标头指示该路由受 Digest 认证方案保护。典型的 `WWW-Authenticate` 标头如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm=SHA-512-256,
           qop="auth"
   ```
   {style="block"}

   在 Ktor 中，您可以在[配置](#configure-provider) `digest` 认证提供程序时指定 realm、支持的算法、保护质量以及 nonce 值的生成方式。

3. 通常客户端会显示一个登录对话框供用户输入凭据。随后，客户端发起包含以下 `Authorization` 标头的请求：

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

   `response` 值的生成方式如下：

    * `HA1 = H(username:realm:password)`，其中 `H` 是配置的哈希算法（例如 SHA-512-256）
   > 这部分[存储在服务器上](#digest-table)，Ktor 可以使用它来验证用户凭据。

    * `HA2 = H(method:digestURI)`（针对 `qop=auth`）或 `HA2 = H(method:digestURI:H(entityBody))`（针对 `qop=auth-int`）

    * `response = H(HA1:nonce:nc:cnonce:qop:HA2)`

4. 服务器[验证](#configure-provider)客户端发送的凭据并响应请求的内容。在使用 QoP 成功认证后，服务器还会返回一个 `Authentication-Info` 标头以实现双向认证。

## 安装 Digest 认证 {id="install"}

要安装 `digest` 认证提供程序，请在 `install` 块内调用 [digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html) 函数：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // 配置 digest 认证
    }
}
```

您可以选择指定一个[提供程序名称](server-auth.md#provider-name)，用于[对指定路由进行认证](#authenticate-route)。

## 配置 Digest 认证 {id="configure"}

要总体了解如何在 Ktor 中配置不同的认证提供程序，请参阅[配置认证](server-auth.md#configure)。在本节中，我们将了解 `digest` 认证提供程序的配置细节。

### 第 1 步：选择哈希算法 {id="choose-algorithms"}

Ktor 支持多种用于 Digest 认证的哈希算法。您可以使用 `algorithms` 属性配置服务器接受的算法：

| 算法             | 常量                                | 安全级别       | 说明                                            |
|------------------|------------------------------------|-----------------|-------------------------------------------------|
| SHA-512-256      | `DigestAlgorithm.SHA_512_256`      | **推荐**        | 最高安全性，适用于全新实现                      |
| SHA-512-256-sess | `DigestAlgorithm.SHA_512_256_SESS` | **推荐**        | 会话变体 - 在 HA1 中包含客户端 nonce            |
| SHA-256          | `DigestAlgorithm.SHA_256`          | 良好            | 生产环境推荐的最低标准                          |
| SHA-256-sess     | `DigestAlgorithm.SHA_256_SESS`     | 良好            | 会话变体 - 在 HA1 中包含客户端 nonce            |
| MD5              | `DigestAlgorithm.MD5`              | **已弃用**      | 仅用于向后兼容                                  |
| MD5-sess         | `DigestAlgorithm.MD5_SESS`         | **已弃用**      | 会话变体 - 仅用于旧版兼容                       |

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

当配置了多个算法时，服务器会发送多个 `WWW-Authenticate` 标头，允许客户端选择其支持的最强算法。

> 默认算法为 `SHA-512-256` 和 `MD5`（用于向后兼容旧版客户端）。

#### 会话算法（-sess 变体） {id="sess-algorithms"}

`-sess` 算法变体（例如 `SHA-512-256-sess`、`SHA-256-sess`、`MD5-sess`）修改了 `HA1` 哈希的计算方式。会话算法不是存储 `H(username:realm:password)`，而是计算 `H(H(username:realm:password):nonce:cnonce)`，其中 `cnonce` 是客户端提供的 nonce。

**优点：**

- 会话专用的哈希可以防止预先计算的字典攻击
- 破解单个会话的哈希不会泄露密码，也无助于破解其他会话

**缺点：**

- 服务器必须为每个认证请求计算哈希（无法使用预先计算的值）

对于大多数应用程序，标准（非会话）算法已足够安全，尤其是与 SHA-512-256 等强哈希函数结合使用时。

### 第 2 步：提供包含摘要的用户表 {id="digest-table"}

`digest` 认证提供程序使用摘要消息的 `HA1` 部分来验证用户凭据，因此您可以提供一个包含用户名及其对应 `HA1` 哈希的用户表。

由于不同的算法会生成不同的哈希值，因此您需要为您支持的每种算法存储适当的哈希，或者根据客户端请求的算法动态计算哈希：

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

### 第 3 步：配置 Digest 提供程序 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`digest` 认证提供程序通过 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 类公开其设置。在以下示例中，指定了以下设置：

* `realm` 属性设置要在 `WWW-Authenticate` 标头中传递的 realm。
* `algorithms` 属性指定要接受的哈希算法。
* `digestProvider` 函数获取指定用户名和算法对应的摘要 `HA1` 部分。
* （可选）`validate` 函数允许您将凭据映射到自定义主体（Principal）。

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
            // 使用请求的算法
            // 计算 H(username:realm:password)
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
        类型安全（Type-safe）认证方案 API 属于实验性功能。它可能随时被废弃或更改。需要显式选择加入（Opt-in）。有关更多详细信息，请参阅
        <a href="server-typed-auth.md#prerequisites">类型安全认证文档</a>。
    </p>
</note>

`digest()` 函数可为您选择的主体类型创建方案。无需 `install(Authentication)` 步骤：该方案是一个值，您可以将其传递给需要的路由。

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
        // 使用请求的算法
        // 计算 H(username:realm:password)
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

类型安全的 `digest()` 函数仅在 JVM 上可用。有关完整的 API，请参阅[类型安全认证](server-typed-auth.md)。

</TabItem>
</Tabs>

`digestProvider` 函数接收三个形参：

- `userName` – 来自客户端请求的用户名
- `realm` – 配置的 realm
- `algorithm` – 客户端正在使用的哈希算法

您应该返回使用指定算法计算出的 `HA1` 哈希，如果未找到用户则返回 `null`。

您还可以使用 [nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 属性来指定如何生成 nonce 值。

### 第 4 步：配置保护质量（QoP） {id="configure-qop"}

保护质量（Quality of Protection，QoP）决定了摘要计算中包含的内容：

- `DigestQop.AUTH` – 仅认证（默认）。摘要中包含请求方法和 URI。
- `DigestQop.AUTH_INT` – 包含完整性保护的认证。摘要中还包含请求正文，可防止篡改。

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

> 使用 `auth-int` 时，请求正文会在认证期间被消耗。如果您需要在路由处理程序中访问正文，请安装 [DoubleReceive](server-double-receive.md) 插件。

### 第 5 步：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置 `digest` 提供程序后，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。在认证成功的情况下，您可以在路由处理程序中使用 `call.principal` 函数检索已认证的 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html) 并获取已认证用户的名称。

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

将方案传递给 `authenticateWith()`。在代码块内，`call.principal` 即为您的主体类型，且绝不会为 `null`，因此不需要进行类型转换或 null 检查：

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

RFC 7616 引入了用户名哈希（`userhash`）以保护隐私。启用后，客户端可以发送用户名的哈希版本而不是明文用户名。

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

配置 `userHashResolver` 后，服务器会在 `WWW-Authenticate` 质询标头中声明 `userhash=true`。

### 严格 RFC 7616 模式 {id="strict-mode"}

对于没有旧版客户端要求的新应用程序，为了获得最高安全性，请使用 `strictRfc7616Mode()`：

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "Secure Zone"
        strictRfc7616Mode()
        digestProvider { userName, realm, algorithm ->
            // 在严格模式下，algorithm 绝不会是 MD5
        }
    }
}
```

严格模式：

- 移除 MD5 算法（仅允许 SHA-256、SHA-512-256 及其会话变体）
- 强制使用 UTF-8 字符集

### UTF-8 字符集支持 {id="charset"}

`digest` 认证提供程序支持对包含非 ASCII 字符的用户名和密码使用 UTF-8 字符集：

```kotlin
install(Authentication) {
    digest("auth-digest") {
        realm = "My App"
        charset = Charsets.UTF_8  // 此为默认值
        // ...
    }
}
```

### Authentication-Info 标头 {id="auth-info"}

在使用 QoP 成功认证后，服务器会自动返回一个 `Authentication-Info` 标头，其中包含：

- `rspauth` - 用于双向认证的响应认证值
- `nextnonce` - 供客户端使用的下一个 nonce
- `qop`、`nc`、`cnonce` - 认证参数的回显

这使客户端能够验证服务器的身份（双向认证）。

## 安全建议 {id="security"}

1. **使用 SHA-512-256 或 SHA-256** - 避免在生产环境中使用 MD5；它仅为兼容旧版而保留。

2. **使用 `strictRfc7616Mode()`** - 适用于没有旧版客户端要求的新应用程序。

3. **实现恰当的 nonce 管理** – 在分布式环境中使用自定义 `NonceManager` 以防止重放攻击。

4. **考虑使用 `auth-int`** - 当请求正文完整性对您的应用程序非常重要时。

5. **启用 `userhash`** - 用于保护用户名的隐私。

6. **始终使用 HTTPS** – 单独的 Digest 认证不会加密流量；在生产环境中请始终使用 TLS。