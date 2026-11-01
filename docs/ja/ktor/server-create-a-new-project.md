<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="新規 Ktor プロジェクトの作成、オープン、実行"
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
        Ktor を使用したサーバーアプリケーションの開き方、実行方法、テスト方法について学びます。
    </link-summary>
    <web-summary>
        最初の Ktor サーバーアプリケーションの構築をはじめましょう。このチュートリアルでは、新しい Ktor プロジェクトを作成、開き、実行する方法を学びます。
    </web-summary>
    <p>
        このチュートリアルでは、最初の Ktor サーバープロジェクトを作成、オープンし、実行する方法を学びます。起動して実行できるようになったら、Ktor に慣れるための一連のタスクを完了できます。
    </p>
    <p>
        これは、Ktor を使用したサーバーアプリケーションの構築を始めるための一連のチュートリアルの最初のステップです。各チュートリアルは個別に進めることもできますが、推奨される順序に従って進めることを強くお勧めします。
    </p>
    <list type="decimal">
        <li>新規 Ktor プロジェクトの作成、オープン、実行。</li>
        <li><Links href="server-requests-and-responses.topic" summary="タスクマネージャーアプリケーションを構築することで、Ktor を使用した Kotlin でのルーティング、リクエスト処理、パラメータの基本を学びます。">リクエストの処理とレスポンスの生成</Links>。</li>
        <li><Links href="server-create-restful-apis.topic" summary="Kotlin と Ktor を使用してバックエンドサービスを構築する方法を、JSON ファイルを生成する RESTful API の例を通して学びます。">JSON を生成する RESTful API の作成</Links>。</li>
        <li><Links href="server-create-website.topic" summary="Kotlin、Ktor、Thymeleaf テンプレートを使用して Web サイトを構築する方法を学びます。">Thymeleaf テンプレートを使用した Web サイトの作成</Links>。</li>
        <li><Links href="server-create-websocket-application.topic" summary="WebSocket の機能を活用してコンテンツを送受信する方法を学びます。">WebSocket アプリケーションの作成</Links>。</li>
        <li><Links href="server-integrate-database.md" summary="Exposed SQL ライブラリを使用して Ktor サービスをデータベースリポジトリに接続するプロセスを学びます。">Exposed によるデータベースの統合</Links>。</li>
    </list>
    <chapter id="create-project" title="新規 Ktor プロジェクトの作成">
        <p>
            新しい Ktor プロジェクトを作成する最も速い方法の 1 つは、<a href="#create-project-with-the-ktor-project-generator">Web ベースの Ktor プロジェクトジェネレーターを使用すること</a>です。
        </p>
        <p>
            あるいは、<a href="#create_project_with_intellij">IntelliJ IDEA Ultimate 向けの専用 Ktor プラグイン</a>または <a href="#create_project_with_ktor_cli_tool">Ktor CLI ツール</a>を使用してプロジェクトを生成することもできます。
        </p>
        <chapter title="Ktor プロジェクトジェネレーターの使用"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                Ktor プロジェクトジェネレーターを使用して新しいプロジェクトを作成するには、以下の手順に従います。
            </p>
            <procedure>
                <step>
                    <p><a href="https://start.ktor.io/">Ktor プロジェクトジェネレーター</a>にアクセスします。</p>
                </step>
                <step>
                    <p>
                        <control>Project artifact</control>
                        フィールドに、プロジェクトのアーティファクト名として
                        <Path>com.example.ktor-sample</Path>
                        を入力します。
                        <img src="ktor_343_project_generator_new_project_artifact_name.png"
                             alt="プロジェクトアーティファクト名に com.example.ktor-sample を指定した Ktor プロジェクトジェネレーター"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step id="configure-project-step">
                    <p>
                        <control>Configure</control>
                        をクリックして設定のドロップダウンメニューを開きます。
                        <img src="ktor_343_project_generator_new_project_configure.png"
                             style="block"
                             alt="Ktor プロジェクト設定の展開ビュー" border-effect="line" width="706"/>
                    </p>
                    <p>
                        以下の設定が利用可能です。
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>
                                :
                                希望する<Links href="server-dependencies.topic" summary="既存の Gradle/Maven プロジェクトに Ktor Server の依存関係を追加する方法を学びます。">ビルドシステム</Links>を選択します。
                                <emphasis>Gradle Kotlin</emphasis>、
                                <emphasis>Gradle Groovy</emphasis>、
                                <emphasis>Maven</emphasis>、または <emphasis>Amper</emphasis>
                                から選択できます。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>
                                :
                                サーバーの実行に使用する<Links href="server-engines.md" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>を選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>
                                :
                                サーバーパラメータを <Links href="server-configuration-file.topic" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">YAML または HOCON ファイルで</Links>指定するか、<Links href="server-configuration-code.topic" summary="コード内でさまざまなサーバーパラメータを設定する方法を学びます。">コード内で</Links>指定するかを選択します。
                            </p>
                            <warning>
                                現在、Maven ベースの Ktor プロジェクトでは YAML 設定はサポートされていません。
                            </warning>
                        </li>
                    </list>
                    <p>このチュートリアルでは、これらの設定をデフォルト値のままにしておいて構いません。</p>
                </step>
                <step>
                    <p>
                        <control>Done</control>
                        をクリックして設定を保存し、メニューを閉じます。
                    </p>
                </step>
                <step>
                    <p>下部には、プロジェクトに追加できる一連の<Links href="server-plugins.md" summary="プラグインは、シリアライズ、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>が表示されます。プラグインは、認証、シリアライズやコンテンツエンコーディング、圧縮、Cookie サポートなど、Ktor アプリケーションで一般的な機能を提供する構成要素です。
                    </p>
                    <p>このチュートリアルでは、現段階でプラグインを追加する必要はありません。</p>
                </step>
                <step>
                    <p>
                        <control>Download</control>
                        ボタンをクリックして、Ktor プロジェクトを生成してダウンロードします。
                        <img src="ktor_343_project_generator_new_project_download.png"
                             alt="Ktor プロジェクトジェネレーターのダウンロードボタン"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>ダウンロードが自動的に開始されます。</p>
            </procedure>
            <p>新しいプロジェクトを生成したら、次は <a href="#unpacking">Ktor プロジェクトの展開と実行</a> に進みましょう。</p>
        </chapter>
        <chapter title="IntelliJ IDEA Ultimate 向け Ktor プラグインの使用" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                このセクションでは、IntelliJ IDEA Ultimate 向けの <a
                    href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor プラグイン</a>を使用したプロジェクトのセットアップについて説明します。
            </p>
            <p>
                新しい Ktor プロジェクトを作成するには、<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">IntelliJ IDEA を開き</a>、以下の手順に従います。
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
                        <control>New Project</control>
                        ウィザードで、左側のリストから
                        <control>Ktor</control>
                        を選択します。
                    </p>
                </step>
                <step>
                    <p>
                        右側のペインで、以下の設定を指定できます。
                    </p>
                    <img src="ktor_idea_new_project_settings.png" alt="Ktor プロジェクト設定" width="706"
                         border-effect="rounded"/>
                    <list>
                        <li>
                            <p>
                                <control>Name</control>: プロジェクト名を指定します。プロジェクト名として
                                <Path>ktor-sample</Path>
                                を入力します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Location</control>: プロジェクト用のディレクトリを指定します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Website</control>
                                :
                                パッケージ名の生成に使用されるドメインを指定します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Artifact</control>
                                :
                                このフィールドには生成されたアーティファクト名が表示されます。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>
                                :
                                サーバーの実行に使用する<Links href="server-engines.md" summary="ネットワークリクエストを処理するエンジンについて学びます。">エンジン</Links>を選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Include samples</control>
                                :
                                プラグインのサンプルコードを追加するには、このオプションを有効のままにしておきます。
                            </p>
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        <control>Advanced Settings</control>
                        をクリックして、追加設定メニューを展開します。
                    </p>
                    <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor プロジェクト詳細設定"
                         width="706" border-effect="rounded"/>
                    <p>
                        以下の設定が利用可能です。
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>
                                :
                                希望する<Links href="server-dependencies.topic" summary="既存の Gradle/Maven プロジェクトに Ktor Server の依存関係を追加する方法を学びます。">ビルドシステム</Links>を選択します。
                                <emphasis>Gradle Kotlin</emphasis>、
                                <emphasis>Gradle Groovy</emphasis>、
                                <emphasis>Maven</emphasis>、または <emphasis>Amper</emphasis>
                                から選択できます。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor version</control>
                                :
                                必要な Ktor バージョンを選択します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>
                                :
                                サーバーパラメータを <Links href="server-configuration-file.topic" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">YAML または HOCON ファイルで</Links>指定するか、<Links href="server-configuration-code.topic" summary="コード内でさまざまなサーバーパラメータを設定する方法を学びます。">コード内で</Links>指定するかを選択します。
                            </p>
                            <warning>
                                現在、Maven ベースの Ktor プロジェクトでは YAML 設定はサポートされていません。
                            </warning>
                        </li>
                    </list>
                    <p>このチュートリアルでは、これらの設定をデフォルト値のままにしておいて構いません。</p>
                </step>
                <step>
                    <p>
                        <control>Next</control>
                        をクリックして次のページに進みます。
                    </p>
                    <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor プラグイン" width="706"
                         border-effect="rounded"/>
                    <p>
                        このページでは、認証、シリアライズやコンテンツエンコーディング、圧縮、Cookie サポートなど、Ktor アプリケーションの一般的な機能を提供する構成要素である一連の<Links href="server-plugins.md" summary="プラグインは、シリアライズ、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>を選択できます。
                    </p>
                    <p>このチュートリアルでは、現段階でプラグインを追加する必要はありません。</p>
                </step>
                <step>
                    <p>
                        <control>Create</control>
                        をクリックし、IntelliJ IDEA がプロジェクトを生成して依存関係をインストールするまで待ちます。
                    </p>
                </step>
            </procedure>
            <p>
                新しいプロジェクトを作成したら、次はアプリケーションの<a href="#open-explore-run">開き方、確認方法、実行方法</a>を学びましょう。
            </p>
        </chapter>
        <chapter title="Ktor CLI ツールの使用" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                このセクションでは、<a href="https://github.com/ktorio/ktor-cli">Ktor CLI ツール</a>を使用したプロジェクトのセットアップについて説明します。
            </p>
            <p>
                新しい Ktor プロジェクトを作成するには、任意のターミナルを開き、以下の手順に従います。
            </p>
            <procedure>
                <step>
                    以下のいずれかのコマンドを使用して Ktor CLI ツールをインストールします。
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
                    対話モードで新しいプロジェクトを生成するには、次のコマンドを使用します。
                    <code-block lang="console" code="                      ktor new"/>
                </step>
                <step>
                    プロジェクトの名前として
                    <Path>ktor-sample</Path>
                    を入力します。
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="対話モードでの Ktor CLI ツールの使用"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        (オプション) プロジェクト名の下にある
                        <ui-path>Location</ui-path>
                        のパスを編集して、プロジェクトが保存される場所を変更することもできます。
                    </p>
                </step>
                <step>
                    <shortcut>Enter</shortcut>
                    を押して次に進みます。
                </step>
                <step>
                    次のステップでは、プロジェクトに<Links href="server-plugins.md" summary="プラグインは、シリアライズ、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>を検索して追加できます。プラグインは、認証、シリアライズやコンテンツエンコーディング、圧縮、Cookie サポートなど、Ktor アプリケーションで一般的な機能を提供する構成要素です。
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="Ktor CLI ツールを使用してプロジェクトにプラグインを追加する"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>このチュートリアルでは、現段階でプラグインを追加する必要はありません。</p>
                </step>
                <step>
                    <shortcut>Ctrl+G</shortcut>
                    を押してプロジェクトを生成します。
                    <p>
                        あるいは、
                        <control>CREATE PROJECT (CTRL+G)</control>
                        を選択して
                        <shortcut>Enter</shortcut>
                        を押すことでもプロジェクトを生成できます。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="Ktor プロジェクトの展開と実行" id="unpacking">
        <p>
            このセクションでは、コマンドラインからプロジェクトを展開、ビルド、実行する方法を学びます。以下の手順では、以下を前提としています。
        </p>
        <list type="bullet">
            <li>
                <Path>ktor-sample</Path>
                という名前の Gradle プロジェクトを作成してダウンロード済みであること。
            </li>
            <li>このプロジェクトが、ホームディレクトリ内の
                <Path>myprojects</Path>
                というフォルダーにあること。
            </li>
        </list>
        <p>必要に応じて、ご自身の環境に合わせて名前やパスを変更してください。</p>
        <p>任意のコマンドラインツールを開き、以下の手順に従います。</p>
        <procedure>
            <step>
                <p>ターミナルウィンドウで、プロジェクトをダウンロードしたフォルダーに移動します。</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>同名のフォルダーに ZIP アーカイブを展開します。</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                    </tab>
                </tabs>
                <p>これで、ディレクトリには ZIP アーカイブと展開されたフォルダーが含まれるようになります。</p>
            </step>
            <step>
                <p>ディレクトリから、新しく作成されたフォルダーに移動します。</p>
                <code-block lang="console" code="                    cd ktor-sample"/>
            </step>
            <step>
                <p>macOS および UNIX システムでは、システムが実行可能コマンドとして認識できるように、Gradle ヘルパースクリプトを実行可能にする必要があります。これを行うには、<code>chmod</code> コマンドを使用します。</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            chmod +x ./gradlew"/>
                    </tab>
                </tabs>
            </step>
            <step>
                <p>プロジェクトをビルドするには、次のコマンドを使用します。</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew build"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew build"/>
                    </tab>
                </tabs>
                <p>ビルドが成功したら、次のステップに進んでプロジェクトを実行します。</p>
            </step>
            <step>
                <p>プロジェクトを実行するには、次のコマンドを使用します。</p>
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
                <p>プロジェクトが実行されていることを確認するには、ターミナル出力に表示されている URL（<a
                        href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）をブラウザで開きます。
                    ブラウザに「Hello World!」というメッセージが表示されるはずです。</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="生成された ktor プロジェクトの出力"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>おめでとうございます！Ktor プロジェクトが正常に起動しました。</p>
        <note>
            基盤となるプロセスが Ktor アプリケーションの実行でビジー状態であるため、コマンドラインが応答しなくなる点に注意してください。アプリケーションを終了するには、
            <shortcut>Ctrl+C</shortcut>
            を押します。
        </note>
    </chapter>
    <chapter title="IntelliJ IDEA での Ktor プロジェクトのオープン、確認、実行" id="open-explore-run">
        <chapter title="プロジェクトを開く" id="open">
            <p><a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a> がインストールされている場合は、コマンドラインから簡単にプロジェクトを開くことができます。
            </p>
            <p>
                プロジェクトフォルダー内にいることを確認し、<code>idea</code> コマンドの後に現在のフォルダーを表すピリオド（.）を入力します。
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                または、手動でプロジェクトを開く場合は、IntelliJ IDEA を起動します。
            </p>
            <p>
                ウェルカム画面が開いた場合は、
                <control>Open</control>
                をクリックします。それ以外の場合は、メインメニューの
                <ui-path>File | Open</ui-path>
                に移動し、
                <Path>ktor-sample</Path>
                フォルダーを選択して開きます。
            </p>
            <tip>
                プロジェクト管理の詳細については、<a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA ドキュメント</a>を参照してください。
            </tip>
        </chapter>
        <chapter title="プロジェクトの構造を確認する" id="explore">
            <p>プロジェクトを開くと、以下のような構造が表示されます。</p>
            <img src="tutorial_server_get_started_idea_project_view.png" alt="IDE での生成された Ktor プロジェクトのビュー" width="706"/>
            <p>
                全体の構造を確認するには、各フォルダーの横にある展開矢印をクリックして、<control>Project</control> ビュー内のフォルダーを展開します。
            </p>
            <p>
                アプリケーションのソースコードは
                <Path>src/main/kotlin</Path>
                配下にあります。デフォルトでは、
                <Path>Application.kt</Path>
                と
                <Path>Routing.kt</Path>
                という 2 つのファイルが作成されます。
            </p>
            <img src="tutorial_server_get_started_idea_main_folder.png" alt="Ktor プロジェクトの src フォルダー構造" width="400"/>
            <p>プロジェクトの名前は
                <Path>settings.gradle.kts</Path>
                ファイルで設定されています。
            </p>
            <code-block lang="kotlin" code="rootProject.name = &quot;ktor-sample&quot;"/>
            <p>
                設定ファイルやその他のコンテンツは、
                <Path>src/main/resources</Path>
                フォルダー内に配置されます。
            </p>
            <img src="tutorial_server_get_started_idea_resources_folder.png" alt="Ktor プロジェクトの resources フォルダー構造"
                 width="400"/>
        </chapter>
        <chapter title="プロジェクトの実行" id="run">
            <procedure>
                <p>IntelliJ IDEA 内からプロジェクトを実行するには:</p>
                <step>
                    <p>右側のサイドバーにある Gradle アイコン（<img alt="IntelliJ IDEA の Gradle アイコン"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>）をクリックして、<a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle ツールウィンドウ</a>を開きます。</p>
                </step>
                <step>
                    <p>このツールウィンドウ内で
                        <ui-path>Tasks | application</ui-path>
                        に移動し、
                        <control>run</control>
                        タスクをダブルクリックします。
                    </p>
                    <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA の Gradle タブ"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>Ktor アプリケーションが IDE の下部にある <a
                            href="https://www.jetbrains.com/help/idea/run-tool-window.html">Run ツールウィンドウ</a>で起動します。</p>
                    <img src="tutorial_server_get_started_idea_run_terminal.png" alt="ターミナルで実行中のプロジェクト" width="706"/>
                    <p>以前にコマンドラインに表示されていたものと同じメッセージが、
                        <ui-path>Run</ui-path>
                        ツールウィンドウに表示されます。
                    </p>
                </step>
                <step>
                    <p>プロジェクトが実行中であることを確認するには、指定された URL
                        （<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）をブラウザで開きます。</p>
                    <p>再び画面に「Hello World!」というメッセージが表示されるはずです。</p>
                    <img src="server_get_started_ktor_sample_app_output.png" alt="ブラウザ画面の Hello World"
                         width="706"/>
                </step>
            </procedure>
            <p>
                アプリケーションは
                <ui-path>Run</ui-path>
                ツールウィンドウから管理できます。
            </p>
            <list type="bullet">
                <li>
                    アプリケーションを終了するには、停止ボタン <img src="intellij_idea_terminate_icon.svg"
                                                                             style="inline" height="16" width="16"
                                                                             alt="IntelliJ IDEA の停止アイコン"/> をクリックします。
                </li>
                <li>
                    プロセスを再起動するには、再実行ボタン <img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="IntelliJ IDEA の再実行アイコン"/> をクリックします。
                </li>
            </list>
            <p>
                これらのオプションについて詳しくは、<a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA Run ツールウィンドウのドキュメント</a>で説明されています。
            </p>
        </chapter>
    </chapter>
    <chapter title="追加で試せるタスク" id="additional-tasks">
        <p>試してみたい追加のタスクをいくつか紹介します。</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">デフォルトポートの変更</a></li>
            <li><a href="#add-a-new-http-endpoint">新しい HTTP エンドポイントの追加</a></li>
            <li><a href="#configure-static-content">静的コンテンツの設定</a></li>
            <li><a href="#write-an-integration-test">統合テストの記述</a></li>
            <li><a href="#register-error-handlers">エラーハンドラーの登録</a></li>
        </list>
        <p>
            これらのタスクは相互に依存しているわけではありませんが、難易度が徐々に上がっていきます。宣言された順序で試すことが、段階的に学習するための最も簡単な方法です。分かりやすくし重複を避けるため、以下の説明はタスクを順番に試していることを前提としています。
        </p>
        <p>
            コーディングが必要な箇所では、コードと対応するインポートの両方を指定しています。IDE がこれらのインポートを自動的に追加する場合もあります。
        </p>
        <chapter title="デフォルトポートの変更" id="change-the-default-port">
            <chapter title="設定ファイルでポートを変更する" id="change-the-port-in-config">
                <p>
                    設定を外部の YAML または HOCON ファイルに保存することを選択した場合は、
                    <ui-path>Project</ui-path>
                    ビューで
                    <Path>src/main/resources</Path>
                    フォルダーに移動し、以下の手順に従います。
                </p>
                <procedure id="change-default-port-yaml-procedure">
                    <step>
                        設定ファイル（
                        <Path>application.yaml</Path>
                        または
                        <Path>application.conf</Path>
                        ）を開きます。以下のようになっているはずです。
                        <tabs>
                            <tab title="application.yaml (YAML)" group-key="yaml">
                                <code-block lang="yaml" code="ktor:&#10;  deployment:&#10;    port: 8080&#10;  application:&#10;    modules:&#10;      - com.example.RoutingKt.configureRouting"/>
                            </tab>
                            <tab title="application.conf (HOCON)" group-key="hocon">
                                <code-block lang="generic" code="ktor {&#10;  deployment {&#10;    port = 8080&#10;    port = ${?PORT}&#10;  }&#10;  application {&#10;    modules = [&#10;      com.example.RoutingKt.configureRouting&#10;    ]&#10;  }&#10;}"/>
                            </tab>
                        </tabs>
                    </step>
                    <step>
                        ファイル内の <code>port</code> の値を、<code>9292</code> など任意の別の数値に変更します。
                    </step>
                    <step>
                        <p>再実行ボタン（<img alt="IntelliJ IDEA の再実行ボタンアイコン"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
                    </step>
                    <step>
                        <p>アプリケーションが新しいポート番号で実行されていることを確認するには、ブラウザで新しい URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）を開くか、<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEA で新しい HTTP Request ファイルを作成します</a>。</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="IntelliJ IDEA の HTTP リクエストファイルでポート変更をテストする" width="706"/>
                    </step>
                </procedure>
            </chapter>
            <chapter title="コード内でポートを変更する" id="change-the-port-in-code">
                <p>
                    <a href="#configure-project-step">新しい Ktor プロジェクトを作成するとき</a>に、設定をコード内に保存するか、外部の YAML または HOCON ファイル内に保存するかを選択できます。
                </p>
                <p>
                    設定をコード内に保存するオプションを選択した場合は、
                    <ui-path>Project</ui-path>
                    ビューで
                    <Path>src/main/kotlin</Path>
                    フォルダーに移動し、以下の手順に従います。
                </p>
                <procedure id="change-the-default-port-code-procedure">
                    <step>
                        <p>
                            <Path>main.kt</Path>
                            ファイルを開きます。次のようなコードが見つかるはずです。
                        </p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p><code>embeddedServer()</code> 関数内で、<code>port</code> パラメータを <code>9292</code> など任意の別の数値に変更します。</p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>再実行ボタン（<img alt="IntelliJ IDEA の再実行ボタンアイコン"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
                    </step>
                    <step>
                        <p>アプリケーションが新しいポート番号で実行されていることを確認するには、ブラウザで新しい URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）を開くか、<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">IntelliJ IDEA で新しい HTTP Request ファイルを作成します</a>。</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="IntelliJ IDEA の HTTP リクエストファイルでポート変更をテストする" width="706"/>
                    </step>
                </procedure>
            </chapter>
        </chapter>
        <chapter title="新しい HTTP エンドポイントの追加" id="add-a-new-http-endpoint">
            <p>
                <ui-path>Project</ui-path>
                ツールウィンドウで、
                <Path>src/main/kotlin</Path>
                フォルダーに移動し、以下の手順に従います。
            </p>
            <procedure>
                <step>
                    <p>
                        <Path>Routing.kt</Path>
                        ファイルを開きます。次のようなコードが表示されます。
                    </p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>新しいエンドポイントを作成するには、以下のように追加のルートを挿入します。</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <note>URL <code>/test1</code> は好みの任意のものに変更できることに注意してください。</note>
                </step>
                <step>
                    <p>IDE が <code>ContentType</code> のインポートを自動的に追加します。</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
                </step>
                <step>
                    <p>再実行ボタン（<img alt="IntelliJ IDEA の再実行ボタンアイコン"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>ブラウザで新しい URL（<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>）をリクエストします。ポート番号は、<a href="#change-the-default-port">デフォルトポートの変更</a> タスクを完了したかどうかによって異なります。以下のような出力が表示されるはずです。</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="Hello from Ktor と表示されたブラウザ画面" width="706"/>
                    <p>HTTP リクエストファイルを作成している場合は、そこから新しいエンドポイントを確認することもできます。</p>
                    <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                    <note>異なるリクエストを区切るには、3 つのハッシュ記号（<code>###</code>）を含む行が必要であることに注意してください。</note>
                </step>
            </procedure>
        </chapter>
        <chapter title="静的コンテンツの設定" id="configure-static-content">
            <p>
                <ui-path>Project</ui-path>
                ツールウィンドウで、
                <Path>src/main/kotlin</Path>
                フォルダーに移動し、以下の手順に従います。
            </p>
            <procedure>
                <step>
                    <p><Path>Routing.kt</Path> ファイルを開き、routing セクションに以下のルートを追加します。</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                    <p>この行の意味は以下のとおりです。</p>
                    <list type="bullet">
                        <li><code>staticResources()</code> を呼び出すと、アプリケーションが HTML や JavaScript ファイルなどの標準的な Web サイトコンテンツを提供できるようになります。このコンテンツはブラウザ内で実行できますが、サーバーの観点からは静的であるとみなされます。
                        </li>
                        <li>URL <code>/content</code> は、このコンテンツを取得するために使用されるパスを指定します。
                        </li>
                        <li>パス <code>mycontent</code> は、静的コンテンツが配置されるフォルダーの名前です。Ktor は <code>resources</code> ディレクトリ内でこのフォルダーを検索します。
                        </li>
                    </list>
                </step>
                <step>
                    <p>IDE が自動的に追加しない場合は、次のインポートを追加します。</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
                </step>
                <step>
                    <p>
                        <control>Project</control>
                        ツールウィンドウで、<Path>src/main/resources</Path> フォルダーを右クリックし、
                        <control>New | Directory</control>
                        を選択します。
                    </p>
                    <p>または、<Path>src/main/resources</Path> フォルダーを選択して
                        <shortcut>⌘Cmd+N</shortcut>（macOS）または <shortcut>Ctrl+N</shortcut>（Windows/Linux）を押し、
                        <control>Directory</control>
                        をクリックします。
                    </p>
                </step>
                <step>
                    <p>新しいディレクトリに <code>mycontent</code> と名前を付け、
                        <shortcut>↩Enter</shortcut>
                        を押します。
                    </p>
                </step>
                <step>
                    <p>新しく作成したフォルダーを右クリックし、
                        <control>New | File</control>
                        をクリックします。
                    </p>
                </step>
                <step>
                    <p>新しいファイルに <Path>sample.html</Path> と名前を付け、
                        <shortcut>↩Enter</shortcut>
                        を押します。
                    </p>
                </step>
                <step>
                    <p>新しく作成したファイルページに、有効な HTML を記述します（例:）。</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>再実行ボタン（<img alt="IntelliJ IDEA の再実行ボタンアイコン"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p>
                </step>
                <step>
                    <p>ブラウザで <a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a> を開くと、サンプルページの内容が表示されます。</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="ブラウザでの静的ページの出力" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="統合テストの記述" id="write-an-integration-test">
            <p>
                Ktor は<Links href="server-testing.md" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。">統合テストの作成</Links>をサポートしており、生成されたプロジェクトにはこの機能が最初から組み込まれています。
            </p>
            <p>これを利用するには、以下の手順に従います。</p>
            <procedure>
                <step>
                    <p>
                        <Path>src/test/kotlin</Path>
                        フォルダーに移動します。
                    </p>
                </step>
                <step>
                    <p><Path>ServerTest.kt</Path> ファイルを開きます。以下のようなコードが表示されるはずです。</p>
                    <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // loads default configuration&#10;        configure()&#10;        // verify server root returns 200&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                    <p><code>testApplication()</code> 関数は、Ktor の新しいインスタンスを作成します。このインスタンスは、Netty などのサーバーではなく、テスト環境内で実行されます。</p>
                    <p>次に、<code>configure()</code> 関数を使用して、<code>embeddedServer()</code> から呼び出されるのと同じセットアップを呼び出すことができます。</p>
                    <p>最後に、組み込みの <code>client</code> オブジェクトと JUnit アサーションを使用して、サンプルのリクエストを送信し、レスポンスを確認できます。</p>
                </step>
            </procedure>
            <p>
                IntelliJ IDEA でテストを実行する標準的な方法のいずれかを使用して、テストを実行できます。Ktor の新しいインスタンスを実行しているため、テストの成否はアプリケーションが <code>0.0.0.0</code> で実行されているかどうかには依存しないことに注意してください。
            </p>
            <p>
                <a href="#add-a-new-http-endpoint">新しい HTTP エンドポイントの追加</a>が正常に完了している場合は、次のテストを追加します。
            </p>
            <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
            <p>以下の追加インポートを追加します。</p>
            <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
        </chapter>
        <chapter title="エラーハンドラーの登録" id="register-error-handlers">
            <p>
                Ktor アプリケーションのエラーは、<Links href="server-status-pages.md" summary="%plugin_name% を使用すると、スローされた例外やステータスコードに基づいて、Ktor アプリケーションがあらゆる障害状態に適切に応答できるようになります。">StatusPages プラグイン</Links>を使用して処理できます。
            </p>
            <tip>
                このプラグインは、デフォルトではプロジェクトに含まれていません。Ktor プロジェクトジェネレーターまたは IntelliJ IDEA のプロジェクトウィザードでプロジェクトを作成する際に、<ui-path>Plugins</ui-path> セクションからプロジェクトに追加できます。
            </tip>
            <p>
                次のステップでは、プラグインを手動で追加および設定する方法を学びます。これを行うには 4 つのステップがあります。
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">Gradle ビルドファイルに新しい依存関係を追加する。</a></li>
                <li><a href="#install-plugin-and-specify-handler">プラグインをインストールし、例外ハンドラーを指定する。</a></li>
                <li><a href="#write-sample-code">ハンドラーをトリガーするサンプルコードを記述する。</a></li>
                <li><a href="#restart-and-invoke">再起動してサンプルコードを呼び出す。</a></li>
            </list>
            <procedure title="新しい依存関係の追加" id="add-dependency">
                <p>
                    <control>Project</control>
                    ツールウィンドウで、プロジェクトのルートフォルダーに移動し、以下の手順に従います。
                </p>
                <step>
                    <p><Path>build.gradle.kts</Path> ファイルを開き、以下のように新しい依存関係を追加します。</p>
                    <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // Add new dependency&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(libs.kotlin.test)&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
                </step>
                <step>
                    <p>
                        <shortcut>Shift+⌘Cmd+I</shortcut>（macOS）または
                        <shortcut>Ctrl+Shift+O</shortcut>（Windows/Linux）を押して、プロジェクトをリロードします。
                    </p>
                </step>
            </procedure>
            <procedure title="プラグインのインストールと例外ハンドラーの指定"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p><Path>Routing.kt</Path> の <code>.configureRouting()</code> メソッドに移動し、以下のコード行を追加します。</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                    <p>これらの行は <code>StatusPages</code> プラグインをインストールし、<code>IllegalStateException</code> 型の例外がスローされたときに実行するアクションを指定します。</p>
                </step>
                <step>
                    <p>次のインポートを追加します。</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
                </step>
            </procedure>
            <p>
                通常、レスポンスには HTTP エラーコードが設定されますが、このタスクの目的上、出力はブラウザに直接表示されます。
            </p>
            <procedure title="ハンドラーをトリガーするサンプルコードの記述" id="write-sample-code">
                <step>
                    <p><code>.configureRouting()</code> メソッド内で、以下のように追加のルートを追加します。</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>これで、URL <code>/error-test</code> を持つエンドポイントが追加されました。このエンドポイントがトリガーされると、ハンドラーで使用されている型の例外がスローされます。</p>
                </step>
            </procedure>
            <procedure title="再起動してサンプルコードを呼び出す" id="restart-and-invoke">
                <step>
                    <p>再実行ボタン（<img alt="IntelliJ IDEA の再実行ボタンアイコン"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）をクリックして、アプリケーションを再起動します。</p></step>
                <step>
                    <p>ブラウザで、URL <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a> にアクセスします。以下のようにエラーメッセージが表示されるはずです。</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="`App in illegal state as Too Busy` というメッセージが表示されたブラウザ画面" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="次のステップ" id="next_steps">
        <p>
            追加のタスクを最後まで終えたなら、Ktor サーバーの設定、Ktor プラグインの統合、および新しいルートの実装について理解できたはずです。しかし、これはほんの始まりに過ぎません。Ktor の基本概念についてさらに深く掘り下げるには、このガイドの次のチュートリアルに進んでください。
        </p>
        <p>
            次回は、<Links href="server-requests-and-responses.topic" summary="タスクマネージャーアプリケーションを構築することで、Ktor を使用した Kotlin でのルーティング、リクエスト処理、パラメータの基本を学びます。">タスクマネージャーアプリケーションの作成を通じて、リクエストを処理しレスポンスを生成する方法</Links>を学びます。
        </p>
    </chapter>
</topic>