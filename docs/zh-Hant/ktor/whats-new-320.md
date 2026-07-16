[//]: # (title: Ktor 3.2.0 新功能)

<show-structure for="chapter,procedure" depth="2"/>

_[發佈日期：2025 年 6 月 12 日](releases.md#release-details)_

以下是此功能版本的重點摘錄：

* [版本目錄](#published-version-catalog)
* [相依注入](#dependency-injection)
* [一等 HTMX 支援](#htmx-integration)
* [可暫停的模組函式](#suspendable-module-functions)

## Ktor Server

### 可暫停的模組函式

從 Ktor 3.2.0 開始，[應用程式模組](server-modules.md) 已支援可暫停的函式。

> 隨著暫停模組支援的引入，開發模式（development mode）中的自動重新載入（auto-reload）將不再適用於阻塞函式參考。如需更多資訊，請參閱 [開發模式自動重新載入迴歸](#regression)。
>
{style="warning"}

以前，在 Ktor 模組中加入非同步函式需要使用 `runBlocking` 區塊，這可能會導致伺服器建立時發生死結：

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

您現在可以使用 `suspend` 關鍵字，允許在應用程式啟動時執行非同步程式碼：

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### 並行模組載入

您也可以透過新增 `ktor.application.startup = concurrent` 的 Gradle 屬性來選擇啟用並行模組載入。它會獨立啟動所有應用程式模組，因此當一個模組暫停時，其他模組不會被阻塞。這允許相依注入進行非循序載入，且在某些情況下可以加快載入速度。

如需更多資訊，請參閱 [並行模組](server-modules.md#concurrent-modules)。

### 配置檔案反序列化

Ktor 3.2.0 在 `Application` 類別上引入了新的 `.property()` 擴充功能來支援型別化配置載入。您現在可以將結構化的配置區段直接反序列化為 Kotlin 資料類別。

此功能簡化了存取配置值的方式，並顯著減少了處理巢狀或分組設定時的樣板程式碼。

考慮以下 **application.yaml** 檔案：

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

以前，您必須個別檢索每個配置值。透過新的 `.property()` 擴充功能，您可以一次載入整個配置區段：

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // 使用配置&#10;}"></code-block>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // 使用配置&#10;}"></code-block>
</compare>

此功能同時支援 HOCON 與 YAML 配置格式，並使用 `kotlinx.serialization` 進行反序列化。

### `ApplicationTestBuilder` 具有可配置的 `client`

從 Ktor 3.2.0 開始，`ApplicationTestBuilder` 類別中的 `client` 屬性是可變的。以前它是唯讀的。這項變更讓您可以配置自己的測試用戶端，並在任何提供 `ApplicationTestBuilder` 類別的地方重複使用。例如，您可以從擴充函式中存取該用戶端：

```kotlin
@Test
fun testRouteAfterAuthorization() = testApplication {
    // 預先配置用戶端
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
            
        defaultRequest { 
            contentType(ContentType.Application.Json)
        }
    }

    // 將可重複使用的測試步驟提取到擴充函式中
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

### 相依注入

Ktor 3.2.0 引入了相依注入（DI）支援，讓直接從配置檔案和應用程式程式碼中管理與連線相依性變得更加容易。新的 DI 外掛程式簡化了相依性解析、支援非同步載入、提供自動清理，並與測試順暢整合。

<var name="artifact_name" value="ktor-server-di" />

若要使用 DI，請在建置指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

#### 基本相依性註冊

您可以使用 Lambda、函式參考或建構函式參考來註冊相依性：

```kotlin
dependencies {
  // 基於 Lambda
  provide<GreetingService> { GreetingServiceImpl() }

  // 函式參考
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // 將 Lambda 註冊為相依性
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 基於配置的相依性註冊

您可以使用配置檔案中的類別路徑（classpath）參考來宣告式地配置相依性。這支援函式與類別參考：

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
  // 實作 
}
```

引數會透過 `@Property` 與 `@Named` 等註解自動解析。

#### 相依性解析與注入

##### 解析相依性

若要解析相依性，您可以使用屬性委派或直接解析：

```kotlin
// 使用屬性委派
val service: GreetingService by dependencies

// 直接解析
val service = dependencies.resolve<GreetingService>()
```

##### 非同步相依性解析

若要支援非同步載入，您可以使用暫停函式：

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // 會暫停直到提供為止
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI 外掛程式會自動暫停 `resolve()` 呼叫，直到所有相依性準備就緒。

##### 注入至應用程式模組

您可以透過指定模組參數將相依性直接注入到應用程式模組中。Ktor 會從 DI 容器中解析它們：

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

使用 `@Named` 來注入特定的具名相依性：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // 使用名為 "mongo" 的相依性
}
```

##### 屬性與配置注入

使用 `@Property` 直接注入配置值：

```yaml
connection:
  domain: api.example.com
  path: /v1
  protocol: https
```

```kotlin
val connection: Connection = application.property("connection")
```

這簡化了處理結構化配置的工作，並支援原始型別的自動剖析。

如需更多資訊和進階用法，請參閱 [相依注入](server-dependency-injection.md)。

### 在 `testApplication` 中存取應用程式執行個體

您現在可以使用 `ApplicationTestBuilder.application` 屬性，直接從 `testApplication {}` 區塊存取執行中的 `Application` 執行個體。

以前，`Application` 執行個體僅在巢狀的 `application {}` 配置區塊內可用，這使得之後在測試中引用應用程式變得很困難。新的 `application` 屬性在配置和啟動後公開了相同的執行個體。

以下範例使用 `application` 屬性來斷言外掛程式是否已安裝：

```kotlin
@Test
fun testAccessApplicationInstance() = testApplication {
    // 配置應用程式
    application {
        install(CORS)
    }

    // 確保應用程式已啟動
    startApplication()

    // 從測試中存取相同的 Application 執行個體
    val app: Application = application

    assertTrue(app.pluginOrNull(CORS) != null)
}
```

### 開發模式自動重新載入迴歸 {id="regression"}

作為支援暫停函式的副作用，阻塞函式參考（`Application::myModule`）現在在轉型過程中會被包裝成匿名內部類別。這會破壞自動重新載入，因為函式名稱不再被保留為穩定的參考。

這意味著 `development` 模式下的自動重新載入僅適用於暫停函式模組與配置參考：

```kotlin
// 暫停函式參考
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 配置參考
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

## Ktor Client

### `SaveBodyPlugin` 與 `HttpRequestBuilder.skipSavingBody()` 已遭棄用

在 Ktor 3.2.0 之前，`SaveBodyPlugin` 是預設安裝的。它會將整個回應主體快取在記憶體中，以便多次存取。為了避免儲存回應主體，必須明確停用該外掛程式。

從 Ktor 3.2.0 開始，`SaveBodyPlugin` 已遭棄用，並由一個新的內部外掛程式取代，該外掛程式會自動為所有非串流請求儲存回應主體。這改善了資源管理並簡化了 HTTP 回應生命週期。

`HttpRequestBuilder.skipSavingBody()` 也已遭棄用。如果您需要在不快取主體的情況下處理回應，請改用串流方式。

<compare first-title="之前" second-title="之後">

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

這種方法會直接串流回應，防止主體被儲存在記憶體中。

### `.wrapWithContent()` 與 `.wrap()` 擴充函式已遭棄用

在 Ktor 3.2.0 中，[`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) 與 [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 擴充函式已遭棄用，建議改用新的 `.replaceResponse()` 函式。

`.wrapWithContent()` 與 `.wrap()` 函式會將原始回應主體替換為僅能讀取一次的 `ByteReadChannel`。如果直接傳遞相同的通道執行個體，而不是傳回新通道的函式，則多次讀取主體將會失敗。這可能會破壞存取回應主體的不同外掛程式之間的相容性，因為第一個讀取它的外掛程式會消耗掉主體：

```kotlin
// 用從 rawContent 解碼一次的通道替換主體
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// 第一次呼叫會傳回主體
decodedResponse.bodyAsText()

// 後續呼叫會傳回空字串
decodedResponse.bodyAsText() 
```

若要避免此問題，請改用 `.replaceResponse()` 函式。它接受一個在每次存取時傳回新通道的 Lambda，確保與其他外掛程式的安全整合：

```kotlin
// 每次存取時都用新的解碼通道替換主體
call.replaceResponse {
    decode(response.rawContent)
}
```

### 存取已解析的 IP 位址

您現在可以在 `io.ktor.network.sockets.InetSocketAddress` 執行個體上使用新的 `.resolveAddress()` 函式。此函式允許您獲取相關主機原始解析出的 IP 位址：

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

它會以 `ByteArray` 形式傳回解析後的 IP 位址，如果無法解析位址則傳回 `null`。傳回的 `ByteArray` 大小取決於 IP 版本：IPv4 位址包含 4 個位元組，IPv6 位址包含 16 個位元組。在 JS 與 Wasm 平台上，`.resolveAddress()` 將始終傳回 `null`。

### HTTP 快取清理

您現在可以在 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 上使用新方法，以便在需要時清理快取的 HTTP 回應。

- `.removeAll(url)` 會移除所有符合指定 URL 的快取項目。
- `.remove(url, varyKeys)` 會移除符合給定 URL 與 `Vary` 鍵值的特定快取項目。

這些方法為您提供了更多關於快取失效（invalidation）以及如何管理過時或特定快取回應的控制權。

## Shared

### HTMX 整合

Ktor 3.2.0 引入了對 [HTMX](https://htmx.org/) 的實驗性支援，這是一個現代 JavaScript 程式庫，可透過 `hx-get` 與 `hx-swap` 等 HTML 屬性實現動態互動。Ktor 的 HTMX 整合提供：

- 識別 HTMX 的路由，用於根據標頭處理 HTMX 請求。
- HTML DSL 擴充，用於在 Kotlin 中產生 HTMX 屬性。
- HTMX 標頭常數與值，以消除字串常值。

Ktor 的 HTMX 支援可在三個實驗性模組中使用：

| 模組 | 描述 |
|--------------------|--------------------------------------------|
| `ktor-htmx` | 核心定義與標頭常數 |
| `ktor-htmx-html` | 與 Kotlin HTML DSL 的整合 |
| `ktor-server-htmx` | 針對 HTMX 特定請求的路由支援 |

所有 API 都標記為 `@ExperimentalKtorApi`，且需要透過 `@OptIn(ExperimentalKtorApi::class)` 選擇啟用。如需更多資訊，請參閱 [HTMX 整合](htmx-integration.md)。

### Unix 網域通訊端

透過 3.2.0，您可以設定 Ktor 用戶端連線至 Unix 網域通訊端（Unix domain sockets），並設定 Ktor 伺服器監聽此類通訊端。目前，Unix 網域通訊端僅在 CIO 引擎中受支援。

伺服器配置範例：

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

您也可以在 [預設請求](client-default-request.md#unix-domain-sockets) 中使用 Unix 網域通訊端。

### 用於建置標頭與參數的新 `.appendAll()` 多載

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 函式具有接受 `Map` 或 `vararg Pair` 的新多載。這讓您可以在單次呼叫中附加多個值，簡化了標頭、URL 參數以及其他基於 `StringValues` 的集合之建構。

以下範例展示如何使用這些新多載：

```kotlin
val headers = buildHeaders {
    // 使用 Map
    appendAll(mapOf("foo" to "bar", "baz" to "qux"))
    appendAll(mapOf("test" to listOf("1", "2", "3")))

    // 使用 vararg Pair
    appendAll("foo" to "bar", "baz" to "qux")
    appendAll("test" to listOf("1", "2", "3"))
}
```

## Infrastructure

### 發佈的版本目錄

隨此版本發佈，您現在可以使用官方的 [發佈的版本目錄](server-dependencies.topic#using-version-catalog) 從單一來源管理所有 Ktor 相依性。這消除了在相依性中手動宣告 Ktor 版本的需求。

若要將目錄新增至您的專案，請在 **settings.gradle.kts** 中配置 Gradle 的版本目錄，然後在模組的 **build.gradle.kts** 檔案中引用它：

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

## Gradle 外掛程式

### 啟用開發模式

Ktor 3.2.0 簡化了開發模式的啟用。以前，啟用開發模式需要在 `application` 區塊中進行明確配置。現在，您可以使用 `ktor.development` 屬性來啟用它，無論是動態還是明確設定：

* 根據專案屬性動態啟用開發模式。
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 將開發模式明確設定為 true。

    ```kotlin
    ktor {
        development = true
    }
    ```

預設情況下，`ktor.development` 的值會自動從 Gradle 專案屬性或系統屬性 `io.ktor.development`（如果兩者任一已定義）中解析。這讓您可以直接使用 Gradle CLI 旗標啟用開發模式：

```bash
./gradlew run -Pio.ktor.development=true