<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="KotlinとKtorでウェブサイトを作成する" id="server-create-website">
<tldr>
        <var name="example_name" value="tutorial-server-web-application"/>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用されているプラグイン</b>: <Links href="/ktor/server-routing" summary="ルーティングは、サーバーアプリケーションにおける受信リクエストを処理するための中核プラグインです。">Routing</Links>、
            <Links href="/ktor/server-static-content" summary="スタイルシート、スクリプト、画像などの静的コンテンツを提供する方法を学びます。">Static Content</Links>、
            <Links href="/ktor/server-thymeleaf" summary="必要な依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✖️">Thymeleaf</Links>
        </p>
    </tldr>
<web-summary>
        KtorとKotlinでウェブサイトを構築する方法を学びます。このチュートリアルでは、ThymeleafテンプレートとKtorルートを組み合わせて、サーバーサイドでHTMLベースのユーザーインターフェースを生成する方法を示します。
    </web-summary>
<card-summary>
        KtorとThymeleafテンプレートを使ってKotlinでウェブサイトを構築する方法を学びます。
    </card-summary>
<link-summary>
        KtorとThymeleafテンプレートを使ってKotlinでウェブサイトを構築する方法を学びます。
    </link-summary>
<p>
        このチュートリアルでは、Kotlin、Ktor、そして
        <a href="https://www.thymeleaf.org/">Thymeleaf</a>テンプレートを使ってインタラクティブなウェブサイトを構築する方法を紹介します。
    </p>
<p>
        <Links href="/ktor/server-create-restful-apis" summary="KotlinとKtorを使用してバックエンドサービスを構築する方法を学び、JSONファイルを生成するRESTful APIの例を紹介します。">前のチュートリアル</Links>では、JavaScriptで書かれたシングルページアプリケーション（SPA）によって利用されることを想定したRESTfulサービスを作成する方法を学びました。これは非常に一般的なアーキテクチャですが、すべてのプロジェクトに適しているわけではありません。
    </p>
<p>
        実装をすべてサーバー側に保持し、マークアップのみをクライアントに送信したいと考える理由はたくさんあります。例えば、以下のようなものが挙げられます。
    </p>
<list>
        <li>シンプルさ - 単一のコードベースを維持するため。</li>
        <li>セキュリティ - 攻撃者に情報を提供する可能性のあるデータやコードがブラウザに置かれるのを防ぐため。
        </li>
        <li>
            サポート性 - レガシーブラウザやJavaScriptが無効なブラウザを含む、可能な限り幅広いクライアントが使用できるようにするため。
        </li>
    </list>
<p>
        Ktorは、<Links href="/ktor/server-templating" summary="HTML/CSSまたはJVMテンプレートエンジンで構築されたビューを操作する方法を学びます。">いくつかのサーバーページ技術</Links>と統合することで、このアプローチをサポートします。
    </p>
<chapter title="前提条件" id="prerequisites">
<p>
            このチュートリアルは単独で行うこともできますが、RESTful APIの作成方法を学ぶために
            <Links href="/ktor/server-create-restful-apis" summary="KotlinとKtorを使用してバックエンドサービスを構築する方法を学び、JSONファイルを生成するRESTful APIの例を紹介します。">先行するチュートリアル</Links>を完了することを強くお勧めします。
        </p>
<p>
            <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a>をインストールすることをお勧めしますが、お好みの他のIDEを使用することもできます。
        </p>
</chapter>
<chapter title="Hello Task Manager Webアプリケーション" id="hello-task-manager">
<p>
            このチュートリアルでは、<Links href="/ktor/server-create-restful-apis" summary="KotlinとKtorを使用してバックエンドサービスを構築する方法を学び、JSONファイルを生成するRESTful APIの例を紹介します。">前のチュートリアル</Links>で構築したタスクマネージャーをWebアプリケーションに変換します。これには、いくつかのKtor
            <Links href="/ktor/server-plugins" summary="プラグインは、シリアライゼーション、コンテンツエンコーディング、圧縮などの一般的な機能を提供します。">プラグイン</Links>を使用します。
        </p>
<p>
            これらのプラグインを既存のプロジェクトに手動で追加することもできますが、新しいプロジェクトを生成し、以前のチュートリアルからのコードを徐々に組み込んでいく方が簡単です。必要なコードはすべて提供するので、以前のプロジェクトを手元に置く必要はありません。
        </p>
<procedure title="プラグインを使用して初期プロジェクトを作成する" id="create-project">
<step>
<p>
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>
                    に移動します。
                </p>
</step>
<step>
<p>
                    <control>Project artifact</control>
                    フィールドに、プロジェクトアーティファクト名として
                    <Path>com.example.ktor-task-web-app</Path>
                    を入力します。
                    <img src="server_create_web_app_generator_project_artifact.png"
                         alt="Ktor Project Generatorのプロジェクトアーティファクト名"
                         style="block"
                         border-effect="line" width="706"/>
</p>
</step>
<step>
<p> 次の画面で、以下のプラグインを検索し、<control>Add</control>ボタンをクリックして追加します。
                </p>
<list>
<li>Routing</li>
<li>Static Content</li>
<li>Thymeleaf</li>
</list>
<p>
<img src="ktor_project_generator_add_plugins.gif"
                         alt="Ktor Project Generatorでのプラグインの追加"
                         border-effect="line"
                         style="block"
                         width="706"/>
                    プラグインを追加すると、プロジェクト設定の下に3つのプラグインがすべて表示されます。
                    <img src="server_create_web_app_generator_plugins.png"
                         alt="Ktor Project Generatorのプラグインリスト"
                         style="block"
                         border-effect="line" width="706"/>
</p>
</step>
<step>
<p>
                    <control>Download</control>
                    ボタンをクリックして、Ktorプロジェクトを生成し、ダウンロードします。
                </p>
</step>
</procedure>
<procedure title="スターターコードを追加する" id="add-starter-code">
<step>
                IntelliJ IDEA、または選択した別のIDEでプロジェクトを開きます。
            </step>
<step>
<Path>src/main/kotlin/com/example</Path>
                に移動し、
                <Path>model</Path>
                というサブパッケージを作成します。
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
                ファイルに、優先順位を表す<code>enum</code>と、タスクを表す<code>data class</code>を追加します。
                </p>
<code-block lang="kotlin" code="enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
<p>
                ここでも、<code>Task</code>オブジェクトを作成し、表示可能な形式でクライアントに送信したいと考えます。
                </p>
<p>
                思い出されるかもしれません。
                </p>
<list>
<li>
                        <Links href="/ktor/server-requests-and-responses" summary="KtorでKotlinのルーティング、リクエスト処理、パラメータの基本を学び、タスクマネージャーアプリケーションを構築します。">リクエストを処理しレスポンスを生成する</Links>チュートリアルでは、タスクをHTMLに変換するために手書きの拡張関数を追加しました。
                    </li>
<li>
                        <Links href="/ktor/server-create-restful-apis" summary="KotlinとKtorを使用してバックエンドサービスを構築する方法を学び、JSONファイルを生成するRESTful APIの例を紹介します。">RESTful APIを作成する</Links>チュートリアルでは、<code>Task</code>クラスに<code>kotlinx.serialization</code>ライブラリの<code>Serializable</code>型をアノテーションしました。
                    </li>
</list>
<p>
                この場合、私たちの目標は、タスクの内容をブラウザに書き込めるサーバーページを作成することです。
                </p>
</step>
<step>
<Path>plugins</Path>
                パッケージ内の
                <Path>Templating.kt</Path>
                ファイルを開きます。
            </step>
<step>
<p>
<code>configureTemplating()</code>メソッドに、以下に示すように<code>/tasks</code>のルートを追加します。
                </p>
<code-block lang="kotlin" code="fun Application.configureTemplating() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;    routing {&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&#10;                &quot;index&quot;,&#10;                mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))&#10;            ))&#10;        }&#10;        //this is the additional route to add&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;    }&#10;}"/>
<p>
                    サーバーが<code>/tasks</code>へのリクエストを受信すると、タスクのリストを作成し、それをThymeleafテンプレートに渡します。<code>ThymeleafContent</code>型は、トリガーしたいテンプレートの名前と、ページでアクセス可能にしたい値のテーブルを受け取ります。
                </p>
<p>
                    メソッドの先頭にあるThymeleafプラグインの初期化を見ると、Ktorがサーバーページのために
                    <Path>templates/thymeleaf</Path>
                    内を検索することがわかります。静的コンテンツと同様に、このフォルダが
                    <Path>resources</Path>
                    ディレクトリ内にあることを想定しています。また、
                    <Path>.html</Path>
                    のサフィックスを想定しています。
                </p>
<p>
                    この場合、<code>all-tasks</code>という名前は
                    <code>src/main/resources/templates/thymeleaf/all-tasks.html</code>
                    のパスにマッピングされます。
                </p>
</step>
<step>
<Path>src/main/resources/templates/thymeleaf</Path>
                に移動し、新しい
                <Path>all-tasks.html</Path>
                ファイルを作成します。
            </step>
<step>
<p>
<Path>all-tasks.html</Path>
                ファイルを開き、以下のコンテンツを追加します。
                </p>
<code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;All Current Tasks&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
</step>
<step>
<p>IntelliJ IDEAで実行ボタン
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="IntelliJ IDEAの実行アイコン"/>)
                    をクリックしてアプリケーションを開始します。</p>
</step>
<step>
<p>
                    ブラウザで[http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)に移動します。以下に示すように、現在のすべてのタスクがテーブルに表示されるはずです。
                </p>
<img src="server_create_web_app_all_tasks.png"
                     alt="タスクのリストを表示するWebブラウザウィンドウ" border-effect="rounded" width="706"/>
<p>
                    すべてのサーバーページフレームワークと同様に、Thymeleafテンプレートは静的コンテンツ（ブラウザに送信される）と動的コンテンツ（サーバーで実行される）を混在させます。もし
                    <a href="https://freemarker.apache.org/">Freemarker</a>
                    のような代替フレームワークを選択していたら、わずかに異なる構文で同じ機能を提供できたでしょう。
                </p>
</step>
</procedure>
</chapter>
<chapter title="GETルートを追加する" id="add-get-routes">
<p>サーバーページの要求プロセスに慣れたので、以前のチュートリアルからの機能をこのチュートリアルに転送し続けます。</p>
<p>
<control>Static Content</control>
            プラグインを含めたため、以下のコードが
            <Path>Routing.kt</Path>
            ファイルに存在します。
        </p>
<code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
<p>
            これは、例えば<code>/static/index.html</code>へのリクエストが、以下のパスからコンテンツを提供されることを意味します。
        </p>
<code>src/main/resources/static/index.html</code>
<p>
            このファイルはすでに生成されたプロジェクトの一部であるため、追加したい機能のホームページとして使用できます。
        </p>
<procedure title="インデックスページを再利用する">
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
                    IntelliJ IDEAで再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEAの再実行アイコン"/>) をクリックしてアプリケーションを再起動します。
                </p>
</step>
<step>
<p>
                    ブラウザで[http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)に移動します。タスクの表示、フィルタリング、作成を可能にするリンクボタンと3つのHTMLフォームが表示されるはずです。
                </p>
<img src="server_create_web_app_tasks_form.png"
                     alt="HTMLフォームを表示するWebブラウザ" border-effect="rounded" width="706"/>
<p>
<code>name</code>または<code>priority</code>でタスクをフィルタリングする場合、GETリクエストを通じてHTMLフォームを送信していることに注意してください。これは、パラメータがURLの後にクエリ文字列として追加されることを意味します。
                </p>
<p>
                    例えば、<code>Medium</code>優先度のタスクを検索する場合、サーバーに送信されるリクエストは以下のようになります。
                </p>
<code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
</step>
</procedure>
<procedure title="TaskRepositoryを再利用する" id="task-repository">
<p>
                タスクのリポジトリは、前のチュートリアルのものと同一のままで構いません。
            </p>
<p>
<Path>model</Path>
                パッケージ内に新しい
                <Path>TaskRepository.kt</Path>
                ファイルを作成し、以下のコードを追加します。
            </p>
<code-block lang="kotlin" code="object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
</procedure>
<procedure title="GETリクエストのルートを再利用する" id="reuse-routes">
<p>
                リポジトリを作成したので、GETリクエストのルートを実装できます。
            </p>
<step>
<Path>src/main/kotlin/com/example/plugins</Path>
                にある
                <Path>Templating.kt</Path>
                ファイルに移動します。
            </step>
<step>
<p>
                現在の<code>configureTemplating()</code>のバージョンを以下の実装に置き換えます。
                </p>
<code-block lang="kotlin" code="fun Application.configureTemplating() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
<p>
                    上記のコードは次のように要約できます。
                </p>
<list>
<li>
<code>/tasks</code>へのGETリクエストでは、サーバーはリポジトリからすべてのタスクを取得し、
                        <Path>all-tasks</Path>
                        テンプレートを使用してブラウザに送信される次のビューを生成します。
                    </li>
<li>
<code>/tasks/byName</code>へのGETリクエストでは、サーバーは<code>queryString</code>からパラメータ<code>taskName</code>を取得し、一致するタスクを見つけ、
                        <Path>single-task</Path>
                        テンプレートを使用してブラウザに送信される次のビューを生成します。
                    </li>
<li>
<code>/tasks/byPriority</code>へのGETリクエストでは、サーバーは<code>queryString</code>からパラメータ
                        <code>priority</code>を取得し、一致するタスクを見つけ、
                        <Path>tasks-by-priority</Path>
                        テンプレートを使用してブラウザに送信される次のビューを生成します。
                    </li>
</list>
<p>これらすべてが機能するには、追加のテンプレートを追加する必要があります。</p>
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
                ファイルを開き、以下のコンテンツを追加します。
                </p>
<code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;The Selected Task&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
</step>
<step>
<p>同じフォルダに、
                    <Path>tasks-by-priority.html</Path>
                    という新しいファイルを作成します。
                </p>
</step>
<step>
<p>
<Path>tasks-by-priority.html</Path>
                ファイルを開き、以下のコンテンツを追加します。
                </p>
<code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Tasks By Priority &lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Tasks With Priority &lt;span th:text=&quot;${priority}&quot;&gt;&lt;/span&gt;&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
</step>
</procedure>
</chapter>
<chapter title="POSTリクエストのサポートを追加する" id="add-post-requests">
<p>
            次に、以下のことを行うために、<code>/tasks</code>にPOSTリクエストハンドラーを追加します。
        </p>
<list>
<li>フォームパラメータから情報を抽出する。</li>
<li>リポジトリを使用して新しいタスクを追加する。</li>
<li><control>all-tasks</control>テンプレートを再利用してタスクを表示する。</li>
</list>
<procedure>
<step>
<Path>src/main/kotlin/com/example/plugins</Path>
                にある
                <Path>Templating.kt</Path>
                ファイルに移動します。
            </step>
<step>
<p>
<code>configureTemplating()</code>メソッド内に、以下の<code>post</code>リクエストルートを追加します。
                </p>
<code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
</step>
<step>
<p>
                    IntelliJ IDEAで再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEAの再実行アイコン"/>) をクリックしてアプリケーションを再起動します。
                </p>
</step>
<step>
                ブラウザで[http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)に移動します。
            </step>
<step>
<p>
<control>Create or edit a task</control>
                    フォームに新しいタスクの詳細を入力します。
                </p>
<img src="server_create_web_app_new_task.png"
                     alt="HTMLフォームを表示するWebブラウザ" border-effect="rounded" width="706"/>
</step>
<step>
<p>
<control>Submit</control>
                    ボタンをクリックしてフォームを送信します。
                    その後、新しいタスクがすべてのタスクのリストに表示されます。
                </p>
<img src="server_create_web_app_new_task_added.png"
                     alt="タスクのリストを表示するWebブラウザ" border-effect="rounded" width="706"/>
</step>
</procedure>
</chapter>
<chapter title="次のステップ" id="next-steps">
<p>
            おめでとうございます！これで、タスクマネージャーをWebアプリケーションとして再構築し、Thymeleafテンプレートの利用方法を習得しました。</p>
<p>
            Webソケットの操作方法を学ぶために、<Links href="/ktor/server-create-websocket-application" summary="WebSocketsの力を活用してコンテンツを送受信する方法を学びます。">次のチュートリアル</Links>に進んでください。
        </p>
</chapter>
</topic>