[//]: # (title: 伺服器引擎)

<show-structure for="chapter" depth="3"/>

<link-summary>
了解處理網路請求的引擎。
</link-summary>

要執行 Ktor 伺服器應用程式，您需要先[建立](server-create-and-configure.topic)並配置伺服器。
伺服器配置包含不同的設定：

- 處理網路請求的[引擎](#supported-engines)。
- 用於存取伺服器的裝機和連接埠值。
- SSL 設定。

## 支援的平台 {id="supported-engines"}

下表列出了每個引擎支援的平台：

| 引擎                                    | 平台                                                                  | HTTP/2 |
|-------------------------------------------|----------------------------------------------------------------------------|--------|
| `Netty`                                   | JVM                                                                        | ✅      |
| `Jetty`                                   | JVM                                                                        | ✅      |
| `Tomcat`                                  | JVM                                                                        | ✅      |
| `CIO` (基於協同程式的 I/O)               | JVM, [Native](server-native.md), [GraalVM](graalvm.md), JavaScript, WasmJs | ✖️     |
| [`ServletApplicationEngine`](server-war.md) | JVM                                                                        | ✅      |

## 新增相依性 {id="dependencies"}

在開始使用所需的引擎之前，您需要將對應的相依性新增至您的[建置指令碼](server-dependencies.topic)：

* `ktor-server-netty`
* `ktor-server-jetty-jakarta`
* `ktor-server-tomcat-jakarta`
* `ktor-server-cio`

以下是為 Netty 新增相依性的範例：

<var name="artifact_name" value="ktor-server-netty"/>
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

## 選擇建立伺服器的方式 {id="choose-create-server"}

Ktor 伺服器應用程式可以[透過兩種方式建立並執行](server-create-and-configure.topic#embedded)：

* 使用 [`embeddedServer`](#embeddedServer) 在程式碼中快速傳遞伺服器參數
* 使用 [`EngineMain`](#EngineMain) 從外部的 <Path>application.conf</Path> 或 <Path>application.yaml</Path> 檔案載入配置。

### embeddedServer {id="embeddedServer"}

[`embeddedServer()`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html)
函式接受一個引擎工廠，用於建立特定類型的引擎。在下面的範例中，我們傳遞了
[`Netty`](https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty/index.html) 工廠來執行具有 Netty 引擎的伺服器，並監聽 `8080` 連接埠：

```kotlin
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main(args: Array<String>) {
    embeddedServer(Netty, port = 8080) {
        routing {
            get("/") {
                call.respondText("Hello, world!")
            }
        }
    }.start(wait = true)
}
```

### EngineMain {id="EngineMain"}

`EngineMain` 代表執行伺服器的引擎。您可以使用以下引擎：

* `io.ktor.server.netty.EngineMain`
* `io.ktor.server.jetty.jakarta.EngineMain`
* `io.ktor.server.tomcat.jakarta.EngineMain`
* `io.ktor.server.cio.EngineMain`

#### 建立並啟動伺服器

`EngineMain.main()` 函式用於啟動具有所選引擎的伺服器，並載入外部[設定檔](server-configuration-file.topic)中指定的[應用程式模組](server-modules.md)。在下面的範例中，應用程式的 `main` 函式啟動了一台伺服器：

<Tabs>
<TabItem title="Application.kt">

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    routing {
        get("/") {
            call.respondText("Hello, world!")
        }
    }
}

```

</TabItem>

<TabItem title="application.conf">

```shell
ktor {
    deployment {
        port = 8080
    }
    application {
        modules = [ com.example.ApplicationKt.module ]
    }
}
```

</TabItem>

<TabItem title="application.yaml">

```yaml
ktor:
    deployment:
        port: 8080
    application:
        modules:
            - com.example.ApplicationKt.module
```

</TabItem>
</Tabs>

如果您需要使用建置系統任務來啟動伺服器，您需要將必要的 `EngineMain` 配置為主類別：

<Tabs group="languages" id="main-class-set-engine-main">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
mainClassName = "io.ktor.server.netty.EngineMain"
```

</TabItem>
<TabItem title="Maven" group-key="maven">

```xml
<properties>
    <main.class>io.ktor.server.netty.EngineMain</main.class>
</properties>
```

</TabItem>
</Tabs>

#### 建立伺服器執行個體而不啟動它 {id="createServer"}

除了直接呼叫 `EngineMain.main()` 立即啟動伺服器外，您也可以呼叫 `EngineMain.createServer()`，它會傳回一個 `EmbeddedServer` 執行個體而不啟動它。

這種方法讓您可以控制何時呼叫 `.start()`、`.stop()`，或在伺服器開始接受請求之前執行任何操作。

```Kotlin
// 使用 Netty 的範例
val server = io.ktor.server.netty.EngineMain.createServer(args)
// 執行額外的初始化、記錄、檢測等。
server.start(wait = true)
```
## 配置引擎 {id="configure-engine"}

在本節中，我們將了解如何指定各種引擎特定的選項。

### 在程式碼中 {id="embedded-server-configure"}

<p>
    <code>embeddedServer</code> 函式允許您使用 <code>configure</code> 參數傳遞引擎特定的選項。此參數包含所有引擎通用的選項，並由
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
        ApplicationEngine.Configuration
    </a>
    類別公開。
</p>
<p>
    下面的範例顯示如何使用 <code>Netty</code> 引擎配置伺服器。在 <code>configure</code> 區塊中，我們定義了一個 <code>connector</code> 來指定主機和連接埠，並自訂各種伺服器參數：
</p>
<code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"></code-block>
<p>
    <code>connectors.add()</code> 方法定義了一個具有指定主機 (<code>127.0.0.1</code>) 和連接埠 (<code>8080</code>) 的連接器。
</p>
<p>除了這些選項之外，您還可以配置其他引擎特定的屬性。</p>
<chapter title="Netty" id="netty-code">
    <p>
        Netty 特定的選項由
        <a href="https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
            NettyApplicationEngine.Configuration
        </a>
        類別公開。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.netty.*&#10;&#10;        fun main() {&#10;            embeddedServer(Netty, configure = {&#10;                requestQueueLimit = 16&#10;                shareWorkGroup = false&#10;                configureBootstrap = {&#10;                    // ...&#10;                }&#10;                responseWriteTimeoutSeconds = 10&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="Jetty" id="jetty-code">
    <p>
        Jetty 特定的選項由
        <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
            JettyApplicationEngineBase.Configuration
        </a>
        類別公開。
    </p>
    <p>您可以在 
        <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
            configureServer
        </a>
        區塊中配置 Jetty 伺服器，該區塊提供對 
        <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
        執行個體的存取。
    </p>
    <p>
        使用 <code>idleTimeout</code> 屬性指定連接在關閉前可以閒置的時間長度。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.jetty.jakarta.*&#10;&#10;        fun main() {&#10;            embeddedServer(Jetty, configure = {&#10;                configureServer = { // this: Server -&amp;gt;&#10;                    // ...&#10;                }&#10;                idleTimeout = 30.seconds&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="CIO" id="cio-code">
    <p>CIO 特定的選項由
        <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
            CIOApplicationEngine.Configuration
        </a>
        類別公開。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.cio.*&#10;&#10;        fun main() {&#10;            embeddedServer(CIO, configure = {&#10;                connectionIdleTimeoutSeconds = 45&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="Tomcat" id="tomcat-code">
    <p>如果您使用 Tomcat 作為引擎，可以使用 
        <a href="https://api.ktor.io/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
            configureTomcat
        </a>
        屬性進行配置，該屬性提供對 
        <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
        執行個體的存取。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.tomcat.jakarta.*&#10;&#10;        fun main() {&#10;            embeddedServer(Tomcat, configure = {&#10;                configureTomcat = { // this: Tomcat -&amp;gt;&#10;                    // ...&#10;                }&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>

### 在設定檔中 {id="engine-main-configure"}

<p>
    如果您使用 <code>EngineMain</code>，可以在 <code>ktor.deployment</code> 群組中指定所有引擎通用的選項。
</p>
<Tabs group="config">
    <TabItem title="application.conf" group-key="hocon" id="engine-main-conf">
        <code-block lang="shell" code="            ktor {&#10;                deployment {&#10;                    connectionGroupSize = 2&#10;                    workerGroupSize = 5&#10;                    callGroupSize = 10&#10;                    shutdownGracePeriod = 2000&#10;                    shutdownTimeout = 3000&#10;                }&#10;            }"></code-block>
    </TabItem>
    <TabItem title="application.yaml" group-key="yaml" id="engine-main-yaml">
        <code-block lang="yaml" code="           ktor:&#10;               deployment:&#10;                   connectionGroupSize: 2&#10;                   workerGroupSize: 5&#10;                   callGroupSize: 10&#10;                   shutdownGracePeriod: 2000&#10;                   shutdownTimeout: 3000"></code-block>
    </TabItem>
</Tabs>
<chapter title="Netty" id="netty-file">
    <p>
        您也可以在設定檔的 <code>ktor.deployment</code> 群組中配置 Netty 特定的選項：
    </p>
    <Tabs group="config">
        <TabItem title="application.conf" group-key="hocon" id="application-conf-1">
            <code-block lang="shell" code="               ktor {&#10;                   deployment {&#10;                       maxInitialLineLength = 2048&#10;                       maxHeaderSize = 1024&#10;                       maxChunkSize = 42&#10;                   }&#10;               }"></code-block>
        </TabItem>
        <TabItem title="application.yaml" group-key="yaml" id="application-yaml-1">
            <code-block lang="yaml" code="               ktor:&#10;                   deployment:&#10;                       maxInitialLineLength: 2048&#10;                       maxHeaderSize: 1024&#10;                       maxChunkSize: 42"></code-block>
        </TabItem>
    </Tabs>
</chapter>