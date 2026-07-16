<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="创建客户端应用程序"
       id="client-create-new-application"
       help-id="getting_started_ktor_client;client-getting-started;client-get-started;client-create-a-new-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-client-get-started"/>
    <p>
        <b>代码示例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    创建你的第一个客户端应用程序，用于发送请求和接收响应。
</link-summary>
<p>
    Ktor 包含一个多平台异步 HTTP 客户端，它允许你<Links href="/ktor/client-requests" summary="了解如何发出请求以及如何指定各种请求参数：请求 URL、HTTP 方法、请求头和请求体。">发出请求</Links>和<Links href="/ktor/client-responses" summary="了解如何接收响应、获取响应体以及获取响应参数。">处理响应</Links>，
    并通过<Links href="/ktor/client-plugins" summary="了解提供常用功能（例如日志记录、序列化、授权等）的插件。">插件</Links>扩展其功能，例如<Links href="/ktor/client-auth" summary="Auth 插件处理客户端应用程序中的身份验证和授权。">身份验证</Links>、
    <Links href="/ktor/client-serialization" summary="ContentNegotiation 插件主要有两个用途：在客户端和服务器之间协商媒体类型，以及在发送请求和接收响应时以特定格式序列化/反序列化内容。">JSON 序列化</Links>等。
</p>
<p>
    在本教程中，我们将向你展示如何创建你的第一个 Ktor 客户端应用程序，该应用程序会发送请求并
    打印出响应。
</p>
<chapter title="先决条件" id="prerequisites">
    <p>
        在开始本教程之前，请<a href="https://www.jetbrains.com/help/idea/installation-guide.html">安装 IntelliJ IDEA Community 或
            Ultimate 版本</a>。
    </p>
</chapter>
<chapter title="创建新项目" id="new-project">
    <p>
        你可以在现有项目中手动<Links href="/ktor/client-create-and-configure" summary="了解如何创建和配置 Ktor 客户端。">创建和配置</Links> Ktor 客户端，但是从头开始的一个便捷方式是使用
        IntelliJ IDEA 中捆绑的 Kotlin 插件生成新项目。
    </p>
    <p>
        要创建新的 Kotlin 项目，请<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">打开 IntelliJ IDEA</a> 并按照
        以下步骤操作：
    </p>
    <procedure>
        <step>
            <p>
                在欢迎屏幕上，点击 <control>New Project</control>。
            </p>
            <p>
                或者，从主菜单中选择 <ui-path>File | New | Project</ui-path>。
            </p>
        </step>
        <step>
            <p>
                在<control>New Project</control>向导中，从左侧列表中选择<control>Kotlin</control>。
            </p>
        </step>
        <step>
            <p>
                在右侧窗格中，指定以下设置：
            </p>
            <img src="client_get_started_new_project.png" alt="IntelliJ IDEA 中的新 Kotlin 项目窗口"
                 border-effect="rounded"
                 width="706"/>
            <list id="kotlin_app_settings">
                <li>
                    <p>
                        <control>Name</control>
                        : 指定项目名称。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Location</control>
                        : 为你的项目指定一个目录。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Build system</control>
                        : 确保已选择 <control>Gradle</control>。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Gradle DSL</control>
                        : 选择 <control>Kotlin</control>。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Add sample code</control>
                        : 选择此选项以在生成的项目中包含示例代码。
                    </p>
                </li>
            </list>
        </step>
        <step>
            <p>
                点击<control>Create</control>并等待 IntelliJ IDEA 生成项目并安装依赖项。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="添加依赖项" id="add-dependencies">
    <p>
        让我们添加 Ktor 客户端所需的依赖项。
    </p>
    <procedure>
        <step>
            <p>
                打开 <Path>gradle.properties</Path> 文件并添加以下行以指定 Ktor 版本：
            </p>
            <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
            <note id="eap-note">
                <p>
                    要使用 Ktor 的 Early Access Preview 版本，你需要添加 <a href="#repositories">Space 版本库</a>。
                </p>
            </note>
        </step>
        <step>
            <p>
                打开 <Path>build.gradle.kts</Path> 文件并将以下构件添加到依赖项代码块中：
            </p>
            <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
            <list>
                <li><code>ktor-client-core</code> 是提供主要客户端功能的核心依赖项。
                </li>
                <li>
                    <code>ktor-client-cio</code> 是用于处理网络请求的<Links href="/ktor/client-engines" summary="了解处理网络请求的引擎。">引擎</Links>的依赖项。
                </li>
            </list>
        </step>
        <step>
            <p>
                点击 <Path>build.gradle.kts</Path> 文件右上角的<control>Load Gradle Changes</control>图标以安装新添加的依赖项。
            </p>
            <img src="client_get_started_load_gradle_changes_name.png" alt="Load Gradle Changes" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="创建客户端" id="create-client">
    <p>
        要添加客户端实现，请导航到 <Path>src/main/kotlin</Path> 并按照以下步骤操作：
    </p>
    <procedure>
        <step>
            <p>
                打开 <Path>Main.kt</Path> 文件并将现有代码替换为以下实现：
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
            <p>
                在 Ktor 中，客户端由 <a
                    href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>
                类表示。
            </p>
        </step>
        <step>
            <p>
                使用 <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a> 方法<Links href="/ktor/client-requests" summary="了解如何发出请求以及如何指定各种请求参数：请求 URL、HTTP 方法、请求头和请求体。">发出 GET 请求</Links>。
                <Links href="/ktor/client-responses" summary="了解如何接收响应、获取响应体以及获取响应参数。">响应</Links>将作为 <code>HttpResponse</code> 类
                对象接收。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
            <p>
                添加上述代码后，IDE 会针对 <code>get()</code> 函数显示以下错误：
                <emphasis>挂起函数 'get' 只能从协程或另一个挂起函数中调用</emphasis>
                。
            </p>
            <img src="client_get_started_suspend_error.png" alt="挂起函数错误" width="706"/>
            <p>
                要解决此问题，你需要使 <code>main()</code> 函数变为挂起函数。
            </p>
            <tip>
                关于调用 <code>suspend</code> 函数的更多信息，请参阅<a
                    href="https://kotlinlang.org/docs/coroutines-basics.html">协程基础</a>。
            </tip>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击定义旁边的红色灯泡图标并选择
                <control>Make main suspend</control>
                。
            </p>
            <img src="client_get_started_suspend_error_fix.png" alt="使 main 挂起" width="706"/>
        </step>
        <step>
            <p>
                使用 <code>println()</code> 函数打印服务器返回的<a href="#status">状态码</a>，并使用 <code>close()</code> 函数
                关闭流并释放与之关联的任何资源。
                <Path>Main.kt</Path> 文件应如下所示：
            </p>
            <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
        </step>
    </procedure>
</chapter>
<chapter title="运行应用程序" id="make-request">
    <p>
        要运行你的应用程序，请导航到 <Path>Main.kt</Path> 文件并按照以下步骤操作：
    </p>
    <procedure>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击 <code>main()</code> 函数旁边的边栏图标并选择
                <control>Run 'MainKt'</control>
                。
            </p>
            <img src="client_get_started_run_main.png" alt="运行应用" width="706"/>
        </step>
        <step>
            等待 IntelliJ IDEA 运行应用程序。
        </step>
        <step>
            <p>
                你将在 IDE 底部窗格的 <control>Run</control> 中看到输出。
            </p>
            <img src="client_get_started_run_output_with_warning.png" alt="服务器响应" width="706"/>
            <p>
                尽管服务器以 <code>200 OK</code> 消息响应，
                但你还会看到一条错误消息，指出 SLF4J 未能找到 <code>StaticLoggerBinder</code> 类，默认为空操作 (NOP) 日志记录器
                实现。这实际上意味着日志记录被禁用。
            </p>
            <p>
                你现在拥有了一个可用的客户端应用程序。然而，要修复此警告并能够使用日志记录调试
                HTTP 调用，<a href="#enable-logging">还需要一个额外步骤</a>。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="启用日志记录" id="enable-logging">
    <p>
        因为 Ktor 使用 SLF4J 抽象层进行 JVM 上的日志记录，所以要启用日志记录，你需要
        <a href="#jvm">提供一个日志记录框架</a>，例如
        <a href="https://logback.qos.ch/">Logback</a>。
    </p>
    <procedure id="enable-logging-procedure">
        <step>
            <p>
                在 <Path>gradle.properties</Path> 文件中，指定日志记录框架的版本：
            </p>
            <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
        </step>
        <step>
            <p>
                打开 <Path>build.gradle.kts</Path> 文件并将以下构件添加到依赖项代码块中：
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
        </step>
        <step>
            点击<control>Load Gradle Changes</control>图标以安装新添加的依赖项。
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA 重新运行图标"/>) 以重新启动
                应用程序。
            </p>
        </step>
        <step>
            <p>
                你不应再看到错误，但在 IDE 底部窗格的 <control>Run</control> 中将显示相同的 <code>200 OK</code> 消息。
            </p>
            <img src="client_get_started_run_output.png" alt="服务器响应" width="706"/>
            <p>
                至此，你已启用日志记录。要开始查看日志，你需要添加日志记录
                配置。
            </p>
        </step>
        <step>
            <p>导航到
                <Path>src/main/resources</Path>
                并创建一个新的
                <Path>logback.xml</Path>
                文件，其实现如下：
            </p>
            <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            undefined&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，点击重新运行按钮 (<img src="intellij_idea_rerun_icon.svg"
                                                       style="inline" height="16" width="16"
                                                       alt="intelliJ IDEA 重新运行图标"/>) 以重新启动
                应用程序。
            </p>
        </step>
        <step>
            <p>
                你现在应该能够在 <control>Run</control> 窗格中看到打印响应上方的追踪日志：
            </p>
            <img src="client_get_started_run_output_with_logs.png" alt="服务器响应" width="706"/>
        </step>
    </procedure>
    <tip>
        Ktor 通过<Links href="/ktor/client-logging" summary="所需依赖项：io.ktor:ktor-client-logging 代码示例：%example_name%">Logging</Links>插件提供了一种简单直接的方式来添加 HTTP 调用的日志，而添加配置文件则允许你在复杂应用程序中微调日志行为。
    </tip>
</chapter>
<chapter title="后续步骤" id="next-steps">
    <p>
        要更好地理解和扩展此配置，请探索如何
        <Links href="/ktor/client-create-and-configure" summary="了解如何创建和配置 Ktor 客户端。">创建和配置 Ktor 客户端</Links>。
    </p>
</chapter>