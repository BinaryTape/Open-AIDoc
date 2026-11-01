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

v2.2.0以降、Ktorはカスタムクライアント[プラグイン](client-plugins.md)を作成するための新しいAPIを提供しています。通常、このAPIを使用する際に、パイプラインやフェーズといったKtorの内部概念を理解する必要はありません。
代わりに、`onRequest`や`onResponse`などの一連のハンドラーを使用して、[リクエストとレスポンスの処理](#call-handling)におけるさまざまなステージにアクセスできます。

## 最初のプラグインの作成とインストール {id="first-plugin"}

このセクションでは、各[リクエスト](client-requests.md)にカスタムヘッダーを追加する最初のプラグインを作成してインストールする方法を説明します。

1. プラグインを作成するには、[createClientPlugin](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.api/create-client-plugin.html)関数を呼び出し、プラグイン名を引数として渡します。
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       // Configure the plugin ...
   }
   ```
   
   この関数は、プラグインをインストールするために使用される `ClientPlugin` インスタンスを返します。

2. 各リクエストにカスタムヘッダーを追加するには、リクエストパラメータへのアクセスを提供する `onRequest` ハンドラーを使用できます。
   ```kotlin
   package com.example.plugins
   
   import io.ktor.client.plugins.api.*
   
   val CustomHeaderPlugin = createClientPlugin("CustomHeaderPlugin") {
       onRequest { request, _ ->
           request.headers.append("X-Custom-Header", "Default value")
       }
   }
   
   ```

3. [プラグインをインストール](client-plugins.md#install)するには、作成した `ClientPlugin` インスタンスをクライアントの設定ブロック内の `install` 関数に渡します。
   ```kotlin
   import com.example.plugins.*
   
   val client = HttpClient(CIO) {
       install(CustomHeaderPlugin)
   }
   ```
   
   
完全なコード例はこちらで確認できます: [CustomHeader.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeader.kt)。
以降のセクションでは、プラグイン設定の提供方法や、リクエストとレスポンスの処理方法について見ていきます。

## プラグイン設定の提供 {id="plugin-configuration"}

[前のセクション](#first-plugin)では、あらかじめ定義されたカスタムヘッダーを各リクエストに追加するプラグインの作成方法を説明しました。このプラグインをより汎用的にするために、任意のカスタムヘッダー名と値を渡せる設定（Configuration）を提供してみましょう。

1. まず、設定クラスを定義する必要があります。

   ```kotlin
   class CustomHeaderPluginConfig {
       var headerName: String = "X-Custom-Header"
       var headerValue: String = "Default value"
   }
   ```

2. この設定をプラグインで使用するには、設定クラスの参照を `createClientPlugin` に渡します。

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

   プラグイン設定のフィールドはミュータブル（変更可能）であるため、ローカル変数に保存することをお勧めします。

3. 最後に、次のようにプラグインをインストールして設定できます。

   ```kotlin
   val client = HttpClient(CIO) {
       install(CustomHeaderConfigurablePlugin) {
           headerName = "X-Custom-Header"
           headerValue = "Hello, world!"
       }
   }
   ```

> 完全なコード例はこちらで確認できます: [CustomHeaderConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderConfigurable.kt)。

## リクエストとレスポンスの処理 {id="call-handling"}

カスタムプラグインでは、専用の一連のハンドラーを使用して、リクエストおよびレスポンス処理のさまざまなステージにアクセスできます。例:
- `onRequest` と `onResponse` を使用すると、それぞれリクエストとレスポンスを処理できます。
- `transformRequestBody` と `transformResponseBody` を使用すると、リクエストボディやレスポンスボディに必要な変換を適用できます。

また、呼び出しの他のステージを処理するのに便利な特定のフックを呼び出すことができる `on(...)` ハンドラーもあります。
以下の表に、実行順にすべてのハンドラーを示します。

<Tabs>
<TabItem title="Basic hooks">

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
このハンドラーは各HTTP<Links href="client-requests.md" summary="リクエストの作成方法や、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について説明します。">リクエスト</Links>ごとに実行され、それを変更することができます。
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
<a href="client-requests.md#body">リクエストボディ</a>を変換できます。
このハンドラーでは、ボディを
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a>
（例えば、<code>TextContent</code>、<code>ByteArrayContent</code>、または <code>FormDataContent</code>）にシリアライズするか、変換が適用できない場合は <code>null</code> を返す必要があります。
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
このハンドラーは受信したHTTP<Links href="client-requests.md" summary="リクエストの作成方法や、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について説明します。">レスポンス</Links>ごとに実行され、レスポンスのロギングやクッキーの保存など、さまざまな方法でインスペクション（検証・調査）できます。
</p>
<p>
<emphasis>
例: <a href="#example-log-headers">ヘッダーのロギング</a>、<a href="#example-response-time">レスポンスタイム</a>
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
<a href="client-responses.md#body">レスポンスボディ</a>を変換できます。
このハンドラーは各 <code>HttpResponse.body</code> 呼び出しに対して呼び出されます。
ボディを <code>requestedType</code> のインスタンスにデシリアライズするか、変換が適用できない場合は <code>null</code> を返す必要があります。
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
このハンドラーはクライアントが<a href="client-create-and-configure.md#close-client">クローズ</a>されたときに呼び出されます。
</td>
</tr>

</table>

</TabItem>
<TabItem title="All hooks">

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
<code>SetupRequest</code> フックは、リクエスト処理の最初に実行されます。
</td>
</tr>

<snippet id="onRequest">

<tr>
<td>
<code>onRequest</code>
</td>
<td>
<p>
このハンドラーは各HTTP<Links href="client-requests.md" summary="リクエストの作成方法や、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について説明します。">リクエスト</Links>ごとに実行され、それを変更することができます。
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
<a href="client-requests.md#body">リクエストボディ</a>を変換できます。
このハンドラーでは、ボディを
<a href="https://api.ktor.io/ktor-http/io.ktor.http.content/-outgoing-content/index.html">OutgoingContent</a>
（例えば、<code>TextContent</code>、<code>ByteArrayContent</code>、または <code>FormDataContent</code>）にシリアライズするか、変換が適用できない場合は <code>null</code> を返す必要があります。
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
<code>Send</code> フックは、レスポンスを調査し、必要に応じて追加のリクエストを開始する機能を提供します。
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
<code>SendingRequest</code> フックは、ユーザーによって開始されたものでない場合も含め、すべてのリクエストに対して実行されます。
たとえば、リクエストによってリダイレクトが発生した場合、<code>onRequest</code> ハンドラーは最初のリクエストに対してのみ実行されますが、<code>on(SendingRequest)</code> は最初のリクエストとリダイレクトされたリクエストの両方に対して実行されます。
同様に、<code>on(Send)</code> を使用して追加のリクエストを開始した場合、ハンドラーは次のように順序付けされます。
</p>
<code-block lang="Console" code="--&gt; onRequest&#10;--&gt; on(Send)&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse&#10;--&gt; on(SendingRequest)&#10;&lt;-- onResponse"/>
<p>
<emphasis>
例: <a href="#example-log-headers">ヘッダーのロギング</a>、<a href="#example-response-time">レスポンスタイム</a>
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
このハンドラーは受信したHTTP<Links href="client-requests.md" summary="リクエストの作成方法や、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメータの指定方法について説明します。">レスポンス</Links>ごとに実行され、レスポンスのロギングやクッキーの保存など、さまざまな方法でインスペクション（検証・調査）できます。
</p>
<p>
<emphasis>
例: <a href="#example-log-headers">ヘッダーのロギング</a>、<a href="#example-response-time">レスポンスタイム</a>
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
<a href="client-responses.md#body">レスポンスボディ</a>を変換できます。
このハンドラーは各 <code>HttpResponse.body</code> 呼び出しに対して呼び出されます。
ボディを <code>requestedType</code> のインスタンスにデシリアライズするか、変換が適用できない場合は <code>null</code> を返す必要があります。
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
このハンドラーはクライアントが<a href="client-create-and-configure.md#close-client">クローズ</a>されたときに呼び出されます。
</td>
</tr>

</snippet>

</table>

</TabItem>
</Tabs>

### 呼び出し状態の共有 {id="call-state"}

カスタムプラグインを使用すると、呼び出しに関連する任意の値を共有できるため、その呼び出しを処理する任意のハンドラー内からその値にアクセスできます。
この値は、`call.attributes` コレクション内に一意のキーを持つ属性（Attribute）として保存されます。
以下の例は、属性を使用してリクエストの送信からレスポンスの受信までの時間を計算する方法を示しています。

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

完全なコード例はこちらで確認できます: [ResponseTime.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/src/main/kotlin/com/example/plugins/ResponseTime.kt)。

## クライアント設定へのアクセス {id="client-config"}

[HttpClient](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) インスタンスを返す `client` プロパティを使用して、クライアント設定にアクセスできます。
以下の例は、クライアントが使用している[プロキシアドレス](client-proxy.md)を取得する方法を示しています。

```kotlin
import io.ktor.client.plugins.api.*

val SimplePlugin = createClientPlugin("SimplePlugin") {
    val proxyAddress = client.engineConfig.proxy?.address()
    println("Proxy address: $proxyAddress")
}
```

## 例 {id="examples"}

以下のコードサンプルは、カスタムプラグインのいくつかの例を示しています。
完成したプロジェクトはこちらで確認できます: [client-custom-plugin](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/client-custom-plugin/)。

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

### ヘッダーのロギング {id="example-log-headers"}

リクエストヘッダーとレスポンスヘッダーをログ出力するプラグインの作成方法を示します。

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

### レスポンスタイム {id="example-response-time"}

リクエストを送信してからレスポンスを受信するまでの時間を計測するプラグインの作成方法を示します。

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

`transformRequestBody` フックと `transformResponseBody` フックを使用して、リクエストボディとレスポンスボディを変換する方法を示します。

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

完全なコード例はこちらで確認できます: [client-custom-plugin-data-transformation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-data-transformation)。

### 認証 {id="authentication"}

サーバーから未認証レスポンスを受信した場合に、`on(Send)` フックを使用して `Authorization` ヘッダーにベアラートークンを追加する方法を示すサンプルのKtorプロジェクトです。

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

完全なコード例はこちらで確認できます: [client-custom-plugin-auth](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-custom-plugin-auth)。