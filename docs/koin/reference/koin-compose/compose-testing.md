---
title: 测试 Composable
---

# 使用 Koin 测试 Composable

本指南涵盖了使用 Koin 测试 Compose 应用程序的策略，从 Android Studio 预览到全面的单元测试。

## KoinApplicationPreview

在带有 Koin 依赖项的 Android Studio 预览中使用 `KoinApplicationPreview`：

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

### 多个预览

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

### 不同状态的预览

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

## 使用 ComposeTestRule 进行单元测试

### 基本设置

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

### 测试用户交互

```kotlin
@Test
fun clickingUserShowsDetails() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 点击用户
    composeTestRule.onNodeWithText("Alice").performClick()

    // 验证导航或状态更改
    composeTestRule.onNodeWithText("alice@example.com").assertIsDisplayed()
}

@Test
fun searchFiltersUsers() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 输入搜索查询
    composeTestRule.onNodeWithTag("searchField").performTextInput("Ali")

    // 验证筛选后的结果
    composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    composeTestRule.onNodeWithText("Bob").assertDoesNotExist()
}
```

### 使用 ViewModel 状态进行测试

```kotlin
@Test
fun showsLoadingIndicator() {
    val loadingRepository = object : UserRepository {
        override suspend fun getUsers(): `List<User>` {
            delay(Long.MAX_VALUE) // 永不完成
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

## 模拟 (Mocking) 依赖项

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

        // 触发刷新
        composeTestRule.onNodeWithTag("refreshButton").performClick()

        coVerify(exactly = 2) { mockRepository.getUsers() }
    }
}
```

### 使用 Fake 实现

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

## 测试导航

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

        // 导航到详情
        composeTestRule.onNodeWithText("View Details").performClick()

        // 验证导航
        assertEquals("detail/123", navController.currentDestination?.route)
    }

    @Test
    fun backNavigationWorks() {
        lateinit var navController: NavHostController

        composeTestRule.setContent {
            navController = rememberNavController()
            AppNavigation(navController)
        }

        // 向前导航
        composeTestRule.onNodeWithText("View Details").performClick()

        // 返回导航
        composeTestRule.onNodeWithContentDescription("Back").performClick()

        // 验证回到主页
        assertEquals("home", navController.currentDestination?.route)
    }
}
```

## 使用协程进行测试

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

        // 等待异步操作
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule
                .onAllNodesWithTag("userList")
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        // 验证结果
        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

## 多平台测试

对于 Compose Multiplatform，创建 expect/actual 测试帮助程序：

```kotlin
// commonTest
expect fun createTestComposeRule(): ComposeTestRule

// androidTest
actual fun createTestComposeRule(): ComposeTestRule = createComposeRule()

// 通用测试
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

        // 断言...

        stopKoin()
    }
}
```

## 最佳做法

1. **使用 KoinTestRule** - 自动处理设置/拆卸
   ```kotlin
   @get:Rule
   val koinTestRule = KoinTestRule.create { modules(testModule) }
   ```

2. **优先使用 Fake 而非 Mock** - 更可预测，更易于理解

3. **一次只测试一个行为** - 专注的测试更容易维护

4. **使用语义化测试标签** - 使测试对 UI 更改具有弹性
   ```kotlin
   Modifier.testTag("submitButton")
   ```

5. **等待异步操作** - 对异步状态使用 `waitUntil`
   ```kotlin
   composeTestRule.waitUntil(5000) { condition }
   ```

6. **清理 Koin** - 如果不使用规则 (rule)，请在 `@After` 中调用 `stopKoin()`

## 下一步

- **[Compose 概览](/docs/reference/koin-compose/compose)** - 设置与基础注入
- **[测试参考](/docs/reference/koin-test/testing)** - 常规 Koin 测试
- **[模块验证](/docs/reference/koin-test/verify)** - 验证模块配置