<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="常见问题"
       id="FAQ">
    <chapter title="Ktor 的正确发音是什么？" id="pronounce">
        <p>
            <emphasis>/keɪ-tor/</emphasis>
        </p>
    </chapter>
    <chapter title='"Ktor" 这个名字代表什么？' id="name-meaning">
        <p>
            Ktor 这个名字源自 <code>ctor</code> (构造函数) 的缩写，其中第一个字母被替换为 'K' 以表示 Kotlin。
        </p>
    </chapter>
    <chapter title="如何提问、报告 Bug、联系我们、贡献代码、提供反馈等？" id="feedback">
        <p>
            前往<a href="https://ktor.io/support/">支持</a>页面，了解更多关于可用支持渠道的信息。
            《<a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">如何贡献</a>》指南描述了您可以为 Ktor 贡献的方式。
        </p>
    </chapter>
    <chapter title="CIO 是什么意思？" id="cio">
        <p>
            CIO 代表
            <emphasis>基于协程的 I/O</emphasis>
            。
            通常，我们称之为使用 Kotlin 和协程实现 IETF RFC 或其他协议的逻辑，而不依赖外部基于 JVM 的库的引擎。
        </p>
    </chapter>
    <chapter title="如何修复未解析（红色）的 Ktor 导入？" id="ktor-artifact">
        <p>
            请确保相应的 <Links href="/ktor/server-dependencies" summary="了解如何将 Ktor 服务器依赖项添加到现有 Gradle/Maven 项目中。">Ktor 构件</Links> 已添加到构建脚本中。
        </p>
    </chapter>
    <chapter
            title="Ktor 是否提供捕获 IPC 信号（例如 SIGTERM 或 SIGINT）的方法，以便服务器可以优雅地关闭？"
            id="sigterm">
        <p>
            如果您正在运行一个 <a href="#engine-main">EngineMain</a>，它将自动处理。
            否则，您需要<a
                href="https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-cio/jvmAndNix/src/io/ktor/server/cio/EngineMain.kt#L21">手动处理</a>。
            您可以使用 <code>Runtime.getRuntime().addShutdownHook</code> 这一 JVM 机制。
        </p>
    </chapter>
    <chapter title="如何获取代理后面的客户端 IP？" id="proxy-ip">
        <p>
            如果代理提供了正确的标头并且 <Links href="/ktor/server-forward-headers" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✅">ForwardedHeader</Links> 插件已安装，则 <code>call.request.origin</code> 属性会提供有关原始调用者（即代理）的<a href="#request_information">连接信息</a>。
        </p>
    </chapter>
    <chapter title="如何测试 main 分支上的最新提交？" id="bleeding-edge">
        <p>
            您可以从 <code>jetbrains.space</code> 获取 Ktor 的每夜构建版本。
            从<a href="https://ktor.io/eap/">抢先体验计划</a>了解更多信息。
        </p>
    </chapter>
    <chapter title="如何确认我正在使用哪个版本的 Ktor？" id="ktor-version-used">
        <p>
            您可以使用 <Links href="/ktor/server-default-headers" summary="所需依赖项：io.ktor:%artifact_name% 原生服务器支持：✅">DefaultHeaders</Links> 插件，该插件会发送一个包含 Ktor 版本的 <code>Server</code> 响应标头，例如：
        </p>
        <code-block code="            Server: ktor-server-core/%ktor_version%"/>
    </chapter>
    <chapter title="我的路由未被执行。如何调试？" id="route-not-executing">
        <p>
            Ktor 提供了一种跟踪机制，可帮助排查路由决策问题。
            请查看<a href="#trace_routes">跟踪路由</a>章节。
        </p>
    </chapter>
    <chapter title="如何解决“Response has already been sent”？" id="response-already-sent">
        <p>
            这意味着您、某个插件或拦截器已经调用了 <code>call.respond* </code> 函数，而您又再次调用了它。
        </p>
    </chapter>
    <chapter title="如何订阅 Ktor 事件？" id="ktor-events">
        <p>
            请参阅<Links href="/ktor/server-events" summary="代码示例：%example_name%">应用程序监控</Links>页面了解更多信息。
        </p>
    </chapter>
    <chapter title="如何解决“No configuration setting found for key ktor”？" id="cannot-find-application-conf">
        <p>
            这意味着 Ktor 未能找到<Links href="/ktor/server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">配置文件</Links>。
            请确保 <code>resources</code> 文件夹中存在配置文件，并且 <code>resources</code> 文件夹已正确标记。
            建议使用<a href="https://start.ktor.io/">Ktor 项目生成器</a>或<a href="https://plugins.jetbrains.com/plugin/16008-ktor">适用于 IntelliJ IDEA Ultimate 的 Ktor 插件</a>来设置项目，以便拥有一个可运行的基础项目。更多信息请参见<Links href="/ktor/server-create-a-new-project" summary="了解如何使用 Ktor 打开、运行和测试服务器应用程序。">创建、打开和运行新的 Ktor 项目</Links>。
        </p>
    </chapter>
    <chapter title="我可以在 Android 上使用 Ktor 吗？" id="android-support">
        <p>
            是的，Ktor 服务器和客户端已知可以在 Android 5 (API 21) 或更高版本上运行，至少使用 Netty 引擎时如此。
        </p>
    </chapter>
    <chapter title="为什么 'CURL -I' 返回 '404 Not Found'？" id="curl-head-not-found">
        <p>
            <code>CURL -I</code> 是 <code>CURL --head</code> 的别名，它执行 <code>HEAD</code> 请求。
            默认情况下，Ktor 不会处理针对 <code>GET</code> 处理器发出的 <code>HEAD</code> 请求。
            要启用此功能，请安装<Links href="/ktor/server-autoheadresponse" summary="%plugin_name% 提供了为每个定义了 GET 的路由自动响应 HEAD 请求的能力。">AutoHeadResponse</Links> 插件。
        </p>
    </chapter>
    <chapter title="使用 'HttpsRedirect' 插件时如何解决无限重定向？" id="infinite-redirect">
        <p>
            最可能的原因是您的后端位于反向代理或负载均衡器之后，并且该中间层正在向您的后端发出普通的 HTTP 请求，因此您 Ktor 后端中的 <code>HttpsRedirect</code> 插件认为这是一个普通的 HTTP 请求并以重定向响应。
        </p>
        <p>
            通常，反向代理会发送一些描述原始请求（例如它是 HTTPS 或原始 IP 地址）的标头，并且有一个插件 <Links href="/ktor/server-forward-headers" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✅">ForwardedHeader</Links> 用于解析这些标头，这样 <Links href="/ktor/server-https-redirect" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✅">HttpsRedirect</Links> 插件就知道原始请求是 HTTPS。
        </p>
    </chapter>
    <chapter title="如何在 Windows 上安装 'curl' 以在 Kotlin/Native 上使用相应的引擎？" id="native-curl">
        <p>
            <a href="#curl">Curl</a> 客户端引擎需要安装 <code>curl</code> 库。
            在 Windows 上，您可能需要考虑使用 MinGW/MSYS2 <code>curl</code> 二进制文件。
        </p>
        <procedure>
            <step>
                <p>
                    按照<a href="https://www.msys2.org/">MinGW/MSYS2</a>中的描述安装 MinGW/MSYS2。
                </p>
            </step>
            <step>
                <p>
                    使用以下命令安装 <code>libcurl</code>：
                </p>
                <code-block lang="shell" code="                    pacman -S mingw-w64-x86_64-curl"/>
            </step>
            <step>
                <p>
                    如果您将 MinGW/MSYS2 安装到默认位置，请将<Path>C:\\msys64\\mingw64\\bin\\</Path>添加到 <code>PATH</code> 环境变量中。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="如何解决 'NoTransformationFoundException'？" id="no-transformation-found-exception">
        <p>
            <a href="https://api.ktor.io/ktor-client/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a> 表示未能找到适合将<i>接收到的正文</i>从<b>结果</b>类型转换为客户端<b>期望</b>类型的转换。
        </p>
        <procedure>
            <step>
                <p>
                    检查您请求中的 <code>Accept</code> 标头是否指定了所需的内容类型，以及服务器响应中的 <code>Content-Type</code> 标头是否与客户端期望的类型匹配。
                </p>
            </step>
            <step>
                <p>
                    注册针对您正在使用的特定内容类型所需的转换。
                </p>
                <p>
                    您可以在客户端使用<a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a>插件。此插件允许您指定如何序列化和反序列化不同内容类型的数据。
                </p>
                <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // 示例：注册 JSON 内容转换&#10;                            // 根据需要添加更多针对其他内容类型的转换&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    请确保您安装了所有所需的插件。可能缺失的特性有：
                </p>
                <list type="bullet">
                    <li>客户端 <a href="https://ktor.io/docs/websocket-client.html">WebSockets</a> 和 服务器 <a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                    <li>客户端 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> 和 服务器 <a href="https://ktor.io/docs/serialization.html">ContentNegotiation</a></li>
                    <li><a href="https://ktor.io/docs/compression.html">Compression</a></li>
                </list>
            </step>
        </procedure>
    </chapter>
</topic>