---
title: Compose Multiplatform 與註解 - 共用 UI
---

> 本教學示範了一個 Compose Multiplatform 應用程式，該程式顯示來自大都會藝術博物館（The Metropolitan Museum of Art）Collection API 的博物館藝術品。它在 Android 和 iOS 平台上使用 Koin Annotations 進行相依注入，並採用共用 UI。
> 完成本教學大約需要 __20 分鐘__。

:::note
更新 - 2024-11-12
:::

## 取得程式碼

:::info
[原始碼已在 Github 上提供](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)
:::

## Gradle 設定

首先，新增 Koin 註解相依性：

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

## 應用程式概覽

此應用程式從遠端 API 抓取博物館藝術品物件並將其顯示在清單中。使用者可以點擊項目以查看詳細資訊：

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**使用的技術：**
- Compose Multiplatform 用於共用 UI（Android 和 iOS）
- Ktor 用於 HTTP 網路連線
- Koin Annotations 用於相依注入
- Kotlin Coroutines 和 Flow 用於非同步操作
- Navigation Compose 用於路由

## 資料層

> 所有通用/共用的程式碼都位於 `composeApp` Gradle 專案中

### MuseumObject 模型

博物館藝術品物件資料類別：

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

### MuseumApi - 網路層

我們建立一個 API 介面來抓取資料：

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

### MuseumStorage - 本機快取

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

存儲庫負責協調 API 和存儲空間：

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
`@Single(createdAtStart = true)` 註解可確保在 Koin 啟動時建立存儲庫，進而立即觸發資料抓取。
:::

## Koin 模組

我們將相依性組織成獨立的模組：

### 資料模組 (Data Module)

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

`@ComponentScan` 註解會自動偵測此套件中所有帶有 `@Single` 註解的類別（MuseumApi、MuseumStorage、MuseumRepository）。

### ViewModel 模組

讓我們為兩個螢幕建立 ViewModel：

```kotlin
// List 螢幕 ViewModel
@KoinViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// Detail 螢幕 ViewModel
@KoinViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

在模組中宣告它們：

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

`@KoinViewModel` 註解會自動將這些類別註冊為 ViewModel 定義，而 `@ComponentScan` 則負責偵測它們。

### 平台特定模組 (Platform-Specific Module)

用於平台特定元件（Android 與 iOS）：

```kotlin
@ComponentScan
@Module
class PlatformComponentModule
```

### 主應用程式模組 (Main App Module)

合併所有模組：

```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class, PlatformComponentModule::class])
class AppModule
```

* `@Configuration` - 透過 `@KoinApplication` 啟用自動模組偵測
* `@Module(includes = [...])` - 宣告要包含哪些模組

## Koin 應用程式物件

建立一個 `@KoinApplication` 物件：

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

`@KoinApplication` 註解會產生一個 `startKoin()` 擴充方法，該方法會自動載入所有模組。

## 在 Compose 中注入 ViewModel

> 所有通用的 Compose 應用程式都位於 `composeApp` Gradle 模組中的 `commonMain`

在 Compose 中使用 `koinViewModel()` 注入 ViewModel：

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
`koinViewModel()` 函式會擷取透過 `@KoinViewModel` 自動註冊的 ViewModel 執行個體。
:::

## 啟動 Koin

### Android 設定

在 Android 中，Koin 從主進入點初始化：

```kotlin
// 從 Android 進入點呼叫
initKoin()
```

### iOS 設定

> 所有 iOS 應用程式都位於 `iosApp` 資料夾中

在 iOS 中，從 SwiftUI App 進入點初始化 Koin：

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

Compose UI 的啟動方式如下：

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

## 註解 vs 編譯器外掛程式 DSL

以下是註解方法與編譯器外掛程式 DSL 的比較：

**使用註解 (compose-annotations/)：**
```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class])
class AppModule

@Single
class MuseumRepository(api: MuseumApi, storage: MuseumStorage)

@KoinViewModel
class ListViewModel(repository: MuseumRepository) : ViewModel()

// 啟動 Koin
KoinApp.startKoin()
```

**編譯器外掛程式 DSL (compose/)：**
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

// 啟動 Koin
startKoin { modules(appModule) }
```

兩種方法都能達到相同的結果：
- **註解**：透過 KSP 進行編譯時期驗證、自動模組偵測
- **編譯器外掛程式 DSL**：編譯時期自動裝配、更簡潔的 `single<T>()` 語法