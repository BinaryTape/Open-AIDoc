---
title: 单元测试
---

# 单元测试

本指南介绍了如何使用 Koin 编写 JVM 单元测试：为每个测试启动和停止容器、检索实例、重写定义以及使用 mock 替换依赖项。它是所有测试技术的参考文档；各平台页面（[Android 插桩测试](/docs/reference/koin-android/instrumented-testing)、[Compose](/docs/reference/koin-compose/compose-testing)、[Ktor](/docs/reference/koin-ktor/ktor-testing)）仅涵盖其特有的内容。你应该先了解如何[启动 Koin](/docs/reference/koin-core/starting-koin) 以及声明[定义](/docs/reference/koin-core/definitions)。

## 依赖项 {id="dependencies"}

将 `koin-test` 以及对应 JUnit 版本的构件添加到测试依赖项中：

```kotlin
dependencies {
    testImplementation("io.insert-koin:koin-test")
    // 任选其一
    testImplementation("io.insert-koin:koin-test-junit4")
    testImplementation("io.insert-koin:koin-test-junit5")
}
```

版本来源于 Koin BOM，请参阅 [Gradle 配置](/docs/setup/gradle)。`koin-test` 本身不依赖任何 mocking 库：你可以接入 Mockito、MockK 或其他任何库（请参阅[使用 declareMock 进行 Mock](#mocking-with-declaremock)）。

## KoinTest {id="kointest"}

在你的测试类中实现 `KoinTest`。这会使该类成为一个 [KoinComponent](/docs/reference/koin-core/koin-component)，从而可以直接在测试中使用 `get()` 和 `by inject()`：

```kotlin
import org.koin.test.KoinTest
import org.koin.test.get
import org.koin.test.inject

class UserServiceTest : KoinTest {

    // 首次访问时解析
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

`KoinTest` 适用于全局 Koin 上下文（即由 `startKoin` 创建的上下文）。它不适用于 Android 插桩测试，因为在插桩测试中是由 `Application` 类启动 Koin：请参阅 [Android 插桩测试](/docs/reference/koin-android/instrumented-testing)。

## 为每个测试启动和停止 Koin {id="start-and-stop-koin-for-each-test"}

每个测试都应该启动自己的容器，并在结束时将其停止。处于运行状态未被停止的容器会导致下一次调用 `startKoin` 时抛出 `KoinApplicationAlreadyStartedException` 异常失败，并在测试之间泄漏实例。

加载与应用相同的配置：

**编译器插件 DSL**
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

**注解**
使用类型化 API 启动应用的 `@KoinApplication` 类：

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

如果只需加载部分模块，请在普通的 `startKoin { }` 中使用 `module<DataModule>()` 或 `modules(DataModule::class, CacheModule::class)`。

**构造函数 / 传统 DSL**
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

如果不想编写 `@After` 来停止 Koin，可以继承 `AutoCloseKoinTest` 或实现 `ClosingKoinTest`。两者都会在每次测试后调用 `stopKoin()`。JUnit 5 版本位于 `org.koin.test.junit5` 中。

下文介绍的 JUnit 规则（Rule）和扩展程序（Extension）可以代为你完成启动和停止操作，是更简洁的选择。

## JUnit 4：KoinTestRule {id="junit-4-kointestrule"}

`KoinTestRule`（来自 `koin-test-junit4`）会在每次测试前启动 Koin，并在测试后停止它：

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

该 lambda 是一个标准的 `KoinApplication` 声明：在 `startKoin { }` 中编写的所有内容均可在此处使用。在使用注解时，可通过 `withConfiguration<MyApp>()` 加载应用：

```kotlin
import org.koin.plugin.module.dsl.withConfiguration

@get:Rule
val koinTestRule = KoinTestRule.create {
    withConfiguration<MyApp>()
}
```

如果测试开始时已有 Koin 容器在运行，该规则会先将其关闭。已启动的实例可以通过 `koinTestRule.koin` 访问。

## JUnit 5：KoinTestExtension {id="junit-5-kointestextension"}

`KoinTestExtension`（来自 `koin-test-junit5`）为 JUnit 5 提供了相同的功能。使用 `@JvmField` 和 `@RegisterExtension` 对其进行注册：

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

该扩展程序还可以将 `Koin` 实例作为测试函数形参传入：

```kotlin
@Test
fun `resolves from the test container`(koin: Koin) {
    assertNotNull(koin.get<UserRepository>())
}
```

## 为测试重写定义 {id="override-definitions-for-a-test"}

要替换生产环境中的定义，请在生产模块之后加载测试模块。最后加载的模块生效：

```kotlin
val testModule = module {
    single<ApiService> { FakeApiService() }
}

@get:Rule
val koinTestRule = KoinTestRule.create {
    modules(appModule, testModule)
}
```

像 `single<ApiService> { FakeApiService() }` 这样的 lambda 定义适用于所有风格，因此即使你的应用使用了编译器插件 DSL 或注解，也可以采用这种方式编写测试模块。

如果你的应用通过 `allowOverride(false)` 启动 Koin，请使用 `.override()` 标记每个测试定义。重写规则详见[定义](/docs/reference/koin-core/definitions#overriding-a-definition)。

## 使用 declareMock 进行 Mock {id="mocking-with-declaremock"}

`declareMock<T>()` 会创建 `T` 的 mock，将其注册到正在运行的容器中以替换现有定义，并返回该 mock 对象。此后，所有依赖 `T` 的定义都会接收到该 mock。

Koin 本身不创建 mock。需要先注册一个 mock 提供程序：

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

然后在测试中声明 mock，并可附加可选的打桩代码块：

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

`declareMock` 支持与普通定义相同的选项：

- `qualifier`：替换[带限定符的](/docs/reference/koin-core/qualifiers)定义，例如 `declareMock<Database>(named("local"))`。
- `secondaryTypes`：同时将 mock 绑定到其他类型，例如 `declareMock<UserRepositoryImpl>(secondaryTypes = listOf(UserRepository::class))`。

该 mock 作为单例实例保存在根作用域中。要对作用域内的定义进行 mock，请在该作用域上调用 `declareMock`：`scope.declareMock<CartState>()`。

:::warning
请在首次解析使用该 mock 的类之前声明它。已创建的 `single` 会保留其先前接收到的依赖项。
:::

## 使用 declare 声明实例 {id="declare-an-instance-with-declare"}

当你需要真实实例或手动创建的实例而非 mock 时，`declare` 可以将其注册到正在运行的容器中：

```kotlin
import org.koin.test.mock.declare

@Test
fun `uses a fixed clock`() {
    declare<Clock> { FixedClock(at = "2026-01-01T00:00:00Z") }

    assertEquals(2026, get<ReportService>().currentYear())
}
```

`declare` 会重写该类型的任何现有定义，接受 `qualifier`，并返回已声明的实例。它使用的是全局上下文，因此必须在 Koin 启动之后调用。

## 测试具有作用域的定义 {id="test-scoped-definitions"}

自行创建作用域，从中解析实例，然后将其关闭：

```kotlin
@Test
fun `cart state lives in its scope`() {
    val scope = getKoin().createScope<CheckoutSession>("checkout-1")

    val state = scope.get<CartState>()
    assertSame(state, scope.get<CartState>())

    scope.close()
}
```

有关作用域 API 的信息，请参阅[作用域](/docs/reference/koin-core/scopes)。在 Android 上，绑定到 Activity 或 Fragment 的作用域会随组件本身一起测试：请参阅 [Android 插桩测试](/docs/reference/koin-android/instrumented-testing#scopes)。

## 检查你的配置 {id="check-your-configuration"}

单元测试主要检验行为。若要检查每个定义的各项依赖是否均已声明，可以在构建时使用 [Koin 编译器插件](/docs/reference/koin-compiler/compile-safety)，或者使用 `verify()` 测试 API：请参阅[验证你的配置](/docs/reference/koin-test/verify)。

## 限制 {id="limits"}

- 全局上下文：`startKoin`、`KoinTestRule` 和 `KoinTestExtension` 都使用单一的全局上下文。启动 Koin 的测试无法在同一 JVM 中并行运行。对于并行测试，请使用[独立上下文](/docs/reference/koin-core/context-isolation)。除非重写 `getKoin()`，否则 `KoinTest` 的 `get()` 和 `inject()` 读取的均是全局上下文。
- Mock 提供程序：如果没有注册 `MockProviderRule` 或 `MockProviderExtension`，`declareMock` 将会失败。
- 重写在整个测试期间持续有效：使用测试模块、`declareMock` 或 `declare` 替换的定义仅在 Koin 停止时才会被重置。

## 相关内容 {id="related"}

- [验证你的配置](/docs/reference/koin-test/verify)：`verify()` 及其与编译时安全性的关系。
- [Android 插桩测试](/docs/reference/koin-android/instrumented-testing)：由 `Application` 启动 Koin 的测试。
- [测试 Composable](/docs/reference/koin-compose/compose-testing)：Compose UI 测试与预览。
- [Ktor 测试](/docs/reference/koin-ktor/ktor-testing)：结合 Koin 使用 `testApplication`。
- [上下文隔离](/docs/reference/koin-core/context-isolation)：适用于库和并行测试的专用 Koin 容器。
- [JUnit 测试快速入门](/docs/quickstart/junit-test)：完整的示例项目。