[//]: # (title: 自定义插件 - 基础 API)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin-base-api"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 提供了用于开发自定义[插件](server-plugins.md)的基础 API，这些插件可在多个应用程序之间实现可复用的功能。

该基础 API 允许您拦截不同的[流水线](#pipelines)阶段，并为请求和响应处理添加自定义逻辑。例如，您可以拦截 `Monitoring` 阶段来记录传入请求或收集指标。

## 创建插件 {id="create"}

要使用基础 API 创建自定义插件：

1. 创建一个插件类并[声明一个伴生对象](#create-companion)，该对象需实现一个插件接口。
2. 在伴生对象中[实现](#implement) `key` 属性和 `install()` 函数。
3. 提供[插件配置](#plugin-configuration)。
4. 通过拦截所需的流水线阶段来[处理调用](#call-handling)。
5. [安装插件](#install)。

### 创建伴生对象 {id="create-companion"}

自定义插件的类必须具有一个实现以下接口之一的伴生对象：

* 用于应用程序级插件的 [`BaseApplicationPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-application-plugin/index.html)。
* 用于[安装在特定路由上](server-plugins.md#install-route)的插件的 [`BaseRouteScopedPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-route-scoped-plugin/index.html)。

`BaseApplicationPlugin` 接口接受以下类型形参：

* 插件支持的流水线类型。
* 插件的[配置类型](#plugin-configuration)。
* 插件实例类型。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        // ...
    }
}
```

### 实现 'key' 属性和 'install()' 函数 {id="implement"}

实现 `BaseApplicationPlugin` 的伴生对象必须定义以下内容：

* `key` 属性用于标识插件。Ktor 将插件实例存储在应用程序的属性中，并使用此键来访问该插件实例。
* `install()` 函数用于配置插件。在此函数中，拦截所需的流水线阶段并返回插件实例。[处理调用](#call-handling)部分展示了如何拦截流水线阶段。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val plugin = CustomHeader()
            // 拦截流水线 ...
            return plugin
        }
    }
}
```

### 处理调用 {id="call-handling"}

在自定义插件中，您可以通过拦截[现有的流水线阶段](#pipelines)或新定义的阶段来处理请求和响应。例如，[身份验证](server-auth.md)插件将 `Authenticate` 和 `Challenge` 自定义阶段添加到默认流水线。

拦截特定阶段可让您访问调用处理的特定阶段：

* `ApplicationCallPipeline.Monitoring`：将此阶段用于请求日志记录、指标、跟踪以及类似的监控任务。
* `ApplicationCallPipeline.Plugins`：使用此阶段处理调用或修改响应参数，例如追加自定义标头。
* `ApplicationReceivePipeline.Transform` 和 `ApplicationSendPipeline.Transform`：使用这些阶段访问并[转换](#transform)从客户端接收的数据或发送给客户端的数据。

以下示例拦截了 `ApplicationCallPipeline.Plugins` 阶段，并为每个响应追加一个自定义标头：

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

在此示例中，标头名称和值是硬编码的。要使插件具有可复用性，请[提供配置](#plugin-configuration)，以允许用户指定标头名称和值。

> 自定义插件可以在不同的处理程序之间共享与调用关联的值。要了解更多信息，请参阅[共享调用状态](server-custom-plugins.md#call-state)。
>
{style="tip"}

### 提供插件配置 {id="plugin-configuration"}

[上一节](#call-handling)展示了如何创建一个向每个响应追加预定义自定义标头的插件。为了使该插件具有可复用性，请定义一个允许用户指定标头名称和值的配置。

首先，在插件类内部定义一个配置类：

```kotlin
class Configuration {
    var headerName = "Custom-Header-Name"
    var headerValue = "Default value"
}
```

您可以在插件安装期间更新插件配置属性。如果插件在拦截器中使用这些值，请将它们存储在 `install()` 函数内的局部变量中：

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

然后，在 `install()` 函数中读取该配置并使用其属性：

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

### 安装插件 {id="install"}

要将自定义插件[安装](server-plugins.md#install)到您的应用程序，请调用 `Application.install()` 函数并传递所需的[配置](#plugin-configuration)参数：

```kotlin
install(CustomHeader) {
    headerName = "X-Custom-Header"
    headerValue = "Hello, world!"
}
```

## 示例 {id="examples"}

以下示例展示了使用基础 API 构建的几个自定义插件。

> 如需完整的可运行项目，请参阅 [custom-plugin-base-api](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-base-api)。
>
{style="tip"}

### 请求日志记录 {id="request-logging"}

以下示例创建了一个用于记录传入请求的自定义插件：

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

### 自定义标头 {id="custom-header"}

以下示例创建了一个向每个响应追加自定义标头的插件：

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

### 正文转换 {id="transform"}

以下示例创建了一个转换请求和响应正文的插件：

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

## 流水线 {id="pipelines"}

Ktor 中的 [`Pipeline`](https://api.ktor.io/ktor-utils/io.ktor.util.pipeline/-pipeline/index.html) 是分组到一个或多个有序阶段中的拦截器集合。在请求处理继续进行之前和之后，每个拦截器都可以运行自定义逻辑。

[`ApplicationCallPipeline`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call-pipeline/index.html) 负责执行应用程序调用。它定义了以下阶段：

* `Setup`：准备调用及其属性以供处理。
* `Monitoring`：跟踪调用。将此阶段用于请求日志记录、指标、错误处理和类似任务。
* `Plugins`：处理调用。大多数插件会拦截此阶段。
* `Call`：完成调用。
* `Fallback`：处理未被前面阶段处理的调用。

## 流水线阶段到新 API 处理程序的映射 {id="mapping"}

您可以使用简化的[自定义插件 API](server-custom-plugins.md) 来创建自定义插件。在大多数情况下，此 API 不需要直接了解流水线和阶段等 Ktor 内部概念。相反，它为[请求和响应处理](server-custom-plugins.md#call-handling)的不同阶段提供了诸如 `onCall()`、`onCallReceive()` 和 `onCallRespond()` 等处理程序。

下表展示了基础 API 流水线阶段如何映射到简化 API 处理程序：

| 基础 API                               | 新 API                                                              |
|----------------------------------------|---------------------------------------------------------------------|
| `ApplicationCallPipeline.Setup` 之前   | [`on(CallFailed)`](server-custom-plugins.md#other)                  |
| `ApplicationCallPipeline.Setup`        | [`on(CallSetup)`](server-custom-plugins.md#other)                   |
| `ApplicationCallPipeline.Plugins`      | [`onCall()`](server-custom-plugins.md#on-call)                      |
| `ApplicationCallPipeline.Call`         | [`onCallValidators()`](server-custom-plugins.md#on-call-validators) |
| `ApplicationReceivePipeline.Transform` | [`onCallReceive()`](server-custom-plugins.md#on-call-receive)       |
| `ApplicationSendPipeline.Transform`    | [`onCallRespond()`](server-custom-plugins.md#on-call-respond)       |
| `ApplicationSendPipeline.After`        | [`on(ResponseBodyReadyForSend)`](server-custom-plugins.md#other)    |
| `ApplicationSendPipeline.Engine`       | [`on(ResponseSent)`](server-custom-plugins.md#other)                |
| `Authentication.ChallengePhase` 之后   | [`on(AuthenticationChecked)`](server-custom-plugins.md#other)       |