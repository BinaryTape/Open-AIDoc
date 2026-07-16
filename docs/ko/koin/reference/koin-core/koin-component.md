---
title: Koin 컴포넌트
---

`KoinComponent`는 모듈 정의 외부의 Koin 컨테이너에서 인스턴스를 가져올 수 있는 API를 제공합니다. 이는 안드로이드 액티비티(Activities)나 프레임워크 클래스와 같이 생성자 주입(constructor injection)을 사용할 수 없는 클래스에서 유용합니다.

## KoinComponent란 무엇인가요?

`KoinComponent`는 모든 클래스가 Koin 컨테이너 API에 접근할 수 있도록 해주는 인터페이스입니다. 생성자 주입 없이도 인스턴스를 가져올 수 있는 함수들을 제공합니다.

:::info
**가능하면 생성자 주입을 우선시하세요.** 모듈에 선언할 수 없는 클래스(프레임워크 클래스, UI 컴포넌트 등)에만 `KoinComponent`를 사용하십시오. 생성자 주입이 더 명확하고 테스트하기 쉬우며, 코드가 Koin에 결합되지 않습니다.
:::

## 기본 사용법

### Koin 컴포넌트 생성하기

클래스를 `KoinComponent` 인터페이스로 태깅(Tag)하십시오.

```kotlin
class MyService

val myModule = module {
    single { MyService() }
}
```

```kotlin
// Koin 시작
fun main() {
    startKoin {
        modules(myModule)
    }

    // Koin을 사용하는 컴포넌트 생성
    MyComponent()
}
```

```kotlin
class MyComponent : KoinComponent {
    // 지연 평가(Lazy evaluation) - 처음 접근할 때 인스턴스를 가져옴
    val myService: MyService by inject()

    // 또는

    // 즉각 평가(Eager evaluation) - 인스턴스를 즉시 가져옴
    val myService: MyService = get()
}
```

### 사용 가능한 함수들

`KoinComponent`를 구현하면 다음 함수들에 접근할 수 있습니다.

| 함수 | 설명 |
|----------|-------------|
| `get<T>()` | 인스턴스를 즉시(Eagerly) 가져옴 |
| `by inject<T>()` | 인스턴스를 지연하여(Lazily) 가져옴 (위임) |
| `getProperty()` | 설정 프로퍼티 가져오기 |
| `setProperty()` | 설정 프로퍼티 설정하기 |
| `getKoin()` | Koin 인스턴스에 접근 |

## 인스턴스 가져오기

### 즉시 가져오기 vs 지연 가져오기

**`get()`을 사용한 즉시(Eager) 가져오기:**
```kotlin
class MyComponent : KoinComponent {
    // 생성 중에 인스턴스를 즉시 가져옴
    val service: MyService = get()

    init {
        service.doSomething()  // 이미 사용 가능함
    }
}
```

**`by inject()`를 사용한 지연(Lazy) 가져오기:**
```kotlin
class MyComponent : KoinComponent {
    // 처음 접근할 때만 인스턴스를 가져옴
    val service: MyService by inject()

    fun doWork() {
        service.doSomething()  // 첫 접근 시 여기서 가져옴
    }
}
```

:::note
항상 필요하지 않을 수 있는 프로퍼티에는 `by inject()`를 사용하세요. 이는 처음 접근할 때까지 인스턴스 생성을 늦춥니다.
:::

### 각각의 사용 시기

| `get()` 사용 시기 | `by inject()` 사용 시기 |
|-------------|-------------------|
| `init` 블록에서 즉시 인스턴스가 필요한 경우 | 프로퍼티가 사용되지 않을 수도 있는 경우 |
| 단순하고 직접적인 접근 | 지연 초기화(lazy initialization)를 원하는 경우 |
| 함수 내부에서 객체를 빌드할 때 | 클래스 프로퍼티를 선언할 때 |

## 한정자 (Qualifiers)

한정자를 사용하여 이름이 지정된 정의를 가져옵니다.

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

    // 또는 지연 주입
    val localDb: Database by inject(named("local"))
}
```

### 한정자 타입

**문자열 한정자:**
```kotlin
val service = get<ApiService>(named("production"))
```

**타입 한정자:**
```kotlin
val service = get<ApiService>(named<ProductionService>())
```

**열거형(Enum) 한정자:**
```kotlin
enum class Environment { DEV, PROD }

val service = get<ApiService>(named(Environment.PROD))
```

## 주입 파라미터

인스턴스를 가져올 때 런타임 파라미터를 전달할 수 있습니다.

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

**지연 주입 시:**
```kotlin
class ProfileScreen : KoinComponent {
    private val userId = "user-456"

    // 처음 접근할 때 파라미터가 평가됨
    val userSession: UserSession by inject { parametersOf(userId, "profile-session") }
}
```

## 프로퍼티 (Properties)

컴포넌트에서 Koin 프로퍼티에 접근하고 수정할 수 있습니다.

### 프로퍼티 가져오기

```kotlin
class ApiClientFactory : KoinComponent {
    val apiUrl: String = getProperty("server_url")
    val apiKey: String = getProperty("api_key", "default-key")  // 기본값 사용
    val timeout: Int = getProperty("timeout", "30").toInt()
}
```

### 프로퍼티 설정하기

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

### 프로퍼티 생명주기

`setProperty()`로 설정된 프로퍼티는 다음과 같습니다:
- 모든 컴포넌트에서 사용 가능합니다.
- Koin 인스턴스 생명주기 동안 유지됩니다.
- `stopKoin()`이 호출되면 초기화됩니다.

## Koin 인스턴스 접근하기

`Koin` 컨테이너에 직접 접근할 수 있습니다.

```kotlin
class AdvancedComponent : KoinComponent {
    fun performComplexOperation() {
        val koin = getKoin()

        // 스코프 접근
        val scope = koin.createScope<MyActivity>()

        // 정의가 존재하는지 확인
        val hasService = koin.getOrNull<MyService>() != null

        // 해당 타입의 모든 인스턴스 가져오기
        val allServices = koin.getAll<Service>()
    }
}
```

## 실제 활용 사례

### 안드로이드 액티비티 (권장 방식)

:::info
안드로이드 액티비티는 **KoinComponent가 필요하지 않습니다.** Koin 안드로이드 확장 기능을 사용하세요.
:::

```kotlin
// ✅ 권장 - KoinComponent가 필요 없음
class MainActivity : AppCompatActivity() {
    private val userRepository: UserRepository by inject()
    private val viewModel: MainViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Koin 안드로이드 확장을 통해 의존성 사용 가능
        val user = userRepository.getCurrentUser()
    }
}
```

비교를 위한 이전 방식 (권장되지 않음):
```kotlin
// ❌ 불필요 - 액티비티에서 KoinComponent는 중복입니다
class MainActivity : AppCompatActivity(), KoinComponent {
    private val userRepository: UserRepository by inject()
    // ...
}
```

### 안드로이드 프래그먼트 (권장 방식)

```kotlin
// ✅ 권장 - KoinComponent가 필요 없음
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModel()
    private val userRepository: UserRepository by inject()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel.loadUser()
    }
}
```

### 커스텀 안드로이드 뷰 (KoinComponent 필요)

```kotlin
// ✅ 여기서는 KoinComponent가 적절합니다
class CustomChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr), KoinComponent {

    private val dataFormatter: ChartDataFormatter by inject()
    private val colorScheme: ColorScheme by inject()

    fun setData(data: List<DataPoint>) {
        val formatted = dataFormatter.format(data)
        // 차트 렌더링...
    }
}
```

### 콘솔 애플리케이션

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

### 코틀린 멀티플랫폼 공통 코드

```kotlin
// 플랫폼 간에 작동하는 공통 코드
class FeatureManager : KoinComponent {
    private val api: ApiClient by inject()
    private val cache: Cache by inject()

    suspend fun loadFeatures(): `List<Feature>` {
        return cache.get() ?: api.fetchFeatures().also { cache.set(it) }
    }
}
```

## KoinComponent를 사용해야 하는 경우

### 적합한 사용 사례

다음과 같은 경우 `KoinComponent`를 사용하세요:

- **커스텀 UI 컴포넌트** - 커스텀 뷰(Custom Views), 위젯(Widgets) (액티비티/프래그먼트는 제외 - 아래 참고 사항 확인)
- **진입점(Entry points)** - Main 함수, 애플리케이션(Application) 클래스
- **콜백(Callbacks)** - 생성자 주입을 사용할 수 없는 리스너(Listeners), 핸들러(Handlers)
- **레거시 코드(Legacy code)** - DI를 사용하도록 리팩터링할 수 없는 클래스
- **안드로이드 이외의 플랫폼** - JVM, Native, JS 애플리케이션

:::note
**안드로이드 개발자 참고 사항:** 액티비티, 프래그먼트, 서비스는 전용 Koin 확장 기능이 있으므로 **KoinComponent가 필요하지 않습니다.** 인터페이스를 구현하지 않고 `by inject()`와 `by viewModel()`을 직접 사용하세요. 자세한 내용은 [Android 주입](/docs/reference/koin-android/get-instances)을 참조하십시오.
:::

### 사용을 피해야 하는 경우

다음과 같은 경우 `KoinComponent`를 사용하지 마세요:

- **안드로이드 액티비티/프래그먼트/서비스** - 대신 Koin 안드로이드 확장 기능을 사용하세요.
- **비즈니스 로직** - 대신 생성자 주입을 사용하세요.
- **데이터 레이어** - 리포지토리(Repositories), 데이터 소스(Data sources)
- **도메인 레이어** - 유스케이스(Use cases), 도메인 모델
- **새로운 코드** - 생성자 주입을 사용하여 모듈에 선언하는 방식을 선호하세요.

## 권장 사항 (Best Practices)

### 생성자 주입 우선

```kotlin
// ❌ 피하세요 - 비즈니스 로직에 KoinComponent 사용
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
    private val validator: UserValidator by inject()

    fun createUser(name: String) { /* ... */ }
}

// ✅ 선호하세요 - 생성자 주입
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(name: String) { /* ... */ }
}

// 모듈에 선언
module {
    single { UserRepository() }
    single { UserValidator() }
    single { UserService(get(), get()) }
}
```

### 선택적 의존성에는 지연 주입 사용

```kotlin
class FeatureController : KoinComponent {
    // 모든 코드 경로에서 사용되지는 않을 수 있음
    private val analyticsService: AnalyticsService by inject()

    fun performAction(trackAnalytics: Boolean) {
        doWork()

        // 필요한 경우에만 분석 서비스 인스턴스를 가져옴
        if (trackAnalytics) {
            analyticsService.track("action_performed")
        }
    }
}
```

### KoinComponent 범위 제한

```kotlin
// ❌ 나쁨 - Koin을 직접 사용하는 컴포넌트가 너무 많음
class RepositoryA : KoinComponent {
    val db: Database by inject()
}

class RepositoryB : KoinComponent {
    val db: Database by inject()
}

class ServiceA : KoinComponent {
    val repoA: RepositoryA by inject()
}

// ✅ 좋음 - 단일 진입점만 사용하고 나머지는 생성자 주입 사용
class AppController : KoinComponent {
    private val serviceA: ServiceA = get()
    private val serviceB: ServiceB = get()
}

class ServiceA(private val repoA: RepositoryA)
class ServiceB(private val repoB: RepositoryB)
class RepositoryA(private val db: Database)
class RepositoryB(private val db: Database)
```

### getProperty 과용 금지

```kotlin
// ❌ 피하세요 - 모든 곳에서 프로퍼티 가져오기
class FeatureA : KoinComponent {
    val apiUrl = getProperty("api_url")
}

class FeatureB : KoinComponent {
    val apiUrl = getProperty("api_url")
}

// ✅ 좋음 - 설정 중앙 집중화
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

## 테스트

컴포넌트를 테스트할 때 Koin 설정을 오버라이드(override)할 수 있습니다.

```kotlin
class MyComponent : KoinComponent {
    val service: MyService by inject()

    fun doWork() = service.execute()
}

@Test
fun testComponent() {
    // 테스트용 Koin 인스턴스 설정
    startKoin {
        modules(module {
            single<MyService> { MockMyService() }
        })
    }

    val component = MyComponent()
    val result = component.doWork()

    assertEquals("mock result", result)

    // 정리
    stopKoin()
}
```

## 함께 보기

- [Koin 시작하기](/docs/reference/koin-core/start-koin) - Koin 초기화
- [정의](/docs/reference/koin-core/definitions) - 정의 생성하기
- [주입 파라미터](/docs/reference/koin-core/injection-parameters) - 런타임 파라미터
- [안드로이드 주입](/docs/reference/koin-android/get-instances) - 안드로이드 전용 주입