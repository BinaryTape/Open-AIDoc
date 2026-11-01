[//]: # (title: Caching headers)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CachingHeaders"/>
<var name="package_name" value="io.ktor.server.plugins.cachingheaders"/>
<var name="artifact_name" value="ktor-server-caching-headers"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cachingHeaders"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="caching-headers"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하므로 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

[CachingHeaders](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers.html) 플러그인은 HTTP 캐싱에 사용되는 `Cache-Control` 및 `Expires` 헤더를 구성하는 기능을 추가합니다. 다음과 같은 방법으로 [캐싱을 구성](#configure)할 수 있습니다.
- 이미지, CSS 및 JavaScript 파일 등과 같은 특정 콘텐츠 유형에 대해 서로 다른 캐싱 전략을 구성합니다.
- 다양한 수준에서 캐싱 옵션을 지정합니다. 애플리케이션 수준에서 전역적으로 지정하거나, 라우트 수준에서 지정하거나, 특정 호출에 대해 지정할 수 있습니다.

## 종속성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요.
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 종속성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 종속성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="server-plugins.md#install">설치</a>하려면,
    지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다.
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내에서 설치.
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 플러그인은 <a href="server-plugins.md#install-route">특정 라우트에 설치</a>할 수도 있습니다.
    이는 애플리케이션의 서로 다른 리소스에 대해 각기 다른 <code>%plugin_name%</code> 구성이 필요한 경우 유용할 수 있습니다.
</p>

`%plugin_name%`을(를) 설치한 후에는 다양한 콘텐츠 유형에 대한 캐싱 설정을 [구성](#configure)할 수 있습니다.

## 캐싱 구성 {id="configure"}
`%plugin_name%` 플러그인을 구성하려면 지정된 `ApplicationCall` 및 콘텐츠 유형에 대해 명시된 캐싱 옵션을 제공하도록 [options](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers-config/options.html) 함수를 정의해야 합니다. [caching-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers) 예제의 코드 스니펫은 일반 텍스트 및 HTML에 `max-age` 옵션이 포함된 `Cache-Control` 헤더를 추가하는 방법을 보여줍니다.

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

[CachingOptions](https://api.ktor.io/ktor-http/io.ktor.http.content/-caching-options/index.html) 객체는 `Cache-Control` 및 `Expires` 헤더 값을 매개변수로 받습니다.

* `cacheControl` 매개변수는 [CacheControl](https://api.ktor.io/ktor-http/io.ktor.http/-cache-control/index.html) 값을 받습니다. `CacheControl.MaxAge`를 사용하여 `max-age` 매개변수와 공개 범위(visibility), 재검증 옵션 등의 관련 설정을 지정할 수 있습니다. `CacheControl.NoCache`/`CacheControl.NoStore`를 사용하여 캐싱을 비활성화할 수 있습니다.
* `expires` 매개변수를 사용하면 `Expires` 헤더를 `GMTDate` 또는 `ZonedDateTime` 값으로 지정할 수 있습니다.

### 라우트 수준 {id="configure-route"}

플러그인은 전역적으로뿐만 아니라 [특정 라우트](server-plugins.md#install-route)에도 설치할 수 있습니다. 예를 들어, 아래 예제는 `/index` 라우트에 지정된 캐싱 헤더를 추가하는 방법을 보여줍니다.

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

### 호출 수준 {id="configure-call"}

더 세밀한 캐싱 설정이 필요한 경우, `ApplicationCall.caching` 속성을 사용하여 호출 수준에서 캐싱 옵션을 구성할 수 있습니다. 아래 예제는 사용자의 로그인 여부에 따라 캐싱 옵션을 구성하는 방법을 보여줍니다.

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

> 사용자 로그인 처리에는 [Authentication](server-auth.md) 및 [Sessions](server-sessions.md) 플러그인을 사용할 수 있습니다.