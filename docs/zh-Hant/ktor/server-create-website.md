<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 在 Kotlin 中建立網站" id="server-create-website">
    <show-structure for="chapter,procedure" depth="3"/>
    <tldr>
        <var name="example_name" value="tutorial-server-web-application"/>
        <p>
            <b>程式碼範例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的外掛程式</b>: <Links href="server-static-content.md" summary="了解如何提供靜態內容，例如樣式表、指令碼、圖片等。">Static Content</Links>、
            <Links href="server-thymeleaf.md" summary="所需相依性：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✖️">Thymeleaf</Links>
        </p>
    </tldr>
    <web-summary>
        了解如何使用 Ktor 與 Kotlin 建置網站。本教學將向您示範如何結合 Thymeleaf 範本與 Ktor 路由，在伺服器端產生基於 HTML 的使用者介面。
    </web-summary>
    <card-summary>
        了解如何使用 Ktor 和 Thymeleaf 範本在 Kotlin 中建置網站。
    </card-summary>
    <link-summary>
        了解如何使用 Ktor 和 Thymeleaf 範本在 Kotlin 中建置網站。
    </link-summary>
    <p>
        在本教學中，您將學習如何使用 Ktor 和
        <a href="https://www.thymeleaf.org/">Thymeleaf</a> 範本在 Kotlin 中建置互動式網站。
    </p>
    <p>
        在<Links href="server-create-restful-apis.topic" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，包含產生 JSON 檔案的 RESTful API 範例。">前一個教學</Links>中，您學習了如何建立一個 RESTful 服務，以供由 JavaScript 編寫的單頁應用程式 (SPA) 使用。雖然這是一種非常流行的架構，但它並不適用於所有專案。
    </p>
    <p>
        您可能希望將所有實作保留在伺服器上並僅將標記傳送給用戶端，其原因有很多，例如：
    </p>
    <list>
        <li>簡易性 – 維護單一程式碼庫。</li>
        <li>安全性 – 避免將可能為攻擊者提供洞察的資料或程式碼放置在瀏覽器上。
        </li>
        <li>
            可支援性 – 允許盡可能廣泛的用戶端使用，包括舊版瀏覽器和停用 JavaScript 的瀏覽器。
        </li>
    </list>
    <p>
        Ktor 透過與<Links href="server-templating.md" summary="了解如何使用透過 HTML/CSS 或 JVM 範本引擎建構的檢視。">數種伺服器端頁面技術</Links>整合來支援這種方法。
    </p>
    <chapter title="先決條件" id="prerequisites">
        <p>
            您可以獨立完成本教學，但強烈建議您先完成<Links href="server-create-restful-apis.topic" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，包含產生 JSON 檔案的 RESTful API 範例。">前置教學</Links>，以學習如何建立 RESTful API。
        </p>
        <p>建議您安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，但您也可以使用任何偏好的 IDE。
        </p>
    </chapter>
    <chapter title="Hello 任務管理器 Web 應用程式" id="hello-task-manager">
        <p>
            在本教學中，您將把在<Links href="server-create-restful-apis.topic" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，包含產生 JSON 檔案的 RESTful API 範例。">前一個教學</Links>中建置的任務管理應用程式轉換為 Web 應用程式。為此，您將使用數個 Ktor <Links href="server-plugins.md" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>。
        </p>
        <p>
            雖然您可以手動將這些外掛程式新增至現有專案中，但產生一個新專案並逐步併入前一個教學的程式碼會更簡單。我們會在過程中提供所有必要的程式碼，因此您手邊不需要備妥先前的專案。
        </p>
        <procedure title="使用外掛程式建立初始專案" id="create-project">
            <step>
                <p>
                    前往
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>
                    。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>Project artifact</control>
                    欄位中，輸入
                    <Path>com.example.ktor-task-web-app</Path>
                    作為專案產物的名稱。
                    <img src="server_create_web_app_generator_project_artifact.png"
                         alt="Ktor 專案產生器專案產物名稱"
                         style="block"
                         border-effect="line" width="706"/>
                </p>
            </step>
            <step>
                <p> 在下一個畫面中，搜尋並點擊
                    <control>Add</control>
                    按鈕來新增以下外掛程式：
                </p>
                <list>
                    <li>Static Content</li>
                    <li>Thymeleaf</li>
                </list>
                <p>
                    <img src="ktor_project_generator_add_plugins.gif"
                         alt="在 Ktor 專案產生器中新增外掛程式"
                         border-effect="line"
                         style="block"
                         width="706"/>
                    新增外掛程式後，您將在專案設定下方看到所列出的所有外掛程式。
                    <img src="server_create_web_app_generator_plugins.png"
                         alt="Ktor 專案產生器外掛程式清單"
                         style="block"
                         border-effect="line" width="706"/>
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
        <procedure title="新增入門程式碼" id="add-starter-code">
            <step>
                在 IntelliJ IDEA 或其他您選擇的 IDE 中開啟專案。
            </step>
            <step>
                巡覽至
                <Path>src/main/kotlin</Path>
                並建立名為
                <Path>model</Path>
                的子套件。
            </step>
            <step>
                在
                <Path>model</Path>
                套件中，建立一個新的
                <Path>Task.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    在
                    <Path>Task.kt</Path>
                    檔案中，新增一個表示優先等級的 <code>enum</code> 和一個表示任務的 <code>data class</code>：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    同樣地，您需要建立 <code>Task</code> 物件並以可顯示的形式傳送給用戶端。
                </p>
                <p>
                    您可能還記得：
                </p>
                <list>
                    <li>
                        在<Links href="server-requests-and-responses.topic" summary="透過建置任務管理器應用程式，了解在 Kotlin 中使用 Ktor 進行路由、處理請求以及參數的基本知識。">處理請求並產生回應</Links>教學中，您新增了手寫的擴充函式以將任務轉換為 HTML。
                    </li>
                    <li>
                        在<Links href="server-create-restful-apis.topic" summary="了解如何使用 Kotlin 和 Ktor 建置後端服務，包含產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links>教學中，您使用了來自 <code>kotlinx.serialization</code> 程式庫的 <code>Serializable</code> 型別為 <code>Task</code> 類別加上註解。
                    </li>
                </list>
                <p>
                    在這種情況下，目標是建立一個將任務內容寫入瀏覽器的伺服器端頁面。
                </p>
            </step>
            <step>
                開啟
                <Path>src/main/kotlin</Path>
                中的
                <Path>Routing.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    在 <code>.configureRouting()</code> 函式中，新增一個 <code>/tasks</code> 路由，如下所示：
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        // Add this additional route&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}"/>
                <p>
                    當伺服器收到針對 <code>/tasks</code> 的請求時，它會建立一個任務清單並將其傳遞給 Thymeleaf 範本。<code>ThymeleafContent</code> 型別接受要觸發的範本名稱，以及要在頁面上存取的值資料表。
                </p>
            </step>
            <step>
                開啟
                <Path>src/main/kotlin</Path>
                中的
                <Path>Thymeleaf.kt</Path>
                檔案。
            </step>
            <step>
                <p>您應該會看到以下 <code>.configureThymeleaf</code> 函式：</p>
                <code-block lang="kotlin" code="fun Application.configureThymeleaf() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;}"/>
                <p>
                    在 Thymeleaf 外掛程式的初始化中，Ktor 會在
                    <Path>templates/thymeleaf</Path>
                    資料夾內尋找伺服器端頁面。與靜態內容一樣，它預期此資料夾位於
                    <Path>resources</Path>
                    目錄內。它還預期帶有
                    <Path>.html</Path>
                    副檔名。
                </p>
                <p>
                    在此情況下，名稱 <code>all-tasks</code> 會對應到路徑
                    <code>src/main/resources/templates/thymeleaf/all-tasks.html</code>
                </p>
            </step>
            <step>
                巡覽至 <Path>src/main/resources</Path>
                並建立一個新的 <Path>templates/thymeleaf</Path>
                目錄。
            </step>
            <step>
                在
                <Path>src/main/resources/templates/thymeleaf</Path>
                內，建立一個新的
                <Path>all-tasks.html</Path>
                檔案。
            </step>
            <step>
                <p>開啟
                    <Path>all-tasks.html</Path>
                    檔案並新增以下內容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;All Current Tasks&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，點擊執行按鈕
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="IntelliJ IDEA 執行圖示"/>)
                    以啟動應用程式。</p>
            </step>
            <step>
                <p>
                    在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。您應該會看到所有目前的任務顯示在表格中，如下所示：
                </p>
                <img src="server_create_web_app_all_tasks.png"
                     alt="顯示任務清單的網頁瀏覽器視窗" border-effect="rounded" width="706"/>
                <p>
                    如同所有伺服器端頁面架構，Thymeleaf 範本結合了靜態內容（傳送至瀏覽器）與動態內容（在伺服器上執行）。如果您選擇了其他架構，例如 <a href="https://freemarker.apache.org/">Freemarker</a>，您可以使用稍微不同的語法提供相同的功能。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增 GET 路由" id="add-get-routes">
        <p>現在您已熟悉請求伺服器端頁面的流程，請繼續將前幾個教學的功能轉移到此教學中。</p>
        <p>因為您包含了
            <control>Static Content</control>
            外掛程式，所以以下程式碼會出現在
            <Path>Routing.kt</Path>
            檔案中：
        </p>
        <code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
        <p>
            這表示，例如對 <code>/static/index.html</code> 的請求會由以下路徑提供內容：
        </p>
        <code>src/main/resources/static/index.html</code>
        <p>
            由於此檔案已經是產生專案的一部分，您可以將其用作要新增之功能的首頁。
        </p>
        <procedure title="重用 index 頁面">
            <step>
                <p>
                    開啟
                    <Path>src/main/resources/static</Path>
                    中的
                    <Path>index.html</Path>
                    檔案，並將其內容取代為以下實作：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Task Manager Web Application&lt;/h1&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;&lt;a href=&quot;/tasks&quot;&gt;View all the tasks&lt;/a&gt;&lt;/h3&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View tasks by priority&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byPriority&quot;&gt;&#10;        &lt;select name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;View a task by name&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byName&quot;&gt;&#10;        &lt;input type=&quot;text&quot; name=&quot;name&quot; width=&quot;10&quot;&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create or edit a task&lt;/h3&gt;&#10;    &lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;description&quot;&#10;                   name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新執行圖示"/>) 以重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    在瀏覽器中巡覽至 <a href="http://localhost:8080/static/index.html">http://localhost:8080/static/index.html</a>。您應該會看到一個連結按鈕和三個 HTML 表單，可讓您檢視、篩選和建立任務：
                </p>
                <img src="server_create_web_app_tasks_form.png"
                     alt="顯示 HTML 表單的網頁瀏覽器" border-effect="rounded" width="706"/>
                <p>
                    請注意，當您依 <code>name</code> 或 <code>priority</code> 篩選任務時，您是透過 GET 請求提交 HTML 表單。這表示參數會新增至 URL 後方的查詢字串中。
                </p>
                <p>
                    例如，如果您搜尋優先等級為 <code>Medium</code> 的任務，傳送至伺服器的請求如下所示：
                </p>
                <code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
            </step>
        </procedure>
        <procedure title="重用任務存儲庫" id="task-repository">
            <p>
                任務存儲庫可以與前一個教學中的存儲庫保持完全相同。
            </p>
            <p>
                在
                <Path>model</Path>
                套件中建立一個新的
                <Path>TaskRepository.kt</Path>
                檔案並新增以下程式碼：
            </p>
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
        </procedure>
        <procedure title="重用 GET 請求的路由" id="reuse-routes">
            <p>
                建立存儲庫後，您現在可以實作 GET 請求的路由。
            </p>
            <step>
                巡覽至
                <Path>src/main/kotlin</Path>
                中的
                <Path>Routing.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    將目前版本的 <code>.configureRouting()</code> 取代為以下實作：
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, World!&quot;)&#10;        }&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&quot;index&quot;, mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))))&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    上述程式碼可歸納如下：
                </p>
                <list>
                    <li>
                        在對 <code>/tasks</code> 的 GET 請求中，伺服器會從存儲庫擷取所有任務，並使用
                        <Path>all-tasks</Path>
                        範本產生傳送至瀏覽器的下一個檢視。
                    </li>
                    <li>
                        在對 <code>/tasks/byName</code> 的 GET 請求中，伺服器會從 <code>queryString</code> 擷取參數
                        <code>name</code>，尋找相符的任務，並使用
                        <Path>single-task</Path>
                        範本產生傳送至瀏覽器的下一個檢視。
                    </li>
                    <li>
                        在對 <code>/tasks/byPriority</code> 的 GET 請求中，伺服器會從 <code>queryString</code> 擷取參數
                        <code>priority</code>，尋找相符的任務，並使用
                        <Path>tasks-by-priority</Path>
                        範本產生傳送至瀏覽器的下一個檢視。
                    </li>
                </list>
                <p>為了使這一切正常運作，您需要新增額外的範本。</p>
            </step>
            <step>
                巡覽至
                <Path>src/main/resources/templates/thymeleaf</Path>
                並建立一個新的
                <Path>single-task.html</Path>
                檔案。
            </step>
            <step>
                <p>
                    開啟
                    <Path>single-task.html</Path>
                    檔案並新增以下內容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;All Current Tasks&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;The Selected Task&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>在同一個資料夾中，建立名為
                    <Path>tasks-by-priority.html</Path>
                    的新檔案。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>tasks-by-priority.html</Path>
                    檔案並新增以下內容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Tasks By Priority &lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Tasks With Priority &lt;span th:text=&quot;${priority}&quot;&gt;&lt;/span&gt;&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&#10;        &lt;th&gt;Description&lt;/th&gt;&#10;        &lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增對 POST 請求的支援" id="add-post-requests">
        <p>
            接下來，您將在 <code>/tasks</code> 中新增一個 POST 請求處理常式以執行以下操作：
        </p>
        <list>
            <li>從表單參數中擷取資訊。</li>
            <li>使用存儲庫新增任務。</li>
            <li>透過重用
                <control>all-tasks</control>
                範本來顯示任務。
            </li>
        </list>
        <procedure>
            <step>
                巡覽至
                <Path>src/main/kotlin</Path>
                中的
                <Path>Routing.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    在 <code>.configureRouting()</code> 方法中新增以下 <code>post</code> 請求路由：
                </p>
                <code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新執行圖示"/>) 以重新啟動應用程式。
                </p>
            </step>
            <step>
                在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>。
            </step>
            <step>
                <p>
                    在
                    <control>Create or edit a task</control>
                    表單中輸入新的任務詳細資訊。
                </p>
                <img src="server_create_web_app_new_task.png"
                     alt="顯示 HTML 表單的網頁瀏覽器" border-effect="rounded" width="706"/>
            </step>
            <step>
                <p>點擊
                    <control>Submit</control>
                    按鈕以提交表單。
                    隨後您將看到新任務顯示在所有任務的清單中：
                </p>
                <img src="server_create_web_app_new_task_added.png"
                     alt="顯示任務清單的網頁瀏覽器" border-effect="rounded" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            恭喜！您現在已完成將任務管理器重新建置為 Web 應用程式，並學習了如何使用 Thymeleaf 範本。</p>
        <p>
            請繼續閱讀<Links href="server-create-websocket-application.topic" summary="了解如何運用 WebSocket 的強大功能來傳送與接收內容。">下一個教學</Links>，以了解如何使用 WebSocket。
        </p>
    </chapter>
</topic>