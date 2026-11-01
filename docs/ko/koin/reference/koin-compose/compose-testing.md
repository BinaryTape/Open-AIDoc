---
title: Composable 테스트
---

# Composable 테스트

이 페이지에서는 Koin으로 테스트할 때 Compose와 관련된 특화 내용을 다룹니다. `KoinApplicationPreview`를 사용한 프리뷰, `ComposeTestRule`을 사용한 UI 테스트, 그리고 멀티플랫폼 UI 테스트를 다룹니다. 독자가 `koinInject()` 및 `koinViewModel()`을 사용하여 Composable 내에서 주입하는 방법을 알고 있다고 가정합니다([Koin for Compose](/docs/reference/koin-compose/compose) 참조). 테스트 설정, 오버라이드 및 `declareMock`에 대한 설명은 [단위 테스트(Unit Testing)](/docs/reference/koin-test/testing)를 참조하세요.

## KoinApplicationPreview를 사용한 프리뷰 {id="previews-with-koinapplicationpreview"}

프리뷰는 `Application` 클래스를 실행하지 않으므로 Koin 컨테이너가 존재하지 않습니다. `KoinApplicationPreview`는 프리뷰를 위한 컨테이너를 생성합니다.

```kotlin
import org.koin.compose.KoinApplicationPreview

val previewModule = module {
    single<UserRepository> { FakeUserRepository(sampleUsers) }
    viewModel { UserViewModel(get()) }
}

@Preview
@Composable
fun UserScreenPreview() {
    KoinApplicationPreview(application = { modules(previewModule) }) {
        UserScreen()
    }
}
```

`KoinApplicationPreview`는 `startKoin`으로 시작되는 전역 컨테이너가 아닌, `koinApplication`을 사용한 로컬 컨테이너를 생성합니다. 각 프리뷰마다 고유한 인스턴스를 가지므로 Android Studio에서 여러 프리뷰를 병렬로 렌더링할 수 있습니다.

`single<UserRepository> { FakeUserRepository(sampleUsers) }`와 같은 람다 정의는 어떤 스타일에서도 동작합니다. `application` 람다는 `startKoin { }` 내에 작성하는 모든 것을 허용하므로, 프로덕션 모듈을 로드하고 프리뷰에 필요한 부분만 오버라이드할 수도 있습니다.

여러 상태를 미리 보려면 각 프리뷰에 서로 다른 페이크(fake)를 가진 모듈을 제공하세요.

```kotlin
@Preview(name = "Error")
@Composable
fun UserScreenErrorPreview() {
    KoinApplicationPreview(application = {
        modules(previewModule, module {
            single<UserRepository> { FailingUserRepository() }
        })
    }) {
        UserScreen()
    }
}
```

동일한 함수에 지정된 여러 `@Preview` 어노테이션(라이트 모드 및 다크 모드, 폰트 배율)은 동일한 모듈을 공유합니다.

## ComposeTestRule을 사용한 UI 테스트 {id="ui-tests-with-composetestrule"}

컴포지션(composition)에서 Koin 인스턴스가 제공되지 않으면 `koinInject()`와 `koinViewModel()`은 전역 컨텍스트에서 의존성을 해결(resolve)합니다. `KoinTestRule`로 Koin을 시작하고 콘텐츠를 설정하세요.

```kotlin
class UserScreenTest : KoinTest {

    @get:Rule(order = 0)
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { FakeUserRepository(sampleUsers) }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule(order = 1)
    val composeTestRule = createComposeRule()

    @Test
    fun displaysUserList() {
        composeTestRule.setContent {
            UserScreen()
        }

        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

테스트하려는 Composable에 `KoinApplication(configuration = ...)`이 포함되어 있다면, 룰(rule)에 의해 시작된 컨테이너에 연결되고 자체 설정은 무시됩니다. 즉, 테스트 모듈이 사용됩니다.

`KoinContext { }`는 지원 중단(deprecated)되었으며 필요하지 않습니다. 테스트 콘텐츠를 이것으로 감싸지 마세요.

Android에서 이러한 테스트는 계측 테스트(instrumented tests, 또는 Robolectric)로 실행됩니다. 그래프에 `Context`가 필요하다면 [Android 계측 테스트](/docs/reference/koin-android/instrumented-testing#restart-koin-with-a-test-rule)에 나온 것처럼 룰에 `androidContext(...)`를 추가하세요.

### 페이크와 목(Fakes and mocks) {id="fakes-and-mocks"}

페이크(fake)를 사용하여 화면을 각 상태로 유도할 수 있습니다.

```kotlin
class UserScreenStatesTest : KoinTest {

    private val fakeRepository = FakeUserRepository()

    @get:Rule(order = 0)
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { fakeRepository }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule(order = 1)
    val composeTestRule = createComposeRule()

    @Test
    fun showsErrorMessage() {
        fakeRepository.shouldFail = true

        composeTestRule.setContent { UserScreen() }

        composeTestRule.waitUntil(timeoutMillis = 5_000) {
            composeTestRule.onAllNodesWithText("Network error")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
}
```

`setContent`를 호출하기 전에 페이크를 변경하세요. ViewModel은 첫 번째 컴포지션에서 생성되며 해당 시점의 데이터를 로드합니다.

대신 모킹(mocking) 라이브러리를 사용하려면 `setContent` 전에 `declareMock<UserRepository> { ... }`를 호출하세요([declareMock으로 모킹하기](/docs/reference/koin-test/testing#mocking-with-declaremock) 참조).

### 격리된 컨텍스트를 사용하는 화면 {id="screens-using-an-isolated-context"}

화면이 `KoinIsolatedContext`에서 Koin 인스턴스를 가져오는 경우([격리된 컨텍스트](/docs/reference/koin-compose/isolated-context) 참조), 테스트에 전역 컨텍스트가 필요하지 않습니다. 테스트 컨테이너를 빌드하고 동일한 방식으로 제공하세요.

```kotlin
@Test
fun sdkScreenUsesTestContainer() {
    val testKoin = koinApplication {
        modules(module { single<SdkApi> { FakeSdkApi() } })
    }

    composeTestRule.setContent {
        KoinIsolatedContext(context = testKoin) {
            SdkScreen()
        }
    }

    composeTestRule.onNodeWithText("Connected").assertIsDisplayed()
    testKoin.close()
}
```

전역 상태가 관여하지 않으므로 이러한 테스트는 병렬로 실행할 수 있습니다.

## 멀티플랫폼 UI 테스트 {id="multiplatform-ui-tests"}

`commonTest`에서는 JUnit 룰을 사용할 수 없습니다. Compose Multiplatform 테스트 라이브러리의 `runComposeUiTest`를 사용하고, `kotlin.test` 어노테이션으로 Koin을 시작하고 중지하세요.

```kotlin
// commonTest
@OptIn(ExperimentalTestApi::class)
class UserScreenCommonTest : KoinTest {

    @BeforeTest
    fun before() {
        startKoin {
            modules(module {
                single<UserRepository> { FakeUserRepository(sampleUsers) }
                viewModel { UserViewModel(get()) }
            })
        }
    }

    @AfterTest
    fun after() {
        stopKoin()
    }

    @Test
    fun displaysUserList() = runComposeUiTest {
        setContent { UserScreen() }

        onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

`KoinTest`, `startKoin`, `declareMock`은 멀티플랫폼을 지원합니다. `KoinTestRule`과 `MockProviderRule`은 JVM 전용입니다. [Compose Multiplatform 테스트 가이드](https://kotlinlang.org/docs/multiplatform/compose-test.html)에 설명된 대로 테스트 의존성을 설정하고, `commonTest`에 `io.insert-koin:koin-test`를 추가하세요.

## 주의점 {id="pitfalls"}

- 룰 순서: Koin은 콘텐츠가 설정되기 전에 시작되어야 합니다. `createAndroidComposeRule<MainActivity>()`를 사용할 경우 액티비티가 룰에 의해 실행되므로, `KoinTestRule`에 더 낮은 `order` 값을 지정해야 합니다.
- ViewModel이 이미 생성된 경우: 이전 컴포지션에서 생성된 ViewModel은 의존성을 그대로 유지합니다. 페이크나 목은 `setContent` 전에 변경하세요.
- 프리뷰 컨테이너는 로컬입니다: 전역 컨텍스트를 읽는 코드(`KoinPlatform.getKoin()`, Compose 외부의 `KoinComponent`)는 `KoinApplicationPreview` 컨테이너를 볼 수 없습니다.

## 관련 문서 {id="related"}

- [단위 테스트](/docs/reference/koin-test/testing): `KoinTestRule`, 오버라이드 및 `declareMock`.
- [Android 계측 테스트](/docs/reference/koin-android/instrumented-testing): 테스트 Application, Activity 관련 룰 순서.
- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()` 및 `KoinApplication`.
- [Compose에서의 ViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()`이 ViewModel을 생성하고 유지하는 방법.
- [격리된 컨텍스트](/docs/reference/koin-compose/isolated-context): SDK 및 라이브러리를 위한 `KoinIsolatedContext`.