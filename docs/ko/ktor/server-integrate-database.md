[//]: # (title: Kotlin, Ktor 및 Exposed를 사용한 데이터베이스 연동)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-server-db-integration"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>사용된 플러그인</b>: <Links href="server-static-content.md" summary="스타일시트, 스크립트, 이미지 등 정적 콘텐츠를 제공하는 방법을 알아봅니다.">Static Content</Links>,
<Links href="server-serialization.md" summary="ContentNegotiation 플러그인은 두 가지 주요 목적을 가집니다. 클라이언트와 서버 간의 미디어 타입을 협상하고, 특정 형식으로 콘텐츠를 직렬화/역직렬화합니다.">Content Negotiation</Links>, <Links href="server-status-pages.md" summary="%plugin_name% 플러그인을 사용하면 Ktor 애플리케이션이 발생한 예외나 상태 코드를 기반으로 모든 실패 상태에 적절히 응답할 수 있습니다.">Status Pages</Links>,
<Links href="server-serialization.md" summary="ContentNegotiation 플러그인은 두 가지 주요 목적을 가집니다. 클라이언트와 서버 간의 미디어 타입을 협상하고, 특정 형식으로 콘텐츠를 직렬화/역직렬화합니다.">kotlinx.serialization</Links>,
<Links href="server-dependency-injection.md" summary="필수 의존성: io.ktor:ktor-server-di 코드 예제: %example_name%">Dependency Injection</Links>,
<a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-exposed">Exposed</a>,
<a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-postgres">PostgreSQL</a>
</p>
</tldr>

<card-summary>
Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 프로세스를 알아봅니다.
</card-summary>

<link-summary>
Exposed SQL 라이브러리를 사용하여 Ktor 서비스를 데이터베이스 리포지토리에 연결하는 프로세스를 알아봅니다.
</link-summary>

<web-summary>
Kotlin과 Ktor를 사용하여 RESTful 서비스가 데이터베이스 리포지토리에 연결되는 단일 페이지 애플리케이션(SPA)을 구축하는 방법을 알아봅니다. Exposed SQL 라이브러리를 사용하며 테스트를 위해 가짜(fake) 리포지토리를 만들 수 있습니다.
</web-summary>

이 글에서는 Kotlin용 SQL 라이브러리인 [Exposed](https://www.jetbrains.com/exposed/)를 사용하여 Ktor 서비스를 관계형 데이터베이스와 연동하는 방법을 배웁니다.

이 튜토리얼을 마치면 다음 작업을 수행하는 방법을 배울 수 있습니다.

* JSON 직렬화를 사용하는 RESTful 서비스 생성
* 이러한 서비스에 다양한 리포지토리 주입(Inject)
* 인메모리(in-memory) 리포지토리를 사용한 서비스 단위 테스트 작성
* Exposed 및 의존성 주입(DI)을 사용한 작동 가능한 리포지토리 구축
* 외부 데이터베이스에 접근하는 서비스 배포

이전 튜토리얼에서는 작업 관리자 예제를 통해 [요청 처리](server-requests-and-responses.topic), [RESTful API 생성](server-create-restful-apis.topic), [Thymeleaf 템플릿으로 웹 앱 구축](server-create-website.topic)과 같은 기본 사항을 다루었습니다.

이전 튜토리얼들이 단순한 인메모리 `TaskRepository`를 사용하는 프론트엔드 기능에 중점을 두었다면, 이번 가이드에서는 Ktor 서비스가 Exposed SQL 라이브러리를 통해 관계형 데이터베이스와 상호작용하는 방법을 보여주는 것으로 초점을 전환합니다.

이번 가이드는 더 길고 복잡하지만, 빠르게 작동하는 코드를 만들고 점진적으로 새로운 기능을 도입해 나갈 수 있습니다.

이 가이드는 두 부분으로 구성됩니다.

1. [인메모리 리포지토리로 애플리케이션 생성](#create-restful-service-and-repository)
2. [인메모리 리포지토리를 PostgreSQL을 사용하는 리포지토리로 교체](#add-postgresql-repository)

## 사전 준비 사항 {id="prerequisites"}

이 튜토리얼은 독립적으로 진행할 수 있지만, 콘텐츠 협상(Content Negotiation) 및 REST에 익숙해지기 위해 [RESTful API 생성](server-create-restful-apis.topic) 튜토리얼을 먼저 완료하는 것을 권장합니다.

[IntelliJ IDEA](https://www.jetbrains.com/help/idea/installation-guide.html) 설치를 권장하지만, 원하는 다른 IDE를 사용할 수도 있습니다.

## RESTful 서비스 및 인메모리 리포지토리 생성 {id="create-restful-service-and-repository"}

먼저 작업 관리자의 RESTful 서비스를 다시 생성합니다. 초기에는 인메모리 리포지토리를 사용하지만, 최소한의 노력으로 교체할 수 있도록 구조를 설계합니다.

이 작업은 다음 6단계로 진행됩니다.

1. [초기 프로젝트 생성](#create-project)
2. [스타터 코드 추가](#add-starter-code)
3. [CRUD 라우트 추가](#add-routes)
4. [단일 페이지 애플리케이션(SPA) 추가](#add-client-page)
5. [애플리케이션 수동 테스트](#test-manually)
6. [자동화된 테스트 추가](#add-automated-tests)

### 플러그인을 포함한 새 프로젝트 생성 {id="create-project"}

Ktor Project Generator로 새 프로젝트를 생성하려면 다음 단계를 따르세요.

<procedure id="create-project-procedure">

1. <p>
       <a href="https://start.ktor.io/">Ktor Project Generator</a>로 이동합니다.
   </p>
2. **Project artifact** 필드에 프로젝트 아티팩트 이름으로 `com.example.ktor-exposed-task-app`을 입력합니다.

   ![Ktor Project Generator에서 프로젝트 아티팩트 이름 지정](tutorial_server_db_integration_project_artifact.png){width="706" border-effect="line" style="block"}
3. 플러그인 섹션에서 **Add** 버튼을 클릭하여 다음 플러그인을 검색하고 추가합니다.
   * Content Negotiation
   * kotlinx.serialization
   * Static Content
   * Status Pages
   * Dependency Injection
   * Exposed
   * PostgreSQL

   ![Ktor Project Generator에서 플러그인 추가](ktor_project_generator_add_plugins.gif){width="706" border-effect="line" style="block"}
4. 플러그인을 추가한 후 플러그인 섹션 오른쪽 상단의 **7 plugins** 버튼을 클릭하여 추가된 플러그인을 확인합니다.

   프로젝트에 추가될 모든 플러그인 목록이 표시됩니다.
   ![Ktor Project Generator의 플러그인 드롭다운](tutorial_server_db_integration_plugin_list.png){width="706" border-effect="line" style="block"}
5. <p>
       <control>Download</control> 버튼을 클릭하여 Ktor 프로젝트를 생성하고 다운로드합니다.
   </p>
6. 다운로드한 프로젝트를 [IntelliJ IDEA](https://www.jetbrains.com/help/idea/installation-guide.html) 또는 원하는 다른 IDE에서 엽니다.
7. <Path>src/main/kotlin</Path>으로 이동하여 <Path>CitySchema.kt</Path>, <Path>UsersService.kt</Path>, <Path>GreetingService.kt</Path>, <Path>Postgres.kt</Path> 파일을 삭제합니다.
8. <Path>Exposed.kt</Path> 파일을 열고 `.configureExposed()` 함수의 내용을 제거합니다. {id="delete-function"}

   ```kotlin
   suspend fun Application.configureExposed() {
   }
   ```

   이 기능을 제거하는 이유는 Ktor Project Generator가 사용자 및 도시 관련 데이터를 HSQLDB 또는 PostgreSQL에 유지하는 방법을 보여주는 샘플 코드를 추가했기 때문입니다. 이 튜토리얼에서는 해당 샘플 코드가 필요하지 않습니다.
9. <Path>gradle/libs.versions.toml</Path> 파일을 열고 최신 Exposed 버전이 지정되어 있는지 확인합니다.

   ```kotlin
   [versions]
   #...
   exposed = %exposed_version%
   ```

</procedure>

### 스타터 코드 추가 {id="add-starter-code"}

<procedure id="add-starter-code-procedure">

1. <Path>src/main/kotlin</Path>으로 이동하여 <Path>model</Path>이라는 하위 패키지를 생성합니다.
2. <Path>model</Path> 패키지 안에 새 <Path>Task.kt</Path> 파일을 생성합니다.
3. <Path>Task.kt</Path>를 열고 우선순위를 나타내는 enum과 작업을 나타내는 클래스를 추가합니다.

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

   `Task` 클래스는 [`kotlinx.serialization`](server-serialization.md) 라이브러리의 `Serializable` 타입으로 어노테이션이 지정되어 있습니다.

   이전 튜토리얼과 마찬가지로 인메모리 리포지토리를 생성합니다. 하지만 이번에는 나중에 쉽게 교체할 수 있도록 인터페이스를 구현하는 방식으로 리포지토리를 작성합니다.
4. <Path>model</Path> 하위 패키지에 새 <Path>TaskRepository.kt</Path> 파일을 생성합니다.
5. <Path>TaskRepository.kt</Path>를 열고 다음 인터페이스를 추가합니다.

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
6. 동일한 디렉터리 안에 새 <Path>FakeTaskRepository.kt</Path> 파일을 생성합니다.
7. <Path>FakeTaskRepository.kt</Path>를 열고 다음 클래스를 추가합니다.

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

### 라우트 추가 {id="add-routes"}

<procedure id="add-routes-procedure">

1. <Path>src/main/kotlin</Path>에 있는 <Path>Serialization.kt</Path> 파일을 엽니다.
2. 기존의 `Application.configureSerialization()` 함수를 아래 구현으로 교체합니다.

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

   이는 [RESTful API 생성](server-create-restful-apis.topic) 튜토리얼에서 구현한 것과 동일한 라우팅이지만, 이제 Ktor의 의존성 주입 컨테이너에서 리포지토리를 확인(resolve)한다는 점이 다릅니다. 의존성의 타입이 `interface`이므로 다양한 구현체를 주입할 수 있습니다.

   `dependencies.resolve()`가 suspend 함수이므로 `.configureSerialization()`도 suspend로 선언되어야 합니다.

   이제 `.configureSerialization()`에 의존성을 추가했으므로 기존 호출 코드는 컴파일되지 않습니다. 다행히 이 함수는 한 번만 호출됩니다.
3. <Path>src/main/kotlin</Path> 내의 <Path>DI.kt</Path> 파일을 엽니다.
4. `.configureDependencyInjection()` 함수의 내용을 아래 구현으로 교체합니다.

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

   이제 `TaskRepository`의 구현체로 `FakeTaskRepository`를 등록했습니다.
   궁극적인 목표는 이를 `PostgresTaskRepository`로 교체할 수 있도록 하는 것입니다.
5. <Path>src/main/resources</Path> 폴더에 있는 <Path>application.yaml</Path> 파일을 열고, `.configureDependencyInjection()` 함수가 `.configureSerialization()`보다 먼저 나열되어 있는지 확인합니다.

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

### 클라이언트 페이지 추가 {id="add-client-page"}

<procedure id="add-client-page-procedure">

1. <Path>src/main/resources/static</Path>에 있는 <Path>index.html</Path> 파일을 엽니다.
2. 현재 내용을 아래 구현으로 교체합니다.

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

   이 SPA는 이전 튜토리얼에서 사용된 것과 동일합니다. JavaScript로 작성되었으며 브라우저 내에서 사용 가능한 라이브러리만 사용하므로 클라이언트 측 의존성에 대해 걱정할 필요가 없습니다.

</procedure>

### 애플리케이션 수동 테스트 {id="test-manually"}

<procedure id="test-manually-procedure">

1. <p>IntelliJ IDEA에서 실행 버튼(<img src="intellij_idea_gutter_icon.svg"
             style="inline" height="16" width="16"
             alt="intelliJ IDEA run icon"/>)을 클릭하여 애플리케이션을 시작합니다.</p>
2. 브라우저에서 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)로 이동합니다. 3개의 폼과 필터링된 결과를 표시하는 테이블로 구성된 클라이언트 페이지가 표시됩니다.

   ![Task Manager Client를 표시하는 브라우저 창](tutorial_server_db_integration_index_page.png){width="706" border-effect="rounded"}
3. **Go** 버튼을 사용하여 폼을 작성하고 전송해 애플리케이션을 테스트합니다. 테이블 항목의 **view** 및 **delete** 링크도 사용해 보세요.

   ![Task Manager Client를 보여주는 브라우저 창](tutorial_server_db_integration_manual_test.gif){width="706" border-effect="rounded"}

</procedure>

### 자동화된 단위 테스트 추가 {id="add-automated-tests"}

<procedure id="add-automated-tests-procedure">

1. <Path>src/test/kotlin</Path>에 있는 <Path>ServerTest.kt</Path> 파일을 열고 다음 테스트를 추가합니다.

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

   이 테스트들이 컴파일되고 실행되려면 Ktor Client용 [Content Negotiation](https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html) 플러그인에 대한 의존성을 추가해야 합니다.
2. <Path>build.gradle.kts</Path> 파일을 열고 다음 의존성을 추가합니다.

   ```kotlin
   dependencies {
       //...
       testImplementation(ktorLibs.client.contentNegotiation)
   }
   ```
3. <p>IntelliJ IDEA에서 편집기 오른쪽에 있는 Gradle 알림 아이콘(<img alt="intelliJ IDEA gradle icon"
             src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)을 클릭하여 Gradle 변경 사항을 로드합니다.</p>
4. <p>IntelliJ IDEA에서 테스트 클래스 정의 옆에 있는 실행 버튼(<img src="intellij_idea_gutter_icon.svg"
             style="inline" height="16" width="16"
             alt="intelliJ IDEA run icon"/>)을 클릭하여 테스트를 실행합니다.</p>

   그러면 **Run** 창에서 테스트가 성공적으로 실행되었음을 확인할 수 있습니다.

   ![IntelliJ IDEA의 Run 창에 표시된 성공적인 테스트 결과](tutorial_server_db_integration_test_results.png){width="706" border-effect="line"}

</procedure>

## PostgreSQL 리포지토리 추가 {id="add-postgresql-repository"}

인메모리 데이터를 사용하는 정상 작동하는 애플리케이션을 만들었으므로, 다음 단계는 데이터 저장을 PostgreSQL 데이터베이스로 외부화하는 것입니다.

다음 작업을 통해 이를 수행합니다.

1. [PostgreSQL 내에 데이터베이스 스키마 생성](#create-schema)
2. [비동기 접근을 위해 `TaskRepository` 수정](#adapt-repo)
3. [애플리케이션 내에 데이터베이스 연결 구성](#config-db-connection)
4. [`Task` 타입을 연결된 데이터베이스 테이블에 매핑](#create-mapping)
5. [매핑을 기반으로 새 리포지토리 생성](#create-new-repo)
6. [시작 코드에서 새 리포지토리로 전환](#switch-repo)

### 데이터베이스 스키마 생성 {id="create-schema"}

<procedure id="create-schema-procedure">

1. 원하는 데이터베이스 관리 도구를 사용하여 PostgreSQL 내에 새 데이터베이스를 생성합니다.
   이름은 기억할 수만 있다면 무엇이든 상관없습니다. 이 예제에서는 `ktor_tutorial_db`를 사용합니다.

   > PostgreSQL에 대한 자세한 내용은 [공식 문서](https://www.postgresql.org/docs/current/)를 참조하세요.
   >
   > IntelliJ IDEA에서는 Database Tools를 사용하여 [PostgreSQL 데이터베이스에 연결하고 관리](https://www.jetbrains.com/help/idea/postgresql.html)할 수 있습니다.
   >
   {style="tip"}
2. 데이터베이스에 대해 아래의 SQL 명령을 실행합니다. 이 명령은 데이터베이스 스키마를 생성하고 데이터를 채웁니다.

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

   다음을 참고하세요.
   * `name`, `description`, `priority` 컬럼이 있는 `task`라는 단일 테이블을 생성합니다. 이는 `Task` 클래스의 프로퍼티에 매핑되어야 합니다.
   * 테이블이 이미 존재하는 경우 다시 생성하므로 스크립트를 반복해서 실행할 수 있습니다.
   * `SERIAL` 타입인 `id`라는 추가 컬럼이 있습니다. 이 정수 값은 각 행의 기본 키(Primary Key)로 사용되며, 데이터베이스가 자동으로 값을 할당합니다.

</procedure>

### 기존 리포지토리 수정 {id="adapt-repo"}

데이터베이스에 대해 쿼리를 실행할 때는 HTTP 요청을 처리하는 스레드가 차단되지 않도록 비동기적으로 실행하는 것이 좋습니다. Kotlin에서는 [코루틴(coroutines)](https://kotlinlang.org/docs/coroutines-overview.html)을 통해 이를 가장 효과적으로 관리할 수 있습니다.

<procedure id="adapt-repo-procedure">

1. <Path>src/main/kotlin/model</Path>에 있는 <Path>TaskRepository.kt</Path> 파일을 엽니다.
2. 모든 인터페이스 메서드에 `suspend` 키워드를 추가합니다.

   ```kotlin
   interface TaskRepository {
       suspend fun allTasks(): List<Task>
       suspend fun tasksByPriority(priority: Priority): List<Task>
       suspend fun taskByName(name: String): Task?
       suspend fun addTask(task: Task)
       suspend fun removeTask(name: String): Boolean
   }
   ```

   이렇게 하면 인터페이스 메서드의 구현체가 다른 코루틴 디스패처(coroutine dispatcher)에서 작업을 시작할 수 있습니다.

   이제 `FakeTaskRepository`의 메서드도 이에 맞게 조정해야 합니다. 다만 해당 구현체에서는 디스패처를 전환할 필요가 없습니다.
3. <Path>FakeTaskRepository.kt</Path> 파일을 열고 모든 메서드에 `suspend` 키워드를 추가합니다.

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

   여기까지는 새로운 기능을 추가하지 않았습니다. 대신 데이터베이스에 대해 비동기적으로 쿼리를 실행할 `PostgresTaskRepository`를 생성하기 위한 기반을 마련했습니다.

</procedure>

### 데이터베이스 연결 구성 {id="config-db-connection"}

[이 튜토리얼의 첫 번째 부분](#delete-function)에서 <Path>Exposed.kt</Path>에 있던 `.configureExposed()` 함수의 샘플 코드를 삭제했습니다. 이제 직접 구현을 추가할 준비가 되었습니다.

DAO 타입에 대한 지원은 Ktor Project Generator에 의해 추가되지 않았으므로, 먼저 Gradle 빌드 파일에 관련 의존성을 추가해야 합니다.

<procedure id="config-db-connection-procedure">

1. <Path>gradle/libs.versions.toml</Path> 파일에 `exposed-jdbc` 및 `exposed-dao` 라이브러리를 추가합니다.

   ```toml
   [libraries]
   exposed-jdbc = { module = "org.jetbrains.exposed:exposed-jdbc", version.ref = "exposed" }
   exposed-dao = { module = "org.jetbrains.exposed:exposed-dao", version.ref = "exposed" }
   ```

   이렇게 하면 Exposed DAO(Data Access Object) 패턴을 사용할 수 있습니다.
2. <Path>build.gradle.kts</Path> 파일에 다음 의존성을 추가합니다.

   ```kotlin
   dependencies {
       // ...
       implementation(libs.exposed.jdbc)
       implementation(libs.exposed.dao)
   }
   ```
   > 전송 모듈은 `exposed-jdbc` 또는 `exposed-r2dbc` 중 하나만 필요합니다. Ktor Project Generator에 의해 `exposed-r2dbc` 의존성이 추가되었다면 계속 진행하기 전에 제거하세요.
   >
   {style="note"}
3. <p>IntelliJ IDEA에서 편집기 오른쪽에 있는 Gradle 알림 아이콘(<img alt="intelliJ IDEA gradle icon"
             src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)을 클릭하여 Gradle 변경 사항을 로드합니다.</p>
4. <Path>src/main/kotlin</Path>에 있는 <Path>Exposed.kt</Path> 파일을 엽니다.
5. `Database.connect()` 함수를 사용하여 데이터베이스에 연결하고, 환경에 맞게 설정 값을 조정합니다.

   ```kotlin
   suspend fun Application.configureExposed() {
       Database.connect(
           "jdbc:postgresql://localhost:5432/ktor_tutorial_db",
           user = "postgres",
           password = "password"
       )
   }
   ```

   `url`에는 다음 구성 요소가 포함되어 있습니다.
   * `localhost:5432`는 PostgreSQL 데이터베이스가 실행 중인 호스트와 포트입니다.
   * `ktor_tutorial_db`는 서비스를 실행할 때 생성된 데이터베이스의 이름입니다.

   > 자세한 내용은 [Exposed에서 데이터베이스 작업](https://www.jetbrains.com/help/exposed/working-with-database.html)을 참조하세요.
   >
   {style="tip"}

</procedure>

### 객체/관계형 매핑(ORM) 생성 {id="create-mapping"}

<procedure id="create-mapping-procedure">

1. <Path>src/main/kotlin</Path>으로 이동하여 <Path>db</Path>라는 새 패키지를 생성합니다.
2. <Path>db</Path> 패키지 안에 새 <Path>mapping.kt</Path> 파일을 생성합니다.
3. <Path>mapping.kt</Path>를 열고 `TaskTable` 및 `TaskDAO` 타입을 추가합니다.

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

   이 타입들은 Exposed 라이브러리를 사용하여 `Task` 타입의 프로퍼티를 데이터베이스의 `task` 테이블 컬럼에 매핑합니다. `TaskTable` 타입은 기본 매핑을 정의하고, `TaskDAO` 타입은 작업을 생성, 검색, 업데이트 및 삭제하는 헬퍼 메서드를 추가합니다.
4. 동일한 <Path>mapping.kt</Path> 파일에 다음 헬퍼 함수를 추가합니다.

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

   * `withTransaction()` 함수는 새로운 최상위(top-level) 데이터베이스 트랜잭션 내에서 중단(suspending) 블록을 실행합니다. 코루틴 컨텍스트가 `Dispatchers.IO`로 전환되어 블로킹 JDBC 작업이 IO 작업에 최적화된 스레드 풀에서 실행됩니다.
   * `daoToModel()` 함수는 `TaskDAO` 타입의 인스턴스를 `Task` 객체로 변환합니다.
5. 누락된 다음 import 문을 추가합니다.

   ```kotlin
   import com.example.model.Priority
   import com.example.model.Task
   import kotlinx.coroutines.Dispatchers
   import kotlinx.coroutines.withContext
   import org.jetbrains.exposed.v1.jdbc.JdbcTransaction
   import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction
   ```

</procedure>

### 새 리포지토리 작성 {id="create-new-repo"}

이제 데이터베이스 전용 리포지토리를 생성하는 데 필요한 모든 리소스를 갖추었습니다.

<procedure id="create-new-repo-procedure">

1. <Path>src/main/kotlin/model</Path>로 이동하여 새 <Path>PostgresTaskRepository.kt</Path> 파일을 생성합니다.
2. <Path>PostgresTaskRepository.kt</Path> 파일을 열고 다음 구현으로 새 타입을 생성합니다.

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

   이 구현에서는 `TaskDAO` 및 `TaskTable` 타입의 헬퍼 메서드를 사용하여 데이터베이스와 상호작용합니다. 이 새 리포지토리를 생성했으므로, 이제 라우트에서 이를 사용하도록 전환하기만 하면 됩니다.

</procedure>

### 새 리포지토리로 전환 {id="switch-repo"}

외부 데이터베이스로 전환하려면 리포지토리 타입만 변경하면 됩니다.

<procedure id="switch-repo-procedure">

1. <Path>src/main/kotlin</Path>에 있는 <Path>DI.kt</Path> 파일을 엽니다.
2. `Application.configureDependencyInjection()` 함수에서 `FakeTaskRepository`를 `PostgresTaskRepository`로 교체합니다.

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

   인터페이스를 통해 의존성을 주입하고 있으므로, 구현체의 변경은 라우트를 관리하는 코드에 영향을 미치지 않고 투명하게(transparent) 적용됩니다.
3. <p>
       IntelliJ IDEA에서 재실행 버튼(<img src="intellij_idea_rerun_icon.svg"
                                                      style="inline" height="16" width="16"
                                                      alt="intelliJ IDEA rerun icon"/>)을 클릭하여 애플리케이션을 다시 시작합니다.
   </p>
4. [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)로 이동합니다. UI는 그대로 유지되지만, 이제 데이터베이스에서 데이터를 가져옵니다.
5. 이를 확인하려면 폼을 사용하여 새 작업을 추가하고 PostgreSQL의 tasks 테이블에 저장된 데이터를 쿼리해 보세요.

   > IntelliJ IDEA에서는 [쿼리 콘솔(Query console)](https://www.jetbrains.com/help/idea/query-consoles.html#create_console)과 `SELECT` SQL 문을 사용하여 테이블 데이터를 조회할 수 있습니다.
   >
   > ```sql
   > SELECT * FROM task;
   > ```
   >
   > 쿼리를 실행하면 새 작업을 포함한 데이터가 **Service** 창에 표시됩니다.
   >
   > ![IntelliJ IDEA의 Service 창에 표시된 작업 테이블](tutorial_server_db_integration_task_table.png){width="706" border-effect="line"}
   >
   {style="tip"}

</procedure>

이것으로 애플리케이션에 데이터베이스를 성공적으로 연동했습니다.

`FakeTaskRepository` 타입은 더 이상 프로덕션 코드에서 필요하지 않으므로 <Path>src/test</Path>의 테스트 소스 세트로 이동할 수 있습니다.

최종 프로젝트 구조는 다음과 같습니다.

![IntelliJ IDEA의 Project 뷰에 표시된 src 폴더](tutorial_server_db_integration_src_folder.png){width="400" border-effect="line"}

## 다음 단계 {id="next-steps"}

이제 Ktor RESTful 서비스와 통신하는 애플리케이션이 완성되었습니다. 이 서비스는 [Exposed](https://github.com/JetBrains/Exposed)로 작성된 리포지토리를 사용하여 [PostgreSQL](https://www.postgresql.org/docs/)에 접근합니다. 또한 웹 서버나 데이터베이스 없이도 핵심 기능을 검증하는 [테스트 스위트](#add-automated-tests)도 갖추고 있습니다.

이 구조는 필요한 기능을 추가하여 확장할 수 있지만, 먼저 내결함성(fault-tolerance), 보안, 확장성과 같은 비기능적 설계 요소를 고려해 볼 수 있습니다. 우선 [데이터베이스 연결 설정을 추출](docker-compose.topic#extract-db-settings)하여 [구성 파일](server-configuration-file.topic)로 옮기는 작업부터 시작해 보세요.