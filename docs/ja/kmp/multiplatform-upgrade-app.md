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

更新されたアプリは、インターネット経由で [LaunchLibrary 2](https://lldev.thespacedevs.com/docs) API からデータを取得し、最新の宇宙打ち上げの概要を表示します。

> プロジェクトの最終的な状態は、GitHubリポジトリの2つのブランチにあり、それぞれ異なるコルーチンソリューションが含まれています。
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) ブランチには、KMP-NativeCoroutinesによる実装が含まれています。
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) ブランチには、SKIEによる実装が含まれています。
>
{style="note"}

## 依存関係の追加

プロジェクトに以下のマルチプラットフォームライブラリを追加する必要があります。

* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines): 同時操作を可能にするために、コルーチン（coroutines）を使用します。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization): SpaceX API からの JSON レスポンスを、ネットワーク操作の処理に使用されるエンティティクラスのオブジェクトにデシリアライズします。
* [Ktor](https://ktor.io/): HTTP 経由でデータを送受信するためのフレームワークです。

### Gradle バージョンカタログの更新

`gradle/libs.versions.toml` に以下のエントリを追加し、Gradle ファイルを同期して、ビルド構成コードで参照を利用できるようにします。

```toml
[versions]
coroutinesVersion = "%coroutinesVersion%"
ktorVersion = "%ktorVersion%"
# Kotlinのバージョンは既にカタログに設定されているはずです
kotlin = "%kotlinVersion%"

[libraries]
kotlinx-coroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "coroutinesVersion" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktorVersion" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktorVersion" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktorVersion" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktorVersion" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktorVersion" }

[plugins]
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

### 対応するソースセットへの依存関係の追加

`sharedLogic/build.gradle.kts` ファイルの対応するソースセットにライブラリ参照を追加します。

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            // ...
            // Kotlin Multiplatform Gradle プラグインは
            // プラットフォーム固有のコルーチンアーティファクトを自動的に追加します
            implementation(libs.kotlinx.coroutines)
            // 主要な Ktor の依存関係
            implementation(libs.ktor.client.core)
            // Ktor が特定の形式でシリアライゼーションを
            // 使用できるようにするための依存関係
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

**Sync Gradle Changes** ボタンをクリックして、Gradle ファイルを同期します。

## APIリクエストの設定

データを取得するために [Launch Library API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) を使用します。具体的には、**/2.3.0/launches** エンドポイントからすべての打ち上げリストを取得します。

### データモデルの作成

`sharedLogic/src/commonMain/.../greetingkmp` ディレクトリに新しい `RocketLaunch.kt` ファイルを作成し、SpaceX API からのデータを格納するデータクラスを追加します。

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RocketLaunch(
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

* `RocketLaunch` クラスには `@Serializable` アノテーションが付与されており、`kotlinx.serialization` プラグインが自動的にデフォルトのシリアライザーを生成できるようになっています。
* `@SerialName` アノテーションを使用すると、フィールド名を再定義できるため、データクラスでより読みやすい名前のプロパティを宣言できます。

### HTTPクライアントの接続

1. `sharedLogic/src/commonMain/.../greetingkmp` ディレクトリに新しい `RocketComponent` クラスを作成します。
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

   * Ktor の [`ContentNegotiation`](https://ktor.io/docs/serialization-client.html#register_json) プラグインと JSON シリアライザーが、GET リクエストの結果をデシリアライズします。
   * ここでの JSON シリアライザーは、`prettyPrint` プロパティによって JSON をより読みやすい形式で出力するように構成されています。また、`isLenient` によって不正な形式の JSON を読み取る際に柔軟に対応し、`ignoreUnknownKeys` によってロケット打ち上げモデルで宣言されていないキーを無視します。

3. ロケットの打ち上げに関する情報を非同期で取得する `getDateOfLastSuccessfulLaunch()` [suspend関数 (suspending function)](https://kotlinlang.org/docs/coroutines-basics.html) を `RocketComponent` に追加します。

   ```kotlin
   import io.ktor.client.request.get
   import io.ktor.client.call.body
   
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val rockets: List<RocketLaunch> = httpClient.get("https://api.spacexdata.com/v4/launches").body()
   
           // とりあえずスタブの日付で初期化
           val date: String = "October 5, 2026"
        
           return "$date"
       }
   }
   ```

   * `httpClient.get()` も suspend関数です。スレッドをブロックせずに非同期でネットワーク経由でデータを取得する必要があるためです。
   * suspend関数は、コルーチンまたは他のsuspend関数からしか呼び出すことができません。そのため、`getDateOfLastSuccessfulLaunch()` に `suspend` キーワードが付与されています。ネットワークリクエストは HTTP クライアントのスレッドプールで実行されます。

4. HTTP リクエスト呼び出しの後に、リスト内の最後の打ち上げ成功を取得する呼び出しを追加します（打ち上げリストは日付の古い順に並んでいます）。

   ```kotlin
   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val response: LaunchListResponse =
               httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
           val lastSuccessLaunch = response.results.first { it.status.id == 3 }
           val date: String = "October 5, 2026"
           
           return "$date"
       }
   }
   ```

5. 打ち上げの UTC 日時をローカルの日付に変換し、その結果を `date` に代入します。その後、フォーマットされた出力を返します。

   ```kotlin
   import kotlinx.datetime.TimeZone
   import kotlinx.datetime.toLocalDateTime
   import kotlin.time.ExperimentalTime
   import kotlin.time.Instant

   class RocketComponent {
       // ...
       
       private suspend fun getDateOfLastSuccessfulLaunch(): String {
           val response: LaunchListResponse =
               httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
           val lastSuccessLaunch = response.results.first { it.status.id == 3 }
           val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
               .toLocalDateTime(TimeZone.currentSystemDefault())
       
           return "${date.month} ${date.day}, ${date.year}"
       }
   }
   ```

   日付は "MMMM DD, YYYY" 形式（例：OCTOBER 5, 2022）で表示されます。

6. 同じクラスに、`getDateOfLastSuccessfulLaunch()` 関数を使用してメッセージを作成する別の suspend関数 `launchPhrase()` を追加します。

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

### コルーチン Flow の作成

単に suspend関数を呼び出す代わりに、値のシーケンスを生成する必要がある場合は [Flow (フロー)](https://kotlinlang.org/docs/flow.html) を使用できます。
Flow は、suspend関数の単一の戻り値ではなく、値が生成されるたびにそのシーケンスをエミット（放出）できます。

1. `shared/src/commonMain/kotlin` ディレクトリにある `Greeting.kt` ファイルを開きます。
2. `Greeting` クラスに `rocketComponent` プロパティを追加します。このプロパティは、最新の打ち上げ成功日のメッセージを保持します。

   ```kotlin
   class Greeting {
       private val rocketComponent = RocketComponent()
       //...
   }
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

`greet()` 関数の戻り値の型を `Flow` に変更することで、共有モジュールの API を更新しました。次に、プロジェクトのネイティブ部分を更新して、`greet()` 関数の呼び出し結果を適切に処理できるようにする必要があります。

## ネイティブ Android UI の更新

共有モジュールと Android アプリケーションの両方が Kotlin で記述されているため、Android から共有コードを使用するのは非常に簡単です。

### ViewModel の導入

ViewModel は、[Android アクティビティ](https://developer.android.com/guide/components/activities/intro-activities)のライフサイクルを通じて維持されるべきデータやその他のアプリコンポーネントの管理を支援する、Android 開発で一般的なパターンです。
アプリケーションがより複雑になってきたので、私たちのアプリにも ViewModel を導入しましょう。
これは SpaceX API から受信したデータを格納し、UI で利用できるようにします。

Android プラットフォームコード内に ViewModel クラスを作成します。

1. `sharedUI/src/commonMain/.../greetingkmp` ディレクトリに、新しい `MainViewModel` Kotlin クラスを作成します。

    ```kotlin
    import androidx.lifecycle.ViewModel
    
    class MainViewModel : ViewModel() {
        // ...
    }
    ```

   このクラスは Android の `ViewModel` クラスを継承しており、ライフサイクルや構成の変更に関するプラットフォームの期待に沿うようにしています。

2. [StateFlow](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 型の `greetingList` 値とそのバッキングプロパティを作成します。

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

   `Flow.collect()` 関数は suspend関数であるため、ViewModel のスコープ内で `launch` コルーチンが使用されます。これは、launch コルーチンが ViewModel のライフサイクルの正しいフェーズの間だけ実行されることを意味します。

4. `collect` の末尾ラムダ内で、`update()` 関数を使用して、収集した `phrase` を `_greetingList` 内のフレーズリストに追加します。

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

### ViewModel の Flow を使用する

1. `sharedUI/src/commonMain/.../greetingkmp` で `App.kt` ファイルを開き、以前の実装を新しく実装した ViewModel を使用するように置き換えて更新します。

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

### インターネットアクセス権限の追加

インターネットにアクセスするために、Android アプリケーションには適切な権限が必要です。すべてのネットワークリクエストは共有モジュールから行われるため、そのマニフェストにインターネットアクセス権限を追加するのが適切です。

`androidApp/src/main/AndroidManifest.xml` ファイルをアクセス権限で更新します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    ...
</manifest>
```

### アプリの実行

最終的な結果を確認するには、**androidApp** 実行構成を再実行します。

![Androidの最終結果](multiplatform-mobile-upgrade-android.png){width=350}

## ネイティブ iOS UI の更新

プロジェクトの iOS 部分では、Android アプリで行ったのと同様に [Model–view–viewmodel](https://ja.wikipedia.org/wiki/Model_View_ViewModel) パターンを使用して、UI を `sharedLogic` モジュールに接続します。

モジュールは、`ContentView.swift` ファイル内で `import SharedLogic` 宣言によってすでにインポートされています。

### ViewModel の導入

`iosApp/ContentView.swift` で、`ContentView` のための `ViewModel` クラスを作成します。これはデータを準備して管理します。並行処理をサポートするために、`task()` 呼び出し内で `startObserving()` 関数を呼び出します。

```swift
import SwiftUI
import SharedLogic

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
        @Published var greetings: Array<String> = []
        
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
* `ViewModel` は、`String` フレーズの配列である `greetings` プロパティを持っています。

SwiftUI は ViewModel (`ContentView.ViewModel`) をビュー (`ContentView`) に接続します。

* `ContentView.ViewModel` は `ObservableObject` として宣言されています。`ContentView` 内の `viewModel` プロパティに対する `@ObservedObject` ラッパーは、ビューを ViewModel に購読させます。
* ViewModel の `greetings` プロパティは `@Published` ラッパーを使用しています。これにより、このプロパティが変更されたときに SwiftUI が自動的にビューを更新できるようになります。

次に、Flow を消費するために `startObserving()` 関数を実装する必要があります。

### iOS から Flow を消費するためのライブラリを選択する

このチュートリアルでは、iOS で Flow を操作しやすくするために、[SKIE](https://skie.touchlab.co/) または [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) ライブラリを使用できます。
これらはいずれも、Kotlin/Native コンパイラがデフォルトではまだ提供していない、Flow によるキャンセルやジェネリクスをサポートするオープンソースのソリューションです。

* KMP-NativeCoroutines ライブラリは、必要なラッパーを生成することで、iOS から suspend関数や Flow を利用しやすくします。KMP-NativeCoroutines は Swift の `async`/`await` 機能に加えて、Combine や RxSwift もサポートしています。KMP-NativeCoroutines を使用するには、iOS プロジェクトに SwiftPM または CocoaPod の依存関係を追加する必要があります。
* SKIE ライブラリは、Kotlin コンパイラによって生成される Objective-C API を拡張します。SKIE は Flow を Swift の `AsyncSequence` に相当するものに変換します。SKIE は、スレッドの制限なしで Swift の `async`/`await` を直接サポートし、双方向の自動キャンセル機能を備えています（Combine や RxSwift にはアダプターが必要です）。SKIE は、さまざまな Kotlin 型を Swift の同等な型にブリッジするなど、Kotlin から Swift フレンドリーな API を生成するための他の機能も提供します。また、iOS プロジェクトに追加の依存関係を追加する必要もありません。

### オプション 1. KMP-NativeCoroutines の構成 {initial-collapse-state="collapsed" collapsible="true"}

> 最新バージョンのライブラリを使用することをお勧めします。
> [KMP-NativeCoroutines のリポジトリ](https://github.com/rickclephas/KMP-NativeCoroutines/releases)を確認して、プラグインの新しいバージョンが利用可能かどうか、およびそれが使用している Kotlin バージョンと互換性があるかどうかを確認してください。
>
{style="note"}

1. Gradle バージョンカタログに KMP-NativeCoroutines のバージョンとプラグイン参照を追加します。

    ```toml
    [versions]
    kmpNativeCoroutines = "%kmpncVersion%"
    
    [plugins]
    kmpNativeCoroutines = { id = "com.rickclephas.kmp.nativecoroutines", version.ref = "kmpNativeCoroutines" }
    ```

2. プロジェクトのルートにある `build.gradle.kts` ファイル（`shared/build.gradle.kts` ファイル**ではない**）で、KMP-NativeCoroutines プラグインを `plugins {}` ブロックに追加します。

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines) apply false
    }
    ```

3. `sharedLogic/build.gradle.kts` ファイルで、KMP-NativeCoroutines プラグインを `plugins {}` ブロックに追加します。

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines)
    }
    ```

4. 同じく `sharedLogic/build.gradle.kts` ファイルで、実験的な `@ObjCName` アノテーションをオプトインします。

    ```kotlin
    kotlin {
        // ...
        sourceSets{
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                }
            }
            // ...
        }
    }
    ```

5. **Sync Gradle Changes** ボタンをクリックして、Gradle ファイルを同期します。

#### KMP-NativeCoroutines で Flow をマークする

1. `sharedLogic/src/commonMain/kotlin` ディレクトリにある `Greeting.kt` ファイルを開きます。
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

#### Xcode で SwiftPM を使用してライブラリをインポートする

`async/await` メカニズムを操作するために必要な KMP-NativeCoroutines Swift パッケージのパーツをインストールします。

1. **File | Open Project in Xcode** に移動します。
2. Xcode で、左側のメニューにある `iosApp` プロジェクトを right-click し、**Add Package Dependencies** を選択します。
3. 検索バーに、パッケージ名を入力します。

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![KMP-NativeCoroutinesのインポート](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. **Dependency Rule** ドロップダウンで、**Exact Version** を選択し、隣のフィールドに `%kmpncVersion%` バージョンを入力します。
5. **Add Package** ボタンをクリックします。Xcode は GitHub からパッケージを取得し、パッケージ製品を選択するための別のウィンドウを開きます。
6. 図のように "KMPNativeCoroutinesAsync" と "KMPNativeCoroutinesCore" をアプリに追加し、**Add Package** をクリックします。

   ![KMP-NativeCoroutinesパッケージの追加](multiplatform-add-package.png){width=500}
7. IntelliJ IDEA に戻り、**Tools | Swift Package Manager | Resolve Dependencies** メニュー項目を選択します。これにより、Kotlin ビルドで使用される `Package.resolved` ロックファイルが作成され、Swift パッケージのバージョンを一貫して保つためにリポジトリにコミットできます。

#### KMP-NativeCoroutines ライブラリを使用して Flow を消費する

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
            @Published var greetings: Array<String> = []
    
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

### オプション 2. SKIE の構成 {initial-collapse-state="collapsed" collapsible="true"}

ライブラリをセットアップするには、Gradle バージョンカタログに SKIE のバージョンとプラグイン参照を追加します。

```toml
[versions]
skie = "%skieVersion%"

[plugins]
skie = { id = "co.touchlab.skie", version.ref = "skie" }
```

> SKIE は最新の Kotlin バージョンをサポートしていない場合があります。
> Kotlin のバージョンが新しすぎる場合、Gradle 同期中に安全にダウングレードできるバージョンのリストと共に報告されます。
> 
{style="note"}

次に、`sharedLogic/build.gradle.kts` ファイルのプラグインリストに追加し、**Sync Gradle Changes** ボタンをクリックします。

```kotlin
plugins {
    //...
    alias(libs.plugins.skie)
}
```

#### SKIE を使用して Flow を消費する

ループと `await` メカニズムを使用して `Greeting().greet()` Flow を反復処理し、Flow が値をエミットするたびに `greetings` プロパティを更新します。

> IntelliJ IDEA と Android Studio は、SKIE の使用中に Kotlin コードへの呼び出しで Swift エラーを誤って報告することがあります。これはライブラリの既知の問題であり、アプリのビルドや実行には影響しません。
>
{style="warning"}

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

### ViewModel を消費して iOS アプリを実行する

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

![最終結果](multiplatform-mobile-upgrade-ios.png){width=350}

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
* [Objective-C フレームワークおよびライブラリとの相互運用性](https://kotlinlang.org/docs/native-objc-interop.html)について詳しく学びましょう。
* [ネットワークとデータストレージ](multiplatform-ktor-sqldelight.md)に関するこのチュートリアルを完了してください。

## ヘルプを得る

* **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受けて、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin 問題トラッカー**: [新しい問題を報告](https://youtrack.jetbrains.com/newIssue?project=KT)してください。