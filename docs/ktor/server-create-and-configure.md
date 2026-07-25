<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="创建服务器"
       id="server-create-and-configure" help-id="start_server;create_server">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a>、
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>、
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>
        </p>
    </tldr>
    <link-summary>
        了解如何根据应用部署需求创建服务器。
    </link-summary>
    <p>
        在创建 Ktor 应用之前，您需要考虑应用将如何<Links href="//server-deployment" summary="">部署</Links>：
    </p>
    <list>
        <li>
            <p>
                作为<control><a href="#embedded">自包含包</a></control>
            </p>
            <p>
                在此情况下，用于处理网络请求的应用<Links href="//server-engines" summary="了解处理网络请求的引擎。">引擎</Links>应该是应用的一部分。您的应用可以控制引擎设置、连接和 SSL 选项。
            </p>
        </li>
        <li>
            <p>
                作为
                <control>
                    <a href="#servlet">servlet</a>
                </control>
            </p>
            <p>
                在此情况下，Ktor 应用可以部署在 servlet 容器（如 Tomcat 或 Jetty）中，容器负责控制应用的生命周期和连接设置。
            </p>
        </li>
    </list>
    <chapter title="自包含包" id="embedded">
        <p>
            要将 Ktor 服务器应用作为自包含包交付，您首先需要创建一个服务器。服务器配置可以包含不同的设置：服务器<Links href="//server-engines" summary="了解处理网络请求的引擎。">引擎</Links>（如 Netty、Jetty 等）、各种特定于引擎的选项、主机和端口值等。在 Ktor 中，创建和运行服务器有两种主要方法：
        </p>
        <list>
            <li>
                <p>
                    <code>embeddedServer</code>函数是在<a href="#embedded-server">代码中配置服务器参数</a>并快速运行应用的简单方法。
                </p>
            </li>
            <li>
                <p>
                    <code>EngineMain</code>提供了更灵活的服务器配置方式。您可以在<a href="#engine-main">文件中指定服务器参数</a>，并在无需重新编译应用的情况下更改配置。此外，您可以从命令行运行应用，并通过传递相应的命令行实参来覆盖所需的服务器参数。
                </p>
            </li>
        </list>
        <chapter title="在代码中配置" id="embedded-server">
            <p>
                <code>embeddedServer</code>函数是在<Links href="//server-configuration-code" summary="了解如何在代码中配置各种服务器参数。">代码</Links>中配置服务器参数并快速运行应用的简单方法。在下面的代码片段中，它接受<code>引擎</code>和端口作为形参来启动服务器。在以下示例中，我们使用<code>Netty</code>引擎运行服务器并侦听<code>8080</code>端口：
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    if (args.isEmpty()) {&#10;        println(&quot;Running basic server...&quot;)&#10;        println(&quot;Provide the 'configured' argument to run a configured server.&quot;)&#10;        runBasicServer()&#10;    }&#10;&#10;    when (args[0]) {&#10;        &quot;basic&quot; -&gt; runBasicServer()&#10;        &quot;configured&quot; -&gt; runConfiguredServer()&#10;        else -&gt; runServerWithCommandLineConfig(args)&#10;    }&#10;}&#10;&#10;fun runBasicServer() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runConfiguredServer() {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runServerWithCommandLineConfig(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
            <p>
                有关完整示例，请参阅<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a>。
            </p>
        </chapter>
        <chapter title="在文件中配置" id="engine-main">
            <p>
                <code>EngineMain</code>启动带有选定引擎的服务器，并从外部<Links href="//server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">配置文件</Links>（通常是位于<code>resource</code>目录中的<Path>application.conf</Path>或<Path>application.yaml</Path>）中加载<Links href="//server-modules" summary="模块允许您通过对路由进行分组来构建应用结构。">应用模块</Links>。
            </p>
            <p>
                除了指定要加载的模块外，配置文件还可以包含各种服务器参数，例如端口、主机和 SSL 设置。例如，下面的配置将服务器端口设置为<code>8080</code>。
            </p>
            <Tabs>
                <TabItem title="Application.kt" id="application-kt">
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
                </TabItem>
                <TabItem title="application.conf" id="application-conf">
                    <code-block code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
                </TabItem>
                <TabItem title="application.yaml" id="application-yaml">
                    <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
                </TabItem>
            </Tabs>
            <note>
                除了直接使用<code>EngineMain.main()</code>启动服务器外，您还可以使用<code>EngineMain.createServer()</code>手动创建服务器实例。要了解更多信息，请参阅<a href="#createServer"></a>。
            </note>
            <p>
                有关完整示例，请参阅<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>和<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>。
            </p>
        </chapter>
    </chapter>
    <chapter title="Servlet" id="servlet">
        <p>
            Ktor 应用可以在包含 Tomcat 和 Jetty 在内的 servlet 容器中运行和部署。要部署在 servlet 容器中，您需要生成<Links href="//server-war" summary="了解如何使用 WAR 归档文件在 servlet 容器中运行和部署 Ktor 应用。">WAR</Links>归档文件，然后将其部署到支持 WAR 的服务器或云服务中。
        </p>
    </chapter>
</topic>