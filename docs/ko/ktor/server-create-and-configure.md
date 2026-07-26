<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="서버 생성하기"
       id="server-create-and-configure" help-id="start_server;create_server">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <p>
            <b>코드 예제</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a>,
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>,
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>
        </p>
    </tldr>
    <link-summary>
        애플리케이션 배포 요구 사항에 따라 서버를 생성하는 방법을 알아봅니다.
    </link-summary>
    <p>
        Ktor 애플리케이션을 생성하기 전에, 애플리케이션을 어떻게
        <Links href="//server-deployment" summary="">
            배포(deploy)
        </Links>
        할 것인지 고려해야 합니다:
    </p>
    <list>
        <li>
            <p>
                <control><a href="#embedded">독립형 패키지(self-contained package)</a></control> 형태
            </p>
            <p>
                이 경우, 네트워크 요청을 처리하는 데 사용되는 애플리케이션 <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진(engine)</Links>이 애플리케이션의 일부가 되어야 합니다.
                애플리케이션은 엔진 설정, 연결 및 SSL 옵션에 대한 제어권을 갖습니다.
            </p>
        </li>
        <li>
            <p>
                <control>
                    <a href="#servlet">서블릿(servlet)</a>
                </control> 형태
            </p>
            <p>
                이 경우, Ktor 애플리케이션은 애플리케이션 생명주기와 연결 설정을 제어하는 서블릿 컨테이너(Tomcat 또는 Jetty 등) 내부에서 배포될 수 있습니다.
            </p>
        </li>
    </list>
    <chapter title="독립형 패키지" id="embedded">
        <p>
            Ktor 서버 애플리케이션을 독립형 패키지로 제공하려면 먼저 서버를 생성해야 합니다.
            서버 설정에는 서버 <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진</Links>(Netty, Jetty 등),
            다양한 엔진 전용 옵션, 호스트 및 포트 값 등 다양한 설정이 포함될 수 있습니다.
            Ktor에서 서버를 생성하고 실행하는 두 가지 주요 접근 방식은 다음과 같습니다:
        </p>
        <list>
            <li>
                <p>
                    <code>embeddedServer</code> 함수는
                    <a href="#embedded-server">
                        코드에서 서버 파라미터를 설정
                    </a>
                    하고 애플리케이션을 빠르게 실행할 수 있는 간단한 방법입니다.
                </p>
            </li>
            <li>
                <p>
                    <code>EngineMain</code>은 서버 설정을 위한 더 많은 유연성을 제공합니다.
                    <a href="#engine-main">
                        파일에 서버 파라미터를 지정
                    </a>
                    할 수 있으며 애플리케이션을 다시 컴파일하지 않고도 설정을 변경할 수 있습니다.
                    또한, 명령줄(command line)에서 애플리케이션을 실행하고 해당 명령줄 인수를 전달하여 필요한 서버 파라미터를 재정의(override)할 수 있습니다.
                </p>
            </li>
        </list>
        <chapter title="코드를 통한 설정" id="embedded-server">
            <p>
                <code>embeddedServer</code> 함수는
                <Links href="//server-configuration-code" summary="코드에서 다양한 서버 파라미터를 설정하는 방법을 알아봅니다.">코드</Links>
                에서 서버 파라미터를 설정하고 애플리케이션을 빠르게 실행하는 간단한 방법입니다. 아래의 코드 스니펫에서 이 함수는 서버를 시작하기 위해
                <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">엔진</Links>
                과 포트를 파라미터로 받습니다. 다음 예제에서는 <code>Netty</code> 엔진을 사용하여 서버를 실행하고 <code>8080</code> 포트에서 수신 대기합니다:
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    if (args.isEmpty()) {&#10;        println(&quot;Running basic server...&quot;)&#10;        println(&quot;Provide the 'configured' argument to run a configured server.&quot;)&#10;        runBasicServer()&#10;    }&#10;&#10;    when (args[0]) {&#10;        &quot;basic&quot; -&gt; runBasicServer()&#10;        &quot;configured&quot; -&gt; runConfiguredServer()&#10;        else -&gt; runServerWithCommandLineConfig(args)&#10;    }&#10;}&#10;&#10;fun runBasicServer() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runConfiguredServer() {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runServerWithCommandLineConfig(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
            <p>
                전체 예제는
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">
                    embedded-server
                </a>
                를 참조하세요.
            </p>
        </chapter>
        <chapter title="파일을 통한 설정" id="engine-main">
            <p>
                <code>EngineMain</code>은 선택한 엔진으로 서버를 시작하고 외부 <Links href="//server-configuration-file" summary="설정 파일에서 다양한 서버 파라미터를 설정하는 방법을 알아봅니다.">설정 파일</Links>(일반적으로 <Path>resource</Path> 디렉터리에 위치한 <Path>application.conf</Path> 또는 <Path>application.yaml</Path>)로부터 <Links href="//server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">애플리케이션 모듈</Links>을 로드합니다.
            </p>
            <p>
                로드할 모듈을 지정하는 것 외에도, 설정 파일에는 포트, 호스트, SSL 설정과 같은 다양한 서버 파라미터를 포함할 수 있습니다. 예를 들어, 아래 설정은 서버 포트를 <code>8080</code>으로 설정합니다.
            </p>
            <Tabs>
                <TabItem title="Application.kt" id="application-kt">
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
                </TabItem>
                <TabItem title="application.conf" id="application-conf">
                    <code-block code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
                </TabItem>
                <TabItem title="application.yaml" id="application-yaml">
                    <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
                </TabItem>
            </Tabs>
            <note>
                <code>EngineMain.main()</code>으로 서버를 즉시 시작하는 대신, <code>EngineMain.createServer()</code>를 사용하여 서버 인스턴스를 수동으로 생성할 수 있습니다. 자세한 내용은 <a href="#createServer"></a>를 참조하세요.
            </note>
            <p>
                전체 예제는
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">
                    engine-main
                </a>
                및
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-yaml">
                    engine-main-yaml
                </a>
                을 참조하세요.
            </p>
        </chapter>
    </chapter>
    <chapter title="서블릿(Servlet)" id="servlet">
        <p>
            Ktor 애플리케이션은 Tomcat 및 Jetty를 포함한 서블릿 컨테이너 내부에서 실행 및 배포될 수 있습니다.
            서블릿 컨테이너 내부에 배포하려면
            <Links href="//server-war" summary="WAR 아카이브를 사용하여 서블릿 컨테이너 내에서 Ktor 애플리케이션을 실행하고 배포하는 방법을 알아봅니다.">WAR</Links>
            아카이브를 생성한 다음, WAR를 지원하는 서버나 클라우드 서비스에 배포해야 합니다.
        </p>
    </chapter>
</topic>