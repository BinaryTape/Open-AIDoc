---
title: 扩展管理器
---

# 扩展管理器

Koin 提供了一个扩展系统，允许您向框架添加新功能。这对于将 Koin 与外部系统集成或添加自定义功能非常有用。

## KoinExtension

Koin 扩展是一个实现 `KoinExtension` 接口的类：

```kotlin
interface KoinExtension {
    /**
     * 在注册扩展时调用
     */
    fun onRegister(koin: Koin)

    /**
     * 在 Koin 关闭时调用
     */
    fun onClose()
}
```

### 创建扩展

```kotlin
class MyCustomExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
        // 初始化您的扩展
    }

    override fun onClose() {
        // 清理资源
    }

    fun doSomething() {
        // 您的扩展逻辑
    }
}
```

### 注册扩展

使用 `ExtensionManager` 来注册扩展：

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

### 访问扩展

```kotlin
val Koin.myExtension: MyCustomExtension
    get() = extensionManager.getExtension(EXTENSION_ID)

// 用法
val extension = getKoin().myExtension
extension.doSomething()
```

### 在 Koin 设置中使用

```kotlin
startKoin {
    myExtension()  // 注册扩展
    modules(appModule)
}
```

:::note
`ExtensionManager` 被标记为 `@KoinInternalApi`。这意味着 API 可能会在版本之间发生变化。在生产代码中请谨慎使用。
:::

## ResolutionExtension

对于更高级的用例，Koin 提供了 `ResolutionExtension` 来挂钩到依赖解析过程。这允许您提供来自外部源的实例。

```kotlin
interface ResolutionExtension {
    /**
     * 用于识别的扩展名称
     */
    val name: String

    /**
     * 在依赖解析期间调用
     * @param scope 当前解析作用域
     * @param instanceContext 包含类型信息的解析上下文
     * @return 如果找到则返回实例，否则返回 null
     */
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

### 用例

- 与外部 DI 容器集成
- 从缓存或池中提供实例
- 根据运行时条件进行动态实例解析
- 使用模拟提供者进行测试

### 示例：外部实例提供者

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

### 注册 ResolutionExtension

```kotlin
val externalProvider = ExternalInstanceProvider()
externalProvider.registerInstance(MyService::class, MyServiceImpl())

startKoin {
    // 注册解析扩展
    koin.addResolutionExtension(externalProvider)

    modules(module {
        // 现在可以从外部提供者解析 MyService
        single<MyComponent>()  // MyComponent 依赖于 MyService
    })
}
```

:::warning 实验性 API
`ResolutionExtension` API 被标记为 `@KoinExperimentalAPI`。该 API 可能会在未来的版本中发生变化。
:::

### 完整示例

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
            // ComponentB 依赖于 ComponentA
            // ComponentA 将从扩展中解析
            single { ComponentB(get()) }
        })
    }.koin

    val componentB = koin.get<ComponentB>()
    // componentB.a 是来自 resolutionExtension 的实例
}
```

## 何时使用扩展

| 扩展类型 | 用例 |
|---------------|----------|
| `KoinExtension` | 向 Koin 添加功能（日志记录、监控、自定义作用域） |
| `ResolutionExtension` | 在解析期间从外部源提供实例 |

## 最佳做法

1. **谨慎使用** - 扩展会增加复杂性；尽可能首选标准 Koin 定义。
2. **为您的扩展编写文档** - 明确说明扩展的作用以及如何使用它。
3. **处理清理** - 始终实现 `onClose()` 以避免资源泄漏。
4. **考虑线程安全性** - 扩展可能会从多个线程调用。

## 后续步骤

- **[作用域](/docs/reference/koin-core/scopes)** - 自定义作用域管理
- **[模块](/docs/reference/koin-core/modules)** - 模块组织
- **[高级模式](/docs/reference/koin-core/advanced-patterns)** - 更多高级模式