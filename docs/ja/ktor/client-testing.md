[//]: # (title: Ktor Client のテスト)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-client-mock"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-testing-mock"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
Ktor は、エンドポイントに接続せずに HTTP 呼び出しをシミュレートする MockEngine を提供します。
</web-summary>

<link-summary>
HTTP 呼び出しをシミュレートして、MockEngine でクライアントをテストする方法を学びます。
</link-summary>

Ktor は、エンドポイントに接続せずに HTTP 呼び出しをシミュレートする [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html) を提供します。

## 依存関係の追加 {id="add_dependencies"}
`MockEngine` を使用する前に、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

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

## 使い方 {id="usage"}

### クライアント設定の共有 {id="share-config"}

`MockEngine` を使用してクライアントをテストする方法を見てみましょう。クライアントが次の設定を持っていると仮定します。
* リクエストの作成に `CIO` [エンジン](client-engines.md)が使用されている。
* 受信した JSON データをデシリアライズするために [Json](client-serialization.md) プラグインがインストールされている。

このクライアントをテストするには、その設定を `MockEngine` を使用するテストクライアントと共有する必要があります。設定を共有するには、エンジンをコンストラクタパラメータとして受け取り、クライアント設定を含むクライアントラッパークラスを作成します。

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

その後、次のように `ApiClient` を使用して `CIO` エンジンで HTTP クライアントを作成し、リクエストを行うことができます。

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
}
```

### クライアントのテスト {id="test-client"}

クライアントをテストするには、リクエストパラメータをチェックし、必要なコンテンツ（今回の場合は JSON オブジェクト）でレスポンスを返すハンドラーを備えた `MockEngine` インスタンスを作成する必要があります。

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

その後、作成した `MockEngine` を渡して `ApiClient` を初期化し、必要なアサーションを実行できます。

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

完全な例はこちらで確認できます: [client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock)。