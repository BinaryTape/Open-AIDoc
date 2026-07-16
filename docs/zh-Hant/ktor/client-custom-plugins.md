[//]: # (title: 自訂用戶端外掛程式)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-custom-plugin"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
瞭解如何建立您自己的自訂用戶端外掛程式。
</link-summary>

從 v2.2.0 開始，Ktor 提供了一套新的 API 用於建立自訂用戶端[外掛程式](client-plugins.md)。一般而言，這套 API 不需要瞭解 Ktor 的內部概念，例如管線（pipelines）、階段（phases）等等。
相反地，您可以使用一組處理常式（例如 `onRequest`、`onResponse` 等）存取[處理請求與回應](#call-handling)的不同階段。

## 建立並安裝您的第一個外掛程式 {id="first-plugin"}

在本節中，我們將演示如何建立並安裝您的第一個外掛程式，該外掛程式會為每個[請求](client-requests.md)新增一個自訂標頭：

1. 要建立外掛程式，請呼叫 [createClientPlugin](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.api/create-client-plugin.html) 函式並傳遞外掛程式名稱作為引數：
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       // 配置外掛程式 ...
   }
   ```
   
   此函式會傳回將用於安裝外掛程式的 `ClientPlugin` 執行個體。

2. 要為每個請求附加自訂標頭，您可以使用 `onRequest` 處理常式，它提供了請求參數的存取權限：
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       onRequest { request, _ ->
           request.headers.append("X-Custom-Header", "Default value")
       }
   }
   
   ```

3. 要[安裝外掛程式](client-plugins.md#install)，請在用戶端的配置區塊內將建立的 `ClientPlugin` 執行個體傳遞給 `install` 函式：
   ```kotlin
   import com.example.plugins.*
   
   val client = HttpClient(CIO) {
       install(CustomHeaderPlugin)
   }
   ```
   
   
您可以在這裡找到完整的範例：[CustomHeader.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeader.kt)。
在接下來的章節中，我們將探討如何提供外掛程式配置以及如何處理請求與回應。

## 提供外掛程式配置 {id="plugin-configuration"}

[前一節](#first-plugin)演示了如何建立一個為每個回應附加預定義自訂標頭的外掛程式。讓我們讓這個外掛程式更有用，並提供一個配置來傳遞任何自訂標頭的名稱與值：

1. 首先，您需要定義一個配置類別：

   ```kotlin
   class CustomHeaderPluginConfig {
       var headerName: String = "X-Custom-Header"
       var headerValue: String = "Default value"
   }
   ```

2. 要在外掛程式中使用此配置，請將配置類別參照傳遞給 `createClientPlugin`：

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

3. 最後，您可以按如下方式安裝並配置外掛程式：

   ```kotlin
   val client = HttpClient(CIO) {
       install(CustomHeaderConfigurablePlugin) {
           headerName = "X-Custom-Header"
           headerValue = "Hello, world!"
       }
   }
   ```

> 您可以在這裡找到完整的範例：[CustomHeaderConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderConfigurable.kt)。

## 處理請求與回應 {id="call-handling"}

自訂外掛程式使用一組專用的處理常式來存取處理請求與回應的不同階段，例如：
- `onRequest` 和 `onResponse` 分別允許您處理請求與回應。
- `transformRequestBody` 和 `transformResponseBody` 可用於對請求和回應主體應用必要的轉換。

還有 `on(...)` 處理常式，允許您叫用特定的掛勾（hooks），這對於處理呼叫的其他階段可能很有用。
下表按執行順序列出了所有處理常式：

<Tabs>
<TabItem title="基本掛鉤">

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
此處理常式會針對每個 HTTP <Links href="/ktor/client-requests" summary="瞭解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">請求</Links>執行，並允許您對其進行修改。
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
允許您轉換 <a href="#body">請求主體</a>。
在此處理常式中，您需要將主體序列化為 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例如 <code>TextContent</code>、<code>ByteArrayContent</code> 或 <code>FormDataContent</code>），
如果您的轉換不適用，則傳回 <code>null</code>。
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
此處理常式會針對每個傳入的 HTTP <Links href="/ktor/client-requests" summary="瞭解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">回應</Links>執行，並允許您以各種方式檢查它：記錄回應、儲存 Cookie 等等。
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
允許您轉換 <a href="#body">回應主體</a>。
此處理常式會針對每個 <code>HttpResponse.body</code> 呼叫叫用。
您需要將主體反序列化為 <code>requestedType</code> 的執行個體，如果您的轉換不適用，則傳回 <code>null</code>。
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
允許您清理此外掛程式分配的資源。當用戶端被<a href="#close-client">關閉</a>時，會呼叫此處理常式。
</td>
</tr>

</table>

</TabItem>
<TabItem title="所有掛鉤">

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
<code>SetupRequest</code> 掛鉤在請求處理中首先執行。
</td>
</tr>

<snippet id="onRequest">

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
此處理常式會針對每個 HTTP <Links href="/ktor/client-requests" summary="瞭解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">請求</Links>執行，並允許您對其進行修改。
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
允許您轉換 <a href="#body">請求主體</a>。
在此處理常式中，您需要將主體序列化為 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例如 <code>TextContent</code>、<code>ByteArrayContent</code> 或 <code>FormDataContent</code>），
如果您的轉換不適用，則傳回 <code>null</code>。
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
<code>Send</code> 掛鉤提供了檢查回應並在需要時啟動額外請求的能力。這對於處理重新導向、重試請求、身分驗證等可能很有用。
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
<code>SendingRequest</code> 掛鉤會針對每個請求執行，即使它不是由使用者啟動的。
例如，如果一個請求導致了重新導向，<code>onRequest</code> 處理常式將僅針對原始請求執行，而 <code>on(SendingRequest)</code> 將針對原始請求和重新導向的請求都執行。
同樣地，如果您使用 <code>on(Send)</code> 啟動了額外請求，處理常式的順序將如下：
</p>
<code-block lang="Console" code="--&gt; onRequest&#10;--&gt; on(Send)&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse"></code-block>
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
此處理常式會針對每個傳入的 HTTP <Links href="/ktor/client-requests" summary="瞭解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">回應</Links>執行，並允許您以各種方式檢查它：記錄回應、儲存 Cookie 等等。
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
允許您轉換 <a href="#body">回應主體</a>。
此處理常式會針對每個 <code>HttpResponse.body</code> 呼叫叫用。
您需要將主體反序列化為 <code>requestedType</code> 的執行個體，如果您的轉換不適用，則傳回 <code>null</code>。
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
允許您清理此外掛程式分配的資源。當用戶端被<a href="#close-client">關閉</a>時，會呼叫此處理常式。
</td>
</tr>

</snippet>

</table>

</TabItem>
</Tabs>

### 共享呼叫狀態 {id="call-state"}

自訂外掛程式允許您共享任何與呼叫相關的值，以便您可以在處理此呼叫的任何處理常式中存取此值。此值作為具有唯一金鑰的屬性儲存在 `call.attributes` 集合中。以下範例演示了如何使用屬性來計算發送請求與接收回應之間的時間：

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

您可以在這裡找到完整的範例：[ResponseTime.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/ResponseTime.kt)。

## 存取用戶端配置 {id="client-config"}

您可以使用 `client` 屬性存取您的用戶端配置，該屬性會傳回 [HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 執行個體。
以下範例顯示如何取得用戶端使用的[代理位址](client-proxy.md)：

```kotlin
import io.ktor.client.plugins.api.*

val SimplePlugin = createClientPlugin("SimplePlugin") {
    val proxyAddress = client.engineConfig.proxy?.address()
    println("Proxy address: $proxyAddress")
}
```

## 範例 {id="examples"}

下面的程式碼樣本演示了幾個自訂外掛程式的範例。
您可以在這裡找到產生的專案：[client-custom-plugin](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/)。

### 自訂標頭 {id="example-custom-header"}

顯示如何建立一個為每個請求新增自訂標頭的外掛程式：

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

演示如何建立一個記錄請求和回應標頭的外掛程式：

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

顯示如何建立一個外掛程式來測量發送請求與接收回應之間的時間：

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

顯示如何使用 `transformRequestBody` 和 `transformResponseBody` 掛鉤來轉換請求和回應主體：

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
            val receivedContent = content.readUTF8Line()!!.split(";")
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

您可以在這裡找到完整的範例：[client-custom-plugin-data-transformation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-data-transformation)。

### 身分驗證 {id="authentication"}

一個範例 Ktor 專案，顯示如何使用 `on(Send)` 掛鉤，在收到來自伺服器的未經授權回應時，將載體權杖（bearer token）新增至 `Authorization` 標頭：

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

您可以在這裡找到完整的範例：[client-custom-plugin-auth](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-auth)。