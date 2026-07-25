<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="常见问题解答"
       id="FAQ">
    <chapter title="Ktor 的正确发音是什么？" id="pronounce">
        <p>
            <emphasis>/keɪ-tor/</emphasis>
        </p>
    </chapter>
    <chapter title='“Ktor”这个名字代表什么？' id="name-meaning">
        <p>
            Ktor 这个名字源于缩写 <code>ctor</code>（构造函数），并将第一个字母替换为代表 Kotlin 的 “K”。
        </p>
    </chapter>
    <chapter title="如何提问、报告错误、联系你们、进行贡献或提供反馈等？" id="feedback">
        <p>
            请访问 <a href="https://ktor.io/support/">Support</a> 页面以详细了解可用的支持渠道。
            <a href="https://github.com/ktorio/ktor/blob/main/CONTRIBUTING.md">How to contribute</a> 指南介绍了您可以为 Ktor 做出贡献的方式。
        </p>
    </chapter>
    <chapter title="CIO 是什么意思？" id="cio">
        <p>
            CIO 代表
            <emphasis>基于协程的 I/O（Coroutine-based I/O）</emphasis>
            。
            通常我们将其称为一个使用 Kotlin 和协程（Coroutines）来实现 IETF RFC 或其他协议逻辑的引擎，且不依赖于外部基于 JVM 的库。
        </p>
    </chapter>
    <chapter title="如何修复未解析（红色显示）的 Ktor 导入？" id="ktor-artifact">
        <p>
            请确保已在构建脚本中添加了相应的 <Links href="//server-dependencies" summary="了解如何向现有的 Gradle/Maven 项目中添加 Ktor Server 依赖项。">Ktor 构件</Links>。
        </p>
    </chapter>
    <chapter
            title="Ktor 是否提供捕获 IPC 信号（例如 SIGTERM 或 SIGINT）的方法，以便优雅地处理服务器停机？"
            id="sigterm">
        <p>
            如果您正在运行 <a href="#engine-main">EngineMain</a>，它将自动处理。
            否则，您需要手动处理。
            您可以使用 JVM 提供的 <code>Runtime.getRuntime().addShutdownHook</code> 设施。
        </p>
    </chapter>
    <chapter title="在代理之后如何获取客户端 IP？" id="proxy-ip">
        <p>
            如果代理提供了正确的标头，并且安装了 <Links href="//server-forward-headers" summary="所需依赖项：io.ktor:%artifact_name%">ForwardedHeader</Links> 插件，则 <code>call.request.origin</code> 属性会提供有关原始调用者（代理）的<a href="#request_information">连接信息</a>。
        </p>
    </chapter>
    <chapter title="如何测试 main 分支上的最新提交？" id="bleeding-edge">
        <p>
            您可以从 <code>jetbrains.space</code> 获取 Ktor 每夜构建版本。
            详情请参阅 <a href="https://ktor.io/eap/">抢先体验计划</a>。
        </p>
    </chapter>
    <chapter title="如何确认我使用的是哪个版本的 Ktor？" id="ktor-version-used">
        <p>
            您可以使用 <Links href="//server-default-headers" summary="所需依赖项：io.ktor:%artifact_name%">DefaultHeaders</Links> 插件，它会发送一个包含 Ktor 版本的 <code>Server</code> 响应标头，例如：
        </p>
        <code-block code="            Server: ktor-server-core/%ktor_version%"/>
    </chapter>
    <chapter title="我的路由没有被执行。我该如何调试它？" id="route-not-executing">
        <p>
            Ktor 提供了一种跟踪机制来帮助排查路由决策。
            请查看 <a href="#trace_routes">Tracing routes</a> 章节。
        </p>
    </chapter>
    <chapter title="如何解决 'Response has already been sent' 错误？" id="response-already-sent">
        <p>
            这意味着您、或者某个插件或拦截器已经调用过 <code>call.respond&#42; </code> 函数，而您正试图再次调用它。
        </p>
    </chapter>
    <chapter title="如何订阅 Ktor 事件？" id="ktor-events">
        <p>
            请参阅 <Links href="//server-events" summary="">Application monitoring</Links> 页面了解更多信息。
        </p>
    </chapter>
    <chapter title="如何解决 'No configuration setting found for key ktor'？" id="cannot-find-application-conf">
        <p>
            这意味着 Ktor 无法找到 <Links href="//server-configuration-file" summary="了解如何在配置文件中配置各种服务器参数。">配置文件</Links>。
            请确保 <code>resources</code> 文件夹中存在配置文件，并且该 <code>resources</code> 文件夹已被正确标记。
            可以考虑使用 <a href="https://start.ktor.io/">Ktor 项目生成器</a> 或 <a href="https://plugins.jetbrains.com/plugin/16008-ktor">IntelliJ IDEA Ultimate 的 Ktor 插件</a> 来创建一个可以运行的项目作为基础。有关更多信息，请参阅 <Links href="//server-create-a-new-project" summary="了解如何使用 Ktor 创建、打开、运行和测试服务器应用程序。">创建、打开并运行新的 Ktor 项目</Links>。
        </p>
    </chapter>
    <chapter title="我可以在 Android 上使用 Ktor 吗？" id="android-support">
        <p>
            是的，已知 Ktor 服务器和客户端可以在 Android 5 (API 21) 或更高版本上运行，至少在使用 Netty 引擎时是这样。
        </p>
    </chapter>
    <chapter title="为什么 'CURL -I' 返回 '404 Not Found'？" id="curl-head-not-found">
        <p>
            <code>CURL -I</code> 是 <code>CURL --head</code> 的别名，执行的是 <code>HEAD</code> 请求。
            默认情况下，Ktor 不会为 <code>GET</code> 处理程序处理 <code>HEAD</code> 请求。
            要启用此功能，请安装 <Links href="//server-autoheadresponse" summary="%plugin_name% 能够为每个定义了 GET 的路由自动响应 HEAD 请求。">AutoHeadResponse</Links> 插件。
        </p>
    </chapter>
    <chapter title="使用 'HttpsRedirect' 插件时如何解决无限重定向问题？" id="infinite-redirect">
        <p>
            最可能的原因是您的后端位于反向代理或负载均衡器之后，而这些中间件正在向您的后端发起普通的 HTTP 请求，因此 Ktor 后端中的 <code>HttpsRedirect</code> 插件认为这是一个普通的 HTTP 请求并响应重定向。
        </p>
        <p>
            通常，反向代理会发送一些描述原始请求的标头（例如它是否为 HTTPS，或原始 IP 地址），可以使用 <Links href="//server-forward-headers" summary="所需依赖项：io.ktor:%artifact_name%">ForwardedHeader</Links> 插件来解析这些标头，以便 <Links href="//server-https-redirect" summary="所需依赖项：io.ktor:%artifact_name%">HttpsRedirect</Links> 插件知道原始请求是 HTTPS。
        </p>
    </chapter>
    <chapter title="如何在 Windows 上安装 'curl' 以在 Kotlin/Native 上使用相应的引擎？" id="native-curl">
        <p>
            <a href="#curl">Curl</a> 客户端引擎需要安装 <code>curl</code> 库。
            在 Windows 上，您可以考虑使用 MinGW/MSYS2 的 <code>curl</code> 二进制文件。
        </p>
        <procedure>
            <step>
                <p>
                    按照 <a href="https://www.msys2.org/">MinGW/MSYS2</a> 中的说明安装 MinGW/MSYS2。
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
                    如果您将 MinGW/MSYS2 安装到了默认位置，请将
                    <Path>C:\\msys64\\mingw64\\bin\\</Path>
                    添加到 <code>PATH</code> 环境变量中。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="如何解决 'NoTransformationFoundException'？" id="no-transformation-found-exception">
        <p>
            <a href="https://api.ktor.io/ktor-client-core/io.ktor.client.call/-no-transformation-found-exception/index.html">NoTransformationFoundException</a>
            表示无法为<i>接收到的正文</i>找到合适的转换，即无法将<b>生成的（resulted）</b>类型转换为客户端<b>预期的（expected）</b>类型。
        </p>
        <procedure>
            <step>
                <p>
                    检查请求中的 <code>Accept</code> 标头是否指定了所需的内容类型，以及服务器响应中的 <code>Content-Type</code> 标头是否与客户端预期的类型匹配。
                </p>
            </step>
            <step>
                <p>
                    为您正在处理的特定内容类型注册必要的内容转换。
                </p>
                <p>
                    您可以在客户端使用 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> 插件。
                    此插件允许您指定如何针对不同的内容类型对数据进行序列化和反序列化。
                </p>
                <code-block lang="kotlin" code="                    val client = HttpClient(CIO) {&#10;                        install(ContentNegotiation) {&#10;                            json() // 示例：注册 JSON 内容转换&#10;                            // 根据需要为其他内容类型添加更多转换&#10;                        }&#10;                    }"/>
            </step>
            <step>
                <p>
                    确保安装了所有需要的插件。可能缺失的功能包括：
                </p>
                <list type="bullet">
                    <li>客户端 <a href="https://ktor.io/docs/websocket-client.html">WebSockets</a> 和服务器端 <a href="https://ktor.io/docs/websocket.html">WebSockets</a></li>
                    <li>客户端 <a href="https://ktor.io/docs/serialization-client.html">ContentNegotiation</a> 和服务器端 <a href="https://ktor.io/docs/server-serialization.html">ContentNegotiation</a></li>
                    <li><a href="https://ktor.io/docs/compression.html">Compression</a></li>
                </list>
            </step>
        </procedure>
    </chapter>
</topic>