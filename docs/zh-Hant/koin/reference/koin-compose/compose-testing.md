---
title: 測試 Composable
---

# 測試 Composable

本頁面介紹使用 Koin 進行測試時 Compose 特有的內容：使用 `KoinApplicationPreview` 進行預覽、使用 `ComposeTestRule` 進行 UI 測試，以及多平台 UI 測試。本文假設您已知曉如何透過 `koinInject()` 與 `koinViewModel()` 在 Composable 中進行注入（請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)）。測試設定、覆寫與 `declareMock` 則在[單元測試](/docs/reference/koin-test/testing)中進行說明。

## 使用 KoinApplicationPreview 進行預覽 {id="previews-with-koinapplicationpreview"}

預覽不會執行您的 `Application` 類別，因此不會存在 Koin 容器。`KoinApplicationPreview` 會為預覽建立一個容器：

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

`KoinApplicationPreview` 使用 `koinApplication` 建立本機容器，而非由 `startKoin` 啟動的全域容器。每個預覽都會取得自己的執行個體，因此 Android Studio 可以平行轉譯多個預覽。

像 `single<UserRepository> { FakeUserRepository(sampleUsers) }` 這樣的 Lambda 定義在各種風格下均可運作。`application` Lambda 接受您在 `startKoin { }` 中撰寫的任何內容，因此您也可以載入正式環境模組，並僅覆寫預覽所需的內容。

若要預覽多種狀態，請為每個預覽提供包含不同 Fake 的模組：

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

同一個函式上的多個 `@Preview` 註解（淺色與深色模式、字型縮放）會共用相同的模組。

## 使用 ComposeTestRule 進行 UI 測試 {id="ui-tests-with-composetestrule"}

當 Composition 未提供 Koin 執行個體時，`koinInject()` 與 `koinViewModel()` 會從全域上下文（global context）進行解析。使用 `KoinTestRule` 啟動 Koin 並設定內容：

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

如果您測試的 Composable 包含 `KoinApplication(configuration = ...)`，它會連結至由該規則啟動的容器，並忽略其自身的配置。系統將會使用您的測試模組。

`KoinContext { }` 已棄用且不再需要：請勿用它包裝測試內容。

在 Android 上，這些測試會作為檢測測試 (instrumented tests)（或使用 Robolectric）執行。如果依賴圖需要 `Context`，請在規則中新增 `androidContext(...)`，如 [Android 檢測測試](/docs/reference/koin-android/instrumented-testing#restart-koin-with-a-test-rule)中所示。

### Fake 與 Mock {id="fakes-and-mocks"}

使用 Fake 將畫面驅動至各種狀態：

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

請在 `setContent` 之前變更 Fake：ViewModel 會在首次 Composition 時建立，並從該處載入其資料。

若要改用 Mock 程式庫，請在 `setContent` 之前呼叫 `declareMock<UserRepository> { ... }`（請參閱[使用 declareMock 進行 Mock](/docs/reference/koin-test/testing#mocking-with-declaremock)）。

### 使用獨立上下文的畫面 {id="screens-using-an-isolated-context"}

如果畫面是從 `KoinIsolatedContext` 取得其 Koin 執行個體（請參閱[獨立上下文](/docs/reference/koin-compose/isolated-context)），測試則不需要全域上下文。以相同方式建置測試容器並提供它：

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

由於不涉及全域狀態，因此這些測試可以平行執行。

## 多平台 UI 測試 {id="multiplatform-ui-tests"}

在 `commonTest` 中無法使用 JUnit 規則。請使用來自 Compose Multiplatform 測試程式庫的 `runComposeUiTest`，並透過 `kotlin.test` 註解來啟動與停止 Koin：

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

`KoinTest`、`startKoin` 與 `declareMock` 支援多平台。`KoinTestRule` 與 `MockProviderRule` 僅適用於 JVM。請依照 [Compose Multiplatform 測試指南](https://kotlinlang.org/docs/multiplatform/compose-test.html)中的說明設定測試相依性，並將 `io.insert-koin:koin-test` 新增至 `commonTest`。

## 常見陷阱 {id="pitfalls"}

- 規則順序：Koin 必須在設定內容之前啟動。使用 `createAndroidComposeRule<MainActivity>()` 時，Activity 是由該規則啟動的，因此請賦予 `KoinTestRule` 較小的 `order`。
- ViewModel 已建立：在較早的 Composition 中建立的 ViewModel 會保留其相依性。請在 `setContent` 之前變更 Fake 或 Mock。
- 預覽容器為區域性容器：讀取全域上下文的程式碼（`KoinPlatform.getKoin()`、Compose 外部的 `KoinComponent`）無法看見 `KoinApplicationPreview` 容器。

## 相關內容 {id="related"}

- [單元測試](/docs/reference/koin-test/testing)：`KoinTestRule`、覆寫與 `declareMock`。
- [Android 檢測測試](/docs/reference/koin-android/instrumented-testing)：測試 Application、搭配 Activity 的規則順序。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()` 與 `KoinApplication`。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 如何建立並保留 ViewModel。
- [獨立上下文](/docs/reference/koin-compose/isolated-context)：適用於 SDK 與程式庫的 `KoinIsolatedContext`。