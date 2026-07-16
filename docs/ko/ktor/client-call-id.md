[//]: # (title: Ktor 클라이언트에서 요청 추적하기)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-call-id"/>
<var name="package_name" value="io.ktor.client.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-call-id"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
%plugin_name% 클라이언트 플러그인을 사용하면 고유한 호출 ID를 사용하여 클라이언트 요청을 추적할 수 있습니다.
</link-summary>

%plugin_name% 플러그인을 사용하면 고유한 호출 ID를 통해 클라이언트 요청을 엔드투엔드(end-to-end)로 추적할 수 있습니다. 이는 마이크로서비스 아키텍처에서 요청이 얼마나 많은 서비스를 거치는지에 관계없이 호출을 추적하는 데 특히 유용합니다.

호출 범위(calling scope)의 코루틴 컨텍스트(coroutine context)에 이미 호출 ID가 포함되어 있을 수 있습니다. 기본적으로 플러그인은 현재 컨텍스트를 사용하여 호출 ID를 검색하고, `HttpHeaders.XRequestId` 헤더를 사용하여 이를 특정 호출의 컨텍스트에 추가합니다.

또한, 범위에 호출 ID가 없는 경우 플러그인을 [설정](#configure)하여 새 호출 ID를 생성하고 적용하도록 할 수 있습니다.

> 서버 측에서 Ktor는 클라이언트 요청을 추적하기 위해 [CallId](server-call-id.md) 플러그인을 제공합니다.

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
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션 구조를 구성할 수 있습니다.">모듈(module)</Links>의 <code>install</code> 함수에 해당 플러그인을 전달하세요.
    아래의 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
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

[CallIdConfig](https://api.ktor.io/ktor-client-call-id/io.ktor.client.plugins.callid/-call-id-config/index.html) 클래스에서 제공하는 %plugin_name% 플러그인 설정을 사용하면 호출 ID를 생성하고 호출 컨텍스트에 추가할 수 있습니다.

### 호출 ID 생성

다음 중 한 가지 방법을 사용하여 특정 요청에 대한 호출 ID를 생성합니다:

* 기본적으로 활성화되어 있는 `useCoroutineContext` 프로퍼티는 현재 `CoroutineContext`를 사용하여 호출 ID를 검색하는 생성기(generator)를 추가합니다. 이 기능을 비활성화하려면 `useCoroutineContext`를 `false`로 설정하세요.

 ```kotlin
 install(CallId) {
     useCoroutineContext = false
 }
 ```

> Ktor 서버에서는 [CallId 플러그인](server-call-id.md)을 사용하여 `CoroutineContext`에 호출 ID를 추가합니다.

* `generate()` 함수를 사용하면 외부로 나가는 요청에 대한 호출 ID를 생성할 수 있습니다. 호출 ID 생성에 실패하면 `null`을 반환합니다.

 ```kotlin
 install(CallId) {
     generate { "call-id-client-2" }
 }
 ```

여러 가지 방법을 사용하여 호출 ID를 생성할 수 있습니다. 이 경우, `null`이 아닌 첫 번째 값이 적용됩니다.

### 호출 ID 추가

호출 ID를 가져온 후, 이를 요청에 추가하기 위해 다음과 같은 옵션을 사용할 수 있습니다.

* `intercept()` 함수를 사용하면 `CallIdInterceptor`를 사용하여 요청에 호출 ID를 추가할 수 있습니다.

 ```kotlin
 install(ClientCallId) {
     intercept { request, callId ->
         request.header(HttpHeaders.XRequestId, callId)
     }
 }
 ```

* `addToHeader()` 함수는 지정된 헤더에 호출 ID를 추가합니다. 헤더를 매개변수로 받으며, 기본값은 `HttpHeaders.XRequestId`입니다.

 ```kotlin
 install(CallId) {
     addToHeader(HttpHeaders.XRequestId)
 }
 ```

## 예제

다음 예제에서 Ktor 클라이언트용 `%plugin_name%` 플러그인은 새 호출 ID를 생성하고 이를 헤더에 추가하도록 설정되었습니다.

 ```kotlin
 val client = HttpClient(CIO) {
     install(CallId) {
         generate { "call-id-client" }
         addToHeader(HttpHeaders.XRequestId)
     }
 }
 ```

플러그인은 코루틴 컨텍스트를 사용하여 호출 ID를 가져오고, `generate()` 함수를 활용하여 새 호출 ID를 생성합니다. 그런 다음 `null`이 아닌 첫 번째 호출 ID가 `addToHeader()` 함수를 통해 요청 헤더에 적용됩니다.

Ktor 서버에서는 [서버용 CallId 플러그인](server-call-id.md)의 [retrieve](server-call-id.md#retrieve) 함수를 사용하여 헤더에서 호출 ID를 검색할 수 있습니다.

 ```kotlin
 install(CallId) {
     retrieveFromHeader(HttpHeaders.XRequestId)
 }
 ```

이러한 방식으로 Ktor 서버는 요청의 지정된 헤더에서 ID를 검색하고 이를 호출의 `callId` 프로퍼티에 적용합니다.

전체 예제는 [client-call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-call-id)를 참조하세요.