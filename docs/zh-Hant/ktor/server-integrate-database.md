<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin、Ktor 和 Exposed 整合資料庫" id="server-integrate-database">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-db-integration"/>
        <p>
            <b>程式碼範例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的外掛程式</b>: <Links href="/ktor/server-static-content" summary="Learn how to serve static content, such as stylesheets, scripts, images, and so on.">Static Content</Links>,
            <Links href="/ktor/server-serialization" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">Content Negotiation</Links>, <Links href="/ktor/server-status-pages" summary="%plugin_name% allows Ktor applications to respond appropriately to any failure state based on a thrown exception or status code.">Status pages</Links>,
            <Links href="/ktor/server-serialization" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format.">kotlinx.serialization</Links>,
            <Links href="/ktor/server-dependency-injection" summary="Required dependencies: io.ktor:ktor-server-di Code example: %example_name%">Dependency Injection</Links>
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-exposed">Exposed</a>,
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-postgres">PostgreSQL</a>
        </p>
    </tldr>
    <card-summary>
        了解使用 Exposed SQL 程式庫將 Ktor 服務連接至資料庫儲存機制的程序。
    </card-summary>
    <link-summary>
        了解使用 Exposed SQL 程式庫將 Ktor 服務連接至資料庫儲存機制的程序。
    </link-summary>
    <web-summary>
        了解如何使用 Kotlin 和 Ktor 建置單頁應用程式 (SPA)，其中 RESTful 服務連接至資料庫儲存機制。它使用 Exposed SQL 程式庫，並允許你偽造儲存機制以進行測試。
    </web-summary>
    <p>
        在本文中，你將學習如何使用 Kotlin 的 SQL 程式庫 <a
            href="https://www.jetbrains.com/exposed/">Exposed</a>，將你的 Ktor 服務與關聯式資料庫進行整合。
    </p>
    <p>完成本教學後，你將學會以下內容：</p>
    <list>
        <li>建立使用 JSON 序列化的 RESTful 服務。</li>
        <li>將不同的儲存機制注入至這些服務中。</li>
        <li>使用記憶體內部儲存機制為你的服務建立單元測試。</li>
        <li>使用 Exposed 和相依注入 (DI) 建置可運作的儲存機制。</li>
        <li>部署存取外部資料庫的服務。</li>
    </list>
    <p>
        在先前的教學中，我們使用了任務管理器範例來介紹基礎知識，例如<Links href="/ktor/server-requests-and-responses" summary="Learn the basics of routing, handling requests, and parameters in Kotlin with Ktor by
        building a task manager application.">處理請求</Links>、
        <Links href="/ktor/server-create-restful-apis" summary="Learn how to build a backend service using Kotlin and Ktor, featuring an example of a
        RESTful API that generates JSON files.">建立 RESTful API</Links>，或
        <Links href="/ktor/server-create-website" summary="Learn how to build a website in Kotlin with Ktor and Thymeleaf templates.">使用 Thymeleaf 範本建置 Web 應用程式</Links>。
    </p>
    <p>
        雖然這些教學著重於使用簡單記憶體內部 <code>TaskRepository</code> 的前端功能，但本指南將重點轉移到展示你的 Ktor 服務如何透過 Exposed SQL 程式庫與關聯式資料庫互動。
    </p>
    <p>
        即使這份指南篇幅較長且更為複雜，你仍然能夠快速產出可運行的程式碼，並逐步引入新功能。
    </p>
    <p>本指南包含兩個部分：</p>
    <list type="decimal">
        <li>
            <a href="#create-restful-service-and-repository">使用記憶體內部儲存機制建立應用程式。</a>
        </li>
        <li>
            <a href="#add-postgresql-repository">將記憶體內部儲存機制替換為使用 PostgreSQL 的儲存機制。</a>
        </li>
    </list>
    <chapter title="先決條件" id="prerequisites">
        <p>
            你可以獨立完成本教學，不過我們建議你先完成<Links href="/ktor/server-create-restful-apis" summary="Learn how to build a backend service using Kotlin and Ktor, featuring an example of a
        RESTful API that generates JSON files.">建立 RESTful API</Links>教學，以熟悉內容協商與 REST。
        </p>
        <p>我們建議安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，但你也可以使用其他自選的 IDE。
        </p>
    </chapter>
    <chapter title="建立 RESTful 服務和記憶體內部儲存機制" id="create-restful-service-and-repository">
        <p>
            首先，你將重新建立任務管理器的 RESTful 服務。一開始你將使用記憶體內部儲存機制，但會建構一個允許以極小代價進行替換的架構設計。
        </p>
        <p>你將分六個階段進行：</p>
        <list type="decimal">
            <li>
                <a href="#create-project">建立初始專案。</a>
            </li>
            <li>
                <a href="#add-starter-code">新增入門程式碼。</a>
            </li>
            <li>
                <a href="#add-routes">新增 CRUD 路由。</a>
            </li>
            <li>
                <a href="#add-client-page">新增單頁應用程式 (SPA)。</a>
            </li>
            <li>
                <a href="#test-manually">手動測試應用程式。</a>
            </li>
            <li>
                <a href="#add-automated-tests">新增自動化測試。</a>
            </li>
        </list>
        <chapter title="使用外掛程式建立新專案" id="create-project">
            <p>
                若要使用 Ktor 專案產生器建立新專案，請遵循以下步驟：
            </p>
            <procedure id="create-project-procedure">
                <step>
                    <p>
                        前往
                        <a href="https://start.ktor.io/">Ktor 專案產生器</a>
                        。
                    </p>
                </step>
                <step>
                    <p>在
                        <control>Project artifact</control>
                        欄位中，輸入
                        <Path>com.example.ktor-exposed-task-app</Path>
                        作為你的專案產物名稱。
                        <img src="tutorial_server_db_integration_project_artifact.png"
                             alt="在 Ktor 專案產生器中命名專案產物"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        在外掛程式區段中搜尋並點擊
                        <control>Add</control>
                        按鈕以新增以下外掛程式：
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
                             alt="在 Ktor 專案產生器中新增外掛程式"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        新增外掛程式後，點擊外掛程式區段右上角的
                        <control>7 plugins</control>
                        按鈕以檢視已新增的外掛程式。
                    </p>
                    <p>接著你將看到所有將新增至專案的外掛程式清單：
                        <img src="tutorial_server_db_integration_plugin_list.png"
                             alt="Ktor 專案產生器中的外掛程式下拉選單"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        點擊
                        <control>Download</control>
                        按鈕以產生並下載你的 Ktor 專案。
                    </p>
                </step>
                <step>
                    <p>
                        在
                        <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
                            IDEA</a> 或其他自選的 IDE 中開啟產生的專案。
                    </p>
                </step>
                <step>
                    <p>
                        導覽至
                        <Path>src/main/kotlin</Path>
                        並刪除
                        <Path>CitySchema.kt</Path>、
                        <Path>UsersService.kt</Path>、
                        <Path>GreetingService.kt</Path>
                        與 <Path>Postgres.kt</Path>
                        檔案。
                    </p>
                </step>
                <step id="delete-function">
                    <p>
                        開啟
                        <Path>Exposed.kt</Path>
                        檔案並移除 <code>.configureExposed()</code> 函式的內容。
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                        }"/>
                    <p>
                        移除此功能的原因在於 Ktor 專案產生器新增了範例程式碼，展示如何將使用者和城市的資料保存至 HSQLDB 或 PostgreSQL。在本教學中你不需要這些範例程式碼。
                    </p>
                </step>
                <step>
                    開啟 <Path>gradle/libs.versions.toml</Path> 檔案並確保指定了最新的 Exposed 版本：
                    <code-block lang="kotlin" code="                        [versions]&#10;                        #...&#10;                        exposed = %exposed_version%"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="新增入門程式碼" id="add-starter-code">
            <procedure id="add-starter-code-procedure">
                <step>
                    導覽至
                    <Path>src/main/kotlin</Path>
                    並建立名為
                    <Path>model</Path>
                    的子套件。
                </step>
                <step>
                    在
                    <Path>model</Path>
                    套件內，建立一個新的
                    <Path>Task.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        開啟
                        <Path>Task.kt</Path>
                        並新增一個代表優先順序的列舉以及一個代表任務的類別。
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        <code>Task</code> 類別使用來自 <Links href="/ktor/server-serialization" summary="The ContentNegotiation plugin serves two primary purposes: negotiating media types between the client and server and serializing/deserializing the content in a specific format."><code>kotlinx.serialization</code></Links> 程式庫的 <code>Serializable</code> 型別進行標註。
                    </p>
                    <p>
                        正如在先前的教學中一樣，你將建立一個記憶體內部儲存機制。然而這一次，該儲存機制將實作一個介面，以便你日後可以輕鬆替換。
                    </p>
                </step>
                <step>
                    在
                    <Path>model</Path>
                    子套件中，建立一個新的
                    <Path>TaskRepository.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        開啟
                        <Path>TaskRepository.kt</Path>
                        並新增以下介面：
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        interface TaskRepository {&#10;                            fun allTasks(): List&lt;Task&gt;&#10;                            fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                            fun taskByName(name: String): Task?&#10;                            fun addTask(task: Task)&#10;                            fun removeTask(name: String): Boolean&#10;                        }"/>
                </step>
                <step>
                    在相同目錄中建立一個新的
                    <Path>FakeTaskRepository.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        開啟
                        <Path>FakeTaskRepository.kt</Path>
                        並新增以下類別：
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        class FakeTaskRepository : TaskRepository {&#10;                            private val tasks = mutableListOf(&#10;                                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                            )&#10;&#10;                            override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                            override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                                it.priority == priority&#10;                            }&#10;&#10;                            override fun taskByName(name: String) = tasks.find {&#10;                                it.name.equals(name, ignoreCase = true)&#10;                            }&#10;&#10;                            override fun addTask(task: Task) {&#10;                                if (taskByName(task.name) != null) {&#10;                                    throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;                                }&#10;                                tasks.add(task)&#10;                            }&#10;&#10;                            override fun removeTask(name: String): Boolean {&#10;                                return tasks.removeIf { it.name == name }&#10;                            }&#10;                        }"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="新增路由" id="add-routes">
            <procedure id="add-routes-procedure">
                <step>
                    開啟
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>Serialization.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        將現有的 <code>Application.configureSerialization()</code> 函式替換為以下實作：
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;suspend fun Application.configureSerialization() {&#10;    val repository = dependencies.resolve&lt;TaskRepository&gt;()&#10;&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                    <p>
                        這與你在<Links href="/ktor/server-create-restful-apis" summary="Learn how to build a backend service using Kotlin and Ktor, featuring an example of a
        RESTful API that generates JSON files.">建立 RESTful API</Links>教學中實作的路由相同，不同之處在於你現在是從 Ktor 的相依注入容器中解析出儲存機制。由於相依性的型別是 <code>interface</code>，因此可以注入許多不同的實作。
                    </p>
                    <p>
                        因為 <code>dependencies.resolve()</code> 是一個 suspend 函式，所以 <code>.configureSerialization()</code> 也必須宣告為 suspend。
                    </p>
                    <p>
                        現在你已將相依性新增至 <code>.configureSerialization()</code>，現有的呼叫將無法編譯。所幸該函式只會被呼叫一次。
                    </p>
                </step>
                <step>
                    開啟
                    <Path>src/main/kotlin</Path>
                    內的
                    <Path>DI.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        將 <code>.configureDependencyInjection()</code> 函式的內容替換為以下實作：
                    </p>
                    <code-block lang="kotlin" code="                    import com.example.model.FakeTaskRepository&#10;                    import com.example.model.TaskRepository&#10;                    // ...&#10;&#10;                    fun Application.configureDependencyInjection() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                FakeTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        你現在將 <code>FakeTaskRepository</code> 註冊為 <code>TaskRepository</code> 的實作。長遠目標是能夠將其替換為 <code>PostgresTaskRepository</code>。
                    </p>
                </step>
                <step>
                    開啟位於 <Path>src/main/resources</Path> 資料夾內的 <Path>application.yaml</Path> 檔案，確保 <code>.configureDependencyInjection()</code> 函式列在 <code>.configureSerialization()</code> 之前：
                    <code-block lang="yaml" code="                        ktor:&#10;                        deployment:&#10;                            port: 8080&#10;                        application:&#10;                            modules:&#10;                                - com.example.DIKt.configureDependencyInjection&#10;                                - com.example.SerializationKt.configureSerialization&#10;                                - com.example.ExposedKt.configureExposed&#10;                                - com.example.StatusPagesKt.configureStatusPages&#10;                                - com.example.RoutingKt.configureRouting"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="新增用戶端頁面" id="add-client-page">
            <procedure id="add-client-page-procedure">
                <step>
                    開啟
                    <Path>src/main/resources/static</Path>
                    中的
                    <Path>index.html</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        將目前的內容替換為以下實作：
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function displayAllTasks() {&#10;            clearTasksTable();&#10;            fetchAllTasks().then(displayTasks)&#10;        }&#10;&#10;        function displayTasksWithPriority() {&#10;            clearTasksTable();&#10;            const priority = readTaskPriority();&#10;            fetchTasksWithPriority(priority).then(displayTasks)&#10;        }&#10;&#10;        function displayTask(name) {&#10;            fetchTaskWithName(name).then(t =&gt;&#10;                taskDisplay().innerHTML&#10;                    = `${t.priority} priority task ${t.name} with description &quot;${t.description}&quot;`&#10;            )&#10;        }&#10;&#10;        function deleteTask(name) {&#10;            deleteTaskWithName(name).then(() =&gt; {&#10;                clearTaskDisplay();&#10;                displayAllTasks();&#10;            })&#10;        }&#10;&#10;        function deleteTaskWithName(name) {&#10;            return sendDELETE(`/tasks/${name}`)&#10;        }&#10;&#10;        function addNewTask() {&#10;            const task = buildTaskFromForm();&#10;            sendPOST(&quot;/tasks&quot;, task).then(displayAllTasks);&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getTaskFormValue(&quot;newTaskName&quot;),&#10;                description: getTaskFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getTaskFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function getTaskFormValue(controlName) {&#10;            return document.addTaskForm[controlName].value;&#10;        }&#10;&#10;        function taskDisplay() {&#10;            return document.getElementById(&quot;currentTaskDisplay&quot;);&#10;        }&#10;&#10;        function readTaskPriority() {&#10;            return document.priorityForm.priority.value&#10;        }&#10;&#10;        function fetchTasksWithPriority(priority) {&#10;            return sendGET(`/tasks/byPriority/${priority}`);&#10;        }&#10;&#10;        function fetchTaskWithName(name) {&#10;            return sendGET(`/tasks/byName/${name}`);&#10;        }&#10;&#10;        function fetchAllTasks() {&#10;            return sendGET(&quot;/tasks&quot;)&#10;        }&#10;&#10;        function sendGET(url) {&#10;            return fetch(&#10;                url,&#10;                {headers: {'Accept': 'application/json'}}&#10;            ).then(response =&gt; {&#10;                if (response.ok) {&#10;                    return response.json()&#10;                }&#10;                return [];&#10;            });&#10;        }&#10;&#10;        function sendPOST(url, data) {&#10;            return fetch(url, {&#10;                method: 'POST',&#10;                headers: {'Content-Type': 'application/json'},&#10;                body: JSON.stringify(data)&#10;            });&#10;        }&#10;&#10;        function sendDELETE(url) {&#10;            return fetch(url, {&#10;                method: &quot;DELETE&quot;&#10;            });&#10;        }&#10;&#10;        function tasksTable() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTasksTable() {&#10;            tasksTable().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function clearTaskDisplay() {&#10;            taskDisplay().innerText = &quot;None&quot;;&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = tasksTable()&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.priority),&#10;                td(viewLink(task.name)),&#10;                td(deleteLink(task.name)),&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(content) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            if (content instanceof Element) {&#10;                node.appendChild(content)&#10;            } else {&#10;                node.appendChild(document.createTextNode(content));&#10;            }&#10;            return node;&#10;        }&#10;&#10;        function viewLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:displayTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;view&quot;));&#10;            return node;&#10;        }&#10;&#10;        function deleteLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:deleteTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;delete&quot;));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;displayAllTasks()&quot;&gt;&#10;&lt;h1&gt;Task Manager Client&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:displayAllTasks()&quot;&gt;&#10;    &lt;span&gt;View all the tasks&lt;/span&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;priorityForm&quot; action=&quot;javascript:displayTasksWithPriority()&quot;&gt;&#10;    &lt;span&gt;View tasks with priority&lt;/span&gt;&#10;    &lt;select name=&quot;priority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;addTaskForm&quot; action=&quot;javascript:addNewTask()&quot;&gt;&#10;    &lt;span&gt;Create new task with&lt;/span&gt;&#10;    &lt;label for=&quot;newTaskName&quot;&gt;name&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot; name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;    &lt;label for=&quot;newTaskDescription&quot;&gt;description&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot; name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;    &lt;label for=&quot;newTaskPriority&quot;&gt;priority&lt;/label&gt;&#10;    &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;hr&gt;&#10;&lt;div&gt;&#10;    Current task is &lt;em id=&quot;currentTaskDisplay&quot;&gt;None&lt;/em&gt;&#10;&lt;/div&gt;&#10;&lt;hr&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        這與先前教學中使用的 SPA 相同。由於它是用 JavaScript 編寫的，並且僅使用瀏覽器內可用的程式庫，因此你無需擔心用戶端相依性。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="手動測試應用程式" id="test-manually">
            <procedure id="test-manually-procedure">
                <step>
                    <p>在 IntelliJ IDEA 中，點擊執行按鈕
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA run icon"/>)
                        以啟動應用程式。</p>
                </step>
                <step>
                    <p>
                        在瀏覽器中導覽至 <a
                            href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。你應該會看到由三個表單和一個顯示篩選結果的表格所組成的用戶端頁面。
                    </p>
                    <img src="tutorial_server_db_integration_index_page.png"
                         alt="顯示任務管理器用戶端的瀏覽器視窗"
                         border-effect="rounded"
                         width="706"/>
                </step>
                <step>
                    <p>
                        透過填寫並使用
                        <control>Go</control>
                        按鈕送出表單來測試應用程式。使用表格項目上的
                        <control>View</control>
                        和
                        <control>Delete</control>
                        按鈕。
                    </p>
                    <img src="tutorial_server_db_integration_manual_test.gif"
                         alt="顯示任務管理器用戶端的瀏覽器視窗"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="新增自動化單元測試" id="add-automated-tests">
            <procedure id="add-automated-tests-procedure">
                <step>
                    <p>
                        開啟
                        <Path>src/test/kotlin</Path>
                        中的
                        <Path>ServerTest.kt</Path>
                        檔案，並新增以下測試：
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;suspend fun Application.configureTestApp() {&#10;    dependencies {&#10;        provide&lt;TaskRepository&gt; {&#10;            FakeTaskRepository()&#10;        }&#10;    }&#10;    configureSerialization()&#10;    configureStatusPages()&#10;    configureRouting()&#10;}&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                    <p>
                        為了編譯並執行這些測試，你需要新增對 Ktor Client 的 <a
                            href="https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html">Content
                        Negotiation</a> 外掛程式的相依性。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>build.gradle.kts</Path>
                        並新增以下相依性：
                    </p>
                    <code-block lang="kotlin" code="                        dependencies {&#10;                            //...&#10;                            testImplementation(ktorLibs.client.contentNegotiation)&#10;                        }"/>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，點擊編輯器右側的通知 Gradle 圖示
                        (<img alt="intelliJ IDEA gradle icon"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        以載入 Gradle 變更。</p>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，點擊測試類別定義旁的執行按鈕
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA run icon"/>)
                        來執行測試。</p>
                    <p>接著你應該會在
                        <control>Run</control>
                        窗格中看到測試已成功執行。
                    </p>
                    <img src="tutorial_server_db_integration_test_results.png"
                         alt="在 IntelliJ IDEA 的 Run 窗格中顯示成功的測試結果"
                         border-effect="line"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="新增 PostgreSQL 儲存機制" id="add-postgresql-repository">
        <p>
            現在你已經擁有一個使用記憶體內部資料的可運作應用程式，下一步是將資料儲存外部化至 PostgreSQL 資料庫。
        </p>
        <p>
            你將透過執行以下操作來實現：
        </p>
        <list type="decimal">
            <li><a href="#create-schema">在 PostgreSQL 中建立資料庫架構。</a></li>
            <li><a href="#adapt-repo">改造 <code>TaskRepository</code> 以進行非同步存取。</a></li>
            <li><a href="#config-db-connection">在應用程式內設定資料庫連線。</a></li>
            <li><a href="#create-mapping">將 <code>Task</code> 型別對應至關聯的資料庫表格。</a></li>
            <li><a href="#create-new-repo">根據該對應建立新的儲存機制。</a></li>
            <li><a href="#switch-repo">在啟動程式碼中切換至新的儲存機制。</a></li>
        </list>
        <chapter title="建立資料庫架構" id="create-schema">
            <procedure id="create-schema-procedure">
                <step>
                    <p>
                        使用你選擇的資料庫管理工具，在 PostgreSQL 中建立一個新資料庫。名稱只要記得住即可，並不影響操作。在此範例中，我們將使用
                        <Path>ktor_tutorial_db</Path>。
                    </p>
                    <tip>
                        <p>
                            有關 PostgreSQL 的更多資訊，請參閱<a
                                href="https://www.postgresql.org/docs/current/">官方文件</a>。
                        </p>
                        <p>
                            在 IntelliJ IDEA 中，你可以利用資料庫工具來<a
                                href="https://www.jetbrains.com/help/idea/postgresql.html">連線並管理你的 PostgreSQL
                            資料庫。</a>
                        </p>
                    </tip>
                </step>
                <step>
                    <p>
                        對你的資料庫執行以下 SQL 指令。這些指令將建立並填入資料庫架構：
                    </p>
                    <code-block lang="sql" code="                        DROP TABLE IF EXISTS task;&#10;                        CREATE TABLE task(id SERIAL PRIMARY KEY, name VARCHAR(50), description VARCHAR(50), priority VARCHAR(50));&#10;&#10;                        INSERT INTO task (name, description, priority) VALUES ('cleaning', 'Clean the house', 'Low');&#10;                        INSERT INTO task (name, description, priority) VALUES ('gardening', 'Mow the lawn', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('shopping', 'Buy the groceries', 'High');&#10;                        INSERT INTO task (name, description, priority) VALUES ('painting', 'Paint the fence', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('exercising', 'Walk the dog', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('meditating', 'Contemplate the infinite', 'High');"/>
                    <p>
                        請注意以下事項：
                    </p>
                    <list>
                        <li>
                            你正在建立一個名為
                            <code>task</code>
                            的單一表格，包含
                            <code>name</code>、
                            <code>description</code>
                            與
                            <code>priority</code>
                            欄位。這些欄位需要對應至 <code>Task</code> 類別的屬性。
                        </li>
                        <li>
                            如果表格已存在，你將重新建立該表格，因此你可以重複執行該指令嗎。
                        </li>
                        <li>
                            還有一個額外名為
                            <code>id</code>
                            的欄位，其型別為 <code>SERIAL</code>。這將是一個整數值，用於為每一列提供其主鍵。這些值將由資料庫代為指派。
                        </li>
                    </list>
                </step>
            </procedure>
        </chapter>
        <chapter title="改造現有儲存機制" id="adapt-repo">
            <procedure id="adapt-repo-procedure">
                <p>
                    對資料庫執行查詢時，最好非同步執行它們，以避免阻塞處理 HTTP 請求的執行緒。在 Kotlin 中，這最好透過<a
                        href="https://kotlinlang.org/docs/coroutines-overview.html">協同程式</a>來管理。
                </p>
                <step>
                    <p>
                        開啟
                        <Path>src/main/kotlin/model</Path>
                        中的
                        <Path>TaskRepository.kt</Path>
                        檔案。
                    </p>
                </step>
                <step>
                    <p>
                        為所有介面方法新增 <code>suspend</code> 關鍵字：
                    </p>
                    <code-block lang="kotlin" code="                    interface TaskRepository {&#10;                        suspend fun allTasks(): List&lt;Task&gt;&#10;                        suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                        suspend fun taskByName(name: String): Task?&#10;                        suspend fun addTask(task: Task)&#10;                        suspend fun removeTask(name: String): Boolean&#10;                    }"/>
                    <p>
                        這將允許介面方法的實作在不同的協同程式調度器上啟動工作任務。
                    </p>
                    <p>
                        你現在需要調整 <code>FakeTaskRepository</code> 的方法以相互符合，儘管在該實作中你不需要切換調度器。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>FakeTaskRepository.kt</Path>
                        檔案，並為所有方法新增 <code>suspend</code> 關鍵字：
                    </p>
                    <code-block lang="kotlin" code="                    class FakeTaskRepository : TaskRepository {&#10;                        //...&#10;&#10;                        override suspend fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                        override suspend fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun taskByName(name: String) = tasks.find {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun addTask(task: Task) {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun removeTask(name: String): Boolean {&#10;                            //...&#10;                        }&#10;                    }"/>
                    <p>
                        到目前為止，你尚未引入任何新功能。相反地，你已經為建立將對資料庫非同步執行查詢的 <code>PostgresTaskRepository</code> 奠定了基礎。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="設定資料庫連線" id="config-db-connection">
            <procedure id="config-db-connection-procedure">
                <p>
                    在<a href="#delete-function">本教學的第一部分</a>中，你刪除了
                    <Path>Exposed.kt</Path>
                    內 <code>.configureExposed()</code> 函式中的範例程式碼。現在你已準備好新增自己的實作。
                </p>
                <p>
                    Ktor 專案產生器並未新增對 DAO 型別的支援，因此你首先需要在 Gradle 建置檔案中新增相關相依性。
                </p>
                <step>
                    在你的 <Path>gradle/libs.versions.toml</Path> 檔案中，新增 <code>exposed-jdbc</code> 與
                    <code>exposed-dao</code> 程式庫：
                    <code-block lang="kotlin" code="                        [libraries]&#10;                        exposed-jdbc = { module = &quot;org.jetbrains.exposed:exposed-jdbc&quot;, version.ref = &quot;exposed&quot; }&#10;                        exposed-dao = { module = &quot;org.jetbrains.exposed:exposed-dao&quot;, version.ref = &quot;exposed&quot; }"/>
                    這將允許你使用 Exposed 資料存取物件 (DAO) 模式。
                </step>
                <step>
                    在你的 <Path>build.gradle.kts</Path> 檔案中，新增以下相依性：
                    <code-block lang="kotlin" code="                    dependencies {&#10;                        // ...&#10;                        implementation(libs.exposed.jdbc)&#10;                        implementation(libs.exposed.dao)&#10;                    }"/>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，點擊編輯器右側的通知 Gradle 圖示
                        (<img alt="intelliJ IDEA gradle icon"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        以載入 Gradle 變更。</p>
                </step>
                <step>
                    開啟
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>Exposed.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        使用 <code>Database.connect()</code> 函式連接至你的資料庫，調整設定值以符合你的環境：
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                            Database.connect(&#10;                                &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;,&#10;                                user = &quot;postgres&quot;,&#10;                                password = &quot;password&quot;&#10;                            )&#10;                        }"/>
                    <p>請注意 <code>url</code> 包含以下組成部分：</p>
                    <list>
                        <li>
                            <code>localhost:5432</code> 是 PostgreSQL 資料庫執行的主機與連接埠。
                        </li>
                        <li>
                            <code>ktor_tutorial_db</code> 是執行服務時建立的資料庫名稱。
                        </li>
                    </list>
                    <tip>
                        欲了解更多資訊，請參閱
                        <a href="https://www.jetbrains.com/help/exposed/working-with-database.html">
                            在 Exposed 中使用資料庫</a>。
                    </tip>
                </step>
            </procedure>
        </chapter>
        <chapter title="建立物件／關聯對應" id="create-mapping">
            <procedure id="create-mapping-procedure">
                <step>
                    導覽至
                    <Path>src/main/kotlin</Path>
                    並建立名為
                    <Path>db</Path>
                    的新套件。
                </step>
                <step>
                    在
                    <Path>db</Path>
                    套件內，建立一個新的
                    <Path>mapping.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        開啟
                        <Path>mapping.kt</Path>
                        並新增 <code>TaskTable</code> 與 <code>TaskDAO</code> 型別：
                    </p>
                    <code-block lang="kotlin" code="package com.example.db&#10;&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}"/>
                    <p>
                        這些型別使用 Exposed 程式庫將 <code>Task</code> 型別中的屬性對應到資料庫中
                        <code>task</code>
                        表格的欄位。<code>TaskTable</code> 型別定義了基本對應，而
                        <code>TaskDAO</code> 型別則新增了幫助程式方法來建立、尋找、更新與刪除任務。
                    </p>
                </step>
                <step>
                    <p>
                        在同一個
                        <Path>mapping.kt</Path>
                        檔案中，新增以下幫助程式函式：
                    </p>
                    <code-block include-symbol="withTransaction, daoToModel"
                            lang="kotlin" code="package com.example.db&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}&#10;&#10;suspend fun &lt;T&gt; withTransaction(block: suspend JdbcTransaction.() -&gt; T): T = withContext(Dispatchers.IO) {&#10;    inTopLevelSuspendTransaction { block() }&#10;}&#10;&#10;fun daoToModel(dao: TaskDAO) = Task(&#10;    dao.name,&#10;    dao.description,&#10;    Priority.valueOf(dao.priority)&#10;)"/>
                    <list>
                        <li>
                            <code>withTransaction()</code> 函式在新的最上層資料庫交易中執行一個掛起區塊。協同程式上下文切換至 <code>Dispatchers.IO</code>，以便阻塞式 JDBC 操作在針對 IO 任務最佳化的執行緒集區上執行。
                        </li>
                        <li>
                            <code>daoToModel()</code> 函式將 <code>TaskDAO</code> 型別的執行個體轉換為 <code>Task</code> 物件。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        新增以下缺少的匯入：
                    </p>
                    <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="編寫新的儲存機制" id="create-new-repo">
            <procedure id="create-new-repo-procedure">
                <p>你現在已經擁有建立特定資料庫儲存機制所需的所有資源。</p>
                <step>
                    導覽至
                    <Path>src/main/kotlin/model</Path>
                    並建立一個新的
                    <Path>PostgresTaskRepository.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        開啟
                        <Path>PostgresTaskRepository.kt</Path>
                        檔案，並透過以下實作建立一個新型別：
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import com.example.db.TaskDAO&#10;import com.example.db.TaskTable&#10;import com.example.db.daoToModel&#10;import com.example.db.withTransaction&#10;import org.jetbrains.exposed.v1.core.eq&#10;import org.jetbrains.exposed.v1.jdbc.deleteWhere&#10;&#10;class PostgresTaskRepository : TaskRepository {&#10;    override suspend fun allTasks(): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO.all().map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.priority eq priority.toString()) }&#10;            .map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun taskByName(name: String): Task? = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.name eq name) }&#10;            .limit(1)&#10;            .map(::daoToModel)&#10;            .firstOrNull()&#10;    }&#10;&#10;    override suspend fun addTask(task: Task): Unit = withTransaction {&#10;        TaskDAO.new {&#10;            name = task.name&#10;            description = task.description&#10;            priority = task.priority.toString()&#10;        }&#10;    }&#10;&#10;    override suspend fun removeTask(name: String): Boolean = withTransaction {&#10;        val rowsDeleted = TaskTable.deleteWhere {&#10;            TaskTable.name eq name&#10;        }&#10;        rowsDeleted == 1&#10;    }&#10;}"/>
                    <p>
                        在此實作中，你使用 <code>TaskDAO</code> 和 <code>TaskTable</code> 型別的幫助程式方法與資料庫互動。建立此新儲存機制後，唯一剩下的任務就是切換為在你的路由中使用它。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="切換至新的儲存機制" id="switch-repo">
            <procedure id="switch-repo-procedure">
                <p>若要切換至外部資料庫，你只需要變更儲存機制型別。</p>
                <step>
                    開啟
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>main.kt</Path>
                    檔案。
                </step>
                <step>
                    <p>
                        在 <code>Application.configureDependencies()</code> 函式中，將 <code>FakeTaskRepository</code> 替換為 <code>PostgresTaskRepository</code>：
                    </p>
                    <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.PostgresTaskRepository&#10;&#10;                    //...&#10;&#10;                    fun Application.configureDependencies() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                PostgresTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        因為你是透過介面注入相依性，所以實作的切換對管理路由的程式碼而言是完全透明的。
                    </p>
                </step>
                <step>
                    <p>
                        在 IntelliJ IDEA 中，點擊重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="intelliJ IDEA rerun icon"/>) 以重新啟動應用程式。
                    </p>
                </step>
                <step>
                    導覽至 <a
                        href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。UI 保持不變，但現在會從資料庫擷取資料。
                </step>
                <step>
                    <p>
                        若要驗證這一點，請使用表單新增一個新任務，並查詢 PostgreSQL 中的 tasks 表格所保留的資料。
                    </p>
                    <tip>
                        <p>
                            在 IntelliJ IDEA 中，你可以使用<a href="https://www.jetbrains.com/help/idea/query-consoles.html#create_console">查詢主控台</a>和 <code>SELECT</code> SQL 陳述式來查詢表格資料：
                        </p>
                        <code-block lang="SQL" code="                            SELECT * FROM task;"/>
                        <p>
                            查詢完成後，資料應該會顯示在
                            <ui-path>Service</ui-path>
                            窗格中，包含新任務：
                        </p>
                        <img src="tutorial_server_db_integration_task_table.png"
                             alt="在 IntelliJ IDEA 的 Service 窗格中顯示的任務表格"
                             border-effect="line"
                             width="706"/>
                    </tip>
                </step>
            </procedure>
        </chapter>
        <p>
            至此，你已成功完成將資料庫整合至應用程式的工作。
        </p>
        <p>
            由於正式環境程式碼中不再需要 <code>FakeTaskRepository</code> 型別，你可以將其移至
            <Path>src/test</Path>
            中的測試原始碼集。
        </p>
        <p>
            最終的專案結構應如下所示：
        </p>
        <img src="tutorial_server_db_integration_src_folder.png"
             alt="IntelliJ IDEA 的專案檢視中顯示的 src 資料夾"
             border-effect="line"
             width="400"/>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            現在你擁有一個與 Ktor RESTful 服務通訊的應用程式。此服務進而使用以 <a href="https://github.com/JetBrains/Exposed">Exposed</a> 編寫的儲存機制來存取 <a href="https://www.postgresql.org/docs/">PostgreSQL</a>。你還擁有一套用來驗證核心功能的<a href="#add-automated-tests">測試套件</a>，而且無需 Web 伺服器或資料庫。
        </p>
        <p>
            你可以根據需要擴充此結構以支援任意的功能，但你可能希望先考慮設計的非功能性層面，例如容錯能力、安全性和可擴展性。你可以從將<a href="docker-compose.topic#extract-db-settings">資料庫連線設定擷取</a>至<Links href="/ktor/server-configuration-file" summary="Learn how to configure various server parameters in a configuration file.">設定檔</Links>開始。
        </p>
    </chapter>
</topic>