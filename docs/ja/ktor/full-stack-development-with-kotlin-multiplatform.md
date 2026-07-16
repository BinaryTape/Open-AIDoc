<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin Multiplatformでフルスタックアプリケーションを構築する" id="full-stack-development-with-kotlin-multiplatform">
<show-structure for="chapter, procedure" depth="2"/>
<web-summary>
    KotlinとKtorでクロスプラットフォームのフルスタックアプリケーションを開発する方法を学びましょう。このチュートリアルでは、Kotlin Multiplatformを使用してAndroid、iOS、デスクトップ向けにビルドし、Ktorを使用してデータを簡単に処理する方法を発見します。
</web-summary>
<link-summary>
    KotlinとKtorでクロスプラットフォームのフルスタックアプリケーションを開発する方法を学びます。
</link-summary>
<card-summary>
    KotlinとKtorでクロスプラットフォームのフルスタックアプリケーションを開発する方法を学びます。
</card-summary>
<tldr>
    <var name="example_name" value="full-stack-task-manager"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用プラグイン</b>: <Links href="/ktor/server-routing" summary="ルーティングは、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">ルーティング</Links>,
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>,
        <Links href="/ktor/server-serialization" summary="ContentNegotiationプラグインには、クライアントとサーバー間のメディアタイプのネゴシエーションと、特定の形式でのコンテンツのシリアライズ/デシリアライズという2つの主な目的があります。">コンテンツネゴシエーション</Links>,
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>,
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
    </p>
</tldr>
<p>
    この記事では、Ktorを活用してシームレスなデータ処理を行いながら、Android、iOS、デスクトッププラットフォームで動作するKotlinでのフルスタックアプリケーションを開発する方法を学びます。
</p>
<p>このチュートリアルの終わりまでに、以下の方法を習得できます。</p>
<list>
    <li>Kotlin Multiplatformを使用してフルスタックアプリケーションを作成する。
    </li>
    <li>IntelliJ IDEAで生成されたプロジェクトを理解する。</li>
    <li>Ktorサービスを呼び出す<a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>クライアントを作成する。
    </li>
    <li>デザインの異なるレイヤー間で共有タイプを再利用する。</li>
    <li>マルチプラットフォームライブラリを正しく含め、構成する。</li>
</list>
<p>
    以前のチュートリアルでは、タスクマネージャーの例を使用して、
    <Links href="/ktor/server-requests-and-responses" summary="タスクマネージャーアプリケーションを構築することで、KotlinとKtorにおけるルーティング、リクエスト処理、パラメーターの基本を学びましょう。">リクエストを処理し</Links>、
    <Links href="/ktor/server-create-restful-apis" summary="KotlinとKtorを使用してバックエンドサービスを構築する方法を学び、JSONファイルを生成するRESTful APIの例を紹介します。">RESTful APIを作成し</Links>、
    <Links href="/ktor/server-integrate-database" summary="Exposed SQLライブラリを使用してKtorサービスをデータベースリポジトリに接続するプロセスを学びましょう。">Exposedでデータベースを統合しました</Links>。
    クライアントアプリケーションは可能な限り最小限に抑えられていたため、Ktorの基本を学ぶことに集中できました。
</p>
<p>
    表示するデータを取得するためにKtorサービスを使用して、Android、iOS、デスクトッププラットフォームをターゲットとするクライアントを作成します。可能な限り、クライアントとサーバー間でデータ型を共有することで、開発を加速し、エラーの可能性を減らします。
</p>
<chapter title="前提条件" id="prerequisites">
    <p>
        以前の記事と同様に、IDEとしてIntelliJ IDEAを使用します。環境のインストールと構成については、
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
            Kotlin Multiplatformクイックスタート
        </a>ガイドを参照してください。
    </p>
    <p>
        Compose Multiplatformを初めて使用する場合は、このチュートリアルを開始する前に、
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
            Compose Multiplatformの入門
        </a>
        チュートリアルを完了することをお勧めします。タスクの複雑さを軽減するために、単一のクライアントプラットフォームに集中することができます。たとえば、iOSを使用したことがない場合は、デスクトップまたはAndroid開発に集中するのが賢明かもしれません。
    </p>
</chapter>
<chapter title="新しいプロジェクトを作成する" id="create-project">
    <p>
        Ktorプロジェクトジェネレーターの代わりに、IntelliJ IDEAのKotlin Multiplatformプロジェクトウィザードを使用します。
        これにより、クライアントとサービスを拡張できる基本的なマルチプラットフォームプロジェクトが作成されます。クライアントはSwiftUIのようなネイティブUIライブラリを使用することもできますが、このチュートリアルでは
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>を使用してすべてのプラットフォームで共有UIを作成します。
    </p>
    <procedure id="generate-project">
        <step>
            IntelliJ IDEAを起動します。
        </step>
        <step>
            IntelliJ IDEAで、
            <ui-path>ファイル | 新規 | プロジェクト</ui-path>
            を選択します。
        </step>
        <step>
            左側のパネルで、
            <ui-path>Kotlin Multiplatform</ui-path>
            を選択します。
        </step>
        <step>
            <ui-path>新規プロジェクト</ui-path>
            ウィンドウで次のフィールドを指定します。
            <list>
                <li>
                    <ui-path>名前</ui-path>
                    : full-stack-task-manager
                </li>
                <li>
                    <ui-path>グループ</ui-path>
                    : com.example.ktor
                </li>
            </list>
        </step>
        <step>
            <p>
                ターゲットプラットフォームとして
                <ui-path>Android</ui-path>
                、
                <ui-path>デスクトップ</ui-path>
                、
                <ui-path>サーバー</ui-path>
                を選択します。
            </p>
        </step>
        <step>
            <p>
                Macを使用している場合は、
                <ui-path>iOS</ui-path>
                も選択します。<ui-path>UIを共有</ui-path>
                オプションが選択されていることを確認します。
                <img style="block" src="full_stack_development_tutorial_create_project.png"
                     alt="Kotlin Multiplatformウィザードの設定" width="706" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                <control>作成</control>
                ボタンをクリックし、IDEがプロジェクトを生成してインポートするのを待ちます。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="サービスを実行する" id="run-service">
    <procedure id="run-service-procedure">
        <step>
            <ui-path>プロジェクト</ui-path>
            ビューで、
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            に移動し、
            <Path>Application.kt</Path>
            ファイルを開きます。
        </step>
        <step>
            <code>main()</code>関数の横にある
            <ui-path>実行</ui-path>
            ボタン
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA実行アイコン"/>)
            をクリックしてアプリケーションを起動します。
            <p>
                <ui-path>実行</ui-path>
                ツールウィンドウに新しいタブが開き、「Responding at http://0.0.0.0:8080」というメッセージでログが終了します。
            </p>
        </step>
        <step>
            <p>
                [http://0.0.0.0:8080/](http://0.0.0.0:8080/)に移動してアプリケーションを開きます。
                ブラウザにKtorからのメッセージが表示されるはずです。
                <img src="full_stack_development_tutorial_run.png"
                     alt="Ktorサーバーのブラウザ応答" width="706"
                     border-effect="rounded" style="block"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="プロジェクトを検証する" id="examine-project">
    <p>
        <Path>server</Path>
        フォルダーは、プロジェクト内の3つのKotlinモジュールのうちの1つです。残りの2つは
        <Path>shared</Path>
        と
        <Path>composeApp</Path>
        です。
    </p>
    <p>
        <Path>server</Path>
        モジュールの構造は、<a href="https://start.ktor.io/">Ktor Project
        Generator</a>によって生成されるものと非常によく似ています。
        プラグインと依存関係を宣言するための専用ビルドファイルと、Ktorサービスを構築して起動するためのコードを含むソースセットがあります。
    </p>
    <img src="full_stack_development_tutorial_server_folder.png"
         alt="Kotlin Multiplatformプロジェクトのserverフォルダーの内容" width="300"
         border-effect="line"/>
    <p>
        <Path>Application.kt</Path>
        ファイルのルーティング命令を見ると、<code>greet()</code>関数の呼び出しがあることがわかります。
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(&quot;Ktor: ${Greeting().greet()}&quot;)&#10;                    }&#10;                }&#10;            }"/>
    <p>
        これは<code>Greeting</code>型のインスタンスを作成し、その<code>greet()</code>メソッドを呼び出します。
        <code>Greeting</code>クラスは<Path>shared</Path>モジュールで定義されています。
        <img src="full_stack_development_tutorial_shared_module.png"
             alt="IntelliJ IDEAで開かれたGreeting.ktとPlatform.kt" width="706"
             border-effect="line" style="block"/>
    </p>
    <p>
        <Path>shared</Path>
        モジュールには、異なるターゲットプラットフォーム間で使用されるコードが含まれています。
    </p>
    <p>
        <Path>shared</Path>
        モジュールセットの<Path>commonMain</Path>ソースには、すべてのプラットフォームで使用される型が保持されます。
        ご覧のとおり、ここで<code>Greeting</code>型が定義されています。
        ここには、サーバーとすべての異なるクライアントプラットフォーム間で共有される共通コードも配置します。
    </p>
    <p>
        <Path>shared</Path>
        モジュールには、クライアントを提供したいプラットフォームごとにソースセットも含まれています。これは、
        <Path>commonMain</Path>
        内で宣言された型が、ターゲットプラットフォームによって異なる機能を必要とする可能性があるためです。
        <code>Greeting</code>型の場合、プラットフォーム固有のAPIを使用して現在のプラットフォームの名前を取得したいと考えています。
        これは<a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">期待される/実際の宣言 (expected and actual declarations)</a>によって実現されます。
    </p>
    <p>
        <Path>shared</Path>
        モジュールの<Path>commonMain</Path>
        ソースセットで、<code>getPlatform()</code>関数を<code>expect</code>キーワードで宣言します。
    </p>
    <tabs>
        <tab title="commonMain/Platform.kt" id="commonMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
        </tab>
    </tabs>
    <p>次に、各ターゲットプラットフォームは、以下に示すように<code>getPlatform()</code>関数の<code>actual</code>宣言を提供する必要があります。
    </p>
    <tabs>
        <tab title="Platform.ios.kt" id="iosMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform: Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
        </tab>
        <tab title="Platform.android.kt" id="androidMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
        </tab>
        <tab title="Platform.jvm.kt" id="jvmMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;class JVMPlatform: Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
        </tab>
        <tab title="Platform.wasmJs.kt" id="wasmJsMain">
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
        </tab>
    </tabs>
    <p>
        プロジェクトにはもう1つモジュールがあり、それが
        <Path>composeApp</Path>
        モジュールです。
        これにはAndroid、iOS、デスクトップ、Webクライアントアプリのコードが含まれています。
        これらのアプリは現時点ではKtorサービスにリンクされていませんが、共有の
        <code>Greeting</code>クラスを使用しています。
    </p>
</chapter>
<chapter title="クライアントアプリケーションを実行する" id="run-client-app">
    <p>
        ターゲットの実行構成を実行することで、クライアントアプリケーションを実行できます。iOSシミュレーターでアプリケーションを実行するには、以下の手順に従います。
    </p>
    <procedure id="run-ios-app-procedure">
        <step>
            IntelliJ IDEAで、
            <Path>iosApp</Path>
            実行構成とシミュレートされたデバイスを選択します。
            <img src="full_stack_development_tutorial_run_configurations.png"
                 alt="実行とデバッグのウィンドウ" width="400"
                 border-effect="line" style="block"/>
        </step>
        <step>
            <ui-path>実行</ui-path>
            ボタン
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEA実行アイコン"/>)
            をクリックして構成を実行します。
        </step>
        <step>
            <p>
                iOSアプリを実行すると、内部でXcodeによってビルドされ、iOSシミュレーターで起動されます。
                アプリには、クリックで画像を切り替えるボタンが表示されます。
                <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                     alt="iOSシミュレーターでアプリを実行する" width="300" border-effect="rounded"/>
            </p>
            <p>
                ボタンが初めて押されると、現在のプラットフォームの詳細がそのテキストに追加されます。これを実現するコードは
                <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager/App.kt</Path>
                にあります。
            </p>
            <code-block lang="kotlin" code="            @Composable&#10;            fun App() {&#10;                MaterialTheme {&#10;                    var greetingText by remember { mutableStateOf(&quot;Hello World!&quot;) }&#10;                    var showImage by remember { mutableStateOf(false) }&#10;                    Column(&#10;                        Modifier.fillMaxWidth(),&#10;                        horizontalAlignment = Alignment.CenterHorizontally&#10;                    ) {&#10;                        Button(onClick = {&#10;                            greetingText = &quot;Compose: ${Greeting().greet()}&quot;&#10;                            showImage = !showImage&#10;                        }) {&#10;                            Text(greetingText)&#10;                        }&#10;                        AnimatedVisibility(showImage) {&#10;                            Image(&#10;                                painterResource(Res.drawable.compose_multiplatform),&#10;                                null&#10;                            )&#10;                        }&#10;                    }&#10;                }&#10;            }"/>
            <p>
                これはコンポーザブル関数であり、この記事の後半で変更します。現時点では、UIを表示し、共有の
                <code>Greeting</code>型を使用していることが重要です。<code>Greeting</code>型は、共通の
                <code>Platform</code>インターフェースを実装するプラットフォーム固有のクラスを使用しています。
            </p>
        </step>
    </procedure>
    <p>
        生成されたプロジェクトの構造を理解できたので、タスクマネージャーの機能を段階的に追加できます。
    </p>
</chapter>
<chapter title="モデルタイプを追加する" id="add-model-types">
    <p>
        まず、モデルタイプを追加し、それらがクライアントとサーバーの両方からアクセス可能であることを確認します。
    </p>
    <procedure id="add-model-types-procedure">
        <step>
            <Path>shared/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            に移動し、
            <Path>model</Path>
            という新しいパッケージを作成します。
        </step>
        <step>
            新しいパッケージ内に、
            <Path>Task.kt</Path>
            という新しいファイルを作成します。
        </step>
        <step>
            <p>
                優先度を表す<code>enum</code>とタスクを表す<code>class</code>を追加します。<code>Task</code>
                クラスには、<code>kotlinx.serialization</code>
                ライブラリからの<code>Serializable</code>型がアノテーションとして付与されています。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
            <p>
                インポートもアノテーションもコンパイルされないことに気づくでしょう。これは、プロジェクトがまだ
                <code>kotlinx.serialization</code>ライブラリへの依存関係を持っていないためです。
            </p>
        </step>
        <step>
            <p>
                <Path>shared/build.gradle.kts</Path>
                に移動し、シリアライゼーションプラグインを追加します。
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    kotlin(&quot;plugin.serialization&quot;) version &quot;2.1.21&quot;&#10;}"/>
        </step>
        <step>
            <p>
                同じファイル内で、
                <Path>commonMain</Path>
                ソースセットに新しい依存関係を追加します。
            </p>
            <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // put your Multiplatform dependencies here&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
        </step>
        <step>
            <Path>gradle/libs.versions.toml</Path>
            に移動し、以下を定義します。
            <code-block lang="toml" code="[versions]&#10;kotlinxSerializationJson = &quot;1.8.1&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinxSerializationJson&quot; }"/>
        </step>
        <!-- the plugin version can also be set in the version catalog -->
        <step>
            IntelliJ IDEAで、<ui-path>ビルド | Gradleファイルとプロジェクトを同期</ui-path>
            を選択して更新を適用します。Gradleインポートが完了すると、
            <Path>Task.kt</Path>
            ファイルが正常にコンパイルされるはずです。
        </step>
    </procedure>
    <!-- The following seems like a lot of nuance to cover for this newbie-oriented tutorial.
     I think at this point it's enough to know that the serialization library requires a Gradle plugin.
     If it's important, it would be nice to make the terminology more precise: earlier we said it won't compile, and now
     we're saying it would, so I'm not sure what's going on in the end.
     -->
    <p>
        シリアライゼーションプラグインを含めなくてもコードはコンパイルされますが、ネットワーク上で
        <code>Task</code>オブジェクトをシリアライズするために必要な型は生成されません。これにより、サービスを呼び出そうとしたときにランタイムエラーが発生します。
    </p>
    <p>
        シリアライゼーションプラグインを別のモジュール（
        <Path>server</Path>
        や
        <Path>composeApp</Path>
        など）に配置しても、ビルド時にエラーは発生しません。しかし、ここでも、シリアライゼーションに必要な追加の型は生成されず、ランタイムエラーが発生します。
    </p>
</chapter>
<chapter title="サーバーを作成する" id="create-server">
    <p>
        次の段階は、タスクマネージャーのサーバー実装を作成することです。
    </p>
    <procedure id="create-server-procedure">
        <step>
            <Path>server/src/main/kotlin/com/example/ktor/full_stack_task_manager</Path>
            フォルダーに移動し、
            <Path>model</Path>
            というサブパッケージを作成します。
        </step>
        <step>
            <p>
                このパッケージ内に、新しい
                <Path>TaskRepository.kt</Path>
                ファイルを作成し、リポジトリ用の以下のインターフェースを追加します。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
        </step>
        <step>
            <p>
                同じパッケージ内に、以下のクラスを含む新しい
                <Path>InMemoryTaskRepository.kt</Path>
                ファイルを作成します。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>server/src/main/kotlin/.../Application.kt</Path>
                に移動し、既存のコードを以下の実装に置き換えます。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.model.InMemoryTaskRepository&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = SERVER_PORT, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // For ease of demonstration we allow any connections.&#10;        // Don't do this in production.&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    この実装は、以前のチュートリアルのものと非常によく似ていますが、今回はすべてのルーティングコードを
                    <code>Application.module()</code>関数内に配置してシンプルにしている点が異なります。
                </p>
                <p>
                    このコードを入力してインポートを追加すると、Webクライアントとやり取りするための
                    <Links href="/ktor/server-cors" summary="必要な依存関係: io.ktor:%artifact_name% コード例: %example_name% ネイティブサーバーサポート: ✅">CORS</Links>
                    プラグインを含む、依存関係として含める必要のある複数のKtorプラグインを使用しているため、複数のコンパイラエラーが見つかるでしょう。
                </p>
            </step>
            <step>
                <Path>gradle/libs.versions.toml</Path>
                ファイルを開き、以下のライブラリを定義します。
                <code-block lang="toml" code="[libraries]&#10;ktor-serialization-kotlinx-json-jvm = { module = &quot;io.ktor:ktor-serialization-kotlinx-json-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-content-negotiation-jvm = { module = &quot;io.ktor:ktor-server-content-negotiation-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-cors-jvm = { module = &quot;io.ktor:ktor-server-cors-jvm&quot;, version.ref = &quot;ktor&quot; }"/>
            </step>
            <step>
                <p>
                    サーバーモジュールのビルドファイル（
                    <Path>server/build.gradle.kts</Path>
                    ）を開き、以下の依存関係を追加します。
                </p>
                <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(libs.ktor.serialization.kotlinx.json.jvm)&#10;    implementation(libs.ktor.server.content.negotiation.jvm)&#10;    implementation(libs.ktor.server.cors.jvm)&#10;}"/>
            </step>
            <step>
                再び、メインメニューの<ui-path>ビルド | Gradleファイルとプロジェクトを同期</ui-path>。
                インポートが完了すると、<code>ContentNegotiation</code>型と<code>json()</code>関数のインポートが正しく機能することがわかるはずです。
            </step>
            <step>
                サーバーを再実行します。ブラウザからルートにアクセスできるはずです。
            </step>
            <step>
                <p>
                    <a href="http://0.0.0.0:8080/tasks"></a>
                    および<a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                    に移動して、JSON形式のタスクを含むサーバー応答を確認します。
                    <img style="block" src="full_stack_development_tutorial_run_server.gif"
                         width="707" border-effect="rounded" alt="ブラウザのサーバー応答"/>
                </p>
            </step>
        </procedure>
    </chapter>
<chapter title="クライアントを作成する" id="create-client">
    <p>
        クライアントがサーバーにアクセスできるようにするには、Ktorクライアントを含める必要があります。これには、次の3種類の依存関係が関係します。
    </p>
    <list>
        <li>Ktorクライアントのコア機能。</li>
        <li>ネットワークを処理するプラットフォーム固有のエンジン。</li>
        <li>コンテンツネゴシエーションとシリアライゼーションのサポート。</li>
    </list>
    <procedure id="create-client-procedure">
        <step>
            <Path>gradle/libs.versions.toml</Path>
            ファイルに、以下のライブラリを追加します。
            <code-block lang="toml" code="[libraries]&#10;ktor-client-android = { module = &quot;io.ktor:ktor-client-android&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-cio = { module = &quot;io.ktor:ktor-client-cio&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-core = { module = &quot;io.ktor:ktor-client-core&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-darwin = { module = &quot;io.ktor:ktor-client-darwin&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-wasm = { module = &quot;io.ktor:ktor-client-js-wasm-js&quot;, version.ref = &quot;ktor&quot;}&#10;ktor-serialization-kotlinx-json = { module = &quot;io.ktor:ktor-serialization-kotlinx-json&quot;, version.ref = &quot;ktor&quot; }"/>
        </step>
        <step>
            <Path>composeApp/build.gradle.kts</Path>
            に移動し、以下の依存関係を追加します。
            <code-block lang="kotlin" code="kotlin {&#10;&#10;    //...&#10;    sourceSets {&#10;        val desktopMain by getting&#10;        &#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.core)&#10;            implementation(libs.ktor.client.content.negotiation)&#10;            implementation(libs.ktor.serialization.kotlinx.json)&#10;        }&#10;        desktopMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(libs.ktor.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(libs.ktor.client.wasm)&#10;        }&#10;    }&#10;}"/>
            <p>
                これが完了すると、Ktorクライアントの薄いラッパーとして機能する
                <code>TaskApi</code>型をクライアントに追加できます。
            </p>
        </step>
        <step>
            メインメニューの<ui-path>ビルド | Gradleファイルとプロジェクトを同期</ui-path>
            を選択して、ビルドファイルの変更をインポートします。
        </step>
        <step>
            <Path>composeApp/src/commonMain/kotlin/com/example/ktor/full_stack_task_manager</Path>
            に移動し、
            <Path>network</Path>
            という新しいパッケージを作成します。
        </step>
        <step>
            <p>
                新しいパッケージ内に、クライアント構成用の新しい
                <Path>HttpClientManager.kt</Path>
                を作成します。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot;&#10;        port = 8080&#10;    }&#10;}"/>
            <p>
                <code>1.2.3.4</code>を現在のマシンのIPアドレスに置き換える必要があることに注意してください。Android Virtual Deviceまたは
                iOSシミュレーターで実行されているコードから<code>0.0.0.0</code>または<code>localhost</code>への呼び出しはできません。
                <!-- should we include instructions on finding out the IP address?
                     `ipconfig getifaddr en0`or something -->
            </p>
        </step>
        <step>
            <p>
                同じ
                <Path>composeApp/.../full_stack_task_manager/network</Path>
                パッケージ内に、以下の実装を含む新しい
                <Path>TaskApi.kt</Path>
                ファイルを作成します。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager.network&#10;&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>commonMain/.../App.kt</Path>
                に移動し、既存のAppコンポーザブルを以下の実装に置き換えます。
                これにより、<code>TaskApi</code>型を使用してサーバーからタスクのリストを取得し、各タスクの名前を列に表示します。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                サーバーが実行されている間に、<ui-path>iosApp</ui-path>実行構成を実行してiOSアプリケーションをテストします。
            </p>
        </step>
        <step>
            <p>
                <control>Fetch Tasks</control>
                ボタンをクリックしてタスクのリストを表示します。
                <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                     alt="iOSで実行されているアプリ" width="363" border-effect="rounded"/>
            </p>
            <note>
                このデモでは、分かりやすさのためにプロセスを簡素化しています。実際のアプリケーションでは、暗号化されていないデータをネットワーク経由で送信しないことが重要です。
            </note>
        </step>
        <step>
            <p>
                Androidプラットフォームでは、アプリケーションに明示的にネットワーク権限を与え、クリアテキストでのデータ送受信を許可する必要があります。これらの権限を有効にするには
                <Path>composeApp/src/androidMain/AndroidManifest.xml</Path>
                を開き、以下の設定を追加します。
            </p>
            <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
        </step>
        <step>
            <p>
                <ui-path>composeApp</ui-path>実行構成を使用してAndroidアプリケーションを実行します。
                これでAndroidクライアントも実行されるはずです。
                <img style="block" src="full_stack_development_tutorial_run_android.png"
                     alt="Androidで実行されているアプリ" width="350" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                デスクトップクライアントの場合、コンテナウィンドウに寸法とタイトルを割り当てる必要があります。
                <Path>composeApp/src/desktopMain/.../main.kt</Path>
                ファイルを開き、<code>title</code>を変更し、<code>state</code>プロパティを設定してコードを修正します。
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <ui-path>composeApp [desktop]</ui-path>実行構成を使用してデスクトップアプリケーションを実行します。
                <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                     alt="デスクトップで実行されているアプリ" width="400" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                <ui-path>composeApp [wasmJs]</ui-path>実行構成を使用してWebクライアントを実行します。
            </p>
            <img style="block" src="full_stack_development_tutorial_run_web.png"
                 alt="デスクトップで実行されているアプリ" width="400" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="UIを改善する" id="improve-ui">
    <p>
        クライアントはサーバーと通信するようになりましたが、これは魅力的なUIとは言えません。
    </p>
    <procedure id="improve-ui-procedure">
        <step>
            <p>
                <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
                にある
                <Path>App.kt</Path>
                ファイルを開き、既存の<code>App</code>を以下の<code>App</code>および<code>TaskCard</code>
                コンポーザブルに置き換えます。
            </p>
            <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor.full_stack_task_manager&#10;&#10;import com.example.ktor.full_stack_task_manager.network.TaskApi&#10;import com.example.ktor.full_stack_task_manager.model.Priority&#10;import com.example.ktor.full_stack_task_manager.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.full_stack_task_manager.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    この実装により、クライアントはいくつかの基本的な機能を持つことになります。
                </p>
                <p>
                    <code>LaunchedEffect</code>型を使用することで、すべてのタスクが起動時にロードされ、<code>LazyColumn</code>
                    コンポーザブルによりユーザーはタスクをスクロールできるようになります。
                </p>
                <p>
                    最後に、独立した<code>TaskCard</code>コンポーザブルが作成され、それが
                    <code>Card</code>を使用して各<code>Task</code>の詳細を表示します。タスクを削除および更新するためのボタンが追加されました。
                </p>
            </step>
            <step>
                <p>
                    クライアントアプリケーション（例: Androidアプリ）を再実行します。
                    これで、タスクをスクロールしたり、詳細を表示したり、削除したりできるようになります。
                    <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                         alt="UIが改善されたAndroidで実行されているアプリ" width="350" border-effect="rounded"/>
                </p>
            </step>
        </procedure>
    </chapter>
<chapter title="更新機能を追加する" id="add-update-functionality">
    <p>
        クライアントを完成させるために、タスクの詳細を更新できるようにする機能を組み込みます。
    </p>
    <procedure id="add-update-func-procedure">
        <step>
            <Path>composeApp/src/commonMain/.../full_stack_task_manager</Path>
            にある
            <Path>App.kt</Path>
            ファイルに移動します。
        </step>
        <step>
            <p>
                以下に示すように、<code>UpdateTaskDialog</code>コンポーザブルと必要なインポートを追加します。
            </p>
            <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    これは、ダイアログボックスで<code>Task</code>の詳細を表示するコンポーザブルです。<code>description</code>
                    と<code>priority</code>は<code>TextField</code>コンポーザブル内に配置され、更新できるようになっています。ユーザーが更新ボタンを押すと、<code>onConfirm()</code>コールバックがトリガーされます。
                </p>
            </step>
            <step>
                <p>
                    同じファイル内の<code>App</code>コンポーザブルを更新します。
                </p>
                <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
                <p>
                    現在選択されているタスクという追加の状態を保存しています。この値がnullでない場合、
                    <code>TaskApi</code>を使用してサーバーにPOSTリクエストを送信するように<code>onConfirm()</code>コールバックを設定した
                    <code>UpdateTaskDialog</code>コンポーザブルを呼び出します。
                </p>
                <p>
                    最後に、<code>TaskCard</code>コンポーザブルを作成するときに、<code>onUpdate()</code>コールバックを使用して<code>currentTask</code>状態変数を設定します。
                </p>
            </step>
            <step>
                クライアントアプリケーションを再実行します。これで、ボタンを使用して各タスクの詳細を更新できるようになります。
                <img style="block" src="full_stack_development_tutorial_update_task.gif"
                     alt="Androidでタスクを削除する" width="350" border-effect="rounded"/>
            </step>
        </procedure>
    </chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        この記事では、Kotlin MultiplatformアプリケーションのコンテキストでKtorを使用しました。これで、複数のサービスとクライアントを含むプロジェクトを作成し、さまざまなプラットフォームをターゲットにできるようになります。
    </p>
    <p>
        ご覧のとおり、コードの重複や冗長性なしに機能を構築することが可能です。プロジェクトのすべてのレイヤーで必要な型は、
        <Path>shared</Path>
        マルチプラットフォームモジュール内に配置できます。サービスにのみ必要な機能は
        <Path>server</Path>
        モジュールに、クライアントにのみ必要な機能は
        <Path>composeApp</Path>
        に配置されます。
    </p>
    <p>
        この種の開発は、必然的にクライアントとサーバーの両方のテクノロジーに関する知識を必要とします。しかし、<a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
        Multiplatform</a>ライブラリと<a href="https://www.jetbrains.com/lp/compose-multiplatform/">
        Compose Multiplatform</a>を使用することで、学習する必要がある新しい材料の量を最小限に抑えることができます。たとえ最初の焦点が単一のプラットフォームのみであったとしても、アプリケーションの需要が高まるにつれて、他のプラットフォームを簡単に追加できます。
    </p>
</chapter>