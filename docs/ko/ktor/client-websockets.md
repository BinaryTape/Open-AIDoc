<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-websockets" title="Ktor 클라이언트의 WebSockets">
    <show-structure for="chapter" depth="3"/>
    <primary-label ref="client-plugin"/>
    <var name="example_name" value="client-websockets"/>
    <var name="artifact_name" value="ktor-client-websockets"/>
    <tldr>
        <p>
            <b>필수 의존성</b>: <code>io.ktor:ktor-client-websockets</code>
        </p>
        <p>
            <b>코드 예제</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        Websockets 플러그인을 사용하면 서버와 클라이언트 간에 다중 통신 세션을 생성할 수 있습니다.
    </link-summary>
    WebSocket은 단일 TCP 연결을 통해 사용자의 브라우저와 서버 간에 전이중(full-duplex) 통신 세션을 제공하는 프로토콜입니다. 이는 서버와 실시간으로 데이터를 주고받아야 하는 애플리케이션을 제작할 때 특히 유용합니다.
    Ktor는 서버 측과 클라이언트 측 모두에서 WebSocket 프로토콜을 지원합니다.
    <p>클라이언트용 Websockets 플러그인을 사용하면 서버와 메시지를 교환하기 위한 WebSocket 세션을 처리할 수 있습니다.</p>
    <note>
        <p>모든 엔진이 WebSocket을 지원하는 것은 아닙니다. 지원되는 엔진에 대한 개요는 <a href="client-engines.md#limitations">제한 사항(Limitations)</a>을 참조하세요.</p>
    </note>
    <tip>
        <p>서버 측의 WebSocket 지원에 대해 알아보려면 <Links href="//server-websockets" summary="Websockets 플러그인을 사용하면 서버와 클라이언트 간에 다중 통신 세션을 생성할 수 있습니다.">Ktor 서버의 WebSockets</Links>를 참조하세요.</p>
    </tip>
    <chapter title="의존성 추가" id="add_dependencies">
        <p><code>WebSockets</code>를 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:</p>
        <Tabs group="languages">
            <TabItem title="Gradle (Kotlin)" group-key="kotlin">
                <code-block lang="Kotlin" code="                    implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
            </TabItem>
            <TabItem title="Gradle (Groovy)" group-key="groovy">
                <code-block lang="Groovy" code="                    implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
            </TabItem>
            <TabItem title="Maven" group-key="maven">
                <code-block lang="XML" code="                    &lt;dependency&gt;&#10;                        &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                        &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                        &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;                    &lt;/dependency&gt;"/>
            </TabItem>
        </Tabs>
        <tip>
            Ktor 클라이언트에 필요한 아티팩트에 대해 자세히 알아보려면 <Links href="//client-dependencies" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가하기</Links>를 참조하세요.
        </tip>
    </chapter>
    <chapter title="WebSockets 설치" id="install_plugin">
        <p><code>WebSockets</code> 플러그인을 설치하려면, <a href="#configure-client">클라이언트 설정 블록</a> 내의 <code>install</code> 함수에 전달하세요:</p>
        <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.websocket.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(WebSockets)&#10;            }"/>
    </chapter>
    <chapter title="설정" id="configure_plugin">
        <p>선택 사항으로, <code>install</code> 블록 내에서 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/-web-sockets/-config/index.html">WebSockets.Config</a>의 지원되는 속성들을 전달하여 플러그인을 설정할 수 있습니다.
        </p>
        <deflist>
            <def id="maxFrameSize">
                <title><code>maxFrameSize</code></title>
                수신 또는 전송할 수 있는 최대 <code>Frame</code> 크기를 설정합니다.
            </def>
            <def id="contentConverter">
                <title><code>contentConverter</code></title>
                직렬화/역직렬화를 위한 컨버터를 설정합니다.
            </def>
            <def id="pingIntervalMillis">
                <title><code>pingIntervalMillis</code></title>
                <code>Long</code> 형식으로 핑(ping) 사이의 간격을 지정합니다.
            </def>
            <def id="pingInterval">
                <title><code>pingInterval</code></title>
                <code>Duration</code> 형식으로 핑 사이의 간격을 지정합니다.
            </def>
        </deflist>
        <warning>
            <p><code>pingInterval</code> 및 <code>pingIntervalMillis</code> 속성은 OkHttp 엔진에는 적용되지 않습니다. OkHttp의 핑 간격을 설정하려면 <a href="#okhttp">엔진 설정</a>을 사용할 수 있습니다:
            </p>
            <code-block lang="kotlin" code="                import io.ktor.client.engine.okhttp.OkHttp&#10;&#10;                val client = HttpClient(OkHttp) {&#10;                    engine {&#10;                        preconfigured = OkHttpClient.Builder()&#10;                            .pingInterval(20, TimeUnit.SECONDS)&#10;                            .build()&#10;                    }&#10;                }"/>
        </warning>
        <p>
            다음 예제에서는 핑 프레임을 자동으로 전송하고 WebSocket 연결을 유지하기 위해 WebSockets 플러그인을 20초(<code>20_000</code> 밀리초)의 핑 간격으로 설정합니다:
        </p>
        <code-block lang="kotlin" code="    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }"/>
    </chapter>
    <chapter title="WebSocket 세션 작업" id="working-wtih-session">
        <p>클라이언트의 WebSocket 세션은 <a href="https://api.ktor.io/ktor-websockets/io.ktor.websocket/-default-web-socket-session/index.html">DefaultClientWebSocketSession</a> 인터페이스로 표현됩니다. 이 인터페이스는 WebSocket 프레임을 주고받고 세션을 닫을 수 있는 API를 제공합니다.
        </p>
        <chapter title="WebSocket 세션 액세스" id="access-session">
            <p>
                <code>HttpClient</code>는 WebSocket 세션에 액세스하는 두 가지 주요 방법을 제공합니다:
            </p>
            <list>
                <li>
                    <p><a
                            href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/web-socket.html">webSocket()</a>
                        함수는 <code>DefaultClientWebSocketSession</code>을 블록 인자로 받습니다.</p>
                    <code-block lang="kotlin" code="                        runBlocking {&#10;                            client.webSocket(&#10;                                method = HttpMethod.Get,&#10;                                host = &quot;127.0.0.1&quot;,&#10;                                port = 8080,&#10;                                path = &quot;/echo&quot;&#10;                            ) {&#10;                                // this: DefaultClientWebSocketSession&#10;                            }&#10;                        }"/>
                </li>
                <li>
                    <a
                        href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.websocket/web-socket-session.html">webSocketSession()</a>
                    함수는 <code>DefaultClientWebSocketSession</code> 인스턴스를 반환하며, <code>runBlocking</code> 또는 <code>launch</code> 스코프 외부에서 세션에 액세스할 수 있게 해줍니다.
                </li>
            </list>
        </chapter>
        <chapter title="WebSocket 세션 처리" id="handle-session">
            <p>함수 블록 내에서 지정된 경로에 대한 핸들러를 정의합니다. 블록 내에서는 다음과 같은 함수와 속성을 사용할 수 있습니다:</p>
            <deflist>
                <def id="send">
                    <title><code>send()</code></title>
                    <code>send()</code> 함수를 사용하여 서버에 텍스트 콘텐츠를 보냅니다.
                </def>
                <def id="outgoing">
                    <title><code>outgoing</code></title>
                    <code>outgoing</code> 속성을 사용하여 WebSocket 프레임을 보내기 위한 채널에 액세스합니다. 프레임은 <code>Frame</code> 클래스로 표현됩니다.
                </def>
                <def id="incoming">
                    <title><code>incoming</code></title>
                    <code>incoming</code> 속성을 사용하여 WebSocket 프레임을 받기 위한 채널에 액세스합니다. 프레임은 <code>Frame</code> 클래스로 표현됩니다.
                </def>
                <def id="close">
                    <title><code>close()</code></title>
                    <code>close()</code> 함수를 사용하여 지정된 사유와 함께 종료(close) 프레임을 보냅니다.
                </def>
            </deflist>
        </chapter>
        <chapter title="프레임 유형" id="frame-types">
            <p>
                WebSocket 프레임의 유형을 검사하고 그에 따라 처리할 수 있습니다. 주요 프레임 유형은 다음과 같습니다:
            </p>
            <list>
                <li><code>Frame.Text</code>는 텍스트 프레임을 나타냅니다. 콘텐츠를 읽으려면
                    <code>Frame.Text.readText()</code>를 사용하세요.
                </li>
                <li><code>Frame.Binary</code>는 바이너리 프레임을 나타냅니다. 콘텐츠를 읽으려면 <code>Frame.Binary.readBytes()</code>를 사용하세요.
                </li>
                <li><code>Frame.Close</code>는 종료 프레임을 나타냅니다. 세션 종료 사유를 가져오려면 <code>Frame.Close.readReason()</code>을 사용하세요.
                </li>
            </list>
        </chapter>
        <chapter title="예제" id="example">
            <p>아래 예제는 <code>echo</code> WebSocket 엔드포인트를 생성하고 서버와 메시지를 주고받는 방법을 보여줍니다.</p>
            <code-block lang="kotlin"
                        include-symbol="main" code="package com.example&#10;&#10;import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.http.*&#10;import io.ktor.websocket.*&#10;import kotlinx.coroutines.*&#10;import java.util.*&#10;&#10;fun main() {&#10;    val client = HttpClient(CIO) {&#10;        install(WebSockets) {&#10;            pingIntervalMillis = 20_000&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.webSocket(method = HttpMethod.Get, host = &quot;127.0.0.1&quot;, port = 8080, path = &quot;/echo&quot;) {&#10;            while(true) {&#10;                val othersMessage = incoming.receive() as? Frame.Text&#10;                println(othersMessage?.readText())&#10;                val myMessage = Scanner(System.`in`).next()&#10;                if(myMessage != null) {&#10;                    send(myMessage)&#10;                }&#10;            }&#10;        }&#10;    }&#10;    client.close()&#10;}"/>
            <p>전체 예제는
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-websockets">client-websockets</a>를 참조하세요.
            </p>
        </chapter>
    </chapter>
</topic>