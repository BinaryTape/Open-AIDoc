---
title: 단위 테스트
---

# 단위 테스트 (Unit Testing)

이 가이드에서는 Koin을 사용하여 JVM 단위 테스트를 작성하는 방법을 보여줍니다. 테스트마다 컨테이너를 시작 및 중지하고, 인스턴스를 가져오고, 정의를 재정의(override)하며, 의존성을 모의 객체(mock)로 교체하는 방법을 다룹니다. 이 문서는 모든 테스트 기법에 대한 레퍼런스이며, 플랫폼별 페이지([Android 계측 테스트](/docs/reference/koin-android/instrumented-testing), [Compose](/docs/reference/koin-compose/compose-testing), [Ktor](/docs/reference/koin-ktor/ktor-testing))에서는 해당 플랫폼에 특화된 내용만 다룹니다. 읽기 전에 [Koin 시작하기](/docs/reference/koin-core/starting-koin)와 [정의](/docs/reference/koin-core/definitions) 선언 방법을 알고 있어야 합니다.

## 의존성 (Dependencies) {id="dependencies"}

테스트 의존성에 `koin-test`와 사용하는 JUnit 버전에 맞는 아티팩트를 추가합니다:

```kotlin
dependencies {
    testImplementation("io.insert-koin:koin-test")
    // 둘 중 하나를 선택
    testImplementation("io.insert-koin:koin-test-junit4")
    testImplementation("io.insert-koin:koin-test-junit5")
}
```

버전은 Koin BOM에서 가져오므로 [Gradle 설정](/docs/setup/gradle)을 참조하세요. `koin-test`는 모킹(mocking) 라이브러리에 대한 의존성이 없으므로 Mockito, MockK 또는 다른 라이브러리를 직접 연동하여 사용할 수 있습니다([declareMock으로 모킹하기](#mocking-with-declaremock) 참조).

## KoinTest {id="kointest"}

테스트 클래스에서 `KoinTest`를 구현합니다. 이를 통해 해당 클래스는 [KoinComponent](/docs/reference/koin-core/koin-component)가 되므로, 테스트 내에서 `get()`과 `by inject()`를 직접 사용할 수 있습니다:

```kotlin
import org.koin.test.KoinTest
import org.koin.test.get
import org.koin.test.inject

class UserServiceTest : KoinTest {

    // 최초 접근 시 해결(resolve)됨
    private val userService: UserService by inject()

    @Test
    fun `finds a known user`() {
        startKoin { modules(appModule) }

        val repository = get<UserRepository>()

        assertNotNull(userService.findUser("alice"))
        assertSame(repository, userService.repository)

        stopKoin()
    }
}
```

`KoinTest`는 `startKoin`으로 생성되는 전역 Koin 컨텍스트(global Koin context)와 함께 동작합니다. `Application` 클래스가 Koin을 시작하는 Android 계측 테스트에는 적용되지 않으므로, [Android 계측 테스트](/docs/reference/koin-android/instrumented-testing)를 참조하세요.

## 각 테스트마다 Koin 시작 및 중지 {id="start-and-stop-koin-for-each-test"}

각 테스트는 자체 컨테이너를 시작하고 테스트가 끝날 때 이를 중지해야 합니다. 컨테이너가 계속 실행 중인 상태로 남아 있으면 다음 `startKoin` 실행 시 `KoinApplicationAlreadyStartedException`과 함께 실패하며, 테스트 간에 인스턴스가 누수(leak)될 수 있습니다.

애플리케이션과 동일한 구성을 로드합니다:

**컴파일러 플러그인 DSL (Compiler Plugin DSL)**
```kotlin
class UserServiceTest : KoinTest {

    @Before
    fun before() {
        startKoin { modules(appModule) }
    }

    @After
    fun after() {
        stopKoin()
    }
}
```

**어노테이션 (Annotations)**
타입 지정 API를 사용하여 앱의 `@KoinApplication` 클래스를 시작합니다:

```kotlin
import org.koin.plugin.module.dsl.startKoin

class UserServiceTest : KoinTest {

    @Before
    fun before() {
        startKoin<MyApp>()
    }

    @After
    fun after() {
        stopKoin()
    }
}
```

일부 모듈만 로드하려면 일반 `startKoin { }` 내부에서 `module<DataModule>()` 또는 `modules(DataModule::class, CacheModule::class)`를 사용하세요.

**생성자 / 클래식 DSL (Constructor / Classic DSL)**
```kotlin
class UserServiceTest : KoinTest {

    @Before
    fun before() {
        startKoin { modules(appModule) }
    }

    @After
    fun after() {
        stopKoin()
    }
}
```

`@After`를 작성하지 않고 Koin을 중지하려면 `AutoCloseKoinTest`를 상속하거나 `ClosingKoinTest`를 구현하세요. 둘 다 각 테스트가 끝난 후 `stopKoin()`을 호출합니다. JUnit 5 버전은 `org.koin.test.junit5`에 포함되어 있습니다.

아래에 소개하는 JUnit Rule 및 Extension을 사용하면 시작과 중지를 자동으로 처리해주므로 코드를 더 간결하게 작성할 수 있습니다.

## JUnit 4: KoinTestRule {id="junit-4-kointestrule"}

`KoinTestRule`(`koin-test-junit4` 제공)은 각 테스트 실행 전에 Koin을 시작하고 테스트 후에 중지합니다:

```kotlin
import org.koin.test.KoinTestRule

class UserServiceTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        printLogger()
        modules(appModule)
    }

    private val userService: UserService by inject()

    @Test
    fun `finds a known user`() {
        assertNotNull(userService.findUser("alice"))
    }
}
```

람다는 일반적인 `KoinApplication` 선언입니다. 즉, `startKoin { }` 안에 작성하는 모든 내용을 여기서도 그대로 사용할 수 있습니다. 어노테이션을 사용하는 경우 `withConfiguration<MyApp>()`으로 앱을 로드합니다:

```kotlin
import org.koin.plugin.module.dsl.withConfiguration

@get:Rule
val koinTestRule = KoinTestRule.create {
    withConfiguration<MyApp>()
}
```

테스트가 시작될 때 이미 Koin 컨테이너가 실행 중이라면 해당 Rule이 먼저 컨테이너를 닫습니다. 시작된 인스턴스는 `koinTestRule.koin`으로 접근할 수 있습니다.

## JUnit 5: KoinTestExtension {id="junit-5-kointestextension"}

`KoinTestExtension`(`koin-test-junit5` 제공)은 JUnit 5에서 동일한 역할을 수행합니다. `@JvmField`와 `@RegisterExtension`을 사용하여 등록합니다:

```kotlin
import org.koin.test.junit5.KoinTestExtension

class UserServiceTest : KoinTest {

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(appModule)
    }

    private val userService: UserService by inject()

    @Test
    fun `finds a known user`() {
        assertNotNull(userService.findUser("alice"))
    }
}
```

이 확장(extension)을 통해 `Koin` 인스턴스를 테스트 함수의 파라미터로 전달받을 수도 있습니다:

```kotlin
@Test
fun `resolves from the test container`(koin: Koin) {
    assertNotNull(koin.get<UserRepository>())
}
```

## 테스트를 위한 정의 재정의 (Override definitions for a test) {id="override-definitions-for-a-test"}

프로덕션 정의를 교체하려면 프로덕션 모듈 다음에 테스트 모듈을 로드합니다. 가장 마지막에 로드된 모듈이 우선 적용됩니다:

```kotlin
val testModule = module {
    single<ApiService> { FakeApiService() }
}

@get:Rule
val koinTestRule = KoinTestRule.create {
    modules(appModule, testModule)
}
```

`single<ApiService> { FakeApiService() }`와 같은 람다 정의는 모든 스타일에 동작하므로, 앱에서 컴파일러 플러그인 DSL이나 어노테이션을 사용하더라도 이 방식으로 테스트 모듈을 작성할 수 있습니다.

앱이 `allowOverride(false)`로 Koin을 시작하는 경우 각 테스트 정의에 `.override()`를 명시하세요. 재정의 규칙은 [정의](/docs/reference/koin-core/definitions#overriding-a-definition)에 설명되어 있습니다.

## declareMock으로 모킹하기 (Mocking with declareMock) {id="mocking-with-declaremock"}

`declareMock<T>()`는 `T`의 모의 객체(mock)를 생성하여 실행 중인 컨테이너에 기존 정의 대신 등록하고 이를 반환합니다. 그러면 `T`에 의존하는 모든 정의가 이 모의 객체를 주입받게 됩니다.

Koin은 자체적으로 모의 객체를 생성하지 않습니다. 먼저 모의 객체 제공자(mock provider)를 등록해야 합니다:

```kotlin
// JUnit 4, Mockito
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    Mockito.mock(clazz.java)
}

// JUnit 4, MockK
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    mockkClass(clazz)
}

// JUnit 5
@JvmField
@RegisterExtension
val mockProvider = MockProviderExtension.create { clazz ->
    mockkClass(clazz)
}
```

그런 다음 테스트 내에서 선택적인 스터빙(stubbing) 블록과 함께 모의 객체를 선언합니다:

```kotlin
import org.koin.test.mock.declareMock

class UserServiceTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz -> mockkClass(clazz) }

    private val userService: UserService by inject()

    @Test
    fun `returns the user from the repository`() {
        val repository = declareMock<UserRepository> {
            every { findUser("alice") } returns User("alice")
        }

        assertEquals("alice", userService.findUser("alice")?.name)
        verify { repository.findUser("alice") }
    }
}
```

`declareMock`은 일반 정의와 동일한 옵션을 받습니다:

- `qualifier`: [한정자(qualifier)](/docs/reference/koin-core/qualifiers)가 지정된 정의를 교체합니다(예: `declareMock<Database>(named("local"))`).
- `secondaryTypes`: 모의 객체를 다른 타입에도 바인딩합니다(예: `declareMock<UserRepositoryImpl>(secondaryTypes = listOf(UserRepository::class))`).

모의 객체는 루트 스코프(root scope)에서 단일 인스턴스(single instance)로 유지됩니다. 특정 스코프 내부의 정의를 모킹하려면 해당 스코프에서 `declareMock`을 호출하세요: `scope.declareMock<CartState>()`.

:::warning
모의 객체를 사용하는 클래스가 처음으로 해결(resolve)되기 전에 모의 객체를 선언해야 합니다. 이미 생성된 `single` 인스턴스는 이전에 받은 의존성을 그대로 유지합니다.
:::

## declare를 사용하여 인스턴스 선언하기 (Declare an instance with declare) {id="declare-an-instance-with-declare"}

모의 객체 대신 실제 인스턴스나 직접 생성한 인스턴스가 필요한 경우, `declare`를 사용하여 실행 중인 컨테이너에 등록할 수 있습니다:

```kotlin
import org.koin.test.mock.declare

@Test
fun `uses a fixed clock`() {
    declare<Clock> { FixedClock(at = "2026-01-01T00:00:00Z") }

    assertEquals(2026, get<ReportService>().currentYear())
}
```

`declare`는 해당 타입에 대해 이미 존재하는 정의를 재정의하며, `qualifier`를 지원하고 선언된 인스턴스를 반환합니다. 전역 컨텍스트를 사용하므로 Koin이 시작된 후에 호출해야 합니다.

## 스코프 정의 테스트 (Test scoped definitions) {id="test-scoped-definitions"}

스코프를 직접 생성하고, 해당 스코프에서 인스턴스를 해결(resolve)한 후 스코프를 닫습니다:

```kotlin
@Test
fun `cart state lives in its scope`() {
    val scope = getKoin().createScope<CheckoutSession>("checkout-1")

    val state = scope.get<CartState>()
    assertSame(state, scope.get<CartState>())

    scope.close()
}
```

스코프 관련 API에 대한 자세한 내용은 [Scopes](/docs/reference/koin-core/scopes)를 참조하세요. Android에서 Activity나 Fragment에 바인딩된 스코프는 컴포넌트 자체와 함께 테스트됩니다. 자세한 내용은 [Android 계측 테스트](/docs/reference/koin-android/instrumented-testing#scopes)를 참조하세요.

## 구성 검증 (Check your configuration) {id="check-your-configuration"}

단위 테스트는 동작을 검증합니다. 모든 정의의 모든 의존성이 제대로 선언되었는지 확인하려면 빌드 타임에 [Koin 컴파일러 플러그인](/docs/reference/koin-compiler/compile-safety)을 사용하거나 `verify()` 테스트 API를 사용하세요. 자세한 내용은 [구성 검증하기](/docs/reference/koin-test/verify)를 참조하세요.

## 제한 사항 (Limits) {id="limits"}

- 전역 컨텍스트: `startKoin`, `KoinTestRule`, `KoinTestExtension`은 모두 단일 전역 컨텍스트를 사용합니다. 따라서 Koin을 시작하는 테스트는 동일한 JVM 내에서 병렬로 실행할 수 없습니다. 병렬 테스트를 수행하려면 [격리된 컨텍스트(isolated context)](/docs/reference/koin-core/context-isolation)를 사용하세요. `KoinTest`의 `get()` 및 `inject()`는 `getKoin()`을 오버라이드하지 않는 한 전역 컨텍스트를 읽습니다.
- 모의 객체 제공자(Mock provider): `MockProviderRule` 또는 `MockProviderExtension`이 등록되어 있지 않으면 `declareMock` 호출이 실패합니다.
- 재정의의 유효 범위는 테스트 전체: 테스트 모듈, `declareMock`, `declare`로 교체된 정의는 Koin이 중지될 때만 초기화(reset)됩니다.

## 관련 문서 (Related) {id="related"}

- [구성 검증하기 (Verifying your Configuration)](/docs/reference/koin-test/verify): `verify()` 및 컴파일 타임 안전성과의 관계.
- [Android 계측 테스트 (Android Instrumented Testing)](/docs/reference/koin-android/instrumented-testing): `Application`에서 Koin을 시작하는 테스트.
- [Composable 테스트 (Testing Composables)](/docs/reference/koin-compose/compose-testing): Compose UI 테스트 및 프리뷰.
- [Ktor 테스트 (Ktor Testing)](/docs/reference/koin-ktor/ktor-testing): Koin과 함께 `testApplication` 사용하기.
- [컨텍스트 격리 (Context Isolation)](/docs/reference/koin-core/context-isolation): 라이브러리 및 병렬 테스트를 위한 프라이빗 Koin 컨테이너.
- [JUnit 테스트 퀵스타트 (JUnit Test Quickstart)](/docs/quickstart/junit-test): 전체 샘플 프로젝트.