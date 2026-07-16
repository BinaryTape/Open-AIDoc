<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="KtorでKotlinのRESTful APIを作成する方法" id="server-create-restful-apis"
       help-id="create-restful-apis">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-restful-api"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用プラグイン</b>: <Links href="/ktor/server-routing" summary="ルーティングは、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">ルーティング</Links>、<Links href="/ktor/server-static-content" summary="スタイルシート、スクリプト、画像などの静的コンテンツを提供する方法を学習します。">静的コンテンツ</Links>、
        <Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプをネゴシエートすることと、コンテンツを特定の形式でシリアライズ/デシリアライズすることという、2つの主要な目的を果たします。">コンテンツネゴシエーション</Links>、 <a
            href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
    </p>
</tldr>
<card-summary>
    KtorでRESTful APIを構築する方法を学びます。このチュートリアルでは、実際の例でセットアップ、ルーティング、テストについて説明します。
</card-summary>
<web-summary>
    KtorでKotlinのRESTful APIを構築する方法を学びます。このチュートリアルでは、実際の例でセットアップ、ルーティング、テストについて説明します。Kotlinバックエンド開発者にとって理想的な入門チュートリアルです。
</web-summary>
<link-summary>
    KotlinとKtorを使用してバックエンドサービスを構築する方法を学びます。JSONファイルを生成するRESTful APIの例を紹介します。
</link-summary>
<p>
    このチュートリアルでは、KotlinとKtorを使用してバックエンドサービスを構築する方法を説明します。JSONファイルを生成するRESTful APIの例も紹介します。
</p>
<p>
    <Links href="/ktor/server-requests-and-responses" summary="タスク管理アプリケーションを構築することで、KtorとKotlinにおけるルーティング、リクエスト処理、パラメーターの基本を学びます。">以前のチュートリアル</Links>では、バリデーション、エラーハンドリング、ユニットテストの基礎を紹介しました。このチュートリアルでは、タスクを管理するためのRESTfulサービスを作成することで、これらのトピックを拡張します。
</p>
<p>
    次のことを学習します。
</p>
<list>
    <li>JSONシリアライズを使用するRESTfulサービスを作成する。</li>
    <li><Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプをネゴシエートすることと、コンテンツを特定の形式でシリアライズ/デシリアライズすることという、2つの主要な目的を果たします。">コンテンツネゴシエーション</Links>のプロセスを理解する。</li>
    <li>Ktor内でREST APIのルートを定義する。</li>
</list>
<chapter title="前提条件" id="prerequisites">
    <p>このチュートリアルは単独で行うこともできますが、
        <Links href="/ktor/server-requests-and-responses" summary="タスク管理アプリケーションを構築することで、KtorとKotlinにおけるルーティング、リクエスト処理、パラメーターの基本を学びます。">リクエストを処理してレスポンスを生成する</Links>方法を学ぶために、先行するチュートリアルを完了することを強くお勧めします。
    </p>
    <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a>をインストールすることをお勧めしますが、任意のIDEを使用することもできます。
    </p>
</chapter>
<chapter title="Hello RESTfulタスクマネージャー" id="hello-restful-task-manager">
    <p>このチュートリアルでは、既存のタスクマネージャーをRESTfulサービスとして書き換えます。これを行うには、いくつかのKtor
        <Links href="/ktor/server-plugins" summary="プラグインは、シリアライズ、コンテンツエンコーディング、圧縮などの共通機能を提供します。">プラグイン</Links>を使用します。</p>
    <p>
        既存のプロジェクトに手動で追加することもできますが、新しいプロジェクトを生成し、以前のチュートリアルのコードを段階的に追加する方が簡単です。すべてのコードを繰り返していくので、以前のプロジェクトを手元に置く必要はありません。
    </p>
    <procedure title="プラグインを使用して新しいプロジェクトを作成する">
        <step>
            <p>
                <a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a>に移動します。
            </p>
        </step>
        <step>
            <p><control>Project artifact</control>
                フィールドに、プロジェクトアーティファクトの名前として<Path>com.example.ktor-rest-task-app</Path>を入力します。
                <img src="tutorial_creating_restful_apis_project_artifact.png"
                     alt="Ktorプロジェクトジェネレーターでのプロジェクトアーティファクトの命名"
                     style="block"
                     border-effect="line"
                     width="706"/>
            </p>
        </step>
        <step>
            <p>
                プラグインセクションで、<control>Add</control>ボタンをクリックして次のプラグインを検索し、追加します。
            </p>
            <list type="bullet">
                <li>Routing</li>
                <li>Content Negotiation</li>
                <li>Kotlinx.serialization</li>
                <li>Static Content</li>
            </list>
            <p>
                <img src="ktor_project_generator_add_plugins.gif" alt="Ktorプロジェクトジェネレーターでのプラグインの追加"
                     border-effect="line"
                     style="block"
                     width="706"/>
                プラグインを追加すると、プロジェクト設定の下に4つのプラグインすべてがリストされます。
                <img src="tutorial_creating_restful_apis_plugins_list.png"
                     alt="Ktorプロジェクトジェネレーターのプラグインリスト"
                     border-effect="line"
                     style="block"
                     width="706"/>
            </p>
        </step>
        <step>
            <p>
                <control>Download</control>ボタンをクリックして、Ktorプロジェクトを生成しダウンロードします。
            </p>
        </step>
    </procedure>
    <procedure title="スターターコードを追加する" id="add-starter-code">
        <step>
            <p>以前に<a href="server-create-a-new-project.topic#open-explore-run">IntelliJ IDEAでKtorプロジェクトを開き、探索し、実行する</a>チュートリアルで説明したように、IntelliJ IDEAでプロジェクトを開きます。</p>
        </step>
        <step>
            <p>
                <Path>src/main/kotlin/com/example</Path>に移動し、<Path>model</Path>というサブパッケージを作成します。
            </p>
        </step>
        <step>
            <p>
                <Path>model</Path>パッケージ内に、新しい<Path>Task.kt</Path>ファイルを作成します。
            </p>
        </step>
        <step>
            <p>
                <Path>Task.kt</Path>ファイルを開き、優先順位を表す<code>enum</code>とタスクを表す<code>class</code>を追加します。
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                以前のチュートリアルでは、拡張関数を使用して<code>Task</code>をHTMLに変換しました。この場合、
                <code>Task</code>クラスは<code>kotlinx.serialization</code>ライブラリの<a
                    href="https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/"><code>Serializable</code></a>型でアノテーションが付けられています。
            </p>
        </step>
        <step>
            <p>
                <Path>Routing.kt</Path>ファイルを開き、既存のコードを以下の実装に置き換えます。
            </p>
            <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respond(&#10;                                    listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                以前のチュートリアルと同様に、URL <code>/tasks</code>へのGETリクエストのルートを作成しました。
                今回は、手動でタスクリストを変換するのではなく、単にリストを返しています。
            </p>
        </step>
        <step>
            <p>IntelliJ IDEAで、実行ボタン
                (<img src="intellij_idea_gutter_icon.svg"
                      style="inline" height="16" width="16"
                      alt="intelliJ IDEA run icon"/>)
                をクリックしてアプリケーションを開始します。</p>
        </step>
        <step>
            <p>
                ブラウザで[http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)に移動します。以下に示すように、タスクリストのJSONバージョンが表示されるはずです。
            </p>
        </step>
        <img src="tutorial_creating_restful_apis_starter_code_preview.png"
             alt="ブラウザ画面に表示されたJSONデータ"
             border-effect="rounded"
             width="706"/>
        <p>明らかに、私たちの代わりに多くの作業が実行されています。一体何が起こっているのでしょうか？</p>
    </procedure>
</chapter>
<chapter title="コンテンツネゴシエーションを理解する" id="content-negotiation">
    <chapter title="ブラウザ経由のコンテンツネゴシエーション" id="via-browser">
        <p>
            プロジェクトを作成したとき、<Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプをネゴシエートすることと、コンテンツを特定の形式でシリアライズ/デシリアライズすることという、2つの主要な目的を果たします。">Content Negotiation</Links>プラグインを含めました。このプラグインは、
            クライアントがレンダリングできるコンテンツのタイプを調べ、これらを現在のサービスが提供できるコンテンツタイプと照合します。これが<format style="italic">コンテンツネゴシエーション</format>という用語の由来です。
        </p>
        <p>
            HTTPでは、クライアントは<code>Accept</code>ヘッダーを介してレンダリングできるコンテンツタイプを通知します。このヘッダーの値は1つ以上のコンテンツタイプです。上記の場合、ブラウザに組み込まれている開発ツールを使用して、このヘッダーの値を調べることができます。
        </p>
        <p>
            次の例を検討してください。
        </p>
        <code-block code="                text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"/>
        <p><code>*/*</code>の組み込みに注意してください。このヘッダーは、HTML、XML、または画像を_受け入れる_ことを示していますが、
            他のコンテンツタイプも_受け入れます_。</p>
        <p>Content Negotiationプラグインは、ブラウザにデータを送り返す形式を見つける必要があります。プロジェクトの生成されたコードを調べると、<Path>src/main/kotlin/com/example</Path>内に<Path>Serialization.kt</Path>というファイルがあり、次の内容が含まれています。</p>
        <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
        <p>
            このコードは<code>ContentNegotiation</code>プラグインをインストールし、<code>kotlinx.serialization</code>プラグインも構成します。これにより、クライアントがリクエストを送信すると、サーバーはJSONとしてシリアライズされたオブジェクトを返送できます。
        </p>
        <p>
            ブラウザからのリクエストの場合、<code>ContentNegotiation</code>プラグインはJSONのみを返すことができることを認識しており、ブラウザは送信されたものを表示しようとします。したがって、リクエストは成功します。
        </p>
    </chapter>
    <procedure title="JavaScript経由のコンテンツネゴシエーション" id="via-javascript">
        <p>
            本番環境では、JSONをブラウザに直接表示したくありません。代わりに、ブラウザ内でJavaScriptコードが実行され、リクエストを行い、返されたデータをシングルページアプリケーション（SPA）の一部として表示します。通常、この種のアプリケーションは<a href="https://react.dev/">React</a>、
            <a href="https://angular.io/">Angular</a>、
            または<a href="https://vuejs.org/">Vue.js</a>のようなフレームワークを使用して記述されます。
        </p>
        <step>
            <p>
                これをシミュレートするには、<Path>src/main/resources/static</Path>内の<Path>index.html</Path>ページを開き、デフォルトのコンテンツを次のもので置き換えます。
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function fetchAndDisplayTasks() {&#10;            fetchTasks()&#10;                .then(tasks =&gt; displayTasks(tasks))&#10;        }&#10;&#10;        function fetchTasks() {&#10;            return fetch(&#10;                &quot;/tasks&quot;,&#10;                {&#10;                    headers: { 'Accept': 'application/json' }&#10;                }&#10;            ).then(resp =&gt; resp.json());&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = document.getElementById(&quot;tasksTableBody&quot;)&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via JS&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:fetchAndDisplayTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            <p>
                このページにはHTMLフォームと空のテーブルが含まれています。フォームを送信すると、JavaScriptイベントハンドラーが
                <code>Accept</code>ヘッダーを<code>application/json</code>に設定して<code>/tasks</code>エンドポイントにリクエストを送信します。返されたデータはデシリアライズされ、HTMLテーブルに追加されます。
            </p>
        </step>
        <step>
            <p>
                IntelliJ IDEAで、再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA rerun icon"/>) をクリックしてアプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>
                URL [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)に移動します。
                <control>View The Tasks</control>ボタンをクリックしてデータを取得できるはずです。
            </p>
            <img src="tutorial_creating_restful_apis_tasks_via_js.png"
                 alt="ボタンとHTMLテーブルとして表示されたタスクを示すブラウザウィンドウ"
                 border-effect="line"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="GETルートを追加する" id="porting-get-routes">
    <p>
        コンテンツネゴシエーションのプロセスに慣れたところで、<Links href="/ktor/server-requests-and-responses" summary="タスク管理アプリケーションを構築することで、KtorとKotlinにおけるルーティング、リクエスト処理、パラメーターの基本を学びます。">以前のチュートリアル</Links>の機能をこのチュートリアルに転送し続けます。
    </p>
    <chapter title="タスクリポジトリを再利用する" id="task-repository">
        <p>
            タスクのリポジトリは修正なしで再利用できるので、まずそれを行います。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>model</Path>パッケージ内に新しい<Path>TaskRepository.kt</Path>ファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>TaskRepository.kt</Path>を開き、以下のコードを追加します。
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="GETリクエストのルートを再利用する" id="get-requests">
        <p>
            リポジトリを作成したので、GETリクエストのルートを実装できます。タスクをHTMLに変換する心配をする必要がないため、以前のコードを簡略化できます。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/main/kotlin/com/example</Path>内の<Path>Routing.kt</Path>ファイルに移動します。
                </p>
            </step>
            <step>
                <p>
                    <code>Application.configureRouting()</code>関数内の<code>/tasks</code>ルートのコードを以下の実装で更新します。
                </p>
                <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.Priority&#10;                    import com.example.model.TaskRepository&#10;                    import io.ktor.http.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            //updated implementation&#10;                            route(&quot;/tasks&quot;) {&#10;                                get {&#10;                                    val tasks = TaskRepository.allTasks()&#10;                                    call.respond(tasks)&#10;                                }&#10;&#10;                                get(&quot;/byName/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;&#10;                                    val task = TaskRepository.taskByName(name)&#10;                                    if (task == null) {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                        return@get&#10;                                    }&#10;                                    call.respond(task)&#10;                                }&#10;                                get(&quot;/byPriority/{priority}&quot;) {&#10;                                    val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                                    if (priorityAsText == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;                                    try {&#10;                                        val priority = Priority.valueOf(priorityAsText)&#10;                                        val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                                        if (tasks.isEmpty()) {&#10;                                            call.respond(HttpStatusCode.NotFound)&#10;                                            return@get&#10;                                        }&#10;                                        call.respond(tasks)&#10;                                    } catch (ex: IllegalArgumentException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        これにより、サーバーは次のGETリクエストに応答できます。</p>
                    <list>
                        <li><code>/tasks</code>: リポジトリ内のすべてのタスクを返します。</li>
                        <li><code>/tasks/byName/{taskName}</code>: 指定された<code>taskName</code>でフィルタリングされたタスクを返します。
                        </li>
                        <li><code>/tasks/byPriority/{priority}</code>: 指定された<code>priority</code>でフィルタリングされたタスクを返します。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        IntelliJ IDEAで、再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="intelliJ IDEA rerun icon"/>) をクリックしてアプリケーションを再起動します。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="機能をテストする" id="test-tasks-routes">
            <procedure title="ブラウザを使用する">
                <p>これらのルートはブラウザでテストできます。たとえば、[http://0.0.0.0:8080/tasks/byPriority/Medium](http://0.0.0.0:8080/tasks/byPriority/Medium)に移動すると、<code>Medium</code>優先順位のすべてのタスクがJSON形式で表示されます。</p>
                <img src="tutorial_creating_restful_apis_tasks_medium_priority.png"
                     alt="中優先順位のタスクがJSON形式で表示されたブラウザウィンドウ"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    これらの種類のリクエストは通常JavaScriptから来ることを考えると、よりきめ細かなテストが望ましいです。これには、<a
                        href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>などの専用ツールを使用できます。
                </p>
            </procedure>
            <procedure title="Postmanを使用する">
                <step>
                    <p>Postmanで、URL <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code>で新しいGETリクエストを作成します。</p>
                </step>
                <step>
                    <p>
                        <ui-path>Headers</ui-path>ペインで、<ui-path>Accept</ui-path>ヘッダーの値を<code>application/json</code>に設定します。
                    </p>
                </step>
                <step>
                    <p><control>Send</control>をクリックしてリクエストを送信し、レスポンスビューアーでレスポンスを確認します。
                    </p>
                    <img src="tutorial_creating_restful_apis_tasks_medium_priority_postman.png"
                         alt="Postmanで中優先順位のタスクをJSON形式で示すGETリクエスト"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
            <procedure title="HTTPリクエストファイルを使用する">
                <p>IntelliJ IDEA Ultimateでは、HTTPリクエストファイルで同じ手順を実行できます。</p>
                <step>
                    <p>
                        プロジェクトのルートディレクトリに、新しい<Path>REST Task Manager.http</Path>ファイルを作成します。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>REST Task Manager.http</Path>ファイルを開き、次のGETリクエストを追加します。
                    </p>
                    <code-block lang="http" code="GET http://0.0.0.0:8080/tasks/byPriority/Medium&#10;Accept: application/json"/>
                </step>
                <step>
                    <p>
                        IntelliJ IDE内でリクエストを送信するには、その横にあるガターアイコン (<img
                            alt="intelliJ IDEA gutter icon"
                            src="intellij_idea_gutter_icon.svg"
                            width="16" height="26"/>) をクリックします。
                    </p>
                </step>
                <step>
                    <p>これは<Path>Services</Path>ツールウィンドウで開かれ、実行されます。
                    </p>
                    <img src="tutorial_creating_restful_apis_tasks_medium_priority_http_file.png"
                         alt="HTTPファイルで中優先順位のタスクをJSON形式で示すGETリクエスト"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
            <note>
                ルートをテストする別の方法として、Kotlin Notebook内から<a
                    href="https://khttp.readthedocs.io/en/latest/">khttp</a>ライブラリを使用することもできます。
            </note>
        </chapter>
    </chapter>
    <chapter title="POSTリクエストのルートを追加する" id="add-a-route-for-post-requests">
        <p>
            以前のチュートリアルでは、HTMLフォームを介してタスクが作成されました。しかし、今回はRESTfulサービスを構築しているため、その必要はありません。代わりに、<code>kotlinx.serialization</code>フレームワークを使用し、ほとんどの重い処理を任せます。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/main/kotlin/com/example</Path>内の<Path>Routing.kt</Path>ファイルを開きます。
                </p>
            </step>
            <step>
                <p>
                    <code>Application.configureRouting()</code>関数に新しいPOSTルートを次のように追加します。
                </p>
                <code-block lang="kotlin" code="                    //...&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            //...&#10;&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;&#10;                                //add the following new route&#10;                                post {&#10;                                    try {&#10;                                        val task = call.receive&lt;Task&gt;()&#10;                                        TaskRepository.addTask(task)&#10;                                        call.respond(HttpStatusCode.Created)&#10;                                    } catch (ex: IllegalStateException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    } catch (ex: SerializationException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    次の新しいインポートを追加します。
                </p>
                <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.Task&#10;                    import io.ktor.serialization.*&#10;                    import io.ktor.server.request.*"/>
                <p>
                    POSTリクエストが<code>/tasks</code>に送信されると、<code>kotlinx.serialization</code>フレームワークがリクエストのボディを<code>Task</code>オブジェクトに変換するために使用されます。これが成功すると、タスクがリポジトリに追加されます。デシリアライズプロセスが失敗した場合は、サーバーは<code>SerializationException</code>を処理する必要があり、タスクが重複している場合は<code>IllegalStateException</code>を処理する必要があります。
                </p>
            </step>
            <step>
                <p>
                    アプリケーションを再起動します。
                </p>
            </step>
            <step>
                <p>
                    この機能をPostmanでテストするには、URL <code>http://0.0.0.0:8080/tasks</code>に新しいPOSTリクエストを作成します。
                </p>
            </step>
            <step>
                <p>
                    <ui-path>Body</ui-path>ペインに、新しいタスクを表す次のJSONドキュメントを追加します。
                </p>
                <code-block lang="json" code="{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
                <img src="tutorial_creating_restful_apis_add_task.png"
                     alt="新しいタスクを追加するためのPostmanでのPOSTリクエスト"
                     border-effect="line"
                     width="706"/>
            </step>
            <step>
                <p><control>Send</control>をクリックしてリクエストを送信します。
                </p>
            </step>
            <step>
                <p>
                    [http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)にGETリクエストを送信することで、タスクが追加されたことを確認できます。
                </p>
            </step>
            <step>
                <p>
                    IntelliJ IDEA Ultimateでは、HTTPリクエストファイルに次を追加することで同じ手順を実行できます。
                </p>
                <code-block lang="http" code="###&#10;&#10;POST http://0.0.0.0:8080/tasks&#10;Content-Type: application/json&#10;&#10;{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="削除のサポートを追加する" id="remove-tasks">
        <p>
            サービスの基本的な操作の追加はほぼ完了しました。これらはしばしばCRUD操作（作成、読み取り、更新、削除の略）として要約されます。次に、削除操作を実装します。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>TaskRepository.kt</Path>ファイルで、<code>TaskRepository</code>オブジェクト内に、名前でタスクを削除する次のメソッドを追加します。
                </p>
                <code-block lang="kotlin" code="    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }"/>
            </step>
            <step>
                <p>
                    <Path>Routing.kt</Path>ファイルを開き、DELETEリクエストを処理するためのエンドポイントを<code>routing()</code>関数に追加します。
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        //...&#10;&#10;                        routing {&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;                                //add the following function&#10;                                delete(&quot;/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@delete&#10;                                    }&#10;&#10;                                    if (TaskRepository.removeTask(name)) {&#10;                                        call.respond(HttpStatusCode.NoContent)&#10;                                    } else {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    アプリケーションを再起動します。
                </p>
            </step>
            <step>
                <p>
                    HTTPリクエストファイルに次のDELETEリクエストを追加します。
                </p>
                <code-block lang="http" code="###&#10;&#10;DELETE http://0.0.0.0:8080/tasks/gardening"/>
            </step>
            <step>
                <p>
                    IntelliJ IDE内でDELETEリクエストを送信するには、その横にあるガターアイコン (<img
                        alt="intelliJ IDEA gutter icon"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>) をクリックします。
                </p>
            </step>
            <step>
                <p><Path>Services</Path>ツールウィンドウにレスポンスが表示されます。
                </p>
                <img src="tutorial_creating_restful_apis_delete_task.png"
                     alt="HTTPリクエストファイル内のDELETEリクエスト"
                     border-effect="line"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="Ktorクライアントでユニットテストを作成する" id="create-unit-tests">
        <p>
            これまではアプリケーションを手動でテストしていましたが、既にお気づきのとおり、このアプローチは時間がかかり、スケーラブルではありません。代わりに、組み込みの
            <code>client</code>オブジェクトを使用してJSONを取得し、デシリアライズする<Links href="/ktor/server-testing" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学習します。">JUnitテスト</Links>を実装できます。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/test/kotlin/com/example</Path>内の<Path>ApplicationTest.kt</Path>ファイルを開きます。
                </p>
            </step>
            <step>
                <p>
                    <Path>ApplicationTest.kt</Path>ファイルの内容を次のもので置き換えます。
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.Created, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                <p>
                    サーバーで行ったのと同様に、<a href="client-create-and-configure.md#plugins">プラグイン</a>に<code>ContentNegotiation</code>プラグインと<code>kotlinx.serialization</code>プラグインをインストールする必要があることに注意してください。
                </p>
            </step>
            <step>
                <p>
                    <Path>gradle/libs.versions.toml</Path>にあるバージョンカタログに次の依存関係を追加します。
                </p>
                <code-block lang="yaml" code="                    [libraries]&#10;                    # ...&#10;                    ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor-version&quot; }"/>
            </step>
            <step>
                <p>
                    <Path>build.gradle.kts</Path>ファイルに新しい依存関係を追加します。
                </p>
                <code-block lang="kotlin" code="                    testImplementation(libs.ktor.client.content.negotiation)"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="JsonPathでユニットテストを作成する" id="unit-tests-via-jsonpath">
        <p>
            Ktorクライアントや類似のライブラリでサービスをテストするのは便利ですが、品質保証（QA）の観点から見ると欠点があります。サーバーはJSONを直接処理しないため、JSON構造に関する前提が正しいかどうかを確実に判断できません。
        </p>
        <p>
            たとえば、次のような前提です。
        </p>
        <list>
            <li>値が実際には<code>object</code>が使用されているにもかかわらず、<code>array</code>に格納されている。</li>
            <li>プロパティが実際には<code>strings</code>であるにもかかわらず、<code>numbers</code>として格納されている。</li>
            <li>メンバーが宣言順にシリアライズされていないのに、そのようにされている。</li>
        </list>
        <p>
            サービスが複数のクライアントで使用されることを意図している場合、JSON構造に信頼性を持たせることは非常に重要です。これを実現するには、Ktorクライアントを使用してサーバーからテキストを取得し、<a href="https://mvnrepository.com/artifact/com.jayway.jsonpath/json-path">JSONPath</a>
            ライブラリを使用してこのコンテンツを分析します。</p>
        <procedure>
            <step>
                <p><Path>build.gradle.kts</Path>ファイルで、<code>dependencies</code>ブロックにJSONPathライブラリを追加します。
                </p>
                <code-block lang="kotlin" code="    testImplementation(&quot;com.jayway.jsonpath:json-path:2.9.0&quot;)"/>
            </step>
            <step>
                <p>
                    <Path>src/test/kotlin/com/example</Path>フォルダに移動し、新しい<Path>ApplicationJsonPathTest.kt</Path>ファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>ApplicationJsonPathTest.kt</Path>ファイルを開き、以下のコンテンツを追加します。
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.jayway.jsonpath.DocumentContext&#10;import com.jayway.jsonpath.JsonPath&#10;import io.ktor.client.*&#10;import com.example.model.Priority&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;import io.ktor.http.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;&#10;class ApplicationJsonPathTest {&#10;    @Test&#10;    fun tasksCanBeFound() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks&quot;)&#10;&#10;        val result: List&lt;String&gt; = jsonDoc.read(&quot;$[*].name&quot;)&#10;        assertEquals(&quot;cleaning&quot;, result[0])&#10;        assertEquals(&quot;gardening&quot;, result[1])&#10;        assertEquals(&quot;shopping&quot;, result[2])&#10;    }&#10;&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val priority = Priority.Medium&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks/byPriority/$priority&quot;)&#10;&#10;        val result: List&lt;String&gt; =&#10;            jsonDoc.read(&quot;$[?(@.priority == '$priority')].name&quot;)&#10;        assertEquals(2, result.size)&#10;&#10;        assertEquals(&quot;gardening&quot;, result[0])&#10;        assertEquals(&quot;painting&quot;, result[1])&#10;    }&#10;&#10;    suspend fun HttpClient.getAsJsonPath(url: String): DocumentContext {&#10;        val response = this.get(url) {&#10;            accept(ContentType.Application.Json)&#10;        }&#10;        return JsonPath.parse(response.bodyAsText())&#10;    }&#10;}"/>
                <p>
                    JsonPathクエリは次のように機能します。
                </p>
                <list>
                    <li>
                        <code>$[*].name</code>: 「ドキュメントを配列として扱い、各エントリの名前プロパティの値を返す」という意味です。
                    </li>
                    <li>
                        <code>$[?(@.priority == '$priority')].name</code>: 「配列内の、指定された値と等しい優先順位を持つすべてのエントリの名前プロパティの値を返す」という意味です。
                    </li>
                </list>
                <p>
                    これらのクエリを使用して、返されたJSONの理解を確認できます。コードのリファクタリングやサービスの再デプロイを行う際、シリアライズの変更は、現在のフレームワークでのデシリアライズを中断しない場合でも特定されます。これにより、自信を持って公開APIを再公開できます。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="次のステップ" id="next-steps">
        <p>
            おめでとうございます！タスクマネージャーアプリケーションのRESTful APIサービスの作成を完了し、KtorクライアントとJsonPathを使用したユニットテストの細部を学習しました。</p>
        <p>
            次の<Links href="/ktor/server-create-website" summary="KtorとThymeleafテンプレートを使用してKotlinでウェブサイトを構築する方法を学びます。">チュートリアル</Links>に進み、APIサービスを再利用してウェブアプリケーションを構築する方法を学びましょう。
        </p>
    </chapter>
</topic>