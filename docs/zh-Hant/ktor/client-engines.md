[//]: # (title: 用戶端引擎)

<show-structure for="chapter" depth="2"/>

<link-summary>
了解處理網路請求的引擎。
</link-summary>

[Ktor HTTP client](client-create-and-configure.md) 是多平台的，可執行於 JVM、
[Android](https://kotlinlang.org/docs/android-overview.html)、[JavaScript](https://kotlinlang.org/docs/js-overview.html)
（包括 WebAssembly）以及 [Native](https://kotlinlang.org/docs/native-overview.html) 目標。每個平台都需要
特定的引擎來處理網路請求。
例如，您可以為 JVM 應用程式使用 `Apache` 或 `Jetty`，為 Android 使用 `OkHttp` 或 `Android`，
為目標是 Kotlin/Native 的桌面應用程式使用 `Curl`。每個引擎在功能和
配置上略有不同，因此您可以選擇最符合您的平台和使用案例需求的引擎。

## 支援的平台 {id="platforms"}

下表列出了每個引擎支援的 [平台](client-supported-platforms.md)：

| 引擎      | 平台                                                                                                             |
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

## 支援的 Android/Java 版本 {id="minimum-version"}

目標為 JVM 或同時支援 JVM 與 Android 的用戶端引擎支援以下 Android/Java 版本：

| 引擎      | Android 版本      | Java 版本 |
|-----------|-------------------|--------------|
| `Apache5` |                   | 8+           |
| `Java`    |                   | 11+          |
| `Jetty`   |                   | 11+          |
| `CIO`     | 7.0+ <sup>*</sup> | 8+           |
| `Android` | 1.x+              | 8+           |
| `OkHttp`  | 5.0+              | 8+           |

_* 若要在較舊的 Android 版本上使用 CIO 引擎，您需要
啟用 [Java 8 API 脫糖 (desugaring)](https://developer.android.com/studio/write/java8-support)_。

## 新增引擎相依性 {id="dependencies"}

除了 [`ktor-client-core`](client-dependencies.md) 構件外，Ktor 用戶端還需要特定引擎的相依性。
每個支援的平台都有的一組可用引擎，詳見相應章節：

* [JVM](#jvm)
* [JVM 與 Android](#jvm-android)
* [JavaScript](#js)
* [Native](#native)

> Ktor 提供平台特定的構件，帶有如 `-jvm` 或 `-js` 的後綴。例如：`ktor-client-cio-jvm`。
> 相依性解析因建置工具而異。Gradle 會解析適合給定平台的構件，但 Maven
> 不支援此功能。這意味著對於 Maven，您需要手動指定平台後綴。
>
{type="note"}

## 指定引擎 {id="create"}

若要使用特定引擎，請將引擎類別傳遞給 [
`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 建構函式。
以下範例建立了一個使用 `CIO` 引擎的用戶端：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO)
```

## 預設引擎 {id="default"}

如果您省略引擎引數，用戶端將根據 [建置指令碼](#dependencies) 中的相依性自動選擇引擎。

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

這在多平台專案中特別有用。例如，對於一個同時針對
[Android 和 iOS](client-create-multiplatform-application.md) 的專案，您可以將 [Android](#jvm-android) 相依性
新增至 `androidMain` 原始碼集，並將 [Darwin](#darwin) 相依性新增至 `iosMain` 原始碼集。建立 `HttpClient` 時，會在執行時選擇適當的引擎。

## 配置引擎 {id="configure"}

要配置引擎，請使用 `engine {}` 函式。所有引擎都可以使用 
[`HttpClientEngineConfig`](https://api.ktor.io/ktor-client-core/io.ktor.client.engine/-http-client-engine-config/index.html) 中的通用選項進行配置：

```kotlin
HttpClient() {
    engine {
        // this: HttpClientEngineConfig
        threadsCount = 4
        pipelining = true
    }
}
```

在接下來的章節中，您可以了解如何為不同平台配置特定引擎。

## JVM {id="jvm"}

JVM 目標支援 [`Apache5`](#apache5)、[`Java`](#java) 以及
[`Jetty`](#jetty) 引擎。

### Apache5 {id="apache5"}

`Apache5` 引擎同時支援 HTTP/1.1 和 HTTP/2，且預設啟用 HTTP/2。
這是新專案推薦使用的基於 Apache 的引擎。

> 較舊的 `Apache` 引擎依賴於已棄用的 Apache HttpClient 4。
> 保留它僅是為了回溯相容性。對於所有新專案，請使用 `Apache5`。
>
{style="note"}

1. 新增 `ktor-client-apache5` 相依性：

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

2. 將 `Apache5` 類別作為引數傳遞給 `HttpClient` 建構函式：

   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.apache5.*
   
   val client = HttpClient(Apache5)
   ```

3. 使用 `engine {}` 區塊來存取並設定來自 `Apache5EngineConfig` 的屬性：

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
   
           // 配置 Apache5 ConnectionManager
           configureConnectionManager {
               setMaxConnPerRoute(1_000)
               setMaxConnTotal(2_000)
           }
   
           // 為其他設定自訂底層的 Apache 用戶端
           customizeClient {
               // this: HttpAsyncClientBuilder
               setProxy(HttpHost("127.0.0.1", 8080))
               // ...
           }
   
           // 自訂逐次請求 (per-request) 設定
           customizeRequest {
               // this: RequestConfig.Builder
           }
       }
   }
   ```

   - 使用 `configureConnectionManager` 進行連線管理員設定，例如最大連線數。這會保留 Ktor 管理的引擎行為。
   - 僅將 `customizeClient` 用於與連線管理員無關的設定，例如代理、攔截器或日誌記錄。

### Java {id="java"}

`Java` 引擎使用 Java 11 中引入的 [Java HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html)。要使用它，請按照以下步驟操作：

1. 新增 `ktor-client-java` 相依性：

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
2. 將 [Java](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java/index.html) 類別
   作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.java.*
   
   val client = HttpClient(Java)
   ```
3. 要配置引擎，在 `engine {}` 區塊中設定來自 [
   `JavaHttpConfig`](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java-http-config/index.html) 的屬性：
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

`Jetty` 引擎僅支援 HTTP/2，可以透過以下方式配置：

1. 新增 `ktor-client-jetty-jakarta` 相依性：

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
2. 將
   [`Jetty`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty/index.html)
   類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.jetty.jakarta.*
   
   val client = HttpClient(Jetty)
   ```
3. 要配置引擎，在 `engine {}` 區塊中設定來自
   [`JettyEngineConfig`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/index.html) 的屬性：
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

## JVM 與 Android {id="jvm-android"}

在此章節中，我們將介紹適用於 JVM/Android 的引擎及其配置。

### Android {id="android"}

`Android` 引擎目標為 Android，可以透過以下方式配置：

1. 新增 `ktor-client-android` 相依性：

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
2. 將
   [`Android`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android/index.html)
   類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.android.*
   
   val client = HttpClient(Android)
   ```
3. 要配置引擎，在 `engine {}` 區塊中設定來自
   [`AndroidEngineConfig`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/index.html) 的屬性：
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

`OkHttp` 引擎基於 OkHttp，可以透過以下方式配置：

1. 新增 `ktor-client-okhttp` 相依性：

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
2. 將 [`OkHttp`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http/index.html)
   類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   
   val client = HttpClient(OkHttp)
   ```
3. 要配置引擎，在 `engine {}` 區塊中設定來自
   [`OkHttpConfig`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http-config/index.html) 的屬性：
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
           duplexStreamingEnabled = true // 僅適用於 HTTP/2 連線
       }
   }
   ```

## Native {id="native"}

Ktor 為 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 目標提供 [`Darwin`](#darwin)、[`WinHttp`](#winhttp) 和 [`Curl`](#curl) 引擎。

> 在 Kotlin/Native 專案中使用 Ktor 需要
> [新記憶體管理員](https://kotlinlang.org/docs/native-memory-manager.html)，從 Kotlin 1.7.20 開始已預設啟用。
>
{id="newmm-note" style="note"}

### Darwin {id="darwin"}

`Darwin` 引擎目標為 [基於 Darwin 的](https://en.wikipedia.org/wiki/Darwin_(operating_system)) 作業系統，
例如 macOS、iOS、tvOS 和 watchOS。它
在底層使用 [`NSURLSession`](https://developer.apple.com/documentation/foundation/nsurlsession)。要使用
`Darwin` 引擎，請按照以下步驟操作：

1. 新增 `ktor-client-darwin` 相依性：

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
2. 將 `Darwin` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.darwin.*
   
   val client = HttpClient(Darwin)
   ```
3. 在 `engine {}` 區塊中使用 
   [`DarwinClientEngineConfig`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin/-darwin-client-engine-config/index.html) 配置引擎。
   例如，您可以使用 `configureRequest` 自訂請求，或使用 `configureSession` 自訂工作階段：
   ```kotlin
   val client = HttpClient(Darwin) {
       engine {
           configureRequest {
               setAllowsCellularAccess(true)
           }
       }
   }
   ```

   完整範例請參閱 [client-engine-darwin](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-darwin)。

### WinHttp {id="winhttp"}

`WinHttp` 引擎目標為基於 Windows 的作業系統。
要使用 `WinHttp` 引擎，請按照以下步驟操作：

1. 新增 `ktor-client-winhttp` 相依性：

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
2. 將 `WinHttp` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.winhttp.*
   
   val client = HttpClient(WinHttp)
   ```
3. 在 `engine {}` 區塊中使用
   [`WinHttpClientEngineConfig`](https://api.ktor.io/ktor-client-winhttp/io.ktor.client.engine.winhttp/-win-http-client-engine-config/index.html) 配置引擎。
   例如，您可以使用 `protocolVersion` 屬性更改 HTTP 版本：
   ```kotlin
   val client = HttpClient(WinHttp) {
       engine {
           protocolVersion = HttpProtocolVersion.HTTP_1_1
       }
   }
   ```

   完整範例請參閱 [client-engine-winhttp](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-winhttp)。

### Curl {id="curl"}

對於桌面平台，Ktor 提供 `Curl` 引擎。它支援 `linuxX64`、`linuxArm64`、`macosX64`、`macosArm64` 和 `mingwX64`。要使用 `Curl` 引擎，請按照以下步驟操作：

1. 新增 `ktor-client-curl` 相依性：

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
2. 將 `Curl` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.curl.*
   
   val client = HttpClient(Curl)
   ```

3. 在 `engine {}` 區塊中使用 [`CurlClientEngineConfig`](https://api.ktor.io/ktor-client-curl/io.ktor.client.engine.curl/-curl-client-engine-config/index.html) 配置引擎。
   例如，出於測試目的停用 SSL 驗證：
   ```kotlin
   val client = HttpClient(Curl) {
       engine {
           sslVerify = false
       }
   }
   ```

   完整範例請參閱 [client-engine-curl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-curl)。

## JVM, Android, Native, JS 與 WasmJs {id="jvm-android-native-wasm-js"}

### CIO {id="cio"}

CIO 引擎是一個完全非同步且基於協同程式的引擎，可用於 JVM、Android、Native、JavaScript 和 WebAssembly JavaScript (WasmJs) 平台。它目前僅支援 HTTP/1.x。要使用它，請按照以下步驟操作：

1. 新增 `ktor-client-cio` 相依性：

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
2. 將 [`CIO`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o/index.html) 類別
   作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.cio.*
   
   val client = HttpClient(CIO)
   ```

3. 在 `engine {}` 區塊中使用
   [`CIOEngineConfig`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o-engine-config/index.html) 配置引擎：
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

`Js` 引擎可用於 [JavaScript 專案](https://kotlinlang.org/docs/js-overview.html)。它對瀏覽器應用程式使用 [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)，對 Node.js 使用 `node-fetch`。要使用 it，請按照以下步驟操作：

1. 新增 `ktor-client-js` 相依性：

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
2. 將 `Js` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.js.*
   
   val client = HttpClient(Js)
   ```

   您也可以呼叫 `JsClient()` 函式來獲取 `Js` 引擎單例：
   ```kotlin
   import io.ktor.client.engine.js.*

   val client = JsClient()
   ```

完整範例請參閱 [client-engine-js](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-js)。

## 限制 {id="limitations"}

### HTTP/2 與 WebSockets

並非所有引擎都支援 HTTP/2 協定。如果引擎支援 HTTP/2，您可以在引擎配置中啟用它。例如，使用 [Java](#java) 引擎。

下表顯示了特定引擎是否支援 HTTP/2 和 [WebSockets](client-websockets.topic)：

| 引擎      | HTTP/2 | WebSockets |
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

### 安全性

必須為每個引擎分別配置 [SSL](client-ssl.md)。每個引擎提供其自身的 SSL 配置選項。

### 代理支援

某些引擎不支援代理。如需完整清單，請參閱
[代理文件](client-proxy.md#supported_engines)。

### 日誌記錄

[Logging](client-logging.md) 外掛程式根據目標平台提供不同的記錄器類型。

### 超時

[HttpTimeout](client-timeout.md) 外掛程式在某些引擎上存在一些限制。如需完整清單，
請參閱 [超時限制](client-timeout.md#limitations)。

## 範例：如何在多平台行動專案中配置引擎 {id="mpp-config"}

在建置多平台專案時，您可以使用
[預期宣告與實際宣告 (expected and actual declarations)](https://kotlinlang.org/docs/multiplatform-mobile-connect-to-platform-specific-apis.html) 
來為每個目標平台選擇並配置引擎。這讓您能在通用程式碼中共享大部分用戶端配置，同時在平台程式碼中套用引擎特定的選項。
我們將使用在 [建立跨平台行動應用程式](client-create-multiplatform-application.md) 教學中建立的專案來演示如何實現這一點：

<procedure>

1. 開啟 **shared/src/commonMain/kotlin/com/example/kmpktor/Platform.kt**
   檔案，並新增一個接受配置區塊並傳回 `HttpClient` 的頂層 `httpClient()` 函式：
   ```kotlin
   expect fun httpClient(config: HttpClientConfig<*>.() -> Unit = {}): HttpClient
   ```

2. 開啟 **shared/src/androidMain/kotlin/com/example/kmpktor/Platform.kt**
   並為 Android 模組新增 `httpClient()` 函式的實際宣告：
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

   > 此範例顯示如何配置 [`OkHttp`](#okhttp) 引擎，但您也可以使用其他
   > [支援 Android 的引擎](#jvm-android)。
   >
   {style="tip"}

3. 開啟 **shared/src/iosMain/kotlin/com/example/kmpktor/Platform.kt** 並為 iOS 模組新增 `httpClient()`
   函式的實際宣告：
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
   您現在可以在共享程式碼中呼叫 `httpClient()`，而無需擔心使用的是哪個引擎。

4. 若要在共享程式碼中使用此用戶端，請開啟 **shared/src/commonMain/kotlin/com/example/kmpktor/Greeting.kt** 並將
   `HttpClient()` 建構函式替換為 `httpClient()` 函式呼叫：
   ```kotlin
   private val client = httpClient()
   ```

</procedure>