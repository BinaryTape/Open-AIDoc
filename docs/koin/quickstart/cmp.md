---
title: Compose Multiplatform
---

# Compose Multiplatform

在本教程中，你将构建一个适用于 Android 和 iOS 的 Compose Multiplatform 应用，该应用列出大都会艺术博物馆（The Metropolitan Museum of Art）的艺术藏品并展示其详细信息。你将学习如何在 `commonMain` 中共享 Koin 模块、提供平台特定定义、在 composable 中注入 ViewModel，以及在两个平台上启动 Koin。整个过程大约需要 20 分钟，并且需要 Android Studio，iOS 端还需要 Xcode。

本教程使用编译器插件 DSL（Compiler Plugin DSL）。若要查看使用注解的相同应用，请参阅 [Compose Multiplatform & Annotations](/docs/quickstart/compose-multiplatform-annotations)。若要比较不同风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例位于 [koin-getting-started/compose](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)。克隆该仓库并在 Android Studio 中打开 `compose` 文件夹。共享代码位于 `composeApp` Gradle 模块中，iOS 应用位于 `iosApp` 中。

## Gradle 配置 {id="gradle-setup"}

示例应用了 Koin 编译器插件，并将 `koin-core` 和 `koin-compose-viewmodel-navigation` 添加到 `commonMain` 中。版本信息保存在版本目录（Version Catalog）中：

```toml
# gradle/libs.versions.toml
[versions]
# 此处省略了 Kotlin、Compose Multiplatform、Ktor、navigation 和 Coil 的条目
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

编译器插件需要 Kotlin 2.3.20 或更高版本，并在每个目标（target）上运行。有关当前版本，请参阅 [Gradle 配置](/docs/setup/gradle)。有关多平台项目布局，请参阅 [KMP 配置](/docs/reference/koin-core/kmp-setup)。

## 应用程序 {id="the-application"}

该应用从远程 API 获取艺术藏品，将其缓存在内存中，并在列表屏幕和详情屏幕上展示它们：

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

它使用 Ktor 处理 HTTP 请求，使用 Kotlin Flow 处理数据流，并使用 Navigation Compose 进行路由。除非标题另有说明，否则本教程中的所有代码均位于 `commonMain` 中。

## 编写数据层 {id="let-s-write-the-data-layer"}

`MuseumObject` 数据类用于映射 API 响应：

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

`MuseumApi` 使用 Ktor `HttpClient` 获取列表：

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

`MuseumStorage` 将对象缓存在 `MutableStateFlow` 中：

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

`MuseumRepository` 在创建时会从 API 刷新存储：

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

每个类都在其构造函数中接收其依赖项，因此 Koin 可以将它们全部组装串联起来。

## 声明数据模块 {id="let-s-declare-the-data-module"}

模块（Module）是你声明 Koin 所创建组件的地方（请参阅[核心概念](/docs/intro/core-concepts)）。在 `dataModule` 中声明数据层：

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

`create(::buildClient)` 让 Koin 可以为你未拥有源码的类调用构建器函数，这里是 `HttpClient`。`createdAtStart()` 在 Koin 启动时创建 `MuseumRepository`，从而立即开始获取数据。这两者均在[定义](/docs/reference/koin-core/definitions)中有详细介绍。

## 编写 ViewModel {id="let-s-write-the-viewmodels"}

列表屏幕和详情屏幕各自拥有一个 ViewModel：

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

在 `viewModelModule` 中声明它们：

```kotlin
import org.koin.plugin.module.dsl.viewModel

val viewModelModule = module {
    viewModel<ListViewModel>()
    viewModel<DetailViewModel>()
}
```

Koin 通过多平台 ViewModel API 创建每个 ViewModel，因此相同的声明在 Android 和 iOS 上均可运行。请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

## 添加平台特定定义 {id="let-s-add-platform-specific-definitions"}

该示例展示了两种针对每个平台提供不同实现的方式。第一种是 `expect` 类，在共享模块中声明一次：

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

第二种是 `expect` 模块函数。每个平台返回各自的模块，并绑定共享接口的各自实现：

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

共享代码请求 `NativeComponent` 或 `PlatformComponent`，并在每个平台上获取相应的正确实现。这些模式已在 [KMP 共享模块](/docs/reference/koin-core/kmp-shared-modules)中进行了说明。

## 组装模块 {id="let-s-assemble-the-modules"}

使用 `includes()` 将所有模块汇总到 `appModule` 中：

```kotlin
val appModule = module {
    includes(dataModule, viewModelModule, nativeComponentModule, platformModule())
}
```

现在你在启动时只需加载单个模块，它便会引入其他模块。请参阅[模块](/docs/reference/koin-core/modules)。

## 在 Compose 中注入 ViewModel {id="let-s-inject-the-viewmodels-in-compose"}

每个屏幕都使用 `koinViewModel()` 作为默认形参来获取其 ViewModel：

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

`App` composable 设置了两个屏幕之间的导航：

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

在 `NavHost` 目的地内，`koinViewModel()` 会将 ViewModel 绑定到该导航条目，因此每个屏幕都会保留其自己的实例。请参阅 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

## 启动 Koin {id="let-s-start-koin"}

编写一个由两个平台共同调用的共享 `initKoin()` 函数。它接受一个可选的配置，用于平台特定的设置：

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

在 Android 上，从你的 `Application` 类中调用它，并传入 Android context：

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

在 iOS 上，从 SwiftUI 应用程序入口点调用它。Kotlin 会将 `initKoin()` 导出为 `doInitKoin()`：

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

iOS 的 view controller 托管了相同的 `App` composable：

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

从 Android Studio 运行 Android 应用，或从 Xcode 运行 iOS 应用，艺术藏品列表便会显示出来。有关其他启动选项，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义和注入背后的思维模型。
- [KMP 配置](/docs/reference/koin-core/kmp-setup)：Kotlin Multiplatform 的项目布局和 Koin 依赖项。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`KoinApplication`、`koinInject()` 和 Compose 配置。
- [Compose 测试](/docs/reference/koin-compose/compose-testing)：测试使用 Koin 的 composable。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件和监控工具。