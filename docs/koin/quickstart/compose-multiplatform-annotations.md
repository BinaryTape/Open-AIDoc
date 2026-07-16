---
title: Compose Multiplatform 与注解 - 共享 UI
---

> 本教程演示了一个 Compose Multiplatform 应用程序，该程序通过 The Metropolitan Museum of Art Collection API 显示博物馆艺术品。它使用 Koin 注解在具有共享 UI 的 Android 和 iOS 平台上进行依赖注入。
> 您大约需要 **20 分钟** 来完成本教程。

:::note
更新 - 2024-11-12
:::

## 获取代码

:::info
[源代码可在 GitHub 上获取](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)
:::

## Gradle 设置

首先，添加 Koin 注解依赖项：

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

## 应用程序概览

该应用程序从远程 API 获取博物馆艺术品对象并将其显示在列表中。用户可以点击某一项来查看详细信息：

`MuseumAPI -> MuseumStorage -> MuseumRepository -> ViewModels -> Compose UI`

**使用的技术：**
- Compose Multiplatform 用于共享 UI (Android & iOS)
- Ktor 用于 HTTP 网络连接
- Koin 注解用于依赖注入
- Kotlin 协程与 Flow 用于异步操作
- Navigation Compose 用于路由

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

我们创建一个 API 接口来获取数据：

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

### MuseumStorage - 本地缓存

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

该仓库在 API 和存储之间进行协调：

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
`@Single(createdAtStart = true)` 注解确保在 Koin 启动时创建该仓库，从而立即触发数据获取。
:::

## Koin 模块

我们将依赖项组织到不同的模块中：

### 数据模块

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

`@ComponentScan` 注解会自动发现该软件包中所有带有 `@Single` 注解的类 (MuseumApi, MuseumStorage, MuseumRepository)。

### ViewModel 模块

让我们为这两个屏幕创建 ViewModel：

```kotlin
// 列表屏幕 ViewModel
@KoinViewModel
class ListViewModel(museumRepository: MuseumRepository) : ViewModel() {
    val objects: StateFlow<List<MuseumObject>> =
        museumRepository.getObjects()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

// 详情屏幕 ViewModel
@KoinViewModel
class DetailViewModel(private val museumRepository: MuseumRepository) : ViewModel() {
    fun getObject(objectId: Int): StateFlow<MuseumObject?> {
        return museumRepository.getObjectById(objectId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    }
}
```

在一个模块中声明它们：

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

`@KoinViewModel` 注解会自动将这些类注册为 ViewModel 定义，并由 `@ComponentScan` 进行发现。

### 平台特定模块

针对平台特定组件 (Android 与 iOS)：

```kotlin
@ComponentScan
@Module
class PlatformComponentModule
```

### 主应用模块

合并所有模块：

```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class, PlatformComponentModule::class])
class AppModule
```

* `@Configuration` - 启用通过 `@KoinApplication` 进行的自动模块发现
* `@Module(includes = [...])` - 声明要包含哪些模块

## Koin 应用程序对象

创建一个 `@KoinApplication` 对象：

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

`@KoinApplication` 注解会生成一个 `startKoin()` 扩展函数，该函数会自动加载所有模块。

## 在 Compose 中注入 ViewModel

> 所有通用 Compose 应用程序都位于 `composeApp` Gradle 模块的 `commonMain` 中

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
`koinViewModel()` 函数会自动检索通过 `@KoinViewModel` 注册的 ViewModel 实例。
:::

## 启动 Koin

### Android 设置

在 Android 中，Koin 从主入口点进行初始化：

```kotlin
// 从 Android 入口点调用
initKoin()
```

### iOS 设置

> 所有 iOS 应用程序都位于 `iosApp` 文件夹中

在 iOS 中，从 SwiftUI App 入口点初始化 Koin：

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
```

## 注解与编译器插件 DSL 比较

以下是注解方法与编译器插件 DSL 的对比：

**使用注解 (compose-annotations/)：**
```kotlin
@Configuration
@Module(includes = [DataModule::class, ViewModelModule::class])
class AppModule

@Single
class MuseumRepository(api: MuseumApi, storage: MuseumStorage)

@KoinViewModel
class ListViewModel(repository: MuseumRepository) : ViewModel()

// 启动 Koin
KoinApp.startKoin()
```

**编译器插件 DSL (compose/)：**
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

// 启动 Koin
startKoin { modules(appModule) }
```

两种方法都能达到相同的效果：
- **注解**：通过 KSP 进行编译时验证，自动模块发现
- **编译器插件 DSL**：编译时自动装配，更简洁的 `single<T>()` 语法