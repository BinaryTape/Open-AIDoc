[//]: # (title: 애플리케이션 모니터링)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="events"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor는 이벤트를 사용하여 서버 애플리케이션을 모니터링하는 기능을 제공합니다.
애플리케이션의 수명 주기(애플리케이션 시작, 중지 등)와 관련된 사전 정의된 이벤트를 처리하거나, 커스텀 이벤트를 사용하여 특정 상황을 처리할 수 있습니다. 또한 [MonitoringEvent](server-custom-plugins.md#handle-app-events) 훅을 사용하여 커스텀 플러그인에 대한 이벤트를 처리할 수도 있습니다.

## 이벤트 정의 {id="event-definition"}

각 이벤트는 [EventDefinition](https://api.ktor.io/ktor-events/io.ktor.events/-event-definition/index.html) 클래스 인스턴스로 표현됩니다. 이 클래스에는 이벤트에 전달되는 값의 타입을 지정하는 `T` 타입 매개변수가 있습니다. 이 값은 [이벤트 핸들러](#handle-events-application)에서 람다 인자로 접근할 수 있습니다. 예를 들어, 대부분의 [사전 정의된 이벤트](#predefined-events)는 이벤트 핸들러 내부에서 애플리케이션 프로퍼티에 접근할 수 있도록 `Application`을 매개변수로 받습니다.

[커스텀 이벤트](#custom-events)의 경우, 해당 이벤트에 필요한 타입 매개변수를 전달할 수 있습니다.
아래 코드 스니펫은 `ApplicationCall` 인스턴스를 받는 커스텀 `NotFoundEvent`를 생성하는 방법을 보여줍니다.

```kotlin
val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()
```

[커스텀 이벤트](#custom-events) 섹션에서는 서버가 리소스에 대해 `404 Not Found` 상태 코드를 반환할 때 커스텀 플러그인에서 이 이벤트를 발생시키는 방법을 보여줍니다.

### 사전 정의된 애플리케이션 이벤트 {id="predefined-events"}

Ktor는 애플리케이션의 수명 주기와 관련된 다음과 같은 사전 정의된 이벤트를 제공합니다.

- [ApplicationStarting](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-starting.html)
- [ApplicationStarted](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-started.html)
- [ServerReady](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-ready.html)
- [ApplicationStopPreparing](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stop-preparing.html)
- [ApplicationStopping](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stopping.html)
- [ApplicationStopped](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stopped.html)

예를 들어, 애플리케이션 리소스를 해제하기 위해 `ApplicationStopped` 이벤트를 구독할 수 있습니다.

## 애플리케이션에서 이벤트 처리하기 {id="handle-events-application"}

지정된 `Application` 인스턴스에 대한 이벤트를 처리하려면 `monitor` 프로퍼티를 사용합니다.
이 프로퍼티는 애플리케이션 이벤트를 처리할 수 있는 다음 함수들을 제공하는 [Events](https://api.ktor.io/ktor-events/io.ktor.events/-events/index.html) 인스턴스에 대한 접근을 제공합니다.

- `subscribe`: [EventDefinition](#event-definition)으로 지정된 이벤트를 구독합니다.
- `unsubscribe`: [EventDefinition](#event-definition)으로 지정된 이벤트에 대한 구독을 취소합니다.
- `raise`: 지정된 값을 사용하여 [EventDefinition](#event-definition)으로 지정된 이벤트를 발생시킵니다.
  > [커스텀 이벤트](#custom-events) 섹션에서 커스텀 이벤트를 발생시키는 방법을 설명합니다.

`subscribe` / `unsubscribe` 함수는 `T` 값을 람다 인자로 받는 `EventDefinition` 인스턴스를 허용합니다.
아래 예제는 `ApplicationStarted` 이벤트를 구독하고 이벤트 핸들러에서 메시지를 [로깅](server-logging.md)하는 방법을 보여줍니다.

```kotlin
fun Application.module() {
    monitor.subscribe(ApplicationStarted) { application ->
        application.environment.log.info("Server is started")
    }
}
```

다음 예제에서는 `ApplicationStopped` 이벤트를 처리하는 방법을 확인할 수 있습니다.

```kotlin
fun Application.module() {
    monitor.subscribe(ApplicationStopped) { application ->
        application.environment.log.info("Server is stopped")
        // 리소스를 해제하고 이벤트 구독을 취소합니다
        monitor.unsubscribe(ApplicationStarted) {}
        monitor.unsubscribe(ApplicationStopped) {}
    }
}
```

전체 예제는 [events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)를 참조하세요.

## 커스텀 플러그인에서 이벤트 처리하기 {id="handle-events-plugin"}

`MonitoringEvent` 훅을 사용하여 [커스텀 플러그인](server-custom-plugins.md#handle-app-events)에서 이벤트를 처리할 수 있습니다.
아래 예제는 `ApplicationMonitoringPlugin` 플러그인을 생성하고 `ApplicationStarted` 및 `ApplicationStopped` 이벤트를 처리하는 방법을 보여줍니다.

```kotlin
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
        // 리소스를 해제하고 이벤트 구독을 취소합니다
        application.monitor.unsubscribe(ApplicationStarted) {}
        application.monitor.unsubscribe(ApplicationStopped) {}
    }
}
```

전체 예제는 [events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)에서 확인할 수 있습니다.

## 커스텀 이벤트 {id="custom-events"}

이 섹션에서는 서버가 리소스에 대해 `404 Not Found` 상태 코드를 반환할 때 발생하는 커스텀 이벤트를 생성하는 방법을 살펴봅니다.

1. 먼저 [이벤트 정의](#event-definition)를 생성해야 합니다.
   아래 코드 스니펫은 `ApplicationCall`을 매개변수로 받는 커스텀 `NotFoundEvent` 이벤트를 생성하는 방법을 보여줍니다.

   ```kotlin
   val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()
   ```
2. 이벤트를 발생시키려면 `Events.raise` 함수를 호출합니다. 아래 샘플은 호출에 대한 상태 코드가 `404`인 경우 새로 생성된 이벤트를 발생시키기 위해 `ResponseSent` [훅](server-custom-plugins.md#other)을 처리하는 방법을 보여줍니다.

   ```kotlin
   import io.ktor.events.EventDefinition
   import io.ktor.http.*
   import io.ktor.server.application.*
   import io.ktor.server.application.hooks.*
   
   val ApplicationMonitoringPlugin = createApplicationPlugin(name = "ApplicationMonitoringPlugin") {
       on(ResponseSent) { call ->
           if (call.response.status() == HttpStatusCode.NotFound) {
               this@createApplicationPlugin.application.monitor.raise(NotFoundEvent, call)
           }
       }
   }
   ```
3. 생성된 이벤트를 Application에서 처리하려면 플러그인을 [설치(install)](server-plugins.md#install)합니다.

   ```kotlin
   fun Application.module() {
       install(ApplicationMonitoringPlugin)
   }
   ```

4. 그런 다음 `Events.subscribe`를 사용하여 이벤트를 구독합니다.

   ```kotlin
   fun Application.module() {
       install(ApplicationMonitoringPlugin)
       monitor.subscribe(NotFoundEvent) { call ->
           log.info("No page was found for the URI: ${call.request.uri}")
       }
   }
   ```

전체 예제는 [events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)를 참조하세요.