[//]: # (title: 정적 콘텐츠 서빙)

<show-structure for="chapter" depth="2"/>

<tldr>
<p><b>코드 예제</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files">static-files</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources">static-resources</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip">static-zip</a>
</p>
</tldr>

<link-summary>
스타일시트, 스크립트, 이미지 등과 같은 정적 콘텐츠를 서빙하는 방법을 알아봅니다.
</link-summary>

웹사이트를 구축하든 HTTP 엔드포인트를 만들든, 애플리케이션에서는 스타일시트, 스크립트 또는 이미지와 같은 파일을 서빙해야 할 경우가 많습니다.
Ktor에서 파일의 내용을 로드하여 클라이언트에 [응답으로 전송](server-responses.md)하는 것이 아예 불가능한 것은 아니지만, Ktor는 정적 콘텐츠 서빙을 위한 추가 함수를 제공하여 이 프로세스를 단순화합니다.

Ktor를 사용하면 [폴더](#folders), [ZIP 파일](#zipped), 그리고 [임베디드 애플리케이션 리소스](#resources)에서 콘텐츠를 서빙할 수 있습니다.

## 폴더 {id="folders"}

로컬 파일 시스템에서 정적 파일을 서빙하려면 [`staticFiles()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-files.html) 함수를 사용합니다. 이 경우 상대 경로는 현재 작업 디렉터리를 기준으로 해석됩니다.

 ```kotlin
 routing {
     staticFiles("/resources", File("files"))
 }
 ```

위의 예제에서 `/resources`로 들어오는 모든 요청은 현재 작업 디렉터리의 `files` 물리 폴더로 매핑됩니다.
Ktor는 URL 경로와 물리적 파일 이름이 일치하는 한 `files` 내의 모든 파일을 재귀적으로 서빙합니다.

전체 예제는 [static-files](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files)를 참조하세요.

## ZIP 파일 {id="zipped"}

ZIP 파일에서 정적 콘텐츠를 서빙하기 위해 Ktor는 [`staticZip()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-zip.html) 함수를 제공합니다.
이를 통해 아래 예제와 같이 요청을 ZIP 아카이브의 내용으로 직접 매핑할 수 있습니다.

 ```kotlin
 routing {
     staticZip("/", "/", Paths.get("files/text-files.zip"))
 }
 ```

이 예제에서 루트 URL `/`로 들어오는 모든 요청은 `text-files.zip` ZIP 파일의 내용으로 직접 매핑됩니다.

### 자동 재로드 지원 {id="zip-auto-reload"}

`staticZip()` 함수는 자동 재로드(Auto-reloading)도 지원합니다. ZIP 파일의 상위 디렉터리에서 변경 사항이 감지되면, 다음 요청 시 ZIP 파일 시스템이 다시 로드됩니다. 이를 통해 서버를 재시작하지 않고도 서빙되는 콘텐츠를 최신 상태로 유지할 수 있습니다.

전체 예제는 [static-zip](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip)을 참조하세요.

## 리소스 {id="resources"}

클래스패스(classpath)에서 콘텐츠를 서빙하려면 [`staticResources()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-resources.html) 함수를 사용합니다.

```kotlin
routing {
    staticResources("/resources", "static")
}
```

이 코드는 `/resources`로 들어오는 모든 요청을 애플리케이션 리소스의 `static` 패키지로 매핑합니다.
이 경우 Ktor는 URL 경로와 리소스 경로가 일치하는 한 `static` 패키지의 모든 파일을 재귀적으로 서빙합니다.

전체 예제는 [static-resources](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources)를 참조하세요.

## 추가 구성 {id="configuration"}

Ktor는 정적 파일 및 리소스에 대해 더 많은 구성 옵션을 제공합니다.

### 인덱스 파일 {id="index"}

이름이 `index.html`인 파일이 있는 경우, 디렉터리가 요청되었을 때 Ktor는 기본적으로 이 파일을 서빙합니다. `index` 파라미터를 사용하여 사용자 정의 인덱스 파일을 설정할 수 있습니다.

```kotlin
staticResources("/custom", "static", index = "custom_index.html")
```

이 경우 `/custom`이 요청되면 Ktor는 `/custom_index.html`을 서빙합니다.

### 사전 압축된 파일 {id="precompressed"}

Ktor는 [Compression](server-compression.md) 플러그인을 사용하여 응답을 동적으로 압축하는 대신, 사전 압축된(pre-compressed) 정적 파일을 서빙할 수 있습니다.

이 기능을 활성화하려면 `preCompressed()` 함수를 사용하고 지원되는 압축 형식을 지정하세요.

```kotlin
staticFiles("/", File("files")) {
    preCompressed(
        CompressedFileType.BROTLI,
        CompressedFileType.GZIP,
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

클라이언트가 정적 파일을 요청하면 Ktor는 클라이언트가 지원하는 콘텐츠 인코딩을 확인하고 사용 가능한 경우 일치하는 사전 압축 버전을 서빙합니다.

예를 들어 `/js/script.js`에 대한 요청이 발생하면, Ktor는 `/js/script.js.br` 또는 `/js/script.js.gz`와 같은 사전 압축된 변형 파일을 서빙할 수 있습니다.

### HEAD 요청 {id="autohead"}

`enableAutoHeadResponse()` 함수를 사용하면 `GET`이 정의된 정적 라우트 내부의 모든 경로에 대해 `HEAD` 요청에 자동으로 응답할 수 있습니다.

```kotlin
staticResources("/", "static"){
    enableAutoHeadResponse()
}
```

### 기본 파일 응답 {id="default-file"}

`default()` 함수는 정적 라우트 내부에서 해당 파일이 없는 요청에 대해 특정 파일로 응답하는 기능을 제공합니다.

```kotlin
staticFiles("/", File("files")) {
    default("index.html")
}
```

이 예제에서 클라이언트가 존재하지 않는 리소스를 요청하면, `index.html` 파일이 응답으로 서빙됩니다.

### 콘텐츠 타입 {id="content-type"}

기본적으로 Ktor는 파일 확장자로부터 `Content-Type` 헤더 값을 추측하려고 시도합니다. `contentType()` 함수를 사용하여 `Content-Type` 헤더를 명시적으로 설정할 수 있습니다.

```kotlin
staticFiles("/files", File("textFiles")) {
    contentType { file ->
        when (file.name) {
            "html-file.txt" -> ContentType.Text.Html
            else -> null
        }
    }
}
```

이 예제에서 `html-file.txt` 파일에 대한 응답은 `Content-Type: text/html` 헤더를 가지며, 그 외의 다른 모든 파일에는 기본 동작이 적용됩니다.

### 캐싱 {id="caching"}

`cacheControl()` 함수를 사용하면 HTTP 캐싱을 위한 `Cache-Control` 헤더를 구성할 수 있습니다.

```kotlin
fun Application.module() {
    routing {
        staticFiles("/files", File("textFiles")) {
            cacheControl { file ->
                when (file.name) {
                    "file.txt" -> listOf(Immutable, CacheControl.MaxAge(10000))
                    else -> emptyList()
                }
            }
        }
    }
}
object Immutable : CacheControl(null) {
    override fun toString(): String = "immutable"
}
```

[`ConditionalHeaders`](server-conditional-headers.md) 플러그인이 설치되어 있으면, Ktor는 `ETag` 및 `LastModified` 헤더와 함께 정적 리소스를 서빙할 수 있으며, 마지막 요청 이후 콘텐츠가 변경되지 않은 경우 본문 전송을 피하기 위해 조건부 헤더를 처리할 수 있습니다.

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

이 예제에서 `etag` 및 `lastModified` 값은 각 리소스를 기반으로 동적으로 계산되어 응답에 적용됩니다.

`ETag` 생성을 단순화하기 위해 미리 정의된 프로바이더를 사용할 수도 있습니다.

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

이 예제에서는 리소스 콘텐츠의 SHA‑256 해시를 사용하여 강력한(strong) `ETag`가 생성됩니다.
I/O 오류가 발생하면 `ETag`가 생성되지 않습니다.

> Ktor의 캐싱에 대한 자세한 내용은 [Caching headers](server-caching-headers.md)를 참조하세요.
>
{style="tip"}

### 제외된 파일 {id="exclude"}

`exclude()` 함수를 사용하면 특정 파일이 서빙되지 않도록 제외할 수 있습니다. 클라이언트가 제외된 파일을 요청하면 서버는 `403 Forbidden` 상태 코드로 응답합니다.

```kotlin
staticFiles("/files", File("textFiles")) {
    exclude { file -> file.path.contains("excluded") }
}
```

### 파일 확장자 폴백 {id="extensions"}

요청된 파일을 찾을 수 없는 경우, Ktor는 파일 이름에 지정된 확장자를 추가하여 다시 검색할 수 있습니다.

```kotlin
staticResources("/", "static"){
    extensions("html", "htm")
}
```

이 예제에서 `/index`가 요청되면 Ktor는 `/index.html`을 검색하고 찾은 콘텐츠를 서빙합니다.

### 사용자 정의 폴백 {id="custom-fallback"}

요청된 정적 리소스를 찾을 수 없을 때 사용자 정의 폴백 동작을 구성하려면 `fallback()` 함수를 사용하세요.
`fallback()`을 사용하면 요청된 경로를 검사하고 응답 방법을 결정할 수 있습니다. 예를 들어 다른 리소스로 리다이렉트하거나, 특정 HTTP 상태를 반환하거나, 대체 파일을 서빙할 수 있습니다.

`fallback()`은 `staticFiles()`, `staticResources()`, `staticZip()` 또는 `staticFileSystem()` 내부에 추가할 수 있습니다. 콜백은 요청된 경로와 현재의 `ApplicationCall`을 제공합니다.

아래 예제는 특정 확장자를 리다이렉트하거나, 사용자 정의 상태를 반환하거나, `index.html`로 폴백하는 방법을 보여줍니다.

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 절대 경로
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 상대 경로
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 사용자 정의 수정 {id="modify"}

`modify()` 함수를 사용하면 최종 응답에 사용자 정의 수정을 적용할 수 있습니다.

```kotlin
staticFiles("/", File("files")) {
    modify { file, call ->
        call.response.headers.append(HttpHeaders.ETag, file.name.toString())
    }
}
```

## 에러 처리 {id="errors"}

요청된 콘텐츠를 찾을 수 없는 경우, Ktor는 자동으로 `404 Not Found` HTTP 상태 코드로 응답합니다.

에러 처리를 구성하는 방법을 알아보려면 [Status Pages](server-status-pages.md)를 참조하세요.