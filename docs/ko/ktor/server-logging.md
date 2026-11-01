[//]: # (title: Ktor 서버의 로깅)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="logging"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor는 다양한 로깅 프레임워크(예: Logback 또는 Log4j)의 퍼사드(facade)로 SLF4J API를 사용하며, 애플리케이션 이벤트를 기록할 수 있도록 지원합니다.
</link-summary>

Ktor는 사용하는 플랫폼에 따라 애플리케이션을 로깅할 수 있는 다양한 수단을 제공합니다:

- JVM에서 Ktor는 다양한 로깅 프레임워크(예: [Logback](https://logback.qos.ch/) 또는 [Log4j](https://logging.apache.org/log4j))의 퍼사드로 [SLF4J API](http://www.slf4j.org/)를 사용하며 애플리케이션 이벤트를 기록할 수 있게 해줍니다.
로깅을 활성화하려면 원하는 프레임워크의 [의존성](#add_dependencies)을 추가하고 해당 프레임워크에 맞는 [설정](#configure-logger)을 제공해야 합니다.
  > 클라이언트 요청을 기록하기 위해 [CallLogging](server-call-logging.md) 플러그인을 설치하고 구성할 수도 있습니다.
- [Native 서버](server-native.md)의 경우, Ktor는 모든 내용을 표준 출력(standard output)으로 출력하는 로거를 제공합니다.

## JVM {id="jvm"}
### 로거 의존성 추가하기 {id="add_dependencies"}
로깅을 활성화하려면 원하는 로깅 프레임워크의 아티팩트를 포함해야 합니다.
예를 들어 Logback의 경우 다음 의존성이 필요합니다:

<var name="group_id" value="ch.qos.logback"/>
<var name="artifact_name" value="logback-classic"/>
<var name="version" value="logback_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

Log4j를 사용하려면 `org.apache.logging.log4j:log4j-core` 및 `org.apache.logging.log4j:log4j-slf4j2-impl` 아티팩트를 추가해야 합니다.

### 로거 구성하기 {id="configure-logger"}

선택한 로깅 프레임워크를 구성하는 방법은 해당 프레임워크의 문서를 참조하세요. 예:
- [Logback 구성](http://logback.qos.ch/manual/configuration.html)
- [Log4j 구성](https://logging.apache.org/log4j/2.x/manual/configuration.html)

예를 들어 Logback을 구성하려면 클래스패스의 루트(예: `src/main/resources`)에 `logback.xml` 파일을 배치해야 합니다.
아래 예제는 로그를 콘솔에 출력하는 `STDOUT` appender가 포함된 Logback 구성 샘플을 보여줍니다.

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="trace">
        <appender-ref ref="STDOUT"/>
    </root>
    <logger name="io.netty" level="INFO"/>
</configuration>
```

로그를 파일로 출력하려는 경우 `FILE` appender를 사용할 수 있습니다.

```xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>testFile.log</file>
        <append>true</append>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="trace">
        <appender-ref ref="FILE"/>
    </root>
    <logger name="io.netty" level="INFO"/>
</configuration>
```

전체 예제는 여기에서 확인할 수 있습니다: [logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging).

## Native {id="native"}

Native 서버의 로그 레벨을 구성하려면 애플리케이션을 [실행](server-run.md)할 때 `KTOR_LOG_LEVEL` 환경 변수에 다음 값 중 하나를 할당하세요:
- _TRACE_
- _DEBUG_
- _INFO_
- _WARN_
- _ERROR_

예를 들어, _TRACE_ 레벨은 특정 라우트가 실행되지 않는 원인을 파악하는 데 도움이 되는 [라우트 트레이싱(route tracing)](server-routing.md#trace_routes)을 활성화합니다.

## 코드에서 로거 접근하기 {id="access_logger"}
Logger 인스턴스는 [Logger](https://api.ktor.io/ktor-utils/io.ktor.util.logging/-logger/index.html) 인터페이스를 구현하는 클래스로 표현됩니다. `Application` 내부에서는 [Application.log](https://api.ktor.io/ktor-server-core/io.ktor.server.application/log.html) 프로퍼티를 사용하여 Logger 인스턴스에 접근할 수 있습니다. 예를 들어, 아래 코드 스니펫은 [모듈](server-modules.md) 내부에서 로그에 메시지를 추가하는 방법을 보여줍니다.

```kotlin
import io.ktor.server.application.*

fun Application.module() {
    log.info("Hello from module!")
}
```

또한 `call.application.environment.log` 프로퍼티를 사용하여 [ApplicationCall](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html)에서도 Logger에 접근할 수 있습니다.

```kotlin
routing {
    get("/api/v1") {
        call.application.environment.log.info("Hello from /api/v1!")
    }
}
```

## 플러그인 및 파일에서의 로깅 {id="plugins_and_files"}

플러그인과 파일 내부에서 애플리케이션 로그를 사용하는 것은 권장되지 않습니다. 각 플러그인이나 파일마다 별도의 로거를 사용하는 것이 좋습니다. 이를 위해 원하는 어떤 로깅 라이브러리든 사용할 수 있습니다.

멀티플랫폼 프로젝트의 경우 [KtorSimpleLogger](https://api.ktor.io/ktor-utils/io.ktor.util.logging/-ktor-simple-logger.html) 클래스를 사용할 수 있습니다:

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.util.logging.*

internal val LOGGER = KtorSimpleLogger("com.example.RequestTracePlugin")

val RequestTracePlugin = createRouteScopedPlugin("RequestTracePlugin", { }) {
    onCall { call ->
        LOGGER.trace("Processing call: ${call.request.uri}")
    }
}
```