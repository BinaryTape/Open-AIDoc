---
title: KoinComponent
---

# KoinComponent

`KoinComponent` 是一个让类能够访问 Koin 容器的接口，使其可以调用 `get()` 和 `by inject()`。本页面介绍了何时需要它、如何使用它，以及为什么更推荐使用构造函数注入。有关检索函数本身的说明，请参阅 [Injection](/docs/reference/koin-core/injection)。

## 何时使用 KoinComponent {id="when-to-use-koincomponent"}

对于非 Koin 创建且自身没有 Koin 扩展的类，请使用 `KoinComponent`：

- 入口点：`main()` 类、CLI 命令、由框架或反射创建的类。
- 没有 Koin 扩展的 Android 类：`BroadcastReceiver`、`ContentProvider`、自定义 `View`。参见 [Android Entry Points](/docs/reference/koin-android/entry-points)。
- 你无法控制其构造函数的回调和监听器。
- 尚无法迁移到构造函数注入的旧版代码。

以下情况无需使用它：

- 在模块中声明的类：仓库、服务、用例、ViewModel。Koin 会通过构造函数传递它们的依赖项。
- `Activity`、`Fragment` 和 `Service`：Koin Android 直接在它们上面提供了 `by inject()` 和 `by viewModel()`。
- Composable：使用 `koinInject()`，参见 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 使用 KoinComponent {id="use-koincomponent"}

实现该接口，然后调用 `get()` 或 `by inject()`：

```kotlin
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import org.koin.core.component.inject

class SyncCommand : KoinComponent {

    // 惰性加载：首次访问时解析
    private val syncService: SyncService by inject()

    // 立即加载：创建 SyncCommand 时解析
    private val logger: Logger = get()

    fun run() {
        logger.info("Starting sync")
        syncService.sync()
    }
}

fun main() {
    startKoin {
        modules(appModule)
    }
    SyncCommand().run()
}
```

无论采用哪种编写风格，代码都是相同的：`KoinComponent` 仅用于检索实例，定义可以使用任意风格进行声明。

`get()` 和 `inject()` 是扩展函数：从 `org.koin.core.component` 导入它们。它们接受限定符和形参代码块，就像所有检索函数一样（参见 [Injection](/docs/reference/koin-core/injection#qualifiers-and-parameters-at-the-call-site)）。

`KoinComponent` 本身只有一个函数 `getKoin()`，它返回 `Koin` 实例。其他所有操作都可以通过它完成：

```kotlin
class FeatureLoader : KoinComponent {

    fun optionalTracker(): Tracker? = getKoin().getOrNull()

    fun apiUrl(): String = getKoin().getProperty("server_url", "https://api.example.com")

    fun allPlugins(): List<Plugin> = getKoin().getAll()
}
```

可空检索和 `getAll()` 在 [Injection](/docs/reference/koin-core/injection) 中有详细介绍。属性在 [Starting Koin](/docs/reference/koin-core/starting-koin#properties) 中有详细介绍。

### 自定义 Android View {id="custom-android-view"}

自定义 `View` 是由布局填充器（layout inflater）创建的，因此 Koin 无法传递构造函数形参。`KoinComponent` 非常适合此类场景：

```kotlin
class ChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs), KoinComponent {

    private val formatter: ChartFormatter by inject()

    fun setData(points: List<DataPoint>) {
        val formatted = formatter.format(points)
        // 绘制
    }
}
```

在 `View` 中应使用 `by inject()`：布局编辑器在创建视图时并没有运行中的 Koin 容器，在此处如果使用立即加载的 `get()` 将会失败。

## KoinComponent 使用哪个容器 {id="which-container-koincomponent-uses"}

默认情况下，`getKoin()` 返回通过 `startKoin` 启动的全局容器。如果尚未调用 `startKoin`，`get()` 会抛出 `IllegalStateException`（"KoinApplication has not been started"）。

运行自身隔离容器的库或 SDK 可以重写 `getKoin()` 来返回其专属容器：

```kotlin
object SdkKoinContext {
    val koinApp = koinApplication { modules(sdkModule) }
}

abstract class SdkComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koinApp.koin
}

class SdkClient : SdkComponent() {
    private val api: SdkApi by inject() // 从 SDK 容器中解析
}
```

完整模式请参阅 [Context Isolation](/docs/reference/koin-core/context-isolation)。

对于拥有作用域的类，请改为实现 `KoinScopeComponent`：此时 `get()` 和 `inject()` 将从该作用域中解析。参见 [Scopes](/docs/reference/koin-core/scopes)。

## 为什么更推荐构造函数注入 {id="why-constructor-injection-is-preferred"}

比较同一个类的两个版本：

**Compiler Plugin DSL**
```kotlin
// 依赖于 Koin，依赖项隐藏在类体中
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 普通 Kotlin 类，依赖项在构造函数中清晰可见
class UserService(private val repository: UserRepository)

val appModule = module {
    single<UserRepository>()
    single<UserService>()
}
```

**Annotations**
```kotlin
// 依赖于 Koin，依赖项隐藏在类体中
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 普通 Kotlin 类，依赖项在构造函数中清晰可见
@Singleton
class UserService(private val repository: UserRepository)
```

**Constructor / Classic DSL**
```kotlin
// 依赖于 Koin，依赖项隐藏在类体中
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 普通 Kotlin 类，依赖项在构造函数中清晰可见
class UserService(private val repository: UserRepository)

val appModule = module {
    singleOf(::UserRepository)
    singleOf(::UserService)
}
```

构造函数版本在四个方面更具优势：

- 依赖项清晰可见：构造函数直接列出该类所需的内容。使用 `KoinComponent` 时，则必须查阅类体。
- 脱离 Koin 运行测试：你可以直接创建 `UserService(FakeUserRepository())`。而 `KoinComponent` 版本则需要一个包含假定义的运行中容器。
- 构建时检查：编译器插件会根据依赖图验证所声明类的构造函数依赖项。
- 无框架耦合：该类无需 Koin 即可编译和运行，这对共享代码和库来说尤为重要。

请尽量让 `KoinComponent` 保留在边缘边界处。由一个入口点检索顶层对象，其下的所有层级均使用构造函数注入：

```kotlin
class SyncCommand : KoinComponent {
    private val syncService: SyncService by inject()
}

class SyncService(private val repository: UserRepository, private val api: ApiClient)
class UserRepository(private val database: Database)
```

## 测试 KoinComponent {id="testing-a-koincomponent"}

实现 `KoinComponent` 的类会从全局容器中读取内容，因此测试必须使用所需的定义启动 Koin，并在测试结束后将其停止：

```kotlin
class SyncCommandTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<SyncService> { FakeSyncService() }
            single<Logger> { TestLogger() }
        })
    }

    @Test
    fun `run calls sync`() {
        SyncCommand().run()
        // 对 FakeSyncService 进行断言
    }
}
```

`KoinTestRule` 会在每次测试之前启动 Koin，并在测试之后将其停止。规则、模拟（mocking）和模块验证相关内容请参阅 [Testing](/docs/reference/koin-test/testing)。

## 相关内容 {id="related"}

- [Injection](/docs/reference/koin-core/injection)：`get()`、`inject()`、可空检索和 `getAll()`。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：了解哪些 Android 类需要 `KoinComponent`，哪些不需要。
- [Context Isolation](/docs/reference/koin-core/context-isolation)：将 `KoinComponent` 指向隔离容器。
- [Scopes](/docs/reference/koin-core/scopes)：适用于拥有作用域的类的 `KoinScopeComponent`。
- [Testing](/docs/reference/koin-test/testing)：测试使用 Koin 的类。