[//]: # (title: Ktor 3.2.0 の新機能)

<show-structure for="chapter,procedure" depth="2"/>

_[リリース日: 2025年6月12日](releases.md#release-details)_

今回のフィーチャーリリースの主なハイライトは以下のとおりです。

* [Version Catalog](#published-version-catalog)
* [依存性の注入 (Dependency Injection)](#dependency-injection)
* [ファーストクラスの HTMX サポート](#htmx-integration)
* [中断可能なモジュール関数](#suspendable-module-functions)

## Ktor Server {id="ktor-server"}

### 中断可能なモジュール関数 {id="suspendable-module-functions"}

Ktor 3.2.0 以降、[アプリケーションモジュール](server-modules.md)で中断可能（suspendable）な関数がサポートされるようになりました。

> 中断モジュールサポートの導入に伴い、開発モードでの自動リロード（auto-reload）はブロッキング関数の参照では機能しなくなりました。詳細については、[開発モードの自動リロードにおけるリグレッション](#regression)を参照してください。
>
{style="warning"}

以前は、Ktor モジュール内に非同期関数を追加する場合、サーバー作成時にデッドロックを引き起こす可能性がある `runBlocking` ブロックが必要でした。

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

今後は `suspend` キーワードを使用できるようになり、アプリケーション起動時に非同期コードを実行できます。

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### モジュールの並行読み込み {id="concurrent-module-loading"}

`ktor.application.startup = concurrent` という Gradle プロパティを追加することで、モジュールの並行読み込み（concurrent module loading）を有効にすることもできます。
これにより、すべてのアプリケーションモジュールが独立して起動されるため、あるモジュールが中断（suspend）しても、他のモジュールがブロックされることはありません。
これにより、依存性の注入における非順次読み込みが可能になり、場合によっては読み込みが高速化されます。

詳細については、[並行モジュール](server-modules.md#concurrent-modules)を参照してください。

### 設定ファイルのデシリアライズ {id="configuration-file-deserialization"}

Ktor 3.2.0 では、`Application` クラスに新しい `.property()` 拡張機能が追加され、型付けされた設定の読み込みが導入されました。構造化された設定セクションを Kotlin のデータクラスに直接デシリアライズできるようになりました。

この機能により、設定値へのアクセス方法が簡素化され、ネストされた設定やグループ化された設定を扱う際のボイラープレートが大幅に削減されます。

次の **application.yaml** ファイルを考えてみましょう。

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

以前は、各設定値を個別に取得する必要がありました。新しい `.property()` 拡張機能を使用すると、設定セクション全体を一度に読み込むことができます。

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // 設定を使用&#10;}"/>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // 設定を使用&#10;}"/>
</compare>

この機能は HOCON と YAML の両方の設定フォーマットをサポートし、デシリアライズには `kotlinx.serialization` を使用します。

### `ApplicationTestBuilder` の `client` が設定可能に {id="applicationtestbuilder-has-a-configurable-client"}

Ktor 3.2.0 以降、`ApplicationTestBuilder` クラスの `client` プロパティがミュータブル（変更可能）になりました。以前は読み取り専用でした。
この変更により、独自のテストクライアントを設定し、`ApplicationTestBuilder` クラスが使用できる場所であればどこでも再利用できるようになります。例えば、拡張関数内からクライアントにアクセスできます。

```kotlin
@Test
fun testRouteAfterAuthorization() = testApplication {
    // クライアントを事前設定
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

### 依存性の注入 (Dependency Injection) {id="dependency-injection"}

Ktor 3.2.0 では、依存性の注入（DI）サポートが導入され、設定ファイルやアプリケーションコードから直接依存関係を管理および接続（ワイヤリング）しやすくなりました。新しい DI プラグインにより、依存関係の解決が簡素化され、非同期読み込みがサポートされ、自動クリーンアップが提供され、テストとのスムーズな統合が可能になります。

<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

DI を使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含めます。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 基本的な依存関係の登録 {id="basic-dependency-registration"}

ラムダ、関数参照、またはコンストラクタ参照を使用して依存関係を登録できます。

```kotlin
dependencies {
  // ラムダベース
  provide<GreetingService> { GreetingServiceImpl() }

  // 関数参照
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // ラムダを依存関係として登録
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 設定ベースの依存関係の登録 {id="configuration-based-dependency-registration"}

設定ファイル内でクラスパス参照を使用して、宣言的に依存関係を設定できます。これは関数参照とクラス参照の両方をサポートしています。

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

#### 依存関係の解決と注入 {id="dependency-resolution-and-injection"}

##### 依存関係の解決 {id="resolving-dependencies"}

依存関係を解決するには、プロパティ委任または直接解決を使用できます。

```kotlin
// プロパティ委任を使用
val service: GreetingService by dependencies

// 直接解決
val service = dependencies.resolve<GreetingService>()
```

##### 非同期の依存関係の解決 {id="asynchronous-dependency-resolution"}

非同期読み込みをサポートするために、中断関数（suspending function）を使用できます。

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // 提供されるまで中断
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI プラグインは、すべての依存関係の準備が整うまで、自動的に `resolve()` の呼び出しを中断します。

##### アプリケーションモジュールへの注入 {id="injecting-into-application-modules"}

モジュールパラメータを指定することで、アプリケーションモジュールに依存関係を直接注入できます。Ktor は DI コンテナからそれらを解決します。

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

特定のキーが割り当てられた依存関係を注入するには `@Named` を使用します。

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // "mongo" という名前の依存関係を使用
}
```

##### プロパティと設定の注入 {id="property-and-configuration-injection"}

設定値を直接注入するには `@Property` を使用します。

```yaml
connection:
  domain: api.example.com
  path: /v1
  protocol: https
```

```kotlin
val connection: Connection = application.property("connection")
```

これにより、構造化された設定の扱いが簡素化され、プリミティブ型の自動パースもサポートされます。

詳細および高度な使用法については、[依存性の注入](server-dependency-injection.md)を参照してください。

### `testApplication` 内でアプリケーションインスタンスにアクセス {id="access-the-application-instance-in-testapplication"}

`ApplicationTestBuilder.application` プロパティを使用して、`testApplication {}` ブロックから実行中の `Application` インスタンスに直接アクセスできるようになりました。

以前は、`Application` インスタンスはネストされた `application {}` 設定ブロック内でのみ利用可能であったため、テストの後続処理でアプリケーションを参照することが困難でした。新しい `application` プロパティにより、設定および起動後の同じインスタンスが公開されます。

以下の例では、`application` プロパティを使用してプラグインがインストールされたことをアサートしています。

```kotlin
@Test
fun testAccessApplicationInstance() = testApplication {
    // アプリケーションを設定
    application {
        install(CORS)
    }

    // アプリケーションが起動されていることを確認
    startApplication()

    // テストから同じ Application インスタンスにアクセス
    val app: Application = application

    assertTrue(app.pluginOrNull(CORS) != null)
}
```

### 開発モードの自動リロードにおけるリグレッション {id="regression"}

中断関数のサポートに伴う副作用として、ブロッキング関数の参照（`Application::myModule`）がキャスト時に匿名内部クラスにラップされるようになりました。これにより、関数名が安定した参照として保持されなくなるため、自動リロードが機能しなくなります。

つまり、`development` モードでの自動リロードは、suspend 関数のモジュールおよび設定参照でのみ機能します。

```kotlin
// Suspend 関数の参照
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 設定参照
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

## Ktor Client {id="ktor-client"}

### `SaveBodyPlugin` と `HttpRequestBuilder.skipSavingBody()` が非推奨に {id="savebodyplugin-and-httprequestbuilder-skipsavingbody-are-deprecated"}

Ktor 3.2.0 より前は、`SaveBodyPlugin` がデフォルトでインストールされていました。これはレスポンスボディ全体をメモリにキャッシュし、複数回アクセスできるようにしていました。レスポンスボディの保存を回避するには、プラグインを明示的に無効にする必要がありました。

Ktor 3.2.0 以降、`SaveBodyPlugin` は非推奨となり、ストリーミング以外のすべてのリクエストに対してレスポンスボディを自動的に保存する新しい内部プラグインに置き換えられました。これにより、リソース管理が改善され、HTTP レスポンスのライフサイクルが簡素化されます。

`HttpRequestBuilder.skipSavingBody()` も非推奨になりました。ボディをキャッシュせずにレスポンスを処理する必要がある場合は、代わりにストリーミングアプローチを使用してください。

<compare first-title="変更前" second-title="変更後">

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

このアプローチでは、レスポンスを直接ストリーミングするため、ボディがメモリに保存されるのを防ぐことができます。

### `.wrapWithContent()` および `.wrap()` 拡張関数が非推奨に {id="the-wrapwithcontent-and-wrap-extension-functions-are-deprecated"}

Ktor 3.2.0 では、[`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) および [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 拡張関数が非推奨となり、新しい `.replaceResponse()` 関数が推奨されます。

`.wrapWithContent()` および `.wrap()` 関数は、元のレスポンスボディを一度しか読み取れない `ByteReadChannel` に置き換えます。新しいチャネルを返す関数の代わりに同じチャネルインスタンスを直接渡すと、ボディを複数回読み取ることができなくなります。これにより、最初に読み取ったプラグインがボディを消費してしまうため、レスポンスボディにアクセスする異なるプラグイン間の互換性が損なわれる可能性があります。

```kotlin
// rawContent から一度デコードされたチャネルでボディを置き換える
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// 初回の呼び出しはボディを返す
decodedResponse.bodyAsText()

// その後の呼び出しは空文字列を返す
decodedResponse.bodyAsText() 
```

この問題を回避するには、代わりに `.replaceResponse()` 関数を使用してください。
この関数は、アクセスごとに新しいチャネルを返すラムダを受け取るため、他のプラグインとの安全な統合が保証されます。

```kotlin
// アクセスごとに新しいデコード済みチャネルでボディを置き換える
call.replaceResponse {
    decode(response.rawContent)
}
```

### 解決された IP アドレスへのアクセス {id="access-resolved-ip-address"}

`io.ktor.network.sockets.InetSocketAddress` インスタンスで新しい `.resolveAddress()` 関数を使用できるようになりました。
この関数を使用すると、関連付けられたホストの名前解決された生（raw）の IP アドレスを取得できます。

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

この関数は、解決された IP アドレスを `ByteArray` として返すか、アドレスを解決できない場合は `null` を返します。
返される `ByteArray` のサイズは IP のバージョンによって異なり、IPv4 アドレスの場合は 4 バイト、IPv6 アドレスの場合は 16 バイトになります。
JS および Wasm プラットフォームでは、`.resolveAddress()` は常に `null` を返します。

### HTTP キャッシュのクリア {id="http-cache-clearing"}

必要に応じてキャッシュされた HTTP レスポンスをクリアするために、[`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) の新しいメソッドを使用できるようになりました。

- `.removeAll(url)` は、指定された URL に一致するすべてのキャッシュエントリを削除します。
- `.remove(url, varyKeys)` は、指定された URL および `Vary` キーに一致する特定のキャッシュエントリを削除します。

これらのメソッドにより、キャッシュの無効化や、古くなったまたは特定のキャッシュ済みレスポンスの管理をより細かく制御できるようになります。

## Shared {id="shared"}

### HTMX の統合 {id="htmx-integration"}

Ktor 3.2.0 では、`hx-get` や `hx-swap` などの HTML 属性を介して動的なインタラクションを可能にする最新の JavaScript ライブラリである [HTMX](https://htmx.org/) の実験的サポートが導入されました。Ktor の HTMX 統合により、以下が提供されます。

- ヘッダーに基づいて HTMX リクエストを処理するための HTMX 対応ルーティング。
- Kotlin で HTMX 属性を生成するための HTML DSL 拡張機能。
- 文字列リテラルを排除するための HTMX ヘッダー定数と値。

Ktor の HTMX サポートは、3 つの実験的モジュールで利用できます。

| モジュール             | 説明                                       |
|--------------------|--------------------------------------------|
| `ktor-htmx`        | コア定義とヘッダー定数                     |
| `ktor-htmx-html`   | Kotlin HTML DSL との統合                   |
| `ktor-server-htmx` | HTMX 固有のリクエストに対するルーティングサポート |

すべての API は `@ExperimentalKtorApi` でマークされており、`@OptIn(ExperimentalKtorApi::class)` によるオプトインが必要です。
詳細については、[HTMX の統合](htmx-integration.md)を参照してください。

### Unix ドメインソケット {id="unix-domain-sockets"}

3.2.0 では、Unix ドメインソケットに接続する Ktor クライアントや、そのようなソケットをリッスンする Ktor サーバーをセットアップできるようになりました。
現在、Unix ドメインソケットは CIO エンジンでのみサポートされています。

サーバー設定の例:

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

Ktor クライアントを使用してそのソケットに接続する例:

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

[デフォルトリクエスト](client-default-request.md#unix-domain-sockets)で Unix ドメインソケットを使用することもできます。

### ヘッダーやパラメータ構築用の新しい `.appendAll()` オーバーロード {id="new-appendall-overloads-for-building-headers-and-parameters"}

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 関数に、`Map` または `vararg Pair` を受け取る新しいオーバーロードが追加されました。これにより、1 回の呼び出しで複数の値を追加できるようになり、ヘッダー、URL パラメータ、その他の `StringValues` ベースのコレクションの構築が簡素化されます。

以下の例は、これらの新しいオーバーロードを使用する方法を示しています。

```kotlin
val headers = buildHeaders {
    // Map を使用
    appendAll(mapOf("foo" to "bar", "baz" to "qux"))
    appendAll(mapOf("test" to listOf("1", "2", "3")))

    // vararg Pair を使用
    appendAll("foo" to "bar", "baz" to "qux")
    appendAll("test" to listOf("1", "2", "3"))
}
```

## インフラストラクチャ {id="infrastructure"}

### 公開された Version Catalog {id="published-version-catalog"}

今回のリリースより、公式に[公開された Version Catalog](server-dependencies.topic#using-version-catalog) を使用して、単一のソースからすべての Ktor 依存関係を管理できるようになりました。これにより、依存関係で Ktor のバージョンを手動で宣言する必要がなくなります。

カタログをプロジェクトに追加するには、**settings.gradle.kts** で Gradle の Version Catalog を設定し、モジュールの **build.gradle.kts** ファイルでそれを参照します。

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

## Gradle プラグイン {id="gradle-plugin"}

### 開発モードの有効化 {id="enabling-development-mode"}

Ktor 3.2.0 では、開発モードの有効化が簡素化されました。以前は、開発モードを有効にするには `application` ブロックで明示的な設定が必要でした。今後は、動的または明示的に `ktor.development` プロパティを使用して有効にできます。

* プロジェクトプロパティに基づいて動的に開発モードを有効化
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 明示的に開発モードを true に設定

    ```kotlin
    ktor {
        development = true
    }
    ```

デフォルトでは、Gradle のプロジェクトプロパティまたはシステムプロパティ `io.ktor.development` のいずれかが定義されている場合、`ktor.development` の値は自動的にそこから解決されます。これにより、Gradle CLI フラグを使用して開発モードを直接有効にできます。

```bash
./gradlew run -Pio.ktor.development=true
```