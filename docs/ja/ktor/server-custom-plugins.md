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

Ktor では、独自のカスタム[プラグイン](server-plugins.md)を作成できます。一般的に、この API ではパイプラインやフェーズといった Ktor 内部の概念を理解する必要はありません。代わりに、`onCall()`、`onCallReceive()`、`onCallRespond()` などのハンドラーを使用して、[リクエストとレスポンス処理](#call-handling)のさまざまなステージにアクセスします。

## 最初のプラグインを作成してインストールする {id="first-plugin"}

このセクションでは、最初のプラグインを作成してインストールする方法を学びます。

スタート用プロジェクトとして、[新規 Ktor プロジェクトの作成、オープン、実行](server-create-a-new-project.topic)チュートリアルで作成したアプリケーションを使用できます。

1. プラグインを作成するには、[`createApplicationPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-application-plugin.html) 関数を呼び出し、プラグイン名を指定します。

   ```kotlin
   import io.ktor.server.application.*
   
   val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
       println("SimplePlugin is installed!")
   }
   ```

   この関数は、アプリケーションにインストール可能な `ApplicationPlugin` インスタンスを返します。
   
   > [`createRouteScopedPlugin()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/create-route-scoped-plugin.html) 関数を使用して、[特定のルートにインストール](server-plugins.md#install-route)できるプラグインを作成することもできます。
   >
   {style="tip"}

2. [プラグインをインストール](server-plugins.md#install)するには、作成した `ApplicationPlugin` インスタンスをアプリケーションの初期化コード内の `Application.install()` 関数に渡します。

   ```kotlin
   fun Application.module() {
       install(SimplePlugin)
   }
   ```

3. アプリケーションを[実行](server-run.md)し、コンソール出力でプラグインのメッセージを確認します。

   ```Bash
   2021-10-14 14:54:08.269 [main] INFO  Application - Autoreload is disabled because the development mode is off.
   SimplePlugin is installed!
   2021-10-14 14:54:08.900 [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```

> 完全な例については、[SimplePlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/SimplePlugin.kt) を参照してください。
> 
{style="tip"}

## コールを処理する {id="call-handling"}

カスタムプラグインでは、コールのさまざまなステージへのアクセスを提供する一連のハンドラーを使用して、[リクエスト](server-requests.md)と[レスポンス](server-responses.md)を処理できます。

* [`onCall()`](#on-call): リクエストおよびレスポンス情報にアクセスし、ヘッダーなどのレスポンスパラメータを変更できます。
* [`onCallValidators()`](#on-call-validators): コールの検証を実行できます。ルートスコーププラグインの場合、バリデータはルートのネスト順に従って実行されます。
* [`onCallReceive()`](#on-call-receive): クライアントから受信したデータを変換できます。
* [`onCallRespond()`](#on-call-respond): クライアントへ送信する前にデータを変換できます。
* [`on()`](#other): コール処理の他のステージや、コール中に発生した例外に対する特定のフックを処理できます。

また、`call.attributes` を使用してハンドラー間で[コールの状態を共有](#call-state)することもできます。

### `onCall()` {id="on-call"}

`onCall()` ハンドラーは、ラムダ引数として `ApplicationCall` を受け取ります。これにより、リクエストおよびレスポンス情報にアクセスし、[カスタムヘッダーの追加](#custom-header)などのレスポンスパラメータの変更を行うことができます。

リクエストまたはレスポンスのボディを変換するには、[`onCallReceive()`](#on-call-receive) および [`onCallRespond()`](#on-call-respond) を使用します。

#### 例 1: リクエストをログに記録する {id="request-logging"}

次の例では、`onCall()` を使用して、受信したリクエストの URL をログに記録するプラグインを作成します。

```kotlin
val RequestLoggingPlugin = createApplicationPlugin(name = "RequestLoggingPlugin") {
    onCall { call ->
        call.request.origin.apply {
            println("Request URL: $scheme://$localHost:$localPort$uri")
        }
    }
}
```

このプラグインをインストールすると、リクエストされた URL がコンソールに出力されます。

```Bash
Request URL: http://0.0.0.0:8080/
Request URL: http://0.0.0.0:8080/index
```

#### 例 2: カスタムヘッダーを追加する {id="custom-header"}

次の例では、各レスポンスにカスタムヘッダーを追加するプラグインを作成します。

```kotlin
val CustomHeaderPlugin = createApplicationPlugin(name = "CustomHeaderPlugin") {
    onCall { call ->
        call.response.headers.append("X-Custom-Header", "Hello, world!")
    }
}
```

結果のレスポンスにはカスタムヘッダーが含まれます。

```HTTP
HTTP/1.1 200 OK
X-Custom-Header: Hello, world!
```

この例では、ヘッダー名と値がハードコードされています。これらを設定可能にするには、[プラグイン設定](#plugin-configuration)を提供します。

### `onCallReceive()` {id="on-call-receive"}

`onCallReceive()` ハンドラーを使用すると、クライアントから受信したデータを変換できます。ハンドラー内で `transformBody()` を呼び出し、リクエストボディが `call.receive()` に渡される前に変換します。

クライアントが `text/plain` ボディとして `10` を含む以下の `POST` リクエストを送信したとします。

```HTTP
POST http://localhost:8080/transform-data
Content-Type: text/plain

10

```

この[ボディを整数値として受信](server-requests.md#objects)するには、`POST` リクエスト用のルートハンドラーを作成し、`Int` パラメータを指定して `call.receive()` を呼び出す必要があります。

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
}
```

以下のプラグインは、ボディを整数値として受信し、それに `1` を加算します。

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

上記の例では:

* `TransformBodyContext` が[ラムダレシーバー](https://kotlinlang.org/docs/scope-functions.html#context-object-this-or-it)です。その `requestedType` プロパティには、`call.receive()` によって要求された型に関する情報が含まれています。
* `data` 引数には現在のリクエストボディが含まれます。この場合、それは [`ByteReadChannel`](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) であり、`ByteReadChannel.readLine()` がその内容を読み取ります。
* 要求された型が `Int` の場合、プラグインは受信した値を整数に変換して `1` を加え、変換された値を返します。それ以外の場合は、ボディを変更せずにそのまま返します。

> 完全な例については、[DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt) を参照してください。
>
{style="tip"}

### `onCallRespond()` {id="on-call-respond"}

`onCallRespond()` ハンドラーを使用すると、データをクライアントに送信する前に変換できます。
このハンドラーは、ルートハンドラーで `call.respond` 関数が呼び出されたときに実行されます。

例えば、次のルートを考えてみましょう。

```kotlin
post("/transform-data") {
    val data = call.receive<Int>()
    call.respond(data)
}
```

`call.respond` を呼び出すと `onCallRespond()` がトリガーされ、クライアントに送信されるデータを変換できるようになります。

`onCallRespond()` の内部では、`transformBody()` を使用してレスポンスボディを変換します。次の例では、整数のレスポンスに `1` を加算し、それを文字列に変換します。

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

> 完全な例については、[DataTransformationPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationPlugin.kt) を参照してください。
>
{style="tip"}

### `onCallValidators()` {id="on-call-validators"}

`onCallValidators()` ハンドラーを使用すると、着信する各コールに対して検証を実行できます。

複数のバリデータがネストされたルートに適用されている場合、親ルートのバリデータが子ルートのバリデータよりも前に実行されます。これにより、バリデータは認証されたプリンシパルなど、ルート階層の上位で生成された情報を利用できます。

例えば、次のルートスコーププラグインは、認証ルートによって提供されたプリンシパルにアクセスできます。

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

認証後にプラグインを実行するには、認証ルート内にプラグインをインストールします。

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

ルートスコープの検証の順序が重要である場合は、`onCallValidators()` を使用してください。他のバリデータに依存しない一般的なリクエストおよびレスポンス処理には、代わりに `onCall()` を使用します。

### その他の便利なハンドラー {id="other"}

上記で説明したコールハンドラーに加えて、Ktor はコール処理の他のステージを処理するための一連のフックを提供しています。特定の `Hook` に対するハンドラーを登録するには、`on()` 関数を使用します。

利用可能なフックには以下が含まれます。

- `CallSetup`: コール処理の開始時に呼び出されます。
- `ResponseBodyReadyForSend`: レスポンスボディがすべての変換を通過し、送信準備が整った後に呼び出されます。
- `ResponseSent`: レスポンスがクライアントに正常に送信された後に呼び出されます。
- `CallFailed`: コール処理が例外により失敗したときに呼び出されます。
- [`AuthenticationChecked`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-checked/index.html): [認証](server-auth.md)資格情報がチェックされた後に呼び出されます。このフックを使用して認可（Authorization）を実装できます。例については、[custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization) を参照してください。

次の例では、`CallSetup` フックを処理します。

```kotlin
on(CallSetup) { call->
    // ...
}
```

> `MonitoringEvent` を使用して、アプリケーションの起動やシャットダウンなどの[アプリケーションイベントを処理](#handle-app-events)することもできます。
> 
{style="tip"}

### コールの状態を共有する {id="call-state"}

カスタムプラグインは、固有の `AttributeKey` を使用して、コールに関連付けられた値を異なるハンドラー間で共有できます。
これらの値は、`call.attributes` コレクションに保存されます。

次の例では、`onCall()` が呼び出された時刻を保存し、`onCallReceive()` でそれを使用してリクエストボディが読み取られるまでの遅延を計算します。

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

`POST` リクエストを送信すると、プラグインはコンソールに遅延を出力します。

```Bash
Request URL: http://localhost:8080/transform-data
Read body delay (ms): 52
```

> 完全な例については、[DataTransformationBenchmarkPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/DataTransformationBenchmarkPlugin.kt) を参照してください。
>
{style="tip"}

> コール属性には[ルートハンドラー](server-requests.md#request_information)からもアクセスできます。
> 
{style="tip"}

## アプリケーションイベントを処理する {id="handle-app-events"}

[`on()`](#other) ハンドラーを使用すると、`MonitoringEvent` フックを使用してアプリケーションのライフサイクルに関連するイベントを処理できます。

Ktor は、`on()` ハンドラー向けに以下の[定義済みイベント](server-events.md#predefined-events)を提供しています。

- `ApplicationStarting`
- `ApplicationStarted`
- `ApplicationStopPreparing`
- `ApplicationStopping`
- `ApplicationStopped`

次の例では、`ApplicationStopped` イベントを使用してアプリケーションのシャットダウンを処理します。

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

このアプローチは、接続の切断、バックグラウンドタスクの停止、バッファリングされたデータのフラッシュなど、プラグインが所有するリソースをクリーンアップするのに役立ちます。

## プラグイン設定を提供する {id="plugin-configuration"}

[カスタムヘッダー](#custom-header)の例では、各レスポンスに定義済みのヘッダーを追加するプラグインを作成しました。
このプラグインを再利用可能にするには、ユーザーがヘッダーの名前と値を指定できる設定を定義します。

1. 設定クラスを定義します。

   ```kotlin
   class PluginConfiguration {
       var headerName: String = "Custom-Header-Name"
       var headerValue: String = "Default value"
   }
   ```

2. 設定クラスの参照を `createApplicationPlugin()` に渡します。

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

   プラグイン設定のプロパティは、プラグインのインストール中に変更可能です。プラグインがハンドラー内でこれらの値を使用する場合は、プラグインのボディ内でローカル変数に格納してください。

3. プラグインをインストールして設定します。

   ```kotlin
   install(CustomHeaderPlugin) {
       headerName = "X-Custom-Header"
       headerValue = "Hello, world!"
   }
   ```

> 完全な例については、[CustomHeaderPlugin.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPlugin.kt) を参照してください。
>
{style="tip"}

### ファイルでの設定 {id="configuration-file"}

Ktor は、[設定ファイル](server-create-and-configure.topic#engine-main)からプラグイン設定を読み込むことができます。

以下の例は、ファイルから `CustomHeaderPlugin` を設定する方法を示しています。

1. `application.conf` または `application.yaml` ファイルに、プラグイン設定を含む新しいグループを追加します。

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

   この例では、プラグイン設定は `http.custom_header` グループに格納されています。

2. 設定ファイルのプロパティにアクセスするには、設定クラスのコンストラクタに `ApplicationConfig` を渡します。
   `tryGetString()` 関数は、指定されたプロパティの値を返します。

   ```kotlin
   class CustomHeaderConfiguration(config: ApplicationConfig) {
       var headerName: String = config.tryGetString("header_name") ?: "Custom-Header-Name"
       var headerValue: String = config.tryGetString("header_value") ?: "Default value"
   }
   ```

3. `createApplicationPlugin()` 関数の `configurationPath` パラメータに `http.custom_header` の値を割り当てます。

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

> 完全な例については、[CustomHeaderPluginConfigurable.kt](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin/src/main/kotlin/com/example/plugins/CustomHeaderPluginConfigurable.kt) を参照してください。
>
{style="tip"}

## アプリケーション設定にアクセスする {id="app-settings"}

カスタムプラグインは、プラグインのボディからアプリケーションレベルの設定にアクセスできます。これは、プラグインの動作がサーバーの設定や環境に依存する場合に役立ちます。

### 設定 {id="config"}

サーバー設定にアクセスするには、`applicationConfig` プロパティを使用します。このプロパティは [`ApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-application-config/index.html) インスタンスを返します。

次の例では、サーバーで使用されているホストとポートを読み取ります。

```kotlin
val SimplePlugin = createApplicationPlugin(name = "SimplePlugin") {
   val host = applicationConfig?.host
   val port = applicationConfig?.port
   println("Listening on $host:$port")
}
```

### 環境 {id="environment"}

アプリケーションの環境にアクセスするには、`environment` プロパティを使用します。例えば、[開発モード](server-development-mode.topic)が有効になっているかどうかを確認できます。

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

### プラグインの状態を保持する {id="plugin-state"}

プラグインは、プラグインのボディで値をキャプチャし、それをハンドラーのラムダから使用することで状態を保持できます。

プラグインは複数のコールを同時に処理できるため、共有される可変状態は並行コレクションやアトミック型などのスレッドセーフな構造に格納してください。

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

#### 中断データベース API を使用する {id="use-suspending-database-apis"}

すべてのカスタムプラグインハンドラーは中断関数（suspending function）です。つまり、ハンドラーから直接中断データベース API を呼び出すことができます。

特定のコールにスコープされたリソースは必ず解放してください。例えば、[`on(ResponseSent)`](#other) を使用して、レスポンスが送信された後にリソースをクリーンアップできます。

#### ブロッキングデータベース API を使用する {id="use-blocking-database-apis"}

Ktor はコルーチンを使用しているため、ブロッキングを伴うデータベースの呼び出しをデフォルトのコルーチンディスパッチャーで実行するべきではありません。ブロッキング呼び出しはスレッドを占有し、他のコルーチンの進行を妨げる可能性があります。

ブロッキングデータベース API を呼び出すには、ブロッキング処理用に別の [`CoroutineContext`](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html) を作成します。

```kotlin
val databaseContext = Dispatchers.IO
```

その後、各ブロッキングデータベース呼び出しを `withContext()` でラップします。

```kotlin
onCall {
   withContext(databaseContext) {
       database.access(...) // データベースへの呼び出し
   }
}
```