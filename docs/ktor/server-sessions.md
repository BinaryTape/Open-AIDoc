[//]: # (title: Sessions)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sessions"/>
<var name="package_name" value="io.ktor.server.sessions"/>
<var name="artifact_name" value="ktor-server-sessions"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p><b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client">session-cookie-client</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server">session-cookie-server</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server">session-header-server</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
Sessions 插件提供了一种在不同 HTTP 请求之间持久化数据的机制。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-sessions.html) 插件提供了一种在不同 HTTP 请求之间持久化数据的机制。典型的用例包括存储已登录用户的 ID、购物车的内容或在客户端上保留用户偏好。在 Ktor 中，您可以使用 Cookie 或自定义标头来实现会话，选择是在服务器上存储会话数据还是将其传递给客户端，对会话数据进行签名和加密等等。

在本主题中，我们将介绍如何安装 `%plugin_name%` 插件、对其进行配置，以及如何在 [路由处理程序](server-routing.md#define_route) 中访问会话数据。

## 添加依赖项 {id="add_dependencies"}
要启用对会话的支持，您需要在构建脚本中包含 `%artifact_name%` 构件：

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

## 安装 Sessions {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用中，
    请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。
    下面的代码片段显示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 中，它是 <code>Application</code> 类的扩展函数。
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
<p>
    <code>%plugin_name%</code> 插件也可以被<a href="#install-route">安装到特定路由</a>。
    如果您需要为不同的应用资源使用不同的 <code>%plugin_name%</code> 配置，这可能会很有用。
</p>

## 会话配置概述 {id="configuration_overview"}
要配置 `%plugin_name%` 插件，您需要执行以下步骤：
1. *[创建数据类](#data_class)*：在配置会话之前，您需要创建一个[数据类](https://kotlinlang.org/docs/data-classes.html)用于存储会话数据。
2. *[选择如何在服务器和客户端之间传递数据](#cookie_header)*：使用 Cookie 或自定义标头。Cookie 更适合纯 HTML 应用，而自定义标头则旨在用于 API。
3. *[选择存储会话有效负载的位置](#client_server)*：在客户端或服务器上。您可以使用 Cookie/标头值将序列化的会话数据传递给客户端，也可以将有效负载存储在服务器上并仅传递会话标识符。

   如果您想在服务器上存储会话有效负载，您可以 *[选择存储方式](#storages)*：在服务器内存中或文件夹中。您还可以实现自定义存储来保存会话数据。
4. *[保护会话数据](#protect_session)*：为了保护传递给客户端的敏感会话数据，您需要对会话的有效负载进行签名并加密。

配置好 `%plugin_name%` 后，您可以在 [路由处理程序](server-routing.md#define_route) 中 [获取并设置会话数据](#use_sessions)。

## 创建数据类 {id="data_class"}

在配置会话之前，您需要创建一个 [数据类](https://kotlinlang.org/docs/data-classes.html) 用于存储会话数据。
例如，下面的 `UserSession` 类将用于存储会话 ID 和页面浏览次数：

```kotlin
@Serializable
data class UserSession(val id: String, val count: Int)
```

如果您打算使用多个会话，则需要创建多个数据类。

## 传递会话数据：Cookie 与标头 {id="cookie_header"}

### Cookie {id="cookie"}
要使用 Cookie 传递会话数据，请在 `install(Sessions)` 块中调用 `cookie` 函数，并指定名称和数据类：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session")
}
```
在上面的示例中，会话数据将使用添加到 `Set-Cookie` 标头的 `user_session` 特性传递给客户端。您可以通过在 `cookie` 块中传递其他 Cookie 特性来配置它们。例如，下面的代码片段显示了如何指定 Cookie 的路径和过期时间：

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
    }
}
```

如果所需的特性没有被显式公开，请使用 `extensions` 属性。例如，您可以按以下方式传递 `SameSite` 特性：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.extensions["SameSite"] = "lax"
    }
}
```
要了解有关可用配置设置的更多信息，请参阅 [CookieConfiguration](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-cookie-configuration/index.html)。

> 在将应用 [部署](server-deployment.md) 到生产环境之前，请确保将 `secure` 属性设置为 `true`。这使得 Cookie 仅能通过 [安全连接](server-ssl.md) 传输，并保护会话数据免受 HTTPS 降级攻击。
>
{type="warning"}

### 标头 {id="header"}
要使用自定义标头传递会话数据，请在 `install(Sessions)` 块中调用 `header` 函数，并指定名称和数据类：

```kotlin
install(Sessions) {
    header<CartSession>("cart_session")
}
```

在上面的示例中，会话数据将使用 `cart_session` 自定义标头传递给客户端。
在客户端，您需要为每个请求附加此标头以获取会话数据。

> 如果您使用 [CORS](server-cors.md) 插件来处理跨域请求，请按如下方式将会话自定义标头添加到 `CORS` 配置中：
> ```kotlin
> install(CORS) {
>     allowHeader("cart_session")
>     exposeHeader("cart_session")
> }
> ```

## 存储会话有效负载：客户端与服务器 {id="client_server"}

在 Ktor 中，您可以通过两种方式管理会话数据：
- _在客户端和服务器之间传递会话数据_。
   
  如果您仅将会话名称传递给 [cookie 或 header](#cookie_header) 函数，会话数据将在客户端和服务器之间传递。在这种情况下，您需要对会话的有效负载进行 [签名并加密](#protect_session)，以保护传递给客户端的敏感会话数据。
- _在服务器上存储会话数据，并且仅在客户端和服务器之间传递会话 ID_。
   
  在这种情况下，您可以选择在服务器上 [存储有效负载的位置](#storages)。例如，您可以将会话数据存储在内存中、指定的文件夹中，或者您可以实现自己的自定义存储。

## 在服务器上存储会话有效负载 {id="storages"}

Ktor 允许您 [在服务器上](#client_server) 存储会话数据，并且仅在服务器和客户端之间传递会话 ID。在这种情况下，您可以选择在服务器上保存有效负载的位置。

### 内存存储 {id="in_memory_storage"}
[SessionStorageMemory](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage-memory/index.html) 允许在内存中存储会话内容。这种存储在服务器运行时保留数据，并在服务器停止后丢弃信息。例如，您可以按如下方式在服务器内存中存储 Cookie：

```kotlin
cookie<CartSession>("cart_session", SessionStorageMemory()) {
}
```

您可以在此处找到完整示例：[session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server)。

> 请注意，`SessionStorageMemory` 仅用于开发。

### 目录存储 {id="directory_storage"}

[directorySessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/directory-session-storage.html) 可用于将会话数据存储在指定目录下的文件中。例如，要将会话数据存储在 `build/.sessions` 目录下的文件中，请按以下方式创建 `directorySessionStorage`：
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
这三个函数都是 [挂起](https://kotlinlang.org/docs/composing-suspending-functions.html) 函数。您可以参考 [SessionStorageMemory](https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-plugins/ktor-server-sessions/common/src/io/ktor/server/sessions/SessionStorageMemory.kt)。

## 保护会话数据 {id="protect_session"}

### 签名会话数据 {id="sign_session"}

对会话数据进行签名可以防止修改会话内容，但允许用户查看这些内容。
要对会话进行签名，请将签名密钥传递给 `SessionTransportTransformerMessageAuthentication` 构造函数，并将此实例传递给 `transform` 函数：

```kotlin
install(Sessions) {
    val secretSignKey = hex("6819b57a326945c1968f45236589")
    cookie<CartSession>("cart_session", SessionStorageMemory()) {
        cookie.path = "/"
        transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
    }
}
```

`SessionTransportTransformerMessageAuthentication` 使用 `HmacSHA256` 作为默认身份验证算法，该算法是可以更改的。 

### 签名并加密会话数据 {id="sign_encrypt_session"}

对会话数据进行签名并加密可以防止读取和修改会话内容。
要对会话进行签名并加密，请将签名/加密密钥传递给 `SessionTransportTransformerEncrypt` 构造函数，并将此实例传递给 `transform` 函数：

```kotlin
install(Sessions) {
    val secretEncryptKey = hex("00112233445566778899aabbccddeeff")
    val secretSignKey = hex("6819b57a326945c1968f45236589")
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
        transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
    }
}
```

> 请注意，在 Ktor 版本 `3.0.0` 中，[加密方法已更新](migrating-3.md#session-encryption-method-update)。如果您是从早期版本迁移，请在 `SessionTransportTransformerEncrypt` 的构造函数中使用 `backwardCompatibleRead` 属性，以确保与现有会话的兼容性。
>
{style="note"}

默认情况下，`SessionTransportTransformerEncrypt` 使用 `AES` 和 `HmacSHA256` 算法，这些算法是可以更改的。 

> 请注意，不应在代码中指定签名/加密密钥。您可以在 [配置文件](server-configuration-file.topic#configuration-file-overview) 中使用自定义组来存储签名/加密密钥，并使用 [环境变量](server-configuration-file.topic#environment-variables) 对其进行初始化。
>
{type="warning"}

## 获取并设置会话内容 {id="use_sessions"}
要为特定 [路由](server-routing.md) 设置会话内容，请使用 `call.sessions` 属性。`set` 方法允许您创建一个新的会话实例：

```kotlin
get("/login") {
    call.sessions.set(UserSession(id = "123abc", count = 0))
    call.respondRedirect("/user")
}
```

要获取会话内容，您可以调用 `get`，并接收一个已注册的会话类型作为类型参数：

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
}
```

要修改会话（例如，递增计数器），您需要调用数据类的 `copy` 方法：

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

当您出于任何原因（例如，用户注销时）需要清除会话时，请调用 `clear` 函数：

```kotlin
get("/logout") {
    call.sessions.clear<UserSession>()
    call.respondRedirect("/user")
}
```

您可以在此处找到完整示例：[session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## 延迟会话检索

默认情况下，Ktor 会尝试为每个包含会话的请求从存储中读取会话，而不管路由是否实际需要它。这种行为可能会导致不必要的开销 —— 特别是在使用自定义会话存储的应用中。

您可以通过启用 `io.ktor.server.sessions.deferred` 系统属性来延迟会话加载：

```kotlin
System.setProperty("io.ktor.server.sessions.deferred", "true")
```

## 示例 {id="examples"}

下面的可运行示例演示了如何使用 `%plugin_name%` 插件：

- [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client) 显示了如何使用 [Cookie](#cookie) 将 [经过签名和加密的](#sign_encrypt_session) 会话有效负载传递给 [客户端](#client_server)。
- [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server) 显示了如何将会话有效负载保留在 [服务器内存](#in_memory_storage) 中，并使用 [Cookie](#cookie) 将 [经过签名](#sign_session) 的会话 ID 传递给客户端。
- [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server) 显示了如何将服务器上的会话有效负载保留在 [目录存储](#directory_storage) 中，并使用 [自定义标头](#header) 将 [经过签名](#sign_session) 的会话 ID 传递给客户端。