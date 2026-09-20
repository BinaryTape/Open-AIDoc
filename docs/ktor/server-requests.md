[//]: # (title: 处理请求)

<show-structure for="chapter" depth="3"/>

<link-summary>了解如何在路由处理程序内部处理传入的请求。</link-summary>

Ktor 允许您从[路由处理程序](server-routing.md#define_route)内部处理传入的请求并发送[响应](server-responses.md)。

每个路由处理程序都通过 `call` 属性提供一个 [`ApplicationCall`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html) 对象。`ApplicationCall` 表示单个 HTTP 交换，并提供对传入请求和传出响应的访问。

在路由处理程序内部，您可以使用 `ApplicationCall` 执行以下操作：

* 访问[请求信息](#request_information)，例如标头、Cookie 和连接详情。
* 获取[路径形参](#path_parameters)。
* 获取[查询形参](#query_parameters)。
* 接收[请求正文内容](#body_contents)，例如数据对象、表单形参和文件。

## 通用请求信息 {id="request_information"}

您可以通过 [`call.request`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/request.html) 属性访问请求数据。这将返回一个 [`ApplicationRequest`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/index.html) 实例，该实例提供对底层 HTTP 请求信息的访问。

例如，您可以在 GET 请求处理程序中使用 `call.request.uri` 获取请求 URI：

```kotlin
routing {
    get("/") {
        val uri = call.request.uri
        call.respondText("Request uri: $uri")
    }
}
```

[`call.respondText()`](server-responses.md#plain-text) 函数用于将纯文本响应发送回客户端。

### 标头 {id="headers"}

要访问所有 HTTP 请求标头，请使用 [`ApplicationRequest.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/headers.html) 属性。

为了方便起见，Ktor 还提供了专用的扩展函数来访问常用的标头，例如 [`.acceptEncoding()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/accept-encoding.html)、[`.contentType()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/content-type.html) 和 [`.cacheControl()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/cache-control.html)。

### Cookie {id="cookies"}

要访问随请求发送的 Cookie，请使用 [`ApplicationRequest.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/cookies.html) 属性。

> 有关使用 Cookie 处理会话的更多信息，请参阅[会话](server-sessions.md)部分。
> 
{style="tip"}

### 连接详情 {id="connection-details"}

使用 [`ApplicationRequest.local`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 属性可以访问连接详情，例如主机、端口和方案。

### `X-Forwarded-` 标头 {id="x-forwarded-headers"}

要收集通过 HTTP 代理或负载均衡器传递的请求信息，请安装 [Forwarded headers](server-forward-headers.md) 插件。然后您可以通过 [`ApplicationRequest.origin`](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 属性访问这些信息。

## 路径形参 {id="path_parameters"}

处理请求时，您可以使用 `ApplicationCall.parameters` 属性获取[路径形参](server-routing.md#path_parameter)的值。

例如，对于向 `/user/admin` 发起的请求，`call.parameters["login"]` 将返回 `"admin"`：

```kotlin
get("/user/{login}") {
    if (call.parameters["login"] == "admin") {
        // ...
    }
}
```

## 查询形参 {id="query_parameters"}

要获取 URL 查询字符串的形参，请使用 [`ApplicationRequest.queryParameters`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/query-parameters.html) 属性。

以下示例访问了对 `/products?price=asc` 发起的请求中的 `price` 查询形参：

```kotlin
get("/products") {
    if (call.request.queryParameters["price"] == "asc") {
        // 按价格从低到高显示产品
    }
}
```

您还可以使用 [`ApplicationRequest.queryString()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/query-string.html) 函数获取整个查询字符串。

## 必选请求形参 {id="required-request-parameters"}

处理请求时，通常会从[路径形参](#path_parameters)、[查询形参](#query_parameters)、[标头](#headers)或 [Cookie](#cookies) 中提取值，并在继续处理请求之前验证它们是否存在。

Ktor 提供了以下辅助函数来简化对必选请求数据的访问，从而避免在每个路由处理程序中手动检查缺失值：

* [`.requireQueryParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-query-parameter.html) 从请求 URL 中检索所需的查询形参。
* [`.requireHeader()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-header.html) 检索所需的 HTTP 标头值。
* [`.requireCookie()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-cookie.html) 检索所需的 Cookie 值，（可选）使用指定的编码进行解码。
* [`.requirePathParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-path-parameter.html) 从路由定义中检索所需的路径形参。

每个函数都会返回一个非 null 值，或者在请求的值缺失时抛出 `MissingRequestParameterException`。

```kotlin
post("/checkout/{cartId}") {
    val userId = call.requireCookie("userId")
    val cartId = call.requirePathParameter("cartId")
    val amount = call.requireQueryParameter("amount").toLong()

    // 业务逻辑
}
```

## 正文内容 {id="body_contents"}

要访问请求正文，请使用 Ktor 的接收函数。具体使用哪种函数取决于您需要[原始内容](#raw)、[反序列化对象](#objects)、[表单形参](#form_parameters)还是[多部分数据](#form_data)。

### 原始载荷 {id="raw"}

要访问原始正文载荷并手动进行解析，请使用 [`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html) 函数，该函数接受要接收的载荷类型。

假设客户端发送了以下 HTTP 请求：

```HTTP
POST http://localhost:8080/text
Content-Type: text/plain

Hello, world!
```

您可以将请求正文作为 [`String`](#string)、[`ByteArray`](#bytearray) 或 [`ByteReadChannel`](#bytereadchannel) 接收。

#### `String` {id="string"}

要将请求正文作为文本接收，请使用 `.receive<String>()` 或 [`.receiveText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-text.html) 函数：
```kotlin
post("/text") {
    val text = call.receiveText()
    call.respondText(text)
}
```

#### `ByteArray` {id="bytearray"}

要将请求正文作为字节数组接收，请使用 `.receive<ByteArray>()` 函数：

```kotlin
        post("/bytes") {
            val bytes = call.receive<ByteArray>()
            call.respond(String(bytes))
        }

```

#### `ByteReadChannel` {id="bytereadchannel"}

要将其作为 [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) 异步读取正文，请使用 `.receive<ByteReadChannel>()` 或 [`.receiveChannel()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-channel.html) 函数：

```kotlin
post("/channel") {
    val readChannel = call.receiveChannel()
    val text = readChannel.readRemaining().readString()
    call.respondText(text)
}
```

您还可以使用 `ByteReadChannel` 上传文件：

```kotlin
post("/upload") {
    val file = File("uploads/ktor_logo.png")
    call.receiveChannel().copyAndClose(file.writeChannel())
    call.respondText("A file is uploaded")
}
```

> 有关在 Ktor 通道与 `RawSink`、`RawSource` 或 `OutputStream` 等类型之间进行转换的信息，请参阅 [I/O 互操作性](io-interoperability.md)。
>
{style="tip"}

> 有关完整示例，请参阅 [post-raw-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-raw-data)。
> 
{style="tip"}

### 对象 {id="objects"}

Ktor 提供了 [`ContentNegotiation`](server-serialization.md) 插件来协商请求的媒体类型并将内容反序列化为所需类型的对象。

要接收并转换请求的内容，请使用带有预期类型的 [`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html) 函数：

```kotlin
post("/customer") {
    val customer = call.receive<Customer>()
    customerStorage.add(customer)
    call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
}
```

如果请求内容可以反序列化为 `null`，请使用可空类型实参：

```kotlin
val customer = call.receive<Customer?>()
```

> 欲了解更多信息，请参阅 [Ktor Server 中的内容协商与序列化](server-serialization.md)。
> 
{style="tip"}

### 表单形参 {id="form_parameters"}

您可以使用 [`.receiveParameters()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-parameters.html) 函数接收通过 `x-www-form-urlencoded` 和 `multipart/form-data` 类型发送的表单形参。

例如，假设客户端发送了以下请求：

```HTTP
POST http://localhost:8080/signup
Content-Type: application/x-www-form-urlencoded

username=JetBrains&email=example@jetbrains.com&password=foobar&confirmation=foobar
```

您可以按如下方式在代码中获取形参值：

```kotlin
post("/signup") {
    val formParameters = call.receiveParameters()
    val username = formParameters["username"].toString()
    call.respondText("The '$username' account is created")
}
```

> 有关完整示例，请参阅 [post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)。
> 
{style="tip"}

### 多部分表单数据 {id="form_data"}

要接收作为多部分请求的一部分发送的文件，请使用 [`.receiveMultipart()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-multipart.html) 函数。

多部分请求数据是按顺序处理的，因此您无法直接访问其特定部分。每个部分都可以表示表单字段、文件或其他二进制内容，因此需要分别处理每种类型。

以下示例接收表单字段和文件，然后将文件保存到本地文件系统：

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

#### 默认文件大小限制 {id="default-file-size-limit"}

默认情况下，二进制项和文件项的大小限制为 50 MiB。如果某个部分超过此限制，Ktor 会抛出 `IOException`。

要替代调用的默认限制，请将 `formFieldLimit` 形参传递给 `.receiveMultipart()` 函数：

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

在此示例中，限制被设置为 100 MiB。

#### 表单字段 {id="form-fields"}

`PartData.FormItem` 代表表单字段。您可以通过 `value` 属性访问其值：

```kotlin
when (part) {
    is PartData.FormItem -> {
        fileDescription = part.value
    }
}
```

#### 文件上传 {id="file-uploads"}

`PartData.FileItem` 代表上传的文件。您可以将文件上传作为字节流进行处理。使用 [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 函数以 `ByteReadChannel` 形式访问文件内容，并将其流式传输到目标位置：

```kotlin
when (part) {
    is PartData.FileItem -> {
        fileName = part.originalFileName as String
        val file = File("uploads/$fileName")
        part.provider().copyAndClose(file.writeChannel())
    }
}
```

使用 `.copyAndClose()` 函数，您可以将文件内容写入指定目标位置，同时确保正确的资源清理。

如果请求包含 `Content-Length` [标头值](#request_information)，您可以使用它来检查整个请求正文的大小：

```kotlin
post("/upload") {
    val contentLength = call.request.header(HttpHeaders.ContentLength)
    // ...
}
```

对于多部分请求，`Content-Length` 表示整个多部分正文的大小，而不是单个上传文件的大小。

#### 资源清理 {id="resource-cleanup"}

表单处理完成后，使用 `.dispose()` 函数处置每个多部分项以释放其资源：

```kotlin
part.dispose()
```

> 要了解如何运行此示例，请参阅 [upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)。
> 
{style="tip"}