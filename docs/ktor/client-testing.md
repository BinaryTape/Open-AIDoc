[//]: # (title: Ktor Client 中的测试)

<show-structure for="chapter" depth="3"/>

<var name="artifact_name" value="ktor-client-mock"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-testing-mock"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
Ktor 提供了 MockEngine，无需连接到实际端点即可模拟 HTTP 调用。
</web-summary>

<link-summary>
了解如何使用 MockEngine 通过模拟 HTTP 调用来测试客户端。
</link-summary>

Ktor 提供了 [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html)，无需连接到实际端点即可模拟 HTTP 调用。

## 添加依赖项 {id="add_dependencies"}
在使用 `MockEngine` 之前，需要在构建脚本中包含 `%artifact_name%` 工件。

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

### 共享客户端配置 {id="share-config"}

让我们了解如何使用 `MockEngine` 来测试客户端。假设客户端具有以下配置：
* 使用 `CIO` [引擎](client-engines.md) 发起请求。
* 安装了 [Json](client-serialization.md) 插件来反序列化传入的 JSON 数据。

为了测试此客户端，需要将其配置与使用 `MockEngine` 的测试客户端共享。要共享配置，可以创建一个客户端包装器类，该类接收一个引擎作为构造函数形参，并包含客户端配置。

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

然后，你可以按如下方式使用 `ApiClient` 来创建一个带有 `CIO` 引擎的 HTTP 客户端并发起请求。

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
```

### 测试客户端 {id="test-client"}

要测试客户端，你需要创建一个带有处理程序的 `MockEngine` 实例，该处理程序可以检查请求形参并返回所需的内容（在我们的示例中为 JSON 对象）。

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

然后，你可以传递创建的 `MockEngine` 来初始化 `ApiClient` 并进行必要的断言。

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

### 模拟多个端点 {id="multiple-endpoints"}

当客户端调用多个 URL 时，请使用单个可复用的处理程序并根据请求进行分支处理（例如通过 `request.url.encodedPath` 或主机）：这能使模拟不受调用顺序的影响：

```kotlin
val mockEngine = MockEngine { request ->
    when (request.url.encodedPath) {
        "/user" -> respondOk("user-1")
        "/orders" -> respondOk("order-1,order-2")
        else -> error("Unhandled ${request.url}")
    }
}
```

在 `else` 分支中，针对非预期的 URL 抛出异常，这样测试就不会在缺少模拟的情况下默认通过。
当不同主机使用相同路径时，你还可以根据 `request.url.host` 进行匹配。

### 模拟调用链 {id="call-chain"}

若要按固定顺序对连续调用返回不同的响应，可以使用 [`addHandler()`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine-config/add-handler.html) 函数注册多个处理程序，并将 `reuseHandlers` 属性设置为 `false` 以使每个处理程序仅使用一次：

```kotlin
val mockEngine = MockEngine.config {
    reuseHandlers = false
    addHandler { respondOk("step-1") }
    addHandler { respondOk("step-2") }
}
```

默认情况下，`reuseHandlers` 属性设置为 `true`，处理程序会循环复用。

当 `reuseHandlers` 属性设置为 `false` 时，处理程序仅使用一次。如果所有处理程序都已使用完毕，则下一个请求将通过抛出错误被拒绝。

对于先构建客户端、后将响应排入队列的测试，请使用 [`MockEngine.Queue`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/-queue/index.html)：

```kotlin
            val engine = MockEngine.Queue()
            val client = HttpClient(engine)

            engine += { respondOk("first") }
            engine += { respondOk("second") }
```

你可以在此处找到完整的示例：[client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock)。