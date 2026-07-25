<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="自動重新載入 (Auto-reload)"
       id="server-auto-reload" help-id="Auto_reload">
    <tldr>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>,
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
        </p>
    </tldr>
    <link-summary>
        了解如何使用自動重新載入功能，在程式碼變更時重新載入應用程式類別。
    </link-summary>
    <p>
        在開發過程中 <Links href="//server-run" summary="了解如何執行伺服器端 Ktor 應用程式。">重新啟動</Links> 伺服器可能會耗費不少時間。
        Ktor 允許您透過使用 <emphasis>自動重新載入 (Auto-reload)</emphasis> 來克服此限制，它會在程式碼變更時重新載入應用程式類別，並提供快速的回饋循環。
        要使用自動重新載入，請遵循以下步驟：
    </p>
    <list style="decimal">
        <li>
            <p>
                <a href="#enable">啟用開發模式</a>
            </p>
        </li>
        <li>
            <p>
                （選用） <a href="#watch-paths">配置監控路徑</a>
            </p>
        </li>
        <li>
            <p>
                <a href="#recompile">在變更時啟用重新編譯</a>
            </p>
        </li>
    </list>
    <chapter title="限制" id="limitations">
        自動重新載入僅適用於特定的模組宣告。下表顯示了不同版本的支援情況：
        <table>
            
<tr>
<td>模組類型</td>
                <td>&lt;= 3.2</td>
                <td>&gt; 3.2</td>
</tr>

            
<tr>
<td>Lambda 初始設定式</td>
                <td>❌ 不支援</td>
                <td>❌ 不支援</td>
</tr>

            
<tr>
<td>阻塞函式參考 (Blocking function reference)</td>
                <td>✅ 已支援</td>
                <td>❌ 不支援</td>
</tr>

            
<tr>
<td>掛起函式參考 (Suspend function reference)</td>
                <td>❌ 不支援</td>
                <td>✅ 已支援</td>
</tr>

            
<tr>
<td>組態參考 (Config reference)</td>
                <td>✅ 已支援</td>
                <td>✅ 已支援</td>
</tr>

        </table>
        <chapter title="已支援" id="supported">
            <code-block lang="kotlin" code="                // 掛起函式參考&#10;                embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)&#10;&#10;                // 組態參考&#10;                ktor {&#10;                    application {&#10;                        modules = [ com.example.ApplicationKt.mySuspendModule ]&#10;                    }&#10;                }"/>
        </chapter>
        <chapter title="不支援" id="not-supported">
            <code-block lang="kotlin" code="                // Lambda&#10;                embeddedServer(Netty, port = 8080) { configureServer() }&#10;&#10;                // 阻塞函式參考&#10;                embeddedServer(Netty, port = 8080, module = Application::myBlockingModule)"/>
        </chapter>
    </chapter>
    <chapter title="啟用開發模式" id="enable">
        <p>
            要使用自動重新載入，您需要先啟用
            <a href="#enable">開發模式</a>。
            這取決於您 <Links href="//server-create-and-configure" summary="了解如何根據您的應用程式部署需求建立伺服器。">建立並執行伺服器</Links> 的方式：
        </p>
        <list>
            <li>
                <p>
                    如果您使用 <code>EngineMain</code> 來執行伺服器，請在 <a href="#application-conf">組態檔</a> 中啟用開發模式。
                </p>
            </li>
            <li>
                <p>
                    如果您使用 <code>embeddedServer</code> 執行伺服器，可以使用
                    <a href="#system-property"><code>io.ktor.development</code></a>
                    系統屬性。
                </p>
            </li>
        </list>
        <p>
            啟用開發模式後，Ktor 將會自動監控工作目錄中的輸出檔案。
            如有需要，您可以透過指定 <a href="#watch-paths">監控路徑</a> 來縮小監控資料夾的範圍。
        </p>
    </chapter>
    <chapter title="配置監控路徑" id="watch-paths">
        <p>
            當您 <a href="#enable">啟用</a> 開發模式時，
            Ktor 會開始監控工作目錄中的輸出檔案。
            例如，對於使用 Gradle 組建的 <Path>ktor-sample</Path> 專案，將會監控以下資料夾：
        </p>
        <code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
        <p>
            監控路徑允許您縮小監控資料夾的範圍。
            為此，您可以指定監控路徑的一部分。
            例如，要監控 <Path>ktor-sample/build/classes</Path> 子資料夾中的變更，
            請將 <code>classes</code> 作為監控路徑傳遞。
            根據您執行伺服器的方式，您可以透過以下方式指定監控路徑：
        </p>
        <list>
            <li>
                <p>
                    在 <Path>application.conf</Path> 或 <Path>application.yaml</Path> 檔案中，指定 <code>watch</code> 選項：
                </p>
                <Tabs group="config">
                    <TabItem title="application.conf" group-key="hocon">
                        <code-block code="ktor {&#10;    development = true&#10;    deployment {&#10;        watch = [ classes ]&#10;    }&#10;}"/>
                    </TabItem>
                    <TabItem title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="ktor:&#10;    development: true&#10;    deployment:&#10;        watch:&#10;            - classes"/>
                    </TabItem>
                </Tabs>
                <p>
                    您也可以指定多個監控路徑，例如：
                </p>
                <Tabs group="config">
                    <TabItem title="application.conf" group-key="hocon">
                        <code-block code="                            watch = [ classes, resources ]"/>
                    </TabItem>
                    <TabItem title="application.yaml" group-key="yaml">
                        <code-block lang="yaml" code="                            watch:&#10;                                - classes&#10;                                - resources"/>
                    </TabItem>
                </Tabs>
                <p>
                    您可以在此處找到完整的範例： <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>。
                </p>
            </li>
            <li>
                <p>
                    如果您使用的是 <code>embeddedServer</code>，請將監控路徑作為 <code>watchPaths</code> 參數傳遞：
                </p>
                <code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>
                    完整範例請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/autoreload-embedded-server">
                        autoreload-embedded-server
                    </a>
                    。
                </p>
            </li>
        </list>
    </chapter>
    <chapter title="在變更時重新編譯" id="recompile">
        <p>
            由於自動重新載入會偵測輸出檔案的變更，
            因此您需要重新組建專案。
            您可以在 IntelliJ IDEA 中手動執行此操作，或者
            使用 <code>-t</code> 命令列選項在 Gradle 中啟用持續建置執行。
        </p>
        <list>
            <li>
                <p>
                    要在 IntelliJ IDEA 中手動重新組建專案，從主選單中選擇
                    <ui-path>Build | Rebuild Project</ui-path>。
                </p>
            </li>
            <li>
                <p>
                    要使用 Gradle 自動重新組建專案，
                    您可以在終端中執行帶有 <code>-t</code> 選項的 <code>build</code> 任務：
                </p>
                <code-block lang="Bash" code="                    ./gradlew -t build"/>
                <tip>
                    <p>
                        要在重新載入專案時跳過執行測試，可以將 <code>-x</code> 選項傳遞給 <code>build</code> 任務：
                    </p>
                    <code-block lang="Bash" code="                        ./gradlew -t build -x test -i"/>
                </tip>
            </li>
        </list>
    </chapter>
</topic>