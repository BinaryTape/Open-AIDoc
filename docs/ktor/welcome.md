---
aside: false
---
<topic
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
    title="欢迎"
    id="welcome">
    <section-starting-page>
        <title>Ktor 文档</title>
        <description>
            Ktor 是一个用于轻松构建异步服务器端和客户端应用程序的框架。
        </description>
        <spotlight>
            <a href="server-create-a-new-project.md" summary="了解如何使用 Ktor 创建、运行和测试服务器应用程序。">Ktor 服务器端入门</a>
            <a href="client-create-new-application.md" summary="了解如何使用 Ktor 创建、运行和测试客户端应用程序。">Ktor 客户端入门</a>
        </spotlight>
        <primary>
            <title>Ktor 服务器端</title>
            <a href="server-application-structure.md" summary="了解如何构建应用程序，以在应用程序增长时保持其可维护性。">应用程序结构</a>
            <a href="server-routing.md" summary="路由是用于处理服务器应用程序中传入请求的核心插件。">路由</a>
            <a href="server-requests.md" summary="了解如何在路由处理器内部处理传入请求。">处理请求</a>
            <a href="server-responses.md" summary="了解如何发送不同类型的响应。">发送响应</a>
            <a href="server-serialization.md" summary="内容协商和序列化插件。">内容协商和序列化</a>
        </primary>
        <secondary>
            <title>服务器配置</title>
            <a href="server-create-a-new-project.md" summary="创建、打开和运行新的 Ktor 项目">创建新项目</a>
            <a href="server-dependencies.md" summary="添加服务器依赖项">添加依赖项</a>
            <a href="server-create-and-configure.md" summary="创建服务器">创建服务器</a>
            <a href="server-configuration-code.md" summary="代码配置">代码配置</a>
            <a href="server-configuration-file.md" summary="文件配置">文件配置</a>
            <a href="server-plugins.md" summary="服务器插件">服务器插件</a>
        </secondary>
        <secondary>
            <title>路由</title>
            <a href="server-routing.md" summary="路由">路由</a>
            <a href="server-resources.md" summary="类型安全的路由">类型安全的路由</a>
            <a href="server-application-structure.md" summary="应用程序结构">应用程序结构</a>
            <a href="server-requests.md" summary="处理请求">处理请求</a>
            <a href="server-responses.md" summary="发送响应">发送响应</a>
            <a href="server-static-content.md" summary="提供静态内容">提供静态内容</a>
        </secondary>
        <secondary>
            <title>插件</title>
            <a href="server-serialization.md" summary="内容协商和序列化">内容协商和序列化</a>
            <a href="server-templating.md" summary="模板">模板</a>
            <a href="server-auth.md" summary="认证和授权">认证和授权</a>
            <a href="server-sessions.md" summary="会话">会话</a>
            <a href="server-websockets.md" summary="WebSocket">WebSocket</a>
            <a href="server-custom-plugins.md" summary="自定义服务器插件">自定义服务器插件</a>
        </secondary>
        <secondary>
            <title>运行、调试和测试</title>
            <a href="server-run.md" summary="运行">运行</a>
            <a href="server-auto-reload.md" summary="自动重载">自动重载</a>
            <a href="server-testing.md" summary="Ktor 服务器端测试">测试</a>
        </secondary>
        <secondary>
            <title>部署</title>
            <a href="server-fatjar.md" summary="创建 Fat JAR">创建 Fat JAR</a>
            <a href="server-war.md" summary="WAR">WAR</a>
            <a href="graalvm.md" summary="GraalVM">GraalVM</a>
            <a href="docker.md" summary="Docker">Docker</a>
            <a href="google-app-engine.md" summary="Google App Engine">Google App Engine</a>
            <a href="heroku.md" summary="Heroku">Heroku</a>
        </secondary>
        <misc>
            <cards>
                <title>Ktor 客户端</title>
                <card href="client-create-new-application.md" summary="使用 Ktor 创建客户端应用程序。">创建客户端应用程序</card>
                <card href="client-create-multiplatform-application.md" summary="创建跨平台移动应用程序。">创建跨平台移动应用程序</card>
            </cards>
            <secondary>
                <title>客户端设置</title>
                <a href="client-create-new-application.md" summary="创建客户端应用程序">创建客户端应用程序</a>
                <a href="client-dependencies.md" summary="添加客户端依赖项">添加客户端依赖项</a>
                <a href="client-create-and-configure.md" summary="创建和配置客户端">创建和配置客户端</a>
                <a href="client-engines.md" summary="客户端引擎">客户端引擎</a>
                <a href="client-plugins.md" summary="客户端插件">客户端插件</a>
            </secondary>
            <secondary>
                <title>请求</title>
                <a href="client-requests.md" summary="发出请求">发出请求</a>
                <a href="client-resources.md" summary="类型安全的请求">类型安全的请求</a>
                <a href="client-default-request.md" summary="默认请求">默认请求</a>
                <a href="client-request-retry.md" summary="重试失败的请求">重试失败的请求</a>
            </secondary>
            <secondary>
                <title>响应</title>
                <a href="client-responses.md" summary="接收响应">接收响应</a>
                <a href="client-response-validation.md" summary="响应验证">响应验证</a>
            </secondary>
            <secondary>
                <title>插件</title>
                <a href="client-auth.md" summary="认证和授权">认证和授权</a>
                <a href="client-cookies.md" summary="Cookies">Cookies</a>
                <a href="client-content-encoding.md" summary="内容编码">内容编码</a>
                <a href="client-caching.md" summary="缓存">缓存</a>
                <a href="client-websockets.md" summary="WebSocket">WebSocket</a>
                <a href="client-custom-plugins.md" summary="自定义客户端插件">自定义客户端插件</a>
            </secondary>
            <secondary>
                <title>测试</title>
                <a href="client-testing.md" summary="Ktor 客户端测试">测试</a>
            </secondary>
            <cards>
                <title>集成</title>
                <card href="htmx-integration.md" summary="HTMX 集成">HTMX 集成</card>
                <card href="openapi-spec-generation.md" summary="OpenAPI 规范生成">OpenAPI 规范生成</card>
            </cards>
        </misc>
    </section-starting-page>
</topic>
