<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin 多平台建置全端應用程式" id="full-stack-development-with-kotlin-multiplatform">
<show-structure for="chapter, procedure" depth="2"/>
<web-summary>
    瞭解如何在 Kotlin 和 Ktor 中開發跨平台全端應用程式。在本教學中，您將
    探索如何使用 Kotlin 多平台為 Android、iOS 和桌面平台建置應用程式，並使用 Ktor 輕鬆處理資料。
</web-summary>
<link-summary>
    瞭解如何在 Kotlin 和 Ktor 中開發跨平台全端應用程式。
</link-summary>
<card-summary>
    瞭解如何在 Kotlin 和 Ktor 中開發跨平台全端應用程式。
</card-summary>
<tldr>
    <var name="example_name" value="full-stack-task-manager"/>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用的外掛程式</b>: <Links href="/ktor/server-routing" summary="路由 (Routing) 是伺服器應用程式中用於處理傳入請求的核心外掛程式。">Routing</Links>、
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
        <Links href="/ktor/server-serialization" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間協商媒體類型，並以特定格式序列化/反序列化內容。">Content Negotiation</Links>、
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>、
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
    </p>
</tldr>
<p>
    在本文中，您將學習如何使用 Kotlin 開發一個全端應用程式，它可以在 Android、iOS
    和桌面平台運行，同時利用 Ktor 進行無縫資料處理。
</p>
<p>完成本教學後，您將了解如何執行以下操作：</p>
<list>
    <li>使用 <a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
        Kotlin Multiplatform</a> 建立全端應用程式。
    </li>
    <li>理解使用 IntelliJ IDEA 產生的專案。</li>
    <li>建立呼叫 Ktor 服務的 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 用戶端。
    </li>
    <li>在設計的不同層級之間重複使用共享類型。</li>
    <li>正確包含和配置多平台函式庫。</li>
</list>
<p>
    在之前的教學中，我們使用任務管理器 (Task Manager) 範例來
    <Links href="/ktor/server-requests-and-responses" summary="透過建置任務管理器應用程式，學習使用 Kotlin 和 Ktor 進行路由、處理請求和參數的基本知識。">處理請求</Links>、
    <Links href="/ktor/server-create-restful-apis" summary="學習如何使用 Kotlin 和 Ktor 建置後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">建立 RESTful API</Links>，以及
    <Links href="/ktor/server-integrate-database" summary="學習將 Ktor 服務連接到 Exposed SQL 函式庫資料庫儲存庫的過程。">整合 Exposed 資料庫</Links>。
    用戶端應用程式盡可能保持簡約，以便您能專注於學習 Ktor 的基礎知識。
</p>
<p>
    您將建立一個針對 Android、iOS 和桌面平台的用戶端，使用 Ktor 服務來
    獲取要顯示的資料。在可能的情況下，您將在用戶端和伺服器之間共享資料類型，
    加快開發速度並減少潛在錯誤。
</p>
<chapter title="先決條件" id="prerequisites">
    <p>
        與之前的文章一樣，您將使用 IntelliJ IDEA 作為 IDE。要安裝和配置您的
        環境，請參閱
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
            Kotlin Multiplatform 快速入門
        </a> 指南。
    </p>
    <p>
        如果這是您第一次使用 Compose Multiplatform，我們建議您先完成
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
            Compose Multiplatform 入門
        </a>
        教學，再開始本教學。為了降低任務的複雜性，您可以專注於單一用戶端平台。例如，如果您從未使用過 iOS，那麼專注於桌面或 Android 開發可能更明智。
    </p>
</chapter>
<chapter title="建立新專案" id="create-project">
    <p>
        請改用 IntelliJ IDEA 中的 Kotlin Multiplatform 專案精靈，而非 Ktor 專案產生器。
        它將建立一個基本的多平台專案，您可以擴展該專案以包含
        用戶端和服務。用戶端既可以使用原生 UI 函式庫，例如 SwiftUI，但在本教學中
        您將透過使用 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>
        為所有平台建立共享 UI。
    </p>
    <procedure id="generate-project">
        <step>
            啟動 IntelliJ IDEA。
        </step>
        <step>
            在 IntelliJ IDEA 中，選擇
            <ui-path>File | New | Project</ui-path>
            。
        </step>
        <step>
            在左側面板中，選擇
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
                    <ui-path>Group</ui-path>
                    : com.example.ktor
                </li>
            </list>
        </step>
        <step>
            <p>
                選擇
                <ui-path>Android</ui-path>
                、
                <ui-path>Desktop</ui-path>
                和
                <ui-path>Server</ui-path>
                作為目標平台。
            </p>
        </step>
        <step>
            <p>
                如果您使用的是 Mac，也請選擇
                <ui-path>iOS</ui-path>
                。確保已選取
                <ui-path>Share UI</ui-path>
                選項。
                <img style="block" src="full_stack_development_tutorial_create_project.png"
                     alt="Kotlin Multiplatform 精靈設定" width="706" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                按一下
                <control>Create</control>
                按鈕，等待 IDE 產生並匯入專案。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="執行服務" id="run-service">
    <procedure id="run-service-procedure">
        <step>
            在
            <ui-path>Project</ui-path>
            視圖中，導覽至
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            並開啟
            <Path>Application.kt</Path>
            檔案。
        </step>
        <step>
            按一下
            <ui-path>Run</ui-path>
            按鈕
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 執行圖示"/>)
            在 <code>main()</code> 函式旁邊以啟動應用程式。
            <p>
                <ui-path>Run</ui-path>
                工具視窗中將開啟一個新分頁，日誌結尾顯示訊息「Responding at http://0.0.0.0:8080」。
            </p>
        </step>
        <step>
            <p>
                導覽至 [http://0.0.0.0:8080/](http://0.0.0.0:8080/) 以開啟應用程式。
                您應該會在瀏覽器中看到 Ktor 顯示的訊息。
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
        <Path>shared</Path>
        和
        <Path>composeApp</Path>
        。
    </p>
    <p>
        <Path>server</Path>
        模組的結構與 <a href="https://start.ktor.io/">Ktor Project
        Generator</a> 產生的結構非常相似。
        您有一個專用的建置檔案來
        宣告外掛程式和相依性，以及一個包含用於建置和啟動 Ktor
        服務的程式碼來源集：
    </p>
    <img src="full_stack_development_tutorial_server_folder.png"
         alt="Kotlin Multiplatform 專案中伺服器資料夾的內容" width="300"
         border-effect="line"/>
    <p>
        如果您查看
        <Path>Application.kt</Path>
        檔案中的路由指令，您將看到對 <code>greet()</code> 函式的呼叫：
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(&quot;Ktor: ${Greeting().greet()}&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <p>
        這會建立一個 <code>Greeting</code> 類型的實例並調用其 <code>greet()</code> 方法。
        <code>Greeting</code> 類別定義在 <Path>shared</Path> 模組中：
        <img src="full_stack_development_tutorial_shared_module.png"
             alt="Greeting.kt 和 Platform.kt 在 IntelliJ IDEA 中開啟" width="706"
             border-effect="line" style="block"/>
    </p>
    <p>
        <Path>shared</Path>
        模組包含將在不同目標平台中使用的程式碼。
    </p>
    <p>
        <Path>shared</Path> 模組集中的
        <Path>commonMain</Path>
        來源集保存著將在所有平台中使用的類型。
        如您所見，這就是 <code>Greeting</code> 類型定義的地方。
        這也是您將放置伺服器和所有不同用戶端平台之間共享的通用程式碼的地方。
    </p>
    <p>
        <Path>shared</Path>
        模組還包含您希望提供用戶端的每個平台的來源集。這是因為
        在
        <Path>commonMain</Path>
        中宣告的類型可能需要因目標平台而異的功能。對於
        <code>Greeting</code> 類型，您希望使用平台特定 API 獲取當前平台的名稱。
        這透過 <a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">預期 (expected) 和實際 (actual) 宣告</a>實現。
    </p>
    <p>
        在
        <Path>shared</Path>
        模組的
        <Path>commonMain</Path>
        來源集中，您使用 <code>expect</code> 關鍵字宣告 <code>getPlatform()</code> 函式：
    </p>
    <tabs>
        <tab title="commonMain/Platform.kt" id="commonMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
        </tab>
    </tabs>
    <p>然後每個目標平台
        必須提供 <code>getPlatform()</code> 函式的 <code>actual</code> 宣告，如下所示：
    </p>
    <tabs>
        <tab title="Platform.ios.kt" id="iosMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform: Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
        </tab>
        <tab title="Platform.android.kt" id="androidMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
        </tab>
        <tab title="Platform.jvm.kt" id="jvmMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;class JVMPlatform: Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
        </tab>
        <tab title="Platform.wasmJs.kt" id="wasmJsMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
        </tab>
    </tabs>
    <p>
        專案中還有一個額外的模組，即
        <Path>composeApp</Path>
        模組。
        它包含 Android、iOS、桌面和網頁用戶端應用程式的程式碼。
        這些應用程式目前未連結到 Ktor 服務，但它們確實使用了共享的
        <code>Greeting</code> 類別。
    </p>
</chapter>
<chapter title="執行用戶端應用程式" id="run-client-app">
    <p>
        您可以透過執行目標的執行設定來執行用戶端應用程式。要在 iOS 模擬器上運行
        應用程式，請按照以下步驟操作：
    </p>
    <procedure id="run-ios-app-procedure">
        <step>
            在 IntelliJ IDEA 中，選擇
            <Path>iosApp</Path>
            執行設定和一個模擬裝置。
            <img src="full_stack_development_tutorial_run_configurations.png"
                 alt="執行與偵錯視窗" width="400"
                 border-effect="line" style="block"/>
        </step>
        <step>
            按一下
            <ui-path>Run</ui-path>
            按鈕
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 執行圖示"/>)
            來執行設定。
        </step>
        <step>
            <p>
                當您執行 iOS 應用程式時，它會在幕後使用 Xcode 建置，並在 iOS 模擬器中啟動。
                應用程式會顯示一個按鈕，點擊時會切換圖片。
                <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                     alt="在 iOS 模擬器中執行應用程式" width="300" border-effect="rounded"/>
            </p>
            <p>
                首次按下按鈕時，會將當前平台的詳細資訊新增到其文字中。實現此目的的程式碼位於
                <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager/App.kt</Path>
                ：
            </p>
            <code-block lang="kotlin" code="            @Composable&#10;            fun App() {&#10;                MaterialTheme {&#10;                    var greetingText by remember { mutableStateOf(&quot;Hello World!&quot;) }&#10;                    var showImage by remember { mutableStateOf(false) }&#10;                    Column(&#10;                        Modifier.fillMaxWidth(),&#10;                        horizontalAlignment = Alignment.CenterHorizontally&#10;                    ) {&#10;                        Button(onClick = {&#10;                            greetingText = &quot;Compose: ${Greeting().greet()}&quot;&#10;                            showImage = !showImage&#10;                        }) {&#10;                            Text(greetingText)&#10;                        }&#10;                        AnimatedVisibility(showImage) {&#10;                            Image(&#10;                                painterResource(Res.drawable.compose_multiplatform),&#10;                                null&#10;                            )&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
            <p>
                這是一個可組合函式，您將在本文稍後修改它。目前重要的是它會顯示一個 UI，並使用共享的 <code>Greeting</code> 類型，而 <code>Greeting</code> 類型又使用了實現通用 <code>Platform</code> 介面的平台特定類別。
            </p>
        </step>
    </procedure>
    <p>
        現在您已了解生成專案的結構，您可以逐步新增任務
        管理員功能。
    </p>
</chapter>
<chapter title="新增模型類型" id="add-model-types">
    <p>
        首先，新增模型類型並確保用戶端和伺服器都可以存取它們。
    </p>
    <procedure id="add-model-types-procedure">
        <step>
            導覽至
            <Path>shared/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            並建立一個名為
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
                新增一個 <code>enum</code> 來表示優先級，以及一個 <code>class</code> 來表示任務。
                <code>Task</code> 類別使用
                <code>kotlinx.serialization</code>
                函式庫中的 <code>Serializable</code> 類型進行註解：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                您會注意到匯入和註解都無法編譯。這是因為專案尚未
                對 <code>kotlinx.serialization</code> 函式庫有相依性。
            </p>
        </step>
        <step>
            <p>
                導覽至
                <Path>shared/build.gradle.kts</Path>
                並新增序列化外掛程式：
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.1.21&quot;&#10;}"/>
        </step>
        <step>
            <p>
                在同一個檔案中，為
                <Path>commonMain</Path>
                來源集新增一個相依性：
            </p>
            <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // put your Multiplatform dependencies here&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
        </step>
        <step>
            導覽至
            <Path>gradle/libs.versions.toml</Path>
            並定義以下內容：
            <code-block lang="toml" code="[versions]&#10;kotlinxSerializationJson = &quot;1.8.1&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinxSerializationJson&quot; }"/>
        </step>
        <!-- the plugin version can also be set in the version catalog -->
        <step>
            在 IntelliJ IDEA 中，選擇
            <ui-path>Build | Sync Project with Gradle Files</ui-path>
            以套用更新。一旦 Gradle 匯入完成，您應該會發現您的
            <Path>Task.kt</Path>
            檔案成功編譯。
        </step>
    </procedure>
    <!-- The following seems like a lot of nuance to cover for this newbie-oriented tutorial.
     I think at this point it's enough to know that the serialization library requires a Gradle plugin.
     If it's important, it would be nice to make the terminology more precise: earlier we said it won't compile, and now
     we're saying it would, so I'm not sure what's going on in the end.
     -->
    <p>
        請注意，如果沒有包含序列化外掛程式，程式碼也能夠編譯，然而，
        透過網路序列化 <code>Task</code> 物件所需的類型將不會產生。這會導致在嘗試調用服務時出現執行時期錯誤。
    </p>
    <p>
        將序列化外掛程式放置在另一個模組（例如
        <Path>server</Path>
        或
        <Path>composeApp</Path>
        ）不會在建置時期造成錯誤。但同樣地，序列化所需的額外類型將不會產生，導致執行時期錯誤。
    </p>
</chapter>
<chapter title="建立伺服器" id="create-server">
    <p>
        下一個階段是為我們的任務管理器建立伺服器實作。
    </p>
    <procedure id="create-server-procedure">
        <step>
            導覽至
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            資料夾並建立一個名為
            <Path>model</Path>
            的子套件。
        </step>
        <step>
            <p>
                在此套件內，建立一個新的
                <Path>TaskRepository.kt</Path>
                檔案並為我們的儲存庫新增以下介面：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
        </step>
        <step>
            <p>
                在同一個套件中，建立一個名為
                <Path>InMemoryTaskRepository.kt</Path>
                的新檔案，其中包含以下類別：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                導覽至
                <Path>server/src/main/kotlin/.../Application.kt</Path>
                並將現有程式碼替換為以下實作：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.model.InMemoryTaskRepository&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = SERVER_PORT, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // For ease of demonstration we allow any connections.&#10;        // Don't do this in production.&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    此實作與之前的教學非常相似，不同之處在於，為了簡化起見，現在您已將所有路由程式碼放置在 <code>Application.module()</code> 函式中。
                </p>
                <p>
                    輸入此程式碼並新增匯入後，您將發現多個編譯器錯誤，因為程式碼使用了多個需要包含為相依性的 Ktor 外掛程式，
                    包括用於與網頁用戶端互動的 <Links href="/ktor/server-cors" summary="所需相依性：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✅">CORS</Links> 外掛程式。
                </p>
            </step>
            <step>
                開啟
                <Path>gradle/libs.versions.toml</Path>
                檔案並定義以下函式庫：
                <code-block lang="toml" code="[libraries]&#10;ktor-serialization-kotlinx-json-jvm = { module = &quot;io.ktor:ktor-serialization-kotlinx-json-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-content-negotiation-jvm = { module = &quot;io.ktor:ktor-server-content-negotiation-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-cors-jvm = { module = &quot;io.ktor:ktor-server-cors-jvm&quot;, version.ref = &quot;ktor&quot; }"/>
            </step>
            <step>
                <p>
                    開啟伺服器模組建置檔案 (
                    <Path>server/build.gradle.kts</Path>
                    ) 並新增以下相依性：
                </p>
                <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(libs.ktor.serialization.kotlinx.json.jvm)&#10;    implementation(libs.ktor.server.content.negotiation.jvm)&#10;    implementation(libs.ktor.server.cors.jvm)&#10;}"/>
            </step>
            <step>
                再次從主功能表選擇 <ui-path>Build | Sync Project with Gradle Files</ui-path>。
                匯入完成後，您應該會發現 <code>ContentNegotiation</code> 類型和 <code>json()</code> 函式的匯入正常運作。
            </step>
            <step>
                重新執行伺服器。您應該會發現可以從瀏覽器存取路由。
            </step>
            <step>
                <p>
                    導覽至 <a href="http://0.0.0.0:8080/tasks"></a>
                    和 <a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                    以查看伺服器以 JSON 格式回應的任務。
                    <img style="block" src="full_stack_development_tutorial_run_server.gif"
                         width="707" border-effect="rounded" alt="瀏覽器中的伺服器回應"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="建立用戶端" id="create-client">
        <p>
            為了讓您的用戶端能夠存取伺服器，您需要包含 Ktor Client。這涉及到三種類型的相依性：
        </p>
        <list>
            <li>Ktor Client 的核心功能。</li>
            <li>用於處理網路連線的平台特定引擎。</li>
            <li>內容協商和序列化的支援。</li>
        </list>
        <procedure id="create-client-procedure">
            <step>
                在
                <Path>gradle/libs.versions.toml</Path>
                檔案中，新增以下函式庫：
                <code-block lang="toml" code="[libraries]&#10;ktor-client-android = { module = &quot;io.ktor:ktor-client-android&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-cio = { module = &quot;io.ktor:ktor-client-cio&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-core = { module = &quot;io.ktor:ktor-client-core&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-darwin = { module = &quot;io.ktor:ktor-client-darwin&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-wasm = { module = &quot;io.ktor:ktor-client-js-wasm-js&quot;, version.ref = &quot;ktor&quot;}&#10;ktor-serialization-kotlinx-json = { module = &quot;io.ktor:ktor-serialization-kotlinx-json&quot;, version.ref = &quot;ktor&quot; }"/>
            </step>
            <step>
                導覽至
                <Path>composeApp/build.gradle.kts</Path>
                並新增以下相依性：
                <code-block lang="kotlin" code="kotlin {&#10;&#10;    //...&#10;    sourceSets {&#10;        val desktopMain by getting&#10;        &#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.core)&#10;            implementation(libs.ktor.client.content.negotiation)&#10;            implementation(libs.ktor.serialization.kotlinx.json)&#10;        }&#10;        desktopMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(libs.ktor.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(libs.ktor.client.wasm)&#10;        }&#10;    }&#10;}"/>
                <p>
                    完成此操作後，您可以為用戶端新增一個 <code>TaskApi</code> 類型，作為 Ktor Client 的輕量封裝。
                </p>
            </step>
            <step>
                從主功能表選擇
                <ui-path>Build | Sync Project with Gradle Files</ui-path>
                以匯入建置檔案中的變更。
            </step>
            <step>
                導覽至
                <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
                並建立一個名為
                <Path>network</Path>
                的新套件。
            </step>
            <step>
                <p>
                    在新套件內，為用戶端配置建立一個新的
                    <Path>HttpClientManager.kt</Path>
                    ：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot;&#10;        port = 8080&#10;    }&#10;}"/>
                <p>
                    請注意，您應該將 <code>1.2.3.4</code> 替換為您當前機器的 IP 位址。您將
                    無法從 Android 虛擬裝置或
                    iOS 模擬器上運行的程式碼向 <code>0.0.0.0</code> 或 <code>localhost</code> 發出呼叫。
                    <!-- should we include instructions on finding out the IP address?
                         `ipconfig getifaddr en0`or something -->
                </p>
            </step>
            <step>
                <p>
                    在相同的
                    <Path>composeApp/.../full_stack_task_manager/network</Path>
                    套件中，建立一個新的
                    <Path>TaskApi.kt</Path>
                    檔案，並加入以下實作：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    導覽至
                    <Path>commonMain/.../App.kt</Path>
                    並將現有的 App 可組合函式替換為以下實作。
                    這將使用 <code>TaskApi</code> 類型從伺服器檢索任務列表，然後
                    在欄位中顯示每個任務的名稱：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    在伺服器運行時，透過執行 <ui-path>iosApp</ui-path> 執行設定來測試 iOS 應用程式。
                </p>
            </step>
            <step>
                <p>
                    按一下
                    <control>Fetch Tasks</control>
                    按鈕以顯示任務列表：
                    <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                         alt="應用程式在 iOS 上執行" width="363" border-effect="rounded"/>
                </p>
                <note>
                    在此示範中，我們為求清晰而簡化了流程。在實際應用中，避免透過網路傳送未加密的資料至關重要。
                </note>
            </step>
            <step>
                <p>
                    在 Android 平台上，您需要明確授予應用程式網路權限並
                    允許它以明文形式傳送和接收資料。要啟用這些權限，請開啟
                    <Path>composeApp/src/androidMain/AndroidManifest.xml</Path>
                    並新增以下設定：
                </p>
                <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
            </step>
            <step>
                <p>
                    使用 <ui-path>composeApp</ui-path> 執行設定來執行 Android 應用程式。
                    您現在應該會發現您的 Android 用戶端也能運行：
                    <img style="block" src="full_stack_development_tutorial_run_android.png"
                         alt="應用程式在 Android 上執行" width="350" border-effect="rounded"/>
                </p>
            </step>
            <step>
                <p>
                    對於桌面用戶端，您應該為包含視窗指定尺寸和標題。
                    開啟
                    <Path>composeApp/src/desktopMain/.../main.kt</Path>
                    檔案並透過更改 <code>title</code> 和設定 <code>state</code> 屬性來修改程式碼：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    使用 <ui-path>composeApp [desktop]</ui-path> 執行設定來執行桌面應用程式：
                    <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                         alt="應用程式在桌面上執行" width="400" border-effect="rounded"/>
                </p>
            </step>
            <step>
                <p>
                    使用 <ui-path>composeApp [wasmJs]</ui-path> 執行設定來執行網頁用戶端：
                </p>
                <img style="block" src="full_stack_development_tutorial_run_web.png"
                     alt="應用程式在桌面上執行" width="400" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="改進使用者介面 (UI)" id="improve-ui">
        <p>
            用戶端現在正在與伺服器通訊，但這很難說是一個美觀的 UI。
        </p>
        <procedure id="improve-ui-procedure">
            <step>
                <p>
                    開啟位於
                    <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
                    中的
                    <Path>App.kt</Path>
                    檔案，並將現有的 <code>App</code> 替換為以下的 <code>App</code> 和 <code>TaskCard</code>
                    可組合函式：
                </p>
                <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    透過此實作，您的用戶端現在擁有了一些基本功能。
                </p>
                <p>
                    透過使用 <code>LaunchedEffect</code> 類型，所有任務在啟動時載入，而 <code>LazyColumn</code>
                    可組合函式允許使用者捲動瀏覽任務。
                </p>
                <p>
                    最後，建立了一個單獨的 <code>TaskCard</code> 可組合函式，它又使用一個
                    <code>Card</code> 來顯示每個 <code>Task</code> 的詳細資訊。已經新增了按鈕以
                    刪除和更新任務。
                </p>
            </step>
            <step>
                <p>
                    重新執行用戶端應用程式 — 例如 Android 應用程式。
                    您現在可以捲動瀏覽任務、查看其詳細資訊並刪除它們：
                    <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                         alt="應用程式在 Android 上以改進的 UI 運行" width="350" border-effect="rounded"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="新增更新功能" id="add-update-functionality">
        <p>
            為了完善用戶端，請整合允許更新任務詳細資訊的功能。
        </p>
        <procedure id="add-update-func-procedure">
            <step>
                導覽至
                <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
                中的
                <Path>App.kt</Path>
                檔案。
            </step>
            <step>
                <p>
                    新增 <code>UpdateTaskDialog</code> 可組合函式和必要的匯入，如下所示：
                </p>
                <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    這是一個可組合函式，它透過對話框顯示 <code>Task</code> 的詳細資訊。<code>description</code>
                    和 <code>priority</code> 放置在 <code>TextField</code> 可組合函式中，以便可以
                    更新。當使用者按下更新按鈕時，它會觸發 <code>onConfirm()</code> 回呼。
                </p>
            </step>
            <step>
                <p>
                    更新同一個檔案中的 <code>App</code> 可組合函式：
                </p>
                <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    您正在儲存額外的狀態部分，即選定的當前任務。如果此值不為 null，
                    那麼我們調用我們的 <code>UpdateTaskDialog</code> 可組合函式，並將 <code>onConfirm()</code> 回呼設定為使用 <code>TaskApi</code> 向伺服器發送 POST 請求。
                </p>
                <p>
                    最後，當您建立 <code>TaskCard</code> 可組合函式時，您使用 <code>onUpdate()</code> 回呼來設定 <code>currentTask</code> 狀態變數。
                </p>
            </step>
            <step>
                重新執行用戶端應用程式。您現在應該能夠使用按鈕更新每個任務的詳細資訊。
                <img style="block" src="full_stack_development_tutorial_update_task.gif"
                     alt="在 Android 上刪除任務" width="350" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            在本文中，您已在 Kotlin Multiplatform 應用程式的上下文中使用 Ktor。您現在可以
            建立一個包含多個服務和用戶端，針對各種不同平台的專案。
        </p>
        <p>
            如您所見，在沒有任何程式碼重複或冗餘的情況下建置功能是可能的。
            專案所有層所需的類型可以放置在
            <Path>shared</Path>
            多平台模組中。
            服務才需要的功能放在
            <Path>server</Path>
            模組中，而用戶端才需要的功能則放在
            <Path>composeApp</Path>
            中。
        </p>
        <p>
            這種開發不可避免地需要同時具備用戶端和伺服器技術的知識。但您可以使用
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
            Multiplatform</a> 函式庫和 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">
            Compose Multiplatform</a> 來最大程度地減少您需要學習的新內容。即使您最初
            只專注於單一平台，隨著您的應用程式需求增長，您也可以輕鬆新增其他平台。
        </p>
    </chapter>
</topic>