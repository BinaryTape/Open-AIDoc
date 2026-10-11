<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="KtorとKotlinを使用してHTTPリクエストを処理しレスポンスを生成する" id="server-requests-and-responses">
<show-structure for="chapter,procedure" depth="2"/>
<tldr>
        <var name="example_name" value="tutorial-server-routing-and-requests"/>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        タスクマネージャーアプリケーションの構築を通じて、Ktorを使用したKotlinでのルーティング、リクエスト処理、およびパラメーターの基本を学びます。
    </link-summary>
    <card-summary>
        タスクマネージャーアプリケーションの作成を通じて、Ktorでのルーティングとリクエストの仕組みを学びます。
    </card-summary>
    <web-summary>
        KotlinとKtorで作成されたサービスのバリデーション、エラーハンドリング、およびユニットテストの基礎を学びます。
    </web-summary>
    <p>
        このチュートリアルでは、タスクマネージャーアプリケーションの構築を通じて、Ktorを使用したKotlinでのルーティング、リクエスト処理、およびパラメーターの基本を学びます。
    </p>
    <p>
        このチュートリアルを完了すると、次のことができるようになります。
    </p>
    <list type="bullet">
        <li>GETおよびPOSTリクエストを処理する。</li>
        <li>リクエストから情報を抽出する。</li>
        <li>データ変換時のエラーを処理する。</li>
        <li>ユニットテストを使用してルーティングを検証する。</li>
    </list>
    <chapter title="前提条件" id="prerequisites">
        <p>
            これは、「Ktor Serverの導入」ガイドの2番目のチュートリアルです。このチュートリアル単独で進めることも可能ですが、前回のチュートリアルを完了して、<Links href="/ktor/server-create-a-new-project" summary="Ktorを使用してサーバーアプリケーションを開き、実行し、テストする方法を学びます。">新しいKtorプロジェクトの作成、オープン、および実行</Links>について学んでおくことを強くお勧めします。
        </p>
        <p>また、HTTPリクエストタイプ、ヘッダー、およびステータスコードについての基本的な理解があると役立ちます。</p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a>のインストールを推奨しますが、お好みの他のIDEを使用することもできます。
        </p>
    </chapter>
    <chapter title="タスクマネージャーアプリケーション" id="sample-application">
        <p>このチュートリアルでは、以下の機能を備えたタスクマネージャーアプリケーションを段階的に構築していきます。</p>
        <list type="bullet">
            <li>利用可能なすべてのタスクをHTMLテーブルとして表示する。</li>
            <li>タスクを優先度および名前ごとにHTMLとして表示する。</li>
            <li>HTMLフォームを送信してタスクを追加する。</li>
        </list>
        <p>
            まずは基本的な機能を動作させるための最小限の実装を行い、その後7つのイテレーションを通じて機能を改善および拡張していきます。この最小限の機能は、いくつかのモデル型、値のリスト、および単一のルートを含むプロジェクトで構成されます。
        </p>
    </chapter>
    <chapter title="静的HTMLコンテンツの表示" id="display-static-html">
        <p>最初のイテレーションでは、静的HTMLコンテンツを返す新しいルートをアプリケーションに追加します。</p>
        <p><a href="https://start.ktor.io">Ktor Project Generator</a>を使用して、<control>Project artifact</control>名に<control>com.example.ktor-task-app</control>を指定して新規プロジェクトを作成します。
        </p>
        <tip>
            新規プロジェクトの作成に関する詳細については、<Links href="/ktor/server-create-a-new-project" summary="Ktorを使用してサーバーアプリケーションを開き、実行し、テストする方法を学びます。">新しいKtorプロジェクトの作成、オープン、および実行</Links>を参照してください。最近そのチュートリアルを完了した場合は、そこで作成したプロジェクトをそのまま再利用しても構いません。
        </tip>
        <procedure>
            <step><Path>src/main/kotlin</Path>フォルダー内にある<Path>Routing.kt</Path>ファイルを開きます。
            </step>
            <step>
                <p>既存の<code>Application.configureRouting()</code>関数を以下の実装に置き換えます。</p>
                <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/tasks&quot;) {&#10;                                    call.respondText(&#10;                                        contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                            text = &quot;&quot;&quot;&#10;                                        &lt;h3&gt;TODO:&lt;/h3&gt;&#10;                                        &lt;ol&gt;&#10;                                            &lt;li&gt;A table of all the tasks&lt;/li&gt;&#10;                                            &lt;li&gt;A form to submit new tasks&lt;/li&gt;&#10;                                        &lt;/ol&gt;&#10;                                        &quot;&quot;&quot;.trimIndent()&#10;                                    )&#10;                                }&#10;                            }&#10;                        }"/>
                <p>これにより、URL <code>/tasks</code>およびGETリクエストタイプに対する新しいルートが作成されました。GETリクエストは、HTTPで最も基本的なリクエストタイプです。ユーザーがブラウザーのアドレスバーに入力したり、通常のHTMLリンクをクリックしたりしたときにトリガーされます。</p>
                <p>
                    現時点では、単に静的コンテンツを返しているだけです。クライアントに対してHTMLを送信することを通知するために、HTTP <code>Content-Type</code>ヘッダーを<code>"text/html"</code>に設定しています。
                </p>
            </step>
            <step>
                <p>
                    <code>ContentType</code>オブジェクトにアクセスするために、IDEによって以下のインポートが自動的に追加されます。
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.http.ContentType"/>
            </step>
            <step>
                <p>IntelliJ IDEAで、<Path>main.kt</Path>ファイル内の<code>main()</code>関数の横にある実行ガターアイコン（<img alt="IntelliJ IDEA run application icon"
                                                                        src="intellij_idea_gutter_icon.svg" height="16"
                                                                        width="16"/>）をクリックしてアプリケーションを起動します。
                </p>
            </step>
            <step>
                <p>
                    ブラウザーで<a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>にアクセスします。次のようにTo-Doリストが表示されるはずです。
                </p>
                <img src="tutorial_routing_and_requests_implementation_1.png"
                     alt="2つの項目が含まれるTo-Doリストを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="タスクモデルの実装" id="implement-a-task-model">
        <p>
            プロジェクトを作成し、基本的なルーティングを設定できたので、次は以下の手順でアプリケーションを拡張していきます。
        </p>
        <list type="decimal">
            <li><a href="#create-model-types">タスクを表すモデル型を作成する。</a></li>
            <li><a href="#create-sample-values">サンプル値を含むタスクのリストを宣言する。</a></li>
            <li><a href="#add-a-route">このリストを返すようにルートとリクエストハンドラーを変更する。</a></li>
            <li><a href="#test">ブラウザーを使用して新機能が動作することをテストする。</a></li>
        </list>
        <procedure title="モデル型の作成" id="create-model-types">
            <step>
                <p><Path>src/main/kotlin</Path>内に、<Path>model</Path>という名前の新しいサブパッケージを作成します。
                </p>
            </step>
            <step>
                <p><Path>model</Path>ディレクトリ内に、新しい<Path>Task.kt</Path>ファイルを作成します。
                </p>
            </step>
            <step>
                <p><Path>Task.kt</Path>ファイルを開き、優先度を表す<code>enum</code>とタスクを表す<code>class</code>を追加します。
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            </step>
            <step>
                <p>タスク情報はHTMLテーブル内に入れてクライアントに送信します。同じ<Path>Task.kt</Path>ファイル内に、次の拡張関数を追加します。</p>
                <code-block lang="kotlin" code="                    fun Task.taskAsRow() = &quot;&quot;&quot;&#10;                        &lt;tr&gt;&#10;                            &lt;td&gt;$name&lt;/td&gt;&lt;td&gt;$description&lt;/td&gt;&lt;td&gt;$priority&lt;/td&gt;&#10;                        &lt;/tr&gt;&#10;                        &quot;&quot;&quot;.trimIndent()&#10;&#10;                    fun List&lt;Task&gt;.tasksAsTable() = this.joinToString(&#10;                        prefix = &quot;&lt;table rules=\&quot;all\&quot;&gt;&quot;,&#10;                        postfix = &quot;&lt;/table&gt;&quot;,&#10;                        separator = &quot;\n&quot;,&#10;                        transform = Task::taskAsRow&#10;                    )"/>
                <list>
                    <li><code>Task.taskAsRow()</code>関数により、<code>Task</code>オブジェクトをテーブルの行（row）としてレンダリングできるようになります。</li>
                    <li><code>List&lt;Task&gt;.tasksAsTable()</code>関数により、タスクのリストをテーブルとしてレンダリングできるようになります。</li>
                </list>
            </step>
        </procedure>
        <procedure title="サンプル値の作成" id="create-sample-values">
            <step>
                <p><Path>model</Path>ディレクトリ内に、新しい<Path>TaskRepository.kt</Path>ファイルを作成します。
                </p>
            </step>
            <step>
                <p><Path>TaskRepository.kt</Path>を開き、以下のコードを追加してタスクのリストを定義します。
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )"/>
            </step>
        </procedure>
        <procedure title="新しいルートの追加" id="add-a-route">
            <step>
                <p><Path>Routing.kt</Path>ファイルを開き、既存の<code>Application.configureRouting()</code>関数を以下の実装に置き換えます。
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    静的コンテンツをクライアントに返す代わりに、タスクのリストを提供するようになりました。リストはそのままネットワーク経由で送信できないため、クライアントが理解できる形式に変換する必要があります。この例では、タスクがHTMLテーブルに変換されます。
                </p>
            </step>
            <step>
                <p>必要なインポートを追加します。</p>
                <code-block lang="kotlin" code="                    import com.example.model.*"/>
            </step>
        </procedure>
        <procedure title="新機能のテスト" id="test">
            <step>
                <p>IntelliJ IDEAで、再実行ボタン（<img alt="IntelliJ IDEA rerun button icon"
                                                                     src="intellij_idea_rerun_icon.svg"
                                                                     height="16"
                                                                     width="16"/>）をクリックしてアプリケーションを再起動します。</p>
            </step>
            <step>
                <p>ブラウザーで<a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>にアクセスします。タスクを含むHTMLテーブルが表示されるはずです。</p>
                <img src="tutorial_routing_and_requests_implementation_2.png"
                     alt="4行のテーブルを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
                <p>表示されていれば成功です！アプリケーションの基本機能が正しく動作しています。</p>
            </step>
        </procedure>
    </chapter>
    <chapter title="モデルのリファクタリング" id="refactor-the-model">
        <p>
            アプリの機能拡張を続ける前に、値のリストをリポジトリ内にカプセル化して設計をリファクタリングします。これによりデータ管理を一元化でき、Ktor固有のコードに集中できるようになります。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>TaskRepository.kt</Path>ファイルに戻り、既存のタスクリストを以下のコードに置き換えます。
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;    fun allTasks(): List&lt;Task&gt; = tasks.toList()&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if(taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
                <p>
                    これにより、リストに基づいたタスク用の基本的なデータストアが実装されます。説明を簡単にするため、タスクが追加された順序は保持されますが、例外をスローして重複を禁止しています。</p>
                <p>今後のチュートリアルでは、<a href="https://github.com/JetBrains/Exposed">Exposedライブラリ</a>を介してリレーショナルデータベースに接続するリポジトリの実装方法を学びます。
                </p>
                <p>
                    ここでは、ルート内でこのリポジトリを使用します。
                </p>
            </step>
            <step>
                <p>
                    <Path>Routing.kt</Path>ファイルを開き、既存の<code>Application.configureRouting()</code>関数を以下の実装に置き換えます。
                </p>
                <code-block lang="Kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                val tasks = TaskRepository.allTasks()&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    リクエストが届くと、リポジトリを使用して現在のタスクのリストが取得されます。その後、それらのタスクを含むHTTPレスポンスが構築されます。
                </p>
            </step>
        </procedure>
        <procedure title="リファクタリングしたコードのテスト">
            <step>
                <p>IntelliJ IDEAで、再実行ボタン（<img alt="IntelliJ IDEA rerun button icon"
                                                                     src="intellij_idea_rerun_icon.svg" height="16"
                                                                     width="16"/>）をクリックしてアプリケーションを再起動します。</p>
            </step>
            <step>
                <p>
                    ブラウザーで<a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>にアクセスします。HTMLテーブルが表示され、出力結果は変わらないはずです。
                </p>
                <img src="tutorial_routing_and_requests_implementation_2.png"
                     alt="4行のテーブルを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="パラメーターの処理" id="work-with-parameters">
        <p>
            このイテレーションでは、ユーザーが優先度ごとにタスクを表示できるようにします。これを行うには、アプリケーションが以下のURLへのGETリクエストを許可する必要があります。
        </p>
        <list type="bullet">
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/Low"><code>/tasks/byPriority/Low</code></a></li>
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/Medium"><code>/tasks/byPriority/Medium</code></a></li>
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/High"><code>/tasks/byPriority/High</code></a></li>
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/Vital"><code>/tasks/byPriority/Vital</code></a></li>
        </list>
        <p>
            追加するルートは<code>/tasks/byPriority/{priority?}</code>です。ここで<code>{priority?}</code>は実行時に抽出する必要があるパスパラメーターを表し、疑問符（?）はパラメーターがオプションであることを示すために使用されます。パスパラメーターの名前は任意ですが、ここでは<code>priority</code>とするのが自然でしょう。
        </p>
        <p>
            リクエストを処理するプロセスは、次のように要約できます。
        </p>
        <list type="decimal">
            <li>リクエストから<code>priority</code>という名前のパスパラメーターを抽出する。</li>
            <li>このパラメーターが存在しない場合は、<code>400 Bad Request</code>ステータスを返す。</li>
            <li>パラメーターのテキスト値を<code>Priority</code>列挙型の値に変換する。</li>
            <li>変換に失敗した場合は、ステータスコード<code>400</code>のレスポンスを返す。</li>
            <li>リポジトリを使用して、指定された優先度を持つすべてのタスクを検索する。</li>
            <li>一致するタスクがない場合は、<code>404 Not Found</code>ステータスを返す。</li>
            <li>一致したタスクをHTMLテーブルとしてフォーマットして返す。</li>
        </list>
        <p>
            まずこの機能を実装し、次にそれが動作していることを確認するための最適な方法を見つけます。
        </p>
        <procedure title="新しいルートの追加">
            <p><Path>Routing.kt</Path>ファイルを開き、コードに以下のルートを追加します。
            </p>
            <code-block lang="kotlin" code="                routing {&#10;                    get(&quot;/tasks&quot;) {&#10;                        //...&#10;                    }&#10;&#10;                    //add the following route&#10;                    get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                        val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                        if (priorityAsText == null) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                            return@get&#10;                        }&#10;&#10;                        try {&#10;                            val priority = Priority.valueOf(priorityAsText)&#10;                            val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                            if (tasks.isEmpty()) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = tasks.tasksAsTable()&#10;                            )&#10;                        } catch(ex: IllegalArgumentException) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                上記のコードで、URL <code>/tasks/byPriority/{priority?}</code>用のハンドラーを作成しました。シンボル<code>priority</code>は、ユーザーによって渡されたパスパラメーターを表します。残念ながら、サーバー側ではこれが対応するKotlin列挙型の4つの値のいずれかであることを保証する方法がないため、手動でチェックする必要があります。
            </p>
            <p>
                パスパラメーターが存在しない場合、サーバーはクライアントに<code>400</code>ステータスコードを返します。存在する場合は、パラメーターの値を抽出し、列挙型のメンバーへの変換を試みます。これに失敗すると例外がスローされ、サーバーはそれをキャッチして<code>400</code>ステータスコードを返します。
            </p>
            <p>
                変換が成功したと仮定すると、リポジトリを使用して一致する<code>Task</code>を検索します。指定された優先度のタスクが存在しない場合、サーバーは<code>404</code>ステータスコードを返し、存在する場合は一致したタスクをHTMLテーブルに入れて返送します。
            </p>
        </procedure>
        <procedure title="新しいルートのテスト">
            <p>
                異なるURLをリクエストすることで、ブラウザーでこの機能をテストできます。
            </p>
            <step>
                <p>IntelliJ IDEAで、再実行ボタン（<img alt="IntelliJ IDEA rerun button icon"
                                                                     src="intellij_idea_rerun_icon.svg"
                                                                     height="16"
                                                                     width="16"/>）をクリックしてアプリケーションを再起動します。</p>
            </step>
            <step>
                <p>
                    Medium優先度のすべてのタスクを取得するには、<a
                        href="http://0.0.0.0:8080/tasks/byPriority/Medium">http://0.0.0.0:8080/tasks/byPriority/Medium</a>にアクセスします。
                </p>
                <img src="tutorial_routing_and_requests_implementation_4.png"
                     alt="Medium優先度のタスクを含むテーブルを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
            </step>
            <step>
                <p>
                    残念ながら、エラーが発生した場合にブラウザー経由で行えるテストには限界があります。開発者向け拡張機能を使用しない限り、ブラウザーは失敗したレスポンスの詳細を表示しません。より簡単な代替手段は、<a
                        href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>などの専用ツールを使用することです。
                </p>
            </step>
            <step>
                <p>
                    Postmanで、同じURL <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code>に対してGETリクエストを送信します。
                </p>
                <img src="tutorial_routing_and_requests_postman.png"
                     alt="レスポンスの詳細を表示するPostmanのGETリクエスト"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    これにより、サーバーからの未加工の出力（生データ）に加えて、リクエストとレスポンスのすべての詳細が表示されます。
                </p>
            </step>
            <step>
                <p>
                    Vitalタスクのリクエスト時に<code>404</code>ステータスコードが返されることを確認するには、<code>http://0.0.0.0:8080/tasks/byPriority/Vital</code>に新しいGETリクエストを送信します。<control>Response</control>パネルの右上隅にステータスコードが表示されます。
                </p>
                <img src="tutorial_routing_and_requests_postman_vital.png"
                     alt="ステータスコードを表示するPostmanのGETリクエスト"
                     border-effect="rounded"
                     width="706"/>
            </step>
            <step>
                <p>
                    無効な優先度を指定したときに<code>400</code>ステータスコードが返されることを確認するには、無効なプロパティを指定して別のGETリクエストを作成します。
                </p>
                <img src="tutorial_routing_and_requests_postman_bad_request.png"
                     alt="Bad Requestステータスコードを表示するPostmanのGETリクエスト"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="ユニットテストの追加" id="add-unit-tests">
        <p>
            ここまでで、すべてのタスクを取得するルートと、優先度ごとにタスクを取得するルートの2つを追加しました。Postmanのようなツールを使用するとこれらのルートを完全にテストできますが、目視による手動確認が必要であり、Ktorの外部で実行されます。
        </p>
        <p>
            プロトタイピングや小規模なアプリケーションではこれで問題ありません。しかし、頻繁に実行する必要があるテストが何千もある大規模なアプリケーションでは、このアプローチはスケールしません。より優れたソリューションは、テストを完全に自動化することです。
        </p>
        <p>
            Ktorには、ルートの自動検証をサポートする独自の<Links href="/ktor/server-testing" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。">テストフレームワーク</Links>が用意されています。次に、アプリの既存の機能に対するテストをいくつか作成します。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/test/kotlin</Path>フォルダーに移動し、<Path>ServerTest.kt</Path>ファイルを開きます。
                </p>
            </step>
            <step>
                <p><Path>ServerTest.kt</Path>ファイルに以下のコードを追加します。
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;}"/>
                <p>
                    これらの各テストでは、Ktorの新しいインスタンスが作成されます。これはNettyのようなWebサーバーの代わりに、テスト環境内で実行されます。Project Generatorによって作成されたモジュールが読み込まれ、次にルーティング関数が呼び出されます。その後、組み込みの<code>client</code>オブジェクトを使用してアプリケーションにリクエストを送信し、返されたレスポンスを検証できます。
                </p>
                <p>
                    このテストは、IDE内またはCI/CDパイプラインの一部として実行できます。
                </p>
            </step>
            <step>
                <p>IntelliJ IDEA内でテストを実行するには、各テスト関数の横にあるガターアイコン（<img
                        alt="IntelliJ IDEA gutter icon"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>）をクリックします。</p>
                <tip>
                    IntelliJ IDEAでユニットテストを実行する方法の詳細については、<a
                        href="https://www.jetbrains.com/help/idea/performing-tests.html">IntelliJ IDEAのドキュメント</a>を参照してください。
                </tip>
            </step>
        </procedure>
    </chapter>
    <chapter title="POSTリクエストの処理" id="handle-post-requests">
        <p>
            上記の手順に従うことで、GETリクエスト用の追加ルートをいくつでも作成できます。これらにより、ユーザーは好きな検索条件を使用してタスクを取得できます。しかし、ユーザーは新しいタスクを作成することも望むでしょう。
        </p>
        <p>
            その場合、適切なHTTPリクエストタイプはPOSTです。POSTリクエストは通常、ユーザーがHTMLフォームに入力して送信したときにトリガーされます。
        </p>
        <p>
            GETリクエストとは異なり、POSTリクエストにはフォーム上にあるすべての入力の名前と値を含む<code>body</code>（ボディ）があります。この情報は、異なる入力からのデータを分離し、不正な文字をエスケープするためにエンコードされます。ブラウザーとKtorがこのプロセスを処理するため、詳細について心配する必要はありません。
        </p>
        <p>
            次に、以下の手順で新しいタスクを作成できるように既存のアプリケーションを拡張します。
        </p>
        <list type="decimal">
            <li><a href="#create-static-content">HTMLフォームを含む静的コンテンツフォルダーを作成する</a>。</li>
            <li><a href="#register-folder">このフォルダーのコンテンツを配信できるように、Ktorに認識させる</a>。</li>
            <li><a href="#add-form-handler">フォーム送信を処理する新しいリクエストハンドラーを追加する</a>。</li>
            <li><a href="#test-functionality">完成した機能をテストする</a>。</li>
        </list>
        <procedure title="静的コンテンツの作成" id="create-static-content">
            <step>
                <p>
                    <Path>src/main/resources</Path>内に、<Path>task-ui</Path>という名前の新しいディレクトリを作成します。これが静的コンテンツ用のフォルダーになります。
                </p>
            </step>
            <step>
                <p>
                    <Path>task-ui</Path>フォルダー内に、新しい<Path>task-form.html</Path>ファイルを作成します。
                </p>
            </step>
            <step>
                <p>新しく作成した<Path>task-form.html</Path>ファイルを開き、以下の内容を追加します。
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html lang=&quot;en&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Adding a new task&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Adding a new task&lt;/h1&gt;&#10;&lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;description&quot; name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;        &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;    &lt;/div&gt;&#10;    &lt;input type=&quot;submit&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
        </procedure>
        <procedure title="Ktorへのフォルダーの登録" id="register-folder">
            <step>
                <p>
                    <Path>src/main/kotlin</Path>内にある<Path>Routing.kt</Path>ファイルに移動します。
                </p>
            </step>
            <step>
                <p>
                    <code>Application.configureRouting()</code>関数内に、次の<code>staticResources()</code>呼び出しを追加します。
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            // Add the following line&#10;                            staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                // ...&#10;                            }&#10;&#10;                            get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                                //...&#10;                            }&#10;                        }&#10;                    }"/>
                <p>IDEによって以下のインポートが自動的に追加されるはずです。</p>
                <code-block lang="kotlin" code="                    import io.ktor.server.http.content.staticResources"/>
            </step>
            <step>
                <p>アプリケーションを再起動します。</p>
            </step>
            <step>
                <p>
                    ブラウザーで<a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>にアクセスします。HTMLフォームが表示されるはずです。
                </p>
                <img src="tutorial_routing_and_requests_implementation_6.png"
                     alt="HTMLフォームを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
        <procedure title="フォーム用ハンドラーの追加" id="add-form-handler">
            <p>
                <Path>Routing.kt</Path>ファイル内で、<code>.configureRouting()</code>関数に以下のルートを追加します。
            </p>
            <code-block lang="kotlin" code="                fun Application.configureRouting() {&#10;                    routing {&#10;                        //...&#10;&#10;                        //add the following route&#10;                        post(&quot;/tasks&quot;) {&#10;                            val formContent = call.receiveParameters()&#10;&#10;                            val params = Triple(&#10;                                formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                            )&#10;&#10;                            if (params.toList().any { it.isEmpty() }) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@post&#10;                            }&#10;&#10;                            try {&#10;                                val priority = Priority.valueOf(params.third)&#10;                                TaskRepository.addTask(&#10;                                    Task(&#10;                                        params.first,&#10;                                        params.second,&#10;                                        priority&#10;                                    )&#10;                                )&#10;&#10;                                call.respond(HttpStatusCode.NoContent)&#10;                            } catch (ex: IllegalArgumentException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            } catch (ex: IllegalStateException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                新しいルートは、GETリクエストではなくPOSTリクエストにマップされています。Ktorは、<code>.receiveParameters()</code>の呼び出しを通じてリクエストのボディを処理します。これにより、リクエストのボディに含まれていたパラメーターのコレクションが返されます。
            </p>
            <p>
                パラメーターは3つあるため、関連付けられた値を<a
                    href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/"><code>Triple</code></a>に格納できます。パラメーターが存在しない場合は、代わりに空の文字列が格納されます。
            </p>
            <p>
                いずれかの値が空の場合、サーバーはステータスコード<code>400</code>のレスポンスを返します。次に、3番目のパラメーターを<code>Priority</code>に変換しようと試み、成功した場合は新しい<code>Task</code>としてリポジトリに情報を追加します。これらはいずれも例外が発生する可能性があり、その場合も再び<code>400</code>ステータスコードを返します。
            </p>
            <p>
                すべて成功した場合は、サーバーはクライアントに<code>204 No Content</code>ステータスコードを返します。これはリクエストが成功したものの、結果として返送する新しい情報がないことを意味します。
            </p>
        </procedure>
        <procedure title="完成した機能のテスト" id="test-functionality">
            <step>
                <p>
                    アプリケーションを再起動します。
                </p>
            </step>
            <step>
                <p>ブラウザーで<a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>にアクセスします。
                </p>
            </step>
            <step>
                <p>
                    フォームにサンプルデータを入力し、<control>Submit</control>をクリックします。
                </p>
                <img src="tutorial_routing_and_requests_iteration_6_test_1.png"
                     alt="サンプルデータが入力されたHTMLフォームを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
                <p>フォームを送信しても、新しいページには遷移しないはずです。</p>
            </step>
            <step>
                <p>
                    URL <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>にアクセスします。新しいタスクが追加されていることが確認できるはずです。
                </p>
                <img src="tutorial_routing_and_requests_iteration_6_test_2.png"
                     alt="タスクを含むHTMLテーブルを表示するブラウザーウィンドウ"
                     border-effect="rounded"
                     width="706"/>
            </step>
            <step>
                <p>
                    機能を検証するために、<Path>ServerTest.kt</Path>ファイルに次のテストを追加します。
                </p>
                <code-block lang="kotlin"
                            include-symbol="newTasksCanBeAdded" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        configure()&#10;&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.FormUrlEncoded.toString()&#10;            )&#10;            setBody(&#10;                listOf(&#10;                    &quot;name&quot; to &quot;swimming&quot;,&#10;                    &quot;description&quot; to &quot;Go to the beach&quot;,&#10;                    &quot;priority&quot; to &quot;Low&quot;&#10;                ).formUrlEncode()&#10;            )&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;        val body = response2.bodyAsText()&#10;&#10;        assertContains(body, &quot;swimming&quot;)&#10;        assertContains(body, &quot;Go to the beach&quot;)&#10;    }&#10;}"/>
                <p>
                    このテストでは、新しいタスクを作成するPOSTリクエストと、新しいタスクが追加されたことを確認するGETリクエストの2つのリクエストがサーバーに送信されます。最初のリクエストを行う際、<code>setBody()</code>関数を使用してリクエストのボディにコンテンツを挿入します。テストフレームワークは、コレクションに対する拡張関数<code>.formUrlEncode()</code>を提供しており、ブラウザーと同じようにデータをフォーマットする処理を抽象化してくれます。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="ルーティングのリファクタリング" id="refactor-the-routing">
        <p>
            これまでのルーティングを確認すると、すべてのルートが<code>/tasks</code>で始まっていることがわかります。これらを独自のサブルートに配置することで、この重複を解消できます。
        </p>
        <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            //Code remains the same&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            //Code remains the same&#10;                        }&#10;&#10;                        post {&#10;                            //Code remains the same&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
        <p>
            複数のサブルートが存在する段階までアプリケーションが成長した場合は、それぞれを独自のヘルパー関数に分割するのが適切です。ただし、現時点ではその必要はありません。
        </p>
        <p>
            ルートが適切に整理されていれば、拡張も容易になります。たとえば、名前でタスクを検索するルートを追加することもできます。
        </p>
        <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            // Code remains the same&#10;                        }&#10;                        get(&quot;/byName/{taskName}&quot;) {&#10;                            val name = call.parameters[&quot;taskName&quot;]&#10;                            if (name == null) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@get&#10;                            }&#10;&#10;                            val task = TaskRepository.taskByName(name)&#10;                            if (task == null) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = listOf(task).tasksAsTable()&#10;                            )&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            // Code remains the same&#10;                        }&#10;&#10;                        post {&#10;                            // Code remains the same&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
    </chapter>
    <chapter title="次のステップ" id="next-steps">
        <p>
            これで、基本的なルーティングとリクエスト処理の実装が完了しました。さらに、バリデーション、エラーハンドリング、およびユニットテストについても触れました。これらのトピックはすべて、今後のチュートリアルでさらに掘り下げていきます。
        </p>
        <p>
            JSONファイルを生成するタスクマネージャー用のRESTful APIの作成方法を学ぶには、<Links href="/ktor/server-create-restful-apis" summary="JSONファイルを生成するRESTful APIの例を取り上げ、KotlinとKtorを使用してバックエンドサービスを構築する方法を学びます。">次のチュートリアル</Links>に進んでください。
        </p>
    </chapter>
</topic>