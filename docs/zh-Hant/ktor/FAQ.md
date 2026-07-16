```xml
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="常見問題"
       id="FAQ">
    <chapter title="Ktor 的正確發音是什麼？" id="pronounce">
        <p>
            <emphasis>/keɪ-tor/</emphasis>
        </p>
    </chapter>
    <chapter title="「Ktor」這個名稱代表什麼？" id="name-meaning">
        <p>
            Ktor 這個名稱源自縮寫 <code>ctor</code> (constructor，建構子)，並將首字母替換為代表 Kotlin 的「K」。
        </p>
    </chapter>
    <chapter title="我該如何提出問題、回報錯誤、聯繫我們、貢獻、提供意見回饋等？" id="feedback">
        <p>
            請造訪 <a href="https://ktor.io/support/">支援</a> 頁面，以了解更多可用的支援管道。<a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">如何貢獻</a> 指南說明了您可以為 Ktor 貢獻的方式。
        </p>
    </chapter>
    <chapter title="CIO 是什麼意思？" id="cio">
        <p>
            CIO 代表
            <emphasis>基於協程的 I/O</emphasis>
            。
            通常我們稱其為一種引擎，它使用 Kotlin 和協程來實作 IETF RFC 或其他協定所需的邏輯，而無需依賴外部基於 JVM 的函式庫。
        </p>
    </chapter>
    <chapter title="如何解決未解析（紅色）的 Ktor 匯入？" id="ktor-artifact">
        <p>
            確保相應的 <Links href="/ktor/server-dependencies" summary="了解如何將 Ktor 伺服器依賴項新增至現有的 Gradle/Maven 專案。">Ktor 構件</Links> 已新增到建構腳本中。
        </p>
    </chapter>
    <chapter
            title="Ktor 是否提供一種捕捉 IPC 訊號（例如 SIGTERM 或 SIGINT）的方法，以便優雅地處理伺服器關閉？"
            id="sigterm">
        <p>
            如果您正在執行 <a href="#engine-main">EngineMain</a>，它將會自動處理。
            否則，您需要<a
                href="https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-cio/jvmAndNix/src/io/ktor/server/cio/EngineMain.kt#L21">手動處理</a>。
            您可以使用 JVM 的 <code>Runtime.getRuntime().addShutdownHook</code> 功能。
        </p>
    </chapter>
    <chapter title="如何取得代理伺服器後的客戶端 IP？" id="proxy-ip">
        <p>
            如果代理伺服器提供適當的標頭，並且 <Links href="/ktor/server-forward-headers" summary="所需依賴項：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✅">ForwardedHeader</Links> 外掛程式已安裝，<code>call.request.origin</code> 屬性會提供關於原始呼叫者（代理伺服器）的<a href="#request_information">連線資訊</a>。
        </p>
    </chapter>
    <chapter title="如何測試 main 分支上的最新提交？" id="bleeding-edge">
        <p>
            您可以從 <code>jetbrains.space</code> 取得 Ktor 每夜建構版本。
            更多資訊請參閱 <a href="https://ktor.io/eap/">早期存取計畫</a>。
        </p>
    </chapter>
    <chapter title="如何確定我正在使用哪個版本的 Ktor？" id="ktor-version-used">
        <p>
            您可以搭配使用 <Links href="/ktor/server-default-headers" summary="所需依賴項：io.ktor:%artifact_name% 原生伺服器支援：✅">DefaultHeaders</Links> 外掛程式，它會在 <code>Server</code> 回應標頭中傳送 Ktor 版本資訊，例如：
        </p>
        <code-block code="            Server: ktor-server-core/%ktor_version%"/>
    </chapter>
    <chapter title="我的路由沒有執行。我該如何偵錯？" id="route-not-executing">
        <p>
            Ktor 提供了一種追蹤機制，以協助排查路由決策問題。
            請查閱 <a href="#trace_routes">追蹤路由</a>部分。
        </p>
    </chapter>
    <chapter title="如何解決「Response has already been sent」的錯誤？" id="response-already-sent">
        <p>
            這表示您、外掛程式或攔截器已經呼叫了 <code>call.respond* </code> 函數，而您正再次呼叫它。
        </p>
    </chapter>
    <chapter title="如何訂閱 Ktor 事件？" id="ktor-events">
        <p>
            請查閱 <Links href="/ktor/server-events" summary="程式碼範例：%example_name%">應用程式監控</Links> 頁面以了解更多資訊。
        </p>
    </chapter>
    <chapter title="如何解決「No configuration setting found for key ktor」的錯誤？" id="cannot-find-application-conf">
        <p>
            這表示 Ktor 無法找到 <Links href="/ktor/server-configuration-file" summary="了解如何設定組態檔中的各種伺服器參數。">設定檔</Links>。
            確保 <code>resources</code> 資料夾中有設定檔，並且該 <code>resources</code> 資料夾已標記為資源資料夾。
            考慮使用 <a href="https://start.ktor.io/">Ktor 專案產生器</a>
            或
            <a href="https://plugins.jetbrains.com/plugin/16008-ktor">用於 IntelliJ IDEA Ultimate 的 Ktor 外掛程式</a> 來建立一個可運行的專案作為基礎。更多資訊請參閱 <Links href="/ktor/server-create-a-new-project" summary="了解如何開啟、執行和測試 Ktor 伺服器應用程式。">建立、開啟並執行新的 Ktor 專案</Links>。
        </p>
    </chapter>
    <chapter title="我可以在 Android 上使用 Ktor 嗎？" id="android-support">
        <p>
            是的，Ktor 伺服器和客戶端已知可在 Android 5 (API 21) 或更高版本上運作，至少使用 Netty 引擎時是如此。
        </p>
    </chapter>
    <chapter title="為什麼「CURL -I」回傳「404 Not Found」？" id="curl-head-not-found">
        <p>
            <code>CURL -I</code> 是 <code>CURL --head</code> 的別名，用於執行 <code>HEAD</code> 請求。
            預設情況下，Ktor 不會為 <code>GET</code> 處理器處理 <code>HEAD</code> 請求。
            若要啟用此功能，請安裝 <Links href="/ktor/server-autoheadresponse" summary="%plugin_name% 提供了自動回應每個定義了 GET 的路由的 HEAD 請求的能力。">AutoHeadResponse</Links> 外掛程式。
        </p>
    </chapter>
    <chapter title="使用「HttpsRedirect」外掛程式時，如何解決無限重新導向的問題？" id="infinite-redirect">
        <p>
            最可能的原因是您的後端位於反向代理伺服器或負載平衡器之後，並且此中介層向您的後端發出正常的 HTTP 請求，因此您的 Ktor 後端中的 <code>HttpsRedirect</code> 外掛程式認為這是正常的 HTTP 請求並以重新導向回應。
        </p>
        <p>
            通常，反向代理伺服器會傳送一些描述原始請求的標頭（例如是否為 HTTPS，或原始 IP 位址），並且有一個外掛程式 <Links href="/ktor/server-forward-headers" summary="所需依賴項：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✅">ForwardedHeader</Links> 會解析這些標頭，讓 <Links href="/ktor/server-https-redirect" summary="所需依賴項：io.ktor:%artifact_name% 程式碼範例：%example_name% 原生伺服器支援：✅">HttpsRedirect</Links> 外掛程式知道原始請求是 HTTPS。
        </p>
    </chapter>
    <chapter title="如何在 Windows 上安裝 'curl' 以在 Kotlin/Native 上使用對應的引擎？" id="native-curl">
        <p>
            <a href="#curl">Curl</a> 客戶端引擎需要安裝 <code>curl</code> 函式庫。
            在 Windows 上，您可能需要考慮使用 MinGW/MSYS2 <code>curl</code> 二進位檔。
        </p>
        <procedure>
            <step>
                <p>
                    依照 <a href="https://www.msys2.org/">MinGW/MSYS2</a> 中的說明安裝 MinGW/MSYS2。
                </p>
            </step>
            <step>
                <p>
                    使用以下指令安裝 <code>libcurl</code>：
                </p>
                <code-block lang="shell" code="                    pacman -S mingw-w64-x86_64-curl"/>
            </step>
            <step>
                <p>
                    如果您已將 MinGW/MSYS2 安裝到預設位置，請將
                    <Path>C:\\msys64\\mingw64\\bin\\</Path>
                    新增到 <code>PATH</code> 環境變數中。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="如何解決「NoTransformationFoundException」？" id="no-transformation-found-exception">
        <p>
            <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a> 表示無法找到適合將<emphasis>接收到的正文</emphasis>從**結果**類型轉換為客戶端**預期**類型的轉換方式。
        </p>
        <procedure>
            <step>
                <p>
                    檢查您的請求中的 <code>Accept</code> 標頭是否指定了所需的內容類型，以及伺服器回應中的 <code>Content-Type</code> 標頭是否符合客戶端預期的類型。
                </p>
            </step>
            <step>
                <p>
                    為您正在使用的特定內容類型註冊必要的內容轉換。
                </p>
                <p>
                    您可以使用客戶端的 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> 外掛程式。
                    此外掛程式允許您指定如何針對不同的內容類型序列化和反序列化資料。
                </p>
                <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // Example: Register JSON content transformation&#10;                            // Add more transformations as needed for other content types&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    確保您安裝了所有必要的外掛程式。可能遺失的功能：
                </p>
                <list type="bullet">
                    <li>客戶端 <a href="https://ktor.io/docs/websocket-client.html">WebSockets</a> 和
                        伺服器 <a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                    <li>客戶端 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> 和
                        伺服器 <a href="https://ktor.io/docs/serialization.html">ContentNegotiation</a></li>
                    <li><a href="https://ktor.io/docs/compression.html">壓縮</a></li>
                </list>
            </step>
        </procedure>
    </chapter>
</topic>