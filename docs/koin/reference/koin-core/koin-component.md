---
title: Koin 组件
---

`KoinComponent` 提供了一个 API，用于从模块定义之外的 Koin 容器中检索实例。这对于无法使用构造函数注入的类非常有用，例如 Android Activity 或框架类。

## 什么是 KoinComponent？

`KoinComponent` 是一个接口，它让任何类都能访问 Koin 容器 API。它提供了无需构造函数注入即可检索实例的函数。

:::info
**尽可能优先使用构造函数注入。** 仅在无法在模块中声明的类（框架类、UI 组件等）中使用 `KoinComponent`。构造函数注入更清晰、更易于测试，并且不会将你的代码与 Koin 耦合。
:::

## 基本用法

### 创建 Koin 组件

为你的类标记 `KoinComponent` 接口：

```kotlin
class MyService

val myModule = module {
    single { MyService() }
}
```

```kotlin
// 启动 Koin
fun main() {
    startKoin {
        modules(myModule)
    }

    // 创建使用 Koin 的组件
    MyComponent()
}
```

```kotlin
class MyComponent : KoinComponent {
    // 延迟计算 - 在首次访问时检索实例
    val myService: MyService by inject()

    // 或者

    // 预先计算 - 立即检索实例
    val myService: MyService = get()
}
```

### 可用函数

一旦你实现 `KoinComponent`，你就可以访问：

| 函数 | 描述 |
|----------|-------------|
| `get<T>()` | 预先检索实例 |
| `by inject<T>()` | 延迟检索实例（委托） |
| `getProperty()` | 获取配置属性 |
| `setProperty()` | 设置配置属性 |
| `getKoin()` | 访问 Koin 实例 |

## 检索实例

### 预先检索 vs 延迟检索

**使用 `get()` 进行预先检索：**
```kotlin
class MyComponent : KoinComponent {
    // 在构造期间立即检索实例
    val service: MyService = get()

    init {
        service.doSomething()  // 已经可用
    }
}
```

**使用 `by inject()` 进行延迟检索：**
```kotlin
class MyComponent : KoinComponent {
    // 仅在首次访问时检索实例
    val service: MyService by inject()

    fun doWork() {
        service.doSomething()  // 在此处首次访问时检索
    }
}
```

:::note
对于可能并不总是需要的属性，请使用 `by inject()`。它会将实例创建推迟到首次访问时。
:::

### 何时使用各函数

| 使用 `get()` | 使用 `by inject()` |
|-------------|-------------------|
| 在 `init` 中立即需要实例 | 属性可能不会被使用 |
| 简单、直接的访问 | 需要延迟初始化 |
| 在函数中构建对象 | 声明类属性 |

## 限定符

使用限定符检索命名定义：

```kotlin
module {
    single(named("local")) { LocalDatabase() }
    single(named("remote")) { RemoteDatabase() }
}
```

```kotlin
class DataManager : KoinComponent {
    val localDb: Database = get(named("local"))
    val remoteDb: Database = get(named("remote"))

    // 或者延迟检索
    val localDb: Database by inject(named("local"))
}
```

### 限定符类型

**字符串限定符：**
```kotlin
val service = get<ApiService>(named("production"))
```

**类型限定符：**
```kotlin
val service = get<ApiService>(named<ProductionService>())
```

**枚举限定符：**
```kotlin
enum class Environment { DEV, PROD }

val service = get<ApiService>(named(Environment.PROD))
```

## 注入参数

在检索实例时传递运行时参数：

```kotlin
module {
    factory { (userId: String, sessionId: String) ->
        UserSession(userId, sessionId)
    }
}
```

```kotlin
class LoginController : KoinComponent {
    fun login(userId: String) {
        val session: UserSession = get { parametersOf(userId, "session-123") }
        session.start()
    }
}
```

**使用延迟注入：**
```kotlin
class ProfileScreen : KoinComponent {
    private val userId = "user-456"

    // 在首次访问时计算形参
    val userSession: UserSession by inject { parametersOf(userId, "profile-session") }
}
```

## 属性

从组件中访问和修改 Koin 属性：

### 获取属性

```kotlin
class ApiClientFactory : KoinComponent {
    val apiUrl: String = getProperty("server_url")
    val apiKey: String = getProperty("api_key", "default-key")  // 带有默认值
    val timeout: Int = getProperty("timeout", "30").toInt()
}
```

### 设置属性

```kotlin
class ConfigManager : KoinComponent {
    fun updateServerUrl(url: String) {
        setProperty("server_url", url)
    }

    fun enableDebugMode() {
        setProperty("debug_mode", "true")
    }
}
```

### 属性生命周期

使用 `setProperty()` 设置的属性：
- 对所有组件可用
- 在 Koin 实例生命周期内持续存在
- 在调用 `stopKoin()` 时重置

## 访问 Koin 实例

直接访问 `Koin` 容器：

```kotlin
class AdvancedComponent : KoinComponent {
    fun performComplexOperation() {
        val koin = getKoin()

        // 访问作用域
        val scope = koin.createScope<MyActivity>()

        // 检查定义是否存在
        val hasService = koin.getOrNull<MyService>() != null

        // 获取某种类型的所有实例
        val allServices = koin.getAll<Service>()
    }
}
```

## 实际示例

### Android Activity（推荐做法）

:::info
Android Activity **不需要 KoinComponent**。请使用 Koin Android 扩展程序：
:::

```kotlin
// ✅ 推荐 - 不需要 KoinComponent
class MainActivity : AppCompatActivity() {
    private val userRepository: UserRepository by inject()
    private val viewModel: MainViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 通过 Koin Android 扩展程序获取可用的依赖项
        val user = userRepository.getCurrentUser()
    }
}
```

作为对比，旧的方式（不推荐）：
```kotlin
// ❌ 不需要 - 对于 Activity 来说 KoinComponent 是多余的
class MainActivity : AppCompatActivity(), KoinComponent {
    private val userRepository: UserRepository by inject()
    // ...
}
```

### Android Fragment（推荐做法）

```kotlin
// ✅ 推荐 - 不需要 KoinComponent
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModel()
    private val userRepository: UserRepository by inject()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel.loadUser()
    }
}
```

### 自定义 Android View（需要 KoinComponent）

```kotlin
// ✅ 此处适合使用 KoinComponent
class CustomChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr), KoinComponent {

    private val dataFormatter: ChartDataFormatter by inject()
    private val colorScheme: ColorScheme by inject()

    fun setData(data: List<DataPoint>) {
        val formatted = dataFormatter.format(data)
        // 渲染图表...
    }
}
```

### 控制台应用程序

```kotlin
class ConsoleApp : KoinComponent {
    private val logger: Logger by inject()
    private val dataProcessor: DataProcessor by inject()

    fun run() {
        logger.info("Starting application")
        dataProcessor.process()
        logger.info("Application finished")
    }
}

fun main() {
    startKoin {
        modules(appModule)
    }

    ConsoleApp().run()

    stopKoin()
}
```

### Kotlin 多平台公共代码

```kotlin
// 跨平台工作的公共代码
class FeatureManager : KoinComponent {
    private val api: ApiClient by inject()
    private val cache: Cache by inject()

    suspend fun loadFeatures(): `List<Feature>` {
        return cache.get() ?: api.fetchFeatures().also { cache.set(it) }
    }
}
```

## 何时使用 KoinComponent

### 理想的使用场景

在以下情况使用 `KoinComponent`：

- **自定义 UI 组件** - 自定义 View、微件（不是 Activity/Fragment - 见下文备注）
- **入口点** - Main 函数、Application 类
- **回调** - 无法使用构造函数注入的监听器、处理程序
- **旧版代码** - 无法重构以使用依赖注入的类
- **非 Android 平台** - JVM、原生、JS 应用程序

:::note
**Android 开发者：** Activity、Fragment 和 Service 拥有专用的 Koin 扩展程序，**不需要 KoinComponent**。可以直接使用 `by inject()` 和 `by viewModel()`，而无需实现该接口。详见 [Android 注入](/docs/reference/koin-android/get-instances)。
:::

### 避免在以下情况使用

不要在以下情况使用 `KoinComponent`：

- **Android Activity/Fragment/Service** - 改用 Koin Android 扩展程序
- **业务逻辑** - 改用构造函数注入
- **数据层** - 仓库、数据源
- **领域层** - 用例、领域模型
- **新代码** - 优先在模块中通过构造函数注入进行声明

## 最佳做法

### 优先使用构造函数注入

```kotlin
// ❌ 避免 - 在业务逻辑中使用 KoinComponent
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
    private val validator: UserValidator by inject()

    fun createUser(name: String) { /* ... */ }
}

// ✅ 推荐 - 构造函数注入
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(name: String) { /* ... */ }
}

// 在模块中声明
module {
    single { UserRepository() }
    single { UserValidator() }
    single { UserService(get(), get()) }
}
```

### 为可选依赖项使用延迟注入

```kotlin
class FeatureController : KoinComponent {
    // 可能不会在所有代码路径中使用
    private val analyticsService: AnalyticsService by inject()

    fun performAction(trackAnalytics: Boolean) {
        doWork()

        // 仅在需要时检索分析服务
        if (trackAnalytics) {
            analyticsService.track("action_performed")
        }
    }
}
```

### 限制 KoinComponent 作用域

```kotlin
// ❌ 糟糕 - 太多组件直接使用 Koin
class RepositoryA : KoinComponent {
    val db: Database by inject()
}

class RepositoryB : KoinComponent {
    val db: Database by inject()
}

class ServiceA : KoinComponent {
    val repoA: RepositoryA by inject()
}

// ✅ 更好 - 单个入口点，其余部分使用构造函数注入
class AppController : KoinComponent {
    private val serviceA: ServiceA = get()
    private val serviceB: ServiceB = get()
}

class ServiceA(private val repoA: RepositoryA)
class ServiceB(private val repoB: RepositoryB)
class RepositoryA(private val db: Database)
class RepositoryB(private val db: Database)
```

### 不要过度使用 getProperty

```kotlin
// ❌ 避免 - 随处检索属性
class FeatureA : KoinComponent {
    val apiUrl = getProperty("api_url")
}

class FeatureB : KoinComponent {
    val apiUrl = getProperty("api_url")
}

// ✅ 更好 - 集中化配置
class AppConfig(
    val apiUrl: String,
    val apiKey: String,
    val timeout: Int
)

module {
    single {
        AppConfig(
            apiUrl = getProperty("api_url"),
            apiKey = getProperty("api_key"),
            timeout = getProperty("timeout", "30").toInt()
        )
    }

    single { ApiClient(get<AppConfig>().apiUrl) }
}
```

## 测试

测试组件时，你可以重写 Koin 配置：

```kotlin
class MyComponent : KoinComponent {
    val service: MyService by inject()

    fun doWork() = service.execute()
}

@Test
fun testComponent() {
    // 设置测试 Koin 实例
    startKoin {
        modules(module {
            single<MyService> { MockMyService() }
        })
    }

    val component = MyComponent()
    val result = component.doWork()

    assertEquals("mock result", result)

    // 清理
    stopKoin()
}
```

## 另请参阅

- [启动 Koin](/docs/reference/koin-core/start-koin) - 初始化 Koin
- [定义](/docs/reference/koin-core/definitions) - 创建定义
- [注入参数](/docs/reference/koin-core/injection-parameters) - 运行时参数
- [Android 注入](/docs/reference/koin-android/get-instances) - Android 特定注入转到