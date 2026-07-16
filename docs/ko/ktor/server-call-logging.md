[//]: # (title: 콜 로깅)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CallLogging"/>
<var name="package_name" value="io.ktor.server.plugins.calllogging"/>
<var name="artifact_name" value="ktor-server-call-logging"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="logging"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가적인 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">네이티브 서버</Links> 지원</b>: ✖️
</p>
</tldr>

Ktor는 [SLF4J](http://www.slf4j.org/) 라이브러리를 사용하여 애플리케이션 이벤트를 로깅하는 기능을 제공합니다. 일반적인 로깅 구성에 대해서는 [Ktor 서버의 로깅](server-logging.md) 주제에서 확인할 수 있습니다.

`%plugin_name%` 플러그인을 사용하면 들어오는 클라이언트 요청을 로깅할 수 있습니다.

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
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links> 내의 <code>install</code> 함수에 해당 플러그인을 전달하세요.
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

## 로깅 설정 구성 {id="configure"}

`%plugin_name%`은 로깅 수준 지정, 특정 조건에 따른 요청 필터링, 로그 메시지 사용자 정의 등 다양한 방법으로 구성할 수 있습니다. 사용 가능한 구성 설정은 [CallLoggingConfig](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/-call-logging-config/index.html)에서 확인할 수 있습니다.

### 로깅 수준 설정 {id="logging_level"}

기본적으로 Ktor는 `Level.INFO` 로깅 수준을 사용합니다. 이를 변경하려면 `level` 속성을 사용하세요:

```kotlin
install(CallLogging) {
    level = Level.INFO
}
```

### 로그 요청 필터링 {id="filter"}

`filter` 속성을 사용하면 요청 필터링을 위한 조건을 추가할 수 있습니다. 아래 예제에서는 `/api/v1`으로 들어오는 요청만 로그에 기록됩니다:

```kotlin
install(CallLogging) {
    filter { call ->
        call.request.path().startsWith("/api/v1")
    }
}
```

### 로그 메시지 포맷 사용자 정의 {id="format"}

`format` 함수를 사용하면 요청/응답과 관련된 모든 데이터를 로그에 담을 수 있습니다. 아래 예제는 각 요청에 대해 응답 상태, HTTP 메서드, `User-Agent` 헤더 값을 로깅하는 방법을 보여줍니다.

```kotlin
install(CallLogging) {
    format { call ->
        val status = call.response.status()
        val httpMethod = call.request.httpMethod.value
        val userAgent = call.request.headers["User-Agent"]
        "Status: $status, HTTP method: $httpMethod, User agent: $userAgent"
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging).

### MDC에 콜 파라미터 넣기 {id="mdc"}

`%plugin_name%` 플러그인은 MDC(Mapped Diagnostic Context)를 지원합니다. `mdc` 함수를 사용하여 원하는 컨텍스트 값을 지정된 이름으로 MDC에 넣을 수 있습니다. 예를 들어, 아래 코드 스니펫에서는 `name` 쿼리 파라미터가 MDC에 추가됩니다:

```kotlin
install(CallLogging) {
    mdc("name-parameter") { call ->
        call.request.queryParameters["name"]
    }
}
```

추가된 값은 `ApplicationCall` 수명 주기 동안 접근할 수 있습니다:

```kotlin
import org.slf4j.MDC
// ...
MDC.get("name-parameter")