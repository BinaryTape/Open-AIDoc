---
title: Compose Multiplatform 与注解
---

# Compose Multiplatform 与注解

在本教程中，你将构建一个面向 Android 和 iOS 的 Compose Multiplatform 应用，该应用用于列出大都会艺术博物馆（The Metropolitan Museum of Art）的艺术藏品并展示其详情。你将学习如何跨两个 Gradle 模块为类添加注解、提供平台特定的定义、在 composable 中注入 ViewModel，以及从根 composable 启动 Koin。完成本教程大约需要 20 分钟，并需要 Android Studio（iOS 端还需 Xcode）。

本教程使用注解方式。若想了解使用编译器插件 DSL（Compiler Plugin DSL）实现相同应用的方式，请参阅 [Compose Multiplatform](/docs/quickstart/cmp)。要对比这两种风格，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 获取代码 {id="get-the-code"}

完整示例代码位于 [koin-getting-started/compose-annotations](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)。克隆该仓库并在 Android Studio 中打开 `compose-annotations` 文件夹。它包含两个 Gradle 模块：负责数据层的 `data` 和负责 UI 的 `composeApp`。iOS 应用位于 `iosApp` 中。

## Gradle 配置 {id="gradle-setup"}

两个 Gradle 模块都应用了 Koin 编译器插件。版本信息存放在版本目录（version catalog）中：

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

该编译器插件会在每个目标上处理注解，无需针对单个目标分别设置。它需要 Kotlin 2.3.20 或更高版本，且 `koin-annotations` 与 Koin 共享版本号。有关详细信息，请参阅 [Gradle 配置](/docs/setup/gradle)和[编译器插件配置](/docs/setup/compiler-plugin)。

## 应用程序 {id="the-application"}

该应用从远程 API 获取艺术藏品数据，将其缓存在内存中，并在列表屏幕和详情屏幕上展示它们：

```
MuseumApi -> MuseumStorage -> MuseumRepository -> ListViewModel / DetailViewModel -> Compose UI
```

它使用 Ktor 处理 HTTP 请求，使用 Kotlin Flow 处理数据流，并使用 Navigation Compose 进行路由。除非标题或注释另有说明，否则代码均位于 `commonMain` 中。

## 编写数据层 {id="let-s-write-the-data-layer"}

这部分代码位于 `data` Gradle 模块中。`MuseumObject` 数据类用于映射 API 响应：

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

`KtorMuseumApi` 通过 Ktor 的 `HttpClient` 获取列表。使用 `@Singleton` 为其添加注解：

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

`InMemoryMuseumStorage` 将藏品缓存在 `MutableStateFlow` 中：

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

`MuseumRepository` 在创建时会从 API 刷新存储数据：

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

Koin 会将每个类绑定到其超类型，因此当请求 `MuseumApi` 时会由 `KtorMuseumApi` 响应。请参阅[定义](/docs/reference/koin-core/definitions)。

## 声明数据模块 {id="let-s-declare-the-data-module"}

由于 `HttpClient` 不是由你拥有的类，因此可以通过模块类中的函数来提供它：

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

`@ComponentScan` 注册数据包中带有注解的类。`@Configuration` 使得 `DataModule` 即使位于另一个 Gradle 模块中，也能被应用入口点发现。请参阅[模块](/docs/reference/koin-core/modules)。

## 编写 ViewModel {id="let-s-write-the-viewmodels"}

这部分代码以及本教程的其余内容均位于 `composeApp` Gradle 模块中。使用 `@KoinViewModel` 为每个 ViewModel 添加注解：

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

在 `screens` 包中使用模块类扫描它们：

```kotlin
@ComponentScan
@Module
class ViewModelModule
```

不带实参的 `@ComponentScan` 会扫描该模块类所在的包及其子包。请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

## 添加平台特定定义 {id="let-s-add-platform-specific-definitions"}

本示例展示了针对每个平台提供不同实现的两种方式。第一种是使用注解修饰的 `expect` 类，并通过共享模块进行扫描：

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

第二种是 `expect` 模块类。每个平台的 `actual` 模块会扫描各自对共享接口的实现：

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

平台类也可以接收平台依赖项。在 Android 上，`AndroidContextWrapper` 会从 Koin 接收 Android 的 `Context`：

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

共享代码请求接口，并在各平台上获得对应的实现。这些模式在 [KMP 共享模块](/docs/reference/koin-core/kmp-shared-modules)中有详细介绍。

## 组装模块 {id="let-s-assemble-the-modules"}

声明包含相应 includes 的应用模块，并将 `@KoinApplication` 对象作为入口点：

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

`KoinApp` 会收集所有 `@Configuration` 模块：包括带有 includes 的 `AppModule` 以及来自 `data` Gradle 模块的 `DataModule`。编译器插件会在构建期验证完整的依赖图。

## 启动 Koin 并注入 ViewModel {id="let-s-start-koin-and-inject-the-viewmodels"}

在根 composable 中使用 `KoinApplication` 和 `koinConfiguration<KoinApp>()` 启动 Koin：

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

每个屏幕使用 `koinViewModel()` 获取其 ViewModel：

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

`KoinApplication` 会为整个应用启动一次 Koin。在 Android 上，它还会设置 Android 上下文与日志记录器，这也是 `AndroidContextWrapper` 获取其 `Context` 的方式。两个平台都托管相同的 `App` composable，因此在 `Application` 或 iOS 应用中无需编写单独的启动代码：

```kotlin
// iosMain
fun MainViewController() = ComposeUIViewController { App() }
```

从 Android Studio 运行 Android 应用，或从 Xcode 运行 iOS 应用，即可看到艺术藏品列表。在 Compose 之外，请改用来自 `org.koin.plugin.module.dsl` 的 `startKoin<KoinApp>()`。请参阅 [Koin for Compose](/docs/reference/koin-compose/compose) 和 [Compose ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

## 后续步骤 {id="next-steps"}

- [核心概念](/docs/intro/core-concepts)：模块、定义和注入背后的心智模型。
- [KMP 共享模块](/docs/reference/koin-core/kmp-shared-modules)：跨平台共享与拆分 Koin 模块。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有注解及其形参。
- [Compose 测试](/docs/reference/koin-compose/compose-testing)：测试使用 Koin 的 composable。
- [工具](/docs/tooling)：适用于 Koin 的 IDE 插件与监控工具。