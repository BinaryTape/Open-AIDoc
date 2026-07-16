---
title: 检索依赖项
---

# 检索依赖项

本指南介绍如何在不同上下文中从 Koin 检索依赖项。

## 方案

| 方案 | 何时使用 | 示例 |
|----------|-------------|---------|
| **构造函数注入** | 业务逻辑、服务、仓库 | `class MyService(val repo: Repository)` |
| **函数注入** | 工厂函数、构建器 | `fun createHttpClient(val ds: DataSource): HttpClient` |
| **字段注入** | Android 框架类、入口点 | `val viewModel: MyViewModel by viewModel()` |

:::info
**最佳做法：** 为了获得更好的可测试性，优先选择构造函数或函数注入。仅在无法控制类构建（如 Activity、Fragment 等）时才使用字段注入。
:::

## 构造函数注入（推荐）

在构造函数中声明依赖项并由 Koin 解析：

```kotlin
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient
)

class UserViewModel(
    private val repository: UserRepository
) : ViewModel()
```

```kotlin
val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

Koin 会自动解析所有构造函数形参。

## 函数注入

当需要自定义创建逻辑时，使用函数创建实例：

### 编译器插件 DSL

```kotlin
fun createHttpClient(dataSource: DataSource): HttpClient {
    return HttpClient {
        install(ContentNegotiation) { json() }
        defaultRequest { url(dataSource.baseUrl) }
    }
}

val appModule = module {
    single<DataSource>()
    single { create(::createHttpClient) }
}
```

### 注解

```kotlin
@Module
class NetworkModule {

    @Singleton
    fun createHttpClient(dataSource: DataSource): HttpClient {
        return HttpClient {
            install(ContentNegotiation) { json() }
            defaultRequest { url(dataSource.baseUrl) }
        }
    }
}
```

函数注入适用于以下情况：
- 从无法控制的外部库创建实例
- 需要复杂的初始化逻辑
- 需要配置构建器或 DSL

## 字段注入

### 通过 `by inject()` 进行延迟注入

在首次访问时创建实例：

```kotlin
class MyActivity : AppCompatActivity() {
    // 延迟加载 - 在首次访问时创建
    private val viewModel: UserViewModel by viewModel()
    private val service: MyService by inject()
}
```

### 通过 `get()` 进行立即注入

立即创建实例：

```kotlin
class MyActivity : AppCompatActivity() {
    // 立即加载 - 立即创建
    private val service: MyService = get()
}
```

### 对比

| 方法 | 创建时机 | 线程安全 |
|--------|--------------|---------------|
| `by inject()` | 首次访问时 | 线程安全延迟加载 |
| `get()` | 立即 | 直接调用 |

## KoinComponent

对于需要注入依赖项但不是 Android 组件的类：

```kotlin
class MyHelper : KoinComponent {
    private val service: MyService by inject()
    private val database: Database = get()

    fun doSomething() {
        service.process(database.query())
    }
}
```

:::warning
避免在业务逻辑类中使用 `KoinComponent`。它会产生与 Koin 的紧耦合。请改为优先使用构造函数注入。
:::

## 平台特定的注入

### Android

Activity 和 Fragment 具有内置支持：

```kotlin
class MainActivity : AppCompatActivity() {
    // ViewModel 注入
    private val viewModel: UserViewModel by viewModel()

    // 常规注入
    private val analytics: AnalyticsService by inject()
}

class UserFragment : Fragment() {
    // Fragment 自己的 ViewModel
    private val viewModel: UserViewModel by viewModel()

    // 与 Activity 共享
    private val sharedVM: SharedViewModel by activityViewModels()
}
```

### Compose

```kotlin
@Composable
fun UserScreen() {
    // 注入 ViewModel
    val viewModel: UserViewModel = koinViewModel()

    // 注入任意依赖项
    val analytics: AnalyticsService = koinInject()

    // Activity 作用域的 ViewModel
    val sharedVM: SharedViewModel = koinActivityViewModel()
}
```

### Ktor

```kotlin
fun Route.userRoutes() {
    val repository: UserRepository by inject()

    get("/users") {
        call.respond(repository.getAll())
    }
}
```

## 使用限定符进行注入

当同一类型有多个定义时，使用限定符进行区分。

### 字符串限定符

| DSL | 注解 |
|-----|------------|
| `named("local")` | `@Named("local")` |

```kotlin
// DSL
val module = module {
    single<Database>(named("local")) { LocalDatabase() }
    single<Database>(named("remote")) { RemoteDatabase() }
}

// 注入
private val localDb: Database by inject(named("local"))
private val remoteDb: Database by inject(named("remote"))
```

```kotlin
// 注解
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
@Named("remote")
class RemoteDatabase : Database
```

### 类型限定符

使用类型（类、对象或枚举）作为限定符，以实现编译时安全：

| DSL | 注解 |
|-----|------------|
| `named<LocalDb>()` | `@Qualifier(LocalDb::class)` |

```kotlin
// 定义限定符类型
object LocalDb
object RemoteDb

// DSL
val module = module {
    single<Database>(named<LocalDb>()) { LocalDatabase() }
    single<Database>(named<RemoteDb>()) { RemoteDatabase() }
}

// 注入
private val localDb: Database by inject(named<LocalDb>())
private val remoteDb: Database by inject(named<RemoteDb>())
```

```kotlin
// 注解
@Singleton
@Qualifier(LocalDb::class)
class LocalDatabase : Database

@Singleton
@Qualifier(RemoteDb::class)
class RemoteDatabase : Database
```

### 在 Compose 中

```kotlin
@Composable
fun MyScreen() {
    // 使用字符串限定符
    val localDb: Database = koinInject(named("local"))

    // 使用类型限定符
    val remoteDb: Database = koinInject(named<RemoteDb>())
}
```

## 通过形参注入

在注入时传递实参：

### 定义

```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository
)

// 或者使用 DSL
factory<UserPresenter>()
```

### 注入

```kotlin
// by inject()
private val presenter: UserPresenter by inject { parametersOf("user123") }

// get()
val presenter: UserPresenter = get { parametersOf("user123") }
```

### 在 Compose 中

```kotlin
@Composable
fun UserScreen(userId: String) {
    val presenter: UserPresenter = koinInject { parametersOf(userId) }
}
```

### 多个实参

```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: String,
    val repository: OrderRepository
)

val presenter = get<OrderPresenter> { parametersOf("user123", "order456") }
```

## 直接访问 Koin

需要时直接访问 Koin 实例：

```kotlin
// 从 GlobalContext 获取
val koin = KoinPlatform.getKoin()
val service: MyService = koin.get()

// 在 KoinComponent 中
class MyClass : KoinComponent {
    fun doSomething() {
        val service: MyService = getKoin().get()
    }
}
```

## 可为空注入

对于可选依赖项：

```kotlin
// 如果未找到则返回 null
val optional: MyService? = getKoinOrNull()?.getOrNull()

// 在 KoinComponent 中
class MyClass : KoinComponent {
    private val optional: MyService? = getOrNull()
}
```

## 在不同上下文中注入

### 在 ViewModel 中

```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // 构造函数注入 - 无需 KoinComponent
}
```

### 在 Service 中

```kotlin
class MyService : Service() {
    private val repository: UserRepository by inject()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        repository.doSomething()
        return START_STICKY
    }
}
```

### 在 BroadcastReceiver 中

```kotlin
class MyReceiver : BroadcastReceiver(), KoinComponent {
    private val service: NotificationService by inject()

    override fun onReceive(context: Context, intent: Intent) {
        service.handleNotification(intent)
    }
}
```

### 在 WorkManager Worker 中

```kotlin
class MyWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository  // 由 Koin 注入
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        repository.syncData()
        return Result.success()
    }
}

// 模块
val workerModule = module {
    worker<MyWorker>()
}
```

## 最佳做法

### 推荐：对业务逻辑使用构造函数注入

```kotlin
// 好 - 无需 Koin 即可测试
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(data: UserData) = validator.validate(data).let {
        repository.save(it)
    }
}

// 无需 Koin 即可测试
@Test
fun testCreateUser() {
    val mockRepo = mockk<UserRepository>()
    val mockValidator = mockk<UserValidator>()
    val service = UserService(mockRepo, mockValidator)
    // 直接测试
}
```

### 推荐：对框架类使用字段注入

```kotlin
// 好 - Activity 的构建由 Android 控制
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

### 不推荐：在业务逻辑中使用 KoinComponent

```kotlin
// 不好 - 与 Koin 紧耦合
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 好 - 构造函数注入
class UserService(private val repository: UserRepository)
```

### 不推荐：在构造函数中使用 get()

```kotlin
// 不好 - 构造函数中的副作用
class MyService(
    private val repo: UserRepository = get()  // 不要这样做！
)

// 好 - 让 Koin 注入
class MyService(private val repo: UserRepository)
```

## 下一步

- **[作用域](/docs/reference/koin-core/scopes)** - 管理依赖项生命周期
- **[Android 版 Koin](/docs/reference/koin-android/start)** - Android 特定的注入
- **[Compose 版 Koin](/docs/reference/koin-compose/compose)** - Compose 注入