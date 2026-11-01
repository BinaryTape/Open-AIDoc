[//]: # (title: 超时)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-timeout"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HttpTimeout](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout) 插件允许你配置以下超时：
* **请求超时 (request timeout)** — 处理一次 HTTP 调用所需的时间：从发送请求到接收响应。
* **连接超时 (connection timeout)** — 客户端与服务器建立连接应花费的时间。
* **Socket 超时 (socket timeout)** — 与服务器交换数据时，两个数据包之间的最大空闲时间。

你可以为所有请求指定这些超时，也可以仅针对特定请求进行指定。

## 添加依赖项 {id="add_dependencies"}
`HttpTimeout` 仅需要 [ktor-client-core](client-dependencies.md) 构件，不需要任何额外的特定依赖项。

## 安装 HttpTimeout {id="install_plugin"}

要安装 `HttpTimeout`，请在[客户端配置块](client-create-and-configure.md#configure-client)内将其传递给 `install` 函数：
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(HttpTimeout)
}
```

## 配置超时 {id="configure_plugin"}

要配置超时，可以使用相应的属性：

* [requestTimeoutMillis](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout-config/request-timeout-millis.html)
  指定整个 HTTP 调用的超时时间，即从发送请求到接收响应的时间。
* [connectTimeoutMillis](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout-config/connect-timeout-millis.html)
  指定与服务器建立连接的超时时间。
* [socketTimeoutMillis](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout-config/socket-timeout-millis.html)
  指定与服务器交换数据时，两个数据包之间的最大空闲间隔超时时间。

你可以在 `install` 块内为所有请求指定超时。下面的代码示例展示了如何使用 `requestTimeoutMillis` 设置请求超时：
```kotlin
val client = HttpClient(CIO) {
    install(HttpTimeout) {
        requestTimeoutMillis = 1000
    }
}
```

如果只需要为特定请求设置超时，请使用 [HttpRequestBuilder.timeout](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/timeout.html) 属性：

```kotlin
val response: HttpResponse = client.get("http://0.0.0.0:8080/path1") {
    timeout {
        requestTimeoutMillis = 3000
    }
}
```

请注意，为特定请求指定的超时会覆盖 `install` 块中的全局超时。

在发生超时的情况下，Ktor 会抛出 `HttpRequestTimeoutException`、`ConnectTimeoutException` 或 `SocketTimeoutException`。

## 限制 {id="limitations"}

`HttpTimeout` 对某些特定的[引擎](client-engines.md)存在限制。下表显示了这些引擎支持哪些超时：

| 引擎                               | 请求超时 | 连接超时 | Socket 超时 |
|------------------------------------|-----------------|-----------------|----------------|
| [Darwin](client-engines.md#darwin) | ✅️              | ✖️              | ✅️             |
| [JavaScript](client-engines.md#js) | ✅               | ✖️              | ✖️             |
| [Curl](client-engines.md#curl)     | ✅               | ✅️              | ✖️             |
| [MockEngine](client-testing.md)    | ✅               | ✖️              | ✅              |