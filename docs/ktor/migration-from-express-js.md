<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="从 Express 迁移到 Ktor"
       id="migration-from-express-js" help-id="express-js;migrating-from-express-js">
    <show-structure for="chapter" depth="2"/>
    <link-summary>本指南展示了如何创建、运行和测试一个简单的 Ktor 应用程序。</link-summary>
    <tldr>
        <p>
            <b>代码示例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express">migrating-express</a>
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor">migrating-express-ktor</a>
        </p>
    </tldr>
    <p>
        在本指南中，我们将探讨在基本场景下如何将 Express 应用程序迁移到 Ktor：
        从生成应用程序和编写第一个应用程序，到创建中间件以扩展应用程序功能。
    </p>
    <chapter title="生成应用" id="generate">
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        您可以使用 <code>express-generator</code> 工具生成一个新的 Express 应用程序：
                    </p>
                    <code-block lang="shell" code="                        npx express-generator"/>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor 提供了以下方式来生成应用程序骨架：
                    </p>
                    <list>
                        <li>
                            <p>
                                <a href="https://start.ktor.io/">Ktor 项目生成器</a> — 使用基于 Web 的生成器。
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="https://github.com/ktorio/ktor-cli">
                                    Ktor CLI 工具
                                </a> — 使用
                                <code>ktor new</code> 命令通过命令行界面生成 Ktor 项目：
                            </p>
                            <code-block lang="shell" code="                                ktor new ktor-sample"/>
                        </li>
                        <li>
                            <p>
                                <a href="https://www.npmjs.com/package/generator-ktor">
                                    Yeoman 生成器
                                </a>
                                — 交互式配置项目设置并选择所需的插件：
                            </p>
                            <code-block lang="shell" code="                                yo ktor"/>
                        </li>
                        <li>
                            <p>
                                <a href="https://ktor.io/idea/">IntelliJ IDEA Ultimate</a> — 使用内置的 Ktor
                                项目向导。
                            </p>
                        </li>
                    </list>
                    <p>
                        有关详细说明，请参阅<Links href="/ktor/server-create-a-new-project" summary="了解如何使用 Ktor 打开、运行和测试服务器应用程序。">创建、打开和运行新的 Ktor 项目</Links>教程。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="Hello world" id="hello">
        <p>
            在本节中，我们将介绍如何创建最简单的服务器应用程序，该应用程序接受 <code>GET</code>
            请求并响应预定义的纯文本。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        以下示例展示了 Express 应用程序如何启动服务器并监听 <control>3000</control>
                        端口的连接。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.send('Hello World!')&#10;})&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/1_hello/app.js">1_hello</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，您可以使用 <a href="#embedded-server">embeddedServer</a>
                        函数在代码中配置服务器参数并快速运行应用程序。
                    </p>
                    <code-block lang="kotlin" code="import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello World!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/1_hello/src/main/kotlin/com/example/Application.kt">1_hello</a>
                        项目。
                    </p>
                    <p>
                        您还可以在使用 HOCON 或 YAML 格式的<a href="#engine-main">外部配置文件</a>中指定服务器设置。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            请注意，上述 Express 应用程序添加了 <control>Date</control>、<control>X-Powered-By</control>
            和 <control>ETag</control>
            响应头部，它们可能如下所示：
        </p>
        <code-block code="            Date: Fri, 05 Aug 2022 06:30:48 GMT&#10;            X-Powered-By: Express&#10;            ETag: W/&quot;c-Lve95gjOVATpfV8EL5X4nxwjKHE&quot;"/>
        <p>
            要在 Ktor 中为每个响应添加默认的 <control>Server</control> 和 <control>Date</control>
            头部，您需要安装 <Links href="/ktor/server-default-headers" summary="所需依赖项：io.ktor:%artifact_name% 原生服务器支持：✅">DefaultHeaders</Links> 插件。
            <Links href="/ktor/server-conditional-headers" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✅">ConditionalHeaders</Links> 插件可用于配置 <control>ETag</control>
            响应头部。
        </p>
    </chapter>
    <chapter title="提供静态内容" id="static">
        <p>
            在本节中，我们将了解如何在 Express 和 Ktor 中提供图像、CSS 文件和 JavaScript 文件等静态文件。
            假设我们有一个
            <Path>public</Path>
            文件夹，其中包含主
            <Path>index.html</Path>
            页面
            和一组链接的资源。
        </p>
        <code-block code="            public&#10;            ├── index.html&#10;            ├── ktor_logo.png&#10;            ├── css&#10;            │   └──styles.css&#10;            └── js&#10;                └── script.js"/>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        在 Express 中，将文件夹名称传递给
                        <control>express.static</control>
                        函数。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.use(express.static('public'))&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/2_static/app.js">2_static</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，使用 <a href="#folders"><code>staticFiles()</code></a>
                        函数将任何对
                        <Path>/</Path>
                        路径的请求映射到
                        <Path>public</Path>
                        物理文件夹。
                        此函数支持递归提供
                        <Path>public</Path>
                        文件夹中的所有文件。
                    </p>
                    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.http.content.*&#10;import io.ktor.server.routing.*&#10;import java.io.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        staticFiles(&quot;&quot;, File(&quot;public&quot;), &quot;index.html&quot;)&#10;    }&#10;}"/>
                    <p>
                        有关完整示例，请参阅 <a
                            href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/2_static/src/main/kotlin/com/example/Application.kt">2_static</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            提供静态内容时，Express 会添加几个响应头部，可能如下所示：
        </p>
        <code-block code="            Accept-Ranges: bytes&#10;            Cache-Control: public, max-age=0&#10;            ETag: W/&quot;181-1823feafeb1&quot;&#10;            Last-Modified: Wed, 27 Jul 2022 13:49:01 GMT"/>
        <p>
            要在 Ktor 中管理这些头部，您需要安装以下插件：
        </p>
        <list>
            <li>
                <p>
                    <control>Accept-Ranges</control>
                    : <Links href="/ktor/server-partial-content" summary="所需依赖项：io.ktor:%artifact_name% 服务器示例：download-file，客户端示例：client-download-file-range 原生服务器支持：✅">PartialContent</Links>
                </p>
            </li>
            <li>
                <p>
                    <control>Cache-Control</control>
                    : <Links href="/ktor/server-caching-headers" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✅">CachingHeaders</Links>
                </p>
            </li>
            <li>
                <p>
                    <control>ETag</control>
                    和
                    <control>Last-Modified</control>
                    :
                    <Links href="/ktor/server-conditional-headers" summary="所需依赖项：io.ktor:%artifact_name% 代码示例：%example_name% 原生服务器支持：✅">ConditionalHeaders</Links>
                </p>
            </li>
        </list>
    </chapter>
    <chapter title="路由" id="routing">
        <p>
            <Links href="/ktor/server-routing" summary="路由是用于处理服务器应用程序中传入请求的核心插件。">路由</Links>允许处理对特定端点的传入请求，
            该端点由特定的 HTTP 请求方法（例如 <code>GET</code>、<code>POST</code> 等）和路径定义。
            以下示例展示了如何处理对
            <Path>/</Path>
            路径的 <code>GET</code> 和
            <code>POST</code> 请求。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <code-block lang="javascript" code="app.get('/', (req, res) =&gt; {&#10;    res.send('GET request to the homepage')&#10;})&#10;&#10;app.post('/', (req, res) =&gt; {&#10;    res.send('POST request to the homepage')&#10;})"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/&quot;) {&#10;            call.respondText(&quot;GET request to the homepage&quot;)&#10;        }&#10;        post(&quot;/&quot;) {&#10;            call.respondText(&quot;POST request to the homepage&quot;)&#10;        }&#10;    }"/>
                    <tip>
                        <p>
                            请参阅 <a href="#receive-request">接收请求</a>，了解如何接收 <code>POST</code>、<code>PUT</code> 或
                            <code>PATCH</code> 请求的请求体。
                        </p>
                    </tip>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            以下示例演示了如何按路径对路由处理程序进行分组。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        在 Express 中，您可以使用
                        <code>app.route()</code> 为路由路径创建可链式调用的路由处理程序。
                    </p>
                    <code-block lang="javascript" code="app.route('/book')&#10;    .get((req, res) =&gt; {&#10;        res.send('Get a random book')&#10;    })&#10;    .post((req, res) =&gt; {&#10;        res.send('Add a book')&#10;    })&#10;    .put((req, res) =&gt; {&#10;        res.send('Update the book')&#10;    })"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor 提供了一个 <code>route</code> 函数，
                        您可以通过它定义路径，然后将该路径的动词作为嵌套函数放置。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        route(&quot;book&quot;) {&#10;            get {&#10;                call.respondText(&quot;Get a random book&quot;)&#10;            }&#10;            post {&#10;                call.respondText(&quot;Add a book&quot;)&#10;            }&#10;            put {&#10;                call.respondText(&quot;Update the book&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            这两种框架都允许您将相关路由分组到单个文件中。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express 提供了 <code>express.Router</code> 类来创建可挂载的路由处理程序。
                        假设应用程序目录中有一个
                        <Path>birds.js</Path>
                        路由文件。
                        此路由模块可以像
                        <Path>app.js</Path>
                        中所示那样加载到应用程序中：
                    </p>
                    <tabs>
                        <tab title="birds.js">
                            <code-block lang="javascript" code="const express = require('express')&#10;const router = express.Router()&#10;&#10;router.get('/', (req, res) =&gt; {&#10;    res.send('Birds home page')&#10;})&#10;&#10;router.get('/about', (req, res) =&gt; {&#10;    res.send('About birds')&#10;})&#10;&#10;module.exports = router"/>
                        </tab>
                        <tab title="app.js">
                            <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const birds = require('./birds')&#10;const port = 3000&#10;&#10;app.use('/birds', birds)&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                        </tab>
                    </tabs>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，一种常见模式是在 <code>Routing</code> 类型上使用扩展函数
                        来定义实际路由。
                        下面的示例（
                        <Path>Birds.kt</Path>
                        ）定义了 <code>birdsRoutes</code> 扩展函数。
                        您可以通过在 <code>routing</code> 代码块内调用此函数来在应用程序（
                        <Path>Application.kt</Path>
                        ）中包含相应的路由：
                    </p>
                    <tabs>
                        <tab title="Birds.kt" id="birds-kt">
                            <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Routing.birdsRoutes() {&#10;    route(&quot;/birds&quot;) {&#10;        get {&#10;            call.respondText(&quot;Birds home page&quot;)&#10;        }&#10;        get(&quot;/about&quot;) {&#10;            call.respondText(&quot;About birds&quot;)&#10;        }&#10;    }&#10;}"/>
                        </tab>
                        <tab title="Application.kt" id="application-kt">
                            <code-block lang="kotlin" code="import com.example.routes.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        birdsRoutes()&#10;    }&#10;}"/>
                        </tab>
                    </tabs>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            除了将 URL 路径指定为字符串之外，Ktor 还包括实现<Links href="/ktor/server-resources" summary="Resources 插件允许您实现类型安全的路由。">类型安全的路由</Links>的能力。
        </p>
    </chapter>
    <chapter title="路由和查询参数" id="route-query-param">
        <p>
            本节将向我们展示如何访问路由参数和查询参数。
        </p>
        <p>
            路由（或路径）参数是用于捕获 URL 中其位置处指定值的命名 URL 段。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中访问路由参数，您可以使用 <code>Request.params</code>。
                        例如，下面代码片段中的 <code>req.parameters["login"]</code> 对于
                        <Path>/user/admin</Path>
                        路径将返回<emphasis>admin</emphasis>：
                    </p>
                    <code-block lang="javascript" code="app.get('/user/:login', (req, res) =&gt; {&#10;    if (req.params['login'] === 'admin') {&#10;        res.send('You are logged in as Admin')&#10;    } else {&#10;        res.send('You are logged in as Guest')&#10;    }&#10;})"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，路由参数使用 <code>{param}</code> 语法定义。
                        您可以使用 <code>call.parameters</code> 在路由处理程序中访问路由参数：
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/user/{login}&quot;) {&#10;            if (call.parameters[&quot;login&quot;] == &quot;admin&quot;) {&#10;                call.respondText(&quot;You are logged in as Admin&quot;)&#10;            } else {&#10;                call.respondText(&quot;You are logged in as Guest&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            下表比较了如何访问查询字符串的参数。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中访问路由参数，您可以使用 <code>Request.params</code>。
                        例如，下面代码片段中的 <code>req.parameters["login"]</code> 对于
                        <Path>/user/admin</Path>
                        路径将返回<emphasis>admin</emphasis>：
                    </p>
                    <code-block lang="javascript" code="app.get('/products', (req, res) =&gt; {&#10;    if (req.query['price'] === 'asc') {&#10;        res.send('Products from the lowest price to the highest')&#10;    }&#10;})"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，路由参数使用 <code>{param}</code> 语法定义。
                        您可以使用 <code>call.parameters</code> 在路由处理程序中访问路由参数：
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/products&quot;) {&#10;            if (call.request.queryParameters[&quot;price&quot;] == &quot;asc&quot;) {&#10;                call.respondText(&quot;Products from the lowest price to the highest&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="发送响应" id="send-response">
        <p>
            在前面的章节中，我们已经了解了如何响应纯文本内容。
            现在让我们看看如何发送 JSON、文件和重定向响应。
        </p>
        <chapter title="JSON" id="send-json">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            要在 Express 中发送具有相应内容类型的 JSON 响应，
                            请调用 <code>res.json</code> 函数：
                        </p>
                        <code-block lang="javascript" code="const car = {type:&quot;Fiat&quot;, model:&quot;500&quot;, color:&quot;white&quot;};&#10;app.get('/json', (req, res) =&gt; {&#10;    res.json(car)&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，您需要安装 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有两个用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">ContentNegotiation</Links>
                            插件并
                            配置 JSON 序列化器：
                        </p>
                        <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
                        <p>
                            要将数据序列化为 JSON，您需要创建一个带有
                            <code>@Serializable</code> 注解的数据类：
                        </p>
                        <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                        <p>
                            然后，您可以使用 <code>call.respond</code> 在响应中发送此类的对象：
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/json&quot;) {&#10;            call.respond(Car(&quot;Fiat&quot;, &quot;500&quot;, &quot;white&quot;))&#10;        }"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="文件" id="send-file">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            要在 Express 中响应文件，请使用 <code>res.sendFile</code>：
                        </p>
                        <code-block lang="javascript" code="const path = require(&quot;path&quot;)&#10;&#10;app.get('/file', (req, res) =&gt; {&#10;    res.sendFile(path.join(__dirname, 'ktor_logo.png'))&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor 提供了 <code>call.respondFile</code> 函数用于向客户端发送文件：
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/file&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.respondFile(file)&#10;        }"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
            <p>
                Express 应用程序在响应文件时会添加
                <control>Accept-Ranges</control>
                HTTP 响应头部。
                服务器使用此头部来声明其支持客户端对文件下载的局部请求。
                在 Ktor 中，您需要安装 <Links href="/ktor/server-partial-content" summary="所需依赖项：io.ktor:%artifact_name% 服务器示例：download-file，客户端示例：client-download-file-range 原生服务器支持：✅">PartialContent</Links> 插件以
                支持局部请求。
            </p>
        </chapter>
        <chapter title="文件附件" id="send-file-attachment">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            <code>res.download</code> 函数将指定文件作为附件传输：
                        </p>
                        <code-block lang="javascript" code="app.get('/file-attachment', (req, res) =&gt; {&#10;    res.download(&quot;ktor_logo.png&quot;)&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，您需要手动配置
                            <control>Content-Disposition</control>
                            头部，以将文件作为附件传输：
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/file-attachment&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.response.header(&#10;                HttpHeaders.ContentDisposition,&#10;                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, &quot;ktor_logo.png&quot;)&#10;                    .toString()&#10;            )&#10;            call.respondFile(file)&#10;        }"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="重定向" id="redirect">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            要在 Express 中生成重定向响应，请调用 <code>redirect</code> 函数：
                        </p>
                        <code-block lang="javascript" code="app.get('/old', (req, res) =&gt; {&#10;    res.redirect(301, &quot;moved&quot;)&#10;})&#10;&#10;app.get('/moved', (req, res) =&gt; {&#10;    res.send('Moved resource')&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，使用 <code>respondRedirect</code> 发送重定向响应：
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/old&quot;) {&#10;            call.respondRedirect(&quot;/moved&quot;, permanent = true)&#10;        }&#10;        get(&quot;/moved&quot;) {&#10;            call.respondText(&quot;Moved resource&quot;)&#10;        }"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
    </chapter>
    <chapter title="模板" id="templates">
        <p>
            Express 和 Ktor 都支持使用模板引擎来处理视图。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        假设我们在
                        <Path>views</Path>
                        文件夹中有以下 Pug 模板：
                    </p>
                    <code-block code="html&#10;  head&#10;    title= title&#10;  body&#10;    h1= message"/>
                    <p>
                        要用此模板进行响应，请调用 <code>res.render</code>：
                    </p>
                    <code-block lang="javascript" code="app.set('views', './views')&#10;app.set('view engine', 'pug')&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.render('index', { title: 'Hey', message: 'Hello there!' })&#10;})"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/6_templates/app.js">6_templates</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor 支持多种 <Links href="/ktor/server-templating" summary="了解如何使用 HTML/CSS 或 JVM 模板引擎构建视图。">JVM 模板引擎</Links>，
                        例如 FreeMarker、Velocity 等。
                        例如，如果您需要使用放置在应用程序资源中的 FreeMarker 模板进行响应，
                        请安装并配置 <code>FreeMarker</code> 插件，然后使用 <code>call.respond</code> 发送模板：
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    install(FreeMarker) {&#10;        templateLoader = ClassTemplateLoader(this::class.java.classLoader, &quot;views&quot;)&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            val article = Article(&quot;Hey&quot;, &quot;Hello there!&quot;)&#10;            call.respond(FreeMarkerContent(&quot;index.ftl&quot;, mapOf(&quot;article&quot; to article)))&#10;        }&#10;    }&#10;}&#10;&#10;data class Article(val title: String, val message: String)"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/6_templates/src/main/kotlin/com/example/Application.kt">6_templates</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="接收请求" id="receive-request">
        <p>
            本节将展示如何接收不同格式的请求体。
        </p>
        <chapter title="纯文本" id="receive-raw-text">
            <p>
                下面的 <code>POST</code> 请求向服务器发送文本数据：
            </p>
            <code-block lang="http" code="POST http://0.0.0.0:3000/text&#10;Content-Type: text/plain&#10;&#10;Hello, world!"/>
            <p>
                让我们看看如何在服务器端将此请求体作为纯文本接收。
            </p>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            要在 Express 中解析传入的请求体，您需要添加 <code>body-parser</code>：
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')"/>
                        <p>
                            在 <code>post</code> 处理程序中，
                            您需要传递文本解析器（<code>bodyParser.text</code>）。
                            请求体将通过 <code>req.body</code> 属性可用：
                        </p>
                        <code-block lang="javascript" code="app.post('/text', bodyParser.text(), (req, res) =&gt; {&#10;    let text = req.body&#10;    res.send(text)&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，您可以使用 <code>call.receiveText</code> 将请求体作为文本接收：
                        </p>
                        <code-block lang="kotlin" code="    routing {&#10;        post(&quot;/text&quot;) {&#10;            val text = call.receiveText()&#10;            call.respondText(text)"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="JSON" id="receive-json">
            <p>
                在本节中，我们将了解如何接收 JSON 请求体。
                以下示例展示了一个带有 JSON 对象的 <code>POST</code> 请求体：
            </p>
            <code-block lang="http" code="POST http://0.0.0.0:3000/json&#10;Content-Type: application/json&#10;&#10;{&#10;  &quot;type&quot;: &quot;Fiat&quot;,&#10;  &quot;model&quot; : &quot;500&quot;,&#10;  &quot;color&quot;: &quot;white&quot;&#10;}"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            要在 Express 中接收 JSON，请使用 <code>bodyParser.json</code>：
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/json', bodyParser.json(), (req, res) =&gt; {&#10;    let car = req.body&#10;    res.send(car)&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，您需要安装 <Links href="/ktor/server-serialization" summary="ContentNegotiation 插件主要有两个用途：在客户端和服务器之间协商媒体类型，以及以特定格式序列化/反序列化内容。">ContentNegotiation</Links>
                            插件
                            并配置 <code>Json</code> 序列化器：
                        </p>
                        <code-block lang="kotlin" code="fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            prettyPrint = true&#10;            isLenient = true&#10;        })"/>
                        <p>
                            要将接收到的数据反序列化为对象，您需要创建一个数据类：
                        </p>
                        <code-block lang="kotlin" code="@Serializable"/>
                        <p>
                            然后，使用接受此数据类作为参数的 <code>receive</code> 方法：
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/json&quot;) {&#10;            val car = call.receive&lt;Car&gt;()&#10;            call.respond(car)"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="URL 编码" id="receive-url-encoded">
            <p>
                现在让我们看看如何接收使用
                <control>application/x-www-form-urlencoded</control>
                类型发送的表单数据。
                以下代码片段显示了一个带有表单数据的 <code>POST</code> 请求示例：
            </p>
            <code-block lang="http" code="POST http://localhost:3000/urlencoded&#10;Content-Type: application/x-www-form-urlencoded&#10;&#10;username=JetBrains&amp;email=example@jetbrains.com&amp;password=foobar&amp;confirmation=foobar"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            与纯文本和 JSON 类似，Express 需要 <code>body-parser</code>。
                            您需要将解析器类型设置为 <code>bodyParser.urlencoded</code>：
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/urlencoded', bodyParser.urlencoded({extended: true}), (req, res) =&gt; {&#10;    let user = req.body&#10;    res.send(`The ${user[&quot;username&quot;]} account is created`)&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，使用 <code>call.receiveParameters</code> 函数：
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/urlencoded&quot;) {&#10;            val formParameters = call.receiveParameters()&#10;            val username = formParameters[&quot;username&quot;].toString()&#10;            call.respondText(&quot;The '$username' account is created&quot;)"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="原始数据" id="receive-raw-data">
            <p>
                下一个用例是处理二进制数据。
                下面的请求将一个带有
                <control>application/octet-stream</control>
                类型的 PNG 图像发送到服务器：
            </p>
            <code-block lang="http" code="POST http://localhost:3000/raw&#10;Content-Type: application/octet-stream&#10;&#10;&lt; ./ktor_logo.png"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            要在 Express 中处理二进制数据，请将解析器类型设置为 <code>raw</code>：
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;const fs = require('fs')&#10;&#10;app.post('/raw', bodyParser.raw({type: () =&gt; true}), (req, res) =&gt; {&#10;    let rawBody = req.body&#10;    fs.createWriteStream('./uploads/ktor_logo.png').write(rawBody)&#10;    res.send('A file is uploaded')&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor 提供了 <code>ByteReadChannel</code> 和 <code>ByteWriteChannel</code>
                            用于异步读/写字节序列：
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/raw&quot;) {&#10;            val file = File(&quot;uploads/ktor_logo.png&quot;)&#10;            call.receiveChannel().copyAndClose(file.writeChannel())&#10;            call.respondText(&quot;A file is uploaded&quot;)"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="Multipart" id="receive-multipart">
            <p>
                在最后一节中，让我们看看如何处理
                <emphasis>multipart</emphasis>
                请求体。
                下面的 <code>POST</code> 请求使用
                <control>multipart/form-data</control>
                类型发送一个带有描述的 PNG 图像：
            </p>
            <code-block lang="http" code="POST http://localhost:3000/multipart&#10;Content-Type: multipart/form-data; boundary=WebAppBoundary&#10;&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;description&quot;&#10;Content-Type: text/plain&#10;&#10;Ktor logo&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;image&quot;; filename=&quot;ktor_logo.png&quot;&#10;Content-Type: image/png&#10;&#10;&lt; ./ktor_logo.png&#10;--WebAppBoundary--"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Express 需要一个单独的模块来解析 multipart 数据。
                            在下面的示例中，
                            <control>multer</control>
                            用于将文件上传到服务器：
                        </p>
                        <code-block lang="javascript" code="const multer = require('multer')&#10;&#10;const storage = multer.diskStorage({&#10;    destination: './uploads/',&#10;    filename: function (req, file, cb) {&#10;        cb(null, file.originalname);&#10;    }&#10;})&#10;const upload = multer({storage: storage});&#10;app.post('/multipart', upload.single('image'), function (req, res, next) {&#10;    let fileDescription = req.body[&quot;description&quot;]&#10;    let fileName = req.file.filename&#10;    res.send(`${fileDescription} is uploaded to uploads/${fileName}`)&#10;})"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            在 Ktor 中，如果您需要接收作为 multipart 请求一部分发送的文件，
                            请调用 <code>receiveMultipart</code> 函数，然后根据需要遍历每个部分。
                            在下面的示例中，<code>PartData.FileItem</code> 用于将文件作为字节流接收：
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/multipart&quot;) {&#10;            var fileDescription = &quot;&quot;&#10;            var fileName = &quot;&quot;&#10;            val multipartData = call.receiveMultipart()&#10;            multipartData.forEachPart { part -&gt;&#10;                when (part) {&#10;                    is PartData.FormItem -&gt; {&#10;                        fileDescription = part.value&#10;                    }&#10;&#10;                    is PartData.FileItem -&gt; {&#10;                        fileName = part.originalFileName as String&#10;                        val fileBytes = part.provider().readRemaining().readByteArray()&#10;                        File(&quot;uploads/$fileName&quot;).writeBytes(fileBytes)&#10;                    }&#10;&#10;                    else -&gt; {}&#10;                }&#10;                part.dispose()&#10;            }"/>
                        <p>
                            有关完整示例，请参阅
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            项目。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
    </chapter>
    <chapter title="创建中间件" id="middleware">
        <p>
            我们要看的最后一件事是如何创建中间件，它允许您扩展服务器功能。
            以下示例展示了如何使用 Express 和 Ktor 实现请求日志记录。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        在 Express 中，中间件是使用 <code>app.use</code> 绑定到应用程序的函数：
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;const requestLogging = function (req, res, next) {&#10;    let scheme = req.protocol&#10;    let host = req.headers.host&#10;    let url = req.url&#10;    console.log(`Request URL: ${scheme}://${host}${url}`)&#10;    next()&#10;}&#10;&#10;app.use(requestLogging)"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/8_middleware/app.js">8_middleware</a>
                        项目。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor 允许您使用<Links href="/ktor/server-custom-plugins" summary="了解如何创建自己的自定义插件。">自定义插件</Links>扩展其功能。
                        以下代码示例展示了如何处理 <code>onCall</code> 以实现请求日志记录：
                    </p>
                    <code-block lang="kotlin" code="val RequestLoggingPlugin = createApplicationPlugin(name = &quot;RequestLoggingPlugin&quot;) {&#10;    onCall { call -&gt;&#10;        call.request.origin.apply {&#10;            println(&quot;Request URL: $scheme://$localHost:$localPort$uri&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>
                        有关完整示例，请参阅
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/8_middleware/src/main/kotlin/com/example/Application.kt">8_middleware</a>
                        项目。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="后续内容" id="next">
        <p>
            本指南中仍有许多未涵盖的用例，
            例如会话管理、授权、数据库集成等。
            对于大多数这些功能，Ktor 提供了专门的插件，
            可以在应用程序中安装并根据需要进行配置。
            要继续您的 Ktor 之旅，
            请访问
            <control><a href="https://ktor.io/learn/">学习页面</a></control>
            ，该页面提供了一系列分步指南和即用型示例。
        </p>
    </chapter>
</topic>