[//]: # (title: 응답 보내기)

<show-structure for="chapter" depth="2"/>

<link-summary>다양한 유형의 응답을 보내는 방법을 알아봅니다.</link-summary>

Ktor를 사용하면 [라우트 핸들러](server-routing.md#define_route) 내에서 들어오는 [요청(requests)](server-requests.md)을 처리하고 응답(responses)을 보낼 수 있습니다. 일반 텍스트, HTML 문서 및 템플릿, 직렬화된 데이터 객체 등 다양한 유형의 응답을 보낼 수 있습니다. 또한 콘텐츠 타입, 헤더, 쿠키 및 상태 코드와 같은 다양한 [응답 파라미터](#parameters)를 구성할 수 있습니다.

라우트 핸들러 내부에서 응답 작업을 위해 다음과 같은 API를 사용할 수 있습니다:
* [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 및 [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html)과 같이 [특정 콘텐츠 타입을 보내기](#payload) 위한 함수 세트.
* 응답 내에 [모든 데이터 타입을 보낼 수](#payload) 있게 해주는 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 함수. [ContentNegotiation](server-serialization.md) 플러그인이 설치되어 있으면 특정 형식으로 직렬화된 데이터 객체를 보낼 수 있습니다.
* [`ApplicationResponse`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/index.html) 객체를 반환하는 [`call.response()`](https://api.ktor.io/ktor-server-application/-application-call/response.html) 프로퍼티. 이를 통해 상태 코드 설정, 헤더 추가 및 쿠키 구성과 같은 [응답 파라미터](#parameters)에 접근할 수 있습니다.
* 리다이렉트 응답을 보내기 위한 [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 함수.

## 응답 페이로드 설정 {id="payload"}

### 일반 텍스트 {id="plain-text"}

일반 텍스트(Plain text)를 보내려면 [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 함수를 사용하세요:
```kotlin
get("/") {
    call.respondText("Hello, world!")
}
```

### HTML {id="html"}

Ktor는 HTML 응답을 생성하기 위한 두 가지 주요 메커니즘을 제공합니다:
* Kotlin HTML DSL을 사용하여 HTML 빌드.
* [FreeMarker](https://freemarker.apache.org/) 또는 [Velocity](https://velocity.apache.org/engine/)와 같은 JVM 템플릿 엔진을 사용하여 템플릿 렌더링.

#### 전체 HTML 문서 {id="full-html-documents"}

Kotlin DSL로 빌드된 전체 HTML 문서를 보내려면 [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 함수를 사용하세요:

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

#### 부분 HTML 프래그먼트 {id="partial-html-fragments"}

`<html>`, `<head>`, 또는 `<body>`로 감싸지 않고 HTML의 일부(fragment)만 반환해야 하는 경우, `call.respondHtmlPartial()`을 사용할 수 있습니다:

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

#### 템플릿 {id="templates"}

응답에 템플릿을 보내려면 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 함수를 특정 콘텐츠와 함께 사용하세요:
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(FreeMarkerContent("index.ftl", mapOf("user" to sampleUser)))
}
```

[`call.respondTemplate()`](https://api.ktor.io/ktor-server-freemarker/io.ktor.server.freemarker/respond-template.html) 함수를 사용할 수도 있습니다:
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respondTemplate("index.ftl", mapOf("user" to sampleUser))
}
```
더 자세한 내용은 [템플릿(Templating)](server-templating.md) 도움말 섹션에서 확인할 수 있습니다.

### 객체 {id="object"}

Ktor에서 데이터 객체의 직렬화를 활성화하려면 [ContentNegotiation](server-serialization.md) 플러그인을 설치하고 필요한 컨버터(예: JSON)를 등록해야 합니다. 그런 다음 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 함수를 사용하여 응답에 데이터 객체를 전달할 수 있습니다:

```kotlin
routing {
    get("/customer/{id}") {
        val id: Int by call.parameters
        val customer: Customer = customerStorage.find { it.id == id }!!
        call.respond(customer)
```

전체 예제는 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)를 참조하세요.

[//]: # (TODO: Check link for LocalPathFile)

### 파일 {id="file"}

클라이언트에게 파일 내용으로 응답하려면 두 가지 옵션이 있습니다:

- `File` 객체로 표현된 파일의 경우, [`call.respondFile()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-file.html) 함수를 사용하세요.
- 주어진 `Path` 객체가 가리키는 파일의 경우, [`LocalPathContent`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/-local-path-content/index.html) 클래스와 함께 `call.respond()` 함수를 사용하세요.

아래 예제는 파일을 보내고 `Content-Disposition` [헤더](#headers)를 추가하여 다운로드 가능하게 만드는 방법을 보여줍니다:

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

이 샘플은 두 가지 플러그인을 사용함에 유의하세요:
- [`PartialContent`](server-partial-content.md)는 서버가 `Range` 헤더가 포함된 요청에 응답하고 콘텐츠의 일부만 보낼 수 있도록 합니다.
- [`AutoHeadResponse`](server-autoheadresponse.md)는 `GET`이 정의된 모든 라우트에 대해 `HEAD` 요청에 자동으로 응답하는 기능을 제공합니다. 이를 통해 클라이언트 애플리케이션은 `Content-Length` 헤더 값을 읽어 파일 크기를 결정할 수 있습니다.

전체 코드 샘플은 [download-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/download-file)을 참조하세요.

### 리소스 {id="resource"}

[`call.respondResource()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-resource.html) 메서드를 사용하여 <tooltip term="classpath">클래스패스(classpath)</tooltip>에서 단일 리소스를 제공할 수 있습니다.
이 메서드는 리소스 경로를 인자로 받아 다음과 같은 방식으로 구성된 응답을 보냅니다:
리소스 스트림에서 응답 본문을 읽고, 파일 확장자에서 `Content-Type` 헤더를 도출합니다.

다음 예제는 라우트 핸들러에서의 메서드 호출을 보여줍니다:

```kotlin
routing {
    get("/resource") {
        call.respondResource("public/index.html")
    }
}
```

위 예제에서 리소스 확장자가 `.html`이므로 응답에는 `Content-Type: text/html` 헤더가 포함됩니다.
편의를 위해 첫 번째와 두 번째 파라미터를 통해 리소스 위치의 구성 요소(상대 경로 및 패키지)를 별도로 전달할 수 있습니다.
다음 예제는 요청된 경로를 기반으로 `assets` 패키지 아래의 리소스를 찾습니다:

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

`/assets` 접두사 이후의 요청 경로가 비어 있거나 `/`인 경우, 핸들러는 기본 `index.html` 리소스를 사용하여 응답합니다. 주어진 경로에서 리소스를 찾을 수 없으면 `IllegalArgumentException`이 발생합니다.
위의 코드 스니펫은 더 일반적인 솔루션인 [`staticResources()`](server-static-content.md#resources) 메서드를 사용하여 패키지에서 리소스를 제공하는 방식과 유사하게 작동합니다.

### Raw 페이로드 {id="raw"}

Raw 본문 페이로드를 보내려면 [`call.respondBytes()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-bytes.html) 함수를 사용하세요.

## 응답 파라미터 설정 {id="parameters"}

### 상태 코드 {id="status"}

응답의 상태 코드를 설정하려면 미리 정의된 상태 코드 값과 함께 [`ApplicationResponse.status()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/status.html) 함수를 호출하세요:

```kotlin
get("/") {
    call.response.status(HttpStatusCode.OK)
}
```

커스텀 상태 값을 지정할 수도 있습니다:

```kotlin
get("/") {
    call.response.status(HttpStatusCode(418, "I'm a tea pot"))
}
```

> 모든 페이로드 전송 함수는 상태 코드를 인자로 받는 오버로드도 제공합니다.
> 
{style="note"}

### 콘텐츠 타입 {id="content-type"}

[ContentNegotiation](server-serialization.md) 플러그인이 설치되어 있으면 Ktor가 자동으로 콘텐츠 타입을 선택합니다. 필요한 경우 해당 파라미터를 전달하여 수동으로 콘텐츠 타입을 지정할 수 있습니다. 

아래 예제에서 `call.respondText()` 함수는 `ContentType.Text.Plain`을 파라미터로 받습니다:

```kotlin
get("/") {
    call.respondText("Hello, world!", ContentType.Text.Plain, HttpStatusCode.OK)
}
```

### 헤더 {id="headers"}

여러 가지 방법으로 응답에 헤더를 추가할 수 있습니다:
* [`ApplicationResponse.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/headers.html) 컬렉션 수정:
   ```kotlin
    get("/") {
        call.response.headers.append(HttpHeaders.ETag, "7c876b7e")
        
        // 동일한 헤더에 대해 여러 값을 추가하는 경우 
        call.response.headers.appendAll("X-Custom-Header" to listOf("value1", "value2"))
    }
   ```
  
* [`ApplicationResponse.header()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/header.html) 함수 사용:
   ```kotlin
   get("/") {
       call.response.header(HttpHeaders.ETag, "7c876b7e")
   }
   ```
  
* `ApplicationResponse.etag`, `ApplicationResponse.link` 등 특정 헤더를 위한 편의 함수 사용.
   ```kotlin
   get("/") {
       call.response.etag("7c876b7e")
   }
   ```
  
* Raw 문자열 이름을 전달하여 커스텀 헤더 추가:
   ```kotlin
   get("/") {
       call.response.header("Custom-Header", "Some value")
   }
   ```

> 표준 `Server` 및 `Date` 헤더를 자동으로 포함하려면 [DefaultHeaders](server-default-headers.md) 플러그인을 설치하세요.
>
{type="tip"}

### 쿠키 {id="cookies"}

응답으로 전송되는 쿠키를 구성하려면 [`ApplicationResponse.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/cookies.html) 프로퍼티를 사용하세요:
```kotlin
get("/") {
    call.response.cookies.append("yummy_cookie", "choco")
}
```

> Ktor는 쿠키를 사용하여 세션을 처리하는 기능도 제공합니다. 자세한 내용은 [세션(Sessions)](server-sessions.md)을 참조하세요.

## 리다이렉트 {id="redirect"}

리다이렉트 응답을 생성하려면 [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 함수를 사용하세요:

```kotlin
get("/") {
    call.respondRedirect("/moved", permanent = true)
}

get("/moved") {
    call.respondText("Moved content")
}