[//]: # (title: 커스텀 클라이언트 플러그인)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-custom-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
나만의 커스텀 클라이언트 플러그인을 만드는 방법을 알아봅니다.
</link-summary>

v2.2.0부터 Ktor는 커스텀 클라이언트 [플러그인](client-plugins.md)을 만들기 위한 새로운 API를 제공합니다. 일반적으로 이 API는 파이프라인(pipelines)이나 단계(phases)와 같은 Ktor 내부 개념에 대한 이해를 요구하지 않습니다. 
대신, `onRequest`, `onResponse` 등과 같은 일련의 핸들러를 사용하여 [요청 및 응답 처리](#call-handling)의 각 단계에 접근할 수 있습니다.

## 첫 번째 플러그인 생성 및 설치 {id="first-plugin"}

이 섹션에서는 각 [요청](client-requests.md)에 커스텀 헤더를 추가하는 첫 번째 플러그인을 만들고 설치하는 방법을 보여줍니다.

1. 플러그인을 만들려면 [createClientPlugin](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.api/create-client-plugin.html) 함수를 호출하고 플러그인 이름을 인자로 전달합니다.
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       // 플러그인 설정 ...
   }
   ```
   
   이 함수는 플러그인 설치에 사용될 `ClientPlugin` 인스턴스를 반환합니다.

2. 각 요청에 커스텀 헤더를 추가하려면 요청 파라미터에 접근할 수 있는 `onRequest` 핸들러를 사용할 수 있습니다.
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       onRequest { request, _ ->
           request.headers.append("X-Custom-Header", "Default value")
       }
   }
   
   ```

3. [플러그인을 설치](client-plugins.md#install)하려면, 클라이언트 설정 블록 내부의 `install` 함수에 생성된 `ClientPlugin` 인스턴스를 전달합니다.
   ```kotlin
   import com.example.plugins.*
   
   val client = HttpClient(CIO) {
       install(CustomHeaderPlugin)
   }
   ```
   
   
전체 예제는 여기에서 확인할 수 있습니다: [CustomHeader.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeader.kt). 
다음 섹션에서는 플러그인 설정을 제공하고 요청 및 응답을 처리하는 방법을 살펴보겠습니다.

## 플러그인 설정 제공 {id="plugin-configuration"}

[이전 섹션](#first-plugin)에서는 각 요청에 미리 정의된 커스텀 헤더를 추가하는 플러그인을 만드는 방법을 보여주었습니다. 이제 이 플러그인을 더 유용하게 만들기 위해, 임의의 헤더 이름과 값을 전달할 수 있는 설정을 제공해 보겠습니다.

1. 먼저, 설정 클래스를 정의해야 합니다.

   ```kotlin
   class CustomHeaderPluginConfig {
       var headerName: String = "X-Custom-Header"
       var headerValue: String = "Default value"
   }
   ```

2. 플러그인에서 이 설정을 사용하려면 `createClientPlugin`에 설정 클래스 참조를 전달합니다.

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

   플러그인 설정 필드는 가변적(mutable)이므로, 이를 로컬 변수에 저장하는 것이 좋습니다.

3. 마지막으로, 다음과 같이 플러그인을 설치하고 설정할 수 있습니다.

   ```kotlin
   val client = HttpClient(CIO) {
       install(CustomHeaderConfigurablePlugin) {
           headerName = "X-Custom-Header"
           headerValue = "Hello, world!"
       }
   }
   ```

> 전체 예제는 여기에서 확인할 수 있습니다: [CustomHeaderConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderConfigurable.kt).

## 요청 및 응답 처리 {id="call-handling"}

커스텀 플러그인은 전용 핸들러 세트를 사용하여 요청 및 응답 처리의 다양한 단계에 대한 접근을 제공합니다. 예를 들면 다음과 같습니다.
- `onRequest` 및 `onResponse`는 각각 요청과 응답을 처리할 수 있게 해줍니다.
- `transformRequestBody` 및 `transformResponseBody`는 요청 및 응답 본문에 필요한 변환을 적용하는 데 사용될 수 있습니다.

또한 호출의 다른 단계를 처리하는 데 유용한 특정 훅(hook)을 호출할 수 있는 `on(...)` 핸들러도 있습니다. 
아래 표에는 모든 핸들러가 실행 순서대로 나열되어 있습니다.

<Tabs>
<TabItem title="기본 훅 (Basic hooks)">

<table>

<tr>
<td>
핸들러
</td>
<td>
설명
</td>
</tr>

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
이 핸들러는 각 HTTP <Links href="/ktor/client-requests" summary="요청을 생성하고 요청 URL, HTTP 메서드, 헤더 및 요청 본문과 같은 다양한 요청 파라미터를 지정하는 방법을 알아봅니다.">요청</Links>에 대해 실행되며 이를 수정할 수 있게 해줍니다.
</p>
<p>
<emphasis>
예제: <a href="#example-custom-header">커스텀 헤더</a>
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
<a href="#body">요청 본문</a>을 변환할 수 있게 해줍니다.
이 핸들러에서는 본문을 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
(예: <code>TextContent</code>, <code>ByteArrayContent</code>, 또는 <code>FormDataContent</code>)로 직렬화하거나,
변환을 적용할 수 없는 경우 <code>null</code>을 반환해야 합니다.
</p>
<p>
<emphasis>
예제: <a href="#data-transformation">데이터 변환</a>
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
이 핸들러는 각 수신 HTTP <Links href="/ktor/client-requests" summary="요청을 생성하고 요청 URL, HTTP 메서드, 헤더 및 요청 본문과 같은 다양한 요청 파라미터를 지정하는 방법을 알아봅니다.">응답</Links>에 대해 실행되며 이를 다양하게 검사할 수 있게 해줍니다(응답 로깅, 쿠키 저장 등).
</p>
<p>
<emphasis>
예제: <a href="#example-log-headers">헤더 로깅</a>, <a href="#example-response-time">응답 시간</a>
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
<a href="#body">응답 본문</a>을 변환할 수 있게 해줍니다.
이 핸들러는 각 <code>HttpResponse.body</code> 호출 시마다 호출됩니다.
본문을 <code>requestedType</code>의 인스턴스로 역직렬화하거나, 
변환을 적용할 수 없는 경우 <code>null</code>을 반환해야 합니다.
</p>
<p>
<emphasis>
예제: <a href="#data-transformation">데이터 변환</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>onClose</code>
</td>
<td>
이 플러그인에 의해 할당된 리소스를 정리할 수 있게 해줍니다.
이 핸들러는 클라이언트가 <a href="#close-client">닫힐(closed)</a> 때 호출됩니다.
</td>
</tr>

</table>

</TabItem>
<TabItem title="모든 훅 (All hooks)">

<table>

<tr>
<td>
핸들러
</td>
<td>
설명
</td>
</tr>

<tr>
<td>
<code>on(SetupRequest)</code>
</td>
<td>
<code>SetupRequest</code> 훅은 요청 처리에서 가장 먼저 실행됩니다.
</td>
</tr>

<snippet id="onRequest">

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
이 핸들러는 각 HTTP <Links href="/ktor/client-requests" summary="요청을 생성하고 요청 URL, HTTP 메서드, 헤더 및 요청 본문과 같은 다양한 요청 파라미터를 지정하는 방법을 알아봅니다.">요청</Links>에 대해 실행되며 이를 수정할 수 있게 해줍니다.
</p>
<p>
<emphasis>
예제: <a href="#example-custom-header">커스텀 헤더</a>
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
<a href="#body">요청 본문</a>을 변환할 수 있게 해줍니다.
이 핸들러에서는 본문을 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
(예: <code>TextContent</code>, <code>ByteArrayContent</code>, 또는 <code>FormDataContent</code>)로 직렬화하거나,
변환을 적용할 수 없는 경우 <code>null</code>을 반환해야 합니다.
</p>
<p>
<emphasis>
예제: <a href="#data-transformation">데이터 변환</a>
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
<code>Send</code> 훅은 응답을 검사하고 필요한 경우 추가 요청을 시작할 수 있는 기능을 제공합니다. 
이는 리다이렉트 처리, 요청 재시도, 인증 등에 유용할 수 있습니다.
</p>
<p>
<emphasis>
예제: <a href="#authentication">인증</a>
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
<code>SendingRequest</code> 훅은 사용자가 직접 시작하지 않은 요청을 포함하여 모든 요청에 대해 실행됩니다.
예를 들어, 요청 결과로 리다이렉트가 발생하면 <code>onRequest</code> 핸들러는 원본 요청에 대해서만 실행되지만, <code>on(SendingRequest)</code>는 원본 요청과 리다이렉트된 요청 모두에 대해 실행됩니다.
마찬가지로, <code>on(Send)</code>를 사용하여 추가 요청을 시작한 경우 핸들러는 다음과 같은 순서로 실행됩니다.
</p>
<code-block lang="Console" code="--&gt; onRequest&#10;--&gt; on(Send)&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse"></code-block>
<p>
<emphasis>
예제: <a href="#example-log-headers">헤더 로깅</a>, <a href="#example-response-time">응답 시간</a>
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
이 핸들러는 각 수신 HTTP <Links href="/ktor/client-requests" summary="요청을 생성하고 요청 URL, HTTP 메서드, 헤더 및 요청 본문과 같은 다양한 요청 파라미터를 지정하는 방법을 알아봅니다.">응답</Links>에 대해 실행되며 이를 다양하게 검사할 수 있게 해줍니다(응답 로깅, 쿠키 저장 등).
</p>
<p>
<emphasis>
예제: <a href="#example-log-headers">헤더 로깅</a>, <a href="#example-response-time">응답 시간</a>
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
<a href="#body">응답 본문</a>을 변환할 수 있게 해줍니다.
이 핸들러는 각 <code>HttpResponse.body</code> 호출 시마다 호출됩니다.
본문을 <code>requestedType</code>의 인스턴스로 역직렬화하거나, 
변환을 적용할 수 없는 경우 <code>null</code>을 반환해야 합니다.
</p>
<p>
<emphasis>
예제: <a href="#data-transformation">데이터 변환</a>
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
이 플러그인에 의해 할당된 리소스를 정리할 수 있게 해줍니다.
이 핸들러는 클라이언트가 <a href="#close-client">닫힐(closed)</a> 때 호출됩니다.
</td>
</tr>

</snippet>

</table>

</TabItem>
</Tabs>

### 호출 상태 공유 {id="call-state"}

커스텀 플러그인을 사용하면 호출과 관련된 모든 값을 공유하여, 해당 호출을 처리하는 모든 핸들러 내부에서 이 값에 접근할 수 있습니다. 
이 값은 `call.attributes` 컬렉션에 고유한 키와 함께 속성(attribute)으로 저장됩니다. 
아래 예제는 속성을 사용하여 요청 전송과 응답 수신 사이의 시간을 계산하는 방법을 보여줍니다.

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

전체 예제는 여기에서 확인할 수 있습니다: [ResponseTime.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/ResponseTime.kt).

## 클라이언트 설정 접근 {id="client-config"}

[HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 인스턴스를 반환하는 `client` 프로퍼티를 사용하여 클라이언트 설정에 접근할 수 있습니다.
아래 예제는 클라이언트가 사용하는 [프록시 주소](client-proxy.md)를 가져오는 방법을 보여줍니다.

```kotlin
import io.ktor.client.plugins.api.*

val SimplePlugin = createClientPlugin("SimplePlugin") {
    val proxyAddress = client.engineConfig.proxy?.address()
    println("Proxy address: $proxyAddress")
}
```

## 예제 {id="examples"}

아래 코드 샘플들은 커스텀 플러그인의 여러 예제를 보여줍니다.
결과 프로젝트는 여기에서 확인할 수 있습니다: [client-custom-plugin](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/).

### 커스텀 헤더 {id="example-custom-header"}

각 요청에 커스텀 헤더를 추가하는 플러그인을 만드는 방법을 보여줍니다.

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

### 헤더 로깅 {id="example-log-headers"}

요청 및 응답 헤더를 로깅하는 플러그인을 만드는 방법을 보여줍니다.

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

### 응답 시간 {id="example-response-time"}

요청 전송과 응답 수신 사이의 시간을 측정하는 플러그인을 만드는 방법을 보여줍니다.

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

### 데이터 변환 {id="data-transformation"}

`transformRequestBody` 및 `transformResponseBody` 훅을 사용하여 요청 및 응답 본문을 변환하는 방법을 보여줍니다.

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

전체 예제는 여기에서 확인할 수 있습니다: [client-custom-plugin-data-transformation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-data-transformation).

### 인증 {id="authentication"}

서버로부터 인증되지 않은 응답을 받았을 때 `on(Send)` 훅을 사용하여 `Authorization` 헤더에 베어러 토큰(bearer token)을 추가하는 방법을 보여주는 샘플 Ktor 프로젝트입니다.

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

전체 예제는 여기에서 확인할 수 있습니다: [client-custom-plugin-auth](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-auth).