[//]: # (title: Ktor 클라이언트의 로깅(Logging))

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-client-logging</code>
</p>
<var name="example_name" value="client-logging"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

로깅은 프로그램이 무엇을 하고 있는지 추적하고, 중요한 이벤트, 오류 또는 정보 메시지를 기록하여 문제를 진단하는 방법입니다.

Ktor는 [Logging](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging) 플러그인을 사용하여 HTTP 호출을 로깅하는 기능을 제공합니다. 이 플러그인은 플랫폼마다 다양한 로거(logger) 타입을 제공합니다.

> 서버에서 Ktor는 애플리케이션 로깅을 위한 [Logging](server-logging.md) 플러그인과 클라이언트 요청 로깅을 위한 [CallLogging](server-call-logging.md) 플러그인을 제공합니다.

## JVM

<snippet id="jvm-logging">
  <p>
    <a href="#jvm">JVM</a>에서 Ktor는 로깅을 위한 추상화 계층으로 Java용 단순 로깅 파사드(Simple Logging Facade for Java, <a href="http://www.slf4j.org/">SLF4J</a>)를 사용합니다. SLF4J는 로깅 API를 실제 로깅 구현체와 분리하여, 애플리케이션의 요구 사항에 가장 적합한 로깅 프레임워크를 통합할 수 있도록 해줍니다. 흔히 사용되는 선택지로는 <a href="https://logback.qos.ch/">Logback</a>이나 <a href="https://logging.apache.org/log4j">Log4j</a>가 있습니다. 프레임워크가 제공되지 않으면 SLF4J는 기본적으로 NOP(no-operation) 구현체를 사용하며, 이는 실질적으로 로깅을 비활성화합니다.
  </p>

  <p>
    로깅을 활성화하려면 <a href="https://logback.qos.ch/">Logback</a>과 같이 필요한 SLF4J 구현체가 포함된 아티팩트를 추가하세요:
  </p>
  <var name="group_id" value="ch.qos.logback"/>
  <var name="artifact_name" value="logback-classic"/>
  <var name="version" value="logback_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>
</snippet>

### Android

<p>
    Android에서는 SLF4J Android 라이브러리를 사용하는 것을 권장합니다:
</p>
 <var name="group_id" value="org.slf4j"/>
  <var name="artifact_name" value="slf4j-android"/>
  <var name="version" value="slf4j_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
    </TabItem>
</Tabs>

## Native

[Native 대상(targets)](client-engines.md#native)의 경우, `Logging` 플러그인은 모든 내용을 표준 출력 스트림(`STDOUT`)에 출력하는 로거를 제공합니다.

## 멀티플랫폼(Multiplatform)

[멀티플랫폼 프로젝트](client-create-multiplatform-application.md)에서는 [Napier](https://github.com/AAkira/Napier)와 같은 [사용자 정의 로거(custom logger)](#custom_logger)를 지정할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

`Logging` 플러그인을 추가하려면 빌드 스크립트에 다음 아티팩트를 포함하세요:

  <var name="artifact_name" value="ktor-client-logging"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>
  <tip>
      Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 정보는 <Links href="/ktor/client-dependencies" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아보세요.">클라이언트 의존성 추가하기</Links>에서 확인할 수 있습니다.
  </tip>

## 로깅 설치 {id="install_plugin"}

`Logging`을 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내부의 `install` 함수에 전달하세요:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
//...
val client = HttpClient(CIO) {
    install(Logging)
}
```

## 로깅 구성 {id="configure_plugin"}

`Logging` 플러그인 구성은 [Logging.Config](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging-config) 클래스에 의해 제공됩니다. 아래 예시는 구성 샘플을 보여줍니다:

`logger`
: 로거 인스턴스를 지정합니다. `Logger.DEFAULT`는 SLF4J 로깅 프레임워크를 사용합니다. Native 대상의 경우 이 속성을 `Logger.SIMPLE`로 설정하세요.

`level`
: 로깅 레벨을 지정합니다. `LogLevel.HEADERS`는 요청/응답 헤더만 로깅합니다.

`filter()`
: 지정된 조건식(predicate)과 일치하는 요청에 대해 로그 메시지를 필터링할 수 있게 해줍니다. 아래 예시에서는 `ktor.io`로 보내는 요청만 로그에 기록됩니다.

`sanitizeHeader()`
: 민감한 헤더의 값이 로그에 나타나지 않도록 가릴 수 있게 해줍니다. 아래 예시에서는 `Authorization` 헤더 값이 로깅될 때 '***'로 대체됩니다.

```kotlin
package com.example

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.HEADERS
                filter { request ->
                    request.url.host.contains("ktor.io")
                }
                sanitizeHeader { header -> header == HttpHeaders.Authorization }
            }
        }

        val response1: HttpResponse = client.get("https://ktor.io/")
        val response2: HttpResponse = client.get("https://jetbrains.com/")
    }
}
```

전체 예제는 [client-logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-logging)을 참조하세요.

### 사용자 정의 로거 제공 {id="custom_logger"}

클라이언트 애플리케이션에서 사용자 정의 로거를 사용하려면 `Logger` 인스턴스를 생성하고 `log` 함수를 오버라이드해야 합니다. 아래 예시는 [Napier](https://github.com/AAkira/Napier) 라이브러리를 사용하여 HTTP 호출을 로깅하는 방법을 보여줍니다:

```kotlin
package com.example

import io.github.aakira.napier.DebugAntilog
import io.github.aakira.napier.Napier
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = object: Logger {
                    override fun log(message: String) {
                        Napier.v("HTTP Client", null, message)
                    }
                }
                level = LogLevel.HEADERS
            }
        }.also { Napier.base(DebugAntilog()) }

        val response: HttpResponse = client.get("https://ktor.io/")
    }
}

```

전체 예제는 [client-logging-napier](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-logging-napier)를 참조하세요.