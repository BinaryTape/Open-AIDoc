```xml
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="自動リロード"
       id="server-auto-reload" help-id="Auto_reload">
<tldr>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>,
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
        </p>
</tldr>
<link-summary>
        自動リロードを使用して、コード変更時にアプリケーションクラスをリロードする方法について説明します。
</link-summary>
<p>
        <Links href="/ktor/server-run" summary="Learn how to run a server Ktor application.">開発中にサーバーを再起動するには時間がかかる場合があります。</Links>
        Ktorは、<emphasis>自動リロード</emphasis>を使用することでこの制限を克服できます。これはコード変更時にアプリケーションクラスをリロードし、高速なフィードバックループを提供します。
        自動リロードを使用するには、以下の手順に従ってください:
</p>
<list style="decimal">
        <li>
            <p>
                <a href="#enable">開発モードを有効にする</a>
            </p>
        </li>
        <li>
            <p>
                (オプション) <a href="#watch-paths">ウォッチパスを設定する</a>
            </p>
        </li>
        <li>
            <p>
                <a href="#recompile">変更時の再コンパイルを有効にする</a>
            </p>
        </li>
</list>
<chapter title="開発モードを有効にする" id="enable">
        <p>
            自動リロードを使用するには、まず
            <a href="#enable">開発モード</a>を有効にする必要があります。
            これは、<Links href="/ktor/server-create-and-configure" summary="Learn how to create a server depending on your application deployment needs.">サーバーを作成および実行</Links>するために使用した方法によって異なります:
        </p>
        <list>
            <li>
                <p>
                    <code>EngineMain</code>を使用してサーバーを実行する場合、<a href="#application-conf">設定ファイル</a>で開発モードを有効にします。
                </p>
            </li>
            <li>
                <p>
                    <code>embeddedServer</code>を使用してサーバーを実行する場合、
                    <a href="#system-property">io.ktor.development</a>
                    システムプロパティを使用できます。
                </p>
            </li>
        </list>
        <p>
            開発モードが有効になっている場合、Ktorは自動的に作業ディレクトリから出力ファイルを監視します。
            必要に応じて、<a href="#watch-paths">ウォッチパス</a>を指定することで、監視するフォルダのセットを絞り込むことができます。
        </p>
</chapter>
<chapter title="ウォッチパスを設定する" id="watch-paths">
        <p>
            <a href="#enable">開発モードを有効にする</a>と、
            Ktorは作業ディレクトリから出力ファイルの監視を開始します。
            例えば、Gradleでビルドされた<Path>ktor-sample</Path>プロジェクトの場合、以下のフォルダが監視されます:
        </p>
        <code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
        <p>
            ウォッチパスを使用すると、監視するフォルダのセットを絞り込むことができます。
            これを行うには、監視するパスの一部を指定できます。
            例えば、<Path>ktor-sample/build/classes</Path>サブフォルダ内の変更を監視するには、<code>classes</code>をウォッチパスとして渡します。
            サーバーの実行方法に応じて、以下の方法でウォッチパスを指定できます:
        </p>
        <list>
            <li>
                <p>
                    <Path>application.conf</Path>または<Path>application.yaml</Path>ファイルで、<code>watch</code>オプションを指定します:
                </p>
                <tabs group="config">
                    <tab title="application.conf" group-key="hocon">
                        <code-block code="ktor {&#10;    development = true&#10;    deployment {&#10;        watch = [ classes ]&#10;    }&#10;}"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="ktor:&#10;    development: true&#10;    deployment:&#10;        watch:&#10;            - classes"/>
                    </tab>
                </tabs>
                <p>
                    複数のウォッチパスを指定することもできます。例えば:
                </p>
                <tabs group="config">
                    <tab title="application.conf" group-key="hocon">
                        <code-block code="                            watch = [ classes, resources ]"/>
                    </tab>
                    <tab title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="                            watch:&#10;                                - classes&#10;                                - resources"/>
                    </tab>
                </tabs>
                <p>
                    完全な例はこちらにあります: <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>。
                </p>
            </li>
            <li>
                <p>
                    <code>embeddedServer</code>を使用している場合、ウォッチパスを<code>watchPaths</code>
                    パラメーターとして渡します:
                </p>
                <code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>
                    完全な例については、
                    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-embedded-server">
                        autoreload-embedded-server
                    </a>
                    を参照してください。
                </p>
            </li>
        </list>
</chapter>
<chapter title="変更時の再コンパイル" id="recompile">
        <p>
            自動リロードは出力ファイルの変更を検出するため、
            プロジェクトを再ビルドする必要があります。
            これはIntelliJ IDEAで手動で行うか、<code>-t</code>コマンドラインオプションを使用してGradleで継続的なビルド実行を有効にすることができます。
        </p>
        <list>
            <li>
                <p>
                    IntelliJ IDEAでプロジェクトを手動で再ビルドするには、メインメニューから
                    <ui-path>Build | Rebuild Project</ui-path>を選択します。
                </p>
            </li>
            <li>
                <p>
                    Gradleを使用してプロジェクトを自動的に再ビルドするには、
                    ターミナルで<code>-t</code>オプションを付けて<code>build</code>タスクを実行します:
                </p>
                <code-block code="                    ./gradlew -t build"/>
                <tip>
                    <p>
                        プロジェクトのリロード時にテストの実行をスキップするには、<code>build</code>タスクに<code>-x</code>オプションを渡すことができます:
                    </p>
                    <code-block code="                        ./gradlew -t build -x test -i"/>
                </tip>
            </li>
        </list>
</chapter>
</topic>