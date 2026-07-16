<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin 與 Ktor 建立 WebSocket 應用程式" id="server-create-websocket-application">
<show-structure for="chapter" depth="2"/>
<tldr>
        <var name="example_name" value="tutorial-server-websockets"/>
        <p>
            <b>程式碼範例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的插件</b>: <Links href="/ktor/server-routing" summary="路由是伺服器應用程式中處理傳入請求的核心插件。">Routing</Links>、<Links href="/ktor/server-static-content" summary="了解如何提供靜態內容，例如樣式表、腳本、圖片等。">Static Content</Links>、
            <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有兩個目的：協商用戶端和伺服器之間的媒體類型，以及以特定格式序列化/反序列化內容。">Content Negotiation</Links>、<Links href="/ktor/server-websockets" summary="WebSockets 插件允許您在伺服器和用戶端之間建立多向通訊會話。">WebSockets in Ktor Server</Links>、
            <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
        </p>
</tldr>
<card-summary>
        了解如何善用 WebSockets 的強大功能來傳送和接收內容。
</card-summary>
<link-summary>
        了解如何善用 WebSockets 的強大功能來傳送和接收內容。
</link-summary>
<web-summary>
        了解如何使用 Kotlin 和 Ktor 建置 WebSocket 應用程式。本教學將引導您完成透過 WebSockets 將後端服務與用戶端連接的過程。
</web-summary>
<p>
        本文將引導您完成使用 Kotlin 和 Ktor 建立 WebSocket 應用程式的過程。它建立在
        <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學中涵蓋的內容基礎上。
</p>
<p>本文將教您如何執行以下操作：</p>
<list>
        <li>建立使用 JSON 序列化的服務。</li>
        <li>透過 WebSocket 連線傳送和接收內容。</li>
        <li>同時向多個用戶端廣播內容。</li>
</list>
<chapter title="先決條件" id="prerequisites">
        <p>您可以獨立完成本教學，但我們建議您完成
            <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學，以熟悉 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有兩個目的：協商用戶端和伺服器之間的媒體類型，以及以特定格式序列化/反序列化內容。">Content Negotiation</Links> 和 REST。
        </p>
        <p>我們建議您安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，但您也可以使用您選擇的其他 IDE。
        </p>
</chapter>
<chapter title="Hello WebSockets" id="hello-websockets">
        <p>
            在本教學中，您將在 <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學中開發的任務管理器服務的基礎上，新增透過 WebSocket 連線與用戶端交換 <code>Task</code> 物件的能力。為此，您需要新增 <Links href="/ktor/server-websockets" summary="Websockets 插件允許您在伺服器和用戶端之間建立多向通訊會話。">WebSockets
            插件</Links>。雖然您可以手動將其新增到現有專案中，但為了本教學的目的，我們將從頭開始建立一個新專案。
        </p>
        <chapter title="使用插件建立初始專案" id="create=project">
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
                        作為專案成品的名稱。
                        <img src="tutorial_server_websockets_project_artifact.png"
                             alt="在 Ktor 專案產生器中命名專案成品"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        在插件區塊中，搜尋並點擊
                        <control>Add</control>
                        按鈕新增以下插件：
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
                             alt="在 Ktor 專案產生器中新增插件"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        新增插件後，點擊插件區塊右上角的
                        <control>5 plugins</control>
                        按鈕，顯示已新增的插件。
                    </p>
                    <p>您將看到所有將新增到專案中的插件列表：
                        <img src="tutorial_server_websockets_project_plugins.png"
                             alt="Ktor 專案產生器中的插件列表"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        點擊
                        <control>Download</control>
                        按鈕來產生並下載您的 Ktor 專案。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="新增啟動程式碼" id="add-starter-code">
            <p>下載完成後，在 IntelliJ IDEA 中開啟您的專案並按照以下步驟操作：</p>
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
                        檔案並新增一個 <code>enum</code> 來表示優先級，以及一個 <code>data class</code> 來表示任務：
                    </p>
                    <code-block lang="kotlin" code="package model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        請注意，<code>Task</code> 類別使用 <code>kotlinx.serialization</code>
                        函式庫中的 <code>Serializable</code> 型別進行標註。這表示實例可以轉換為 JSON 格式，也可以從 JSON 轉換回來，從而允許其內容透過網路傳輸。
                    </p>
                    <p>
                        因為您包含了 WebSockets 插件，一個
                        <Path>Sockets.kt</Path>
                        檔案已在
                        <Path>src/main/kotlin/com/example/plugins</Path>
                        內產生。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>Sockets.kt</Path>
                        檔案並將現有的 <code>Application.configureSockets()</code> 函數替換為以下實作：
                    </p>
                    <code-block lang="kotlin" code="                        fun Application.configureSockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;&#10;                            routing {&#10;                                webSocket(&quot;/tasks&quot;) {&#10;                                    val tasks = listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;&#10;                                    for (task in tasks) {&#10;                                        sendSerialized(task)&#10;                                        delay(1000)&#10;                                    }&#10;&#10;                                    close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                                }&#10;                            }&#10;                        }"/>
                    <p>
                        在此程式碼中執行了以下步驟：
                    </p>
                    <list type="decimal">
                        <li>安裝並配置了 WebSockets 插件，並使用標準設定。</li>
                        <li>設定了 <code>contentConverter</code> 屬性，使插件能夠
                            透過 <a
                                    href="https://github.com/Kotlin/kotlinx.serialization">kotlinx.serialization</a>
                            函式庫序列化傳送和接收的物件。
                        </li>
                        <li>配置了路由，只有一個端點，其相對 URL 為 <code>/tasks</code>。
                        </li>
                        <li>收到請求後，將任務列表透過 WebSocket 連線序列化傳送。</li>
                        <li>所有項目傳送完畢後，伺服器關閉連線。</li>
                    </list>
                    <p>
                        為了演示目的，在傳送任務之間引入了一秒的延遲。這
                        讓我們能夠觀察到任務在用戶端中遞增地出現。如果沒有此延遲，
                        該範例看起來會與在先前文章中開發的 <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">RESTful
                        服務</Links> 和 <Links href="/ktor/server-create-website" summary="了解如何使用 Kotlin 和 Ktor 以及 Thymeleaf 模板建置網站。">網路應用程式</Links> 相同。
                    </p>
                    <p>
                        此迭代的最後一步是為此端點建立一個用戶端。因為您包含了
                        <Links href="/ktor/server-static-content" summary="了解如何提供靜態內容，例如樣式表、腳本、圖片等。">Static Content</Links> 插件，一個
                        <Path>index.html</Path>
                        檔案已在
                        <Path>src/main/resources/static</Path>
                        內產生。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>index.html</Path>
                        檔案並將現有內容替換為以下內容：
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        此頁面使用 <a href="https://websockets.spec.whatwg.org//#websocket">WebSocket 型別</a>，
                        所有現代瀏覽器都支援。我們在 JavaScript 中建立此物件，將
                        端點的 URL 傳入建構式。隨後，我們為 <code>onopen</code>、<code>onclose</code>
                        和 <code>onmessage</code> 事件附加事件處理器。觸發 <code>onmessage</code> 事件後，我們使用 document 物件的方法將一行附加到表格中。
                    </p>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，點擊執行按鈕
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="IntelliJ IDEA 執行圖示"/>)
                        來啟動應用程式。</p>
                </step>
                <step>
                    <p>
                        導覽至 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。
                        您應該會看到一個帶有按鈕和空表格的表單：
                    </p>
                    <img src="tutorial_server_websockets_iteration_1.png"
                         alt="顯示帶有一個按鈕的 HTML 表單的網頁"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        當您點擊表單時，任務應以每秒一個的速度從伺服器載入，
                        並遞增填充表格。您還可以透過在瀏覽器的
                        <control>開發者工具</control>中開啟
                        <control>JavaScript 控制台</control>
                        來查看記錄的訊息。
                    </p>
                    <img src="tutorial_server_websockets_iteration_1_click.gif"
                         alt="顯示在按鈕點擊時列表項目的網頁"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        至此，您可以看到服務正如預期般運作。WebSocket 連線已開啟，項目已傳送至用戶端，然後連線關閉。底層網路存在許多複雜性，但 Ktor 預設處理所有這些。
                    </p>
                </step>
            </procedure>
        </chapter>
</chapter>
<chapter title="理解 WebSockets" id="understanding-websockets">
        <p>
            在進入下一個迭代之前，回顧一些 WebSockets 的基礎知識可能會有所幫助。
            如果您已經熟悉 WebSockets，您可以繼續<a href="#improve-design">改進服務的設計</a>。
        </p>
        <p>
            在先前的教學中，您的用戶端傳送 HTTP 請求並接收 HTTP 回應。這運作良好，並使網際網路具有可擴展性和彈性。
        </p>
        <p>然而，它不適用於以下情境：</p>
        <list>
            <li>內容隨時間遞增產生。</li>
            <li>內容根據事件頻繁變化。</li>
            <li>用戶端需要在內容產生時與伺服器互動。</li>
            <li>一個用戶端傳送的資料需要快速傳播給其他用戶端。</li>
        </list>
        <p>
            這些情境的範例包括股票交易、購買電影和音樂會門票、在線上拍賣中競標以及社交媒體中的聊天功能。WebSockets 的開發就是為了處理這些情況。
        </p>
        <p>
            WebSocket 連線透過 TCP 建立，並且可以持續較長時間。此連線提供「全雙工通訊」，意味著用戶端可以同時向伺服器傳送訊息並從伺服器接收訊息。
        </p>
        <p>
            WebSocket API 定義了四個事件（open、message、close 和 error）和兩種動作（send 和 close）。
            此功能的存取方式可能因不同的語言和函式庫而異。
            例如，在 Kotlin 中，您可以將傳入訊息序列作為 <a
                href="https://kotlinlang.org/docs/flow.html">Flow</a> 消耗。
        </p>
</chapter>
<chapter title="改進設計" id="improve-design">
        <p>接下來，您將重構現有程式碼，為更進階的範例騰出空間。</p>
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
                    並新增一個 <code>TaskRepository</code> 型別：
                </p>
                <code-block lang="kotlin" code="package model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
                <p>您可能還記得此程式碼來自先前的教學。</p>
            </step>
            <step>
                導覽至
                <Path>plugins</Path>
                套件並開啟
                <Path>Sockets.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    您現在可以透過利用
                    <code>TaskRepository</code>
                    來簡化 <code>Application.configureSockets()</code> 中的路由：
                </p>
                <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000)&#10;                            }&#10;&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                    }"/>
            </step>
        </procedure>
</chapter>
<chapter title="透過 WebSockets 傳送訊息" id="send-messages">
        <p>
            為了說明 WebSockets 的強大功能，您將建立一個新端點，其中：
        </p>
        <list>
            <li>
                當用戶端啟動時，它會接收所有現有任務。
            </li>
            <li>
                用戶端可以建立和傳送任務。
            </li>
            <li>
                當一個用戶端傳送任務時，其他用戶端會收到通知。
            </li>
        </list>
        <procedure>
            <step>
                <p>
                    在
                    <Path>Sockets.kt</Path>
                    檔案中，將目前的 <code>configureSockets()</code> 方法替換為以下實作：
                </p>
                <code-block lang="kotlin" code="fun Application.configureSockets() {&#10;    install(WebSockets) {&#10;        contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;        pingPeriod = 15.seconds&#10;        timeout = 15.seconds&#10;        maxFrameSize = Long.MAX_VALUE&#10;        masking = false&#10;    }&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000)&#10;    }&#10;}"/>
                <p>透過此程式碼，您已執行以下操作：</p>
                <list>
                    <li>
                        將傳送所有現有任務的功能重構為輔助方法。
                    </li>
                    <li>
                        在 <code>routing</code> 區塊中，您建立了一個執行緒安全的 <code>session</code>
                        物件列表，以追蹤所有用戶端。
                    </li>
                    <li>
                        新增了一個相對 URL 為 <code>/task2</code> 的新端點。當用戶端連接到
                        此端點時，對應的 <code>session</code> 物件會被新增到列表中。伺服器
                        隨後進入無限迴圈，等待接收新任務。收到新任務後，伺服器
                        將其儲存到儲存庫中，並將副本傳送給所有用戶端，包括當前的用戶端。
                    </li>
                </list>
                <p>
                    為了測試此功能，您將建立一個擴展
                    <Path>index.html</Path>
                    功能的頁面。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>src/main/resources/static</Path>
                    內建立一個名為
                    <Path>wsClient.html</Path>
                    的新 HTML 檔案。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>wsClient.html</Path>
                    並新增以下內容：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create a new task&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    這個新頁面引入了一個 HTML 表單，使用者可以在其中輸入新任務的資訊。
                    提交表單後，會呼叫 <code>sendTaskToServer</code> 事件處理器。這會用
                    表單資料建置一個 JavaScript 物件，並使用 WebSocket 物件的
                    <code>send</code> 方法將其傳送給伺服器。
                </p>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕（<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新執行圖示"/>）來重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>為了測試此功能，並排開啟兩個瀏覽器並按照以下步驟操作。</p>
                <list type="decimal">
                    <li>
                        在瀏覽器 A 中，導覽至
                        [http://0.0.0.0:8080/static/wsClient.html](http://0.0.0.0:8080/static/wsClient.html)。
                        您應該會看到預設任務顯示。
                    </li>
                    <li>
                        在瀏覽器 A 中新增一個任務。新任務應該會出現在該頁面的表格中。
                    </li>
                    <li>
                        在瀏覽器 B 中，導覽至
                        [http://0.0.0.0:8080/static/wsClient.html](http://0.0.0.0:8080/static/wsClient.html)。
                        您應該會看到預設任務，以及您在瀏覽器 A 中新增的任何新任務。
                    </li>
                    <li>
                        在任一瀏覽器中新增一個任務。您應該會看到新項目同時出現在兩個頁面上。
                    </li>
                </list>
                <img src="tutorial_server_websockets_iteration_2_test.gif"
                     alt="兩個網頁並排顯示透過 HTML 表單建立新任務的過程"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
</chapter>
<chapter title="新增自動化測試" id="add-automated-tests">
        <p>
            為了簡化您的品保流程，使其快速、可重現且無需手動操作，您可以使用 Ktor 內建的
            <Links href="/ktor/server-testing" summary="了解如何使用特殊的測試引擎測試您的伺服器應用程式。">自動化測試支援</Links>。請按照以下步驟操作：
        </p>
        <procedure>
            <step>
                <p>
                    將以下依賴項新增到
                    <Path>build.gradle.kts</Path>
                    中，以允許您在 Ktor 用戶端中配置 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有兩個目的：協商用戶端和伺服器之間的媒體類型，以及以特定格式序列化/反序列化內容。">內容協商</Links> 支援：
                </p>
                <code-block lang="kotlin" code="    testImplementation(&quot;io.ktor:ktor-client-content-negotiation-jvm:$ktor_version&quot;)"/>
            </step>
            <step>
                <p>
                    <p>在 IntelliJ IDEA 中，點擊編輯器右側的 Gradle 通知圖示
                        (<img alt="IntelliJ IDEA Gradle 圖示"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        以載入 Gradle 變更。</p>
                </p>
            </step>
            <step>
                <p>
                    導覽至
                    <Path>src/test/kotlin/com/example</Path>
                    並開啟
                    <Path>ApplicationTest.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    將產生測試類別替換為以下實作：
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.plugins.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlinx.coroutines.flow.*&#10;import kotlinx.serialization.json.Json&#10;import model.Priority&#10;import model.Task&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        application {&#10;            configureRouting()&#10;            configureSerialization()&#10;            configureSockets()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
                <p>
                    透過此設定，您：
                </p>
                <list>
                    <li>
                        配置您的服務在測試環境中執行，並啟用與生產環境中相同的功能，包括 Routing、JSON 序列化和 WebSockets。
                    </li>
                    <li>
                        在 <Links href="/ktor/client-create-and-configure" summary="了解如何建立和配置 Ktor 用戶端。">Ktor 用戶端</Links> 中配置 Content Negotiation 和 WebSocket 支援。如果沒有這些，用戶端將不知道在使用 WebSocket 連線時如何 (反)序列化 JSON 物件。
                    </li>
                    <li>
                        宣告您期望服務傳回的 <code>Tasks</code> 列表。
                    </li>
                    <li>
                        使用用戶端物件的 <code>websocket</code> 方法向 <code>/tasks</code> 傳送請求。
                    </li>
                    <li>
                        將傳入的任務作為 <code>flow</code> 消耗，並遞增地將它們新增到列表中。
                    </li>
                    <li>
                        一旦收到所有任務，以通常的方式比較 <code>expectedTasks</code> 與 <code>actualTasks</code>。
                    </li>
                </list>
            </step>
        </procedure>
</chapter>
<chapter title="後續步驟" id="next-steps">
        <p>
            幹得好！透過整合 WebSocket 通訊和使用 Ktor 用戶端的自動化測試，您已大幅增強您的任務管理器服務。
        </p>
        <p>
            繼續閱讀
            <Links href="/ktor/server-integrate-database" summary="了解如何使用 Exposed SQL 函式庫將 Ktor 服務連接到資料庫儲存庫。">下一個教學</Links>
            以探索您的服務如何使用 Exposed 函式庫與關聯式資料庫無縫互動。
        </p>
</chapter>
</topic>