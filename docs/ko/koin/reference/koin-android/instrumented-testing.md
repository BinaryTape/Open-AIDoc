---
title: Android Instrumented Testing
---

# Android Instrumented Testing

계측 테스트(Instrumented test)는 실제 `Application` 내부의 기기 또는 에뮬레이터에서 실행됩니다. 테스트가 시작될 때 이미 `Application.onCreate()`를 통해 Koin이 시작된 상태이므로, 핵심은 프로덕션 정의(definition)를 테스트용 정의로 어떻게 교체할 것인가입니다. 이 가이드에서는 이를 위한 설정 방법과 Activity, Fragment, 스코프(scope) 테스트를 다룹니다. 일반적인 기법(`KoinTest`, `KoinTestRule`, `declareMock`)에 대한 설명은 [단위 테스트(Unit Testing)](/docs/reference/koin-test/testing)를 참조하세요.

## 의존성(Dependencies) {id="dependencies"}

```kotlin
dependencies {
    androidTestImplementation("io.insert-koin:koin-test-junit4")
}
```

`koin-test-junit4`는 `koin-test`를 포함합니다. 버전은 Koin BOM에서 가져오며, 자세한 내용은 [Gradle 설정](/docs/setup/gradle)을 참조하세요.

## 설정 방식 선택하기 {id="choose-a-setup"}

| 설정 | Koin 시작 주체 | 사용 시기 |
|-------|--------------------|-------------|
| [테스트 Application](#use-a-test-application) | 테스트 `Application` 클래스 | 모든 테스트가 동일한 테스트 구성을 공유할 때 |
| [테스트 룰](#restart-koin-with-a-test-rule) | 각 테스트 실행 전 `KoinTestRule` | 각 테스트 클래스마다 고유한 모듈이 필요할 때 |
| [오버라이드 로드](#load-overrides-into-the-running-container) | 프로덕션 `Application` | 일부 정의만 교체할 때 |

## 테스트 Application 사용하기 {id="use-a-test-application"}

`androidTest`에 프로덕션 모듈과 테스트 모듈을 함께 사용하여 Koin을 시작하는 `Application`을 생성합니다. 테스트 모듈이 마지막에 로드되므로 해당 정의가 프로덕션 정의를 대체하게 됩니다.

**컴파일러 플러그인 DSL**
```kotlin
// src/androidTest 내부
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@TestApplication)
            modules(appModule, instrumentedTestModule)
        }
    }
}
```

**애노테이션**
```kotlin
// src/androidTest 내부
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp> {
            androidContext(this@TestApplication)
            modules(instrumentedTestModule)
        }
    }
}
```

`startKoin<MyApp>`은 먼저 `@KoinApplication` 클래스의 모듈을 로드한 다음, 람다에 선언된 모듈을 로드합니다.

**생성자 / 클래식 DSL**
```kotlin
// src/androidTest 내부
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@TestApplication)
            modules(appModule, instrumentedTestModule)
        }
    }
}
```

```kotlin
val instrumentedTestModule = module {
    single<ApiService> { FakeApiService() }
}
```

`single<ApiService> { FakeApiService() }`와 같은 람다 정의는 모든 스타일에 동작합니다.

이 `Application`으로 테스트를 실행하려면 커스텀 [AndroidJUnitRunner](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner)를 생성하세요:

```kotlin
class InstrumentationTestRunner : AndroidJUnitRunner() {
    override fun newApplication(
        classLoader: ClassLoader?,
        className: String?,
        context: Context?
    ): Application {
        return super.newApplication(classLoader, TestApplication::class.java.name, context)
    }
}
```

`build.gradle.kts`에 등록합니다:

```kotlin
android {
    defaultConfig {
        testInstrumentationRunner = "com.example.app.InstrumentationTestRunner"
    }
}
```

## 테스트 룰로 Koin 다시 시작하기 {id="restart-koin-with-a-test-rule"}

`KoinTestRule`은 실행 중인 Koin 컨테이너를 닫고, 각 테스트 전에 새 컨테이너를 시작하며 테스트가 끝난 후 중지합니다. `Application`이 이 컨테이너를 시작하는 주체가 아니므로 Android 컨텍스트를 직접 전달해야 합니다:

```kotlin
import androidx.test.core.app.ApplicationProvider
import org.koin.android.ext.koin.androidContext
import org.koin.test.KoinTestRule

@RunWith(AndroidJUnit4::class)
class LoginActivityTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        androidContext(ApplicationProvider.getApplicationContext())
        modules(appModule, loginTestModule)
    }
}
```

애노테이션을 사용하는 경우, [단위 테스트](/docs/reference/koin-test/testing#junit-4-kointestrule)에서처럼 `modules(appModule)` 대신 `withConfiguration<MyApp>()`을 사용하세요.

프로덕션 `Application`은 프로세스가 시작될 때 여전히 `startKoin`을 한 번 실행합니다. 룰이 해당 컨테이너를 대체하므로, `Application`의 `onCreate()`에서 resolve된 모든 것은 닫힌 컨테이너의 인스턴스를 유지하게 됩니다. `Application`이 시작 시 의존성을 resolve하는 경우, 이를 수행하지 않는 [테스트 Application](#use-a-test-application)을 사용하는 것이 좋습니다.

## 실행 중인 컨테이너에 오버라이드 로드하기 {id="load-overrides-into-the-running-container"}

프로덕션 `Application`을 유지하면서 몇 가지 정의만 변경하려면, 테스트 대상 화면이 시작되기 전에 실행 중인 컨테이너에 테스트 모듈을 로드합니다:

```kotlin
@RunWith(AndroidJUnit4::class)
class ProfileFragmentTest : KoinTest {

    private val profileTestModule = module {
        single<UserRepository> { FakeUserRepository() }
    }

    @Before
    fun before() {
        loadKoinModules(profileTestModule)
    }
}
```

이 방법은 가장 가벼운 설정이지만 함정이 가장 많습니다:

- 리셋되지 않음: 오버라이드된 정의는 프로세스 내의 이후 모든 테스트에 유지됩니다.
- 언로드는 제거할 뿐 복원하지 않음: `unloadKoinModules(profileTestModule)`은 `UserRepository` 정의를 삭제하며, 프로덕션 정의가 다시 복원되지 않습니다.
- 생성된 인스턴스가 유지됨: 프로덕션 `UserRepository`를 이미 주입받은 `single`은 이전 인스턴스를 그대로 유지합니다.

테스트마다 깨끗한 의존성 그래프가 필요하다면 [테스트 룰](#restart-koin-with-a-test-rule)을 대신 사용하세요.

## 목(Mock)과 페이크(Fake) {id="mocks-and-fakes"}

`declareMock`은 계측 테스트에서도 단위 테스트와 동일하게 동작합니다. `KoinTest`를 구현하고 `MockProviderRule`을 등록하세요([declareMock을 사용한 목킹](/docs/reference/koin-test/testing#mocking-with-declaremock) 참조). MockK를 사용하는 경우 기기에서 `io.mockk:mockk-android` 아티팩트를 사용하세요.

기기 환경에서는 페이크(fake)가 더 간단한 경우가 많습니다. 목킹 라이브러리가 필요 없으며 실제 클래스처럼 동작하기 때문입니다. 페이크는 테스트 모듈에 선언합니다. Room의 경우 각 테스트가 비어 있는 상태로 시작할 수 있도록 인메모리(in-memory) 데이터베이스를 사용하세요:

```kotlin
val testDatabaseModule = module {
    single {
        Room.inMemoryDatabaseBuilder(androidContext(), AppDatabase::class.java).build()
    }
    single { get<AppDatabase>().userDao() }
}
```

## Activity 및 Fragment 테스트 {id="activity-and-fragment-tests"}

Activity와 Fragment는 `by inject()` 및 `by viewModel()`을 사용하여 의존성을 resolve합니다([엔트리 포인트](/docs/reference/koin-android/entry-points) 참조). 테스트에서는 테스트 컨테이너에 들어 있는 것을 주입받으므로 Koin이 구성된 후에 화면을 실행해야 합니다:

```kotlin
@RunWith(AndroidJUnit4::class)
class LoginActivityTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        androidContext(ApplicationProvider.getApplicationContext())
        modules(appModule, module {
            single<AuthService> { FakeAuthService(acceptedEmail = "user@example.com") }
        })
    }

    @Test
    fun successfulLoginShowsWelcomeMessage() {
        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withId(R.id.email)).perform(typeText("user@example.com"))
            onView(withId(R.id.loginButton)).perform(click())

            onView(withId(R.id.successMessage)).check(matches(isDisplayed()))
        }
    }
}
```

`androidx.fragment:fragment-testing`의 `launchFragmentInContainer<ProfileFragment>()`를 사용하는 Fragment에서도 동일하게 동작합니다. `LoginActivity`가 `by viewModel()`로 가져오는 `LoginViewModel`은 Koin에 의해 `FakeAuthService`와 함께 생성됩니다.

실행 중인 컴포넌트에서 ViewModel이나 의존성을 가져오려면 `scenario.onActivity { activity -> ... }`를 사용해 내부에서 접근하세요. 해당 블록 외부에서는 Activity가 아직 존재하지 않을 수 있습니다.

## 스코프(Scopes) {id="scopes"}

[Android 스코프](/docs/reference/koin-android/scope)는 해당 Activity나 Fragment가 살아있는 동안에만 존재합니다. 컴포넌트를 통해 테스트하세요:

```kotlin
val checkoutTestModule = module {
    activityScope {
        scoped { CheckoutState() }
    }
}

@Test
fun fragmentSharesTheActivityScope() {
    ActivityScenario.launch(CheckoutActivity::class.java).use { scenario ->
        scenario.onActivity { activity ->
            val activityState = activity.scope.get<CheckoutState>()

            activity.supportFragmentManager.commitNow {
                replace(R.id.container, PaymentFragment())
            }
            val fragment = activity.supportFragmentManager
                .findFragmentById(R.id.container) as PaymentFragment

            assertSame(activityState, fragment.scope.get<CheckoutState>())
        }
    }
}
```

`activity.scope`와 `fragment.scope`는 컴포넌트가 `AndroidScopeComponent`를 구현했을 때 사용할 수 있습니다(예: `ScopeActivity` 및 `ScopeFragment`). Activity가 생성되기 전이나 파괴된 후에 `scope.get()`을 호출하면 실패합니다. 스코프가 아직 존재하지 않거나 이미 닫혀 있기 때문입니다.

Android 컴포넌트에 연결되지 않은 스코프의 경우 JVM 단위 테스트로 충분합니다. 자세한 내용은 [단위 테스트](/docs/reference/koin-test/testing#test-scoped-definitions)를 참조하세요.

## 멀티 모듈 앱(Multi-module apps) {id="multi-module-apps"}

[멀티 모듈 앱](/docs/reference/koin-android/multi-module)에서는 테스트 대상 기능 모듈과 필요한 코어 모듈을 함께 로드하고, 테스트 오버라이드 모듈을 마지막에 로드합니다:

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    androidContext(ApplicationProvider.getApplicationContext())
    modules(
        networkModule,
        databaseModule,
        loginModule,
        homeModule,
        module { single<ApiService> { FakeApiService() } }
    )
}
```

여러 기능에서 공유하는 페이크 및 테스트 모듈은 공통 `androidTest` 소스 세트나 `:core:testing` Gradle 모듈에 두는 것이 좋습니다.

앱의 일부분만 로드하는 경우, 전체 앱에서 제공하던 의존성이 특정 정의에서 누락될 수 있습니다. [컴파일러 플러그인](/docs/reference/koin-compiler/compile-safety)은 빌드 시점에 프로덕션 그래프만 검사하며 테스트 모듈은 검사하지 않습니다. 테스트 구성을 검증하려면 JVM 테스트에서 [verify()](/docs/reference/koin-test/verify)를 사용하세요.

## Espresso와 룰 순서(Rule order) {id="espresso-and-rule-order"}

`ActivityScenarioRule`은 테스트 메서드가 실행되기 전에 Activity를 시작합니다. 만약 이것이 `KoinTestRule`보다 먼저 실행되면 Activity가 잘못된 컨테이너에서 의존성을 resolve하게 됩니다. 따라서 순서를 명시적으로 설정해야 합니다:

```kotlin
@RunWith(AndroidJUnit4::class)
@LargeTest
class CheckoutFlowTest {

    @get:Rule(order = 0)
    val koinTestRule = KoinTestRule.create {
        androidContext(ApplicationProvider.getApplicationContext())
        modules(appModule, module {
            single<CartRepository> { FakeCartRepository() }
            single<PaymentService> { FakePaymentService() }
        })
    }

    @get:Rule(order = 1)
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun completeCheckout() {
        onView(withId(R.id.cartButton)).perform(click())
        onView(withId(R.id.checkoutButton)).perform(click())
        onView(withId(R.id.completeOrderButton)).perform(click())

        onView(withId(R.id.confirmationMessage)).check(matches(isDisplayed()))
    }
}
```

`@get:Rule(order = ...)`은 JUnit 4.13 이상이 필요합니다. 이전 버전에서는 `RuleChain.outerRule(koinTestRule).around(activityRule)`을 사용하세요.

## Compose UI 테스트 {id="compose-ui-tests"}

Compose 화면의 경우 [Composable 테스트](/docs/reference/koin-compose/compose-testing)를 참조하세요.

## 테스트 간 격리(Isolation) {id="isolation-between-tests"}

단독으로는 통과하지만 함께 실행할 때 실패하는 테스트는 대개 Koin을 통해 상태를 공유하기 때문입니다:

- 테스트별 재시작: `KoinTestRule`은 각 테스트에 새로운 `single` 인스턴스를 포함하는 새 컨테이너를 제공합니다.
- 페이크 초기화: [테스트 Application](#use-a-test-application)을 사용하면 컨테이너가 전체 실행 동안 유지됩니다. `single`로 선언된 페이크는 테스트 간에 데이터를 유지하므로, `reset()` 메서드를 구현하고 `@Before`에서 이를 호출하세요.
- 오버라이드 누적 방지: `loadKoinModules`로 로드된 모듈은 로드된 상태로 유지됩니다([실행 중인 컨테이너에 오버라이드 로드하기](#load-overrides-into-the-running-container) 참조).

```kotlin
@RunWith(AndroidJUnit4::class)
class UserListTest : KoinTest {

    private val fakeRepository: FakeUserRepository by inject()

    @Before
    fun before() {
        fakeRepository.reset()
    }
}
```

`by inject<FakeUserRepository>()`는 테스트 모듈에서 페이크를 자체 타입에도 바인딩한 경우에만 동작합니다: `single { FakeUserRepository() } bind UserRepository::class`.

## 문제 해결(Troubleshooting) {id="troubleshooting"}

### KoinApplicationAlreadyStartedException {id="koinapplicationalreadystartedexception"}

컨테이너가 이미 실행 중인 상태에서 두 번째 `startKoin` 호출이 실행되었습니다. 계측 테스트에서는 `Application`이 이미 Koin을 시작한 상태입니다. 실행 중인 컨테이너를 먼저 닫는 `KoinTestRule`을 사용하거나 [테스트 Application](#use-a-test-application)을 사용하세요. `@Before`에서 `startKoin`을 호출하지 마세요.

### 테스트 정의가 사용되지 않음 {id="the-test-definition-is-not-used"}

- 로드 순서: 테스트 모듈은 동일한 타입을 선언하는 프로덕션 모듈보다 나중에 로드되어야 합니다.
- 오버라이드 비활성화: Koin이 `allowOverride(false)`로 시작된 경우, 테스트 정의에 `.override()`를 표시해야 합니다([정의](/docs/reference/koin-core/definitions#overriding-a-definition) 참조).
- 인스턴스가 이미 생성됨: 오버라이드 전에 생성된 `single`은 이전 의존성을 계속 유지합니다. 테스트 룰로 Koin을 다시 시작하세요.
- 룰 순서: Koin이 구성되기 전에 Activity가 실행되었습니다([Espresso와 룰 순서](#espresso-and-rule-order) 참조).

### 스코프 정의에 대한 NoDefinitionFoundException {id="nodefinitionfoundexception-for-a-scoped-definition"}

의존성을 resolve할 때 스코프가 열려 있지 않았습니다. Activity가 살아 있는 동안 `scenario.onActivity { }` 내부에서 스코프 정의를 resolve하고, 정의가 올바른 스코프(`activityScope`, `fragmentScope`)에 선언되었는지 확인하세요.

## 관련 문서 {id="related"}

- [단위 테스트](/docs/reference/koin-test/testing): `KoinTest`, `KoinTestRule`, `declareMock` 및 오버라이드.
- [Composable 테스트](/docs/reference/koin-compose/compose-testing): Compose UI 테스트 및 프리뷰.
- [구성 검증](/docs/reference/koin-test/verify): `verify()` 및 `androidVerify()`.
- [Android 스코프](/docs/reference/koin-android/scope): Activity, Fragment 및 ViewModel 스코프.
- [Android에서 Koin 시작하기](/docs/reference/koin-android/start): `Application`에서의 `startKoin`.