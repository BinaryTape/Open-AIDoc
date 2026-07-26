<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="サーバーの作成"
   id="server-create-and-configure" help-id="start_server;create_server">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-yaml">engine-main-yaml</a>
    </p>
</tldr>
<link-summary>
    アプリケーションのデプロイのニーズに応じてサーバーを作成する方法を学びます。
</link-summary>
<p>
    Ktorアプリケーションを作成する前に、アプリケーションをどのように
    <Links href="//server-deployment" summary="">
        デプロイ
    </Links>
    するかを考慮する必要があります。
</p>
<list>
    <li>
        <p>
            <control><a href="#embedded">自己完結型パッケージ</a></control>として
        </p>
        <p>
            この場合、ネットワークリクエストを処理するために使用されるアプリケーション<Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>をアプリケーションの一部にする必要があります。
            アプリケーションはエンジンの設定、接続、およびSSLオプションを制御できます。
        </p>
    </li>
    <li>
        <p>
            <control>
                <a href="#servlet">サーブレット</a>
            </control>として
        </p>
        <p>
            この場合、Ktorアプリケーションはサーブレットコンテナ（TomcatやJettyなど）内にデプロイできます。サーブレットコンテナがアプリケーションのライフサイクルと接続設定を制御します。
        </p>
    </li>
</list>
<chapter title="自己完結型パッケージ" id="embedded">
    <p>
        Ktorサーバーアプリケーションを自己完結型パッケージとして提供するには、まずサーバーを作成する必要があります。
        サーバーの設定には、サーバー<Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>（Netty、Jettyなど）、さまざまなエンジン固有のオプション、ホストとポートの値など、さまざまな設定を含めることができます。
        Ktorでサーバーを作成して実行するには、主に2つのアプローチがあります。
    </p>
    <list>
        <li>
            <p>
                <code>embeddedServer</code>関数は、
                <a href="#embedded-server">
                    コード内でサーバーパラメータを設定
                </a>
                し、アプリケーションを素早く実行するためのシンプルな方法です。
            </p>
        </li>
        <li>
            <p>
                <code>EngineMain</code>は、サーバーを設定するためのより高い柔軟性を提供します。
                <a href="#engine-main">
                    ファイル内でサーバーパラメータを指定
                </a>
                できるため、アプリケーションを再コンパイルせずに設定を変更できます。さらに、コマンドラインからアプリケーションを実行し、対応するコマンドライン引数を渡すことで必要なサーバーパラメータを上書きすることも可能です。
            </p>
        </li>
    </list>
    <chapter title="コード内での設定" id="embedded-server">
        <p>
            <code>embeddedServer</code>関数は、
            <Links href="//server-configuration-code" summary="コード内でさまざまなサーバーパラメータを設定する方法を学びます。">コード内</Links>
            でサーバーパラメータを設定し、アプリケーションを素早く実行するためのシンプルな方法です。以下のコードスニペットでは、サーバーを起動するためのパラメータとして
            <Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>
            とポートを受け取ります。以下の例では、<code>Netty</code>エンジンを使用してサーバーを実行し、<code>8080</code>ポートでリスンします。
        </p>
        <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    if (args.isEmpty()) {&#10;        println(&quot;Running basic server...&quot;)&#10;        println(&quot;Provide the 'configured' argument to run a configured server.&quot;)&#10;        runBasicServer()&#10;    }&#10;&#10;    when (args[0]) {&#10;        &quot;basic&quot; -&gt; runBasicServer()&#10;        &quot;configured&quot; -&gt; runConfiguredServer()&#10;        else -&gt; runServerWithCommandLineConfig(args)&#10;    }&#10;}&#10;&#10;fun runBasicServer() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runConfiguredServer() {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}&#10;&#10;fun runServerWithCommandLineConfig(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            完全な例については、
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">
                embedded-server
            </a>
            を参照してください。
        </p>
    </chapter>
    <chapter title="ファイル内での設定" id="engine-main">
        <p>
            <code>EngineMain</code>は、選択したエンジンでサーバーを起動し、外部の<Links href="//server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">設定ファイル</Links>（通常は<Path>resource</Path>ディレクトリにある<Path>application.conf</Path>または<Path>application.yaml</Path>）から<Links href="//server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">アプリケーションモジュール</Links>を読み込みます。
        </p>
        <p>
            どのモジュールを読み込むかの指定に加えて、設定ファイルにはポート、ホスト、SSL設定などのさまざまなサーバーパラメータを含めることができます。例えば、以下の設定ではサーバーポートを<code>8080</code>に設定しています。
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
            <code>EngineMain.main()</code>でサーバーを即座に起動する代わりに、<code>EngineMain.createServer()</code>を使用して手動でサーバーインスタンスを作成することもできます。詳細については、<a href="#createServer"></a>を参照してください。
        </note>
        <p>
            完全な例については、
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">
                engine-main
            </a>
            および
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-yaml">
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
        <Links href="//server-war" summary="WARアーカイブを使用してサーブレットコンテナ内でKtorアプリケーションを実行およびデプロイする方法を学びます。">WAR</Links>
        アーカイブを生成し、それをサーバーまたはWARをサポートするクラウドサービスにデプロイする必要があります。
    </p>
</chapter>
</topic>