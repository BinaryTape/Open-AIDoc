[//]: # (title: Ktor Server의 WebSockets)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="WebSockets"/>
<var name="package_name" value="io.ktor.server.websocket"/>
<var name="artifact_name" value="ktor-server-websockets"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.websockets"/>

<tldr>
<p>
<b>필요한 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="server-websockets"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하여 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버(Native server)</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
WebSockets 플러그인을 사용하면 서버와 클라이언트 간의 양방향 통신 세션을 생성할 수 있습니다.
</link-summary>

<snippet id="websockets-description">

WebSocket은 단일 TCP 연결을 통해 사용자의 브라우저와 서버 간에 전이중(full-duplex) 통신 세션을 제공하는 프로토콜입니다. 서버와의 실시간 데이터 송수신이 필요한 애플리케이션을 구축할 때 특히 유용합니다.

Ktor는 서버 측과 클라이언트 측 모두에서 WebSocket 프로토콜을 지원합니다.

</snippet>

Ktor를 사용하면 다음 작업을 수행할 수 있습니다:

* 프레임 크기, ping 주기 등 기본적인 WebSocket 설정을 구성합니다.
* 서버와 클라이언트 간의 메시지 교환을 위한 WebSocket 세션을 처리합니다.
* WebSocket 확장을 추가합니다. 예를 들어 [Deflate](server-websocket-deflate.md) 확장을 사용하거나 [커스텀 확장](server-websocket-extensions.md)을 구현할 수 있습니다.

> 클라이언트 측 WebSocket 지원에 대해 알아보려면 [WebSockets 클라이언트 플러그인](client-websockets.topic)을 참고하세요.

> 단방향 통신 세션의 경우 [Server-Sent Events (SSE)](server-server-sent-events.topic) 사용을 고려해 보세요. SSE는 서버에서 클라이언트로 이벤트 기반 업데이트를 전송해야 하는 경우에 특히 유용합니다.
>
{style="note"}

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
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

## WebSockets 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="server-plugins.md#install">설치</a>하려면 지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 플러그인을 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내에서 설치
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내에서 설치
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

## WebSockets 구성 {id="configure"}

선택 사항으로, [WebSocketOptions](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-web-sockets/-web-socket-options/index.html)를 전달하여 `install` 블록 내에서 플러그인을 구성할 수 있습니다:

* ping 간의 간격을 지정하려면 `pingPeriod` 프로퍼티를 사용합니다.
* 연결이 닫히는 제한 시간을 설정하려면 `timeout` 프로퍼티를 사용합니다.
* 수신 또는 전송할 수 있는 최대 프레임 크기를 설정하려면 `maxFrameSize` 프로퍼티를 사용합니다.
* 마스킹 활성화 여부를 지정하려면 `masking` 프로퍼티를 사용합니다.
* 직렬화/역직렬화를 위한 변환기를 설정하려면 `contentConverter` 프로퍼티를 사용합니다.

```kotlin
install(WebSockets) {
    pingPeriod = 15.seconds
    timeout = 15.seconds
    maxFrameSize = Long.MAX_VALUE
    masking = false
}
```

## WebSocket 세션 처리 {id="handle-sessions"}

### API 개요 {id="api-overview"}

`WebSockets` 플러그인을 설치하고 구성한 후에는 WebSocket 세션을 처리할 엔드포인트를 정의할 수 있습니다. 서버에서 WebSocket 엔드포인트를 정의하려면 [routing](server-routing.md#define_route) 블록 내에서 `webSocket` 함수를 호출합니다:

```kotlin
routing { 
    webSocket("/echo") {
       // Handle a WebSocket session
    }
}
```

이 예제에서는 [기본 구성](server-configuration-file.topic)을 사용할 때 서버가 `ws://localhost:8080/echo`로 들어오는 WebSocket 요청을 수락합니다.

`webSocket` 블록 내에서 [DefaultWebSocketServerSession](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/-default-web-socket-server-session/index.html) 클래스로 표현되는 WebSocket 세션 핸들러를 정의합니다.
블록 내에서는 다음 함수와 프로퍼티를 사용할 수 있습니다:

* 클라이언트에 텍스트 콘텐츠를 전송하려면 `send` 함수를 사용합니다.
* WebSocket 프레임을 수신하고 전송하기 위한 채널에 접근하려면 `incoming` 및 `outgoing` 프로퍼티를 사용합니다. 프레임은 `Frame` 클래스로 표현됩니다.
* 지정된 이유와 함께 close 프레임을 보내려면 `close` 함수를 사용합니다.

세션을 처리할 때 다음과 같이 프레임 유형을 확인할 수 있습니다:

* `Frame.Text`는 텍스트 프레임입니다. 이 프레임 유형의 경우 `Frame.Text.readText()`를 사용하여 콘텐츠를 읽을 수 있습니다.
* `Frame.Binary`는 바이너리 프레임입니다. 이 유형의 경우 `Frame.Binary.readBytes()`를 사용하여 콘텐츠를 읽을 수 있습니다.

> `incoming` 채널에는 ping/pong 또는 close 프레임과 같은 제어 프레임(control frame)이 포함되지 않습니다.
> 제어 프레임을 처리하고 조각난 프레임을 재조립하려면 [webSocketRaw](https://api.ktor.io/ktor-server-websockets/io.ktor.server.websocket/web-socket-raw.html) 함수를 사용하여 WebSocket 세션을 처리하세요.
>
{style="note"}

> 클라이언트에 대한 정보(예: 클라이언트의 IP 주소)를 가져오려면 `call` 프로퍼티를 사용하세요. [일반 요청 정보](server-requests.md#request_information)에 대해 자세히 알아보세요.

아래에서는 이 API를 사용하는 예제를 살펴보겠습니다.

### 예제: 단일 세션 처리 {id="handle-single-session"}

아래 예제는 한 클라이언트와의 세션을 처리하기 위해 `echo` WebSocket 엔드포인트를 생성하는 방법을 보여줍니다:

```kotlin
routing {
    webSocket("/echo") {
        send("Please enter your name")
        for (frame in incoming) {
            frame as? Frame.Text ?: continue
            val receivedText = frame.readText()
            if (receivedText.equals("bye", ignoreCase = true)) {
                close(CloseReason(CloseReason.Codes.NORMAL, "Client said BYE"))
            } else {
                send(Frame.Text("Hi, $receivedText!"))
            }
        }
    }
}
```

전체 예제는 [server-websockets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets)를 참고하세요.

### 예제: 다중 세션 처리 {id="handle-multiple-session"}

여러 WebSocket 세션을 효율적으로 관리하고 브로드캐스팅을 처리하기 위해 Kotlin의 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)를 활용할 수 있습니다.
이 접근 방식은 WebSocket 통신을 관리하기 위한 확장 가능하고 동시성 친화적인 방법을 제공합니다. 이 패턴을 구현하는 방법은 다음과 같습니다:

1. 메시지 브로드캐스팅을 위한 `SharedFlow` 정의:

```kotlin
val messageResponseFlow = MutableSharedFlow<MessageResponse>()
val sharedFlow = messageResponseFlow.asSharedFlow()
```

2. WebSocket 라우트에서 브로드캐스팅 및 메시지 처리 로직 구현:

```kotlin

        webSocket("/ws") {
            send("You are connected to WebSocket!")

            val job = launch {
                sharedFlow.collect { message ->
                    send(message.message)
                }
            }

            runCatching {
                incoming.consumeEach { frame ->
                    if (frame is Frame.Text) {
                        val receivedText = frame.readText()
                        val messageResponse = MessageResponse(receivedText)
                        messageResponseFlow.emit(messageResponse)
                    }
                }
            }.onFailure { exception ->
                println("WebSocket exception: ${exception.localizedMessage}")
            }.also {
                job.cancel()
            }
        }
```

`runCatching` 블록은 수신된 메시지를 처리하여 `SharedFlow`로 방출(emit)하며, `SharedFlow`는 이를 모든 수집기(collector)에게 브로드캐스팅합니다.

이 패턴을 사용하면 개별 연결을 수동으로 추적하지 않고도 여러 WebSocket 세션을 효율적으로 관리할 수 있습니다. 이 방식은 동시 WebSocket 연결이 많은 애플리케이션에 적합하게 확장되며, 메시지 브로드캐스팅을 처리하는 깔끔하고 리액티브(reactive)한 방법을 제공합니다.

전체 예제는 [server-websockets-sharedflow](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets-sharedflow)를 참고하세요.

## WebSocket API와 Ktor {id="websocket-api"}

[WebSocket API의 표준 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)는 Ktor에서 다음과 같이 매핑됩니다:

* `onConnect`는 블록 시작 시 발생합니다.
* `onMessage`는 메시지를 성공적으로 읽은 후(예: `incoming.receive()` 사용) 또는 `for(frame in incoming)`을 통한 중단 반복(suspended iteration)을 사용할 때 발생합니다.
* `onClose`는 `incoming` 채널이 닫힐 때 발생합니다. 이 경우 중단 반복이 완료되거나, 메시지를 수신하려고 할 때 `ClosedReceiveChannelException`이 발생합니다.
* `onError`는 기타 예외에 해당합니다.

`onClose`와 `onError` 모두에서 `closeReason` 프로퍼티가 설정됩니다.

다음 예제에서 무한 루프는 예외(`ClosedReceiveChannelException` 또는 기타 예외)가 발생했을 때만 종료됩니다:

```kotlin
webSocket("/echo") {
    println("onConnect")
    try {
        for (frame in incoming){
            val text = (frame as Frame.Text).readText()
            println("onMessage")
            received += text
            outgoing.send(Frame.Text(text))
        }
    } catch (e: ClosedReceiveChannelException) {
        println("onClose ${closeReason.await()}")
    } catch (e: Throwable) {
        println("onError ${closeReason.await()}")
        e.printStackTrace()
    }
}
```