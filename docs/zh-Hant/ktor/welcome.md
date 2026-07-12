---
aside: false
---
<topic
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
    title="歡迎"
    id="welcome">
    <section-starting-page>
        <title>Ktor 文件</title>
        <description>
            Ktor 是一個能輕鬆建構非同步伺服器端和用戶端應用程式的框架。
        </description>
        <spotlight>
            <a href="server-create-a-new-project.md" summary="了解如何使用 Ktor 建立、執行和測試伺服器應用程式。">Ktor 伺服器入門</a>
            <a href="client-create-new-application.md" summary="了解如何使用 Ktor 建立、執行和測試用戶端應用程式。">Ktor 用戶端入門</a>
        </spotlight>
        <primary>
            <title>Ktor 伺服器</title>
            <a href="server-application-structure.md" summary="了解如何建構您的應用程式，使其隨著應用程式的成長而保持可維護性。">應用程式結構</a>
            <a href="server-routing.md" summary="路由是處理伺服器應用程式中傳入請求的核心外掛程式。">路由</a>
            <a href="server-requests.md" summary="了解如何在路由處理器中處理傳入請求。">處理請求</a>
            <a href="server-responses.md" summary="了解如何傳送不同類型的回應。">傳送回應</a>
            <a href="server-serialization.md" summary="內容協商與序列化外掛程式。">內容協商與序列化</a>
        </primary>
        <secondary>
            <title>伺服器配置</title>
            <a href="server-create-a-new-project.md" summary="建立、開啟和執行新的 Ktor 專案">建立新專案</a>
            <a href="server-dependencies.md" summary="新增伺服器依賴項">新增依賴項</a>
            <a href="server-create-and-configure.md" summary="建立伺服器">建立伺服器</a>
            <a href="server-configuration-code.md" summary="程式碼配置">程式碼配置</a>
            <a href="server-configuration-file.md" summary="檔案配置">檔案配置</a>
            <a href="server-plugins.md" summary="伺服器外掛程式">伺服器外掛程式</a>
        </secondary>
        <secondary>
            <title>路由</title>
            <a href="server-routing.md" summary="路由">路由</a>
            <a href="server-resources.md" summary="型別安全路由">型別安全路由</a>
            <a href="server-application-structure.md" summary="應用程式結構">應用程式結構</a>
            <a href="server-requests.md" summary="處理請求">處理請求</a>
            <a href="server-responses.md" summary="傳送回應">傳送回應</a>
            <a href="server-static-content.md" summary="提供靜態內容">提供靜態內容</a>
        </secondary>
        <secondary>
            <title>外掛程式</title>
            <a href="server-serialization.md" summary="內容協商與序列化">內容協商與序列化</a>
            <a href="server-templating.md" summary="模板">模板</a>
            <a href="server-auth.md" summary="驗證與授權">驗證與授權</a>
            <a href="server-sessions.md" summary="會話">會話</a>
            <a href="server-websockets.md" summary="WebSocket">WebSocket</a>
            <a href="server-custom-plugins.md" summary="自訂伺服器外掛程式">自訂伺服器外掛程式</a>
        </secondary>
        <secondary>
            <title>執行、偵錯與測試</title>
            <a href="server-run.md" summary="執行">執行</a>
            <a href="server-auto-reload.md" summary="自動重新載入">自動重新載入</a>
            <a href="server-testing.md" summary="Ktor 伺服器中的測試">測試</a>
        </secondary>
        <secondary>
            <title>部署</title>
            <a href="server-fatjar.md" summary="建立 Fat JAR">建立 Fat JAR</a>
            <a href="server-war.md" summary="WAR">WAR</a>
            <a href="graalvm.md" summary="GraalVM">GraalVM</a>
            <a href="docker.md" summary="Docker">Docker</a>
            <a href="google-app-engine.md" summary="Google App Engine">Google App Engine</a>
            <a href="heroku.md" summary="Heroku">Heroku</a>
        </secondary>
        <misc>
            <cards>
                <title>Ktor 用戶端</title>
                <card href="client-create-new-application.md" summary="使用 Ktor 建立用戶端應用程式。">建立用戶端應用程式</card>
                <card href="client-create-multiplatform-application.md" summary="建立跨平台行動應用程式。">建立跨平台行動應用程式</card>
            </cards>
            <secondary>
                <title>用戶端設定</title>
                <a href="client-create-new-application.md" summary="建立用戶端應用程式">建立用戶端應用程式</a>
                <a href="client-dependencies.md" summary="新增用戶端依賴項">新增依賴項</a>
                <a href="client-create-and-configure.md" summary="建立和配置用戶端">建立和配置用戶端</a>
                <a href="client-engines.md" summary="用戶端引擎">用戶端引擎</a>
                <a href="client-plugins.md" summary="用戶端外掛程式">用戶端外掛程式</a>
            </secondary>
            <secondary>
                <title>請求</title>
                <a href="client-requests.md" summary="發送請求">發送請求</a>
                <a href="client-resources.md" summary="型別安全請求">型別安全請求</a>
                <a href="client-default-request.md" summary="預設請求">預設請求</a>
                <a href="client-request-retry.md" summary="重試失敗的請求">重試失敗的請求</a>
            </secondary>
            <secondary>
                <title>回應</title>
                <a href="client-responses.md" summary="接收回應">接收回應</a>
                <a href="client-response-validation.md" summary="回應驗證">回應驗證</a>
            </secondary>
            <secondary>
                <title>外掛程式</title>
                <a href="client-auth.md" summary="驗證與授權">驗證與授權</a>
                <a href="client-cookies.md" summary="Cookie">Cookie</a>
                <a href="client-content-encoding.md" summary="內容編碼">內容編碼</a>
                <a href="client-caching.md" summary="快取">快取</a>
                <a href="client-websockets.md" summary="WebSocket">WebSocket</a>
                <a href="client-custom-plugins.md" summary="自訂用戶端外掛程式">自訂用戶端外掛程式</a>
            </secondary>
            <secondary>
                <title>測試</title>
                <a href="client-testing.md" summary="Ktor 用戶端中的測試">測試</a>
            </secondary>
            <cards>
                <title>整合</title>
                <card href="htmx-integration.md" summary="HTMX 整合">HTMX 整合</card>
                <card href="openapi-spec-generation.md" summary="OpenAPI 規範生成">OpenAPI 規範生成</card>
            </cards>
        </misc>
    </section-starting-page>
</topic>
