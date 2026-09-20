[//]: # (title: 커스텀 플러그인 - Base API)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin-base-api"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor는 여러 애플리케이션에서 재사용 가능한 기능을 구현하는 커스텀 [플러그인](server-plugins.md) 개발을 위한 Base API를 제공합니다.

Base API를 사용하면 다양한 [파이프라인](#pipelines) 단계를 가로채서(intercept) 요청 및 응답 처리에 커스텀 로직을 추가할 수 있습니다. 예를 들어, `Monitoring` 단계를 가로채서 들어오는 요청을 로깅하거나 메트릭을 수집할 수 있습니다.

## 플러그인 생성 {id="create"}

Base API로 커스텀 플러그인을 생성하려면 다음 단계를 따르세요:

1. 플러그인 클래스를 생성하고 플러그인 인터페이스를 구현하는 [컴패니언 객체(companion object)를 선언](#create-companion)합니다.
2. 컴패니언 객체에서 `key` 속성과 `install()` 함수를 [구현](#implement)합니다.
3. [플러그인 구성(configuration)](#plugin-configuration)을 제공합니다.
4. 필요한 파이프라인 단계를 가로채어 [호출을 처리(handle calls)](#call-handling)합니다.
5. [플러그인을 설치](#install)합니다.

### 컴패니언 객체 생성 {id="create-companion"}

커스텀 플러그인의 클래스는 다음 인터페이스 중 하나를 구현하는 컴패니언 객체를 가져야 합니다:

* 애플리케이션 레벨 플러그인을 위한 [`BaseApplicationPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-application-plugin/index.html).
* [특정 라우트에 설치](server-plugins.md#install-route)되는 플러그인을 위한 [`BaseRouteScopedPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-route-scoped-plugin/index.html).

`BaseApplicationPlugin` 인터페이스는 다음 타입 매개변수를 받습니다:

* 플러그인이 지원하는 파이프라인 타입.
* 플러그인의 [구성 타입](#plugin-configuration).
* 플러그인 인스턴스 타입.

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        // ...
    }
}
```

### 'key' 속성 및 'install()' 함수 구현 {id="implement"}

`BaseApplicationPlugin`을 구현하는 컴패니언 객체는 다음을 정의해야 합니다:

* `key` 속성은 플러그인을 식별합니다. Ktor는 플러그인 인스턴스를 애플리케이션 속성(attribute)에 저장하며, 이 키를 사용하여 플러그인 인스턴스에 접근합니다.
* `install()` 함수는 플러그인을 구성합니다. 이 함수에서 필요한 파이프라인 단계를 가로채고 플러그인 인스턴스를 반환합니다. 파이프라인 단계를 가로채는 방법은 [호출 처리](#call-handling) 섹션에서 설명합니다.

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val plugin = CustomHeader()
            // Intercept a pipeline ...
            return plugin
        }
    }
}
```

### 호출 처리 {id="call-handling"}

커스텀 플러그인에서는 [기존 파이프라인 단계](#pipelines) 또는 새로 정의된 단계를 가로채서 요청과 응답을 처리할 수 있습니다. 예를 들어, [Authentication](server-auth.md) 플러그인은 기본 파이프라인에 `Authenticate` 및 `Challenge` 커스텀 단계를 추가합니다.

특정 단계를 가로채면 호출 처리의 특정 단계에 접근할 수 있습니다:

* `ApplicationCallPipeline.Monitoring`: 요청 로깅, 메트릭, 트레이싱 및 이와 유사한 모니터링 작업에 이 단계를 사용합니다.
* `ApplicationCallPipeline.Plugins`: 호출을 처리하거나 커스텀 헤더를 추가하는 등 응답 매개변수를 수정하는 데 이 단계를 사용합니다.
* `ApplicationReceivePipeline.Transform` 및 `ApplicationSendPipeline.Transform`: 클라이언트로부터 수신한 데이터를 가져와 [변환](#transform)하거나 클라이언트로 전송할 데이터를 변환하는 데 이 단계를 사용합니다.

다음 예제는 `ApplicationCallPipeline.Plugins` 단계를 가로채서 각 응답에 커스텀 헤더를 추가합니다:

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val plugin = CustomHeader()
            pipeline.intercept(ApplicationCallPipeline.Plugins) {
                call.response.header("X-Custom-Header", "Hello, world!")
            }
            return plugin
        }
    }
}
```

이 예제에서는 헤더 이름과 값이 하드코딩되어 있습니다. 플러그인을 재사용할 수 있게 만들려면 사용자가 헤더 이름과 값을 지정할 수 있도록 [구성을 제공](#plugin-configuration)하세요.

> 커스텀 플러그인은 호출과 관련된 값을 서로 다른 핸들러 간에 공유할 수 있습니다. 자세한 내용은 [호출 상태 공유](server-custom-plugins.md#call-state)를 참고하세요.
>
{style="tip"}

### 플러그인 구성 제공 {id="plugin-configuration"}

[이전 섹션](#call-handling)에서는 각 응답에 미리 정의된 커스텀 헤더를 추가하는 플러그인을 만드는 방법을 살펴보았습니다. 이 플러그인을 재사용 가능하게 만들려면 사용자가 헤더 이름과 값을 지정할 수 있는 구성을 정의합니다.

먼저 플러그인 클래스 내부에 구성 클래스를 정의합니다:

```kotlin
class Configuration {
    var headerName = "Custom-Header-Name"
    var headerValue = "Default value"
}
```

플러그인 설치 중에 플러그인 구성 속성을 업데이트할 수 있습니다. 플러그인이 인터셉터에서 이러한 값을 사용하는 경우, `install()` 함수 내부의 로컬 변수에 저장하세요:

```kotlin
class CustomHeader(configuration: Configuration) {
    private val name = configuration.headerName
    private val value = configuration.headerValue

    class Configuration {
        var headerName = "Custom-Header-Name"
        var headerValue = "Default value"
    }
}
```

그 다음, `install()` 함수에서 구성을 읽고 해당 속성을 사용합니다:

```kotlin
class CustomHeader(configuration: Configuration) {
    private val name = configuration.headerName
    private val value = configuration.headerValue

    class Configuration {
        var headerName = "Custom-Header-Name"
        var headerValue = "Default value"
    }

    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val configuration = Configuration().apply(configure)
            val plugin = CustomHeader(configuration)
            pipeline.intercept(ApplicationCallPipeline.Plugins) {
                call.response.header(plugin.name, plugin.value)
            }
            return plugin
        }
    }
}
```

### 플러그인 설치 {id="install"}

애플리케이션에 커스텀 플러그인을 [설치](server-plugins.md#install)하려면 `Application.install()` 함수를 호출하고 필요한 [구성](#plugin-configuration) 매개변수를 전달합니다:

```kotlin
install(CustomHeader) {
    headerName = "X-Custom-Header"
    headerValue = "Hello, world!"
}
```

## 예제 {id="examples"}

다음 예제는 Base API로 빌드된 몇 가지 커스텀 플러그인을 보여줍니다.

> 전체 실행 가능한 프로젝트는 [custom-plugin-base-api](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-base-api)를 참고하세요.
>
{style="tip"}

### 요청 로깅 {id="request-logging"}

다음 예제는 들어오는 요청을 로깅하는 커스텀 플러그인을 생성합니다:

```kotlin
package com.example.plugins

import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.util.*

class RequestLogging {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, RequestLogging> {
        override val key = AttributeKey<RequestLogging>("RequestLogging")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): RequestLogging {
            val plugin = RequestLogging()
            pipeline.intercept(ApplicationCallPipeline.Monitoring) {
                call.request.origin.apply {
                    println("Request URL: $scheme://$localHost:$localPort$uri")
                }
            }
            return plugin
        }
    }
}

```

### 커스텀 헤더 {id="custom-header"}

다음 예제는 각 응답에 커스텀 헤더를 추가하는 플러그인을 생성합니다:

```kotlin
package com.example.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.util.*

class CustomHeader(configuration: Configuration) {
    private val name = configuration.headerName
    private val value = configuration.headerValue

    class Configuration {
        var headerName = "Custom-Header-Name"
        var headerValue = "Default value"
    }

    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val configuration = Configuration().apply(configure)
            val plugin = CustomHeader(configuration)
            pipeline.intercept(ApplicationCallPipeline.Plugins) {
                call.response.header(plugin.name, plugin.value)
            }
            return plugin
        }
    }
}

```

### 본문 변환 {id="transform"}

다음 예제는 요청 및 응답 본문을 변환하는 플러그인을 생성합니다:

```kotlin
package com.example.plugins

import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.util.*
import io.ktor.utils.io.*

class DataTransformation {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, DataTransformation> {
        override val key = AttributeKey<DataTransformation>("DataTransformation")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): DataTransformation {
            val plugin = DataTransformation()
            pipeline.receivePipeline.intercept(ApplicationReceivePipeline.Transform) { data ->
                val newValue = (data as ByteReadChannel).readLine()?.toInt()?.plus(1)
                if (newValue != null) {
                    proceedWith(newValue)
                }
            }
            pipeline.sendPipeline.intercept(ApplicationSendPipeline.Transform) { data ->
                if (subject is Int) {
                    val newValue = data.toString().toInt() + 1
                    proceedWith(newValue.toString())
                }
            }
            return plugin
        }
    }
}

```

## 파이프라인 {id="pipelines"}

Ktor에서 [`Pipeline`](https://api.ktor.io/ktor-utils/io.ktor.util.pipeline/-pipeline/index.html)은 하나 이상의 정렬된 단계(phase)로 그룹화된 인터셉터들의 모음입니다. 각 인터셉터는 요청 처리가 계속되기 전후에 커스텀 로직을 실행할 수 있습니다.

[`ApplicationCallPipeline`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call-pipeline/index.html)은 애플리케이션 호출을 실행합니다. 이 파이프라인은 다음 단계를 정의합니다:

* `Setup`: 처리를 위해 호출 및 해당 속성을 준비합니다.
* `Monitoring`: 호출을 추적합니다. 요청 로깅, 메트릭, 에러 처리 및 이와 유사한 작업에 이 단계를 사용합니다.
* `Plugins`: 호출을 처리합니다. 대부분의 플러그인이 이 단계를 가로챕니다.
* `Call`: 호출을 완료합니다.
* `Fallback`: 이전 단계에서 처리되지 않은 호출을 처리합니다.

## 파이프라인 단계와 새 API 핸들러의 매핑 {id="mapping"}

단순화된 [커스텀 플러그인 API](server-custom-plugins.md)를 사용하여 커스텀 플러그인을 생성할 수 있습니다. 대부분의 경우 이 API는 파이프라인이나 단계(phase)와 같은 Ktor의 내부 개념에 대한 직접적인 지식을 요구하지 않습니다. 대신 [요청 및 응답 처리](server-custom-plugins.md#call-handling)의 여러 단계를 위해 `onCall()`, `onCallReceive()`, `onCallRespond()`와 같은 핸들러를 제공합니다.

다음 표는 Base API 파이프라인 단계가 단순화된 API 핸들러와 어떻게 매핑되는지 보여줍니다:

| Base API                               | 새 API                                                              |
|----------------------------------------|---------------------------------------------------------------------|
| `ApplicationCallPipeline.Setup` 이전     | [`on(CallFailed)`](server-custom-plugins.md#other)                  |
| `ApplicationCallPipeline.Setup`        | [`on(CallSetup)`](server-custom-plugins.md#other)                   |
| `ApplicationCallPipeline.Plugins`      | [`onCall()`](server-custom-plugins.md#on-call)                      |
| `ApplicationCallPipeline.Call`         | [`onCallValidators()`](server-custom-plugins.md#on-call-validators) |
| `ApplicationReceivePipeline.Transform` | [`onCallReceive()`](server-custom-plugins.md#on-call-receive)       |
| `ApplicationSendPipeline.Transform`    | [`onCallRespond()`](server-custom-plugins.md#on-call-respond)       |
| `ApplicationSendPipeline.After`        | [`on(ResponseBodyReadyForSend)`](server-custom-plugins.md#other)    |
| `ApplicationSendPipeline.Engine`       | [`on(ResponseSent)`](server-custom-plugins.md#other)                |
| `Authentication.ChallengePhase` 이후      | [`on(AuthenticationChecked)`](server-custom-plugins.md#other)       |