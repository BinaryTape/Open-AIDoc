---
title: Compose Multiplatform と Annotations - UI の共有
---

> このチュートリアルでは、メトロポリタン美術館のコレクション API（The Metropolitan Museum of Art Collection API）から美術品を表示する Compose Multiplatform アプリケーションを紹介します。Android および iOS プラットフォーム間で UI を共有し、依存性の注入（dependency injection）に Koin Annotations を使用します。
> このチュートリアルの所要時間は約 **20 分** です。

:::note
update - 2024-11-12
:::

## コードの取得

:::info
[ソースコードは GitHub で公開されています](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)
:::

## Gradle の設定

まず、Koin Annotations の依存関係を追加します：

```kotlin
plugins {
    id("com.google.devtools.ksp") version kspVersion
}

dependencies {
    // Koin for Compose Multiplatform
    implementation("io.insert-koin:koin-core:$koin_version")
    implementation("io.insert-koin:koin-compose-viewmodel:$koin_version")

    // Koin Annotations
    implementation("io.insert-koin:koin-annotations:$koin_annotations_version")
    ksp("io.insert-koin:koin-ksp-compiler:$koin_annotations_version")
}
```

## アプリケーションの概要

このアプリケーションは、リモート API から美術品オブジェクトを取得してリストに表示します。ユーザーはアイテムをタップして詳細情報を確認できます：

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**使用されている技術：**
- 共有 UI のための Compose Multiplatform (Android & iOS)
- HTTP ネットワークのための Ktor
- 依存性の注入のための Koin Annotations
- 非同期処理のための Kotlin Coroutines & Flow
- ルーティングのための Navigation Compose

## データレイヤー

> 共通・共有コードはすべて `composeApp` Gradle プロジェクト内にあります。

### MuseumObject モデル

美術品オブジェクトのデータクラス：

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

データを取得するための API インターフェースを作成します：

```kotlin
interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

@Single
class KtorMuseumApi(private val client: HttpClient) : MuseumApi {
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

```kotlin
interface MuseumStorage {
    suspend fun saveObjects(newObjects: List<MuseumObject>)
    fun getObjectById(objectId: Int): Flow<MuseumObject?>
    fun getObjects(): Flow<List<MuseumObject>>
}

@Single
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
@Single(createdAtStart = true)
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

:::note
`@Single(createdAtStart = true)` アノテーションは、Koin の起動時にリポジトリが作成されることを保証し、即座にデータ取得を開始させます。
:::

## Koin モジュール

依存関係を個別のモジュールに整理します：

### データモジュール

```kotlin
@Module
@ComponentScan
class DataModule {

    @Single
    fun providesHttpClient(): HttpClient {
        val json = Json { ignoreUnknownKeys = true }
        return HttpClient {
            install(ContentNegotiation) {
                json(json, contentType = ContentType.Any)
            }
        }
    }
}
```

`@ComponentScan` アノテーションは、このパッケージ内のすべての `@Single` アノテーション付きクラス（MuseumApi, MuseumStorage, MuseumRepository）を自動的に検出します。

### ViewModel モジュール

2つの画面用の ViewModel を作成しましょう：

```kotlin
// リスト画面の ViewModel
@KoinViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 詳細画面の ViewModel
@KoinViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

これらをモジュールで宣言します：

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

`@KoinViewModel` アノテーションはこれらを ViewModel 定義として自動的に登録し、`@ComponentScan` がそれらを検出します。

### プラットフォーム固有モジュール

プラットフォーム固有のコンポーネント（Android vs iOS）用：

```kotlin
@ComponentScan
@Module
class PlatformComponentModule
```

### メインアプリモジュール

すべてのモジュールを結合します：

```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class, PlatformComponentModule::class])
class AppModule
```

* `@Configuration` - `@KoinApplication` による自動モジュール検出を有効にします。
* `@Module(includes = [...])` - 含めるモジュールを宣言します。

## Koin Application オブジェクト

`@KoinApplication` オブジェクトを作成します：

```kotlin
@KoinApplication
object KoinApp

fun initKoin(configuration: KoinAppDeclaration? = null) {
    KoinApp.startKoin {
        includes(configuration)
    }

    val platformInfo = KoinPlatform.getKoin().get<PlatformComponent>().getInfo()
    println("Running on: $platformInfo")
}
```

`@KoinApplication` アノテーションは、すべてのモジュールを自動的にロードする `startKoin()` 拡張関数を生成します。

## Compose での ViewModel の注入

> 共通の Compose アプリコードはすべて `composeApp` Gradle モジュールの `commonMain` にあります。

Compose では `koinViewModel()` を使用して ViewModel が注入されます：

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
`koinViewModel()` 関数は、`@KoinViewModel` を通じて自動的に登録された ViewModel インスタンスを取得します。
:::

## Koin の起動

### Android でのセットアップ

Android では、メインのエントリポイントから Koin を初期化します：

```kotlin
// Android のエントリポイントから呼び出す
initKoin()
```

### iOS でのセットアップ

> iOS アプリはすべて `iosApp` フォルダ内にあります。

iOS では、SwiftUI App のエントリポイントから Koin を初期化します：

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

Compose UI は以下のように起動されます：

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

## Annotations vs Compiler Plugin DSL

アノテーションによるアプローチと Compiler Plugin DSL の比較は以下の通りです：

**Annotations を使用する場合 (compose-annotations/):**
```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class])
class AppModule

@Single
class MuseumRepository(api: MuseumApi, storage: MuseumStorage)

@KoinViewModel
class ListViewModel(repository: MuseumRepository) : ViewModel()

// Koin を起動
KoinApp.startKoin()
```

**Compiler Plugin DSL を使用する場合 (compose/):**
```kotlin
val appModule = module {
    includes(dataModule, viewModelModule)
}

val dataModule = module {
    single<MuseumRepository>() withOptions { createdAtStart() }
}

val viewModelModule = module {
    viewModel<ListViewModel>()
}

// Koin を起動
startKoin { modules(appModule) }
```

どちらのアプローチも同じ結果をもたらします：
- **Annotations**: KSP によるコンパイル時の検証、自動モジュール検出
- **Compiler Plugin DSL**: コンパイル時の自動配線（Auto-wiring）、より簡潔な `single<T>()` 構文