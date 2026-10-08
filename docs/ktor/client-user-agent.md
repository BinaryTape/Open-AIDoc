[//]: # (title: User agent)

<primary-label ref="client-plugin"/>

[UserAgent](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-user-agent) 插件会向所有 [请求](client-requests.md) 添加 `User-Agent` 标头。

## 添加依赖项 {id="add_dependencies"}

`UserAgent` 仅需要 [ktor-client-core](client-dependencies.md) 构件，不需要任何特定依赖项。

## 安装并配置 UserAgent {id="install_plugin"}

要安装 `UserAgent`，请将其传递给 [客户端配置块](client-create-and-configure.md#configure-client) 中的 `install` 函数。然后，使用 `agent` 属性指定 `User-Agent` 值：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
// ...
val client = HttpClient(CIO) {
    install(UserAgent) {
        agent = "Ktor client"
    }
}
```

Ktor 还允许您使用相应的函数添加类似浏览器或 curl 的 `User-Agent` 值：

```kotlin
val client = HttpClient(CIO) {
    BrowserUserAgent()
    // ... or
    CurlUserAgent()
}
```
