<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="常見問題"
       id="FAQ">
    <chapter title="Ktor 的正確發音是什麼？" id="pronounce">
        <p>
            <emphasis>/keɪ-tor/</emphasis>
        </p>
    </chapter>
    <chapter title='「Ktor」這個名稱代表什麼意思？' id="name-meaning">
        <p>
            Ktor這個名稱源自縮寫<code>ctor</code>（建構函式），並將第一個字母替換為代表Kotlin的「K」。
        </p>
    </chapter>
    <chapter title="我該如何提出問題、回報錯誤、聯繫你們、進行貢獻或提供意見回饋等？" id="feedback">
        <p>
            請前往<a href="https://ktor.io/support/">支援</a>頁面以進一步了解可用的支援管道。
            <a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">如何貢獻</a>指南說明了您可以為Ktor做出貢獻的方式。
        </p>
    </chapter>
    <chapter title="CIO 代表什麼意思？" id="cio">
        <p>
            CIO代表
            <emphasis>基於協同程式的I/O</emphasis>
            （Coroutine-based I/O）。
            通常我們將其稱為一種使用Kotlin和協同程式來實作IETF RFC或其他協定邏輯的引擎，且不依賴外部基於JVM的程式庫。
        </p>
    </chapter>
    <chapter title="如何修復未解決的（紅色）Ktor 匯入？" id="ktor-artifact">
        <p>
            請確保在建置指令碼中加入了相對應的<Links href="//server-dependencies" summary="了解如何將 Ktor Server 相依性新增至現有的 Gradle/Maven 專案。">Ktor構件</Links>。
        </p>
    </chapter>
    <chapter
            title="Ktor 是否提供擷取 IPC 訊號（例如 SIGTERM 或 SIGINT）的方法，以便平滑地處理伺服器關閉？"
            id="sigterm">
        <p>
            如果您正在執行<a href="#engine-main">EngineMain</a>，它將會被自動處理。
            否則，您需要手動處理。
            您可以使用JVM提供的<code>Runtime.getRuntime().addShutdownHook</code>設施。
        </p>
    </chapter>
    <chapter title="在代理伺服器後方如何獲取用戶端 IP？" id="proxy-ip">
        <p>
            如果代理伺服器提供了正確的標頭，且已安裝<Links href="//server-forward-headers" summary="所需的相依性：io.ktor:%artifact_name%">ForwardedHeader</Links>外掛程式，則<code>call.request.origin</code>屬性會提供關於原始呼叫者（代理伺服器）的<a href="#request_information">連線資訊</a>。
        </p>
    </chapter>
    <chapter title="我該如何測試 main 分支上最新的提交？" id="bleeding-edge">
        <p>
            您可以從<code>jetbrains.space</code>獲取Ktor每晚建置版本。
            請從<a href="https://ktor.io/eap/">早期體驗計劃</a>了解更多資訊。
        </p>
    </chapter>
    <chapter title="我該如何確認我正在使用的是哪個版本的 Ktor？" id="ktor-version-used">
        <p>
            您可以使用<Links href="//server-default-headers" summary="所需的相依性：io.ktor:%artifact_name%">DefaultHeaders</Links>外掛程式，它會發送包含Ktor版本的<code>Server</code>回應標頭，例如：
        </p>
        <code-block code="            Server: ktor-server-core/%ktor_version%"/>
    </chapter>
    <chapter title="我的路由未被執行。我該如何偵錯？" id="route-not-executing">
        <p>
            Ktor提供了一種追蹤機制來協助排查路由決策問題。
            請參閱<a href="#trace_routes">追蹤路由</a>章節。
        </p>
    </chapter>
    <chapter title="如何解決「Response has already been sent」錯誤？" id="response-already-sent">
        <p>
            這表示您、或是某個外掛程式或攔截器已經呼叫過<code>call.respond&#42; </code>函式，而您正試圖再次呼叫它。
        </p>
    </chapter>
    <chapter title="我該如何訂閱 Ktor 事件？" id="ktor-events">
        <p>
            請參閱<Links href="//server-events" summary="">應用程式監控</Links>頁面以了解更多資訊。
        </p>
    </chapter>
    <chapter title="如何解決「No configuration setting found for key ktor」錯誤？" id="cannot-find-application-conf">
        <p>
            這表示Ktor無法找到<Links href="//server-configuration-file" summary="了解如何在設定檔中配置各種伺服器參數。">設定檔</Links>。
            請確保<code>resources</code>資料夾中存在設定檔，且該<code>resources</code>資料夾已被正確標記。
            建議使用<a href="https://start.ktor.io/">Ktor專案產生器</a>或<a href="https://plugins.jetbrains.com/plugin/16008-ktor">IntelliJ IDEA Ultimate 的 Ktor 外掛程式</a>來建立專案，以獲得一個可運作的專案基底。如需更多資訊，請參閱<Links href="//server-create-a-new-project" summary="了解如何使用 Ktor 開啟、執行和測試伺服器應用程式。">建立、開啟並執行新的 Ktor 專案</Links>。
        </p>
    </chapter>
    <chapter title="我可以在 Android 上使用 Ktor 嗎？" id="android-support">
        <p>
            可以，已知Ktor伺服器和用戶端可在Android 5（API 21）或更高版本上運作，至少在使用Netty引擎時是如此。
        </p>
    </chapter>
    <chapter title="為什麼「CURL -I」會傳回「404 Not Found」？" id="curl-head-not-found">
        <p>
            <code>CURL -I</code>是<code>CURL --head</code>的別名，用於執行<code>HEAD</code>請求。
            預設情況下，Ktor不會為<code>GET</code>處理常式處理<code>HEAD</code>請求。
            若要啟用此功能，請安裝<Links href="//server-autoheadresponse" summary="%plugin_name% 能夠針對每個已定義 GET 的路由自動回應 HEAD 請求。">AutoHeadResponse</Links>外掛程式。
        </p>
    </chapter>
    <chapter title="如何解決使用「HttpsRedirect」外掛程式時的無限重定向問題？" id="infinite-redirect">
        <p>
            最可能的原因是您的後端位於反向代理或負載平衡器之後，而該中間設備正向您的後端發送一般的HTTP請求，因此Ktor後端內的<code>HttpsRedirect</code>外掛程式認為這是一個一般的HTTP請求，並以重定向作為回應。
        </p>
        <p>
            通常，反向代理會發送一些描述原始請求的標頭（例如原本是否為HTTPS或原始IP位址），而<Links href="//server-forward-headers" summary="所需的相依性：io.ktor:%artifact_name%">ForwardedHeader</Links>外掛程式可以解析這些標頭，讓<Links href="//server-https-redirect" summary="所需的相依性：io.ktor:%artifact_name%">HttpsRedirect</Links>外掛程式知道原始請求是HTTPS。
        </p>
    </chapter>
    <chapter title="如何在 Windows 上安裝「curl」以便在 Kotlin/Native 上使用對應的引擎？" id="native-curl">
        <p>
            <a href="#curl">Curl</a>用戶端引擎需要安裝
            <code>curl</code>程式庫。
            在Windows上，您可以考慮使用MinGW/MSYS2的<code>curl</code>二進位檔。
        </p>
        <procedure>
            <step>
                <p>
                    按照<a href="https://www.msys2.org/">MinGW/MSYS2</a>中的說明安裝MinGW/MSYS2。
                </p>
            </step>
            <step>
                <p>
                    使用以下指令安裝<code>libcurl</code>：
                </p>
                <code-block lang="shell" code="                    pacman -S mingw-w64-x86_64-curl"/>
            </step>
            <step>
                <p>
                    如果您將MinGW/MSYS2安裝在預設位置，請將
                    <Path>C:\\msys64\\mingw64\\bin\\</Path>
                    新增至<code>PATH</code>環境變數中。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="如何解決「NoTransformationFoundException」？" id="no-transformation-found-exception">
        <p>
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a>
            代表無法為<i>接收的主體</i>找到合適的轉換，無法將<b>結果</b>型別轉換為用戶端<b>預期</b>的型別。
        </p>
        <procedure>
            <step>
                <p>
                    檢查請求中的<code>Accept</code>標頭是否指定了所需的內容類型，以及伺服器回應中的<code>Content-Type</code>標頭是否與用戶端預期的型別相符。
                </p>
            </step>
            <step>
                <p>
                    為您正在處理的特定內容類型註冊必要的內容轉換。
                </p>
                <p>
                    您可以在用戶端使用<a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a>
                    外掛程式。
                    此外掛程式允許您指定如何針對不同的內容類型進行序列化和反序列化資料。
                </p>
                <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // 範例：註冊 JSON 內容轉換&#10;                            // 根據需要為其他內容類型新增更多轉換&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    確保您安裝了所有需要的外掛程式。可能缺少的功能包括：
                </p>
                <list type="bullet">
                    <li>用戶端<a href="https://ktor.io/docs/websocket-client.html">WebSockets</a>與
                        伺服器<a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                    <li>用戶端<a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a>與
                        伺服器<a href="https://ktor.io/docs/server-serialization.html">ContentNegotiation</a></li>
                    <li><a href="https://ktor.io/docs/compression.html">Compression</a></li>
                </list>
            </step>
        </procedure>
    </chapter>
</topic>