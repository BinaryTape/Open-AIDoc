[//]: # (title: Ktor 3.2.0의 새로운 기능)

<show-structure for="chapter,procedure" depth="2"/>

_[출시일: 2025년 6월 12일](releases.md#release-details)_

이번 기능 릴리스의 주요 하이라이트는 다음과 같습니다:

* [버전 카탈로그](#published-version-catalog)
* [의존성 주입](#dependency-injection)
* [일급 HTMX 지원](#htmx-integration)
* [중단 가능한 모듈 함수](#suspendable-module-functions)

## Ktor 서버 (Ktor Server)

### 중단 가능한 모듈 함수

Ktor 3.2.0부터 [애플리케이션 모듈](server-modules.md)에서 중단 가능한 함수(suspendable functions)를 지원합니다.

> 중단 모듈(suspend module) 지원이 도입됨에 따라, 개발 모드의 자동 리로드(auto-reload) 기능이 더 이상 블로킹(blocking) 함수 참조와 함께 작동하지 않습니다. 자세한 정보는 [개발 모드 자동 리로드 회귀](#regression) 섹션을 참조하세요.
>
{style="warning"}

이전에는 Ktor 모듈 내부에 비동기 함수를 추가하려면 `runBlocking` 블록이 필요했으며, 이는 서버 생성 시 데드락(deadlock)을 유발할 수 있었습니다.

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

이제는 `suspend` 키워드를 사용하여 애플리케이션 시작 시 비동기 코드를 직접 사용할 수 있습니다.

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### 동시 모듈 로딩

`ktor.application.startup = concurrent` Gradle 프로퍼티를 추가하여 동시 모듈 로딩을 활성화할 수도 있습니다. 이 설정은 모든 애플리케이션 모듈을 독립적으로 실행하므로, 하나의 모듈이 중단(suspend)되어도 다른 모듈이 차단되지 않습니다. 이를 통해 의존성 주입을 위한 비순차적 로딩이 가능해지며, 경우에 따라 로딩 속도가 빨라집니다.

자세한 내용은 [동시 모듈(Concurrent modules)](server-modules.md#concurrent-modules)을 참조하세요.

### 설정 파일 역직렬화

Ktor 3.2.0은 `Application` 클래스의 새로운 `.property()` 확장 함수를 통해 타입이 지정된 설정 로딩 기능을 도입했습니다. 이제 구조화된 설정 섹션을 Kotlin 데이터 클래스로 직접 역직렬화할 수 있습니다.

이 기능을 사용하면 설정 값에 접근하는 방식이 단순해지고, 중첩되거나 그룹화된 설정을 다룰 때 발생하는 보일러플레이트 코드를 크게 줄일 수 있습니다.

다음 **application.yaml** 파일을 예로 들어 보겠습니다:

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

이전에는 각 설정 값을 개별적으로 가져와야 했습니다. 새로운 `.property()` 확장 함수를 사용하면 전체 설정 섹션을 한 번에 로드할 수 있습니다.

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // 설정 사용&#10;}"></code-block>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // 설정 사용&#10;}"></code-block>
</compare>

이 기능은 HOCON 및 YAML 설정 형식을 모두 지원하며 역직렬화를 위해 `kotlinx.serialization`을 사용합니다.

### `ApplicationTestBuilder`에 구성 가능한 `client` 추가

Ktor 3.2.0부터 `ApplicationTestBuilder` 클래스의 `client` 프로퍼티가 가변(mutable)으로 변경되었습니다. 이전에는 읽기 전용이었습니다. 이 변경을 통해 자신만의 테스트 클라이언트를 구성하고 `ApplicationTestBuilder` 클래스를 사용할 수 있는 모든 곳에서 재사용할 수 있습니다. 예를 들어, 확장 함수 내부에서 클라이언트에 접근할 수 있습니다.

```kotlin
@Test
fun testRouteAfterAuthorization() = testApplication {
    // 클라이언트 사전 구성
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
            
        defaultRequest { 
            contentType(ContentType.Application.Json)
        }
    }

    // 확장 함수로 추출된 재사용 가능한 테스트 단계
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

### 의존성 주입

Ktor 3.2.0은 의존성 주입(Dependency Injection, DI) 지원을 도입하여 설정 파일과 애플리케이션 코드에서 직접 의존성을 관리하고 연결하는 것을 더 쉽게 만들었습니다. 새로운 DI 플러그인은 의존성 해결을 단순화하고, 비동기 로딩을 지원하며, 자동 정리 기능을 제공하고 테스트와 원활하게 통합됩니다.

<var name="artifact_name" value="ktor-server-di" />

DI를 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함하세요:

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

#### 기본 의존성 등록

람다, 함수 참조 또는 생성자 참조를 사용하여 의존성을 등록할 수 있습니다:

```kotlin
dependencies {
  // 람다 기반
  provide<GreetingService> { GreetingServiceImpl() }

  // 함수 참조
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // 람다를 의존성으로 등록
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 설정 기반 의존성 등록

설정 파일에서 클래스패스 참조를 사용하여 선언적으로 의존성을 구성할 수 있습니다. 이는 함수 및 클래스 참조를 모두 지원합니다.

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
  // 구현부
}
```

인수는 `@Property` 및 `@Named`와 같은 어노테이션을 통해 자동으로 해결됩니다.

#### 의존성 해결 및 주입

##### 의존성 해결하기

의존성을 해결하려면 프로퍼티 위임(property delegation)이나 직접 해결(direct resolution) 방식을 사용할 수 있습니다.

```kotlin
// 프로퍼티 위임 사용
val service: GreetingService by dependencies

// 직접 해결
val service = dependencies.resolve<GreetingService>()
```

##### 비동기 의존성 해결

비동기 로딩을 지원하기 위해 중단 함수를 사용할 수 있습니다.

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // 제공될 때까지 중단됨
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI 플러그인은 모든 의존성이 준비될 때까지 `resolve()` 호출을 자동으로 중단시킵니다.

##### 애플리케이션 모듈에 주입하기

모듈 파라미터를 지정하여 애플리케이션 모듈에 직접 의존성을 주입할 수 있습니다. Ktor는 DI 컨테이너에서 이를 해결합니다.

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

특정 키가 지정된 의존성을 주입하려면 `@Named`를 사용하세요.

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // "mongo"라는 이름의 의존성을 사용함
}
```

##### 프로퍼티 및 설정 주입

`@Property`를 사용하여 설정 값을 직접 주입하세요.

```yaml
connection:
  domain: api.example.com
  path: /v1
  protocol: https
```

```kotlin
val connection: Connection = application.property("connection")
```

이를 통해 구조화된 설정을 간편하게 다룰 수 있으며 기본 타입의 자동 파싱을 지원합니다.

자세한 정보 및 고급 사용법은 [의존성 주입(Dependency Injection)](server-dependency-injection.md)을 참조하세요.

### `testApplication`에서 애플리케이션 인스턴스 접근

이제 `ApplicationTestBuilder.application` 프로퍼티를 사용하여 `testApplication {}` 블록에서 실행 중인 `Application` 인스턴스에 직접 접근할 수 있습니다.

이전에는 `Application` 인스턴스를 중첩된 `application {}` 구성 블록 내부에서만 사용할 수 있어, 나중에 테스트에서 애플리케이션을 참조하기가 어려웠습니다. 새로운 `application` 프로퍼티는 구성 및 시작 후의 동일한 인스턴스를 노출합니다.

다음 예제는 `application` 프로퍼티를 사용하여 플러그인이 설치되었는지 확인합니다:

```kotlin
@Test
fun testAccessApplicationInstance() = testApplication {
    // 애플리케이션 구성
    application {
        install(CORS)
    }

    // 애플리케이션이 시작되었는지 확인
    startApplication()

    // 테스트에서 동일한 Application 인스턴스에 접근
    val app: Application = application

    assertTrue(app.pluginOrNull(CORS) != null)
}
```

### 개발 모드 자동 리로드 회귀 {id="regression"}

중단 함수 지원의 부수 효과로, 블로킹 함수 참조(`Application::myModule`)는 이제 캐스팅 중에 익명 내부 클래스로 래핑됩니다. 이로 인해 함수 이름이 더 이상 안정적인 참조로 유지되지 않기 때문에 자동 리로드가 작동하지 않습니다.

즉, `development` 모드에서의 자동 리로드는 중단 함수 모듈 및 설정 참조에서만 작동합니다:

```kotlin
// 중단 함수 참조
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 설정 참조
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

## Ktor 클라이언트 (Ktor Client)

### `SaveBodyPlugin` 및 `HttpRequestBuilder.skipSavingBody()` 지원 중단 (Deprecated)

Ktor 3.2.0 이전에는 `SaveBodyPlugin`이 기본적으로 설치되었습니다. 이 플러그인은 전체 응답 본문을 메모리에 캐싱하여 여러 번 접근할 수 있게 했습니다. 응답 본문을 저장하지 않으려면 플러그인을 명시적으로 비활성화해야 했습니다.

Ktor 3.2.0부터 `SaveBodyPlugin`은 지원이 중단되었으며, 스트리밍이 아닌 모든 요청에 대해 응답 본문을 자동으로 저장하는 새로운 내부 플러그인으로 대체되었습니다. 이는 리소스 관리를 개선하고 HTTP 응답 생명주기를 단순화합니다.

`HttpRequestBuilder.skipSavingBody()` 또한 지원이 중단되었습니다. 본문을 캐싱하지 않고 응답을 처리해야 하는 경우, 대신 스트리밍 방식을 사용하세요.

<compare first-title="이전" second-title="이후">

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

이 방식은 응답을 직접 스트리밍하여 본문이 메모리에 저장되는 것을 방지합니다.

### `.wrapWithContent()` 및 `.wrap()` 확장 함수 지원 중단

Ktor 3.2.0에서는 [`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) 및 [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 확장 함수가 새로운 `.replaceResponse()` 함수를 위해 지원이 중단되었습니다.

`.wrapWithContent()` 및 `.wrap()` 함수는 원래의 응답 본문을 한 번만 읽을 수 있는 `ByteReadChannel`로 대체합니다. 새 채널을 반환하는 함수 대신 동일한 채널 인스턴스가 직접 전달되면 본문을 여러 번 읽는 데 실패합니다. 이는 응답 본문에 접근하는 서로 다른 플러그인 간의 호환성을 깨뜨릴 수 있는데, 본문을 먼저 읽는 플러그인이 이를 소모해 버리기 때문입니다.

```kotlin
// 본문을 rawContent에서 한 번 디코딩된 채널로 대체
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// 첫 번째 호출은 본문을 반환
decodedResponse.bodyAsText()

// 후속 호출은 빈 문자열을 반환
decodedResponse.bodyAsText() 
```

이 문제를 방지하려면 대신 `.replaceResponse()` 함수를 사용하세요. 이 함수는 접근할 때마다 새 채널을 반환하는 람다를 인자로 받아 다른 플러그인과의 안전한 통합을 보장합니다.

```kotlin
// 각 접근 시마다 새로운 디코딩된 채널로 본문을 대체
call.replaceResponse {
    decode(response.rawContent)
}
```

### 확인된 IP 주소 접근

이제 `io.ktor.network.sockets.InetSocketAddress` 인스턴스에서 새로운 `.resolveAddress()` 함수를 사용할 수 있습니다. 이 함수를 사용하면 연결된 호스트의 확인된(resolved) 원시 IP 주소를 얻을 수 있습니다.

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

이 함수는 확인된 IP 주소를 `ByteArray`로 반환하며, 주소를 확인할 수 없는 경우 `null`을 반환합니다. 반환된 `ByteArray`의 크기는 IP 버전에 따라 다릅니다 (IPv4 주소의 경우 4바이트, IPv6 주소의 경우 16바이트). JS 및 Wasm 플랫폼에서 `.resolveAddress()`는 항상 `null`을 반환합니다.

### HTTP 캐시 삭제

이제 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html)의 새로운 메서드를 사용하여 필요할 때 캐시된 HTTP 응답을 삭제할 수 있습니다.

- `.removeAll(url)`은 지정된 URL과 일치하는 모든 캐시 엔트리를 제거합니다.
- `.remove(url, varyKeys)`는 주어진 URL 및 `Vary` 키와 일치하는 특정 캐시 엔트리를 제거합니다.

이러한 메서드는 캐시 무효화 및 오래되거나 특정된 캐시 응답을 관리하는 방식에 대해 더 많은 제어권을 제공합니다.

## 공통 (Shared)

### HTMX 통합

Ktor 3.2.0은 `hx-get` 및 `hx-swap`과 같은 HTML 속성을 통해 동적 상호작용을 가능하게 하는 현대적인 JavaScript 라이브러리인 [HTMX](https://htmx.org/)에 대한 실험적 지원을 도입했습니다. Ktor의 HTMX 통합은 다음을 제공합니다:

- 헤더를 기반으로 HTMX 요청을 처리하기 위한 HTMX 인식 라우팅.
- Kotlin에서 HTMX 속성을 생성하기 위한 HTML DSL 확장.
- 문자열 리터럴을 제거하기 위한 HTMX 헤더 상수 및 값.

Ktor의 HTMX 지원은 세 가지 실험적 모듈을 통해 제공됩니다:

| 모듈 | 설명 |
|--------------------|--------------------------------------------|
| `ktor-htmx` | 핵심 정의 및 헤더 상수 |
| `ktor-htmx-html` | Kotlin HTML DSL과의 통합 |
| `ktor-server-htmx` | HTMX 특정 요청에 대한 라우팅 지원 |

모든 API는 `@ExperimentalKtorApi`로 표시되어 있으며 `@OptIn(ExperimentalKtorApi::class)`를 통한 명시적 동의가 필요합니다. 자세한 정보는 [HTMX 통합](htmx-integration.md)을 참조하세요.

### 유닉스 도메인 소켓 (Unix domain sockets)

3.2.0부터 Ktor 클라이언트가 유닉스 도메인 소켓에 연결하고 Ktor 서버가 해당 소켓을 리스닝하도록 설정할 수 있습니다. 현재 유닉스 도메인 소켓은 CIO 엔진에서만 지원됩니다.

서버 구성의 예:

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

Ktor 클라이언트를 사용하여 해당 소켓에 연결:

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

[기본 요청(default request)](client-default-request.md#unix-domain-sockets)에서도 유닉스 도메인 소켓을 사용할 수 있습니다.

### 헤더 및 파라미터 빌드를 위한 새로운 `.appendAll()` 오버로드

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 함수에 `Map` 또는 `vararg Pair`를 허용하는 새로운 오버로드가 추가되었습니다. 이를 통해 단일 호출로 여러 값을 추가할 수 있어 헤더, URL 파라미터 및 기타 `StringValues` 기반 컬렉션의 작성이 단순해집니다.

다음 예제는 이러한 새로운 오버로드의 사용법을 보여줍니다:

```kotlin
val headers = buildHeaders {
    // Map 사용
    appendAll(mapOf("foo" to "bar", "baz" to "qux"))
    appendAll(mapOf("test" to listOf("1", "2", "3")))

    // vararg Pair 사용
    appendAll("foo" to "bar", "baz" to "qux")
    appendAll("test" to listOf("1", "2", "3"))
}
```

## 인프라 (Infrastructure)

### 게시된 버전 카탈로그

이번 릴리스부터 모든 Ktor 의존성을 단일 소스에서 관리할 수 있는 공식 [게시된 버전 카탈로그](server-dependencies.topic#using-version-catalog)를 사용할 수 있습니다. 이를 통해 의존성에서 Ktor 버전을 수동으로 선언할 필요가 없어집니다.

프로젝트에 카탈로그를 추가하려면 **settings.gradle.kts**에서 Gradle의 버전 카탈로그를 구성한 다음, 모듈의 **build.gradle.kts** 파일에서 이를 참조하세요.

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

## Gradle 플러그인

### 개발 모드 활성화

Ktor 3.2.0은 개발 모드 활성화 방식을 단순화했습니다. 이전에는 개발 모드를 활성화하려면 `application` 블록에서 명시적인 구성이 필요했습니다. 이제는 `ktor.development` 프로퍼티를 사용하여 동적으로 또는 명시적으로 활성화할 수 있습니다.

* 프로젝트 프로퍼티를 기반으로 개발 모드를 동적으로 활성화합니다.
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 개발 모드를 명시적으로 true로 설정합니다.

    ```kotlin
    ktor {
        development = true
    }
    ```

기본적으로 `ktor.development` 값은 Gradle 프로젝트 프로퍼티 또는 시스템 프로퍼티 `io.ktor.development`가 정의된 경우 그로부터 자동으로 해결됩니다. 이를 통해 Gradle CLI 플래그를 사용하여 직접 개발 모드를 활성화할 수 있습니다.

```bash
./gradlew run -Pio.ktor.development=true