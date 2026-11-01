[//]: # (title: デフォルトリクエスト)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-default-request"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
DefaultRequest プラグインを使用すると、すべてのリクエストに対するデフォルトのパラメータを設定できます。
</link-summary>

[`DefaultRequest`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-default-request/index.html) プラグインを使用すると、すべての[リクエスト](client-requests.md)に対するデフォルトパラメータを設定できます。ベース URL の指定、ヘッダーの追加、クエリパラメータの設定などが行えます。

## 依存関係の追加 {id="add_dependencies"}

`DefaultRequest` は [ktor-client-core](client-dependencies.md) アーティファクトのみを必要とし、特定の依存関係を追加する必要はありません。

## DefaultRequest のインストール {id="install_plugin"}

`DefaultRequest` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡します。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(DefaultRequest)
}
```

または、`defaultRequest()` 関数を呼び出して必要なリクエストパラメータを[設定](#configure)します。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    defaultRequest {
        // this: DefaultRequestBuilder
    }
}
```

### 既存の設定の置き換え {id="default_request_replace"}

`DefaultRequest` プラグインがすでにインストールされている場合、以下のいずれかの方法で既存の設定を置き換えることができます。

- `defaultRequest()` 関数の `replace` パラメータを使用する:

```kotlin
val client = HttpClient(CIO) {
    defaultRequest(replace = true) {
        // this: DefaultRequestBuilder
    }
}
```

- 汎用の `installOrReplace()` 関数を使用する:

```kotlin
val client = HttpClient(CIO) {
    installOrReplace(DefaultRequest) {
        // this: DefaultRequestBuilder
    }
}
```

## DefaultRequest の設定 {id="configure"}

### ベース URL {id="url"}

`DefaultRequest` を使用すると、[リクエスト URL](client-requests.md#url) とマージされる URL のベース部分を設定できます。
たとえば、以下の `url` 関数はすべてのリクエストのベース URL を指定します。

```kotlin
defaultRequest {
    url("https://ktor.io/docs/")
}
```

上記の設定を行ったクライアントを使用して以下のリクエストを行うと、...

```kotlin
val response: HttpResponse = client.get("welcome.html")
```

... 解決される URL は次のようになります: `https://ktor.io/docs/welcome.html`。
ベース URL とリクエスト URL がどのようにマージされるかについては、[DefaultRequest](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-default-request/index.html) を参照してください。

> ベース URL のパスは末尾のスラッシュで終わる必要があります。そうでない場合、[RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-5.2) の URL 解決ルールに従って、リクエストパスによってベースパスの最後のセグメントが置き換えられます。たとえば、`path("v1")` はファイルとして扱われ、リクエストパスが追加されたときに破棄されますが、`path("v1/")` はディレクトリプレフィックスとして保持されます。
>
{style="note"}

### URL パラメータ {id="url-params"}

`url` 関数を使用すると、次のように URL コンポーネントを個別に指定することもできます。
- HTTP スキーム
- ホスト名
- ベース URL パス
- クエリパラメータ

```kotlin
url {
    protocol = URLProtocol.HTTPS
    host = "ktor.io"
    path("docs/")
    parameters.append("token", "abc123")
}
```

### ヘッダー {id="headers"}

各リクエストに特定のヘッダーを追加するには、`header` 関数を使用します。

```kotlin
defaultRequest {
    header("X-Custom-Header", "Hello")
}
```

ヘッダーの重複を避けるために、`appendIfNameAbsent`、`appendIfNameAndValueAbsent`、`contains` 関数を使用できます。

```kotlin
defaultRequest {
    headers.appendIfNameAbsent("X-Custom-Header", "Hello")
}
```

### Unix ドメインソケット {id="unix-domain-sockets"}

> Unix ドメインソケットは CIO エンジンでのみサポートされています。
>
{style="note"}

[Unix ドメインソケットを使用して個別のリクエストを構築](client-requests.md#specify-a-unix-domain-socket)することもできますが、ソケットパラメータを持つデフォルトリクエストを設定することも可能です。

これを行うには、たとえばソケットへのパスを指定した `unixSocket` を `defaultRequest` 関数内で呼び出します。

```kotlin
val client = HttpClient(CIO)

// Unix ドメインソケットへ単一のリクエストを送信
val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}

// そのクライアントからのすべてのリクエストに対してソケットを設定
val clientDefault = HttpClient(CIO) {
    defaultRequest {
        unixSocket("/tmp/test-unix-socket-ktor.sock")
    }    
}

val response: HttpResponse = clientDefault.get("/")
```

## 例 {id="example"}

以下の例では、次の `DefaultRequest` 設定を使用しています。
* `url` 関数で HTTP スキーム、ホスト、ベース URL パス、クエリパラメータを定義しています。
* `header` 関数ですべてのリクエストにカスタムヘッダーを追加しています。

```kotlin
val client = HttpClient(CIO) {
    defaultRequest {
        url {
            protocol = URLProtocol.HTTPS
            host = "ktor.io"
            path("docs/")
            parameters.append("token", "abc123")
        }
        header("X-Custom-Header", "Hello")
    }
}
```

このクライアントによる以下のリクエストは後半のパスセグメントのみを指定しており、`DefaultRequest` に設定されたパラメータが自動的に適用されます。

```kotlin
val response: HttpResponse = client.get("welcome.html")
println(response.status)
```

完全な例はこちらにあります: [client-default-request](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-default-request)。