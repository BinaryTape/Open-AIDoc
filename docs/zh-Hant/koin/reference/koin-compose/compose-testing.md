---
title: 測試 Composable
---

# 使用 Koin 測試 Composable

本指南涵蓋了使用 Koin 測試 Compose 應用程式的策略，從 Android Studio 預覽到全面的單元測試。

## KoinApplicationPreview

在具有 Koin 相依性的 Android Studio 預覽中使用 `KoinApplicationPreview`：

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

### 多重預覽

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

### 不同狀態的預覽

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

## 使用 ComposeTestRule 進行單元測試

### 基本設定

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

### 測試使用者互動

```kotlin
@Test
fun clickingUserShowsDetails() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 點擊使用者
    composeTestRule.onNodeWithText("Alice").performClick()

    // 驗證導航或狀態變更
    composeTestRule.onNodeWithText("alice@example.com").assertIsDisplayed()
}

@Test
fun searchFiltersUsers() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 輸入搜尋查詢
    composeTestRule.onNodeWithTag("searchField").performTextInput("Ali")

    // 驗證過濾後的結果
    composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    composeTestRule.onNodeWithText("Bob").assertDoesNotExist()
}
```

### 使用 ViewModel 狀態進行測試

```kotlin
@Test
fun showsLoadingIndicator() {
    val loadingRepository = object : UserRepository {
        override suspend fun getUsers(): `List<User>` {
            delay(Long.MAX_VALUE) // 永遠不會完成
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

## 模擬相依性

### 使用 MockK

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

        // 觸發重新整理
        composeTestRule.onNodeWithTag("refreshButton").performClick()

        coVerify(exactly = 2) { mockRepository.getUsers() }
    }
}
```

### 使用虛設 (Fake) 實作

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

## 測試導航

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

        // 導航到詳情
        composeTestRule.onNodeWithText("View Details").performClick()

        // 驗證導航
        assertEquals("detail/123", navController.currentDestination?.route)
    }

    @Test
    fun backNavigationWorks() {
        lateinit var navController: NavHostController

        composeTestRule.setContent {
            navController = rememberNavController()
            AppNavigation(navController)
        }

        // 向前導航
        composeTestRule.onNodeWithText("View Details").performClick()

        // 向後導航
        composeTestRule.onNodeWithContentDescription("Back").performClick()

        // 驗證返回首頁
        assertEquals("home", navController.currentDestination?.route)
    }
}
```

## 使用協同程式進行測試

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

        // 等待非同步操作
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule
                .onAllNodesWithTag("userList")
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        // 驗證結果
        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

## 多平台測試

對於 Compose Multiplatform，建立 expect/actual 測試幫助程式：

```kotlin
// commonTest
expect fun createTestComposeRule(): ComposeTestRule

// androidTest
actual fun createTestComposeRule(): ComposeTestRule = createComposeRule()

// Common 測試
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

        // 斷言...

        stopKoin()
    }
}
```

## 最佳實務

1. **使用 KoinTestRule** - 自動處理設定與清理作業
   ```kotlin
   @get:Rule
   val koinTestRule = KoinTestRule.create { modules(testModule) }
   ```

2. **優先使用虛設 (Fake) 而非模擬 (Mock)** - 虛設實作更可預測且更容易理解。

3. **一次測試一個行為** - 專注的測試更容易維護。

4. **使用語義化測試標籤** - 使測試對 UI 變更具有韌性。
   ```kotlin
   Modifier.testTag("submitButton")
   ```

5. **等待非同步操作** - 對於非同步狀態使用 `waitUntil`。
   ```kotlin
   composeTestRule.waitUntil(5000) { condition }
   ```

6. **清理 Koin** - 如果不使用 Rule，請在 `@After` 中呼叫 `stopKoin()`。

## 下一步

- **[Compose 概覽](/docs/reference/koin-compose/compose)** - 設定與基礎注入
- **[測試參考](/docs/reference/koin-test/testing)** - 一般 Koin 測試
- **[模組驗證](/docs/reference/koin-test/verify)** - 驗證模組配置