[//]: # (title: 클라이언트 엔진)

<show-structure for="chapter" depth="2"/>

<link-summary>
네트워크 요청을 처리하는 엔진에 대해 알아봅니다.
</link-summary>

[Ktor HTTP 클라이언트](client-create-and-configure.md)는 멀티플랫폼이며 JVM,
[Android](https://kotlinlang.org/docs/android-overview.html), [JavaScript](https://kotlinlang.org/docs/js-overview.html)
(WebAssembly 포함), 그리고 [Native](https://kotlinlang.org/docs/native-overview.html) 타겟에서 실행됩니다. 각 플랫폼은 네트워크 요청을 처리하기 위해 특정 엔진이 필요합니다.
예를 들어, JVM 애플리케이션에는 `Apache`나 `Jetty`를, Android에는 `OkHttp`나 `Android`를, Kotlin/Native를 타겟으로 하는 데스크톱 애플리케이션에는 `Curl`을 사용할 수 있습니다. 모든 엔진은 기능과 설정 면에서 약간씩 다르므로, 플랫폼과 사용 사례의 요구 사항에 가장 적합한 엔진을 선택할 수 있습니다.

## 지원되는 플랫폼 {id="platforms"}

아래 표는 각 엔진이 지원하는 [플랫폼](client-supported-platforms.md)을 나열합니다.

| 엔진        | 플랫폼                                                                                                             |
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

## 지원되는 Android/Java 버전 {id="minimum-version"}

JVM 또는 JVM과 Android를 모두 타겟으로 하는 클라이언트 엔진은 다음 Android/Java 버전을 지원합니다.

| 엔진        | Android 버전       | Java 버전 |
|-----------|------------------|----------|
| `Apache5` |                  | 8+       |
| `Java`    |                  | 11+      |
| `Jetty`   |                  | 11+      |
| `CIO`     | 7.0+ <sup>*</sup> | 8+       |
| `Android` | 1.x+             | 8+       |
| `OkHttp`  | 5.0+             | 8+       |

_* 이전 버전의 Android에서 CIO 엔진을 사용하려면 [Java 8 API 디슈가링(desugaring)](https://developer.android.com/studio/write/java8-support)을 활성화해야 합니다._

## 엔진 의존성 추가하기 {id="dependencies"}

[`ktor-client-core`](client-dependencies.md) 아티팩트 외에도 Ktor 클라이언트는 특정 엔진에 대한 의존성이 필요합니다. 지원되는 각 플랫폼에는 해당 섹션에서 설명하는 사용 가능한 엔진 세트가 있습니다.

* [JVM](#jvm)
* [JVM 및 Android](#jvm-android)
* [JavaScript](#js)
* [Native](#native)

> Ktor는 `-jvm` 또는 `-js`와 같은 접미사가 붙은 플랫폼별 아티팩트를 제공합니다. 예를 들어, `ktor-client-cio-jvm`이 있습니다.
> 의존성 해결 방식은 빌드 도구마다 다릅니다. Gradle은 특정 플랫폼에 적합한 아티팩트를 해결하지만, Maven은 이 기능을 지원하지 않습니다. 즉, Maven의 경우 플랫폼 접미사를 수동으로 지정해야 합니다.
>
{type="note"}

## 엔진 지정하기 {id="create"}

특정 엔진을 사용하려면 엔진 클래스를 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 생성자에 전달하세요. 다음 예제는 `CIO` 엔진을 사용하는 클라이언트를 생성합니다.

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO)
```

## 기본 엔진 {id="default"}

엔진 인수를 생략하면 클라이언트는 [빌드 스크립트의 의존성](#dependencies)에 따라 자동으로 엔진을 선택합니다.

```kotlin
import io.ktor.client.*

val client = HttpClient()
```

이 기능은 특히 멀티플랫폼 프로젝트에서 유용합니다. 예를 들어, [Android와 iOS](client-create-multiplatform-application.md)를 모두 타겟으로 하는 프로젝트의 경우, `androidMain` 소스 세트에는 [Android](#jvm-android) 의존성을 추가하고 `iosMain` 소스 세트에는 [Darwin](#darwin) 의존성을 추가할 수 있습니다. `HttpClient` 생성 시 런타임에 적절한 엔진이 선택됩니다.

## 엔진 설정하기 {id="configure"}

엔진을 설정하려면 `engine {}` 함수를 사용하세요. 모든 엔진은 [`HttpClientEngineConfig`](https://api.ktor.io/ktor-client-core/io.ktor.client.engine/-http-client-engine-config/index.html)의 공통 옵션을 사용하여 설정할 수 있습니다.

```kotlin
HttpClient() {
    engine {
        // this: HttpClientEngineConfig
        threadsCount = 4
        pipelining = true
    }
}
```

다음 섹션에서는 서로 다른 플랫폼에 대한 특정 엔진 설정 방법을 배울 수 있습니다.

## JVM {id="jvm"}

JVM 타겟은 [`Apache5`](#apache5), [`Java`](#java), 그리고 [`Jetty`](#jetty) 엔진을 지원합니다.

### Apache5 {id="apache5"}

`Apache5` 엔진은 HTTP/1.1과 HTTP/2를 모두 지원하며, HTTP/2가 기본적으로 활성화되어 있습니다. 이는 새로운 프로젝트에 권장되는 Apache 기반 엔진입니다.

> 이전 `Apache` 엔진은 지원이 중단된 Apache HttpClient 4에 의존합니다. 이는 하위 호환성을 위해서만 유지됩니다. 모든 새로운 프로젝트에는 `Apache5`를 사용하세요.
>
{style="note"}

1. `ktor-client-apache5` 의존성을 추가합니다.

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

2. `Apache5` 클래스를 `HttpClient` 생성자의 인수로 전달합니다.

   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.apache5.*
   
   val client = HttpClient(Apache5)
   ```

3. `engine {}` 블록을 사용하여 `Apache5EngineConfig`의 프로퍼티에 접근하고 설정합니다.

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
   
           // Apache5 ConnectionManager 설정
           configureConnectionManager {
               setMaxConnPerRoute(1_000)
               setMaxConnTotal(2_000)
           }
   
           // 다른 설정을 위해 기본 Apache 클라이언트를 커스텀
           customizeClient {
               // this: HttpAsyncClientBuilder
               setProxy(HttpHost("127.0.0.1", 8080))
               // ...
           }
   
           // 요청별 설정 커스텀
           customizeRequest {
               // this: RequestConfig.Builder
           }
       }
   }
   ```

   - 최대 연결 수와 같은 커넥션 매니저 설정에는 `configureConnectionManager`를 사용하세요. 이렇게 하면 Ktor가 관리하는 엔진 동작이 보존됩니다.
   - 프록시, 인터셉터 또는 로깅과 같이 커넥션 매니저와 관련 없는 설정에만 `customizeClient`를 사용하세요.

### Java {id="java"}

`Java` 엔진은 Java 11에서 도입된 [Java HTTP Client](https://openjdk.java.net/groups/net/httpclient/intro.html)를 사용합니다. 이를 사용하려면 다음 단계를 따르세요.

1. `ktor-client-java` 의존성을 추가합니다.

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
2. [Java](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java/index.html) 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.java.*
   
   val client = HttpClient(Java)
   ```
3. 엔진을 설정하려면 `engine {}` 블록에서 [`JavaHttpConfig`](https://api.ktor.io/ktor-client-java/io.ktor.client.engine.java/-java-http-config/index.html)의 프로퍼티를 설정하세요.
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

`Jetty` 엔진은 HTTP/2만 지원하며 다음과 같은 방법으로 설정할 수 있습니다.

1. `ktor-client-jetty-jakarta` 의존성을 추가합니다.

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
2. [`Jetty`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty/index.html) 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.jetty.jakarta.*
   
   val client = HttpClient(Jetty)
   ```
3. 엔진을 설정하려면 `engine {}` 블록에서 [`JettyEngineConfig`](https://api.ktor.io/ktor-client-jetty-jakarta/io.ktor.client.engine.jetty.jakarta/-jetty-engine-config/index.html)의 프로퍼티를 설정하세요.
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

## JVM 및 Android {id="jvm-android"}

이 섹션에서는 JVM/Android에서 사용 가능한 엔진과 그 설정을 살펴보겠습니다.

### Android {id="android"}

`Android` 엔진은 Android를 타겟으로 하며 다음과 같은 방법으로 설정할 수 있습니다.

1. `ktor-client-android` 의존성을 추가합니다.

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
2. [`Android`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android/index.html) 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.android.*
   
   val client = HttpClient(Android)
   ```
3. 엔진을 설정하려면 `engine {}` 블록에서 [`AndroidEngineConfig`](https://api.ktor.io/ktor-client-android/io.ktor.client.engine.android/-android-engine-config/index.html)의 프로퍼티를 설정하세요.
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

`OkHttp` 엔진은 OkHttp를 기반으로 하며 다음과 같은 방법으로 설정할 수 있습니다.

1. `ktor-client-okhttp` 의존성을 추가합니다.

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
2. [`OkHttp`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http/index.html) 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.okhttp.*
   
   val client = HttpClient(OkHttp)
   ```
3. 엔진을 설정하려면 `engine {}` 블록에서 [`OkHttpConfig`](https://api.ktor.io/ktor-client-okhttp/io.ktor.client.engine.okhttp/-ok-http-config/index.html)의 프로퍼티를 설정하세요.
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
           duplexStreamingEnabled = true // HTTP/2 연결에서만 사용 가능
       }
   }
   ```

## Native {id="native"}

Ktor는 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html) 타겟을 위해 [`Darwin`](#darwin), [`WinHttp`](#winhttp), 그리고 [`Curl`](#curl) 엔진을 제공합니다.

> Kotlin/Native 프로젝트에서 Ktor를 사용하려면 [새로운 메모리 매니저](https://kotlinlang.org/docs/native-memory-manager.html)가 필요하며, 이는 Kotlin 1.7.20부터 기본적으로 활성화되어 있습니다.
>
{id="newmm-note" style="note"}

### Darwin {id="darwin"}

`Darwin` 엔진은 macOS, iOS, tvOS, watchOS와 같은 [Darwin 기반](https://en.wikipedia.org/wiki/Darwin_(operating_system)) 운영 체제를 타겟으로 합니다. 내부적으로 [`NSURLSession`](https://developer.apple.com/documentation/foundation/nsurlsession)을 사용합니다. `Darwin` 엔진을 사용하려면 다음 단계를 따르세요.

1. `ktor-client-darwin` 의존성을 추가합니다.

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
2. `Darwin` 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.darwin.*
   
   val client = HttpClient(Darwin)
   ```
3. `engine {}` 블록에서 [`DarwinClientEngineConfig`](https://api.ktor.io/ktor-client-darwin/io.ktor.client.engine.darwin/-darwin-client-engine-config/index.html)를 사용하여 엔진을 설정합니다. 예를 들어, `configureRequest`로 요청을 커스텀하거나 `configureSession`으로 세션을 커스텀할 수 있습니다.
   ```kotlin
   val client = HttpClient(Darwin) {
       engine {
           configureRequest {
               setAllowsCellularAccess(true)
           }
       }
   }
   ```

   전체 예제는 [client-engine-darwin](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-darwin)을 참조하세요.

### WinHttp {id="winhttp"}

`WinHttp` 엔진은 Windows 기반 운영 체제를 타겟으로 합니다. `WinHttp` 엔진을 사용하려면 다음 단계를 따르세요.

1. `ktor-client-winhttp` 의존성을 추가합니다.

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
2. `WinHttp` 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.winhttp.*
   
   val client = HttpClient(WinHttp)
   ```
3. `engine {}` 블록에서 [`WinHttpClientEngineConfig`](https://api.ktor.io/ktor-client-winhttp/io.ktor.client.engine.winhttp/-win-http-client-engine-config/index.html)를 사용하여 엔진을 설정합니다. 예를 들어, `protocolVersion` 프로퍼티를 사용하여 HTTP 버전을 변경할 수 있습니다.
   ```kotlin
   val client = HttpClient(WinHttp) {
       engine {
           protocolVersion = HttpProtocolVersion.HTTP_1_1
       }
   }
   ```

   전체 예제는 [client-engine-winhttp](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-winhttp)를 참조하세요.

### Curl {id="curl"}

데스크톱 플랫폼을 위해 Ktor는 `Curl` 엔진을 제공합니다. 이는 `linuxX64`, `linuxArm64`, `macosX64`, `macosArm64`, 그리고 `mingwX64`에서 지원됩니다. `Curl` 엔진을 사용하려면 다음 단계를 따르세요.

1. `ktor-client-curl` 의존성을 추가합니다.

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
2. `Curl` 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.curl.*
   
   val client = HttpClient(Curl)
   ```

3. `engine {}` 블록에서 [`CurlClientEngineConfig`](https://api.ktor.io/ktor-client-curl/io.ktor.client.engine.curl/-curl-client-engine-config/index.html)를 사용하여 엔진을 설정합니다. 예를 들어, 테스트 목적으로 SSL 검증을 비활성화할 수 있습니다.
   ```kotlin
   val client = HttpClient(Curl) {
       engine {
           sslVerify = false
       }
   }
   ```

   전체 예제는 [client-engine-curl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-curl)을 참조하세요.

## JVM, Android, Native, JS 및 WasmJs {id="jvm-android-native-wasm-js"}

### CIO {id="cio"}

CIO 엔진은 JVM, Android, Native, JavaScript 및 WebAssembly JavaScript(WasmJs) 플랫폼에서 사용 가능한 완전 비동기 코루틴 기반 엔진입니다. 현재 HTTP/1.x만 지원합니다. 이를 사용하려면 다음 단계를 따르세요.

1. `ktor-client-cio` 의존성을 추가합니다.

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
2. [`CIO`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o/index.html) 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.cio.*
   
   val client = HttpClient(CIO)
   ```

3. `engine {}` 블록에서 [`CIOEngineConfig`](https://api.ktor.io/ktor-client-cio/io.ktor.client.engine.cio/-c-i-o-engine-config/index.html)를 사용하여 엔진을 설정합니다.
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

`Js` 엔진은 [JavaScript 프로젝트](https://kotlinlang.org/docs/js-overview.html)에 사용될 수 있습니다. 브라우저 애플리케이션의 경우 [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)를 사용하고, Node.js의 경우 `node-fetch`를 사용합니다. 이를 사용하려면 다음 단계를 따르세요.

1. `ktor-client-js` 의존성을 추가합니다.

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
2. `Js` 클래스를 `HttpClient` 생성자의 인수로 전달합니다.
   ```kotlin
   import io.ktor.client.*
   import io.ktor.client.engine.js.*
   
   val client = HttpClient(Js)
   ```

   `JsClient()` 함수를 호출하여 `Js` 엔진 싱글톤을 가져올 수도 있습니다.
   ```kotlin
   import io.ktor.client.engine.js.*

   val client = JsClient()
   ```

전체 예제는 [client-engine-js](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-engine-js)를 참조하세요.

## 제한 사항 {id="limitations"}

### HTTP/2 및 WebSocket

모든 엔진이 HTTP/2 프로토콜을 지원하는 것은 아닙니다. 엔진이 HTTP/2를 지원하는 경우 엔진 설정에서 활성화할 수 있습니다. 예를 들어, [Java](#java) 엔진이 있습니다.

아래 표는 특정 엔진이 HTTP/2 및 [WebSockets](client-websockets.topic)를 지원하는지 여부를 보여줍니다.

| 엔진        | HTTP/2 | WebSockets |
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

### 보안

[SSL](client-ssl.md)은 엔진별로 설정해야 합니다. 각 엔진은 고유한 SSL 설정 옵션을 제공합니다.

### 프록시 지원

일부 엔진은 프록시를 지원하지 않습니다. 전체 목록은 [프록시 문서](client-proxy.md#supported_engines)를 참조하세요.

### 로깅

[Logging](client-logging.md) 플러그인은 타겟 플랫폼에 따라 다양한 로거 타입을 제공합니다.

### 타임아웃

[HttpTimeout](client-timeout.md) 플러그인은 특정 엔진에서 일부 제한 사항이 있습니다. 전체 목록은 [타임아웃 제한 사항](client-timeout.md#limitations)을 참조하세요.

## 예제: 멀티플랫폼 모바일 프로젝트에서 엔진을 설정하는 방법 {id="mpp-config"}

멀티플랫폼 프로젝트를 빌드할 때, [expected 및 actual 선언](https://kotlinlang.org/docs/multiplatform-mobile-connect-to-platform-specific-apis.html)을 사용하여 각 타겟 플랫폼에 맞는 엔진을 선택하고 설정할 수 있습니다. 이를 통해 공통 코드에서는 대부분의 클라이언트 설정을 공유하면서 플랫폼 코드에서는 엔진별 옵션을 적용할 수 있습니다. [크로스 플랫폼 모바일 애플리케이션 만들기](client-create-multiplatform-application.md) 튜토리얼에서 생성된 프로젝트를 사용하여 이를 달성하는 방법을 보여드리겠습니다.

<procedure>

1. **shared/src/commonMain/kotlin/com/example/kmpktor/Platform.kt** 파일을 열고, 설정 블록을 인수로 받아 `HttpClient`를 반환하는 최상위 `httpClient()` 함수를 추가합니다.
   ```kotlin
   expect fun httpClient(config: HttpClientConfig<*>.() -> Unit = {}): HttpClient
   ```

2. **shared/src/androidMain/kotlin/com/example/kmpktor/Platform.kt**를 열고 Android 모듈을 위한 `httpClient()` 함수의 실제(actual) 선언을 추가합니다.
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

   > 이 예제는 [`OkHttp`](#okhttp) 엔진을 설정하는 방법을 보여주지만, [Android에서 지원되는](#jvm-android) 다른 엔진을 사용할 수도 있습니다.
   >
   {style="tip"}

3. **shared/src/iosMain/kotlin/com/example/kmpktor/Platform.kt**를 열고 iOS 모듈을 위한 `httpClient()` 함수의 실제(actual) 선언을 추가합니다.
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
   이제 어떤 엔진이 사용되는지 걱정하지 않고 공통 코드에서 `httpClient()`를 호출할 수 있습니다.

4. 공통 코드에서 클라이언트를 사용하려면 **shared/src/commonMain/kotlin/com/example/kmpktor/Greeting.kt**를 열고 `HttpClient()` 생성자를 `httpClient()` 함수 호출로 바꿉니다.
   ```kotlin
   private val client = httpClient()
   ```

</procedure>