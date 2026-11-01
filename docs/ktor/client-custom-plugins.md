[//]: # (title: 自定义客户端插件)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-custom-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何创建自定义客户端插件。
</link-summary>

从 v2.2.0 开始，Ktor 提供了一套用于创建自定义客户端[插件](client-plugins.md)的新 API。通常，该 API 不需要了解流水线（pipeline）、阶段（phase）等 Ktor 内部概念。
相反，你可以使用一组处理程序（例如 `onRequest`、`onResponse` 等）来访问[处理请求和响应](#call-handling)的不同阶段。

## 创建并安装你的第一个插件 {id="first-plugin"}

在本节中，我们将演示如何创建并安装你的第一个插件，该插件会向每个[请求](client-requests.md)添加自定义标头：

1. 要创建插件，请调用 [createClientPlugin](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.api/create-client-plugin.html) 函数并将插件名称作为实参传递：
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       // 配置插件...
   }
   ```
   
   该函数返回将用于安装插件的 `ClientPlugin` 实例。

2. 要向每个请求追加自定义标头，可以使用 `onRequest` 处理程序，它提供了对请求参数的访问：
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       onRequest { request, _ ->
           request.headers.append("X-Custom-Header", "Default value")
       }
   }
   
   ```

3. 要[安装插件](client-plugins.md#install)，请将创建的 `ClientPlugin` 实例传递给客户端配置块内的 `install` 函数：
   ```kotlin
   import com.example.plugins.*
   
   val client = HttpClient(CIO) {
       install(CustomHeaderPlugin)
   }
   ```
   
   
你可以在此处找到完整示例：[CustomHeader.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeader.kt)。
在接下来的几节中，我们将介绍如何提供插件配置以及处理请求和响应。

## 提供插件配置 {id="plugin-configuration"}

[上一节](#first-plugin)演示了如何创建一个向每个响应追加预定义自定义标头的插件。让我们让这个插件更加实用，并提供用于传递任意自定义标头名称和值的配置：

1. 首先，你需要定义一个配置类：

   ```kotlin
   class CustomHeaderPluginConfig {
       var headerName: String = "X-Custom-Header"
       var headerValue: String = "Default value"
   }
   ```

2. 要在插件中使用此配置，请将配置类引用传递给 `createClientPlugin`：

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

   鉴于插件配置字段是可变的，建议将其保存在局部变量中。

3. 最后，你可以按如下方式安装并配置插件：

   ```kotlin
   val client = HttpClient(CIO) {
       install(CustomHeaderConfigurablePlugin) {
           headerName = "X-Custom-Header"
           headerValue = "Hello, world!"
       }
   }
   ```

> 你可以在此处找到完整示例：[CustomHeaderConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderConfigurable.kt)。

## 处理请求和响应 {id="call-handling"}

自定义插件通过一组专用处理程序提供对处理请求和响应的不同阶段的访问，例如：
- `onRequest` 和 `onResponse` 分别允许你处理请求和响应。
- `transformRequestBody` 和 `transformResponseBody` 可用于对请求体和响应体应用必要的转换。

还有一个 `on(...)` 处理程序，允许你调用可能对处理调用的其他阶段有用的特定钩子。
下表按执行顺序列出了所有处理程序：

<Tabs>
<TabItem title="基本钩子">

<table>

<tr>
<td>
处理程序
</td>
<td>
说明
</td>
</tr>

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
针对每个 HTTP <Links href="client-requests.md" summary="了解如何发起请求并指定各种请求参数：请求 URL、HTTP 方法、标头和请求体。">请求</Links>执行此处理程序，并允许对其进行修改。
</p>
<p>
<emphasis>
示例：<a href="#example-custom-header">自定义标头</a>
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
允许你转换<a href="client-requests.md#body">请求体</a>。
在此处理程序中，你需要将请求体序列化为 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例如 <code>TextContent</code>、<code>ByteArrayContent</code> 或 <code>FormDataContent</code>），
如果不适用你的转换则返回 <code>null</code>。
</p>
<p>
<emphasis>
示例：<a href="#data-transformation">数据转换</a>
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
针对每个传入的 HTTP <Links href="client-requests.md" summary="了解如何发起请求并指定各种请求参数：请求 URL、HTTP 方法、标头和请求体。">响应</Links>执行此处理程序，并允许你以各种方式对其进行检查：记录响应日志、保存 Cookie 等。
</p>
<p>
<emphasis>
示例：<a href="#example-log-headers">记录标头</a>、<a href="#example-response-time">响应时间</a>
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
允许你转换<a href="client-responses.md#body">响应体</a>。
每次调用 <code>HttpResponse.body</code> 时都会调用此处理程序。
你需要将响应体反序列化为 <code>requestedType</code> 的实例，如果不适用你的转换则返回 <code>null</code>。
</p>
<p>
<emphasis>
示例：<a href="#data-transformation">数据转换</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>onClose</code>
</td>
<td>
允许你清理此插件分配的资源。
当客户端被<a href="client-create-and-configure.md#close-client">关闭</a>时调用此处理程序。
</td>
</tr>

</table>

</TabItem>
<TabItem title="所有钩子">

<table>

<tr>
<td>
处理程序
</td>
<td>
说明
</td>
</tr>

<tr>
<td>
<code>on(SetupRequest)</code>
</td>
<td>
<code>SetupRequest</code> 钩子在请求处理中最先执行。
</td>
</tr>

<snippet id="onRequest">

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
针对每个 HTTP <Links href="client-requests.md" summary="了解如何发起请求并指定各种请求参数：请求 URL、HTTP 方法、标头和请求体。">请求</Links>执行此处理程序，并允许对其进行修改。
</p>
<p>
<emphasis>
示例：<a href="#example-custom-header">自定义标头</a>
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
允许你转换<a href="client-requests.md#body">请求体</a>。
在此处理程序中，你需要将请求体序列化为 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例如 <code>TextContent</code>、<code>ByteArrayContent</code> 或 <code>FormDataContent</code>），
如果不适用你的转换则返回 <code>null</code>。
</p>
<p>
<emphasis>
示例：<a href="#data-transformation">数据转换</a>
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
<code>Send</code> 钩子提供了检查响应并在需要时发起额外请求的能力。
这对于处理重定向、重试请求、身份验证等非常有用。
</p>
<p>
<emphasis>
示例：<a href="#authentication">身份验证</a>
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
<code>SendingRequest</code> 钩子针对每个请求都会执行，即使该请求不是由用户发起的。
例如，如果一个请求导致重定向，则仅针对原始请求执行 <code>onRequest</code> 处理程序，而 <code>on(SendingRequest)</code> 将针对原始请求和重定向请求均执行。
类似地，如果你使用 <code>on(Send)</code> 发起额外的请求，处理程序将按如下顺序执行：
</p>
<code-block lang="Console" code="--&gt; onRequest&#10;--&gt; on(Send)&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse"/>
<p>
<emphasis>
示例：<a href="#example-log-headers">记录标头</a>、<a href="#example-response-time">响应时间</a>
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
针对每个传入的 HTTP <Links href="client-requests.md" summary="了解如何发起请求并指定各种请求参数：请求 URL、HTTP 方法、标头和请求体。">响应</Links>执行此处理程序，并允许你以各种方式对其进行检查：记录响应日志、保存 Cookie 等。
</p>
<p>
<emphasis>
示例：<a href="#example-log-headers">记录标头</a>、<a href="#example-response-time">响应时间</a>
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
允许你转换<a href="client-responses.md#body">响应体</a>。
每次调用 <code>HttpResponse.body</code> 时都会调用此处理程序。
你需要将响应体反序列化为 <code>requestedType</code> 的实例，如果不适用你的转换则返回 <code>null</code>。
</p>
<p>
<emphasis>
示例：<a href="#data-transformation">数据转换</a>
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
允许你清理此插件分配的资源。
当客户端被<a href="client-create-and-configure.md#close-client">关闭</a>时调用此处理程序。
</td>
</tr>

</snippet>

</table>

</TabItem>
</Tabs>

### 共享调用状态 {id="call-state"}

自定义插件允许你共享与调用相关的任何值，以便你可以在处理该调用的任何处理程序内部访问此值。
该值作为具有唯一键的特性存储在 `call.attributes` 集合中。
以下示例演示了如何使用特性来计算发送请求与接收响应之间的时间：

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

你可以在此处找到完整示例：[ResponseTime.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/ResponseTime.kt)。

## 访问客户端配置 {id="client-config"}

你可以使用 `client` 属性访问客户端配置，该属性返回 [HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 实例。
以下示例演示了如何获取客户端使用的[代理地址](client-proxy.md)：

```kotlin
import io.ktor.client.plugins.api.*

val SimplePlugin = createClientPlugin("SimplePlugin") {
    val proxyAddress = client.engineConfig.proxy?.address()
    println("Proxy address: $proxyAddress")
}
```

## 示例 {id="examples"}

以下代码示例演示了自定义插件的几个范例。
你可以在此处找到生成的完整项目：[client-custom-plugin](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/)。

### 自定义标头 {id="example-custom-header"}

演示如何创建一个向每个请求添加自定义标头的插件：

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

### 记录标头 {id="example-log-headers"}

演示如何创建一个记录请求和响应标头的插件：

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

### 响应时间 {id="example-response-time"}

演示如何创建一个测量发送请求与接收响应之间时间的插件：

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

### 数据转换 {id="data-transformation"}

演示如何使用 `transformRequestBody` 和 `transformResponseBody` 钩子转换请求体和响应体：

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

你可以在此处找到完整示例：[client-custom-plugin-data-transformation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-data-transformation)。

### 身份验证 {id="authentication"}

一个 Ktor 示例项目，演示了如果从服务器收到未授权响应，如何使用 `on(Send)` 钩子向 `Authorization` 标头添加 Bearer 令牌：

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

你可以在此处找到完整示例：[client-custom-plugin-auth](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-auth)。