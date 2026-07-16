<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 在 Kotlin 中创建 WebSocket 应用程序" id="server-create-websocket-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-websockets"/>
    <p>
        <b>代码示例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>已使用的插件</b>: <Links href="/ktor/server-routing" summary="路由是用于处理服务器应用程序中传入请求的核心插件。">Routing</Links>,<Links href="/ktor/server-static-content" summary="了解如何提供静态内容，例如样式表、脚本、图像等。">Static Content</Links>,
        <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要目的：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>, <Links href="/ktor/server-websockets" summary="WebSockets 插件允许您在服务器和客户端之间创建多向通信会话。">WebSockets in Ktor Server</Links>,
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
    了解如何使用 Ktor 在 Kotlin 中构建 WebSocket 应用程序。本教程将引导您完成通过 WebSockets 将后端服务与客户端连接的过程。
</web-summary>
<p>
    本文将引导您完成使用 Ktor 在 Kotlin 中创建 WebSocket 应用程序的过程。它建立在
    <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 教程中涵盖的内容之上。
</p>
<p>本文将教您如何执行以下操作：</p>
<list>
    <li>创建使用 JSON 序列化的服务。</li>
    <li>通过 WebSocket 连接发送和接收内容。</li>
    <li>同时向多个客户端广播内容。</li>
</list>
<chapter title="先决条件" id="prerequisites">
    <p>您可以独立完成本教程，但是，我们建议您完成
        <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 教程，以熟悉 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要目的：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links> 和 REST。
    </p>
    <p>我们建议您安装 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a>，但您也可以选择其他 IDE。</p>
</chapter>
<chapter title="Hello WebSockets" id="hello-websockets">
    <p>
        在本教程中，您将基于 <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 教程中开发的任务管理器服务，添加通过 WebSocket 连接与客户端交换 <code>Task</code> 对象的能力。为此，您需要添加 <Links href="/ktor/server-websockets" summary="WebSockets 插件允许您在服务器和客户端之间创建多向通信会话。">WebSockets
        插件</Links>。虽然您可以手动将其添加到现有项目，但为了本教程的演示，我们将从头开始创建一个新项目。
    </p>
    <chapter title="使用插件创建初始项目" id="create=project">
        <procedure>
            <step>
                <p>
                    导航到
                    <a href="https://start.ktor.io/">Ktor 项目生成器</a>
                    。
                </p>
            </step>
            <step>
                <p>在
                    <control>项目 artifact</control>
                    字段中，输入
                    <Path>com.example.ktor-websockets-task-app</Path>
                    作为您的项目 artifact 名称。
                    <img src="tutorial_server_websockets_project_artifact.png"
                         alt="在 Ktor 项目生成器中命名项目 artifact"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    在插件部分中搜索并点击
                    <control>添加</control>
                    按钮添加以下插件：
                </p>
                <list type="bullet">
                    <li>Routing</li>
                    <li>Content Negotiation</li>
                    <li>Kotlinx.serialization</li>
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
                    添加插件后，点击插件部分右上角的
                    <control>5 plugins</control>
                    按钮，以显示已添加的插件。
                </p>
                <p>您将看到一个列表，其中包含将添加到您项目的所有插件：
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
                    <control>下载</control>
                    按钮以生成并下载您的 Ktor 项目。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="添加启动代码" id="add-starter-code">
        <p>下载完成后，在 IntelliJ IDEA 中打开您的项目并按照以下步骤操作：</p>
        <procedure>
            <step>
                导航到
                <Path>src/main/kotlin</Path>
                并创建一个名为
                <Path>model</Path>
                的新子包。
            </step>
            <step>
                <p>
                    在
                    <Path>model</Path>
                    包内创建一个新文件
                    <Path>Task.kt</Path>
                    。</p>
            </step>
            <step>
                <p>
                    打开
                    <Path>Task.kt</Path>
                    文件，并添加一个 <code>enum</code> 来表示优先级，以及一个 <code>data class</code> 来表示任务：
                </p>
                <code-block lang="kotlin" code="package model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    请注意，<code>Task</code> 类使用
                    <code>kotlinx.serialization</code>
                    库中的 <code>Serializable</code> 类型进行注解。这意味着实例可以转换为 JSON 或从 JSON 转换回来，从而允许其内容通过网络传输。
                </p>
                <p>
                    由于您包含了 WebSockets 插件，因此在
                    <Path>src/main/kotlin/com/example/plugins</Path>
                    中已生成了一个
                    <Path>Sockets.kt</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>Sockets.kt</Path>
                    文件，并用以下实现替换现有的 <code>Application.configureSockets()</code> 函数：
                </p>
                <code-block lang="kotlin" code="                        fun Application.configureSockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;&#10;                            routing {&#10;                                webSocket(&quot;/tasks&quot;) {&#10;                                    val tasks = listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;&#10;                                    for (task in tasks) {&#10;                                        sendSerialized(task)&#10;                                        delay(1000)&#10;                                    }&#10;&#10;                                    close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                                }&#10;                            }&#10;                        }"/>
                <p>
                    此代码执行以下步骤：
                </p>
                <list type="decimal">
                    <li>安装 WebSockets 插件并使用标准设置进行配置。</li>
                    <li>设置 <code>contentConverter</code> 属性，使插件能够通过 <a
                            href="https://github.com/Kotlin/kotlinx.serialization">kotlinx.serialization</a>
                        库序列化发送和接收的对象。
                    </li>
                    <li>路由配置了一个单端点，其相对 URL 为 <code>/tasks</code>。</li>
                    <li>收到请求后，任务列表通过 WebSocket 连接进行序列化传输。</li>
                    <li>所有项发送完毕后，服务器关闭连接。</li>
                </list>
                <p>
                    为了演示目的，在发送任务之间引入了一秒的延迟。这
                    使我们能够观察任务在客户端中逐渐出现。如果没有此延迟，
                    该示例将与先前文章中开发的 <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">RESTful
                    服务</Links> 和 <Links href="/ktor/server-create-website" summary="了解如何使用 Ktor 和 Thymeleaf 模板在 Kotlin 中构建网站。">Web 应用程序</Links> 看起来相同。
                </p>
                <p>
                    此迭代的最后一步是为此端点创建一个客户端。由于您包含了
                    <Links href="/ktor/server-static-content" summary="了解如何提供静态内容，例如样式表、脚本、图像等。">静态内容</Links> 插件，因此在
                    <Path>src/main/resources/static</Path>
                    中已生成了一个
                    <Path>index.html</Path>
                    文件。
                </p>
            </step>
            <step>
                <p>
                    打开
                    <Path>index.html</Path>
                    文件，并用以下内容替换现有内容：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    此页面使用所有现代浏览器中可用的 <a href="https://websockets.spec.whatwg.org//#websocket">WebSocket 类型</a>。我们在 JavaScript 中创建此对象，将端点的 URL 传递给构造函数。随后，我们为
                    <code>onopen</code>、<code>onclose</code>
                    和 <code>onmessage</code> 事件附加事件处理程序。当触发 <code>onmessage</code> 事件时，我们使用 document 对象的方法将一行附加到表格中。
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
                    导航到 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。
                    您应该会看到一个带有按钮的表单和一个空表格：
                </p>
                <img src="tutorial_server_websockets_iteration_1.png"
                     alt="一个显示带有按钮的 HTML 表单的网页"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    当您点击表单时，任务将从服务器加载，每秒出现一个。因此，表格将逐渐填充。您还可以通过在浏览器的
                    <control>开发者工具</control>
                    中打开
                    <control>JavaScript 控制台</control>
                    来查看已记录的消息。
                </p>
                <img src="tutorial_server_websockets_iteration_1_click.gif"
                     alt="一个在点击按钮时显示列表项的网页"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    通过此操作，您可以看到服务按预期运行。WebSocket 连接已打开，项目发送到客户端，然后连接关闭。底层网络有很多复杂性，但 Ktor 默认处理所有这些。
                </p>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="理解 WebSockets" id="understanding-websockets">
    <p>
        在进入下一个迭代之前，回顾一些 WebSockets 的基础知识可能会有所帮助。
        如果您已经熟悉 WebSockets，可以继续<a href="#improve-design">改进服务的设计</a>。
    </p>
    <p>
        在之前的教程中，您的客户端发送 HTTP 请求并接收 HTTP 响应。这工作得很好，并使互联网具有可伸缩性和弹性。
    </p>
    <p>然而，它不适用于以下场景：</p>
    <list>
        <li>内容随时间增量生成。</li>
        <li>内容根据事件频繁变化。</li>
        <li>客户端需要在内容生成时与服务器交互。</li>
        <li>一个客户端发送的数据需要快速传播给其他客户端。</li>
    </list>
    <p>
        这些场景的示例包括股票交易、购买电影和音乐会门票、在线拍卖竞价以及社交媒体中的聊天功能。WebSockets 的开发是为了处理这些情况。
    </p>
    <p>
        WebSocket 连接建立在 TCP 之上，可以持续很长时间。该连接提供“全双工通信”，这意味着客户端可以同时向服务器发送消息并从服务器接收消息。
    </p>
    <p>
        WebSocket API 定义了四个事件（open、message、close 和 error）和两个动作（send 和 close）。此功能的访问方式在不同的语言和库中可能有所不同。
        例如，在 Kotlin 中，您可以将传入消息序列作为 <a
            href="https://kotlinlang.org/docs/flow.html">Flow</a> 进行消费。
    </p>
</chapter>
<chapter title="改进设计" id="improve-design">
    <p>接下来，您将重构现有代码，为更高级的示例腾出空间。</p>
    <procedure>
        <step>
            <p>
                在
                <Path>model</Path>
                包中，创建一个新文件
                <Path>TaskRepository.kt</Path>
                。</p>
        </step>
        <step>
            <p>
                打开
                <Path>TaskRepository.kt</Path>
                并添加 <code>TaskRepository</code> 类型：
            </p>
            <code-block lang="kotlin" code="package model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
            <p>您可能还记得之前教程中的这段代码。</p>
        </step>
        <step>
            导航到
            <Path>plugins</Path>
            包并打开
            <Path>Sockets.kt</Path>
            文件。
        </step>
        <step>
            <p>
                您现在可以通过利用
                <code>TaskRepository</code>
                来简化 <code>Application.configureSockets()</code> 中的路由：
            </p>
            <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000)&#10;                            }&#10;&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                    }"/>
        </step>
    </procedure>
</chapter>
<chapter title="通过 WebSockets 发送消息" id="send-messages">
    <p>
        为了说明 WebSockets 的强大功能，您将创建一个新端点，其中：
    </p>
    <list>
        <li>
            当客户端启动时，它会收到所有现有任务。
        </li>
        <li>
            客户端可以创建和发送任务。
        </li>
        <li>
            当一个客户端发送任务时，其他客户端会收到通知。
        </li>
    </list>
    <procedure>
        <step>
            <p>
                在
                <Path>Sockets.kt</Path>
                文件中，用以下实现替换当前的 <code>configureSockets()</code> 方法：
            </p>
            <code-block lang="kotlin" code="fun Application.configureSockets() {&#10;    install(WebSockets) {&#10;        contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;        pingPeriod = 15.seconds&#10;        timeout = 15.seconds&#10;        maxFrameSize = Long.MAX_VALUE&#10;        masking = false&#10;    }&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000)&#10;    }&#10;}"/>
            <p>通过此代码，您完成了以下操作：</p>
            <list>
                <li>
                    将发送所有现有任务的功能重构为一个辅助方法。
                </li>
                <li>
                    在 <code>routing</code> 部分，您创建了一个线程安全的 <code>session</code>
                    对象 list，用于跟踪所有客户端。
                </li>
                <li>
                    添加了一个相对 URL 为 <code>/task2</code> 的新端点。当客户端连接到
                    此端点时，相应的 <code>session</code> 对象会添加到 list 中。服务器
                    然后进入无限循环，等待接收新任务。收到新任务后，服务器将其存储在 repository 中，并将副本发送给所有客户端，包括当前客户端。
                </li>
            </list>
            <p>
                为了测试此功能，您将创建一个新页面，扩展
                <Path>index.html</Path>
                中的功能。
            </p>
        </step>
        <step>
            <p>
                在
                <Path>src/main/resources/static</Path>
                中创建一个名为
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
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;创建新任务&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;名称: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;描述: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;优先级: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            <p>
                此新页面引入了一个 HTML 表单，用户可以在其中输入新任务的信息。
                提交表单后，将调用 <code>sendTaskToServer</code> 事件处理程序。
                它使用表单数据构建一个 JavaScript 对象，并使用 WebSocket 对象的
                <code>send</code> 方法将其发送到服务器。
            </p>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮（<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 重新运行图标"/>）以重新启动应用程序。
            </p>
        </step>
        <step>
            <p>为了测试此功能，请并排打开两个浏览器并按照以下步骤操作。</p>
            <list type="decimal">
                <li>
                    在浏览器 A 中，导航到
                    [http://0.0.0.0:8080/static/wsClient.html](http://0.0.0.0:8080/static/wsClient.html)
                    。您应该会看到显示默认任务。
                </li>
                <li>
                    在浏览器 A 中添加一个新任务。新任务应该出现在该页面上的表格中。
                </li>
                <li>
                    在浏览器 B 中，导航到
                    [http://0.0.0.0:8080/static/wsClient.html](http://0.0.0.0:8080/static/wsClient.html)
                    。您应该会看到默认任务，以及您在浏览器 A 中添加的任何新任务。
                </li>
                <li>
                    在任一浏览器中添加任务。您应该会看到新项出现在两个页面上。
                </li>
            </list>
            <img src="tutorial_server_websockets_iteration_2_test.gif"
                 alt="两个并排的网页，演示通过 HTML 表单创建新任务"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="添加自动化测试" id="add-automated-tests">
    <p>
        为了简化您的 QA 流程，使其快速、可复现且无需手动操作，您可以使用 Ktor 内置的
        <Links href="/ktor/server-testing" summary="了解如何使用特殊的测试引擎测试您的服务器应用程序。">自动化测试支持</Links>。请按照以下步骤操作：
    </p>
    <procedure>
        <step>
            <p>
                将以下依赖项添加到
                <Path>build.gradle.kts</Path>
                ，以便您可以在 Ktor Client 中配置 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要目的：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>
                的支持：
            </p>
            <code-block lang="kotlin" code="    testImplementation(&quot;io.ktor:ktor-client-content-negotiation-jvm:$ktor_version&quot;)"/>
        </step>
        <step>
            <p>
                <p>在 IntelliJ IDEA 中，点击通知 Gradle 图标
                    (<img alt="IntelliJ IDEA Gradle 图标"
                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                    在编辑器右侧，以加载 Gradle 更改。</p>
            </p>
        </step>
        <step>
            <p>
                导航到
                <Path>src/test/kotlin/com/example</Path>
                并打开
                <Path>ApplicationTest.kt</Path>
                文件。
            </p>
        </step>
        <step>
            <p>
                用以下实现替换生成的测试类：
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.plugins.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlinx.coroutines.flow.*&#10;import kotlinx.serialization.json.Json&#10;import model.Priority&#10;import model.Task&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        application {&#10;            configureRouting()&#10;            configureSerialization()&#10;            configureSockets()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
            <p>
                通过此设置，您：
            </p>
            <list>
                <li>
                    将您的服务配置为在测试环境中运行，并启用与生产环境相同的功能，包括路由、JSON 序列化和 WebSockets。
                </li>
                <li>
                    在 <Links href="/ktor/client-create-and-configure" summary="了解如何创建和配置 Ktor 客户端。">Ktor Client</Links> 中配置 Content Negotiation 和 WebSocket 支持。否则，客户端在使用 WebSocket 连接时将不知道如何（反）序列化 JSON 对象。
                </li>
                <li>
                    声明您期望服务返回的 <code>Tasks</code> list。
                </li>
                <li>
                    使用客户端对象的 <code>websocket</code> 方法向 <code>/tasks</code> 发送请求。
                </li>
                <li>
                    将传入任务作为 <code>flow</code> 消费，并将其增量添加到 list 中。
                </li>
                <li>
                    收到所有任务后，以常规方式比较 <code>expectedTasks</code> 和 <code>actualTasks</code>。
                </li>
            </list>
        </step>
    </procedure>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        干得好！通过集成 WebSocket 通信和使用 Ktor Client 进行自动化测试，您显著增强了任务管理器服务。
    </p>
    <p>
        继续<Links href="/ktor/server-integrate-database" summary="了解如何使用 Exposed SQL 库将 Ktor 服务连接到数据库版本库的过程。">下一个教程</Links>，
        探索您的服务如何使用 Exposed 库与关系数据库无缝交互。
    </p>
</chapter>
</topic>