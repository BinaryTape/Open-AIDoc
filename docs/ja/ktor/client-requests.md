[//]: # (title: リクエストの送信)

<show-structure for="chapter" depth="2"/>

[percent_encoding]: https://en.wikipedia.org/wiki/Percent-encoding

<tldr>
<var name="example_name" value="client-configure-request"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
リクエストの送信方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について学びます。
</link-summary>

[クライアントの設定](client-create-and-configure.md)が完了したら、HTTPリクエストの送信を開始できます。これを行う主な方法は、URLをパラメータとして受け取る[`.request()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/request.html)関数を使用することです。この関数内では、さまざまなリクエストパラメータを設定できます。

* `GET`、`POST`、`PUT`、`DELETE`、`HEAD`、`OPTIONS`、`PATCH`などのHTTPメソッドを指定する。
* URLを文字列として設定するか、その構成要素（ドメイン、パス、クエリパラメータなど）を個別に設定する。
* Unixドメインソケットを使用する。
* ヘッダーやCookieを追加する。
* リクエストボディ（プレーンテキスト、データオブジェクト、フォームパラメータなど）を含める。

これらのパラメータは、[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)クラスによって提供されます。

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*

val response: HttpResponse = client.request("https://ktor.io/") {
  // HttpRequestBuilderが提供するリクエストパラメータを設定
}
```

{interpolate-variables="true" disable-links="false"}

`.request()`関数はレスポンスを`HttpResponse`オブジェクトとして返します。`HttpResponse`は、文字列やJSONオブジェクトなどのさまざまな形式でレスポンスボディを取得するためのAPIや、ステータスコード、コンテンツタイプ、ヘッダーなどのレスポンスパラメータを取得するためのAPIを提供します。詳細については、[レスポンスの受信](client-responses.md)を参照してください。

> `.request()`は中断関数（suspending function）であり、コルーチン内または他の中断関数から呼び出す必要があります。中断関数の詳細については、[Coroutines basics](https://kotlinlang.org/docs/coroutines-basics.html)を参照してください。

### HTTPメソッドの指定 {id="http-method"}

`.request()`関数を呼び出す際、`method`プロパティを使用して任意のHTTPメソッドを指定できます。

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.request("https://ktor.io/") {
    method = HttpMethod.Get
}
```

`.request()`に加えて、`HttpClient`は[`.get()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html)、[`.post()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/post.html)、[`.put()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/put.html)といった基本的なHTTPメソッド専用の関数も提供しています。上記の例は、`.get()`関数を使用して簡略化できます。

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

どちらの例でも、リクエストURLは文字列として指定されています。[`HttpRequestBuilder`](#url)を使用して、URLの構成要素を個別に設定することもできます。

## リクエストURLの指定 {id="url"}

Ktorクライアントでは、いくつかの方法でリクエストURLを設定できます。

### URL文字列全体を渡す {id="pass-the-entire-url-string"}

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

### URLの構成要素を個別に設定する {id="configure-url-components-separately"}

```kotlin
client.get {
    url {
        protocol = URLProtocol.HTTPS
        host = "ktor.io"
        path("docs/welcome.html")
    }
}
```

この場合、`HttpRequestBuilder`によって提供される`url`パラメータが使用されます。これは[`URLBuilder`](https://api.ktor.io/ktor-http/io.ktor.http/-u-r-l-builder/index.html)のインスタンスを受け取り、複雑なURLを構築する際の柔軟性を高めます。

> すべてのリクエストに対するベースURLを設定するには、[`DefaultRequest`](client-default-request.md#url)プラグインを使用します。

### パスセグメント {id="path_segments"}

前の例では、URLパス全体が`URLBuilder.path`プロパティを使用して指定されていました。あるいは、`appendPathSegments()`関数を使用して個別のパスセグメントを渡すこともできます。

```kotlin
client.get("https://ktor.io") {
    url {
        appendPathSegments("docs", "welcome.html")
    }
}
```

デフォルトでは、`appendPathSegments`はパスセグメントを[エンコード][percent_encoding]します。エンコードを無効にするには、代わりに`appendEncodedPathSegments()`を使用してください。

### クエリパラメータ {id="query_parameters"}

<emphasis tooltip="query_string">クエリ文字列</emphasis>パラメータを追加するには、`URLBuilder.parameters`プロパティを使用します。

```kotlin
client.get("https://ktor.io") {
    url {
        parameters.append("token", "abc123")
    }
}
```

デフォルトでは、`parameters`はクエリパラメータを[エンコード][percent_encoding]します。エンコードを無効にするには、代わりに`encodedParameters()`を使用してください。

> `trailingQuery`プロパティを使用すると、クエリパラメータがない場合でも`?`文字を保持できます。

### URLフラグメント {id="url-fragment"}

ハッシュマーク`#`は、URLの末尾近くにある省略可能なフラグメントを示します。URLフラグメントは`fragment`プロパティを使用して設定できます。

```kotlin
client.get("https://ktor.io") {
    url {
        fragment = "some_anchor"
    }
}
```

デフォルトでは、`fragment`はURLフラグメントを[エンコード][percent_encoding]します。エンコードを無効にするには、代わりに`encodedFragment()`を使用してください。

## Unixドメインソケットの指定 {id="specify-a-unix-domain-socket"}

> UnixドメインソケットはCIOエンジンでのみサポートされています。
> KtorサーバーでUnixソケットを使用するには、それに応じて[サーバーを設定](server-configuration-code.topic#cio-code)してください。
>
{style="note"}

Unixドメインソケットをリッスンしているサーバーにリクエストを送信するには、CIOクライアントを使用する際に`unixSocket()`関数を呼び出します。

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

また、[デフォルトリクエスト](client-default-request.md#unix-domain-sockets)の一部としてUnixドメインソケットを設定することもできます。

## リクエストパラメータの設定 {id="parameters"}

HTTPメソッド、ヘッダー、Cookieなど、さまざまなリクエストパラメータを指定できます。特定のクライアントのすべてのリクエストに対してデフォルトパラメータを設定する必要がある場合は、[`DefaultRequest`](client-default-request.md)プラグインを使用します。

### ヘッダー {id="headers"}

リクエストにヘッダーを追加する方法はいくつかあります。

#### 複数のヘッダーを追加する {id="add-multiple-headers"}

[`headers`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/headers.html)関数を使用すると、一度に複数のヘッダーを追加できます。

```kotlin
client.get("https://ktor.io") {
    headers {
        append(HttpHeaders.Accept, "text/html")
        append(HttpHeaders.Authorization, "abc123")
        append(HttpHeaders.UserAgent, "ktor client")
    }
}
```

また、`Map`または`vararg Pair`を指定して`appendAll()`関数を使用すると、複数のヘッダーを簡単に追加できます。

```kotlin
        client.get("https://ktor.io") {
            headers {
                // vararg Pairを使用
                appendAll(
                    HttpHeaders.Accept to "text/html",
                    HttpHeaders.Authorization to "abc123"
                )

                // Mapを使用
                appendAll(mapOf("foo" to "bar", "baz" to "qux"))
                appendAll(mapOf("test" to listOf("1", "2", "3")))

                // 複数の値を持つカスタムヘッダーを使用
                appendAll("X-Custom-Header" to listOf("val1", "val2"))
            }
        }
```

#### 単一のヘッダーを追加する {id="add-a-single-header"}

[`header`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/header.html)関数を使用すると、単一のヘッダーを追加できます。

#### 認証に`basicAuth`または`bearerAuth`を使用する {id="use-basicauth-or-bearerauth-for-authorization"}

`basicAuth`関数と`bearerAuth`関数は、対応するHTTPスキームで`Authorization`ヘッダーを追加します。

> 高度な認証設定については、[Authentication and authorization in Ktor Client](client-auth.md)を参照してください。

### Cookie {id="cookies"}

Cookieを送信するには、[`cookie()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/cookie.html)関数を使用します。

```kotlin
client.get("https://ktor.io") {
    cookie(name = "user_name", value = "jetbrains", expires = GMTDate(
        seconds = 0,
        minutes = 0,
        hours = 10,
        dayOfMonth = 1,
        month = Month.APRIL,
        year = 2023
    ))
}
```

Ktorには、呼び出し間でCookieを保持できる[`HttpCookies`](client-cookies.md)プラグインも用意されています。このプラグインがインストールされている場合、`cookie()`関数を使用して追加されたCookieは無視されます。

## リクエストボディの設定 {id="body"}

リクエストボディを設定するには、[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)によって提供される`setBody()`関数を呼び出します。この関数は、プレーンテキスト、任意のクラスインスタンス、フォームデータ、バイト配列など、さまざまなタイプのペイロードを受け取ります。

### テキスト {id="text"}

プレーンテキストをボディとして送信するには、次のように実装します。

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.post("http://localhost:8080/post") {
    setBody("Body content")
}
```

### オブジェクト {id="objects"}

[`ContentNegotiation`](client-serialization.md)プラグインを有効にすると、リクエストボディ内のクラスインスタンスをJSONとして送信できます。これを行うには、クラスインスタンスを`setBody()`関数に渡し、[`contentType()`](https://api.ktor.io/ktor-http/io.ktor.http/content-type.html)関数を使用してコンテンツタイプを`application/json`に設定します。

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

詳細については、[Content negotiation and serialization in Ktor Client](client-serialization.md)を参照してください。

### フォームパラメータ {id="form_parameters"}

Ktorクライアントは、`application/x-www-form-urlencoded`タイプでフォームパラメータを送信するための[`submitForm()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form.html)関数を提供しています。次の例でその使い方を示します。

```kotlin
val client = HttpClient(CIO)
val response: HttpResponse = client.submitForm(
    url = "http://localhost:8080/signup",
    formParameters = parameters {
        append("username", "JetBrains")
        append("email", "example@jetbrains.com")
        append("password", "foobar")
        append("confirmation", "foobar")
    }
)
```

* `url`は、リクエストを送信するURLを指定します。
* `formParameters`は、`parameters`を使用して構築されたフォームパラメータのセットです。

完全な例については、[client-submit-form](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-submit-form)を参照してください。

> URLにエンコードされたフォームパラメータを送信するには、`encodeInQuery`を`true`に設定します。

### ファイルのアップロード {id="upload_file"}

フォームと一緒にファイルを送信する必要がある場合は、以下のアプローチを使用できます。

* [`.submitFormWithBinaryData()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form-with-binary-data.html)関数を使用する。この場合、バウンダリ（boundary）は自動的に生成されます。
* `post`関数を呼び出し、[`MultiPartFormDataContent`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/-multi-part-form-data-content/index.html)インスタンスを`setBody`関数に渡す。`MultiPartFormDataContent`コンストラクタでは、バウンダリの値を渡すこともできます。

どちらのアプローチでも、[`formData {}`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/form-data.html)関数を使用してフォームデータを構築する必要があります。

#### `.submitFormWithBinaryData()`の使用 {id="using-submitformwithbinarydata"}

`.submitFormWithBinaryData()`関数はバウンダリを自動的に生成し、`.readBytes()`を使用して安全にメモリに読み込める程度にファイルコンテンツが小さい単純なユースケースに適しています。

```kotlin
        val client = HttpClient(CIO)

        val response: HttpResponse = client.submitFormWithBinaryData(
            url = "http://localhost:8080/upload",
            formData = formData {
                append("description", "Ktor logo")
                append("image", File("ktor_logo.png").readBytes(), Headers.build {
                    append(HttpHeaders.ContentType, "image/png")
                    append(HttpHeaders.ContentDisposition, "filename=\"ktor_logo.png\"")
                })
            }
        )
```

完全な例については、[client-upload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload)を参照してください。

#### `MultiPartFormDataContent`の使用 {id="using-multipartformdatacontent"}

大容量または動的なコンテンツを効率的にストリーミングするには、`InputProvider`とともに`MultiPartFormDataContent`を使用できます。`InputProvider`を使用すると、ファイルデータをメモリにすべてロードするのではなく、バッファされたストリームとして供給できるため、大きなファイルに適しています。`MultiPartFormDataContent`を使用すると、`onUpload`コールバックを利用してアップロードの進行状況を監視することもできます。

```kotlin
        val client = HttpClient(CIO)

        val file = File("ktor_logo.png")

        val response: HttpResponse = client.post("http://localhost:8080/upload") {
            setBody(
                MultiPartFormDataContent(
                    formData {
                        append("description", "Ktor logo")
                        append(
                            "image",
                            InputProvider { file.inputStream().asInput().buffered() },
                            Headers.build {
                                append(HttpHeaders.ContentType, "image/png")
                                append(HttpHeaders.ContentDisposition, "filename=\"ktor_logo.png\"")
                            }
                        )
                    },
                    boundary = "WebAppBoundary"
                )
            )
            onUpload { bytesSentTotal, contentLength ->
                println("Sent $bytesSentTotal bytes from $contentLength")
            }
        }
```

マルチプラットフォームプロジェクトでは、`InputProvider`で`SystemFileSystem.source()`を使用できます。

```kotlin
InputProvider { SystemFileSystem.source(Path("ktor_logo.png")).buffered() }
```

また、カスタムのバウンダリとコンテンツタイプを手動で設定して`MultiPartFormDataContent`を構築することもできます。

```kotlin
fun customMultiPartMixedDataContent(parts: List<PartData>): MultiPartFormDataContent {
    val boundary = "WebAppBoundary"
    val contentType = ContentType.MultiPart.Mixed.withParameter("boundary", boundary)
    return MultiPartFormDataContent(parts, boundary, contentType)
}
```

完全な例については、[client-upload-progress](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-progress)を参照してください。

### バイナリデータ {id="binary"}

コンテンツタイプ`application/octet-stream`でバイナリデータを送信するには、[`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)インスタンスを`setBody()`関数に渡します。例えば、[`File.readChannel()`](https://api.ktor.io/ktor-utils/io.ktor.util.cio/read-channel.html)関数を使用してファイルの読み取りチャネルを開くことができます。

```kotlin
val response = client.post("http://0.0.0.0:8080/upload") {
    setBody(File("ktor_logo.png").readChannel())
}
```

完全な例については、[client-upload-binary-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-binary-data)を参照してください。

## 並列リクエスト {id="parallel_requests"}

デフォルトでは、複数のリクエストを順番に送信する場合、クライアントは前の呼び出しが完了するまで各呼び出しを中断（サスペンド）します。複数のリクエストを並行して実行するには、[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)関数または[`async()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)関数を使用します。次の例は、`async()`を使用して2つのリクエストを並列に実行する方法を示しています。

```kotlin
coroutineScope {
    // 並列リクエスト
    val firstRequest: Deferred<String> = async { client.get("http://localhost:8080/path1").bodyAsText() }
    val secondRequest: Deferred<String> = async { client.get("http://localhost:8080/path2").bodyAsText() }
    val firstRequestContent = firstRequest.await()
    val secondRequestContent = secondRequest.await()
}
```

完全な例については、[client-parallel-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-parallel-requests)を参照してください。

## リクエストのキャンセル {id="cancel-request"}

リクエストをキャンセルするには、そのリクエストを実行しているコルーチンをキャンセルします。[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)関数は、実行中のコルーチンをキャンセルするために使用できる`Job`を返します。

```kotlin
import kotlinx.coroutines.*

val client = HttpClient(CIO)
val job = launch {
    val requestContent: String = client.get("http://localhost:8080")
}
job.cancel()
```

詳細については、[Cancellation and timeouts](https://kotlinlang.org/docs/cancellation-and-timeouts.html)を参照してください。