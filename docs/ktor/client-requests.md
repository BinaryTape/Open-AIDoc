[//]: # (title: 发起请求)

<show-structure for="chapter" depth="2"/>

[percent_encoding]: https://en.wikipedia.org/wiki/Percent-encoding

<tldr>
<var name="example_name" value="client-configure-request"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何发起请求并指定各种请求参数：请求 URL、HTTP 方法、标头以及请求体。
</link-summary>

在[配置客户端](client-create-and-configure.md)之后，你就可以开始发起 HTTP 请求了。最主要的方式是使用接收 URL 作为参数的
[`.request()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/request.html)
函数。在此函数内部，你可以配置各种请求参数：

* 指定 HTTP 方法，例如 `GET`、`POST`、`PUT`、`DELETE`、`HEAD`、`OPTIONS` 或 `PATCH`。
* 将 URL 配置为字符串，或分别配置其各个组成部分（例如域名、路径和查询参数）。
* 使用 Unix 域套接字（Unix domain socket）。
* 添加标头（headers）和 Cookie。
* 包含请求体——例如纯文本、数据对象或表单参数。

这些参数由
[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)
类提供。

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*

val response: HttpResponse = client.request("https://ktor.io/") {
  // 配置 HttpRequestBuilder 提供的请求参数
}
```

{interpolate-variables="true" disable-links="false"}

`.request()` 函数将响应作为 `HttpResponse` 对象返回。`HttpResponse` 公开了获取各种格式的响应体（例如字符串、JSON 对象等）所需的 API，以及检索状态码、内容类型和标头等响应参数的 API。更多信息请参阅[接收响应](client-responses.md)。

> `.request()` 是一个挂起函数，这意味着它必须在协程或其他挂起函数内调用。要详细了解挂起函数，请参阅[协程基础](https://kotlinlang.org/docs/coroutines-basics.html)。

### 指定 HTTP 方法 {id="http-method"}

调用 `.request()` 函数时，可以使用 `method` 属性指定所需的 HTTP 方法：

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.request("https://ktor.io/") {
    method = HttpMethod.Get
}
```

除了 `.request()` 之外，`HttpClient` 还为基本的 HTTP 方法提供了专用函数，例如
[`.get()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html)、
[`.post()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/post.html) 和
[`.put()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/put.html)。
上面的示例可以使用 `.get()` 函数简化为：

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

在这两个示例中，请求 URL 均以字符串形式指定。你也可以使用 [`HttpRequestBuilder`](#url) 分别配置 URL 的各个组成部分。

## 指定请求 URL {id="url"}

Ktor 客户端允许你通过多种方式配置请求 URL：

### 传递完整的 URL 字符串 {id="pass-the-entire-url-string"}

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

### 分别配置 URL 的各个组成部分 {id="configure-url-components-separately"}

```kotlin
client.get {
    url {
        protocol = URLProtocol.HTTPS
        host = "ktor.io"
        path("docs/welcome.html")
    }
}
```

在这种情况下，使用的是 `HttpRequestBuilder` 提供的 `url` 参数。它接收一个
[`URLBuilder`](https://api.ktor.io/ktor-http/io.ktor.http/-u-r-l-builder/index.html) 实例，为构建复杂的 URL 提供了更大的灵活性。

> 要为所有请求配置基础 URL，请使用 [`DefaultRequest`](client-default-request.md#url) 插件。

### 路径片段 {id="path_segments"}

在上一个示例中，整个 URL 路径是使用 `URLBuilder.path` 属性指定的。
或者，你也可以使用 `appendPathSegments()` 函数传递单独的路径片段。

```kotlin
client.get("https://ktor.io") {
    url {
        appendPathSegments("docs", "welcome.html")
    }
}
```

默认情况下，`appendPathSegments` 会对路径片段进行[编码][percent_encoding]。
若要禁用编码，请改用 `appendEncodedPathSegments()`。

### 查询参数 {id="query_parameters"}

要添加<emphasis tooltip="query_string">查询字符串</emphasis>参数，请使用 `URLBuilder.parameters` 属性：

```kotlin
client.get("https://ktor.io") {
    url {
        parameters.append("token", "abc123")
    }
}
```

默认情况下，`parameters` 会对查询参数进行[编码][percent_encoding]。
若要禁用编码，请改用 `encodedParameters()`。

> `trailingQuery` 属性可用于在即使没有查询参数的情况下也保留 `?` 字符。

### URL 片段 {id="url-fragment"}

井号 `#` 引入了 URL 末尾附近的可选片段（fragment）。
你可以使用 `fragment` 属性配置 URL 片段。

```kotlin
client.get("https://ktor.io") {
    url {
        fragment = "some_anchor"
    }
}
```

默认情况下，`fragment` 会对 URL 片段进行[编码][percent_encoding]。
若要禁用编码，请改用 `encodedFragment()`。

## 指定 Unix 域套接字 {id="specify-a-unix-domain-socket"}

> 仅 CIO 引擎支持 Unix 域套接字。
> 若要将 Unix 套接字与 Ktor 服务器配合使用，请相应地[配置服务器](server-configuration-code.topic#cio-code)。
>
{style="note"}

若要在使用 CIO 客户端时向侦听 Unix 域套接字的服务器发送请求，请调用 `unixSocket()` 函数：

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

你也可以将 Unix 域套接字配置为[默认请求](client-default-request.md#unix-domain-sockets)的一部分。

## 设置请求参数 {id="parameters"}

你可以指定各种请求参数，包括 HTTP 方法、标头和 Cookie。如果你需要为特定客户端的所有请求配置默认参数，请使用 [`DefaultRequest`](client-default-request.md) 插件。

### 标头 {id="headers"}

你可以通过多种方式向请求添加标头：

#### 添加多个标头 {id="add-multiple-headers"}

[`headers`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/headers.html) 函数允许你一次性添加多个标头：

```kotlin
client.get("https://ktor.io") {
    headers {
        append(HttpHeaders.Accept, "text/html")
        append(HttpHeaders.Authorization, "abc123")
        append(HttpHeaders.UserAgent, "ktor client")
    }
}
```

你还可以结合 `Map` 或 `vararg Pair` 使用 `appendAll()` 函数来便捷地添加多个标头：

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

                // 使用具有多个值的自定义标头
                appendAll("X-Custom-Header" to listOf("val1", "val2"))
            }
        }
```

#### 添加单个标头 {id="add-a-single-header"}

[`header`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/header.html) 函数允许你追加单个标头。

#### 使用 `basicAuth` 或 `bearerAuth` 进行身份验证 {id="use-basicauth-or-bearerauth-for-authorization"}

`basicAuth` 和 `bearerAuth` 函数会添加带有相应 HTTP 方案的 `Authorization` 标头。

> 有关高级身份验证配置，请参阅 [Ktor Client 中的身份验证与授权](client-auth.md)。

### Cookie {id="cookies"}

要发送 Cookie，请使用
[`cookie()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/cookie.html) 函数：

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

Ktor 还提供了 [`HttpCookies`](client-cookies.md) 插件，允许你在多次调用之间保持 Cookie。如果安装了此插件，通过 `cookie()` 函数添加的 Cookie 将被忽略。

## 设置请求体 {id="body"}

要设置请求体，请调用
[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 提供的 `setBody()` 函数。
该函数接收不同类型的有效负载（payload），包括纯文本、任意类实例、表单数据和字节数组。

### 文本 {id="text"}

发送纯文本作为请求体可以通过以下方式实现：

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.post("http://localhost:8080/post") {
    setBody("Body content")
}
```

### 对象 {id="objects"}

在启用 [`ContentNegotiation`](client-serialization.md) 插件后，你可以在请求体中以 JSON 格式发送类实例。为此，请将类实例传递给 `setBody()` 函数，并使用 [`contentType()`](https://api.ktor.io/ktor-http/io.ktor.http/content-type.html) 函数将内容类型设置为 `application/json`：

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

更多信息请参阅 [Ktor Client 中的内容协商与序列化](client-serialization.md)。

### 表单参数 {id="form_parameters"}

Ktor 客户端提供了
[`submitForm()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form.html)
函数，用于发送类型为 `application/x-www-form-urlencoded` 的表单参数。以下示例演示了其用法：

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

* `url` 指定发起请求的 URL。
* `formParameters` 是一组使用 `parameters` 构建的表单参数。

完整示例请参阅 [client-submit-form](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-submit-form)。

> 若要发送在 URL 中编码的表单参数，请将 `encodeInQuery` 设置为 `true`。

### 上传文件 {id="upload_file"}

如果你需要随表单发送文件，可以使用以下方法：

* 使用
  [`.submitFormWithBinaryData()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form-with-binary-data.html)
  函数。在这种情况下，分界符（boundary）将自动生成。
* 调用 `post` 函数，并将
  [`MultiPartFormDataContent`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/-multi-part-form-data-content/index.html)
  实例传递给 `setBody` 函数。`MultiPartFormDataContent` 构造函数还允许你传递自定义分界符值。

对于这两种方法，你都需要使用
[`formData {}`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/form-data.html) 函数来构建表单数据。

#### 使用 `.submitFormWithBinaryData()` {id="using-submitformwithbinarydata"}

`.submitFormWithBinaryData()` 函数会自动生成分界符，适用于文件内容较小、可以安全地使用 `.readBytes()` 读取到内存中的简单场景。

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

完整示例请参阅 [client-upload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload)。

#### 使用 `MultiPartFormDataContent` {id="using-multipartformdatacontent"}

若要高效地流式传输大型或动态内容，可以将 `MultiPartFormDataContent` 与 `InputProvider` 结合使用。
`InputProvider` 允许你将文件数据作为缓冲流提供，而不是完全加载到内存中，因此非常适合大文件。借助 `MultiPartFormDataContent`，你还可以使用 `onUpload` 回调监控上传进度。

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

在多平台项目中，你可以将 `SystemFileSystem.source()` 与 `InputProvider` 配合使用：

```kotlin
InputProvider { SystemFileSystem.source(Path("ktor_logo.png")).buffered() }
```

你还可以手动构造带有自定义分界符和内容类型的 `MultiPartFormDataContent`：

```kotlin
fun customMultiPartMixedDataContent(parts: List<PartData>): MultiPartFormDataContent {
    val boundary = "WebAppBoundary"
    val contentType = ContentType.MultiPart.Mixed.withParameter("boundary", boundary)
    return MultiPartFormDataContent(parts, boundary, contentType)
}
```

完整示例请参阅 [client-upload-progress](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-progress)。

### 二进制数据 {id="binary"}

要发送内容类型为 `application/octet-stream` 的二进制数据，请将
[`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) 实例传递给
`setBody()` 函数。
例如，你可以使用 [`File.readChannel()`](https://api.ktor.io/ktor-utils/io.ktor.util.cio/read-channel.html)
函数为文件打开读取通道：

```kotlin
val response = client.post("http://0.0.0.0:8080/upload") {
    setBody(File("ktor_logo.png").readChannel())
}
```

完整示例请参阅 [client-upload-binary-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-binary-data)。

## 并行请求 {id="parallel_requests"}

默认情况下，当你按顺序发送多个请求时，客户端会挂起每个调用，直到前一个调用完成。若要并发执行多个请求，请使用
[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)
或 [`async()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)
函数。以下示例演示了如何使用 `async()` 并行执行两个请求：

```kotlin
coroutineScope {
    // 并行请求
    val firstRequest: Deferred<String> = async { client.get("http://localhost:8080/path1").bodyAsText() }
    val secondRequest: Deferred<String> = async { client.get("http://localhost:8080/path2").bodyAsText() }
    val firstRequestContent = firstRequest.await()
    val secondRequestContent = secondRequest.await()
}
```

完整示例请参阅 [client-parallel-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-parallel-requests)。

## 取消请求 {id="cancel-request"}

若要取消请求，请取消运行该请求的协程。
[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)
函数返回一个可用于取消正在运行的协程的 `Job`：

```kotlin
import kotlinx.coroutines.*

val client = HttpClient(CIO)
val job = launch {
    val requestContent: String = client.get("http://localhost:8080")
}
job.cancel()
```

更多详细信息，请参阅[取消与超时](https://kotlinlang.org/docs/cancellation-and-timeouts.html)。