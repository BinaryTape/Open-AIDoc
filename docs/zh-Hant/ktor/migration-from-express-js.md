<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="從 Express 遷移至 Ktor"
       id="migration-from-express-js" help-id="express-js;migrating-from-express-js">
<show-structure for="chapter" depth="2"/>
<link-summary>本指南介紹如何建立、執行和測試簡單的 Ktor 應用程式。</link-summary>
<tldr>
    <p>
        <b>程式碼範例</b>：
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express">migrating-express</a>
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor">migrating-express-ktor</a>
    </p>
</tldr>
<p>
    在本指南中，我們將探討在基本情境下如何將 Express 應用程式遷移至 Ktor：
    從產生應用程式與撰寫您的第一個應用程式，到建立用於擴充應用程式功能的中介軟體。
</p>
<chapter title="產生應用程式" id="generate">
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    您可以使用 <code>express-generator</code> 工具來產生新的 Express 應用程式：
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
                    Ktor 提供以下幾種方式來產生應用程式骨架：
                </p>
                <list>
                    <li>
                        <p>
                            <a href="https://start.ktor.io/">Ktor 專案產生器 (Ktor Project Generator)</a> — 使用網頁版產生器。
                        </p>
                    </li>
                    <li>
                        <p>
                            <a href="https://github.com/ktorio/ktor-cli">
                                Ktor CLI 工具
                            </a> — 透過命令列介面使用 <code>ktor new</code> 指令產生 Ktor 專案：
                        </p>
                        <code-block lang="shell" code="                                ktor new ktor-sample"/>
                    </li>
                    <li>
                        <p>
                            <a href="https://www.npmjs.com/package/generator-ktor">
                                Yeoman 產生器
                            </a>
                            — 以互動方式配置專案設定並選取所需的外掛程式：
                        </p>
                        <code-block lang="shell" code="                                yo ktor"/>
                    </li>
                    <li>
                        <p>
                            <a href="https://ktor.io/idea/">IntelliJ IDEA Ultimate</a> — 使用內建的 Ktor 專案精靈。
                        </p>
                    </li>
                </list>
                <p>
                    如需詳細指示，請參閱 <Links href="//server-create-a-new-project" summary="了解如何使用 Ktor 開啟、執行和測試伺服器應用程式。">建立、開啟並執行新的 Ktor 專案</Links> 教學。
                </p>
            </td>
</tr>

    </table>
</chapter>
<chapter title="Hello world" id="hello">
    <p>
        在本節中，我們將探討如何建立最簡單的伺服器應用程式，該程式接收 <code>GET</code> 請求並以預定義的純文字進行回應。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    下方的範例顯示了啟動伺服器並監聽通訊埠 <control>3000</control> 連線的 Express 應用程式。
                </p>
                <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.send('Hello World!')&#10;})&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/1_hello/app.js">1_hello</a>
                    專案。
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
                    函式在程式碼中配置伺服器參數並快速執行應用程式。
                </p>
                <code-block lang="kotlin" code="import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello World!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/1_hello/src/main/kotlin/com/example/Application.kt">1_hello</a>
                    專案。
                </p>
                <p>
                    您也可以在採用 HOCON 或 YAML 格式的 <a href="#engine-main">外部配置檔案</a> 中指定伺服器設定。
                </p>
            </td>
</tr>

    </table>
    <p>
        請注意，上述 Express 應用程式會加入 <control>Date</control>、<control>X-Powered-By</control> 和 <control>ETag</control> 回應標頭，內容可能如下所示：
    </p>
    <code-block code="            Date: Fri, 05 Aug 2022 06:30:48 GMT&#10;            X-Powered-By: Express&#10;            ETag: W/&quot;c-Lve95gjOVATpfV8EL5X4nxwjKHE&quot;"/>
    <p>
        若要在 Ktor 的每個回應中加入預設的 <control>Server</control> 與 <control>Date</control> 標頭，
        您需要安裝 <Links href="//server-default-headers" summary="需要的相依性：io.ktor:%artifact_name%">DefaultHeaders</Links> 外掛程式。
        <Links href="//server-conditional-headers" summary="需要的相依性：io.ktor:%artifact_name%">ConditionalHeaders</Links> 外掛程式則可用於配置 <control>Etag</control> 回應標頭。
    </p>
</chapter>
<chapter title="提供靜態內容" id="static">
    <p>
        在本節中，我們將探討如何在 Express 與 Ktor 中提供影像、CSS 檔案與 JavaScript 檔案等靜態檔案。
        假設我們有一個 <Path>public</Path> 資料夾，其中包含主要的 <Path>index.html</Path> 頁面
        以及一組連結的資源。
    </p>
    <code-block code="            public&#10;            ├── index.html&#10;            ├── ktor_logo.png&#10;            ├── css&#10;            │   └──styles.css&#10;            └── js&#10;                └── script.js"/>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    在 Express 中，將資料夾名稱傳遞給 <control>express.static</control> 函式。
                </p>
                <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.use(express.static('public'))&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/2_static/app.js">2_static</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    在 Ktor 中，使用 <a href="#folders"><code>staticFiles()</code></a> 函式將對 <Path>/</Path> 路徑的任何請求對應到 <Path>public</Path> 實體資料夾。
                    此函式可以遞迴地提供 <Path>public</Path> 資料夾中的所有檔案。
                </p>
                <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.http.content.*&#10;import io.ktor.server.routing.*&#10;import java.io.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        staticFiles(&quot;&quot;, File(&quot;public&quot;), &quot;index.html&quot;)&#10;    }&#10;}"/>
                <p>
                    如需完整範例，請參閱 <a
                        href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/2_static/src/main/kotlin/com/example/Application.kt">2_static</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
    <p>
        提供靜態內容時，Express 會加入數個回應標頭，內容可能如下所示：
    </p>
    <code-block code="            Accept-Ranges: bytes&#10;            Cache-Control: public, max-age=0&#10;            ETag: W/&quot;181-1823feafeb1&quot;&#10;            Last-Modified: Wed, 27 Jul 2022 13:49:01 GMT"/>
    <p>
        要在 Ktor 中管理這些標頭，您需要安裝以下外掛程式：
    </p>
    <list>
        <li>
            <p>
                <control>Accept-Ranges</control>
                ：<Links href="//server-partial-content" summary="需要的相依性：io.ktor:%artifact_name% 伺服器範例：download-file，用戶端範例：client-download-file-range">PartialContent</Links>
            </p>
        </li>
        <li>
            <p>
                <control>Cache-Control</control>
                ：<Links href="//server-caching-headers" summary="需要的相依性：io.ktor:%artifact_name%">CachingHeaders</Links>
            </p>
        </li>
        <li>
            <p>
                <control>ETag</control>
                與
                <control>Last-Modified</control>
                ：
                <Links href="//server-conditional-headers" summary="需要的相依性：io.ktor:%artifact_name%">ConditionalHeaders</Links>
            </p>
        </li>
    </list>
</chapter>
<chapter title="路由" id="routing">
    <p>
        <Links href="//server-routing" summary="路由是伺服器應用程式中處理傳入請求的核心外掛程式。">路由 (Routing)</Links> 允許處理傳送到特定端點的請求，
        端點由特定的 HTTP 請求方法（<code>GET</code>、<code>POST</code> 等）與路徑定義。
        下方的範例展示如何處理傳送到 <Path>/</Path> 路徑的 <code>GET</code> 與 <code>POST</code> 請求。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <code-block lang="javascript" code="app.get('/', (req, res) =&gt; {&#10;    res.send('GET request to the homepage')&#10;})&#10;&#10;app.post('/', (req, res) =&gt; {&#10;    res.send('POST request to the homepage')&#10;})"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                    專案。
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
                        請參閱 <a href="#receive-request">接收請求</a> 以了解如何接收 <code>POST</code>、<code>PUT</code> 或 <code>PATCH</code> 請求的請求主體。
                    </p>
                </tip>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
    <p>
        以下範例示範如何依路徑分組路由處理常式。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    在 Express 中，您可以使用 <code>app.route()</code> 為路由路徑建立可鏈式呼叫的路由處理常式。
                </p>
                <code-block lang="javascript" code="app.route('/book')&#10;    .get((req, res) =&gt; {&#10;        res.send('Get a random book')&#10;    })&#10;    .post((req, res) =&gt; {&#10;        res.send('Add a book')&#10;    })&#10;    .put((req, res) =&gt; {&#10;        res.send('Update the book')&#10;    })"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor 提供 <code>route</code> 函式，
                    您可以在其中定義路徑，然後將該路徑的動詞作為巢狀函式放置在內。
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        route(&quot;book&quot;) {&#10;            get {&#10;                call.respondText(&quot;Get a random book&quot;)&#10;            }&#10;            post {&#10;                call.respondText(&quot;Add a book&quot;)&#10;            }&#10;            put {&#10;                call.respondText(&quot;Update the book&quot;)&#10;            }&#10;        }&#10;    }"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
    <p>
        這兩個架構都允許您將相關路由分組在單個檔案中。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    Express 提供 <code>express.Router</code> 類別來建立可掛載的路由處理常式。
                    假設我們在應用程式目錄中有一個 <Path>birds.js</Path> 路由檔案。
                    此路由模組可以按照 <Path>app.js</Path> 所示載入到應用程式中：
                </p>
                <Tabs>
                    <TabItem title="birds.js">
                        <code-block lang="javascript" code="const express = require('express')&#10;const router = express.Router()&#10;&#10;router.get('/', (req, res) =&gt; {&#10;    res.send('Birds home page')&#10;})&#10;&#10;router.get('/about', (req, res) =&gt; {&#10;    res.send('About birds')&#10;})&#10;&#10;module.exports = router"/>
                    </TabItem>
                    <TabItem title="app.js">
                        <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const birds = require('./birds')&#10;const port = 3000&#10;&#10;app.use('/birds', birds)&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    </TabItem>
                </Tabs>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    在 Ktor 中，常見的模式是在 <code>Routing</code> 型別上使用擴充函式來定義實際路由。
                    下方的範例 (<Path>Birds.kt</Path>) 定義了 <code>birdsRoutes</code> 擴充函式。
                    您可以透過在 <code>routing</code> 區塊內呼叫此函式，將對應的路由包含在應用程式 (<Path>Application.kt</Path>) 中：
                </p>
                <Tabs>
                    <TabItem title="Birds.kt" id="birds-kt">
                        <code-block lang="kotlin" code="import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun Routing.birdsRoutes() {&#10;    route(&quot;/birds&quot;) {&#10;        get {&#10;            call.respondText(&quot;Birds home page&quot;)&#10;        }&#10;        get(&quot;/about&quot;) {&#10;            call.respondText(&quot;About birds&quot;)&#10;        }&#10;    }&#10;}"/>
                    </TabItem>
                    <TabItem title="Application.kt" id="application-kt">
                        <code-block lang="kotlin" code="import com.example.routes.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        birdsRoutes()&#10;    }&#10;}"/>
                    </TabItem>
                </Tabs>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
    <p>
        除了將 URL 路徑指定為字串外，Ktor 還包含實作 <Links href="//server-resources" summary="Resources 外掛程式允許您實作型別安全路由。">型別安全路由</Links> 的功能。
    </p>
</chapter>
<chapter title="路由與查詢參數" id="route-query-param">
    <p>
        本節將展示如何存取路由參數與查詢參數。
    </p>
    <p>
        路由（或路徑）參數是具名的 URL 片段，用於擷取在 URL 中該位置指定的值。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    要在 Express 中存取路由參數，您可以使用 <code>Request.params</code>。
                    例如，下方程式碼片段中的 <code>req.parameters["login"]</code> 對於 <Path>/user/admin</Path> 路徑將傳回 <emphasis>admin</emphasis>：
                </p>
                <code-block lang="javascript" code="app.get('/user/:login', (req, res) =&gt; {&#10;    if (req.params['login'] === 'admin') {&#10;        res.send('You are logged in as Admin')&#10;    } else {&#10;        res.send('You are logged in as Guest')&#10;    }&#10;})"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    在 Ktor 中，路由參數是使用 <code>{param}</code> 語法定義的。
                    您可以使用 <code>call.parameters</code> 在路由處理常式中存取路由參數：
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/user/{login}&quot;) {&#10;            if (call.parameters[&quot;login&quot;] == &quot;admin&quot;) {&#10;                call.respondText(&quot;You are logged in as Admin&quot;)&#10;            } else {&#10;                call.respondText(&quot;You are logged in as Guest&quot;)&#10;            }&#10;        }&#10;    }"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
    <p>
        下表比較了如何存取查詢字串的參數。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    要在 Express 中存取路由參數，您可以使用 <code>Request.params</code>。
                    例如，下方程式碼片段中的 <code>req.parameters["login"]</code> 對於 <Path>/user/admin</Path> 路徑將傳回 <emphasis>admin</emphasis>：
                </p>
                <code-block lang="javascript" code="app.get('/products', (req, res) =&gt; {&#10;    if (req.query['price'] === 'asc') {&#10;        res.send('Products from the lowest price to the highest')&#10;    }&#10;})"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    在 Ktor 中，路由參數是使用 <code>{param}</code> 語法定義的。
                    您可以使用 <code>call.parameters</code> 在路由處理常式中存取路由參數：
                </p>
                <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/products&quot;) {&#10;            if (call.request.queryParameters[&quot;price&quot;] == &quot;asc&quot;) {&#10;                call.respondText(&quot;Products from the lowest price to the highest&quot;)&#10;            }&#10;        }&#10;    }"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
</chapter>
<chapter title="傳送回應" id="send-response">
    <p>
        在之前的章節中，我們已經看過如何以純文字內容進行回應。
        讓我們來看看如何傳送 JSON、檔案與重新導向回應。
    </p>
    <chapter title="JSON" id="send-json">
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中傳送具有適當內容類型的 JSON 回應，請呼叫 <code>res.json</code> 函式：
                    </p>
                    <code-block lang="javascript" code="const car = {type:&quot;Fiat&quot;, model:&quot;500&quot;, color:&quot;white&quot;};&#10;app.get('/json', (req, res) =&gt; {&#10;    res.json(car)&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，您需要安裝 <Links href="//server-serialization" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間協商媒體類型，以及以特定格式對內容進行序列化／還原序列化。">ContentNegotiation</Links> 外掛程式並配置 JSON 序列化器：
                    </p>
                    <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
                    <p>
                        要將資料序列化為 JSON，您需要建立一個帶有 <code>@Serializable</code> 註解的資料類別：
                    </p>
                    <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                    <p>
                        然後，您可以使用 <code>call.respond</code> 在回應中傳送此類別的物件：
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/json&quot;) {&#10;            call.respond(Car(&quot;Fiat&quot;, &quot;500&quot;, &quot;white&quot;))&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="檔案" id="send-file">
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中以檔案回應，請使用 <code>res.sendFile</code>：
                    </p>
                    <code-block lang="javascript" code="const path = require(&quot;path&quot;)&#10;&#10;app.get('/file', (req, res) =&gt; {&#10;    res.sendFile(path.join(__dirname, 'ktor_logo.png'))&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor 提供 <code>call.respondFile</code> 函式用於將檔案傳送至用戶端：
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/file&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.respondFile(file)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
        <p>
            Express 應用程式在以檔案回應時，會加入 <control>Accept-Ranges</control> HTTP 回應標頭。
            伺服器使用此標頭向用戶端宣告其支援部分請求以進行檔案下載。
            在 Ktor 中，您需要安裝 <Links href="//server-partial-content" summary="需要的相依性：io.ktor:%artifact_name% 伺服器範例：download-file，用戶端範例：client-download-file-range">PartialContent</Links> 外掛程式以支援部分請求。
        </p>
    </chapter>
    <chapter title="檔案附件" id="send-file-attachment">
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        <code>res.download</code> 函式會將指定的檔案作為附件傳輸：
                    </p>
                    <code-block lang="javascript" code="app.get('/file-attachment', (req, res) =&gt; {&#10;    res.download(&quot;ktor_logo.png&quot;)&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，您需要手動配置 <control>Content-Disposition</control> 標頭以將檔案作為附件傳輸：
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/file-attachment&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.response.header(&#10;                HttpHeaders.ContentDisposition,&#10;                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, &quot;ktor_logo.png&quot;)&#10;                    .toString()&#10;            )&#10;            call.respondFile(file)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="重新導向" id="redirect">
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中產生重新導向回應，請呼叫 <code>redirect</code> 函式：
                    </p>
                    <code-block lang="javascript" code="app.get('/old', (req, res) =&gt; {&#10;    res.redirect(301, &quot;moved&quot;)&#10;})&#10;&#10;app.get('/moved', (req, res) =&gt; {&#10;    res.send('Moved resource')&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，使用 <code>respondRedirect</code> 來傳送重新導向回應：
                    </p>
                    <code-block lang="kotlin" code="        get(&quot;/old&quot;) {&#10;            call.respondRedirect(&quot;/moved&quot;, permanent = true)&#10;        }&#10;        get(&quot;/moved&quot;) {&#10;            call.respondText(&quot;Moved resource&quot;)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
</chapter>
<chapter title="範本" id="templates">
    <p>
        Express 與 Ktor 都能夠配合範本引擎來處理檢視 (views)。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    假設我們在 <Path>views</Path> 資料夾中有以下的 Pug 範本：
                </p>
                <code-block code="html&#10;  head&#10;    title= title&#10;  body&#10;    h1= message"/>
                <p>
                    要以該範本回應，請呼叫 <code>res.render</code>：
                </p>
                <code-block lang="javascript" code="app.set('views', './views')&#10;app.set('view engine', 'pug')&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.render('index', { title: 'Hey', message: 'Hello there!' })&#10;})"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/6_templates/app.js">6_templates</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor 支援數種 <Links href="//server-templating" summary="了解如何處理使用 HTML/CSS 或 JVM 範本引擎建構的檢視。">JVM 範本引擎</Links>，
                    如 FreeMarker、Velocity 等。
                    例如，如果您需要以放置在應用程式資源中的 FreeMarker 範本回應，
                    請安裝並配置 <code>FreeMarker</code> 外掛程式，然後使用 <code>call.respond</code> 傳送範本：
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    install(FreeMarker) {&#10;        templateLoader = ClassTemplateLoader(this::class.java.classLoader, &quot;views&quot;)&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            val article = Article(&quot;Hey&quot;, &quot;Hello there!&quot;)&#10;            call.respond(FreeMarkerContent(&quot;index.ftl&quot;, mapOf(&quot;article&quot; to article)))&#10;        }&#10;    }&#10;}&#10;&#10;data class Article(val title: String, val message: String)"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/6_templates/src/main/kotlin/com/example/Application.kt">6_templates</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
</chapter>
<chapter title="接收請求" id="receive-request">
    <p>
        本節將展示如何接收不同格式的請求主體。
    </p>
    <chapter title="原始文字" id="receive-raw-text">
        <p>
            下方的 <code>POST</code> 請求向伺服器傳送文字資料：
        </p>
        <code-block lang="http" code="POST http://0.0.0.0:3000/text&#10;Content-Type: text/plain&#10;&#10;Hello, world!"/>
        <p>
            讓我們來看看如何在伺服器端將此請求的主體作為純文字接收。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中剖析傳入的請求主體，您需要加入 <code>body-parser</code>：
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')"/>
                    <p>
                        在 <code>post</code> 處理常式中，
                        您需要傳遞文字剖析器 (<code>bodyParser.text</code>)。
                        請求主體將可透過 <code>req.body</code> 屬性取得：
                    </p>
                    <code-block lang="javascript" code="app.post('/text', bodyParser.text(), (req, res) =&gt; {&#10;    let text = req.body&#10;    res.send(text)&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，您可以使用 <code>call.receiveText</code> 將主體作為文字接收：
                    </p>
                    <code-block lang="kotlin" code="        post(&quot;/text&quot;) {&#10;            val text = call.receiveText()&#10;            call.respondText(text)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="JSON" id="receive-json">
        <p>
            在本節中，我們將探討如何接收 JSON 主體。
            下方的範例顯示了一個在其主體中帶有 JSON 物件的 <code>POST</code> 請求：
        </p>
        <code-block lang="http" code="POST http://0.0.0.0:3000/json&#10;Content-Type: application/json&#10;&#10;{&#10;  &quot;type&quot;: &quot;Fiat&quot;,&#10;  &quot;model&quot; : &quot;500&quot;,&#10;  &quot;color&quot;: &quot;white&quot;&#10;}"/>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中接收 JSON，請使用 <code>bodyParser.json</code>：
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/json', bodyParser.json(), (req, res) =&gt; {&#10;    let car = req.body&#10;    res.send(car)&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，您需要安裝 <Links href="//server-serialization" summary="ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間協商媒體類型，以及以特定格式對內容進行序列化／還原序列化。">ContentNegotiation</Links> 外掛程式並配置 <code>Json</code> 序列化器：
                    </p>
                    <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json(Json {&#10;            prettyPrint = true&#10;            isLenient = true&#10;        })&#10;    }"/>
                    <p>
                        要將接收到的資料還原序列化為物件，您需要建立一個資料類別：
                    </p>
                    <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                    <p>
                        然後，使用接受此資料類別作為參數的 <code>receive</code> 方法：
                    </p>
                    <code-block lang="kotlin" code="        post(&quot;/json&quot;) {&#10;            val car = call.receive&lt;Car&gt;()&#10;            call.respond(car)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="URL 編碼" id="receive-url-encoded">
        <p>
            現在讓我們來看看如何接收使用 <control>application/x-www-form-urlencoded</control> 類型傳送的表單資料。
            下方的程式碼片段顯示了一個帶有表單資料的範例 <code>POST</code> 請求：
        </p>
        <code-block lang="http" code="POST http://localhost:3000/urlencoded&#10;Content-Type: application/x-www-form-urlencoded&#10;&#10;username=JetBrains&amp;email=example@jetbrains.com&amp;password=foobar&amp;confirmation=foobar"/>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        與純文字和 JSON 同樣，Express 需要 <code>body-parser</code>。
                        您需要將剖析器型別設定為 <code>bodyParser.urlencoded</code>：
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/urlencoded', bodyParser.urlencoded({extended: true}), (req, res) =&gt; {&#10;    let user = req.body&#10;    res.send(`The ${user[&quot;username&quot;]} account is created`)&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，使用 <code>call.receiveParameters</code> 函式：
                    </p>
                    <code-block lang="kotlin" code="        post(&quot;/urlencoded&quot;) {&#10;            val formParameters = call.receiveParameters()&#10;            val username = formParameters[&quot;username&quot;].toString()&#10;            call.respondText(&quot;The '$username' account is created&quot;)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

    </table>
    </chapter>
    <chapter title="原始資料" id="receive-raw-data">
        <p>
            下一個使用案例是處理二進位資料。
            下方的請求將帶有 <control>application/octet-stream</control> 類型的 PNG 影像傳送至伺服器：
        </p>
        <code-block lang="http" code="POST http://localhost:3000/raw&#10;Content-Type: application/octet-stream&#10;&#10;&lt; ./ktor_logo.png"/>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        要在 Express 中處理二進位資料，請將剖析器型別設定為 <code>raw</code>：
                    </p>
                    <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;const fs = require('fs')&#10;&#10;app.post('/raw', bodyParser.raw({type: () =&gt; true}), (req, res) =&gt; {&#10;    let rawBody = req.body&#10;    fs.createWriteStream('./uploads/ktor_logo.png').write(rawBody)&#10;    res.send('A file is uploaded')&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor 提供 <code>ByteReadChannel</code> 與 <code>ByteWriteChannel</code>
                        用於非同步讀取／寫入位元組序列：
                    </p>
                    <code-block lang="kotlin" code="        post(&quot;/raw&quot;) {&#10;            val file = File(&quot;uploads/ktor_logo.png&quot;)&#10;            call.receiveChannel().copyAndClose(file.writeChannel())&#10;            call.respondText(&quot;A file is uploaded&quot;)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive
                            request</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="多部分 (Multipart)" id="receive-multipart">
        <p>
            在最後一節中，讓我們來看看如何處理 <emphasis>多部分 (multipart)</emphasis> 主體。
            下方的 <code>POST</code> 請求使用 <control>multipart/form-data</control> 類型傳送 PNG 影像與說明：
        </p>
        <code-block lang="http" code="POST http://localhost:3000/multipart&#10;Content-Type: multipart/form-data; boundary=WebAppBoundary&#10;&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;description&quot;&#10;Content-Type: text/plain&#10;&#10;Ktor logo&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;image&quot;; filename=&quot;ktor_logo.png&quot;&#10;Content-Type: image/png&#10;&#10;&lt; ./ktor_logo.png&#10;--WebAppBoundary--"/>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express 需要個別的模組來剖析多部分資料。
                        在下方的範例中，使用了 <control>multer</control> 將檔案上傳至伺服器：
                    </p>
                    <code-block lang="javascript" code="const multer = require('multer')&#10;&#10;const storage = multer.diskStorage({&#10;    destination: './uploads/',&#10;    filename: function (req, file, cb) {&#10;        cb(null, file.originalname);&#10;    }&#10;})&#10;const upload = multer({storage: storage});&#10;app.post('/multipart', upload.single('image'), function (req, res, next) {&#10;    let fileDescription = req.body[&quot;description&quot;]&#10;    let fileName = req.file.filename&#10;    res.send(`${fileDescription} is uploaded to uploads/${fileName}`)&#10;})"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        在 Ktor 中，如果您需要接收作為多部分請求的一部分傳送的檔案，
                        請呼叫 <code>receiveMultipart</code> 函式，然後視需要對每個部分進行迴圈處理。
                        在下方的範例中，使用 <code>PartData.FileItem</code> 將檔案作為位元組串流接收：
                    </p>
                    <code-block lang="kotlin" code="        post(&quot;/multipart&quot;) {&#10;            var fileDescription = &quot;&quot;&#10;            var fileName = &quot;&quot;&#10;            val multipartData = call.receiveMultipart()&#10;            multipartData.forEachPart { part -&gt;&#10;                when (part) {&#10;                    is PartData.FormItem -&gt; {&#10;                        fileDescription = part.value&#10;                    }&#10;&#10;                    is PartData.FileItem -&gt; {&#10;                        fileName = part.originalFileName as String&#10;                        val channel = part.provider()&#10;                        SystemFileSystem.sink(Path(&quot;uploads/$fileName&quot;)).use { sink -&gt;&#10;                            while (!channel.exhausted()) {&#10;                                channel.readBuffer().transferTo(sink)&#10;                                sink.flush()&#10;                            }&#10;                        }&#10;                    }&#10;&#10;                    else -&gt; {}&#10;                }&#10;                part.dispose()&#10;            }&#10;            call.respondText(&quot;$fileDescription is uploaded to 'uploads/$fileName'&quot;)&#10;        }"/>
                    <p>
                        如需完整範例，請參閱
                        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                        專案。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
</chapter>
<chapter title="建立中介軟體" id="middleware">
    <p>
        最後我們要探討的是如何建立允許您擴充伺服器功能的中介軟體。
        下方的範例展示如何使用 Express 與 Ktor 實作請求記錄。
    </p>
    <table style="header-column">
        
<tr>
<td>
                <control>Express</control>
            </td>
            <td>
                <p>
                    在 Express 中，中介軟體是使用 <code>app.use</code> 綁定到應用程式的函式：
                </p>
                <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;const requestLogging = function (req, res, next) {&#10;    let scheme = req.protocol&#10;    let host = req.headers.host&#10;    let url = req.url&#10;    console.log(`Request URL: ${scheme}://${host}${url}`)&#10;    next()&#10;}&#10;&#10;app.use(requestLogging)"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/8_middleware/app.js">8_middleware</a>
                    專案。
                </p>
            </td>
</tr>

        
<tr>
<td>
                <control>Ktor</control>
            </td>
            <td>
                <p>
                    Ktor 允許您使用 <Links href="//server-custom-plugins" summary="了解如何建立您自己的自訂外掛程式。">自訂外掛程式</Links> 來擴充其功能。
                    下方的程式碼範例展示如何處理 <code>onCall</code> 以實作請求記錄：
                </p>
                <code-block lang="kotlin" code="val RequestLoggingPlugin = createApplicationPlugin(name = &quot;RequestLoggingPlugin&quot;) {&#10;    onCall { call -&gt;&#10;        call.request.origin.apply {&#10;            println(&quot;Request URL: $scheme://$localHost:$localPort$uri&quot;)&#10;        }&#10;    }&#10;}"/>
                <p>
                    如需完整範例，請參閱
                    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/8_middleware/src/main/kotlin/com/example/Application.kt">8_middleware</a>
                    專案。
                </p>
            </td>
</tr>

    </table>
</chapter>
<chapter title="下一步" id="next">
    <p>
        本指南中還有許多未涵蓋的使用案例，
        如工作階段管理、授權、資料庫整合等。
        對於大多數功能，Ktor 提供了專用的外掛程式，
        可以安裝在應用程式中並根據需要進行配置。
        要繼續您的 Ktor 旅程，
        請造訪 <control><a href="https://ktor.io/learn/">學習頁面</a></control>，
        其中提供了一系列的逐步指南與開箱即用的範例。
    </p>
</chapter>
</topic>