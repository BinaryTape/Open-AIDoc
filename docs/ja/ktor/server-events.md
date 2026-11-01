[//]: # (title: アプリケーションモニタリング)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="events"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor は、イベントを使用してサーバーアプリケーションをモニタリングする機能を提供します。
アプリケーションのライフサイクル（アプリケーションの起動、停止など）に関連する定義済みイベントを処理できるほか、カスタムイベントを使用して特定のケースを処理することもできます。また、[MonitoringEvent](server-custom-plugins.md#handle-app-events) フックを使用してカスタムプラグインのイベントを処理することも可能です。

## イベントの定義 {id="event-definition"}

各イベントは、[EventDefinition](https://api.ktor.io/ktor-events/io.ktor.events/-event-definition/index.html) クラスのインスタンスによって表されます。このクラスには、イベントに渡される値の型を指定する `T` 型パラメータがあります。この値には、[イベントハンドラー](#handle-events-application)内でラムダ引数としてアクセスできます。例えば、[定義済みイベント](#predefined-events)のほとんどはパラメータとして `Application` を受け取るため、イベントハンドラー内からアプリケーションのプロパティにアクセスできます。

[カスタムイベント](#custom-events)の場合は、そのイベントに必要な型パラメータを渡すことができます。
以下のコードスニペットは、`ApplicationCall` インスタンスを受け取るカスタムの `NotFoundEvent` を作成する方法を示しています。

```kotlin
val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()
```

[カスタムイベント](#custom-events)セクションでは、リソースに対してサーバーが `404 Not Found` ステータスコードを返したときに、カスタムプラグイン内でこのイベントを発生させる方法を説明しています。

### 定義済みのアプリケーションイベント {id="predefined-events"}

Ktor は、アプリケーションのライフサイクルに関連する以下の定義済みイベントを提供しています。

- [ApplicationStarting](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-starting.html)
- [ApplicationStarted](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-started.html)
- [ServerReady](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-server-ready.html)
- [ApplicationStopPreparing](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stop-preparing.html)
- [ApplicationStopping](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stopping.html)
- [ApplicationStopped](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-stopped.html)

例えば、`ApplicationStopped` イベントをサブスクライブして、アプリケーションのリソースを解放できます。

## アプリケーションでイベントを処理する {id="handle-events-application"}

指定した `Application` インスタンスのイベントを処理するには、`monitor` プロパティを使用します。
このプロパティを使用すると、アプリケーションイベントを処理するための以下の関数を提供する [Events](https://api.ktor.io/ktor-events/io.ktor.events/-events/index.html) インスタンスにアクセスできます。

- `subscribe`: [EventDefinition](#event-definition) で指定されたイベントをサブスクライブします。
- `unsubscribe`: [EventDefinition](#event-definition) で指定されたイベントのサブスクライブを解除します。
- `raise`: [EventDefinition](#event-definition) で指定されたイベントを指定された値で発生させます。
  > カスタムイベントの発生方法については、[カスタムイベント](#custom-events)セクションを参照してください。

`subscribe` / `unsubscribe` 関数は、`EventDefinition` インスタンスを受け取り、ラムダ引数として `T` の値を受け取ります。
以下の例は、`ApplicationStarted` イベントをサブスクライブし、イベントハンドラー内でメッセージを[ログ出力](server-logging.md)する方法を示しています。

```kotlin
fun Application.module() {
    monitor.subscribe(ApplicationStarted) { application ->
        application.environment.log.info("Server is started")
    }
}
```

この例では、`ApplicationStopped` イベントの処理方法を確認できます。

```kotlin
fun Application.module() {
    monitor.subscribe(ApplicationStopped) { application ->
        application.environment.log.info("Server is stopped")
        // リソースを解放し、イベントのサブスクライブを解除する
        monitor.unsubscribe(ApplicationStarted) {}
        monitor.unsubscribe(ApplicationStopped) {}
    }
}
```

完全な例については、[events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events) を参照してください。

## カスタムプラグインでイベントを処理する {id="handle-events-plugin"}

`MonitoringEvent` フックを使用すると、[カスタムプラグイン](server-custom-plugins.md#handle-app-events)内でイベントを処理できます。
以下の例は、`ApplicationMonitoringPlugin` プラグインを作成し、`ApplicationStarted` イベントおよび `ApplicationStopped` イベントを処理する方法を示しています。

```kotlin
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
        // リソースを解放し、イベントのサブスクライブを解除する
        application.monitor.unsubscribe(ApplicationStarted) {}
        application.monitor.unsubscribe(ApplicationStopped) {}
    }
}
```

完全な例は、こちらで確認できます: [events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events)。

## カスタムイベント {id="custom-events"}

このセクションでは、リソースに対してサーバーが `404 Not Found` ステータスコードを返したときに発生するカスタムイベントの作成方法を説明します。

1. まず、[イベント定義](#event-definition)を作成する必要があります。
   以下のコードスニペットは、パラメータとして `ApplicationCall` を受け取るカスタムの `NotFoundEvent` イベントを作成する方法を示しています。

   ```kotlin
   val NotFoundEvent: EventDefinition<ApplicationCall> = EventDefinition()
   ```
2. イベントを発生させるには、`Events.raise` 関数を呼び出します。以下のサンプルは、呼び出しに対するステータスコードが `404` の場合に、新しく作成したイベントを発生させるために `ResponseSent` [フック](server-custom-plugins.md#other)を処理する方法を示しています。

   ```kotlin
   import io.ktor.events.EventDefinition
   import io.ktor.http.*
   import io.ktor.server.application.*
   import io.ktor.server.application.hooks.*
   
   val ApplicationMonitoringPlugin = createApplicationPlugin(name = "ApplicationMonitoringPlugin") {
       on(ResponseSent) { call ->
           if (call.response.status() == HttpStatusCode.NotFound) {
               this@createApplicationPlugin.application.monitor.raise(NotFoundEvent, call)
           }
       }
   }
   ```
3. 作成したイベントをアプリケーションで処理するには、プラグインを[インストール](server-plugins.md#install)します。

   ```kotlin
   fun Application.module() {
       install(ApplicationMonitoringPlugin)
   }
   ```

4. 次に、`Events.subscribe` を使用してイベントをサブスクライブします。

   ```kotlin
   fun Application.module() {
       install(ApplicationMonitoringPlugin)
       monitor.subscribe(NotFoundEvent) { call ->
           log.info("No page was found for the URI: ${call.request.uri}")
       }
   }
   ```

完全な例については、[events](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/events) を参照してください。