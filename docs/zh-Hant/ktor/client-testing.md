[//]: # (title: 在 Ktor Client 中進行測試)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-client-mock"/>

<tldr>
<p>
<b>所需的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-testing-mock"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
Ktor 提供了一個 MockEngine，可以在不連接到端點的情況下模擬 HTTP 呼叫。
</web-summary>

<link-summary>
了解如何透過使用 MockEngine 模擬 HTTP 呼叫來測試您的用戶端。
</link-summary>

Ktor 提供了一個 [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html)，可以在不連接到端點的情況下模擬 HTTP 呼叫。

## 新增相依性 {id="add_dependencies"}
在正式使用 `MockEngine` 之前，您需要將 `%artifact_name%` 構件包含在建置指令碼中。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            testImplementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            testImplementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## 用法 {id="usage"}

### 共享用戶端配置 {id="share-config"}

讓我們看看如何使用 `MockEngine` 來測試用戶端。假設用戶端具有以下配置：
* 使用 `CIO` [引擎](client-engines.md)來發送請求。
* 安裝了 [Json](client-serialization.md) 外掛程式以還原序列化傳入的 JSON 資料。

要測試此用戶端，其配置需要與使用 `MockEngine` 的測試用戶端共享。若要共享配置，您可以建立一個用戶端包裝類別，該類別將引擎作為建構函式參數，並包含用戶端配置。

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
}
```

然後，您可以按照以下方式使用 `ApiClient`，以 `CIO` 引擎建立 HTTP 用戶端並發送請求。

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
}
```

### 測試用戶端 {id="test-client"}

要測試用戶端，您需要建立一個 `MockEngine` 執行個體，並搭配一個可以檢查請求參數並以所需內容（在我們的案例中為 JSON 物件）進行回應的處理常式。

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

然後，您可以傳遞建立的 `MockEngine` 來初始化 `ApiClient` 並進行必要的斷言。

```kotlin
class ApiClientTest {
    @Test
    fun sampleClientTest() {
        runBlocking {
            val mockEngine = MockEngine { request ->
                respond(
                    content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
                    status = HttpStatusCode.OK,
                    headers = headersOf(HttpHeaders.ContentType, "application/json")
                )
            }
            val apiClient = ApiClient(mockEngine)

            Assert.assertEquals("127.0.0.1", apiClient.getIp().ip)
        }
    }
}
```

您可以在此處找到完整範例：[client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock)。