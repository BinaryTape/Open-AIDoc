[//]: # (title: Ktor 3.2.0 の新機能)

<show-structure for="chapter,procedure" depth="2"/>

_[リリース日: 2025年6月12日](releases.md#release-details)_

この機能リリースのハイライトは以下の通りです：

* [バージョンカタログ](#published-version-catalog)
* [依存性の注入 (DI)](#dependency-injection)
* [第一級の HTMX サポート](#htmx-integration)
* [suspend 可能なモジュール関数](#suspendable-module-functions)

## Ktor Server

### suspend 可能なモジュール関数

Ktor 3.2.0 より、[アプリケーションモジュール](server-modules.md)で suspend 関数がサポートされました。

> suspend モジュールのサポート導入に伴い、開発モードでのオートリロードはブロッキング関数の参照では動作しなくなりました。詳細については、[開発モードのオートリロードに関するリグレッション](#regression)を参照してください。
>
{style="warning"}

以前は、Ktor モジュール内に非同期関数を追加するには `runBlocking` ブロックが必要であり、これがサーバー作成時のデッドロックにつながる可能性がありました：

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

今後は `suspend` キーワードを使用できるようになり、アプリケーションの起動時に非同期コードを記述できます：

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### モジュールの並行読み込み

`ktor.application.startup = concurrent` という Gradle プロパティを追加することで、モジュールの並行読み込みを選択することもできます。
これにより、すべてのアプリケーションモジュールが独立して起動するため、1 つのモジュールが中断（suspend）しても、他のモジュールはブロックされません。
これにより、依存性の注入のための非順次的な読み込みが可能になり、場合によっては読み込み速度が向上します。

詳細については、[並行モジュール](server-modules.md#concurrent-modules)を参照してください。

### 設定ファイルのデシリアライズ

Ktor 3.2.0 では、`Application` クラスの新しい `.property()` 拡張関数による型指定された設定の読み込みが導入されました。構造化された設定セクションを Kotlin のデータクラスに直接デシリアライズできるようになりました。

この機能により、設定値へのアクセスが簡素化され、ネストされた設定やグループ化された設定を扱う際のボイラープレートが大幅に削減されます。

以下の **application.yaml** ファイルを例に考えてみましょう：

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

以前は、各設定値を個別に取得する必要がありました。新しい `.property()` 拡張関数を使用すると、設定セクション全体を一度に読み込むことができます：

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // 設定を使用&#10;}"></code-block>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // 設定を使用&#10;}"></code-block>
</compare>

この機能は HOCON と YAML の両方の設定フォーマットをサポートしており、デシリアライズには `kotlinx.serialization` を使用します。

### `ApplicationTestBuilder` の `client` が構成可能に

Ktor 3.2.0 より、`ApplicationTestBuilder` クラスの `client` プロパティが可変（mutable）になりました。以前は読み取り専用でした。
この変更により、独自のテストクライアントを構成し、`ApplicationTestBuilder` クラスが利用可能な場所であればどこでも再利用できるようになります。例えば、拡張関数内からクライアントにアクセスできます：

```kotlin
@Test
fun testRouteAfterAuthorization() = testApplication {
    // クライアントを事前構成する
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
            
        defaultRequest { 
            contentType(ContentType.Application.Json)
        }
    }

    // 拡張関数として抽出された再利用可能なテストステップ
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

### 依存性の注入 (DI)

Ktor 3.2.0 では依存性の注入（DI）のサポートが導入され、設定ファイルやアプリケーションコードから直接、依存関係の管理と接続が容易になりました。新しい DI プラグインは、依存関係の解決を簡素化し、非同期読み込みをサポートし、自動クリーンアップを提供し、テストとスムーズに統合されます。

<var name="artifact_name" value="ktor-server-di" />

DI を使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含めます：

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

#### 基本的な依存関係の登録

ラムダ、関数参照、またはコンストラクタ参照を使用して依存関係を登録できます：

```kotlin
dependencies {
  // ラムダベース
  provide<GreetingService> { GreetingServiceImpl() }

  // 関数参照
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // ラムダを依存関係として登録する
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 設定ベースの依存関係の登録

設定ファイル内のクラスパス参照を使用して、宣言的に依存関係を構成できます。これは関数参照とクラス参照の両方をサポートしています：

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
  // 実装
}
```

引数は `@Property` や `@Named` などのアノテーションを通じて自動的に解決されます。

#### 依存関係の解決と注入

##### 依存関係の解決

依存関係を解決するには、プロパティ委譲または直接解決を使用できます：

```kotlin
// プロパティ委譲を使用する場合
val service: GreetingService by dependencies

// 直接解決する場合
val service = dependencies.resolve<GreetingService>()
```

##### 非同期の依存関係解決

非同期読み込みをサポートするために、サスペンド関数を使用できます：

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // 提供されるまでサスペンドする
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI プラグインは、すべての依存関係が準備できるまで `resolve()` 呼び出しを自動的にサスペンドします。

##### アプリケーションモジュールへの注入

モジュールパラメータを指定することで、アプリケーションモジュールに依存関係を直接注入できます。Ktor は DI コンテナからそれらを解決します：

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

特定のキーを持つ依存関係を注入するには、`@Named` を使用します：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // "mongo" という名前の依存関係を使用する
}
```

##### プロパティと設定の注入

`@Property` を使用して、設定値を直接注入します：

```yaml
connection:
  domain: api.example.com
  path: /v1
  protocol: https
```

```kotlin
val connection: Connection = application.property("connection")
```

これにより、構造化された設定の操作が簡素化され、プリミティブ型の自動パースもサポートされます。

詳細および高度な使用法については、[依存性の注入](server-dependency-injection.md)を参照してください。

### `testApplication` 内でのアプリケーションインスタンスへのアクセス

`ApplicationTestBuilder.application` プロパティを使用して、`testApplication {}` ブロックから実行中の `Application` インスタンスに直接アクセスできるようになりました。

以前は、`Application` インスタンスはネストされた `application {}` 構成ブロック内でのみ利用可能であったため、テストの後半でアプリケーションを参照するのが困難でした。新しい `application` プロパティは、構成および起動後の同じインスタンスを公開します。

次の例では、`application` プロパティを使用して、プラグインがインストールされたことをアサートしています：

```kotlin
@Test
fun testAccessApplicationInstance() = testApplication {
    // アプリケーションを構成する
    application {
        install(CORS)
    }

    // アプリケーションが起動していることを確認する
    startApplication()

    // テストから同じ Application インスタンスにアクセスする
    val app: Application = application

    assertTrue(app.pluginOrNull(CORS) != null)
}
```

### 開発モードのオートリロードに関するリグレッション {id="regression"}

suspend 関数のサポートに伴う副作用として、ブロッキング関数の参照（`Application::myModule`）がキャスト中に匿名内部クラスにラップされるようになりました。これにより、関数名が安定した参照として保持されなくなるため、オートリロードが機能しなくなります。

つまり、`development` モードでのオートリロードは、suspend 関数のモジュールおよび設定参照でのみ動作します：

```kotlin
// suspend 関数の参照
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 設定参照
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

## Ktor Client

### `SaveBodyPlugin` と `HttpRequestBuilder.skipSavingBody()` が非推奨に

Ktor 3.2.0 より前は、`SaveBodyPlugin` がデフォルトでインストールされていました。これはレスポンスボディ全体をメモリにキャッシュし、複数回のアクセスを可能にしていました。レスポンスボディを保存しないようにするには、プラグインを明示的に無効にする必要がありました。

Ktor 3.2.0 以降、`SaveBodyPlugin` は非推奨となり、ストリーミング以外のすべてのリクエストに対してレスポンスボディを自動的に保存する新しい内部プラグインに置き換えられました。これにより、リソース管理が向上し、HTTP レスポンスのライフサイクルが簡素化されます。

`HttpRequestBuilder.skipSavingBody()` も非推奨となりました。ボディをキャッシュせずにレスポンスを処理する必要がある場合は、代わりにストリーミングアプローチを使用してください。

<compare first-title="以前" second-title="以後">

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

このアプローチではレスポンスを直接ストリーミングし、ボディがメモリに保存されるのを防ぎます。

### `.wrapWithContent()` および `.wrap()` 拡張関数が非推奨に

Ktor 3.2.0 では、新しい `.replaceResponse()` 関数の導入に伴い、[`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) および [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 拡張関数が非推奨となりました。

`.wrapWithContent()` および `.wrap()` 関数は、元のレスポンスボディを、一度しか読み取ることができない `ByteReadChannel` で置き換えます。
新しいチャンネルを返す関数の代わりに、同じチャンネルインスタンスが直接渡されると、ボディを複数回読み取ることができず失敗します。
これはレスポンスボディにアクセスする異なるプラグイン間の互換性を損なう可能性があります。なぜなら、最初に読み取ったプラグインがボディを消費してしまうためです：

```kotlin
// rawContent から一度デコードされたチャンネルでボディを置き換える
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// 最初の呼び出しはボディを返す
decodedResponse.bodyAsText()

// それ以降の呼び出しは空文字列を返す
decodedResponse.bodyAsText() 
```

この問題を避けるには、代わりに `.replaceResponse()` 関数を使用してください。
この関数は、アクセスされるたびに新しいチャンネルを返すラムダを受け取るため、他のプラグインとの安全な統合が保証されます：

```kotlin
// アクセスのたびに新しいデコード済みチャンネルでボディを置き換える
call.replaceResponse {
    decode(response.rawContent)
}
```

### 解決された IP アドレスへのアクセス

`io.ktor.network.sockets.InetSocketAddress` インスタンスで新しい `.resolveAddress()` 関数を使用できるようになりました。
この関数を使用すると、関連付けられたホストの解決済み生の IP アドレスを取得できます：

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

解決された IP アドレスを `ByteArray` として返します。アドレスを解決できない場合は `null` を返します。
返される `ByteArray` のサイズは IP バージョンによって異なります。IPv4 アドレスの場合は 4 バイト、IPv6 アドレスの場合は 16 バイトになります。
JS および Wasm プラットフォームでは、`.resolveAddress()` は常に `null` を返します。

### HTTP キャッシュのクリア

必要に応じてキャッシュされた HTTP レスポンスをクリアするために、[`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) の新しいメソッドを使用できるようになりました。

- `.removeAll(url)`：指定された URL に一致するすべてのキャッシュエントリを削除します。
- `.remove(url, varyKeys)`：指定された URL および `Vary` キーに一致する特定のキャッシュエントリを削除します。

これらのメソッドにより、キャッシュの無効化や、古くなったレスポンスまたは特定のキャッシュされたレスポンスの管理をより詳細に制御できるようになります。

## Shared

### HTMX 統合

Ktor 3.2.0 では、`hx-get` や `hx-swap` などの HTML 属性を介して動的なインタラクションを可能にするモダンな JavaScript ライブラリである [HTMX](https://htmx.org/) の実験的サポートが導入されました。Ktor の HTMX 統合は以下を提供します：

- ヘッダーに基づいて HTMX リクエストを処理するための HTMX 対応ルーティング。
- Kotlin で HTMX 属性を生成するための HTML DSL 拡張。
- 文字列リテラルを排除するための HTMX ヘッダー定数と値。

Ktor の HTMX サポートは、以下の 3 つの実験的モジュールで利用可能です：

| モジュール             | 説明                                |
|--------------------|--------------------------------------------|
| `ktor-htmx`        | コア定義とヘッダー定数      |
| `ktor-htmx-html`   | Kotlin HTML DSL との統合       |
| `ktor-server-htmx` | HTMX 固有のリクエストに対するルーティングサポート |

すべての API は `@ExperimentalKtorApi` でマークされており、`@OptIn(ExperimentalKtorApi::class)` によるオプトインが必要です。
詳細については、[HTMX 統合](htmx-integration.md)を参照してください。

### Unix ドメインソケット

3.2.0 では、Unix ドメインソケットに接続するように Ktor クライアントを設定したり、そのようなソケットをリッスンするように Ktor サーバーを設定したりできます。
現在、Unix ドメインソケットは CIO エンジンでのみサポートされています。

サーバー構成の例：

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

Ktor クライアントを使用してそのソケットに接続する：

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

[デフォルトリクエスト](client-default-request.md#unix-domain-sockets)で Unix ドメインソケットを使用することもできます。

### ヘッダーとパラメータ構築のための新しい `.appendAll()` オーバーロード

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 関数に、`Map` または `vararg Pair` を受け取る新しいオーバーロードが追加されました。これにより、1 回の呼び出しで複数の値を追加でき、ヘッダー、URL パラメータ、その他の `StringValues` ベースのコレクションの構築が簡素化されます。

次の例は、これらの新しいオーバーロードの使用方法を示しています：

```kotlin
val headers = buildHeaders {
    // Map を使用する場合
    appendAll(mapOf("foo" to "bar", "baz" to "qux"))
    appendAll(mapOf("test" to listOf("1", "2", "3")))

    // vararg Pair を使用する場合
    appendAll("foo" to "bar", "baz" to "qux")
    appendAll("test" to listOf("1", "2", "3"))
}
```

## インフラストラクチャ

### 公開されたバージョンカタログ

このリリースにより、公式に[公開されたバージョンカタログ](server-dependencies.topic#using-version-catalog)を使用して、すべての Ktor 依存関係を単一のソースから管理できるようになりました。これにより、依存関係で Ktor のバージョンを手動で宣言する必要がなくなります。

カタログをプロジェクトに追加するには、**settings.gradle.kts** で Gradle のバージョンカタログを構成し、モジュールの **build.gradle.kts** ファイルでそれを参照します：

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

## Gradle プラグイン

### 開発モードの有効化

Ktor 3.2.0 では、開発モードの有効化が簡素化されました。以前は、開発モードを有効にするには `application` ブロックで明示的な構成が必要でした。現在は、`ktor.development` プロパティを使用して、動的または明示的に有効にできます：

* プロジェクトプロパティに基づいて動的に開発モードを有効にする。
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 開発モードを明示的に true に設定する。

    ```kotlin
    ktor {
        development = true
    }
    ```

デフォルトでは、Gradle プロジェクトプロパティまたはシステムプロパティ `io.ktor.development` のいずれかが定義されている場合、`ktor.development` の値はそこから自動的に解決されます。これにより、Gradle CLI フラグを使用して直接開発モードを有効にできます：

```bash
./gradlew run -Pio.ktor.development=true