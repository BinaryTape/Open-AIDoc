<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="创建服务器"
       id="server-create-and-configure" help-id="start_server;create_server">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <b>代码示例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server">embedded-server</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main">engine-main</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>
    </p>
</tldr>
<link-summary>
    了解如何根据应用程序的部署需求创建服务器。
</link-summary>
<p>
    在创建 Ktor 应用程序之前，您需要考虑应用程序将如何
    <Links href="/ktor/server-deployment" summary="代码示例：%example_name%">
        部署
    </Links>
    :
</p>
<list>
    <li>
        <p>
            作为
            <control><a href="#embedded">独立包</a></control>
        </p>
        <p>
            在这种情况下，用于处理网络请求的应用程序<Links href="/ktor/server-engines" summary="了解用于处理网络请求的引擎。">引擎</Links>应作为应用程序的一部分。
            您的应用程序可以控制引擎设置、连接和 SSL 选项。
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
            在这种情况下，Ktor 应用程序可以部署在 servlet 容器（例如 Tomcat 或 Jetty）中，
            该容器控制应用程序生命周期和连接设置。
        </p>
    </li>
</list>
<chapter title="独立包" id="embedded">
    <p>
        要将 Ktor 服务器应用程序作为独立包交付，您首先需要创建一个服务器。
        服务器配置可以包括不同的设置：服务器<Links href="/ktor/server-engines" summary="了解用于处理网络请求的引擎。">引擎</Links>（例如 Netty、Jetty 等）、
        各种引擎特有的选项、主机和端口值等等。
        Ktor 中有两种主要方法用于创建和运行服务器：
    </p>
    <list>
        <li>
            <p>
                <code>embeddedServer</code> 函数是一种
                <a href="#embedded-server">
                    在代码中配置服务器参数
                </a>
                并快速运行应用程序的简单方法。
            </p>
        </li>
        <li>
            <p>
                <code>EngineMain</code> 提供了更大的灵活性来配置服务器。您可以
                <a href="#engine-main">
                    在文件中指定服务器参数
                </a>
                ，并且无需
                重新编译应用程序即可更改配置。此外，您可以通过命令行运行应用程序，并通过
                传递相应的命令行实参来覆盖所需的服务器参数。
            </p>
        </li>
    </list>
    <chapter title="代码中的配置" id="embedded-server">
        <p>
            <code>embeddedServer</code> 函数是一种在
            <Links href="/ktor/server-configuration-code" summary="了解如何在代码中配置各种服务器参数。">代码</Links>
            中配置服务器参数并快速运行应用程序的简单方法。在下面的代码片段中，它接受一个
            <Links href="/ktor/server-engines" summary="了解用于处理网络请求的引擎。">引擎</Links>
            和端口作为参数来启动服务器。在下面的示例中，我们使用
            <code>Netty</code> 引擎运行服务器并监听 <code>8080</code> 端口：
        </p>
        <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    if (args.isEmpty()) {&#10;        println(&quot;Running basic server...&quot;)&#10;        println(&quot;Provide the 'configured' argument to run a configured server.&quot;)&#10;        runBasicServer()&#10;    }&#10;&#10;    when (args[0]) {&#10;        &quot;basic&quot; -&gt; runBasicServer()&#10;        &quot;configured&quot; -&gt; runConfiguredServer()&#10;        else -&gt; runServerWithCommandLineConfig(args)&#10;    }&#10;}&#10;&#10;fun runBasicServer() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runConfiguredServer() {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runServerWithCommandLineConfig(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            完整示例请参见
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server">
                embedded-server
            </a>
            。
        </p>
    </chapter>
    <chapter title="文件中的配置" id="engine-main">
        <p>
            <code>EngineMain</code> 使用选定的引擎启动服务器，并加载位于 <Path>resources</Path> 目录中的外部<Links href="/ktor/server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">配置文件</Links>（<Path>application.conf</Path> 或 <Path>application.yaml</Path>）中指定的<Links href="/ktor/server-modules" summary="模块允许您通过分组路由来组织应用程序。">应用程序模块</Links>。
            除了要加载的模块外，配置文件还可以包括各种服务器参数（例如，下面示例中的 <code>8080</code> 端口）。
        </p>
        <tabs>
            <tab title="Application.kt" id="application-kt">
                <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
            </tab>
            <tab title="application.conf" id="application-conf">
                <code-block code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" id="application-yaml">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
            </tab>
        </tabs>
        <p>
            完整示例请参见
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main">
                engine-main
            </a>
            和
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-yaml">
                engine-main-yaml
            </a>
            。
        </p>
    </chapter>
</chapter>
<chapter title="Servlet" id="servlet">
    <p>
        Ktor 应用程序可以在包含 Tomcat 和 Jetty 的 servlet 容器中运行和部署。
        要在 servlet 容器中部署，您需要生成一个
        <Links href="/ktor/server-war" summary="了解如何使用 WAR 归档在 servlet 容器中运行和部署 Ktor 应用程序。">WAR</Links>
        归档，然后将其部署到支持 WAR 的服务器或云服务上。
    </p>
</chapter>