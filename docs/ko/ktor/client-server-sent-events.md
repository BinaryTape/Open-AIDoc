<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="client-server-sent-events" title="Ktor Client의 Server-Sent Events" help-id="sse_client">
<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<tldr>
    <var name="example_name" value="client-sse"/>
    <p>
        <b>코드 예제</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    SSE 플러그인을 사용하면 클라이언트가 HTTP 연결을 통해 서버로부터 이벤트 기반 업데이트를 수신할 수 있습니다.
</link-summary>
<p>
    Server-Sent Events(SSE)는 서버가 HTTP 연결을 통해 클라이언트에 지속적으로 이벤트를 푸시할 수 있도록 하는 기술입니다.
    클라이언트가 서버에 반복적으로 폴링할 필요 없이 서버가 이벤트 기반 업데이트를 전송해야 하는 경우에 특히 유용합니다.
</p>
<p>
    Ktor에서 지원하는 SSE 플러그인은 서버와 클라이언트 간에 단방향 연결을 생성하는 직관적인 방법을 제공합니다.
</p>
<tip>
    <p>서버 측 지원을 위한 SSE 플러그인에 대해 자세히 알아보려면
        <Links href="server-server-sent-events.topic" summary="SSE 플러그인을 사용하면 서버가 HTTP 연결을 통해 클라이언트에 이벤트 기반 업데이트를 보낼 수 있습니다.">SSE 서버 플러그인</Links>을
        참조하세요.
    </p>
</tip>
<chapter title="의존성 추가" id="add_dependencies">
    <p>
        <code>SSE</code>는 <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">ktor-client-core</Links> 아티팩트만 필요로 하며
        별도의 특정 의존성이 필요하지 않습니다.
    </p>
</chapter>
<chapter title="SSE 설치" id="install_plugin">
    <p>
        <code>SSE</code> 플러그인을 설치하려면 <a href="client-create-and-configure.md#configure-client">클라이언트 구성 블록</a> 내의 <code>install</code> 함수에 전달합니다:
    </p>
    <code-block lang="kotlin" code="            import io.ktor.client.*&#10;            import io.ktor.client.engine.cio.*&#10;            import io.ktor.client.plugins.sse.*&#10;&#10;            //...&#10;            val client = HttpClient(CIO) {&#10;                install(SSE)&#10;            }"/>
</chapter>
<chapter title="SSE 플러그인 구성" id="configure">
    <p>
        <code>install</code> 블록 내에서
        <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-s-s-e-config/index.html">SSEConfig</a>
        클래스에서 지원하는 프로퍼티를 설정하여 SSE 플러그인을 선택적으로 구성할 수 있습니다.
    </p>
    <chapter title="SSE 재연결" id="sse-reconnect">
        <p>
            자동 재연결을 활성화하려면 <code>maxReconnectionAttempts</code>를 <code>0</code>보다 큰 값으로 설정하세요.
            또한 <code>reconnectionTime</code>을 사용하여 시도 간의 지연 시간을 구성할 수 있습니다:
        </p>
        <code-block lang="kotlin" code="                install(SSE) {&#10;                    maxReconnectionAttempts = 4&#10;                    reconnectionTime = 2.seconds&#10;                }"/>
        <p>
            서버와의 연결이 끊어지면 클라이언트는 재연결을 시도하기 전에 지정된 <code>reconnectionTime</code> 동안 대기합니다.
            그리고 연결을 재설정하기 위해 지정된 <code>maxReconnectionAttempts</code> 횟수까지 시도합니다.
        </p>
    </chapter>
    <chapter title="이벤트 필터링" id="filter-events">
        <p>
            다음 예제에서는 SSE 플러그인이 HTTP 클라이언트에 설치되어 주석만 포함된 이벤트와 <code>retry</code> 필드만 포함된 이벤트를 수신 flow에 포함하도록 구성됩니다:
        </p>
        <code-block lang="kotlin" code="        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }"/>
    </chapter>
    <chapter title="응답 버퍼링" id="response-buffering">
        <p>
            SSE 응답은 본질적으로 스트리밍 방식이므로 전체 본문을 캡처하기 어렵습니다. 진단 버퍼를 활성화하면 SSE 스트림에 오류가 발생했을 때 응답 본문을 안전하게 검색할 수 있습니다. 버퍼에는 이미 처리된 데이터만 포함되며(네트워크에서 다시 읽지 않음), 오류 발생 시 로깅 및 오류 분석을 목적으로 사용됩니다.
        </p>
        <code-block lang="kotlin" code="                install(SSE) {&#10;                    bufferPolicy = SSEBufferPolicy.LastEvents(10)&#10;                }"/>
        <p>
            호출별로 버퍼를 구성할 수도 있습니다:
        </p>
        <code-block lang="kotlin" code="                client.sse(url, {&#10;                    bufferPolicy(SSEBufferPolicy.All)&#10;                }) {&#10;                    // ...&#10;                }"/>
        <chapter title="버퍼 정책" id="buffer-policies">
            <p>
                <code>SSEBufferPolicy</code> 타입은 처리된 SSE 데이터를 저장하기 위한 여러 전략을 제공합니다.
                이러한 정책은 스트림의 얼마만큼을 메모리에 유지하고 오류 발생 시 사용할 수 있게 할지 제어합니다.
            </p>
            <deflist>
                <def id="buffer-off">
                    <title><code>Off</code> (기본값)</title>
                    버퍼링을 하지 않습니다.
                </def>
                <def id="buffer-lastlines">
                    <title><code>LastLines(n)</code></title>
                    마지막 n개의 라인을 유지합니다.
                </def>
                <def id="buffer-lastevent">
                    <title><code>LastEvent</code></title>
                    마지막으로 완료된 SSE 이벤트를 유지합니다.
                </def>
                <def id="buffer-lastevents">
                    <title><code>LastEvents(n)</code></title>
                    마지막으로 완료된 n개의 SSE 이벤트를 유지합니다.
                </def>
                <def id="buffer-all">
                    <title><code>All</code></title>
                    지금까지 처리된 모든 이벤트를 유지합니다.
                    <note>수명이 긴 스트림의 경우 주의해서 사용하세요.</note>
                </def>
            </deflist>
            <p>
                실패 시 네트워크에서 다시 읽지 않고 <code>response?.bodyAsText()</code>를 사용하여 버퍼에 접근할 수 있습니다.
            </p>
        </chapter>
    </chapter>
</chapter>
<chapter title="SSE 세션 처리" id="handle-sse-sessions">
    <p>
        클라이언트의 SSE 세션은
        <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html">
            <code>ClientSSESession</code>
        </a>
        인터페이스로 표현됩니다. 이 인터페이스는 서버로부터 server-sent events를 수신할 수 있는 API를 노출합니다.
    </p>
    <chapter title="SSE 세션 접근" id="access-sse-session">
        <p><code>HttpClient</code>를 사용하면 다음 방법 중 하나로 SSE 세션에 접근할 수 있습니다:</p>
        <list>
            <li>
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse.html">
                    <code>sse()</code>
                </a>
                함수는 SSE 세션을 생성하고 이를 기반으로 동작을 수행할 수 있게 합니다.
            </li>
            <li>
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/sse-session.html">
                    <code>sseSession()</code>
                </a>
                함수는 SSE 세션을 열 수 있게 합니다.
            </li>
        </list>
        <p>URL 엔드포인트를 지정하려면 두 가지 옵션 중 선택할 수 있습니다:</p>
        <list>
            <li><code>urlString</code> 매개변수를 사용하여 전체 URL을 문자열로 지정합니다.</li>
            <li><code>schema</code>, <code>host</code>, <code>port</code>, <code>path</code> 매개변수를 사용하여
                프로토콜 스키마, 도메인 이름, 포트 번호,
                경로 이름을
                각각 지정합니다.
            </li>
        </list>
        <code-block lang="kotlin" code="                runBlocking {&#10;                    client.sse(host = &amp;quot;127.0.0.1&amp;quot;, port = 8080, path = &amp;quot;/events&amp;quot;) {&#10;                        // this: ClientSSESession&#10;                    }&#10;                }"/>
        <note>
            <code>ClientSSESession</code> 및 <code>ClientSSESessionWithDeserialization</code> 인스턴스는 세션이 유지되는 동안에만 유효합니다.
            이들의 스코프는 <code>serverSentEvents { ... }</code> 블록이 완료되거나 연결이 닫힐 때 자동으로 취소됩니다.
        </note>
        <p>선택적으로 연결을 구성하기 위해 다음 매개변수들을 사용할 수 있습니다:</p>
        <deflist>
            <def id="reconnectionTime-param">
                <title><code>reconnectionTime</code></title>
                재연결 지연 시간을 설정합니다.
            </def>
            <def id="showCommentEvents-param">
                <title><code>showCommentEvents</code></title>
                주석만 포함된 이벤트를 수신 flow에 표시할지 여부를 지정합니다.
            </def>
            <def id="showRetryEvents-param">
                <title><code>showRetryEvents</code></title>
                <code>retry</code> 필드만 포함된 이벤트를 수신 flow에 표시할지 여부를 지정합니다.
            </def>
            <def id="deserialize-param">
                <title><code>deserialize</code></title>
                <code>TypedServerSentEvent</code>의 <code>data</code> 필드를 객체로 변환하기 위한 역직렬화 함수입니다. 자세한 내용은
                <a href="#deserialization">역직렬화(Deserialization)</a>를 참조하세요.
            </def>
        </deflist>
    </chapter>
    <chapter title="SSE 세션 블록" id="sse-session-block">
        <p>
            람다 인자 내에서는
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session/index.html"><code>ClientSSESession</code></a>
            컨텍스트에 접근할 수 있습니다. 해당 블록 내에서 사용할 수 있는 프로퍼티는 다음과 같습니다:
        </p>
        <deflist>
            <def id="call">
                <title><code>call</code></title>
                세션을 시작한 관련 <code>HttpClientCall</code>입니다.
            </def>
            <def id="incoming">
                <title><code>incoming</code></title>
                수신되는 server-sent events flow입니다.
            </def>
        </deflist>
        <p>
            아래 예제는 <code>events</code> 엔드포인트로 새 SSE 세션을 생성하고,
            <code>incoming</code> 프로퍼티를 통해 이벤트를 읽은 다음 수신된
            <a href="https://api.ktor.io/ktor-sse/io.ktor.sse/-server-sent-event/index.html"><code>ServerSentEvent</code></a>를
            출력합니다.
        </p>
        <code-block lang="kotlin" code="fun main() {&#10;    val client = HttpClient {&#10;        install(SSE) {&#10;            showCommentEvents()&#10;            showRetryEvents()&#10;        }&#10;    }&#10;    runBlocking {&#10;        client.sse(host = &quot;0.0.0.0&quot;, port = 8080, path = &quot;/events&quot;) {&#10;            while (true) {&#10;                incoming.collect { event -&gt;&#10;                    println(&quot;Event from server:&quot;)&#10;                    println(event)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
        <p>전체 예제는
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>를 참조하세요.
        </p>
    </chapter>
    <chapter title="역직렬화" id="deserialization">
        <p>
            SSE 플러그인은 server-sent events를 타입 안전한 Kotlin 객체로 역직렬화하는 기능을 지원합니다. 이
            기능은 서버의 구조화된 데이터를 처리할 때 특히 유용합니다.
        </p>
        <p>
            역직렬화를 활성화하려면 SSE 접근 함수에서 <code>deserialize</code> 매개변수를 사용하여 커스텀 역직렬화 함수를 제공하고,
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.sse/-client-s-s-e-session-with-deserialization/index.html">
                <code>ClientSSESessionWithDeserialization</code>
            </a>
            클래스를 사용하여 역직렬화된 이벤트를 처리하세요.
        </p>
        <p>
            다음은 <code>kotlinx.serialization</code>을 사용하여 JSON 데이터를 역직렬화하는 예제입니다:
        </p>
        <code-block lang="Kotlin" code="        client.sse({&#10;            url(&quot;http://localhost:8080/serverSentEvents&quot;)&#10;        }, deserialize = {&#10;                typeInfo, jsonString -&gt;&#10;            val serializer = Json.serializersModule.serializer(typeInfo.kotlinType!!)&#10;            Json.decodeFromString(serializer, jsonString)!!&#10;        }) { // `this` is `ClientSSESessionWithDeserialization`&#10;            incoming.collect { event: TypedServerSentEvent&lt;String&gt; -&gt;&#10;                when (event.event) {&#10;                    &quot;customer&quot; -&gt; {&#10;                        val customer: Customer? = deserialize&lt;Customer&gt;(event.data)&#10;                    }&#10;                    &quot;product&quot; -&gt; {&#10;                        val product: Product? = deserialize&lt;Product&gt;(event.data)&#10;                    }&#10;                }&#10;            }&#10;        }"/>
        <p>전체 예제는
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-sse">client-sse</a>를 참조하세요.
        </p>
    </chapter>
</chapter>
</topic>