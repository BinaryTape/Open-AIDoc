---
title: Compose Multiplatform 與註解
---

# Compose Multiplatform 與註解

在本教學中，你將建置一個適用於 Android 和 iOS 的 Compose Multiplatform 應用程式，列出大都會藝術博物館的藝術品並顯示其詳細資訊。你將學習如何跨兩個 Gradle 模組為類別加上註解、提供平台專屬的定義、在 composable 中注入 ViewModel，以及從根 composable 啟動 Koin。這大約需要 20 分鐘，並需要 Android Studio 以及適用於 iOS 的 Xcode。

本教學使用註解。若要查看使用編譯器外掛程式 DSL 建置的相同應用程式，請參閱 [Compose Multiplatform](/docs/quickstart/cmp)。若要比較不同風格，請參閱[選擇你的風格](/docs/intro/choosing-your-style)。

## 取得程式碼 {id="get-the-code"}

完整範例位於 [koin-getting-started/compose-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)。複製（Clone）存儲庫並在 Android Studio 中開啟 `compose-annotations` 資料夾。它包含兩個 Gradle 模組：用於資料層的 `data` 以及用於 UI 的 `composeApp`。iOS 應用程式則位於 `iosApp` 中。

## Gradle 設定 {id="gradle-setup"}

兩個 Gradle 模組均套用 Koin 編譯器外掛程式。版本資訊定義在版本目錄（version catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# Kotlin, Compose Multiplatform, Ktor, navigation and Coil entries omitted
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

編譯器外掛程式會處理每個目標上的註解，無需針對各個目標進行個別設定。它需要 Kotlin 2.3.20 或更高版本，且 `koin-annotations` 與 Koin 共用相同版本。詳情請參閱 [Gradle 設定](/docs/setup/gradle) 與[編譯器外掛程式設定](/docs/setup/compiler-plugin)。

## 應用程式架構 {id="the-application"}

此應用程式從遠端 API 擷取藝術品、將它們快取在記憶體中，並顯示在清單畫面和詳細資訊畫面上：

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

它使用 Ktor 處理 HTTP、Kotlin Flow 處理資料串流，並使用 Navigation Compose 進行路由。除非標題或註解另有說明，否則程式碼均位於 `commonMain` 中。

## 撰寫資料層 {id="let-s-write-the-data-layer"}

此程式碼位於 `data` Gradle 模組中。`MuseumObject` 資料類別對應 API 回應：

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

`KtorMuseumApi` 使用 Ktor 的 `HttpClient` 擷取清單。使用 `@Singleton` 為其加上註解：

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

`InMemoryMuseumStorage` 將物件快取在 `MutableStateFlow` 中：

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

`MuseumRepository` 在建立時會從 API 重新整理儲存區中的資料：

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

Koin 會將每個類別繫結至其超型別，因此 `KtorMuseumApi` 會回應對 `MuseumApi` 的請求。請參閱[定義](/docs/reference/koin-core/definitions)。

## 宣告資料模組 {id="let-s-declare-the-data-module"}

`HttpClient` 不是由你擁有的類別，因此請從模組類別中的函式提供它：

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

`@ComponentScan` 會註冊 data 套件中帶有註解的類別。`@Configuration` 讓 `DataModule` 即使位於另一個 Gradle 模組中，也能被應用程式入口點探索到。請參閱[模組](/docs/reference/koin-core/modules)。

## 撰寫 ViewModel {id="let-s-write-the-viewmodels"}

此程式碼與本教學的其餘部分均位於 `composeApp` Gradle 模組中。使用 `@KoinViewModel` 為每個 ViewModel 加上註解：

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

在 `screens` 套件中使用模組類別掃描它們：

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

不帶引數的 `@ComponentScan` 會掃描模組類別所在的套件及其子套件。請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

## 新增平台專屬定義 {id="let-s-add-platform-specific-definitions"}

此範例展示了為各平台提供不同實作的兩種方式。第一種是帶有註解的 `expect` 類別，由共用模組進行掃描：

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

第二種是 `expect` 模組類別。各平台的 `actual` 模組會掃描其自身對共用介面的實作：

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

平台類別也可以接收平台相依性。在 Android 上，`AndroidContextWrapper` 會從 Koin 接收 Android `Context`：

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

共用程式碼請求該介面，並在各平台上取得正確的實作。這些模式在 [KMP 共用模組](/docs/reference/koin-core/kmp-shared-modules) 中有詳細介紹。

## 組裝模組 {id="let-s-assemble-the-modules"}

宣告包含其 includes 的應用程式模組，並將 `@KoinApplication` 物件作為入口點：

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

`KoinApp` 會收集所有 `@Configuration` 模組：`AppModule` 及其包含的模組，以及來自 `data` Gradle 模組的 `DataModule`。編譯器外掛程式會在組建期驗證完整的依賴關係圖。

## 啟動 Koin 並注入 ViewModel {id="let-s-start-koin-and-inject-the-viewmodels"}

使用 `KoinApplication` 和 `koinConfiguration<KoinApp>()` 從根 composable 啟動 Koin：

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

每個畫面都使用 `koinViewModel()` 取得其 ViewModel：

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

`KoinApplication` 會為整個應用程式啟動一次 Koin。在 Android 上，它還會設定 Android context 和記錄器，這也是 `AndroidContextWrapper` 取得其 `Context` 的方式。兩個平台都託管相同的 `App` composable，因此在 `Application` 或 iOS 應用程式中不需要個別的啟動程式碼：

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

從 Android Studio 執行 Android 應用程式，或從 Xcode 執行 iOS 應用程式，藝術品清單就會顯示出來。在 Compose 之外，請改用來自 `org.koin.plugin.module.dsl` 的 `startKoin<KoinApp>()`。請參閱 [Koin for Compose](/docs/reference/koin-compose/compose) 與 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

## 後續步驟 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模組、定義與注入背後的心智模型。
- [KMP 共用模組](/docs/reference/koin-core/kmp-shared-modules)：跨平台共用與拆分 Koin 模組。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：每個註解及其參數。
- [Compose 測試](/docs/reference/koin-compose/compose-testing)：測試使用 Koin 的 composable。
- [工具](/docs/tooling)：適用於 Koin 的 IDE 外掛程式與監控工具。