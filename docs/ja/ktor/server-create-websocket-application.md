<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Ktor を使用して Kotlin で WebSocket アプリケーションを作成する" id="server-create-websocket-application">
<show-structure for="chapter" depth="2"/>
<tldr>
    <var name="example_name" value="tutorial-server-websockets"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用プラグイン</b>: <Links href="/ktor/server-routing" summary="Routingは、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">Routing</Links>、<Links href="/ktor/server-static-content" summary="スタイルシート、スクリプト、画像などの静的コンテンツを提供する方法を学びます。">Static Content</Links>、
        <Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主要な目的を果たします。">Content Negotiation</Links>、 <Links href="/ktor/server-websockets" summary="WebSocketsプラグインを使用すると、サーバーとクライアント間で多方向通信セッションを作成できます。">Ktor Server の WebSockets</Links>、
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>
    </p>
</tldr>
<card-summary>
    WebSockets の機能を活用してコンテンツを送受信する方法を学びます。
</card-summary>
<link-summary>
    WebSockets の機能を活用してコンテンツを送受信する方法を学びます。
</link-summary>
<web-summary>
    Ktor を使用して Kotlin で WebSocket アプリケーションを構築する方法を学びます。このチュートリアルでは、WebSockets を介してバックエンドサービスとクライアントを接続するプロセスを説明します。
</web-summary>
<p>
    この記事では、Ktor を使用して Kotlin で WebSocket アプリケーションを作成するプロセスについて説明します。<Links href="/ktor/server-create-restful-apis" summary="Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学び、JSON ファイルを生成する RESTful API の例を紹介します。">RESTful API の作成</Links>チュートリアルで扱った内容を基にしています。
</p>
<p>この記事では、次のことを学習します:</p>
<list>
    <li>JSON シリアライゼーションを使用するサービスを作成する。</li>
    <li>WebSocket 接続を介してコンテンツを送受信する。</li>
    <li>複数のクライアントに同時にコンテンツをブロードキャストする。</li>
</list>
<chapter title="前提条件" id="prerequisites">
    <p>このチュートリアルは単独で実行できますが、<Links href="/ktor/server-create-restful-apis" summary="Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学び、JSON ファイルを生成する RESTful API の例を紹介します。">RESTful API の作成</Links>チュートリアルを完了して、<Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主要な目的を果たします。">Content Negotiation</Links>と REST に慣れることをお勧めします。
    </p>
    <p><a href="https://www.jetbrains.com/help/idea/installation-guide.html">IntelliJ
        IDEA</a> をインストールすることをお勧めしますが、任意の他の IDE を使用することもできます。
    </p>
</chapter>
<chapter title="Hello WebSockets" id="hello-websockets">
    <p>
        このチュートリアルでは、<Links href="/ktor/server-create-restful-apis" summary="Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学び、JSON ファイルを生成する RESTful API の例を紹介します。">RESTful API の作成</Links>チュートリアルで開発したタスクマネージャーサービスを基に、WebSocket 接続を介してクライアントと <code>Task</code> オブジェクトを交換する機能を追加します。これを実現するには、<Links href="/ktor/server-websockets" summary="WebSocketsプラグインを使用すると、サーバーとクライアント間で多方向通信セッションを作成できます。">WebSockets
        プラグイン</Links>を追加する必要があります。既存のプロジェクトに手動で追加することもできますが、このチュートリアルのために、新しいプロジェクトを作成して最初から始めます。
    </p>
    <chapter title="プラグインを使用して初期プロジェクトを作成する" id="create=project">
        <procedure>
            <step>
                <p>
                    <a href="https://start.ktor.io/">Ktor Project Generator</a>
                    に移動します。
                </p>
            </step>
            <step>
                <p>
                    <control>Project artifact</control>
                    フィールドに、プロジェクトアーティファクトの名前として
                    <Path>com.example.ktor-websockets-task-app</Path>
                    を入力します。
                    <img src="tutorial_server_websockets_project_artifact.png"
                         alt="Ktor Project Generatorでプロジェクトアーティファクトに名前を付ける"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    プラグインセクションで、<control>Add</control> ボタンをクリックして以下のプラグインを検索し、追加します:
                </p>
                <list type="bullet">
                    <li>Routing</li>
                    <li>Content Negotiation</li>
                    <li>Kotlinx.serialization</li>
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
                    プラグインを追加したら、プラグインセクションの右上にある
                    <control>5 plugins</control>
                    ボタンをクリックして、追加されたプラグインを表示します。
                </p>
                <p>プロジェクトに追加されるすべてのプラグインのリストが表示されます:
                    <img src="tutorial_server_websockets_project_plugins.png"
                         alt="Ktor Project Generatorのプラグインリスト"
                         border-effect="line"
                         style="block"
                         width="706"/>
                </p>
            </step>
            <step>
                <p>
                    <control>Download</control>
                    ボタンをクリックして、Ktor プロジェクトを生成し、ダウンロードします。
                </p>
            </step>
        </procedure>
    </chapter>
    <chapter title="スターターコードを追加する" id="add-starter-code">
        <p>ダウンロードが完了したら、IntelliJ IDEA でプロジェクトを開き、以下の手順に従います:</p>
        <procedure>
            <step>
                <Path>src/main/kotlin</Path>
                に移動し、<Path>model</Path> という新しいサブパッケージを作成します。
            </step>
            <step>
                <p>
                    <Path>model</Path>
                    パッケージ内に、新しい
                    <Path>Task.kt</Path>
                    ファイルを作成します。
                </p>
            </step>
            <step>
                <p>
                    <Path>Task.kt</Path>
                    ファイルを開き、優先度を表す <code>enum</code> とタスクを表す <code>data class</code> を追加します:
                </p>
                <code-block lang="kotlin" code="package model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
                <p>
                    <code>Task</code> クラスには <code>kotlinx.serialization</code> ライブラリの <code>Serializable</code> 型アノテーションが付いていることに注意してください。これは、インスタンスを JSON に変換してネットワーク経由でその内容を転送できることを意味します。
                </p>
                <p>
                    WebSockets プラグインを含めたため、
                    <Path>Sockets.kt</Path>
                    ファイルが
                    <Path>src/main/kotlin/com/example/plugins</Path>
                    内に生成されています。
                </p>
            </step>
            <step>
                <p>
                    <Path>Sockets.kt</Path>
                    ファイルを開き、既存の <code>Application.configureSockets()</code> 関数を以下の実装に置き換えます:
                </p>
                <code-block lang="kotlin" code="                        fun Application.configureSockets() {&#10;                            install(WebSockets) {&#10;                                contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;                                pingPeriod = 15.seconds&#10;                                timeout = 15.seconds&#10;                                maxFrameSize = Long.MAX_VALUE&#10;                                masking = false&#10;                            }&#10;&#10;                            routing {&#10;                                webSocket(&quot;/tasks&quot;) {&#10;                                    val tasks = listOf(&#10;                                        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;                                        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;                                        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;                                        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;                                    )&#10;&#10;                                    for (task in tasks) {&#10;                                        sendSerialized(task)&#10;                                        delay(1000)&#10;                                    }&#10;&#10;                                    close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                                }&#10;                            }&#10;                        }"/>
                <p>
                    このコードでは、以下の手順が実行されます:
                </p>
                <list type="decimal">
                    <li>WebSockets プラグインがインストールされ、標準設定で構成されます。</li>
                    <li><code>contentConverter</code> プロパティが設定され、<a
                            href="https://github.com/Kotlin/kotlinx.serialization">kotlinx.serialization</a>
                        ライブラリを介して送受信されるオブジェクトをプラグインがシリアライズできるようになります。
                    </li>
                    <li>ルーティングが単一のエンドポイントで構成され、相対 URL は <code>/tasks</code> です。
                    </li>
                    <li>リクエストを受信すると、タスクのリストが WebSocket 接続を介してシリアライズされます。</li>
                    <li>すべてのアイテムが送信されると、サーバーは接続を閉じます。</li>
                </list>
                <p>
                    デモンストレーションのため、タスクの送信間に1秒の遅延が導入されています。これにより、クライアントでタスクが段階的に表示されるのを観察できます。この遅延がないと、この例は以前の記事で開発された<Links href="/ktor/server-create-restful-apis" summary="Kotlin と Ktor を使用してバックエンドサービスを構築する方法を学び、JSON ファイルを生成する RESTful API の例を紹介します。">RESTful
                    サービス</Links>や<Links href="/ktor/server-create-website" summary="Ktor と Thymeleaf テンプレートを使用して Kotlin で Webサイトを構築する方法を学びます。">Web アプリケーション</Links>とまったく同じように見えます。
                </p>
                <p>
                    このイテレーションの最終ステップは、このエンドポイントのクライアントを作成することです。<Links href="/ktor/server-static-content" summary="スタイルシート、スクリプト、画像などの静的コンテンツを提供する方法を学びます。">Static Content</Links> プラグインを含めたため、
                    <Path>index.html</Path>
                    ファイルが
                    <Path>src/main/resources/static</Path>
                    内に生成されています。
                </p>
            </step>
            <step>
                <p>
                    <Path>index.html</Path>
                    ファイルを開き、既存のコンテンツを以下に置き換えます:
                </p>
                <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;Using Ktor WebSockets&lt;/title&gt;&#10;    &lt;script&gt;&#10;        function readAndDisplayAllTasks() {&#10;            clearTable();&#10;&#10;            const serverURL = 'ws://0.0.0.0:8080/tasks';&#10;            const socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function clearTable() {&#10;            tableBody().innerHTML = &quot;&quot;;&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;form action=&quot;javascript:readAndDisplayAllTasks()&quot;&gt;&#10;    &lt;input type=&quot;submit&quot; value=&quot;View The Tasks&quot;&gt;&#10;&lt;/form&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
                <p>
                    このページでは、すべての最新ブラウザで利用可能な <a href="https://websockets.spec.whatwg.org//#websocket">WebSocket 型</a>を使用しています。JavaScript でこのオブジェクトを作成し、エンドポイントの URL をコンストラクタに渡します。その後、<code>onopen</code>、<code>onclose</code>、
                    および <code>onmessage</code> イベントのイベントハンドラーをアタッチします。<code>onmessage</code> イベントがトリガーされると、ドキュメントオブジェクトのメソッドを使用してテーブルに行を追加します。
                </p>
            </step>
            <step>
                <p>IntelliJ IDEA で、実行ボタン
                    (<img src="intellij_idea_gutter_icon.svg"
                          style="inline" height="16" width="16"
                          alt="IntelliJ IDEA 実行アイコン"/>)
                    をクリックしてアプリケーションを起動します。</p>
            </step>
            <step>
                <p>
                    [http://0.0.0.0:8080/static/index.html](http://0.0.0.0:8080/static/index.html)
                    に移動します。ボタンと空のテーブルを含むフォームが表示されるはずです:
                </p>
                <img src="tutorial_server_websockets_iteration_1.png"
                     alt="ボタン1つがあるHTMLフォームを表示するウェブブラウザページ"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    フォームをクリックすると、タスクがサーバーからロードされ、1秒に1つのペースで表示されます。その結果、テーブルには段階的にデータが入力されます。ブラウザの
                    <control>developer tools</control>
                    で
                    <control>JavaScript Console</control>
                    を開くと、ログに記録されたメッセージも表示できます。
                </p>
                <img src="tutorial_server_websockets_iteration_1_click.gif"
                     alt="ボタンをクリックするとリストアイテムを表示するウェブブラウザページ"
                     border-effect="rounded"
                     width="706"/>
                <p>
                    これにより、サービスが期待どおりに動作していることがわかります。WebSocket 接続が開かれ、アイテムがクライアントに送信され、接続が閉じられます。基盤となるネットワークには多くの複雑さがありますが、Ktor はこれらすべてをデフォルトで処理します。
                </p>
            </step>
        </procedure>
    </chapter>
</chapter>
<chapter title="WebSockets を理解する" id="understanding-websockets">
    <p>
        次のイテレーションに進む前に、WebSockets の基本をいくつか確認しておくと役立つかもしれません。
        すでに WebSockets に精通している場合は、<a href="#improve-design">サービスの設計を改善する</a>に進むことができます。
    </p>
    <p>
        以前のチュートリアルでは、クライアントは HTTP リクエストを送信し、HTTP レスポンスを受信していました。これはうまく機能し、インターネットをスケーラブルで弾力性のあるものにしています。
    </p>
    <p>しかし、次のようなシナリオには適していません:</p>
    <list>
        <li>コンテンツが時間とともに段階的に生成される場合。</li>
        <li>イベントに応答してコンテンツが頻繁に変化する場合。</li>
        <li>コンテンツが生成される際にクライアントがサーバーと対話する必要がある場合。</li>
        <li>あるクライアントが送信したデータが、他のクライアントに迅速に伝播される必要がある場合。</li>
    </list>
    <p>
        これらのシナリオの例としては、株式取引、映画やコンサートのチケット購入、オンラインオークションでの入札、ソーシャルメディアのチャット機能などがあります。WebSockets は、これらの状況を処理するために開発されました。
    </p>
    <p>
        WebSocket 接続は TCP 上で確立され、長期間持続することができます。この接続は「全二重通信」を提供し、クライアントがサーバーにメッセージを送信し、同時にサーバーからメッセージを受信できることを意味します。
    </p>
    <p>
        WebSocket API は、4つのイベント (open、message、close、および error) と2つのアクション (send と close) を定義しています。
        この機能へのアクセス方法は、異なる言語やライブラリによって異なる場合があります。
        たとえば、Kotlin では、受信メッセージのシーケンスを <a
            href="https://kotlinlang.org/docs/flow.html">Flow</a> として消費できます。
    </p>
</chapter>
<chapter title="設計を改善する" id="improve-design">
    <p>次に、より高度な例のためのスペースを確保するために、既存のコードをリファクタリングします。</p>
    <procedure>
        <step>
            <p>
                <Path>model</Path>
                パッケージに、新しい
                <Path>TaskRepository.kt</Path>
                ファイルを作成します。
            </p>
        </step>
        <step>
            <p>
                <Path>TaskRepository.kt</Path>
                を開き、<code>TaskRepository</code> 型を追加します:
            </p>
            <code-block lang="kotlin" code="package model&#10;&#10;object TaskRepository {&#10;    private val tasks = mutableListOf(&#10;        Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;    )&#10;&#10;    fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    fun addTask(task: Task) {&#10;        if (taskByName(task.name) != null) {&#10;            throw IllegalStateException(&quot;Cannot duplicate task names!&quot;)&#10;        }&#10;        tasks.add(task)&#10;    }&#10;&#10;    fun removeTask(name: String): Boolean {&#10;        return tasks.removeIf { it.name == name }&#10;    }&#10;}"/>
            <p>このコードは以前のチュートリアルで覚えているかもしれません。</p>
        </step>
        <step>
            <Path>plugins</Path>
            パッケージに移動し、<Path>Sockets.kt</Path> ファイルを開きます。
        </step>
        <step>
            <p>
                これで、<code>TaskRepository</code> を利用して <code>Application.configureSockets()</code> のルーティングを簡素化できます:
            </p>
            <code-block lang="kotlin" code="                    routing {&#10;                        webSocket(&quot;/tasks&quot;) {&#10;                            for (task in TaskRepository.allTasks()) {&#10;                                sendSerialized(task)&#10;                                delay(1000)&#10;                            }&#10;&#10;                            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;                        }&#10;                    }"/>
        </step>
    </procedure>
</chapter>
<chapter title="WebSockets を介してメッセージを送信する" id="send-messages">
    <p>
        WebSockets の威力を示すために、次の新しいエンドポイントを作成します:
    </p>
    <list>
        <li>
            クライアントが起動すると、すべての既存のタスクを受信します。
        </li>
        <li>
            クライアントはタスクを作成して送信できます。
        </li>
        <li>
            あるクライアントがタスクを送信すると、他のクライアントに通知されます。
        </li>
    </list>
    <procedure>
        <step>
            <p>
                <Path>Sockets.kt</Path>
                ファイルで、現在の <code>configureSockets()</code> メソッドを以下の実装に置き換えます:
            </p>
            <code-block lang="kotlin" code="fun Application.configureSockets() {&#10;    install(WebSockets) {&#10;        contentConverter = KotlinxWebsocketSerializationConverter(Json)&#10;        pingPeriod = 15.seconds&#10;        timeout = 15.seconds&#10;        maxFrameSize = Long.MAX_VALUE&#10;        masking = false&#10;    }&#10;    routing {&#10;        val sessions =&#10;            Collections.synchronizedList&lt;WebSocketServerSession&gt;(ArrayList())&#10;&#10;        webSocket(&quot;/tasks&quot;) {&#10;            sendAllTasks()&#10;            close(CloseReason(CloseReason.Codes.NORMAL, &quot;All done&quot;))&#10;        }&#10;&#10;        webSocket(&quot;/tasks2&quot;) {&#10;            sessions.add(this)&#10;            sendAllTasks()&#10;&#10;            while(true) {&#10;                val newTask = receiveDeserialized&lt;Task&gt;()&#10;                TaskRepository.addTask(newTask)&#10;                for(session in sessions) {&#10;                    session.sendSerialized(newTask)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;private suspend fun DefaultWebSocketServerSession.sendAllTasks() {&#10;    for (task in TaskRepository.allTasks()) {&#10;        sendSerialized(task)&#10;        delay(1000)&#10;    }&#10;}"/>
            <p>このコードで、次のことを行いました:</p>
            <list>
                <li>
                    すべての既存のタスクを送信する機能をヘルパーメソッドにリファクタリングしました。
                </li>
                <li>
                    <code>routing</code> セクションで、すべてのクライアントを追跡するための <code>session</code> オブジェクトのスレッドセーフなリストを作成しました。
                </li>
                <li>
                    相対 URL が <code>/task2</code> の新しいエンドポイントを追加しました。クライアントがこのエンドポイントに接続すると、対応する <code>session</code> オブジェクトがリストに追加されます。その後、サーバーは新しいタスクを受信するのを待つ無限ループに入ります。新しいタスクを受信すると、サーバーはそれをリポジトリに保存し、現在のクライアントを含むすべてのクライアントにコピーを送信します。
                </li>
            </list>
            <p>
                この機能をテストするために、<Path>index.html</Path> の機能を拡張する新しいページを作成します。
            </p>
        </step>
        <step>
            <p>
                <Path>src/main/resources/static</Path>
                内に、<Path>wsClient.html</Path> という新しい HTML ファイルを作成します。
            </p>
        </step>
        <step>
            <p>
                <Path>wsClient.html</Path>
                を開き、以下の内容を追加します:
            </p>
            <code-block lang="html" code="&lt;html&gt;&#10;&lt;head&gt;&#10;    &lt;title&gt;WebSocket Client&lt;/title&gt;&#10;    &lt;script&gt;&#10;        let serverURL;&#10;        let socket;&#10;&#10;        function setupSocket() {&#10;            serverURL = 'ws://0.0.0.0:8080/tasks2';&#10;            socket = new WebSocket(serverURL);&#10;&#10;            socket.onopen = logOpenToConsole;&#10;            socket.onclose = logCloseToConsole;&#10;            socket.onmessage = readAndDisplayTask;&#10;        }&#10;&#10;        function readAndDisplayTask(event) {&#10;            let task = JSON.parse(event.data);&#10;            logTaskToConsole(task);&#10;            addTaskToTable(task);&#10;        }&#10;&#10;        function logTaskToConsole(task) {&#10;            console.log(`Received ${task.name}`);&#10;        }&#10;&#10;        function logCloseToConsole() {&#10;            console.log(&quot;Web socket connection closed&quot;);&#10;        }&#10;&#10;        function logOpenToConsole() {&#10;            console.log(&quot;Web socket connection opened&quot;);&#10;        }&#10;&#10;        function tableBody() {&#10;            return document.getElementById(&quot;tasksTableBody&quot;);&#10;        }&#10;&#10;        function addTaskToTable(task) {&#10;            tableBody().appendChild(taskRow(task));&#10;        }&#10;&#10;        function taskRow(task) {&#10;            return tr([&#10;                td(task.name),&#10;                td(task.description),&#10;                td(task.priority)&#10;            ]);&#10;        }&#10;&#10;        function tr(children) {&#10;            const node = document.createElement(&quot;tr&quot;);&#10;            children.forEach(child =&gt; node.appendChild(child));&#10;            return node;&#10;        }&#10;&#10;        function td(text) {&#10;            const node = document.createElement(&quot;td&quot;);&#10;            node.appendChild(document.createTextNode(text));&#10;            return node;&#10;        }&#10;&#10;        function getFormValue(name) {&#10;            return document.forms[0][name].value&#10;        }&#10;&#10;        function buildTaskFromForm() {&#10;            return {&#10;                name: getFormValue(&quot;newTaskName&quot;),&#10;                description: getFormValue(&quot;newTaskDescription&quot;),&#10;                priority: getFormValue(&quot;newTaskPriority&quot;)&#10;            }&#10;        }&#10;&#10;        function logSendingToConsole(data) {&#10;            console.log(&quot;About to send&quot;,data);&#10;        }&#10;&#10;        function sendTaskViaSocket(data) {&#10;            socket.send(JSON.stringify(data));&#10;        }&#10;&#10;        function sendTaskToServer() {&#10;            let data = buildTaskFromForm();&#10;            logSendingToConsole(data);&#10;            sendTaskViaSocket(data);&#10;            //prevent form submission&#10;            return false;&#10;        }&#10;    &lt;/script&gt;&#10;&lt;/head&gt;&#10;&lt;body onload=&quot;setupSocket()&quot;&gt;&#10;&lt;h1&gt;Viewing Tasks Via WebSockets&lt;/h1&gt;&#10;&lt;table rules=&quot;all&quot;&gt;&#10;    &lt;thead&gt;&#10;    &lt;tr&gt;&#10;        &lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Description&lt;/th&gt;&lt;th&gt;Priority&lt;/th&gt;&#10;    &lt;/tr&gt;&#10;    &lt;/thead&gt;&#10;    &lt;tbody id=&quot;tasksTableBody&quot;&gt;&#10;    &lt;/tbody&gt;&#10;&lt;/table&gt;&#10;&lt;div&gt;&#10;    &lt;h3&gt;Create a new task&lt;/h3&gt;&#10;    &lt;form onsubmit=&quot;return sendTaskToServer()&quot;&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskName&quot;&gt;Name: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskName&quot;&#10;                   name=&quot;newTaskName&quot; size=&quot;10&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskDescription&quot;&gt;Description: &lt;/label&gt;&#10;            &lt;input type=&quot;text&quot; id=&quot;newTaskDescription&quot;&#10;                   name=&quot;newTaskDescription&quot; size=&quot;20&quot;&gt;&#10;        &lt;/div&gt;&#10;        &lt;div&gt;&#10;            &lt;label for=&quot;newTaskPriority&quot;&gt;Priority: &lt;/label&gt;&#10;            &lt;select id=&quot;newTaskPriority&quot; name=&quot;newTaskPriority&quot;&gt;&#10;                &lt;option name=&quot;Low&quot;&gt;Low&lt;/option&gt;&#10;                &lt;option name=&quot;Medium&quot;&gt;Medium&lt;/option&gt;&#10;                &lt;option name=&quot;High&quot;&gt;High&lt;/option&gt;&#10;                &lt;option name=&quot;Vital&quot;&gt;Vital&lt;/option&gt;&#10;            &lt;/select&gt;&#10;        &lt;/div&gt;&#10;        &lt;input type=&quot;submit&quot;&gt;&#10;    &lt;/form&gt;&#10;&lt;/div&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"/>
            <p>
                この新しいページでは、ユーザーが新しいタスクの情報を入力できる HTML フォームを導入しています。
                フォームを送信すると、<code>sendTaskToServer</code> イベントハンドラーが呼び出されます。これは、フォームデータを持つ JavaScript オブジェクトを構築し、WebSocket オブジェクトの <code>send</code> メソッドを使用してサーバーに送信します。
            </p>
        </step>
        <step>
            <p>
                IntelliJ IDEA で、再実行ボタン (<img src="intellij_idea_rerun_icon.svg"
                                                     style="inline" height="16" width="16"
                                                     alt="IntelliJ IDEA 再実行アイコン"/>) をクリックしてアプリケーションを再起動します。
            </p>
        </step>
        <step>
            <p>この機能をテストするには、2つのブラウザを並べて開き、以下の手順に従います。</p>
            <list type="decimal">
                <li>
                    ブラウザ A で、
                    [http://0.0.0.0:8080/static/wsClient.html](http://0.0.0.0:8080/static/wsClient.html)
                    に移動します。デフォルトのタスクが表示されるはずです。
                </li>
                <li>
                    ブラウザ A で新しいタスクを追加します。新しいタスクはそのページのテーブルに表示されるはずです。
                </li>
                <li>
                    ブラウザ B で、
                    [http://0.0.0.0:8080/static/wsClient.html](http://0.0.0.0:8080/static/wsClient.html)
                    に移動します。デフォルトのタスクと、ブラウザ A で追加した新しいタスクが表示されるはずです。
                </li>
                <li>
                    いずれかのブラウザでタスクを追加します。新しいアイテムが両方のページに表示されるはずです。
                </li>
            </list>
            <img src="tutorial_server_websockets_iteration_2_test.gif"
                 alt="HTMLフォームを介して新しいタスクを作成する様子を示す2つのウェブブラウザページが並んでいる"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
<chapter title="自動テストを追加する" id="add-automated-tests">
    <p>
        QA プロセスを効率化し、高速で再現性があり、ハンズフリーにするために、Ktor の組み込みの
        <Links href="/ktor/server-testing" summary="特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。">自動テストサポート</Links>
        を使用できます。以下の手順に従ってください:
    </p>
    <procedure>
        <step>
            <p>
                Ktor クライアント内で
                <Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズという2つの主要な目的を果たします。">Content Negotiation</Links>
                のサポートを設定できるように、
                <Path>build.gradle.kts</Path>
                に以下の依存関係を追加します:
            </p>
            <code-block lang="kotlin" code="    testImplementation(&quot;io.ktor:ktor-client-content-negotiation-jvm:$ktor_version&quot;)"/>
        </step>
        <step>
            <p>
                <p>IntelliJ IDEA で、エディタの右側にある通知 Gradle アイコン
                    (<img alt="IntelliJ IDEA Gradle アイコン"
                          src="intellij_idea_gradle_icon.svg" width="16" height="26"/>)
                    をクリックして、Gradle の変更をロードします。</p>
            </p>
        </step>
        <step>
            <p>
                <Path>src/test/kotlin/com/example</Path>
                に移動し、
                <Path>ApplicationTest.kt</Path>
                ファイルを開きます。
            </p>
        </step>
        <step>
            <p>
                生成されたテストクラスを以下の実装に置き換えます:
            </p>
            <code-block lang="kotlin" code="package com.example&#10;&#10;import com.example.plugins.*&#10;import io.ktor.client.plugins.contentnegotiation.*&#10;import io.ktor.client.plugins.websocket.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.testing.*&#10;import kotlinx.coroutines.flow.*&#10;import kotlinx.serialization.json.Json&#10;import model.Priority&#10;import model.Task&#10;import kotlin.test.*&#10;&#10;class ApplicationTest {&#10;    @Test&#10;    fun testRoot() = testApplication {&#10;        application {&#10;            configureRouting()&#10;            configureSerialization()&#10;            configureSockets()&#10;        }&#10;&#10;        val client = createClient {&#10;            install(ContentNegotiation) {&#10;                json()&#10;            }&#10;            install(WebSockets) {&#10;                contentConverter =&#10;                    KotlinxWebsocketSerializationConverter(Json)&#10;            }&#10;        }&#10;&#10;        val expectedTasks = listOf(&#10;            Task(&quot;cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;            Task(&quot;gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;            Task(&quot;shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;            Task(&quot;painting&quot;, &quot;Paint the fence&quot;, Priority.Medium)&#10;        )&#10;        var actualTasks = emptyList&lt;Task&gt;()&#10;&#10;        client.webSocket(&quot;/tasks&quot;) {&#10;            consumeTasksAsFlow().collect { allTasks -&gt;&#10;                actualTasks = allTasks&#10;            }&#10;        }&#10;&#10;        assertEquals(expectedTasks.size, actualTasks.size)&#10;        expectedTasks.forEachIndexed { index, task -&gt;&#10;            assertEquals(task, actualTasks[index])&#10;        }&#10;    }&#10;&#10;    private fun DefaultClientWebSocketSession.consumeTasksAsFlow() = incoming&#10;        .consumeAsFlow()&#10;        .map {&#10;            converter!!.deserialize&lt;Task&gt;(it)&#10;        }&#10;        .scan(emptyList&lt;Task&gt;()) { list, task -&gt;&#10;            list + task&#10;        }&#10;}"/>
            <p>
                このセットアップで、次のことを行います:
            </p>
            <list>
                <li>
                    サービスをテスト環境で実行するように構成し、ルーティング、JSON シリアライゼーション、WebSockets など、本番環境と同じ機能を有効にします。
                </li>
                <li>
                    <Links href="/ktor/client-create-and-configure" summary="Ktor クライアントを作成および構成する方法を学びます。">Ktor クライアント</Links>
                    内で Content Negotiation および WebSocket サポートを構成します。これがないと、クライアントは WebSocket 接続を使用する際にオブジェクトを JSON として (デ)シリアライズする方法を認識しません。
                </li>
                <li>
                    サービスが返すことを期待する <code>Tasks</code> のリストを宣言します。
                </li>
                <li>
                    クライアントオブジェクトの <code>websocket</code> メソッドを使用して、<code>/tasks</code> へのリクエストを送信します。
                </li>
                <li>
                    受信するタスクを <code>flow</code> として消費し、段階的にリストに追加します。
                </li>
                <li>
                    すべてのタスクが受信されたら、通常の方法で <code>expectedTasks</code> と <code>actualTasks</code> を比較します。
                </li>
            </list>
        </step>
    </procedure>
</chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        素晴らしい！Ktor クライアントとの WebSocket 通信と自動テストを組み込むことで、タスクマネージャーサービスが大幅に強化されました。
    </p>
    <p>
        <Links href="/ktor/server-integrate-database" summary="Exposed SQL ライブラリを使用して Ktor サービスをデータベースリポジトリに接続するプロセスを学びます。">次のチュートリアル</Links>
        に進んで、Exposed ライブラリを使用してサービスがリレーショナルデータベースとシームレスに連携する方法を探ります。
    </p>
</chapter>
</topic>