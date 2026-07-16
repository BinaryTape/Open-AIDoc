---
title: 獲取相依性
---

# 獲取相依性

本指南介紹如何在不同情境下從 Koin 獲取相依性。

## 方式

| 方式 | 何時使用 | 範例 |
|----------|-------------|---------|
| **建構函式注入** | 商業邏輯、服務、存儲庫 | `class MyService(val repo: Repository)` |
| **函式注入** | 工廠函式、產生器 | `fun createHttpClient(val ds: DataSource): HttpClient` |
| **欄位注入** | Android 架構類別、入口點 | `val viewModel: MyViewModel by viewModel()` |

:::info
**最佳實務：** 優先使用建構函式或函式注入，以獲得更好的可測試性。僅在您無法控制類別實作化（如 Activity、Fragment 等）時才使用欄位注入。
:::

## 建構函式注入（建議使用）

相依性在建構函式中宣告，並由 Koin 解析：

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

Koin 會自動解析所有建構函式參數。

## 函式注入

當您需要自訂建立邏輯時，請使用函式來建立執行個體：

### 編譯器外掛程式 DSL

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

### 註解

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

函式注入在以下情況非常有用：
- 從您無法控制的外部程式庫建立執行個體
- 需要複雜的初始化邏輯
- 需要設定產生器或 DSL

## 欄位注入

### 使用 `by inject()` 進行延遲注入

在第一次存取時建立執行個體：

```kotlin
class MyActivity : AppCompatActivity() {
    // 延遲注入 - 在第一次存取時建立
    private val viewModel: UserViewModel by viewModel()
    private val service: MyService by inject()
}
```

### 使用 `get()` 進行立即注入

立即建立執行個體：

```kotlin
class MyActivity : AppCompatActivity() {
    // 立即注入 - 立即建立
    private val service: MyService = get()
}
```

### 比較

| 方法 | 何時建立 | 執行緒安全 |
|--------|--------------|---------------|
| `by inject()` | 第一次存取時 | 執行緒安全的延遲載入 |
| `get()` | 立即 | 直接呼叫 |

## KoinComponent

適用於需要注入相依性但非 Android 組件的類別：

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
避免在商業邏輯類別中使用 `KoinComponent`。它會與 Koin 產生強耦合。請改用建構函式注入。
:::

## 平台特定注入

### Android

Activity 與 Fragment 有內建支援：

```kotlin
class MainActivity : AppCompatActivity() {
    // ViewModel 注入
    private val viewModel: UserViewModel by viewModel()

    // 一般注入
    private val analytics: AnalyticsService by inject()
}

class UserFragment : Fragment() {
    // Fragment 自己的 ViewModel
    private val viewModel: UserViewModel by viewModel()

    // 與 Activity 共用
    private val sharedVM: SharedViewModel by activityViewModels()
}
```

### Compose

```kotlin
@Composable
fun UserScreen() {
    // 注入 ViewModel
    val viewModel: UserViewModel = koinViewModel()

    // 注入任何相依性
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

## 使用限定詞進行注入

當您有多個相同型別的定義時，請使用限定詞（qualifier）來區分它們。

### 字串限定詞

| DSL | 註解 |
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
// 註解
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
@Named("remote")
class RemoteDatabase : Database
```

### 型別限定詞

使用型別（類別、物件或列舉）作為限定詞以確保編譯時期安全：

| DSL | 註解 |
|-----|------------|
| `named<LocalDb>()` | `@Qualifier(LocalDb::class)` |

```kotlin
// 定義限定詞型別
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
// 註解
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
    // 使用字串限定詞
    val localDb: Database = koinInject(named("local"))

    // 使用型別限定詞
    val remoteDb: Database = koinInject(named<RemoteDb>())
}
```

## 帶參數的注入

在注入時傳遞參數：

### 定義

```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository
)

// 或使用 DSL
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

### 多個參數

```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: String,
    val repository: OrderRepository
)

val presenter = get<OrderPresenter> { parametersOf("user123", "order456") }
```

## 直接存取 Koin

在需要時直接存取 Koin 執行個體：

```kotlin
// 從 GlobalContext
val koin = KoinPlatform.getKoin()
val service: MyService = koin.get()

// 在 KoinComponent 中
class MyClass : KoinComponent {
    fun doSomething() {
        val service: MyService = getKoin().get()
    }
}
```

## 可為 null 的注入

對於選用相依性：

```kotlin
// 如果找不到則傳回 null
val optional: MyService? = getKoinOrNull()?.getOrNull()

// 在 KoinComponent 中
class MyClass : KoinComponent {
    private val optional: MyService? = getOrNull()
}
```

## 在不同情境下的注入

### 在 ViewModel 中

```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // 建構函式注入 - 不需要 KoinComponent
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

// 模組
val workerModule = module {
    worker<MyWorker>()
}
```

## 最佳實務

### 應執行：商業邏輯使用建構函式注入

```kotlin
// 良好 - 無需 Koin 即可測試
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(data: UserData) = validator.validate(data).let {
        repository.save(it)
    }
}

// 無需 Koin 的測試
@Test
fun testCreateUser() {
    val mockRepo = mockk<UserRepository>()
    val mockValidator = mockk<UserValidator>()
    val service = UserService(mockRepo, mockValidator)
    // 直接測試
}
```

### 應執行：架構類別使用欄位注入

```kotlin
// 良好 - Activity 的建構由 Android 控制
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

### 切勿執行：在商業邏輯中使用 KoinComponent

```kotlin
// 不良 - 與 Koin 強耦合
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 良好 - 建構函式注入
class UserService(private val repository: UserRepository)
```

### 切勿執行：在建構函式中使用 get()

```kotlin
// 不良 - 建構函式中的副作用
class MyService(
    private val repo: UserRepository = get()  // 請勿這樣做！
)

// 良好 - 讓 Koin 注入
class MyService(private val repo: UserRepository)
```

## 後續步驟

- **[作用域 (Scopes)](/docs/reference/koin-core/scopes)** - 管理相依性生命週期
- **[Android 版 Koin](/docs/reference/koin-android/start)** - Android 特定的注入
- **[Compose 版 Koin](/docs/reference/koin-compose/compose)** - Compose 注入