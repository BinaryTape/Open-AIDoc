<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin、Ktor、Exposed を使用したデータベースの統合" id="server-integrate-database">
<show-structure for="chapter" depth="2"/>
<tldr>
        <var name="example_name" value="tutorial-server-db-integration"/>
        <p>
            <b>サンプルコード</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用しているプラグイン</b>: <Links href="/ktor/server-static-content" summary="スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。">Static Content</Links>、
            <Links href="/ktor/server-serialization" summary="ContentNegotiation プラグインには主に2つの目的があります。クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定の形式でのコンテンツのシリアライズ/デシリアライズです。">Content Negotiation</Links>、<Links href="/ktor/server-status-pages" summary="%plugin_name% を使用すると、Ktor アプリケーションはスローされた例外やステータスコードに基づいて、任意のエラー状態に適切に応答できます。">Status pages</Links>、
            <Links href="/ktor/server-serialization" summary="ContentNegotiation プラグインには主に2つの目的があります。クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定の形式でのコンテンツのシリアライズ/デシリアライズです。">kotlinx.serialization</Links>、
            <Links href="/ktor/server-dependency-injection" summary="必要な依存関係: io.ktor:ktor-server-di サンプルコード: %example_name%">Dependency Injection</Links>、
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-exposed">Exposed</a>、
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-postgres">PostgreSQL</a>
        </p>
    </tldr>
    <card-summary>
        Exposed SQL ライブラリを使用して Ktor サービスをデータベースリポジトリに接続するプロセスを学びます。
    </card-summary>
    <link-summary>
        Exposed SQL ライブラリを使用して Ktor サービスをデータベースリポジトリに接続するプロセスを学びます。
    </link-summary>
    <web-summary>
        Kotlin と Ktor を使用して、RESTful サービスがデータベースリポジトリと連携するシングルページアプリケーション（SPA）を構築する方法を学びます。Exposed SQL ライブラリを使用し、テスト用にモック（フェイク）リポジトリを使用できるようにします。
    </web-summary>
    <p>
        この記事では、Kotlin 向けの SQL ライブラリである <a
            href="https://www.jetbrains.com/exposed/">Exposed</a> を使用して、Ktor サービスをリレーショナルデータベースと統合する方法を学びます。
    </p>
    <p>このチュートリアルを完了すると、次のことができるようになります。</p>
    <list>
        <li>JSON シリアライゼーションを使用する RESTful サービスの作成</li>
        <li>これらのサービスへのさまざまなリポジトリの注入</li>
        <li>インメモリリポジトリを使用したサービスのユニットテストの作成</li>
        <li>Exposed と依存関係注入（DI: Dependency Injection）を使用した実用的なリポジトリの構築</li>
        <li>外部データベースにアクセスするサービスのデプロイ</li>
    </list>
    <p>
        以前のチュートリアルでは、タスクマネージャーの例を使用して、<Links href="/ktor/server-requests-and-responses" summary="タスクマネージャーアプリケーションの構築を通じて、Kotlin と Ktor におけるルーティング、リクエスト処理、パラメータの基礎を学びます。">リクエストの処理</Links>、
        <Links href="/ktor/server-create-restful-apis" summary="JSON ファイルを生成する RESTful API の例を通じて、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">RESTful API の作成</Links>、
        <Links href="/ktor/server-create-website" summary="Kotlin、Ktor、Thymeleaf テンプレートを使用して Web サイトを構築する方法を学びます。">Thymeleaf テンプレートを使用した Web アプリケーションの構築</Links> などの基本を扱いました。
    </p>
    <p>
        それらのチュートリアルではシンプルなインメモリ <code>TaskRepository</code> を使用したフロントエンドの機能に焦点を当てていましたが、このガイドでは、Exposed SQL ライブラリを介して Ktor サービスがリレーショナルデータベースとどのように対話できるかに焦点を移します。
    </p>
    <p>
        このガイドはより長く複雑になっていますが、動作するコードをすばやく作成し、段階的に新しい機能を導入していくことができます。
    </p>
    <p>このガイドは2つのパートで構成されています。</p>
    <list type="decimal">
        <li>
            <a href="#create-restful-service-and-repository">インメモリリポジトリを使用したアプリケーションの作成</a>
        </li>
        <li>
            <a href="#add-postgresql-repository">インメモリリポジトリを PostgreSQL を使用するものに入れ替える</a>
        </li>
    </list>
    <chapter title="前提条件" id="prerequisites">
        <p>
            このチュートリアルは単独で進めることも可能ですが、コンテンツネゴシエーションと REST に慣れるために、事前に <Links href="/ktor/server-create-restful-apis" summary="JSON ファイルを生成する RESTful API の例を通じて、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">RESTful API の作成</Links> チュートリアルを完了しておくことをお勧めします。
        </p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a> のインストールを推奨しますが、お好みの他の IDE を使用することも可能です。
        </p>
    </chapter>
    <chapter title="RESTful サービスとインメモリリポジトリの作成" id="create-restful-service-and-repository">
        <p>
            まず、タスクマネージャーの RESTful サービスを再作成します。最初はインメモリリポジトリを使用しますが、最小限の手間で差し替えられる設計で構成します。
        </p>
        <p>これは6つのステージに分けて行います。</p>
        <list type="decimal">
            <li>
                <a href="#create-project">初期プロジェクトの作成</a>
            </li>
            <li>
                <a href="#add-starter-code">スターターコードの追加</a>
            </li>
            <li>
                <a href="#add-routes">CRUD ルートの追加</a>
            </li>
            <li>
                <a href="#add-client-page">シングルページアプリケーション（SPA）の追加</a>
            </li>
            <li>
                <a href="#test-manually">アプリケーションの手動テスト</a>
            </li>
            <li>
                <a href="#add-automated-tests">自動テストの追加</a>
            </li>
        </list>
        <chapter title="プラグインを含む新規プロジェクトの作成" id="create-project">
            <p>
                Ktor Project Generator で新しいプロジェクトを作成するには、以下の手順に従ってください。
            </p>
            <procedure id="create-project-procedure">
                <step>
                    <p>
                        <a href="https://start.ktor.io/">Ktor Project Generator</a>
                        にアクセスします。
                    </p>
                </step>
                <step>
                    <p>
                        <control>Project artifact</control>
                        フィールドに、プロジェクトアーティファクトの名前として
                        <Path>com.example.ktor-exposed-task-app</Path>
                        を入力します。
                        <img src="tutorial_server_db_integration_project_artifact.png"
                             alt="Ktor Project Generator でプロジェクトアーティファクトに名前を付ける"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        プラグインセクションで、
                        <control>Add</control>
                        ボタンをクリックして以下のプラグインを検索し追加します。
                    </p>
                    <list type="bullet">
                        <li>Content Negotiation</li>
                        <li>kotlinx.serialization</li>
                        <li>Static Content</li>
                        <li>Status Pages</li>
                        <li>Dependency Injection</li>
                        <li>Exposed</li>
                        <li>PostgreSQL</li>
                    </list>
                    <p>
                        <img src="ktor_project_generator_add_plugins.gif"
                             alt="Ktor Project Generator でプラグインを追加"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        プラグインを追加したら、プラグインセクションの右上にある
                        <control>7 plugins</control>
                        ボタンをクリックして、追加されたプラグインを確認します。
                    </p>
                    <p>プロジェクトに追加されるすべてのプラグインのリストが表示されます。
                        <img src="tutorial_server_db_integration_plugin_list.png"
                             alt="Ktor Project Generator のプラグインドロップダウン"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        <control>Download</control>
                        ボタンをクリックして、Ktor プロジェクトを生成およびダウンロードします。
                    </p>
                </step>
                <step>
                    <p>
                        生成されたプロジェクトを
                        <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
                            IDEA</a> またはお好みの他の IDE で開きます。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>src/main/kotlin</Path>
                        に移動し、
                        <Path>CitySchema.kt</Path>、
                        <Path>UsersService.kt</Path>、
                        <Path>GreetingService.kt</Path>、
                        <Path>Postgres.kt</Path>
                        ファイルを削除します。
                    </p>
                </step>
                <step id="delete-function">
                    <p>
                        <Path>Exposed.kt</Path>
                        ファイルを開き、<code>.configureExposed()</code> 関数の内容を削除します。
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                        }"/>
                    <p>
                        この機能を削除する理由は、Ktor Project Generator がユーザーや都市に関するデータを HSQLDB または PostgreSQL に永続化する方法を示すサンプルコードを追加したためです。このチュートリアルではそのサンプルコードは必要ありません。
                    </p>
                </step>
                <step>
                    <Path>gradle/libs.versions.toml</Path> ファイルを開き、最新の Exposed バージョンが指定されていることを確認します。
                    <code-block lang="kotlin" code="                        [versions]&#10;                        #...&#10;                        exposed = %exposed_version%"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="スターターコードの追加" id="add-starter-code">
            <procedure id="add-starter-code-procedure">
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
                        を開き、優先度を表す enum とタスクを表すクラスを追加します。
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        <code>Task</code> クラスには、<Links href="/ktor/server-serialization" summary="ContentNegotiation プラグインには主に2つの目的があります。クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定の形式でのコンテンツのシリアライズ/デシリアライズです。"><code>kotlinx.serialization</code></Links> ライブラリの <code>Serializable</code> アノテーションが付与されています。
                    </p>
                    <p>
                        以前のチュートリアルと同様に、インメモリリポジトリを作成します。ただし今回は、後で簡単に置き換えられるように、リポジトリにインターフェースを実装させます。
                    </p>
                </step>
                <step>
                    <Path>model</Path>
                    サブパッケージ内に、新しい
                    <Path>TaskRepository.kt</Path>
                    ファイルを作成します。
                </step>
                <step>
                    <p>
                        <Path>TaskRepository.kt</Path>
                        を開き、次のインターフェースを追加します。
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        interface TaskRepository {&#10;                            fun allTasks(): List&lt;Task&gt;&#10;                            fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                            fun taskByName(name: String): Task?&#10;                            fun addTask(task: Task)&#10;                            fun removeTask(name: String): Boolean&#10;                        }"/>
                </step>
                <step>
                    同じディレクトリ内に新しい
                    <Path>FakeTaskRepository.kt</Path>
                    ファイルを作成します。
                </step>
                <step>
                    <p>
                        <Path>FakeTaskRepository.kt</Path>
                        を開き、次のクラスを追加します。
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        class FakeTaskRepository : TaskRepository {&#10;                            private val tasks = mutableListOf(&#10;                                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                            )&#10;&#10;                            override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                            override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                                it.priority == priority&#10;                            }&#10;&#10;                            override fun taskByName(name: String) = tasks.find {&#10;                                it.name.equals(name, ignoreCase = true)&#10;                            }&#10;&#10;                            override fun addTask(task: Task) {&#10;                                if (taskByName(task.name) != null) {&#10;                                    throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;                                }&#10;                                tasks.add(task)&#10;                            }&#10;&#10;                            override fun removeTask(name: String): Boolean {&#10;                                return tasks.removeIf { it.name == name }&#10;                            }&#10;                        }"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="ルートの追加" id="add-routes">
            <procedure id="add-routes-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    にある
                    <Path>Serialization.kt</Path>
                    ファイルを開きます。
                </step>
                <step>
                    <p>
                        既存の <code>Application.configureSerialization()</code> 関数を以下の実装に置き換えます。
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;suspend fun Application.configureSerialization() {&#10;    val repository = dependencies.resolve&lt;TaskRepository&gt;()&#10;&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                    <p>
                        これは、Ktor の依存関係注入コンテナからリポジトリを解決している点を除けば、<Links href="/ktor/server-create-restful-apis" summary="JSON ファイルを生成する RESTful API の例を通じて、Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学びます。">RESTful API の作成</Links> チュートリアルで実装したものと同じルーティングです。依存関係の型が <code>interface</code> であるため、さまざまな実装を注入できます。
                    </p>
                    <p>
                        <code>dependencies.resolve()</code> は suspend 関数のため、<code>.configureSerialization()</code> も suspend として宣言する必要があります。
                    </p>
                    <p>
                        <code>.configureSerialization()</code> に依存関係を追加したため、既存の呼び出し箇所はコンパイルできなくなります。幸いなことに、この関数が呼び出されるのは1回だけです。
                    </p>
                </step>
                <step>
                    <Path>src/main/kotlin</Path>
                    内の
                    <Path>DI.kt</Path>
                    ファイルを開きます。
                </step>
                <step>
                    <p>
                        <code>.configureDependencyInjection()</code> 関数の内容を以下の実装に置き換えます。
                    </p>
                    <code-block lang="kotlin" code="                    import com.example.model.FakeTaskRepository&#10;                    import com.example.model.TaskRepository&#10;                    // ...&#10;&#10;                    fun Application.configureDependencyInjection() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                FakeTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        ここでは、<code>TaskRepository</code> の実装として <code>FakeTaskRepository</code> を登録しています。
                        最終的な目標は、これを <code>PostgresTaskRepository</code> に置き換えられるようにすることです。
                    </p>
                </step>
                <step>
                    <Path>src/main/resources</Path> フォルダ内にある <Path>application.yaml</Path> ファイルを開き、<code>.configureDependencyInjection()</code> 関数が <code>.configureSerialization()</code> より前に記述されていることを確認します。
                    <code-block lang="yaml" code="                        ktor:&#10;                        deployment:&#10;                            port: 8080&#10;                        application:&#10;                            modules:&#10;                                - com.example.DIKt.configureDependencyInjection&#10;                                - com.example.SerializationKt.configureSerialization&#10;                                - com.example.ExposedKt.configureExposed&#10;                                - com.example.StatusPagesKt.configureStatusPages&#10;                                - com.example.RoutingKt.configureRouting"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="クライアントページの追加" id="add-client-page">
            <procedure id="add-client-page-procedure">
                <step>
                    <Path>src/main/resources/static</Path>
                    にある
                    <Path>index.html</Path>
                    ファイルを開きます。
                </step>
                <step>
                    <p>
                        現在の内容を以下の実装に置き換えます。
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function displayAllTasks() {&#10;            clearTasksTable();&#10;            fetchAllTasks().then(displayTasks)&#10;        }&#10;&#10;        function displayTasksWithPriority() {&#10;            clearTasksTable();&#10;            const priority = readTaskPriority();&#10;            fetchTasksWithPriority(priority).then(displayTasks)&#10;        }&#10;&#10;        function displayTask(name) {&#10;            fetchTaskWithName(name).then(t =&gt;&#10;                taskDisplay().innerHTML&#10;                    = `${t.priority} priority task ${t.name} with description &quot;${t.description}&quot;`&#10;            )&#10;        }&#10;&#10;        function deleteTask(name) {&#10;            deleteTaskWithName(name).then(() =&gt; {&#10;                clearTaskDisplay();&#10;                displayAllTasks();&#10;            })&#10;        }&#10;&#10;        function deleteTaskWithName(name) {&#10;            return sendDELETE(`/tasks/${name}`)&#10;        }&#10;&#10;        function addNewTask() {&#10;            const task = buildTaskFromForm();&#10;            sendPOST(&quot;/tasks&quot;, task).then(displayAllTasks);&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getTaskFormValue(&quot;newTaskName&quot;),&#10;                description: getTaskFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getTaskFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function getTaskFormValue(controlName) {&#10;            return document.addTaskForm[controlName].value;&#10;        }&#10;&#10;        function taskDisplay() {&#10;            return document.getElementById(&quot;currentTaskDisplay&quot;);&#10;        }&#10;&#10;        function readTaskPriority() {&#10;            return document.priorityForm.priority.value&#10;        }&#10;&#10;        function fetchTasksWithPriority(priority) {&#10;            return sendGET(`/tasks/byPriority/${priority}`);&#10;        }&#10;&#10;        function fetchTaskWithName(name) {&#10;            return sendGET(`/tasks/byName/${name}`);&#10;        }&#10;&#10;        function fetchAllTasks() {&#10;            return sendGET(&quot;/tasks&quot;)&#10;        }&#10;&#10;        function sendGET(url) {&#10;            return fetch(&#10;                url,&#10;                {headers: {'Accept': 'application/json'}}&#10;            ).then(response =&gt; {&#10;                if (response.ok) {&#10;                    return response.json()&#10;                }&#10;                return [];&#10;            });&#10;        }&#10;&#10;        function sendPOST(url, data) {&#10;            return fetch(url, {&#10;                method: 'POST',&#10;                headers: {'Content-Type': 'application/json'},&#10;                body: JSON.stringify(data)&#10;            });&#10;        }&#10;&#10;        function sendDELETE(url) {&#10;            return fetch(url, {&#10;                method: &quot;DELETE&quot;&#10;            });&#10;        }&#10;&#10;        function tasksTable() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTasksTable() {&#10;            tasksTable().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function clearTaskDisplay() {&#10;            taskDisplay().innerText = &quot;None&quot;;&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = tasksTable()&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.priority),&#10;                td(viewLink(task.name)),&#10;                td(deleteLink(task.name)),&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(content) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            if (content instanceof Element) {&#10;                node.appendChild(content)&#10;            } else {&#10;                node.appendChild(document.createTextNode(content));&#10;            }&#10;            return node;&#10;        }&#10;&#10;        function viewLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:displayTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;view&quot;));&#10;            return node;&#10;        }&#10;&#10;        function deleteLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:deleteTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;delete&quot;));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;displayAllTasks()&quot;&gt;&#10;&lt;h1&gt;Task Manager Client&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:displayAllTasks()&quot;&gt;&#10;    &lt;span&gt;View all the tasks&lt;/span&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;priorityForm&quot; action=&quot;javascript:displayTasksWithPriority()&quot;&gt;&#10;    &lt;span&gt;View tasks with priority&lt;/span&gt;&#10;    &lt;select name=&quot;priority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;addTaskForm&quot; action=&quot;javascript:addNewTask()&quot;&gt;&#10;    &lt;span&gt;Create new task with&lt;/span&gt;&#10;    &lt;label for=&quot;newTaskName&quot;&gt;name&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot; name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;    &lt;label for=&quot;newTaskDescription&quot;&gt;description&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot; name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;    &lt;label for=&quot;newTaskPriority&quot;&gt;priority&lt;/label&gt;&#10;    &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;hr&gt;&#10;&lt;div&gt;&#10;    Current task is &lt;em id=&quot;currentTaskDisplay&quot;&gt;None&lt;/em&gt;&#10;&lt;/div&gt;&#10;&lt;hr&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        これは以前のチュートリアルで使用されたものと同じ SPA です。JavaScript で記述されており、ブラウザ内で利用可能なライブラリのみを使用しているため、クライアント側の依存関係について心配する必要はありません。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="アプリケーションの手動テスト" id="test-manually">
            <procedure id="test-manually-procedure">
                <step>
                    <p>IntelliJ IDEA で実行ボタン
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="IntelliJ IDEA 実行アイコン"/>)
                        をクリックして、アプリケーションを起動します。</p>
                </step>
                <step>
                    <p>
                        ブラウザで <a
                            href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>
                        にアクセスします。3つのフォームと、フィルタリングされた結果を表示するテーブルで構成されたクライアントページが表示されるはずです。
                    </p>
                    <img src="tutorial_server_db_integration_index_page.png"
                         alt="Task Manager Client を表示しているブラウザウィンドウ"
                         border-effect="rounded"
                         width="706"/>
                </step>
                <step>
                    <p>
                        <control>Go</control>
                        ボタンを使用してフォームを入力および送信し、アプリケーションをテストします。テーブル項目にある
                        <control>View</control>
                        ボタンと
                        <control>Delete</control>
                        ボタンも試してみてください。
                    </p>
                    <img src="tutorial_server_db_integration_manual_test.gif"
                         alt="Task Manager Client を表示しているブラウザウィンドウ"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="自動ユニットテストの追加" id="add-automated-tests">
            <procedure id="add-automated-tests-procedure">
                <step>
                    <p>
                        <Path>src/test/kotlin</Path>
                        にある
                        <Path>ServerTest.kt</Path>
                        ファイルを開き、次のテストを追加します。
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;suspend fun Application.configureTestApp() {&#10;    dependencies {&#10;        provide&lt;TaskRepository&gt; {&#10;            FakeTaskRepository()&#10;        }&#10;    }&#10;    configureSerialization()&#10;    configureStatusPages()&#10;    configureRouting()&#10;}&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                    <p>
                        これらのテストをコンパイルして実行するには、Ktor Client 用の <a
                            href="https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html">Content
                        Negotiation</a>
                        プラグインへの依存関係を追加する必要があります。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>build.gradle.kts</Path>
                        を開き、次の依存関係を追加します。
                    </p>
                    <code-block lang="kotlin" code="                        dependencies {&#10;                            //...&#10;                            testImplementation(ktorLibs.client.contentNegotiation)&#10;                        }"/>
                </step>
                <step>
                    <p>IntelliJ IDEA で、エディターの右側にある Gradle 通知アイコン
                        (<img alt="IntelliJ IDEA Gradle アイコン"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        をクリックして、Gradle の変更をロードします。</p>
                </step>
                <step>
                    <p>IntelliJ IDEA で、テストクラス定義の横にある実行ボタン
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="IntelliJ IDEA 実行アイコン"/>)
                        をクリックしてテストを実行します。</p>
                    <p>
                        <control>Run</control>
                        ペインに、テストが正常に実行されたことが表示されます。
                    </p>
                    <img src="tutorial_server_db_integration_test_results.png"
                         alt="IntelliJ IDEA の Run ペインに表示された成功したテスト結果"
                         border-effect="line"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="PostgreSQL リポジトリの追加" id="add-postgresql-repository">
        <p>
            インメモリデータを使用する動作可能なアプリケーションができたので、次のステップはデータストレージを外部の PostgreSQL データベースに移行することです。
        </p>
        <p>
            これは以下の手順で行います。
        </p>
        <list type="decimal">
            <li><a href="#create-schema">PostgreSQL 内にデータベーススキーマを作成する</a></li>
            <li><a href="#adapt-repo">非同期アクセスのために <code>TaskRepository</code> を適合させる</a></li>
            <li><a href="#config-db-connection">アプリケーション内でデータベース接続を設定する</a></li>
            <li><a href="#create-mapping"><code>Task</code> 型を関連するデータベーステーブルにマッピングする</a></li>
            <li><a href="#create-new-repo">マッピングに基づいて新しいリポジトリを作成する</a></li>
            <li><a href="#switch-repo">起動コードで新しいリポジトリに切り替える</a></li>
        </list>
        <chapter title="データベーススキーマの作成" id="create-schema">
            <procedure id="create-schema-procedure">
                <step>
                    <p>
                        お好みのデータベース管理ツールを使用して、PostgreSQL 内に新しいデータベースを作成します。
                        名前は覚えておけるものであれば何でも構いません。この例では、
                        <Path>ktor_tutorial_db</Path>
                        を使用します。
                    </p>
                    <tip>
                        <p>
                            PostgreSQL の詳細については、<a
                                href="https://www.postgresql.org/docs/current/">公式ドキュメント</a> を参照してください。
                        </p>
                        <p>
                            IntelliJ IDEA では、データベースツールを使用して <a
                                href="https://www.jetbrains.com/help/idea/postgresql.html">PostgreSQL データベースに接続および管理</a> できます。
                        </p>
                    </tip>
                </step>
                <step>
                    <p>
                        データベースに対して以下の SQL コマンドを実行します。これらのコマンドにより、データベーススキーマが作成され、初期データが投入されます。
                    </p>
                    <code-block lang="sql" code="                        DROP TABLE IF EXISTS task;&#10;                        CREATE TABLE task(id SERIAL PRIMARY KEY, name VARCHAR(50), description VARCHAR(50), priority VARCHAR(50));&#10;&#10;                        INSERT INTO task (name, description, priority) VALUES ('cleaning', 'Clean the house', 'Low');&#10;                        INSERT INTO task (name, description, priority) VALUES ('gardening', 'Mow the lawn', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('shopping', 'Buy the groceries', 'High');&#10;                        INSERT INTO task (name, description, priority) VALUES ('painting', 'Paint the fence', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('exercising', 'Walk the dog', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('meditating', 'Contemplate the infinite', 'High');"/>
                    <p>
                        以下の点に注意してください。
                    </p>
                    <list>
                        <li>
                            <code>name</code>、<code>description</code>、<code>priority</code> のカラムを持つ <code>task</code> という単一のテーブルを作成しています。これらは <code>Task</code> クラスのプロパティにマッピングする必要があります。
                        </li>
                        <li>
                            テーブルがすでに存在する場合は再作成しているため、このスクリプトは繰り返し実行できます。
                        </li>
                        <li>
                            <code>SERIAL</code> 型の <code>id</code> という追加のカラムがあります。これは、各行にプライマリキーを付与するために使用される整数値です。これらの値はデータベースによって自動的に割り当てられます。
                        </li>
                    </list>
                </step>
            </procedure>
        </chapter>
        <chapter title="既存のリポジトリの適合" id="adapt-repo">
            <procedure id="adapt-repo-procedure">
                <p>
                    データベースに対してクエリを実行する際は、HTTP リクエストを処理するスレッドをブロックしないよう、非同期で実行することが望ましいです。Kotlin では、これは <a
                        href="https://kotlinlang.org/docs/coroutines-overview.html">コルーチン（coroutines）</a> を使用して管理するのが最適です。
                </p>
                <step>
                    <p>
                        <Path>src/main/kotlin/model</Path>
                        にある
                        <Path>TaskRepository.kt</Path>
                        ファイルを開きます。
                    </p>
                </step>
                <step>
                    <p>
                        すべてのインターフェースメソッドに <code>suspend</code> キーワードを追加します。
                    </p>
                    <code-block lang="kotlin" code="                    interface TaskRepository {&#10;                        suspend fun allTasks(): List&lt;Task&gt;&#10;                        suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                        suspend fun taskByName(name: String): Task?&#10;                        suspend fun addTask(task: Task)&#10;                        suspend fun removeTask(name: String): Boolean&#10;                    }"/>
                    <p>
                        これにより、インターフェースメソッドの実装が別のコルーチンディスパッチャで処理を開始できるようになります。
                    </p>
                    <p>
                        これに合わせて <code>FakeTaskRepository</code> のメソッドも調整する必要がありますが、その実装ではディスパッチャを切り替える必要はありません。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>FakeTaskRepository.kt</Path>
                        ファイルを開き、すべてのメソッドに <code>suspend</code> キーワードを追加します。
                    </p>
                    <code-block lang="kotlin" code="                    class FakeTaskRepository : TaskRepository {&#10;                        //...&#10;&#10;                        override suspend fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                        override suspend fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun taskByName(name: String) = tasks.find {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun addTask(task: Task) {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun removeTask(name: String): Boolean {&#10;                            //...&#10;                        }&#10;                    }"/>
                    <p>
                        ここまでは、新しい機能は導入していません。代わりに、データベースに対して非同期にクエリを実行する <code>PostgresTaskRepository</code> を作成するための準備を整えました。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="データベース接続の設定" id="config-db-connection">
            <procedure id="config-db-connection-procedure">
                <p>
                    <a href="#delete-function">このチュートリアルの最初のパート</a> で、<Path>Exposed.kt</Path> 内の <code>.configureExposed()</code> 関数のサンプルコードを削除しました。これで、独自のコードを実装する準備が整いました。
                </p>
                <p>
                    DAO 型のサポートは Ktor Project Generator で追加されていないため、まず Gradle ビルドファイルに関連する依存関係を追加する必要があります。
                </p>
                <step>
                    <Path>gradle/libs.versions.toml</Path> ファイルに、<code>exposed-jdbc</code> と <code>exposed-dao</code> ライブラリを追加します。
                    <code-block lang="kotlin" code="                        [libraries]&#10;                        exposed-jdbc = { module = &quot;org.jetbrains.exposed:exposed-jdbc&quot;, version.ref = &quot;exposed&quot; }&#10;                        exposed-dao = { module = &quot;org.jetbrains.exposed:exposed-dao&quot;, version.ref = &quot;exposed&quot; }"/>
                    これにより、Exposed の Data Access Object（DAO）パターンを操作できるようになります。
                </step>
                <step>
                    <Path>build.gradle.kts</Path> ファイルに、次の依存関係を追加します。
                    <code-block lang="kotlin" code="                    dependencies {&#10;                        // ...&#10;                        implementation(libs.exposed.jdbc)&#10;                        implementation(libs.exposed.dao)&#10;                    }"/>
                </step>
                <step>
                    <p>IntelliJ IDEA で、エディターの右側にある Gradle 通知アイコン
                        (<img alt="IntelliJ IDEA Gradle アイコン"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        をクリックして、Gradle の変更をロードします。</p>
                </step>
                <step>
                    <Path>src/main/kotlin</Path>
                    にある
                    <Path>Exposed.kt</Path>
                    ファイルを開きます。
                </step>
                <step>
                    <p>
                        <code>Database.connect()</code> 関数を使用してデータベースに接続し、使用環境に合わせて設定の値を調整します。
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                            Database.connect(&#10;                                &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;,&#10;                                user = &quot;postgres&quot;,&#10;                                password = &quot;password&quot;&#10;                            )&#10;                        }"/>
                    <p><code>url</code> には以下の要素が含まれていることに注意してください。</p>
                    <list>
                        <li>
                            <code>localhost:5432</code> は、PostgreSQL データベースが実行されているホストとポートです。
                        </li>
                        <li>
                            <code>ktor_tutorial_db</code> は、サービスの実行時に作成されるデータベースの名前です。
                        </li>
                    </list>
                    <tip>
                        詳細については、
                        <a href="https://www.jetbrains.com/help/exposed/working-with-database.html">
                            Working with Databases in Exposed</a> を参照してください。
                    </tip>
                </step>
            </procedure>
        </chapter>
        <chapter title="オブジェクト/リレーショナルマッピングの作成" id="create-mapping">
            <procedure id="create-mapping-procedure">
                <step>
                    <Path>src/main/kotlin</Path>
                    に移動し、
                    <Path>db</Path>
                    という名前の新しいパッケージを作成します。
                </step>
                <step>
                    <Path>db</Path>
                    パッケージ内に、新しい
                    <Path>mapping.kt</Path>
                    ファイルを作成します。
                </step>
                <step>
                    <p>
                        <Path>mapping.kt</Path>
                        を開き、<code>TaskTable</code> 型と <code>TaskDAO</code> 型を追加します。
                    </p>
                    <code-block lang="kotlin" code="package com.example.db&#10;&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}"/>
                    <p>
                        これらの型は、Exposed ライブラリを使用して <code>Task</code> 型のプロパティをデータベースの <code>task</code> テーブルのカラムにマッピングします。<code>TaskTable</code> 型は基本的なマッピングを定義し、<code>TaskDAO</code> 型はタスクの作成、検索、更新、削除を行うヘルパーメソッドを追加します。
                    </p>
                </step>
                <step>
                    <p>
                        同じ
                        <Path>mapping.kt</Path>
                        ファイル内に、以下のヘルパー関数を追加します。
                    </p>
                    <code-block include-symbol="withTransaction, daoToModel"
                            lang="kotlin" code="package com.example.db&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}&#10;&#10;suspend fun &lt;T&gt; withTransaction(block: suspend JdbcTransaction.() -&gt; T): T = withContext(Dispatchers.IO) {&#10;    inTopLevelSuspendTransaction { block() }&#10;}&#10;&#10;fun daoToModel(dao: TaskDAO) = Task(&#10;    dao.name,&#10;    dao.description,&#10;    Priority.valueOf(dao.priority)&#10;)"/>
                    <list>
                        <li>
                            <code>withTransaction()</code> 関数は、新しいトップレベルのデータベーストランザクション内でサスペンディングブロックを実行します。ブロッキング JDBC 操作が IO タスク用に最適化されたスレッドプールで実行されるように、コルーチンコンテキストは <code>Dispatchers.IO</code> に切り替えられます。
                        </li>
                        <li>
                            <code>daoToModel()</code> 関数は、<code>TaskDAO</code> 型のインスタンスを <code>Task</code> オブジェクトに変換します。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        不足している以下のインポートを追加します。
                    </p>
                    <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="新しいリポジトリの作成" id="create-new-repo">
            <procedure id="create-new-repo-procedure">
                <p>これで、データベース固有のリポジトリを作成するために必要なすべてのリソースが揃いました。</p>
                <step>
                    <Path>src/main/kotlin/model</Path>
                    に移動し、新しい
                    <Path>PostgresTaskRepository.kt</Path>
                    ファイルを作成します。
                </step>
                <step>
                    <p>
                        <Path>PostgresTaskRepository.kt</Path>
                        ファイルを開き、以下の実装で新しい型を作成します。
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import com.example.db.TaskDAO&#10;import com.example.db.TaskTable&#10;import com.example.db.daoToModel&#10;import com.example.db.withTransaction&#10;import org.jetbrains.exposed.v1.core.eq&#10;import org.jetbrains.exposed.v1.jdbc.deleteWhere&#10;&#10;class PostgresTaskRepository : TaskRepository {&#10;    override suspend fun allTasks(): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO.all().map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.priority eq priority.toString()) }&#10;            .map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun taskByName(name: String): Task? = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.name eq name) }&#10;            .limit(1)&#10;            .map(::daoToModel)&#10;            .firstOrNull()&#10;    }&#10;&#10;    override suspend fun addTask(task: Task): Unit = withTransaction {&#10;        TaskDAO.new {&#10;            name = task.name&#10;            description = task.description&#10;            priority = task.priority.toString()&#10;        }&#10;    }&#10;&#10;    override suspend fun removeTask(name: String): Boolean = withTransaction {&#10;        val rowsDeleted = TaskTable.deleteWhere {&#10;            TaskTable.name eq name&#10;        }&#10;        rowsDeleted == 1&#10;    }&#10;}"/>
                    <p>
                        この実装では、<code>TaskDAO</code> 型と <code>TaskTable</code> 型のヘルパーメソッドを使用してデータベースと対話します。この新しいリポジトリを作成した後は、ルート内でこれを使用するように切り替える作業のみが残っています。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="新しいリポジトリへの切り替え" id="switch-repo">
            <procedure id="switch-repo-procedure">
                <p>外部データベースに切り替えるには、リポジトリの型を変更するだけです。</p>
                <step>
                    <Path>src/main/kotlin</Path>
                    にある
                    <Path>main.kt</Path>
                    ファイルを開きます。
                </step>
                <step>
                    <p>
                        <code>Application.configureDependencies()</code> 関数で、<code>FakeTaskRepository</code> を <code>PostgresTaskRepository</code> に置き換えます。
                    </p>
                    <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.PostgresTaskRepository&#10;&#10;                    //...&#10;&#10;                    fun Application.configureDependencies() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                PostgresTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        インターフェースを介して依存関係を注入しているため、実装の切り替えはルートを管理するコードに対して透過的です（影響を与えません）。
                    </p>
                </step>
                <step>
                    <p>
                        IntelliJ IDEA で再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="IntelliJ IDEA 再実行アイコン"/>) をクリックして、アプリケーションを再起動します。
                    </p>
                </step>
                <step>
                    <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a> にアクセスします。UI は変わりませんが、データがデータベースから取得されるようになっています。
                </step>
                <step>
                    <p>
                        これを確認するには、フォームを使用して新しいタスクを追加し、PostgreSQL の tasks テーブルに保持されているデータをクエリします。
                    </p>
                    <tip>
                        <p>
                            IntelliJ IDEA では、<a href="https://www.jetbrains.com/help/idea/query-consoles.html#create_console">Query console（クエリコンソール）</a> と <code>SELECT</code> SQL 文を使用してテーブルデータをクエリできます。
                        </p>
                        <code-block lang="SQL" code="                            SELECT * FROM task;"/>
                        <p>
                            クエリを実行すると、新しいタスクを含むデータが
                            <ui-path>Service</ui-path>
                            ペインに表示されるはずです。
                        </p>
                        <img src="tutorial_server_db_integration_task_table.png"
                             alt="IntelliJ IDEA の Service ペインに表示されたタスクのテーブル"
                             border-effect="line"
                             width="706"/>
                    </tip>
                </step>
            </procedure>
        </chapter>
        <p>
            これで、アプリケーションへのデータベースの統合が正常に完了しました。
        </p>
        <p>
            <code>FakeTaskRepository</code> 型は本番コードでは不要になったため、<Path>src/test</Path> のテストソースセットに移動できます。
        </p>
        <p>
            最終的なプロジェクト構造は以下のようになります。
        </p>
        <img src="tutorial_server_db_integration_src_folder.png"
             alt="IntelliJ IDEA のプロジェクトビューに表示された src フォルダ"
             border-effect="line"
             width="400"/>
    </chapter>
    <chapter title="次のステップ" id="next-steps">
        <p>
            これで、Ktor RESTful サービスと通信するアプリケーションが完成しました。これは内部的に、<a href="https://github.com/JetBrains/Exposed">Exposed</a> で記述されたリポジトリを使用して <a href="https://www.postgresql.org/docs/">PostgreSQL</a> にアクセスします。また、Web サーバーやデータベースを必要とせずにコア機能を検証する <a href="#add-automated-tests">テストスイート</a> も用意されています。
        </p>
        <p>
            この構造は任意の機能をサポートするために必要に応じて拡張できますが、まずは耐障害性、セキュリティ、スケーラビリティなどの設計の非機能面を考慮することをお勧めします。まずは、<a href="docker-compose.topic#extract-db-settings">データベース接続設定を抽出し</a>、<Links href="/ktor/server-configuration-file" summary="設定ファイルでさまざまなサーバーパラメータを設定する方法を学びます。">設定ファイル</Links> に定義することから始めることができます。
        </p>
    </chapter>
</topic>