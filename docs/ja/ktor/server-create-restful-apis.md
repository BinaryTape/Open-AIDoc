<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Ktor を使用して Kotlin で RESTful API を作成する方法" id="server-create-restful-apis"
       help-id="create-restful-apis">
<show-structure for="chapter" depth="2"/>
<tldr>
        <var name="example_name" value="tutorial-server-restful-api"/>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用プラグイン</b>: <Links href="server-routing.md" summary="Routing is a core plugin for handling incoming requests in a server application.">Routing</Links>、<Links href="server-static-content.md" summary="Learn how to serve static content, such as stylesheets, scripts, images, and so on.">Static Content</Links>、
            <Links href="server-serialization.md" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">Content Negotiation</Links>、<a
                href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
        </p>
    </tldr>
    <card-summary>
        Ktor で RESTful API を構築する方法を学びます。このチュートリアルでは、実際の例を用いてセットアップ、ルーティング、テストについて解説します。
    </card-summary>
    <web-summary>
        Ktor を使用して Kotlin で RESTful API を構築する方法を学びます。このチュートリアルでは、実際の例を用いてセットアップ、ルーティング、テストを網羅しています。Kotlin バックエンド開発者の入門として最適です。
    </web-summary>
    <link-summary>
        Kotlin と Ktor を使用してバックエンドサービスを構築する方法を、JSON ファイルを生成する RESTful API の例を通して学びます。
    </link-summary>
    <p>
        このチュートリアルでは、JSON データを生成する RESTful API の例を取り上げながら、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を説明します。
    </p>
    <p>
        <Links href="server-requests-and-responses.topic" summary="Learn the basics of routing, handling requests, and parameters in Kotlin with Ktor by
        building a task manager application.">前回のチュートリアル</Links>では、バリデーション、エラーハンドリング、ユニットテストの基礎を紹介しました。今回はこれらのトピックを発展させ、タスクを管理するための RESTful サービスを作成します。
    </p>
    <p>
        このチュートリアルで学べる内容は以下のとおりです:
    </p>
    <list>
        <li>JSON シリアライゼーションを使用する RESTful サービスの作成</li>
        <li><Links href="server-serialization.md" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">Content Negotiation</Links>（コンテンツネゴシエーション）のプロセスの理解</li>
        <li>Ktor 内での REST API 向けルート（Route）の定義</li>
    </list>
    <chapter title="前提条件" id="prerequisites">
        <p>このチュートリアルは単独で進めることも可能ですが、事前に前回のチュートリアルを完了して、<Links href="server-requests-and-responses.topic" summary="Learn the basics of routing, handling requests, and parameters in Kotlin with Ktor by
        building a task manager application.">リクエストの処理とレスポンスの生成</Links>方法を学んでおくことを強くお勧めします。
        </p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a> のインストールを推奨しますが、お好みの別の IDE を使用しても構いません。
        </p>
    </chapter>
    <chapter title="Hello RESTful Task Manager" id="hello-restful-task-manager">
        <p>このチュートリアルでは、既存のタスクマネージャーを RESTful サービスとして書き換えます。これを行うために、いくつかの Ktor <Links href="server-plugins.md" summary="Plugins provide common functionality, such as serialization, content encoding, compression, and so on.">プラグイン</Links>を使用します。</p>
        <p>
            既存のプロジェクトに手動で追加することもできますが、新しいプロジェクトを生成してから前回のチュートリアルのコードを段階的に追加していく方が簡単です。必要なコードは進めながら再度すべて提示されるため、手元に前回のプロジェクトを用意していなくても問題ありません。
        </p>
        <procedure title="プラグインを含む新しいプロジェクトを作成する">
            <step>
                <p>
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>
                    にアクセスします。
                </p>
            </step>
            <step>
                <p><control>Project artifact</control>
                    フィールドに、プロジェクトのアーティファクト名として
                    <Path>com.example.ktor-rest-task-app</Path>
                    を入力します。
                    <img src="tutorial_creating_restful_apis_project_artifact.png"
                         alt="Ktor Project Generator でのプロジェクトアーティファクト名の入力"
                         style="block"
                         border-effect="line"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    プラグインのセクションで、<control>Add</control> ボタンをクリックして以下のプラグインを検索し、追加します:
                </p>
                <list type="bullet">
                    <li>Content Negotiation</li>
                    <li>kotlinx.serialization</li>
                    <li>Static Content</li>
                </list>
                <p>
                    <img src="ktor_project_generator_add_plugins.gif" alt="Ktor Project Generator でのプラグイン追加"
                         border-effect="line"
                         style="block"
                         width="706"/>
                    プラグインを追加すると、プロジェクト設定の下にすべてのプラグインが表示されます。
                    <img src="tutorial_creating_restful_apis_plugins_list.png"
                         alt="Ktor Project Generator のプラグインリスト"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    <control>Download</control>
                    ボタンをクリックして、Ktor プロジェクトを生成・ダウンロードします。
                </p>
            </step>
        </procedure>
        <procedure title="スターターコードを追加する" id="add-starter-code">
            <step>
                <p><a href="server-create-a-new-project.topic#open-explore-run">Ktor プロジェクトの作成、オープン、実行</a>のチュートリアルで説明したように、IntelliJ IDEA でプロジェクトを開きます。</p>
            </step>
            <step>
                <p>
                    <Path>src/main/kotlin</Path>
                    に移動し、<Path>model</Path>
                    というサブパッケージを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>model</Path>
                    パッケージ内に、新しい
                    <Path>Task.kt</Path>
                    ファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>Task.kt</Path>
                    ファイルを開き、優先度を表す <code>enum</code> とタスクを表す <code>class</code> を追加します:
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    前回のチュートリアルでは、<code>Task</code> を HTML に変換するために拡張関数を使用しました。今回は、<code>Task</code> クラスに <code>kotlinx.serialization</code> ライブラリの <a
                        href="https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/"><code>Serializable</code></a>
                    型のアノテーションを付与しています。
                </p>
            </step>
            <step>
                <p>
                    <Path>Routing.kt</Path>
                    ファイルを開き、既存のコードを以下の実装に置き換えます:
                </p>
                <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respond(&#10;                                    listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    前回のチュートリアルと同様に、URL <code>/tasks</code> に対する GET リクエスト用のルートを作成しました。今回はタスクのリストを手動で変換する代わりに、単にそのリストを返しています。
                </p>
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
                    ブラウザで <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a> にアクセスします。以下のように、タスクリストの JSON 表現が表示されるはずです:
                </p>
            </step>
            <img src="tutorial_creating_restful_apis_starter_code_preview.png"
                 alt="ブラウザ画面に表示された JSON データ"
                 border-effect="rounded"
                 width="706"/>
            <p>明らかに多くの処理が内部で自動的に行われています。実際にはどのような処理が起きているのでしょうか？</p>
        </procedure>
    </chapter>
    <chapter title="Content Negotiation の理解" id="content-negotiation">
        <chapter title="ブラウザを介した Content Negotiation" id="via-browser">
            <p>
                プロジェクトを作成した際、<Links href="server-serialization.md" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">Content Negotiation</Links>
                プラグインを含めました。このプラグインは、クライアントがレンダリングできるコンテンツの種類を確認し、それらを現在のサービスが提供可能なコンテンツタイプと照合します。これこそが、<format style="italic">Content Negotiation（コンテンツネゴシエーション）</format>と呼ばれる理由です。
            </p>
            <p>
                HTTP では、クライアントは <code>Accept</code> ヘッダーを通じて自身がレンダリング可能なコンテンツタイプを伝達します。このヘッダーの値には、1 つ以上のコンテンツタイプが指定されます。上記のケースでは、ブラウザに組み込まれている開発者ツールを使用して、このヘッダーの値を確認できます。
            </p>
            <p>
                以下の例を見てみましょう:
            </p>
            <code-block code="                text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"/>
            <p><code>&#42;/&#42;</code> が含まれていることに注目してください。このヘッダーは、HTML、XML、または画像を受け入れることを示していますが、それ以外のあらゆるコンテンツタイプも受け入れることを意味します。</p>
            <p>Content Negotiation プラグインは、ブラウザにデータを返送するためのフォーマットを見つける必要があります。プロジェクト内の生成されたコードを確認すると、<Path>src/main/kotlin</Path>
                内に
                <Path>Serialization.kt</Path>
                というファイルがあり、以下のような内容が含まれています:
            </p>
            <code-block lang="kotlin" code="fun Application.configureSerialization() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;}"/>
            <p>
                このコードは <code>ContentNegotiation</code> プラグインをインストールし、さらに <code>kotlinx.serialization</code> プラグインの設定も行っています。これにより、クライアントからリクエストが送信された際、サーバーは JSON としてシリアライズされたオブジェクトを返すことができます。
            </p>
            <p>
                ブラウザからのリクエストの場合、<code>ContentNegotiation</code> プラグインは JSON しか返せないことを認識しており、ブラウザ側は送られてきたあらゆるものを表示しようとします。そのため、リクエストは正常に処理されます。
            </p>
        </chapter>
        <procedure title="JavaScript を介した Content Negotiation" id="via-javascript">
            <p>
                本番環境では、ブラウザに直接 JSON を表示することは通常ありません。代わりに、ブラウザで実行されている JavaScript コードがリクエストを行い、返されたデータを Single Page Application (SPA) の一部として表示します。通常、この種のアプリケーションは <a href="https://react.dev/">React</a>、<a href="https://angular.io/">Angular</a>、または <a href="https://vuejs.org/">Vue.js</a> などのフレームワークを使用して記述されます。
            </p>
            <step>
                <p>
                    これをシミュレートするために、<Path>src/main/resources/static</Path>
                    内の
                    <Path>index.html</Path>
                    ページを開き、デフォルトのコンテンツを以下の内容に置き換えます:
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function fetchAndDisplayTasks() {&#10;            fetchTasks()&#10;                .then(tasks =&gt; displayTasks(tasks))&#10;        }&#10;&#10;        function fetchTasks() {&#10;            return fetch(&#10;                &quot;/tasks&quot;,&#10;                {&#10;                    headers: { 'Accept': 'application/json' }&#10;                }&#10;            ).then(resp =&gt; resp.json());&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = document.getElementById(&quot;tasksTableBody&quot;)&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via JS&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:fetchAndDisplayTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    このページには、HTML フォームと空のテーブルが含まれています。フォームを送信すると、JavaScript のイベントハンドラーが <code>Accept</code> ヘッダーを <code>application/json</code> に設定して <code>/tasks</code> エンドポイントにリクエストを送信します。返されたデータはデシリアライズされ、HTML テーブルに追加されます。
                </p>
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
                    URL <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a> にアクセスします。
                    <control>View The Tasks</control>
                    ボタンをクリックすると、データを取得できるはずです:
                </p>
                <img src="tutorial_creating_restful_apis_tasks_via_js.png"
                     alt="ボタンと HTML テーブルとして表示されたタスクを示すブラウザウィンドウ"
                     border-effect="line"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="GET ルートを追加する" id="porting-get-routes">
        <p>
            Content Negotiation のプロセスを理解できたので、<Links href="server-requests-and-responses.topic" summary="Learn the basics of routing, handling requests, and parameters in Kotlin with Ktor by
        building a task manager application.">前回のチュートリアル</Links>の機能を今回実装するサービスへ移行していきましょう。
        </p>
        <chapter title="タスクリポジトリの再利用" id="task-repository">
            <p>
                タスクのリポジトリは変更することなく再利用できるため、まずそれから始めます。
            </p>
            <procedure>
                <step>
                    <p>
                        <Path>model</Path>
                        パッケージ内に、新しい
                        <Path>TaskRepository.kt</Path>
                        ファイルを作成します。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>TaskRepository.kt</Path>
                        を開き、以下のコードを追加します:
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="GET リクエスト用ルートの再利用" id="get-requests">
            <p>
                リポジトリを作成したので、GET リクエスト用のルートを実装できます。タスクを HTML に変換する処理を考慮する必要がなくなったため、前回のコードを簡素化できます:
            </p>
            <procedure>
                <step>
                    <p>
                        <Path>src/main/kotlin</Path>
                        内の
                        <Path>Routing.kt</Path>
                        ファイルに移動します。
                    </p>
                </step>
                <step>
                    <p>
                        <code>Application.configureRouting()</code> 関数内の <code>/tasks</code> ルートのコードを、以下の実装で更新します:
                    </p>
                    <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.Priority&#10;                    import com.example.model.TaskRepository&#10;                    import io.ktor.http.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            //updated implementation&#10;                            route(&quot;/tasks&quot;) {&#10;                                get {&#10;                                    val tasks = TaskRepository.allTasks()&#10;                                    call.respond(tasks)&#10;                                }&#10;&#10;                                get(&quot;/byName/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;&#10;                                    val task = TaskRepository.taskByName(name)&#10;                                    if (task == null) {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                        return@get&#10;                                    }&#10;                                    call.respond(task)&#10;                                }&#10;                                get(&quot;/byPriority/{priority}&quot;) {&#10;                                    val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                                    if (priorityAsText == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;                                    try {&#10;                                        val priority = Priority.valueOf(priorityAsText)&#10;                                        val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                                        if (tasks.isEmpty()) {&#10;                                            call.respond(HttpStatusCode.NotFound)&#10;                                            return@get&#10;                                        }&#10;                                        call.respond(tasks)&#10;                                    } catch (ex: IllegalArgumentException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        これにより、サーバーは以下の GET リクエストに応答できるようになります:</p>
                    <list>
                        <li><code>/tasks</code>: リポジトリ内のすべてのタスクを返します。</li>
                        <li><code>/tasks/byName/{taskName}</code>: 指定された <code>taskName</code> でフィルタリングされたタスクを返します。</li>
                        <li><code>/tasks/byPriority/{priority}</code>: 指定された <code>priority</code> でフィルタリングされたタスクを返します。</li>
                    </list>
                </step>
                <step>
                    <p>
                        IntelliJ IDEA で再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="intelliJ IDEA rerun icon"/>) をクリックしてアプリケーションを再起動します。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="機能のテスト" id="test-tasks-routes">
            <procedure title="ブラウザを使用する">
                <p>これらのルートはブラウザでテストできます。たとえば、<a
                        href="http://0.0.0.0:8080/tasks/byPriority/Medium">http://0.0.0.0:8080/tasks/byPriority/Medium</a> にアクセスすると、優先度が <code>Medium</code> のすべてのタスクが JSON 形式で表示されます:</p>
                <img src="tutorial_creating_restful_apis_tasks_medium_priority.png"
                     alt="優先度が medium のタスクを JSON 形式で表示するブラウザウィンドウ"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    この種のリクエストは通常 JavaScript から行われることを考えると、より詳細なテストを行うことが望ましいです。これには、<a
                        href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a> などの専用ツールの使用が適しています。
                </p>
            </procedure>
            <procedure title="Postman を使用する">
                <step>
                    <p>Postman で、URL <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code> を指定した新しい GET リクエストを作成します。</p>
                </step>
                <step>
                    <p>
                        <ui-path>Headers</ui-path>
                        ペインで、<ui-path>Accept</ui-path>
                        ヘッダーの値を <code>application/json</code> に設定します。
                    </p>
                </step>
                <step>
                    <p><control>Send</control> をクリックしてリクエストを送信し、レスポンスビューアーでレスポンスを確認します。
                    </p>
                    <img src="tutorial_creating_restful_apis_tasks_medium_priority_postman.png"
                         alt="Postman での GET リクエストと、JSON 形式で表示された優先度 medium のタスク"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
            <procedure title="HTTP リクエストファイルを使用する">
                <p>IntelliJ IDEA Ultimate では、HTTP リクエストファイル（.http）を使用して同じ手順を実行できます。</p>
                <step>
                    <p>
                        プロジェクトのルートディレクトリに、新しい
                        <Path>REST Task Manager.http</Path>
                        ファイルを作成します。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>REST Task Manager.http</Path>
                        ファイルを開き、以下の GET リクエストを追加します:
                    </p>
                    <code-block lang="http" code="GET http://0.0.0.0:8080/tasks/byPriority/Medium&#10;Accept: application/json"/>
                </step>
                <step>
                    <p>
                        IntelliJ IDEA 内からリクエストを送信するには、リクエストの横にあるガターアイコン（<img
                            alt="intelliJ IDEA gutter icon"
                            src="intellij_idea_gutter_icon.svg"
                            width="16" height="26"/>）をクリックします。
                    </p>
                </step>
                <step>
                    <p>リクエストが実行され、<Path>Services</Path> ツールウィンドウに結果が表示されます:
                    </p>
                    <img src="tutorial_creating_restful_apis_tasks_medium_priority_http_file.png"
                         alt="HTTP ファイルでの GET リクエストと、JSON 形式で表示された優先度 medium のタスク"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
            <note>
                ルートをテストするもう 1 つの方法として、Kotlin Notebook 内から <a
                    href="https://khttp.readthedocs.io/en/latest/">khttp</a> ライブラリを使用することもできます。
            </note>
        </chapter>
    </chapter>
    <chapter title="POST リクエスト用ルートの追加" id="add-a-route-for-post-requests">
        <p>
            前回のチュートリアルでは、HTML フォームを介してタスクを作成しました。しかし、現在は RESTful サービスを構築しているため、その方法は不要です。代わりに <code>kotlinx.serialization</code> フレームワークを活用し、主要な処理の大半をこれに任せます。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/main/kotlin</Path>
                    内の
                    <Path>Routing.kt</Path>
                    ファイルを開きます。
                </p>
            </step>
            <step>
                <p>
                    <code>Application.configureRouting()</code> 関数に以下のように新しい POST ルートを追加します:
                </p>
                <code-block lang="kotlin" code="                    //...&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            //...&#10;&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;&#10;                                //add the following new route&#10;                                post {&#10;                                    try {&#10;                                        val task = call.receive&lt;Task&gt;()&#10;                                        TaskRepository.addTask(task)&#10;                                        call.respond(HttpStatusCode.Created)&#10;                                    } catch (ex: IllegalStateException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    } catch (ex: SerializationException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    以下の新しい import 文を追加します:
                </p>
                <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.Task&#10;                    import io.ktor.server.request.receive&#10;                    import kotlinx.serialization.SerializationException"/>
                <p>
                    <code>/tasks</code> に POST リクエストが送信されると、<code>kotlinx.serialization</code> フレームワークを使用してリクエストボディが <code>Task</code> オブジェクトに変換されます。これが成功すると、タスクがリポジトリに追加されます。デシリアライズ処理に失敗した場合は <code>SerializationException</code> が処理され、タスクが重複していた場合は <code>IllegalStateException</code> が処理されます。
                </p>
            </step>
            <step>
                <p>
                    アプリケーションを再起動します。
                </p>
            </step>
            <step>
                <p>
                    Postman でこの機能をテストするには、URL <code>http://0.0.0.0:8080/tasks</code> への新しい POST リクエストを作成します。
                </p>
            </step>
            <step>
                <p>
                    <ui-path>Body</ui-path>
                    パネルで、新しいタスクを表す以下の JSON ドキュメントを追加します:
                </p>
                <code-block lang="json" code="{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
                <img src="tutorial_creating_restful_apis_add_task.png"
                     alt="新しいタスクを追加するための Postman での POST リクエスト"
                     border-effect="line"
                     width="706"/>
            </step>
            <step>
                <p><control>Send</control>
                    をクリックしてリクエストを送信します。
                </p>
            </step>
            <step>
                <p>
                    <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a> 宛てに GET リクエストを送信することで、タスクが追加されたことを確認できます。
                </p>
            </step>
            <step>
                <p>
                    IntelliJ IDEA Ultimate では、HTTP リクエストファイルに以下を追加することで同じ手順を実行できます:
                </p>
                <code-block lang="http" code="###&#10;&#10;POST http://0.0.0.0:8080/tasks&#10;Content-Type: application/json&#10;&#10;{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="削除のサポートを追加する" id="remove-tasks">
        <p>
            サービスへの基本的な操作の追加はほぼ完了しました。これらは通常、CRUD（作成: Create、読み取り: Read、更新: Update、削除: Delete）操作としてまとめられます。ここでは削除（Delete）操作を実装します。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>TaskRepository.kt</Path>
                    ファイル内の <code>TaskRepository</code> オブジェクトに、名前に基づいてタスクを削除する以下のメソッドを追加します:
                </p>
                <code-block lang="kotlin" code="    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }"/>
            </step>
            <step>
                <p>
                    <Path>Routing.kt</Path>
                    ファイルを開き、DELETE リクエストを処理するエンドポイントを <code>routing()</code> 関数内に追加します:
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
                    HTTP リクエストファイルに以下の DELETE リクエストを追加します:
                </p>
                <code-block lang="http" code="###&#10;&#10;DELETE http://0.0.0.0:8080/tasks/gardening"/>
            </step>
            <step>
                <p>
                    IntelliJ IDEA 内から DELETE リクエストを送信するには、リクエストの横にあるガターアイコン（<img
                        alt="intelliJ IDEA gutter icon"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>）をクリックします。
                </p>
            </step>
            <step>
                <p><Path>Services</Path>
                    ツールウィンドウにレスポンスが表示されます:
                </p>
                <img src="tutorial_creating_restful_apis_delete_task.png"
                     alt="HTTP リクエストファイルでの DELETE リクエスト"
                     border-effect="line"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="Ktor Client を使用したユニットテストの作成" id="create-unit-tests">
        <p>
            ここまではアプリケーションを手動でテストしてきましたが、すでにお気づきのとおり、この方法は時間がかかり拡張性がありません。代わりに、組み込みの <code>client</code> オブジェクトを使用して JSON の取得とデシリアライズを行う <Links href="server-testing.md" summary="Learn how to test your server application using a special testing engine.">JUnit テスト</Links>を実装できます。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/test/kotlin</Path>
                    内にある
                    <Path>ServerTest.kt</Path>
                    ファイルを開きます。
                </p>
            </step>
            <step>
                <p>
                    <Path>ServerTest.kt</Path>
                    ファイルの内容を以下のように置き換えます:
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        configure()&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.Created, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                <p>
                    サーバー側で行ったのと同様に、<a href="client-create-and-configure.md#plugins">Ktor client</a> にも <code>ContentNegotiation</code> および <code>kotlinx.serialization</code> プラグインをインストールする必要がある点に注意してください。
                </p>
            </step>
            <step>
                <p>
                    <Path>build.gradle.kts</Path>
                    ファイルに以下の依存関係を追加します:
                </p>
                <code-block lang="kotlin" code="                    testImplementation(ktorLibs.client.contentNegotiation)"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="JsonPath を使用したユニットテストの作成" id="unit-tests-via-jsonpath">
        <p>
            Ktor クライアントまたは同様のライブラリを使用したサービスのテストは便利ですが、品質保証（QA）の観点からは欠点もあります。サーバーは JSON を直接処理していないため、JSON の構造についての前提が正しいかを完全に確信することはできません。
        </p>
        <p>
            たとえば、以下のような想定ミスがあり得ます:
        </p>
        <list>
            <li>実際には <code>object</code> が使用されているのに、値が <code>array</code> に格納されていると思い込んでいる。</li>
            <li>実際には <code>string</code> であるプロパティが、<code>number</code> として格納されていると思い込んでいる。</li>
            <li>宣言順にはシリアライズされないにもかかわらず、宣言順にシリアライズされていると思い込んでいる。</li>
        </list>
        <p>
            サービスが複数のクライアントによって使用されることを意図している場合、JSON の構造に確信を持つことが極めて重要です。これを実現するために、Ktor Client を使用してサーバーからテキストを取得し、<a href="https://mvnrepository.com/artifact/com.jayway.jsonpath/json-path">JSONPath</a> ライブラリを使用してその内容を解析します。</p>
        <procedure>
            <step>
                <p>
                    <Path>gradle/libs.versions.toml</Path> ファイルを開き、JSONPath のバージョンとそのライブラリエイリアスを定義します:
                </p>
                <code-block lang="toml" code="[versions]&#10;json-path = &quot;2.9.0&quot;&#10;[libraries]&#10;json-path = { module = &quot;com.jayway.jsonpath:json-path&quot;, version.ref = &quot;json-path&quot; }"/>
            </step>
            <step>
                <p><Path>build.gradle.kts</Path>
                    ファイルの <code>dependencies</code> ブロックに JSONPath ライブラリを追加します:
                </p>
                <code-block lang="kotlin" code="    testImplementation(libs.json.path)"/>
            </step>
            <step>
                <p>
                    <Path>src/test/kotlin</Path>
                    フォルダーに移動し、新しい
                    <Path>ApplicationJsonPathTest.kt</Path>
                    ファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>ApplicationJsonPathTest.kt</Path>
                    ファイルを開き、以下の内容を追加します:
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.jayway.jsonpath.DocumentContext&#10;import com.jayway.jsonpath.JsonPath&#10;import io.ktor.client.*&#10;import com.example.model.Priority&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;import io.ktor.http.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;&#10;class ApplicationJsonPathTest {&#10;    @Test&#10;    fun tasksCanBeFound() = testApplication {&#10;        configure()&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks&quot;)&#10;&#10;        val result: List&lt;String&gt; = jsonDoc.read(&quot;$[*].name&quot;)&#10;        assertEquals(&quot;cleaning&quot;, result[0])&#10;        assertEquals(&quot;gardening&quot;, result[1])&#10;        assertEquals(&quot;shopping&quot;, result[2])&#10;    }&#10;&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;        val priority = Priority.Medium&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks/byPriority/$priority&quot;)&#10;&#10;        val result: List&lt;String&gt; =&#10;            jsonDoc.read(&quot;$[?(@.priority == '$priority')].name&quot;)&#10;        assertEquals(2, result.size)&#10;&#10;        assertEquals(&quot;gardening&quot;, result[0])&#10;        assertEquals(&quot;painting&quot;, result[1])&#10;    }&#10;&#10;    suspend fun HttpClient.getAsJsonPath(url: String): DocumentContext {&#10;        val response = this.get(url) {&#10;            accept(ContentType.Application.Json)&#10;        }&#10;        return JsonPath.parse(response.bodyAsText())&#10;    }&#10;}"/>
                <p>
                    JsonPath のクエリは以下のように機能します:
                </p>
                <list>
                    <li>
                        <code>$[&#42;].name</code> は、「ドキュメントを配列として扱い、各エントリの name プロパティの値を返す」ことを意味します。
                    </li>
                    <li>
                        <code>$[?(@.priority == '$priority')].name</code> は、「配列内のエントリのうち、priority が指定された値と一致するすべてのエントリの name プロパティの値を返す」ことを意味します。
                    </li>
                </list>
                <p>
                    このようなクエリを使用することで、返される JSON に対する理解が正しいことを確認できます。コードのリファクタリングやサービスの再デプロイを行う際、現行のフレームワークでのデシリアライズを壊さないような変更であっても、シリアライゼーションの変更点が検出されます。これにより、自信を持って公開 API を再リリースできるようになります。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="次のステップ" id="next-steps">
        <p>
            お疲れ様でした！これで、タスクマネージャーアプリケーション用の RESTful API サービスの作成が完了し、Ktor Client と JsonPath を使用したユニットテストの詳細について学びました。</p>
        <p>
            API サービスを再利用して Web アプリケーションを構築する方法を学ぶには、<Links href="server-create-website.topic" summary="Learn how to build a website in Kotlin with Ktor and Thymeleaf templates.">次のチュートリアル</Links>に進んでください。
        </p>
    </chapter>
</topic>