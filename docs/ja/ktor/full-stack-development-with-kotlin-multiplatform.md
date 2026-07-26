<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       title="Kotlin Multiplatformでフルスタックアプリケーションを構築する" id="full-stack-development-with-kotlin-multiplatform">
<show-structure for="chapter, procedure" depth="2"/>
<web-summary>
    KotlinとKtorを使用して、クロスプラットフォームのフルスタックアプリケーションを開発する方法を学びます。このチュートリアルでは、Kotlin Multiplatformを使用してAndroid、iOS、デスクトップ向けにビルドし、Ktorを使用してデータを簡単に処理する方法を紹介します。
</web-summary>
<link-summary>
    KotlinとKtorを使用して、クロスプラットフォームのフルスタックアプリケーションを開発する方法を学びます。
</link-summary>
<card-summary>
    KotlinとKtorを使用して、クロスプラットフォームのフルスタックアプリケーションを開発する方法を学びます。
</card-summary>
<tldr>
    <var name="example_name" value="full-stack-task-manager"/>
    <p>
        <b>コード例</b>:
        <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
            %example_name%
        </a>
    </p>
    <p>
        <b>使用されているプラグイン</b>: <Links href="//server-routing" summary="Routingは、サーバーアプリケーションで受信リクエストを処理するためのコアプラグインです。">Routing</Links>、
        <a href="https://kotlinlang.org/api/kotlinx.serialization/">kotlinx.serialization</a>、
        <Links href="//server-serialization" summary="ContentNegotiationプラグインは、クライアントとサーバー間のメディアタイプの交渉と、特定の形式でのコンテンツのシリアライズ/デシリアライズという2つの主要な目的を果たします。">Content Negotiation</Links>、
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>、
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin Multiplatform</a>
    </p>
</tldr>
<p>
    この記事では、Android、iOS、Web、デスクトップの各プラットフォームで動作し、Ktorを活用してシームレスなデータ処理を行うフルスタックアプリケーションをKotlinで開発する方法を学びます。
</p>
<p>このチュートリアルの終わりまでに、以下のことができるようになります：</p>
<list>
    <li><a
            href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">
        Kotlin Multiplatform</a>を使用してフルスタックアプリケーションを作成する。
    </li>
    <li>IntelliJ IDEAで生成されたプロジェクトの構造を理解する。</li>
    <li>Ktorサービスを呼び出す<a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>クライアントを作成する。
    </li>
    <li>設計の異なるレイヤー間で共有型を再利用する。</li>
    <li>マルチプラットフォームライブラリを正しく導入し、設定する。</li>
</list>
<p>
    これまでのチュートリアルでは、タスクマネージャーの例を使用して、
    <Links href="//server-requests-and-responses" summary="KotlinとKtorでタスクマネージャーアプリケーションを構築することで、ルーティング、リクエスト処理、パラメータの基本を学びます。">リクエストの処理</Links>、
    <Links href="//server-create-restful-apis" summary="KotlinとKtorを使用して、JSONファイルを生成するRESTful APIの例を含むバックエンドサービスの構築方法を学びます。">RESTful APIの作成</Links>、
    <Links href="//server-integrate-database" summary="Exposed SQLライブラリを使用して、Ktorサービスをデータベースリポジトリに接続するプロセスを学びます。">Exposedによるデータベースの統合</Links>を行いました。
    Ktorの基礎学習に集中できるよう、クライアントアプリケーションは可能な限り最小限に抑えられていました。
</p>
<p>
    今回は、Android、iOS、Web、デスクトップのプラットフォームを対象としたクライアントを作成し、Ktorサービスを使用して表示するデータを取得します。可能な限りクライアントとサーバー間でデータ型を共有することで、開発をスピードアップし、エラーの可能性を減らします。
</p>
<chapter title="前提条件" id="prerequisites">
    <p>
        これまでの記事と同様に、IDEとしてIntelliJ IDEAを使用します。環境のインストールと設定については、
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/quickstart.html">
            Kotlin Multiplatform クイックスタート
        </a>
        を参照してください。
    </p>
    <p>
        Compose Multiplatformを初めて使用する場合は、このチュートリアルを開始する前に
        <a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-getting-started.html">
            Compose Multiplatformを始める
        </a>
        チュートリアルを完了することをお勧めします。タスクの複雑さを軽減するために、単一のクライアントプラットフォームに集中することもできます。例えば、iOSを使用したことがない場合は、デスクトップまたはAndroidの開発に集中するのが賢明かもしれません。
    </p>
</chapter>
<chapter title="新しいプロジェクトを作成する" id="create-project">
    <p>
        Ktorプロジェクトジェネレーターの代わりに、IntelliJ IDEAのKotlin Multiplatformプロジェクトウィザードを使用します。
        これにより、クライアントとサービスを追加して拡張できる基本的なマルチプラットフォームプロジェクトが作成されます。クライアントはSwiftUIなどのネイティブUIライブラリを使用することもできますが、このチュートリアルでは
        <a href="https://www.jetbrains.com/lp/compose-multiplatform/">Compose Multiplatform</a>を使用して、すべてのプラットフォームで共通の共有UIを作成します。
    </p>
    <procedure id="generate-project">
        <step>
            IntelliJ IDEAを起動します。
        </step>
        <step>
            IntelliJ IDEAで
            <ui-path>File | New | Project</ui-path>
            を選択します。
        </step>
        <step>
            左側のパネルで
            <ui-path>Kotlin Multiplatform</ui-path>
            を選択します。
        </step>
        <step>
            <ui-path>New Project</ui-path>
            ウィンドウで以下のフィールドを指定します：
            <list>
                <li>
                    <ui-path>Name</ui-path>
                    : full-stack-task-manager
                </li>
                <li>
                    <ui-path>Project ID</ui-path>
                    : com.example.ktor
                </li>
            </list>
        </step>
        <step>
            <p>
                ターゲットプラットフォームとして
                <ui-path>Android</ui-path>、
                <ui-path>Desktop</ui-path>、
                <ui-path>Web</ui-path>、
                <ui-path>Server</ui-path>
                を選択します。
            </p>
        </step>
        <step>
            <p>
                Macを使用している場合は、
                <ui-path>iOS</ui-path>
                も選択してください。
                <ui-path>Share UI</ui-path>
                オプションが選択されていることを確認してください。
                <img style="block" src="full_stack_development_tutorial_create_project.png"
                     alt="Kotlin Multiplatformウィザードの設定" width="706" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                <control>Create</control>
                ボタンをクリックし、IDEがプロジェクトを生成してインポートするまで待ちます。
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="サービスを実行する" id="run-service">
    <procedure id="run-service-procedure">
        <step>
            IntelliJ IDEAで
            <Path>ApplicationKt</Path>
            実行構成を選択します。
            <img src="full_stack_development_tutorial_server_run_configuration.png"
                 alt="実行とデバッグのウィンドウ" width="300"
                 border-effect="line" style="block"/>
        </step>
        <step>
            <ui-path>実行</ui-path>
            ボタン
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEAの実行アイコン"/>)
            をクリックして構成を実行します。
            <p>
                <ui-path>実行</ui-path>
                ツールウィンドウに新しいタブが開きます。
            </p>
        </step>
        <step>
            <p>
                ブラウザで <a href="http://0.0.0.0:8080/">http://0.0.0.0:8080/</a> にアクセスしてアプリケーションを開きます。
                ブラウザにKtorからのメッセージが表示されるはずです。
                <img src="full_stack_development_tutorial_run.png"
                     alt="ブラウザに表示されたKtorサーバーのレスポンス" width="706"
                     border-effect="rounded" style="block"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="プロジェクトを詳しく見る" id="examine-project">
    <p>
        <Path>server</Path>
        フォルダーは、プロジェクト内にある3つのKotlinモジュールの1つです。残りの2つは
        <Path>core</Path>
        と
        <Path>app</Path>
        です。
    </p>
    <p>
        <Path>server</Path>
        モジュールの構造は、<a href="https://start.ktor.io/">Ktorプロジェクトジェネレーター</a>で生成されたものと非常によく似ています。
        プラグインと依存関係を宣言するための専用のビルドファイルがあり、Ktorサービスをビルドして起動するためのコードを含むソースセットがあります：
    </p>
    <img src="full_stack_development_tutorial_server_folder.png"
         alt="Kotlin Multiplatformプロジェクト内のserverフォルダーの内容" width="300"
         border-effect="line"/>
    <p>
        <Path>Application.kt</Path>
        ファイル内のルーティング手順を見ると、<code>sayHello()</code>関数の呼び出しがあることがわかります：
    </p>
    <code-block lang="kotlin" code="            fun Application.module() {&#10;                routing {&#10;                    get(&quot;/&quot;) {&#10;                        call.respondText(sayHello(&quot;Ktor&quot;))&#10;                    }&#10;                }&#10;            }"/>
    <p>
        <code>sayHello()</code>関数は
        <Path>core</Path>
        モジュールで定義されています。ここには、サーバーとすべての異なるクライアントプラットフォーム間で共有される共通コードを配置します。
    </p>
    <p>
       <Path>app/shared/src/commonMain</Path> モジュール内の <Path>Greeting.kt</Path> ファイルを開くと、そこでも
        <code>sayHello()</code> 関数が使用されていることがわかります：
    </p>
    <code-block lang="kotlin" code="            class Greeting {&#10;                private val platform = getPlatform()&#10;&#10;                fun greet(): String {&#10;                    return sayHello(platform.name)&#10;                }&#10;            }"/>
    <p>
        <Path>app</Path> モジュールには以下のサブモジュールが含まれています：
    </p>
    <list>
        <li>
            <Path>androidApp</Path>、<Path>desktopApp</Path>、<Path>iosApp</Path>、<Path>webApp</Path> サブモジュールには、それぞれ Android、デスクトップ、iOS、Web クライアントアプリ用のプラットフォーム固有のコードが含まれています。現時点では、これらのクライアントアプリはいずれも Ktor サービスにリンクされていません。
        </li>
        <li>
            <p>
                <Path>shared</Path>
                サブモジュールには、クライアントを提供したい各プラットフォーム用のソースセットが含まれています。これは、
                <Path>commonMain</Path>
                内で宣言された型が、ターゲットプラットフォームによって異なる機能を必要とするためです。
            </p>
            <p>
                たとえば、<code>Greeting</code> 型では、<a
                    href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-connect-to-apis.html">期待宣言と実効宣言 (expected and actual declarations)</a> を通じて、プラットフォーム固有の API を使用して現在のプラットフォームの名前を取得します。
            </p>
            <p>
                <Path>shared</Path>
                サブモジュールの
                <Path>commonMain</Path>
                ソースセットでは、<code>getPlatform()</code> 関数が <code>expect</code> キーワードとともに宣言されています：
            </p>
            <Tabs>
                <TabItem title="commonMain/Platform.kt" id="commonMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;interface Platform {&#10;    val name: String&#10;}&#10;&#10;expect fun getPlatform(): Platform"/>
                </TabItem>
            </Tabs>
            <p>
                次に、以下に示すように、各ターゲットプラットフォームが <code>getPlatform()</code> 関数の <code>actual</code> 宣言を提供します：
            </p>
            <Tabs>
                <TabItem title="Platform.ios.kt" id="iosMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import platform.UIKit.UIDevice&#10;&#10;class IOSPlatform : Platform {&#10;    override val name: String = UIDevice.currentDevice.systemName() + &quot; &quot; + UIDevice.currentDevice.systemVersion&#10;}&#10;&#10;actual fun getPlatform(): Platform = IOSPlatform()"/>
                </TabItem>
                <TabItem title="Platform.android.kt" id="androidMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import android.os.Build&#10;&#10;class AndroidPlatform : Platform {&#10;    override val name: String = &quot;Android ${Build.VERSION.SDK_INT}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = AndroidPlatform()"/>
                </TabItem>
                <TabItem title="Platform.jvm.kt" id="jvmMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class JVMPlatform : Platform {&#10;    override val name: String = &quot;Java ${System.getProperty(&quot;java.version&quot;)}&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = JVMPlatform()"/>
                </TabItem>
                <TabItem title="Platform.wasmJs.kt" id="wasmJsMain">
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;class WasmPlatform : Platform {&#10;    override val name: String = &quot;Web with Kotlin/Wasm&quot;&#10;}&#10;&#10;actual fun getPlatform(): Platform = WasmPlatform()"/>
                </TabItem>
            </Tabs>
        </li>
    </list>
</chapter>
<chapter title="クライアントアプリケーションを実行する" id="run-client-app">
    <p>
        ターゲットの実行構成を実行することで、クライアントアプリケーションを起動できます。iOSシミュレーターでアプリケーションを実行するには、以下の手順に従ってください：
    </p>
    <procedure id="run-ios-app-procedure">
        <step>
            IntelliJ IDEAで、
            <Path>iosApp</Path>
            の実行構成とシミュレートされたデバイスを選択します。
            <img src="full_stack_development_tutorial_run_configurations.png"
                 alt="実行とデバッグのウィンドウ" width="400"
                 border-effect="line" style="block"/>
        </step>
        <step>
            <ui-path>実行</ui-path>
            ボタン
            (<img src="intellij_idea_run_icon.svg"
                  style="inline" height="16" width="16"
                  alt="IntelliJ IDEAの実行アイコン"/>)
            をクリックして構成を実行します。
        </step>
        <step>
            <p>
                iOSアプリを実行すると、バックグラウンドでXcodeを使用してビルドされ、iOSシミュレーターで起動されます。
                アプリには、クリックで画像を切り替えるボタンが表示されます。
                <img style="block" src="full_stack_development_tutorial_run_ios.gif"
                     alt="iOSシミュレーターでのアプリの実行" width="300" border-effect="rounded"/>
            </p>
            <p>
                ボタンが初めて押されると、現在のプラットフォームの詳細がそのテキストに追加されます。これを実現するコードは
                <Path>app/shared/src/commonMain/kotlin/com/example/ktor/App.kt</Path>
                にあります：
            </p>
            <code-block lang="kotlin" code="                @Composable&#10;                @Preview&#10;                fun App() {&#10;                    MaterialTheme {&#10;                        var showContent by remember { mutableStateOf(false) }&#10;                        Column(&#10;                            modifier = Modifier&#10;                                .background(MaterialTheme.colorScheme.primaryContainer)&#10;                                .safeContentPadding()&#10;                                .fillMaxSize(),&#10;                            horizontalAlignment = Alignment.CenterHorizontally,&#10;                        ) {&#10;                            Button(onClick = { showContent = !showContent }) {&#10;                                Text(&quot;Click me!&quot;)&#10;                            }&#10;                            AnimatedVisibility(showContent) {&#10;                                val greeting = remember { Greeting().greet() }&#10;                                Column(&#10;                                    modifier = Modifier.fillMaxWidth(),&#10;                                    horizontalAlignment = Alignment.CenterHorizontally,&#10;                                ) {&#10;                                    Image(painterResource(Res.drawable.compose_multiplatform), null)&#10;                                    Text(&quot;Compose: $greeting&quot;)&#10;                                }&#10;                            }&#10;                        }&#10;                    }&#10;                }"/>
            <p>
                これはコンポーザブル関数であり、この記事の後半で修正します。現時点で重要なのは、これがUIを表示し、共有された <code>Greeting</code> 型を利用しているということです。そして、この型は共通の <code>Platform</code> インターフェースを実装するプラットフォーム固有のクラスを使用しています。
            </p>
        </step>
    </procedure>
    <p>
        生成されたプロジェクトの構造を理解したところで、タスクマネージャーの機能を段階的に追加していきましょう。
    </p>
</chapter>
<chapter title="モデル型を追加する" id="add-model-types">
    <p>
        まず、モデル型を追加し、クライアントとサーバーの両方からアクセスできるようにします。
    </p>
    <procedure id="add-model-types-procedure">
        <step>
            <Path>gradle/libs.versions.toml</Path>
            に移動し、以下の <code>kotlinx.serialization</code> 依存関係を定義します：
            <code-block lang="toml" code="[versions]&#10;kotlinx-serialization-json = &quot;1.11.0&quot;&#10;&#10;[libraries]&#10;kotlinx-serialization-json = { module = &quot;org.jetbrains.kotlinx:kotlinx-serialization-json&quot;, version.ref = &quot;kotlinx-serialization-json&quot; }&#10;&#10;[plugins]&#10;kotlinSerialization = { id = &quot;org.jetbrains.kotlin.plugin.serialization&quot;, version.ref = &quot;kotlin&quot; }"/>
        </step>
        <step>
            <p>
                <Path>core/build.gradle.kts</Path>
                に移動し、シリアライズプラグインを追加します：
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    //...&#10;    alias(libs.plugins.kotlinSerialization)&#10;}"/>
        </step>
        <step>
            <p>
                同じファイル内の
                <Path>commonMain</Path>
                ソースセットに新しい依存関係を追加します：
            </p>
            <code-block lang="kotlin" code="    sourceSets {&#10;        commonMain.dependencies {&#10;            // Multiplatformの依存関係をここに記述します&#10;            implementation(libs.kotlinx.serialization.json)&#10;        }&#10;        //...&#10;    }"/>
        </step>
        <step>
            IntelliJ IDEAで、
            <ui-path>Build | Sync Project with Gradle Files</ui-path>
            を選択して更新を適用します。Gradleのインポートが完了すると、
            <Path>Task.kt</Path>
            ファイルが正常にコンパイルされるようになります。
        </step>
        <step>
            <Path>core/src/commonMain/kotlin/com/example/ktor</Path>
            に移動し、
            <Path>model</Path>
            という名前の新しいパッケージを作成します。
        </step>
        <step>
            新しいパッケージの中に、
            <Path>Task.kt</Path>
            という名前の新しいファイルを作成します。
        </step>
        <step>
            <p>
                優先度を表す列挙型（enum）と、タスクを表すクラスを追加します。
                <code>Task</code>
                クラスは、<code>kotlinx.serialization</code>
                ライブラリの <code>Serializable</code> 型でアノテーションされています：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;import kotlinx.serialization.Serializable&#10;&#10;enum class Priority {&#10;    Low, Medium, High, Vital&#10;}&#10;&#10;@Serializable&#10;data class Task(&#10;    val name: String,&#10;    val description: String,&#10;    val priority: Priority&#10;)"/>
        </step>
    </procedure>
</chapter>
<chapter title="サーバーを作成する" id="create-server">
    <p>
        次の段階は、タスクマネージャーのサーバー実装を作成することです。
    </p>
    <procedure id="create-server-procedure">
        <step>
            <Path>server/src/main/kotlin/com/example/ktor</Path>
            フォルダーに移動し、
            <Path>model</Path>
            というサブパッケージを作成します。
        </step>
        <step>
            <p>
                このパッケージ内に、新しい
                <Path>TaskRepository.kt</Path>
                ファイルを作成し、リポジトリ用の以下のインターフェースを追加します：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;interface TaskRepository {&#10;    fun allTasks(): List&lt;Task&gt;&#10;    fun tasksByPriority(priority: Priority): List&lt;Task&gt;&#10;    fun taskByName(name: String): Task?&#10;    fun addOrUpdateTask(task: Task)&#10;    fun removeTask(name: String): Boolean&#10;}"/>
        </step>
        <step>
            <p>
                同じパッケージ内に、以下のクラスを含む
                <Path>InMemoryTaskRepository.kt</Path>
                という新しいファイルを作成します：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.model&#10;&#10;class InMemoryTaskRepository : TaskRepository {&#10;    private var tasks = listOf(&#10;        Task(&quot;Cleaning&quot;, &quot;Clean the house&quot;, Priority.Low),&#10;        Task(&quot;Gardening&quot;, &quot;Mow the lawn&quot;, Priority.Medium),&#10;        Task(&quot;Shopping&quot;, &quot;Buy the groceries&quot;, Priority.High),&#10;        Task(&quot;Painting&quot;, &quot;Paint the fence&quot;, Priority.Low),&#10;        Task(&quot;Cooking&quot;, &quot;Cook the dinner&quot;, Priority.Medium),&#10;        Task(&quot;Relaxing&quot;, &quot;Take a walk&quot;, Priority.High),&#10;        Task(&quot;Exercising&quot;, &quot;Go to the gym&quot;, Priority.Low),&#10;        Task(&quot;Learning&quot;, &quot;Read a book&quot;, Priority.Medium),&#10;        Task(&quot;Snoozing&quot;, &quot;Go for a nap&quot;, Priority.High),&#10;        Task(&quot;Socializing&quot;, &quot;Go to a party&quot;, Priority.High)&#10;    )&#10;&#10;    override fun allTasks(): List&lt;Task&gt; = tasks&#10;&#10;    override fun tasksByPriority(priority: Priority) = tasks.filter {&#10;        it.priority == priority&#10;    }&#10;&#10;    override fun taskByName(name: String) = tasks.find {&#10;        it.name.equals(name, ignoreCase = true)&#10;    }&#10;&#10;    override fun addOrUpdateTask(task: Task) {&#10;        var notFound = true&#10;&#10;        tasks = tasks.map {&#10;            if (it.name == task.name) {&#10;                notFound = false&#10;                task&#10;            } else {&#10;                it&#10;            }&#10;        }&#10;        if (notFound) {&#10;            tasks = tasks.plus(task)&#10;        }&#10;    }&#10;&#10;    override fun removeTask(name: String): Boolean {&#10;        val oldTasks = tasks&#10;        tasks = tasks.filterNot { it.name == name }&#10;        return oldTasks.size &gt; tasks.size&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>server/src/main/kotlin/.../Application.kt</Path>
                に移動し、既存のコードを以下の実装に置き換えます：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.model.InMemoryTaskRepository&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import io.ktor.http.*&#10;import io.ktor.serialization.*&#10;import io.ktor.serialization.kotlinx.json.*&#10;import io.ktor.server.application.*&#10;import io.ktor.server.engine.*&#10;import io.ktor.server.netty.*&#10;import io.ktor.server.plugins.contentnegotiation.*&#10;import io.ktor.server.plugins.cors.routing.*&#10;import io.ktor.server.request.*&#10;import io.ktor.server.response.*&#10;import io.ktor.server.routing.*&#10;&#10;fun main() {&#10;    embeddedServer(Netty, port = 8080, host = &quot;0.0.0.0&quot;, module = Application::module)&#10;        .start(wait = true)&#10;}&#10;&#10;fun Application.module() {&#10;    install(ContentNegotiation) {&#10;        json()&#10;    }&#10;    install(CORS) {&#10;        allowHeader(HttpHeaders.ContentType)&#10;        allowMethod(HttpMethod.Delete)&#10;        // デモンストレーションを容易にするため、すべての接続を許可しています。&#10;        // 本番環境ではこのようにしないでください。&#10;        anyHost()&#10;    }&#10;    val repository = InMemoryTaskRepository()&#10;&#10;    routing {&#10;        route(&quot;/tasks&quot;) {&#10;            get {&#10;                val tasks = repository.allTasks()&#10;                call.respond(tasks)&#10;            }&#10;            get(&quot;/byName/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                val task = repository.taskByName(name)&#10;                if (task == null) {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                    return@get&#10;                }&#10;                call.respond(task)&#10;            }&#10;            get(&quot;/byPriority/{priority}&quot;) {&#10;                val priorityAsText = call.parameters[&quot;priority&quot;]&#10;                if (priorityAsText == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@get&#10;                }&#10;                try {&#10;                    val priority = Priority.valueOf(priorityAsText)&#10;                    val tasks = repository.tasksByPriority(priority)&#10;&#10;&#10;                    if (tasks.isEmpty()) {&#10;                        call.respond(HttpStatusCode.NotFound)&#10;                        return@get&#10;                    }&#10;                    call.respond(tasks)&#10;                } catch (ex: IllegalArgumentException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            post {&#10;                try {&#10;                    val task = call.receive&lt;Task&gt;()&#10;                    repository.addOrUpdateTask(task)&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } catch (ex: IllegalStateException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                } catch (ex: JsonConvertException) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                }&#10;            }&#10;            delete(&quot;/{taskName}&quot;) {&#10;                val name = call.parameters[&quot;taskName&quot;]&#10;                if (name == null) {&#10;                    call.respond(HttpStatusCode.BadRequest)&#10;                    return@delete&#10;                }&#10;                if (repository.removeTask(name)) {&#10;                    call.respond(HttpStatusCode.NoContent)&#10;                } else {&#10;                    call.respond(HttpStatusCode.NotFound)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                この実装は以前のチュートリアルと非常によく似ていますが、簡略化のためにすべてのルーティングコードを <code>Application.module()</code> 関数内に配置している点が異なります。
            </p>
            <p>
                このコードを入力してインポートを追加すると、複数のコンパイルエラーが発生します。これは、Webクライアントとの対話に必要な <Links href="//server-cors" summary="必須の依存関係: io.ktor:%artifact_name%">CORS</Links> プラグインなど、依存関係として含める必要がある複数のKtorプラグインをコードが使用しているためです。
            </p>
        </step>
        <step>
            <Path>gradle/libs.versions.toml</Path>
            ファイルを開き、以下のライブラリを定義します：
            <code-block lang="toml" code="[libraries]&#10;ktor-serialization-kotlinx-json-jvm = { module = &quot;io.ktor:ktor-serialization-kotlinx-json-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-content-negotiation-jvm = { module = &quot;io.ktor:ktor-server-content-negotiation-jvm&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-server-cors-jvm = { module = &quot;io.ktor:ktor-server-cors-jvm&quot;, version.ref = &quot;ktor&quot; }"/>
        </step>
        <step>
            <p>
                サーバーモジュールのビルドファイル（
                <Path>server/build.gradle.kts</Path>
                ）を開き、以下の依存関係を追加します：
            </p>
            <code-block lang="kotlin" code="dependencies {&#10;    //...&#10;    implementation(libs.ktor.serialization.kotlinx.json-jvm)&#10;    implementation(libs.ktor.server.content-negotiation-jvm)&#10;    implementation(libs.ktor.server.cors-jvm)&#10;}"/>
        </step>
        <step>
            もう一度、メインメニューから <ui-path>Build | Sync Project with Gradle Files</ui-path> を実行します。
            インポートが完了すると、<code>ContentNegotiation</code> 型と <code>json()</code> 関数のインポートが正しく機能するはずです。
        </step>
        <step>
            サーバーを再起動します。ブラウザからルートにアクセスできることが確認できるはずです。
        </step>
        <step>
            <p>
                <a href="http://0.0.0.0:8080/tasks"></a>
                および <a href="http://0.0.0.0:8080/tasks/byPriority/Medium"></a>
                にアクセスして、JSON形式のタスクが含まれるサーバーレスポンスを確認します。
                <img style="block" src="full_stack_development_tutorial_run_server.gif"
                     width="707" border-effect="rounded" alt="ブラウザでのサーバーレスポンス"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="クライアントを作成する" id="create-client">
    <p>
        クライアントがサーバーにアクセスできるようにするには、Ktor Clientを含める必要があります。これには以下の3種類の依存関係が関係します：
    </p>
    <list>
        <li>Ktor Clientのコア機能。</li>
        <li>ネットワーク処理を行うプラットフォーム固有のエンジン。</li>
        <li>コンテンツ交渉とシリアライズのサポート。</li>
    </list>
    <procedure id="create-client-procedure">
        <step>
            <Path>gradle/libs.versions.toml</Path>
            ファイルに、以下のライブラリを追加します：
            <code-block lang="toml" code="[libraries]&#10;ktor-client-android = { module = &quot;io.ktor:ktor-client-android&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-cio = { module = &quot;io.ktor:ktor-client-cio&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-content-negotiation = { module = &quot;io.ktor:ktor-client-content-negotiation&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-core = { module = &quot;io.ktor:ktor-client-core&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-darwin = { module = &quot;io.ktor:ktor-client-darwin&quot;, version.ref = &quot;ktor&quot; }&#10;ktor-client-wasm = { module = &quot;io.ktor:ktor-client-js-wasm-js&quot;, version.ref = &quot;ktor&quot;}&#10;ktor-serialization-kotlinx-json = { module = &quot;io.ktor:ktor-serialization-kotlinx-json&quot;, version.ref = &quot;ktor&quot; }"/>
        </step>
        <step>
            <Path>app/shared/build.gradle.kts</Path>
            に移動し、以下の依存関係を追加します：
            <code-block lang="kotlin" code="kotlin {&#10;    //...&#10;    sourceSets {&#10;        androidMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.android)&#10;        }&#10;        commonMain.dependencies {&#10;            //...&#10;            implementation(libs.ktor.client.core)&#10;            implementation(libs.ktor.client.content-negotiation)&#10;            implementation(libs.ktor.serialization.kotlinx.json)&#10;        }&#10;        jvmMain.dependencies {&#10;            implementation(libs.ktor.client.cio)&#10;        }&#10;        iosMain.dependencies {&#10;            implementation(libs.ktor.client.darwin)&#10;        }&#10;        wasmJsMain.dependencies {&#10;            implementation(libs.ktor.client.wasm)&#10;        }&#10;    }&#10;}"/>
            <p>
                これが完了したら、Ktor Clientの薄いラッパーとして機能する <code>TaskApi</code> 型をクライアントに追加できます。
            </p>
        </step>
        <step>
            メインメニューから <ui-path>Build | Sync Project with Gradle Files</ui-path> を選択して、ビルドファイルの変更をインポートします。
        </step>
        <step>
            <Path>app/shared/src/commonMain/kotlin/com/example/ktor</Path>
            に移動し、
            <Path>network</Path>
            という新しいパッケージを作成します。
        </step>
        <step>
            <p>
                新しいパッケージの中に、クライアント設定用の新しい
                <Path>HttpClientManager.kt</Path>
                ファイルを作成します：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.plugins.contentnegotiation.ContentNegotiation&#10;import io.ktor.client.plugins.defaultRequest&#10;import io.ktor.serialization.kotlinx.json.json&#10;import kotlinx.serialization.json.Json&#10;&#10;fun createHttpClient() = HttpClient {&#10;    install(ContentNegotiation) {&#10;        json(Json {&#10;            encodeDefaults = true&#10;            isLenient = true&#10;            coerceInputValues = true&#10;            ignoreUnknownKeys = true&#10;        })&#10;    }&#10;    defaultRequest {&#10;        host = &quot;1.2.3.4&quot; // 現在のマシンのIPアドレスに置き換えてください。&#10;        port = 8080&#10;    }&#10;}"/>
            <p>
                <code>1.2.3.4</code> を現在のマシンのIPアドレスに置き換えてください。Android仮想デバイスやiOSシミュレーター上で動作するコードからは、<code>0.0.0.0</code> や <code>localhost</code> への呼び出しを行うことはできません。
            </p>
            <tip>
                <p><b>IPアドレスの確認方法:</b></p>
                <p>
                    モバイルシミュレーターは <code>localhost</code> にアクセスできないため、マシンの実際のIPアドレスが必要です。IPアドレスを確認するには、以下のいずれかのコマンドを実行してください：
                </p>
                <list>
                    <li><b>macOS:</b> <code>ifconfig | grep "inet " | grep -v 127.0.0.1</code></li>
                    <li><b>Linux:</b> <code>hostname -I | awk '{print $1}'</code></li>
                    <li><b>Windows:</b> <code>ipconfig</code> を実行し、「IPv4 アドレス」を探します</li>
                </list>
            </tip>
        </step>
        <step>
            <p>
                同じ
                <Path>app/shared/.../network</Path>
                パッケージ内に、以下の実装で新しい
                <Path>TaskApi.kt</Path>
                ファイルを作成します：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor.network&#10;&#10;import com.example.ktor.model.Task&#10;import io.ktor.client.HttpClient&#10;import io.ktor.client.call.body&#10;import io.ktor.client.request.delete&#10;import io.ktor.client.request.get&#10;import io.ktor.client.request.post&#10;import io.ktor.client.request.setBody&#10;import io.ktor.http.ContentType&#10;import io.ktor.http.contentType&#10;&#10;class TaskApi(private val httpClient: HttpClient) {&#10;&#10;    suspend fun getAllTasks(): List&lt;Task&gt; {&#10;        return httpClient.get(&quot;tasks&quot;).body()&#10;    }&#10;&#10;    suspend fun removeTask(task: Task) {&#10;        httpClient.delete(&quot;tasks/${task.name}&quot;)&#10;    }&#10;&#10;    suspend fun updateTask(task: Task) {&#10;        httpClient.post(&quot;tasks&quot;) {&#10;            contentType(ContentType.Application.Json)&#10;            setBody(task)&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <Path>app/shared/.../App.kt</Path>
                に移動し、コードを以下の実装に置き換えます。
                これにより、<code>TaskApi</code> 型を使用してサーバーからタスクのリストを取得し、各タスクの名前を列（カラム）に表示します：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.network.createHttpClient&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.material3.Button&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Alignment&#10;import androidx.compose.ui.Modifier&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        val tasks = remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        Column(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize(),&#10;            horizontalAlignment = Alignment.CenterHorizontally,&#10;        ) {&#10;            Button(onClick = {&#10;                scope.launch {&#10;                    tasks.value = taskApi.getAllTasks()&#10;                }&#10;            }) {&#10;                Text(&quot;Fetch Tasks&quot;)&#10;            }&#10;            for (task in tasks.value) {&#10;                Text(task.name)&#10;            }&#10;        }&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                サーバーを実行したまま、<ui-path>iosApp</ui-path> 実行構成を実行してiOSアプリケーションをテストします。
            </p>
        </step>
        <step>
            <p>
                <control>Fetch Tasks</control>
                ボタンをクリックしてタスクのリストを表示します：
                <img style="block" src="full_stack_development_tutorial_run_iOS.png"
                     alt="iOSで動作するアプリ" width="363" border-effect="rounded"/>
            </p>
            <note>
                このデモでは、わかりやすさのためにプロセスを簡略化しています。実際のアプリケーションでは、暗号化されていないデータをネットワーク経由で送信しないようにすることが極めて重要です。
            </note>
        </step>
        <step>
            <p>
                Androidプラットフォームでは、アプリケーションにネットワーク権限を明示的に与え、クリアテキストでのデータの送受信を許可する必要があります。これらの権限を有効にするには、
                <Path>app/androidApp/src/main/AndroidManifest.xml</Path>
                を開き、以下の設定を追加します：
            </p>
            <code-block lang="xml" code="                    &lt;manifest&gt;&#10;                        ...&#10;                        &lt;application&#10;                                android:usesCleartextTraffic=&quot;true&quot;&gt;&#10;                        ...&#10;                        ...&#10;                        &lt;/application&gt;&#10;                        &lt;uses-permission android:name=&quot;android.permission.INTERNET&quot;/&gt;&#10;                    &lt;/manifest&gt;"/>
        </step>
        <step>
            <p>
                <ui-path>app.androidApp</ui-path> 実行構成を使用してAndroidアプリケーションを実行します。
                Androidクライアントも同様に動作することが確認できるはずです：
                <img style="block" src="full_stack_development_tutorial_run_android.png"
                     alt="Androidで動作するアプリ" width="350" />
            </p>
        </step>
        <step>
            <p>
                デスクトップクライアントについては、コンテナウィンドウにサイズとタイトルを割り当てます。
                <Path>app/desktopApp/src/.../main.kt</Path>
                ファイルを開き、<code>title</code> を変更し、<code>state</code> プロパティを設定してコードを修正します：
            </p>
            <code-block lang="kotlin" code="package com.example.ktor&#10;&#10;import androidx.compose.ui.unit.DpSize&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.window.Window&#10;import androidx.compose.ui.window.WindowPosition&#10;import androidx.compose.ui.window.WindowState&#10;import androidx.compose.ui.window.application&#10;&#10;fun main() = application {&#10;    val state = WindowState(&#10;        size = DpSize(400.dp, 600.dp),&#10;        position = WindowPosition(200.dp, 100.dp)&#10;    )&#10;    Window(&#10;        title = &quot;Task Manager (Desktop)&quot;,&#10;        state = state,&#10;        onCloseRequest = ::exitApplication,&#10;    ) {&#10;        App()&#10;    }&#10;}"/>
        </step>
        <step>
            <p>
                <ui-path>app [hot] 🔥</ui-path> 実行構成を使用してデスクトップアプリケーションを実行します：
                <img style="block" src="full_stack_development_tutorial_run_desktop_resized.png"
                     alt="デスクトップで動作するアプリ" width="400" border-effect="rounded"/>
            </p>
        </step>
        <step>
            <p>
                以下のいずれかの実行構成を使用して、Webクライアントを実行します：
            </p>
            <list>
                <li>
                    <ui-path>app [js]</ui-path>: Kotlin/JSアプリケーションを実行します。
                </li>
                <li>
                    <ui-path>app [wasmJs]</ui-path>: Kotlin/Wasmアプリケーションを実行します。
                </li>
            </list>
            <img style="block" src="full_stack_development_tutorial_run_web.png"
                 alt="Webで動作するアプリ" width="400" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="UIを改善する" id="improve-ui">
    <p>
        クライアントはサーバーと通信できるようになりましたが、まだ魅力的なUIとは言えません。
    </p>
    <procedure id="improve-ui-procedure">
        <step>
            <p>
                <Path>app/shared/src/commonMain/.../ktor</Path>
                にある
                <Path>App.kt</Path>
                ファイルを開き、既存の <code>App</code> を以下の <code>App</code> および <code>TaskCard</code> コンポーザブルに置き換えます：
            </p>
            <code-block lang="kotlin" collapsed-title-line-number="31" collapsible="true" code="package com.example.ktor&#10;&#10;import com.example.ktor.network.TaskApi&#10;import com.example.ktor.model.Priority&#10;import com.example.ktor.model.Task&#10;import androidx.compose.foundation.layout.Column&#10;import androidx.compose.foundation.layout.Row&#10;import androidx.compose.foundation.layout.Spacer&#10;import androidx.compose.foundation.layout.fillMaxSize&#10;import androidx.compose.foundation.layout.fillMaxWidth&#10;import androidx.compose.foundation.layout.padding&#10;import androidx.compose.foundation.layout.safeContentPadding&#10;import androidx.compose.foundation.layout.width&#10;import androidx.compose.foundation.lazy.LazyColumn&#10;import androidx.compose.foundation.lazy.items&#10;import androidx.compose.foundation.shape.CornerSize&#10;import androidx.compose.foundation.shape.RoundedCornerShape&#10;import androidx.compose.material3.Card&#10;import androidx.compose.material3.MaterialTheme&#10;import androidx.compose.material3.OutlinedButton&#10;import androidx.compose.material3.Text&#10;import androidx.compose.runtime.*&#10;import androidx.compose.ui.Modifier&#10;import androidx.compose.ui.text.font.FontWeight&#10;import androidx.compose.ui.unit.dp&#10;import androidx.compose.ui.unit.sp&#10;import com.example.ktor.network.createHttpClient&#10;import kotlinx.coroutines.launch&#10;&#10;@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        LazyColumn(&#10;            modifier = Modifier&#10;                .safeContentPadding()&#10;                .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}&#10;&#10;@Composable&#10;fun TaskCard(&#10;    task: Task,&#10;    onDelete: (Task) -&gt; Unit,&#10;    onUpdate: (Task) -&gt; Unit&#10;) {&#10;    fun pickWeight(priority: Priority) = when (priority) {&#10;        Priority.Low -&gt; FontWeight.SemiBold&#10;        Priority.Medium -&gt; FontWeight.Bold&#10;        Priority.High, Priority.Vital -&gt; FontWeight.ExtraBold&#10;    }&#10;&#10;    Card(&#10;        modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;        shape = RoundedCornerShape(CornerSize(4.dp))&#10;    ) {&#10;        Column(modifier = Modifier.padding(10.dp)) {&#10;            Text(&#10;                &quot;${task.name}: ${task.description}&quot;,&#10;                fontSize = 20.sp,&#10;                fontWeight = pickWeight(task.priority)&#10;            )&#10;&#10;            Row {&#10;                OutlinedButton(onClick = { onDelete(task) }) {&#10;                    Text(&quot;Delete&quot;)&#10;                }&#10;                Spacer(Modifier.width(8.dp))&#10;                OutlinedButton(onClick = { onUpdate(task) }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                この実装により、クライアントにいくつかの基本的な機能が備わりました。
            </p>
            <p>
                <code>LaunchedEffect</code> 型を使用することで起動時にすべてのタスクが読み込まれ、<code>LazyColumn</code> コンポーザブルによってユーザーはタスクをスクロールできるようになります。
            </p>
            <p>
                最後に、独立した <code>TaskCard</code> コンポーザブルが作成され、これには各 <code>Task</code> の詳細を表示するための <code>Card</code> が使用されています。タスクを削除および更新するためのボタンも追加されました。
            </p>
        </step>
        <step>
            <p>
                クライアントアプリケーション（例：Androidアプリ）を再起動します。
                タスクをスクロールし、詳細を確認し、削除できるようになります：
                <img style="block" src="full_stack_development_tutorial_improved_ui.gif"
                     alt="改善されたUIで動作するAndroidアプリ" width="350" border-effect="rounded"/>
            </p>
        </step>
    </procedure>
</chapter>
<chapter title="更新機能を追加する" id="add-update-functionality">
    <p>
        クライアントを完成させるために、タスクの詳細を更新できる機能を組み込みます。
    </p>
    <procedure id="add-update-func-procedure">
        <step>
            <Path>app/shared/src/commonMain/.../ktor</Path>
            にある
            <Path>App.kt</Path>
            ファイルに移動します。
        </step>
        <step>
            <p>
                以下に示すように、<code>UpdateTaskDialog</code> コンポーザブルと必要なインポートを追加します：
            </p>
            <code-block lang="kotlin" code="import androidx.compose.material3.TextField&#10;import androidx.compose.material3.TextFieldDefaults&#10;import androidx.compose.ui.graphics.Color&#10;import androidx.compose.ui.window.Dialog&#10;&#10;@Composable&#10;fun UpdateTaskDialog(&#10;    task: Task,&#10;    onConfirm: (Task) -&gt; Unit&#10;) {&#10;    var description by remember { mutableStateOf(task.description) }&#10;    var priorityText by remember { mutableStateOf(task.priority.toString()) }&#10;    val colors = TextFieldDefaults.colors(&#10;        focusedTextColor = Color.Blue,&#10;        focusedContainerColor = Color.White,&#10;    )&#10;&#10;    Dialog(onDismissRequest = {}) {&#10;        Card(&#10;            modifier = Modifier.fillMaxWidth().padding(4.dp),&#10;            shape = RoundedCornerShape(CornerSize(4.dp))&#10;        ) {&#10;            Column(modifier = Modifier.padding(10.dp)) {&#10;                Text(&quot;Update ${task.name}&quot;, fontSize = 20.sp)&#10;                TextField(&#10;                    value = description,&#10;                    onValueChange = { description = it },&#10;                    label = { Text(&quot;Description&quot;) },&#10;                    colors = colors&#10;                )&#10;                TextField(&#10;                    value = priorityText,&#10;                    onValueChange = { priorityText = it },&#10;                    label = { Text(&quot;Priority&quot;) },&#10;                    colors = colors&#10;                )&#10;                OutlinedButton(onClick = {&#10;                    val newTask = Task(&#10;                        task.name,&#10;                        description,&#10;                        try {&#10;                            Priority.valueOf(priorityText)&#10;                        } catch (e: IllegalArgumentException) {&#10;                            Priority.Low&#10;                        }&#10;                    )&#10;                    onConfirm(newTask)&#10;                }) {&#10;                    Text(&quot;Update&quot;)&#10;                }&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                これは、ダイアログボックスで <code>Task</code> の詳細を表示するコンポーザブルです。<code>description</code>（説明）と <code>priority</code>（優先度）は、更新できるように <code>TextField</code> コンポーザブル内に配置されています。ユーザーが更新ボタンを押すと、<code>onConfirm()</code> コールバックが実行されます。
            </p>
        </step>
        <step>
            <p>
                同じファイル内の <code>App</code> コンポーザブルを更新します：
            </p>
            <code-block lang="kotlin" code="@Composable&#10;fun App() {&#10;    MaterialTheme {&#10;        val httpClient = createHttpClient()&#10;        val taskApi = remember { TaskApi(httpClient) }&#10;        var tasks by remember { mutableStateOf(emptyList&lt;Task&gt;()) }&#10;        val scope = rememberCoroutineScope()&#10;        var currentTask by remember { mutableStateOf&lt;Task?&gt;(null) }&#10;&#10;        LaunchedEffect(Unit) {&#10;            tasks = taskApi.getAllTasks()&#10;        }&#10;&#10;        if (currentTask != null) {&#10;            UpdateTaskDialog(&#10;                currentTask!!,&#10;                onConfirm = {&#10;                    scope.launch {&#10;                        taskApi.updateTask(it)&#10;                        tasks = taskApi.getAllTasks()&#10;                    }&#10;                    currentTask = null&#10;                }&#10;            )&#10;        }&#10;&#10;        LazyColumn(modifier = Modifier&#10;            .safeContentPadding()&#10;            .fillMaxSize()&#10;        ) {&#10;            items(tasks) { task -&gt;&#10;                TaskCard(&#10;                    task,&#10;                    onDelete = {&#10;                        scope.launch {&#10;                            taskApi.removeTask(it)&#10;                            tasks = taskApi.getAllTasks()&#10;                        }&#10;                    },&#10;                    onUpdate = {&#10;                        currentTask = task&#10;                    }&#10;                )&#10;            }&#10;        }&#10;    }&#10;}"/>
            <p>
                現在選択されているタスクを保持するための追加の状態（State）を保存しています。この値が null でない場合、<code>UpdateTaskDialog</code> コンポーザブルを呼び出します。その際、<code>onConfirm()</code> コールバックには <code>TaskApi</code> を使用してサーバーに POST リクエストを送信するように設定されています。
            </p>
            <p>
                最後に、<code>TaskCard</code> コンポーザブルを作成する際に、<code>onUpdate()</code> コールバックを使用して <code>currentTask</code> 状態変数を設定します。
            </p>
        </step>
        <step>
            クライアントアプリケーションを再起動します。ボタンを使用して各タスクの詳細を更新できるようになります。
            <img style="block" src="full_stack_development_tutorial_update_task.gif"
                 alt="Androidでのタスク更新" width="350" border-effect="rounded"/>
        </step>
    </procedure>
</chapter>
<chapter title="次のステップ" id="next-steps">
    <p>
        この記事では、Kotlin Multiplatformアプリケーションのコンテキスト内でKtorを使用しました。これで、さまざまなプラットフォームを対象とした、複数のサービスとクライアントを含むプロジェクトを作成できるようになりました。
    </p>
    <p>
        見てきたように、コードの重複や冗長性なしに機能を構築することが可能です。プロジェクトのすべてのレイヤーで必要とされる型は、
        <Path>core</Path>
        マルチプラットフォームモジュール内に配置できます。サービスにのみ必要な機能は
        <Path>server</Path>
        モジュールに、クライアントにのみ必要な機能は
        <Path>app</Path>
        モジュールに配置します。
    </p>
    <p>
        この種の本発には、必然的にクライアントとサーバーの両方の技術に関する知識が必要になります。しかし、<a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html">Kotlin
        Multiplatform</a> ライブラリと <a href="https://www.jetbrains.com/lp/compose-multiplatform/">
        Compose Multiplatform</a> を使用することで、新しく学ぶ必要がある事柄を最小限に抑えることができます。最初は単一のプラットフォームにのみ焦点を当てている場合でも、アプリケーションの需要が高まるにつれて、他のプラットフォームを簡単に追加することができます。
    </p>
</chapter>
</topic>