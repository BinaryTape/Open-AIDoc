[//]: # (title: 캐싱 헤더(Caching headers))

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CachingHeaders"/>
<var name="package_name" value="io.ktor.server.plugins.cachingheaders"/>
<var name="artifact_name" value="ktor-server-caching-headers"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="caching-headers"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">네이티브 서버(Native server)</Links> 지원</b>: ✅
</p>
</tldr>

[CachingHeaders](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers.html) 플러그인은 HTTP 캐싱에 사용되는 `Cache-Control` 및 `Expires` 헤더를 구성하는 기능을 추가합니다. 다음과 같은 방법으로 [캐싱을 구성](#configure)할 수 있습니다:
- 이미지, CSS, JavaScript 파일 등 특정 콘텐츠 유형에 대해 서로 다른 캐싱 전략을 구성합니다.
- 애플리케이션 전역 수준, 라우트 수준 또는 특정 콜(call) 수준과 같이 다양한 수준에서 캐싱 옵션을 지정합니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
</p>
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

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션 구조를 잡을 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 이를 전달하세요.
    아래의 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다 ...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 플러그인은 <a href="#install-route">특정 라우트에 설치</a>할 수도 있습니다.
    이는 서로 다른 애플리케이션 리소스에 대해 서로 다른 <code>%plugin_name%</code> 구성이 필요한 경우 유용할 수 있습니다.
</p>

`%plugin_name%`을 설치한 후, 다양한 콘텐츠 유형에 대해 캐싱 설정을 [구성](#configure)할 수 있습니다.

## 캐싱 구성 {id="configure"}
`%plugin_name%` 플러그인을 구성하려면, 주어진 `ApplicationCall` 및 콘텐츠 유형에 대해 지정된 캐싱 옵션을 제공하는 [options](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers-config/options.html) 함수를 정의해야 합니다. [caching-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers) 예제의 코드 스니펫은 일반 텍스트와 HTML에 대해 `max-age` 옵션과 함께 `Cache-Control` 헤더를 추가하는 방법을 보여줍니다:

```kotlin
fun Application.module() {
    routing {
        install(CachingHeaders) {
            options { call, content ->
                when (content.contentType?.withoutParameters()) {
                    ContentType.Text.Plain -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 3600))
                    ContentType.Text.Html -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 60))
                    else -> null
                }
            }
        }
    }
}
```

[CachingOptions](https://api.ktor.io/ktor-http/io.ktor.http.content/-caching-options/index.html) 객체는 `Cache-Control` 및 `Expires` 헤더 값을 매개변수로 받습니다:

* `cacheControl` 매개변수는 [CacheControl](https://api.ktor.io/ktor-http/io.ktor.http/-cache-control/index.html) 값을 받습니다. `CacheControl.MaxAge`를 사용하여 `max-age` 매개변수와 가시성(visibility), 재검증 옵션 등 관련 설정을 지정할 수 있습니다. `CacheControl.NoCache`/`CacheControl.NoStore`를 사용하여 캐싱을 비활성화할 수 있습니다.
* `expires` 매개변수를 사용하면 `Expires` 헤더를 `GMTDate` 또는 `ZonedDateTime` 값으로 지정할 수 있습니다.

### 라우트 수준 {id="configure-route"}

플러그인을 전역뿐만 아니라 [특정 라우트](server-plugins.md#install-route)에도 설치할 수 있습니다. 예를 들어, 아래 예제는 `/index` 라우트에 대해 지정된 캐싱 헤더를 추가하는 방법을 보여줍니다:

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

### 콜 수준 {id="configure-call"}

더 세밀한 캐싱 설정이 필요한 경우, `ApplicationCall.caching` 속성을 사용하여 콜(call) 수준에서 캐싱 옵션을 구성할 수 있습니다. 아래 예제는 사용자의 로그인 여부에 따라 캐싱 옵션을 구성하는 방법을 보여줍니다:

```kotlin
route("/profile") {
    get {
        val userLoggedIn = true
        if(userLoggedIn) {
            call.caching = CachingOptions(CacheControl.NoStore(CacheControl.Visibility.Private))
            call.respondText("Profile page")
        } else {
            call.caching = CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 900))
            call.respondText("Login page")
        }
    }
}
```

> 사용자 로그인에 대해서는 [Authentication](server-auth.md) 및 [Sessions](server-sessions.md) 플러그인을 사용할 수 있습니다.