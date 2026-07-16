[//]: # (title: ソケット)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sockets"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:ktor-network</code>, <code>io.ktor:ktor-network-tls</code>
</p>
<p><b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server">sockets-server</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client">sockets-client</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls">sockets-client-tls</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

Ktorは、サーバーおよびクライアント向けのHTTP/WebSocket処理に加えて、TCPおよびUDPの生ソケット（raw sockets）をサポートしています。
これは、内部で [java.nio](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html) を使用するサスペンディングAPIを公開しています。

> ソケットは実験的なAPIを使用しており、今後のアップデートで破壊的な変更が加えられる可能性がある進化が予想されます。
>
{type="note"}

## 依存関係の追加 {id="add_dependencies"}

<var name="artifact_name" value="ktor-network"/>
<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを含める必要があります。
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

クライアントで[セキュアソケット](#secure)を使用するには、`io.ktor:ktor-network-tls` も追加する必要があります。

## サーバー {id="server"}

### サーバーソケットの作成 {id="server_create_socket"}

サーバーソケットを構築するには、`SelectorManager` インスタンスを作成し、その上で `SocketBuilder.tcp()` 関数を呼び出して、`bind` を使用してサーバーソケットを特定のポートにバインドします。

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
```

上記のスニペットは、[ServerSocket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-server-socket/index.html) インスタンスであるTCPソケットを作成します。
UDPソケットを作成するには、`SocketBuilder.udp()` を使用します。

### 着信接続の受け入れ {id="accepts_connection"}

サーバーソケットを作成した後、ソケット接続を受け入れ、接続されたソケット（[Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) インスタンス）を返す `ServerSocket.accept` 関数を呼び出す必要があります。

```kotlin
val socket = serverSocket.accept()
```

接続されたソケットを取得したら、ソケットからの読み取りまたはソケットへの書き込みによってデータを送受信できます。

### データの受信 {id="server_receive"}

クライアントからデータを受信するには、`Socket.openReadChannel` 関数を呼び出す必要があります。これは [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) を返します。

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` は、データの非同期読み取りのためのAPIを提供します。
例えば、`ByteReadChannel.readUTF8Line` を使用してUTF-8文字の行を読み取ることができます。

```kotlin
val name = receiveChannel.readUTF8Line()
```

### データの送信 {id="server_send"}

クライアントにデータを送信するには、`Socket.openWriteChannel` 関数を呼び出します。これは [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html) を返します。

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` は、バイトシーケンスの非同期書き込みのためのAPIを提供します。
例えば、`ByteWriteChannel.writeStringUtf8` を使用してUTF-8文字の行を書き込むことができます。

```kotlin
val name = receiveChannel.readUTF8Line()
sendChannel.writeStringUtf8("Hello, $name!
")
```

### ソケットのクローズ {id="server_close"}

[接続されたソケット](#accepts_connection)に関連付けられたリソースを解放するには、`Socket.close` を呼び出します。

```kotlin
socket.close()
```

### 例 {id="server-example"}

以下のコード例は、サーバー側でソケットを使用する方法を示しています。

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

完全な例はこちらにあります: [sockets-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server)

## クライアント {id="client"}

### ソケットの作成 {id="client_create_socket"}

クライアントソケットを構築するには、`SelectorManager` インスタンスを作成し、その上で `SocketBuilder.tcp()` 関数を呼び出し、`connect` を使用して接続を確立し、接続されたソケット（[Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) インスタンス）を取得します。

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 9002)
```

接続されたソケットを取得したら、ソケットからの読み取りまたはソケットへの書き込みによってデータを送受信できます。

### セキュアソケット（SSL/TLS）の作成 {id="secure"}

セキュアソケットを使用すると、TLS接続を確立できます。
セキュアソケットを使用するには、[ktor-network-tls](#add_dependencies) 依存関係を追加する必要があります。
次に、接続されたソケットで `Socket.tls` 関数を呼び出します。

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 8443).tls()
```

`tls` 関数を使用すると、[TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) によって提供されるTLSパラメータを調整できます。

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

完全な例はこちらにあります: [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls)

### データの受信 {id="client_receive"}

サーバーからデータを受信するには、`Socket.openReadChannel` 関数を呼び出す必要があります。これは [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) を返します。

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` は、データの非同期読み取りのためのAPIを提供します。
例えば、`ByteReadChannel.readUTF8Line` を使用してUTF-8文字の行を読み取ることができます。

```kotlin
val greeting = receiveChannel.readUTF8Line()
```

### データの送信 {id="client_send"}

サーバーにデータを送信するには、`Socket.openWriteChannel` 関数を呼び出します。これは [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html) を返します。

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` は、バイトシーケンスの非同期書き込みのためのAPIを提供します。
例えば、`ByteWriteChannel.writeStringUtf8` を使用してUTF-8文字の行を書き込むことができます。

```kotlin
val myMessage = readln()
sendChannel.writeStringUtf8("$myMessage
")
```

### 接続のクローズ {id="client_close"}

[接続されたソケット](#client_create_socket)に関連付けられたリソースを解放するには、`Socket.close` と `SelectorManager.close` を呼び出します。

```kotlin
socket.close()
selectorManager.close()
```

### 例 {id="client-example"}

以下のコード例は、クライアント側でソケットを使用する方法を示しています。

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

完全な例はこちらにあります: [sockets-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client)