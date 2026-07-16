[//]: # (title: カスタムクライアントプラグイン)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-custom-plugin"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
独自のカスタムクライアントプラグインを作成する方法を学びます。
</link-summary>

v2.2.0以降、Ktorはカスタムクライアント[プラグイン](client-plugins.md)を作成するための新しいAPIを提供しています。一般的に、このAPIではパイプラインやフェーズなどのKtorの内部概念を理解する必要はありません。
その代わりに、`onRequest`や`onResponse`などの一連のハンドラーを使用して、[リクエストとレスポンスの処理](#call-handling)のさまざまなステージにアクセスできます。

## 最初のプラグインの作成とインストール {id="first-plugin"}

このセクションでは、各[リクエスト](client-requests.md)にカスタムヘッダーを追加する最初のプラグインを作成してインストールする方法を説明します。

1. プラグインを作成するには、[createClientPlugin](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.api/create-client-plugin.html)関数を呼び出し、引数としてプラグイン名を渡します。
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       // プラグインの設定 ...
   }
   ```
   
   この関数は、プラグインのインストールに使用される`ClientPlugin`インスタンスを返します。

2. 各リクエストにカスタムヘッダーを追加するには、リクエストパラメータへのアクセスを提供する`onRequest`ハンドラーを使用できます。
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       onRequest { request, _ ->
           request.headers.append("X-Custom-Header", "Default value")
       }
   }
   
   ```

3. [プラグインをインストール](client-plugins.md#install)するには、作成した`ClientPlugin`インスタンスをクライアントの設定ブロック内の`install`関数に渡します。
   ```kotlin
   import com.example.plugins.*
   
   val client = HttpClient(CIO) {
       install(CustomHeaderPlugin)
   }
   ```
   
   
完全な例はこちらにあります: [CustomHeader.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeader.kt)。
以降のセクションでは、プラグイン設定を提供する方法と、リクエストおよびレスポンスを処理する方法について詳しく説明します。

## プラグイン設定の提供 {id="plugin-configuration"}

[前のセクション](#first-plugin)では、各レスポンスにあらかじめ定義されたカスタムヘッダーを追加するプラグインの作成方法を示しました。このプラグインをより便利にするために、任意のカスタムヘッダー名と値を渡すための設定を提供してみましょう。

1. まず、設定クラスを定義する必要があります。

   ```kotlin
   class CustomHeaderPluginConfig {
       var headerName: String = "X-Custom-Header"
       var headerValue: String = "Default value"
   }
   ```

2. プラグインでこの設定を使用するには、`createClientPlugin`に設定クラスの参照を渡します。

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

   プラグインの設定フィールドは可変（mutable）であるため、ローカル変数に保存することをお勧めします。

3. 最後に、次のようにプラグインをインストールして設定できます。

   ```kotlin
   val client = HttpClient(CIO) {
       install(CustomHeaderConfigurablePlugin) {
           headerName = "X-Custom-Header"
           headerValue = "Hello, world!"
       }
   }
   ```

> 完全な例はこちらにあります: [CustomHeaderConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderConfigurable.kt)。

## リクエストとレスポンスの処理 {id="call-handling"}

カスタムプラグインは、専用のハンドラーセットを使用して、リクエストとレスポンスを処理するさまざまなステージへのアクセスを提供します。例えば：
- `onRequest`と`onResponse`を使用すると、それぞれリクエストとレスポンスを処理できます。
- `transformRequestBody`と`transformResponseBody`を使用して、リクエストおよびレスポンスのボディに必要な変換を適用できます。

また、呼び出しの他のステージを処理するのに役立つ特定のフックを呼び出すことができる`on(...)`ハンドラーもあります。
以下の表は、すべてのハンドラーを実行順に示しています。

<Tabs>
<TabItem title="基本的なフック">

<table>

<tr>
<td>
ハンドラー
</td>
<td>
説明
</td>
</tr>

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
このハンドラーは各HTTP <Links href="/ktor/client-requests" summary="リクエストの作成方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について学びます。">リクエスト</Links>に対して実行され、リクエストを修正できます。
</p>
<p>
<emphasis>
例: <a href="#example-custom-header">カスタムヘッダー</a>
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
<a href="#body">リクエストボディ</a>を変換できます。
このハンドラーでは、ボディを 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例: <code>TextContent</code>、<code>ByteArrayContent</code>、<code>FormDataContent</code>）にシリアライズするか、
変換が適用されない場合は<code>null</code>を返す必要があります。
</p>
<p>
<emphasis>
例: <a href="#data-transformation">データ変換</a>
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
このハンドラーは、着信する各HTTP <Links href="/ktor/client-requests" summary="リクエストの作成方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について学びます。">レスポンス</Links>に対して実行され、
レスポンスのログ記録、クッキーの保存など、さまざまな方法でレスポンスを検査できます。
</p>
<p>
<emphasis>
例: <a href="#example-log-headers">ヘッダーのログ記録</a>、<a href="#example-response-time">レスポンス時間</a>
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
<a href="#body">レスポンスボディ</a>を変換できます。
このハンドラーは、<code>HttpResponse.body</code>が呼び出されるたびに呼び出されます。
ボディを<code>requestedType</code>のインスタンスにデシリアライズするか、
変換が適用されない場合は<code>null</code>を返す必要があります。
</p>
<p>
<emphasis>
例: <a href="#data-transformation">データ変換</a>
</emphasis>
</p>
</td>
</tr>

<tr>
<td>
<code>onClose</code>
</td>
<td>
このプラグインによって割り当てられたリソースをクリーンアップできます。
このハンドラーは、クライアントが<a href="#close-client">クローズ</a>されたときに呼び出されます。
</td>
</tr>

</table>

</TabItem>
<TabItem title="すべてのフック">

<table>

<tr>
<td>
ハンドラー
</td>
<td>
説明
</td>
</tr>

<tr>
<td>
<code>on(SetupRequest)</code>
</td>
<td>
<code>SetupRequest</code>フックは、リクエスト処理で最初に実行されます。
</td>
</tr>

<snippet id="onRequest">

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
このハンドラーは各HTTP <Links href="/ktor/client-requests" summary="リクエストの作成方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について学びます。">リクエスト</Links>に対して実行され、リクエストを修正できます。
</p>
<p>
<emphasis>
例: <a href="#example-custom-header">カスタムヘッダー</a>
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
<a href="#body">リクエストボディ</a>を変換できます。
このハンドラーでは、ボディを 
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a> 
（例: <code>TextContent</code>、<code>ByteArrayContent</code>、<code>FormDataContent</code>）にシリアライズするか、
変換が適用されない場合は<code>null</code>を返す必要があります。
</p>
<p>
<emphasis>
例: <a href="#data-transformation">データ変換</a>
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
<code>Send</code>フックは、レスポンスを検査し、必要に応じて追加のリクエストを開始する機能を提供します。 
これは、リダイレクトの処理、リクエストの再試行、認証などに役立ちます。
</p>
<p>
<emphasis>
例: <a href="#authentication">認証</a>
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
<code>SendingRequest</code>フックは、ユーザーによって開始されたものでなくても、すべてのリクエストに対して実行されます。
たとえば、リクエストによってリダイレクトが発生した場合、<code>onRequest</code>ハンドラーは元のリクエストに対してのみ実行されますが、<code>on(SendingRequest)</code>は元のリクエストとリダイレクトされたリクエストの両方に対して実行されます。
同様に、<code>on(Send)</code>を使用して追加のリクエストを開始した場合、ハンドラーは次のように順序付けられます。
</p>
<code-block lang="Console" code="--&gt; onRequest&#10;--&gt; on(Send)&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse"></code-block>
<p>
<emphasis>
例: <a href="#example-log-headers">ヘッダーのログ記録</a>、<a href="#example-response-time">レスポンス時間</a>
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
このハンドラーは、着信する各HTTP <Links href="/ktor/client-requests" summary="リクエストの作成方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について学びます。">レスポンス</Links>に対して実行され、
レスポンスのログ記録、クッキーの保存など、さまざまな方法でレスポンスを検査できます。
</p>
<p>
<emphasis>
例: <a href="#example-log-headers">ヘッダーのログ記録</a>、<a href="#example-response-time">レスポンス時間</a>
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
<a href="#body">レスポンスボディ</a>を変換できます。
このハンドラーは、<code>HttpResponse.body</code>が呼び出されるたびに呼び出されます。
ボディを<code>requestedType</code>のインスタンスにデシリアライズするか、
変換が適用されない場合は<code>null</code>を返す必要があります。
</p>
<p>
<emphasis>
例: <a href="#data-transformation">データ変換</a>
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
このプラグインによって割り当てられたリソースをクリーンアップできます。
このハンドラーは、クライアントが<a href="#close-client">クローズ</a>されたときに呼び出されます。
</td>
</tr>

</snippet>

</table>

</TabItem>
</Tabs>

### 呼び出し状態の共有 {id="call-state"}

カスタムプラグインを使用すると、呼び出しに関連する任意の値を共有できるため、その呼び出しを処理する任意のハンドラー内でこの値にアクセスできます。
この値は、`call.attributes`コレクション内の一意のキーを持つ属性として保存されます。
以下の例では、属性を使用してリクエストの送信からレスポンスの受信までの時間を計算する方法を示します。

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

完全な例はこちらにあります: [ResponseTime.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/ResponseTime.kt)。

## クライアント設定へのアクセス {id="client-config"}

[HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html)インスタンスを返す`client`プロパティを使用して、クライアント設定にアクセスできます。
以下の例は、クライアントで使用される[プロキシアドレス](client-proxy.md)を取得する方法を示しています。

```kotlin
import io.ktor.client.plugins.api.*

val SimplePlugin = createClientPlugin("SimplePlugin") {
    val proxyAddress = client.engineConfig.proxy?.address()
    println("Proxy address: $proxyAddress")
}
```

## 例 {id="examples"}

以下のコードサンプルは、カスタムプラグインのいくつかの例を示しています。
結果のプロジェクトはこちらにあります: [client-custom-plugin](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/)。

### カスタムヘッダー {id="example-custom-header"}

各リクエストにカスタムヘッダーを追加するプラグインの作成方法を示します。

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

### ヘッダーのログ記録 {id="example-log-headers"}

リクエストとレスポンスのヘッダーをログに記録するプラグインの作成方法を示します。

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

### レスポンス時間 {id="example-response-time"}

リクエストの送信からレスポンスの受信までの時間を測定するプラグインの作成方法を示します。

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

### データ変換 {id="data-transformation"}

`transformRequestBody`フックと`transformResponseBody`フックを使用してリクエストおよびレスポンスのボディを変換する方法を示します。

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

完全な例はこちらにあります: [client-custom-plugin-data-transformation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-data-transformation)。

### 認証 {id="authentication"}

サーバーから未認可（Unauthorized）のレスポンスを受信した場合に、`on(Send)`フックを使用して`Authorization`ヘッダーにベアラートークンを追加する方法を示すサンプルKtorプロジェクトです。

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

完全な例はこちらにあります: [client-custom-plugin-auth](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-auth)。