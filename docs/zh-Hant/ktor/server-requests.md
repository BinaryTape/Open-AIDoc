[//]: # (title: 處理請求)

<show-structure for="chapter" depth="3"/>

<link-summary>了解如何在路由處理常式中處理傳入的請求。</link-summary>

Ktor 允許您在 [路由處理常式](server-routing.md#define_route) 中處理傳入的請求並傳送 [回應](server-responses.md)。

每個路由處理常式都透過 `call` 屬性提供 [`ApplicationCall`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html)。`ApplicationCall` 代表單次 HTTP 交換，並提供對傳入請求和傳出回應的存取。

在路由處理常式中，您可以使用 `ApplicationCall` 來執行以下操作：

* 存取 [請求資訊](#request_information)，例如頁首、Cookies 和連線詳細資訊。
* 獲取 [路徑參數](#path_parameters)。
* 獲取 [查詢參數](#query_parameters)。
* 接收 [請求主體內容](#body_contents)，例如資料物件、表單參數和檔案。

## 一般請求資訊 {id="request_information"}

您可以透過 [`call.request`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/request.html) 屬性存取請求資料。這會傳回 [`ApplicationRequest`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/index.html) 執行個體，提供對底層 HTTP 請求資訊的存取。

例如，您可以在 GET 請求處理常式中使用 `call.request.uri` 獲取請求 URI：

```kotlin
routing {
    get("/") {
        val uri = call.request.uri
        call.respondText("Request uri: $uri")
    }
}
```

[`call.respondText()`](server-responses.md#plain-text) 函式會將純文字回應傳回給用戶端。

### 頁首 {id="headers"}

要存取所有 HTTP 請求頁首，請使用 [`ApplicationRequest.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/headers.html) 屬性。

為了方便起見，Ktor 還提供了專用的擴充函式來存取常用的頁首，例如 
[`.acceptEncoding()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/accept-encoding.html)、
[`.contentType()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/content-type.html) 和
[`.cacheControl()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/cache-control.html)。

### Cookies {id="cookies"}

要存取隨請求傳送的 Cookies，請使用 [`ApplicationRequest.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/cookies.html) 屬性。

> 關於使用 Cookies 處理工作階段的更多資訊，請參閱 [Sessions](server-sessions.md) 章節。
> 
{style="tip"}

### 連線詳細資訊 {id="connection-details"}

使用 [`ApplicationRequest.local`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 屬性來獲取連線詳細資訊，例如主機名稱、埠 (port) 和 scheme。

### `X-Forwarded-` 頁首 {id="x-forwarded-headers"}

要收集透過 HTTP 代理或負載平衡器傳遞的請求資訊，請安裝 [Forwarded headers](server-forward-headers.md) 外掛程式。然後，您可以透過 [`ApplicationRequest.origin`](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 屬性存取此資訊。

## 路徑參數 {id="path_parameters"}

處理請求時，您可以使用 `ApplicationCall.parameters` 屬性獲取 [路徑參數](server-routing.md#path_parameter) 值。

例如，對於 `/user/admin` 請求，`call.parameters["login"]` 將傳回 `"admin"`：

```kotlin
get("/user/{login}") {
    if (call.parameters["login"] == "admin") {
        // ...
    }
}
```

## 查詢參數 {id="query_parameters"}

要獲取 URL 查詢字串的參數，請使用 [`ApplicationRequest.queryParameters`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/query-parameters.html) 屬性。

以下範例存取對 `/products?price=asc` 請求中的 `price` 查詢參數：

```kotlin
get("/products") {
    if (call.request.queryParameters["price"] == "asc") {
        // 顯示價格從最低到最高的產品
    }
}
```

您也可以使用 [`ApplicationRequest.queryString()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/query-string.html) 函式獲取整個查詢字串。

## 必要的請求參數 {id="required-request-parameters"}

處理請求時，通常會從 [路徑參數](#path_parameters)、[查詢參數](#query_parameters)、[頁首](#headers) 或 [Cookies](#cookies) 中提取值，並在繼續處理請求之前驗證它們是否存在。

Ktor 提供以下輔助函式來簡化必要請求資料的存取，而不是在每個路由處理常式中手動檢查缺失的值：

* [`.requireQueryParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-query-parameter.html) 從請求 URL 中獲取必要的查詢參數。
* [`.requireHeader()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-header.html) 獲取必要的 HTTP 頁首值。
* [`.requireCookie()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-cookie.html) 獲取必要的 Cookie 值，並可選擇使用指定的編碼對其進行解碼。
* [`.requirePathParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-path-parameter.html) 從路由定義中獲取必要的路徑參數。

每個函式都會傳回非 null 值，或在請求的值缺失時拋出 `MissingRequestParameterException`。

```kotlin
post("/checkout/{cartId}") {
    val userId = call.requireCookie("userId")
    val cartId = call.requirePathParameter("cartId")
    val amount = call.requireQueryParameter("amount").toLong()

    // 業務邏輯
}
```

## 主體內容 {id="body_contents"}

要存取請求主體，請使用 Ktor 的接收函式。適用的函式取決於您需要 [原始內容](#raw)、[反序列化物件](#objects)、[表單參數](#form_parameters) 還是 [多部分資料](#form_data)。

### 原始負載 (Raw payload) {id="raw"}

要存取原始主體負載並手動剖析，請使用 [`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html) 函式，該函式接受要接收的負載型別。

假設用戶端傳送以下 HTTP 請求：

```HTTP
POST http://localhost:8080/text
Content-Type: text/plain

Hello, world!
```

您可以將請求主體作為 [`String`](#string)、[`ByteArray`](#bytearray) 或 [`ByteReadChannel`](#bytereadchannel) 接收。

#### `String` {id="string"}

要將請求主體作為文字接收，請使用 `.receive<String>()` 或 [`.receiveText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-text.html) 函式：
```kotlin
post("/text") {
    val text = call.receiveText()
    call.respondText(text)
}
```

#### `ByteArray` {id="bytearray"}

要將請求的主體作為位元組陣列接收，請使用 `.receive<ByteArray>()` 函式：

```kotlin
        post("/bytes") {
            val bytes = call.receive<ByteArray>()
            call.respond(String(bytes))
        }

```

#### `ByteReadChannel` {id="bytereadchannel"}

要將主體作為 [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) 非同步讀取，請使用 `.receive<ByteReadChannel>()` 或 [`.receiveChannel()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-channel.html) 函式：

```kotlin
post("/channel") {
    val readChannel = call.receiveChannel()
    val text = readChannel.readRemaining().readString()
    call.respondText(text)
}
```

您也可以使用 `ByteReadChannel` 來上傳檔案：

```kotlin
post("/upload") {
    val file = File("uploads/ktor_logo.png")
    call.receiveChannel().copyAndClose(file.writeChannel())
    call.respondText("A file is uploaded")
}
```

> 關於 Ktor 通道 (channels) 與 `RawSink`、`RawSource` 或 `OutputStream` 等型別之間的轉換，請參閱 [I/O 互通性](io-interoperability.md)。
>
{style="tip"}

> 如需完整範例，請參閱 [post-raw-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-raw-data)。
> 
{style="tip"}

### 物件 {id="objects"}

Ktor 提供 [`ContentNegotiation`](server-serialization.md) 外掛程式來交涉請求的媒體類型，並將內容反序列化為所需型別的物件。

要接收並轉換請求的內容，請使用 [`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html) 函式並指定預期的型別：

```kotlin
post("/customer") {
    val customer = call.receive<Customer>()
    customerStorage.add(customer)
    call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
}
```

如果請求內容可能反序列化為 `null`，請使用可為 null 的型別引數：

```kotlin
val customer = call.receive<Customer?>()
```

> 若要了解更多資訊，請參閱 [Ktor Server 中的內容交涉與序列化](server-serialization.md)。
> 
{style="tip"}

### 表單參數 {id="form_parameters"}

您可以使用 [`.receiveParameters()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-parameters.html) 函式接收以 `x-www-form-urlencoded` 和 `multipart/form-data` 類型傳送的表單參數。

例如，假設用戶端傳送以下請求：

```HTTP
POST http://localhost:8080/signup
Content-Type: application/x-www-form-urlencoded

username=JetBrains&email=example@jetbrains.com&password=foobar&confirmation=foobar
```

您可以在程式碼中按如下方式存取參數值：

```kotlin
post("/signup") {
    val formParameters = call.receiveParameters()
    val username = formParameters["username"].toString()
    call.respondText("The '$username' account is created")
}
```

> 如需完整範例，請參閱 [post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)。
> 
{style="tip"}

### 多部分表單資料 (Multipart form data) {id="form_data"}

要接收作為多部分請求一部分傳送的檔案，請使用 [`.receiveMultipart()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-multipart.html) 函式。

多部分請求資料是循序處理的，因此您無法直接存取其中的特定部分。每個部分都可以代表表單欄位、檔案或其他二進位內容，因此需要分別處理每種類型。

以下範例接收表單欄位與檔案，然後將檔案儲存至本機檔案系統：

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

#### 預設檔案大小限制 {id="default-file-size-limit"}

預設情況下，二進位和檔案部分的大小限制為 50 MiB。如果某個部分超過此限制，Ktor 會拋出 `IOException`。

要覆寫單次呼叫的預設限制，請在呼叫 `.receiveMultipart()` 函式時傳遞 `formFieldLimit` 參數：

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

在此範例中，限制設定為 100 MiB。

#### 表單欄位 {id="form-fields"}

`PartData.FormItem` 代表表單欄位。您可以透過 `value` 屬性存取其值：

```kotlin
when (part) {
    is PartData.FormItem -> {
        fileDescription = part.value
    }
}
```

#### 檔案上傳 {id="file-uploads"}

`PartData.FileItem` 代表上傳的檔案。您可以將檔案上傳作為位元組串流處理。使用 [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 函式將檔案內容作為 `ByteReadChannel` 存取，並將其串流至目的地：

```kotlin
when (part) {
    is PartData.FileItem -> {
        fileName = part.originalFileName as String
        val file = File("uploads/$fileName")
        part.provider().copyAndClose(file.writeChannel())
    }
}
```

使用 `.copyAndClose()` 函式，您可以在將檔案內容寫入指定目的地的同時，確保正確清理資源。

如果請求包含 `Content-Length` [頁首值](#request_information)，您可以使用它來檢查完整請求主體的大小：

```kotlin
post("/upload") {
    val contentLength = call.request.header(HttpHeaders.ContentLength)
    // ...
}
```

對於多部分請求，`Content-Length` 代表整個多部分主體，而不是單個上傳檔案的大小。

#### 資源清理 {id="resource-cleanup"}

表單處理完成後，使用 `.dispose()` 函式釋放每個多部分項目的資源：

```kotlin
part.dispose()
```

> 要了解如何執行此範例，請參閱 [upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)。
> 
{style="tip"}