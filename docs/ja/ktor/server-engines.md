[//]: # (title: サーバーエンジン)

<show-structure for="chapter" depth="3"/>

<link-summary>
ネットワークリクエストを処理するエンジンについて学びます。
</link-summary>

Ktorサーバーアプリケーションを実行するには、まずサーバーを[作成](server-create-and-configure.topic)し、設定する必要があります。
サーバー設定には、以下のような様々な設定が含まれます：

- ネットワークリクエストを処理するための[エンジン](#supported-engines)。
- サーバーへのアクセスに使用されるホストとポートの値。
- SSL設定。

## サポートされているプラットフォーム {id="supported-engines"}

以下の表は、各エンジンでサポートされているプラットフォームを示しています：

| エンジン                                    | プラットフォーム                                                                  | HTTP/2 |
|-------------------------------------------|----------------------------------------------------------------------------|--------|
| `Netty`                                   | JVM                                                                        | ✅      |
| `Jetty`                                   | JVM                                                                        | ✅      |
| `Tomcat`                                  | JVM                                                                        | ✅      |
| `CIO` (Coroutine-based I/O)               | JVM, [Native](server-native.md), [GraalVM](graalvm.md), JavaScript, WasmJs | ✖️     |
| [`ServletApplicationEngine`](server-war.md) | JVM                                                                        | ✅      |

## 依存関係の追加 {id="dependencies"}

目的のエンジンを使用する前に、対応する依存関係を[ビルドスクリプト](server-dependencies.topic)に追加する必要があります：

* `ktor-server-netty`
* `ktor-server-jetty-jakarta`
* `ktor-server-tomcat-jakarta`
* `ktor-server-cio`

以下は、Nettyの依存関係を追加する例です：

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

## サーバーの作成方法を選択する {id="choose-create-server"}

Ktorサーバーアプリケーションは、[2つの方法で作成および実行](server-create-and-configure.topic#embedded)できます：

* [`embeddedServer`](#embeddedServer) を使用して、コード内でサーバーパラメータを素早く渡す
* [`EngineMain`](#EngineMain) を使用して、外部の <Path>application.conf</Path> または <Path>application.yaml</Path> ファイルから設定を読み込む

### embeddedServer {id="embeddedServer"}

[`embeddedServer()`](https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html) 関数は、特定のタイプのエンジンを作成するために使用されるエンジンファクトリを受け取ります。以下の例では、[`Netty`](https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty/index.html) ファクトリを渡して、Nettyエンジンでサーバーを実行し、`8080` ポートでリッスンします：

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

`EngineMain` は、サーバーを実行するためのエンジンを表します。以下のエンジンを使用できます：

* `io.ktor.server.netty.EngineMain`
* `io.ktor.server.jetty.jakarta.EngineMain`
* `io.ktor.server.tomcat.jakarta.EngineMain`
* `io.ktor.server.cio.EngineMain`

#### サーバーの作成と起動

`EngineMain.main()` 関数は、選択したエンジンでサーバーを起動し、外部の[設定ファイル](server-configuration-file.topic)で指定された[アプリケーションモジュール](server-modules.md)をロードするために使用されます。以下の例では、アプリケーションの `main` 関数がサーバーを起動します：

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

ビルドシステムのタスクを使用してサーバーを起動する必要がある場合は、必要な `EngineMain` をメインクラスとして設定する必要があります：

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

#### 起動せずにサーバーインスタンスを作成する {id="createServer"}

サーバーをすぐに起動するために `EngineMain.main()` を直接呼び出す以外に、サーバーを起動せずに `EmbeddedServer` インスタンスを返す `EngineMain.createServer()` を呼び出すこともできます。

このアプローチでは、サーバーがリクエストの受け付けを開始する前に、いつ `.start()` や `.stop()` を呼び出すか、あるいはサーバーに対して何らかの操作を行うかを制御できます。

```Kotlin
// Nettyを使用した例
val server = io.ktor.server.netty.EngineMain.createServer(args)
// 追加の初期化、ロギング、インストルメンテーションなどを実行します
server.start(wait = true)
```
## エンジンの設定 {id="configure-engine"}

このセクションでは、様々なエンジン固有のオプションを指定する方法を見ていきます。

### コード内での設定 {id="embedded-server-configure"}

<p>
    <code>embeddedServer</code> 関数では、<code>configure</code> パラメータを使用してエンジン固有のオプションを渡すことができます。このパラメータには、すべてのエンジンに共通で
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
        ApplicationEngine.Configuration
    </a>
    クラスによって公開されているオプションが含まれます。
</p>
<p>
    以下の例は、<code>Netty</code> エンジンを使用してサーバーを設定する方法を示しています。
    <code>configure</code> ブロック内で、ホストとポートを指定するための <code>connector</code> を定義し、様々なサーバーパラメータをカスタマイズします：
</p>
<code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"></code-block>
<p>
    <code>connectors.add()</code> メソッドは、指定されたホスト
    (<code>127.0.0.1</code>)
    とポート (<code>8080</code>) でコネクタを定義します。
</p>
<p>これらのオプションに加えて、他のエンジン固有のプロパティを設定することもできます。</p>
<chapter title="Netty" id="netty-code">
    <p>
        Netty固有のオプションは、
        <a href="https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
            NettyApplicationEngine.Configuration
        </a>
        クラスによって公開されています。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.netty.*&#10;&#10;        fun main() {&#10;            embeddedServer(Netty, configure = {&#10;                requestQueueLimit = 16&#10;                shareWorkGroup = false&#10;                configureBootstrap = {&#10;                    // ...&#10;                }&#10;                responseWriteTimeoutSeconds = 10&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="Jetty" id="jetty-code">
    <p>
        Jetty固有のオプションは、
        <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
            JettyApplicationEngineBase.Configuration
        </a>
        クラスによって公開されています。
    </p>
    <p>
        <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
            configureServer
        </a>
        ブロック内でJettyサーバーを設定できます。これにより 
        <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
        インスタンスにアクセスできます。
    </p>
    <p>
        接続が閉じられるまでにアイドル状態でいられる時間を指定するには、<code>idleTimeout</code> プロパティを使用します。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.jetty.jakarta.*&#10;&#10;        fun main() {&#10;            embeddedServer(Jetty, configure = {&#10;                configureServer = { // this: Server -&amp;gt;&#10;                    // ...&#10;                }&#10;                idleTimeout = 30.seconds&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="CIO" id="cio-code">
    <p>CIO固有のオプションは、
        <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
            CIOApplicationEngine.Configuration
        </a>
        クラスによって公開されています。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.cio.*&#10;&#10;        fun main() {&#10;            embeddedServer(CIO, configure = {&#10;                connectionIdleTimeoutSeconds = 45&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>
<chapter title="Tomcat" id="tomcat-code">
    <p>Tomcatをエンジンとして使用する場合、
        <a href="https://api.ktor.io/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
            configureTomcat
        </a>
        プロパティを使用して設定できます。これにより
        <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
        インスタンスにアクセスできます。
    </p>
    <code-block lang="kotlin" code="        import io.ktor.server.engine.*&#10;        import io.ktor.server.tomcat.jakarta.*&#10;&#10;        fun main() {&#10;            embeddedServer(Tomcat, configure = {&#10;                configureTomcat = { // this: Tomcat -&amp;gt;&#10;                    // ...&#10;                }&#10;            }) {&#10;                // ...&#10;            }.start(true)&#10;        }"></code-block>
</chapter>

### 設定ファイル内での設定 {id="engine-main-configure"}

<p>
    <code>EngineMain</code> を使用する場合、<code>ktor.deployment</code> グループ内ですべてのエンジンに共通のオプションを指定できます。
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
        設定ファイル内の <code>ktor.deployment</code> グループで、Netty固有のオプションを設定することもできます：
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