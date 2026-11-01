---
aside: false
---
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="歡迎"
       id="welcome">
    <section-starting-page>
        <title>Ktor 文件</title>
        <description>
            Ktor 是一個用於輕鬆建置非同步伺服器端與用戶端應用程式的架構。
        </description>
        <spotlight>
            <card href="server-create-a-new-project.topic" summary="了解如何使用 Ktor 建立、執行與測試伺服器應用程式。">
                開始使用 Ktor Server
            </card>
            <card href="client-create-new-application.topic" summary="了解如何使用 Ktor 建立、執行與測試用戶端應用程式。">
                開始使用 Ktor Client
            </card>
        </spotlight>
        <primary>
            <title>Ktor Server</title>
            <card href="server-requests-and-responses.topic" summary="透過建立任務管理器應用程式，了解路由與請求在 Ktor 中如何運作。">
                處理請求並產生回應
            </card>
            <card href="server-create-restful-apis.topic" summary="了解如何使用 Ktor 建構 RESTful API。本教學涵蓋實際範例的設定、路由與測試。">建立 RESTful API</card>
            <card href="server-create-website.topic" summary="了解如何使用 Kotlin、Ktor 和 Thymeleaf 範本建構網站。">建立網站</card>
            <card href="server-create-websocket-application.topic" summary="了解如何利用 WebSockets 的強大功能來傳送與接收內容。">
                建立 WebSocket 應用程式
            </card>
            <card href="server-integrate-database.md" summary="了解使用 Exposed SQL 程式庫將 Ktor 服務連接至資料庫存儲庫的流程。">整合資料庫</card>
        </primary>
        <misc>
            <links narrow="true">
                <group>
                    <title>伺服器配置</title>
                    <Links href="server-create-a-new-project.topic" summary="了解如何使用 Ktor 開啟、執行與測試伺服器應用程式。">建立、開啟與執行新的 Ktor 專案</Links>
                    <Links href="server-dependencies.topic" summary="了解如何將 Ktor Server 相依性新增至現有的 Gradle/Maven 專案。">新增伺服器相依性</Links>
                    <Links href="server-create-and-configure.topic" summary="了解如何根據您的應用程式部署需求建立伺服器。">建立伺服器</Links>
                    <Links href="server-configuration-code.topic" summary="了解如何在程式碼中配置各種伺服器參數。">以程式碼進行配置</Links>
                    <Links href="server-configuration-file.topic" summary="了解如何在設定檔中配置各種伺服器參數。">以檔案進行配置</Links>
                    <Links href="server-plugins.md" summary="外掛程式提供常見功能，例如序列化、內容編碼、壓縮等。">伺服器外掛程式</Links>
                </group>
                <group>
                    <title>路由</title>
                    <Links href="server-routing.md" summary="路由是在伺服器應用程式中處理傳入請求的核心外掛程式。">路由</Links>
                    <Links href="server-resources.md" summary="Resources 外掛程式可讓您實作型別安全的路由。">型別安全路由</Links>
                    <Links href="server-routing-organization.md" summary="了解如何隨著 Ktor 應用程式的擴展來組織和建構您的路由邏輯。">路由組織</Links>
                    <Links href="server-requests.md" summary="了解如何在路由處理常式中處理傳入請求。">處理請求</Links>
                    <Links href="server-responses.md" summary="了解如何傳送不同類型的回應。">傳送回應</Links>
                    <Links href="server-static-content.md" summary="了解如何提供樣式表、指令碼、圖片等靜態內容。">提供靜態內容</Links>
                </group>
                <group>
                    <title>外掛程式</title>
                    <Links href="server-serialization.md" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間交涉媒體類型，以及將內容序列化/反序列化為特定格式。">Ktor Server 中的內容交涉與序列化</Links>
                    <Links href="server-templating.md" summary="了解如何使用以 HTML/CSS 或 JVM 範本引擎建置的檢視。">範本製作</Links>
                    <Links href="server-auth.md" summary="Authentication 外掛程式負責處理 Ktor 中的驗證與授權。">Ktor Server 中的驗證與授權</Links>
                    <Links href="server-sessions.md" summary="Sessions 外掛程式提供了一種在不同 HTTP 請求之間保留資料的機制。">工作階段 (Sessions)</Links>
                    <Links href="server-websockets.md" summary="Websockets 外掛程式可讓您在伺服器與用戶端之間建立多向通訊工作階段。">Ktor Server 中的 WebSockets</Links>
                    <Links href="server-server-sent-events.topic" summary="SSE 外掛程式可讓伺服器透過 HTTP 連線向用戶端傳送基於事件的更新。">Ktor Server 中的 Server-Sent Events</Links>
                    <Links href="server-swagger-ui.md" summary="SwaggerUI 外掛程式可讓您為專案產生 Swagger UI。">Swagger UI</Links> / <Links href="server-openapi.md" summary="OpenAPI 外掛程式可讓您為專案產生 OpenAPI 文件。">OpenAPI</Links>
                    <Links href="server-custom-plugins.md" summary="了解如何建立您自己的自訂外掛程式。">自訂伺服器外掛程式</Links>
                </group>
                <group>
                    <title>執行、偵錯與測試</title>
                    <Links href="server-run.md" summary="了解如何執行伺服器 Ktor 應用程式。">執行</Links>
                    <Links href="server-auto-reload.topic" summary="了解如何使用自動重新載入（Auto-reload）在程式碼變更時重新載入應用程式類別。">自動重新載入</Links>
                    <Links href="server-testing.md" summary="了解如何使用專用的測試引擎測試您的伺服器應用程式。">Ktor Server 中的測試</Links>
                </group>
                <group>
                    <title>部署</title>
                    <Links href="server-fatjar.md" summary="了解如何使用 Ktor Gradle 外掛程式建立並執行可執行的 Fat JAR。">建立 Fat JAR</Links>
                    <Links href="server-war.md" summary="了解如何使用 WAR 保存檔在 Servlet 容器中執行和部署 Ktor 應用程式。">WAR</Links>
                    <Links href="graalvm.md" summary="了解如何在不同平台上使用 GraalVM 製作原生映像檔。">GraalVM</Links>
                    <Links href="docker.md" summary="了解如何將您的應用程式部署到 Docker 容器。">Docker</Links>
                    <Links href="google-app-engine.md" summary="了解如何將專案部署到 Google App Engine 標準環境。">將 Ktor 應用程式部署至 Google App Engine</Links>
                    <Links href="heroku.md" summary="了解如何準備並將 Ktor 應用程式部署到 Heroku。">Heroku</Links>
                    <Links href="sevalla.md" summary="了解如何準備並將 Ktor 應用程式部署到 Sevalla。">Sevalla</Links>
                </group>
            </links>
            <cards>
                <title>Ktor Client</title>
                <card href="client-create-new-application.topic" summary="使用 Ktor 建立用戶端應用程式。">
                    建立用戶端應用程式
                </card>
                <card href="client-create-multiplatform-application.md" summary="建立 Kotlin Multiplatform Mobile 應用程式，並學習如何使用 Ktor Client 發出請求與接收回應。">
                    建立跨平台行動應用程式
                </card>
            </cards>
            <links narrow="true">
                <group>
                    <title>用戶端設定</title>
                    <Links href="client-create-new-application.topic" summary="建立您的第一個用於傳送請求和接收回應的用戶端應用程式。">建立用戶端應用程式</Links>
                    <Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>
                    <Links href="client-create-and-configure.md" summary="了解如何建立與配置 Ktor 用戶端。">建立與配置用戶端</Links>
                    <Links href="client-engines.md" summary="了解處理網路請求的引擎。">用戶端引擎</Links>
                    <Links href="client-plugins.md" summary="了解如何使用用戶端外掛程式新增常見功能，例如記錄、序列化與授權。">用戶端外掛程式</Links>
                </group>
                <group>
                    <title>請求</title>
                    <Links href="client-requests.md" summary="了解如何發出請求並指定各種請求參數：請求 URL、HTTP 方法、標頭以及請求內文。">發出請求</Links>
                    <Links href="client-resources.md" summary="了解如何使用 Resources 外掛程式發出型別安全請求。">型別安全請求</Links>
                    <Links href="client-default-request.md" summary="DefaultRequest 外掛程式可讓您為所有請求配置預設參數。">預設請求</Links>
                    <Links href="client-request-retry.md" summary="HttpRequestRetry 外掛程式可讓您為失敗的請求配置重試原則。">重試失敗的請求</Links>
                </group>
                <group>
                    <title>回應</title>
                    <Links href="client-responses.md" summary="了解如何接收回應、取得回應內文以及獲取回應參數。">接收回應</Links>
                    <Links href="client-response-validation.md" summary="了解如何根據回應的狀態碼驗證回應。">回應驗證</Links>
                </group>
                <group>
                    <title>外掛程式</title>
                    <Links href="client-auth.md" summary="Auth 外掛程式負責處理用戶端應用程式中的驗證與授權。">Ktor Client 中的驗證與授權</Links>
                    <Links href="client-cookies.md" summary="HttpCookies 外掛程式會自動處理 Cookie，並在呼叫之間將其保存在儲存區中。">Cookie</Links>
                    <Links href="client-content-encoding.md" summary="ContentEncoding 外掛程式可讓您啟用指定的壓縮演算法（例如 'gzip' 和 'deflate'）並配置其設定。">內容編碼</Links>
                    <Links href="client-bom-remover.md" summary="BOMRemover 外掛程式可讓您從回應內文中移除位元組順序記號 (BOM)。">BOM 移除器</Links>
                    <Links href="client-caching.md" summary="HttpCache 外掛程式可讓您將先前擷取的資源儲存在記憶體或永續快取中。">快取</Links>
                    <Links href="client-websockets.topic" summary="Websockets 外掛程式可讓您在伺服器與用戶端之間建立多向通訊工作階段。">Ktor Client 中的 WebSockets</Links>
                    <Links href="client-server-sent-events.topic" summary="SSE 外掛程式可讓用戶端透過 HTTP 連線接收來自伺服器的事件型更新。">Ktor Client 中的 Server-Sent Events</Links>
                    <Links href="client-custom-plugins.md" summary="了解如何建立您自訂的用戶端外掛程式。">自訂用戶端外掛程式</Links>
                </group>
                <group>
                    <title>測試</title>
                    <Links href="client-testing.md" summary="了解如何透過模擬 HTTP 呼叫，使用 MockEngine 測試您的用戶端。">Ktor Client 中的測試</Links>
                </group>
            </links>
            <cards>
                <title>整合</title>
                <card href="full-stack-development-with-kotlin-multiplatform.topic" summary="了解如何使用 Kotlin 和 Ktor 開發跨平台全端應用程式。">使用 Kotlin Multiplatform 建構全端應用程式</card>
                <card href="tutorial-first-steps-with-kotlin-rpc.md" summary="了解如何使用 Kotlin RPC 與 Ktor 建立您的第一個應用程式。">Kotlin RPC 入門</card>
            </cards>
        </misc>
    </section-starting-page>
</topic>