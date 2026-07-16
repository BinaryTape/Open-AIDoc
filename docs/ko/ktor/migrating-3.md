[//]: # (title: 2.2.x에서 3.0.x로 마이그레이션하기)

<show-structure for="chapter" depth="3"/>

이 가이드는 Ktor 애플리케이션을 2.2.x 버전에서 3.0.x로 마이그레이션하는 방법에 대한 지침을 제공합니다.

## Ktor 서버 {id="server"}

### `ApplicationEngine`, `ApplicationEnvironment`, 그리고 `Application`

구성 가능성을 개선하고 `ApplicationEngine`, `ApplicationEnvironment`, `Application` 인스턴스 간의 명확한 분리를 제공하기 위해 여러 디자인 변경 사항이 도입되었습니다.

v3.0.0 이전에는 `ApplicationEngine`이 `ApplicationEnvironment`를 관리하고, `ApplicationEnvironment`가 다시 `Application`을 관리했습니다.

그러나 현재 디자인에서는 `Application`이 `ApplicationEngine`과 `ApplicationEnvironment`를 모두 생성, 소유 및 시작할 책임을 가집니다.

이러한 구조 재편으로 인해 다음과 같은 중대한 변경 사항(breaking changes)이 발생합니다:

- [`ApplicationEngineEnvironmentBuilder` 및 `applicationEngineEnvironment` 클래스의 이름이 변경되었습니다](#renamed-classes).
- [`start()` 및 `stop()` 메서드가 `ApplicationEngineEnvironment`에서 제거되었습니다](#ApplicationEnvironment).
- [`commandLineEnvironment()`가 제거되었습니다](#CommandLineConfig).
- [`ServerConfigBuilder`가 도입되었습니다](#ServerConfigBuilder).
- [`embeddedServer()`가 `ApplicationEngine` 대신 `EmbeddedServer`를 반환합니다](#EmbeddedServer).

이러한 변경 사항은 이전 모델에 의존하는 기존 코드에 영향을 미칩니다.

#### 클래스 이름 변경 {id="renamed-classes"}

| 패키지 | 2.x.x | 3.0.x |
|----------------------------|---------------------------------------|---------------------------------|
| `io.ktor:ktor-server-core` | `ApplicationEngineEnvironmentBuilder` | `ApplicationEnvironmentBuilder` |
| `io.ktor:ktor-server-core` | `applicationEngineEnvironment`        | `applicationEnvironment`        |

#### `start()` 및 `stop()` 메서드가 `ApplicationEngineEnvironment`에서 제거됨 {id="ApplicationEnvironment"}

`ApplicationEngineEnvironment`가 [`ApplicationEnvironment`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/index.html)로 병합됨에 따라, `start()` 및 `stop()` 메서드는 이제 [`ApplicationEngine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/index.html)을 통해서만 접근할 수 있습니다.

| 2.x.x                                                 | 3.0.x                                |
|-------------------------------------------------------|--------------------------------------|
| `ApplicationEngineEnvironment.start()`                | `ApplicationEngine.start()`          |
| `ApplicationEngineEnvironment.stop()`                 | `ApplicationEngine.stop()`           |

또한, 다음 표에서 제거된 속성과 현재 대응되는 소유권을 확인할 수 있습니다:

| 2.x.x                                           | 3.0.x                                        |
|-------------------------------------------------|----------------------------------------------|
| `ApplicationEngineEnvironment.connectors`       | `ApplicationEngine.Configuration.connectors` |
| `ApplicationEnvironment.developmentMode`        | `Application.developmentMode`                |
| `ApplicationEnvironment.monitor`                | `Application.monitor`                        |
| `ApplicationEnvironment.parentCoroutineContext` | `Application.parentCoroutineContext`         |
| `ApplicationEnvironment.rootPath`               | `Application.rootPath`                       |

소유권 변경 사항은 다음 예시를 통해 확인할 수 있습니다:

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

#### `commandLineEnvironment()`가 제거됨 {id="CommandLineConfig"}

명령줄 인수에서 `ApplicationEngineEnvironment` 인스턴스를 생성하는 데 사용되었던 `commandLineEnvironment()` 함수가 Ktor `3.0.0`에서 제거되었습니다. 대신 [`CommandLineConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html) 함수를 사용하여 명령줄 인수를 구성 객체로 파싱할 수 있습니다.

애플리케이션을 `commandLineEnvironment`에서 `CommandLineConfig`로 마이그레이션하려면, 아래와 같이 `commandLineEnvironment()`를 `configure` 블록으로 교체하세요.

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

명령줄 구성에 대한 자세한 내용은 [코드로 구성하기(Configuration in code)](server-configuration-code.topic#command-line) 주제를 참조하세요.

#### `ServerConfigBuilder` 도입 {id="ServerConfigBuilder"}

서버 속성을 구성하기 위해 새로운 엔티티인 [`ServerConfigBuilder`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config-builder/index.html)가 도입되었으며, 이는 이전의 `ApplicationPropertiesBuilder` 구성 메커니즘을 대체합니다. `ServerConfigBuilder`는 [`ServerConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config/index.html) 클래스의 인스턴스를 빌드하는 데 사용되며, 이 클래스는 이전에 `ApplicationProperties`에서 관리하던 모듈, 경로 및 환경 세부 정보를 보유합니다.

다음 표는 주요 변경 사항을 요약한 것입니다:

| 패키지 | 2.x.x | 3.0.x |
|----------------------------|--------------------------------|-----------------------|
| `io.ktor:ktor-server-core` | `ApplicationProperties`        | `ServerConfig`        |
| `io.ktor:ktor-server-core` | `ApplicationPropertiesBuilder` | `ServerConfigBuilder` |

또한, `embeddedServer()` 함수에서 `applicationProperties` 속성이 새로운 구성 방식을 반영하여 `rootConfig`로 이름이 변경되었습니다.

`embeddedServer()`를 사용할 때 `applicationProperties` 속성을 `rootConfig`로 교체하세요. 다음은 `developmentMode`를 명시적으로 `true`로 설정하여 서버를 구성하는 `serverConfig` 블록의 사용 예시입니다:

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

#### `EmbeddedServer` 도입 {id="EmbeddedServer"}

[`EmbeddedServer`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-embedded-server/index.html) 클래스가 도입되었으며, `embeddedServer()` 함수의 반환 타입으로 `ApplicationEngine`을 대체하는 데 사용됩니다.

모델 변경에 대한 자세한 내용은 [YouTrack의 이슈 KTOR-3857](https://youtrack.jetbrains.com/issue/KTOR-3857/Environment-Engine-Application-Design)을 참조하세요.

### 테스트

##### `withTestApplication` 및 `withApplication`이 제거됨

[`2.0.0` 릴리스에서 이전에 사용 중단(deprecated)되었던](migration-to-20x.md#testing-api) `withTestApplication` 및 `withApplication` 함수가 이제 `ktor-server-test-host` 패키지에서 제거되었습니다.

대신 `testApplication` 함수를 기존 [Ktor 클라이언트](client-create-and-configure.md) 인스턴스와 함께 사용하여 서버에 요청을 보내고 결과를 확인하세요.

아래 테스트에서는 `handleRequest` 함수가 `client.get` 요청으로 대체되었습니다:

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

자세한 내용은 [Ktor 서버에서 테스트하기](server-testing.md)를 참조하세요.

#### `TestApplication` 모듈 로딩 {id="test-module-loading"}

`TestApplication`은 더 이상 구성 파일(예: `application.conf`)에서 모듈을 자동으로 로드하지 않습니다. 대신 `testApplication` 함수 내에서 [모듈을 명시적으로 로드](#explicit-module-loading)하거나 [구성 파일을 수동으로 로드](#configure-env)해야 합니다.

##### 명시적 모듈 로딩 {id="explicit-module-loading"}

모듈을 명시적으로 로드하려면 `testApplication` 내에서 `application` 함수를 사용하세요. 이 접근 방식을 사용하면 로드할 모듈을 수동으로 지정할 수 있어 테스트 설정에 대해 더 큰 제어권을 가질 수 있습니다.

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

##### 구성 파일에서 모듈 로드 {id="configure-env"}

구성 파일에서 모듈을 로드하려면 `environment` 함수를 사용하여 테스트를 위한 구성 파일을 지정하세요.

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

테스트 애플리케이션 구성에 대한 자세한 내용은 [Ktor 서버에서 테스트하기](server-testing.md) 섹션을 참조하세요.

### `CallLogging` 플러그인 패키지 이름 변경

[`CallLogging`](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/index.html) 플러그인 패키지 이름이 오타로 인해 변경되었습니다.

| 2.x.x                               | 3.0.x                                |
|-------------------------------------|--------------------------------------|
| `io.ktor.server.plugins.callloging` | `io.ktor.server.plugins.calllogging` |

### `ktor-server-host-common` 모듈이 제거됨

`Application`이 `ApplicationEngine`에 대한 정보를 알고 있어야 하므로, `ktor-server-host-common` 모듈의 내용이 `ktor-server-core`, 즉 [`io.ktor.server.engine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/index.html) 패키지로 병합되었습니다.

종속성이 그에 따라 업데이트되었는지 확인하세요. 대부분의 경우 단순히 `ktor-server-host-common` 종속성을 제거하면 됩니다.

### `Locations` 플러그인이 제거됨

Ktor 서버용 `Locations` 플러그인이 제거되었습니다. 타입 안전한 라우팅을 만들려면 대신 [Resources 플러그인](server-resources.md)을 사용하세요. 이를 위해 다음과 같은 변경이 필요합니다:

* `io.ktor:ktor-server-locations` 아티팩트를 `io.ktor:ktor-server-resources`로 교체합니다.

* `Resources` 플러그인은 Kotlin 직렬화(serialization) 플러그인에 의존합니다. 직렬화 플러그인을 추가하려면 [kotlinx.serialization 설정](https://github.com/Kotlin/kotlinx.serialization#setup)을 참조하세요.

* 플러그인 임포트를 `io.ktor.server.locations.*`에서 `io.ktor.server.resources.*`로 업데이트합니다.

* 또한 `io.ktor.resources`에서 `Resource` 모듈을 임포트합니다.

다음 예시는 이러한 변경 사항을 구현하는 방법을 보여줍니다:

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

`Resources` 사용에 대한 자세한 내용은 [타입 안전한 라우팅](server-resources.md)을 참조하세요.

### WebSockets 구성에서 `java.time` 교체

[WebSockets](server-websockets.md) 플러그인 구성이 `pingPeriod` 및 `timeout` 속성에 Kotlin의 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/)을 사용하도록 업데이트되었습니다. 이는 더 관용적인(idiomatic) Kotlin 경험을 위해 기존의 `java.time.Duration` 사용을 대체합니다.

기존 코드를 새로운 형식으로 마이그레이션하려면 `kotlin.time.Duration` 클래스의 확장 함수와 속성을 사용하여 기간을 구성하세요. 다음 예시에서 `Duration.ofSeconds()`는 Kotlin의 `seconds` 확장 속성으로 대체되었습니다:

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

다른 기간 구성에 필요한 대로 유사한 Kotlin 기간 확장 속성(`minutes`, `hours` 등)을 사용할 수 있습니다. 자세한 내용은 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 문서를 참조하세요.

### 서버 소켓 `.bind()`가 이제 중단 함수(suspending)임

JS 및 WasmJS 환경에서 비동기 작업을 지원하기 위해 [`TCPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-tcp-socket-builder/index.html) 및 [`UDPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-u-d-p-socket-builder/index.html)의 서버 소켓용 `.bind()` 함수가 중단 함수로 업데이트되었습니다. 즉, 모든 `.bind()` 호출은 이제 코루틴 내에서 이루어져야 합니다.

마이그레이션하려면 `.bind()`가 코루틴 또는 중단 함수 내에서만 호출되도록 하세요. 다음은 `runBlocking`을 사용하는 예시입니다:

```kotlin
  runBlocking {
    val selectorManager = SelectorManager(Dispatchers.IO)
    val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
    //...
}
```

소켓 작업에 대한 자세한 내용은 [소켓 문서](server-sockets.md)를 참조하세요.

## 멀티파트 폼 데이터(Multipart form data)

### 바이너리 및 파일 항목에 대한 새로운 기본 제한

Ktor 3.0.0에서는 [`ApplicationCall.receiveMultipart()`](https://api.ktor.io/3.0.x/ktor-server-core/io.ktor.server.request/receive-multipart.html)를 사용하여 바이너리 및 파일 항목을 받을 때 50MiB(약 52.4MB)의 기본 제한이 도입되었습니다. 받은 파일이나 바이너리 항목이 50MiB 제한을 초과하면 `IOException`이 발생합니다.

#### 기본 제한 재정의

애플리케이션이 이전에 명시적 구성 없이 50MiB보다 큰 파일을 처리하는 데 의존했다면, 예기치 않은 동작을 방지하기 위해 코드를 업데이트해야 합니다.

기본 제한을 재정의하려면 `.receiveMultipart()`를 호출할 때 `formFieldLimit` 매개변수를 전달하세요:

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

### `PartData.FileItem.streamProvider()`가 사용 중단됨

이전 버전의 Ktor에서는 `PartData.FileItem`의 `.streamProvider()` 함수를 사용하여 파일 항목의 콘텐츠에 `InputStream`으로 접근했습니다. Ktor 3.0.0부터 이 함수는 사용 중단되었습니다.

애플리케이션을 마이그레이션하려면 `.streamProvider()`를 [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 함수로 교체하세요. `.provider()` 함수는 `ByteReadChannel`을 반환하며, 이는 바이트 스트림을 점진적으로 읽기 위한 코루틴 친화적이고 논블로킹(non-blocking)적인 추상화입니다. 그런 다음 `ByteReadChannel`에서 제공하는 [`.copyTo()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-to.html) 또는 [`.copyAndClose()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-and-close.html) 메서드를 사용하여 채널에서 파일 출력으로 데이터를 직접 스트리밍할 수 있습니다.

예시에서 `.copyAndClose()` 메서드는 `ByteReadChannel`에서 파일의 `WritableByteChannel`로 데이터를 전송합니다.

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

전체 예제와 멀티파트 폼 데이터 작업에 대한 자세한 내용은 [멀티파트 폼 데이터의 요청 처리](server-requests.md#form_data)를 참조하세요.

### 세션 암호화 방식 업데이트

보안을 강화하기 위해 `Sessions` 플러그인에서 제공하는 암호화 방식이 업데이트되었습니다.

구체적으로, 이전에 복호화된 세션 값에서 MAC을 도출하던 `SessionTransportTransformerEncrypt` 메서드는 이제 암호화된 값에서 MAC을 계산합니다.

기존 세션과의 호환성을 보장하기 위해 Ktor는 `backwardCompatibleRead` 속성을 도입했습니다. 현재 구성의 경우, `SessionTransportTransformerEncrypt` 생성자에 해당 속성을 포함하세요:

```kotlin
install(Sessions) {
  cookie<UserSession>("user_session") {
    // ...
    transform(
      SessionTransportTransformerEncrypt(
        secretEncryptKey, // 암호화 키
        secretSignKey, // 서명 키
        backwardCompatibleRead = true
      )
    )
  }
}
```

Ktor의 세션 암호화에 대한 자세한 내용은 [세션 데이터 서명 및 암호화](server-sessions.md#sign_encrypt_session)를 참조하세요.

## Ktor 클라이언트

### `HttpResponse`의 `content` 속성 이름 변경

Ktor 3.0.0 이전에는 [`HttpResponse`](https://api.ktor.io/ktor-client-core/io.ktor.client.statement/-http-response/index.html)의 `content` 속성이 네트워크에서 읽어온 응답 콘텐츠에 대한 원시 `ByteReadChannel`을 제공했습니다. Ktor 3.0.0부터는 용도를 더 잘 반영하기 위해 `content` 속성의 이름이 `rawContent`로 변경되었습니다.

### `SocketTimeoutException`이 이제 타입 별칭(typealias)임

`io.ktor.client.network.sockets` 패키지의 [`SocketTimeoutException`](https://api.ktor.io/3.0.x/ktor-client-core/io.ktor.client.network.sockets/-socket-timeout-exception/index.html)이 Kotlin 클래스에서 Java 클래스에 대한 별칭으로 변경되었습니다. 이 변경으로 인해 특정 사례에서 `NoClassDefFoundError`가 발생할 수 있으며 기존 코드를 업데이트해야 할 수도 있습니다.

애플리케이션을 마이그레이션하려면 코드가 이전 클래스를 참조하지 않는지 확인하고 최신 Ktor 버전으로 컴파일하세요. 예외 확인 코드를 업데이트하는 방법은 다음과 같습니다:

<compare type="top-bottom" first-title="2.x.x" second-title="3.0.x">
    <code-block lang="kotlin" code="    if (exception is io.ktor.client.network.sockets.SocketTimeoutException) { ... }"></code-block>
    <code-block lang="kotlin" code="    if (exception is java.net.SocketTimeoutException) { ... }"></code-block>
</compare>

## 공유 모듈

### `kotlinx-io`로의 마이그레이션

3.0.0 릴리스와 함께 Ktor는 Kotlin 라이브러리 전반에서 표준화되고 효율적인 I/O API를 제공하는 `kotlinx-io` 라이브러리 사용으로 전환되었습니다. 이 변경은 성능을 개선하고 메모리 할당을 줄이며 I/O 처리를 단순화합니다. 프로젝트가 Ktor의 저수준 I/O API와 상호 작용하는 경우 호환성을 보장하기 위해 코드를 업데이트해야 할 수도 있습니다.

이는 [`ByteReadChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-read-channel.html) 및 [`ByteWriteChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)과 같은 많은 클래스에 영향을 미칩니다. 또한, 다음 Ktor 클래스들은 이제 `kotlinx-io`를 기반으로 하며, 이전 구현은 사용 중단되었습니다:

| Ktor 2.x                                  | Ktor 3.x                  |
|-------------------------------------------|---------------------------|
| `io.ktor.utils.io.core.Buffer`            | `kotlinx.io.Buffer`       |
| `io.ktor.utils.io.core.BytePacketBuilder` | `kotlinx.io.Sink`         |
| `io.ktor.utils.io.core.ByteReadPacket`    | `kotlinx.io.Source`       |
| `io.ktor.utils.io.core.Input`             | `kotlinx.io.Source`       |
| `io.ktor.utils.io.core.Output`            | `kotlinx.io.Sink`         |
| `io.ktor.utils.io.core.Sink`              | `kotlinx.io.Buffer`       |
| `io.ktor.utils.io.errors.EOFException`    | `kotlinx.io.EOFException` |
| `io.ktor.utils.io.errors.IOException`     | `kotlinx.io.IOException`  |

사용 중단된 API는 Ktor 4.0까지 지원되지만, 가능한 한 빨리 마이그레이션하는 것을 권장합니다. 애플리케이션을 마이그레이션하려면 `kotlinx-io`의 해당 메서드를 사용하도록 코드를 업데이트하세요.

#### 예시: 스트리밍 I/O

대용량 파일 다운로드를 처리하고 효율적인 스트리밍 솔루션이 필요한 경우, 수동 바이트 배열 처리를 `kotlinx-io`의 최적화된 스트리밍 API로 교체할 수 있습니다.

Ktor 2.x에서 대용량 파일 다운로드를 처리할 때는 일반적으로 `ByteReadChannel.readRemaining()`을 사용하여 가용 바이트를 수동으로 읽고 `File.appendBytes()`를 사용하여 파일에 쓰는 방식이었습니다:

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

이 접근 방식은 여러 번의 메모리 할당과 중복된 데이터 복사를 수반했습니다.

Ktor 3.x에서 `ByteReadChannel.readRemaining()`은 이제 `Source`를 반환하므로 `Source.transferTo()`를 사용하여 데이터를 스트리밍할 수 있습니다:

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

이 접근 방식은 데이터를 채널에서 파일의 싱크(sink)로 직접 전송하여 메모리 할당을 최소화하고 성능을 개선합니다.

전체 예제는 [client-download-streaming](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-download-streaming)을 참조하세요.

> API 대체에 대한 자세한 내용은 [`kotlinx-io` 문서](https://kotlinlang.org/api/kotlinx-io/)를 참조하세요.

### 속성 키(Attribute keys)에 이제 정확한 타입 매칭이 필요함

Ktor 3.0.0에서 [`AttributeKey`](https://api.ktor.io/3.0.x/ktor-utils/io.ktor.util/-attribute-key.html) 인스턴스는 이제 ID(identity)로 비교되며 값을 저장하고 검색할 때 정확한 타입 매칭을 요구합니다. 이는 타입 안전성을 보장하고 타입 불일치로 인한 예기치 않은 동작을 방지합니다.

이전에는 `AttributeKey<Boolean>`을 가져오기 위해 `getOrNull<Any>()`를 사용하는 것과 같이, 저장된 것과 다른 제네릭 타입으로 속성을 검색하는 것이 가능했습니다.

애플리케이션을 마이그레이션하려면 검색 타입이 저장된 타입과 정확히 일치하는지 확인하세요:

```kotlin
val attrs = Attributes()

attrs.put(AttributeKey<Boolean>("key"), true)
attrs.getOrNull<Boolean>("key")
```

### 빈 아티팩트(artifact) 제거

Ktor 1.0.0 이후로 빈 아티팩트인 `io.ktor:ktor`가 실수로 [Maven](https://repo1.maven.org/maven2/io/ktor/ktor/)에 게시되었습니다. 이 아티팩트는 Ktor 3.0.0부터 제거되었습니다.

프로젝트에 이 아티팩트가 종속성으로 포함되어 있다면 안전하게 제거할 수 있습니다.