<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="代码中的配置"
   id="server-configuration-code" help-id="Configuration-code;server-configuration-in-code">
<show-structure for="chapter"/>
<link-summary>
    了解如何在代码中配置各种服务器参数。
</link-summary>
<p>
    Ktor 允许你直接在代码中配置各种服务器形参，包括主机地址、端口、<Links href="/ktor/server-modules" summary="模块允许你通过路由分组来组织应用程序。">服务器模块</Links>等。配置方法取决于你设置服务器的方式——是使用 <Links href="/ktor/server-create-and-configure" summary="了解如何根据应用程序部署需求创建服务器。">embeddedServer 还是 EngineMain</Links>。
</p>
<p>
    使用 <code>embeddedServer</code> 时，你可以通过将所需的形参直接传递给该函数来配置服务器。
    <code><a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/embedded-server.html">
        embeddedServer
    </a></code> 函数接受不同的形参来配置服务器，包括一个 <Links href="/ktor/server-engines" summary="了解处理网络请求的引擎。">服务器引擎</Links>、服务器监听的主机和端口，以及其他配置。
</p>
<p>
    在本节中，我们将介绍运行 <code>embeddedServer</code> 的几个不同示例，展示如何配置服务器以满足你的需求。
</p>
<chapter title="基本配置" id="embedded-basic">
    <p>
        下面的代码片段展示了一个使用 Netty 引擎和 <code>8080</code> 端口的基本服务器设置。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        请注意，你可以将 <code>port</code> 形参设置为 <code>0</code>，以便在随机端口上运行服务器。
        <code>embeddedServer</code> 函数会返回一个引擎实例，因此你可以在代码中使用
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/resolved-connectors.html">
            ApplicationEngine.resolvedConnectors
        </a>
        函数获取端口值。
    </p>
</chapter>
<chapter title="引擎配置" id="embedded-engine">
    <snippet id="embedded-engine-configuration">
        <p>
            <code>embeddedServer</code> 函数允许你使用 <code>configure</code> 形参传递引擎特有的选项。此形参包含所有引擎共有的选项，并由
            <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
                ApplicationEngine.Configuration
            </a>
            类公开。
        </p>
        <p>
            以下示例展示了如何使用 <code>Netty</code> 引擎配置服务器。在 <code>configure</code> 代码块中，我们定义了一个 <code>connector</code> 来指定主机和端口，并自定义各种服务器形参：
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            <code>connectors.add()</code> 方法定义了一个连接器，其中包含指定的主机（<code>127.0.0.1</code>）
            和端口（<code>8080</code>）。
        </p>
        <p>除了这些选项，你还可以配置其他引擎特有的属性。</p>
        <chapter title="Netty" id="netty-code">
            <p>
                Netty 特有的选项由
                <a href="https://api.ktor.io/ktor-server/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
                    NettyApplicationEngine.Configuration
                </a>
                类公开。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, configure = {&#10;                            requestQueueLimit = 16&#10;                            shareWorkGroup = false&#10;                            configureBootstrap = {&#10;                                // ...&#10;                            }&#10;                            responseWriteTimeoutSeconds = 10&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Jetty" id="jetty-code">
            <p>
                Jetty 特有的选项由
                <a href="https://api.ktor.io/ktor-server/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
                    JettyApplicationEngineBase.Configuration
                </a>
                类公开。
            </p>
            <p>你可以在
                <a href="https://api.ktor.io/ktor-server/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
                    configureServer
                </a>
                代码块内配置 Jetty 服务器，该代码块提供对
                <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
                实例的访问。
            </p>
            <p>
                使用 <code>idleTimeout</code> 属性指定连接在关闭前可以空闲的时长。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.jetty.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Jetty, configure = {&#10;                            configureServer = { // this: Server -&amp;gt;&#10;                                // ...&#10;                            }&#10;                            idleTimeout = 30.seconds&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="CIO" id="cio-code">
            <p>CIO 特有的选项由
                <a href="https://api.ktor.io/ktor-server/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
                    CIOApplicationEngine.Configuration
                </a>
                类公开。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.cio.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(CIO, configure = {&#10;                            connectionIdleTimeoutSeconds = 45&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Tomcat" id="tomcat-code">
            <p>如果你使用 Tomcat 作为引擎，则可以使用
                <a href="https://api.ktor.io/ktor-server/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
                    configureTomcat
                </a>
                属性配置它，该属性提供对
                <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
                实例的访问。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.tomcat.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Tomcat, configure = {&#10;                            configureTomcat = { // this: Tomcat -&amp;gt;&#10;                                // ...&#10;                            }&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
    </snippet>
</chapter>
<chapter title="自定义环境" id="embedded-custom">
    <p>
        以下示例展示了如何使用由
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
            ApplicationEngine.Configuration
        </a>
        类表示的自定义配置来运行具有多个连接器端点的服务器。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main() {&#10;    val appProperties = serverConfig {&#10;        module { module() }&#10;    }&#10;    embeddedServer(Netty, appProperties) {&#10;        envConfig()&#10;    }.start(true)&#10;}&#10;&#10;fun ApplicationEngine.Configuration.envConfig() {&#10;    connector {&#10;        host = &quot;0.0.0.0&quot;&#10;        port = 8080&#10;    }&#10;    connector {&#10;        host = &quot;127.0.0.1&quot;&#10;        port = 9090&#10;    }&#10;}"/>
    <p>
        有关完整示例，请参见
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server-multiple-connectors">
            embedded-server-multiple-connectors
        </a>。
    </p>
    <tip>
        <p>
            你还可以使用自定义环境来
            <a href="#embedded-server">
                提供 HTTPS 服务
            </a>。
        </p>
    </tip>
</chapter>
<chapter id="command-line" title="命令行配置">
    <p>
        Ktor 允许你使用命令行实参动态配置 <code>embeddedServer</code>。这
        在需要运行时指定端口、主机或超时等配置的情况下特别有用。
    </p>
    <p>
        为此，请使用
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-command-line-config.html">
            CommandLineConfig
        </a>
        类将命令行实参解析为配置对象，并在配置代码块中传递它：
    </p>
    <code-block lang="kotlin" code="fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        在此示例中，<code>Application.Configuration</code> 中的
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/take-from.html">
            <code>takeFrom()</code>
        </a>
        函数用于覆盖引擎配置值，例如 <code>port</code> 和 <code>host</code>。
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.engine/load-common-configuration.html">
            <code>loadCommonConfiguration()</code>
        </a>
        函数从根环境（例如超时）加载配置。
    </p>
    <p>
        要运行服务器，请按以下方式指定实参：
    </p>
    <code-block lang="shell" code="            ./gradlew run --args=&quot;-port=8080&quot;"/>
    <tip>
        对于静态配置，你可以使用配置文件或环境变量。
        要了解更多信息，请参见
        <a href="#command-line">
            文件中的配置
        </a>
        。
    </tip>
</chapter>
</topic>