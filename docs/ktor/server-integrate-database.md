[//]: # (title: 将数据库与 Kotlin、Ktor 和 Exposed 集成)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-server-db-integration"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>所用插件</b>：<Links href="server-static-content.md" summary="Learn how to serve static content, such as stylesheets, scripts, images, and so on.">Static Content</Links>、
<Links href="server-serialization.md" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">Content Negotiation</Links>、<Links href="server-status-pages.md" summary="%plugin_name% allows Ktor applications to respond appropriately to any failure state based on a thrown exception or status code.">Status Pages</Links>、
<Links href="server-serialization.md" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">kotlinx.serialization</Links>、
<Links href="server-dependency-injection.md" summary="Required dependencies: io.ktor:ktor-server-di Code example: %example_name%">Dependency Injection</Links>、
<a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-exposed">Exposed</a>、
<a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-postgres">PostgreSQL</a>
</p>
</tldr>

<card-summary>
了解使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。
</card-summary>

<link-summary>
了解使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。
</link-summary>

<web-summary>
了解如何使用 Kotlin 和 Ktor 构建单页应用程序 (SPA)，其中 RESTful 服务连接到数据库仓库。它使用 Exposed SQL 库，并允许你伪造仓库以进行测试。
</web-summary>

在本文中，你将学习如何使用适用于 Kotlin 的 SQL 库 [Exposed](https://www.jetbrains.com/exposed/)，将 Ktor 服务与关系型数据库相集成。

完成本教程后，你将学会如何执行以下操作：

* 创建使用 JSON 序列化的 RESTful 服务。
* 将不同的仓库注入到这些服务中。
* 使用内存仓库为服务创建单元测试。
* 使用 Exposed 和依赖注入 (DI) 构建可用的仓库。
* 部署访问外部数据库的服务。

在先前的教程中，我们使用任务管理器示例介绍了基础知识，例如[处理请求](server-requests-and-responses.topic)、[创建 RESTful API](server-create-restful-apis.topic) 或[使用 Thymeleaf 模板构建 Web 应用](server-create-website.topic)。

虽然这些教程侧重于使用简单的内存版 `TaskRepository` 实现前端功能，但本指南将重点转向展示 Ktor 服务如何通过 Exposed SQL 库与关系型数据库进行交互。

尽管本指南篇幅更长、更复杂，你仍然可以快速生成可运行的代码，并逐步引入新功能。

本指南由两部分组成：

1. [使用内存仓库创建应用程序。](#create-restful-service-and-repository)
2. [将内存仓库替换为使用 PostgreSQL 的仓库。](#add-postgresql-repository)

## 前提条件 {id="prerequisites"}

你可以独立完成本教程，但是，我们建议你先完成[创建 RESTful API](server-create-restful-apis.topic) 教程，以熟悉内容协商和 REST。

我们建议安装 [IntelliJ IDEA](https://www.jetbrains.com/help/idea/installation-guide.html)，但也可以使用你选择的其他 IDE。

## 创建 RESTful 服务和内存仓库 {id="create-restful-service-and-repository"}

首先，你将重新创建任务管理器的 RESTful 服务。起初，你将使用内存仓库，但你会构建一种能以极小代价将其替换的设计结构。

你将分六个阶段完成此操作：

1. [创建初始项目。](#create-project)
2. [添加起始代码。](#add-starter-code)
3. [添加 CRUD 路由。](#add-routes)
4. [添加单页应用程序 (SPA)。](#add-client-page)
5. [手动测试应用程序。](#test-manually)
6. [添加自动化测试。](#add-automated-tests)

### 使用插件创建新项目 {id="create-project"}

要使用 Ktor 项目生成器创建新项目，请按照以下步骤操作：

<procedure id="create-project-procedure">

1. <p>
       访问
       <a href="https://start.ktor.io/">Ktor 项目生成器 (Ktor Project Generator)</a>
       。
   </p>
2. 在 **Project artifact** 字段中，输入 `com.example.ktor-exposed-task-app` 作为项目工件的名称。

   ![在 Ktor 项目生成器中命名项目工件](tutorial_server_db_integration_project_artifact.png){width="706" border-effect="line" style="block"}
3. 在插件部分，通过点击 **Add** 按钮搜索并添加以下插件：
   * Content Negotiation
   * kotlinx.serialization
   * Static Content
   * Status Pages
   * Dependency Injection
   * Exposed
   * PostgreSQL

   ![在 Ktor 项目生成器中添加插件](ktor_project_generator_add_plugins.gif){width="706" border-effect="line" style="block"}
4. 添加插件后，点击插件部分右上角的 **7 plugins** 按钮以查看已添加的插件。

   随后你将看到将添加到项目中的所有插件的列表：
   ![Ktor 项目生成器中的插件下拉列表](tutorial_server_db_integration_plugin_list.png){width="706" border-effect="line" style="block"}
5. <p>
       点击
       <control>Download</control>
       按钮以生成并下载你的 Ktor 项目。
   </p>
6. 在 [IntelliJ IDEA](https://www.jetbrains.com/help/idea/installation-guide.html) 或你选择的其他 IDE 中打开生成的项目。
7. 转到 <Path>src/main/kotlin</Path> 并删除 <Path>CitySchema.kt</Path>、<Path>UsersService.kt</Path>、<Path>GreetingService.kt</Path> 和 <Path>Postgres.kt</Path> 文件。
8. 打开 <Path>Exposed.kt</Path> 文件并移除 `.configureExposed()` 函数的内容：{id="delete-function"}

   ```kotlin
   suspend fun Application.configureExposed() {
   }
   ```

   移除此功能的原因是 Ktor 项目生成器添加了示例代码，用于展示如何将用户和城市的数据持久化到 HSQLDB 或 PostgreSQL。在本教程中不需要该示例代码。
9. 打开 <Path>gradle/libs.versions.toml</Path> 文件并确保指定了最新的 Exposed 版本：

   ```kotlin
   [versions]
   #...
   exposed = %exposed_version%
   ```

</procedure>

### 添加起始代码 {id="add-starter-code"}

<procedure id="add-starter-code-procedure">

1. 转到 <Path>src/main/kotlin</Path> 并创建一个名为 <Path>model</Path> 的子包。
2. 在 <Path>model</Path> 包内，创建一个新的 <Path>Task.kt</Path> 文件。
3. 打开 <Path>Task.kt</Path> 并添加一个表示优先级的枚举以及一个表示任务的类：

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

   `Task` 类使用了来自 [`kotlinx.serialization`](server-serialization.md) 库的 `Serializable` 类型进行注解。

   与先前的教程一样，你将创建一个内存仓库。不过，这次仓库将实现一个接口，以便稍后可以轻松替换它。
4. 在 <Path>model</Path> 子包中，创建一个新的 <Path>TaskRepository.kt</Path> 文件。
5. 打开 <Path>TaskRepository.kt</Path> 并添加以下接口：

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
6. 在同一目录下创建一个新的 <Path>FakeTaskRepository.kt</Path> 文件。
7. 打开 <Path>FakeTaskRepository.kt</Path> 并添加以下类：

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

### 添加路由 {id="add-routes"}

<procedure id="add-routes-procedure">

1. 打开 <Path>src/main/kotlin</Path> 中的 <Path>Serialization.kt</Path> 文件。
2. 将现有的 `Application.configureSerialization()` 函数替换为以下实现：

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

   这与你在[创建 RESTful API](server-create-restful-apis.topic) 教程中实现的路由相同，不同之处在于你现在从 Ktor 的依赖注入容器中解析仓库。由于依赖项的类型是一个接口 (`interface`)，因此可以注入许多不同的实现。

   由于 `dependencies.resolve()` 是一个挂起函数，因此 `.configureSerialization()` 也必须声明为 suspend。

   现在你已为 `.configureSerialization()` 添加了依赖项，现有的调用将无法再编译。幸运的是，该函数只被调用一次。
3. 打开 <Path>src/main/kotlin</Path> 中的 <Path>DI.kt</Path> 文件。
4. 将 `.configureDependencyInjection()` 函数的内容替换为以下实现：

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

   你现在将 `FakeTaskRepository` 注册为 `TaskRepository` 的实现。长期目标是能够将其替换为 `PostgresTaskRepository`。
5. 打开位于 <Path>src/main/resources</Path> 文件夹中的 <Path>application.yaml</Path> 文件，并确保 `.configureDependencyInjection()` 函数列在 `.configureSerialization()` 之前：

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

### 添加客户端页面 {id="add-client-page"}

<procedure id="add-client-page-procedure">

1. 打开 <Path>src/main/resources/static</Path> 中的 <Path>index.html</Path> 文件。
2. 将当前内容替换为以下实现：

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

   这是先前教程中使用的同一个 SPA。因为它是用 JavaScript 编写的，并且只使用浏览器中可用的库，所以你不必担心客户端依赖项。

</procedure>

### 手动测试应用程序 {id="test-manually"}

<procedure id="test-manually-procedure">

1. <p>在 IntelliJ IDEA 中，点击运行按钮
       (<img src="intellij_idea_gutter_icon.svg"
             style="inline" height="16" width="16"
             alt="intelliJ IDEA run icon"/>)
       以启动应用程序。</p>
2. 在浏览器中访问 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。你应该会看到由三个表单和一个显示过滤结果的表格组成的客户端页面。

   ![显示任务管理器客户端的浏览器窗口](tutorial_server_db_integration_index_page.png){width="706" border-effect="rounded"}
3. 通过使用 **Go** 按钮填写并提交表单来测试应用程序。对表格项使用 **View** 和 **Delete** 按钮。

   ![显示任务管理器客户端的浏览器窗口](tutorial_server_db_integration_manual_test.gif){width="706" border-effect="rounded"}

</procedure>

### 添加自动化单元测试 {id="add-automated-tests"}

<procedure id="add-automated-tests-procedure">

1. 打开 <Path>src/test/kotlin</Path> 中的 <Path>ServerTest.kt</Path> 文件并添加以下测试：

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

   为了使这些测试能够编译并运行，你需要为 Ktor Client 添加对 [Content Negotiation](https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html) 插件的依赖项。
2. 打开 <Path>build.gradle.kts</Path> 文件并添加以下依赖项：

   ```kotlin
   dependencies {
       //...
       testImplementation(ktorLibs.client.contentNegotiation)
   }
   ```
3. <p>在 IntelliJ IDEA 中，点击编辑器右侧的 Gradle 通知图标
       (<img alt="intelliJ IDEA gradle icon"
             src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
       以加载 Gradle 更改。</p>
4. <p>在 IntelliJ IDEA 中，点击测试类定义旁边的运行按钮
       (<img src="intellij_idea_gutter_icon.svg"
             style="inline" height="16" width="16"
             alt="intelliJ IDEA run icon"/>)
       以运行测试。</p>

   然后，你应该会在 **Run** 窗格中看到测试已成功运行：

   ![IntelliJ IDEA 的 Run 窗格中显示的成功测试结果](tutorial_server_db_integration_test_results.png){width="706" border-effect="line"}

</procedure>

## 添加 PostgreSQL 仓库 {id="add-postgresql-repository"}

现在你已经有了一个使用内存数据的可用应用程序，下一步是将数据存储外部化到 PostgreSQL 数据库。

你将通过执行以下操作来实现这一点：

1. [在 PostgreSQL 中创建数据库架构。](#create-schema)
2. [改造 `TaskRepository` 以支持异步访问。](#adapt-repo)
3. [在应用程序中配置数据库连接。](#config-db-connection)
4. [将 `Task` 类型映射到关联的数据库表。](#create-mapping)
5. [基于该映射创建新仓库。](#create-new-repo)
6. [在启动代码中切换到新仓库。](#switch-repo)

### 创建数据库架构 {id="create-schema"}

<procedure id="create-schema-procedure">

1. 使用你选择的数据库管理工具，在 PostgreSQL 中创建一个新数据库。名称无关紧要，只要你记住它即可。在此示例中，我们将使用 `ktor_tutorial_db`。

   > 有关 PostgreSQL 的更多信息，请参阅[官方文档](https://www.postgresql.org/docs/current/)。
   >
   > 在 IntelliJ IDEA 中，你可以使用 Database Tools 来[连接并管理你的 PostgreSQL 数据库](https://www.jetbrains.com/help/idea/postgresql.html)。
   >
   {style="tip"}
2. 对数据库运行以下 SQL 命令。这些命令将创建并填充数据库架构：

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

   请注意以下几点：
   * 你正在创建一个名为 `task` 的单独表，其中包含 `name`、`description` 和 `priority` 列。这些列需要映射到 `Task` 类的属性。
   * 如果该表已存在，你将重新创建它，因此你可以重复运行该脚本。
   * 还有一个名为 `id` 的额外列，类型为 `SERIAL`。这将是一个整数值，用作每行的主键。这些值将由数据库代表你分配。

</procedure>

### 改造现有仓库 {id="adapt-repo"}

在对数据库执行查询时，最好异步运行它们，以避免阻塞处理 HTTP 请求的线程。在 Kotlin 中，这最好通过[协程](https://kotlinlang.org/docs/coroutines-overview.html)来管理。

<procedure id="adapt-repo-procedure">

1. 打开 <Path>src/main/kotlin/model</Path> 中的 <Path>TaskRepository.kt</Path> 文件。
2. 为所有接口方法添加 `suspend` 关键字：

   ```kotlin
   interface TaskRepository {
       suspend fun allTasks(): List<Task>
       suspend fun tasksByPriority(priority: Priority): List<Task>
       suspend fun taskByName(name: String): Task?
       suspend fun addTask(task: Task)
       suspend fun removeTask(name: String): Boolean
   }
   ```

   这将允许接口方法的实现将工作任务调度在不同的协程调度器上启动。

   现在你需要调整 `FakeTaskRepository` 的方法以与之匹配，尽管在该实现中不需要切换调度器。
3. 打开 <Path>FakeTaskRepository.kt</Path> 文件并为所有方法添加 `suspend` 关键字：

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

   到目前为止，你还没有引入任何新功能。相反，你已经为创建将对数据库异步运行查询的 `PostgresTaskRepository` 奠定了基础。

</procedure>

### 配置数据库连接 {id="config-db-connection"}

在[本教程的第一部分](#delete-function)中，你删除了 <Path>Exposed.kt</Path> 中 `.configureExposed()` 函数内的示例代码。现在你已准备好添加自己的实现。

Ktor 项目生成器尚未添加对 DAO 类型的支持，因此你首先需要在 Gradle 构建文件中添加相关依赖项。

<procedure id="config-db-connection-procedure">

1. 在你的 <Path>gradle/libs.versions.toml</Path> 文件中，添加 `exposed-jdbc` 和 `exposed-dao` 库：

   ```toml
   [libraries]
   exposed-jdbc = { module = "org.jetbrains.exposed:exposed-jdbc", version.ref = "exposed" }
   exposed-dao = { module = "org.jetbrains.exposed:exposed-dao", version.ref = "exposed" }
   ```

   这将允许你使用 Exposed 数据访问对象 (DAO) 模式。
2. 在你的 <Path>build.gradle.kts</Path> 文件中，添加以下依赖项：

   ```kotlin
   dependencies {
       // ...
       implementation(libs.exposed.jdbc)
       implementation(libs.exposed.dao)
   }
   ```
   > 你只需要一个传输模块 – `exposed-jdbc` 或 `exposed-r2dbc`。如果 Ktor 项目生成器添加了 `exposed-r2dbc` 依赖项，请在继续之前将其移除。
   >
   {style="note"}
3. <p>在 IntelliJ IDEA 中，点击编辑器右侧的 Gradle 通知图标
       (<img alt="intelliJ IDEA gradle icon"
             src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
       以加载 Gradle 更改。</p>
4. 打开 <Path>src/main/kotlin</Path> 中的 <Path>Exposed.kt</Path> 文件。
5. 使用 `Database.connect()` 函数连接到你的数据库，根据你的环境调整设置的值：

   ```kotlin
   suspend fun Application.configureExposed() {
       Database.connect(
           "jdbc:postgresql://localhost:5432/ktor_tutorial_db",
           user = "postgres",
           password = "password"
       )
   }
   ```

   请注意，`url` 包含以下组件：
   * `localhost:5432` 是 PostgreSQL 数据库运行所在的主机和端口。
   * `ktor_tutorial_db` 是运行服务时创建的数据库的名称。

   > 有关更多信息，请参阅 [Exposed 中的数据库操作](https://www.jetbrains.com/help/exposed/working-with-database.html)。
   >
   {style="tip"}

</procedure>

### 创建对象/关系映射 {id="create-mapping"}

<procedure id="create-mapping-procedure">

1. 转到 <Path>src/main/kotlin</Path> 并创建一个名为 <Path>db</Path> 的新包。
2. 在 <Path>db</Path> 包内，创建一个新的 <Path>mapping.kt</Path> 文件。
3. 打开 <Path>mapping.kt</Path> 并添加 `TaskTable` 和 `TaskDAO` 类型：

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

   这些类型使用 Exposed 库将 `Task` 类型中的属性映射到数据库中 `task` 表的列。`TaskTable` 类型定义了基本映射，而 `TaskDAO` 类型添加了创建、查找、更新和删除任务的帮助程序方法。
4. 在同一个 <Path>mapping.kt</Path> 文件中，添加以下帮助程序函数：

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

   * `withTransaction()` 函数在新的顶级数据库事务中运行挂起代码块。协程上下文被切换到 `Dispatchers.IO`，以便阻塞式 JDBC 操作在针对 IO 任务优化的线程池上运行。
   * `daoToModel()` 函数将 `TaskDAO` 类型的实例转换为 `Task` 对象。
5. 添加以下缺失的导入：

   ```kotlin
   import com.example.model.Priority
   import com.example.model.Task
   import kotlinx.coroutines.Dispatchers
   import kotlinx.coroutines.withContext
   import org.jetbrains.exposed.v1.jdbc.JdbcTransaction
   import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction
   ```

</procedure>

### 编写新仓库 {id="create-new-repo"}

你现在拥有创建特定于数据库的仓库所需的所有资源。

<procedure id="create-new-repo-procedure">

1. 转到 <Path>src/main/kotlin/model</Path> 并创建一个新的 <Path>PostgresTaskRepository.kt</Path> 文件。
2. 打开 <Path>PostgresTaskRepository.kt</Path> 文件并使用以下实现创建一个新类型：

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

   在此实现中，你使用 `TaskDAO` 和 `TaskTable` 类型的帮助程序方法与数据库进行交互。创建此新仓库后，剩下的唯一任务就是在路由中切换为使用它。

</procedure>

### 切换到新仓库 {id="switch-repo"}

要切换到外部数据库，只需更改仓库类型。

<procedure id="switch-repo-procedure">

1. 打开 <Path>src/main/kotlin</Path> 中的 <Path>DI.kt</Path> 文件。
2. 在 `Application.configureDependencyInjection()` 函数中，将 `FakeTaskRepository` 替换为 `PostgresTaskRepository`：

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

   因为你通过接口注入依赖项，所以实现的切换对于管理路由的代码是透明的。
3. <p>
       在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                      style="inline" height="16" width="16"
                                                      alt="intelliJ IDEA rerun icon"/>) 以重启应用程序。
   </p>
4. 导航到 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。UI 保持不变，但现在从数据库中获取数据。
5. 要验证这一点，请使用表单添加新任务，并查询 PostgreSQL 中 tasks 表中保存的数据。

   > 在 IntelliJ IDEA 中，可以使用[查询控制台](https://www.jetbrains.com/help/idea/query-consoles.html#create_console)和 `SELECT` SQL 语句来查询表格数据：
   >
   > ```sql
   > SELECT * FROM task;
   > ```
   >
   > 查询后，数据应显示在 **Service** 窗格中，包括新任务：
   >
   > ![IntelliJ IDEA 的 Service 窗格中显示的任务表](tutorial_server_db_integration_task_table.png){width="706" border-effect="line"}
   >
   {style="tip"}

</procedure>

至此，你已成功将数据库集成到应用程序中。

由于生产代码中不再需要 `FakeTaskRepository` 类型，因此可以将其移动到 <Path>src/test</Path> 中的测试源集中。

最终的项目结构应类似于：

![IntelliJ IDEA 项目视图中显示的 src 文件夹](tutorial_server_db_integration_src_folder.png){width="400" border-effect="line"}

## 后续步骤 {id="next-steps"}

现在，你拥有了一个与 Ktor RESTful 服务通信的应用程序。该服务反过来使用通过 [Exposed](https://github.com/JetBrains/Exposed) 编写的仓库来访问 [PostgreSQL](https://www.postgresql.org/docs/)。你还拥有[一套测试套件](#add-automated-tests)，可在不需要 Web 服务器或数据库的情况下验证核心功能。

可以根据需要扩展此结构以支持任意功能，但是，你可能希望先考虑设计的非功能性方面，例如容错性、安全性和可扩展性。你可以首先[将数据库连接设置提取](docker-compose.topic#extract-db-settings)到[配置文件](server-configuration-file.topic)。