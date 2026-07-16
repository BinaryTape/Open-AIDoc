---
title: Compose Multiplatform - 共享 UI
---

> 本教程展示了一个 Compose Multiplatform 应用程序，该程序通过大都会艺术博物馆（The Metropolitan Museum of Art）藏品 API 来显示博物馆艺术品。它使用 Koin 在具有共享 UI 的 Android 和 iOS 平台上进行依赖注入。
> 完成本教程大约需要 __20 min__。

:::note
更新日期 - 2024-11-12
:::

:::tip
正在寻找本教程的**注解版本**？请查看 [Compose Multiplatform 与注解](./compose-multiplatform-annotations.md)，该版本使用 Koin 注解进行编译时验证和自动模块发现。
:::

## 获取代码

:::info
[源代码可以在 GitHub 上找到](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)
:::

## 应用程序概览

该应用程序从远程 API 获取博物馆艺术品对象并将其显示在列表中。用户可以点击某个项目以查看详细信息：

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**使用的技术：**
- 用于共享 UI 的 Compose Multiplatform（Android 与 iOS）
- 用于 HTTP 网络连接的 Ktor
- 用于依赖注入的 Koin
- 用于异步操作的 Kotlin 协程 (coroutine) 与 Flow
- 用于路由的 Navigation Compose

## 数据层

> 所有通用/共享代码都位于 `composeApp` Gradle 项目中

### MuseumObject 模型

博物馆艺术品对象数据类：

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

### MuseumApi - 网络层

我们创建一个 API 接口来从大都会艺术博物馆 API 获取数据：

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

### MuseumStorage - 本地缓存

我们创建一个存储接口来在本地缓存博物馆对象：

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

仓库负责协调 API 和存储：

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

## 共享 Koin 模块

使用 `module` 函数来声明 Koin 模块。我们将依赖项组织到不同的模块中，以获得更好的结构。

:::info
本教程使用的是 **Koin 编译器插件 DSL** (`single<T>()`, `viewModel<T>()`)，它在编译时提供自动装配。有关配置请参阅 [编译器插件设置](/docs/setup/compiler-plugin)。
:::

### Data 模块

```kotlin
val dataModule = module {
    // 用于 Ktor 的 HttpClient
    single { create(::buildClient) }

    // API、存储和仓库
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

### ViewModel 模块

让我们为两个屏幕创建 ViewModel：

```kotlin
// 列表屏幕 ViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 详情屏幕 ViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

在 ViewModel 模块中声明它们：

```kotlin
val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

### 平台特定模块

对于平台特定组件（Android 对比 iOS）：

```kotlin
val nativeComponentModule = module {
    single<NativeComponent>()
}
```

### 主应用模块

组合所有模块：

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule)
}
```

:::note
Koin 模块已组织完毕，可以通过 `initKoin()` 函数从 Android 和 iOS 端进行初始化。
:::

## 原生组件

对于平台特定信息（Android 对比 iOS），我们使用 expect/actual 模式：

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

> 所有的通用 Compose 应用都位于 `composeApp` Gradle 模块的 `commonMain` 中

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
`koinViewModel()` 函数用于检索 ViewModel 实例并将其绑定到 Compose 生命周期。
:::

## 启动 Koin

使用 `initKoin()` 函数初始化 Koin：

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

### Android 设置

在 Android 中，Koin 从主 Activity 或 Application 类进行初始化：

```kotlin
// 从 Android 入口点调用
initKoin()
```

### iOS 设置

> 所有的 iOS 应用都位于 `iosApp` 文件夹中

在 iOS 中，从 SwiftUI 应用入口点初始化 Koin：

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

Compose UI 的启动方式如下：

```kotlin
fun MainViewController() = ComposeUIViewController { App() }