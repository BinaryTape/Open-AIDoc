[//]: # (title: 从 1.6.x 迁移到 2.0.x)

<show-structure for="chapter" depth="2"/>

本指南介绍了如何将 Ktor 应用程序从 1.6.x 版本迁移到 2.0.x。

## Ktor 服务端 {id="server"}
### 服务端代码移至 'io.ktor.server.*' 软件包 {id="server-package"}
为了统一并更好地重构和区分服务端与客户端 API，服务端代码已移至 `io.ktor.server.*` 软件包（[KTOR-2865](https://youtrack.jetbrains.com/issue/KTOR-2865)）。
这意味着您需要更新应用程序中的[依赖项](#server-package-dependencies)和[导入](#server-package-imports)，如下所示。

#### 依赖项 {id="server-package-dependencies"}
| 子系统                                                 |               1.6.x               |                                                                                2.0.0 |
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
| [身份验证](server-auth.md)                            |        `io.ktor:ktor-auth`        |                                                           `io.ktor:ktor-server-auth` |
| [JWT 身份验证](server-jwt.md)                         |      `io.ktor:ktor-auth-jwt`      |                                                       `io.ktor:ktor-server-auth-jwt` |
| [LDAP 身份验证](server-ldap.md)                       |     `io.ktor:ktor-auth-ldap`      |                                                      `io.ktor:ktor-server-auth-ldap` |
| [DataConversion](server-data-conversion.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-data-conversion` |
| [DefaultHeaders](server-default-headers.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-default-headers` |
| [Compression](server-compression.md)                |    `io.ktor:ktor-server-core`     |                                                    `io.ktor:ktor-server-compression` |
| [CachingHeaders](server-caching-headers.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-caching-headers` |
| [ConditionalHeaders](server-conditional-headers.md) |    `io.ktor:ktor-server-core`     |                                            `io.ktor:ktor-server-conditional-headers` |
| [CORS](server-cors.md)                              |    `io.ktor:ktor-server-core`     |                                                           `io.ktor:ktor-server-cors` |
| [Forwarded 标头](server-forward-headers.md)          |    `io.ktor:ktor-server-core`     |                                               `io.ktor:ktor-server-forwarded-header` |
| [HSTS](server-hsts.md)                              |    `io.ktor:ktor-server-core`     |                                                           `io.ktor:ktor-server-hsts` |
| [HttpsRedirect](server-https-redirect.md)           |    `io.ktor:ktor-server-core`     |                                                  `io.ktor:ktor-server-http-redirect` |
| [PartialContent](server-partial-content.md)         |    `io.ktor:ktor-server-core`     |                                                `io.ktor:ktor-server-partial-content` |
| [WebSockets](server-websockets.md)                  |     `io.ktor:ktor-websockets`     |                                                     `io.ktor:ktor-server-websockets` |
| [CallLogging](server-call-logging.md)               |    `io.ktor:ktor-server-core`     |                                                   `io.ktor:ktor-server-call-logging` |
| [Micrometer 指标](server-metrics-micrometer.md)       | `io.ktor:ktor-metrics-micrometer` |                                             `io.ktor:ktor-server-metrics-micrometer` |
| [Dropwizard 指标](server-metrics-dropwizard.md)       |      `io.ktor:ktor-metrics`       |                                                        `io.ktor:ktor-server-metrics` |
| [Sessions](server-sessions.md)                      |      `io.ktor:ktor-server-core`   |                                        `io.ktor:ktor-server-sessions` |

> 要一次性添加所有插件，可以使用 `io.ktor:ktor-server` 工件。

#### 导入 {id="server-package-imports"}
| 子系统                                                 |                 1.6.x                 |                                                2.0.0 |
|:----------------------------------------------------|:-------------------------------------:|-----------------------------------------------------:|
| [Application](server-create-and-configure.topic)    |    `import io.ktor.application.*`     |                `import io.ktor.server.application.*` |
| [配置](server-configuration-file.topic)               |       `import io.ktor.config.*`       |                     `import io.ktor.server.config.*` |
| [路由](server-routing.md)                             |      `import io.ktor.routing.*`       |                    `import io.ktor.server.routing.*` |
| [AutoHeadResponse](server-autoheadresponse.md)      |      `import io.ktor.features.*`      |           `import io.ktor.server.plugins.autohead.*` |
| [StatusPages](server-status-pages.md)               |      `import io.ktor.features.*`      |        `import io.ktor.server.plugins.statuspages.*` |
| [CallId](server-call-id.md)                         |      `import io.ktor.features.*`      |             `import io.ktor.server.plugins.callid.*` |
| [DoubleReceive](server-double-receive.md)           |      `import io.ktor.features.*`      |      `import io.ktor.server.plugins.doublereceive.*` |
| [请求](server-requests.md)                            |      `import io.ktor.request.*`       |                    `import io.ktor.server.request.*` |
| [响应](server-responses.md)                           |      `import io.ktor.response.*`      |                   `import io.ktor.server.response.*` |
| [插件](#feature-plugin)                               |      `import io.ktor.features.*`      |                    `import io.ktor.server.plugins.*` |
| [Locations](https://ktor.io/docs/server-locations.html)                    |     `import io.ktor.locations.*`      |                  `import io.ktor.server.locations.*` |
| [静态内容](server-static-content.md)                    |    `import io.ktor.http.content.*`    |               `import io.ktor.server.http.content.*` |
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
| [身份验证](server-auth.md)                            |        `import io.ktor.auth.*`        |                       `import io.ktor.server.auth.*` |
| [JWT 身份验证](server-jwt.md)                         |      `import io.ktor.auth.jwt.*`      |                   `import io.ktor.server.auth.jwt.*` |
| [LDAP 身份验证](server-ldap.md)                       |     `import io.ktor.auth.ldap.*`      |                  `import io.ktor.server.auth.ldap.*` |
| [Sessions](server-sessions.md)                      |      `import io.ktor.sessions.*`      |                   `import io.ktor.server.sessions.*` |
| [DefaultHeaders](server-default-headers.md)         |      `import io.ktor.features.*`      |     `import io.ktor.server.plugins.defaultheaders.*` |
| [Compression](server-compression.md)                |      `import io.ktor.features.*`      |        `import io.ktor.server.plugins.compression.*` |
| [CachingHeaders](server-caching-headers.md)         |      `import io.ktor.features.*`      |     `import io.ktor.server.plugins.cachingheaders.*` |
| [ConditionalHeaders](server-conditional-headers.md) |      `import io.ktor.features.*`      | `import io.ktor.server.plugins.conditionalheaders.*` |
| [CORS](server-cors.md)                              |      `import io.ktor.features.*`      |               `import io.ktor.server.plugins.cors.*` |
| [Forwarded 标头](server-forward-headers.md)          |      `import io.ktor.features.*`      |   `import io.ktor.server.plugins.forwardedheaders.*` |
| [HSTS](server-hsts.md)                              |      `import io.ktor.features.*`      |               `import io.ktor.server.plugins.hsts.*` |
| [HttpsRedirect](server-https-redirect.md)           |      `import io.ktor.features.*`      |      `import io.ktor.server.plugins.httpsredirect.*` |
| [PartialContent](server-partial-content.md)         |      `import io.ktor.features.*`      |     `import io.ktor.server.plugins.partialcontent.*` |
| [WebSockets](server-websockets.md)                  |     `import io.ktor.websocket.*`      |                  `import io.ktor.server.websocket.*` |
| [CallLogging](server-call-logging.md)               |      `import io.ktor.features.*`      |         `import io.ktor.server.plugins.callloging.*` |
| [Micrometer 指标](server-metrics-micrometer.md)       | `import io.ktor.metrics.micrometer.*` |         `import io.ktor.server.metrics.micrometer.*` |
| [Dropwizard 指标](server-metrics-dropwizard.md)       | `import io.ktor.metrics.dropwizard.*` |         `import io.ktor.server.metrics.dropwizard.*` |

### WebSockets 代码移至 'websockets' 软件包 {id="server-ws-package"}

WebSockets 代码已从 `http-cio` 移至 `websockets` 软件包。这需要按如下方式更新导入：

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

请注意，此更改也会影响[客户端](#client-ws-package)。

### Feature 更名为 Plugin {id="feature-plugin"}

在 Ktor 2.0.0 中，_Feature_ 更名为 _[Plugin](server-plugins.md)_，以便更好地描述拦截请求/响应流水线的功能（[KTOR-2326](https://youtrack.jetbrains.com/issue/KTOR-2326)）。
这会影响整个 Ktor API，需要按照下文说明更新您的应用程序。

#### 导入 {id="feature-plugin-imports"}
[安装任何插件](server-plugins.md#install)都需要更新导入，并且还取决于[将服务端代码移至](#server-package-imports) `io.ktor.server.*` 软件包：

| 1.6.x                       |                             2.0.0 |
|:----------------------------|----------------------------------:|
| `import io.ktor.features.*` | `import io.ktor.server.plugins.*` |

#### 自定义插件 {id="feature-plugin-custom"}

将 Feature 重命名为 Plugin 为与[自定义插件](server-custom-plugins-base-api.md)相关的 API 带来了以下变更：
* `ApplicationFeature` 接口更名为 `BaseApplicationPlugin`。
* `Features` [流水线阶段](server-custom-plugins-base-api.md#pipelines)更名为 `Plugins`。

> 请注意，从 v2.0.0 开始，Ktor 提供了用于[创建自定义插件](server-custom-plugins.md)的新 API。通常，该 API 不需要理解流水线、阶段等 Ktor 内部概念。相反，您可以使用各种处理程序（如 `onCall`、`onCallReceive`、`onCallRespond` 等）访问处理请求和响应的不同阶段。您可以从本节了解流水线阶段如何映射到新 API 中的处理程序：[流水线阶段与新 API 处理程序的映射关系](server-custom-plugins-base-api.md#mapping)。

### 内容协商与序列化 {id="serialization"}

[内容协商与序列化](server-serialization.md)的服务端 API 经过了重构，以便在服务端与客户端之间复用序列化库。
主要变更如下：
* `ContentNegotiation` 已从 `ktor-server-core` 移至独立的 `ktor-server-content-negotiation` 工件。
* 序列化库已从 `ktor-*` 移至客户端同样使用的 `ktor-serialization-*` 工件。

您需要更新应用程序中的[依赖项](#dependencies-serialization)和[导入](#imports-serialization)，如下所示。

#### 依赖项 {id="dependencies-serialization"}

| 子系统                                       |            1.6.x             |                                     2.0.0 |
|:------------------------------------------|:----------------------------:|------------------------------------------:|
| [ContentNegotiation](server-serialization.md)    |  `io.ktor:ktor-server-core`  | `io.ktor:ktor-server-content-negotiation` |
| [kotlinx.serialization](server-serialization.md) | `io.ktor:ktor-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| [Gson](server-serialization.md)                  |     `io.ktor:ktor-gson`      |         `io.ktor:ktor-serialization-gson` |
| [Jackson](server-serialization.md)               |    `io.ktor:ktor-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### 导入 {id="imports-serialization"}
| 子系统                                       |              1.6.x               |                                         2.0.0 |
|:------------------------------------------|:--------------------------------:|----------------------------------------------:|
| [kotlinx.serialization](server-serialization.md) | `import io.ktor.serialization.*` | `import io.ktor.serialization.kotlinx.json.*` |
| [Gson](server-serialization.md)                  |     `import io.ktor.gson.*`      |         `import io.ktor.serialization.gson.*` |
| [Jackson](server-serialization.md)               |    `import io.ktor.jackson.*`    |      `import io.ktor.serialization.jackson.*` |

#### 自定义转换器 {id="serialization-custom-converter"}

由 [ContentConverter](server-serialization.md#implement_custom_serializer) 接口公开的函数签名按以下方式发生了变更：

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

### 测试 API {id="testing-api"}

在 v2.0.0 中，Ktor 服务端使用了全新的[测试](server-testing.md) API，解决了 [KTOR-971](https://youtrack.jetbrains.com/issue/KTOR-971) 中描述的各类问题。主要变更如下：
* `withTestApplication`/`withApplication` 函数被替换为新的 `testApplication` 函数。
* 在 `testApplication` 函数内部，您需要使用现有的 [Ktor 客户端](client-create-and-configure.md)实例向服务端发送请求并验证结果。
* 要测试特定功能（例如 Cookie 或 WebSockets），您需要创建一个新的客户端实例并安装相应的[插件](client-plugins.md)。

让我们来看几个将 1.6.x 测试迁移到 2.0.0 的示例：

#### 基础服务端测试 {id="basic-test"}

在下面的测试中，`handleRequest` 函数被替换为 `client.get` 请求：

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

在下面的测试中，`handleRequest` 函数被替换为 `client.post` 请求：

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

要在 v2.0.0 中构建 `multipart/form-data`，您需要将 `MultiPartFormDataContent` 传递给客户端的 `setBody` 函数：

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

#### JSON 数据 {id="json-data"}

在 v1.6.x 中，您可以使用 `kotlinx.serialization` 库提供的 `Json.encodeToString` 函数对 JSON 数据进行序列化。
在 v2.0.0 中，您需要创建一个新的客户端实例并安装 [ContentNegotiation](client-serialization.md) 插件，该插件允许以特定格式序列化/反序列化内容：

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

#### 在测试期间保留 Cookie {id="preserving-cookies"}

在 v1.6.x 中，`cookiesSession` 用于在测试时的各请求之间保留 Cookie。在 v2.0.0 中，您需要创建一个新的客户端实例并安装 [HttpCookies](client-cookies.md) 插件：

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

在旧版 API 中，`handleWebSocketConversation` 用于测试 [WebSocket 会话](server-websockets.md)。在 v2.0.0 中，您可以通过使用客户端提供的 [WebSockets](client-websockets.topic) 插件来测试 WebSocket 会话：

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
在 v2.0.0 中，[DoubleReceive](server-double-receive.md) 插件配置引入了 `cacheRawRequest` 属性，它与 `receiveEntireContent` 相反：
- 在 v1.6.x 中，`receiveEntireContent` 属性默认设置为 `false`。
- 在 v2.0.0 中，`cacheRawRequest` 默认设置为 `true`。`receiveEntireContent` 属性已被移除。

### Forwarded 标头 {id="forwarded-headers"}

在 v2.0.0 中，`ForwardedHeaderSupport` 和 `XForwardedHeaderSupport` 插件分别更名为 [ForwardedHeaders](server-forward-headers.md) 和 `XForwardedHeaders`。

### 缓存标头 {id="caching-headers"}

用于定义缓存选项的 [options](server-caching-headers.md#configure) 函数除 `OutgoingContent` 外，现在还接受 `ApplicationCall` 作为 lambda 实参： 

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

### 条件标头 {id="conditional-headers"}

用于定义资源版本列表的 [version](server-conditional-headers.md#configure) 函数除 `OutgoingContent` 外，现在还接受 `ApplicationCall` 作为 lambda 实参：

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

[CORS](server-cors.md) 配置中使用的几个函数已重命名：
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
在 v1.6.x 中，`baseName` 属性用于指定监控 HTTP 请求所用的 [Ktor 指标](server-metrics-micrometer.md)的基本名称（前缀）。
默认情况下，它等于 `ktor.http.server`。 
在 v2.0.0 中，`baseName` 被替换为 `metricName`，其默认值为 `ktor.http.server.requests`。

## Ktor 客户端 {id="client"}
### 请求与响应 {id="request-response"}

在 v2.0.0 中，用于发送请求和接收响应的 API 进行了更新，使其更加一致且更易于发现（[KTOR-29](https://youtrack.jetbrains.com/issue/KTOR-29)）。

#### 请求函数 {id="request-overloads"}

带有多个形参的[请求函数](client-requests.md)已被弃用。例如，`port` 和 `path` 形参需要替换为 [HttpRequestBuilder](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 公开的 `url` 形参：

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

`HttpRequestBuilder` 还允许您在请求函数 lambda 内部指定额外的[请求参数](client-requests.md#parameters)。

#### 请求体 {id="request-body"}

用于设置[请求体](client-requests.md#body)的 `HttpRequestBuilder.body` 属性被替换为 `HttpRequestBuilder.setBody` 函数：

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

#### 响应 {id="responses"}
在 v2.0.0 中，请求函数（例如 `get`、`post`、`put`、[submitForm](client-requests.md#form_parameters) 等）不再接受用于接收特定类型对象的泛型实参。
现在所有请求函数都返回一个 `HttpResponse` 对象，该对象公开了带有用于接收特定类型实例的泛型实参的 `body` 函数。
您还可以使用 `bodyAsText` 或 `bodyAsChannel` 将内容作为字符串或通道接收。

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

安装 [ContentNegotiation](client-serialization.md) 插件后，您可以按如下方式接收任意对象：

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

#### 流式响应 {id="streaming-response"}
由于请求函数中[移除了泛型实参](#responses)，接收流式响应需要单独的函数。
为此，添加了带有 `prepare` 前缀的函数，例如 `prepareGet` 或 `preparePost`：

```kotlin
public suspend fun HttpClient.prepareGet(builder: HttpRequestBuilder): HttpStatement
public suspend fun HttpClient.preparePost(builder: HttpRequestBuilder): HttpStatement
```

以下示例说明了在此情况下应如何更改代码：

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

您可以在此处找到完整示例：[流式传输数据](client-responses.md#streaming)。

### 响应验证 {id="response-validation"}

在 v2.0.0 中，用于[响应验证](client-response-validation.md)的 `expectSuccess` 属性默认设置为 `false`。
这需要对代码进行以下更改：
- 要[启用默认验证](client-response-validation.md#default)并在出现非 2xx 响应时抛出异常，请将 `expectSuccess` 属性设置为 `true`。
- 如果您使用 `handleResponseExceptionWithRequest` [处理非 2xx 异常](client-response-validation.md#non-2xx)，还需要显式启用 `expectSuccess`。

#### HttpResponseValidator {id="http-response-validator"}

[handleResponseException](client-response-validation.md#non-2xx) 函数被替换为 `handleResponseExceptionWithRequest`，后者增加了对 `HttpRequest` 的访问权限，以便在异常中提供更多信息：

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

### 内容协商与序列化 {id="serialization-client"}

Ktor 客户端现在支持内容协商，并与 Ktor 服务端共享序列化库。
主要变更如下：
* `JsonFeature` 已被弃用，取而代之的是 `ktor-client-content-negotiation` 工件中的 `ContentNegotiation`。
* 序列化库已从 `ktor-client-*` 移至 `ktor-serialization-*` 工件。

您需要更新客户端代码中的[依赖项](#imports-dependencies-client)和[导入](#imports-serialization-client)，如下所示。

#### 依赖项 {id="imports-dependencies-client"}

| 子系统                   |                1.6.x                |                                     2.0.0 |
|:----------------------|:-----------------------------------:|------------------------------------------:|
| `ContentNegotiation`  |                 n/a                 | `io.ktor:ktor-client-content-negotiation` |
| kotlinx.serialization | `io.ktor:ktor-client-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| Gson                  |     `io.ktor:ktor-client-gson`      |         `io.ktor:ktor-serialization-gson` |
| Jackson               |    `io.ktor:ktor-client-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### 导入 {id="imports-serialization-client"}
| 子系统                   |                  1.6.x                  |                                                2.0.0 |
|:----------------------|:---------------------------------------:|-----------------------------------------------------:|
| `ContentNegotiation`  |                   n/a                   | `import io.ktor.client.plugins.contentnegotiation.*` |
| kotlinx.serialization | `import io.ktor.client.features.json.*` |        `import io.ktor.serialization.kotlinx.json.*` |
| Gson                  | `import io.ktor.client.features.json.*` |                `import io.ktor.serialization.gson.*` |
| Jackson               | `import io.ktor.client.features.json.*` |             `import io.ktor.serialization.jackson.*` |

### Bearer 身份验证 {id="bearer-authentication"}

[refreshTokens](client-bearer-auth.md) 函数现在使用 `RefreshTokenParams` 实例作为 [lambda 接收者](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it) (`this`)，而不是 `HttpResponse` lambda 实参 (`it`)：

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

`RefreshTokenParams` 公开了以下属性：
* `response`：访问响应参数；
* `client`：用于发起刷新令牌的请求；
* `oldTokens`：访问使用 `loadTokens` 获取的令牌。

### HttpSend {id="http-send"}

[HttpSend](client-http-send.md) 插件的 API 变动如下：

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

请注意，在 v2.0.0 中，索引访问方式不再可用于访问插件。请改用 [HttpClient.plugin](#client-get) 函数。

### HttpClient.get(plugin: HttpClientPlugin) 函数已移除 {id="client-get"}

在 2.0.0 版本中，接受客户端插件的 `HttpClient.get` 函数已被移除。请改用 `HttpClient.plugin` 函数。

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

### Feature 更名为 Plugin {id="feature-plugin-client"}

与 Ktor 服务端一样，客户端 API 中的 _Feature_ 也更名为 _Plugin_。
这可能会影响您的应用程序，如下文所述。

#### 导入 {id="feature-plugin-imports-client"}
更新用于[安装插件](client-plugins.md#install)的导入：

<table>

<tr>
<td>子系统</td>
<td>1.6.x</td>
<td>2.0.0</td>
</tr>

<tr>
<td>
<list>
<li>
<Links href="client-default-request.md" summary="The DefaultRequest plugin allows you to configure default parameters for all requests.">默认请求</Links>
</li>
<li>
<Links href="client-user-agent.md" summary="">User agent</Links>
</li>
<li>
<Links href="client-text-and-charsets.md" summary="">字符集</Links>
</li>
<li>
<Links href="client-response-validation.md" summary="Learn how to validate a response depending on its status code.">响应验证</Links>
</li>
<li>
<Links href="client-timeout.md" summary="Code example: %example_name%">超时</Links>
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
<td><Links href="client-auth.md" summary="The Auth plugin handles authentication and authorization in your client application.">身份验证</Links></td>
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
<td><Links href="client-logging.md" summary="Required dependencies: io.ktor:ktor-client-logging Code example: %example_name%">日志记录</Links></td>
<td><code>import io.ktor.client.features.logging.&#42;</code></td>
<td><code>import io.ktor.client.plugins.logging.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-websockets.topic" summary="The Websockets plugin allows you to create a multi-way communication session between a server and a client.">WebSockets</Links></td>
<td><code>import io.ktor.client.features.websocket.&#42;</code></td>
<td><code>import io.ktor.client.plugins.websocket.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-content-encoding.md" summary="The ContentEncoding plugin allows you to enable specified compression algorithms (such as 'gzip' and 'deflate') and configure their settings.">内容编码</Links></td>
<td><code>import io.ktor.client.features.compression.&#42;</code></td>
<td><code>import io.ktor.client.plugins.compression.&#42;</code></td>
</tr>

</table>

#### 自定义插件 {id="feature-plugin-custom-client"}
`HttpClientFeature` 接口更名为 `HttpClientPlugin`。

### Native 目标的新内存模型 {id="new-mm"}

在 v2.0.0 中，在 [Native](client-engines.md#native) 目标上使用 Ktor 客户端需要启用新的 Kotlin/Native 内存模型：[启用新内存模型 (Enable the new MM)](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md#enable-the-new-mm)。

> 从 v2.2.0 开始，新的 Kotlin/Native 内存模型已[默认启用](migration-to-22x.md#new-mm)。

### 'Ios' 引擎更名为 'Darwin' {id="darwin"}

鉴于 `Ios` [引擎](client-engines.md)不仅面向 iOS，还面向包括 macOS 或 tvOS 在内的其他操作系统，在 v2.0.0 中它更名为 `Darwin`。这导致了以下变更：
* `io.ktor:ktor-client-ios` 工件更名为 `io.ktor:ktor-client-darwin`。
* 要创建 `HttpClient` 实例，您需要将 `Darwin` 类作为实参传入。
* `IosClientEngineConfig` 配置类更名为 `DarwinClientEngineConfig`。

要了解如何配置 `Darwin` 引擎，请参阅 [Darwin](client-engines.md#darwin) 部分。

### WebSockets 代码移至 'websockets' 软件包 {id="client-ws-package"}

WebSockets 代码已从 `http-cio` 移至 `websockets` 软件包。这需要按如下方式更新导入：

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

### 默认请求 {id="default-request"}

[DefaultRequest](client-default-request.md) 插件使用 `DefaultRequestBuilder` 配置类代替 `HttpRequestBuilder`：

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