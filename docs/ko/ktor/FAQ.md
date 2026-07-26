<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="FAQ"
   id="FAQ">
<chapter title="Ktor는 어떻게 발음하는 것이 올바른가요?" id="pronounce">
    <p>
        <emphasis>/keɪ-tor/</emphasis>
    </p>
</chapter>
<chapter title='"Ktor"라는 이름은 무엇을 의미하나요?' id="name-meaning">
    <p>
        Ktor라는 이름은 <code>ctor</code>(생성자, constructor)라는 약어에서 유래되었으며, 첫 글자를 Kotlin의 'K'로 바꾼 것입니다.
    </p>
</chapter>
<chapter title="질문, 버그 보고, 연락, 기여, 피드백 제출 등은 어떻게 하나요?" id="feedback">
    <p>
        <a href="https://ktor.io/support/">Support</a> 페이지에서 이용 가능한 지원 채널에 대해 자세히 알아보세요.
        <a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">How to contribute</a> 가이드는 Ktor에 기여할 수 있는 다양한 방법을 설명합니다.
    </p>
</chapter>
<chapter title="CIO는 무엇을 의미하나요?" id="cio">
    <p>
        CIO는
        <emphasis>Coroutine-based I/O</emphasis>(코루틴 기반 I/O)
        의 약자입니다.
        보통 외부 JVM 기반 라이브러리에 의존하지 않고 Kotlin과 코루틴(Coroutines)을 사용하여 IETF RFC나 다른 프로토콜을 구현하는 로직을 가진 엔진을 의미합니다.
    </p>
</chapter>
<chapter title="해결되지 않은(빨간색) Ktor 임포트(import) 문제를 어떻게 해결하나요?" id="ktor-artifact">
    <p>
        해당하는 <Links href="//server-dependencies" summary="기존 Gradle/Maven 프로젝트에 Ktor 서버 의존성을 추가하는 방법을 알아봅니다.">Ktor 아티팩트(artifact)</Links>가 빌드 스크립트에 추가되었는지 확인하세요.
    </p>
</chapter>
<chapter
        title="Ktor는 서버가 안정적으로 종료(graceful shutdown)될 수 있도록 IPC 시그널(예: SIGTERM 또는 SIGINT)을 캐치하는 방법을 제공하나요?"
        id="sigterm">
    <p>
        <a href="#engine-main">EngineMain</a>을 실행 중이라면 자동으로 처리됩니다.
        그렇지 않으면 직접 처리해야 합니다.
        JVM의 <code>Runtime.getRuntime().addShutdownHook</code> 기능을 사용할 수 있습니다.
    </p>
</chapter>
<chapter title="프록시 뒤에 있는 클라이언트 IP를 어떻게 가져오나요?" id="proxy-ip">
    <p>
        프록시가 적절한 헤더를 제공하고 <Links href="//server-forward-headers" summary="필요한 의존성: io.ktor:%artifact_name%">ForwardedHeader</Links> 플러그인이 설치된 경우, <code>call.request.origin</code> 속성은 원래 호출자(프록시)에 대한 <a href="#request_information">연결 정보</a>를 제공합니다.
    </p>
</chapter>
<chapter title="main 브랜치의 최신 커밋을 어떻게 테스트할 수 있나요?" id="bleeding-edge">
    <p>
        <code>jetbrains.space</code>에서 Ktor 나이틀리 빌드(nightly build)를 받을 수 있습니다.
        <a href="https://ktor.io/eap/">Early Access Program</a>에서 더 자세한 내용을 확인하세요.
    </p>
</chapter>
<chapter title="사용 중인 Ktor 버전을 어떻게 확인할 수 있나요?" id="ktor-version-used">
    <p>
        Ktor 버전이 포함된 <code>Server</code> 응답 헤더를 보내는 <Links href="//server-default-headers" summary="필요한 의존성: io.ktor:%artifact_name%">DefaultHeaders</Links> 플러그인을 사용할 수 있습니다. 예시:
    </p>
    <code-block code="            Server: ktor-server-core/%ktor_version%"/>
</chapter>
<chapter title="라우트가 실행되지 않습니다. 어떻게 디버깅하나요?" id="route-not-executing">
    <p>
        Ktor는 라우팅 결정을 문제 해결하는 데 도움이 되는 추적(tracing) 메커니즘을 제공합니다.
        <a href="#trace_routes">Tracing routes</a> 섹션을 확인하세요.
    </p>
</chapter>
<chapter title="'Response has already been sent' 오류를 어떻게 해결하나요?" id="response-already-sent">
    <p>
        이 오류는 사용자 본인 또는 플러그인이나 인터셉터(interceptor)가 이미 <code>call.respond&#42; </code> 함수를 호출했으며, 이를 다시 호출하려고 함을 의미합니다.
    </p>
</chapter>
<chapter title="Ktor 이벤트를 어떻게 구독하나요?" id="ktor-events">
    <p>
        자세한 내용은 <Links href="//server-events" summary="">Application monitoring</Links> 페이지를 참조하세요.
    </p>
</chapter>
<chapter title="'No configuration setting found for key ktor' 오류를 어떻게 해결하나요?" id="cannot-find-application-conf">
    <p>
        이것은 Ktor가 <Links href="//server-configuration-file" summary="설정 파일에서 다양한 서버 파라미터를 설정하는 방법을 알아봅니다.">설정 파일</Links>을 찾을 수 없음을 의미합니다.
        <code>resources</code> 폴더에 설정 파일이 있는지, 그리고 <code>resources</code> 폴더가 제대로 지정되었는지 확인하세요.
        작동하는 프로젝트를 기반으로 시작하려면 <a href="https://start.ktor.io/">Ktor 프로젝트 생성기</a> 또는
        <a href="https://plugins.jetbrains.com/plugin/16008-ktor">IntelliJ IDEA Ultimate용 Ktor 플러그인</a>을 사용하여 프로젝트를 구성하는 것이 좋습니다. 자세한 내용은 <Links href="//server-create-a-new-project" summary="Ktor 서버 애플리케이션을 열고, 실행하고, 테스트하는 방법을 알아봅니다.">새 Ktor 프로젝트 생성, 열기 및 실행</Links>을 참조하세요.
    </p>
</chapter>
<chapter title="Android에서 Ktor를 사용할 수 있나요?" id="android-support">
    <p>
        네, Ktor 서버와 클라이언트는 적어도 Netty 엔진을 사용하면 Android 5 (API 21) 이상에서 작동하는 것으로 알려져 있습니다.
    </p>
</chapter>
<chapter title="왜 'CURL -I'가 '404 Not Found'를 반환하나요?" id="curl-head-not-found">
    <p>
        <code>CURL -I</code>는 <code>HEAD</code> 요청을 수행하는 <code>CURL --head</code>의 별칭입니다.
        기본적으로 Ktor는 <code>GET</code> 핸들러에 대해 <code>HEAD</code> 요청을 처리하지 않습니다.
        이 기능을 활성화하려면 <Links href="//server-autoheadresponse" summary="%plugin_name%은 GET이 정의된 모든 라우트에 대해 HEAD 요청에 자동으로 응답하는 기능을 제공합니다.">AutoHeadResponse</Links> 플러그인을 설치하세요.
    </p>
</chapter>
<chapter title="'HttpsRedirect' 플러그인을 사용할 때 발생하는 무한 리다이렉트(infinite redirect) 문제를 어떻게 해결하나요?" id="infinite-redirect">
    <p>
        가장 가능성 있는 원인은 백엔드가 리버스 프록시(reverse proxy) 또는 로드 밸런서(load balancer) 뒤에 있고, 이 중개 장치가 백엔드에 일반 HTTP 요청을 보내고 있기 때문입니다. 따라서 Ktor 백엔드 내부의 <code>HttpsRedirect</code> 플러그인은 이를 일반 HTTP 요청으로 간주하고 리다이렉트로 응답하게 됩니다.
    </p>
    <p>
        보통 리버스 프록시는 원래 요청에 대한 정보(예: HTTPS 여부 또는 원래 IP 주소)를 설명하는 헤더를 보내며, <Links href="//server-forward-headers" summary="필요한 의존성: io.ktor:%artifact_name%">ForwardedHeader</Links> 플러그인을 사용하여 해당 헤더를 파싱하면 <Links href="//server-https-redirect" summary="필요한 의존성: io.ktor:%artifact_name%">HttpsRedirect</Links> 플러그인이 원래 요청이 HTTPS였음을 알 수 있습니다.
    </p>
</chapter>
<chapter title="Kotlin/Native에서 해당 엔진을 사용하기 위해 Windows에 'curl'을 설치하는 방법은 무엇인가요?" id="native-curl">
    <p>
        <a href="#curl">Curl</a> 클라이언트 엔진은
        <code>curl</code> 라이브러리 설치가 필요합니다.
        Windows의 경우 MinGW/MSYS2 <code>curl</code> 바이너리 사용을 고려해 볼 수 있습니다.
    </p>
    <procedure>
        <step>
            <p>
                <a href="https://www.msys2.org/">MinGW/MSYS2</a>에 설명된 대로 MinGW/MSYS2를 설치합니다.
            </p>
        </step>
        <step>
            <p>
                다음 명령어를 사용하여 <code>libcurl</code>을 설치합니다:
            </p>
            <code-block lang="shell" code="                    pacman -S mingw-w64-x86_64-curl"/>
        </step>
        <step>
            <p>
                MinGW/MSYS2를 기본 위치에 설치했다면, <code>PATH</code> 환경 변수에
                <Path>C:\\msys64\\mingw64\\bin\\</Path>
                를 추가하세요.
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="'NoTransformationFoundException'을 어떻게 해결하나요?" id="no-transformation-found-exception">
    <p>
        <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a>은
        *수신된 본문(received body)*에 대해 **결과(resulted)** 타입에서 클라이언트가 **기대하는(expected)** 타입으로의 적절한 변환을 찾을 수 없음을 나타냅니다.
    </p>
    <procedure>
        <step>
            <p>
                요청의 <code>Accept</code> 헤더가 원하는 콘텐츠 타입을 지정하고 있는지, 그리고 서버 응답의 <code>Content-Type</code> 헤더가 클라이언트 측에서 기대하는 타입과 일치하는지 확인하세요.
            </p>
        </step>
        <step>
            <p>
                작업 중인 특정 콘텐츠 타입에 필요한 콘텐츠 변환을 등록하세요.
            </p>
            <p>
                클라이언트 측에서 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a>
                플러그인을 사용할 수 있습니다.
                이 플러그인을 사용하면 다양한 콘텐츠 타입에 대해 데이터를 직렬화(serialize) 및 역직렬화(deserialize)하는 방법을 지정할 수 있습니다.
            </p>
            <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // 예시: JSON 콘텐츠 변환 등록&#10;                            // 필요한 다른 콘텐츠 타입에 대한 변환 추가&#10;                        }&#10;                    }"/>
        </step>
        <step>
            <p>
                필요한 모든 플러그인을 설치했는지 확인하세요. 누락되었을 수 있는 기능들:
            </p>
            <list type="bullet">
                <li>클라이언트 <a href="https://ktor.io/docs/websocket-client.html">WebSockets</a> 및
                    서버 <a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                <li>클라이언트 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> 및
                    서버 <a href="https://ktor.io/docs/server-serialization.html">ContentNegotiation</a></li>
                <li><a href="https://ktor.io/docs/compression.html">Compression</a></li>
            </list>
        </step>
    </procedure>
</chapter>
</topic>