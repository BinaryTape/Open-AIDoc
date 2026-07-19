<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="파일 기반 설정"
       id="server-configuration-file" help-id="Configuration-file;server-configuration-in-file">
<show-structure for="chapter" depth="2"/>
<link-summary>
    설정 파일에서 다양한 서버 파라미터를 구성하는 방법을 알아봅니다.
</link-summary>
<p>
    Ktor를 사용하면 호스트 주소 및 포트, 로드할
    <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>
    등 다양한 서버 파라미터를 설정할 수 있습니다.
    설정 방식은 서버를 생성할 때 사용한 방법(<Links href="/ktor/server-create-and-configure" summary="애플리케이션 배포 요구 사항에 따라 서버를 생성하는 방법을 알아봅니다.">
        embeddedServer 또는 EngineMain
    </Links>)에 따라 달라집니다.
</p>
<p>
    <code>EngineMain</code>의 경우, Ktor는 
    <a href="https://github.com/lightbend/config/blob/master/HOCON.md">
        HOCON
    </a>
    또는 YAML 형식을 사용하는 설정 파일에서 설정을 로드합니다. 이 방식은 서버 설정에 더 큰 유연성을 제공하며, 애플리케이션을 다시 컴파일하지 않고도 설정을 변경할 수 있게 해줍니다. 또한, 커맨드 라인에서 애플리케이션을 실행하면서 해당 
    <a href="#command-line">
        커맨드 라인
    </a>
    인자를 전달하여 필요한 서버 파라미터를 오버라이드할 수 있습니다.
</p>
<chapter title="개요" id="configuration-file-overview">
    <p>
        <a href="#engine-main">
            EngineMain
        </a>
        을 사용하여 서버를 시작하면, Ktor는 
        <Path>resources</Path>
        디렉토리에 있는 <Path>application.*</Path> 파일에서 설정 정보를 자동으로 로드합니다. 두 가지 설정 형식이 지원됩니다:
    </p>
    <list>
        <li>
            <p>
                HOCON (
                <Path>application.conf</Path>
                )
            </p>
        </li>
        <li>
            <p>
                YAML (
                <Path>application.yaml</Path>
                )
            </p>
            <note>
                <p>
                    YAML 설정 파일을 사용하려면 <code>ktor-server-config-yaml</code> 
                    <Links href="/ktor/server-dependencies" summary="기존 Gradle/Maven 프로젝트에 Ktor 서버 의존성을 추가하는 방법을 알아봅니다.">
                        의존성
                    </Links>
                    을 추가해야 합니다.
                </p>
            </note>
            <warning>
                YAML 설정은 현재 Maven 기반 Ktor 프로젝트에서 지원되지 않습니다.
            </warning>
        </li>
    </list>
    <p>
        설정 파일에는 최소한 <code>ktor.application.modules</code> 속성을 사용하여 지정된 
        <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">
            로드할 모듈
        </Links>
        이 포함되어야 합니다. 예시:
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="application-conf-2">
            <code-block lang="shell" code="ktor {&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="application-yaml-2">
            <code-block lang="yaml" code="ktor:&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
        </tab>
    </tabs>
    <p>
        이 경우, Ktor는 아래 <Path>Application.kt</Path> 파일에 있는 <code>Application.module</code> 함수를 호출합니다:
    </p>
    <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
    <p>
        로드할 모듈 외에도 <a href="#predefined-properties">사전 정의된 속성</a>(포트 또는 호스트, SSL 설정 등) 및 사용자 정의 설정을 포함한 다양한 서버 설정을 구성할 수 있습니다.
        몇 가지 예시를 살펴보겠습니다.
    </p>
    <chapter title="기본 설정" id="config-basic">
        <p>
            아래 예시에서는 <code>ktor.deployment.port</code> 속성을 사용하여 서버 수신 포트를 <code>8080</code>으로 설정합니다.
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-3">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-3">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="엔진 설정" id="config-engine">
        <snippet id="engine-main-configuration">
            <p>
                <code>EngineMain</code>을 사용하는 경우, <code>ktor.deployment</code> 그룹 내에 모든 엔진에 공통적인 옵션을 지정할 수 있습니다.
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon" id="engine-main-conf">
                    <code-block lang="shell" code="                            ktor {&#10;                                deployment {&#10;                                    connectionGroupSize = 2&#10;                                    workerGroupSize = 5&#10;                                    callGroupSize = 10&#10;                                    shutdownGracePeriod = 2000&#10;                                    shutdownTimeout = 3000&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="application.yaml" group-key="yaml" id="engine-main-yaml">
                    <code-block lang="yaml" code="                           ktor:&#10;                               deployment:&#10;                                   connectionGroupSize: 2&#10;                                   workerGroupSize: 5&#10;                                   callGroupSize: 10&#10;                                   shutdownGracePeriod: 2000&#10;                                   shutdownTimeout: 3000"/>
                </tab>
            </tabs>
            <chapter title="Netty" id="netty-file">
                <p>
                    설정 파일의 <code>ktor.deployment</code> 그룹 내에서 Netty 전용 옵션을 구성할 수도 있습니다:
                </p>
                <tabs group="config">
                    <tab title="application.conf" group-key="hocon" id="application-conf-1">
                        <code-block lang="shell" code="                               ktor {&#10;                                   deployment {&#10;                                       maxInitialLineLength = 2048&#10;                                       maxHeaderSize = 1024&#10;                                       maxChunkSize = 42&#10;                                   }&#10;                               }"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml" id="application-yaml-1">
                        <code-block lang="yaml" code="                               ktor:&#10;                                   deployment:&#10;                                       maxInitialLineLength: 2048&#10;                                       maxHeaderSize: 1024&#10;                                       maxChunkSize: 42"/>
                    </tab>
                </tabs>
            </chapter>
        </snippet>
    </chapter>
    <chapter title="SSL 설정" id="config-ssl">
        <p>
            아래 예시는 Ktor가 <code>8443</code> SSL 포트에서 수신 대기하도록 설정하고, 별도의 <code>security</code> 블록에 필요한 
            <Links href="/ktor/server-ssl" summary="필수 의존성: io.ktor:ktor-network-tls-certificates 코드 예시: ssl-engine-main, ssl-embedded-server">
                SSL 설정
            </Links>
            을 지정합니다.
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;        sslPort = 8443&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;&#10;    security {&#10;        ssl {&#10;            keyStore = keystore.jks&#10;            keyAlias = sampleAlias&#10;            keyStorePassword = foobar&#10;            privateKeyPassword = foobar&#10;            trustStore = truststore.jks&#10;            trustStorePassword = foobar&#10;            enabledProtocols = [&quot;TLSv1.2&quot;, &quot;TLSv1.3&quot;]&#10;        }&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;        sslPort: 8443&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module&#10;&#10;    security:&#10;        ssl:&#10;            keyStore: keystore.jks&#10;            keyAlias: sampleAlias&#10;            keyStorePassword: foobar&#10;            privateKeyPassword: foobar&#10;            trustStore: truststore.jks&#10;            trustStorePassword: foobar&#10;            enabledProtocols: [&quot;TLSv1.2&quot;, &quot;TLSv1.3&quot;]"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="사용자 정의 설정" id="config-custom">
        <p>
            Ktor는 <a href="#predefined-properties">사전 정의된 속성</a> 외에도 설정 파일에 사용자 정의 설정을 유지할 수 있도록 허용합니다.
            아래 설정 파일에는 <a href="#jwt-settings">JWT</a> 설정을 보관하는 데 사용되는 사용자 정의 <code>jwt</code> 그룹이 포함되어 있습니다.
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-4">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;&#10;    application {&#10;        modules = [ com.example.ApplicationKt.main ]&#10;    }&#10;}&#10;&#10;jwt {&#10;    secret = &quot;secret&quot;&#10;    issuer = &quot;http://0.0.0.0:8080/&quot;&#10;    audience = &quot;http://0.0.0.0:8080/hello&quot;&#10;    realm = &quot;Access to 'hello'&quot;&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-4">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.main&#10;&#10;jwt:&#10;    secret: &quot;secret&quot;&#10;    issuer: &quot;http://0.0.0.0:8080/&quot;&#10;    audience: &quot;http://0.0.0.0:8080/hello&quot;&#10;    realm: &quot;Access to 'hello'&quot;"/>
            </tab>
        </tabs>
        <p>
            코드에서 <a href="#read-configuration-in-code">이러한 설정을 읽고 처리</a>할 수 있습니다.
        </p>
        <warning>
            <p>
                비밀 키(secret key), 데이터베이스 연결 설정 등과 같은 민감한 데이터는 설정 파일에 평문으로 저장해서는 안 됩니다. 이러한 파라미터를 지정하려면 
                <a href="#environment-variables">
                    환경 변수
                </a>
                를 사용하는 것이 좋습니다.
            </p>
        </warning>
    </chapter>
</chapter>
<chapter title="사전 정의된 속성" id="predefined-properties">
    <p>
        다음은 <a href="#configuration-file-overview">설정 파일</a> 내부에서 사용할 수 있는 사전 정의된 설정 목록입니다.
    </p>
    <deflist type="wide">
        <def title="ktor.deployment.host" id="ktor-deployment-host">
            <p>
                호스트 주소.
            </p>
            <p>
                <emphasis>예시</emphasis>
                : <code>0.0.0.0</code>
            </p>
        </def>
        <def title="ktor.deployment.port" id="ktor-deployment-port">
            <p>
                수신 포트. 서버를 랜덤 포트에서 실행하려면 이 속성을 <code>0</code>으로 설정할 수 있습니다.
            </p>
            <p>
                <emphasis>예시</emphasis>
                : <code>8080</code>, <code>0</code>
            </p>
        </def>
        <def title="ktor.deployment.sslPort" id="ktor-deployment-ssl-port">
            <p>
                SSL 수신 포트. 서버를 랜덤 포트에서 실행하려면 이 속성을 <code>0</code>으로 설정할 수 있습니다.
            </p>
            <p>
                <emphasis>예시</emphasis>
                : <code>8443</code>, <code>0</code>
            </p>
            <note>
                <p>
                    SSL에는 <a href="#ssl">아래에 나열된</a> 추가 옵션이 필요합니다.
                </p>
            </note>
        </def>
        <def title="ktor.deployment.watch" id="ktor-deployment-watch">
            <p>
                <a href="#watch-paths">자동 리로딩(auto-reloading)</a>에 사용되는 감시 경로.
            </p>
        </def>
        <def title="ktor.deployment.rootPath" id="ktor-deployment-root-path">
            <p>
                <Links href="/ktor/server-war" summary="WAR 아카이브를 사용하여 서블릿 컨테이너 내에서 Ktor 애플리케이션을 실행하고 배포하는 방법을 알아봅니다.">서블릿</Links> 컨텍스트 경로.
            </p>
            <p>
                <emphasis>예시</emphasis>
                : <code>/</code>
            </p>
        </def>
        <def title="ktor.deployment.shutdown.url" id="ktor-deployment-shutdown-url">
            <p>
                셧다운(shutdown) URL.
                이 옵션은 <Links href="/ktor/server-shutdown-url" summary="코드 예시: %example_name%">Shutdown URL</Links> 플러그인을 사용합니다.
            </p>
        </def>
        <def title="ktor.deployment.shutdownGracePeriod" id="ktor-deployment-shutdown-grace-period">
            <p>
                서버가 새로운 요청 수락을 중단하기까지의 최대 시간(밀리초).
            </p>
        </def>
        <def title="ktor.deployment.shutdownTimeout" id="ktor-deployment-shutdown-timeout">
            <p>
                서버가 완전히 중단될 때까지 기다리는 최대 시간(밀리초).
            </p>
        </def>
        <def title="ktor.deployment.callGroupSize" id="ktor-deployment-call-group-size">
            <p>
                애플리케이션 호출을 처리하는 데 사용되는 스레드 풀의 최소 크기.
            </p>
        </def>
        <def title="ktor.deployment.connectionGroupSize" id="ktor-deployment-connection-group-size">
            <p>
                새로운 연결을 수락하고 호출 처리를 시작하는 데 사용되는 스레드 수.
            </p>
        </def>
        <def title="ktor.deployment.workerGroupSize" id="ktor-deployment-worker-group-size">
            <p>
                연결 처리, 메시지 파싱 및 엔진의 내부 작업을 수행하기 위한 이벤트 그룹의 크기.
            </p>
        </def>
    </deflist>
    <p id="ssl">
        <code>ktor.deployment.sslPort</code>를 설정한 경우, 다음과 같은 
        <Links href="/ktor/server-ssl" summary="필수 의존성: io.ktor:ktor-network-tls-certificates 코드 예시: ssl-engine-main, ssl-embedded-server">
            SSL 관련
        </Links>
        속성을 지정해야 합니다:
    </p>
    <deflist type="wide">
        <def title="ktor.security.ssl.keyStore" id="ktor-security-ssl-keystore">
            <p>
                SSL 키 스토어.
            </p>
        </def>
        <def title="ktor.security.ssl.keyAlias" id="ktor-security-ssl-key-alias">
            <p>
                SSL 키 스토어의 에일리어스(alias).
            </p>
        </def>
        <def title="ktor.security.ssl.keyStorePassword" id="ktor-security-ssl-keystore-password">
            <p>
                SSL 키 스토어의 비밀번호.
            </p>
        </def>
        <def title="ktor.security.ssl.privateKeyPassword" id="ktor-security-ssl-private-key-password">
            <p>
                SSL 개인 키의 비밀번호.
            </p>
        </def>
    </deflist>
</chapter>
<chapter title="환경 변수" id="environment-variables">
    <p>
        설정 파일에서 파라미터를 환경 변수로 대체할 수 있습니다.
    </p>
    <list>
        <li>
            HOCON (<Path>application.conf</Path>)에서는 <code>${ENV}</code> 구문만 지원됩니다.
        </li>
        <li>
            YAML (<Path>application.yaml</Path>)에서는 <code>${ENV}</code> 및 <code>$ENV</code> 구문이 모두 지원됩니다.
        </li>
    </list>
    <p>
        예를 들어, 다음과 같은 방법으로 <code>PORT</code> 환경 변수를 <code>ktor.deployment.port</code> 속성에 할당할 수 있습니다:
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="env-var-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = ${PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="env-var-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: ${PORT} # or $PORT"/>
        </tab>
    </tabs>
    <p>
        이 경우 환경 변수 값이 수신 포트를 지정하는 데 사용됩니다.
        런타임에 <code>PORT</code> 환경 변수가 존재하지 않는 경우, 다음과 같이 기본 포트 값을 제공할 수 있습니다:
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                            port = ${?PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: ${PORT:8080} # or &quot;$PORT:8080&quot;"/>
        </tab>
    </tabs>
</chapter>
<chapter title="코드에서 설정 읽기" id="read-configuration-in-code">
    <p>
        Ktor를 사용하면 애플리케이션 코드에서 설정 파일에 지정된 속성값에 액세스할 수 있습니다.
        다음 예시에서는 <code>ktor.deployment.port</code> 속성을 지정했습니다:
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf-2">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml-2">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: 8080"/>
        </tab>
    </tabs>
    <p>
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/config.html">
            <code>ApplicationEnvironment.config()</code>
        </a>
        함수를 사용하여 애플리케이션의 설정에 액세스하고 속성값을 가져올 수 있습니다. 필요한 값에 액세스하려면 <code>.property()</code> 함수를 사용하고, 선택적 값의 경우 <code>.propertyOrNull()</code>을 사용합니다:
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                val port = environment.config.propertyOrNull(&quot;ktor.deployment.port&quot;)?.getString() ?: &quot;8080&quot;&#10;                routing {&#10;                    get {&#10;                        call.respondText(&quot;Listening on port $port&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <chapter title="설정을 데이터 클래스로 역직렬화하기" id="deserialize-config">
        <p>
            설정 값을 타입 세이프(type-safe)하게 사용하기 위해 설정을 Kotlin 클래스로 역직렬화할 수 있습니다.
        </p>
        <p>
            아래 예시에서는 <code>app</code> 및 <code>security</code> 설정 섹션을 정의하고 이를 직렬화 가능한 Kotlin 데이터 클래스에 매핑합니다.
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="config-conf-1">
            <code-block lang="shell" code="                    app {&#10;                        port = 8080&#10;                        host = &quot;0.0.0.0&quot;&#10;                    }&#10;&#10;                    security {&#10;                        clientId = ${?CLIENT_ID}&#10;                        clientSecret = ${?CLIENT_SECRET}&#10;                    }"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="config-yaml-1">
            <code-block lang="yaml" code="                    app:&#10;                        port: 8080&#10;                        host: &quot;0.0.0.0&quot;&#10;                    security:&#10;                        clientId: $CLIENT_ID&#10;                        clientSecret: $CLIENT_SECRET"/>
            </tab>
        </tabs>
        <p>
            특정 설정 섹션을 역직렬화하려면 <code>Application.property()</code> 또는 <code>Application.propertyOrNull()</code> 함수를 사용합니다:
        </p>
        <code-block lang="kotlin" code="            @Serializable&#10;            data class Security(val clientId: String, val clientSecret: String)&#10;&#10;            fun Application.module() {&#10;                val securityConfig: Security = property(&quot;security&quot;)&#10;&#10;                println(&quot;Authorization header: ${securityConfig.clientId}:${securityConfig.clientSecret}&quot;)&#10;            }"/>
        <p>
            전체 <code>ApplicationConfig</code>를 역직렬화해야 하는 경우, <code>ApplicationConfig.getAs()</code> 함수를 사용합니다:
        </p>
        <code-block lang="kotlin" code="            @Serializable&#10;            data class App(val port: Int, val host: String)&#10;            @Serializable&#10;            data class Security(val clientId: String, val clientSecret: String)&#10;            @Serializable&#10;            data class Config(val app: App, val security: Security)&#10;&#10;            fun Application.module() {&#10;                val config = environment.config.getAs&lt;Config&gt;()&#10;&#10;                val clientId = config.security.clientId&#10;                val clientSecret = config.security.clientSecret&#10;&#10;                println(&quot;Authorization header: $clientId:$clientSecret&quot;)&#10;            }"/>
    </chapter>
</chapter>
<chapter title="커맨드 라인" id="command-line">
    <p>
        <a href="#engine-main">EngineMain</a>을 사용하여 서버를 생성하는 경우, 
        <Links href="/ktor/server-fatjar" summary="Ktor Gradle 플러그인을 사용하여 실행 가능한 fat JAR를 생성하고 실행하는 방법을 알아봅니다.">패키징된 애플리케이션</Links>을 커맨드 라인에서 실행하고 해당 커맨드 라인 인자를 전달하여 필요한 서버 파라미터를 오버라이드할 수 있습니다. 예를 들어, 다음과 같은 방법으로 설정 파일에 지정된 포트를 오버라이드할 수 있습니다:
    </p>
    <code-block lang="shell" code="            java -jar sample-app.jar -port=8080"/>
    <p>
        사용 가능한 커맨드 라인 옵션은 다음과 같습니다:
    </p>
    <deflist type="narrow">
        <def title="-jar" id="jar">
            <p>
                JAR 파일 경로.
            </p>
        </def>
        <def title="-config" id="config">
            <p>
                resources에 있는 <Path>application.conf</Path> / <Path>application.yaml</Path> 대신 사용할 사용자 정의 설정 파일의 경로.
            </p>
            <p>
                <emphasis>예시</emphasis>
                : <code>java -jar sample-app.jar -config=anotherfile.conf</code>
            </p>
            <p>
                <emphasis>참고</emphasis>
                : 여러 값을 전달할 수 있습니다. <code>java -jar sample-app.jar -config=config-base.conf -config=config-dev.conf</code>. 이 경우 모든 설정이 병합되며, 오른쪽에 있는 설정 파일의 값이 우선순위를 갖습니다.
            </p>
        </def>
        <def title="-host" id="host">
            <p>
                호스트 주소.
            </p>
        </def>
        <def title="-port" id="port">
            <p>
                수신 포트.
            </p>
        </def>
        <def title="-watch" id="watch">
            <p>
                <a href="#watch-paths">자동 리로딩(auto-reloading)</a>에 사용되는 감시 경로.
            </p>
        </def>
    </deflist>
    <p>
        <Links href="/ktor/server-ssl" summary="필수 의존성: io.ktor:ktor-network-tls-certificates 코드 예시: ssl-engine-main, ssl-embedded-server">SSL 관련</Links> 옵션:
    </p>
    <deflist type="narrow">
        <def title="-sslPort" id="ssl-port">
            <p>
                SSL 수신 포트.
            </p>
        </def>
        <def title="-sslKeyStore" id="ssl-keystore">
            <p>
                SSL 키 스토어.
            </p>
        </def>
    </deflist>
    <p>
        해당하는 커맨드 라인 옵션이 없는 <a href="#predefined-properties">사전 정의된 속성</a>을 오버라이드해야 하는 경우, 다음과 같이 <code>-P</code> 플래그를 사용합니다:
    </p>
    <code-block code="            java -jar sample-app.jar -P:ktor.deployment.callGroupSize=7"/>
    <p>
        <code>-P</code> 플래그를 사용하여 <a href="#config-custom">사용자 정의 속성</a>을 오버라이드할 수도 있습니다.
    </p>
</chapter>
<chapter title="예시: 사용자 정의 속성을 사용하여 환경 지정" id="custom-property">
    <p>
        로컬 개발 또는 운영 환경과 같이 서버가 실행 중인 환경에 따라 애플리케이션 동작을 변경하기 위해 사용자 정의 설정 속성을 사용할 수 있습니다.
    </p>
    <p>
        이를 위해 <Path>application.conf</Path> 또는 <Path>application.yaml</Path>에 사용자 정의 속성을 정의하고 <a href="#environment-variables">환경 변수</a>로부터 값을 할당합니다. 아래 예시에서는 <code>KTOR_ENV</code> 환경 변수가 사용자 정의 <code>ktor.environment</code> 속성에 할당됩니다. 그러면 <code>KTOR_ENV</code>의 값을 로컬 환경과 운영 환경에 대해 다르게 설정할 수 있습니다.
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="application-conf-5">
            <code-block code="ktor {&#10;    environment = ${?KTOR_ENV}&#10;}"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="application-yaml-5">
            <code-block lang="yaml" code="ktor:&#10;    environment: $?KTOR_ENV"/>
        </tab>
    </tabs>
    <p>
        런타임에 <a href="#read-configuration-in-code">코드에서 설정을 읽어</a> <code>ktor.environment</code> 값에 액세스하고 필요한 작업을 수행할 수 있습니다:
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Application.module() {&#10;    val env = environment.config.propertyOrNull(&quot;ktor.environment&quot;)?.getString()&#10;    routing {&#10;        get {&#10;            call.respondText(when (env) {&#10;                &quot;dev&quot; -&gt; &quot;Development&quot;&#10;                &quot;prod&quot; -&gt; &quot;Production&quot;&#10;                else -&gt; &quot;...&quot;&#10;            })&#10;        }&#10;    }&#10;}"/>
    <p>
        전체 코드 예시는 
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-custom-environment">
            engine-main-custom-environment
        </a>를 참조하세요.
    </p>
</chapter>
</topic>