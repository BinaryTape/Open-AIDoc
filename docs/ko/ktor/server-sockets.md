[//]: # (title: 소켓)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sockets"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-network</code>, <code>io.ktor:ktor-network-tls</code>
</p>
<p><b>코드 예제</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server">sockets-server</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client">sockets-client</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls">sockets-client-tls</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

Ktor는 서버 및 클라이언트를 위한 HTTP/WebSocket 처리 외에도 TCP 및 UDP 로우 소켓(raw sockets)을 지원합니다.
이는 내부적으로 [java.nio](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html)를 사용하는 서스펜딩(suspending) API를 노출합니다.

> 소켓은 실험적인(experimental) API를 사용하며, 향후 업데이트에서 잠재적으로 파괴적인 변경 사항과 함께 진화할 것으로 예상됩니다.
>
{type="note"}

## 의존성 추가 {id="add_dependencies"}

<var name="artifact_name" value="ktor-network"/>
<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

클라이언트에서 [보안 소켓](#secure)을 사용하려면 `io.ktor:ktor-network-tls`도 추가해야 합니다.

## 서버 {id="server"}

### 서버 소켓 생성 {id="server_create_socket"}

서버 소켓을 빌드하려면 `SelectorManager` 인스턴스를 생성하고, 해당 인스턴스에서 `SocketBuilder.tcp()` 함수를 호출한 다음, `bind`를 사용하여 서버 소켓을 특정 포트에 바인딩하십시오:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
```

위의 코드 조각은 [ServerSocket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-server-socket/index.html) 인스턴스인 TCP 소켓을 생성합니다.
UDP 소켓을 생성하려면 `SocketBuilder.udp()`를 사용하십시오.

### 들어오는 연결 수락 {id="accepts_connection"}

서버 소켓을 생성한 후에는 소켓 연결을 수락하고 연결된 소켓([Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) 인스턴스)을 반환하는 `ServerSocket.accept` 함수를 호출해야 합니다:

```kotlin
val socket = serverSocket.accept()
```

연결된 소켓이 생성되면 소켓에서 읽거나 소켓에 씀으로써 데이터를 수신/전송할 수 있습니다.

### 데이터 수신 {id="server_receive"}

클라이언트로부터 데이터를 수신하려면 `Socket.openReadChannel` 함수를 호출해야 하며, 이 함수는 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)을 반환합니다:

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel`은 데이터의 비동기 읽기를 위한 API를 제공합니다.
예를 들어, `ByteReadChannel.readUTF8Line`을 사용하여 UTF-8 문자열 한 줄을 읽을 수 있습니다:

```kotlin
val name = receiveChannel.readUTF8Line()
```

### 데이터 전송 {id="server_send"}

클라이언트에 데이터를 전송하려면 `Socket.openWriteChannel` 함수를 호출해야 하며, 이 함수는 [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)을 반환합니다:

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel`은 바이트 시퀀스의 비동기 쓰기를 위한 API를 제공합니다.
예를 들어, `ByteWriteChannel.writeStringUtf8`을 사용하여 UTF-8 문자열 한 줄을 쓸 수 있습니다:

```kotlin
val name = receiveChannel.readUTF8Line()
sendChannel.writeStringUtf8("Hello, $name!
")
```

### 소켓 닫기 {id="server_close"}

[연결된 소켓](#accepts_connection)과 관련된 리소스를 해제하려면 `Socket.close`를 호출하십시오:

```kotlin
socket.close()
```

### 예제 {id="server-example"}

아래 코드 예제는 서버 측에서 소켓을 사용하는 방법을 보여줍니다:

```kotlin
package com.example

import io.ktor.network.selector.*
import io.ktor.network.sockets.*
import io.ktor.utils.io.*
import kotlinx.coroutines.*

fun main(args: Array<String>) {
    runBlocking {
        val selectorManager = SelectorManager(Dispatchers.IO)
        val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
        println("Server is listening at ${serverSocket.localAddress}")
        while (true) {
            val socket = serverSocket.accept()
            println("Accepted ${socket.remoteAddress}")
            launch {
                val receiveChannel = socket.openReadChannel()
                val sendChannel = socket.openWriteChannel(autoFlush = true)
                sendChannel.writeStringUtf8("Please enter your name
")
                try {
                    while (true) {
                        val name = receiveChannel.readUTF8Line()
                        sendChannel.writeStringUtf8("Hello, $name!
")
                    }
                } catch (e: Throwable) {
                    socket.close()
                }
            }
        }
    }
}

```

전체 예제는 여기서 확인할 수 있습니다: [sockets-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server).

## 클라이언트 {id="client"}

### 소켓 생성 {id="client_create_socket"}

클라이언트 소켓을 빌드하려면 `SelectorManager` 인스턴스를 생성하고, 해당 인스턴스에서 `SocketBuilder.tcp()` 함수를 호출한 다음, `connect`를 사용하여 연결을 설정하고 연결된 소켓([Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) 인스턴스)을 얻으십시오:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 9002)
```

연결된 소켓이 생성되면 소켓에서 읽거나 소켓에 씀으로써 데이터를 수신/전송할 수 있습니다.

### 보안 소켓 생성 (SSL/TLS) {id="secure"}

보안 소켓을 사용하면 TLS 연결을 설정할 수 있습니다. 
보안 소켓을 사용하려면 [ktor-network-tls](#add_dependencies) 의존성을 추가해야 합니다.
그런 다음 연결된 소켓에서 `Socket.tls` 함수를 호출하십시오:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 8443).tls()
```

`tls` 함수를 사용하면 [TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html)에서 제공하는 TLS 파라미터를 조정할 수 있습니다:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("youtrack.jetbrains.com", port = 443).tls(coroutineContext = coroutineContext) {
    trustManager = object : X509TrustManager {
        override fun getAcceptedIssuers(): `Array<X509Certificate?>` = arrayOf()
        override fun checkClientTrusted(certs: Array<X509Certificate?>?, authType: String?) {}
        override fun checkServerTrusted(certs: Array<X509Certificate?>?, authType: String?) {}
    }
}
```

전체 예제는 여기서 확인할 수 있습니다: [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls).

### 데이터 수신 {id="client_receive"}

서버로부터 데이터를 수신하려면 `Socket.openReadChannel` 함수를 호출해야 하며, 이 함수는 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)을 반환합니다:

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel`은 데이터의 비동기 읽기를 위한 API를 제공합니다.
예를 들어, `ByteReadChannel.readUTF8Line`을 사용하여 UTF-8 문자열 한 줄을 읽을 수 있습니다:

```kotlin
val greeting = receiveChannel.readUTF8Line()
```

### 데이터 전송 {id="client_send"}

서버에 데이터를 전송하려면 `Socket.openWriteChannel` 함수를 호출해야 하며, 이 함수는 [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)을 반환합니다:

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel`은 바이트 시퀀스의 비동기 쓰기를 위한 API를 제공합니다.
예를 들어, `ByteWriteChannel.writeStringUtf8`을 사용하여 UTF-8 문자열 한 줄을 쓸 수 있습니다:

```kotlin
val myMessage = readln()
sendChannel.writeStringUtf8("$myMessage
")
```

### 연결 닫기 {id="client_close"}

[연결된 소켓](#client_create_socket)과 관련된 리소스를 해제하려면 `Socket.close` 및 `SelectorManager.close`를 호출하십시오:

```kotlin
socket.close()
selectorManager.close()
```

### 예제 {id="client-example"}

아래 코드 예제는 클라이언트 측에서 소켓을 사용하는 방법을 보여줍니다:

```kotlin
package com.example

import io.ktor.network.selector.*
import io.ktor.network.sockets.*
import io.ktor.utils.io.*
import kotlinx.coroutines.*
import kotlin.system.*

fun main(args: Array<String>) {
    runBlocking {
        val selectorManager = SelectorManager(Dispatchers.IO)
        val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 9002)

        val receiveChannel = socket.openReadChannel()
        val sendChannel = socket.openWriteChannel(autoFlush = true)

        launch(Dispatchers.IO) {
            while (true) {
                val greeting = receiveChannel.readUTF8Line()
                if (greeting != null) {
                    println(greeting)
                } else {
                    println("Server closed a connection")
                    socket.close()
                    selectorManager.close()
                    exitProcess(0)
                }
            }
        }

        while (true) {
            val myMessage = readln()
            sendChannel.writeStringUtf8("$myMessage
")
        }
    }
}

```

전체 예제는 여기서 확인할 수 있습니다: [sockets-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client).