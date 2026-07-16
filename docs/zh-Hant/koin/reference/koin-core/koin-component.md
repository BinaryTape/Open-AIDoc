---
title: Koin 組件
---

`KoinComponent` 提供了一個 API，用於在模組定義之外從 Koin 容器中獲取執行個體。這對於無法使用建構函式注入的類別（例如 Android Activity 或框架類別）非常有用。

## 什麼是 KoinComponent？

`KoinComponent` 是一個介面，它能讓任何類別存取 Koin 容器 API。它提供的函式可在不需要建構函式注入的情況下獲取執行個體。

:::info
**盡可能優先使用建構函式注入。** 僅對無法在模組中宣告的類別（框架類別、UI 組件等）使用 `KoinComponent`。建構函式注入更清晰、更易於測試，且不會將你的程式碼與 Koin 耦合。
:::

## 基本用法

### 建立 Koin 組件

為你的類別標記 `KoinComponent` 介面：

```kotlin
class MyService

val myModule = module {
    single { MyService() }
}
```

```kotlin
// 啟動 Koin
fun main() {
    startKoin {
        modules(myModule)
    }

    // 建立使用 Koin 的組件
    MyComponent()
}
```

```kotlin
class MyComponent : KoinComponent {
    // 延遲評估 - 第一次存取時才獲取執行個體
    val myService: MyService by inject()

    // 或者

    // 立即評估 - 立即獲取執行個體
    val myService: MyService = get()
}
```

### 可用函式

一旦你實作了 `KoinComponent`，你就能存取：

| 函式 | 描述 |
|----------|-------------|
| `get<T>()` | 立即獲取執行個體 |
| `by inject<T>()` | 延遲獲取執行個體（委派） |
| `getProperty()` | 獲取配置屬性 |
| `setProperty()` | 設定配置屬性 |
| `getKoin()` | 存取 Koin 執行個體 |

## 獲取執行個體

### 立即獲取與延遲獲取

**使用 `get()` 進行立即獲取：**
```kotlin
class MyComponent : KoinComponent {
    // 在建構期間立即獲取執行個體
    val service: MyService = get()

    init {
        service.doSomething()  // 已經可用
    }
}
```

**使用 `by inject()` 進行延遲獲取：**
```kotlin
class MyComponent : KoinComponent {
    // 僅在第一次存取時獲取執行個體
    val service: MyService by inject()

    fun doWork() {
        service.doSomething()  // 在此處第一次存取時獲取
    }
}
```

:::note
對於可能不總是需要的屬性，請使用 `by inject()`。它會將執行個體的建立延遲到第一次存取時。
:::

### 何時使用各個函式

| 使用 `get()` | 使用 `by inject()` |
|-------------|-------------------|
| 在 `init` 中立即需要執行個體 | 屬性可能不會被使用 |
| 簡單、直接的存取 | 需要延遲初始化 |
| 在函式中建構物件 | 宣告類別屬性 |

## 限定符 (Qualifiers)

使用限定符獲取具名定義：

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

    // 或者延遲獲取
    val localDb: Database by inject(named("local"))
}
```

### 限定符型別

**字串限定符：**
```kotlin
val service = get<ApiService>(named("production"))
```

**型別限定符：**
```kotlin
val service = get<ApiService>(named<ProductionService>())
```

**列舉限定符：**
```kotlin
enum class Environment { DEV, PROD }

val service = get<ApiService>(named(Environment.PROD))
```

## 注入參數

在獲取執行個體時傳遞執行階段參數：

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

**配合延遲注入：**
```kotlin
class ProfileScreen : KoinComponent {
    private val userId = "user-456"

    // 參數在第一次存取時求值
    val userSession: UserSession by inject { parametersOf(userId, "profile-session") }
}
```

## 屬性 (Properties)

從組件中存取與修改 Koin 屬性：

### 獲取屬性

```kotlin
class ApiClientFactory : KoinComponent {
    val apiUrl: String = getProperty("server_url")
    val apiKey: String = getProperty("api_key", "default-key")  // 包含預設值
    val timeout: Int = getProperty("timeout", "30").toInt()
}
```

### 設定屬性

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

### 屬性生命週期

使用 `setProperty()` 設定的屬性：
- 對所有組件可用
- 在 Koin 執行個體生命週期內持續存在
- 在呼叫 `stopKoin()` 時重設

## 存取 Koin 執行個體

直接存取 `Koin` 容器：

```kotlin
class AdvancedComponent : KoinComponent {
    fun performComplexOperation() {
        val koin = getKoin()

        // 存取作用域
        val scope = koin.createScope<MyActivity>()

        // 檢查定義是否存在
        val hasService = koin.getOrNull<MyService>() != null

        // 獲取某型別的所有執行個體
        val allServices = koin.getAll<Service>()
    }
}
```

## 實際範例

### Android Activity（推薦做法）

:::info
Android Activity **不需要 KoinComponent**。請使用 Koin Android 擴充功能：
:::

```kotlin
// ✅ 偏好做法 - 不需要 KoinComponent
class MainActivity : AppCompatActivity() {
    private val userRepository: UserRepository by inject()
    private val viewModel: MainViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 相依項可透過 Koin Android 擴充功能獲取
        val user = userRepository.getCurrentUser()
    }
}
```

作為對照，舊的方法（不推薦）：
```kotlin
// ❌ 不需要 - 對於 Activity 來說，KoinComponent 是多餘的
class MainActivity : AppCompatActivity(), KoinComponent {
    private val userRepository: UserRepository by inject()
    // ...
}
```

### Android Fragment（推薦做法）

```kotlin
// ✅ 偏好做法 - 不需要 KoinComponent
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModel()
    private val userRepository: UserRepository by inject()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel.loadUser()
    }
}
```

### 自訂 Android View（需要 KoinComponent）

```kotlin
// ✅ 此處適合使用 KoinComponent
class CustomChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr), KoinComponent {

    private val dataFormatter: ChartDataFormatter by inject()
    private val colorScheme: ColorScheme by inject()

    fun setData(data: List<DataPoint>) {
        val formatted = dataFormatter.format(data)
        // 渲染圖表...
    }
}
```

### 命令列應用程式

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

### Kotlin 多平台共通程式碼

```kotlin
// 跨平台運作的共通程式碼
class FeatureManager : KoinComponent {
    private val api: ApiClient by inject()
    private val cache: Cache by inject()

    suspend fun loadFeatures(): `List<Feature>` {
        return cache.get() ?: api.fetchFeatures().also { cache.set(it) }
    }
}
```

## 何時使用 KoinComponent

### 適合的使用案例

在以下情況使用 `KoinComponent`：

- **自訂 UI 組件** - 自訂 View、小工具（並非 Activity/Fragment - 請參閱下方附註）
- **入口點** - Main 函式、應用程式類別
- **回呼** - 無法使用建構函式注入的接聽程式（listeners）、處理常式（handlers）
- **舊版程式碼** - 你無法重構以使用 DI 的類別
- **非 Android 平台** - JVM、Native、JS 應用程式

:::note
**Android 開發人員：** Activity、Fragment 與 Service 擁有專屬的 Koin 擴充功能，且**不需要 KoinComponent**。直接使用 `by inject()` 與 `by viewModel()` 而無需實作該介面。詳情請參閱 [Android 注入](/docs/reference/koin-android/get-instances)。
:::

### 避免用於

不要在以下情況使用 `KoinComponent`：

- **Android Activity/Fragment/Service** - 改用 Koin Android 擴充功能
- **商業邏輯** - 改用建構函式注入
- **資料層** - 儲存庫（Repositories）、資料來源（data sources）
- **領域層** - 使用案例（Use cases）、領域模型（domain models）
- **新程式碼** - 優先考慮在模組中透過建構函式注入來宣告

## 最佳實務

### 優先使用建構函式注入

```kotlin
// ❌ 避免 - 在商業邏輯中使用 KoinComponent
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
    private val validator: UserValidator by inject()

    fun createUser(name: String) { /* ... */ }
}

// ✅ 偏好做法 - 建構函式注入
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(name: String) { /* ... */ }
}

// 在模組中宣告
module {
    single { UserRepository() }
    single { UserValidator() }
    single { UserService(get(), get()) }
}
```

### 為選擇性相依項使用延遲注入

```kotlin
class FeatureController : KoinComponent {
    // 可能不會在所有程式碼路徑中用到
    private val analyticsService: AnalyticsService by inject()

    fun performAction(trackAnalytics: Boolean) {
        doWork()

        // 僅在需要時才獲取分析服務
        if (trackAnalytics) {
            analyticsService.track("action_performed")
        }
    }
}
```

### 限制 KoinComponent 作用域

```kotlin
// ❌ 不良做法 - 太多組件直接使用 Koin
class RepositoryA : KoinComponent {
    val db: Database by inject()
}

class RepositoryB : KoinComponent {
    val db: Database by inject()
}

class ServiceA : KoinComponent {
    val repoA: RepositoryA by inject()
}

// ✅ 較佳做法 - 單一入口點，其餘使用建構函式注入
class AppController : KoinComponent {
    private val serviceA: ServiceA = get()
    private val serviceB: ServiceB = get()
}

class ServiceA(private val repoA: RepositoryA)
class ServiceB(private val repoB: RepositoryB)
class RepositoryA(private val db: Database)
class RepositoryB(private val db: Database)
```

### 不要過度使用 getProperty

```kotlin
// ❌ 避免 - 在各處獲取屬性
class FeatureA : KoinComponent {
    val apiUrl = getProperty("api_url")
}

class FeatureB : KoinComponent {
    val apiUrl = getProperty("api_url")
}

// ✅ 較佳做法 - 集中化配置
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

## 測試

測試組件時，你可以覆寫 Koin 配置：

```kotlin
class MyComponent : KoinComponent {
    val service: MyService by inject()

    fun doWork() = service.execute()
}

@Test
fun testComponent() {
    // 設定測試用 Koin 執行個體
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

## 另請參閱

- [啟動 Koin](/docs/reference/koin-core/start-koin) - 初始化 Koin
- [定義](/docs/reference/koin-core/definitions) - 建立定義
- [注入參數](/docs/reference/koin-core/injection-parameters) - 執行階段參數
- [Android 注入](/docs/reference/koin-android/get-instances) - Android 專屬注入