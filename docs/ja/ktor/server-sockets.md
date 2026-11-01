[//]: # (title: ソケット)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sockets"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-network</code>, <code>io.ktor:ktor-network-tls</code>
</p>
<p><b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server">sockets-server</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client">sockets-client</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls">sockets-client-tls</a>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

Ktorは、サーバーおよびクライアント向けのHTTP/WebSocket処理に加えて、TCPおよびUDPのrawソケットもサポートしています。
内部で[java.nio](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html)を使用するサスペンドAPIを公開しています。

> ソケットは実験的（experimental）なAPIを使用しており、今後のアップデートで破壊的変更を伴いながら進化する可能性があります。
>
{type="note"}

## 依存関係の追加 {id="add_dependencies"}

<var name="artifact_name" value="ktor-network"/>
<var name="ktor_version_catalog_name" value="ktorLibs.network"/>
<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

クライアントで[セキュアソケット](#secure)を使用するには、`io.ktor:ktor-network-tls` も追加する必要があります。

## サーバー {id="server"}

### サーバーソケットの作成 {id="server_create_socket"}

サーバーソケットを構築するには、`SelectorManager` のインスタンスを作成し、それに対して `SocketBuilder.tcp()` 関数を呼び出し、`bind` を使用して特定のポートにサーバーソケットをバインドします:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
```

上記のスニペットは、[ServerSocket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-server-socket/index.html) のインスタンスであるTCPソケットを作成します。
UDPソケットを作成するには、`SocketBuilder.udp()` を使用します。

### 着信接続の受け入れ {id="accepts_connection"}

サーバーソケットを作成したら、ソケット接続を受け入れて接続済みソケット（[Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) インスタンス）を返す `ServerSocket.accept` 関数を呼び出す必要があります:

```kotlin
val socket = serverSocket.accept()
```

接続済みソケットを取得すると、ソケットからの読み取りまたはソケットへの書き込みによってデータを送受信できるようになります。

### データの受信 {id="server_receive"}

クライアントからデータを受信するには、[ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) を返す `Socket.openReadChannel` 関数を呼び出す必要があります:

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` はデータを非同期に読み取るためのAPIを提供します。
たとえば、`ByteReadChannel.readUTF8Line` を使用してUTF-8文字列の1行を読み取ることができます:

```kotlin
val name = receiveChannel.readLine()
```

### データの送信 {id="server_send"}

クライアントにデータを送信するには、[ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html) を返す `Socket.openWriteChannel` 関数を呼び出します:

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` はバイトシーケンスを非同期に書き込むためのAPIを提供します。
たとえば、`ByteWriteChannel.writeStringUtf8` を使用してUTF-8文字列の1行を書き込むことができます:

```kotlin
val name = receiveChannel.readLine()
sendChannel.writeStringUtf8("Hello, $name!\n")
```

### ソケットのクローズ {id="server_close"}

[接続済みソケット](#accepts_connection)に関連付けられたリソースを解放するには、`Socket.close` を呼び出します:

```kotlin
socket.close()
```

### 例 {id="server-example"}

以下のコードサンプルは、サーバー側でソケットを使用する方法を示しています:

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
                sendChannel.writeStringUtf8("Please enter your name\n")
                try {
                    while (true) {
                        val name = receiveChannel.readLine()
                        sendChannel.writeStringUtf8("Hello, $name!\n")
                    }
                } catch (e: Throwable) {
                    socket.close()
                }
            }
        }
    }
}

```

完全なサンプルはこちらで確認できます: [sockets-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server)。

## クライアント {id="client"}

### ソケットの作成 {id="client_create_socket"}

クライアントソケットを構築するには、`SelectorManager` のインスタンスを作成し、それに対して `SocketBuilder.tcp()` 関数を呼び出し、`connect` を使用して接続を確立して接続済みソケット（[Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) インスタンス）を取得します:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 9002)
```

接続済みソケットを取得すると、ソケットからの読み取りまたはソケットへの書き込みによってデータを送受信できるようになります。

### セキュアソケットの作成 (SSL/TLS) {id="secure"}

セキュアソケットを使用すると、TLS接続を確立できます。
セキュアソケットを使用するには、[ktor-network-tls](#add_dependencies) の依存関係を追加する必要があります。
その後、接続済みソケットに対して `Socket.tls` 関数を呼び出します:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 8443).tls()
```

`tls` 関数を使用すると、[TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) で提供されるTLSパラメーターを調整できます:

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("youtrack.jetbrains.com", port = 443).tls(coroutineContext = coroutineContext) {
    trustManager = object : X509TrustManager {
        override fun getAcceptedIssuers(): Array<X509Certificate?> = arrayOf()
        override fun checkClientTrusted(certs: Array<X509Certificate?>?, authType: String?) {}
        override fun checkServerTrusted(certs: Array<X509Certificate?>?, authType: String?) {}
    }
}
```

完全なサンプルはこちらで確認できます: [sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls)。

### データの受信 {id="client_receive"}

サーバーからデータを受信するには、[ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html) を返す `Socket.openReadChannel` 関数を呼び出す必要があります:

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` はデータを非同期に読み取るためのAPIを提供します。
たとえば、`ByteReadChannel.readUTF8Line` を使用してUTF-8文字列の1行を読み取ることができます:

```kotlin
val greeting = receiveChannel.readLine()
```

### データの送信 {id="client_send"}

サーバーにデータを送信するには、[ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html) を返す `Socket.openWriteChannel` 関数を呼び出します:

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` はバイトシーケンスを非同期に書き込むためのAPIを提供します。
たとえば、`ByteWriteChannel.writeStringUtf8` を使用してUTF-8文字列の1行を書き込むことができます:

```kotlin
val myMessage = readln()
sendChannel.writeStringUtf8("$myMessage\n")
```

### 接続のクローズ {id="client_close"}

[接続済みソケット](#client_create_socket)に関連付けられたリソースを解放するには、`Socket.close` と `SelectorManager.close` を呼び出します:

```kotlin
socket.close()
selectorManager.close()
```

### 例 {id="client-example"}

以下のコードサンプルは、クライアント側でソケットを使用する方法を示しています:

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
                val greeting = receiveChannel.readLine()
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
            sendChannel.writeStringUtf8("$myMessage\n")
        }
    }
}

```

完全なサンプルはこちらで確認できます: [sockets-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client)。