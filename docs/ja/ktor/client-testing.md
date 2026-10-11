[//]: # (title: Ktor Client でのテスト)

<show-structure for="chapter" depth="3"/>

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
Ktor は、エンドポイントに接続することなく HTTP 呼び出しをシミュレートする MockEngine を提供します。
</web-summary>

<link-summary>
MockEngine を使用して HTTP 呼び出しをシミュレートし、クライアントをテストする方法を学びます。
</link-summary>

Ktor は、エンドポイントに接続することなく HTTP 呼び出しをシミュレートする [MockEngine](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/index.html) を提供します。

## 依存関係の追加 {id="add_dependencies"}
`MockEngine` を使用する前に、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

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

## 使用方法 {id="usage"}

### クライアント構成の共有 {id="share-config"}

`MockEngine` を使用してクライアントをテストする方法を見てみましょう。クライアントに次の構成があると仮定します:
* リクエストの実行に `CIO` [エンジン](client-engines.md) を使用している。
* 受信した JSON データをデシリアライズするために [Json](client-serialization.md) プラグインがインストールされている。

このクライアントをテストするには、その構成を `MockEngine` を使用するテスト用クライアントと共有する必要があります。構成を共有するには、エンジンをコンストラクターのパラメーターとして受け取り、クライアント構成を含むクライアントラッパークラスを作成します。

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

その後、以下のように `ApiClient` を使用して `CIO` エンジンを持つ HTTP クライアントを作成し、リクエストを実行できます。

```kotlin
fun main() {
    runBlocking {
        val client = ApiClient(CIO.create())
        val response = client.getIp()
        println(response.ip)
    }
```

### クライアントのテスト {id="test-client"}

クライアントをテストするには、リクエストパラメーターを確認し、必要なコンテンツ（今回の例では JSON オブジェクト）で応答できるハンドラーを持つ `MockEngine` インスタンスを作成する必要があります。

```kotlin
val mockEngine = MockEngine { request ->
    respond(
        content = ByteReadChannel("""{"ip":"127.0.0.1"}"""),
        status = HttpStatusCode.OK,
        headers = headersOf(HttpHeaders.ContentType, "application/json")
    )
}
```

次に、作成した `MockEngine` を渡して `ApiClient` を初期化し、必要なアサーションを実行します。

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

### 複数のエンドポイントのモック {id="multiple-endpoints"}

クライアントが複数の URL を呼び出す場合は、単一の再利用可能なハンドラーを使用し、リクエスト（例えば `request.url.encodedPath` やホスト）に基づいて分岐します。これにより、モックを呼び出し順序に依存しないように保つことができます:

```kotlin
val mockEngine = MockEngine { request ->
    when (request.url.encodedPath) {
        "/user" -> respondOk("user-1")
        "/orders" -> respondOk("order-1,order-2")
        else -> error("Unhandled ${request.url}")
    }
}
```

`else` 分岐では予期しない URL に対してエラーを発生させ、モックの欠落がテストで暗黙的に許容されないようにします。
また、異なるホストで同じパスが使用されている場合は、`request.url.host` でマッチングすることもできます。

### 呼び出しチェーンのモック {id="call-chain"}

固定された順序での連続した呼び出しに対して異なるレスポンスを返すには、[`addHandler()`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine-config/add-handler.html) 関数を使用して複数のハンドラーを登録し、`reuseHandlers` プロパティを `false` に設定して各ハンドラーを 1 回だけ使用するようにします:

```kotlin
val mockEngine = MockEngine.config {
    reuseHandlers = false
    addHandler { respondOk("step-1") }
    addHandler { respondOk("step-2") }
}
```

デフォルトでは `reuseHandlers` プロパティは `true` に設定されており、ハンドラーは循環して再利用されます。

`reuseHandlers` プロパティを `false` に設定すると、ハンドラーは 1 回だけ使用されます。すべてのハンドラーが使用された場合、次のリクエストはエラーをスローして拒否されます。

クライアントを先に構築し、後からレスポンスをエンキューするテストの場合は、[`MockEngine.Queue`](https://api.ktor.io/ktor-client-mock/io.ktor.client.engine.mock/-mock-engine/-queue/index.html) を使用します:

```kotlin
            val engine = MockEngine.Queue()
            val client = HttpClient(engine)

            engine += { respondOk("first") }
            engine += { respondOk("second") }
```

完全なサンプルはこちらで確認できます: [client-testing-mock](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-testing-mock)。