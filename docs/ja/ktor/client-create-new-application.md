<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="クライアントアプリケーションの作成"
       id="client-create-new-application"
       help-id="getting_started_ktor_client;client-getting-started;client-get-started;client-create-a-new-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-client-get-started"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    リクエストを送信してレスポンスを受信する、最初のクライアントアプリケーションを作成します。
</link-summary>
<p>
    Ktorにはマルチプラットフォーム対応の非同期HTTPクライアントが含まれており、<Links href="client-requests.md" summary="リクエストの作成方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメーターの指定方法を学びます。">リクエストの送信</Links>や<Links href="client-responses.md" summary="レスポンスの受信方法、レスポンスボディの取得、レスポンスパラメーターの取得方法を学びます。">レスポンスの処理</Links>を行えるほか、<Links href="client-auth.md" summary="Authプラグインは、クライアントアプリケーションにおける認証と認可を処理します。">認証</Links>や<Links href="client-serialization.md" summary="ContentNegotiationプラグインには2つの主な目的があります。クライアントとサーバー間のメディアタイプのネゴシエーションと、リクエスト送信時およびレスポンス受信時における特定フォーマットでのコンテンツのシリアライズ/デシリアライズです。">JSONシリアライゼーション</Links>などの<Links href="client-plugins.md" summary="ロギング、シリアライゼーション、認可などの一般的な機能を追加するためのクライアントプラグインの使用方法を学びます。">プラグイン</Links>を使用して機能を拡張できます。
</p>
<p>
    このチュートリアルでは、リクエストを送信してレスポンスを出力する最初のKtorクライアントアプリケーションの作成方法を説明します。
</p>
<chapter title="前提条件" id="prerequisites">
    <p>
        このチュートリアルを始める前に、<a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA CommunityまたはUltimateをインストール</a>してください。
    </p>
</chapter>
<chapter title="新規プロジェクトの作成" id="new-project">
    <p>
        既存のプロジェクトでKtorクライアントを手動で<Links href="client-create-and-configure.md" summary="Ktorクライアントの作成と設定方法について学びます。">作成および設定</Links>することもできますが、最初から始める便利な方法として、IntelliJ IDEAにバンドルされているKotlinプラグインを使用して新規プロジェクトを生成する方法があります。
    </p>
    <p>
        新しいKotlinプロジェクトを作成するには、<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEAを開き</a>、以下の手順に従ってください。
    </p>
    <procedure>
        <step>
            <p>
                ウェルカム画面で、<control>New Project</control>をクリックします。
            </p>
            <p>
                または、メインメニューから<ui-path>File | New | Project</ui-path>を選択します。
            </p>
        </step>
        <step>
            <p>
                <control>New Project</control>ウィザードで、左側のリストから<control>Kotlin</control>を選択します。
            </p>
        </step>
        <step>
            <p>
                右側のペインで、以下の設定を指定します。
            </p>
            <img src="client_get_started_new_project.png" alt="IntelliJ IDEAの新規Kotlinプロジェクトウィンドウ"
                 border-effect="rounded"
                 width="706"/>
            <list id="kotlin_app_settings">
                <li>
                    <p>
                        <control>Name</control>: プロジェクト名を指定します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Location</control>: プロジェクト用のディレクトリを指定します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Build system</control>: <control>Gradle</control>が選択されていることを確認します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Gradle DSL</control>: <control>Kotlin</control>を選択します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Add sample code</control>: 生成されるプロジェクトにサンプルコードを含めるには、このオプションを選択します。
                    </p>
                </li>
            </list>
        </step>
        <step>
            <p>
                <control>Create</control>をクリックし、IntelliJ IDEAがプロジェクトを生成して依存関係をインストールするまで待ちます。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="依存関係の追加" id="add-dependencies">
    <p>
        Ktorクライアントに必要な依存関係を追加しましょう。
    </p>
    <procedure>
        <step>
            <p>
                <Path>gradle.properties</Path>ファイルを開き、次の行を追加してKtorのバージョンを指定します。
            </p>
            <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
            <note id="eap-note">
                <p>
                    KtorのEAPバージョンを使用するには、<a href="server-dependencies.topic#repositories">Spaceリポジトリ</a>を追加する必要があります。
                </p>
            </note>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>ファイルを開き、dependenciesブロックに以下のアーティファクトを追加します。
            </p>
            <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.client.core)&#10;    implementation(ktorLibs.client.cio)&#10;    implementation(libs.logback.classic)&#10;}"/>
            <list>
                <li><code>ktor-client-core</code> (<code>ktorLibs.client.core</code>) は、クライアントの主要な機能を提供するコア依存関係です。
                </li>
                <li>
                    <code>ktor-client-cio</code>(<code>ktorLibs.client.cio</code>) は、ネットワークリクエストを処理する<Links href="client-engines.md" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>の依存関係です。
                </li>
            </list>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>ファイルの右上隅にある<control>Load Gradle Changes</control>アイコンをクリックして、新しく追加した依存関係をインストールします。
            </p>
            <img src="client_get_started_load_gradle_changes_name.png" alt="Gradleの変更を読み込む" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="クライアントの作成" id="create-client">
    <p>
        クライアントの実装を追加するには、<Path>src/main/kotlin</Path>に移動し、以下の手順に従ってください。
    </p>
    <procedure>
        <step>
            <p>
                <Path>Main.kt</Path>ファイルを開き、既存のコードを以下の実装に置き換えます。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
            <p>
                Ktorでは、クライアントは<a
                    href="https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>クラスで表現されます。
            </p>
        </step>
        <step>
            <p>
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a>メソッドを使用して<Links href="client-requests.md" summary="リクエストの作成方法と、リクエストURL、HTTPメソッド、ヘッダー、リクエストボディなどのさまざまなリクエストパラメーターの指定方法を学びます。">GETリクエストを送信</Links>します。<Links href="client-responses.md" summary="レスポンスの受信方法、レスポンスボディの取得、レスポンスパラメーターの取得方法を学びます。">レスポンス</Links>は<code>HttpResponse</code>クラスのオブジェクトとして受信されます。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
            <p>
                上記のコードを追加すると、IDEは<code>get()</code>関数に対して次のエラーを表示します:
                <emphasis>Suspend function 'get' should be called only from a coroutine or another suspend
                    function
                </emphasis>
                。
            </p>
            <img src="client_get_started_suspend_error.png" alt="suspend関数のエラー" width="706"/>
            <p>
                これを解決するには、<code>main()</code>関数をサスペンド（suspending）関数にする必要があります。
            </p>
            <tip>
                <code>suspend</code>関数の呼び出しについての詳細は、<a
                    href="https://kotlinlang.org/docs/coroutines-basics.html">コルーチンの基本</a>を参照してください。
            </tip>
        </step>
        <step>
            <p>
                IntelliJ IDEAで定義の横にある赤い電球アイコンをクリックし、<control>Make main suspend</control>を選択します。
            </p>
            <img src="client_get_started_suspend_error_fix.png" alt="Make main suspend" width="706"/>
        </step>
        <step>
            <p>
                サーバーから返された<a href="client-responses.md#status">ステータスコード</a>を出力するには<code>println()</code>関数を使用し、ストリームを閉じて関連するリソースを解放するには<code>close()</code>関数を使用します。<Path>Main.kt</Path>ファイルは次のようになります。
            </p>
            <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
        </step>
    </procedure>
</chapter>
<chapter title="アプリケーションの実行" id="make-request">
    <p>
        アプリケーションを実行するには、<Path>Main.kt</Path>ファイルに移動し、以下の手順に従ってください。
    </p>
    <procedure>
        <step>
            <p>
                IntelliJ IDEAで<code>main()</code>関数の横にあるガターアイコンをクリックし、<control>Run 'MainKt'</control>を選択します。
            </p>
            <img src="client_get_started_run_main.png" alt="アプリを実行" width="706"/>
        </step>
        <step>
            IntelliJ IDEAがアプリケーションを実行するまで待ちます。
        </step>
        <step>
            <p>
                IDEの下部にある<control>Run</control>ペインに出力が表示されます。
            </p>
            <img src="client_get_started_run_output_with_warning.png" alt="サーバーのレスポンス" width="706"/>
            <p>
                サーバーは<code>200 OK</code>メッセージで応答しますが、同時にSLF4Jが<code>StaticLoggerBinder</code>クラスの検出に失敗し、デフォルトでno-operation (NOP) ロガー実装にフォールバックしたことを示すエラーメッセージも表示されます。これは実質的にロギングが無効になっていることを意味します。
            </p>
            <p>
                これでクライアントアプリケーションは動作するようになりました。ただし、この警告を解消し、ログ出力によってHTTP呼び出しをデバッグできるようにするには、<a href="#enable-logging">追加の手順</a>が必要です。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="ロギングの有効化" id="enable-logging">
    <p>
        KtorはJVM上でのロギングにSLF4J抽象化レイヤーを使用しているため、ロギングを有効にするには<a href="https://logback.qos.ch/">Logback</a>などの<a href="client-logging.md#jvm">ロギングフレームワークを提供</a>する必要があります。
    </p>
    <procedure id="enable-logging-procedure">
        <step>
            <p>
                <Path>gradle.properties</Path>ファイルで、ロギングフレームワークのバージョンを指定します。
            </p>
            <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>ファイルを開き、dependenciesブロックに以下のアーティファクトを追加します。
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
        </step>
        <step>
            <control>Load Gradle Changes</control>アイコンをクリックして、新しく追加した依存関係をインストールします。
        </step>
        <step>
            <p>
                IntelliJ IDEAで再実行ボタン（<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA再実行アイコン"/>）をクリックして、アプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                エラーが表示されなくなり、IDE下部の<control>Run</control>ペインに先ほどと同じ<code>200 OK</code>メッセージが表示されます。
            </p>
            <img src="client_get_started_run_output.png" alt="サーバーのレスポンス" width="706"/>
            <p>
                これでロギングが有効になりました。ログの出力を確認するには、ロギング設定を追加する必要があります。
            </p>
        </step>
        <step>
            <p><Path>src/main/resources</Path>に移動し、以下の実装を含む新しい<Path>logback.xml</Path>ファイルを作成します。
            </p>
            <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            &lt;appender-ref ref=&quot;APPENDER&quot;/&gt;&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
        </step>
        <step>
            <p>
                IntelliJ IDEAで再実行ボタン（<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA再実行アイコン"/>）をクリックして、アプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                <control>Run</control>ペイン内の出力されたレスポンスの上に、トレースログが表示されるようになります。
            </p>
            <img src="client_get_started_run_output_with_logs.png" alt="サーバーのレスポンス" width="706"/>
        </step>
    </procedure>
    <tip>
        Ktorは<Links href="client-logging.md" summary="必要な依存関係: io.ktor:ktor-client-logging コード例: %example_name%">Logging</Links>プラグインを通じてHTTP呼び出しのログを追加するシンプルで簡単な方法を提供しますが、設定ファイルを追加することで、複雑なアプリケーションにおけるロギング動作を細かく調整できます。
    </tip>
</chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        この設定についてさらに理解を深め、拡張するには、<Links href="client-create-and-configure.md" summary="Ktorクライアントの作成と設定方法について学びます。">Ktorクライアントの作成と設定</Links>を参照してください。
    </p>
</chapter>
</topic>