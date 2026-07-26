<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="建立、開啟並執行新的 Ktor 專案"
       id="server-create-a-new-project"
       help-id="server_create_a_new_project">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-get-started"/>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    了解如何使用 Ktor 開啟、執行和測試伺服器應用程式。
</link-summary>
<web-summary>
    開始建置您的第一個 Ktor 伺服器應用程式。在本教學中，您將學習如何建立、開啟並執行新的 Ktor 專案。
</web-summary>
<p>
    在本教學中，您將學習如何建立、開啟並執行您的第一個 Ktor 伺服器專案。一旦啟動並執行，您可以完成一系列任務來熟悉 Ktor。
</p>
<p>
    這是引導您開始使用 Ktor 建置伺服器應用程式系列教學的第一部分。您可以獨立完成每個教學，但我們強烈建議您按照建議的順序進行：
</p>
<list type="decimal">
    <li>建立、開啟並執行新的 Ktor 專案。</li>
    <li><Links href="//server-requests-and-responses" summary="藉由建置任務管理器應用程式，學習使用 Ktor 在 Kotlin 中進行路由、處理請求和參數的基礎知識。">處理請求並產生回應</Links>。</li>
    <li><Links href="//server-create-restful-apis" summary="學習如何使用 Kotlin 和 Ktor 建置後端服務，包含一個產生 JSON 檔案的 RESTful API 範例。">建立產生 JSON 的 RESTful API</Links>。</li>
    <li><Links href="//server-create-website" summary="學習如何使用 Ktor 和 Thymeleaf 範本在 Kotlin 中建置網站。">使用 Thymeleaf 範本建立網站</Links>。</li>
    <li><Links href="//server-create-websocket-application" summary="學習如何利用 WebSocket 的強大功能來發送和接收內容。">建立 WebSocket 應用程式</Links>。</li>
    <li><Links href="//server-integrate-database" summary="學習使用 Exposed SQL 程式庫將 Ktor 服務連接到資料庫儲存庫的過程。">使用 Exposed 整合資料庫</Links>。</li>
</list>
<chapter id="create-project" title="建立新的 Ktor 專案">
    <p>
        建立新 Ktor 專案最快的方法之一是<a href="#create-project-with-the-ktor-project-generator">使用網頁版 Ktor 專案產生器</a>。
    </p>
    <p>
        或者，您可以<a href="#create_project_with_intellij">使用 IntelliJ IDEA Ultimate 專用的 Ktor 外掛程式</a>或 <a href="#create_project_with_ktor_cli_tool">Ktor CLI 工具</a>來產生專案。
    </p>
    <chapter title="使用 Ktor 專案產生器"
             id="create-project-with-the-ktor-project-generator">
        <p>
            若要使用 Ktor 專案產生器建立新專案，請按照以下步驟操作：
        </p>
        <procedure>
            <step>
                <p>導覽至 <a href="https://start.ktor.io/">Ktor 專案產生器</a>。</p>
            </step>
            <step>
                <p>在
                    <control>Project artifact</control>
                    欄位中，輸入
                    <Path>com.example.ktor-sample</Path>
                    作為您的專案構件名稱。
                    <img src="ktor_343_project_generator_new_project_artifact_name.png"
                         alt="Ktor 專案產生器，專案構件名稱為 com.example.ktor-sample"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step id="configure-project-step">
                <p>點擊
                    <control>Configure</control>
                    以開啟設定下拉式功能表：
                    <img src="ktor_343_project_generator_new_project_configure.png"
                         style="block"
                         alt="Ktor 專案設定的展開檢視" border-effect="line" width="706"/>
                </p>
                <p>
                    提供以下設定：
                </p>
                <list>
                    <li>
                        <p>
                            <control>Build System</control>
                            ：
                            選擇所需的 <Links href="//server-dependencies" summary="學習如何將 Ktor 伺服器相依性新增至現有的 Gradle/Maven 專案。">建構系統</Links>。
                            可以是
                            <emphasis>Gradle Kotlin</emphasis>、
                            <emphasis>Gradle Groovy</emphasis>、
                            <emphasis>Maven</emphasis> 或 <emphasis>Amper</emphasis>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Engine</control>
                            ：
                            選擇用於執行伺服器的<Links href="//server-engines" summary="了解處理網路請求的引擎。">引擎</Links>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Configuration</control>
                            ：
                            選擇是要在 <Links href="//server-configuration-file" summary="學習如何在配置檔案中配置各種伺服器參數。">YAML 或 HOCON 檔案中</Links>，還是在 <Links href="//server-configuration-code" summary="學習如何在程式碼中配置各種伺服器參數。">程式碼中</Links>指定伺服器參數。
                        </p>
                        <warning>
                            目前以 Maven 為基礎的 Ktor 專案不支援 YAML 配置。
                        </warning>
                    </li>
                </list>
                <p>對於本教學，您可以保留這些設定的預設值。</p>
            </step>
            <step>
                <p>點擊
                    <control>Done</control>
                    以儲存配置並關閉功能表。
                </p>
            </step>
            <step>
                <p>在下方您會發現一組可以新增到專案中的 <Links href="//server-plugins" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>。外掛程式是提供 Ktor 應用程式常見功能的建構區塊，例如身份驗證、序列化和內容編碼、壓縮、Cookie 支援等等。
                </p>
                <p>就本教學而言，您目前不需要新增任何外掛程式。</p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Download</control>
                    按鈕以產生並下載您的 Ktor 專案。
                    <img src="ktor_343_project_generator_new_project_download.png"
                         alt="Ktor 專案產生器下載按鈕"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <p>您的下載應該會自動開始。</p>
        </procedure>
        <p>既然您已經產生了新專案，請繼續<a href="#unpacking">解包並執行您的 Ktor 專案</a>。</p>
    </chapter>
    <chapter title="使用 IntelliJ IDEA Ultimate 的 Ktor 外掛程式" id="create_project_with_intellij"
             collapsible="true">
        <p>
            本節說明如何使用 IntelliJ IDEA Ultimate 的 <a
                href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 外掛程式</a>進行專案設定。
        </p>
        <p>
            若要建立新的 Ktor 專案，請<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">開啟 IntelliJ IDEA</a> 並按照以下步驟操作：
        </p>
        <procedure>
            <step>
                <p>
                    在歡迎畫面，點擊 <control>New Project</control>。
                </p>
                <p>
                    或者，從主功能表選擇 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>New Project</control>
                    精靈中，從左側列表選擇
                    <control>Ktor</control>。
                </p>
            </step>
            <step>
                <p>
                    在右側窗格中，您可以指定以下設定：
                </p>
                <img src="ktor_idea_new_project_settings.png" alt="Ktor 專案設定" width="706"
                     border-effect="rounded"/>
                <list>
                    <li>
                        <p>
                            <control>Name</control>：指定專案名稱。輸入
                            <Path>ktor-sample</Path>
                            作為您的專案名稱。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Location</control>：指定您的專案目錄。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Website</control>
                            ：
                            指定用於產生套件名稱的網域。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Artifact</control>
                            ：
                            此欄位顯示產生的構件名稱。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Engine</control>
                            ：
                            選擇用於執行伺服器的<Links href="//server-engines" summary="了解處理網路請求的引擎。">引擎</Links>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Include samples</control>
                            ：
                            保持啟用此選項以新增外掛程式的範例程式碼。
                        </p>
                    </li>
                </list>
            </step>
            <step>
                <p>
                    點擊
                    <control>Advanced Settings</control>
                    以展開額外的設定功能表：
                </p>
                <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor 專案進階設定"
                     width="706" border-effect="rounded"/>
                <p>
                    提供以下設定：
                </p>
                <list>
                    <li>
                        <p>
                            <control>Build System</control>
                            ：
                            選擇所需的 <Links href="//server-dependencies" summary="學習如何將 Ktor 伺服器相依性新增至現有的 Gradle/Maven 專案。">建構系統</Links>。
                            可以是
                            <emphasis>Gradle Kotlin</emphasis>、
                            <emphasis>Gradle Groovy</emphasis>、
                            <emphasis>Maven</emphasis> 或 <emphasis>Amper</emphasis>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Ktor version</control>
                            ：
                            選擇所需的 Ktor 版本。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Configuration</control>
                            ：
                            選擇是要在 <Links href="//server-configuration-file" summary="學習如何在配置檔案中配置各種伺服器參數。">YAML 或 HOCON 檔案中</Links>，還是在 <Links href="//server-configuration-code" summary="學習如何在程式碼中配置各種伺服器參數。">程式碼中</Links>指定伺服器參數。
                        </p>
                        <warning>
                            目前以 Maven 為基礎的 Ktor 專案不支援 YAML 配置。
                        </warning>
                    </li>
                </list>
                <p>就本教學而言，您可以保留這些設定的預設值。</p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Next</control>
                    以前往下一頁。
                </p>
                <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor 外掛程式" width="706"
                     border-effect="rounded"/>
                <p>
                    在此頁面上，您可以選擇一組 <Links href="//server-plugins" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links> — 這些是提供 Ktor 應用程式常見功能的建構區塊，例如身份驗證、序列化和內容編碼、壓縮、Cookie 支援等等。
                </p>
                <p>就本教學而言，您目前不需要新增任何外掛程式。</p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Create</control>
                    並等待 IntelliJ IDEA 產生專案並安裝相依性。
                </p>
            </step>
        </procedure>
        <p>
            既然您已建立了新專案，請繼續學習如何 <a href="#open-explore-run">開啟、探索並執行</a> 該應用程式。
        </p>
    </chapter>
    <chapter title="使用 Ktor CLI 工具" id="create_project_with_ktor_cli_tool"
             collapsible="true">
        <p>
            本節說明如何使用 <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 工具</a>進行專案設定。
        </p>
        <p>
            若要建立新的 Ktor 專案，請開啟您偏好的終端機並按照以下步驟操作：
        </p>
        <procedure>
            <step>
                使用以下指令之一安裝 Ktor CLI 工具：
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
                若要在互動模式下產生新專案，請使用以下指令：
                <code-block lang="console" code="                      ktor new"/>
            </step>
            <step>
                輸入
                <Path>ktor-sample</Path>
                作為您的專案名稱：
                <img src="server_create_cli_tool_name_dark.png"
                     alt="在互動模式下使用 Ktor CLI 工具"
                     border-effect="rounded"
                     style="block"
                     width="706"/>
                <p>
                    （選填）您也可以透過編輯專案名稱下方的
                    <ui-path>Location</ui-path>
                    路徑來更改專案儲存的位置。
                </p>
            </step>
            <step>
                按下
                <shortcut>Enter</shortcut>
                以繼續。
            </step>
            <step>
                在下一個步驟中，您可以搜尋並將 <Links href="//server-plugins" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links> 新增到您的專案中。外掛程式是提供 Ktor 應用程式常見功能的建構區塊，例如身份驗證、序列化和內容編碼、壓縮、Cookie 支援等等。
                <img src="server_create_cli_tool_add_plugins_dark.png"
                     alt="使用 Ktor CLI 工具將外掛程式新增到專案中"
                     border-effect="rounded"
                     style="block"
                     width="706"/>
                <p>就本教學而言，您目前不需要新增任何外掛程式。</p>
            </step>
            <step>
                按下
                <shortcut>CTRL+G</shortcut>
                以產生專案。
                <p>
                    或者，您可以透過選擇
                    <control>CREATE PROJECT (CTRL+G)</control>
                    並按下
                    <shortcut>Enter</shortcut>
                    來產生專案。
                </p>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="解包並執行您的 Ktor 專案" id="unpacking">
    <p>
        在本節中，您將學習如何從命令列解包、組建並執行專案。以下步驟假設：
    </p>
    <list type="bullet">
        <li>您已建立並下載了一個名為
            <Path>ktor-sample</Path>
            的 Gradle 專案。
        </li>
        <li>此專案位於您家目錄中名為
            <Path>myprojects</Path>
            的資料夾內。
        </li>
    </list>
    <p>如有必要，請修改名稱和路徑以符合您自己的設定。</p>
    <p>開啟您偏好的命令列工具並按照以下步驟操作：</p>
    <procedure>
        <step>
            <p>在終端機視窗中，導覽至您下載專案的資料夾：</p>
            <code-block lang="console" code="                    cd ~/myprojects"/>
        </step>
        <step>
            <p>將 ZIP 封存檔解包到同名的資料夾中：</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                </TabItem>
                <TabItem title="Windows" group-key="windows">
                    <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                </TabItem>
            </Tabs>
            <p>您的目錄現在將包含 ZIP 封存檔和解包後的資料夾。</p>
        </step>
        <step>
            <p>從該目錄導覽進入新建立的資料夾：</p>
            <code-block lang="console" code="                    cd ktor-sample"/>
        </step>
        <step>
            <p>在 macOS 和 UNIX 系統上，您必須使 Gradle 輔助指令碼成為可執行檔，以便系統將其識別為可執行指令。為此，請使用 <code>chmod</code> 指令：</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            chmod +x ./gradlew"/>
                </TabItem>
            </Tabs>
        </step>
        <step>
            <p>若要組建專案，請使用以下指令：</p>
            <Tabs>
                <TabItem title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            ./gradlew build"/>
                </TabItem>
                <TabItem title="Windows" group-key="windows">
                    <code-block lang="console" code="                            gradlew build"/>
                </TabItem>
            </Tabs>
            <p>當組建成功後，繼續下一個步驟以執行專案。</p>
        </step>
        <step>
            <p>若要執行專案，請使用以下指令：</p>
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
            <p>若要驗證專案是否正在執行，請在瀏覽器中開啟終端機輸出中顯示的 URL (<a
                    href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>)。
                您應該會在瀏覽器中看到顯示 "Hello World!" 訊息：</p>
            <img src="server_get_started_ktor_sample_app_output.png" alt="產生的 Ktor 專案輸出"
                 border-effect="line" width="706"/>
        </step>
    </procedure>
    <p>恭喜！您已成功啟動您的 Ktor 專案。</p>
    <note>
        請注意，命令列沒有回應是因為底層處理程序正在忙於執行 Ktor 應用程式。您可以按下
        <shortcut>CTRL+C</shortcut>
        來終止應用程式。
    </note>
</chapter>
<chapter title="在 IntelliJ IDEA 中開啟、探索並執行您的 Ktor 專案" id="open-explore-run">
    <chapter title="開啟專案" id="open">
        <p>如果您安裝了 <a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>，您可以輕鬆地從命令列開啟專案。
        </p>
        <p>
            確保您位於專案資料夾中，然後輸入 <code>idea</code> 指令，後跟一個句點來代表當前資料夾：
        </p>
        <code-block lang="Bash" code="                idea ."/>
        <p>
            或者，若要手動開啟專案，請啟動 IntelliJ IDEA。
        </p>
        <p>
            如果開啟了歡迎畫面，點擊
            <control>Open</control>。否則，前往主功能表中的
            <ui-path>File | Open</ui-path>
            並選擇
            <Path>ktor-sample</Path>
            資料夾以將其開啟。
        </p>
        <tip>
            有關管理專案的更多詳細資訊，請參閱 <a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA 文件</a>。
        </tip>
    </chapter>
    <chapter title="探索專案" id="explore">
        <p>開啟專案後，您可以看到以下結構：</p>
        <img src="tutorial_server_get_started_idea_project_view.png" alt="IDE 中產生的 Ktor 專案檢視" width="706"/>
        <p>
            若要檢視完整的版面配置，請點擊每個資料夾旁邊的展開箭頭，在 <control>Project</control> 檢視中展開資料夾。
        </p>
        <p>
            應用程式原始碼位於
            <Path>src/main/kotlin</Path>
            下。預設會建立兩個檔案，分別名為
            <Path>Application.kt</Path>
            和
            <Path>Routing.kt</Path>
        </p>
        <img src="tutorial_server_get_started_idea_main_folder.png" alt="Ktor 專案 src 資料夾結構" width="400"/>
        <p>專案名稱是在
            <Path>settings.gradle.kts</Path>
            檔案中配置的：
        </p>
        <code-block lang="kotlin" code="rootProject.name = &quot;ktor-sample&quot;"/>
        <p>
            配置檔案和其他類型的內容位於
            <Path>src/main/resources</Path>
            資料夾內。
        </p>
        <img src="tutorial_server_get_started_idea_resources_folder.png" alt="Ktor 專案 resources 資料夾結構"
             width="400"/>
    </chapter>
    <chapter title="執行專案" id="run">
        <procedure>
            <p>若要在 IntelliJ IDEA 內執行專案：</p>
            <step>
                <p>點擊右側提欄上的 Gradle 圖示 (<img alt="IntelliJ IDEA Gradle 圖示"
                                                      src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                    以開啟 <a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 工具視窗</a>。</p>
            </step>
            <step>
                <p>在此工具視窗中，導覽至
                    <ui-path>Tasks | application</ui-path>
                    並按兩下
                    <control>run</control>
                    任務。
                </p>
                <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA 中的 Gradle 索引標籤"
                     border-effect="line" width="450"/>
            </step>
            <step>
                <p>您的 Ktor 應用程式會在 IDE 底部的 <a
                        href="https://www.jetbrains.com/help/idea/run-tool-window.html">執行工具視窗</a>中啟動：</p>
                <img src="tutorial_server_get_started_idea_run_terminal.png" alt="在終端機中執行的專案" width="706"/>
                <p>先前在命令列上顯示的相同訊息現在將在
                    <ui-path>Run</ui-path>
                    工具視窗中可見。
                </p>
            </step>
            <step>
                <p>若要確認專案正在執行，請在指定的 URL
                    (<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>) 開啟瀏覽器。</p>
                <p>您應該會再次在螢幕上看到顯示 "Hello World!" 訊息：</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="瀏覽器畫面中的 Hello World"
                     width="706"/>
            </step>
        </procedure>
        <p>
            您可以透過
            <ui-path>Run</ui-path>
            工具視窗管理應用程式。
        </p>
        <list type="bullet">
            <li>
                要終止應用程式，請點擊停止按鈕 <img src="intellij_idea_terminate_icon.svg"
                                                                         style="inline" height="16" width="16"
                                                                         alt="IntelliJ IDEA 終止圖示"/>。
            </li>
            <li>
                要重新啟動程序，請點擊重新執行按鈕 <img src="intellij_idea_rerun_icon.svg"
                                                                    style="inline" height="16" width="16"
                                                                    alt="IntelliJ IDEA 重新執行圖示"/>。
            </li>
        </list>
        <p>
            這些選項在 <a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA 執行工具視窗文件</a>中有進一步說明。
        </p>
    </chapter>
</chapter>
<chapter title="嘗試額外的任務" id="additional-tasks">
    <p>以下是一些您可能希望嘗試的額外任務：</p>
    <list type="decimal">
        <li><a href="#change-the-default-port">更改預設連接埠</a></li>
        <li><a href="#add-a-new-http-endpoint">新增 HTTP 端點</a></li>
        <li><a href="#configure-static-content">配置靜態內容</a></li>
        <li><a href="#write-an-integration-test">撰寫整合測試</a></li>
        <li><a href="#register-error-handlers">註冊錯誤處理常式</a></li>
    </list>
    <p>
        這些任務彼此獨立，但複雜度逐漸增加。按宣告的順序嘗試它們是循序漸進學習的最簡單方式。為了簡單起見並避免重複，下面的描述假設您正按順序嘗試任務。
    </p>
    <p>
        在需要編寫程式碼的地方，我們同時指定了程式碼和對應的匯入。IDE 可能會自動為您新增這些匯入。
    </p>
    <chapter title="更改預設連接埠" id="change-the-default-port">
        <chapter title="在配置檔案中更改連接埠" id="change-the-port-in-config">
            <p>
                如果您選擇將配置儲存在外部的 YAML 或 HOCON 檔案中，在
                <ui-path>Project</ui-path>
                檢視中導覽至
                <Path>src/main/resources</Path>
                資料夾並按照以下步驟操作：
            </p>
            <procedure id="change-default-port-yaml-procedure">
                <step>
                    開啟您的配置檔案 (
                    <Path>application.yaml</Path>
                    或
                    <Path>application.conf</Path>
                    )。它應該如下所示：
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
                    將檔案中的 <code>port</code> 值更改為您選擇的另一個數字，例如
                    <code>9292</code>。
                </step>
                <step>
                    <p>點擊重新執行按鈕 (<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        以重新啟動應用程式。</p>
                </step>
                <step>
                    <p>要驗證您的應用程式是否在新的連接埠號碼下執行，您可以在瀏覽器中開啟新的 URL (<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>) 或
                        <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中建立新的 HTTP 請求檔案</a>：</p>
                    <img src="tutorial_server_get_started_port_change.png"
                         alt="在 IntelliJ IDEA 中使用 HTTP 請求檔案測試連接埠更改" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="在程式碼中更改連接埠" id="change-the-port-in-code">
            <p>
                <a href="#configure-project-step">建立新的 Ktor 專案時</a>，您可以選擇將配置儲存在程式碼中或外部的 YAML 或 HOCON 檔案中。
            </p>
            <p>
                如果您選擇了將配置儲存在程式碼中的選項，在
                <ui-path>Project</ui-path>
                檢視中導覽至
                <Path>src/main/kotlin</Path>
                資料夾並按照以下步驟操作：
            </p>
            <procedure id="change-the-default-port-code-procedure">
                <step>
                    <p>開啟
                        <Path>main.kt</Path>
                        檔案。您應該會發現類似於以下的程式碼：
                    </p>
                    <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                </step>
                <step>
                    <p>在 <code>embeddedServer()</code> 函式中，將 <code>port</code> 參數更改為您選擇的另一個數字，例如 <code>9292</code>。</p>
                    <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                </step>
                <step>
                    <p>點擊重新執行按鈕 (<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                        以重新啟動應用程式。</p>
                </step>
                <step>
                    <p>要驗證您的應用程式是否在新的連接埠號碼下執行，您可以在瀏覽器中開啟新的 URL (<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>)，或
                        <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中建立新的 HTTP 請求檔案</a>：</p>
                    <img src="tutorial_server_get_started_port_change.png"
                         alt="在 IntelliJ IDEA 中使用 HTTP 請求檔案測試連接埠更改" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="新增 HTTP 端點" id="add-a-new-http-endpoint">
        <p>
            在
            <ui-path>Project</ui-path>
            工具視窗中，導覽至
            <Path>src/main/kotlin</Path>
            資料夾並按照以下步驟操作：
        </p>
        <procedure>
            <step>
                <p>開啟
                    <Path>Routing.kt</Path>
                    檔案。這是您應該看到的程式碼：
                </p>
                <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
            </step>
            <step>
                <p>若要建立新端點，請插入如下所示的額外路由：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                <note>請注意，您可以將 <code>/test1</code> URL 更改為您喜歡的任何內容。</note>
            </step>
            <step>
                <p>IDE 會自動為 <code>ContentType</code> 新增匯入：</p>
                <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
            </step>
            <step>
                <p>點擊重新執行按鈕 (<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>在瀏覽器中請求新的 URL (<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>)。連接埠號碼取決於您是否完成了<a href="#change-the-default-port">更改預設連接埠</a>任務。您應該看到如下所示的輸出：</p>
                <img src="server_get_started_add_new_http_endpoint_output.png"
                     alt="顯示 Hello from Ktor 的瀏覽器畫面" width="706"/>
                <p>如果您建立了 HTTP 請求檔案，也可以在那裡驗證新端點：</p>
                <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                <note>請注意，需要包含三個井字號 (<code>###</code>) 的行來分隔不同的請求。</note>
            </step>
        </procedure>
    </chapter>
    <chapter title="配置靜態內容" id="configure-static-content">
        <p>在
            <ui-path>Project</ui-path>
            工具視窗中，導覽至
            <Path>src/main/kotlin</Path>
            資料夾並按照以下步驟操作：
        </p>
        <procedure>
            <step>
                <p>開啟 <Path>Routing.kt</Path> 檔案並將以下路由新增到路由區段：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                <p>這一行的含義如下：</p>
                <list type="bullet">
                    <li>調用 <code>staticResources()</code> 使您的應用程式能夠提供標準的網站內容，例如 HTML 和 JavaScript 檔案。儘管這些內容可以在瀏覽器中執行，但從伺服器的角度來看，它們被視為靜態的。
                    </li>
                    <li>URL <code>/content</code> 指定用於獲取此內容的路徑。
                    </li>
                    <li>路徑 <code>mycontent</code> 是靜態內容所在的資料夾名稱。Ktor 將在 <code>resources</code> 目錄中尋找此資料夾。
                    </li>
                </list>
            </step>
            <step>
                <p>如果 IDE 沒有自動新增，請新增以下匯入。</p>
                <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
            </step>
            <step>
                <p>在
                    <control>Project</control>
                    工具視窗中，右鍵點擊 <Path>src/main/resources</Path> 資料夾並選擇
                    <control>New | Directory</control>。
                </p>
                <p>或者，選擇 <Path>src/main/resources</Path> 資料夾，按下
                    <shortcut>⌘Cmd+N</shortcut> (macOS) 或 <shortcut>Ctrl+N</shortcut> (Windows/Linux)
                    並點擊
                    <control>Directory</control>。
                </p>
            </step>
            <step>
                <p>將新目錄命名為 <code>mycontent</code> 並按下
                    <shortcut>↩Enter</shortcut>。
                </p>
            </step>
            <step>
                <p>右鍵點擊新建立的資料夾並點擊
                    <control>New | File</control>。
                </p>
            </step>
            <step>
                <p>將新檔案命名為 <Path>sample.html</Path> 並按下
                    <shortcut>↩Enter</shortcut>。
                </p>
            </step>
            <step>
                <p>在新建的檔案頁面填入有效的 HTML，例如：</p>
                <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>點擊重新執行按鈕 (<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>當您在瀏覽器開啟 <a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a> 時，應該會顯示您範例頁面的內容：</p>
                <img src="server_get_started_configure_static_content_output.png"
                     alt="瀏覽器中靜態頁面的輸出" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="撰寫整合測試" id="write-an-integration-test">
        <p>
            Ktor 提供對<Links href="//server-testing" summary="了解如何使用特殊的測試引擎測試您的伺服器應用程式。">建立整合測試</Links>的支援，且您產生的專案已隨附此功能。
        </p>
        <p>若要使用此功能，請按照以下步驟操作：</p>
        <procedure>
            <step>
                <p>
                    導覽至
                    <Path>src/test/kotlin</Path>
                    資料夾。
                </p>
            </step>
            <step>
                <p>開啟 <Path>ServerTest.kt</Path> 檔案。您應該會看到如下程式碼：</p>
                <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // loads default configuration&#10;        configure()&#10;        // verify server root returns 200&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                <p><code>testApplication()</code> 函式會建立一個新的 Ktor 執行個體。此執行個體是在測試環境中執行的，而不是在 Netty 等伺服器上執行。</p>
                <p>接著您可以使用 <code>configure()</code> 函式來調用與 <code>embeddedServer()</code> 中相同的設定。</p>
                <p>最後，您可以使用內建的 <code>client</code> 物件和 JUnit 判斷提示來發送範例請求並檢查回應。</p>
            </step>
        </procedure>
        <p>
            您可以使用 IntelliJ IDEA 中執行測試的任何標準方式來執行該測試。請注意，由於您正在執行一個新的 Ktor 執行個體，測試的成功與否並不取決於您的應用程式是否正在 <code>0.0.0.0</code> 執行。
        </p>
        <p>
            如果您已成功完成<a href="#add-a-new-http-endpoint">新增 HTTP 端點</a>，請新增此額外測試：
        </p>
        <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
        <p>新增以下額外匯入：</p>
        <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
    </chapter>
    <chapter title="註冊錯誤處理常式" id="register-error-handlers">
        <p>
            您可以使用 <Links href="//server-status-pages" summary="StatusPages 讓 Ktor 應用程式能根據拋出的例外或狀態碼對任何失敗狀態做出適當回應。">StatusPages 外掛程式</Links>來處理 Ktor 應用程式中的錯誤。
        </p>
        <tip>
            預設情況下，您的專案中不包含此外掛程式。在使用 Ktor 專案產生器建立專案時，您可以透過 <ui-path>Plugins</ui-path> 部分新增它，或者在 IntelliJ IDEA 中透過專案精靈新增。
        </tip>
        <p>
            在接下來的步驟中，您將學習如何手動新增和配置此外掛程式。實現這一目標有四個步驟：
        </p>
        <list type="decimal">
            <li><a href="#add-dependency">在 Gradle 建置檔案中新增相依性。</a></li>
            <li><a href="#install-plugin-and-specify-handler">安裝外掛程式並指定例外處理常式。</a></li>
            <li><a href="#write-sample-code">編寫範例程式碼以觸發處理常式。</a></li>
            <li><a href="#restart-and-invoke">重新啟動並調用範例程式碼。</a></li>
        </list>
        <procedure title="新增相依性" id="add-dependency">
            <p>在
                <control>Project</control>
                工具視窗中，導覽至專案根資料夾並按照以下步驟操作：
            </p>
            <step>
                <p>開啟 <Path>build.gradle.kts</Path> 檔案並按如下所示新增相依性：</p>
                <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // Add new dependency&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
            </step>
            <step>
                <p>按下
                    <shortcut>Shift+⌘Cmd+I</shortcut> (macOS) 或
                    <shortcut>Ctrl+Shift+O</shortcut> (Windows/Linux) 來重新載入專案。
                </p>
            </step>
        </procedure>
        <procedure title="安裝外掛程式並指定例外處理常式"
                   id="install-plugin-and-specify-handler">
            <step>
                <p>導覽至 <Path>Routing.kt</Path> 中的 <code>.configureRouting()</code> 方法，並新增以下程式碼行：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                <p>這些行安裝了 <code>StatusPages</code> 外掛程式，並指定了當拋出 <code>IllegalStateException</code> 類型的例外時要採取的動作。</p>
            </step>
            <step>
                <p>新增以下匯入：</p>
                <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
            </step>
        </procedure>
        <p>
            請注意，通常會在回應中設定 HTTP 錯誤碼，但出於此任務的目的，輸出會直接顯示在瀏覽器中。
        </p>
        <procedure title="編寫範例程式碼以觸發處理常式" id="write-sample-code">
            <step>
                <p>保留在 <code>.configureRouting()</code> 方法中，新增如下所示的額外路由：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>您現在已經新增了一個 URL 為 <code>/error-test</code> 的端點。當觸發此端點時，將拋出一個在處理常式中使用的類型的例外。</p>
            </step>
        </procedure>
        <procedure title="重新啟動並調用範例程式碼" id="restart-and-invoke">
            <step>
                <p>點擊重新執行按鈕 (<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>)
                    以重新啟動應用程式。</p></step>
            <step>
                <p>在您的瀏覽器中，導覽至 URL <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a>。
                    您應該會看到如下所示的錯誤訊息：</p>
                <img src="server_get_started_register_error_handler_output.png"
                     alt="顯示訊息 `App in illegal state as Too Busy` 的瀏覽器畫面" width="706"/>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="後續步驟" id="next_steps">
    <p>
        如果您已經完成了這些額外任務，那麼您現在已經初步掌握了配置 Ktor 伺服器、整合 Ktor 外掛程式以及實作新路由的方法。然而，這僅僅是個開始。若要更深入地了解 Ktor 的核心概念，請繼續閱讀本指南中的下一個教學。
    </p>
    <p>
        接下來，您將學習如何藉由建立一個 <Links href="//server-requests-and-responses" summary="藉由建置任務管理器應用程式，學習使用 Ktor 在 Kotlin 中進行路由、處理請求和參數的基礎知識。">任務管理器應用程式來處理請求並產生回應</Links>。
    </p>
</chapter>
</topic>