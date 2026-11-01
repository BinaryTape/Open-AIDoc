[//]: # (title: 重试失败的请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-retry"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpRequestRetry 插件允许你为失败的请求配置重试策略。
</link-summary>

默认情况下，Ktor 客户端不会重试由于网络或服务器错误而失败的[请求](client-requests.md)。
你可以使用 [HttpRequestRetry](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-request-retry) 插件以多种方式为失败的请求配置重试策略：指定重试次数、配置重试请求的条件，或在重试前修改请求。

## 添加依赖项 {id="add_dependencies"}
`HttpRequestRetry` 仅需要 [ktor-client-core](client-dependencies.md) 工件，不需要任何特定依赖项。

## 安装 HttpRequestRetry {id="install_plugin"}

要安装 `HttpRequestRetry`，请在[客户端配置块](client-create-and-configure.md#configure-client)中将其传递给 `install` 函数：
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(HttpRequestRetry)
}
```

如果安装了 [`HttpTimeout`](client-timeout.md) 插件，应首先安装 `HttpRequestRetry`，以便能够为超时配置重试：

```kotlin
val client = HttpClient(CIO) {
    install(HttpRequestRetry) // 应在 HttpTimeout 之前安装
    install(HttpTimeout) {
       // ...
     }
}
```

## 配置 HttpRequestRetry {id="configure_retry"}

### 基本重试配置 {id="basic_config"}

下面的[可运行示例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-retry)展示了如何配置基本重试策略：

```kotlin
val client = HttpClient(CIO) {
    install(HttpRequestRetry) {
        retryOnServerErrors(maxRetries = 5)
        exponentialDelay()
    }
}
```

* `retryOnServerErrors` 函数用于在收到来自服务器的 `5xx` 响应时启用请求重试，并指定重试次数。
* `exponentialDelay` 指定重试之间的指数延迟，该延迟使用指数退避算法（Exponential backoff）计算得出。

你可以从 [HttpRequestRetryConfig](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-request-retry-config) 了解有关支持的配置选项的更多信息。

### 配置重试条件 {id="conditions"}

还有一些配置设置允许你配置重试请求的条件或指定延迟逻辑：

```kotlin
install(HttpRequestRetry) {
    maxRetries = 5
    retryIf { request, response ->
        !response.status.isSuccess()
    }
    retryOnExceptionIf { request, cause -> 
        cause is NetworkError 
    }
    delayMillis { retry -> 
        retry * 3000L 
    } // 分别在 3 秒、6 秒、9 秒等之后重试
}
```

### 在重试前修改请求 {id="modify"}

如果需要在重试前修改请求，请使用 `modifyRequest`：

```kotlin
install(HttpRequestRetry) {
    // 重试条件
    modifyRequest { request ->
        request.headers.append("x-retry-count", retryCount.toString())
    }
}
```