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
Netty サーバーエンジンを使用して、Ktor で実験的な HTTP/3 サポートを有効化および設定する方法を学びます。
</link-summary>

[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html) は、TCP の代わりに [QUIC](https://www.rfc-editor.org/rfc/rfc9000.html) 上で動作する HTTP プロトコルです。

Ktor は、[Netty サーバーエンジン](server-engines.md#) で実験的な HTTP/3 サポートを提供しています。

> HTTP/3 サポートは実験的な Ktor API を使用しています。これを使用するには、`ExperimentalKtorApi` にオプトインしてください。
> 
{style="note"}

## HTTP/3 の有効化 {id="ssl"}

HTTP/3 は常に TLS を使用するため、少なくとも 1 つの [SSL コネクター](server-ssl.md) を設定する必要があります。

HTTP/3 を有効にするには、Netty エンジン設定内で `enableHttp3()` 関数を呼び出します。

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

各 SSL コネクターに対して、Ktor は UDP 経由で同じホストおよびポートに HTTP/3 エンドポイントをバインドします。HTTP/1.1 と HTTP/2 は、そのポートで引き続き TCP を使用します。

> 証明書および SSL コネクターの設定に関する詳細については、[Ktor Server での SSL と証明書](server-ssl.md) を参照してください。
> 
{style="tip"}

## HTTP/3 の設定 {id="enable"}

HTTP/3 および QUIC の動作をカスタマイズするには、`enableHttp3()` 設定ブロック内の利用可能なオプションを使用します。

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

以下のオプションが利用可能です。

<deflist type="full">
<def>
<title><code>quicTokenHandler</code></title>

デフォルトは `null` です。

QUIC アドレス検証用の `QuicTokenHandler` を指定します。HMAC ベースのリトライトークンを有効にするには、`HmacQuicTokenHandler` を使用します。
</def>
<def>
<title><code>quicMaxIdleTimeout</code></title>

デフォルトは `30.seconds` です。

クローズされるまでに QUIC 接続がアイドル状態を維持できる時間を指定します。`0` より大きい値を指定する必要があります。
</def>
<def>
<title><code>quicInitialMaxData</code></title>

デフォルトは `10_000_000` です。

接続の最大データ制限の初期値を指定します。`0` より大きい値を指定する必要があります。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalLocal</code></title>

デフォルトは `1_000_000` です。

ローカルで開始された双方向ストリームの初期フロー制御制限を指定します。`0` より大きい値を指定する必要があります。
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalRemote</code></title>

デフォルトは `1_000_000` です。

リモートで開始された双方向ストリームの初期フロー制御制限を指定します。`0` より大きい値を指定する必要があります。
</def>
<def>
<title><code>quicInitialMaxStreamsBidirectional</code></title>

デフォルトは `100` です。

オープンできる双方向ストリームの初期数を指定します。`0` より大きい値を指定する必要があります。
</def>
<def>
<title><code>udpSocketCount</code></title>

デフォルトは `1` です。

HTTP/3 エンドポイント用の UDP ソケットの数を指定します。`1` より大きい値を指定する場合、プラットフォームでの `SO_REUSEPORT` のサポートが必要です。
</def>
<def>
<title><code>udpReceiveBufferSize</code></title>

デフォルトは `0` です。

UDP 受信バッファ（`SO_RCVBUF`）のサイズをバイト単位で指定します。`0` を設定した場合、オペレーティングシステムのデフォルト値が使用されます。
</def>
<def>
<title><code>udpSendBufferSize</code></title>

デフォルトは `0` です。

UDP 送信バッファ（`SO_SNDBUF`）のサイズをバイト単位で指定します。`0` を設定した場合、オペレーティングシステムのデフォルト値が使用されます。
</def>
</deflist>

これらのオプションは HTTP/3 接続にのみ適用され、HTTP/1.1 や HTTP/2 には影響しません。

## QUIC サーバーコーデックの設定 {id="quic-server-codec"}

高度な Netty の設定を行うには、`configureQuicServerCodec` オプションを使用して基盤となる `QuicServerCodecBuilder` をカスタマイズします。

```kotlin
enableHttp3 {
    configureQuicServerCodec = {
        // Netty QUIC サーバーコーデックを設定します。
    }
}
```

このオプションは、低レベルの QUIC トランスポート設定が必要な場合にのみ使用してください。