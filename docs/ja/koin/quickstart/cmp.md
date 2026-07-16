---
title: Compose Multiplatform - 共有 UI
---

> このチュートリアルでは、メトロポリタン美術館（The Metropolitan Museum of Art）のコレクション API から美術品を表示する Compose Multiplatform アプリケーションについて説明します。共有 UI を備えた Android および iOS プラットフォーム間で、依存関係注入（Dependency Injection）に Koin を使用します。
> チュートリアルの所要時間は約 **20分** です。

:::note
更新 - 2024-11-12
:::

:::tip
このチュートリアルの **アノテーション版（annotations version）** をお探しですか？コンパイル時の検証と自動モジュール検出に Koin Annotations を使用する [Compose Multiplatform & Annotations](./compose-multiplatform-annotations.md) を確認してください。
:::

## コードの取得

:::info
[ソースコードは GitHub で公開されています](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)
:::

## アプリケーションの概要

このアプリケーションは、リモート API から美術館の美術品オブジェクトを取得し、それらをリストに表示します。ユーザーはアイテムをタップして詳細情報を表示できます。

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**使用されている技術：**
- 共有 UI のための Compose Multiplatform (Android & iOS)
- HTTP ネットワークのための Ktor
- 依存関係注入のための Koin
- 非同期処理のための Kotlin Coroutines & Flow
- ルーティングのための Navigation Compose

## データレイヤー

> すべての共通/共有コードは `composeApp` Gradle プロジェクト内にあります。

### MuseumObject モデル

美術館の美術品オブジェクトのデータクラスです：

```kotlin
@Serializable
data class MuseumObject(
    val objectID: Int,
    val title: String,
    val artistDisplayName: String,
    val medium: String,
    val dimensions: String,
    val objectURL: String,
    val objectDate: String,
    val primaryImage: String,
    val primaryImageSmall: String,
    val repository: String,
    val department: String,
    val creditLine: String,
)
```

### MuseumApi - ネットワークレイヤー

メトロポリタン美術館の API からデータを取得するための API インターフェースを作成します：

```kotlin
interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

class KtorMuseumApi(private val client: HttpClient) : MuseumApi {
    private companion object {
        const val API_URL = "https://raw.githubusercontent.com/Kotlin/KMP-App-Template/main/list.json"
    }

    override suspend fun getData(): `List<MuseumObject>` {
        return try {
            client.get(API_URL).body()
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            e.printStackTrace()
            emptyList()
        }
    }
}
```

### MuseumStorage - ローカルキャッシュ

美術館のオブジェクトをローカルにキャッシュするためのストレージインターフェースを作成します：

```kotlin
interface MuseumStorage {
    suspend fun saveObjects(newObjects: List<MuseumObject>)
    fun getObjectById(objectId: Int): Flow<MuseumObject?>
    fun getObjects(): Flow<List<MuseumObject>>
}

class InMemoryMuseumStorage : MuseumStorage {
    private val storedObjects = MutableStateFlow(emptyList<MuseumObject>())

    override suspend fun saveObjects(newObjects: List<MuseumObject>) {
        storedObjects.value = newObjects
    }

    override fun getObjectById(objectId: Int): Flow<MuseumObject?> {
        return storedObjects.map { objects ->
            objects.find { it.objectID == objectId }
        }
    }

    override fun getObjects(): Flow<List<MuseumObject>> = storedObjects
}
```

### MuseumRepository

リポジトリは API とストレージの間を調整します：

```kotlin
class MuseumRepository(
    private val museumApi: MuseumApi,
    private val museumStorage: MuseumStorage,
) {
    private val scope = CoroutineScope(SupervisorJob())

    init {
        initialize()
    }

    fun initialize() {
        scope.launch {
            refresh()
        }
    }

    suspend fun refresh() {
        museumStorage.saveObjects(museumApi.getData())
    }

    fun getObjects(): Flow<List<MuseumObject>> = museumStorage.getObjects()

    fun getObjectById(objectId: Int): Flow<MuseumObject?> = museumStorage.getObjectById(objectId)
}
```

## 共有 Koin モジュール

Koin モジュールを宣言するには `module` 関数を使用します。構造を良くするために、依存関係を個別のモジュールに整理します。

:::info
このチュートリアルでは、コンパイル時に自動配線（auto-wiring）を提供する **Koin Compiler Plugin DSL** (`single<T>()`, `viewModel<T>()`) を使用します。設定については [Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照してください。
:::

### データモジュール

```kotlin
val dataModule = module {
    // Ktor 用の HttpClient
    single { create(::buildClient) }

    // API、ストレージ、およびリポジトリ
    single<KtorMuseumApi>() bind MuseumApi::class
    single<InMemoryMuseumStorage>() bind MuseumStorage::class
    single<MuseumRepository>() withOptions { createdAtStart() }
}

private fun buildClient(): HttpClient {
    val json = Json { ignoreUnknownKeys = true }
    return HttpClient {
        install(ContentNegotiation) {
            json(json, contentType = ContentType.Any)
        }
    }
}
```

### ViewModel モジュール

2つの画面用の ViewModel を作成しましょう：

```kotlin
// リスト画面の ViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 詳細画面の ViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

これらを ViewModel モジュールで宣言します：

```kotlin
val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

### プラットフォーム固有のモジュール

プラットフォーム固有のコンポーネント（Android 対 iOS）用です：

```kotlin
val nativeComponentModule = module {
    single<NativeComponent>()
}
```

### メインアプリモジュール

すべてのモジュールを結合します：

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule)
}
```

:::note
Koin モジュールは整理されており、`initKoin()` 関数を使用して Android と iOS の両方から初期化できます。
:::

## ネイティブコンポーネント

プラットフォーム固有の情報（Android 対 iOS）については、expect/actual パターンを使用します：

```kotlin
// commonMain
interface NativeComponent {
    fun getInfo(): String
}

// androidMain
class NativeComponent {
    fun getInfo(): String = "Android ${android.os.Build.VERSION.SDK_INT}"
}

// iosMain
class NativeComponent {
    fun getInfo(): String = "iOS ${UIDevice.currentDevice.systemVersion}"
}
```

## Compose での ViewModel の注入

> すべての共通 Compose アプリは `composeApp` Gradle モジュールの `commonMain` に配置されています。

ViewModel は Compose で `koinViewModel()` を使用して注入されます：

```kotlin
@Composable
fun App() {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
    ) {
        Surface {
            val navController: NavHostController = rememberNavController()
            NavHost(navController = navController, startDestination = ListDestination) {
                composable<ListDestination> {
                    val vm = koinViewModel<ListViewModel>()
                    ListScreen(viewModel = vm, navigateToDetails = { objectId ->
                        navController.navigate(DetailDestination(objectId))
                    })
                }
                composable<DetailDestination> { backStackEntry ->
                    val vm = koinViewModel<DetailViewModel>()
                    DetailScreen(
                        objectId = backStackEntry.toRoute<DetailDestination>().objectId,
                        viewModel = vm,
                        navigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
```

:::info
`koinViewModel()` 関数は ViewModel インスタンスを取得し、それを Compose のライフサイクルにバインドします。
:::

## Koin の開始

`initKoin()` 関数を使用して Koin を初期化します：

```kotlin
fun initKoin(configuration: KoinAppDeclaration? = null) {
    startKoin {
        includes(configuration)
        modules(appModule)
    }

    val platformInfo = KoinPlatform.getKoin().get<NativeComponent>().getInfo()
    println("Running on: $platformInfo")
}
```

### Android での設定

Android では、メインの Activity または Application クラスから Koin を初期化します：

```kotlin
// Android のエントリポイントから呼び出す
initKoin()
```

### iOS での設定

> すべての iOS アプリは `iosApp` フォルダにあります。

iOS では、SwiftUI アプリのエントリポイントから Koin を初期化します：

```swift
@main
struct iOSApp: App {
    init() {
        KoinKt.doInitKoin()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

Compose UI は以下で開始されます：

```kotlin
fun MainViewController() = ComposeUIViewController { App() }