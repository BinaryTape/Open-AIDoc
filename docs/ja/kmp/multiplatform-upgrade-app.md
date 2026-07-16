[//]: # (title: iOSとAndroid間でより多くのロジックを共有する)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>このチュートリアルではIntelliJ IDEAを使用しますが、Android Studioでも同様に進めることができます。両方のIDEは同じコア機能とKotlin Multiplatformのサポートを共有しています。</p>
    <br/>
    <p>これは<strong>「共有ロジックとネイティブUIを備えたKotlin Multiplatformアプリの作成」</strong>チュートリアルの第4部です。続行する前に、前のステップを完了していることを確認してください。</p>
    <p><img src="icon-1-done.svg" width="20" alt="First step"/> <Links href="/kmp/multiplatform-create-first-app" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the first part of the Create a Kotlin Multiplatform app with shared logic and native UI tutorial. Create your Kotlin Multiplatform app Update the user interface Add dependencies Share more logic Wrap up your project">Kotlin Multiplatformアプリの作成</Links><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <Links href="/kmp/multiplatform-update-ui" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the second part of the Create a Kotlin Multiplatform app with shared logic and native UI tutorial. Before proceeding, make sure you've completed previous steps. Create your Kotlin Multiplatform app Update the user interface Add dependencies Share more logic Wrap up your project">ユーザーインターフェースの更新</Links><br/>
      <img src="icon-3-done.svg" width="20" alt="Third step"/> <Links href="/kmp/multiplatform-dependencies" summary="This tutorial uses IntelliJ IDEA, but you can also follow it in Android Studio – both IDEs share the same core functionality and Kotlin Multiplatform support. This is the third part of the Create a Kotlin Multiplatform app with shared logic and native UI tutorial. Before proceeding, make sure you've completed previous steps. Create your Kotlin Multiplatform app Update the user interface Add dependencies Share more logic Wrap up your project">依存関係の追加</Links><br/>
      <img src="icon-4.svg" width="20" alt="Fourth step"/> <strong>より多くのロジックを共有する</strong><br/>
      <img src="icon-5-todo.svg" width="20" alt="Fifth step"/> プロジェクトのまとめ<br/>
    </p>
</tldr>

外部の依存関係を使用して共通ロジックを実装したので、より複雑なロジックの追加を開始できます。ネットワークリクエストとデータシリアライゼーションは、Kotlin Multiplatformを使用してコードを共有するための[最も一般的なユースケース](https://kotlinlang.org/lp/multiplatform/)です。このオンボーディングジャーニーを完了した後に将来のプロジェクトで使用できるように、最初のアプリケーションでこれらを実装する方法を学びましょう。

更新されたアプリは、インターネット経由で [SpaceX API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) からデータを取得し、SpaceXロケットの最新の打ち上げ成功日を表示します。

> プロジェクトの最終的な状態は、GitHubリポジトリの2つのブランチにあり、それぞれ異なるコルーチンソリューションが含まれています。
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) ブランチには、KMP-NativeCoroutinesによる実装が含まれています。
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) ブランチには、SKIEによる実装が含まれています。
>
{style="note"}

## 依存関係の追加

プロジェクトに以下のマルチプラットフォームライブラリを追加する必要があります。

* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines): 非同期コードにコルーチン（coroutines）を使用し、同時操作を可能にします。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization): JSONレスポンスを、ネットワーク操作の処理に使用されるエンティティクラスのオブジェクトにデシリアライズします。
* [Ktor](https://ktor.io/): インターネット経由でデータを取得するためのHTTPクライアントを作成するためのフレームワークです。

### kotlinx.coroutines

プロジェクトに `kotlinx.coroutines` を追加するには、共通ソースセット（common source set）に依存関係を指定します。そのためには、`shared/build.gradle.kts` ファイルに以下の行を追加します。

```kotlin
kotlin {
    // ... 
    sourceSets {
        commonMain.dependencies {
           // ...
           implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

Kotlin Multiplatform Gradleプラグインは、`kotlinx.coroutines` のプラットフォーム固有（iOSおよびAndroid）の部分への依存関係を自動的に追加します。

### kotlinx.serialization

`kotlinx.serialization` ライブラリを使用するには、対応する Gradle プラグインをセットアップします。
そのためには、`shared/build.gradle.kts` ファイルの冒頭にある既存の `plugins {}` ブロックに以下の行を追加します。

```kotlin
plugins {
    // ...
    kotlin("plugin.serialization") version "%kotlinVersion%"
}
```

### Ktor

共有モジュールの共通ソースセットにコアの依存関係 (`ktor-client-core`) を追加する必要があります。
また、サポートする依存関係も追加する必要があります。

* `ContentNegotiation` 機能 (`ktor-client-content-negotiation`) を追加します。これにより、特定の形式でコンテンツをシリアライズおよびデシリアライズできるようになります。
* `ktor-serialization-kotlinx-json` 依存関係を追加して、KtorにJSON形式とシリアライゼーションライブラリとして `kotlinx.serialization` を使用するように指示します。KtorはJSONデータを期待し、レスポンス受信時にそれをデータクラスにデシリアライズします。
* プラットフォームソースセット (`ktor-client-android`, `ktor-client-darwin`) に対応するアーティファクトへの依存関係を追加して、プラットフォームエンジンを提供します。

```kotlin
kotlin {
    // ...
    val ktorVersion = "%ktorVersion%"

    sourceSets {
        commonMain.dependencies {
            // ...

            implementation("io.ktor:ktor-client-core:$ktorVersion")
            implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
            implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
        }
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-android:$ktorVersion")
        }
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:$ktorVersion")
        }
    }
}
```

**Sync Gradle Changes** ボタンをクリックして、Gradle ファイルを同期します。

## APIリクエストの作成

データを取得するには [SpaceX API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) が必要です。**v4/launches** エンドポイントからすべての打ち上げリストを取得するために単一のメソッドを使用します。

### データモデルの追加

`shared/src/commonMain/.../greetingkmp` ディレクトリに新しい `RocketLaunch.kt` ファイルを作成し、SpaceX API からのデータを格納するデータクラスを追加します。

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RocketLaunch (
    @SerialName("flight_number")
    val flightNumber: Int,
    @SerialName("name")
    val missionName: String,
    @SerialName("date_utc")
    val launchDateUTC: String,
    @SerialName("success")
    val launchSuccess: Boolean?,
)
```

* `RocketLaunch` クラスには `@Serializable` アノテーションが付与されており、`kotlinx.serialization` プラグインが自動的にデフォルトのシリアライザーを生成できるようになっています。
* `@SerialName` アノテーションを使用すると、フィールド名を再定義できるため、データクラスでより読みやすい名前のプロパティを宣言できます。

### HTTPクライアントの接続

1. `shared/src/commonMain/.../greetingkmp` ディレクトリに新しい `RocketComponent` クラスを作成します。
2. HTTP GET リクエストを通じてロケットの打ち上げ情報を取得するための `httpClient` プロパティを追加します。

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.serialization.json.Json
    
    class RocketComponent {
        private val httpClient = HttpClient {
            install(ContentNegotiation) {
                json(Json {
                    prettyPrint = true
                    isLenient = true
                    ignoreUnknownKeys = true
                })
            }
        }
    }
    ```

   * Ktorの [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html#register_json) プラグインとJSONシリアライザーが、GETリクエストの結果をデシリアライズします。
   * ここでのJSONシリアライザーは、`prettyPrint` プロパティによってJSONをより読みやすい形式で出力するように構成されています。また、`isLenient` によって不正な形式のJSONを読み取る際に柔軟に対応し、`ignoreUnknownKeys` によってロケット打ち上げモデルで宣言されていないキーを無視します。

3. `RocketComponent` に `getDateOfLastSuccessfulLaunch()` suspend関数（suspending function）を追加します。

   ```kotlin
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
       
       }
   }
   ```

4. ロケットの打ち上げに関する情報を取得するために `httpClient.get()` 関数を呼び出します。

   ```kotlin
   import io.ktor.client.request.get
   import io.ktor.client.call.body

   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: `List<RocketLaunch>` = httpClient.get("https://api.spacexdata.com/v4/launches").body()
       }
   }
   ```

   * `httpClient.get()` も suspend関数です。スレッドをブロックせずに非同期でネットワーク経由でデータを取得する必要があるためです。
   * suspend関数は、コルーチンまたは他のsuspend関数からしか呼び出すことができません。そのため、`getDateOfLastSuccessfulLaunch()` に `suspend` キーワードが付与されています。ネットワークリクエストはHTTPクライアントのスレッドプールで実行されます。

5. リスト内の最後の打ち上げ成功を見つけるように、関数を再度更新します。

   ```kotlin
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: `List<RocketLaunch>` = httpClient.get("https://api.spacexdata.com/v4/launches").body()
           val lastSuccessLaunch = rockets.last { it.launchSuccess == true }
       }
   }
   ```

   ロケットの打ち上げリストは、日付の古い順に並んでいます。

6. 打ち上げ日をUTCからローカルの日付に変換し、出力をフォーマットします。

   ```kotlin
   import kotlinx.datetime.TimeZone
   import kotlinx.datetime.toLocalDateTime
   import kotlin.time.ExperimentalTime
   import kotlin.time.Instant

   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: `List<RocketLaunch>` =
               httpClient.get("https://api.spacexdata.com/v4/launches").body()
           val lastSuccessLaunch = rockets.last { it.launchSuccess == true }
           val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
               .toLocalDateTime(TimeZone.currentSystemDefault())
       
           return "${date.month} ${date.day}, ${date.year}"
       }
   }
   ```

   日付は "MMMM DD, YYYY" 形式（例：OCTOBER 5, 2022）になります。

7. `getDateOfLastSuccessfulLaunch()` 関数を使用してメッセージを作成する別の suspend関数 `launchPhrase()` を追加します。

    ```kotlin
    class RocketComponent {
        // ...
    
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

### Flowの作成

suspend関数の代わりに Flow（フロー）を使用できます。Flowは、suspend関数が返す単一の値ではなく、値のシーケンスをエミット（放出）します。

1. `shared/src/commonMain/kotlin` ディレクトリにある `Greeting.kt` ファイルを開きます。
2. `Greeting` クラスに `rocketComponent` プロパティを追加します。このプロパティは、最新の打ち上げ成功日のメッセージを保持します。

   ```kotlin
   private val rocketComponent = RocketComponent()
   ```

3. `greet()` 関数を `Flow` を返すように変更します。

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        // ...
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            delay(1.seconds)
            emit(daysPhrase())
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

   * ここでは、すべてのステートメントをラップする `flow()` ビルダー関数を使用して `Flow` が作成されています。
   * `Flow` は、各エミッションの間に1秒の遅延を置いて文字列をエミットします。最後の要素はネットワークレスポンスが返ってきた後にのみエミットされるため、正確な遅延はネットワーク状況に依存します。

### インターネットアクセス権限の追加

インターネットにアクセスするために、Androidアプリケーションには適切な権限が必要です。すべてのネットワークリクエストは共有モジュールから行われるため、そのマニフェストにインターネットアクセス権限を追加するのが適切です。

`composeApp/src/androidMain/AndroidManifest.xml` ファイルをアクセス権限で更新します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    ...
</manifest>
```

`greet()` 関数の戻り値の型を `Flow` に変更することで、共有モジュールのAPIをすでに更新しました。次に、プロジェクトのネイティブ部分を更新して、`greet()` 関数の呼び出し結果を適切に処理できるようにする必要があります。

## ネイティブAndroid UIの更新

共有モジュールとAndroidアプリケーションの両方がKotlinで記述されているため、Androidから共有コードを使用するのは非常に簡単です。

### ViewModelの導入

アプリケーションがより複雑になってきたので、`MainActivity` と呼ばれる [Android アクティビティ](https://developer.android.com/guide/components/activities/intro-activities)に ViewModel を導入しましょう。これはUIを実装する `App()` 関数を呼び出します。ViewModelはアクティビティからのデータを管理し、アクティビティがライフサイクルの変更を受けても消滅しません。

1. `composeApp/src/androidMain/.../greetingkmp` ディレクトリに、新しい `MainViewModel` Kotlin クラスを作成します。

    ```kotlin
    import androidx.lifecycle.ViewModel
    
    class MainViewModel : ViewModel() {
        // ...
    }
    ```

   このクラスは Android の `ViewModel` クラスを継承しており、ライフサイクルや構成（Configuration）の変更に関する正しい動作を保証します。

2. [StateFlow](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 型の `greetingList` 値とそのバッキングプロパティ（backing property）を作成します。

    ```kotlin
    import kotlinx.coroutines.flow.MutableStateFlow
    import kotlinx.coroutines.flow.StateFlow
    
    class MainViewModel : ViewModel() {
        private val _greetingList = MutableStateFlow<List<String>>(listOf())
        val greetingList: StateFlow<List<String>> get() = _greetingList
    }
    ```

   * ここでの `StateFlow` は `Flow` インターフェースを継承していますが、単一の値または状態（state）を持ちます。
   * プライベートなバッキングプロパティ `_greetingList` により、このクラスのクライアントだけが読み取り専用の `greetingList` プロパティにアクセスできるようになります。

3. ViewModel の `init` 関数内で、`Greeting().greet()` フローからすべての文字列を収集（collect）します。

    ```kotlin
   import androidx.lifecycle.viewModelScope
   import kotlinx.coroutines.launch
   
   class MainViewModel : ViewModel() {
       private val _greetingList = MutableStateFlow<List<String>>(listOf())
       val greetingList: StateFlow<List<String>> get() = _greetingList
       
       init {
           viewModelScope.launch {
               Greeting().greet().collect { phrase ->
                    //...
               }
           }
       }
    }
    ```

   `collect()` 関数は suspend関数であるため、ViewModel のスコープ内で `launch` コルーチンが使用されます。これは、`launch` コルーチンが ViewModel のライフサイクルの正しいフェーズの間だけ実行されることを意味します。

4. `collect` の末尾ラムダ内で、`_greetingList` の値を更新して、収集した `phrase` を `list` 内のフレーズリストに追加します。

    ```kotlin
    import kotlinx.coroutines.flow.update
   
    class MainViewModel : ViewModel() {
        //...
   
        init {
            viewModelScope.launch {
                Greeting().greet().collect { phrase ->
                    _greetingList.update { list -> list + phrase }
                }
            }
        }
    }
    ```

   `update()` 関数は値を自動的に更新します。

### ViewModelのFlowを使用する

1. `composeApp/src/androidMain/kotlin` で `App.kt` ファイルを開き、以前の実装を置き換えて更新します。

    ```kotlin
    import androidx.lifecycle.compose.collectAsStateWithLifecycle
    import androidx.compose.runtime.getValue
    import androidx.lifecycle.viewmodel.compose.viewModel
    
    @Composable
    @Preview
    fun App(mainViewModel: MainViewModel = viewModel()) {
        MaterialTheme {
            val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()
    
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

   * `collectAsStateWithLifecycle()` 関数は `greetingList` に対して呼び出され、ViewModel の Flow から値を収集し、ライフサイクルを考慮した方法でコンポーザブルな状態として表現します。
   * 新しい Flow が作成されると、Compose の状態が変化し、垂直に配置されディバイダーで区切られた挨拶フレーズを含むスクロール可能な `Column` が表示されます。

2. 結果を確認するには、**composeApp** 構成を再実行します。

   ![最終結果](multiplatform-mobile-upgrade-android.png){width=300}

## ネイティブiOS UIの更新

プロジェクトの iOS 部分では、[Model–view–viewmodel](https://ja.wikipedia.org/wiki/Model_View_ViewModel) (MVVM) パターンを再度使用して、すべてのビジネスロジックを含む共有モジュールに UI を接続します。

モジュールは、`ContentView.swift` ファイル内で `import Shared` 宣言によってすでにインポートされています。

### ViewModelの導入

`iosApp/ContentView.swift` で、`ContentView` のための `ViewModel` クラスを作成します。これはデータを準備して管理します。並行処理をサポートするために、`task()` 呼び出し内で `startObserving()` 関数を呼び出します。

```swift
import SwiftUI
import Shared

struct ContentView: View {
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            .task { await self.viewModel.startObserving() }
    }
}

extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: `Array<String>` = []
        
        func startObserving() {
            // ...
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

* `ViewModel` は `ContentView` と密接に関連しているため、そのエクステンションとして宣言されています。
* `ViewModel` は、`String` フレーズの配列である `greetings` プロパティを持っています。SwiftUI は ViewModel (`ContentView.ViewModel`) をビュー (`ContentView`) に接続します。
* `ContentView.ViewModel` は `ObservableObject` として宣言されています。
* `greetings` プロパティには `@Published` ラッパーが使用されています。
* ViewModel を購読（サブスクライブ）するために `@ObservedObject` プロパティラッパーが使用されています。

この ViewModel は、このプロパティが変更されるたびにシグナルをエミットします。次に、Flow を消費（利用）するために `startObserving()` 関数を実装する必要があります。

### iOSからFlowを消費するためのライブラリを選択する

このチュートリアルでは、iOS で Flow を操作しやすくするために、[SKIE](https://skie.touchlab.co/) または [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) ライブラリを使用できます。
これらはいずれも、Kotlin/Native コンパイラがデフォルトではまだ提供していない、Flow によるキャンセルやジェネリクスをサポートするオープンソースのソリューションです。

* SKIE ライブラリは、Kotlin コンパイラによって生成される Objective-C API を拡張します。SKIE は Flow を Swift の `AsyncSequence` に相当するものに変換します。SKIE は、スレッドの制限なしで Swift の `async`/`await` を直接サポートし、双方向の自動キャンセル機能を備えています（Combine や RxSwift にはアダプターが必要です）。SKIE は、さまざまな Kotlin 型を Swift の同等な型にブリッジするなど、Kotlin から Swift フレンドリーな API を生成するための他の機能も提供します。また、iOS プロジェクトに追加の依存関係を追加する必要もありません。
* KMP-NativeCoroutines ライブラリは、必要なラッパーを生成することで、iOS から suspend関数や Flow を利用しやすくします。KMP-NativeCoroutines は Swift の `async`/`await` 機能に加えて、Combine や RxSwift もサポートしています。KMP-NativeCoroutines を使用するには、iOS プロジェクトに SwiftPM または CocoaPod の依存関係を追加する必要があります。

### オプション1. KMP-NativeCoroutinesの構成 {initial-collapse-state="collapsed" collapsible="true"}

> 最新バージョンのライブラリを使用することをお勧めします。
> [KMP-NativeCoroutinesのリポジトリ](https://github.com/rickclephas/KMP-NativeCoroutines/releases)を確認して、プラグインの新しいバージョンが利用可能かどうかを確認してください。
>
{style="note"}

1. プロジェクトのルートにある `build.gradle.kts` ファイル（`shared/build.gradle.kts` ファイル**ではない**）で、KSP (Kotlin Symbol Processor) と KMP-NativeCoroutines プラグインを `plugins {}` ブロックに追加します。

    ```kotlin
    plugins {
        // ...
        id("com.google.devtools.ksp").version("%kspVersion%").apply(false)
        id("com.rickclephas.kmp.nativecoroutines").version("%kmpncVersion%").apply(false)
    }
    ```

2. `shared/build.gradle.kts` ファイルに、KMP-NativeCoroutines プラグインを追加します。

    ```kotlin
    plugins {
        // ...
        id("com.google.devtools.ksp")
        id("com.rickclephas.kmp.nativecoroutines")
    }
    ```

3. 同じく `shared/build.gradle.kts` ファイルで、実験的な `@ObjCName` アノテーションをオプトインします。

    ```kotlin
    kotlin {
        // ...
        sourceSets{
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                    optIn("kotlin.time.ExperimentalTime")
                }
            }
            // ...
        }
    }
    ```

4. **Sync Gradle Changes** ボタンをクリックして、Gradle ファイルを同期します。

#### KMP-NativeCoroutinesでFlowをマークする

1. `shared/src/commonMain/kotlin` ディレクトリにある `Greeting.kt` ファイルを開きます。
2. `greet()` 関数に `@NativeCoroutines` アノテーションを追加します。これにより、プラグインが iOS 上で正しい Flow 処理をサポートするための適切なコードを生成します。

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

#### XCodeでSwiftPMを使用してライブラリをインポートする

1. **File** | **Open Project in Xcode** に移動します。
2. Xcode で、左側のメニューにある `iosApp` プロジェクトを右クリックし、**Add Package Dependencies** を選択します。
3. 検索バーに、パッケージ名を入力します。

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![KMP-NativeCoroutinesのインポート](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. **Dependency Rule** ドロップダウンで、**Exact Version** を選択し、隣のフィールドに `%kmpncVersion%` バージョンを入力します。
5. **Add Package** ボタンをクリックします。Xcode は GitHub からパッケージを取得し、パッケージ製品を選択するための別のウィンドウを開きます。
6. 図のように "KMPNativeCoroutinesAsync" と "KMPNativeCoroutinesCore" をアプリに追加し、**Add Package** をクリックします。

   ![KMP-NativeCoroutinesパッケージの追加](multiplatform-add-package.png){width=500}

これにより、`async/await` メカニズムを操作するために必要な KMP-NativeCoroutines パッケージのパーツがインストールされます。

#### KMP-NativeCoroutinesライブラリを使用してFlowを消費する

1. `iosApp/ContentView.swift` で、`Greeting().greet()` 関数のために KMP-NativeCoroutine の `asyncSequence()` 関数を使用して Flow を消費するように `startObserving()` 関数を更新します。

    ```Swift
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
    ```

   ここでのループと `await` メカニズムは、Flow を反復処理し、Flow が値をエミットするたびに `greetings` プロパティを更新するために使用されます。

2. `ViewModel` に `@MainActor` アノテーションが付与されていることを確認します。このアノテーションにより、Kotlin/Native の要件に準拠するために、`ViewModel` 内のすべての非同期操作がメインスレッドで実行されるようになります。

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: `Array<String>` = []
    
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

### オプション2. SKIEの構成 {initial-collapse-state="collapsed" collapsible="true"}

ライブラリをセットアップするには、`shared/build.gradle.kts` で SKIE プラグインを指定し、**Sync Gradle Changes** ボタンをクリックします。

```kotlin
plugins {
   id("co.touchlab.skie") version "%skieVersion%"
}
```

> 執筆時点で最新の SKIE バージョン 0.10.6 は、最新の Kotlin をサポートしていません。
> これを使用するには、`gradle/libs.versions.toml` ファイルで Kotlin のバージョンを 2.2.10 に下げてください。
> 
{style="warning"}

#### SKIEを使用してFlowを消費する

ループと `await` メカニズムを使用して `Greeting().greet()` Flow を反復処理し、Flow が値をエミットするたびに `greetings` プロパティを更新します。

`ViewModel` に `@MainActor` アノテーションが付与されていることを確認してください。
このアノテーションにより、Kotlin/Native の要件に準拠するために、`ViewModel` 内のすべての非同期操作がメインスレッドで実行されるようになります。

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

### ViewModelを消費してiOSアプリを実行する

`iosApp/iOSApp.swift` で、アプリのエントリーポイントを更新します。

```swift
@main
struct iOSApp: App {
   var body: some Scene {
       WindowGroup {
           ContentView(viewModel: ContentView.ViewModel())
       }
   }
}
```

IntelliJ IDEA から **iosApp** 構成を実行して、アプリのロジックが同期されていることを確認します。

![最終結果](multiplatform-mobile-upgrade-ios.png){width=300}

> プロジェクトの最終的な状態は、GitHubリポジトリの2つのブランチにあり、それぞれ異なるコルーチンソリューションが含まれています。
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) ブランチには、KMP-NativeCoroutinesによる実装が含まれています。
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) ブランチには、SKIEによる実装が含まれています。
>
{style="note"}

## 次のステップ

チュートリアルの最後の部分では、プロジェクトをまとめ、次にとるべきステップを確認します。

**[次のパートに進む](multiplatform-wrap-up.md)**

### 関連項目

* [suspend関数の合成](https://kotlinlang.org/docs/composing-suspending-functions.html)に関するさまざまなアプローチを探索してください。
* [Objective-Cフレームワークおよびライブラリとの相互運用性](https://kotlinlang.org/docs/native-objc-interop.html)について詳しく学びましょう。
* [ネットワークとデータストレージ](multiplatform-ktor-sqldelight.md)に関するこのチュートリアルを完了してください。

## ヘルプを得る

* **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受けて、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin 問題トラッカー**: [新しい問題を報告](https://youtrack.jetbrains.com/newIssue?project=KT)してください。