[//]: # (title: 独自のアプリケーションを作成する)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE も同じコア機能と Kotlin Multiplatform サポートを共有しています。</p>
    <br/>   
    <p>これは、<strong>「共有のロジックと UI を使用した Compose Multiplatform アプリの作成」</strong>チュートリアルの最終パートです。先に進む前に、前のステップを完了していることを確認してください。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第1ステップ"/> <Links href="/kmp/compose-multiplatform-create-first-app" summary="このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE も同じコア機能と Kotlin Multiplatform サポートを共有しています。これは「共有のロジックと UI を使用した Compose Multiplatform アプリの作成」チュートリアルの第1パートです。Compose Multiplatform アプリを作成し、コンポーザブルコードを探索し、プロジェクトを修正して、独自のアプリケーションを作成します。">Compose Multiplatform アプリを作成する</Links><br/>
       <img src="icon-2-done.svg" width="20" alt="第2ステップ"/> <Links href="/kmp/compose-multiplatform-explore-composables" summary="このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE も同じコア機能と Kotlin Multiplatform サポートを共有しています。これは「共有のロジックと UI を使用した Compose Multiplatform アプリの作成」チュートリアルの第2パートです。先に進む前に、前のステップを完了していることを確認してください。Compose Multiplatform アプリを作成し、コンポーザブルコードを探索し、プロジェクトを修正して、独自のアプリケーションを作成します。">コンポーザブルコードを探索する</Links><br/>
       <img src="icon-3-done.svg" width="20" alt="第3ステップ"/> <Links href="/kmp/compose-multiplatform-modify-project" summary="このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE も同じコア機能と Kotlin Multiplatform サポートを共有しています。これは「共有のロジックと UI を使用した Compose Multiplatform アプリの作成」チュートリアルの第3パートです。先に進む前に、前のステップを完了していることを確認してください。Compose Multiplatform アプリを作成し、コンポーザブルコードを探索し、プロジェクトを修正して、独自のアプリケーションを作成します。">プロジェクトを修正する</Links><br/>
       <img src="icon-4.svg" width="20" alt="第4ステップ"/> <strong>独自のアプリケーションを作成する</strong><br/>
    </p>
</tldr>

ウィザードによって作成されたサンプルプロジェクトを探索し、機能強化したところで、既知のコンセプトを活用し、いくつかの新しい要素を導入しながら、独自のアプリケーションを一から作成してみましょう。

ここでは、ユーザーが国と都市を入力すると、その国の首都の時刻を表示する「ローカル時刻アプリケーション」を作成します。Compose Multiplatform アプリのすべての機能は、マルチプラットフォームライブラリを使用して共通コード（common code）で実装されます。ドロップダウンメニュー内での画像の読み込みと表示、イベント、スタイル、テーマ、修飾子（modifiers）、レイアウトを使用します。

各段階で、3つのプラットフォームすべて（iOS、Android、デスクトップ）でアプリケーションを実行することも、ニーズに最も適した特定のプラットフォームに集中することもできます。

> プロジェクトの最終状態は、こちらの [GitHub リポジトリ](https://github.com/kotlin-hands-on/get-started-with-cm/) で確認できます。
>
{style="note"}

## 土台を作る

まずは、新しい `App` コンポーザブルを実装します。

1. `composeApp/src/commonMain/kotlin` で `App.kt` ファイルを開き、コードを以下の `App` コンポーザブルに置き換えます。

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

   * レイアウトは2つのコンポーザブルを含むカラム（Column）です。1つ目は `Text` コンポーザブル、2つ目は `Button` です。
   * これら2つのコンポーザブルは、単一の共有状態（shared state）である `timeAtLocation` プロパティによってリンクされています。`Text` コンポーザブルはこの状態のオブザーバーです。
   * `Button` コンポーザブルは、`onClick` イベントハンドラーを使用して状態を変更します。

2. Android と iOS でアプリケーションを実行します。

   ![Android と iOS 上の新しい Compose Multiplatform アプリ](first-compose-project-on-android-ios-3.png){width=500}

   アプリケーションを実行してボタンをクリックすると、ハードコードされた時刻が表示されます。

3. [Compose ホットリロード](compose-hot-reload.md) を使用して、デスクトップでアプリケーションを実行します。
   1. `composeApp/src/jvmMain/kotlin/main.kt` ファイルで、ガターにある **Run** アイコンをクリックします。
   2. **Run 'composeApp [jvm]' with Compose Hot Reload** を選択します。
   ![ガターから Compose ホットリロードを実行](compose-hot-reload-gutter-run.png){width=350 style="block"}

   アプリは動作しますが、ウィンドウが UI に対して明らかに大きすぎます。

   ![デスクトップ上の新しい Compose Multiplatform アプリ](first-compose-project-on-desktop-3.png){width=400}

4. これを修正するために、`main.kt` ファイルを次のように更新します。

    ```kotlin
   fun main() = application {
       val state = rememberWindowState(
           size = DpSize(400.dp, 350.dp),
           position = WindowPosition(300.dp, 300.dp)
       )
       Window(
           title = "Local Time App", 
           onCloseRequest = ::exitApplication, 
           state = state,
           alwaysOnTop = true
       ) {
           App()
       }
   }
    ```

    ここでは、ウィンドウのタイトルを設定し、`WindowState` 型を使用してウィンドウの初期サイズと画面上の位置を指定しています。

5. IDE の指示に従って、不足している依存関係をインポートします。

6. アプリが自動的に更新されるのを確認するには、変更したファイルを保存します（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）。見た目が改善されるはずです。

   ![デスクトップ上の Compose Multiplatform アプリの改善された外観](first-compose-project-on-desktop-4.png){width=350}

   ![Compose ホットリロード](compose-hot-reload-resize.gif)

## ユーザー入力をサポートする

次に、ユーザーが都市の名前を入力して、その場所の時刻を確認できるようにしましょう。これを実現する最も簡単な方法は、`TextField` コンポーザブルを追加することです。

1. `commonMain/kotlin/compose.project.demo/App.kt` 内の現在の `App()` 実装を、以下のものに置き換えます。

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
            var timeAtLocation by remember { mutableStateOf("No location selected") }
    
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                TextField(value = location, onValueChange = { location = it })
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

    新しいコードでは、`TextField` と `location` プロパティの両方が追加されています。ユーザーがテキストフィールドに入力すると、`onValueChange` イベントハンドラーを使用してプロパティの値が段階的に更新されます。

2. IDE の指示に従って、不足している依存関係をインポートします。
3. ターゲットとしている各プラットフォームでアプリケーションを実行します。

<Tabs>
    <TabItem id="mobile-user-input" title="Android および iOS">
        <img src="first-compose-project-on-android-ios-4.png" alt="Android と iOS の Compose Multiplatform アプリでのユーザー入力" width="500"/>
    </TabItem>
    <TabItem id="desktop-user-input" title="デスクトップ">
        <img src="first-compose-project-on-desktop-5.png" alt="デスクトップの Compose Multiplatform アプリでのユーザー入力" width="350"/>
    </TabItem>
</Tabs>

## 時刻を計算する

次のステップは、入力された情報を使用して時刻を計算することです。これを行うには、`currentTimeAt()` 関数を作成します。

1. `App.kt` ファイルに戻り、以下の関数を追加します。

    ```kotlin
   fun currentTimeAt(location: String): String? {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        return try {
            val time = Clock.System.now()
            val zone = TimeZone.of(location)
            val localTime = time.toLocalDateTime(zone).time
            "The time in $location is ${localTime.formatted()}"
        } catch (ex: IllegalTimeZoneException) {
            null
        }
    }
    ```

    この関数は、以前に作成した（現在は不要な）`todaysDate()` と似ています。
    [kotlinx-datetime](https://github.com/Kotlin/kotlinx-datetime) ライブラリがまだプロジェクトに追加されていない場合は、`composeApp/build.gradle.kts` ファイルを開き、共通コードのソースセットを構成するセクションに `kotlinx-datetime` の依存関係を追加します。
    簡単にするために、バージョンカタログに追加する代わりに、バージョン番号を直接含めることができます。

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            commonMain.dependencies {
                // ...
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            }
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")'}
   
2. IDE の指示に従って、不足している依存関係をインポートします。
   `Clock` クラスは `kotlinx.datetime` ではなく、`kotlin.time` からインポートするようにしてください。
3. `App` コンポーザブルを調整して、`currentTimeAt()` を呼び出すようにします。

    ```kotlin
   @Composable
   @Preview
   fun App() {
   MaterialTheme { 
       var location by remember { mutableStateOf("Europe/Paris") }
       var timeAtLocation by remember { mutableStateOf("No location selected") }
   
       Column(
           modifier = Modifier
               .safeContentPadding()
               .fillMaxSize()
           ) {
               Text(timeAtLocation)
               TextField(value = location, onValueChange = { location = it })
               Button(onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" }) {
                   Text("Show Time At Location")
               }
           }
       }
   }
    ```

4. アプリケーションを再度実行し、有効なタイムゾーンを入力します。
5. ボタンをクリックします。正しい時刻が表示されるはずです。

<Tabs>
    <TabItem id="mobile-time-display" title="Android および iOS">
        <img src="first-compose-project-on-android-ios-5.png" alt="Android と iOS の Compose Multiplatform アプリでの時刻表示" width="500"/>
    </TabItem>
    <TabItem id="desktop-time-display" title="デスクトップ">
        <img src="first-compose-project-on-desktop-6.png" alt="デスクトップの Compose Multiplatform アプリでの時刻表示" width="350"/>
    </TabItem>
</Tabs>

## スタイルを改善する

アプリケーションは動作していますが、見た目に問題があります。コンポーザブルの間隔を広げ、時刻のメッセージをもっと目立たせることができます。

1. これらの問題に対処するために、以下のバージョンの `App` コンポーザブルを使用します。

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(
                    timeAtLocation,
                    style = TextStyle(fontSize = 20.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                TextField(
                    value = location,
                    onValueChange = { location = it },
                    modifier = Modifier.padding(top = 10.dp)
                )
                Button(
                    onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" },
                    modifier = Modifier.padding(top = 10.dp)
                ) {
                    Text("Show Time")
                }
            }
        }
    }
    ```

    * `modifier` パラメーターは、`Column` の周囲全体と、`Button` および `TextField` の上部にパディングを追加します。
    * `Text` コンポーザブルは、利用可能な水平スペースを埋め、コンテンツを中央に配置します。
    * `style` パラメーターは、`Text` の外観をカスタマイズします。

2. IDE の指示に従って、不足している依存関係をインポートします。
    `Alignment` には、`androidx.compose.ui` バージョンを使用してください。

3. アプリケーションを実行して、見た目がどのように改善されたかを確認します。

<Tabs>
    <TabItem id="mobile-improved-style" title="Android および iOS">
        <img src="first-compose-project-on-android-ios-6.png" alt="Android と iOS の Compose Multiplatform アプリの改善されたスタイル" width="500"/>
    </TabItem>
    <TabItem id="desktop-improved-style" title="デスクトップ">
        <img src="first-compose-project-on-desktop-7.png" alt="デスクトップの Compose Multiplatform アプリの改善されたスタイル" width="350"/>
    </TabItem>
</Tabs>

<!--
> この状態のプロジェクトは、こちらの [GitHub リポジトリ](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage2) で確認できます。
>
{style="tip"}
-->

## デザインをリファクタリングする

アプリケーションは動作しますが、タイポ（打ち間違い）に弱いです。例えば、ユーザーが "France" の代わりに "Franse" と入力すると、アプリはその入力を処理できません。あらかじめ定義されたリストから国を選択するようにユーザーに求める方が望ましいでしょう。

1. これを実現するために、`App` コンポーザブルのデザインを変更します。

    ```kotlin
    data class Country(val name: String, val zone: TimeZone)
    
    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"
    
        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time
    
        return "The time in $location is ${localTime.formatted()}"
    }
    
    fun countries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    
    @Composable
    @Preview
    fun App(countries: `List<Country>` = countries()) {
        MaterialTheme {
            var showCountries by remember { mutableStateOf(false) }
            var timeAtLocation by remember { mutableStateOf("No location selected") }
    
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(
                    timeAtLocation,
                    style = TextStyle(fontSize = 20.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries().forEach { (name, zone) ->
                            DropdownMenuItem(
                                text = {   Text(name)},
                                onClick = {
                                    timeAtLocation = currentTimeAt(name, zone)
                                    showCountries = false
                                }
                            )
                        }
                    }
                }
    
                Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                    onClick = { showCountries = !showCountries }) {
                    Text("Select Location")
                }
            }
        }
    }
    ```

   * 名前とタイムゾーンで構成される `Country` 型があります。
   * `currentTimeAt()` 関数は、2番目のパラメーターとして `TimeZone` を受け取ります。
   * `App` はパラメーターとして国のリストを必要とするようになりました。`countries()` 関数がそのリストを提供します。
   * `TextField` が `DropdownMenu` に置き換わりました。`showCountries` プロパティの値が `DropdownMenu` の表示を決定します。各国の `DropdownMenuItem` があります。

2. IDE の指示に従って、不足している依存関係をインポートします。
3. アプリケーションを実行して、再設計されたバージョンを確認します。

<Tabs>
    <TabItem id="mobile-country-list" title="Android および iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="Android と iOS の Compose Multiplatform アプリでの国リスト" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="デスクトップ">
        <img src="first-compose-project-on-desktop-8.png" alt="デスクトップの Compose Multiplatform アプリでの国リスト" width="350"/>
    </TabItem>
</Tabs>

<!--
> この状態のプロジェクトは、こちらの [GitHub リポジトリ](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage3) で確認できます。
>
{style="tip"}
-->

> [Koin](https://insert-koin.io/) などの依存関係注入（Dependency Injection）フレームワークを使用して、場所のテーブルを構築し注入することで、さらにデザインを改善できます。データが外部に保存されている場合は、[Ktor](https://ktor.io/docs/create-client.html) ライブラリを使用してネットワーク経由で取得したり、[SQLDelight](https://github.com/cashapp/sqldelight) ライブラリを使用してデータベースから取得したりできます。
>
{style="note"}

## 画像を導入する

国の名前のリストは機能しますが、視覚的にあまり魅力的ではありません。名前を国旗の画像に置き換えることで改善できます。

Compose Multiplatform は、すべてのプラットフォームで共通コードを介してリソースにアクセスするためのライブラリを提供しています。Kotlin Multiplatform ウィザードは、すでにこのライブラリを追加して構成しているため、ビルドファイルを変更することなくリソースの読み込みを開始できます。

プロジェクトで画像をサポートするには、画像ファイルをダウンロードし、正しいディレクトリに保存し、それらを読み込んで表示するためのコードを追加する必要があります。

1. すでに作成した国のリストに合わせて、[Flag CDN](https://flagcdn.com/) から国旗の画像をダウンロードします。この例では、[日本](https://flagcdn.com/w320/jp.png)、[フランス](https://flagcdn.com/w320/fr.png)、[メキシコ](https://flagcdn.com/w320/mx.png)、[インドネシア](https://flagcdn.com/w320/id.png)、[エジプト](https://flagcdn.com/w320/eg.png) です。

2. 同じ国旗をすべてのプラットフォームで使用できるように、画像を `composeApp/src/commonMain/composeResources/drawable` ディレクトリに移動します。

   ![Compose Multiplatform リソースのプロジェクト構造](compose-resources-project-structure.png){width=300}

3. アプリケーションをビルドまたは実行して、追加されたリソースへのアクセサーを備えた `Res` クラスを生成します。

4. 画像をサポートするように `commonMain/kotlin/.../App.kt` ファイルのコードを更新します。

    ```kotlin
    import demo.composeapp.generated.resources.jp
    import demo.composeapp.generated.resources.mx
    import demo.composeapp.generated.resources.eg
    import demo.composeapp.generated.resources.fr
    import demo.composeapp.generated.resources.id
   
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.formatted()}"
    }

    val defaultCountries = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: `List<Country>` = defaultCountries) {
        MaterialTheme {
            var showCountries by remember { mutableStateOf(false) }
            var timeAtLocation by remember { mutableStateOf("No location selected") }

            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(
                    timeAtLocation,
                    style = TextStyle(fontSize = 20.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
                                        painterResource(image),
                                        modifier = Modifier.size(50.dp).padding(end = 10.dp),
                                        contentDescription = "$name flag"
                                    )
                                    Text(name)
                                } },
                                onClick = {
                                    timeAtLocation = currentTimeAt(name, zone)
                                    showCountries = false
                                }
                            )
                        }
                    }
                }

                Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                    onClick = { showCountries = !showCountries }) {
                    Text("Select Location")
                }
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)"}

    * `Country` 型には関連する画像へのパスが格納されます。
    * `App` に渡される国のリストには、これらのパスが含まれます。
    * `App` は、各 `DropdownMenuItem` に `Image` を表示し、その後に国の名前を表示する `Text` コンポーザブルを表示します。
    * 各 `Image` は、データを取得するために `Painter` オブジェクトを必要とします。

5. IDE の指示に従って、不足している依存関係をインポートします。
6. アプリケーションを実行して、新しい動作を確認します。

<Tabs>
    <TabItem id="mobile-flags" title="Android および iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="Android と iOS の Compose Multiplatform アプリでの国旗" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="デスクトップ">
        <img src="first-compose-project-on-desktop-9.png" alt="デスクトップの Compose Multiplatform アプリでの国旗" width="350"/>
    </TabItem>
</Tabs>

> プロジェクトの最終状態は、こちらの [GitHub リポジトリ](https://github.com/kotlin-hands-on/get-started-with-cm/) で確認できます。
>
{style="note"}

## 次のステップ

マルチプラットフォーム開発をさらに探索し、他のプロジェクトも試してみることをお勧めします。

* [既存の Android アプリをクロスプラットフォーム化する](multiplatform-integrate-in-existing-app.md)
* [Ktor と SQLDelight を使用してマルチプラットフォームアプリを作成する](multiplatform-ktor-sqldelight.md)
* [UI をネイティブに保ちながら iOS と Android でビジネスロジックを共有する](multiplatform-create-first-app.md)
* [Kotlin/Wasm を使用して Compose Multiplatform アプリを作成する](https://kotlinlang.org/docs/wasm-get-started.html)
* [厳選されたサンプルプロジェクトのリストを見る](multiplatform-samples.md)

コミュニティに参加しましょう：

* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**: [リポジトリ](https://github.com/JetBrains/compose-multiplatform)にスターを付け、貢献してください。
* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受けて、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**: ["kotlin-multiplatform" タグ](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)を購読してください。
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube チャンネル**: [Kotlin Multiplatform に関する動画](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C)を購読して視聴してください。