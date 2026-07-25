<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   title="新しいKtorプロジェクトの作成、オープン、実行"
   id="server-create-a-new-project"
   help-id="server_create_a_new_project">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-get-started"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    Ktorを使用してサーバーアプリケーションをオープン、実行、およびテストする方法を学びます。
</link-summary>
<web-summary>
    最初のKtorサーバーアプリケーションの構築を開始しましょう。このチュートリアルでは、新しいKtorプロジェクトの作成、オープン、および実行方法を学びます。
</web-summary>
<p>
    このチュートリアルでは、最初のKtorサーバープロジェクトを作成、オープン、および実行する方法を学びます。プロジェクトが起動して実行されたら、一連のタスクを完了してKtorに慣れることができます。
</p>
<p>
    これは、Ktorを使用したサーバーアプリケーション構築を開始するための一連のチュートリアルの最初のステップです。各チュートリアルは独立して行うことができますが、以下の推奨される順序に従うことを強くお勧めします。
</p>
<list type="decimal">
    <li>新しいKtorプロジェクトの作成、オープン、実行。</li>
    <li><Links href="//server-requests-and-responses" summary="タスク管理アプリケーションを構築することで、Ktorを使用したKotlinでのルーティング、リクエスト処理、およびパラメータの基本を学びます。">リクエストの処理とレスポンスの生成</Links>。</li>
    <li><Links href="//server-create-restful-apis" summary="JSONファイルを生成するRESTful APIの例を特徴とする、KotlinとKtorを使用したバックエンドサービスの構築方法を学びます。">JSONを生成するRESTful APIの作成</Links>。</li>
    <li><Links href="//server-create-website" summary="KtorとThymeleafテンプレートを使用してKotlinでウェブサイトを構築する方法を学びます。">Thymeleafテンプレートを使用したウェブサイトの作成</Links>。</li>
    <li><Links href="//server-create-websocket-application" summary="WebSocketのパワーを活用してコンテンツを送信および受信する方法を学びます。">WebSocketアプリケーションの作成</Links>。</li>
    <li><Links href="//server-integrate-database" summary="Exposed SQLライブラリを使用して、Ktorサービスをデータベースリポジトリに接続するプロセスを学びます。">Exposedを使用したデータベースの統合</Links>。</li>
</list>
<chapter id="create-project" title="新しいKtorプロジェクトの作成">
    <p>
        新しいKtorプロジェクトを作成する最も速い方法の1つは、<a href="#create-project-with-the-ktor-project-generator">ウェブベースのKtorプロジェクトジェネレーターを使用すること</a>です。
    </p>
    <p>
        あるいは、<a href="#create_project_with_intellij">IntelliJ IDEA Ultimate専用のKtorプラグイン</a>または<a href="#create_project_with_ktor_cli_tool">Ktor CLIツール</a>を使用してプロジェクトを生成することもできます。
    </p>
    <chapter title="Ktorプロジェクトジェネレーターの使用"
             id="create-project-with-the-ktor-project-generator">
        <p>
            Ktorプロジェクトジェネレーターで新しいプロジェクトを作成するには、以下の手順に従ってください。
        </p>
        <procedure>
            <step>
                <p><a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a>にアクセスします。</p>
            </step>
            <step>
                <p>
                    <control>Project artifact</control>フィールドに、プロジェクトアーティファクトの名前として
                    <Path>com.example.ktor-sample</Path>
                    と入力します。
                    <img src="ktor_343_project_generator_new_project_artifact_name.png"
                         alt="Project Artifact名にcom.example.ktor-sampleを指定したKtorプロジェクトジェネレーター"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step id="configure-project-step">
                <p>
                    <control>Configure</control>をクリックして、設定ドロップダウンメニューを開きます。
                    <img src="ktor_343_project_generator_new_project_configure.png"
                         style="block"
                         alt="Ktorプロジェクト設定の展開ビュー" border-effect="line" width="706"/>
                </p>
                <p>
                    以下の設定が利用可能です：
                </p>
                <list>
                    <li>
                        <p>
                            <control>Build System</control>：
                            希望する<Links href="//server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学びます。">ビルドシステム</Links>を選択します。
                            これは<emphasis>Gradle Kotlin</emphasis>、<emphasis>Gradle Groovy</emphasis>、<emphasis>Maven</emphasis>、または<emphasis>Amper</emphasis>にすることができます。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Engine</control>：
                            サーバーの実行に使用される<Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>を選択します。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Configuration</control>：
                            サーバーパラメータを<Links href="//server-configuration-file" summary="構成ファイルでさまざまなサーバーパラメータを構成する方法を学びます。">YAMLまたはHOCONファイルで指定</Links>するか、<Links href="//server-configuration-code" summary="コード内でさまざまなサーバーパラメータを構成する方法を学びます。">コード内で指定</Links>するかを選択します。
                        </p>
                        <warning>
                            現在、MavenベースのKtorプロジェクトではYAML構成はサポートされていません。
                        </warning>
                    </li>
                </list>
                <p>このチュートリアルでは、これらの設定はデフォルト値のままで構いません。</p>
            </step>
            <step>
                <p>
                    <control>Done</control>をクリックして構成を保存し、メニューを閉じます。
                </p>
            </step>
            <step>
                <p>
                    その下には、プロジェクトに追加できる一連の<Links href="//server-plugins" summary="プラグインは、シリアル化、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>が表示されます。プラグインは、認証、シリアル化とコンテンツエンコーディング、圧縮、Cookieのサポートなど、Ktorアプリケーションで一般的な機能を提供する構成要素です。
                </p>
                <p>このチュートリアルでは、現段階でプラグインを追加する必要はありません。</p>
            </step>
            <step>
                <p>
                    <control>Download</control>ボタンをクリックして、Ktorプロジェクトを生成してダウンロードします。
                    <img src="ktor_343_project_generator_new_project_download.png"
                         alt="Ktorプロジェクトジェネレーターのダウンロードボタン"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <p>ダウンロードが自動的に開始されます。</p>
        </procedure>
        <p>新しいプロジェクトが生成されたので、続けて<a href="#unpacking">Ktorプロジェクトの展開と実行</a>に進んでください。</p>
    </chapter>
    <chapter title="IntelliJ IDEA Ultimate用のKtorプラグインの使用" id="create_project_with_intellij"
             collapsible="true">
        <p>
            このセクションでは、IntelliJ IDEA Ultimate用の<a href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktorプラグイン</a>を使用したプロジェクトのセットアップについて説明します。
        </p>
        <p>
            新しいKtorプロジェクトを作成するには、<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEAを開き</a>、以下の手順に従ってください。
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
                    <control>New Project</control>ウィザードで、左側のリストから<control>Ktor</control>を選択します。
                </p>
            </step>
            <step>
                <p>
                    右側のペインで、以下の設定を指定できます。
                </p>
                <img src="ktor_idea_new_project_settings.png" alt="Ktorプロジェクト設定" width="706"
                     border-effect="rounded"/>
                <list>
                    <li>
                        <p>
                            <control>Name</control>：プロジェクト名を指定します。プロジェクトの名前として<Path>ktor-sample</Path>と入力します。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Location</control>：プロジェクトのディレクトリを指定します。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Website</control>：パッケージ名の生成に使用されるドメインを指定します。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Artifact</control>：このフィールドには生成されたアーティファクト名が表示されます。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Engine</control>：サーバーの実行に使用される<Links href="//server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>を選択します。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Include samples</control>：プラグインのサンプルコードを追加するには、このオプションを有効にしたままにします。
                        </p>
                    </li>
                </list>
            </step>
            <step>
                <p>
                    <control>Advanced Settings</control>をクリックして、追加設定メニューを展開します。
                </p>
                <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktorプロジェクト詳細設定"
                     width="706" border-effect="rounded"/>
                <p>
                    以下の設定が利用可能です：
                </p>
                <list>
                    <li>
                        <p>
                            <control>Build System</control>：
                            希望する<Links href="//server-dependencies" summary="既存のGradle/MavenプロジェクトにKtorサーバーの依存関係を追加する方法を学びます。">ビルドシステム</Links>を選択します。
                            これは<emphasis>Gradle Kotlin</emphasis>、<emphasis>Gradle Groovy</emphasis>、<emphasis>Maven</emphasis>、または<emphasis>Amper</emphasis>にすることができます。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Ktor version</control>：
                            必要なKtorバージョンを選択します。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Configuration</control>：
                            サーバーパラメータを<Links href="//server-configuration-file" summary="構成ファイルでさまざまなサーバーパラメータを構成する方法を学びます。">YAMLまたはHOCONファイルで指定</Links>するか、<Links href="//server-configuration-code" summary="コード内でさまざまなサーバーパラメータを構成する方法を学びます。">コード内で指定</Links>するかを選択します。
                        </p>
                        <warning>
                            現在、Mavenベース의 KtorプロジェクトではYAML構成はサポートされていません。
                        </warning>
                    </li>
                </list>
                <p>このチュートリアルでは、これらの設定はデフォルト値のままで構いません。</p>
            </step>
            <step>
                <p>
                    <control>Next</control>をクリックして次のページに進みます。
                </p>
                <img src="ktor_idea_new_project_plugins_list.png" alt="Ktorプラグイン" width="706"
                     border-effect="rounded"/>
                <p>
                    このページでは、一連の<Links href="//server-plugins" summary="プラグインは、シリアル化、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>（認証、シリアル化とコンテンツエンコーディング、圧縮、Cookieのサポートなど、Ktorアプリケーションの一般的な機能を提供する構成要素）を選択できます。
                </p>
                <p>このチュートリアルでは、現段階でプラグインを追加する必要はありません。</p>
            </step>
            <step>
                <p>
                    <control>Create</control>をクリックし、IntelliJ IDEAがプロジェクトを生成して依存関係をインストールするまで待ちます。
                </p>
            </step>
        </procedure>
        <p>
            新しいプロジェクトを作成したので、続けてアプリケーションの<a href="#open-explore-run">オープン、探索、および実行</a>方法を学習してください。
        </p>
    </chapter>
    <chapter title="Ktor CLIツールの使用" id="create_project_with_ktor_cli_tool"
             collapsible="true">
        <p>
            このセクションでは、<a href="https://github.com/ktorio/ktor-cli">Ktor CLIツール</a>を使用したプロジェクトのセットアップについて説明します。
        </p>
        <p>
            新しいKtorプロジェクトを作成するには、お好みのターミナルを開き、以下の手順に従ってください。
        </p>
        <procedure>
            <step>
                以下のいずれかのコマンドを使用して、Ktor CLIツールをインストールします。
                <Tabs>
                    <TabItem title="macOS/Linux" id="macos-linux">
                        <code-block lang="console" code="                                brew install ktor"/>
                    </TabItem>
                    <TabItem title="Windows" id="windows">
                        <code-block lang="console" code="                                winget install JetBrains.KtorCLI"/>
                    </TabItem>
                </Tabs>
            </step>
            <step>
                対話モードで新しいプロジェクトを生成するには、次のコマンドを使用します。
                <code-block lang="console" code="                      ktor new"/>
            </step>
            <step>
                プロジェクト名として<Path>ktor-sample</Path>と入力します。
                <img src="server_create_cli_tool_name_dark.png"
                     alt="対話モードでのKtor CLIツールの使用"
                     border-effect="rounded"
                     style="block"
                     width="706"/>
                <p>
                    （オプション）プロジェクト名の下の<ui-path>Location</ui-path>パスを編集することで、プロジェクトが保存される場所を変更することもできます。
                </p>
            </step>
            <step>
                <shortcut>Enter</shortcut>を押して続行します。
            </step>
            <step>
                次のステップでは、プロジェクトに<Links href="//server-plugins" summary="プラグインは、シリアル化、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>を検索して追加できます。プラグインは、認証、シリアル化とコンテンツエンコーディング、圧縮、Cookieのサポートなど、Ktorアプリケーションで一般的な機能を提供する構成要素です。
                <img src="server_create_cli_tool_add_plugins_dark.png"
                     alt="Ktor CLIツールを使用したプロジェクトへのプラグインの追加"
                     border-effect="rounded"
                     style="block"
                     width="706"/>
                <p>このチュートリアルでは、現段階でプラグインを追加する必要はありません。</p>
            </step>
            <step>
                <shortcut>CTRL+G</shortcut>を押してプロジェクトを生成します。
                <p>
                    あるいは、<control>CREATE PROJECT (CTRL+G)</control>を選択して<shortcut>Enter</shortcut>を押すことでもプロジェクトを生成できます。
                </p>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="Ktorプロジェクトの展開と実行" id="unpacking">
    <p>
        このセクションでは、コマンドラインからプロジェクトを展開、ビルド、および実行する方法を学びます。以下の手順は、次のような状況を想定しています。
    </p>
    <list type="bullet">
        <li><Path>ktor-sample</Path>という名前のGradleプロジェクトを作成し、ダウンロードした。</li>
        <li>このプロジェクトは、ホームディレクトリの<Path>myprojects</Path>というフォルダに配置されている。</li>
    </list>
    <p>必要に応じて、自身のセットアップに合わせて名前とパスを変更してください。</p>
    <p>お好みのコマンドラインツールを開き、以下の手順に従います。</p>
    <procedure>
        <step>
            <p>ターミナルウィンドウで、プロジェクトをダウンロードしたフォルダに移動します。</p>
            <code-block lang="console" code="                    cd ~/myprojects"/>
        </step>
        <step>
            <p>ZIPアーカイブを同名のフォルダに展開します。</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                </TabItem>
                <TabItem title="Windows" group-key="windows">
                    <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                </TabItem>
            </Tabs>
            <p>ディレクトリには、ZIPアーカイブと展開されたフォルダが含まれるようになります。</p>
        </step>
        <step>
            <p>ディレクトリから、新しく作成されたフォルダに移動します。</p>
            <code-block lang="console" code="                    cd ktor-sample"/>
        </step>
        <step>
            <p>macOSおよびUNIXシステムでは、システムが実行可能なコマンドとして認識できるように、Gradleヘルパースクリプトを実行可能にする必要があります。これを行うには、<code>chmod</code>コマンドを使用します。</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            chmod +x ./gradlew"/>
                </TabItem>
            </Tabs>
        </step>
        <step>
            <p>プロジェクトをビルドするには、次のコマンドを使用します。</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            ./gradlew build"/>
                </TabItem>
                <TabItem title="Windows" group-key="windows">
                    <code-block lang="console" code="                            gradlew build"/>
                </TabItem>
            </Tabs>
            <p>ビルドが成功したら、次のステップに進んでプロジェクトを実行します。</p>
        </step>
        <step>
            <p>プロジェクトを実行するには、次のコマンドを使用します。</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            ./gradlew run"/>
                </TabItem>
                <TabItem title="Windows" group-key="windows">
                    <code-block lang="console" code="                            gradlew run"/>
                </TabItem>
            </Tabs>
        </step>
        <step>
            <p>プロジェクトが実行されていることを確認するには、ターミナル出力に表示されているURL（<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）をブラウザで開きます。
                ブラウザに「Hello World!」というメッセージが表示されるはずです。</p>
            <img src="server_get_started_ktor_sample_app_output.png" alt="生成されたKtorプロジェクトの出力"
                 border-effect="line" width="706"/>
        </step>
    </procedure>
    <p>おめでとうございます！Ktorプロジェクトの起動に成功しました。</p>
    <note>
        基盤となるプロセスがKtorアプリケーションの実行でビジー状態であるため、コマンドラインが応答しなくなることに注意してください。<shortcut>CTRL+C</shortcut>を押すとアプリケーションを終了できます。
    </note>
</chapter>
<chapter title="IntelliJ IDEAでのKtorプロジェクトのオープン、探索、および実行" id="open-explore-run">
    <chapter title="プロジェクトをオープンする" id="open">
        <p><a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>がインストールされている場合は、コマンドラインから簡単にプロジェクトを開くことができます。
        </p>
        <p>
            プロジェクトフォルダ内にいることを確認し、<code>idea</code>コマンドに続けて、現在のフォルダを表すピリオドを入力します。
        </p>
        <code-block lang="Bash" code="                idea ."/>
        <p>
            または、手動でプロジェクトを開くには、IntelliJ IDEAを起動します。
        </p>
        <p>
            ウェルカム画面が開いた場合は、<control>Open</control>をクリックします。そうでない場合は、メインメニューの<ui-path>File | Open</ui-path>に移動し、<Path>ktor-sample</Path>フォルダを選択して開きます。
        </p>
        <tip>
            プロジェクトの管理に関する詳細は、<a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEAのドキュメント</a>を参照してください。
        </tip>
    </chapter>
    <chapter title="プロジェクトを探索する" id="explore">
        <p>プロジェクトを開くと、次のような構造が表示されます。</p>
        <img src="tutorial_server_get_started_idea_project_view.png" alt="IDEでの生成されたKtorプロジェクトビュー" width="706"/>
        <p>
            完全なレイアウトを表示するには、各フォルダの横にある展開矢印をクリックして、<control>Project</control>ビューのフォルダを展開します。
        </p>
        <p>
            アプリケーションのソースコードは、<Path>src/main/kotlin</Path>の下にあります。デフォルトで、<Path>Application.kt</Path>と<Path>Routing.kt</Path>という2つのファイルが作成されます。
        </p>
        <img src="tutorial_server_get_started_idea_main_folder.png" alt="Ktorプロジェクトのsrcフォルダ構造" width="400"/>
        <p>プロジェクト名は<Path>settings.gradle.kts</Path>ファイルで構成されています。
        </p>
        <code-block lang="kotlin" code="rootProject.name = &quot;ktor-sample&quot;"/>
        <p>
            構成ファイルやその他の種類のコンテンツは、<Path>src/main/resources</Path>フォルダ内に配置されます。
        </p>
        <img src="tutorial_server_get_started_idea_resources_folder.png" alt="Ktorプロジェクトのresourcesフォルダ構造"
             width="400"/>
    </chapter>
    <chapter title="プロジェクトを実行する" id="run">
        <procedure>
            <p>IntelliJ IDEA内からプロジェクトを実行するには：</p>
            <step>
                <p>右側のサイドバーにあるGradleアイコン（<img alt="IntelliJ IDEA Gradleアイコン"
                                                  src="intellij_idea_gradle_icon.svg" width="16" height="26"/>）をクリックして、<a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradleツールウィンドウ</a>を開きます。</p>
            </step>
            <step>
                <p>このツールウィンドウ内で、<ui-path>Tasks | application</ui-path>に移動し、<control>run</control>タスクをダブルクリックします。
                </p>
                <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEAのGradleタブ"
                     border-effect="line" width="450"/>
            </step>
            <step>
                <p>KtorアプリケーションがIDEの下部にある<a href="https://www.jetbrains.com/help/idea/run-tool-window.html">実行（Run）ツールウィンドウ</a>で起動します。</p>
                <img src="tutorial_server_get_started_idea_run_terminal.png" alt="ターミナルで実行中のプロジェクト" width="706"/>
                <p>以前にコマンドラインに表示されていたものと同じメッセージが、<ui-path>Run</ui-path>ツールウィンドウに表示されます。
                </p>
            </step>
            <step>
                <p>プロジェクトが実行されていることを確認するには、指定されたURL（<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）をブラウザで開きます。</p>
                <p>画面に「Hello World!」というメッセージが再び表示されるはずです。</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="ブラウザ画面のHello World"
                     width="706"/>
            </step>
        </procedure>
        <p>
            <ui-path>Run</ui-path>ツールウィンドウを介してアプリケーションを管理できます。
        </p>
        <list type="bullet">
            <li>
                アプリケーションを終了するには、停止ボタン（<img src="intellij_idea_terminate_icon.svg"
                                                     style="inline" height="16" width="16"
                                                     alt="IntelliJ IDEA終了アイコン"/>）をクリックします。
            </li>
            <li>
                プロセスを再起動するには、再実行ボタン（<img src="intellij_idea_rerun_icon.svg"
                                                  style="inline" height="16" width="16"
                                                  alt="IntelliJ IDEA再実行アイコン"/>）をクリックします。
            </li>
        </list>
        <p>
            これらのオプションの詳細については、<a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA実行ツールウィンドウのドキュメント</a>を参照してください。
        </p>
    </chapter>
</chapter>
<chapter title="試してみるべき追加タスク" id="additional-tasks">
    <p>試してみることをお勧めする追加タスクをいくつか紹介します：</p>
    <list type="decimal">
        <li><a href="#change-the-default-port">デフォルトポートの変更</a></li>
        <li><a href="#add-a-new-http-endpoint">新しいHTTPエンドポイントの追加</a></li>
        <li><a href="#configure-static-content">静的コンテンツの構成</a></li>
        <li><a href="#write-an-integration-test">統合テストの作成</a></li>
        <li><a href="#register-error-handlers">エラーハンドラーの登録</a></li>
    </list>
    <p>
        これらのタスクは互いに依存していませんが、徐々に難易度が上がっていきます。宣言された順序で試すことが、段階的に学習するための最も簡単な方法です。簡単にするため、また重複を避けるため、以下の説明はタスクを順番に試していることを前提としています。
    </p>
    <p>
        コーディングが必要な箇所については、コードと対応するインポートの両方を指定しています。IDEがこれらのインポートを自動的に追加してくれる場合もあります。
    </p>
    <chapter title="デフォルトポートの変更" id="change-the-default-port">
        <chapter title="構成ファイルでのポート変更" id="change-the-port-in-config">
            <p>
                構成を外部のYAMLまたはHOCONファイルに保存することを選択した場合、<ui-path>Project</ui-path>ビューで<Path>src/main/resources</Path>フォルダに移動し、以下の手順に従います。
            </p>
            <procedure id="change-default-port-yaml-procedure">
                <step>
                    構成ファイル（<Path>application.yaml</Path>または<Path>application.conf</Path>）を開きます。次のようになっているはずです：
                    <Tabs>
                        <TabItem title="application.yaml (YAML)" group-key="yaml">
                            <code-block lang="yaml" code="ktor:&#10;  deployment:&#10;    port: 8080&#10;  application:&#10;    modules:&#10;      - com.example.RoutingKt.configureRouting"/>
                        </TabItem>
                        <TabItem title="application.conf (HOCON)" group-key="hocon">
                            <code-block lang="generic" code="ktor {&#10;  deployment {&#10;    port = 8080&#10;    port = ${?PORT}&#10;  }&#10;  application {&#10;    modules = [&#10;      com.example.RoutingKt.configureRouting&#10;    ]&#10;  }&#10;}"/>
                        </TabItem>
                    </Tabs>
                </step>
                <step>
                    ファイル内の<code>port</code>の値を、<code>9292</code>など、任意の見慣れない番号に変更します。
                </step>
                <step>
                    <p>再実行ボタン（<img alt="IntelliJ IDEA再実行ボタンアイコン"
                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>アプリケーションが新しいポート番号で実行されていることを確認するには、新しいURL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）をブラウザで開くか、<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEAで新しいHTTPリクエストファイルを作成</a>します。</p>
                    <img src="tutorial_server_get_started_port_change.png"
                         alt="IntelliJ IDEAのHTTPリクエストファイルを使用したポート変更のテスト" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="コード内でのポート変更" id="change-the-port-in-code">
            <p>
                <a href="#configure-project-step">新しいKtorプロジェクトを作成する際</a>、構成をコード内に保存するか、外部のYAMLまたはHOCONファイルに保存するかを選択できます。
            </p>
            <p>
                構成をコード内に保存することを選択した場合、<ui-path>Project</ui-path>ビューで<Path>src/main/kotlin</Path>フォルダに移動し、以下の手順に従います。
            </p>
            <procedure id="change-the-default-port-code-procedure">
                <step>
                    <p><Path>main.kt</Path>ファイルを開きます。次のようなコードが見つかるはずです。
                    </p>
                    <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                </step>
                <step>
                    <p><code>embeddedServer()</code>関数内で、<code>port</code>パラメータを<code>9292</code>など、任意の別の番号に変更します。</p>
                    <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                </step>
                <step>
                    <p>再実行ボタン（<img alt="IntelliJ IDEA再実行ボタンアイコン"
                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>アプリケーションが新しいポート番号で実行されていることを確認するには、新しいURL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）をブラウザで開くか、<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEAで新しいHTTPリクエストファイルを作成</a>します。</p>
                    <img src="tutorial_server_get_started_port_change.png"
                         alt="IntelliJ IDEAのHTTPリクエストファイルを使用したポート変更のテスト" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="新しいHTTPエンドポイントの追加" id="add-a-new-http-endpoint">
        <p>
            <ui-path>Project</ui-path>ツールウィンドウで、<Path>src/main/kotlin</Path>フォルダに移動し、以下の手順に従います。
        </p>
        <procedure>
            <step>
                <p><Path>Routing.kt</Path>ファイルを開きます。次のようなコードが表示されるはずです：
                </p>
                <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
            </step>
            <step>
                <p>新しいエンドポイントを作成するには、次のように追加のルートを挿入します。</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                <note><code>/test1</code>というURLは、好きなものに変更できることに注意してください。</note>
            </step>
            <step>
                <p>IDEは自動的に<code>ContentType</code>のインポートを追加します。</p>
                <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
            </step>
            <step>
                <p>再実行ボタン（<img alt="IntelliJ IDEA再実行ボタンアイコン"
                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
            </step>
            <step>
                <p>ブラウザで新しいURL（<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>）をリクエストします。ポート番号は、<a href="#change-the-default-port">デフォルトポートの変更</a>タスクを完了したかどうかによって異なります。以下のような出力が表示されるはずです。</p>
                <img src="server_get_started_add_new_http_endpoint_output.png"
                     alt="ブラウザ画面にHello from Ktorが表示されている様子" width="706"/>
                <p>HTTPリクエストファイルを作成した場合は、そこでも新しいエンドポイントを確認できます。</p>
                <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                <note>異なるリクエストを区切るには、3つのハッシュ（<code>###</code>）を含む行が必要であることに注意してください。</note>
            </step>
        </procedure>
    </chapter>
    <chapter title="静的コンテンツの構成" id="configure-static-content">
        <p><ui-path>Project</ui-path>ツールウィンドウで、<Path>src/main/kotlin</Path>フォルダに移動し、以下の手順に従います。
        </p>
        <procedure>
            <step>
                <p><Path>Routing.kt</Path>ファイルを開き、ルーティングセクションに次のルートを追加します。</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                <p>この行の意味は次のとおりです：</p>
                <list type="bullet">
                    <li><code>staticResources()</code>を呼び出すことで、アプリケーションがHTMLやJavaScriptファイルなどの標準的なウェブサイトコンテンツを提供できるようになります。このコンテンツはブラウザ内で実行できますが、サーバーの観点からは静的であると見なされます。
                    </li>
                    <li>URL <code>/content</code>は、このコンテンツを取得するために使用されるパスを指定します。
                    </li>
                    <li>パス <code>mycontent</code>は、静的コンテンツを配置するフォルダの名前です。Ktorは、このフォルダを<code>resources</code>ディレクトリ内で探します。
                    </li>
                </list>
            </step>
            <step>
                <p>IDEが自動的に追加しない場合は、次のインポートを追加してください。</p>
                <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
            </step>
            <step>
                <p><control>Project</control>ツールウィンドウで、<Path>src/main/resources</Path>フォルダを右クリックし、<control>New | Directory</control>を選択します。
                </p>
                <p>または、<Path>src/main/resources</Path>フォルダを選択し、<shortcut>⌘Cmd+N</shortcut>（macOS）または<shortcut>Ctrl+N</shortcut>（Windows/Linux）を押し、<control>Directory</control>をクリックします。
                </p>
            </step>
            <step>
                <p>新しいディレクトリに<code>mycontent</code>という名前を付け、<shortcut>↩Enter</shortcut>を押します。
                </p>
            </step>
            <step>
                <p>新しく作成したフォルダを右クリックし、<control>New | File</control>をクリックします。
                </p>
            </step>
            <step>
                <p>新しいファイルに<Path>sample.html</Path>という名前を付け、<shortcut>↩Enter</shortcut>を押します。
                </p>
            </step>
            <step>
                <p>新しく作成したファイルページに、有効なHTMLを入力します（例）：</p>
                <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>再実行ボタン（<img alt="IntelliJ IDEA再実行ボタンアイコン"
                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
            </step>
            <step>
                <p>ブラウザで<a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a>を開くと、サンプルページの内容が表示されるはずです。</p>
                <img src="server_get_started_configure_static_content_output.png"
                     alt="ブラウザでの静的ページの出力" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="統合テストの作成" id="write-an-integration-test">
        <p>
            Ktorは<Links href="//server-testing" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。">統合テストの作成</Links>をサポートしており、生成されたプロジェクトにはこの機能がバンドルされています。
        </p>
        <p>これを利用するには、以下の手順に従ってください。</p>
        <procedure>
            <step>
                <p>
                    <Path>src/test/kotlin</Path>フォルダに移動します。
                </p>
            </step>
            <step>
                <p><Path>ServerTest.kt</Path>ファイルを開きます。次のコードが表示されるはずです：</p>
                <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // デフォルト構成をロードします&#10;        configure()&#10;        // サーバーのルートが200を返すことを確認します&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                <p><code>testApplication()</code>関数は、Ktorの新しいインスタンスを作成します。このインスタンスは、Nettyなどのサーバーではなく、テスト環境内で実行されます。</p>
                <p>次に、<code>configure()</code>関数を使用して、<code>embeddedServer()</code>から呼び出されるのと同じセットアップを呼び出すことができます。</p>
                <p>最後に、組み込みの<code>client</code>オブジェクトとJUnitアサーションを使用して、サンプルリクエストを送信し、レスポンスを確認できます。</p>
            </step>
        </procedure>
        <p>
            IntelliJ IDEAでテストを実行する標準的な方法のいずれかでテストを実行できます。Ktorの新しいインスタンスを実行しているため、テストの成否はアプリケーションが<code>0.0.0.0</code>で実行されているかどうかには依存しないことに注意してください。
        </p>
        <p>
            <a href="#add-a-new-http-endpoint">新しいHTTPエンドポイントの追加</a>に成功した場合は、この追加のテストを追加してください：
        </p>
        <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
        <p>以下の追加のインポートを追加します：</p>
        <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
    </chapter>
    <chapter title="エラーハンドラーの登録" id="register-error-handlers">
        <p>
            <Links href="//server-status-pages" summary="%plugin_name%を使用すると、Ktorアプリケーションは、スローされた例外やステータスコードに基づいて、あらゆる失敗状態に適切に応答できるようになります。">StatusPagesプラグイン</Links>を使用して、Ktorアプリケーションのエラーを処理できます。
        </p>
        <tip>
            このプラグインは、デフォルトではプロジェクトに含まれていません。Ktorプロジェクトジェネレーター、またはIntelliJ IDEAのプロジェクトウィザードでプロジェクトを作成する際に、<ui-path>Plugins</ui-path>セクションから追加できます。
        </tip>
        <p>
            次のステップでは、プラグインを手動で追加および構成する方法を学びます。これを達成するための4つのステップがあります：
        </p>
        <list type="decimal">
            <li><a href="#add-dependency">Gradleビルドファイルに新しい依存関係を追加する。</a></li>
            <li><a href="#install-plugin-and-specify-handler">プラグインをインストールし、例外ハンドラーを指定する。</a></li>
            <li><a href="#write-sample-code">ハンドラーをトリガーするためのサンプルコードを作成する。</a></li>
            <li><a href="#restart-and-invoke">サンプルコードを再起動して呼び出す。</a></li>
        </list>
        <procedure title="新しい依存関係の追加" id="add-dependency">
            <p><control>Project</control>ツールウィンドウで、プロジェクトのルートフォルダに移動し、以下の手順に従います。
            </p>
            <step>
                <p><Path>build.gradle.kts</Path>ファイルを開き、次のように新しい依存関係を追加します：</p>
                <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // 新しい依存関係を追加&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
            </step>
            <step>
                <p><shortcut>Shift+⌘Cmd+I</shortcut>（macOS）または<shortcut>Ctrl+Shift+O</shortcut>（Windows/Linux）を押して、プロジェクトをリロードします。
                </p>
            </step>
        </procedure>
        <procedure title="プラグインのインストールと例外ハンドラーの指定"
                   id="install-plugin-and-specify-handler">
            <step>
                <p><Path>Routing.kt</Path>の<code>.configureRouting()</code>メソッドに移動し、次のコード行を追加します：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                <p>これらの行は、<code>StatusPages</code>プラグインをインストールし、<code>IllegalStateException</code>型の例外がスローされたときにどのようなアクションを実行するかを指定します。</p>
            </step>
            <step>
                <p>以下のインポートを追加します：</p>
                <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
            </step>
        </procedure>
        <p>
            通常、レスポンスにはHTTPエラーコードが設定されますが、このタスクの目的上、出力はブラウザに直接表示されます。
        </p>
        <procedure title="ハンドラーをトリガーするためのサンプルコードの作成" id="write-sample-code">
            <step>
                <p><code>.configureRouting()</code>メソッド内にとどまり、次のように追加のルートを追加します：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>これで、URL <code>/error-test</code>を持つエンドポイントが追加されました。このエンドポイントがトリガーされると、ハンドラーで使用されている型の例外がスローされます。</p>
            </step>
        </procedure>
        <procedure title="サンプルコードの再起動と呼び出し" id="restart-and-invoke">
            <step>
                <p>再実行ボタン（<img alt="IntelliJ IDEA再実行ボタンアイコン"
                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p></step>
            <step>
                <p>ブラウザで、URL <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a>にアクセスします。次のようにエラーメッセージが表示されるはずです：</p>
                <img src="server_get_started_register_error_handler_output.png"
                     alt="`App in illegal state as Too Busy`というメッセージが表示されたブラウザ画面" width="706"/>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="次のステップ" id="next_steps">
    <p>
        追加タスクの最後まで到達したなら、Ktorサーバーの構成、Ktorプラグインの統合、および新しいルートの実装について理解できたはずです。しかし、これはほんの始まりに過ぎません。Ktorの基礎的な概念をさらに深く掘り下げるには、このガイドの次のチュートリアルに進んでください。
    </p>
    <p>
        次は、<Links href="//server-requests-and-responses" summary="タスク管理アプリケーションを構築することで、Ktorを使用したKotlinでのルーティング、リクエスト処理、およびパラメータの基本を学びます。">タスク管理アプリケーションを作成して、リクエストを処理しレスポンスを生成する方法</Links>を学びます。
    </p>
</chapter>
</topic>