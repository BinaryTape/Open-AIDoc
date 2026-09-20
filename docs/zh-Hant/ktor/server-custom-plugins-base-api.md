[//]: # (title: 自訂外掛程式 - Base API)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin-base-api"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 提供了 Base API 用於開發自訂[外掛程式](server-plugins.md)，這些外掛程式可在多個應用程式中重複使用功能。

Base API 允許您攔截不同的[管線](#pipelines)階段，並在請求與回應處理中加入自訂邏輯。例如，您可以攔截 `Monitoring` 階段來記錄傳入的請求或收集指標。

## 建立外掛程式 {id="create"}

使用 Base API 建立自訂外掛程式：

1. 建立一個外掛程式類別並[宣告一個伴隨物件](#create-companion)，該物件需實作外掛程式介面。
2. [實作](#implement)伴隨物件中的 `key` 屬性與 `install()` 函式。
3. 提供[外掛程式配置](#plugin-configuration)。
4. 透過攔截必要的管線階段來[處理呼叫](#call-handling)。
5. [安裝外掛程式](#install)。

### 建立伴隨物件 {id="create-companion"}

自訂外掛程式的類別必須包含一個實作以下介面之一的伴隨物件：

* 用於應用程式層級外掛程式的 [`BaseApplicationPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-application-plugin/index.html)。
* 用於[安裝在特定路由](server-plugins.md#install-route)上的外掛程式的 [`BaseRouteScopedPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-route-scoped-plugin/index.html)。

`BaseApplicationPlugin` 介面接受以下型別參數：

* 外掛程式支援的管線型別。
* 外掛程式的[配置型別](#plugin-configuration)。
* 外掛程式執行個體型別。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        // ...
    }
}
```

### 實作 'key' 屬性與 'install()' 函式 {id="implement"}

實作 `BaseApplicationPlugin` 的伴隨物件必須定義以下內容：

* `key` 屬性用於識別外掛程式。Ktor 將外掛程式執行個體儲存在應用程式的屬性中，並使用此金鑰存取該外掛程式執行個體。
* `install()` 函式用於配置外掛程式。在此函式中，攔截所需的管線階段並傳回外掛程式執行個體。[處理呼叫](#call-handling)小節展示了如何攔截管線階段。

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

### 處理呼叫 {id="call-handling"}

在自訂外掛程式中，您可以透過攔截[現有的管線階段](#pipelines)或新定義的階段來處理請求與回應。例如，[Authentication](server-auth.md) 外掛程式將 `Authenticate` 與 `Challenge` 自訂階段加入到預設管線中。

攔截特定階段可讓您存取呼叫處理的特定階段：

* `ApplicationCallPipeline.Monitoring`：將此階段用於請求記錄、指標、追蹤和類似的監控任務。
* `ApplicationCallPipeline.Plugins`：使用此階段來處理呼叫或修改回應參數，例如附加自訂標頭。
* `ApplicationReceivePipeline.Transform` 與 `ApplicationSendPipeline.Transform`：使用這些階段來存取並[轉換](#transform)從用戶端接收或發送到用戶端的資料。

以下範例攔截 `ApplicationCallPipeline.Plugins` 階段，並在每個回應中附加自訂標頭：

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

在此範例中，標頭名稱和值是寫死的。為了讓外掛程式可重複使用，請[提供配置](#plugin-configuration)，讓使用者能夠指定標頭名稱和值。

> 自訂外掛程式可以在不同的處理常式之間共用與呼叫相關的值。若要了解更多，請參閱[共用呼叫狀態](server-custom-plugins.md#call-state)。
>
{style="tip"}

### 提供外掛程式配置 {id="plugin-configuration"}

[前一節](#call-handling)展示了如何建立一個將預定義自訂標頭附加到每個回應的外掛程式。為了讓此外掛程式可重複使用，請定義一個配置讓使用者指定標頭名稱和值。

首先，在外掛程式類別中定義一個配置類別：

```kotlin
class Configuration {
    var headerName = "Custom-Header-Name"
    var headerValue = "Default value"
}
```

您可以在外掛程式安裝期間更新外掛程式配置屬性。如果外掛程式在攔截器中使用這些值，請將它們儲存在 `install()` 函式內的區域變數中：

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

然後，在 `install()` 函式中讀取配置並使用其屬性：

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

### 安裝外掛程式 {id="install"}

要將自訂外掛程式[安裝](server-plugins.md#install)到您的應用程式，請呼叫 `Application.install()` 函式並傳遞所需的[配置](#plugin-configuration)參數：

```kotlin
install(CustomHeader) {
    headerName = "X-Custom-Header"
    headerValue = "Hello, world!"
}
```

## 範例 {id="examples"}

以下範例展示了使用 Base API 建置的幾個自訂外掛程式。

> 完整的可執行專案請參閱 [custom-plugin-base-api](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-base-api)。
>
{style="tip"}

### 請求記錄 {id="request-logging"}

以下範例建立了一個用於記錄傳入請求的自訂外掛程式：

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

### 自訂標頭 {id="custom-header"}

以下範例建立了一個在每個回應中附加自訂標頭的外掛程式：

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

### 內容轉換 {id="transform"}

以下範例建立了一個轉換請求與回應內文的外掛程式：

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

## 管線 {id="pipelines"}

Ktor 中的 [`Pipeline`](https://api.ktor.io/ktor-utils/io.ktor.util.pipeline/-pipeline/index.html) 是分組到一個或多個有序階段中的攔截器集合。每個攔截器都可以在請求處理繼續進行之前和之後執行自訂邏輯。

[`ApplicationCallPipeline`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call-pipeline/index.html)
用於執行應用程式呼叫。它定義了以下階段：

* `Setup`：準備呼叫及其屬性以進行處理。
* `Monitoring`：追蹤呼叫。將此階段用於請求記錄、指標、錯誤處理和類似任務。
* `Plugins`：處理呼叫。大多數外掛程式在此階段進行攔截。
* `Call`：完成呼叫。
* `Fallback`：處理未被先前階段處理的呼叫。

## 管線階段到新 API 處理常式的對應 {id="mapping"}

您可以使用簡化的[自訂外掛程式 API](server-custom-plugins.md) 來建立自訂外掛程式。在大多數情況下，此 API 不需要直接了解 Ktor 內部概念（如管線與階段）。相反地，它為[處理請求與回應](server-custom-plugins.md#call-handling)的不同階段提供了諸如 `onCall()`、`onCallReceive()` 以及 `onCallRespond()` 等處理常式。

下表顯示了 Base API 管線階段如何對應到簡化 API 處理常式：

| Base API                               | New API                                                             |
|----------------------------------------|---------------------------------------------------------------------|
| 在 `ApplicationCallPipeline.Setup` 之前 | [`on(CallFailed)`](server-custom-plugins.md#other)                  |
| `ApplicationCallPipeline.Setup`        | [`on(CallSetup)`](server-custom-plugins.md#other)                   |
| `ApplicationCallPipeline.Plugins`      | [`onCall()`](server-custom-plugins.md#on-call)                      |
| `ApplicationCallPipeline.Call`         | [`onCallValidators()`](server-custom-plugins.md#on-call-validators) |
| `ApplicationReceivePipeline.Transform` | [`onCallReceive()`](server-custom-plugins.md#on-call-receive)       |
| `ApplicationSendPipeline.Transform`    | [`onCallRespond()`](server-custom-plugins.md#on-call-respond)       |
| `ApplicationSendPipeline.After`        | [`on(ResponseBodyReadyForSend)`](server-custom-plugins.md#other)    |
| `ApplicationSendPipeline.Engine`       | [`on(ResponseSent)`](server-custom-plugins.md#other)                |
| 在 `Authentication.ChallengePhase` 之後  | [`on(AuthenticationChecked)`](server-custom-plugins.md#other)       |