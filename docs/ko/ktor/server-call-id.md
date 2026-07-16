[//]: # (title: Ktor 서버에서 요청 추적하기)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="package_name" value="io.ktor.server.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="call-id"/>
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
%plugin_name% 서버 플러그인을 사용하면 고유한 호출 ID를 사용하여 클라이언트 요청을 추적할 수 있습니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) 플러그인을 사용하면 고유한 요청 ID 또는 호출 ID(call ID)를 사용하여 클라이언트 요청을 엔드투엔드(end-to-end)로 추적할 수 있습니다. 일반적으로 Ktor에서 호출 ID 작업은 다음과 같이 이루어집니다:
1. 먼저, 다음 중 하나의 방법으로 특정 요청에 대한 호출 ID를 가져와야 합니다:
   * 역방향 프록시(reverse proxy, 예: Nginx)나 클라우드 제공업체(예: [Heroku](heroku.md))가 `X-Request-Id`와 같은 특정 헤더에 호출 ID를 추가할 수 있습니다. 이 경우 Ktor에서 호출 ID를 [가져오도록(retrieve)](#retrieve) 할 수 있습니다.
   * 요청에 호출 ID가 포함되어 있지 않은 경우, Ktor 서버에서 호출 ID를 [생성(generate)](#generate)할 수 있습니다.
2. 다음으로, Ktor는 사전 정의된 딕셔너리를 사용하여 가져오거나 생성된 호출 ID를 [검증(verify)](#verify)합니다. 호출 ID를 검증하기 위한 사용자 정의 조건을 제공할 수도 있습니다.
3. 마지막으로, `X-Request-Id`와 같은 특정 헤더를 통해 클라이언트에게 호출 ID를 [전송(send)](#send)할 수 있습니다.

`%plugin_name%`을 [CallLogging](server-call-logging.md)과 함께 사용하면 호출 ID를 [MDC 컨텍스트에 넣고](#put-call-id-mdc), 각 요청마다 호출 ID를 표시하도록 로거를 구성하여 호출 관련 문제를 해결하는 데 도움이 됩니다.

> 클라이언트 측에서 Ktor는 클라이언트 요청 추적을 위한 [CallId](client-call-id.md) 플러그인을 제공합니다.

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
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면,
    지정된 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
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

## %plugin_name% 설정 {id="configure"}

### 호출 ID 가져오기 {id="retrieve"}

`%plugin_name%`은 호출 ID를 가져오는 여러 가지 방법을 제공합니다:

* 지정된 헤더에서 호출 ID를 가져오려면 `retrieveFromHeader` 함수를 사용합니다. 예:
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   `header` 함수를 사용하여 동일한 헤더에서 호출 ID를 [가져오고 전송](#send)할 수도 있습니다.

* 필요한 경우 `ApplicationCall`에서 호출 ID를 가져올 수 있습니다:
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
가져온 모든 호출 ID는 기본 딕셔너리를 사용하여 [검증](#verify)된다는 점에 유의하세요.

### 호출 ID 생성 {id="generate"}

들어오는 요청에 호출 ID가 포함되어 있지 않은 경우, `generate` 함수를 사용하여 생성할 수 있습니다:
* 아래 예제는 사전 정의된 딕셔너리에서 특정 길이의 호출 ID를 생성하는 방법을 보여줍니다:
   ```kotlin
   install(CallId) {
       generate(10, "abcde12345")
   }
   ```
* 아래 예제에서 `generate` 함수는 호출 ID 생성을 위한 블록을 매개변수로 받습니다:
   ```kotlin
   install(CallId) {
       val counter = atomic(0)
       generate {
           "generated-call-id-${counter.getAndIncrement()}"
       }
   }
   ```

### 호출 ID 검증 {id="verify"}

[가져오거나](#retrieve) [생성된](#generate) 모든 호출 ID는 다음과 같은 기본 딕셔너리를 사용하여 검증됩니다:

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
즉, 대문자가 포함된 호출 ID는 검증을 통과하지 못합니다. 필요한 경우 `verify` 함수를 사용하여 덜 엄격한 규칙을 적용할 수 있습니다:

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id).

### 클라이언트에게 호출 ID 전송 {id="send"}

호출 ID를 [가져오거나](#retrieve) [생성한](#generate) 후, 클라이언트에게 전송할 수 있습니다:

* `header` 함수를 사용하여 호출 ID를 [가져오고](#retrieve) 동일한 헤더로 다시 보낼 수 있습니다:

   ```kotlin
   install(CallId) {
       header(HttpHeaders.XRequestId)
   }
   ```

  전체 예제는 여기에서 확인할 수 있습니다: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id).

* `replyToHeader` 함수는 지정된 헤더에 호출 ID를 담아 보냅니다:
   ```kotlin
   install(CallId) {
       replyToHeader(HttpHeaders.XRequestId)
   }
   ```

* 필요한 경우 `ApplicationCall`을 사용하여 [응답(response)](server-responses.md)에 호출 ID를 포함해 보낼 수 있습니다:
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## MDC에 호출 ID 넣기 {id="put-call-id-mdc"}

`%plugin_name%`을 [CallLogging](server-call-logging.md)과 함께 사용하면 호출 ID를 MDC 컨텍스트에 넣고 각 요청에 대해 호출 ID를 표시하도록 로거를 구성하여 호출 관련 문제를 해결하는 데 도움이 됩니다. 이를 위해 `CallLogging` 구성 블록 내부에서 `callIdMdc` 함수를 호출하고 MDC 컨텍스트에 저장할 원하는 키를 지정합니다:

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

이 키는 [로거 설정](server-logging.md#configure-logger)에 전달되어 로그에 호출 ID를 표시할 수 있습니다. 예를 들어, `logback.xml` 파일은 다음과 같을 수 있습니다:
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

전체 예제는 여기에서 확인할 수 있습니다: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id).