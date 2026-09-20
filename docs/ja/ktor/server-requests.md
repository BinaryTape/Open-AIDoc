[//]: # (title: リクエストの処理)

<show-structure for="chapter" depth="3"/>

<link-summary>ルートハンドラー内で受信リクエストを処理する方法について説明します。</link-summary>

Ktorでは、[ルートハンドラー](server-routing.md#define_route)から受信リクエストを処理し、[レスポンス](server-responses.md)を送信できます。

各ルートハンドラーは、`call`プロパティを通じて[`ApplicationCall`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html)を提供します。`ApplicationCall`は単一のHTTPエクスチェンジを表し、受信リクエストと送信レスポンスの両方へのアクセスを提供します。

ルートハンドラー内では、`ApplicationCall`を使用して以下を行うことができます。

* ヘッダー、Cookie、接続の詳細などの[リクエスト情報](#request_information)にアクセスする。
* [パスパラメータ](#path_parameters)を取得する。
* [クエリパラメータ](#query_parameters)を取得する。
* データオブジェクト、フォームパラメータ、ファイルなどの[リクエストボディの内容](#body_contents)を受信する。

## 一般的なリクエスト情報 {id="request_information"}

[`call.request`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/request.html)プロパティを使用してリクエストデータにアクセスできます。これは[`ApplicationRequest`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/index.html)インスタンスを返し、低レベルのHTTPリクエスト情報へのアクセスを提供します。

たとえば、GETリクエストハンドラー内で`call.request.uri`を使用してリクエストURIを取得できます。

```kotlin
routing {
    get("/") {
        val uri = call.request.uri
        call.respondText("Request uri: $uri")
    }
}
```

[`call.respondText()`](server-responses.md#plain-text)関数は、クライアントにプレーンテキストのレスポンスを返送します。

### ヘッダー {id="headers"}

すべてのHTTPリクエストヘッダーにアクセスするには、[`ApplicationRequest.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/headers.html)プロパティを使用します。

便宜上、Ktorはよく使用されるヘッダーにアクセスするための専用の拡張関数も提供しています。たとえば、[`.acceptEncoding()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/accept-encoding.html)、[`.contentType()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/content-type.html)、[`.cacheControl()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/cache-control.html)などがあります。

### Cookie {id="cookies"}

リクエストと一緒に送信されたCookieにアクセスするには、[`ApplicationRequest.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/cookies.html)プロパティを使用します。

> Cookieを使用したセッションの処理方法の詳細については、[セッション](server-sessions.md)セクションを参照してください。
> 
{style="tip"}

### 接続の詳細 {id="connection-details"}

ホスト名、ポート、スキームなどの接続の詳細にアクセスするには、[`ApplicationRequest.local`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html)プロパティを使用します。

### `X-Forwarded-` ヘッダー {id="x-forwarded-headers"}

HTTPプロキシまたはロードバランサーを経由したリクエストに関する情報を収集するには、[Forwarded headers](server-forward-headers.md)プラグインをインストールします。その後、[`ApplicationRequest.origin`](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html)プロパティを通じてこの情報にアクセスできます。

## パスパラメータ {id="path_parameters"}

リクエストを処理する際、`ApplicationCall.parameters`プロパティを使用して[パスパラメータ](server-routing.md#path_parameter)の値を取得できます。

たとえば、`/user/admin`へのリクエストに対して、`call.parameters["login"]`は`"admin"`を返します。

```kotlin
get("/user/{login}") {
    if (call.parameters["login"] == "admin") {
        // ...
    }
}
```

## クエリパラメータ {id="query_parameters"}

URLクエリ文字列のパラメータを取得するには、[`ApplicationRequest.queryParameters`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/query-parameters.html)プロパティを使用します。

以下の例では、`/products?price=asc`へのリクエストから`price`クエリパラメータにアクセスしています。

```kotlin
get("/products") {
    if (call.request.queryParameters["price"] == "asc") {
        // 低価格から高価格の順に商品を表示する
    }
}
```

また、[`ApplicationRequest.queryString()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/query-string.html)関数を使用してクエリ文字列全体を取得することもできます。

## 必須のリクエストパラメータ {id="required-request-parameters"}

リクエストを処理する際、[パスパラメータ](#path_parameters)、[クエリパラメータ](#query_parameters)、[ヘッダー](#headers)、または[Cookie](#cookies)から値を取得し、リクエスト処理を続行する前にそれらが存在することを確認するのが一般的です。

すべてのルートハンドラーで欠落している値を手動でチェックする代わりに、Ktorは必須のリクエストデータへのアクセスを簡素化する以下のヘルパー関数を提供しています。

* [`.requireQueryParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-query-parameter.html)は、リクエストURLから必須のクエリパラメータを取得します。
* [`.requireHeader()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-header.html)は、必須のHTTPヘッダー値を取得します。
* [`.requireCookie()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-cookie.html)は、必須のCookie値を取得し、オプションで指定されたエンコーディングを使用してデコードします。
* [`.requirePathParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-path-parameter.html)は、ルート定義から必須のパスパラメータを取得します。

各関数は非null値を返すか、要求された値が欠けている場合に`MissingRequestParameterException`をスローします。

```kotlin
post("/checkout/{cartId}") {
    val userId = call.requireCookie("userId")
    val cartId = call.requirePathParameter("cartId")
    val amount = call.requireQueryParameter("amount").toLong()

    // ビジネスロジック
}
```

## ボディの内容 {id="body_contents"}

リクエストボディにアクセスするには、Ktorのreceive関数を使用します。適切な関数は、[生のペイロード](#raw)、[デシリアライズされたオブジェクト](#objects)、[フォームパラメータ](#form_parameters)、または[マルチパートデータ](#form_data)のどれが必要かによって異なります。

### 生のペイロード {id="raw"}

生のボディペイロードにアクセスして手動で解析するには、受信するペイロードの型を受け取る[`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html)関数を使用します。

クライアントが次のようなHTTPリクエストを送信したとします。

```HTTP
POST http://localhost:8080/text
Content-Type: text/plain

Hello, world!
```

リクエストボディは、[`String`](#string)、[`ByteArray`](#bytearray)、または[`ByteReadChannel`](#bytereadchannel)として受信できます。

#### `String` {id="string"}

リクエストボディをテキストとして受信するには、`.receive<String>()`または[`.receiveText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-text.html)関数を使用します。
```kotlin
post("/text") {
    val text = call.receiveText()
    call.respondText(text)
}
```

#### `ByteArray` {id="bytearray"}

リクエストのボディをバイト配列として受信するには、`.receive<ByteArray>()`関数を使用します。

```kotlin
        post("/bytes") {
            val bytes = call.receive<ByteArray>()
            call.respond(String(bytes))
        }

```

#### `ByteReadChannel` {id="bytereadchannel"}

ボディを[`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)として非同期に読み取るには、`.receive<ByteReadChannel>()`または[`.receiveChannel()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-channel.html)関数を使用します。

```kotlin
post("/channel") {
    val readChannel = call.receiveChannel()
    val text = readChannel.readRemaining().readString()
    call.respondText(text)
}
```

また、`ByteReadChannel`を使用してファイルをアップロードすることもできます。

```kotlin
post("/upload") {
    val file = File("uploads/ktor_logo.png")
    call.receiveChannel().copyAndClose(file.writeChannel())
    call.respondText("A file is uploaded")
}
```

> Ktorのチャンネルと、`RawSink`、`RawSource`、`OutputStream`などの型との間の変換については、[I/O相互運用性](io-interoperability.md)を参照してください。
>
{style="tip"}

> 完全な例については、[post-raw-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-raw-data)を参照してください。
> 
{style="tip"}

### オブジェクト {id="objects"}

Ktorは、リクエストのメディアタイプをネゴシエートし、コンテンツを必要な型のオブジェクトにデシリアライズする[`ContentNegotiation`](server-serialization.md)プラグインを提供しています。

リクエストのコンテンツを受信して変換するには、期待される型を指定して[`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html)関数を使用します。

```kotlin
post("/customer") {
    val customer = call.receive<Customer>()
    customerStorage.add(customer)
    call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
}
```

リクエストコンテンツが`null`にデシリアライズされる可能性がある場合は、null許容型引数を使用します。

```kotlin
val customer = call.receive<Customer?>()
```

> 詳細については、[Ktor Serverにおけるコンテンツネゴシエーションとシリアライズ](server-serialization.md)を参照してください。
> 
{style="tip"}

### フォームパラメータ {id="form_parameters"}

[`.receiveParameters()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-parameters.html)関数を使用して、`x-www-form-urlencoded`と`multipart/form-data`の両方の型で送信されたフォームパラメータを受信できます。

たとえば、クライアントが以下のリクエストを送信したとします。

```HTTP
POST http://localhost:8080/signup
Content-Type: application/x-www-form-urlencoded

username=JetBrains&email=example@jetbrains.com&password=foobar&confirmation=foobar
```

コード内でパラメータ値にアクセスするには、次のようにします。

```kotlin
post("/signup") {
    val formParameters = call.receiveParameters()
    val username = formParameters["username"].toString()
    call.respondText("The '$username' account is created")
}
```

> 完全な例については、[post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)を参照してください。
> 
{style="tip"}

### マルチパートフォームデータ {id="form_data"}

マルチパートリクエストの一部として送信されたファイルを受信するには、[`.receiveMultipart()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-multipart.html)関数を使用します。

マルチパートリクエストデータは順次処理されるため、特定のパートに直接アクセスすることはできません。各パートはフォームフィールド、ファイル、またはその他のバイナリコンテンツを表すことができるため、それぞれの型を個別に処理します。

以下の例では、フォームフィールドとファイルを受信し、ローカルファイルシステムにファイルを保存します。

```kotlin
import io.ktor.server.application.*
import io.ktor.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.cio.*
import io.ktor.utils.io.*
import java.io.File

fun Application.main() {
    routing {
        post("/upload") {
            var fileDescription = ""
            var fileName = ""
            val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)

            multipartData.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        fileDescription = part.value
                    }

                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        val file = File("uploads/$fileName")
                        part.provider().copyAndClose(file.writeChannel())
                    }

                    else -> {}
                }
                part.dispose()
            }

            call.respondText("$fileDescription is uploaded to 'uploads/$fileName'")
        }
    }
}
```

#### デフォルトのファイルサイズ制限 {id="default-file-size-limit"}

デフォルトでは、バイナリおよびファイルパートは50MiBに制限されています。パートがこの制限を超えると、Ktorは`IOException`をスローします。

呼び出しに対してデフォルトの制限を上書きするには、`.receiveMultipart()`関数に`formFieldLimit`パラメータを渡します。

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

この例では、制限を100 MiBに設定しています。

#### フォームフィールド {id="form-fields"}

`PartData.FormItem`はフォームフィールドを表します。その値には`value`プロパティを通じてアクセスできます。

```kotlin
when (part) {
    is PartData.FormItem -> {
        fileDescription = part.value
    }
}
```

#### ファイルアップロード {id="file-uploads"}

`PartData.FileItem`はアップロードされたファイルを表します。ファイルアップロードはバイトストリームとして処理できます。[`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html)関数を使用してファイルコンテンツに`ByteReadChannel`としてアクセスし、宛先へストリーミングします。

```kotlin
when (part) {
    is PartData.FileItem -> {
        fileName = part.originalFileName as String
        val file = File("uploads/$fileName")
        part.provider().copyAndClose(file.writeChannel())
    }
}
```

`.copyAndClose()`関数を使用すると、適切なリソースクリーンアップを保証しながら、指定された宛先にファイルコンテンツを書き込みます。

リクエストに`Content-Length` [ヘッダー値](#request_information)が含まれている場合は、それを使用してリクエストボディ全体のサイズを検査できます。

```kotlin
post("/upload") {
    val contentLength = call.request.header(HttpHeaders.ContentLength)
    // ...
}
```

マルチパートリクエストの場合、`Content-Length`は個別にアップロードされたファイルのサイズではなく、マルチパートボディ全体を表します。

#### リソースのクリーンアップ {id="resource-cleanup"}

フォームの処理が完了したら、リソースを解放するために`.dispose()`関数を使用して各マルチパートパートを破棄します。

```kotlin
part.dispose()
```

> このサンプルの実行方法については、[upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)を参照してください。
> 
{style="tip"}