[//]: # (title: 상태 페이지)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="StatusPages"/>
<var name="package_name" value="io.ktor.server.plugins.statuspages"/>
<var name="artifact_name" value="ktor-server-status-pages"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="status-pages"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 플러그인을 사용하면 Ktor 애플리케이션에서 발생한 예외나 상태 코드에 따라 모든 실패 상태에 적절하게 응답할 수 있습니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-status-pages/io.ktor.server.plugins.statuspages/-status-pages.html) 플러그인을 사용하면 Ktor 애플리케이션에서 발생한 예외나 상태 코드에 따라 모든 실패 상태에 적절하게 [응답](server-responses.md)할 수 있습니다.

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
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">모듈</Links>의 <code>install</code> 함수에 해당 플러그인을 전달하세요.
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

`%plugin_name%` 플러그인에서 제공하는 세 가지 주요 설정 옵션은 다음과 같습니다:

- [exceptions](#exceptions): 매핑된 예외 클래스에 따른 응답을 설정합니다.
- [status](#status): 상태 코드 값에 따른 응답을 설정합니다.
- [statusFile](#status-file): 클래스패스(classpath)에 있는 파일 응답을 설정합니다.

### Exceptions {id="exceptions"}

`exception` 핸들러를 사용하면 `Throwable` 예외가 발생하는 호출을 처리할 수 있습니다. 가장 기본적인 경우, 모든 예외에 대해 `500` HTTP 상태 코드를 설정할 수 있습니다:

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
    }
}
```

또한 특정 예외를 확인하고 필요한 콘텐츠로 응답할 수 있습니다:

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        if(cause is AuthorizationException) {
            call.respondText(text = "403: $cause" , status = HttpStatusCode.Forbidden)
        } else {
            call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
        }
    }
}
```

### Status {id="status"}

`status` 핸들러는 상태 코드에 따라 특정 콘텐츠로 응답하는 기능을 제공합니다. 아래 예제는 서버에 리소스가 없는 경우(`404` 상태 코드) 요청에 응답하는 방법을 보여줍니다:

```kotlin
install(StatusPages) {
    status(HttpStatusCode.NotFound) { call, status ->
        call.respondText(text = "404: Page Not Found", status = status)
    }
}
```

### Status file {id="status-file"}

`statusFile` 핸들러를 사용하면 상태 코드에 따라 HTML 페이지를 제공할 수 있습니다. 프로젝트의 `resources` 폴더에 `error401.html` 및 `error402.html` HTML 페이지가 포함되어 있다고 가정해 보겠습니다. 이 경우 다음과 같이 `statusFile`을 사용하여 `401` 및 `402` 상태 코드를 처리할 수 있습니다:
```kotlin
install(StatusPages) {
    statusFile(HttpStatusCode.Unauthorized, HttpStatusCode.PaymentRequired, filePattern = "error#.html")
}
```

`statusFile` 핸들러는 설정된 상태 코드 목록 내에서 `#` 문자를 해당 상태 코드 값으로 바꿉니다.

> 전체 예제는 여기에서 확인할 수 있습니다: [status-pages](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/status-pages).