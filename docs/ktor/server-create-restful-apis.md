<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="如何在 Kotlin 中使用 Ktor 创建 RESTful API" id="server-create-restful-apis"
       help-id="create-restful-apis">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-restful-api"/>
    <p>
        <b>代码示例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用的插件</b>: <Links href="/ktor/server-routing" summary="路由是服务器应用程序中用于处理传入请求的核心插件。">Routing</Links>,<Links href="/ktor/server-static-content" summary="了解如何提供静态内容，例如样式表、脚本、图像等。">Static Content</Links>,
        <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有两个目的：协商客户端和服务器之间的媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>, <a
            href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
    </p>
</tldr>
<card-summary>
    了解如何使用 Ktor 构建 RESTful API。本教程涵盖了真实示例的设置、路由和测试。
</card-summary>
<web-summary>
    学习使用 Ktor 构建 Kotlin RESTful API。本教程涵盖了真实示例的设置、路由和测试。它是 Kotlin 后端开发者的理想入门教程。
</web-summary>
<link-summary>
    了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包括一个生成 JSON 文件的 RESTful API 示例。
</link-summary>
<p>
    在本教程中，我们将解释如何使用 Kotlin 和 Ktor 构建后端服务，其中包括一个生成 JSON 文件的 RESTful API 示例。
</p>
<p>
    在<Links href="/ktor/server-requests-and-responses" summary="了解如何使用 Ktor 在 Kotlin 中构建任务管理器应用程序，学习路由、处理请求和参数的基础知识。">之前的教程</Links>中，我们向你介绍了验证、错误处理和单元测试的基础知识。本教程将通过创建一个用于管理任务的 RESTful 服务来扩展这些主题。
</p>
<p>
    你将学习如何执行以下操作：
</p>
<list>
    <li>创建使用 JSON 序列化的 RESTful 服务。</li>
    <li>理解 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有两个目的：协商客户端和服务器之间的媒体类型，以及以特定格式序列化/反序列化内容。">内容协商</Links> 的过程。</li>
    <li>在 Ktor 中定义 REST API 的路由。</li>
</list>
<chapter title="先决条件" id="prerequisites">
    <p>你可以独立完成本教程，
        但是，我们强烈建议你完成之前的教程，了解如何<Links href="/ktor/server-requests-and-responses" summary="了解如何使用 Ktor 在 Kotlin 中构建任务管理器应用程序，学习路由、处理请求和参数的基础知识。">处理请求和生成响应</Links>
        。
    </p>
    <p>我们建议你安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a>，但你也可以使用你选择的其他 IDE。
    </p>
</chapter>
<chapter title="Hello RESTful 任务管理器" id="hello-restful-task-manager">
    <p>在本教程中，你将把现有的任务管理器重写为 RESTful 服务。为此，你将使用多个 Ktor <Links href="/ktor/server-plugins" summary="插件提供通用功能，例如序列化、内容编码、压缩等。">插件</Links>。</p>
    <p>
        虽然你可以手动将其添加到现有项目中，但更简单的方法是生成一个新项目，然后逐步添加之前教程中的代码。你将在过程中重复所有的代码，因此你不需要手头有之前的项目。
    </p>
    <procedure title="创建带有插件的新项目">
        <step>
            <p>
                导航到
                <a href="https://start.ktor.io/">Ktor 项目生成器</a>
                。
            </p>
        </step>
        <step>
            <p>在
                <control>项目构件</control>
                字段中，输入
                <Path>com.example.ktor-rest-task-app</Path>
                作为你的项目构件名称。
                <img src="tutorial_creating_restful_apis_project_artifact.png"
                     alt="在 Ktor 项目生成器中命名项目构件"
                     style="block"
                     border-effect="line"
                     width="706"/>
            </p>
        </step>
        <step>
            <p>
                在插件部分，通过点击
                <control>添加</control>
                按钮搜索并添加以下插件：
            </p>
            <list type="bullet">
                <li>Routing</li>
                <li>Content Negotiation</li>
                <li>Kotlinx.serialization</li>
                <li>Static Content</li>
            </list>
            <p>
                <img src="ktor_project_generator_add_plugins.gif" alt="在 Ktor 项目生成器中添加插件"
                     border-effect="line"
                     style="block"
                     width="706"/>
                添加插件后，你将看到所有
                四个插件列在项目设置下方。
                <img src="tutorial_creating_restful_apis_plugins_list.png"
                     alt="Ktor 项目生成器中的插件列表"
                     border-effect="line"
                     style="block"
                     width="706"/>
            </p>
        </step>
        <step>
            <p>
                点击
                <control>下载</control>
                按钮以生成并下载你的 Ktor 项目。
            </p>
        </step>
    </procedure>
    <procedure title="添加启动代码" id="add-starter-code">
        <step>
            <p>在 IntelliJ IDEA 中打开你的项目，如<a href="server-create-a-new-project.topic#open-explore-run">在 IntelliJ IDEA 中打开、探索并运行你的 Ktor 项目</a>教程中所述。</p>
        </step>
        <step>
            <p>
                导航到
                <Path>src/main/kotlin/com/example</Path>
                并创建一个名为
                <Path>model</Path>
                的子包。
            </p>
        </step>
        <step>
            <p>
                在<Path>model</Path>包内，创建一个新的
                <Path>Task.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                打开
                <Path>Task.kt</Path>
                文件，添加一个 <code>enum</code> 来表示优先级，以及一个 <code>class</code>
                来表示任务：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                在之前的教程中，你使用了扩展函数将 <code>Task</code> 转换为 HTML。在本例中，
                <code>Task</code> 类使用<code>kotlinx.serialization</code>库中的<a
                    href="https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/"><code>Serializable</code></a>
                类型进行了注解。
            </p>
        </step>
        <step>
            <p>
                打开
                <Path>Routing.kt</Path>
                文件，并用以下实现替换现有代码：
            </p>
            <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respond(&#10;                                    listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                与之前的教程类似，你为 URL
                <code>/tasks</code> 的 GET 请求创建了一个路由。
                这次，你不再手动转换任务列表，而是直接返回该列表。
            </p>
        </step>
        <step>
            <p>在 IntelliJ IDEA 中，点击运行按钮
                (<img src="intellij_idea_gutter_icon.svg"
                      style="inline" height="16" width="16"
                      alt="intelliJ IDEA 运行图标"/>)
                来启动应用程序。</p>
        </step>
        <step>
            <p>
                在浏览器中导航到 [http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)。你应该会看到任务列表的 JSON 版本，如下所示：
            </p>
        </step>
        <img src="tutorial_creating_restful_apis_starter_code_preview.png"
             alt="浏览器屏幕中显示的 JSON 数据"
             border-effect="rounded"
             width="706"/>
        <p>显然，有很多工作正在替我们完成。到底发生了什么？</p>
    </procedure>
</chapter>
<chapter title="理解内容协商" id="content-negotiation">
    <chapter title="通过浏览器进行内容协商" id="via-browser">
        <p>
            创建项目时，你包含了<Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有两个目的：协商客户端和服务器之间的媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>
            插件。该插件会查看客户端可以渲染的内容类型，并将其与当前服务可以提供的内容类型进行匹配。因此，得名
            <format style="italic">内容协商</format>
            。
        </p>
        <p>
            在 HTTP 中，客户端通过 <code>Accept</code> 标头表明它可以渲染哪些内容类型。此标头的值是一个或多个内容类型。在上述情况下，你可以使用浏览器内置的开发工具来检查此标头的值。
        </p>
        <p>
            考虑以下示例：
        </p>
        <code-block code="                text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"/>
        <p>请注意包含 <code>*/*</code>。此标头表示它接受 HTML、XML 或图像——但它也会接受任何其他内容
            类型。</p>
        <p>Content Negotiation 插件需要找到一种格式将数据发送回浏览器。如果你查看项目中的生成代码，你会发现<Path>src/main/kotlin/com/example</Path>目录下有一个名为<Path>Serialization.kt</Path>的文件，其中包含以下内容：
        </p>
        <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
        <p>
            此代码安装了 <code>ContentNegotiation</code> 插件，并配置了 <code>kotlinx.serialization</code>
            插件。这样，当客户端发送请求时，服务器可以发送回序列化为 JSON 的对象。
        </p>
        <p>
            在来自浏览器的请求中，<code>ContentNegotiation</code> 插件知道它只能返回 JSON，并且浏览器会尝试显示它收到的任何内容。因此请求成功。
        </p>
    </chapter>
    <procedure title="通过 JavaScript 进行内容协商" id="via-javascript">
        <p>
            在生产环境中，你不会希望直接在浏览器中显示 JSON。相反，会有 JavaScript 代码在浏览器中运行，它会发出请求，然后将返回的数据作为单页应用 (SPA) 的一部分显示出来。通常，这类应用会使用诸如 <a href="https://react.dev/">React</a>、
            <a href="https://angular.io/">Angular</a>
            或 <a href="https://vuejs.org/">Vue.js</a> 等框架编写。
        </p>
        <step>
            <p>
                为了模拟这一点，打开
                <Path>src/main/resources/static</Path>
                目录下的
                <Path>index.html</Path>
                页面，并用以下内容替换默认内容：
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function fetchAndDisplayTasks() {&#10;            fetchTasks()&#10;                .then(tasks =&gt; displayTasks(tasks))&#10;        }&#10;&#10;        function fetchTasks() {&#10;            return fetch(&#10;                &quot;/tasks&quot;,&#10;                {&#10;                    headers: { 'Accept': 'application/json' }&#10;                }&#10;            ).then(resp =&gt; resp.json());&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = document.getElementById(&quot;tasksTableBody&quot;)&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via JS&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:fetchAndDisplayTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            <p>
                此页面包含一个 HTML 表单和一个空表。提交表单后，JavaScript 事件处理程序会向 <code>/tasks</code> 端点发送请求，并将 <code>Accept</code> 标头设置为
                <code>application/json</code>。返回的数据随后被反序列化并添加到 HTML 表格中。
            </p>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA 重新运行图标"/>) 来重新启动应用程序。
            </p>
        </step>
        <step>
            <p>
                导航到 URL [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。
                你应该能够通过点击
                <control>查看任务</control>
                按钮来获取数据：
            </p>
            <img src="tutorial_creating_restful_apis_tasks_via_js.png"
                 alt="显示按钮和 HTML 表格中显示任务的浏览器窗口"
                 border-effect="line"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="添加 GET 路由" id="porting-get-routes">
    <p>
        既然你已经熟悉了内容协商的过程，接下来请继续将<Links href="/ktor/server-requests-and-responses" summary="了解如何使用 Ktor 在 Kotlin 中构建任务管理器应用程序，学习路由、处理请求和参数的基础知识。">上一个教程</Links>中的功能迁移到本教程中。
    </p>
    <chapter title="重用任务仓库" id="task-repository">
        <p>
            你可以不加修改地重用任务仓库，所以我们先来做这件事。
        </p>
        <procedure>
            <step>
                <p>
                    在<Path>model</Path>包内，创建一个新的
                    <Path>TaskRepository.kt</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>TaskRepository.kt</Path>
                    并添加以下代码：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="重用 GET 请求的路由" id="get-requests">
        <p>
            现在你已经创建了仓库，可以实现 GET 请求的路由了。之前的代码可以简化，因为你不再需要担心将任务转换为 HTML：
        </p>
        <procedure>
            <step>
                <p>
                    导航到<Path>src/main/kotlin/com/example</Path>目录下的
                    <Path>Routing.kt</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    使用以下实现更新<code>Application.configureRouting()</code>函数中<code>/tasks</code>路由的代码：
                </p>
                <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.Priority&#10;                    import com.example.model.TaskRepository&#10;                    import io.ktor.http.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            //updated implementation&#10;                            route(&quot;/tasks&quot;) {&#10;                                get {&#10;                                    val tasks = TaskRepository.allTasks()&#10;                                    call.respond(tasks)&#10;                                }&#10;&#10;                                get(&quot;/byName/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;&#10;                                    val task = TaskRepository.taskByName(name)&#10;                                    if (task == null) {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                        return@get&#10;                                    }&#10;                                    call.respond(task)&#10;                                }&#10;                                get(&quot;/byPriority/{priority}&quot;) {&#10;                                    val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                                    if (priorityAsText == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;                                    try {&#10;                                        val priority = Priority.valueOf(priorityAsText)&#10;                                        val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                                        if (tasks.isEmpty()) {&#10;                                            call.respond(HttpStatusCode.NotFound)&#10;                                            return@get&#10;                                        }&#10;                                        call.respond(tasks)&#10;                                    } catch (ex: IllegalArgumentException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    有了这个，你的服务器可以响应以下 GET 请求：</p>
                <list>
                    <li><code>/tasks</code> 返回仓库中的所有任务。</li>
                    <li><code>/tasks/byName/{taskName}</code> 返回按指定
                        <code>taskName</code> 过滤的任务。
                    </li>
                    <li><code>/tasks/byPriority/{priority}</code> 返回按指定
                        <code>priority</code> 过滤的任务。
                    </li>
                </list>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                           style="inline" height="16" width="16"
                                                           alt="intelliJ IDEA 重新运行图标"/>) 来重新启动应用程序。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="测试功能" id="test-tasks-routes">
        <procedure title="使用浏览器">
            <p>你可以在浏览器中测试这些路由。例如，导航到 [http://0.0.0.0:8080/tasks/byPriority/Medium](http://0.0.0.0:8080/tasks/byPriority/Medium)
                以 JSON 格式查看所有具有 <code>Medium</code> 优先级的任务：</p>
            <img src="tutorial_creating_restful_apis_tasks_medium_priority.png"
                 alt="显示具有 Medium 优先级任务的 JSON 格式的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
            <p>
                鉴于这些类型的请求通常来自 JavaScript，更精细的测试是更优的选择。为此，你可以使用像 <a
                    href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>
                这样的专业工具。
            </p>
        </procedure>
        <procedure title="使用 Postman">
            <step>
                <p>在 Postman 中，创建一个新的 GET 请求，URL 为
                    <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code>。</p>
            </step>
            <step>
                <p>
                    在
                    <ui-path>Headers</ui-path>
                    窗格中，将
                    <ui-path>Accept</ui-path>
                    标头的值设置为 <code>application/json</code>。
                </p>
            </step>
            <step>
                <p>点击
                    <control>发送</control>
                    以发送请求并在响应查看器中查看响应。
                </p>
                <img src="tutorial_creating_restful_apis_tasks_medium_priority_postman.png"
                     alt="Postman 中显示具有 Medium 优先级任务的 JSON 格式的 GET 请求"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
        <procedure title="使用 HTTP 请求文件">
            <p>在 IntelliJ IDEA Ultimate 中，你可以在 HTTP 请求文件中执行相同的步骤。</p>
            <step>
                <p>
                    在项目根目录中，创建一个新的
                    <Path>REST Task Manager.http</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>REST Task Manager.http</Path>
                    文件并添加以下 GET 请求：
                </p>
                <code-block lang="http" code="GET http://0.0.0.0:8080/tasks/byPriority/Medium&#10;Accept: application/json"/>
            </step>
            <step>
                <p>
                    要在 IntelliJ IDE 中发送请求，请点击其旁边的边栏图标 (<img
                        alt="intelliJ IDEA 边栏图标"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>)。
                </p>
            </step>
            <step>
                <p>这将在
                    <Path>Services</Path>
                    工具窗口中打开并运行：
                </p>
                <img src="tutorial_creating_restful_apis_tasks_medium_priority_http_file.png"
                     alt="HTTP 文件中显示具有 Medium 优先级任务的 JSON 格式的 GET 请求"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
        <note>
            另一种测试路由的方法是在 Kotlin Notebook 中使用 <a
                href="https://khttp.readthedocs.io/en/latest/">khttp</a> 库。
        </note>
    </chapter>
</chapter>
<chapter title="为 POST 请求添加路由" id="add-a-route-for-post-requests">
    <p>
        在之前的教程中，任务是通过 HTML 表单创建的。然而，由于你现在正在构建一个 RESTful 服务，你不再需要那样做。相反，你将利用 <code>kotlinx.serialization</code>
        框架，它将完成大部分繁重的工作。
    </p>
    <procedure>
        <step>
            <p>
                打开
                <Path>src/main/kotlin/com/example</Path>
                目录下的
                <Path>Routing.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                按如下方式向<code>Application.configureRouting()</code>函数添加一个新的 POST 路由：
            </p>
            <code-block lang="kotlin" code="                    //...&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            //...&#10;&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;&#10;                                //add the following new route&#10;                                post {&#10;                                    try {&#10;                                        val task = call.receive&lt;Task&gt;()&#10;                                        TaskRepository.addTask(task)&#10;                                        call.respond(HttpStatusCode.Created)&#10;                                    } catch (ex: IllegalStateException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    } catch (ex: SerializationException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                添加以下新的导入：
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.Task&#10;                    import io.ktor.serialization.*&#10;                    import io.ktor.server.request.*"/>
            <p>
                当 POST 请求发送到 <code>/tasks</code> 时，<code>kotlinx.serialization</code> 框架用于将请求正文转换为 <code>Task</code> 对象。如果成功，任务将被添加到仓库。如果反序列化过程失败，服务器将需要处理 <code>SerializationException</code>，而如果任务重复，则需要处理 <code>IllegalStateException</code>。
            </p>
        </step>
        <step>
            <p>
                重新启动应用程序。
            </p>
        </step>
        <step>
            <p>
                要在 Postman 中测试此功能，创建一个新的 POST 请求，URL 为 <code>http://0.0.0.0:8080/tasks</code>。
            </p>
        </step>
        <step>
            <p>
                在
                <ui-path>Body</ui-path>
                窗格中，添加以下 JSON 文档以表示新任务：
            </p>
            <code-block lang="json" code="{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
            <img src="tutorial_creating_restful_apis_add_task.png"
                 alt="Postman 中用于添加新任务的 POST 请求"
                 border-effect="line"
                 width="706"/>
        </step>
        <step>
            <p>点击
                <control>发送</control>
                以发送请求。
            </p>
        </step>
        <step>
            <p>
                你可以通过向 [http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)
                发送 GET 请求来验证任务是否已添加。
            </p>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA Ultimate 中，你可以通过将以下内容添加到你的 HTTP
                请求文件来执行相同的步骤：
            </p>
            <code-block lang="http" code="###&#10;&#10;POST http://0.0.0.0:8080/tasks&#10;Content-Type: application/json&#10;&#10;{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
        </step>
    </procedure>
</chapter>
<chapter title="添加移除支持" id="remove-tasks">
    <p>
        你已接近完成向服务添加基本操作。这些操作通常被概括为 CRUD 操作——即创建（Create）、读取（Read）、更新（Update）和删除（Delete）的缩写。现在你将实现删除操作。
    </p>
    <procedure>
        <step>
            <p>
                在
                <Path>TaskRepository.kt</Path>
                文件中，在 <code>TaskRepository</code> 对象中添加以下方法，以根据任务名称移除任务：
            </p>
            <code-block lang="kotlin" code="    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }"/>
        </step>
        <step>
            <p>
                打开
                <Path>Routing.kt</Path>
                文件，并在 <code>routing()</code> 函数中添加一个端点来处理 DELETE 请求：
            </p>
            <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        //...&#10;&#10;                        routing {&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;                                //add the following function&#10;                                delete(&quot;/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@delete&#10;                                    }&#10;&#10;                                    if (TaskRepository.removeTask(name)) {&#10;                                        call.respond(HttpStatusCode.NoContent)&#10;                                    } else {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
        </step>
        <step>
            <p>
                重新启动应用程序。
            </p>
        </step>
        <step>
            <p>
                将以下 DELETE 请求添加到你的 HTTP 请求文件：
            </p>
            <code-block lang="http" code="###&#10;&#10;DELETE http://0.0.0.0:8080/tasks/gardening"/>
        </step>
        <step>
            <p>
                要在 IntelliJ IDE 中发送 DELETE 请求，请点击其旁边的边栏图标 (<img
                        alt="intelliJ IDEA 边栏图标"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>)。
            </p>
        </step>
        <step>
            <p>你将在
                <Path>Services</Path>
                工具窗口中看到响应：
            </p>
            <img src="tutorial_creating_restful_apis_delete_task.png"
                 alt="HTTP 请求文件中的 DELETE 请求"
                 border-effect="line"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="使用 Ktor 客户端创建单元测试" id="create-unit-tests">
    <p>
        到目前为止，你都是手动测试应用程序，但正如你已经注意到的那样，这种方法耗时且无法扩展。相反，你可以实现<Links href="/ktor/server-testing" summary="了解如何使用专用测试引擎测试你的服务器应用程序。">JUnit 测试</Links>，使用内置的
        <code>client</code> 对象来获取和反序列化 JSON。
    </p>
    <procedure>
        <step>
            <p>
                打开
                <Path>src/test/kotlin/com/example</Path>
                目录下的
                <Path>ApplicationTest.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                用以下内容替换
                <Path>ApplicationTest.kt</Path>
                文件的内容：
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.Created, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
            <p>
                请注意，你需要将 <code>ContentNegotiation</code> 和
                <code>kotlinx.serialization</code> 插件安装到<a href="client-create-and-configure.md#plugins">插件</a>中，与你在服务器上安装的方式相同。
            </p>
        </step>
        <step>
            <p>
                将以下依赖项添加到位于
                <Path>gradle/libs.versions.toml</Path>
                的版本目录中：
            </p>
            <code-block lang="yaml" code="                    [libraries]&#10;                    # ...&#10;                    ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor-version&quot; }"/>
        </step>
        <step>
            <p>
                将新依赖项添加到你的
                <Path>build.gradle.kts</Path>
                文件：
            </p>
            <code-block lang="kotlin" code="                    testImplementation(libs.ktor.client.content.negotiation)"/>
        </step>
    </procedure>
</chapter>
<chapter title="使用 JsonPath 创建单元测试" id="unit-tests-via-jsonpath">
    <p>
        使用 Ktor 客户端或类似库测试你的服务很方便，但从质量保证 (QA) 的角度来看，它有一个缺点。服务器不直接处理 JSON，因此无法确定其对 JSON 结构的假设。
    </p>
    <p>
        例如，假设如下：
    </p>
    <list>
        <li>值存储在 <code>array</code> 中，而实际上使用了 <code>object</code>。</li>
        <li>属性存储为 <code>numbers</code>，而实际上它们是 <code>strings</code>。</li>
        <li>成员按声明顺序序列化，而实际上并非如此。</li>
    </list>
    <p>
        如果你的服务旨在供多个客户端使用，那么对 JSON
        结构有信心至关重要。为了实现这一点，请使用 Ktor 客户端从服务器检索文本，然后使用 <a href="https://mvnrepository.com/artifact/com.jayway.jsonpath/json-path">JSONPath</a>
        库分析此内容。</p>
    <procedure>
        <step>
            <p>在你的
                <Path>build.gradle.kts</Path>
                文件中，将 JSONPath 库添加到 <code>dependencies</code> 代码块：
            </p>
            <code-block lang="kotlin" code="    testImplementation(&quot;com.jayway.jsonpath:json-path:2.9.0&quot;)"/>
        </step>
        <step>
            <p>
                导航到
                <Path>src/test/kotlin/com/example</Path>
                文件夹并创建一个新的
                <Path>ApplicationJsonPathTest.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                打开
                <Path>ApplicationJsonPathTest.kt</Path>
                文件并添加以下内容：
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import com.jayway.jsonpath.DocumentContext&#10;import com.jayway.jsonpath.JsonPath&#10;import io.ktor.client.*&#10;import com.example.model.Priority&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;import io.ktor.http.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;&#10;class ApplicationJsonPathTest {&#10;    @Test&#10;    fun tasksCanBeFound() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks&quot;)&#10;&#10;        val result: List&lt;String&gt; = jsonDoc.read(&quot;$[*].name&quot;)&#10;        assertEquals(&quot;cleaning&quot;, result[0])&#10;        assertEquals(&quot;gardening&quot;, result[1])&#10;        assertEquals(&quot;shopping&quot;, result[2])&#10;    }&#10;&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        application {&#10;            module()&#10;        }&#10;        val priority = Priority.Medium&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks/byPriority/$priority&quot;)&#10;&#10;        val result: List&lt;String&gt; =&#10;            jsonDoc.read(&quot;$[?(@.priority == '$priority')].name&quot;)&#10;        assertEquals(2, result.size)&#10;&#10;        assertEquals(&quot;gardening&quot;, result[0])&#10;        assertEquals(&quot;painting&quot;, result[1])&#10;    }&#10;&#10;    suspend fun HttpClient.getAsJsonPath(url: String): DocumentContext {&#10;        val response = this.get(url) {&#10;            accept(ContentType.Application.Json)&#10;        }&#10;        return JsonPath.parse(response.bodyAsText())&#10;    }&#10;}"/>
                <p>
                    JsonPath 查询的工作方式如下：
                </p>
                <list>
                    <li>
                        <code>$[*].name</code> 表示“将文档视为一个数组，并返回每个条目的 name 属性值”。
                    </li>
                    <li>
                        <code>$[?(@.priority == '$priority')].name</code> 表示“返回数组中每个 priority 等于所提供值的条目的 name 属性值”。
                    </li>
                </list>
                <p>
                    你可以使用这些查询来确认你对返回 JSON 的理解。当你进行代码重构和服务重新部署时，即使当前的框架不会中断反序列化，序列化中的任何修改也会被识别出来。这让你能够放心地重新发布公共可用的 API。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="后续步骤" id="next-steps">
        <p>
            恭喜！你现在已经完成了为你的任务管理器应用程序创建 RESTful API 服务，并学习了使用 Ktor 客户端和 JsonPath 进行单元测试的要点。</p>
        <p>
            继续学习
            <Links href="/ktor/server-create-website" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 模板构建网站。">下一个教程</Links>
            ，了解如何重用你的 API 服务来构建一个 Web 应用程序。
        </p>
    </chapter>
</topic>