[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.doubleReceive"/>

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
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하여 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) 플러그인은 `RequestAlreadyConsumedException` 예외 없이 [요청 본문(request body)을 여러 번 수신](server-requests.md#body_contents)할 수 있는 기능을 제공합니다.
이 기능은 다른 [플러그인](server-plugins.md)이 이미 요청 본문을 소비하여 라우트 핸들러 내에서 이를 수신할 수 없을 때 유용할 수 있습니다.
예를 들어, `%plugin_name%`을(를) 사용하면 [CallLogging](server-call-logging.md) 플러그인으로 요청 본문을 로깅한 다음, `post` [라우트 핸들러](server-routing.md#define_route) 내에서 본문을 한 번 더 수신할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요.
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
    지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내에서 설치.
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내에서 설치.
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
<p>
    <code>%plugin_name%</code> 플러그인은 <a href="server-plugins.md#install-route">특정 라우트에 설치</a>할 수도 있습니다.
    서로 다른 애플리케이션 리소스에 대해 서로 다른 <code>%plugin_name%</code> 설정이 필요한 경우 유용할 수 있습니다.
</p>

`%plugin_name%`을(를) 설치한 후에는 [요청 본문을 여러 번 수신](server-requests.md#body_contents)할 수 있으며, 호출할 때마다 동일한 인스턴스가 반환됩니다.
예를 들어, [CallLogging](server-call-logging.md) 플러그인을 사용하여 요청 본문 로깅을 활성화하고...

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

... 그런 다음 라우트 핸들러 내에서 요청 본문을 한 번 더 가져올 수 있습니다.

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

전체 예제는 여기에서 확인할 수 있습니다: [double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive).

## %plugin_name% 구성 {id="configure"}
기본 구성을 사용할 경우, `%plugin_name%`은(는) [요청 본문](server-requests.md#body_contents)을 다음과 같은 타입으로 수신할 수 있는 기능을 제공합니다:

- `ByteArray` 
- `String`
- `Parameters` 
- `ContentNegotiation` 플러그인에서 사용하는 [데이터 클래스](server-serialization.md#create_data_class)

기본적으로 `%plugin_name%`은(는) 다음 동작을 지원하지 않습니다:

- 동일한 요청에서 서로 다른 타입을 수신하는 것
- [스트림 또는 채널](server-requests.md#raw)을 수신하는 것

동일한 요청에서 서로 다른 타입을 수신하거나 스트림 또는 채널을 수신할 필요가 없다면 `cacheRawRequest` 속성을 `false`로 설정하세요:

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}
```