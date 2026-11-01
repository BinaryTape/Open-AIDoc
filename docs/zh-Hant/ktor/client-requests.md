[//]: # (title: 發送請求)

<show-structure for="chapter" depth="2"/>

[percent_encoding]: https://en.wikipedia.org/wiki/Percent-encoding

<tldr>
<var name="example_name" value="client-configure-request"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何發送請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。
</link-summary>

在[設定用戶端](client-create-and-configure.md)之後，你就可以開始發送 HTTP 請求。主要的方法是使用接受 URL 作為參數的
[`.request()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/request.html)
函式。在此函式中，你可以設定各種請求參數：

* 指定 HTTP 方法，例如 `GET`、`POST`、`PUT`、`DELETE`、`HEAD`、`OPTIONS` 或 `PATCH`。
* 將 URL 設定為字串，或分別設定其各個組件（例如網域、路徑和查詢參數）。
* 使用 Unix domain socket。
* 新增標頭與 Cookie。
* 包含請求主體 – 例如純文字、資料物件或表單參數。

這些參數由
[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)
類別公開提供。

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*

val response: HttpResponse = client.request("https://ktor.io/") {
  // 設定 HttpRequestBuilder 所公開的請求參數
}
```

{interpolate-variables="true" disable-links="false"}

`.request()` 函式會以 `HttpResponse` 物件傳回回應。`HttpResponse` 公開了取得各種格式的回應主體所需的 API – 例如字串、JSON 物件等 – 以及擷取狀態碼、內容類型與標頭等回應參數。若要了解更多，請參閱[接收回應](client-responses.md)。

> `.request()` 是一個掛起函式（suspending function），這意味著它必須在協同程式或其他掛起函式內部呼叫。若要深入了解掛起函式，請參閱
> [協同程式基礎](https://kotlinlang.org/docs/coroutines-basics.html)。

### 指定 HTTP 方法 {id="http-method"}

呼叫 `.request()` 函式時，你可以使用 `method` 屬性指定所需的 HTTP 方法：

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.request("https://ktor.io/") {
    method = HttpMethod.Get
}
```

除了 `.request()` 之外，`HttpClient` 還為基本的 HTTP 方法提供了專用函式，例如
[`.get()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html)、
[`.post()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/post.html) 和
[`.put()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/put.html)。
上述範例可以使用 `.get()` 函式進行簡化：

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

在這兩個範例中，請求 URL 都是指定為字串。你也可以使用
[`HttpRequestBuilder`](#url) 分別設定 URL 組件。

## 指定請求 URL {id="url"}

Ktor 用戶端允許你透過多種方式設定請求 URL：

### 傳入完整 URL 字串 {id="pass-the-entire-url-string"}

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

### 分別設定 URL 組件 {id="configure-url-components-separately"}

```kotlin
client.get {
    url {
        protocol = URLProtocol.HTTPS
        host = "ktor.io"
        path("docs/welcome.html")
    }
}
```

在這種情況下，會使用 `HttpRequestBuilder` 提供的 `url` 參數。它接受一個
[`URLBuilder`](https://api.ktor.io/ktor-http/io.ktor.http/-u-r-l-builder/index.html) 執行個體，為建構複雜的 URL 提供更高的彈性。

> 若要為所有請求設定基礎 URL，請使用 [`DefaultRequest`](client-default-request.md#url) 外掛程式。

### 路徑片段 {id="path_segments"}

在前一個範例中，完整的 URL 路徑是使用 `URLBuilder.path` 屬性指定的。
或者，你也可以使用 `appendPathSegments()` 函式傳入各個獨立的路徑片段。

```kotlin
client.get("https://ktor.io") {
    url {
        appendPathSegments("docs", "welcome.html")
    }
}
```

預設情況下，`appendPathSegments` 會對路徑片段進行[編碼][percent_encoding]。
若要停用編碼，請改用 `appendEncodedPathSegments()`。

### 查詢參數 {id="query_parameters"}

若要新增 <emphasis tooltip="query_string">查詢字串（query string）</emphasis> 參數，請使用 `URLBuilder.parameters` 屬性：

```kotlin
client.get("https://ktor.io") {
    url {
        parameters.append("token", "abc123")
    }
}
```

預設情況下，`parameters` 會對查詢參數進行[編碼][percent_encoding]。
若要停用編碼，請改用 `encodedParameters()`。

> `trailingQuery` 屬性可用於在即使沒有查詢參數的情況下，仍保留 `?` 字元。

### URL 片段 {id="url-fragment"}

井字號 `#` 用於在 URL 接近結尾處引入可選的片段。
你可以使用 `fragment` 屬性設定 URL 片段。

```kotlin
client.get("https://ktor.io") {
    url {
        fragment = "some_anchor"
    }
}
```

預設情況下，`fragment` 會對 URL 片段進行[編碼][percent_encoding]。
若要停用編碼，請改用 `encodedFragment()`。

## 指定 Unix domain socket {id="specify-a-unix-domain-socket"}

> 只有 CIO 引擎支援 Unix domain socket。
> 若要在 Ktor 伺服器中使用 Unix socket，請相應地[設定伺服器](server-configuration-code.topic#cio-code)。
>
{style="note"}

若要在使用 CIO 用戶端時向監聽 Unix domain socket 的伺服器發送請求，請呼叫 `unixSocket()` 函式：

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

你也可以將 Unix domain socket 設定為[預設請求](client-default-request.md#unix-domain-sockets)的一部分。

## 設定請求參數 {id="parameters"}

你可以指定各種請求參數，包含 HTTP 方法、標頭和 Cookie。如果你需要為特定用戶端的所有請求設定預設參數，請使用 [`DefaultRequest`](client-default-request.md) 外掛程式。

### 標頭 {id="headers"}

你可以透過多種方式向請求新增標頭：

#### 新增多個標頭 {id="add-multiple-headers"}

[`headers`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/headers.html) 函式可讓你一次新增多個標頭：

```kotlin
client.get("https://ktor.io") {
    headers {
        append(HttpHeaders.Accept, "text/html")
        append(HttpHeaders.Authorization, "abc123")
        append(HttpHeaders.UserAgent, "ktor client")
    }
}
```

你也可以搭配 `Map` 或 `vararg Pair` 使用 `appendAll()` 函式，以方便地新增多個標頭：

```kotlin
        client.get("https://ktor.io") {
            headers {
                // 使用 vararg Pair
                appendAll(
                    HttpHeaders.Accept to "text/html",
                    HttpHeaders.Authorization to "abc123"
                )

                // 使用 Map
                appendAll(mapOf("foo" to "bar", "baz" to "qux"))
                appendAll(mapOf("test" to listOf("1", "2", "3")))

                // 使用具有多個值的自訂標頭
                appendAll("X-Custom-Header" to listOf("val1", "val2"))
            }
        }
```

#### 新增單一標頭 {id="add-a-single-header"}

[`header`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/header.html) 函式允許你附加單一標頭。

#### 使用 `basicAuth` 或 `bearerAuth` 進行授權 {id="use-basicauth-or-bearerauth-for-authorization"}

`basicAuth` 與 `bearerAuth` 函式會加入帶有相應 HTTP scheme 的 `Authorization` 標頭。

> 關於進階身分驗證設定，請參閱 [Ktor Client 中的身分驗證與授權](client-auth.md)。

### Cookie {id="cookies"}

若要發送 Cookie，請使用
[`cookie()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/cookie.html) 函式：

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

Ktor 還提供了 [`HttpCookies`](client-cookies.md) 外掛程式，可讓你在多次呼叫之間保持 Cookie。如果已安裝此前置外掛程式，使用 `cookie()` 函式新增的 Cookie 將會被忽略。

## 設定請求主體 {id="body"}

若要設定請求主體，請呼叫
[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 提供的 `setBody()` 函式。
此函式接受不同類型的有效負載，包含純文字、任意類別執行個體、表單資料以及位元組陣列。

### 文字 {id="text"}

將純文字作為主體發送可以透過以下方式實作：

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.post("http://localhost:8080/post") {
    setBody("Body content")
}
```

### 物件 {id="objects"}

啟用 [`ContentNegotiation`](client-serialization.md) 外掛程式後，你可以在請求主體中將類別執行個體作為 JSON 發送。為此，請將類別執行個體傳入 `setBody()` 函式，並使用 [`contentType()`](https://api.ktor.io/ktor-http/io.ktor.http/content-type.html) 函式將內容類型設定為 `application/json`：

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

若要了解更多資訊，請參閱 [Ktor Client 中的內容協商與序列化](client-serialization.md)。

### 表單參數 {id="form_parameters"}

Ktor 用戶端提供了
[`submitForm()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form.html)
函式，用於發送 `application/x-www-form-urlencoded` 類型的表單參數。以下範例示範了其用法：

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

* `url` 指定發送請求的 URL。
* `formParameters` 是一組使用 `parameters` 建構的表單參數。

如需完整範例，請參閱 [client-submit-form](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-submit-form)。

> 若要發送編碼在 URL 中的表單參數，請將 `encodeInQuery` 設定為 `true`。

### 上傳檔案 {id="upload_file"}

如果你需要隨表單一起發送檔案，可以使用以下方法：

* 使用
  [`.submitFormWithBinaryData()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form-with-binary-data.html)
  函式。在這種情況下，會自動產生邊界（boundary）。
* 呼叫 `post` 函式，並將
  [`MultiPartFormDataContent`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/-multi-part-form-data-content/index.html)
  執行個體傳遞給 `setBody` 函式。`MultiPartFormDataContent` 建構函式也允許你傳入自訂的邊界值。

對於這兩種方法，你都需要使用
[`formData {}`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/form-data.html) 函式來建構表單資料。

#### 使用 `.submitFormWithBinaryData()` {id="using-submitformwithbinarydata"}

`.submitFormWithBinaryData()` 函式會自動產生邊界，適用於檔案內容夠小、可以安全使用 `.readBytes()` 讀入記憶體的簡易使用案例。

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

如需完整範例，請參閱 [client-upload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload)。

#### 使用 `MultiPartFormDataContent` {id="using-multipartformdatacontent"}

若要有效率地串流傳輸大型或動態內容，你可以將 `MultiPartFormDataContent` 與 `InputProvider` 搭配使用。
`InputProvider` 允許你以緩衝串流形式提供檔案資料，而不是將其全部載入記憶體中，非常適合用於大檔案。使用 `MultiPartFormDataContent` 時，你還可以使用 `onUpload` 回呼來監控上傳進度。

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

在多平台專案中，你可以將 `SystemFileSystem.source()` 與 `InputProvider` 搭配使用：

```kotlin
InputProvider { SystemFileSystem.source(Path("ktor_logo.png")).buffered() }
```

你也可以手動建構具有自訂邊界與內容類型的 `MultiPartFormDataContent`：

```kotlin
fun customMultiPartMixedDataContent(parts: List<PartData>): MultiPartFormDataContent {
    val boundary = "WebAppBoundary"
    val contentType = ContentType.MultiPart.Mixed.withParameter("boundary", boundary)
    return MultiPartFormDataContent(parts, boundary, contentType)
}
```

如需完整範例，請參閱
[client-upload-progress](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-progress)。

### 二進制資料 {id="binary"}

若要發送內容類型為 `application/octet-stream` 的二進制資料，請將
[`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) 執行個體傳入
`setBody()` 函式。
例如，你可以使用 [`File.readChannel()`](https://api.ktor.io/ktor-utils/io.ktor.util.cio/read-channel.html)
函式為檔案開啟讀取通道：

```kotlin
val response = client.post("http://0.0.0.0:8080/upload") {
    setBody(File("ktor_logo.png").readChannel())
}
```

如需完整範例，請參閱
[client-upload-binary-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-binary-data)。

## 平行請求 {id="parallel_requests"}

預設情況下，當你循序發送多個請求時，用戶端會掛起每個呼叫，直到前一個呼叫完成。若要並行執行多個請求，請使用
[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)
或 [`async()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)
函式。以下範例示範如何使用 `async()` 平行執行兩個請求：

```kotlin
coroutineScope {
    // 平行請求
    val firstRequest: Deferred<String> = async { client.get("http://localhost:8080/path1").bodyAsText() }
    val secondRequest: Deferred<String> = async { client.get("http://localhost:8080/path2").bodyAsText() }
    val firstRequestContent = firstRequest.await()
    val secondRequestContent = secondRequest.await()
}
```

如需完整範例，請參閱
[client-parallel-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-parallel-requests)。

## 取消請求 {id="cancel-request"}

若要取消請求，請取消執行該請求的協同程式。
[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)
函式會傳回一個可用於取消正在執行的協同程式的 `Job`：

```kotlin
import kotlinx.coroutines.*

val client = HttpClient(CIO)
val job = launch {
    val requestContent: String = client.get("http://localhost:8080")
}
job.cancel()
```

如需更多詳細資訊，請參閱[取消與超時](https://kotlinlang.org/docs/cancellation-and-timeouts.html)。