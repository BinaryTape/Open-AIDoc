<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="使用 Kotlin Multiplatform 构建全栈应用程序" id="full-stack-development-with-kotlin-multiplatform">
<show-structure for="chapter, procedure" depth="2"/>
<web-summary>
    了解如何使用 Kotlin 和 Ktor 开发跨平台全栈应用程序。在本教程中，你将了解如何使用 Kotlin Multiplatform 构建 Android、iOS 和桌面应用程序，并使用 Ktor 轻松处理数据。
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
        <b>代码示例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用的插件</b>: <Links href="/ktor/server-routing" summary="Routing 是一个用于在服务器应用程序中处理传入请求的核心插件。">Routing</Links>,
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
        <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Content Negotiation</Links>,
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>,
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
    </p>
</tldr>
<p>
    在本文中，你将学习如何使用 Kotlin 开发一个全栈应用程序，该应用程序可在 Android、iOS 和桌面平台上运行，并同时利用 Ktor 实现无缝数据处理。
</p>
<p>完成本教程后，你将了解如何执行以下操作：</p>
<list>
    <li>使用 <a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
        Kotlin Multiplatform</a> 创建全栈应用程序。
    </li>
    <li>了解使用 IntelliJ IDEA 生成的项目。</li>
    <li>创建调用 Ktor 服务的 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 客户端。
    </li>
    <li>在设计的不同层之间复用共享类型。</li>
    <li>正确包含和配置多平台库。</li>
</list>
<p>
    在之前的教程中，我们使用任务管理器示例来
    <Links href="/ktor/server-requests-and-responses" summary="了解如何使用 Kotlin 和 Ktor 通过构建任务管理器应用程序来处理请求、路由和参数的基础知识。">处理请求</Links>、
    <Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包括一个生成 JSON 文件的 RESTful API 示例。">创建 RESTful API</Links>，并
    <Links href="/ktor/server-integrate-database" summary="了解使用 Exposed SQL 库将 Ktor 服务连接到数据库版本库的过程。">与 Exposed 集成数据库</Links>。
    客户端应用程序保持尽可能精简，以便你能够专注于学习 Ktor 的基础知识。
</p>
<p>
    你将创建一个面向 Android、iOS 和桌面平台的客户端，并使用 Ktor 服务来获取要显示的数据。在可能的情况下，你将在客户端和服务器之间共享数据类型，从而加快开发速度并减少潜在错误。
</p>
<chapter title="先决条件" id="prerequisites">
    <p>
        与之前的文章一样，你将使用 IntelliJ IDEA 作为 IDE。要安装和配置你的环境，请参阅
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
            Kotlin Multiplatform 快速入门
        </a> 指南。
    </p>
    <p>
        如果这是你首次使用 Compose Multiplatform，我们建议你在开始本教程之前，先完成
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
            Compose Multiplatform 入门
        </a>
        教程。为了降低任务的复杂性，你可以专注于一个客户端平台。例如，如果你从未使用过 iOS，那么专注于桌面或 Android 开发可能更明智。
    </p>
</chapter>
<chapter title="创建新项目" id="create-project">
    <p>
        请使用 IntelliJ IDEA 中的 Kotlin Multiplatform 项目向导，而不是 Ktor 项目生成器。
        它将创建一个基本的多平台项目，你可以通过客户端和服务对其进行扩展。客户端可以使用原生 UI 库，例如 SwiftUI，但在本教程中，你将使用
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> 为所有平台创建共享 UI。
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
                    <ui-path>Group</ui-path>
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
                和
                <ui-path>Server</ui-path>
                作为目标平台。
            </p>
        </step>
        <step>
            <p>
                如果你使用的是 Mac，请同时选择
                <ui-path>iOS</ui-path>
                。确保选中
                <ui-path>Share UI</ui-path>
                选项。
                <img style="block" src="full_stack_development_tutorial_create_project.png"
                     alt="Kotlin Multiplatform 向导设置" width="706" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                单击
                <control>Create</control>
                按钮，等待 IDE 生成并导入项目。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="运行服务" id="run-service">
    <procedure id="run-service-procedure">
        <step>
            在
            <ui-path>Project</ui-path>
            视图中，导航到
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            并打开
            <Path>Application.kt</Path>
            文件。
        </step>
        <step>
            单击
            <ui-path>Run</ui-path>
            按钮
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 运行图标"/>)
            ，启动 `main()` 函数旁边的应用程序。
            <p>
                <ui-path>Run</ui-path>
                工具窗口中将打开一个新选项卡，其日志以消息“Responding at http://0.0.0.0:8080”结尾。
            </p>
        </step>
        <step>
            <p>
                导航到 [http://0.0.0.0:8080/](http://0.0.0.0:8080/) 以打开应用程序。
                你将看到浏览器中显示来自 Ktor 的消息。
                <img src="full_stack_development_tutorial_run.png"
                     alt="Ktor 服务器浏览器响应" width="706"
                     border-effect="rounded" style="block"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="检查项目" id="examine-project">
    <p>
        项目的
        <Path>server</Path>
        文件夹是三个 Kotlin 模块之一。另外两个是
        <Path>shared</Path>
        和
        <Path>composeApp</Path>
        。
    </p>
    <p>
        <Path>server</Path>
        模块的结构与 <a href="https://start.ktor.io/">Ktor 项目生成器</a>生成的结构非常相似。
        你有一个专门的构建文件来声明插件和依赖项，以及一个包含构建和启动 Ktor 服务代码的源代码集：
    </p>
    <img src="full_stack_development_tutorial_server_folder.png"
         alt="Kotlin Multiplatform 项目中 server 文件夹的内容" width="300"
         border-effect="line"/>
    <p>
        如果你查看
        <Path>Application.kt</Path>
        文件中的路由指令，你将看到对 `greet()` 函数的调用：
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(&quot;Ktor: ${Greeting().greet()}&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <p>
        这将创建 `Greeting` 类型的一个实例，并调用其 `greet()` 方法。
        `Greeting` 类在 <Path>shared</Path> 模块中定义：
        <img src="full_stack_development_tutorial_shared_module.png"
             alt="在 IntelliJ IDEA 中打开的 Greeting.kt 和 Platform.kt" width="706"
             border-effect="line" style="block"/>
    </p>
    <p>
        <Path>shared</Path>
        模块包含将在不同目标平台之间使用的代码。
    </p>
    <p>
        <Path>shared</Path>
        模块集中的 <Path>commonMain</Path> 源代码集包含将在所有平台上使用的类型。
        如你所见，`Greeting` 类型就是在此处定义的。
        这也是你放置要在服务器和所有不同客户端平台之间共享的公共代码的地方。
    </p>
    <p>
        <Path>shared</Path>
        模块还包含你希望提供客户端的每个平台的源代码集。这是因为
        <Path>commonMain</Path>
        中声明的类型可能需要因目标平台而异的功能。对于
        `Greeting` 类型，你希望使用平台特有的 API 获取当前平台的名称。
        这通过 <a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">预期
        和实际声明</a> 实现。
    </p>
    <p>
        在
        <Path>shared</Path>
        模块的
        <Path>commonMain</Path>
        源代码集中，你使用 `expect` 关键字声明一个 `getPlatform()` 函数：
    </p>
    <tabs>
        <tab title="commonMain/Platform.kt" id="commonMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
        </tab>
    </tabs>
    <p>然后，每个目标平台
        都必须提供 `getPlatform()` 函数的 `actual` 声明，如下所示：
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
        项目中还有一个额外的模块，即
        <Path>composeApp</Path>
        模块。
        它包含 Android、iOS、桌面和 Web 客户端应用的代码。
        这些应用目前未链接到 Ktor 服务，但它们确实使用了共享的
        <code>Greeting</code> 类。
    </p>
</chapter>
<chapter title="运行客户端应用程序" id="run-client-app">
    <p>
        你可以通过执行目标平台的运行配置来运行客户端应用程序。要在 iOS 模拟器上运行应用程序，请按照以下步骤操作：
    </p>
    <procedure id="run-ios-app-procedure">
        <step>
            在 IntelliJ IDEA 中，选择
            <Path>iosApp</Path>
            运行配置和模拟设备。
            <img src="full_stack_development_tutorial_run_configurations.png"
                 alt="运行与调试窗口" width="400"
                 border-effect="line" style="block"/>
        </step>
        <step>
            单击
            <ui-path>Run</ui-path>
            按钮
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA 运行图标"/>)
            以运行配置。
        </step>
        <step>
            <p>
                当你运行 iOS 应用时，它在后台使用 Xcode 构建并在 iOS 模拟器中启动。
                该应用显示一个按钮，点击时切换图像。
                <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                     alt="在 iOS 模拟器中运行应用" width="300" border-effect="rounded"/>
            </p>
            <p>
                首次按下按钮时，当前平台的详细信息将添加到其文本中。实现此功能的代码位于
                <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager/App.kt</Path>
                中：
            </p>
            <code-block lang="kotlin" code="            @Composable&#10;            fun App() {&#10;                MaterialTheme {&#10;                    var greetingText by remember { mutableStateOf(&quot;Hello World!&quot;) }&#10;                    var showImage by remember { mutableStateOf(false) }&#10;                    Column(&#10;                        Modifier.fillMaxWidth(),&#10;                        horizontalAlignment = Alignment.CenterHorizontally&#10;                    ) {&#10;                        Button(onClick = {&#10;                            greetingText = &quot;Compose: ${Greeting().greet()}&quot;&#10;                            showImage = !showImage&#10;                        }) {&#10;                            Text(greetingText)&#10;                        }&#10;                        AnimatedVisibility(showImage) {&#10;                            Image(&#10;                                painterResource(Res.drawable.compose_multiplatform),&#10;                                null&#10;                            )&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
            <p>
                这是一个可组合函数，你将在本文后面进行修改。目前重要的是，它显示了一个 UI 并使用了共享的
                <code>Greeting</code> 类型，而 `Greeting` 类型又使用了实现通用
                <code>Platform</code> 接口的平台特有类。
            </p>
        </step>
    </procedure>
    <p>
        现在你了解了生成的项目结构，可以逐步添加任务管理器功能了。
    </p>
</chapter>
<chapter title="添加模型类型" id="add-model-types">
    <p>
        首先，添加模型类型，并确保客户端和服务器都可以访问它们。
    </p>
    <procedure id="add-model-types-procedure">
        <step>
            导航到
            <Path>shared/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            并创建一个名为
            <Path>model</Path>
            的新包。
        </step>
        <step>
            在新包中，创建一个名为
            <Path>Task.kt</Path>
            的新文件。
        </step>
        <step>
            <p>
                添加一个 `enum` 来表示优先级，并添加一个 `class` 来表示任务。
                `Task`
                类使用
                `kotlinx.serialization`
                库中的
                `Serializable`
                类型进行注解：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                你会注意到导入和注解都无法编译。这是因为项目尚未依赖 `kotlinx.serialization` 库。
            </p>
        </step>
        <step>
            <p>
                导航到
                <Path>shared/build.gradle.kts</Path>
                并添加序列化插件：
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.1.21&quot;&#10;}"/>
        </step>
        <step>
            <p>
                在同一个文件中，向
                <Path>commonMain</Path>
                源代码集添加一个新的依赖项：
            </p>
            <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // put your Multiplatform dependencies here&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
        </step>
        <step>
            导航到
            <Path>gradle/libs.versions.toml</Path>
            并定义以下内容：
            <code-block lang="toml" code="[versions]&#10;kotlinxSerializationJson = &quot;1.8.1&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinxSerializationJson&quot; }"/>
        </step>
        <!-- the plugin version can also be set in the version catalog -->
        <step>
            在 IntelliJ IDEA 中，选择
            <ui-path>Build | Sync Project with Gradle Files</ui-path>
            以应用更新。Gradle 导入完成后，你将发现你的
            <Path>Task.kt</Path>
            文件成功编译。
        </step>
    </procedure>
    <!-- The following seems like a lot of nuance to cover for this newbie-oriented tutorial.
     I think at this point it's enough to know that the serialization library requires a Gradle plugin.
     If it's important, it would be nice to make the terminology more precise: earlier we said it won't compile, and now
     we're saying it would, so I'm not sure what's going on in the end.
     -->
    <p>
        请注意，即使不包含序列化插件，代码也能够编译，但是，在网络上序列化 `Task` 对象所需的类型将不会生成。这将导致在尝试调用服务时出现运行时错误。
    </p>
    <p>
        将序列化插件放在另一个模块（例如
        <Path>server</Path>
        或
        <Path>composeApp</Path>
        ）不会在构建时导致错误。但同样，序列化所需的额外类型也不会生成，从而导致运行时错误。
    </p>
</chapter>
<chapter title="创建服务器" id="create-server">
    <p>
        下一阶段是为我们的任务管理器创建服务器实现。
    </p>
    <procedure id="create-server-procedure">
        <step>
            导航到
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            文件夹，并创建一个名为
            <Path>model</Path>
            的子包。
        </step>
        <step>
            <p>
                在此包中，创建一个新的
                <Path>TaskRepository.kt</Path>
                文件，并为我们的版本库添加以下接口：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
        </step>
        <step>
            <p>
                在同一个包中，创建一个名为
                <Path>InMemoryTaskRepository.kt</Path>
                的新文件，其中包含以下类：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                导航到
                <Path>server/src/main/kotlin/.../Application.kt</Path>
                并用以下实现替换现有代码：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.model.InMemoryTaskRepository&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = SERVER_PORT, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // For ease of demonstration we allow any connections.&#10;        // Don't do this in production.&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                此实现与之前教程中的实现非常相似，不同之处在于现在为了简化起见，你已将所有路由代码放置在 `Application.module()` 函数中。
            </p>
            <p>
                一旦你输入此代码并添加了导入，你将发现多个编译错误，因为代码使用了多个 Ktor 插件，这些插件需要作为依赖项包含在内，
                其中包括用于与 Web 客户端交互的 <Links href="/ktor/server-cors" summary="Required dependencies: io.ktor:%artifact_name% Code example: %example_name% Native server support: ✅">CORS</Links> 插件。
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
                打开服务器模块构建文件（
                <Path>server/build.gradle.kts</Path>
                ）并添加以下依赖项：
            </p>
            <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(libs.ktor.serialization.kotlinx.json.jvm)&#10;    implementation(libs.ktor.server.content.negotiation.jvm)&#10;    implementation(libs.ktor.server.cors.jvm)&#10;}"/>
        </step>
        <step>
            再次，从主菜单中选择 <ui-path>Build | Sync Project with Gradle Files</ui-path>。
            导入完成后，你将发现 `ContentNegotiation` 类型和 `json()` 函数的导入工作正常。
        </step>
        <step>
            重新运行服务器。你将发现可以从浏览器访问路由。
        </step>
        <step>
            <p>
                导航到 <a href="http://0.0.0.0:8080/tasks"></a>
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
        为了使你的客户端能够访问服务器，你需要包含 Ktor Client。这涉及三种类型的依赖项：
    </p>
    <list>
        <li>Ktor Client 的核心功能。</li>
        <li>平台特有的引擎来处理网络连接。</li>
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
            导航到
            <Path>composeApp/build.gradle.kts</Path>
            并添加以下依赖项：
            <code-block lang="kotlin" code="kotlin {&#10;&#10;    //...&#10;    sourceSets {&#10;        val desktopMain by getting&#10;        &#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.core)&#10;            implementation(libs.ktor.client.content.negotiation)&#10;            implementation(libs.ktor.serialization.kotlinx.json)&#10;        }&#10;        desktopMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(libs.ktor.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(libs.ktor.client.wasm)&#10;        }&#10;    }&#10;}"/>
            <p>
                完成后，你可以为客户端添加一个 `TaskApi` 类型，作为 Ktor Client 的轻量级包装器。
            </p>
        </step>
        <step>
            从主菜单中选择 <ui-path>Build | Sync Project with Gradle Files</ui-path>
            以导入构建文件中的更改。
        </step>
        <step>
            导航到
            <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            并创建一个名为
            <Path>network</Path>
            的新包。
        </step>
        <step>
            <p>
                在新包中，为客户端配置创建一个新的
                <Path>HttpClientManager.kt</Path>
                文件：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot;&#10;        port = 8080&#10;    }&#10;}"/>
            <p>
                请注意，你应该将 `1.2.3.4` 替换为当前机器的 IP 地址。你无法从 Android 虚拟设备或
                iOS 模拟器上运行的代码调用 `0.0.0.0` 或 `localhost`。
                <!-- should we include instructions on finding out the IP address?
                     `ipconfig getifaddr en0`or something -->
            </p>
        </step>
        <step>
            <p>
                在同一个
                <Path>composeApp/.../full_stack_task_manager/network</Path>
                包中，创建一个新的
                <Path>TaskApi.kt</Path>
                文件，其中包含以下实现：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                导航到
                <Path>commonMain/.../App.kt</Path>
                并用以下实现替换 `App` 可组合项。
                这将使用 `TaskApi` 类型从服务器检索任务 list，然后
                在列中显示每个任务的名称：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                在服务器运行时，通过运行 <ui-path>iosApp</ui-path> 运行配置来测试 iOS 应用程序。
            </p>
        </step>
        <step>
            <p>
                单击
                <control>Fetch Tasks</control>
                按钮以显示任务 list：
                <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                     alt="应用在 iOS 上运行" width="363" border-effect="rounded"/>
            </p>
            <note>
                在此演示中，为了清晰起见，我们简化了流程。在实际应用程序中，避免通过网络发送未加密的数据至关重要。
            </note>
        </step>
        <step>
            <p>
                在 Android 平台上，你需要显式地授予应用程序网络权限，并允许它以明文形式发送和接收数据。要启用这些权限，请打开
                <Path>composeApp/src/androidMain/AndroidManifest.xml</Path>
                并添加以下设置：
            </p>
            <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
        </step>
        <step>
            <p>
                使用 <ui-path>composeApp</ui-path> 运行配置运行 Android 应用程序。
                你现在将发现你的 Android 客户端也将运行：
                <img style="block" src="full_stack_development_tutorial_run_android.png"
                     alt="应用在 Android 上运行" width="350" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                对于桌面客户端，你应该为包含窗口分配尺寸和标题。
                打开文件
                <Path>composeApp/src/desktopMain/.../main.kt</Path>
                并通过更改 `title` 和设置 `state` 属性来修改代码：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                使用 <ui-path>composeApp [desktop]</ui-path> 运行配置运行桌面应用程序：
                <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                     alt="应用在桌面运行" width="400" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                使用 <ui-path>composeApp [wasmJs]</ui-path> 运行配置运行 Web 客户端：
            </p>
            <img style="block" src="full_stack_development_tutorial_run_web.png"
                 alt="应用在桌面运行" width="400" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="改进 UI" id="improve-ui">
    <p>
        客户端现在正在与服务器通信，但这远非一个吸引人的 UI。
    </p>
    <procedure id="improve-ui-procedure">
        <step>
            <p>
                打开位于
                <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
                中的
                <Path>App.kt</Path>
                文件，并用下面的 `App` 和 `TaskCard`
                可组合项替换现有的 `App`：
            </p>
            <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                通过此实现，你的客户端现在具有一些基本功能。
            </p>
            <p>
                通过使用 `LaunchedEffect` 类型，所有任务都在启动时加载，而 `LazyColumn`
                可组合项允许用户滚动浏览任务。
            </p>
            <p>
                最后，创建了一个单独的 `TaskCard` 可组合项，它又使用一个
                `Card` 来显示每个 `Task` 的详细信息。已添加按钮来删除和更新任务。
            </p>
        </step>
        <step>
            <p>
                重新运行客户端应用程序——例如，Android 应用。
                你现在可以滚动浏览任务、查看其详细信息并删除它们：
                <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                     alt="应用在 Android 上运行，UI 已改进" width="350" border-effect="rounded"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="添加更新功能" id="add-update-functionality">
    <p>
        要完成客户端，请集成允许更新任务详细信息的功能。
    </p>
    <procedure id="add-update-func-procedure">
        <step>
            导航到
            <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
            中的
            <Path>App.kt</Path>
            文件。
        </step>
        <step>
            <p>
                添加 `UpdateTaskDialog` 可组合项和必要的导入，如下所示：
            </p>
            <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                这是一个可组合项，通过对话框显示 `Task` 的详细信息。`description`
                和 `priority` 放置在 `TextField` 可组合项中，以便可以更新它们。当用户按下更新按钮时，它会触发 `onConfirm()` 回调。
            </p>
        </step>
        <step>
            <p>
                更新同一个文件中的 `App` 可组合项：
            </p>
            <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                你正在存储一个额外的状态片段，即当前选定的任务。如果此值不为 null，则我们调用 `UpdateTaskDialog` 可组合项，并将 `onConfirm()` 回调设置为使用 `TaskApi` 向服务器发送 POST 请求。
            </p>
            <p>
                最后，当你创建 `TaskCard` 可组合项时，你使用 `onUpdate()` 回调来设置 `currentTask` 状态变量。
            </p>
        </step>
        <step>
            重新运行客户端应用程序。你现在应该能够使用按钮更新每个任务的详细信息。
            <img style="block" src="full_stack_development_tutorial_update_task.gif"
                 alt="在 Android 上删除任务" width="350" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        在本文中，你已在 Kotlin Multiplatform 应用程序的上下文中使用 Ktor。你现在可以创建一个包含多个服务和客户端的项目，面向各种不同的平台。
    </p>
    <p>
        如你所见，可以构建特性而无需任何代码重复或冗余。项目所有层中所需的类型都可以放置在
        <Path>shared</Path>
        多平台模块中。服务所需的功能放置在
        <Path>server</Path>
        模块中，而客户端所需的功能则放置在
        <Path>composeApp</Path>
        中。
    </p>
    <p>
        这种开发不可避免地需要客户端和服务器技术知识。但是你可以使用 <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
        Multiplatform</a> 库和 <a href="https://www.jetbrains.com/lp/compose-multiplatform/">
        Compose Multiplatform</a> 来最大限度地减少你需要学习的新内容。即使你的重点最初只在一个平台上，随着你的应用程序需求增长，你也可以轻松添加其他平台。
    </p>
</chapter>
</topic>