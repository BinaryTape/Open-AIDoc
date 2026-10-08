[//]: # (title: WebSocket Deflate 扩展程序)

Ktor 为客户端和服务器实现了 `Deflate` WebSocket 扩展程序 [RFC-7692](https://tools.ietf.org/html/rfc7692)。该扩展程序可以在发送前透明地压缩帧，并在接收后解压缩。如果您正在发送大量的文本数据，启用此扩展程序会非常有用。

## 安装 {id="installation"}

要使用此扩展程序，需要先进行安装。为此，我们可以在 `extensions` 块中使用 `install` 方法：

```kotlin
// 适用于客户端和服务器
install(WebSockets) {
    extensions {
        install(WebSocketDeflateExtension) {
            /**
             * 用于 [java.util.zip.Deflater] 的压缩级别。
             */
            compressionLevel = Deflater.DEFAULT_COMPRESSION

            /**
             * 防止压缩较小的传出帧。
             */
            compressIfBiggerThan(bytes = 4 * 1024)
        }
    }
}
```

### 高级配置参数 {id="advanced-configuration-parameters"}

#### 上下文接管 (Context takeover) {id="context-takeover"}

指定客户端（和服务器）是否应使用压缩窗口。启用这些参数可以减少为单个会话分配的空间量。请注意，由于 `java.util.zip.Deflater` API 的限制，无法配置窗口大小。该值固定为 `15`。

```kotlin
clientNoContextTakeOver = false

serverNoContextTakeOver = false
```

这些参数在 [RFC-7692 第 7.1.1 节](https://tools.ietf.org/html/rfc7692#section-7.1.1) 中有详细说明。

#### 指定压缩条件 {id="specify-compress-condition"}

要显式指定压缩条件，可以使用 `compressIf` 方法。例如，仅压缩文本：

```kotlin
compressIf { frame -> 
    frame is Frame.Text
}
```
所有对 `compressIf` 的调用都将在执行压缩之前进行求值。

#### 微调协议列表 {id="fine-tune-list-of-protocols"}

发送的协议列表可以根据需要使用 `configureProtocols` 方法进行编辑：

```kotlin
configureProtocols { protocols ->
    protocols.clear()
    protocols.add(...)
}
```
