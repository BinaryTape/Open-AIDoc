[//]: # (title: 自定义服务器插件)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何创建您自己的自定义插件。
</link-summary>

Ktor 允许您创建自己的自定义[插件](server-plugins.md)。通常，此 API 不需要了解 Ktor 的内部概念，例如流水线 (pipelines) 和阶段 (phases)。相反，您可以使用诸如 `onCall()`、`onCallReceive()` 和 `onCallRespond()` 之类的处理程序来访问[请求和响应处理](#call-handling)的不同阶段。

## 创建并安装您的第一个插件 {id="first-plugin"}

在本节中，您将学习如何创建并安装您的第一个插件。

您可以使用在[创建、打开并运行新的 Ktor 项目](server-create-a-new-project.topic)教程中创建的应用程序作为起始项目。

1. 要创建插件，请调用 [`createApplicationPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-application-plugin.html) 函数并指定插件名称：

   ```kotlin
   import io.ktor.server.application.*
   
   val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
       println("SimplePlugin is installed!")
   }
   ```

   此函数返回一个 `ApplicationPlugin` 实例，您可以将其安装在应用程序中。
   
   > 您还可以使用 [`createRouteScopedPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-route-scoped-plugin.html) 函数来创建可以[安装到特定路由](server-plugins.md#install-route)的插件。
   >
   {style="tip"}

2. 要[安装插件](server-plugins.md#install)，请在应用程序的初始化代码中将创建的 `ApplicationPlugin` 实例传递给 `Application.install()` 函数：

   ```kotlin
   fun Application.module() {
       install(SimplePlugin)
   }
   ```

3. [运行](server-run.md)您的应用程序，以在控制台输出中查看插件消息：

   ```Bash
   2021-10-14 14:54:08.269 [main] INFO  Application - Autoreload is disabled because the development mode is off.
   SimplePlugin is installed!
   2021-10-14 14:54:08.900 [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```

> 有关完整的示例，请参阅 [SimplePlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/SimplePlugin.kt)。
> 
{style="tip"}

## 处理调用 {id="call-handling"}

在您的自定义插件中，您可以通过使用一组提供访问调用不同阶段的处理程序来[处理请求](server-requests.md)和[响应](server-responses.md)：

* [`onCall()`](#on-call) 允许您访问请求和响应信息，并修改响应参数（例如标头）。
* [`onCallValidators()`](#on-call-validators) 允许您执行调用验证。对于路由作用域插件，验证器会根据路由嵌套顺序执行。
* [`onCallReceive()`](#on-call-receive) 允许您转换从客户端接收的数据。
* [`onCallRespond()`](#on-call-respond) 允许您在将数据发送到客户端之前对其进行转换。
* [`on()`](#other) 允许您处理调用处理其他阶段或调用期间发生的异常的特定钩子。

您还可以使用 `call.attributes` 在不同处理程序之间[共享调用状态](#call-state)。

### `onCall()` {id="on-call"}

`onCall()` 处理程序接受 `ApplicationCall` 作为 lambda 实参。这允许您访问请求和响应信息并修改响应参数，例如[追加自定义标头](#custom-header)。

要转换请求或响应体，请使用 [`onCallReceive()`](#on-call-receive) 和 [`onCallRespond()`](#on-call-respond)。

#### 示例 1：记录请求 {id="request-logging"}

以下示例使用 `onCall()` 创建一个用于记录传入请求 URL 的插件：

```kotlin
val RequestLoggingPlugin = createApplicationPlugin(name = "RequestLoggingPlugin") {
    onCall { call ->
        call.request.origin.apply {
            println("Request URL: $scheme://$localHost:$localPort$uri")
        }
    }
}
```

安装此插件后，它会在控制台中打印请求的 URL：

```Bash
Request URL: http://0.0.0.0:8080/
Request URL: http://0.0.0.0:8080/index
```

#### 示例 2：添加自定义标头 {id="custom-header"}

以下示例创建了一个为每个响应添加自定义标头的插件：

```kotlin
val CustomHeaderPlugin = createApplicationPlugin(name = "CustomHeaderPlugin") {
    onCall { call ->
        call.response.headers.append("X-Custom-Header", "Hello, world!")
    }
}
```

生成的响应将包含该自定义标头：

```HTTP
HTTP/1.1 200 OK
X-Custom-Header: Hello, world!
```

在此示例中，标头名称和值是硬编码的。要使其可配置，请提供[插件配置](#plugin-configuration)。

### `onCallReceive()` {id="on-call-receive"}

`onCallReceive()` 处理程序允许您转换从客户端接收的数据。在该处理程序内部，调用 `transformBody()` 可以在将请求体传递给 `call.receive()` 之前对其进行转换。

假设客户端发送了以下包含 `10` 作为 `text/plain` 正文的 `POST` 请求：

```HTTP
POST http://localhost:8080/transform-data
Content-Type: text/plain

10

```

要将[此主体接收](server-requests.md#objects)为整数值，您需要为 `POST` 请求创建一个路由处理程序，并使用 `Int` 形参调用 `call.receive()`：

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
}
```

以下插件将主体作为整数值接收并将其加 `1`：

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

在上面的示例中：

* `TransformBodyContext` 是 [lambda 接收器](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)。其 `requestedType` 属性包含有关 `call.receive()` 请求的类型的信息。
* `data` 实参包含当前请求体。在本例中，它是一个 [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)，且 `ByteReadChannel.readLine()` 会读取其内容。
* 如果请求的类型是 `Int`，插件会将接收到的值转换为整数，加 `1`，然后返回转换后的值。否则，它会原样返回主体。

> 有关完整的示例，请参阅 [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。
>
{style="tip"}

### `onCallRespond()` {id="on-call-respond"}

`onCallRespond()` 处理程序允许您在将数据发送到客户端之前对其进行转换。当在路由处理程序中调用 `call.respond` 函数时，会执行此处理程序。

例如，考虑以下路由：

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
    call.respond(data)
}
```

调用 `call.respond` 会调用 `onCallRespond()`，这反过来允许您转换要发送到客户端的数据。

在 `onCallRespond()` 内部，使用 `transformBody()` 转换响应体。以下示例将整数响应加 `1` 并将其转换为字符串：

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

> 有关完整的示例，请参阅 [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。
>
{style="tip"}

### `onCallValidators()` {id="on-call-validators"}

`onCallValidators()` 处理程序允许您对每个传入调用执行验证。

当多个验证器应用于嵌套路由时，父路由上的验证器会在子路由上的验证器之前执行。这使得验证器可以使用路由层次结构中较早生成的信息，例如已通过身份验证的主体 (principal)。

例如，以下路由作用域插件可以访问由身份验证路由提供的主体：

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

将该插件安装在经过身份验证的路由中，以便在身份验证后运行它：

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

当路由作用域验证的顺序很重要时，请使用 `onCallValidators()`。对于不依赖其他验证器的常规请求和响应处理，请改用 `onCall()`。

### 其他有用的处理程序 {id="other"}

除了上面描述的调用处理程序之外，Ktor 还提供了一组用于处理调用处理其他阶段的钩子。使用 `on()` 函数可以为特定的 `Hook` 注册处理程序。

可用的钩子包括：

- `CallSetup` 在调用处理开始时被调用。
- `ResponseBodyReadyForSend` 在响应体经过所有转换并准备好发送后被调用。
- `ResponseSent` 在响应成功发送到客户端后被调用。
- `CallFailed` 在调用处理因异常而失败时被调用。
- [`AuthenticationChecked`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-checked/index.html) 在检查[身份验证](server-auth.md)凭据后被调用。您可以使用此钩子来实现授权。有关示例，请参阅 [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization)。

以下示例处理了 `CallSetup` 钩子：

```kotlin
on(CallSetup) { call->
    // ...
}
```

> 您还可以使用 `MonitoringEvent` 来[处理应用程序事件](#handle-app-events)，例如应用程序启动或关闭。
> 
{style="tip"}

### 共享调用状态 {id="call-state"}

自定义插件可以在不同处理程序之间共享与调用相关联的值。这些值使用唯一的 `AttributeKey` 作为特性存储在 `call.attributes` 集合中。

以下示例存储了调用 `onCall()` 时的时间，并在 `onCallReceive()` 中使用它来计算读取请求体之前的延迟：

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

发送 `POST` 请求时，插件会在控制台中打印延迟：

```Bash
Request URL: http://localhost:8080/transform-data
Read body delay (ms): 52
```

> 有关完整的示例，请参阅 [DataTransformationBenchmarkPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationBenchmarkPlugin.kt)。
>
{style="tip"}

> 您还可以在[路由处理程序](server-requests.md#request_information)中访问调用特性。
> 
{style="tip"}

## 处理应用程序事件 {id="handle-app-events"}

[`on()`](#other) 处理程序提供了使用 `MonitoringEvent` 钩子处理与应用程序生命周期相关的事件的能力。

Ktor 向 `on()` 处理程序提供了以下[预定义事件](server-events.md#predefined-events)：

- `ApplicationStarting`
- `ApplicationStarted`
- `ApplicationStopPreparing`
- `ApplicationStopping`
- `ApplicationStopped`

以下示例使用 `ApplicationStopped` 事件处理应用程序关闭：

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
        // 释放资源并取消订阅事件
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

这种方法对于清理插件拥有的资源非常有用，例如关闭连接、停止后台任务或刷新缓冲数据。

## 提供插件配置 {id="plugin-configuration"}

[自定义标头](#custom-header)示例创建了一个插件，该插件为每个响应追加预定义的标头。为了使此插件可重用，请定义一个允许用户指定标头名称和值的配置。

1. 定义配置类：

   ```kotlin
   class PluginConfiguration {
       var headerName: String = "Custom-Header-Name"
       var headerValue: String = "Default value"
   }
   ```

2. 将配置类引用传递给 `createApplicationPlugin()`：

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

   插件配置属性在插件安装期间是可变的。如果插件在处理程序中使用这些值，请将它们存储在插件体内的局部变量中。

3. 安装并配置插件：

   ```kotlin
   install(CustomHeaderPlugin) {
       headerName = "X-Custom-Header"
       headerValue = "Hello, world!"
   }
   ```

> 有关完整的示例，请参阅 [CustomHeaderPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPlugin.kt)。
>
{style="tip"}

### 在文件中配置 {id="configuration-file"}

Ktor 可以从[配置文件](server-create-and-configure.topic#engine-main)中加载插件设置。

以下示例展示了如何从文件中配置 `CustomHeaderPlugin`。

1. 将带有插件设置的新组添加到 `application.conf` 或 `application.yaml` 文件中：

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

   在此示例中，插件设置存储在 `http.custom_header` 组中。

2. 要访问配置文件属性，请将 `ApplicationConfig` 传递给配置类的构造函数。`tryGetString()` 函数返回指定属性的值：

   ```kotlin
   class CustomHeaderConfiguration(config: ApplicationConfig) {
       var headerName: String = config.tryGetString("header_name") ?: "Custom-Header-Name"
       var headerValue: String = config.tryGetString("header_value") ?: "Default value"
   }
   ```

3. 将 `http.custom_header` 值赋给 `createApplicationPlugin()` 函数的 `configurationPath` 形参：

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

> 有关完整的示例，请参阅 [CustomHeaderPluginConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPluginConfigurable.kt)。
>
{style="tip"}

## 访问应用程序设置 {id="app-settings"}

自定义插件可以从插件体中访问应用程序级别的设置。当插件行为取决于服务器配置或环境时，这非常有用。

### 配置 {id="config"}

使用 `applicationConfig` 属性访问服务器配置。该属性返回一个 [`ApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-application-config/index.html) 实例。

以下示例读取服务器使用的主机和端口：

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val host = applicationConfig?.host
   val port = applicationConfig?.port
   println("Listening on $host:$port")
}
```

### 环境 {id="environment"}

使用 `environment` 属性访问应用程序的环境。例如，您可以检查是否启用了[开发模式](server-development-mode.topic)：

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

## 杂项 {id="misc"}

### 存储插件状态 {id="plugin-state"}

插件可以通过在插件体内捕获值并在处理程序 lambda 中使用它们来存储状态。

由于插件可以并发处理多个调用，因此请将共享的可变状态存储在线程安全的数据结构中，例如并发集合或原子类型：

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

### 数据库 {id="databases"}

#### 使用挂起式数据库 API {id="use-suspending-database-apis"}

所有自定义插件处理程序都是挂起函数。这意味着您可以直接从处理程序中调用挂起式数据库 API。

请记得释放作用域限定在特定调用内的资源。例如，您可以使用 [`on(ResponseSent)`](#other) 在响应发送完毕后清理资源。

#### 使用阻塞式数据库 API {id="use-blocking-database-apis"}

Ktor 使用协程，因此阻塞式数据库调用不应在默认协程调度器上运行。阻塞调用可能会占用线程并阻止其他协程推进。

要调用阻塞式数据库 API，请为阻塞工作创建一个单独的 [`CoroutineContext`](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)：

```kotlin
val databaseContext = Dispatchers.IO
```

然后将每个阻塞式数据库调用包装在 `withContext()` 中：

```kotlin
onCall {
   withContext(databaseContext) {
       database.access(...) // 对数据库的调用
   }
}