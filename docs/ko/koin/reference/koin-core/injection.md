---
title: 의존성 조회하기
---

# 의존성 조회하기

이 가이드는 다양한 컨텍스트에서 Koin으로부터 의존성을 조회하는 방법을 설명합니다.

## 접근 방식

| 방식 | 사용 시점 | 예시 |
|----------|-------------|---------|
| **생성자 주입 (Constructor Injection)** | 비즈니스 로직, 서비스, 레포지토리 | `class MyService(val repo: Repository)` |
| **함수 주입 (Function Injection)** | 팩토리 함수, 빌더 | `fun createHttpClient(val ds: DataSource): HttpClient` |
| **필드 주입 (Field Injection)** | 안드로이드 프레임워크 클래스, 엔트리 포인트 | `val viewModel: MyViewModel by viewModel()` |

:::info
**권장 사항:** 더 나은 테스트 가능성을 위해 생성자 주입이나 함수 주입을 우선적으로 사용하세요. 클래스 생성을 직접 제어할 수 없는 경우(Activities, Fragments 등)에만 필드 주입을 사용하세요.
:::

## 생성자 주입 (권장)

의존성은 생성자에서 선언되며 Koin에 의해 해결됩니다.

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

Koin은 모든 생성자 파라미터를 자동으로 해결(resolve)합니다.

## 함수 주입

커스텀 생성 로직이 필요한 경우 함수를 사용하여 인스턴스를 생성합니다.

### 컴파일러 플러그인 DSL

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

### 어노테이션

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

함수 주입은 다음과 같은 경우에 유용합니다:
- 직접 제어할 수 없는 외부 라이브러리의 인스턴스를 생성할 때
- 복잡한 초기화 로직이 필요할 때
- 빌더나 DSL을 설정해야 할 때

## 필드 주입

### `by inject()`를 사용한 지연 주입 (Lazy Injection)

처음 접근할 때 인스턴스를 생성합니다.

```kotlin
class MyActivity : AppCompatActivity() {
    // Lazy - 처음 접근할 때 생성됨
    private val viewModel: UserViewModel by viewModel()
    private val service: MyService by inject()
}
```

### `get()`을 사용한 즉시 주입 (Eager Injection)

인스턴스를 즉시 생성합니다.

```kotlin
class MyActivity : AppCompatActivity() {
    // Eager - 즉시 생성됨
    private val service: MyService = get()
}
```

### 비교

| 메서드 | 생성 시점 | 스레드 안전성 |
|--------|--------------|---------------|
| `by inject()` | 처음 접근 시 | 스레드 안전한 지연 로딩 (Thread-safe lazy) |
| `get()` | 즉시 | 직접 호출 |

## KoinComponent

의존성을 주입받아야 하지만 안드로이드 컴포넌트가 아닌 클래스의 경우:

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
비즈니스 로직 클래스에서 `KoinComponent`를 사용하는 것은 피하세요. 이는 Koin과의 강한 결합(tight coupling)을 유발합니다. 대신 생성자 주입을 사용하는 것이 좋습니다.
:::

## 플랫폼별 주입

### 안드로이드 (Android)

Activity와 Fragment는 내장된 지원 기능을 제공합니다.

```kotlin
class MainActivity : AppCompatActivity() {
    // ViewModel 주입
    private val viewModel: UserViewModel by viewModel()

    // 일반 주입
    private val analytics: AnalyticsService by inject()
}

class UserFragment : Fragment() {
    // Fragment 자체의 ViewModel
    private val viewModel: UserViewModel by viewModel()

    // Activity와 공유되는 ViewModel
    private val sharedVM: SharedViewModel by activityViewModels()
}
```

### 컴포즈 (Compose)

```kotlin
@Composable
fun UserScreen() {
    // ViewModel 주입
    val viewModel: UserViewModel = koinViewModel()

    // 모든 의존성 주입
    val analytics: AnalyticsService = koinInject()

    // Activity 스코프의 ViewModel
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

## 한정자를 사용한 주입 (Injection with Qualifiers)

동일한 타입의 정의가 여러 개 있는 경우, 한정자(qualifier)를 사용하여 구분합니다.

### 문자열 한정자 (String Qualifier)

| DSL | 어노테이션 |
|-----|------------|
| `named("local")` | `@Named("local")` |

```kotlin
// DSL
val module = module {
    single<Database>(named("local")) { LocalDatabase() }
    single<Database>(named("remote")) { RemoteDatabase() }
}

// 주입
private val localDb: Database by inject(named("local"))
private val remoteDb: Database by inject(named("remote"))
```

```kotlin
// 어노테이션
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
@Named("remote")
class RemoteDatabase : Database
```

### 타입 한정자 (Type Qualifier)

컴파일 타임 안전성을 위해 타입(클래스, 객체 또는 열거형)을 한정자로 사용합니다.

| DSL | 어노테이션 |
|-----|------------|
| `named<LocalDb>()` | `@Qualifier(LocalDb::class)` |

```kotlin
// 한정자 타입 정의
object LocalDb
object RemoteDb

// DSL
val module = module {
    single<Database>(named<LocalDb>()) { LocalDatabase() }
    single<Database>(named<RemoteDb>()) { RemoteDatabase() }
}

// 주입
private val localDb: Database by inject(named<LocalDb>())
private val remoteDb: Database by inject(named<RemoteDb>())
```

```kotlin
// 어노테이션
@Singleton
@Qualifier(LocalDb::class)
class LocalDatabase : Database

@Singleton
@Qualifier(RemoteDb::class)
class RemoteDatabase : Database
```

### 컴포즈에서 사용

```kotlin
@Composable
fun MyScreen() {
    // 문자열 한정자 사용
    val localDb: Database = koinInject(named("local"))

    // 타입 한정자 사용
    val remoteDb: Database = koinInject(named<RemoteDb>())
}
```

## 파라미터를 사용한 주입

주입 시점에 파라미터를 전달합니다.

### 정의

```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository
)

// 또는 DSL 사용
factory<UserPresenter>()
```

### 주입

```kotlin
// by inject()
private val presenter: UserPresenter by inject { parametersOf("user123") }

// get()
val presenter: UserPresenter = get { parametersOf("user123") }
```

### 컴포즈에서 사용

```kotlin
@Composable
fun UserScreen(userId: String) {
    val presenter: UserPresenter = koinInject { parametersOf(userId) }
}
```

### 여러 파라미터 전달

```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: String,
    val repository: OrderRepository
)

val presenter = get<OrderPresenter> { parametersOf("user123", "order456") }
```

## Koin 직접 접근

필요한 경우 Koin 인스턴스에 직접 접근할 수 있습니다.

```kotlin
// GlobalContext에서 접근
val koin = KoinPlatform.getKoin()
val service: MyService = koin.get()

// KoinComponent 내부에서 접근
class MyClass : KoinComponent {
    fun doSomething() {
        val service: MyService = getKoin().get()
    }
}
```

## Null 가능한 주입 (Nullable Injection)

선택적 의존성의 경우:

```kotlin
// 찾지 못하면 null을 반환
val optional: MyService? = getKoinOrNull()?.getOrNull()

// KoinComponent 내부에서
class MyClass : KoinComponent {
    private val optional: MyService? = getOrNull()
}
```

## 다양한 컨텍스트에서의 주입

### ViewModel에서

```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // 생성자 주입 - KoinComponent가 필요하지 않음
}
```

### Service에서

```kotlin
class MyService : Service() {
    private val repository: UserRepository by inject()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        repository.doSomething()
        return START_STICKY
    }
}
```

### BroadcastReceiver에서

```kotlin
class MyReceiver : BroadcastReceiver(), KoinComponent {
    private val service: NotificationService by inject()

    override fun onReceive(context: Context, intent: Intent) {
        service.handleNotification(intent)
    }
}
```

### WorkManager Worker에서

```kotlin
class MyWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository  // Koin에 의해 주입됨
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        repository.syncData()
        return Result.success()
    }
}

// 모듈
val workerModule = module {
    worker<MyWorker>()
}
```

## 베스트 프랙티스

### 권장: 비즈니스 로직에는 생성자 주입 사용

```kotlin
// 좋음 - Koin 없이도 테스트 가능
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(data: UserData) = validator.validate(data).let {
        repository.save(it)
    }
}

// Koin 없이 테스트
@Test
fun testCreateUser() {
    val mockRepo = mockk<UserRepository>()
    val mockValidator = mockk<UserValidator>()
    val service = UserService(mockRepo, mockValidator)
    // 직접 테스트
}
```

### 권장: 프레임워크 클래스에는 필드 주입 사용

```kotlin
// 좋음 - Activity 생성은 안드로이드에 의해 제어됨
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

### 지양: 비즈니스 로직에서의 KoinComponent 사용

```kotlin
// 나쁨 - Koin과의 강한 결합
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 좋음 - 생성자 주입
class UserService(private val repository: UserRepository)
```

### 지양: 생성자 내에서 get() 사용

```kotlin
// 나쁨 - 생성자 내에서의 부수 효과(side effects)
class MyService(
    private val repo: UserRepository = get()  // 이렇게 하지 마세요!
)

// 좋음 - Koin이 주입하도록 설정
class MyService(private val repo: UserRepository)
```

## 다음 단계

- **[Scopes](/docs/reference/koin-core/scopes)** - 의존성 생명주기 관리
- **[Koin for Android](/docs/reference/koin-android/start)** - 안드로이드 전용 주입
- **[Koin for Compose](/docs/reference/koin-compose/compose)** - 컴포즈 주입