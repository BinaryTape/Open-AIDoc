[//]: # (title: Ktor Client 中的測試)

<show-structure for="chapter" depth="3"/>

<var name="artifact_name" value="ktor-client-mock"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
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
Ktor 提供了 MockEngine，可在不連線至端點的情況下模擬 HTTP 呼叫。
</web-summary>

<link-summary>
了解如何使用 MockEngine 模擬 HTTP 呼叫來測試你的用戶端。
</link-summary>

Ktor 提供了 [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html)，可在不連線至端點的情況下模擬 HTTP 呼叫。

## 新增相依性 {id="add_dependencies"}
在使用 `MockEngine` 之前，你需要在建置指令碼中包含 `%artifact_name%` 構件。

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

## 用法 {id="usage"}

### 共用用戶端設定 {id="share-config"}

讓我們來看看如何使用 `MockEngine` 測試用戶端。假設用戶端具有以下設定：
* 使用 `CIO` [引擎](client-engines.md)發起請求。
* 安裝了 [Json](client-serialization.md) 外掛程式以反序列化傳入的 JSON 資料。

若要測試此用戶端，需要將其設定與使用 `MockEngine` 的測試用戶端共用。若要共用設定，你可以建立一個用戶端包裝類別，將引擎作為建構函式參數傳入，並包含用戶端設定。

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

接著，你可以依照以下方式使用 `ApiClient` 搭配 `CIO` 引擎建立 HTTP 用戶端並發起請求。

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
```

### 測試用戶端 {id="test-client"}

若要測試用戶端，你需要建立一個包含處理常式的 `MockEngine` 執行個體，該處理常式可以檢查請求參數並傳回所需的內容（在我們的例子中為 JSON 物件）。

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

接著，你可以傳入建立的 `MockEngine` 來初始化 `ApiClient` 並進行必要的判斷提示。

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

### 模擬多個端點 {id="multiple-endpoints"}

當用戶端呼叫多個 URL 時，請使用單一可重複使用的處理常式並根據請求進行分支判斷
（例如 `request.url.encodedPath` 或 host）。這能讓模擬與呼叫順序無關：

```kotlin
val mockEngine = MockEngine { request ->
    when (request.url.encodedPath) {
        "/user" -> respondOk("user-1")
        "/orders" -> respondOk("order-1,order-2")
        else -> error("Unhandled ${request.url}")
    }
}
```

在 `else` 分支中，針對非預期的 URL 拋出失敗，以避免測試在缺少對應模擬時仍預設通過。
當不同主機使用相同路徑時，你也可以依據 `request.url.host` 進行比對。

### 模擬呼叫鏈 {id="call-chain"}

若要在固定順序的連續呼叫中傳回不同的回應，請使用
[`addHandler()`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine-config/add-handler.html) 函式註冊多個處理常式，
並將 `reuseHandlers` 屬性設定為 `false`，以便每個處理常式僅使用一次：

```kotlin
val mockEngine = MockEngine.config {
    reuseHandlers = false
    addHandler { respondOk("step-1") }
    addHandler { respondOk("step-2") }
}
```

預設情況下，`reuseHandlers` 屬性設定為 `true`，處理常式會循環重複使用。

當 `reuseHandlers` 屬性設定為 `false` 時，處理常式僅會使用一次。如果所有處理常式都已被使用，下一個請求將會透過擲出錯誤來拒絕。

若測試需要先建置用戶端稍後再排入回應佇列，可以使用
[`MockEngine.Queue`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/-queue/index.html)：

```kotlin
            val engine = MockEngine.Queue()
            val client = HttpClient(engine)

            engine += { respondOk("first") }
            engine += { respondOk("second") }
```

你可以在此處找到完整範例：[client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock)。