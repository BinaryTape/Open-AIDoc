[//]: # (title: 요청 보내기)

<show-structure for="chapter" depth="2"/>

[percent_encoding]: https://en.wikipedia.org/wiki/Percent-encoding

<tldr>
<var name="example_name" value="client-configure-request"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
요청을 생성하고 요청 URL, HTTP 메서드, 헤더, 요청 본문(body) 등 다양한 요청 매개변수를 지정하는 방법을 알아봅니다.
</link-summary>

[클라이언트를 구성](client-create-and-configure.md)한 후에는 HTTP 요청을 보내기 시작할 수 있습니다. 가장 기본적인 방법은 URL을 매개변수로 받는
[`.request()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/request.html)
함수를 사용하는 것입니다. 이 함수 내에서 다양한 요청 매개변수를 구성할 수 있습니다.

* `GET`, `POST`, `PUT`, `DELETE`, `HEAD`, `OPTIONS`, `PATCH`와 같은 HTTP 메서드를 지정합니다.
* URL을 문자열로 구성하거나 구성 요소(도메인, 경로, 쿼리 매개변수 등)를 개별적으로 구성합니다.
* 유닉스 도메인 소켓(Unix domain socket)을 사용합니다.
* 헤더와 쿠키를 추가합니다.
* 일반 텍스트, 데이터 객체, 폼 매개변수와 같은 요청 본문을 포함합니다.

이러한 매개변수들은
[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)
클래스에 의해 제공됩니다.

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*

val response: HttpResponse = client.request("https://ktor.io/") {
  // HttpRequestBuilder가 제공하는 요청 매개변수 구성
}
```

{interpolate-variables="true" disable-links="false"}

`.request()` 함수는 응답을 `HttpResponse` 객체로 반환합니다. `HttpResponse`는 문자열, JSON 객체 등 다양한 형식으로 응답 본문을 가져오는 데 필요한 API뿐만 아니라 상태 코드, 콘텐츠 타입, 헤더와 같은 응답 매개변수를 가져오는 API도 제공합니다. 자세한 내용은
[응답 수신](client-responses.md)을 참조하세요.

> `.request()`는 일시 중단 함수(suspending function)이므로 코루틴 내부나 다른 일시 중단 함수 내에서 호출해야 합니다. 일시 중단 함수에 대한 자세한 내용은
> [Coroutines basics](https://kotlinlang.org/docs/coroutines-basics.html)를 참조하세요.

### HTTP 메서드 지정 {id="http-method"}

`.request()` 함수를 호출할 때 `method` 프로퍼티를 사용하여 원하는 HTTP 메서드를 지정할 수 있습니다.

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.request("https://ktor.io/") {
    method = HttpMethod.Get
}
```

`.request()` 외에도 `HttpClient`는
[`.get()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html),
[`.post()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/post.html),
[`.put()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/put.html)과 같이 기본적인 HTTP 메서드를 위한 전용 함수를 제공합니다.
위의 예제는 `.get()` 함수를 사용하여 다음과 같이 단순화할 수 있습니다.

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

두 예제 모두 요청 URL이 문자열로 지정되어 있습니다. [`HttpRequestBuilder`](#url)를 사용하여 URL 구성 요소를 개별적으로 지정할 수도 있습니다.

## 요청 URL 지정 {id="url"}

Ktor 클라이언트를 사용하면 여러 가지 방법으로 요청 URL을 구성할 수 있습니다.

### 전체 URL 문자열 전달 {id="pass-the-entire-url-string"}

```kotlin
val response: HttpResponse = client.get("https://ktor.io/docs/welcome.html")
```

### URL 구성 요소 개별 구성 {id="configure-url-components-separately"}

```kotlin
client.get {
    url {
        protocol = URLProtocol.HTTPS
        host = "ktor.io"
        path("docs/welcome.html")
    }
}
```

이 경우 `HttpRequestBuilder`가 제공하는 `url` 매개변수가 사용됩니다. 이 매개변수는
[`URLBuilder`](https://api.ktor.io/ktor-http/io.ktor.http/-u-r-l-builder/index.html) 인스턴스를 받아 복잡한 URL을 구축할 때 더 높은 유연성을 제공합니다.

> 모든 요청에 대한 기본 URL을 구성하려면 [`DefaultRequest`](client-default-request.md#url) 플러그인을 사용하세요.

### 경로 세그먼트 {id="path_segments"}

이전 예제에서는 `URLBuilder.path` 프로퍼티를 사용하여 전체 URL 경로를 지정했습니다.
대신 `appendPathSegments()` 함수를 사용하여 개별 경로 세그먼트를 전달할 수도 있습니다.

```kotlin
client.get("https://ktor.io") {
    url {
        appendPathSegments("docs", "welcome.html")
    }
}
```

기본적으로 `appendPathSegments`는 경로 세그먼트를 [인코딩][percent_encoding]합니다.
인코딩을 비활성화하려면 대신 `appendEncodedPathSegments()`를 사용하세요.

### 쿼리 매개변수 {id="query_parameters"}

<emphasis tooltip="query_string">쿼리 스트링(query string)</emphasis> 매개변수를 추가하려면 `URLBuilder.parameters` 프로퍼티를 사용합니다.

```kotlin
client.get("https://ktor.io") {
    url {
        parameters.append("token", "abc123")
    }
}
```

기본적으로 `parameters`는 쿼리 매개변수를 [인코딩][percent_encoding]합니다.
인코딩을 비활성화하려면 대신 `encodedParameters()`를 사용하세요.

> `trailingQuery` 프로퍼티를 사용하면 쿼리 매개변수가 없더라도 `?` 문자를 유지할 수 있습니다.

### URL 프래그먼트 {id="url-fragment"}

해시 기호 `#`는 URL 끝부분에 선택적 프래그먼트(fragment)를 도입합니다.
`fragment` 프로퍼티를 사용하여 URL 프래그먼트를 구성할 수 있습니다.

```kotlin
client.get("https://ktor.io") {
    url {
        fragment = "some_anchor"
    }
}
```

기본적으로 `fragment`는 URL 프래그먼트를 [인코딩][percent_encoding]합니다.
인코딩을 비활성화하려면 대신 `encodedFragment()`를 사용하세요.

## 유닉스 도메인 소켓 지정 {id="specify-a-unix-domain-socket"}

> 유닉스 도메인 소켓은 CIO 엔진에서만 지원됩니다.
> Ktor 서버에서 유닉스 소켓을 사용하려면 그에 맞게 [서버를 구성](server-configuration-code.topic#cio-code)하세요.
>
{style="note"}

유닉스 도메인 소켓에서 수신 대기 중인 서버로 요청을 보내려면, CIO 클라이언트를 사용할 때 `unixSocket()` 함수를 호출합니다.

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

유닉스 도메인 소켓을 [기본 요청](client-default-request.md#unix-domain-sockets)의 일부로 구성할 수도 있습니다.

## 요청 매개변수 설정 {id="parameters"}

HTTP 메서드, 헤더, 쿠키를 포함한 다양한 요청 매개변수를 지정할 수 있습니다. 특정 클라이언트의 모든 요청에 대해 기본 매개변수를 구성해야 하는 경우 [`DefaultRequest`](client-default-request.md) 플러그인을 사용하세요.

### 헤더 {id="headers"}

여러 가지 방법으로 요청에 헤더를 추가할 수 있습니다.

#### 여러 헤더 추가 {id="add-multiple-headers"}

[`headers`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/headers.html) 함수를 사용하면 여러 헤더를 한 번에 추가할 수 있습니다.

```kotlin
client.get("https://ktor.io") {
    headers {
        append(HttpHeaders.Accept, "text/html")
        append(HttpHeaders.Authorization, "abc123")
        append(HttpHeaders.UserAgent, "ktor client")
    }
}
```

`Map` 또는 `vararg Pair`와 함께 `appendAll()` 함수를 사용하여 여러 헤더를 편리하게 추가할 수도 있습니다.

```kotlin
        client.get("https://ktor.io") {
            headers {
                // vararg Pairs 사용
                appendAll(
                    HttpHeaders.Accept to "text/html",
                    HttpHeaders.Authorization to "abc123"
                )

                // Map 사용
                appendAll(mapOf("foo" to "bar", "baz" to "qux"))
                appendAll(mapOf("test" to listOf("1", "2", "3")))

                // 여러 값을 가진 커스텀 헤더 사용
                appendAll("X-Custom-Header" to listOf("val1", "val2"))
            }
        }
```

#### 단일 헤더 추가 {id="add-a-single-header"}

[`header`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/header.html) 함수를 사용하면 단일 헤더를 추가할 수 있습니다.

#### 인증을 위해 `basicAuth` 또는 `bearerAuth` 사용 {id="use-basicauth-or-bearerauth-for-authorization"}

`basicAuth` 및 `bearerAuth` 함수는 해당 HTTP 스키마와 함께 `Authorization` 헤더를 추가합니다.

> 고급 인증 구성에 대해서는 [Ktor Client의 인증 및 인가](client-auth.md)를 참조하세요.

### 쿠키 {id="cookies"}

쿠키를 전송하려면
[`cookie()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/cookie.html) 함수를 사용하세요.

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

또한 Ktor는 호출 간에 쿠키를 유지할 수 있도록 해주는 [`HttpCookies`](client-cookies.md) 플러그인을 제공합니다. 이 플러그인이 설치되어 있으면 `cookie()` 함수를 사용하여 추가된 쿠키는 무시됩니다.

## 요청 본문 설정 {id="body"}

요청 본문(body)을 설정하려면
[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)에서 제공하는 `setBody()` 함수를 호출합니다.
이 함수는 일반 텍스트, 임의의 클래스 인스턴스, 폼 데이터, 바이트 배열 등 다양한 유형의 페이로드를 허용합니다.

### 텍스트 {id="text"}

일반 텍스트를 본문으로 전송하는 방법은 다음과 같이 구현할 수 있습니다.

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*

val response: HttpResponse = client.post("http://localhost:8080/post") {
    setBody("Body content")
}
```

### 객체 {id="objects"}

[`ContentNegotiation`](client-serialization.md) 플러그인을 활성화하면 클래스 인스턴스를 JSON 형태의 요청 본문으로 전송할 수 있습니다. 이를 위해 `setBody()` 함수에 클래스 인스턴스를 전달하고, [`contentType()`](https://api.ktor.io/ktor-http/io.ktor.http/content-type.html) 함수를 사용하여 콘텐츠 타입을 `application/json`으로 설정합니다.

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

자세한 내용은 [Ktor Client의 콘텐츠 협상 및 직렬화](client-serialization.md)를 참조하세요.

### 폼 매개변수 {id="form_parameters"}

Ktor 클라이언트는 `application/x-www-form-urlencoded` 타입으로 폼 매개변수를 전송하기 위한
[`submitForm()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form.html)
함수를 제공합니다. 다음 예제는 그 사용법을 보여줍니다.

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

* `url`은 요청을 보낼 URL을 지정합니다.
* `formParameters`는 `parameters`를 사용하여 구성된 폼 매개변수 집합입니다.

전체 예제는 [client-submit-form](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-submit-form)을 참조하세요.

> URL에 인코딩된 폼 매개변수를 전송하려면 `encodeInQuery`를 `true`로 설정하세요.

### 파일 업로드 {id="upload_file"}

폼과 함께 파일을 전송해야 하는 경우 다음과 같은 방식을 사용할 수 있습니다.

* [`.submitFormWithBinaryData()`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/submit-form-with-binary-data.html)
  함수를 사용합니다. 이 경우 바운더리(boundary)가 자동으로 생성됩니다.
* `post` 함수를 호출하고 `setBody` 함수에
  [`MultiPartFormDataContent`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/-multi-part-form-data-content/index.html)
  인스턴스를 전달합니다. `MultiPartFormDataContent` 생성자를 통해 바운더리 값을 직접 전달할 수도 있습니다.

두 방식 모두
[`formData {}`](https://api.ktor.io/ktor-client-core/io.ktor.client.request.forms/form-data.html) 함수를 사용하여 폼 데이터를 구성해야 합니다.

#### `.submitFormWithBinaryData()` 사용 {id="using-submitformwithbinarydata"}

`.submitFormWithBinaryData()` 함수는 자동으로 바운더리를 생성하며, 파일 내용이 작아서 `.readBytes()`를 통해 메모리로 안전하게 읽어올 수 있는 간단한 사용 사례에 적합합니다.

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

전체 예제는 [client-upload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload)를 참조하세요.

#### `MultiPartFormDataContent` 사용 {id="using-multipartformdatacontent"}

크기가 크거나 동적인 콘텐츠를 효율적으로 스트리밍하려면 `InputProvider`와 함께 `MultiPartFormDataContent`를 사용할 수 있습니다.
`InputProvider`를 사용하면 파일 데이터를 메모리에 전부 로드하지 않고 버퍼링된 스트림으로 제공할 수 있으므로 대용량 파일에 매우 적합합니다. `MultiPartFormDataContent`를 사용하면 `onUpload` 콜백을 통해 업로드 진행률을 모니터링할 수도 있습니다.

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

멀티플랫폼 프로젝트에서는 `InputProvider`와 함께 `SystemFileSystem.source()`를 사용할 수 있습니다.

```kotlin
InputProvider { SystemFileSystem.source(Path("ktor_logo.png")).buffered() }
```

커스텀 바운더리와 콘텐츠 타입을 지정하여 `MultiPartFormDataContent`를 수동으로 구성할 수도 있습니다.

```kotlin
fun customMultiPartMixedDataContent(parts: List<PartData>): MultiPartFormDataContent {
    val boundary = "WebAppBoundary"
    val contentType = ContentType.MultiPart.Mixed.withParameter("boundary", boundary)
    return MultiPartFormDataContent(parts, boundary, contentType)
}
```

전체 예제는
[client-upload-progress](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-progress)를 참조하세요.

### 바이너리 데이터 {id="binary"}

`application/octet-stream` 콘텐츠 타입으로 바이너리 데이터를 전송하려면
[`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) 인스턴스를
`setBody()` 함수에 전달합니다.
예를 들어 [`File.readChannel()`](https://api.ktor.io/ktor-utils/io.ktor.util.cio/read-channel.html)
함수를 사용하여 파일에 대한 읽기 채널(read channel)을 열 수 있습니다.

```kotlin
val response = client.post("http://0.0.0.0:8080/upload") {
    setBody(File("ktor_logo.png").readChannel())
}
```

전체 예제는
[client-upload-binary-data](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-upload-binary-data)를 참조하세요.

## 병렬 요청 {id="parallel_requests"}

기본적으로 여러 요청을 순차적으로 전송하면, 클라이언트는 이전 요청이 완료될 때까지 각 호출을 일시 중단(suspend)합니다. 여러 요청을 동시에(동시성으로) 수행하려면
[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)
또는 [`async()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)
함수를 사용하세요. 다음 예제는 `async()`를 사용하여 두 개의 요청을 병렬로 실행하는 방법을 보여줍니다.

```kotlin
coroutineScope {
    // 병렬 요청
    val firstRequest: Deferred<String> = async { client.get("http://localhost:8080/path1").bodyAsText() }
    val secondRequest: Deferred<String> = async { client.get("http://localhost:8080/path2").bodyAsText() }
    val firstRequestContent = firstRequest.await()
    val secondRequestContent = secondRequest.await()
}
```

전체 예제는
[client-parallel-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-parallel-requests)를 참조하세요.

## 요청 취소 {id="cancel-request"}

요청을 취소하려면 해당 요청을 실행 중인 코루틴을 취소합니다.
[`launch()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)
함수는 실행 중인 코루틴을 취소하는 데 사용할 수 있는 `Job`을 반환합니다.

```kotlin
import kotlinx.coroutines.*

val client = HttpClient(CIO)
val job = launch {
    val requestContent: String = client.get("http://localhost:8080")
}
job.cancel()
```

자세한 내용은 [Cancellation and timeouts](https://kotlinlang.org/docs/cancellation-and-timeouts.html)를 참조하세요.