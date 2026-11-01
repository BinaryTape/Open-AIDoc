---
title: 测试 Composable
---

# 测试 Composable

本页面涵盖了使用 Koin 进行测试时与 Compose 相关的特定内容：使用 `KoinApplicationPreview` 的预览、使用 `ComposeTestRule` 的 UI 测试，以及多平台 UI 测试。本文假定你已了解如何通过 `koinInject()` 和 `koinViewModel()` 在 Composable 中进行注入（请参阅 [Koin for Compose](/docs/reference/koin-compose/compose)）。有关测试设置、重写以及 `declareMock` 的说明，请参阅[单元测试](/docs/reference/koin-test/testing)。

## 使用 KoinApplicationPreview 进行预览 {id="previews-with-koinapplicationpreview"}

预览不会运行你的 `Application` 类，因此不存在 Koin 容器。`KoinApplicationPreview` 会为预览创建一个容器：

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

`KoinApplicationPreview` 会使用 `koinApplication` 创建一个局部容器，而不是由 `startKoin` 启动的全局容器。每个预览都有自己的实例，因此 Android Studio 可以并行渲染多个预览。

类似于 `single<UserRepository> { FakeUserRepository(sampleUsers) }` 的 lambda 表达式定义适用于各种风格。`application` 的 lambda 表达式接受你在 `startKoin { }` 中编写的任何内容，因此你也可以加载生产模块并仅重写预览所需的部分。

如需预览多种状态，请为每个预览提供包含不同 Fake 实现的模块：

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

同一个函数上的多个 `@Preview` 注解（浅色和深色模式、字体缩放）将共享同一个模块。

## 使用 ComposeTestRule 进行 UI 测试 {id="ui-tests-with-composetestrule"}

当组合（composition）未提供 Koin 实例时，`koinInject()` 和 `koinViewModel()` 会从全局上下文中进行解析。使用 `KoinTestRule` 启动 Koin 并设置内容：

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

如果你测试的 Composable 包含 `KoinApplication(configuration = ...)`，它将附加到由规则启动的容器，并忽略自身的配置。系统将使用你的测试模块。

`KoinContext { }` 已弃用且不再需要：请勿使用它包裹测试内容。

在 Android 上，这些测试将作为插桩测试（或使用 Robolectric）运行。如果依赖图需要 `Context`，请在规则中添加 `androidContext(...)`，如 [Android 插桩测试](/docs/reference/koin-android/instrumented-testing#restart-koin-with-a-test-rule)中所示。

### Fake 与 Mock {id="fakes-and-mocks"}

使用 Fake 驱动屏幕进入各种状态：

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

在 `setContent` 之前修改 Fake：ViewModel 会在首次组合时创建并从此处加载数据。

如需改用 Mock 库，请在 `setContent` 之前调用 `declareMock<UserRepository> { ... }`（请参阅[使用 declareMock 进行 Mock](/docs/reference/koin-test/testing#mocking-with-declaremock)）。

### 使用隔离上下文的屏幕 {id="screens-using-an-isolated-context"}

如果屏幕从 `KoinIsolatedContext` 获取其 Koin 实例（请参阅[隔离上下文](/docs/reference/koin-compose/isolated-context)），则测试无需使用全局上下文。构建一个测试容器并以相同的方式提供它：

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

由于不涉及全局状态，这些测试可以并行运行。

## 多平台 UI 测试 {id="multiplatform-ui-tests"}

在 `commonTest` 中，JUnit 规则不可用。请使用 Compose Multiplatform 测试库中的 `runComposeUiTest`，并通过 `kotlin.test` 注解来启动和停止 Koin：

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

`KoinTest`、`startKoin` 和 `declareMock` 是多平台的。`KoinTestRule` 和 `MockProviderRule` 仅限 JVM。请按照 [Compose Multiplatform 测试指南](https://kotlinlang.org/docs/multiplatform/compose-test.html)中的说明设置测试依赖项，并将 `io.insert-koin:koin-test` 添加到 `commonTest` 中。

## 常见陷阱 {id="pitfalls"}

- 规则顺序：Koin 必须在设置内容之前启动。使用 `createAndroidComposeRule<MainActivity>()` 时，Activity 是由该规则启动的，因此请为 `KoinTestRule` 指定较小的 `order` 值。
- ViewModel 已创建：在较早的组合中创建的 ViewModel 会保留其依赖项。请在 `setContent` 之前修改 Fake 或 Mock。
- 预览容器是局部的：读取全局上下文的代码（`KoinPlatform.getKoin()`，或 Compose 外部的 `KoinComponent`）无法识别 `KoinApplicationPreview` 容器。

## 相关内容 {id="related"}

- [单元测试](/docs/reference/koin-test/testing)：`KoinTestRule`、重写以及 `declareMock`。
- [Android 插桩测试](/docs/reference/koin-android/instrumented-testing)：测试 Application、与 Activity 相关的规则顺序。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()` 与 `KoinApplication`。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 如何创建和保留 ViewModel。
- [隔离上下文](/docs/reference/koin-compose/isolated-context)：面向 SDK 和库的 `KoinIsolatedContext`。