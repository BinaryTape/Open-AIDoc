---
title: 在測試中進行注入
---

## 使用 KoinTest 讓您的測試成為 KoinComponent {id="making-your-test-a-koincomponent-with-kointest"}

*警告*：這不適用於 Android Instrumented 測試。關於使用 Koin 進行 Instrumented 測試，請參閱 [Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing)

透過為您的類別標記 `KoinTest`，該類別將成為 `KoinComponent` 並為您帶來：

* `by inject()` 與 `get()` —— 從 Koin 檢索執行個體的函式
* `verify()` —— 協助您驗證模組配置
* `declareMock` 與 `declare` —— 在目前上下文中宣告模擬物件或新的定義

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    // 延遲注入屬性
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

        // 直接請求執行個體
        val componentA = get<ComponentA>()

        assertNotNull(a)
        assertEquals(componentA, componentB.a)
    }
```

:::note
 請隨時多載 Koin 模組配置，以協助您局部建置應用程式。
:::

## JUnit 規則 {id="junit-rules"}

### 為您的測試建立 Koin 上下文 {id="create-a-koin-context-for-your-test"}

您可以使用以下規則輕鬆地為每個測試建立並持有 Koin 上下文：

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // 此處為您的 KoinApplication 執行個體
    modules(myModule)
}
```

### 指定您的 Mock 提供者 {id="specify-your-mock-provider"}

為了讓您使用 `declareMock` API，您需要指定一個規則，讓 Koin 知道如何建置您的模擬物件執行個體。這讓您可以根據需求選擇合適的模擬框架。

使用 Mockito 建立模擬物件：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 此處為您建置模擬物件的方式
    Mockito.mock(clazz.java)
}
```

使用 MockK 建立模擬物件：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 此處為您建置模擬物件的方式
    mockkClass(clazz)
}
```

!> koin-test 專案不再與 Mockito 綁定

## 開箱即用的模擬功能 {id="mocking-out-of-the-box"}

與其每次需要模擬物件時都建立一個新模組，您可以使用 `declareMock` 即時宣告模擬物件：

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
        // 使用模擬物件取代目前的定義
        val mock = declareMock<ComponentA>()

        // 檢索模擬物件，與上面的變數相同
        assertNotNull(get<ComponentA>())

        // 使用模擬的 ComponentA 建置
        assertNotNull(get<ComponentB>())
    }
```

:::note
 `declareMock` 可以指定您想要的是單例（single）還是工廠（factory），以及是否要將其置於模組路徑中。
:::

## 即時宣告組件 {id="declaring-a-component-on-the-fly"}

當模擬物件不足以滿足需求，且不想僅為此建立模組時，您可以使用 `declare`：

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

## 檢查您的 Koin 模組 {id="checking-your-koin-modules"}

Koin 提供了一種測試 Koin 模組是否正確的方法：`verify()` —— 遍歷您的定義樹並檢查每個定義是否已繫結。

```kotlin
@Test
fun checkKoinModules() {
    myModule.verify()
}
```

:::tip
`checkModules()` API 已棄用。Koin 編譯器外掛程式現在提供了編譯期相依性驗證，取代了對 `verify()` 與 `checkModules()` 的需求。詳情請參閱 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)。
:::

## 為您的測試啟動與停止 Koin {id="starting-stopping-koin-for-your-tests"}

請注意在每個測試之間停止您的 Koin 執行個體（如果您在測試中使用 `startKoin`）。否則請確保使用 `koinApplication` 來處理區域 Koin 執行個體，或使用 `stopKoin()` 來停止目前的全局執行個體。

## 使用 JUnit5 進行測試 {id="testing-with-junit5"}
JUnit 5 支援提供的 [擴充 (Extensions)](https://junit.org/junit5/docs/current/user-guide/#extensions) 將處理 Koin 上下文的啟動與停止。這代表如果您使用該擴充，則不需要使用 `AutoCloseKoinTest`。

### 相依性 {id="dependency"}
若要使用 JUnit5 進行測試，您需要使用 `koin-test-junit5` 相依性。

### 編寫測試 {id="writing-tests"}
您需要註冊 `KoinTestExtension` 並提供您的模組配置。完成此操作後，您可以在測試中獲取或注入您的組件。請記得在 `@RegisterExtension` 同時使用 `@JvmField`。

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

### 在 JUnit5 中進行模擬 {id="mocking-with-junit5"}
這與 JUnit4 中的運作方式相同，唯獨您需要使用 `@RegisterExtension`。

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

### 獲取建立的 Koin 執行個體 {id="getting-the-created-koin-instances"}
您也可以將建立的 Koin 上下文作為函式參數獲取。這可以透過在測試函式中加入函式參數來實現。

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
