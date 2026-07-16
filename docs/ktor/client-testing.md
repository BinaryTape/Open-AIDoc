[//]: # (title: 在 Ktor Client 中进行测试)

<show-structure for="chapter" depth="2"/>

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
Ktor 提供了一个 MockEngine，可以在不连接到端点的情况下模拟 HTTP 调用。
</web-summary>

<link-summary>
了解如何通过模拟 HTTP 调用使用 MockEngine 测试您的客户端。
</link-summary>

Ktor 提供了一个 [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html)，可以在不连接到端点的情况下模拟 HTTP 调用。

## 添加依赖项 {id="add_dependencies"}
在使用 `MockEngine` 之前，您需要在构建脚本中包含 `%artifact_name%` 构件。

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

### 共享客户端配置 {id="share-config"}

让我们来看看如何使用 `MockEngine` 测试客户端。假设客户端具有以下配置：
* 使用 `CIO` [引擎](client-engines.md) 发送请求。
* 安装了 [Json](client-serialization.md) 插件以反序列化传入的 JSON 数据。

为了测试此客户端，需要将其配置与使用 `MockEngine` 的测试客户端共享。要共享配置，您可以创建一个客户端包装器类，该类将引擎作为构造函数形参并包含客户端配置。

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

然后，您可以按照以下方式使用 `ApiClient` 来创建一个带有 `CIO` 引擎的 HTTP 客户端并发送请求。

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
}
```

### 测试客户端 {id="test-client"}

要测试客户端，您需要创建一个 `MockEngine` 实例，并带有一个可以检查请求参数并使用所需内容（在本例中为 JSON 对象）进行响应的处理程序。

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

然后，您可以传递创建好的 `MockEngine` 来初始化 `ApiClient` 并进行必要的断言。

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

您可以在此处找到完整示例：[client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock)。