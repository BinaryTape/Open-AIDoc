[//]: # (title: 从 2.2.x 迁移到 3.0.x)

<show-structure for="chapter" depth="3"/>

本指南提供有关如何将 Ktor 应用程序从 2.2.x 版本迁移到 3.0.x 的说明。

## Ktor Server {id="server"}

### `ApplicationEngine`、`ApplicationEnvironment` 和 `Application`

引入了几项设计变更，以提高可配置性，并在 `ApplicationEngine`、`ApplicationEnvironment` 和 `Application` 实例之间提供更明确的分隔。

在 v3.0.0 之前，`ApplicationEngine` 管理 `ApplicationEnvironment`，而后者又管理 `Application`。

然而，在当前设计中，`Application` 负责创建、拥有并初始化 `ApplicationEngine` 和 `ApplicationEnvironment`。

这种重构带来了一系列破坏性变更：

- [`ApplicationEngineEnvironmentBuilder` 和 `applicationEngineEnvironment` 类已重命名](#renamed-classes)。
- [`ApplicationEngineEnvironment` 中移除了 `start()` 和 `stop()` 方法](#ApplicationEnvironment)。
- [`commandLineEnvironment()` 已移除](#CommandLineConfig)。
- [引入 `ServerConfigBuilder`](#ServerConfigBuilder)。
- [`embeddedServer()` 返回 `EmbeddedServer`](#EmbeddedServer) 而非 `ApplicationEngine`。

这些变更将影响依赖于先前模型的现有代码。

#### 已重命名的类 {id="renamed-classes"}

| 软件包 | 2.x.x | 3.0.x |
|----------------------------|---------------------------------------|---------------------------------|
| `io.ktor:ktor-server-core` | `ApplicationEngineEnvironmentBuilder` | `ApplicationEnvironmentBuilder` |
| `io.ktor:ktor-server-core` | `applicationEngineEnvironment`        | `applicationEnvironment`        |

#### `ApplicationEngineEnvironment` 中移除了 `start()` 和 `stop()` 方法 {id="ApplicationEnvironment"}

随着 `ApplicationEngineEnvironment` 合并到 [`ApplicationEnvironment`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/index.html)，`start()` 和 `stop()` 方法现在只能通过 [`ApplicationEngine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/index.html) 访问。

| 2.x.x | 3.0.x |
|-------------------------------------------------------|--------------------------------------|
| `ApplicationEngineEnvironment.start()`                | `ApplicationEngine.start()`          |
| `ApplicationEngineEnvironment.stop()`                 | `ApplicationEngine.stop()`           |

此外，在下表中，您可以查看已移除的属性及其当前的对应所属关系：

| 2.x.x | 3.0.x |
|-------------------------------------------------|----------------------------------------------|
| `ApplicationEngineEnvironment.connectors`       | `ApplicationEngine.Configuration.connectors` |
| `ApplicationEnvironment.developmentMode`        | `Application.developmentMode`                |
| `ApplicationEnvironment.monitor`                | `Application.monitor`                        |
| `ApplicationEnvironment.parentCoroutineContext` | `Application.parentCoroutineContext`         |
| `ApplicationEnvironment.rootPath`               | `Application.rootPath`                       |

所属关系的变更可以通过以下示例说明：

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

`commandLineEnvironment()` 函数（用于从命令行参数创建 `ApplicationEngineEnvironment` 实例）已在 Ktor `3.0.0` 中移除。相反，您可以使用 [`CommandLineConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html) 函数将命令行参数解析为配置对象。

要将您的应用程序从 `commandLineEnvironment` 迁移到 `CommandLineConfig`，请将 `commandLineEnvironment()` 替换为如下所示的 `configure` 块。

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

有关使用 `embeddedServer` 进行命令行配置的更多信息，请参阅[代码中的配置](server-configuration-code.topic#command-line)主题。

#### 引入 `ServerConfigBuilder` {id="ServerConfigBuilder"}

引入了一个新实体 [`ServerConfigBuilder`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config-builder/index.html) 用于配置服务器属性，它取代了之前的 `ApplicationPropertiesBuilder` 配置机制。`ServerConfigBuilder` 用于构建 [`ServerConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config/index.html) 类的实例，该类现在持有之前由 `ApplicationProperties` 管理的模块、路径和环境详细信息。

下表总结了关键变更：

| 软件包 | 2.x.x | 3.0.x |
|----------------------------|--------------------------------|-----------------------|
| `io.ktor:ktor-server-core` | `ApplicationProperties`        | `ServerConfig`        |
| `io.ktor:ktor-server-core` | `ApplicationPropertiesBuilder` | `ServerConfigBuilder` |

此外，在 `embeddedServer()` 函数中，`applicationProperties` 属性已重命名为 `rootConfig`，以反映这种新的配置方式。

在使用 `embeddedServer()` 时，请将 `applicationProperties` 属性替换为 `rootConfig`。
以下是使用 `serverConfig` 块配置服务器并显式将 `developmentMode` 设置为 `true` 的示例：

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

引入了 [`EmbeddedServer`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-embedded-server/index.html) 类，用于取代 `ApplicationEngine` 作为 `embeddedServer()` 函数的返回值类型。

有关模型变更的更多详情，请参阅 [YouTrack 上的问题 KTOR-3857](https://youtrack.jetbrains.com/issue/KTOR-3857/Environment-Engine-Application-Design)。

### 测试

##### `withTestApplication` 和 `withApplication` 已移除

`withTestApplication` 和 `withApplication` 函数（[之前在 `2.0.0` 版本中已被弃用](migration-to-20x.md#testing-api)）现已从 `ktor-server-test-host` 软件包中移除。

相反，请使用 `testApplication` 函数以及现有的 [Ktor 客户端](client-create-and-configure.md)实例向服务器发出请求并验证结果。

在下面的测试中，`handleRequest` 函数被替换为 `client.get` 请求：

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

有关更多信息，请参阅 [Ktor Server 中的测试](server-testing.md)。

#### `TestApplication` 模块加载 {id="test-module-loading"}

`TestApplication` 不再自动从配置文件（例如 `application.conf`）加载模块。相反，您必须在 `testApplication` 函数中[显式加载您的模块](#explicit-module-loading)，或者手动[加载配置文件](#configure-env)。

##### 显式模块加载 {id="explicit-module-loading"}

要显式加载模块，请在 `testApplication` 中使用 `application` 函数。这种方法允许您手动指定要加载的模块，从而对测试设置提供更大的控制权。

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

##### 从配置文件加载模块 {id="configure-env"}

如果您想从配置文件加载模块，请使用 `environment` 函数为您的测试指定配置文件。

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

有关配置测试应用程序的更多信息，请参阅 [Ktor Server 中的测试](server-testing.md)部分。

### `CallLogging` 插件软件包已重命名

[`CallLogging`](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/index.html) 插件软件包由于拼写错误已重命名。

| 2.x.x | 3.0.x |
|-------------------------------------|--------------------------------------|
| `io.ktor.server.plugins.callloging` | `io.ktor.server.plugins.calllogging` |

### `ktor-server-host-common` 模块已移除

由于 `Application` 需要了解 `ApplicationEngine`，`ktor-server-host-common` 模块的内容已合并到 `ktor-server-core` 中，即 [`io.ktor.server.engine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/index.html) 软件包。

请确保相应地更新您的依赖项。在大多数情况下，您只需移除 `ktor-server-host-common` 依赖项即可。

### `Locations` 插件已移除

Ktor 服务器的 `Locations` 插件已移除。要创建类型安全路由，请改用[资源插件](server-resources.md)。这需要进行以下更改：

* 将 `io.ktor:ktor-server-locations` 构件替换为 `io.ktor:ktor-server-resources`。

* `Resources` 插件依赖于 Kotlin 序列化插件。要添加序列化插件，请参阅 [kotlinx.serialization 设置](https://github.com/Kotlin/kotlinx.serialization#setup)。

* 将插件导入从 `io.ktor.server.locations.*` 更新为 `io.ktor.server.resources.*`。

* 此外，从 `io.ktor.resources` 导入 `Resource` 模块。

以下示例展示了如何实现这些更改：

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

有关使用 `Resources` 的更多信息，请参阅[类型安全路由](server-resources.md)。

### WebSockets 配置中 `java.time` 的替换

[WebSockets](server-websockets.md) 插件配置已更新，对 `pingPeriod` 和 `timeout` 属性使用 Kotlin 的 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/)。这取代了之前使用的 `java.time.Duration`，以获得更地道的 Kotlin 体验。

要将现有代码迁移到新格式，请使用 `kotlin.time.Duration` 类中的扩展函数和属性来构造时长。在以下示例中，`Duration.ofSeconds()` 被替换为 Kotlin 的 `seconds` 扩展：

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

您可以根据其他时长配置的需要使用类似的 Kotlin 时长扩展（`minutes`、`hours` 等）。有关更多信息，请参阅 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 文档。

### 服务器套接字 `.bind()` 现在是挂起的

为了支持 JS 和 WasmJS 环境中的异步操作，[`TCPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-tcp-socket-builder/index.html) 和 [`UDPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-u-d-p-socket-builder/index.html) 中服务器套接字的 `.bind()` 函数已更新为挂起函数。这意味着任何对 `.bind()` 的调用现在都必须在协程内进行。

要进行迁移，请确保 `.bind()` 仅在协程或挂起函数中调用。以下是使用 `runBlocking` 的示例：

```kotlin
  runBlocking {
    val selectorManager = SelectorManager(Dispatchers.IO)
    val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
    //...
}
```

有关使用套接字的更多信息，请参阅[套接字文档](server-sockets.md)。

## 多部分表单数据 (Multipart form data)

### 二进制和文件项的新默认限制

在 Ktor 3.0.0 中，使用 [`ApplicationCall.receiveMultipart()`](https://api.ktor.io/3.0.x/ktor-server-core/io.ktor.server.request/receive-multipart.html) 接收二进制和文件项时，引入了 50 MB 的默认限制。如果接收到的文件或二进制项超过 50 MB 限制，则会抛出 `IOException`。

#### 重写默认限制

如果您的应用程序之前依赖于在没有显式配置的情况下处理大于 50 MB 的文件，您将需要更新代码以避免意外行为。

要重写默认限制，请在调用 `.receiveMultipart()` 时传递 `formFieldLimit` 参数：

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

### `PartData.FileItem.streamProvider()` 已弃用

在 Ktor 的先前版本中，`PartData.FileItem` 中的 `.streamProvider()` 函数用于将文件项的内容作为 `InputStream` 访问。从 Ktor 3.0.0 开始，该函数已弃用。

要迁移您的应用程序，请将 `.streamProvider()` 替换为 [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 函数。`.provider()` 函数返回一个 `ByteReadChannel`，这是一个对协程友好、非阻塞的抽象，用于增量读取字节流。
然后，您可以使用 `ByteReadChannel` 提供的 [`.copyTo()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-to.html) 或 [`.copyAndClose()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-and-close.html) 方法，直接从通道将数据流式传输到文件输出。

在示例中，`.copyAndClose()` 方法将数据从 `ByteReadChannel` 传输到文件的 `WritableByteChannel`。

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

有关完整示例以及有关使用多部分表单数据的更多信息，请参阅[多部分表单数据的请求处理](server-requests.md#form_data)。

### 会话加密方法更新

`Sessions` 插件提供的加密方法已更新，以增强安全性。

具体而言，`SessionTransportTransformerEncrypt` 方法之前是从解密后的会话值派生 MAC，现在则从加密后的值计算 MAC。

为了确保与现有会话的兼容性，Ktor 引入了 `backwardCompatibleRead` 属性。对于当前配置，请在 `SessionTransportTransformerEncrypt` 的构造函数中包含该属性：

```kotlin
install(Sessions) {
  cookie<UserSession>("user_session") {
    // ...
    transform(
      SessionTransportTransformerEncrypt(
        secretEncryptKey, // 此处填写您的加密密钥
        secretSignKey, // 此处填写您的签名密钥
        backwardCompatibleRead = true
      )
    )
  }
}
```

有关 Ktor 中会话加密的更多信息，请参阅[对会话数据进行签名和加密](server-sessions.md#sign_encrypt_session)。

## Ktor Client

### 重命名 `HttpResponse` 的 `content` 属性

在 Ktor 3.0.0 之前，[`HttpResponse`](https://api.ktor.io/ktor-client-core/io.ktor.client.statement/-http-response/index.html) 的 `content` 属性提供了一个从网络读取响应内容的原始 `ByteReadChannel`。从 Ktor 3.0.0 开始，`content` 属性已重命名为 `rawContent`，以更好地反映其用途。

### `SocketTimeoutException` 现在是类型别名

来自 `io.ktor.client.network.sockets` 软件包的 [`SocketTimeoutException`](https://api.ktor.io/3.0.x/ktor-client-core/io.ktor.client.network.sockets/-socket-timeout-exception/index.html) 已从 Kotlin 类转换为 Java 类的别名。这种变化在某些情况下可能会导致 `NoClassDefFoundError`，并可能需要更新现有代码。

要迁移您的应用程序，请确保您的代码未引用旧类，并使用最新的 Ktor 版本进行编译。以下是更新异常检查的方法：

<compare type="top-bottom" first-title="2.x.x" second-title="3.0.x">
    <code-block lang="kotlin" code="    if (exception is io.ktor.client.network.sockets.SocketTimeoutException) { ... }"></code-block>
    <code-block lang="kotlin" code="    if (exception is java.net.SocketTimeoutException) { ... }"></code-block>
</compare>

## 共享模块

### 迁移到 `kotlinx-io`

随着 3.0.0 版本的发布，Ktor 已过渡到使用 `kotlinx-io` 库，该库在 Kotlin 库中提供了一个标准且高效的 I/O API。这一变化提高了性能，减少了内存分配，并简化了 I/O 处理。如果您的项目与 Ktor 的底层 I/O API 交互，您可能需要更新代码以确保兼容性。

这影响了许多类，例如 [`ByteReadChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-read-channel.html) 和 [`ByteWriteChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)。此外，以下 Ktor 类现在由 `kotlinx-io` 支持，其先前的实现已弃用：

| Ktor 2.x | Ktor 3.x |
|-------------------------------------------|---------------------------|
| `io.ktor.utils.io.core.Buffer`            | `kotlinx.io.Buffer`       |
| `io.ktor.utils.io.core.BytePacketBuilder` | `kotlinx.io.Sink`         |
| `io.ktor.utils.io.core.ByteReadPacket`    | `kotlinx.io.Source`       |
| `io.ktor.utils.io.core.Input`             | `kotlinx.io.Source`       |
| `io.ktor.utils.io.core.Output`            | `kotlinx.io.Sink`         |
| `io.ktor.utils.io.core.Sink`              | `kotlinx.io.Buffer`       |
| `io.ktor.utils.io.errors.EOFException`    | `kotlinx.io.EOFException` |
| `io.ktor.utils.io.errors.IOException`     | `kotlinx.io.IOException`  |

被弃用的 API 将被支持到 Ktor 4.0，但我们建议尽快迁移。要迁移您的应用程序，请更新您的代码以利用 `kotlinx-io` 的相应方法。

#### 示例：流式 I/O

如果您正在处理大文件下载并需要高效的流式传输解决方案，您可以使用 `kotlinx-io` 优化的流式 API 替换手动字节数组处理。

在 Ktor 2.x 中，处理大文件下载通常涉及使用 `ByteReadChannel.readRemaining()` 手动读取可用字节，并使用 `File.appendBytes()` 将其写入文件：

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

这种方法涉及多次内存分配和冗余的数据复制。

在 Ktor 3.x 中，`ByteReadChannel.readRemaining()` 现在返回一个 `Source`，从而能够使用 `Source.transferTo()` 进行数据流传输：

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

这种方法将数据直接从通道传输到文件的 Sink 中，最大限度地减少了内存分配并提高了性能。

有关完整示例，请参阅 [client-download-streaming](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-download-streaming)。

> 有关 API 替换的更多详情，请参阅 [`kotlinx-io` 文档](https://kotlinlang.org/api/kotlinx-io/)。

### 属性键现在需要精确类型匹配

在 Ktor 3.0.0 中，[`AttributeKey`](https://api.ktor.io/3.0.x/ktor-utils/io.ktor.util/-attribute-key.html) 实例现在通过标识进行比较，并且在存储和检索值时需要精确的类型匹配。这确保了类型安全性，并防止了由于类型不匹配而导致的意外行为。

以前，可以检索与存储时泛型类型不同的属性，例如使用 `getOrNull<Any>()` 获取 `AttributeKey<Boolean>`。

要迁移您的应用程序，请确保检索类型与存储类型完全匹配：

```kotlin
val attrs = Attributes()

attrs.put(AttributeKey<Boolean>("key"), true)
attrs.getOrNull<Boolean>("key")
```

### 移除了空构件 (Artifact)

自 Ktor 1.0.0 以来，空构件 `io.ktor:ktor` 被错误地发布到了 [Maven](https://repo1.maven.org/maven2/io/ktor/ktor/)。从 Ktor 3.0.0 开始，该构件已被移除。

如果您的项目将此构件包含为依赖项，您可以安全地将其移除。