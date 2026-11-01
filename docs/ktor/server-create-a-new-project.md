<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="创建、打开并运行新的 Ktor 项目"
       id="server-create-a-new-project"
       help-id="server_create_a_new_project">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-get-started"/>
        <p>
            <b>代码示例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        了解如何使用 Ktor 打开、运行和测试服务器应用程序。
    </link-summary>
    <web-summary>
        开始构建您的第一个 Ktor Server 应用程序。在本教程中，您将学习如何创建、打开和运行新的 Ktor 项目。
    </web-summary>
    <p>
        在本教程中，您将学习如何创建、打开和运行您的第一个 Ktor 服务器项目。成功运行后，您可以完成一系列任务以熟悉 Ktor。
    </p>
    <p>
        这是帮助您开始使用 Ktor 构建服务器应用程序系列教程的第一篇。您可以独立完成每个教程，但我们强烈建议您按照推荐的顺序进行学习：
    </p>
    <list type="decimal">
        <li>创建、打开并运行新的 Ktor 项目。</li>
        <li><Links href="server-requests-and-responses.topic" summary="通过构建任务管理器应用程序，学习在 Kotlin 中使用 Ktor 进行路由、处理请求和形参的基础知识。">处理请求并生成响应</Links>。</li>
        <li><Links href="server-create-restful-apis.topic" summary="学习如何使用 Kotlin 和 Ktor 构建后端服务，以生成 JSON 文件的 RESTful API 为例。">创建生成 JSON 的 RESTful API</Links>。</li>
        <li><Links href="server-create-website.topic" summary="学习如何使用 Kotlin 结合 Ktor 和 Thymeleaf 模板构建网站。">使用 Thymeleaf 模板创建网站</Links>。</li>
        <li><Links href="server-create-websocket-application.topic" summary="了解如何利用 WebSocket 的强大功能来发送和接收内容。">创建 WebSocket 应用程序</Links>。</li>
        <li><Links href="server-integrate-database.md" summary="了解使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。">使用 Exposed 集成数据库</Links>。</li>
    </list>
    <chapter id="create-project" title="创建新的 Ktor 项目">
        <p>
            创建新 Ktor 项目最快的方法之一是<a href="#create-project-with-the-ktor-project-generator">使用基于 Web 的 Ktor 项目生成器</a>。
        </p>
        <p>
            或者，您也可以<a href="#create_project_with_intellij">使用适用于 IntelliJ IDEA Ultimate 的专用 Ktor 插件</a>或 <a href="#create_project_with_ktor_cli_tool">Ktor CLI 工具</a>来生成项目。
        </p>
        <chapter title="使用 Ktor 项目生成器"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                要使用 Ktor 项目生成器创建新项目，请按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>前往 <a href="https://start.ktor.io/">Ktor 项目生成器</a>。</p>
                </step>
                <step>
                    <p>在
                        <control>Project artifact</control>
                        字段中，输入
                        <Path>com.example.ktor-sample</Path>
                        作为项目工件的名称。
                        <img src="ktor_343_project_generator_new_project_artifact_name.png"
                             alt="带有 Project Artifact 名称 com.example.ktor-sample 的 Ktor 项目生成器"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step id="configure-project-step">
                    <p>点击
                        <control>Configure</control>
                        以打开设置下拉菜单：
                        <img src="ktor_343_project_generator_new_project_configure.png"
                             style="block"
                             alt="Ktor 项目设置展开视图" border-effect="line" width="706"/>
                    </p>
                    <p>
                        提供以下设置项：
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>：
                                选择所需的<Links href="server-dependencies.topic" summary="了解如何向现有 Gradle/Maven 项目添加 Ktor Server 依赖项。">构建系统</Links>。可以是 <emphasis>Gradle Kotlin</emphasis>、<emphasis>Gradle Groovy</emphasis>、<emphasis>Maven</emphasis> 或 <emphasis>Amper</emphasis>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>：
                                选择用于运行服务器的<Links href="server-engines.md" summary="了解用于处理网络请求的引擎。">引擎</Links>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>：
                                选择是<Links href="server-configuration-file.topic" summary="了解如何在配置文件中配置各种服务器参数。">在 YAML 或 HOCON 文件中</Links>指定服务器参数，还是<Links href="server-configuration-code.topic" summary="了解如何在代码中配置各种服务器参数。">在代码中</Links>指定。
                            </p>
                            <warning>
                                目前基于 Maven 的 Ktor 项目不支持 YAML 配置。
                            </warning>
                        </li>
                    </list>
                    <p>在本教程中，您可以保留这些设置的默认值。</p>
                </step>
                <step>
                    <p>点击
                        <control>Done</control>
                        以保存配置并关闭菜单。
                    </p>
                </step>
                <step>
                    <p>下方列出了一组可以添加到项目中的<Links href="server-plugins.md" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links>。插件是为 Ktor 应用程序提供常用功能的基础构建块，例如身份验证、序列化和内容编码、压缩、Cookie 支持等。
                    </p>
                    <p>在本教程中，现阶段您无需添加任何插件。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>Download</control>
                        按钮以生成并下载您的 Ktor 项目。
                        <img src="ktor_343_project_generator_new_project_download.png"
                             alt="Ktor 项目生成器下载按钮"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>下载应会自动开始。</p>
            </procedure>
            <p>生成新项目后，接下来请继续进行<a href="#unpacking">解压缩并运行您的 Ktor 项目</a>。</p>
        </chapter>
        <chapter title="使用适用于 IntelliJ IDEA Ultimate 的 Ktor 插件" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                本节介绍如何使用适用于 IntelliJ IDEA Ultimate 的 <a
                    href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 插件</a>设置项目。
            </p>
            <p>
                要创建新的 Ktor 项目，请<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">打开 IntelliJ IDEA</a> 并按以下步骤操作：
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
                        在
                        <control>New Project</control>
                        向导中，从左侧列表中选择
                        <control>Ktor</control>。
                    </p>
                </step>
                <step>
                    <p>
                        在右侧窗格中，您可以指定以下设置：
                    </p>
                    <img src="ktor_idea_new_project_settings.png" alt="Ktor 项目设置" width="706"
                         border-effect="rounded"/>
                    <list>
                        <li>
                            <p>
                                <control>Name</control>：指定项目名称。输入
                                <Path>ktor-sample</Path>
                                作为项目名称。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Location</control>：指定项目的目录。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Website</control>：
                                指定用于生成包名的网域。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Artifact</control>：
                                该字段显示生成的工件名称。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>：
                                选择用于运行服务器的<Links href="server-engines.md" summary="了解用于处理网络请求的引擎。">引擎</Links>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Include samples</control>：
                                保持启用此选项以添加插件的示例代码。
                            </p>
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        点击
                        <control>Advanced Settings</control>
                        以展开附加设置菜单：
                    </p>
                    <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor 项目高级设置"
                         width="706" border-effect="rounded"/>
                    <p>
                        提供以下设置项：
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>：
                                选择所需的<Links href="server-dependencies.topic" summary="了解如何向现有 Gradle/Maven 项目添加 Ktor Server 依赖项。">构建系统</Links>。可以是 <emphasis>Gradle Kotlin</emphasis>、<emphasis>Gradle Groovy</emphasis>、<emphasis>Maven</emphasis> 或 <emphasis>Amper</emphasis>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor version</control>：
                                选择所需的 Ktor 版本。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>：
                                选择是<Links href="server-configuration-file.topic" summary="了解如何在配置文件中配置各种服务器参数。">在 YAML 或 HOCON 文件中</Links>指定服务器参数，还是<Links href="server-configuration-code.topic" summary="了解如何在代码中配置各种服务器参数。">在代码中</Links>指定。
                            </p>
                            <warning>
                                目前基于 Maven 的 Ktor 项目不支持 YAML 配置。
                            </warning>
                        </li>
                    </list>
                    <p>在本教程中，您可以保留这些设置的默认值。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>Next</control>
                        进入下一页。
                    </p>
                    <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor 插件" width="706"
                         border-effect="rounded"/>
                    <p>
                        在此页面上，您可以选择一组<Links href="server-plugins.md" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links>——这些是提供 Ktor 应用程序通用功能的基础构建块，例如身份验证、序列化和内容编码、压缩、Cookie 支持等。
                    </p>
                    <p>在本教程中，现阶段您无需添加任何插件。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>Create</control>
                        并等待 IntelliJ IDEA 生成项目并安装依赖项。
                    </p>
                </step>
            </procedure>
            <p>
                创建新项目后，接下来请继续学习如何<a href="#open-explore-run">打开、浏览并运行</a>应用程序。
            </p>
        </chapter>
        <chapter title="使用 Ktor CLI 工具" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                本节介绍如何使用
                <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 工具</a>设置项目。
            </p>
            <p>
                要创建新的 Ktor 项目，请打开您常用的终端并按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    使用以下命令之一安装 Ktor CLI 工具：
                    <tabs>
                        <tab title="macOS/Linux" id="macos-linux">
                            <code-block lang="console" code="                                brew install ktor"/>
                        </tab>
                        <tab title="Windows" id="windows">
                            <code-block lang="console" code="                                winget install JetBrains.KtorCLI"/>
                        </tab>
                    </tabs>
                </step>
                <step>
                    要在交互模式下生成新项目，请使用以下命令：
                    <code-block lang="console" code="                      ktor new"/>
                </step>
                <step>
                    输入
                    <Path>ktor-sample</Path>
                    作为项目名称：
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="在交互模式下使用 Ktor CLI 工具"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        （可选）您还可以通过编辑项目名称下方的
                        <ui-path>Location</ui-path>
                        路径来更改项目的保存位置。
                    </p>
                </step>
                <step>
                    按
                    <shortcut>Enter</shortcut>
                    键继续。
                </step>
                <step>
                    在下一步中，您可以搜索并向项目添加<Links href="server-plugins.md" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links>。插件是为 Ktor 应用程序提供常用功能的基础构建块，例如身份验证、序列化和内容编码、压缩、Cookie 支持等。
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="使用 Ktor CLI 工具向项目添加插件"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>在本教程中，现阶段您无需添加任何插件。</p>
                </step>
                <step>
                    按
                    <shortcut>CTRL+G</shortcut>
                    生成项目。
                    <p>
                        或者，您也可以通过选择
                        <control>CREATE PROJECT (CTRL+G)</control>
                        并按
                        <shortcut>Enter</shortcut>
                        键来生成项目。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="解压缩并运行您的 Ktor 项目" id="unpacking">
        <p>
            在本节中，您将学习如何从命令行解压缩、构建和运行项目。以下步骤假设：
        </p>
        <list type="bullet">
            <li>您已创建并下载了名为
                <Path>ktor-sample</Path>
                的 Gradle 项目。
            </li>
            <li>该项目位于您主目录中名为
                <Path>myprojects</Path>
                的文件夹内。
            </li>
        </list>
        <p>如有必要，请根据您自己的设置修改名称和路径。</p>
        <p>打开您常用的命令行工具并按照以下步骤操作：</p>
        <procedure>
            <step>
                <p>在终端窗口中，导航到下载项目的文件夹：</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>将 ZIP 压缩包解压缩到同名文件夹中：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                    </tab>
                </tabs>
                <p>现在您的目录中将包含该 ZIP 压缩包和解压后的文件夹。</p>
            </step>
            <step>
                <p>从该目录进入新创建的文件夹：</p>
                <code-block lang="console" code="                    cd ktor-sample"/>
            </step>
            <step>
                <p>在 macOS 和 UNIX 系统上，您必须为 Gradle 帮助程序脚本添加可执行权限，以便系统将其识别为可运行的命令。为此，请使用 <code>chmod</code> 命令：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            chmod +x ./gradlew"/>
                    </tab>
                </tabs>
            </step>
            <step>
                <p>要构建项目，请使用以下命令：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew build"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew build"/>
                    </tab>
                </tabs>
                <p>构建成功后，请继续进行下一步以运行项目。</p>
            </step>
            <step>
                <p>要运行项目，请使用以下命令：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew run"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew run"/>
                    </tab>
                </tabs>
            </step>
            <step>
                <p>要验证项目是否正在运行，请在浏览器中打开终端输出中显示的 URL（<a
                        href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）。
                    您应该会在浏览器中看到显示的“Hello World!”消息：</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="生成的 ktor 项目的输出"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>祝贺您！您已成功启动了 Ktor 项目。</p>
        <note>
            请注意，命令行此时无法响应输入，因为底层进程正在运行 Ktor 应用程序。您可以按
            <shortcut>CTRL+C</shortcut>
            终止该应用程序。
        </note>
    </chapter>
    <chapter title="在 IntelliJ IDEA 中打开、浏览并运行您的 Ktor 项目" id="open-explore-run">
        <chapter title="打开项目" id="open">
            <p>如果您安装了 <a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>，可以轻松地从命令行打开该项目。
            </p>
            <p>
                请确保您位于项目文件夹中，然后输入 <code>idea</code> 命令，后跟一个英文句点表示当前文件夹：
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                或者，若要手动打开项目，请启动 IntelliJ IDEA。
            </p>
            <p>
                如果打开了欢迎屏幕，请点击
                <control>Open</control>。否则，请转到主菜单中的
                <ui-path>File | Open</ui-path>，选择
                <Path>ktor-sample</Path>
                文件夹将其打开。
            </p>
            <tip>
                有关管理项目的更多详情，请参阅 <a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA 文档</a>。
            </tip>
        </chapter>
        <chapter title="浏览项目" id="explore">
            <p>打开项目后，您可以看到如下结构：</p>
            <img src="tutorial_server_get_started_idea_project_view.png" alt="IDE 中生成的 Ktor 项目视图" width="706"/>
            <p>
                若要查看完整布局，请点击每个文件夹旁的展开箭头以展开 <control>Project</control> 视图中的文件夹。
            </p>
            <p>
                应用程序源代码位于
                <Path>src/main/kotlin</Path>
                下。默认创建了两个文件，分别命名为
                <Path>Application.kt</Path>
                和
                <Path>Routing.kt</Path>。
            </p>
            <img src="tutorial_server_get_started_idea_main_folder.png" alt="Ktor 项目 src 文件夹结构" width="400"/>
            <p>项目的名称在
                <Path>settings.gradle.kts</Path>
                文件中配置：
            </p>
            <code-block lang="kotlin" code="rootProject.name = &quot;ktor-sample&quot;"/>
            <p>
                配置文件以及其他类型的内容存放在
                <Path>src/main/resources</Path>
                文件夹中。
            </p>
            <img src="tutorial_server_get_started_idea_resources_folder.png" alt="Ktor 项目 resources 文件夹结构"
                 width="400"/>
        </chapter>
        <chapter title="运行项目" id="run">
            <procedure>
                <p>若要在 IntelliJ IDEA 内运行项目：</p>
                <step>
                    <p>点击右侧侧边栏上的 Gradle 图标（<img alt="intelliJ IDEA gradle icon"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>）打开 <a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 工具窗口</a>。</p>
                </step>
                <step>
                    <p>在此工具窗口中，导航到
                        <ui-path>Tasks | application</ui-path>，双击
                        <control>run</control>
                        任务。
                    </p>
                    <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA 中的 Gradle 选项卡"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>您的 Ktor 应用程序将在 IDE 底部的 <a
                            href="https://www.jetbrains.com/help/idea/run-tool-window.html">Run 工具窗口</a>中启动：</p>
                    <img src="tutorial_server_get_started_idea_run_terminal.png" alt="在终端中运行的项目" width="706"/>
                    <p>先前在命令行中显示的消息现在将显示在
                        <ui-path>Run</ui-path>
                        工具窗口中。
                    </p>
                </step>
                <step>
                    <p>若要确认项目正在运行，请在浏览器中打开指定的 URL（<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）。</p>
                    <p>您应该会再次看到屏幕上显示的“Hello World!”消息：</p>
                    <img src="server_get_started_ktor_sample_app_output.png" alt="浏览器屏幕中的 Hello World"
                         width="706"/>
                </step>
            </procedure>
            <p>
                您可以通过
                <ui-path>Run</ui-path>
                工具窗口管理应用程序。
            </p>
            <list type="bullet">
                <li>
                    要终止应用程序，请点击停止按钮 <img src="intellij_idea_terminate_icon.svg"
                                                                             style="inline" height="16" width="16"
                                                                             alt="intelliJ IDEA terminate icon"/>。
                </li>
                <li>
                    要重新启动进程，请点击重新运行按钮 <img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="intelliJ IDEA rerun icon"/>。
                </li>
            </list>
            <p>
                这些选项在 <a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA Run 工具窗口文档</a>中有进一步说明。
            </p>
        </chapter>
    </chapter>
    <chapter title="可尝试的其他任务" id="additional-tasks">
        <p>以下是您可能希望尝试的一些其他任务：</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">更改默认端口</a></li>
            <li><a href="#add-a-new-http-endpoint">添加新的 HTTP 端点</a></li>
            <li><a href="#configure-static-content">配置静态内容</a></li>
            <li><a href="#write-an-integration-test">编写集成测试</a></li>
            <li><a href="#register-error-handlers">注册错误处理程序</a></li>
        </list>
        <p>
            这些任务彼此独立，但难度逐渐增加。按列出的顺序尝试是循序渐进学习的最简单方式。为简单起见并避免重复，以下说明均假定您按顺序尝试这些任务。
        </p>
        <p>
            凡需要编写代码之处，我们均已指定了代码和相应的导入。IDE 可能会自动为您添加这些导入。
        </p>
        <chapter title="更改默认端口" id="change-the-default-port">
            <chapter title="在配置文件中更改端口" id="change-the-port-in-config">
                <p>
                    如果您选择将配置保存在外部的 YAML 或 HOCON 文件中，请在
                    <ui-path>Project</ui-path>
                    视图中导航到
                    <Path>src/main/resources</Path>
                    文件夹并按以下步骤操作：
                </p>
                <procedure id="change-default-port-yaml-procedure">
                    <step>
                        打开您的配置文件（<Path>application.yaml</Path> 或 <Path>application.conf</Path>）。它应如下所示：
                        <tabs>
                            <tab title="application.yaml (YAML)" group-key="yaml">
                                <code-block lang="yaml" code="ktor:&#10;  deployment:&#10;    port: 8080&#10;  application:&#10;    modules:&#10;      - com.example.RoutingKt.configureRouting"/>
                            </tab>
                            <tab title="application.conf (HOCON)" group-key="hocon">
                                <code-block lang="generic" code="ktor {&#10;  deployment {&#10;    port = 8080&#10;    port = ${?PORT}&#10;  }&#10;  application {&#10;    modules = [&#10;      com.example.RoutingKt.configureRouting&#10;    ]&#10;  }&#10;}"/>
                            </tab>
                        </tabs>
                    </step>
                    <step>
                        将文件中的 <code>port</code> 值更改为您选择的另一个数字，例如 <code>9292</code>。
                    </step>
                    <step>
                        <p>点击重新运行按钮（<img alt="intelliJ IDEA rerun button icon"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                    </step>
                    <step>
                        <p>要验证应用程序是否在新端口号下运行，您可以在浏览器中打开新的 URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>），或者<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中创建新的 HTTP 请求文件</a>：</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="在 IntelliJ IDEA 中使用 HTTP 请求文件测试端口更改" width="706"/>
                    </step>
                </procedure>
            </chapter>
            <chapter title="在代码中更改端口" id="change-the-port-in-code">
                <p>
                    <a href="#configure-project-step">创建新的 Ktor 项目时</a>，您可以选择在代码中或在外部的 YAML 或 HOCON 文件中存储配置。
                </p>
                <p>
                    如果您选择在代码中存储配置，请在
                    <ui-path>Project</ui-path>
                    视图中导航到
                    <Path>src/main/kotlin</Path>
                    文件夹并按以下步骤操作：
                </p>
                <procedure id="change-the-default-port-code-procedure">
                    <step>
                        <p>打开
                            <Path>main.kt</Path>
                            文件。您应该会看到类似如下的代码：
                        </p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>在 <code>embeddedServer()</code> 函数中，将 <code>port</code> 形参更改为您选择的另一个数字，例如 <code>9292</code>。</p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>点击重新运行按钮（<img alt="IntelliJ IDEA rerun button icon"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                    </step>
                    <step>
                        <p>要验证应用程序是否在新端口号下运行，您可以在浏览器中打开新的 URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>），或者<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中创建新的 HTTP 请求文件</a>：</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="在 IntelliJ IDEA 中使用 HTTP 请求文件测试端口更改" width="706"/>
                    </step>
                </procedure>
            </chapter>
        </chapter>
        <chapter title="添加新的 HTTP 端点" id="add-a-new-http-endpoint">
            <p>
                在
                <ui-path>Project</ui-path>
                工具窗口中，导航到
                <Path>src/main/kotlin</Path>
                文件夹并按以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开
                        <Path>Routing.kt</Path>
                        文件。您应该会看到如下代码：
                    </p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>要创建新端点，请如下所示插入附加路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <note>请注意，您可以将 <code>/test1</code> URL 更改为您喜欢的任何内容。</note>
                </step>
                <step>
                    <p>IDE 会自动添加 <code>ContentType</code> 的导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
                </step>
                <step>
                    <p>点击重新运行按钮（<img alt="intelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                </step>
                <step>
                    <p>在浏览器中请求新的 URL（<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>）。端口号取决于您是否完成了<a href="#change-the-default-port">更改默认端口</a>任务。您应该会看到如下所示的输出：</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="显示 Hello from Ktor 的浏览器屏幕" width="706"/>
                    <p>如果您创建了 HTTP 请求文件，也可以在其中验证新端点：</p>
                    <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                    <note>请注意，需要使用包含三个井号（<code>###</code>）的行来分隔不同的请求。</note>
                </step>
            </procedure>
        </chapter>
        <chapter title="配置静态内容" id="configure-static-content">
            <p>在
                <ui-path>Project</ui-path>
                工具窗口中，导航到
                <Path>src/main/kotlin</Path>
                文件夹并按以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开 <Path>Routing.kt</Path> 文件并将以下路由添加到 routing 部分：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                    <p>该行的含义如下：</p>
                    <list type="bullet">
                        <li>调用 <code>staticResources()</code> 使您的应用程序能够提供标准网站内容，例如 HTML 和 JavaScript 文件。尽管这些内容可以在浏览器中执行，但从服务器的角度来看，它们被视为静态内容。
                        </li>
                        <li>URL <code>/content</code> 指定了用于提取此内容的路径。
                        </li>
                        <li>路径 <code>mycontent</code> 是存放静态内容的文件夹名称。Ktor 将在 <code>resources</code> 目录中查找该文件夹。
                        </li>
                    </list>
                </step>
                <step>
                    <p>如果 IDE 未自动添加，请手动添加以下导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
                </step>
                <step>
                    <p>在
                        <control>Project</control>
                        工具窗口中，右键点击 <Path>src/main/resources</Path> 文件夹并选择
                        <control>New | Directory</control>。
                    </p>
                    <p>或者，选中 <Path>src/main/resources</Path> 文件夹，按
                        <shortcut>⌘Cmd+N</shortcut>（macOS）或 <shortcut>Ctrl+N</shortcut>（Windows/Linux），然后点击
                        <control>Directory</control>。
                    </p>
                </step>
                <step>
                    <p>将新目录命名为 <code>mycontent</code> 并按
                        <shortcut>↩Enter</shortcut>
                        键。
                    </p>
                </step>
                <step>
                    <p>右键点击新建的文件夹，然后点击
                        <control>New | File</control>。
                    </p>
                </step>
                <step>
                    <p>将新文件命名为 <Path>sample.html</Path> 并按
                        <shortcut>↩Enter</shortcut>
                        键。
                    </p>
                </step>
                <step>
                    <p>使用有效的 HTML 填充新创建的文件页面，例如：</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>点击重新运行按钮（<img alt="IntelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                </step>
                <step>
                    <p>当您在浏览器中打开 <a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a> 时，应会显示示例页面的内容：</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="浏览器中静态页面的输出" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="编写集成测试" id="write-an-integration-test">
            <p>
                Ktor 支持<Links href="server-testing.md" summary="了解如何使用专用测试引擎测试您的服务器应用程序。">创建集成测试</Links>，并且生成的项目已捆绑了此功能。
            </p>
            <p>若要使用此功能，请按照以下步骤操作：</p>
            <procedure>
                <step>
                    <p>
                        导航到
                        <Path>src/test/kotlin</Path>
                        文件夹。
                    </p>
                </step>
                <step>
                    <p>打开 <Path>ServerTest.kt</Path> 文件。您应该会看到如下代码：</p>
                    <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // 加载默认配置&#10;        configure()&#10;        // 验证服务器根路径返回 200&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                    <p><code>testApplication()</code> 函数会创建一个新的 Ktor 实例。此实例运行在测试环境中，而不是诸如 Netty 之类的服务器中。</p>
                    <p>然后，您可以使用 <code>configure()</code> 函数来调用从 <code>embeddedServer()</code> 调用的相同设置。</p>
                    <p>最后，您可以使用内置的 <code>client</code> 对象和 JUnit 断言来发送示例请求并检查响应。</p>
                </step>
            </procedure>
            <p>
                您可以使用在 IntelliJ IDEA 中执行测试的任何标准方式来运行该测试。请注意，由于您运行的是一个新的 Ktor 实例，因此测试的成功或失败并不取决于您的应用程序是否正在 <code>0.0.0.0</code> 运行。
            </p>
            <p>
                如果您已成功完成<a href="#add-a-new-http-endpoint">添加新的 HTTP 端点</a>任务，请添加以下测试：
            </p>
            <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
            <p>添加以下附加导入：</p>
            <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
        </chapter>
        <chapter title="注册错误处理程序" id="register-error-handlers">
            <p>
                您可以使用 <Links href="server-status-pages.md" summary="%plugin_name% 允许 Ktor 应用程序根据引发的异常或状态代码对任何故障状态做出相应响应。">StatusPages 插件</Links>来处理 Ktor 应用程序中的错误。
            </p>
            <tip>
                默认情况下，该插件未包含在项目中。您可以在使用 Ktor 项目生成器或 IntelliJ IDEA 的项目向导创建项目时，通过
                <ui-path>Plugins</ui-path>
                部分将其添加到项目中。
            </tip>
            <p>
                在接下来的步骤中，您将学习如何手动添加和配置该插件。实现这一目标包含四个步骤：
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">在 Gradle 构建文件中添加新依赖项。</a></li>
                <li><a href="#install-plugin-and-specify-handler">安装插件并指定异常处理程序。</a></li>
                <li><a href="#write-sample-code">编写示例代码以触发该处理程序。</a></li>
                <li><a href="#restart-and-invoke">重新启动并调用示例代码。</a></li>
            </list>
            <procedure title="添加新依赖项" id="add-dependency">
                <p>在
                    <control>Project</control>
                    工具窗口中，导航到项目根文件夹并按以下步骤操作：
                </p>
                <step>
                    <p>打开 <Path>build.gradle.kts</Path> 文件并添加新依赖项，如下所示：</p>
                    <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // 添加新依赖项&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(libs.kotlin.test)&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
                </step>
                <step>
                    <p>按
                        <shortcut>Shift+⌘Cmd+I</shortcut>（macOS）或
                        <shortcut>Ctrl+Shift+O</shortcut>（Windows/Linux）重新加载项目。
                    </p>
                </step>
            </procedure>
            <procedure title="安装插件并指定异常处理程序"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p>导航到 <Path>Routing.kt</Path> 中的 <code>.configureRouting()</code> 方法，并添加以下代码行：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                    <p>这些代码行会安装 <code>StatusPages</code> 插件，并指定当引发 <code>IllegalStateException</code> 类型的异常时应执行的操作。</p>
                </step>
                <step>
                    <p>添加以下导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
                </step>
            </procedure>
            <p>
                请注意，通常在响应中会设置 HTTP 错误代码，但出于此任务的目的，输出直接显示在浏览器中。
            </p>
            <procedure title="编写示例代码以触发处理程序" id="write-sample-code">
                <step>
                    <p>仍在 <code>.configureRouting()</code> 方法中，如下所示添加其他路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>现在您已添加了一个 URL 为 <code>/error-test</code> 的端点。触发此端点时，将引发处理程序中所用类型的异常。</p>
                </step>
            </procedure>
            <procedure title="重新启动并调用示例代码" id="restart-and-invoke">
                <step>
                    <p>点击重新运行按钮（<img alt="intelliJ IDEA rerun button icon"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p></step>
                <step>
                    <p>在浏览器中，转到 URL <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a>。您应该会看到如下所示的错误消息：</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="显示消息“App in illegal state as Too Busy”的浏览器屏幕" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="后续步骤" id="next_steps">
        <p>
            如果您已经完成了所有附加任务，那么现在您已经掌握了配置 Ktor 服务器、集成 Ktor 插件以及实现新路由的方法。然而，这仅仅是个开始。要更深入地了解 Ktor 的核心概念，请继续阅读本指南的下一篇教程。
        </p>
        <p>
            接下来，您将学习如何<Links href="server-requests-and-responses.topic" summary="通过构建任务管理器应用程序，学习在 Kotlin 中使用 Ktor 进行路由、处理请求和形参的基础知识。">通过创建任务管理器应用程序来处理请求并生成响应</Links>。
        </p>
    </chapter>
</topic>