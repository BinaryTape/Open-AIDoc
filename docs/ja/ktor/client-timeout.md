[//]: # (title: タイムアウト)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-timeout"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HttpTimeout](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout) プラグインを使用すると、以下のタイムアウトを設定できます:
* __リクエストタイムアウト（request timeout）__ — リクエストの送信からレスポンスの受信まで、HTTP呼び出しの処理に必要な期間。
* __接続タイムアウト（connection timeout）__ — クライアントがサーバーとの接続を確立するまでの期間。
* __ソケットタイムアウト（socket timeout）__ — サーバーとのデータやり取り時における、2つのデータパケット間の最大無通信時間。

これらのタイムアウトは、すべてのリクエストに対して指定することも、特定のリクエストに対してのみ指定することもできます。

## 依存関係の追加 {id="add_dependencies"}
`HttpTimeout` は [ktor-client-core](client-dependencies.md) アーティファクトのみを必要とし、特定の依存関係を追加する必要はありません。

## HttpTimeoutのインストール {id="install_plugin"}

`HttpTimeout` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client) 内の `install` 関数に渡します:
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(HttpTimeout)
}
```

## タイムアウトの設定 {id="configure_plugin"}

タイムアウトを設定するには、対応するプロパティを使用できます:

* [requestTimeoutMillis](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout-config/request-timeout-millis.html)
  は、リクエストの送信からレスポンスの受信までのHTTP呼び出し全体に対するタイムアウトを指定します。
* [connectTimeoutMillis](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout-config/connect-timeout-millis.html)
  は、サーバーとの接続確立に対するタイムアウトを指定します。
* [socketTimeoutMillis](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-timeout-config/socket-timeout-millis.html)
  は、サーバーとのデータやり取り時における2つのデータパケット間の最大時間に対するタイムアウトを指定します。

`install` ブロック内ですべてのリクエストに対するタイムアウトを指定できます。以下のコードサンプルは、`requestTimeoutMillis` を使用してリクエストタイムアウトを設定する方法を示しています:
```kotlin
val client = HttpClient(CIO) {
    install(HttpTimeout) {
        requestTimeoutMillis = 1000
    }
}
```

特定のリクエストに対してのみタイムアウトを設定する必要がある場合は、[HttpRequestBuilder.timeout](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/timeout.html) プロパティを使用します:

```kotlin
val response: HttpResponse = client.get("http://0.0.0.0:8080/path1") {
    timeout {
        requestTimeoutMillis = 3000
    }
}
```

特定のリクエストに指定されたタイムアウトは、`install` ブロックのグローバルなタイムアウトを上書きすることに注意してください。

タイムアウトが発生した場合、Ktorは `HttpRequestTimeoutException`、`ConnectTimeoutException`、または `SocketTimeoutException` をスローします。

## 制限事項 {id="limitations"}

`HttpTimeout` には、特定の[エンジン](client-engines.md)に関するいくつかの制限事項があります。以下の表は、各エンジンでサポートされているタイムアウトを示しています:

| エンジン                           | リクエストタイムアウト | 接続タイムアウト | ソケットタイムアウト |
|------------------------------------|-----------------|-----------------|----------------|
| [Darwin](client-engines.md#darwin) | ✅️              | ✖️              | ✅️             |
| [JavaScript](client-engines.md#js) | ✅               | ✖️              | ✖️             |
| [Curl](client-engines.md#curl)     | ✅               | ✅️              | ✖️             |
| [MockEngine](client-testing.md)    | ✅               | ✖️              | ✅              |