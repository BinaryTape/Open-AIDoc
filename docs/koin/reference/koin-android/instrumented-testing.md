---
title: Android 插桩测试
---

# Android 插桩测试

插桩测试运行在设备或模拟器上，且运行在真实的 `Application` 内部。当测试开始时，Koin 已经由 `Application.onCreate()` 启动，因此关键问题在于如何使用测试定义替换生产定义。本指南介绍了为此所需的配置方案，随后涵盖 Activity、Fragment 和作用域测试。通用技术（`KoinTest`、`KoinTestRule`、`declareMock`）已在[单元测试](/docs/reference/koin-test/testing)中进行了解释。

## 依赖项 {id="dependencies"}

```kotlin
dependencies {
    androidTestImplementation("io.insert-koin:koin-test-junit4")
}
```

`koin-test-junit4` 会引入 `koin-test`。版本来自 Koin BOM，请参阅 [Gradle 设置](/docs/setup/gradle)。

## 选择配置方案 {id="choose-a-setup"}

| 配置方案 | Koin 启动方式 | 适用场景 |
|-------|--------------------|-------------|
| [测试 Application](#use-a-test-application) | 测试 `Application` 类 | 所有测试共享相同的测试配置 |
| [测试规则](#restart-koin-with-a-test-rule) | `KoinTestRule`，在每次测试之前 | 每个测试类都需要自己的模块 |
| [加载覆盖](#load-overrides-into-the-running-container) | 生产环境的 `Application` | 仅替换少数定义 |

## 使用测试 Application {id="use-a-test-application"}

在 `androidTest` 中创建一个 `Application`，使用生产模块加上测试模块来启动 Koin。测试模块最后加载，因此其定义会替换生产定义：

**编译器插件 DSL**
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

**注解**
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

`startKoin<MyApp>` 会先加载 `@KoinApplication` 类的模块，然后再加载 lambda 中声明的模块。

**构造函数 / 经典 DSL**
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

像 `single<ApiService> { FakeApiService() }` 这样的 lambda 定义适用于所有风格。

要使用此 `Application` 运行测试，请创建一个自定义 [AndroidJUnitRunner](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner)：

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

在 `build.gradle.kts` 中进行注册：

```kotlin
android {
    defaultConfig {
        testInstrumentationRunner = "com.example.app.InstrumentationTestRunner"
    }
}
```

## 使用测试规则重启 Koin {id="restart-koin-with-a-test-rule"}

`KoinTestRule` 会关闭正在运行的 Koin 容器，在每次测试前启动一个新容器，并在测试后将其停止。需要自行传递 Android context，因为该容器不是由 `Application` 启动的：

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

使用注解时，请使用 `withConfiguration<MyApp>()` 代替 `modules(appModule)`，如[单元测试](/docs/reference/koin-test/testing#junit-4-kointestrule)中所述。

生产环境的 `Application` 在进程启动时仍会执行一次 `startKoin`。测试规则会替换该容器，因此 `Application` 在 `onCreate()` 中解析的任何内容都会持有来自已关闭容器的实例。如果你的 `Application` 在启动时解析依赖项，请优先选择不解析依赖项的[测试 Application](#use-a-test-application)。

## 将覆盖定义加载到正在运行的容器中 {id="load-overrides-into-the-running-container"}

若要保留生产环境的 `Application` 且仅更改少数定义，可以在待测屏幕启动前将测试模块加载到正在运行的容器中：

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

这是最轻量的配置方案，但陷阱也最多：

- 无重置：覆盖定义将在进程中后续的所有测试中持续生效。
- 卸载是移除而不是恢复：`unloadKoinModules(profileTestModule)` 会删除 `UserRepository` 定义，生产定义不会恢复。
- 已创建的实例会被保留：已经接收了生产版 `UserRepository` 的 `single` 会继续保留它。

如果每次测试都需要干净的依赖图，请改用[测试规则](#restart-koin-with-a-test-rule)。

## Mock 与 Fake {id="mocks-and-fakes"}

`declareMock` 在插桩测试中的用法与在单元测试中相同：实现 `KoinTest` 并注册 `MockProviderRule`（参阅[使用 declareMock 进行 Mock](/docs/reference/koin-test/testing#mocking-with-declaremock)）。若使用 MockK，请在设备上使用 `io.mockk:mockk-android` 工件。

在设备上使用 Fake 通常更简单：它们不需要 Mock 库，且行为与真实类相同。可以在测试模块中声明它们。对于 Room，请使用内存数据库，以便每次测试都从空数据库开始：

```kotlin
val testDatabaseModule = module {
    single {
        Room.inMemoryDatabaseBuilder(androidContext(), AppDatabase::class.java).build()
    }
    single { get<AppDatabase>().userDao() }
}
```

## Activity 与 Fragment 测试 {id="activity-and-fragment-tests"}

Activity 和 Fragment 通过 `by inject()` 和 `by viewModel()` 解析其依赖项（参阅[入口点](/docs/reference/koin-android/entry-points)）。在测试中，它们会接收测试容器中所持有的任何内容，因此请在配置好 Koin 之后再启动它们：

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

对于 Fragment，使用来自 `androidx.fragment:fragment-testing` 的 `launchFragmentInContainer<ProfileFragment>()` 也是同样的效果。`LoginActivity` 通过 `by viewModel()` 获取的 `LoginViewModel` 是由 Koin 使用 `FakeAuthService` 创建的。

要从正在运行的组件中读取 ViewModel 或依赖项，请使用 `scenario.onActivity { activity -> ... }` 并在其中进行访问。在代码块之外，Activity 可能尚不存在。

## 作用域 {id="scopes"}

[Android 作用域](/docs/reference/koin-android/scope)仅在其 Activity 或 Fragment 存活期间存在。可以通过该组件对其进行测试：

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

当组件实现 `AndroidScopeComponent`（例如 `ScopeActivity` 和 `ScopeFragment`）时，`activity.scope` 和 `fragment.scope` 可用。在 Activity 创建之前或销毁之后调用 `scope.get()` 会失败：作用域尚不存在或已关闭。

对于未绑定到 Android 组件的作用域，JVM 单元测试即可满足要求：参阅[单元测试](/docs/reference/koin-test/testing#test-scoped-definitions)。

## 多模块应用 {id="multi-module-apps"}

在[多模块应用](/docs/reference/koin-android/multi-module)中，将待测功能模块与其所需的核心模块一同加载，最后加载测试覆盖模块：

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

共享的 `androidTest` 源集或 `:core:testing` Gradle 模块是存放多个功能共用的 Fake 和测试模块的好地方。

如果仅加载应用的一部分，某个定义可能会缺失完整应用所提供的依赖项。[编译器插件](/docs/reference/koin-compiler/compile-safety)会在构建时检查生产依赖图，而不是你的测试模块。要检查测试配置，请在 JVM 测试中使用 [verify()](/docs/reference/koin-test/verify)。

## Espresso 与规则顺序 {id="espresso-and-rule-order"}

`ActivityScenarioRule` 会在测试方法运行前启动 Activity。如果它在 `KoinTestRule` 之前运行，Activity 将从错误的容器中解析其依赖项。请显式设置顺序：

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

`@get:Rule(order = ...)` 需要 JUnit 4.13 或更高版本。对于更低版本，请使用 `RuleChain.outerRule(koinTestRule).around(activityRule)`。

## Compose UI 测试 {id="compose-ui-tests"}

关于 Compose 屏幕，请参阅[测试 Composable](/docs/reference/koin-compose/compose-testing)。

## 测试之间的隔离 {id="isolation-between-tests"}

单独运行时能通过、一起运行时却失败的测试，通常是通过 Koin 共享了状态：

- 每次测试时重启：`KoinTestRule` 为每次测试提供一个新容器，其中包含新的 `single` 实例。
- 重置 Fake：使用[测试 Application](#use-a-test-application) 时，容器在整个运行期间一直存在。声明为 `single` 的 Fake 会在测试之间保留其数据，因此请为其提供 `reset()` 方法并在 `@Before` 中调用它。
- 不要堆叠覆盖模块：使用 `loadKoinModules` 加载的模块将保持加载状态（参阅[将覆盖定义加载到正在运行的容器中](#load-overrides-into-the-running-container)）。

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

仅当测试模块也将 Fake 绑定到其自身类型时，`by inject<FakeUserRepository>()` 才能正常工作：`single { FakeUserRepository() } bind UserRepository::class`。

## 故障排除 {id="troubleshooting"}

### KoinApplicationAlreadyStartedException {id="koinapplicationalreadystartedexception"}

在容器已在运行时执行了第二次 `startKoin` 调用。在插桩测试中，你的 `Application` 已经启动了 Koin。请使用 `KoinTestRule`（它会先关闭正在运行的容器），或使用[测试 Application](#use-a-test-application)。不要在 `@Before` 中调用 `startKoin`。

### 未使用测试定义 {id="the-test-definition-is-not-used"}

- 加载顺序：测试模块必须在声明相同类型的生产模块之后加载。
- 禁用覆盖：如果 Koin 在启动时设置了 `allowOverride(false)`，请使用 `.override()` 标记测试定义（参阅[定义](/docs/reference/koin-core/definitions#overriding-a-definition)）。
- 实例已创建：在覆盖之前创建的 `single` 会保留旧的依赖项。请使用测试规则重启 Koin。
- 规则顺序：Activity 在 Koin 配置完成之前就已启动（参阅 [Espresso 与规则顺序](#espresso-and-rule-order)）。

### 作用域定义出现 NoDefinitionFoundException {id="nodefinitionfoundexception-for-a-scoped-definition"}

在解析作用域定义时，作用域尚未开启。请在 Activity 处于存活状态时在 `scenario.onActivity { }` 中解析作用域定义，并检查该定义是否声明在正确的作用域（`activityScope`、`fragmentScope`）中。

## 相关内容 {id="related"}

- [单元测试](/docs/reference/koin-test/testing)：`KoinTest`、`KoinTestRule`、`declareMock` 与覆盖。
- [测试 Composable](/docs/reference/koin-compose/compose-testing)：Compose UI 测试和预览。
- [验证配置](/docs/reference/koin-test/verify)：`verify()` 与 `androidVerify()`。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment 与 ViewModel 作用域。
- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：在 `Application` 中使用 `startKoin`。