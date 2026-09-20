[//]: # (title: 요청 처리하기)

<show-structure for="chapter" depth="3"/>

<link-summary>라우트 핸들러 내에서 들어오는 요청을 처리하는 방법을 알아봅니다.</link-summary>

Ktor를 사용하면 [라우트 핸들러](server-routing.md#define_route)에서 들어오는 요청을 처리하고 [응답](server-responses.md)을 보낼 수 있습니다.

각 라우트 핸들러는 `call` 속성을 통해 [`ApplicationCall`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html)을 제공합니다. `ApplicationCall`은 단일 HTTP 교환을 나타내며 들어오는 요청과 나가는 응답 모두에 대한 접근을 제공합니다.

라우트 핸들러 내에서 `ApplicationCall`을 사용하여 다음과 같은 작업을 수행할 수 있습니다:

* 헤더, 쿠키, 연결 세부 정보와 같은 [요청 정보](#request_information) 접근하기.
* [경로 파라미터(path parameters)](#path_parameters) 가져오기.
* [쿼리 파라미터(query parameters)](#query_parameters) 가져오기.
* 데이터 객체, 폼 파라미터, 파일과 같은 [요청 바디 콘텐츠(request body content)](#body_contents) 수신하기.

## 일반적인 요청 정보 {id="request_information"}

[`call.request`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/request.html) 속성을 통해 요청 데이터에 접근할 수 있습니다. 이는 로우 레벨(low-level) HTTP 요청 정보에 대한 접근을 제공하는 [`ApplicationRequest`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/index.html) 인스턴스를 반환합니다.

예를 들어, GET 요청 핸들러에서 `call.request.uri`를 사용하여 요청 URI를 가져올 수 있습니다:

```kotlin
routing {
    get("/") {
        val uri = call.request.uri
        call.respondText("Request uri: $uri")
    }
}
```

[`call.respondText()`](server-responses.md#plain-text) 함수는 클라이언트에 일반 텍스트 응답을 다시 보냅니다.

### 헤더 {id="headers"}

모든 HTTP 요청 헤더에 접근하려면 [`ApplicationRequest.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/headers.html) 속성을 사용하세요.

편의를 위해 Ktor는 [`.acceptEncoding()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/accept-encoding.html), [`.contentType()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/content-type.html), [`.cacheControl()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/cache-control.html)과 같이 자주 사용되는 헤더에 접근하기 위한 전용 확장 함수도 제공합니다.

### 쿠키 {id="cookies"}

요청과 함께 전송된 쿠키에 접근하려면 [`ApplicationRequest.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/cookies.html) 속성을 사용하세요.

> 쿠키를 사용하여 세션을 처리하는 방법에 대한 자세한 내용은 [Sessions](server-sessions.md) 섹션을 참조하세요.
> 
{style="tip"}

### 연결 세부 정보 {id="connection-details"}

호스트, 포트, 스키마 등과 같은 연결 세부 정보에 접근하려면 [`ApplicationRequest.local`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 속성을 사용하세요.

### `X-Forwarded-` 헤더 {id="x-forwarded-headers"}

HTTP 프록시나 로드 밸런서를 통해 전달된 요청에 대한 정보를 수집하려면, [Forwarded headers](server-forward-headers.md) 플러그인을 설치하세요. 그런 다음 [`ApplicationRequest.origin`](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 속성을 통해 이 정보에 접근할 수 있습니다.

## 경로 파라미터 {id="path_parameters"}

요청을 처리할 때, `ApplicationCall.parameters` 속성을 사용하여 [경로 파라미터](server-routing.md#path_parameter) 값을 가져올 수 있습니다.

예를 들어, `/user/admin` 요청에 대해 `call.parameters["login"]`은 `"admin"`을 반환합니다:

```kotlin
get("/user/{login}") {
    if (call.parameters["login"] == "admin") {
        // ...
    }
}
```

## 쿼리 파라미터 {id="query_parameters"}

URL 쿼리 문자열의 파라미터를 가져오려면 [`ApplicationRequest.queryParameters`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/query-parameters.html) 속성을 사용하세요.

다음 예제는 `/products?price=asc`로 들어온 요청에서 `price` 쿼리 파라미터에 접근합니다:

```kotlin
get("/products") {
    if (call.request.queryParameters["price"] == "asc") {
        // 가장 낮은 가격부터 가장 높은 가격 순으로 제품 표시
    }
}
```

[`ApplicationRequest.queryString()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/query-string.html) 함수를 사용하여 전체 쿼리 문자열을 가져올 수도 있습니다.

## 필수 요청 파라미터 {id="required-request-parameters"}

요청을 처리할 때, [경로 파라미터](#path_parameters), [쿼리 파라미터](#query_parameters), [헤더](#headers) 또는 [쿠키](#cookies)에서 값을 추출하고 요청 처리를 계속하기 전에 해당 값이 존재하는지 검증하는 것이 일반적입니다.

모든 라우트 핸들러에서 누락된 값을 수동으로 확인하는 대신, Ktor는 필수 요청 데이터에 대한 접근을 단순화하는 다음과 같은 헬퍼 함수를 제공합니다:

* [`.requireQueryParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-query-parameter.html) — 요청 URL에서 필수 쿼리 파라미터를 가져옵니다.
* [`.requireHeader()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-header.html) — 필수 HTTP 헤더 값을 가져옵니다.
* [`.requireCookie()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-cookie.html) — 필수 쿠키 값을 가져오며, 선택적으로 지정된 인코딩을 사용하여 디코딩합니다.
* [`.requirePathParameter()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/require-path-parameter.html) — 라우트 정의에서 필수 경로 파라미터를 가져옵니다.

각 함수는 null이 아닌 값을 반환하거나, 요청된 값이 누락된 경우 `MissingRequestParameterException`을 발생시킵니다.

```kotlin
post("/checkout/{cartId}") {
    val userId = call.requireCookie("userId")
    val cartId = call.requirePathParameter("cartId")
    val amount = call.requireQueryParameter("amount").toLong()

    // 비즈니스 로직
}
```

## 바디 콘텐츠 {id="body_contents"}

요청 바디에 접근하려면 Ktor의 receive 함수를 사용하세요. [원시 페이로드](#raw), [역직렬화된 객체](#objects), [폼 파라미터](#form_parameters), [멀티파트 데이터](#form_data) 중 필요한 대상에 따라 적절한 함수를 사용합니다.

### 원시 페이로드 {id="raw"}

원시 바디 페이로드(payload)에 접근하여 수동으로 파싱하려면, 수신할 페이로드 타입을 받는 [`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html) 함수를 사용하세요.

클라이언트가 다음과 같은 HTTP 요청을 보낸다고 가정해 보겠습니다:

```HTTP
POST http://localhost:8080/text
Content-Type: text/plain

Hello, world!
```

요청 바디를 [`String`](#string), [`ByteArray`](#bytearray) 또는 [`ByteReadChannel`](#bytereadchannel)로 수신할 수 있습니다.

#### `String` {id="string"}

요청 바디를 텍스트로 수신하려면 `.receive<String>()` 또는 [`.receiveText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-text.html) 함수를 사용하세요:
```kotlin
post("/text") {
    val text = call.receiveText()
    call.respondText(text)
}
```

#### `ByteArray` {id="bytearray"}

요청 바디를 바이트 배열로 수신하려면 `.receive<ByteArray>()` 함수를 사용하세요:

```kotlin
        post("/bytes") {
            val bytes = call.receive<ByteArray>()
            call.respond(String(bytes))
        }

```

#### `ByteReadChannel` {id="bytereadchannel"}

바디를 비동기적으로 [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)로 읽으려면 `.receive<ByteReadChannel>()` 또는 [`.receiveChannel()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-channel.html) 함수를 사용하세요:

```kotlin
post("/channel") {
    val readChannel = call.receiveChannel()
    val text = readChannel.readRemaining().readString()
    call.respondText(text)
}
```

`ByteReadChannel`을 사용하여 파일을 업로드할 수도 있습니다:

```kotlin
post("/upload") {
    val file = File("uploads/ktor_logo.png")
    call.receiveChannel().copyAndClose(file.writeChannel())
    call.respondText("A file is uploaded")
}
```

> Ktor 채널과 `RawSink`, `RawSource` 또는 `OutputStream`과 같은 타입 간의 변환에 대해서는 [I/O 상호 운용성(I/O interoperability)](io-interoperability.md)을 참조하세요.
>
{style="tip"}

> 전체 예제는 [post-raw-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-raw-data)를 참조하세요.
> 
{style="tip"}

### 객체 {id="objects"}

Ktor는 요청의 미디어 타입을 협상하고 콘텐츠를 필요한 타입의 객체로 역직렬화하는 [`ContentNegotiation`](server-serialization.md) 플러그인을 제공합니다.

요청에 대한 콘텐츠를 수신하고 변환하려면 기대하는 타입을 지정하여 [`ApplicationCall.receive()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive.html) 함수를 사용하세요:

```kotlin
post("/customer") {
    val customer = call.receive<Customer>()
    customerStorage.add(customer)
    call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
}
```

요청 콘텐츠가 `null`로 역직렬화될 수 있는 경우, 널 가능(nullable) 타입 인자를 사용하세요:

```kotlin
val customer = call.receive<Customer?>()
```

> 자세한 내용은 [Ktor 서버의 콘텐츠 협상 및 직렬화](server-serialization.md)를 참조하세요.
> 
{style="tip"}

### 폼 파라미터 {id="form_parameters"}

[`.receiveParameters()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-parameters.html) 함수를 사용하여 `x-www-form-urlencoded` 및 `multipart/form-data` 타입으로 전송된 폼 파라미터를 수신할 수 있습니다.

예를 들어, 클라이언트가 다음과 같은 요청을 보낸다고 가정해 보겠습니다:

```HTTP
POST http://localhost:8080/signup
Content-Type: application/x-www-form-urlencoded

username=JetBrains&email=example@jetbrains.com&password=foobar&confirmation=foobar
```

코드에서 다음과 같이 파라미터 값에 접근할 수 있습니다:

```kotlin
post("/signup") {
    val formParameters = call.receiveParameters()
    val username = formParameters["username"].toString()
    call.respondText("The '$username' account is created")
}
```

> 전체 예제는 [post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)를 참조하세요.
> 
{style="tip"}

### 멀티파트 폼 데이터 {id="form_data"}

멀티파트(multipart) 요청의 일부로 전송된 파일을 수신하려면 [`.receiveMultipart()`](https://api.ktor.io/ktor-server-core/io.ktor.server.request/receive-multipart.html) 함수를 사용하세요.

멀티파트 요청 데이터는 순차적으로 처리되므로 특정 파트에 직접 접근할 수 없습니다. 각 파트는 폼 필드, 파일 또는 기타 바이너리 콘텐츠를 나타낼 수 있으므로 각 타입을 별도로 처리해야 합니다.

다음 예제는 폼 필드와 파일을 수신한 다음 파일을 로컬 파일 시스템에 저장합니다:

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

#### 기본 파일 크기 제한 {id="default-file-size-limit"}

기본적으로 바이너리 및 파일 파트는 50MiB로 제한됩니다. 파트가 이 제한을 초과하면 Ktor는 `IOException`을 발생시킵니다.

호출에 대한 기본 제한을 재정의하려면 `.receiveMultipart()` 함수에 `formFieldLimit` 파라미터를 전달하세요:

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

이 예제에서는 제한을 100 MiB로 설정합니다.

#### 폼 필드 {id="form-fields"}

`PartData.FormItem`은 폼 필드를 나타냅니다. `value` 속성을 통해 해당 값에 접근할 수 있습니다:

```kotlin
when (part) {
    is PartData.FormItem -> {
        fileDescription = part.value
    }
}
```

#### 파일 업로드 {id="file-uploads"}

`PartData.FileItem`은 업로드된 파일을 나타냅니다. 파일 업로드를 바이트 스트림으로 처리할 수 있습니다. [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 함수를 사용하여 파일 콘텐츠에 `ByteReadChannel`로 접근하고 목적지로 스트리밍하세요:

```kotlin
when (part) {
    is PartData.FileItem -> {
        fileName = part.originalFileName as String
        val file = File("uploads/$fileName")
        part.provider().copyAndClose(file.writeChannel())
    }
}
```

`.copyAndClose()` 함수를 사용하면 적절한 리소스 정리를 보장하면서 파일 콘텐츠를 지정된 목적지에 씁니다.

요청에 `Content-Length` [헤더 값](#request_information)이 포함되어 있는 경우, 이를 사용하여 전체 요청 바디의 크기를 확인할 수 있습니다:

```kotlin
post("/upload") {
    val contentLength = call.request.header(HttpHeaders.ContentLength)
    // ...
}
```

멀티파트 요청의 경우 `Content-Length`는 업로드된 개별 파일의 크기가 아니라 전체 멀티파트 바디의 크기를 나타냅니다.

#### 리소스 정리 {id="resource-cleanup"}

폼 처리가 완료되면 리소스를 해제하기 위해 `.dispose()` 함수를 사용하여 각 멀티파트 파트를 폐기(dispose)하세요:

```kotlin
part.dispose()
```

> 이 샘플을 실행하는 방법을 알아보려면 [upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)을 참조하세요.
> 
{style="tip"}