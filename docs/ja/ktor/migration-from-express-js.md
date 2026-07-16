<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="ExpressからKtorへの移行"
       id="migration-from-express-js" help-id="express-js;migrating-from-express-js">
    <show-structure for="chapter" depth="2"/>
    <link-summary>このガイドでは、シンプルなKtorアプリケーションの作成、実行、テスト方法を説明します。</link-summary>
    <tldr>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express">migrating-express</a>
            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor">migrating-express-ktor</a>
        </p>
    </tldr>
    <p>
        このガイドでは、基本的なシナリオにおけるExpressアプリケーションからKtorへの移行方法について説明します。アプリケーションの生成から最初のアプリケーションの記述、そしてアプリケーション機能を拡張するためのミドルウェアの作成までを扱います。
    </p>
    <chapter title="アプリケーションを生成する" id="generate">
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        <code>express-generator</code>ツールを使用して、新しいExpressアプリケーションを生成できます。
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
                        Ktorは、アプリケーションのスケルトンを生成する以下の方法を提供します。
                    </p>
                    <list>
                        <li>
                            <p>
                                <a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a> — Webベースのジェネレーターを使用します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="https://github.com/ktorio/ktor-cli">
                                    Ktor CLIツール
                                </a> — コマンドラインインターフェースを介して<code>ktor new</code>コマンドでKtorプロジェクトを生成します。
                            </p>
                            <code-block lang="shell" code="                                ktor new ktor-sample"/>
                        </li>
                        <li>
                            <p>
                                <a href="https://www.npmjs.com/package/generator-ktor">
                                    Yeomanジェネレーター
                                </a>
                                — 対話形式でプロジェクト設定を行い、必要なプラグインを選択します。
                            </p>
                            <code-block lang="shell" code="                                yo ktor"/>
                        </li>
                        <li>
                            <p>
                                <a href="https://ktor.io/idea/">IntelliJ IDEA Ultimate</a> — 組み込みのKtorプロジェクトウィザードを使用します。
                            </p>
                        </li>
                    </list>
                    <p>
                        詳細な手順については、<Links href="/ktor/server-create-a-new-project" summary="Ktorでサーバーアプリケーションを開き、実行し、テストする方法を学びます。">新しいKtorプロジェクトを作成、開く、実行する</Links>チュートリアルを参照してください。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="Hello world" id="hello">
        <p>
            このセクションでは、<code>GET</code>リクエストを受け入れ、事前定義されたプレーンテキストで応答する最もシンプルなサーバーアプリケーションを作成する方法を見ていきます。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        以下の例は、サーバーを起動し、ポート
                        <control>3000</control>
                        で接続をリッスンするExpressアプリケーションを示しています。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.send('Hello World!')&#10;})&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/1_hello/app.js">1_hello</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorでは、<a href="#embedded-server">embeddedServer</a>
                        関数を使用してコード内でサーバーパラメータを設定し、アプリケーションを素早く実行できます。
                    </p>
                    <code-block lang="kotlin" code="import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello World!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/1_hello/src/main/kotlin/com/example/Application.kt">1_hello</a>
                        プロジェクトを参照してください。
                    </p>
                    <p>
                        また、HOCONまたはYAML形式を使用する<a href="#engine-main">外部設定ファイル</a>でサーバー設定を指定することもできます。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            上記のExpressアプリケーションは、
            <control>Date</control>
            、
            <control>X-Powered-By</control>
            、および
            <control>ETag</control>
            応答ヘッダーを追加することに注意してください。これらは次のようになります。
        </p>
        <code-block code="            Date: Fri, 05 Aug 2022 06:30:48 GMT&#10;            X-Powered-By: Express&#10;            ETag: W/&quot;c-Lve95gjOVATpfV8EL5X4nxwjKHE&quot;"/>
        <p>
            Ktorの各レスポンスにデフォルトの
            <control>Server</control>
            および
            <control>Date</control>
            ヘッダーを追加するには、<Links href="/ktor/server-default-headers" summary="必要な依存関係: io.ktor:%artifact_name% ネイティブサーバーサポート: ✅">DefaultHeaders</Links>プラグインをインストールする必要があります。
            <Links href="/ktor/server-conditional-headers" summary="必要な依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">ConditionalHeaders</Links>プラグインは、
            <control>Etag</control>
            応答ヘッダーを設定するために使用できます。
        </p>
    </chapter>
    <chapter title="静的コンテンツの提供" id="static">
        <p>
            このセクションでは、ExpressとKtorで画像、CSSファイル、JavaScriptファイルなどの静的ファイルをどのように提供するかを見ていきます。
            <Path>public</Path>
            フォルダにメインの
            <Path>index.html</Path>
            ページと、それにリンクされた一連のアセットがあるとします。
        </p>
        <code-block code="            public&#10;            ├── index.html&#10;            ├── ktor_logo.png&#10;            ├── css&#10;            │   └──styles.css&#10;            └── js&#10;                └── script.js"/>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Expressでは、フォルダ名を
                        <control>express.static</control>
                        関数に渡します。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.use(express.static('public'))&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/2_static/app.js">2_static</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorでは、<a href="#folders"><code>staticFiles()</code></a>
                        関数を使用して、
                        <Path>/</Path>
                        パスへのリクエストを
                        <Path>public</Path>
                        物理フォルダにマッピングします。
                        この関数は、
                        <Path>public</Path>
                        フォルダ内のすべてのファイルを再帰的に提供することを可能にします。
                    </p>
                    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.http.content.*&#10;import io.ktor.server.routing.*&#10;import java.io.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        staticFiles(&quot;&quot;, File(&quot;public&quot;), &quot;index.html&quot;)&#10;    }&#10;}"/>
                    <p>
                        完全な例については、<a
                            href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/2_static/src/main/kotlin/com/example/Application.kt">2_static</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            静的コンテンツを提供する場合、Expressは次のような応答ヘッダーをいくつか追加します。
        </p>
        <code-block code="            Accept-Ranges: bytes&#10;            Cache-Control: public, max-age=0&#10;            ETag: W/&quot;181-1823feafeb1&quot;&#10;            Last-Modified: Wed, 27 Jul 2022 13:49:01 GMT"/>
        <p>
            Ktorでこれらのヘッダーを管理するには、以下のプラグインをインストールする必要があります。
        </p>
        <list>
            <li>
                <p>
                    <control>Accept-Ranges</control>
                    : <Links href="/ktor/server-partial-content" summary="必要な依存関係: io.ktor:%artifact_name% サーバー例: download-file, クライアント例: client-download-file-range ネイティブサーバーサポート: ✅">PartialContent</Links>
                </p>
            </li>
            <li>
                <p>
                    <control>Cache-Control</control>
                    : <Links href="/ktor/server-caching-headers" summary="必要な依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">CachingHeaders</Links>
                </p>
            </li>
            <li>
                <p>
                    <control>ETag</control>
                    および
                    <control>Last-Modified</control>
                    :
                    <Links href="/ktor/server-conditional-headers" summary="必要な依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">ConditionalHeaders</Links>
                </p>
            </li>
        </list>
    </chapter>
    <chapter title="ルーティング" id="routing">
        <p>
            <Links href="/ktor/server-routing" summary="ルーティングは、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">ルーティング</Links>は、特定のHTTPリクエストメソッド（<code>GET</code>、<code>POST</code>など）とパスによって定義される、特定のエンドポイントへの受信リクエストを処理できます。
            以下の例は、<Path>/</Path>パスへの<code>GET</code>および
            <code>POST</code>リクエストを処理する方法を示しています。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <code-block lang="javascript" code="app.get('/', (req, res) =&gt; {&#10;    res.send('GET request to the homepage')&#10;})&#10;&#10;app.post('/', (req, res) =&gt; {&#10;    res.send('POST request to the homepage')&#10;})"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                        プロジェクトを参照してください。
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
                            <code>POST</code>、<code>PUT</code>、または
                            <code>PATCH</code>リクエストの本文を受信する方法については、<a href="#receive-request">リクエストの受信</a>を参照してください。
                        </p>
                    </tip>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            以下の例は、パスごとにルートハンドラーをグループ化する方法を示しています。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Expressでは、<code>app.route()</code>を使用して、ルートパスの連鎖可能なルートハンドラーを作成できます。
                    </p>
                    <code-block lang="javascript" code="app.route('/book')&#10;    .get((req, res) =&gt; {&#10;        res.send('Get a random book')&#10;    })&#10;    .post((req, res) =&gt; {&#10;        res.send('Add a book')&#10;    })&#10;    .put((req, res) =&gt; {&#10;        res.send('Update the book')&#10;    })"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorは<code>route</code>関数を提供しており、これによりパスを定義し、そのパスの動詞をネストされた関数として配置できます。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        route(&quot;book&quot;) {&#10;            get {&#10;                call.respondText(&quot;Get a random book&quot;)&#10;            }&#10;            post {&#10;                call.respondText(&quot;Add a book&quot;)&#10;            }&#10;            put {&#10;                call.respondText(&quot;Update the book&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            どちらのフレームワークも、関連するルートを単一のファイルにグループ化することを可能にします。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Expressは、マウント可能なルートハンドラーを作成するために<code>express.Router</code>クラスを提供します。
                        アプリケーションのディレクトリに
                        <Path>birds.js</Path>
                        ルーターファイルがあるとします。
                        このルーターモジュールは、<Path>app.js</Path>
                        に示されているようにアプリケーションにロードできます。
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
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorでは、一般的なパターンとして、<code>Routing</code>型に拡張関数を使用して実際のルートを定義します。
                        以下のサンプル（
                        <Path>Birds.kt</Path>
                        ）は、<code>birdsRoutes</code>拡張関数を定義しています。
                        この関数を<code>routing</code>ブロック内で呼び出すことで、対応するルートをアプリケーション（
                        <Path>Application.kt</Path>
                        ）に含めることができます。
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
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            URLパスを文字列として指定する以外に、Ktorには<Links href="/ktor/server-resources" summary="Resourcesプラグインを使用すると、型安全なルーティングを実装できます。">型安全なルート</Links>を実装する機能が含まれています。
        </p>
    </chapter>
    <chapter title="ルートパラメータとクエリパラメータ" id="route-query-param">
        <p>
            このセクションでは、ルートパラメータとクエリパラメータにアクセスする方法を示します。
        </p>
        <p>
            ルート（またはパス）パラメータは、URL内のその位置で指定された値をキャプチャするために使用される、名前付きのURLセグメントです。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Expressでルートパラメータにアクセスするには、<code>Request.params</code>を使用できます。
                        例えば、以下のコードスニペットの<code>req.parameters["login"]</code>は、
                        <emphasis>admin</emphasis>
                        を<Path>/user/admin</Path>
                        パスの場合に返します。
                    </p>
                    <code-block lang="javascript" code="app.get('/user/:login', (req, res) =&gt; {&#10;    if (req.params['login'] === 'admin') {&#10;        res.send('You are logged in as Admin')&#10;    } else {&#10;        res.send('You are logged in as Guest')&#10;    }&#10;})"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorでは、ルートパラメータは<code>{param}</code>構文を使用して定義されます。
                        ルートハンドラーでルートパラメータにアクセスするには、<code>call.parameters</code>を使用できます。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/user/{login}&quot;) {&#10;            if (call.parameters[&quot;login&quot;] == &quot;admin&quot;) {&#10;                call.respondText(&quot;You are logged in as Admin&quot;)&#10;            } else {&#10;                call.respondText(&quot;You are logged in as Guest&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
        <p>
            以下の表は、クエリ文字列のパラメータにアクセスする方法を比較しています。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Expressでルートパラメータにアクセスするには、<code>Request.params</code>を使用できます。
                        例えば、以下のコードスニペットの<code>req.parameters["login"]</code>は、
                        <emphasis>admin</emphasis>
                        を<Path>/user/admin</Path>
                        パスの場合に返します。
                    </p>
                    <code-block lang="javascript" code="app.get('/products', (req, res) =&gt; {&#10;    if (req.query['price'] === 'asc') {&#10;        res.send('Products from the lowest price to the highest')&#10;    }&#10;})"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorでは、ルートパラメータは<code>{param}</code>構文を使用して定義されます。
                        ルートハンドラーでルートパラメータにアクセスするには、<code>call.parameters</code>を使用できます。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/products&quot;) {&#10;            if (call.request.queryParameters[&quot;price&quot;] == &quot;asc&quot;) {&#10;                call.respondText(&quot;Products from the lowest price to the highest&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="レスポンスの送信" id="send-response">
        <p>
            これまでのセクションでは、プレーンテキストコンテンツで応答する方法を見てきました。
            JSON、ファイル、およびリダイレクト応答を送信する方法を見ていきましょう。
        </p>
        <chapter title="JSON" id="send-json">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Expressで適切なコンテンツタイプを含むJSONレスポンスを送信するには、
                            <code>res.json</code>関数を呼び出します。
                        </p>
                        <code-block lang="javascript" code="const car = {type:&quot;Fiat&quot;, model:&quot;500&quot;, color:&quot;white&quot;};&#10;app.get('/json', (req, res) =&gt; {&#10;    res.json(car)&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、<Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインには、クライアントとサーバー間でメディアタイプをネゴシエートすること、およびコンテンツを特定の形式でシリアライズ/デシリアライズすることという2つの主要な目的があります。">ContentNegotiation</Links>
                            プラグインをインストールし、
                            JSONシリアライザを設定する必要があります。
                        </p>
                        <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
                        <p>
                            データをJSONにシリアライズするには、<code>@Serializable</code>アノテーションを付けたデータクラスを作成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                        <p>
                            次に、<code>call.respond</code>を使用してこのクラスのオブジェクトをレスポンスで送信できます。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/json&quot;) {&#10;            call.respond(Car(&quot;Fiat&quot;, &quot;500&quot;, &quot;white&quot;))&#10;        }"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="ファイル" id="send-file">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Expressでファイルで応答するには、<code>res.sendFile</code>を使用します。
                        </p>
                        <code-block lang="javascript" code="const path = require(&quot;path&quot;)&#10;&#10;app.get('/file', (req, res) =&gt; {&#10;    res.sendFile(path.join(__dirname, 'ktor_logo.png'))&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorは、クライアントにファイルを送信するための<code>call.respondFile</code>関数を提供します。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/file&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.respondFile(file)&#10;        }"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
            <p>
                Expressアプリケーションは、ファイルで応答する際に
                <control>Accept-Ranges</control>
                HTTP応答ヘッダーを追加します。
                サーバーは、ファイルダウンロードのためのクライアントからの部分的なリクエストのサポートを宣伝するためにこのヘッダーを使用します。
                Ktorでは、部分的なリクエストをサポートするために<Links href="/ktor/server-partial-content" summary="必要な依存関係: io.ktor:%artifact_name% サーバー例: download-file, クライアント例: client-download-file-range ネイティブサーバーサポート: ✅">PartialContent</Links>プラグインをインストールする必要があります。
            </p>
        </chapter>
        <chapter title="ファイル添付" id="send-file-attachment">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            <code>res.download</code>関数は、指定されたファイルを添付ファイルとして転送します。
                        </p>
                        <code-block lang="javascript" code="app.get('/file-attachment', (req, res) =&gt; {&#10;    res.download(&quot;ktor_logo.png&quot;)&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、ファイルを添付ファイルとして転送するために、
                            <control>Content-Disposition</control>
                            ヘッダーを手動で設定する必要があります。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/file-attachment&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.response.header(&#10;                HttpHeaders.ContentDisposition,&#10;                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, &quot;ktor_logo.png&quot;)&#10;                    .toString()&#10;            )&#10;            call.respondFile(file)&#10;        }"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="リダイレクト" id="redirect">
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Expressでリダイレクト応答を生成するには、<code>redirect</code>関数を呼び出します。
                        </p>
                        <code-block lang="javascript" code="app.get('/old', (req, res) =&gt; {&#10;    res.redirect(301, &quot;moved&quot;)&#10;})&#10;&#10;app.get('/moved', (req, res) =&gt; {&#10;    res.send('Moved resource')&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、<code>respondRedirect</code>を使用してリダイレクト応答を送信します。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/old&quot;) {&#10;            call.respondRedirect(&quot;/moved&quot;, permanent = true)&#10;        }&#10;        get(&quot;/moved&quot;) {&#10;            call.respondText(&quot;Moved resource&quot;)&#10;        }"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
    </chapter>
    <chapter title="テンプレート" id="templates">
        <p>
            ExpressとKtorの両方で、ビューを扱うためのテンプレートエンジンを使用できます。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        以下に示すPugテンプレートが
                        <Path>views</Path>
                        フォルダにあるとします。
                    </p>
                    <code-block code="html&#10;  head&#10;    title= title&#10;  body&#10;    h1= message"/>
                    <p>
                        このテンプレートで応答するには、<code>res.render</code>を呼び出します。
                    </p>
                    <code-block lang="javascript" code="app.set('views', './views')&#10;app.set('view engine', 'pug')&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.render('index', { title: 'Hey', message: 'Hello there!' })&#10;})"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/6_templates/app.js">6_templates</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorは、FreeMarker、Velocityなど、いくつかの<Links href="/ktor/server-templating" summary="HTML/CSSまたはJVMテンプレートエンジンで構築されたビューを扱う方法を学びます。">JVMテンプレートエンジン</Links>をサポートしています。
                        例えば、アプリケーションリソースに配置されたFreeMarkerテンプレートで応答する必要がある場合、
                        <code>FreeMarker</code>プラグインをインストールして設定し、
                        <code>call.respond</code>を使用してテンプレートを送信します。
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    install(FreeMarker) {&#10;        templateLoader = ClassTemplateLoader(this::class.java.classLoader, &quot;views&quot;)&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            val article = Article(&quot;Hey&quot;, &quot;Hello there!&quot;)&#10;            call.respond(FreeMarkerContent(&quot;index.ftl&quot;, mapOf(&quot;article&quot; to article)))&#10;        }&#10;    }&#10;}&#10;&#10;data class Article(val title: String, val message: String)"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/6_templates/src/main/kotlin/com/example/Application.kt">6_templates</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="リクエストの受信" id="receive-request">
        <p>
            このセクションでは、さまざまな形式でリクエストボディを受信する方法を示します。
        </p>
        <chapter title="生テキスト" id="receive-raw-text">
            <p>
                以下の<code>POST</code>リクエストは、テキストデータをサーバーに送信します。
            </p>
            <code-block lang="http" code="POST http://0.0.0.0:3000/text&#10;Content-Type: text/plain&#10;&#10;Hello, world!"/>
            <p>
                このリクエストの本文をサーバー側でプレーンテキストとして受信する方法を見てみましょう。
            </p>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Expressで受信リクエストボディをパースするには、<code>body-parser</code>を追加する必要があります。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')"/>
                        <p>
                            <code>post</code>ハンドラーでは、テキストパーサー（<code>bodyParser.text</code>）を渡す必要があります。
                            リクエストボディは<code>req.body</code>プロパティから利用できます。
                        </p>
                        <code-block lang="javascript" code="app.post('/text', bodyParser.text(), (req, res) =&gt; {&#10;    let text = req.body&#10;    res.send(text)&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、<code>call.receiveText</code>を使用してボディをテキストとして受信できます。
                        </p>
                        <code-block lang="kotlin" code="    routing {&#10;        post(&quot;/text&quot;) {&#10;            val text = call.receiveText()&#10;            call.respondText(text)"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="JSON" id="receive-json">
            <p>
                このセクションでは、JSONボディを受信する方法を見ていきます。
                以下のサンプルは、JSONオブジェクトをボディに含む<code>POST</code>リクエストを示しています。
            </p>
            <code-block lang="http" code="POST http://0.0.0.0:3000/json&#10;Content-Type: application/json&#10;&#10;{&#10;  &quot;type&quot;: &quot;Fiat&quot;,&#10;  &quot;model&quot; : &quot;500&quot;,&#10;  &quot;color&quot;: &quot;white&quot;&#10;}"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            ExpressでJSONを受信するには、<code>bodyParser.json</code>を使用します。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/json', bodyParser.json(), (req, res) =&gt; {&#10;    let car = req.body&#10;    res.send(car)&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、<Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインには、クライアントとサーバー間でメディアタイプをネゴシエートすること、およびコンテンツを特定の形式でシリアライズ/デシリアライズすることという2つの主要な目的があります。">ContentNegotiation</Links>
                            プラグインをインストールし、
                            <code>Json</code>シリアライザーを設定する必要があります。
                        </p>
                        <code-block lang="kotlin" code="fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            prettyPrint = true&#10;            isLenient = true&#10;        })"/>
                        <p>
                            受信したデータをオブジェクトにデシリアライズするには、データクラスを作成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="@Serializable"/>
                        <p>
                            次に、このデータクラスをパラメータとして受け入れる<code>receive</code>メソッドを使用します。
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/json&quot;) {&#10;            val car = call.receive&lt;Car&gt;()&#10;            call.respond(car)"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="URLエンコード" id="receive-url-encoded">
            <p>
                次に、
                <control>application/x-www-form-urlencoded</control>
                タイプを使用して送信されたフォームデータを受信する方法を見ていきましょう。
                以下のコードスニペットは、フォームデータを含むサンプル<code>POST</code>リクエストを示しています。
            </p>
            <code-block lang="http" code="POST http://localhost:3000/urlencoded&#10;Content-Type: application/x-www-form-urlencoded&#10;&#10;username=JetBrains&amp;email=example@jetbrains.com&amp;password=foobar&amp;confirmation=foobar"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            プレーンテキストやJSONと同様に、Expressでは<code>body-parser</code>が必要です。
                            パーサーのタイプを<code>bodyParser.urlencoded</code>に設定する必要があります。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/urlencoded', bodyParser.urlencoded({extended: true}), (req, res) =&gt; {&#10;    let user = req.body&#10;    res.send(`The ${user[&quot;username&quot;]} account is created`)&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、<code>call.receiveParameters</code>関数を使用します。
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/urlencoded&quot;) {&#10;            val formParameters = call.receiveParameters()&#10;            val username = formParameters[&quot;username&quot;].toString()&#10;            call.respondText(&quot;The '$username' account is created&quot;)"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="生データ" id="receive-raw-data">
            <p>
                次のユースケースはバイナリデータの処理です。
                以下のリクエストは、
                <control>application/octet-stream</control>
                タイプでPNG画像をサーバーに送信します。
            </p>
            <code-block lang="http" code="POST http://localhost:3000/raw&#10;Content-Type: application/octet-stream&#10;&#10;&lt; ./ktor_logo.png"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Expressでバイナリデータを扱うには、パーサーのタイプを<code>raw</code>に設定します。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;const fs = require('fs')&#10;&#10;app.post('/raw', bodyParser.raw({type: () =&gt; true}), (req, res) =&gt; {&#10;    let rawBody = req.body&#10;    fs.createWriteStream('./uploads/ktor_logo.png').write(rawBody)&#10;    res.send('A file is uploaded')&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorは、バイトシーケンスの非同期読み書きのために<code>ByteReadChannel</code>と<code>ByteWriteChannel</code>を提供します。
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/raw&quot;) {&#10;            val file = File(&quot;uploads/ktor_logo.png&quot;)&#10;            call.receiveChannel().copyAndClose(file.writeChannel())&#10;            call.respondText(&quot;A file is uploaded&quot;)"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive
                                request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
        <chapter title="マルチパート" id="receive-multipart">
            <p>
                最後のセクションでは、<emphasis>マルチパート</emphasis>ボディの処理方法を見ていきましょう。
                以下の<code>POST</code>リクエストは、
                <control>multipart/form-data</control>
                タイプを使用して、説明付きのPNG画像を送信します。
            </p>
            <code-block lang="http" code="POST http://localhost:3000/multipart&#10;Content-Type: multipart/form-data; boundary=WebAppBoundary&#10;&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;description&quot;&#10;Content-Type: text/plain&#10;&#10;Ktor logo&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;image&quot;; filename=&quot;ktor_logo.png&quot;&#10;Content-Type: image/png&#10;&#10;&lt; ./ktor_logo.png&#10;--WebAppBoundary--"/>
            <table style="header-column">
                <tr>
                    <td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Expressは、マルチパートデータをパースするために別のモジュールを必要とします。
                            以下の例では、
                            <control>multer</control>
                            がファイルをサーバーにアップロードするために使用されています。
                        </p>
                        <code-block lang="javascript" code="const multer = require('multer')&#10;&#10;const storage = multer.diskStorage({&#10;    destination: './uploads/',&#10;    filename: function (req, file, cb) {&#10;        cb(null, file.originalname);&#10;    }&#10;})&#10;const upload = multer({storage: storage});&#10;app.post('/multipart', upload.single('image'), function (req, res, next) {&#10;    let fileDescription = req.body[&quot;description&quot;]&#10;    let fileName = req.file.filename&#10;    res.send(`${fileDescription} is uploaded to uploads/${fileName}`)&#10;})"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktorでは、マルチパートリクエストの一部として送信されたファイルを受信する必要がある場合、
                            <code>receiveMultipart</code>関数を呼び出し、必要に応じて各パートをループ処理します。
                            以下の例では、<code>PartData.FileItem</code>がバイトストリームとしてファイルを受信するために使用されています。
                        </p>
                        <code-block lang="kotlin" code="        }&#10;        post(&quot;/multipart&quot;) {&#10;            var fileDescription = &quot;&quot;&#10;            var fileName = &quot;&quot;&#10;            val multipartData = call.receiveMultipart()&#10;            multipartData.forEachPart { part -&gt;&#10;                when (part) {&#10;                    is PartData.FormItem -&gt; {&#10;                        fileDescription = part.value&#10;                    }&#10;&#10;                    is PartData.FileItem -&gt; {&#10;                        fileName = part.originalFileName as String&#10;                        val fileBytes = part.provider().readRemaining().readByteArray()&#10;                        File(&quot;uploads/$fileName&quot;).writeBytes(fileBytes)&#10;                    }&#10;&#10;                    else -&gt; {}&#10;                }&#10;                part.dispose()&#10;            }"/>
                        <p>
                            完全な例については、
                            <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a>
                            プロジェクトを参照してください。
                        </p>
                    </td>
                </tr>
            </table>
        </chapter>
    </chapter>
    <chapter title="ミドルウェアの作成" id="middleware">
        <p>
            最後に見ていくのは、サーバー機能を拡張できるミドルウェアの作成方法です。
            以下の例は、ExpressとKtorを使用してリクエストロギングを実装する方法を示しています。
        </p>
        <table style="header-column">
            <tr>
                <td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Expressでは、ミドルウェアは<code>app.use</code>を使用してアプリケーションにバインドされた関数です。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;const requestLogging = function (req, res, next) {&#10;    let scheme = req.protocol&#10;    let host = req.headers.host&#10;    let url = req.url&#10;    console.log(`Request URL: ${scheme}://${host}${url}`)&#10;    next()&#10;}&#10;&#10;app.use(requestLogging)"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express/8_middleware/app.js">8_middleware</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktorは、<Links href="/ktor/server-custom-plugins" summary="独自のカスタムプラグインを作成する方法を学びます。">カスタムプラグイン</Links>を使用してその機能を拡張できます。
                        以下のコード例は、リクエストロギングを実装するために<code>onCall</code>を処理する方法を示しています。
                    </p>
                    <code-block lang="kotlin" code="val RequestLoggingPlugin = createApplicationPlugin(name = &quot;RequestLoggingPlugin&quot;) {&#10;    onCall { call -&gt;&#10;        call.request.origin.apply {&#10;            println(&quot;Request URL: $scheme://$localHost:$localPort$uri&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>
                        完全な例については、
                        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/migrating-express-ktor/8_middleware/src/main/kotlin/com/example/Application.kt">8_middleware</a>
                        プロジェクトを参照してください。
                    </p>
                </td>
            </tr>
        </table>
    </chapter>
    <chapter title="次のステップ" id="next">
        <p>
            このガイドでは、セッション管理、認可、データベース統合など、まだ多くのユースケースがカバーされていません。
            これらの機能のほとんどについて、Ktorはアプリケーションにインストールして必要に応じて設定できる専用のプラグインを提供しています。
            Ktorでの学習を続けるには、ステップバイステップのガイドとすぐに使えるサンプルが提供されている
            <control><a href="https://ktor.io/learn/">Learnページ</a></control>
            にアクセスしてください。
        </p>
    </chapter>
</topic>