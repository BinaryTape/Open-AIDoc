---
title: Composable のテスト
---

# Koin を使用した Composable のテスト

このガイドでは、Android Studio のプレビューから包括的なユニットテストまで、Koin を使用した Compose アプリケーションのテスト戦略について説明します。

## KoinApplicationPreview

Koin の依存関係を持つ Android Studio プレビューには、`KoinApplicationPreview` を使用します。

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

### 複数のプレビュー

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

### 異なる状態でのプレビュー

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

## ComposeTestRule を使用したユニットテスト

### 基本的なセットアップ

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

### ユーザーインタラクションのテスト

```kotlin
@Test
fun clickingUserShowsDetails() {
    composeTestRule.setContent {
        UserScreen()
    }

    // ユーザーをクリックする
    composeTestRule.onNodeWithText("Alice").performClick()

    // ナビゲーションまたは状態の変化を検証する
    composeTestRule.onNodeWithText("alice@example.com").assertIsDisplayed()
}

@Test
fun searchFiltersUsers() {
    composeTestRule.setContent {
        UserScreen()
    }

    // 検索クエリを入力する
    composeTestRule.onNodeWithTag("searchField").performTextInput("Ali")

    // フィルタリングされた結果を検証する
    composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    composeTestRule.onNodeWithText("Bob").assertDoesNotExist()
}
```

### ViewModel の状態を使用したテスト

```kotlin
@Test
fun showsLoadingIndicator() {
    val loadingRepository = object : UserRepository {
        override suspend fun getUsers(): `List<User>` {
            delay(Long.MAX_VALUE) // 完了しない
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

## 依存関係のモック

### MockK の使用

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

        // リフレッシュをトリガーする
        composeTestRule.onNodeWithTag("refreshButton").performClick()

        coVerify(exactly = 2) { mockRepository.getUsers() }
    }
}
```

### Fake 実装の使用

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

## ナビゲーションのテスト

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

        // 詳細画面へ遷移する
        composeTestRule.onNodeWithText("View Details").performClick()

        // ナビゲーションを検証する
        assertEquals("detail/123", navController.currentDestination?.route)
    }

    @Test
    fun backNavigationWorks() {
        lateinit var navController: NavHostController

        composeTestRule.setContent {
            navController = rememberNavController()
            AppNavigation(navController)
        }

        // 次へ進む
        composeTestRule.onNodeWithText("View Details").performClick()

        // 戻る
        composeTestRule.onNodeWithContentDescription("Back").performClick()

        // ホームに戻ったことを検証する
        assertEquals("home", navController.currentDestination?.route)
    }
}
```

## コルーチンを使用したテスト

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

        // 非同期操作を待機する
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule
                .onAllNodesWithTag("userList")
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        // 結果を検証する
        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

## マルチプラットフォームのテスト

Compose Multiplatform の場合は、expect/actual のテストヘルパーを作成します。

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

        // アサーション...

        stopKoin()
    }
}
```

## ベストプラクティス

1. **KoinTestRule を使用する** - セットアップとクリーンアップ（teardown）を自動的に処理します。
   ```kotlin
   @get:Rule
   val koinTestRule = KoinTestRule.create { modules(testModule) }
   ```

2. **モック（Mock）よりもフェイク（Fake）を優先する** - より予測可能で、理解しやすくなります。

3. **一度に一つの振る舞いをテストする** - 焦点を絞ったテストはメンテナンスが容易です。

4. **セマンティックなテストタグを使用する** - UI の変更に対してテストを堅牢にします。
   ```kotlin
   Modifier.testTag("submitButton")
   ```

5. **非同期操作を待機する** - 非同期の状態には `waitUntil` を使用します。
   ```kotlin
   composeTestRule.waitUntil(5000) { condition }
   ```

6. **Koin をクリーンアップする** - ルールを使用しない場合は、`@After` で `stopKoin()` を呼び出します。

## 次のステップ

- **[Compose の概要](/docs/reference/koin-compose/compose)** - セットアップと基本的なインジェクション
- **[テストリファレンス](/docs/reference/koin-test/testing)** - 一般的な Koin のテスト
- **[モジュールの検証](/docs/reference/koin-test/verify)** - モジュール構成の検証