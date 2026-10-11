<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Ktor 與 Kotlin 處理 HTTP 請求並產生回應" id="server-requests-and-responses">
    <show-structure for="chapter,procedure" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-routing-and-requests"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        透過建置工作管理員應用程式，學習在 Kotlin 中使用 Ktor 進行路由、處理請求以及參數的基礎知識。
    </link-summary>
    <card-summary>
        透過建立工作管理員應用程式，了解路由與請求在 Ktor 中如何運作。
    </card-summary>
    <web-summary>
        了解使用 Kotlin 與 Ktor 建立之服務的驗證、錯誤處理與單元測試基礎。
    </web-summary>
    <p>
        在本教學中，你將透過建置一個工作管理員應用程式，學習在 Kotlin 中使用 Ktor 進行路由、處理請求以及參數的基礎知識。
    </p>
    <p>
        完成本教學後，你將了解如何執行以下操作：
    </p>
    <list type="bullet">
        <li>處理 GET 與 POST 請求。</li>
        <li>從請求中擷取資訊。</li>
        <li>在轉換資料時處理錯誤。</li>
        <li>使用單元測試來驗證路由。</li>
    </list>
    <chapter title="先決條件" id="prerequisites">
        <p>
            這是「Ktor Server 入門」指南的第二篇教學。你可以獨立完成本教學，但強烈建議先完成上一篇教學，以了解如何<Links href="/ktor/server-create-a-new-project" summary="Learn how to open, run and test a server application with Ktor.">建立、開啟並執行新的 Ktor 專案</Links>。
        </p>
        <p>對 HTTP 請求類型、標頭和狀態碼有基本了解也會很有幫助。</p>
        <p>我們建議安裝 <a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>，但你也可以選擇使用其他偏好的 IDE。
        </p>
    </chapter>
    <chapter title="工作管理員應用程式" id="sample-application">
        <p>在本教學中，你將逐步建置一個具備以下功能性的工作管理員應用程式：</p>
        <list type="bullet">
            <li>以 HTML 表格檢視所有可用的工作。</li>
            <li>依優先級和名稱檢視工作，同樣以 HTML 呈現。</li>
            <li>透過提交 HTML 表單新增其他工作。</li>
        </list>
        <p>
            你將以最精簡的方式實作一些基本功能，然後在七個反覆運算中改進並擴充這些功能性。這個最小功能將包含一個含有某些模型型別、值清單以及單一路由的專案。
        </p>
    </chapter>
    <chapter title="顯示靜態 HTML 內容" id="display-static-html">
        <p>在第一個反覆運算中，你將在應用程式中新增一個會傳回靜態 HTML 內容的新路由。</p>
        <p>使用 <a href="https://start.ktor.io">Ktor 專案產生器</a>，建立一個新專案，並將
            <control>com.example.ktor-task-app</control>
            設為
            <control>Project artifact</control>
            名稱。
        </p>
        <tip>
            如需建立新專案的詳細資訊，請參閱<Links href="/ktor/server-create-a-new-project" summary="Learn how to open, run and test a server application with Ktor.">建立、開啟並執行新的 Ktor 專案</Links>。如果你最近剛完成該教學，可以隨意重複使用在那裡建立的專案。
        </tip>
        <procedure>
            <step>開啟
                <Path>src/main/kotlin</Path>
                資料夾中的
                <Path>Routing.kt</Path>
                檔案。
            </step>
            <step>
                <p>將現有的 <code>Application.configureRouting()</code> 函式取代為以下實作：</p>
                <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/tasks&quot;) {&#10;                                    call.respondText(&#10;                                        contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                            text = &quot;&quot;&quot;&#10;                                        &lt;h3&gt;TODO:&lt;/h3&gt;&#10;                                        &lt;ol&gt;&#10;                                            &lt;li&gt;A table of all the tasks&lt;/li&gt;&#10;                                            &lt;li&gt;A form to submit new tasks&lt;/li&gt;&#10;                                        &lt;/ol&gt;&#10;                                        &quot;&quot;&quot;.trimIndent()&#10;                                    )&#10;                                }&#10;                            }&#10;                        }"/>
                <p>這樣你就為 URL <code>/tasks</code> 和 GET 請求類型建立了一個新路由。GET 請求是 HTTP 中最基本的請求類型。當使用者在瀏覽器的網址列中輸入內容或點擊一般的 HTML 連結時，就會觸發該請求。</p>
                <p>
                    目前，你只是傳回靜態內容。為了通知用戶端你將發送 HTML，請將 HTTP <code>Content-Type</code> 標頭設定為 <code>"text/html"</code>。
                </p>
            </step>
            <step>
                <p>
                    IDE 會自動新增以下匯入以存取 <code>ContentType</code> 物件：
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.http.ContentType"/>
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，點擊
                    <Path>main.kt</Path>
                    檔案中 <code>main()</code> 函式旁邊的執行裝訂邊圖示（<img alt="IntelliJ IDEA run application icon"
                                                                        src="intellij_idea_gutter_icon.svg" height="16"
                                                                        width="16"/>）以啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。你應該會看到顯示的待辦事項清單：
                </p>
                <img src="tutorial_routing_and_requests_implementation_1.png"
                     alt="A browser window displaying a to-do list with two items"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="實作工作模型" id="implement-a-task-model">
        <p>
            現在你已經建立了專案並設定好基本路由，接下來將透過執行以下操作來擴充你的應用程式：
        </p>
        <list type="decimal">
            <li><a href="#create-model-types">建立表示工作的模型型別。</a></li>
            <li><a href="#create-sample-values">宣告包含範例值的工作清單。</a></li>
            <li><a href="#add-a-route">修改路由與請求處理常式以傳回此清單。</a></li>
            <li><a href="#test">使用瀏覽器測試新功能是否正常運作。</a></li>
        </list>
        <procedure title="建立模型型別" id="create-model-types">
            <step>
                <p>在
                    <Path>src/main/kotlin</Path>
                    內部，建立一個名為
                    <Path>model</Path>
                    的新子套件。
                </p>
            </step>
            <step>
                <p>在
                    <Path>model</Path>
                    目錄內，建立一個新的
                    <Path>Task.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>開啟
                    <Path>Task.kt</Path>
                    檔案，新增以下用於表示優先級的 <code>enum</code> 和表示工作的 <code>class</code>：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            </step>
            <step>
                <p>你將在 HTML 表格中向用戶端發送工作資訊。在同一個 <Path>Task.kt</Path> 檔案中，新增以下擴充函式：</p>
                <code-block lang="kotlin" code="                    fun Task.taskAsRow() = &quot;&quot;&quot;&#10;                        &lt;tr&gt;&#10;                            &lt;td&gt;$name&lt;/td&gt;&lt;td&gt;$description&lt;/td&gt;&lt;td&gt;$priority&lt;/td&gt;&#10;                        &lt;/tr&gt;&#10;                        &quot;&quot;&quot;.trimIndent()&#10;&#10;                    fun List&lt;Task&gt;.tasksAsTable() = this.joinToString(&#10;                        prefix = &quot;&lt;table rules=\&quot;all\&quot;&gt;&quot;,&#10;                        postfix = &quot;&lt;/table&gt;&quot;,&#10;                        separator = &quot;\n&quot;,&#10;                        transform = Task::taskAsRow&#10;                    )"/>
                <list>
                    <li><code>Task.taskAsRow()</code> 函式讓 <code>Task</code> 物件能夠呈現為表格列。</li>
                    <li><code>List&lt;Task&gt;.tasksAsTable()</code> 函式讓工作清單能夠呈現為表格。</li>
                </list>
            </step>
        </procedure>
        <procedure title="建立範例值" id="create-sample-values">
            <step>
                <p>在你的
                    <Path>model</Path>
                    目錄內，建立一個新的
                    <Path>TaskRepository.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>開啟
                    <Path>TaskRepository.kt</Path>
                    並新增以下程式碼以定義工作清單：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )"/>
            </step>
        </procedure>
        <procedure title="新增路由" id="add-a-route">
            <step>
                <p>開啟
                    <Path>Routing.kt</Path>
                    檔案，並將現有的 <code>Application.configureRouting()</code> 函式取代為以下實作：
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    你現在不是向用戶端傳回靜態內容，而是提供工作清單。由於清單無法直接透過網路傳送，因此必須將其轉換為用戶端能夠理解的格式。在這種情況下，工作會轉換為 HTML 表格。
                </p>
            </step>
            <step>
                <p>新增必要的匯入：</p>
                <code-block lang="kotlin" code="                    import com.example.model.*"/>
            </step>
        </procedure>
        <procedure title="測試新功能" id="test">
            <step>
                <p>在 IntelliJ IDEA 中，點擊重新執行按鈕（<img alt="IntelliJ IDEA rerun button icon"
                                                                     src="intellij_idea_rerun_icon.svg"
                                                                     height="16"
                                                                     width="16"/>）
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。它應該會顯示一個包含工作的 HTML 表格：</p>
                <img src="tutorial_routing_and_requests_implementation_2.png"
                     alt="A browser window displaying a table with four rows"
                     border-effect="rounded"
                     width="706"/>
                <p>如果是這樣，恭喜！應用程式的基本功能正常運作。</p>
            </step>
        </procedure>
    </chapter>
    <chapter title="重構模型" id="refactor-the-model">
        <p>
            在繼續擴充應用程式的功能之前，你將透過把值清單封裝在儲存庫中來重構設計。這將使你能夠集中管理資料，從而專注於 Ktor 特有的程式碼。
        </p>
        <procedure>
            <step>
                <p>
                    回到
                    <Path>TaskRepository.kt</Path>
                    檔案，並將現有的工作清單取代為以下程式碼：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;    fun allTasks(): List&lt;Task&gt; = tasks.toList()&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if(taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;}"/>
                <p>
                    這實作了基於清單的工作基本資料存放區。為了說明起見，將保留新增工作的順序，但會透過拋出例外來禁止重複項。</p>
                <p>在後續教學中，你將學習如何透過 <a href="https://github.com/JetBrains/Exposed">Exposed 程式庫</a>實作連線至關聯式資料庫的儲存庫。
                </p>
                <p>
                    現在，你將在路由內部使用此儲存庫。
                </p>
            </step>
            <step>
                <p>
                    開啟
                    <Path>Routing.kt</Path>
                    檔案，並將現有的 <code>Application.configureRouting()</code> 函式取代為以下實作：
                </p>
                <code-block lang="Kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            get(&quot;/tasks&quot;) {&#10;                                val tasks = TaskRepository.allTasks()&#10;                                call.respondText(&#10;                                    contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                    text = tasks.tasksAsTable()&#10;                                )&#10;                            }&#10;                        }&#10;                    }"/>
                <p>
                    當請求到達時，會使用儲存庫擷取目前的工作清單。然後，建構包含這些工作的 HTTP 回應。
                </p>
            </step>
        </procedure>
        <procedure title="測試重構後的程式碼">
            <step>
                <p>在 IntelliJ IDEA 中，點擊重新執行按鈕（<img alt="IntelliJ IDEA rerun button icon"
                                                                     src="intellij_idea_rerun_icon.svg" height="16"
                                                                     width="16"/>）
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>
                    在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。輸出應該保持不變，仍舊顯示 HTML 表格：
                </p>
                <img src="tutorial_routing_and_requests_implementation_2.png"
                     alt="A browser window displaying a table with four rows"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="使用參數" id="work-with-parameters">
        <p>
            在此反覆運算中，你將允許使用者依優先級檢視工作。為此，你的應用程式必須允許對以下 URL 進行 GET 請求：
        </p>
        <list type="bullet">
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/Low"><code>/tasks/byPriority/Low</code></a></li>
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/Medium"><code>/tasks/byPriority/Medium</code></a></li>
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/High"><code>/tasks/byPriority/High</code></a></li>
            <li><a href="http://0.0.0.0:8080/tasks/byPriority/Vital"><code>/tasks/byPriority/Vital</code></a></li>
        </list>
        <p>
            你將新增的路由為
            <code>/tasks/byPriority/{priority?}</code>
            ，其中 <code>{priority?}</code> 表示你需要在執行時期擷取的路徑參數，問號用於表示該參數是選用的。路徑參數可以取任何你喜歡的名稱，但 <code>priority</code> 顯然是最合適的選擇。
        </p>
        <p>
            處理請求的流程可總結如下：
        </p>
        <list type="decimal">
            <li>從請求中擷取名為 <code>priority</code> 的路徑參數。</li>
            <li>如果缺少此參數，則傳回 <code>400 Bad Request</code> 狀態。</li>
            <li>將參數的文字值轉換為 <code>Priority</code> 列舉值。</li>
            <li>如果轉換失敗，則傳回狀態碼為 <code>400</code> 的回應。</li>
            <li>使用儲存庫尋找具有指定優先級的所有工作。</li>
            <li>如果沒有相符的工作，則傳回 <code>404 Not Found</code> 狀態。</li>
            <li>傳回相符的工作，並格式化為 HTML 表格。</li>
        </list>
        <p>
            你將首先實作此功能性，然後找出確認其正常運作的最佳方式。
        </p>
        <procedure title="新增路由">
            <p>開啟
                <Path>Routing.kt</Path>
                檔案並將以下路由新增至程式碼中：
            </p>
            <code-block lang="kotlin" code="                routing {&#10;                    get(&quot;/tasks&quot;) {&#10;                        //...&#10;                    }&#10;&#10;                    //add the following route&#10;                    get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                        val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                        if (priorityAsText == null) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                            return@get&#10;                        }&#10;&#10;                        try {&#10;                            val priority = Priority.valueOf(priorityAsText)&#10;                            val tasks = TaskRepository.tasksByPriority(priority)&#10;&#10;                            if (tasks.isEmpty()) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = tasks.tasksAsTable()&#10;                            )&#10;                        } catch(ex: IllegalArgumentException) {&#10;                            call.respond(HttpStatusCode.BadRequest)&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                透過上述程式碼，你為 URL
                <code>/tasks/byPriority/{priority?}</code>
                撰寫了一個處理常式。符號
                <code>priority</code>
                表示使用者新增的路徑參數。遺憾的是，在伺服器端無法保證這一定是對應 Kotlin 列舉中的四個值之一，因此必須手動檢查。
            </p>
            <p>
                如果缺少路徑參數，伺服器會向用戶端傳回 <code>400</code> 狀態碼。否則，它會擷取參數的值並嘗試將其轉換為列舉成員。如果失敗，則會拋出例外，伺服器會捕獲該例外並傳回 <code>400</code> 狀態碼。
            </p>
            <p>
                假設轉換成功，儲存庫將用於尋找相符的 <code>Tasks</code>。如果沒有指定優先級的工作，伺服器會傳回 <code>404</code> 狀態碼，否則會在 HTML 表格中發送回相符項。
            </p>
        </procedure>
        <procedure title="測試新路由">
            <p>
                你可以透過請求不同的 URL 在瀏覽器中測試此功能性。
            </p>
            <step>
                <p>在 IntelliJ IDEA 中，點擊重新執行按鈕（<img alt="IntelliJ IDEA rerun button icon"
                                                                     src="intellij_idea_rerun_icon.svg"
                                                                     height="16"
                                                                     width="16"/>）
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>
                    若要擷取所有中等優先級的工作，請巡覽至 <a
                        href="http://0.0.0.0:8080/tasks/byPriority/Medium">http://0.0.0.0:8080/tasks/byPriority/Medium</a>：
                </p>
                <img src="tutorial_routing_and_requests_implementation_4.png"
                     alt="A browser window displaying a table with Medium priority tasks"
                     border-effect="rounded"
                     width="706"/>
            </step>
            <step>
                <p>
                    不幸的是，在發生錯誤的情況下，透過瀏覽器能進行的測試相當有限。除非使用開發者擴充套件，否則瀏覽器不會顯示失敗回應的詳細資料。更簡單的替代方案是使用專門的工具，例如 <a
                        href="https://learning.postman.com/docs/sending-requests/requests/">Postman</a>。
                </p>
            </step>
            <step>
                <p>
                    在 Postman 中，對同一個 URL
                    <code>http://0.0.0.0:8080/tasks/byPriority/Medium</code>
                    發送 GET 請求。
                </p>
                <img src="tutorial_routing_and_requests_postman.png"
                     alt="A GET request in Postman showing the response details"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    這會顯示伺服器的原始輸出，以及請求和回應的所有詳細資訊。
                </p>
            </step>
            <step>
                <p>
                    若要檢查在請求重要（vital）工作時是否傳回 <code>404</code> 狀態碼，請發送新的 GET 請求至
                    <code>http://0.0.0.0:8080/tasks/byPriority/Vital</code>。你將會在
                    <control>Response</control>
                    面板的右上角看到顯示的狀態碼。
                </p>
                <img src="tutorial_routing_and_requests_postman_vital.png"
                     alt="A GET request in Postman showing the status code"
                     border-effect="rounded"
                     width="706"/>
            </step>
            <step>
                <p>
                    若要驗證指定無效優先級時是否傳回 <code>400</code> 狀態碼，請使用無效屬性建立另一個 GET 請求：
                </p>
                <img src="tutorial_routing_and_requests_postman_bad_request.png"
                     alt="A GET request in Postman with a Bad Request status code"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增單元測試" id="add-unit-tests">
        <p>
            到目前為止，你已經新增了兩個路由——一個用於擷取所有工作，另一個用於依優先級擷取工作。像 Postman 這樣的工具能讓你完整測試這些路由，但它們需要手動檢查，且在 Ktor 外部執行。
        </p>
        <p>
            在建立原型和小型應用程式時，這是可以接受的。然而，這種方法無法擴展到可能有數千個測試需要經常執行的大型應用程式中。更好的解決方案是讓測試完全自動化。
        </p>
        <p>
            Ktor 提供了自己的<Links href="/ktor/server-testing" summary="Learn how to test your server application using a special testing engine.">測試架構</Links>以支援路由的自動化驗證。接下來，你將為應用程式的現有功能性撰寫一些測試。
        </p>
        <procedure>
            <step>
                <p>
                    巡覽至
                    <Path>src/test/kotlin</Path>
                    資料夾並開啟
                    <Path>ServerTest.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>將以下程式碼新增至
                    <Path>ServerTest.kt</Path>
                    檔案中：
                </p>
                <code-block lang="kotlin" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;}"/>
                <p>
                    在每個測試中，都會建立一個新的 Ktor 執行個體。這是在測試環境中執行，而不是在 Netty 等 Web 伺服器中執行。專案產生器為你編寫的模組會被載入，進而叫用路由函式。接著你可以使用內建的 <code>client</code> 物件向應用程式發送請求，並驗證傳回的回應。
                </p>
                <p>
                    測試可以在 IDE 內部執行，也可以作為 CI/CD 管線的一部分執行。
                </p>
            </step>
            <step>
                <p>若要在 IntelliJ IDEA 中執行測試，請點擊每個測試函式旁邊的裝訂邊圖示（<img
                        alt="IntelliJ IDEA gutter icon"
                        src="intellij_idea_gutter_icon.svg"
                        width="16" height="26"/>）。</p>
                <tip>
                    有關如何在 IntelliJ IDEA 中執行單元測試的詳細資訊，請參閱 <a
                        href="https://www.jetbrains.com/help/idea/performing-tests.html">IntelliJ IDEA 文件</a>。
                </tip>
            </step>
        </procedure>
    </chapter>
    <chapter title="處理 POST 請求" id="handle-post-requests">
        <p>
            你可以遵循上述流程為 GET 請求建立任意數量的其他路由。這些路由允許使用者使用任何偏好的搜尋條件來擷取工作。但使用者可能也希望能夠建立新工作。
        </p>
        <p>
            在這種情況下，適當的 HTTP 請求類型是 POST。POST 請求通常在使用者填寫並提交 HTML 表單時觸發。
        </p>
        <p>
            與 GET 請求不同，POST 請求具有 <code>body</code>，其中包含表單上所有輸入項的名稱和值。此資訊經過編碼，以區分來自不同輸入項的資料並對非法字元進行跳脫。你不需要擔心此程序的細節，因為瀏覽器和 Ktor 會替我們管理。
        </p>
        <p>
            接下來，你將透過以下步驟擴充現有應用程式以允許建立新工作：
        </p>
        <list type="decimal">
            <li><a href="#create-static-content">建立包含 HTML 表單的靜態內容資料夾</a>。</li>
            <li><a href="#register-folder">讓 Ktor 辨識此資料夾，以便提供其內容</a>。</li>
            <li><a href="#add-form-handler">新增一個新的請求處理常式來處理表單提交</a>。</li>
            <li><a href="#test-functionality">測試完成的功能</a>。</li>
        </list>
        <procedure title="建立靜態內容" id="create-static-content">
            <step>
                <p>
                    在 <Path>src/main/resources</Path> 內部，建立一個名為 <Path>task-ui</Path> 的新目錄。這將作為你放置靜態內容的資料夾。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>task-ui</Path>
                    資料夾中，建立一個新的
                    <Path>task-form.html</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>開啟新建立的
                    <Path>task-form.html</Path>
                    檔案並在其中新增以下內容：
                </p>
                <code-block lang="html" code="&lt;!DOCTYPE html&gt;&#10;&lt;html lang=&quot;en&quot;&gt;&#10;&lt;head&gt;&#10;    &lt;meta charset=&quot;UTF-8&quot;&gt;&#10;    &lt;title&gt;Adding a new task&lt;/title&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Adding a new task&lt;/h1&gt;&#10;&lt;form method=&quot;post&quot; action=&quot;/tasks&quot;&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;name&quot;&gt;Name: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;name&quot; name=&quot;name&quot; size=&quot;10&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;description&quot;&gt;Description: &lt;/label&gt;&#10;        &lt;input type=&quot;text&quot; id=&quot;description&quot; name=&quot;description&quot; size=&quot;20&quot;&gt;&#10;    &lt;/div&gt;&#10;    &lt;div&gt;&#10;        &lt;label for=&quot;priority&quot;&gt;Priority: &lt;/label&gt;&#10;        &lt;select id=&quot;priority&quot; name=&quot;priority&quot;&gt;&#10;            &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;            &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;            &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;            &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;        &lt;/select&gt;&#10;    &lt;/div&gt;&#10;    &lt;input type=&quot;submit&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
        </procedure>
        <procedure title="向 Ktor 註冊資料夾" id="register-folder">
            <step>
                <p>
                    巡覽至
                    <Path>src/main/kotlin</Path>
                    中的
                    <Path>Routing.kt</Path>
                    檔案。
                </p>
            </step>
            <step>
                <p>
                    將以下對 <code>staticResources()</code> 的呼叫新增至 <code>Application.configureRouting()</code> 函式中：
                </p>
                <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            // Add the following line&#10;                            staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                            get(&quot;/tasks&quot;) {&#10;                                // ...&#10;                            }&#10;&#10;                            get(&quot;/tasks/byPriority/{priority?}&quot;) {&#10;                                //...&#10;                            }&#10;                        }&#10;                    }"/>
                <p>IDE 隨後應會自動新增以下匯入：</p>
                <code-block lang="kotlin" code="                    import io.ktor.server.http.content.staticResources"/>
            </step>
            <step>
                <p>重新啟動應用程式。</p>
            </step>
            <step>
                <p>
                    在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>。應該會顯示 HTML 表單：
                </p>
                <img src="tutorial_routing_and_requests_implementation_6.png"
                     alt="A browser window displaying an HTML form"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
        <procedure title="新增表單處理常式" id="add-form-handler">
            <p>
                在 <Path>Routing.kt</Path> 檔案中，將以下額外路由新增至 <code>.configureRouting()</code> 函式中：
            </p>
            <code-block lang="kotlin" code="                fun Application.configureRouting() {&#10;                    routing {&#10;                        //...&#10;&#10;                        //add the following route&#10;                        post(&quot;/tasks&quot;) {&#10;                            val formContent = call.receiveParameters()&#10;&#10;                            val params = Triple(&#10;                                formContent[&quot;name&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;description&quot;] ?: &quot;&quot;,&#10;                                formContent[&quot;priority&quot;] ?: &quot;&quot;&#10;                            )&#10;&#10;                            if (params.toList().any { it.isEmpty() }) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@post&#10;                            }&#10;&#10;                            try {&#10;                                val priority = Priority.valueOf(params.third)&#10;                                TaskRepository.addTask(&#10;                                    Task(&#10;                                        params.first,&#10;                                        params.second,&#10;                                        priority&#10;                                    )&#10;                                )&#10;&#10;                                call.respond(HttpStatusCode.NoContent)&#10;                            } catch (ex: IllegalArgumentException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            } catch (ex: IllegalStateException) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                新路由對應至 POST 請求而非 GET 請求。Ktor 透過呼叫 <code>.receiveParameters()</code> 來處理請求主體。這會傳回請求主體中存在的參數集合。
            </p>
            <p>
                這裡有三個參數，因此你可以將關聯的值儲存在 <a
                    href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/"><code>Triple</code></a> 中。如果某個參數不存在，則改為儲存空字串。
            </p>
            <p>
                如果任何值為空，伺服器將傳回狀態碼為 <code>400</code> 的回應。然後，它會嘗試將第三個參數轉換為 <code>Priority</code>，如果成功，則會將資訊作為新的 <code>Task</code> 新增至儲存庫中。這兩項操作都可能導致例外，在這種情況下同樣傳回 <code>400</code> 狀態碼。
            </p>
            <p>
                否則，如果一切成功，伺服器會向用戶端傳回 <code>204 No Content</code> 狀態碼。這表示請求已成功，但沒有新的資訊需要作為結果回傳。
            </p>
        </procedure>
        <procedure title="測試完成的功能" id="test-functionality">
            <step>
                <p>
                    重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>在瀏覽器中巡覽至 <a href="http://0.0.0.0:8080/task-ui/task-form.html">http://0.0.0.0:8080/task-ui/task-form.html</a>。
                </p>
            </step>
            <step>
                <p>
                    在表單中填入範例資料並點擊
                    <control>Submit</control>。
                </p>
                <img src="tutorial_routing_and_requests_iteration_6_test_1.png"
                     alt="A browser window displaying an HTML form with sample data"
                     border-effect="rounded"
                     width="706"/>
                <p>提交表單時，不應導向至新頁面。</p>
            </step>
            <step>
                <p>
                    巡覽至 URL <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>。你應該會看到新工作已被新增。
                </p>
                <img src="tutorial_routing_and_requests_iteration_6_test_2.png"
                     alt="A browser window displaying an HTML table with tasks"
                     border-effect="rounded"
                     width="706"/>
            </step>
            <step>
                <p>
                    若要驗證該功能性，請將以下測試新增至 <Path>ServerTest.kt</Path> 檔案中：
                </p>
                <code-block lang="kotlin"
                            include-symbol="newTasksCanBeAdded" code="package com.example&#10;&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.header&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.client.statement.bodyAsText&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.HttpHeaders&#10;import io.ktor.http.HttpStatusCode&#10;import io.ktor.http.formUrlEncode&#10;import io.ktor.server.testing.testApplication&#10;import kotlin.test.*&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun tasksCanBeFoundByPriority() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Medium&quot;)&#10;        val body = response.bodyAsText()&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertContains(body, &quot;Mow the lawn&quot;)&#10;        assertContains(body, &quot;Paint the fence&quot;)&#10;    }&#10;&#10;    @Test&#10;    fun invalidPriorityProduces400() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Invalid&quot;)&#10;        assertEquals(HttpStatusCode.BadRequest, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun unusedPriorityProduces404() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/tasks/byPriority/Vital&quot;)&#10;        assertEquals(HttpStatusCode.NotFound, response.status)&#10;    }&#10;&#10;    @Test&#10;    fun newTasksCanBeAdded() = testApplication {&#10;        configure()&#10;&#10;        val response1 = client.post(&quot;/tasks&quot;) {&#10;            header(&#10;                HttpHeaders.ContentType,&#10;                ContentType.Application.FormUrlEncoded.toString()&#10;            )&#10;            setBody(&#10;                listOf(&#10;                    &quot;name&quot; to &quot;swimming&quot;,&#10;                    &quot;description&quot; to &quot;Go to the beach&quot;,&#10;                    &quot;priority&quot; to &quot;Low&quot;&#10;                ).formUrlEncode()&#10;            )&#10;        }&#10;        assertEquals(HttpStatusCode.NoContent, response1.status)&#10;&#10;        val response2 = client.get(&quot;/tasks&quot;)&#10;        assertEquals(HttpStatusCode.OK, response2.status)&#10;        val body = response2.bodyAsText()&#10;&#10;        assertContains(body, &quot;swimming&quot;)&#10;        assertContains(body, &quot;Go to the beach&quot;)&#10;    }&#10;}"/>
                <p>
                    在此測試中，向伺服器發送了兩個請求：一個用於建立新工作的 POST 請求，以及一個用於確認新工作已新增的 GET 請求。發送第一個請求時，使用 <code>setBody()</code> 函式將內容插入請求主體中。測試架構在集合上提供了 <code>.formUrlEncode()</code> 擴充函式，它抽象化了像瀏覽器一樣格式化資料的過程。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="重構路由" id="refactor-the-routing">
        <p>
            如果你檢視目前的路由，會發現所有路由都以 <code>/tasks</code> 開頭。你可以透過將它們放入自己的子路由來消除此重複：
        </p>
        <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            //Code remains the same&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            //Code remains the same&#10;                        }&#10;&#10;                        post {&#10;                            //Code remains the same&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
        <p>
            如果你的應用程式發展到有多個子路由的階段，那麼將每個子路由放入自己的幫助程式函式中會更合適。不過目前還不需要這樣做。
        </p>
        <p>
            路由組織得越好，就越容易進行擴充。例如，你可以新增一個依名稱尋找工作的路由：
        </p>
        <code-block lang="kotlin" code="            fun Application.configureRouting() {&#10;                routing {&#10;                    staticResources(&quot;/task-ui&quot;, &quot;task-ui&quot;)&#10;&#10;                    route(&quot;/tasks&quot;) {&#10;                        get {&#10;                            // Code remains the same&#10;                        }&#10;                        get(&quot;/byName/{taskName}&quot;) {&#10;                            val name = call.parameters[&quot;taskName&quot;]&#10;                            if (name == null) {&#10;                                call.respond(HttpStatusCode.BadRequest)&#10;                                return@get&#10;                            }&#10;&#10;                            val task = TaskRepository.taskByName(name)&#10;                            if (task == null) {&#10;                                call.respond(HttpStatusCode.NotFound)&#10;                                return@get&#10;                            }&#10;&#10;                            call.respondText(&#10;                                contentType = ContentType.parse(&quot;text/html&quot;),&#10;                                text = listOf(task).tasksAsTable()&#10;                            )&#10;                        }&#10;&#10;                        get(&quot;/byPriority/{priority?}&quot;) {&#10;                            // Code remains the same&#10;                        }&#10;&#10;                        post {&#10;                            // Code remains the same&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            現在你已經實作了基本路由和請求處理功能。此外，你也認識了驗證、錯誤處理和單元測試。所有這些主題都將在後續的教學中進一步展開。
        </p>
        <p>
            請繼續閱讀<Links href="/ktor/server-create-restful-apis" summary="Learn how to build a backend service using Kotlin and Ktor, featuring an example of a
        RESTful API that generates JSON files.">下一篇教學</Links>，以了解如何為你的工作管理員建立產生 JSON 檔案的 RESTful API。
        </p>
    </chapter>
</topic>