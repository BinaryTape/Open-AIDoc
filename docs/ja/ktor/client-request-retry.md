[//]: # (title: 失敗したリクエストの再試行)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-retry"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpRequestRetry プラグインを使用すると、失敗したリクエストに対する再試行ポリシーを設定できます。
</link-summary>

デフォルトでは、Ktor クライアントはネットワークエラーやサーバーエラーが原因で失敗した[リクエスト](client-requests.md)を再試行しません。
[HttpRequestRetry](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-request-retry) プラグインを使用すると、失敗したリクエストに対する再試行ポリシーをさまざまな方法で設定できます。たとえば、再試行回数の指定、リクエストを再試行する条件の設定、再試行前のリクエストの変更などが可能です。

## 依存関係の追加 {id="add_dependencies"}
`HttpRequestRetry` は [ktor-client-core](client-dependencies.md) アーティファクトのみを必要とし、特定の依存関係を追加する必要はありません。

## HttpRequestRetry のインストール {id="install_plugin"}

`HttpRequestRetry` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡します。
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(HttpRequestRetry)
}
```

[`HttpTimeout`](client-timeout.md) プラグインがインストールされている場合、タイムアウトに対する再試行を設定できるようにするため、`HttpRequestRetry` を先にインストールする必要があります。

```kotlin
val client = HttpClient(CIO) {
    install(HttpRequestRetry) // HttpTimeout より前にインストールする必要があります
    install(HttpTimeout) {
       // ...
     }
}
```

## HttpRequestRetry の設定 {id="configure_retry"}

### 基本的な再試行設定 {id="basic_config"}

以下の[実行可能な例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-retry)は、基本的な再試行ポリシーを設定する方法を示しています。

```kotlin
val client = HttpClient(CIO) {
    install(HttpRequestRetry) {
        retryOnServerErrors(maxRetries = 5)
        exponentialDelay()
    }
}
```

* `retryOnServerErrors` 関数は、サーバーから `5xx` レスポンスを受信した場合にリクエストの再試行を有効にし、最大再試行回数を指定します。
* `exponentialDelay` は、指数バックオフ（Exponential backoff）アルゴリズムを使用して計算される、再試行間の指数関数的な遅延を指定します。

サポートされている設定オプションの詳細については、[HttpRequestRetryConfig](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-request-retry-config) を参照してください。

### 再試行条件の設定 {id="conditions"}

リクエストを再試行する条件を設定したり、遅延ロジックを指定したりするための設定も用意されています。

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
    } // 3秒、6秒、9秒などの間隔で再試行
}
```

### 再試行前のリクエストの変更 {id="modify"}

再試行する前にリクエストを変更する必要がある場合は、`modifyRequest` を使用します。

```kotlin
install(HttpRequestRetry) {
    // 再試行条件
    modifyRequest { request ->
        request.headers.append("x-retry-count", retryCount.toString())
    }
}
```