[//]: # (title: HTTP/3)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<var name="example_name" value="http3-netty"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Nettyサーバーエンジンを使用してKtorで実験的なHTTP/3サポートを有効化および設定する方法について説明します。
</link-summary>

[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)は、TCPの代わりに[QUIC](https://www.rfc-editor.org/rfc/rfc9000.html)上で動作するHTTPプロトコルです。

Ktorは、[Nettyサーバーエンジン](server-engines.md#)で実験的なHTTP/3サポートを提供します。

> HTTP/3サポートは実験的なKtor APIを使用しています。使用するには、`ExperimentalKtorApi`をオプトインしてください。
> 
{style="note"}

## HTTP/3を有効にする {id="ssl"}

HTTP/3は常にTLSを使用するため、少なくとも1つの[SSLコネクター](server-ssl.md)を設定する必要があります。

HTTP/3を有効にするには、Nettyエンジンの設定で `enableHttp3()` 関数を呼び出します:

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

各SSLコネクターに対して、KtorはUDP経由で同じホストおよびポートにHTTP/3エンドポイントをバインドします。HTTP/1.1およびHTTP/2は、引き続きそのポートでTCPを使用します。

> 証明書およびSSLコネクターの設定に関する詳細については、[Ktor ServerにおけるSSLと証明書](server-ssl.md)を参照してください。
> 
{style="tip"}

## HTTP/3を設定する {id="enable"}

HTTP/3およびQUICの動作をカスタマイズするには、`enableHttp3()` 設定ブロック内の利用可能なオプションを使用します:

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

以下のオプションが利用可能です:

<deflist type="full">
<def>
<title><code>quicTokenHandler</code></title>

デフォルトは `null` です。

QUICアドレス検証用の `QuicTokenHandler` を指定します。HMACベースの再試行トークン（retry tokens）を有効にするには、`HmacQuicTokenHandler` を使用します。
</def>
<def>
<title><code>quicMaxIdleTimeout</code></title>

デフォルトは `30.seconds` です。

QUIC接続がクローズされるまでにアイドル状態でいられる期間を指定します。`0` より大きい値を設定する必要があります。
</def>
<def>
<title><code>quicInitialMaxData</code></title>

デフォルトは `10_000_000` です。

接続の最大データ制限の初期値を指定します。`0` より大きい値を設定する必要があります。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalLocal</code></title>

デフォルトは `1_000_000` です。

ローカルで開始された双方向ストリームの初期フロー制御制限を指定します。`0` より大きい値を設定する必要があります。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalRemote</code></title>

デフォルトは `1_000_000` です。

リモートで開始された双方向ストリームの初期フロー制御制限を指定します。`0` より大きい値を設定する必要があります。
</def>
<def>
<title><code>quicInitialMaxStreamsBidirectional</code></title>

デフォルトは `100` です。

オープンできる双方向ストリームの初期数を指定します。`0` より大きい値を設定する必要があります。
</def>
<def>
<title><code>udpSocketCount</code></title>

デフォルトは `1` です。

HTTP/3エンドポイント用のUDPソケット数を指定します。`1` より大きい値を設定する場合は、プラットフォームでの `SO_REUSEPORT` サポートが必要です。
</def>
<def>
<title><code>udpReceiveBufferSize</code></title>

デフォルトは `0` です。

UDP受信バッファ（`SO_RCVBUF`）のサイズをバイト単位で指定します。`0` に設定すると、オペレーティングシステムのデフォルト値が使用されます。
</def>
<def>
<title><code>udpSendBufferSize</code></title>

デフォルトは `0` です。

UDP送信バッファ（`SO_SNDBUF`）のサイズをバイト単位で指定します。`0` に設定すると、オペレーティングシステムのデフォルト値が使用されます。
</def>
</deflist>

これらのオプションはHTTP/3接続にのみ適用され、HTTP/1.1やHTTP/2には影響しません。

## QUICサーバーコーデックを設定する {id="quic-server-codec"}

高度なNetty設定を行うには、`configureQuicServerCodec` オプションを使用して基盤となる `QuicServerCodecBuilder` をカスタマイズします:

```kotlin
enableHttp3 {
    configureQuicServerCodec = {
        // Netty QUICサーバーコーデックを設定します。
    }
}
```

このオプションは、低レベルのQUICトランスポート設定が必要な場合にのみ使用してください。