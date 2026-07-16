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
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
</tldr>
<link-summary>
        了解如何使用 Ktor 打开、运行和测试服务器应用程序。
</link-summary>
<web-summary>
        开始构建您的第一个 Ktor 服务器应用程序。本教程将引导您创建、打开并运行新的 Ktor 项目。
</web-summary>
<p>
        在本教程中，您将学习如何创建、打开并运行
        您的第一个 Ktor 服务器项目。一旦项目成功运行，您可以尝试一系列任务来熟悉
        Ktor。
</p>
<p>
        这是 Ktor 服务器应用程序系列教程的第一部分，旨在帮助您入门。您可以独立完成每个教程，
        但我们强烈建议您按照建议的顺序进行学习：
</p>
<list type="decimal">
        <li>创建、打开并运行新的 Ktor 项目。</li>
        <li><Links href="/ktor/server-requests-and-responses" summary="通过构建任务管理器应用程序，了解如何使用 Ktor 在 Kotlin 中进行路由、处理请求和参数的基础知识。">处理请求并生成响应</Links>。</li>
        <li><Links href="/ktor/server-create-restful-apis" summary="了解如何使用 Kotlin 和 Ktor 构建后端服务，其中包括一个生成 JSON 文件的 RESTful API 示例。">创建生成 JSON 的 RESTful API</Links>。</li>
        <li><Links href="/ktor/server-create-website" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 模板构建网站。">使用 Thymeleaf 模板创建网站</Links>。</li>
        <li><Links href="/ktor/server-create-websocket-application" summary="了解如何利用 WebSocket 的强大功能发送和接收内容。">创建 WebSocket 应用程序</Links>。</li>
        <li><Links href="/ktor/server-integrate-database" summary="了解使用 Exposed SQL 库将 Ktor 服务连接到数据库版本库的过程。">使用 Exposed 集成数据库</Links>。</li>
</list>
<chapter id="create-project" title="创建新的 Ktor 项目">
        <p>
            创建新的 Ktor 项目最快的方法之一是<a href="#create-project-with-the-ktor-project-generator">使用
            基于 Web 的 Ktor 项目生成器</a>。
        </p>
        <p>
            或者，您也可以
            <a href="#create_project_with_intellij">使用 IntelliJ IDEA Ultimate 专用的 Ktor 插件</a>
            或
            <a href="#create_project_with_ktor_cli_tool">Ktor CLI 工具</a>
            来生成项目。
        </p>
        <chapter title="使用 Ktor 项目生成器"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                要使用 Ktor 项目生成器创建新项目，请按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>导航到 <a href="https://start.ktor.io/">Ktor 项目生成器</a>。</p>
                </step>
                <step>
                    <p>在
                        <control>项目构件</control>
                        字段中，输入
                        <Path>com.example.ktor-sample-app</Path>
                        作为您的项目构件名称。
                        <img src="ktor_project_generator_new_project_artifact_name.png"
                             alt="带项目构件名称 org.example.ktor-sample-app 的 Ktor 项目生成器"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>点击
                        <control>配置</control>
                        以打开设置下拉菜单：
                        <img src="ktor_project_generator_new_project_configure.png"
                             style="block"
                             alt="Ktor 项目设置的展开视图" border-effect="line" width="706"/>
                    </p>
                    <p>
                        可用的设置如下：
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>构建系统</control>
                                ：
                                选择所需的 <Links href="/ktor/server-dependencies" summary="了解如何将 Ktor Server 依赖项添加到现有 Gradle/Maven 项目。">构建系统</Links>。
                                可以是使用
                                <emphasis>Kotlin</emphasis>
                                或 Groovy DSL 的
                                <emphasis>Gradle</emphasis>
                                ，或者
                                <emphasis>Maven</emphasis>
                                。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor 版本</control>
                                ：
                                选择所需的 Ktor 版本。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>引擎</control>
                                ：
                                选择用于运行服务器的 <Links href="/ktor/server-engines" summary="了解处理网络请求的引擎。">引擎</Links>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>配置</control>
                                ：
                                选择是在 <Links href="/ktor/server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">YAML 或 HOCON 文件中</Links>，还是
                                <Links href="/ktor/server-configuration-code" summary="了解如何在代码中配置各种服务器参数。">在代码中</Links>指定服务器参数。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>包含示例</control>
                                ：
                                勾选此选项以添加插件的示例代码。
                            </p>
                        </li>
                    </list>
                    <p>对于本教程，您可以保留这些设置的默认值。</p>
                </step>
                <step>
                    <p>点击
                        <control>完成</control>
                        以保存配置并关闭菜单。
                    </p>
                </step>
                <step>
                    <p>下方您会看到一组可以添加到项目中
                        的<Links href="/ktor/server-plugins" summary="插件提供常见功能，例如序列化、内容编码、压缩等。">插件</Links>。插件是 Ktor 应用程序中提供常见功能的构建块，
                        例如身份验证、序列化和内容编码、压缩、Cookie 支持等等。
                    </p>
                    <p>为了本教程的目的，您在此阶段无需添加任何插件。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>下载</control>
                        按钮生成并下载您的 Ktor 项目。
                        <img src="ktor_project_generator_new_project_download.png"
                             alt="Ktor 项目生成器下载按钮"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>您的下载应自动开始。</p>
            </procedure>
            <p>现在您已经生成了新项目，请继续<a href="#unpacking">解压并运行您的 Ktor
                项目</a>。</p>
        </chapter>
        <chapter title="使用 IntelliJ IDEA Ultimate 的 Ktor 插件" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                本节介绍如何使用 Intellij IDEA Ultimate 的 <a
                    href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 插件</a>进行项目设置。
            </p>
            <p>
                要创建新的 Ktor 项目，
                <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">打开 IntelliJ IDEA</a>，然后
                按照以下步骤操作：
            </p>
            <procedure>
                <step>
                    <p>
                        在欢迎屏幕上，点击<control>新建项目</control>。
                    </p>
                    <p>
                        或者，从主菜单中选择 <ui-path>文件 | 新建 | 项目</ui-path>。
                    </p>
                </step>
                <step>
                    <p>
                        在
                        <control>新建项目</control>
                        向导中，从左侧列表中选择
                        <control>Ktor</control>
                        。
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
                                <control>名称</control>
                                ：
                                指定项目名称。输入
                                <Path>ktor-sample-app</Path>
                                作为您的项目名称。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>位置</control>
                                ：
                                指定项目目录。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>网站</control>
                                ：
                                指定用于生成包名的域。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>构件</control>
                                ：
                                此字段显示生成的构件名称。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>引擎</control>
                                ：
                                选择用于运行服务器的 <Links href="/ktor/server-engines" summary="了解处理网络请求的引擎。">引擎</Links>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>包含示例</control>
                                ：
                                勾选此选项以添加插件的示例代码。
                            </p>
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        点击
                        <control>高级设置</control>
                        以展开
                        附加设置菜单：
                    </p>
                    <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor 项目高级设置"
                         width="706" border-effect="rounded"/>
                    <p>
                        可用的设置如下：
                    </p>
                    <list>
                        <li>
                            <p>
                                <control>构建系统</control>
                                ：
                                选择所需的 <Links href="/ktor/server-dependencies" summary="了解如何将 Ktor Server 依赖项添加到现有 Gradle/Maven 项目。">构建系统</Links>。
                                可以是使用
                                <emphasis>Kotlin</emphasis>
                                或 Groovy DSL 的
                                <emphasis>Gradle</emphasis>
                                ，或者
                                <emphasis>Maven</emphasis>
                                。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Ktor 版本</control>
                                ：
                                选择所需的 Ktor 版本。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>配置</control>
                                ：
                                选择是在 <Links href="/ktor/server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">YAML 或 HOCON 文件中</Links>，还是
                                <Links href="/ktor/server-configuration-code" summary="了解如何在代码中配置各种服务器参数。">在代码中</Links>指定服务器参数。
                            </p>
                        </li>
                    </list>
                    <p>为了本教程的目的，您可以保留这些设置的默认值。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>下一步</control>
                        进入下一页。
                    </p>
                    <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor 插件" width="706"
                         border-effect="rounded"/>
                    <p>
                        在此页面上，您可以选择一组<Links href="/ktor/server-plugins" summary="插件提供常见功能，例如序列化、内容编码、压缩等。">插件</Links>——它们是提供 Ktor 应用程序常见功能的构建块，例如
                        身份验证、序列化和内容编码、压缩、Cookie 支持等等。
                    </p>
                    <p>为了本教程的目的，您在此阶段无需添加任何插件。</p>
                </step>
                <step>
                    <p>
                        点击
                        <control>创建</control>
                        并等待 IntelliJ IDEA 生成项目并
                        安装依赖项。
                    </p>
                </step>
            </procedure>
            <p>
                现在您已经创建了新项目，请继续学习如何<a href="#open-explore-run">打开、
                探索并运行</a>
                该应用程序。
            </p>
        </chapter>
        <chapter title="使用 Ktor CLI 工具" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                本节介绍如何使用
                <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 工具</a>进行项目设置。
            </p>
            <p>
                要创建新的 Ktor 项目，请打开您选择的终端并
                按照以下步骤操作：
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
                    <Path>ktor-sample-app</Path>
                    作为您的项目名称：
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="在交互模式下使用 Ktor CLI 工具"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        （可选）您还可以通过编辑项目名称下方的
                        <ui-path>位置</ui-path>
                        路径来更改项目保存的位置。
                    </p>
                </step>
                <step>
                    按下
                    <shortcut>Enter</shortcut>
                    键继续。
                </step>
                <step>
                    在下一步中，您可以搜索并向项目添加<Links href="/ktor/server-plugins" summary="插件提供常见功能，例如序列化、内容编码、压缩等。">插件</Links>。插件是 Ktor 应用程序中提供常见功能的构建块，
                    例如身份验证、序列化和内容编码、压缩、Cookie 支持等等。
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="使用 Ktor CLI 工具向项目添加插件"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>为了本教程的目的，您在此阶段无需添加任何插件。</p>
                </step>
                <step>
                    按下
                    <shortcut>CTRL+G</shortcut>
                    生成项目。
                    <p>
                        或者，您可以通过选择
                        <control>创建项目 (CTRL+G)</control>
                        并按下
                        <shortcut>Enter</shortcut>
                        键来生成项目。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="解压并运行您的 Ktor 项目" id="unpacking">
        <p>
            本节将介绍如何从命令行解压、构建和运行项目。以下
            说明假设：
        </p>
        <list type="bullet">
            <li>您已创建并下载了一个名为
                <Path>ktor-sample-app</Path>
                的项目。
            </li>
            <li>该项目已放置在您的主目录中名为
                <Path>myprojects</Path>
                的文件夹下。
            </li>
        </list>
        <p>如有必要，请修改名称和路径以匹配您自己的设置。</p>
        <p>打开您选择的命令行工具并按照步骤操作：</p>
        <procedure>
            <step>
                <p>在终端中，导航到您下载项目的文件夹：</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>将 ZIP 压缩包解压到同名文件夹中：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample-app.zip -d ktor-sample-app"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample-app.zip"/>
                    </tab>
                </tabs>
                <p>您的目录现在将包含 ZIP 压缩包和解压后的文件夹。</p>
            </step>
            <step>
                <p>从当前目录进入新创建的文件夹：</p>
                <code-block lang="console" code="                    cd ktor-sample-app"/>
            </step>
            <step>
                <p>在 macOS/UNIX 系统上，您需要使 `gradlew` Gradle 辅助脚本可执行。为此，
                    请使用 `chmod` 命令：</p>
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
                <p>如果您看到构建成功，则可以再次通过 Gradle 执行项目。</p>
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
                <p>要验证项目是否正在运行，请在输出中提到的 URL ([http://0.0.0.0:8080](http://0.0.0.0:8080)) 打开浏览器。
                    您应该会在屏幕上看到“Hello World!”消息：</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="生成的 Ktor 项目输出"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>恭喜！您已成功启动 Ktor 项目。</p>
        <p>请注意，命令行将无响应，因为底层进程正在忙于运行 Ktor
            应用程序。您可以
            按下
            <shortcut>CTRL+C</shortcut>
            来终止应用程序。
        </p>
    </chapter>
    <chapter title="在 IntelliJ IDEA 中打开、探索并运行您的 Ktor 项目" id="open-explore-run">
        <chapter title="打开项目" id="open">
            <p>如果您的计算机上安装了 <a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>，您可以轻松地从命令行
                打开项目。
            </p>
            <p>
                请确保您位于项目文件夹中，然后键入 `idea` 命令，后跟一个句点表示当前
                文件夹：
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                或者，您也可以手动启动 IntelliJ IDEA 来打开项目。
            </p>
            <p>
                如果欢迎屏幕打开，点击
                <control>打开</control>
                。否则，请从主菜单中选择
                <ui-path>文件 | 打开</ui-path>
                ，然后选择
                <Path>ktor-sample-app</Path>
                文件夹打开它。
            </p>
            <tip>
                有关管理项目的更多详细信息，
                请参见 <a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA
                文档</a>。
            </tip>
        </chapter>
        <chapter title="探索项目" id="explore">
            <p>无论您选择哪种方式，项目都应如下图所示打开：</p>
            <img src="server_get_started_idea_project_view.png" alt="IDE 中生成的 Ktor 项目视图" width="706"/>
            <p>
                为了解释项目布局，我们已在
                <control>项目</control>
                视图中展开了结构并选中了
                <Path>settings-gradle.kts</Path>
                文件。
            </p>
            <p>
                您会看到运行应用程序的代码位于
                <Path>src/main/kotlin</Path>
                下的包中。默认包名为
                <Path>com.example</Path>
                ，其中包含一个名为
                <Path>plugins</Path>
                的子包。
                这两个包中创建了两个文件，分别命名为
                <Path>Application.kt</Path>
                和
                <Path>Routing.kt</Path>
            </p>
            <img src="server_get_started_idea_main_folder.png" alt="Ktor 项目 src 文件夹结构" width="400"/>
            <p>项目名称在
                <Path>settings-gradle.kts</Path>
                中配置。
            </p>
            <img src="server_get_started_idea_settings_file.png" alt="settings.gradle.kt 的内容" width="706"/>
            <p>
                配置文件和其他类型的内容位于
                <Path>src/main/resources</Path>
                文件夹中。
            </p>
            <img src="server_get_started_idea_resources_folder.png" alt="Ktor 项目 resources 文件夹结构"
                 width="400"/>
            <p>
                一个骨架测试已在
                <Path>src/test/kotlin</Path>
                下的包中创建。
            </p>
            <img src="server_get_started_idea_test_folder.png" alt="Ktor 项目 test 文件夹结构" width="400"/>
        </chapter>
        <chapter title="运行项目" id="run">
            <procedure>
                <p>要在 IntelliJ IDEA 中运行项目：</p>
                <step>
                    <p>通过点击右侧边栏上的 Gradle 图标 (<img alt="intelliJ IDEA Gradle 图标"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        打开 <a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 工具
                        窗口</a>。</p>
                    <img src="server_get_started_idea_gradle_tab.png" alt="IntelliJ IDEA 中的 Gradle 选项卡"
                         border-effect="line" width="706"/>
                </step>
                <step>
                    <p>在此工具窗口中，导航到
                        <ui-path>任务 | application</ui-path>
                        并双击
                        <control>run</control>
                        任务。
                    </p>
                    <img src="server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA 中的 Gradle 选项卡"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>您的 Ktor 应用程序将在 IDE 底部的 <a
                            href="https://www.jetbrains.com/help/idea/run-tool-window.html">运行工具窗口</a>中启动：</p>
                    <img src="server_get_started_idea_run_terminal.png" alt="项目正在终端中运行" width="706"/>
                    <p>之前在命令行中显示的消息现在将显示在
                        <ui-path>运行</ui-path>
                        工具窗口中。
                    </p>
                </step>
                <step>
                    <p>要确认项目正在运行，请在指定 URL
                        ([http://0.0.0.0:8080](http://0.0.0.0:8080)) 处打开您的浏览器。</p>
                    <p>您应该会再次看到屏幕上显示“Hello World!”消息：</p>
                    <img src="server_get_started_ktor_sample_app_output.png" alt="浏览器屏幕中的 Hello World"
                         width="706"/>
                </step>
            </procedure>
            <p>
                您可以通过
                <ui-path>运行</ui-path>
                工具窗口管理应用程序。
            </p>
            <list type="bullet">
                <li>
                    要终止应用程序，请点击停止按钮 <img src="intellij_idea_terminate_icon.svg"
                                                                             style="inline" height="16" width="16"
                                                                             alt="intelliJ IDEA 终止图标"/>
                </li>
                <li>
                    要重新启动进程，请点击重新运行按钮 <img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="intelliJ IDEA 重新运行图标"/>
                </li>
            </list>
            <p>
                这些选项在 <a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA 运行
                工具窗口文档</a>中有进一步解释。
            </p>
        </chapter>
    </chapter>
    <chapter title="可尝试的附加任务" id="additional-tasks">
        <p>以下是一些您可能希望尝试的附加任务：</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">更改默认端口。</a></li>
            <li><a href="#change-the-port-via-yaml">通过 YAML 更改端口。</a></li>
            <li><a href="#add-a-new-http-endpoint">添加新的 HTTP 端点。</a></li>
            <li><a href="#configure-static-content">配置静态内容。</a></li>
            <li><a href="#write-an-integration-test">编写集成测试。</a></li>
            <li><a href="#register-error-handlers">注册错误处理器。</a></li>
        </list>
        <p>
            这些任务彼此独立，但复杂性逐渐增加。按照声明的顺序尝试它们是
            逐步学习的最简单方法。为简单起见，并避免重复，以下说明
            假设您按顺序尝试这些任务。
        </p>
        <p>
            需要编码的地方，我们已同时指定了代码和相应的导入。IDE 可能会为您
            自动添加这些导入。
        </p>
        <chapter title="更改默认端口" id="change-the-default-port">
            <p>
                在<ui-path>项目</ui-path>
                视图中，导航到
                <Path>src/main/kotlin</Path>
                文件夹，然后进入为您创建的单个包并按照步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开
                        <Path>Application.kt</Path>
                        文件。您应该会找到类似以下的代码：
                    </p>
                    <code-block lang="kotlin" code="                        fun main() {&#10;                            embeddedServer(&#10;                                Netty,&#10;                                port = 8080, // This is the port on which Ktor is listening&#10;                                host = &quot;0.0.0.0&quot;,&#10;                                module = Application::module&#10;                            ).start(wait = true)&#10;                        }&#10;&#10;                        fun Application.module() {&#10;                            configureRouting()&#10;                        }"/>
                </step>
                <step>
                    <p>在 `embeddedServer()` 函数中，将 `port` 形参
                        更改为您选择的另一个数字，例如“9292”。</p>
                    <code-block lang="kotlin" code="                        fun main() {&#10;                            embeddedServer(&#10;                                Netty,&#10;                                port = 9292,&#10;                                host = &quot;0.0.0.0&quot;,&#10;                                module = Application::module&#10;                            ).start(wait = true)&#10;                        }"/>
                </step>
                <step>
                    <p>点击重新运行按钮 (<img alt="intelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        以重新启动应用程序。</p>
                </step>
                <step>
                    <p>要验证您的应用程序是否正在新的端口号下运行，您可以在新 URL
                        ([http://0.0.0.0:9292](http://0.0.0.0:9292)) 打开浏览器，或者
                        <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中创建
                            新的 HTTP 请求文件</a>：</p>
                    <img src="server_get_started_port_change.png"
                         alt="在 IntelliJ IDEA 中使用 HTTP 请求文件测试端口更改" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="通过 YAML 更改端口" id="change-the-port-via-yaml">
            <p>
                创建新的 Ktor 项目时，您可以选择将配置外部存储在 YAML 或
                HOCON 文件中：
            </p>
            <img src="ktor_project_generator_configuration_options.png" width="400"
                 alt="Ktor 项目生成器配置选项"/>
            <p>
                如果您选择将配置外部存储，那么 `Application.kt` 中的代码将是这样：
            </p>
            <code-block lang="kotlin" code="                fun main(args: Array&lt;String&gt;): Unit =&#10;                    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;                @Suppress(&quot;unused&quot;)&#10;                fun Application.module() {&#10;                    configureRouting()&#10;                }"/>
            <p>
                这些值将存储在
                <Path>src/main/resources/</Path>
                目录中的配置文件中：
            </p>
            <tabs>
                <tab title="application.yaml (YAML)" group-key="yaml">
                    <code-block lang="yaml" code="                        ktor:&#10;                            application:&#10;                                modules:&#10;                                    - com.example.ApplicationKt.module&#10;                            deployment:&#10;                                port: 8080"/>
                </tab>
                <tab title="application.conf (HOCON)" group-key="hocon">
                    <code-block lang="json" code="                        ktor {&#10;                            deployment {&#10;                                port = 8080&#10;                                port = ${?PORT}&#10;                            }&#10;                            application {&#10;                                modules = [ com.example.ApplicationKt.module ]&#10;                            }&#10;                        }"/>
                </tab>
            </tabs>
            <p>
                在这种情况下，您无需更改任何代码即可更改端口号。只需修改 YAML 或 HOCON
                文件中的值并重新启动应用程序即可。更改可以通过与上述<a href="#change-the-default-port">默认端口</a>
                相同的方式进行验证。
            </p>
        </chapter>
        <chapter title="添加新的 HTTP 端点" id="add-a-new-http-endpoint">
            <p>接下来，您将创建一个新的 HTTP 端点，它将响应 `GET` 请求。</p>
            <p>
                在<ui-path>项目</ui-path>
                工具窗口中，导航到
                <Path>src/main/kotlin/com/example</Path>
                文件夹并按照步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开
                        <Path>Application.kt</Path>
                        文件并找到 `configureRouting()` 函数。
                    </p>
                </step>
                <step>
                    <p>在 IntelliJ IDEA 中，将光标放在函数名称上并按下
                        <shortcut>⌘Cmd+B</shortcut>
                        即可导航到 `configureRouting()` 函数。
                    </p>
                    <p>或者，您可以通过打开 `Routing.kt` 文件来导航到该函数。</p>
                    <p>您应该会看到以下代码：</p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>要创建新端点，请插入以下所示的额外五行代码：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <p>请注意，您可以将 `/test1` URL 更改为您喜欢的任何内容。</p>
                </step>
                <step>
                    <p>为了使用 `ContentType`，请添加以下导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.*"/>
                </step>
                <step>
                    <p>点击重新运行按钮 (<img alt="intelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        以重新启动应用程序。</p>
                </step>
                <step>
                    <p>在浏览器中请求新 URL ([http://0.0.0.0:9292/test1](http://0.0.0.0:9292/test1))。您应该使用的
                        端口号取决于您是否已尝试第一个任务（<a
                                href="#change-the-default-port">更改默认端口</a>）。您应该会看到以下输出：</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="显示“Hello from Ktor”的浏览器屏幕" width="706"/>
                    <p>如果您已创建 HTTP 请求文件，您也可以在那里验证新端点：</p>
                    <img src="server_get_started_add_new_http_endpoint.png" alt="IntelliJ IDEA 中的 HTTP 请求文件"
                         width="450"/>
                    <p>请注意，需要一行包含三个哈希符号（`###`）来分隔不同的请求。</p>
                </step>
            </procedure>
        </chapter>
        <chapter title="配置静态内容" id="configure-static-content">
            <p>在<ui-path>项目</ui-path>
                工具窗口中，导航到
                <Path>src/main/kotlin/com/example/plugins</Path>
                文件夹并按照步骤操作：
            </p>
            <procedure>
                <step>
                    <p>打开 `Routing.kt` 文件。</p>
                    <p>同样，这应该是默认内容：</p>
                    <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                    <p>对于此任务，您是否已插入“<a href="#add-a-new-http-endpoint">添加新的 HTTP
                            端点</a>”中指定的额外端点内容并不重要。</p>
                </step>
                <step>
                    <p>将以下行添加到路由部分：</p>
                    <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                // 添加下方行&#10;                                staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                    <p>此行的含义如下：</p>
                    <list type="bullet">
                        <li>调用 `staticResources()` 告诉 Ktor，我们希望应用程序能够提供标准的网站内容，例如
                            HTML 和 JavaScript 文件。尽管这些内容可以在浏览器中执行，但从
                            服务器的角度来看，它被认为是静态的。
                        </li>
                        <li>URL `/content` 指定了用于获取此内容的路径。
                        </li>
                        <li>路径 `mycontent` 是静态内容将驻留的文件夹名称。Ktor 会在 `resources` 目录中查找此
                            文件夹。
                        </li>
                    </list>
                </step>
                <step>
                    <p>添加以下导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.*"/>
                </step>
                <step>
                    <p>在
                        <control>项目</control>
                        工具窗口中，右键点击 `src/main/resources` 文件夹并选择
                        <control>新建 | 目录</control>
                        。
                    </p>
                    <p>或者，选择 `src/main/resources` 文件夹，按下
                        <shortcut>⌘Сmd+N</shortcut>
                        ，然后点击
                        <control>目录</control>
                        。
                    </p>
                </step>
                <step>
                    <p>将新目录命名为 `mycontent` 并按下
                        <shortcut>↩Enter</shortcut>
                        键。
                    </p>
                </step>
                <step>
                    <p>右键点击新创建的文件夹并点击
                        <control>新建 | 文件</control>
                        。
                    </p>
                </step>
                <step>
                    <p>将新文件命名为“`sample.html`”并按下
                        <shortcut>↩Enter</shortcut>
                        键。
                    </p>
                </step>
                <step>
                    <p>使用有效的 HTML 内容填充新创建的文件页面，例如：</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;    &lt;ol&gt;&#10;        &lt;li&gt;Ktor&lt;/li&gt;&#10;        &lt;li&gt;Kotlin&lt;/li&gt;&#10;        &lt;li&gt;HTML&lt;/li&gt;&#10;    &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>点击重新运行按钮 (<img alt="intelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        以重新启动应用程序。</p>
                </step>
                <step>
                    <p>当您在 [http://0.0.0.0:9292/content/sample.html](http://0.0.0.0:9292/content/sample.html)
                        打开浏览器时，应该会显示您的示例页面内容：</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="浏览器中静态页面的输出" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="编写集成测试" id="write-an-integration-test">
            <p>
                Ktor 提供了<Links href="/ktor/server-testing" summary="%plugin_name% 允许 Ktor 应用程序根据抛出的异常或状态码适当地响应任何故障状态。">创建集成测试</Links>的支持，并且您生成的项目捆绑了此功能。
            </p>
            <p>要使用此功能，请按照以下步骤操作：</p>
            <procedure>
                <step>
                    <p>
                        在
                        <Path>src</Path>
                        下创建一个名为“`test`”的新目录，并在其下创建一个名为“`kotlin`”的子目录。
                    </p>
                </step>
                <step>
                    <p>在
                        <Path>src/test/kotlin</Path>
                        内部创建一个名为“`com.example`”的新包。
                    </p>
                </step>
                <step>
                    <p>
                        在
                        <Path>src/test/kotlin/com.example</Path>
                        中创建一个名为“`ApplicationTest.kt`”的新文件。
                    </p>
                </step>
                <step>
                    <p>打开 `ApplicationTest.kt` 文件并添加以下代码：</p>
                    <code-block lang="kotlin" code="                        class ApplicationTest {&#10;&#10;                            @Test&#10;                            fun testRoot() = testApplication {&#10;                                application {&#10;                                    module()&#10;                                }&#10;                                val response = client.get(&quot;/&quot;)&#10;&#10;                                assertEquals(HttpStatusCode.OK, response.status)&#10;                                assertEquals(&quot;Hello World!&quot;, response.bodyAsText())&#10;                            }&#10;                        }"/>
                    <p> `testApplication()` 方法创建 Ktor 的新实例。此实例在测试环境中运行，而
                        不是像 Netty 这样的服务器中运行。</p>
                    <p>然后，您可以使用 `application()` 方法来调用与
                        `embeddedServer()` 中调用的相同设置。</p>
                    <p>最后，您可以使用内置的 `client` 对象和 JUnit 断言来发送示例请求并检测响应。</p>
                </step>
                <step>
                    <p>添加以下所需的导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.client.request.*&#10;                        import io.ktor.client.statement.*&#10;                        import io.ktor.http.*&#10;                        import io.ktor.server.testing.*&#10;                        import org.junit.Assert.assertEquals&#10;                        import org.junit.Test"/>
                </step>
            </procedure>
            <p>
                该测试可以通过 IntelliJ IDEA 中执行测试的任何标准方式运行。请注意，由于您正在运行
                Ktor 的新实例，因此测试的成功或失败不取决于您的应用程序是否在
                `0.0.0.0` 上运行。
            </p>
            <p>
                如果您已成功完成<a href="#add-a-new-http-endpoint">添加新的 HTTP 端点</a>任务，
                您应该能够添加此附加测试：
            </p>
            <code-block lang="Kotlin" code="                @Test&#10;                fun testNewEndpoint() = testApplication {&#10;                    application {&#10;                        module()&#10;                    }&#10;&#10;                    val response = client.get(&quot;/test1&quot;)&#10;&#10;                    assertEquals(HttpStatusCode.OK, response.status)&#10;                    assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;                    assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;                }"/>
            <p>需要以下附加导入：</p>
            <code-block lang="Kotlin" code="                import kotlin.test.assertContains"/>
        </chapter>
        <chapter title="注册错误处理器" id="register-error-handlers">
            <p>
                您可以使用 <Links href="/ktor/server-status-pages" summary="%plugin_name% 允许 Ktor 应用程序根据抛出的异常或状态码适当地响应任何故障状态。">StatusPages
                插件</Links>在 Ktor 应用程序中处理错误。
            </p>
            <p>
                此插件默认不包含在您的项目中。您本可以通过 Ktor
                项目生成器中的<ui-path>插件</ui-path>部分或 IntelliJ IDEA 中的项目向导将其添加到您的项目中。由于您已经创建了项目，接下来的步骤
                将教您如何手动添加和配置该插件。
            </p>
            <p>
                实现此目标需要四个步骤：
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">在 Gradle 构建文件中添加新的依赖项。</a></li>
                <li><a href="#install-plugin-and-specify-handler">安装插件并指定异常处理器。</a></li>
                <li><a href="#write-sample-code">编写示例代码以触发处理器。</a></li>
                <li><a href="#restart-and-invoke">重新启动并调用示例代码。</a></li>
            </list>
            <procedure title="添加新的依赖项" id="add-dependency">
                <p>在
                    <control>项目</control>
                    工具窗口中，导航到项目根文件夹并按照步骤操作：
                </p>
                <step>
                    <p>打开 `build.gradle.kts` 文件。</p>
                </step>
                <step>
                    <p>在 `dependencies` 部分添加额外的依赖项，如下所示：</p>
                    <code-block lang="kotlin" code="                        dependencies {&#10;                            // 要添加的新依赖项&#10;                            implementation(&quot;io.ktor:ktor-server-status-pages:$ktor_version&quot;)&#10;                            // 现有依赖项&#10;                            implementation(&quot;io.ktor:ktor-server-core-jvm:$ktor_version&quot;)&#10;                            implementation(&quot;io.ktor:ktor-server-netty-jvm:$ktor_version&quot;)&#10;                            implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                            testImplementation(&quot;io.ktor:ktor-server-test-host-jvm:$ktor_version&quot;)&#10;                            testImplementation(&quot;org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version&quot;)&#10;                        }"/>
                    <p>完成此操作后，您需要重新加载项目以识别此新依赖项。</p>
                </step>
                <step>
                    <p>通过在 macOS 上按下
                        <shortcut>Shift+⌘Cmd+I</shortcut>
                        或在 Windows 上按下
                        <shortcut>Ctrl+Shift+O</shortcut>
                        来重新加载项目。
                    </p>
                </step>
            </procedure>
            <procedure title="安装插件并指定异常处理器"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p>导航到 `Routing.kt` 中的 `configureRouting()` 方法并添加以下代码行：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>这些行安装 `StatusPages` 插件并指定当抛出 `IllegalStateException`
                        类型的异常时要采取的操作。</p>
                </step>
                <step>
                    <p>添加以下导入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.*"/>
                </step>
            </procedure>
            <p>
                请注意，HTTP 错误代码通常会在响应中设置，但出于此任务的目的，输出将直接显示在浏览器中。
            </p>
            <procedure title="编写示例代码以触发处理器" id="write-sample-code">
                <step>
                    <p>在 `configureRouting()` 方法中，添加以下所示的额外行：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>您现在已添加了一个 URL 为 `/error-test` 的端点。当此端点被触发时，将
                        抛出处理器中使用的类型的异常。</p>
                </step>
            </procedure>
            <procedure title="重新启动并调用示例代码" id="restart-and-invoke">
                <step>
                    <p>点击重新运行按钮 (<img alt="intelliJ IDEA 重新运行按钮图标"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        以重新启动应用程序。</p></step>
                <step>
                    <p>在您的浏览器中，导航到 URL [http://0.0.0.0:9292/error-test](http://0.0.0.0:9292/error-test)。
                        您应该会看到如下所示的错误消息：</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="显示消息“App in illegal state as Too Busy”的浏览器屏幕" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="后续步骤" id="next_steps">
        <p>
            如果您已完成附加任务，您现在应该掌握了 Ktor
            服务器的配置、Ktor 插件的集成以及新路由的实现。然而，这仅仅是开始。要深入了解
            Ktor 的基础概念，请继续学习本指南中的下一个教程。
        </p>
        <p>
            接下来，您将学习如何通过创建任务管理器应用程序来<Links href="/ktor/server-requests-and-responses" summary="通过构建任务管理器应用程序，了解如何使用 Ktor 在 Kotlin 中进行路由、处理请求和参数的基础知识。">处理请求并
            生成响应</Links>。
        </p>
    </chapter>
</topic>