[//]: # (title: 從 2.2.x 遷移至 3.0.x)

<show-structure for="chapter" depth="3"/>

本指南提供有關如何將您的 Ktor 應用程式從 2.2.x 版本遷移至 3.0.x 的說明。

## Ktor Server {id="server"}

### `ApplicationEngine`、`ApplicationEnvironment` 與 `Application`

我們引入了多項設計變更，以改進可設定性，並在 `ApplicationEngine`、`ApplicationEnvironment` 與 `Application` 執行個體之間提供更明確的分隔。

在 v3.0.0 之前，`ApplicationEngine` 管理 `ApplicationEnvironment`，而後者又負責管理 `Application`。

然而在目前的設計中，`Application` 負責建立、擁有並初始化 `ApplicationEngine` 與 `ApplicationEnvironment`。

此結構重整帶來了以下一系列的重大變更 (breaking changes)：

- [`ApplicationEngineEnvironmentBuilder` 與 `applicationEngineEnvironment` 類別已重新命名](#renamed-classes)。
- [`start()` 與 `stop()` 方法已從 `ApplicationEngineEnvironment` 中移除](#ApplicationEnvironment)。
- [`commandLineEnvironment()` 已移除](#CommandLineConfig)。
- [引入 `ServerConfigBuilder`](#ServerConfigBuilder)。
- [`embeddedServer()` 傳回 `EmbeddedServer`](#EmbeddedServer) 而非 `ApplicationEngine`。

這些變更將影響依賴於先前模型的現有原始碼。

#### 重新命名的類別 {id="renamed-classes"}

| 套件 | 2.x.x | 3.0.x |
|----------------------------|---------------------------------------|---------------------------------|
| `io.ktor:ktor-server-core` | `ApplicationEngineEnvironmentBuilder` | `ApplicationEnvironmentBuilder` |
| `io.ktor:ktor-server-core` | `applicationEngineEnvironment`        | `applicationEnvironment`        |

#### `start()` 與 `stop()` 方法已從 `ApplicationEngineEnvironment` 中移除 {id="ApplicationEnvironment"}

隨著 `ApplicationEngineEnvironment` 合併至 [`ApplicationEnvironment`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/index.html)，`start()` 與 `stop()` 方法現在只能透過 [`ApplicationEngine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/index.html) 存取。

| 2.x.x                                                 | 3.0.x                                |
|-------------------------------------------------------|--------------------------------------|
| `ApplicationEngineEnvironment.start()`                | `ApplicationEngine.start()`          |
| `ApplicationEngineEnvironment.stop()`                 | `ApplicationEngine.stop()`           |

此外，在下表中您可以看到已移除的屬性清單及其目前對應的擁有權：

| 2.x.x                                           | 3.0.x                                        |
|-------------------------------------------------|----------------------------------------------|
| `ApplicationEngineEnvironment.connectors`       | `ApplicationEngine.Configuration.connectors` |
| `ApplicationEnvironment.developmentMode`        | `Application.developmentMode`                |
| `ApplicationEnvironment.monitor`                | `Application.monitor`                        |
| `ApplicationEnvironment.parentCoroutineContext` | `Application.parentCoroutineContext`         |
| `ApplicationEnvironment.rootPath`               | `Application.rootPath`                       |

擁有權的變更可透過以下範例說明：

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import org.slf4j.helpers.NOPLogger

fun defaultServer(module: Application.() -> Unit) =
  embeddedServer(CIO,
    environment = applicationEngineEnvironment {
      log = NOPLogger.NOP_LOGGER
      connector { 
          port = 8080
      }
      module(module)
    }
  )
```

{validate="false"}

```kotlin
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import org.slf4j.helpers.NOPLogger

fun defaultServer(module: Application.() -> Unit) =
  embeddedServer(CIO,
    environment = applicationEnvironment { log = NOPLogger.NOP_LOGGER },
    configure = {
      connector {
          port = 8080
      }
    },
    module
  )
```

</compare>

#### `commandLineEnvironment()` 已移除 {id="CommandLineConfig"}

用於從命令列引數建立 `ApplicationEngineEnvironment` 執行個體的 `commandLineEnvironment()` 函式已在 Ktor `3.0.0` 中移除。取而代之的是，您可以使用 [`CommandLineConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html) 函式將命令列引數剖析為組態物件。

若要將您的應用程式從 `commandLineEnvironment` 遷移至 `CommandLineConfig`，請將 `commandLineEnvironment()` 替換為如下所示的 `configure` 區塊。

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, commandLineEnvironment(args) {
        connector { port = 8080 }
        module {
            routing {
                get("/") {
                    call.respondText("Hello, world!")
                }
            }
        }
    }) {
        requestReadTimeoutSeconds = 5
        responseWriteTimeoutSeconds = 5
    }.start(wait = true)
}
```

```kotlin
fun main(args: Array<String>) {
    embeddedServer(
        factory = Netty,
        configure = {
            val cliConfig = CommandLineConfig(args)
            takeFrom(cliConfig.engineConfig)
            loadCommonConfiguration(cliConfig.rootConfig.environment.config)
        }
    ) {
        routing {
            get("/") {
                call.respondText("Hello, world!")
            }
        }
    }.start(wait = true)
}
```

</compare>

如需更多關於使用 `embeddedServer` 進行命令列組態的資訊，請參閱[程式碼中的組態](server-configuration-code.topic#command-line)主題。

#### 引入 `ServerConfigBuilder` {id="ServerConfigBuilder"}

我們引入了一個新的實體 [`ServerConfigBuilder`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config-builder/index.html) 用於設定伺服器屬性，並取代了先前的 `ApplicationPropertiesBuilder` 組態機制。
`ServerConfigBuilder` 用於建置 [`ServerConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config/index.html) 類別的執行個體，該類別現在持有先前由 `ApplicationProperties` 管理的模組、路徑與環境詳細資訊。

下表總結了關鍵變更：

| 套件 | 2.x.x | 3.0.x |
|----------------------------|--------------------------------|-----------------------|
| `io.ktor:ktor-server-core` | `ApplicationProperties` | `ServerConfig` |
| `io.ktor:ktor-server-core` | `ApplicationPropertiesBuilder` | `ServerConfigBuilder` |

此外，在 `embeddedServer()` 函式中，`applicationProperties` 屬性已重新命名為 `rootConfig`，以反映此新組態方法。

使用 `embeddedServer()` 時，請將 `applicationProperties` 屬性替換為 `rootConfig`。
以下是使用 `serverConfig` 區塊將伺服器的 `developmentMode` 明確設定為 `true` 的範例：

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty,
        serverConfig {
            developmentMode = true
            module(Application::module)
        },
        configure = {
            connector { port = 12345 }
        }
    ).start(wait = true)
}
```

#### 引入 `EmbeddedServer` {id="EmbeddedServer"}

引入了 [`EmbeddedServer`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-embedded-server/index.html) 類別，並用來取代 `ApplicationEngine` 作為 `embeddedServer()` 函式的傳回型別。

如需更多關於模型變更的詳細資訊，請參閱 [YouTrack 上的問題 KTOR-3857](https://youtrack.jetbrains.com/issue/KTOR-3857/Environment-Engine-Application-Design)。

### 測試

##### `withTestApplication` 與 `withApplication` 已移除

`withTestApplication` 與 `withApplication` 函式（[先前已在 `2.0.0` 版本中棄用](migration-to-20x.md#testing-api)）現在已從 `ktor-server-test-host` 套件中移除。

取而代之的是，請使用 `testApplication` 函式搭配現有的 [Ktor 用戶端](client-create-and-configure.md)執行個體，對您的伺服器發出請求並驗證結果。

在下方的測試中，`handleRequest` 函式被替換為 `client.get` 請求：

<compare first-title="1.x.x" second-title="3.0.x">

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

```kotlin
@Test
fun testRoot() = testApplication {
    val response = client.get("/")
    assertEquals(HttpStatusCode.OK, response.status)
    assertEquals("Hello, world!", response.bodyAsText())
}
```

</compare>

如需更多資訊，請參閱 [Ktor Server 中的測試](server-testing.md)。

#### `TestApplication` 模組載入 {id="test-module-loading"}

`TestApplication` 不再自動從組態檔案（例如 `application.conf`）載入模組。取而代之的是，您必須在 `testApplication` 函式中[明確載入模組](#explicit-module-loading)，或手動[載入組態檔案](#configure-env)。

##### 明確模組載入 {id="explicit-module-loading"}

若要明確載入模組，請在 `testApplication` 中使用 `application` 函式。此方法允許您手動指定要載入哪些模組，從而更好地控制您的測試設定。

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
  @Test
  fun testRoot() = testApplication {
    client.get("/").apply {
      assertEquals(HttpStatusCode.OK, status)
      assertEquals("Hello World!", bodyAsText())
    }
  }
}
```

{validate="false"}

```kotlin
import com.example.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
  @Test
  fun testRoot() = testApplication {
    application {
      configureRouting()
    }
    client.get("/").apply {
      assertEquals(HttpStatusCode.OK, status)
      assertEquals("Hello World!", bodyAsText())
    }
  }
}

```

{validate="false"}

</compare>

##### 從組態檔案載入模組 {id="configure-env"}

如果您想從組態檔案載入模組，請使用 `environment` 函式為您的測試指定組態檔案。

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

如需更多關於設定測試應用程式的資訊，請參閱 [Ktor Server 中的測試](server-testing.md) 章節。

### `CallLogging` 外掛程式套件已重新命名

由於拼字錯誤，[`CallLogging`](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/index.html) 外掛程式套件已重新命名。

| 2.x.x                               | 3.0.x                                |
|-------------------------------------|--------------------------------------|
| `io.ktor.server.plugins.callloging` | `io.ktor.server.plugins.calllogging` |

### `ktor-server-host-common` 模組已移除

由於 `Application` 需要了解 `ApplicationEngine`，`ktor-server-host-common` 模組的內容已併入 `ktor-server-core`，即 [`io.ktor.server.engine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/index.html) 套件。

請確保您的相依性已相應更新。在大多數情況下，您只需移除 `ktor-server-host-common` 相依性即可。

### `Locations` 外掛程式已移除

Ktor 伺服器的 `Locations` 外掛程式已移除。若要建立型別安全的路由，請改用 [Resources 外掛程式](server-resources.md)。這需要以下變更：

* 將 `io.ktor:ktor-server-locations` 構件替換為 `io.ktor:ktor-server-resources`。

* `Resources` 外掛程式相依於 Kotlin 序列化外掛程式。若要新增序列化外掛程式，請參閱 [kotlinx.serialization 設定](https://github.com/Kotlin/kotlinx.serialization#setup)。

* 將外掛程式匯入從 `io.ktor.server.locations.*` 更新為 `io.ktor.server.resources.*`。

* 此外，從 `io.ktor.resources` 匯入 `Resource` 模組。

以下範例顯示如何實作這些變更：

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
import io.ktor.server.locations.*

@Location("/articles")
class article(val value: Int)

fun Application.module() {
    install(Locations)
    routing {
        get<article> {
            // Get all articles ...
            call.respondText("List of articles")
        }
    }
}
```

```kotlin
import io.ktor.resources.Resource
import io.ktor.server.resources.*

@Resource("/articles")
class Articles(val value: Int)

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> {
            // Get all articles ...
            call.respondText("List of articles")
        }
    }
}
```

</compare>

如需更多關於使用 `Resources` 的資訊，請參閱[型別安全路由](server-resources.md)。

### WebSockets 組態中 `java.time` 的替換

[WebSockets](server-websockets.md) 外掛程式組態已更新，改用 Kotlin 的 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 來設定 `pingPeriod` 與 `timeout` 屬性。這取代了先前使用的 `java.time.Duration`，以提供更符合 Kotlin 習慣的體驗。

若要將現有程式碼遷移至新格式，請使用 `kotlin.time.Duration` 類別的擴充函式與屬性來建構時間長度。在以下範例中，`Duration.ofSeconds()` 被替換為 Kotlin 的 `seconds` 擴充屬性：

<compare first-title="2.x.x" second-title="3.0.x">

```kotlin
import java.time.Duration
  
install(WebSockets) {
    pingPeriod = Duration.ofSeconds(15)
    timeout = Duration.ofSeconds(15)
    //..
}
```

```kotlin
import kotlin.time.Duration.Companion.seconds

install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    //..
}
```

</compare>

您可以根據需要對其他時間長度組態使用類似的 Kotlin 時間擴充屬性（`minutes`、`hours` 等）。如需更多資訊，請參閱 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 文件。

### 伺服器通訊端 `.bind()` 現在為掛起函式

為了支援 JS 與 WasmJS 環境中的非同步操作，[`TCPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-tcp-socket-builder/index.html) 與 [`UDPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-u-d-p-socket-builder/index.html) 中伺服器通訊端的 `.bind()` 函式已更新為掛起函式 (suspending function)。這意味著現在必須在協同程式內呼叫 `.bind()`。

若要遷移，請確保僅在協同程式或掛起函式中呼叫 `.bind()`。以下是使用 `runBlocking` 的範例：

```kotlin
  runBlocking {
    val selectorManager = SelectorManager(Dispatchers.IO)
    val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
    //...
}
```

如需更多關於使用通訊端的資訊，請參閱 [Sockets 文件](server-sockets.md)。

## 多部分表單資料 (Multipart form data)

### 二進位與檔案項目的新預設限制

在 Ktor 3.0.0 中，使用 [`ApplicationCall.receiveMultipart()`](https://api.ktor.io/3.0.x/ktor-server-core/io.ktor.server.request/receive-multipart.html) 接收二進位與檔案項目時引入了 50 MB 的預設限制。如果接收到的檔案或二進位項目超過 50 MB 的限制，則會擲回 `IOException`。

#### 覆寫預設限制

如果您的應用程式先前依賴於處理大於 50 MB 的檔案且未進行明確組態，您將需要更新程式碼以避免非預期的行為。

若要覆寫預設限制，請在呼叫 `.receiveMultipart()` 時傳遞 `formFieldLimit` 參數：

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

### `PartData.FileItem.streamProvider()` 已棄用

在先前的 Ktor 版本中，`PartData.FileItem` 中的 `.streamProvider()` 函式用於將檔案項目的內容作為 `InputStream` 存取。從 Ktor 3.0.0 開始，此函式已棄用。

若要遷移您的應用程式，請將 `.streamProvider()` 替換為 [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 函式。`.provider()` 函式會傳回一個 `ByteReadChannel`，這是一個對協同程式友善、非阻塞的抽象，用於增量讀取位元組串流。
接著您可以使用 `ByteReadChannel` 提供的 [`.copyTo()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-to.html) 或 [`.copyAndClose()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-and-close.html) 方法，將資料直接從通道串流傳輸至檔案輸出。

在此範例中，`.copyAndClose()` 方法將資料從 `ByteReadChannel` 傳輸至檔案的 `WritableByteChannel`。

<compare first-title="2.x.x" second-title="3.0.x">

```kotlin
fun Application.main() {
    routing {
        post("/upload") {
            val multipart = call.receiveMultipart()
            multipart.forEachPart { partData ->
                if (partData is PartData.FileItem) {
                    var fileName = partData.originalFileName as String
                    val file = File("uploads/$fileName")
                    file.writeBytes(partData.streamProvider().readBytes())
                }
                // ...
            }
        }
    }
}
```

```kotlin
fun Application.main() {
    routing {
        post("/upload") {
            val multipart = call.receiveMultipart()
            multipart.forEachPart { partData ->
                if (partData is PartData.FileItem) {
                    var fileName = partData.originalFileName as String
                    val file = File("uploads/$fileName")
                    partData.provider().copyAndClose(file.writeChannel())
                }
                // ...
            }
        }
    }
}
```

</compare>

如需完整範例以及更多關於處理多部分表單資料的資訊，請參閱[多部分表單資料的請求處理](server-requests.md#form_data)。

### 工作階段加密方法更新

`Sessions` 外掛程式提供的加密方法已更新以增強安全性。

具體而言，`SessionTransportTransformerEncrypt` 方法先前是從解密後的工作階段值衍生 MAC，現在則是從加密後的值計算。

為確保與現有工作階段的相容性，Ktor 引入了 `backwardCompatibleRead` 屬性。對於目前的組態，請在 `SessionTransportTransformerEncrypt` 的建構函式中包含此屬性：

```kotlin
install(Sessions) {
  cookie<UserSession>("user_session") {
    // ...
    transform(
      SessionTransportTransformerEncrypt(
        secretEncryptKey, // 此處填寫您的加密金鑰
        secretSignKey, // 此處填寫您的簽署金鑰
        backwardCompatibleRead = true
      )
    )
  }
}
```

如需更多關於 Ktor 中工作階段加密的資訊，請參閱[簽署並加密工作階段資料](server-sessions.md#sign_encrypt_session)。

## Ktor Client

### `HttpResponse` 的 `content` 屬性重新命名

在 Ktor 3.0.0 之前，[`HttpResponse`](https://api.ktor.io/ktor-client-core/io.ktor.client.statement/-http-response/index.html) 的 `content` 屬性提供了一個原始的 `ByteReadChannel`，用於讀取來自網路的回應內容。從 Ktor 3.0.0 開始，`content` 屬性已重新命名為 `rawContent`，以更精確地反映其用途。

### `SocketTimeoutException` 現在是一個型別別名

來自 `io.ktor.client.network.sockets` 套件的 [`SocketTimeoutException`](https://api.ktor.io/3.0.x/ktor-client-core/io.ktor.client.network.sockets/-socket-timeout-exception/index.html) 已從 Kotlin 類別轉換為 Java 類別的別名。此變更在某些情況下可能會導致 `NoClassDefFoundError`，並可能需要更新現有程式碼。

若要遷移您的應用程式，請確保您的程式碼未引用舊類別，並且使用最新的 Ktor 版本進行編譯。以下是更新例外檢查的方法：

<compare type="top-bottom" first-title="2.x.x" second-title="3.0.x">
    <code-block lang="kotlin" code="    if (exception is io.ktor.client.network.sockets.SocketTimeoutException) { ... }"></code-block>
    <code-block lang="kotlin" code="    if (exception is java.net.SocketTimeoutException) { ... }"></code-block>
</compare>

## 共用模組 (Shared modules)

### 遷移至 `kotlinx-io`

隨著 3.0.0 版本的發布，Ktor 已轉向使用 `kotlinx-io` 程式庫，該程式庫在 Kotlin 各個程式庫之間提供了標準化且高效的 I/O API。此變更提高了效能、減少了記憶體分配，並簡化了 I/O 處理。如果您的專案與 Ktor 的底層 I/O API 互動，您可能需要更新程式碼以確保相容性。

這影響了許多類別，例如 [`ByteReadChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-read-channel.html) 與 [`ByteWriteChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)。此外，以下 Ktor 類別現在由 `kotlinx-io` 支援，其先前的實作已被棄用：

| Ktor 2.x | Ktor 3.x |
|-------------------------------------------|---------------------------|
| `io.ktor.utils.io.core.Buffer` | `kotlinx.io.Buffer` |
| `io.ktor.utils.io.core.BytePacketBuilder` | `kotlinx.io.Sink` |
| `io.ktor.utils.io.core.ByteReadPacket` | `kotlinx.io.Source` |
| `io.ktor.utils.io.core.Input` | `kotlinx.io.Source` |
| `io.ktor.utils.io.core.Output` | `kotlinx.io.Sink` |
| `io.ktor.utils.io.core.Sink` | `kotlinx.io.Buffer` |
| `io.ktor.utils.io.errors.EOFException` | `kotlinx.io.EOFException` |
| `io.ktor.utils.io.errors.IOException` | `kotlinx.io.IOException` |

棄用的 API 將被支援至 Ktor 4.0，但我們建議您儘早進行遷移。若要遷移您的應用程式，請更新您的程式碼以使用來自 `kotlinx-io` 的對應方法。

#### 範例：串流 I/O

如果您正在處理大型檔案下載並需要高效的串流解決方案，您可以將手動位元組陣列處理替換為 `kotlinx-io` 優化的串流 API。

在 Ktor 2.x 中，處理大型檔案下載通常涉及使用 `ByteReadChannel.readRemaining()` 手動讀取可用位元組，並使用 `File.appendBytes()` 將其寫入檔案：

```Kotlin
val client = HttpClient(CIO)
val file = File.createTempFile("files", "index")

runBlocking {
    client.prepareGet("https://ktor.io/").execute { httpResponse ->
        val channel: ByteReadChannel = httpResponse.body()
        while (!channel.isClosedForRead) {
            val packet = channel.readRemaining(DEFAULT_BUFFER_SIZE.toLong())
            while (!packet.isEmpty) {
                val bytes = packet.readBytes()
                file.appendBytes(bytes)
                println("Received ${file.length()} bytes from ${httpResponse.contentLength()}")
            }
        }
        println("A file saved to ${file.path}")
    }
}
```

這種方法涉及多次記憶體分配與多餘的資料複製。

在 Ktor 3.x 中，`ByteReadChannel.readRemaining()` 現在會傳回一個 `Source`，從而可以使用 `Source.transferTo()` 進行資料串流：

```Kotlin
    val client = HttpClient(CIO)
    val file = File.createTempFile("files", "index")
    val stream = file.outputStream().asSink()
    val fileSize = 100 * 1024 * 1024
    val bufferSize: Long = 1024 * 1024

    runBlocking {
        client.prepareGet("https://httpbin.org/bytes/$fileSize").execute { httpResponse ->
            val channel: ByteReadChannel = httpResponse.body()
            var count = 0L
            stream.use {
                while (!channel.exhausted()) {
                    val chunk = channel.readRemaining(bufferSize)
                    count += chunk.remaining

                    chunk.transferTo(stream)
                    println("Received $count bytes from ${httpResponse.contentLength()}")
                }
            }
        }

        println("A file saved to ${file.path}")
    }
```

此方法將資料直接從通道傳輸至檔案的接收器 (sink)，從而大幅減少記憶體分配並提高效能。

如需完整範例，請參閱 [client-download-streaming](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-download-streaming)。

> 如需更多關於 API 替換的詳細資訊，請參閱 [`kotlinx-io` 文件](https://kotlinlang.org/api/kotlinx-io/)。

### 屬性金鑰現在需要精確的型別比對

在 Ktor 3.0.0 中，[`AttributeKey`](https://api.ktor.io/3.0.x/ktor-utils/io.ktor.util/-attribute-key.html) 執行個體現在透過識別 (identity) 進行比較，且在儲存與檢索值時需要精確的型別比對。這確保了型別安全性並防止因型別不符而導致的非預期行為。

先前，擷取屬性時使用的泛型型別可能與儲存時不同，例如使用 `getOrNull<Any>()` 來獲取 `AttributeKey<Boolean>`。

若要遷移您的應用程式，請確保擷取型別與儲存型別完全相符：

```kotlin
val attrs = Attributes()

attrs.put(AttributeKey<Boolean>("key"), true)
attrs.getOrNull<Boolean>("key")
```

### 移除空白構件

自 Ktor 1.0.0 以來，空白構件 `io.ktor:ktor` 曾被誤發布至 [Maven](https://repo1.maven.org/maven2/io/ktor/ktor/)。從 Ktor 3.0.0 開始，該構件已被移除。

如果您的專案將此構件作為相依性包含在內，您可以安全地將其移除。