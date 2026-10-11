[//]: # (title: Ktor Client에서 테스트하기)

<show-structure for="chapter" depth="3"/>

<var name="artifact_name" value="ktor-client-mock"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-testing-mock"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
Ktor는 엔드포인트에 실제로 연결하지 않고도 HTTP 호출을 시뮬레이션하는 MockEngine을 제공합니다.
</web-summary>

<link-summary>
HTTP 호출을 시뮬레이션하여 MockEngine으로 클라이언트를 테스트하는 방법을 알아봅니다.
</link-summary>

Ktor는 엔드포인트에 실제로 연결하지 않고도 HTTP 호출을 시뮬레이션하는 [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html)을 제공합니다.

## 의존성 추가 {id="add_dependencies"}
`MockEngine`을 사용하려면 먼저 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            testImplementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            testImplementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 사용법 {id="usage"}

### 클라이언트 설정 공유 {id="share-config"}

`MockEngine`을 사용하여 클라이언트를 테스트하는 방법을 살펴보겠습니다. 클라이언트가 다음과 같이 구성되어 있다고 가정해 보겠습니다.
* 요청을 보내는 데 `CIO` [엔진](client-engines.md)이 사용됩니다.
* 수신되는 JSON 데이터를 역직렬화하기 위해 [Json](client-serialization.md) 플러그인이 설치되어 있습니다.

이 클라이언트를 테스트하려면, 해당 설정을 `MockEngine`을 사용하는 테스트 클라이언트와 공유해야 합니다. 설정을 공유하려면 생성자 파라미터로 엔진을 전달받고 클라이언트 설정을 포함하는 클라이언트 래퍼 클래스를 만들 수 있습니다.

```kotlin
@Serializable
data class IpResponse(val ip: String)
class ApiClient(engine: HttpClientEngine) {
    private val httpClient = HttpClient(engine) {
        install(ContentNegotiation) {
            json()
        }
    }

    suspend fun getIp(): IpResponse = httpClient.get("https://api.ipify.org/?format=json").body()

    suspend fun getUser(): String = httpClient.get("https://api.example.com/user").body()

    suspend fun getOrders(): String = httpClient.get("https://api.example.com/orders").body()
}
```

그런 다음 다음과 같이 `ApiClient`를 사용하여 `CIO` 엔진으로 HTTP 클라이언트를 생성하고 요청을 보낼 수 있습니다.

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
```

### 클라이언트 테스트 {id="test-client"}

클라이언트를 테스트하려면 요청 파라미터를 확인하고 필요한 콘텐츠(이 예제에서는 JSON 객체)로 응답할 수 있는 핸들러가 포함된 `MockEngine` 인스턴스를 생성해야 합니다.

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

그런 다음 생성된 `MockEngine`을 전달하여 `ApiClient`를 초기화하고 필요한 검증(assertion)을 수행할 수 있습니다.

```kotlin
class ApiClientTest {
    @Test
    fun sampleClientTest() {
        runTest {
            val mockEngine = MockEngine { request ->
                respond(
                    content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json")
                )
            }
            val apiClient = ApiClient(mockEngine)

            assertEquals("127.0.0.1", apiClient.getIp().ip)
        }
    }
```

### 여러 엔드포인트 모킹하기 {id="multiple-endpoints"}

클라이언트가 여러 URL을 호출할 때는 재사용 가능한 단일 핸들러를 사용하고 요청에 따라 분기 처리합니다(예: `request.url.encodedPath` 또는 호스트 기준). 이렇게 하면 호출 순서에 영향을 받지 않고 모의(mock)를 유지할 수 있습니다.

```kotlin
val mockEngine = MockEngine { request ->
    when (request.url.encodedPath) {
        "/user" -> respondOk("user-1")
        "/orders" -> respondOk("order-1,order-2")
        else -> error("Unhandled ${request.url}")
    }
}
```

`else` 브랜치에서는 예기치 않은 URL에 대해 실패하도록 처리하여, 테스트에서 누락된 모의 응답을 그대로 통과시키는 일이 없도록 하세요.
서로 다른 호스트에서 동일한 경로가 사용되는 경우에는 `request.url.host`를 기준으로 매칭할 수도 있습니다.

### 호출 체인 모킹하기 {id="call-chain"}

정해진 순서의 연속적인 호출에 대해 서로 다른 응답을 반환하려면, [`addHandler()`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine-config/add-handler.html) 함수로 여러 핸들러를 등록하고 `reuseHandlers` 프로퍼티를 `false`로 설정하여 각 핸들러를 한 번씩만 사용하도록 하세요.

```kotlin
val mockEngine = MockEngine.config {
    reuseHandlers = false
    addHandler { respondOk("step-1") }
    addHandler { respondOk("step-2") }
}
```

기본적으로 `reuseHandlers` 프로퍼티는 `true`로 설정되어 있으며 핸들러가 순환하여 재사용됩니다.

`reuseHandlers` 프로퍼티를 `false`로 설정하면 핸들러가 단 한 번만 사용됩니다. 모든 핸들러가 소진된 후 다음 요청이 들어오면 에러를 던져 요청을 거부합니다.

클라이언트를 먼저 빌드하고 나중에 응답을 큐에 등록(enqueue)해야 하는 테스트의 경우 [`MockEngine.Queue`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/-queue/index.html)를 사용하세요.

```kotlin
            val engine = MockEngine.Queue()
            val client = HttpClient(engine)

            engine += { respondOk("first") }
            engine += { respondOk("second") }
```

전체 예제는 여기에서 확인할 수 있습니다: [client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock).