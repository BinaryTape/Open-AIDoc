[//]: # (title: WebSocket 拡張 API)

Ktor WebSocket API は、独自の拡張機能（[RFC-7692](https://tools.ietf.org/html/rfc7692) など）や、任意のカスタム拡張機能の作成をサポートしています。

## 拡張機能のインストール

拡張機能をインストールして設定するために、`extensions` と `install` という 2 つのメソッドを提供しており、次のように使用できます。
```kotlin
install(WebSockets) {
    extensions { /* WebSocketExtensionConfig.() -> Unit */
        install(MyWebSocketExtension) { /* MyWebSocketExtensionConfig.() -> Unit */
        /* オプションの拡張機能設定。 */ 
        }
    }
}
```

拡張機能は、インストールされた順序で使用されます。

## 拡張機能がネゴシエーションされたかどうかの確認

インストールされたすべての拡張機能はネゴシエーション（交渉）プロセスを経て、正常にネゴシエーションされたものがリクエスト中に使用されます。
`WebSocketSession.extensions: List<WebSocketExtension<*>>` プロパティを使用して、現在のセッションで使用されているすべての拡張機能のリストを取得できます。

拡張機能が使用中かどうかを確認するには、`WebSocketSession.extension` と `WebSocketSession.extensionOrNull` の 2 つのメソッドがあります。
```kotlin
webSocket("/echo") {
    val myExtension = extension(MyWebSocketExtension) // `MyWebSocketExtension` がネゴシエーションされていない場合はスローされます
    // または
    val myExtension = extensionOrNull(MyWebSocketExtension) ?: close() // `MyWebSocketExtension` がネゴシエーションされていない場合はセッションを閉じます
}
```

## 新しい拡張機能の作成

新しい拡張機能を実装するためのインターフェースは、`WebSocketExtension<ConfigType: Any>` と `WebSocketExtensionFactory<ConfigType : Any, ExtensionType : WebSocketExtension<ConfigType>>` の 2 つです。
1 つの実装で、クライアントとサーバーの両方に対応できます。

以下は、シンプルなフレームロギング拡張機能を実装する方法の例です。

```kotlin
class FrameLoggerExtension(val logger: Logger) : WebSocketExtension<FrameLogger.Config> {
```

プラグインには 2 つのフィールドとメソッドのグループがあります。第 1 グループは拡張機能のネゴシエーション用です。

```kotlin
    /** ネゴシエーションのためにクライアントリクエストで送信されるプロトコルのリスト **/
    override val protocols: `List<WebSocketExtensionHeader>` = emptyList()
   
    /** 
      * このメソッドはサーバー側で呼び出され、クライアントからの `requestedProtocols` を処理します。
      * 結果として、サーバーが使用に同意した拡張機能のリストを返します。
      */
    override fun serverNegotiation(requestedProtocols: List<WebSocketExtensionHeader>): `List<WebSocketExtensionHeader>` {
        logger.log("Server negotiation")
        return emptyList()
    }

    /**
      * このメソッドは、`serverNegotiation` によって生成されたプロトコルリストとともにクライアント側で呼び出されます。これらの拡張機能を使用するかどうかを決定します。 
      */ 
    override fun clientNegotiation(negotiatedProtocols: List<WebSocketExtensionHeader>): Boolean {
        logger.log("Client negotiation")
        return true
    }

```

第 2 グループは、実際のフレーム処理を行う場所です。メソッドはフレームを受け取り、必要に応じて新しい処理済みフレームを生成します。

```kotlin
    override fun processOutgoingFrame(frame: Frame): Frame {
        logger.log("Process outgoing frame: $frame")
        return frame
    }

    override fun processIncomingFrame(frame: Frame): Frame {
        logger.log("Process incoming frame: $frame")
        return frame
    }
```

また、いくつかの実装の詳細もあります。プラグインには `Config` と元の `factory` への参照があります。

```kotlin
    class Config {
        lateinit var logger: Logger
    }

    /**
    * 現在の拡張機能インスタンスを作成できるファクトリ。 
    */
    override val factory: WebSocketExtensionFactory<Config, FrameLogger> = FrameLoggerExtension
```

ファクトリは通常、（通常のプラグインと同様に）コンパニオンオブジェクトに実装されます。

```kotlin
    companion object : WebSocketExtensionFactory<Config, FrameLogger> {
        /* インストールされた拡張機能インスタンスを見つけるためのキー */
        override val key: AttributeKey<FrameLogger> = AttributeKey("frame-logger")

        /** 占有されている rsv ビットのリスト。
         * 拡張機能がビットを占有している場合、他のインストール済み拡張機能では使用できません。これらのビットを使用して、プラグインの競合を防止します（複数の圧縮プラグインのインストールを防止するなど）。RFC を使用してプラグインを実装する場合、rsv 占有ビットはそこで参照される必要があります。
         */
        override val rsv1: Boolean = false
        override val rsv2: Boolean = false
        override val rsv3: Boolean = false

       /** プラグインインスタンスを作成します。各 WebSocket セッションごとに呼び出されます **/
        override fun install(config: Config.() -> Unit): FrameLogger {
            return FrameLogger(Config().apply(config).logger)
        }
    }
}