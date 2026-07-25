<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 在 Kotlin 中创建网站" id="server-create-website">
    <show-structure for="chapter,procedure" depth="3"/>
    <tldr>
        <var name="example_name" value="tutorial-server-web-application"/>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的插件</b>：<Links href="//server-static-content" summary="了解如何提供静态内容，例如样式表、脚本、图像等。">Static Content</Links>、
            <Links href="//server-thymeleaf" summary="所需的依赖项：io.ktor:%artifact_name%">Thymeleaf</Links>
        </p>
    </tldr>
    <web-summary>
        学习如何使用 Ktor 和 Kotlin 构建网站。本教程将向您展示如何将 Thymeleaf 模板与 Ktor 路由相结合，在服务器端生成基于 HTML 的用户界面。
    </web-summary>
    <card-summary>
        学习如何使用 Ktor 和 Thymeleaf 模板在 Kotlin 中构建网站。
    </card-summary>
    <link-summary>
        学习如何使用 Ktor 和 Thymeleaf 模板在 Kotlin 中构建网站。
    </link-summary>
    <p>
        在本教程中，您将学习如何使用 Kotlin 结合 Ktor 和
        <a href="https://www.thymeleaf.org/">Thymeleaf</a> 模板构建一个交互式网站。
    </p>
    <p>
        在<Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">上一篇教程</Links>中，您学习了如何创建一个 RESTful 服务，供使用 JavaScript 编写的单页应用 (SPA) 调用。虽然这种架构非常流行，但它并不适用于每个项目。
    </p>
    <p>
        出于多种原因，您可能希望将所有实现保留在服务器上，并且只向客户端发送标记，例如：
    </p>
    <list>
        <li>简单性 – 维护单一代码库。</li>
        <li>安全性 – 防止在浏览器中放置可能为攻击者提供洞察的数据或代码。
        </li>
        <li>
            可支持性 – 允许尽可能广泛的客户端使用，包括旧版浏览器和禁用 JavaScript 的浏览器。
        </li>
    </list>
    <p>
        Ktor 通过集成<Links href="//server-templating" summary="了解如何处理使用 HTML/CSS 或 JVM 模板引擎构建的视图。">多种服务器页面技术</Links>来支持这种方法。
    </p>
    <chapter title="前提条件" id="prerequisites">
        <p>
            您可以独立学习本教程，但我们强烈建议您先完成
            <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">前一篇教程</Links>以学习如何创建 RESTful API。
        </p>
        <p>我们建议您安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，但您也可以使用其他自选的 IDE。
        </p>
    </chapter>
    <chapter title="Hello Task Manager Web 应用程序" id="hello-task-manager">
        <p>
            在本教程中，您将把在<Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">上一篇教程</Links>中构建的任务管理应用程序转换为一个 Web 应用程序。为此，您将使用多个 Ktor <Links href="//server-plugins" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links>。
        </p>
        <p>
            虽然您可以手动将这些插件添加到现有项目中，但生成一个新项目并逐步合并上一篇教程中的代码会更容易。我们将全程提供所有必要的代码，因此您不需要手头备有之前的项目。
        </p>
        <procedure title="使用插件创建初始项目" id="create-project">
            <step>
                <p>
                    导航至
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>Project artifact</control>
                    字段中，输入
                    <Path>com.example.ktor-task-web-app</Path>
                    作为项目构件的名称。
                    <img src="server_create_web_app_generator_project_artifact.png"
                         alt="Ktor Project Generator 项目构件名称"
                         style="block"
                         border-effect="line" width="706"/>
                </p>
            </step>
            <step>
                <p> 在下一个屏幕中，通过点击
                    <control>Add</control>
                    按钮搜索并添加以下插件：
                </p>
                <list>
                    <li>Static Content</li>
                    <li>Thymeleaf</li>
                </list>
                <p>
                    <img src="ktor_project_generator_add_plugins.gif"
                         alt="在 Ktor Project Generator 中添加插件"
                         border-effect="line"
                         style="block"
                         width="706"/>
                    添加插件后，您将看到项目设置下方列出的所有三个插件。
                    <img src="server_create_web_app_generator_plugins.png"
                         alt="Ktor Project Generator 插件列表"
                         style="block"
                         border-effect="line" width="706"/>
                </p>
            </step>
            <step>
                <p>
                    点击
                    <control>Download</control>
                    按钮以生成并下载您的 Ktor 项目。
                </p>
            </step>
        </procedure>
        <procedure title="添加入门代码" id="add-starter-code">
            <step>
                在 IntelliJ IDEA 或其他自选 IDE 中打开您的项目。
            </step>
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
                包内，创建一个新的
                <Path>Task.kt</Path>
                文件。
            </step>
            <step>
                <p>
                    在
                    <Path>Task.kt</Path>
                    文件中，添加一个 <code>enum</code> 来表示优先级，以及一个 <code>data class</code> 来表示任务：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    再一次地，您需要创建 <code>Task</code> 对象，并以可以显示的形式将其发送给客户端。
                </p>
                <p>
                    您可能还记得：
                </p>
                <list>
                    <li>
                        在<Links href="//server-requests-and-responses" summary="通过构建任务管理器应用程序，学习使用 Ktor 进行 Kotlin 路由、处理请求和参数的基础知识。">处理请求并生成响应</Links>教程中，您添加了手写的扩展函数来将任务转换为 HTML。
                    </li>
                    <li>
                        在<Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links>教程中，您使用 <code>kotlinx.serialization</code> 库中的 <code>Serializable</code> 类型注解了 <code>Task</code> 类。
                    </li>
                </list>
                <p>
                    在这种情况下，目标是创建一个服务器页面，将任务内容写入浏览器。
                </p>
            </step>
            <step>
                打开位于
                <Path>src/main/kotlin</Path>
                中的
                <Path>Routing.kt</Path>
                文件。
            </step>
            <step>
                <p>
                    在 <code>.configureRouting()</code> 函数中，按如下所示为 <code>/tasks</code> 添加一个路由：
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        // 添加此额外路由&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}"/>
                <p>
                    当服务器收到对 <code>/tasks</code> 的请求时，它会创建一个任务列表，然后将其传递给 Thymeleaf 模板。<code>ThymeleafContent</code> 类型接收要触发的模板名称，以及一个要在页面上访问的值表。
                </p>
            </step>
            <step>
                打开位于
                <Path>src/main/kotlin</Path>
                中的
                <Path>Thymeleaf.kt</Path>
                文件。
            </step>
            <step>
                <p>您应该看到以下 <code>.configureThymeleaf</code> 函数：</p>
                <code-block lang="kotlin" code="fun Application.configureThymeleaf() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;}"/>
                <p>
                    在 Thymeleaf 插件的初始化过程中，Ktor 会在
                    <Path>templates/thymeleaf</Path>
                    文件夹中查找服务器页面。与静态内容一样，它预期此文件夹位于
                    <Path>resources</Path>
                    目录中。它还预期一个
                    <Path>.html</Path>
                    后缀。
                </p>
                <p>
                    在这种情况下，名称 <code>all-tasks</code> 映射到路径
                    <code>src/main/resources/templates/thymeleaf/all-tasks.html</code>
                </p>
            </step>
            <step>
                导航至 <Path>src/main/resources</Path>
                并创建一个新的 <Path>templates/thymeleaf</Path>
                目录。
            </step>
            <step>
                在
                <Path>src/main/resources/templates/thymeleaf</Path>
                中，创建一个新的
                <Path>all-tasks.html</Path>
                文件。
            </step>
            <step>
                <p>打开
                    <Path>all-tasks.html</Path>
                    文件并添加以下内容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;All Current Tasks&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，点击运行按钮
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="IntelliJ IDEA 运行图标"/>)
                    以启动应用程序。</p>
            </step>
            <step>
                <p>
                    在浏览器中导航至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。您应该会看到显示在表格中的所有当前任务，如下所示：
                </p>
                <img src="server_create_web_app_all_tasks.png"
                     alt="显示任务列表的 Web 浏览器窗口" border-effect="rounded" width="706"/>
                <p>
                    与所有服务器页面框架一样，Thymeleaf 模板将静态内容（发送到浏览器）与动态内容（在服务器上执行）混合在一起。如果您选择了其他框架，例如 <a href="https://freemarker.apache.org/">Freemarker</a>，您也可以使用稍有不同的语法提供相同的功能。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="添加 GET 路由" id="add-get-routes">
        <p>既然您已经熟悉了请求服务器页面的过程，请继续将之前教程中的功能转移到本教程中。</p>
        <p>因为您包含了
            <control>Static Content</control>
            插件，所以以下代码将存在于
            <Path>Routing.kt</Path>
            文件中：
        </p>
        <code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
        <p>
            这意味着，例如，对 <code>/static/index.html</code> 的请求将由以下路径提供内容：
        </p>
        <code>src/main/resources/static/index.html</code>
        <p>
            由于此文件已经是生成的项目的一部分，您可以将其用作您希望添加的功能的主页。
        </p>
        <procedure title="复用索引页">
            <step>
                <p>
                    打开
                    <Path>src/main/resources/static</Path>
                    中的
                    <Path>index.html</Path>
                    文件，并将其内容替换为以下实现：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Task Manager Web Application&lt;/h1&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;&lt;a href=&quot;/tasks&quot;&gt;View all the tasks&lt;/a&gt;&lt;/h3&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View tasks by priority&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byPriority&quot;&gt;&#10;        &lt;select name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View a task by name&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byName&quot;&gt;&#10;        &lt;input type=&quot;text&quot; name=&quot;name&quot; width=&quot;10&quot;&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create or edit a task&lt;/h3&gt;&#10;    &lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;description&quot;&#10;                   name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新运行图标"/>) 以重新启动应用程序。
                </p>
            </step>
            <step>
                <p>
                    在浏览器中导航至 <a href="http://localhost:8080/static/index.html">http://localhost:8080/static/index.html</a>。您应该会看到一个链接按钮和三个 HTML 表单，允许您查看、筛选和创建任务：
                </p>
                <img src="server_create_web_app_tasks_form.png"
                     alt="显示 HTML 表单的 Web 浏览器" border-effect="rounded" width="706"/>
                <p>
                    请注意，当您按 <code>name</code> 或 <code>priority</code> 筛选任务时，您是在通过 GET 请求提交 HTML 表单。这意味着参数会被添加到 URL 之后的查询字符串中。
                </p>
                <p>
                    例如，如果您搜索 <code>Medium</code> 优先级的任务，发送到服务器的请求如下所示：
                </p>
                <code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
            </step>
        </procedure>
        <procedure title="复用任务仓库" id="task-repository">
            <p>
                任务的仓库可以保持与上一个教程中的完全一致。
            </p>
            <p>
                在
                <Path>model</Path>
                包内创建一个新的
                <Path>TaskRepository.kt</Path>
                文件并添加以下代码：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&&#10;        tasks.add(task)&#10;    }&#10;}"/>
        </procedure>
        <procedure title="复用 GET 请求的路由" id="reuse-routes">
            <p>
                既然已经创建了仓库，您就可以实现 GET 请求的路由了。
            </p>
            <step>
                导航至位于
                <Path>src/main/kotlin</Path>
                中的
                <Path>Routing.kt</Path>
                文件。
            </step>
            <step>
                <p>
                    将当前版本的 <code>.configureRouting()</code> 替换为以下实现：
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    上述代码可以概括如下：
                </p>
                <list>
                    <li>
                        在对 <code>/tasks</code> 的 GET 请求中，服务器从仓库中检索所有任务，并使用
                        <Path>all-tasks</Path>
                        模板生成发送到浏览器的下一个视图。
                    </li>
                    <li>
                        在对 <code>/tasks/byName</code> 的 GET 请求中，服务器从 <code>queryString</code> 中检索参数 <code>name</code>，找到匹配的任务，并使用
                        <Path>single-task</Path>
                        模板生成发送到浏览器的下一个视图。
                    </li>
                    <li>
                        在对 <code>/tasks/byPriority</code> 的 GET 请求中，服务器从 <code>queryString</code> 中检索参数 <code>priority</code>，找到匹配的任务，并使用
                        <Path>tasks-by-priority</Path>
                        模板生成发送到浏览器的下一个视图。
                    </li>
                </list>
                <p>为了让所有这些正常工作，您需要添加额外的模板。</p>
            </step>
            <step>
                导航至
                <Path>src/main/resources/templates/thymeleaf</Path>
                并创建一个新的
                <Path>single-task.html</Path>
                文件。
            </step>
            <step>
                <p>
                    打开
                    <Path>single-task.html</Path>
                    文件并添加以下内容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;The Selected Task&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>在同一个文件夹中，创建一个名为
                    <Path>tasks-by-priority.html</Path>
                    的新文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>tasks-by-priority.html</Path>
                    文件并添加以下内容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Tasks By Priority &lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Tasks With Priority &lt;span th:text=&quot;${priority}&quot;&gt;&lt;/span&gt;&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="添加对 POST 请求的支持" id="add-post-requests">
        <p>
            接下来，您将向 <code>/tasks</code> 添加一个 POST 请求处理程序，以执行以下操作：
        </p>
        <list>
            <li>从表单参数中提取信息。</li>
            <li>使用仓库添加一个新任务。</li>
            <li>通过复用
                <control>all-tasks</control>
                模板来显示任务。
            </li>
        </list>
        <procedure>
            <step>
                导航至位于
                <Path>src/main/kotlin</Path>
                中的
                <Path>Routing.kt</Path>
                文件。
            </step>
            <step>
                <p>
                    在 <code>.configureRouting()</code> 方法中添加以下 <code>post</code> 请求路由：
                </p>
                <code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新运行图标"/>) 以重新启动应用程序。
                </p>
            </step>
            <step>
                在浏览器中导航至 <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。
            </step>
            <step>
                <p>
                    在
                    <control>Create or edit a task</control>
                    表单中输入新任务详情。
                </p>
                <img src="server_create_web_app_new_task.png"
                     alt="显示 HTML 表单的 Web 浏览器" border-effect="rounded" width="706"/>
            </step>
            <step>
                <p>点击
                    <control>Submit</control>
                    按钮提交表单。
                    然后，您将看到新任务显示在所有任务的列表中：
                </p>
                <img src="server_create_web_app_new_task_added.png"
                     alt="显示任务列表的 Web 浏览器" border-effect="rounded" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="下一步" id="next-steps">
        <p>
            恭喜！您现在已完成将任务管理器重新构建为 Web 应用程序，并学习了如何使用 Thymeleaf 模板。</p>
        <p>
            继续阅读<Links href="//server-create-websocket-application" summary="了解如何利用 WebSockets 的强大功能发送和接收内容。">下一篇教程</Links>，学习如何处理 WebSockets。
        </p>
    </chapter>
</topic>