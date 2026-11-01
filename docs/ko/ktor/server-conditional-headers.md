[//]: # (title: 조건부 헤더)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-conditional-headers"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.conditionalHeaders"/>
<var name="package_name" value="io.ktor.server.plugins.conditionalheaders"/>
<var name="plugin_name" value="ConditionalHeaders"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="conditional-headers"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하여 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

[ConditionalHeaders](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers.html) 플러그인은 이전 요청 이후 콘텐츠가 변경되지 않은 경우 콘텐츠 본문을 전송하지 않도록 합니다. 이는 다음 헤더들을 사용하여 수행됩니다:
* `Last-Modified` 응답 헤더는 리소스 수정 시간을 포함합니다. 예를 들어 클라이언트 요청에 `If-Modified-Since` 값이 포함되어 있는 경우, Ktor는 지정된 날짜 이후에 리소스가 수정된 경우에만 전체 응답을 전송합니다. [정적 파일](server-static-content.md)의 경우, `ConditionalHeaders`를 [설치](#install_plugin)한 후 Ktor가 `Last-Modified` 헤더를 자동으로 추가합니다.
* `Etag` 응답 헤더는 특정 리소스 버전에 대한 식별자입니다. 예를 들어 클라이언트 요청에 `If-None-Match` 값이 포함되어 있는 경우, 이 값이 `Etag`와 일치하면 Ktor는 전체 응답을 전송하지 않습니다. `ConditionalHeaders`를 [구성](#configure)할 때 `Etag` 값을 지정할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
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
    다음 예제는 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다:
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
    이는 애플리케이션 리소스마다 서로 다른 <code>%plugin_name%</code> 구성이 필요한 경우 유용할 수 있습니다.
</p>

## 헤더 구성 {id="configure"}

`%plugin_name%`을 구성하려면 `install` 블록 내에서 [version](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers-config/version.html) 함수를 호출해야 합니다. 이 함수는 주어진 `ApplicationCall` 및 `OutgoingContent`에 대한 리소스 버전 목록에 대한 접근을 제공합니다. [EntityTagVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-entity-tag-version/index.html) 및 [LastModifiedVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-last-modified-version/index.html) 클래스 객체를 사용하여 필요한 버전을 지정할 수 있습니다.

아래 코드 스니펫은 CSS에 대해 `Etag` 및 `Last-Modified` 헤더를 추가하는 방법을 보여줍니다:
```kotlin
install(ConditionalHeaders) {
    val file = File("src/main/kotlin/com/example/Application.kt")
    version { call, outgoingContent ->
        when (outgoingContent.contentType?.withoutParameters()) {
            ContentType.Text.CSS -> listOf(
                EntityTagVersion(file.lastModified().hashCode().toString()),
                LastModifiedVersion(Date(file.lastModified()))
            )
            else -> emptyList()
        }
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [conditional-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/conditional-headers).