[//]: # (title: レスポンスの送信)

<show-structure for="chapter" depth="2"/>

<link-summary>さまざまなタイプのレスポンスを送信する方法について説明します。</link-summary>

Ktorでは、[ルートハンドラー](server-routing.md#define_route)内で受信した[リクエスト](server-requests.md)を処理し、レスポンスを送信することができます。プレーンテキスト、HTMLドキュメントやテンプレート、シリアライズされたデータオブジェクトなど、さまざまなタイプのレスポンスを送信できます。また、コンテンツタイプ、ヘッダー、クッキー、ステータスコードなどのさまざまな[レスポンスパラメータ](#parameters)を構成することも可能です。

ルートハンドラー内では、レスポンスを操作するために以下のAPIを利用できます。
* [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) や [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) など、[特定のコンテンツタイプを送信する](#payload)ための関数群。
* レスポンス内で[任意のデータタイプを送信](#payload)できる [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 関数。[ContentNegotiation](server-serialization.md) プラグインがインストールされている場合、特定の形式でシリアライズされたデータオブジェクトを送信できます。
* [`ApplicationResponse`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/index.html) オブジェクトを返す [`call.response()`](https://api.ktor.io/ktor-server-application/-application-call/response.html) プロパティ。ステータスコードの設定、ヘッダーの追加、クッキーの構成など、[レスポンスパラメータ](#parameters)へのアクセスを提供します。
* リダイレクトレスポンスを送信するための [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 関数。

## レスポンスペイロードの設定 {id="payload"}

### プレーンテキスト {id="plain-text"}

プレーンテキストを送信するには、[`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 関数を使用します。
```kotlin
get("/") {
    call.respondText("Hello, world!")
}
```

### HTML {id="html"}

Ktorは、HTMLレスポンスを生成するための主に2つのメカニズムを提供しています。
* Kotlin HTML DSLを使用したHTMLの構築。
* [FreeMarker](https://freemarker.apache.org/) や [Velocity](https://velocity.apache.org/engine/) などのJVMテンプレートエンジンを使用したテンプレートのレンダリング。

#### 完全なHTMLドキュメント {id="full-html-documents"}

Kotlin DSLで構築された完全なHTMLドキュメントを送信するには、[`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 関数を使用します。

```kotlin
get("/") {
    val name = "Ktor"
    call.respondHtml(HttpStatusCode.OK) {
        head {
            title {
                +name
            }
        }
        body {
            h1 {
                +"Hello from $name!"
            }
        }
    }
}
```

#### HTMLフラグメント {id="partial-html-fragments"}

`<html>`、`<head>`、`<body>` で囲わずに、HTMLの断片のみを返す必要がある場合は、`call.respondHtmlPartial()` を使用できます。

```kotlin
    get("/fragment") {
        call.respondHtmlPartial(HttpStatusCode.Created) {
            div("fragment") {
                span { +"Created!" }
            }
        }
    }
}
```

#### テンプレート {id="templates"}

レスポンスでテンプレートを送信するには、特定のコンテンツを指定して [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 関数を使用します。
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(FreeMarkerContent("index.ftl", mapOf("user" to sampleUser)))
}
```

また、[`call.respondTemplate()`](https://api.ktor.io/ktor-server-freemarker/io.ktor.server.freemarker/respond-template.html) 関数を使用することもできます。
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respondTemplate("index.ftl", mapOf("user" to sampleUser))
}
```
詳細は [テンプレート](server-templating.md) のヘルプセクションを参照してください。

### オブジェクト {id="object"}

Ktorでデータオブジェクトのシリアライズを有効にするには、[ContentNegotiation](server-serialization.md) プラグインをインストールし、必要なコンバーター（例：JSON）を登録する必要があります。その後、[`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 関数を使用してレスポンスにデータオブジェクトを渡すことができます。

```kotlin
routing {
    get("/customer/{id}") {
        val id: Int by call.parameters
        val customer: Customer = customerStorage.find { it.id == id }!!
        call.respond(customer)
```

完全な例については、[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx) を参照してください。

[//]: # (TODO: Check link for LocalPathFile)

### ファイル {id="file"}

クライアントにファイルのコンテンツで応答するには、2つのオプションがあります。

- `File` オブジェクトとして表されるファイルの場合は、[`call.respondFile()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-file.html) 関数を使用します。
- 指定された `Path` オブジェクトによって指されるファイルの場合は、[`LocalPathContent`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/-local-path-content/index.html) クラスを指定して `call.respond()` 関数を使用します。

以下の例は、ファイルを送信し、`Content-Disposition` [ヘッダー](#headers)を追加してダウンロード可能にする方法を示しています。

```kotlin
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.partialcontent.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File
import java.nio.file.Path

fun Application.main() {
    install(PartialContent)
    install(AutoHeadResponse)
    routing {
        get("/download") {
            val file = File("files/ktor_logo.png")
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, "ktor_logo.png")
                    .toString()
            )
            call.respondFile(file)
        }
        get("/downloadFromPath") {
            val filePath = Path.of("files/file.txt")
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, "file.txt")
                    .toString()
            )
            call.respond(LocalPathContent(filePath))
        }
    }
```

このサンプルでは、2つのプラグインを使用していることに注意してください。
- [`PartialContent`](server-partial-content.md): サーバーが `Range` ヘッダーを含むリクエストに応答し、コンテンツの一部のみを送信できるようにします。
- [`AutoHeadResponse`](server-autoheadresponse.md): `GET` が定義されているすべてのルートに対して、自動的に `HEAD` リクエストに応答する機能を提供します。これにより、クライアントアプリケーションは `Content-Length` ヘッダー値を読み取ることでファイルサイズを判断できます。

完全なコードサンプルについては、[download-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/download-file) を参照してください。

### リソース {id="resource"}

[`call.respondResource()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-resource.html) メソッドを使用して、<tooltip term="classpath">クラスパス</tooltip>から単一のリソースを提供できます。
このメソッドはリソースへのパスを受け取り、次のように構築されたレスポンスを送信します。
リソースストリームからレスポンスボディを読み取り、ファイル拡張子から `Content-Type` ヘッダーを導出します。

以下の例は、ルートハンドラーでのメソッド呼び出しを示しています。

```kotlin
routing {
    get("/resource") {
        call.respondResource("public/index.html")
    }
}
```

上記の例では、リソースの拡張子が `.html` であるため、レスポンスには `Content-Type: text/html` ヘッダーが含まれます。
便宜上、リソースの場所の構成要素（相対パスとパッケージ）を、第1パラメータと第2パラメータを通じて個別に渡すことができます。
次の例では、リクエストされたパスに基づいて `assets` パッケージ配下のリソースを解決します。

```kotlin
get("/assets/{rest-path...}") {
    var path = call.parameters["rest-path"]
    if (path.isNullOrEmpty()) {
        path = "index.html"
    }

    try {
        call.respondResource(path, "assets") {
            application.log.info(this.contentType.toString())
        }
    } catch (_: IllegalArgumentException) {
        call.respond(HttpStatusCode.NotFound)
    }
}
```

`/assets` プレフィックス以降のリクエストパスが空または `/` の場合、ハンドラーはデフォルトの `index.html` リソースを使用して応答します。指定されたパスにリソースが見つからない場合、`IllegalArgumentException` がスローされます。
前のコードスニペットは、より一般的なソリューション、つまり [`staticResources()`](server-static-content.md#resources) メソッドを使用してパッケージからリソースを提供する方法を模倣したものです。

### 生のペイロード {id="raw"}

生のボディペイロードを送信するには、[`call.respondBytes()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-bytes.html) 関数を使用します。

## レスポンスパラメータの設定 {id="parameters"}

### ステータスコード {id="status"}

レスポンスのステータスコードを設定するには、定義済みのステータスコード値を指定して [`ApplicationResponse.status()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/status.html) 関数を呼び出します。

```kotlin
get("/") {
    call.response.status(HttpStatusCode.OK)
}
```

カスタムのステータス値を指定することもできます。

```kotlin
get("/") {
    call.response.status(HttpStatusCode(418, "I'm a tea pot"))
}
```

> すべてのペイロード送信関数には、ステータスコードを受け取るオーバーロードも用意されています。
> 
{style="note"}

### コンテンツタイプ {id="content-type"}

[ContentNegotiation](server-serialization.md) プラグインがインストールされている場合、Ktorはコンテンツタイプを自動的に選択します。必要に応じて、対応するパラメータを渡すことで手動でコンテンツタイプを指定できます。

以下の例では、`call.respondText()` 関数がパラメータとして `ContentType.Text.Plain` を受け取っています。

```kotlin
get("/") {
    call.respondText("Hello, world!", ContentType.Text.Plain, HttpStatusCode.OK)
}
```

### ヘッダー {id="headers"}

レスポンスにヘッダーを追加するには、いくつかの方法があります。
* [`ApplicationResponse.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/headers.html) コレクションを変更する：
   ```kotlin
    get("/") {
        call.response.headers.append(HttpHeaders.ETag, "7c876b7e")
        
        // 同じヘッダーに複数の値を設定する場合
        call.response.headers.appendAll("X-Custom-Header" to listOf("value1", "value2"))
    }
   ```
  
* [`ApplicationResponse.header()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/header.html) 関数を使用する：
   ```kotlin
   get("/") {
       call.response.header(HttpHeaders.ETag, "7c876b7e")
   }
   ```
  
* `ApplicationResponse.etag` や `ApplicationResponse.link` など、特定のヘッダー用の便利な関数を使用する：
   ```kotlin
   get("/") {
       call.response.etag("7c876b7e")
   }
   ```
  
* 生の文字列名を渡してカスタムヘッダーを追加する：
   ```kotlin
   get("/") {
       call.response.header("Custom-Header", "Some value")
   }
   ```

> 標準の `Server` および `Date` ヘッダーを自動的に含めるには、[DefaultHeaders](server-default-headers.md) プラグインをインストールしてください。
>
{type="tip"}

### クッキー {id="cookies"}

レスポンスで送信されるクッキーを構成するには、[`ApplicationResponse.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/cookies.html) プロパティを使用します。
```kotlin
get("/") {
    call.response.cookies.append("yummy_cookie", "choco")
}
```

> Ktorはクッキーを使用してセッションを処理する機能も提供しています。詳細は [セッション](server-sessions.md) を参照してください。

## リダイレクト {id="redirect"}

リダイレクトレスポンスを生成するには、[`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 関数を使用します。

```kotlin
get("/") {
    call.respondRedirect("/moved", permanent = true)
}

get("/moved") {
    call.respondText("Moved content")
}