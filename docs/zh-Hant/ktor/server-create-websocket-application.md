<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 在 Kotlin 中建立 WebSocket 應用程式" id="server-create-websocket-application">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-websockets"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的外掛程式</b>：<Links href="//server-static-content" summary="了解如何提供靜態內容，例如樣式表、指令碼、圖片等。">靜態內容 (Static Content)</Links>、
            <Links href="//server-serialization" summary="Content Negotiation 外掛程式有兩個主要目的：交涉用戶端與伺服器之間的媒體類型，以及將內容以特定格式進行序列化/反序列化。">內容交涉 (Content Negotiation)</Links>、<Links href="//server-websockets" summary="Websockets 外掛程式允許你在伺服器與用戶端之間建立多向通訊工作階段。">Ktor Server 中的 WebSockets</Links>、
            <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
        </p>
    </tldr>
    <card-summary>
        了解如何利用 WebSockets 的強大功能來傳送與接收內容。
    </card-summary>
    <link-summary>
        了解如何利用 WebSockets 的強大功能來傳送與接收內容。
    </link-summary>
    <web-summary>
        了解如何使用 Ktor 在 Kotlin 中建置 WebSocket 應用程式。本教學將引導你完成透過 WebSockets 將後端服務與用戶端連接的過程。
    </web-summary>
    <p>
        本文將引導你完成使用 Ktor 在 Kotlin 中建立 WebSocket 應用程式的過程。它建立在 <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學所涵蓋的內容之上。
    </p>
    <p>本文將教你如何執行以下操作：</p>
    <list>
        <li>建立使用 JSON 序列化的服務。</li>
        <li>透過 WebSocket 連線傳送與接收內容。</li>
        <li>同時向多個用戶端廣播內容。</li>
    </list>
    <chapter title="先決條件" id="prerequisites">
        <p>你可以獨立完成此教學，但我們建議你先完成
            <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學，以熟悉 <Links href="//server-serialization" summary="Content Negotiation 外掛程式有兩個主要目的：交涉用戶端與伺服器之間的媒體類型，以及將內容以特定格式進行序列化/反序列化。">內容交涉</Links> 與 REST。
        </p>
        <p>我們建議你安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，但你也可以使用其他偏好的 IDE。
        </p>
    </chapter>
    <chapter title="Hello WebSockets" id="hello-websockets">
        <p>
            在本教學中，你將基於 <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學中開發的工作管理器服務，透過 WebSocket 連線增加與用戶端交換 <code>Task</code> 物件的功能。為了實現這一點，你需要加入 <Links href="//server-websockets" summary="Websockets 外掛程式允許你在伺服器與用戶端之間建立多向通訊工作階段。">WebSockets 外掛程式</Links>。雖然你可以手動將其加入現有專案，但為了本教學，你將從頭開始建立一個新專案。
        </p>
        <chapter title="使用外掛程式建立初始專案" id="create=project">
            <procedure>
                <step>
                    <p>
                        導覽至
                        <a href="https://start.ktor.io/">Ktor 專案產生器</a>。
                    </p>
                </step>
                <step>
                    <p>在
                        <control>Project artifact</control>
                        欄位中，輸入
                        <Path>com.example.ktor-websockets-task-app</Path>
                        作為專案構件的名稱。
                        <img src="tutorial_server_websockets_project_artifact.png"
                             alt="在 Ktor 專案產生器中命名專案構件"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        在外掛程式區段搜尋並點擊
                        <control>Add</control>
                        按鈕來加入以下外掛程式：
                    </p>
                    <list type="bullet">
                        <li>Content Negotiation</li>
                        <li>kotlinx.serialization</li>
                        <li>WebSockets</li>
                        <li>Static Content</li>
                    </list>
                    <p>
                        <img src="ktor_project_generator_add_plugins.gif"
                             alt="在 Ktor 專案產生器中加入外掛程式"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        加入外掛程式後，它們將顯示在外掛程式區段的右上角。
                    </p>
                    <p>你將看到所有即將加入專案的外掛程式清單：
                        <img src="tutorial_server_websockets_project_plugins.png"
                             alt="Ktor 專案產生器中的外掛程式清單"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        點擊
                        <control>Download</control>
                        按鈕來產生並下載你的 Ktor 專案。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="加入起始程式碼" id="add-starter-code">
            <p>下載完成後，在 IntelliJ IDEA 中開啟專案並遵循以下步驟：</p>
            <procedure>
                <step>
                    導覽至
                    <Path>src/main/kotlin</Path>
                    並建立一個名為
                    <Path>model</Path>
                    的新子套件。
                </step>
                <step>
                    <p>
                        在
                        <Path>model</Path>
                        套件內建立一個新的
                        <Path>Task.kt</Path>
                        檔案。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>Task.kt</Path>
                        檔案並加入一個 <code>enum</code> 來表示優先級，以及一個 <code>data class</code> 來表示任務：
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        請注意，<code>Task</code> 類別標記了來自 <code>kotlinx.serialization</code> 程式庫的 <code>Serializable</code> 註解。這意味著執行個體可以與 JSON 互相轉換，從而允許其內容在網路上傳輸。
                    </p>
                    <p>
                        因為你包含了 WebSockets 外掛程式，產生器已在
                        <Path>src/main/kotlin</Path>
                        內的
                        <Path>Webwebsockets.kt</Path>
                        檔案中加入了一個 <code>webSocket</code> 路由，並在
                        <Path>Routing.kt</Path> 檔案中加入了相關設定。
                    </p>
                </step>
                <step>
                    開啟
                    <Path>Webwebsockets.kt</Path>
                    檔案，並將現有的 <code>.configureWebsockets()</code> 函式替換為以下內容：
                    <code-block lang="kotlin" code="                        fun Application.configureWebsockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;                        }"/>
                    <list>
                        <li>安裝 WebSockets 外掛程式並使用標準設定進行配置。</li>
                        <li>設定 <code>contentConverter</code> 屬性，使外掛程式能夠透過 <a
                                    href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a> 程式庫序列化傳送與接收的物件。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>Routing.kt</Path>
                        檔案，並將現有的 <code>Application.configureRouting()</code> 函式替換為下方的實作：
                    </p>
                    <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            webSocket(&quot;/tasks&quot;) {&#10;                                val tasks = listOf(&#10;                                    Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                    Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                    Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                    Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                )&#10;&#10;                                for (task in tasks) {&#10;                                    sendSerialized(task)&#10;                                    delay(1000.milliseconds)&#10;                                }&#10;&#10;                                close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                            }&#10;                            staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;                        }&#10;                    }"/>
                    <list>
                        <li>路由配置了單一端點，相對 URL 為 <code>/tasks</code>。
                        </li>
                        <li>收到請求後，任務清單會透過 WebSocket 連線序列化傳送。</li>
                        <li>所有項目傳送完畢後，伺服器會關閉連線。</li>
                    </list>
                    <p>
                        為了示範目的，在傳送任務之間引入了一秒鐘的延遲。這讓你可以觀察到任務在用戶端中逐一出現。若沒有這個延遲，此範例看起來會與先前文章中開發的 <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">RESTful 服務</Links> 以及 <Links href="//server-create-website" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 範本建置網站。">Web 應用程式</Links> 完全相同。
                    </p>
                    <p>
                        此階段的最後一步是為此端點建立一個用戶端。因為你包含了
                        <Links href="//server-static-content" summary="了解如何提供靜態內容，例如樣式表、指令碼、圖片等。">靜態內容</Links> 外掛程式，Ktor 專案產生器已在
                        <Path>src/main/resources/static</Path>
                        內加入了一個
                        <Path>index.html</Path>
                        檔案。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>index.html</Path>
                        檔案，並將現有內容替換為以下內容：
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        此頁面使用了所有現代瀏覽器都提供的 <a href="https://websockets.spec.whatwg.org//#websocket"><code>WebSocket</code> 類型</a>。你在 JavaScript 中建立此物件，並將端點的 URL 傳遞給建構函式。隨後，你為 <code>onopen</code>、<code>onclose</code> 和 <code>onmessage</code> 事件附加事件處理常式。觸發 <code>onmessage</code> 事件時，你會使用文件物件的方法向表格附加一行。
                    </p>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，點擊執行按鈕
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA 執行圖示"/>)
                        來啟動應用程式。</p>
                </step>
                <step>
                    <p>
                        導覽至 <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。你應該會看到一個包含按鈕的表單和一個空表格：
                    </p>
                    <img src="tutorial_server_websockets_iteration_1.png"
                         alt="顯示一個包含單一按鈕的 HTML 表單的網頁瀏覽器頁面"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        點擊表單後，任務會從伺服器載入，並以每秒一個的速度出現。因此，表格會逐次填入內容。你也可以透過開啟瀏覽器 <control>開發者工具</control> 中的 <control>JavaScript 控制台</control> 來查看記錄訊息。
                    </p>
                    <img src="tutorial_server_websockets_iteration_1_click.gif"
                         alt="網頁瀏覽器頁面在點擊按鈕時顯示清單項目"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        至此，該服務運作符合預期。WebSocket 連線已開啟，項目被傳送至用戶端，隨後連線關閉。底層網路存在許多複雜性，但 Ktor 預設處理了所有這些細節。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="理解 WebSockets" id="understanding-websockets">
        <p>
            在進入下一個階段之前，回顧 WebSockets 的一些基本概念可能會有所幫助。如果你已經熟悉 WebSockets，可以直接繼續 <a href="#improve-design">改進你的服務設計</a>。
        </p>
        <p>
            在先前的教學中，你的用戶端傳送 HTTP 請求並接收 HTTP 回應。這種模式運作良好，並使網際網路具備擴展性與韌性。
        </p>
        <p>然而，它不適用於以下情境：</p>
        <list>
            <li>內容是隨著時間推移增量產生的。</li>
            <li>內容隨事件頻繁變更。</li>
            <li>用戶端需要在產生內容時與伺服器互動。</li>
            <li>一個用戶端傳送的資料需要迅速傳播給其他用戶端。</li>
        </list>
        <p>
            這些情境的範例包括股票交易、購買電影和音樂會門票、線上拍賣競標，以及社群媒體中的聊天功能。WebSockets 的開發就是為了處理這些情況。
        </p>
        <p>
            WebSocket 連線建立在 TCP 之上，且可以持續較長時間。該連線提供 <emphasis>全雙工通訊</emphasis>，這意味著用戶端可以同時向伺服器傳送訊息並從中接收訊息。
        </p>
        <p>
            WebSocket API 定義了四種事件（open、message、close 和 error）以及兩種操作（send 和 close）。如何存取這些功能可能因不同的語言和程式庫而異。例如，在 Kotlin 中，你可以將傳入訊息序列視為 <a
                href="https://kotlinlang.org/docs/flow.html"><code>Flow</code></a> 來處理。
        </p>
    </chapter>
    <chapter title="改進設計" id="improve-design">
        <p>接下來，你將重構現有程式碼，為更進階的範例騰出空間。</p>
        <procedure>
            <step>
                <p>
                    在
                    <Path>model</Path>
                    套件中，建立一個新的
                    <Path>TaskRepository.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>TaskRepository.kt</Path>
                    並加入 <code>TaskRepository</code> 類型：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
                <p>你可能還記得先前教學中的這段程式碼。</p>
            </step>
            <step>
                導覽至
                <Path>src/main/kotlin</Path>
                並開啟
                <Path>Routing.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    你現在可以透過利用 <code>TaskRepository</code> 來簡化 <code>Application.configureRouting()</code> 中的路由：
                </p>
                <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000.milliseconds)&#10;                            }&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                        // ...&#10;                    }"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="透過 WebSockets 傳送訊息" id="send-messages">
        <p>
            為了說明 WebSockets 的強大功能，你將建立一個新的端點，其中：
        </p>
        <list>
            <li>
                當用戶端啟動時，它會接收所有現有任務。
            </li>
            <li>
                用戶端可以建立並傳送任務。
            </li>
            <li>
                當一個用戶端傳送任務時，其他用戶端會收到通知。
            </li>
        </list>
        <procedure>
            <step>
                <p>
                    在
                    <Path>Routing.kt</Path>
                    檔案中，將目前的 <code>.configureRouting()</code> 方法替換為下方的實作：
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                ensureActive()&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000.milliseconds)&#10;    }&#10;}"/>
                <p>透過這段程式碼，你完成了以下操作：</p>
                <list>
                    <li>
                        將傳送所有現有任務的功能重構為一個輔助方法。
                    </li>
                    <li>
                        在 <code>routing {}</code> 區塊中，建立了一個執行緒安全的 <code>session</code> 物件清單，用以追蹤所有用戶端。
                    </li>
                    <li>
                        加入了一個相對 URL 為 <code>/tasks2</code> 的新端點。當用戶端連接到此端點時，對應的 <code>session</code> 物件會被加入清單。伺服器隨後進入無限迴圈，等待接收新任務。收到新任務後，伺服器將其存儲在存儲庫中，並向所有用戶端（包括當前用戶端）發送複本。
                    </li>
                </list>
                <p>
                    為了測試此功能，你將建立一個新頁面，擴充
                    <Path>index.html</Path>
                    中的功能。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>src/main/resources/static</Path>
                    中建立一個名為
                    <Path>wsClient.html</Path>
                    的新 HTML 檔案。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>wsClient.html</Path>
                    並加入以下內容：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create a new task&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    這個新頁面引入了一個 HTML 表單，使用者可以在其中輸入新任務的資訊。提交表單後，會呼叫 <code>sendTaskToServer()</code> 事件處理常式。這會使用表單資料建立一個 JavaScript 物件，並使用 WebSocket 物件的 <code>.send()</code> 方法將其傳送至伺服器。
                </p>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="intelliJ IDEA 重新執行圖示"/>) 來重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>要測試此功能，請並排開啟兩個瀏覽器並遵循以下步驟。</p>
                <list type="decimal">
                    <li>
                        在瀏覽器 A 中，導覽至
                        <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>。你應該會看到顯示預設任務。
                    </li>
                    <li>
                        在瀏覽器 A 中加入一個新任務。新任務應該會出現在該頁面的表格中。
                    </li>
                    <li>
                        在瀏覽器 B 中，導覽至
                        <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>。你應該會看到預設任務，以及你在瀏覽器 A 中加入的任何新任務。
                    </li>
                    <li>
                        在任一瀏覽器中加入任務。你應該會看到新項目同時出現在兩個頁面上。
                    </li>
                </list>
                <img src="tutorial_server_websockets_iteration_2_test.gif"
                     alt="兩個並排顯示的網頁瀏覽器頁面，示範透過 HTML 表單建立新任務"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="加入自動化測試" id="add-automated-tests">
        <p>
            為了簡化你的品質保證 (QA) 流程並使其快速、可重現且自動化，你可以使用 Ktor 內建的 <Links href="//server-testing" summary="了解如何使用特殊的測試引擎測試你的伺服器應用程式。">自動化測試支援</Links>。請遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>
                    將以下相依性加入
                    <Path>build.gradle.kts</Path>，以便你在 Ktor Client 中配置對 <Links href="//server-serialization" summary="Content Negotiation 外掛程式有兩個主要目的：交涉用戶端與伺服器之間的媒體類型，以及將內容以特定格式進行序列化/反序列化。">內容交涉</Links> 的支援：
                </p>
                <code-block lang="kotlin" code="    testImplementation(ktorLibs.client.contentNegotiation)"/>
            </step>
            <step>
                <p>
                    <p>在 IntelliJ IDEA 中，點擊編輯器右側的 Gradle 通知圖示
                        (<img alt="intelliJ IDEA gradle 圖示"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        來載入 Gradle 變更。</p>
                </p>
            </step>
            <step>
                <p>
                    導覽至
                    <Path>src/test/kotlin</Path>
                    並開啟
                    <Path>ServerTest.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    將產生的測試類別替換為下方的實作：
                </p>
                <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.websocket.DefaultClientWebSocketSession&#10;import io.ktor.client.plugins.websocket.WebSockets&#10;import io.ktor.client.plugins.websocket.converter&#10;import io.ktor.client.plugins.websocket.webSocket&#10;import io.ktor.serialization.deserialize&#10;import io.ktor.serialization.kotlinx.KotlinxWebsocketSerializationConverter&#10;import io.ktor.serialization.kotlinx.json.json&#10;import io.ktor.server.testing.testApplication&#10;import kotlinx.coroutines.flow.consumeAsFlow&#10;import kotlinx.coroutines.flow.map&#10;import kotlinx.coroutines.flow.scan&#10;import kotlinx.serialization.json.Json&#10;import kotlin.test.Test&#10;import kotlin.test.assertEquals&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        configure()&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
                <p>
                    透過此設定，你：
                </p>
                <list>
                    <li>
                        配置你的服務在測試環境中執行，並啟用與生產環境相同的功能，包括 JSON 序列化與 WebSockets。
                    </li>
                    <li>
                        在 <Links href="//client-create-and-configure" summary="了解如何建立與配置 Ktor 用戶端。">Ktor Client</Links> 中配置內容交涉與 WebSocket 支援。若沒有這些，用戶端在使用 WebSocket 連線時將不知道如何進行物件的 JSON (反)序列化。
                    </li>
                    <li>
                        宣告你期望服務回傳的 <code>Tasks</code> 清單。
                    </li>
                    <li>
                        使用 <code>client</code> 物件的 <code>.webSocket</code> 函式向 <code>/tasks</code> 傳送請求。
                    </li>
                    <li>
                        將傳入的任務作為 <code>Flow</code> 處理，並將其逐一加入清單。
                    </li>
                    <li>
                        在接收到所有任務後，以通常的方式比較 <code>expectedTasks</code> 與 <code>actualTasks</code>。
                    </li>
                </list>
            </step>
        </procedure>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            做得好！透過結合 WebSocket 通訊與 Ktor Client 的自動化測試，你已顯著增強了工作管理器服務。
        </p>
        <p>
            繼續閱讀
            <Links href="//server-integrate-database" summary="了解如何使用 Exposed SQL 程式庫將 Ktor 服務連接到資料庫存儲庫。">下一篇教學</Links>，探索你的服務如何使用 Exposed 程式庫無縫地與關聯式資料庫互動。
        </p>
    </chapter>
</topic>