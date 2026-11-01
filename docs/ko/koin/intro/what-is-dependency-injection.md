---
title: 의존성 주입(Dependency Injection)이란 무엇인가요?
---

# 의존성 주입(Dependency Injection)이란 무엇인가요?

의존성 주입(Dependency Injection, DI)은 객체가 필요한 다른 객체를 직접 생성하지 않고 외부로부터 전달받는 디자인 패턴입니다. 이 페이지에서는 특정 프레임워크에 구애받지 않고 DI 패턴을 설명한 후, Koin과 같은 DI 컨테이너가 어디에 적합한지 살펴봅니다. 이미 DI에 대해 알고 있다면 [Core Concepts](/docs/intro/core-concepts)로 이동하세요.

## 의존성이란 무엇인가요? {id="what-is-a-dependency"}

의존성(Dependency)은 한 객체가 제 역할을 수행하기 위해 필요로 하는 다른 객체를 말합니다. 예를 들어 `Car`가 주행하려면 `Engine`이 필요합니다.

### 의존성 주입을 사용하지 않는 경우 {id="without-dependency-injection"}

```kotlin
class Engine {
    fun start() {
        println("Engine starting...")
    }
}

class Car {
    private val engine = Engine() // Car가 자체적으로 엔진을 생성함

    fun drive() {
        engine.start()
        println("Car is driving")
    }
}
```

이 코드는 동작하지만 다음과 같은 대가가 따릅니다.

- **강한 결합(Tight coupling)**: `Car`가 특정한 하나의 `Engine` 구현체에 종속됩니다.
- **테스트의 어려움**: 가짜(fake) 엔진을 사용하여 `Car`를 테스트할 수 없습니다.
- **변경의 어려움**: 전기 엔진으로 변경하려면 `Car` 코드를 직접 수정해야 합니다.
- **부적절한 생명주기 관리 위치**: `Engine`이 언제 생성되고 몇 개나 존재해야 하는지를 `Car`가 결정하게 됩니다.

### 의존성 주입을 사용하는 경우 {id="with-dependency-injection"}

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

이제 `Car`는 `Engine`이 어떻게 생성되는지 알 필요가 없습니다. 테스트 시 가짜 객체를 포함하여 어떤 구현체든 전달할 수 있으며, 생성자를 보면 `Car`에 무엇이 필요한지 명확히 알 수 있습니다.

## 의존성을 제공하는 방법 {id="ways-to-provide-dependencies"}

### 생성자 주입 (Constructor injection) {id="constructor-injection"}

의존성을 생성자 매개변수로 전달합니다.

```kotlin
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient,
) {
    fun getUser(id: String): User =
        database.query(id) ?: apiClient.fetchUser(id)
}
```

의존성이 명시적이고 필수적이며, 불변(`val`)으로 유지할 수 있습니다. 프레임워크 없이도 클래스를 생성하고 테스트할 수 있습니다. 기본적으로 이 방식을 사용하는 것이 좋습니다.

### 필드 주입 (Field injection) {id="field-injection"}

객체가 생성된 후 프로퍼티에 의존성을 할당합니다. 안드로이드의 `Activity`처럼 프레임워크가 객체를 생성하여 생성자를 직접 제어할 수 없을 때 필요합니다.

```kotlin
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel() // 최초 접근 시 Koin에 의해 채워짐
}
```

이 방식은 이러한 프레임워크 진입점에서만 사용해야 합니다. 그 하위 계층에서는 생성자 주입을 사용하세요.

### 메서드 주입 (Method injection) {id="method-injection"}

의존성을 필요로 하는 메서드에 직접 전달합니다.

```kotlin
class ReportGenerator {
    fun generateReport(data: DataSource) {
        ...
    }
}
```

호출할 때마다 달라지는 의존성이거나, 특정 메서드 하나에서만 사용하는 의존성에 적합합니다.

## 수동 및 자동 의존성 주입 {id="manual-and-automated-dependency-injection"}

### 수동으로 연결하기 (Wiring by hand) {id="wiring-by-hand"}

라이브러리를 사용하지 않고도 객체 그래프를 직접 구성하여 DI를 적용할 수 있습니다.

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

앱이 커질수록 이러한 코드가 여러 곳에서 중복되고, 생성자가 변경될 때마다 코드를 수정해야 하며, 각 객체의 생명주기를 제어할 수 없습니다.

### 직접 작성한 컨테이너 (A container written by hand) {id="a-container-written-by-hand"}

그다음으로 흔히 사용하는 방법은 객체 생성을 중앙 집중화하는 컨테이너 객체를 만드는 것입니다.

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

이렇게 하면 중복은 제거되지만, 여전히 모든 생성자 호출 코드를 직접 작성하고 유지보수해야 합니다. 또한 "단일 인스턴스"나 "매번 새로운 인스턴스" 이상의 생명주기(화면별 인스턴스, 세션별 인스턴스 등)를 관리하려면 더 많은 코드를 직접 작성해야 합니다.

### DI 컨테이너 (A DI container) {id="a-di-container"}

DI 라이브러리는 컨테이너를 자동화합니다. 어떤 클래스가 존재하고 수명이 얼마나 유지되는지만 선언하면, 라이브러리가 객체 그래프를 빌드합니다. Koin을 사용하는 예는 다음과 같습니다.

**Compiler Plugin DSL**
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

**Annotations**
```kotlin
@Singleton
class UserRepository(private val database: Database, private val apiClient: ApiClient)

@Singleton
class UserService(private val userRepository: UserRepository, private val authRepository: AuthRepository)

@KoinViewModel
class UserViewModel(private val userService: UserService) : ViewModel()

// Database, ApiClient, AuthRepository도 동일한 방식으로 어노테이션이 지정됩니다.

@Module
@ComponentScan("com.example.app")
class AppModule
```

**Constructor / Classic DSL**
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

그런 다음 Activity는 객체 그래프의 최상위 요소를 요청합니다.

```kotlin
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

컨테이너는 `UserViewModel`과 그 하위의 모든 객체를 생성하고, 앱 전체에서 단 하나의 `Database`를 유지하며, 각 화면마다 새로운 `UserViewModel`을 제공합니다. 자세한 내용은 [Core Concepts](/docs/intro/core-concepts)에서 설명합니다.

## DI 라이브러리가 그래프를 빌드하는 방식 {id="how-di-libraries-build-the-graph"}

DI 라이브러리마다 그래프를 빌드하는 시점과 방식에 차이가 있습니다.

| 접근 방식 | 동작 방식 | 예시 |
|----------|--------------|----------|
| Reflection | 런타임에 생성자를 읽고 리플렉션을 통해 호출함 | Guice, Spring |
| Annotation processing | 빌드 시점에 팩토리 소스 코드를 생성함 | Dagger, Hilt |
| Compiler plugin | 컴파일러 내부에서 코드를 재작성하고 빌드 시점에 그래프를 검증함 | Koin Compiler Plugin |
| Runtime DSL | 팩토리를 Kotlin 람다로 작성하면, 컨테이너가 런타임에 이를 실행함 | Koin Classic DSL |

Koin은 모든 경우에 런타임 컨테이너를 유지합니다. 컴파일러 플러그인은 여기에 객체 연결(wiring)과 빌드 타임 검증 기능을 추가합니다. 이것이 실제로 무엇을 의미하는지는 [What is Koin?](/docs/intro/what-is-koin)을 참조하세요.

## 서비스 로케이터와 의존성 주입 {id="service-locator-and-dependency-injection"}

이 두 패턴은 종종 혼동되곤 합니다.

**서비스 로케이터(Service locator)** 방식에서는 클래스가 레지스트리에 필요한 의존성을 요청합니다.

```kotlin
class UserService : KoinComponent {
    private val repository: UserRepository by inject() // 컨테이너로부터 가져옴
}
```

**의존성 주입(Dependency injection)** 방식에서는 의존성이 클래스 외부로부터 제공됩니다.

```kotlin
class UserService(
    private val repository: UserRepository // 외부에서 주입됨
)
```

| 비교 항목 | 서비스 로케이터 | 의존성 주입 |
|--------|-----------------|----------------------|
| 의존성의 가시성 | 클래스 내부에 숨겨짐 | 생성자에 명시적으로 드러남 |
| 테스트 | 컨테이너 또는 테스트용 컨테이너 필요 | 생성자에 가짜 객체(fake) 전달 가능 |
| 결합도 | 클래스가 컨테이너에 의존함 | 클래스가 오직 자신의 매개변수에만 의존함 |
| Koin에서의 형태 | `get()`, `by inject()`, `KoinComponent` | 모듈에서 확인(resolve)되는 생성자 매개변수 |
| 적합한 대상 | 직접 생성하지 않는 프레임워크 클래스 | 비즈니스 로직, 리포지토리, 서비스 |

Koin은 두 가지 방식을 모두 지원합니다. 직접 작성하는 클래스에는 의존성 주입을 사용하고, 프레임워크가 객체를 생성하는 위치(`Activity`, `Fragment`, Ktor 라우트 등)에만 서비스 로케이터 방식을 사용하세요.

```kotlin
// 지양할 방식: 숨겨진 의존성, 테스트 시 Koin 필요
class UserService : KoinComponent {
    private val repository: UserRepository = get()
}

// 권장하는 방식: 명시적 의존성
class UserService(private val repository: UserRepository)
```

## 이를 통해 얻는 이점 {id="what-you-gain"}

### 테스트 용이성 (Testability) {id="testability"}

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

의존성을 주입받는 클래스는 단순히 생성자를 호출하는 것만으로 테스트할 수 있습니다. 컨테이너가 전혀 필요하지 않습니다.

### 손쉬운 구현체 교체 (Swappable implementations) {id="swappable-implementations"}

```kotlin
val appModule = module {
    single<EmailService> { SmtpEmailService() }
}

val testModule = module {
    single<EmailService> { FakeEmailService() }
}
```

소비자(Consumer)는 `EmailService`에만 의존합니다. 어떤 구현체를 사용할지는 모듈이라는 한곳에서 결정됩니다.

### 중앙 집중식 구성 (Central configuration) {id="central-configuration"}

```kotlin
startKoin {
    modules(dataModule, domainModule, presentationModule)
}
```

전체 객체 그래프가 코드 전반에 흩어지지 않고, 일반적으로 레이어나 기능별로 하나씩 작성된 몇 개의 모듈로 명확하게 정의됩니다.

### 생명주기 관리 (Lifecycle management) {id="lifecycle-management"}

```kotlin
val appModule = module {
    single<Database>()     // 앱 전체에서 하나의 인스턴스
    factory<Presenter>()   // 요청 시마다 새로운 인스턴스

    scope<UserSession> {
        scoped<CartRepository>() // 세션당 하나의 인스턴스
    }
}
```

컨테이너가 각 객체의 수명을 결정하므로 클래스가 의존성의 생명주기를 직접 관리할 필요가 없습니다. 자세한 내용은 [Scopes](/docs/reference/koin-core/scopes)를 참조하세요.

## 관련 문서 {id="related"}

- [What is Koin?](/docs/intro/what-is-koin): Koin이 DI 컨테이너를 구현하는 방법.
- [Core Concepts](/docs/intro/core-concepts): Koin의 정의(definitions), 모듈(modules), 주입(injection) 및 스코프(scopes).
- [Retrieving Dependencies](/docs/reference/koin-core/injection): `get()` 및 `inject()`에 대한 자세한 내용.
- [Injecting in Tests](/docs/reference/koin-test/testing): Koin을 사용하는 테스트 코드 작성법.