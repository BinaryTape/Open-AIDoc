---
aside: false
---
<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="欢迎"
       id="welcome">
    <section-starting-page>
        <title>Ktor 文档</title>
        <description>
            Ktor 是一个用于轻松构建异步服务器端和客户端应用程序的框架。
        </description>
        <spotlight>
            <card href="server-create-a-new-project.topic" summary="了解如何使用 Ktor 创建、运行和测试服务器应用程序。">
                Ktor Server 入门
            </card>
            <card href="client-create-new-application.topic" summary="了解如何使用 Ktor 创建、运行和测试客户端应用程序。">
                Ktor Client 入门
            </card>
        </spotlight>
        <primary>
            <title>Ktor Server</title>
            <card href="server-requests-and-responses.topic" summary="通过创建任务管理器应用程序，了解 Ktor 中的路由和请求是如何工作的。">
                处理请求并生成响应
            </card>
            <card href="server-create-restful-apis.topic" summary="了解如何使用 Ktor 构建 RESTful API。本教程通过一个实际示例介绍设置、路由和测试。">创建 RESTful API</card>
            <card href="server-create-website.topic" summary="了解如何使用 Ktor 和 Thymeleaf 模板在 Kotlin 中构建网站。">创建网站</card>
            <card href="server-create-websocket-application.topic" summary="了解如何利用 WebSocket 的强大功能来发送和接收内容。">
                创建 WebSocket 应用程序
            </card>
            <card href="server-integrate-database.md" summary="了解使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库的过程。">集成数据库</card>
        </primary>
        <misc>
            <links narrow="true">
                <group>
                    <title>服务器配置</title>
                    <Links href="server-create-a-new-project.topic" summary="了解如何使用 Ktor 打开、运行和测试服务器应用程序。">创建、打开并运行新的 Ktor 项目</Links>
                    <Links href="server-dependencies.topic" summary="了解如何向现有的 Gradle/Maven 项目添加 Ktor Server 依赖项。">添加服务器依赖项</Links>
                    <Links href="server-create-and-configure.topic" summary="了解如何根据应用程序的部署需求创建服务器。">创建服务器</Links>
                    <Links href="server-configuration-code.topic" summary="了解如何在代码中配置各种服务器参数。">代码内配置</Links>
                    <Links href="server-configuration-file.topic" summary="了解如何在配置文件中配置各种服务器参数。">文件内配置</Links>
                    <Links href="server-plugins.md" summary="插件提供常见功能，例如序列化、内容编码、压缩等。">服务器插件</Links>
                </group>
                <group>
                    <title>路由</title>
                    <Links href="server-routing.md" summary="路由是在服务器应用程序中处理传入请求的核心插件。">路由</Links>
                    <Links href="server-resources.md" summary="Resources 插件允许你实现类型安全路由。">类型安全路由</Links>
                    <Links href="server-routing-organization.md" summary="了解随着 Ktor 应用程序的增长如何组织和构建路由逻辑。">路由组织</Links>
                    <Links href="server-requests.md" summary="了解如何在路由处理程序内处理传入请求。">处理请求</Links>
                    <Links href="server-responses.md" summary="了解如何发送不同类型的响应。">发送响应</Links>
                    <Links href="server-static-content.md" summary="了解如何提供静态内容服务，例如样式表、脚本、图像等。">提供静态内容服务</Links>
                </group>
                <group>
                    <title>插件</title>
                    <Links href="server-serialization.md" summary="ContentNegotiation 插件有两个主要用途：在客户端与服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">Ktor Server 中的内容协商与序列化</Links>
                    <Links href="server-templating.md" summary="了解如何使用由 HTML/CSS 或 JVM 模板引擎构建的视图。">模板生成</Links>
                    <Links href="server-auth.md" summary="Authentication 插件用于在 Ktor 中处理身份验证和授权。">Ktor Server 中的身份验证与授权</Links>
                    <Links href="server-sessions.md" summary="Sessions 插件提供了在不同 HTTP 请求之间持久化数据的机制。">会话</Links>
                    <Links href="server-websockets.md" summary="Websockets 插件允许你在服务器和客户端之间创建多向通信会话。">Ktor Server 中的 WebSocket</Links>
                    <Links href="server-server-sent-events.topic" summary="SSE 插件允许服务器通过 HTTP 连接向客户端发送基于事件的更新。">Ktor Server 中的服务器发送事件 (Server-Sent Events)</Links>
                    <Links href="server-swagger-ui.md" summary="SwaggerUI 插件允许你为项目生成 Swagger UI。">Swagger UI</Links> / <Links href="server-openapi.md" summary="OpenAPI 插件允许你为项目生成 OpenAPI 文档。">OpenAPI</Links>
                    <Links href="server-custom-plugins.md" summary="了解如何创建自己的自定义插件。">自定义服务器插件</Links>
                </group>
                <group>
                    <title>运行、调试和测试</title>
                    <Links href="server-run.md" summary="了解如何运行 Ktor 服务器应用程序。">运行</Links>
                    <Links href="server-auto-reload.topic" summary="了解如何在代码更改时使用自动重载功能重新加载应用程序类。">自动重载</Links>
                    <Links href="server-testing.md" summary="了解如何使用专用测试引擎测试你的服务器应用程序。">Ktor Server 中的测试</Links>
                </group>
                <group>
                    <title>部署</title>
                    <Links href="server-fatjar.md" summary="了解如何使用 Ktor Gradle 插件创建并运行可执行的 fat JAR。">创建 Fat JAR</Links>
                    <Links href="server-war.md" summary="了解如何使用 WAR 归档在 Servlet 容器中运行和部署 Ktor 应用程序。">WAR</Links>
                    <Links href="graalvm.md" summary="了解如何在不同平台上使用 GraalVM 构建原生映像。">GraalVM</Links>
                    <Links href="docker.md" summary="了解如何将应用程序部署到 Docker 容器。">Docker</Links>
                    <Links href="google-app-engine.md" summary="了解如何将项目部署到 Google App Engine 标准环境。">将 Ktor 应用程序部署到 Google App Engine</Links>
                    <Links href="heroku.md" summary="了解如何准备 Ktor 应用程序并将其部署到 Heroku。">Heroku</Links>
                    <Links href="sevalla.md" summary="了解如何准备 Ktor 应用程序并将其部署到 Sevalla。">Sevalla</Links>
                </group>
            </links>
            <cards>
                <title>Ktor Client</title>
                <card href="client-create-new-application.topic" summary="使用 Ktor 创建客户端应用程序。">
                    创建客户端应用程序
                </card>
                <card href="client-create-multiplatform-application.md" summary="创建 Kotlin Multiplatform Mobile 应用程序，并了解如何使用 Ktor Client 发出请求和接收响应。">
                    创建跨平台移动应用程序
                </card>
            </cards>
            <links narrow="true">
                <group>
                    <title>客户端设置</title>
                    <Links href="client-create-new-application.topic" summary="创建你的第一个用于发送请求和接收响应的客户端应用程序。">创建客户端应用程序</Links>
                    <Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>
                    <Links href="client-create-and-configure.md" summary="了解如何创建和配置 Ktor 客户端。">创建与配置客户端</Links>
                    <Links href="client-engines.md" summary="了解处理网络请求的引擎。">客户端引擎</Links>
                    <Links href="client-plugins.md" summary="了解如何使用客户端插件添加通用功能，例如日志记录、序列化和授权。">客户端插件</Links>
                </group>
                <group>
                    <title>请求</title>
                    <Links href="client-requests.md" summary="了解如何发出请求并指定各种请求形参：请求 URL、HTTP 方法、标头和请求体。">发出请求</Links>
                    <Links href="client-resources.md" summary="了解如何使用 Resources 插件发出类型安全请求。">类型安全请求</Links>
                    <Links href="client-default-request.md" summary="DefaultRequest 插件允许你为所有请求配置默认形参。">默认请求</Links>
                    <Links href="client-request-retry.md" summary="HttpRequestRetry 插件允许你为失败的请求配置重试策略。">重试失败的请求</Links>
                </group>
                <group>
                    <title>响应</title>
                    <Links href="client-responses.md" summary="了解如何接收响应、获取响应体以及获取响应形参。">接收响应</Links>
                    <Links href="client-response-validation.md" summary="了解如何根据响应的状态码对其进行验证。">响应验证</Links>
                </group>
                <group>
                    <title>插件</title>
                    <Links href="client-auth.md" summary="Auth 插件用于在客户端应用程序中处理身份验证和授权。">Ktor Client 中的身份验证与授权</Links>
                    <Links href="client-cookies.md" summary="HttpCookies 插件会自动处理 Cookie 并将其保存在存储区中以供调用间共享。">Cookie</Links>
                    <Links href="client-content-encoding.md" summary="ContentEncoding 插件允许你启用指定的压缩算法（例如 'gzip' 和 'deflate'）并配置其设置。">内容编码</Links>
                    <Links href="client-bom-remover.md" summary="BOMRemover 插件允许你从响应体中移除字节顺序标记 (BOM)。">BOM 移除器</Links>
                    <Links href="client-caching.md" summary="HttpCache 插件允许你将先前获取的资源保存在内存或持久缓存中。">缓存</Links>
                    <Links href="client-websockets.topic" summary="Websockets 插件允许你在服务器和客户端之间创建多向通信会话。">Ktor Client 中的 WebSocket</Links>
                    <Links href="client-server-sent-events.topic" summary="SSE 插件允许客户端通过 HTTP 连接接收来自服务器的基于事件的更新。">Ktor Client 中的服务器发送事件 (Server-Sent Events)</Links>
                    <Links href="client-custom-plugins.md" summary="了解如何创建自己的自定义客户端插件。">自定义客户端插件</Links>
                </group>
                <group>
                    <title>测试</title>
                    <Links href="client-testing.md" summary="了解如何通过模拟 HTTP 调用使用 MockEngine 测试你的客户端。">Ktor Client 中的测试</Links>
                </group>
            </links>
            <cards>
                <title>集成</title>
                <card href="full-stack-development-with-kotlin-multiplatform.topic" summary="了解如何使用 Kotlin 和 Ktor 开发跨平台全栈应用程序。">使用 Kotlin Multiplatform 构建全栈应用程序</card>
                <card href="tutorial-first-steps-with-kotlin-rpc.md" summary="了解如何使用 Kotlin RPC 和 Ktor 创建你的第一个应用程序。">Kotlin RPC 入门</card>
            </cards>
        </misc>
    </section-starting-page>
</topic>