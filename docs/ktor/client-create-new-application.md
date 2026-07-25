<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="创建客户端应用程序"
       id="client-create-new-application"
       help-id="getting_started_ktor_client;client-getting-started;client-get-started;client-create-a-new-application">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-client-get-started"/>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        创建您的第一个用于发送请求并接收响应的客户端应用程序。
    </link-summary>
    <p>
        Ktor 包含一个多平台异步 HTTP 客户端，允许您<Links href="//client-requests" summary="了解如何进行请求并指定各种请求参数：请求 URL、HTTP 方法、标头和请求正文。">发送请求</Links>并<Links href="//client-responses" summary="了解如何接收响应、获取响应正文以及获取响应参数。">处理响应</Links>，
        并通过<Links href="//client-plugins" summary="了解如何使用客户端插件添加通用功能，例如日志记录、序列化和身份验证。">插件</Links>扩展其功能，例如<Links href="//client-auth" summary="Auth 插件用于在客户端应用程序中处理身份验证和授权。">身份验证</Links>、
        <Links href="//client-serialization" summary="ContentNegotiation 插件有两个主要用途：在客户端和服务器之间协商媒体类型，以及在发送请求和接收响应时以特定格式序列化/反序列化内容。">JSON 序列化</Links>等。
    </p>
    <p>
        在本教程中，我们将向您展示如何创建第一个发送请求并打印响应的 Ktor 客户端应用程序。
    </p>
    <chapter title="前提条件" id="prerequisites">
        <p>
            在开始本教程之前，请<a href="https://www.jetbrains.com/help/idea/installation-guide.html">安装 IntelliJ IDEA Community 或 Ultimate</a>。
        </p>
    </chapter>
    <chapter title="创建新项目" id="new-project">
        <p>
            您可以手动在现有项目中<Links href="//client-create-and-configure" summary="了解如何创建和配置 Ktor 客户端。">创建并配置</Links> Ktor 客户端，不过，从头开始的一种便捷方式是使用 IntelliJ IDEA 内置的 Kotlin 插件生成新项目。
        </p>
        <p>
            要创建一个新的 Kotlin 项目，请<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">打开 IntelliJ IDEA</a> 并按照以下步骤操作：
        </p>
        <procedure>
            <step>
                <p>
                    在欢迎界面中，点击 <control>New Project</control>。
                </p>
                <p>
                    或者，从主菜单中选择 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>New Project</control>
                    向导中，从左侧列表中选择
                    <control>Kotlin</control>。
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
                            ：指定项目名称。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Location</control>
                            ：指定项目的目录。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Build system</control>
                            ：确保已选择
                            <control>Gradle</control>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Gradle DSL</control>
                            ：选择
                            <control>Kotlin</control>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Add sample code</control>
                            ：选中此选项可在生成的项目中包含示例代码。
                        </p>
                    </li>
                </list>
            </step>
            <step>
                <p>
                    点击
                    <control>Create</control>
                    并等待 IntelliJ IDEA 生成项目并安装依赖项。
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
                    打开
                    <Path>gradle.properties</Path>
                    文件并添加以下行以指定 Ktor 版本：
                </p>
                <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
                <note id="eap-note">
                    <p>
                        要使用 Ktor 的 EAP 版本，您需要添加 <a href="#repositories">Space 仓库</a>。
                    </p>
                </note>
            </step>
            <step>
                <p>
                    打开
                    <Path>build.gradle.kts</Path>
                    文件并将以下构件添加到 dependencies 块中：
                </p>
                <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
                <list>
                    <li><code>ktor-client-core</code> 是提供主要客户端功能的核心依赖项。
                    </li>
                    <li>
                        <code>ktor-client-cio</code> 是处理网络请求的<Links href="//client-engines" summary="了解处理网络请求的引擎。">引擎</Links>依赖项。
                    </li>
                </list>
            </step>
            <step>
                <p>
                    点击
                    <Path>build.gradle.kts</Path>
                    文件右上角的
                    <control>Load Gradle Changes</control>
                    图标以安装新添加的依赖项。
                </p>
                <img src="client_get_started_load_gradle_changes_name.png" alt="加载 Gradle 更改" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="创建客户端" id="create-client">
        <p>
            要添加客户端实现，请导航至
            <Path>src/main/kotlin</Path>
            并按照以下步骤操作：
        </p>
        <procedure>
            <step>
                <p>
                    打开
                    <Path>Main.kt</Path>
                    文件并用以下实现替换现有代码：
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
                <p>
                    在 Ktor 中，客户端由 <a
                        href="https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>
                    类表示。
                </p>
            </step>
            <step>
                <p>
                    使用 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a> 方法来<Links href="//client-requests" summary="了解如何进行请求并指定各种请求参数：请求 URL、HTTP 方法、标头和请求正文。">发送 GET 请求</Links>。
                    <Links href="//client-responses" summary="了解如何接收响应、获取响应正文以及获取响应参数。">响应</Links>将作为 <code>HttpResponse</code> 类对象接收。
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
                <p>
                    添加上述代码后，IDE 会对 <code>get()</code> 函数显示以下错误：
                    <emphasis>Suspend function 'get' should be called only from a coroutine or another suspend
                        function
                    </emphasis>（Suspend 函数 'get' 只能从协程或其他 suspend 函数中调用）。
                </p>
                <img src="client_get_started_suspend_error.png" alt="Suspend 函数错误" width="706"/>
                <p>
                    要修复此错误，您需要使 <code>main()</code> 函数成为 suspending。
                </p>
                <tip>
                    要详细了解如何调用 <code>suspend</code> 函数，请参阅<a
                        href="https://kotlinlang.org/docs/coroutines-basics.html">协程基础知识</a>。
                </tip>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击定义旁边的灯泡图标并选择
                    <control>Make main suspend</control>。
                </p>
                <img src="client_get_started_suspend_error_fix.png" alt="使 main 成为 suspend" width="706"/>
            </step>
            <step>
                <p>
                    使用 <code>println()</code> 函数打印服务器返回的<a href="#status">状态码</a>，并使用 <code>close()</code> 函数关闭流并释放与其关联的所有资源。
                    <Path>Main.kt</Path>
                    文件应如下所示：
                </p>
                <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="运行您的应用程序" id="make-request">
        <p>
            要运行您的应用程序，请导航至
            <Path>Main.kt</Path>
            文件并按照以下步骤操作：
        </p>
        <procedure>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击 <code>main()</code> 函数旁边的装订区域图标，然后选择
                    <control>Run 'MainKt'</control>。
                </p>
                <img src="client_get_started_run_main.png" alt="运行应用" width="706"/>
            </step>
            <step>
                等待 IntelliJ IDEA 运行应用程序。
            </step>
            <step>
                <p>
                    您将在 IDE 底部的
                    <control>Run</control>
                    窗格中看到显示的输出。
                </p>
                <img src="client_get_started_run_output_with_warning.png" alt="服务器响应" width="706"/>
                <p>
                    虽然服务器返回了 <code>200 OK</code> 消息，但您还会看到一条错误消息，指出 SLF4J 无法定位
                    <code>StaticLoggerBinder</code> 类，默认使用无操作 (NOP) 日志记录器实现。这实际上意味着日志记录已被禁用。
                </p>
                <p>
                    您现在已经拥有了一个可以运行的客户端应用程序。但是，要修复此警告并能够通过日志调试 HTTP 调用，还需要执行<a href="#enable-logging">额外步骤</a>。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="启用日志" id="enable-logging">
        <p>
            由于 Ktor 在 JVM 上使用 SLF4J 抽象层进行日志记录，要启用日志记录，您需要<a href="#jvm">提供一个日志框架</a>，例如
            <a href="https://logback.qos.ch/">Logback</a>。
        </p>
        <procedure id="enable-logging-procedure">
            <step>
                <p>
                    在
                    <Path>gradle.properties</Path>
                    文件中，指定日志框架的版本：
                </p>
                <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
            </step>
            <step>
                <p>
                    打开
                    <Path>build.gradle.kts</Path>
                    文件并将以下构件添加到 dependencies 块中：
                </p>
                <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
            </step>
            <step>
                点击
                <control>Load Gradle Changes</control>
                图标以安装新添加的依赖项。
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击重新运行按钮（<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新运行图标"/>）以重启应用程序。
                </p>
            </step>
            <step>
                <p>
                    您应该不再看到错误，但同样的 <code>200 OK</code> 消息仍将显示在 IDE 底部的
                    <control>Run</control>
                    窗格中。
                </p>
                <img src="client_get_started_run_output.png" alt="服务器响应" width="706"/>
                <p>
                    至此，您已启用了日志功能。要开始看到日志，您需要添加日志配置。
                </p>
            </step>
            <step>
                <p>导航至
                    <Path>src/main/resources</Path>
                    并创建一个新的
                    <Path>logback.xml</Path>
                    文件，其内容如下：
                </p>
                <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            undefined&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，点击重新运行按钮（<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新运行图标"/>）以重启应用程序。
                </p>
            </step>
            <step>
                <p>
                    您现在应该能够在
                    <control>Run</control>
                    窗格中打印的响应上方看到跟踪日志：
                </p>
                <img src="client_get_started_run_output_with_logs.png" alt="服务器响应" width="706"/>
            </step>
        </procedure>
        <tip>
            Ktor 通过 <Links href="//client-logging" summary="所需依赖项：io.ktor:ktor-client-logging">Logging</Links> 插件提供了一种简单直接的方法来为 HTTP 调用添加日志，而添加配置文件则允许您在复杂的应用程序中微调日志行为。
        </tip>
    </chapter>
    <chapter title="后续步骤" id="next-steps">
        <p>
            要更好地理解并扩展此配置，请探索如何<Links href="//client-create-and-configure" summary="了解如何创建和配置 Ktor 客户端。">创建并配置 Ktor 客户端</Links>。
        </p>
    </chapter>
</topic>