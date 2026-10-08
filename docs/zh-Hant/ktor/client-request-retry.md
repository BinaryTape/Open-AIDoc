[//]: # (title: 重試失敗的請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-retry"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpRequestRetry 外掛程式允許你為失敗的請求配置重試策略。
</link-summary>

預設情況下，Ktor client 不會重試因網路或伺服器錯誤而失敗的[請求](client-requests.md)。
你可以使用 [HttpRequestRetry](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-request-retry) 外掛程式以各種方式配置失敗請求的重試策略：指定重試次數、配置重試請求的條件，或在重試前修改請求。

## 新增相依性 {id="add_dependencies"}
`HttpRequestRetry` 僅需要 [ktor-client-core](client-dependencies.md) 構件，不需要任何特定的相依性。

## 安裝 HttpRequestRetry {id="install_plugin"}

要安裝 `HttpRequestRetry`，請將其傳遞給 [client 配置區塊](client-create-and-configure.md#configure-client) 內的 `install` 函式：
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(HttpRequestRetry)
}
```

如果安裝了 [`HttpTimeout`](client-timeout.md) 外掛程式，則應先安裝 `HttpRequestRetry`，以便能夠為逾時配置重試：

```kotlin
val client = HttpClient(CIO) {
    install(HttpRequestRetry) // 應在 HttpTimeout 之前安裝
    install(HttpTimeout) {
       // ...
     }
}
```

## 配置 HttpRequestRetry {id="configure_retry"}

### 基本重試配置 {id="basic_config"}

下方的 [可執行範例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-retry) 顯示了如何配置基本的重試策略：

```kotlin
val client = HttpClient(CIO) {
    install(HttpRequestRetry) {
        retryOnServerErrors(maxRetries = 5)
        exponentialDelay()
    }
}
```

* `retryOnServerErrors` 函式可在收到伺服器的 `5xx` 回應時啟用請求重試，並指定重試次數。
* `exponentialDelay` 指定重試之間的指數延遲，這是使用指數退避（Exponential backoff）演算法計算的。

你可以從 [HttpRequestRetryConfig](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-request-retry-config) 了解更多受支援的配置選項。

### 配置重試條件 {id="conditions"}

還有一些配置設定允許你配置重試請求的條件或指定延遲邏輯：

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
    } // 分別在 3、6、9 等秒數後重試
}
```

### 在重試前修改請求 {id="modify"}

如果你需要在重試前修改請求，請使用 `modifyRequest`：

```kotlin
install(HttpRequestRetry) {
    // 重試條件
    modifyRequest { request ->
        request.headers.append("x-retry-count", retryCount.toString())
    }
}
```
