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
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    リクエストを送信し、レスポンスを受信する最初のクライアントアプリケーションを作成します。
</link-summary>
<p>
    Ktorにはマルチプラットフォームの非同期HTTPクライアントが搭載されており、<Links href="/ktor/client-requests" summary="リクエストの作成方法や、リクエストURL、HTTPメソッド、ヘッダー、リクエスト本文など、さまざまなリクエストパラメータの指定方法を学びます。">リクエストを行う</Links>ことや、<Links href="/ktor/client-responses" summary="レスポンスの受信方法、レスポンス本文の取得方法、レスポンスパラメータの取得方法を学びます。">レスポンスを処理する</Links>ことができます。また、<Links href="/ktor/client-plugins" summary="ロギング、シリアライゼーション、認証など、共通機能を提供するプラグインについて理解を深めます。">プラグイン</Links>（例: <Links href="/ktor/client-auth" summary="Authプラグインは、クライアントアプリケーションの認証と認可を処理します。">認証</Links>、<Links href="/ktor/client-serialization" summary="ContentNegotiationプラグインには、クライアントとサーバー間のメディアタイプのネゴシエート、およびリクエストの送信時とレスポンスの受信時に特定の形式でコンテンツをシリアライズ/デシリアライズするという2つの主要な目的があります。">JSONシリアライゼーション</Links>）で機能を拡張することも可能です。
</p>
<p>
    このチュートリアルでは、リクエストを送信してレスポンスを出力する最初のKtorクライアントアプリケーションを作成する方法を示します。
</p>
<chapter title="前提条件" id="prerequisites">
    <p>
        このチュートリアルを開始する前に、
        <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA Community または Ultimate をインストールしてください</a>。
    </p>
</chapter>
<chapter title="新しいプロジェクトの作成" id="new-project">
    <p>
        既存のプロジェクトでKtorクライアントを手動で<Links href="/ktor/client-create-and-configure" summary="Ktorクライアントの作成と構成方法について学びます。">作成および構成</Links>することもできますが、IntelliJ IDEAにバンドルされているKotlinプラグインを使用して新規プロジェクトを生成するのが、ゼロから始める便利な方法です。
    </p>
    <p>
        新しいKotlinプロジェクトを作成するには、
        <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEA を開き</a>、以下の手順に従ってください。
    </p>
    <procedure>
        <step>
            <p>
                ようこそ画面で、<control>新規プロジェクト</control>をクリックします。
            </p>
            <p>
                または、メインメニューから<ui-path>ファイル | 新規 | プロジェクト</ui-path>を選択します。
            </p>
        </step>
        <step>
            <p>
                <control>新規プロジェクト</control>ウィザードで、左側のリストから<control>Kotlin</control>を選択します。
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
                        <control>名前</control>
                        : プロジェクト名を指定します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>場所</control>
                        : プロジェクトのディレクトリを指定します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>ビルドシステム</control>
                        : <control>Gradle</control>が選択されていることを確認します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Gradle DSL</control>
                        : <control>Kotlin</control>を選択します。
                    </p>
                </li>
                <li>
                    <p>
                        <control>サンプルコードを追加</control>
                        : 生成されたプロジェクトにサンプルコードを含めるには、このオプションを選択します。
                    </p>
                </li>
            </list>
        </step>
        <step>
            <p>
                <control>作成</control>をクリックし、IntelliJ IDEAがプロジェクトを生成して依存関係をインストールするまで待ちます。
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
                <Path>gradle.properties</Path>ファイルを開き、Ktorのバージョンを指定するために次の行を追加します。
            </p>
            <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
            <note id="eap-note">
                <p>
                    KtorのEAPバージョンを使用するには、<a href="#repositories">Spaceリポジトリ</a>を追加する必要があります。
                </p>
            </note>
        </step>
        <step>
            <p>
                <Path>build.gradle.kts</Path>ファイルを開き、次のアーティファクトを依存関係ブロックに追加します。
            </p>
            <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
            <list>
                <li><code>ktor-client-core</code>は、主要なクライアント機能を提供するコア依存関係です。
                </li>
                <li>
                    <code>ktor-client-cio</code>は、ネットワークリクエストを処理する<Links href="/ktor/client-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>の依存関係です。
                </li>
            </list>
        </step>
        <step>
            <p>
                新しく追加された依存関係をインストールするには、<Path>build.gradle.kts</Path>ファイルの右上にある<control>Gradleの変更を読み込む</control>アイコンをクリックします。
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
                <Path>Main.kt</Path>ファイルを開き、既存のコードを次の実装に置き換えます。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
            <p>
                Ktorでは、クライアントは<a
                    href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>クラスで表されます。
            </p>
        </step>
        <step>
            <p>
                <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a>メソッドを使用して<Links href="/ktor/client-requests" summary="リクエストの作成方法や、リクエストURL、HTTPメソッド、ヘッダー、リクエスト本文など、さまざまなリクエストパラメータの指定方法を学びます。">GETリクエスト</Links>を行います。
                <Links href="/ktor/client-responses" summary="レスポンスの受信方法、レスポンス本文の取得方法、レスポンスパラメータの取得方法を学びます。">レスポンス</Links>は<code>HttpResponse</code>クラスオブジェクトとして受信されます。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
            <p>
                上記のコードを追加すると、IDEは<code>get()</code>関数に対して次のエラーを表示します。<emphasis>'get' 停止関数はコルーチンまたは別の停止関数からのみ呼び出す必要があります</emphasis>。
            </p>
            <img src="client_get_started_suspend_error.png" alt="停止関数のエラー" width="706"/>
            <p>
                これを修正するには、<code>main()</code>関数を停止関数にする必要があります。
            </p>
            <tip>
                <code>suspend</code>関数の呼び出しについて詳しくは、<a
                    href="https://kotlinlang.org/docs/coroutines-basics.html">コルーチンの基本</a>を参照してください。
            </tip>
        </step>
        <step>
            <p>
                IntelliJ IDEAで、定義の横にある赤い電球をクリックし、<control>メインを停止にする</control>を選択します。
            </p>
            <img src="client_get_started_suspend_error_fix.png" alt="メインを停止にする" width="706"/>
        </step>
        <step>
            <p>
                <code>println()</code>関数を使用してサーバーが返した<a href="#status">ステータスコード</a>を出力し、<code>close()</code>関数を使用してストリームを閉じ、それに関連付けられたリソースを解放します。
                <Path>Main.kt</Path>ファイルは次のようになります。
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
                IntelliJ IDEAで、<code>main()</code>関数の横にあるガターアイコンをクリックし、<control>「MainKt」を実行</control>を選択します。
            </p>
            <img src="client_get_started_run_main.png" alt="アプリケーションの実行" width="706"/>
        </step>
        <step>
            IntelliJ IDEAがアプリケーションを実行するまで待ちます。
        </step>
        <step>
            <p>
                IDEの下部にある<control>実行</control>ペインに出力が表示されます。
            </p>
            <img src="client_get_started_run_output_with_warning.png" alt="サーバーレスポンス" width="706"/>
            <p>
                サーバーは<code>200 OK</code>メッセージで応答しますが、SLF4Jが<code>StaticLoggerBinder</code>クラスを見つけられず、デフォルトで何もしない（NOP）ロガー実装になることを示すエラーメッセージも表示されます。これは実質的にロギングが無効になっていることを意味します。
            </p>
            <p>
                これで動作するクライアントアプリケーションが完成しました。ただし、この警告を修正し、ロギングを使用してHTTP呼び出しをデバッグできるようにするには、<a href="#enable-logging">追加の手順</a>が必要です。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="ロギングの有効化" id="enable-logging">
    <p>
        KtorはJVM上のロギングにSLF4J抽象化レイヤーを使用するため、ロギングを有効にするには、<a href="#jvm">Logback</a>のようなロギングフレームワークを提供する必要があります。
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
                <Path>build.gradle.kts</Path>ファイルを開き、次のアーティファクトを依存関係ブロックに追加します。
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
        </step>
        <step>
            新しく追加された依存関係をインストールするには、<control>Gradleの変更を読み込む</control>アイコンをクリックします。
        </step>
        <step>
            <p>
                IntelliJ IDEAで、再実行ボタン（<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA rerun icon"/>）をクリックしてアプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                エラーは表示されなくなりますが、IDEの下部にある<control>実行</control>ペインには同じ<code>200 OK</code>メッセージが表示されます。
            </p>
            <img src="client_get_started_run_output.png" alt="サーバーレスポンス" width="706"/>
            <p>
                これでロギングが有効になりました。ログを表示するには、ロギング設定を追加する必要があります。
            </p>
        </step>
        <step>
            <p><Path>src/main/resources</Path>に移動し、次の実装で新しい<Path>logback.xml</Path>ファイルを作成します。
            </p>
            <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            undefined&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
        </step>
        <step>
            <p>
                IntelliJ IDEAで、再実行ボタン（<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA rerun icon"/>）をクリックしてアプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                <control>実行</control>ペイン内の出力されたレスポンスの上にトレースログが表示されるはずです。
            </p>
            <img src="client_get_started_run_output_with_logs.png" alt="サーバーレスポンス" width="706"/>
        </step>
    </procedure>
    <tip>
        Ktorは、<Links href="/ktor/client-logging" summary="必要な依存関係: io.ktor:ktor-client-logging コード例: %example_name%">Logging</Links>プラグインを介してHTTP呼び出しのログを追加するシンプルで簡単な方法を提供します。一方、設定ファイルを追加することで、複雑なアプリケーションでのロギング動作を細かく調整できます。
    </tip>
</chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        この構成をよりよく理解し拡張するには、<Links href="/ktor/client-create-and-configure" summary="Ktorクライアントの作成と構成方法について学びます。">Ktorクライアントの作成と構成</Links>方法を調べてみてください。
    </p>
</chapter>
</topic>