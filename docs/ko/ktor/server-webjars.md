[//]: # (title: Webjars)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Webjars"/>
<var name="package_name" value="io.ktor.server.webjars"/>
<var name="artifact_name" value="ktor-server-webjars"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="webjars"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>
%plugin_name% 플러그인은 WebJars에서 제공하는 클라이언트 측 라이브러리를 서빙할 수 있게 해줍니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-webjars/io.ktor.server.webjars/-webjars.html) 플러그인은 [WebJars](https://www.webjars.org/)에서 제공하는 클라이언트 측 라이브러리를 서빙할 수 있게 해줍니다. 이를 통해 JavaScript 및 CSS 라이브러리와 같은 에셋을 [fat JAR](server-fatjar.md)의 일부로 패키징할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}
`%plugin_name%`을 활성화하려면 빌드 스크립트에 다음 아티팩트를 포함해야 합니다:
* `%artifact_name%` 의존성을 추가합니다:

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

* 필요한 클라이언트 측 라이브러리에 대한 의존성을 추가합니다. 아래 예제는 Bootstrap 아티팩트를 추가하는 방법을 보여줍니다:

  <var name="group_id" value="org.webjars"/>
  <var name="artifact_name" value="bootstrap"/>
  <var name="version" value="bootstrap_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>
  
  `$bootstrap_version`을 필요한 `bootstrap` 아티팩트 버전(예: `%bootstrap_version%`)으로 교체할 수 있습니다.

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면,
    지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션을 구성할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하십시오.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
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

## %plugin_name% 설정 {id="configure"}

기본적으로 `%plugin_name%`은 `/webjars` 경로에서 WebJars 에셋을 서빙합니다. 아래 예제는 이를 변경하여 모든 WebJars 에셋을 `/assets` 경로에서 서빙하는 방법을 보여줍니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.webjars.*

fun Application.module() {
    install(Webjars) {
        path = "assets"
    }
}
```

예를 들어, `org.webjars:bootstrap` 의존성을 설치했다면 다음과 같이 `bootstrap.css`를 추가할 수 있습니다:

```html
<head>
    <link rel="stylesheet" href="/assets/bootstrap/bootstrap.css">
</head>
```

`%plugin_name%`을 사용하면 라이브러리를 로드하는 데 사용되는 경로를 변경하지 않고도 의존성 버전을 변경할 수 있다는 점에 유의하십시오.

> 전체 예제는 여기에서 확인할 수 있습니다: [webjars](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/webjars).