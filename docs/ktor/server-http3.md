[//]: # (title: HTTP/3)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<var name="example_name" value="http3-netty"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何在 Ktor 中使用 Netty 服务器引擎启用和配置实验性 HTTP/3 支持。
</link-summary>

[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html) 是一种运行在 [QUIC](https://www.rfc-editor.org/rfc/rfc9000.html) 之上而非 TCP 之上的 HTTP 协议。

Ktor 通过 [Netty 服务器引擎](server-engines.md#)提供实验性 HTTP/3 支持。

> HTTP/3 支持使用的是实验性 Ktor API。要使用它，请选择加入 `ExperimentalKtorApi`。
> 
{style="note"}

## 启用 HTTP/3 {id="ssl"}

HTTP/3 始终使用 TLS，因此你需要配置至少一个 [SSL 连接器](server-ssl.md)。

要启用 HTTP/3，请在 Netty 引擎配置中调用 `enableHttp3()` 函数：

```kotlin
@OptIn(ExperimentalKtorApi::class)
fun main(args: Array<String>) {
    val keyStore = KeyStore.getInstance("JKS").apply {
        FileInputStream("keystore.jks").use {
            load(it, "foobar".toCharArray())
        }
    }

    embeddedServer(
        Netty,
        configure = {
            sslConnector(
                keyStore = keyStore,
                keyAlias = "server",
                keyStorePassword = { "foobar".toCharArray() },
                privateKeyPassword = { "foobar".toCharArray() }
            ) {
                host = "0.0.0.0"
                port = 8443
            }
            enableHttp3()
        }
    ){
        module()
    }.start(wait = true)
}
```

对于每个 SSL 连接器，Ktor 都会通过 UDP 将一个 HTTP/3 端点绑定到相同的主机和端口。HTTP/1.1 和 HTTP/2 则在该端口上继续使用 TCP。

> 有关配置证书和 SSL 连接器的更多信息，请参阅 [Ktor Server 中的 SSL 与证书](server-ssl.md)。
> 
{style="tip"}

## 配置 HTTP/3 {id="enable"}

要自定义 HTTP/3 和 QUIC 的行为，请使用 `enableHttp3()` 配置块内的可用选项：

```kotlin
enableHttp3 {
    quicTokenHandler = HmacQuicTokenHandler()
    quicMaxIdleTimeout = 30.seconds
    quicInitialMaxData = 10_000_000
    quicInitialMaxStreamDataBidirectionalLocal = 1_000_000
    quicInitialMaxStreamDataBidirectionalRemote = 1_000_000
    quicInitialMaxStreamsBidirectional = 100
    udpSocketCount = 1
    udpReceiveBufferSize = 0
    udpSendBufferSize = 0
}
```

以下是可用的选项：

<deflist type="full">
<def>
<title><code>quicTokenHandler</code></title>

默认值为 `null`。

指定用于 QUIC 地址验证的 `QuicTokenHandler`。使用 `HmacQuicTokenHandler` 可以启用基于 HMAC 的重试令牌。
</def>
<def>
<title><code>quicMaxIdleTimeout</code></title>

默认值为 `30.seconds`。

指定 QUIC 连接在关闭前可以保持空闲的时长。必须大于 `0`。
</def>
<def>
<title><code>quicInitialMaxData</code></title>

默认值为 `10_000_000`。

指定连接的最大数据限制初始值。必须大于 `0`。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalLocal</code></title>

默认值为 `1_000_000`。

指定本地发起的双向流的初始流控制限制。必须大于 `0`。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalRemote</code></title>

默认值为 `1_000_000`。

指定远程发起的双向流的初始流控制限制。必须大于 `0`。
</def>
<def>
<title><code>quicInitialMaxStreamsBidirectional</code></title>

默认值为 `100`。

指定可以打开的双向流的初始数量。必须大于 `0`。
</def>
<def>
<title><code>udpSocketCount</code></title>

默认值为 `1`。

指定 HTTP/3 端点的 UDP 套接字数量。大于 `1` 的值需要平台支持 `SO_REUSEPORT`。
</def>
<def>
<title><code>udpReceiveBufferSize</code></title>

默认值为 `0`。

指定 UDP 接收缓冲区（`SO_RCVBUF`）大小（以字节为单位）。如果设置为 `0`，操作系统将使用其默认值。
</def>
<def>
<title><code>udpSendBufferSize</code></title>

默认值为 `0`。

指定 UDP 发送缓冲区（`SO_SNDBUF`）大小（以字节为单位）。如果设置为 `0`，操作系统将使用其默认值。
</def>
</deflist>

这些选项仅适用于 HTTP/3 连接，不会影响 HTTP/1.1 或 HTTP/2。

## 配置 QUIC 服务器编解码器 {id="quic-server-codec"}

对于高级 Netty 配置，请使用 `configureQuicServerCodec` 选项来自定义底层的 `QuicServerCodecBuilder`：

```kotlin
enableHttp3 {
    configureQuicServerCodec = {
        // 配置 Netty QUIC 服务器编解码器。
    }
}
```

仅在需要底层 QUIC 传输配置时使用此选项。