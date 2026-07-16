---
title: 擴充套件管理器
---

# 擴充套件管理器

Koin 提供了一個擴充套件系統，讓您可以向架構中新增功能。這對於將 Koin 與外部系統整合或新增自訂功能非常有用。

## KoinExtension

Koin 擴充套件是實作了 `KoinExtension` 介面的類別：

```kotlin
interface KoinExtension {
    /**
     * 註冊擴充套件時呼叫
     */
    fun onRegister(koin: Koin)

    /**
     * Koin 關閉時呼叫
     */
    fun onClose()
}
```

### 建立擴充套件

```kotlin
class MyCustomExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
        // 初始化您的擴充套件
    }

    override fun onClose() {
        // 清理資源
    }

    fun doSomething() {
        // 您的擴充套件邏輯
    }
}
```

### 註冊擴充套件

使用 `ExtensionManager` 來註冊擴充套件：

```kotlin
fun KoinApplication.myExtension() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<MyCustomExtension>(EXTENSION_ID) == null) {
            registerExtension(EXTENSION_ID, MyCustomExtension())
        }
    }
}

private const val EXTENSION_ID = "my-extension"
```

### 存取擴充套件

```kotlin
val Koin.myExtension: MyCustomExtension
    get() = extensionManager.getExtension(EXTENSION_ID)

// 用法
val extension = getKoin().myExtension
extension.doSomething()
```

### 在 Koin 設定中使用

```kotlin
startKoin {
    myExtension()  // 註冊擴充套件
    modules(appModule)
}
```

:::note
`ExtensionManager` 被標記為 `@KoinInternalApi`。這意味著該 API 可能會在不同版本之間發生變化。在正式生產環境的程式碼中請謹慎使用。
:::

## ResolutionExtension

對於更進階的使用案例，Koin 提供了 `ResolutionExtension` 以連結到相依性解析程序。這讓您可以提供來自外部來源的執行個體。

```kotlin
interface ResolutionExtension {
    /**
     * 用於識別的擴充套件名稱
     */
    val name: String

    /**
     * 在相依性解析期間呼叫
     * @param scope 目前的解析作用域
     * @param instanceContext 包含型別資訊的解析上下文
     * @return 如果找到則傳回執行個體，否則傳回 null
     */
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

### 使用案例

- 與外部相依注入（DI）容器整合
- 提供來自快取（cache）或集區（pool）的執行個體
- 根據執行時期條件進行動態執行個體解析
- 使用模擬（mock）供應器進行測試

### 範例：外部執行個體供應器

```kotlin
class ExternalInstanceProvider : ResolutionExtension {
    private val externalInstances = mutableMapOf<`KClass<*>`, Any>()

    override val name: String = "external-provider"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? {
        return externalInstances[instanceContext.clazz]
    }

    fun <T : Any> registerInstance(clazz: KClass<T>, instance: T) {
        externalInstances[clazz] = instance
    }
}
```

### 註冊 ResolutionExtension

```kotlin
val externalProvider = ExternalInstanceProvider()
externalProvider.registerInstance(MyService::class, MyServiceImpl())

startKoin {
    // 註冊解析擴充套件
    koin.addResolutionExtension(externalProvider)

    modules(module {
        // 現在可以從外部供應器解析 MyService
        single<MyComponent>()  // MyComponent 相依於 MyService
    })
}
```

:::warning 實驗性 API
`ResolutionExtension` API 被標記為 `@KoinExperimentalAPI`。該 API 可能會在未來版本中發生變化。
:::

### 完整範例

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun resolutionExtensionExample() {
    val resolutionExtension = object : ResolutionExtension {
        val instanceMap = mapOf<`KClass<*>`, Any>(
            ComponentA::class to ComponentA()
        )

        override val name: String = "custom-resolver"

        override fun resolve(
            scope: Scope,
            instanceContext: ResolutionContext
        ): Any? {
            return instanceMap[instanceContext.clazz]
        }
    }

    val koin = koinApplication {
        printLogger(Level.DEBUG)
        koin.addResolutionExtension(resolutionExtension)
        modules(module {
            // ComponentB 相依於 ComponentA
            // ComponentA 將從擴充套件中解析
            single { ComponentB(get()) }
        })
    }.koin

    val componentB = koin.get<ComponentB>()
    // componentB.a 是來自 resolutionExtension 的執行個體
}
```

## 何時使用擴充套件

| 擴充套件型別 | 使用案例 |
|---------------|----------|
| `KoinExtension` | 向 Koin 新增功能（記錄、監控、自訂作用域） |
| `ResolutionExtension` | 在解析期間提供來自外部來源的執行個體 |

## 最佳實務

1. **謹慎使用** — 擴充套件會增加複雜性；盡可能優先使用標準 Koin 定義。
2. **記錄您的擴充套件** — 明確說明擴充套件的功能以及如何使用它。
3. **處理清理工作** — 務必實作 `onClose()` 以避免資源洩漏。
4. **考慮執行緒安全** — 擴充套件可能會從多個執行緒中呼叫。

## 後續步驟

- **[作用域](/docs/reference/koin-core/scopes)** — 自訂作用域管理
- **[模組](/docs/reference/koin-core/modules)** — 模組組織方式
- **[進階模式](/docs/reference/koin-core/advanced-patterns)** — 更多進階模式