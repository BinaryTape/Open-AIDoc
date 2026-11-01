---
title: 單元測試
---

# 單元測試

本指南說明如何使用 Koin 編寫 JVM 單元測試：在每個測試中啟動與停止容器、檢索執行個體、覆寫定義，以及使用 Mock 取代相依性。這是各項測試技術的參考指引；特定平台頁面（[Android 檢測測試](/docs/reference/koin-android/instrumented-testing)、[Compose](/docs/reference/koin-compose/compose-testing)、[Ktor](/docs/reference/koin-ktor/ktor-testing)）僅涵蓋該平台特有的內容。你應該先了解如何[啟動 Koin](/docs/reference/koin-core/starting-koin) 以及宣告[定義](/docs/reference/koin-core/definitions)。

## 相依性 {id="dependencies"}

將 `koin-test` 以及對應你 JUnit 版本的構件新增至測試相依性中：

```kotlin
dependencies {
    testImplementation("io.insert-koin:koin-test")
    // 擇一使用
    testImplementation("io.insert-koin:koin-test-junit4")
    testImplementation("io.insert-koin:koin-test-junit5")
}
```

版本資訊來自 Koin BOM，請參閱 [Gradle 設定](/docs/setup/gradle)。`koin-test` 不相依於任何 Mock 程式庫：你可以直接插入 Mockito、MockK 或任何其他程式庫（請參閱[使用 declareMock 進行 Mock](#mocking-with-declaremock)）。

## KoinTest {id="kointest"}

在你的測試類別中實作 `KoinTest`。這會讓該類別成為一個 [KoinComponent](/docs/reference/koin-core/koin-component)，因此 `get()` 和 `by inject()` 可以直接在測試中使用：

```kotlin
import org.koin.test.KoinTest
import org.koin.test.get
import org.koin.test.inject

class UserServiceTest : KoinTest {

    // 首次存取時解析
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

`KoinTest` 使用全域 Koin 上下文（由 `startKoin` 建立的上下文）。它不適用於由 `Application` 類別啟動 Koin 的 Android 檢測測試：請參閱 [Android 檢測測試](/docs/reference/koin-android/instrumented-testing)。

## 為每個測試啟動與停止 Koin {id="start-and-stop-koin-for-each-test"}

每個測試都應該啟動自己的容器，並在結束時停止它。若容器保持執行狀態，會導致下一次呼叫 `startKoin` 時拋出 `KoinApplicationAlreadyStartedException` 失敗，並在測試之間洩漏執行個體。

載入與你的應用程式相同的配置：

**編譯器外掛程式 DSL**
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

**註解**
使用型別化 API 啟動應用程式的 `@KoinApplication` 類別：

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

若只要載入部分模組，可在一般的 `startKoin { }` 內使用 `module<DataModule>()` 或 `modules(DataModule::class, CacheModule::class)`。

**建構函式 / 傳統 DSL**
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

若要在不編寫 `@After` 的情況下停止 Koin，可以繼承 `AutoCloseKoinTest` 或實作 `ClosingKoinTest`。兩者都會在每個測試結束後呼叫 `stopKoin()`。JUnit 5 版本位於 `org.koin.test.junit5` 中。

下方的 JUnit Rule 與 Extension 可以替你處理啟動與停止，是更簡短的選擇。

## JUnit 4：KoinTestRule {id="junit-4-kointestrule"}

`KoinTestRule`（來自 `koin-test-junit4`）會在每個測試之前啟動 Koin，並在測試後停止它：

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

該 Lambda 運算式是一般的 `KoinApplication` 宣告：你在 `startKoin { }` 中編寫的所有內容都可以在這裡使用。搭配註解時，請使用 `withConfiguration<MyApp>()` 載入你的應用程式：

```kotlin
import org.koin.plugin.module.dsl.withConfiguration

@get:Rule
val koinTestRule = KoinTestRule.create {
    withConfiguration<MyApp>()
}
```

如果在測試開始時已有 Koin 容器正在執行，該 Rule 會先關閉它。已啟動的執行個體可透過 `koinTestRule.koin` 取得。

## JUnit 5：KoinTestExtension {id="junit-5-kointestextension"}

`KoinTestExtension`（來自 `koin-test-junit5`）針對 JUnit 5 提供了相同的功能。請使用 `@JvmField` 和 `@RegisterExtension` 註冊它：

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

該 Extension 也可以將 `Koin` 執行個體作為測試函式參數傳入：

```kotlin
@Test
fun `resolves from the test container`(koin: Koin) {
    assertNotNull(koin.get<UserRepository>())
}
```

## 覆寫測試的定義 {id="override-definitions-for-a-test"}

若要替換生產環境的定義，請在生產模組之後載入測試模組。最後載入的模組優先權最高：

```kotlin
val testModule = module {
    single<ApiService> { FakeApiService() }
}

@get:Rule
val koinTestRule = KoinTestRule.create {
    modules(appModule, testModule)
}
```

像 `single<ApiService> { FakeApiService() }` 這樣的 Lambda 定義適用於所有風格，因此即使你的應用程式使用編譯器外掛程式 DSL 或註解，你也可以用這種方式編寫測試模組。

如果你的應用程式啟動 Koin 時設定了 `allowOverride(false)`，請為每個測試定義標註 `.override()`。覆寫規則請參閱[定義](/docs/reference/koin-core/definitions#overriding-a-definition)。

## 使用 declareMock 進行 Mock {id="mocking-with-declaremock"}

`declareMock<T>()` 會建立 `T` 的 Mock，將其註冊到執行中的容器以取代既有定義，並將其傳回。所有相依於 `T` 的定義隨後都會接收到該 Mock。

Koin 本身不會建立 Mock。請先註冊一個 Mock 提供者：

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

然後在測試中宣告 Mock，並可選擇性傳入 Stub 區塊：

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

`declareMock` 接受與一般定義相同的選項：

- `qualifier`：替換具備[限定詞](/docs/reference/koin-core/qualifiers)的定義，例如 `declareMock<Database>(named("local"))`。
- `secondaryTypes`：同時將 Mock 繫結至其他型別，例如 `declareMock<UserRepositoryImpl>(secondaryTypes = listOf(UserRepository::class))`。

Mock 會作為單一執行個體保存在根作用域中。若要在特定作用域內 Mock 定義，請在該作用域上呼叫 `declareMock`：`scope.declareMock<CartState>()`。

:::warning
請在使用該 Mock 的類別首次解析之前宣告 Mock。已建立的 `single` 會保留其先前接收到的相依性。
:::

## 使用 declare 宣告執行個體 {id="declare-an-instance-with-declare"}

當你需要真實或手寫的執行個體而非 Mock 時，`declare` 會將其註冊到執行中的容器內：

```kotlin
import org.koin.test.mock.declare

@Test
fun `uses a fixed clock`() {
    declare<Clock> { FixedClock(at = "2026-01-01T00:00:00Z") }

    assertEquals(2026, get<ReportService>().currentYear())
}
```

`declare` 會覆寫該型別的任何現有定義、接受 `qualifier`，並傳回所宣告的執行個體。它使用的是全域上下文，因此請在 Koin 啟動後再呼叫它。

## 測試作用域定義 {id="test-scoped-definitions"}

自行建立作用域、從中解析，然後關閉它：

```kotlin
@Test
fun `cart state lives in its scope`() {
    val scope = getKoin().createScope<CheckoutSession>("checkout-1")

    val state = scope.get<CartState>()
    assertSame(state, scope.get<CartState>())

    scope.close()
}
```

有關作用域 API，請參閱[作用域](/docs/reference/koin-core/scopes)。在 Android 上，繫結至 Activity 或 Fragment 的作用域會與組件本身一起測試：請參閱 [Android 檢測測試](/docs/reference/koin-android/instrumented-testing#scopes)。

## 檢查你的配置 {id="check-your-configuration"}

單元測試用於驗證行為。若要檢查每個定義的每個相依性是否都已宣告，請在建置時使用 [Koin 編譯器外掛程式](/docs/reference/koin-compiler/compile-safety)，或是使用 `verify()` 測試 API：請參閱[驗證你的配置](/docs/reference/koin-test/verify)。

## 限制 {id="limits"}

- 全域上下文：`startKoin`、`KoinTestRule` 和 `KoinTestExtension` 都使用單一全域上下文。啟動 Koin 的測試無法在同一個 JVM 中平行執行。對於平行測試，請使用[隔離上下文](/docs/reference/koin-core/context-isolation)。除非覆寫 `getKoin()`，否則 `KoinTest` 的 `get()` 和 `inject()` 會讀取全域上下文。
- Mock 提供者：如果未註冊 `MockProviderRule` 或 `MockProviderExtension`，`declareMock` 將會失敗。
- 覆寫會在整個測試期間保持生效：使用測試模組、`declareMock` 或 `declare` 替換的定義僅會在 Koin 停止時被重設。

## 相關內容 {id="related"}

- [驗證你的配置](/docs/reference/koin-test/verify)：`verify()` 及其與編譯期安全性的關聯。
- [Android 檢測測試](/docs/reference/koin-android/instrumented-testing)：由 `Application` 啟動 Koin 的測試。
- [測試 Composable](/docs/reference/koin-compose/compose-testing)：Compose UI 測試與預覽。
- [Ktor 測試](/docs/reference/koin-ktor/ktor-testing)：結合 Koin 的 `testApplication`。
- [上下文隔離](/docs/reference/koin-core/context-isolation)：適用於程式庫與平行測試的獨立 Koin 容器。
- [JUnit 測試快速入門](/docs/quickstart/junit-test)：完整的範例專案。