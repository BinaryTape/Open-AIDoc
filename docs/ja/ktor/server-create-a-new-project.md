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
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        Ktorでサーバーアプリケーションを開き、実行し、テストする方法を学びます。
    </link-summary>
    <web-summary>
        初めてのKtorサーバーアプリケーションの構築を始めましょう。このチュートリアルでは、新しいKtorプロジェクトを作成、オープン、実行する方法を学びます。
    </web-summary>
    <p>
        このチュートリアルでは、初めてのKtorサーバープロジェクトを作成、オープン、実行する方法を学びます。一度実行できるようになれば、Ktorに慣れるための一連のタスクを試すことができます。
    </p>
    <p>
        これは、Ktorでサーバーアプリケーションの構築を開始するためのチュートリアルシリーズの最初のものです。各チュートリアルは独立して行うこともできますが、推奨される順序に従うことを強くお勧めします。
    </p>
    <list type="decimal">
        <li>新しいKtorプロジェクトを作成、オープン、実行します。</li>
        <li><Links href="/ktor/server-requests-and-responses" summary="タスクマネージャーアプリケーションを構築することで、KtorとKotlinにおけるルーティング、リクエスト処理、およびパラメーターの基本を学びます。">リクエストを処理し、レスポンスを生成する</Links>。</li>
        <li><Links href="/ktor/server-create-restful-apis" summary="KotlinとKtorを使用してバックエンドサービスを構築する方法を、JSONファイルを生成するRESTful APIの例を交えて学びます。">JSONを生成するRESTful APIを作成する</Links>。</li>
        <li><Links href="/ktor/server-create-website" summary="KtorとThymeleafテンプレートを使用してKotlinでウェブサイトを構築する方法を学びます。">Thymeleafテンプレートを使用してウェブサイトを作成する</Links>。</li>
        <li><Links href="/ktor/server-create-websocket-application" summary="WebSocketの機能を活用してコンテンツを送受信する方法を学びます。">WebSocketアプリケーションを作成する</Links>。</li>
        <li><Links href="/ktor/server-integrate-database" summary="Exposed SQLライブラリを使用してKtorサービスをデータベースリポジトリに接続するプロセスを学びます。">Exposedとデータベースを統合する</Links>。</li>
    </list>
    <chapter id="create-project" title="新しいKtorプロジェクトを作成する">
        <p>
            新しいKtorプロジェクトを作成する最も迅速な方法の1つは、<a href="#create-project-with-the-ktor-project-generator">ウェブベースのKtorプロジェクトジェネレーターを使用すること</a>です。
        </p>
        <p>
            または、<a href="#create_project_with_intellij">IntelliJ IDEA Ultimate専用のKtorプラグイン</a>、または<a href="#create_project_with_ktor_cli_tool">Ktor CLIツール</a>を使用してプロジェクトを生成することもできます。
        </p>
        <chapter title="Ktorプロジェクトジェネレーターを使用する"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                Ktorプロジェクトジェネレーターで新しいプロジェクトを作成するには、以下の手順に従います。
            </p>
            <procedure>
                <step>
                    <p><a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a>に移動します。</p>
                </step>
                <step>
                    <p><control>Project artifact</control>フィールドに、プロジェクトアーティファクト名として<Path>com.example.ktor-sample-app</Path>を入力します。
                        <img src="ktor_project_generator_new_project_artifact_name.png"
                             alt="Ktor Project Generator with Project Artifact Name org.example.ktor-sample-app"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p><control>Configure</control>をクリックして、設定ドロップダウンメニューを開きます:
                        <img src="ktor_project_generator_new_project_configure.png"
                             style="block"
                             alt="expanded view of Ktor project settings" border-effect="line" width="706"/>
                    </p>
                    <p>
                        以下の設定が利用可能です:
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>
                                :
                                希望する<Links href="/ktor/server-dependencies" summary="既存のGradle/MavenプロジェクトにKtor Serverの依存関係を追加する方法を学びます。">ビルドシステム</Links>を選択します。これは、
                                KotlinまたはGroovy DSLを使用した<emphasis>Gradle</emphasis>、または<emphasis>Maven</emphasis>のいずれかです。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor version</control>
                                :
                                必要なKtorのバージョンを選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>
                                :
                                サーバーを実行するために使用する<Links href="/ktor/server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>を選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>
                                :
                                サーバーパラメーターを<Links href="/ktor/server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメーターを設定する方法を学びます。">YAMLまたはHOCONファイルで</Links>指定するか、<Links href="/ktor/server-configuration-code" summary="コードでさまざまなサーバーパラメーターを設定する方法を学びます。">コードで</Links>指定するかを選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Include samples</control>
                                :
                                このオプションを有効にしたままにして、プラグインのサンプルコードを追加します。
                            </p>
                        </li>
                    </list>
                    <p>このチュートリアルでは、これらの設定をデフォルト値のままにしておくことができます。</p>
                </step>
                <step>
                    <p><control>Done</control>をクリックして、設定を保存し、メニューを閉じます。</p>
                </step>
                <step>
                    <p>以下に、プロジェクトに追加できる<Links href="/ktor/server-plugins" summary="プラグインは、シリアル化、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>のセットがあります。プラグインは、Ktorアプリケーションで認証、シリアル化とコンテンツエンコーディング、圧縮、Cookieサポートなどの一般的な機能を提供するビルディングブロックです。</p>
                    <p>このチュートリアルでは、この段階でプラグインを追加する必要はありません。</p>
                </step>
                <step>
                    <p>
                        <control>Download</control>ボタンをクリックして、Ktorプロジェクトを生成し、ダウンロードします。
                        <img src="ktor_project_generator_new_project_download.png"
                             alt="Ktor Project Generator download button"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>ダウンロードが自動的に開始されます。</p>
            </procedure>
            <p>新しいプロジェクトを生成したので、次に<a href="#unpacking">Ktorプロジェクトの解凍と実行</a>に進みます。</p>
        </chapter>
        <chapter title="IntelliJ IDEA Ultimate用Ktorプラグインを使用する" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                このセクションでは、IntelliJ IDEA Ultimate用の<a
                    href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktorプラグイン</a>を使用したプロジェクトのセットアップについて説明します。
            </p>
            <p>
                新しいKtorプロジェクトを作成するには、<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEAを開き</a>、以下の手順に従います:
            </p>
            <procedure>
                <step>
                    <p>
                        ウェルカム画面で、<control>New Project</control>をクリックします。
                    </p>
                    <p>
                        それ以外の場合は、メインメニューから<ui-path>File | New | Project</ui-path>を選択します。
                    </p>
                </step>
                <step>
                    <p>
                        <control>New Project</control>ウィザードで、左側のリストから<control>Ktor</control>を選択します。
                    </p>
                </step>
                <step>
                    <p>
                        右側のペインで、以下の設定を指定できます:
                    </p>
                    <img src="ktor_idea_new_project_settings.png" alt="Ktor Project Settings" width="706"
                         border-effect="rounded"/>
                    <list>
                        <li>
                            <p>
                                <control>Name</control>
                                :
                                プロジェクト名を指定します。<Path>ktor-sample-app</Path>をプロジェクト名として入力します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Location</control>
                                :
                                プロジェクトのディレクトリを指定します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Website</control>
                                :
                                パッケージ名を生成するために使用するドメインを指定します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Artifact</control>
                                :
                                このフィールドには、生成されたアーティファクト名が表示されます。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>
                                :
                                サーバーを実行するために使用する<Links href="/ktor/server-engines" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>を選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Include samples</control>
                                :
                                このオプションを有効にしたままにして、プラグインのサンプルコードを追加します。
                            </p>
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        <control>Advanced Settings</control>をクリックして、追加設定メニューを展開します:
                    </p>
                    <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor Project Advanced Settings"
                         width="706" border-effect="rounded"/>
                    <p>
                        以下の設定が利用可能です:
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>
                                :
                                希望する<Links href="/ktor/server-dependencies" summary="既存のGradle/MavenプロジェクトにKtor Serverの依存関係を追加する方法を学びます。">ビルドシステム</Links>を選択します。これは、
                                KotlinまたはGroovy DSLを使用した<emphasis>Gradle</emphasis>、または<emphasis>Maven</emphasis>のいずれかです。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor version</control>
                                :
                                必要なKtorのバージョンを選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>
                                :
                                サーバーパラメーターを<Links href="/ktor/server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメーターを設定する方法を学びます。">YAMLまたはHOCONファイルで</Links>指定するか、<Links href="/ktor/server-configuration-code" summary="コードでさまざまなサーバーパラメーターを設定する方法を学びます。">コードで</Links>指定するかを選択します。
                            </p>
                        </li>
                    </list>
                    <p>このチュートリアルでは、これらの設定をデフォルト値のままにしておくことができます。</p>
                </step>
                <step>
                    <p>
                        <control>Next</control>をクリックして、次のページに進みます。
                    </p>
                    <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor plugins" width="706"
                         border-effect="rounded"/>
                    <p>
                        このページでは、<Links href="/ktor/server-plugins" summary="プラグインは、シリアル化、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>のセットを選択できます。これらは、認証、シリアル化とコンテンツエンコーディング、圧縮、Cookieサポートなど、Ktorアプリケーションの一般的な機能を提供するビルディングブロックです。
                    </p>
                    <p>このチュートリアルでは、この段階でプラグインを追加する必要はありません。</p>
                </step>
                <step>
                    <p>
                        <control>Create</control>をクリックし、IntelliJ IDEAがプロジェクトを生成し、依存関係をインストールするまで待ちます。
                    </p>
                </step>
            </procedure>
            <p>
                新しいプロジェクトを作成したので、次にアプリケーションを<a href="#open-explore-run">オープンし、探索し、実行する</a>方法を学びます。
            </p>
        </chapter>
        <chapter title="Ktor CLIツールを使用する" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                このセクションでは、<a href="https://github.com/ktorio/ktor-cli">Ktor CLIツール</a>を使用したプロジェクトのセットアップについて説明します。
            </p>
            <p>
                新しいKtorプロジェクトを作成するには、任意のターミナルを開き、以下の手順に従います:
            </p>
            <procedure>
                <step>
                    以下のいずれかのコマンドを使用してKtor CLIツールをインストールします:
                    <tabs>
                        <tab title="macOS/Linux" id="macos-linux">
                            <code-block lang="console" code="                                brew install ktor"/>
                        </tab>
                        <tab title="Windows" id="windows">
                            <code-block lang="console" code="                                winget install JetBrains.KtorCLI"/>
                        </tab>
                    </tabs>
                </step>
                <step>
                    インタラクティブモードで新しいプロジェクトを生成するには、以下のコマンドを使用します:
                    <code-block lang="console" code="                      ktor new"/>
                </step>
                <step>
                    プロジェクト名として<Path>ktor-sample-app</Path>を入力します:
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="Using the Ktor CLI tool in interactive mode"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        (オプション) プロジェクト名を下にある<ui-path>Location</ui-path>パスを編集することで、プロジェクトが保存される場所を変更することもできます。
                    </p>
                </step>
                <step>
                    続行するには<shortcut>Enter</shortcut>を押します。
                </step>
                <step>
                    次のステップでは、プロジェクトに<Links href="/ktor/server-plugins" summary="プラグインは、シリアル化、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>を検索して追加できます。プラグインは、認証、シリアル化とコンテンツエンコーディング、圧縮、Cookieサポートなど、Ktorアプリケーションの一般的な機能を提供するビルディングブロックです。
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="Add plugins to a project using the Ktor CLI tool"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>このチュートリアルでは、この段階でプラグインを追加する必要はありません。</p>
                </step>
                <step>
                    プロジェクトを生成するには<shortcut>CTRL+G</shortcut>を押します。
                    <p>
                        または、<control>CREATE PROJECT (CTRL+G)</control>を選択して<shortcut>Enter</shortcut>を押すことでプロジェクトを生成することもできます。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="Ktorプロジェクトを解凍して実行する" id="unpacking">
        <p>
            このセクションでは、コマンドラインからプロジェクトを解凍、ビルド、実行する方法を学びます。以下の説明では、以下を前提としています:
        </p>
        <list type="bullet">
            <li><Path>ktor-sample-app</Path>というプロジェクトを作成し、ダウンロードしていること。
            </li>
            <li>これがホームディレクトリの<Path>myprojects</Path>というフォルダに配置されていること。
            </li>
        </list>
        <p>必要に応じて、ご自身のセットアップに合わせて名前とパスを変更してください。</p>
        <p>任意のコマンドラインツールを開き、以下の手順に従います:</p>
        <procedure>
            <step>
                <p>ターミナルで、プロジェクトをダウンロードしたフォルダに移動します:</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>ZIPアーカイブを同名のフォルダに解凍します:</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample-app.zip -d ktor-sample-app"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample-app.zip"/>
                    </tab>
                </tabs>
                <p>これで、ディレクトリにはZIPアーカイブと解凍されたフォルダが含まれます。</p>
            </step>
            <step>
                <p>そのディレクトリから、新しく作成されたフォルダに移動します:</p>
                <code-block lang="console" code="                    cd ktor-sample-app"/>
            </step>
            <step>
                <p>macOS/UNIXシステムでは、gradlew Gradleヘルパースクリプトを実行可能にする必要があります。それには、<code>chmod</code>コマンドを使用します:</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            chmod +x ./gradlew"/>
                    </tab>
                </tabs>
            </step>
            <step>
                <p>プロジェクトをビルドするには、以下のコマンドを使用します:</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew build"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew build"/>
                    </tab>
                </tabs>
                <p>ビルドが成功したことを確認したら、再度Gradle経由でプロジェクトを実行できます。</p>
            </step>
            <step>
                <p>プロジェクトを実行するには、以下のコマンドを使用します:</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew run"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew run"/>
                    </tab>
                </tabs>
            </step>
            <step>
                <p>プロジェクトが実行されていることを確認するには、出力に記載されているURL ([http://0.0.0.0:8080](http://0.0.0.0:8080)) でブラウザを開きます。「Hello World!」というメッセージが画面に表示されるはずです:</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="Output of generated ktor project"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>おめでとうございます！Ktorプロジェクトの起動に成功しました。</p>
        <p>Ktorアプリケーションを実行している基盤プロセスがビジー状態のため、コマンドラインは応答しなくなります。アプリケーションを終了するには<shortcut>CTRL+C</shortcut>を押すことができます。</p>
    </chapter>
    <chapter title="IntelliJ IDEAでKtorプロジェクトを開き、探索し、実行する" id="open-explore-run">
        <chapter title="プロジェクトを開く" id="open">
            <p><a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>がインストールされている場合、コマンドラインから簡単にプロジェクトを開くことができます。
            </p>
            <p>
                プロジェクトフォルダにいることを確認してから、現在のフォルダを表すピリオドに続けて<code>idea</code>コマンドを入力します:
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                または、プロジェクトを手動で開くにはIntelliJ IDEAを起動します。
            </p>
            <p>
                ウェルカム画面が開いた場合は、<control>Open</control>をクリックします。それ以外の場合は、メインメニューの<ui-path>File | New | Project</ui-path>に移動し、<Path>ktor-sample-app</Path>フォルダを選択して開きます。
            </p>
            <tip>
                プロジェクトの管理に関する詳細については、<a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEAドキュメント</a>を参照してください。
            </tip>
        </chapter>
        <chapter title="プロジェクトを探索する" id="explore">
            <p>どちらのオプションを選択しても、プロジェクトは以下のように開くはずです:</p>
            <img src="server_get_started_idea_project_view.png" alt="Generated Ktor project view in IDE" width="706"/>
            <p>
                プロジェクトのレイアウトを説明するために、<control>Project</control>ビューで構造を展開し、ファイル<Path>settings-gradle.kts</Path>を選択しました。
            </p>
            <p>
                アプリケーションを実行するコードは<Path>src/main/kotlin</Path>の下のパッケージに存在することがわかります。デフォルトのパッケージは<Path>com.example</Path>という名前で、<Path>plugins</Path>というサブパッケージを含んでいます。
                これらのパッケージ内に<Path>Application.kt</Path>と<Path>Routing.kt</Path>という2つのファイルが作成されています。
            </p>
            <img src="server_get_started_idea_main_folder.png" alt="Ktor project src folder structure" width="400"/>
            <p>プロジェクト名は<Path>settings-gradle.kts</Path>で設定されます。
            </p>
            <img src="server_get_started_idea_settings_file.png" alt="Contents of settings.gradle.kt" width="706"/>
            <p>
                設定ファイルやその他の種類のコンテンツは、<Path>src/main/resources</Path>フォルダ内にあります。
            </p>
            <img src="server_get_started_idea_resources_folder.png" alt="Ktor project resources folder structure"
                 width="400"/>
            <p>
                スケルトンテストは、<Path>src/test/kotlin</Path>の下のパッケージに作成されています。
            </p>
            <img src="server_get_started_idea_test_folder.png" alt="Ktor project test folder structure" width="400"/>
        </chapter>
        <chapter title="プロジェクトを実行する" id="run">
            <procedure>
                <p>IntelliJ IDEA内でプロジェクトを実行するには:</p>
                <step>
                    <p>右側のサイドバーにあるGradleアイコン (<img alt="intelliJ IDEA gradle icon"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        をクリックして、<a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradleツールウィンドウ</a>を開きます。</p>
                    <img src="server_get_started_idea_gradle_tab.png" alt="Gradle tab in IntelliJ IDEA"
                         border-effect="line" width="706"/>
                </step>
                <step>
                    <p>このツールウィンドウ内で<ui-path>Tasks | application</ui-path>に移動し、<control>run</control>タスクをダブルクリックします。
                    </p>
                    <img src="server_get_started_idea_gradle_run.png" alt="Gradle tab in IntelliJ IDEA"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>Ktorアプリケーションは、IDEの下部にある<a
                            href="https://www.jetbrains.com/help/idea/run-tool-window.html">Runツールウィンドウ</a>で起動します:</p>
                    <img src="server_get_started_idea_run_terminal.png" alt="Project running in terminal" width="706"/>
                    <p>以前にコマンドラインで表示されていたのと同じメッセージが、<ui-path>Run</ui-path>ツールウィンドウに表示されるようになります。
                    </p>
                </step>
                <step>
                    <p>プロジェクトが実行されていることを確認するには、指定されたURL
                        ([http://0.0.0.0:8080](http://0.0.0.0:8080)) でブラウザを開きます。</p>
                    <p>再度、「Hello World!」というメッセージが画面に表示されるはずです:</p>
                    <img src="server_get_started_ktor_sample_app_output.png" alt="Hello World in Browser Screen"
                         width="706"/>
                </step>
            </procedure>
            <p>
                <ui-path>Run</ui-path>ツールウィンドウを介してアプリケーションを管理できます。
            </p>
            <list type="bullet">
                <li>
                    アプリケーションを終了するには、停止ボタン <img src="intellij_idea_terminate_icon.svg"
                                                                             style="inline" height="16" width="16"
                                                                             alt="intelliJ IDEA terminate icon"/> をクリックします。
                </li>
                <li>
                    プロセスを再起動するには、再実行ボタン <img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="intelliJ IDEA rerun icon"/> をクリックします。
                </li>
            </list>
            <p>
                これらのオプションについては、<a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA Runツールウィンドウのドキュメント</a>でさらに詳しく説明されています。
            </p>
        </chapter>
    </chapter>
    <chapter title="追加で試すタスク" id="additional-tasks">
        <p>以下に、試してみたい追加のタスクをいくつか示します:</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">デフォルトポートを変更する。</a></li>
            <li><a href="#change-the-port-via-yaml">YAML経由でポートを変更する。</a></li>
            <li><a href="#add-a-new-http-endpoint">新しいHTTPエンドポイントを追加する。</a></li>
            <li><a href="#configure-static-content">静的コンテンツを設定する。</a></li>
            <li><a href="#write-an-integration-test">統合テストを記述する。</a></li>
            <li><a href="#register-error-handlers">エラーハンドラーを登録する。</a></li>
        </list>
        <p>
            これらのタスクは互いに依存していませんが、徐々に複雑さが増します。宣言された順序で試すことが、段階的に学習する最も簡単な方法です。簡略化のため、および重複を避けるために、以下の説明では、タスクを順番に試していることを前提としています。
        </p>
        <p>
            コーディングが必要な場合は、コードと対応するインポートの両方を指定しています。IDEはこれらのインポートを自動的に追加する場合があります。
        </p>
        <chapter title="デフォルトポートを変更する" id="change-the-default-port">
            <p>
                <ui-path>Project</ui-path>ビューで、<Path>src/main/kotlin</Path>フォルダに移動し、作成された単一のパッケージに入って、以下の手順に従います:
            </p>
            <procedure>
                <step>
                    <p><Path>Application.kt</Path>ファイルを開きます。以下のコードと同様のコードが見つかるはずです:
                    </p>
                    <code-block lang="kotlin" code="                        fun main() {&#10;                            embeddedServer(&#10;                                Netty,&#10;                                port = 8080, // Ktorがリッスンしているポートです&#10;                                host = &quot;0.0.0.0&quot;,&#10;                                module = Application::module&#10;                            ).start(wait = true)&#10;                        }&#10;&#10;                        fun Application.module() {&#10;                            configureRouting()&#10;                        }"/>
                </step>
                <step>
                    <p><code>embeddedServer()</code>関数で、<code>port</code>パラメーターを「9292」など、選択した別の番号に変更します。</p>
                    <code-block lang="kotlin" code="                        fun main() {&#10;                            embeddedServer(&#10;                                Netty,&#10;                                port = 9292,&#10;                                host = &quot;0.0.0.0&quot;,&#10;                                module = Application::module&#10;                            ).start(wait = true)&#10;                        }"/>
                </step>
                <step>
                    <p>再実行ボタン (<img alt="intelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>アプリケーションが新しいポート番号で実行されていることを確認するには、新しいURL ([http://0.0.0.0:9292](http://0.0.0.0:9292)) でブラウザを開くか、<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEAで新しいHTTPリクエストファイルを作成</a>します:
                    </p>
                    <img src="server_get_started_port_change.png"
                         alt="Testing port change with an HTTP request file in IntelliJ IDEA" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="YAML経由でポートを変更する" id="change-the-port-via-yaml">
            <p>
                新しいKtorプロジェクトを作成する際、設定をYAMLまたはHOCONファイルのいずれかで外部に保存するオプションがあります:
            </p>
            <img src="ktor_project_generator_configuration_options.png" width="400"
                 alt="Ktor project generator configuration options"/>
            <p>
                設定を外部に保存することを選択した場合、<Path>Application.kt</Path>のコードは次のようになります:
            </p>
            <code-block lang="kotlin" code="                fun main(args: Array&lt;String&gt;): Unit =&#10;                    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;                @Suppress(&quot;unused&quot;)&#10;                fun Application.module() {&#10;                    configureRouting()&#10;                }"/>
            <p>
                これらは、<Path>src/main/resources/</Path>内の設定ファイルに保存される値です:
            </p>
            <tabs>
                <tab title="application.yaml (YAML)" group-key="yaml">
                    <code-block lang="yaml" code="                        ktor:&#10;                            application:&#10;                                modules:&#10;                                    - com.example.ApplicationKt.module&#10;                            deployment:&#10;                                port: 8080"/>
                </tab>
                <tab title="application.conf (HOCON)" group-key="hocon">
                    <code-block lang="json" code="                        ktor {&#10;                            deployment {&#10;                                port = 8080&#10;                                port = ${?PORT}&#10;                            }&#10;                            application {&#10;                                modules = [ com.example.ApplicationKt.module ]&#10;                            }&#10;                        }"/>
                </tab>
            </tabs>
            <p>
                この場合、ポート番号を変更するためにコードを修正する必要はありません。YAMLまたはHOCONファイル内の値を変更し、アプリケーションを再起動するだけです。変更は、上記の<a href="#change-the-default-port">デフォルトポート</a>の場合と同じ方法で確認できます。
            </p>
        </chapter>
        <chapter title="新しいHTTPエンドポイントを追加する" id="add-a-new-http-endpoint">
            <p>次に、GETリクエストに応答する新しいHTTPエンドポイントを作成します。</p>
            <p>
                <ui-path>Project</ui-path>ツールウィンドウで、<Path>src/main/kotlin/com/example</Path>フォルダに移動し、以下の手順に従います:
            </p>
            <procedure>
                <step>
                    <p><Path>Application.kt</Path>ファイルを開き、<code>configureRouting()</code>関数を見つけます。
                    </p>
                </step>
                <step>
                    <p>IntelliJ IDEAで、関数名にキャレットを置いて<shortcut>⌘Cmd+B</shortcut>を押すことで、<code>configureRouting()</code>関数に移動します。
                    </p>
                    <p>または、<code>Routing.kt</code>ファイルを開くことで関数に移動することもできます。</p>
                    <p>表示されるコードは次のとおりです:</p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>新しいエンドポイントを作成するには、以下の5行のコードを追加します:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <p><code>/test1</code>のURLは自由に変更できることに注意してください。</p>
                </step>
                <step>
                    <p><code>ContentType</code>を使用するために、以下のインポートを追加します:</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.*"/>
                </step>
                <step>
                    <p>再実行ボタン (<img alt="intelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>ブラウザで新しいURL ([http://0.0.0.0:9292/test1](http://0.0.0.0:9292/test1)) をリクエストします。使用するポート番号は、最初のタスク(<a
                                href="#change-the-default-port">デフォルトポートの変更</a>)を試したかどうかによって異なります。以下に表示される出力が表示されるはずです:</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="A browser screen displaying Hello from Ktor" width="706"/>
                    <p>HTTPリクエストファイルを作成した場合は、そこでも新しいエンドポイントを確認できます:</p>
                    <img src="server_get_started_add_new_http_endpoint.png" alt="An HTTP request file in intelliJ IDEA"
                         width="450"/>
                    <p>3つのハッシュ (###) を含む行は、異なるリクエストを区切るために必要であることに注意してください。</p>
                </step>
            </procedure>
        </chapter>
        <chapter title="静的コンテンツを設定する" id="configure-static-content">
            <p><ui-path>Project</ui-path>ツールウィンドウで、<Path>src/main/kotlin/com/example/plugins</Path>フォルダに移動し、以下の手順に従います:
            </p>
            <procedure>
                <step>
                    <p><code>Routing.kt</code>ファイルを開きます。</p>
                    <p>これもデフォルトのコンテンツであるはずです:</p>
                    <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                    <p>このタスクでは、<a href="#add-a-new-http-endpoint">新しいHTTPエンドポイントの追加</a>で指定された追加エンドポイントのコンテンツを挿入したかどうかは関係ありません。</p>
                </step>
                <step>
                    <p>ルーティングセクションに以下の行を追加します:</p>
                    <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                // 以下の行を追加&#10;                                staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                    <p>この行の意味は以下のとおりです:</p>
                    <list type="bullet">
                        <li><code>staticResources()</code>を呼び出すと、Ktorは、アプリケーションがHTMLやJavaScriptファイルなどの標準的なウェブサイトコンテンツを提供できるようにしたいことを伝えます。このコンテンツはブラウザ内で実行される場合がありますが、サーバーの観点からは静的であると見なされます。
                        </li>
                        <li>URL <code>/content</code>は、このコンテンツを取得するために使用すべきパスを指定します。
                        </li>
                        <li>パス <code>mycontent</code>は、静的コンテンツが配置されるフォルダの名前です。Ktorは<code>resources</code>ディレクトリ内でこのフォルダを探します。
                        </li>
                    </list>
                </step>
                <step>
                    <p>以下のインポートを追加します:</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.*"/>
                </step>
                <step>
                    <p><control>Project</control>ツールウィンドウで、<code>src/main/resources</code>フォルダを右クリックし、<control>New | Directory</control>を選択します。
                    </p>
                    <p>または、<code>src/main/resources</code>フォルダを選択し、<shortcut>⌘Сmd+N</shortcut>を押して<control>Directory</control>をクリックします。</p>
                </step>
                <step>
                    <p>新しいディレクトリに<code>mycontent</code>という名前を付け、<shortcut>↩Enter</shortcut>を押します。</p>
                </step>
                <step>
                    <p>新しく作成したフォルダを右クリックし、<control>New | File</control>をクリックします。
                    </p>
                </step>
                <step>
                    <p>新しいファイルに「sample.html」という名前を付け、<shortcut>↩Enter</shortcut>を押します。</p>
                </step>
                <step>
                    <p>新しく作成したファイルページに、例えば次のような有効なHTMLを入力します:</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;    &lt;ol&gt;&#10;        &lt;li&gt;Ktor&lt;/li&gt;&#10;        &lt;li&gt;Kotlin&lt;/li&gt;&#10;        &lt;li&gt;HTML&lt;/li&gt;&#10;    &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>再実行ボタン (<img alt="intelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>[http://0.0.0.0:9292/content/sample.html](http://0.0.0.0:9292/content/sample.html)でブラウザを開くと、サンプルページの内容が表示されるはずです:</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="Output of a static page in browser" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="統合テストを記述する" id="write-an-integration-test">
            <p>
                Ktorは<Links href="/ktor/server-testing" summary="%plugin_name%は、Ktorアプリケーションがスローされた例外やステータスコードに基づいて、あらゆる失敗状態に適切に応答できるようにします。">統合テストの作成</Links>をサポートしており、生成されたプロジェクトにはこの機能がバンドルされています。
            </p>
            <p>これを利用するには、以下の手順に従います:</p>
            <procedure>
                <step>
                    <p>
                        <Path>src</Path>の下に「test」という新しいディレクトリを作成し、その中に「kotlin」というサブディレクトリを作成します。
                    </p>
                </step>
                <step>
                    <p><Path>src/test/kotlin</Path>内に「com.example」という新しいパッケージを作成します。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>src/test/kotlin/com.example</Path>内に「ApplicationTest.kt」という新しいファイルを作成します。
                    </p>
                </step>
                <step>
                    <p><code>ApplicationTest.kt</code>ファイルを開き、以下のコードを追加します:</p>
                    <code-block lang="kotlin" code="                        class ApplicationTest {&#10;&#10;                            @Test&#10;                            fun testRoot() = testApplication {&#10;                                application {&#10;                                    module()&#10;                                }&#10;                                val response = client.get(&quot;/&quot;)&#10;&#10;                                assertEquals(HttpStatusCode.OK, response.status)&#10;                                assertEquals(&quot;Hello World!&quot;, response.bodyAsText())&#10;                            }&#10;                        }"/>
                    <p><code>testApplication()</code>メソッドは、Ktorの新しいインスタンスを作成します。このインスタンスは、Nettyなどのサーバーとは異なり、テスト環境内で実行されます。</p>
                    <p>次に、<code>application()</code>メソッドを使用して、<code>embeddedServer()</code>から呼び出されるのと同じセットアップを呼び出すことができます。</p>
                    <p>最後に、組み込みの<code>client</code>オブジェクトとJUnitアサーションを使用して、サンプルリクエストを送信し、レスポンスを確認できます。</p>
                </step>
                <step>
                    <p>以下の必要なインポートを追加します:</p>
                    <code-block lang="kotlin" code="                        import io.ktor.client.request.*&#10;                        import io.ktor.client.statement.*&#10;                        import io.ktor.http.*&#10;                        import io.ktor.server.testing.*&#10;                        import org.junit.Assert.assertEquals&#10;                        import org.junit.Test"/>
                </step>
            </procedure>
            <p>
                テストは、IntelliJ IDEAでテストを実行する標準的な方法のいずれかで実行できます。Ktorの新しいインスタンスを実行しているため、テストの成功または失敗は、アプリケーションが0.0.0.0で実行されているかどうかには依存しないことに注意してください。
            </p>
            <p>
                <a href="#add-a-new-http-endpoint">新しいHTTPエンドポイントの追加</a>を正常に完了した場合、この追加テストを追加できるはずです:
            </p>
            <code-block lang="Kotlin" code="                @Test&#10;                fun testNewEndpoint() = testApplication {&#10;                    application {&#10;                        module()&#10;                    }&#10;&#10;                    val response = client.get(&quot;/test1&quot;)&#10;&#10;                    assertEquals(HttpStatusCode.OK, response.status)&#10;                    assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;                    assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;                }"/>
            <p>以下の追加インポートが必要です:</p>
            <code-block lang="Kotlin" code="                import kotlin.test.assertContains"/>
        </chapter>
        <chapter title="エラーハンドラーを登録する" id="register-error-handlers">
            <p>
                <Links href="/ktor/server-status-pages" summary="%plugin_name%は、Ktorアプリケーションがスローされた例外やステータスコードに基づいて、あらゆる失敗状態に適切に応答できるようにします。">StatusPagesプラグイン</Links>を使用して、Ktorアプリケーションでエラーを処理できます。
            </p>
            <p>
                このプラグインは、デフォルトではプロジェクトに含まれていません。Ktorプロジェクトジェネレーターの<ui-path>Plugins</ui-path>セクション、またはIntelliJ IDEAのプロジェクトウィザードを介してプロジェクトに追加することもできました。すでにプロジェクトを作成しているため、次のステップでは、プラグインを手動で追加および設定する方法を学びます。
            </p>
            <p>
                これを行うには4つのステップがあります:
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">Gradleビルドファイルに新しい依存関係を追加する。</a></li>
                <li><a href="#install-plugin-and-specify-handler">プラグインをインストールし、例外ハンドラーを指定する。</a></li>
                <li><a href="#write-sample-code">ハンドラーをトリガーするサンプルコードを記述する。</a></li>
                <li><a href="#restart-and-invoke">サンプルコードを再起動して呼び出す。</a></li>
            </list>
            <procedure title="新しい依存関係を追加する" id="add-dependency">
                <p><control>Project</control>ツールウィンドウで、プロジェクトのルートフォルダに移動し、以下の手順に従います:
                </p>
                <step>
                    <p><code>build.gradle.kts</code>ファイルを開きます。</p>
                </step>
                <step>
                    <p>依存関係セクションに、以下に示す追加の依存関係を追加します:</p>
                    <code-block lang="kotlin" code="                        dependencies {&#10;                            // 追加する新しい依存関係&#10;                            implementation(&quot;io.ktor:ktor-server-status-pages:$ktor_version&quot;)&#10;                            // 既存の依存関係&#10;                            implementation(&quot;io.ktor:ktor-server-core-jvm:$ktor_version&quot;)&#10;                            implementation(&quot;io.ktor:ktor-server-netty-jvm:$ktor_version&quot;)&#10;                            implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                            testImplementation(&quot;io.ktor:ktor-server-test-host-jvm:$ktor_version&quot;)&#10;                            testImplementation(&quot;org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version&quot;)&#10;                        }"/>
                    <p>これを行った後、新しい依存関係を認識させるためにプロジェクトをリロードする必要があります。</p>
                </step>
                <step>
                    <p>macOSでは<shortcut>Shift+⌘Cmd+I</shortcut>、Windowsでは<shortcut>Ctrl+Shift+O</shortcut>を押してプロジェクトをリロードします。
                    </p>
                </step>
            </procedure>
            <procedure title="プラグインをインストールし、例外ハンドラーを指定する"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p><code>Routing.kt</code>の<code>configureRouting()</code>メソッドに移動し、以下のコード行を追加します:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>これらの行は、<code>StatusPages</code>プラグインをインストールし、<code>IllegalStateException</code>タイプの例外がスローされた場合に実行するアクションを指定します。</p>
                </step>
                <step>
                    <p>以下のインポートを追加します:</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.*"/>
                </step>
            </procedure>
            <p>
                HTTPエラーコードは通常レスポンスで設定されますが、このタスクの目的のため、出力はブラウザに直接表示されます。
            </p>
            <procedure title="ハンドラーをトリガーするサンプルコードを記述する" id="write-sample-code">
                <step>
                    <p><code>configureRouting()</code>メソッド内に留まり、以下に示す追加の行を追加します:</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>これで、URL <code>/error-test</code>のエンドポイントが追加されました。このエンドポイントがトリガーされると、ハンドラーで使用されているタイプのエラーがスローされます。</p>
                </step>
            </procedure>
            <procedure title="サンプルコードを再起動して呼び出す" id="restart-and-invoke">
                <step>
                    <p>再実行ボタン (<img alt="intelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        をクリックして、アプリケーションを再起動します。</p></step>
                <step>
                    <p>ブラウザでURL [http://0.0.0.0:9292/error-test](http://0.0.0.0:9292/error-test)に移動します。以下に示すエラーメッセージが表示されるはずです:</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="A browser screen with message `App in illegal state as Too Busy`" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="次のステップ" id="next_steps">
        <p>
            追加タスクの最後まで進んだのであれば、Ktorサーバーの設定、Ktorプラグインの統合、新しいルートの実装を理解していることでしょう。しかし、これは始まりにすぎません。Ktorの基本的な概念をさらに深く掘り下げるには、このガイドの次のチュートリアルに進んでください。
        </p>
        <p>
            次に、<Links href="/ktor/server-requests-and-responses" summary="タスクマネージャーアプリケーションを構築することで、KtorとKotlinにおけるルーティング、リクエスト処理、およびパラメーターの基本を学びます。">Task Managerアプリケーションを作成してリクエストを処理し、レスポンスを生成する</Links>方法を学びます。
        </p>
    </chapter>
</topic>