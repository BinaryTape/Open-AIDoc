[//]: # (title: WebSocket 擴充套件 API)

Ktor WebSocket API 支援撰寫您自己的擴充套件（例如 [RFC-7692](https://tools.ietf.org/html/rfc7692)）或任何自訂擴充套件。

## 安裝擴充套件

要安裝並配置擴充套件，我們提供兩種方法：`extensions` 和 `install`，可以按照以下方式使用：
```kotlin
install(WebSockets) {
    extensions { /* WebSocketExtensionConfig.() -> Unit */
        install(MyWebSocketExtension) { /* MyWebSocketExtensionConfig.() -> Unit */
        /* 選填的擴充套件配置。 */ 
        }
    }
}
```

擴充套件會按照安裝順序使用。

## 檢查擴充套件是否已協商

所有安裝的擴充套件都會經過協商程序，而那些成功協商的擴充套件將會在請求期間被使用。
您可以使用 `WebSocketSession.extensions: List<WebSocketExtension<*>>` 屬性，其中包含目前工作階段所使用的所有擴充套件清單。

有兩種方法可以檢查擴充套件是否正在使用中：`WebSocketSession.extension` 和 `WebSocketSession.extensionOrNull`：
```kotlin
webSocket("/echo") {
    val myExtension = extension(MyWebSocketExtension) // 如果 `MyWebSocketExtension` 未經協商，將會拋出例外
    // 或者
    val myExtension = extensionOrNull(MyWebSocketExtension) ?: close() // 如果 `MyWebSocketExtension` 未經協商，將關閉工作階段
}
```

## 撰寫新的擴充套件

實作新的擴充套件有兩個介面：`WebSocketExtension<ConfigType: Any>` 和 `WebSocketExtensionFactory<ConfigType : Any, ExtensionType : WebSocketExtension<ConfigType>>`。
單一實作可以同時適用於用戶端和伺服器。

以下是如何實作一個簡單的 frame 記錄擴充套件的範例：

```kotlin
class FrameLoggerExtension(val logger: Logger) : WebSocketExtension<FrameLogger.Config> {
```

該外掛程式有兩組欄位和方法。第一組用於擴充套件協商：

```kotlin
    /** 在用戶端請求中發送以進行協商的協定清單 **/
    override val protocols: `List<WebSocketExtensionHeader>` = emptyList()
   
    /** 
      * 此方法將在伺服器端呼叫，並處理來自用戶端的 `requestedProtocols`。
      * 結果會傳回伺服器同意使用的擴充套件清單。
      */
    override fun serverNegotiation(requestedProtocols: List<WebSocketExtensionHeader>): `List<WebSocketExtensionHeader>` {
        logger.log("Server negotiation")
        return emptyList()
    }

    /**
      * 此方法將在用戶端呼叫，並傳入由 `serverNegotiation` 產生的協定清單。它將決定是否應使用這些擴充套件。 
      */ 
    override fun clientNegotiation(negotiatedProtocols: List<WebSocketExtensionHeader>): Boolean {
        logger.log("Client negotiation")
        return true
    }

```

第二組是用於實際處理 frame 的地方。這些方法會接收一個 frame，並在必要時產生一個新的已處理 frame：

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

還有一些實作細節：該外掛程式具有 `Config` 以及對原始 `factory` 的參照。

```kotlin
    class Config {
        lateinit var logger: Logger
    }

    /**
    * 可以建立目前擴充套件執行個體的工廠。 
    */
    override val factory: WebSocketExtensionFactory<Config, FrameLogger> = FrameLoggerExtension
```

工廠通常在伴隨物件中實作（類似於一般外掛程式）：

```kotlin
    companion object : WebSocketExtensionFactory<Config, FrameLogger> {
        /* 用於探索已安裝擴充套件執行個體的金鑰 */
        override val key: AttributeKey<FrameLogger> = AttributeKey("frame-logger")

        /** 佔用的 rsv 位元清單。
         * 如果擴充套件佔用了一個位元，則該位元不能在其他安裝的擴充套件中使用。我們使用這些位元來防止外掛程式衝突（防止安裝多個壓縮外掛程式）。如果您要根據某些 RFC 實作外掛程式，則應在該處引用 rsv 佔用位元。
         */
        override val rsv1: Boolean = false
        override val rsv2: Boolean = false
        override val rsv3: Boolean = false

       /** 建立外掛程式執行個體。將為每個 WebSocket 工作階段呼叫 **/
        override fun install(config: Config.() -> Unit): FrameLogger {
            return FrameLogger(Config().apply(config).logger)
        }
    }
}