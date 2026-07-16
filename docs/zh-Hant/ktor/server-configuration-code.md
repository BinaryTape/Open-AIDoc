```xml
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="程式碼中的組態"
   id="server-configuration-code" help-id="Configuration-code;server-configuration-in-code">
<show-structure for="chapter"/>
<link-summary>
    瞭解如何在程式碼中組態各種伺服器參數。
</link-summary>
<p>
    Ktor 允許您直接在程式碼中組態各種伺服器參數，包括主機位址、埠、<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">伺服器模組</Links>等等。組態方法取決於您設定伺服器的方式——使用 <Links href="/ktor/server-create-and-configure" summary="Learn how to create a server depending on your application deployment needs.">embeddedServer 或 EngineMain</Links>。
</p>
<p>
    使用 <code>embeddedServer</code>，您可以透過直接將所需參數傳遞給函式來組態伺服器。
    <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/embedded-server.html">
        embeddedServer
    </a>
    函式接受不同的參數來組態伺服器，包括<Links href="/ktor/server-engines" summary="Learn about engines that process network requests.">伺服器引擎</Links>、伺服器監聽的主機和埠，以及其他組態。
</p>
<p>
    在本節中，我們將探討幾個執行 <code>embeddedServer</code> 的不同範例，
    說明如何組態伺服器以發揮其優勢。
</p>
<chapter title="基本組態" id="embedded-basic">
    <p>
        以下程式碼片段顯示了使用 Netty 引擎和 <code>8080</code> 埠的基本伺服器設定。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        請注意，您可以將 <code>port</code> 參數設定為 <code>0</code> 以在隨機埠上執行伺服器。
        <code>embeddedServer</code> 函式會返回一個引擎實例，因此您可以透過使用
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/resolved-connectors.html">
            ApplicationEngine.resolvedConnectors
        </a>
        函式在程式碼中取得埠值。
    </p>
</chapter>
<chapter title="引擎組態" id="embedded-engine">
    <snippet id="embedded-engine-configuration">
        <p>
            <code>embeddedServer</code> 函式允許您使用 <code>configure</code> 參數傳遞引擎特定選項。此參數包含所有引擎通用的選項，並由
            <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
                ApplicationEngine.Configuration
            </a>
            類別公開。
        </p>
        <p>
            以下範例展示了如何使用 <code>Netty</code> 引擎組態伺服器。在 <code>configure</code> 區塊中，我們定義了一個 <code>connector</code> 以指定主機和埠，並自訂各種伺服器參數：
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            <code>connectors.add()</code> 方法定義了一個帶有指定主機 (<code>127.0.0.1</code>)
            和埠 (<code>8080</code>) 的連接器。
        </p>
        <p>除了這些選項之外，您還可以組態其他引擎特定的屬性。</p>
        <chapter title="Netty" id="netty-code">
            <p>
                Netty 特定選項由
                <a href="https://api.ktor.io/ktor-server/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
                    NettyApplicationEngine.Configuration
                </a>
                類別公開。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, configure = {&#10;                            requestQueueLimit = 16&#10;                            shareWorkGroup = false&#10;                            configureBootstrap = {&#10;                                // ...&#10;                            }&#10;                            responseWriteTimeoutSeconds = 10&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Jetty" id="jetty-code">
            <p>
                Jetty 特定選項由
                <a href="https://api.ktor.io/ktor-server/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
                    JettyApplicationEngineBase.Configuration
                </a>
                類別公開。
            </p>
            <p>您可以在
                <a href="https://api.ktor.io/ktor-server/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
                    configureServer
                </a>
                區塊內部組態 Jetty 伺服器，該區塊提供對
                <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
                實例的存取。
            </p>
            <p>
                使用 <code>idleTimeout</code> 屬性指定連線在關閉之前可以閒置的時間。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.jetty.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Jetty, configure = {&#10;                            configureServer = { // this: Server -&amp;gt;&#10;                                // ...&#10;                            }&#10;                            idleTimeout = 30.seconds&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="CIO" id="cio-code">
            <p>CIO 特定選項由
                <a href="https://api.ktor.io/ktor-server/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
                    CIOApplicationEngine.Configuration
                </a>
                類別公開。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.cio.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(CIO, configure = {&#10;                            connectionIdleTimeoutSeconds = 45&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Tomcat" id="tomcat-code">
            <p>如果您使用 Tomcat 作為引擎，您可以使用
                <a href="https://api.ktor.io/ktor-server/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
                    configureTomcat
                </a>
                屬性組態它，該屬性提供對
                <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
                實例的存取。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.tomcat.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Tomcat, configure = {&#10;                            configureTomcat = { // this: Tomcat -&amp;gt;&#10;                                // ...&#10;                            }&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
    </snippet>
</chapter>
<chapter title="自訂環境" id="embedded-custom">
    <p>
        以下範例展示了如何使用
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
            ApplicationEngine.Configuration
        </a>
        類別表示的自訂組態來執行具有多個連接器端點的伺服器。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main() {&#10;    val appProperties = serverConfig {&#10;        module { module() }&#10;    }&#10;    embeddedServer(Netty, appProperties) {&#10;        envConfig()&#10;    }.start(true)&#10;}&#10;&#10;fun ApplicationEngine.Configuration.envConfig() {&#10;    connector {&#10;        host = &quot;0.0.0.0&quot;&#10;        port = 8080&#10;    }&#10;    connector {&#10;        host = &quot;127.0.0.1&quot;&#10;        port = 9090&#10;    }&#10;}"/>
    <p>
        有關完整範例，請參閱
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server-multiple-connectors">
            embedded-server-multiple-connectors
        </a>。
    </p>
    <tip>
        <p>
            您也可以使用自訂環境來
            <a href="#embedded-server">
                提供 HTTPS 服務
            </a>。
        </p>
    </tip>
</chapter>
<chapter id="command-line" title="命令列組態">
    <p>
        Ktor 允許您使用命令列引數動態組態 <code>embeddedServer</code>。這在需要於執行時指定埠、主機或逾時等組態的情況下特別有用。
    </p>
    <p>
        為實現此目的，請使用
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-command-line-config.html">
            CommandLineConfig
        </a>
        類別將命令列引數解析為組態物件，並將其傳遞到組態區塊中：
    </p>
    <code-block lang="kotlin" code="fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        在此範例中，來自 <code>Application.Configuration</code> 的
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/take-from.html">
            <code>takeFrom()</code>
        </a>
        函式用於覆寫引擎組態值，例如 <code>port</code> 和 <code>host</code>。
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/load-common-configuration.html">
            <code>loadCommonConfiguration()</code>
        </a>
        函式從根環境載入組態，例如逾時。
    </p>
    <p>
        若要執行伺服器，請以下列方式指定引數：
    </p>
    <code-block lang="shell" code="            ./gradlew run --args=&quot;-port=8080&quot;"/>
    <tip>
        <p>
            對於靜態組態，您可以使用組態檔或環境變數。
            若要瞭解更多資訊，請參閱
            <a href="#command-line">
                檔案中的組態
            </a>
            。
        </p>
    </tip>
</chapter>