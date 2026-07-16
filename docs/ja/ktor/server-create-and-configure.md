<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="サーバーの作成"
   id="server-create-and-configure" help-id="start_server;create_server">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server">embedded-server</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main">engine-main</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>
    </p>
</tldr>
<link-summary>
    アプリケーションのデプロイ要件に応じてサーバーを作成する方法を学びます。
</link-summary>
<p>
    Ktorアプリケーションを作成する前に、アプリケーションがどのように
    <Links href="/ktor/server-deployment" summary="コード例: %example_name%">
        デプロイされる
    </Links>
    かを考慮する必要があります。
</p>
<list>
    <li>
        <p>
            <control><a href="#embedded">自己完結型パッケージ</a></control>として
        </p>
        <p>
            この場合、ネットワークリクエストを処理するために使用されるアプリケーション<Links href="/ktor/server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>は、アプリケーションの一部である必要があります。
            アプリケーションは、エンジン設定、接続、およびSSLオプションを制御できます。
        </p>
    </li>
    <li>
        <p>
            <control>
                <a href="#servlet">サーブレット</a>
            </control>として
        </p>
        <p>
            この場合、Ktorアプリケーションは、アプリケーションのライフサイクルと接続設定を制御するサーブレットコンテナ（TomcatやJettyなど）内にデプロイできます。
        </p>
    </li>
</list>
<chapter title="自己完結型パッケージ" id="embedded">
    <p>
        Ktorサーバーアプリケーションを自己完結型パッケージとして提供するには、まずサーバーを作成する必要があります。
        サーバー設定には、さまざまな設定が含まれる場合があります。
        サーバー<Links href="/ktor/server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>（Netty、Jettyなど）、
        さまざまなエンジン固有のオプション、ホストとポートの値などです。
        Ktorでサーバーを作成および実行するには、主に2つのアプローチがあります。
    </p>
    <list>
        <li>
            <p>
                <code>embeddedServer</code>関数は、
                <a href="#embedded-server">
                    コードでサーバーパラメータを設定する
                </a>
                簡単な方法であり、アプリケーションを迅速に実行できます。
            </p>
        </li>
        <li>
            <p>
                <code>EngineMain</code>は、サーバーを構成するためのより高い柔軟性を提供します。アプリケーションを
                再コンパイルせずに、<a href="#engine-main">
                    ファイルでサーバーパラメータを指定する
                </a>ことができ、設定を変更できます。さらに、コマンドラインからアプリケーションを実行し、
                対応するコマンドライン引数を渡すことで、必要なサーバーパラメータをオーバーライドできます。
            </p>
        </li>
    </list>
    <chapter title="コードでの設定" id="embedded-server">
        <p>
            <code>embeddedServer</code>関数は、
            <Links href="/ktor/server-configuration-code" summary="コードでさまざまなサーバーパラメータを設定する方法を学びます。">コード</Links>でサーバーパラメータを設定し、アプリケーションを迅速に実行する簡単な方法です。以下のコードスニペットでは、サーバーを起動するためのパラメータとして
            <Links href="/ktor/server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>とポートを受け取ります。以下の例では、
            <code>Netty</code>エンジンでサーバーを実行し、<code>8080</code>ポートでリッスンします。
        </p>
        <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    if (args.isEmpty()) {&#10;        println(&quot;Running basic server...&quot;)&#10;        println(&quot;Provide the 'configured' argument to run a configured server.&quot;)&#10;        runBasicServer()&#10;    }&#10;&#10;    when (args[0]) {&#10;        &quot;basic&quot; -&gt; runBasicServer()&#10;        &quot;configured&quot; -&gt; runConfiguredServer()&#10;        else -&gt; runServerWithCommandLineConfig(args)&#10;    }&#10;}&#10;&#10;fun runBasicServer() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runConfiguredServer() {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runServerWithCommandLineConfig(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            完全な例については、
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/embedded-server">
                embedded-server
            </a>
            を参照してください。
        </p>
    </chapter>
    <chapter title="ファイルでの設定" id="engine-main">
        <p>
            <code>EngineMain</code>は、選択されたエンジンでサーバーを起動し、<Path>resources</Path>ディレクトリに配置された外部<Links href="/ktor/server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">設定ファイル</Links>（<Path>application.conf</Path>または<Path>application.yaml</Path>）で指定された<Links href="/ktor/server-modules" summary="モジュールは、ルーティングをグループ化することでアプリケーションを構造化できます。">アプリケーションモジュール</Links>をロードします。
            ロードするモジュールに加えて、設定ファイルにはさまざまなサーバーパラメータ（以下の例では
            <code>8080</code>ポート）を含めることができます。
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
            完全な例については、
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main">
                engine-main
            </a>
            および
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-yaml">
                engine-main-yaml
            </a>
            を参照してください。
        </p>
    </chapter>
</chapter>
<chapter title="サーブレット" id="servlet">
    <p>
        Ktorアプリケーションは、TomcatやJettyを含むサーブレットコンテナ内で実行およびデプロイできます。
        サーブレットコンテナ内にデプロイするには、
        <Links href="/ktor/server-war" summary="WARアーカイブを使用して、Ktorアプリケーションをサーブレットコンテナ内で実行およびデプロイする方法を学びます。">WAR</Links>
        アーカイブを生成し、それをWARをサポートするサーバーまたはクラウドサービスにデプロイする必要があります。
    </p>
</chapter>
</topic>