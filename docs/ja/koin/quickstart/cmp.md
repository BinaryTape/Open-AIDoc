---
title: Compose Multiplatform
---

# Compose Multiplatform

このチュートリアルでは、メトロポリタン美術館のアート作品を一覧表示し、その詳細を表示する Android および iOS 向けの Compose Multiplatform アプリを作成します。`commonMain` で Koin モジュールを共有する方法、プラットフォーム固有の定義を提供する方法、Composable 内で ViewModel をインジェクト（注入）する方法、そして両方のプラットフォームで Koin を起動する方法を学びます。所要時間は約20分で、Android Studio に加えて iOS 向けに Xcode が必要です。

このチュートリアルでは Compiler Plugin DSL を使用します。アノテーションを使用した同じアプリについては、[Compose Multiplatform & Annotations](/docs/quickstart/compose-multiplatform-annotations) を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style) を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルは [koin-getting-started/compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose) にあります。リポジトリをクローンし、Android Studio で `compose` フォルダを開いてください。共有コードは `composeApp` Gradle モジュールにあり、iOS アプリは `iosApp` にあります。

## Gradle のセットアップ {id="gradle-setup"}

このサンプルでは Koin Compiler Plugin を適用し、`commonMain` に `koin-core` と `koin-compose-viewmodel-navigation` を追加しています。バージョンはバージョンカタログで管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Compose Multiplatform, Ktor, navigation, Coil のエントリは省略
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-compose-viewmodel-navigation = { module = "io.insert-koin:koin-compose-viewmodel-navigation", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// composeApp/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.koin.compiler)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.compose.viewmodel.navigation)
            ...
        }
    }
}
```

Compiler Plugin には Kotlin 2.3.20 以降が必要であり、すべてのターゲットで動作します。最新のバージョンについては、[Gradle setup](/docs/setup/gradle) を参照してください。マルチプラットフォームのプロジェクト構成については、[KMP setup](/docs/reference/koin-core/kmp-setup) を参照してください。

## アプリケーションの概要 {id="the-application"}

このアプリは、リモート API からアート作品を取得してメモリ内にキャッシュし、一覧画面と詳細画面に表示します。

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

HTTP クライアントには Ktor、データストリームには Kotlin Flow、ルーティングには Navigation Compose を使用しています。このチュートリアルのすべてのコードは、見出しで特に指定がない限り `commonMain` に配置されます。

## データレイヤーを作成する {id="let-s-write-the-data-layer"}

`MuseumObject` データクラスは、API レスポンスをマッピングします。

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

`MuseumApi` は Ktor の `HttpClient` を使用して一覧を取得します。

```kotlin
interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

class KtorMuseumApi(private val client: HttpClient) : MuseumApi {
    companion object {
        private const val API_URL =
            "https://raw.githubusercontent.com/Kotlin/KMP-App-Template/main/list.json"
    }

    override suspend fun getData(): List<MuseumObject> {
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

`MuseumStorage` は、オブジェクトを `MutableStateFlow` にキャッシュします。

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

`MuseumRepository` は、作成時に API からストレージをリフレッシュします。

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

各クラスはコンストラクタで依存関係を受け取るため、Koin がそれらすべてを連携させることができます。

## データモジュールを宣言する {id="let-s-declare-the-data-module"}

モジュールとは、Koin が生成するコンポーネントを宣言する場所です（[Core Concepts](/docs/intro/core-concepts) を参照）。`dataModule` でデータレイヤーを宣言します。

```kotlin
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.bind
import org.koin.dsl.module
import org.koin.plugin.module.dsl.create
import org.koin.plugin.module.dsl.single

val dataModule = module {
    single { create(::buildClient) }
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

`create(::buildClient)` を使用すると、自身が所有していないクラス（ここでは `HttpClient`）のビルダー関数を Koin に呼び出させることができます。`createdAtStart()` は、Koin の起動時に `MuseumRepository` を生成するため、データの取得が即座に開始されます。どちらについても [Definitions](/docs/reference/koin-core/definitions) で解説されています。

## ViewModel を作成する {id="let-s-write-the-viewmodels"}

一覧画面と詳細画面のそれぞれに対応する ViewModel を作成します。

```kotlin
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): Flow<MuseumObject?> =
        museumRepository.getObjectById(objectId)
}
```

これらを `viewModelModule` で宣言します。

```kotlin
import org.koin.plugin.module.dsl.viewModel

val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

Koin はマルチプラットフォームの ViewModel API を通じて各 ViewModel を生成するため、同じ宣言が Android と iOS の両方で機能します。詳細は [ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。

## プラットフォーム固有の定義を追加する {id="let-s-add-platform-specific-definitions"}

このサンプルでは、プラットフォームごとに異なる実装を提供するための2つの方法を示しています。1つ目は、共有モジュール内で一度宣言される `expect` クラスです。

```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    single<NativeComponent>()
}
```

```kotlin
// androidMain
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "Android OS"
}
```

```kotlin
// nativeMain
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "iOS"
}
```

2つ目は、`expect` モジュール関数です。各プラットフォームが独自のモジュールを返し、共有インターフェースの実装をバインドします。

```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
class AndroidComponent() : PlatformComponent {
    override fun getInfo(): String = "Android OS"
}

actual fun platformModule(): Module = module {
    single<AndroidComponent>() bind PlatformComponent::class
}
```

```kotlin
// iosMain
class IOSComponent() : PlatformComponent {
    override fun getInfo(): String = "iOS OS"
}

actual fun platformModule(): Module = module {
    single<IOSComponent>() bind PlatformComponent::class
}
```

共有コードは `NativeComponent` または `PlatformComponent` を要求し、各プラットフォームで適切な実装を取得します。これらのパターンは [KMP shared modules](/docs/reference/koin-core/kmp-shared-modules) で解説されています。

## モジュールをまとめる {id="let-s-assemble-the-modules"}

`includes()` を使用して、すべてのモジュールを `appModule` に集約します。

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule, platformModule())
}
```

これで、起動時に単一のモジュールをロードするだけで、他のすべてのモジュールも取り込まれるようになります。[Modules](/docs/reference/koin-core/modules) を参照してください。

## Compose で ViewModel をインジェクトする {id="let-s-inject-the-viewmodels-in-compose"}

各画面は、デフォルト引数として `koinViewModel()` を使用して ViewModel を取得します。

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun ListScreen(
    viewModel: ListViewModel = koinViewModel(),
    navigateToDetails: (objectId: Int) -> Unit
) {
    val objects by viewModel.objects.collectAsStateWithLifecycle()
    ...
}

@Composable
fun DetailScreen(
    objectId: Int,
    viewModel: DetailViewModel = koinViewModel(),
    navigateBack: () -> Unit,
) {
    val obj by viewModel.getObject(objectId).collectAsStateWithLifecycle(initialValue = null)
    ...
}
```

`App` Composable は、2つの画面間のナビゲーションを設定します。

```kotlin
@Serializable
object ListDestination

@Serializable
data class DetailDestination(val objectId: Int)

@Composable
fun App() {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()
    ) {
        Surface {
            val navController: NavHostController = rememberNavController()
            NavHost(navController = navController, startDestination = ListDestination) {
                composable<ListDestination> {
                    ListScreen(navigateToDetails = { objectId ->
                        navController.navigate(DetailDestination(objectId))
                    })
                }
                composable<DetailDestination> { backStackEntry ->
                    DetailScreen(
                        objectId = backStackEntry.toRoute<DetailDestination>().objectId,
                        navigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
```

`NavHost` のデスティネーション内部では、`koinViewModel()` が ViewModel をそのナビゲーションエントリに紐付けるため、画面ごとに独自のインスタンスが保持されます。[Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel) を参照してください。

## Koin を起動する {id="let-s-start-koin"}

両方のプラットフォームから呼び出す共有の `initKoin()` 関数を作成します。この関数は、プラットフォーム固有のセットアップを行うための任意の構成を受け取ります。

```kotlin
import org.koin.core.context.startKoin
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes

fun initKoin(configuration: KoinAppDeclaration? = null) {
    startKoin {
        includes(configuration)
        modules(appModule)
        printLogger(Level.DEBUG)
    }
}
```

Android では、`Application` クラスから呼び出し、Android のコンテキストを渡します。

```kotlin
// androidMain
class MuseumApp : Application() {
    override fun onCreate() {
        super.onCreate()
        initKoin {
            androidContext(this@MuseumApp)
        }
    }
}
```

iOS では、SwiftUI アプリのエントリポイントから呼び出します。Kotlin は `initKoin()` を `doInitKoin()` としてエクスポートします。

```swift
// iosApp
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

iOS のビューコントローラは、同じ `App` Composable をホストします。

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

Android Studio から Android アプリを実行するか、Xcode から iOS アプリを実行すると、アート作品の一覧が表示されます。その他の起動オプションについては、[Starting Koin](/docs/reference/koin-core/starting-koin) を参照してください。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にあるメンタルモデル。
- [KMP setup](/docs/reference/koin-core/kmp-setup): Kotlin Multiplatform 向けのプロジェクト構成と Koin の依存関係。
- [Koin for Compose](/docs/reference/koin-compose/compose): `KoinApplication`、`koinInject()`、Compose のセットアップ。
- [Compose testing](/docs/reference/koin-compose/compose-testing): Koin を使用する Composable のテスト。
- [Tooling](/docs/tooling): Koin 向けの IDE プラグインとモニタリングツール。