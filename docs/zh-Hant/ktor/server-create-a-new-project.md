<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="建立、開啟及執行新的 Ktor 專案"
       id="server-create-a-new-project"
       help-id="server_create_a_new_project">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-get-started"/>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    學習如何使用 Ktor 開啟、執行及測試伺服器應用程式。
</link-summary>
<web-summary>
    開始建置您的第一個 Ktor 伺服器應用程式。在本教學中，您將學習如何建立、開啟及執行新的 Ktor 專案。
</web-summary>
<p>
    在本教學中，您將學習如何建立、開啟及執行您的第一個 Ktor 伺服器專案。一旦啟動並運行，您可以嘗試一系列任務來熟悉
    Ktor。
</p>
<p>
    這是系列教學中的第一個，旨在協助您開始
    使用 Ktor 建置伺服器應用程式。您可以獨立完成每個教學，
    但是，我們強烈建議您遵循建議的順序：
</p>
<list type="decimal">
    <li>建立、開啟及執行新的 Ktor 專案。</li>
    <li><Links href="/ktor/server-requests-and-responses" summary="透過建置任務管理器應用程式，使用 Kotlin 和 Ktor 學習路由、處理請求和參數的基礎知識。">處理請求並產生回應</Links>。</li>
    <li><Links href="/ktor/server-create-restful-apis" summary="學習如何使用 Kotlin 和 Ktor 建置後端服務，其中包含一個產生 JSON 檔案的 RESTful API 範例。">建立產生 JSON 的 RESTful API</Links>。</li>
    <li><Links href="/ktor/server-create-website" summary="學習如何使用 Kotlin 和 Ktor 以及 Thymeleaf 模板建置網站。">使用 Thymeleaf 模板建立網站</Links>。</li>
    <li><Links href="/ktor/server-create-websocket-application" summary="學習如何利用 WebSocket 的強大功能來傳送和接收內容。">建立 WebSocket 應用程式</Links>。</li>
    <li><Links href="/ktor/server-integrate-database" summary="學習使用 Exposed SQL Library 將 Ktor 服務連接到資料庫儲存庫的過程。">整合資料庫與 Exposed</Links>。</li>
</list>
<chapter id="create-project" title="建立新的 Ktor 專案">
    <p>
        建立新的 Ktor 專案最快的方法之一是<a href="#create-project-with-the-ktor-project-generator">使用
        基於網頁的 Ktor 專案產生器</a>。
    </p>
    <p>
        或者，您可以
        <a href="#create_project_with_intellij">使用 IntelliJ IDEA Ultimate 專用的 Ktor 外掛程式</a>
        或
        <a href="#create_project_with_ktor_cli_tool">Ktor CLI 工具</a>產生專案。
    </p>
    <chapter title="使用 Ktor 專案產生器"
             id="create-project-with-the-ktor-project-generator">
        <p>
            要使用 Ktor 專案產生器建立新專案，請遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>導覽至 <a href="https://start.ktor.io/">Ktor 專案產生器</a>。</p>
            </step>
            <step>
                <p>在
                    <control>Project artifact</control>
                    欄位中，輸入
                    <Path>com.example.ktor-sample-app</Path>
                    作為您的專案成品名稱。
                    <img src="ktor_project_generator_new_project_artifact_name.png"
                         alt="Ktor 專案產生器，專案成品名稱為 org.example.ktor-sample-app"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>點擊
                    <control>Configure</control>
                    以開啟設定下拉式選單：
                    <img src="ktor_project_generator_new_project_configure.png"
                         style="block"
                         alt="Ktor 專案設定的展開視圖" border-effect="line" width="706"/>
                </p>
                <p>
                    以下設定可用：
                </p>
                <list>
                    <li>
                        <p>
                            <control>Build System</control>
                            ：
                            選擇所需的<Links href="/ktor/server-dependencies" summary="學習如何將 Ktor 伺服器依賴項新增到現有 Gradle/Maven 專案。">建置系統</Links>。
                            這可以是
                            <emphasis>Gradle</emphasis>
                            使用 Kotlin 或 Groovy DSL，或者
                            <emphasis>Maven</emphasis>
                            。
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
                            <control>Engine</control>
                            ：
                            選擇用於執行伺服器的<Links href="/ktor/server-engines" summary="了解處理網路請求的引擎。">引擎</Links>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Configuration</control>
                            ：
                            選擇是
                            在<Links href="/ktor/server-configuration-file" summary="學習如何在設定檔中配置各種伺服器參數。">YAML 或 HOCON 檔案中</Links>指定伺服器參數，還是
                            <Links href="/ktor/server-configuration-code" summary="學習如何在程式碼中配置各種伺服器參數。">在程式碼中</Links>指定。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Include samples</control>
                            ：
                            保持此選項啟用以新增外掛程式範例程式碼。
                        </p>
                    </li>
                </list>
                <p>對於本教學，您可以將這些設定保留為預設值。</p>
            </step>
            <step>
                <p>點擊
                    <control>Done</control>
                    以儲存設定並關閉選單。
                </p>
            </step>
            <step>
                <p>下方您會找到一組可新增至專案的<Links href="/ktor/server-plugins" summary="外掛程式提供通用功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>。外掛程式是建置區塊，在 Ktor 應用程式中提供通用功能，
                    例如認證、序列化和內容編碼、壓縮、Cookie 支援等。
                </p>
                <p>對於本教學，您目前無需新增任何外掛程式。</p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Download</control>
                    按鈕以產生並下載您的 Ktor 專案。
                    <img src="ktor_project_generator_new_project_download.png"
                         alt="Ktor 專案產生器下載按鈕"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <p>您的下載應該會自動開始。</p>
        </procedure>
        <p>既然您已產生了一個新專案，請繼續<a href="#unpacking">解壓縮並執行您的 Ktor
            專案</a>。</p>
    </chapter>
    <chapter title="使用 IntelliJ IDEA Ultimate 的 Ktor 外掛程式" id="create_project_with_intellij"
             collapsible="true">
        <p>
            本節介紹如何使用 IntelliJ IDEA Ultimate 的 <a
                href="https://plugins.jetbrains.com/plugin/16008-ktor">Ktor 外掛程式</a>進行專案設定。
        </p>
        <p>
            要建立新的 Ktor 專案，
            <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">開啟 IntelliJ IDEA</a>，並
            遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>
                    在歡迎畫面，點擊 <control>New Project</control>。
                </p>
                <p>
                    否則，從主選單中選擇 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>New Project</control>
                    精靈中，從左側列表中選擇
                    <control>Ktor</control>
                    。
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
                            <control>Name</control>
                            ：
                            指定專案名稱。輸入
                            <Path>ktor-sample-app</Path>
                            作為您的專案名稱。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Location</control>
                            ：
                            指定專案的目錄。
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
                            此欄位顯示產生的成品名稱。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Engine</control>
                            ：
                            選擇用於執行伺服器的<Links href="/ktor/server-engines" summary="了解處理網路請求的引擎。">引擎</Links>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Include samples</control>
                            ：
                            保持此選項啟用以新增外掛程式範例程式碼。
                        </p>
                    </li>
                </list>
            </step>
            <step>
                <p>
                    點擊
                    <control>Advanced Settings</control>
                    以展開
                    附加設定選單：
                </p>
                <img src="ktor_idea_new_project_advanced_settings.png" alt="Ktor 專案進階設定"
                     width="706" border-effect="rounded"/>
                <p>
                    以下設定可用：
                </p>
                <list>
                    <li>
                        <p>
                            <control>Build System</control>
                            ：
                            選擇所需的<Links href="/ktor/server-dependencies" summary="學習如何將 Ktor 伺服器依賴項新增到現有 Gradle/Maven 專案。">建置系統</Links>。
                            這可以是
                            <emphasis>Gradle</emphasis>
                            使用 Kotlin 或 Groovy DSL，或者
                            <emphasis>Maven</emphasis>
                            。
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
                            選擇是
                            在<Links href="/ktor/server-configuration-file" summary="學習如何在設定檔中配置各種伺服器參數。">YAML 或 HOCON 檔案中</Links>指定伺服器參數，還是
                            <Links href="/ktor/server-configuration-code" summary="學習如何在程式碼中配置各種伺服器參數。">在程式碼中</Links>指定。
                        </p>
                    </li>
                </list>
                <p>對於本教學，您可以將這些設定保留為預設值。</p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Next</control>
                    以進入下一頁。
                </p>
                <img src="ktor_idea_new_project_plugins_list.png" alt="Ktor 外掛程式" width="706"
                     border-effect="rounded"/>
                <p>
                    在此頁面，您可以選擇一組<Links href="/ktor/server-plugins" summary="外掛程式提供通用功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links> -
                    提供 Ktor 應用程式通用功能的建置區塊，例如
                    認證、序列化和內容編碼、壓縮、Cookie 支援等。
                </p>
                <p>對於本教學，您目前無需新增任何外掛程式。</p>
            </step>
            <step>
                <p>
                    點擊
                    <control>Create</control>
                    並等待 IntelliJ IDEA 產生專案並
                    安裝依賴項。
                </p>
            </step>
        </procedure>
        <p>
            現在您已經建立了一個新專案，請繼續學習如何<a href="#open-explore-run">開啟、
            探索及執行</a>應用程式。
        </p>
    </chapter>
    <chapter title="使用 Ktor CLI 工具" id="create_project_with_ktor_cli_tool"
             collapsible="true">
        <p>
            本節介紹如何使用
            <a href="https://github.com/ktorio/ktor-cli">Ktor CLI 工具</a>進行專案設定。
        </p>
        <p>
            要建立新的 Ktor 專案，請開啟您選擇的終端機並
            遵循以下步驟：
        </p>
        <procedure>
            <step>
                使用以下其中一個命令安裝 Ktor CLI 工具：
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
                要在互動模式下產生新專案，請使用以下命令：
                <code-block lang="console" code="                      ktor new"/>
            </step>
            <step>
                輸入
                <Path>ktor-sample-app</Path>
                作為您的專案名稱：
                <img src="server_create_cli_tool_name_dark.png"
                     alt="在互動模式下使用 Ktor CLI 工具"
                     border-effect="rounded"
                     style="block"
                     width="706"/>
                <p>
                    (選用) 您也可以透過編輯專案名稱下方的
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
                在下一步中，您可以搜尋並新增<Links href="/ktor/server-plugins" summary="外掛程式提供通用功能，例如序列化、內容編碼、壓縮等。">外掛程式</Links>至您的
                專案。外掛程式是建置區塊，在 Ktor 應用程式中提供通用功能，
                例如認證、序列化和內容編碼、壓縮、Cookie 支援等。
                <img src="server_create_cli_tool_add_plugins_dark.png"
                     alt="使用 Ktor CLI 工具為專案新增外掛程式"
                     border-effect="rounded"
                     style="block"
                     width="706"/>
                <p>對於本教學，您目前無需新增任何外掛程式。</p>
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
<chapter title="解壓縮並執行您的 Ktor 專案" id="unpacking">
    <p>
        在本節中，您將學習如何從命令列解壓縮、建置並執行專案。以下描述
        假設：
    </p>
    <list type="bullet">
        <li>您已建立並下載了一個名為
            <Path>ktor-sample-app</Path>
            的專案。
        </li>
        <li>它已放置在您主目錄中一個名為
            <Path>myprojects</Path>
            的資料夾中。
        </li>
    </list>
    <p>如有必要，請更改名稱和路徑以符合您自己的設定。</p>
    <p>開啟您選擇的命令列工具並遵循以下步驟：</p>
    <procedure>
        <step>
            <p>在終端機中，導覽至您下載專案的資料夾：</p>
            <code-block lang="console" code="                    cd ~/myprojects"/>
        </step>
        <step>
            <p>將 ZIP 壓縮檔解壓縮到同名資料夾中：</p>
            <tabs>
                <tab title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            unzip ktor-sample-app.zip -d ktor-sample-app"/>
                </tab>
                <tab title="Windows" group-key="windows">
                    <code-block lang="console" code="                            tar -xf ktor-sample-app.zip"/>
                </tab>
            </tabs>
            <p>您的目錄現在將包含 ZIP 壓縮檔和解壓縮的資料夾。</p>
        </step>
        <step>
            <p>從目錄中，導覽至新建立的資料夾：</p>
            <code-block lang="console" code="                    cd ktor-sample-app"/>
        </step>
        <step>
            <p>在 macOS/UNIX 系統上，您需要使 gradlew Gradle 輔助腳本可執行。為此，請使用 <code>chmod</code> 命令：</p>
            <tabs>
                <tab title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            chmod +x ./gradlew"/>
                </tab>
            </tabs>
        </step>
        <step>
            <p>要建置專案，請使用以下命令：</p>
            <tabs>
                <tab title="macOS" group-key="macOS">
                    <code-block lang="console" code="                            ./gradlew build"/>
                </tab>
                <tab title="Windows" group-key="windows">
                    <code-block lang="console" code="                            gradlew build"/>
                </tab>
            </tabs>
            <p>如果您看到建置成功，則可以再次透過 Gradle 執行專案。</p>
        </step>
        <step>
            <p>要執行專案，請使用以下命令：</p>
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
            <p>要驗證專案是否正在運行，請在輸出中提及的 URL ([http://0.0.0.0:8080](http://0.0.0.0:8080)) 開啟瀏覽器。
                您應該會在螢幕上看到「Hello World!」訊息：</p>
            <img src="server_get_started_ktor_sample_app_output.png" alt="產生的 Ktor 專案輸出"
                 border-effect="line" width="706"/>
        </step>
    </procedure>
    <p>恭喜！您已成功啟動您的 Ktor 專案。</p>
    <p>請注意，命令列無回應，因為底層程序正在忙於運行 Ktor
        應用程式。您可以按下
        <shortcut>CTRL+C</shortcut>
        以終止應用程式。
    </p>
</chapter>
<chapter title="在 IntelliJ IDEA 中開啟、探索並執行您的 Ktor 專案" id="open-explore-run">
    <chapter title="開啟專案" id="open">
        <p>如果您已安裝 <a href="https://www.jetbrains.com/idea/">IntelliJ IDEA</a>，您可以輕鬆地從命令列開啟
            專案。
        </p>
        <p>
            請確保您位於專案資料夾中，然後輸入 <code>idea</code> 命令，後跟一個句點以表示當前
            資料夾：
        </p>
        <code-block lang="Bash" code="                idea ."/>
        <p>
            或者，要手動開啟專案，請啟動 IntelliJ IDEA。
        </p>
        <p>
            如果歡迎畫面開啟，請點擊
            <control>Open</control>
            。否則，從主選單中進入
            <ui-path>File | Open</ui-path>
            並選擇
            <Path>ktor-sample-app</Path>
            資料夾以開啟它。
        </p>
        <tip>
            有關管理專案的更多詳細資訊，
            請參閱<a href="https://www.jetbrains.com/help/idea/creating-and-managing-projects.html">IntelliJ IDEA
            文件</a>。
        </tip>
    </chapter>
    <chapter title="探索專案" id="explore">
        <p>無論您選擇哪種選項，專案都應如下圖所示開啟：</p>
        <img src="server_get_started_idea_project_view.png" alt="IDE 中產生的 Ktor 專案視圖" width="706"/>
        <p>
            為了說明專案佈局，我們在
            <control>Project</control>
            視圖中展開了結構，並選擇了
            <Path>settings-gradle.kts</Path>
            檔案。
        </p>
        <p>
            您將看到執行應用程式的程式碼位於
            <Path>src/main/kotlin</Path>
            下的套件中。預設套件名為
            <Path>com.example</Path>
            並包含一個名為
            <Path>plugins</Path>
            的子套件。
            這兩個套件中已建立兩個檔案，名為
            <Path>Application.kt</Path>
            和
            <Path>Routing.kt</Path>
        </p>
        <img src="server_get_started_idea_main_folder.png" alt="Ktor 專案 src 資料夾結構" width="400"/>
        <p>專案的名稱在
            <Path>settings-gradle.kts</Path>
            中配置。
        </p>
        <img src="server_get_started_idea_settings_file.png" alt="settings.gradle.kt 的內容" width="706"/>
        <p>
            設定檔和其他類型內容位於
            <Path>src/main/resources</Path>
            資料夾中。
        </p>
        <img src="server_get_started_idea_resources_folder.png" alt="Ktor 專案 resources 資料夾結構"
             width="400"/>
        <p>
            在
            <Path>src/test/kotlin</Path>
            下的一個套件中已建立一個骨架測試。
        </p>
        <img src="server_get_started_idea_test_folder.png" alt="Ktor 專案 test 資料夾結構" width="400"/>
    </chapter>
    <chapter title="執行專案" id="run">
        <procedure>
            <p>要從 IntelliJ IDEA 內部執行專案：</p>
            <step>
                <p>透過點擊右側邊欄上的 Gradle 圖示（<img alt="intelliJ IDEA gradle icon"
                                                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>）
                    開啟<a href="https://www.jetbrains.com/help/idea/jetgradle-tool-window.html">Gradle 工具視窗</a>
                    。</p>
                <img src="server_get_started_idea_gradle_tab.png" alt="IntelliJ IDEA 中的 Gradle 標籤"
                     border-effect="line" width="706"/>
            </step>
            <step>
                <p>在此工具視窗內導覽至
                    <ui-path>Tasks | application</ui-path>
                    並雙擊
                    <control>run</control>
                    任務。
                </p>
                <img src="server_get_started_idea_gradle_run.png" alt="IntelliJ IDEA 中的 Gradle 標籤"
                     border-effect="line" width="450"/>
            </step>
            <step>
                <p>您的 Ktor 應用程式將在 IDE 底部的<a
                        href="https://www.jetbrains.com/help/idea/run-tool-window.html">執行工具視窗</a>中啟動：</p>
                <img src="server_get_started_idea_run_terminal.png" alt="專案在終端機中執行" width="706"/>
                <p>之前在命令列上顯示的相同訊息現在將在
                    <ui-path>Run</ui-path>
                    工具視窗中可見。
                </p>
            </step>
            <step>
                <p>要確認專案正在運行，請在指定的 URL ([http://0.0.0.0:8080](http://0.0.0.0:8080)) 開啟瀏覽器。</p>
                <p>您應該會再次在螢幕上看到「Hello World!」訊息：</p>
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
                                                         alt="intelliJ IDEA terminate icon"/>
            </li>
            <li>
                要重新啟動程序，請點擊重新執行按鈕 <img src="intellij_idea_rerun_icon.svg"
                                                         style="inline" height="16" width="16"
                                                         alt="intelliJ IDEA rerun icon"/>
            </li>
        </list>
        <p>
            這些選項在<a href="https://www.jetbrains.com/help/idea/run-tool-window.html#run-toolbar">IntelliJ IDEA 執行
            工具視窗文件</a>中有進一步解釋。
        </p>
    </chapter>
</chapter>
<chapter title="要嘗試的其他任務" id="additional-tasks">
    <p>以下是一些您可能希望嘗試的其他任務：</p>
    <list type="decimal">
        <li><a href="#change-the-default-port">更改預設埠。</a></li>
        <li><a href="#change-the-port-via-yaml">透過 YAML 更改埠。</a></li>
        <li><a href="#add-a-new-http-endpoint">新增一個 HTTP 端點。</a></li>
        <li><a href="#configure-static-content">配置靜態內容。</a></li>
        <li><a href="#write-an-integration-test">撰寫整合測試。</a></li>
        <li><a href="#register-error-handlers">註冊錯誤處理程式。</a></li>
    </list>
    <p>
        這些任務彼此獨立，但複雜度逐漸增加。按聲明的順序嘗試它們是
        逐步學習的最簡單方法。為了簡化並避免重複，以下描述
        假設您按順序嘗試這些任務。
    </p>
    <p>
        需要編碼時，我們已指定了程式碼和相應的匯入。IDE 可能會自動為您
        新增這些匯入。
    </p>
    <chapter title="更改預設埠" id="change-the-default-port">
        <p>
            在
            <ui-path>Project</ui-path>
            視圖中，導覽至
            <Path>src/main/kotlin</Path>
            資料夾，然後進入為您建立的單一套件，並遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>開啟
                    <Path>Application.kt</Path>
                    檔案。您應該會找到類似以下的程式碼：
                </p>
                <code-block lang="kotlin" code="                        fun main() {&#10;                            embeddedServer(&#10;                                Netty,&#10;                                port = 8080, // This is the port on which Ktor is listening&#10;                                host = &quot;0.0.0.0&quot;,&#10;                                module = Application::module&#10;                            ).start(wait = true)&#10;                        }&#10;&#10;                        fun Application.module() {&#10;                            configureRouting()&#10;                        }"/>
            </step>
            <step>
                <p>在 <code>embeddedServer()</code> 函數中，將 <code>port</code> 參數更改
                    為您選擇的另一個數字，例如「9292」。</p>
                <code-block lang="kotlin" code="                        fun main() {&#10;                            embeddedServer(&#10;                                Netty,&#10;                                port = 9292,&#10;                                host = &quot;0.0.0.0&quot;,&#10;                                module = Application::module&#10;                            ).start(wait = true)&#10;                        }"/>
            </step>
            <step>
                <p>點擊重新執行按鈕（<img alt="intelliJ IDEA rerun button icon"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>要驗證您的應用程式是否在新的埠號下運行，您可以在新的 URL ([http://0.0.0.0:9292](http://0.0.0.0:9292)) 開啟瀏覽器，或者
                    <a href="https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html#creating-http-request-files">在 IntelliJ IDEA 中建立一個新的 HTTP 請求檔案</a>：</p>
                <img src="server_get_started_port_change.png"
                     alt="在 IntelliJ IDEA 中使用 HTTP 請求檔案測試埠更改" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="透過 YAML 更改埠" id="change-the-port-via-yaml">
        <p>
            建立新的 Ktor 專案時，您可以選擇將配置外部儲存，可以是 YAML 或
            HOCON 檔案：
        </p>
        <img src="ktor_project_generator_configuration_options.png" width="400"
             alt="Ktor 專案產生器配置選項"/>
        <p>
            如果您選擇外部儲存配置，那麼
            <Path>Application.kt</Path>
            中的程式碼將是：
        </p>
        <code-block lang="kotlin" code="                fun main(args: Array&lt;String&gt;): Unit =&#10;                    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;                @Suppress(&quot;unused&quot;)&#10;                fun Application.module() {&#10;                    configureRouting()&#10;                }"/>
        <p>
            這些將是儲存在
            <Path>src/main/resources/</Path>
            中設定檔中的值：
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
            在這種情況下，您無需更改任何程式碼即可更改埠號。只需更改 YAML 或 HOCON
            檔案中的值並重新啟動應用程式即可。更改可以與上方<a href="#change-the-default-port">更改預設埠</a>
            相同的方式進行驗證。
        </p>
    </chapter>
    <chapter title="新增一個 HTTP 端點" id="add-a-new-http-endpoint">
        <p>接下來，您將建立一個新的 HTTP 端點，它將回應 GET 請求。</p>
        <p>
            在
            <ui-path>Project</ui-path>
            工具視窗中，導覽至
            <Path>src/main/kotlin/com/example</Path>
            資料夾並遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>開啟
                    <Path>Application.kt</Path>
                    檔案並找到 <code>configureRouting()</code> 函數。
                </p>
            </step>
            <step>
                <p>在 IntelliJ IDEA 中，將游標置於函數名稱上並按下
                    <shortcut>⌘Cmd+B</shortcut>
                    ，導覽至 <code>configureRouting()</code> 函數。
                </p>
                <p>或者，您可以透過開啟 <code>Routing.kt</code> 檔案導覽至該函數。</p>
                <p>這是您應該看到的程式碼：</p>
                <code-block lang="Kotlin" validate="true" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
            </step>
            <step>
                <p>要建立一個新端點，請插入以下額外五行程式碼：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;&#10;        get(&quot;/test1&quot;) {&#10;            val text = &quot;&lt;h1&gt;Hello From Ktor&lt;/h1&gt;&quot;&#10;            val type = ContentType.parse(&quot;text/html&quot;)&#10;            call.respondText(text, type)&#10;        }&#10;    }&#10;}"/>
                <p>請注意，您可以將 <code>/test1</code> URL 更改為您喜歡的任何內容。</p>
            </step>
            <step>
                <p>為了使用 <code>ContentType</code>，請新增以下匯入：</p>
                <code-block lang="kotlin" code="                        import io.ktor.http.*"/>
            </step>
            <step>
                <p>點擊重新執行按鈕（<img alt="intelliJ IDEA rerun button icon"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>在瀏覽器中請求新的 URL ([http://0.0.0.0:9292/test1](http://0.0.0.0:9292/test1))。您應該使用的埠號將取決於您是否已嘗試第一個任務（<a
                                href="#change-the-default-port">更改預設埠</a>）。您應該會看到
                        如下圖所示的輸出：</p>
                <img src="server_get_started_add_new_http_endpoint_output.png"
                     alt="顯示「Hello from Ktor」的瀏覽器畫面" width="706"/>
                <p>如果您已建立 HTTP 請求檔案，您也可以在那裡驗證新端點：</p>
                <img src="server_get_started_add_new_http_endpoint.png" alt="IntelliJ IDEA 中的 HTTP 請求檔案"
                     width="450"/>
                <p>請注意，需要一行包含三個井字號 (###) 來分隔不同的請求。</p>
            </step>
        </procedure>
    </chapter>
    <chapter title="配置靜態內容" id="configure-static-content">
        <p>在
            <ui-path>Project</ui-path>
            工具視窗中，導覽至
            <Path>src/main/kotlin/com/example/plugins</Path>
            資料夾並遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>開啟 <code>Routing.kt</code> 檔案。</p>
                <p>這應該是預設內容：</p>
                <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                <p>對於此任務，無論您是否已插入
                    <a href="#add-a-new-http-endpoint">新增 HTTP 端點</a>中指定
                    的額外端點內容，都無關緊要。</p>
            </step>
            <step>
                <p>在路由區段中新增以下行：</p>
                <code-block lang="kotlin" code="                        fun Application.configureRouting() {&#10;                            routing {&#10;                                // Add the line below&#10;                                staticResources(&quot;/content&quot;, &quot;mycontent&quot;)&#10;&#10;                                get(&quot;/&quot;) {&#10;                                    call.respondText(&quot;Hello World!&quot;)&#10;                                }&#10;                            }&#10;                        }"/>
                <p>這行的含義如下：</p>
                <list type="bullet">
                    <li>呼叫 <code>staticResources()</code> 告訴 Ktor 我們希望應用程式能夠提供標準網站內容，例如
                        HTML 和 JavaScript 檔案。儘管這些內容可能在瀏覽器中執行，但從
                        伺服器的角度來看，它被認為是靜態的。
                    </li>
                    <li>URL <code>/content</code> 指定應用程式應該用於獲取此內容的路徑。
                    </li>
                    <li>路徑 <code>mycontent</code> 是靜態內容將所在的資料夾名稱。Ktor 將在 <code>resources</code>
                        目錄中尋找此資料夾。
                    </li>
                </list>
            </step>
            <step>
                <p>新增以下匯入：</p>
                <code-block lang="kotlin" code="                        import io.ktor.server.http.content.*"/>
            </step>
            <step>
                <p>在
                    <control>Project</control>
                    工具視窗中，右鍵點擊 <code>src/main/resources</code> 資料夾並選擇
                    <control>New | Directory</control>
                    。
                </p>
                <p>或者，選擇 <code>src/main/resources</code> 資料夾，按下
                    <shortcut>⌘Cmd+N</shortcut>
                    ，然後點擊
                    <control>Directory</control>
                    。
                </p>
            </step>
            <step>
                <p>將新目錄命名為 <code>mycontent</code> 並按下
                    <shortcut>↩Enter</shortcut>
                    。
                </p>
            </step>
            <step>
                <p>右鍵點擊新建立的資料夾並點擊
                    <control>New | File</control>
                    。
                </p>
            </step>
            <step>
                <p>將新檔案命名為「sample.html」並按下
                    <shortcut>↩Enter</shortcut>
                    。
                </p>
            </step>
            <step>
                <p>使用有效的 HTML 填充新建立的檔案頁面，例如：</p>
                <code-block lang="html" code="&lt;html lang=&quot;en&quot;&gt;&#10;    &lt;head&gt;&#10;        &lt;meta charset=&quot;UTF-8&quot; /&gt;&#10;        &lt;title&gt;My sample&lt;/title&gt;&#10;    &lt;/head&gt;&#10;    &lt;body&gt;&#10;        &lt;h1&gt;This page is built with:&lt;/h1&gt;&#10;    &lt;ol&gt;&#10;        &lt;li&gt;Ktor&lt;/li&gt;&#10;        &lt;li&gt;Kotlin&lt;/li&gt;&#10;        &lt;li&gt;HTML&lt;/li&gt;&#10;    &lt;/ol&gt;&#10;    &lt;/body&gt;&#10;&lt;/html&gt;"/>
            </step>
            <step>
                <p>點擊重新執行按鈕（<img alt="intelliJ IDEA rerun button icon"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）
                    以重新啟動應用程式。</p>
            </step>
            <step>
                <p>當您在 [http://0.0.0.0:9292/content/sample.html](http://0.0.0.0:9292/content/sample.html) 開啟瀏覽器時，您樣本頁面的內容應該會顯示：</p>
                <img src="server_get_started_configure_static_content_output.png"
                     alt="瀏覽器中靜態頁面的輸出" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="撰寫整合測試" id="write-an-integration-test">
        <p>
            Ktor 提供對<Links href="/ktor/server-testing" summary="學習如何使用特殊的測試引擎測試您的伺服器應用程式。">建立整合測試</Links>的支援，並且您產生的
            專案捆綁了此功能。
        </p>
        <p>要使用此功能，請遵循以下步驟：</p>
        <procedure>
            <step>
                <p>
                    在
                    <Path>src</Path>
                    下建立一個名為「test」的新目錄，並在其中建立一個名為「kotlin」的子目錄。
                </p>
            </step>
            <step>
                <p>在
                    <Path>src/test/kotlin</Path>
                    內建立一個名為「com.example」的新套件。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>src/test/kotlin/com.example</Path>
                    內建立一個名為「ApplicationTest.kt」的新檔案。
                </p>
            </step>
            <step>
                <p>開啟 <code>ApplicationTest.kt</code> 檔案並新增以下程式碼：</p>
                <code-block lang="kotlin" code="                        class ApplicationTest {&#10;&#10;                            @Test&#10;                            fun testRoot() = testApplication {&#10;                                application {&#10;                                    module()&#10;                                }&#10;                                val response = client.get(&quot;/&quot;)&#10;&#10;                                assertEquals(HttpStatusCode.OK, response.status)&#10;                                assertEquals(&quot;Hello World!&quot;, response.bodyAsText())&#10;                            }&#10;                        }"/>
                <p><code>testApplication()</code> 方法建立一個新的 Ktor 實例。此實例在測試環境中運行，
                    而不是像 Netty 這樣的伺服器。</p>
                <p>然後，您可以使用 <code>application()</code> 方法調用與從
                    <code>embeddedServer()</code> 呼叫的相同設定。</p>
                <p>最後，您可以使用內建的 <code>client</code> 物件和 JUnit 斷言來發送範例請求並檢查回應。</p>
            </step>
            <step>
                <p>新增以下所需匯入：</p>
                <code-block lang="kotlin" code="                        import io.ktor.client.request.*&#10;                        import io.ktor.client.statement.*&#10;                        import io.ktor.http.*&#10;                        import io.ktor.server.testing.*&#10;                        import org.junit.Assert.assertEquals&#10;                        import org.junit.Test"/>
            </step>
        </procedure>
        <p>
            測試可以在 IntelliJ IDEA 中執行測試的任何標準方式運行。請注意，因為
            您正在運行 Ktor 的新實例，所以測試的成功或失敗不取決於您的應用程式是否正在
            0.0.0.0 運行。
        </p>
        <p>
            如果您已成功完成<a href="#add-a-new-http-endpoint">新增 HTTP 端點</a>，
            您應該能夠新增此額外測試：
        </p>
        <code-block lang="Kotlin" code="                @Test&#10;                fun testNewEndpoint() = testApplication {&#10;                    application {&#10;                        module()&#10;                    }&#10;&#10;                    val response = client.get(&quot;/test1&quot;)&#10;&#10;                    assertEquals(HttpStatusCode.OK, response.status)&#10;                    assertEquals(&quot;html&quot;, response.contentType()?.contentSubtype)&#10;                    assertContains(response.bodyAsText(), &quot;Hello From Ktor&quot;)&#10;                }"/>
        <p>需要以下額外匯入：</p>
        <code-block lang="Kotlin" code="                import kotlin.test.assertContains"/>
    </chapter>
    <chapter title="註冊錯誤處理程式" id="register-error-handlers">
        <p>
            您可以使用<Links href="/ktor/server-status-pages" summary="%plugin_name% 允許 Ktor 應用程式根據拋出的異常或狀態碼適當地回應任何失敗狀態。">StatusPages
            外掛程式</Links>在 Ktor 應用程式中處理錯誤。
        </p>
        <p>
            此外掛程式預設不包含在您的專案中。您可以透過 Ktor
            專案產生器中的<ui-path>Plugins</ui-path>
            部分，或 IntelliJ IDEA 中的專案精靈將其新增到您的專案中。由於您已建立專案，在接下來的步驟中
            您將學習如何手動新增和配置該外掛程式。
        </p>
        <p>
            為此有四個步驟：
        </p>
        <list type="decimal">
            <li><a href="#add-dependency">在 Gradle 建置檔案中新增依賴項。</a></li>
            <li><a href="#install-plugin-and-specify-handler">安裝外掛程式並指定異常
                處理程式。</a></li>
            <li><a href="#write-sample-code">撰寫範例程式碼以觸發處理程式。</a></li>
            <li><a href="#restart-and-invoke">重新啟動並呼叫範例程式碼。</a></li>
        </list>
        <procedure title="新增依賴項" id="add-dependency">
            <p>在
                <control>Project</control>
                工具視窗中，導覽至專案根資料夾並遵循以下步驟：
            </p>
            <step>
                <p>開啟 <code>build.gradle.kts</code> 檔案。</p>
            </step>
            <step>
                <p>在依賴項部分中新增額外依賴項，如下所示：</p>
                <code-block lang="kotlin" code="                        dependencies {&#10;                            // The new dependency to be added&#10;                            implementation(&quot;io.ktor:ktor-server-status-pages:$ktor_version&quot;)&#10;                            // The existing dependencies&#10;                            implementation(&quot;io.ktor:ktor-server-core-jvm:$ktor_version&quot;)&#10;                            implementation(&quot;io.ktor:ktor-server-netty-jvm:$ktor_version&quot;)&#10;                            implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                            testImplementation(&quot;io.ktor:ktor-server-test-host-jvm:$ktor_version&quot;)&#10;                            testImplementation(&quot;org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version&quot;)&#10;                        }"/>
                <p>完成此操作後，您需要重新載入專案以載入此新依賴項。</p>
            </step>
            <step>
                <p>在 macOS 上按
                    <shortcut>Shift+⌘Cmd+I</shortcut>
                    或在 Windows 上按
                    <shortcut>Ctrl+Shift+O</shortcut>
                    以重新載入專案。
                </p>
            </step>
        </procedure>
        <procedure title="安裝外掛程式並指定異常處理程式"
                   id="install-plugin-and-specify-handler">
            <step>
                <p>導覽至 <code>Routing.kt</code> 中的 <code>configureRouting()</code> 方法並新增以下程式碼行：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>這些行安裝 <code>StatusPages</code> 外掛程式並指定當拋出 <code>IllegalStateException</code> 類型的異常時要執行的動作。</p>
            </step>
            <step>
                <p>新增以下匯入：</p>
                <code-block lang="kotlin" code="                        import io.ktor.server.plugins.statuspages.*"/>
            </step>
        </procedure>
        <p>
            請注意，HTTP 錯誤代碼通常會在回應中設定，但為了
            本任務的目的，輸出直接顯示在瀏覽器中。
        </p>
        <procedure title="撰寫範例程式碼以觸發處理程式" id="write-sample-code">
            <step>
                <p>仍在 <code>configureRouting()</code> 方法中，新增以下額外行：</p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    install(StatusPages) {&#10;        exception&lt;IllegalStateException&gt; { call, cause -&gt;&#10;            call.respondText(&quot;App in illegal state as ${cause.message}&quot;)&#10;        }&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello World!&quot;)&#10;        }&#10;        get(&quot;/error-test&quot;) {&#10;            throw IllegalStateException(&quot;Too Busy&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>您現在已新增一個 URL 為 <code>/error-test</code> 的端點。當此端點被觸發時，將拋出一個
                    與處理程式中使用的類型相同的異常。</p>
            </step>
        </procedure>
        <procedure title="重新啟動並呼叫範例程式碼" id="restart-and-invoke">
            <step>
                <p>點擊重新執行按鈕（<img alt="intelliJ IDEA rerun button icon"
                                                   src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）
                    以重新啟動應用程式。</p></step>
            <step>
                <p>在您的瀏覽器中，導覽至 URL [http://0.0.0.0:9292/error-test](http://0.0.0.0:9292/error-test)。
                    您應該會看到如下圖所示的錯誤訊息：</p>
                <img src="server_get_started_register_error_handler_output.png"
                     alt="顯示訊息「App in illegal state as Too Busy」的瀏覽器畫面" width="706"/>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="後續步驟" id="next_steps">
    <p>
        如果您已完成這些額外任務，您現在應該已掌握配置 Ktor
        伺服器、整合 Ktor 外掛程式以及實作新路由。然而，這僅僅是個開始。要更深入地
        探索 Ktor 的基礎概念，請繼續本指南中的下一個教學。
    </p>
    <p>
        接下來，您將學習如何<Links href="/ktor/server-requests-and-responses" summary="透過建置任務管理器應用程式，使用 Kotlin 和 Ktor 學習路由、處理請求和參數的基礎知識。">透過建立任務管理器應用程式來處理請求並
        產生回應</Links>。
    </p>
</chapter>
</topic>