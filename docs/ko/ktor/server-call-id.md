[//]: # (title: Ktor Server에서 요청 추적하기)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.callId"/>
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
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하므로 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 서버 플러그인을 사용하면 고유한 call ID를 사용하여 클라이언트 요청을 추적할 수 있습니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) 플러그인을 사용하면 고유한 요청 ID 또는 call ID를 통해 클라이언트 요청을 엔드투엔드로 추적할 수 있습니다. 일반적으로 Ktor에서 call ID를 사용하는 작업 흐름은 다음과 같습니다.
1. 먼저, 다음 방법 중 하나로 특정 요청에 대한 call ID를 가져와야 합니다.
   * 리버스 프록시(예: Nginx)나 클라우드 제공업체(예: [Heroku](heroku.md))가 `X-Request-Id`와 같은 특정 헤더에 call ID를 추가할 수 있습니다. 이 경우 Ktor에서 해당 call ID를 [조회(retrieve)](#retrieve)할 수 있습니다.
   * 그렇지 않고 요청에 call ID가 포함되어 있지 않은 경우, Ktor 서버에서 직접 [생성(generate)](#generate)할 수 있습니다.
2. 그런 다음 Ktor는 미리 정의된 딕셔너리(dictionary)를 사용하여 조회되거나 생성된 call ID를 [검증(verify)](#verify)합니다. 원하는 조건을 직접 지정하여 call ID를 검증할 수도 있습니다.
3. 마지막으로, `X-Request-Id`와 같은 특정 헤더에 담아 클라이언트로 call ID를 [전송(send)](#send)할 수 있습니다.

`%plugin_name%`를 [CallLogging](server-call-logging.md)과 함께 사용하면 call ID를 [MDC 컨텍스트에 넣고](#put-call-id-mdc) 각 요청마다 call ID가 표시되도록 로거를 구성하여 호출 문제를 손쉽게 디버깅할 수 있습니다.

> 클라이언트 측의 경우, Ktor는 클라이언트 요청 추적을 위한 [CallId](client-call-id.md) 플러그인을 제공합니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>를 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요.
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
    지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 플러그인을 전달합니다.
    다음 예제는 <code>%plugin_name%</code>를 설치하는 방법을 보여줍니다.
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내부에서 설치
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내부에서 설치
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

## %plugin_name% 구성 {id="configure"}

### call ID 조회 {id="retrieve"}

`%plugin_name%`는 call ID를 가져오는 여러 가지 방법을 제공합니다.

* 지정된 헤더에서 call ID를 조회하려면 `retrieveFromHeader` 함수를 사용합니다. 예를 들면 다음과 같습니다.
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   `header` 함수를 사용하여 동일한 헤더에서 [call ID를 조회하고 클라이언트로 전송](#send)할 수도 있습니다.

* 필요한 경우 `ApplicationCall`에서 직접 call ID를 가져올 수 있습니다.
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
조회된 모든 call ID는 기본 딕셔너리를 사용하여 [검증](#verify)됩니다.

### call ID 생성 {id="generate"}

들어오는 요청에 call ID가 포함되어 있지 않은 경우 `generate` 함수를 사용하여 생성할 수 있습니다.
* 아래 예제는 미리 정의된 딕셔너리에서 특정 길이의 call ID를 생성하는 방법을 보여줍니다.
   ```kotlin
   install(CallId) {
       generate(10, "abcde12345")
   }
   ```
* 아래 예제에서는 `generate` 함수에 블록을 전달하여 call ID를 생성합니다.
   ```kotlin
   install(CallId) {
       val counter = atomic(0)
       generate {
           "generated-call-id-${counter.getAndIncrement()}"
       }
   }
   ```

### call ID 검증 {id="verify"}

[조회되거나](#retrieve) [생성된](#generate) 모든 call ID는 다음과 같은 기본 딕셔너리를 사용하여 검증됩니다.

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
즉, 대문자가 포함된 call ID는 검증을 통과하지 못합니다. 필요한 경우 `verify` 함수를 사용하여 덜 엄격한 규칙을 적용할 수 있습니다.

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

전체 예제는 [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)에서 확인할 수 있습니다.

### 클라이언트로 call ID 전송 {id="send"}

call ID를 [조회](#retrieve)하거나 [생성](#generate)한 후에는 클라이언트로 전송할 수 있습니다.

* `header` 함수를 사용하면 [call ID를 조회](#retrieve)하고 동일한 헤더에 담아 전송할 수 있습니다.

   ```kotlin
   install(CallId) {
       header(HttpHeaders.XRequestId)
   }
   ```

  전체 예제는 [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)에서 확인할 수 있습니다.

* `replyToHeader` 함수는 지정된 헤더에 call ID를 담아 전송합니다.
   ```kotlin
   install(CallId) {
       replyToHeader(HttpHeaders.XRequestId)
   }
   ```

* 필요한 경우 `ApplicationCall`을 사용하여 [응답(response)](server-responses.md)에 call ID를 보낼 수 있습니다.
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## MDC에 call ID 넣기 {id="put-call-id-mdc"}

`%plugin_name%`를 [CallLogging](server-call-logging.md)과 함께 사용하면 MDC 컨텍스트에 call ID를 넣고 각 요청에 대해 call ID를 표시하도록 로거를 구성하여 호출 문제를 해결하는 데 도움이 됩니다. 이렇게 하려면 `CallLogging` 구성 블록 내에서 `callIdMdc` 함수를 호출하고 MDC 컨텍스트에 넣을 원하는 키를 지정합니다.

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

이 키를 [로거 구성](server-logging.md#configure-logger)에 전달하여 로그에 call ID가 나타나도록 할 수 있습니다. 예를 들어, `logback.xml` 파일은 다음과 같이 작성할 수 있습니다.
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

전체 예제는 [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)에서 확인할 수 있습니다.