<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="コードによる設定"
   id="server-configuration-code" help-id="Configuration-code;server-configuration-in-code">
<show-structure for="chapter"/>
<link-summary>
    コード内でさまざまなサーバーパラメータを設定する方法を学びます。
</link-summary>
<p>
    Ktorでは、ホストアドレス、ポート、<Links href="//server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">サーバーモジュール</Links>など、さまざまなサーバーパラメータをコード内で直接設定できます。設定方法は、サーバーのセットアップ方法（<Links href="//server-create-and-configure" summary="アプリケーションのデプロイのニーズに応じてサーバーを作成する方法を学びます。">embeddedServerまたはEngineMain</Links>のどちらを使用するか）によって異なります。
</p>
<p>
    <code>embeddedServer</code>を使用する場合、必要なパラメータを関数に直接渡すことでサーバーを設定します。
    <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/embedded-server.html">
        embeddedServer
    </a>
    関数は、<Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">サーバーエンジン</Links>、サーバーがリッスンするホストとポート、および追加の設定など、サーバーを構成するためのさまざまなパラメータを受け取ります。
</p>
<p>
    このセクションでは、サーバーを効果的に設定する方法を示すために、<code>embeddedServer</code>を実行するいくつかの異なる例を見ていきます。
</p>
<chapter title="基本設定" id="embedded-basic">
    <p>
        以下のコードスニペットは、Nettyエンジンと<code>8080</code>ポートを使用した基本的なサーバーセットアップを示しています。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, port = 8080) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        <code>port</code>パラメータを<code>0</code>に設定すると、サーバーをランダムなポートで実行できることに注意してください。
        <code>embeddedServer</code>関数はエンジンインスタンスを返すため、
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/resolved-connectors.html">
            ApplicationEngine.resolvedConnectors
        </a>
        関数を使用してコード内でポート値を取得できます。
    </p>
</chapter>
<chapter title="エンジン設定" id="embedded-engine">
    <snippet id="embedded-engine-configuration">
        <p>
            <code>embeddedServer</code>関数では、<code>configure</code>パラメータを使用してエンジン固有のオプションを渡すことができます。このパラメータには、すべてのエンジンに共通で、
            <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
                ApplicationEngine.Configuration
            </a>
            クラスによって公開されているオプションが含まれます。
        </p>
        <p>
            以下の例は、<code>Netty</code>エンジンを使用してサーバーを設定する方法を示しています。
            <code>configure</code>ブロック内で、<code>connector</code>を定義してホストとポートを指定し、さまざまなサーバーパラメータをカスタマイズしています。
        </p>
        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(Netty, configure = {&#10;        connectors.add(EngineConnectorBuilder().apply {&#10;            host = &quot;127.0.0.1&quot;&#10;            port = 8080&#10;        })&#10;        connectionGroupSize = 2&#10;        workerGroupSize = 5&#10;        callGroupSize = 10&#10;        shutdownGracePeriod = 2000&#10;        shutdownTimeout = 3000&#10;    }) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
        <p>
            <code>connectors.add()</code>メソッドは、指定されたホスト（<code>127.0.0.1</code>）とポート（<code>8080</code>）でコネクタを定義します。
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
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.netty.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Netty, configure = {&#10;                            requestQueueLimit = 16&#10;                            shareWorkGroup = false&#10;                            configureBootstrap = {&#10;                                // ...&#10;                            }&#10;                            responseWriteTimeoutSeconds = 10&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
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
                ブロック内でJettyサーバーを設定できます。これにより、
                <a href="https://www.eclipse.org/jetty/javadoc/jetty-11/org/eclipse/jetty/server/Server.html">Server</a>
                インスタンスにアクセスできます。
            </p>
            <p>
                <code>idleTimeout</code>プロパティを使用して、接続が閉じられるまでにアイドル状態を維持できる期間を指定します。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.jetty.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Jetty, configure = {&#10;                            configureServer = { // this: Server -&amp;gt;&#10;                                // ...&#10;                            }&#10;                            idleTimeout = 30.seconds&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="CIO" id="cio-code">
            <p>CIO固有のオプションは、
                <a href="https://api.ktor.io/ktor-server-cio/io.ktor.server.cio/-c-i-o-application-engine/-configuration/index.html">
                    CIOApplicationEngine.Configuration
                </a>
                クラスによって公開されています。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.cio.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(CIO, configure = {&#10;                            connectionIdleTimeoutSeconds = 45&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
        <chapter title="Tomcat" id="tomcat-code">
            <p>エンジンとしてTomcatを使用する場合、
                <a href="https://api.ktor.io/ktor-server-tomcat-jakarta/io.ktor.server.tomcat.jakarta/-tomcat-application-engine/-configuration/configure-tomcat.html">
                    configureTomcat
                </a>
                プロパティを使用して設定できます。これにより、
                <a href="https://tomcat.apache.org/tomcat-10.1-doc/api/org/apache/catalina/startup/Tomcat.html">Tomcat</a>
                インスタンスにアクセスできます。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.server.engine.*&#10;                    import io.ktor.server.tomcat.jakarta.*&#10;&#10;                    fun main() {&#10;                        embeddedServer(Tomcat, configure = {&#10;                            configureTomcat = { // this: Tomcat -&amp;gt;&#10;                                // ...&#10;                            }&#10;                        }) {&#10;                            // ...&#10;                        }.start(true)&#10;                    }"/>
        </chapter>
    </snippet>
</chapter>
<chapter title="カスタム環境" id="embedded-custom">
    <p>
        以下の例は、
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/index.html">
            ApplicationEngine.Configuration
        </a>
        クラスで表されるカスタム設定を使用して、複数のコネクタエンドポイントでサーバーを実行する方法を示しています。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;&#10;fun main() {&#10;    val appProperties = serverConfig {&#10;        module { module() }&#10;    }&#10;    embeddedServer(Netty, appProperties) {&#10;        envConfig()&#10;    }.start(true)&#10;}&#10;&#10;fun ApplicationEngine.Configuration.envConfig() {&#10;    connector {&#10;        host = &quot;0.0.0.0&quot;&#10;        port = 8080&#10;    }&#10;    connector {&#10;        host = &quot;127.0.0.1&quot;&#10;        port = 9090&#10;    }&#10;}"/>
    <p>
        完全な例については、
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-multiple-connectors">
            embedded-server-multiple-connectors
        </a>を参照してください。
    </p>
    <tip>
        <p>
            カスタム環境を使用して
            <a href="#embedded-server">
                HTTPSを提供
            </a>することもできます。
        </p>
    </tip>
</chapter>
<chapter id="command-line" title="コマンドライン設定">
    <p>
        Ktorでは、コマンドライン引数を使用して<code>embeddedServer</code>を動的に設定できます。これは、ポート、ホスト、タイムアウトなどの設定を実行時に指定する必要がある場合に特に便利です。
    </p>
    <p>
        これを実現するには、
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-command-line-config.html">
            CommandLineConfig
        </a>
        クラスを使用してコマンドライン引数を設定オブジェクトにパースし、それを設定ブロック内で渡します。
    </p>
    <code-block lang="kotlin" code="fun main(args: Array&lt;String&gt;) {&#10;    embeddedServer(&#10;        factory = Netty,&#10;        configure = {&#10;            val cliConfig = CommandLineConfig(args)&#10;            takeFrom(cliConfig.engineConfig)&#10;            loadCommonConfiguration(cliConfig.rootConfig.environment.config)&#10;        }&#10;    ) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello, world!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
    <p>
        この例では、<code>Application.Configuration</code>の
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/-application-engine/-configuration/take-from.html">
            <code>takeFrom()</code>
        </a>
        関数を使用して、<code>port</code>や<code>host</code>などのエンジン設定値を上書きしています。
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.engine/load-common-configuration.html">
            <code>loadCommonConfiguration()</code>
        </a>
        関数は、タイムアウトなどのルート環境からの設定をロードします。
    </p>
    <p>
        サーバーを実行するには、次のように引数を指定します。
    </p>
    <code-block lang="shell" code="            ./gradlew run --args=&quot;-port=8080&quot;"/>
    <tip>
        静的な設定については、設定ファイルまたは環境変数を使用できます。
        詳細については、
        <a href="#command-line">
            ファイルによる設定
        </a>
        を参照してください。
    </tip>
</chapter>
</topic>