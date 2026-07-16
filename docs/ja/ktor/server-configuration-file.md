<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="ファイルでの設定"
       id="server-configuration-file" help-id="Configuration-file;server-configuration-in-file">
<show-structure for="chapter" depth="2"/>
<link-summary>
    設定ファイルでさまざまなサーバーパラメーターを構成する方法を学びます。
</link-summary>
<p>
    Ktorを使用すると、ホストアドレスやポート、
    <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">読み込むモジュール</Links>
    など、さまざまなサーバーパラメーターを構成できます。
    設定は、サーバーを作成した方法、つまり
    <Links href="/ktor/server-create-and-configure" summary="アプリケーションのデプロイ要件に応じてサーバーを作成する方法を学びます。">
        embeddedServerまたはEngineMain
    </Links>
    によって異なります。
</p>
<p>
    <code>EngineMain</code>の場合、Ktorは
    <a href="https://github.com/lightbend/config/blob/master/HOCON.md">
        HOCON
    </a>
    またはYAML形式を使用する設定ファイルから構成を読み込みます。この方法により、サーバーを構成する際の柔軟性が高まり、アプリケーションを再コンパイルすることなく設定を変更できます。さらに、コマンドラインからアプリケーションを実行し、対応する
    <a href="#command-line">
        コマンドライン
    </a>
    引数を渡すことで、必要なサーバーパラメーターを上書きできます。
</p>
<chapter title="概要" id="configuration-file-overview">
    <p>
        <a href="#engine-main">
            EngineMain
        </a>
        を使用してサーバーを起動する場合、Ktorは
        <Path>resources</Path>
        ディレクトリにある
        <Path>application.*</Path>
        というファイルから設定を自動的に読み込みます。以下の2つの設定形式がサポートされています。
    </p>
    <list>
        <li>
            <p>
                HOCON (
                <Path>application.conf</Path>
                )
            </p>
        </li>
        <li>
            <p>
                YAML (
                <Path>application.yaml</Path>
                )
            </p>
            <note>
                <p>
                    YAML設定ファイルを使用するには、<code>ktor-server-config-yaml</code>
                    <Links href="/ktor/server-dependencies" summary="既存のGradle/MavenプロジェクトにKtor Serverの依存関係を追加する方法を学びます。">
                        依存関係
                    </Links>
                    を追加する必要があります。
                </p>
            </note>
        </li>
    </list>
    <p>
        設定ファイルには、少なくとも<code>ktor.application.modules</code>プロパティを使用して指定された
        <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">
            読み込むモジュール
        </Links>
        が含まれている必要があります。例:
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="application-conf-2">
            <code-block lang="shell" code="ktor {&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="application-yaml-2">
            <code-block lang="yaml" code="ktor:&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
        </tab>
    </tabs>
    <p>
        この場合、Ktorは以下の
        <Path>Application.kt</Path>
        ファイル内の<code>Application.module</code>関数を呼び出します。
    </p>
    <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
    <p>
        読み込むモジュール以外にも、
        <a href="#predefined-properties">事前定義された</a>
        （ポートやホスト、SSL設定など）およびカスタムのさまざまなサーバー設定を構成できます。
        いくつかの例を見てみましょう。
    </p>
    <chapter title="基本的な構成" id="config-basic">
        <p>
            以下の例では、サーバーのリスニングポートが<code>ktor.deployment.port</code>プロパティを使用して<code>8080</code>に設定されています。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-3">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-3">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="エンジン構成" id="config-engine">
        <snippet id="engine-main-configuration">
            <p>
                <code>EngineMain</code>を使用する場合、<code>ktor.deployment</code>グループ内で、すべてのエンジンに共通のオプションを指定できます。
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon" id="engine-main-conf">
                    <code-block lang="shell" code="                            ktor {&#10;                                deployment {&#10;                                    connectionGroupSize = 2&#10;                                    workerGroupSize = 5&#10;                                    callGroupSize = 10&#10;                                    shutdownGracePeriod = 2000&#10;                                    shutdownTimeout = 3000&#10;                                }&#10;                            }"/>
                </tab>
                <tab title="application.yaml" group-key="yaml" id="engine-main-yaml">
                    <code-block lang="yaml" code="                           ktor:&#10;                               deployment:&#10;                                   connectionGroupSize: 2&#10;                                   workerGroupSize: 5&#10;                                   callGroupSize: 10&#10;                                   shutdownGracePeriod: 2000&#10;                                   shutdownTimeout: 3000"/>
                </tab>
            </tabs>
            <chapter title="Netty" id="netty-file">
                <p>
                    構成ファイル内で、<code>ktor.deployment</code>グループにNetty固有のオプションを設定することもできます。
                </p>
                <tabs group="config">
                    <tab title="application.conf" group-key="hocon" id="application-conf-1">
                        <code-block lang="shell" code="                               ktor {&#10;                                   deployment {&#10;                                       maxInitialLineLength = 2048&#10;                                       maxHeaderSize = 1024&#10;                                       maxChunkSize = 42&#10;                                   }&#10;                               }"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml" id="application-yaml-1">
                        <code-block lang="yaml" code="                               ktor:&#10;                                   deployment:&#10;                                       maxInitialLineLength: 2048&#10;                                       maxHeaderSize: 1024&#10;                                       maxChunkSize: 42"/>
                    </tab>
                </tabs>
            </chapter>
        </snippet>
    </chapter>
    <chapter title="SSL構成" id="config-ssl">
        <p>
            以下の例では、Ktorが<code>8443</code>番のSSLポートでリッスンすることを有効にし、必要な
            <Links href="/ktor/server-ssl" summary="必要な依存関係: io.ktor:ktor-network-tls-certificates コード例: ssl-engine-main, ssl-embedded-server">
                SSL設定
            </Links>
            を個別の<code>security</code>ブロックで指定しています。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;        sslPort = 8443&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;&#10;    security {&#10;        ssl {&#10;            keyStore = keystore.jks&#10;            keyAlias = sampleAlias&#10;            keyStorePassword = foobar&#10;            privateKeyPassword = foobar&#10;        }&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;        sslPort: 8443&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module&#10;&#10;    security:&#10;        ssl:&#10;            keyStore: keystore.jks&#10;            keyAlias: sampleAlias&#10;            keyStorePassword: foobar&#10;            privateKeyPassword: foobar"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="カスタム構成" id="config-custom">
        <p>
            <a href="#predefined-properties">事前定義されたプロパティ</a>を指定する以外に、Ktorはカスタム設定を構成ファイルに保持することを許可します。
            以下の構成ファイルには、<a href="#jwt-settings">JWT</a>設定を保持するために使用されるカスタム<code>jwt</code>グループが含まれています。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf-4">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;    }&#10;&#10;    application {&#10;        modules = [ com.example.ApplicationKt.main ]&#10;    }&#10;}&#10;&#10;jwt {&#10;    secret = &quot;secret&quot;&#10;    issuer = &quot;http://0.0.0.0:8080/&quot;&#10;    audience = &quot;http://0.0.0.0:8080/hello&quot;&#10;    realm = &quot;Access to 'hello'&quot;&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml-4">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.main&#10;&#10;jwt:&#10;    secret: &quot;secret&quot;&#10;    issuer: &quot;http://0.0.0.0:8080/&quot;&#10;    audience: &quot;http://0.0.0.0:8080/hello&quot;&#10;    realm: &quot;Access to 'hello'&quot;"/>
            </tab>
        </tabs>
        <p>
            これらの設定はコードで<a href="#read-configuration-in-code">読み込んで処理</a>できます。
        </p>
        <warning>
            <p>
                機密データ（秘密鍵、データベース接続設定など）は、設定ファイルに平文で保存しないでください。
                これらのパラメーターを指定するには、
                <a href="#environment-variables">
                    環境変数
                </a>
                の使用を検討してください。
            </p>
        </warning>
    </chapter>
</chapter>
<chapter title="事前定義されたプロパティ" id="predefined-properties">
    <p>
        以下は、<a href="#configuration-file-overview">構成ファイル</a>内で使用できる事前定義された設定のリストです。
    </p>
    <deflist type="wide">
        <def title="ktor.deployment.host" id="ktor-deployment-host">
            <p>
                ホストアドレス。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>0.0.0.0</code>
            </p>
        </def>
        <def title="ktor.deployment.port" id="ktor-deployment-port">
            <p>
                リスニングポート。このプロパティを<code>0</code>に設定すると、サーバーがランダムなポートで実行されます。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>8080</code>, <code>0</code>
            </p>
        </def>
        <def title="ktor.deployment.sslPort" id="ktor-deployment-ssl-port">
            <p>
                リスニングSSLポート。このプロパティを<code>0</code>に設定すると、サーバーがランダムなポートで実行されます。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>8443</code>, <code>0</code>
            </p>
            <note>
                <p>
                    SSLには、<a href="#ssl">以下にリストされている</a>追加オプションが必要であることに注意してください。
                </p>
            </note>
        </def>
        <def title="ktor.deployment.watch" id="ktor-deployment-watch">
            <p>
                <a href="#watch-paths">自動リロード</a>に使用される監視パス。
            </p>
        </def>
        <def title="ktor.deployment.rootPath" id="ktor-deployment-root-path">
            <p>
                <Links href="/ktor/server-war" summary="WARアーカイブを使用してサーブレットコンテナ内でKtorアプリケーションを実行およびデプロイする方法を学びます。">サーブレット</Links>コンテキストパス。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>/</code>
            </p>
        </def>
        <def title="ktor.deployment.shutdown.url" id="ktor-deployment-shutdown-url">
            <p>
                シャットダウンURL。
                このオプションは、<Links href="/ktor/server-shutdown-url" summary="コード例: %example_name%">シャットダウンURL</Links>プラグインを使用することに注意してください。
            </p>
        </def>
        <def title="ktor.deployment.shutdownGracePeriod" id="ktor-deployment-shutdown-grace-period">
            <p>
                サーバーが新しいリクエストの受け入れを停止するまでの最大時間（ミリ秒単位）。
            </p>
        </def>
        <def title="ktor.deployment.shutdownTimeout" id="ktor-deployment-shutdown-timeout">
            <p>
                サーバーが完全に停止するまで待機する最大時間（ミリ秒単位）。
            </p>
        </def>
        <def title="ktor.deployment.callGroupSize" id="ktor-deployment-call-group-size">
            <p>
                アプリケーション呼び出しを処理するために使用されるスレッドプールの最小サイズ。
            </p>
        </def>
        <def title="ktor.deployment.connectionGroupSize" id="ktor-deployment-connection-group-size">
            <p>
                新しい接続を受け入れ、呼び出し処理を開始するために使用されるスレッドの数。
            </p>
        </def>
        <def title="ktor.deployment.workerGroupSize" id="ktor-deployment-worker-group-size">
            <p>
                接続の処理、メッセージの解析、およびエンジンの内部作業を行うためのイベントグループのサイズ。
            </p>
        </def>
    </deflist>
    <p id="ssl">
        <code>ktor.deployment.sslPort</code>を設定した場合、以下の
        <Links href="/ktor/server-ssl" summary="必要な依存関係: io.ktor:ktor-network-tls-certificates コード例: ssl-engine-main, ssl-embedded-server">
            SSL固有
        </Links>
        のプロパティを指定する必要があります。
    </p>
    <deflist type="wide">
        <def title="ktor.security.ssl.keyStore" id="ktor-security-ssl-keystore">
            <p>
                SSLキーストア。
            </p>
        </def>
        <def title="ktor.security.ssl.keyAlias" id="ktor-security-ssl-key-alias">
            <p>
                SSLキーストアのエイリアス。
            </p>
        </def>
        <def title="ktor.security.ssl.keyStorePassword" id="ktor-security-ssl-keystore-password">
            <p>
                SSLキーストアのパスワード。
            </p>
        </def>
        <def title="ktor.security.ssl.privateKeyPassword" id="ktor-security-ssl-private-key-password">
            <p>
                SSL秘密鍵のパスワード。
            </p>
        </def>
    </deflist>
</chapter>
<chapter title="環境変数" id="environment-variables">
    <p>
        設定ファイルでは、<code>${ENV}</code> / <code>$ENV</code>構文を使用してパラメーターを環境変数に置き換えることができます。
        例えば、<code>PORT</code>環境変数を<code>ktor.deployment.port</code>プロパティに次のように割り当てることができます。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="env-var-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = ${PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="env-var-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: $PORT"/>
        </tab>
    </tabs>
    <p>
        この場合、環境変数の値がリスニングポートの指定に使用されます。
        実行時に<code>PORT</code>環境変数が存在しない場合は、次のようにデフォルトのポート値を指定できます。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                            port = ${?PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: &quot;$PORT:8080&quot;"/>
        </tab>
    </tabs>
</chapter>
<chapter title="コードでの設定の読み込み" id="read-configuration-in-code">
    <p>
        Ktorでは、設定ファイル内で指定されたプロパティの値にコードからアクセスできます。
        例えば、<code>ktor.deployment.port</code>プロパティを指定した場合、...
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf-1">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml-1">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: 8080"/>
        </tab>
    </tabs>
    <p>
        ...アプリケーションの設定には
        <a href="https://api.ktor.io/ktor-server/ktor-server-core/io.ktor.server.application/-application-environment/config.html">
            ApplicationEnvironment.config
        </a>
        を使用してアクセスし、必要なプロパティ値は次のように取得できます。
    </p>
    <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import io.ktor.server.response.*&#10;            import io.ktor.server.routing.*&#10;&#10;            fun Application.module() {&#10;                val port = environment.config.propertyOrNull(&quot;ktor.deployment.port&quot;)?.getString() ?: &quot;8080&quot;&#10;                routing {&#10;                    get {&#10;                        call.respondText(&quot;Listening on port $port&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <p>
        これは、<a href="#custom-property">カスタム設定</a>を設定ファイルに保持し、その値にアクセスする必要がある場合に特に役立ちます。
    </p>
</chapter>
<chapter title="コマンドライン" id="command-line">
    <p>
        <a href="#engine-main">EngineMain</a>を使用してサーバーを作成する場合、コマンドラインから<Links href="/ktor/server-fatjar" summary="Ktor Gradleプラグインを使用して実行可能なfat JARを作成および実行する方法を学びます。">パッケージ化されたアプリケーション</Links>を実行し、対応するコマンドライン引数を渡すことで必要なサーバーパラメーターを上書きできます。例えば、設定ファイルで指定されたポートを次のように上書きできます。
    </p>
    <code-block lang="shell" code="            java -jar sample-app.jar -port=8080"/>
    <p>
        利用可能なコマンドラインオプションは以下の通りです。
    </p>
    <deflist type="narrow">
        <def title="-jar" id="jar">
            <p>
                JARファイルへのパス。
            </p>
        </def>
        <def title="-config" id="config">
            <p>
                リソースからの
                <Path>application.conf</Path>
                /
                <Path>application.yaml</Path>
                の代わりに使用されるカスタム設定ファイルへのパス。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>java -jar sample-app.jar -config=anotherfile.conf</code>
            </p>
            <p>
                <emphasis>注</emphasis>
                : 複数の値を渡すことができます。<code>java -jar sample-app.jar -config=config-base.conf
                -config=config-dev.conf</code>。この場合、すべての設定がマージされ、右側の設定の値が優先されます。
            </p>
        </def>
        <def title="-host" id="host">
            <p>
                ホストアドレス。
            </p>
        </def>
        <def title="-port" id="port">
            <p>
                リスニングポート。
            </p>
        </def>
        <def title="-watch" id="watch">
            <p>
                <a href="#watch-paths">自動リロード</a>に使用される監視パス。
            </p>
        </def>
    </deflist>
    <p>
        <Links href="/ktor/server-ssl" summary="必要な依存関係: io.ktor:ktor-network-tls-certificates コード例: ssl-engine-main, ssl-embedded-server">SSL固有</Links>のオプション:
    </p>
    <deflist type="narrow">
        <def title="-sslPort" id="ssl-port">
            <p>
                リスニングSSLポート。
            </p>
        </def>
        <def title="-sslKeyStore" id="ssl-keystore">
            <p>
                SSLキーストア。
            </p>
        </def>
    </deflist>
    <p>
        対応するコマンドラインオプションがない<a href="#predefined-properties">事前定義されたプロパティ</a>を上書きする必要がある場合は、<code>-P</code>フラグを使用します。例:
    </p>
    <code-block code="            java -jar sample-app.jar -P:ktor.deployment.callGroupSize=7"/>
    <p>
        <code>-P</code>フラグを使用して、<a href="#config-custom">カスタムプロパティ</a>を上書きすることもできます。
    </p>
</chapter>
<chapter title="例: カスタムプロパティを使用した環境の指定方法" id="custom-property">
    <p>
        サーバーがローカルで実行されているか、本番環境で実行されているかに応じて、異なる処理を行いたい場合があります。これを実現するには、
        <Path>application.conf</Path>
        /
        <Path>application.yaml</Path>
        にカスタムプロパティを追加し、サーバーがローカルで実行されているか本番環境で実行されているかに応じて値が異なる専用の<a href="#environment-variables">環境変数</a>で初期化します。以下の例では、<code>KTOR_ENV</code>環境変数がカスタムの<code>ktor.environment</code>プロパティに割り当てられています。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="application-conf-5">
            <code-block code="ktor {&#10;    environment = ${?KTOR_ENV}&#10;}"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="application-yaml-5">
            <code-block lang="yaml" code="ktor:&#10;    environment: $?KTOR_ENV"/>
        </tab>
    </tabs>
    <p>
        実行時に<code>ktor.environment</code>の値にアクセスするには、
        <a href="#read-configuration-in-code">
            コードで設定を読み込み
        </a>
        、必要なアクションを実行します。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Application.module() {&#10;    val env = environment.config.propertyOrNull(&quot;ktor.environment&quot;)?.getString()&#10;    routing {&#10;        get {&#10;            call.respondText(when (env) {&#10;                &quot;dev&quot; -&gt; &quot;Development&quot;&#10;                &quot;prod&quot; -&gt; &quot;Production&quot;&#10;                else -&gt; &quot;...&quot;&#10;            })&#10;        }&#10;    }&#10;}"/>
    <p>
        完全な例はこちらで確認できます。
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/engine-main-custom-environment">
            engine-main-custom-environment
        </a>。
    </p>
</chapter>
</topic>