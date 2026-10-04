[//]: # (title: 完全なコード共有: タイムゾーン選択アプリ)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

このチュートリアルでは、プラットフォーム間で可能な限り多くのコードを共有することに焦点を当てています。
UIはCompose Multiplatformを使用して共通コードで実装され、機能はマルチプラットフォームライブラリに基づいています。
ロジックのみを共有し、UIはネイティブのまま保持する例については、[Native UI: Shared logic for REST API requests](multiplatform-upgrade-app.md)を参照してください。

ここでは、ユーザーが国を選択すると、その国の首都の時刻が表示されるアプリケーションを作成します。
このアプリは、ドロップダウンメニューに画像を読み込んで表示し、イベント、スタイル、テーマ、修飾子（Modifier）を備えた典型的なComposeレイアウトを使用します。

ウィザードで生成されたプロジェクトから最終結果に到達するまでに、以下の手順を実行します:

1. [基本的なCompose UIレイアウトの実装](#implement-the-basic-layout)
2. [Compose Hot Reloadの試用](#use-compose-hot-reload-to-quickly-iterate-on-the-ui)
3. [時刻計算のためのマルチプラットフォームライブラリ依存関係の追加](#add-the-kotlinx-datetime-dependency)
4. アプリの組み立て:
   * [ユーザー入力のサポート](#support-user-input)
   * [画像リソースの追加とインポート](#introduce-images)

このチュートリアルでは、コードがほぼ完全に共有されているため、サポートされているすべてのプラットフォーム向けのデモアプリケーションを同時に作成できます。
また同様の理由から、興味のあるプラットフォームのみを自由に選択して進めることも可能です。

> プロジェクトの最終的な状態は、[GitHubリポジトリ](https://github.com/kotlin-hands-on/get-started-with-cm/)で確認できます。
>
{style="tip"}
<!-- TODO the project will be a bit different, but can be synced later -->

## プロジェクトの作成 {id="create-a-project"}

IDEとKotlin Multiplatform IDEプラグインがインストールされた状態で、新規Compose Multiplatformプロジェクトを作成します:

1. IntelliJ IDEAで、**File | New | Project** を選択します。
2. 左側のパネルで **Kotlin Multiplatform** を選択します。
3. **New Project** ウィンドウで以下のフィールドを指定します:

    * **Name**: ComposeDemo
    * **Project ID**（パッケージ名として使用されます）: compose.project.demo

4. **Android**、**iOS**、**Desktop**、および **Web** ターゲットを選択します。
   iOSとWebで **Share UI** オプションが選択されていることを確認してください。
5. すべてのフィールドとターゲットを指定したら、**Create** をクリックします。

   ![Compose Multiplatformプロジェクトの作成](create-compose-multiplatform-project.png){width=800}

初回のインポートには数分かかります。
完了したら、すべての事前チェック（preflight checks）が正常に完了したことを確認してください（**View | Tool Windows | Project Environment Preflight Checks**）。

## 基本的なレイアウトの実装 {id="implement-the-basic-layout"}

生成されたCompose Multiplatformプロジェクトは、プラットフォーム固有のアプリモジュールと共有UIモジュールで構成されています。
各アプリケーションモジュールは、共有の `App()` コンポーザブルを呼び出すエントリポイントを定義しています。

> 共有UIコードが各プラットフォームのシステムエントリポイントにどのようにアタッチされるかについては、[ネイティブアプリケーションのエントリポイント](compose-multiplatform-entry-points.md)を参照してください。
>
{style="tip"}

このチュートリアルでは、共通UIコードにおける機能的な変更はすべてアプリ全体にシームレスに伝播しますが、プラットフォームのセットアップを機能させるためにいくつかの変更が必要になります。

手始めに、共通の `App()` コンポーザブルで基本的なレイアウトを実装します:

1. `shared/src/commonMain/kotlin` で `compose.project.demo/App.kt` ファイルを開き、`App()` コンポーザブルを新しい実装に置き換えます:

    ```kotlin
    // @Composable はコンポーザブル関数を示します:
    // ComposeでUI要素を出力する関数です
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            // ボタンの上にテキストラベルを保持する
            // カラム（Column）としてUIを宣言します
            Column(
                // システムバーと重ならずに、Column()が利用可能なスペースを
                // すべて満たすようにする基本的なレイアウトの調整
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                // timeAtLocation の状態を監視する Text() を宣言します
                Text(timeAtLocation)
                // timeAtLocation の状態を監視する Button() を宣言します
                // 現時点ではハードコードされた時刻を表示します
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```
   
    > `remember` APIは、Compose固有の状態管理を実装します。
    > 状態オブジェクトは `remember()` 呼び出しでラップされ、状態を一度構築した後はコンポジション間で保持されます。
    > 状態の値が変化すると、それを監視しているコンポーザブルが再呼び出しされ、再描画されます。
    > これは「再構成（_recomposition_）」と呼ばれます。
    >
    > 詳細な導入については、Jetpack Composeドキュメントの [状態を管理する](https://developer.android.com/develop/ui/compose/state) を参照してください。
   
2. AndroidとiOSでアプリケーションを実行します:

   ![AndroidおよびiOSでの新しいCompose Multiplatformアプリ](first-compose-project-on-android-ios-3.png){width=500}

   アプリケーションを実行してボタンをクリックすると、アプリにハードコードされた時刻「13:30」が表示されます。

3. **desktopApp [hot] 🔥** 実行構成を開始し、[Compose Hot Reload](compose-hot-reload.md) を使用してデスクトップでアプリケーションを実行します。
   アプリは動作しますが、ウィンドウのサイズがUIと合っていないように見えます:

   ![デスクトップでの新しいCompose Multiplatformアプリ](first-compose-project-on-desktop-3.png){width=400}

   Compose Hot Reloadのおかげで、完全に再起動することなくこれを修正できます。

### Compose Hot Reload を使用した素早いUIイテレーション {id="use-compose-hot-reload-to-quickly-iterate-on-the-ui"}

アプリを再起動することなく、デスクトップUIを修正してその結果を確認できます:

1. `desktopApp/src/` ディレクトリ配下にある `main.kt` ファイルを以下のように更新します:

    ```kotlin
    fun main() = application {
        // 画面上のウィンドウの初期サイズと位置を設定します
        val state = rememberWindowState(
            size = DpSize(400.dp, 350.dp),
            position = WindowPosition(300.dp, 300.dp)
        )
        // アプリケーションウィンドウのタイトルを設定し、
        // 上で初期化したウィンドウ状態を使用します
        Window(
            title = "Local Time App", 
            onCloseRequest = ::exitApplication, 
            state = state,
            // デバッグとUIのイテレーションを容易にするため、
            // ウィンドウが常に最前面に表示されるようにします
            alwaysOnTop = true
        ) {
            App()
        }
    }
    ```

2. IDEの提案に従って、不足しているシンボルをインポートします。
   `rememberWindowState()` 関数には `androidx.compose.ui.window` バージョンを選択してください。

3. アプリが自動的に更新されるのを確認するために、変更したファイルを保存します（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）。
   ウィンドウのサイズが調整されるはずです:

   ![Compose Hot Reload](compose-hot-reload-resize.gif)

## `kotlinx-datetime` 依存関係の追加 {id="add-the-kotlinx-datetime-dependency"}

タイムゾーンの処理と時刻の計算には、[`kotlin.time`](https://kotlinlang.org/docs/time-measurement.html) クラスをマルチプラットフォーム対応の [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime) ライブラリと一緒に使用します。

`kotlin.time` は標準ライブラリの一部として常に利用可能ですが、`kotlinx-datetime` は明示的な依存関係として構成する必要があります。
これはマルチプラットフォームライブラリであり、共通コード内でのみ使用します。
そのため、依存関係は一度指定するだけで済み、[Web向けにのみ追加の設定が必要](#add-the-kotlinx-datetime-dependency-for-the-web-app)となります。

[ライブラリのリポジトリ](https://github.com/Kotlin/kotlinx-datetime#gradle)の手順に従います:

1. `gradle/libs.versions.toml` ファイルを開き、`kotlinx-datetime` の依存関係を[バージョンカタログ](https://docs.gradle.org/current/userguide/version_catalogs.html)に追加します:

    ```toml
    [versions]
    kotlinx-datetime = "%dateTimeVersion%"

    [libraries]
    kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
    ```

2. `shared/build.gradle.kts` ファイルを開き、`commonMain` ソースセット設定にバージョンカタログのエントリへの参照を追加します:

    ```kotlin
    kotlin {
        // ... 
        sourceSets {
            commonMain.dependencies {
                // ...
                implementation(libs.kotlinx.datetime)
            } 
        }
    }
    ```

3. **Shift** キーを2回押し、**Sync Project with Gradle Files** コマンドを検索して実行します。

これで、共通コードで `kotlinx-datetime` のAPIを使用できるようになりました。
Webターゲットの場合は、[以下のセクション](#add-the-kotlinx-datetime-dependency-for-the-web-app)で説明するように、JavaScriptおよびWasm/JSにおけるタイムゾーンサポートの制限を回避するための対応が必要です。

> マルチプラットフォームの依存関係を管理する方法に関する一般的な詳細については、[マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md)を参照してください。
>
{style="tip"}

### Webアプリ向けの `kotlinx-datetime` 依存関係の追加 {id="add-the-kotlinx-datetime-dependency-for-the-web-app"}

Webターゲットの場合、タイムゾーンのサポートには [`js-joda`](https://js-joda.github.io/js-joda/) npmパッケージも必要です:

1. `webApp/build.gradle.kts` ファイルにそのパッケージへの参照を追加します:

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            webMain.dependencies {
                implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
            }
        }
    }
    
    ```

   `webMain` ソースセットに依存関係を追加することで、`wasmJs` と `js` の両方のターゲットでライブラリが利用可能になります。

2. **Shift** キーを2回押し、**Sync Project with Gradle Files** コマンドを検索して実行します。

3. **Terminal** ツールウィンドウで次のコマンドを実行し、`yarn.lock` ファイルを最新の依存関係バージョンで更新します:

    ```shell
    ./gradlew kotlinUpgradeYarnLock kotlinWasmUpgradeYarnLock
    ```

4. `webApp/src/webMain/kotlin/.../main.kt` ファイルで、`@JsModule` アノテーションを使用して `js-joda` npmパッケージをインポートします。
   `main()` 関数を次のコードに置き換えます:

    ```kotlin
    import kotlin.js.ExperimentalWasmJsInterop
    import kotlin.js.JsModule

    @OptIn(ExperimentalWasmJsInterop::class)
    @JsModule("@js-joda/timezone")
    external object JsJodaTimeZoneModule
    
    private val jsJodaTz = JsJodaTimeZoneModule
    
    @OptIn(ExperimentalComposeUiApi::class)
    fun main() {
        ComposeViewport {
            App()
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='@JsModule("@js-joda/timezone")'}

> プロジェクトをバージョン管理にコミットする際は、`kotlin-js-store` ディレクトリに生成された `yarn.lock` ファイルを含めてください。
> 同期された `yarn.lock` により、プロジェクトをビルドするすべての人が同じバージョンのJavaScript依存関係を使用することが保証されます。
>
{style="note"}

## ユーザー入力のサポート {id="support-user-input"}

簡潔にするため、タイムゾーンの指定や検証に関する複雑なロジックは実装しません。
このアプリでは、いくつかの国を選択肢として提示し、選択された国の首都の時刻を表示します:

1. `shared/src/commonMain/kotlin` で `compose.project.demo/App.kt` ファイルを開き、`App()` コンポーザブルの上に国の情報を保持するデータクラスを追加します:

    ```kotlin
    // この例向けの簡略化されたタイムゾーン表現 
    data class Country(val name: String, val zone: TimeZone)
    
    // サポートする国のリストと、
    // 関連付けられた特定のタイムゾーンをハードコードします
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    ```

2. 同じ `App.kt` ファイルに、指定されたタイムゾーンの現地時間を計算する `currentTimeAt()` 関数を追加します。
   時刻を `HH:MM:SS` 形式で表示するために、この関数では各要素をゼロ埋めして2桁にする `kotlinx-datetime` の [format builder](https://github.com/Kotlin/kotlinx-datetime#working-with-other-string-formats) を使用してフォーマットを定義します:

    ```kotlin
    // 時刻を計算するために TimeZone パラメータを受け取ります
    fun currentTimeAt(location: String, zone: TimeZone): String {
        // 時刻フォーマットを定義: 時、分、秒を
        // それぞれ2桁でゼロ埋めし、コロンで区切ります
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }
    ```

3. 追加した機能を使用するように `App()` コンポーザブルを更新します:
   国のリストをドロップダウンとして提示し、ハードコードする代わりに時刻を計算します。
   `App()` 関数全体を以下に置き換えます:

    ```kotlin
    // ドロップダウンメニューに表示する国のリストが必要になりました
    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
      MaterialTheme {
          var showCountries by remember { mutableStateOf(false) }
          var timeAtLocation by remember { mutableStateOf("No location selected") }
    
    
          // コントロール間およびその周囲にスペースを追加するために
          // コンポーザブルに .padding() 修飾子を付与します
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
                  modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
              )
              Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                  DropdownMenu(
                      // ドロップダウンメニューの表示/非表示を制御するために
                      // rememberされた値を使用します
                      expanded = showCountries,
                      onDismissRequest = { showCountries = false }
                  ) {
                      // 国ごとにドロップダウンメニュー項目を作成します
                      countries.forEach { (name, zone) ->
                          DropdownMenuItem(
                              text = { Text(name) },
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
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="countries.forEach { (name, zone) ->"}
   
4. IDEの提案に従って、不足しているシンボルをインポートします:
   * `Row()` をインポートする際は、`@Composable` バージョンを選択してください。
   * `Clock` をインポートする際は、`kotlin.time` パッケージのバージョンを選択してください。

アプリケーションを実行して、デザインが変更されたバージョンを確認します:

<Tabs>
    <TabItem id="mobile-country-list" title="Android and iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="Compose MultiplatformアプリのAndroidおよびiOSでの国リスト" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="Desktop">
        <img src="first-compose-project-on-desktop-8.png" alt="Compose Multiplatformアプリのデスクトップでの国リスト" width="350"/>
    </TabItem>
   <TabItem id="web-country-list" title="Web">
        <img src="first-compose-project-on-web-6.png" alt="Compose MultiplatformアプリのWebでの国リスト" width="500"/>
    </TabItem>
</Tabs>

> 新しいエミュレーターの作成や実機でのアプリ実行に関する詳細については、[Kotlin Multiplatformアプリケーションのビルドと実行](build-and-run-kmp.md)を参照してください。
>
{style="note"}

## 画像の導入 {id="introduce-images"}

さまざまな国をより分かりやすく表現するために、ドロップダウン内の国名の横に国旗の画像を追加します。

これを行うには、画像を適切なディレクトリに配置し、それらを読み込んで表示するコードを追加します:

1. 作成済みの国のリストに対応する国旗画像を [Flag CDN](https://flagcdn.com/) からダウンロードします。今回の例では、[日本](https://flagcdn.com/w320/jp.png)、[フランス](https://flagcdn.com/w320/fr.png)、[メキシコ](https://flagcdn.com/w320/mx.png)、[インドネシア](https://flagcdn.com/w320/id.png)、および [エジプト](https://flagcdn.com/w320/eg.png) です。

2. すべてのプラットフォームで同じ国旗が利用できるように、画像を `shared/src/commonMain/composeResources/drawable` ディレクトリに移動します:

   ![Compose Multiplatformリソースのプロジェクト構造](compose-resources-project-structure.png){width=300}

3. 画像のファイル名が上記と完全に一致していることを確認してください。Compose Multiplatformはファイル名に基づいてアクセサーを生成します。

4. 画像を使用するようにUIコードを更新します。
   `commonMain/kotlin/.../App.kt` ファイル内のコード全体を以下に置き換えます:

    ```kotlin
    package compose.project.demo

    import androidx.compose.foundation.Image
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.Row
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.fillMaxWidth
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.layout.safeContentPadding
    import androidx.compose.foundation.layout.size
    import androidx.compose.material3.Button
    import androidx.compose.material3.DropdownMenu
    import androidx.compose.material3.DropdownMenuItem
    import androidx.compose.material3.MaterialTheme
    import androidx.compose.material3.Text
    import androidx.compose.runtime.*
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.text.TextStyle
    import androidx.compose.ui.text.style.TextAlign
    import androidx.compose.ui.tooling.preview.Preview
    import androidx.compose.ui.unit.dp
    import androidx.compose.ui.unit.sp
    import kotlinx.datetime.LocalTime
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.format
    import kotlinx.datetime.format.char
    import kotlinx.datetime.toLocalDateTime
    import kotlin.time.Clock
    import composedemo.shared.generated.resources.Res
    import composedemo.shared.generated.resources.eg
    import composedemo.shared.generated.resources.fr
    import composedemo.shared.generated.resources.id
    import composedemo.shared.generated.resources.jp
    import composedemo.shared.generated.resources.mx
    import org.jetbrains.compose.resources.DrawableResource
    import org.jetbrains.compose.resources.painterResource
    
    // この型は国旗画像への参照も保持するようになりました
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }

    // インポートされたCompose Multiplatformリソースでリストを初期化して
    // 返します
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            // 各国は「DropdownMenuItem」内に
                            // 国旗（「Image()」）と名前（「Text()」）として表示されます
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
                                        // 「painterResource()」は「Image()」に必要な
                                        // Painterオブジェクトを提供します
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
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="import composedemo.shared.generated.resources.Res"}

5. アプリケーションを実行して、新しい挙動を確認します:

<Tabs>
    <TabItem id="mobile-flags" title="Android and iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="Compose MultiplatformアプリのAndroidおよびiOSでの国旗" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="Desktop">
        <img src="first-compose-project-on-desktop-9.png" alt="Compose Multiplatformアプリのデスクトップでの国旗" width="350"/>
    </TabItem>
   <TabItem id="web-flags" title="Web">
        <img src="first-compose-project-on-web-7.png" alt="Compose MultiplatformアプリのWebでの国旗" width="500"/>
    </TabItem>
</Tabs>

> プロジェクトの最終的な状態は、[GitHubリポジトリ](https://github.com/kotlin-hands-on/get-started-with-cm/)で確認できます。
>
{style="note"}

## 次のステップ {id="what-s-next"}

このチュートリアルでは、マルチプラットフォームプロジェクトの基本的な構成要素について説明しました。
詳細をさらに深く掘り下げるには:
* **Kotlin Multiplatform**
  * アプリケーションUIはネイティブのままでビジネスロジックのみを共有する、[別のチュートリアル](multiplatform-upgrade-app.md)を参照してください。
  * [Kotlin Multiplatformで利用可能なコード共有メカニズム](multiplatform-share-on-platforms.md)について詳しく学びます。
  * [Kotlin Multiplatformプロジェクト構造の背後にある原則](multiplatform-discover-project.md)について学びます。
  * マルチプラットフォームの依存関係を管理する方法の詳細については、[マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md)を参照してください。
* **Compose Multiplatform**
  * [Composeレイアウトの基礎](compose-layout.md)および[Compose修飾子（Modifier）の操作](compose-layout-modifiers.md)について学びます。
  * [Composeにおけるマルチプラットフォームリソースの可能性と課題](compose-multiplatform-resources.md)について学びます。
* **より高度なプロジェクト向けのチュートリアル**
  * [KtorとSQLDelightを使用したデータおよびネットワークロジックの共有](multiplatform-ktor-sqldelight.md)。
  * [高度なAndroidアプリのKMPへの移行](migrate-from-android.md)。
* [マルチプラットフォームのサンプルプロジェクト一覧](multiplatform-samples.md)を確認してください。

コミュニティに参加する:

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: KMPおよびCompose Multiplatformに関するヘルプを得たり、ディスカッションに参加したりできます。[招待をリクエスト](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)して、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) および [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) チャンネルに参加してください。
* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**: [リポジトリ](https://github.com/JetBrains/compose-multiplatform)にスターを付けたり、コントリビュートしたりしましょう。
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**: [「kotlin-multiplatform」タグ](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)を購読してください。
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTubeチャンネル**: チャンネル登録して、[Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) に関する動画をご覧ください。