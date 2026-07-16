---
title: 驗證您的 Koin 配置
---

Koin 允許您驗證您的配置模組，避免在執行時才發現相依注入問題。

:::info 未來：編譯期安全
`verify()` 與 `checkModules()` API 將被 Koin 編譯器外掛程式中的 **原生編譯期安全** 功能取代。這將在建置時期驗證您的整個配置，並在執行之前擷取錯誤。

若要了解更多，請參閱 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)。
:::

## Verify API - 僅限 JVM [3.3+]

在 Koin 模組上使用 `verify()` 擴充函式。在底層，這將驗證所有建構函式類別，並與 Koin 配置進行交叉核對，以確認是否為該相依性宣告了組建。如果失敗，此函式將拋出 `MissingKoinDefinitionException`。

```kotlin
val niaAppModule = module {
    includes(
        jankStatsKoinModule,
        dataKoinModule,
        syncWorkerKoinModule,
        topicKoinModule,
        authorKoinModule,
        interestsKoinModule,
        settingsKoinModule,
        bookMarksKoinModule,
        forYouKoinModule
    )
    viewModel<MainActivityViewModel>()
}
```

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {
        // 驗證 Koin 配置
        niaAppModule.verify()
    }
}
```

啟動 JUnit 測試，大功告成！

`verify()` API 執行起來非常輕量，且不需要任何 mock/虛設常式即可針對您的配置執行。

### 使用注入參數進行驗證 [4.0+]

當您的配置隱含了使用 `parametersOf` 的注入物件時，驗證將會失敗，因為您的配置中沒有該參數型別的定義。
不過，您可以定義一個參數型別，透過指定的定義 `definition<Type>(Class1::class, Class2::class ...)` 進行注入。

```kotlin
class ModuleCheck {

    // 給定一個帶有注入定義的定義
    val module = module {
        single { (a: Simple.ComponentA) -> Simple.ComponentB(a) }
    }

    @Test
    fun checkKoinModule() {

        // 驗證並宣告注入參數
        module.verify(
            injections = injectedParameters(
                definition<Simple.ComponentB>(Simple.ComponentA::class)
            )
        )
    }
}
```

### 型別白名單

我們可以將型別加入「白名單」。這代表對於任何定義，該型別都被視為存在於系統中：

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {

        // 驗證 Koin 配置
        niaAppModule.verify(
            // 列出定義中使用但未直接宣告的型別（例如參數注入）
            extraTypes = listOf(MyType::class ...)
        )
    }
}
```

### 使用註解進行驗證

來自 `koin-core-annotations` 的註解可協助 Koin 推論注入合約並驗證配置。這有助於識別這些元素，而不是使用複雜的 DSL 配置：

```kotlin
// 表示 "a" 是一個注入參數
class ComponentB(@InjectedParam val a: ComponentA)
// 表示 "a" 是動態提供的
class ComponentBProvided(@Provided val a: ComponentA)
```

這有助於在不編寫自訂驗證邏輯的情況下，防止測試或執行時出現微妙的問題。

---

## CheckModules API (已棄用)

:::warning
自 Koin 4.0 起，`checkModules()` API 已棄用。請改用 `verify()`，或遷移至 Koin 編譯器外掛程式以獲得編譯期安全。
:::

`checkModules()` 函式會啟動您的模組，並嘗試執行每個可能的定義。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {

        koinApplication {
            modules(module1, module2)
            checkModules()
        }
    }
}
```

或使用 `checkKoinModules`：

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        checkKoinModules(listOf(module1, module2))
    }
}
```

### CheckModule DSL

對於任何使用注入參數、屬性或動態執行個體的定義：

* `withInstance(value)` - 將 `value` 執行個體新增至 Koin 圖中
* `withInstance<MyType>()` - 將新增 `MyType` 的模擬執行個體（需要 MockProviderRule）
* `withParameter<Type>(qualifier){ qualifier -> value }` - 新增要作為參數注入的 `value` 執行個體
* `withProperty(key, value)` - 將屬性新增至 Koin

### 使用 JUnit 規則進行模擬

若要搭配 `checkModules` 使用 mock，請提供 `MockProviderRule`：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 在此處根據 clazz 使用您的架構進行模擬
    Mockito.mock(clazz.java)
}
```

### 驗證具有動態行為的模組

```kotlin
val myModule = module {
    factory { (id: String) -> FactoryPresenter(id) }
}
```

使用以下程式碼驗證：

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {

        koinApplication {
            modules(myModule)
            checkModules(){
                // 要新增到 Koin 的值，由定義使用
                withInstance("_my_id_value")
            }
        }
    }
}
```

### Android 範例

```kotlin
class CheckModulesTest {

    @get:Rule
    val rule: TestRule = InstantTaskExecutorRule()

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun `test DI modules`(){
        checkKoinModules(allModules) {
            withInstance<Context>()
            withInstance<Application>()
            withInstance<SavedStateHandle>()
            withInstance<WorkerParameters>()
        }
    }
}
```

### 提供作用域連結

使用 `withScopeLink` 連結作用域：

```kotlin
val myModule = module {
    scope(named("scope1")) {
        scoped { ComponentA() }
    }
    scope(named("scope2")) {
        scoped { ComponentB(get()) }
    }
}

@Test
fun `test DI modules`(){
    koinApplication {
        modules(myModule)
        checkModules(){
            withScopeLink(named("scope2"), named("scope1"))
        }
    }
}
```

---

## 遷移路徑

這兩個驗證 API 都將被 Koin 編譯器外掛程式的編譯期安全功能取代：

| 目前 | 未來 |
|---------|--------|
| `module.verify()` | 編譯器外掛程式 (自動) |
| `checkModules()` | 編譯器外掛程式 (自動) |
| 執行時驗證 | 編譯期驗證 |
| 手動測試設定 | 無需測試程式碼 |

當編譯器外掛程式編譯期安全功能可用時，您將在建置時期獲得相依性驗證，而無需編寫任何驗證測試。

有關設定說明，請參閱 [編譯器外掛程式設定](/docs/setup/compiler-plugin)。