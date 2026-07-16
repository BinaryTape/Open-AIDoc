[//]: # (title: 조건부 헤더)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-conditional-headers"/>
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
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

[ConditionalHeaders](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers.html) 플러그인은 마지막 요청 이후 콘텐츠가 변경되지 않은 경우 콘텐츠 본문 전송을 방지합니다. 이는 다음과 같은 헤더를 사용하여 이루어집니다:
* `Last-Modified` 응답 헤더는 리소스 수정 시간을 포함합니다. 예를 들어, 클라이언트 요청에 `If-Modified-Since` 값이 포함된 경우, Ktor는 지정된 날짜 이후에 리소스가 수정된 경우에만 전체 응답을 보냅니다. [정적 파일](server-static-content.md)의 경우, Ktor는 `ConditionalHeaders`를 [설치](#install_plugin)한 후 `Last-Modified` 헤더를 자동으로 추가합니다.
* `Etag` 응답 헤더는 특정 리소스 버전에 대한 식별자입니다. 예를 들어, 클라이언트 요청에 `If-None-Match` 값이 포함된 경우, 이 값이 `Etag`와 일치하면 Ktor는 전체 응답을 보내지 않습니다. `ConditionalHeaders`를 [설정](#configure)할 때 `Etag` 값을 지정할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>를 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
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
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links> 내의 <code>install</code> 함수에 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>를 설치하는 방법을 보여줍니다 ...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서.
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
    이는 다른 애플리케이션 리소스에 대해 서로 다른 <code>%plugin_name%</code> 설정이 필요한 경우 유용할 수 있습니다.
</p>

## 헤더 설정 {id="configure"}

`%plugin_name%`를 설정하려면 `install` 블록 내에서 [version](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers-config/version.html) 함수를 호출해야 합니다. 이 함수는 지정된 `ApplicationCall` 및 `OutgoingContent`에 대한 리소스 버전 목록에 접근할 수 있게 해줍니다. [EntityTagVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-entity-tag-version/index.html) 및 [LastModifiedVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-last-modified-version/index.html) 클래스 객체를 사용하여 필요한 버전을 지정할 수 있습니다.

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

전체 예제는 여기에서 찾을 수 있습니다: [conditional-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/conditional-headers).