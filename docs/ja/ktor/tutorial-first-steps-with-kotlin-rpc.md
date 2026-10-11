<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin RPC 入門" id="tutorial-first-steps-with-kotlin-rpc">
<show-structure for="chapter" depth="2"/>
<web-summary>
    この包括的なガイドで RPC の基本を学び、RPC と REST の詳細な比較を確認しましょう。Kotlin RPC を使用して最初のアプリケーションを作成する方法を学びます。
</web-summary>
<link-summary>
    Kotlin RPC と Ktor を使用して最初のアプリケーションを作成する方法を学びます。
</link-summary>
<card-summary>
    Kotlin RPC と Ktor を使用して最初のアプリケーションを作成する方法を学びます。
</card-summary>
<tldr>
    <var name="example_name" value="tutorial-kotlin-rpc-app"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用プラグイン</b>: <Links href="/ktor/server-routing" summary="Routing は、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">Routing</Links>,
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
        <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a>
    </p>
</tldr>
<p>
    Kotlin RPC（Remote Procedure Call：遠隔手続き呼び出し）は、Kotlin エコシステムへの刺激的な新しい追加機能であり、実績のある基盤の上に構築され、<code>kotlinx.rpc</code> ライブラリ上で動作します。
</p>
<p>
    <code>kotlinx.rpc</code> ライブラリを使用すると、通常の Kotlin 言語構造のみを使用して、ネットワークの境界を越えたプロシージャ呼び出しを行うことができます。そのため、REST と Google RPC（gRPC）の双方に代わる選択肢を提供します。
</p>
<p>
    この記事では、Kotlin RPC の基本概念を紹介し、簡単なアプリケーションを作成します。その後、自身のプロジェクトでこのライブラリを評価できます。
</p>
<chapter title="前提知識" id="prerequisites">
    <p>
        このチュートリアルでは、Kotlin プログラミングの基本的な理解があることを前提としています。Kotlin が初めての方は、<a href="https://kotlinlang.org/docs/getting-started.html">入門資料</a>をいくつか確認することをお勧めします。
    </p>
    <p>最適な開発体験を得るために、統合開発環境（IDE）として <a
            href="https://www.jetbrains.com/idea/download">IntelliJ
        IDEA Ultimate</a> を使用することをお勧めします。生産性を向上させる包括的なサポートとツールが提供されています。
    </p>
</chapter>
<chapter title="RPC とは？" id="what-is-rpc">
    <chapter title="ローカル vs. リモートプロシージャ呼び出し" id="local-vs-remote">
        <p>
            プログラミングの経験がある人なら誰でも、プロシージャ呼び出しの概念には馴染みがあるでしょう。これはどのプログラミング言語でも基本的な概念です。厳密には、常に同一プログラム内で行われるため、これらはローカルプロシージャ呼び出しです。
        </p>
        <p>
            リモートプロシージャ呼び出し（RPC）とは、関数呼び出しとパラメータが何らかの形でネットワークを介して転送され、別の VM や実行可能ファイル内で実装が実行されるものです。戻り値は逆の経路をたどって、呼び出しが行われたマシンへと戻ります。
        </p>
        <p>
            呼び出しが行われたマシンをクライアント、実装が存在するマシンをサーバーと考えるのが最もわかりやすいでしょう。ただし、必ずしもそうである必要はありません。ピアアーキテクチャの一部として、双方向に RPC 呼び出しが行われることもあります。しかし、話をシンプルにするために、クライアント/サーバー構成を想定しましょう。
        </p>
    </chapter>
    <chapter title="RPC フレームワークの基礎" id="rpc-framework-fundamentals">
        <p>
            どの RPC フレームワークにも提供しなければならない基本機能がいくつかあります。それらは、従来の IT インフラストラクチャ内でリモートプロシージャ呼び出しを実装する際には不可欠です。用語は異なる場合があり、責務の分割方法もさまざまですが、すべての RPC フレームワークは以下を提供する必要があります。
        </p>
        <list type="decimal">
            <li>
                リモートで呼び出されるプロシージャを宣言する方法。オブジェクト指向プログラミングでは、インターフェースが論理的な選択肢となります。これは現在の言語が提供するインターフェース構造であってもよいですし、<a
                    href="https://webidl.spec.whatwg.org/">W3C で使用されている Web IDL</a> などの言語中立な標準であってもかまいません。
            </li>
            <li>
                パラメータと戻り値に使用される型を指定する手段。これも言語中立な標準を使用できますが、現在の言語における標準的なデータ型宣言にアノテーションを付加する方がシンプルな場合もあります。
            </li>
            <li>
                <format style="italic">クライアントスタブ（client stub）</format>
                と呼ばれるヘルパークラス。プロシージャの呼び出しをネットワーク経由で送信できる形式に変換し、結果の戻り値をアンパック（展開）するために使用されます。これらのスタブは、コンパイル処理中に作成することも、実行時に動的に作成することもできます。
            </li>
            <li>
                ヘルパークラスを管理し、リモートプロシージャ呼び出しのライフサイクルを監視する基盤となる
                <format style="italic">RPC ランタイム（RPC Runtime）</format>
                。サーバー側では、継続的にリクエストを処理できるよう、このランタイムを何らかのサーバーに組み込む必要があります。
            </li>
            <li>
                呼び出されるプロシージャの表現、送信されるデータのシリアライズ、およびネットワーク経由での情報変換を行うためのプロトコルの選定（または定義）。過去には、完全に新しいプロトコルをゼロから定義した技術（CORBA の IIOP）もあれば、再利用に重点を置いた技術（SOAP の HTTP POST）もありました。
            </li>
        </list>
    </chapter>
    <chapter title="マーシャリング vs. シリアライゼーション" id="marshaling-vs-serialization">
        <p>
            RPC フレームワークでは、
            <format style="italic">マーシャリング（marshaling）</format>
            および
            <format style="italic">アンマーシャリング（unmarshaling）</format>
            という用語が使われます。これは、ネットワーク経由で送信する情報をパックおよびアンパックするプロセスのことです。シリアライゼーションのスーパーセット（上位概念）と考えることができます。マーシャリングでは、オブジェクトをシリアライズするだけでなく、呼び出されているプロシージャや、その呼び出しが行われたコンテキストに関する情報もパッケージ化する必要があります。
        </p>
    </chapter>
    <p>
        RPC の基本概念を紹介したところで、サンプルアプリケーションを作成して <code>kotlinx.rpc</code> でそれらがどのように適用されるかを見てみましょう。
    </p>
</chapter>
<chapter title="Hello, kotlinx.rpc" id="hello-kotlinx-rpc">
    <p>
        ネットワーク越しにピザを注文するためのアプリケーションを作成してみましょう。コードをできるだけシンプルに保つため、コンソールベースのクライアントを使用します。
    </p>
    <chapter title="プロジェクトの作成" id="create-project">
        <p>まず、クライアントとサーバーの両方の実装を含むプロジェクトを作成します。</p>
        <p>
            より複雑なアプリケーションでは、クライアントとサーバーで別々のモジュールを使用するのがベストプラクティスです。ただし、このチュートリアルでは簡単にするため、両方に単一のモジュールを使用します。
        </p>
        <procedure id="create-project-procedure">
            <step>
                <a href="https://www.jetbrains.com/idea/download/">IntelliJ IDEA</a> を起動します。
            </step>
            <step>
                <p>
                    ウェルカム画面で <control>New Project</control> をクリックします。
                </p>
                <p>
                    または、メインメニューから <ui-path>File | New | Project</ui-path> を選択します。
                </p>
            </step>
            <step>
                <control>Name</control>
                フィールドに、プロジェクト名として
                <Path>KotlinRpcPizzaApp</Path>
                と入力します。
                <img src="tutorial_kotlin_rpc_intellij_project.png" alt="IntelliJ New Kotlin Project window"
                     style="block" width="706" border-effect="rounded"/>
            </step>
            <step>
                残りの設定はデフォルトのままにし、
                <control>Create</control>
                をクリックします。
            </step>
        </procedure>
        <p>
            通常はすぐにプロジェクトのビルドファイルを設定しますが、それは技術の理解を深める上での実装の詳細に過ぎないため、そのステップは最後に行います。
        </p>
    </chapter>
    <chapter title="共有型の追加" id="shared-types">
        <p>
            あらゆる RPC プロジェクトの中心となるのは、リモートで呼び出されるプロシージャを定義するインターフェースと、それらのプロシージャの定義で使用される型です。
        </p>
        <p>
            マルチモジュールプロジェクトでは、これらの型を共有する必要があります。ただし、今回の例ではその手順は必要ありません。
        </p>
        <procedure id="shared-types-procedure">
            <step>
                <Path>src/main/kotlin</Path>
                フォルダーに移動し、
                <Path>model</Path>
                という名前の新しいサブパッケージを作成します。
            </step>
            <step>
                <Path>model</Path>
                パッケージ内に、以下の実装を含む新しい
                <Path>PizzaShop.kt</Path>
                ファイルを作成します。
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(pizza: Pizza): Receipt&#10;}&#10;&#10;@Serializable&#10;class Pizza(val name: String)&#10;&#10;@Serializable&#10;class Receipt(val amount: Double)"/>
                <p>
                    このインターフェースには、<code>kotlinx.rpc</code> ライブラリの <code>@Rpc</code> アノテーションを付加する必要があります。
                </p>
                <p>
                    ネットワーク経由で情報を転送するために <a href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a> を使用しているため、パラメータで使用される型には <code>Serializable</code> アノテーションを付ける必要があります。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="クライアントの実装" id="client-implementation">
        <procedure id="client-impl-procedure">
            <step>
                <Path>src/main/kotlin</Path>
                に移動し、新しい
                <Path>Client.kt</Path>
                ファイルを作成します。
            </step>
            <step>
                <Path>Client.kt</Path>
                を開き、以下の実装を追加します。
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    ktorClient.close()&#10;}"/>
            </step>
        </procedure>
        <p>
            RPC 呼び出しの準備と実行に必要なのは、わずか 25 行です。当然ながら内部では多くの処理が行われているため、コードを各セクションに分解して見ていきましょう。
        </p>
        <p>
            <code>kotlinx.rpc</code> ライブラリは、クライアント側でランタイムをホストするために <Links href="/ktor/client-create-new-application" summary="リクエストを送信してレスポンスを受信するための最初のクライアントアプリケーションを作成します。">Ktor クライアント</Links> を使用します。このランタイムは Ktor に密結合しているわけではなく、他の選択肢も可能ですが、これにより再利用性が高まり、既存の KMP アプリケーションへの <code>kotlinx.rpc</code> の統合が容易になります。
        </p>
        <p>
            Ktor クライアントと Kotlin RPC はどちらもコルーチンを中心に構築されているため、<code>runBlocking</code> を使用して初期コルーチンを作成し、その中でクライアントの残りの処理を実行します。
        </p>
        <code-block lang="kotlin" code="fun main() = runBlocking {&#10;}"/>
        <tip>
            <code>runBlocking</code> はプロダクションコードではなく、スパイク（試作調査）やテスト向けに設計されていることに注意してください。
        </tip>
        <p>
            次に、標準的な方法で Ktor クライアントのインスタンスを作成します。<code>kotlinx.rpc</code> は内部で情報を転送するために <Links href="/ktor/client-websockets" summary="WebSockets プラグインを使用すると、サーバーとクライアント間で双方向の通信セッションを作成できます。">WebSockets</Links> プラグインを使用します。<code>installKrpc()</code> 関数を使用して、確実にロードされるようにするだけで済みます。
        </p>
        <code-block lang="kotlin" code="    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }"/>
        <p>
            この Ktor クライアントを作成したら、次にリモートプロシージャを呼び出すための <code>KtorRpcClient</code> オブジェクトを作成します。サーバーの場所と、情報の転送に使用するメカニズムを設定する必要があります。
        </p>
        <code-block lang="kotlin" code="    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }"/>
        <p>
            この時点で標準的なセットアップは完了し、問題領域（ドメイン）固有の機能を使用する準備が整いました。クライアントを使用して、<code>PizzaShop</code> インターフェースのメソッドを実装するクライアントプロキシオブジェクトを作成できます。
        </p>
        <code-block lang="kotlin"
                    include-symbol="pizzaShop" code="package com.example&#10;&#10;import com.example.model.Pizza&#10;import com.example.model.PizzaShop&#10;import io.ktor.client.*&#10;import io.ktor.http.*&#10;import kotlinx.coroutines.runBlocking&#10;import kotlinx.rpc.withService&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;import kotlinx.rpc.krpc.ktor.client.KtorRpcClient&#10;import kotlinx.rpc.krpc.ktor.client.installKrpc&#10;import kotlinx.rpc.krpc.ktor.client.rpc&#10;import kotlinx.rpc.krpc.ktor.client.rpcConfig&#10;import kotlinx.rpc.krpc.serialization.json.json&#10;&#10;fun main() = runBlocking {&#10;    val ktorClient = HttpClient {&#10;        installKrpc {&#10;            serialization { json() }&#10;        }&#10;    }&#10;&#10;    val client: KtorRpcClient = ktorClient.rpc {&#10;        url {&#10;            host = &quot;localhost&quot;&#10;            port = 8080&#10;            encodedPath = &quot;pizza&quot;&#10;        }&#10;&#10;        rpcConfig {&#10;            serialization {&#10;                json()&#10;            }&#10;        }&#10;    }&#10;&#10;    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    /*&#10;    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)&#10;    */&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))&#10;&#10;    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    ktorClient.close()&#10;}"/>
        <p>
            その後、リモートプロシージャ呼び出しを行って結果を使用できます。
        </p>
        <code-block lang="kotlin" code="    val receipt = pizzaShop.orderPizza(Pizza(&quot;Pepperoni&quot;))&#10;    println(&quot;Your pizza cost ${receipt.amount}&quot;)"/>
        <p>
            この時点で、非常に多くの処理が自動的に行われている点に注目してください。呼び出しの詳細やすべてのパラメータをメッセージに変換してネットワーク経由で送信し、戻り値を受信してデコードする必要があります。これが透過的に行われることこそが、最初のセットアップの恩恵です。
        </p>
        <p>
            最後に、通常どおりクライアントをシャットダウンする必要があります。
        </p>
        <code-block lang="kotlin" code="    ktorClient.close()"/>
    </chapter>
    <chapter title="サーバーの実装" id="server-implementation">
        <p>
            サーバー側の実装は 2 つの部分に分かれます。まずインターフェースの実装を作成する必要があり、次にそれをサーバー内でホストする必要があります。
        </p>
        <procedure id="create-interface">
            <step>
                <Path>src/main/kotlin</Path>
                に移動し、新しい
                <Path>Server.kt</Path>
                ファイルを作成します。
            </step>
            <step>
                <Path>Server.kt</Path>
                を開き、以下のインターフェース実装を追加します。
                <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.model.*&#10;import io.ktor.server.application.*&#10;&#10;class PizzaShopImpl : PizzaShop {&#10;    override suspend fun orderPizza(pizza: Pizza): Receipt {&#10;        return Receipt(7.89)&#10;    }&#10;}"/>
                <p>
                    当然ながらこれは実用的な実装ではありませんが、デモを稼働させるには十分です。
                </p>
                <p>
                    実装の 2 つ目の部分は Ktor をベースに構築します。
                </p>
            </step>
            <step>
                <p>
                    同じファイルに以下のコードを追加します。
                </p>
                <code-block lang="kotlin" code="fun main() {&#10;    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }&#10;    }&#10;}"/>
                <p>内訳は以下のとおりです。</p>
                <p>
                    まず、設定に使用する指定の拡張関数とともに、Ktor/Netty のインスタンスを作成します。
                </p>
                <code-block lang="kotlin" code="    embeddedServer(Netty, port = 8080) {&#10;        module()&#10;        println(&quot;Server running&quot;)&#10;    }.start(wait = true)"/>
                <p>
                    次に、Ktor Application 型を拡張するセットアップ関数を宣言します。これにより <code>kotlinx.rpc</code> プラグインがインストールされ、1 つ以上のルートが宣言されます。
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    install(Krpc)&#10;&#10;    routing {&#10;    }&#10;}"/>
                <p>
                    ルーティングセクション内では、Ktor Routing DSL への <code>kotlinx.rpc</code> 拡張機能を使用してエンドポイントを宣言します。クライアントと同様に、URL を指定してシリアライゼーションを設定します。ただしこの場合、実装はその URL で受信リクエストをリッスンします。
                </p>
                <code-block lang="kotlin" code="        rpc(&quot;/pizza&quot;) {&#10;            rpcConfig {&#10;                serialization {&#10;                    json()&#10;                }&#10;            }&#10;&#10;            registerService&lt;PizzaShop&gt; { PizzaShopImpl() }&#10;        }"/>
                <p>
                    <code>registerService</code> を使用して、インターフェースの実装を RPC ランタイムに提供している点に注意してください。単一のインスタンスにとどまらない構成にしたい場合もあるかもしれませんが、それは後続の記事のトピックとします。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="依存関係の追加" id="add-dependencies">
        <p>
            これでアプリケーションを実行するために必要なコードはすべて揃いましたが、現時点では実行はおろかコンパイルすら通りません。
            <a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">kotlinx.rpc</a> プラグインを指定した Ktor Project Generator を使用することも、ビルドファイルを手動で設定することもできます。
            こちらもそれほど複雑ではありません。
        </p>
        <procedure id="configure-build-files">
            <step>
                <Path>build.gradle.kts</Path>
                ファイルに、以下のプラグインを追加します。
                <code-block lang="kotlin" code="plugins {&#10;    kotlin(&quot;jvm&quot;) version &quot;2.3.0&quot;&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.3.0&quot;&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.6.0&quot;&#10;    id(&quot;org.jetbrains.kotlinx.rpc.plugin&quot;) version &quot;0.10.1&quot;&#10;}"/>
                <p>
                    Kotlin プラグインが必要な理由は明白です。その他について説明します。
                </p>
                <list>
                    <li>
                        <code>kotlinx.serialization</code> プラグインは、Kotlin オブジェクトを JSON に変換するためのヘルパー型を生成するために必要です。<code>kotlinx.serialization</code> はリフレクションを使用しないことを思い出してください。
                    </li>
                    <li>
                        Ktor プラグインは、アプリとそのすべての依存関係をバンドルした fat JAR をビルドするために使用されます。
                    </li>
                    <li>
                        RPC プラグインは、クライアント側のスタブを生成するために必要です。
                    </li>
                </list>
            </step>
            <step>
                以下の依存関係を追加します。
                <code-block lang="kotlin" code="    implementation(&quot;io.ktor:ktor-client-cio-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-client:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-client:0.10.1&quot;)&#10;    implementation(&quot;io.ktor:ktor-server-netty-jvm&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-ktor-server:0.10.1&quot;)&#10;    implementation(&quot;org.jetbrains.kotlinx:kotlinx-rpc-krpc-serialization-json:0.10.1&quot;)&#10;    implementation(&quot;ch.qos.logback:logback-classic:1.5.33&quot;)&#10;    testImplementation(kotlin(&quot;test&quot;))&#10;}"/>
                <p>
                    これにより、Ktor のクライアントとサーバー、<code>kotlinx.rpc</code> ランタイムのクライアントおよびサーバー部分、そして <code>kotlinx.rpc</code> と <code>kotlinx-serialization</code> を統合するためのライブラリが追加されます。
                </p>
                <p>
                    これで、プロジェクトを実行して RPC 呼び出しを開始できるようになります。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="アプリケーションの実行" id="run-application">
        <p>
            デモを実行するには、以下の手順に従ってください。
        </p>
        <procedure id="run-app-procedure">
            <step>
                <Path>Server.kt</Path>
                ファイルに移動します。
            </step>
            <step>
                <p>IntelliJ IDEA で、<code>main()</code> 関数の横にある実行ボタン
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="intelliJ IDEA run icon"/>)
                    をクリックしてアプリケーションを起動します。</p>
                <p>
                    <control>Run</control>
                    ツールパネルに出力が表示されるはずです。
                </p>
                <img src="tutorial_kotlin_rpc_run_server.png" alt="Run server output in intelliJ IDEA"
                     style="block" width="706" border-effect="line"/>
            </step>
            <step>
                <Path>Client.kt</Path>
                ファイルに移動し、アプリケーションを実行します。コンソールに次のような出力が表示されるはずです。
                <code-block lang="shell" code="                        Your pizza cost 7.89&#10;&#10;                        Process finished with exit code 0"/>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="サンプルの拡張" id="extend-the-example">
    <p>
        最後に、今後の開発に向けた強固な基盤を確立するために、サンプルアプリケーションを少し発展させてみましょう。
    </p>
    <procedure id="extend-server">
        <step>
            <Path>PizzaShop.kt</Path>
            ファイルで、クライアント ID を含めるように <code>orderPizza</code> メソッドを拡張し、指定したクライアントの保留中のすべての注文を返す <code>viewOrders</code> メソッドを追加します。
            <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.coroutines.flow.Flow&#10;import kotlinx.serialization.Serializable&#10;import kotlinx.rpc.annotations.Rpc&#10;&#10;@Rpc&#10;interface PizzaShop {&#10;    suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt&#10;    fun viewOrders(clientID: String): Flow&lt;Pizza&gt;&#10;}"/>
            <p>
                <code>List</code> や <code>Set</code> ではなく <code>Flow</code> を返すことで、コルーチンライブラリの利点を活用できます。これにより、ピザの情報を 1 枚ずつクライアントにストリーミングできるようになります。
            </p>
        </step>
        <step>
            <Path>Server.kt</Path>
            ファイルに移動し、現在の注文をリストのマップに格納してこの機能を実装します。
            <code-block lang="kotlin" code="class PizzaShopImpl : PizzaShop {&#10;    private val openOrders = mutableMapOf&lt;String, MutableList&lt;Pizza&gt;&gt;()&#10;&#10;    override suspend fun orderPizza(clientID: String, pizza: Pizza): Receipt {&#10;        if(openOrders.containsKey(clientID)) {&#10;            openOrders[clientID]?.add(pizza)&#10;        } else {&#10;            openOrders[clientID] = mutableListOf(pizza)&#10;        }&#10;        return Receipt(3.45)&#10;    }&#10;&#10;    override fun viewOrders(clientID: String): Flow&lt;Pizza&gt; {&#10;        val orders = openOrders[clientID]&#10;        if (orders != null) {&#10;            return flow {&#10;                for (order in orders) {&#10;                    emit(order)&#10;                    delay(1000)&#10;                }&#10;            }&#10;        }&#10;        return flow {}&#10;    }&#10;}"/>
            <p>
                クライアントインスタンスごとに <code>PizzaShopImpl</code> の新しいインスタンスが作成される点に注意してください。これにより、クライアントの状態が分離され、クライアント間の競合が回避されます。ただし、同一サーバーインスタンス内でのスレッドセーフティ、特に同じインスタンスに複数のサービスから同時にアクセスされるケースには対応していません。
            </p>
        </step>
        <step>
            <Path>Client.kt</Path>
            ファイルで、2 つの異なるクライアント ID を使用して複数の注文を送信します。
            <code-block lang="kotlin" code="    val pizzaShop: PizzaShop = client.withService&lt;PizzaShop&gt;()&#10;&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Pepperoni&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Hawaiian&quot;))&#10;    pizzaShop.orderPizza(&quot;AB12&quot;, Pizza(&quot;Calzone&quot;))&#10;&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Margherita&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;Sicilian&quot;))&#10;    pizzaShop.orderPizza(&quot;CD34&quot;, Pizza(&quot;California&quot;))"/>
            <p>
                次に、<code>Coroutines</code> ライブラリと <code>collect</code> メソッドを使用して、結果を反復処理します。
            </p>
            <code-block lang="kotlin" code="    pizzaShop.viewOrders(&quot;AB12&quot;).collect {&#10;        println(&quot;AB12 ordered ${it.name}&quot;)&#10;    }&#10;&#10;    pizzaShop.viewOrders(&quot;CD34&quot;).collect {&#10;        println(&quot;CD34 ordered ${it.name}&quot;)&#10;    }"/>
        </step>
        <step>
            サーバーとクライアントを実行します。クライアントを実行すると、結果が順次表示されるのが確認できます。
            <img src="tutorial_kotlin_rpc_run_client.gif" alt="Client output incrementally displaying results"
                 style="block" width="706" border-effect="line"/>
        </step>
    </procedure>
    <p>
        動作する例が作成できたので、全体がどのように機能しているのかをさらに詳しく掘り下げてみましょう。特に、Kotlin RPC を 2 つの主要な代替技術である REST および gRPC と比較対照してみます。
    </p>
</chapter>
<chapter title="RPC vs. REST" id="rpc-vs-rest">
    <p>
        RPC の考え方は REST よりもかなり古く、<a
            href="https://en.wikipedia.org/wiki/Remote_procedure_call">少なくとも 1981 年にまで遡ります</a>。REST と比較した場合、RPC ベースのアプローチは統一インターフェース（HTTP リクエストタイプなど）に制約されず、コード上での扱いがはるかにシンプルであり、バイナリメッセージングのおかげでパフォーマンスが向上する可能性があります。
    </p>
    <p>
        しかし、REST には大きな利点が 3 つあります。
    </p>
    <list type="decimal">
        <li>
            ブラウザ内の JavaScript クライアントから直接利用できるため、シングルページアプリケーションの一部として使用できます。RPC フレームワークは生成されたスタブとバイナリメッセージングに依存しているため、JavaScript エコシステムにはあまりうまく適合しません。
        </li>
        <li>
            REST では、ある機能がネットワーク通信を伴うことが明白です。これにより、Martin Fowler 氏が指摘した<a
                href="https://martinfowler.com/articles/distributed-objects-microservices.html">分散オブジェクトアンチパターン（distributed objects antipattern）</a>を回避しやすくなります。このアンチパターンは、ローカルプロシージャ呼び出しをリモート化することによるパフォーマンスと信頼性への影響を考慮せずに、チームがオブジェクト指向の設計を 2 つ以上の部分に分割したときに発生します。
        </li>
        <li>
            REST API は一連の規約に基づいて構築されているため、作成、文書化、監視、デバッグ、テストが比較的容易です。これをサポートする巨大なツールエコシステムが存在します。
        </li>
    </list>
    <p>
        これらのトレードオフを考慮すると、Kotlin RPC は 2 つのシナリオで最も適しています。1 つ目は <a
            href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a> を使用する KMP クライアント、2 つ目はクラウド内で連携するマイクロサービス間です。<a
            href="https://kotlinlang.org/docs/wasm-overview.html">Kotlin/Wasm</a> の将来的な発展により、ブラウザベースのアプリケーションへの <code>kotlinx.rpc</code> の適用性も高まる可能性があります。
    </p>
</chapter>
<chapter title="Kotlin RPC vs. Google RPC" id="kotlin-rpc-vs-google-rpc">
    <p>
        Google RPC は、現在ソフトウェア業界で主流の RPC 技術です。Protocol Buffers（protobuf）と呼ばれる標準を使用して、言語中立なインターフェース定義言語（IDL）でデータ構造とメッセージペイロードを定義します。これらの IDL 定義は多種多様なプログラミング言語に変換でき、コンパクトで効率的なバイナリ形式を使用してシリアライズされます。Quarkus や Micronaut などのマイクロサービスフレームワークは、すでに gRPC をサポートしています。
    </p>
    <p>
        Kotlin RPC が gRPC と競合することは困難であり、Kotlin コミュニティにとっても何のメリットもありません。幸いなことに、そのような計画はありません。むしろ、kotlinx.rpc を gRPC と互換性を持たせ、相互運用可能にすることが意図されています。kotlinx.rpc サービスがネットワーキングプロトコルとして gRPC を使用できるようにすることや、kotlinx.rpc クライアントが gRPC サービスを呼び出せるようにすることが可能になります。<code>kotlinx.rpc</code> はデフォルトのオプションとして<a
            href="https://kotlin.github.io/kotlinx-rpc/transport.html">独自の kRPC プロトコル</a>を使用しますが（現在のサンプルと同様）、代わりに gRPC を選択することも妨げられません。
    </p>
</chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        Kotlin RPC は Kotlin エコシステムを新たな方向へと拡張し、サービスの作成と利用において REST や GraphQL に代わる選択肢を提供します。Ktor、Coroutines、<code>kotlinx-serialization</code> などの実績あるライブラリやフレームワークの上に構築されています。Kotlin Multiplatform や Compose Multiplatform の活用を目指すチームにとって、分散メッセージングのためのシンプルで効率的な選択肢となるでしょう。
    </p>
    <p>
        この入門記事で興味を持たれた方は、ぜひ<a href="https://kotlin.github.io/kotlinx-rpc/get-started.html">公式の <code>kotlinx.rpc</code> ドキュメント</a>や<a
            href="https://github.com/Kotlin/kotlinx-rpc/tree/main/samples">サンプルコード</a>をチェックしてみてください。
    </p>
    <p>
        <code>kotlinx.rpc</code> ライブラリはまだ初期段階にあるため、ぜひ試してフィードバックを共有してください。バグや機能リクエストは <a href="https://youtrack.jetbrains.com/issues/KRPC">YouTrack</a> で受け付けており、一般的なディスカッションは <a
            href="https://kotlinlang.slack.com/archives/C072YJ3Q91V">Slack</a> で行われています（<a
            href="https://surveys.jetbrains.com/s3/kotlin-slack-sign-up">アクセス権をリクエスト</a>）。
    </p>
</chapter>
</topic>