[//]: # (title: Ktor 3.2.0 新功能)

<show-structure for="chapter,procedure" depth="2"/>

_[發佈日期：2025 年 6 月 12 日](releases.md#release-details)_

以下是此功能版本的主要亮點：

* [Version Catalog](#published-version-catalog)
* [相依注入](#dependency-injection)
* [一等公民 HTMX 支援](#htmx-integration)
* [可暫停模組函式](#suspendable-module-functions)

## Ktor Server {id="ktor-server"}

### 可暫停模組函式 {id="suspendable-module-functions"}

從 Ktor 3.2.0 開始，[應用程式模組](server-modules.md)開始支援可暫停函式（suspendable functions）。

> 隨著可暫停模組支援的引入，開發模式下的自動重新載入不再支援阻塞性函式參照。若要了解更多資訊，請參閱[開發模式自動重新載入迴歸](#regression)。
>
{style="warning"}

以往在 Ktor 模組內部新增非同步函式時，需要使用 `runBlocking` 區塊，這可能會在建立伺服器時導致死結：

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

現在你可以使用 `suspend` 關鍵字，允許在應用程式啟動時執行非同步程式碼：

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### 並行模組載入 {id="concurrent-module-loading"}

你也可以透過新增 `ktor.application.startup = concurrent` Gradle 屬性來啟用並行模組載入。
它會獨立啟動所有應用程式模組，因此當其中一個模組暫停時，其他模組不會被阻塞。
這實現了相依注入的非循序載入，並且在某些情況下載入速度更快。

若要了解更多資訊，請參閱[並行模組](server-modules.md#concurrent-modules)。

### 設定檔反序列化 {id="configuration-file-deserialization"}

Ktor 3.2.0 透過在 `Application` 類別上新增 `.property()` 擴充功能，引入了具型別的設定載入機制。你現在可以直接將結構化設定區段反序列化為 Kotlin 資料類別。

此功能簡化了存取設定值的方式，並大幅減少處理巢狀或分組設定時的樣板程式碼。

請參考以下 **application.yaml** 檔案：

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

以往你必須單獨擷取每個設定值。使用新的 `.property()` 擴充功能，你可以一次載入整個設定區段：

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // use configuration&#10;}"/>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // use configuration&#10;}"/>
</compare>

此功能同時支援 HOCON 與 YAML 設定格式，並使用 `kotlinx.serialization` 進行反序列化。

### `ApplicationTestBuilder` 具備可設定的 `client` {id="applicationtestbuilder-has-a-configurable-client"}

從 Ktor 3.2.0 開始，`ApplicationTestBuilder` 類別中的 `client` 屬性變為可變（mutable）。此前它是唯讀的。
這項變更讓你可以設定自己的測試用戶端，並在任何可使用 `ApplicationTestBuilder` 類別的地方重複使用。例如，你可以從擴充函式內部存取該用戶端：

```kotlin
@Test
fun testRouteAfterAuthorization() = testApplication {
    // Pre-configure the client
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
            
        defaultRequest { 
            contentType(ContentType.Application.Json)
        }
    }

    // Reusable test step extracted into an extension-function
    auth(token = AuthToken("swordfish"))

    val response = client.get("/route")
    assertEquals(OK, response.status)
}

private fun ApplicationTestBuilder.auth(token: AuthToken) {
    val response = client.post("/auth") {
        setBody(token)
    }
    assertEquals(OK, response.status)
}
```

### 相依注入 {id="dependency-injection"}

Ktor 3.2.0 引入了相依注入（Dependency Injection，簡稱 DI）支援，讓你能夠更輕鬆地直接從設定檔和應用程式程式碼中管理與連結相依性。新的 DI 外掛程式簡化了相依性解析、支援非同步載入、提供自動清理，並能與測試順暢整合。

<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

若要使用 DI，請在建置指令碼中引入 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 基本相依性註冊 {id="basic-dependency-registration"}

你可以使用 Lambda、函式參照或建構函式參照來註冊相依性：

```kotlin
dependencies {
  // Lambda-based
  provide<GreetingService> { GreetingServiceImpl() }

  // Function references
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // Registering a lambda as a dependency
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 基於設定的相依性註冊 {id="configuration-based-dependency-registration"}

你可以在設定檔中使用 classpath 參照以宣告方式配置相依性。這同時支援函式與類別參照：

```yaml
# application.yaml
ktor:
  application:
    dependencies:
      - com.example.RepositoriesKt.provideDatabase
      - com.example.UserRepository
database:
  connectionUrl: postgres://localhost:3037/admin
```

```kotlin
// Repositories.kt
fun provideDatabase(@Property("database.connectionUrl") connectionUrl: String): Database =
  PostgresDatabase(connectionUrl)

class UserRepository(val db: Database) {
  // implementation 
}
```

引數會透過 `@Property` 和 `@Named` 等註解自動解析。

#### 相依性解析與注入 {id="dependency-resolution-and-injection"}

##### 解析相依性 {id="resolving-dependencies"}

若要解析相依性，你可以使用屬性委託或直接解析：

```kotlin
// Using property delegation
val service: GreetingService by dependencies

// Direct resolution
val service = dependencies.resolve<GreetingService>()
```

##### 非同步相依性解析 {id="asynchronous-dependency-resolution"}

為了支援非同步載入，你可以使用暫停函式：

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // suspends until provided
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI 外掛程式會自動暫停 `resolve()` 呼叫，直到所有相依性就緒為止。

##### 注入至應用程式模組 {id="injecting-into-application-modules"}

你可以透過指定模組參數直接將相依性注入至應用程式模組中。Ktor 將從 DI 容器中解析它們：

```yaml
ktor:
  application:
    dependencies:
      - com.example.PrintStreamProviderKt
    modules:
      - com.example.LoggingKt.logging
```

```kotlin
fun Application.logging(printStreamProvider: () -> PrintStream) {
    dependencies {
        provide<Logger> { SimpleLogger(printStreamProvider()) }
    }
}
```

使用 `@Named` 來注入具有特定名稱的相依性：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // Uses the dependency named "mongo"
}
```

##### 屬性與設定注入 {id="property-and-configuration-injection"}

使用 `@Property` 直接注入設定值：

```yaml
connection:
  domain: api.example.com
  path: /v1
  protocol: https
```

```kotlin
val connection: Connection = application.property("connection")
```

這簡化了結構化設定的處理，並支援基本型別的自動剖析。

若要了解更多資訊及進階用法，請參閱[相依注入](server-dependency-injection.md)。

### 在 `testApplication` 中存取應用程式執行個體 {id="access-the-application-instance-in-testapplication"}

現在你可以直接使用 `ApplicationTestBuilder.application` 屬性，從 `testApplication {}` 區塊存取正在執行的 `Application` 執行個體。

此前，`Application` 執行個體只能在巢狀的 `application {}` 設定區塊內存取，這使得在測試後續難以參照該應用程式。新的 `application` 屬性會在設定並啟動後公開同一個執行個體。

以下範例使用 `application` 屬性來斷言外掛程式已安裝：

```kotlin
@Test
fun testAccessApplicationInstance() = testApplication {
    // Configures the application
    application {
        install(CORS)
    }

    // Ensures the application is started
    startApplication()

    // Accesses the same Application instance from the test
    val app: Application = application

    assertTrue(app.pluginOrNull(CORS) != null)
}
```

### 開發模式自動重新載入迴歸 {id="regression"}

作為支援暫停函式的副作用，阻塞性函式參照（`Application::myModule`）現在在轉換期間會被包裝成匿名內部類別。這破壞了自動重新載入功能，因為函式名稱不再被保留為穩定的參照。

這意味著在 `development` 模式下的自動重新載入僅適用於 suspend 函式模組與設定參照：

```kotlin
// Suspend function reference
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// Configuration reference
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

## Ktor Client {id="ktor-client"}

### `SaveBodyPlugin` 與 `HttpRequestBuilder.skipSavingBody()` 已棄用 {id="savebodyplugin-and-httprequestbuilder-skipsavingbody-are-deprecated"}

在 Ktor 3.2.0 之前，`SaveBodyPlugin` 為預設安裝。它會將整個回應內文快取在記憶體中，以便能多次存取。為了避免儲存回應內文，必須明確停用該外掛程式。

從 Ktor 3.2.0 開始，`SaveBodyPlugin` 已被棄用，並由一個新的內部外掛程式取代，該外掛程式會自動儲存所有非串流請求的回應內文。這改善了資源管理並簡化了 HTTP 回應生命週期。

`HttpRequestBuilder.skipSavingBody()` 也已被棄用。如果你需要在不快取內文的情況下處理回應，請改用串流方式。

<compare first-title="Before" second-title="After">

```kotlin
val file = client.get("/some-file") {
    skipSavingBody()
}.bodyAsChannel()
saveFile(file)
```
```kotlin
client.prepareGet("/some-file").execute { response ->
    saveFile(response.bodyAsChannel())
}
```

</compare>

此方式會直接串流處理回應，防止內文被儲存至記憶體中。

### `.wrapWithContent()` 與 `.wrap()` 擴充函式已棄用 {id="the-wrapwithcontent-and-wrap-extension-functions-are-deprecated"}

在 Ktor 3.2.0 中，[`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) 與 [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 擴充函式已被棄用，建議改用新的 `.replaceResponse()` 函式。

`.wrapWithContent()` 與 `.wrap()` 函式會將原始回應內文替換為只能讀取一次的 `ByteReadChannel`。如果直接傳遞同一個通道執行個體，而不是傳遞傳回新通道的函式，多次讀取內文將會失敗。這可能會破壞存取回應內文的不同外掛程式之間的相容性，因為第一個讀取它的外掛程式就會消耗掉內文：

```kotlin
// Replaces the body with a channel decoded once from rawContent
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// The first call returns the body
decodedResponse.bodyAsText()

// Subsequent calls return an empty string
decodedResponse.bodyAsText() 
```

為避免此問題，請改用 `.replaceResponse()` 函式。它接受一個 Lambda，每次存取時都會傳回一個新通道，確保與其他外掛程式的安全整合：

```kotlin
// Replaces the body with a new decoded channel on each access
call.replaceResponse {
    decode(response.rawContent)
}
```

### 存取已解析的 IP 位址 {id="access-resolved-ip-address"}

現在你可以在 `io.ktor.network.sockets.InetSocketAddress` 執行個體上使用新的 `.resolveAddress()` 函式。此函式讓你可以取得關聯主機的原始已解析 IP 位址：

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

它會將解析後的 IP 位址以 `ByteArray` 形式傳回，若無法解析該位址則傳回 `null`。傳回的 `ByteArray` 大小取決於 IP 版本：IPv4 位址包含 4 個位元組，IPv6 位址包含 16 個位元組。在 JS 與 Wasm 平台上，`.resolveAddress()` 一律傳回 `null`。

### HTTP 快取清除 {id="http-cache-clearing"}

現在你可以在 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 上使用新方法，視需要在必要時清除快取的 HTTP 回應。

- `.removeAll(url)` 會移除所有與指定 URL 相符的快取項目。
- `.remove(url, varyKeys)` 會移除與指定 URL 及 `Vary` 鍵相符的特定快取項目。

這些方法為你提供了對快取失效（cache invalidation）以及如何管理過期或特定快取回應的更大控制權。

## 共用功能 {id="shared"}

### HTMX 整合 {id="htmx-integration"}

Ktor 3.2.0 引入了對 [HTMX](https://htmx.org/) 的實驗性支援，這是一個現代 JavaScript 程式庫，可透過 `hx-get` 和 `hx-swap` 等 HTML 屬性實現動態互動。Ktor 的 HTMX 整合提供：

- 支援 HTMX 感知的路由，用於根據標頭處理 HTMX 請求。
- 用於在 Kotlin 中產生 HTMX 屬性的 HTML DSL 擴充功能。
- HTMX 標頭常數與值，以消除字串常值的使用。

Ktor 的 HTMX 支援可在三個實驗性模組中使用：

| 模組 | 說明 |
|--------------------|--------------------------------------------|
| `ktor-htmx`        | 核心定義與標頭常數 |
| `ktor-htmx-html`   | 與 Kotlin HTML DSL 整合 |
| `ktor-server-htmx` | 針對 HTMX 專屬請求的路由支援 |

所有 API 均標有 `@ExperimentalKtorApi`，需要透過 `@OptIn(ExperimentalKtorApi::class)` 啟用。若要了解更多資訊，請參閱 [HTMX 整合](htmx-integration.md)。

### Unix domain socket {id="unix-domain-sockets"}

自 3.2.0 起，你可以設定 Ktor 用戶端連線至 Unix domain socket，並設定 Ktor 伺服器監聽此類通訊端。目前，Unix domain socket 僅在 CIO 引擎中受支援。

伺服器設定範例：

```kotlin
val server = embeddedServer(CIO, configure = {
    unixConnector("/tmp/test-unix-socket-ktor.sock")
}) {
    routing {
        get("/") {
            call.respondText("Hello, Unix socket world!")
        }
    }
}
```

使用 Ktor 用戶端連線至該通訊端：

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

你也可以在[預設請求](client-default-request.md#unix-domain-sockets)中使用 Unix domain socket。

### 用於建置標頭和參數的新 `.appendAll()` 多載 {id="new-appendall-overloads-for-building-headers-and-parameters"}

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 函式新增了接受 `Map` 或 `vararg Pair` 的多載。這允許你在單次呼叫中附加多個值，簡化標頭、URL 參數以及其他基於 `StringValues` 的集合之建置。

以下範例展示如何使用這些新的多載：

```kotlin
val headers = buildHeaders {
    // Using Map
    appendAll(mapOf("foo" to "bar", "baz" to "qux"))
    appendAll(mapOf("test" to listOf("1", "2", "3")))

    // Using vararg Pair
    appendAll("foo" to "bar", "baz" to "qux")
    appendAll("test" to listOf("1", "2", "3"))
}
```

## 基礎結構 {id="infrastructure"}

### 已發佈的 Version Catalog {id="published-version-catalog"}

在此版本中，你現在可以使用官方[發佈的 Version Catalog](server-dependencies.topic#using-version-catalog)，從單一來源管理所有 Ktor 相依性。這免去了在相依項中手動宣告 Ktor 版本的麻煩。

若要將目錄新增至專案中，請在 **settings.gradle.kts** 中設定 Gradle 的 version catalog，然後在模組的 **build.gradle.kts** 檔案中參照它：

<Tabs>
<TabItem title="settings.gradle.kts">

```kotlin
dependencyResolutionManagement {
    versionCatalogs {
        create("ktorLibs") {
            from("io.ktor:ktor-version-catalog:%ktor_version%")
        }
    }
}
```

</TabItem>
<TabItem title="build.gradle.kts">

```kotlin
dependencies {
    implementation(ktorLibs.client.core)
    implementation(ktorLibs.client.cio)
    // ...
}
```

</TabItem>
</Tabs>

## Gradle 外掛程式 {id="gradle-plugin"}

### 啟用開發模式 {id="enabling-development-mode"}

Ktor 3.2.0 簡化了啟用開發模式的流程。在此之前，啟用開發模式需要在 `application` 區塊中進行明確設定。現在，你可以使用 `ktor.development` 屬性動態或明確地啟用它：

* 根據專案屬性動態啟用開發模式。
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 明確將開發模式設定為 true。

    ```kotlin
    ktor {
        development = true
    }
    ```

預設情況下，如果定義了 Gradle 專案屬性或系統屬性 `io.ktor.development`，`ktor.development` 的值將自動從中解析。這讓你可以直接使用 Gradle CLI 旗標啟用開發模式：

```bash
./gradlew run -Pio.ktor.development=true
```