---
title: 在测试中注入
---

## 使用 KoinTest 让你的测试成为 KoinComponent {id="making-your-test-a-koincomponent-with-kointest"}

*注意*：这不适用于 Android 仪器化测试。关于使用 Koin 进行仪器化测试，请参阅 [Android 仪器化测试](/docs/reference/koin-android/instrumented-testing)

通过为你的类标记 `KoinTest`，你的类将成为 `KoinComponent` 并为你带来：

* `by inject()` 和 `get()` —— 从 Koin 获取实例的函数
* `verify()` —— 帮助你验证模块配置
* `declareMock` 和 `declare` —— 在当前上下文中声明一个 Mock 或新定义

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    // Lazy inject property
    val componentB : ComponentB by inject()

    @Test
    fun `should inject my components`() {
        startKoin {
            modules(
                module {
                    single { ComponentA() }
                    single { ComponentB(get()) }
                })
        }

        // directly request an instance
        val componentA = get<ComponentA>()

        assertNotNull(a)
        assertEquals(componentA, componentB.a)
    }
```

:::note
 不要犹豫去重载 Koin 模块配置，以帮助你部分构建应用。
:::

## JUnit 规则 (Rules) {id="junit-rules"}

### 为你的测试创建一个 Koin 上下文 {id="create-a-koin-context-for-your-test"}

你可以使用以下规则轻松地为每个测试创建并持有 Koin 上下文：

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // Your KoinApplication instance here
    modules(myModule)
}
```

### 指定你的 Mock 提供者 (Mock Provider) {id="specify-your-mock-provider"}

为了让你能够使用 `declareMock` API，你需要指定一个规则来让 Koin 知道如何构建你的 Mock 实例。这让你能够根据需求选择合适的 Mock 框架。

使用 Mockito 创建 Mock：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    Mockito.mock(clazz.java)
}
```

使用 MockK 创建 Mock：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // Your way to build a Mock here
    mockkClass(clazz)
}
```

!> koin-test 项目不再与 Mockito 强绑定

## 开箱即用的 Mock 支持 {id="mocking-out-of-the-box"}

无需在每次需要 Mock 时都创建一个新模块，你可以使用 `declareMock` 实时声明 Mock：

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(
            module {
                single { ComponentA() }
                single { ComponentB(get()) }
            })
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }
    
    @Test
    fun `should inject my components`() {
    
    }
        // Replace current definition by a Mock
        val mock = declareMock<ComponentA>()

        // retrieve mock, same as variable above 
        assertNotNull(get<ComponentA>())

        // is built with mocked ComponentA
        assertNotNull(get<ComponentB>())
    }
```

:::note
 `declareMock` 可以指定你想要的是 single 还是 factory，以及是否想要将其置于某个模块路径中。
:::

## 实时声明组件 {id="declaring-a-component-on-the-fly"}

当 Mock 不够用且不想仅为此创建一个模块时，你可以使用 `declare`：

```kotlin
    @Test
    fun `successful declare an expression mock`() {
        startKoin { }

        declare {
            factory { ComponentA("Test Params") }
        }

        Assert.assertNotEquals(get<ComponentA>(), get<ComponentA>())
    }
```

## 检查你的 Koin 模块 {id="checking-your-koin-modules"}

Koin 提供了一种方法来测试你的 Koin 模块是否正常：`verify()` —— 遍历你的定义树并检查每个定义是否已绑定。

```kotlin
@Test
fun checkKoinModules() {
    myModule.verify()
}
```

:::tip
`checkModules()` API 已弃用。Koin 编译器插件现在提供编译时依赖验证，取代了对 `verify()` 和 `checkModules()` 的需求。请参阅[编译时安全](/docs/reference/koin-compiler/compile-safety)。
:::

## 为你的测试启动与停止 Koin {id="starting-stopping-koin-for-your-tests"}

请注意在每个测试之间停止你的 Koin 实例（如果你在测试中使用了 `startKoin`）。否则，请确保使用 `koinApplication` 获取局部 Koin 实例，或者使用 `stopKoin()` 停止当前的全局实例。

## 使用 JUnit5 进行测试 {id="testing-with-junit5"}
JUnit 5 支持提供的[扩展 (Extensions)](https://junit.org/junit5/docs/current/user-guide/#extensions)将处理 Koin 上下文的启动和停止。这意味着如果你正在使用该扩展，则无需使用 `AutoCloseKoinTest`。

### 依赖项 {id="dependency"}
对于使用 JUnit5 进行测试，你需要使用 `koin-test-junit5` 依赖项。

### 编写测试 {id="writing-tests"}
你需要注册 `KoinTestExtension` 并提供你的模块配置。完成此操作后，你可以在测试中获取或注入你的组件。请记得在 `@RegisterExtension` 处配合使用 `@JvmField`。

```kotlin
class ExtensionTests: KoinTest {

    private val componentB by inject<Simple.ComponentB>()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
            single { Simple.ComponentA() }
            single { Simple.ComponentB(get()) }
        })
    }

    @Test
    fun contextIsCreatedForTheTest() {
        Assertions.assertNotNull(get<Simple.ComponentA>())
        Assertions.assertNotNull(componentB)
    }
}

```

### 在 JUnit5 中使用 Mock {id="mocking-with-junit5"}
其工作方式与 JUnit4 相同，只是你需要使用 `@RegisterExtension`。

```kotlin
class MockExtensionTests: KoinTest {

    val mock: Simple.UUIDComponent by inject()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.UUIDComponent() }
                })
    }

    @JvmField
    @RegisterExtension
    val mockProvider = MockProviderExtension.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun mockProviderTest() {
        val uuidValue = "UUID"
        declareMock<Simple.UUIDComponent> {
            BDDMockito.given(getUUID()).will { uuidValue }
        }

        Assertions.assertEquals(uuidValue, mock.getUUID())
    }
}
```

### 获取创建的 Koin 实例 {id="getting-the-created-koin-instances"}
你也可以将创建的 Koin 上下文作为函数参数获取。这可以通过向测试函数添加函数参数来实现。

```kotlin
class ExtensionTests: KoinTest {
    
    @RegisterExtension
    @JvmField
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.ComponentA() }
                })
    }

    @Test
    fun contextIsCreatedForTheTest(koin: Koin) {
        // get<SimpleComponentA>() == koin.get<Simple.ComponentA>()
        Assertions.assertNotNull(koin.get<Simple.ComponentA>())
    }
}
```
