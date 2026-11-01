<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="如何在 Kotlin 中使用 Ktor 建立 RESTful API" id="server-create-restful-apis"
       help-id="create-restful-apis">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-restful-api"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的外掛程式</b>：<Links href="server-routing.md" summary="Routing 是用於處理伺服器應用程式中連入請求的核心外掛程式。">Routing</Links>、<Links href="server-static-content.md" summary="了解如何提供靜態內容，例如樣式表、指令碼、圖片等。">Static Content</Links>、
            <Links href="server-serialization.md" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端和伺服器之間協商媒體類型，以及以特定格式序列化／反序列化內容。">Content Negotiation</Links>、<a
                href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
        </p>
    </tldr>
    <card-summary>
        了解如何使用 Ktor 建置 RESTful API。本教學透過實際範例介紹設定、路由與測試。
    </card-summary>
    <web-summary>
        了解如何使用 Ktor 建置 Kotlin RESTful API。本教學透過實際範例介紹設定、路由和測試。這是 Kotlin 後端開發人員的理想入門教學。
    </web-summary>
    <link-summary>
        了解如何使用 Kotlin 和 Ktor 建置後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。
    </link-summary>
    <p>
        在本教學中，我們將說明如何使用 Kotlin 和 Ktor 建置後端服務，並以產生 JSON 檔案的 RESTful API 為例。
    </p>
    <p>
        在<Links href="server-requests-and-responses.topic" summary="透過建置任務管理器應用程式，了解在 Kotlin 中使用 Ktor 進行路由、處理請求和參數的基本概念。">上一篇教學</Links>中，我們向您介紹了驗證、錯誤處理和單元測試的基礎知識。本教學將藉由建立一個用於管理任務的 RESTful 服務，進一步擴充這些主題。
    </p>
    <p>
        您將學習如何執行以下操作：
    </p>
    <list>
        <li>建立使用 JSON 序列化的 RESTful 服務。</li>
        <li>理解 <Links href="server-serialization.md" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端和伺服器之間協商媒體類型，以及以特定格式序列化／反序列化內容。">Content Negotiation</Links> 的流程。</li>
        <li>在 Ktor 中定義 REST API 的路由。</li>
    </list>
    <chapter title="先決條件" id="prerequisites">
        <p>您可以獨立閱讀並完成本教學，但我們強烈建議您先完成上一篇教學，以了解如何<Links href="server-requests-and-responses.topic" summary="透過建置任務管理器應用程式，了解在 Kotlin 中使用 Ktor 進行路由、處理請求和參數的基本概念。">處理請求並產生回應</Links>。
        </p>
        <p>我們建議您安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ IDEA</a>，但您也可以選擇使用其他慣用的 IDE。
        </p>
    </chapter>
    <chapter title="Hello RESTful 任務管理器" id="hello-restful-task-manager">
        <p>在本教學中，您將把現有的任務管理器（Task Manager）改寫為 RESTful 服務。為此，您將使用數個 Ktor <Links href="server-plugins.md" summary="外掛程式提供常見的功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>。</p>
        <p>
            雖然您可以手動將其新增至現有專案中，但產生一個新專案並逐步加入上一篇教學中的程式碼會更簡單。您將在進行過程中重新演練所有程式碼，因此手邊沒有上一個專案也沒關係。
        </p>
        <procedure title="建立包含外掛程式的新專案">
            <step>
                <p>
                    前往
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>。
                </p>
            </step>
            <step>
                <p>在
                    <control>Project artifact</control>
                    欄位中，輸入
                    <Path>com.example.ktor-rest-task-app</Path>
                    作為專案產物的名稱。
                    <img src="tutorial_creating_restful_apis_project_artifact.png"
                         alt="在 Ktor Project Generator 中命名專案產物"
                         style="block"
                         border-effect="line"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    在外掛程式區段中，搜尋並點擊
                    <control>Add</control>
                    按鈕以新增以下外掛程式：
                </p>
                <list type="bullet">
                    <li>Content Negotiation</li>
                    <li>kotlinx.serialization</li>
                    <li>Static Content</li>
                </list>
                <p>
                    <img src="ktor_project_generator_add_plugins.gif" alt="在 Ktor Project Generator 中新增外掛程式"
                         border-effect="line"
                         style="block"
                         width="706"/>
                    新增外掛程式後，您將看到專案設定下方列出了所有外掛程式。
                    <img src="tutorial_creating_restful_apis_plugins_list.png"
                         alt="Ktor Project Generator 中的外掛程式清單"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Download</control>
                    按鈕以產生並下載您的 Ktor 專案。
                </p>
            </step>
        </procedure>
        <procedure title="新增初始程式碼" id="add-starter-code">
            <step>
                <p>按照先前在<a href="server-create-a-new-project.topic#open-explore-run">建立、開啟和執行 Ktor 專案</a>教學中所述，在 IntelliJ IDEA 中開啟您的專案。</p>
            </step>
            <step>
                <p>
                    導覽至
                    <Path>src/main/kotlin</Path>
                    並建立名為
                    <Path>model</Path>
                    的子套件。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>model</Path>
                    套件中，建立一個新的
                    <Path>Task.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>Task.kt</Path>
                    檔案，新增一個表示優先等級的 <code>enum</code> 和一個表示任務的 <code>class</code>：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    在上一篇教學中，您使用擴充函式將 <code>Task</code> 轉換為 HTML。而在這裡，<code>Task</code> 類別標註了來自 <code>kotlinx.serialization</code> 程式庫的 <a
                        href="https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/"><code>Serializable</code></a> 型別。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>Routing.kt</Path>
                    檔案，並將現有程式碼替換為以下實作：
                </p>
                <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respond(&#10;                                    listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    與上一篇教學類似，您為 URL <code>/tasks</code> 的 GET 請求建立了一條路由。這次您不再需要手動轉換任務清單，而是直接回傳該清單。
                </p>
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，點擊執行按鈕
                    （<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="IntelliJ IDEA 執行圖示"/>）
                    以啟動應用程式。</p>
            </step>
            <step>
                <p>
                    在瀏覽器中前往 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。您應該會看到 JSON 格式的任務清單，如下所示：
                </p>
            </step>
            <img src="tutorial_creating_restful_apis_starter_code_preview.png"
                 alt="瀏覽器畫面中顯示的 JSON 資料"
                 border-effect="rounded"
                 width="706"/>
            <p>顯然系統已經為我們完成了大量工作。這背後究竟發生了什麼？</p>
        </procedure>
    </chapter>
    <chapter title="理解 Content Negotiation" id="content-negotiation">
        <chapter title="透過瀏覽器進行內容協商" id="via-browser">
            <p>
                在建立專案時，您加入了 <Links href="server-serialization.md" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端和伺服器之間協商媒體類型，以及以特定格式序列化／反序列化內容。">Content Negotiation</Links> 外掛程式。此外掛程式會檢查用戶端能夠呈現的內容類型，並將其與目前服務所能提供的內容類型進行比對。這就是
                <format style="italic">Content Negotiation（內容協商）</format>
                一詞的由來。
            </p>
            <p>
                在 HTTP 中，用戶端透過 <code>Accept</code> 標頭表明其可呈現的內容類型。此標頭的值為一個或多個內容類型。在上述範例中，您可以透過瀏覽器內建的開發人員工具來檢查此標頭的值。
            </p>
            <p>
                請參考以下範例：
            </p>
            <code-block code="                text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"/>
            <p>請注意其中包含的 <code>&#42;/&#42;</code>。此標頭表明它接受 HTML、XML 或圖片，但同時也接受任何其他內容類型。</p>
            <p>Content Negotiation 外掛程式需要找到一種格式來將資料傳回瀏覽器。如果您查看專案中產生的程式碼，會在
                <Path>src/main/kotlin</Path>
                內找到名為
                <Path>Serialization.kt</Path>
                的檔案，其中包含以下內容：
            </p>
            <code-block lang="kotlin" code="fun Application.configureSerialization() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;}"/>
            <p>
                這段程式碼安裝了 <code>ContentNegotiation</code> 外掛程式，同時也設定了 <code>kotlinx.serialization</code> 外掛程式。藉此，當用戶端發送請求時，伺服器即可回傳序列化為 JSON 的物件。
            </p>
            <p>
                在瀏覽器發出請求的情況下，<code>ContentNegotiation</code> 外掛程式知道自己只能回傳 JSON，而瀏覽器會嘗試顯示接收到的任何內容。因此，請求得以成功執行。
            </p>
        </chapter>
        <procedure title="透過 JavaScript 進行內容協商" id="via-javascript">
            <p>
                在實際環境中，通常不會直接在瀏覽器中顯示 JSON。相反地，在瀏覽器中執行的 JavaScript 程式碼會發出請求，然後將回傳的資料作為單頁應用程式（SPA）的一部分進行顯示。通常，此類應用程式是使用像 <a href="https://react.dev/">React</a>、<a href="https://angular.io/">Angular</a> 或 <a href="https://vuejs.org/">Vue.js</a> 等架構撰寫的。
            </p>
            <step>
                <p>
                    為了模擬此情境，請開啟
                    <Path>src/main/resources/static</Path>
                    內的
                    <Path>index.html</Path>
                    頁面，並將預設內容替換為以下內容：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;A Simple SPA For Tasks&lt;/title&gt;&#10;    &lt;script type=&quot;application/javascript&quot;&gt;&#10;        function fetchAndDisplayTasks() {&#10;            fetchTasks()&#10;                .then(tasks =&gt; displayTasks(tasks))&#10;        }&#10;&#10;        function fetchTasks() {&#10;            return fetch(&#10;                &quot;/tasks&quot;,&#10;                {&#10;                    headers: { 'Accept': 'application/json' }&#10;                }&#10;            ).then(resp =&gt; resp.json());&#10;        }&#10;&#10;        function displayTasks(tasks) {&#10;            const tasksTableBody = document.getElementById(&quot;tasksTableBody&quot;)&#10;            tasks.forEach(task =&gt; {&#10;                const newRow = taskRow(task);&#10;                tasksTableBody.appendChild(newRow);&#10;            });&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via JS&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:fetchAndDisplayTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    此頁面包含一個 HTML 表單和一個空表格。提交表單後，JavaScript 事件處理常式會向 <code>/tasks</code> 端點發送請求，並將 <code>Accept</code> 標頭設定為 <code>application/json</code>。接著，回傳的資料會被反序列化並新增至 HTML 表格中。
                </p>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕（<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新執行圖示"/>）以重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    前往 URL <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。您應該可以透過點擊
                    <control>View The Tasks</control>
                    按鈕來擷取資料：
                </p>
                <img src="tutorial_creating_restful_apis_tasks_via_js.png"
                     alt="顯示按鈕以及以 HTML 表格呈現任務的瀏覽器視窗"
                     border-effect="line"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增 GET 路由" id="porting-get-routes">
        <p>
            既然您已經熟悉了內容協商的流程，接下來請繼續將<Links href="server-requests-and-responses.topic" summary="透過建置任務管理器應用程式，了解在 Kotlin 中使用 Ktor 進行路由、處理請求和參數的基本概念。">上一篇教學</Links>中的功能遷移到本篇教學中。
        </p>
        <chapter title="重用任務儲存庫" id="task-repository">
            <p>
                您可以直接重用任務的 repository 而無需任何修改，讓我們先完成這一步。
            </p>
            <procedure>
                <step>
                    <p>
                        在
                        <Path>model</Path>
                        套件中建立一個新的
                        <Path>TaskRepository.kt</Path>
                        檔案。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>TaskRepository.kt</Path>
                        並加入以下程式碼：
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="重用 GET 請求的路由" id="get-requests">
            <p>
                建立儲存庫後，您就可以實作 GET 請求的路由。之前的程式碼可以簡化，因為您不再需要處理將任務轉換為 HTML 的邏輯：
            </p>
            <procedure>
                <step>
                    <p>
                        導覽至
                        <Path>src/main/kotlin</Path>
                        中的
                        <Path>Routing.kt</Path>
                        檔案。
                    </p>
                </step>
                <step>
                    <p>
                        使用以下實作更新 <code>Application.configureRouting()</code> 函式內的 <code>/tasks</code> 路由程式碼：
                    </p>
                    <code-block lang="kotlin" code="                    package com.example&#10;&#10;                    import com.example.model.Priority&#10;                    import com.example.model.TaskRepository&#10;                    import io.ktor.http.*&#10;                    import io.ktor.server.application.*&#10;                    import io.ktor.server.http.content.*&#10;                    import io.ktor.server.response.*&#10;                    import io.ktor.server.routing.*&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            staticResources(&quot;static&quot;, &quot;static&quot;)&#10;&#10;                            //updated implementation&#10;                            route(&quot;/tasks&quot;) {&#10;                                get {&#10;                                    val tasks = TaskRepository.allTasks()&#10;                                    call.respond(tasks)&#10;                                }&#10;&#10;                                get(&quot;/byName/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;&#10;                                    val task = TaskRepository.taskByName(name)&#10;                                    if (task == null) {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                        return@get&#10;                                    }&#10;                                    call.respond(task)&#10;                                }&#10;                                get(&quot;/byPriority/{priority}&quot;) {&#10;                                    val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                                    if (priorityAsText == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@get&#10;                                    }&#10;                                    try {&#10;                                        val priority = Priority.valueOf(priorityAsText)&#10;                                        val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                                        if (tasks.isEmpty()) {&#10;                                            call.respond(HttpStatusCode.NotFound)&#10;                                            return@get&#10;                                        }&#10;                                        call.respond(tasks)&#10;                                    } catch (ex: IllegalArgumentException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                    <p>
                        這樣一來，您的伺服器便能回應以下 GET 請求：</p>
                    <list>
                        <li><code>/tasks</code> 回傳儲存庫中的所有任務。</li>
                        <li><code>/tasks/byName/{taskName}</code> 回傳依指定的 <code>taskName</code> 篩選的任務。
                        </li>
                        <li><code>/tasks/byPriority/{priority}</code> 回傳依指定的 <code>priority</code> 篩選的任務。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        在 IntelliJ IDEA 中，點擊重新執行按鈕（<img src="intellij_idea_rerun_icon.svg"
                                                                       style="inline" height="16" width="16"
                                                                       alt="IntelliJ IDEA 重新執行圖示"/>）以重新啟動應用程式。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="測試功能" id="test-tasks-routes">
            <procedure title="使用瀏覽器">
                <p>您可以在瀏覽器中測試這些路由。例如，前往 <a
                        href="http://0.0.0.0:8080/tasks/byPriority/Medium">http://0.0.0.0:8080/tasks/byPriority/Medium</a>
                    以查看所有優先等級為 <code>Medium</code> 且以 JSON 格式顯示的任務：</p>
                <img src="tutorial_creating_restful_apis_tasks_medium_priority.png"
                     alt="顯示以 JSON 格式呈現中優先等級任務的瀏覽器視窗"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    鑑於這類請求通常來自 JavaScript，進行更精細的測試會更為理想。為此，您可以使用專業工具，例如 <a
                        href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>。
                </p>
            </procedure>
            <procedure title="使用 Postman">
                <step>
                    <p>在 Postman 中，建立一個 URL 為 <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code> 的新 GET 請求。</p>
                </step>
                <step>
                    <p>
                        在
                        <ui-path>Headers</ui-path>
                        面板中，將
                        <ui-path>Accept</ui-path>
                        標頭的值設定為 <code>application/json</code>。
                    </p>
                </step>
                <step>
                    <p>點擊
                        <control>Send</control>
                        發送請求，並在回應檢視器中查看回應。
                    </p>
                    <img src="tutorial_creating_restful_apis_tasks_medium_priority_postman.png"
                         alt="Postman 中的 GET 請求，顯示以 JSON 格式呈現的中優先等級任務"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
            <procedure title="使用 HTTP 請求檔案">
                <p>在 IntelliJ IDEA Ultimate 中，您可以在 HTTP 請求檔案中執行相同的步驟。</p>
                <step>
                    <p>
                        在專案根目錄中，建立一個新的
                        <Path>REST Task Manager.http</Path>
                        檔案。
                    </p>
                </step>
                <step>
                    <p>
                        開啟
                        <Path>REST Task Manager.http</Path>
                        檔案並加入以下 GET 請求：
                    </p>
                    <code-block lang="http" code="GET http://0.0.0.0:8080/tasks/byPriority/Medium&#10;Accept: application/json"/>
                </step>
                <step>
                    <p>
                        若要在 IntelliJ IDEA 中發送請求，請點擊其旁邊的裝訂邊圖示（<img
                            alt="IntelliJ IDEA 裝訂邊圖示"
                            src="intellij_idea_gutter_icon.svg"
                            width="16" height="26"/>）。
                    </p>
                </step>
                <step>
                    <p>這將在
                        <Path>Services</Path>
                        工具視窗中開啟並執行：
                    </p>
                    <img src="tutorial_creating_restful_apis_tasks_medium_priority_http_file.png"
                         alt="HTTP 檔案中的 GET 請求，顯示以 JSON 格式呈現的中優先等級任務"
                         border-effect="rounded"
                         width="706"/>
                </step>
            </procedure>
            <note>
                測試路由的另一種方法是在 Kotlin Notebook 中使用 <a
                    href="https://khttp.readthedocs.io/en/latest/">khttp</a> 程式庫。
            </note>
        </chapter>
    </chapter>
    <chapter title="新增 POST 請求的路由" id="add-a-route-for-post-requests">
        <p>
            在上一篇教學中，任務是透過 HTML 表單建立的。然而，由於您現在建置的是 RESTful 服務，因此不再需要這麼做。相反地，您將使用 <code>kotlinx.serialization</code> 架構，它會承擔大部分繁重的工作。
        </p>
        <procedure>
            <step>
                <p>
                    開啟
                    <Path>src/main/kotlin</Path>
                    內的
                    <Path>Routing.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    在 <code>Application.configureRouting()</code> 函式中新增一個 POST 路由，如下所示：
                </p>
                <code-block lang="kotlin" code="                    //...&#10;&#10;                    fun Application.configureRouting() {&#10;                        routing {&#10;                            //...&#10;&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;&#10;                                //add the following new route&#10;                                post {&#10;                                    try {&#10;                                        val task = call.receive&lt;Task&gt;()&#10;                                        TaskRepository.addTask(task)&#10;                                        call.respond(HttpStatusCode.Created)&#10;                                    } catch (ex: IllegalStateException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    } catch (ex: SerializationException) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    新增以下匯入語句：
                </p>
                <code-block lang="kotlin" code="                    //...&#10;                    import com.example.model.Task&#10;                    import io.ktor.server.request.receive&#10;                    import kotlinx.serialization.SerializationException"/>
                <p>
                    當 POST 請求發送至 <code>/tasks</code> 時，系統會使用 <code>kotlinx.serialization</code> 架構將請求主體轉換為 <code>Task</code> 物件。如果成功，任務將會新增至儲存庫中。如果反序列化流程失敗，伺服器會處理 <code>SerializationException</code>；而如果任務名稱重複，則會處理 <code>IllegalStateException</code>。
                </p>
            </step>
            <step>
                <p>
                    重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    若要在 Postman 中測試此功能，請建立一個發往 URL <code>http://0.0.0.0:8080/tasks</code> 的新 POST 請求。
                </p>
            </step>
            <step>
                <p>
                    在
                    <ui-path>Body</ui-path>
                    面板中加入以下代表新任務的 JSON 文件：
                </p>
                <code-block lang="json" code="{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
                <img src="tutorial_creating_restful_apis_add_task.png"
                     alt="Postman 中用於新增任務的 POST 請求"
                     border-effect="line"
                     width="706"/>
            </step>
            <step>
                <p>點擊
                    <control>Send</control>
                    發送請求。
                </p>
            </step>
            <step>
                <p>
                    您可以透過向 <a
                        href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a> 發送 GET 請求，來驗證任務是否已成功新增。
                </p>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA Ultimate 中，您可以透過在 HTTP 請求檔案中加入以下內容來執行相同的步驟：
                </p>
                <code-block lang="http" code="###&#10;&#10;POST http://0.0.0.0:8080/tasks&#10;Content-Type: application/json&#10;&#10;{&#10;    &quot;name&quot;: &quot;cooking&quot;,&#10;    &quot;description&quot;: &quot;Cook the dinner&quot;,&#10;    &quot;priority&quot;: &quot;High&quot;&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增刪除支援" id="remove-tasks">
        <p>
            您幾乎已經完成了為服務新增基本操作的工作。這些操作通常統稱為 CRUD（建立 Create、讀取 Read、更新 Update 和刪除 Delete）操作。現在您將實作刪除（Delete）操作。
        </p>
        <procedure>
            <step>
                <p>
                    在
                    <Path>TaskRepository.kt</Path>
                    檔案中，於 <code>TaskRepository</code> 物件內加入以下方法，以根據任務名稱刪除任務：
                </p>
                <code-block lang="kotlin" code="    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }"/>
            </step>
            <step>
                <p>
                    開啟
                    <Path>Routing.kt</Path>
                    檔案，並在 <code>routing()</code> 函式中新增一個端點以處理 DELETE 請求：
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        //...&#10;&#10;                        routing {&#10;                            route(&quot;/tasks&quot;) {&#10;                                //...&#10;                                //add the following function&#10;                                delete(&quot;/{taskName}&quot;) {&#10;                                    val name = call.parameters[&quot;taskName&quot;]&#10;                                    if (name == null) {&#10;                                        call.respond(HttpStatusCode.BadRequest)&#10;                                        return@delete&#10;                                    }&#10;&#10;                                    if (TaskRepository.removeTask(name)) {&#10;                                        call.respond(HttpStatusCode.NoContent)&#10;                                    } else {&#10;                                        call.respond(HttpStatusCode.NotFound)&#10;                                    }&#10;                                }&#10;                            }&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    將以下 DELETE 請求新增至您的 HTTP 請求檔案中：
                </p>
                <code-block lang="http" code="###&#10;&#10;DELETE http://0.0.0.0:8080/tasks/gardening"/>
            </step>
            <step>
                <p>
                    若要在 IntelliJ IDEA 中發送 DELETE 請求，請點擊其旁邊的裝訂邊圖示（<img
                        alt="IntelliJ IDEA 裝訂邊圖示"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>）。
                </p>
            </step>
            <step>
                <p>您將在
                    <Path>Services</Path>
                    工具視窗中看到回應：
                </p>
                <img src="tutorial_creating_restful_apis_delete_task.png"
                     alt="HTTP 請求檔案中的 DELETE 請求"
                     border-effect="line"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="使用 Ktor Client 建立單元測試" id="create-unit-tests">
        <p>
            到目前為止，您一直使用手動方式測試應用程式，但正如您已經注意到的，這種方法既耗時且無法擴展規模。相反地，您可以實作 <Links href="server-testing.md" summary="了解如何使用專門的測試引擎測試您的伺服器應用程式。">JUnit 測試</Links>，使用內建的 <code>client</code> 物件來擷取並反序列化 JSON。
        </p>
        <procedure>
            <step>
                <p>
                    開啟
                    <Path>src/test/kotlin</Path>
                    內的
                    <Path>ServerTest.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    將
                    <Path>ServerTest.kt</Path>
                    檔案的內容替換為以下程式碼：
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.call.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.request.*&#10;import io.ktor.http.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val results = response.body&lt;List&lt;Task&gt;&gt;()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;&#10;        val expectedTaskNames = listOf(&quot;gardening&quot;, &quot;painting&quot;)&#10;        val actualTaskNames = results.map(Task::name)&#10;        assertContentEquals(expectedTaskNames, actualTaskNames)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        configure()&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;        }&#10;&#10;        val task = Task(&quot;swimming&quot;, &quot;Go to the beach&quot;, Priority.Low)&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.Json&#10;            )&#10;&#10;            setBody(task)&#10;        }&#10;        assertEquals(HttpStatusCode.Created, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;&#10;        val taskNames = response2&#10;            .body&lt;List&lt;Task&gt;&gt;()&#10;            .map { it.name }&#10;&#10;        assertContains(taskNames, &quot;swimming&quot;)&#10;    }&#10;}"/>
                <p>
                    請注意，您需要在 <a href="client-create-and-configure.md#plugins">Ktor client</a> 中安裝 <code>ContentNegotiation</code> 和 <code>kotlinx.serialization</code> 外掛程式，方式與在伺服器端相同。
                </p>
            </step>
            <step>
                <p>
                    將以下相依性新增至您的
                    <Path>build.gradle.kts</Path>
                    檔案中：
                </p>
                <code-block lang="kotlin" code="                    testImplementation(ktorLibs.client.contentNegotiation)"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="使用 JsonPath 建立單元測試" id="unit-tests-via-jsonpath">
        <p>
            使用 Ktor client 或類似的程式庫測試服務非常方便，但從品質保證（QA）的角度來看存在一個缺點。由於伺服器不直接處理原始 JSON，因此無法完全確保其對 JSON 結構的假設是否正確。
        </p>
        <p>
            例如以下假設：
        </p>
        <list>
            <li>值被儲存在 <code>array</code> 中，但實際上使用的是 <code>object</code>。</li>
            <li>屬性被儲存為 <code>numbers</code>，但實際上它們是 <code>strings</code>。</li>
            <li>成員依宣告順序進行序列化，但事實上並非如此。</li>
        </list>
        <p>
            如果您的服務旨在供多個用戶端使用，那麼對 JSON 結構保持信心至關重要。為了達成此目標，可以使用 Ktor Client 從伺服器擷取文字，然後使用 <a href="https://mvnrepository.com/artifact/com.jayway.jsonpath/json-path">JSONPath</a> 程式庫來分析此內容。</p>
        <procedure>
            <step>
                <p>
                    開啟 <Path>gradle/libs.versions.toml</Path> 檔案，並在其中定義 JSONPath 版本及其程式庫別名：
                </p>
                <code-block lang="toml" code="[versions]&#10;json-path = &quot;2.9.0&quot;&#10;[libraries]&#10;json-path = { module = &quot;com.jayway.jsonpath:json-path&quot;, version.ref = &quot;json-path&quot; }"/>
            </step>
            <step>
                <p>在您的
                    <Path>build.gradle.kts</Path>
                    檔案中，將 JSONPath 程式庫新增至 <code>dependencies</code> 區塊：
                </p>
                <code-block lang="kotlin" code="    testImplementation(libs.json.path)"/>
            </step>
            <step>
                <p>
                    導覽至
                    <Path>src/test/kotlin</Path>
                    資料夾並建立一個新的
                    <Path>ApplicationJsonPathTest.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>ApplicationJsonPathTest.kt</Path>
                    檔案並加入以下內容：
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.jayway.jsonpath.DocumentContext&#10;import com.jayway.jsonpath.JsonPath&#10;import io.ktor.client.*&#10;import com.example.model.Priority&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;import io.ktor.http.*&#10;import io.ktor.server.testing.*&#10;import kotlin.test.*&#10;&#10;&#10;class ApplicationJsonPathTest {&#10;    @Test&#10;    fun tasksCanBeFound() = testApplication {&#10;        configure()&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks&quot;)&#10;&#10;        val result: List&lt;String&gt; = jsonDoc.read(&quot;$[*].name&quot;)&#10;        assertEquals(&quot;cleaning&quot;, result[0])&#10;        assertEquals(&quot;gardening&quot;, result[1])&#10;        assertEquals(&quot;shopping&quot;, result[2])&#10;    }&#10;&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;        val priority = Priority.Medium&#10;        val jsonDoc = client.getAsJsonPath(&quot;/tasks/byPriority/$priority&quot;)&#10;&#10;        val result: List&lt;String&gt; =&#10;            jsonDoc.read(&quot;$[?(@.priority == '$priority')].name&quot;)&#10;        assertEquals(2, result.size)&#10;&#10;        assertEquals(&quot;gardening&quot;, result[0])&#10;        assertEquals(&quot;painting&quot;, result[1])&#10;    }&#10;&#10;    suspend fun HttpClient.getAsJsonPath(url: String): DocumentContext {&#10;        val response = this.get(url) {&#10;            accept(ContentType.Application.Json)&#10;        }&#10;        return JsonPath.parse(response.bodyAsText())&#10;    }&#10;}"/>
                <p>
                    JsonPath 查詢的運作方式如下：
                </p>
                <list>
                    <li>
                        <code>$[&#42;].name</code> 表示「將文件視為陣列，並傳回每個項目的 name 屬性值」。
                    </li>
                    <li>
                        <code>$[?(@.priority == '$priority')].name</code> 表示「傳回陣列中 priority 等於提供值之所有項目的 name 屬性值」。
                    </li>
                </list>
                <p>
                    您可以使用這類查詢來確認自己對回傳 JSON 的理解是否正確。當您進行程式碼重構和服務重新部署時，序列化過程中的任何修改都會被辨識出來，即使這些修改不會破壞目前架構的反序列化。這使您能夠充滿信心地重新發布公開可用的 API。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            恭喜！您現已成功為任務管理器應用程式建立了 RESTful API 服務，並掌握了使用 Ktor Client 和 JsonPath 進行單元測試的精髓。</p>
        <p>
            請繼續閱讀<Links href="server-create-website.topic" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 範本建置網站。">下一篇教學</Links>，以了解如何重用您的 API 服務來建置 Web 應用程式。
        </p>
    </chapter>
</topic>