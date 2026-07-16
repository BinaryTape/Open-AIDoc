---
title: Compose Multiplatform - 共用 UI
---

> 此教學示範了一個 Compose Multiplatform 應用程式，該程式顯示來自大都會藝術博物館藏品 API (The Metropolitan Museum of Art Collection API) 的藝術品。它在 Android 與 iOS 平台上使用 Koin 進行相依注入，並搭配共用 UI。
> 完成此教學大約需要 **20 分鐘**。

:::note
更新 - 2024-11-12
:::

:::tip
正在尋找此教學的 **註解版本** 嗎？請參閱 [Compose Multiplatform 與註解](./compose-multiplatform-annotations.md)，該版本使用 Koin 註解來進行編譯期驗證與自動模組偵測。
:::

## 取得程式碼

:::info
[原始碼可在 Github 上取得](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)
:::

## 應用程式總覽

此應用程式從遠端 API 獲取博物館藝術品物件，並將其顯示在清單中。使用者可以點擊項目以查看詳細資訊：

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**使用的技術：**
- Compose Multiplatform 用於共用 UI（Android 與 iOS）
- Ktor 用於 HTTP 網路連線
- Koin 用於相依注入
- Kotlin Coroutines 與 Flow 用於非同步操作
- Navigation Compose 用於路由

## 資料層

> 所有通用／共用程式碼皆位於 `composeApp` Gradle 專案中

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

我們建立一個 API 介面來從大都會藝術博物館 API 獲取資料：

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

### MuseumStorage - 本地快取

我們建立一個存儲介面來將博物館物件快取在本地：

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

Repository 在 API 與存儲之間進行協調：

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

## 共用 Koin 模組

使用 `module` 函式來宣告 Koin 模組。我們將相依性整理到不同的模組中，以獲得更好的結構。

:::info
本教學使用 **Koin 編譯器外掛程式 DSL** (`single<T>()`, `viewModel<T>()`)，它提供編譯期的自動裝配。請參閱 [編譯器外掛程式設定](/docs/setup/compiler-plugin) 以進行配置。
:::

### 資料模組

```kotlin
val dataModule = module {
    // Ktor 的 HttpClient
    single { create(::buildClient) }

    // API、存儲與 Repository
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

### ViewModel 模組

讓我們為兩個畫面建立 ViewModel：

```kotlin
// 清單畫面 ViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 詳細資訊畫面 ViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

在 ViewModel 模組中宣告它們：

```kotlin
val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

### 平台相關模組

用於平台特定組件（Android vs iOS）：

```kotlin
val nativeComponentModule = module {
    single<NativeComponent>()
}
```

### 主應用程式模組

組合所有模組：

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule)
}
```

:::note
Koin 模組已整理完畢，可以透過 `initKoin()` 函式從 Android 與 iOS 端進行初始化。
:::

## 原生組件

對於平台特定資訊（Android vs iOS），我們使用 expect/actual 模式：

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

## 在 Compose 中注入 ViewModel

> 所有通用 Compose 應用程式皆位於 `composeApp` Gradle 模組的 `commonMain` 中

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
`koinViewModel()` 函式會獲取 ViewModel 執行個體並將其繫結至 Compose 生命週期。
:::

## 啟動 Koin

使用 `initKoin()` 函式初始化 Koin：

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

### Android 設定

在 Android 中，Koin 是從主 Activity 或 Application 類別中初始化的：

```kotlin
// 從 Android 入口點呼叫
initKoin()
```

### iOS 設定

> 所有 iOS 應用程式皆位於 `iosApp` 資料夾中

在 iOS 中，從 SwiftUI App 入口點初始化 Koin：

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