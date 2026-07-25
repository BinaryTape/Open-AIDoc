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
    Ktor にはマルチプラットフォーム対応の非同期 HTTP クライアントが含まれており、これを使用することで <Links href="//client-requests" summary="リクエストの作成方法と、リクエスト URL、HTTP メソッド、ヘッダー、リクエスト本文などのさまざまなリクエストパラメータの指定方法について学びます。">リクエストの送信</Links>や <Links href="//client-responses" summary="レスポンスの受信、レスポンス本文の取得、レスポンスパラメータの取得方法について学びます。">レスポンスの処理</Links>を行うことができます。また、<Links href="//client-plugins" summary="ロギング、シリアル化、認可などの一般的な機能を追加するためのクライアントプラグインの使用方法を学びます。">プラグイン</Links>を使用して、<Links href="//client-auth" summary="Auth プラグインは、クライアントアプリケーションでの認証と認可を処理します。">認証</Links>や <Links href="//client-serialization" summary="ContentNegotiation プラグインは、主に 2 つの目的を果たします。クライアントとサーバー間でのメディアタイプのネゴシエーションと、リクエスト送信時およびレスポンス受信時に特定の形式でコンテンツをシリアル化/デシリアル化することです。">JSON シリアル化</Links>などの機能拡張も可能です。
</p>
<p>
    このチュートリアルでは、リクエストを送信してレスポンスを出力する、最初の Ktor クライアントアプリケーションの作成方法を説明します。
</p>
<chapter title="前提条件" id="prerequisites">
    <p>
        このチュートリアルを始める前に、<a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA Community または Ultimate をインストール</a>してください。
    </p>
</chapter>
<chapter title="新規プロジェクトの作成" id="new-project">
    <p>
        既存のプロジェクトに手動で Ktor クライアントを <Links href="//client-create-and-configure" summary="Ktor クライアントの作成と構成方法について学びます。">作成および構成</Links>することもできますが、ゼロから始める便利な方法は、IntelliJ IDEA に同梱されている Kotlin プラグインを使用して新しいプロジェクトを生成することです。
    </p>
    <p>
        新しい Kotlin プロジェクトを作成するには、<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEA を開き</a>、以下の手順に従います。
    </p>
    <procedure>
        <step>
            <p>
                ウェルカム画面で <control>New Project</control> をクリックします。
            </p>
            <p>
                または、メインメニューから <ui-path>File | New | Project</ui-path> を選択します。
            </p>
        </step>
        <step>
            <p>
                <control>New Project</control> ウィザードで、左側のリストから <control>Kotlin</control> を選択します。
            </p>
        </step>
        <step>
            <p>
                右側のペインで、以下の設定を指定します。
            </p>
            <img src="client_get_started_new_project.png" alt="IntelliJ IDEA の New Kotlin project ウィンドウ"
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
                        <control>Location</control>: プロジェクトのディレクトリを指定します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Build system</control>: <control>Gradle</control> が選択されていることを確認します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Gradle DSL</control>: <control>Kotlin</control> を選択します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Add sample code</control>: 生成されるプロジェクトにサンプルコードを含めるために、このオプションを選択します。
                    </p>
                </li>
            </list>
        </step>
        <step>
            <p>
                <control>Create</control> をクリックし、IntelliJ IDEA がプロジェクトを生成して依存関係をインストールするまで待ちます。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="依存関係の追加" id="add-dependencies">
    <p>
        Ktor クライアントに必要な依存関係を追加しましょう。
    </p>
    <procedure>
        <step>
            <p>
                <Path>gradle.properties</Path> ファイルを開き、Ktor のバージョンを指定するために次の行を追加します。
            </p>
            <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
            <note id="eap-note">
                <p>
                    Ktor の EAP バージョンを使用するには、<a href="#repositories">Space リポジトリ</a>を追加する必要があります。
                </p>
            </note>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path> ファイルを開き、dependencies ブロックに次のアーティファクトを追加します。
            </p>
            <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
            <list>
                <li><code>ktor-client-core</code> は、メインのクライアント機能を提供するコア依存関係です。</li>
                <li>
                    <code>ktor-client-cio</code> は、ネットワークリクエストを処理する <Links href="//client-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links> のための依存関係です。
                </li>
            </list>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path> ファイルの右上隅にある <control>Load Gradle Changes</control> アイコンをクリックして、新しく追加された依存関係をインストールします。
            </p>
            <img src="client_get_started_load_gradle_changes_name.png" alt="Load Gradle Changes" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="クライアントの作成" id="create-client">
    <p>
        クライアントの実装を追加するには、<Path>src/main/kotlin</Path> に移動し、以下の手順に従います。
    </p>
    <procedure>
        <step>
            <p>
                <Path>Main.kt</Path> ファイルを開き、既存のコードを次の実装に置き換えます。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
            <p>
                Ktor では、クライアントは <a
                    href="https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a> クラスによって表されます。
            </p>
        </step>
        <step>
            <p>
                <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a> メソッドを使用して <Links href="//client-requests" summary="リクエストの作成方法と、リクエスト URL、HTTP メソッド、ヘッダー、リクエスト本文などのさまざまなリクエストパラメータの指定方法について学びます。">GET リクエストを送信</Links>します。
                <Links href="//client-responses" summary="レスポンスの受信、レスポンス本文の取得、レスポンスパラメータの取得方法について学びます。">レスポンス</Links> は <code>HttpResponse</code> クラスのオブジェクトとして受け取ります。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
            <p>
                上記のコードを追加すると、IDE は <code>get()</code> 関数に対して次のエラーを表示します。
                <emphasis>Suspend function 'get' should be called only from a coroutine or another suspend
                    function
                </emphasis>（Suspend 関数 'get' は、コルーチンまたは別の suspend 関数からのみ呼び出す必要があります）。
            </p>
            <img src="client_get_started_suspend_error.png" alt="Suspend 関数のエラー" width="706"/>
            <p>
                これを修正するには、<code>main()</code> 関数を <code>suspend</code> にする必要があります。
            </p>
            <tip>
                <code>suspend</code> 関数の呼び出しについての詳細は、<a
                    href="https://kotlinlang.org/docs/coroutines-basics.html">コルーチンの基本</a>を参照してください。
            </tip>
        </step>
        <step>
            <p>
                IntelliJ IDEA で、定義の横にある赤い電球をクリックし、<control>Make main suspend</control> を選択します。
            </p>
            <img src="client_get_started_suspend_error_fix.png" alt="main を suspend にする" width="706"/>
        </step>
        <step>
            <p>
                <code>println()</code> 関数を使用してサーバーから返された <a href="#status">ステータスコード</a> を出力し、<code>close()</code> 関数を使用してストリームを閉じ、関連するリソースを解放します。
                <Path>Main.kt</Path> ファイルは次のようになります。
            </p>
            <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
        </step>
    </procedure>
</chapter>
<chapter title="アプリケーションの実行" id="make-request">
    <p>
        アプリケーションを実行するには、<Path>Main.kt</Path> ファイルに移動し、以下の手順に従います。
    </p>
    <procedure>
        <step>
            <p>
                IntelliJ IDEA で、<code>main()</code> 関数の横にあるガターアイコンをクリックし、<control>Run 'MainKt'</control> を選択します。
            </p>
            <img src="client_get_started_run_main.png" alt="アプリケーションの実行" width="706"/>
        </step>
        <step>
            IntelliJ IDEA がアプリケーションを実行するまで待ちます。
        </step>
        <step>
            <p>
                IDE の下部にある <control>Run</control> ペインに出力が表示されます。
            </p>
            <img src="client_get_started_run_output_with_warning.png" alt="サーバーのレスポンス" width="706"/>
            <p>
                サーバーは <code>200 OK</code> メッセージを返しますが、SLF4J が <code>StaticLoggerBinder</code> クラスを見つけられず、デフォルトで NOP（何もしない）ロガー実装が使用されることを示すエラーメッセージも表示されます。これは事実上、ロギングが無効であることを意味します。
            </p>
            <p>
                これで、動作するクライアントアプリケーションが作成されました。ただし、この警告を修正し、ロギングを使用して HTTP 呼び出しをデバッグできるようにするには、<a href="#enable-logging">追加の手順</a>が必要です。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="ロギングの有効化" id="enable-logging">
    <p>
        Ktor は JVM 上のロギングに SLF4J 抽象化レイヤーを使用しているため、ロギングを有効にするには <a href="https://logback.qos.ch/">Logback</a> などの <a href="#jvm">ロギングフレームワークを提供</a> する必要があります。
    </p>
    <procedure id="enable-logging-procedure">
        <step>
            <p>
                <Path>gradle.properties</Path> ファイルで、ロギングフレームワークのバージョンを指定します。
            </p>
            <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path> ファイルを開き、dependencies ブロックに次のアーティファクトを追加します。
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
        </step>
        <step>
            <control>Load Gradle Changes</control> アイコンをクリックして、新しく追加された依存関係をインストールします。
        </step>
        <step>
            <p>
                IntelliJ IDEA で、再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 再実行アイコン"/>) をクリックしてアプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                エラーが表示されなくなり、IDE 下部の <control>Run</control> ペインに同じ <code>200 OK</code> メッセージが表示されるはずです。
            </p>
            <img src="client_get_started_run_output.png" alt="サーバーのレスポンス" width="706"/>
            <p>
                これでロギングが有効になりました。ログの表示を開始するには、ロギング構成を追加する必要があります。
            </p>
        </step>
        <step>
            <p><Path>src/main/resources</Path> に移動し、以下の実装を持つ新しい <Path>logback.xml</Path> ファイルを作成します。
            </p>
            <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            &lt;appender-ref ref=&quot;APPENDER&quot;/&gt;&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
        </step>
        <step>
            <p>
                IntelliJ IDEA で、再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 再実行アイコン"/>) をクリックしてアプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                <control>Run</control> ペイン内の出力されたレスポンスの上に、トレースログが表示されるはずです。
            </p>
            <img src="client_get_started_run_output_with_logs.png" alt="サーバーのレスポンス" width="706"/>
        </step>
    </procedure>
    <tip>
        Ktor は、<Links href="//client-logging" summary="必要な依存関係: io.ktor:ktor-client-logging">Logging</Links> プラグインを通じて HTTP 呼び出しのログを追加するシンプルで直接的な方法を提供します。一方、構成ファイルを追加すると、複雑なアプリケーションでのロギングの動作を微調整できます。
    </tip>
</chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        この構成をより深く理解し拡張するために、<Links href="//client-create-and-configure" summary="Ktor クライアントの作成と構成方法について学びます。">Ktor クライアントの作成と構成</Links> 方法を確認してください。
    </p>
</chapter>
</topic>