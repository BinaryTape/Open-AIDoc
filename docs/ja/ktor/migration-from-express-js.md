<topic xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       title="Express から Ktor への移行"
       id="migration-from-express-js" help-id="express-js;migrating-from-express-js">
    <show-structure for="chapter" depth="2"/>
    <link-summary>このガイドでは、シンプルな Ktor アプリケーションの作成、実行、テスト方法について説明します。</link-summary>
    <tldr>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express">migrating-express</a>
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor">migrating-express-ktor</a>
        </p>
    </tldr>
    <p>
        このガイドでは、アプリケーションの生成や最初のアプリケーションの記述から、アプリケーションの機能を拡張するためのミドルウェアの作成まで、基本的なシナリオにおいて Express アプリケーションを Ktor へ移行する方法を見ていきます。
    </p>
    <chapter title="アプリの生成" id="generate">
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        <code>express-generator</code> ツールを使用して、新しい Express アプリケーションを生成できます。
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
                        Ktor は、アプリケーションのスケルトンを生成するために以下の方法を提供しています。
                    </p>
                    <list>
                        <li>
                            <p>
                                <a href="https://start.ktor.io/">Ktor プロジェクトジェネレーター</a> — Web ベースのジェネレーターを使用します。
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="https://github.com/ktorio/ktor-cli">
                                    Ktor CLI ツール
                                </a> — コマンドラインインターフェースから <code>ktor new</code> コマンドを使用して Ktor プロジェクトを生成します。
                            </p>
                            <code-block lang="shell" code="                                ktor new ktor-sample"/>
                        </li>
                        <li>
                            <p>
                                <a href="https://www.npmjs.com/package/generator-ktor">
                                    Yeoman ジェネレーター
                                </a>
                                — プロジェクト設定を対話的に構成し、必要なプラグインを選択します。
                            </p>
                            <code-block lang="shell" code="                                yo ktor"/>
                        </li>
                        <li>
                            <p>
                                <a href="https://ktor.io/idea/">IntelliJ IDEA Ultimate</a> — 内蔵の Ktor プロジェクトウィザードを使用します。
                            </p>
                        </li>
                    </list>
                    <p>
                        詳細な手順については、<Links href="//server-create-a-new-project" summary="Ktor を使用してサーバーアプリケーションを開き、実行し、テストする方法を学びます。">新しい Ktor プロジェクトの作成、オープン、実行</Links>のチュートリアルを参照してください。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="Hello world" id="hello">
        <p>
            このセクションでは、<code>GET</code> リクエストを受け取り、定義済みのプレーンテキストで応答する、最もシンプルなサーバーアプリケーションを作成する方法を見ていきます。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        以下の例は、サーバーを起動し、ポート <control>3000</control> で接続を待機する Express アプリケーションを示しています。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.send('Hello World!')&#10;})&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/1_hello/app.js">1_hello</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor では、コード内でサーバーパラメータを構成し、アプリケーションを素早く実行するために <a href="#embedded-server">embeddedServer</a> 関数を使用できます。
                    </p>
                    <code-block lang="kotlin" code="import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;) {&#10;        routing {&#10;            get(&quot;/&quot;) {&#10;                call.respondText(&quot;Hello World!&quot;)&#10;            }&#10;        }&#10;    }.start(wait = true)&#10;}"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/1_hello/src/main/kotlin/com/example/Application.kt">1_hello</a> プロジェクトを参照してください。
                    </p>
                    <p>
                        また、HOCON または YAML 形式を使用する<a href="#engine-main">外部構成ファイル</a>でサーバー設定を指定することもできます。
                    </p>
                </td>
</tr>

        </table>
        <p>
            上記の Express アプリケーションは、<control>Date</control>、<control>X-Powered-By</control>、および <control>ETag</control> レスポンスヘッダーを追加することに注意してください。これらは次のように表示される場合があります。
        </p>
        <code-block code="            Date: Fri, 05 Aug 2022 06:30:48 GMT&#10;            X-Powered-By: Express&#10;            ETag: W/&quot;c-Lve95gjOVATpfV8EL5X4nxwjKHE&quot;"/>
        <p>
            Ktor で各レスポンスにデフォルトの <control>Server</control> および <control>Date</control> ヘッダーを追加するには、<Links href="//server-default-headers" summary="必要な依存関係: io.ktor:%artifact_name%">DefaultHeaders</Links> プラグインをインストールする必要があります。<control>Etag</control> レスポンスヘッダーを構成するには、<Links href="//server-conditional-headers" summary="必要な依存関係: io.ktor:%artifact_name%">ConditionalHeaders</Links> プラグインを使用できます。
        </p>
    </chapter>
    <chapter title="静的コンテンツの配信" id="static">
        <p>
            このセクションでは、Express と Ktor で画像、CSS ファイル、JavaScript ファイルなどの静的ファイルを配信する方法を見ていきます。
            メインの <Path>index.html</Path> ページとリンクされたアセット一式が含まれる <Path>public</Path> フォルダーがあると仮定します。
        </p>
        <code-block code="            public&#10;            ├── index.html&#10;            ├── ktor_logo.png&#10;            ├── css&#10;            │   └──styles.css&#10;            └── js&#10;                └── script.js"/>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express では、フォルダー名を <control>express.static</control> 関数に渡します。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;app.use(express.static('public'))&#10;&#10;app.listen(port, () =&gt; {&#10;    console.log(`Responding at http://0.0.0.0:${port}/`)&#10;})"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/2_static/app.js">2_static</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor では、<a href="#folders"><code>staticFiles()</code></a> 関数を使用して、<Path>/</Path> パスに対して行われたリクエストを <Path>public</Path> 物理フォルダーにマッピングします。
                        この関数により、<Path>public</Path> フォルダー内のすべてのファイルを再帰的に配信できます。
                    </p>
                    <code-block lang="kotlin" code="import io.ktor.server.application.*&#10;import io.ktor.server.http.content.*&#10;import io.ktor.server.routing.*&#10;import java.io.*&#10;&#10;fun main(args: Array&lt;String&gt;): Unit =&#10;    io.ktor.server.netty.EngineMain.main(args)&#10;&#10;fun Application.module() {&#10;    routing {&#10;        staticFiles(&quot;&quot;, File(&quot;public&quot;), &quot;index.html&quot;)&#10;    }&#10;}"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/2_static/src/main/kotlin/com/example/Application.kt">2_static</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
        <p>
            静的コンテンツを配信する際、Express は次のような複数のレスポンスヘッダーを追加します。
        </p>
        <code-block code="            Accept-Ranges: bytes&#10;            Cache-Control: public, max-age=0&#10;            ETag: W/&quot;181-1823feafeb1&quot;&#10;            Last-Modified: Wed, 27 Jul 2022 13:49:01 GMT"/>
        <p>
            Ktor でこれらのヘッダーを管理するには、次のプラグインをインストールする必要があります。
        </p>
        <list>
            <li>
                <p>
                    <control>Accept-Ranges</control>: <Links href="//server-partial-content" summary="必要な依存関係: io.ktor:%artifact_name% サーバー例: download-file, クライアント例: client-download-file-range">PartialContent</Links>
                </p>
            </li>
            <li>
                <p>
                    <control>Cache-Control</control>: <Links href="//server-caching-headers" summary="必要な依存関係: io.ktor:%artifact_name%">CachingHeaders</Links>
                </p>
            </li>
            <li>
                <p>
                    <control>ETag</control> および <control>Last-Modified</control>: <Links href="//server-conditional-headers" summary="必要な依存関係: io.ktor:%artifact_name%">ConditionalHeaders</Links>
                </p>
            </li>
        </list>
    </chapter>
    <chapter title="ルーティング" id="routing">
        <p>
            <Links href="//server-routing" summary="ルーティングは、サーバーアプリケーションでの着信リクエストを処理するためのコアプラグインです。">ルーティング</Links>により、特定の HTTP リクエストメソッド (<code>GET</code>、<code>POST</code> など) とパスで定義された特定のエンドポイントに対して行われた着信リクエストを処理できます。
            以下の例は、<Path>/</Path> パスに対して行われた <code>GET</code> および <code>POST</code> リクエストを処理する方法を示しています。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <code-block lang="javascript" code="app.get('/', (req, res) =&gt; {&#10;    res.send('GET request to the homepage')&#10;})&#10;&#10;app.post('/', (req, res) =&gt; {&#10;    res.send('POST request to the homepage')&#10;})"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a> プロジェクトを参照してください。
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
                            <code>POST</code>、<code>PUT</code>、または <code>PATCH</code> リクエストのリクエストボディを受信する方法については、<a href="#receive-request">リクエストの受信</a>を参照してください。
                        </p>
                    </tip>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
        <p>
            次の例は、ルートハンドラーをパスごとにグループ化する方法を示しています。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express では、<code>app.route()</code> を使用して、ルートパスに対してチェーン可能なルートハンドラーを作成できます。
                    </p>
                    <code-block lang="javascript" code="app.route('/book')&#10;    .get((req, res) =&gt; {&#10;        res.send('Get a random book')&#10;    })&#10;    .post((req, res) =&gt; {&#10;        res.send('Add a book')&#10;    })&#10;    .put((req, res) =&gt; {&#10;        res.send('Update the book')&#10;    })"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor は <code>route</code> 関数を提供しており、これによってパスを定義し、そのパスの HTTP メソッドをネストされた関数として配置します。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        route(&quot;book&quot;) {&#10;            get {&#10;                call.respondText(&quot;Get a random book&quot;)&#10;            }&#10;            post {&#10;                call.respondText(&quot;Add a book&quot;)&#10;            }&#10;            put {&#10;                call.respondText(&quot;Update the book&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
        <p>
            どちらのフレームワークでも、関連するルートを単一のファイルにグループ化できます。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express は、マウント可能なルートハンドラーを作成するための <code>express.Router</code> クラスを提供しています。
                        アプリケーションのディレクトリに <Path>birds.js</Path> ルーターファイルがあると仮定します。
                        このルーターモジュールは、<Path>app.js</Path> に示すようにアプリケーションにロードできます。
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
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/3_router/app.js">3_router</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor では、<code>Routing</code> 型の拡張関数を使用して実際のルートを定義するのが一般的なパターンです。
                        以下のサンプル (<Path>Birds.kt</Path>) は <code>birdsRoutes</code> 拡張関数を定義しています。
                        アプリケーション (<Path>Application.kt</Path>) の <code>routing</code> ブロック内でこの関数を呼び出すことで、対応するルートを含めることができます。
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
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/3_router/src/main/kotlin/com/example/Application.kt">3_router</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
        <p>
            URL パスを文字列として指定する以外に、Ktor には<Links href="//server-resources" summary="Resources プラグインを使用すると、型安全なルーティングを実装できます。">型安全なルート</Links>を実装する機能が含まれています。
        </p>
    </chapter>
    <chapter title="ルートパラメータとクエリパラメータ" id="route-query-param">
        <p>
            このセクションでは、ルートパラメータとクエリパラメータへのアクセス方法について説明します。
        </p>
        <p>
            ルート（またはパス）パラメータは、URL 内のその位置に指定された値をキャプチャするために使用される名前付きの URL セグメントです。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express でルートパラメータにアクセスするには、<code>Request.params</code> を使用できます。
                        たとえば、以下のコードスニペットの <code>req.params["login"]</code> は、<Path>/user/admin</Path> パスに対して <emphasis>admin</emphasis> を返します。
                    </p>
                    <code-block lang="javascript" code="app.get('/user/:login', (req, res) =&gt; {&#10;    if (req.params['login'] === 'admin') {&#10;        res.send('You are logged in as Admin')&#10;    } else {&#10;        res.send('You are logged in as Guest')&#10;    }&#10;})"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor では、ルートパラメータは <code>{param}</code> 構文を使用して定義されます。
                        ルートハンドラーでルートパラメータにアクセスするには、<code>call.parameters</code> を使用できます。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/user/{login}&quot;) {&#10;            if (call.parameters[&quot;login&quot;] == &quot;admin&quot;) {&#10;                call.respondText(&quot;You are logged in as Admin&quot;)&#10;            } else {&#10;                call.respondText(&quot;You are logged in as Guest&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a> プロジェクトを参照してください。
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
                        Express でクエリパラメータにアクセスするには、<code>Request.query</code> を使用できます。
                        たとえば、以下のコードスニペットの <code>req.query['price']</code> は、<Path>/products?price=asc</Path> パスに対して <emphasis>asc</emphasis> を返します。
                    </p>
                    <code-block lang="javascript" code="app.get('/products', (req, res) =&gt; {&#10;    if (req.query['price'] === 'asc') {&#10;        res.send('Products from the lowest price to the highest')&#10;    }&#10;})"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/4_parameters/app.js">4_parameters</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor では、<code>call.request.queryParameters</code> を使用してクエリパラメータにアクセスできます。
                    </p>
                    <code-block lang="kotlin" code="    routing {&#10;        get(&quot;/products&quot;) {&#10;            if (call.request.queryParameters[&quot;price&quot;] == &quot;asc&quot;) {&#10;                call.respondText(&quot;Products from the lowest price to the highest&quot;)&#10;            }&#10;        }&#10;    }"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/4_parameters/src/main/kotlin/com/example/Application.kt">4_parameters</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="レスポンスの送信" id="send-response">
        <p>
            前のセクションでは、プレーンテキストの内容で応答する方法をすでに見てきました。
            JSON、ファイル、およびリダイレクトのレスポンスを送信する方法を見ていきましょう。
        </p>
        <chapter title="JSON" id="send-json">
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Express で適切なコンテンツタイプで JSON レスポンスを送信するには、<code>res.json</code> 関数を呼び出します。
                        </p>
                        <code-block lang="javascript" code="const car = {type:&quot;Fiat&quot;, model:&quot;500&quot;, color:&quot;white&quot;};&#10;app.get('/json', (req, res) =&gt; {&#10;    res.json(car)&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、<Links href="//server-serialization" summary="ContentNegotiation プラグインは、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定の形式でのコンテンツのシリアル化/非シリアル化の 2 つの主要な目的を果たします。">ContentNegotiation</Links> プラグインをインストールし、JSON シリアライザーを構成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json()&#10;    }"/>
                        <p>
                            データを JSON にシリアル化するには、<code>@Serializable</code> アノテーションを付けたデータクラスを作成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                        <p>
                            その後、<code>call.respond</code> を使用して、レスポンスでこのクラスのオブジェクトを送信できます。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/json&quot;) {&#10;            call.respond(Car(&quot;Fiat&quot;, &quot;500&quot;, &quot;white&quot;))&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> プロジェクトを参照してください。
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
                            Express でファイルを使用して応答するには、<code>res.sendFile</code> を使用します。
                        </p>
                        <code-block lang="javascript" code="const path = require(&quot;path&quot;)&#10;&#10;app.get('/file', (req, res) =&gt; {&#10;    res.sendFile(path.join(__dirname, 'ktor_logo.png'))&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor は、クライアントにファイルを送信するための <code>call.respondFile</code> 関数を提供しています。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/file&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.respondFile(file)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
            <p>
                Express アプリケーションは、ファイルで応答する際に <control>Accept-Ranges</control> HTTP レスポンスヘッダーを追加します。
                サーバーはこのヘッダーを使用して、クライアントからのファイルダウンロードの部分リクエスト（Partial requests）のサポートを通知します。
                Ktor で部分リクエストをサポートするには、<Links href="//server-partial-content" summary="必要な依存関係: io.ktor:%artifact_name% サーバー例: download-file, クライアント例: client-download-file-range">PartialContent</Links> プラグインをインストールする必要があります。
            </p>
        </chapter>
        <chapter title="ファイルの添付" id="send-file-attachment">
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            <code>res.download</code> 関数は、指定されたファイルを添付ファイルとして転送します。
                        </p>
                        <code-block lang="javascript" code="app.get('/file-attachment', (req, res) =&gt; {&#10;    res.download(&quot;ktor_logo.png&quot;)&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、ファイルを添付ファイルとして転送するために <control>Content-Disposition</control> ヘッダーを手動で構成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/file-attachment&quot;) {&#10;            val file = File(&quot;public/ktor_logo.png&quot;)&#10;            call.response.header(&#10;                HttpHeaders.ContentDisposition,&#10;                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, &quot;ktor_logo.png&quot;)&#10;                    .toString()&#10;            )&#10;            call.respondFile(file)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> プロジェクトを参照してください。
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
                            Express でリダイレクトレスポンスを生成するには、<code>redirect</code> 関数を呼び出します。
                        </p>
                        <code-block lang="javascript" code="app.get('/old', (req, res) =&gt; {&#10;    res.redirect(301, &quot;moved&quot;)&#10;})&#10;&#10;app.get('/moved', (req, res) =&gt; {&#10;    res.send('Moved resource')&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/5_send_response/app.js">5_send_response</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、リダイレクトレスポンスを送信するために <code>respondRedirect</code> を使用します。
                        </p>
                        <code-block lang="kotlin" code="        get(&quot;/old&quot;) {&#10;            call.respondRedirect(&quot;/moved&quot;, permanent = true)&#10;        }&#10;        get(&quot;/moved&quot;) {&#10;            call.respondText(&quot;Moved resource&quot;)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/5_send_response/src/main/kotlin/com/example/Application.kt">5_send_response</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
        </chapter>
    </chapter>
    <chapter title="テンプレート" id="templates">
        <p>
            Express と Ktor はどちらも、ビューを処理するためのテンプレートエンジンの使用をサポートしています。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        <Path>views</Path> フォルダーに次の Pug テンプレートがあると仮定します。
                    </p>
                    <code-block code="html&#10;  head&#10;    title= title&#10;  body&#10;    h1= message"/>
                    <p>
                        このテンプレートで応答するには、<code>res.render</code> を呼び出します。
                    </p>
                    <code-block lang="javascript" code="app.set('views', './views')&#10;app.set('view engine', 'pug')&#10;&#10;app.get('/', (req, res) =&gt; {&#10;    res.render('index', { title: 'Hey', message: 'Hello there!' })&#10;})"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/6_templates/app.js">6_templates</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor は、FreeMarker、Velocity など、いくつかの <Links href="//server-templating" summary="HTML/CSS または JVM テンプレートエンジンを使用して構築されたビューを操作する方法を学びます。">JVM テンプレートエンジン</Links>をサポートしています。
                        たとえば、アプリケーションリソースに配置された FreeMarker テンプレートで応答する必要がある場合は、<code>FreeMarker</code> プラグインをインストールして構成し、<code>call.respond</code> を使用してテンプレートを送信します。
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    install(FreeMarker) {&#10;        templateLoader = ClassTemplateLoader(this::class.java.classLoader, &quot;views&quot;)&#10;    }&#10;    routing {&#10;        get(&quot;/&quot;) {&#10;            val article = Article(&quot;Hey&quot;, &quot;Hello there!&quot;)&#10;            call.respond(FreeMarkerContent(&quot;index.ftl&quot;, mapOf(&quot;article&quot; to article)))&#10;        }&#10;    }&#10;}&#10;&#10;data class Article(val title: String, val message: String)"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/6_templates/src/main/kotlin/com/example/Application.kt">6_templates</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="リクエストの受信" id="receive-request">
        <p>
            このセクションでは、さまざまな形式のリクエストボディを受信する方法について説明します。
        </p>
        <chapter title="生テキスト" id="receive-raw-text">
            <p>
                以下の <code>POST</code> リクエストは、テキストデータをサーバーに送信します。
            </p>
            <code-block lang="http" code="POST http://0.0.0.0:3000/text&#10;Content-Type: text/plain&#10;&#10;Hello, world!"/>
            <p>
                サーバー側でこのリクエストのボディをプレーンテキストとして受信する方法を見てみましょう。
            </p>
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Express で着信リクエストボディを解析するには、<code>body-parser</code> を追加する必要があります。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')"/>
                        <p>
                            <code>post</code> ハンドラーでは、テキストパーサー (<code>bodyParser.text</code>) を渡す必要があります。
                            リクエストボディは <code>req.body</code> プロパティから利用できます。
                        </p>
                        <code-block lang="javascript" code="app.post('/text', bodyParser.text(), (req, res) =&gt; {&#10;    let text = req.body&#10;    res.send(text)&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、<code>call.receiveText</code> を使用してボディをテキストとして受信できます。
                        </p>
                        <code-block lang="kotlin" code="        post(&quot;/text&quot;) {&#10;            val text = call.receiveText()&#10;            call.respondText(text)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
        </chapter>
        <chapter title="JSON" id="receive-json">
            <p>
                このセクションでは、JSON ボディを受信する方法を見ていきます。
                以下のサンプルは、ボディに JSON オブジェクトを含む <code>POST</code> リクエストを示しています。
            </p>
            <code-block lang="http" code="POST http://0.0.0.0:3000/json&#10;Content-Type: application/json&#10;&#10;{&#10;  &quot;type&quot;: &quot;Fiat&quot;,&#10;  &quot;model&quot; : &quot;500&quot;,&#10;  &quot;color&quot;: &quot;white&quot;&#10;}"/>
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Express で JSON を受信するには、<code>bodyParser.json</code> を使用します。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/json', bodyParser.json(), (req, res) =&gt; {&#10;    let car = req.body&#10;    res.send(car)&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、<Links href="//server-serialization" summary="ContentNegotiation プラグインは、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定の形式でのコンテンツのシリアル化/非シリアル化の 2 つの主要な目的を果たします。">ContentNegotiation</Links> プラグインをインストールし、<code>Json</code> シリアライザーを構成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="    install(ContentNegotiation) {&#10;        json(Json {&#10;            prettyPrint = true&#10;            isLenient = true&#10;        })&#10;    }"/>
                        <p>
                            受信したデータをオブジェクトにデシリアライズするには、データクラスを作成する必要があります。
                        </p>
                        <code-block lang="kotlin" code="@Serializable&#10;data class Car(val type: String, val model: String, val color: String)"/>
                        <p>
                            次に、このデータクラスをパラメータとして受け取る <code>receive</code> メソッドを使用します。
                        </p>
                        <code-block lang="kotlin" code="        post(&quot;/json&quot;) {&#10;            val car = call.receive&lt;Car&gt;()&#10;            call.respond(car)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
        </chapter>
        <chapter title="URL エンコード" id="receive-url-encoded">
            <p>
                次に、<control>application/x-www-form-urlencoded</control> タイプを使用して送信されたフォームデータを受信する方法を見てみましょう。
                以下のコードスニペットは、フォームデータを含む <code>POST</code> リクエストのサンプルを示しています。
            </p>
            <code-block lang="http" code="POST http://localhost:3000/urlencoded&#10;Content-Type: application/x-www-form-urlencoded&#10;&#10;username=JetBrains&amp;email=example@jetbrains.com&amp;password=foobar&amp;confirmation=foobar"/>
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            プレーンテキストや JSON と同様に、Express では <code>body-parser</code> が必要です。
                            パーサーのタイプを <code>bodyParser.urlencoded</code> に設定する必要があります。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;&#10;app.post('/urlencoded', bodyParser.urlencoded({extended: true}), (req, res) =&gt; {&#10;    let user = req.body&#10;    res.send(`The ${user[&quot;username&quot;]} account is created`)&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、<code>call.receiveParameters</code> 関数を使用します。
                        </p>
                        <code-block lang="kotlin" code="        post(&quot;/urlencoded&quot;) {&#10;            val formParameters = call.receiveParameters()&#10;            val username = formParameters[&quot;username&quot;].toString()&#10;            call.respondText(&quot;The '$username' account is created&quot;)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
        </chapter>
        <chapter title="生データ" id="receive-raw-data">
            <p>
                次のユースケースは、バイナリデータの処理です。
                以下のリクエストは、<control>application/octet-stream</control> を使用して PNG 画像をサーバーに送信します。
            </p>
            <code-block lang="http" code="POST http://localhost:3000/raw&#10;Content-Type: application/octet-stream&#10;&#10;&lt; ./ktor_logo.png"/>
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Express でバイナリデータを処理するには、パーサーのタイプを <code>raw</code> に設定します。
                        </p>
                        <code-block lang="javascript" code="const bodyParser = require('body-parser')&#10;const fs = require('fs')&#10;&#10;app.post('/raw', bodyParser.raw({type: () =&gt; true}), (req, res) =&gt; {&#10;    let rawBody = req.body&#10;    fs.createWriteStream('./uploads/ktor_logo.png').write(rawBody)&#10;    res.send('A file is uploaded')&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor は、バイトシーケンスを非同期で読み書きするための <code>ByteReadChannel</code> および <code>ByteWriteChannel</code> を提供しています。
                        </p>
                        <code-block lang="kotlin" code="        post(&quot;/raw&quot;) {&#10;            val file = File(&quot;uploads/ktor_logo.png&quot;)&#10;            call.receiveChannel().copyAndClose(file.writeChannel())&#10;            call.respondText(&quot;A file is uploaded&quot;)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
        </chapter>
        <chapter title="マルチパート" id="receive-multipart">
            <p>
                最後のセクションでは、<emphasis>マルチパート</emphasis>ボディの処理方法を見ていきましょう。
                以下の <code>POST</code> リクエストは、<control>multipart/form-data</control> タイプを使用して、説明付きの PNG 画像を送信します。
            </p>
            <code-block lang="http" code="POST http://localhost:3000/multipart&#10;Content-Type: multipart/form-data; boundary=WebAppBoundary&#10;&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;description&quot;&#10;Content-Type: text/plain&#10;&#10;Ktor logo&#10;--WebAppBoundary&#10;Content-Disposition: form-data; name=&quot;image&quot;; filename=&quot;ktor_logo.png&quot;&#10;Content-Type: image/png&#10;&#10;&lt; ./ktor_logo.png&#10;--WebAppBoundary--"/>
            <table style="header-column">
                
<tr>
<td>
                        <control>Express</control>
                    </td>
                    <td>
                        <p>
                            Express ではマルチパートデータを解析するために別のモジュールが必要です。
                            以下の例では、<control>multer</control> を使用してサーバーにファイルをアップロードしています。
                        </p>
                        <code-block lang="javascript" code="const multer = require('multer')&#10;&#10;const storage = multer.diskStorage({&#10;    destination: './uploads/',&#10;    filename: function (req, file, cb) {&#10;        cb(null, file.originalname);&#10;    }&#10;})&#10;const upload = multer({storage: storage});&#10;app.post('/multipart', upload.single('image'), function (req, res, next) {&#10;    let fileDescription = req.body[&quot;description&quot;]&#10;    let fileName = req.file.filename&#10;    res.send(`${fileDescription} is uploaded to uploads/${fileName}`)&#10;})"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/7_receive_request/app.js">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

                
<tr>
<td>
                        <control>Ktor</control>
                    </td>
                    <td>
                        <p>
                            Ktor では、マルチパートリクエストの一部として送信されたファイルを受信する必要がある場合、<code>receiveMultipart</code> 関数を呼び出し、必要に応じて各パートをループします。
                            以下の例では、<code>PartData.FileItem</code> を使用してファイルをバイトストリームとして受信しています。
                        </p>
                        <code-block lang="kotlin" code="        post(&quot;/multipart&quot;) {&#10;            var fileDescription = &quot;&quot;&#10;            var fileName = &quot;&quot;&#10;            val multipartData = call.receiveMultipart()&#10;            multipartData.forEachPart { part -&gt;&#10;                when (part) {&#10;                    is PartData.FormItem -&gt; {&#10;                        fileDescription = part.value&#10;                    }&#10;&#10;                    is PartData.FileItem -&gt; {&#10;                        fileName = part.originalFileName as String&#10;                        val channel = part.provider()&#10;                        SystemFileSystem.sink(Path(&quot;uploads/$fileName&quot;)).use { sink -&gt;&#10;                            while (!channel.exhausted()) {&#10;                                channel.readBuffer().transferTo(sink)&#10;                                sink.flush()&#10;                            }&#10;                        }&#10;                    }&#10;&#10;                    else -&gt; {}&#10;                }&#10;                part.dispose()&#10;            }&#10;            call.respondText(&quot;$fileDescription is uploaded to 'uploads/$fileName'&quot;)&#10;        }"/>
                        <p>
                            完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/7_receive_request/src/main/kotlin/com/example/Application.kt">7_receive_request</a> プロジェクトを参照してください。
                        </p>
                    </td>
</tr>

            </table>
        </chapter>
    </chapter>
    <chapter title="ミドルウェアの作成" id="middleware">
        <p>
            最後に、サーバー機能を拡張するためのミドルウェアの作成方法について説明します。
            以下の例は、Express と Ktor を使用してリクエストログを実装する方法を示しています。
        </p>
        <table style="header-column">
            
<tr>
<td>
                    <control>Express</control>
                </td>
                <td>
                    <p>
                        Express では、ミドルウェアは <code>app.use</code> を使用してアプリケーションにバインドされた関数です。
                    </p>
                    <code-block lang="javascript" code="const express = require('express')&#10;const app = express()&#10;const port = 3000&#10;&#10;const requestLogging = function (req, res, next) {&#10;    let scheme = req.protocol&#10;    let host = req.headers.host&#10;    let url = req.url&#10;    console.log(`Request URL: ${scheme}://${host}${url}`)&#10;    next()&#10;}&#10;&#10;app.use(requestLogging)"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express/8_middleware/app.js">8_middleware</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

            
<tr>
<td>
                    <control>Ktor</control>
                </td>
                <td>
                    <p>
                        Ktor では、<Links href="//server-custom-plugins" summary="独自のカスタムプラグインを作成する方法を学びます。">カスタムプラグイン</Links>を使用して機能を拡張できます。
                        以下のコード例は、リクエストログを実装するために <code>onCall</code> を処理する方法を示しています。
                    </p>
                    <code-block lang="kotlin" code="val RequestLoggingPlugin = createApplicationPlugin(name = &quot;RequestLoggingPlugin&quot;) {&#10;    onCall { call -&gt;&#10;        call.request.origin.apply {&#10;            println(&quot;Request URL: $scheme://$localHost:$localPort$uri&quot;)&#10;        }&#10;    }&#10;}"/>
                    <p>
                        完全な例については、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/migrating-express-ktor/8_middleware/src/main/kotlin/com/example/Application.kt">8_middleware</a> プロジェクトを参照してください。
                    </p>
                </td>
</tr>

        </table>
    </chapter>
    <chapter title="次のステップ" id="next">
        <p>
            このガイドではまだカバーされていないユースケースが、セッション管理、認可、データベース統合など多数あります。
            これらの機能のほとんどについて、Ktor はアプリケーションにインストールして必要に応じて構成できる専用のプラグインを提供しています。
            Ktor での開発を続けるには、一連のステップバイステップのガイドとすぐに使えるサンプルを提供している<control><a href="https://ktor.io/learn/">学習ページ</a></control>にアクセスしてください。
        </p>
    </chapter>
</topic>