[//]: # (title: Socket)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sockets"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-network</code>, <code>io.ktor:ktor-network-tls</code>
</p>
<p><b>程式碼範例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server">sockets-server</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client">sockets-client</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls">sockets-client-tls</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓您在無需額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links>支援</b>: ✅
</p>
</tldr>

除了為伺服器與用戶端處理 HTTP/WebSocket 之外，Ktor 也支援 TCP 與 UDP 原始 Socket。
它公開了一個在底層使用 [java.nio](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html) 的暫停 API。

> Socket 使用了實驗性 API，預計在未來的更新中持續演進，並可能帶來重大變更 (breaking changes)。
>
{type="note"}

## 新增相依性 {id="add_dependencies"}

<var name="artifact_name" value="ktor-network"/>
<var name="ktor_version_catalog_name" value="ktorLibs.network"/>
<p>
    若要使用 <code>%plugin_name%</code>，請在建置指令碼中新增 <code>%artifact_name%</code> 構件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

若要在用戶端中使用[安全 Socket](#secure)，您還需要新增 `io.ktor:ktor-network-tls`。

## 伺服器 {id="server"}

### 建立伺服器 Socket {id="server_create_socket"}

若要建構伺服器 Socket，請建立 `SelectorManager` 執行個體，對其呼叫 `SocketBuilder.tcp()` 函式，然後使用 `bind` 將伺服器 Socket 繫結至特定連接埠：

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val serverSocket = aSocket(selectorManager).tcp().bind("127.0.0.1", 9002)
```

上述程式碼片段會建立一個 TCP Socket，它是 [ServerSocket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-server-socket/index.html) 執行個體。
若要建立 UDP Socket，請使用 `SocketBuilder.udp()`。

### 接受連入連線 {id="accepts_connection"}

建立伺服器 Socket 後，您需要呼叫 `ServerSocket.accept` 函式來接受 Socket 連線，並傳回已連線的 Socket（[Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) 執行個體）：

```kotlin
val socket = serverSocket.accept()
```

取得已連線的 Socket 後，您可以透過從 Socket 讀取或寫入資料來接收/傳送資料。

### 接收資料 {id="server_receive"}

若要從用戶端接收資料，您需要呼叫 `Socket.openReadChannel` 函式，該函式會傳回 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)：

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` 提供了用於非同步讀取資料的 API。
例如，您可以使用 `ByteReadChannel.readUTF8Line` 讀取一行 UTF-8 字元：

```kotlin
val name = receiveChannel.readLine()
```

### 傳送資料 {id="server_send"}

若要向用戶端傳送資料，請呼叫 `Socket.openWriteChannel` 函式，該函式會傳回 [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)：

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` 提供了用於非同步寫入位元組序列的 API。
例如，您可以使用 `ByteWriteChannel.writeStringUtf8` 寫入一行 UTF-8 字元：

```kotlin
val name = receiveChannel.readLine()
sendChannel.writeStringUtf8("Hello, $name!\n")
```

### 關閉 Socket {id="server_close"}

若要釋放與[已連線 Socket](#accepts_connection) 關聯的資源，請呼叫 `Socket.close`：

```kotlin
socket.close()
```

### 範例 {id="server-example"}

以下程式碼範例展示如何在伺服器端使用 Socket：

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

您可以在此處找到完整範例：[sockets-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-server)。

## 用戶端 {id="client"}

### 建立 Socket {id="client_create_socket"}

若要建構用戶端 Socket，請建立 `SelectorManager` 執行個體，對其呼叫 `SocketBuilder.tcp()` 函式，然後使用 `connect` 建立連線並取得已連線的 Socket（[Socket](https://api.ktor.io/ktor-network/io.ktor.network.sockets/-socket/index.html) 執行個體）：

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 9002)
```

取得已連線的 Socket 後，您可以透過從 Socket 讀取或寫入資料來接收/傳送資料。

### 建立安全 Socket (SSL/TLS) {id="secure"}

安全 Socket 允許您建立 TLS 連線。
若要使用安全 Socket，您需要新增 [ktor-network-tls](#add_dependencies) 相依性。
然後，在已連線的 Socket 上呼叫 `Socket.tls` 函式：

```kotlin
val selectorManager = SelectorManager(Dispatchers.IO)
val socket = aSocket(selectorManager).tcp().connect("127.0.0.1", 8443).tls()
```

`tls` 函式允許您調整由 [TLSConfigBuilder](https://api.ktor.io/ktor-network-tls/io.ktor.network.tls/-t-l-s-config-builder/index.html) 提供的 TLS 參數：

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

您可以在此處找到完整範例：[sockets-client-tls](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client-tls)。

### 接收資料 {id="client_receive"}

若要從伺服器接收資料，您需要呼叫 `Socket.openReadChannel` 函式，該函式會傳回 [ByteReadChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-read-channel/index.html)：

```kotlin
val receiveChannel = socket.openReadChannel()
```

`ByteReadChannel` 提供了用於非同步讀取資料的 API。
例如，您可以使用 `ByteReadChannel.readUTF8Line` 讀取一行 UTF-8 字元：

```kotlin
val greeting = receiveChannel.readLine()
```

### 傳送資料 {id="client_send"}

若要向伺服器傳送資料，請呼叫 `Socket.openWriteChannel` 函式，該函式會傳回 [ByteWriteChannel](https://api.ktor.io/ktor-io/io.ktor.utils.io/-byte-write-channel/index.html)：

```kotlin
val sendChannel = socket.openWriteChannel(autoFlush = true)
```

`ByteWriteChannel` 提供了用於非同步寫入位元組序列的 API。
例如，您可以使用 `ByteWriteChannel.writeStringUtf8` 寫入一行 UTF-8 字元：

```kotlin
val myMessage = readln()
sendChannel.writeStringUtf8("$myMessage\n")
```

### 關閉連線 {id="client_close"}

若要釋放與[已連線 Socket](#client_create_socket) 關聯的資源，請呼叫 `Socket.close` 與 `SelectorManager.close`：

```kotlin
socket.close()
selectorManager.close()
```

### 範例 {id="client-example"}

以下程式碼範例展示如何在用戶端使用 Socket：

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

您可以在此處找到完整範例：[sockets-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/sockets-client)。