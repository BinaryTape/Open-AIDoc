[//]: # (title: 用戶端引擎)

<show-structure for="chapter" depth="2"/>

<link-summary>
了解處理網路請求的引擎。
</link-summary>

[Ktor HTTP 用戶端](client-create-and-configure.md)具備跨平台能力，可在 JVM、[Android](https://kotlinlang.org/docs/android-overview.html)、[JavaScript](https://kotlinlang.org/docs/js-overview.html)（包含 WebAssembly）以及 [Native](https://kotlinlang.org/docs/native-overview.html) 目標上執行。每個平台都需要特定的用戶端引擎來處理網路請求。

Ktor 為不同平台提供了數種引擎。例如，你可以在 JVM 應用程式中使用 `Apache` 或 `Jetty`，在 Android 中使用 `OkHttp` 或 `Android`，在以 Kotlin/Native 為目標的桌面應用程式中使用 `Curl`。

每個引擎支援的功能與設定選項各有不同。對於多平台專案，你可以使用 Ktor 的預設引擎，或為個別目標選取特定引擎。

## 支援的平台 {id="platforms"}

下表列出了各個引擎支援的[平台](client-supported-platforms.md)：

| 引擎      | 平台                                                                                                              |
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

以 JVM 或同時以 JVM 與 Android 為目標的用戶端引擎支援以下 Android/Java 版本：

| 引擎      | Android 版本      | Java 版本    |
|-----------|-------------------|--------------|
| `Apache5` |                   | 8+           |
| `Java`    |                   | 11+          |
| `Jetty`   |                   | 11+          |
| `CIO`     | 7.0+ <sup>*</sup> | 8+           |
| `Android` | 1.x+              | 8+           |
| `OkHttp`  | 5.0+              | 8+           |

_* 若要在較舊的 Android 版本上使用 CIO 引擎，你需要啟用 [Java 8 API 脫糖 (desugaring)](https://developer.android.com/studio/write/java8-support)。_

## 新增引擎相依性 {id="dependencies"}

除了 [`ktor-client-core`](client-dependencies.md) 構件外，Ktor 用戶端還需要特定引擎的相依性。

### 使用特定引擎 {id="use-a-specific-engine"}

每個支援的平台都有一組可用的引擎，詳見相應章節：

* [JVM](#jvm)
* [JVM 與 Android](#jvm-android)
* [JavaScript](#js)
* [Native](#native)

> Ktor 提供帶有 `-jvm` 或 `-js` 等後綴的平台專屬構件。例如 `ktor-client-cio-jvm`。
> 相依性解析因建置工具而異。Gradle 能解析適合特定平台的構件，但 Maven 不支援此功能。這表示對於 Maven，你必須手動指定平台後綴。
>
{type="note"}

### 在多平台專案中使用預設引擎 {id="default-engines"}

對於大多數 Kotlin Multiplatform 專案，請使用 `ktor-client-engine-defaults` 構件。它為每個目標平台提供精選的用戶端引擎，因此你無需在各平台的原始碼集中宣告個別的引擎相依性。

將 `ktor-client-engine-defaults` 構件新增至你的 `commonMain` 原始碼集中：

```kotlin
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                api("io.ktor:ktor-client-engine-defaults:%ktor_version%")
            }
        }
    }
}
```

## 指定引擎 {id="create"}

若要使用特定引擎，請將引擎類別傳遞給 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 建構函式。以下範例使用 `CIO` 引擎建立用戶端：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO)
```

## 自動選取引擎 {id="default"}

如果省略引擎引數，用戶端會自動從[建置指令碼中](#dependencies)可用的引擎相依性中挑選一個引擎。

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

如果目標平台只有一個可用的引擎，Ktor 就會使用該引擎。如果有多個引擎可用，Ktor 會選取優先順序最高的引擎。

預設情況下，`CIO` 具有最低的優先順序。這表示若同一平台同時有 `CIO` 與其他受支援的引擎可用，Ktor 會選取另一個引擎。只有在沒有更高優先順序的引擎可用時，才會使用 `CIO`。

對於 Kotlin Multiplatform 專案，[`ktor-client-engine-defaults` 相依性](#default-engines)會為每個目標提供預設引擎。或者，你也可以將[特定引擎相依性新增](#use-a-specific-engine)到相應平台的原始碼集中。

## 設定引擎 {id="configure"}

若要設定引擎，請使用 `engine {}` 函式。所有引擎都可以使用 [`HttpClientEngineConfig`](https://api.ktor.io/ktor-client-core/io.ktor.client.engine/-http-client-engine-config/index.html) 中的一般選項進行設定：

```kotlin
HttpClient() {
    engine {
        // this: HttpClientEngineConfig
        threadsCount = 4
        pipelining = true
    }
}
```

在接下來的章節中，你將學習如何為不同平台設定特定引擎。

## JVM {id="jvm"}

JVM 目標支援 [`Apache5`](#apache5)、[`Java`](#java) 以及 [`Jetty`](#jetty) 引擎。

### Apache5 {id="apache5"}

`Apache5` 引擎同時支援 HTTP/1.1 與 HTTP/2，且預設啟用 HTTP/2。這是新專案推薦使用的基於 Apache 之引擎。

> 較舊的 `Apache` 引擎依賴已棄用的 Apache HttpClient 4。保留它僅是為了向後相容性。對於所有新專案，請使用 `Apache5`。
>
{style="note"}

1. 新增 `ktor-client-apache5` 相依性：

   <var name="artifact_name" value="ktor-client-apache5"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.client.apache5"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>

2. 將 `Apache5` 類別作為引數傳遞給 `HttpClient` 建構函式：

   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.apache5.*
   
   val client = HttpClient(Apache5)
   ```

3. 使用 `engine {}` 區塊來存取並設定 `Apache5EngineConfig` 的屬性：

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
   
           // 設定 Apache5 ConnectionManager
           configureConnectionManager {
               setMaxConnPerRoute(1_000)
               setMaxConnTotal(2_000)
           }
   
           // 自訂底層 Apache 用戶端以進行其他設定
           customizeClient {
               // this: HttpAsyncClientBuilder
               setProxy(HttpHost("127.0.0.1", 8080))
               // ...
           }
   
           // 自訂個別請求設定
           customizeRequest {
               // this: RequestConfig.Builder
           }
       }
   }
   ```

   - 將 `configureConnectionManager` 用於連線管理器設定（例如最大連線數）。這能保留 Ktor 代管的引擎行為。
   - 僅將 `customizeClient` 用於與連線管理器無關的設定，例如 Proxy、攔截器或日誌記錄。

### Java {id="java"}

`Java` 引擎使用 Java 11 中引入的 [Java HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html)。若要使用它，請遵循以下步驟：

1. 新增 `ktor-client-java` 相依性：

   <var name="artifact_name" value="ktor-client-java"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.client.java"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 [Java](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java/index.html) 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.java.*
   
   val client = HttpClient(Java)
   ```
3. 若要設定引擎，請在 `engine {}` 區塊中設定來自 [`JavaHttpConfig`](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java-http-config/index.html) 的屬性：
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

`Jetty` 引擎僅支援 HTTP/2，可透過以下方式進行設定：

1. 新增 `ktor-client-jetty-jakarta` 相依性：

   <var name="artifact_name" value="ktor-client-jetty-jakarta"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.client.jetty"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 [`Jetty`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty/index.html) 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.jetty.jakarta.*
   
   val client = HttpClient(Jetty)
   ```
3. 若要設定引擎，請在 `engine {}` 區塊中設定來自 [`JettyEngineConfig`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/index.html) 的屬性：
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

在本節中，我們將介紹適用於 JVM/Android 的引擎及其設定方式。

### Android {id="android"}

`Android` 引擎以 Android 為目標，可透過以下方式進行設定：

1. 新增 `ktor-client-android` 相依性：

   <var name="artifact_name" value="ktor-client-android"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.client.android"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 [`Android`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android/index.html) 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.android.*
   
   val client = HttpClient(Android)
   ```
3. 若要設定引擎，請在 `engine {}` 區塊中設定來自 [`AndroidEngineConfig`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/index.html) 的屬性：
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

`OkHttp` 引擎基於 OkHttp，可透過以下方式進行設定：

1. 新增 `ktor-client-okhttp` 相依性：

   <var name="artifact_name" value="ktor-client-okhttp"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.client.okhttp"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 [`OkHttp`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http/index.html) 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   
   val client = HttpClient(OkHttp)
   ```
3. 若要設定引擎，請在 `engine {}` 區塊中設定來自 [`OkHttpConfig`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http-config/index.html) 的屬性：
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

Ktor 為 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 目標提供了 [`Darwin`](#darwin)、[`WinHttp`](#winhttp) 以及 [`Curl`](#curl) 引擎。

> 在 Kotlin/Native 專案中使用 Ktor 需要[新的記憶體管理器](https://kotlinlang.org/docs/native-memory-manager.html)，從 Kotlin 1.7.20 開始已預設啟用。
>
{id="newmm-note" style="note"}

### Darwin {id="darwin"}

`Darwin` 引擎以 [Darwin 架構](https://en.wikipedia.org/wiki/Darwin_(operating_system))的作業系統為目標，例如 macOS、iOS、tvOS 與 watchOS。它在底層使用 [`NSURLSession`](https://developer.apple.com/documentation/foundation/nsurlsession)。若要使用 `Darwin` 引擎，請遵循以下步驟：

1. 新增 `ktor-client-darwin` 相依性：

   <var name="artifact_name" value="ktor-client-darwin"/>
   <var name="target" value="-macosx64"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 `Darwin` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.darwin.*
   
   val client = HttpClient(Darwin)
   ```
3. 使用 [`DarwinClientEngineConfig`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin/-darwin-client-engine-config/index.html) 在 `engine {}` 區塊中設定引擎。例如，你可以使用 `configureRequest` 自訂請求，或使用 `configureSession` 自訂工作階段：
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

`WinHttp` 引擎以 Windows 架構的作業系統為目標。若要使用 `WinHttp` 引擎，請遵循以下步驟：

1. 新增 `ktor-client-winhttp` 相依性：

   <var name="artifact_name" value="ktor-client-winhttp"/>
   <var name="target" value="-mingwx64"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 `WinHttp` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.winhttp.*
   
   val client = HttpClient(WinHttp)
   ```
3. 使用 [`WinHttpClientEngineConfig`](https://api.ktor.io/ktor-client-winhttp/io.ktor.client.engine.winhttp/-win-http-client-engine-config/index.html) 在 `engine {}` 區塊中設定引擎。例如，你可以使用 `protocolVersion` 屬性來變更 HTTP 版本：
   ```kotlin
   val client = HttpClient(WinHttp) {
       engine {
           protocolVersion = HttpProtocolVersion.HTTP_1_1
       }
   }
   ```

   完整範例請參閱 [client-engine-winhttp](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-winhttp).

### Curl {id="curl"}

對於桌面平台，Ktor 提供了 `Curl` 引擎。它支援 `linuxX64`、`linuxArm64`、`macosX64`、`macosArm64` 與 `mingwX64`。若要使用 `Curl` 引擎，請遵循以下步驟：

1. 新增 `ktor-client-curl` 相依性：

   <var name="artifact_name" value="ktor-client-curl"/>
   <var name="target" value="-macosx64"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 `Curl` 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.curl.*
   
   val client = HttpClient(Curl)
   ```

3. 使用 [`CurlClientEngineConfig`](https://api.ktor.io/ktor-client-curl/io.ktor.client.engine.curl/-curl-client-engine-config/index.html) 在 `engine {}` 區塊中設定引擎。例如，出於測試目的停用 SSL 驗證：
   ```kotlin
   val client = HttpClient(Curl) {
       engine {
           sslVerify = false
       }
   }
   ```

   完整範例請參閱 [client-engine-curl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-curl)。

## JVM、Android、Native、JS 與 WasmJs {id="jvm-android-native-wasm-js"}

### CIO {id="cio"}

CIO 引擎是一個完全非同步、基於協同程式（coroutine）的引擎，適用於 JVM、Android、Native、JavaScript 以及 WebAssembly JavaScript (WasmJs) 平台。目前它僅支援 HTTP/1.x。若要使用它，請遵循以下步驟：

1. 新增 `ktor-client-cio` 相依性：

   <var name="artifact_name" value="ktor-client-cio"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.client.cio"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 [`CIO`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o/index.html) 類別作為引數傳遞給 `HttpClient` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.cio.*
   
   val client = HttpClient(CIO)
   ```

3. 使用 [`CIOEngineConfig`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o-engine-config/index.html) 在 `engine {}` 區塊中設定引擎：
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
           dnsResolver = CioDnsResolver(
               server = "1.1.1.1",
               timeout = 3.seconds
           )
       }
   }
   ```

## JavaScript {id="js"}

`Js` 引擎可用於 [Kotlin/JS](https://kotlinlang.org/docs/js-overview.html) 專案。它在瀏覽器應用程式中使用 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)，並在 Node.js 中使用 `node-fetch`。

若要使用 `Js` 引擎，請遵循以下步驟：

1. 新增 `ktor-client-js` 相依性：

   <var name="artifact_name" value="ktor-client-js"/>
   <var name="target" value=""/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%%target%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
2. 將 `Js` 類別作為引數傳遞給 `HttpClient()` 建構函式：
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.js.*
   
   val client = HttpClient(Js)
   ```

   或者，呼叫 `JsClient()` 函式以取得 `Js` 引擎單例：
   ```kotlin
   import io.ktor.client.engine.js.*

   val client = JsClient()
   ```

   > 完整範例請參閱 [client-engine-js](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-js)。
   > 
   {style="tip"}

### 覆寫 fetch {id="js-custom-fetch"}

預設情況下，`Js` 引擎使用全域的 `fetch()` 函式。若要使用自訂實作，請在引擎設定中設定 `fetch` 屬性：

```kotlin
val client = HttpClient(Js) {
    engine {
        fetch = { url, init ->
            Promise.reject(IllegalStateException("Networking not available"))
        }
    }
}
```

當與提供自家 `fetch()` 實作或包裝函式的 JavaScript 程式庫進行整合時，這非常有用。

## 限制 {id="limitations"}

### HTTP/2 與 WebSockets {id="http-2-and-websockets"}

並非所有引擎都支援 HTTP/2 協定。如果引擎支援 HTTP/2，你可以在該引擎的設定中將其啟用。例如使用 [Java](#java) 引擎時。

下表顯示了特定引擎是否支援 HTTP/2 與 [WebSockets](client-websockets.topic)：

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

### 安全性 {id="security"}

[SSL](client-ssl.md) 必須針對每個引擎個別設定。各個引擎提供其專屬的 SSL 設定選項。

### Proxy 支援 {id="proxy-support"}

部分引擎不支援 Proxy。完整清單請參閱 [Proxy 文件](client-proxy.md#supported_engines)。

### 記錄 (Logging) {id="logging"}

[Logging](client-logging.md) 外掛程式會根據目標平台提供不同的記錄器型別。

### 逾時 (Timeout) {id="timeout"}

[HttpTimeout](client-timeout.md) 外掛程式在某些引擎上存在一些限制。完整清單請參閱[逾時限制](client-timeout.md#limitations)。

## 範例：如何在多平台行動專案中設定引擎 {id="mpp-config"}

在建置多平台專案時，你可以使用[預期宣告與實際宣告 (expected and actual declarations)](https://kotlinlang.org/docs/multiplatform-mobile-connect-to-platform-specific-apis.html) 來為各個目標平台選取並設定引擎。這讓你在共用程式碼中共享大部分用戶端設定時，仍可在平台專屬程式碼中套用引擎專屬的選項。
我們將使用在[建立跨平台行動應用程式](client-create-multiplatform-application.md)教學中所建立的專案來示範如何實現這一點：

<procedure>

1. 開啟 **shared/src/commonMain/kotlin/com/example/kmpktor/Platform.kt** 檔案，並新增一個接受設定區塊且傳回 `HttpClient` 的最上層 `httpClient()` 函式：
   ```kotlin
   expect fun httpClient(config: HttpClientConfig<*>.() -> Unit = {}): HttpClient
   ```

2. 開啟 **shared/src/androidMain/kotlin/com/example/kmpktor/Platform.kt**，並為 Android 模組新增 `httpClient()` 函式的實際宣告：
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

   > 此範例展示了如何設定 [`OkHttp`](#okhttp) 引擎，但你也可以使用其他[支援 Android 的引擎](#jvm-android)。
   >
   {style="tip"}

3. 開啟 **shared/src/iosMain/kotlin/com/example/kmpktor/Platform.kt**，並為 iOS 模組新增 `httpClient()` 函式的實際宣告：
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
   現在你可以在共用程式碼中呼叫 `httpClient()`，而無需擔心背後使用的是哪一個引擎。

4. 若要在共用程式碼中使用該用戶端，請開啟 **shared/src/commonMain/kotlin/com/example/kmpktor/Greeting.kt**，並將 `HttpClient()` 建構函式取代為 `httpClient()` 函式呼叫：
   ```kotlin
   private val client = httpClient()
   ```

</procedure>