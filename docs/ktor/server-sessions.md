[//]: # (title: Sessions)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sessions"/>
<var name="package_name" value="io.ktor.server.sessions"/>
<var name="artifact_name" value="ktor-server-sessions"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p><b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client">session-cookie-client</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server">session-cookie-server</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server">session-header-server</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
Sessions 插件提供了一种在不同 HTTP 请求之间持久化数据的机制。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-sessions.html) 插件提供了一种在不同 HTTP 请求之间持久化数据的机制。典型用例包括存储已登录用户的 ID、购物车内容或在客户端保留用户偏好设置。在 Ktor 中，您可以使用 cookie 或自定义标头实现 session，选择将 session 数据存储在服务器上还是传递给客户端，对 session 数据进行签名和加密等。

在本主题中，我们将介绍如何安装 `%plugin_name%` 插件、对其进行配置，并在[路由处理程序](server-routing.md#define_route)中访问 session 数据。

## 添加依赖项 {id="add_dependencies"}
要启用对 session 的支持，您需要在构建脚本中包含 `%artifact_name%` 工件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 Sessions {id="install_plugin"}

<p>
    要在应用程序中<a href="server-plugins.md#install">安装</a> <code>%plugin_name%</code> 插件，
    请在指定的<Links href="server-modules.md" summary="模块允许您通过对路由进行分组来组织应用程序结构。">模块</Links>中将其传递给 <code>install</code> 函数。
    以下示例展示了如何安装 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函数调用中。
    </li>
    <li>
        在针对 <code>Application</code> 类显式定义的 <code>module()</code> 扩展方法中。
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
<p>
    <code>%plugin_name%</code> 插件也可以<a href="server-plugins.md#install-route">安装到特定路由</a>。
    如果您需要为不同的应用程序资源使用不同的 <code>%plugin_name%</code> 配置，这将非常有用。
</p>

## Session 配置概览 {id="configuration_overview"}
要配置 `%plugin_name%` 插件，您需要执行以下步骤：
1. *[创建数据类](#data_class)*：在配置 session 之前，您需要创建一个用于存储 session 数据的[数据类](https://kotlinlang.org/docs/data-classes.html)。
2. *[选择在服务器和客户端之间传递数据的方式](#cookie_header)*：使用 cookie 或自定义标头。Cookie 更适合纯 HTML 应用程序，而自定义标头则适用于 API。
3. *[选择存储 session 有效负载的位置](#client_server)*：在客户端或服务器上。您可以使用 cookie/标头值将序列化的 session 数据传递给客户端，也可以将负载存储在服务器上仅传递 session 标识符。

   如果您希望将 session 有效负载存储在服务器上，可以*[选择其存储方式](#storages)*：在服务器内存中或在文件夹中。您还可以实现自定义存储以保留 session 数据。
4. *[保护 session 数据](#protect_session)*：为了保护传递给客户端的敏感 session 数据，您需要对 session 的有效负载进行签名和加密。

配置好 `%plugin_name%` 后，您就可以在[路由处理程序](server-routing.md#define_route)中[获取和设置 session 数据](#use_sessions)。

## 创建数据类 {id="data_class"}

在配置 session 之前，您需要创建一个用于存储 session 数据的[数据类](https://kotlinlang.org/docs/data-classes.html)。
例如，下面的 `UserSession` 类将用于存储 session ID 和页面浏览量：

```kotlin
@Serializable
data class UserSession(val id: String, val count: Int)
```

如果您要使用多个 session，则需要创建多个数据类。

## 传递 session 数据：Cookie 与标头 {id="cookie_header"}

### Cookie {id="cookie"}
要使用 cookie 传递 session 数据，请在 `install(Sessions)` 代码块内调用具有指定名称和数据类的 `cookie` 函数：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session")
}
```
在上面的示例中，session 数据将使用添加到 `Set-Cookie` 标头的 `user_session` 属性传递给客户端。您可以通过在 `cookie` 代码块内传递其他属性来配置它们。例如，以下代码段展示了如何指定 cookie 的路径和过期时间：

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
    }
}
```

如果未显式公开所需属性，请使用 `extensions` 属性。例如，您可以按以下方式传递 `SameSite` 属性：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.extensions["SameSite"] = "lax"
    }
}
```
要详细了解可用的配置设置，请参阅 [CookieConfiguration](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-cookie-configuration/index.html)。

> 在将应用程序[部署](server-deployment.md)到生产环境之前，请确保将 `secure` 属性设置为 `true`。这将允许仅通过[安全连接](server-ssl.md)传输 cookie，并保护 session 数据免受 HTTPS 降级攻击。
>
{type="warning"}

### 标头 {id="header"}
要使用自定义标头传递 session 数据，请在 `install(Sessions)` 代码块内调用具有指定名称和数据类的 `header` 函数：

```kotlin
install(Sessions) {
    header<CartSession>("cart_session")
}
```

在上面的示例中，session 数据将使用 `cart_session` 自定义标头传递给客户端。
在客户端，您需要将此标头附加到每个请求中以获取 session 数据。

> 如果您使用 [CORS](server-cors.md) 插件来处理跨源请求，请按如下方式将自定义标头添加到 `CORS` 配置中：
> ```kotlin
> install(CORS) {
>     allowHeader("cart_session")
>     exposeHeader("cart_session")
> }
> ```

### 仅在修改时发送 session 数据 {id="send_only_if_modified"}

默认情况下，Ktor 会在每个响应中发送 session 数据，即使它未发生变化也是如此。

要仅在 session 数据被修改时才发送，请在 session 配置中启用 `sendOnlyIfModified` 标志：

```kotlin
install(Sessions) {
    cookie<MySession>("SESSION") {
        sendOnlyIfModified = true
    }
}
```

此选项适用于基于 [cookie](#cookie) 和基于[标头](#header)的 session。

## 存储 session 有效负载：客户端与服务器 {id="client_server"}

在 Ktor 中，您可以通过两种方式管理 session 数据：
- _在客户端和服务器之间传递 session 数据_。
   
  如果仅将 session 名称传递给 [cookie 或 header](#cookie_header) 函数，session 数据将在客户端和服务器之间传递。在这种情况下，您需要对 session 的有效负载进行[签名和加密](#protect_session)，以保护传递给客户端的敏感 session 数据。
- _在服务器上存储 session 数据，并在客户端与服务器之间仅传递 session ID_。
   
  在这种情况下，您可以选择有效负载在服务器上的[存储位置](#storages)。例如，您可以将 session 数据存储在内存中、指定文件夹中，或者实现自己的自定义存储。

## 在服务器上存储 session 有效负载 {id="storages"}

Ktor 允许您[在服务器上](#client_server)存储 session 数据，并且仅在服务器和客户端之间传递 session ID。在这种情况下，您可以选择将有效负载保存在服务器的何处。

### 内存存储 {id="in_memory_storage"}
[SessionStorageMemory](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage-memory/index.html) 支持将 session 内容存储在内存中。此存储在服务器运行期间保留数据，并在服务器停止后丢弃信息。例如，您可以按如下方式将 cookie 存储在服务器内存中：

```kotlin
cookie<CartSession>("cart_session", SessionStorageMemory()) {
}
```

您可以在此处找到完整示例：[session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server)。

> 请注意，`SessionStorageMemory` 仅供开发环境使用。

### 目录存储 {id="directory_storage"}

[directorySessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/directory-session-storage.html) 可用于将 session 数据存储在指定目录下的文件中。例如，要将 session 数据存储在 `build/.sessions` 目录下的文件中，请按以下方式创建 `directorySessionStorage`：
```kotlin
header<CartSession>("cart_session", directorySessionStorage(File("build/.sessions"))) {
}
```

您可以在此处找到完整示例：[session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server)。

### 自定义存储 {id="custom_storage"}

Ktor 提供了 [SessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage/index.html) 接口，允许您实现自定义存储。
```kotlin
interface SessionStorage {
    suspend fun invalidate(id: String)
    suspend fun write(id: String, value: String)
    suspend fun read(id: String): String
}
```
这三个函数都是[挂起函数](https://kotlinlang.org/docs/composing-suspending-functions.html)。您可以参考 [SessionStorageMemory](https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-plugins/ktor-server-sessions/common/src/io/ktor/server/sessions/SessionStorageMemory.kt) 的实现。

## 保护 session 数据 {id="protect_session"}

### 对 session 数据进行签名 {id="sign_session"}

对 session 数据进行签名可以防止修改 session 内容，但允许用户查看该内容。
要对 session 进行签名，请将签名密钥传递给 `SessionTransportTransformerMessageAuthentication` 构造函数，并将该实例传递给 `transform` 函数：

```kotlin
install(Sessions) {
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<CartSession>("cart_session", SessionStorageMemory()) {
        cookie.path = "/"
        transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
    }
}
```

`SessionTransportTransformerMessageAuthentication` 默认使用 `HmacSHA256` 作为身份验证算法，该算法可以更改。 

### 对 session 数据进行签名和加密 {id="sign_encrypt_session"}

对 session 数据进行签名和加密可以防止读取和修改 session 内容。
要对 session 进行签名和加密，请将签名/加密密钥传递给 `SessionTransportTransformerEncrypt` 构造函数，并将该实例传递给 `transform` 函数：

```kotlin
install(Sessions) {
    val secretEncryptKey = "00112233445566778899aabbccddeeff".hexToByteArray()
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
        transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
    }
}
```

> 请注意，Ktor `3.0.0` 版本中[更新了加密方法](migrating-3.md#session-encryption-method-update)。如果您是从较早版本迁移，请在 `SessionTransportTransformerEncrypt` 的构造函数中使用 `backwardCompatibleRead` 属性，以确保与现有 session 的兼容性。
>
{style="note"}

默认情况下，`SessionTransportTransformerEncrypt` 使用 `AES` 和 `HmacSHA256` 算法，这些算法可以更改。 

> 请注意，签名/加密密钥不应在代码中硬编码指定。您可以在[配置文件](server-configuration-file.topic#configuration-file-overview)中使用自定义组来存储签名/加密密钥，并使用[环境变量](server-configuration-file.topic#environment-variables)对其进行初始化。
>
{type="warning"}

## 获取和设置 session 内容 {id="use_sessions"}
要为特定[路由](server-routing.md)设置 session 内容，请使用 `call.sessions` 属性。`set` 方法允许您创建新的 session 实例：

```kotlin
get("/login") {
    call.sessions.set(UserSession(id = "123abc", count = 0))
    call.respondRedirect("/user")
}
```

要获取 session 内容，您可以调用 `get`，并将已注册的 session 类型之一作为类型实参传入：

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
}
```

要修改 session（例如增加计数器），您需要调用数据类的 `copy` 方法：

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
        call.sessions.set(userSession.copy(count = userSession.count + 1))
        call.respondText("Session ID is ${userSession.id}. Reload count is ${userSession.count}.")
    } else {
        call.respondText("Session doesn't exist or is expired.")
    }
}
```

当您由于任何原因需要清除 session 时（例如用户退出登录），请调用 `clear` 函数：

```kotlin
get("/logout") {
    call.sessions.clear<UserSession>()
    call.respondRedirect("/user")
}
```

您可以在此处找到完整示例：[session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## 延迟获取 session {id="deferred-session-retrieval"}

默认情况下，对于每个包含 session 的请求，无论路由是否实际需要，Ktor 都会尝试从存储中读取 session。这种行为可能会导致不必要的开销 —— 尤其是在使用自定义 session 存储的应用程序中。

您可以通过启用 `io.ktor.server.sessions.deferred` 系统属性来延迟加载 session：

```kotlin
System.setProperty("io.ktor.server.sessions.deferred", "true")
```

## 示例 {id="examples"}

以下可运行的示例演示了如何使用 `%plugin_name%` 插件：

- [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client) 展示了如何使用 [cookie](#cookie) 向[客户端](#client_server)传递[已签名并加密](#sign_encrypt_session)的 session 有效负载。
- [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server) 展示了如何将 session 有效负载保存在[服务器内存](#in_memory_storage)中，并使用 [cookie](#cookie) 向客户端传递[已签名](#sign_session)的 session ID。
- [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server) 展示了如何将 session 有效负载保存在服务器的[目录存储](#directory_storage)中，并使用[自定义标头](#header)向客户端传递[已签名](#sign_session)的 session ID。