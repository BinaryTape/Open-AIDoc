<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="程式碼中的配置"
       id="server-configuration-code" help-id="Configuration-code;server-configuration-in-code">
<show-structure for="chapter"/>
<link-summary>
    了解如何在程式碼中配置各種伺服器參數。
</link-summary>
<p>
    Ktor 允許您直接在程式碼中配置各種伺服器參數，包括主機位址、port、<Links href="//server-modules" summary="模組允許您透過分組路由來建構應用程式。">伺服器模組</Links>等等。配置方式取決於您設定伺服器的方式 —— 使用 <Links href="//server-create-and-configure" summary="了解如何根據您的應用程式部署需求建立伺服器。">embeddedServer 或 EngineMain</Links>。
</p>
<p>
    使用 <code>embeddedServer</code> 時，您可以透過將所需的參數直接傳遞給該函式來配置伺服器。
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html">
        embeddedServer
    </a>
    函式接受用於配置伺服器的不同參數，包括 <Links href="//server-engines" summary="了解處理網路請求的引擎。">伺服器引擎</Links>、伺服器監聽的主機與 port，以及其他配置。
</p>
<p>
    在本節中，我們將查看幾個執行 <code>embeddedServer</code> 的不同範例，說明如何配置伺服器以發揮其優勢。
</p>
<chapter title="基本配置" id="embedded-basic">
    <p>
        下方的程式碼片段顯示了使用 Netty 引擎與 <code>8080</code> port 的基本伺服器設定。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        請注意，您可以將 <code>port</code> 參數設定為 <code>0</code> 以在隨機 port 上執行伺服器。
        <code>embeddedServer</code> 函式會回傳一個引擎執行個體，因此您可以使用 
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/resolved-connectors.html">
            ApplicationEngine.resolvedConnectors
        </a>
        函式在程式碼中獲取 port 值。
    </p>
</chapter>
<chapter title="引擎配置" id="embedded-engine">
    <snippet id="embedded-engine-configuration">
        <p>
            <code>embeddedServer</code> 函式允許您使用 <code>configure</code> 參數傳遞特定於引擎的選項。此參數包含所有引擎通用的選項，並由 
            <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
                ApplicationEngine.Configuration
            </a>
            類別公開。
        </p>
        <p>
            下方的範例顯示如何使用 <code>Netty</code> 引擎配置伺服器。在 <code>configure</code> 區塊內，我們定義了一個 <code>connector</code> 來指定主機與 port，並自訂各種伺服器參數：
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            <code>connectors.add()</code> 方法定義了一個具有指定主機 (<code>127.0.0.1</code>) 與 port (<code>8080</code>) 的連接器。
        </p>
        <p>除了這些選項之外，您還可以配置其他特定於引擎的屬性。</p>
        <chapter title="Netty" id="netty-code">
            <p>
                特定於 Netty 的選項由 
                <a href="https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
                    NettyApplicationEngine.Configuration
                </a>
                類別公開。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, configure = {&#10;                            requestQueueLimit = 16&#10;                            shareWorkGroup = false&#10;                            configureBootstrap = {&#10;                                // ...&#10;                            }&#10;                            responseWriteTimeoutSeconds = 10&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Jetty" id="jetty-code">
            <p>
                特定於 Jetty 的選項由 
                <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
                    JettyApplicationEngineBase.Configuration
                </a>
                類別公開。
            </p>
            <p>您可以在 
                <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
                    configureServer
                </a>
                區塊內配置 Jetty 伺服器，該區塊提供了對 
                <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
                執行個體的存取。
            </p>
            <p>
                使用 <code>idleTimeout</code> 屬性指定連線在關閉前可以保持閒置的時間長度。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.jetty.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Jetty, configure = {&#10;                            configureServer = { // this: Server -&amp;gt;&#10;                                // ...&#10;                            }&#10;                            idleTimeout = 30.seconds&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="CIO" id="cio-code">
            <p>特定於 CIO 的選項由 
                <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
                    CIOApplicationEngine.Configuration
                </a>
                類別公開。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.cio.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(CIO, configure = {&#10;                            connectionIdleTimeoutSeconds = 45&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Tomcat" id="tomcat-code">
            <p>如果您使用 Tomcat 作為引擎，可以使用 
                <a href="https://api.ktor.io/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
                    configureTomcat
                </a>
                屬性進行配置，該屬性提供了對 
                <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
                執行個體的存取。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.tomcat.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Tomcat, configure = {&#10;                            configureTomcat = { // this: Tomcat -&amp;gt;&#10;                                // ...&#10;                            }&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
    </snippet>
</chapter>
<chapter title="自訂環境" id="embedded-custom">
    <p>
        下方的範例顯示如何使用 
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
            ApplicationEngine.Configuration
        </a>
        類別代表的自訂配置，執行具有多個連接器端點的伺服器。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main() {&#10;    val appProperties = serverConfig {&#10;        module { module() }&#10;    }&#10;    embeddedServer(Netty, appProperties) {&#10;        envConfig()&#10;    }.start(true)&#10;}&#10;&#10;fun ApplicationEngine.Configuration.envConfig() {&#10;    connector {&#10;        host = &quot;0.0.0.0&quot;&#10;        port = 8080&#10;    }&#10;    connector {&#10;        host = &quot;127.0.0.1&quot;&#10;        port = 9090&#10;    }&#10;}"/>
    <p>
        如需完整範例，請參閱 
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-multiple-connectors">
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
<chapter id="command-line" title="命令列配置">
    <p>
        Ktor 允許您使用命令列引數動態地配置 <code>embeddedServer</code>。這在需要在執行階段指定 port、主機或逾時等配置的情況下特別有用。
    </p>
    <p>
        為此，請使用 
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html">
            CommandLineConfig
        </a>
        類別將命令列引數解析為配置物件，並將其傳遞至配置區塊中：
    </p>
    <code-block lang="kotlin" code="fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        在此範例中，來自 <code>Application.Configuration</code> 的 
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/take-from.html">
            <code>takeFrom()</code>
        </a>
        函式用於覆蓋引擎配置值，例如 <code>port</code> 和 <code>host</code>。
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/load-common-configuration.html">
            <code>loadCommonConfiguration()</code>
        </a>
        函式則從根環境載入配置，例如逾時。
    </p>
    <p>
        要執行伺服器，請按以下方式指定引數：
    </p>
    <code-block lang="shell" code="            ./gradlew run --args=&quot;-port=8080&quot;"/>
    <tip>
        對於靜態配置，您可以使用設定檔或環境變數。
        若要了解更多，請參閱 
        <a href="#command-line">
            檔案中的配置
        </a>
        。
    </tip>
</chapter>
</topic>