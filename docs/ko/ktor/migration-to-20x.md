[//]: # (title: 1.6.x에서 2.0.x로 마이그레이션)

<show-structure for="chapter" depth="2"/>

이 가이드는 Ktor 애플리케이션을 1.6.x 버전에서 2.0.x 버전으로 마이그레이션하는 방법에 대한 지침을 제공합니다.

## Ktor Server {id="server"}
### 서버 코드가 'io.ktor.server.*' 패키지로 이동되었습니다 {id="server-package"}
서버와 클라이언트 API를 통합하고 보다 명확히 구분하기 위해, 서버 코드가 `io.ktor.server.*` 패키지로 이동되었습니다 ([KTOR-2865](https://youtrack.jetbrains.com/issue/KTOR-2865)).
따라서 아래와 같이 애플리케이션의 [의존성](#server-package-dependencies) 및 [import](#server-package-imports) 문을 업데이트해야 합니다.

#### 의존성 {id="server-package-dependencies"}
| 서브시스템                                           |               1.6.x               |                                                                                2.0.0 |
|:----------------------------------------------------|:---------------------------------:|-------------------------------------------------------------------------------------:|
| [Locations](https://ktor.io/docs/server-locations.html)                    |     `io.ktor:ktor-locations`      |                                                      `io.ktor:ktor-server-locations` |
| [Webjars](server-webjars.md)                        |      `io.ktor:ktor-webjars`       |                                                        `io.ktor:ktor-server-webjars` |
| [AutoHeadResponse](server-autoheadresponse.md)      |    `io.ktor:ktor-server-core`     |                                             `io.ktor:ktor-server-auto-head-response` |
| [StatusPages](server-status-pages.md)               |    `io.ktor:ktor-server-core`     |                                                   `io.ktor:ktor-server-status-pages` |
| [CallId](server-call-id.md)                         |    `io.ktor:ktor-server-core`     |                                                        `io.ktor:ktor-server-call-id` |
| [DoubleReceive](server-double-receive.md)           |    `io.ktor:ktor-server-core`     |                                                 `io.ktor:ktor-server-double-receive` |
| [HTML DSL](server-html-dsl.md)                      |    `io.ktor:ktor-html-builder`    |                                                   `io.ktor:ktor-server-html-builder` |
| [FreeMarker](server-freemarker.md)                  |     `io.ktor:ktor-freemarker`     |                                                     `io.ktor:ktor-server-freemarker` |
| [Velocity](server-velocity.md)                      |      `io.ktor:ktor-velocity`      |                                                       `io.ktor:ktor-server-velocity` |
| [Mustache](server-mustache.md)                      |      `io.ktor:ktor-mustache`      |                                                       `io.ktor:ktor-server-mustache` |
| [Thymeleaf](server-thymeleaf.md)                    |     `io.ktor:ktor-thymeleaf`      |                                                      `io.ktor:ktor-server-thymeleaf` |
| [Pebble](server-pebble.md)                          |       `io.ktor:ktor-pebble`       |                                                         `io.ktor:ktor-server-pebble` |
| [kotlinx.serialization](server-serialization.md)    |   `io.ktor:ktor-serialization`    | `io.ktor:ktor-server-content-negotiation`, `io.ktor:ktor-serialization-kotlinx-json` |
| [Gson](server-serialization.md)                     |        `io.ktor:ktor-gson`        |         `io.ktor:ktor-server-content-negotiation`, `io.ktor:ktor-serialization-gson` |
| [Jackson](server-serialization.md)                  |      `io.ktor:ktor-jackson`       |      `io.ktor:ktor-server-content-negotiation`, `io.ktor:ktor-serialization-jackson` |
| [Authentication](server-auth.md)                    |        `io.ktor:ktor-auth`        |                                                           `io.ktor:ktor-server-auth` |
| [JWT authentication](server-jwt.md)                 |      `io.ktor:ktor-auth-jwt`      |                                                       `io.ktor:ktor-server-auth-jwt` |
| [LDAP authentication](server-ldap.md)               |     `io.ktor:ktor-auth-ldap`      |                                                      `io.ktor:ktor-server-auth-ldap` |
| [DataConversion](server-data-conversion.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-data-conversion` |
| [DefaultHeaders](server-default-headers.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-default-headers` |
| [Compression](server-compression.md)                |    `io.ktor:ktor-server-core`     |                                                    `io.ktor:ktor-server-compression` |
| [CachingHeaders](server-caching-headers.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-caching-headers` |
| [ConditionalHeaders](server-conditional-headers.md) |    `io.ktor:ktor-server-core`     |                                            `io.ktor:ktor-server-conditional-headers` |
| [CORS](server-cors.md)                              |    `io.ktor:ktor-server-core`     |                                                           `io.ktor:ktor-server-cors` |
| [Forwarded headers](server-forward-headers.md)      |    `io.ktor:ktor-server-core`     |                                               `io.ktor:ktor-server-forwarded-header` |
| [HSTS](server-hsts.md)                              |    `io.ktor:ktor-server-core`     |                                                           `io.ktor:ktor-server-hsts` |
| [HttpsRedirect](server-https-redirect.md)           |    `io.ktor:ktor-server-core`     |                                                  `io.ktor:ktor-server-http-redirect` |
| [PartialContent](server-partial-content.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-partial-content` |
| [WebSockets](server-websockets.md)                  |     `io.ktor:ktor-websockets`     |                                                     `io.ktor:ktor-server-websockets` |
| [CallLogging](server-call-logging.md)               |    `io.ktor:ktor-server-core`     |                                                   `io.ktor:ktor-server-call-logging` |
| [Micrometer metric](server-metrics-micrometer.md)   | `io.ktor:ktor-metrics-micrometer` |                                             `io.ktor:ktor-server-metrics-micrometer` |
| [Dropwizard metrics](server-metrics-dropwizard.md)    |      `io.ktor:ktor-metrics`       |                                                        `io.ktor:ktor-server-metrics` |
| [Sessions](server-sessions.md)                      |      `io.ktor:ktor-server-core`   |                                        `io.ktor:ktor-server-sessions` |

> 모든 플러그인을 한 번에 추가하려면 `io.ktor:ktor-server` 아티팩트를 사용할 수 있습니다.

#### Imports {id="server-package-imports"}
| 서브시스템                                           |                 1.6.x                 |                                                2.0.0 |
|:----------------------------------------------------|:-------------------------------------:|-----------------------------------------------------:|
| [Application](server-create-and-configure.topic)    |    `import io.ktor.application.*`     |                `import io.ktor.server.application.*` |
| [Configuration](server-configuration-file.topic)    |       `import io.ktor.config.*`       |                     `import io.ktor.server.config.*` |
| [Routing](server-routing.md)                        |      `import io.ktor.routing.*`       |                    `import io.ktor.server.routing.*` |
| [AutoHeadResponse](server-autoheadresponse.md)      |      `import io.ktor.features.*`      |           `import io.ktor.server.plugins.autohead.*` |
| [StatusPages](server-status-pages.md)               |      `import io.ktor.features.*`      |        `import io.ktor.server.plugins.statuspages.*` |
| [CallId](server-call-id.md)                         |      `import io.ktor.features.*`      |             `import io.ktor.server.plugins.callid.*` |
| [DoubleReceive](server-double-receive.md)           |      `import io.ktor.features.*`      |      `import io.ktor.server.plugins.doublereceive.*` |
| [Requests](server-requests.md)                      |      `import io.ktor.request.*`       |                    `import io.ktor.server.request.*` |
| [Responses](server-responses.md)                    |      `import io.ktor.response.*`      |                   `import io.ktor.server.response.*` |
| [Plugins](#feature-plugin)                          |      `import io.ktor.features.*`      |                    `import io.ktor.server.plugins.*` |
| [Locations](https://ktor.io/docs/server-locations.html)                    |     `import io.ktor.locations.*`      |                  `import io.ktor.server.locations.*` |
| [Static content](server-static-content.md)          |    `import io.ktor.http.content.*`    |               `import io.ktor.server.http.content.*` |
| [HTML DSL](server-html-dsl.md)                      |        `import io.ktor.html.*`        |                       `import io.ktor.server.html.*` |
| [FreeMarker](server-freemarker.md)                  |     `import io.ktor.freemarker.*`     |                 `import io.ktor.server.freemarker.*` |
| [Velocity](server-velocity.md)                      |      `import io.ktor.velocity.*`      |                   `import io.ktor.server.velocity.*` |
| [Mustache](server-mustache.md)                      |      `import io.ktor.mustache.*`      |                   `import io.ktor.server.mustache.*` |
| [Thymeleaf](server-thymeleaf.md)                    |     `import io.ktor.thymeleaf.*`      |                  `import io.ktor.server.thymeleaf.*` |
| [Pebble](server-pebble.md)                          |       `import io.ktor.pebble.*`       |                     `import io.ktor.server.pebble.*` |
| [ContentNegotiation](server-serialization.md)       |      `import io.ktor.features.*`      | `import io.ktor.server.plugins.contentnegotiation.*` |
| [kotlinx.serialization](server-serialization.md)    |   `import io.ktor.serialization.*`    |        `import io.ktor.serialization.kotlinx.json.*` |
| [Gson](server-serialization.md)                     |        `import io.ktor.gson.*`        |                `import io.ktor.serialization.gson.*` |
| [Jackson](server-serialization.md)                  |      `import io.ktor.jackson.*`       |             `import io.ktor.serialization.jackson.*` |
| [Authentication](server-auth.md)                    |        `import io.ktor.auth.*`        |                       `import io.ktor.server.auth.*` |
| [JWT authentication](server-jwt.md)                 |      `import io.ktor.auth.jwt.*`      |                   `import io.ktor.server.auth.jwt.*` |
| [LDAP authentication](server-ldap.md)               |     `import io.ktor.auth.ldap.*`      |                  `import io.ktor.server.auth.ldap.*` |
| [Sessions](server-sessions.md)                      |      `import io.ktor.sessions.*`      |                   `import io.ktor.server.sessions.*` |
| [DefaultHeaders](server-default-headers.md)         |      `import io.ktor.features.*`      |     `import io.ktor.server.plugins.defaultheaders.*` |
| [Compression](server-compression.md)                |      `import io.ktor.features.*`      |        `import io.ktor.server.plugins.compression.*` |
| [CachingHeaders](server-caching-headers.md)         |      `import io.ktor.features.*`      |     `import io.ktor.server.plugins.cachingheaders.*` |
| [ConditionalHeaders](server-conditional-headers.md) |      `import io.ktor.features.*`      | `import io.ktor.server.plugins.conditionalheaders.*` |
| [CORS](server-cors.md)                              |      `import io.ktor.features.*`      |               `import io.ktor.server.plugins.cors.*` |
| [Forwarded headers](server-forward-headers.md)      |      `import io.ktor.features.*`      |   `import io.ktor.server.plugins.forwardedheaders.*` |
| [HSTS](server-hsts.md)                              |      `import io.ktor.features.*`      |               `import io.ktor.server.plugins.hsts.*` |
| [HttpsRedirect](server-https-redirect.md)           |      `import io.ktor.features.*`      |      `import io.ktor.server.plugins.httpsredirect.*` |
| [PartialContent](server-partial-content.md)         |      `import io.ktor.features.*`      |     `import io.ktor.server.plugins.partialcontent.*` |
| [WebSockets](server-websockets.md)                  |     `import io.ktor.websocket.*`      |                  `import io.ktor.server.websocket.*` |
| [CallLogging](server-call-logging.md)               |      `import io.ktor.features.*`      |         `import io.ktor.server.plugins.callloging.*` |
| [Micrometer metric](server-metrics-micrometer.md)   | `import io.ktor.metrics.micrometer.*` |         `import io.ktor.server.metrics.micrometer.*` |
| [Dropwizard metrics](server-metrics-dropwizard.md)    | `import io.ktor.metrics.dropwizard.*` |         `import io.ktor.server.metrics.dropwizard.*` |

### WebSockets 코드가 'websockets' 패키지로 이동되었습니다 {id="server-ws-package"}

WebSockets 코드가 `http-cio`에서 `websockets` 패키지로 이동되었습니다. 이에 따라 다음과 같이 import 문을 업데이트해야 합니다:

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

이 변경 사항은 [클라이언트](#client-ws-package)에도 영향을 미칩니다.

### Feature가 Plugin으로 이름 변경되었습니다 {id="feature-plugin"}

Ktor 2.0.0에서는 요청/응답 파이프라인을 가로채는 기능을 더 잘 설명하기 위해 _Feature_의 명칭이 _[Plugin](server-plugins.md)_으로 변경되었습니다 ([KTOR-2326](https://youtrack.jetbrains.com/issue/KTOR-2326)).
이 변경 사항은 전체 Ktor API에 영향을 미치므로 아래에 설명된 대로 애플리케이션을 업데이트해야 합니다.

#### Imports {id="feature-plugin-imports"}
[플러그인 설치](server-plugins.md#install) 시 import 문의 업데이트가 필요하며, [서버 코드가 이동](#server-package-imports)된 `io.ktor.server.*` 패키지의 영향도 받습니다:

| 1.6.x                       |                             2.0.0 |
|:----------------------------|----------------------------------:|
| `import io.ktor.features.*` | `import io.ktor.server.plugins.*` |

#### 커스텀 플러그인 {id="feature-plugin-custom"}

Feature에서 Plugin으로의 명칭 변경으로 인해 [커스텀 플러그인](server-custom-plugins-base-api.md) 관련 API에 다음과 같은 변경 사항이 적용됩니다:
* `ApplicationFeature` 인터페이스가 `BaseApplicationPlugin`으로 이름이 변경되었습니다.
* `Features` [파이프라인 단계(pipeline phase)](server-custom-plugins-base-api.md#pipelines)가 `Plugins`로 이름이 변경되었습니다.

> v2.0.0부터 Ktor는 [커스텀 플러그인을 생성](server-custom-plugins.md)하기 위한 새로운 API를 제공합니다. 일반적으로 이 새로운 API는 파이프라인, 단계(phases) 등과 같은 내부 Ktor 개념을 이해할 필요가 없습니다. 대신 `onCall`, `onCallReceive`, `onCallRespond` 등 다양한 핸들러를 사용하여 요청 및 응답 처리의 여러 단계에 접근할 수 있습니다. 파이프라인 단계가 새 API 핸들러에 매핑되는 방식은 다음 섹션에서 확인할 수 있습니다: [파이프라인 단계와 새 API 핸들러의 매핑](server-custom-plugins-base-api.md#mapping).

### 콘텐츠 협상 및 직렬화 {id="serialization"}

서버와 클라이언트 간에 직렬화 라이브러리를 재사용할 수 있도록 [콘텐츠 협상 및 직렬화(Content negotiation and serialization)](server-serialization.md) 서버 API가 리팩터링되었습니다.
주요 변경 사항은 다음과 같습니다:
* `ContentNegotiation`이 `ktor-server-core`에서 별도의 `ktor-server-content-negotiation` 아티팩트로 이동되었습니다.
* 직렬화 라이브러리가 `ktor-*`에서 클라이언트에서도 공유되는 `ktor-serialization-*` 아티팩트로 이동되었습니다.

아래 표시된 대로 애플리케이션의 [의존성](#dependencies-serialization)과 [import](#imports-serialization) 문을 업데이트해야 합니다.

#### 의존성 {id="dependencies-serialization"}

| 서브시스템                                 |            1.6.x             |                                     2.0.0 |
|:------------------------------------------|:----------------------------:|------------------------------------------:|
| [ContentNegotiation](server-serialization.md)    |  `io.ktor:ktor-server-core`  | `io.ktor:ktor-server-content-negotiation` |
| [kotlinx.serialization](server-serialization.md) | `io.ktor:ktor-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| [Gson](server-serialization.md)                  |     `io.ktor:ktor-gson`      |         `io.ktor:ktor-serialization-gson` |
| [Jackson](server-serialization.md)               |    `io.ktor:ktor-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### Imports {id="imports-serialization"}
| 서브시스템                                 |              1.6.x               |                                         2.0.0 |
|:------------------------------------------|:--------------------------------:|----------------------------------------------:|
| [kotlinx.serialization](server-serialization.md) | `import io.ktor.serialization.*` | `import io.ktor.serialization.kotlinx.json.*` |
| [Gson](server-serialization.md)                  |     `import io.ktor.gson.*`      |         `import io.ktor.serialization.gson.*` |
| [Jackson](server-serialization.md)               |    `import io.ktor.jackson.*`    |      `import io.ktor.serialization.jackson.*` |

#### 커스텀 컨버터 {id="serialization-custom-converter"}

[ContentConverter](server-serialization.md#implement_custom_serializer) 인터페이스가 제공하는 함수 시그니처가 다음과 같이 변경되었습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
interface ContentConverter {
    suspend fun convertForSend(context: PipelineContext<Any, ApplicationCall>, contentType: ContentType, value: Any): Any?
    suspend fun convertForReceive(context: PipelineContext<ApplicationReceiveRequest, ApplicationCall>): Any?
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
interface ContentConverter {
    suspend fun serialize(contentType: ContentType, charset: Charset, typeInfo: TypeInfo, value: Any): OutgoingContent?
    suspend fun deserialize(charset: Charset, typeInfo: TypeInfo, content: ByteReadChannel): Any?
}
```

</TabItem>
</Tabs>

### 테스트 API {id="testing-api"}

v2.0.0부터 Ktor 서버는 [KTOR-971](https://youtrack.jetbrains.com/issue/KTOR-971)에 설명된 다양한 문제를 해결한 새로운 [테스트](server-testing.md) API를 사용합니다. 주요 변경 사항은 다음과 같습니다:
* `withTestApplication`/`withApplication` 함수가 새로운 `testApplication` 함수로 대체되었습니다.
* `testApplication` 함수 내부에서는 기존 [Ktor 클라이언트](client-create-and-configure.md) 인스턴스를 사용하여 서버에 요청을 보내고 결과를 검증해야 합니다.
* 특정 기능(예: 쿠키 또는 WebSockets)을 테스트하려면 새 클라이언트 인스턴스를 생성하고 해당 [플러그인](client-plugins.md)을 설치해야 합니다.

1.6.x 테스트를 2.0.0으로 마이그레이션하는 몇 가지 예를 살펴보겠습니다:

#### 기본 서버 테스트 {id="basic-test"}

아래 테스트에서는 `handleRequest` 함수가 `client.get` 요청으로 대체되었습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
@Test
fun testRootLegacyApi() {
    withTestApplication(Application::module) {
        handleRequest(HttpMethod.Get, "/").apply {
            assertEquals(HttpStatusCode.OK, response.status())
            assertEquals("Hello, world!", response.content)
        }
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
@Test
fun testRoot() = testApplication {
    val response = client.get("/")
    assertEquals(HttpStatusCode.OK, response.status)
    assertEquals("Hello, world!", response.bodyAsText())
}
```

</TabItem>
</Tabs>

#### x-www-form-urlencoded {id="x-www-form-urlencoded"}

아래 테스트에서는 `handleRequest` 함수가 `client.post` 요청으로 대체되었습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
@Test
fun testPostLegacyApi() = withTestApplication(Application::main) {
    with(handleRequest(HttpMethod.Post, "/signup"){
        addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
        setBody(listOf("username" to "JetBrains", "email" to "example@jetbrains.com", "password" to "foobar", "confirmation" to "foobar").formUrlEncode())
    }) {
        assertEquals("The 'JetBrains' account is created", response.content)
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
@Test
fun testPost() = testApplication {
    val response = client.post("/signup") {
        header(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
        setBody(listOf("username" to "JetBrains", "email" to "example@jetbrains.com", "password" to "foobar", "confirmation" to "foobar").formUrlEncode())
    }
    assertEquals("The 'JetBrains' account is created", response.bodyAsText())
}
```

</TabItem>
</Tabs>

#### multipart/form-data {id="multipart-form-data"}

v2.0.0에서 `multipart/form-data`를 구성하려면 클라이언트의 `setBody` 함수에 `MultiPartFormDataContent`를 전달해야 합니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
    @Test
    fun testUploadLegacyApi() = withTestApplication(Application::main) {
        with(handleRequest(HttpMethod.Post, "/upload"){
            val boundary = "WebAppBoundary"
            val fileBytes = File("ktor_logo.png").readBytes()

            addHeader(HttpHeaders.ContentType, ContentType.MultiPart.FormData.withParameter("boundary", boundary).toString())
            setBody(boundary, listOf(
                PartData.FormItem("Ktor logo", { }, headersOf(
                    HttpHeaders.ContentDisposition,
                    ContentDisposition.Inline
                        .withParameter(ContentDisposition.Parameters.Name, "description")
                        .toString()
                )),
                PartData.FileItem({ fileBytes.inputStream().asInput() }, {}, headersOf(
                    HttpHeaders.ContentDisposition,
                    ContentDisposition.File
                        .withParameter(ContentDisposition.Parameters.Name, "image")
                        .withParameter(ContentDisposition.Parameters.FileName, "ktor_logo.png")
                        .toString()
                ))
            ))
        }) {
            assertEquals("Ktor logo is uploaded to 'uploads/ktor_logo.png'", response.content)
        }
    }
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
@Test
fun testUpload() = testApplication {
    val boundary = "WebAppBoundary"
    val response = client.post("/upload") {
        setBody(
            MultiPartFormDataContent(
                formData {
                    append("description", "Ktor logo")
                    append("image", File("ktor_logo.png").readBytes(), Headers.build {
                        append(HttpHeaders.ContentType, "image/png")
                        append(HttpHeaders.ContentDisposition, "filename=\"ktor_logo.png\"")
                    })
                },
                boundary,
                ContentType.MultiPart.FormData.withParameter("boundary", boundary)
            )
        )
    }
    assertEquals("Ktor logo is uploaded to 'uploads/ktor_logo.png'", response.bodyAsText())
}
```

</TabItem>
</Tabs>

#### JSON 데이터 {id="json-data"}

v1.6.x에서는 `kotlinx.serialization` 라이브러리가 제공하는 `Json.encodeToString` 함수를 사용하여 JSON 데이터를 직렬화할 수 있습니다.
v2.0.0에서는 새 클라이언트 인스턴스를 생성하고 특정 형식으로 콘텐츠를 직렬화/역직렬화할 수 있는 [ContentNegotiation](client-serialization.md) 플러그인을 설치해야 합니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
@Test
fun testPostCustomerLegacyApi() = withTestApplication(Application::main) {
    with(handleRequest(HttpMethod.Post, "/customer"){
        addHeader(HttpHeaders.ContentType, ContentType.Application.Json.toString())
        setBody(Json.encodeToString(Customer(3, "Jet", "Brains")))
    }) {
        assertEquals("Customer stored correctly", response.content)
        assertEquals(HttpStatusCode.Created, response.status())
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
@Test
fun testPostCustomer() = testApplication {
    val client = createClient {
        install(ContentNegotiation) {
            json()
        }
    }
    val response = client.post("/customer") {
        contentType(ContentType.Application.Json)
        setBody(Customer(3, "Jet", "Brains"))
    }
    assertEquals("Customer stored correctly", response.bodyAsText())
    assertEquals(HttpStatusCode.Created, response.status)
}
```

</TabItem>
</Tabs>

#### 테스트 중 쿠키 유지 {id="preserving-cookies"}

v1.6.x에서는 테스트 시 요청 간에 쿠키를 유지하기 위해 `cookiesSession`을 사용했습니다. v2.0.0에서는 새 클라이언트 인스턴스를 생성하고 [HttpCookies](client-cookies.md) 플러그인을 설치해야 합니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
    @Test
    fun testRequestsLegacyApi() = withTestApplication(Application::main) {
        fun doRequestAndCheckResponse(path: String, expected: String) {
            handleRequest(HttpMethod.Get, path).apply {
                assertEquals(expected, response.content)
            }
        }

        cookiesSession {
            handleRequest(HttpMethod.Get, "/login") {}.apply {}
            doRequestAndCheckResponse("/user", "Session ID is 123abc. Reload count is 0.")
            doRequestAndCheckResponse("/user", "Session ID is 123abc. Reload count is 1.")
            doRequestAndCheckResponse("/user", "Session ID is 123abc. Reload count is 2.")

            handleRequest(HttpMethod.Get, "/logout").apply {}
            doRequestAndCheckResponse("/user", "Session doesn't exist or is expired.")
        }
    }
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
    @Test
    fun testRequests() = testApplication {
        val client = createClient {
            install(HttpCookies)
        }

        val loginResponse = client.get("/login")
        val response1 = client.get("/user")
        assertEquals("Session ID is 123abc. Reload count is 1.", response1.bodyAsText())
        val response2 = client.get("/user")
        assertEquals("Session ID is 123abc. Reload count is 2.", response2.bodyAsText())
        val response3 = client.get("/user")
        assertEquals("Session ID is 123abc. Reload count is 3.", response3.bodyAsText())
        val logoutResponse = client.get("/logout")
        assertEquals("Session doesn't exist or is expired.", logoutResponse.bodyAsText())
    }
```

</TabItem>
</Tabs>

#### WebSockets {id="testing-ws"}

기존 API에서는 [WebSocket 대화](server-websockets.md)를 테스트하기 위해 `handleWebSocketConversation`을 사용했습니다. v2.0.0에서는 클라이언트가 제공하는 [WebSockets](client-websockets.topic) 플러그인을 사용하여 WebSocket 대화를 테스트할 수 있습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
    @Test
    fun testConversationLegacyApi() {
        withTestApplication(Application::module) {
            handleWebSocketConversation("/echo") { incoming, outgoing ->
                val greetingText = (incoming.receive() as Frame.Text).readText()
                assertEquals("Please enter your name", greetingText)

                outgoing.send(Frame.Text("JetBrains"))
                val responseText = (incoming.receive() as Frame.Text).readText()
                assertEquals("Hi, JetBrains!", responseText)
            }
        }
    }
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
    @Test
    fun testConversation() {
        testApplication {
            val client = createClient {
                install(WebSockets)
            }

            client.webSocket("/echo") {
                val greetingText = (incoming.receive() as? Frame.Text)?.readText() ?: ""
                assertEquals("Please enter your name", greetingText)

                send(Frame.Text("JetBrains"))
                val responseText = (incoming.receive() as Frame.Text).readText()
                assertEquals("Hi, JetBrains!", responseText)
            }
        }
    }
```

</TabItem>
</Tabs>

### DoubleReceive {id="double-receive"}
v2.0.0에서는 [DoubleReceive](server-double-receive.md) 플러그인 설정에 `receiveEntireContent`의 반대 역할을 하는 `cacheRawRequest` 프로퍼티가 도입되었습니다:
- v1.6.x에서는 `receiveEntireContent` 프로퍼티가 기본적으로 `false`로 설정되었습니다.
- v2.0.0에서는 `cacheRawRequest`가 기본적으로 `true`로 설정됩니다. `receiveEntireContent` 프로퍼티는 제거되었습니다.

### Forwarded headers {id="forwarded-headers"}

v2.0.0에서는 `ForwardedHeaderSupport` 및 `XForwardedHeaderSupport` 플러그인의 이름이 각각 [ForwardedHeaders](server-forward-headers.md) 및 `XForwardedHeaders`로 변경되었습니다.

### Caching headers {id="caching-headers"}

캐싱 옵션을 정의하는 데 사용되는 [options](server-caching-headers.md#configure) 함수가 이제 `OutgoingContent` 외에도 람다 인수로 `ApplicationCall`을 전달받습니다: 

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
install(CachingHeaders) {
    options { outgoingContent ->
        // ...
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
install(CachingHeaders) {
    options { call, outgoingContent ->
        // ...
    }
}
```

</TabItem>
</Tabs>

### Conditional headers {id="conditional-headers"}

리소스 버전 목록을 정의하는 데 사용되는 [version](server-conditional-headers.md#configure) 함수가 이제 `OutgoingContent` 외에도 람다 인수로 `ApplicationCall`을 전달받습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
install(ConditionalHeaders) {
    version { outgoingContent ->
        // ... 
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
install(ConditionalHeaders) {
    version { call, outgoingContent ->
        // ... 
    }
}
```

</TabItem>
</Tabs>

### CORS {id="cors"}

[CORS](server-cors.md) 설정에 사용되는 여러 함수의 이름이 변경되었습니다:
- `host` -> `allowHost`
- `header` -> `allowHeader`
- `method` -> `allowMethod`

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
install(CORS) {
    host("0.0.0.0:5000")
    header(HttpHeaders.ContentType)
    method(HttpMethod.Options)
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
install(CORS) {
    allowHost("0.0.0.0:5000")
    allowHeader(HttpHeaders.ContentType)
    allowMethod(HttpMethod.Options)
}
```

</TabItem>
</Tabs>

### MicrometerMetrics {id="micrometer-metrics"}
v1.6.x에서는 HTTP 요청을 모니터링하는 데 사용되는 [Ktor 메트릭](server-metrics-micrometer.md)의 기본 이름(접두사)을 지정하기 위해 `baseName` 프로퍼티를 사용했습니다.
기본값은 `ktor.http.server`였습니다. 
v2.0.0에서는 `baseName`이 `metricName`으로 대체되었으며 기본값은 `ktor.http.server.requests`입니다.

## Ktor Client {id="client"}
### 요청 및 응답 {id="request-response"}

v2.0.0에서는 요청을 전송하고 응답을 수신하는 데 사용되는 API가 더욱 일관되고 직관적으로 업데이트되었습니다 ([KTOR-29](https://youtrack.jetbrains.com/issue/KTOR-29)).

#### 요청 함수 {id="request-overloads"}

매개변수가 여러 개인 [요청 함수](client-requests.md)는 deprecated 처리되었습니다. 예를 들어, `port` 및 `path` 매개변수는 [HttpRequestBuilder](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)에서 제공하는 `url` 매개변수로 교체해야 합니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.get(port = 8080, path = "/customer/3")
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.get { url(port = 8080, path = "/customer/3") }
```

</TabItem>
</Tabs>

또한 `HttpRequestBuilder`를 사용하면 요청 함수 람다 내부에서 추가적인 [요청 매개변수](client-requests.md#parameters)를 지정할 수 있습니다.

#### 요청 본문 {id="request-body"}

[요청 본문(request body)](client-requests.md#body)을 설정하는 데 사용되었던 `HttpRequestBuilder.body` 프로퍼티가 `HttpRequestBuilder.setBody` 함수로 대체되었습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.post("http://localhost:8080/post") {
    body = "Body content"
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.post("http://localhost:8080/post") {
    setBody("Body content")
}
```

</TabItem>
</Tabs>

#### 응답 {id="responses"}
v2.0.0부터 요청 함수(`get`, `post`, `put`, [submitForm](client-requests.md#form_parameters) 등)는 특정 타입의 객체를 수신하기 위한 제네릭 인수를 받지 않습니다.
이제 모든 요청 함수는 `HttpResponse` 객체를 반환하며, 이 객체는 특정 타입의 인스턴스를 받기 위한 제네릭 인수가 있는 `body` 함수를 제공합니다.
또한 `bodyAsText` 또는 `bodyAsChannel`을 사용하여 콘텐츠를 문자열이나 채널 형태로 수신할 수도 있습니다.

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
val httpResponse: HttpResponse = client.get("https://ktor.io/")
val stringBody: String = httpResponse.receive()
val byteArrayBody: ByteArray = httpResponse.receive()
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
val httpResponse: HttpResponse = client.get("https://ktor.io/")
val stringBody: String = httpResponse.body()
val byteArrayBody: ByteArray = httpResponse.body()
```

</TabItem>
</Tabs>

[ContentNegotiation](client-serialization.md) 플러그인이 설치되어 있는 경우 다음과 같이 임의의 객체를 수신할 수 있습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3")
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

</TabItem>
</Tabs>

#### 스트리밍 응답 {id="streaming-response"}
요청 함수에서 [제네릭 인수가 제거](#responses)됨에 따라 스트리밍 응답을 수신하려면 별도의 함수가 필요합니다.
이를 위해 `prepareGet`이나 `preparePost`와 같이 `prepare` 접두사가 붙은 함수가 추가되었습니다:

```kotlin
public suspend fun HttpClient.prepareGet(builder: HttpRequestBuilder): HttpStatement
public suspend fun HttpClient.preparePost(builder: HttpRequestBuilder): HttpStatement
```

아래 예시는 이 경우 코드를 변경하는 방법을 보여줍니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.get<HttpStatement>("https://ktor.io/").execute { httpResponse ->
    val channel: ByteReadChannel = httpResponse.receive()
    while (!channel.isClosedForRead) {
        // Read data
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.prepareGet("https://ktor.io/").execute { httpResponse ->
    val channel: ByteReadChannel = httpResponse.body()
    while (!channel.isClosedForRead) {
        // Read data
    }
}
```

</TabItem>
</Tabs>

전체 예시는 여기에서 확인할 수 있습니다: [스트리밍 데이터](client-responses.md#streaming).

### 응답 유효성 검사 {id="response-validation"}

v2.0.0에서는 [응답 유효성 검사](client-response-validation.md)에 사용되는 `expectSuccess` 프로퍼티가 기본적으로 `false`로 설정됩니다.
이에 따라 코드에서 다음과 같은 변경이 필요합니다:
- [기본 유효성 검사를 활성화](client-response-validation.md#default)하고 2xx가 아닌 응답에 대해 예외를 발생시키려면 `expectSuccess` 프로퍼티를 `true`로 설정하세요.
- `handleResponseExceptionWithRequest`를 사용하여 [2xx가 아닌 예외를 처리](client-response-validation.md#non-2xx)하는 경우에도 `expectSuccess`를 명시적으로 활성화해야 합니다.

#### HttpResponseValidator {id="http-response-validator"}

[handleResponseException](client-response-validation.md#non-2xx) 함수가 예외에 추가 정보를 제공할 수 있도록 `HttpRequest`에 대한 접근을 추가한 `handleResponseExceptionWithRequest`로 대체되었습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
HttpResponseValidator {
    handleResponseException { exception ->
        // ...
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
HttpResponseValidator {
    handleResponseExceptionWithRequest { exception, request ->
        // ...
    }
}
```

</TabItem>
</Tabs>

### 콘텐츠 협상 및 직렬화 {id="serialization-client"}

Ktor 클라이언트는 이제 콘텐츠 협상을 지원하며 Ktor 서버와 직렬화 라이브러리를 공유합니다.
주요 변경 사항은 다음과 같습니다:
* `JsonFeature`는 `ktor-client-content-negotiation` 아티팩트에 위치한 `ContentNegotiation`으로 대체(deprecated)되었습니다.
* 직렬화 라이브러리가 `ktor-client-*`에서 `ktor-serialization-*` 아티팩트로 이동되었습니다.

아래와 같이 클라이언트 코드에서 [의존성](#imports-dependencies-client)과 [import](#imports-serialization-client) 문을 업데이트해야 합니다.

#### 의존성 {id="imports-dependencies-client"}

| 서브시스템             |                1.6.x                |                                     2.0.0 |
|:----------------------|:-----------------------------------:|------------------------------------------:|
| `ContentNegotiation`  |                 n/a                 | `io.ktor:ktor-client-content-negotiation` |
| kotlinx.serialization | `io.ktor:ktor-client-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| Gson                  |     `io.ktor:ktor-client-gson`      |         `io.ktor:ktor-serialization-gson` |
| Jackson               |    `io.ktor:ktor-client-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### Imports {id="imports-serialization-client"}
| 서브시스템             |                  1.6.x                  |                                                2.0.0 |
|:----------------------|:---------------------------------------:|-----------------------------------------------------:|
| `ContentNegotiation`  |                   n/a                   | `import io.ktor.client.plugins.contentnegotiation.*` |
| kotlinx.serialization | `import io.ktor.client.features.json.*` |        `import io.ktor.serialization.kotlinx.json.*` |
| Gson                  | `import io.ktor.client.features.json.*` |                `import io.ktor.serialization.gson.*` |
| Jackson               | `import io.ktor.client.features.json.*` |             `import io.ktor.serialization.jackson.*` |

### Bearer 인증 {id="bearer-authentication"}

[refreshTokens](client-bearer-auth.md) 함수는 이제 `HttpResponse` 람다 인수(`it`) 대신 `RefreshTokenParams` 인스턴스를 [람다 수신 객체(lambda receiver)](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)(`this`)로 사용합니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
bearer {
    refreshTokens {  // it: HttpResponse
        // ...
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
bearer {
    refreshTokens { // this: RefreshTokenParams
        // ...
    }
}
```

</TabItem>
</Tabs>

`RefreshTokenParams`는 다음 프로퍼티를 제공합니다:
* 응답 매개변수에 접근하기 위한 `response`
* 토큰을 갱신하기 위해 요청을 전송하는 `client`
* `loadTokens`를 사용하여 얻은 토큰에 접근하기 위한 `oldTokens`

### HttpSend {id="http-send"}

[HttpSend](client-http-send.md) 플러그인의 API가 다음과 같이 변경되었습니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client[HttpSend].intercept { originalCall, request ->
    if (originalCall.something()) {
        val newCall = execute(request)
        // ...
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.plugin(HttpSend).intercept { request ->
    val originalCall = execute(request)
    if (originalCall.something()) {
        val newCall = execute(request)
        // ...
    }
}
```

</TabItem>
</Tabs>

v2.0.0부터 플러그인에 접근할 때 인덱스 접근 방식을 사용할 수 없습니다. 대신 [HttpClient.plugin](#client-get) 함수를 사용하세요.

### HttpClient.get(plugin: HttpClientPlugin) 함수가 제거되었습니다 {id="client-get"}

2.0.0 버전부터 클라이언트 플러그인을 인수로 받는 `HttpClient.get` 함수가 제거되었습니다. 대신 `HttpClient.plugin` 함수를 사용하세요.

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.get(HttpSend).intercept { ... }
// or
client[HttpSend].intercept { ... }
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.plugin(HttpSend).intercept { ... }
```

</TabItem>
</Tabs>

### Feature가 Plugin으로 이름 변경되었습니다 {id="feature-plugin-client"}

Ktor 서버와 마찬가지로 클라이언트 API에서도 _Feature_가 _Plugin_으로 이름이 변경되었습니다.
이로 인해 아래 설명된 바와 같이 애플리케이션에 영향을 미칠 수 있습니다.

#### Imports {id="feature-plugin-imports-client"}
[플러그인 설치](client-plugins.md#install)를 위한 import 문을 업데이트하세요:

<table>

<tr>
<td>서브시스템</td>
<td>1.6.x</td>
<td>2.0.0</td>
</tr>

<tr>
<td>
<list>
<li>
<Links href="client-default-request.md" summary="The DefaultRequest plugin allows you to configure default parameters for all requests.">Default request</Links>
</li>
<li>
<Links href="client-user-agent.md" summary="">User agent</Links>
</li>
<li>
<Links href="client-text-and-charsets.md" summary="">Charsets</Links>
</li>
<li>
<Links href="client-response-validation.md" summary="Learn how to validate a response depending on its status code.">Response validation</Links>
</li>
<li>
<Links href="client-timeout.md" summary="Code example: %example_name%">Timeout</Links>
</li>
<li>
<Links href="client-caching.md" summary="The HttpCache plugin allows you to save previously fetched resources in an in-memory or persistent cache.">HttpCache</Links>
</li>
<li>
<Links href="client-http-send.md" summary="Code example: %example_name%">HttpSend</Links>
</li>
</list>
</td>
<td><code>import io.ktor.client.features.&#42;</code></td>
<td><code>import io.ktor.client.plugins.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-auth.md" summary="The Auth plugin handles authentication and authorization in your client application.">Authentication</Links></td>
<td>
<code>
import io.ktor.client.features.auth.&#42;
</code>
<code>
import io.ktor.client.features.auth.providers.&#42;
</code>
</td>
<td>
<code>
import io.ktor.client.plugins.auth.&#42;
</code>
<code>
import io.ktor.client.plugins.auth.providers.&#42;
</code>
</td>
</tr>

<tr>
<td><Links href="client-cookies.md" summary="The HttpCookies plugin handles cookies automatically and keep them between calls in a storage.">Cookies</Links></td>
<td><code>import io.ktor.client.features.cookies.&#42;</code></td>
<td><code>import io.ktor.client.plugins.cookies.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-logging.md" summary="Required dependencies: io.ktor:ktor-client-logging Code example: %example_name%">Logging</Links></td>
<td><code>import io.ktor.client.features.logging.&#42;</code></td>
<td><code>import io.ktor.client.plugins.logging.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-websockets.topic" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">WebSockets</Links></td>
<td><code>import io.ktor.client.features.websocket.&#42;</code></td>
<td><code>import io.ktor.client.plugins.websocket.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-content-encoding.md" summary="The ContentEncoding plugin allows you to enable specified compression algorithms (such as 'gzip' and 'deflate') and configure their settings.">Content encoding</Links></td>
<td><code>import io.ktor.client.features.compression.&#42;</code></td>
<td><code>import io.ktor.client.plugins.compression.&#42;</code></td>
</tr>

</table>

#### 커스텀 플러그인 {id="feature-plugin-custom-client"}
`HttpClientFeature` 인터페이스가 `HttpClientPlugin`으로 이름이 변경되었습니다.

### Native 타깃을 위한 새로운 메모리 모델 {id="new-mm"}

v2.0.0부터 [Native](client-engines.md#native) 타깃에서 Ktor 클라이언트를 사용하려면 새로운 Kotlin/Native 메모리 모델을 활성화해야 합니다: [새로운 MM 활성화](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md#enable-the-new-mm).

> v2.2.0부터는 새로운 Kotlin/Native 메모리 모델이 [기본적으로 활성화](migration-to-22x.md#new-mm)됩니다.

### 'Ios' 엔진이 'Darwin'으로 이름 변경되었습니다 {id="darwin"}

`Ios` [엔진](client-engines.md)이 iOS뿐만 아니라 macOS, tvOS를 포함한 다른 운영 체제도 타깃으로 삼는 점을 고려하여, v2.0.0에서는 `Darwin`으로 이름이 변경되었습니다. 이로 인해 다음과 같은 변경 사항이 발생합니다:
* `io.ktor:ktor-client-ios` 아티팩트의 이름이 `io.ktor:ktor-client-darwin`으로 변경되었습니다.
* `HttpClient` 인스턴스를 생성할 때 `Darwin` 클래스를 인수로 전달해야 합니다.
* `IosClientEngineConfig` 설정 클래스의 이름이 `DarwinClientEngineConfig`로 변경되었습니다.

`Darwin` 엔진을 설정하는 방법은 [Darwin](client-engines.md#darwin) 섹션을 참조하세요.

### WebSockets 코드가 'websockets' 패키지로 이동되었습니다 {id="client-ws-package"}

WebSockets 코드가 `http-cio`에서 `websockets` 패키지로 이동되었습니다. 이에 따라 다음과 같이 import 문을 업데이트해야 합니다:

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

### 기본 요청 (Default request) {id="default-request"}

[DefaultRequest](client-default-request.md) 플러그인은 `HttpRequestBuilder` 대신 `DefaultRequestBuilder` 설정 클래스를 사용합니다:

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
val client = HttpClient(CIO) {
    defaultRequest {
        // this: HttpRequestBuilder
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
val client = HttpClient(CIO) {
    defaultRequest {
        // this: DefaultRequestBuilder
    }
}
```

</TabItem>
</Tabs>