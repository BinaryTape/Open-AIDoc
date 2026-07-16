<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 在 Kotlin 中创建网站" id="server-create-website">
<tldr>
        <var name="example_name" value="tutorial-server-web-application"/>
        <p>
            <b>代码示例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>所用插件</b>: <Links href="/ktor/server-routing" summary="路由是服务器应用程序中用于处理传入请求的核心插件。">Routing</Links>,
            <Links href="/ktor/server-static-content" summary="了解如何提供静态内容，例如样式表、脚本、图像等。">Static Content</Links>,
            <Links href="/ktor/server-thymeleaf" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✖️">Thymeleaf</Links>
        </p>
</tldr>
<web-summary>
        了解如何使用 Ktor 和 Kotlin 构建网站。本教程将向你展示如何将 Thymeleaf 模板与 Ktor 路由结合，在服务器端生成基于 HTML 的用户界面。
</web-summary>
<card-summary>
        了解如何使用 Ktor 和 Thymeleaf 模板在 Kotlin 中构建网站。
</card-summary>
<link-summary>
        了解如何使用 Ktor 和 Thymeleaf 模板在 Kotlin 中构建网站。
</link-summary>
<p>
    在本教程中，我们将向你展示如何使用 Ktor 和
    <a href="https://www.thymeleaf.org/">Thymeleaf</a> 模板在 Kotlin 中构建交互式网站。
</p>
<p>
    在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">上一教程</Links>中，你学习了如何创建 RESTful 服务，我们假设该服务将由用 JavaScript 编写的单页应用程序 (SPA) 使用。尽管这是一种非常流行的架构，但它并不适合所有<project>项目</project>。
</p>
<p>
    你可能希望将所有实现保留在服务器端，并且只向客户端发送标记，原因有很多，例如：
</p>
<list>
    <li>简洁性 - 维护单一代码库。</li>
    <li>安全性 - 防止将可能为攻击者提供洞察力的数据或代码放置到浏览器上。
    </li>
    <li>
        可支持性 - 允许客户端使用尽可能广泛的客户端，包括旧版浏览器和禁用 JavaScript 的客户端。
    </li>
</list>
<p>
    Ktor 通过与<Links href="/ktor/server-templating" summary="了解如何使用 HTML/CSS 或 JVM 模板引擎构建视图。">多种服务器页面技术</Links>集成来支持这种方法。
</p>
<chapter title="先决条件" id="prerequisites">
    <p>
        你可以独立完成本教程，但是，我们强烈建议你完成<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">前一个教程</Links>，以学习如何创建 RESTful API。
    </p>
    <p>我们建议你安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a>，但你也可以使用其他你选择的 IDE。
    </p>
</chapter>
<chapter title="Hello 任务管理器 Web 应用程序" id="hello-task-manager">
    <p>
        在本教程中，你将把在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">上一教程</Links>中构建的“任务管理器”转换为 Web
        应用程序。为此，你将使用多个 Ktor <Links href="/ktor/server-plugins" summary="插件提供常见功能，例如序列化、内容编码、压缩等。">插件</Links>。
    </p>
    <p>
        尽管你可以手动将这些插件添加到现有<project>项目</project>中，但生成一个新<project>项目</project>并逐步整合上一教程中的代码会更容易。我们将在整个过程中提供所有必要的代码，因此你无需手边拥有之前的<project>项目</project>。
    </p>
    <procedure title="创建带插件的初始项目" id="create-project">
        <step>
            <p>
                导航到
                <a href="https://start.ktor.io/">Ktor 项目生成器</a>
                。
            </p>
        </step>
        <step>
            <p>
                在
                <control>项目 artifact</control>
                字段中，输入
                <Path>com.example.ktor-task-web-app</Path>
                作为你的<project>项目</project> artifact 名称。
                <img src="server_create_web_app_generator_project_artifact.png"
                     alt="Ktor 项目生成器项目 artifact 名称"
                     style="block"
                     border-effect="line" width="706"/>
            </p>
        </step>
        <step>
            <p> 在下一个屏幕中，点击 <control>添加</control> 按钮，搜索并添加以下插件：
            </p>
            <list>
                <li>Routing</li>
                <li>Static Content</li>
                <li>Thymeleaf</li>
            </list>
            <p>
                <img src="ktor_project_generator_add_plugins.gif"
                     alt="在 Ktor 项目生成器中添加插件"
                     border-effect="line"
                     style="block"
                     width="706"/>
                一旦你添加了这些插件，你将看到所有
                三个插件都列在<project>项目</project>设置下方。
                <img src="server_create_web_app_generator_plugins.png"
                     alt="Ktor 项目生成器插件列表"
                     style="block"
                     border-effect="line" width="706"/>
            </p>
        </step>
        <step>
            <p>
                点击
                <control>下载</control>
                按钮以生成并下载你的 Ktor <project>项目</project>。
            </p>
        </step>
    </procedure>
    <procedure title="添加启动代码" id="add-starter-code">
        <step>
            打开你的<project>项目</project>，使用 IntelliJ IDEA 或其他你选择的 IDE。
        </step>
        <step>
            导航到
            <Path>src/main/kotlin/com/example</Path>
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
                文件中，添加一个 <code>enum</code> 来表示优先级，以及一个 <code>data class</code> 来表示<task>任务</task>：
            </p>
            <code-block lang="kotlin" code="enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                同样，我们希望创建 <code>Task</code> 对象并以可显示的形式将其发送给客户端。
            </p>
            <p>
                你可能记得：
            </p>
            <list>
                <li>
                    在<Links href="/ktor/server-requests-and-responses" summary="学习如何使用 Kotlin 和 Ktor 构建任务管理器应用程序，从而了解路由、请求处理和形参的基础知识。">处理请求和生成响应</Links>
                    教程中，我们添加了手写的<extension>扩展</extension><function>函数</function>来将<task>任务</task>转换为 HTML。
                </li>
                <li>
                    在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links>教程中，我们使用
                    <code>kotlinx.serialization</code> 库中的 <code>Serializable</code> 类型标注了
                    <code>Task</code> 类。
                </li>
            </list>
            <p>
                在这种情况下，我们的目标是创建一个服务器页面，能够将<task>任务</task>的内容写入浏览器。
            </p>
        </step>
        <step>
            打开
            <Path>plugins</Path>
            包内的
            <Path>Templating.kt</Path>
            文件。
        </step>
        <step>
            <p>
                在 <code>configureTemplating()</code> <method>方法</method>中，添加一个 <code>/tasks</code> 的路由，如下所示：
            </p>
            <code-block lang="kotlin" code="fun Application.configureTemplating() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;    routing {&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&#10;                &quot;index&quot;,&#10;                mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))&#10;            ))&#10;        }&#10;        // 这是要添加的额外路由&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;    }&#10;}"/>
            <p>
                当服务器收到 <code>/tasks</code> 的请求时，它会创建一个<task>任务</task>的 <list>list</list>，然后将其传递给 Thymeleaf 模板。<code>ThymeleafContent</code> 类型接受我们希望触发的模板名称以及我们希望在页面上可访问的值表。
            </p>
            <p>
                在<method>方法</method>顶部的 Thymeleaf 插件初始化中，你可以看到 Ktor 会在
                <Path>templates/thymeleaf</Path>
                中查找服务器页面。与静态内容一样，它会期望此文件夹位于
                <Path>resources</Path>
                目录中。它还将期望使用
                <Path>.html</Path>
                后缀。
            </p>
            <p>
                在这种情况下，名称 <code>all-tasks</code> 将映射到路径
                <code>src/main/resources/templates/thymeleaf/all-tasks.html</code>
            </p>
        </step>
        <step>
            导航到
            <Path>src/main/resources/templates/thymeleaf</Path>
            并创建一个新的
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
                来启动<application>应用程序</application>。</p>
        </step>
        <step>
            <p>
                在浏览器中导航到 [http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)。你应该会看到所有当前<task>任务</task>以表格形式显示，如下所示：
            </p>
            <img src="server_create_web_app_all_tasks.png"
                 alt="显示任务 list 的 Web 浏览器窗口" border-effect="rounded" width="706"/>
            <p>
                像所有服务器页面<framework>框架</framework>一样，Thymeleaf 模板将静态内容（发送到浏览器）与动态内容（在服务器上执行）混合。如果我们选择了替代<framework>框架</framework>，例如 <a href="https://freemarker.apache.org/">Freemarker</a>，我们本可以以稍微不同的语法提供相同的<functionality>功能</functionality>。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="添加 GET 路由" id="add-get-routes">
    <p>既然你熟悉了请求服务器页面的过程，接下来将之前教程中的<functionality>功能</functionality>转移到本教程中。</p>
    <p>因为你包含了
        <control>Static Content</control>
        插件，以下代码将出现在
        <Path>Routing.kt</Path>
        文件中：
    </p>
    <code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
    <p>
        这意味着，例如，对 <code>/static/index.html</code> 的请求将从以下路径提供内容：
    </p>
    <code>src/main/resources/static/index.html</code>
    <p>
        由于此文件已是生成的<project>项目</project>的一部分，你可以将其用作要添加的<functionality>功能</functionality>的主页。
    </p>
    <procedure title="复用索引页">
        <step>
            <p>
                打开
                <Path>src/main/resources/static</Path>
                目录下的
                <Path>index.html</Path>
                文件，并将其内容替换为以下实现：
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Task Manager Web Application&lt;/h1&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;&lt;a href=&quot;/tasks&quot;&gt;View all the tasks&lt;/a&gt;&lt;/h3&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View tasks by priority&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byPriority&quot;&gt;&#10;        &lt;select name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View a task by name&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byName&quot;&gt;&#10;        &lt;input type=&quot;text&quot; name=&quot;name&quot; width=&quot;10&quot;&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create or edit a task&lt;/h3&gt;&#10;    &lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;description&quot;&#10;                   name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="IntelliJ IDEA 重新运行图标"/>) 以重启<application>应用程序</application>。
            </p>
        </step>
        <step>
            <p>
                在浏览器中导航到 [http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)。你应该会看到一个链接按钮和三个 HTML 表单，它们允许你查看、过滤和创建<task>任务</task>：
            </p>
            <img src="server_create_web_app_tasks_form.png"
                 alt="显示 HTML 表单的 Web 浏览器" border-effect="rounded" width="706"/>
            <p>
                请注意，当你按 <code>name</code> 或 <code>priority</code> 过滤<task>任务</task>时，你是通过 GET 请求提交 HTML 表单。这意味着<parameter>形参</parameter>将添加到 URL 后的查询字符串中。
            </p>
            <p>
                例如，如果你搜索 <code>Medium</code> 优先级的<task>任务</task>，这将是发送到服务器的请求：
            </p>
            <code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
        </step>
    </procedure>
    <procedure title="复用 TaskRepository" id="task-repository">
        <p>
            <task>任务</task>的<repository>版本库</repository>可以与上一教程中的保持一致。
        </p>
        <p>
            在
            <Path>model</Path>
            包内，创建一个新的
            <Path>TaskRepository.kt</Path>
            文件并添加以下代码：
        </p>
        <code-block lang="kotlin" code="object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
    </procedure>
    <procedure title="复用 GET 请求的路由" id="reuse-routes">
        <p>
            现在你已经创建了<repository>版本库</repository>，你可以实现 GET 请求的路由了。
        </p>
        <step>
            导航到
            <Path>src/main/kotlin/com/example/plugins</Path>
            中的
            <Path>Templating.kt</Path>
            文件。
        </step>
        <step>
            <p>
                将当前版本的 <code>configureTemplating()</code> 替换为以下实现：
            </p>
            <code-block lang="kotlin" code="fun Application.configureTemplating() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                上述代码可总结如下：
            </p>
            <list>
                <li>
                    在对 <code>/tasks</code> 的 GET 请求中，服务器从<repository>版本库</repository>中检索所有<task>任务</task>，并使用
                    <Path>all-tasks</Path>
                    模板生成发送到浏览器的下一个视图。
                </li>
                <li>
                    在对 <code>/tasks/byName</code> 的 GET 请求中，服务器从
                    <code>queryString</code> 中检索<parameter>形参</parameter>
                    <code>taskName</code>，找到匹配的<task>任务</task>，并使用
                    <Path>single-task</Path>
                    模板生成发送到浏览器的下一个视图。
                </li>
                <li>
                    在对 <code>/tasks/byPriority</code> 的 GET 请求中，服务器从
                    <code>queryString</code> 中检索<parameter>形参</parameter>
                    <code>priority</code>，找到匹配的<task>任务</task>，并使用
                    <Path>tasks-by-priority</Path>
                    模板生成发送到浏览器的下一个视图。
                </li>
            </list>
            <p>为了使所有这些都正常工作，你需要添加额外的模板。</p>
        </step>
        <step>
            导航到
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
            <p>在同一个文件夹中，创建一个新文件叫
                <Path>tasks-by-priority.html</Path>
                。
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
        接下来，你将向 <code>/tasks</code> 添加一个 POST 请求处理程序，以执行以下操作：
    </p>
    <list>
        <li>从表单<parameter>形参</parameter>中提取信息。</li>
        <li>使用<repository>版本库</repository>添加新<task>任务</task>。</li>
        <li>通过复用
            <control>all-tasks</control>
            模板来显示<task>任务</task>。
        </li>
    </list>
    <procedure>
        <step>
            导航到
            <Path>src/main/kotlin/com/example/plugins</Path>
            中的
            <Path>Templating.kt</Path>
            文件。
        </step>
        <step>
            <p>
                在 <code>configureTemplating()</code> <method>方法</method>中添加以下 <code>post</code> 请求路由：
            </p>
            <code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="IntelliJ IDEA 重新运行图标"/>) 以重启<application>应用程序</application>。
            </p>
        </step>
        <step>
            导航到 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。
        </step>
        <step>
            <p>
                在
                <control>创建或编辑任务</control>
                表单中输入新的<task>任务</task>详细信息。
            </p>
            <img src="server_create_web_app_new_task.png"
                 alt="显示 HTML 表单的 Web 浏览器" border-effect="rounded" width="706"/>
        </step>
        <step>
            <p>点击
                <control>提交</control>
                按钮以提交表单。
                然后你将看到新<task>任务</task>显示在所有<task>任务</task>的 <list>list</list> 中：
            </p>
            <img src="server_create_web_app_new_task_added.png"
                 alt="显示任务 list 的 Web 浏览器" border-effect="rounded" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        恭喜！你现在已经完成了将<task>任务</task>管理器重建为 Web 应用程序，并学习了如何利用 Thymeleaf 模板。</p>
    <p>
        继续阅读<Links href="/ktor/server-create-websocket-application" summary="学习如何利用 WebSockets 的强大功能来发送和接收内容。">下一教程</Links>，了解如何使用 Web Sockets。
    </p>
</chapter>
</topic>