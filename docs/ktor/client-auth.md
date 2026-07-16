[//]: # (title: Ktor Client 中的身份验证与授权)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-client-auth</code>
</p>
</tldr>

<link-summary>
Auth 插件用于在客户端应用程序中处理身份验证与授权。
</link-summary>

Ktor 提供了 [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) 插件来处理客户端应用程序中的身份验证与授权。典型的使用场景包括用户登录和获取特定资源的访问权限。

> 在服务器上，Ktor 提供了 [`Authentication`](server-auth.md) 插件来处理身份验证与授权。
> 
{style="tip"}

## 支持的身份验证类型 {id="supported"}

HTTP 为访问控制和身份验证提供了一个[通用框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。Ktor 客户端允许您使用以下 HTTP 身份验证方案：

* [Basic](client-basic-auth.md) - 使用 `Base64` 编码来提供用户名和密码。如果不与 HTTPS 结合使用，通常不建议使用。
* [Digest](client-digest-auth.md) - 一种身份验证方法，通过对用户名和密码应用哈希函数，以加密形式传输用户凭据。
* [Bearer](client-bearer-auth.md) - 一种涉及安全令牌（称为持有者令牌）的身份验证方案。例如，您可以将此方案作为 OAuth 流程的一部分，通过使用 Google、Facebook 和 X 等外部提供商来授权应用程序的用户。

## 添加依赖项 {id="add_dependencies"}

要启用身份验证，您需要在构建脚本中包含 `ktor-client-auth` 构件：

<var name="artifact_name" value="ktor-client-auth"/>
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
<tip>
    要了解更多关于 Ktor 客户端所需构件的信息，请参阅 <Links href="/ktor/client-dependencies" summary="Learn how to add client dependencies to an existing project.">添加客户端依赖项</Links>。
</tip>

## 安装 Auth {id="install_plugin"}

要安装 `Auth` 插件，请将其传递给 [客户端配置块](client-create-and-configure.md#configure-client) 内的 `install()` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
    install(Auth) {
        // 配置身份验证
    }
}
```

## 配置身份验证 {id="configure_authentication"}

### 选择身份验证提供程序 {id="choose-provider"}

要使用特定的身份验证提供程序（[`basic`](client-basic-auth.md)、[`digest`](client-digest-auth.md) 或 [`bearer`](client-bearer-auth.md)），请在 `install {}` 块内调用相应的函数。

例如，要配置 basic 身份验证，请使用 [`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 函数：

```kotlin
install(Auth) {
    basic {
        // 配置 basic 身份验证
    }
}
```

在该块内，您可以配置特定于此提供程序的设置。

> 有关特定提供程序的设置，请参阅相应的主题：
> * [Basic 身份验证](client-basic-auth.md)
> * [Digest 身份验证](client-digest-auth.md)
> * [Bearer 身份验证](client-bearer-auth.md)
> 
{style="tip"}

### 配置领域 (realm) {id="realm"}

（可选）您可以使用 `realm` 属性配置领域：

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

您可以创建多个具有不同领域的提供程序来访问不同的资源：

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
    basic {
        realm = "Access to the '/admin' path"
        // ...
    }
}
```

在这种情况下，客户端会根据包含该领域的 `WWW-Authenticate` 响应头选择必要的提供程序。

## 提供程序选择

当服务器返回 `401 Unauthorized` 时，客户端会根据 `WWW-Authenticate` 响应头选择身份验证提供程序。该响应头指定了服务器接受哪些身份验证方案。

如果客户端只安装了一个身份验证提供程序，当服务器返回 `401 Unauthorized` 时，即使 `WWW-Authenticate` 响应头缺失或指定了不同的方案，`Auth` 插件也始终会尝试该提供程序。

如果客户端安装了多个身份验证提供程序，客户端会根据 `WWW-Authenticate` 响应头选择提供程序。

## 令牌缓存与缓存控制 {id="token-caching"}

[basic](client-basic-auth.md) 和 [bearer](client-bearer-auth.md) 身份验证提供程序维护着一个内部凭据或令牌缓存。该缓存允许客户端重复使用先前加载的身份验证数据，而不是为每个请求重新加载，从而在保持对凭据更改的完全控制的同时提高性能。

### 访问身份验证提供程序

当在客户端会话期间需要动态更新身份验证状态时，您可以使用 `authProvider` 扩展访问特定的提供程序：

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

要检索所有已安装的提供程序，请使用 `authProviders` 属性：

```kotlin
val providers = client.authProviders
```

这些工具允许您以编程方式检查提供程序或清除缓存的令牌。

### 清除缓存的令牌

要清除单个提供程序的缓存凭据，请使用 `.clearToken()` 函数：

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

要清除所有支持清除缓存的身份验证提供程序中的缓存令牌，请使用 `.clearAuthTokens()` 函数：

```kotlin
client.clearAuthTokens()
```

清除缓存的令牌通常用于以下场景：

* 当用户注销时。
* 当您的应用程序存储的凭据或令牌发生更改时。
* 当您需要强制提供程序在下次请求时重新加载身份验证状态时。

以下是一个在用户注销时清除缓存令牌的示例：

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### 控制缓存行为

Basic 和 Bearer 身份验证提供程序都允许您使用 `cacheTokens` 选项来控制是否在请求之间缓存令牌或凭据。

例如，当凭据是动态提供时，您可以禁用缓存：

```kotlin
basic {
    cacheTokens = false   // 为每个请求重新加载凭据
    credentials {
        loadCurrentCredentials()
    }
}
```

当身份验证数据频繁更改或必须反映最新状态时，禁用令牌缓存特别有用。