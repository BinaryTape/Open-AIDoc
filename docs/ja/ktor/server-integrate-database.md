[//]: # (title: Kotlin、Ktor、Exposed によるデータベースの統合)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-server-db-integration"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>使用プラグイン</b>: <Links href="server-static-content.md" summary="スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。">Static Content</Links>、
<Links href="server-serialization.md" summary="ContentNegotiation プラグインには、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主な目的があります。">Content Negotiation</Links>、<Links href="server-status-pages.md" summary="%plugin_name% を使用すると、スローされた例外やステータスコードに基づいて、Ktor アプリケーションがあらゆる障害状態に適切に応答できるようになります。">Status Pages</Links>、
<Links href="server-serialization.md" summary="ContentNegotiation プラグインには、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主な目的があります。">kotlinx.serialization</Links>、
<Links href="server-dependency-injection.md" summary="必要な依存関係: io.ktor:ktor-server-di コード例: %example_name%">Dependency Injection</Links>、
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
Kotlin と Ktor を使用して、RESTful サービスがデータベースリポジトリに連携するシングルページアプリケーション（SPA）を構築する方法を学びます。Exposed SQL ライブラリを使用し、テスト用にリポジトリをフェイク（模擬）化することも可能です。
</web-summary>

この記事では、Kotlin 向けの SQL ライブラリである [Exposed](https://www.jetbrains.com/exposed/) を使用して、Ktor サービスをリレーショナルデータベースと統合する方法を学びます。

このチュートリアルを終えるまでに、以下の方法を習得できます。

* JSON シリアライゼーションを使用する RESTful サービスを作成する。
* これらのサービスにさまざまなリポジトリを注入（Inject）する。
* インメモリリポジトリを使用してサービスの単体テストを作成する。
* Exposed と依存性注入（DI）を使用して実用的なリポジトリを構築する。
* 外部データベースにアクセスするサービスをデプロイする。

以前のチュートリアルでは、タスクマネージャーの例を使用して、[リクエストの処理](server-requests-and-responses.topic)、[RESTful API の作成](server-create-restful-apis.topic)、[Thymeleaf テンプレートを使用した Web アプリの構築](server-create-website.topic)などの基本事項を扱いました。

それらのチュートリアルではシンプルなインメモリの `TaskRepository` を使用してフロントエンド機能に焦点を当てていましたが、本ガイドでは、Exposed SQL ライブラリを通じて Ktor サービスがリレーショナルデータベースとどのようにやり取りできるかに焦点を移します。

本ガイドは以前のものより長くて複雑ですが、すぐに動作するコードを作成し、段階的に新機能を導入していきます。

本ガイドは以下の2つのパートで構成されています。

1. [インメモリリポジトリを使用したアプリケーションの作成](#create-restful-service-and-repository)
2. [インメモリリポジトリを PostgreSQL を使用するものに置き換える](#add-postgresql-repository)

## 前提条件 {id="prerequisites"}

このチュートリアルは単独で進めることも可能ですが、コンテンツネゴシエーションと REST に慣れるために、事前に [RESTful API の作成](server-create-restful-apis.topic) チュートリアルを完了しておくことをお勧めします。

[IntelliJ IDEA](https://www.jetbrains.com/help/idea/installation-guide.html) のインストールを推奨しますが、お好みの他の IDE を使用することも可能です。

## RESTful サービスとインメモリリポジトリの作成 {id="create-restful-service-and-repository"}

まず、タスクマネージャーの RESTful サービスを再作成します。最初はインメモリリポジトリを使用しますが、最小限の手間で置き換えられるような設計で構造化します。

これには以下の6つのステージがあります。

1. [初期プロジェクトの作成](#create-project)
2. [スターターコードの追加](#add-starter-code)
3. [CRUD ルートの追加](#add-routes)
4. [シングルページアプリケーション（SPA）の追加](#add-client-page)
5. [アプリケーションの手動テスト](#test-manually)
6. [自動テストの追加](#add-automated-tests)

### プラグインを含めた新規プロジェクトの作成 {id="create-project"}

Ktor Project Generator で新しいプロジェクトを作成するには、以下の手順に従ってください。

<procedure id="create-project-procedure">

1. <p>
       <a href="https://start.ktor.io/">Ktor Project Generator</a> にアクセスします。
   </p>
2. **Project artifact** フィールドに、プロジェクトのアーティファクト名として `com.example.ktor-exposed-task-app` と入力します。

   ![Ktor Project Generator でのプロジェクトアーティファクトの命名](tutorial_server_db_integration_project_artifact.png){width="706" border-effect="line" style="block"}
3. プラグインセクションで、**Add** ボタンをクリックして以下のプラグインを検索し、追加します。
   * Content Negotiation
   * kotlinx.serialization
   * Static Content
   * Status Pages
   * Dependency Injection
   * Exposed
   * PostgreSQL

   ![Ktor Project Generator でのプラグインの追加](ktor_project_generator_add_plugins.gif){width="706" border-effect="line" style="block"}
4. プラグインを追加したら、プラグインセクションの右上にある **7 plugins** ボタンをクリックして、追加されたプラグインを確認します。

   プロジェクトに追加されるすべてのプラグインのリストが表示されます。
   ![Ktor Project Generator でのプラグインのドロップダウン](tutorial_server_db_integration_plugin_list.png){width="706" border-effect="line" style="block"}
5. <p>
       <control>Download</control> ボタンをクリックして、Ktor プロジェクトを生成してダウンロードします。
   </p>
6. 生成されたプロジェクトを [IntelliJ IDEA](https://www.jetbrains.com/help/idea/installation-guide.html) またはお好みの IDE で開きます。
7. <Path>src/main/kotlin</Path> に移動し、<Path>CitySchema.kt</Path>、<Path>UsersService.kt</Path>、<Path>GreetingService.kt</Path>、<Path>Postgres.kt</Path> ファイルを削除します。
8. <Path>Exposed.kt</Path> ファイルを開き、`.configureExposed()` 関数の内容を削除します: {id="delete-function"}

   ```kotlin
   suspend fun Application.configureExposed() {
   }
   ```

   この機能を削除する理由は、Ktor Project Generator がユーザーや都市に関するデータを HSQLDB や PostgreSQL に永続化する方法を示すサンプルコードを追加したためです。このチュートリアルでは、そのサンプルコードは必要ありません。
9. <Path>gradle/libs.versions.toml</Path> ファイルを開き、最新の Exposed バージョンが指定されていることを確認します。

   ```kotlin
   [versions]
   #...
   exposed = %exposed_version%
   ```

</procedure>

### スターターコードの追加 {id="add-starter-code"}

<procedure id="add-starter-code-procedure">

1. <Path>src/main/kotlin</Path> に移動し、<Path>model</Path> というサブパッケージを作成します。
2. <Path>model</Path> パッケージ内に、新しい <Path>Task.kt</Path> ファイルを作成します。
3. <Path>Task.kt</Path> を開き、優先度を表す enum とタスクを表すクラスを追加します。

   ```kotlin
   package com.example.model
   
   import kotlinx.serialization.Serializable
   
   enum class Priority {
       Low, Medium, High, Vital
   }
   
   @Serializable
   data class Task(
       val name: String,
       val description: String,
       val priority: Priority
   )
   ```

   `Task` クラスには、[`kotlinx.serialization`](server-serialization.md) ライブラリの `Serializable` アノテーションが付けられています。

   以前のチュートリアルと同様に、インメモリリポジトリを作成します。ただし今回は、後で簡単に置き換えられるように、リポジトリにインターフェースを実装させます。
4. <Path>model</Path> サブパッケージ内に、新しい <Path>TaskRepository.kt</Path> ファイルを作成します。
5. <Path>TaskRepository.kt</Path> を開き、以下のインターフェースを追加します。

   ```kotlin
   package com.example.model

   interface TaskRepository {
       fun allTasks(): List<Task>
       fun tasksByPriority(priority: Priority): List<Task>
       fun taskByName(name: String): Task?
       fun addTask(task: Task)
       fun removeTask(name: String): Boolean
   }
   ```
6. 同じディレクトリ内に新しい <Path>FakeTaskRepository.kt</Path> ファイルを作成します。
7. <Path>FakeTaskRepository.kt</Path> を開き、以下のクラスを追加します。

   ```kotlin
   package com.example.model

   class FakeTaskRepository : TaskRepository {
       private val tasks = mutableListOf(
           Task("cleaning", "Clean the house", Priority.Low),
           Task("gardening", "Mow the lawn", Priority.Medium),
           Task("shopping", "Buy the groceries", Priority.High),
           Task("painting", "Paint the fence", Priority.Medium)
       )

       override fun allTasks(): List<Task> = tasks

       override fun tasksByPriority(priority: Priority) = tasks.filter {
           it.priority == priority
       }

       override fun taskByName(name: String) = tasks.find {
           it.name.equals(name, ignoreCase = true)
       }

       override fun addTask(task: Task) {
           if (taskByName(task.name) != null) {
               throw IllegalStateException("Cannot duplicate task names!")
           }
           tasks.add(task)
       }

       override fun removeTask(name: String): Boolean {
           return tasks.removeIf { it.name == name }
       }
   }
   ```

</procedure>

### ルートの追加 {id="add-routes"}

<procedure id="add-routes-procedure">

1. <Path>src/main/kotlin</Path> にある <Path>Serialization.kt</Path> ファイルを開きます。
2. 既存の `Application.configureSerialization()` 関数を以下の実装に置き換えます。

   ```kotlin
   package com.example
   
   import com.example.model.Priority
   import com.example.model.Task
   import com.example.model.TaskRepository
   import io.ktor.http.*
   import io.ktor.serialization.*
   import io.ktor.serialization.kotlinx.json.*
   import io.ktor.server.application.*
   import io.ktor.server.plugins.contentnegotiation.*
   import io.ktor.server.plugins.di.dependencies
   import io.ktor.server.request.*
   import io.ktor.server.response.*
   import io.ktor.server.routing.*
   
   suspend fun Application.configureSerialization() {
       val repository = dependencies.resolve<TaskRepository>()
   
       install(ContentNegotiation) {
           json()
       }
       routing {
           route("/tasks") {
               get {
                   val tasks = repository.allTasks()
                   call.respond(tasks)
               }
   
               get("/byName/{taskName}") {
                   val name = call.parameters["taskName"]
                   if (name == null) {
                       call.respond(HttpStatusCode.BadRequest)
                       return@get
                   }
                   val task = repository.taskByName(name)
                   if (task == null) {
                       call.respond(HttpStatusCode.NotFound)
                       return@get
                   }
                   call.respond(task)
               }
   
               get("/byPriority/{priority}") {
                   val priorityAsText = call.parameters["priority"]
                   if (priorityAsText == null) {
                       call.respond(HttpStatusCode.BadRequest)
                       return@get
                   }
                   try {
                       val priority = Priority.valueOf(priorityAsText)
                       val tasks = repository.tasksByPriority(priority)
   
   
                       if (tasks.isEmpty()) {
                           call.respond(HttpStatusCode.NotFound)
                           return@get
                       }
                       call.respond(tasks)
                   } catch (ex: IllegalArgumentException) {
                       call.respond(HttpStatusCode.BadRequest)
                   }
               }
   
               post {
                   try {
                       val task = call.receive<Task>()
                       repository.addTask(task)
                       call.respond(HttpStatusCode.NoContent)
                   } catch (ex: IllegalStateException) {
                       call.respond(HttpStatusCode.BadRequest)
                   } catch (ex: JsonConvertException) {
                       call.respond(HttpStatusCode.BadRequest)
                   }
               }
   
               delete("/{taskName}") {
                   val name = call.parameters["taskName"]
                   if (name == null) {
                       call.respond(HttpStatusCode.BadRequest)
                       return@delete
                   }
                   if (repository.removeTask(name)) {
                       call.respond(HttpStatusCode.NoContent)
                   } else {
                       call.respond(HttpStatusCode.NotFound)
                   }
               }
           }
       }
   }
   ```

   これは、Ktor の依存性注入コンテナからリポジトリを解決している点を除いて、[RESTful API の作成](server-create-restful-apis.topic)チュートリアルで実装したものと同じルーティングです。依存関係の型が `interface` であるため、さまざまな実装を注入できます。

   `dependencies.resolve()` は suspend 関数であるため、`.configureSerialization()` も suspend として宣言する必要があります。

   `.configureSerialization()` に依存関係を追加したため、既存の呼び出しはコンパイルされなくなります。幸いにも、この関数は一度しか呼び出されません。
3. <Path>src/main/kotlin</Path> 内の <Path>DI.kt</Path> ファイルを開きます。
4. `.configureDependencyInjection()` 関数の内容を以下の実装に置き換えます。

   ```kotlin
   import com.example.model.FakeTaskRepository
   import com.example.model.TaskRepository
   // ...

   fun Application.configureDependencyInjection() {
       dependencies {
           provide<TaskRepository> {
               FakeTaskRepository()
           }
       }
   }
   ```

   これで、`TaskRepository` の実装として `FakeTaskRepository` が登録されました。長期的な目標は、これを `PostgresTaskRepository` に置き換えられるようにすることです。
5. <Path>src/main/resources</Path> フォルダ内にある <Path>application.yaml</Path> ファイルを開き、`.configureDependencyInjection()` 関数が `.configureSerialization()` の前に記述されていることを確認します。

   ```yaml
   ktor:
       deployment:
           port: 8080
       application:
           modules:
               - com.example.DIKt.configureDependencyInjection
               - com.example.SerializationKt.configureSerialization
               - com.example.ExposedKt.configureExposed
               - com.example.StatusPagesKt.configureStatusPages
               - com.example.RoutingKt.configureRouting
   ```

</procedure>

### クライアントページの追加 {id="add-client-page"}

<procedure id="add-client-page-procedure">

1. <Path>src/main/resources/static</Path> の <Path>index.html</Path> ファイルを開きます。
2. 現在の内容を以下の実装に置き換えます。

   ```html
   <html>
   <head>
       <title>A Simple SPA For Tasks</title>
       <script type="application/javascript">
           function displayAllTasks() {
               clearTasksTable();
               fetchAllTasks().then(displayTasks)
           }
   
           function displayTasksWithPriority() {
               clearTasksTable();
               const priority = readTaskPriority();
               fetchTasksWithPriority(priority).then(displayTasks)
           }
   
           function displayTask(name) {
               fetchTaskWithName(name).then(t =>
                   taskDisplay().innerHTML
                       = `${t.priority} priority task ${t.name} with description "${t.description}"`
               )
           }
   
           function deleteTask(name) {
               deleteTaskWithName(name).then(() => {
                   clearTaskDisplay();
                   displayAllTasks();
               })
           }
   
           function deleteTaskWithName(name) {
               return sendDELETE(`/tasks/${name}`)
           }
   
           function addNewTask() {
               const task = buildTaskFromForm();
               sendPOST("/tasks", task).then(displayAllTasks);
           }
   
           function buildTaskFromForm() {
               return {
                   name: getTaskFormValue("newTaskName"),
                   description: getTaskFormValue("newTaskDescription"),
                   priority: getTaskFormValue("newTaskPriority")
               }
           }
   
           function getTaskFormValue(controlName) {
               return document.addTaskForm[controlName].value;
           }
   
           function taskDisplay() {
               return document.getElementById("currentTaskDisplay");
           }
   
           function readTaskPriority() {
               return document.priorityForm.priority.value
           }
   
           function fetchTasksWithPriority(priority) {
               return sendGET(`/tasks/byPriority/${priority}`);
           }
   
           function fetchTaskWithName(name) {
               return sendGET(`/tasks/byName/${name}`);
           }
   
           function fetchAllTasks() {
               return sendGET("/tasks")
           }
   
           function sendGET(url) {
               return fetch(
                   url,
                   {headers: {'Accept': 'application/json'}}
               ).then(response => {
                   if (response.ok) {
                       return response.json()
                   }
                   return [];
               });
           }
   
           function sendPOST(url, data) {
               return fetch(url, {
                   method: 'POST',
                   headers: {'Content-Type': 'application/json'},
                   body: JSON.stringify(data)
               });
           }
   
           function sendDELETE(url) {
               return fetch(url, {
                   method: "DELETE"
               });
           }
   
           function tasksTable() {
               return document.getElementById("tasksTableBody");
           }
   
           function clearTasksTable() {
               tasksTable().innerHTML = "";
           }
   
           function clearTaskDisplay() {
               taskDisplay().innerText = "None";
           }
   
           function displayTasks(tasks) {
               const tasksTableBody = tasksTable()
               tasks.forEach(task => {
                   const newRow = taskRow(task);
                   tasksTableBody.appendChild(newRow);
               });
           }
   
           function taskRow(task) {
               return tr([
                   td(task.name),
                   td(task.priority),
                   td(viewLink(task.name)),
                   td(deleteLink(task.name)),
               ]);
           }
   
           function tr(children) {
               const node = document.createElement("tr");
               children.forEach(child => node.appendChild(child));
               return node;
           }
   
           function td(content) {
               const node = document.createElement("td");
               if (content instanceof Element) {
                   node.appendChild(content)
               } else {
                   node.appendChild(document.createTextNode(content));
               }
               return node;
           }
   
           function viewLink(taskName) {
               const node = document.createElement("a");
               node.setAttribute(
                   "href", `javascript:displayTask("${taskName}")`
               )
               node.appendChild(document.createTextNode("view"));
               return node;
           }
   
           function deleteLink(taskName) {
               const node = document.createElement("a");
               node.setAttribute(
                   "href", `javascript:deleteTask("${taskName}")`
               )
               node.appendChild(document.createTextNode("delete"));
               return node;
           }
       </script>
   </head>
   <body onload="displayAllTasks()">
   <h1>Task Manager Client</h1>
   <form action="javascript:displayAllTasks()">
       <span>View all the tasks</span>
       <input type="submit" value="Go">
   </form>
   <form name="priorityForm" action="javascript:displayTasksWithPriority()">
       <span>View tasks with priority</span>
       <select name="priority">
           <option name="Low">Low</option>
           <option name="Medium">Medium</option>
           <option name="High">High</option>
           <option name="Vital">Vital</option>
       </select>
       <input type="submit" value="Go">
   </form>
   <form name="addTaskForm" action="javascript:addNewTask()">
       <span>Create new task with</span>
       <label for="newTaskName">name</label>
       <input type="text" id="newTaskName" name="newTaskName" size="10">
       <label for="newTaskDescription">description</label>
       <input type="text" id="newTaskDescription" name="newTaskDescription" size="20">
       <label for="newTaskPriority">priority</label>
       <select id="newTaskPriority" name="newTaskPriority">
           <option name="Low">Low</option>
           <option name="Medium">Medium</option>
           <option name="High">High</option>
           <option name="Vital">Vital</option>
       </select>
       <input type="submit" value="Go">
   </form>
   <hr>
   <div>
       Current task is <em id="currentTaskDisplay">None</em>
   </div>
   <hr>
   <table>
       <thead>
       <tr>
           <th>Name</th>
           <th>Priority</th>
           <th></th>
           <th></th>
       </tr>
       </thead>
       <tbody id="tasksTableBody">
       </tbody>
   </table>
   </body>
   </html>
   ```

   これは、以前のチュートリアルで使用されたものと同じ SPA です。JavaScript で書かれており、ブラウザ内で利用可能なライブラリのみを使用しているため、クライアント側の依存関係について心配する必要はありません。

</procedure>

### アプリケーションの手動テスト {id="test-manually"}

<procedure id="test-manually-procedure">

1. <p>IntelliJ IDEA で実行ボタン
       (<img src="intellij_idea_gutter_icon.svg"
             style="inline" height="16" width="16"
             alt="intelliJ IDEA run icon"/>)
       をクリックして、アプリケーションを起動します。</p>
2. ブラウザで [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html) にアクセスします。3つのフォームとフィルタリングされた結果を表示するテーブルで構成されるクライアントページが表示されるはずです。

   ![Task Manager Client を表示するブラウザウィンドウ](tutorial_server_db_integration_index_page.png){width="706" border-effect="rounded"}
3. **Go** ボタンを使用してフォームに入力・送信し、アプリケーションをテストします。テーブル項目の **View** および **Delete** ボタンも使用してみてください。

   ![Task Manager Client を表示するブラウザウィンドウ](tutorial_server_db_integration_manual_test.gif){width="706" border-effect="rounded"}

</procedure>

### 自動単体テストの追加 {id="add-automated-tests"}

<procedure id="add-automated-tests-procedure">

1. <Path>src/test/kotlin</Path> の <Path>ServerTest.kt</Path> ファイルを開き、以下のテストを追加します。

   ```kotlin
   package com.example
   
   import com.example.model.Priority
   import com.example.model.Task
   import com.example.model.TaskRepository
   import io.ktor.client.call.*
   import io.ktor.client.plugins.contentnegotiation.*
   import io.ktor.server.plugins.di.dependencies
   import io.ktor.client.request.*
   import io.ktor.http.*
   import io.ktor.serialization.kotlinx.json.*
   import io.ktor.server.application.*
   import io.ktor.server.testing.*
   import kotlin.test.*
   
   suspend fun Application.configureTestApp() {
       dependencies {
           provide<TaskRepository> {
               FakeTaskRepository()
           }
       }
       configureSerialization()
       configureStatusPages()
       configureRouting()
   }
   
   class ServerTest {
       @Test
       fun tasksCanBeFoundByPriority() = testApplication {
           application {
               configureTestApp()
           }
   
           val client = createClient {
               install(ContentNegotiation) {
                   json()
               }
           }
   
           val response = client.get("/tasks/byPriority/Medium")
           val results = response.body<List<Task>>()
   
           assertEquals(HttpStatusCode.OK, response.status)
   
           val expectedTaskNames = listOf("gardening", "painting")
           val actualTaskNames = results.map(Task::name)
           assertContentEquals(expectedTaskNames, actualTaskNames)
       }
   
       @Test
       fun invalidPriorityProduces400() = testApplication {
           application {
               configureTestApp()
           }
           val response = client.get("/tasks/byPriority/Invalid")
           assertEquals(HttpStatusCode.BadRequest, response.status)
       }
   
       @Test
       fun unusedPriorityProduces404() = testApplication {
           application {
               configureTestApp()
           }
   
           val response = client.get("/tasks/byPriority/Vital")
           assertEquals(HttpStatusCode.NotFound, response.status)
       }
   
       @Test
       fun newTasksCanBeAdded() = testApplication {
           application {
               configureTestApp()
           }
   
           val client = createClient {
               install(ContentNegotiation) {
                   json()
               }
           }
   
           val task = Task("swimming", "Go to the beach", Priority.Low)
           val response1 = client.post("/tasks") {
               header(
                   HttpHeaders.ContentType,
                   ContentType.Application.Json
               )
   
               setBody(task)
           }
           assertEquals(HttpStatusCode.NoContent, response1.status)
   
           val response2 = client.get("/tasks")
           assertEquals(HttpStatusCode.OK, response2.status)
   
           val taskNames = response2
               .body<List<Task>>()
               .map { it.name }
   
           assertContains(taskNames, "swimming")
       }
   }
   ```

   これらのテストをコンパイルして実行するには、Ktor Client 用の [Content Negotiation](https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html) プラグインへの依存関係を追加する必要があります。
2. <Path>build.gradle.kts</Path> ファイルを開き、以下の依存関係を追加します。

   ```kotlin
   dependencies {
       //...
       testImplementation(ktorLibs.client.contentNegotiation)
   }
   ```
3. <p>IntelliJ IDEA で、エディターの右側にある Gradle 通知アイコン
       (<img alt="intelliJ IDEA gradle icon"
             src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
       をクリックして Gradle の変更を読み込みます。</p>
4. <p>IntelliJ IDEA で、テストクラス定義の横にある実行ボタン
       (<img src="intellij_idea_gutter_icon.svg"
             style="inline" height="16" width="16"
             alt="intelliJ IDEA run icon"/>)
       をクリックしてテストを実行します。</p>

   **Run** ペインにテストが正常に実行されたことが表示されます。

   ![IntelliJ IDEA の Run ペインに表示されるテストの成功結果](tutorial_server_db_integration_test_results.png){width="706" border-effect="line"}

</procedure>

## PostgreSQL リポジトリの追加 {id="add-postgresql-repository"}

インメモリデータを使用する動作可能なアプリケーションができたので、次のステップとしてデータストレージを PostgreSQL データベースに外出しします。

これは以下の手順で行います。

1. [PostgreSQL 内にデータベーススキーマを作成する。](#create-schema)
2. [非同期アクセス用に `TaskRepository` を適合させる。](#adapt-repo)
3. [アプリケーション内でデータベース接続を設定する。](#config-db-connection)
4. [`Task` 型を関連付けられたデータベーステーブルにマッピングする。](#create-mapping)
5. [マッピングに基づいた新しいリポジトリを作成する。](#create-new-repo)
6. [起動コードで新しいリポジトリに切り替える。](#switch-repo)

### データベーススキーマの作成 {id="create-schema"}

<procedure id="create-schema-procedure">

1. お好みのデータベース管理ツールを使用して、PostgreSQL 内に新しいデータベースを作成します。
   名前は覚えていられれば何でもかまいません。この例では、`ktor_tutorial_db` を使用します。

   > PostgreSQL の詳細については、[公式ドキュメント](https://www.postgresql.org/docs/current/)を参照してください。
   >
   > IntelliJ IDEA では、データベースツールを利用して [PostgreSQL データベースへの接続と管理](https://www.jetbrains.com/help/idea/postgresql.html)を行うことができます。
   >
   {style="tip"}
2. データベースに対して以下の SQL コマンドを実行します。これらのコマンドによって、データベーススキーマが作成され、データが投入されます。

   ```sql
   DROP TABLE IF EXISTS task;
   CREATE TABLE task(id SERIAL PRIMARY KEY, name VARCHAR(50), description VARCHAR(50), priority VARCHAR(50));

   INSERT INTO task (name, description, priority) VALUES ('cleaning', 'Clean the house', 'Low');
   INSERT INTO task (name, description, priority) VALUES ('gardening', 'Mow the lawn', 'Medium');
   INSERT INTO task (name, description, priority) VALUES ('shopping', 'Buy the groceries', 'High');
   INSERT INTO task (name, description, priority) VALUES ('painting', 'Paint the fence', 'Medium');
   INSERT INTO task (name, description, priority) VALUES ('exercising', 'Walk the dog', 'Medium');
   INSERT INTO task (name, description, priority) VALUES ('meditating', 'Contemplate the infinite', 'High');
   ```

   以下の点に注意してください。
   * `name`、`description`、`priority` のカラムを持つ `task` という単一のテーブルを作成しています。これらは `Task` クラスのプロパティにマッピングする必要があります。
   * 既に存在する場合はテーブルを再作成するようにしているため、スクリプトを繰り返し実行できます。
   * `SERIAL` 型の `id` という追加のカラムがあります。これは各行に主キーを付与するために使用される整数値です。これらの値はデータベースによって自動的に割り当てられます。

</procedure>

### 既存リポジトリの適合 {id="adapt-repo"}

データベースに対してクエリを実行する際は、HTTP リクエストを処理するスレッドのブロックを回避するために、非同期で実行することが望まれます。Kotlin では、これは [コルーチン](https://kotlinlang.org/docs/coroutines-overview.html) を使用して最適に管理されます。

<procedure id="adapt-repo-procedure">

1. <Path>src/main/kotlin/model</Path> の <Path>TaskRepository.kt</Path> ファイルを開きます。
2. すべてのインターフェースメソッドに `suspend` キーワードを追加します。

   ```kotlin
   interface TaskRepository {
       suspend fun allTasks(): List<Task>
       suspend fun tasksByPriority(priority: Priority): List<Task>
       suspend fun taskByName(name: String): Task?
       suspend fun addTask(task: Task)
       suspend fun removeTask(name: String): Boolean
   }
   ```

   これにより、インターフェースメソッドの実装が別のコルーチンディスパッチャ上で処理を開始できるようになります。

   ここで、`FakeTaskRepository` のメソッドもこれに合わせて調整する必要があります（その実装内ではディスパッチャを切り替える必要はありませんが）。
3. <Path>FakeTaskRepository.kt</Path> ファイルを開き、すべてのメソッドに `suspend` キーワードを追加します。

   ```kotlin
   class FakeTaskRepository : TaskRepository {
       //...

       override suspend fun allTasks(): List<Task> = tasks

       override suspend fun tasksByPriority(priority: Priority) = tasks.filter {
           //...
       }

       override suspend fun taskByName(name: String) = tasks.find {
           //...
       }

       override suspend fun addTask(task: Task) {
           //...
       }

       override suspend fun removeTask(name: String): Boolean {
           //...
       }
   }
   ```

   ここまでは、新しい機能は導入していません。代わりに、データベースに対して非同期にクエリを実行する `PostgresTaskRepository` を作成するための土台を整えました。

</procedure>

### データベース接続の設定 {id="config-db-connection"}

[このチュートリアルの最初のパート](#delete-function)で、<Path>Exposed.kt</Path> にあった `.configureExposed()` 関数のサンプルコードを削除しました。これで、独自の実装を追加する準備が整いました。

DAO 型のサポートは Ktor Project Generator によって追加されていないため、まず Gradle ビルドファイルに関連する依存関係を追加する必要があります。

<procedure id="config-db-connection-procedure">

1. <Path>gradle/libs.versions.toml</Path> ファイルに、`exposed-jdbc` と `exposed-dao` ライブラリを追加します。

   ```toml
   [libraries]
   exposed-jdbc = { module = "org.jetbrains.exposed:exposed-jdbc", version.ref = "exposed" }
   exposed-dao = { module = "org.jetbrains.exposed:exposed-dao", version.ref = "exposed" }
   ```

   これにより、Exposed Data Access Object（DAO）パターンを操作できるようになります。
2. <Path>build.gradle.kts</Path> ファイルに、以下の依存関係を追加します。

   ```kotlin
   dependencies {
       // ...
       implementation(libs.exposed.jdbc)
       implementation(libs.exposed.dao)
   }
   ```
   > 必要なトランスポートモジュールは `exposed-jdbc` または `exposed-r2dbc` のいずれか1つのみです。Ktor プロジェクトジェネレーターによって `exposed-r2dbc` への依存関係が追加されている場合は、次に進む前に削除してください。
   >
   {style="note"}
3. <p>IntelliJ IDEA で、エディターの右側にある Gradle 通知アイコン
       (<img alt="intelliJ IDEA gradle icon"
             src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
       をクリックして Gradle の変更を読み込みます。</p>
4. <Path>src/main/kotlin</Path> の <Path>Exposed.kt</Path> ファイルを開きます。
5. `Database.connect()` 関数を使用してデータベースに接続し、環境に合わせて設定の値を調整します。

   ```kotlin
   suspend fun Application.configureExposed() {
       Database.connect(
           "jdbc:postgresql://localhost:5432/ktor_tutorial_db",
           user = "postgres",
           password = "password"
       )
   }
   ```

   `url` には以下のコンポーネントが含まれている点に注意してください。
   * `localhost:5432` は、PostgreSQL データベースが実行されているホストとポートです。
   * `ktor_tutorial_db` は、サービスの実行時に作成されるデータベースの名前です。

   > 詳細については、[Working with Databases in Exposed](https://www.jetbrains.com/help/exposed/working-with-database.html) を参照してください。
   >
   {style="tip"}

</procedure>

### オブジェクト/リレーショナルマッピングの作成 {id="create-mapping"}

<procedure id="create-mapping-procedure">

1. <Path>src/main/kotlin</Path> に移動し、<Path>db</Path> という新しいパッケージを作成します。
2. <Path>db</Path> パッケージ内に、新しい <Path>mapping.kt</Path> ファイルを作成します。
3. <Path>mapping.kt</Path> を開き、型 `TaskTable` と `TaskDAO` を追加します。

   ```kotlin
   package com.example.db
   
   import org.jetbrains.exposed.v1.core.dao.id.EntityID
   import org.jetbrains.exposed.v1.core.dao.id.IntIdTable
   import org.jetbrains.exposed.v1.dao.IntEntity
   import org.jetbrains.exposed.v1.dao.IntEntityClass
   
   object TaskTable : IntIdTable("task") {
       val name = varchar("name", 50)
       val description = varchar("description", 50)
       val priority = varchar("priority", 50)
   }
   
   class TaskDAO(id: EntityID<Int>) : IntEntity(id) {
       companion object : IntEntityClass<TaskDAO>(TaskTable)
   
       var name by TaskTable.name
       var description by TaskTable.description
       var priority by TaskTable.priority
   }
   ```

   これらの型は Exposed ライブラリを使用して、`Task` 型のプロパティをデータベースの `task` テーブルのカラムにマッピングします。`TaskTable` 型は基本的なマッピングを定義し、`TaskDAO` 型はタスクの作成、検索、更新、削除を行うヘルパーメソッドを追加します。
4. 同じ <Path>mapping.kt</Path> ファイルに、以下のヘルパー関数を追加します。

   ```kotlin
   package com.example.db
   
   import com.example.model.Priority
   import com.example.model.Task
   import kotlinx.coroutines.Dispatchers
   import kotlinx.coroutines.withContext
   import org.jetbrains.exposed.v1.core.dao.id.EntityID
   import org.jetbrains.exposed.v1.core.dao.id.IntIdTable
   import org.jetbrains.exposed.v1.dao.IntEntity
   import org.jetbrains.exposed.v1.dao.IntEntityClass
   import org.jetbrains.exposed.v1.jdbc.JdbcTransaction
   import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction
   
   object TaskTable : IntIdTable("task") {
       val name = varchar("name", 50)
       val description = varchar("description", 50)
       val priority = varchar("priority", 50)
   }
   
   class TaskDAO(id: EntityID<Int>) : IntEntity(id) {
       companion object : IntEntityClass<TaskDAO>(TaskTable)
   
       var name by TaskTable.name
       var description by TaskTable.description
       var priority by TaskTable.priority
   }
   
   suspend fun <T> withTransaction(block: suspend JdbcTransaction.() -> T): T = withContext(Dispatchers.IO) {
       inTopLevelSuspendTransaction { block() }
   }
   
   fun daoToModel(dao: TaskDAO) = Task(
       dao.name,
       dao.description,
       Priority.valueOf(dao.priority)
   )
   ```

   * `withTransaction()` 関数は、新しいトップレベルのデータベーストランザクション内でサスペンドブロックを実行します。コルーチンコンテキストは `Dispatchers.IO` に切り替えられるため、ブロッキングな JDBC 操作は I/O タスク用に最適化されたスレッドプール上で実行されます。
   * `daoToModel()` 関数は、`TaskDAO` 型のインスタンスを `Task` オブジェクトに変換します。
5. 不足している以下のインポートを追加します。

   ```kotlin
   import com.example.model.Priority
   import com.example.model.Task
   import kotlinx.coroutines.Dispatchers
   import kotlinx.coroutines.withContext
   import org.jetbrains.exposed.v1.jdbc.JdbcTransaction
   import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction
   ```

</procedure>

### 新しいリポジトリの作成 {id="create-new-repo"}

これで、データベース固有のリポジトリを作成するために必要なリソースがすべて揃いました。

<procedure id="create-new-repo-procedure">

1. <Path>src/main/kotlin/model</Path> に移動し、新しい <Path>PostgresTaskRepository.kt</Path> ファイルを作成します。
2. <Path>PostgresTaskRepository.kt</Path> ファイルを開き、以下の実装で新しい型を作成します。

   ```kotlin
   package com.example.model
   
   import com.example.db.TaskDAO
   import com.example.db.TaskTable
   import com.example.db.daoToModel
   import com.example.db.withTransaction
   import org.jetbrains.exposed.v1.core.eq
   import org.jetbrains.exposed.v1.jdbc.deleteWhere
   
   class PostgresTaskRepository : TaskRepository {
       override suspend fun allTasks(): List<Task> = withTransaction {
           TaskDAO.all().map(::daoToModel)
       }
   
       override suspend fun tasksByPriority(priority: Priority): List<Task> = withTransaction {
           TaskDAO
               .find { (TaskTable.priority eq priority.toString()) }
               .map(::daoToModel)
       }
   
       override suspend fun taskByName(name: String): Task? = withTransaction {
           TaskDAO
               .find { (TaskTable.name eq name) }
               .limit(1)
               .map(::daoToModel)
               .firstOrNull()
       }
   
       override suspend fun addTask(task: Task): Unit = withTransaction {
           TaskDAO.new {
               name = task.name
               description = task.description
               priority = task.priority.toString()
           }
       }
   
       override suspend fun removeTask(name: String): Boolean = withTransaction {
           val rowsDeleted = TaskTable.deleteWhere {
               TaskTable.name eq name
           }
           rowsDeleted == 1
       }
   }
   ```

   この実装では、`TaskDAO` および `TaskTable` 型のヘルパーメソッドを使用してデータベースとやり取りします。この新しいリポジトリを作成した後の残りの作業は、ルート内でこれを使用するように切り替えることだけです。

</procedure>

### 新しいリポジトリへの切り替え {id="switch-repo"}

外部データベースに切り替えるには、リポジトリの型を変更するだけです。

<procedure id="switch-repo-procedure">

1. <Path>src/main/kotlin</Path> の <Path>DI.kt</Path> ファイルを開きます。
2. `Application.configureDependencyInjection()` 関数内で、`FakeTaskRepository` を `PostgresTaskRepository` に置き換えます。

   ```kotlin
   //...
   import com.example.model.PostgresTaskRepository

   //...

   fun Application.configureDependencyInjection() {
       dependencies {
           provide<TaskRepository> {
               PostgresTaskRepository()
           }
       }
   }
   ```

   インターフェースを介して依存関係を注入しているため、実装の切り替えはルート管理コードに対して透過的です。
3. <p>
       IntelliJ IDEA で再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                      style="inline" height="16" width="16"
                                                      alt="intelliJ IDEA rerun icon"/>) をクリックして、アプリケーションを再起動します。
   </p>
4. [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html) にアクセスします。UI は変わりませんが、データはデータベースから取得されるようになります。
5. これを確認するには、フォームを使用して新しいタスクを追加し、PostgreSQL の tasks テーブルに保持されているデータをクエリします。

   > IntelliJ IDEA では、[クエリコンソール](https://www.jetbrains.com/help/idea/query-consoles.html#create_console)と `SELECT` SQL ステートメントを使用してテーブルデータをクエリできます。
   >
   > ```sql
   > SELECT * FROM task;
   > ```
   >
   > クエリを実行すると、新しいタスクを含め、データが **Service** ペインに表示されるはずです。
   >
   > ![IntelliJ IDEA の Service ペインに表示されるタスクのテーブル](tutorial_server_db_integration_task_table.png){width="706" border-effect="line"}
   >
   {style="tip"}

</procedure>

これで、アプリケーションへのデータベースの統合が正常に完了しました。

`FakeTaskRepository` 型は本番コードでは不要になったため、<Path>src/test</Path> のテストソースセットに移動できます。

最終的なプロジェクト構造は以下のようになります。

![IntelliJ IDEA のプロジェクトビューに表示される src フォルダ](tutorial_server_db_integration_src_folder.png){width="400" border-effect="line"}

## 次のステップ {id="next-steps"}

これで、Ktor RESTful サービスと通信するアプリケーションが完成しました。このサービスはさらに [Exposed](https://github.com/JetBrains/Exposed) で記述されたリポジトリを使用して [PostgreSQL](https://www.postgresql.org/docs/) にアクセスします。また、Web サーバーやデータベースを必要とせずにコア機能を検証する [一連のテスト](#add-automated-tests) も用意されています。

この構造は必要に応じて任意の機能をサポートするように拡張できますが、まずは耐障害性、セキュリティ、スケーラビリティなどの設計の非機能面を考慮することをお勧めします。まずは、[データベース接続設定を抽出する](docker-compose.topic#extract-db-settings) ことで [設定ファイル](server-configuration-file.topic) に移動することから始めるとよいでしょう。