[//]: # (title: 自訂伺服器外掛程式)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何建立你自己的自訂外掛程式。
</link-summary>

Ktor 允許你建立自己的自訂[外掛程式](server-plugins.md)。一般來說，此 API 不需要理解 Ktor 內部概念（例如管線與階段）。相反地，你可以使用 `onCall()`、`onCallReceive()` 和 `onCallRespond()` 等處理常式來存取[請求與回應處理](#call-handling)的不同階段。

## 建立並安裝你的第一個外掛程式 {id="first-plugin"}

在本節中，你將學習如何建立並安裝你的第一個外掛程式。

你可以使用在[建立、開啟並執行新的 Ktor 專案](server-create-a-new-project.topic)教學中建立的應用程式作為起步專案。

1. 若要建立外掛程式，請呼叫 [`createApplicationPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-application-plugin.html) 函式並指定外掛程式名稱：

   ```kotlin
   import io.ktor.server.application.*
   
   val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
       println("SimplePlugin is installed!")
   }
   ```

   此函式會傳回可安裝在應用程式中的 `ApplicationPlugin` 執行個體。
   
   > 你也可以使用 [`createRouteScopedPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-route-scoped-plugin.html) 函式來建立可[安裝在特定路由上](server-plugins.md#install-route)的外掛程式。
   >
   {style="tip"}

2. 若要[安裝外掛程式](server-plugins.md#install)，請在應用程式的初始化程式碼中將建立的 `ApplicationPlugin` 執行個體傳遞給 `Application.install()` 函式：

   ```kotlin
   fun Application.module() {
       install(SimplePlugin)
   }
   ```

3. [執行](server-run.md)你的應用程式，即可在主控台輸出中看到外掛程式訊息：

   ```Bash
   2021-10-14 14:54:08.269 [main] INFO  Application - Autoreload is disabled because the development mode is off.
   SimplePlugin is installed!
   2021-10-14 14:54:08.900 [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```

> 如需完整範例，請參閱 [SimplePlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/SimplePlugin.kt)。
> 
{style="tip"}

## 處理呼叫 {id="call-handling"}

在自訂外掛程式中，你可以透過一組提供存取呼叫不同階段的處理常式來[處理請求](server-requests.md)與[回應](server-responses.md)：

* [`onCall()`](#on-call) 允許你存取請求與回應資訊，並修改回應參數（例如標頭）。
* [`onCallValidators()`](#on-call-validators) 允許你執行呼叫驗證。對於路由作用域的外掛程式，驗證器會根據路由巢狀層級執行。
* [`onCallReceive()`](#on-call-receive) 允許你轉換從用戶端接收到的資料。
* [`onCallRespond()`](#on-call-respond) 允許你在將資料傳送給用戶端之前進行轉換。
* [`on()`](#other) 允許你處理呼叫處理其他階段的特定掛鉤，或處理呼叫期間發生的例外。

你還可以使用 `call.attributes` 在處理常式之間[共享呼叫狀態](#call-state)。

### `onCall()` {id="on-call"}

`onCall()` 處理常式接受 `ApplicationCall` 作為 Lambda 引數。這允許你存取請求與回應資訊，並修改回應參數（例如[附加自訂標頭](#custom-header)）。

若要轉換請求或回應主體，請使用 [`onCallReceive()`](#on-call-receive) 和 [`onCallRespond()`](#on-call-respond)。

#### 範例 1：記錄請求 {id="request-logging"}

以下範例使用 `onCall()` 建立一個記錄傳入請求 URL 的外掛程式：

```kotlin
val RequestLoggingPlugin = createApplicationPlugin(name = "RequestLoggingPlugin") {
    onCall { call ->
        call.request.origin.apply {
            println("Request URL: $scheme://$localHost:$localPort$uri")
        }
    }
}
```

安裝此外掛程式後，它會將請求的 URL 列印到主控台：

```Bash
Request URL: http://0.0.0.0:8080/
Request URL: http://0.0.0.0:8080/index
```

#### 範例 2：新增自訂標頭 {id="custom-header"}

以下範例建立一個為每個回應新增自訂標頭的外掛程式：

```kotlin
val CustomHeaderPlugin = createApplicationPlugin(name = "CustomHeaderPlugin") {
    onCall { call ->
        call.response.headers.append("X-Custom-Header", "Hello, world!")
    }
}
```

產生的回應會包含該自訂標頭：

```HTTP
HTTP/1.1 200 OK
X-Custom-Header: Hello, world!
```

在此範例中，標頭名稱和值均為寫死的。若要使其可配置，請提供[外掛程式配置](#plugin-configuration)。

### `onCallReceive()` {id="on-call-receive"}

`onCallReceive()` 處理常式允許你轉換從用戶端接收到的資料。在處理常式內部，呼叫 `transformBody()` 可以在請求主體傳遞給 `call.receive()` 之前對其進行轉換。

假設用戶端發送了以下 `POST` 請求，其中包含 `text/plain` 主體 `10`：

```HTTP
POST http://localhost:8080/transform-data
Content-Type: text/plain

10

```

若要將[此主體接收](server-requests.md#objects)為整數值，你需要為 `POST` 請求建立路由處理常式，並使用 `Int` 參數呼叫 `call.receive()`：

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
}
```

以下外掛程式將主體接收為整數值並為其加 `1`：

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

在上述範例中：

* `TransformBodyContext` 是 [Lambda 接收者](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)。其 `requestedType` 屬性包含有關 `call.receive()` 所請求型別的資訊。
* `data` 引數包含目前的請求主體。在此情況下，它是一個 [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)，並由 `ByteReadChannel.readLine()` 讀取其內容。
* 如果請求的型別是 `Int`，外掛程式會將接收到的值轉換為整數，加 `1`，並傳回轉換後的值。否則，它會保持主體不變並傳回。

> 如需完整範例，請參閱 [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。
>
{style="tip"}

### `onCallRespond()` {id="on-call-respond"}

`onCallRespond()` 處理常式允許你在資料傳送給用戶端之前進行轉換。
當在路由處理常式中叫用 `call.respond` 函式時，會執行此處理常式。

例如，考慮以下路由：

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
    call.respond(data)
}
```

呼叫 `call.respond` 會叫用 `onCallRespond()`，進而允許你轉換要傳送給用戶端的資料。

在 `onCallRespond()` 內部，使用 `transformBody()` 來轉換回應主體。以下範例為整數回應加 `1` 並將其轉換為字串：

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

> 如需完整範例，請參閱 [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。
>
{style="tip"}

### `onCallValidators()` {id="on-call-validators"}

`onCallValidators()` 處理常式允許你針對每個傳入呼叫執行驗證。

當有多個驗證器套用至巢狀路由時，父路由上的驗證器會先於子路由上的驗證器執行。這允許驗證器使用路由階層結構中較早產生的資訊，例如通過驗證的 principal。

例如，以下路由作用域的外掛程式可以存取由驗證路由提供的 principal：

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

將外掛程式安裝在經過驗證的路由內部，以便在驗證之後執行它：

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

當路由作用域驗證的順序很重要時，請使用 `onCallValidators()`。對於不依賴其他驗證器的一般請求與回應處理，請改用 `onCall()`。

### 其他有用的處理常式 {id="other"}

除了上述的呼叫處理常式外，Ktor 還提供了一組掛鉤，用於處理呼叫處理的其他階段。使用 `on()` 函式可以為特定的 `Hook` 註冊處理常式。

可用的掛鉤包括：

- `CallSetup` 在呼叫處理開始時被叫用。
- `ResponseBodyReadyForSend` 在回應主體通過所有轉換並準備好傳送後被叫用。
- `ResponseSent` 在回應成功傳送給用戶端後被叫用。
- `CallFailed` 在呼叫處理因例外而失敗時被叫用。
- [`AuthenticationChecked`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-checked/index.html) 在[身分驗證](server-auth.md)憑據檢查後被叫用。你可以使用此掛鉤來實作授權。如需範例，請參閱 [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization)。

以下範例處理 `CallSetup` 掛鉤：

```kotlin
on(CallSetup) { call->
    // ...
}
```

> 你還可以使用 `MonitoringEvent` 來[處理應用程式事件](#handle-app-events)，例如應用程式啟動或關閉。
> 
{style="tip"}

### 共享呼叫狀態 {id="call-state"}

自訂外掛程式可以在不同處理常式之間共享與呼叫關聯的值。
這些值使用唯一的 `AttributeKey` 儲存在 `call.attributes` 集合中。

以下範例儲存叫用 `onCall()` 的時間，並在 `onCallReceive()` 中使用它來計算讀取請求主體之前的延遲：

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

當你發送 `POST` 請求時，外掛程式會將延遲列印到主控台：

```Bash
Request URL: http://localhost:8080/transform-data
Read body delay (ms): 52
```

> 如需完整範例，請參閱 [DataTransformationBenchmarkPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationBenchmarkPlugin.kt)。
>
{style="tip"}

> 你也可以從[路由處理常式](server-requests.md#request_information)存取呼叫屬性。
> 
{style="tip"}

## 處理應用程式事件 {id="handle-app-events"}

[`on()`](#other) 處理常式提供了使用 `MonitoringEvent` 掛鉤來處理與應用程式生命週期相關事件的功能。

Ktor 為 `on()` 處理常式提供了以下[預定義事件](server-events.md#predefined-events)：

- `ApplicationStarting`
- `ApplicationStarted`
- `ApplicationStopPreparing`
- `ApplicationStopping`
- `ApplicationStopped`

以下範例使用 `ApplicationStopped` 事件處理應用程式關閉：

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
        // Release resources and unsubscribe from events
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

此方法適用於清理外掛程式所擁有的資源，例如關閉連線、停止背景任務或清除緩衝資料。

## 提供外掛程式配置 {id="plugin-configuration"}

[自訂標頭](#custom-header)範例建立了一個在每個回應附加預定義標頭的外掛程式。
為了使此外掛程式可重複使用，請定義一個允許使用者指定標頭名稱和值的配置。

1. 定義配置類別：

   ```kotlin
   class PluginConfiguration {
       var headerName: String = "Custom-Header-Name"
       var headerValue: String = "Default value"
   }
   ```

2. 將配置類別參照傳遞給 `createApplicationPlugin()`：

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

   外掛程式配置屬性在外掛程式安裝期間是可變的。如果外掛程式在處理常式中使用這些值，請將它們儲存在外掛程式主體內的區域變數中。

3. 安裝並配置外掛程式：

   ```kotlin
   install(CustomHeaderPlugin) {
       headerName = "X-Custom-Header"
       headerValue = "Hello, world!"
   }
   ```

> 如需完整範例，請參閱 [CustomHeaderPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPlugin.kt)。
>
{style="tip"}

### 在檔案中配置 {id="configuration-file"}

Ktor 可以從[設定檔](server-create-and-configure.topic#engine-main)載入外掛程式設定。

以下範例展示如何從檔案配置 `CustomHeaderPlugin`。

1. 在你的 `application.conf` 或 `application.yaml` 檔案中新增包含外掛程式設定的新群組：

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

   在此範例中，外掛程式設定儲存在 `http.custom_header` 群組中。

2. 若要存取設定檔屬性，請將 `ApplicationConfig` 傳遞給配置類別建構函式。
   `tryGetString()` 函式會傳回指定屬性的值：

   ```kotlin
   class CustomHeaderConfiguration(config: ApplicationConfig) {
       var headerName: String = config.tryGetString("header_name") ?: "Custom-Header-Name"
       var headerValue: String = config.tryGetString("header_value") ?: "Default value"
   }
   ```

3. 將 `http.custom_header` 值指派給 `createApplicationPlugin()` 函式的 `configurationPath` 參數：

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

> 如需完整範例，請參閱 [CustomHeaderPluginConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPluginConfigurable.kt)。
>
{style="tip"}

## 存取應用程式設定 {id="app-settings"}

自訂外掛程式可以從外掛程式主體存取應用程式層級的設定。當外掛程式行為取決於伺服器配置或環境時，這非常有用。

### 配置 {id="config"}

使用 `applicationConfig` 屬性存取伺服器配置。此屬性傳回一個 [`ApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-application-config/index.html) 執行個體。

以下範例讀取伺服器使用的 host 和 port：

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val host = applicationConfig?.host
   val port = applicationConfig?.port
   println("Listening on $host:$port")
}
```

### 環境 {id="environment"}

使用 `environment` 屬性存取應用程式的環境。例如，你可以檢查是否啟用了[開發模式](server-development-mode.topic)：

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

## 其他事項 {id="misc"}

### 儲存外掛程式狀態 {id="plugin-state"}

外掛程式可以透過在外掛程式主體中擷取數值並在處理常式 Lambda 中使用它們來儲存狀態。

由於外掛程式可以並行處理多個呼叫，請將共享的可變狀態儲存在執行緒安全的結構中，例如並行集合或原子型別：

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

### 資料庫 {id="databases"}

#### 使用掛起（suspending）資料庫 API {id="use-suspending-database-apis"}

所有自訂外掛程式處理常式都是掛起函式。這意味著你可以直接從處理常式呼叫掛起資料庫 API。

請記得釋放限定於特定呼叫作用域的資源。例如，你可以使用 [`on(ResponseSent)`](#other) 在傳送回應後清理資源。

#### 使用阻塞式資料庫 API {id="use-blocking-database-apis"}

Ktor 使用協同程式，因此阻塞式資料庫呼叫不應在預設協同程式調度器上執行。阻塞呼叫可能會佔用執行緒並阻止其他協同程式繼續推進。

若要呼叫阻塞式資料庫 API，請為阻塞工作建立一個獨立的 [`CoroutineContext`](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)：

```kotlin
val databaseContext = Dispatchers.IO
```

然後將每個阻塞式資料庫呼叫包裝在 `withContext()` 中：

```kotlin
onCall {
   withContext(databaseContext) {
       database.access(...) // A call to your database
   }
}
```