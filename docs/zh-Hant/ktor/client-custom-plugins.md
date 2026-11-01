[//]: # (title: 自訂用戶端外掛程式)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-custom-plugin"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何建立您專屬的自訂用戶端外掛程式。
</link-summary>

從 v2.2.0 開始，Ktor 提供了一個用於建立自訂用戶端[外掛程式](client-plugins.md)的新 API。一般而言，此 API 不需要理解 Ktor 內部概念（如管線、階段等）。
相反地，您可以透過一組處理常式（例如 `onRequest`、`onResponse` 等）存取[處理請求與回應](#call-handling)的不同階段。

## 建立並安裝您的第一個外掛程式 {id="first-plugin"}

在本節中，我們將示範如何建立並安裝您的第一個外掛程式，該外掛程式會為每個[請求](client-requests.md)新增自訂標頭：

1. 若要建立外掛程式，請呼叫 [createClientPlugin](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.api/create-client-plugin.html) 函式並傳入外掛程式名稱作為引數：
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       // 配置外掛程式 ...
   }
   ```
   
   此函式會傳回將用於安裝外掛程式的 `ClientPlugin` 執行個體。

2. 若要為每個請求附加自訂標頭，您可以使用 `onRequest` 處理常式，該常式提供對請求參數的存取：
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       onRequest { request, _ ->
           request.headers.append("X-Custom-Header", "Default value")
       }
   }
   
   ```

3. 若要[安裝外掛程式](client-plugins.md#install)，請在用戶端的配置區塊內將建立的 `ClientPlugin` 執行個體傳遞給 `install` 函式：
   ```kotlin
   import com.example.plugins.*
   
   val client = HttpClient(CIO) {
       install(CustomHeaderPlugin)
   }
   ```
   
   
您可以在此處找到完整範例：[CustomHeader.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeader.kt)。
在接下來的章節中，我們將探討如何提供外掛程式配置以及如何處理請求和回應。

## 提供外掛程式配置 {id="plugin-configuration"}

[上一節](#first-plugin)示範了如何建立一個為每個回應附加預定義自訂標頭的外掛程式。讓我們讓這個外掛程式更有用，並提供一個配置來傳入任意的自訂標頭名稱與值：

1. 首先，您需要定義一個配置類別：

   ```kotlin
   class CustomHeaderPluginConfig {
       var headerName: String = "X-Custom-Header"
       var headerValue: String = "Default value"
   }
   ```

2. 若要在外掛程式中使用此配置，請將配置類別的參照傳遞給 `createClientPlugin`：

   ```kotlin
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderConfigurablePlugin = createClientPlugin("CustomHeaderConfigurablePlugin", ::CustomHeaderPluginConfig) {
       val headerName = pluginConfig.headerName
       val headerValue = pluginConfig.headerValue
   
       onRequest { request, _ ->
           request.headers.append(headerName, headerValue)
       }
   }
   ```

   鑑於外掛程式配置欄位是可變的，建議將它們儲存在區域變數中。

3. 最後，您可以依照以下方式安裝並配置該外掛程式：

   ```kotlin
   val client = HttpClient(CIO) {
       install(CustomHeaderConfigurablePlugin) {
           headerName = "X-Custom-Header"
           headerValue = "Hello, world!"
       }
   }
   ```

> 您可以在此處找到完整範例：[CustomHeaderConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderConfigurable.kt)。

## 處理請求與回應 {id="call-handling"}

自訂外掛程式使用一組專用的處理常式提供對處理請求與回應不同階段的存取，例如：
- `onRequest` 與 `onResponse` 分別允許您處理請求與回應。
- `transformRequestBody` 與 `transformResponseBody` 可用於對請求和回應主體套用必要的轉換。

此外還有 `on(...)` 處理常式，允許您呼叫特定掛鉤，這在處理呼叫的其他階段時可能非常有用。
下表依執行順序列出所有處理常式：

<Tabs>
<TabItem title="Basic hooks">

<table>

<tr>
<td>
處理常式
</td>
<td>
說明
</td>
</tr>

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
此處理常式會針對每個 HTTP <Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">請求</Links>執行，並允許您修改它。
</p>
<p>
<emphasis>
範例：<a href="#example-custom-header">自訂標頭</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>transformRequestBody</code>
</td>
<td>
<p>
允許您轉換<a href="client-requests.md#body">請求主體</a>。
在此處理常式中，您需要將主體序列化為 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例如 <code>TextContent</code>、<code>ByteArrayContent</code> 或 <code>FormDataContent</code>），
若轉換不適用則傳回 <code>null</code>。
</p>
<p>
<emphasis>
範例：<a href="#data-transformation">資料轉換</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>onResponse</code>
</td>
<td>
<p>
此處理常式會針對每個傳入的 HTTP <Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">回應</Links>執行，並允許您以各種方式檢查它：記錄回應、儲存 Cookie 等。
</p>
<p>
<emphasis>
範例：<a href="#example-log-headers">記錄標頭</a>、<a href="#example-response-time">回應時間</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>transformResponseBody</code>
</td>
<td>
<p>
允許您轉換<a href="client-responses.md#body">回應主體</a>。
此處理常式會在每次呼叫 <code>HttpResponse.body</code> 時觸發。
您需要將主體反序列化為 <code>requestedType</code> 的執行個體，
若轉換不適用則傳回 <code>null</code>。
</p>
<p>
<emphasis>
範例：<a href="#data-transformation">資料轉換</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>onClose</code>
</td>
<td>
允許您清理此外掛程式配置的資源。
當用戶端被<a href="client-create-and-configure.md#close-client">關閉</a>時會呼叫此處理常式。
</td>
</tr>

</table>

</TabItem>
<TabItem title="All hooks">

<table>

<tr>
<td>
處理常式
</td>
<td>
說明
</td>
</tr>

<tr>
<td>
<code>on(SetupRequest)</code>
</td>
<td>
<code>SetupRequest</code> 掛鉤在請求處理中最先執行。
</td>
</tr>

<snippet id="onRequest">

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
此處理常式會針對每個 HTTP <Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">請求</Links>執行，並允許您修改它。
</p>
<p>
<emphasis>
範例：<a href="#example-custom-header">自訂標頭</a>
</emphasis>
</p>
</td>
</tr>

</snippet>

<snippet id="transformRequestBody">

<tr>
<td>
<code>transformRequestBody</code>
</td>
<td>
<p>
允許您轉換<a href="client-requests.md#body">請求主體</a>。
在此處理常式中，您需要將主體序列化為 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例如 <code>TextContent</code>、<code>ByteArrayContent</code> 或 <code>FormDataContent</code>），
若轉換不適用則傳回 <code>null</code>。
</p>
<p>
<emphasis>
範例：<a href="#data-transformation">資料轉換</a>
</emphasis>
</p>
</td>
</tr>

</snippet>

<tr>
<td>
<code>on(Send)</code>
</td>
<td>
<p>
<code>Send</code> 掛鉤提供檢查回應並在需要時發起額外請求的能力。
這在處理重新導向、重試請求、身分驗證等情況時非常有用。
</p>
<p>
<emphasis>
範例：<a href="#authentication">身分驗證</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>on(SendingRequest)</code>
</td>
<td>
<p>
<code>SendingRequest</code> 掛鉤會針對每個請求執行，
即使該請求不是由使用者發起的。
例如，如果一個請求導致重新導向，<code>onRequest</code> 處理常式將僅針對原始請求執行，
而 <code>on(SendingRequest)</code> 則會針對原始請求和重新導向後的請求都執行。
同樣地，如果您使用 <code>on(Send)</code> 發起額外請求，
處理常式的執行順序如下：
</p>
<code-block lang="Console" code="--&gt; onRequest&#10;--&gt; on(Send)&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse"/>
<p>
<emphasis>
範例：<a href="#example-log-headers">記錄標頭</a>、<a href="#example-response-time">回應時間</a>
</emphasis>
</p>
</td>
</tr>

<snippet id="onResponse">

<tr>
<td>
<code>onResponse</code>
</td>
<td>
<p>
此處理常式會針對每個傳入的 HTTP <Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">回應</Links>執行，並允許您以各種方式檢查它：記錄回應、儲存 Cookie 等。
</p>
<p>
<emphasis>
範例：<a href="#example-log-headers">記錄標頭</a>、<a href="#example-response-time">回應時間</a>
</emphasis>
</p>
</td>
</tr>

</snippet>

<snippet id="transformResponseBody">

<tr>
<td>
<code>transformResponseBody</code>
</td>
<td>
<p>
允許您轉換<a href="client-responses.md#body">回應主體</a>。
此處理常式會在每次呼叫 <code>HttpResponse.body</code> 時觸發。
您需要將主體反序列化為 <code>requestedType</code> 的執行個體，
若轉換不適用則傳回 <code>null</code>。
</p>
<p>
<emphasis>
範例：<a href="#data-transformation">資料轉換</a>
</emphasis>
</p>
</td>
</tr>

</snippet>

<snippet id="onClose">

<tr>
<td>
<code>onClose</code>
</td>
<td>
允許您清理此外掛程式配置的資源。
當用戶端被<a href="client-create-and-configure.md#close-client">關閉</a>時會呼叫此處理常式。
</td>
</tr>

</snippet>

</table>

</TabItem>
</Tabs>

### 共用呼叫狀態 {id="call-state"}

自訂外掛程式允許您共用與呼叫相關的任何值，
以便您可以在處理此呼叫的任何處理常式內存取該值。
此值作為具有唯一索引鍵的屬性儲存在 `call.attributes` 集合中。
以下範例示範如何使用屬性計算傳送請求與接收回應之間的時間：

```kotlin
import io.ktor.client.plugins.api.*
import io.ktor.util.*

val ResponseTimePlugin = createClientPlugin("ResponseTimePlugin") {
    val onCallTimeKey = AttributeKey<Long>("onCallTimeKey")
    on(SendingRequest) { request, content ->
        val onCallTime = System.currentTimeMillis()
        request.attributes.put(onCallTimeKey, onCallTime)
    }

    onResponse { response ->
        val onCallTime = response.call.attributes[onCallTimeKey]
        val onCallReceiveTime = System.currentTimeMillis()
        println("Read response delay (ms): ${onCallReceiveTime - onCallTime}")
    }
}
```

您可以在此處找到完整範例：[ResponseTime.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/ResponseTime.kt)。

## 存取用戶端配置 {id="client-config"}

您可以使用傳回 [HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 執行個體的 `client` 屬性來存取用戶端配置。
以下範例示範如何取得用戶端所使用的[代理伺服器位址](client-proxy.md)：

```kotlin
import io.ktor.client.plugins.api.*

val SimplePlugin = createClientPlugin("SimplePlugin") {
    val proxyAddress = client.engineConfig.proxy?.address()
    println("Proxy address: $proxyAddress")
}
```

## 範例 {id="examples"}

以下程式碼範例展示了數個自訂外掛程式的範例。
您可以在此處找到最終專案：[client-custom-plugin](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/)。

### 自訂標頭 {id="example-custom-header"}

展示如何建立一個為每個請求新增自訂標頭的外掛程式：

```kotlin
package com.example.plugins

import io.ktor.client.plugins.api.*

val CustomHeaderConfigurablePlugin = createClientPlugin("CustomHeaderConfigurablePlugin", ::CustomHeaderPluginConfig) {
    val headerName = pluginConfig.headerName
    val headerValue = pluginConfig.headerValue

    onRequest { request, _ ->
        request.headers.append(headerName, headerValue)
    }
}

class CustomHeaderPluginConfig {
    var headerName: String = "X-Custom-Header"
    var headerValue: String = "Default value"
}
```

### 記錄標頭 {id="example-log-headers"}

示範如何建立一個記錄請求與回應標頭的外掛程式：

```kotlin
package com.example.plugins

import io.ktor.client.plugins.api.*

val LoggingHeadersPlugin = createClientPlugin("LoggingHeadersPlugin") {
    on(SendingRequest) { request, content ->
        println("Request headers:")
        request.headers.entries().forEach { entry ->
            printHeader(entry)
        }
    }

    onResponse { response ->
        println("Response headers:")
        response.headers.entries().forEach { entry ->
            printHeader(entry)
        }
    }
}

private fun printHeader(entry: Map.Entry<String, List<String>>) {
    var headerString = entry.key + ": "
    entry.value.forEach { headerValue ->
        headerString += "${headerValue};"
    }
    println("-> $headerString")
}

```

### 回應時間 {id="example-response-time"}

展示如何建立一個測量傳送請求到接收回應之間時間的外掛程式：

```kotlin
package com.example.plugins

import io.ktor.client.plugins.api.*
import io.ktor.util.*

val ResponseTimePlugin = createClientPlugin("ResponseTimePlugin") {
    val onCallTimeKey = AttributeKey<Long>("onCallTimeKey")
    on(SendingRequest) { request, content ->
        val onCallTime = System.currentTimeMillis()
        request.attributes.put(onCallTimeKey, onCallTime)
    }

    onResponse { response ->
        val onCallTime = response.call.attributes[onCallTimeKey]
        val onCallReceiveTime = System.currentTimeMillis()
        println("Read response delay (ms): ${onCallReceiveTime - onCallTime}")
    }
}

```

### 資料轉換 {id="data-transformation"}

展示如何使用 `transformRequestBody` 與 `transformResponseBody` 掛鉤轉換請求和回應主體：

<Tabs>
<TabItem title="DataTransformation.kt">

```kotlin
package com.example.plugins

import com.example.model.*
import io.ktor.client.plugins.api.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.utils.io.*

val DataTransformationPlugin = createClientPlugin("DataTransformationPlugin") {
    transformRequestBody { request, content, bodyType ->
        if (bodyType?.type == User::class) {
            val user = content as User
            TextContent(text="${user.name};${user.age}", contentType = ContentType.Text.Plain)
        } else {
            null
        }
    }
    transformResponseBody { response, content, requestedType ->
        if (requestedType.type == User::class) {
            val receivedContent = content.readLine()!!.split(";")
            User(receivedContent[0], receivedContent[1].toInt())
        } else {
            content
        }
    }
}

```

</TabItem>
<TabItem title="Application.kt">

```kotlin
package com.example

import com.example.model.*
import com.example.plugins.*
import com.example.server.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.*

fun main() {
    startServer()
    runBlocking {
        val client = HttpClient(CIO) {
            install(DataTransformationPlugin)
        }
        val bodyAsText = client.post("http://0.0.0.0:8080/post-data") {
            setBody(User("John", 42))
        }.bodyAsText()
        val user = client.get("http://0.0.0.0:8080/get-data").body<User>()
        println("Userinfo: $bodyAsText")
        println("Username: ${user.name}, age: ${user.age}")
    }
}

```

</TabItem>
<TabItem title="User.kt">

```kotlin
package com.example.model

data class User(val name: String, val age: Int)

```

</TabItem>
</Tabs>

您可以在此處找到完整範例：[client-custom-plugin-data-transformation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-data-transformation)。

### 身分驗證 {id="authentication"}

一個展示如何使用 `on(Send)` 掛鉤的 Ktor 專案範例：當從伺服器收到未授權的回應時，在 `Authorization` 標頭中加入 Bearer 權杖：

<Tabs>
<TabItem title="Auth.kt">

```kotlin
package com.example.plugins

import io.ktor.client.plugins.api.*
import io.ktor.http.*

val AuthPlugin = createClientPlugin("AuthPlugin", ::AuthPluginConfig) {
    val token = pluginConfig.token

    on(Send) { request ->
        val originalCall = proceed(request)
        originalCall.response.run { // this: HttpResponse
            if(status == HttpStatusCode.Unauthorized && headers["WWW-Authenticate"]!!.contains("Bearer")) {
                request.headers.append("Authorization", "Bearer $token")
                proceed(request)
            } else {
                originalCall
            }
        }
    }
}

class AuthPluginConfig {
    var token: String = ""
}

```

</TabItem>
<TabItem title="Application.kt">

```kotlin
package com.example

import com.example.plugins.*
import com.example.server.*
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.*

fun main() {
    startServer()
    runBlocking {
        val client = HttpClient(CIO) {
            install(AuthPlugin) {
                token = "abc123"
            }
        }
        val response = client.get("http://0.0.0.0:8080/")
        println(response.bodyAsText())
    }
}

```

</TabItem>
</Tabs>

您可以在此處找到完整範例：[client-custom-plugin-auth](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-auth)。