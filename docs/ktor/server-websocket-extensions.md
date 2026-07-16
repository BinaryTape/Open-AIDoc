[//]: # (title: WebSocket 扩展程序 API)

Ktor WebSocket API 支持编写您自己的扩展程序（例如 [RFC-7692](https://tools.ietf.org/html/rfc7692)）或任何自定义扩展程序。

## 安装扩展程序

为了安装和配置扩展程序，我们提供了两种方法：`extensions` 和 `install`，可以按以下方式使用：
```kotlin
install(WebSockets) {
    extensions { /* WebSocketExtensionConfig.() -> Unit */
        install(MyWebSocketExtension) { /* MyWebSocketExtensionConfig.() -> Unit */
        /* 可选的扩展程序配置。 */ 
        }
    }
}
```

扩展程序按安装顺序使用。

## 检查扩展程序是否已协商

所有安装的扩展程序都会经过协商过程，成功协商的扩展程序将在请求期间使用。
您可以使用 `WebSocketSession.extensions: List<WebSocketExtension<*>>` 属性，其中包含当前会话使用的所有扩展程序的列表。

有两种方法可以检查扩展程序是否正在使用中：`WebSocketSession.extension` 和 `WebSocketSession.extensionOrNull`：
```kotlin
webSocket("/echo") {
    val myExtension = extension(MyWebSocketExtension) // 如果未协商 `MyWebSocketExtension`，将抛出异常
    // 或
    val myExtension = extensionOrNull(MyWebSocketExtension) ?: close() // 如果未协商 `MyWebSocketExtension`，将关闭会话
}
```

## 编写新扩展程序

实现新扩展程序有两个接口：`WebSocketExtension<ConfigType: Any>` 和 `WebSocketExtensionFactory<ConfigType : Any, ExtensionType : WebSocketExtension<ConfigType>>`。
单个实现可以同时适用于客户端和服务器。

以下是一个简单的帧日志记录扩展程序的实现示例：

```kotlin
class FrameLoggerExtension(val logger: Logger) : WebSocketExtension<FrameLogger.Config> {
```

该插件具有两组字段和方法。第一组用于扩展程序协商：

```kotlin
    /** 要发送到客户端请求中以进行协商的协议列表 **/
    override val protocols: `List<WebSocketExtensionHeader>` = emptyList()
   
    /** 
      * 此方法将在服务器上调用，并将处理来自客户端的 `requestedProtocols`。
      * 因此，它将返回服务器同意使用的扩展程序列表。
      */
    override fun serverNegotiation(requestedProtocols: List<WebSocketExtensionHeader>): `List<WebSocketExtensionHeader>` {
        logger.log("Server negotiation")
        return emptyList()
    }

    /**
      * 此方法将在客户端上调用，并带有一个由 `serverNegotiation` 生成的协议列表。它将决定是否应使用这些扩展程序。 
      */ 
    override fun clientNegotiation(negotiatedProtocols: List<WebSocketExtensionHeader>): Boolean {
        logger.log("Client negotiation")
        return true
    }

```

第二组用于实际的帧处理。这些方法将接收一个帧，并在必要时生成一个新的处理后的帧：

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

还有一些实现细节：插件具有 `Config` 和对原始 `factory` 的引用。

```kotlin
    class Config {
        lateinit var logger: Logger
    }

    /**
    * 可以创建当前扩展程序实例的工厂。 
    */
    override val factory: WebSocketExtensionFactory<Config, FrameLogger> = FrameLoggerExtension
```

工厂通常在伴生对象中实现（类似于常规插件）：

```kotlin
    companion object : WebSocketExtensionFactory<Config, FrameLogger> {
        /* 用于发现已安装扩展程序实例的密钥 */
        override val key: AttributeKey<FrameLogger> = AttributeKey("frame-logger")

        /** 占用的 rsv 位列表。
         * 如果扩展程序占用了一个位，则该位不能在其他已安装的扩展程序中使用。我们使用这些位来防止插件冲突（防止安装多个压缩插件）。如果您正在根据某个 RFC 实现插件，则应在其中引用 rsv 占用的位。
         */
        override val rsv1: Boolean = false
        override val rsv2: Boolean = false
        override val rsv3: Boolean = false

       /** 创建插件实例。将针对每个 WebSocket 会话调用 **/
        override fun install(config: Config.() -> Unit): FrameLogger {
            return FrameLogger(Config().apply(config).logger)
        }
    }
}