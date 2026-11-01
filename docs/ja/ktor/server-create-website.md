<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Ktor を使用して Kotlin で Web サイトを作成する" id="server-create-website">
<show-structure for="chapter,procedure" depth="3"/>
<tldr>
        <var name="example_name" value="tutorial-server-web-application"/>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用プラグイン</b>: <Links href="server-static-content.md" summary="スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。">Static Content</Links>,
            <Links href="server-thymeleaf.md" summary="必要な依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーのサポート: ✖️">Thymeleaf</Links>
        </p>
    </tldr>
    <web-summary>
        Ktor と Kotlin を使用して Web サイトを構築する方法を学びます。このチュートリアルでは、Thymeleaf テンプレートと Ktor ルーティングを組み合わせて、サーバー側で HTML ベースのユーザーインターフェースを生成する方法を説明します。
    </web-summary>
    <card-summary>
        Ktor と Thymeleaf テンプレートを使用して、Kotlin で Web サイトを構築する方法を学びます。
    </card-summary>
    <link-summary>
        Ktor と Thymeleaf テンプレートを使用して、Kotlin で Web サイトを構築する方法を学びます。
    </link-summary>
    <p>
        このチュートリアルでは、Ktor と <a href="https://www.thymeleaf.org/">Thymeleaf</a> テンプレートを使用して、Kotlin でインタラクティブな Web サイトを構築する方法を学びます。
    </p>
    <p>
        <Links href="server-create-restful-apis.topic" summary="JSON ファイルを生成する RESTful API の例を交えながら、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">前のチュートリアル</Links>では、JavaScript で記述されたシングルページアプリケーション（SPA）から利用される RESTful サービスの作成方法を学びました。これは非常に人気のあるアーキテクチャですが、すべてのプロジェクトに適しているわけではありません。
    </p>
    <p>
        すべての実装をサーバー側に保持し、クライアントにはマークアップのみを送信したいと考える理由は数多くあります。例えば、以下のような理由です。
    </p>
    <list>
        <li>シンプルさ – 単一のコードベースを維持できること。</li>
        <li>セキュリティ – 攻撃者に手がかりを与える可能性のあるデータやコードをブラウザ上に置かないようにすること。</li>
        <li>
            サポート性 – レガシーブラウザや JavaScript が無効化されているブラウザを含め、クライアントができるだけ幅広い環境を利用できるようにすること。
        </li>
    </list>
    <p>
        Ktor は、<Links href="server-templating.md" summary="HTML/CSS または JVM テンプレートエンジンで構築されたビューを操作する方法を学びます。">いくつかのサーバーページ技術</Links>と統合することで、このアプローチをサポートしています。
    </p>
    <chapter title="前提条件" id="prerequisites">
        <p>
            このチュートリアルは単独で進めることも可能ですが、RESTful API の作成方法を学ぶために、まずは<Links href="server-create-restful-apis.topic" summary="JSON ファイルを生成する RESTful API の例を交えながら、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">前のチュートリアル</Links>を完了することを強くお勧めします。
        </p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a> をインストールすることをお勧めしますが、お好みの他の IDE を使用することもできます。
        </p>
    </chapter>
    <chapter title="タスクマネージャー Web アプリケーションの概要" id="hello-task-manager">
        <p>
            このチュートリアルでは、<Links href="server-create-restful-apis.topic" summary="JSON ファイルを生成する RESTful API の例を交えながら、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">前のチュートリアル</Links>で作成したタスク管理アプリケーションを Web アプリケーションへと変換します。これを行うために、いくつかの Ktor <Links href="server-plugins.md" summary="プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>を使用します。
        </p>
        <p>
            これらのプラグインは既存のプロジェクトに手動で追加することもできますが、新しいプロジェクトを生成して、前のチュートリアルからコードを段階的に取り入れていく方が簡単です。必要なコードはすべて手順の中で提示するため、手元に前回のプロジェクトがなくても問題ありません。
        </p>
        <procedure title="プラグインを含む初期プロジェクトを作成する" id="create-project">
            <step>
                <p>
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>
                    にアクセスします。
                </p>
            </step>
            <step>
                <p>
                    <control>Project artifact</control>
                    フィールドに、プロジェクトアーティファクト名として
                    <Path>com.example.ktor-task-web-app</Path>
                    を入力します。
                    <img src="server_create_web_app_generator_project_artifact.png"
                         alt="Ktor Project Generator project artifact name"
                         style="block"
                         border-effect="line" width="706"/>
                </p>
            </step>
            <step>
                <p> 次の画面で、
                    <control>Add</control>
                    ボタンをクリックして以下のプラグインを検索し、追加します。
                </p>
                <list>
                    <li>Static Content</li>
                    <li>Thymeleaf</li>
                </list>
                <p>
                    <img src="ktor_project_generator_add_plugins.gif"
                         alt="Adding plugins in the Ktor Project Generator"
                         border-effect="line"
                         style="block"
                         width="706"/>
                    プラグインを追加すると、プロジェクト設定の下に
                    3 つのプラグインがすべて一覧表示されます。
                    <img src="server_create_web_app_generator_plugins.png"
                         alt="Ktor Project Generator plugins list"
                         style="block"
                         border-effect="line" width="706"/>
                </p>
            </step>
            <step>
                <p>
                    <control>Download</control>
                    ボタンをクリックして、Ktor プロジェクトを生成およびダウンロードします。
                </p>
            </step>
        </procedure>
        <procedure title="スターターコードを追加する" id="add-starter-code">
            <step>
                IntelliJ IDEA またはお好みの IDE でプロジェクトを開きます。
            </step>
            <step>
                <Path>src/main/kotlin</Path>
                に移動し、
                <Path>model</Path>
                という名前のサブパッケージを作成します。
            </step>
            <step>
                <Path>model</Path>
                パッケージ内に、新しい
                <Path>Task.kt</Path>
                ファイルを作成します。
            </step>
            <step>
                <p>
                    <Path>Task.kt</Path>
                    ファイルに、優先度を表す <code>enum</code> とタスクを表す <code>data class</code> を追加します。
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    ここでも、<code>Task</code> オブジェクトを作成し、表示できる形式でクライアントに送信したいと考えます。
                </p>
                <p>
                    これまでの手順を振り返ってみましょう。
                </p>
                <list>
                    <li>
                        <Links href="server-requests-and-responses.topic" summary="タスクマネージャーアプリケーションを構築しながら、Kotlin と Ktor におけるルーティング、リクエスト処理、パラメータの基本を学びます。">リクエストの処理とレスポンスの生成</Links>チュートリアルでは、タスクを HTML に変換する手書きの拡張関数を追加しました。
                    </li>
                    <li>
                        <Links href="server-create-restful-apis.topic" summary="JSON ファイルを生成する RESTful API の例を交えながら、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">RESTful API の作成</Links>チュートリアルでは、<code>kotlinx.serialization</code> ライブラリの <code>Serializable</code> 型で <code>Task</code> クラスにアノテーションを付けました。
                    </li>
                </list>
                <p>
                    今回の目的は、タスクの内容をブラウザに出力するサーバーページを作成することです。
                </p>
            </step>
            <step>
                <Path>src/main/kotlin</Path>
                内の
                <Path>Routing.kt</Path>
                ファイルを開きます。
            </step>
            <step>
                <p>
                    <code>.configureRouting()</code> 関数に、以下のように <code>/tasks</code> のルートを追加します。
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        // Add this additional route&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}"/>
                <p>
                    サーバーが <code>/tasks</code> に対するリクエストを受信すると、タスクのリストを作成して Thymeleaf テンプレートに渡します。<code>ThymeleafContent</code> 型は、レンダリングするテンプレートの名前と、ページ上でアクセス可能にする値のテーブルを受け取ります。
                </p>
            </step>
            <step>
                <Path>src/main/kotlin</Path>
                内の
                <Path>Thymeleaf.kt</Path>
                ファイルを開きます。
            </step>
            <step>
                <p>次のような <code>.configureThymeleaf</code> 関数が表示されているはずです。</p>
                <code-block lang="kotlin" code="fun Application.configureThymeleaf() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;}"/>
                <p>
                    Thymeleaf プラグインの初期化設定において、Ktor はサーバーページを探す場所として
                    <Path>templates/thymeleaf</Path>
                    フォルダを参照します。静的コンテンツと同様に、このフォルダは
                    <Path>resources</Path>
                    ディレクトリ内に存在することを想定しています。また、
                    <Path>.html</Path>
                    という拡張子も想定されています。
                </p>
                <p>
                    この場合、<code>all-tasks</code> という名前は
                    <code>src/main/resources/templates/thymeleaf/all-tasks.html</code> というパスにマッピングされます。
                </p>
            </step>
            <step>
                <Path>src/main/resources</Path>
                に移動し、新しい <Path>templates/thymeleaf</Path>
                ディレクトリを作成します。
            </step>
            <step>
                <Path>src/main/resources/templates/thymeleaf</Path>
                内に、新しい
                <Path>all-tasks.html</Path>
                ファイルを作成します。
            </step>
            <step>
                <p><Path>all-tasks.html</Path>
                    ファイルを開き、以下のコンテンツを追加します。
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;All Current Tasks&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>IntelliJ IDEA で実行ボタン
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="intelliJ IDEA run icon"/>)
                    をクリックしてアプリケーションを起動します。</p>
            </step>
            <step>
                <p>
                    ブラウザで <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a> にアクセスします。以下のように、現在のすべてのタスクが表形式で表示されるはずです。
                </p>
                <img src="server_create_web_app_all_tasks.png"
                     alt="A web browser window displaying a list of tasks" border-effect="rounded" width="706"/>
                <p>
                    すべてのサーバーページフレームワークと同様に、Thymeleaf テンプレートは静的コンテンツ（ブラウザに送信されるもの）と動的コンテンツ（サーバー上で実行されるもの）を混在させます。<a href="https://freemarker.apache.org/">Freemarker</a> などの別のフレームワークを選択した場合でも、構文が少し異なるだけで同様の機能を実現できます。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="GET ルートを追加する" id="add-get-routes">
        <p>サーバーページをリクエストするプロセスを理解できたので、引き続き前のチュートリアルの機能をこちらに移植していきましょう。</p>
        <p><control>Static Content</control>
            プラグインを含めたため、
            <Path>Routing.kt</Path>
            ファイルには以下のコードが存在します。
        </p>
        <code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
        <p>
            これは、例えば <code>/static/index.html</code> に対するリクエストに対して、次のパスのコンテンツが配信されることを意味します。
        </p>
        <code>src/main/resources/static/index.html</code>
        <p>
            このファイルはすでに生成されたプロジェクトの一部に含まれているため、これから追加する機能のホームページとして利用できます。
        </p>
        <procedure title="index ページを再利用する">
            <step>
                <p>
                    <Path>src/main/resources/static</Path>
                    内の
                    <Path>index.html</Path>
                    ファイルを開き、その内容を以下の実装に置き換えます。
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Task Manager Web Application&lt;/h1&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;&lt;a href=&quot;/tasks&quot;&gt;View all the tasks&lt;/a&gt;&lt;/h3&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View tasks by priority&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byPriority&quot;&gt;&#10;        &lt;select name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View a task by name&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byName&quot;&gt;&#10;        &lt;input type=&quot;text&quot; name=&quot;name&quot; width=&quot;10&quot;&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create or edit a task&lt;/h3&gt;&#10;    &lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;description&quot;&#10;                   name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>
                    IntelliJ IDEA で再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="intelliJ IDEA rerun icon"/>) をクリックしてアプリケーションを再起動します。
                </p>
            </step>
            <step>
                <p>
                    ブラウザで <a href="http://localhost:8080/static/index.html">http://localhost:8080/static/index.html</a> にアクセスします。タスクの表示、フィルタリング、および作成を行うためのリンクボタンと 3 つの HTML フォームが表示されるはずです。
                </p>
                <img src="server_create_web_app_tasks_form.png"
                     alt="A web browser displaying an HTML form" border-effect="rounded" width="706"/>
                <p>
                    <code>name</code> または <code>priority</code> でタスクをフィルタリングする場合、GET リクエストを介して HTML フォームを送信していることに注目してください。これは、パラメータが URL の後のクエリ文字列（query string）に追加されることを意味します。
                </p>
                <p>
                    例えば、優先度が <code>Medium</code> のタスクを検索する場合、サーバーに送信されるリクエストは次のようになります。
                </p>
                <code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
            </step>
        </procedure>
        <procedure title="タスクリポジトリを再利用する" id="task-repository">
            <p>
                タスク用のリポジトリは、前のチュートリアルとまったく同じものをそのまま使用できます。
            </p>
            <p>
                <Path>model</Path>
                パッケージ内に新しい
                <Path>TaskRepository.kt</Path>
                ファイルを作成し、以下のコードを追加します。
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
        </procedure>
        <procedure title="GET リクエストのルートを再利用する" id="reuse-routes">
            <p>
                リポジトリを作成できたので、GET リクエスト用のルートを実装できます。
            </p>
            <step>
                <Path>src/main/kotlin</Path>
                内の
                <Path>Routing.kt</Path>
                ファイルに移動します。
            </step>
            <step>
                <p>
                    現在の <code>.configureRouting()</code> の内容を以下の実装に置き換えます。
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    上記のコードは次のように要約できます。
                </p>
                <list>
                    <li>
                        <code>/tasks</code> への GET リクエストでは、サーバーはリポジトリからすべてのタスクを取得し、
                        <Path>all-tasks</Path>
                        テンプレートを使用してブラウザに送信する次のビューを生成します。
                    </li>
                    <li>
                        <code>/tasks/byName</code> への GET リクエストでは、サーバーは <code>queryString</code> からパラメータ <code>name</code> を取得し、一致するタスクを見つけ、
                        <Path>single-task</Path>
                        テンプレートを使用してブラウザに送信する次のビューを生成します。
                    </li>
                    <li>
                        <code>/tasks/byPriority</code> への GET リクエストでは、サーバーは <code>queryString</code> からパラメータ
                        <code>priority</code> を取得し、一致するタスクを見つけ、
                        <Path>tasks-by-priority</Path>
                        テンプレートを使用してブラウザに送信する次のビューを生成します。
                    </li>
                </list>
                <p>これらすべてを機能させるには、追加のテンプレートを追加する必要があります。</p>
            </step>
            <step>
                <Path>src/main/resources/templates/thymeleaf</Path>
                に移動し、新しい
                <Path>single-task.html</Path>
                ファイルを作成します。
            </step>
            <step>
                <p>
                    <Path>single-task.html</Path>
                    ファイルを開き、以下の内容を追加します。
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;The Selected Task&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>同じフォルダ内に、
                    <Path>tasks-by-priority.html</Path>
                    という名前の新しいファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>tasks-by-priority.html</Path>
                    ファイルを開き、以下の内容を追加します。
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Tasks By Priority &lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Tasks With Priority &lt;span th:text=&quot;${priority}&quot;&gt;&lt;/span&gt;&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="POST リクエストのサポートを追加する" id="add-post-requests">
        <p>
            次に、以下の処理を行うために <code>/tasks</code> に POST リクエストハンドラーを追加します。
        </p>
        <list>
            <li>フォームパラメータから情報を抽出する。</li>
            <li>リポジトリを使用して新しいタスクを追加する。</li>
            <li>
                <control>all-tasks</control>
                テンプレートを再利用してタスクを表示する。
            </li>
        </list>
        <procedure>
            <step>
                <Path>src/main/kotlin</Path>
                内の
                <Path>Routing.kt</Path>
                ファイルに移動します。
            </step>
            <step>
                <p>
                    <code>.configureRouting()</code> メソッド内に以下の <code>post</code> リクエストルートを追加します。
                </p>
                <code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
            </step>
            <step>
                <p>
                    IntelliJ IDEA で再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="intelliJ IDEA rerun icon"/>) をクリックしてアプリケーションを再起動します。
                </p>
            </step>
            <step>
                ブラウザで <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a> にアクセスします。
            </step>
            <step>
                <p>
                    <control>Create or edit a task</control>
                    フォームに新しいタスクの詳細を入力します。
                </p>
                <img src="server_create_web_app_new_task.png"
                     alt="A web browser displaying HTML forms" border-effect="rounded" width="706"/>
            </step>
            <step>
                <p>
                    <control>Submit</control>
                    ボタンをクリックしてフォームを送信します。
                    送信後、すべてのタスクのリスト内に新しいタスクが表示されます。
                </p>
                <img src="server_create_web_app_new_task_added.png"
                     alt="A web browser displaying a list of tasks" border-effect="rounded" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="次のステップ" id="next-steps">
        <p>
            おめでとうございます！これでタスクマネージャーを Web アプリケーションとして再構築し、Thymeleaf テンプレートの使い方を学習できました。</p>
        <p>
            WebSockets の操作方法を学ぶには、<Links href="server-create-websocket-application.topic" summary="WebSockets のパワーを活用してコンテンツを送受信する方法を学びます。">次のチュートリアル</Links>に進んでください。
        </p>
    </chapter>
</topic>