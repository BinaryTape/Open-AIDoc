[//]: # (title: 서버 엔진)

<show-structure for="chapter" depth="3"/>

<link-summary>
네트워크 요청을 처리하는 엔진에 대해 알아봅니다.
</link-summary>

Ktor 서버 애플리케이션을 실행하려면 먼저 서버를 [생성](server-create-and-configure.topic)하고 설정해야 합니다.
서버 설정에는 다음과 같은 다양한 설정이 포함됩니다:

- 네트워크 요청 처리를 위한 [엔진](#supported-engines).
- 서버 접속에 사용되는 호스트와 포트 값.
- SSL 설정.

## 지원되는 플랫폼 {id="supported-engines"}

아래 표는 각 엔진에서 지원하는 플랫폼을 나열합니다:

| 엔진                                    | 플랫폼                                                                  | HTTP/2 |
|-------------------------------------------|----------------------------------------------------------------------------|--------|
| `Netty`                                   | JVM                                                                        | ✅      |
| `Jetty`                                   | JVM                                                                        | ✅      |
| `Tomcat`                                  | JVM                                                                        | ✅      |
| `CIO` (코루틴 기반 I/O)               | JVM, [Native](server-native.md), [GraalVM](graalvm.md), JavaScript, WasmJs | ✖️     |
| [`ServletApplicationEngine`](server-war.md) | JVM                                                                        | ✅      |

## 의존성 추가 {id="dependencies"}

원하는 엔진을 사용하기 전에, [빌드 스크립트](server-dependencies.topic)에 해당 의존성을 추가해야 합니다:

* `ktor-server-netty`
* `ktor-server-jetty-jakarta`
* `ktor-server-tomcat-jakarta`
* `ktor-server-cio`

아래는 Netty에 대한 의존성을 추가하는 예시입니다:

<var name="artifact_name" value="ktor-server-netty"/>
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

## 서버 생성 방법 선택 {id="choose-create-server"}

Ktor 서버 애플리케이션은 [두 가지 방법으로 생성 및 실행](server-create-and-configure.topic#embedded)할 수 있습니다:

* [`embeddedServer`](#embeddedServer)를 사용하여 코드 내에서 서버 파라미터를 신속하게 전달하는 방법
* [`EngineMain`](#EngineMain)을 사용하여 외부 <Path>application.conf</Path> 또는 <Path>application.yaml</Path> 파일에서 설정을 로드하는 방법

### embeddedServer {id="embeddedServer"}

[`embeddedServer()`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html)
함수는 특정 타입의 엔진을 생성하는 데 사용되는 엔진 팩토리를 인자로 받습니다. 아래 예시에서는
[`Netty`](https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty/index.html) 팩토리를 전달하여 Netty 엔진으로 서버를 실행하고 `8080` 포트에서 리스닝합니다:

```kotlin
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        routing {
            get("/") {
                call.respondText("Hello, world!")
            }
        }
    }.start(wait = true)
}
```

### EngineMain {id="EngineMain"}

`EngineMain`은 서버 실행을 위한 엔진을 나타냅니다. 다음 엔진들을 사용할 수 있습니다:

* `io.ktor.server.netty.EngineMain`
* `io.ktor.server.jetty.jakarta.EngineMain`
* `io.ktor.server.tomcat.jakarta.EngineMain`
* `io.ktor.server.cio.EngineMain`

#### 서버 생성 및 시작

`EngineMain.main()` 함수는 선택한 엔진으로 서버를 시작하고 외부 [설정 파일](server-configuration-file.topic)에 지정된 [애플리케이션 모듈](server-modules.md)을 로드하는 데 사용됩니다. 아래 예시에서 애플리케이션의 `main` 함수는 서버를 시작합니다:

<Tabs>
<TabItem title="Application.kt">

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    routing {
        get("/") {
            call.respondText("Hello, world!")
        }
    }
}

```

</TabItem>

<TabItem title="application.conf">

```shell
ktor {
    deployment {
        port = 8080
    }
    application {
        modules = [ com.example.ApplicationKt.module ]
    }
}
```

</TabItem>

<TabItem title="application.yaml">

```yaml
ktor:
    deployment:
        port: 8080
    application:
        modules:
            - com.example.ApplicationKt.module
```

</TabItem>
</Tabs>

빌드 시스템 태스크를 사용하여 서버를 시작해야 하는 경우, 필요한 `EngineMain`을 메인 클래스로 설정해야 합니다:

<Tabs group="languages" id="main-class-set-engine-main">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
mainClassName = "io.ktor.server.netty.EngineMain"
```

</TabItem>
<TabItem title="Maven" group-key="maven">

```xml
<properties>
    <main.class>io.ktor.server.netty.EngineMain</main.class>
</properties>
```

</TabItem>
</Tabs>

#### 시작하지 않고 서버 인스턴스 생성하기 {id="createServer"}

`EngineMain.main()`을 직접 호출하여 서버를 즉시 시작하는 것 외에도, 서버를 시작하지 않고 `EmbeddedServer` 인스턴스를 반환하는 `EngineMain.createServer()`를 대신 호출할 수 있습니다.

이 방식은 요청을 수락하기 전에 `.start()`, `.stop()`을 호출하거나 서버에서 추가적인 작업을 수행하는 시점을 제어할 수 있게 해줍니다.

```Kotlin
// Netty를 사용하는 예시
val server = io.ktor.server.netty.EngineMain.createServer(args)
// 추가 초기화, 로깅, 계측(instrumentation) 등을 수행합니다.
server.start(wait = true)
```
## 엔진 설정 {id="configure-engine"}

이 섹션에서는 다양한 엔진별 옵션을 지정하는 방법을 살펴봅니다.

### 코드에서 설정 {id="embedded-server-configure"}

<p>
    <code>embeddedServer</code> 함수를 사용하면 <code>configure</code> 파라미터를 통해 엔진별 옵션을 전달할 수 있습니다. 이 파라미터에는 모든 엔진에 공통적인 옵션이 포함되어 있으며,
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
        ApplicationEngine.Configuration
    </a>
    클래스에 의해 노출됩니다.
</p>
<p>
    아래 예시는 <code>Netty</code> 엔진을 사용하여 서버를 설정하는 방법을 보여줍니다. <code>configure</code> 블록 내에서 호스트와 포트를 지정하기 위해 <code>connector</code>를 정의하고 다양한 서버 파라미터를 커스터마이징합니다:
</p>
<code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"></code-block>
<p>
    <code>connectors.add()</code> 메서드는 지정된 호스트(<code>127.0.0.1</code>) 및 포트(<code>8080</code>)로 커넥터를 정의합니다.
</p>
<p>이러한 옵션 외에도 다른 엔진별 속성을 설정할 수 있습니다.</p>
<chapter title="Netty" id="netty-code">
    <p>
        Netty 전용 옵션은 
        <a href="https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
            NettyApplicationEngine.Configuration
        </a>
        클래스에 의해 노출됩니다.
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.netty.*&#10;&#10;        fun main() {&#10;            embeddedServer(Netty, configure = {&#10;                requestQueueLimit = 16&#10;                shareWorkGroup = false&#10;                configureBootstrap = {&#10;                    // ...&#10;                }&#10;                responseWriteTimeoutSeconds = 10&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="Jetty" id="jetty-code">
    <p>
        Jetty 전용 옵션은 
        <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
            JettyApplicationEngineBase.Configuration
        </a>
        클래스에 의해 노출됩니다.
    </p>
    <p>Jetty 서버는 
        <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
            configureServer
        </a>
        블록 내부에서 설정할 수 있으며, 이 블록은 
        <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
        인스턴스에 대한 접근을 제공합니다.
    </p>
    <p>
        <code>idleTimeout</code> 속성을 사용하여 연결이 닫히기 전까지 유휴 상태로 있을 수 있는 시간을 지정합니다.
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.jetty.jakarta.*&#10;&#10;        fun main() {&#10;            embeddedServer(Jetty, configure = {&#10;                configureServer = { // this: Server -&amp;gt;&#10;                    // ...&#10;                }&#10;                idleTimeout = 30.seconds&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="CIO" id="cio-code">
    <p>CIO 전용 옵션은 
        <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
            CIOApplicationEngine.Configuration
        </a>
        클래스에 의해 노출됩니다.
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.cio.*&#10;&#10;        fun main() {&#10;            embeddedServer(CIO, configure = {&#10;                connectionIdleTimeoutSeconds = 45&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
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
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.tomcat.jakarta.*&#10;&#10;        fun main() {&#10;            embeddedServer(Tomcat, configure = {&#10;                configureTomcat = { // this: Tomcat -&amp;gt;&#10;                    // ...&#10;                }&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>

### 설정 파일에서 설정 {id="engine-main-configure"}

<p>
    <code>EngineMain</code>을 사용하는 경우, <code>ktor.deployment</code> 그룹 내에서 모든 엔진에 공통적인 옵션을 지정할 수 있습니다.
</p>
<Tabs group="config">
    <TabItem title="application.conf" group-key="hocon" id="engine-main-conf">
        <code-block lang="shell" code="            ktor {&#10;                deployment {&#10;                    connectionGroupSize = 2&#10;                    workerGroupSize = 5&#10;                    callGroupSize = 10&#10;                    shutdownGracePeriod = 2000&#10;                    shutdownTimeout = 3000&#10;                }&#10;            }"></code-block>
    </TabItem>
    <TabItem title="application.yaml" group-key="yaml" id="engine-main-yaml">
        <code-block lang="yaml" code="           ktor:&#10;               deployment:&#10;                   connectionGroupSize: 2&#10;                   workerGroupSize: 5&#10;                   callGroupSize: 10&#10;                   shutdownGracePeriod: 2000&#10;                   shutdownTimeout: 3000"></code-block>
    </TabItem>
</Tabs>
<chapter title="Netty" id="netty-file">
    <p>
        설정 파일의 <code>ktor.deployment</code> 그룹 내에서 Netty 전용 옵션을 설정할 수도 있습니다:
    </p>
    <Tabs group="config">
        <TabItem title="application.conf" group-key="hocon" id="application-conf-1">
            <code-block lang="shell" code="               ktor {&#10;                   deployment {&#10;                       maxInitialLineLength = 2048&#10;                       maxHeaderSize = 1024&#10;                       maxChunkSize = 42&#10;                   }&#10;               }"></code-block>
        </TabItem>
        <TabItem title="application.yaml" group-key="yaml" id="application-yaml-1">
            <code-block lang="yaml" code="               ktor:&#10;                   deployment:&#10;                       maxInitialLineLength: 2048&#10;                       maxHeaderSize: 1024&#10;                       maxChunkSize: 42"></code-block>
        </TabItem>
    </Tabs>
</chapter>