---
title: JUnit 테스트
---

# JUnit 테스트

이 튜토리얼에서는 [Kotlin 튜토리얼](/docs/quickstart/kotlin)에서 다룬 앱을 위한 JUnit 4 테스트를 작성합니다. `KoinTestRule`을 사용하여 각 테스트마다 Koin을 시작하는 방법, `verify()`로 모듈을 검증하는 방법, 그리고 의존성을 Mockito 모의 객체(mock)로 대체하는 방법을 배웁니다. 약 10분 정도 소요됩니다. Kotlin 튜토리얼을 먼저 진행하거나 해당 샘플에서 시작하세요.

이 튜토리얼은 컴파일러 플러그인(Compiler Plugin) DSL 앱을 따릅니다. 모든 테스팅 API는 [Unit Testing](/docs/reference/koin-test/testing)에 설명되어 있습니다.

## 코드 가져오기 {id="get-the-code"}

테스트는 [koin-getting-started/kotlin](https://github.com/InsertKoinIO/koin-getting-started/tree/main/kotlin) 샘플의 `app/src/test`에 있습니다. 리포지토리를 클론하고 `kotlin` 폴더에서 테스트를 실행하세요:

```bash
./gradlew test
```

## Gradle 설정 {id="gradle-setup"}

샘플에서는 `koin-test`, `koin-test-junit4`, Mockito를 테스트 의존성으로 추가합니다:

```toml
# gradle/libs.versions.toml
[versions]
koin = "<KOIN_VERSION>"
mockito = "<MOCKITO_VERSION>"

[libraries]
koin-test = { module = "io.insert-koin:koin-test", version.ref = "koin" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4", version.ref = "koin" }
mockito = { module = "org.mockito:mockito-inline", version.ref = "mockito" }
```

```kotlin
// app/build.gradle.kts
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4)
    testImplementation(libs.mockito)
}
```

`koin-test`는 모킹(mocking) 라이브러리에 의존하지 않으므로, 사용하는 라이브러리를 직접 추가해야 합니다. JUnit 5의 경우 대신 `koin-test-junit5`를 사용하세요([Unit Testing](/docs/reference/koin-test/testing) 참조).

## 테스트 대상 모듈 {id="the-module-under-test"}

테스트는 Kotlin 튜토리얼의 모듈을 로드합니다:

```kotlin
val appModule = module {
    single<UserApplication>()
    single<UserRepositoryImpl>() bind UserRepository::class
    single<UserServiceImpl>() bind UserService::class
}
```

각 테스트는 이 모듈을 사용하여 Koin을 시작하므로, 앱과 동일한 그래프를 대상으로 실행됩니다.

## 모듈 검증하기 {id="let-s-verify-the-module"}

`verify()`는 인스턴스를 생성하지 않고도 모듈 내 모든 생성자 매개변수에 대한 정의가 존재하는지 확인합니다:

```kotlin
import org.koin.test.AutoCloseKoinTest
import org.koin.test.verify.verify

class ModuleVerificationTest : AutoCloseKoinTest() {

    @Test
    fun verifyModules() {
        appModule.verify()
    }
}
```

정의가 누락되었거나 유효하지 않은 경우 테스트가 실패합니다. 컴파일러 플러그인이 이미 빌드 시점에 이 검사를 실행하므로, `verify()`는 플러그인이 커버하지 않는 모듈에서 가장 유용합니다. 이 기능이 필요한지 판단하려면 [Verifying your Configuration](/docs/reference/koin-test/verify)을 참조하세요.

## 테스트에서 Koin 시작하기 {id="let-s-start-koin-in-a-test"}

`KoinTest`를 구현하고 `KoinTestRule`을 추가합니다. 이 규칙(rule)은 각 테스트 전에 Koin을 시작하고 테스트 후에 중지합니다:

```kotlin
import org.koin.test.KoinTest
import org.koin.test.KoinTestRule

class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }
}
```

`KoinTest`는 테스트 클래스에 `get()` 및 `by inject()`(예: `val userService: UserService by inject()`)를 제공합니다. 테스트마다 새로운 컨테이너를 시작하면 테스트 간에 인스턴스가 누출되는 것을 방지할 수 있습니다.

## 의존성 모킹하기 {id="let-s-mock-a-dependency"}

`MockProviderRule`을 추가하여 Koin에 모의 객체(mock)를 생성하는 방법을 알려준 다음, `declareMock`을 사용해 `UserRepository`를 대체합니다:

```kotlin
import org.koin.test.mock.MockProviderRule
import org.koin.test.mock.declareMock
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.mockito.Mockito.times

class HelloMockTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz -> Mockito.mock(clazz.java) }

    @Test
    fun `mock test`() {
        val service = declareMock<UserRepository> {
            given(findUserOrNull(anyString())).willReturn(User("Mock", "mock@example.com"))
        }

        getKoin().get<UserApplication>().sayHello("Mock")
        Mockito.verify(service, times(1)).findUserOrNull(anyString())
    }
}
```

`declareMock`은 이번 테스트에 한해서만 `UserRepository` 정의를 대체합니다. `UserApplication`과 `UserService`는 실제 객체이므로, 테스트는 호출이 `UserService`를 거쳐 리포지토리까지 1회 도달하는지 확인합니다.

## 다음 단계 {id="next-steps"}

- [Unit Testing](/docs/reference/koin-test/testing): 모든 테스팅 API, JUnit 5 및 정의 재정의.
- [Verifying your Configuration](/docs/reference/koin-test/verify): `verify()` 옵션 및 컴파일러 플러그인이 이를 대체하는 시점.
- [Instrumented testing](/docs/reference/koin-android/instrumented-testing): Koin을 사용하는 Android 앱 테스트.
- [Ktor testing](/docs/reference/koin-ktor/ktor-testing): Koin을 사용한 Ktor 라우트 테스트.
- [Tooling](/docs/tooling): Koin용 IDE 플러그인 및 모니터링 도구.