<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="코드로 설정하기"
       id="server-configuration-code" help-id="Configuration-code;server-configuration-in-code">
<show-structure for="chapter"/>
<link-summary>
    코드로 다양한 서버 파라미터를 설정하는 방법을 알아봅니다.
</link-summary>
<p>
    Ktor를 사용하면 호스트 주소, 포트, <Links href="//server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션을 구성할 수 있습니다.">서버 모듈</Links> 등을 포함한 다양한 서버 파라미터를 코드로 직접 설정할 수 있습니다. 설정 방법은 <Links href="//server-create-and-configure" summary="애플리케이션 배포 요구 사항에 따라 서버를 생성하는 방법을 알아봅니다.">embeddedServer 또는 EngineMain</Links> 중 어떤 방식으로 서버를 설정하느냐에 따라 달라집니다.
</p>
<p>
    <code>embeddedServer</code>를 사용하면 원하는 파라미터를 함수에 직접 전달하여 서버를 설정합니다.
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html">
        embeddedServer
    </a>
    함수는 <Links href="//server-engines" summary="네트워크 요청을 처리하는 엔진에 대해 알아봅니다.">서버 엔진</Links>, 서버가 수신 대기할 호스트와 포트, 그리고 추가 설정을 포함하여 서버 구성을 위한 다양한 파라미터를 받습니다.
</p>
<p>
    이 섹션에서는 <code>embeddedServer</code>를 실행하는 여러 가지 예시를 살펴보며 서버를 유용하게 설정하는 방법을 설명합니다.
</p>
<chapter title="기본 설정" id="embedded-basic">
    <p>
        아래 코드 스니펫은 Netty 엔진과 <code>8080</code> 포트를 사용하는 기본 서버 설정을 보여줍니다.
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        <code>port</code> 파라미터를 <code>0</code>으로 설정하면 서버를 무작위 포트에서 실행할 수 있습니다.
        <code>embeddedServer</code> 함수는 엔진 인스턴스를 반환하므로,
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/resolved-connectors.html">
            ApplicationEngine.resolvedConnectors
        </a>
        함수를 사용하여 코드에서 포트 값을 가져올 수 있습니다.
    </p>
</chapter>
<chapter title="엔진 설정" id="embedded-engine">
    <snippet id="embedded-engine-configuration">
        <p>
            <code>embeddedServer</code> 함수를 사용하면 <code>configure</code> 파라미터를 통해 엔진 전용 옵션을 전달할 수 있습니다. 이 파라미터에는 모든 엔진에 공통적인 옵션이 포함되어 있으며,
            <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
                ApplicationEngine.Configuration
            </a>
            클래스에 의해 노출됩니다.
        </p>
        <p>
            아래 예시는 <code>Netty</code> 엔진을 사용하여 서버를 설정하는 방법을 보여줍니다.
            <code>configure</code> 블록 내에서 호스트와 포트를 지정하기 위한 <code>connector</code>를 정의하고 다양한 서버 파라미터를 커스터마이징합니다.
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            <code>connectors.add()</code> 메서드는 지정된 호스트(<code>127.0.0.1</code>)와 포트(<code>8080</code>)로 커넥터(connector)를 정의합니다.
        </p>
        <p>이러한 옵션 외에도 다른 엔진 전용 속성을 설정할 수 있습니다.</p>
        <chapter title="Netty" id="netty-code">
            <p>
                Netty 전용 옵션은
                <a href="https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
                    NettyApplicationEngine.Configuration
                </a>
                클래스에 의해 노출됩니다.
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, configure = {&#10;                            requestQueueLimit = 16&#10;                            shareWorkGroup = false&#10;                            configureBootstrap = {&#10;                                // ...&#10;                            }&#10;                            responseWriteTimeoutSeconds = 10&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Jetty" id="jetty-code">
            <p>
                Jetty 전용 옵션은
                <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
                    JettyApplicationEngineBase.Configuration
                </a>
                클래스에 의해 노출됩니다.
            </p>
            <p>
                <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
                    configureServer
                </a>
                블록 내에서 Jetty 서버를 설정할 수 있으며, 이 블록은
                <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
                인스턴스에 대한 접근을 제공합니다.
            </p>
            <p>
                <code>idleTimeout</code> 속성을 사용하여 연결이 닫히기 전까지 유휴 상태로 유지될 수 있는 시간을 지정합니다.
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.jetty.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Jetty, configure = {&#10;                            configureServer = { // this: Server -&amp;gt;&#10;                                // ...&#10;                            }&#10;                            idleTimeout = 30.seconds&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="CIO" id="cio-code">
            <p>CIO 전용 옵션은
                <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
                    CIOApplicationEngine.Configuration
                </a>
                클래스에 의해 노출됩니다.
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.cio.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(CIO, configure = {&#10;                            connectionIdleTimeoutSeconds = 45&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Tomcat" id="tomcat-code">
            <p>Tomcat을 엔진으로 사용하는 경우,
                <a href="https://api.ktor.io/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
                    configureTomcat
                </a>
                속성을 사용하여 설정할 수 있으며, 이 속성은
                <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
                인스턴스에 대한 접근을 제공합니다.
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.tomcat.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Tomcat, configure = {&#10;                            configureTomcat = { // this: Tomcat -&amp;gt;&#10;                                // ...&#10;                            }&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
    </snippet>
</chapter>
<chapter title="사용자 정의 환경" id="embedded-custom">
    <p>
        아래 예시는
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
            ApplicationEngine.Configuration
        </a>
        클래스로 표현되는 사용자 정의 설정을 사용하여 여러 커넥터 엔드포인트로 서버를 실행하는 방법을 보여줍니다.
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main() {&#10;    val appProperties = serverConfig {&#10;        module { module() }&#10;    }&#10;    embeddedServer(Netty, appProperties) {&#10;        envConfig()&#10;    }.start(true)&#10;}&#10;&#10;fun ApplicationEngine.Configuration.envConfig() {&#10;    connector {&#10;        host = &quot;0.0.0.0&quot;&#10;        port = 8080&#10;    }&#10;    connector {&#10;        host = &quot;127.0.0.1&quot;&#10;        port = 9090&#10;    }&#10;}"/>
    <p>
        전체 예시는
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-multiple-connectors">
            embedded-server-multiple-connectors
        </a>를 참고하세요.
    </p>
    <tip>
        <p>
            사용자 정의 환경을 사용하여
            <a href="#embedded-server">
                HTTPS를 제공
            </a>할 수도 있습니다.
        </p>
    </tip>
</chapter>
<chapter id="command-line" title="명령줄 설정">
    <p>
        Ktor를 사용하면 명령줄 인수를 사용하여 <code>embeddedServer</code>를 동적으로 설정할 수 있습니다. 이는 포트, 호스트 또는 타임아웃과 같은 설정을 런타임에 지정해야 하는 경우에 특히 유용할 수 있습니다.
    </p>
    <p>
        이를 위해
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html">
            CommandLineConfig
        </a>
        클래스를 사용하여 명령줄 인수를 설정 객체로 파싱하고 설정 블록 내에서 전달합니다.
    </p>
    <code-block lang="kotlin" code="fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        이 예시에서는 <code>port</code> 및 <code>host</code>와 같은 엔진 설정 값을 재정의하기 위해 <code>Application.Configuration</code>의
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/take-from.html">
            <code>takeFrom()</code>
        </a>
        함수를 사용합니다.
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/load-common-configuration.html">
            <code>loadCommonConfiguration()</code>
        </a>
        함수는 타임아웃과 같은 루트 환경의 설정을 로드합니다.
    </p>
    <p>
        서버를 실행하려면 다음과 같은 방식으로 인수를 지정합니다.
    </p>
    <code-block lang="shell" code="            ./gradlew run --args=&quot;-port=8080&quot;"/>
    <tip>
        정적 설정의 경우 설정 파일이나 환경 변수를 사용할 수 있습니다.
        자세한 내용은
        <a href="#command-line">
            파일로 설정하기
        </a>
        를 참고하세요.
    </tip>
</chapter>
</topic>