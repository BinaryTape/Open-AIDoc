<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="建立伺服器"
       id="server-create-and-configure" help-id="start_server;create_server">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server">embedded-server</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main">engine-main</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>
    </p>
</tldr>
<link-summary>
    瞭解如何根據您的應用程式部署需求建立伺服器。
</link-summary>
<p>
    在建立 Ktor 應用程式之前，您需要考量您的應用程式將如何
    <Links href="/ktor/server-deployment" summary="Code example: %example_name%">
        部署
    </Links>
    ：
</p>
<list>
    <li>
        <p>
            作為
            <control><a href="#embedded">獨立套件</a></control>
        </p>
        <p>
            在此情況下，用於處理網路請求的應用程式<Links href="/ktor/server-engines" summary="Learn about engines that process network requests.">引擎</Links>應該是您應用程式的一部分。
            您的應用程式可控制引擎設定、連線和 SSL 選項。
        </p>
    </li>
    <li>
        <p>
            作為
            <control>
                <a href="#servlet">Servlet</a>
            </control>
        </p>
        <p>
            在此情況下，Ktor 應用程式可以部署在 Servlet 容器中（例如 Tomcat 或 Jetty），
            該容器控制應用程式生命週期和連線設定。
        </p>
    </li>
</list>
<chapter title="獨立套件" id="embedded">
    <p>
        若要將 Ktor 伺服器應用程式作為獨立套件交付，您需要先建立一個伺服器。
        伺服器配置可包含不同的設定：一個伺服器<Links href="/ktor/server-engines" summary="Learn about engines that process network requests.">引擎</Links>（例如 Netty、Jetty 等）、
        各種引擎特定選項、主機和埠值等。
        Ktor 中有兩種主要方法用於建立和執行伺服器：
    </p>
    <list>
        <li>
            <p>
                <code>embeddedServer</code> 函數是一種簡單的方式，可以在
                <a href="#embedded-server">
                    程式碼中配置伺服器參數
                </a>
                並快速執行應用程式。
            </p>
        </li>
        <li>
            <p>
                <code>EngineMain</code> 為配置伺服器提供了更大的靈活性。您可以
                <a href="#engine-main">
                    在檔案中指定伺服器參數
                </a>
                ，並在不重新編譯應用程式的情況下更改配置。此外，您可以從命令列執行應用程式，並透過傳遞相應的命令列引數來覆寫所需的伺服器參數。
            </p>
        </li>
    </list>
    <chapter title="在程式碼中配置" id="embedded-server">
        <p>
            <code>embeddedServer</code> 函數是一種簡單的方式，可以在
            <Links href="/ktor/server-configuration-code" summary="Learn how to configure various server parameters in code.">程式碼</Links>
            中配置伺服器參數並快速執行應用程式。在下面的程式碼片段中，它接受一個
            <Links href="/ktor/server-engines" summary="Learn about engines that process network requests.">引擎</Links>
            和埠作為參數來啟動伺服器。在下面的範例中，我們使用
            <code>Netty</code> 引擎運行伺服器並監聽 <code>8080</code> 埠：
        </p>
        <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    if (args.isEmpty()) {&#10;        println(&quot;Running basic server...&quot;)&#10;        println(&quot;Provide the 'configured' argument to run a configured server.&quot;)&#10;        runBasicServer()&#10;    }&#10;&#10;    when (args[0]) {&#10;        &quot;basic&quot; -&gt; runBasicServer()&#10;        &quot;configured&quot; -&gt; runConfiguredServer()&#10;        else -&gt; runServerWithCommandLineConfig(args)&#10;    }&#10;}&#10;&#10;fun runBasicServer() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runConfiguredServer() {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runServerWithCommandLineConfig(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            有關完整範例，請參閱
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server">
                embedded-server
            </a>
            。
        </p>
    </chapter>
    <chapter title="在檔案中配置" id="engine-main">
        <p>
            <code>EngineMain</code> 使用選定的引擎啟動伺服器，並載入外部<Links href="/ktor/server-configuration-file" summary="Learn how to configure various server parameters in a configuration file.">配置檔案</Links>中指定的應用程式<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模組</Links>，
            該檔案位於
            <Path>resources</Path>
            目錄中：
            <Path>application.conf</Path>
            或
            <Path>application.yaml</Path>
            。
            除了要載入的模組之外，配置檔案還可以包含各種伺服器參數（例如下面範例中的 <code>8080</code> 埠）。
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
            有關完整範例，請參閱
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
        Ktor 應用程式可以在包含 Tomcat 和 Jetty 的 Servlet 容器中運行和部署。
        若要部署到 Servlet 容器中，您需要產生一個
        <Links href="/ktor/server-war" summary="Learn how to run and deploy a Ktor application inside a servlet container using a WAR archive.">WAR</Links>
        歸檔檔，然後將其部署到支援 WAR 檔的伺服器或雲服務上。
    </p>
</chapter>
</topic>