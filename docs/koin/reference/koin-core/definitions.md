---
title: 定义
---

# 定义

定义（definition）告诉 Koin 如何创建某种类型以及该实例保留多长时间。本页涵盖定义类型、接口绑定、构造函数形参的解析方式，以及针对非你所有的类的定义。本篇假定你已知晓什么是模块（请参阅[核心概念](/docs/intro/core-concepts)）。

代码示例分为三个选项卡：Compiler Plugin DSL、注解（Annotations）、Constructor / Classic DSL。选择适合你的风格，该选择将适用于所有页面。如果你不确定该使用哪种风格，请阅读[选择你的风格](/docs/intro/choosing-your-style)。

## 定义类型 {id="definition-types"}

| 类型 | 实例 | 典型用途 |
|------|----------|-------------|
| `single` | 单一实例，保留在 Koin 容器的整个生命周期中 | 仓库（Repository）、API 客户端、数据库 |
| `factory` | 每次请求时均创建新实例 | Presenter、用例、短期对象 |
| `scoped` | 每个作用域一个实例，当作用域关闭时释放 | 绑定到 Activity、会话、请求的对象 |
| `viewModel` | 由 ViewModel 生命周期管理 | ViewModel（Android 和 Compose Multiplatform） |
| `worker` | 由 WorkManager 创建 | Android `ListenableWorker` |

声明方式：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<Database>()
    single<UserRepository>()
    factory<UserPresenter>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val database: Database)

@Factory
class UserPresenter(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

`@Singleton` 与 `@Single` 等价。推荐使用 `@Singleton`，这是 JSR-330 的命名。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
    factoryOf(::UserPresenter)
    viewModelOf(::UserViewModel)
}
```

你也可以自行编写构造函数调用，为每个依赖项使用 `get()`：

```kotlin
val appModule = module {
    single { Database() }
    single { UserRepository(get()) }
    factory { UserPresenter(get()) }
    viewModel { UserViewModel(get()) }
}
```

使用 Compiler Plugin DSL 和注解时，你无需编写 `get()`。[Koin 编译器插件](/docs/intro/koin-compiler-plugin)会读取构造函数并为你生成调用，然后在构建时检查是否已声明每个依赖项。

`single` 与 `factory` 如上所述。`scoped` 需要作用域声明：请参阅[作用域](/docs/reference/koin-core/scopes)。`viewModel` 有专门的页面：请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。`worker` 在 [WorkManager](/docs/reference/koin-android/workmanager) 中介绍。

### Single 还是 factory？ {id="single-or-factory"}

当对象没有针对每个调用者的独立状态且创建成本较高时（如数据库、HTTP 客户端），请使用 `single`。当每个调用者都需要自己的实例，或者对象持有着不得共享的状态时，请使用 `factory`。如果某个实例的存活时间应当长于 factory 但短于整个应用，则需要使用[作用域](/docs/reference/koin-core/scopes)。

## 接口绑定 {id="interface-binding"}

大多数情况下，使用方依赖的是接口而非实现。将实现绑定到接口：

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class

    // 同时绑定多个类型
    single<MyServiceImpl>() binds arrayOf(ServiceA::class, ServiceB::class)
}
```

**Annotations**
```kotlin
@Singleton
class UserRepositoryImpl(private val database: Database) : UserRepository
```

绑定是自动的：Koin 会将该类绑定到其所有超类型。若只需绑定其中部分类型，请列出它们：

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val database: Database) : UserRepository, Closeable
```

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class

    // 或者直接声明接口类型
    single<UserRepository> { UserRepositoryImpl(get()) }
}
```

这样，使用方请求 `UserRepository` 时就会获取到 `UserRepositoryImpl` 实例。当两个定义绑定了相同的类型时，你需要使用[限定符](/docs/reference/koin-core/qualifiers)来区分它们。

## 构造函数形参 {id="constructor-parameters"}

Koin 会从容器中解析每个构造函数形参。形参类型决定了解析方式：

| 形参 | 解析为 | 详情 |
|-----------|-------------|--------|
| `repository: UserRepository` | `UserRepository` 定义。若缺失则失败 | |
| `logger: Logger?` | 若存在对应定义则解析该定义，否则为 `null` | |
| `heavy: Lazy<HeavyService>` | 在首次访问 `heavy.value` 时创建 | [注入](/docs/reference/koin-core/injection) |
| `loggers: List<Logger>` | 所有绑定到 `Logger` 的定义 | [进阶模式](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `@Named("local") db: Database` | 带有该限定符的定义 | [限定符](/docs/reference/koin-core/qualifiers) |
| `@InjectedParam userId: String` | 调用方在解析时传入的值 | [注入参数](/docs/reference/koin-core/injection-parameters) |
| `@Property("api_url") url: String` | Koin 属性 | [启动 Koin](/docs/reference/koin-core/starting-koin#properties) |

使用 Compiler Plugin DSL 和注解时，仅凭构造函数签名即可完成此操作：

**Compiler Plugin DSL**
```kotlin
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)

val appModule = module {
    single<SyncService>()
}
```

**Annotations**
```kotlin
@Singleton
class SyncService(
    private val repository: UserRepository,
    private val analytics: Analytics?,
    private val uploader: Lazy<Uploader>,
)
```

**Constructor / Classic DSL**
`singleOf(::SyncService)` 会通过 `get()` 解析每个形参。对于可空、lazy 或列表形参，请自行编写调用并搭配相应的函数：

```kotlin
val appModule = module {
    single {
        SyncService(
            repository = get(),
            analytics = getOrNull(),
            uploader = inject(),
        )
    }
}
```

`getAll()` 返回一个 `List`，`getProperty("key")` 读取属性，而 `params.get()` 读取注入参数。

## 非你所有的类 {id="classes-you-don-t-own"}

来自库（Room、Retrofit、OkHttp）的类无法添加注解，且通常由构建器创建。可以通过一个由 Koin 解析其形参的函数来声明它们：

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

fun topicDao(db: AppDatabase): TopicDao = db.topicDao()

val databaseModule = module {
    single { create(::database) }
    single { create(::topicDao) }
}
```

`create(::function)` 像构造函数一样解析函数形参，并具有相同的编译时检查。在函数及其形参上添加限定符注解同样有效。

**Annotations**
为顶层函数添加注解。`@ComponentScan` 会像发现类一样找到它：

```kotlin
@Singleton
fun database(context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

@Singleton
fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
```

或者将提供者函数归类到一个 `@Module` 类中：

```kotlin
@Module
class DatabaseModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()

    @Singleton
    fun topicDao(db: AppDatabase): TopicDao = db.topicDao()
}
```

**Constructor / Classic DSL**
```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "app-db").build()
    }
    single { get<AppDatabase>().topicDao() }
}
```

关于 Android 上完整的 Retrofit、Room 和序列化配置，请参阅 [Android 库集成](/docs/reference/koin-android/binding-patterns)。

## 预先创建 {id="eager-creation"}

Koin 会在首次请求时才创建 `single`。如果希望在 Koin 启动时创建它，请将其标记为 `createdAtStart`：

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<ConfigManager>() withOptions {
        createdAtStart()
    }
}
```

**Annotations**
```kotlin
@Singleton(createdAtStart = true)
class ConfigManager
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single(createdAtStart = true) { ConfigManager() }
}
```

预先创建会在启动 Koin 的线程上运行。在 Android 上，这指的是 `Application.onCreate()` 期间的主线程，因此每个预先创建的定义都会增加应用的启动时间。请仅将其保留用于必须在首个屏幕呈现前就存在的对象。要减少启动时的工作负荷，请参阅[延迟加载模块](/docs/reference/koin-core/lazy-modules)。

## 释放回调 {id="release-callback"}

`onClose` 在实例释放时运行：对于 `single` 是在 Koin 停止时，对于 `scoped` 是在其作用域关闭时。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>() onClose { it?.close() }
}
```

**Annotations**
注解没有 `onClose` 形参。请在 DSL 模块中声明此类定义。

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    single { Database() } onClose { it?.close() }
}
```

`onClose` 绝不会针对 `factory` 调用：Koin 不会保留 factory 实例。

## 重写定义 {id="overriding-a-definition"}

当两个模块声明了相同的类型时，后加载的模块将生效：

```kotlin
val prodModule = module {
    single<ApiService> { ProductionApi() }
}

val testModule = module {
    single<ApiService> { FakeApi() }
}

startKoin {
    modules(prodModule, testModule) // ApiService resolves to FakeApi
}
```

这在测试中非常有用，但若意外发生则会成为错误的来源。为了使重写行为显式化，可以在全局禁用重写并对需要的定义进行明确标记：

```kotlin
val testModule = module {
    single<ApiService> { FakeApi() }.override()
}

startKoin {
    allowOverride(false)
    modules(prodModule, testModule)
}
```

启用 `allowOverride(false)` 后，未标记重写的重复定义将在启动时失败。

## 相关内容 {id="related"}

- [模块](/docs/reference/koin-core/modules)：对定义进行分组，并使用 `includes()` 组合模块。
- [限定符](/docs/reference/koin-core/qualifiers)：同一类型的多个定义。
- [注入](/docs/reference/koin-core/injection)：在构造函数之外检索实例。
- [作用域](/docs/reference/koin-core/scopes)：与生命周期绑定的实例。
- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：编译器插件在你的定义中检查的内容。
- [DSL 参考](/docs/reference/koin-core/dsl)与[注解参考](/docs/reference/koin-annotations/annotations-inventory)：每个关键字和注解的说明。