[//]: # (title: Ktor Client 中的身份验证与授权)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:ktor-client-auth</code>
</p>
</tldr>

<link-summary>
Auth 插件用于处理客户端应用程序中的身份验证与授权。
</link-summary>

Ktor 提供了 [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) 插件，用于处理客户端应用程序中的身份验证与授权。典型使用场景包括用户登录以及获取对特定资源的访问权限。

> 在服务器端，Ktor 提供了 [`Authentication`](server-auth.md) 插件来处理身份验证与授权。
> 
{style="tip"}

## 支持的身份验证类型 {id="supported"}

HTTP 为访问控制和身份验证提供了一个[通用框架](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。Ktor 客户端允许你使用以下 HTTP 身份验证方案：

* [Basic](client-basic-auth.md) - 使用 `Base64` 编码提供用户名和密码。如果不与 HTTPS 结合使用，通常不推荐使用。
* [Digest](client-digest-auth.md) - 一种身份验证方法，通过对用户名和密码应用哈希函数，以加密形式传输用户凭据。
* [Bearer](client-bearer-auth.md) - 一种涉及称为 Bearer 令牌的安全令牌的身份验证方案。例如，你可以将此方案用作 OAuth 流程的一部分，通过使用外部提供商（如 Google、Facebook 和 X）对应用程序的用户进行授权。

## 添加依赖项 {id="add_dependencies"}

要启用身份验证，请在构建脚本中包含 `ktor-client-auth` 构件：

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
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
<tip>
    要详细了解 Ktor 客户端所需的构件，请参阅 <Links href="client-dependencies.md" summary="了解如何向现有项目中添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 安装 Auth {id="install_plugin"}

要安装 `Auth` 插件，请在[客户端配置块](client-create-and-configure.md#configure-client)中将其传递给 `install()` 函数：

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

例如，要配置基本身份验证，请使用 [`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 函数：

```kotlin
install(Auth) {
    basic {
        // 配置基本身份验证
    }
}
```

在该代码块内，你可以配置特定于此提供程序的设置。

> 有关特定于提供程序的设置，请参阅相应的主题：
> * [Basic 身份验证](client-basic-auth.md)
> * [Digest 身份验证](client-digest-auth.md)
> * [Bearer 身份验证](client-bearer-auth.md)
> 
{style="tip"}

### 配置 realm {id="realm"}

你可以选择使用 `realm` 属性配置领域（realm）：

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

你可以创建多个具有不同 realm 的提供程序来访问不同的资源：

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

在这种情况下，客户端会根据包含 realm 的 `WWW-Authenticate` 响应标头选择所需的提供程序。

## 提供程序选择 {id="provider-selection"}

当服务器返回 `401 Unauthorized` 时，客户端会根据 `WWW-Authenticate` 响应标头选择身份验证提供程序。该标头指定了服务器接受的身份验证方案。

如果客户端仅安装了一个身份验证提供程序，则当服务器返回 `401 Unauthorized` 时，`Auth` 插件始终会尝试该提供程序，即使缺少 `WWW-Authenticate` 标头或指定了不同的方案也是如此。

如果客户端安装了多个身份验证提供程序，则客户端会根据 `WWW-Authenticate` 标头选择提供程序。

## 令牌缓存与缓存控制 {id="token-caching"}

[basic](client-basic-auth.md) 和 [bearer](client-bearer-auth.md) 身份验证提供程序维护了一个内部凭据或令牌缓存。该缓存允许客户端复用之前加载的身份验证数据，而不是在每次请求时都重新加载，从而在凭据更改时仍能保持完全控制的同时提高性能。

### 访问身份验证提供程序 {id="accessing-authentication-providers"}

当需要在客户端会话期间动态更新身份验证状态时，可以使用 `authProvider` 扩展访问特定的提供程序：

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

要检索所有已安装的提供程序，请使用 `authProviders` 属性：

```kotlin
val providers = client.authProviders
```

这些实用工具允许你以编程方式检查提供程序或清除缓存的令牌。

### 清除缓存的令牌 {id="clearing-cached-tokens"}

要清除单个提供程序缓存的凭据，请使用 `.clearToken()` 函数：

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

要在所有支持清除缓存的身份验证提供程序中清除缓存的令牌，请使用 `.clearAuthTokens()` 函数：

```kotlin
client.clearAuthTokens()
```

清除缓存的令牌通常用于以下场景：

* 用户注销登录时。
* 应用程序存储的凭据或令牌发生更改时。
* 需要强制提供程序在下一次请求时重新加载身份验证状态时。

以下是用户注销登录时清除缓存令牌的示例：

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### 控制缓存行为 {id="controlling-caching-behavior"}

Basic 和 Bearer 身份验证提供程序都允许你使用 `cacheTokens` 选项来控制是否在请求之间缓存令牌或凭据。

例如，当凭据是动态提供时，你可以禁用缓存：

```kotlin
basic {
    cacheTokens = false   // 每次请求都重新加载凭据
    credentials {
        loadCurrentCredentials()
    }
}
```

当身份验证数据频繁更改或必须反映最新状态时，禁用令牌缓存尤其有用。