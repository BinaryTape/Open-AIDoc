[//]: # (title: 서버 플러그인)

<show-structure for="chapter" depth="2"/>

<link-summary>
플러그인은 직렬화, 콘텐츠 인코딩, 압축 등과 같은 공통 기능을 제공합니다.
</link-summary>

Ktor의 전형적인 요청/응답 파이프라인(pipeline)은 다음과 같습니다:

![Request Response Pipeline](request-response-pipeline.png){width="600"}

요청에서 시작하여 특정 핸들러로 라우팅되고, 애플리케이션 로직에 의해 처리된 후 최종적으로 응답이 이루어집니다. 

## 플러그인으로 기능 추가하기 {id="add_functionality"}

많은 애플리케이션은 애플리케이션 로직의 범위를 벗어난 공통 기능을 필요로 합니다. 이는 직렬화(serialization) 및 콘텐츠 인코딩(content encoding), 압축(compression), 헤더(headers), 쿠키(cookie) 지원 등이 될 수 있습니다. Ktor에서는 이러한 모든 기능을 **플러그인(Plugins)**이라는 수단을 통해 제공합니다. 

이전 파이프라인 다이어그램을 보면, 플러그인은 요청/응답과 애플리케이션 로직 사이에 위치합니다:

![Plugin pipeline](plugin-pipeline.png){width="600"}

요청이 들어오면:

* 라우팅 메커니즘을 통해 올바른 핸들러로 라우팅됩니다.
* 핸들러에 전달되기 전에 하나 이상의 플러그인을 거칩니다.
* 핸들러(애플리케이션 로직)가 요청을 처리합니다.
* 응답이 클라이언트로 전송되기 전에 하나 이상의 플러그인을 거칩니다.

## 라우팅은 플러그인입니다 {id="routing"}

플러그인은 최대한의 유연성을 제공하도록 설계되었으며, 요청/응답 파이프라인의 모든 세그먼트에 존재할 수 있습니다. 사실, 지금까지 `routing`이라고 불러온 것은 하나의 플러그인에 불과합니다. 

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## 플러그인 의존성 추가 {id="dependency"}
대부분의 플러그인은 특정 의존성을 필요로 합니다. 예를 들어, `CORS` 플러그인은 빌드 스크립트에 `ktor-server-cors` 아티팩트를 추가해야 합니다:

<var name="artifact_name" value="ktor-server-cors"/>
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

## 플러그인 설치 {id="install"}

플러그인은 일반적으로 플러그인을 매개변수로 받는 `install` 함수를 사용하여 서버의 초기화 단계에서 구성됩니다. [서버를 생성하는 방식](server-create-and-configure.topic)에 따라 `embeddedServer` 호출 내부에서 플러그인을 설치하거나...

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun main() {
    embeddedServer(Netty, port = 8080) {
        install(CORS)
        install(Compression)
        // ...
    }.start(wait = true)
}
```

... 또는 지정된 [모듈(module)](server-modules.md) 내에서 설치할 수 있습니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun Application.module() {
    install(CORS)
    install(Compression)
    // ...
}
```

요청과 응답을 가로채는 것 외에도, 플러그인은 이 단계에서 구성되는 옵션 설정 섹션을 가질 수 있습니다.

예를 들어, [쿠키(Cookies)](server-sessions.md#cookie)를 설치할 때 쿠키가 저장될 위치나 이름과 같은 특정 매개변수를 설정할 수 있습니다:

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 특정 라우트에 플러그인 설치하기 {id="install-route"}

Ktor에서는 전역뿐만 아니라 특정 [라우트(routes)](server-routing.md)에도 플러그인을 설치할 수 있습니다. 이는 서로 다른 애플리케이션 리소스에 대해 서로 다른 플러그인 구성이 필요한 경우 유용할 수 있습니다. 예를 들어, 아래의 [예제](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers-routes)는 `/index` 라우트에 특정 [캐싱 헤더(caching header)](server-caching-headers.md)를 추가하는 방법을 보여줍니다:

```kotlin
route("/index") {
    install(CachingHeaders) {
        options { call, content -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 1800)) }
    }
    get {
        call.respondText("Index page")
    }
}
```

동일한 플러그인을 여러 번 설치할 때는 다음 규칙이 적용됩니다:
* 특정 라우트에 설치된 플러그인 구성은 [전역 구성](#install)보다 우선합니다.
* 라우팅은 동일한 라우트에 대한 설치를 병합하며, 마지막 설치가 적용됩니다. 예를 들어, 다음과 같은 애플리케이션의 경우... 
   
   ```kotlin
   routing {
       route("index") {
           install(CachingHeaders) { /* 첫 번째 구성 */ }
           get("a") {
               // ...
           }
       }
       route("index") {
           install(CachingHeaders) { /* 두 번째 구성 */ }
           get("b") {
               // ...
           }
       }
   }
   ```
   {initial-collapse-state="collapsed" collapsed-title="install(CachingHeaders) { // 첫 번째 구성 }"}
   
   ... `/index/a` 및 `/index/b`에 대한 두 호출 모두 플러그인의 두 번째 설치에 의해서만 처리됩니다.

## 기본, 사용 가능 및 커스텀 플러그인 {id="default_available_custom"}

기본적으로 Ktor는 어떠한 플러그인도 활성화하지 않으므로, 애플리케이션에 필요한 기능을 위한 플러그인을 직접 설치해야 합니다.

하지만 Ktor는 기본적으로 제공되는 다양한 플러그인을 지원합니다. [Ktor 플러그인 레지스트리(Ktor Plugin Registry)](https://github.com/ktorio/ktor-plugin-registry/tree/main/plugins/server)에서 전체 목록을 확인할 수 있습니다.

또한 자신만의 [커스텀 플러그인(custom plugins)](server-custom-plugins.md)을 만들 수도 있습니다.