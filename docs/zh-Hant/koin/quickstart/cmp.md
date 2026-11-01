---
title: Compose Multiplatform
---

# Compose Multiplatform

在本教學中，你將建置一個適用於 Android 和 iOS 的 Compose Multiplatform 應用程式，該應用程式會列出大都會藝術博物館的藝術品並顯示其詳細資訊。你將學習如何在 `commonMain` 中共用 Koin 模組、提供平台專屬的定義、在 composable 中注入 ViewModel，以及在兩個平台上啟動 Koin。這大約需要 20 分鐘，並需要 Android Studio 以及適用於 iOS 的 Xcode。

本教學使用編譯器外掛程式 DSL。若要查看使用註解的相同應用程式，請參閱 [Compose Multiplatform 與註解](/docs/quickstart/compose-multiplatform-annotations)。若要比較不同風格，請參閱[選擇你的風格](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整範例位於 [koin-getting-started/compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)。複製（clone）此存儲庫並在 Android Studio 中開啟 `compose` 資料夾。共用程式碼位於 `composeApp` Gradle 模組中，而 iOS 應用程式則位於 `iosApp` 中。

## Gradle 設定 {id="gradle-setup"}

該範例套用了 Koin 編譯器外掛程式，並將 `koin-core` 與 `koin-compose-viewmodel-navigation` 新增至 `commonMain`。版本維護在版本目錄（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Compose Multiplatform, Ktor, navigation and Coil entries omitted
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

編譯器外掛程式需要 Kotlin 2.3.20 或更高版本，並可在每個目標上執行。有關目前的版本資訊，請參閱 [Gradle 設定](/docs/setup/gradle)。有關多平台專案配置，請參閱 [KMP 設定](/docs/reference/koin-core/kmp-setup)。

## 應用程式 {id="the-application"}

該應用程式從遠端 API 擷取藝術品資料，將它們快取在記憶體中，並顯示在清單畫面和詳細資料畫面上：

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

它使用 Ktor 處理 HTTP、使用 Kotlin Flow 處理資料串流，並使用 Navigation Compose 處理路由。除非標題另有說明，否則本教學中的所有程式碼都位於 `commonMain` 中。

## 開始編寫資料層 {id="let-s-write-the-data-layer"}

`MuseumObject` 資料類別對應 API 回應：

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

`MuseumApi` 使用 Ktor `HttpClient` 擷取清單：

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

`MuseumStorage` 將物件快取在 `MutableStateFlow` 中：

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

`MuseumRepository` 在建立時會從 API 重新整理儲存空間：

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

每個類別都在其建構函式中接收其相依性，因此 Koin 可以將它們全部連接起來。

## 開始宣告資料模組 {id="let-s-declare-the-data-module"}

模組是你宣告 Koin 所建立組件的地方（請參閱[核心概念](/docs/intro/core-concepts)）。在 `dataModule` 中宣告資料層：

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

`create(::buildClient)` 允許 Koin 為非你擁有的類別呼叫建構函式，此處為 `HttpClient`。`createdAtStart()` 會在 Koin 啟動時建立 `MuseumRepository`，因此資料擷取會立即開始。兩者都在[定義](/docs/reference/koin-core/definitions)中進行了說明。

## 開始編寫 ViewModel {id="let-s-write-the-viewmodels"}

清單畫面和詳細資料畫面各自取得一個 ViewModel：

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

在 `viewModelModule` 中宣告它們：

```kotlin
import org.koin.plugin.module.dsl.viewModel

val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

Koin 透過多平台 ViewModel API 建立每個 ViewModel，因此相同的宣告適用於 Android 和 iOS。請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

## 開始新增平台專屬定義 {id="let-s-add-platform-specific-definitions"}

此範例展示了為每個平台提供不同實作的兩種方法。第一種是 `expect` 類別，在共用模組中宣告一次：

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

第二種是 `expect` 模組函式。每個平台回傳自己的模組，並繫結其對共用介面的實作：

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

共用程式碼請求 `NativeComponent` 或 `PlatformComponent`，並在每個平台上取得正確的實作。這些模式在 [KMP 共用模組](/docs/reference/koin-core/kmp-shared-modules)中有詳細說明。

## 開始組裝模組 {id="let-s-assemble-the-modules"}

使用 `includes()` 將所有模組收集到 `appModule` 中：

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule, platformModule())
}
```

現在你在啟動時只需載入單一模組，它會引入其他所有模組。請參閱[模組](/docs/reference/koin-core/modules)。

## 開始在 Compose 中注入 ViewModel {id="let-s-inject-the-viewmodels-in-compose"}

每個畫面都使用 `koinViewModel()` 作為預設參數來取得其 ViewModel：

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

`App` composable 設定了兩個畫面之間的導覽：

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

在 `NavHost` 目的地內部，`koinViewModel()` 會將 ViewModel 繫結至該導覽項目，因此每個畫面都會保留自己的執行個體。請參閱 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

## 開始啟動 Koin {id="let-s-start-koin"}

編寫一個兩個平台皆會呼叫的共用 `initKoin()` 函式。它接受一個可選的組態來進行平台專屬設定：

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

在 Android 上，從你的 `Application` 類別中呼叫它，並傳入 Android context：

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

在 iOS 上，從 SwiftUI 應用程式進入點呼叫它。Kotlin 將 `initKoin()` 匯出為 `doInitKoin()`：

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

iOS 檢視控制器託管相同的 `App` composable：

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

從 Android Studio 執行 Android 應用程式，或從 Xcode 執行 iOS 應用程式，藝術品清單就會隨即顯示。有關其他啟動選項，請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 後續步驟 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [KMP 設定](/docs/reference/koin-core/kmp-setup)：Kotlin Multiplatform 的專案配置與 Koin 相依性。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`KoinApplication`、`koinInject()` 與 Compose 設定。
- [Compose 測試](/docs/reference/koin-compose/compose-testing)：測試使用 Koin 的 composable。
- [工具](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。