---
title: Compose Multiplatform & Annotations
---

# Compose Multiplatform とアノテーション

このチュートリアルでは、メトロポリタン美術館の美術品データを一覧表示し、その詳細を表示する Android および iOS 向けの Compose Multiplatform アプリを作成します。2 つの Gradle モジュールにまたがってクラスにアノテーションを付与する方法、プラットフォーム固有の定義を提供する方法、Composable 内で ViewModel をインジェクトする方法、そしてルート Composable から Koin を起動する方法を学びます。所要時間は約 20 分で、Android Studio に加えて、iOS 向けには Xcode が必要です。

本チュートリアルではアノテーションを使用します。Compiler Plugin DSL を使用した同じアプリの実装については、[Compose Multiplatform](/docs/quickstart/cmp) を参照してください。スタイルの比較については、[Choosing your style](/docs/intro/choosing-your-style) を参照してください。

## コードの取得 {id="get-the-code"}

完全なサンプルコードは [koin-getting-started/compose-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations) にあります。リポジトリをクローンし、Android Studio で `compose-annotations` フォルダを開いてください。このプロジェクトには、データ層用の `data` と UI 用の `composeApp` という 2 つの Gradle モジュールが含まれています。iOS アプリは `iosApp` にあります。

## Gradle のセットアップ {id="gradle-setup"}

両方の Gradle モジュールに Koin Compiler Plugin を適用します。バージョンはバージョンカタログで管理されています。

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin、Compose Multiplatform、Ktor、navigation、Coil のエントリは省略
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }
koin-compose-viewmodel = { module = "io.insert-koin:koin-compose-viewmodel", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

```kotlin
// data/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.library)
    alias(libs.plugins.koin.compiler)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            api(libs.koin.annotations)
            ...
        }
    }
}
```

```kotlin
// composeApp/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.koin.compiler)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            api(project(":data"))
            implementation(libs.koin.core)
            implementation(libs.koin.compose.viewmodel)
            implementation(libs.koin.annotations)
            ...
        }
    }
}
```

Compiler Plugin はターゲットごとの設定なしに、すべてのターゲットのアノテーションを処理します。Kotlin 2.3.20 以降が必要であり、`koin-annotations` は Koin と同じバージョンを使用します。詳細については、[Gradle setup](/docs/setup/gradle) および [Compiler Plugin setup](/docs/setup/compiler-plugin) を参照してください。

## アプリケーション {id="the-application"}

アプリはリモート API から美術品データを取得し、メモリ内にキャッシュして、一覧画面と詳細画面に表示します。

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

HTTP クライアントには Ktor、データストリームには Kotlin Flow、ルーティングには Navigation Compose を使用します。見出しやコメントで特に断りがない限り、コードは `commonMain` に配置されます。

## データ層を作成する {id="let-s-write-the-data-layer"}

このコードは `data` Gradle モジュールに配置します。`MuseumObject` データクラスは API レスポンスをマッピングします。

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

`KtorMuseumApi` は Ktor の `HttpClient` を使用して一覧を取得します。`@Singleton` アノテーションを付与します。

```kotlin
import org.koin.core.annotation.Singleton

interface MuseumApi {
    suspend fun getData(): List<MuseumObject>
}

@Singleton
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

`InMemoryMuseumStorage` はオブジェクトを `MutableStateFlow` にキャッシュします。

```kotlin
interface MuseumStorage {
    suspend fun saveObjects(newObjects: List<MuseumObject>)
    fun getObjectById(objectId: Int): Flow<MuseumObject?>
    fun getObjects(): Flow<List<MuseumObject>>
}

@Singleton
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

`MuseumRepository` は生成時に API からストレージを更新します。

```kotlin
@Singleton
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

Koin は各クラスをそのスーパータイプにバインドするため、`KtorMuseumApi` は `MuseumApi` の要求を解決します。[Definitions](/docs/reference/koin-core/definitions) を参照してください。

## データモジュールを宣言する {id="let-s-declare-the-data-module"}

`HttpClient` は外部のクラスであるため、モジュールクラスの関数から提供します。

```kotlin
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.Module
import org.koin.core.annotation.Singleton

@Module
@Configuration
@ComponentScan("com.jetbrains.kmpapp.data")
class DataModule {

    @Singleton
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

`@ComponentScan` は data パッケージのアノテーションが付与されたクラスを登録します。`@Configuration` を指定することで、別の Gradle モジュールにあってもアプリのエントリポイントから `DataModule` を検出できるようになります。[Modules](/docs/reference/koin-core/modules) を参照してください。

## ViewModel を作成する {id="let-s-write-the-viewmodels"}

このコードおよびチュートリアルの残りの部分は `composeApp` Gradle モジュールに配置します。各 ViewModel に `@KoinViewModel` アノテーションを付与します。

```kotlin
import org.koin.core.annotation.KoinViewModel

@KoinViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

@KoinViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): Flow<MuseumObject?> =
        museumRepository.getObjectById(objectId)
}
```

`screens` パッケージ内のモジュールクラスでこれらをスキャンします。

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

引数を指定しない `@ComponentScan` は、そのモジュールクラスのパッケージおよびサブパッケージをスキャンします。[ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。

## プラットフォーム固有の定義を追加する {id="let-s-add-platform-specific-definitions"}

このサンプルでは、プラットフォームごとに異なる実装を提供するための 2 つの方法を示しています。1 つ目は、共有モジュールによってスキャンされる、アノテーションが付与された `expect` クラスです。

```kotlin
// commonMain
@Singleton
expect class NativeComponent() {
    fun getInfo(): String
}

@Module
@ComponentScan
class NativeComponentModule
```

```kotlin
// androidMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "Android NativeComponent"
}
```

```kotlin
// nativeMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo(): String = "iOS NativeComponent"
}
```

2 つ目は `expect` モジュールクラスです。各プラットフォームの `actual` モジュールが、共有インターフェースの独自実装をスキャンします。

```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

@Module
expect class PlatformComponentModule
```

```kotlin
// androidMain
@Module
@ComponentScan
actual class PlatformComponentModule

@Singleton
class AndroidPlatformComponent : PlatformComponent {
    override fun getInfo(): String = "Android PlatformComponent"
}
```

```kotlin
// iosMain
@Module
@ComponentScan
actual class PlatformComponentModule

@Singleton
class IOSPlatformComponent : PlatformComponent {
    override fun getInfo(): String = "iOS PlatformComponent"
}
```

プラットフォーム固有のクラスは、プラットフォーム固有の依存関係を受け取ることもできます。Android では、`AndroidContextWrapper` が Koin から Android の `Context` を受け取ります。

```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

@Singleton
class NativeContextComponent(val ctx: ContextWrapper) {
    fun getInfo(): String = "NativeContextComponent with ctx: ${ctx.getContextInfo()}"
}
```

```kotlin
// androidMain
@Singleton
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo(): String = "Android Context: $context"
}
```

```kotlin
// nativeMain
@Singleton
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo(): String = "iOS Context"
}
```

共通コードはインターフェースを要求し、各プラットフォームで適切な実装を取得します。これらのパターンは [KMP shared modules](/docs/reference/koin-core/kmp-shared-modules) で詳しく解説されています。

## モジュールを組み立てる {id="let-s-assemble-the-modules"}

インクルードするモジュールを指定してアプリモジュールを宣言し、エントリポイントとして `@KoinApplication` オブジェクトを宣言します。

```kotlin
import org.koin.core.annotation.Configuration
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module

@Module(includes = [ViewModelModule::class, NativeComponentModule::class, PlatformComponentModule::class])
@Configuration
class AppModule

@KoinApplication
object KoinApp
```

`KoinApp` はすべての `@Configuration` モジュール（インクルードを含む `AppModule`、および `data` Gradle モジュールの `DataModule`）を収集します。Compiler Plugin はビルド時にグラフ全体を検証します。

## Koin を起動して ViewModel をインジェクトする {id="let-s-start-koin-and-inject-the-viewmodels"}

ルート Composable から `KoinApplication` と `koinConfiguration<KoinApp>()` を使用して Koin を起動します。

```kotlin
import org.koin.compose.KoinApplication
import org.koin.plugin.module.dsl.koinConfiguration

@Serializable
object ListDestination

@Serializable
data class DetailDestination(val objectId: Int)

@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
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
}
```

各画面では `koinViewModel()` を使用して ViewModel を取得します。

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun ListScreen(navigateToDetails: (objectId: Int) -> Unit) {
    val viewModel = koinViewModel<ListViewModel>()
    val objects by viewModel.objects.collectAsStateWithLifecycle()
    ...
}

@Composable
fun DetailScreen(objectId: Int, navigateBack: () -> Unit) {
    val viewModel = koinViewModel<DetailViewModel>()
    val obj by viewModel.getObject(objectId).collectAsStateWithLifecycle(initialValue = null)
    ...
}
```

`KoinApplication` はアプリ全体に対して Koin を一度だけ起動します。Android では Android コンテキストとロガーも設定されるため、これにより `AndroidContextWrapper` がその `Context` を取得できるようになります。両プラットフォームとも同じ `App` Composable をホストするため、`Application` クラスや iOS アプリ側で個別の起動コードを用意する必要はありません。

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

Android Studio から Android アプリを実行するか、Xcode から iOS アプリを実行すると、美術品のリストが表示されます。Compose の外部では、代わりに `org.koin.plugin.module.dsl` の `startKoin<KoinApp>()` を使用してください。[Koin for Compose](/docs/reference/koin-compose/compose) および [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel) を参照してください。

## 次のステップ {id="next-steps"}

- [Core Concepts](/docs/intro/core-concepts): モジュール、定義、インジェクションの背景にある概念とメンタルモデル。
- [KMP shared modules](/docs/reference/koin-core/kmp-shared-modules): プラットフォーム間での Koin モジュールの共有と分割。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): 各アノテーションとそのパラメータ一覧。
- [Compose testing](/docs/reference/koin-compose/compose-testing): Koin を使用する Composable のテスト。
- [Tooling](/docs/tooling): Koin 向けの IDE プラグインとモニタリングツール。