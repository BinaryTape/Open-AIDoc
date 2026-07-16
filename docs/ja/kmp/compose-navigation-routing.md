[//]: # (title: ナビゲーションとルーティング)

ナビゲーションは、ユーザーがアプリケーションの異なる画面間を移動できるようにする、UIアプリケーションの主要な部分です。
Compose Multiplatformは、[Jetpack Composeのナビゲーション手法](https://developer.android.com/guide/navigation/design#frameworks)を採用しています。

## セットアップ

Navigationライブラリを使用するには、`commonMain`ソースセットに以下の依存関係を追加します。

```kotlin
kotlin {
    // ...
    sourceSets {
        // ...
        commonMain.dependencies {
            // ...
            implementation("org.jetbrains.androidx.navigation:navigation-compose:%org.jetbrains.androidx.navigation%")
        }
        // ...
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="org.jetbrains.androidx.navigation:navigation-compose:%org.jetbrains.androidx.navigation%"}

## サンプルプロジェクト

Compose Multiplatformのナビゲーションライブラリが実際に動作している様子を確認するには、[nav_cupcakeプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)をチェックしてください。
これは、Androidのコードラボ「[Navigate between screens with Compose](https://developer.android.com/codelabs/basic-android-kotlin-compose-navigation#0)」から変換されたものです。
より複雑な例については、公式の[KotlinConf](https://github.com/JetBrains/kotlinconf-app)アプリケーションを参照してください。

Jetpack Composeと同様に、ナビゲーションを実装するには以下の手順が必要です。
1. ナビゲーショングラフに含める[ルートをリストアップ](https://github.com/JetBrains/compose-multiplatform/blob/a6961385ccf0dee7b6d31e3f73d2c8ef91005f1a/examples/nav_cupcake/composeApp/src/commonMain/kotlin/org/jetbrains/nav_cupcake/CupcakeScreen.kt#L50)します。各ルートはパスを定義する一意の文字列である必要があります。
2. ナビゲーションを管理するためのメインのcomposableプロパティとして、[`NavHostController`インスタンスを作成](https://github.com/JetBrains/compose-multiplatform/blob/a6961385ccf0dee7b6d31e3f73d2c8ef91005f1a/examples/nav_cupcake/composeApp/src/commonMain/kotlin/org/jetbrains/nav_cupcake/CupcakeScreen.kt#L89)します。
3. アプリに[`NavHost` composableを追加](https://github.com/JetBrains/compose-multiplatform/blob/a6961385ccf0dee7b6d31e3f73d2c8ef91005f1a/examples/nav_cupcake/composeApp/src/commonMain/kotlin/org/jetbrains/nav_cupcake/CupcakeScreen.kt#L109)します：
    1. 先ほど定義したルートのリストから、開始目的地（starting destination）を選択します。
    2. `NavHost`の作成の一部として直接、または`NavController.createGraph()`関数を使用してプログラム的に、ナビゲーショングラフを作成します。

各バックスタックエントリ（グラフに含まれる各ナビゲーションルート）は、`LifecycleOwner`インターフェースを実装しています。
アプリの異なる画面間の切り替えにより、状態が`RESUMED`から`STARTED`へ、またその逆へと変化します。
`RESUMED`は「settled（確定）」とも表現されます。新しい画面が準備されアクティブになった時点で、ナビゲーションは完了したと見なされます。
現在のCompose Multiplatformにおける実装の詳細については、[Lifecycle](compose-lifecycle.md)のページを参照してください。

## Webアプリにおけるブラウザナビゲーションのサポート
<primary-label ref="Experimental"/>

Compose Multiplatform for webは、共通のNavigationライブラリAPIを完全にサポートしており、ブラウザからのナビゲーション入力をアプリで受け取ることができます。
ユーザーはブラウザの **戻る** ボタンや **進む** ボタンを使用して、ブラウザ履歴に反映されたナビゲーションルート間を移動したり、アドレスバーを使用して現在の場所を把握したり、目的地に直接移動したりできます。

Webアプリを共通コードで定義されたナビゲーショングラフにバインドするには、Kotlin/Wasmコードで`NavController.bindToBrowserNavigation()`メソッドを使用できます。
Kotlin/JSでも同じメソッドを使用できますが、Wasmアプリケーションが初期化され、Skiaがグラフィックスをレンダリングする準備ができていることを確実にするために、`onWasmReady {}`ブロックでラップしてください。
以下にセットアップの例を示します。

```kotlin
//commonMainソースセット
@Composable
fun App(
    onNavHostReady: suspend (NavController) -> Unit = {}
) {
    val navController = rememberNavController()
    NavHost(...) {
        //...
    }
    LaunchedEffect(navController) {
        onNavHostReady(navController)
    }
}

//wasmJsMainソースセット
@OptIn(ExperimentalComposeUiApi::class)
@ExperimentalBrowserHistoryApi
fun main() {
    val body = document.body ?: return
    ComposeViewport(body) {
        App(
          onNavHostReady = { it.bindToBrowserNavigation() }
        )
    }
}

//jsMainソースセット
@OptIn(ExperimentalComposeUiApi::class)
@ExperimentalBrowserHistoryApi
fun main() {
    onWasmReady {
        val body = document.body ?: return@onWasmReady
        ComposeViewport(body) {
            App(
                onNavHostReady = { it.bindToBrowserNavigation() }
            )
        }
    }
}
```

`navController.bindToBrowserNavigation()`を呼び出した後：
* ブラウザに表示されるURLには、現在のルートが反映されます（URLフラグメントの`#`文字以降）。
* アプリは手動で入力されたURLを解析し、アプリ内の目的地へと変換します。

デフォルトでは、型セーフなナビゲーションを使用する場合、目的地は[`kotlinx.serialization`のデフォルト](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/)に従って、引数が付加されたURLフラグメントに変換されます：
`<app package>.<serializable type>/<argument1>/<argument2>`。
例えば、`example.org#org.example.app.StartScreen/123/Alice%2520Smith`のようになります。

### ルートからURLへの変換（およびその逆）のカスタマイズ

Compose Multiplatformアプリはシングルページアプリ（SPA）であるため、フレームワークはアドレスバーを操作して通常のWebナビゲーションを模倣します。
URLをより読みやすくし、実装をURLパターンから分離したい場合は、画面に直接名前を割り当てるか、目的地のルートに対して完全にカスタムな処理を開発できます。

* 単にURLを読みやすくするには、`@SerialName`アノテーションを使用して、シリアライズ可能なオブジェクトまたはクラスにシリアル名を明示的に設定します。

    ```kotlin
    // アプリのパッケージ名とオブジェクト名を使用する代わりに、
    // このルートは単に "#start" としてURLに変換されます
    @Serializable @SerialName("start") data object StartScreen
    ```
* すべてのURLを完全に構築するには、オプションの`getBackStackEntryRoute`ラムダを使用できます。

#### URLの完全なカスタマイズ

完全にカスタムなルートからURLへの変換を実装するには：

1. オプションの`getBackStackEntryRoute`ラムダを`navController.bindToBrowserNavigation()`関数に渡し、必要に応じてルートをURLフラグメントに変換する方法を指定します。
2. 必要に応じて、アドレスバーのURLフラグメントをキャッチし（ユーザーがアプリのURLをクリックまたは貼り付けたとき）、URLをルートに変換して適切にナビゲートするコードを追加します。

以下は、後述のWebコードのサンプルで使用する単純な型セーフなナビゲーショングラフの例です (`commonMain/kotlin/org.example.app/App.kt`)：

```kotlin
// ナビゲーショングラフのルート引数用のシリアライズ可能なオブジェクトとクラス
@Serializable data object StartScreen
@Serializable data class Id(val id: Long)
@Serializable data class Patient(val name: String, val age: Long)

@Composable
internal fun App(
    onNavHostReady: suspend (NavController) -> Unit = {}
) = AppTheme {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = StartScreen
    ) {
        composable<StartScreen> {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text("Starting screen")
                // 適切なパラメータで 'Id' 画面を開くボタン
                Button(onClick = { navController.navigate(Id(222)) }) {
                    Text("Pass 222 as a parameter to the ID screen")
                }
                // 適切なパラメータで 'Patient' 画面を開くボタン
                Button(onClick = { navController.navigate(Patient( "Jane Smith-Baker", 33)) }) {
                    Text("Pass 'Jane Smith-Baker' and 33 to the Person screen")
                }
            }
        }
        composable<Id> {...}
        composable<Patient> {...}
    }
    LaunchedEffect(navController) {
        onNavHostReady(navController)
    }
}
```
{default-state="collapsed" collapsible="true" collapsed-title="NavHost(navController = navController, startDestination = StartScreen)"}

`wasmJsMain/kotlin/main.kt`で、`.bindToBrowserNavigation()`の呼び出しにラムダを追加します。

```kotlin
@OptIn(
    ExperimentalComposeUiApi::class,
    ExperimentalBrowserHistoryApi::class,
    ExperimentalSerializationApi::class
)
fun main() {
    val body = document.body ?: return
    ComposeViewport(body) {
        App(
            onNavHostReady = { navController ->
                navController.bindToBrowserNavigation() { entry ->
                    val route = entry.destination.route.orEmpty()
                    when {
                        // シリアル記述子を使用してルートを特定する
                        route.startsWith(StartScreen.serializer().descriptor.serialName) -> {
                            // 対応するURLフラグメントを "#org.example.app.StartScreen" の代わりに
                            // "#start" に設定する
                            //
                            // フロントエンドでの処理を維持するために、この文字列は
                            // 常に `#` 文字で始まる必要があります
                            "#start"
                        }
                        route.startsWith(Id.serializer().descriptor.serialName) -> {
                            // ルート引数にアクセスする
                            val args = entry.toRoute<Id>()

                            // 対応するURLフラグメントを "#org.example.app.ID%2F222" の代わりに
                            // "#find_id_222" に設定する
                            "#find_id_${args.id}"
                        }
                        route.startsWith(Patient.serializer().descriptor.serialName) -> {
                            val args = entry.toRoute<Patient>()
                            // 対応するURLフラグメントを "#org.company.app.Patient%2FJane%2520Smith-Baker%2F33" 
                            // の代わりに "#patient_Jane%20Smith-Baker_33" に設定する
                            "#patient_${args.name}_${args.age}"
                        }
                        // 他のすべてのルートにはURLフラグメントを設定しない
                        else -> ""
                    }
                }
            }
        )
    }
}
```
<!--{default-state="collapsed" collapsible="true" collapsed-title="navController.bindToBrowserNavigation() { entry ->"}-->

> データをURLフラグメント内に保持するために、ルートに対応するすべての文字列が `#` 文字で始まっていることを確認してください。
> そうしないと、ユーザーがURLをコピーして貼り付けたときに、ブラウザはアプリに制御を渡す代わりに、誤ったエンドポイントにアクセスしようとします。
> 
{style="note"}

URLにカスタムフォーマットを適用している場合は、手動で入力されたURLを目的地のルートに一致させるための逆変換処理を追加する必要があります。
マッチングを行うコードは、`navController.bindToBrowserNavigation()`呼び出しがブラウザの場所をナビゲーショングラフにバインドする前に実行する必要があります。

<Tabs>
    <TabItem title="Kotlin/Wasm">
        <code-block lang="Kotlin" code="        @OptIn(&#10;            ExperimentalComposeUiApi::class,&#10;            ExperimentalBrowserHistoryApi::class,&#10;            ExperimentalSerializationApi::class&#10;        )&#10;        fun main() {&#10;            val body = document.body ?: return&#10;            ComposeViewport(body) {&#10;                App(&#10;                    onNavHostReady = { navController -&gt;&#10;                        // 現在のURLのフラグメント部分にアクセスする&#10;                        val initRoute = window.location.hash.substringAfter('#', &quot;&quot;)&#10;                        when {&#10;                            // 対応するルートを特定して遷移する&#10;                            initRoute.startsWith(&quot;start&quot;) -&gt; {&#10;                                navController.navigate(StartScreen)&#10;                            }&#10;                            initRoute.startsWith(&quot;find_id&quot;) -&gt; {&#10;                                // 遷移する前に、文字列を解析してルートパラメータを抽出する&#10;                                val id = initRoute.substringAfter(&quot;find_id_&quot;).toLong()&#10;                                navController.navigate(Id(id))&#10;                            }&#10;                            initRoute.startsWith(&quot;patient&quot;) -&gt; {&#10;                                val name = initRoute.substringAfter(&quot;patient_&quot;).substringBefore(&quot;_&quot;)&#10;                                val id = initRoute.substringAfter(&quot;patient_&quot;).substringAfter(&quot;_&quot;).toLong()&#10;                                navController.navigate(Patient(name, id))&#10;                            }&#10;                        }&#10;                        navController.bindToBrowserNavigation() { ... }&#10;                    }&#10;                )&#10;            }&#10;        }"></code-block>
    </TabItem>
    <TabItem title="Kotlin/JS">
        <code-block lang="kotlin" code="        @OptIn(&#10;            ExperimentalComposeUiApi::class,&#10;            ExperimentalBrowserHistoryApi::class,&#10;            ExperimentalSerializationApi::class&#10;        )&#10;        fun main() {&#10;            onWasmReady {&#10;                val body = document.body ?: return@onWasmReady&#10;                ComposeViewport(body) {&#10;                    App(&#10;                        onNavHostReady = { navController -&gt;&#10;                            // 現在のURLのフラグメント部分にアクセスする&#10;                            val initRoute = window.location.hash.substringAfter('#', &quot;&quot;)&#10;                            when {&#10;                                // 対応するルートを特定して遷移する&#10;                                initRoute.startsWith(&quot;start&quot;) -&gt; {&#10;                                    navController.navigate(StartScreen)&#10;                                }&#10;                                initRoute.startsWith(&quot;find_id&quot;) -&gt; {&#10;                                    // 遷移する前に、文字列を解析してルートパラメータを抽出する&#10;                                    val id = initRoute.substringAfter(&quot;find_id_&quot;).toLong()&#10;                                    navController.navigate(Id(id))&#10;                                }&#10;                                initRoute.startsWith(&quot;patient&quot;) -&gt; {&#10;                                    val name = initRoute.substringAfter(&quot;patient_&quot;).substringBefore(&quot;_&quot;)&#10;                                    val id = initRoute.substringAfter(&quot;patient_&quot;).substringAfter(&quot;_&quot;).toLong()&#10;                                    navController.navigate(Patient(name, id))&#10;                                }&#10;                            }&#10;                            navController.bindToBrowserNavigation() { ... }&#10;                        }&#10;                    )&#10;                }&#10;            }&#10;        }"></code-block>
    </TabItem>
</Tabs>