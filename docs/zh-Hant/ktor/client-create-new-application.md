<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="建立用戶端應用程式"
       id="client-create-new-application"
       help-id="getting_started_ktor_client;client-getting-started;client-get-started;client-create-a-new-application">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <var name="example_name" value="tutorial-client-get-started"/>
        <p>
            <b>程式碼範例</b>：
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
    </tldr>
    <link-summary>
        建立你的第一個用戶端應用程式，用於傳送請求並接收回應。
    </link-summary>
    <p>
        Ktor 包含一個多平台非同步 HTTP client，這讓你可以<Links href="//client-requests" summary="了解如何發送請求並指定各種請求參數：請求 URL、HTTP 方法、標頭及請求主體。">發送請求</Links>並<Links href="//client-responses" summary="了解如何接收回應、取得回應主體以及獲取回應參數。">處理回應</Links>，
        並透過<Links href="//client-plugins" summary="了解如何使用用戶端外掛程式來加入常用功能，例如記錄、序列化和授權。">外掛程式</Links>擴充其功能，例如<Links href="//client-auth" summary="Auth 外掛程式在你的用戶端應用程式中處理身份驗證與授權。">身分驗證</Links>、
        <Links href="//client-serialization" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間協商媒體類型，以及在傳送請求與接收回應時，以特定格式序列化/反序列化內容。">JSON 序列化</Links>等。
    </p>
    <p>
        在本教學中，我們將向你展示如何建立第一個 Ktor 用戶端應用程式，該程式會傳送請求並列印出回應。
    </p>
    <chapter title="前置需求" id="prerequisites">
        <p>
            在開始本教學之前，請先
            <a href="https://www.jetbrains.com/help/idea/installation-guide.html">安裝 IntelliJ IDEA Community 或
                Ultimate</a>。
        </p>
    </chapter>
    <chapter title="建立新專案" id="new-project">
        <p>
            你可以在現有專案中手動<Links href="//client-create-and-configure" summary="了解如何建立與配置 Ktor 用戶端。">建立與配置</Links> Ktor Client，然而，從頭開始最方便的方式是使用 IntelliJ IDEA 內建的 Kotlin 外掛程式產生一個新專案。
        </p>
        <p>
            若要建立新的 Kotlin 專案，請
            <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">開啟 IntelliJ IDEA</a> 並遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>
                    在歡迎畫面中，點擊 <control>New Project</control>。
                </p>
                <p>
                    或者，從主選單中選擇 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>New Project</control>
                    精靈中，從左側選單選擇
                    <control>Kotlin</control>。
                </p>
            </step>
            <step>
                <p>
                    在右側面板，指定以下設定：
                </p>
                <img src="client_get_started_new_project.png" alt="IntelliJ IDEA 中的新 Kotlin 專案視窗"
                     border-effect="rounded"
                     width="706"/>
                <list id="kotlin_app_settings">
                    <li>
                        <p>
                            <control>Name</control>
                            ：指定專案名稱。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Location</control>
                            ：指定專案的目錄。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Build system</control>
                            ：確保已選擇
                            <control>Gradle</control>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Gradle DSL</control>
                            ：選擇
                            <control>Kotlin</control>。
                        </p>
                    </li>
                    <li>
                        <p>
                            <control>Add sample code</control>
                            ：選擇此選項以在產生的專案中包含範例程式碼。
                        </p>
                    </li>
                </list>
            </step>
            <step>
                <p>
                    點擊
                    <control>Create</control>
                    並等待 IntelliJ IDEA 產生專案並安裝相依性。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="加入相依性" id="add-dependencies">
        <p>
            讓我們加入 Ktor 用戶端所需的相依性。
        </p>
        <procedure>
            <step>
                <p>
                    開啟
                    <Path>gradle.properties</Path>
                    檔案並加入以下行以指定 Ktor 版本：
                </p>
                <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
                <note id="eap-note">
                    <p>
                        若要使用 EAP 版本的 Ktor，你需要加入 <a href="#repositories">Space 儲存庫</a>。
                    </p>
                </note>
            </step>
            <step>
                <p>
                    開啟
                    <Path>build.gradle.kts</Path>
                    檔案並將以下構件加入到 dependencies 區塊中：
                </p>
                <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
                <list>
                    <li><code>ktor-client-core</code> 是一個核心相依性，提供了主要的用戶端功能。
                    </li>
                    <li>
                        <code>ktor-client-cio</code> 是處理網路請求之<Links href="//client-engines" summary="了解處理網路請求的引擎。">引擎</Links>的相依性。
                    </li>
                </list>
            </step>
            <step>
                <p>
                    點擊
                    <Path>build.gradle.kts</Path>
                    檔案右上角的
                    <control>Load Gradle Changes</control>
                    圖示，以安裝新加入的相依性。
                </p>
                <img src="client_get_started_load_gradle_changes_name.png" alt="載入 Gradle 變更" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="建立用戶端" id="create-client">
        <p>
            若要加入用戶端實作，請導覽至
            <Path>src/main/kotlin</Path>
            並遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>
                    開啟
                    <Path>Main.kt</Path>
                    檔案並將現有程式碼替換為以下實作：
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
                <p>
                    在 Ktor 中，用戶端由 <a
                        href="https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>
                    類別表示。
                </p>
            </step>
            <step>
                <p>
                    使用 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a> 方法來<Links href="//client-requests" summary="了解如何發送請求並指定各種請求參數：請求 URL、HTTP 方法、標頭及請求主體。">發送一個 GET 請求</Links>。
                    <Links href="//client-responses" summary="了解如何接收回應、取得回應主體以及獲取回應參數。">回應</Links>將以 <code>HttpResponse</code> 類別物件的形式接收。
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
                <p>
                    加入上述程式碼後，IDE 會針對 <code>get()</code> 函式顯示以下錯誤：
                    <emphasis>Suspend function 'get' should be called only from a coroutine or another suspend
                        function
                    </emphasis>（暫停函式 'get' 應僅從協同程式或其他暫停函式中呼叫）。
                </p>
                <img src="client_get_started_suspend_error.png" alt="暫停函式錯誤" width="706"/>
                <p>
                    若要修正此問題，你需要將 <code>main()</code> 函式設為暫停函式。
                </p>
                <tip>
                    若要進一步了解呼叫 <code>suspend</code> 函式，請參閱 <a
                        href="https://kotlinlang.org/docs/coroutines-basics.html">協同程式基礎</a>。
                </tip>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊定義旁邊的紅色燈泡圖示，然後選擇
                    <control>Make main suspend</control>。
                </p>
                <img src="client_get_started_suspend_error_fix.png" alt="將 main 改為 suspend" width="706"/>
            </step>
            <step>
                <p>
                    使用 <code>println()</code> 函式來列印伺服器傳回的<a href="#status">狀態碼</a>，並使用 <code>close()</code> 函式來關閉串流並釋放與其相關的所有資源。
                    <Path>Main.kt</Path>
                    檔案內容應如下所示：
                </p>
                <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="執行你的應用程式" id="make-request">
        <p>
            若要執行你的應用程式，請導覽至
            <Path>Main.kt</Path>
            檔案並遵循以下步驟：
        </p>
        <procedure>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊 <code>main()</code> 函式旁邊的裝訂邊圖示，然後選擇
                    <control>Run 'MainKt'</control>。
                </p>
                <img src="client_get_started_run_main.png" alt="執行應用程式" width="706"/>
            </step>
            <step>
                等待 IntelliJ IDEA 執行應用程式。
            </step>
            <step>
                <p>
                    你將在 IDE 底部的
                    <control>Run</control>
                    面板中看到顯示的輸出。
                </p>
                <img src="client_get_started_run_output_with_warning.png" alt="伺服器回應" width="706"/>
                <p>
                    雖然伺服器回應了 <code>200 OK</code> 訊息，
                    你也會看到一條錯誤訊息，指出 SLF4J 未能找到
                    <code>StaticLoggerBinder</code> 類別，並預設為無操作 (NOP) 記錄器實作。這實際上表示記錄功能已被停用。
                </p>
                <p>
                    你現在已經有一個可運作的用戶端應用程式。然而，為了修正此警告並能夠透過記錄功能偵錯 HTTP 呼叫，還需要<a href="#enable-logging">額外的步驟</a>。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="啟用記錄" id="enable-logging">
        <p>
            因為 Ktor 在 JVM 上使用 SLF4J 抽象層進行記錄，若要啟用記錄，你需要
            <a href="#jvm">提供一個記錄架構</a>，例如
            <a href="https://logback.qos.ch/">Logback</a>。
        </p>
        <procedure id="enable-logging-procedure">
            <step>
                <p>
                    在
                    <Path>gradle.properties</Path>
                    檔案中，指定記錄架構的版本：
                </p>
                <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
            </step>
            <step>
                <p>
                    開啟
                    <Path>build.gradle.kts</Path>
                    檔案並將以下構件加入到 dependencies 區塊中：
                </p>
                <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
            </step>
            <step>
                點擊
                <control>Load Gradle Changes</control>
                圖示以安裝新加入的相依性。
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕（<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新執行圖示"/>）以重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    你應該不再看到該錯誤，而是在 IDE 底部的
                    <control>Run</control>
                    面板中顯示相同的 <code>200 OK</code> 訊息。
                </p>
                <img src="client_get_started_run_output.png" alt="伺服器回應" width="706"/>
                <p>
                    至此，你已經啟用了記錄功能。若要開始看到記錄內容，你需要加入記錄配置。
                </p>
            </step>
            <step>
                <p>導覽至
                    <Path>src/main/resources</Path>
                    並建立一個新的
                    <Path>logback.xml</Path>
                    檔案，內容實作如下：
                </p>
                <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            undefined&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊重新執行按鈕（<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="IntelliJ IDEA 重新執行圖示"/>）以重新啟動應用程式。
                </p>
            </step>
            <step>
                <p>
                    你現在應該能夠在
                    <control>Run</control>
                    面板中看到列印出的回應上方出現追蹤（trace）記錄：
                </p>
                <img src="client_get_started_run_output_with_logs.png" alt="伺服器回應" width="706"/>
            </step>
        </procedure>
        <tip>
            Ktor 透過 <Links href="//client-logging" summary="所需相依性：io.ktor:ktor-client-logging">Logging</Links> 外掛程式提供了一種簡單直覺的方式來為 HTTP 呼叫加入記錄，而加入配置檔案則讓你在複雜的應用程式中精確調整記錄行為。
        </tip>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            為了更深入理解並擴充此配置，請探索如何
            <Links href="//client-create-and-configure" summary="了解如何建立與配置 Ktor 用戶端。">建立與配置 Ktor 用戶端</Links>。
        </p>
    </chapter>
</topic>