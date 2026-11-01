<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="KotlinとKtorでWebSocketアプリケーションを作成する" id="server-create-websocket-application">
<show-structure for="chapter" depth="2"/>
<tldr>
        <var name="example_name" value="tutorial-server-websockets"/>
        <p>
            <b>コード例</b>:
            <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
                %example_name%
            </a>
        </p>
        <p>
            <b>使用されているプラグイン</b>: <Links href="server-static-content.md" summary="スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。">Static Content</Links>、
            <Links href="server-serialization.md" summary="ContentNegotiationプラグインには、クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主な目的があります。">Content Negotiation</Links>、<Links href="server-websockets.md" summary="WebSocketsプラグインを使用すると、サーバーとクライアント間で双方向通信セッションを作成できます。">WebSockets in Ktor Server</Links>、
            <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
        </p>
    </tldr>
    <card-summary>
        WebSocketの力を活用してコンテンツを送受信する方法を学びます。
    </card-summary>
    <link-summary>
        WebSocketの力を活用してコンテンツを送受信する方法を学びます。
    </link-summary>
    <web-summary>
        KotlinとKtorでWebSocketアプリケーションを構築する方法を学びます。このチュートリアルでは、WebSocketを介してバックエンドサービスをクライアントと接続するプロセスについて説明します。
    </web-summary>
    <p>
        この記事では、KotlinとKtorを使用してWebSocketアプリケーションを作成する手順を説明します。これは、「<Links href="server-create-restful-apis.topic" summary="JSONファイルを生成するRESTful APIの例を取り上げ、KotlinとKtorを使用してバックエンドサービスを構築する方法を学びます。">RESTful APIの作成</Links>」チュートリアルで扱った内容を基にしています。
    </p>
    <p>この記事では、以下の方法を学びます：</p>
    <list>
        <li>JSONシリアライゼーションを使用するサービスを作成する。</li>
        <li>WebSocket接続を介してコンテンツを送受信する。</li>
        <li>複数のクライアントにコンテンツを同時にブロードキャストする。</li>
    </list>
    <chapter title="前提条件" id="prerequisites">
        <p>このチュートリアルは単独で進めることもできますが、<Links href="server-serialization.md" summary="ContentNegotiationプラグインには、クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主な目的があります。">Content Negotiation</Links>やRESTに慣れるために、「<Links href="server-create-restful-apis.topic" summary="JSONファイルを生成するRESTful APIの例を取り上げ、KotlinとKtorを使用してバックエンドサービスを構築する方法を学びます。">RESTful APIの作成</Links>」チュートリアルを事前に完了しておくことをお勧めします。
        </p>
        <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
            IDEA</a>のインストールを推奨しますが、お好みの他のIDEを使用することもできます。
        </p>
    </chapter>
    <chapter title="Hello WebSockets" id="hello-websockets">
        <p>
            このチュートリアルでは、「<Links href="server-create-restful-apis.topic" summary="JSONファイルを生成するRESTful APIの例を取り上げ、KotlinとKtorを使用してバックエンドサービスを構築する方法を学びます。">RESTful APIの作成</Links>」チュートリアルで開発したタスクマネージャーサービスをベースに、WebSocket接続を通じてクライアントと<code>Task</code>オブジェクトを交換する機能を追加します。これを実現するには、<Links href="server-websockets.md" summary="WebSocketsプラグインを使用すると、サーバーとクライアント間で双方向通信セッションを作成できます。">WebSocketsプラグイン</Links>を追加する必要があります。既存のプロジェクトに手動で追加することもできますが、このチュートリアルでは新しいプロジェクトを作成して最初から始めます。
        </p>
        <chapter title="プラグインを含む初期プロジェクトを作成する" id="create=project">
            <procedure>
                <step>
                    <p>
                        <a href="https://start.ktor.io/">Ktor Project Generator</a>にアクセスします。
                    </p>
                </step>
                <step>
                    <p><control>Project artifact</control>フィールドに、プロジェクトのアーティファクト名として
                        <Path>com.example.ktor-websockets-task-app</Path>
                        と入力します。
                        <img src="tutorial_server_websockets_project_artifact.png"
                             alt="Ktor Project Generatorでプロジェクトアーティファクトに名前を付ける"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        プラグインセクションで、<control>Add</control>ボタンをクリックして以下のプラグインを検索し、追加します：
                    </p>
                    <list type="bullet">
                        <li>Content Negotiation</li>
                        <li>kotlinx.serialization</li>
                        <li>WebSockets</li>
                        <li>Static Content</li>
                    </list>
                    <p>
                        <img src="ktor_project_generator_add_plugins.gif"
                             alt="Ktor Project Generatorでプラグインを追加する"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        プラグインを追加すると、プラグインセクションの右上に表示されます。
                    </p>
                    <p>その後、プロジェクトに追加されるすべてのプラグインのリストが表示されます：
                        <img src="tutorial_server_websockets_project_plugins.png"
                             alt="Ktor Project Generatorのプラグインリスト"
                             border-effect="line"
                             style="block"
                             width="706"/>
                    </p>
                </step>
                <step>
                    <p>
                        <control>Download</control>ボタンをクリックして、Ktorプロジェクトを生成しダウンロードします。
                    </p>
                </step>
            </procedure>
        </chapter>
        <chapter title="スターターコードを追加する" id="add-starter-code">
            <p>ダウンロードが完了したら、IntelliJ IDEAでプロジェクトを開き、以下の手順に従ってください：</p>
            <procedure>
                <step>
                    <Path>src/main/kotlin</Path>に移動し、<Path>model</Path>という名前の新しいサブパッケージを作成します。
                </step>
                <step>
                    <p>
                        <Path>model</Path>パッケージ内に、新しい<Path>Task.kt</Path>ファイルを作成します。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>Task.kt</Path>ファイルを開き、優先度を表す<code>enum</code>とタスクを表す<code>data class</code>を追加します：
                    </p>
                    <code-block lang="kotlin" code="package com.example.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                    <p>
                        <code>Task</code>クラスには、<code>kotlinx.serialization</code>ライブラリの<code>Serializable</code>アノテーションが付与されていることに注意してください。これにより、インスタンスをJSONと相互変換できるようになり、その内容をネットワーク経由で転送できるようになります。
                    </p>
                    <p>
                        WebSocketsプラグインを含めたため、ジェネレーターによって<Path>src/main/kotlin</Path>内の<Path>Websockets.kt</Path>ファイルと、<Path>Routing.kt</Path>ファイル内に<code>webSocket</code>ルートが追加されています。
                    </p>
                </step>
                <step>
                    <Path>Websockets.kt</Path>ファイルを開き、既存の<code>.configureWebsockets()</code>関数を以下のように置き換えます：
                    <code-block lang="kotlin" code="                        fun Application.configureWebsockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;                        }"/>
                    <list>
                        <li>WebSocketsプラグインがインストールされ、標準設定で構成されます。</li>
                        <li><code>contentConverter</code>プロパティが設定され、プラグインが<a
                                    href="https://github.com/Kotlin/kotlinx.serialization"><code>kotlinx.serialization</code></a>ライブラリを介して送受信されるオブジェクトをシリアライズできるようになります。
                        </li>
                    </list>
                </step>
                <step>
                    <p>
                        <Path>Routing.kt</Path>ファイルを開き、既存の<code>Application.configureRouting()</code>関数を以下の実装に置き換えます：
                    </p>
                    <code-block lang="kotlin" code="                    fun Application.configureRouting() {&#10;                        routing {&#10;                            webSocket(&quot;/tasks&quot;) {&#10;                                val tasks = listOf(&#10;                                    Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                    Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                    Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                    Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                )&#10;&#10;                                for (task in tasks) {&#10;                                    sendSerialized(task)&#10;                                    delay(1000.milliseconds)&#10;                                }&#10;&#10;                                close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                            }&#10;                            staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;                        }&#10;                    }"/>
                    <list>
                        <li>相対URLが<code>/tasks</code>となる単一のエンドポイントでルーティングが構成されます。
                        </li>
                        <li>リクエストを受信すると、タスクのリストがシリアライズされてWebSocket接続経由で送信されます。</li>
                        <li>すべてのアイテムが送信されると、サーバーは接続を閉じます。</li>
                    </list>
                    <p>
                        デモの目的で、タスクの送信間に1秒の遅延が導入されています。これにより、クライアント側でタスクが段階的に表示される様子を確認できます。この遅延がないと、この例は以前の記事で開発した<Links href="server-create-restful-apis.topic" summary="JSONファイルを生成するRESTful APIの例を取り上げ、KotlinとKtorを使用してバックエンドサービスを構築する方法を学びます。">RESTfulサービス</Links>や<Links href="server-create-website.topic" summary="Kotlin、Ktor、Thymeleafテンプレートを使用してWebサイトを構築する方法を学びます。">Webアプリケーション</Links>とまったく同じように見えてしまいます。
                    </p>
                    <p>
                        このイテレーションの最後のステップは、このエンドポイント用のクライアントを作成することです。<Links href="server-static-content.md" summary="スタイルシート、スクリプト、画像などの静的コンテンツを配信する方法を学びます。">Static Content</Links>プラグインを含めたため、Ktorプロジェクトジェネレーターによって<Path>src/main/resources/static</Path>内に<Path>index.html</Path>ファイルが追加されています。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>index.html</Path>ファイルを開き、既存のコンテンツを以下に置き換えます：
                    </p>
                    <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                    <p>
                        このページでは、すべてのモダンブラウザで利用可能な<a href="https://websockets.spec.whatwg.org//#websocket"><code>WebSocket</code>型</a>を使用しています。JavaScriptでこのオブジェクトを作成し、コンストラクターにエンドポイントのURLを渡します。続いて、<code>onopen</code>、<code>onclose</code>、および<code>onmessage</code>イベントのイベントハンドラーをアタッチします。<code>onmessage</code>イベントが発生すると、documentオブジェクトのメソッドを使用してテーブルに行を追加します。
                    </p>
                </step>
                <step>
                    <p>IntelliJ IDEAで、実行ボタン
                        (<img src="intellij_idea_gutter_icon.svg"
                              style="inline" height="16" width="16"
                              alt="intelliJ IDEA run icon"/>)
                        をクリックしてアプリケーションを起動します。</p>
                </step>
                <step>
                    <p>
                        <a href="http://0.0.0.0:8080/static/index.html">http://0.0.0.0:8080/static/index.html</a>にアクセスします。ボタンと空のテーブルが表示されたフォームが表示されるはずです：
                    </p>
                    <img src="tutorial_server_websockets_iteration_1.png"
                         alt="1つのボタンがあるHTMLフォームを表示しているWebブラウザページ"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        フォームのボタンをクリックすると、サーバーからタスクが読み込まれ、1秒に1つのペースで表示されます。その結果、テーブルに徐々にデータが追加されていきます。ブラウザの<control>Developer Tools</control>（開発者ツール）で<control>JavaScript Console</control>を開くことで、ログに記録されたメッセージを確認することもできます。
                    </p>
                    <img src="tutorial_server_websockets_iteration_1_click.gif"
                         alt="ボタンクリックでリストアイテムを表示しているWebブラウザページ"
                         border-effect="rounded"
                         width="706"/>
                    <p>
                        これで、サービスは期待どおりに動作しています。WebSocket接続が開かれ、アイテムがクライアントに送信され、接続が閉じられます。基盤となるネットワーク処理には多くの複雑さがありますが、Ktorはこれらすべてをデフォルトで処理します。
                    </p>
                </step>
            </procedure>
        </chapter>
    </chapter>
    <chapter title="WebSocketの理解" id="understanding-websockets">
        <p>
            次のイテレーションに進む前に、WebSocketの基本をいくつか確認しておくと役立つかもしれません。すでにWebSocketに精通している場合は、<a href="#improve-design">サービスの設計の改善</a>にそのまま進むことができます。
        </p>
        <p>
            以前のチュートリアルでは、クライアントはHTTPリクエストを送信し、HTTPレスポンスを受信していました。これはうまく機能し、インターネットのスケーラビリティと回復力を支えています。
        </p>
        <p>しかし、以下のようなシナリオには適していません：</p>
        <list>
            <li>コンテンツが時間の経過とともに段階的に生成される。</li>
            <li>イベントに応じてコンテンツが頻繁に変更される。</li>
            <li>コンテンツが生成されるにつれて、クライアントがサーバーと対話する必要がある。</li>
            <li>あるクライアントから送信されたデータを他のクライアントへ迅速に伝播させる必要がある。</li>
        </list>
        <p>
            これらのシナリオの例としては、株式取引、映画やコンサートのチケット購入、オンラインオークションでの入札、ソーシャルメディアのチャット機能などがあります。WebSocketは、このような状況を処理するために開発されました。
        </p>
        <p>
            WebSocket接続はTCP上で確立され、長期間維持することができます。この接続は<emphasis>全二重通信（full duplex communication）</emphasis>を提供するため、クライアントはサーバーへメッセージを送信することとサーバーからメッセージを受信することを同時に行えます。
        </p>
        <p>
            WebSocket APIは、4つのイベント（open、message、close、error）と2つのアクション（send、close）を定義しています。この機能へのアクセス方法は、言語やライブラリによって異なる場合があります。たとえばKotlinでは、受信メッセージのシーケンスを<a
                href="https://kotlinlang.org/docs/flow.html"><code>Flow</code></a>として処理できます。
        </p>
    </chapter>
    <chapter title="設計の改善" id="improve-design">
        <p>次に、より高度な例に対応できるように既存のコードをリファクタリングします。</p>
        <procedure>
            <step>
                <p>
                    <Path>model</Path>パッケージ内に、新しい<Path>TaskRepository.kt</Path>ファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>TaskRepository.kt</Path>を開き、<code>TaskRepository</code>型を追加します：
                </p>
                <code-block lang="kotlin" code="package com.example.model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
                <p>以前のチュートリアルでこのコードを見たことがあるかもしれません。</p>
            </step>
            <step>
                <Path>src/main/kotlin</Path>に移動し、<Path>Routing.kt</Path>ファイルを開きます。
            </step>
            <step>
                <p>
                    これで、<code>TaskRepository</code>を利用して<code>Application.configureRouting()</code>のルーティングを簡素化できます：
                </p>
                <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000.milliseconds)&#10;                            }&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                        // ...&#10;                    }"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="WebSocket経由でメッセージを送信する" id="send-messages">
        <p>
            WebSocketの威力を示すために、次のような新しいエンドポイントを作成します：
        </p>
        <list>
            <li>
                クライアントが起動すると、既存のすべてのタスクを受信する。
            </li>
            <li>
                クライアントがタスクを作成して送信できる。
            </li>
            <li>
                1つのクライアントがタスクを送信すると、他のクライアントに通知される。
            </li>
        </list>
        <procedure>
            <step>
                <p>
                    <Path>Routing.kt</Path>ファイルで、現在の<code>.configureRouting()</code>メソッドを以下の実装に置き換えます：
                </p>
                <code-block lang="kotlin" code="fun Application.configureRouting() {&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                ensureActive()&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;        staticResources(&quot;/static&quot;, &quot;static&quot;)&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000.milliseconds)&#10;    }&#10;}"/>
                <p>このコードにより、以下の処理を行いました：</p>
                <list>
                    <li>
                        既存のすべてのタスクを送信する機能をヘルパーメソッドにリファクタリングしました。
                    </li>
                    <li>
                        <code>routing {}</code>ブロック内で、すべてのクライアントを追跡するための<code>session</code>オブジェクトのスレッドセーフなリストを作成しました。
                    </li>
                    <li>
                        相対URLが<code>/tasks2</code>の新しいエンドポイントを追加しました。クライアントがこのエンドポイントに接続すると、対応する<code>session</code>オブジェクトがリストに追加されます。その後、サーバーは新しいタスクの受信を待機する無限ループに入ります。新しいタスクを受信すると、サーバーはそれをリポジトリに保存し、現在のクライアントを含むすべてのクライアントにコピーを送信します。
                    </li>
                </list>
                <p>
                    この機能をテストするために、<Path>index.html</Path>の機能を拡張した新しいページを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>src/main/resources/static</Path>内に、<Path>wsClient.html</Path>という名前の新しいHTMLファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>wsClient.html</Path>を開き、以下の内容を追加します：
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create a new task&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    この新しいページには、ユーザーが新しいタスクの情報を入力できるHTMLフォームが導入されています。フォームを送信すると、<code>sendTaskToServer()</code>イベントハンドラーが呼び出されます。これにより、フォームデータからJavaScriptオブジェクトが構築され、WebSocketオブジェクトの<code>.send()</code>メソッドを使用してサーバーに送信されます。
                </p>
            </step>
            <step>
                <p>
                    IntelliJ IDEAで、再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                                   style="inline" height="16" width="16"
                                                                   alt="intelliJ IDEA rerun icon"/>) をクリックしてアプリケーションを再起動します。
                </p>
            </step>
            <step>
                <p>この機能をテストするには、2つのブラウザを並べて開き、以下の手順に従ってください。</p>
                <list type="decimal">
                    <li>
                        ブラウザAで、
                        <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>
                        にアクセスします。デフォルトのタスクが表示されるはずです。
                    </li>
                    <li>
                        ブラウザAで新しいタスクを追加します。そのページのテーブルに新しいタスクが表示されます。
                    </li>
                    <li>
                        ブラウザBで、
                        <a href="http://0.0.0.0:8080/static/wsClient.html">http://0.0.0.0:8080/static/wsClient.html</a>
                        にアクセスします。デフォルトのタスクに加えて、ブラウザAで追加した新しいタスクが表示されるはずです。
                    </li>
                    <li>
                        いずれかのブラウザでタスクを追加します。両方のページに新しい項目が表示されることを確認してください。
                    </li>
                </list>
                <img src="tutorial_server_websockets_iteration_2_test.gif"
                     alt="HTMLフォームによる新しいタスクの作成を示す、並べて表示された2つのWebブラウザページ"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="自動テストを追加する" id="add-automated-tests">
        <p>
            QAプロセスを効率化し、高速で再現性が高く、手作業を不要にするために、Ktorに組み込まれている<Links href="server-testing.md" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。">自動テストのサポート</Links>を利用できます。以下の手順に従ってください：
        </p>
        <procedure>
            <step>
                <p>
                    Ktor Client内で<Links href="server-serialization.md" summary="ContentNegotiationプラグインには、クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主な目的があります。">Content Negotiation</Links>のサポートを構成できるように、<Path>build.gradle.kts</Path>に以下の依存関係を追加します：
                </p>
                <code-block lang="kotlin" code="    testImplementation(ktorLibs.client.contentNegotiation)"/>
            </step>
            <step>
                <p>
                    <p>IntelliJ IDEAで、エディターの右側にあるGradle通知アイコン
                        (<img alt="intelliJ IDEA gradle icon"
                              src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                        をクリックしてGradleの変更を読み込みます。</p>
                </p>
            </step>
            <step>
                <p>
                    <Path>src/test/kotlin</Path>に移動し、<Path>ServerTest.kt</Path>ファイルを開きます。
                </p>
            </step>
            <step>
                <p>
                    生成されたテストクラスを以下の実装に置き換えます：
                </p>
                <code-block lang="kotlin" code="import com.example.model.Priority&#10;import com.example.model.Task&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.websocket.DefaultClientWebSocketSession&#10;import io.ktor.client.plugins.websocket.WebSockets&#10;import io.ktor.client.plugins.websocket.converter&#10;import io.ktor.client.plugins.websocket.webSocket&#10;import io.ktor.serialization.deserialize&#10;import io.ktor.serialization.kotlinx.KotlinxWebsocketSerializationConverter&#10;import io.ktor.serialization.kotlinx.json.json&#10;import io.ktor.server.testing.testApplication&#10;import kotlinx.coroutines.flow.consumeAsFlow&#10;import kotlinx.coroutines.flow.map&#10;import kotlinx.coroutines.flow.scan&#10;import kotlinx.serialization.json.Json&#10;import kotlin.test.Test&#10;import kotlin.test.assertEquals&#10;&#10;class ServerTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        configure()&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
                <p>
                    このセットアップにより、以下を行います：
                </p>
                <list>
                    <li>
                        サービスがテスト環境内で実行されるように構成し、JSONシリアライゼーションやWebSocketsなど、本番環境と同じ機能を有効にします。
                    </li>
                    <li>
                        <Links href="client-create-and-configure.md" summary="Ktorクライアントを作成および構成する方法を学びます。">Ktor Client</Links>内でコンテンツネゴシエーションとWebSocketサポートを構成します。これがないと、クライアントはWebSocket接続を使用するときにオブジェクトをJSONとして（デ）シリアライズする方法を認識できません。
                    </li>
                    <li>
                        サービスから返送されると期待される<code>Tasks</code>のリストを宣言します。
                    </li>
                    <li>
                        <code>client</code>オブジェクトの<code>.webSocket</code>関数を使用して、<code>/tasks</code>にリクエストを送信します。
                    </li>
                    <li>
                        受信したタスクを<code>Flow</code>として消費（処理）し、リストに段階的に追加します。
                    </li>
                    <li>
                        すべてのタスクを受信したら、通常の方法で<code>expectedTasks</code>と<code>actualTasks</code>を比較します。
                    </li>
                </list>
            </step>
        </procedure>
    </chapter>
    <chapter title="次のステップ" id="next-steps">
        <p>
            お疲れ様でした！WebSocket通信とKtor Clientによる自動テストを取り入れることで、タスクマネージャーサービスを大幅に強化できました。
        </p>
        <p>
            <Links href="server-integrate-database.md" summary="Exposed SQLライブラリを使用してKtorサービスをデータベースリポジトリに接続するプロセスを学びます。">次のチュートリアル</Links>に進み、Exposedライブラリを使用してサービスがリレーショナルデータベースとシームレスに対話する方法を学びましょう。
        </p>
    </chapter>
</topic>