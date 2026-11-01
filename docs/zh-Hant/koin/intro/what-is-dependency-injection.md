---
title: 什麼是相依注入？
---

# 什麼是相依注入？

相依注入（Dependency Injection，簡稱 DI）是一種設計模式，其中物件是從外部接收其所需的物件，而不是自行建立它們。此頁面在不依賴任何架構的前提下解釋該模式，隨後說明如 Koin 這類的 DI 容器如何適用於其中。如果您已經了解 DI，請前往[核心概念](/docs/intro/core-concepts)。

## 什麼是相依項？ {id="what-is-a-dependency"}

相依項（dependency）是另一個物件為了完成工作所需要的物件。例如 `Car` 需要 `Engine` 才能行駛。

### 未使用相依注入 {id="without-dependency-injection"}

```kotlin
class Engine {
    fun start() {
        println("Engine starting...")
    }
}

class Car {
    private val engine = Engine() // Car creates its own engine

    fun drive() {
        engine.start()
        println("Car is driving")
    }
}
```

這雖然可行，但需要付出代價：

- **緊密耦合**：`Car` 與特定的一個 `Engine` 實作綁定。
- **難以測試**：您無法使用假引擎（fake engine）來測試 `Car`。
- **難以變更**：切換為電動引擎意味著必須修改 `Car`。
- **生命週期放置在錯誤位置**：`Car` 決定了何時建立 `Engine` 以及存在多少個執行個體。

### 使用相依注入 {id="with-dependency-injection"}

```kotlin
class Car(private val engine: Engine) {
    fun drive() {
        engine.start()
        println("Car is driving")
    }
}

val gasolineCar = Car(GasEngine())
val electricCar = Car(ElectricEngine())
```

`Car` 不再需要知道 `Engine` 是如何建置的。您可以傳入任何實作（包括測試中的虛設常式），而且建構函式明確展示了 `Car` 所需的項目。

## 提供相依項的方式 {id="ways-to-provide-dependencies"}

### 建構函式注入 {id="constructor-injection"}

相依項作為建構函式參數：

```kotlin
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient,
) {
    fun getUser(id: String): User =
        database.query(id) ?: apiClient.fetchUser(id)
}
```

相依項是明確的、必需的，且可以是不可變的（`val`）。該類別無需任何架構即可建立與測試。這是預設應採用的方法。

### 欄位注入 {id="field-injection"}

在物件建立後，將相依項指派給屬性。當架構建立物件而您無法控制其建構函式時（例如 Android 的 `Activity`），就需要這種方式：

```kotlin
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel() // filled by Koin on first access
}
```

僅在這些架構進入點使用此方式。在其下層，請使用建構函式注入。

### 方法注入 {id="method-injection"}

將相依項傳遞給需要它的方法：

```kotlin
class ReportGenerator {
    fun generateReport(data: DataSource) {
        ...
    }
}
```

這適用於每次呼叫都會變更的相依項，或者僅有單一方法會使用的相依項。

## 手動與自動相依注入 {id="manual-and-automated-dependency-injection"}

### 手動組裝 {id="wiring-by-hand"}

您可以在不使用任何程式庫的情況下套用 DI，也就是自行建置物件圖（object graph）：

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = Database()
        val apiClient = ApiClient()
        val userRepository = UserRepository(database, apiClient)
        val authRepository = AuthRepository(database, apiClient)
        val userService = UserService(userRepository, authRepository)
        val viewModel = UserViewModel(userService)
    }
}
```

隨著應用程式擴大，此程式碼會在許多地方重複出現，每當建構函式變更時都必須更新，並且無法控制每個物件的存活時間。

### 手動編寫的容器 {id="a-container-written-by-hand"}

常見的下一步是使用一個集中建立流程的容器物件：

```kotlin
object AppContainer {
    private val database by lazy { Database() }
    private val apiClient by lazy { ApiClient() }

    val userRepository by lazy { UserRepository(database, apiClient) }
    val authRepository by lazy { AuthRepository(database, apiClient) }

    fun createUserViewModel() = UserViewModel(
        UserService(userRepository, authRepository)
    )
}

class MainActivity : AppCompatActivity() {
    private val viewModel = AppContainer.createUserViewModel()
}
```

這消除了重複程式碼，但您仍然需要撰寫與維護每個建構函式呼叫，而且超越「單一執行個體」或「新執行個體」（例如每個畫面一個執行個體、每個工作階段一個執行個體）的生命週期將需要更多手寫程式碼。

### DI 容器 {id="a-di-container"}

DI 程式庫可將容器自動化。您宣告存在哪些類別以及它們的存活時間，程式庫會建構出物件圖。在 Koin 中：

**編譯器外掛程式 DSL**
```kotlin
val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    single<AuthRepository>()
    single<UserService>()
    viewModel<UserViewModel>()
}
```

**註解**
```kotlin
@Singleton
class UserRepository(private val database: Database, private val apiClient: ApiClient)

@Singleton
class UserService(private val userRepository: UserRepository, private val authRepository: AuthRepository)

@KoinViewModel
class UserViewModel(private val userService: UserService) : ViewModel()

// Database, ApiClient and AuthRepository are annotated the same way

@Module
@ComponentScan("com.example.app")
class AppModule
```

**建構函式 / 經典 DSL**
```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::ApiClient)
    singleOf(::UserRepository)
    singleOf(::AuthRepository)
    singleOf(::UserService)
    viewModelOf(::UserViewModel)
}
```

接著 Activity 索取物件圖的頂層：

```kotlin
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

容器會建立 `UserViewModel` 及其下方的所有項目，在整個應用程式中保留一個 `Database`，並為每個畫面提供一個新的 `UserViewModel`。[核心概念](/docs/intro/core-concepts)解釋了這些部分。

## DI 程式庫如何建構物件圖 {id="how-di-libraries-build-the-graph"}

DI 程式庫在建構物件圖的時間與方式上有所不同：

| 方法 | 運作方式 | 範例 |
|----------|--------------|----------|
| 反射 (Reflection) | 在執行時期讀取建構函式並透過反射呼叫它們 | Guice, Spring |
| 註解處理 (Annotation processing) | 在建置期產生工廠原始碼 | Dagger, Hilt |
| 編譯器外掛程式 (Compiler plugin) | 在編譯器內部重寫程式碼並在建置期檢查物件圖 | Koin Compiler Plugin |
| 執行時期 DSL (Runtime DSL) | 您將工廠撰寫為 Kotlin Lambda，容器在執行時期執行它們 | Koin Classic DSL |

Koin 在所有情況下都保留執行時期容器。Compiler Plugin 則在此基礎上新增了組裝與建置期檢查。請參閱[什麼是 Koin？](/docs/intro/what-is-koin)以了解這在實務上的意義。

## 服務定位器與相依注入 {id="service-locator-and-dependency-injection"}

這兩種模式經常被混淆。

使用**服務定位器**時，類別會向註冊表索取其相依項：

```kotlin
class UserService : KoinComponent {
    private val repository: UserRepository by inject() // pulled from the container
}
```

使用**相依注入**時，相依項會被提供給類別：

```kotlin
class UserService(
    private val repository: UserRepository // pushed in from outside
)
```

| 方面 | 服務定位器 | 相依注入 |
|--------|-----------------|----------------------|
| 相依項的可見性 | 隱藏在類別內部 | 在建構函式中可見 |
| 測試 | 需要容器或其測試版本 | 將虛設常式傳遞給建構函式 |
| 耦合 | 類別相依於容器 | 類別僅相依於其參數 |
| 在 Koin 中 | `get()`、`by inject()`、`KoinComponent` | 由模組解析的建構函式參數 |
| 適合場景 | 您無法建構的架構類別 | 商業邏輯、儲存庫、服務 |

Koin 兩者皆支援。請在您自己的類別中使用相依注入，並僅在架構建立物件的地方（例如 `Activity`、`Fragment`、Ktor 路由）使用服務定位器風格：

```kotlin
// avoid: hidden dependency, needs Koin in tests
class UserService : KoinComponent {
    private val repository: UserRepository = get()
}

// prefer: explicit dependency
class UserService(private val repository: UserRepository)
```

## 您的收穫 {id="what-you-gain"}

### 可測試性 {id="testability"}

```kotlin
class UserService(private val repository: UserRepository)

@Test
fun getUser() {
    val repository = mockk<UserRepository>()
    every { repository.findUser("123") } returns testUser

    val service = UserService(repository)

    assertEquals(testUser, service.getUser("123"))
}
```

接收其相依項的類別可以透過呼叫其建構函式來進行測試，不需要任何容器。

### 可替換的實作 {id="swappable-implementations"}

```kotlin
val appModule = module {
    single<EmailService> { SmtpEmailService() }
}

val testModule = module {
    single<EmailService> { FakeEmailService() }
}
```

取用者相依於 `EmailService`。而它們獲得哪種實作是在模組這個單一位置決定的。

### 集中設定 {id="central-configuration"}

```kotlin
startKoin {
    modules(dataModule, domainModule, presentationModule)
}
```

整個物件圖由少數模組描述（通常每個層級或每個功能一個模組），而不是分散在程式碼各處。

### 生命週期管理 {id="lifecycle-management"}

```kotlin
val appModule = module {
    single<Database>()     // one instance for the app
    factory<Presenter>()   // a new instance on every request

    scope<UserSession> {
        scoped<CartRepository>() // one instance per session
    }
}
```

容器決定每個物件的存活時間，因此類別不需要管理其相依項的生命週期。請參閱[作用域](/docs/reference/koin-core/scopes)。

## 相關內容 {id="related"}

- [什麼是 Koin？](/docs/intro/what-is-koin)：Koin 如何實作 DI 容器。
- [核心概念](/docs/intro/core-concepts)：Koin 中的定義、模組、注入與作用域。
- [擷取相依項](/docs/reference/koin-core/injection)：深入了解 `get()` 與 `inject()`。
- [在測試中注入](/docs/reference/koin-test/testing)：使用 Koin 的測試程式碼。