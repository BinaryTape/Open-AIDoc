[//]: # (title: カスタムプラグイン - Base API)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="custom-plugin-base-api"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor は、複数のアプリケーションで再利用可能な機能を実装するカスタム[プラグイン](server-plugins.md)を開発するための Base API を提供しています。

Base API を使用すると、さまざまな[パイプライン](#pipelines)フェーズをインターセプトして、リクエストとレスポンスの処理にカスタムロジックを追加できます。例えば、`Monitoring` フェーズをインターセプトして、受信リクエストをログに記録したり、メトリクスを収集したりできます。

## プラグインを作成する {id="create"}

Base API を使用してカスタムプラグインを作成するには、以下の手順に従います。

1. プラグインクラスを作成し、プラグインインターフェースを実装する[コンパニオンオブジェクトを宣言](#create-companion)します。
2. コンパニオンオブジェクト内で `key` プロパティと `install()` 関数を[実装](#implement)します。
3. [プラグインのコンフィギュレーション](#plugin-configuration)を提供します。
4. 必要なパイプラインフェーズをインターセプトして[コールを処理](#call-handling)します。
5. [プラグインをインストール](#install)します。

### コンパニオンオブジェクトを作成する {id="create-companion"}

カスタムプラグインのクラスには、以下のいずれかのインターフェースを実装するコンパニオンオブジェクトが必要です：

* アプリケーションレベルのプラグイン用の [`BaseApplicationPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-application-plugin/index.html)。
* [特定のルートにインストールされる](server-plugins.md#install-route)プラグイン用の [`BaseRouteScopedPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-route-scoped-plugin/index.html)。

`BaseApplicationPlugin` インターフェースは、以下の型パラメータを受け取ります：

* プラグインがサポートするパイプラインの型。
* プラグインの[コンフィギュレーションの型](#plugin-configuration)。
* プラグインインスタンス自体の型。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        // ...
    }
}
```

### 'key' プロパティと 'install()' 関数を実装する {id="implement"}

`BaseApplicationPlugin` を実装するコンパニオンオブジェクトは、以下を定義する必要があります：

* `key` プロパティはプラグインを識別します。Ktor はプラグインインスタンスをアプリケーションの属性に保存し、このキーを使用してプラグインインスタンスにアクセスします。
* `install()` 関数はプラグインを設定します。この関数内では、必要なパイプラインフェーズをインターセプトし、プラグインインスタンスを返します。[コールを処理する](#call-handling)セクションでは、パイプラインフェーズをインターセプトする方法を説明しています。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val plugin = CustomHeader()
            // Intercept a pipeline ...
            return plugin
        }
    }
}
```

### コールを処理する {id="call-handling"}

カスタムプラグインでは、[既存のパイプラインフェーズ](#pipelines)または新しく定義されたフェーズをインターセプトすることで、リクエストとレスポンスを処理できます。例えば、[認証 (Authentication)](server-auth.md) プラグインは、デフォルトのパイプラインに `Authenticate` と `Challenge` のカスタムフェーズを追加します。

特定のフェーズをインターセプトすることで、コール処理の特定のステージにアクセスできます：

* `ApplicationCallPipeline.Monitoring`: リクエストのログ記録、メトリクス、トレース、および同様のモニタリングタスクにこのフェーズを使用します。
* `ApplicationCallPipeline.Plugins`: コールを処理したり、カスタムヘッダーの追加などレスポンスパラメータを変更したりするためにこのフェーズを使用します。
* `ApplicationReceivePipeline.Transform` および `ApplicationSendPipeline.Transform`: クライアントから受信したデータまたはクライアントに送信されるデータにアクセスし、[変換](#transform)するためにこれらのフェーズを使用します。

以下の例は、`ApplicationCallPipeline.Plugins` フェーズをインターセプトし、各レスポンスにカスタムヘッダーを追加します：

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val plugin = CustomHeader()
            pipeline.intercept(ApplicationCallPipeline.Plugins) {
                call.response.header("X-Custom-Header", "Hello, world!")
            }
            return plugin
        }
    }
}
```

この例では、ヘッダー名と値がハードコードされています。プラグインを再利用可能にするには、ユーザーがヘッダー名と値を指定できるように[コンフィギュレーションを提供](#plugin-configuration)します。

> カスタムプラグインは、コールに関連する値を異なるハンドラー間で共有できます。詳細については、[コールの状態を共有する](server-custom-plugins.md#call-state)を参照してください。
>
{style="tip"}

### プラグインのコンフィギュレーションを提供する {id="plugin-configuration"}

[前のセクション](#call-handling)では、定義済みのカスタムヘッダーを各レスポンスに追加するプラグインを作成する方法を示しました。このプラグインを再利用可能にするために、ユーザーがヘッダー名と値を指定できるようにコンフィギュレーションを定義しましょう。

まず、プラグインクラス内にコンフィギュレーションクラスを定義します：

```kotlin
class Configuration {
    var headerName = "Custom-Header-Name"
    var headerValue = "Default value"
}
```

プラグインのコンフィギュレーションプロパティは、プラグインのインストール中に更新できます。プラグインがインターセプター内でこれらの値を使用する場合は、`install()` 関数内のローカル変数に保存します：

```kotlin
class CustomHeader(configuration: Configuration) {
    private val name = configuration.headerName
    private val value = configuration.headerValue

    class Configuration {
        var headerName = "Custom-Header-Name"
        var headerValue = "Default value"
    }
}
```

次に、`install()` 関数内でコンフィギュレーションを読み取り、そのプロパティを使用します：

```kotlin
class CustomHeader(configuration: Configuration) {
    private val name = configuration.headerName
    private val value = configuration.headerValue

    class Configuration {
        var headerName = "Custom-Header-Name"
        var headerValue = "Default value"
    }

    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val configuration = Configuration().apply(configure)
            val plugin = CustomHeader(configuration)
            pipeline.intercept(ApplicationCallPipeline.Plugins) {
                call.response.header(plugin.name, plugin.value)
            }
            return plugin
        }
    }
}
```

### プラグインをインストールする {id="install"}

カスタムプラグインをアプリケーションに[インストール](server-plugins.md#install)するには、`Application.install()` 関数を呼び出し、必要な[コンフィギュレーション](#plugin-configuration)パラメータを渡します：

```kotlin
install(CustomHeader) {
    headerName = "X-Custom-Header"
    headerValue = "Hello, world!"
}
```

## 例 {id="examples"}

以下の例は、Base API で構築されたいくつかのカスタムプラグインを示しています。

> 実行可能な完全なプロジェクトについては、[custom-plugin-base-api](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-base-api) を参照してください。
>
{style="tip"}

### リクエストのログ記録 {id="request-logging"}

以下の例は、受信リクエストをログに記録するカスタムプラグインを作成します：

```kotlin
package com.example.plugins

import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.util.*

class RequestLogging {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, RequestLogging> {
        override val key = AttributeKey<RequestLogging>("RequestLogging")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): RequestLogging {
            val plugin = RequestLogging()
            pipeline.intercept(ApplicationCallPipeline.Monitoring) {
                call.request.origin.apply {
                    println("Request URL: $scheme://$localHost:$localPort$uri")
                }
            }
            return plugin
        }
    }
}

```

### カスタムヘッダー {id="custom-header"}

以下の例は、各レスポンスにカスタムヘッダーを追加するプラグインを作成します：

```kotlin
package com.example.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.util.*

class CustomHeader(configuration: Configuration) {
    private val name = configuration.headerName
    private val value = configuration.headerValue

    class Configuration {
        var headerName = "Custom-Header-Name"
        var headerValue = "Default value"
    }

    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val configuration = Configuration().apply(configure)
            val plugin = CustomHeader(configuration)
            pipeline.intercept(ApplicationCallPipeline.Plugins) {
                call.response.header(plugin.name, plugin.value)
            }
            return plugin
        }
    }
}

```

### ボディの変換 {id="transform"}

以下の例は、リクエストボディとレスポンスボディを変換するプラグインを作成します：

```kotlin
package com.example.plugins

import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.util.*
import io.ktor.utils.io.*

class DataTransformation {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, DataTransformation> {
        override val key = AttributeKey<DataTransformation>("DataTransformation")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): DataTransformation {
            val plugin = DataTransformation()
            pipeline.receivePipeline.intercept(ApplicationReceivePipeline.Transform) { data ->
                val newValue = (data as ByteReadChannel).readLine()?.toInt()?.plus(1)
                if (newValue != null) {
                    proceedWith(newValue)
                }
            }
            pipeline.sendPipeline.intercept(ApplicationSendPipeline.Transform) { data ->
                if (subject is Int) {
                    val newValue = data.toString().toInt() + 1
                    proceedWith(newValue.toString())
                }
            }
            return plugin
        }
    }
}

```

## パイプライン {id="pipelines"}

Ktor における [`Pipeline`](https://api.ktor.io/ktor-utils/io.ktor.util.pipeline/-pipeline/index.html) は、1 つ以上の順序付けられたフェーズにグループ化されたインターセプターのコレクションです。各インターセプターは、リクエスト処理が続行される前後にカスタムロジックを実行できます。

[`ApplicationCallPipeline`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call-pipeline/index.html) は、アプリケーションコールを実行します。以下のフェーズを定義しています：

* `Setup`: 処理のためにコールとその属性を準備します。
* `Monitoring`: コールをトレースします。リクエストのログ記録、メトリクス、エラー処理、および同様のタスクにこのフェーズを使用します。
* `Plugins`: コールを処理します。ほとんどのプラグインはこのフェーズをインターセプトします。
* `Call`: コールを完了します。
* `Fallback`: それ以前のフェーズで処理されなかったコールを処理します。

## パイプラインフェーズから新しい API ハンドラーへのマッピング {id="mapping"}

簡素化された[カスタムプラグイン API](server-custom-plugins.md) を使用してカスタムプラグインを作成できます。多くの場合、この API ではパイプラインやフェーズなどの内部的な Ktor の概念を直接理解する必要はありません。代わりに、[リクエストとレスポンスの処理](server-custom-plugins.md#call-handling)の異なるステージに対応する `onCall()`、`onCallReceive()`、`onCallRespond()` などのハンドラーが提供されています。

以下の表は、Base API のパイプラインフェーズが簡素化された API のハンドラーにどのようにマッピングされるかを示しています：

| Base API                               | 新しい API                                                             |
|----------------------------------------|---------------------------------------------------------------------|
| `ApplicationCallPipeline.Setup` の前   | [`on(CallFailed)`](server-custom-plugins.md#other)                  |
| `ApplicationCallPipeline.Setup`        | [`on(CallSetup)`](server-custom-plugins.md#other)                   |
| `ApplicationCallPipeline.Plugins`      | [`onCall()`](server-custom-plugins.md#on-call)                      |
| `ApplicationCallPipeline.Call`         | [`onCallValidators()`](server-custom-plugins.md#on-call-validators) |
| `ApplicationReceivePipeline.Transform` | [`onCallReceive()`](server-custom-plugins.md#on-call-receive)       |
| `ApplicationSendPipeline.Transform`    | [`onCallRespond()`](server-custom-plugins.md#on-call-respond)       |
| `ApplicationSendPipeline.After`        | [`on(ResponseBodyReadyForSend)`](server-custom-plugins.md#other)    |
| `ApplicationSendPipeline.Engine`       | [`on(ResponseSent)`](server-custom-plugins.md#other)                |
| `Authentication.ChallengePhase` の後   | [`on(AuthenticationChecked)`](server-custom-plugins.md#other)       |