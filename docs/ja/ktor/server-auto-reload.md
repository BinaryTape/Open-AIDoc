<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="オートリロード (Auto-reload)"
       id="server-auto-reload" help-id="Auto_reload">
<tldr>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
    </p>
</tldr>
<link-summary>
    オートリロードを使用して、コードの変更時にアプリケーションクラスをリロードする方法を学びます。
</link-summary>
<p>
    開発中にサーバーを<Links href="//server-run" summary="Ktorサーバーアプリケーションの実行方法を学びます。">再起動</Links>するには時間がかかる場合があります。
    Ktorでは、<emphasis>オートリロード (Auto-reload)</emphasis>を使用することでこの制限を克服できます。これはコードの変更時にアプリケーションクラスをリロードし、素早いフィードバックループを提供します。
    オートリロードを使用するには、以下の手順に従ってください。
</p>
<list style="decimal">
    <li>
        <p>
            <a href="#enable">開発モードを有効にする</a>
        </p>
    </li>
    <li>
        <p>
            （オプション）<a href="#watch-paths">監視パスを構成する</a>
        </p>
    </li>
    <li>
        <p>
            <a href="#recompile">変更時の再コンパイルを有効にする</a>
        </p>
    </li>
</list>
<chapter title="制限事項" id="limitations">
    オートリロードは特定のモジュール宣言に対してのみ機能します。以下の表は、バージョンごとのサポート状況を示しています。
    <table>
<tr>
<td>モジュールの種類</td>
<td>&lt;= 3.2</td>
<td>&gt; 3.2</td>
</tr>
<tr>
<td>ラムダ初期化子 (Lambda initializer)</td>
<td>❌ サポートされていません</td>
<td>❌ サポートされていません</td>
</tr>
<tr>
<td>ブロッキング関数の参照</td>
<td>✅ サポートされています</td>
<td>❌ サポートされていません</td>
</tr>
<tr>
<td>サスペンド関数の参照</td>
<td>❌ サポートされていません</td>
<td>✅ サポートされています</td>
</tr>
<tr>
<td>設定の参照 (Config reference)</td>
<td>✅ サポートされています</td>
<td>✅ サポートされています</td>
</tr>
</table>
    <chapter title="サポートされている形式" id="supported">
        <code-block lang="kotlin" code="                // Suspend function reference&#10;                embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)&#10;&#10;                // Configuration reference&#10;                ktor {&#10;                    application {&#10;                        modules = [ com.example.ApplicationKt.mySuspendModule ]&#10;                    }&#10;                }"/>
    </chapter>
    <chapter title="サポートされていない形式" id="not-supported">
        <code-block lang="kotlin" code="                // Lambda&#10;                embeddedServer(Netty, port = 8080) { configureServer() }&#10;&#10;                // Blocking function reference&#10;                embeddedServer(Netty, port = 8080, module = Application::myBlockingModule)"/>
    </chapter>
</chapter>
<chapter title="開発モードを有効にする" id="enable">
    <p>
        オートリロードを使用するには、まず<a href="#enable">開発モード</a>を有効にする必要があります。
        これは、<Links href="//server-create-and-configure" summary="アプリケーションのデプロイニーズに応じたサーバーの作成方法を学びます。">サーバーの作成および実行</Links>に使用した方法によって異なります。
    </p>
    <list>
        <li>
            <p>
                <code>EngineMain</code>を使用してサーバーを実行する場合は、<a href="#application-conf">設定ファイル</a>で開発モードを有効にします。
            </p>
        </li>
        <li>
            <p>
                <code>embeddedServer</code>を使用してサーバーを実行する場合は、
                <a href="#system-property"><code>io.ktor.development</code></a>
                システムプロパティを使用できます。
            </p>
        </li>
    </list>
    <p>
        開発モードが有効になると、Ktorは作業ディレクトリからの出力ファイルを自動的に監視します。
        必要に応じて、<a href="#watch-paths">監視パス</a>を指定することで、監視対象のフォルダーを絞り込むことができます。
    </p>
</chapter>
<chapter title="監視パスを構成する" id="watch-paths">
    <p>
        開発モードを<a href="#enable">有効</a>にすると、Ktorは作業ディレクトリからの出力ファイルの監視を開始します。
        例えば、Gradleでビルドされた <Path>ktor-sample</Path> プロジェクトの場合、以下のフォルダーが監視されます。
    </p>
    <code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
    <p>
        監視パスを使用すると、監視対象のフォルダーのセットを絞り込むことができます。
        これを行うには、監視パスの一部を指定します。
        例えば、<Path>ktor-sample/build/classes</Path> サブフォルダーの変更を監視するには、監視パスとして <code>classes</code> を渡します。
        サーバーの実行方法に応じて、以下の方法で監視パスを指定できます。
    </p>
    <list>
        <li>
            <p>
                <Path>application.conf</Path> または <Path>application.yaml</Path> ファイルで、<code>watch</code> オプションを指定します。
            </p>
            <Tabs group="config">
                <TabItem title="application.conf" group-key="hocon">
                    <code-block code="ktor {&#10;    development = true&#10;    deployment {&#10;        watch = [ classes ]&#10;    }&#10;}"/>
                </TabItem>
                <TabItem title="application.yaml" group-key="yaml">
                    <code-block lang="yaml" code="ktor:&#10;    development: true&#10;    deployment:&#10;        watch:&#10;            - classes"/>
                </TabItem>
            </Tabs>
            <p>
                次のように複数の監視パスを指定することもできます。
            </p>
            <Tabs group="config">
                <TabItem title="application.conf" group-key="hocon">
                    <code-block code="                            watch = [ classes, resources ]"/>
                </TabItem>
                <TabItem title="application.yaml" group-key="yaml">
                    <code-block lang="yaml" code="                            watch:&#10;                                - classes&#10;                                - resources"/>
                </TabItem>
            </Tabs>
            <p>
                完全な例はこちらで確認できます: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>
            </p>
        </li>
        <li>
            <p>
                <code>embeddedServer</code> を使用している場合は、<code>watchPaths</code> パラメーターとして監視パスを渡します。
            </p>
            <code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
            <p>
                完全な例については、以下を参照してください。
                <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">
                    autoreload-embedded-server
                </a>
            </p>
        </li>
    </list>
</chapter>
<chapter title="変更時に再コンパイルする" id="recompile">
    <p>
        オートリロードは出力ファイルの変更を検出するため、プロジェクトをリビルドする必要があります。
        これは IntelliJ IDEA で手動で行うか、Gradle の <code>-t</code> コマンドラインオプションを使用して継続的ビルド実行を有効にすることで行えます。
    </p>
    <list>
        <li>
            <p>
                IntelliJ IDEA でプロジェクトを手動でリビルドするには、メインメニューから <ui-path>ビルド | プロジェクトのビルド</ui-path> を選択します。
            </p>
        </li>
        <li>
            <p>
                Gradle を使用して自動的にプロジェクトをリビルドするには、ターミナルで <code>-t</code> オプションを付けて <code>build</code> タスクを実行します。
            </p>
            <code-block lang="Bash" code="                    ./gradlew -t build"/>
            <tip>
                <p>
                    プロジェクトのリロード時にテストの実行をスキップするには、<code>build</code> タスクに <code>-x</code> オプションを渡すことができます。
                </p>
                <code-block lang="Bash" code="                        ./gradlew -t build -x test -i"/>
            </tip>
        </li>
    </list>
</chapter>
</topic>