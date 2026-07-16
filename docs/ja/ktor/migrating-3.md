[//]: # (title: 2.2.x から 3.0.x への移行)

<show-structure for="chapter" depth="3"/>

このガイドでは、Ktor アプリケーションを 2.2.x バージョンから 3.0.x へ移行する方法について説明します。

## Ktor サーバー {id="server"}

### `ApplicationEngine`、`ApplicationEnvironment`、および `Application`

設定可能性を向上させ、`ApplicationEngine`、`ApplicationEnvironment`、および `Application` インスタンス間の分離をより明確にするために、いくつかの設計変更が導入されました。

v3.0.0 より前は、`ApplicationEngine` が `ApplicationEnvironment` を管理し、さらに `ApplicationEnvironment` が `Application` を管理していました。

しかし、現在の設計では、`Application` が `ApplicationEngine` と `ApplicationEnvironment` の両方を作成、所有、および開始する責任を負います。

この再構築に伴い、以下の破壊的変更（breaking changes）が発生します。

- [`ApplicationEngineEnvironmentBuilder` および `applicationEngineEnvironment` クラスの名前が変更されました](#renamed-classes)。
- [`start()` および `stop()` メソッドが `ApplicationEngineEnvironment` から削除されました](#ApplicationEnvironment)。
- [`commandLineEnvironment()` が削除されました](#CommandLineConfig)。
- [`ServerConfigBuilder` が導入されました](#ServerConfigBuilder)。
- [`embeddedServer()` が `ApplicationEngine` の代わりに `EmbeddedServer` を返すようになりました](#EmbeddedServer)。

これらの変更は、以前のモデルに依存している既存のコードに影響を与えます。

#### クラス名の変更 {id="renamed-classes"}

| パッケージ | 2.x.x | 3.0.x |
|----------------------------|---------------------------------------|---------------------------------|
| `io.ktor:ktor-server-core` | `ApplicationEngineEnvironmentBuilder` | `ApplicationEnvironmentBuilder` |
| `io.ktor:ktor-server-core` | `applicationEngineEnvironment`        | `applicationEnvironment`        |

#### `start()` および `stop()` メソッドが `ApplicationEngineEnvironment` から削除されました {id="ApplicationEnvironment"}

`ApplicationEngineEnvironment` が [`ApplicationEnvironment`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/index.html) に統合されたことに伴い、`start()` および `stop()` メソッドは [`ApplicationEngine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/index.html) を通じてのみアクセス可能になりました。

| 2.x.x                                                 | 3.0.x                                |
|-------------------------------------------------------|--------------------------------------|
| `ApplicationEngineEnvironment.start()`                | `ApplicationEngine.start()`          |
| `ApplicationEngineEnvironment.stop()`                 | `ApplicationEngine.stop()`           |

さらに、以下の表は削除されたプロパティと、それに対応する現在の所有関係を示しています。

| 2.x.x                                           | 3.0.x                                        |
|-------------------------------------------------|----------------------------------------------|
| `ApplicationEngineEnvironment.connectors`       | `ApplicationEngine.Configuration.connectors` |
| `ApplicationEnvironment.developmentMode`        | `Application.developmentMode`                |
| `ApplicationEnvironment.monitor`                | `Application.monitor`                        |
| `ApplicationEnvironment.parentCoroutineContext` | `Application.parentCoroutineContext`         |
| `ApplicationEnvironment.rootPath`               | `Application.rootPath`                       |

所有関係の変更は、以下の例で確認できます。

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import org.slf4j.helpers.NOPLogger

fun defaultServer(module: Application.() -> Unit) =
  embeddedServer(CIO,
    environment = applicationEngineEnvironment {
      log = NOPLogger.NOP_LOGGER
      connector { 
          port = 8080
      }
      module(module)
    }
  )
```

{validate="false"}

```kotlin
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import org.slf4j.helpers.NOPLogger

fun defaultServer(module: Application.() -> Unit) =
  embeddedServer(CIO,
    environment = applicationEnvironment { log = NOPLogger.NOP_LOGGER },
    configure = {
      connector {
          port = 8080
      }
    },
    module
  )
```

</compare>

#### `commandLineEnvironment()` が削除されました {id="CommandLineConfig"}

コマンドライン引数から `ApplicationEngineEnvironment` インスタンスを作成するために使用されていた `commandLineEnvironment()` 関数は、Ktor `3.0.0` で削除されました。代わりに、[`CommandLineConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html) 関数を使用して、コマンドライン引数を設定オブジェクトにパースできます。

アプリケーションを `commandLineEnvironment` から `CommandLineConfig` に移行するには、以下に示すように `commandLineEnvironment()` を `configure` ブロックに置き換えてください。

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty, commandLineEnvironment(args) {
        connector { port = 8080 }
        module {
            routing {
                get("/") {
                    call.respondText("Hello, world!")
                }
            }
        }
    }) {
        requestReadTimeoutSeconds = 5
        responseWriteTimeoutSeconds = 5
    }.start(wait = true)
}
```

```kotlin
fun main(args: Array<String>) {
    embeddedServer(
        factory = Netty,
        configure = {
            val cliConfig = CommandLineConfig(args)
            takeFrom(cliConfig.engineConfig)
            loadCommonConfiguration(cliConfig.rootConfig.environment.config)
        }
    ) {
        routing {
            get("/") {
                call.respondText("Hello, world!")
            }
        }
    }.start(wait = true)
}
```

</compare>

`embeddedServer` を使用したコマンドライン設定の詳細については、[コードでの設定](server-configuration-code.topic#command-line)のトピックを参照してください。

#### `ServerConfigBuilder` の導入 {id="ServerConfigBuilder"}

サーバープロパティを設定するための新しいエンティティである [`ServerConfigBuilder`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config-builder/index.html) が導入され、以前の `ApplicationPropertiesBuilder` 設定メカニズムを置き換えました。
`ServerConfigBuilder` は [`ServerConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-config/index.html) クラスのインスタンスを構築するために使用されます。このクラスは、以前 `ApplicationProperties` によって管理されていたモジュール、パス、および環境の詳細を保持するようになりました。

主な変更点は以下の通りです。

| パッケージ | 2.x.x | 3.0.x |
|----------------------------|--------------------------------|-----------------------|
| `io.ktor:ktor-server-core` | `ApplicationProperties`        | `ServerConfig`        |
| `io.ktor:ktor-server-core` | `ApplicationPropertiesBuilder` | `ServerConfigBuilder` |

さらに、`embeddedServer()` 関数では、この新しい設定アプローチを反映するために `applicationProperties` 属性が `rootConfig` に名前変更されました。

`embeddedServer()` を使用する場合は、`applicationProperties` 属性を `rootConfig` に置き換えてください。
以下は、`developmentMode` を明示的に `true` に設定してサーバーを構成する `serverConfig` ブロックの使用例です。

```kotlin
fun main(args: Array<String>) {
    embeddedServer(Netty,
        serverConfig {
            developmentMode = true
            module(Application::module)
        },
        configure = {
            connector { port = 12345 }
        }
    ).start(wait = true)
}
```

#### `EmbeddedServer` の導入 {id="EmbeddedServer"}

[`EmbeddedServer`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-embedded-server/index.html) クラスが導入され、`embeddedServer()` 関数の戻り値の型として `ApplicationEngine` の代わりに使用されるようになりました。

モデルの変更に関する詳細は、[YouTrack の issue KTOR-3857](https://youtrack.jetbrains.com/issue/KTOR-3857/Environment-Engine-Application-Design) を参照してください。

### テスト

##### `withTestApplication` および `withApplication` が削除されました

[`2.0.0` リリースで以前に非推奨となった](migration-to-20x.md#testing-api) `withTestApplication` および `withApplication` 関数が、`ktor-server-test-host` パッケージから完全に削除されました。

代わりに、`testApplication` 関数を既存の [Ktor クライアント](client-create-and-configure.md) インスタンスと一緒に使用して、サーバーにリクエストを送信し、結果を検証してください。

以下のテストでは、`handleRequest` 関数が `client.get` リクエストに置き換えられています。

<compare first-title="1.x.x" second-title="3.0.x">

```kotlin
@Test
fun testRootLegacyApi() {
    withTestApplication(Application::module) {
        handleRequest(HttpMethod.Get, "/").apply {
            assertEquals(HttpStatusCode.OK, response.status())
            assertEquals("Hello, world!", response.content)
        }
    }
}
```

```kotlin
@Test
fun testRoot() = testApplication {
    val response = client.get("/")
    assertEquals(HttpStatusCode.OK, response.status)
    assertEquals("Hello, world!", response.bodyAsText())
}
```

</compare>

詳細については、[Ktor Server でのテスト](server-testing.md)を参照してください。

#### `TestApplication` のモジュール読み込み {id="test-module-loading"}

`TestApplication` は、設定ファイル（例：`application.conf`）からモジュールを自動的に読み込まなくなりました。代わりに、`testApplication` 関数内で[モジュールを明示的に読み込む](#explicit-module-loading)か、[設定ファイルを手動で読み込む](#configure-env)必要があります。

##### 明示的なモジュールの読み込み {id="explicit-module-loading"}

モジュールを明示的に読み込むには、`testApplication` 内で `application` 関数を使用します。この方法により、読み込むモジュールを手動で指定でき、テストのセットアップをより細かく制御できます。

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
  @Test
  fun testRoot() = testApplication {
    client.get("/").apply {
      assertEquals(HttpStatusCode.OK, status)
      assertEquals("Hello World!", bodyAsText())
    }
  }
}
```

{validate="false"}

```kotlin
import com.example.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
  @Test
  fun testRoot() = testApplication {
    application {
      configureRouting()
    }
    client.get("/").apply {
      assertEquals(HttpStatusCode.OK, status)
      assertEquals("Hello World!", bodyAsText())
    }
  }
}

```

{validate="false"}

</compare>

##### 設定ファイルからモジュールを読み込む {id="configure-env"}

設定ファイルからモジュールを読み込みたい場合は、`environment` 関数を使用してテスト用の設定ファイルを指定します。

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

テストアプリケーションの設定の詳細については、[Ktor Server でのテスト](server-testing.md)セクションを参照してください。

### `CallLogging` プラグインのパッケージ名が変更されました

[`CallLogging`](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/index.html) プラグインのパッケージ名が、タイポ修正のため変更されました。

| 2.x.x | 3.0.x |
|-------------------------------------|--------------------------------------|
| `io.ktor.server.plugins.callloging` | `io.ktor.server.plugins.calllogging` |

### `ktor-server-host-common` モジュールが削除されました

`Application` が `ApplicationEngine` の情報を必要とするようになったため、`ktor-server-host-common` モジュールの内容は `ktor-server-core`、具体的には [`io.ktor.server.engine`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/index.html) パッケージに統合されました。

依存関係が適切に更新されていることを確認してください。ほとんどの場合、`ktor-server-host-common` の依存関係を削除するだけで済みます。

### `Locations` プラグインが削除されました

Ktor サーバー用の `Locations` プラグインが削除されました。型安全なルーティングを作成するには、代わりに [Resources プラグイン](server-resources.md) を使用してください。これには以下の変更が必要です。

* アーティファクト `io.ktor:ktor-server-locations` を `io.ktor:ktor-server-resources` に置き換えます。

* `Resources` プラグインは Kotlin serialization プラグインに依存しています。シリアライゼーションプラグインを追加するには、[kotlinx.serialization のセットアップ](https://github.com/Kotlin/kotlinx.serialization#setup)を参照してください。

* プラグインのインポートを `io.ktor.server.locations.*` から `io.ktor.server.resources.*` に更新します。

* さらに、`io.ktor.resources` から `Resource` モジュールをインポートします。

以下の例は、これらの変更を実装する方法を示しています。

<compare first-title="2.2.x" second-title="3.0.x">

```kotlin
import io.ktor.server.locations.*

@Location("/articles")
class article(val value: Int)

fun Application.module() {
    install(Locations)
    routing {
        get<article> {
            // すべての記事を取得 ...
            call.respondText("List of articles")
        }
    }
}
```

```kotlin
import io.ktor.resources.Resource
import io.ktor.server.resources.*

@Resource("/articles")
class Articles(val value: Int)

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> {
            // すべての記事を取得 ...
            call.respondText("List of articles")
        }
    }
}
```

</compare>

`Resources` の使用方法に関する詳細は、[型安全なルーティング](server-resources.md)を参照してください。

### WebSockets 設定における `java.time` の置き換え

[WebSockets](server-websockets.md) プラグインの設定が更新され、`pingPeriod` および `timeout` プロパティに Kotlin の [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) を使用するようになりました。これにより、以前使用されていた `java.time.Duration` が置き換えられ、より Kotlin らしい記述が可能になりました。

既存のコードを新しい形式に移行するには、`kotlin.time.Duration` クラスの拡張関数やプロパティを使用して期間を構築します。以下の例では、`Duration.ofSeconds()` が Kotlin の `seconds` 拡張プロパティに置き換えられています。

<compare first-title="2.x.x" second-title="3.0.x">

```kotlin
import java.time.Duration
  
install(WebSockets) {
    pingPeriod = Duration.ofSeconds(15)
    timeout = Duration.ofSeconds(15)
    //..
}
```

```kotlin
import kotlin.time.Duration.Companion.seconds

install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    //..
}
```

</compare>

必要に応じて、他の期間設定でも同様の Kotlin duration 拡張（`minutes`、`hours` など）を使用できます。詳細については、[Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) のドキュメントを参照してください。

### サーバーソケットの `.bind()` が中断関数になりました

JS および WasmJS 環境での非同期操作をサポートするため、[`TCPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-tcp-socket-builder/index.html) と [`UDPSocketBuilder`](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-u-d-p-socket-builder/index.html) の両方におけるサーバーソケットの `.bind()` 関数が中断関数（suspending function）に更新されました。つまり、`.bind()` への呼び出しはすべてコルーチン内で行う必要があります。

移行するには、`.bind()` がコルーチンまたは中断関数内でのみ呼び出されるようにしてください。以下は `runBlocking` を使用した例です。

```kotlin
  runBlocking {
    val selectorManager = SelectorManager(Dispatchers.IO)
    val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
    //...
}
```

ソケットの操作に関する詳細は、[ソケットのドキュメント](server-sockets.md)を参照してください。

## マルチパートフォームデータ

### バイナリおよびファイル項目の新しいデフォルト制限

Ktor 3.0.0 では、[`ApplicationCall.receiveMultipart()`](https://api.ktor.io/3.0.x/ktor-server-core/io.ktor.server.request/receive-multipart.html) を使用してバイナリおよびファイル項目を受信する際のデフォルト制限として 50MiB が導入されました。受信したファイルまたはバイナリ項目が 50MiB の制限を超えると、`IOException` がスローされます。

#### デフォルト制限のオーバーライド

明示的な設定なしに 50MiB を超えるファイルを処理していたアプリケーションの場合は、予期しない動作を避けるためにコードを更新する必要があります。

デフォルトの制限をオーバーライドするには、`.receiveMultipart()` を呼び出す際に `formFieldLimit` パラメータを渡します。

```kotlin
val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)
```

### `PartData.FileItem.streamProvider()` は非推奨となりました

Ktor の以前のバージョンでは、`PartData.FileItem` の `.streamProvider()` 関数を使用して、ファイル項目の内容を `InputStream` として取得していました。Ktor 3.0.0 以降、この関数は非推奨となりました。

アプリケーションを移行するには、`.streamProvider()` を [`.provider()`](https://api.ktor.io/ktor-http/io.ktor.http.content/-part-data/-file-item/provider.html) 関数に置き換えてください。`.provider()` 関数は `ByteReadChannel` を返します。これは、バイトストリームをインクリメンタルに読み取るための、コルーチンフレンドリーで非ブロッキングな抽象化です。
その後、`ByteReadChannel` が提供する [`.copyTo()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-to.html) または [`.copyAndClose()`](https://api.ktor.io/ktor-io/io.ktor.utils.io/copy-and-close.html) メソッドを使用して、チャネルからファイル出力へ直接データをストリーミングできます。

以下の例では、`.copyAndClose()` メソッドを使用して `ByteReadChannel` からファイルの `WritableByteChannel` へデータを転送しています。

<compare first-title="2.x.x" second-title="3.0.x">

```kotlin
fun Application.main() {
    routing {
        post("/upload") {
            val multipart = call.receiveMultipart()
            multipart.forEachPart { partData ->
                if (partData is PartData.FileItem) {
                    var fileName = partData.originalFileName as String
                    val file = File("uploads/$fileName")
                    file.writeBytes(partData.streamProvider().readBytes())
                }
                // ...
            }
        }
    }
}
```

```kotlin
fun Application.main() {
    routing {
        post("/upload") {
            val multipart = call.receiveMultipart()
            multipart.forEachPart { partData ->
                if (partData is PartData.FileItem) {
                    var fileName = partData.originalFileName as String
                    val file = File("uploads/$fileName")
                    partData.provider().copyAndClose(file.writeChannel())
                }
                // ...
            }
        }
    }
}
```

</compare>

マルチパートフォームデータの操作に関する完全な例と詳細は、[マルチパートフォームデータのリクエスト処理](server-requests.md#form_data)を参照してください。

### セッション暗号化方式の更新

セキュリティを強化するため、`Sessions` プラグインが提供する暗号化方式が更新されました。

具体的には、以前は復号されたセッション値から MAC を導出していた `SessionTransportTransformerEncrypt` メソッドが、暗号化された値から計算するようになりました。

既存のセッションとの互換性を確保するため、Ktor は `backwardCompatibleRead` プロパティを導入しました。現在の構成を維持するには、`SessionTransportTransformerEncrypt` のコンストラクタにこのプロパティを含めてください。

```kotlin
install(Sessions) {
  cookie<UserSession>("user_session") {
    // ...
    transform(
      SessionTransportTransformerEncrypt(
        secretEncryptKey, // ここに暗号化キー
        secretSignKey, // ここに署名キー
        backwardCompatibleRead = true
      )
    )
  }
}
```

Ktor でのセッション暗号化の詳細については、[セッションデータの署名と暗号化](server-sessions.md#sign_encrypt_session)を参照してください。

## Ktor クライアント

### `HttpResponse` の `content` プロパティの名前変更

Ktor 3.0.0 より前は、[`HttpResponse`](https://api.ktor.io/ktor-client-core/io.ktor.client.statement/-http-response/index.html) の `content` プロパティが、ネットワークから読み取られるレスポンスコンテンツへの生の `ByteReadChannel` を提供していました。Ktor 3.0.0 以降、その目的をより正確に反映するために、`content` プロパティは `rawContent` に名前変更されました。

### `SocketTimeoutException` が型エイリアスになりました

`io.ktor.client.network.sockets` パッケージの [`SocketTimeoutException`](https://api.ktor.io/3.0.x/ktor-client-core/io.ktor.client.network.sockets/-socket-timeout-exception/index.html) が、Kotlin クラスから Java クラスのエイリアスに変更されました。この変更により、特定の場合に `NoClassDefFoundError` が発生する可能性があり、既存のコードの更新が必要になる場合があります。

アプリケーションを移行するには、コードが古いクラスを参照しておらず、最新の Ktor バージョンでコンパイルされていることを確認してください。例外チェックの更新方法は以下の通りです。

<compare type="top-bottom" first-title="2.x.x" second-title="3.0.x">
    <code-block lang="kotlin" code="    if (exception is io.ktor.client.network.sockets.SocketTimeoutException) { ... }"></code-block>
    <code-block lang="kotlin" code="    if (exception is java.net.SocketTimeoutException) { ... }"></code-block>
</compare>

## 共有モジュール

### `kotlinx-io` への移行

3.0.0 リリースに伴い、Ktor は `kotlinx-io` ライブラリを使用するように移行しました。これにより、Kotlin ライブラリ間で標準化された効率的な I/O API が提供されます。この変更により、パフォーマンスが向上し、メモリ割り当てが削減され、I/O 処理が簡素化されます。プロジェクトが Ktor の低レベル I/O API とやり取りしている場合は、互換性を確保するためにコードを更新する必要があるかもしれません。

これは、[`ByteReadChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-read-channel.html) や [`ByteWriteChannel`](https://api.ktor.io/3.0.x/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html) など、多くのクラスに影響します。さらに、以下の Ktor クラスは `kotlinx-io` をベースにするようになり、以前の実装は非推奨となりました。

| Ktor 2.x                                  | Ktor 3.x                  |
|-------------------------------------------|---------------------------|
| `io.ktor.utils.io.core.Buffer`            | `kotlinx.io.Buffer`       |
| `io.ktor.utils.io.core.BytePacketBuilder` | `kotlinx.io.Sink`         |
| `io.ktor.utils.io.core.ByteReadPacket`    | `kotlinx.io.Source`       |
| `io.ktor.utils.io.core.Input`             | `kotlinx.io.Source`       |
| `io.ktor.utils.io.core.Output`            | `kotlinx.io.Sink`         |
| `io.ktor.utils.io.core.Sink`              | `kotlinx.io.Buffer`       |
| `io.ktor.utils.io.errors.EOFException`    | `kotlinx.io.EOFException` |
| `io.ktor.utils.io.errors.IOException`     | `kotlinx.io.IOException`  |

非推奨の API は Ktor 4.0 までサポートされますが、できるだけ早く移行することをお勧めします。アプリケーションを移行するには、`kotlinx-io` の対応するメソッドを使用するようにコードを更新してください。

#### 例：ストリーミング I/O

大きなファイルのダウンロードを処理し、効率的なストリーミングソリューションが必要な場合は、手動のバイト配列処理を `kotlinx-io` の最適化されたストリーミング API に置き換えることができます。

Ktor 2.x では、大きなファイルのダウンロード処理には通常、`ByteReadChannel.readRemaining()` を使用して利用可能なバイトを手動で読み取り、`File.appendBytes()` を使用してファイルに書き込むことが含まれていました。

```Kotlin
val client = HttpClient(CIO)
val file = File.createTempFile("files", "index")

runBlocking {
    client.prepareGet("https://ktor.io/").execute { httpResponse ->
        val channel: ByteReadChannel = httpResponse.body()
        while (!channel.isClosedForRead) {
            val packet = channel.readRemaining(DEFAULT_BUFFER_SIZE.toLong())
            while (!packet.isEmpty) {
                val bytes = packet.readBytes()
                file.appendBytes(bytes)
                println("Received ${file.length()} bytes from ${httpResponse.contentLength()}")
            }
        }
        println("A file saved to ${file.path}")
    }
}
```

このアプローチでは、複数のメモリ割り当てと冗長なデータコピーが発生していました。

Ktor 3.x では、`ByteReadChannel.readRemaining()` が `Source` を返すようになり、`Source.transferTo()` を使用したデータのストリーミングが可能になりました。

```Kotlin
    val client = HttpClient(CIO)
    val file = File.createTempFile("files", "index")
    val stream = file.outputStream().asSink()
    val fileSize = 100 * 1024 * 1024
    val bufferSize: Long = 1024 * 1024

    runBlocking {
        client.prepareGet("https://httpbin.org/bytes/$fileSize").execute { httpResponse ->
            val channel: ByteReadChannel = httpResponse.body()
            var count = 0L
            stream.use {
                while (!channel.exhausted()) {
                    val chunk = channel.readRemaining(bufferSize)
                    count += chunk.remaining

                    chunk.transferTo(stream)
                    println("Received $count bytes from ${httpResponse.contentLength()}")
                }
            }
        }

        println("A file saved to ${file.path}")
    }
```

このアプローチでは、チャネルからファイルのシンクへ直接データを転送するため、メモリ割り当てを最小限に抑え、パフォーマンスが向上します。

完全な例については、[client-download-streaming](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-download-streaming) を参照してください。

> API の置き換えに関する詳細は、[`kotlinx-io` ドキュメント](https://kotlinlang.org/api/kotlinx-io/)を参照してください。

### 属性キーに厳密な型一致が必要になりました

Ktor 3.0.0 では、[`AttributeKey`](https://api.ktor.io/3.0.x/ktor-utils/io.ktor.util/-attribute-key.html) インスタンスは同一性（identity）によって比較され、値を保存および取得する際に厳密な型一致が必要になりました。これにより、型安全性が確保され、型の不一致による意図しない動作が防止されます。

以前は、`AttributeKey<Boolean>` を取得するために `getOrNull<Any>()` を使用するなど、保存された時とは異なるジェネリック型で属性を取得することが可能でした。

アプリケーションを移行するには、取得時の型が保存された型と正確に一致することを確認してください。

```kotlin
val attrs = Attributes()

attrs.put(AttributeKey<Boolean>("key"), true)
attrs.getOrNull<Boolean>("key")
```

### 空のアーティファクトの削除

Ktor 1.0.0 以降、空のアーティファクト `io.ktor:ktor` が誤って [Maven](https://repo1.maven.org/maven2/io/ktor/ktor/) に公開されていました。このアーティファクトは Ktor 3.0.0 から削除されました。

プロジェクトにこのアーティファクトが依存関係として含まれている場合は、安全に削除できます。