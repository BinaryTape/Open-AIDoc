[//]: # (title: 套接字)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sockets"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:ktor-network</code>、<code>io.ktor:ktor-network-tls</code>
</p>
<p><b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server">sockets-server</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client">sockets-client</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls">sockets-client-tls</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

除了为服务器和客户端提供 HTTP/WebSocket 处理之外，Ktor 还支持 TCP 和 UDP 原始套接字。
它提供了一套在底层使用 [java.nio](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html) 的挂起 API。

> 套接字使用的是实验性 API，预计会在后续更新中演进，并可能引入破坏性变更。
>
{type="note"}

## 添加依赖项 {id="add_dependencies"}

<var name="artifact_name" value="ktor-network"/>
<var name="ktor_version_catalog_name" value="ktorLibs.network"/>
<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到您的构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

若要在客户端中使用[安全套接字](#secure)，您还需要添加 `io.ktor:ktor-network-tls`。

## 服务器 {id="server"}

### 创建服务器套接字 {id="server_create_socket"}

要构建服务器套接字，请创建 `SelectorManager` 实例，对其调用 `SocketBuilder.tcp()` 函数，
然后使用 `bind` 将服务器套接字绑定到特定端口：

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
```

上面的代码段创建了一个 TCP 套接字，它是 [ServerSocket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-server-socket/index.html) 实例。
要创建 UDP 套接字，请使用 `SocketBuilder.udp()`。

### 接受传入连接 {id="accepts_connection"}

创建服务器套接字后，需要调用 `ServerSocket.accept` 函数来接受套接字连接，
并返回已连接的套接字（即 [Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) 实例）：

```kotlin
val socket = serverSocket.accept()
```

拥有已连接的套接字后，您可以通过对该套接字执行读写操作来接收/发送数据。

### 接收数据 {id="server_receive"}

要接收来自客户端的数据，需要调用 `Socket.openReadChannel` 函数，它会返回 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)：

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` 提供了用于异步读取数据的 API。
例如，您可以使用 `ByteReadChannel.readUTF8Line` 读取一行 UTF-8 字符：

```kotlin
val name = receiveChannel.readLine()
```

### 发送数据 {id="server_send"}

要向客户端发送数据，请调用 `Socket.openWriteChannel` 函数，它会返回 [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)：

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` 提供了用于异步写入字节序列的 API。
例如，您可以使用 `ByteWriteChannel.writeStringUtf8` 写入一行 UTF-8 字符：

```kotlin
val name = receiveChannel.readLine()
sendChannel.writeStringUtf8("Hello, $name!\n")
```

### 关闭套接字 {id="server_close"}

要释放与[已连接套接字](#accepts_connection)关联的资源，请调用 `Socket.close`：

```kotlin
socket.close()
```

### 示例 {id="server-example"}

以下代码示例演示了如何在服务器端使用套接字：

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

您可以在此处找到完整示例：[sockets-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server)。

## 客户端 {id="client"}

### 创建套接字 {id="client_create_socket"}

要构建客户端套接字，请创建 `SelectorManager` 实例，对其调用 `SocketBuilder.tcp()` 函数，
然后使用 `connect` 建立连接并获取已连接的套接字（即 [Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) 实例）：

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 9002)
```

拥有已连接的套接字后，您可以通过对该套接字执行读写操作来接收/发送数据。

### 创建安全套接字 (SSL/TLS) {id="secure"}

安全套接字允许您建立 TLS 连接。
要使用安全套接字，您需要添加 [ktor-network-tls](#add_dependencies) 依赖项。
然后，在已连接的套接字上调用 `Socket.tls` 函数：

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 8443).tls()
```

`tls` 函数允许您调整由 [TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) 提供的 TLS 参数：

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

您可以在此处找到完整示例：[sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls)。

### 接收数据 {id="client_receive"}

要接收来自服务器的数据，需要调用 `Socket.openReadChannel` 函数，它会返回 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)：

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` 提供了用于异步读取数据的 API。
例如，您可以使用 `ByteReadChannel.readUTF8Line` 读取一行 UTF-8 字符：

```kotlin
val greeting = receiveChannel.readLine()
```

### 发送数据 {id="client_send"}

要向服务器发送数据，请调用 `Socket.openWriteChannel` 函数，它会返回 [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)：

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` 提供了用于异步写入字节序列的 API。
例如，您可以使用 `ByteWriteChannel.writeStringUtf8` 写入一行 UTF-8 字符：

```kotlin
val myMessage = readln()
sendChannel.writeStringUtf8("$myMessage\n")
```

### 关闭连接 {id="client_close"}

要释放与[已连接套接字](#client_create_socket)关联的资源，请调用 `Socket.close` 和 `SelectorManager.close`：

```kotlin
socket.close()
selectorManager.close()
```

### 示例 {id="client-example"}

以下代码示例演示了如何在客户端使用套接字：

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

您可以在此处找到完整示例：[sockets-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client)。