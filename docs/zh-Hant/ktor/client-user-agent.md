[//]: # (title: User Agent)

<primary-label ref="client-plugin"/>

[UserAgent](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-user-agent) 外掛程式可將 `User-Agent` 標頭新增至所有 [請求](client-requests.md)。

## 新增相依性 {id="add_dependencies"}

`UserAgent` 僅需要 [ktor-client-core](client-dependencies.md) 構件，不需要任何特定的相依性。

## 安裝與配置 UserAgent {id="install_plugin"}

要安裝 `UserAgent`，請將其傳遞至 [用戶端配置區塊](client-create-and-configure.md#configure-client) 內的 `install` 函式。接著，使用 `agent` 屬性來指定 `User-Agent` 值：

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

Ktor 也允許您使用對應的函式來新增類瀏覽器或類 curl 的 `User-Agent` 值：

```kotlin
val client = HttpClient(CIO) {
    BrowserUserAgent()
    // ... 或
    CurlUserAgent()
}
```
