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
了解如何建立您自己的自訂外掛程式。
</link-summary>

從 v2.0.0 開始，Ktor 提供了一個用於建立自訂 [外掛程式](server-plugins.md) 的新 API。一般而言，此 API 不需要瞭解 Ktor 內部的概念，例如管線（pipelines）、階段（phases）等等。相反地，您可以透過 `onCall`、`onCallReceive` 和 `onCallRespond` 處理常式，存取 [處理請求與回應](#call-handling) 的不同階段。

> 本主題中描述的 API 適用於 v2.0.0 及更高版本。對於舊版本，您可以使用 [基礎 API](server-custom-plugins-base-api.md)。

## 建立並安裝您的第一個外掛程式 {id="first-plugin"}

在本節中，我們將示範如何建立並安裝您的第一個外掛程式。
您可以使用在 [建立、開啟並執行新的 Ktor 專案](server-create-a-new-project.topic) 教學中建立的應用程式作為起始專案。

1. 要建立外掛程式，請呼叫 [createApplicationPlugin](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-application-plugin.html) 函式並傳入外掛程式名稱：
   ```kotlin
   import io.ktor.server.application.*
   
   val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
       println("SimplePlugin is installed!")
   }
   ```

   此函式會回傳 `ApplicationPlugin` 執行個體，該執行個體將在下一步中用於安裝外掛程式。
   > 另外還有 [createRouteScopedPlugin](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-route-scoped-plugin.html) 函式，允許您建立可以 [安裝到特定路由](server-plugins.md#install-route) 的外掛程式。
2. 要 [安裝外掛程式](server-plugins.md#install)，請將建立的 `ApplicationPlugin` 執行個體傳遞給應用程式初始化程式碼中的 `install` 函式：
   ```kotlin
   fun Application.module() {
       install(SimplePlugin)
   }
   ```
3. 最後，[執行](server-run.md) 您的應用程式，在外掛程式主控台輸出中查看歡迎訊息：
   ```Bash
   2021-10-14 14:54:08.269 [main] INFO  Application - Autoreload is disabled because the development mode is off.
   SimplePlugin is installed!
   2021-10-14 14:54:08.900 [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```

您可以在此處找到完整的範例：[SimplePlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/SimplePlugin.kt)。
在接下來的章節中，我們將探討如何處理不同階段的呼叫，並提供外掛程式配置。

## 處理呼叫 {id="call-handling"}

在您的自訂外掛程式中，您可以透過一組處理常式來 [處理請求](server-requests.md) 和 [回應](server-responses.md)，這些處理常式提供了對呼叫（call）不同階段的存取：

* [onCall](#on-call) 允許您獲取請求 / 回應資訊、修改回應參數（例如，附加自訂標頭）等。
* [onCallReceive](#on-call-receive) 允許您獲取並轉換從用戶端接收的資料。
* [onCallRespond](#on-call-respond) 允許您在將資料發送到用戶端之前對其進行轉換。
* [on(...)](#other) 允許您調用特定的掛鉤（hooks），這些掛鉤對於處理呼叫的其他階段或呼叫期間發生的例外狀況可能很有用。
* 如果需要，您可以使用 `call.attributes` 在不同的處理常式之間共享 [呼叫狀態](#call-state)。

### onCall {id="on-call"}

`onCall` 處理常式接受 `ApplicationCall` 作為 Lambda 引數。這允許您存取請求 / 回應資訊並修改回應參數（例如，[附加自訂標頭](#custom-header)）。如果您需要轉換請求 / 回應主體，請使用 [onCallReceive](#on-call-receive) / [onCallRespond](#on-call-respond)。

#### 範例 1：請求記錄 {id="request-logging"}

下面的範例顯示如何使用 `onCall` 建立自訂外掛程式來記錄傳入的請求：

```kotlin
val RequestLoggingPlugin = createApplicationPlugin(name = "RequestLoggingPlugin") {
    onCall { call ->
        call.request.origin.apply {
            println("Request URL: $scheme://$localHost:$localPort$uri")
        }
    }
}
```

如果您安裝此外掛程式，應用程式將在主控台中顯示請求的 URL，例如：

```Bash
Request URL: http://0.0.0.0:8080/
Request URL: http://0.0.0.0:8080/index
```

#### 範例 2：自訂標頭 {id="custom-header"}

此範例示範如何建立一個在每個回應中附加自訂標頭的外掛程式：

```kotlin
val CustomHeaderPlugin = createApplicationPlugin(name = "CustomHeaderPlugin") {
    onCall { call ->
        call.response.headers.append("X-Custom-Header", "Hello, world!")
    }
}
```

結果是，所有回應都將加入自訂標頭：

```HTTP
HTTP/1.1 200 OK
X-Custom-Header: Hello, world!
```

請注意，此外掛程式中的自訂標頭名稱和值是寫死的。您可以透過提供 [配置](#plugin-configuration) 來傳遞所需的自訂標頭名稱 / 值，使此外掛程式更加靈活。

### onCallReceive {id="on-call-receive"}

`onCallReceive` 處理常式提供 `transformBody` 函式，並允許您轉換從用戶端接收的資料。假設用戶端發出了一個範例 `POST` 請求，其主體中包含 `10` 作為 `text/plain`：

```HTTP
POST http://localhost:8080/transform-data
Content-Type: text/plain

10

```

要 [接收此主體](server-requests.md#objects) 作為整數值，您需要為 `POST` 請求建立路由處理常式，並使用 `Int` 參數呼叫 `call.receive`：

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
}
```

現在讓我們建立一個外掛程式，它將主體接收為整數值並將其加 `1`。為此，我們需要按如下方式在 `onCallReceive` 內部處理 `transformBody`：

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

上述程式碼片段中的 `transformBody` 運作方式如下：

1. `TransformBodyContext` 是一個 [Lambda 接收者](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)，它包含有關當前請求的型別資訊。在上面的範例中，`TransformBodyContext.requestedType` 屬性用於檢查請求的資料型別。
2. `data` 是一個 Lambda 引數，允許您將請求主體接收為 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) 並將其轉換為所需的型別。在上面的範例中，`ByteReadChannel.readLine()` 用於讀取請求主體。
3. 最後，您需要轉換並回傳資料。在我們的範例中，將 `1` 加到接收到的整數值中。

您可以在此處找到完整的範例：[DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。

### onCallRespond {id="on-call-respond"}

`onCallRespond` 也提供 `transformBody` 處理常式，並允許您轉換要發送到用戶端的資料。當在路由處理常式中調用 `call.respond` 函式時，會執行此處理常式。讓我們繼續使用 [onCallReceive](#on-call-receive) 中的範例，其中在 `POST` 請求處理常式中接收到整數值：

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
    call.respond(data)
}
```

呼叫 `call.respond` 會調用 `onCallRespond`，進而允許您轉換要發送到用戶端的資料。例如，下面的程式碼片段顯示如何將 `1` 加到初始值中：

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

您可以在此處找到完整的範例：[DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。

### 其他實用的處理常式 {id="other"}

除了 `onCall`、`onCallReceive` 和 `onCallRespond` 處理常式之外，Ktor 還提供了一組特定的掛鉤（hooks），對於處理呼叫的其他階段可能很有用。
您可以使用接受 `Hook` 作為參數的 `on` 處理常式來處理這些掛鉤。
這些掛鉤包括：

- `CallSetup` 在處理呼叫的第一步被調用。
- `ResponseBodyReadyForSend` 當回應主體經過所有轉換並準備好發送時調用。
- `ResponseSent` 當回應成功發送到用戶端時調用。
- `CallFailed` 當呼叫因例外狀況而失敗時調用。
- [AuthenticationChecked](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-checked/index.html) 在 [驗證](server-auth.md) 憑據檢查後執行。以下範例顯示如何使用此掛鉤來實作授權：[custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization)。

下面的範例顯示如何處理 `CallSetup`：

```kotlin
on(CallSetup) { call->
    // ...
}
```

> 還有 `MonitoringEvent` 掛鉤，允許您 [處理應用程式事件](#handle-app-events)，例如應用程式啟動或關閉。

### 共享呼叫狀態 {id="call-state"}

自訂外掛程式允許您共享與呼叫相關的任何值，因此您可以在處理此呼叫的任何處理常式中存取此值。此值作為屬性儲存在 `call.attributes` 集合中，並具有唯一的鍵。下面的範例示範如何使用屬性來計算接收請求與讀取主體之間的時間：

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

如果您發出 `POST` 請求，外掛程式會在主控台中印出延遲：

```Bash
Request URL: http://localhost:8080/transform-data
Read body delay (ms): 52
```

您可以在此處找到完整的範例：[DataTransformationBenchmarkPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationBenchmarkPlugin.kt)。

> 您也可以在 [路由處理常式](server-requests.md#request_information) 中存取呼叫屬性。

## 處理應用程式事件 {id="handle-app-events"}

[on](#other) 處理常式提供了使用 `MonitoringEvent` 掛鉤來處理與應用程式生命週期相關的事件的能力。
例如，您可以將以下 [預定義事件](server-events.md#predefined-events) 傳遞給 `on` 處理常式：

- `ApplicationStarting`
- `ApplicationStarted`
- `ApplicationStopPreparing`
- `ApplicationStopping`
- `ApplicationStopped`

下面的程式碼片段顯示如何使用 `ApplicationStopped` 處理應用程式關閉：

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
        // 釋放資源並取消訂閱事件
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

這對於釋放應用程式資源可能很有用。

## 提供外掛程式配置 {id="plugin-configuration"}

[自訂標頭](#custom-header) 範例示範了如何建立一個將預定義自訂標頭附加到每個回應的外掛程式。讓我們讓此外掛程式更有用，並提供一個用於傳遞所需的自訂標頭名稱 / 值的配置。

1. 首先，您需要定義一個配置類別：

   ```kotlin
   class PluginConfiguration {
       var headerName: String = "Custom-Header-Name"
       var headerValue: String = "Default value"
   }
   ```

2. 要在外掛程式中使用此配置，請將配置類別參照傳遞給 `createApplicationPlugin`：

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

   鑑於外掛程式配置欄位是可變的，建議將其儲存在區域變數中。

3. 最後，您可以按如下方式安裝並配置外掛程式：

   ```kotlin
   install(CustomHeaderPlugin) {
       headerName = "X-Custom-Header"
       headerValue = "Hello, world!"
   }
   ```

> 您可以在此處找到完整的範例：[CustomHeaderPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPlugin.kt)。

### 檔案中的配置 {id="configuration-file"}

Ktor 允許您在 [配置檔案](server-create-and-configure.topic#engine-main) 中指定外掛程式設定。
讓我們看看如何為 `CustomHeaderPlugin` 實現這一點：

1. 首先，在 `application.conf` 或 `application.yaml` 檔案中加入一個包含外掛程式設定的新群組：

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

   在我們的範例中，外掛程式設定儲存在 `http.custom_header` 群組中。

2. 要存取配置檔案屬性，請將 `ApplicationConfig` 傳遞給配置類別建構函式。
   `tryGetString` 函式回傳指定的屬性值：

   ```kotlin
   class CustomHeaderConfiguration(config: ApplicationConfig) {
       var headerName: String = config.tryGetString("header_name") ?: "Custom-Header-Name"
       var headerValue: String = config.tryGetString("header_value") ?: "Default value"
   }
   ```

3. 最後，將 `http.custom_header` 值指派給 `createApplicationPlugin` 函式的 `configurationPath` 參數：

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

> 您可以在此處找到完整的範例：[CustomHeaderPluginConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPluginConfigurable.kt)。

## 存取應用程式設定 {id="app-settings"}

### 配置 {id="config"}

您可以使用 `applicationConfig` 屬性存取您的伺服器配置，該屬性會回傳 [ApplicationConfig](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-application-config/index.html) 執行個體。下面的範例顯示如何獲取伺服器使用的虛擬主機和連接埠：

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val host = applicationConfig?.host
   val port = applicationConfig?.port
   println("Listening on $host:$port")
}
```

### 環境 {id="environment"}

要存取應用程式的環境，請使用 `environment` 屬性。例如，此屬性允許您判斷是否啟用了 [開發模式](server-development-mode.topic)：

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

## 其他 {id="misc"}

### 儲存外掛程式狀態 {id="plugin-state"}

要儲存外掛程式的狀態，您可以從處理常式 Lambda 中擷取任何值。請注意，建議透過使用並行資料結構和原子資料型別，使所有狀態值保持執行緒安全：

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

* 我可以將自訂外掛程式與可掛起（suspendable）的資料庫一起使用嗎？

  是的。所有的處理常式都是掛起函式，因此您可以在外掛程式內部執行任何可掛起的資料庫操作。但不要忘記為特定呼叫釋放資源（例如，透過使用 [on(ResponseSent)](#other)）。

* 如何將自訂外掛程式與阻塞式資料庫一起使用？

  由於 Ktor 使用協同程式和掛起函式，向阻塞式資料庫發出請求可能是危險的，因為執行阻塞呼叫的協同程式可能會被阻塞，然後永久掛起。為了防止這種情況，您需要建立一個單獨的 [CoroutineContext](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)：
   ```kotlin
   val databaseContext = newSingleThreadContext("DatabaseThread")
   ```
  然後，一旦建立了上下文，就將每次對資料庫的呼叫包裝到 `withContext` 呼叫中：
   ```kotlin
   onCall {
       withContext(databaseContext) {
           database.access(...) // 某個對資料庫的呼叫
       }
   }