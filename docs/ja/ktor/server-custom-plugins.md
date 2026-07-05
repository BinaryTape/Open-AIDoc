[//]: # (title: カスタムサーバープラグイン)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
独自のカスタムプラグインを作成する方法を学びます。
</link-summary>

v2.0.0以降、Ktorはカスタム[プラグイン](server-plugins.md)を作成するための新しいAPIを提供しています。一般的に、このAPIではパイプラインやフェーズなどのKtor内部の概念を理解する必要はありません。代わりに、`onCall`、`onCallReceive`、`onCallRespond`ハンドラーを使用して、[リクエストとレスポンスの処理](#call-handling)のさまざまな段階にアクセスできます。

> このトピックで説明されているAPIは、v2.0.0以降で有効です。古いバージョンについては、[ベースAPI](server-custom-plugins-base-api.md)を使用できます。

## 最初のプラグインを作成してインストールする {id="first-plugin"}

このセクションでは、最初のプラグインを作成してインストールする方法を説明します。
[Ktorプロジェクトの作成、開封、実行](server-create-a-new-project.topic)チュートリアルで作成したアプリケーションを開始プロジェクトとして使用できます。

1. プラグインを作成するには、[createApplicationPlugin](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-application-plugin.html)関数を呼び出し、プラグイン名を渡します。
   ```kotlin
   import io.ktor.server.application.*
   
   val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
       println("SimplePlugin is installed!")
   }
   ```

   この関数は、次のステップでプラグインをインストールするために使用される`ApplicationPlugin`インスタンスを返します。
   > [特定のルートにインストール](server-plugins.md#install-route)できるプラグインを作成できる[createRouteScopedPlugin](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-route-scoped-plugin.html)関数もあります。
2. [プラグインをインストール](server-plugins.md#install)するには、アプリケーションの初期化コードで作成した`ApplicationPlugin`インスタンスを`install`関数に渡します。
   ```kotlin
   fun Application.module() {
       install(SimplePlugin)
   }
   ```
3. 最後に、アプリケーションを[実行](server-run.md)して、コンソール出力にプラグインの挨拶が表示されることを確認します。
   ```Bash
   2021-10-14 14:54:08.269 [main] INFO  Application - Autoreload is disabled because the development mode is off.
   SimplePlugin is installed!
   2021-10-14 14:54:08.900 [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```

完全な例はこちらにあります: [SimplePlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/SimplePlugin.kt)。
以降のセクションでは、さまざまなステージでのコールの処理方法と、プラグインの設定を提供する方法について見ていきます。

## コールを処理する {id="call-handling"}

カスタムプラグインでは、コールのさまざまな段階へのアクセスを提供する一連のハンドラーを使用して、[リクエスト](server-requests.md)と[レスポンス](server-responses.md)を処理できます。

* [onCall](#on-call)を使用すると、リクエスト/レスポンス情報の取得、レスポンスパラメータの変更（カスタムヘッダーの追加など）などが可能です。
* [onCallReceive](#on-call-receive)を使用すると、クライアントから受信したデータを取得および変換できます。
* [onCallRespond](#on-call-respond)を使用すると、クライアントに送信する前にデータを変換できます。
* [on(...)](#other)を使用すると、コールの他の段階やコール中に発生した例外を処理するのに役立つ特定のフックを呼び出すことができます。
* 必要に応じて、`call.attributes`を使用して異なるハンドラー間で[コールの状態](#call-state)を共有できます。

### onCall {id="on-call"}

`onCall`ハンドラーは、ラムダ引数として`ApplicationCall`を受け取ります。これにより、リクエスト/レスポンス情報にアクセスし、レスポンスパラメータを変更（[カスタムヘッダーの追加](#custom-header)など）できます。リクエスト/レスポンスのボディを変換する必要がある場合は、[onCallReceive](#on-call-receive)または[onCallRespond](#on-call-respond)を使用してください。

#### 例1: リクエストのロギング {id="request-logging"}

以下の例は、`onCall`を使用して受信リクエストをログに記録するカスタムプラグインを作成する方法を示しています。

```kotlin
val RequestLoggingPlugin = createApplicationPlugin(name = "RequestLoggingPlugin") {
    onCall { call ->
        call.request.origin.apply {
            println("Request URL: $scheme://$localHost:$localPort$uri")
        }
    }
}
```

このプラグインをインストールすると、アプリケーションはリクエストされたURLをコンソールに表示します。例：

```Bash
Request URL: http://0.0.0.0:8080/
Request URL: http://0.0.0.0:8080/index
```

#### 例2: カスタムヘッダー {id="custom-header"}

この例では、各レスポンスにカスタムヘッダーを追加するプラグインを作成する方法を示します。

```kotlin
val CustomHeaderPlugin = createApplicationPlugin(name = "CustomHeaderPlugin") {
    onCall { call ->
        call.response.headers.append("X-Custom-Header", "Hello, world!")
    }
}
```

結果として、すべてのレスポンスにカスタムヘッダーが追加されます。

```HTTP
HTTP/1.1 200 OK
X-Custom-Header: Hello, world!
```

このプラグインのカスタムヘッダー名と値はハードコードされていることに注意してください。必要なカスタムヘッダー名/値を渡すための[設定](#plugin-configuration)を提供することで、このプラグインをより柔軟にすることができます。

### onCallReceive {id="on-call-receive"}

`onCallReceive`ハンドラーは`transformBody`関数を提供し、クライアントから受信したデータを変換できるようにします。クライアントが、ボディに`text/plain`として`10`を含むサンプルの`POST`リクエストを行うと仮定します。

```HTTP
POST http://localhost:8080/transform-data
Content-Type: text/plain

10

```

この[ボディを整数値として受信](server-requests.md#objects)するには、`POST`リクエスト用のルートハンドラーを作成し、`Int`パラメータを指定して`call.receive`を呼び出す必要があります。

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
}
```

では、ボディを整数値として受け取り、それに`1`を加算するプラグインを作成してみましょう。これを行うには、次のように`onCallReceive`内で`transformBody`を処理する必要があります。

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

上記のコードスニペットの`transformBody`は次のように動作します。

1. `TransformBodyContext`は、現在のリクエストに関する型情報を含む[ラムダレシーバー](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)です。上記の例では、`TransformBodyContext.requestedType`プロパティを使用して、要求されたデータ型を確認しています。
2. `data`は、リクエストボディを[ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)として受信し、必要な型に変換できるラムダ引数です。上記の例では、`ByteReadChannel.readLine()`を使用してリクエストボディを読み取っています。
3. 最後に、データを変換して返す必要があります。この例では、受信した整数値に`1`が加算されます。

完全な例はこちらにあります: [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。

### onCallRespond {id="on-call-respond"}

`onCallRespond`も`transformBody`ハンドラーを提供し、クライアントに送信されるデータを変換できるようにします。このハンドラーは、ルートハンドラーで`call.respond`関数が呼び出されたときに実行されます。 [onCallReceive](#on-call-receive)の例の続きとして、`POST`リクエストハンドラーで整数値が受信される場合を考えます。

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
    call.respond(data)
}
```

`call.respond`を呼び出すと`onCallRespond`が呼び出され、クライアントに送信されるデータを変換できるようになります。例えば、以下のコードスニペットは初期値に`1`を加算する方法を示しています。

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

完全な例はこちらにあります: [DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt)。

### その他の便利なハンドラー {id="other"}

`onCall`、`onCallReceive`、`onCallRespond`ハンドラーに加えて、Ktorはコールの他の段階を処理するのに役立つ一連の特定のフックを提供します。
これらのフックは、`Hook`をパラメータとして受け取る`on`ハンドラーを使用して処理できます。
これらのフックには以下が含まれます。

- `CallSetup`: コールの処理の最初のステップとして呼び出されます。
- `ResponseBodyReadyForSend`: レスポンスボディがすべての変換を通過し、送信準備が整ったときに呼び出されます。
- `ResponseSent`: レスポンスがクライアントに正常に送信されたときに呼び出されます。
- `CallFailed`: コールが例外で失敗したときに呼び出されます。
- [AuthenticationChecked](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-checked/index.html): [認証](server-auth.md)資格情報の確認後に実行されます。次の例は、このフックを使用して認機能を実装する方法を示しています: [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization)。

以下の例は、`CallSetup`を処理する方法を示しています。

```kotlin
on(CallSetup) { call->
    // ...
}
```

> アプリケーションの起動や停止などの[アプリケーションイベントを処理](#handle-app-events)できる`MonitoringEvent`フックもあります。

### コールの状態を共有する {id="call-state"}

カスタムプラグインを使用すると、コールに関連する任意の値を共有できるため、そのコールを処理する任意のハンドラー内でこの値にアクセスできます。この値は、`call.attributes`コレクションに一意のキーを持つ属性として保存されます。以下の例は、属性を使用してリクエストの受信からボディの読み取りまでの時間を計算する方法を示しています。

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

`POST`リクエストを行うと、プラグインはコンソールに遅延を表示します。

```Bash
Request URL: http://localhost:8080/transform-data
Read body delay (ms): 52
```

完全な例はこちらにあります: [DataTransformationBenchmarkPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationBenchmarkPlugin.kt)。

> [ルートハンドラー](server-requests.md#request_information)内でコールの属性にアクセスすることもできます。

## アプリケーションイベントを処理する {id="handle-app-events"}

[on](#other)ハンドラーは、`MonitoringEvent`フックを使用してアプリケーションのライフサイクルに関連するイベントを処理する機能を提供します。
例えば、以下の[事前定義されたイベント](server-events.md#predefined-events)を`on`ハンドラーに渡すことができます。

- `ApplicationStarting`
- `ApplicationStarted`
- `ApplicationStopPreparing`
- `ApplicationStopping`
- `ApplicationStopped`

以下のコードスニペットは、`ApplicationStopped`を使用してアプリケーションのシャットダウンを処理する方法を示しています。

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
        // リソースを解放し、イベントの購読を解除する
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

これはアプリケーションリソースを解放するのに役立ちます。

## プラグインの設定を提供する {id="plugin-configuration"}

[カスタムヘッダー](#custom-header)の例では、各レスポンスに定義済みのカスタムヘッダーを追加するプラグインの作成方法を示しました。このプラグインをより便利にし、必要なカスタムヘッダー名/値を渡すための設定を提供してみましょう。

1. まず、設定クラスを定義する必要があります。

   ```kotlin
   class PluginConfiguration {
       var headerName: String = "Custom-Header-Name"
       var headerValue: String = "Default value"
   }
   ```

2. プラグインでこの設定を使用するには、設定クラスの参照を`createApplicationPlugin`に渡します。

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

   プラグイン設定フィールドは可変（mutable）であるため、ローカル変数に保存することをお勧めします。

3. 最後に、次のようにプラグインをインストールして設定できます。

   ```kotlin
   install(CustomHeaderPlugin) {
       headerName = "X-Custom-Header"
       headerValue = "Hello, world!"
   }
   ```

> 完全な例はこちらにあります: [CustomHeaderPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPlugin.kt)。

### ファイルでの設定 {id="configuration-file"}

Ktorでは、[設定ファイル](server-create-and-configure.topic#engine-main)でプラグイン設定を指定できます。
`CustomHeaderPlugin`でこれを実現する方法を見てみましょう。

1. まず、`application.conf`または`application.yaml`ファイルにプラグイン設定を含む新しいグループを追加します。

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

   この例では、プラグイン設定は`http.custom_header`グループに保存されています。

2. 設定ファイルのプロパティにアクセスするには、`ApplicationConfig`を設定クラスのコンストラクタに渡します。
   `tryGetString`関数は、指定されたプロパティ値を返します。

   ```kotlin
   class CustomHeaderConfiguration(config: ApplicationConfig) {
       var headerName: String = config.tryGetString("header_name") ?: "Custom-Header-Name"
       var headerValue: String = config.tryGetString("header_value") ?: "Default value"
   }
   ```

3. 最後に、`createApplicationPlugin`関数の`configurationPath`パラメータに`http.custom_header`値を割り当てます。

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

> 完全な例はこちらにあります: [CustomHeaderPluginConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPluginConfigurable.kt)。

## アプリケーション設定へのアクセス {id="app-settings"}

### 設定 {id="config"}

`applicationConfig`プロパティを使用してサーバー設定にアクセスできます。これは[ApplicationConfig](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-application-config/index.html)インスタンスを返します。以下の例は、サーバーで使用されているホストとポートを取得する方法を示しています。

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val host = applicationConfig?.host
   val port = applicationConfig?.port
   println("Listening on $host:$port")
}
```

### 環境 {id="environment"}

アプリケーションの環境にアクセスするには、`environment`プロパティを使用します。例えば、このプロパティを使用すると、[開発モード](server-development-mode.topic)が有効かどうかを判断できます。

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

## その他 {id="misc"}

### プラグインの状態を保存する {id="plugin-state"}

プラグインの状態を保存するために、ハンドラーラムダから任意の値をキャプチャできます。コンカレントデータ構造やアトミックデータ型を使用して、すべての状態値をスレッドセーフにすることをお勧めします。

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

### データベース {id="databases"}

* 中断可能な（suspendable）データベースでカスタムプラグインを使用できますか？

  はい。すべてのハンドラーは中断関数（suspending functions）であるため、プラグイン内で中断可能なデータベース操作を実行できます。ただし、特定のコール用のリソースの割り当て解除を忘れないでください（例えば、[on(ResponseSent)](#other)を使用するなど）。

* ブロッキングデータベースでカスタムプラグインを使用するにはどうすればよいですか？

  Ktorはコルーチンと中断関数を使用しているため、ブロッキングデータベースへのリクエストを行うのは危険です。ブロッキングコールを実行するコルーチンがブロックされ、そのまま永久に中断される可能性があるためです。これを防ぐには、別の[CoroutineContext](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)を作成する必要があります。
   ```kotlin
   val databaseContext = newSingleThreadContext("DatabaseThread")
   ```
  コンテキストを作成したら、データベースへの各呼び出しを`withContext`呼び出しでラップします。
   ```kotlin
   onCall {
       withContext(databaseContext) {
           database.access(...) // データベースへの何らかの呼び出し
       }
   }