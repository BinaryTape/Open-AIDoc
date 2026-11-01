[//]: # (title: 应用程序监控)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="events"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 提供了通过使用事件来监控服务器应用程序的功能。
你可以处理与应用程序生命周期相关的预定义事件（应用程序启动、停止等），也可以使用自定义事件来处理特定情况。你还可以使用 [MonitoringEvent](server-custom-plugins.md#handle-app-events) 钩子来处理自定义插件的事件。

## 事件定义 {id="event-definition"}

每个事件均由 [EventDefinition](https://api.ktor.io/ktor-events/io.ktor.events/-event-definition/index.html) 类实例表示。该类包含一个 `T` 类型形参，用于指定传递给事件的值的类型。此值可以在[事件处理程序](#handle-events-application)中作为 lambda 实参进行访问。例如，大多数[预定义事件](#predefined-events)都接受 `Application` 作为形参，允许你在事件处理程序内部访问应用程序属性。

对于[自定义事件](#custom-events)，你可以传递该事件所需的类型形参。
以下代码段展示了如何创建接受 `ApplicationCall` 实例的自定义 `NotFoundEvent`。

```kotlin
val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()
```

[自定义事件](#custom-events)部分展示了当服务器针对某资源返回 `404 Not Found` 状态码时，如何在自定义插件中引发该事件。

### 预定义应用程序事件 {id="predefined-events"}

Ktor 提供了以下与应用程序生命周期相关的预定义事件：

- [ApplicationStarting](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-starting.html)
- [ApplicationStarted](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-started.html)
- [ServerReady](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-ready.html)
- [ApplicationStopPreparing](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stop-preparing.html)
- [ApplicationStopping](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stopping.html)
- [ApplicationStopped](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stopped.html)

例如，你可以订阅 `ApplicationStopped` 事件以释放应用程序资源。

## 在应用程序中处理事件 {id="handle-events-application"}

要处理指定 `Application` 实例的事件，请使用 `monitor` 属性。
该属性提供了对 [Events](https://api.ktor.io/ktor-events/io.ktor.events/-events/index.html) 实例的访问，该实例公开了以下允许你处理应用程序事件的函数：

- `subscribe`：订阅由 [EventDefinition](#event-definition) 指定的事件。
- `unsubscribe`：取消订阅由 [EventDefinition](#event-definition) 指定的事件。
- `raise`：使用指定的值引发由 [EventDefinition](#event-definition) 指定的事件。
  > [自定义事件](#custom-events)部分展示了如何引发自定义事件。

`subscribe` / `unsubscribe` 函数接受带有 `T` 值的 `EventDefinition` 实例作为 lambda 实参。
以下示例展示了如何订阅 `ApplicationStarted` 事件并在事件处理程序中[记录日志](server-logging.md)：

```kotlin
fun Application.module() {
    monitor.subscribe(ApplicationStarted) { application ->
        application.environment.log.info("Server is started")
    }
}
```

在此示例中，你可以了解如何处理 `ApplicationStopped` 事件：

```kotlin
fun Application.module() {
    monitor.subscribe(ApplicationStopped) { application ->
        application.environment.log.info("Server is stopped")
        // 释放资源并取消订阅事件
        monitor.unsubscribe(ApplicationStarted) {}
        monitor.unsubscribe(ApplicationStopped) {}
    }
}
```

有关完整示例，请参阅 [events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)。

## 在自定义插件中处理事件 {id="handle-events-plugin"}

你可以使用 `MonitoringEvent` 钩子在[自定义插件](server-custom-plugins.md#handle-app-events)中处理事件。
以下示例展示了如何创建 `ApplicationMonitoringPlugin` 插件并处理 `ApplicationStarted` 和 `ApplicationStopped` 事件：

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
        // 释放资源并取消订阅事件
        application.monitor.unsubscribe(ApplicationStarted) {}
        application.monitor.unsubscribe(ApplicationStopped) {}
    }
}
```

你可以在此处找到完整示例：[events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)。

## 自定义事件 {id="custom-events"}

在本节中，我们将了解如何创建在服务器针对某资源返回 `404 Not Found` 状态码时引发的自定义事件。

1. 首先，你需要创建[事件定义](#event-definition)。
   以下代码段展示了如何创建接受 `ApplicationCall` 作为形参的自定义 `NotFoundEvent` 事件。

   ```kotlin
   val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()
   ```
2. 要引发事件，请调用 `Events.raise` 函数。以下示例展示了如何处理 `ResponseSent` [钩子](server-custom-plugins.md#other)，以便在调用的状态码为 `404` 时引发新创建的事件。

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
3. 要在 Application 中处理创建的事件，请[安装](server-plugins.md#install)该插件：

   ```kotlin
   fun Application.module() {
       install(ApplicationMonitoringPlugin)
   }
   ```

4. 然后，使用 `Events.subscribe` 订阅该事件：

   ```kotlin
   fun Application.module() {
       install(ApplicationMonitoringPlugin)
       monitor.subscribe(NotFoundEvent) { call ->
           log.info("No page was found for the URI: ${call.request.uri}")
       }
   }
   ```

有关完整示例，请参阅 [events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)。