[//]: # (title: 客户端引擎)

<show-structure for="chapter" depth="2"/>

<link-summary>
了解处理网络请求的引擎。
</link-summary>

[Ktor HTTP client](client-create-and-configure.md) 是多平台的，运行在 JVM、[Android](https://kotlinlang.org/docs/android-overview.html)、[JavaScript](https://kotlinlang.org/docs/js-overview.html)（包括 WebAssembly）以及 [Native](https://kotlinlang.org/docs/native-overview.html) 目标平台上。每个平台都需要一个特定的引擎来处理网络请求。
例如，您可以在 JVM 应用程序中使用 `Apache` 或 `Jetty`；在 Android 中使用 `OkHttp` 或 `Android`；在针对 Kotlin/Native 的桌面应用程序中使用 `Curl`。每个引擎在功能和配置上略有不同，因此您可以选择最符合您的平台和用例需求的引擎。

## 受支持的平台 {id="platforms"}

下表列出了各引擎支持的[平台](client-supported-platforms.md)：

| 引擎 | 平台 |
|-----------|-------------------------------------------------------------------------------------------------------------------|
| `Apache5` | [JVM](#jvm) |
| `Java` | [JVM](#jvm) |
| `Jetty` | [JVM](#jvm) |
| `Android` | [JVM](#jvm), [Android](#jvm-android) |
| `OkHttp` | [JVM](#jvm), [Android](#jvm-android) |
| `Darwin` | [Native](#native) |
| `WinHttp` | [Native](#native) |
| `Curl` | [Native](#native) |
| `CIO` | [JVM](#jvm), [Android](#jvm-android), [Native](#native), [JavaScript](#js), [WasmJs](#jvm-android-native-wasm-js) |
| `Js` | [JavaScript](#js) |

## 受支持的 Android/Java 版本 {id="minimum-version"}

针对 JVM 或同时针对 JVM 和 Android 的客户端引擎支持以下 Android/Java 版本：

| 引擎 | Android 版本 | Java 版本 |
|-----------|-------------------|--------------|
| `Apache5` | | 8+ |
| `Java` | | 11+ |
| `Jetty` | | 11+ |
| `CIO` | 7.0+ <sup>*</sup> | 8+ |
| `Android` | 1.x+ | 8+ |
| `OkHttp` | 5.0+ | 8+ |

_* 要在较旧的 Android 版本上使用 CIO 引擎，您需要启用 [Java 8 API 脱糖 (desugaring)](https://developer.android.com/studio/write/java8-support)。_

## 添加引擎依赖项 {id="dependencies"}

除了 [`ktor-client-core`](client-dependencies.md) 构件外，Ktor 客户端还需要特定引擎的依赖项。每个受支持平台都有一组可用的引擎，详见相应章节：

* [JVM](#jvm)
* [JVM 和 Android](#jvm-android)
* [JavaScript](#js)
* [Native](#native)

> Ktor 提供了带有 `-jvm` 或 `-js` 等后缀的平台专用构件。例如，`ktor-client-cio-jvm`。依赖项解析因构建工具而异。虽然 Gradle 会解析适用于给定平台的构件，但 Maven 不支持此功能。这意味着对于 Maven，您需要手动指定平台后缀。
>
{type="note"}

## 指定引擎 {id="create"}

要使用特定引擎，请将引擎类传递给 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 构造函数。以下示例创建了一个使用 `CIO` 引擎的客户端：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO)
```

## 默认引擎 {id="default"}

如果省略引擎参数，客户端将根据[构建脚本中的依赖项](#dependencies)自动选择引擎。

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

这在多平台项目中尤其有用。例如，对于同时针对 [Android 和 iOS](client-create-multiplatform-application.md) 的项目，您可以将 [Android](#jvm-android) 依赖项添加到 `androidMain` 源集中，并将 [Darwin](#darwin) 依赖项添加到 `iosMain` 源集中。合适的引擎会在运行时创建 `HttpClient` 时被选中。

## 配置引擎 {id="configure"}

要配置引擎，请使用 `engine {}` 函数。所有引擎都可以使用 [`HttpClientEngineConfig`](https://api.ktor.io/ktor-client-core/io.ktor.client.engine/-http-client-engine-config/index.html) 中的通用选项进行配置：

```kotlin
HttpClient() {
    engine {
        // this: HttpClientEngineConfig
        threadsCount = 4
        pipelining = true
    }
}
```

在接下来的章节中，您可以了解如何为不同平台配置特定的引擎。

## JVM {id="jvm"}

JVM 目标支持 [`Apache5`](#apache5)、[`Java`](#java) 和 [`Jetty`](#jetty) 引擎。

### Apache5 {id="apache5"}

`Apache5` 引擎同时支持 HTTP/1.1 和 HTTP/2，且默认启用 HTTP/2。这是针对新项目推荐的基于 Apache 的引擎。

> 较旧的 `Apache` 引擎依赖于已弃用的 Apache HttpClient 4。保留它仅为了向后兼容。对于所有新项目，请使用 `Apache5`。
>
{style="note"}

1. 添加 `ktor-client-apache5` 依赖项：

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

2. 将 `Apache5` 类作为参数传递给 `HttpClient` 构造函数：

   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.apache5.*
   
   val client = HttpClient(Apache5)
   ```

3. 使用 `engine {}` 块访问并设置 `Apache5EngineConfig` 中的属性：

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
   
           // 自定义底层 Apache 客户端的其他设置
           customizeClient {
               // this: HttpAsyncClientBuilder
               setProxy(HttpHost("127.0.0.1", 8080))
               // ...
           }
   
           // 自定义每个请求的设置
           customizeRequest {
               // this: RequestConfig.Builder
           }
       }
   }
   ```

   - 使用 `configureConnectionManager` 进行连接管理器设置，例如最大连接数。这会保留 Ktor 管理的引擎行为。
   - 仅将 `customizeClient` 用于与连接管理器无关的设置，例如代理、拦截器或日志记录。

### Java {id="java"}

`Java` 引擎使用 Java 11 中引入的 [Java HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html)。要使用它，请按以下步骤操作：

1. 添加 `ktor-client-java` 依赖项：

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
2. 将 [Java](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java/index.html) 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.java.*
   
   val client = HttpClient(Java)
   ```
3. 要配置引擎，在 `engine {}` 块中设置 [`JavaHttpConfig`](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java-http-config/index.html) 的属性：
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

`Jetty` 引擎仅支持 HTTP/2，可以按以下方式配置：

1. 添加 `ktor-client-jetty-jakarta` 依赖项：

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
2. 将 [`Jetty`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty/index.html) 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.jetty.jakarta.*
   
   val client = HttpClient(Jetty)
   ```
3. 要配置引擎，在 `engine {}` 块中设置 [`JettyEngineConfig`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/index.html) 的属性：
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

## JVM 和 Android {id="jvm-android"}

在本节中，我们将介绍适用于 JVM/Android 的引擎及其配置。

### Android {id="android"}

`Android` 引擎针对 Android 平台，可以按以下方式配置：

1. 添加 `ktor-client-android` 依赖项：

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
2. 将 [`Android`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android/index.html) 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.android.*
   
   val client = HttpClient(Android)
   ```
3. 要配置引擎，在 `engine {}` 块中设置 [`AndroidEngineConfig`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/index.html) 的属性：
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

`OkHttp` 引擎基于 OkHttp，可以按以下方式配置：

1. 添加 `ktor-client-okhttp` 依赖项：

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
2. 将 [`OkHttp`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http/index.html) 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   
   val client = HttpClient(OkHttp)
   ```
3. 要配置引擎，在 `engine {}` 块中设置 [`OkHttpConfig`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http-config/index.html) 的属性：
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
           duplexStreamingEnabled = true // 仅适用于 HTTP/2 连接
       }
   }
   ```

## Native {id="native"}

Ktor 为 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 目标平台提供了 [`Darwin`](#darwin)、[`WinHttp`](#winhttp) 和 [`Curl`](#curl) 引擎。

> 在 Kotlin/Native 项目中使用 Ktor 需要[新内存管理器](https://kotlinlang.org/docs/native-memory-manager.html)，从 Kotlin 1.7.20 开始默认启用。
>
{id="newmm-note" style="note"}

### Darwin {id="darwin"}

`Darwin` 引擎针对 [基于 Darwin 的](https://en.wikipedia.org/wiki/Darwin_(operating_system)) 操作系统，如 macOS、iOS、tvOS 和 watchOS。它在底层使用 [`NSURLSession`](https://developer.apple.com/documentation/foundation/nsurlsession)。要使用 `Darwin` 引擎，请按以下步骤操作：

1. 添加 `ktor-client-darwin` 依赖项：

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
2. 将 `Darwin` 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.darwin.*
   
   val client = HttpClient(Darwin)
   ```
3. 在 `engine {}` 块中使用 [`DarwinClientEngineConfig`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin/-darwin-client-engine-config/index.html) 配置引擎。例如，您可以使用 `configureRequest` 自定义请求或使用 `configureSession` 自定义会话：
   ```kotlin
   val client = HttpClient(Darwin) {
       engine {
           configureRequest {
               setAllowsCellularAccess(true)
           }
       }
   }
   ```

   完整示例请参阅 [client-engine-darwin](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-darwin)。

### WinHttp {id="winhttp"}

`WinHttp` 引擎针对基于 Windows 的操作系统。要使用 `WinHttp` 引擎，请按以下步骤操作：

1. 添加 `ktor-client-winhttp` 依赖项：

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
2. 将 `WinHttp` 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.winhttp.*
   
   val client = HttpClient(WinHttp)
   ```
3. 在 `engine {}` 块中使用 [`WinHttpClientEngineConfig`](https://api.ktor.io/ktor-client-winhttp/io.ktor.client.engine.winhttp/-win-http-client-engine-config/index.html) 配置引擎。例如，您可以使用 `protocolVersion` 属性更改 HTTP 版本：
   ```kotlin
   val client = HttpClient(WinHttp) {
       engine {
           protocolVersion = HttpProtocolVersion.HTTP_1_1
       }
   }
   ```

   完整示例请参阅 [client-engine-winhttp](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-winhttp)。

### Curl {id="curl"}

对于桌面平台，Ktor 提供了 `Curl` 引擎。它在 `linuxX64`、`linuxArm64`、`macosX64`、`macosArm64` 和 `mingwX64` 上受支持。要使用 `Curl` 引擎，请按以下步骤操作：

1. 添加 `ktor-client-curl` 依赖项：

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
2. 将 `Curl` 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.curl.*
   
   val client = HttpClient(Curl)
   ```

3. 在 `engine {}` 块中使用 [`CurlClientEngineConfig`](https://api.ktor.io/ktor-client-curl/io.ktor.client.engine.curl/-curl-client-engine-config/index.html) 配置引擎。例如，出于测试目的禁用 SSL 验证：
   ```kotlin
   val client = HttpClient(Curl) {
       engine {
           sslVerify = false
       }
   }
   ```

   完整示例请参阅 [client-engine-curl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-curl)。

## JVM, Android, Native, JS 和 WasmJs {id="jvm-android-native-wasm-js"}

### CIO {id="cio"}

CIO 引擎是一个完全异步的基于协程的引擎，可在 JVM、Android、Native、JavaScript 和 WebAssembly JavaScript (WasmJs) 平台上使用。它目前仅支持 HTTP/1.x。要使用它，请按以下步骤操作：

1. 添加 `ktor-client-cio` 依赖项：

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
2. 将 [`CIO`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o/index.html) 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.cio.*
   
   val client = HttpClient(CIO)
   ```

3. 在 `engine {}` 块中使用 [`CIOEngineConfig`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o-engine-config/index.html) 配置引擎：
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

`Js` 引擎可用于 [JavaScript 项目](https://kotlinlang.org/docs/js-overview.html)。它在浏览器应用程序中使用 [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)，在 Node.js 中使用 `node-fetch`。要使用它，请按以下步骤操作：

1. 添加 `ktor-client-js` 依赖项：

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
2. 将 `Js` 类作为参数传递给 `HttpClient` 构造函数：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.js.*
   
   val client = HttpClient(Js)
   ```

   您也可以调用 `JsClient()` 函数来获取 `Js` 引擎单例：
   ```kotlin
   import io.ktor.client.engine.js.*

   val client = JsClient()
   ```

完整示例请参阅 [client-engine-js](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-js)。

## 限制 {id="limitations"}

### HTTP/2 和 WebSockets

并非所有引擎都支持 HTTP/2 协议。如果某个引擎支持 HTTP/2，您可以在该引擎的配置中启用它。例如，使用 [Java](#java) 引擎。

下表显示了特定引擎是否支持 HTTP/2 和 [WebSockets](client-websockets.topic)：

| 引擎 | HTTP/2 | WebSockets |
|-----------|--------|------------|
| `Apache5` | ✅️ | ✖️ |
| `Java` | ✅ | ✅️ |
| `Jetty` | ✅ | ✖️ |
| `CIO` | ✖️ | ✅ |
| `Android` | ✖️ | ✖️ |
| `OkHttp` | ✅ | ✅ |
| `Js` | ✅ | ✅ |
| `Darwin` | ✅ | ✅ |
| `WinHttp` | ✅ | ✅ |
| `Curl` | ✅ | ✅ |

### 安全性

[SSL](client-ssl.md) 必须针对每个引擎进行配置。每个引擎都提供自己的 SSL 配置选项。

### 代理支持

某些引擎不支持代理。完整列表请参阅[代理文档](client-proxy.md#supported_engines)。

### 日志记录

[Logging](client-logging.md) 插件根据目标平台提供不同的记录器类型。

### 超时

[HttpTimeout](client-timeout.md) 插件在某些引擎上有一些限制。完整列表请参阅[超时限制](client-timeout.md#limitations)。

## 示例：如何在多平台移动项目中配置引擎 {id="mpp-config"}

在构建多平台项目时，您可以使用 [expect 和 actual 声明](https://kotlinlang.org/docs/multiplatform-mobile-connect-to-platform-specific-apis.html)为每个目标平台选择并配置引擎。这允许您在公共代码中共享大部分客户端配置，同时在平台代码中应用引擎特定的选项。
我们将使用在[创建跨平台移动应用程序](client-create-multiplatform-application.md)教程中创建的项目来演示如何实现这一点：

<procedure>

1. 打开 **shared/src/commonMain/kotlin/com/example/kmpktor/Platform.kt** 文件，添加一个顶层的 `httpClient()` 函数，该函数接受一个配置块并返回一个 `HttpClient`：
   ```kotlin
   expect fun httpClient(config: HttpClientConfig<*>.() -> Unit = {}): HttpClient
   ```

2. 打开 **shared/src/androidMain/kotlin/com/example/kmpktor/Platform.kt**，为 Android 模块添加 `httpClient()` 函数的 actual 声明：
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

   > 此示例展示了如何配置 [`OkHttp`](#okhttp) 引擎，但您也可以使用其他[支持 Android 的引擎](#jvm-android)。
   >
   {style="tip"}

3. 打开 **shared/src/iosMain/kotlin/com/example/kmpktor/Platform.kt**，为 iOS 模块添加 `httpClient()` 函数的 actual 声明：
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
   现在您可以在公共代码中调用 `httpClient()`，而无需担心使用了哪个引擎。

4. 要在公共代码中使用该客户端，请打开 **shared/src/commonMain/kotlin/com/example/kmpktor/Greeting.kt**，并将 `HttpClient()` 构造函数替换为 `httpClient()` 函数调用：
   ```kotlin
   private val client = httpClient()
   ```

</procedure>