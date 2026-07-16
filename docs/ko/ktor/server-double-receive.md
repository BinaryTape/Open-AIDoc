[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="double-receive"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) 플러그인은 `RequestAlreadyConsumedException` 예외 없이 [요청 본문(request body)](server-requests.md#body_contents)을 여러 번 수신할 수 있는 기능을 제공합니다.
이는 특정 [플러그인](server-plugins.md)이 이미 요청 본문을 소비하여 라우트 핸들러 내부에서 본문을 수신할 수 없는 경우에 유용할 수 있습니다.
예를 들어, `%plugin_name%`을 사용하여 [CallLogging](server-call-logging.md) 플러그인으로 요청 본문을 로깅한 다음, `post` [라우트 핸들러](server-routing.md#define_route) 내부에서 본문을 한 번 더 수신할 수 있습니다.

> `%plugin_name%` 플러그인은 실험용(experimental) API를 사용하며, 향후 업데이트에서 파괴적 변경(breaking changes)이 발생할 수 있습니다.
>
{type="note"}

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
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션 구조를 잡을 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하십시오.
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
<p>
    <code>%plugin_name%</code> 플러그인은 <a href="#install-route">특정 라우트에 설치</a>할 수도 있습니다.
    이는 서로 다른 애플리케이션 리소스에 대해 서로 다른 <code>%plugin_name%</code> 구성이 필요한 경우 유용할 수 있습니다.
</p>

`%plugin_name%`을 설치한 후에는 [요청 본문을 수신](server-requests.md#body_contents)할 때 여러 번 호출하더라도 매번 동일한 인스턴스를 반환합니다.
예를 들어, [CallLogging](server-call-logging.md) 플러그인을 사용하여 요청 본문의 로깅을 활성화할 수 있습니다...

```kotlin
install(CallLogging) {
    level = Level.TRACE
    format { call ->
        runBlocking {
            "Body: ${call.receiveText()}"
        }
    }
}
```

... 그런 다음 라우트 핸들러 내부에서 요청 본문을 한 번 더 가져올 수 있습니다.

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

전체 예제는 여기에서 확인할 수 있습니다: [double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive).

## %plugin_name% 구성 {id="configure"}
기본 구성을 사용하면 `%plugin_name%`은 [요청 본문](server-requests.md#body_contents)을 다음과 같은 타입으로 수신할 수 있는 기능을 제공합니다:

- `ByteArray` 
- `String`
- `Parameters` 
- `ContentNegotiation` 플러그인에서 사용하는 [데이터 클래스(data classes)](server-serialization.md#create_data_class)

기본적으로 `%plugin_name%`은 다음을 지원하지 않습니다:

- 동일한 요청에서 서로 다른 타입을 수신하는 것
- [스트림 또는 채널(stream or channel)](server-requests.md#raw)을 수신하는 것

동일한 요청에서 서로 다른 타입을 수신하거나 스트림 또는 채널을 수신할 필요가 없는 경우 `cacheRawRequest` 속성을 `false`로 설정하십시오:

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}