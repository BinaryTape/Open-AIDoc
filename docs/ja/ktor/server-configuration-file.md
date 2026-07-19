<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="ファイルでの設定"
       id="server-configuration-file" help-id="Configuration-file;server-configuration-in-file">
<show-structure for="chapter" depth="2"/>
<link-summary>
    構成ファイルでさまざまなサーバーパラメータを設定する方法について説明します。
</link-summary>
<p>
    Ktorでは、ホストアドレスやポート、ロードする<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構成できます。">モジュール</Links>など、さまざまなサーバーパラメータを設定できます。
    設定方法は、サーバーの作成に使用した方法（<Links href="/ktor/server-create-and-configure" summary="アプリケーションのデプロイニーズに応じたサーバーの作成方法について説明します。">embeddedServerまたはEngineMain</Links>）によって異なります。
</p>
<p>
    <code>EngineMain</code>の場合、Ktorは<a href="https://github.com/lightbend/config/blob/master/HOCON.md">HOCON</a>またはYAML形式を使用する構成ファイルから設定を読み込みます。この方法により、サーバー設定の柔軟性が向上し、アプリケーションを再コンパイルすることなく設定を変更できるようになります。さらに、コマンドラインからアプリケーションを実行し、対応する<a href="#command-line">コマンドライン</a>引数を渡すことで、必要なサーバーパラメータをオーバーライド (override) することも可能です。
</p>
<chapter title="概要" id="configuration-file-overview">
    <p>
        サーバーの起動に<a href="#engine-main">EngineMain</a>を使用する場合、Ktorは<code>resources</code>ディレクトリにある<Path>application.*</Path>という名前のファイルから設定を自動的に読み込みます。以下の2つの構成形式がサポートされています。
    </p>
    <list>
        <li>
            <p>
                HOCON (<Path>application.conf</Path>)
            </p>
        </li>
        <li>
            <p>
                YAML (<Path>application.yaml</Path>)
            </p>
            <note>
                <p>
                    YAML構成ファイルを使用するには、<code>ktor-server-config-yaml</code><Links href="/ktor/server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法について説明します。">依存関係</Links>を追加する必要があります。
                </p>
            </note>
            <warning>
                現在、MavenベースのKtorプロジェクトではYAML構成はサポートされていません。
            </warning>
        </li>
    </list>
    <p>
        構成ファイルには、少なくとも<code>ktor.application.modules</code>プロパティを使用して指定された、ロードする<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構成できます。">モジュール</Links>が含まれている必要があります。例：
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
        この場合、Ktorは以下の<Path>Application.kt</Path>ファイルにある<code>Application.module</code>関数を呼び出します。
    </p>
    <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit = io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
    <p>
        ロードするモジュールの他に、<a href="#predefined-properties">定義済み</a>のプロパティ（ポート、ホスト、SSL設定など）やカスタム設定など、さまざまなサーバー設定を構成できます。いくつかの例を見てみましょう。
    </p>
    <chapter title="基本設定" id="config-basic">
        <p>
            以下の例では、<code>ktor.deployment.port</code>プロパティを使用して、サーバーのリスニングポートを<code>8080</code>に設定しています。
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
    <chapter title="エンジン設定" id="config-engine">
        <snippet id="engine-main-configuration">
            <p>
                <code>EngineMain</code>を使用する場合、<code>ktor.deployment</code>グループ内ですべてのエンジンに共通のオプションを指定できます。
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
                    構成ファイル内の<code>ktor.deployment</code>グループで、Netty固有のオプションを設定することもできます。
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
    <chapter title="SSL設定" id="config-ssl">
        <p>
            以下の例では、Ktorが<code>8443</code>番のSSLポートでリッスンできるようにし、別の<code>security</code>ブロックで必要な<Links href="/ktor/server-ssl" summary="必要な依存関係：io.ktor:ktor-network-tls-certificates。コード例：ssl-engine-main、ssl-embedded-server">SSL設定</Links>を指定しています。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="application-conf">
                <code-block lang="shell" code="ktor {&#10;    deployment {&#10;        port = 8080&#10;        sslPort = 8443&#10;    }&#10;    application {&#10;        modules = [ com.example.ApplicationKt.module ]&#10;    }&#10;&#10;    security {&#10;        ssl {&#10;            keyStore = keystore.jks&#10;            keyAlias = sampleAlias&#10;            keyStorePassword = foobar&#10;            privateKeyPassword = foobar&#10;            trustStore = truststore.jks&#10;            trustStorePassword = foobar&#10;            enabledProtocols = [&quot;TLSv1.2&quot;, &quot;TLSv1.3&quot;]&#10;        }&#10;    }&#10;}"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="application-yaml">
                <code-block lang="yaml" code="ktor:&#10;    deployment:&#10;        port: 8080&#10;        sslPort: 8443&#10;    application:&#10;        modules:&#10;            - com.example.ApplicationKt.module&#10;&#10;    security:&#10;        ssl:&#10;            keyStore: keystore.jks&#10;            keyAlias: sampleAlias&#10;            keyStorePassword: foobar&#10;            privateKeyPassword: foobar&#10;            trustStore: truststore.jks&#10;            trustStorePassword: foobar&#10;            enabledProtocols: [&quot;TLSv1.2&quot;, &quot;TLSv1.3&quot;]"/>
            </tab>
        </tabs>
    </chapter>
    <chapter title="カスタム設定" id="config-custom">
        <p>
            <a href="#predefined-properties">定義済みプロパティ</a>の指定以外に、Ktorでは構成ファイルにカスタム設定を保持することもできます。以下の構成ファイルには、<a href="#jwt-settings">JWT</a>設定を保持するために使用されるカスタム<code>jwt</code>グループが含まれています。
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
            これらの設定はコード内で<a href="#read-configuration-in-code">読み取って処理</a>できます。
        </p>
        <warning>
            <p>
                秘密鍵やデータベースの接続設定などの機密データは、構成ファイルにプレーンテキストで保存しないでください。そのようなパラメータを指定するには、<a href="#environment-variables">環境変数</a>の使用を検討してください。
            </p>
        </warning>
    </chapter>
</chapter>
<chapter title="定義済みプロパティ" id="predefined-properties">
    <p>
        以下は、<a href="#configuration-file-overview">構成ファイル</a>内で使用できる定義済み設定の一覧です。
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
                リスニングポート。このプロパティを<code>0</code>に設定すると、ランダムなポートでサーバーを実行できます。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>8080</code>, <code>0</code>
            </p>
        </def>
        <def title="ktor.deployment.sslPort" id="ktor-deployment-ssl-port">
            <p>
                リスニングSSLポート。このプロパティを<code>0</code>に設定すると、ランダムなポートでサーバーを実行できます。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>8443</code>, <code>0</code>
            </p>
            <note>
                <p>
                    SSLには、<a href="#ssl">以下にリストされている</a>追加のオプションが必要です。
                </p>
            </note>
        </def>
        <def title="ktor.deployment.watch" id="ktor-deployment-watch">
            <p>
                <a href="#watch-paths">オートリロード</a>に使用される監視パス。
            </p>
        </def>
        <def title="ktor.deployment.rootPath" id="ktor-deployment-root-path">
            <p>
                <Links href="/ktor/server-war" summary="WARアーカイブを使用してサーブレットコンテナ内でKtorアプリケーションを実行およびデプロイする方法について説明します。">サーブレット</Links>コンテキストパス。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>/</code>
            </p>
        </def>
        <def title="ktor.deployment.shutdown.url" id="ktor-deployment-shutdown-url">
            <p>
                シャットダウンURL。
                このオプションは<Links href="/ktor/server-shutdown-url" summary="コード例: %example_name%">Shutdown URL</Links>プラグインを使用することに注意してください。
            </p>
        </def>
        <def title="ktor.deployment.shutdownGracePeriod" id="ktor-deployment-shutdown-grace-period">
            <p>
                サーバーが新しいリクエストの受付を停止するまでの最大時間（ミリ秒）。
            </p>
        </def>
        <def title="ktor.deployment.shutdownTimeout" id="ktor-deployment-shutdown-timeout">
            <p>
                サーバーが完全に停止するまで待機する最大時間（ミリ秒）。
            </p>
        </def>
        <def title="ktor.deployment.callGroupSize" id="ktor-deployment-call-group-size">
            <p>
                アプリケーションの呼び出しを処理するために使用されるスレッドプールの最小サイズ。
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
        <code>ktor.deployment.sslPort</code>を設定した場合は、以下の<Links href="/ktor/server-ssl" summary="必要な依存関係：io.ktor:ktor-network-tls-certificates。コード例：ssl-engine-main、ssl-embedded-server">SSL固有</Links>のプロパティを指定する必要があります。
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
        構成ファイルでは、パラメータを環境変数に置き換えることができます。
    </p>
    <list>
        <li>
            HOCON (<Path>application.conf</Path>) では、<code>${ENV}</code>構文のみがサポートされています。
        </li>
        <li>
            YAML (<Path>application.yaml</Path>) では、<code>${ENV}</code>と<code>$ENV</code>の両方の構文がサポートされています。
        </li>
    </list>
    <p>
        例えば、<code>PORT</code>環境変数を<code>ktor.deployment.port</code>プロパティに次のように割り当てることができます。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="env-var-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = ${PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="env-var-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: ${PORT} # または $PORT"/>
        </tab>
    </tabs>
    <p>
        この場合、環境変数の値がリスニングポートの指定に使用されます。実行時に<code>PORT</code>環境変数が存在しない場合は、次のようにデフォルトのポート値を指定できます。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                            port = ${?PORT}&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: ${PORT:8080} # または &quot;$PORT:8080&quot;"/>
        </tab>
    </tabs>
</chapter>
<chapter title="コード内での構成の読み取り" id="read-configuration-in-code">
    <p>
        Ktorを使用すると、構成ファイルで指定されたプロパティ値にアプリケーションコードからアクセスできます。
        以下の例では、<code>ktor.deployment.port</code>プロパティを指定しています。
    </p>
    <tabs group="config">
        <tab title="application.conf" group-key="hocon" id="config-conf-2">
            <code-block lang="shell" code="                    ktor {&#10;                        deployment {&#10;                            port = 8080&#10;                        }&#10;                    }"/>
        </tab>
        <tab title="application.yaml" group-key="yaml" id="config-yaml-2">
            <code-block lang="yaml" code="                    ktor:&#10;                        deployment:&#10;                            port: 8080"/>
        </tab>
    </tabs>
    <p>
        <a href="https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-environment/config.html">
            <code>ApplicationEnvironment.config()</code>
        </a>
        関数を使用してアプリケーションの構成にアクセスし、プロパティ値を取得できます。必要な値にアクセスするには<code>.property()</code>関数を使用し、オプションの値には<code>.propertyOrNull()</code>を使用します。
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                val port = environment.config.propertyOrNull(&quot;ktor.deployment.port&quot;)?.getString() ?: &quot;8080&quot;&#10;                routing {&#10;                    get {&#10;                        call.respondText(&quot;Listening on port $port&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <chapter title="構成をデータクラスにデシリアライズする" id="deserialize-config">
        <p>
            構成値を型安全に利用するために、構成をKotlinクラスにデシリアライズ (deserialize) できます。
        </p>
        <p>
            以下の例では、<code>app</code>と<code>security</code>の構成セクションを定義し、それらをシリアライズ可能なKotlinデータクラスにマッピングしています。
        </p>
        <tabs group="config">
            <tab title="application.conf" group-key="hocon" id="config-conf-1">
            <code-block lang="shell" code="                    app {&#10;                        port = 8080&#10;                        host = &quot;0.0.0.0&quot;&#10;                    }&#10;&#10;                    security {&#10;                        clientId = ${?CLIENT_ID}&#10;                        clientSecret = ${?CLIENT_SECRET}&#10;                    }"/>
            </tab>
            <tab title="application.yaml" group-key="yaml" id="config-yaml-1">
            <code-block lang="yaml" code="                    app:&#10;                        port: 8080&#10;                        host: &quot;0.0.0.0&quot;&#10;                    security:&#10;                        clientId: $CLIENT_ID&#10;                        clientSecret: $CLIENT_SECRET"/>
            </tab>
        </tabs>
        <p>
            特定の構成セクションをデシリアライズするには、<code>Application.property()</code>または<code>Application.propertyOrNull()</code>関数を使用します。
        </p>
        <code-block lang="kotlin" code="            @Serializable&#10;            data class Security(val clientId: String, val clientSecret: String)&#10;&#10;            fun Application.module() {&#10;                val securityConfig: Security = property(&quot;security&quot;)&#10;&#10;                println(&quot;Authorization header: ${securityConfig.clientId}:${securityConfig.clientSecret}&quot;)&#10;            }"/>
        <p>
            <code>ApplicationConfig</code>全体をデシリアライズする必要がある場合は、<code>ApplicationConfig.getAs()</code>関数を使用します。
        </p>
        <code-block lang="kotlin" code="            @Serializable&#10;            data class App(val port: Int, val host: String)&#10;            @Serializable&#10;            data class Security(val clientId: String, val clientSecret: String)&#10;            @Serializable&#10;            data class Config(val app: App, val security: Security)&#10;&#10;            fun Application.module() {&#10;                val config = environment.config.getAs&lt;Config&gt;()&#10;&#10;                val clientId = config.security.clientId&#10;                val clientSecret = config.security.clientSecret&#10;&#10;                println(&quot;Authorization header: $clientId:$clientSecret&quot;)&#10;            }"/>
    </chapter>
</chapter>
<chapter title="コマンドライン" id="command-line">
    <p>
        サーバーの作成に<a href="#engine-main">EngineMain</a>を使用する場合、<Links href="/ktor/server-fatjar" summary="Ktor Gradleプラグインを使用して、実行可能なfat JARを作成して実行する方法について説明します。">パッケージ化されたアプリケーション</Links>をコマンドラインから実行し、対応するコマンドライン引数を渡すことで、必要なサーバーパラメータをオーバーライドできます。例えば、構成ファイルで指定されたポートを次のようにオーバーライドできます。
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
                resources内の<Path>application.conf</Path> / <Path>application.yaml</Path>の代わりに使用される、カスタム構成ファイルへのパス。
            </p>
            <p>
                <emphasis>例</emphasis>
                : <code>java -jar sample-app.jar -config=anotherfile.conf</code>
            </p>
            <p>
                <emphasis>注</emphasis>
                : 複数の値を渡すことができます。<code>java -jar sample-app.jar -config=config-base.conf -config=config-dev.conf</code>。この場合、すべての構成がマージされ、右側の構成の値が優先されます。
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
                <a href="#watch-paths">オートリロード</a>に使用される監視パス。
            </p>
        </def>
    </deflist>
    <p>
        <Links href="/ktor/server-ssl" summary="必要な依存関係：io.ktor:ktor-network-tls-certificates。コード例：ssl-engine-main、ssl-embedded-server">SSL固有</Links>のオプション：
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
        対応するコマンドラインオプションがない<a href="#predefined-properties">定義済みプロパティ</a>をオーバーライドする必要がある場合は、<code>-P</code>フラグを使用します。例：
    </p>
    <code-block code="            java -jar sample-app.jar -P:ktor.deployment.callGroupSize=7"/>
    <p>
        <code>-P</code>フラグを使用して、<a href="#config-custom">カスタムプロパティ</a>をオーバーライドすることもできます。
    </p>
</chapter>
<chapter title="例：カスタムプロパティを使用した環境の指定" id="custom-property">
    <p>
        カスタム構成プロパティを使用して、ローカル開発環境や本番環境など、サーバーが実行されている環境に応じてアプリケーションの動作を変更できます。
    </p>
    <p>
        これを行うには、<Path>application.conf</Path>または<Path>application.yaml</Path>でカスタムプロパティを定義し、<a href="#environment-variables">環境変数</a>からその値を割り当てます。以下の例では、<code>KTOR_ENV</code>環境変数がカスタムの<code>ktor.environment</code>プロパティに割り当てられています。その後、<code>KTOR_ENV</code>の値をローカル環境と本番環境で異なる値に設定できます。
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
        実行時に<code>ktor.environment</code>の値にアクセスするには、<a href="#read-configuration-in-code">コード内で構成を読み取り</a>、必要なアクションを実行します。
    </p>
    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Application.module() {&#10;    val env = environment.config.propertyOrNull(&quot;ktor.environment&quot;)?.getString()&#10;    routing {&#10;        get {&#10;            call.respondText(when (env) {&#10;                &quot;dev&quot; -&gt; &quot;Development&quot;&#10;                &quot;prod&quot; -&gt; &quot;Production&quot;&#10;                else -&gt; &quot;...&quot;&#10;            })&#10;        }&#10;    }&#10;}"/>
    <p>
        完全なコード例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main-custom-environment">engine-main-custom-environment</a>を参照してください。
    </p>
</chapter>
</topic>