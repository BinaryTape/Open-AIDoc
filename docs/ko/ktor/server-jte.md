[//]: # (title: JTE)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Jte"/>
<var name="package_name" value="io.ktor.server.jte"/>
<var name="artifact_name" value="ktor-server-jte"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.jte"/>

<tldr>
<p>
<b>필요한 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="jte"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">네이티브 서버</Links> 지원</b>: ✖️
</p>
</tldr>

Ktor에서는 [%plugin_name%](https://api.ktor.io/ktor-server-jte/io.ktor.server.jte/-jte.html) 플러그인을 설치하여 애플리케이션 내에서 [JTE 템플릿](https://github.com/casid/jte)을 뷰로 사용할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가합니다:
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

`.kte` 파일을 처리하려면 프로젝트에 `gg.jte:jte-kotlin` 아티팩트를 추가합니다:

<var name="group_id" value="gg.jte"/>
<var name="artifact_name" value="jte-kotlin"/>
<var name="version" value="jte_version" />
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 현재 `jte‑kotlin` 컴파일러 플러그인은 Kotlin 2.3.x와 호환되지 않습니다.
> Ktor 3.4.0은 Kotlin 2.3 툴체인을 사용하므로, `jte‑kotlin`
> 플러그인에 Kotlin 2.3 지원이 추가될 때까지 Ktor JTE 플러그인을 사용할 수 없습니다.
> 
> JTE를 사용해야 하는 경우, `jte‑kotlin`이 Kotlin 2.3용으로 업데이트될 때까지 Kotlin 2.2.x 및 호환되는 Ktor 버전을 사용하세요.
> 
{style="warning"}

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="server-plugins.md#install">설치</a>하려면,
    지정된 <Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내에서 설치합니다.
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내에서 설치합니다.
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

`install` 블록 내부에서 JTE 템플릿을 로드하는 방법을 [구성](#configure)할 수 있습니다.

## %plugin_name% 구성 {id="configure"}
### 템플릿 로딩 구성 {id="template_loading"}
JTE 템플릿을 로드하려면 다음 작업을 수행해야 합니다:
1. 템플릿 코드를 확인(resolve)하는 데 사용되는 `CodeResolver`를 생성합니다. 예를 들어, `DirectoryCodeResolver`를 구성하여 지정된 디렉터리에서 템플릿을 로드하거나 `ResourceCodeResolver`를 구성하여 애플리케이션 리소스에서 템플릿을 로드할 수 있습니다.
2. `templateEngine` 프로퍼티를 사용하여 템플릿 엔진을 지정합니다. 이 템플릿 엔진은 생성된 `CodeResolver`를 사용하여 템플릿을 네이티브 Java/Kotlin 코드로 변환합니다.

예를 들어, 아래 코드 스니펫은 Ktor가 `templates` 디렉터리에서 JTE 템플릿을 찾을 수 있도록 설정합니다:

```kotlin
import gg.jte.TemplateEngine
import gg.jte.resolve.DirectoryCodeResolver
import io.ktor.server.application.*
import io.ktor.server.jte.*
import java.nio.file.Path

fun Application.module() {
    install(Jte) {
        val resolver = DirectoryCodeResolver(Path.of("templates"))
        templateEngine = TemplateEngine.create(resolver, gg.jte.ContentType.Html)
    }
}
```

### 응답으로 템플릿 전송 {id="use_template"}
`templates` 디렉터리에 다음과 같은 `index.kte` 템플릿이 있다고 가정해 보겠습니다:
```html
@param id: Int
@param name: String
<html>
    <body>
        <h1>Hello, ${name}!</h1>
    </body>
</html>
```

지정된 [라우트](server-routing.md)에 템플릿을 사용하려면 다음과 같이 `call.respond` 메서드에 `JteContent`를 전달합니다:
```kotlin
get("/index") {
    val params = mapOf("id" to 1, "name" to "John")
    call.respond(JteContent("index.kte", params))
}
```