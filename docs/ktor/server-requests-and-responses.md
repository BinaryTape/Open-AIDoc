<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 和 Kotlin 处理 HTTP 请求并生成响应" id="server-requests-and-responses">
<show-structure for="chapter,procedure" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-routing-and-requests"/>
    <p>
        <b>代码示例</b>：
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    通过构建任务管理器应用程序，学习在 Kotlin 中使用 Ktor 进行路由、处理请求和参数的基础知识。
</link-summary>
<card-summary>
    通过创建任务管理器应用程序，了解 Ktor 中路由和请求的工作原理。
</card-summary>
<web-summary>
    学习使用 Kotlin 和 Ktor 创建的服务进行验证、错误处理以及单元测试的基础知识。
</web-summary>
<p>
    在本教程中，你将通过构建一个任务管理器应用程序，学习在 Kotlin 中使用 Ktor 进行路由、处理请求和参数的基础知识。
</p>
<p>
    学完本教程后，你将掌握以下技能：
</p>
<list type="bullet">
    <li>处理 GET 和 POST 请求。</li>
    <li>从请求中提取信息。</li>
    <li>在转换数据时处理错误。</li>
    <li>使用单元测试来验证路由。</li>
</list>
<chapter title="先决条件" id="prerequisites">
    <p>
        这是“Ktor Server 入门”指南的第二个教程。你可以独立完成本教程，但我们强烈建议你先完成上一篇教程，了解如何<Links href="/ktor/server-create-a-new-project" summary="了解如何使用 Ktor 打开、运行和测试服务器应用程序。">创建、打开和运行新的 Ktor 项目</Links>。
    </p>
    <p>此外，对 HTTP 请求类型、标头（header）以及状态码有基本了解也会有所帮助。</p>
    <p>我们建议你安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a>，但也可以根据喜好选择其他 IDE。
    </p>
</chapter>
<chapter title="任务管理器应用程序" id="sample-application">
    <p>在本教程中，你将逐步构建一个具有以下功能的任务管理器应用程序：</p>
    <list type="bullet">
        <li>以 HTML 表格的形式查看所有可用任务。</li>
        <li>按优先级和名称查看任务（同样以 HTML 格式显示）。</li>
        <li>通过提交 HTML 表单添加新任务。</li>
    </list>
    <p>
        你将先以最小工作量实现一些基本功能，然后在七个迭代周期中不断改进和扩展该功能。该最小功能将由一个包含部分模型类型、值列表以及单个路由的项目组成。
    </p>
</chapter>
<chapter title="显示静态 HTML 内容" id="display-static-html">
    <p>在第一个迭代中，你将向应用程序添加一个返回静态 HTML 内容的新路由。</p>
    <p>使用 <a href="https://start.ktor.io">Ktor Project Generator</a>，创建一个新项目，将
        <control>com.example.ktor-task-app</control>
        指定为
        <control>Project artifact</control>
        名称。
    </p>
    <tip>
        有关创建新项目的更多信息，请参阅<Links href="/ktor/server-create-a-new-project" summary="了解如何使用 Ktor 打开、运行和测试服务器应用程序。">创建、打开和运行新的 Ktor 项目</Links>。如果你最近刚完成了该教程，可以随意重用在那里创建的项目。
    </tip>
    <procedure>
        <step>打开
            <Path>src/main/kotlin</Path>
            文件夹中的
            <Path>Routing.kt</Path>
            文件。
        </step>
        <step>
            <p>将现有的 <code>Application.configureRouting()</code> 函数替换为以下实现：</p>
            <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/tasks&quot;) {&#10;                                    call.respondText(&#10;                                        contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                            text = &quot;&quot;&quot;&#10;                                        &lt;h3&gt;TODO:&lt;/h3&gt;&#10;                                        &lt;ol&gt;&#10;                                            &lt;li&gt;A table of all the tasks&lt;/li&gt;&#10;                                            &lt;li&gt;A form to submit new tasks&lt;/li&gt;&#10;                                        &lt;/ol&gt;&#10;                                        &quot;&quot;&quot;.trimIndent()&#10;                                    )&#10;                                }&#10;                            }&#10;                        }"/>
            <p>这样，你就为 URL <code>/tasks</code> 和 GET 请求类型创建了一个新路由。GET 请求是 HTTP 中最基本的请求类型。当用户在浏览器地址栏中输入内容或点击普通的 HTML 链接时，就会触发该请求。</p>
            <p>
                目前，你只返回静态内容。为了通知客户端将要发送 HTML，需要将 HTTP <code>Content-Type</code> 标头设置为 <code>"text/html"</code>。
            </p>
        </step>
        <step>
            <p>
                IDE 会自动添加以下导入以访问 <code>ContentType</code> 对象：
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.http.ContentType"/>
        </step>
        <step>
            <p>在 IntelliJ IDEA 中，点击
                <Path>main.kt</Path>
                文件中 <code>main()</code> 函数旁边的运行装订区域图标（<img alt="IntelliJ IDEA run application icon"
                                                                    src="intellij_idea_gutter_icon.svg" height="16"
                                                                    width="16"/>）以启动应用程序。
            </p>
        </step>
        <step>
            <p>
                在浏览器中导航至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。你应该会看到显示的待办事项列表：
            </p>
            <img src="tutorial_routing_and_requests_implementation_1.png"
                 alt="显示包含两个项目的待办事项列表的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="实现任务模型" id="implement-a-task-model">
    <p>
        现在你已经创建了项目并设置了基本路由，接下来将通过以下步骤来扩展你的应用程序：
    </p>
    <list type="decimal">
        <li><a href="#create-model-types">创建表示任务的模型类型。</a></li>
        <li><a href="#create-sample-values">声明包含示例值的任务列表。</a></li>
        <li><a href="#add-a-route">修改路由和请求处理程序以返回此列表。</a></li>
        <li><a href="#test">使用浏览器测试新功能是否正常工作。</a></li>
    </list>
    <procedure title="创建模型类型" id="create-model-types">
        <step>
            <p>在
                <Path>src/main/kotlin</Path>
                内，创建一个名为
                <Path>model</Path>
                的新子包。
            </p>
        </step>
        <step>
            <p>在
                <Path>model</Path>
                目录中，创建一个新的
                <Path>Task.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>打开
                <Path>Task.kt</Path>
                文件，添加以下用于表示优先级的 <code>enum</code> 和表示任务的 <code>class</code>：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
        </step>
        <step>
            <p>你将在 HTML 表格中向客户端发送任务信息。在同一个 <Path>Task.kt</Path> 文件中，添加以下扩展方法：</p>
            <code-block lang="kotlin" code="                    fun Task.taskAsRow() = &quot;&quot;&quot;&#10;                        &lt;tr&gt;&#10;                            &lt;td&gt;$name&lt;/td&gt;&lt;td&gt;$description&lt;/td&gt;&lt;td&gt;$priority&lt;/td&gt;&#10;                        &lt;/tr&gt;&#10;                        &quot;&quot;&quot;.trimIndent()&#10;&#10;                    fun List&lt;Task&gt;.tasksAsTable() = this.joinToString(&#10;                        prefix = &quot;&lt;table rules=\&quot;all\&quot;&gt;&quot;,&#10;                        postfix = &quot;&lt;/table&gt;&quot;,&#10;                        separator = &quot;\n&quot;,&#10;                        transform = Task::taskAsRow&#10;                    )"/>
            <list>
                <li><code>Task.taskAsRow()</code> 函数使 <code>Task</code> 对象能够呈现为表格行。</li>
                <li><code>List&lt;Task&gt;.tasksAsTable()</code> 函数允许将任务列表呈现为表格。</li>
            </list>
        </step>
    </procedure>
    <procedure title="创建示例值" id="create-sample-values">
        <step>
            <p>在你的
                <Path>model</Path>
                目录中，创建一个新的
                <Path>TaskRepository.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>打开
                <Path>TaskRepository.kt</Path>
                并添加以下代码以定义一个 Task 列表：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )"/>
        </step>
    </procedure>
    <procedure title="添加新路由" id="add-a-route">
        <step>
            <p>打开
                <Path>Routing.kt</Path>
                文件，并将现有的 <code>Application.configureRouting()</code> 函数替换为以下实现：
            </p>
            <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                此时你不再向客户端返回静态内容，而是在提供一个任务列表。由于列表无法直接通过网络发送，因此必须将其转换为客户端能够理解的格式。在本例中，任务被转换为了 HTML 表格。
            </p>
        </step>
        <step>
            <p>添加所需的导入：</p>
            <code-block lang="kotlin" code="                    import com.example.model.*"/>
        </step>
    </procedure>
    <procedure title="测试新功能" id="test">
        <step>
            <p>在 IntelliJ IDEA 中，点击重新运行按钮（<img alt="IntelliJ IDEA rerun button icon"
                                                                 src="intellij_idea_rerun_icon.svg"
                                                                 height="16"
                                                                 width="16"/>）以重启应用程序。</p>
        </step>
        <step>
            <p>在浏览器中导航至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。页面应显示包含任务的 HTML 表格：</p>
            <img src="tutorial_routing_and_requests_implementation_2.png"
                 alt="显示包含四行内容的表格的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
            <p>如果是这样，恭喜！应用程序的基本功能已正常运行。</p>
        </step>
    </procedure>
</chapter>
<chapter title="重构模型" id="refactor-the-model">
    <p>
        在继续扩展应用的功能之前，你将通过将值列表封装在仓库中来重构设计。这将使你能够集中管理数据，从而专注于 Ktor 特定的代码。
    </p>
    <procedure>
        <step>
            <p>
                返回
                <Path>TaskRepository.kt</Path>
                文件，并将现有的任务列表替换为以下代码：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;    fun allTasks(): List&lt;Task&gt; = tasks.toList()&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if(taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
            <p>
                这实现了一个基于列表的基本任务数据存储。出于演示目的，任务添加的顺序将得到保留，但通过抛出异常来禁止重复项。</p>
            <p>在后续教程中，你将学习如何实现通过 <a href="https://github.com/JetBrains/Exposed">Exposed 库</a>连接到关系数据库的仓库。
            </p>
            <p>
                现在，你将在路由中使用该仓库。
            </p>
        </step>
        <step>
            <p>
                打开
                <Path>Routing.kt</Path>
                文件，并将现有的 <code>Application.configureRouting()</code> 函数替换为以下实现：
            </p>
            <code-block lang="Kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                val tasks = TaskRepository.allTasks()&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
            <p>
                当请求到达时，使用仓库获取当前的任务列表。然后，构建包含这些任务的 HTTP 响应。
            </p>
        </step>
    </procedure>
    <procedure title="测试重构后的代码">
        <step>
            <p>在 IntelliJ IDEA 中，点击重新运行按钮（<img alt="IntelliJ IDEA rerun button icon"
                                                                 src="intellij_idea_rerun_icon.svg" height="16"
                                                                 width="16"/>）以重启应用程序。</p>
        </step>
        <step>
            <p>
                在浏览器中导航至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。输出应该保持不变，仍显示 HTML 表格：
            </p>
            <img src="tutorial_routing_and_requests_implementation_2.png"
                 alt="显示包含四行内容的表格的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="使用参数" id="work-with-parameters">
    <p>
        在此迭代中，你将允许用户按优先级查看任务。为此，你的应用程序必须允许对以下 URL 的 GET 请求：
    </p>
    <list type="bullet">
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/Low"><code>/tasks/byPriority/Low</code></a></li>
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/Medium"><code>/tasks/byPriority/Medium</code></a></li>
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/High"><code>/tasks/byPriority/High</code></a></li>
        <li><a href="http://0.0.0.0:8080/tasks/byPriority/Vital"><code>/tasks/byPriority/Vital</code></a></li>
    </list>
    <p>
        你要添加的路由是
        <code>/tasks/byPriority/{priority?}</code>
        ，其中 <code>{priority?}</code> 表示你需要在运行时提取的路径形参，问号用于表示该形参是可选的。路径形参可以随意命名，但 <code>priority</code> 显然是最合适不过的选择。
    </p>
    <p>
        处理该请求的过程可以概括如下：
    </p>
    <list type="decimal">
        <li>从请求中提取名为 <code>priority</code> 的路径形参。</li>
        <li>如果缺少此形参，则返回 <code>400 Bad Request</code> 状态。</li>
        <li>将形参的文本值转换为 <code>Priority</code> 枚举值。</li>
        <li>如果转换失败，则返回带有 <code>400</code> 状态码的响应。</li>
        <li>使用仓库查找具有指定优先级的所有任务。</li>
        <li>如果没有匹配的任务，则返回 <code>404 Not Found</code> 状态。</li>
        <li>返回匹配的任务，格式化为 HTML 表格。</li>
    </list>
    <p>
        你将首先实现此功能，然后寻找检查其是否正常工作的最佳方式。
    </p>
    <procedure title="添加新路由">
        <p>打开
            <Path>Routing.kt</Path>
            文件并将以下路由添加到代码中：
        </p>
        <code-block lang="kotlin" code="                routing {&#10;                    get(&quot;/tasks&quot;) {&#10;                        //...&#10;                    }&#10;&#10;                    //add the following route&#10;                    get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                        val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                        if (priorityAsText == null) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                            return@get&#10;                        }&#10;&#10;                        try {&#10;                            val priority = Priority.valueOf(priorityAsText)&#10;                            val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                            if (tasks.isEmpty()) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = tasks.tasksAsTable()&#10;                            )&#10;                        } catch(ex: IllegalArgumentException) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            通过上述代码，你为 URL
            <code>/tasks/byPriority/{priority?}</code>
            编写了一个处理程序。符号
            <code>priority</code>
            表示用户添加的路径形参。不幸的是，在服务器端无法保证该参数一定是对应 Kotlin 枚举中的四个值之一，因此必须手动进行检查。
        </p>
        <p>
            如果缺少路径形参，服务器会向客户端返回 <code>400</code> 状态码。否则，它会提取形参的值并尝试将其转换为枚举成员。如果转换失败，则会抛出异常，服务器捕获该异常并返回 <code>400</code> 状态码。
        </p>
        <p>
            假设转换成功，则使用仓库查找匹配的 <code>Task</code>。如果不存在具有指定优先级的任务，服务器将返回 <code>404</code> 状态码，否则将匹配项以 HTML 表格形式返回。
        </p>
    </procedure>
    <procedure title="测试新路由">
        <p>
            你可以通过在浏览器中请求不同的 URL 来测试此功能。
        </p>
        <step>
            <p>在 IntelliJ IDEA 中，点击重新运行按钮（<img alt="IntelliJ IDEA rerun button icon"
                                                                 src="intellij_idea_rerun_icon.svg"
                                                                 height="16"
                                                                 width="16"/>）以重启应用程序。</p>
        </step>
        <step>
            <p>
                要检索所有中等优先级的任务，请导航至 <a
                    href="http://0.0.0.0:8080/tasks/byPriority/Medium">http://0.0.0.0:8080/tasks/byPriority/Medium</a>：
            </p>
            <img src="tutorial_routing_and_requests_implementation_4.png"
                 alt="显示包含中等优先级任务的表格的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
        </step>
        <step>
            <p>
                遗憾的是，在发生错误时，通过浏览器能进行的测试非常有限。除非使用开发者扩展，否则浏览器不会显示失败响应的详细信息。更简单的替代方法是使用专门的工具，例如 <a
                    href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>。
            </p>
        </step>
        <step>
            <p>
                在 Postman 中，针对相同的 URL
                <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code>
                发送一个 GET 请求。
            </p>
            <img src="tutorial_routing_and_requests_postman.png"
                 alt="Postman 中显示响应详细信息的 GET 请求"
                 border-effect="rounded"
                 width="706"/>
            <p>
                这将显示来自服务器的原始输出，以及请求和响应的所有详细信息。
            </p>
        </step>
        <step>
            <p>
                若要检查在请求重要（Vital）任务时是否返回 <code>404</code> 状态码，请向
                <code>http://0.0.0.0:8080/tasks/byPriority/Vital</code>
                发送一个新的 GET 请求。随后你将在
                <control>Response</control>
                面板的右上角看到显示的状态码。
            </p>
            <img src="tutorial_routing_and_requests_postman_vital.png"
                 alt="Postman 中显示状态码的 GET 请求"
                 border-effect="rounded"
                 width="706"/>
        </step>
        <step>
            <p>
                要验证指定无效优先级时是否返回 <code>400</code> 状态码，请使用无效属性创建另一个 GET 请求：
            </p>
            <img src="tutorial_routing_and_requests_postman_bad_request.png"
                 alt="Postman 中带有 Bad Request 状态码的 GET 请求"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="添加单元测试" id="add-unit-tests">
    <p>
        到目前为止，你已经添加了两个路由 —— 一个用于检索所有任务，另一个用于按优先级检索任务。像 Postman 这样的工具能够让你全面测试这些路由，但它们需要人工检查，并且是在 Ktor 外部运行的。
    </p>
    <p>
        这在原型设计和小型应用程序中是可以接受的。但是，这种方法无法扩展到可能需要频繁运行数千个测试的大型应用程序。更好的解决方案是实现完全自动化的测试。
    </p>
    <p>
        Ktor 提供了自己的<Links href="/ktor/server-testing" summary="了解如何使用专用测试引擎测试服务器应用程序。">测试框架</Links>以支持路由的自动化验证。接下来，你将为应用程序的现有功能编写一些测试。
    </p>
    <procedure>
        <step>
            <p>
                导航至
                <Path>src/test/kotlin</Path>
                文件夹并打开
                <Path>ServerTest.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>将以下代码添加到
                <Path>ServerTest.kt</Path>
                文件中：
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;}"/>
            <p>
                在其中的每个测试中，都会创建一个新的 Ktor 实例。它在测试环境中运行，而不是在像 Netty 这样的 Web 服务器中运行。Project Generator 为你编写的模块将被加载，进而调用路由函数。然后，你可以使用内置的 <code>client</code> 对象向应用程序发送请求，并验证返回的响应。
            </p>
            <p>
                该测试可以在 IDE 内运行，也可以作为 CI/CD 流水线的一部分运行。
            </p>
        </step>
        <step>
            <p>要在 IntelliJ IDEA 中运行测试，请点击每个测试函数旁边的装订区域图标（<img
                    alt="IntelliJ IDEA gutter icon"
                    src="intellij_idea_gutter_icon.svg"
                    width="16" height="26"/>）。</p>
            <tip>
                有关如何在 IntelliJ IDEA 中运行单元测试的更多详细信息，请参阅 <a
                    href="https://www.jetbrains.com/help/idea/performing-tests.html">IntelliJ IDEA 文档</a>。
            </tip>
        </step>
    </procedure>
</chapter>
<chapter title="处理 POST 请求" id="handle-post-requests">
    <p>
        你可以按照上述流程创建任意数量用于 GET 请求的其他路由。这些路由允许用户使用任何所需的搜索条件来获取任务。但用户可能还希望能够创建新任务。
    </p>
    <p>
        在那种情况下，合适的 HTTP 请求类型是 POST。POST 请求通常在用户填写并提交 HTML 表单时触发。
    </p>
    <p>
        与 GET 请求不同，POST 请求具有一个 <code>body</code>（请求体），其中包含表单上所有输入的名称和值。该信息经过编码以分隔来自不同输入的数据并转义非法字符。你无需担心此过程的细节，因为浏览器和 Ktor 会为我们处理好这些。
    </p>
    <p>
        接下来，你将通过以下步骤扩展现有应用程序以允许创建新任务：
    </p>
    <list type="decimal">
        <li><a href="#create-static-content">创建包含 HTML 表单的静态内容文件夹</a>。</li>
        <li><a href="#register-folder">让 Ktor 识别该文件夹，以便可以提供其内容</a>。</li>
        <li><a href="#add-form-handler">添加一个新的请求处理程序来处理表单提交</a>。</li>
        <li><a href="#test-functionality">测试已完成的功能</a>。</li>
    </list>
    <procedure title="创建静态内容" id="create-static-content">
        <step>
            <p>
                在 <Path>src/main/resources</Path> 内，创建一个名为 <Path>task-ui</Path> 的新目录。这将作为存放静态内容的文件夹。
            </p>
        </step>
        <step>
            <p>
                在
                <Path>task-ui</Path>
                文件夹内，创建一个新的
                <Path>task-form.html</Path>
                文件。
            </p>
        </step>
        <step>
            <p>打开新创建的
                <Path>task-form.html</Path>
                文件并向其中添加以下内容：
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html lang=&quot;en&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Adding a new task&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Adding a new task&lt;/h1&gt;&#10;&lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;description&quot; name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;        &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;    &lt;/div&gt;&#10;    &lt;input type=&quot;submit&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
    </procedure>
    <procedure title="在 Ktor 中注册该文件夹" id="register-folder">
        <step>
            <p>
                导航至
                <Path>src/main/kotlin</Path>
                内的
                <Path>Routing.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                在 <code>Application.configureRouting()</code> 函数中添加以下对 <code>staticResources()</code> 的调用：
            </p>
            <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            // Add the following line&#10;                            staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                // ...&#10;                            }&#10;&#10;                            get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                                //...&#10;                            }&#10;                        }&#10;                    }"/>
            <p>IDE 随后应会自动添加以下导入：</p>
            <code-block lang="kotlin" code="                    import io.ktor.server.http.content.staticResources"/>
        </step>
        <step>
            <p>重启应用程序。</p>
        </step>
        <step>
            <p>
                在浏览器中导航至 <a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>。页面应显示该 HTML 表单：
            </p>
            <img src="tutorial_routing_and_requests_implementation_6.png"
                 alt="显示 HTML 表单的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
    <procedure title="为表单添加处理程序" id="add-form-handler">
        <p>
            在 <Path>Routing.kt</Path> 文件中，将以下附加路由添加到 <code>.configureRouting()</code> 函数中：
        </p>
        <code-block lang="kotlin" code="                fun Application.configureRouting() {&#10;                    routing {&#10;                        //...&#10;&#10;                        //add the following route&#10;                        post(&quot;/tasks&quot;) {&#10;                            val formContent = call.receiveParameters()&#10;&#10;                            val params = Triple(&#10;                                formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                            )&#10;&#10;                            if (params.toList().any { it.isEmpty() }) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@post&#10;                            }&#10;&#10;                            try {&#10;                                val priority = Priority.valueOf(params.third)&#10;                                TaskRepository.addTask(&#10;                                    Task(&#10;                                        params.first,&#10;                                        params.second,&#10;                                        priority&#10;                                    )&#10;                                )&#10;&#10;                                call.respond(HttpStatusCode.NoContent)&#10;                            } catch (ex: IllegalArgumentException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            } catch (ex: IllegalStateException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
        <p>
            新路由映射到 POST 请求而不是 GET 请求。Ktor 通过调用 <code>.receiveParameters()</code> 来处理请求体。这将返回请求体中存在的参数集合。
        </p>
        <p>
            共有三个参数，因此你可以将关联的值存储在 <a
                href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/"><code>Triple</code></a> 中。如果某个参数不存在，则存储空字符串。
        </p>
        <p>
            如果任何值为空，服务器将返回带有 <code>400</code> 状态码的响应。然后，它将尝试将第三个参数转换为 <code>Priority</code>，如果成功，则在新的 <code>Task</code> 中将信息添加到仓库。这两个操作都可能引发异常，在此情况下同样会返回 <code>400</code> 状态码。
        </p>
        <p>
            否则，如果一切顺利，服务器会向客户端返回 <code>204 NoContent</code> 状态码。这表示请求已成功，但不需要返回任何新信息作为结果。
        </p>
    </procedure>
    <procedure title="测试已完成的功能" id="test-functionality">
        <step>
            <p>
                重启应用程序。
            </p>
        </step>
        <step>
            <p>在浏览器中导航至 <a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>。
            </p>
        </step>
        <step>
            <p>
                使用示例数据填写表单，然后点击
                <control>Submit</control>。
            </p>
            <img src="tutorial_routing_and_requests_iteration_6_test_1.png"
                 alt="显示包含示例数据的 HTML 表单的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
            <p>提交表单后，页面不应重定向到新页面。</p>
        </step>
        <step>
            <p>
                导航至 URL <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。你应该能看到新任务已添加。
            </p>
            <img src="tutorial_routing_and_requests_iteration_6_test_2.png"
                 alt="显示包含任务的 HTML 表格的浏览器窗口"
                 border-effect="rounded"
                 width="706"/>
        </step>
        <step>
            <p>
                为了验证该功能，请将以下测试添加到 <Path>ServerTest.kt</Path> 文件中：
            </p>
            <code-block lang="kotlin"
                        include-symbol="newTasksCanBeAdded" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        configure()&#10;&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.FormUrlEncoded.toString()&#10;            )&#10;            setBody(&#10;                listOf(&#10;                    &quot;name&quot; to &quot;swimming&quot;,&#10;                    &quot;description&quot; to &quot;Go to the beach&quot;,&#10;                    &quot;priority&quot; to &quot;Low&quot;&#10;                ).formUrlEncode()&#10;            )&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;        val body = response2.bodyAsText()&#10;&#10;        assertContains(body, &quot;swimming&quot;)&#10;        assertContains(body, &quot;Go to the beach&quot;)&#10;    }&#10;}"/>
            <p>
                在此测试中，向服务器发送了两个请求：一个用于创建新任务的 POST 请求，以及一个用于确认新任务已添加的 GET 请求。发起第一个请求时，使用 <code>setBody()</code> 函数向请求体中插入内容。测试框架在集合上提供了 <code>.formUrlEncode()</code> 扩展方法，它抽象了像浏览器那样格式化数据的过程。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="重构路由" id="refactor-the-routing">
    <p>
        如果检查目前的路由，你会发现所有路由都以 <code>/tasks</code> 开头。你可以通过将它们放入专属的子路由中来消除这种重复：
    </p>
    <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            //Code remains the same&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            //Code remains the same&#10;                        }&#10;&#10;                        post {&#10;                            //Code remains the same&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
    <p>
        如果应用程序发展到具有多个子路由的阶段，将每个子路由放入各自的帮助程序函数中会是合适的做法。不过目前尚不需要这样做。
    </p>
    <p>
        路由组织得越好，扩展起来就越容易。例如，你可以添加一个按名称查找任务的路由：
    </p>
    <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            // Code remains the same&#10;                        }&#10;                        get(&quot;/byName/{taskName}&quot;) {&#10;                            val name = call.parameters[&quot;taskName&quot;]&#10;                            if (name == null) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@get&#10;                            }&#10;&#10;                            val task = TaskRepository.taskByName(name)&#10;                            if (task == null) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = listOf(task).tasksAsTable()&#10;                            )&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            // Code remains the same&#10;                        }&#10;&#10;                        post {&#10;                            // Code remains the same&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        现在，你已经实现了基本的路由和请求处理功能。此外，还介绍了验证、错误处理和单元测试。所有这些主题都将在后续教程中进一步展开。
    </p>
    <p>
        继续阅读<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">下一篇教程</Links>，学习如何为任务管理器创建生成 JSON 文件的 RESTful API。
    </p>
</chapter>
</topic>