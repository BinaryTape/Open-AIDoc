[//]: # (title: クライアントエンジン)

<show-structure for="chapter" depth="2"/>

<link-summary>
ネットワークリクエストを処理するエンジンについて学びます。
</link-summary>

[Ktor HTTP クライアント](client-create-and-configure.md)はマルチプラットフォームであり、JVM、[Android](https://kotlinlang.org/docs/android-overview.html)、[JavaScript](https://kotlinlang.org/docs/js-overview.html)（WebAssembly を含む）、および [Native](https://kotlinlang.org/docs/native-overview.html) ターゲットで動作します。各プラットフォームでネットワークリクエストを処理するには、特定のエンジンが必要です。
例えば、JVM アプリケーションには `Apache` や `Jetty`、Android には `OkHttp` や `Android`、Kotlin/Native をターゲットとするデスクトップアプリケーションには `Curl` を使用できます。エンジンごとに機能や設定がわずかに異なるため、プラットフォームやユースケースのニーズに最適なものを選択できます。

## サポートされているプラットフォーム {id="platforms"}

以下の表は、各エンジンがサポートする[プラットフォーム](client-supported-platforms.md)の一覧です。

| エンジン   | プラットフォーム                                                                                                         |
|-----------|-------------------------------------------------------------------------------------------------------------------|
| `Apache5` | [JVM](#jvm)                                                                                                       |
| `Java`    | [JVM](#jvm)                                                                                                       |
| `Jetty`   | [JVM](#jvm)                                                                                                       |
| `Android` | [JVM](#jvm), [Android](#jvm-android)                                                                              |
| `OkHttp`  | [JVM](#jvm), [Android](#jvm-android)                                                                              |
| `Darwin`  | [Native](#native)                                                                                                 |
| `WinHttp` | [Native](#native)                                                                                                 |
| `Curl`    | [Native](#native)                                                                                                 |
| `CIO`     | [JVM](#jvm), [Android](#jvm-android), [Native](#native), [JavaScript](#js), [WasmJs](#jvm-android-native-wasm-js) |
| `Js`      | [JavaScript](#js)                                                                                                 |

## サポートされている Android/Java バージョン {id="minimum-version"}

JVM、または JVM と Android の両方をターゲットとするクライアントエンジンは、以下の Android/Java バージョンをサポートしています。

| エンジン   | Android バージョン | Java バージョン |
|-----------|-------------------|--------------|
| `Apache5` |                   | 8+           |
| `Java`    |                   | 11+          |
| `Jetty`   |                   | 11+          |
| `CIO`     | 7.0+ <sup>*</sup> | 8+           |
| `Android` | 1.x+              | 8+           |
| `OkHttp`  | 5.0+              | 8+           |

_* 古い Android バージョンで CIO エンジンを使用するには、[Java 8 API デシュガリング (desugaring)](https://developer.android.com/studio/write/java8-support) を有効にする必要があります。_

## エンジンの依存関係の追加 {id="dependencies"}

[`ktor-client-core`](client-dependencies.md) アーティファクトに加えて、Ktor クライアントには特定のエンジンの依存関係が必要です。サポートされている各プラットフォームで利用可能なエンジンセットについては、対応するセクションで説明されています。

* [JVM](#jvm)
* [JVM および Android](#jvm-android)
* [JavaScript](#js)
* [Native](#native)

> Ktor は、`-jvm` や `-js` などのサフィックスが付いたプラットフォーム固有のアーティファクトを提供しています。例えば、`ktor-client-cio-jvm` です。
> 依存関係の解決方法はビルドツールによって異なります。Gradle は特定のプラットフォームに適したアーティファクトを解決しますが、Maven はこの機能をサポートしていません。つまり、Maven の場合はプラットフォームのサフィックスを手動で指定する必要があります。
>
{type="note"}

## エンジンの指定 {id="create"}

特定のエンジンを使用するには、エンジンクラスを [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) コンストラクタに渡します。次の例では、`CIO` エンジンを使用してクライアントを作成します。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO)
```

## デフォルトエンジン {id="default"}

エンジンの引数を省略した場合、クライアントは[ビルドスクリプト内の依存関係](#dependencies)に基づいて自動的にエンジンを選択します。

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

これはマルチプラットフォームプロジェクトで特に便利です。例えば、[Android と iOS](client-create-multiplatform-application.md) の両方をターゲットとするプロジェクトの場合、`androidMain` ソースセットに [Android](#jvm-android) の依存関係を、`iosMain` ソースセットに [Darwin](#darwin) の依存関係を追加できます。`HttpClient` 作成時に、実行時に適切なエンジンが選択されます。

## エンジンの設定 {id="configure"}

エンジンを設定するには、`engine {}` 関数を使用します。すべてのエンジンは、[`HttpClientEngineConfig`](https://api.ktor.io/ktor-client-core/io.ktor.client.engine/-http-client-engine-config/index.html) の共通オプションを使用して設定できます。

```kotlin
HttpClient() {
    engine {
        // this: HttpClientEngineConfig
        threadsCount = 4
        pipelining = true
    }
}
```

次のセクションでは、さまざまなプラットフォームに合わせて特定のエンジンを設定する方法を学ぶことができます。

## JVM {id="jvm"}

JVM ターゲットは、[`Apache5`](#apache5)、[`Java`](#java)、および [`Jetty`](#jetty) エンジンをサポートしています。

### Apache5 {id="apache5"}

`Apache5` エンジンは HTTP/1.1 と HTTP/2 の両方をサポートしており、デフォルトで HTTP/2 が有効になっています。
これは、新しいプロジェクトに推奨される Apache ベースのエンジンです。

> 古い `Apache` エンジンは、非推奨となった Apache HttpClient 4 に依存しています。
> これは後方互換性のためにのみ保持されています。すべての新しいプロジェクトでは、`Apache5` を使用してください。
>
{style="note"}

1. `ktor-client-apache5` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-apache5"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>

2. `Apache5` クラスを引数として `HttpClient` コンストラクタに渡します。

   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.apache5.*
   
   val client = HttpClient(Apache5)
   ```

3. `engine {}` ブロックを使用して、`Apache5EngineConfig` のプロパティにアクセスし、設定します。

   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.apache5.*
   import org.apache.hc.core5.http.*
   
   val client = HttpClient(Apache5) {
       engine {
           // this: Apache5EngineConfig
           followRedirects = true
           socketTimeout = 10_000
           connectTimeout = 10_000
           connectionRequestTimeout = 20_000
   
           // Apache5 ConnectionManager の設定
           configureConnectionManager {
               setMaxConnPerRoute(1_000)
               setMaxConnTotal(2_000)
           }
   
           // その他の設定のために、基盤となる Apache クライアントをカスタマイズする
           customizeClient {
               // this: HttpAsyncClientBuilder
               setProxy(HttpHost("127.0.0.1", 8080))
               // ...
           }
   
           // リクエストごとの設定をカスタマイズする
           customizeRequest {
               // this: RequestConfig.Builder
           }
       }
   }
   ```

   - 最大接続数などの接続マネージャー設定には `configureConnectionManager` を使用してください。これにより、Ktor が管理するエンジンの動作が維持されます。
   - `customizeClient` は、プロキシ、インターセプター、ロギングなど、接続マネージャーに関係のない設定にのみ使用してください。

### Java {id="java"}

`Java` エンジンは、Java 11 で導入された [Java HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html) を使用します。これを使用するには、以下の手順に従ってください。

1. `ktor-client-java` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-java"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. [Java](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java/index.html) クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.java.*
   
   val client = HttpClient(Java)
   ```
3. エンジンを設定するには、`engine {}` ブロックで [`JavaHttpConfig`](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java-http-config/index.html) のプロパティを設定します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.*
   import io.ktor.client.engine.java.*
   
   val client = HttpClient(Java) {
       engine {
           // this: JavaHttpConfig
           threadsCount = 8
           pipelining = true
           proxy = ProxyBuilder.http("http://proxy-server.com/")
           protocolVersion = java.net.http.HttpClient.Version.HTTP_2
       }
   }
   ```

### Jetty {id="jetty"}

`Jetty` エンジンは HTTP/2 のみをサポートしており、次のように設定できます。

1. `ktor-client-jetty-jakarta` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-jetty-jakarta"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. [`Jetty`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty/index.html) クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.jetty.jakarta.*
   
   val client = HttpClient(Jetty)
   ```
3. エンジンを設定するには、`engine {}` ブロックで [`JettyEngineConfig`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/index.html) のプロパティを設定します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.jetty.jakarta.*
   import org.eclipse.jetty.util.ssl.SslContextFactory
   
   val client = HttpClient(Jetty) {
       engine {
           // this: JettyEngineConfig
           sslContextFactory = SslContextFactory.Client()
           clientCacheSize = 12
       }
   }
   ```

## JVM および Android {id="jvm-android"}

このセクションでは、JVM/Android で利用可能なエンジンとその設定について見ていきます。

### Android {id="android"}

`Android` エンジンは Android をターゲットとしており、次のように設定できます。

1. `ktor-client-android` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-android"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. [`Android`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android/index.html) クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.android.*
   
   val client = HttpClient(Android)
   ```
3. エンジンを設定するには、`engine {}` ブロックで [`AndroidEngineConfig`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/index.html) のプロパティを設定します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.android.*
   import java.net.Proxy
   import java.net.InetSocketAddress
   
   val client = HttpClient(Android) {
       engine {
           // this: AndroidEngineConfig
           connectTimeout = 100_000
           socketTimeout = 100_000
           proxy = Proxy(Proxy.Type.HTTP, InetSocketAddress("localhost", 8080))
       }
   }
   ```

### OkHttp {id="okhttp"}

`OkHttp` エンジンは OkHttp に基づいており、次のように設定できます。

1. `ktor-client-okhttp` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-okhttp"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. [`OkHttp`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http/index.html) クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   
   val client = HttpClient(OkHttp)
   ```
3. エンジンを設定するには、`engine {}` ブロックで [`OkHttpConfig`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http-config/index.html) のプロパティを設定します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   
   val client = HttpClient(OkHttp) {
       engine {
           // this: OkHttpConfig
           config {
               // this: OkHttpClient.Builder
               followRedirects(true)
               // ...
           }
           addInterceptor(interceptor)
           addNetworkInterceptor(interceptor)
   
           preconfigured = okHttpClientInstance
           duplexStreamingEnabled = true // HTTP/2 接続でのみ利用可能
       }
   }
   ```

## Native {id="native"}

Ktor は、[Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) ターゲット向けに [`Darwin`](#darwin)、[`WinHttp`](#winhttp)、および [`Curl`](#curl) エンジンを提供しています。

> Kotlin/Native プロジェクトで Ktor を使用するには、[新しいメモリマネージャー](https://kotlinlang.org/docs/native-memory-manager.html)が必要であり、これは Kotlin 1.7.20 以降でデフォルトで有効になっています。
>
{id="newmm-note" style="note"}

### Darwin {id="darwin"}

`Darwin` エンジンは、macOS、iOS、tvOS、watchOS などの [Darwin ベース](https://en.wikipedia.org/wiki/Darwin_(operating_system))のオペレーティングシステムをターゲットとしています。内部では [`NSURLSession`](https://developer.apple.com/documentation/foundation/nsurlsession) を使用しています。`Darwin` エンジンを使用するには、以下の手順に従ってください。

1. `ktor-client-darwin` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-darwin"/>
   <var name="target" value="-macosx64"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. `Darwin` クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.darwin.*
   
   val client = HttpClient(Darwin)
   ```
3. `engine {}` ブロックで [`DarwinClientEngineConfig`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin/-darwin-client-engine-config/index.html) を使用してエンジンを設定します。例えば、`configureRequest` でリクエストをカスタマイズしたり、`configureSession` でセッションをカスタマイズしたりできます。
   ```kotlin
   val client = HttpClient(Darwin) {
       engine {
           configureRequest {
               setAllowsCellularAccess(true)
           }
       }
   }
   ```

   完全な例については、[client-engine-darwin](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-darwin) を参照してください。

### WinHttp {id="winhttp"}

`WinHttp` エンジンは、Windows ベースのオペレーティングシステムをターゲットとしています。
`WinHttp` エンジンを使用するには、以下の手順に従ってください。

1. `ktor-client-winhttp` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-winhttp"/>
   <var name="target" value="-mingwx64"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. `WinHttp` クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.winhttp.*
   
   val client = HttpClient(WinHttp)
   ```
3. `engine {}` ブロックで [`WinHttpClientEngineConfig`](https://api.ktor.io/ktor-client-winhttp/io.ktor.client.engine.winhttp/-win-http-client-engine-config/index.html) を使用してエンジンを設定します。例えば、`protocolVersion` プロパティを使用して HTTP バージョンを変更できます。
   ```kotlin
   val client = HttpClient(WinHttp) {
       engine {
           protocolVersion = HttpProtocolVersion.HTTP_1_1
       }
   }
   ```

   完全な例については、[client-engine-winhttp](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-winhttp) を参照してください。

### Curl {id="curl"}

デスクトッププラットフォーム向けに、Ktor は `Curl` エンジンを提供しています。これは `linuxX64`、`linuxArm64`、`macosX64`、`macosArm64`、および `mingwX64` でサポートされています。`Curl` エンジンを使用するには、以下の手順に従ってください。

1. `ktor-client-curl` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-curl"/>
   <var name="target" value="-macosx64"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. `Curl` クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.curl.*
   
   val client = HttpClient(Curl)
   ```

3. `engine {}` ブロックで [`CurlClientEngineConfig`](https://api.ktor.io/ktor-client-curl/io.ktor.client.engine.curl/-curl-client-engine-config/index.html) を使用してエンジンを設定します。例えば、テスト目的で SSL 検証を無効にします。
   ```kotlin
   val client = HttpClient(Curl) {
       engine {
           sslVerify = false
       }
   }
   ```

   完全な例については、[client-engine-curl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-curl) を参照してください。

## JVM, Android, Native, JS および WasmJs {id="jvm-android-native-wasm-js"}

### CIO {id="cio"}

CIO エンジンは、JVM、Android、Native、JavaScript、および WebAssembly JavaScript (WasmJs) プラットフォームで利用可能な、完全に非同期なコルーチンベースのエンジンです。現在は HTTP/1.x のみをサポートしています。これを使用するには、以下の手順に従ってください。

1. `ktor-client-cio` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-cio"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. [`CIO`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o/index.html) クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.cio.*
   
   val client = HttpClient(CIO)
   ```

3. `engine {}` ブロックで [`CIOEngineConfig`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o-engine-config/index.html) を使用してエンジンを設定します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.cio.*
   import io.ktor.network.tls.*
   
   val client = HttpClient(CIO) {
       engine {
           // this: CIOEngineConfig
           maxConnectionsCount = 1000
           endpoint {
               // this: EndpointConfig
               maxConnectionsPerRoute = 100
               pipelineMaxSize = 20
               keepAliveTime = 5000
               connectTimeout = 5000
               connectAttempts = 5
           }
           https {
               // this: TLSConfigBuilder
               serverName = "api.ktor.io"
               cipherSuites = CIOCipherSuites.SupportedSuites
               trustManager = myCustomTrustManager
               random = mySecureRandom
               addKeyStore(myKeyStore, myKeyStorePassword)
           }
       }
   }
   ```

## JavaScript {id="js"}

`Js` エンジンは [JavaScript プロジェクト](https://kotlinlang.org/docs/js-overview.html)で使用できます。ブラウザアプリケーションでは [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) を、Node.js では `node-fetch` を使用します。これを使用するには、以下の手順に従ってください。

1. `ktor-client-js` 依存関係を追加します。

   <var name="artifact_name" value="ktor-client-js"/>
   <var name="target" value=""/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
2. `Js` クラスを引数として `HttpClient` コンストラクタに渡します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.js.*
   
   val client = HttpClient(Js)
   ```

   また、`JsClient()` 関数を呼び出して `Js` エンジンのシングルトンを取得することもできます。
   ```kotlin
   import io.ktor.client.engine.js.*

   val client = JsClient()
   ```

完全な例については、[client-engine-js](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-js) を参照してください。

## 制限事項 {id="limitations"}

### HTTP/2 および WebSockets

すべてのエンジンが HTTP/2 プロトコルをサポートしているわけではありません。エンジンが HTTP/2 をサポートしている場合は、エンジンの設定で有効にできます。例えば、[Java](#java) エンジンなどです。

以下の表は、特定のエンジンが HTTP/2 および [WebSockets](client-websockets.topic) をサポートしているかどうかを示しています。

| エンジン   | HTTP/2 | WebSockets |
|-----------|--------|------------|
| `Apache5` | ✅️     | ✖️         |
| `Java`    | ✅      | ✅️         |
| `Jetty`   | ✅      | ✖️         |
| `CIO`     | ✖️     | ✅          |
| `Android` | ✖️     | ✖️         |
| `OkHttp`  | ✅      | ✅          |
| `Js`      | ✅      | ✅          |
| `Darwin`  | ✅      | ✅          |
| `WinHttp` | ✅      | ✅          |
| `Curl`    | ✅      | ✅          |

### セキュリティ

[SSL](client-ssl.md) はエンジンごとに設定する必要があります。各エンジンは独自の SSL 設定オプションを提供しています。

### プロキシのサポート

一部のエンジンはプロキシをサポートしていません。完全なリストについては、[プロキシのドキュメント](client-proxy.md#supported_engines)を参照してください。

### ロギング

[Logging](client-logging.md) プラグインは、ターゲットプラットフォームに応じてさまざまなロガータイプを提供します。

### タイムアウト

[HttpTimeout](client-timeout.md) プラグインには、特定のエンジンでいくつかの制限があります。完全なリストについては、[タイムアウトの制限事項](client-timeout.md#limitations)を参照してください。

## 例：マルチプラットフォームモバイルプロジェクトでエンジンを設定する方法 {id="mpp-config"}

マルチプラットフォームプロジェクトを構築する場合、[expect と actual 宣言](https://kotlinlang.org/docs/multiplatform-mobile-connect-to-platform-specific-apis.html)を使用して、ターゲットプラットフォームごとにエンジンを選択および設定できます。これにより、クライアント設定の大部分を共通コードで共有しながら、プラットフォームコードでエンジン固有のオプションを適用できます。
ここでは、[クロスプラットフォームモバイルアプリケーションの作成](client-create-multiplatform-application.md)チュートリアルで作成したプロジェクトを使用して、これを実現する方法を示します。

<procedure>

1. **shared/src/commonMain/kotlin/com/example/kmpktor/Platform.kt** ファイルを開き、設定ブロックを受け取って `HttpClient` を返すトップレベルの `httpClient()` 関数を追加します。
   ```kotlin
   expect fun httpClient(config: HttpClientConfig<*>.() -> Unit = {}): HttpClient
   ```

2. **shared/src/androidMain/kotlin/com/example/kmpktor/Platform.kt** を開き、Android モジュール用の `httpClient()` 関数の actual 宣言を追加します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   import java.util.concurrent.TimeUnit

   actual fun httpClient(config: HttpClientConfig<*>.() -> Unit) = HttpClient(OkHttp) {
      config(this)

      engine { 
         config {
            retryOnConnectionFailure(true)
            connectTimeout(0, TimeUnit.SECONDS)
         }
      }
   }
   ```

   > この例では [`OkHttp`](#okhttp) エンジンの設定方法を示していますが、[Android でサポートされている](#jvm-android)他のエンジンを使用することもできます。
   >
   {style="tip"}

3. **shared/src/iosMain/kotlin/com/example/kmpktor/Platform.kt** を開き、iOS モジュール用の `httpClient()` 関数の actual 宣言を追加します。
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.darwin.*
   
   actual fun httpClient(config: HttpClientConfig<*>.() -> Unit) = HttpClient(Darwin) {
      config(this)
      engine {
         configureRequest {
            setAllowsCellularAccess(true)
         }
      }
   }
   ```
   これで、どのエンジンが使用されているかを気にすることなく、共通コードで `httpClient()` を呼び出すことができます。

4. 共通コードでクライアントを使用するには、**shared/src/commonMain/kotlin/com/example/kmpktor/Greeting.kt** を開き、`HttpClient()` コンストラクタを `httpClient()` 関数の呼び出しに置き換えます。
   ```kotlin
   private val client = httpClient()
   ```

</procedure>