<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin Multiplatform 建構全端應用程式" id="full-stack-development-with-kotlin-multiplatform">
    <show-structure for="chapter, procedure" depth="2"/>
    <web-summary>
        了解如何使用 Kotlin 和 Ktor 開發跨平台全端應用程式。在本教學中，您將探索如何使用 Kotlin Multiplatform 為 Android、iOS 和桌面建置應用程式，並使用 Ktor 輕鬆處理資料。
    </web-summary>
    <link-summary>
        了解如何使用 Kotlin 和 Ktor 開發跨平台全端應用程式。
    </link-summary>
    <card-summary>
        了解如何使用 Kotlin 和 Ktor 開發跨平台全端應用程式。
    </card-summary>
    <tldr>
        <var name="example_name" value="full-stack-task-manager"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的外掛程式</b>：<Links href="server-routing.md" summary="Routing 是在伺服器應用程式中處理傳入請求的核心外掛程式。">Routing</Links>、
            <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
            <Links href="server-serialization.md" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間協商媒體類型，以及以特定格式序列化／反序列化內容。">Content Negotiation</Links>、
            <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>、
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
        </p>
    </tldr>
    <p>
        在本文中，您將學習如何使用 Kotlin 開發可在 Android、iOS、Web 和桌面平台上執行的全端應用程式，同時利用 Ktor 實現流暢的資料處理。
    </p>
    <p>在本教學結束時，您將了解如何執行以下操作：</p>
    <list>
        <li>使用 <a
                href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
            Kotlin Multiplatform</a> 建立全端應用程式。
        </li>
        <li>理解使用 IntelliJ IDEA 產生的專案。</li>
        <li>建立呼叫 Ktor 服務的 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 用戶端。
        </li>
        <li>在設計的不同層次之間重複使用共用型別。</li>
        <li>正確包含並配置多平台庫。</li>
    </list>
    <p>
        在先前的教學中，我們使用了任務管理器（Task Manager）範例來
        <Links href="server-requests-and-responses.topic" summary="透過建構任務管理器應用程式，了解在 Kotlin 中使用 Ktor 進行路由、處理請求和參數的基本知識。">處理請求</Links>、
        <Links href="server-create-restful-apis.topic" summary="了解如何使用 Kotlin 和 Ktor 建構後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links>，以及
        <Links href="server-integrate-database.md" summary="了解使用 Exposed SQL 程式庫將 Ktor 服務連線至資料庫存儲庫的過程。">透過 Exposed 整合資料庫</Links>。
        用戶端應用程式保持盡可能精簡，以便您可以專注於學習 Ktor 的基礎知識。
    </p>
    <p>
        您將建立一個面向 Android、iOS、Web 和桌面平台的用戶端，使用 Ktor 服務來獲取要顯示的資料。在可能的情況下，您將在用戶端和伺服器之間共用資料型別，從而加快開發速度並減少潛在的錯誤。
    </p>
    <chapter title="先決條件" id="prerequisites">
        <p>
            如同先前的文章，您將使用 IntelliJ IDEA 作為 IDE。若要安裝並配置您的環境，請參閱
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
                Kotlin Multiplatform 快速入門
            </a>
            。
        </p>
        <p>
            如果這是您第一次使用 Compose Multiplatform，我們建議您在開始本教學之前，先完成
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
                Compose Multiplatform 入門
            </a>
            教學。為了降低任務的複雜度，您可以專注於單一用戶端平台。例如，如果您從未接觸過 iOS，專注於桌面或 Android 開發可能是明智的選擇。
        </p>
    </chapter>
    <chapter title="建立新專案" id="create-project">
        <p>
            不使用 Ktor 專案產生器，而是使用 IntelliJ IDEA 中的 Kotlin Multiplatform 專案精靈。
            它將建立一個基礎的多平台專案，您可以為其擴充用戶端和服務。用戶端可以使用原生 UI 程式庫（例如 SwiftUI），但在本教學中，您將使用 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 為所有平台建立共用 UI。
        </p>
        <procedure id="generate-project">
            <step>
                啟動 IntelliJ IDEA。
            </step>
            <step>
                在 IntelliJ IDEA 中，選取
                <ui-path>File | New | Project</ui-path>
                。
            </step>
            <step>
                在左側面板中，選取
                <ui-path>Kotlin Multiplatform</ui-path>
                。
            </step>
            <step>
                在
                <ui-path>New Project</ui-path>
                視窗中指定以下欄位：
                <list>
                    <li>
                        <ui-path>Name</ui-path>
                        : full-stack-task-manager
                    </li>
                    <li>
                        <ui-path>Project ID</ui-path>
                        : com.example.ktor
                    </li>
                </list>
            </step>
            <step>
                <p>
                    選取
                    <ui-path>Android</ui-path>
                    、
                    <ui-path>Desktop</ui-path>
                    、
                    <ui-path>Web</ui-path>
                    以及
                    <ui-path>Server</ui-path>
                    作為目標平台。
                </p>
            </step>
            <step>
                <p>
                    如果您使用的是 Mac，也請選取
                    <ui-path>iOS</ui-path>
                    。請確認已勾選
                    <ui-path>Share UI</ui-path>
                    選項。
                    <img style="block" src="full_stack_development_tutorial_create_project.png"
                         alt="Kotlin Multiplatform 精靈設定" width="706" border-effect="rounded"/>
                </p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Create</control>
                    按鈕，並等待 IDE 產生並匯入專案。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="執行服務" id="run-service">
        <procedure id="run-service-procedure">
            <step>
                在 IntelliJ IDEA 中，選取
                <Path>ApplicationKt</Path>
                运行配置。
                <img src="full_stack_development_tutorial_server_run_configuration.png"
                     alt="Run &amp; Debug 視窗" width="300"
                     border-effect="line" style="block"/>
            </step>
            <step>
                點擊
                <ui-path>Run</ui-path>
                按鈕
                (<img src="intellij_idea_run_icon.svg"
                      style="inline" height="16" width="16"
                      alt="IntelliJ IDEA 執行圖示"/>)
                以執行配置。
                <p>
                    在
                    <ui-path>Run</ui-path>
                    工具視窗中將開啟一個新分頁。
                </p>
            </step>
            <step>
                <p>
                    前往 <a href="http://0.0.0.0:8080/">http://0.0.0.0:8080/</a> 以開啟應用程式。
                    您應該會在瀏覽器中看到來自 Ktor 的訊息。
                    <img src="full_stack_development_tutorial_run.png"
                         alt="Ktor 伺服器瀏覽器回應" width="706"
                         border-effect="rounded" style="block"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="檢查專案" id="examine-project">
        <p>
            <Path>server</Path>
            資料夾是專案中三個 Kotlin 模組之一。另外兩個是
            <Path>core</Path>
            和
            <Path>app</Path>
            。
        </p>
        <p>
            <Path>server</Path>
            模組的結構與 <a href="https://start.ktor.io/">Ktor 專案產生器</a> 產生的結構非常相似。
            您有一個專門的建置檔來宣告外掛程式與相依性，以及一個包含建置和啟動 Ktor 服務程式碼的原始碼集：
        </p>
        <img src="full_stack_development_tutorial_server_folder.png"
             alt="Kotlin Multiplatform 專案中 server 資料夾的內容" width="300"
             border-effect="line"/>
        <p>
            如果您查看
            <Path>Application.kt</Path>
            檔案中的路由指令，將會看到對 <code>sayHello()</code> 函式的呼叫：
        </p>
        <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(sayHello(&quot;Ktor&quot;))&#10;                    }&#10;                }&#10;            }"/>
        <p>
            <code>sayHello()</code> 函式定義在
            <Path>core</Path>
            模組中。這是您放置要在伺服器與所有不同用戶端平台之間共用的通用程式碼的地方。
        </p>
        <p>
           開啟 <Path>app/shared/src/commonMain</Path> 模組中的 <Path>Greeting.kt</Path> 檔案，可以看到
            <code>sayHello()</code> 函式也在那裡被使用：
        </p>
        <code-block lang="kotlin" code="            class Greeting {&#10;                private val platform = getPlatform()&#10;&#10;                fun greet(): String {&#10;                    return sayHello(platform.name)&#10;                }&#10;            }"/>
        <p>
            <Path>app</Path> 模組包含以下子模組：
        </p>
        <list>
            <li>
                <Path>androidApp</Path>、<Path>desktopApp</Path>、<Path>iosApp</Path> 和 <Path>webApp</Path> 子模組分別包含 Android、桌面、iOS 和 Web 用戶端應用程式的平台專屬程式碼。這些用戶端應用程式目前都沒有連結到 Ktor 服務。
            </li>
            <li>
                <p>
                    <Path>shared</Path>
                    子模組包含您希望提供用戶端的每個平台的原始碼集。這是因為在
                    <Path>commonMain</Path>
                    中宣告的型別需要隨目標平台而變的功能。
                </p>
                <p>
                    例如，在 <code>Greeting</code> 型別中，目前平台的名稱是透過平台專屬 API，借助 <a
                        href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">預期宣告與實際宣告 (expected and actual declarations)</a> 來獲取的。
                </p>
                <p>
                    在
                    <Path>shared</Path>
                    子模組的
                    <Path>commonMain</Path>
                    原始碼集中，<code>getPlatform()</code> 函式使用了 <code>expect</code> 關鍵字宣告：
                </p>
                <tabs>
                    <tab title="commonMain/Platform.kt" id="commonMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
                    </tab>
                </tabs>
                <p>
                    接著，每個目標平台提供 <code>getPlatform()</code> 函式的 <code>actual</code> 宣告，如下所示：
                </p>
                <tabs>
                    <tab title="Platform.ios.kt" id="iosMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform : Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
                    </tab>
                    <tab title="Platform.android.kt" id="androidMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
                    </tab>
                    <tab title="Platform.jvm.kt" id="jvmMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class JVMPlatform : Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
                    </tab>
                    <tab title="Platform.wasmJs.kt" id="wasmJsMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
                    </tab>
                </tabs>
            </li>
        </list>
    </chapter>
    <chapter title="執行用戶端應用程式" id="run-client-app">
        <p>
            您可以透過執行該目標的运行配置來執行用戶端應用程式。若要在 iOS 模擬器上執行應用程式，請遵循以下步驟：
        </p>
        <procedure id="run-ios-app-procedure">
            <step>
                在 IntelliJ IDEA 中，選取
                <Path>iosApp</Path>
                运行配置和模擬裝置。
                <img src="full_stack_development_tutorial_run_configurations.png"
                     alt="Run &amp; Debug 視窗" width="400"
                     border-effect="line" style="block"/>
            </step>
            <step>
                點擊
                <ui-path>Run</ui-path>
                按鈕
                (<img src="intellij_idea_run_icon.svg"
                      style="inline" height="16" width="16"
                      alt="IntelliJ IDEA 執行圖示"/>)
                以執行配置。
            </step>
            <step>
                <p>
                    當您執行 iOS 應用程式時，它在底層會透過 Xcode 進行建置，並在 iOS 模擬器中啟動。
                    該應用程式會顯示一個按鈕，點擊時可切換顯示圖片。
                    <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                         alt="在 iOS 模擬器中執行應用程式" width="300" border-effect="rounded"/>
                </p>
                <p>
                    首次按下該按鈕時，目前平台的詳細資訊會新增到其文字中。實現此功能的程式碼位於
                    <Path>app/shared/src/commonMain/kotlin/com/example/ktor/App.kt</Path>
                    ：
                </p>
                <code-block lang="kotlin" code="                @Composable&#10;                @Preview&#10;                fun App() {&#10;                    MaterialTheme {&#10;                        var showContent by remember { mutableStateOf(false) }&#10;                        Column(&#10;                            modifier = Modifier&#10;                                .background(MaterialTheme.colorScheme.primaryContainer)&#10;                                .safeContentPadding()&#10;                                .fillMaxSize(),&#10;                            horizontalAlignment = Alignment.CenterHorizontally,&#10;                        ) {&#10;                            Button(onClick = { showContent = !showContent }) {&#10;                                Text(&quot;Click me!&quot;)&#10;                            }&#10;                            AnimatedVisibility(showContent) {&#10;                                val greeting = remember { Greeting().greet() }&#10;                                Column(&#10;                                    modifier = Modifier.fillMaxWidth(),&#10;                                    horizontalAlignment = Alignment.CenterHorizontally,&#10;                                ) {&#10;                                    Image(painterResource(Res.drawable.compose_multiplatform), null)&#10;                                    Text(&quot;Compose: $greeting&quot;)&#10;                                }&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
                <p>
                    這是一個可組合函式（composable function），您稍後將在本文中對其進行修改。目前最重要的是，它顯示了一個 UI，並使用了共用的 <code>Greeting</code> 型別，而該型別又使用了實作通用 <code>Platform</code> 介面的平台專屬類別。
                </p>
            </step>
        </procedure>
        <p>
            現在您已經了解所產生專案的結構，您可以逐步新增任務管理器功能。
        </p>
    </chapter>
    <chapter title="新增模型型別" id="add-model-types">
        <p>
            首先，新增模型型別並確保用戶端和伺服器都能存取它們。
        </p>
        <procedure id="add-model-types-procedure">
            <step>
                前往
                <Path>gradle/libs.versions.toml</Path>
                並定義以下 <code>kotlinx.serialization</code> 相依性：
                <code-block lang="toml" code="[versions]&#10;kotlinx-serialization-json = &quot;1.11.0&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinx-serialization-json&quot; }&#10;&#10;[plugins]&#10;kotlinSerialization = { id = &quot;org.jetbrains.kotlin.plugin.serialization&quot;, version.ref = &quot;kotlin&quot; }"/>
            </step>
            <step>
                <p>
                    前往
                    <Path>core/build.gradle.kts</Path>
                    並新增序列化外掛程式：
                </p>
                <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    alias(libs.plugins.kotlinSerialization)&#10;}"/>
            </step>
            <step>
                <p>
                    在同一個檔案中，為
                    <Path>commonMain</Path>
                    原始碼集新增一個新相依性：
                </p>
                <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // put your Multiplatform dependencies here&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
            </step>
            <step>
                在 IntelliJ IDEA 中，選取
                <ui-path>Build | Sync Project with Gradle Files</ui-path>
                以套用更新。Gradle 匯入完成後，您應該會發現您的
                <Path>Task.kt</Path>
                檔案可以成功編譯。
            </step>
            <step>
                前往
                <Path>core/src/commonMain/kotlin/com/example/ktor</Path>
                並建立名為
                <Path>model</Path>
                的新套件。
            </step>
            <step>
                在新套件內，建立一個名為
                <Path>Task.kt</Path>
                的新檔案。
            </step>
            <step>
                <p>
                    新增一個代表優先級的列舉和一個代表任務的類別。
                    <code>Task</code>
                    類別使用來自
                    <code>kotlinx.serialization</code>
                    程式庫的 <code>Serializable</code> 型別進行註解：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="建立伺服器" id="create-server">
        <p>
            下一個階段是建立任務管理器的伺服器實作。
        </p>
        <procedure id="create-server-procedure">
            <step>
                前往
                <Path>server/src/main/kotlin/com/example/ktor</Path>
                資料夾並建立名為
                <Path>model</Path>
                的子套件。
            </step>
            <step>
                <p>
                    在此套件內，建立一個新的
                    <Path>TaskRepository.kt</Path>
                    檔案，並為存儲庫新增以下介面：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
            </step>
            <step>
                <p>
                    在同一個套件中，建立一個名為
                    <Path>InMemoryTaskRepository.kt</Path>
                    的新檔案，其中包含以下類別：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    前往
                    <Path>server/src/main/kotlin/.../Application.kt</Path>
                    並將現有程式碼替換為以下實作：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.model.InMemoryTaskRepository&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // For ease of demonstration we allow any connections.&#10;        // Don't do this in production.&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    此實作與先前教學中的非常相似，不同之處在於為了簡潔起見，現在將所有路由程式碼都放在 <code>Application.module()</code> 函式中。
                </p>
                <p>
                    輸入此程式碼並新增匯入後，您會發現多個編譯器錯誤，因為程式碼使用了多個需要作為相依性包含進來的 Ktor 外掛程式，包括用於與 Web 用戶端互動的 <Links href="server-cors.md" summary="必要相依性：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✅">CORS</Links> 外掛程式。
                </p>
            </step>
            <step>
                開啟 <Path>settings.gradle.kts</Path> 並匯入 Ktor 版本目錄：
                <code-block lang="kotlin" code="dependencyResolutionManagement {&#10;    versionCatalogs {&#10;        create(&quot;ktorLibs&quot;).from(&quot;io.ktor:ktor-version-catalog:3.6.1&quot;)&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    開啟伺服器模組建置檔（
                    <Path>server/build.gradle.kts</Path>
                    ）並新增以下相依性：
                </p>
                <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(ktorLibs.serialization.kotlinx.json)&#10;    implementation(ktorLibs.server.contentNegotiation)&#10;    implementation(ktorLibs.server.cors)&#10;}"/>
            </step>
            <step>
                再次在主選單中選取 <ui-path>Build | Sync Project with Gradle Files</ui-path>。
                匯入完成後，您應該會發現 <code>ContentNegotiation</code> 型別和 <code>json()</code> 函式的匯入運作正常。
            </step>
            <step>
                重新執行伺服器。您應該會發現可以從瀏覽器存取這些路由。
            </step>
            <step>
                <p>
                    前往 <a href="http://0.0.0.0:8080/tasks"></a>
                    和 <a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                    以查看 JSON 格式的任務伺服器回應。
                    <img style="block" src="full_stack_development_tutorial_run_server.gif"
                         width="707" border-effect="rounded" alt="瀏覽器中的伺服器回應"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="建立用戶端" id="create-client">
        <p>
            為了讓您的用戶端能夠存取伺服器，您需要引入 Ktor Client。這涉及三種類型的相依性：
        </p>
        <list>
            <li>Ktor Client 的核心功能。</li>
            <li>處理網路連線的平台專屬引擎。</li>
            <li>對內容協商與序列化的支援。</li>
        </list>
        <procedure id="create-client-procedure">
            <step>
                前往
                <Path>app/shared/build.gradle.kts</Path>
                並新增以下相依性：
                <code-block lang="kotlin" code="kotlin {&#10;    //...&#10;    sourceSets {&#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(ktorLibs.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(ktorLibs.client.core)&#10;            implementation(ktorLibs.client.contentNegotiation)&#10;            implementation(ktorLibs.serialization.kotlinx.json)&#10;        }&#10;        jvmMain.dependencies {&#10;            implementation(ktorLibs.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(ktorLibs.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(ktorLibs.client.js)&#10;        }&#10;    }&#10;}"/>
                <p>
                    完成後，您可以為用戶端新增一個 <code>TaskApi</code> 型別，作為 Ktor Client 的輕量包裝函式。
                </p>
            </step>
            <step>
                在主選單中選取
                <ui-path>Build | Sync Project with Gradle Files</ui-path>
                以匯入建置檔中的變更。
            </step>
            <step>
                前往
                <Path>app/shared/src/commonMain/kotlin/com/example/ktor</Path>
                並建立名為
                <Path>network</Path>
                的新套件。
            </step>
            <step>
                <p>
                    在新套件內，建立一個新的
                    <Path>HttpClientManager.kt</Path>
                    檔案用於用戶端設定：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot; // Replace with the IP address of your current machine.&#10;        port = 8080&#10;    }&#10;}"/>
                <p>
                    將 <code>1.2.3.4</code> 替換為您目前電腦的 IP 位址。您無法從 Android 虛擬裝置或
                    iOS 模擬器上執行的程式碼向 <code>0.0.0.0</code> 或 <code>localhost</code> 發起呼叫。
                </p>
                <tip>
                    <p><b>尋找您的 IP 位址：</b></p>
                    <p>
                        由於行動裝置模擬器無法連線至 <code>localhost</code>，您需要電腦的實際 IP 位址。
                        若要尋找您的 IP 位址，請執行以下命令之一：
                    </p>
                    <list>
                        <li><b>macOS：</b> <code>ifconfig | grep "inet " | grep -v 127.0.0.1</code></li>
                        <li><b>Linux：</b> <code>hostname -I | awk '{print $1}'</code></li>
                        <li><b>Windows：</b> <code>ipconfig</code> 並尋找「IPv4 位址」</li>
                    </list>
                </tip>
            </step>
            <step>
                <p>
                    在同一個
                    <Path>app/shared/.../network</Path>
                    套件中，建立一個具有以下實作的新
                    <Path>TaskApi.kt</Path>
                    檔案：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import com.example.ktor.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    前往
                    <Path>app/shared/.../App.kt</Path>
                    並將程式碼替換為以下實作。
                    這將使用 <code>TaskApi</code> 型別從伺服器檢索任務清單，然後在一個直欄中顯示每個任務的名稱：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.network.createHttpClient&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    在伺服器執行的同時，透過執行 <ui-path>iosApp</ui-path> 运行配置來測試 iOS 應用程式。
                </p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Fetch Tasks</control>
                    按鈕以顯示任務清單：
                    <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                         alt="在 iOS 上執行的應用程式" width="363" border-effect="rounded"/>
                </p>
                <note>
                    在此展示中，為了清晰起見，我們簡化了流程。在實際應用程式中，避免透過網路傳送未加密的資料至關重要。
                </note>
            </step>
            <step>
                <p>
                    在 Android 平台上，您需要明確授予應用程式網路權限，並允許其以明文傳送和接收資料。若要啟用這些權限，請開啟
                    <Path>app/androidApp/src/main/AndroidManifest.xml</Path>
                    並新增以下設定：
                </p>
                <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
            </step>
            <step>
                <p>
                    使用 <ui-path>app.androidApp</ui-path> 运行配置執行 Android 應用程式。
                    您現在應該會發現您的 Android 用戶端也可以執行了：
                    <img style="block" src="full_stack_development_tutorial_run_android.png"
                         alt="在 Android 上執行的應用程式" width="350" />
                </p>
            </step>
            <step>
                <p>
                    對於桌面用戶端，您將為其所在的視窗指定尺寸和標題。
                    開啟檔案
                    <Path>app/desktopApp/src/.../main.kt</Path>
                    並透過變更 <code>title</code> 與設定 <code>state</code> 屬性來修改程式碼：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication,&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    使用 <ui-path>app [hot] 🔥</ui-path> 运行配置執行桌面應用程式：
                    <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                         alt="在桌面上執行的應用程式" width="400" border-effect="rounded"/>
                </p>
            </step>
            <step>
                <p>
                    使用以下运行配置之一執行 Web 用戶端：
                </p>
                <list>
                    <li>
                        <ui-path>app [js]</ui-path>：執行您的 Kotlin/JS 應用程式。
                    </li>
                    <li>
                        <ui-path>app [wasmJs]</ui-path>：執行您的 Kotlin/Wasm 應用程式。
                    </li>
                </list>
                <img style="block" src="full_stack_development_tutorial_run_web.png"
                     alt="在 Web 上執行的應用程式" width="400" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="改進 UI" id="improve-ui">
        <p>
            用戶端現在正在與伺服器進行通訊，但這 UI 談不上美觀。
        </p>
        <procedure id="improve-ui-procedure">
            <step>
                <p>
                    開啟位於
                    <Path>app/shared/src/commonMain/.../ktor</Path>
                    中的
                    <Path>App.kt</Path>
                    檔案，並將現有的 <code>App</code> 替換為以下 <code>App</code> 和 <code>TaskCard</code> 可組合項：
                </p>
                <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    透過此實作，您的用戶端現在具備了一些基本功能。
                </p>
                <p>
                    透過使用 <code>LaunchedEffect</code> 型別，所有任務都會在啟動時載入，而 <code>LazyColumn</code>
                    可組合項則允許使用者捲動瀏覽任務。
                </p>
                <p>
                    最後，建立了一個單獨的 <code>TaskCard</code> 可組合項，它轉而使用
                    <code>Card</code> 來顯示每個 <code>Task</code> 的詳細資訊。並且已新增了刪除和更新任務的按鈕。
                </p>
            </step>
            <step>
                <p>
                    重新執行用戶端應用程式 — 例如 Android 應用程式。
                    您現在可以捲動瀏覽任務、檢視其詳細資訊，並刪除它們：
                    <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                         alt="在 Android 上執行且具備改進 UI 的應用程式" width="350" border-effect="rounded"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增更新功能" id="add-update-functionality">
        <p>
            為了完善用戶端，納入允許更新任務詳細資訊的功能。
        </p>
        <procedure id="add-update-func-procedure">
            <step>
                前往
                <Path>app/shared/src/commonMain/.../ktor</Path>
                中的
                <Path>App.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    新增 <code>UpdateTaskDialog</code> 可組合項和必要的匯入，如下所示：
                </p>
                <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    這是一個透過對話方塊顯示 <code>Task</code> 詳細資訊的可組合項。<code>description</code>
                    和 <code>priority</code> 放置在 <code>TextField</code> 可組合項內，以便可以進行更新。當使用者按下更新按鈕時，會觸發 <code>onConfirm()</code> 回呼。
                </p>
            </step>
            <step>
                <p>
                    更新同一個檔案中的 <code>App</code> 可組合項：
                </p>
                <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    您正在儲存額外的狀態，即目前選取的任務。如果此值不為 null，則我們會叫用 <code>UpdateTaskDialog</code> 可組合項，並將
                    <code>onConfirm()</code> 回呼設定為使用
                    <code>TaskApi</code> 向伺服器發送 POST 請求。
                </p>
                <p>
                    最後，在建立 <code>TaskCard</code> 可組合項時，您使用
                    <code>onUpdate()</code> 回呼來設定 <code>currentTask</code> 狀態變數。
                </p>
            </step>
            <step>
                重新執行用戶端應用程式。您現在應該可以使用按鈕更新每個任務的詳細資訊了。
                <img style="block" src="full_stack_development_tutorial_update_task.gif"
                     alt="在 Android 上刪除任務" width="350" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            在本文中，您已在 Kotlin Multiplatform 應用程式的環境中使用了 Ktor。您現在可以建立包含多個服務和用戶端的專案，面向各種不同的平台。
        </p>
        <p>
            如您所見，在建構功能時完全可以避免任何程式碼重複或冗餘。專案所有層次中所需的型別都可以放置在
            <Path>core</Path>
            多平台模組中。僅服務需要的功能放在
            <Path>server</Path>
            模組中，而僅用戶端需要的功能則放置在
            <Path>app</Path>
            模組中。
        </p>
        <p>
            這種開發方式無疑需要同時具備用戶端與伺服器端技術的相關知識。但您可以使用 <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
            Multiplatform</a> 庫和 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">
            Compose Multiplatform</a> 來盡可能減少需要學習的新內容。即使您最初的重點僅在單一平台上，隨著對應用程式需求的增長，您也可以輕鬆新增其他平台。
        </p>
    </chapter>
</topic>