[//]: # (title: HTTP/3)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<var name="example_name" value="http3-netty"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何在 Ktor 中使用 Netty 伺服器引擎啟用並配置實驗性 HTTP/3 支援。
</link-summary>

[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html) 是一種建構於 [QUIC](https://www.rfc-editor.org/rfc/rfc9000.html) 而非 TCP 之上的 HTTP 協定。

Ktor 透過 [Netty 伺服器引擎](server-engines.md#) 提供實驗性的 HTTP/3 支援。

> HTTP/3 支援使用實驗性 Ktor API。若要使用，請選擇加入 `ExperimentalKtorApi`。
> 
{style="note"}

## 啟用 HTTP/3 {id="ssl"}

HTTP/3 始終使用 TLS，因此您至少需要配置一個 [SSL 連接器](server-ssl.md)。

若要啟用 HTTP/3，請在 Netty 引擎配置中呼叫 `enableHttp3()` 函式：

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

對於每個 SSL 連接器，Ktor 會透過 UDP 將 HTTP/3 端點繫結至相同的 host 與 port。HTTP/1.1 和 HTTP/2 則繼續在該 port 上使用 TCP。

> 如需更多關於配置憑證與 SSL 連接器的資訊，請參閱 [Ktor Server 中的 SSL 與憑證](server-ssl.md)。
> 
{style="tip"}

## 配置 HTTP/3 {id="enable"}

若要自訂 HTTP/3 與 QUIC 行為，請使用 `enableHttp3()` 配置區塊內的可用選項：

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

可用的選項如下：

<deflist type="full">
<def>
<title><code>quicTokenHandler</code></title>

預設為 `null`。

指定用於 QUIC 位址驗證的 `QuicTokenHandler`。使用 `HmacQuicTokenHandler` 來啟用基於 HMAC 的重試權杖 (retry tokens)。
</def>
<def>
<title><code>quicMaxIdleTimeout</code></title>

預設為 `30.seconds`。

指定 QUIC 連線在關閉前可維持閒置的時間。必須大於 `0`。
</def>
<def>
<title><code>quicInitialMaxData</code></title>

預設為 `10_000_000`。

指定連線最大資料限制的初始值。必須大於 `0`。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalLocal</code></title>

預設為 `1_000_000`。

指定由本機端發起的雙向串流之初始流量控制限制。必須大於 `0`。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalRemote</code></title>

預設為 `1_000_000`。

指定由遠端發起的雙向串流之初始流量控制限制。必須大於 `0`。
</def>
<def>
<title><code>quicInitialMaxStreamsBidirectional</code></title>

預設為 `100`。

指定可開啟的雙向串流初始數量。必須大於 `0`。
</def>
<def>
<title><code>udpSocketCount</code></title>

預設為 `1`。

指定 HTTP/3 端點的 UDP socket 數量。大於 `1` 的值需要平台支援 `SO_REUSEPORT`。
</def>
<def>
<title><code>udpReceiveBufferSize</code></title>

預設為 `0`。

以位元組為單位指定 UDP 接收緩衝區 (`SO_RCVBUF`) 大小。若設定為 `0`，作業系統將使用其預設值。
</def>
<def>
<title><code>udpSendBufferSize</code></title>

預設為 `0`。

以位元組為單位指定 UDP 傳送緩衝區 (`SO_SNDBUF`) 大小。若設定為 `0`，作業系統將使用其預設值。
</def>
</deflist>

這些選項僅適用於 HTTP/3 連線，不會影響 HTTP/1.1 或 HTTP/2。

## 配置 QUIC 伺服器編解碼器 {id="quic-server-codec"}

對於進階 Netty 配置，請使用 `configureQuicServerCodec` 選項來自訂底層的 `QuicServerCodecBuilder`：

```kotlin
enableHttp3 {
    configureQuicServerCodec = {
        // 配置 Netty QUIC 伺服器編解碼器。
    }
}
```

僅在需要低階 QUIC 傳輸配置時才使用此選項。