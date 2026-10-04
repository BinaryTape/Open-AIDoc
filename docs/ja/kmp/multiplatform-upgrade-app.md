[//]: # (title: ネイティブ UI: REST API リクエスト用の共有ロジック)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

このチュートリアルでは、特定のビジネスロジックのコードを共有しながら、ネイティブコードで個別の UI を実装する方法を説明します。
ロジックと UI の両方を共有する例については、[完全に共有されたコード: タイムゾーン選択アプリ](compose-multiplatform-new-project.md) を参照してください。

ここでは、[Launch Library 2](https://lldev.thespacedevs.com/docs) REST API から最新の宇宙ロケット打ち上げ成功に関する情報を取得し、その結果を表示するアプリケーションを作成します。
ネットワーク処理およびデータシリアライズのコードは、iOS と Android の間で共有されます。

Kotlin Multiplatform IDE ウィザードで作成したプロジェクトから最終成果物に仕上げるために、以下の手順を行います。

1. [共通およびプラットフォーム固有の依存関係を設定する](#add-dependencies)
2. [API リクエストとレスポンス保存用のデータモデルをセットアップする](#set-up-api-requests)
3. ネイティブ UI でデータを取得・表示する:
   * [Android UI の更新](#update-native-android-ui) 
   * [iOS UI の更新](#update-native-ios-ui)。
     Kotlin コルーチンを Swift コードに統合するための2つの異なるライブラリを試すことができます。

> プロジェクトの最終状態は、GitHub リポジトリの2つのブランチで利用可能であり、それぞれ異なる iOS コルーチンソリューションが採用されています。
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) ブランチには KMP-NativeCoroutines 実装が含まれています。
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) ブランチには SKIE（Kotlin-Swift 相互運用性ライブラリ）実装が含まれています。
>
{style="tip"}

## プロジェクトの作成 {id="create-a-project"}

IDE と Kotlin Multiplatform IDE プラグインをインストールした状態で、新しい Kotlin Multiplatform プロジェクトを作成します。

1. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
2. 左側のパネルで **Kotlin Multiplatform** を選択します。
3. **New Project** ウィンドウで以下の項目を指定します。

    * **Name**: GreetingKMP
    * **Project ID**（パッケージ名として使用）: com.jetbrains.greetingkmp

4. **Android** と **iOS** のターゲットを選択します。
   iOS については、UI をネイティブに保つために **Do not share UI** オプションを選択します。
5. **Create** をクリックします。

   ![Kotlin Multiplatform プロジェクトの作成](create-first-multiplatform-app.png){width=700}

最初のインポートには数分かかります。
完了したら、すべての事前チェック（preflight checks）が緑色になっていることを確認してください（**View | Tool Windows | Projects Environment Preflight Checks**）。

## プロジェクト構造の確認 {id="examine-the-project-structure"}

IntelliJ IDEA で `GreetingKMP` フォルダを展開します。

この Kotlin Multiplatform プロジェクトには、以下のモジュールが含まれています。

* **androidApp** は、Android アプリケーションをビルドする Kotlin モジュールです。ビルドシステムとして Gradle を使用します。
  **androidApp** モジュールは、通常の Android ライブラリとして **sharedLogic** モジュールに依存し、これを使用します。
* **iosApp** は、iOS アプリケーションをビルドする Xcode プロジェクトです。
* **sharedLogic** は、Android アプリケーションと iOS アプリケーションで共有されるロジックを含むマルチプラットフォームモジュールです。
* **sharedUI** は、Compose Multiplatform で実装された UI コードを含むモジュールです。
  このプロジェクトでは、**sharedUI** は Android アプリでのみ使用されますが、必要に応じていつでも他のターゲットに拡張できます。
  Android では、[Compose Multiplatform の呼び出しが直接 Jetpack Compose に変換される](compose-multiplatform-jetpack-libraries.md)ため、この特定の構成においてオーバーヘッドはありません。

**iosApp** 以外のすべてのモジュールは、ビルドシステムとして Gradle を使用します。
**iosApp** モジュールは Xcode でビルドされ、Xcode が Kotlin の Gradle ビルドを呼び出して **sharedLogic** モジュールから iOS フレームワークを作成します。
これは Kotlin Multiplatform における「直接的な iOS 統合（_direct iOS integration_）」の一例です。

> Kotlin の iOS 向けビルドの詳細については、[iOS 統合方式](multiplatform-ios-integration-overview.md) を参照してください。
> 
{style="tip"}

## 依存関係の追加 {id="add-dependencies"}

プロジェクトには以下のマルチプラットフォームライブラリが必要です。

* タイムスタンプの処理とフォーマットを行う [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime)。
* HTTP 経由でデータを送受信するためのフレームワークである [Ktor](https://ktor.io/)。
* コルーチン Flow を使用してネットワーク呼び出しを非同期に処理する [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines)。
* API の JSON レスポンスを Kotlin オブジェクトにデシリアライズする [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)。

すべてのプラットフォーム固有コードは各ライブラリのプラットフォーム向けアーティファクトにラップされているため、プラットフォーム固有の呼び出しを独自に実装する必要はありません。

ネイティブ iOS UI では、Swift と Kotlin の間で非同期コードを橋渡しするための追加ライブラリが必要になります。
この設定については、共通 API の準備が完了した後の [iOS UI の更新](#update-native-ios-ui) セクションで説明します。

### Gradle バージョンカタログの更新 {id="update-the-gradle-version-catalog"}

`gradle/libs.versions.toml` に以下のエントリを追加し、Gradle ファイルを同期して、ビルド設定コードでこれらの参照を利用できるようにします。

```toml
[versions]
# ...
kotlinx-coroutines = "%coroutinesVersion%"
kotlinx-datetime = "%dateTimeVersion%"
ktor = "%ktorVersion%"

[libraries]
# ...
kotlinx-coroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }

[plugins]
# ...
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

### 対応するソースセットへの依存関係の追加 {id="add-dependencies-to-corresponding-source-sets"}

`sharedLogic/build.gradle.kts` ファイルの対応するソースセットにライブラリの参照を追加します。

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            // ...
            // Kotlin Multiplatform Gradle プラグインは、
            // コルーチンおよび datetime のプラットフォーム固有アーティファクトを
            // 自動的に追加します
            implementation(libs.kotlinx.coroutines)
            implementation(libs.kotlinx.datetime)
            // Ktor のメイン依存関係
            implementation(libs.ktor.client.core)
            // Ktor が特定のフォーマットで
            // シリアライズを使用できるようにするための依存関係
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.serialization.kotlinx.json)
        }
        androidMain.dependencies {
            // Ktor 用の Android エンジンを提供
            implementation(libs.ktor.client.android)
        }
        iosMain.dependencies {
            // Ktor 用の Darwin エンジンを提供
            implementation(libs.ktor.client.darwin)
        }
    }
}
```

Gradle ファイルを同期します。**Shift** を2回押し、**Sync Project with Gradle Files** コマンドを検索して実行します。

> マルチプラットフォーム依存関係の管理方法についての詳細は、[マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md) を参照してください。
>
{style="tip"}

## API リクエストのセットアップ {id="set-up-api-requests"}

データの取得には [Launch Library API](https://lldev.thespacedevs.com/docs) を使用し、具体的には **/2.3.0/launches** エンドポイントから打ち上げのリストを取得します。

### データモデルの作成 {id="create-a-data-model"}

`sharedLogic/src/commonMain/.../greetingkmp` ディレクトリに新しい `RocketLaunch.kt` ファイルを作成し、Launch Library API からのデータを格納するデータクラスを追加します。

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// @Serializable は、kotlinx.serialization プラグインに対して
// このクラス用のデフォルトシリアライザを自動生成するよう指示します
@Serializable
data class RocketLaunch(
    // @SerialName はフィールド名を再定義し、
    // シリアライズされたフォーマットでプロパティ名をより読みやすくします
    @SerialName("id")
    val id: String,
    @SerialName("name")
    val missionName: String,
    @SerialName("net")
    val launchDateUTC: String,
    @SerialName("status")
    val status: LaunchStatus,
)

@Serializable
data class LaunchStatus(
    @SerialName("id")
    val id: Int,
    @SerialName("name")
    val name: String,
)

@Serializable
data class LaunchListResponse(
    @SerialName("results")
    val results: List<RocketLaunch>,
)
```

### HTTP クライアントの接続 {id="connect-http-client"}

1. `sharedLogic/src/commonMain/.../greetingkmp` ディレクトリに新しい `RocketComponent` クラスを作成します。
2. `httpClient` プロパティを追加し、それを使用して HTTP GET リクエストの結果から最終的な文字列を構築します。

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.call.body
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.client.request.get
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.toLocalDateTime
    import kotlinx.serialization.json.Json
    import kotlin.time.Instant
    
    class RocketComponent {
        private val httpClient = HttpClient {
            // ContentNegotiation Ktor プラグインと JSON シリアライザが
            // GET リクエストの結果をデシリアライズします
            install(ContentNegotiation) {
                json(Json {
                    // より読みやすい JSON を生成
                    prettyPrint = true
                    // クォートなしのキーや文字列値など、
                    // 非標準の JSON 入力を許容
                    isLenient = true
                    // モデルで宣言されていないキーを無視
                    ignoreUnknownKeys = true
                })
            }
        }

        // 最新の打ち上げ成功の日付文字列を返します。
        // 中断関数 httpClient.get() を呼び出すため、
        // suspend としてマークされています
        private suspend fun getDateOfLastSuccessfulLaunch(): String {
            // ロケット打ち上げに関する情報を非同期で取得
            val response: LaunchListResponse =
                httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
            // 最新の打ち上げ成功を取得。
            // レスポンスでは打ち上げが新しい順にソートされており、
            // 成功した打ち上げには 'status.id' 3 が付けられています
            val lastSuccessLaunch = response.results.first { it.status.id == 3 }
            // 打ち上げ日時をローカル時刻に変換
            val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
                .toLocalDateTime(TimeZone.currentSystemDefault())

            // 日付は "MMMM D, YYYY" 形式（例: "JULY 15, 2026"）で表示されます
            return "${date.month} ${date.day}, ${date.year}"
        }

        // 中断関数 getDateOfLastSuccessfulLaunch() を使用して、
        // UI 用の最終的な文字列を構築します
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

   中断関数（suspending function）は、コルーチンまたは他の中断関数からしか呼び出すことができません。
   たとえば、`httpClient.get()` はスレッドをブロックすることなくネットワーク経由で非同期にデータを取得する必要があるため、中断関数となっています。
   `getDateOfLastSuccessfulLaunch()` 関数は `httpClient.get()` を呼び出すため、同様に `suspend` キーワードで修飾されています。

### コルーチン Flow の作成 {id="create-a-coroutine-flow"}

単に中断関数を呼び出す代わりに、一連の値を生成する必要がある場合は [Flow](https://kotlinlang.org/docs/flow.html) を使用できます。
Flow は、単一の値を返す中断関数とは異なり、値が生成されるたびに一連の値を順次放出（emit）できます。

1. `sharedLogic/src/commonMain/kotlin` ディレクトリにある `Greeting.kt` ファイルを開きます。
2. 主にネットワークリクエストに対応するため、`Greeting` クラスの `greet()` 関数を更新して文字列の `Flow` を返すようにします。
   この `Flow` 内で、`RocketComponent` プロパティを使用して打ち上げ日を放出します。

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.random.Random
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        private val platform = getPlatform()
   
        // 最新の打ち上げ成功日を保持
        private val rocketComponent = RocketComponent()
        // 挨拶文字列を構築し、1つずつ非同期に放出
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

    `Flow` は、中断可能なブロックをラップする [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) ビルダー関数で作成されます。

これで、`greet()` 関数は単一の `String` ではなく `Flow<String>` を返すようになりました。
ネイティブ UI コード側では `Greeting` クラスをインポートし、`greet()` 関数によって放出された文字列を収集（collect）します。

以降のセクションで示すように、ネイティブ UI で対応する変更を実装しましょう。

## ネイティブ Android UI の更新 {id="update-native-android-ui"}

共有モジュールと Android アプリケーションはどちらも Kotlin で書かれているため、Android から共有コードを使用するのは非常にシンプルです。

### ViewModel の導入 {id="introduce-a-view-model"}

ViewModel は、Android 開発において [Android Activity](https://developer.android.com/guide/components/activities/intro-activities) のライフサイクル全体を通して UI 関連のデータを管理するために一般的に使用されます。
アプリケーションが複雑になるにつれて、ViewModel を導入するメリットが大きくなります。
ViewModel は Launch Library API から受け取ったデータを保持し、UI から利用できるようにします。

`sharedUI/src/commonMain/.../greetingkmp` ディレクトリに、Android のライフサイクル機構と構成変更の追跡を利用するために、マルチプラットフォーム AndroidX ライブラリの `[ViewModel](https://developer.android.com/reference/kotlin/androidx/lifecycle/ViewModel)` を継承した新しい `MainViewModel` クラスを作成します。

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class MainViewModel: ViewModel() {
    // StateFlow は単一の現在の状態値を保持する Flow です
    val greetingList: StateFlow<List<String>>
        // 明示的なバッキングフィールドはクラス外部からは読み取り専用、
        // 内部からは可変（mutable）です
        field = MutableStateFlow<List<String>>(listOf())

    // Greeting().greet() の呼び出しによって放出されたすべての文字列を収集
    init {
        // この ViewModel が所有するコルーチン内で収集を開始します。
        // これは ViewModel が保持されている間アクティブであり、
        // ViewModel が破棄されると自動的にキャンセルされます。
        viewModelScope.launch {
            // 新しいフレーズを greetingList に追加
            Greeting().greet().collect { phrase ->
                greetingList.update { list -> list + phrase }
            }
        }
    }
}
```

### ViewModel の Flow の利用 {id="use-the-view-model-s-flow"}

`sharedUI/src/commonMain/.../greetingkmp` で `App.kt` ファイルを開き、新しく実装した ViewModel を使用するように既存の実装を置き換えます。

Flow が新しい値を放出するにつれて、コンポジションが更新され、挨拶のフレーズが1つずつ表示されます。

```kotlin
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material3.HorizontalDivider
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.ui.unit.dp

@Composable
@Preview
fun App(mainViewModel: MainViewModel = viewModel()) {
    MaterialTheme {
        // ViewModel の Flow から greetingList の値を収集し、
        // ライフサイクルを認識した方法で Composable な状態として表現します
        val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()

        // 挨拶フレーズを区切り線付きの Column として表示
        Column(
            modifier = Modifier
                .safeContentPadding()
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            greetings.forEach { greeting ->
                Text(greeting)
                HorizontalDivider()
            }
        }
    }
}
```

### インターネットアクセスのパーミッション追加 {id="add-internet-access-permission"}

Android アプリケーションがインターネットにアクセスできるようにするには、`androidApp/src/main/AndroidManifest.xml` ファイルに以下のパーミッションを追加します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <!-- マニフェストの残りの部分 -->
</manifest>
```

### アプリの実行 {id="run-the-app"}

最終結果を確認するには、**androidApp** 実行構成を実行します。

> 新しいエミュレータの作成や実機でのアプリ実行に関する詳細は、[Kotlin Multiplatform アプリケーションのビルドと実行](build-and-run-kmp.md) を参照してください。
>
{style="note"}

![Android の最終結果](multiplatform-mobile-upgrade-android.png){width=350}

## ネイティブ iOS UI の更新 {id="update-native-ios-ui"}

プロジェクトの iOS 側でも、Android アプリと同様に ViewModel パターンを利用して UI を `sharedLogic` モジュールに接続します。
このモジュールは、`ContentView.swift` ファイル内に `import SharedLogic` 宣言ですでにインポートされています。

iOS アプリのコードは `iosApp/iosApp` ディレクトリに含まれています。
`ContentView.swift` にロジックの大半が含まれ、`iOSApp.swift` にアプリのエントリポイントが含まれています。

### `ViewModel` の導入 {id="introduce-a-viewmodel"}

`iosApp/ContentView.swift` ファイルに、`ContentView` 用のデータを準備・管理する `ViewModel` クラスを作成します。
ファイル全体を以下のコードに置き換えます。

```swift
import SwiftUI
import SharedLogic

struct ContentView: View {
    // 下記で ObservableObject として宣言されている
    // ビューモデルをビューに購読させます
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            // 並行処理をサポートするため、.task モディファイアを使用して
            // startObserving() 関数を呼び出します
            .task { await self.viewModel.startObserving() }
    }
}

// ViewModel は ContentView と密接に関連しているため、
// その extension として宣言されます
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        // このプロパティは、ViewModel の Flow から放出された
        // 挨拶フレーズを保持するためのものです
        @Published var greetings: [String] = []
        
        func startObserving() {
            // 実装内容は選択した iOS コルーチンライブラリに依存します（後述）
        }
    }
}

struct ListView: View {
    let phrases: Array<String>

    var body: some View {
        List(phrases, id: \.self) {
            Text($0)
        }
    }
}
```

SwiftUI はビューモデル（`ContentView.ViewModel`）とビュー（`ContentView`）を次のように接続します。

* `ContentView.ViewModel` クラスは `ObservableObject` として宣言されており、変更を通知できます。
  `ContentView` 内の `viewModel` プロパティの `@ObservedObject` ラッパーが、ビューをこれらの変更に購読させます。
* `@Published` ラッパーを持つ `greetings` プロパティへの変更により、SwiftUI がトリガーされて `ContentView` が更新されます。

次に、Swift で Kotlin の Flow を利用できる既存の KMP ライブラリのいずれかを使用して、`startObserving()` 関数を実装する必要があります。

### Swift で Kotlin の Flow を利用するためのライブラリの選択 {id="choose-a-library-for-consuming-kotlin-flows-in-swift"}

このチュートリアルでは、iOS で Flow を扱うために [SKIE](https://skie.touchlab.co/) または [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) ライブラリを使用できます。
どちらも、Kotlin/Native コンパイラがデフォルトではまだ提供していない、Flow におけるキャンセル処理やジェネリクスをサポートするオープンソースソリューションです。

* KMP-NativeCoroutines ライブラリは、必要なラッパーを生成することで、iOS から中断関数や Flow を利用できるようにします。
  KMP-NativeCoroutines は、Combine や RxSwift に加えて、Swift の `async`/`await` 機能をサポートしています。
  KMP-NativeCoroutines を使用するには、iOS プロジェクトで SwiftPM または CocoaPods の依存関係を追加する必要があります。
* SKIE ライブラリは、Kotlin コンパイラによって生成された Objective-C API を拡張します。SKIE は Flow を Swift の `AsyncSequence` 相当のものに変換します。SKIE は、スレッド制限なしで、自動的な双方向キャンセルを伴って Swift の `async`/`await` を直接サポートします（Combine や RxSwift にはアダプターが必要です）。SKIE は、さまざまな Kotlin 型を Swift の同等の型にブリッジするなど、Kotlin から Swift フレンドリーな API を生成するためのその他の機能も提供します。また、iOS プロジェクトに追加の依存関係を追加する必要がありません。

  > 最新の SKIE は、最新の安定版 Kotlin バージョンをサポートしていない場合があります。
  > どの Kotlin バージョンにダウングレードすべきかを確認するには、[最新バージョンの変更履歴（changelog）](https://skie.touchlab.co/category/changelog) をチェックしてください。

### オプション 1: KMP-NativeCoroutines の設定 {initial-collapse-state="collapsed" collapsible="true" id="option-1-configure-kmp-nativecoroutines"}

KMP-NativeCoroutines の依存関係を含めるようにビルドスクリプトを更新します。

1. Gradle [バージョンカタログ](https://docs.gradle.org/current/userguide/version_catalogs.html) に KMP-NativeCoroutines のバージョンとプラグインの参照を追加します。

    ```toml
    [versions]
    kmpNativeCoroutines = "%kmpncVersion%"
    
    [plugins]
    kmpNativeCoroutines = { id = "com.rickclephas.kmp.nativecoroutines", version.ref = "kmpNativeCoroutines" }
    ```

2. プロジェクトのルートにある `build.gradle.kts` ファイル（`sharedLogic/build.gradle.kts` ファイル**ではありません**）で、`plugins {}` ブロックに KMP-NativeCoroutines プラグインを追加します。

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines) apply false
    }
    ```

3. `sharedLogic/build.gradle.kts` ファイルで、`plugins {}` ブロックに KMP-NativeCoroutines プラグインを追加します。

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines)
    }
    ```

4. 同じ `sharedLogic/build.gradle.kts` ファイルで、実験的な `@ObjCName` アノテーションをオプトインします。

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                }
            }
            // ...
        }
    }
    ```

5. **Shift** を2回押し、**Sync Project with Gradle Files** コマンドを検索して実行します。

#### KMP-NativeCoroutines で Flow にアノテーションを付加 {id="mark-the-flow-with-kmp-nativecoroutines"}

1. `sharedLogic/src/commonMain/kotlin` ディレクトリにある `Greeting.kt` ファイルを開きます。
2. `greet()` 関数に `@NativeCoroutines` アノテーションを追加します。
   これにより、プラグインは iOS 上での正しい Flow 処理をサポートするコードを生成します。

   ```kotlin
    import com.rickclephas.kmp.nativecoroutines.NativeCoroutines
    
    class Greeting {
        // ...
       
        @NativeCoroutines
        fun greet(): Flow<String> = flow {
            // ...
        }
    }
    ```

#### Xcode で SwiftPM を使用してライブラリをインポート

`async/await` メカニズムの操作に必要な KMP-NativeCoroutines Swift パッケージのパーツをインストールします。

1. **File | Open Project in Xcode** に移動します。
2. Xcode で、左側のメニューにある `iosApp` プロジェクトを右クリックし、**Add Package Dependencies** を選択します。
3. 検索バーにパッケージ名を入力します。

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![KMP-NativeCoroutines のインポート](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. **Dependency Rule** ドロップダウンで **Exact Version** を選択し、隣接するフィールドにバージョン `%kmpncVersion%` を入力します。
5. **Add Package** ボタンをクリックします。Xcode は GitHub からパッケージを取得し、パッケージ製品を選択するための別のウィンドウを開きます。
6. 図のように **KMPNativeCoroutinesAsync** と **KMPNativeCoroutinesCore** をアプリに追加し、**Add Package** をクリックします。

   ![KMP-NativeCoroutines パッケージの追加](multiplatform-add-package.png){width=500}
7. IntelliJ IDEA に戻り、**Tools | Swift Package Manager | Resolve Dependencies** を選択します。
   これにより、Kotlin Multiplatform ビルドタスクで使用される `Package.resolved` ロックファイルが作成されます。このファイルは、Swift パッケージのバージョンの一貫性を保つためにリポジトリにコミットできます。

#### KMP-NativeCoroutines ライブラリを使用した Flow の利用

1. `iosApp/ContentView.swift` で `startObserving()` 関数を更新し、KMP-NativeCoroutines の `asyncSequence()` 関数を使用して Flow を利用します。

    ```swift
    func startObserving() async {
        do {
            // Kotlin の Greeting().greet() から放出された Flow を利用
            let sequence = asyncSequence(for: Greeting().greet())
            for try await phrase in sequence {
                self.greetings.append(phrase)
            }
        } catch {
            print("Failed with error: \(error)")
        }
    }
    ```

   ここでは、Flow を反復処理し、Flow が値を放出するたびに `greetings` プロパティを更新するために、ループと `await` メカニズムが使用されています。

2. `ViewModel` に `@MainActor` アノテーションが付いていることを確認します。

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        // `ViewModel` 内のすべての非同期操作が
        // アプリのメイン UI コンテキスト内で実行されることを保証します。
        // これにより、UI に反映されない `@Published` プロパティの更新を防ぎます。
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: [String] = []
    
            func startObserving() async {
                do {
                    let sequence = asyncSequence(for: Greeting().greet())
                    for try await phrase in sequence {
                        self.greetings.append(phrase)
                    }
                } catch {
                    print("Failed with error: \(error)")
                }
            }
        }
    }
    ```

ここでの `@MainActor` は、プロジェクトをビルドして Kotlin のシンボル（具体的には `greet()`）が iOS プロジェクトの依存関係と同期されるまで、未解決の参照（unresolved reference）エラーを引き起こす可能性があります。

> ビルドエラーが発生した場合は、Kotlin と KMP-NativeCoroutines のバージョンに互換性があることを確認してください。
> Gradle プラグインのバージョンと Swift パッケージのバージョンの両方を、[互換性マトリックス](https://github.com/rickclephas/KMP-NativeCoroutines#compatibility) に従って設定する必要があります。
>
{style="warning"}

### オプション 2: SKIE の設定 {initial-collapse-state="collapsed" collapsible="true"}

ライブラリをセットアップするには、Gradle バージョンカタログに SKIE のバージョンとプラグイン参照を追加します。

```toml
[versions]
skie = "%skieVersion%"

[plugins]
skie = { id = "co.touchlab.skie", version.ref = "skie" }
```

> SKIE は、最新の安定版 Kotlin バージョンをサポートしていない場合があります。
> お使いの Kotlin バージョンが新しすぎる場合、Gradle の同期中に安全にダウングレードできるバージョンのリストとともに報告されます。
> 
{style="note"}

次に、`sharedLogic/build.gradle.kts` ファイルのプラグインリストに追加します。

```kotlin
plugins {
    //...
    alias(libs.plugins.skie)
}
```

**Shift** を2回押し、**Sync Project with Gradle Files** コマンドを検索して実行します。

#### SKIE を使用した Flow の利用 {id="consume-the-flow-using-skie"}

ループと `await` メカニズムを使用して `Greeting().greet()` Flow を反復処理し、Flow が値を放出するたびに `greetings` プロパティを更新します。

`ViewModel` に `@MainActor` アノテーションが付いていることを確認してください。
このアノテーションは、Kotlin/Native の要件に準拠するために、`ViewModel` 内のすべての非同期操作がメインスレッドで実行されることを保証します。

```Swift
// ...
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: [String] = []

        func startObserving() async {
            for await phrase in Greeting().greet() {
                self.greetings.append(phrase)
            }
        }
    }
}
```

### ViewModel の利用と iOS アプリの実行 {id="consume-the-viewmodel-and-run-the-ios-app"}

`iosApp/iOSApp.swift` で、アプリのエントリポイントを更新します。

```swift
import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(viewModel: ContentView.ViewModel())
        }
    }
}
```

IntelliJ IDEA から **iosApp** 構成を実行し、アプリのロジックが同期されていることを確認します。

> 新しいエミュレータの作成や実機でのアプリ実行に関する詳細は、[Kotlin Multiplatform アプリケーションのビルドと実行](build-and-run-kmp.md) を参照してください。
>
{style="note"}

![最終結果](multiplatform-mobile-upgrade-ios.png){width=350}

## プロジェクトの最終状態 {id="final-state-of-the-project"}

プロジェクトの最終状態は、異なるコルーチンソリューションを採用した GitHub リポジトリの2つのブランチで確認できます。
* [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) ブランチには KMP-NativeCoroutines 実装が含まれています。
* [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) ブランチには SKIE 実装が含まれています。

## 発生する可能性のある問題と解決策 {id="possible-issues-and-solutions"}

### Xcode が共有フレームワークを呼び出すコードでエラーを報告する {id="xcode-reports-errors-in-the-code-calling-the-shared-framework"}

Xcode で作業している場合、Xcode プロジェクトがフレームワークの古いバージョンを使用している可能性があります。
これを解決するには、IntelliJ IDEA または Android Studio に戻ってプロジェクトをリビルドするか、iOS 実行構成を開始してください。

### Xcode が共有フレームワークのインポート時にエラーを報告する {id="xcode-reports-an-error-when-importing-the-shared-framework"}

Xcode を使用している場合、キャッシュされたバイナリをクリアする必要があるかもしれません。メインメニューの **Product | Clean Build Folder** を選択して、環境をリセットしてみてください。

## 次のステップ {id="what-s-next"}

* UI コードも共有する [別のチュートリアル](compose-multiplatform-new-project.md) を参照してください。
* Kotlin Multiplatform がサポートするコード共有のさまざまなアプローチについては、[プラットフォーム間でのコード共有](multiplatform-share-on-platforms.md) を参照してください。
* [Kotlin Multiplatform プロジェクト構造の背後にある原則](multiplatform-discover-project.md) について学びましょう。
* マルチプラットフォームの依存関係を管理する方法の詳細については、[マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md) を参照してください。
* Kotlin Multiplatform プロジェクトを [iOS アプリと統合](multiplatform-ios-integration-overview.md) する方法を確認してください。
* [ネットワーク処理とデータストレージ](multiplatform-ktor-sqldelight.md) に関するチュートリアルに従って、より複雑な KMP アプリを作成してみましょう。
* [厳選されたサンプルマルチプラットフォームプロジェクトのリスト](multiplatform-samples.md) を参照してください。
* [中断関数の構成](https://kotlinlang.org/docs/coroutines-basics.html) に対するさまざまなアプローチを確認してください。

## サポートの利用 {id="get-help"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: KMP および Compose Multiplatform に関するディスカッションに参加し、サポートを受けられます。[招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) をリクエストして、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin 課題トラッカー**: [新しい課題を報告する](https://youtrack.jetbrains.com/newIssue?project=KT)。