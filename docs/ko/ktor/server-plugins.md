[//]: # (title: 서버 플러그인)

<show-structure for="chapter" depth="2"/>

<link-summary>
플러그인은 직렬화, 콘텐츠 인코딩, 압축 등과 같은 공통 기능을 제공합니다.
</link-summary>

Ktor의 일반적인 요청/응답 파이프라인은 다음과 같습니다:

![Request Response Pipeline](request-response-pipeline.png){width="600"}

서버가 요청을 수신하면 요청 파이프라인을 통해 처리됩니다. Ktor는 요청을 적절한 핸들러로 라우팅하고, 핸들러의 애플리케이션 로직에서 이를 처리합니다. 그런 다음 응답은 클라이언트로 전송되기 전에 응답 파이프라인을 거치게 됩니다.

## 플러그인으로 기능 추가 {id="add_functionality"}

많은 애플리케이션은 애플리케이션 로직과 분리된 기능을 필요로 합니다. 여기에는 인증, 직렬화 및 콘텐츠 인코딩, 압축, 헤더, 쿠키 등이 포함됩니다. Ktor에서는 이러한 기능이 _플러그인(plugins)_을 통해 제공됩니다.

플러그인은 요청 및 응답 처리의 다양한 단계를 가로챌(intercept) 수 있습니다. 따라서 요청/응답 파이프라인의 여러 지점에 적용될 수 있습니다:

![Plugin pipeline](plugin-pipeline.png){width="600"}

플러그인이 실행되는 정확한 단계는 플러그인 자체와 해당 플러그인이 사용하는 훅(hook) 또는 파이프라인 단계에 따라 다릅니다. 일반적으로 요청은 다음과 같이 처리될 수 있습니다:

* 라우팅 메커니즘이 요청을 처리할 핸들러를 결정합니다.
* 요청이 핸들러로 전달되기 전에 하나 이상의 플러그인에 의해 처리됩니다.
* 핸들러는 애플리케이션 로직을 사용하여 응답을 생성합니다.
* 응답이 클라이언트로 전송되기 전에 하나 이상의 플러그인에 의해 처리됩니다.

## 라우팅도 하나의 플러그인입니다 {id="routing"}

플러그인은 최대한의 유연성을 제공하고, 요청/응답 파이프라인의 어떤 세그먼트에도 존재할 수 있도록 설계되었습니다. Ktor에서는 `routing` 자체도 플러그인으로 구현되어 있습니다: 

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## 플러그인 의존성 추가 {id="dependency"}

대부분의 플러그인은 별도의 의존성을 필요로 합니다. 예를 들어, [`CORS`](server-cors.md) 플러그인은 빌드 스크립트에 `ktor-server-cors` 아티팩트가 필요합니다:

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 사용 가능한 전체 플러그인 목록은 [Ktor 프로젝트 생성기(Ktor Project Generator)](https://start.ktor.io/settings)를 참조하세요. 특정 플러그인에 필요한 의존성은 해당 플러그인 문서를 참조하세요.
> 
{style="tip"}

## 플러그인 설치 {id="install"}

플러그인은 일반적으로 `install()` 함수를 사용하여 서버 초기화 단계에서 구성됩니다. [서버 생성](server-create-and-configure.topic) 방식에 따라 `embeddedServer()` 함수 내부 또는 [애플리케이션 모듈](server-modules.md)에서 플러그인을 설치할 수 있습니다:

<Tabs>
<TabItem title="embeddedServer()">

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

</TabItem>
<TabItem title="Application.module()">

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

</TabItem>
</Tabs>

`install()` 함수에 구성 블록을 전달하여 플러그인을 설치할 때 구성할 수 있습니다.

예를 들어, [`Sessions` 플러그인](server-sessions.md)을 설치할 때 세션 유형과 쿠키 이름을 지정하여 쿠키 기반 세션을 구성할 수 있습니다:

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 특정 라우트에 플러그인 설치 {id="install-route"}

Ktor에서는 플러그인을 전역뿐만 아니라 특정 [라우트(routes)](server-routing.md)에 설치할 수도 있습니다. 이는 리소스마다 서로 다른 플러그인 구성이 필요할 때 유용합니다.

예를 들어, 다음 코드는 `/index` 라우트에 [`CachingHeader` 플러그인](server-caching-headers.md)을 설치하고 캐싱 헤더를 추가하도록 구성하는 방법을 보여줍니다:

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

동일한 플러그인이 여러 수준에 설치된 경우, Ktor는 다음 규칙을 적용합니다:

* 특정 라우트에 설치된 플러그인의 구성은 해당하는 [전역 플러그인 구성](#install)보다 우선 적용(override)됩니다.
* 동일한 라우트가 여러 번 정의되고 동일한 플러그인의 여러 설치가 포함되어 있는 경우, 라우팅은 해당 라우트에 대한 설치를 병합합니다. 이때 마지막 설치가 우선합니다.

다음 예제에서는 `/index/a`와 `/index/b`에 대한 호출이 모두 두 번째 `CachingHeaders` 설치에 의해서만 처리됩니다:
   
 ```kotlin
 routing {
     route("index") {
         install(CachingHeaders) { /* First configuration */ }
         get("a") {
             // ...
         }
     }
     route("index") {
         install(CachingHeaders) { /* Second configuration */ }
         get("b") {
             // ...
         }
     }
 }
 ```
 {initial-collapse-state="collapsed" collapsed-title="install(CachingHeaders) { // First configuration }"}

## 기본, 제공 및 커스텀 플러그인 {id="default_available_custom"}

Ktor는 기본적으로 애플리케이션 플러그인을 설치하지 않습니다. 애플리케이션에 필요한 기능을 제공하는 플러그인을 직접 설치해야 합니다.

Ktor는 다양한 플러그인을 제공합니다. 사용 가능한 전체 플러그인 목록은 [Ktor 프로젝트 생성기(Ktor Project Generator)](https://start.ktor.io/settings)에서 확인할 수 있습니다.

또한 [커스텀 플러그인](server-custom-plugins.md)을 직접 생성하여 애플리케이션 전체에서 재사용하거나 다른 애플리케이션과 공유할 수 있도록 기능을 캡슐화할 수도 있습니다.