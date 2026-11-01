---
title: Android 儀器化測試
---

# Android 儀器化測試

儀器化測試（Instrumented tests）在裝置或模擬器上的真實 `Application` 中執行。測試開始時，Koin 已經由 `Application.onCreate()` 啟動，因此關鍵在於如何將正式環境的定義替換為測試定義。本指南涵蓋相關設定方式，接著介紹 Activity、Fragment 以及作用域（scope）測試。通用技術（`KoinTest`、`KoinTestRule`、`declareMock`）已在 [單元測試](/docs/reference/koin-test/testing) 中說明。

## 相依性 {id="dependencies"}

```kotlin
dependencies {
    androidTestImplementation("io.insert-koin:koin-test-junit4")
}
```

`koin-test-junit4` 會引入 `koin-test`。版本來自 Koin BOM，請參閱 [Gradle 設定](/docs/setup/gradle)。

## 選擇設定方式 {id="choose-a-setup"}

| 設定方式 | Koin 啟動方式 | 適用時機 |
|-------|--------------------|-------------|
| [測試 Application](#use-a-test-application) | 測試用 `Application` 類別 | 所有測試共用相同的測試配置 |
| [測試規則](#restart-koin-with-a-test-rule) | 每次測試前的 `KoinTestRule` | 每個測試類別需要各自的模組 |
| [載入覆寫項目](#load-overrides-into-the-running-container) | 您的正式環境 `Application` | 僅需替換少數定義 |

## 使用測試 Application {id="use-a-test-application"}

在 `androidTest` 中建立一個 `Application`，用您的正式環境模組加上一個測試模組來啟動 Koin。測試模組會在最後載入，因此其定義會替換正式環境的定義：

**編譯器外掛程式 DSL**
```kotlin
// in src/androidTest
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

**註解**
```kotlin
// in src/androidTest
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

`startKoin<MyApp>` 會先載入 `@KoinApplication` 類別的模組，接著載入 Lambda 中宣告的模組。

**建構函式 / 傳統 DSL**
```kotlin
// in src/androidTest
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

像 `single<ApiService> { FakeApiService() }` 這樣的 Lambda 定義適用於所有風格。

若要使用此 `Application` 執行測試，請建立自訂的 [AndroidJUnitRunner](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner)：

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

在 `build.gradle.kts` 中註冊它：

```kotlin
android {
    defaultConfig {
        testInstrumentationRunner = "com.example.app.InstrumentationTestRunner"
    }
}
```

## 使用測試規則重新啟動 Koin {id="restart-koin-with-a-test-rule"}

`KoinTestRule` 會關閉執行中的 Koin 容器，在每次測試前啟動一個新容器，並在測試後將其停止。請自行傳入 Android 上下文，因為此容器並非由您的 `Application` 所啟動：

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

使用註解時，請使用 `withConfiguration<MyApp>()` 取代 `modules(appModule)`，如 [單元測試](/docs/reference/koin-test/testing#junit-4-kointestrule) 所述。

當處理程序啟動時，正式環境的 `Application` 仍會執行一次 `startKoin`。該規則會替換該容器，因此 `Application` 在 `onCreate()` 中解析的任何物件，都會持有已關閉容器的執行個體。如果您的 `Application` 在啟動時會解析相依性，建議改用不會這樣做的 [測試 Application](#use-a-test-application)。

## 將覆寫項目載入至執行中的容器 {id="load-overrides-into-the-running-container"}

若想保留正式環境的 `Application` 且僅變更少數定義，可在受測畫面啟動前將測試模組載入至執行中的容器：

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

這是最輕量的設定方式，但也是陷阱最多的一種：

- 無法重設：覆寫將在該處理程序後續的所有測試中持續有效。
- 卸載僅代表移除，不會還原：`unloadKoinModules(profileTestModule)` 會刪除 `UserRepository` 定義。正式環境的定義不會恢復。
- 已建立的執行個體會被保留：已接收過正式環境 `UserRepository` 的 `single` 將繼續保留它。

如果您需要每次測試都有乾淨的依賴圖，請改用 [測試規則](#restart-koin-with-a-test-rule)。

## Mock 與 Fake {id="mocks-and-fakes"}

`declareMock` 在儀器化測試中的運作方式與單元測試相同：實作 `KoinTest` 並註冊 `MockProviderRule`（請參閱 [使用 declareMock 進行模擬](/docs/reference/koin-test/testing#mocking-with-declaremock)）。使用 MockK 時，請在裝置上使用 `io.mockk:mockk-android` 構件。

Fake 物件在裝置上通常更簡單：它們不需要模擬程式庫，且行為與真實類別相同。請在測試模組中宣告它們。對於 Room，請使用記憶體內資料庫，以確保每次測試開始時都是空的：

```kotlin
val testDatabaseModule = module {
    single {
        Room.inMemoryDatabaseBuilder(androidContext(), AppDatabase::class.java).build()
    }
    single { get<AppDatabase>().userDao() }
}
```

## Activity 與 Fragment 測試 {id="activity-and-fragment-tests"}

Activity 與 Fragment 透過 `by inject()` 和 `by viewModel()` 解析其相依性（請參閱 [進入點](/docs/reference/koin-android/entry-points)）。在測試中，它們會接收測試容器中持有的任何內容，因此請在 Koin 配置完成後再啟動它們：

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

對於 Fragment，使用來自 `androidx.fragment:fragment-testing` 的 `launchFragmentInContainer<ProfileFragment>()` 也具備相同效果。`LoginActivity` 透過 `by viewModel()` 取得的 `LoginViewModel` 是由 Koin 搭配 `FakeAuthService` 建立的。

若要從執行中的元件讀取 ViewModel 或相依性，請使用 `scenario.onActivity { activity -> ... }` 並在該處存取。在該區塊之外，Activity 可能尚未存在。

## 作用域 {id="scopes"}

[Android 作用域](/docs/reference/koin-android/scope) 僅在其 Activity 或 Fragment 處於活躍狀態時存在。請透過該元件對其進行測試：

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

當元件實作 `AndroidScopeComponent`（例如 `ScopeActivity` 和 `ScopeFragment`）時，`activity.scope` 與 `fragment.scope` 即可使用。在 Activity 建立之前或銷毀之後呼叫 `scope.get()` 將會失敗：因為作用域尚未存在或已經關閉。

對於未繫結至 Android 元件的作用域，執行 JVM 單元測試就已足夠：請參閱 [單元測試](/docs/reference/koin-test/testing#test-scoped-definitions)。

## 多模組應用程式 {id="multi-module-apps"}

在 [多模組應用程式](/docs/reference/koin-android/multi-module) 中，請將受測的功能模組與其所需的核心模組一起載入，最後再載入您的測試覆寫模組：

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

共用的 `androidTest` 原始碼集或 `:core:testing` Gradle 模組，是存放多個功能共用的 Fake 與測試模組的理想位置。

若您僅載入應用程式的一部分，某個定義可能會缺少完整應用程式所能提供的相依性。[編譯器外掛程式](/docs/reference/koin-compiler/compile-safety) 會在組建期檢查正式環境圖，但不會檢查您的測試模組。若要檢查測試配置，請在 JVM 測試中使用 [verify()](/docs/reference/koin-test/verify)。

## Espresso 與規則順序 {id="espresso-and-rule-order"}

`ActivityScenarioRule` 會在測試方法執行前啟動 Activity。如果它在 `KoinTestRule` 之前執行，Activity 將會從錯誤的容器解析其相依性。請明確設定順序：

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

`@get:Rule(order = ...)` 需要 JUnit 4.13 或更新版本。在較舊版本中，請使用 `RuleChain.outerRule(koinTestRule).around(activityRule)`。

## Compose UI 測試 {id="compose-ui-tests"}

針對 Compose 畫面，請參閱 [測試可組合項](/docs/reference/koin-compose/compose-testing)。

## 測試之間的隔離 {id="isolation-between-tests"}

單獨執行可通過但合併執行卻失敗的測試，通常是透過 Koin 共用了狀態：

- 每次測試時重新啟動：`KoinTestRule` 會為每次測試提供一個新容器，具有新的 `single` 執行個體。
- 重設 Fake：使用 [測試 Application](#use-a-test-application) 時，容器會在整個執行期間保持運作。宣告為 `single` 的 Fake 會在測試之間保留其資料，因此請為其提供一個 `reset()` 方法並在 `@Before` 中呼叫。
- 不要堆疊覆寫項目：使用 `loadKoinModules` 載入的模組會保持載入狀態（請參閱 [將覆寫項目載入至執行中的容器](#load-overrides-into-the-running-container)）。

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

`by inject<FakeUserRepository>()` 僅在測試模組同時將該 Fake 繫結至其自身型別時才有效：`single { FakeUserRepository() } bind UserRepository::class`。

## 疑難排解 {id="troubleshooting"}

### KoinApplicationAlreadyStartedException {id="koinapplicationalreadystartedexception"}

在容器執行中時執行了第二次 `startKoin` 呼叫。在儀器化測試中，您的 `Application` 已經啟動了 Koin。請使用會先關閉執行中容器的 `KoinTestRule`，或是使用 [測試 Application](#use-a-test-application)。請勿在 `@Before` 中呼叫 `startKoin`。

### 未使用測試定義 {id="the-test-definition-is-not-used"}

- 載入順序：測試模組必須在宣告相同型別的正式環境模組之後載入。
- 已停用覆寫：如果 Koin 在啟動時設定了 `allowOverride(false)`，請使用 `.override()` 標記測試定義（請參閱 [定義](/docs/reference/koin-core/definitions#overriding-a-definition)）。
- 執行個體已建立：在覆寫前建立的 `single` 會保留舊的相依性。請使用測試規則重新啟動 Koin。
- 規則順序：Activity 在 Koin 配置完成前即已啟動（請參閱 [Espresso 與規則順序](#espresso-and-rule-order)）。

### 作用域定義出現 NoDefinitionFoundException {id="nodefinitionfoundexception-for-a-scoped-definition"}

當您解析作用域時，該作用域尚未開啟。請在 Activity 處於活躍狀態時於 `scenario.onActivity { }` 內部解析作用域定義，並檢查該定義是否宣告於正確的作用域中（`activityScope`、`fragmentScope`）。

## 相關內容 {id="related"}

- [單元測試](/docs/reference/koin-test/testing)：`KoinTest`、`KoinTestRule`、`declareMock` 與覆寫。
- [測試可組合項](/docs/reference/koin-compose/compose-testing)：Compose UI 測試與預覽。
- [驗證您的配置](/docs/reference/koin-test/verify)：`verify()` 與 `androidVerify()`。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment 與 ViewModel 作用域。
- [在 Android 上啟動 Koin](/docs/reference/koin-android/start)：在您的 `Application` 中使用 `startKoin`。