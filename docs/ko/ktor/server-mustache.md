[//]: # (title: Mustache)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[mustache_factory]: http://spullara.github.io/mustache/apidocs/com/github/mustachejava/MustacheFactory.html

<var name="plugin_name" value="Mustache"/>
<var name="package_name" value="io.ktor.server.mustache"/>
<var name="artifact_name" value="ktor-server-mustache"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="mustache"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

Ktor는 [Mustache](https://api.ktor.io/ktor-server-mustache/io.ktor.server.mustache/-mustache) 플러그인을 설치하여 [Mustache 템플릿](https://github.com/spullara/mustache.java)을 애플리케이션 내의 뷰(view)로 사용할 수 있게 해줍니다.

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

## Mustache 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치.
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

`install` 블록 내부에서 Mustache 템플릿 로딩을 위한 [MustacheFactory][mustache_factory]를 [설정](#template_loading)할 수 있습니다.

## Mustache 설정 {id="configure"}
### 템플릿 로딩 설정 {id="template_loading"}
템플릿을 로드하려면 `mustacheFactory` 프로퍼티에 [MustacheFactory][mustache_factory]를 할당해야 합니다. 예를 들어, 아래 코드 스니펫은 Ktor가 현재 클래스패스(classpath)를 기준으로 `templates` 패키지에서 템플릿을 찾을 수 있도록 설정합니다:
```kotlin
import com.github.mustachejava.DefaultMustacheFactory
import io.ktor.server.application.*
import io.ktor.server.mustache.Mustache
import io.ktor.server.mustache.MustacheContent

fun Application.module() {
    install(Mustache) {
        mustacheFactory = DefaultMustacheFactory("templates")
    }
}
```

### 응답으로 템플릿 전송 {id="use_template"}
`resources/templates`에 `index.hbs` 템플릿이 있다고 가정해 보겠습니다:
```html
<html>
    <body>
        <h1>Hello, {{user.name}}</h1>
    </body>
</html>
```

사용자 데이터 모델은 다음과 같습니다:
```kotlin
data class User(val id: Int, val name: String)
```

지정된 [라우트](server-routing.md)에 템플릿을 사용하려면, 다음과 같이 `call.respond` 메서드에 `MustacheContent`를 전달하세요:
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(MustacheContent("index.hbs", mapOf("user" to sampleUser)))
}