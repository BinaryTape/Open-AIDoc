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
        建立你的第一個用於發送請求與接收回應的用戶端應用程式。
    </link-summary>
    <p>
        Ktor 包含一個多平台非同步 HTTP 用戶端，可讓你<Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">發送請求</Links>與<Links href="client-responses.md" summary="了解如何接收回應、取得回應主體以及取得回應參數。">處理回應</Links>，並透過<Links href="client-plugins.md" summary="了解如何使用用戶端外掛程式來新增通用功能，例如記錄、序列化和授權。">外掛程式</Links>擴充其功能，例如<Links href="client-auth.md" summary="Auth 外掛程式在你的用戶端應用程式中處理驗證與授權。">驗證</Links>、<Links href="client-serialization.md" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間交涉媒體類型，以及在發送請求和接收回應時以特定格式序列化／反序列化內容。">JSON 序列化</Links>等。
    </p>
    <p>
        在本教學中，我們將向你展示如何建立第一個 Ktor 用戶端應用程式，用來發送請求並印出回應。
    </p>
    <chapter title="先決條件" id="prerequisites">
        <p>
            在開始本教學之前，請先
            <a href="https://www.jetbrains.com/help/idea/installation-guide.html">安裝 IntelliJ IDEA Community 或
                Ultimate</a>。
        </p>
    </chapter>
    <chapter title="建立新專案" id="new-project">
        <p>
            你可以在現有專案中手動<Links href="client-create-and-configure.md" summary="了解如何建立和配置 Ktor 用戶端。">建立並配置</Links> Ktor 用戶端，但從頭開始最方便的方法是使用 IntelliJ IDEA 隨附的 Kotlin 外掛程式產生新專案。
        </p>
        <p>
            若要建立新的 Kotlin 專案，請
            <a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">開啟 IntelliJ IDEA</a> 並按照以下步驟操作：
        </p>
        <procedure>
            <step>
                <p>
                    在歡迎畫面中，點擊 <control>New Project</control>。
                </p>
                <p>
                    或者，從主選單中選取 <ui-path>File | New | Project</ui-path>。
                </p>
            </step>
            <step>
                <p>
                    在
                    <control>New Project</control>
                    精靈中，從左側清單選擇
                    <control>Kotlin</control>。
                </p>
            </step>
            <step>
                <p>
                    在右側窗格中，指定以下設定：
                </p>
                <img src="client_get_started_new_project.png" alt="IntelliJ IDEA 中的新增 Kotlin 專案視窗"
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
                            ：確認已選取
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
                            ：選取此選項以在產生的專案中包含範例程式碼。
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
    <chapter title="新增相依性" id="add-dependencies">
        <p>
            讓我們新增 Ktor 用戶端所需的相依性。
        </p>
        <procedure>
            <step>
                <p>
                    開啟
                    <Path>gradle.properties</Path>
                    檔案並新增以下這行以指定 Ktor 版本：
                </p>
                <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
                <note id="eap-note">
                    <p>
                        若要使用 Ktor 的 EAP 版本，你需要新增 <a href="server-dependencies.topic#repositories">Space 存儲庫</a>。
                    </p>
                </note>
            </step>
            <step>
                <p>
                    開啟
                    <Path>build.gradle.kts</Path>
                    檔案，並將下列構件新增至 dependencies 區塊中：
                </p>
                <code-block lang="kotlin" code="dependencies {&#10;    implementation(ktorLibs.client.core)&#10;    implementation(ktorLibs.client.cio)&#10;    implementation(libs.logback.classic)&#10;}"/>
                <list>
                    <li><code>ktor-client-core</code> (<code>ktorLibs.client.core</code>) 是提供核心用戶端功能的主要相依性，
                    </li>
                    <li>
                        <code>ktor-client-cio</code> (<code>ktorLibs.client.cio</code>) 是用於處理網路請求的<Links href="client-engines.md" summary="了解處理網路請求的引擎。">引擎</Links>相依性。
                    </li>
                </list>
            </step>
            <step>
                <p>
                    點擊
                    <Path>build.gradle.kts</Path>
                    檔案右上角的
                    <control>Load Gradle Changes</control>
                    圖示，以安裝新新增的相依性。
                </p>
                <img src="client_get_started_load_gradle_changes_name.png" alt="載入 Gradle 變更" width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="建立用戶端" id="create-client">
        <p>
            若要新增用戶端實作，請瀏覽至
            <Path>src/main/kotlin</Path>
            並按照以下步驟操作：
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
                    使用 <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a> 方法來<Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求主體。">發送 GET 請求</Links>。
                    <Links href="client-responses.md" summary="了解如何接收回應、取得回應主體以及取得回應參數。">回應</Links>將會以 <code>HttpResponse</code> 類別物件的形式接收。
                </p>
                <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
                <p>
                    新增上述程式碼後，IDE 會對 <code>get()</code> 函式顯示以下錯誤：
                    <emphasis>Suspend function 'get' should be called only from a coroutine or another suspend
                        function
                    </emphasis>。
                </p>
                <img src="client_get_started_suspend_error.png" alt="Suspend 函式錯誤" width="706"/>
                <p>
                    為了解決這個問題，你需要將 <code>main()</code> 函式設為 suspending。
                </p>
                <tip>
                    若要進一步了解呼叫 <code>suspend</code> 函式，請參閱 <a
                        href="https://kotlinlang.org/docs/coroutines-basics.html">協同程式基礎 (Coroutines basics)</a>。
                </tip>
            </step>
            <step>
                <p>
                    在 IntelliJ IDEA 中，點擊定義旁邊的紅色燈泡並選擇
                    <control>Make main suspend</control>。
                </p>
                <img src="client_get_started_suspend_error_fix.png" alt="將 main 改為 suspend" width="706"/>
            </step>
            <step>
                <p>
                    使用 <code>println()</code> 函式印出伺服器傳回的<a href="client-responses.md#status">狀態碼</a>，並使用 <code>close()</code> 函式關閉串流並釋放與其關聯的所有資源。
                    <Path>Main.kt</Path>
                    檔案外觀應如下所示：
                </p>
                <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="執行你的應用程式" id="make-request">
        <p>
            若要執行你的應用程式，請瀏覽至
            <Path>Main.kt</Path>
            檔案並按照以下步驟操作：
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
                    你將會在 IDE 底部的
                    <control>Run</control>
                    窗格中看到顯示的輸出。
                </p>
                <img src="client_get_started_run_output_with_warning.png" alt="伺服器回應" width="706"/>
                <p>
                    雖然伺服器回應了 <code>200 OK</code> 訊息，
                    但你也會看到一則錯誤訊息，指出 SLF4J 找不到
                    <code>StaticLoggerBinder</code> 類別，並預設採用無操作 (NOP) 記錄器實作。這實際上代表記錄功能已被停用。
                </p>
                <p>
                    現在你有了一個可正常運作的用戶端應用程式。然而，若要修正此警告並能夠透過記錄來對 HTTP 呼叫進行偵錯，還需要完成<a href="#enable-logging">額外步驟</a>。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="啟用記錄" id="enable-logging">
        <p>
            由於 Ktor 在 JVM 上使用 SLF4J 抽象層進行記錄，若要啟用記錄，你需要
            <a href="client-logging.md#jvm">提供一個記錄架構</a>，例如
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
                    檔案，並將下列構件新增至 dependencies 區塊中：
                </p>
                <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
            </step>
            <step>
                點擊
                <control>Load Gradle Changes</control>
                圖示以安裝新新增的相依性。
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
                    你應該不會再看到該錯誤，但在 IDE 底部的
                    <control>Run</control>
                    窗格中仍會顯示相同的 <code>200 OK</code> 訊息。
                </p>
                <img src="client_get_started_run_output.png" alt="伺服器回應" width="706"/>
                <p>
                    至此，你已經啟用了記錄功能。若要開始查看記錄，你需要新增記錄配置。
                </p>
            </step>
            <step>
                <p>瀏覽至
                    <Path>src/main/resources</Path>
                    並建立具有以下實作的新
                    <Path>logback.xml</Path>
                    檔案：
                </p>
                <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            &lt;appender-ref ref=&quot;APPENDER&quot;/&gt;&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
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
                    現在你應該能夠在
                    <control>Run</control>
                    窗格中印出的回應上方看到追蹤記錄：
                </p>
                <img src="client_get_started_run_output_with_logs.png" alt="伺服器回應" width="706"/>
            </step>
        </procedure>
        <tip>
            Ktor 透過 <Links href="client-logging.md" summary="所需相依性：io.ktor:ktor-client-logging 程式碼範例：%example_name%">Logging</Links> 外掛程式提供了一種簡單明瞭的方式來為 HTTP 呼叫新增記錄，而新增配置檔案則可讓你微調複雜應用程式中的記錄行為。
        </tip>
    </chapter>
    <chapter title="後續步驟" id="next-steps">
        <p>
            若要更好地理解並擴充此配置，請探索如何<Links href="client-create-and-configure.md" summary="了解如何建立和配置 Ktor 用戶端。">建立並配置 Ktor 用戶端</Links>。
        </p>
    </chapter>
</topic>