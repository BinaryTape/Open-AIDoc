[//]: # (title: HTTP/3)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<var name="example_name" value="http3-netty"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Netty 서버 엔진을 사용하는 Ktor에서 실험적 HTTP/3 지원을 활성화하고 구성하는 방법을 알아봅니다.
</link-summary>

[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)는 TCP 대신 [QUIC](https://www.rfc-editor.org/rfc/rfc9000.html) 위에서 실행되는 HTTP 프로토콜입니다.

Ktor는 [Netty 서버 엔진](server-engines.md#)을 통해 실험적 HTTP/3 지원을 제공합니다.

> HTTP/3 지원은 실험적 Ktor API를 사용합니다. 이를 사용하려면 `ExperimentalKtorApi`를 활성화(opt-in)해야 합니다.
> 
{style="note"}

## HTTP/3 활성화 {id="ssl"}

HTTP/3는 항상 TLS를 사용하므로 최소 하나 이상의 [SSL 커넥터](server-ssl.md)를 구성해야 합니다.

HTTP/3를 활성화하려면 Netty 엔진 구성에서 `enableHttp3()` 함수를 호출합니다.

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

각 SSL 커넥터에 대해 Ktor는 UDP를 통해 동일한 호스트 및 포트에 HTTP/3 엔드포인트를 바인딩합니다. HTTP/1.1 및 HTTP/2는 해당 포트에서 계속 TCP를 사용합니다.

> 인증서 및 SSL 커넥터 구성에 대한 자세한 내용은 [Ktor Server의 SSL 및 인증서](server-ssl.md)를 참조하세요.
> 
{style="tip"}

## HTTP/3 구성 {id="enable"}

HTTP/3 및 QUIC 동작을 커스터마이즈하려면 `enableHttp3()` 구성 블록 내부의 사용 가능한 옵션을 사용합니다.

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

다음과 같은 옵션을 사용할 수 있습니다:

<deflist type="full">
<def>
<title><code>quicTokenHandler</code></title>

기본값은 `null`입니다.

QUIC 주소 유효성 검사를 위한 `QuicTokenHandler`를 지정합니다. HMAC 기반 재시도 토큰을 활성화하려면 `HmacQuicTokenHandler`를 사용하세요.
</def>
<def>
<title><code>quicMaxIdleTimeout</code></title>

기본값은 `30.seconds`입니다.

QUIC 연결이 닫히기 전까지 유휴(idle) 상태를 유지할 수 있는 시간을 지정합니다. `0`보다 커야 합니다.
</def>
<def>
<title><code>quicInitialMaxData</code></title>

기본값은 `10_000_000`입니다.

연결의 최대 데이터 제한 초기값을 지정합니다. `0`보다 커야 합니다.
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalLocal</code></title>

기본값은 `1_000_000`입니다.

로컬에서 시작된 양방향 스트림의 초기 흐름 제어(flow-control) 제한을 지정합니다. `0`보다 커야 합니다.
</def>
<def>
<title><code>quicInitialMaxStreamDataBidirectionalRemote</code></title>

기본값은 `1_000_000`입니다.

원격에서 시작된 양방향 스트림의 초기 흐름 제어(flow-control) 제한을 지정합니다. `0`보다 커야 합니다.
</def>
<def>
<title><code>quicInitialMaxStreamsBidirectional</code></title>

기본값은 `100`입니다.

열 수 있는 양방향 스트림의 초기 개수를 지정합니다. `0`보다 커야 합니다.
</def>
<def>
<title><code>udpSocketCount</code></title>

기본값은 `1`입니다.

HTTP/3 엔드포인트에 대한 UDP 소켓 수를 지정합니다. `1`보다 큰 값을 사용하려면 플랫폼에서 `SO_REUSEPORT`를 지원해야 합니다.
</def>
<def>
<title><code>udpReceiveBufferSize</code></title>

기본값은 `0`입니다.

UDP 수신 버퍼(`SO_RCVBUF`) 크기(바이트 단위)를 지정합니다. `0`으로 설정하면 운영체제의 기본값을 사용합니다.
</def>
<def>
<title><code>udpSendBufferSize</code></title>

기본값은 `0`입니다.

UDP 송신 버퍼(`SO_SNDBUF`) 크기(바이트 단위)를 지정합니다. `0`으로 설정하면 운영체제의 기본값을 사용합니다.
</def>
</deflist>

이 옵션들은 HTTP/3 연결에만 적용되며 HTTP/1.1 또는 HTTP/2에는 영향을 주지 않습니다.

## QUIC 서버 코덱 구성 {id="quic-server-codec"}

고급 Netty 구성의 경우, `configureQuicServerCodec` 옵션을 사용하여 기본 `QuicServerCodecBuilder`를 커스터마이즈할 수 있습니다.

```kotlin
enableHttp3 {
    configureQuicServerCodec = {
        // Netty QUIC 서버 코덱을 구성합니다.
    }
}
```

이 옵션은 저수준 QUIC 전송 구성이 필요한 경우에만 사용하세요.