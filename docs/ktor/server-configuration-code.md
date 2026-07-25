<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="代码内配置"
       id="server-configuration-code" help-id="Configuration-code;server-configuration-in-code">
<show-structure for="chapter"/>
<link-summary>
    了解如何在代码中配置各种服务器参数。
</link-summary>
<p>
    Ktor 允许您直接在代码中配置各种服务器参数，包括主机地址、端口、<Links href="//server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">服务器模块</Links>等。配置方法取决于您设置服务器的方式 —— 使用 <Links href="//server-create-and-configure" summary="了解如何根据您的应用程序部署需求创建服务器。">embeddedServer 或 EngineMain</Links>。
</p>
<p>
    使用 <code>embeddedServer</code> 时，您可以通过将所需参数直接传递给该函数来配置服务器。
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html">
        embeddedServer
    </a>
    函数接受用于配置服务器的不同形参，包括<Links href="//server-engines" summary="了解处理网络请求的引擎。">服务器引擎</Links>、服务器侦听的主机和端口以及其他配置。
</p>
<p>
    在本节中，我们将查看几个运行 <code>embeddedServer</code> 的不同示例，说明如何根据您的需要配置服务器。
</p>
<chapter title="基础配置" id="embedded-basic">
    <p>
        下面的代码段展示了使用 Netty 引擎和 <code>8080</code> 端口的基础服务器设置。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        请注意，您可以将 <code>port</code> 形参设置为 <code>0</code> 以在随机端口上运行服务器。
        <code>embeddedServer</code> 函数会返回一个引擎实例，因此您可以在代码中使用
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/resolved-connectors.html">
            ApplicationEngine.resolvedConnectors
        </a>
        函数获取端口值。
    </p>
</chapter>
<chapter title="引擎配置" id="embedded-engine">
    <snippet id="embedded-engine-configuration">
        <p>
            <code>embeddedServer</code> 函数允许您使用 <code>configure</code> 形参传递引擎特定的选项。该形参包含所有引擎通用的选项，由
            <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
                ApplicationEngine.Configuration
            </a>
            类提供。
        </p>
        <p>
            下面的示例展示了如何使用 <code>Netty</code> 引擎配置服务器。在 <code>configure</code> 块中，我们定义了一个 <code>connector</code>（连接器）来指定主机和端口，并自定义了各种服务器参数：
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            <code>connectors.add()</code> 方法使用指定的主机 (<code>127.0.0.1</code>) 和端口 (<code>8080</code>) 定义了一个连接器。
        </p>
        <p>除了这些选项之外，您还可以配置其他特定于引擎的属性。</p>
        <chapter title="Netty" id="netty-code">
            <p>
                Netty 特定的选项由
                <a href="https://api.ktor.io/ktor-server-netty/io.ktor.server.netty/-netty-application-engine/-configuration/index.html">
                    NettyApplicationEngine.Configuration
                </a>
                类提供。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, configure = {&#10;                            requestQueueLimit = 16&#10;                            shareWorkGroup = false&#10;                            configureBootstrap = {&#10;                                // ...&#10;                            }&#10;                            responseWriteTimeoutSeconds = 10&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Jetty" id="jetty-code">
            <p>
                Jetty 特定的选项由
                <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/index.html">
                    JettyApplicationEngineBase.Configuration
                </a>
                类提供。
            </p>
            <p>您可以在
                <a href="https://api.ktor.io/ktor-server-jetty-jakarta/io.ktor.server.jetty.jakarta/-jetty-application-engine-base/-configuration/configure-server.html">
                    configureServer
                </a>
                块中配置 Jetty 服务器，该块提供了对
                <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
                实例的访问。
            </p>
            <p>
                使用 <code>idleTimeout</code> 属性来指定连接在关闭之前可以空闲的时间长度。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.jetty.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Jetty, configure = {&#10;                            configureServer = { // this: Server -&amp;gt;&#10;                                // ...&#10;                            }&#10;                            idleTimeout = 30.seconds&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="CIO" id="cio-code">
            <p>CIO 特定的选项由
                <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
                    CIOApplicationEngine.Configuration
                </a>
                类提供。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.cio.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(CIO, configure = {&#10;                            connectionIdleTimeoutSeconds = 45&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Tomcat" id="tomcat-code">
            <p>如果您使用 Tomcat 作为引擎，您可以使用
                <a href="https://api.ktor.io/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
                    configureTomcat
                </a>
                属性进行配置，该属性提供了对
                <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
                实例的访问。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.tomcat.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Tomcat, configure = {&#10;                            configureTomcat = { // this: Tomcat -&amp;gt;&#10;                                // ...&#10;                            }&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
    </snippet>
</chapter>
<chapter title="自定义环境" id="embedded-custom">
    <p>
        下面的示例展示了如何使用由
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
            ApplicationEngine.Configuration
        </a>
        类表示的自定义配置运行带有多个连接器端点的服务器。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main() {&#10;    val appProperties = serverConfig {&#10;        module { module() }&#10;    }&#10;    embeddedServer(Netty, appProperties) {&#10;        envConfig()&#10;    }.start(true)&#10;}&#10;&#10;fun ApplicationEngine.Configuration.envConfig() {&#10;    connector {&#10;        host = &quot;0.0.0.0&quot;&#10;        port = 8080&#10;    }&#10;    connector {&#10;        host = &quot;127.0.0.1&quot;&#10;        port = 9090&#10;    }&#10;}"/>
    <p>
        有关完整示例，请参阅
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-multiple-connectors">
            embedded-server-multiple-connectors
        </a>。
    </p>
    <tip>
        <p>
            您还可以使用自定义环境来
            <a href="#embedded-server">
                提供 HTTPS 服务
            </a>。
        </p>
    </tip>
</chapter>
<chapter id="command-line" title="命令行配置">
    <p>
        Ktor 允许您使用命令行实参动态配置 <code>embeddedServer</code>。在需要在运行时指定端口、主机或超时等配置的情况下，这特别有用。
    </p>
    <p>
        为了实现这一点，请使用
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html">
            CommandLineConfig
        </a>
        类将命令行实参解析为配置对象，并将其在配置块中传递：
    </p>
    <code-block lang="kotlin" code="fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        在此示例中，来自 <code>Application.Configuration</code> 的
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/take-from.html">
            <code>takeFrom()</code>
        </a>
        函数被用于替代引擎配置值，例如 <code>port</code> 和 <code>host</code>。
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/load-common-configuration.html">
            <code>loadCommonConfiguration()</code>
        </a>
        函数从根环境加载配置，例如超时设置。
    </p>
    <p>
        要运行服务器，请按以下方式指定实参：
    </p>
    <code-block lang="shell" code="            ./gradlew run --args=&quot;-port=8080&quot;"/>
    <tip>
        对于静态配置，您可以使用配置文件或环境变量。
        要了解更多信息，请参阅
        <a href="#command-line">
            文件中的配置
        </a>。
    </tip>
</chapter>
</topic>