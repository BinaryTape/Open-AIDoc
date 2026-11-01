[//]: # (title: Cookie)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-cookies"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCookies 插件会自动处理 Cookie，并在各次调用之间将其保存在存储中。
</link-summary>

Ktor 客户端允许你通过以下方式手动处理 Cookie：
* `cookie` 函数允许你向[特定请求](client-requests.md#cookies)附加 Cookie。
* `setCookie` 函数支持解析在[响应](client-responses.md#headers)中接收到的 `Set-Cookie` 标头值。

[HttpCookies](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cookies/-http-cookies/index.html) 插件会自动处理 Cookie，并在各次调用之间将其保存在存储中。
默认情况下，它使用内存存储，但你也可以使用 [CookiesStorage](#custom_storage) 实现持久化存储。

## 添加依赖项 {id="add_dependencies"}
`HttpCookies` 仅需要 [ktor-client-core](client-dependencies.md) 构件，不需要任何特定的依赖项。

## 安装并配置 HttpCookies {id="install_plugin"}

要安装 `HttpCookies`，请在[客户端配置块](client-create-and-configure.md#configure-client)内将其传递给 `install` 函数：
```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies)
}
```

这足以让 Ktor 客户端在各个请求之间保留 Cookie。你可以在此处找到完整示例：[client-cookies](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-cookies)。

`HttpCookies` 插件还允许你通过使用 `ConstantCookiesStorage` 为每个请求添加一组特定的 Cookie。这在验证服务器响应的测试用例中非常有用。以下示例展示了如何向针对特定网域的所有请求添加指定的 Cookie：

```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies) {
        storage = ConstantCookiesStorage(Cookie(name = "user_name", value = "jetbrains", domain = "0.0.0.0"))
    }
}
```

## 获取 Cookie {id="get_cookies"}

客户端提供了 `cookies` 函数以获取指定 URL 的所有 Cookie：

```kotlin
client.cookies("http://0.0.0.0:8080/")
```

## 自定义 Cookie 存储 {id="custom_storage"}

如有需要，你可以通过实现 [CookiesStorage](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cookies/-cookies-storage/index.html) 接口来创建自定义 Cookie 存储：

```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies) {
        storage = CustomCookiesStorage()
    }
}

public class CustomCookiesStorage : CookiesStorage {
    // ...
}
```

你可以参考 [AcceptAllCookiesStorage](https://github.com/ktorio/ktor/blob/main/ktor-client/ktor-client-core/common/src/io/ktor/client/plugins/cookies/AcceptAllCookiesStorage.kt) 作为实现参考。