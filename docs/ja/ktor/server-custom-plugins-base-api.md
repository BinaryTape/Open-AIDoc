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

Ktorは、複数のアプリケーション間で再利用可能な機能を実装するカスタム[プラグイン](server-plugins.md)を開発するためのBase APIを提供しています。

Base APIを使用すると、さまざまな[パイプライン](#pipelines)フェーズをインターセプトし、リクエストとレスポンスの処理にカスタムロジックを追加できます。たとえば、`Monitoring` フェーズをインターセプトして受信リクエストをログに記録したり、メトリクスを収集したりできます。

## プラグインの作成 {id="create"}

Base APIを使用してカスタムプラグインを作成するには：

1. プラグインクラスを作成し、プラグインインターフェースを実装する[コンパニオンオブジェクトを宣言](#create-companion)します。
2. コンパニオンオブジェクトで `key` プロパティと `install()` 関数を[実装](#implement)します。
3. [プラグイン設定](#plugin-configuration)を提供します。
4. 必要なパイプラインフェーズをインターセプトして[呼び出しを処理](#call-handling)します。
5. [プラグインをインストール](#install)します。

### コンパニオンオブジェクトの作成 {id="create-companion"}

カスタムプラグインのクラスには、以下のいずれかのインターフェースを実装するコンパニオンオブジェクトが必要です。

* アプリケーションレベルのプラグイン用の [`BaseApplicationPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-application-plugin/index.html)。
* [特定のルートにインストールされる](server-plugins.md#install-route)プラグイン用の [`BaseRouteScopedPlugin`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-base-route-scoped-plugin/index.html)。

`BaseApplicationPlugin` インターフェースは、以下の型パラメータを受け入れます：

* プラグインがサポートするパイプラインの型。
* プラグインの[設定型](#plugin-configuration)。
* プラグインインスタンスの型。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        // ...
    }
}
```

### 'key' プロパティと 'install()' 関数の実装 {id="implement"}

`BaseApplicationPlugin` を実装するコンパニオンオブジェクトは、以下を定義する必要があります。

* `key` プロパティはプラグインを識別します。Ktorはプラグインインスタンスをアプリケーションの属性（attributes）に保存し、このキーを使用してプラグインインスタンスにアクセスします。
* `install()` 関数はプラグインを設定します。この関数内で必要なパイプラインフェーズをインターセプトし、プラグインインスタンスを返します。[呼び出しの処理](#call-handling)セクションでパイプラインフェーズをインターセプトする方法を説明しています。

```kotlin
class CustomHeader() {
    companion object Plugin : BaseApplicationPlugin<ApplicationCallPipeline, Configuration, CustomHeader> {
        override val key = AttributeKey<CustomHeader>("CustomHeader")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): CustomHeader {
            val plugin = CustomHeader()
            // パイプラインをインターセプト ...
            return plugin
        }
    }
}
```

### 呼び出しの処理 {id="call-handling"}

カスタムプラグインでは、[既存のパイプラインフェーズ](#pipelines)や新しく定義したフェーズをインターセプトすることで、リクエストとレスポンスを処理できます。たとえば、[認証](server-auth.md)プラグインは、デフォルトのパイプラインに `Authenticate` と `Challenge` のカスタムフェーズを追加します。

特定のフェーズをインターセプトすることで、呼び出し処理の特定のステージにアクセスできます。

* `ApplicationCallPipeline.Monitoring`: リクエストロギング、メトリクス、トレーシング、および同様の監視タスクにこのフェーズを使用します。
* `ApplicationCallPipeline.Plugins`: 呼び出しを処理したり、カスタムヘッダーの追加などレスポンスパラメータを変更したりするためにこのフェーズを使用します。
* `ApplicationReceivePipeline.Transform` および `ApplicationSendPipeline.Transform`: クライアントから受信したデータまたはクライアントに送信するデータへのアクセスや[変換](#transform)にこれらのフェーズを使用します。

以下の例では、`ApplicationCallPipeline.Plugins` フェーズをインターセプトし、各レスポンスにカスタムヘッダーを追加します。

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

この例では、ヘッダー名と値がハードコードされています。プラグインを再利用可能にするには、ユーザーがヘッダー名と値を指定できるようにする[設定を提供](#plugin-configuration)します。

> カスタムプラグインは、呼び出しに関連付けられた値を異なるハンドラー間で共有できます。詳細については、[呼び出し状態の共有](server-custom-plugins.md#call-state)を参照してください。
>
{style="tip"}

### プラグイン設定の提供 {id="plugin-configuration"}

[前のセクション](#call-handling)では、各レスポンスに事前定義されたカスタムヘッダーを追加するプラグインの作成方法を示しました。このプラグインを再利用可能にするには、ユーザーがヘッダー名と値を指定できる設定を定義します。

まず、プラグインクラス内に設定クラスを定義します。

```kotlin
class Configuration {
    var headerName = "Custom-Header-Name"
    var headerValue = "Default value"
}
```

プラグインのインストール中にプラグイン設定プロパティを更新できます。プラグインがインターセプター内でこれらの値を使用する場合は、`install()` 関数内のローカル変数に保存します。

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

次に、`install()` 関数で設定を読み取り、そのプロパティを使用します。

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

### プラグインのインストール {id="install"}

カスタムプラグインをアプリケーションに[インストール](server-plugins.md#install)するには、`Application.install()` 関数を呼び出し、必要な[設定](#plugin-configuration)パラメータを渡します。

```kotlin
install(CustomHeader) {
    headerName = "X-Custom-Header"
    headerValue = "Hello, world!"
}
```

## 例 {id="examples"}

以下の例は、Base APIを使用して構築されたいくつかのカスタムプラグインを示しています。

> 完全に実行可能なプロジェクトについては、[custom-plugin-base-api](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-base-api) を参照してください。
>
{style="tip"}

### リクエストロギング {id="request-logging"}

以下の例では、受信リクエストをログに記録するカスタムプラグインを作成します。

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

以下の例では、各レスポンスにカスタムヘッダーを追加するプラグインを作成します。

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

以下の例では、リクエストボディとレスポンスボディを変換するプラグインを作成します。

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

Ktorにおける [`Pipeline`](https://api.ktor.io/ktor-utils/io.ktor.util.pipeline/-pipeline/index.html) は、1つ以上の順序付けられたフェーズにグループ化されたインターセプターのコレクションです。各インターセプターは、リクエスト処理の継続前後にカスタムロジックを実行できます。

[`ApplicationCallPipeline`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call-pipeline/index.html) はアプリケーションの呼び出しを実行します。以下のフェーズを定義しています：

* `Setup`: 呼び出しとその属性を処理のために準備します。
* `Monitoring`: 呼び出しをトレースします。リクエストロギング、メトリクス、エラー処理、および同様のタスクにこのフェーズを使用します。
* `Plugins`: 呼び出しを処理します。ほとんどのプラグインはこのフェーズをインターセプトします。
* `Call`: 呼び出しを完了します。
* `Fallback`: 前のフェーズで処理されなかった呼び出しを処理します。

## パイプラインフェーズから新しいAPIハンドラーへのマッピング {id="mapping"}

簡略化された[カスタムプラグインAPI](server-custom-plugins.md)を使用してカスタムプラグインを作成できます。多くの場合、このAPIではパイプラインやフェーズなどのKtor内部の概念に関する直接的な知識は不要です。代わりに、[リクエストとレスポンスの処理](server-custom-plugins.md#call-handling)のさまざまなステージ向けに、`onCall()`、`onCallReceive()`、`onCallRespond()` などのハンドラーが提供されます。

以下の表は、Base APIのパイプラインフェーズが簡略化されたAPIハンドラーにどのように対応しているかを示しています。

| Base API                               | 新しいAPI                                                           |
|----------------------------------------|---------------------------------------------------------------------|
| `ApplicationCallPipeline.Setup` より前 | [`on(CallFailed)`](server-custom-plugins.md#other)                  |
| `ApplicationCallPipeline.Setup`        | [`on(CallSetup)`](server-custom-plugins.md#other)                   |
| `ApplicationCallPipeline.Plugins`      | [`onCall()`](server-custom-plugins.md#on-call)                      |
| `ApplicationCallPipeline.Call`         | [`onCallValidators()`](server-custom-plugins.md#on-call-validators) |
| `ApplicationReceivePipeline.Transform` | [`onCallReceive()`](server-custom-plugins.md#on-call-receive)       |
| `ApplicationSendPipeline.Transform`    | [`onCallRespond()`](server-custom-plugins.md#on-call-respond)       |
| `ApplicationSendPipeline.After`        | [`on(ResponseBodyReadyForSend)`](server-custom-plugins.md#other)    |
| `ApplicationSendPipeline.Engine`       | [`on(ResponseSent)`](server-custom-plugins.md#other)                |
| `Authentication.ChallengePhase` より後 | [`on(AuthenticationChecked)`](server-custom-plugins.md#other)       |