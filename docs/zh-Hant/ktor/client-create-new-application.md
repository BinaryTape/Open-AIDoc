```xml
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="建立客戶端應用程式"
       id="client-create-new-application"
       help-id="getting_started_ktor_client;client-getting-started;client-get-started;client-create-a-new-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-client-get-started"/>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
</tldr>
<link-summary>
    建立您的第一個客戶端應用程式，用於傳送請求並接收回應。
</link-summary>
<p>
    Ktor 包含一個多平台非同步 HTTP 客戶端，可讓您<Links href="/ktor/client-requests" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭和請求主體。">發出請求</Links>並<Links href="/ktor/client-responses" summary="了解如何接收回應、取得回應主體以及獲取回應參數。">處理回應</Links>，透過<Links href="/ktor/client-plugins" summary="熟悉提供常見功能（例如記錄、序列化、授權等）的外掛。">外掛</Links>擴展其功能，例如<Links href="/ktor/client-auth" summary="Auth 外掛處理客戶端應用程式中的身份驗證和授權。">身份驗證</Links>、<Links href="/ktor/client-serialization" summary="ContentNegotiation 外掛主要有兩個目的：協商客戶端與伺服器之間的媒體類型，以及在傳送請求和接收回應時以特定格式序列化/反序列化內容。">JSON 序列化</Links>等等。
</p>
<p>
    在本教學中，我們將向您展示如何建立您的第一個 Ktor 客戶端應用程式，該應用程式會傳送請求並印出回應。
</p>
<chapter title="先決條件" id="prerequisites">
    <p>
        在開始本教學之前，請<a href="https://www.jetbrains.com/help/idea/installation-guide.html">安裝 IntelliJ IDEA Community 或 Ultimate 版</a>。
    </p>
</chapter>
<chapter title="建立新專案" id="new-project">
    <p>
        您可以在現有專案中手動<Links href="/ktor/client-create-and-configure" summary="了解如何建立和設定 Ktor 客戶端。">建立和設定</Links> Ktor 客戶端，然而，從頭開始最方便的方法是使用 IntelliJ IDEA 內建的 Kotlin 外掛程式來產生新專案。
    </p>
    <p>
        若要建立新的 Kotlin 專案，請<a href="https://www.jetbrains.com/help/idea/run-for-the-first-time.html">開啟 IntelliJ IDEA</a> 並依照以下步驟操作：
    </p>
    <procedure>
        <step>
            <p>
                在歡迎畫面上，按一下<control>New Project</control>。
            </p>
            <p>
                或者，從主選單中選擇<ui-path>File | New | Project</ui-path>。
            </p>
        </step>
        <step>
            <p>
                在<control>New Project</control>精靈中，從左側清單中選擇<control>Kotlin</control>。
            </p>
        </step>
        <step>
            <p>
                在右側窗格中，指定以下設定：
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
                        ：指定專案目錄。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Build system</control>
                        ：確保已選擇<control>Gradle</control>。
                    </p>
                </li>
                <li>
                    <p>
                        <control>Gradle DSL</control>
                        ：選擇<control>Kotlin</control>。
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
                按一下<control>Create</control>並等待 IntelliJ IDEA 產生專案並安裝依賴項。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="新增依賴項" id="add-dependencies">
    <p>
        讓我們為 Ktor 客戶端新增所需的依賴項。
    </p>
    <procedure>
        <step>
            <p>
                開啟<Path>gradle.properties</Path>檔案並新增以下行以指定 Ktor 版本：
            </p>
            <code-block lang="kotlin" code="                    ktor_version=%ktor_version%"/>
            <note id="eap-note">
                <p>
                    若要使用 Ktor 的 EAP 版本，您需要新增一個<a href="#repositories">Space 儲存庫</a>。
                </p>
            </note>
        </step>
        <step>
            <p>
                開啟<Path>build.gradle.kts</Path>檔案並將以下工件新增至依賴項區塊：
            </p>
            <code-block lang="kotlin" code="val ktor_version: String by project&#10;&#10;dependencies {&#10;    implementation(&quot;io.ktor:ktor-client-core:$ktor_version&quot;)&#10;    implementation(&quot;io.ktor:ktor-client-cio:$ktor_version&quot;)&#10;}"/>
            <list>
                <li><code>ktor-client-core</code> 是提供主要客戶端功能的核心依賴項，
                </li>
                <li>
                    <code>ktor-client-cio</code> 是用於處理網路請求的<Links href="/ktor/client-engines" summary="了解處理網路請求的引擎。">引擎</Links>的依賴項。
                </li>
            </list>
        </step>
        <step>
            <p>
                按一下<Path>build.gradle.kts</Path>檔案右上角的<control>Load Gradle Changes</control>圖示，以安裝新新增的依賴項。
            </p>
            <img src="client_get_started_load_gradle_changes_name.png" alt="載入 Gradle 變更" width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="建立客戶端" id="create-client">
    <p>
        若要新增客戶端實作，請導覽至<Path>src/main/kotlin</Path>並依照以下步驟操作：
    </p>
    <procedure>
        <step>
            <p>
                開啟<Path>Main.kt</Path>檔案並將現有程式碼替換為以下實作：
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                    }"/>
            <p>
                在 Ktor 中，客戶端由<a
                    href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client/-http-client/index.html">HttpClient</a>類別表示。
            </p>
        </step>
        <step>
            <p>
                使用<a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.request/get.html"><code>HttpClient.get()</code></a>方法以<Links href="/ktor/client-requests" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭和請求主體。">發出 GET 請求</Links>。回應將以<code>HttpResponse</code>類別物件的形式接收。
            </p>
            <code-block lang="kotlin" code="                    import io.ktor.client.*&#10;                    import io.ktor.client.engine.cio.*&#10;                    import io.ktor.client.request.*&#10;                    import io.ktor.client.statement.*&#10;&#10;                    fun main() {&#10;                        val client = HttpClient(CIO)&#10;                        val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;                    }"/>
            <p>
                新增上述程式碼後，IDE 會為<code>get()</code>函數顯示以下錯誤：<emphasis>Suspend 函數 'get' 只能從協程或另一個 Suspend 函數中呼叫</emphasis>。
            </p>
            <img src="client_get_started_suspend_error.png" alt="Suspend 函數錯誤" width="706"/>
            <p>
                若要修正此問題，您需要將<code>main()</code>函數設為 Suspend 函數。
            </p>
            <tip>
                若要深入了解如何呼叫<code>suspend</code>函數，請參閱<a
                    href="https://kotlinlang.org/docs/coroutines-basics.html">協程基礎</a>。
            </tip>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，按一下定義旁邊的紅色提示燈泡，然後選擇<control>Make main suspend</control>。
            </p>
            <img src="client_get_started_suspend_error_fix.png" alt="將 main 設為 Suspend" width="706"/>
        </step>
        <step>
            <p>
                使用<code>println()</code>函數印出伺服器返回的<a href="#status">狀態碼</a>，並使用<code>close()</code>函數關閉資料流並釋放與其相關的任何資源。<Path>Main.kt</Path>檔案應如下所示：
            </p>
            <code-block lang="kotlin" code="import io.ktor.client.*&#10;import io.ktor.client.engine.cio.*&#10;import io.ktor.client.request.*&#10;import io.ktor.client.statement.*&#10;&#10;suspend fun main() {&#10;    val client = HttpClient(CIO)&#10;    val response: HttpResponse = client.get(&quot;https://ktor.io/&quot;)&#10;    println(response.status)&#10;    client.close()&#10;}"/>
        </step>
    </procedure>
</chapter>
<chapter title="執行應用程式" id="make-request">
    <p>
        若要執行應用程式，請導覽至<Path>Main.kt</Path>檔案並依照以下步驟操作：
    </p>
    <procedure>
        <step>
            <p>
                在 IntelliJ IDEA 中，按一下<code>main()</code>函數旁邊的邊欄圖示，然後選擇<control>Run 'MainKt'</control>。
            </p>
            <img src="client_get_started_run_main.png" alt="執行應用程式" width="706"/>
        </step>
        <step>
            等待 IntelliJ IDEA 執行應用程式。
        </step>
        <step>
            <p>
                您將在 IDE 底部的<control>Run</control>窗格中看到輸出。
            </p>
            <img src="client_get_started_run_output_with_warning.png" alt="伺服器回應" width="706"/>
            <p>
                儘管伺服器回應<code>200 OK</code>訊息，您也會看到一則錯誤訊息，指出 SLF4J 未能找到<code>StaticLoggerBinder</code>類別，預設為無操作 (NOP) 記錄器實作。這實際上表示記錄功能已停用。
            </p>
            <p>
                您現在已有一個可運作的客戶端應用程式。然而，若要修正此警告並能夠透過記錄功能偵錯 HTTP 呼叫，需要<a href="#enable-logging">額外步驟</a>。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="啟用記錄功能" id="enable-logging">
    <p>
        因為 Ktor 在 JVM 上使用 SLF4J 抽象層進行記錄，所以若要啟用記錄功能，您需要<a href="#jvm">提供一個記錄框架</a>，例如<a href="https://logback.qos.ch/">Logback</a>。
    </p>
    <procedure id="enable-logging-procedure">
        <step>
            <p>
                在<Path>gradle.properties</Path>檔案中，指定記錄框架的版本：
            </p>
            <code-block lang="kotlin" code="                    logback_version=%logback_version%"/>
        </step>
        <step>
            <p>
                開啟<Path>build.gradle.kts</Path>檔案並將以下工件新增至依賴項區塊：
            </p>
            <code-block lang="kotlin" code="                    //...&#10;                    val logback_version: String by project&#10;&#10;                    dependencies {&#10;                        //...&#10;                        implementation(&quot;ch.qos.logback:logback-classic:$logback_version&quot;)&#10;                    }"/>
        </step>
        <step>
            按一下<control>Load Gradle Changes</control>圖示以安裝新新增的依賴項。
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，按一下重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 重新執行圖示"/>) 以重新啟動應用程式。
            </p>
        </step>
        <step>
            <p>
                您應該不再看到錯誤，但相同的<code>200 OK</code>訊息將會顯示在 IDE 底部的<control>Run</control>窗格中。
            </p>
            <img src="client_get_started_run_output.png" alt="伺服器回應" width="706"/>
            <p>
                至此，您已啟用記錄功能。若要開始看到記錄，您需要新增記錄配置。
            </p>
        </step>
        <step>
            <p>導覽至<Path>src/main/resources</Path>並建立一個新的<Path>logback.xml</Path>檔案，其中包含以下實作：
            </p>
            <code-block lang="xml" ignore-vars="true" code="                    &lt;configuration&gt;&#10;                        &lt;appender name=&quot;APPENDER&quot; class=&quot;ch.qos.logback.core.ConsoleAppender&quot;&gt;&#10;                            &lt;encoder&gt;&#10;                                &lt;pattern&gt;%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;&#10;                            &lt;/encoder&gt;&#10;                        &lt;/appender&gt;&#10;                        &lt;root level=&quot;trace&quot;&gt;&#10;                            undefined&#10;                        &lt;/root&gt;&#10;                    &lt;/configuration&gt;"/>
        </step>
        <step>
            <p>
                在 IntelliJ IDEA 中，按一下重新執行按鈕 (<img src="intellij_idea_rerun_icon.svg"
                                                               style="inline" height="16" width="16"
                                                               alt="IntelliJ IDEA 重新執行圖示"/>) 以重新啟動應用程式。
            </p>
        </step>
        <step>
            <p>
                您現在應該能夠在<control>Run</control>窗格中看到印出回應上方的追蹤記錄：
            </p>
            <img src="client_get_started_run_output_with_logs.png" alt="伺服器回應" width="706"/>
        </step>
    </procedure>
    <tip>
        Ktor 提供簡單直接的方式，透過<Links href="/ktor/client-logging" summary="所需依賴項：io.ktor:ktor-client-logging 程式碼範例：%example_name%">Logging</Links>外掛為 HTTP 呼叫新增記錄，而新增配置檔案則可讓您在複雜應用程式中微調記錄行為。
    </tip>
</chapter>
<chapter title="後續步驟" id="next-steps">
    <p>
        若要更好地理解和擴展此配置，請探索如何<Links href="/ktor/client-create-and-configure" summary="了解如何建立和設定 Ktor 客戶端。">建立和設定 Ktor 客戶端</Links>。
    </p>
</chapter>