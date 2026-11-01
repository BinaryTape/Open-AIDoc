---
title: 扩展管理器
---

# 扩展管理器 (Extension Manager)

Koin 为库和框架的作者提供了两个扩展点。`KoinExtension` 用于向 Koin 容器附加功能，并在注册和关闭时提供钩子函数。`ResolutionExtension` 则在没有匹配定义时，为 Koin 提供另一种获取实例的来源。大多数应用程序通常都不需要这二者：请优先使用[定义](/docs/reference/koin-core/definitions)。

## KoinExtension {id="koinextension"}

`KoinExtension` 是在容器中以指定 ID 注册的对象：

```kotlin
interface KoinExtension {
    fun onRegister(koin: Koin)
    fun onClose()
}
```

当你注册该扩展时，Koin 会调用 `onRegister`，并在容器关闭（`stopKoin()` 或 `koinApplication.close()`）时调用 `onClose`。

Koin 自身也使用了这一机制：[延迟加载模块](/docs/reference/koin-core/lazy-modules)背后的协程引擎就是 `KoinCoroutinesEngine` 扩展。

### 编写扩展 {id="writing-an-extension"}

```kotlin
class AuditExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
    }

    override fun onClose() {
        // release resources
    }

    fun record(event: String) { ... }
}
```

### 注册并读取 {id="registering-and-reading-it"}

在 `KoinApplication` 上公开一个函数来注册该扩展，并在 `Koin` 上公开一个属性以将其读取：

```kotlin
private const val AUDIT_EXTENSION = "audit"

fun KoinApplication.audit() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<AuditExtension>(AUDIT_EXTENSION) == null) {
            registerExtension(AUDIT_EXTENSION, AuditExtension())
        }
    }
}

val Koin.audit: AuditExtension
    get() = extensionManager.getExtension(AUDIT_EXTENSION)
```

```kotlin
startKoin {
    audit()
    modules(appModule)
}

getKoin().audit.record("app_started")
```

| 函数 | 行为 |
|----------|----------|
| `registerExtension(id, extension)` | 存储该扩展并调用 `onRegister`。同名 ID 的扩展将被替换 |
| `getExtension<T>(id)` | 返回该扩展。若缺失则失败并提示 "Koin extension 'id' not found." |
| `getExtensionOrNull<T>(id)` | 返回该扩展，或者返回 `null` |

:::warning
`ExtensionManager` 被标记为 `@KoinInternalApi`：你需要显式选择启用（opt in），并且该 API 可能会在各版本之间发生变化，且不经过弃用周期。
:::

## ResolutionExtension {id="resolutionextension"}

当其他途径均无法匹配时，Koin 会向 `ResolutionExtension` 请求实例：即在当前作用域、作用域源以及关联作用域（包括根作用域）的定义之后。

```kotlin
interface ResolutionExtension {
    val name: String
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

返回与 `instanceContext.clazz`（如果使用了限定符，还包括 `instanceContext.qualifier`）相对应的实例，或者返回 `null` 让 Koin 继续并失败报错抛出 `NoDefinitionFoundException`。

Koin 在 [Ktor DI 桥接](/docs/reference/koin-ktor/ktor-bridge)中使用此机制来读取来自 Ktor 依赖注入的实例。

### 示例：来自另一个容器的实例 {id="example-instances-from-another-container"}

```kotlin
class LegacyContainerResolution(
    private val legacy: Map<KClass<*>, Any>,
) : ResolutionExtension {

    override val name: String = "legacy-container"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? =
        legacy[instanceContext.clazz]
}
```

在应用程序的 `koin` 上使用 `addResolutionExtension` 对其进行注册：

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun startApp(legacy: Map<KClass<*>, Any>) {
    startKoin {
        koin.addResolutionExtension(LegacyContainerResolution(legacy))
        modules(appModule)
    }
}
```

此时，`appModule` 中需要某种仅存在于旧版 Map 中的类型的定义，便可以从该扩展中获取。

如果使用编译器插件，仅由扩展提供的类型在构建时是未知的，因此编译时安全性检查会将其报告为缺失。需要将其标记为已提供：请参阅[编译时安全性](/docs/reference/koin-compiler/compile-safety)。

`addResolutionExtension` 被标记为 `@KoinExperimentalAPI`。

## 限制 {id="limits"}

- **内部与实验性 API**：这两个扩展点都可能在 Koin 版本之间发生变更。
- **解析扩展没有生命周期**：Koin 不会缓存 `ResolutionExtension` 返回的实例。如有需要，请自行缓存。
- **优先级末位**：只要存在匹配的定义，就绝不会请求解析扩展。它无法重写定义。
- **线程安全**：`resolve` 可能会同时在多个线程中被调用。

## 相关内容 {id="related"}

- [延迟加载模块](/docs/reference/koin-core/lazy-modules)：基于协程引擎扩展构建的功能。
- [Ktor DI 桥接](/docs/reference/koin-ktor/ktor-bridge)：解析扩展的实际应用。
- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：声明在 Koin 外部提供的依赖项。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：用于注册扩展的应用程序 DSL。
- [作用域](/docs/reference/koin-core/scopes)：作用域内的解析顺序。