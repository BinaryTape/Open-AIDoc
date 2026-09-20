[//]: # (title: 커스텀 서버 플러그인)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
자신만의 커스텀 플러그인을 만드는 방법을 알아봅니다.
</link-summary>

Ktor를 사용하면 자신만의 커스텀 [플러그인(plugins)](server-plugins.md)을 만들 수 있습니다. 일반적으로 이 API는 파이프라인(pipelines)이나 페이즈(phases)와 같은 Ktor 내부 개념에 대한 이해를 필요로 하지 않습니다. 대신 `onCall()`, `onCallReceive()`, `onCallRespond()`와 같은 핸들러를 사용하여 [요청 및 응답 처리](#call-handling)의 다양한 단계에 접근할 수 있습니다.

## 첫 번째 플러그인 생성 및 설치 {id="first-plugin"}

이 섹션에서는 첫 번째 플러그인을 생성하고 설치하는 방법을 알아봅니다.

[Ktor 프로젝트 생성, 열기 및 실행](server-create-a-new-project.topic) 튜토리얼에서 생성한 애플리케이션을 시작 프로젝트로 사용할 수 있습니다.

1. 플러그인을 생성하려면 [`createApplicationPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-application-plugin.html) 함수를 호출하고 플러그인 이름을 지정합니다.

   ```kotlin
   import io.ktor.server.application.*
   
   val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
       println("SimplePlugin is installed!")
   }
   ```

   이 함수는 애플리케이션에 설치할 수 있는 `ApplicationPlugin` 인스턴스를 반환합니다.
   
   > [특정 라우트에 설치](server-plugins.md#install-route)할 수 있는 플러그인을 만들기 위해 [`createRouteScopedPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-route-scoped-plugin.html) 함수를 사용할 수도 있습니다.
   >
   {style="tip"}

2. [플러그인을 설치](server-plugins.md#install)하려면 애플리케이션 초기화 코드에서 생성된 `ApplicationPlugin` 인스턴스를 `Application.install()` 함수에 전달합니다.

   ```kotlin
   fun Application.module() {
       install(SimplePlugin)
   }
   ```

3. 애플리케이션을 [실행](server-run.md)하여 콘솔 출력에서 플러그인 메시지를 확인합니다.

   ```Bash
   2021-10-14 14:54:08.269 [main] INFO  Application - Autoreload is disabled because the development mode is off.
   SimplePlugin is installed!
   2021-10-14 14:54:08.900 [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```

> 전체 예제는 [SimplePlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/SimplePlugin.kt)를 참조하십시오.
> 
{style="tip"}

## 콜 처리 {id="call-handling"}

커스텀 플러그인에서는 콜(call)의 다양한 단계에 대한 접근을 제공하는 핸들러 세트를 사용하여 [요청](server-requests.md)과 [응답](server-responses.md)을 처리할 수 있습니다.

* [`onCall()`](#on-call)을 사용하면 요청 및 응답 정보에 접근하고 헤더와 같은 응답 파라미터를 수정할 수 있습니다.
* [`onCallValidators()`](#on-call-validators)를 사용하면 콜 유효성 검증을 수행할 수 있습니다. 라우트 스코프 플러그인의 경우 유효성 검증기(validator)는 라우트 중첩 구조에 따라 실행됩니다.
* [`onCallReceive()`](#on-call-receive)를 사용하면 클라이언트로부터 받은 데이터를 변환할 수 있습니다.
* [`onCallRespond()`](#on-call-respond)를 사용하면 클라이언트에 보내기 전에 데이터를 변환할 수 있습니다.
* [`on()`](#other)을 사용하면 콜 처리의 다른 단계나 콜 도중 발생하는 예외를 위한 특정 훅(hook)을 처리할 수 있습니다.

또한 `call.attributes`를 사용하여 핸들러 간에 [콜 상태를 공유](#call-state)할 수도 있습니다.

### `onCall()` {id="on-call"}

`onCall()` 핸들러는 `ApplicationCall`을 람다 인자로 받습니다. 이를 통해 요청 및 응답 정보에 접근하고 [커스텀 헤더 추가](#custom-header)와 같은 응답 파라미터를 수정할 수 있습니다.

요청 또는 응답 바디를 변환하려면 [`onCallReceive()`](#on-call-receive) 및 [`onCallRespond()`](#on-call-respond)를 사용하십시오.

#### 예제 1: 요청 로깅 {id="request-logging"}

다음 예제는 `onCall()`을 사용하여 들어오는 요청 URL을 로깅하는 플러그인을 만듭니다.

```kotlin
val RequestLoggingPlugin = createApplicationPlugin(name = "RequestLoggingPlugin") {
    onCall { call ->
        call.request.origin.apply {
            println("Request URL: $scheme://$localHost:$localPort$uri")
        }
    }
}
```

이 플러그인을 설치하면 요청된 URL을 콘솔에 출력합니다.

```Bash
Request URL: http://0.0.0.0:8080/
Request URL: http://0.0.0.0:8080/index
```

#### 예제 2: 커스텀 헤더 추가 {id="custom-header"}

다음 예제는 각 응답에 커스텀 헤더를 추가하는 플러그인을 만듭니다.

```kotlin
val CustomHeaderPlugin = createApplicationPlugin(name = "CustomHeaderPlugin") {
    onCall { call ->
        call.response.headers.append("X-Custom-Header", "Hello, world!")
    }
}
```

결과 응답에는 커스텀 헤더가 포함됩니다.

```HTTP
HTTP/1.1 200 OK
X-Custom-Header: Hello, world!
```

이 예제에서는 헤더 이름과 값이 하드코딩되어 있습니다. 이를 설정 가능하도록 만들려면 [플러그인 구성](#plugin-configuration)을 제공하십시오.

### `onCallReceive()` {id="on-call-receive"}

`onCallReceive()` 핸들러를 사용하면 클라이언트로부터 받은 데이터를 변환할 수 있습니다. 핸들러 내부에서 `transformBody()`를 호출하여 요청 바디가 `call.receive()`에 전달되기 전에 변환할 수 있습니다.

클라이언트가 바디에 `text/plain`으로 `10`을 포함하는 다음과 같은 `POST` 요청을 보낸다고 가정해 보겠습니다.

```HTTP
POST http://localhost:8080/transform-data
Content-Type: text/plain

10

```

이 [바디를 정수 값으로 받으려면](server-requests.md#objects) `POST` 요청에 대한 라우트 핸들러를 만들고 `Int` 파라미터와 함께 `call.receive()`를 호출해야 합니다.

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
}
```

다음 플러그인은 바디를 정수 값으로 받아 여기에 `1`을 더합니다.

```kotlin
val DataTransformationPlugin = createApplicationPlugin(name = "DataTransformationPlugin") {
    onCallReceive { call ->
        transformBody { data ->
            if (requestedType?.type == Int::class) {
                val line = data.readLine() ?: "1"
                line.toInt() + 1
            } else {
                data
            }
        }
    }
}
```

위 예제에서:

* `TransformBodyContext`는 [람다 수신 객체(lambda receiver)](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)입니다. 이 객체의 `requestedType` 속성에는 `call.receive()`에서 요청한 타입에 대한 정보가 포함되어 있습니다.
* `data` 인자에는 현재 요청 바디가 포함되어 있습니다. 이 경우 [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)이며, `ByteReadChannel.readLine()`이 해당 내용을 읽습니다.
* 요청된 타입이 `Int`인 경우 플러그인은 수신된 값을 정수로 변환하고 `1`을 더한 다음 변환된 값을 반환합니다. 그렇지 않은 경우 바디를 변경하지 않고 그대로 반환합니다.

> 전체 예제는 [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)를 참조하십시오.
>
{style="tip"}

### `onCallRespond()` {id="on-call-respond"}

`onCallRespond()` 핸들러를 사용하면 클라이언트에 데이터를 보내기 전에 변환할 수 있습니다.
이 핸들러는 라우트 핸들러에서 `call.respond` 함수가 호출될 때 실행됩니다.

예를 들어 다음과 같은 라우트를 고려해 보겠습니다.

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
    call.respond(data)
}
```

`call.respond`를 호출하면 `onCallRespond()`가 호출되며, 결과적으로 클라이언트에 전송될 데이터를 변환할 수 있습니다.

`onCallRespond()` 내부에서 `transformBody()`를 사용하여 응답 바디를 변환합니다. 다음 예제는 정수 응답에 `1`을 더하고 문자열로 변환합니다.

```kotlin
onCallRespond { call ->
    transformBody { data ->
        if (data is Int) {
            (data + 1).toString()
        } else {
            data
        }
    }
}
```

> 전체 예제는 [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)를 참조하십시오.
>
{style="tip"}

### `onCallValidators()` {id="on-call-validators"}

`onCallValidators()` 핸들러를 사용하면 들어오는 각 콜에 대해 유효성 검증을 수행할 수 있습니다.

중첩된 라우트에 여러 유효성 검증기가 적용된 경우, 상위 라우트의 검증기가 하위 라우트의 검증기보다 먼저 실행됩니다. 이를 통해 검증기는 인증된 주체(principal)와 같이 라우트 계층 구조의 앞선 단계에서 생성된 정보를 활용할 수 있습니다.

예를 들어 다음 라우트 스코프 플러그인은 인증 라우트에서 제공된 주체에 접근할 수 있습니다.

```kotlin
package com.example.plugins

import io.ktor.server.application.*
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.principal

val UserValidationPlugin = createRouteScopedPlugin("UserValidationPlugin") {
    onCallValidators { call ->
        val principal = call.principal<UserIdPrincipal>()

        if (principal != null) {
            call.application.log.info("Validating request for ${principal.name}")
        }
    }
}

```

인증 이후에 실행되도록 하려면 인증된 라우트 내부에 플러그인을 설치합니다.

```kotlin
routing {
    authenticate("auth") {
        install(UserValidationPlugin)
        get("/api") {
            call.respondText("OK")
        }
    }
}
```

라우트 스코프 유효성 검증의 순서가 중요한 경우 `onCallValidators()`를 사용하십시오. 다른 검증기에 의존하지 않는 일반적인 요청 및 응답 처리에는 대신 `onCall()`을 사용하십시오.

### 기타 유용한 핸들러 {id="other"}

위에서 설명한 콜 핸들러 외에도 Ktor는 콜 처리의 다른 단계를 다루기 위한 일련의 훅을 제공합니다. 특정 `Hook`에 대한 핸들러를 등록하려면 `on()` 함수를 사용하십시오.

사용 가능한 훅은 다음과 같습니다.

- `CallSetup`: 콜 처리가 시작될 때 호출됩니다.
- `ResponseBodyReadyForSend`: 응답 바디가 모든 변환을 거쳐 전송될 준비가 되었을 때 호출됩니다.
- `ResponseSent`: 응답이 클라이언트에 성공적으로 전송된 후 호출됩니다.
- `CallFailed`: 콜 처리가 예외와 함께 실패했을 때 호출됩니다.
- [`AuthenticationChecked`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-checked/index.html): [인증](server-auth.md) 자격 증명이 확인된 후 호출됩니다. 이 훅을 사용하여 인가(authorization)를 구현할 수 있습니다. 예제는 [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization)을 참조하십시오.

다음 예제는 `CallSetup` 훅을 처리합니다.

```kotlin
on(CallSetup) { call->
    // ...
}
```

> 애플리케이션 시작 또는 종료와 같은 [애플리케이션 이벤트를 처리](#handle-app-events)하기 위해 `MonitoringEvent`를 사용할 수도 있습니다.
> 
{style="tip"}

### 콜 상태 공유 {id="call-state"}

커스텀 플러그인은 서로 다른 핸들러 간에 콜과 연관된 값을 공유할 수 있습니다.
이러한 값은 고유한 `AttributeKey`를 사용하여 `call.attributes` 컬렉션에 저장됩니다.

다음 예제는 `onCall()`이 호출된 시간을 저장하고, `onCallReceive()`에서 이를 사용하여 요청 바디를 읽기 전까지의 지연 시간을 계산합니다.

```kotlin
val DataTransformationBenchmarkPlugin = createApplicationPlugin(name = "DataTransformationBenchmarkPlugin") {
    val onCallTimeKey = AttributeKey<Long>("onCallTimeKey")
    onCall { call ->
        val onCallTime = System.currentTimeMillis()
        call.attributes.put(onCallTimeKey, onCallTime)
    }

    onCallReceive { call ->
        val onCallTime = call.attributes[onCallTimeKey]
        val onCallReceiveTime = System.currentTimeMillis()
        println("Read body delay (ms): ${onCallReceiveTime - onCallTime}")
    }
}
```

`POST` 요청을 보내면 플러그인이 콘솔에 지연 시간을 출력합니다.

```Bash
Request URL: http://localhost:8080/transform-data
Read body delay (ms): 52
```

> 전체 예제는 [DataTransformationBenchmarkPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationBenchmarkPlugin.kt)를 참조하십시오.
>
{style="tip"}

> [라우트 핸들러](server-requests.md#request_information)에서도 콜 속성에 접근할 수 있습니다.
> 
{style="tip"}

## 애플리케이션 이벤트 처리 {id="handle-app-events"}

[`on()`](#other) 핸들러는 애플리케이션의 생명 주기와 관련된 이벤트를 처리하기 위해 `MonitoringEvent` 훅을 사용하는 기능을 제공합니다.

Ktor는 다음과 같은 [사전 정의된 이벤트](server-events.md#predefined-events)를 `on()` 핸들러에 제공합니다.

- `ApplicationStarting`
- `ApplicationStarted`
- `ApplicationStopPreparing`
- `ApplicationStopping`
- `ApplicationStopped`

다음 예제는 `ApplicationStopped` 이벤트를 사용하여 애플리케이션 종료를 처리합니다.

```kotlin
package com.example.plugins

import io.ktor.events.EventDefinition
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.application.hooks.*

val ApplicationMonitoringPlugin = createApplicationPlugin(name = "ApplicationMonitoringPlugin") {
    on(MonitoringEvent(ApplicationStarted)) { application ->
        application.log.info("Server is started")
    }
    on(MonitoringEvent(ApplicationStopped)) { application ->
        application.log.info("Server is stopped")
        // 리소스 해제 및 이벤트 구독 취소
        application.monitor.unsubscribe(ApplicationStarted) {}
        application.monitor.unsubscribe(ApplicationStopped) {}
    }
    on(ResponseSent) { call ->
        if (call.response.status() == HttpStatusCode.NotFound) {
            this@createApplicationPlugin.application.monitor.raise(NotFoundEvent, call)
        }
    }
}

val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()

```

이 접근 방식은 연결 닫기, 백그라운드 작업 중지, 버퍼링된 데이터 플러시와 같이 플러그인이 소유한 리소스를 정리하는 데 유용합니다.

## 플러그인 구성 제공 {id="plugin-configuration"}

[커스텀 헤더](#custom-header) 예제는 각 응답에 사전 정의된 헤더를 추가하는 플러그인을 생성했습니다.
이 플러그인을 재사용할 수 있도록 하려면 사용자가 헤더 이름과 값을 지정할 수 있는 구성을 정의하십시오.

1. 구성 클래스를 정의합니다.

   ```kotlin
   class PluginConfiguration {
       var headerName: String = "Custom-Header-Name"
       var headerValue: String = "Default value"
   }
   ```

2. `createApplicationPlugin()`에 구성 클래스 참조를 전달합니다.

   ```kotlin
   val CustomHeaderPlugin = createApplicationPlugin(
       name = "CustomHeaderPlugin",
       createConfiguration = ::PluginConfiguration
   ) {
       val headerName = pluginConfig.headerName
       val headerValue = pluginConfig.headerValue
       pluginConfig.apply {
           onCall { call ->
               call.response.headers.append(headerName, headerValue)
           }
       }
   }
   ```

   플러그인 구성 속성은 플러그인 설치 중에 변경 가능합니다. 플러그인이 핸들러에서 이 값들을 사용하는 경우 플러그인 바디 내부의 로컬 변수에 저장하십시오.

3. 플러그인을 설치하고 구성합니다.

   ```kotlin
   install(CustomHeaderPlugin) {
       headerName = "X-Custom-Header"
       headerValue = "Hello, world!"
   }
   ```

> 전체 예제는 [CustomHeaderPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPlugin.kt)를 참조하십시오.
>
{style="tip"}

### 파일에서의 구성 {id="configuration-file"}

Ktor는 [구성 파일](server-create-and-configure.topic#engine-main)에서 플러그인 설정을 불러올 수 있습니다.

다음 예제는 파일에서 `CustomHeaderPlugin`을 구성하는 방법을 보여줍니다.

1. `application.conf` 또는 `application.yaml` 파일에 플러그인 설정을 포함하는 새 그룹을 추가합니다.

   <Tabs group="config">
   <TabItem title="application.conf" group-key="hocon">

   ```shell
   http {
       custom_header {
           header_name = X-Another-Custom-Header
           header_value = Some value
       }
   }
   ```

   </TabItem>
   <TabItem title="application.yaml" group-key="yaml">

   ```yaml
   http:
     custom_header:
       header_name: X-Another-Custom-Header
       header_value: Some value
   ```

   </TabItem>
   </Tabs>

   이 예제에서 플러그인 설정은 `http.custom_header` 그룹에 저장됩니다.

2. 구성 파일 속성에 접근하려면 구성 클래스 생성자에 `ApplicationConfig`를 전달합니다.
   `tryGetString()` 함수는 지정된 속성의 값을 반환합니다.

   ```kotlin
   class CustomHeaderConfiguration(config: ApplicationConfig) {
       var headerName: String = config.tryGetString("header_name") ?: "Custom-Header-Name"
       var headerValue: String = config.tryGetString("header_value") ?: "Default value"
   }
   ```

3. `createApplicationPlugin()` 함수의 `configurationPath` 파라미터에 `http.custom_header` 값을 할당합니다.

   ```kotlin
   val CustomHeaderPluginConfigurable = createApplicationPlugin(
       name = "CustomHeaderPluginConfigurable",
       configurationPath = "http.custom_header",
       createConfiguration = ::CustomHeaderConfiguration
   ) {
       val headerName = pluginConfig.headerName
       val headerValue = pluginConfig.headerValue
       pluginConfig.apply {
           onCall { call ->
               call.response.headers.append(headerName, headerValue)
           }
       }
   }
   ```

> 전체 예제는 [CustomHeaderPluginConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPluginConfigurable.kt)를 참조하십시오.
>
{style="tip"}

## 애플리케이션 설정 접근 {id="app-settings"}

커스텀 플러그인은 플러그인 바디에서 애플리케이션 수준의 설정에 접근할 수 있습니다. 이는 플러그인의 동작이 서버 구성이나 환경에 따라 달라질 때 유용합니다.

### 구성 {id="config"}

서버 구성에 접근하려면 `applicationConfig` 속성을 사용하십시오. 이 속성은 [`ApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-application-config/index.html) 인스턴스를 반환합니다.

다음 예제는 서버에서 사용 중인 호스트와 포트를 읽습니다.

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val host = applicationConfig?.host
   val port = applicationConfig?.port
   println("Listening on $host:$port")
}
```

### 환경 {id="environment"}

애플리케이션의 환경에 접근하려면 `environment` 속성을 사용하십시오. 예를 들어 [개발 모드](server-development-mode.topic)가 활성화되어 있는지 확인할 수 있습니다.

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val isDevMode = environment?.developmentMode
   onCall { call ->
      if (isDevMode == true) {
         println("handling request ${call.request.uri}")
      }
   }
}
```

## 기타 {id="misc"}

### 플러그인 상태 저장 {id="plugin-state"}

플러그인은 플러그인 바디에서 값을 캡처하고 핸들러 람다에서 사용하여 상태를 저장할 수 있습니다.

플러그인은 여러 콜을 동시에 처리할 수 있으므로, 동시성 컬렉션이나 원자적(atomic) 타입과 같이 스레드로부터 안전한 구조에 공유 가변 상태를 저장하십시오.

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val activeRequests = AtomicInteger(0)
   onCall {
      activeRequests.incrementAndGet()
   }
   onCallRespond {
      activeRequests.decrementAndGet()
   }
}
```

### 데이터베이스 {id="databases"}

#### 중단 가능한(suspending) 데이터베이스 API 사용 {id="use-suspending-database-apis"}

모든 커스텀 플러그인 핸들러는 중단 함수(suspending functions)입니다. 즉, 핸들러에서 중단 가능한 데이터베이스 API를 직접 호출할 수 있습니다.

특정 콜에 스코프가 지정된 리소스는 반드시 해제해야 합니다. 예를 들어 [`on(ResponseSent)`](#other)를 사용하여 응답이 전송된 후 리소스를 정리할 수 있습니다.

#### 블로킹 데이터베이스 API 사용 {id="use-blocking-database-apis"}

Ktor는 코루틴을 사용하므로 블로킹 데이터베이스 호출을 기본 코루틴 디스패처에서 실행해서는 안 됩니다. 블로킹 호출은 스레드를 점유하여 다른 코루틴의 진행을 방해할 수 있습니다.

블로킹 데이터베이스 API를 호출하려면 블로킹 작업을 위한 별도의 [`CoroutineContext`](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)를 생성하십시오.

```kotlin
val databaseContext = Dispatchers.IO
```

그런 다음 각 블로킹 데이터베이스 호출을 `withContext()`로 감쌉니다.

```kotlin
onCall {
   withContext(databaseContext) {
       database.access(...) // 데이터베이스 호출
   }
}