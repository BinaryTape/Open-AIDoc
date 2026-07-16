---
title: Composable 테스트하기
---

# Koin으로 Composable 테스트하기

이 가이드는 안드로이드 스튜디오 프리뷰부터 포괄적인 단위 테스트에 이르기까지, Koin을 사용하는 Compose 애플리케이션의 테스트 전략을 다룹니다.

## KoinApplicationPreview

Koin 의존성이 포함된 안드로이드 스튜디오 프리뷰에는 `KoinApplicationPreview`를 사용하세요:

```kotlin
@Preview
@Composable
fun UserScreenPreview() {
    KoinApplicationPreview(application = {
        modules(module {
            viewModel { UserViewModel(FakeUserRepository()) }
        })
    }) {
        UserScreen()
    }
}
```

### 다중 프리뷰 (Multiple Previews)

```kotlin
@Preview(name = "Light Mode")
@Preview(name = "Dark Mode", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Preview(name = "Large Font", fontScale = 1.5f)
@Composable
fun UserCardPreviews() {
    KoinApplicationPreview(application = {
        modules(previewModule)
    }) {
        UserCard(user = sampleUser)
    }
}

val previewModule = module {
    single<UserRepository> { FakeUserRepository() }
    viewModel { UserViewModel(get()) }
}
```

### 다양한 상태의 프리뷰

```kotlin
@Preview(name = "Loading")
@Composable
fun LoadingPreview() {
    KoinApplicationPreview(application = {
        modules(module {
            viewModel { UserViewModel(LoadingRepository()) }
        })
    }) {
        UserScreen()
    }
}

@Preview(name = "Error")
@Composable
fun ErrorPreview() {
    KoinApplicationPreview(application = {
        modules(module {
            viewModel { UserViewModel(ErrorRepository()) }
        })
    }) {
        UserScreen()
    }
}

@Preview(name = "Success")
@Composable
fun SuccessPreview() {
    KoinApplicationPreview(application = {
        modules(module {
            viewModel { UserViewModel(SuccessRepository(sampleUsers)) }
        })
    }) {
        UserScreen()
    }
}
```

## ComposeTestRule을 사용한 단위 테스트

### 기본 설정

```kotlin
class UserScreenTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { FakeUserRepository() }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun displaysUserList() {
        composeTestRule.setContent {
            UserScreen()
        }

        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
        composeTestRule.onNodeWithText("Bob").assertIsDisplayed()
    }
}
```

### 사용자 상호작용 테스트

```kotlin
@Test
fun clickingUserShowsDetails() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 사용자 클릭
    composeTestRule.onNodeWithText("Alice").performClick()

    // 내비게이션 또는 상태 변경 확인
    composeTestRule.onNodeWithText("alice@example.com").assertIsDisplayed()
}

@Test
fun searchFiltersUsers() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 검색어 입력
    composeTestRule.onNodeWithTag("searchField").performTextInput("Ali")

    // 필터링된 결과 확인
    composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    composeTestRule.onNodeWithText("Bob").assertDoesNotExist()
}
```

### ViewModel 상태 테스트

```kotlin
@Test
fun showsLoadingIndicator() {
    val loadingRepository = object : UserRepository {
        override suspend fun getUsers(): `List<User>` {
            delay(Long.MAX_VALUE) // 절대 완료되지 않음
            return emptyList()
        }
    }

    startKoin {
        modules(module {
            single<UserRepository> { loadingRepository }
            viewModel { UserViewModel(get()) }
        })
    }

    composeTestRule.setContent {
        UserScreen()
    }

    composeTestRule.onNodeWithTag("loadingIndicator").assertIsDisplayed()

    stopKoin()
}

@Test
fun showsErrorMessage() {
    val errorRepository = object : UserRepository {
        override suspend fun getUsers(): `List<User>` {
            throw IOException("Network error")
        }
    }

    startKoin {
        modules(module {
            single<UserRepository> { errorRepository }
            viewModel { UserViewModel(get()) }
        })
    }

    composeTestRule.setContent {
        UserScreen()
    }

    composeTestRule.waitUntil(5000) {
        composeTestRule
            .onAllNodesWithText("Network error")
            .fetchSemanticsNodes()
            .isNotEmpty()
    }

    stopKoin()
}
```

## 의존성 모킹 (Mocking Dependencies)

### MockK 사용하기

```kotlin
class UserScreenMockTest : KoinTest {

    private val mockRepository = mockk<UserRepository>()

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single { mockRepository }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun loadsUsersOnStart() = runTest {
        coEvery { mockRepository.getUsers() } returns listOf(
            User("Test User", "test@example.com")
        )

        composeTestRule.setContent {
            UserScreen()
        }

        composeTestRule.waitUntil(5000) {
            composeTestRule
                .onAllNodesWithText("Test User")
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        coVerify { mockRepository.getUsers() }
    }

    @Test
    fun refreshCallsRepository() = runTest {
        coEvery { mockRepository.getUsers() } returns emptyList()

        composeTestRule.setContent {
            UserScreen()
        }

        // 새로고침 트리거
        composeTestRule.onNodeWithTag("refreshButton").performClick()

        coVerify(exactly = 2) { mockRepository.getUsers() }
    }
}
```

### 가짜 구현체(Fake Implementation) 사용하기

```kotlin
class FakeUserRepository : UserRepository {
    private val users = mutableListOf<User>()
    var shouldFail = false

    override suspend fun getUsers(): `List<User>` {
        if (shouldFail) throw IOException("Fake error")
        return users.toList()
    }

    override suspend fun addUser(user: User) {
        users.add(user)
    }

    fun setUsers(vararg newUsers: User) {
        users.clear()
        users.addAll(newUsers)
    }
}

class UserScreenFakeTest : KoinTest {

    private val fakeRepository = FakeUserRepository()

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { fakeRepository }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule
    val composeTestRule = createComposeRule()

    @Before
    fun setup() {
        fakeRepository.setUsers(
            User("Alice", "alice@example.com"),
            User("Bob", "bob@example.com")
        )
    }

    @Test
    fun displaysUsers() {
        composeTestRule.setContent {
            UserScreen()
        }

        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
        composeTestRule.onNodeWithText("Bob").assertIsDisplayed()
    }

    @Test
    fun handlesError() {
        fakeRepository.shouldFail = true

        composeTestRule.setContent {
            UserScreen()
        }

        composeTestRule.waitUntil(5000) {
            composeTestRule
                .onAllNodesWithText("Error")
                .fetchSemanticsNodes()
                .isNotEmpty()
        }
    }
}
```

## 내비게이션 테스트

```kotlin
class NavigationTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(testModule)
    }

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun navigatesToDetail() {
        lateinit var navController: NavHostController

        composeTestRule.setContent {
            navController = rememberNavController()
            AppNavigation(navController)
        }

        // 상세 페이지로 이동
        composeTestRule.onNodeWithText("View Details").performClick()

        // 내비게이션 확인
        assertEquals("detail/123", navController.currentDestination?.route)
    }

    @Test
    fun backNavigationWorks() {
        lateinit var navController: NavHostController

        composeTestRule.setContent {
            navController = rememberNavController()
            AppNavigation(navController)
        }

        // 앞으로 이동
        composeTestRule.onNodeWithText("View Details").performClick()

        // 뒤로 이동
        composeTestRule.onNodeWithContentDescription("Back").performClick()

        // 홈으로 돌아왔는지 확인
        assertEquals("home", navController.currentDestination?.route)
    }
}
```

## 코루틴 테스트

```kotlin
class CoroutineTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { FakeUserRepository() }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun asyncOperationCompletes() = runTest {
        composeTestRule.setContent {
            UserScreen()
        }

        // 비동기 작업 대기
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule
                .onAllNodesWithTag("userList")
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        // 결과 확인
        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

## 멀티플랫폼 테스트

Compose Multiplatform의 경우, `expect`/`actual` 테스트 헬퍼를 생성하세요:

```kotlin
// commonTest
expect fun createTestComposeRule(): ComposeTestRule

// androidTest
actual fun createTestComposeRule(): ComposeTestRule = createComposeRule()

// Common test
class CommonUserScreenTest : KoinTest {

    @get:Rule
    val composeTestRule = createTestComposeRule()

    @Test
    fun displaysContent() {
        startKoin {
            modules(testModule)
        }

        composeTestRule.setContent {
            UserScreen()
        }

        // 단언문(Assertions)...

        stopKoin()
    }
}
```

## 권장 사항 (Best Practices)

1. **KoinTestRule 사용** - 설정(setup) 및 해제(teardown)를 자동으로 처리합니다.
   ```kotlin
   @get:Rule
   val koinTestRule = KoinTestRule.create { modules(testModule) }
   ```

2. **Mock보다 Fake 선호** - 더 예측 가능하고 이해하기 쉽습니다.

3. **한 번에 하나의 동작만 테스트** - 집중된 테스트가 유지보수하기 더 쉽습니다.

4. **시맨틱(Semantic) 테스트 태그 사용** - UI 변경에도 견고한 테스트를 만듭니다.
   ```kotlin
   Modifier.testTag("submitButton")
   ```

5. **비동기 작업 대기** - 비동기 상태에 대해서는 `waitUntil`을 사용하세요.
   ```kotlin
   composeTestRule.waitUntil(5000) { condition }
   ```

6. **Koin 정리** - Rule을 사용하지 않는 경우, `@After`에서 `stopKoin()`을 호출하세요.

## 다음 단계

- **[Compose 개요](/docs/reference/koin-compose/compose)** - 설정 및 기본 주입
- **[테스트 레퍼런스](/docs/reference/koin-test/testing)** - 일반적인 Koin 테스트
- **[모듈 검증](/docs/reference/koin-test/verify)** - 모듈 구성 검증