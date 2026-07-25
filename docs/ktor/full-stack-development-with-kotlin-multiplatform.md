<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin Multiplatform 构建全栈应用程序" id="full-stack-development-with-kotlin-multiplatform">
    <show-structure for="chapter, procedure" depth="2"/>
    <web-summary>
        了解如何使用 Kotlin 和 Ktor 开发跨平台全栈应用程序。在本教程中，你将发现如何使用 Kotlin Multiplatform 为 Android、iOS 和桌面端构建应用，并使用 Ktor 轻松处理数据。
    </web-summary>
    <link-summary>
        了解如何使用 Kotlin 和 Ktor 开发跨平台全栈应用程序。
    </link-summary>
    <card-summary>
        了解如何使用 Kotlin 和 Ktor 开发跨平台全栈应用程序。
    </card-summary>
    <tldr>
        <var name="example_name" value="full-stack-task-manager"/>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用的插件</b>：<Links href="//server-routing" summary="路由是服务器应用程序中处理传入请求的核心插件。">Routing</Links>、
            <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
            <Links href="//server-serialization" summary="ContentNegotiation 插件有两个主要目的：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>、
            <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>、
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
        </p>
    </tldr>
    <p>
        在本文中，你将学习如何使用 Kotlin 开发运行在 Android、iOS、Web 和桌面平台的全栈应用程序，同时利用 Ktor 进行无缝的数据处理。
    </p>
    <p>在本教程结束时，你将了解如何执行以下操作：</p>
    <list>
        <li>使用 <a
                href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
            Kotlin Multiplatform</a> 创建全栈应用程序。
        </li>
        <li>理解由 IntelliJ IDEA 生成的项目。</li>
        <li>创建调用 Ktor 服务的 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 客户端。
        </li>
        <li>在设计的不同层级中复用共享类型。</li>
        <li>正确包含和配置多平台库。</li>
    </list>
    <p>
        在之前的教程中，我们使用任务管理器（Task Manager）示例来
        <Links href="//server-requests-and-responses" summary="通过构建任务管理器应用程序，学习在 Kotlin 中使用 Ktor 处理请求、路由和参数的基础知识。">处理请求</Links>、
        <Links href="//server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包含一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links> 以及
        <Links href="//server-integrate-database" summary="了解使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。">使用 Exposed 集成数据库</Links>。
        当时客户端应用程序尽可能保持简单，以便你可以专注于学习 Ktor 的基础知识。
    </p>
    <p>
        你将创建一个面向 Android、iOS、Web 和桌面平台的客户端，并使用 Ktor 服务获取要显示的数据。你将尽可能在客户端和服务器之间共享数据类型，从而加快开发速度并减少出错的可能性。
    </p>
    <chapter title="前提条件" id="prerequisites">
        <p>
            与之前的文章一样，你将使用 IntelliJ IDEA 作为 IDE。要安装和配置环境，请参阅
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
                Kotlin Multiplatform 快速入门指南
            </a>
            。
        </p>
        <p>
            如果这是你第一次使用 Compose Multiplatform，我们建议你在开始本教程之前先完成
            <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
                Compose Multiplatform 入门
            </a>
            教程。为了降低任务的复杂度，你可以专注于单一的客户端平台。例如，如果你从未用过 iOS，那么专注于桌面端或 Android 开发可能是明智之举。
        </p>
    </chapter>
    <chapter title="创建一个新项目" id="create-project">
        <p>
            不使用 Ktor 项目生成器，而是使用 IntelliJ IDEA 中的 Kotlin Multiplatform 项目向导。
            它将创建一个基础的多平台项目，你可以通过客户端和服务对其进行扩展。客户端可以使用原生 UI 库（如 SwiftUI），但在本教程中，你将使用 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 为所有平台创建一个共享 UI。
        </p>
        <procedure id="generate-project">
            <step>
                启动 IntelliJ IDEA。
            </step>
            <step>
                在 IntelliJ IDEA 中，选择
                <ui-path>File | New | Project</ui-path>
                。
            </step>
            <step>
                在左侧面板中，选择
                <ui-path>Kotlin Multiplatform</ui-path>
                。
            </step>
            <step>
                在
                <ui-path>New Project</ui-path>
                窗口中指定以下字段：
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
                    选择
                    <ui-path>Android</ui-path>
                    、
                    <ui-path>Desktop</ui-path>
                    、
                    <ui-path>Web</ui-path>
                    和
                    <ui-path>Server</ui-path>
                    作为目标平台。
                </p>
            </step>
            <step>
                <p>
                    如果你使用的是 Mac，也请选择
                    <ui-path>iOS</ui-path>
                    。确保已选中
                    <ui-path>Share UI</ui-path>
                    选项。
                    <img style="block" src="full_stack_development_tutorial_create_project.png"
                         alt="Kotlin Multiplatform 向导设置" width="706" border-effect="rounded"/>
                </p>
            </step>
            <step>
                <p>
                    点击
                    <control>Create</control>
                    按钮并等待 IDE 生成并导入项目。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="运行服务" id="run-service">
        <procedure id="run-service-procedure">
            <step>
                在 IntelliJ IDEA 中，选择
                <Path>ApplicationKt</Path>
                运行配置。
                <img src="full_stack_development_tutorial_server_run_configuration.png"
                     alt="运行和调试窗口" width="300"
                     border-effect="line" style="block"/>
            </step>
            <step>
                点击
                <ui-path>Run</ui-path>
                按钮
                (<img src="intellij_idea_run_icon.svg"
                      style="inline" height="16" width="16"
                      alt="IntelliJ IDEA 运行图标"/>)
                以运行该配置。
                <p>
                    <ui-path>Run</ui-path>
                    工具窗口中将打开一个新标签页。
                </p>
            </step>
            <step>
                <p>
                    导航至 <a href="http://0.0.0.0:8080/">http://0.0.0.0:8080/</a> 以打开应用程序。
                    你应该会看到浏览器中显示的来自 Ktor 的消息。
                    <img src="full_stack_development_tutorial_run.png"
                         alt="Ktor 服务器浏览器响应" width="706"
                         border-effect="rounded" style="block"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="检查项目" id="examine-project">
        <p>
            <Path>server</Path>
            文件夹是项目中的三个 Kotlin 模块之一。另外两个是
            <Path>core</Path>
            和
            <Path>app</Path>
            。
        </p>
        <p>
            <Path>server</Path>
            模块的结构与 <a href="https://start.ktor.io/">Ktor 项目生成器</a> 生成的结构非常相似。
            你拥有一个专门的构建文件来声明插件和依赖项，以及一个包含用于构建和启动 Ktor 服务代码的源集：
        </p>
        <img src="full_stack_development_tutorial_server_folder.png"
             alt="Kotlin Multiplatform 项目中 server 文件夹的内容" width="300"
             border-effect="line"/>
        <p>
            如果你查看
            <Path>Application.kt</Path>
            文件中的路由指令，你会看到对 <code>sayHello()</code> 函数的调用：
        </p>
        <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(sayHello(&quot;Ktor&quot;))&#10;                    }&#10;                }&#10;            }"/>
        <p>
            <code>sayHello()</code> 函数定义在
            <Path>core</Path>
            模块中。这是你放置要在服务器和所有不同客户端平台之间共享的通用代码的地方。
        </p>
        <p>
           打开 <Path>app/shared/src/commonMain</Path> 模块中的 <Path>Greeting.kt</Path> 文件，你会看到
            <code>sayHello()</code> 函数也在那里被使用了：
        </p>
        <code-block lang="kotlin" code="            class Greeting {&#10;                private val platform = getPlatform()&#10;&#10;                fun greet(): String {&#10;                    return sayHello(platform.name)&#10;                }&#10;            }"/>
        <p>
            <Path>app</Path> 模块包含以下子模块：
        </p>
        <list>
            <li>
                <Path>androidApp</Path>、<Path>desktopApp</Path>、<Path>iosApp</Path> 和 <Path>webApp</Path> 子模块分别包含针对 Android、桌面端、iOS 和 Web 客户端应用的平台特定代码。目前，这些客户端应用都没有链接到 Ktor 服务。
            </li>
            <li>
                <p>
                    <Path>shared</Path>
                    子模块为你希望提供客户端的每个平台都包含一个源集。这是因为
                    <Path>commonMain</Path>
                    中声明的类型需要的功能因目标平台而异。
                </p>
                <p>
                    例如，在 <code>Greeting</code> 类型中，当前平台的名称是使用平台特定的 API，通过 <a
                        href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">预期声明 (expect) 和实际声明 (actual)</a> 获取的。
                </p>
                <p>
                    在
                    <Path>shared</Path>
                    子模块的
                    <Path>commonMain</Path>
                    源集中，<code>getPlatform()</code> 函数使用 <code>expect</code> 关键字声明：
                </p>
                <Tabs>
                    <TabItem title="commonMain/Platform.kt" id="commonMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
                    </TabItem>
                </Tabs>
                <p>
                    然后，每个目标平台都提供 <code>getPlatform()</code> 函数的一个 <code>actual</code> 声明，如下所示：
                </p>
                <Tabs>
                    <TabItem title="Platform.ios.kt" id="iosMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform : Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
                    </TabItem>
                    <TabItem title="Platform.android.kt" id="androidMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
                    </TabItem>
                    <TabItem title="Platform.jvm.kt" id="jvmMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class JVMPlatform : Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
                    </TabItem>
                    <TabItem title="Platform.wasmJs.kt" id="wasmJsMain">
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
                    </TabItem>
                </Tabs>
            </li>
        </list>
    </chapter>
    <chapter title="运行客户端应用程序" id="run-client-app">
        <p>
            你可以通过执行目标的运行配置来运行客户端应用程序。要在 iOS 模拟器（Simulator）上运行应用程序，请按照以下步骤操作：
        </p>
        <procedure id="run-ios-app-procedure">
            <step>
                在 IntelliJ IDEA 中，选择
                <Path>iosApp</Path>
                运行配置和一个模拟设备。
                <img src="full_stack_development_tutorial_run_configurations.png"
                     alt="运行和调试窗口" width="400"
                     border-effect="line" style="block"/>
            </step>
            <step>
                点击
                <ui-path>Run</ui-path>
                按钮
                (<img src="intellij_idea_run_icon.svg"
                      style="inline" height="16" width="16"
                      alt="IntelliJ IDEA 运行图标"/>)
                以运行该配置。
            </step>
            <step>
                <p>
                    运行 iOS 应用时，它会在后台通过 Xcode 进行构建并在 iOS 模拟器中启动。
                    应用会显示一个按钮，点击后可以切换图片的显示。
                    <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                         alt="在 iOS 模拟器中运行应用" width="300" border-effect="rounded"/>
                </p>
                <p>
                    第一次按下按钮时，当前平台的详细信息会添加到按钮文本中。实现此功能的代码位于
                    <Path>app/shared/src/commonMain/kotlin/com/example/ktor/App.kt</Path>
                    ：
                </p>
                <code-block lang="kotlin" code="                @Composable&#10;                @Preview&#10;                fun App() {&#10;                    MaterialTheme {&#10;                        var showContent by remember { mutableStateOf(false) }&#10;                        Column(&#10;                            modifier = Modifier&#10;                                .background(MaterialTheme.colorScheme.primaryContainer)&#10;                                .safeContentPadding()&#10;                                .fillMaxSize(),&#10;                            horizontalAlignment = Alignment.CenterHorizontally,&#10;                        ) {&#10;                            Button(onClick = { showContent = !showContent }) {&#10;                                Text(&quot;Click me!&quot;)&#10;                            }&&#10;                            AnimatedVisibility(showContent) {&#10;                                val greeting = remember { Greeting().greet() }&#10;                                Column(&#10;                                    modifier = Modifier.fillMaxWidth(),&#10;                                    horizontalAlignment = Alignment.CenterHorizontally,&#10;                                ) {&#10;                                    Image(painterResource(Res.drawable.compose_multiplatform), null)&#10;                                    Text(&quot;Compose: $greeting&quot;)&#10;                                }&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
                <p>
                    这是一个可组合函数，你将在本文后面部分对其进行修改。目前，重要的是它显示了一个 UI，并使用了共享的 <code>Greeting</code> 类型，而该类型又使用了实现通用 <code>Platform</code> 接口的平台特定类。
                </p>
            </step>
        </procedure>
        <p>
            现在你已经了解了生成的项目的结构，可以逐步添加任务管理器功能。
        </p>
    </chapter>
    <chapter title="添加模型类型" id="add-model-types">
        <p>
            首先，添加模型类型，并确保它们对于客户端和服务器都是可访问的。
        </p>
        <procedure id="add-model-types-procedure">
            <step>
                导航至
                <Path>gradle/libs.versions.toml</Path>
                并定义以下 <code>kotlinx.serialization</code> 依赖项：
                <code-block lang="toml" code="[versions]&#10;kotlinx-serialization-json = &quot;1.11.0&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinx-serialization-json&quot; }&#10;&#10;[plugins]&#10;kotlinSerialization = { id = &quot;org.jetbrains.kotlin.plugin.serialization&quot;, version.ref = &quot;kotlin&quot; }"/>
            </step>
            <step>
                <p>
                    导航至
                    <Path>core/build.gradle.kts</Path>
                    并添加序列化插件：
                </p>
                <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    alias(libs.plugins.kotlinSerialization)&#10;}"/>
            </step>
            <step>
                <p>
                    在同一文件中，向
                    <Path>commonMain</Path>
                    源集添加一个新的依赖项：
                </p>
                <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // 在此处放置你的多平台依赖项&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
            </step>
            <step>
                在 IntelliJ IDEA 中，选择
                <ui-path>Build | Sync Project with Gradle Files</ui-path>
                以应用更新。Gradle 导入完成后，你应该会发现你的
                <Path>Task.kt</Path>
                文件编译成功。
            </step>
            <step>
                导航至
                <Path>core/src/commonMain/kotlin/com/example/ktor</Path>
                并创建一个名为
                <Path>model</Path>
                的新包。
            </step>
            <step>
                在新包内，创建一个名为
                <Path>Task.kt</Path>
                的新文件。
            </step>
            <step>
                <p>
                    添加一个表示优先级的枚举和一个表示任务的类。
                    <code>Task</code>
                    类使用来自
                    <code>kotlinx.serialization</code>
                    库的 <code>Serializable</code> 注解：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="创建服务器" id="create-server">
        <p>
            下一阶段是为任务管理器创建服务器实现。
        </p>
        <procedure id="create-server-procedure">
            <step>
                导航至
                <Path>server/src/main/kotlin/com/example/ktor</Path>
                文件夹并创建一个名为
                <Path>model</Path>
                的子包。
            </step>
            <step>
                <p>
                    在此包内，创建一个新的
                    <Path>TaskRepository.kt</Path>
                    文件，并为该仓库添加以下接口：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
            </step>
            <step>
                <p>
                    在同一包中，创建一个名为
                    <Path>InMemoryTaskRepository.kt</Path>
                    的新文件，其中包含以下类：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    导航至
                    <Path>server/src/main/kotlin/.../Application.kt</Path>
                    并将现有代码替换为以下实现：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.model.InMemoryTaskRepository&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // 为了演示方便，我们允许任何连接。&#10;        // 请勿在生产环境中这样做。&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    此实现与之前教程中的非常相似，不同之处在于，为了简单起见，现在你已将所有路由代码放置在 <code>Application.module()</code> 函数中。
                </p>
                <p>
                    输入此代码并添加导入后，你会发现多个编译器错误，因为代码使用了多个需要作为依赖项包含的 Ktor 插件，包括用于与 Web 客户端交互的 <Links href="//server-cors" summary="所需依赖项：io.ktor:%artifact_name%">CORS</Links> 插件。
                </p>
            </step>
            <step>
                打开
                <Path>gradle/libs.versions.toml</Path>
                文件并定义以下库：
                <code-block lang="toml" code="[libraries]&#10;ktor-serialization-kotlinx-json-jvm = { module = &quot;io.ktor:ktor-serialization-kotlinx-json-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-content-negotiation-jvm = { module = &quot;io.ktor:ktor-server-content-negotiation-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-cors-jvm = { module = &quot;io.ktor:ktor-server-cors-jvm&quot;, version.ref = &quot;ktor&quot; }"/>
            </step>
            <step>
                <p>
                    打开服务器模块构建文件 (
                    <Path>server/build.gradle.kts</Path>
                    ) 并添加以下依赖项：
                </p>
                <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(libs.ktor.serialization.kotlinx.json.jvm)&#10;    implementation(libs.ktor.server.content-negotiation.jvm)&#10;    implementation(libs.ktor.server.cors.jvm)&#10;}"/>
            </step>
            <step>
                再次从主菜单中选择 <ui-path>Build | Sync Project with Gradle Files</ui-path>。
                导入完成后，你应该会发现 <code>ContentNegotiation</code> 类型和 <code>json()</code> 函数的导入可以正常工作。
            </step>
            <step>
                重新运行服务器。你应该会发现路由可以通过浏览器访问。
            </step>
            <step>
                <p>
                    导航至 <a href="http://0.0.0.0:8080/tasks"></a>
                    和 <a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                    以查看 JSON 格式的任务服务器响应。
                    <img style="block" src="full_stack_development_tutorial_run_server.gif"
                         width="707" border-effect="rounded" alt="浏览器中的服务器响应"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="创建客户端" id="create-client">
        <p>
            为了让你的客户端能够访问服务器，你需要包含 Ktor Client。这涉及三种类型的依赖项：
        </p>
        <list>
            <li>Ktor Client 的核心功能。</li>
            <li>处理网络连接的平台特定引擎。</li>
            <li>对内容协商和序列化的支持。</li>
        </list>
        <procedure id="create-client-procedure">
            <step>
                在
                <Path>gradle/libs.versions.toml</Path>
                文件中，添加以下库：
                <code-block lang="toml" code="[libraries]&#10;ktor-client-android = { module = &quot;io.ktor:ktor-client-android&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-cio = { module = &quot;io.ktor:ktor-client-cio&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-core = { module = &quot;io.ktor:ktor-client-core&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-darwin = { module = &quot;io.ktor:ktor-client-darwin&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-wasm = { module = &quot;io.ktor:ktor-client-js-wasm-js&quot;, version.ref = &quot;ktor&quot;}&#10;ktor-serialization-kotlinx-json = { module = &quot;io.ktor:ktor-serialization-kotlinx-json&quot;, version.ref = &quot;ktor&quot; }"/>
            </step>
            <step>
                导航至
                <Path>app/shared/build.gradle.kts</Path>
                并添加以下依赖项：
                <code-block lang="kotlin" code="kotlin {&#10;    //...&#10;    sourceSets {&#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.core)&#10;            implementation(libs.ktor.client.content-negotiation)&#10;            implementation(libs.ktor.serialization.kotlinx.json)&#10;        }&#10;        jvmMain.dependencies {&#10;            implementation(libs.ktor.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(libs.ktor.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(libs.ktor.client.wasm)&#10;        }&#10;    }&#10;}"/>
                <p>
                    完成后，你可以添加一个 <code>TaskApi</code> 类型，作为你的客户端围绕 Ktor Client 的薄封装。
                </p>
            </step>
            <step>
                从主菜单中选择
                <ui-path>Build | Sync Project with Gradle Files</ui-path>
                以导入构建文件中的更改。
            </step>
            <step>
                导航至
                <Path>app/shared/src/commonMain/kotlin/com/example/ktor</Path>
                并创建一个名为
                <Path>network</Path>
                的新包。
            </step>
            <step>
                <p>
                    在新包内，创建一个新的
                    <Path>HttpClientManager.kt</Path>
                    文件用于客户端配置：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot; // 请替换为你当前机器的 IP 地址。&#10;        port = 8080&#10;    }&#10;}"/>
                <p>
                    将 <code>1.2.3.4</code> 替换为你当前机器的 IP 地址。你将无法从运行在 Android 虚拟设备或 iOS 模拟器上的代码中调用 <code>0.0.0.0</code> 或 <code>localhost</code>。
                </p>
                <tip>
                    <p><b>查找你的 IP 地址：</b></p>
                    <p>
                        由于移动端模拟器无法访问 <code>localhost</code>，你需要机器的实际 IP 地址。要查找你的 IP 地址，请运行以下命令之一：
                    </p>
                    <list>
                        <li><b>macOS:</b> <code>ifconfig | grep "inet " | grep -v 127.0.0.1</code></li>
                        <li><b>Linux:</b> <code>hostname -I | awk '{print $1}'</code></li>
                        <li><b>Windows:</b> <code>ipconfig</code> 并查找“IPv4 地址”</li>
                    </list>
                </tip>
            </step>
            <step>
                <p>
                    在同一个
                    <Path>app/shared/.../network</Path>
                    包中，创建一个具有以下实现的新
                    <Path>TaskApi.kt</Path>
                    文件：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import com.example.ktor.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    导航至
                    <Path>app/shared/.../App.kt</Path>
                    并使用以下实现替换代码。
                    这将使用 <code>TaskApi</code> 类型从服务器检索任务列表，然后在一个列中显示每个任务的名称：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.network.createHttpClient&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    在服务器运行的同时，通过运行 <ui-path>iosApp</ui-path> 运行配置来测试 iOS 应用程序。
                </p>
            </step>
            <step>
                <p>
                    点击
                    <control>Fetch Tasks</control>
                    按钮显示任务列表：
                    <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                         alt="在 iOS 上运行的应用" width="363" border-effect="rounded"/>
                </p>
                <note>
                    在本次演示中，为了清晰起见，我们简化了流程。在现实世界的应用中，避免在网络上发送未加密的数据至关重要。
                </note>
            </step>
            <step>
                <p>
                    在 Android 平台上，你需要明确授予应用程序网络权限，并允许其以明文形式发送和接收数据。要启用这些权限，请打开
                    <Path>app/androidApp/src/main/AndroidManifest.xml</Path>
                    并添加以下设置：
                </p>
                <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
            </step>
            <step>
                <p>
                    使用 <ui-path>app.androidApp</ui-path> 运行配置运行 Android 应用程序。
                    你应该会发现你的 Android 客户端现在也能正常运行了：
                    <img style="block" src="full_stack_development_tutorial_run_android.png"
                         alt="在 Android 上运行的应用" width="350" />
                </p>
            </step>
            <step>
                <p>
                    对于桌面端客户端，你将为包含的窗口分配尺寸和标题。
                    打开文件
                    <Path>app/desktopApp/src/.../main.kt</Path>
                    并通过更改 <code>title</code> 和设置 <code>state</code> 属性来修改代码：
                </p>
                <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication,&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
            </step>
            <step>
                <p>
                    使用 <ui-path>app [hot] 🔥</ui-path> 运行配置运行桌面端应用程序：
                    <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                         alt="在桌面端运行的应用" width="400" border-effect="rounded"/>
                </p>
            </step>
            <step>
                <p>
                    使用以下运行配置之一运行 Web 客户端：
                </p>
                <list>
                    <li>
                        <ui-path>app [js]</ui-path>：运行你的 Kotlin/JS 应用程序。
                    </li>
                    <li>
                        <ui-path>app [wasmJs]</ui-path>：运行你的 Kotlin/Wasm 应用程序。
                    </li>
                </list>
                <img style="block" src="full_stack_development_tutorial_run_web.png"
                     alt="在 Web 端运行的应用" width="400" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="美化 UI" id="improve-ui">
        <p>
            现在客户端正在与服务器通信，但其 UI 显然不够吸引人。
        </p>
        <procedure id="improve-ui-procedure">
            <step>
                <p>
                    打开位于
                    <Path>app/shared/src/commonMain/.../ktor</Path>
                    的
                    <Path>App.kt</Path>
                    文件，并使用下面的 <code>App</code> 和 <code>TaskCard</code> 可组合项替换现有的 <code>App</code>：
                </p>
                <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    通过这一实现，你的客户端现在已经具备了一些基本功能。
                </p>
                <p>
                    通过使用 <code>LaunchedEffect</code> 类型，所有任务都会在启动时加载，而 <code>LazyColumn</code> 可组合项允许用户滚动浏览任务。
                </p>
                <p>
                    最后，创建了一个独立的 <code>TaskCard</code> 可组合项，它反过来使用 <code>Card</code> 来显示每个 <code>Task</code> 的详细信息。添加了用于删除和更新任务的按钮。
                </p>
            </step>
            <step>
                <p>
                    重新运行客户端应用程序——例如 Android 应用。
                    你现在可以滚动浏览任务、查看其详细信息并删除它们：
                    <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                         alt="具有改进 UI 的 Android 应用" width="350" border-effect="rounded"/>
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="添加更新功能" id="add-update-functionality">
        <p>
            为了完善客户端，加入允许更新任务详细信息的功能。
        </p>
        <procedure id="add-update-func-procedure">
            <step>
                导航至
                <Path>app/shared/src/commonMain/.../ktor</Path>
                中的
                <Path>App.kt</Path>
                文件。
            </step>
            <step>
                <p>
                    添加 <code>UpdateTaskDialog</code> 可组合项和必要的导入，如下所示：
                </p>
                <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    这是一个使用对话框显示 <code>Task</code> 详细信息的可组合项。<code>description</code> 和 <code>priority</code> 被放置在 <code>TextField</code> 可组合项中，以便它们可以被更新。当用户按下更新按钮时，它会触发 <code>onConfirm()</code> 回调。
                </p>
            </step>
            <step>
                <p>
                    在同一个文件中更新 <code>App</code> 可组合项：
                </p>
                <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    你正在存储一个额外的状态片段，即当前选定的任务。如果该值不为 null，那么我们就调用 <code>UpdateTaskDialog</code> 可组合项，并将 <code>onConfirm()</code> 回调设置为使用 <code>TaskApi</code> 向服务器发送 POST 请求。
                </p>
                <p>
                    最后，在创建 <code>TaskCard</code> 可组合项时，你使用 <code>onUpdate()</code> 回调来设置 <code>currentTask</code> 状态变量。
                </p>
            </step>
            <step>
                重新运行客户端应用程序。你现在应该能够使用这些按钮更新每个任务的详细信息。
                <img style="block" src="full_stack_development_tutorial_update_task.gif"
                     alt="在 Android 上删除任务" width="350" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="后续步骤" id="next-steps">
        <p>
            在本文中，你已在 Kotlin Multiplatform 应用程序的环境中使用了 Ktor。你现在可以创建一个包含多个服务和客户端的项目，目标平台涵盖一系列不同的平台。
        </p>
        <p>
            如你所见，构建功能而不产生任何代码重复或冗余是可能的。项目各层所需的类型可以放置在
            <Path>core</Path>
            多平台模块中。仅由服务需要的功能放置在
            <Path>server</Path>
            模块中，而仅由客户端需要的功能则放置在
            <Path>app</Path>
            模块中。
        </p>
        <p>
            这种开发方式不可避免地需要客户端和服务器端技术的知识。但你可以使用 <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a> 库和 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 来最大限度地减少你需要学习的新材料。即使你的重点最初只在单一平台上，你也可以随着对应用程序需求的增长轻松添加其他平台。
        </p>
    </chapter>
</topic>