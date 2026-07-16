```xml
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="自動重新載入"
       id="server-auto-reload" help-id="Auto_reload">
<tldr>
    <p>
        <b>程式碼範例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>,
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-embedded-server">autoreload-embedded-server</a>
    </p>
</tldr>
<link-summary>
    了解如何使用自動重新載入來在程式碼變更時重新載入應用程式類別。
</link-summary>
<p>
    <Links href="/ktor/server-run" summary="Learn how to run a server Ktor application.">在開發期間重新啟動</Links>伺服器可能需要一些時間。
    Ktor 允許您透過使用<emphasis>自動重新載入</emphasis>來克服此限制，它會在程式碼變更時重新載入應用程式類別，並提供快速的回饋循環。
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
            (選用) <a href="#watch-paths">配置監控路徑</a>
        </p>
    </li>
    <li>
        <p>
            <a href="#recompile">啟用變更時重新編譯</a>
        </p>
    </li>
</list>
<chapter title="啟用開發模式" id="enable">
    <p>
        要使用自動重新載入，您需要先<a href="#enable">啟用開發模式</a>。
        這取決於您<Links href="/ktor/server-create-and-configure" summary="Learn how to create a server depending on your application deployment needs.">建立和執行伺服器</Links>的方式：
    </p>
    <list>
        <li>
            <p>
                如果您使用<code>EngineMain</code>來執行伺服器，請在<a href="#application-conf">設定檔</a>中啟用開發模式。
            </p>
        </li>
        <li>
            <p>
                如果您使用<code>embeddedServer</code>執行伺服器，您可以使用<a href="#system-property">io.ktor.development</a>系統屬性。
            </p>
        </li>
    </list>
    <p>
        啟用開發模式後，Ktor 將自動監控工作目錄中的輸出檔案。
        如果需要，您可以透過指定<a href="#watch-paths">監控路徑</a>來縮小監控的資料夾集合。
    </p>
</chapter>
<chapter title="配置監控路徑" id="watch-paths">
    <p>
        當您<a href="#enable">啟用</a>開發模式時，Ktor 會開始監控工作目錄中的輸出檔案。
        例如，對於使用Gradle建置的<Path>ktor-sample</Path>專案，將監控以下資料夾：
    </p>
    <code-block code="            ktor-sample/build/classes/kotlin/main/META-INF&#10;            ktor-sample/build/classes/kotlin/main/com/example&#10;            ktor-sample/build/classes/kotlin/main/com&#10;            ktor-sample/build/classes/kotlin/main&#10;            ktor-sample/build/resources/main"/>
    <p>
        監控路徑允許您縮小監控資料夾的集合。
        為此，您可以指定監控路徑的一部分。
        例如，要監控<Path>ktor-sample/build/classes</Path>子資料夾中的變更，請將<code>classes</code>作為監控路徑傳遞。
        根據您執行伺服器的方式，您可以透過以下方式指定監控路徑：
    </p>
    <list>
        <li>
            <p>
                在<Path>application.conf</Path>或<Path>application.yaml</Path>檔案中，指定<code>watch</code>選項：
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon">
                    <code-block code="ktor {&#10;    development = true&#10;    deployment {&#10;        watch = [ classes ]&#10;    }&#10;}"/>
                </tab>
                <tab title="application.yaml" group-key="yaml">
                    <code-block lang="yaml" code="ktor:&#10;    development: true&#10;    deployment:&#10;        watch:&#10;            - classes"/>
                </tab>
            </tabs>
            <p>
                您也可以指定多個監控路徑，例如：
            </p>
            <tabs group="config">
                <tab title="application.conf" group-key="hocon">
                    <code-block code="                            watch = [ classes, resources ]"/>
                </tab>
                <tab title="application.yaml" group-key="yaml">
                    <code-block lang="yaml" code="                            watch:&#10;                                - classes&#10;                                - resources"/>
                </tab>
            </tabs>
            <p>
                您可以在這裡找到完整範例：<a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-engine-main">autoreload-engine-main</a>。
            </p>
        </li>
        <li>
            <p>
                如果您使用<code>embeddedServer</code>，請將監控路徑作為<code>watchPaths</code>參數傳遞：
            </p>
            <code-block lang="Kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080, watchPaths = listOf(&quot;classes&quot;), host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;Hello, world!&quot;)&#10;        }&#10;    }&#10;}"/>
            <p>
                完整範例請參見
                <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/autoreload-embedded-server">
                    autoreload-embedded-server
                </a>
                。
            </p>
        </li>
    </list>
</chapter>
<chapter title="變更時重新編譯" id="recompile">
    <p>
        由於自動重新載入會偵測輸出檔案中的變更，
        您需要重建專案。
        您可以在IntelliJ IDEA中手動執行此操作，或者使用<code>-t</code>命令列選項在Gradle中啟用持續建置執行。
    </p>
    <list>
        <li>
            <p>
                要在IntelliJ IDEA中手動重建專案，請從主選單中選擇<ui-path>Build | Rebuild Project</ui-path>。
            </p>
        </li>
        <li>
            <p>
                要使用Gradle自動重建專案，
                您可以在終端機中執行帶有<code>-t</code>選項的<code>build</code>任務：
            </p>
            <code-block code="                    ./gradlew -t build"/>
            <tip>
                <p>
                    要跳過在重新載入專案時執行測試，您可以將<code>-x</code>選項傳遞給<code>build</code>任務：
                </p>
                <code-block code="                        ./gradlew -t build -x test -i"/>
            </tip>
        </li>
    </list>
</chapter>