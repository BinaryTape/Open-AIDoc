<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="建立、開啟與執行新的 Ktor 專案"
       id="server-create-a-new-project"
       help-id="server_create_a_new_project">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-server-get-started"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        了解如何使用 Ktor 開啟、執行和測試伺服器應用程式。
    </link-summary>
    <web-summary>
        開始建置你的第一個 Ktor 伺服器應用程式。在本教學中，你將學習如何建立、開啟和執行新的 Ktor 專案。
    </web-summary>
    <p>
        在本教學中，你將學習如何建立、開啟和執行你的第一個 Ktor 伺服器專案。啟動並順利執行後，你可以完成一系列任務以熟悉 Ktor。
    </p>
    <p>
        這是幫助你開始使用 Ktor 建置伺服器應用程式系列教學的第一篇。你可以獨立完成每個教學，但我們強烈建議你遵循建議的順序：
    </p>
    <list type="decimal">
        <li>建立、開啟與執行新的 Ktor 專案。</li>
        <li><Links href="server-requests-and-responses.topic" summary="透過建置工作管理員應用程式，學習在 Kotlin 中使用 Ktor 進行路由、處理請求和參數的基本知識。">處理請求並產生回應</Links>。</li>
        <li><Links href="server-create-restful-apis.topic" summary="學習如何使用 Kotlin 和 Ktor 建置後端服務，其中包含產生 JSON 檔案的 RESTful API 範例。">建立產生 JSON 的 RESTful API</Links>。</li>
        <li><Links href="server-create-website.topic" summary="學習如何在 Kotlin 中使用 Ktor 和 Thymeleaf 範本建置網站。">使用 Thymeleaf 範本建立網站</Links>。</li>
        <li><Links href="server-create-websocket-application.topic" summary="學習如何發揮 WebSockets 的強大功能來傳送和接收內容。">建立 WebSocket 應用程式</Links>。</li>
        <li><Links href="server-integrate-database.md" summary="了解使用 Exposed SQL 程式庫將 Ktor 服務連接到資料庫存儲庫的過程。">使用 Exposed 整合資料庫</Links>。</li>
    </list>
    <chapter id="create-project" title="建立新的 Ktor 專案">
        <p>
            建立新 Ktor 專案最快的方法之一是<a href="#create-project-with-the-ktor-project-generator">使用基於 Web 的 Ktor 專案產生器</a>。
        </p>
        <p>
            或者，你也可以<a href="#create_project_with_intellij">使用 IntelliJ IDEA Ultimate 專用的 Ktor 外掛程式</a>或 <a href="#create_project_with_ktor_cli_tool">Ktor CLI 工具</a>來產生專案。
        </p>
        <chapter title="使用 Ktor 專案產生器"
                 id="create-project-with-the-ktor-project-generator">
            <p>
                若要使用 Ktor 專案產生器建立新專案，請遵循以下步驟：
            </p>
            <procedure>
                <step>
                    <p>前往 <a href="https://start.ktor.io/">Ktor 專案產生器</a>。</p>
                </step>
                <step>
                    <p>在
                        <control>Project artifact</control>
                        欄位中，輸入
                        <Path>com.example.ktor-sample</Path>
                        作為專案構件的名稱。
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
                                選擇所需的<Links href="server-dependencies.topic" summary="了解如何將 Ktor 伺服器相依性新增至現有的 Gradle/Maven 專案。">建置系統</Links>。
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
                                選取用於執行伺服器的<Links href="server-engines.md" summary="了解處理網路請求的引擎。">引擎</Links>。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Configuration</control>
                                ：
                                選擇是<Links href="server-configuration-file.topic" summary="了解如何在設定檔中配置各種伺服器參數。">在 YAML 或 HOCON 檔案中</Links>，還是在<Links href="server-configuration-code.topic" summary="了解如何在程式碼中配置各種伺服器參數。">程式碼中</Links>指定伺服器參數。
                            </p>
                            <warning>
                                基於 Maven 的 Ktor 專案目前不支援 YAML 配置。
                            </warning>
                        </li>
                    </list>
                    <p>在本教學中，你可以為這些設定保留預設值。</p>
                </step>
                <step>
                    <p>點擊
                        <control>Done</control>
                        儲存配置並關閉功能表。
                    </p>
                </step>
                <step>
                    <p>在下方你會看到一組可以新增到專案中的<Links href="server-plugins.md" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>。外掛程式是提供 Ktor 應用程式中常見功能的建置組塊，例如身分驗證、序列化與內容編碼、壓縮、Cookie 支援等。
                    </p>
                    <p>就本教學而言，你現階段不需要新增任何外掛程式。</p>
                </step>
                <step>
                    <p>
                        點擊
                        <control>Download</control>
                        按鈕以產生並下載你的 Ktor 專案。
                        <img src="ktor_343_project_generator_new_project_download.png"
                             alt="Ktor 專案產生器下載按鈕"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <p>你的下載應該會自動開始。</p>
            </procedure>
            <p>產生新專案後，繼續進行<a href="#unpacking">解包並執行你的 Ktor 專案</a>。</p>
        </chapter>
        <chapter title="使用適用於 IntelliJ IDEA Ultimate 的 Ktor 外掛程式" id="create_project_with_intellij"
                 collapsible="true">
            <p>
                本節介紹使用適用於 IntelliJ IDEA Ultimate 的 <a
                    href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 外掛程式</a>進行專案設定。
            </p>
            <p>
                若要建立新的 Ktor 專案，請<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">開啟 IntelliJ IDEA</a> 並遵循以下步驟：
            </p>
            <procedure>
                <step>
                    <p>
                        在歡迎畫面中，點擊 <control>New Project</control>。
                    </p>
                    <p>
                        或者從主功能表中選取 <ui-path>File | New | Project</ui-path>。
                    </p>
                </step>
                <step>
                    <p>
                        在
                        <control>New Project</control>
                        精靈中，從左側清單中選擇
                        <control>Ktor</control>。
                    </p>
                </step>
                <step>
                    <p>
                        在右側窗格中，你可以指定以下設定：
                    </p>
                    <img src="ktor_idea_new_project_settings.png" alt="Ktor 專案設定" width="706"
                         border-effect="rounded"/>
                    <list>
                        <li>
                            <p>
                                <control>Name</control>：指定專案名稱。輸入
                                <Path>ktor-sample</Path>
                                作為專案的名稱。
                            </p>
                        </li>
                        <li>
                            <p>
                                <control>Location</control>：指定專案的目錄。
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
                                選取用於執行伺服器的<Links href="server-engines.md" summary="了解處理網路請求的引擎。">引擎</Links>。
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
                        以展開其他設定功能表：
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
                                選擇所需的<Links href="server-dependencies.topic" summary="了解如何將 Ktor 伺服器相依性新增至現有的 Gradle/Maven 專案。">建置系統</Links>。
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
                                選擇是<Links href="server-configuration-file.topic" summary="了解如何在設定檔中配置各種伺服器參數。">在 YAML 或 HOCON 檔案中</Links>，還是在<Links href="server-configuration-code.topic" summary="了解如何在程式碼中配置各種伺服器參數。">程式碼中</Links>指定伺服器參數。
                            </p>
                            <warning>
                                基於 Maven 的 Ktor 專案目前不支援 YAML 配置。
                            </warning>
                        </li>
                    </list>
                    <p>就本教學而言，你可以保留這些設定的預設值。</p>
                </step>
                <step>
                    <p>
                        點擊
                        <control>Next</control>
                        進入下一頁。
                    </p>
                    <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor 外掛程式" width="706"
                         border-effect="rounded"/>
                    <p>
                        在此頁面上，你可以選擇一組<Links href="server-plugins.md" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>——提供 Ktor 應用程式常見功能的建置組塊，例如身分驗證、序列化與內容編碼、壓縮、Cookie 支援等。
                    </p>
                    <p>就本教學而言，你現階段不需要新增任何外掛程式。</p>
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
                建立新專案後，繼續學習如何<a href="#open-explore-run">開啟、瀏覽與執行</a>該應用程式。
            </p>
        </chapter>
        <chapter title="使用 Ktor CLI 工具" id="create_project_with_ktor_cli_tool"
                 collapsible="true">
            <p>
                本節介紹使用
                <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 工具</a>進行專案設定。
            </p>
            <p>
                若要建立新的 Ktor 專案，請開啟你慣用的終端並遵循以下步驟：
            </p>
            <procedure>
                <step>
                    使用下列其中一個指令安裝 Ktor CLI 工具：
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
                    若要在互動模式下產生新專案，請使用以下指令：
                    <code-block lang="console" code="                      ktor new"/>
                </step>
                <step>
                    輸入
                    <Path>ktor-sample</Path>
                    作為專案的名稱：
                    <img src="server_create_cli_tool_name_dark.png"
                         alt="在互動模式下使用 Ktor CLI 工具"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>
                        （選填）你也可以透過編輯專案名稱下方的
                        <ui-path>Location</ui-path>
                        路徑來變更專案的儲存位置。
                    </p>
                </step>
                <step>
                    按下
                    <shortcut>Enter 鍵</shortcut>
                    以繼續。
                </step>
                <step>
                    在下一步中，你可以搜尋並新增<Links href="server-plugins.md" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>至專案中。外掛程式是提供 Ktor 應用程式中常見功能的建置組塊，例如身分驗證、序列化與內容編碼、壓縮、Cookie 支援等。
                    <img src="server_create_cli_tool_add_plugins_dark.png"
                         alt="使用 Ktor CLI 工具新增外掛程式至專案"
                         border-effect="rounded"
                         style="block"
                         width="706"/>
                    <p>就本教學而言，你現階段不需要新增任何外掛程式。</p>
                </step>
                <step>
                    按下
                    <shortcut>CTRL+G</shortcut>
                    以產生專案。
                    <p>
                        或者，你也可以透過選取
                        <control>CREATE PROJECT (CTRL+G)</control>
                        並按下
                        <shortcut>Enter 鍵</shortcut>
                        來產生專案。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="解包並執行你的 Ktor 專案" id="unpacking">
        <p>
            在本節中，你將學習如何從命令列解包、建置和執行專案。以下步驟假設：
        </p>
        <list type="bullet">
            <li>你已建立並下載名為
                <Path>ktor-sample</Path>
                的 Gradle 專案。
            </li>
            <li>此專案位於家目錄中名為
                <Path>myprojects</Path>
                的資料夾內。
            </li>
        </list>
        <p>如有必要，請修改名稱和路徑以符合你自己的設定。</p>
        <p>開啟你慣用的命令列工具並遵循以下步驟：</p>
        <procedure>
            <step>
                <p>在終端視窗中，瀏覽至你下載專案的資料夾：</p>
                <code-block lang="console" code="                    cd ~/myprojects"/>
            </step>
            <step>
                <p>將 ZIP 壓縮檔解包至同名資料夾中：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            unzip ktor-sample.zip -d ktor-sample"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            tar -xf ktor-sample.zip"/>
                    </tab>
                </tabs>
                <p>現在你的目錄將包含 ZIP 壓縮檔和解包後的資料夾。</p>
            </step>
            <step>
                <p>從該目錄瀏覽至新建立的資料夾：</p>
                <code-block lang="console" code="                    cd ktor-sample"/>
            </step>
            <step>
                <p>在 macOS 和 UNIX 系統上，你必須使 Gradle 幫助程式指令碼具備可執行權限，以便系統將其識別為可執行的指令。為此，請使用 <code>chmod</code> 指令：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            chmod +x ./gradlew"/>
                    </tab>
                </tabs>
            </step>
            <step>
                <p>若要建置專案，請使用以下指令：</p>
                <tabs>
                    <tab title="macOS" group-key="macOS">
                        <code-block lang="console" code="                            ./gradlew build"/>
                    </tab>
                    <tab title="Windows" group-key="windows">
                        <code-block lang="console" code="                            gradlew build"/>
                    </tab>
                </tabs>
                <p>建置成功後，繼續執行下一步以執行專案。</p>
            </step>
            <step>
                <p>若要執行專案，請使用以下指令：</p>
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
                <p>若要驗證專案正在執行，請在終端輸出中顯示的 URL（<a
                        href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）開啟瀏覽器。
                    你應該會在瀏覽器中看到顯示的訊息「Hello World!」：</p>
                <img src="server_get_started_ktor_sample_app_output.png" alt="產生的 Ktor 專案的輸出"
                     border-effect="line" width="706"/>
            </step>
        </procedure>
        <p>恭喜！你已成功啟動 Ktor 專案。</p>
        <note>
            請注意，命令列沒有回應是因為底層行程正忙於執行 Ktor 應用程式。你可以按下
            <shortcut>CTRL+C</shortcut>
            來終止應用程式。
        </note>
    </chapter>
    <chapter title="在 IntelliJ IDEA 中開啟、瀏覽與執行你的 Ktor 專案" id="open-explore-run">
        <chapter title="開啟專案" id="open">
            <p>如果你安裝了 <a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>，可以輕鬆地從命令列開啟專案。
            </p>
            <p>
                請確保你位於專案資料夾中，然後輸入 <code>idea</code> 指令，後接一個英文句點代表目前資料夾：
            </p>
            <code-block lang="Bash" code="                idea ."/>
            <p>
                或者，若要手動開啟專案，請啟動 IntelliJ IDEA。
            </p>
            <p>
                如果開啟了歡迎畫面，請點擊
                <control>Open</control>。
                否則，請前往主功能表中的
                <ui-path>File | Open</ui-path>
                並選取
                <Path>ktor-sample</Path>
                資料夾以將其開啟。
            </p>
            <tip>
                有關管理專案的詳細資訊，請參閱 <a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA 文件</a>。
            </tip>
        </chapter>
        <chapter title="瀏覽專案" id="explore">
            <p>開啟專案後，你可以看到以下結構：</p>
            <img src="tutorial_server_get_started_idea_project_view.png" alt="IDE 中產生的 Ktor 專案檢視" width="706"/>
            <p>
                若要檢視完整配置，請透過點擊每個資料夾旁邊的展開箭頭，展開 <control>Project</control> 檢視中的資料夾。
            </p>
            <p>
                應用程式原始碼位於
                <Path>src/main/kotlin</Path>
                下。預設會建立兩個檔案，名為
                <Path>Application.kt</Path>
                與
                <Path>Routing.kt</Path>
            </p>
            <img src="tutorial_server_get_started_idea_main_folder.png" alt="Ktor 專案 src 資料夾結構" width="400"/>
            <p>專案名稱是在
                <Path>settings.gradle.kts</Path>
                檔案中設定的：
            </p>
            <code-block lang="kotlin" code="rootProject.name = &quot;ktor-sample&quot;"/>
            <p>
                設定檔和其他類型的內容位於
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
                    <p>點擊右側邊欄上的 Gradle 圖示（<img alt="IntelliJ IDEA Gradle 圖示"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>），開啟 <a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 工具視窗</a>。</p>
                </step>
                <step>
                    <p>在此工具視窗中，瀏覽至
                        <ui-path>Tasks | application</ui-path>
                        並在
                        <control>run</control>
                        任務上按兩下。
                    </p>
                    <img src="tutorial_server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA 中的 Gradle 索引標籤"
                         border-effect="line" width="450"/>
                </step>
                <step>
                    <p>你的 Ktor 應用程式會在 IDE 底部的 <a
                            href="https://www.jetbrains.com/help/idea/run-tool-window.html">Run 工具視窗</a>中啟動：</p>
                    <img src="tutorial_server_get_started_idea_run_terminal.png" alt="在終端中執行的專案" width="706"/>
                    <p>先前在命令列上顯示的相同訊息現在將顯示在
                        <ui-path>Run</ui-path>
                        工具視窗中。
                    </p>
                </step>
                <step>
                    <p>若要確認專案正在執行，請在指定的 URL（<a href="http://0.0.0.0:8080">http://0.0.0.0:8080</a>）開啟瀏覽器。</p>
                    <p>你應該會再次看到螢幕上顯示的訊息「Hello World!」：</p>
                    <img src="server_get_started_ktor_sample_app_output.png" alt="瀏覽器畫面中的 Hello World"
                         width="706"/>
                </step>
            </procedure>
            <p>
                你可以透過
                <ui-path>Run</ui-path>
                工具視窗管理應用程式。
            </p>
            <list type="bullet">
                <li>
                    若要終止應用程式，請點擊停止按鈕 <img src="intellij_idea_terminate_icon.svg"
                                                                             style="inline" height="16" width="16"
                                                                             alt="IntelliJ IDEA 終止圖示"/>。
                </li>
                <li>
                    若要重新啟動行程，請點擊重新執行按鈕 <img src="intellij_idea_rerun_icon.svg"
                                                                        style="inline" height="16" width="16"
                                                                        alt="IntelliJ IDEA 重新執行圖示"/>。
                </li>
            </list>
            <p>
                <a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA Run 工具視窗文件</a>中對這些選項進行了進一步說明。
            </p>
        </chapter>
    </chapter>
    <chapter title="可嘗試的其他任務" id="additional-tasks">
        <p>以下是你可能想要嘗試的一些其他任務：</p>
        <list type="decimal">
            <li><a href="#change-the-default-port">變更預設連接埠</a></li>
            <li><a href="#add-a-new-http-endpoint">新增 HTTP 端點</a></li>
            <li><a href="#configure-static-content">設定靜態內容</a></li>
            <li><a href="#write-an-integration-test">編寫整合測試</a></li>
            <li><a href="#register-error-handlers">註冊錯誤處理常式</a></li>
        </list>
        <p>
            這些任務彼此不互相依賴，但複雜度逐漸增加。按宣告的順序嘗試它們是循序漸進學習的最簡單方式。為簡潔起見並避免重複，以下描述假設你按順序嘗試這些任務。
        </p>
        <p>
            在需要撰寫程式碼的地方，我們同時指定了程式碼和相應的匯入。IDE 可能會自動為你新增這些匯入。
        </p>
        <chapter title="變更預設連接埠" id="change-the-default-port">
            <chapter title="在設定檔中變更連接埠" id="change-the-port-in-config">
                <p>
                    如果你選擇將配置儲存在外部的 YAML 或 HOCON 檔案中，請在
                    <ui-path>Project</ui-path>
                    檢視中瀏覽至
                    <Path>src/main/resources</Path>
                    資料夾並遵循以下步驟：
                </p>
                <procedure id="change-default-port-yaml-procedure">
                    <step>
                        開啟你的設定檔（
                        <Path>application.yaml</Path>
                        或
                        <Path>application.conf</Path>
                        ）。它應該如下所示：
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
                        將檔案中的 <code>port</code> 值變更為你選擇的其他數字，例如
                        <code>9292</code>。
                    </step>
                    <step>
                        <p>點擊重新執行按鈕（<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新啟動應用程式。</p>
                    </step>
                    <step>
                        <p>若要驗證應用程式是否在新的連接埠號碼下執行，可以在新的 URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）開啟瀏覽器，或<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中建立新的 HTTP 請求檔案</a>：</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="在 IntelliJ IDEA 中使用 HTTP 請求檔案測試連接埠變更" width="706"/>
                    </step>
                </procedure>
            </chapter>
            <chapter title="在程式碼中變更連接埠" id="change-the-port-in-code">
                <p>
                    <a href="#configure-project-step">建立新的 Ktor 專案時</a>，你可以選擇在程式碼中儲存配置，或者在外部的 YAML 或 HOCON 檔案中儲存。
                </p>
                <p>
                    如果你選擇了在程式碼中儲存配置的選項，請在
                    <ui-path>Project</ui-path>
                    檢視中瀏覽至
                    <Path>src/main/kotlin</Path>
                    資料夾並遵循以下步驟：
                </p>
                <procedure id="change-the-default-port-code-procedure">
                    <step>
                        <p>開啟
                            <Path>main.kt</Path>
                            檔案。你應該會找到類似以下內容的程式碼：
                        </p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 8080,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>在 <code>embeddedServer()</code> 函式中，將 <code>port</code> 參數變更為你選擇的其他數字，例如 <code>9292</code>。</p>
                        <code-block lang="kotlin" code="                            fun main(args: Array&lt;String&gt;) {&#10;                                embeddedServer(&#10;                                    factory = io.ktor.server.netty.Netty,&#10;                                    port = 9292,&#10;                                    host = &quot;0.0.0.0&quot;,&#10;                                    module = Application::rootModule&#10;                                ).start(wait = true)&#10;                            }"/>
                    </step>
                    <step>
                        <p>點擊重新執行按鈕（<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                           src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新啟動應用程式。</p>
                    </step>
                    <step>
                        <p>若要驗證應用程式是否在新的連接埠號碼下執行，可以在新的 URL（<a href="http://0.0.0.0:9292">http://0.0.0.0:9292</a>）開啟瀏覽器，或<a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中建立新的 HTTP 請求檔案</a>：</p>
                        <img src="tutorial_server_get_started_port_change.png"
                             alt="在 IntelliJ IDEA 中使用 HTTP 請求檔案測試連接埠變更" width="706"/>
                    </step>
                </procedure>
            </chapter>
        </chapter>
        <chapter title="新增 HTTP 端點" id="add-a-new-http-endpoint">
            <p>
                在
                <ui-path>Project</ui-path>
                工具視窗中，瀏覽至
                <Path>src/main/kotlin</Path>
                資料夾並遵循以下步驟：
            </p>
            <procedure>
                <step>
                    <p>開啟
                        <Path>Routing.kt</Path>
                        檔案。這是你應該看到的程式碼：
                    </p>
                    <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                </step>
                <step>
                    <p>若要建立新端點，請插入如下所示的額外路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                    <note>請注意，你可以將 <code>/test1</code> URL 變更為你喜歡的任何名稱。</note>
                </step>
                <step>
                    <p>IDE 會自動新增 <code>ContentType</code> 的匯入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.http.ContentType"/>
                </step>
                <step>
                    <p>點擊重新執行按鈕（<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新啟動應用程式。</p>
                </step>
                <step>
                    <p>在瀏覽器中請求新的 URL（<a href="http://0.0.0.0:9292/test1">http://0.0.0.0:9292/test1</a>）。連接埠號碼取決於你是否完成了<a href="#change-the-default-port">變更預設連接埠</a>任務。你應該會看到如下所示的輸出：</p>
                    <img src="server_get_started_add_new_http_endpoint_output.png"
                         alt="顯示 Hello from Ktor 的瀏覽器畫面" width="706"/>
                    <p>如果你建立了 HTTP 請求檔案，也可以在其中驗證新端點：</p>
                    <code-block lang="http" code="                    GET http://0.0.0.0:9292&#10;&#10;                    ###&#10;&#10;                    GET http://0.0.0.0:9292/test1"/>
                    <note>請注意，包含三個井字號（<code>###</code>）的行用於分隔不同的請求。</note>
                </step>
            </procedure>
        </chapter>
        <chapter title="設定靜態內容" id="configure-static-content">
            <p>在
                <ui-path>Project</ui-path>
                工具視窗中，瀏覽至
                <Path>src/main/kotlin</Path>
                資料夾並遵循以下步驟：
            </p>
            <procedure>
                <step>
                    <p>開啟 <Path>Routing.kt</Path> 檔案並在路由區段中新增以下路由：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;        // ...&#10;    }&#10;}"/>
                    <p>該行的含義如下：</p>
                    <list type="bullet">
                        <li>呼叫 <code>staticResources()</code> 可讓你的應用程式提供標準網站內容，例如 HTML 和 JavaScript 檔案。儘管此內容可以在瀏覽器中執行，但從伺服器的角度來看它被視為靜態內容。
                        </li>
                        <li>URL <code>/content</code> 指定用於擷取此內容的路徑。
                        </li>
                        <li>路徑 <code>mycontent</code> 是靜態內容所在的資料夾名稱。Ktor 將在 <code>resources</code> 目錄中尋找此資料夾。
                        </li>
                    </list>
                </step>
                <step>
                    <p>如果 IDE 沒有自動新增，請新增以下匯入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.http.content.staticResources"/>
                </step>
                <step>
                    <p>在
                        <control>Project</control>
                        工具視窗中，右鍵點擊 <Path>src/main/resources</Path> 資料夾並選取
                        <control>New | Directory</control>。
                    </p>
                    <p>或者，選取 <Path>src/main/resources</Path> 資料夾，按下
                        <shortcut>⌘Cmd+N</shortcut>（macOS）或 <shortcut>Ctrl+N</shortcut>（Windows/Linux），然後點擊
                        <control>Directory</control>。
                    </p>
                </step>
                <step>
                    <p>將新目錄命名為 <code>mycontent</code> 並按下
                        <shortcut>↩Enter 鍵</shortcut>。
                    </p>
                </step>
                <step>
                    <p>右鍵點擊新建立的資料夾並點擊
                        <control>New | File</control>。
                    </p>
                </step>
                <step>
                    <p>將新檔案命名為 <Path>sample.html</Path> 並按下
                        <shortcut>↩Enter 鍵</shortcut>。
                    </p>
                </step>
                <step>
                    <p>在剛建立的檔案頁面中填入有效的 HTML，例如：</p>
                    <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;        &lt;ol&gt;&#10;            &lt;li&gt;Ktor&lt;/li&gt;&#10;            &lt;li&gt;Kotlin&lt;/li&gt;&#10;            &lt;li&gt;HTML&lt;/li&gt;&#10;        &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
                </step>
                <step>
                    <p>點擊重新執行按鈕（<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新啟動應用程式。</p>
                </step>
                <step>
                    <p>當你在 <a href="http://0.0.0.0:9292/content/sample.html">http://0.0.0.0:9292/content/sample.html</a> 開啟瀏覽器時，應會顯示範例頁面的內容：</p>
                    <img src="server_get_started_configure_static_content_output.png"
                         alt="瀏覽器中靜態頁面的輸出" width="706"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="編寫整合測試" id="write-an-integration-test">
            <p>
                Ktor 提供對<Links href="server-testing.md" summary="了解如何使用特殊測試引擎測試伺服器應用程式。">建立整合測試</Links>的支援，產生的專案已隨附此功能。
            </p>
            <p>若要利用此功能，請遵循以下步驟：</p>
            <procedure>
                <step>
                    <p>
                        瀏覽至
                        <Path>src/test/kotlin</Path>
                        資料夾。
                    </p>
                </step>
                <step>
                    <p>開啟 <Path>ServerTest.kt</Path> 檔案。你應該會看到以下程式碼：</p>
                    <code-block lang="kotlin" code="class ServerTest {&#10;&#10;    @Test&#10;    fun `test root endpoint`() = testApplication {&#10;        // loads default configuration&#10;        configure()&#10;        // verify server root returns 200&#10;        assertEquals(HttpStatusCode.OK, client.get(&quot;/&quot;).status)&#10;    }&#10;&#10;}"/>
                    <p><code>testApplication()</code> 函式會建立一個新的 Ktor 執行個體。此執行個體在測試環境中執行，而不是在 Netty 等伺服器中執行。</p>
                    <p>然後你可以使用 <code>configure()</code> 函式來調用與從 <code>embeddedServer()</code> 呼叫的相同設定。</p>
                    <p>最後，你可以使用內建的 <code>client</code> 物件和 JUnit 判斷提示來發送範例請求並檢查回應。</p>
                </step>
            </procedure>
            <p>
                你可以使用在 IntelliJ IDEA 中執行測試的任何標準方式來執行測試。請注意，由於你執行的是一個新的 Ktor 執行個體，因此測試的成功或失敗並不取決於你的應用程式是否在 <code>0.0.0.0</code> 執行。
            </p>
            <p>
                如果你已成功完成<a href="#add-a-new-http-endpoint">新增 HTTP 端點</a>，請新增此額外測試：
            </p>
            <code-block lang="kotlin" code="    @Test&#10;    fun `test new endpoint`() = testApplication {&#10;        configure()&#10;&#10;        val response = client.get(&quot;/test1&quot;)&#10;&#10;        assertEquals(HttpStatusCode.OK, response.status)&#10;        assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;        assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;    }"/>
            <p>新增以下額外的匯入：</p>
            <code-block lang="Kotlin" code="                import io.ktor.http.contentType&#10;                import io.ktor.client.statement.bodyAsText"/>
        </chapter>
        <chapter title="註冊錯誤處理常式" id="register-error-handlers">
            <p>
                你可以使用 <Links href="server-status-pages.md" summary="%plugin_name% 允許 Ktor 應用程式根據擲回的例外或狀態碼對任何失敗狀態做出適當的回應。">StatusPages 外掛程式</Links>在 Ktor 應用程式中處理錯誤。
            </p>
            <tip>
                此外掛程式預設不包含在專案中。你可以在使用 Ktor 專案產生器或 IntelliJ IDEA 中的專案精靈建立專案時，透過
                <ui-path>Plugins</ui-path>
                區段將其新增至專案中。
            </tip>
            <p>
                在接下來的步驟中，你將學習如何手動新增和設定該外掛程式。實現此目的有四個步驟：
            </p>
            <list type="decimal">
                <li><a href="#add-dependency">在 Gradle 組建檔案中新增相依性。</a></li>
                <li><a href="#install-plugin-and-specify-handler">安裝外掛程式並指定例外處理常式。</a></li>
                <li><a href="#write-sample-code">撰寫範例程式碼以觸發處理常式。</a></li>
                <li><a href="#restart-and-invoke">重新啟動並叫用範例程式碼。</a></li>
            </list>
            <procedure title="新增相依性" id="add-dependency">
                <p>在
                    <control>Project</control>
                    工具視窗中，瀏覽至專案根資料夾並遵循以下步驟：
                </p>
                <step>
                    <p>開啟 <Path>build.gradle.kts</Path> 檔案並新增相依性，如下所示：</p>
                    <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.server.config.yaml)&#10;    implementation(ktorLibs.server.core)&#10;    implementation(ktorLibs.server.netty)&#10;    // Add new dependency&#10;    implementation(ktorLibs.server.statusPages)&#10;    implementation(libs.logback.classic)&#10;&#10;    testImplementation(libs.kotlin.test)&#10;    testImplementation(ktorLibs.server.testHost)&#10;}"/>
                </step>
                <step>
                    <p>按下
                        <shortcut>Shift+⌘Cmd+I</shortcut>（macOS）或
                        <shortcut>Ctrl+Shift+O</shortcut>（Windows/Linux）以重新載入專案。
                    </p>
                </step>
            </procedure>
            <procedure title="安裝外掛程式並指定例外處理常式"
                       id="install-plugin-and-specify-handler">
                <step>
                    <p>瀏覽至 <Path>Routing.kt</Path> 中的 <code>.configureRouting()</code> 方法並新增以下幾行程式碼：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;    }&#10;}"/>
                    <p>這幾行安裝了 <code>StatusPages</code> 外掛程式，並指定擲回 <code>IllegalStateException</code> 型別的例外時要採取的動作。</p>
                </step>
                <step>
                    <p>新增以下匯入：</p>
                    <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.StatusPages"/>
                </step>
            </procedure>
            <p>
                請注意，通常會在回應中設定 HTTP 錯誤代碼，但出於此任務的目的，輸出直接顯示在瀏覽器中。
            </p>
            <procedure title="撰寫範例程式碼以觸發處理常式" id="write-sample-code">
                <step>
                    <p>保留在 <code>.configureRouting()</code> 方法中，新增額外的路由，如下所示：</p>
                    <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        // ...&#10;&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>你現在已經新增了一個 URL 為 <code>/error-test</code> 的端點。當觸發此端點時，將擲回具有處理常式中所使用型別的例外。</p>
                </step>
            </procedure>
            <procedure title="重新啟動並叫用範例程式碼" id="restart-and-invoke">
                <step>
                    <p>點擊重新執行按鈕（<img alt="IntelliJ IDEA 重新執行按鈕圖示"
                                                       src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新啟動應用程式。</p></step>
                <step>
                    <p>在瀏覽器中，前往 URL <a href="http://0.0.0.0:9292/error-test">http://0.0.0.0:9292/error-test</a>。你應該會看到如下所示的錯誤訊息：</p>
                    <img src="server_get_started_register_error_handler_output.png"
                         alt="顯示訊息「App in illegal state as Too Busy」的瀏覽器畫面" width="706"/>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="後續步驟" id="next_steps">
        <p>
            如果你已經完成了所有其他任務，現在應該已經掌握了配置 Ktor 伺服器、整合 Ktor 外掛程式以及實作新路由的方法。然而，這只是一個開始。若要進一步深入探索 Ktor 的基礎概念，請繼續閱讀本指南中的下一篇教學。
        </p>
        <p>
            接下來，你將學習如何透過<Links href="server-requests-and-responses.topic" summary="透過建置工作管理員應用程式，學習在 Kotlin 中使用 Ktor 進行路由、處理請求和參數的基本知識。">建立工作管理員應用程式來處理請求並產生回應</Links>。
        </p>
    </chapter>
</topic>