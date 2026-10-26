[//]: # (title: 1.6.x から 2.0.x への移行)

<show-structure for="chapter" depth="2"/>

このガイドでは、Ktor アプリケーションを 1.6.x バージョンから 2.0.x へ移行する手順について説明します。

## Ktor Server {id="server"}
### サーバーコードの 'io.ktor.server.*' パッケージへの移動 {id="server-package"}
サーバーとクライアントの API を統一し、より明確に区別できるようにするため、サーバーコードは `io.ktor.server.*` パッケージに移動されました（[KTOR-2865](https://youtrack.jetbrains.com/issue/KTOR-2865)）。
これにより、以下に示すように、アプリケーションの[依存関係](#server-package-dependencies)および[インポート](#server-package-imports)を更新する必要があります。

#### 依存関係 {id="server-package-dependencies"}
| サブシステム                                           |               1.6.x               |                                                                                2.0.0 |
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

> すべてのプラグインを一度に追加するには、`io.ktor:ktor-server` アーティファクトを使用できます。

#### インポート {id="server-package-imports"}
| サブシステム                                           |                 1.6.x                 |                                                2.0.0 |
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

### WebSockets コードの 'websockets' パッケージへの移動 {id="server-ws-package"}

WebSockets のコードは `http-cio` から `websockets` パッケージに移動されました。これにより、インポートを以下のように更新する必要があります。

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

この変更は[クライアント](#client-ws-package)にも影響することに注意してください。

### Feature は Plugin に名称変更 {id="feature-plugin"}

Ktor 2.0.0 では、リクエスト/レスポンスパイプラインをインターセプトする機能をより適切に表現するため、_Feature_ が _[Plugin](server-plugins.md)_ に改名されました（[KTOR-2326](https://youtrack.jetbrains.com/issue/KTOR-2326)）。
これは Ktor API 全体に影響し、以下のようにアプリケーションを更新する必要があります。

#### インポート {id="feature-plugin-imports"}
[任意のプラグインのインストール](server-plugins.md#install)にはインポートの更新が必要であり、[サーバーコードの移動](#server-package-imports)（`io.ktor.server.*` パッケージへ）にも依存します。

| 1.6.x                       |                             2.0.0 |
|:----------------------------|----------------------------------:|
| `import io.ktor.features.*` | `import io.ktor.server.plugins.*` |

#### カスタムプラグイン {id="feature-plugin-custom"}

Feature から Plugin への名称変更に伴い、[カスタムプラグイン](server-custom-plugins-base-api.md)に関連する API に以下の変更が加えられました。
* `ApplicationFeature` インターフェースは `BaseApplicationPlugin` に改名されました。
* `Features` [パイプラインフェーズ](server-custom-plugins-base-api.md#pipelines)は `Plugins` に改名されました。

> v2.0.0 以降、Ktor では[カスタムプラグインを作成する](server-custom-plugins.md)ための新しい API が提供されています。通常、この API ではパイプラインやフェーズといった Ktor の内部概念を理解する必要はありません。代わりに、`onCall`、`onCallReceive`、`onCallRespond` などのさまざまなハンドラーを使用して、リクエストおよびレスポンスの処理における異なるステージへアクセスできます。パイプラインフェーズが新しい API のハンドラーにどのようにマッピングされるかについては、[パイプラインフェーズと新しい API ハンドラーのマッピング](server-custom-plugins-base-api.md#mapping)セクションを参照してください。

### コンテンツネゴシエーションとシリアライズ {id="serialization"}

[コンテンツネゴシエーションとシリアライズ](server-serialization.md)のサーバー API は、サーバーとクライアント間でシリアライズライブラリを再利用できるようにリファクタリングされました。
主な変更点は以下のとおりです。
* `ContentNegotiation` は `ktor-server-core` から独立した `ktor-server-content-negotiation` アーティファクトに移動されました。
* シリアライズライブラリは `ktor-*` から、クライアントでも使用される `ktor-serialization-*` アーティファクトに移動されました。

以下に示すように、アプリケーションの[依存関係](#dependencies-serialization)および[インポート](#imports-serialization)を更新する必要があります。

#### 依存関係 {id="dependencies-serialization"}

| サブシステム                                 |            1.6.x             |                                     2.0.0 |
|:------------------------------------------|:----------------------------:|------------------------------------------:|
| [ContentNegotiation](server-serialization.md)    |  `io.ktor:ktor-server-core`  | `io.ktor:ktor-server-content-negotiation` |
| [kotlinx.serialization](server-serialization.md) | `io.ktor:ktor-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| [Gson](server-serialization.md)                  |     `io.ktor:ktor-gson`      |         `io.ktor:ktor-serialization-gson` |
| [Jackson](server-serialization.md)               |    `io.ktor:ktor-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### インポート {id="imports-serialization"}
| サブシステム                                 |              1.6.x               |                                         2.0.0 |
|:------------------------------------------|:--------------------------------:|----------------------------------------------:|
| [kotlinx.serialization](server-serialization.md) | `import io.ktor.serialization.*` | `import io.ktor.serialization.kotlinx.json.*` |
| [Gson](server-serialization.md)                  |     `import io.ktor.gson.*`      |         `import io.ktor.serialization.gson.*` |
| [Jackson](server-serialization.md)               |    `import io.ktor.jackson.*`    |      `import io.ktor.serialization.jackson.*` |

#### カスタムコンバーター {id="serialization-custom-converter"}

[ContentConverter](server-serialization.md#implement_custom_serializer) インターフェースが公開する関数のシグネチャが次のように変更されました。

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

### テスティング API {id="testing-api"}

v2.0.0 では、Ktor サーバーは[テスト](server-testing.md)用の新しい API を使用するようになり、[KTOR-971](https://youtrack.jetbrains.com/issue/KTOR-971) で説明されているさまざまな問題が解決されました。主な変更点は以下のとおりです。
* `withTestApplication`/`withApplication` 関数は、新しい `testApplication` 関数に置き換えられました。
* `testApplication` 関数の内部では、既存の [Ktor クライアント](client-create-and-configure.md)インスタンスを使用してサーバーにリクエストを送信し、結果を検証する必要があります。
* 特定の機能（Cookie や WebSockets など）をテストするには、新しいクライアントインスタンスを作成し、対応する[プラグイン](client-plugins.md)をインストールする必要があります。

1.6.x のテストを 2.0.0 に移行する例をいくつか見てみましょう。

#### 基本的なサーバーテスト {id="basic-test"}

以下のテストでは、`handleRequest` 関数が `client.get` リクエストに置き換えられています。

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

以下のテストでは、`handleRequest` 関数が `client.post` リクエストに置き換えられています。

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

v2.0.0 で `multipart/form-data` を構築するには、クライアントの `setBody` 関数に `MultiPartFormDataContent` を渡す必要があります。

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

#### JSON データ {id="json-data"}

v1.6.x では、`kotlinx.serialization` ライブラリが提供する `Json.encodeToString` 関数を使用して JSON データをシリアライズできます。
v2.0.0 では、新しいクライアントインスタンスを作成し、特定の形式でコンテンツをシリアライズ/デシリアライズできるようにする [ContentNegotiation](client-serialization.md) プラグインをインストールする必要があります。

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

#### テスト中に Cookie を保持 {id="preserving-cookies"}

v1.6.x では、テスト時にリクエスト間で Cookie を保持するために `cookiesSession` を使用します。v2.0.0 では、新しいクライアントインスタンスを作成し、[HttpCookies](client-cookies.md) プラグインをインストールする必要があります。

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

旧 API では、[WebSocket のやり取り](server-websockets.md)をテストするために `handleWebSocketConversation` が使用されていました。v2.0.0 では、クライアントが提供する [WebSockets](client-websockets.topic) プラグインを使用することで WebSocket のやり取りをテストできます。

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
v2.0.0 では、[DoubleReceive](server-double-receive.md) プラグイン設定に `receiveEntireContent` とは逆の働きをする `cacheRawRequest` プロパティが導入されました。
- v1.6.x では、`receiveEntireContent` プロパティのデフォルト値は `false` に設定されています。
- v2.0.0 では、`cacheRawRequest` のデフォルト値は `true` に設定されています。`receiveEntireContent` プロパティは削除されました。

### Forwarded headers {id="forwarded-headers"}

v2.0.0 では、`ForwardedHeaderSupport` および `XForwardedHeaderSupport` プラグインがそれぞれ [ForwardedHeaders](server-forward-headers.md) および `XForwardedHeaders` に改名されました。

### Caching headers {id="caching-headers"}

キャッシュオプションを定義するために使用される [options](server-caching-headers.md#configure) 関数は、`OutgoingContent` に加えて `ApplicationCall` もラムダ引数として受け取るようになりました。

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

リソースバージョンのリストを定義するために使用される [version](server-conditional-headers.md#configure) 関数は、`OutgoingContent` に加えて `ApplicationCall` もラムダ引数として受け取るようになりました。

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

[CORS](server-cors.md) 設定で使用されるいくつかの関数が改名されました。
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
v1.6.x では、HTTP リクエストの監視に使用される [Ktor メトリクス](server-metrics-micrometer.md)のベース名（プレフィックス）を指定するために `baseName` プロパティが使用されていました。
デフォルトでは `ktor.http.server` と等しくなっています。
v2.0.0 では、`baseName` は `metricName` に置き換えられ、そのデフォルト値は `ktor.http.server.requests` になりました。

## Ktor Client {id="client"}
### リクエストとレスポンス {id="request-response"}

v2.0.0 では、リクエストの送信とレスポンスの受信に使用される API が更新され、一貫性と発見しやすさが向上しました（[KTOR-29](https://youtrack.jetbrains.com/issue/KTOR-29)）。

#### リクエスト関数 {id="request-overloads"}

複数のパラメータを持つ[リクエスト関数](client-requests.md)は非推奨になりました。たとえば、`port` および `path` パラメータは、[HttpRequestBuilder](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) が公開する `url` パラメータに置き換える必要があります。

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

また、`HttpRequestBuilder` を使用すると、リクエスト関数のラムダ内で追加の[リクエストパラメータ](client-requests.md#parameters)を指定することもできます。

#### リクエストボディ {id="request-body"}

[リクエストボディ](client-requests.md#body)を設定するために使用されていた `HttpRequestBuilder.body` プロパティは、`HttpRequestBuilder.setBody` 関数に置き換えられました。

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

#### レスポンス {id="responses"}
v2.0.0 では、リクエスト関数（`get`、`post`、`put`、[submitForm](client-requests.md#form_parameters) など）は特定タイプのオブジェクトを受信するためのジェネリクス引数を受け取らなくなりました。
現在、すべてのリクエスト関数は `HttpResponse` オブジェクトを返します。このオブジェクトは、特定タイプのインスタンスを受信するためのジェネリクス引数を持つ `body` 関数を公開しています。
また、`bodyAsText` や `bodyAsChannel` を使用して、コンテンツを文字列やチャネルとして受信することもできます。

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

[ContentNegotiation](client-serialization.md) プラグインをインストールすると、以下のように任意のオブジェクトを受信できます。

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

#### ストリーミングレスポンス {id="streaming-response"}
リクエスト関数からの[ジェネリクス引数の削除](#responses)に伴い、ストリーミングレスポンスの受信には別の関数が必要になりました。
これを実現するために、`prepareGet` や `preparePost` など、`prepare` プレフィックスが付いた関数が追加されました。

```kotlin
public suspend fun HttpClient.prepareGet(builder: HttpRequestBuilder): HttpStatement
public suspend fun HttpClient.preparePost(builder: HttpRequestBuilder): HttpStatement
```

この場合のコード変更例を以下に示します。

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

完全な例はこちらを参照してください: [データのストリーミング](client-responses.md#streaming)。

### レスポンス検証 {id="response-validation"}

v2.0.0 では、[レスポンス検証](client-response-validation.md)に使用される `expectSuccess` プロパティのデフォルト値が `false` に設定されています。
これにより、コードに以下の変更が必要になります。
- [デフォルトの検証を有効化](client-response-validation.md#default)して 2xx 以外のレスポンスに対して例外をスローするには、`expectSuccess` プロパティを `true` に設定します。
- `handleResponseExceptionWithRequest` を使用して [2xx 以外の例外を処理する](client-response-validation.md#non-2xx)場合も、明示的に `expectSuccess` を有効にする必要があります。

#### HttpResponseValidator {id="http-response-validator"}

[handleResponseException](client-response-validation.md#non-2xx) 関数は `handleResponseExceptionWithRequest` に置き換えられました。これにより、`HttpRequest` にアクセスして例外で追加情報を提供できるようになりました。

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

### コンテンツネゴシエーションとシリアライズ {id="serialization-client"}

Ktor クライアントはコンテンツネゴシエーションをサポートするようになり、Ktor サーバーとシリアライズライブラリを共有します。
主な変更点は以下のとおりです。
* `JsonFeature` は非推奨となり、代わりに `ktor-client-content-negotiation` アーティファクトに含まれる `ContentNegotiation` が使用されます。
* シリアライズライブラリは `ktor-client-*` から `ktor-serialization-*` アーティファクトに移動されました。

以下に示すように、クライアントコードの[依存関係](#imports-dependencies-client)および[インポート](#imports-serialization-client)を更新する必要があります。

#### 依存関係 {id="imports-dependencies-client"}

| サブシステム             |                1.6.x                |                                     2.0.0 |
|:----------------------|:-----------------------------------:|------------------------------------------:|
| `ContentNegotiation`  |                 n/a                 | `io.ktor:ktor-client-content-negotiation` |
| kotlinx.serialization | `io.ktor:ktor-client-serialization` | `io.ktor:ktor-serialization-kotlinx-json` |
| Gson                  |     `io.ktor:ktor-client-gson`      |         `io.ktor:ktor-serialization-gson` |
| Jackson               |    `io.ktor:ktor-client-jackson`    |      `io.ktor:ktor-serialization-jackson` |

#### インポート {id="imports-serialization-client"}
| サブシステム             |                  1.6.x                  |                                                2.0.0 |
|:----------------------|:---------------------------------------:|-----------------------------------------------------:|
| `ContentNegotiation`  |                   n/a                   | `import io.ktor.client.plugins.contentnegotiation.*` |
| kotlinx.serialization | `import io.ktor.client.features.json.*` |        `import io.ktor.serialization.kotlinx.json.*` |
| Gson                  | `import io.ktor.client.features.json.*` |                `import io.ktor.serialization.gson.*` |
| Jackson               | `import io.ktor.client.features.json.*` |             `import io.ktor.serialization.jackson.*` |

### Bearer 認証 {id="bearer-authentication"}

[refreshTokens](client-bearer-auth.md) 関数は、`HttpResponse` ラムダ引数（`it`）の代わりに、`RefreshTokenParams` インスタンスを[ラムダレシーバー](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)（`this`）として使用するようになりました。

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

`RefreshTokenParams` は以下のプロパティを公開しています。
* レスポンスパラメータにアクセスするための `response`
* トークンをリフレッシュするリクエストを送信するための `client`
* `loadTokens` を使用して取得したトークンにアクセスするための `oldTokens`

### HttpSend {id="http-send"}

[HttpSend](client-http-send.md) プラグインの API は次のように変更されました。

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

v2.0.0 では、プラグインへのアクセスにインデックスアクセスが使用できなくなったことに注意してください。代わりに [HttpClient.plugin](#client-get) 関数を使用してください。

### HttpClient.get(plugin: HttpClientPlugin) 関数の削除 {id="client-get"}

2.0.0 バージョンでは、クライアントプラグインを受け取る `HttpClient.get` 関数が削除されました。代わりに `HttpClient.plugin` 関数を使用してください。

<Tabs group="ktor_versions">
<TabItem title="1.6.x" group-key="1_6">

```kotlin
client.get(HttpSend).intercept { ... }
// または
client[HttpSend].intercept { ... }
```

</TabItem>
<TabItem title="2.0.0" group-key="2_0">

```kotlin
client.plugin(HttpSend).intercept { ... }
```

</TabItem>
</Tabs>

### Feature は Plugin に名称変更 {id="feature-plugin-client"}

Ktor サーバーと同様に、クライアント API でも _Feature_ は _Plugin_ に名称変更されました。
これにより、以下で説明するようにアプリケーションに影響が生じる可能性があります。

#### インポート {id="feature-plugin-imports-client"}
[プラグインのインストール](client-plugins.md#install)に関するインポートを更新してください。

<table>

<tr>
<td>サブシステム</td>
<td>1.6.x</td>
<td>2.0.0</td>
</tr>

<tr>
<td>
<list>
<li>
<Links href="client-default-request.md" summary="DefaultRequest プラグインを使用すると、すべてのリクエストに対するデフォルトのパラメータを設定できます。">デフォルトリクエスト</Links>
</li>
<li>
<Links href="client-user-agent.md" summary="">User agent</Links>
</li>
<li>
<Links href="client-text-and-charsets.md" summary="">文字セット</Links>
</li>
<li>
<Links href="client-response-validation.md" summary="ステータスコードに応じたレスポンスの検証方法を説明します。">レスポンス検証</Links>
</li>
<li>
<Links href="client-timeout.md" summary="コード例: %example_name%">タイムアウト</Links>
</li>
<li>
<Links href="client-caching.md" summary="HttpCache プラグインを使用すると、以前取得したリソースをメモリ内または永続キャッシュに保存できます。">HttpCache</Links>
</li>
<li>
<Links href="client-http-send.md" summary="コード例: %example_name%">HttpSend</Links>
</li>
</list>
</td>
<td><code>import io.ktor.client.features.&#42;</code></td>
<td><code>import io.ktor.client.plugins.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-auth.md" summary="Auth プラグインは、クライアントアプリケーションでの認証と認可を処理します。">認証</Links></td>
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
<td><Links href="client-cookies.md" summary="HttpCookies プラグインは Cookie を自動的に処理し、ストレージ内の呼び出し間で保持します。">Cookie</Links></td>
<td><code>import io.ktor.client.features.cookies.&#42;</code></td>
<td><code>import io.ktor.client.plugins.cookies.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-logging.md" summary="必要な依存関係: io.ktor:ktor-client-logging コード例: %example_name%">ロギング</Links></td>
<td><code>import io.ktor.client.features.logging.&#42;</code></td>
<td><code>import io.ktor.client.plugins.logging.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-websockets.topic" summary="Websockets プラグインを使用すると、サーバーとクライアント間で双方向の通信セッションを作成できます。">WebSockets</Links></td>
<td><code>import io.ktor.client.features.websocket.&#42;</code></td>
<td><code>import io.ktor.client.plugins.websocket.&#42;</code></td>
</tr>

<tr>
<td><Links href="client-content-encoding.md" summary="ContentEncoding プラグインを使用すると、指定された圧縮アルゴリズム（'gzip' や 'deflate' など）を有効にし、その設定を構成できます。">コンテンツエンコーディング</Links></td>
<td><code>import io.ktor.client.features.compression.&#42;</code></td>
<td><code>import io.ktor.client.plugins.compression.&#42;</code></td>
</tr>

</table>

#### カスタムプラグイン {id="feature-plugin-custom-client"}
`HttpClientFeature` インターフェースは `HttpClientPlugin` に改名されました。

### Native ターゲット向けの新しいメモリモデル {id="new-mm"}

v2.0.0 では、[Native](client-engines.md#native) ターゲットで Ktor クライアントを使用する際に、新しい Kotlin/Native メモリモデルを有効にする必要があります: [新しい MM の有効化](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md#enable-the-new-mm)。

> v2.2.0 以降では、新しい Kotlin/Native メモリモデルが[デフォルトで有効](migration-to-22x.md#new-mm)になっています。

### 'Ios' エンジンは 'Darwin' に名称変更 {id="darwin"}

`Ios` [エンジン](client-engines.md)は iOS だけでなく macOS や tvOS などの他のオペレーティングシステムもターゲットにしているため、v2.0.0 で `Darwin` に改名されました。これにより、以下の変更が発生します。
* `io.ktor:ktor-client-ios` アーティファクトは `io.ktor:ktor-client-darwin` に改名されました。
* `HttpClient` インスタンスを作成するには、引数として `Darwin` クラスを渡す必要があります。
* `IosClientEngineConfig` 設定クラスは `DarwinClientEngineConfig` に改名されました。

`Darwin` エンジンの設定方法については、[Darwin](client-engines.md#darwin) セクションを参照してください。

### WebSockets コードの 'websockets' パッケージへの移動 {id="client-ws-package"}

WebSockets のコードは `http-cio` から `websockets` パッケージに移動されました。これにより、インポートを以下のように更新する必要があります。

| 1.6.x                                 |                        2.0.0 |
|:--------------------------------------|-----------------------------:|
| `import io.ktor.http.cio.websocket.*` | `import io.ktor.websocket.*` |

### デフォルトリクエスト {id="default-request"}

[DefaultRequest](client-default-request.md) プラグインは、`HttpRequestBuilder` の代わりに `DefaultRequestBuilder` 設定クラスを使用するようになりました。

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