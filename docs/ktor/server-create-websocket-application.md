<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="在 Kotlin 中使用 Ktor 创建 WebSocket 应用程序" id="server-create-websocket-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-websockets"/>
    <p>
        <b>代码示例</b>：
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用的插件</b>：<Links href="//server-static-content" summary="了解如何提供静态内容，如样式表、脚本、图像等。">Static Content</Links>、
        <Links href="//server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>、<Links href="//server-websockets" summary="Websockets 插件允许您在服务器和客户端之间创建多路通信会话。">Ktor Server 中的 WebSockets</Links>、
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
    </p>
</tldr>
<card-summary>
    了解如何利用 WebSockets 的强大功能来发送和接收内容。
</card-summary>
<link-summary>
    了解如何利用 WebSockets 的强大功能来发送和接收内容。
</link-summary>
<web-summary>
    了解如何在 Kotlin 中使用 Ktor 构建 WebSocket 应用程序。本教程将引导您完成通过 WebSockets 将后端服务与客户端连接的过程。
</web-summary>
<p>
    本文将指导您如何在 Kotlin 中使用 Ktor 创建 WebSocket 应用程序。它基于 <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 教程中的材料。
</p>
<p>本文将教您如何执行以下操作：</p>
<list>
    <li>创建使用 JSON 序列化的服务。</li>
    <li>通过 WebSocket 连接发送和接收内容。</li>
    <li>同时向多个客户端广播内容。</li>
</list>
<chapter title="先决条件" id="prerequisites">
    <p>您可以独立完成本教程，但我们建议您先完成
        <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 教程，以熟悉 <Links href="//server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">内容协商</Links> 和 REST。
    </p>
    <p>我们建议您安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a>，但您也可以使用其他您喜欢的 IDE。
    </p>
</chapter>
<chapter title="你好 WebSockets" id="hello-websockets">
    <p>
        在本教程中，您将通过添加通过 WebSocket 连接与客户端交换 <code>Task</code> 对象的功能，扩展在 <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 教程中开发的任务管理器服务。为此，您需要添加 <Links href="//server-websockets" summary="Websockets 插件允许您在服务器和客户端之间创建多路通信会话。">WebSockets 插件</Links>。虽然您可以手动将其添加到现有项目中，但为了本教程起见，您将从头开始创建一个新项目。
    </p>
    <chapter title="创建带有插件的初始项目" id="create=project">
        <procedure>
            <step>
                <p>
                    导航至
                    <a href="https://start.ktor.io/">Ktor 项目生成器</a>。
                </p>
            </step>
            <step>
                <p>在
                    <control>Project artifact</control>
                    字段中，输入
                    <Path>com.example.ktor-websockets-task-app</Path>
                    作为项目工件的名称。
                    <img src="tutorial_server_websockets_project_artifact.png"
                         alt="在 Ktor 项目生成器中命名项目工件"
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
                    <li>WebSockets</li>
                    <li>Static Content</li>
                </list>
                <p>
                    <img src="ktor_project_generator_add_plugins.gif"
                         alt="在 Ktor 项目生成器中添加插件"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    添加插件后，它们将显示在插件部分的右上角。
                </p>
                <p>然后您将看到将添加到项目中的所有插件列表：
                    <img src="tutorial_server_websockets_project_plugins.png"
                         alt="Ktor 项目生成器中的插件列表"
                         border-effect="line"
                         style="block"
                         width="706"/>
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
    </chapter>
    <chapter title="添加起始代码" id="add-starter-code">
        <p>下载完成后，在 IntelliJ IDEA 中打开您的项目并按照以下步骤操作：</p>
        <procedure>
            <step>
                导航至
                <Path>src/main/kotlin</Path>
                并创建一个名为
                <Path>model</Path>
                的新子软件包。
            </step>
            <step>
                <p>
                    在
                    <Path>model</Path>
                    软件包内创建一个新的
                    <Path>Task.kt</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>Task.kt</Path>
                    文件并添加一个 <code>enum</code> 来表示优先级，以及一个 <code>data class</code> 来表示任务：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    请注意，<code>Task</code> 类使用了来自 <code>kotlinx.serialization</code> 库的 <code>Serializable</code> 注解。这意味着实例可以转换为 JSON 以及从 JSON 转换，从而允许通过网络传输其内容。
                </p>
                <p>
                    因为您包含了 WebSockets 插件，生成器已经在
                    <Path>src/main/kotlin</Path>
                    目录下的
                    <Path>Websockets.kt</Path>
                    文件中添加了配置，并在
                    <Path>Routing.kt</Path> 文件中添加了 <code>webSocket</code> 路由。
                </p>
            </step>
            <step>
                打开
                <Path>Websockets.kt</Path>
                文件，并将现有的 <code>.configureWebsockets()</code> 函数替换为以下内容：
                <code-block lang="kotlin" code="                        fun Application.configureWebsockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;                        }"/>
                <list>
                    <li>安装 WebSockets 插件并使用标准设置进行配置。</li>
                    <li>设置了 <code>contentConverter</code> 属性，使插件能够通过 <a
                                href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a> 库对发送和接收的对象进行序列化。
                    </li>
                </list>
            </step>
            <step>
                <p>
                    打开
                    <Path>Routing.kt</Path>
                    文件，并将现有的 <code>Application.configureRouting()</code> 函数替换为下面的实现：
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            webSocket(&quot;/tasks&quot;) {&#10;                                val tasks = listOf(&#10;                                    Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                    Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                    Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                    Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                )&#10;&#10;                                for (task in tasks) {&#10;                                    sendSerialized(task)&#10;                                    delay(1000.milliseconds)&#10;                                }&#10;&#10;                                close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                            }&#10;                            staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;                        }&#10;                    }"/>
                <list>
                    <li>路由配置了一个单一端点，其相对 URL 为 <code>/tasks</code>。
                    </li>
                    <li>在收到请求后，任务列表会通过 WebSocket 连接进行序列化发送。</li>
                    <li>一旦所有项目发送完毕，服务器将关闭连接。</li>
                </list>
                <p>
                    出于演示目的，在发送任务之间引入了一秒钟的延迟。这允许您观察任务在客户端中逐步出现的过程。如果没有这个延迟，该示例看起来将与之前文章中开发的 <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">RESTful 服务</Links> 和 <Links href="//server-create-website" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 模板构建网站。">Web 应用程序</Links> 完全相同。
                </p>
                <p>
                    此迭代的最后一步是为此端点创建一个客户端。因为您包含了
                    <Links href="//server-static-content" summary="了解如何提供静态内容，如样式表、脚本、图像等。">Static Content</Links> 插件，Ktor 项目生成器已在
                    <Path>src/main/resources/static</Path>
                    中添加了一个
                    <Path>index.html</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>index.html</Path>
                    文件并将现有内容替换为以下内容：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    该页面使用了所有现代浏览器中都可用的 <a href="https://websockets.spec.whatwg.org//#websocket"><code>WebSocket</code> 类型</a>。您在 JavaScript 中创建此对象，并将端点的 URL 传递到构造函数中。随后，您为 <code>onopen</code>、<code>onclose</code> 和 <code>onmessage</code> 事件附加事件处理程序。在触发 <code>onmessage</code> 事件时，您使用 document 对象的方法向表格追加一行。
                </p>
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
                    导航至 <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。您应该会看到一个带有一个按钮的表单和一个空表格：
                </p>
                <img src="tutorial_server_websockets_iteration_1.png"
                     alt="显示包含一个按钮的 HTML 表单的网页浏览器页面"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    当您点击表单时，任务会从服务器加载，并以每秒一个的速度出现。因此，表格会被增量填充。您还可以通过打开浏览器 <control>Developer Tools</control> 中的 <control>JavaScript Console</control> 来查看记录的消息。
                </p>
                <img src="tutorial_server_websockets_iteration_1_click.gif"
                     alt="点击按钮时显示列表项的网页浏览器页面"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    至此，服务的表现符合预期。WebSocket 连接已打开，项目已发送到客户端，然后连接关闭。底层网络中存在很多复杂性，但 Ktor 默认处理了所有这些复杂性。
                </p>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="了解 WebSockets" id="understanding-websockets">
    <p>
        在进行下一次迭代之前，回顾一下 WebSockets 的一些基础知识可能会有所帮助。如果您已经熟悉 WebSockets，可以继续 <a href="#improve-design">改进服务的设计</a>。
    </p>
    <p>
        在之前的教程中，您的客户端发送 HTTP 请求并接收 HTTP 响应。这种模式运行良好，使互联网具备了可扩展性和弹性。
    </p>
    <p>然而，它不适用于以下场景：</p>
    <list>
        <li>内容是随时间增量生成的。</li>
        <li>内容根据事件频繁更改。</li>
        <li>客户端需要在内容产生时与服务器交互。</li>
        <li>一个客户端发送的数据需要迅速传播给其他客户端。</li>
    </list>
    <p>
        这些场景的示例包括股票交易、购买电影和音乐会门票、在线拍卖出价以及社交媒体中的聊天功能。WebSockets 的开发就是为了处理这些情况。
    </p>
    <p>
        WebSocket 连接是建立在 TCP 之上的，可以持续很长时间。该连接提供<emphasis>全双工通信</emphasis>，这意味着客户端可以同时向服务器发送消息并从中接收消息。
    </p>
    <p>
        WebSocket API 定义了四个事件（open、message、close 和 error）和两个操作（send 和 close）。如何访问此功能可能因不同的语言和库而异。例如，在 Kotlin 中，您可以将传入消息序列作为 <a
            href="https://kotlinlang.org/docs/flow.html"><code>Flow</code></a> 来消费。
    </p>
</chapter>
<chapter title="改进设计" id="improve-design">
    <p>接下来，您将重构现有代码，为更高级的示例腾出空间。</p>
    <procedure>
        <step>
            <p>
                在
                <Path>model</Path>
                软件包中，创建一个新的
                <Path>TaskRepository.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                打开
                <Path>TaskRepository.kt</Path>
                并添加 <code>TaskRepository</code> 类型：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
            <p>您可能还记得之前教程中的这段代码。</p>
        </step>
        <step>
            导航至
            <Path>src/main/kotlin</Path>
            并打开
            <Path>Routing.kt</Path>
            文件。
        </step>
        <step>
            <p>
                您现在可以通过利用 <code>TaskRepository</code> 来简化 <code>Application.configureRouting()</code> 中的路由：
            </p>
            <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000.milliseconds)&#10;                            }&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                        // ...&#10;                    }"/>
        </step>
    </procedure>
</chapter>
<chapter title="通过 WebSockets 发送消息" id="send-messages">
    <p>
        为了展示 WebSockets 的强大功能，您将创建一个新端点，其中：
    </p>
    <list>
        <li>
            当客户端启动时，它会收到所有现有任务。
        </li>
        <li>
            客户端可以创建并发送任务。
        </li>
        <li>
            当一个客户端发送任务时，其他客户端会收到通知。
        </li>
    </list>
    <procedure>
        <step>
            <p>
                在
                <Path>Routing.kt</Path>
                文件中，将当前的 <code>.configureRouting()</code> 方法替换为下面的实现：
            </p>
            <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                ensureActive()&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000.milliseconds)&#10;    }&#10;}"/>
            <p>通过这段代码，您完成了以下工作：</p>
            <list>
                <li>
                    将发送所有现有任务的功能重构为一个辅助方法。
                </li>
                <li>
                    在 <code>routing {}</code> 块中，您创建了一个线程安全的 <code>session</code> 对象列表，以跟踪所有客户端。
                </li>
                <li>
                    添加了一个相对 URL 为 <code>/tasks2</code> 的新端点。当客户端连接到此端点时，相应的 <code>session</code> 对象将被添加到列表中。然后服务器进入无限循环，等待接收新任务。收到新任务后，服务器将其存储在仓库中，并将副本发送给所有客户端（包括当前客户端）。
                </li>
            </list>
            <p>
                为了测试此功能，您将创建一个扩展 <Path>index.html</Path> 功能的新页面。
            </p>
        </step>
        <step>
            <p>
                在
                <Path>src/main/resources/static</Path>
                内创建一个名为
                <Path>wsClient.html</Path>
                的新 HTML 文件。
            </p>
        </step>
        <step>
            <p>
                打开
                <Path>wsClient.html</Path>
                并添加以下内容：
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create a new task&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            <p>
                这个新页面引入了一个 HTML 表单，用户可以在其中输入新任务的信息。提交表单后，将调用 <code>sendTaskToServer()</code> 事件处理程序。这将构建一个包含表单数据的 JavaScript 对象，并使用 WebSocket 对象的 <code>.send()</code> 方法将其发送到服务器。
            </p>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 重新运行图标"/>) 以重启应用程序。
            </p>
        </step>
        <step>
            <p>要测试此功能，请并排打开两个浏览器，并按照以下步骤操作。</p>
            <list type="decimal">
                <li>
                    在浏览器 A 中，导航至
                    <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>。您应该会看到显示的默认任务。
                </li>
                <li>
                    在浏览器 A 中添加一个新任务。新任务应该出现在该页面的表格中。
                </li>
                <li>
                    在浏览器 B 中，导航至
                    <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>。您应该会看到默认任务，以及您在浏览器 A 中添加的任何新任务。
                </li>
                <li>
                    在任一浏览器中添加任务。您应该会看到新项目同时出现在两个页面上。
                </li>
            </list>
            <img src="tutorial_server_websockets_iteration_2_test.gif"
                 alt="并排显示两个网页浏览器页面，演示通过 HTML 表单创建新任务"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="添加自动化测试" id="add-automated-tests">
    <p>
        为了简化您的 QA 流程并使其快速、可复现且无需人工干预，您可以使用 Ktor 内置的 <Links href="//server-testing" summary="了解如何使用特殊的测试引擎测试您的服务器应用程序。">自动化测试支持</Links>。请按照以下步骤操作：
    </p>
    <procedure>
        <step>
            <p>
                将以下依赖项添加到
                <Path>build.gradle.kts</Path>
                中，以便您在 Ktor Client 中配置对 <Links href="//server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">内容协商</Links> 的支持：
            </p>
            <code-block lang="kotlin" code="    testImplementation(ktorLibs.client.contentNegotiation)"/>
        </step>
        <step>
            <p>
                <p>在 IntelliJ IDEA 中，点击编辑器右侧的 Gradle 通知图标
                    (<img alt="IntelliJ IDEA Gradle 图标"
                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                    以加载 Gradle 更改。</p>
            </p>
        </step>
        <step>
            <p>
                导航至
                <Path>src/test/kotlin</Path>
                并打开
                <Path>ServerTest.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                将生成的测试类替换为以下实现：
            </p>
            <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.websocket.DefaultClientWebSocketSession&#10;import io.ktor.client.plugins.websocket.WebSockets&#10;import io.ktor.client.plugins.websocket.converter&#10;import io.ktor.client.plugins.websocket.webSocket&#10;import io.ktor.serialization.deserialize&#10;import io.ktor.serialization.kotlinx.KotlinxWebsocketSerializationConverter&#10;import io.ktor.serialization.kotlinx.json.json&#10;import io.ktor.server.testing.testApplication&#10;import kotlinx.coroutines.flow.consumeAsFlow&#10;import kotlinx.coroutines.flow.map&#10;import kotlinx.coroutines.flow.scan&#10;import kotlinx.serialization.json.Json&#10;import kotlin.test.Test&#10;import kotlin.test.assertEquals&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        configure()&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
            <p>
                通过此设置，您可以：
            </p>
            <list>
                <li>
                    配置您的服务在测试环境中运行，并启用与生产环境相同的功能，包括 JSON 序列化和 WebSockets。
                </li>
                <li>
                    在 <Links href="//client-create-and-configure" summary="了解如何创建和配置 Ktor 客户端。">Ktor Client</Links> 中配置内容协商和 WebSocket 支持。如果没有这些配置，客户端在通过 WebSocket 连接时将不知道如何将对象 (反) 序列化为 JSON。
                </li>
                <li>
                    声明您期望服务返回的 <code>Tasks</code> 列表。
                </li>
                <li>
                    使用 <code>client</code> 对象的 <code>.webSocket</code> 函数向 <code>/tasks</code> 发送请求。
                </li>
                <li>
                    将传入的任务作为 <code>Flow</code> 消费，并将其增量添加到列表中。
                </li>
                <li>
                    收到所有任务后，以常规方式将 <code>expectedTasks</code> 与 <code>actualTasks</code> 进行比较。
                </li>
            </list>
        </step>
    </procedure>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        做得好！通过将 WebSocket 通信和 Ktor Client 的自动化测试结合起来，您已经显著增强了任务管理器服务。
    </p>
    <p>
        继续阅读 <Links href="//server-integrate-database" summary="了解使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。">下一篇教程</Links>，探索您的服务如何使用 Exposed 库与关系型数据库无缝交互。
    </p>
</chapter>
</topic>