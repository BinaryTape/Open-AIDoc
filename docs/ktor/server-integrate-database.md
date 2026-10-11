<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin、Ktor 和 Exposed 集成数据库" id="server-integrate-database">
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
            <b>使用的插件</b>：<Links href="/ktor/server-static-content" summary="了解如何提供静态内容，例如样式表、脚本、图像等。">Static Content</Links>，
            <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>，<Links href="/ktor/server-status-pages" summary="%plugin_name% 允许 Ktor 应用程序根据抛出的异常或状态代码对任何失败状态做出适当的响应。">Status pages</Links>，
            <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">kotlinx.serialization</Links>，
            <Links href="/ktor/server-dependency-injection" summary="所需的依赖项：io.ktor:ktor-server-di 代码示例：%example_name%">Dependency Injection</Links>，
            <a href="https://github.com/ktorio/ktor-plugin-registry/tree/main/repository/org.jetbrains/server-exposed">Exposed</a>，
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
        了解如何使用 Kotlin 和 Ktor 构建单页应用程序 (SPA)，其中 RESTful 服务链接到数据库仓库。它使用 Exposed SQL 库，并允许您伪造仓库以进行测试。
    </web-summary>
    <p>
        在本文中，你将学习如何使用适用于 Kotlin 的 SQL 库 <a
            href="https://www.jetbrains.com/exposed/">Exposed</a> 将 Ktor 服务与关系型数据库相集成。
    </p>
    <p>完成本教程后，你将学会如何执行以下操作：</p>
    <list>
        <li>创建使用 JSON 序列化的 RESTful 服务。</li>
        <li>向这些服务注入不同的仓库。</li>
        <li>使用内存仓库为你的服务创建单元测试。</li>
        <li>使用 Exposed 和依赖注入 (DI) 构建可正常工作的仓库。</li>
        <li>部署访问外部数据库的服务。</li>
    </list>
    <p>
        在之前的教程中，我们使用任务管理器示例介绍了基础知识，例如<Links href="/ktor/server-requests-and-responses" summary="通过构建任务管理器应用程序，了解 Kotlin 中使用 Ktor 进行路由、处理请求和形参的基础知识。">处理请求</Links>、
        <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links>，或者
        <Links href="/ktor/server-create-website" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 模板构建网站。">使用 Thymeleaf 模板构建 Web 应用</Links>。
    </p>
    <p>
        虽然这些教程侧重于使用简单的内存 <code>TaskRepository</code> 来实现前端功能，但本指南将重点转移到展示 Ktor 服务如何通过 Exposed SQL 库与关系型数据库进行交互。
    </p>
    <p>
        尽管本指南篇幅更长且更为复杂，但你仍然能够快速编写出可运行的代码，并逐步引入新功能。
    </p>
    <p>本指南包含两个部分：</p>
    <list type="decimal">
        <li>
            <a href="#create-restful-service-and-repository">使用内存仓库创建应用程序。</a>
        </li>
        <li>
            <a href="#add-postgresql-repository">将内存仓库替换为使用 PostgreSQL 的仓库。</a>
        </li>
    </list>
    <chapter title="准备工作" id="prerequisites">
        <p>
            你可以独立完成本教程，但我们建议你先完成<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links>教程，以熟悉内容协商和 REST。
        </p>
        <p>我们建议你安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，不过你也可以选择使用其他喜欢的 IDE。
        </p>
    </chapter>
    <chapter title="创建 RESTful 服务和内存仓库" id="create-restful-service-and-repository">
        <p>
            首先，你将重新创建任务管理器的 RESTful 服务。一开始将使用内存仓库，但会采用允许以极小代价进行替换的设计结构。
        </p>
        <p>你将分六个阶段完成此操作：</p>
        <list type="decimal">
            <li>
                <a href="#create-project">创建初始项目。</a>
            </li>
            <li>
                <a href="#add-starter-code">添加起步代码。</a>
            </li>
            <li>
                <a href="#add-routes">添加 CRUD 路由。</a>
            </li>
            <li>
                <a href="#add-client-page">添加单页应用程序 (SPA)。</a>
            </li>
            <li>
                <a href="#test-manually">手动测试应用程序。</a>
            </li>
            <li>
                <a href="#add-automated-tests">添加自动化测试。</a>
            </li>
        </list>
        <chapter title="使用插件创建新项目" id="create-project">
            <p>
                若要使用 Ktor Project Generator 创建新项目，请按照以下步骤操作：
            </p>
            <procedure id="create-project-procedure">
                <step>
                    <p>
                        导航至
                        <a href="https://start.ktor.io/">Ktor Project Generator</a>。
                    </p>
                </step>
                <step>
                    <p>在
                        <control>Project artifact</control>
                        字段中，输入
                        <Path>com.example.ktor-exposed-task-app</Path>
                        作为项目工件的名称。
                        <img src="tutorial_server_db_integration_project_artifact.png"
                             alt="在 Ktor Project Generator 中为项目工件命名"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        在插件部分搜索并通过点击
                        <control>Add</control>
                        按钮添加以下插件：
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
                             alt="在 Ktor Project Generator 中添加插件"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        添加插件后，点击插件部分右上角的
                        <control>7 plugins</control>
                        按钮以查看已添加的插件。
                    </p>
                    <p>随后将看到将添加到项目中的所有插件列表：
                        <img src="tutorial_server_db_integration_plugin_list.png"
                             alt="Ktor Project Generator 中的插件下拉菜单"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        点击
                        <control>Download</control>
                        按钮生成并下载你的 Ktor 项目。
                    </p>
                </step>
                <step>
                    <p>
                        在
                        <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
                            IDEA</a> 或其他所选 IDE 中打开生成的项目。
                    </p>
                </step>
                <step>
                    <p>
                        导航至
                        <Path>src/main/kotlin</Path>
                        并删除
                        <Path>CitySchema.kt</Path>、
                        <Path>UsersService.kt</Path>、
                        <Path>GreetingService.kt</Path>
                        以及 <Path>Postgres.kt</Path>
                        文件。
                    </p>
                </step>
                <step id="delete-function">
                    <p>
                        打开
                        <Path>Exposed.kt</Path>
                        文件并移除 <code>.configureExposed()</code> 函数的内容。
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                        }"/>
                    <p>
                        移除此功能的原因在于，Ktor Project Generator 添加了用于演示如何将用户和城市数据持久化到 HSQLDB 或 PostgreSQL 的示例代码。在本教程中不需要该示例代码。
                    </p>
                </step>
                <step>
                    打开 <Path>gradle/libs.versions.toml</Path> 文件并确保指定了最新的 Exposed 版本：
                    <code-block lang="kotlin" code="                        [versions]&#10;                        #...&#10;                        exposed = %exposed_version%"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="添加起步代码" id="add-starter-code">
            <procedure id="add-starter-code-procedure">
                <step>
                    导航至
                    <Path>src/main/kotlin</Path>
                    并创建一个名为
                    <Path>model</Path>
                    的子包。
                </step>
                <step>
                    在
                    <Path>model</Path>
                    包内，新建一个
                    <Path>Task.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        打开
                        <Path>Task.kt</Path>
                        并添加一个表示优先级的枚举以及一个表示任务的类。
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        <code>Task</code> 类使用来自 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。"><code>kotlinx.serialization</code></Links> 库的 <code>Serializable</code> 类型进行了注解。
                    </p>
                    <p>
                        与之前的教程一样，你将创建一个内存仓库。不过这次该仓库将实现一个接口，以便后续能够轻松替换。
                    </p>
                </step>
                <step>
                    在
                    <Path>model</Path>
                    子包中，新建一个
                    <Path>TaskRepository.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        打开
                        <Path>TaskRepository.kt</Path>
                        并添加以下接口：
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        interface TaskRepository {&#10;                            fun allTasks(): List&lt;Task&gt;&#10;                            fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                            fun taskByName(name: String): Task?&#10;                            fun addTask(task: Task)&#10;                            fun removeTask(name: String): Boolean&#10;                        }"/>
                </step>
                <step>
                    在同一目录下新建一个
                    <Path>FakeTaskRepository.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        打开
                        <Path>FakeTaskRepository.kt</Path>
                        并添加以下类：
                    </p>
                    <code-block lang="kotlin" code="                        package com.example.model&#10;&#10;                        class FakeTaskRepository : TaskRepository {&#10;                            private val tasks = mutableListOf(&#10;                                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                            )&#10;&#10;                            override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                            override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                                it.priority == priority&#10;                            }&#10;&#10;                            override fun taskByName(name: String) = tasks.find {&#10;                                it.name.equals(name, ignoreCase = true)&#10;                            }&#10;&#10;                            override fun addTask(task: Task) {&#10;                                if (taskByName(task.name) != null) {&#10;                                    throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;                                }&#10;                                tasks.add(task)&#10;                            }&#10;&#10;                            override fun removeTask(name: String): Boolean {&#10;                                return tasks.removeIf { it.name == name }&#10;                            }&#10;                        }"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="添加路由" id="add-routes">
            <procedure id="add-routes-procedure">
                <step>
                    打开
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>Serialization.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        将现有的 <code>Application.configureSerialization()</code> 函数替换为以下实现：
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;suspend fun Application.configureSerialization() {&#10;    val repository = dependencies.resolve&lt;TaskRepository&gt;()&#10;&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                    <p>
                        这与你在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links>教程中实现的路由相同，不同之处在于你现在是从 Ktor 的依赖注入容器中解析仓库。由于依赖项的类型是 <code>interface</code>，因此可以注入多种不同的实现。
                    </p>
                    <p>
                        因为 <code>dependencies.resolve()</code> 是一个挂起函数，所以 <code>.configureSerialization()</code> 也必须声明为挂起函数。
                    </p>
                    <p>
                        由于你为 <code>.configureSerialization()</code> 添加了依赖项，现有的调用将无法再通过编译。幸运的是，该函数只被调用一次。
                    </p>
                </step>
                <step>
                    打开
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>DI.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        将 <code>.configureDependencyInjection()</code> 函数的内容替换为以下实现：
                    </p>
                    <code-block lang="kotlin" code="                    import com.example.model.FakeTaskRepository&#10;                    import com.example.model.TaskRepository&#10;                    // ...&#10;&#10;                    fun Application.configureDependencyInjection() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                FakeTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        现在你将 <code>FakeTaskRepository</code> 注册为 <code>TaskRepository</code> 的实现。
                        长期目标是能够将其替换为 <code>PostgresTaskRepository</code>。
                    </p>
                </step>
                <step>
                    打开位于 <Path>src/main/resources</Path> 文件夹下的 <Path>application.yaml</Path> 文件，确保 <code>.configureDependencyInjection()</code> 函数列在 <code>.configureSerialization()</code> 之前：
                    <code-block lang="yaml" code="                        ktor:&#10;                        deployment:&#10;                            port: 8080&#10;                        application:&#10;                            modules:&#10;                                - com.example.DIKt.configureDependencyInjection&#10;                                - com.example.SerializationKt.configureSerialization&#10;                                - com.example.ExposedKt.configureExposed&#10;                                - com.example.StatusPagesKt.configureStatusPages&#10;                                - com.example.RoutingKt.configureRouting"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="添加客户端页面" id="add-client-page">
            <procedure id="add-client-page-procedure">
                <step>
                    打开
                    <Path>src/main/resources/static</Path>
                    中的
                    <Path>index.html</Path>
                    文件。
                </step>
                <step>
                    <p>
                        将当前内容替换为以下实现：
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function displayAllTasks() {&#10;            clearTasksTable();&#10;            fetchAllTasks().then(displayTasks)&#10;        }&#10;&#10;        function displayTasksWithPriority() {&#10;            clearTasksTable();&#10;            const priority = readTaskPriority();&#10;            fetchTasksWithPriority(priority).then(displayTasks)&#10;        }&#10;&#10;        function displayTask(name) {&#10;            fetchTaskWithName(name).then(t =&gt;&#10;                taskDisplay().innerHTML&#10;                    = `${t.priority} priority task ${t.name} with description &quot;${t.description}&quot;`&#10;            )&#10;        }&#10;&#10;        function deleteTask(name) {&#10;            deleteTaskWithName(name).then(() =&gt; {&#10;                clearTaskDisplay();&#10;                displayAllTasks();&#10;            })&#10;        }&#10;&#10;        function deleteTaskWithName(name) {&#10;            return sendDELETE(`/tasks/${name}`)&#10;        }&#10;&#10;        function addNewTask() {&#10;            const task = buildTaskFromForm();&#10;            sendPOST(&quot;/tasks&quot;, task).then(displayAllTasks);&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getTaskFormValue(&quot;newTaskName&quot;),&#10;                description: getTaskFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getTaskFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function getTaskFormValue(controlName) {&#10;            return document.addTaskForm[controlName].value;&#10;        }&#10;&#10;        function taskDisplay() {&#10;            return document.getElementById(&quot;currentTaskDisplay&quot;);&#10;        }&#10;&#10;        function readTaskPriority() {&#10;            return document.priorityForm.priority.value&#10;        }&#10;&#10;        function fetchTasksWithPriority(priority) {&#10;            return sendGET(`/tasks/byPriority/${priority}`);&#10;        }&#10;&#10;        function fetchTaskWithName(name) {&#10;            return sendGET(`/tasks/byName/${name}`);&#10;        }&#10;&#10;        function fetchAllTasks() {&#10;            return sendGET(&quot;/tasks&quot;)&#10;        }&#10;&#10;        function sendGET(url) {&#10;            return fetch(&#10;                url,&#10;                {headers: {'Accept': 'application/json'}}&#10;            ).then(response =&gt; {&#10;                if (response.ok) {&#10;                    return response.json()&#10;                }&#10;                return [];&#10;            });&#10;        }&#10;&#10;        function sendPOST(url, data) {&#10;            return fetch(url, {&#10;                method: 'POST',&#10;                headers: {'Content-Type': 'application/json'},&#10;                body: JSON.stringify(data)&#10;            });&#10;        }&#10;&#10;        function sendDELETE(url) {&#10;            return fetch(url, {&#10;                method: &quot;DELETE&quot;&#10;            });&#10;        }&#10;&#10;        function tasksTable() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTasksTable() {&#10;            tasksTable().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function clearTaskDisplay() {&#10;            taskDisplay().innerText = &quot;None&quot;;&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = tasksTable()&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.priority),&#10;                td(viewLink(task.name)),&#10;                td(deleteLink(task.name)),&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(content) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            if (content instanceof Element) {&#10;                node.appendChild(content)&#10;            } else {&#10;                node.appendChild(document.createTextNode(content));&#10;            }&#10;            return node;&#10;        }&#10;&#10;        function viewLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:displayTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;view&quot;));&#10;            return node;&#10;        }&#10;&#10;        function deleteLink(taskName) {&#10;            const node = document.createElement(&quot;a&quot;);&#10;            node.setAttribute(&#10;                &quot;href&quot;, `javascript:deleteTask(&quot;${taskName}&quot;)`&#10;            )&#10;            node.appendChild(document.createTextNode(&quot;delete&quot;));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;displayAllTasks()&quot;&gt;&#10;&lt;h1&gt;Task Manager Client&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:displayAllTasks()&quot;&gt;&#10;    &lt;span&gt;View all the tasks&lt;/span&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;priorityForm&quot; action=&quot;javascript:displayTasksWithPriority()&quot;&gt;&#10;    &lt;span&gt;View tasks with priority&lt;/span&gt;&#10;    &lt;select name=&quot;priority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;form name=&quot;addTaskForm&quot; action=&quot;javascript:addNewTask()&quot;&gt;&#10;    &lt;span&gt;Create new task with&lt;/span&gt;&#10;    &lt;label for=&quot;newTaskName&quot;&gt;name&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot; name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;    &lt;label for=&quot;newTaskDescription&quot;&gt;description&lt;/label&gt;&#10;    &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot; name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;    &lt;label for=&quot;newTaskPriority&quot;&gt;priority&lt;/label&gt;&#10;    &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;        &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;        &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;        &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;        &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;    &lt;/select&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;Go&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;hr&gt;&#10;&lt;div&gt;&#10;    Current task is &lt;em id=&quot;currentTaskDisplay&quot;&gt;None&lt;/em&gt;&#10;&lt;/div&gt;&#10;&lt;hr&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;        &lt;th&gt;&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        这与之前教程中使用的 SPA 相同。因为它是用 JavaScript 编写的，并且仅使用浏览器内可用的库，所以你无需担心客户端依赖项。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="手动测试应用程序" id="test-manually">
            <procedure id="test-manually-procedure">
                <step>
                    <p>在 IntelliJ IDEA 中，点击运行按钮
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA 运行图标"/>)
                        以启动应用程序。</p>
                </step>
                <step>
                    <p>
                        在浏览器中导航至 <a
                            href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。你应该会看到由三个表单和一个显示筛选结果的表格组成的客户端页面。
                    </p>
                    <img src="tutorial_server_db_integration_index_page.png"
                         alt="显示任务管理器客户端的浏览器窗口"
                         border-effect="rounded"
                         width="706"/>
                </step>
                <step>
                    <p>
                        通过填写表单并点击
                        <control>Go</control>
                        按钮提交来测试应用程序。对表格项使用
                        <control>View</control>
                        和
                        <control>Delete</control>
                        按钮。
                    </p>
                    <img src="tutorial_server_db_integration_manual_test.gif"
                         alt="显示任务管理器客户端的浏览器窗口"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="添加自动化单元测试" id="add-automated-tests">
            <procedure id="add-automated-tests-procedure">
                <step>
                    <p>
                        打开
                        <Path>src/test/kotlin</Path>
                        中的
                        <Path>ServerTest.kt</Path>
                        文件并添加以下测试：
                    </p>
                    <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import com.example.model.TaskRepository&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.di.dependencies&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;suspend fun Application.configureTestApp() {&#10;    dependencies {&#10;        provide&lt;TaskRepository&gt; {&#10;            FakeTaskRepository()&#10;        }&#10;    }&#10;    configureSerialization()&#10;    configureStatusPages()&#10;    configureRouting()&#10;}&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        application {&#10;            configureTestApp()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                    <p>
                        为了使这些测试能够编译并运行，你需要为 Ktor Client 添加对 <a
                            href="https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html">Content
                        Negotiation</a> 插件的依赖。
                    </p>
                </step>
                <step>
                    <p>
                        打开
                        <Path>build.gradle.kts</Path>
                        并添加以下依赖项：
                    </p>
                    <code-block lang="kotlin" code="                        dependencies {&#10;                            //...&#10;                            testImplementation(ktorLibs.client.contentNegotiation)&#10;                        }"/>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，点击编辑器右侧的 Gradle 通知图标
                        (<img alt="intelliJ IDEA gradle 图标"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        以重新加载 Gradle 更改。</p>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，点击测试类定义旁的运行按钮
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA 运行图标"/>)
                        以运行测试。</p>
                    <p>随后你应该会在
                        <control>Run</control>
                        窗格中看到测试已成功运行。
                    </p>
                    <img src="tutorial_server_db_integration_test_results.png"
                         alt="IntelliJ IDEA 的 Run 窗格中显示的成功测试结果"
                         border-effect="line"
                         width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="添加 PostgreSQL 仓库" id="add-postgresql-repository">
        <p>
            现在你已经拥有了一个使用内存数据的可用应用程序，下一步是将数据存储外部化到 PostgreSQL 数据库。
        </p>
        <p>
            你将通过执行以下操作来实现此目标：
        </p>
        <list type="decimal">
            <li><a href="#create-schema">在 PostgreSQL 中创建数据库架构。</a></li>
            <li><a href="#adapt-repo">改造 <code>TaskRepository</code> 以支持异步访问。</a></li>
            <li><a href="#config-db-connection">在应用程序中配置数据库连接。</a></li>
            <li><a href="#create-mapping">将 <code>Task</code> 类型映射到关联的数据库表。</a></li>
            <li><a href="#create-new-repo">基于映射创建新的仓库。</a></li>
            <li><a href="#switch-repo">在启动代码中切换到新仓库。</a></li>
        </list>
        <chapter title="创建数据库架构" id="create-schema">
            <procedure id="create-schema-procedure">
                <step>
                    <p>
                        使用你偏好的数据库管理工具，在 PostgreSQL 中创建一个新数据库。名称无关紧要，只要记住即可。在本例中，我们将使用 <Path>ktor_tutorial_db</Path>。
                    </p>
                    <tip>
                        <p>
                            有关 PostgreSQL 的更多信息，请参阅<a
                                href="https://www.postgresql.org/docs/current/">官方文档</a>。
                        </p>
                        <p>
                            在 IntelliJ IDEA 中，你可以利用数据库工具来<a
                                href="https://www.jetbrains.com/help/idea/postgresql.html">连接并管理你的 PostgreSQL 数据库</a>。
                        </p>
                    </tip>
                </step>
                <step>
                    <p>
                        对数据库运行以下 SQL 命令。这些命令将创建并填充数据库架构：
                    </p>
                    <code-block lang="sql" code="                        DROP TABLE IF EXISTS task;&#10;                        CREATE TABLE task(id SERIAL PRIMARY KEY, name VARCHAR(50), description VARCHAR(50), priority VARCHAR(50));&#10;&#10;                        INSERT INTO task (name, description, priority) VALUES ('cleaning', 'Clean the house', 'Low');&#10;                        INSERT INTO task (name, description, priority) VALUES ('gardening', 'Mow the lawn', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('shopping', 'Buy the groceries', 'High');&#10;                        INSERT INTO task (name, description, priority) VALUES ('painting', 'Paint the fence', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('exercising', 'Walk the dog', 'Medium');&#10;                        INSERT INTO task (name, description, priority) VALUES ('meditating', 'Contemplate the infinite', 'High');"/>
                    <p>
                        请注意以下几点：
                    </p>
                    <list>
                        <li>
                            你正在创建一个名为 <code>task</code> 的单表，其中包含 <code>name</code>、<code>description</code> 和 <code>priority</code> 列。这些列需要映射到 <code>Task</code> 类的属性。
                        </li>
                        <li>
                            如果表已存在，则会先删除再重新创建，因此你可以重复运行该脚本。
                        </li>
                        <li>
                            还有一个名为 <code>id</code> 的附加列，类型为 <code>SERIAL</code>。这将是一个整数值，用于为每一行提供其主键。这些值将由数据库代为分配。
                        </li>
                    </list>
                </step>
            </procedure>
        </chapter>
        <chapter title="改造现有仓库" id="adapt-repo">
            <procedure id="adapt-repo-procedure">
                <p>
                    对数据库执行查询时，最好异步运行以避免阻塞处理 HTTP 请求的线程。在 Kotlin 中，这最好通过<a
                        href="https://kotlinlang.org/docs/coroutines-overview.html">协程</a>来管理。
                </p>
                <step>
                    <p>
                        打开
                        <Path>src/main/kotlin/model</Path>
                        中的
                        <Path>TaskRepository.kt</Path>
                        文件。
                    </p>
                </step>
                <step>
                    <p>
                        为所有接口方法添加 <code>suspend</code> 关键字：
                    </p>
                    <code-block lang="kotlin" code="                    interface TaskRepository {&#10;                        suspend fun allTasks(): List&lt;Task&gt;&#10;                        suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;                        suspend fun taskByName(name: String): Task?&#10;                        suspend fun addTask(task: Task)&#10;                        suspend fun removeTask(name: String): Boolean&#10;                    }"/>
                    <p>
                        这将允许接口方法的实现将工作作业调度到不同的协程调度器上执行。
                    </p>
                    <p>
                        现在你需要相应调整 <code>FakeTaskRepository</code> 的方法以保持一致，不过在该实现中并不需要切换调度器。
                    </p>
                </step>
                <step>
                    <p>
                        打开
                        <Path>FakeTaskRepository.kt</Path>
                        文件并为所有方法添加 <code>suspend</code> 关键字：
                    </p>
                    <code-block lang="kotlin" code="                    class FakeTaskRepository : TaskRepository {&#10;                        //...&#10;&#10;                        override suspend fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;                        override suspend fun tasksByPriority(priority: Priority) = tasks.filter {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun taskByName(name: String) = tasks.find {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun addTask(task: Task) {&#10;                            //...&#10;                        }&#10;&#10;                        override suspend fun removeTask(name: String): Boolean {&#10;                            //...&#10;                        }&#10;                    }"/>
                    <p>
                        到目前为止，你还没有引入任何新功能。相反，你已经为创建将对数据库异步运行查询的 <code>PostgresTaskRepository</code> 奠定了基础。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="配置数据库连接" id="config-db-connection">
            <procedure id="config-db-connection-procedure">
                <p>
                    在<a href="#delete-function">本教程的第一部分</a>中，你删除了
                    <Path>Exposed.kt</Path>
                    中 <code>.configureExposed()</code> 函数内的示例代码。现在可以添加你自己的实现了。
                </p>
                <p>
                    Ktor Project Generator 尚未添加对 DAO 类型的支持，因此你首先需要在 Gradle 构建文件中添加相关依赖项。
                </p>
                <step>
                    在你的 <Path>gradle/libs.versions.toml</Path> 文件中，添加 <code>exposed-jdbc</code> 和 <code>exposed-dao</code> 库：
                    <code-block lang="kotlin" code="                        [libraries]&#10;                        exposed-jdbc = { module = &quot;org.jetbrains.exposed:exposed-jdbc&quot;, version.ref = &quot;exposed&quot; }&#10;                        exposed-dao = { module = &quot;org.jetbrains.exposed:exposed-dao&quot;, version.ref = &quot;exposed&quot; }"/>
                    这将允许你使用 Exposed 数据访问对象 (DAO) 模式。
                </step>
                <step>
                    在你的 <Path>build.gradle.kts</Path> 文件中，添加以下依赖项：
                    <code-block lang="kotlin" code="                    dependencies {&#10;                        // ...&#10;                        implementation(libs.exposed.jdbc)&#10;                        implementation(libs.exposed.dao)&#10;                    }"/>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，点击编辑器右侧的 Gradle 通知图标
                        (<img alt="intelliJ IDEA gradle 图标"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        以重新加载 Gradle 更改。</p>
                </step>
                <step>
                    打开
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>Exposed.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        使用 <code>Database.connect()</code> 函数连接到你的数据库，根据你的实际环境调整设置的值：
                    </p>
                    <code-block lang="kotlin" code="                        suspend fun Application.configureExposed() {&#10;                            Database.connect(&#10;                                &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;,&#10;                                user = &quot;postgres&quot;,&#10;                                password = &quot;password&quot;&#10;                            )&#10;                        }"/>
                    <p>请注意，<code>url</code> 包含以下组成部分：</p>
                    <list>
                        <li>
                            <code>localhost:5432</code> 是运行 PostgreSQL 数据库的主机和端口。
                        </li>
                        <li>
                            <code>ktor_tutorial_db</code> 是运行服务时创建的数据库名称。
                        </li>
                    </list>
                    <tip>
                        有关更多信息，请参阅
                        <a href="https://www.jetbrains.com/help/exposed/working-with-database.html">在 Exposed 中使用数据库</a>。
                    </tip>
                </step>
            </procedure>
        </chapter>
        <chapter title="创建对象/关系映射" id="create-mapping">
            <procedure id="create-mapping-procedure">
                <step>
                    导航至
                    <Path>src/main/kotlin</Path>
                    并新建一个名为
                    <Path>db</Path>
                    的包。
                </step>
                <step>
                    在
                    <Path>db</Path>
                    包内，新建一个
                    <Path>mapping.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        打开
                        <Path>mapping.kt</Path>
                        并添加 <code>TaskTable</code> 和 <code>TaskDAO</code> 类型：
                    </p>
                    <code-block lang="kotlin" code="package com.example.db&#10;&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}"/>
                    <p>
                        这些类型使用 Exposed 库将 <code>Task</code> 类型中的属性映射到数据库 <code>task</code> 表中的列。<code>TaskTable</code> 类型定义了基本映射，而 <code>TaskDAO</code> 类型添加了用于创建、查找、更新和删除任务的帮助程序方法。
                    </p>
                </step>
                <step>
                    <p>
                        在同一个
                        <Path>mapping.kt</Path>
                        文件中，添加以下帮助程序函数：
                    </p>
                    <code-block include-symbol="withTransaction, daoToModel"
                            lang="kotlin" code="package com.example.db&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.core.dao.id.EntityID&#10;import org.jetbrains.exposed.v1.core.dao.id.IntIdTable&#10;import org.jetbrains.exposed.v1.dao.IntEntity&#10;import org.jetbrains.exposed.v1.dao.IntEntityClass&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction&#10;&#10;object TaskTable : IntIdTable(&quot;task&quot;) {&#10;    val name = varchar(&quot;name&quot;, 50)&#10;    val description = varchar(&quot;description&quot;, 50)&#10;    val priority = varchar(&quot;priority&quot;, 50)&#10;}&#10;&#10;class TaskDAO(id: EntityID&lt;Int&gt;) : IntEntity(id) {&#10;    companion object : IntEntityClass&lt;TaskDAO&gt;(TaskTable)&#10;&#10;    var name by TaskTable.name&#10;    var description by TaskTable.description&#10;    var priority by TaskTable.priority&#10;}&#10;&#10;suspend fun &lt;T&gt; withTransaction(block: suspend JdbcTransaction.() -&gt; T): T = withContext(Dispatchers.IO) {&#10;    inTopLevelSuspendTransaction { block() }&#10;}&#10;&#10;fun daoToModel(dao: TaskDAO) = Task(&#10;    dao.name,&#10;    dao.description,&#10;    Priority.valueOf(dao.priority)&#10;)"/>
                    <list>
                        <li>
                            <code>withTransaction()</code> 函数在一个新的顶级数据库事务中运行挂起块。协程上下文被切换为 <code>Dispatchers.IO</code>，以便阻塞式的 JDBC 操作在针对 IO 任务优化的线程池上运行。
                        </li>
                        <li>
                            <code>daoToModel()</code> 函数将 <code>TaskDAO</code> 类型的实例转换为 <code>Task</code> 对象。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        添加以下缺失的导入：
                    </p>
                    <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import kotlinx.coroutines.Dispatchers&#10;import kotlinx.coroutines.withContext&#10;import org.jetbrains.exposed.v1.jdbc.JdbcTransaction&#10;import org.jetbrains.exposed.v1.jdbc.transactions.inTopLevelSuspendTransaction"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="编写新仓库" id="create-new-repo">
            <procedure id="create-new-repo-procedure">
                <p>现在你已经拥有了创建特定于数据库的仓库所需的所有资源。</p>
                <step>
                    导航至
                    <Path>src/main/kotlin/model</Path>
                    并新建一个
                    <Path>PostgresTaskRepository.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        打开
                        <Path>PostgresTaskRepository.kt</Path>
                        文件并通过以下实现创建一个新类型：
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import com.example.db.TaskDAO&#10;import com.example.db.TaskTable&#10;import com.example.db.daoToModel&#10;import com.example.db.withTransaction&#10;import org.jetbrains.exposed.v1.core.eq&#10;import org.jetbrains.exposed.v1.jdbc.deleteWhere&#10;&#10;class PostgresTaskRepository : TaskRepository {&#10;    override suspend fun allTasks(): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO.all().map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun tasksByPriority(priority: Priority): List&lt;Task&gt; = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.priority eq priority.toString()) }&#10;            .map(::daoToModel)&#10;    }&#10;&#10;    override suspend fun taskByName(name: String): Task? = withTransaction {&#10;        TaskDAO&#10;            .find { (TaskTable.name eq name) }&#10;            .limit(1)&#10;            .map(::daoToModel)&#10;            .firstOrNull()&#10;    }&#10;&#10;    override suspend fun addTask(task: Task): Unit = withTransaction {&#10;        TaskDAO.new {&#10;            name = task.name&#10;            description = task.description&#10;            priority = task.priority.toString()&#10;        }&#10;    }&#10;&#10;    override suspend fun removeTask(name: String): Boolean = withTransaction {&#10;        val rowsDeleted = TaskTable.deleteWhere {&#10;            TaskTable.name eq name&#10;        }&#10;        rowsDeleted == 1&#10;    }&#10;}"/>
                    <p>
                        在此实现中，你使用 <code>TaskDAO</code> 和 <code>TaskTable</code> 类型的帮助程序方法来与数据库进行交互。创建好这个新仓库之后，唯一剩下的任务就是在路由中切换为使用它。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="切换到新仓库" id="switch-repo">
            <procedure id="switch-repo-procedure">
                <p>要切换到外部数据库，只需更改仓库类型即可。</p>
                <step>
                    打开
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>main.kt</Path>
                    文件。
                </step>
                <step>
                    <p>
                        在 <code>Application.configureDependencies()</code> 函数中，将 <code>FakeTaskRepository</code> 替换为 <code>PostgresTaskRepository</code>：
                    </p>
                    <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.PostgresTaskRepository&#10;&#10;                    //...&#10;&#10;                    fun Application.configureDependencies() {&#10;                        dependencies {&#10;                            provide&lt;TaskRepository&gt; {&#10;                                PostgresTaskRepository()&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        由于你是通过接口注入依赖项，因此实现的切换对管理路由的代码是完全透明的。
                    </p>
                </step>
                <step>
                    <p>
                        在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="intelliJ IDEA 重新运行图标"/>) 重启应用程序。
                    </p>
                </step>
                <step>
                    导航至 <a
                        href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。UI 保持不变，但现在它是从数据库中获取数据。
                </step>
                <step>
                    <p>
                        为了验证这一点，请使用表单添加新任务，并查询 PostgreSQL 中 tasks 表所保存的数据。
                    </p>
                    <tip>
                        <p>
                            在 IntelliJ IDEA 中，你可以使用<a href="https://www.jetbrains.com/help/idea/query-consoles.html#create_console">查询控制台</a>和 <code>SELECT</code> SQL 语句来查询表格数据：
                        </p>
                        <code-block lang="SQL" code="                            SELECT * FROM task;"/>
                        <p>
                            查询后，数据应显示在
                            <ui-path>Service</ui-path>
                            窗格中，包括新增的任务：
                        </p>
                        <img src="tutorial_server_db_integration_task_table.png"
                             alt="在 IntelliJ IDEA 的 Service 窗格中显示的任务表"
                             border-effect="line"
                             width="706"/>
                    </tip>
                </step>
            </procedure>
        </chapter>
        <p>
            至此，你已成功将数据库集成到应用程序中。
        </p>
        <p>
            由于在生产代码中不再需要 <code>FakeTaskRepository</code> 类型，你可以将其移动到 <Path>src/test</Path> 中的测试源集中。
        </p>
        <p>
            最终的项目结构应如下所示：
        </p>
        <img src="tutorial_server_db_integration_src_folder.png"
             alt="IntelliJ IDEA 的 Project 视图中显示的 src 文件夹"
             border-effect="line"
             width="400"/>
    </chapter>
    <chapter title="后续步骤" id="next-steps">
        <p>
            现在你拥有了一个可与 Ktor RESTful 服务进行通信的应用程序。该服务反过来使用通过 <a href="https://github.com/JetBrains/Exposed">Exposed</a> 编写的仓库来访问 <a href="https://www.postgresql.org/docs/">PostgreSQL</a>。你还拥有<a href="#add-automated-tests">一套测试</a>，可以在无需 Web 服务器或数据库的情况下验证核心功能。
        </p>
        <p>
            该结构可以根据需要进行扩展以支持任意功能，但你可能希望先考虑设计的非功能性方面，例如容错性、安全性和可伸缩性。你可以先尝试将<a href="docker-compose.topic#extract-db-settings">数据库连接设置提取</a>到<Links href="/ktor/server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">配置文件</Links>中。
        </p>
    </chapter>
</topic>