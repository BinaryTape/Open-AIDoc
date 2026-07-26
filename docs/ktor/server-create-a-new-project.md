<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="创建、打开并运行新的 Ktor 项目"
       id="server-create-a-new-project"
       help-id="server_create_a_new_project">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-get-started"/>
        <p>
            <b>代码示例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        学习如何使用 Ktor 打开、运行及测试服务器应用程序。
    </link-summary>
    <web-summary>
        开始构建您的第一个 Ktor Server 应用程序。在本教程中，您将学习如何创建、打开及运行新的 Ktor 项目。
    </web-summary>
    <p>
        在本教程中，您将学习如何创建、打开并运行您的第一个 Ktor 服务器项目。一旦运行起来，您就可以完成一系列任务来熟悉 Ktor。
    </p>
    <p>
        这是关于使用 Ktor 构建服务器应用程序入门系列教程的第一部分。您可以独立完成每个教程，但我们强烈建议您按照建议的顺序进行：
    </p>
    <list type="decimal">
        <li>创建、打开并运行新的 Ktor 项目。</li>
        <li><Links href="//server-requests-and-responses" summary="通过构建一个任务管理器应用程序，学习 Ktor 中关于路由、处理请求以及形参的基础知识。">处理请求并生成响应</Links>。</li>
        <li><Links href="//server-create-restful-apis" summary="学习如何使用 Kotlin 和 Ktor 构建后端服务，其中包括一个生成 JSON 文件的 RESTful API 示例。">创建生成 JSON 的 RESTful API</Links>。</li>
        <li><Links href="//server-create-website" summary="学习如何使用 Ktor 和 Thymeleaf 模板构建 Kotlin 网站。">使用 Thymeleaf 模板创建网站</Links>。</li>
        <li><Links href="//server-create-websocket-application" summary="学习如何利用 WebSocket 的力量发送和接收内容。">创建 WebSocket 应用程序</Links>。</li>
        <li><Links href="//server-integrate-database" summary="学习使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。">使用 Exposed 集成数据库</Links>。</li>
    </list>
    <chapter id="create-project" title="创建新的 Ktor 项目">
        <p>
            创建新 Ktor 项目最快的方法之一是 <a href="#create-project-with-the-ktor-project-generator">使用基于 Web 的 Ktor 项目生成器</a>。
        </p>
        <p>
            或者，您也可以 <a href="#create_project_with_intellij">使用专用的 IntelliJ IDEA Ultimate Ktor 插件</a> 或 <a href="#create_project_with_ktor_cli_tool">Ktor CLI 工具</a> 生成项目。
        </p>
        <chapter title="使用 Ktor 项目生成器"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                要使用 Ktor 项目生成器创建新项目，请按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>导航至 <a href="https://start.ktor.io/">Ktor 项目生成器</a>。</p>
                </step>
                <step>
                    <p>在
                        <control>Project artifact</control>
                        字段中，输入
                        <Path>com.example.ktor-sample</Path>
                        作为项目标识的名称。
                        <img src="ktor_343_project_generator_new_project_artifact_name.png"
                             alt="Ktor 项目生成器，项目标识名称为 com.example.ktor-sample"
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
                             alt="Ktor 项目设置的展开视图" border-effect="line" width="706"/>
                    </p>
                    <p>
                        提供以下设置：
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>：
                                选择所需的 <Links href="//server-dependencies" summary="学习如何向现有的 Gradle/Maven 项目中添加 Ktor Server 依赖项。">构建系统</Links>。
                                可以是
                                <emphasis>Gradle Kotlin</emphasis>、
                                <emphasis>Gradle Groovy</emphasis>、
                                <emphasis>Maven</emphasis> 或 <emphasis>Amper</emphasis>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>：
                                选择用于运行服务器的 <Links href="//server-engines" summary="了解处理网络请求的引擎。">引擎</Links>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>：
                                选择是 <Links href="//server-configuration-file" summary="学习如何在配置文件中配置各种服务器参数。">在 YAML 或 HOCON 文件中</Links>，还是 <Links href="//server-configuration-code" summary="学习如何在代码中配置各种服务器参数。">在代码中</Links> 指定服务器参数。
                            </p>
                            <warning>
                                目前基于 Maven 的 Ktor 项目不支持 YAML 配置。
                            </warning>
                        </li>
                    </list>
                    <p>对于本教程，您可以保留这些设置的默认值。</p>
                </step>
                <step>
                    <p>点击
                        <control>Done</control>
                        以保存配置并关闭菜单。
                    </p>
                </step>
                <step>
                    <p>在下方您会发现一组可以添加到项目中的 <Links href="//server-plugins" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links>。插件是提供 Ktor 应用程序常用功能的构建块，例如身份验证、序列化和内容编码、压缩、Cookie 支持等。
                    </p>
                    <p>就本教程而言，您目前不需要添加任何插件。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>Download</control>
                        按钮来生成并下载您的 Ktor 项目。
                        <img src="ktor_343_project_generator_new_project_download.png"
                             alt="Ktor 项目生成器下载按钮"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>下载应会自动开始。</p>
            </procedure>
            <p>现在您已经生成了新项目，请继续 <a href="#unpacking">解压缩并运行您的 Ktor 项目</a>。</p>
        </chapter>
        <chapter title="使用 IntelliJ IDEA Ultimate 的 Ktor 插件" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                本节介绍如何使用 IntelliJ IDEA Ultimate 的 <a
                    href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 插件</a> 进行项目设置。
            </p>
            <p>
                要创建一个新的 Ktor 项目，请 <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">打开 IntelliJ IDEA</a> 并按照以下步骤操作：
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
                        在右侧面板中，您可以指定以下设置：
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
                                <control>Location</control>：为您的项目指定一个目录。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Website</control>：
                                指定用于生成软件包名称的域名。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Artifact</control>：
                                此字段显示生成的项目标识名称。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Engine</control>：
                                选择用于运行服务器的 <Links href="//server-engines" summary="了解处理网络请求的引擎。">引擎</Links>。
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
                        以展开额外设置菜单：
                    </p>
                    <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor 项目高级设置"
                         width="706" border-effect="rounded"/>
                    <p>
                        提供以下设置：
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>Build System</control>：
                                选择所需的 <Links href="//server-dependencies" summary="学习如何向现有的 Gradle/Maven 项目中添加 Ktor Server 依赖项。">构建系统</Links>。
                                可以是
                                <emphasis>Gradle Kotlin</emphasis>、
                                <emphasis>Gradle Groovy</emphasis>、
                                <emphasis>Maven</emphasis> 或 <emphasis>Amper</emphasis>。
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
                                选择是 <Links href="//server-configuration-file" summary="学习如何在配置文件中配置各种服务器参数。">在 YAML 或 HOCON 文件中</Links>，还是 <Links href="//server-configuration-code" summary="学习如何在代码中配置各种服务器参数。">在代码中</Links> 指定服务器参数。
                            </p>
                            <warning>
                                目前基于 Maven 的 Ktor 项目不支持 YAML 配置。
                            </warning>
                        </li>
                    </list>
                    <p>就本教程而言，您可以保留这些设置的默认值。</p>
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
                        在此页面上，您可以选择一组 <Links href="//server-plugins" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links> - 这些构建块提供 Ktor 应用程序的常用功能，例如身份验证、序列化和内容编码、压缩、Cookie 支持等。
                    </p>
                    <p>就本教程而言，您目前不需要添加任何插件。</p>
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
                现在您已经创建了新项目，请继续学习如何 <a href="#open-explore-run">打开、探索并运行</a> 应用程序。
            </p>
        </chapter>
        <chapter title="使用 Ktor CLI 工具" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                本节介绍如何使用 <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 工具</a> 进行项目设置。
            </p>
            <p>
                要创建一个新的 Ktor 项目，请打开您选择的终端并按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    使用以下命令之一安装 Ktor CLI 工具：
                    <Tabs>
                        <TabItem title="macOS/Linux" id="macos-linux">
                            <code-block lang="console" code="                                brew install ktor"/>
                        </TabItem>
                        <TabItem title="Windows" id="windows">
                            <code-block lang="console" code="                                winget install JetBrains.KtorCLI"/>
                        </TabItem>
                    </Tabs>
                </step>
                <step>
                    要以交互模式生成新项目，请使用以下命令：
                    <code-block lang="console" code="                      ktor new"/>
                </step>
                <step>
                    输入
                    <Path>ktor-sample</Path>
                    作为项目名称：
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="以交互模式使用 Ktor CLI 工具"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        （可选）您还可以通过编辑项目名称下方的 <ui-path>Location</ui-path> 路径来更改项目的保存位置。
                    </p>
                </step>
                <step>
                    按
                    <shortcut>Enter</shortcut>
                    继续。
                </step>
                <step>
                    在下一步中，您可以搜索并向项目添加 <Links href="//server-plugins" summary="插件提供常用功能，例如序列化、内容编码、压缩等。">插件</Links>。插件是提供 Ktor 应用程序常用功能的构建块，例如身份验证、序列化和内容编码、压缩、Cookie 支持等。
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="使用 Ktor CLI 工具向项目添加插件"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>就本教程而言，您目前不需要添加任何插件。</p>
                </step>
                <step>
                    按
                    <shortcut>CTRL+G</shortcut>
                    生成项目。
                    <p>
                        或者，您可以通过选择
                        <control>CREATE PROJECT (CTRL+G)</control>
                        并按
                        <shortcut>Enter</shortcut>
                        来生成项目。
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
            <li>您已创建并下载了一个名为
                <Path>ktor-sample</Path>
                的 Gradle 项目。
            </li>
            <li>该项目位于主目录中名为
                <Path>myprojects</Path>
                的文件夹内。
            </li>
        </list>
        <p>如有必要，请更改名称和路径以匹配您自己的设置。</p>
        <p>打开您选择的命令行工具并按照以下步骤操作：</p>
        <procedure>
            <step>
                <p>在终端窗口中，导航到您下载项目的文件夹：</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>将 ZIP 存档解压缩到同名文件夹中：</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                    </TabItem>
                    <TabItem title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                    </TabItem>
                </Tabs>
                <p>您的目录现在将包含 ZIP 存档和解压后的文件夹。</p>
            </step>
            <step>
                <p>从该目录进入新创建的文件夹：</p>
                <code-block lang="console" code="                    cd ktor-sample"/>
            </step>
            <step>
                <p>在 macOS 和 UNIX 系统上，您必须使 Gradle 辅助脚本具有可执行权限，以便系统将其识别为可运行命令。为此，请使用 <code>chmod</code> 命令：</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            chmod +x ./gradlew"/>
                    </TabItem>
                </Tabs>
            </step>
            <step>
                <p>要构建项目，请使用以下命令：</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew build"/>
                    </TabItem>
                    <TabItem title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew build"/>
                    </TabItem>
                </Tabs>
                <p>构建成功后，继续执行下一步以运行项目。</p>
            </step>
            <step>
                <p>要运行项目，请使用以下命令：</p>
                <Tabs>
                    <TabItem title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew run"/>
                    </TabItem>
                    <TabItem title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew run"/>
                    </TabItem>
                </Tabs>
            </step>
            <step>
                <p>要验证项目是否正在运行，请在浏览器中打开终端输出显示的 URL（<a
                        href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）。
                    您应该在浏览器中看到显示的消息 "Hello World!"：</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="生成的 Ktor 项目输出"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>恭喜！您已成功启动了 Ktor 项目。</p>
        <note>
            请注意，命令行将无响应，因为底层进程正忙于运行 Ktor 应用程序。您可以按
            <shortcut>CTRL+C</shortcut>
            来终止应用程序。
        </note>
    </chapter>
    <chapter title="在 IntelliJ IDEA 中打开、探索并运行您的 Ktor 项目" id="open-explore-run">
        <chapter title="打开项目" id="open">
            <p>如果您安装了 <a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>，可以轻松地从命令行打开项目。
            </p>
            <p>
                确保您位于项目文件夹中，然后输入 <code>idea</code> 命令，后跟一个点（代表当前文件夹）：
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                或者，要手动打开项目，请启动 IntelliJ IDEA。
            </p>
            <p>
                如果显示欢迎屏幕，请点击
                <control>Open</control>。否则，前往主菜单中的
                <ui-path>File | Open</ui-path>
                并选择
                <Path>ktor-sample</Path>
                文件夹以将其打开。
            </p>
            <tip>
                有关管理项目的更多详细信息，请参阅 <a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA 文档</a>。
            </tip>
        </chapter>
        <chapter title="探索项目" id="explore">
            <p>打开项目后，您可以看到以下结构：</p>
            <img src="tutorial_server_get_started_idea_project_view.png" alt="IDE 中生成的 Ktor 项目视图" width="706"/>
            <p>
                要查看完整布局，请点击每个文件夹旁边的展开箭头，展开 <control>Project</control> 视图中的文件夹。
            </p>
            <p>
                应用程序源代码位于
                <Path>src/main/kotlin</Path>
                目录下。默认创建了两个文件，分别名为
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
                文件夹内。
            </p>
            <img src="tutorial_server_get_started_idea_resources_folder.png" alt="Ktor 项目 resources 文件夹结构"
                 width="400"/>
        </chapter>
        <chapter title="运行项目" id="run">
            <procedure>
                <p>要在 IntelliJ IDEA 内部运行项目：</p>
                <step>
                    <p>点击右侧侧边栏上的 Gradle 图标（<img alt="IntelliJ IDEA gradle 图标"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>）打开 <a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 工具窗口</a>。</p>
                </step>
                <step>
                    <p>在此工具窗口中，导航到
                        <ui-path>Tasks | application</ui-path>
                        并双击
                        <control>run</control>
                        任务。
                    </p>
                    <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA 中的 Gradle 选项卡"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>您的 Ktor 应用程序将在 IDE 底部的 <a
                            href="https://www.jetbrains.com/help/idea/run-tool-window.html">Run 工具窗口</a> 中启动：</p>
                    <img src="tutorial_server_get_started_idea_run_terminal.png" alt="在终端中运行的项目" width="706"/>
                    <p>之前在命令行上显示的相同消息现在将在
                        <ui-path>Run</ui-path>
                        工具窗口中可见。
                    </p>
                </step>
                <step>
                    <p>要确认项目正在运行，请在浏览器中打开指定的 URL
                        （<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）。</p>
                    <p>您应该会再次看到屏幕上显示消息 "Hello World!"：</p>
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
                                                                             alt="IntelliJ IDEA 终止图标"/>。
                </li>
                <li>
                    要重新启动进程，请点击重新运行按钮 <img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="IntelliJ IDEA 重新运行图标"/>。
                </li>
            </list>
            <p>
                这些选项在 <a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA Run 工具窗口文档</a> 中有进一步解释。
            </p>
        </chapter>
    </chapter>
    <chapter title="尝试其他任务" id="additional-tasks">
        <p>以下是您可能希望尝试的一些其他任务：</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">更改默认端口</a></li>
            <li><a href="#add-a-new-http-endpoint">添加新的 HTTP 端点</a></li>
            <li><a href="#configure-static-content">配置静态内容</a></li>
            <li><a href="#write-an-integration-test">编写集成测试</a></li>
            <li><a href="#register-error-handlers">注册错误处理程序</a></li>
        </list>
        <p>
            这些任务彼此不依赖，但复杂程度逐渐增加。按声明的顺序尝试它们是递进学习最简单的方法。为简单起见并避免重复，下面的描述假设您按顺序尝试任务。
        </p>
        <p>
            在需要编码的地方，我们指定了代码和相应的导入。IDE 可能会为您自动添加这些导入。
        </p>
        <chapter title="更改默认端口" id="change-the-default-port">
            <chapter title="在配置文件中更改端口" id="change-the-port-in-config">
                <p>
                    如果您选择将配置存储在外部的 YAML 或 HOCON 文件中，请在
                    <ui-path>Project</ui-path>
                    视图中导航到
                    <Path>src/main/resources</Path>
                    文件夹并按照以下步骤操作：
                </p>
                <procedure id="change-default-port-yaml-procedure">
                    <step>
                        打开您的配置文件（
                        <Path>application.yaml</Path>
                        或
                        <Path>application.conf</Path>
                        ）。它应该如下所示：
                        <Tabs>
                            <TabItem title="application.yaml (YAML)" group-key="yaml">
                                <code-block lang="yaml" code="ktor:&#10;  deployment:&#10;    port: 8080&#10;  application:&#10;    modules:&#10;      - com.example.RoutingKt.configureRouting"/>
                            </TabItem>
                            <TabItem title="application.conf (HOCON)" group-key="hocon">
                                <code-block lang="generic" code="ktor {&#10;  deployment {&#10;    port = 8080&#10;    port = ${?PORT}&#10;  }&#10;  application {&#10;    modules = [&#10;      com.example.RoutingKt.configureRouting&#10;    ]&#10;  }&#10;}"/>
                            </TabItem>
                        </Tabs>
                    </step>
                    <step>
                        将文件中的 <code>port</code> 值更改为您选择的另一个数字，例如
                        <code>9292</code>。
                    </step>
                    <step>
                        <p>点击重新运行按钮（<img alt="IntelliJ IDEA 重新运行按钮图标"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                    </step>
                    <step>
                        <p>要验证您的应用程序是否在新端口号下运行，您可以在浏览器中打开新 URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）或 <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中创建一个新的 HTTP Request 文件</a>：</p>
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
                    如果您选择了在代码中存储配置的选项，请在
                    <ui-path>Project</ui-path>
                    视图中导航到
                    <Path>src/main/kotlin</Path>
                    文件夹并按照以下步骤操作：
                </p>
                <procedure id="change-the-default-port-code-procedure">
                    <step>
                        <p>打开
                            <Path>main.kt</Path>
                            文件。您应该会发现类似以下内容的代码：
                        </p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>在 <code>embeddedServer()</code> 函数中，将 <code>port</code> 形参更改为您选择的另一个数字，例如 <code>9292</code>。</p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>点击重新运行按钮（<img alt="IntelliJ IDEA 重新运行按钮图标"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                    </step>
                    <step>
                        <p>要验证您的应用程序是否在新端口号下运行，您可以在浏览器中打开新 URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>），或者 <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中创建一个新的 HTTP Request 文件</a>：</p>
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
                文件夹并按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开
                        <Path>Routing.kt</Path>
                        文件。您应该看到以下代码：
                    </p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>要创建新端点，请按照下文所示插入额外的路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <note>请注意，您可以根据需要将 <code>/test1</code> URL 更改为任何您喜欢的名称。</note>
                </step>
                <step>
                    <p>IDE 会自动添加 <code>ContentType</code> 的导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
                </step>
                <step>
                    <p>点击重新运行按钮（<img alt="IntelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                </step>
                <step>
                    <p>在浏览器中请求新的 URL（<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>）。端口号取决于您是否完成了 <a href="#change-the-default-port">更改默认端口</a> 任务。您应该看到如下所示的输出：</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="显示 Hello from Ktor 的浏览器屏幕" width="706"/>
                    <p>如果您创建了 HTTP 请求文件，也可以在其中验证新端点：</p>
                    <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                    <note>请注意，需要包含三个井号（<code>###</code>）的一行来分隔不同的请求。</note>
                </step>
            </procedure>
        </chapter>
        <chapter title="配置静态内容" id="configure-static-content">
            <p>在
                <ui-path>Project</ui-path>
                工具窗口中，导航到
                <Path>src/main/kotlin</Path>
                文件夹并按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开 <Path>Routing.kt</Path> 文件并在路由部分添加以下路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                    <p>这一行的含义如下：</p>
                    <list type="bullet">
                        <li>调用 <code>staticResources()</code> 使您的应用程序能够提供标准网站内容，例如 HTML 和 JavaScript 文件。虽然这些内容可以在浏览器中执行，但从服务器的角度来看，它们被认为是静态的。
                        </li>
                        <li>URL <code>/content</code> 指定了用于获取此路径的路径。
                        </li>
                        <li>路径 <code>mycontent</code> 是静态内容所在的文件夹名称。Ktor 将在 <code>resources</code> 目录中查找此文件夹。
                        </li>
                    </list>
                </step>
                <step>
                    <p>如果 IDE 没有自动添加，请添加以下导入。</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
                </step>
                <step>
                    <p>在
                        <control>Project</control>
                        工具窗口中，右键点击 <Path>src/main/resources</Path> 文件夹并选择
                        <control>New | Directory</control>。
                    </p>
                    <p>或者，选择 <Path>src/main/resources</Path> 文件夹，按
                        <shortcut>⌘Cmd+N</shortcut> (macOS) 或 <shortcut>Ctrl+N</shortcut> (Windows/Linux) 并点击
                        <control>Directory</control>。
                    </p>
                </step>
                <step>
                    <p>将新目录命名为 <code>mycontent</code> 并按
                        <shortcut>↩Enter</shortcut>。
                    </p>
                </step>
                <step>
                    <p>右键点击新创建的文件夹并点击
                        <control>New | File</control>。
                    </p>
                </step>
                <step>
                    <p>将新文件命名为 <Path>sample.html</Path> 并按
                        <shortcut>↩Enter</shortcut>。
                    </p>
                </step>
                <step>
                    <p>在新创建的文件中填充有效的 HTML，例如：</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>点击重新运行按钮（<img alt="IntelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>
                </step>
                <step>
                    <p>当您在浏览器中打开 <a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a> 时，应显示示例页面的内容：</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="浏览器中静态页面的输出" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="编写集成测试" id="write-an-integration-test">
            <p>
                Ktor 支持 <Links href="//server-testing" summary="了解如何使用特殊的测试引擎测试服务器应用程序。">创建集成测试</Links>，并且您生成的项目中已捆绑了此功能。
            </p>
            <p>要利用此功能，请按照以下步骤操作：</p>
            <procedure>
                <step>
                    <p>
                        导航至
                        <Path>src/test/kotlin</Path>
                        文件夹。
                    </p>
                </step>
                <step>
                    <p>打开 <Path>ServerTest.kt</Path> 文件。您应该看到以下代码：</p>
                    <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // loads default configuration&#10;        configure()&#10;        // verify server root returns 200&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                    <p><code>testApplication()</code> 函数创建一个新的 Ktor 实例。该实例运行在测试环境中，而不是像 Netty 这样的服务器中。</p>
                    <p>然后您可以使用 <code>configure()</code> 函数来调用与 <code>embeddedServer()</code> 中调用的相同的设置。</p>
                    <p>最后，您可以使用内置的 <code>client</code> 对象和 JUnit 断言来发送示例请求并检查响应。</p>
                </step>
            </procedure>
            <p>
                您可以使用在 IntelliJ IDEA 中执行测试的任何标准方式运行测试。请注意，因为您正在运行一个新的 Ktor 实例，所以测试的成功或失败并不取决于您的应用程序是否正在 <code>0.0.0.0</code> 运行。
            </p>
            <p>
                如果您已成功完成了 <a href="#add-a-new-http-endpoint">添加新的 HTTP 端点</a>，请添加此额外测试：
            </p>
            <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
            <p>添加以下额外的导入：</p>
            <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
        </chapter>
        <chapter title="注册错误处理程序" id="register-error-handlers">
            <p>
                您可以使用 <Links href="//server-status-pages" summary="StatusPages 允许 Ktor 应用程序根据抛出的异常或状态码适当地响应任何失败状态。">StatusPages 插件</Links> 在 Ktor 应用程序中处理错误。
            </p>
            <tip>
                默认情况下，您的项目中不包含此插件。您可以在使用 Ktor 项目生成器或 IntelliJ IDEA 中的项目向导创建项目时，通过 <ui-path>Plugins</ui-path> 部分将其添加到您的项目中。
            </tip>
            <p>
                在接下来的步骤中，您将学习如何手动添加和配置该插件。实现此目标共有四个步骤：
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">在 Gradle 构建文件中添加新依赖项。</a></li>
                <li><a href="#install-plugin-and-specify-handler">安装插件并指定异常处理程序。</a></li>
                <li><a href="#write-sample-code">编写示例代码来触发处理程序。</a></li>
                <li><a href="#restart-and-invoke">重新启动并调用示例代码。</a></li>
            </list>
            <procedure title="添加新依赖项" id="add-dependency">
                <p>在
                    <control>Project</control>
                    工具窗口中，导航到项目根文件夹并按照以下步骤操作：
                </p>
                <step>
                    <p>打开 <Path>build.gradle.kts</Path> 文件并按下文所示添加新依赖项：</p>
                    <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // 添加新依赖项&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
                </step>
                <step>
                    <p>通过按
                        <shortcut>Shift+⌘Cmd+I</shortcut> (macOS) 或
                        <shortcut>Ctrl+Shift+O</shortcut> (Windows/Linux) 重新加载项目。
                    </p>
                </step>
            </procedure>
            <procedure title="安装插件并指定异常处理程序"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p>导航到 <Path>Routing.kt</Path> 中的 <code>.configureRouting()</code> 方法并添加以下代码行：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                    <p>这些行安装了 <code>StatusPages</code> 插件，并指定了当抛出 <code>IllegalStateException</code> 类型的异常时应采取的操作。</p>
                </step>
                <step>
                    <p>添加以下导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
                </step>
            </procedure>
            <p>
                请注意，响应中通常会设置 HTTP 错误码，但出于本任务的目的，输出直接显示在浏览器中。
            </p>
            <procedure title="编写示例代码来触发处理程序" id="write-sample-code">
                <step>
                    <p>继续在 <code>.configureRouting()</code> 方法中，按下文所示添加额外的路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>您现在已添加了一个 URL 为 <code>/error-test</code> 的端点。当触发此端点时，将抛出处理程序中使用的类型的异常。</p>
                </step>
            </procedure>
            <procedure title="重新启动并调用示例代码" id="restart-and-invoke">
                <step>
                    <p>点击重新运行按钮（<img alt="IntelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p></step>
                <step>
                    <p>在浏览器中，导航至 URL <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a>。您应该看到如下所示的错误消息：</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="显示消息 `App in illegal state as Too Busy` 的浏览器屏幕" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="下一步" id="next_steps">
        <p>
            如果您已经完成了上述附加任务，那么您现在已经掌握了如何配置 Ktor 服务器、集成 Ktor 插件以及实现新路由。然而，这仅仅是个开始。要更深入地了解 Ktor 的基础概念，请继续学习本指南中的下一个教程。
        </p>
        <p>
            接下来，您将学习如何 <Links href="//server-requests-and-responses" summary="通过构建一个任务管理器应用程序，学习 Ktor 中关于路由、处理请求以及形参的基础知识。">通过创建一个任务管理器应用程序来处理请求并生成响应</Links>。
        </p>
    </chapter>
</topic>