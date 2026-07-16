```xml
<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin 和 Ktor 建立網站" id="server-create-website">
<tldr>
    <var name="example_name" value="tutorial-server-web-application"/>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用的外掛程式</b>: <Links href="/ktor/server-routing" summary="路由（Routing）是一個核心外掛程式，用於處理伺服器應用程式中的傳入請求。">Routing</Links>,
        <Links href="/ktor/server-static-content" summary="了解如何提供靜態內容，例如樣式表、腳本、圖片等等。">Static Content</Links>,
        <Links href="/ktor/server-thymeleaf" summary="所需依賴項：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✖️">Thymeleaf</Links>
    </p>
</tldr>
<web-summary>
    了解如何使用 Ktor 和 Kotlin 建立網站。本教學課程將向您展示如何將 Thymeleaf 模板與 Ktor 路由結合，以在伺服器端產生基於 HTML 的使用者介面。
</web-summary>
<card-summary>
    了解如何使用 Kotlin、Ktor 和 Thymeleaf 模板建立網站。
</card-summary>
<link-summary>
    了解如何使用 Kotlin、Ktor 和 Thymeleaf 模板建立網站。
</link-summary>
<p>
    在本教學課程中，我們將向您展示如何使用 Kotlin、Ktor 和
    <a href="https://www.thymeleaf.org/">Thymeleaf</a> 模板建立一個互動式網站。
</p>
<p>
    在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建立後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">上一個教學課程</Links>中，您學習了如何建立 RESTful 服務，我們假設該服務將由以 JavaScript 編寫的單頁應用程式 (SPA) 使用。儘管這是一種非常受歡迎的架構，但它並不適合所有專案。
</p>
<p>
    您可能希望將所有實作保留在伺服器端，並且只向客戶端傳送標記（markup）的原因有很多，例如以下幾點：
</p>
<list>
    <li>簡潔性 - 維護單一程式碼庫。</li>
    <li>安全性 - 防止將可能提供給攻擊者的資料或程式碼放在瀏覽器上。
    </li>
    <li>
        支援性 - 允許客戶端使用盡可能廣泛的客戶端，包括舊版瀏覽器和禁用 JavaScript 的瀏覽器。
    </li>
</list>
<p>
    Ktor 透過整合<Links href="/ktor/server-templating" summary="了解如何使用 HTML/CSS 或 JVM 模板引擎建置視圖。">多種伺服器頁面技術</Links>來支援這種方法。
</p>
<chapter title="先決條件" id="prerequisites">
    <p>
        您可以獨立完成本教學課程，但是，我們強烈建議您完成
        <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建立後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">前一個教學課程</Links>，以了解如何建立 RESTful API。
    </p>
    <p>我們建議您安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a>，但您也可以使用您選擇的其他 IDE。
    </p>
</chapter>
<chapter title="Hello Task Manager 網站應用程式" id="hello-task-manager">
    <p>
        在本教學課程中，您將把在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建立後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">上一個教學課程</Links>中建置的 Task Manager 轉換為一個網站
        應用程式。為此，您將使用多個 Ktor <Links href="/ktor/server-plugins" summary="外掛程式提供常見的功能，例如序列化、內容編碼、壓縮等等。">外掛程式</Links>。
    </p>
    <p>
        雖然您可以手動將這些外掛程式新增到現有專案中，但產生一個新專案
        並逐步整合上一個教學課程中的程式碼會更容易。我們將一路提供所有必要的程式碼，因此您無需手邊有以前的專案。
    </p>
    <procedure title="建立包含外掛程式的初始專案" id="create-project">
        <step>
            <p>
                導航至
                <a href="https://start.ktor.io/">Ktor 專案產生器</a>
                。
            </p>
        </step>
        <step>
            <p>
                在
                <control>專案 Artifact</control>
                欄位中，輸入
                <Path>com.example.ktor-task-web-app</Path>
                作為您專案 artifact 的名稱。
                <img src="server_create_web_app_generator_project_artifact.png"
                     alt="Ktor 專案產生器專案 artifact 名稱"
                     style="block"
                     border-effect="line" width="706"/>
            </p>
        </step>
        <step>
            <p> 在下一個畫面中，透過點擊
                <control>新增</control>
                按鈕來搜尋並新增以下外掛程式：
            </p>
            <list>
                <li>Routing</li>
                <li>Static Content</li>
                <li>Thymeleaf</li>
            </list>
            <p>
                <img src="ktor_project_generator_add_plugins.gif"
                     alt="在 Ktor 專案產生器中新增外掛程式"
                     border-effect="line"
                     style="block"
                     width="706"/>
                一旦您新增了這些外掛程式，您將會在專案設定下方看到所有
                三個外掛程式。
                <img src="server_create_web_app_generator_plugins.png"
                     alt="Ktor 專案產生器外掛程式列表"
                     style="block"
                     border-effect="line" width="706"/>
            </p>
        </step>
        <step>
            <p>
                點擊
                <control>下載</control>
                按鈕來產生並下載您的 Ktor 專案。
            </p>
        </step>
    </procedure>
    <procedure title="新增啟動程式碼" id="add-starter-code">
        <step>
            在 IntelliJ IDEA 或您選擇的其他 IDE 中開啟您的專案。
        </step>
        <step>
            導航至
            <Path>src/main/kotlin/com/example</Path>
            並建立一個名為
            <Path>model</Path>
            的子套件。
        </step>
        <step>
            在
            <Path>model</Path>
            套件內，建立一個新的
            <Path>Task.kt</Path>
            檔案。
        </step>
        <step>
            <p>
                在
                <Path>Task.kt</Path>
                檔案中，新增一個 <code>enum</code> 來表示優先順序，以及一個 <code>data class</code> 來表示
                任務：
            </p>
            <code-block lang="kotlin" code="enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                我們再次希望建立 <code>Task</code> 物件並以可顯示的形式將它們傳送到客戶端。
            </p>
            <p>
                您可能還記得：
            </p>
            <list>
                <li>
                    在<Links href="/ktor/server-requests-and-responses" summary="了解如何使用 Kotlin 和 Ktor 透過建置任務管理應用程式來學習路由、處理請求和參數的基礎知識。">處理請求並產生回應</Links>
                    教學課程中，我們新增了手寫的擴展函式（extension functions）來將任務轉換為 HTML。
                </li>
                <li>
                    在<Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 建立後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links> 教學課程中，我們使用
                    <code>kotlinx.serialization</code> 函式庫中的
                    <code>Serializable</code> 類型來註解 <code>Task</code> 類別。
                </li>
            </list>
            <p>
                在這種情況下，我們的目標是建立一個伺服器頁面，可以將任務的內容寫入
                瀏覽器。
            </p>
        </step>
        <step>
            開啟
            <Path>plugins</Path>
            套件內的
            <Path>Templating.kt</Path>
            檔案。
        </step>
        <step>
            <p>
                在 <code>configureTemplating()</code> 方法中，新增一個 <code>/tasks</code> 的路由，如下所示：
            </p>
            <code-block lang="kotlin" code="fun Application.configureTemplating() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;    routing {&#10;        get(&quot;/html-thymeleaf&quot;) {&#10;            call.respond(ThymeleafContent(&#10;                &quot;index&quot;,&#10;                mapOf(&quot;user&quot; to ThymeleafUser(1, &quot;user1&quot;))&#10;            ))&#10;        }&#10;        //this is the additional route to add&#10;        get(&quot;/tasks&quot;) {&#10;            val tasks = listOf(&#10;                Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;            )&#10;            call.respond(ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks)))&#10;        }&#10;    }&#10;}"/>
            <p>
                當伺服器收到 <code>/tasks</code> 的請求時，它會建立一個任務列表，然後
                將其傳遞給 Thymeleaf 模板。<code>ThymeleafContent</code> 類型接受我們希望觸發的模板名稱以及我們希望在頁面上可存取的數值表。
            </p>
            <p>
                在方法頂部 Thymeleaf 外掛程式的初始化中，您可以看到 Ktor
                將在
                <Path>templates/thymeleaf</Path>
                中尋找伺服器頁面。與靜態內容一樣，它會預期此資料夾位於
                <Path>resources</Path>
                目錄內。它還會預期有一個
                <Path>.html</Path>
                副檔名。
            </p>
            <p>
                在這種情況下，名稱 <code>all-tasks</code> 將映射到路徑
                <code>src/main/resources/templates/thymeleaf/all-tasks.html</code>
            </p>
        </step>
        <step>
            導航至
            <Path>src/main/resources/templates/thymeleaf</Path>
            並建立一個新的
            <Path>all-tasks.html</Path>
            檔案。
        </step>
        <step>
            <p>開啟
                <Path>all-tasks.html</Path>
                檔案並新增以下內容：
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;所有當前任務&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;所有當前任務&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;名稱&lt;/th&gt;&lt;th&gt;描述&lt;/th&gt;&lt;th&gt;優先順序&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
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
                在您的瀏覽器中導航至 [http://0.0.0.0:8080/tasks](http://0.0.0.0:8080/tasks)。您
                應該會看到所有當前任務以表格形式顯示，如下所示：
            </p>
            <img src="server_create_web_app_all_tasks.png"
                 alt="一個顯示任務列表的網頁瀏覽器視窗" border-effect="rounded" width="706"/>
            <p>
                像所有伺服器頁面框架一樣，Thymeleaf 模板將靜態內容（傳送到瀏覽器）
                與動態內容（在伺服器上執行）混合。如果我們選擇了替代框架，例如
                <a href="https://freemarker.apache.org/">Freemarker</a>，我們可以使用稍微不同的語法提供相同的功能。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="新增 GET 路由" id="add-get-routes">
    <p>現在您已熟悉請求伺服器頁面的過程，請繼續將先前教學課程中的功能轉移到本教學課程中。</p>
    <p>由於您包含了
        <control>靜態內容</control>
        外掛程式，以下程式碼將會出現在
        <Path>Routing.kt</Path>
        檔案中：
    </p>
    <code-block lang="kotlin" code="            staticResources(&quot;/static&quot;, &quot;static&quot;)"/>
    <p>
        這表示，例如，對 <code>/static/index.html</code> 的請求將從
        以下路徑提供內容：
    </p>
    <code>src/main/resources/static/index.html</code>
    <p>
        由於此檔案已是生成專案的一部分，您可以將其用作您希望新增功能的主頁。
    </p>
    <procedure title="重用索引頁面">
        <step>
            <p>
                開啟
                <Path>src/main/resources/static</Path>
                中的
                <Path>index.html</Path>
                檔案，並將其內容替換為以下實作：
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;任務管理網站應用程式&lt;/h1&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;&lt;a href=&quot;/tasks&quot;&gt;檢視所有任務&lt;/a&gt;&lt;/h3&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;依優先順序檢視任務&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byPriority&quot;&gt;&#10;        &lt;select name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;低&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;中&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;高&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;緊急&lt;/option&gt;&#10;        &lt;/select&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;依名稱檢視任務&lt;/h3&gt;&#10;    &lt;form method=&quot;get&quot; action=&quot;/tasks/byName&quot;&gt;&#10;        &lt;input type=&quot;text&quot; name=&quot;name&quot; width=&quot;10&quot;&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;建立或編輯任務&lt;/h3&gt;&#10;    &lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;name&quot;&gt;名稱： &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;description&quot;&gt;描述： &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;description&quot;&#10;                   name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;priority&quot;&gt;優先順序： &lt;/label&gt;&#10;            &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;低&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;中&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;高&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;緊急&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，點擊重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 重新執行圖示"/>) 來重新啟動
                應用程式。
            </p>
        </step>
        <step>
            <p>
                在您的瀏覽器中導航至 [http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)。您應該會看到一個連結按鈕和三個 HTML 表單，
                允許您檢視、篩選和建立任務：
            </p>
            <img src="server_create_web_app_tasks_form.png"
                 alt="一個顯示 HTML 表單的網頁瀏覽器" border-effect="rounded" width="706"/>
            <p>
                請注意，當您透過 <code>name</code> 或 <code>priority</code> 篩選任務時，您是
                透過 GET 請求提交 HTML 表單。這表示參數將會被新增到
                URL 後面的查詢字串中。
            </p>
            <p>
                例如，如果您搜尋 <code>Medium</code> 優先順序的任務，這就是將
                傳送到伺服器的請求：
            </p>
            <code>http://localhost:8080/tasks/byPriority?priority=Medium</code>
        </step>
    </procedure>
    <procedure title="重用 TaskRepository" id="task-repository">
        <p>
            任務的儲存庫可以與前一個教學課程中的儲存庫保持相同。
        </p>
        <p>
            在
            <Path>model</Path>
            套件內，建立一個新的
            <Path>TaskRepository.kt</Path>
            檔案並新增以下程式碼：
        </p>
        <code-block lang="kotlin" code="object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
    </procedure>
    <procedure title="重用 GET 請求的路由" id="reuse-routes">
        <p>
            現在您已建立了儲存庫，您可以實作 GET 請求的路由。
        </p>
        <step>
            導航至
            <Path>src/main/kotlin/com/example/plugins</Path>
            中的
            <Path>Templating.kt</Path>
            檔案。
        </step>
        <step>
            <p>
                將目前版本的 <code>configureTemplating()</code> 替換為以下實作：
            </p>
            <code-block lang="kotlin" code="fun Application.configureTemplating() {&#10;    install(Thymeleaf) {&#10;        setTemplateResolver(ClassLoaderTemplateResolver().apply {&#10;            prefix = &quot;templates/thymeleaf/&quot;&#10;            suffix = &quot;.html&quot;&#10;            characterEncoding = &quot;utf-8&quot;&#10;        })&#10;    }&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = TaskRepository.allTasks()&#10;                call.respond(&#10;                    ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                )&#10;            }&#10;            get(&quot;/byName&quot;) {&#10;                val name = call.request.queryParameters[&quot;name&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = TaskRepository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(&#10;                    ThymeleafContent(&quot;single-task&quot;, mapOf(&quot;task&quot; to task))&#10;                )&#10;            }&#10;            get(&quot;/byPriority&quot;) {&#10;                val priorityAsText = call.request.queryParameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    val data = mapOf(&#10;                        &quot;priority&quot; to priority,&#10;                        &quot;tasks&quot; to tasks&#10;                    )&#10;                    call.respond(ThymeleafContent(&quot;tasks-by-priority&quot;, data))&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                上述程式碼可以總結如下：
            </p>
            <list>
                <li>
                    在對 <code>/tasks</code> 的 GET 請求中，伺服器從
                    儲存庫中檢索所有任務，並使用
                    <Path>all-tasks</Path>
                    模板產生傳送到瀏覽器的下一個視圖。
                </li>
                <li>
                    在對 <code>/tasks/byName</code> 的 GET 請求中，伺服器從
                    <code>queryString</code> 中檢索參數
                    <code>taskName</code>，找到匹配的任務，並使用
                    <Path>single-task</Path>
                    模板產生傳送到瀏覽器的下一個視圖。
                </li>
                <li>
                    在對 <code>/tasks/byPriority</code> 的 GET 請求中，伺服器從
                    <code>queryString</code> 中檢索
                    參數
                    <code>priority</code>，找到匹配的任務，並使用
                    <Path>tasks-by-priority</Path>
                    模板產生傳送到瀏覽器的下一個視圖。
                </li>
            </list>
            <p>為了讓這一切正常運作，您需要新增額外的模板。</p>
        </step>
        <step>
            導航至
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
            <code-block lang="html" code="&lt;!DOCTYPE html &gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;所選任務&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;所選任務&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;名稱&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;描述&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;優先順序&lt;/th&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
        <step>
            <p>在相同資料夾中，建立一個新檔案，名為
                <Path>tasks-by-priority.html</Path>
                。
            </p>
        </step>
        <step>
            <p>
                開啟
                <Path>tasks-by-priority.html</Path>
                檔案並新增以下內容：
            </p>
            <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html xmlns:th=&quot;http://www.thymeleaf.org&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;依優先順序的任務 &lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;優先順序為 &lt;span th:text=&quot;${priority}&quot;&gt;&lt;/span&gt; 的任務&lt;/h1&gt;&#10;&lt;table&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;名稱&lt;/th&gt;&#10;        &lt;th&gt;描述&lt;/th&gt;&#10;        &lt;th&gt;優先順序&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody&gt;&#10;    &lt;tr th:each=&quot;task: ${tasks}&quot;&gt;&#10;        &lt;td th:text=&quot;${task.name}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.description}&quot;&gt;&lt;/td&gt;&#10;        &lt;td th:text=&quot;${task.priority}&quot;&gt;&lt;/td&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
        </step>
    </procedure>
</chapter>
<chapter title="新增對 POST 請求的支援" id="add-post-requests">
    <p>
        接下來，您將為 <code>/tasks</code> 新增一個 POST 請求處理程式，以執行以下操作：
    </p>
    <list>
        <li>從表單參數中提取資訊。</li>
        <li>使用儲存庫新增一個新任務。</li>
        <li>透過重用
            <control>all-tasks</control>
            模板來顯示任務。
        </li>
    </list>
    <procedure>
        <step>
            導航至
            <Path>src/main/kotlin/com/example/plugins</Path>
            中的
            <Path>Templating.kt</Path>
            檔案。
        </step>
        <step>
            <p>
                在 <code>configureTemplating()</code>
                方法中新增以下 <code>post</code> 請求路由：
            </p>
            <code-block lang="kotlin" code="            post {&#10;                val formContent = call.receiveParameters()&#10;                val params = Triple(&#10;                    formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                    formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                )&#10;                if (params.toList().any { it.isEmpty() }) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@post&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(params.third)&#10;                    TaskRepository.addTask(&#10;                        Task(&#10;                            params.first,&#10;                            params.second,&#10;                            priority&#10;                        )&#10;                    )&#10;                    val tasks = TaskRepository.allTasks()&#10;                    call.respond(&#10;                        ThymeleafContent(&quot;all-tasks&quot;, mapOf(&quot;tasks&quot; to tasks))&#10;                    )&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }"/>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，點擊重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 重新執行圖示"/>) 來重新啟動
                應用程式。
            </p>
        </step>
        <step>
            在您的瀏覽器中導航至 [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)。
        </step>
        <step>
            <p>
                在
                <control>建立或編輯任務</control>
                表單中輸入新任務的詳細資訊。
            </p>
            <img src="server_create_web_app_new_task.png"
                 alt="一個顯示 HTML 表單的網頁瀏覽器" border-effect="rounded" width="706"/>
        </step>
        <step>
            <p>點擊
                <control>提交</control>
                按鈕提交表單。
                您將在所有任務的列表中看到新任務顯示：
            </p>
            <img src="server_create_web_app_new_task_added.png"
                 alt="一個顯示任務列表的網頁瀏覽器" border-effect="rounded" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="後續步驟" id="next-steps">
    <p>
        恭喜！您現在已完成將 Task Manager 重建為網站應用程式，並
        學習了如何利用 Thymeleaf 模板。</p>
    <p>
        繼續前往<Links href="/ktor/server-create-websocket-application" summary="了解如何利用 WebSockets 的強大功能來傳送和接收內容。">下一個教學課程</Links>，學習如何使用
        Web Sockets。
    </p>
</chapter>
</topic>