[//]: # (title: 從 1.6.x 遷移至 2.0.x)

<show-structure for="chapter" depth="2"/>

本指南提供了如何將您的 Ktor 應用程式從 1.6.x 版本遷移至 2.0.x 的說明。

## Ktor 伺服器 {id="server"}
### 伺服器程式碼已移至 'io.ktor.server.*' 套件 {id="server-package"}
為了統一並更好地將伺服器與用戶端 API 區隔開來，伺服器程式碼已移至 `io.ktor.server.*` 套件（[KTOR-2865](https://youtrack.jetbrains.com/issue/KTOR-2865)）。
這意味著您需要更新應用程式中的[相依性](#server-package-dependencies)以及[匯入](#server-package-imports)，如下所示。

#### 相依性 {id="server-package-dependencies"}
| 子系統                                               |               1.6.x               |                                                                                2.0.0 |
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

> 若要一次新增所有外掛程式，可以使用 `io.ktor:ktor-server` 構件。

#### 匯入 {id="server-package-imports"}
| 子系統                                               |                 1.6.x                 |                                                2.0.0 |
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

### WebSockets 程式碼已移至 'websockets' 套件 {id="server-ws-package"}

WebSockets 程式碼已從 `http-cio` 移至 `websockets` 套件。這需要按照以下方式更新匯入：

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

請注意，此變更也會影響[用戶端](#client-ws-package)。

### Feature 重新命名為 Plugin {id="feature-plugin"}

在 Ktor 2.0.0 中，_Feature_ 已重新命名為 _[Plugin](server-plugins.md)_，以更貼切地描述攔截請求/回應管線的功能（[KTOR-2326](https://youtrack.jetbrains.com/issue/KTOR-2326)）。
這會影響整個 Ktor API，並且需要按照以下說明更新您的應用程式。

#### 匯入 {id="feature-plugin-imports"}
[安裝任何外掛程式](server-plugins.md#install)都需要更新匯入，並且還取決於[將伺服器程式碼移至](#server-package-imports) `io.ktor.server.*` 套件：

| 1.6.x                       |                             2.0.0 |
|:----------------------------|----------------------------------:|
| `import io.ktor.features.*` | `import io.ktor.server.plugins.*` |

#### 自訂外掛程式 {id="feature-plugin-custom"}

將 Feature 重新命名為 Plugin 為與[自訂外掛程式](server-custom-plugins-base-api.md)相關的 API 帶來了以下變更：
* `ApplicationFeature` 介面重新命名為 `BaseApplicationPlugin`。
* `Features` [管線階段](server-custom-plugins-base-api.md#pipelines)重新命名為 `Plugins`。

> 請注意，從 v2.0.0 開始，Ktor 提供了用於[建立自訂外掛程式](server-custom-plugins.md)的新 API。一般而言，此 API 不需要理解 Ktor 內部概念（例如管線、階段等）。相反地，您可以透過各種處理常式（例如 `onCall`、`onCallReceive`、`onCallRespond` 等）存取處理請求和回應的不同階段。您可以從此章節了解管線階段如何對應到新 API 處理常式：[管線階段對應至新 API 處理常式](server-custom-plugins-base-api.md#mapping)。

### 內容協商與序列化 {id="serialization"}

[內容協商與序列化](server-serialization.md)的伺服器 API 經過重構，以便在伺服器和用戶端之間重用序列化程式庫。
主要變更包括：
* `ContentNegotiation` 已從 `ktor-server-core` 移至獨立的 `ktor-server-content-negotiation` 構件中。
* 序列化程式庫已從 `ktor-*` 移至用戶端也同樣使用的 `ktor-serialization-*` 構件中。

您需要更新應用程式中的[相依性](#dependencies-serialization)與[匯入](#imports-serialization)，如下所示。

#### 相依性 {id="dependencies-serialization"}

| 子系統                                     |            1.6.x             |                                     2.0.0 |
|:------------------------------------------|:----------------------------:|------------------------------------------:|
| [ContentNegotiation](server-serialization.md)    |  `io.ktor:ktor-server-core`  | `io.ktor:ktor-server-content-negotiation` |
| [kotlinx.serialization](server-serialization.md) | `io.ktor:ktor-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| [Gson](server-serialization.md)                  |     `io.ktor:ktor-gson`      |         `io.ktor:ktor-serialization-gson` |
| [Jackson](server-serialization.md)               |    `io.ktor:ktor-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### 匯入 {id="imports-serialization"}
| 子系統                                     |              1.6.x               |                                         2.0.0 |
|:------------------------------------------|:--------------------------------:|----------------------------------------------:|
| [kotlinx.serialization](server-serialization.md) | `import io.ktor.serialization.*` | `import io.ktor.serialization.kotlinx.json.*` |
| [Gson](server-serialization.md)                  |     `import io.ktor.gson.*`      |         `import io.ktor.serialization.gson.*` |
| [Jackson](server-serialization.md)               |    `import io.ktor.jackson.*`    |      `import io.ktor.serialization.jackson.*` |

#### 自訂轉換器 {id="serialization-custom-converter"}

[ContentConverter](server-serialization.md#implement_custom_serializer) 介面所公開的函式簽章已變更如下：

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

### 測試 API {id="testing-api"}

在 v2.0.0 中，Ktor 伺服器使用了新的[測試](server-testing.md) API，解決了 [KTOR-971](https://youtrack.jetbrains.com/issue/KTOR-971) 中說明的各種問題。主要變更包括：
* `withTestApplication`/`withApplication` 函式已被新的 `testApplication` 函式取代。
* 在 `testApplication` 函式內部，您需要使用現有的 [Ktor 用戶端](client-create-and-configure.md)執行個體向伺服器發送請求並驗證結果。
* 若要測試特定功能（例如 Cookie 或 WebSockets），您需要建立新的用戶端執行個體並安裝對應的[外掛程式](client-plugins.md)。

讓我們看看將 1.6.x 測試遷移至 2.0.0 的幾個範例：

#### 基本伺服器測試 {id="basic-test"}

在下方的測試中，`handleRequest` 函式已被 `client.get` 請求取代：

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

在下方的測試中，`handleRequest` 函式已被 `client.post` 請求取代：

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

要在 v2.0.0 中建構 `multipart/form-data`，您需要將 `MultiPartFormDataContent` 傳遞給用戶端的 `setBody` 函式：

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

#### JSON 資料 {id="json-data"}

在 v1.6.x 中，您可以使用 `kotlinx.serialization` 程式庫提供的 `Json.encodeToString` 函式序列化 JSON 資料。
在 v2.0.0 中，您需要建立新的用戶端執行個體並安裝 [ContentNegotiation](client-serialization.md) 外掛程式，以允許按特定格式序列化/還原序列化內容：

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

#### 在測試期間保留 Cookie {id="preserving-cookies"}

在 v1.6.x 中，`cookiesSession` 用於在測試時於請求之間保留 Cookie。在 v2.0.0 中，您需要建立新的用戶端執行個體並安裝 [HttpCookies](client-cookies.md) 外掛程式：

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

在舊版 API 中，`handleWebSocketConversation` 用於測試 [WebSocket 對話](server-websockets.md)。在 v2.0.0 中，您可以透過用戶端提供的 [WebSockets](client-websockets.topic) 外掛程式來測試 WebSocket 對話：

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
在 v2.0.0 中，[DoubleReceive](server-double-receive.md) 外掛程式設定引入了 `cacheRawRequest` 屬性，其作用與 `receiveEntireContent` 相反：
- 在 v1.6.x 中，`receiveEntireContent` 屬性預設設定為 `false`。
- 在 v2.0.0 中，`cacheRawRequest` 預設設定為 `true`。`receiveEntireContent` 屬性已被移除。

### 轉發標頭 (Forwarded headers) {id="forwarded-headers"}

在 v2.0.0 中，`ForwardedHeaderSupport` 與 `XForwardedHeaderSupport` 外掛程式分別重新命名為 [ForwardedHeaders](server-forward-headers.md) 與 `XForwardedHeaders`。

### 快取標頭 (Caching headers) {id="caching-headers"}

用於定義快取選項的 [options](server-caching-headers.md#configure) 函式現在除了 `OutgoingContent` 之外，還接受 `ApplicationCall` 作為 Lambda 引數：

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

### 條件標頭 (Conditional headers) {id="conditional-headers"}

用於定義資源版本清單的 [version](server-conditional-headers.md#configure) 函式現在除了 `OutgoingContent` 之外，還接受 `ApplicationCall` 作為 Lambda 引數：

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

在 [CORS](server-cors.md) 配置中使用的數個函式已重新命名：
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
在 v1.6.x 中，`baseName` 屬性用於指定用於監視 HTTP 請求的 [Ktor 指標](server-metrics-micrometer.md)基底名稱（前綴）。
預設情況下，它等於 `ktor.http.server`。
在 v2.0.0 中，`baseName` 已被 `metricName` 取代，其預設值為 `ktor.http.server.requests`。

## Ktor 用戶端 {id="client"}
### 請求與回應 {id="request-response"}

在 v2.0.0 中，用於發送請求與接收回應的 API 進行了更新，使其更具一致性且更容易探索（[KTOR-29](https://youtrack.jetbrains.com/issue/KTOR-29)）。

#### 請求函式 {id="request-overloads"}

具有多個參數的[請求函式](client-requests.md)已被棄用。例如，`port` 與 `path` 參數需要替換為 [HttpRequestBuilder](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 所公開的 `url` 參數：

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

`HttpRequestBuilder` 還允許您在請求函式的 Lambda 內部指定其他[請求參數](client-requests.md#parameters)。

#### 請求主體 {id="request-body"}

用於設定[請求主體](client-requests.md#body)的 `HttpRequestBuilder.body` 屬性已被 `HttpRequestBuilder.setBody` 函式取代：

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

#### 回應 {id="responses"}
在 v2.0.0 中，請求函式（例如 `get`、`post`、`put`、[submitForm](client-requests.md#form_parameters) 等）不再接受用於接收特定型別物件的泛型引數。
現在所有請求函式均傳回一個 `HttpResponse` 物件，該物件公開了帶有泛型引數的 `body` 函式，用於接收特定型別的執行個體。
您也可以使用 `bodyAsText` 或 `bodyAsChannel` 將內容作為字串或通道接收。

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

安裝了 [ContentNegotiation](client-serialization.md) 外掛程式後，您可以按如下方式接收任意物件：

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

#### 串流回應 {id="streaming-response"}
由於從請求函式中[移除了泛型引數](#responses)，接收串流回應需要獨立的函式。
為了實現這一點，新增了帶有 `prepare` 前綴的函式，例如 `prepareGet` 或 `preparePost`：

```kotlin
public suspend fun HttpClient.prepareGet(builder: HttpRequestBuilder): HttpStatement
public suspend fun HttpClient.preparePost(builder: HttpRequestBuilder): HttpStatement
```

以下範例展示了在此情況下如何修改您的程式碼：

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.get<HttpStatement>("https://ktor.io/").execute { httpResponse ->
    val channel: ByteReadChannel = httpResponse.receive()
    while (!channel.isClosedForRead) {
        // 讀取資料
    }
}
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.prepareGet("https://ktor.io/").execute { httpResponse ->
    val channel: ByteReadChannel = httpResponse.body()
    while (!channel.isClosedForRead) {
        // 讀取資料
    }
}
```

</TabItem>
</Tabs>

您可以在此處找到完整範例：[串流資料](client-responses.md#streaming)。

### 回應驗證 {id="response-validation"}

在 v2.0.0 中，用於[回應驗證](client-response-validation.md)的 `expectSuccess` 屬性預設設定為 `false`。
這需要對您的程式碼進行以下變更：
- 若要[啟用預設驗證](client-response-validation.md#default)並針對非 2xx 回應擲回例外，請將 `expectSuccess` 屬性設定為 `true`。
- 如果您使用 `handleResponseExceptionWithRequest` [處理非 2xx 例外](client-response-validation.md#non-2xx)，您還需要明確啟用 `expectSuccess`。

#### HttpResponseValidator {id="http-response-validator"}

[handleResponseException](client-response-validation.md#non-2xx) 函式已被 `handleResponseExceptionWithRequest` 取代，後者增加了對 `HttpRequest` 的存取權限，以便在例外中提供額外資訊：

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

### 內容協商與序列化 {id="serialization-client"}

Ktor 用戶端現在支援內容協商，並與 Ktor 伺服器共享序列化程式庫。
主要變更包括：
* `JsonFeature` 已被棄用，改用 `ContentNegotiation`，它可以在 `ktor-client-content-negotiation` 構件中找到。
* 序列化程式庫已從 `ktor-client-*` 移至 `ktor-serialization-*` 構件。

您需要更新用戶端程式碼中的[相依性](#imports-dependencies-client)與[匯入](#imports-serialization-client)，如下所示。

#### 相依性 {id="imports-dependencies-client"}

| 子系統                 |                1.6.x                |                                     2.0.0 |
|:----------------------|:-----------------------------------:|------------------------------------------:|
| `ContentNegotiation`  |                 n/a                 | `io.ktor:ktor-client-content-negotiation` |
| kotlinx.serialization | `io.ktor:ktor-client-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| Gson                  |     `io.ktor:ktor-client-gson`      |         `io.ktor:ktor-serialization-gson` |
| Jackson               |    `io.ktor:ktor-client-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### 匯入 {id="imports-serialization-client"}
| 子系統                 |                  1.6.x                  |                                                2.0.0 |
|:----------------------|:---------------------------------------:|-----------------------------------------------------:|
| `ContentNegotiation`  |                   n/a                   | `import io.ktor.client.plugins.contentnegotiation.*` |
| kotlinx.serialization | `import io.ktor.client.features.json.*` |        `import io.ktor.serialization.kotlinx.json.*` |
| Gson                  | `import io.ktor.client.features.json.*` |                `import io.ktor.serialization.gson.*` |
| Jackson               | `import io.ktor.client.features.json.*` |             `import io.ktor.serialization.jackson.*` |

### Bearer 認證 {id="bearer-authentication"}

[refreshTokens](client-bearer-auth.md) 函式現在使用 `RefreshTokenParams` 執行個體作為 [Lambda 接收者](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)（`this`），而不是使用 `HttpResponse` Lambda 引數（`it`）：

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

`RefreshTokenParams` 公開了以下屬性：
* `response` 用於存取回應參數；
* `client` 用於發送請求以重新整理權杖；
* `oldTokens` 用於存取使用 `loadTokens` 取得的權杖。

### HttpSend {id="http-send"}

[HttpSend](client-http-send.md) 外掛程式的 API 已變更如下：

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

請注意，在 v2.0.0 中，已無法使用索引存取方式來存取外掛程式。請改用 [HttpClient.plugin](#client-get) 函式。

### HttpClient.get(plugin: HttpClientPlugin) 函式已移除 {id="client-get"}

在 2.0.0 版本中，接受用戶端外掛程式作為參數的 `HttpClient.get` 函式已被移除。請改用 `HttpClient.plugin` 函式。

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.get(HttpSend).intercept { ... }
// 或
client[HttpSend].intercept { ... }
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.plugin(HttpSend).intercept { ... }
```

</TabItem>
</Tabs>

### Feature 重新命名為 Plugin {id="feature-plugin-client"}

與 Ktor 伺服器相同，用戶端 API 中的 _Feature_ 也已重新命名為 _Plugin_。
這可能會影響您的應用程式，具體說明如下。

#### 匯入 {id="feature-plugin-imports-client"}
更新用於[安裝外掛程式](client-plugins.md#install)的匯入：

<table>

<tr>
<td>子系統</td>
<td>1.6.x</td>
<td>2.0.0</td>
</tr>

<tr>
<td>
<list>
<li>
<Links href="client-default-request.md" summary="The DefaultRequest plugin allows you to configure default parameters for all requests.">預設請求</Links>
</li>
<li>
<Links href="client-user-agent.md" summary="">User agent</Links>
</li>
<li>
<Links href="client-text-and-charsets.md" summary="">字元集</Links>
</li>
<li>
<Links href="client-response-validation.md" summary="Learn how to validate a response depending on its status code.">回應驗證</Links>
</li>
<li>
<Links href="client-timeout.md" summary="Code example: %example_name%">逾時</Links>
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
<td><Links href="client-auth.md" summary="The Auth plugin handles authentication and authorization in your client application.">認證</Links></td>
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
<td><Links href="client-cookies.md" summary="The HttpCookies plugin handles cookies automatically and keep them between calls in a storage.">Cookie</Links></td>
<td><code>import io.ktor.client.features.cookies.&#42;</code></td>
<td><code>import io.ktor.client.plugins.cookies.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-logging.md" summary="Required dependencies: io.ktor:ktor-client-logging Code example: %example_name%">記錄</Links></td>
<td><code>import io.ktor.client.features.logging.&#42;</code></td>
<td><code>import io.ktor.client.plugins.logging.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-websockets.topic" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">WebSockets</Links></td>
<td><code>import io.ktor.client.features.websocket.&#42;</code></td>
<td><code>import io.ktor.client.plugins.websocket.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-content-encoding.md" summary="The ContentEncoding plugin allows you to enable specified compression algorithms (such as 'gzip' and 'deflate') and configure their settings.">內容編碼</Links></td>
<td><code>import io.ktor.client.features.compression.&#42;</code></td>
<td><code>import io.ktor.client.plugins.compression.&#42;</code></td>
</tr>

</table>

#### 自訂外掛程式 {id="feature-plugin-custom-client"}
`HttpClientFeature` 介面已重新命名為 `HttpClientPlugin`。

### 適用於 Native 目標的新記憶體模型 {id="new-mm"}

在 v2.0.0 中，在 [Native](client-engines.md#native) 目標上使用 Ktor 用戶端需要啟用新的 Kotlin/Native 記憶體模型：[啟用新 MM](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md#enable-the-new-mm)。

> 從 v2.2.0 開始，新的 Kotlin/Native 記憶體模型已[預設啟用](migration-to-22x.md#new-mm)。

### 'Ios' 引擎重新命名為 'Darwin' {id="darwin"}

鑑於 `Ios` [引擎](client-engines.md)不僅以 iOS 為目標，還支援包括 macOS 或 tvOS 在內的其他作業系統，在 v2.0.0 中，它已重新命名為 `Darwin`。這引發了以下變更：
* `io.ktor:ktor-client-ios` 構件已重新命名為 `io.ktor:ktor-client-darwin`。
* 若要建立 `HttpClient` 執行個體，您需要傳遞 `Darwin` 類別作為引數。
* `IosClientEngineConfig` 組態類別已重新命名為 `DarwinClientEngineConfig`。

若要了解如何設定 `Darwin` 引擎，請參閱 [Darwin](client-engines.md#darwin) 一節。

### WebSockets 程式碼已移至 'websockets' 套件 {id="client-ws-package"}

WebSockets 程式碼已從 `http-cio` 移至 `websockets` 套件。這需要按照以下方式更新匯入：

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

### 預設請求 {id="default-request"}

[DefaultRequest](client-default-request.md) 外掛程式使用 `DefaultRequestBuilder` 組態類別取代了 `HttpRequestBuilder`：

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