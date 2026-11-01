---
title: 注入
---

# 注入

大多数类通过其构造函数接收依赖项，并由 Koin 负责填充（参见[构造函数形参](/docs/reference/koin-core/definitions#constructor-parameters)）。但某些代码无法做到这一点：例如 Android `Activity`、`main()` 函数、由框架创建的类等。本页介绍了在这类代码中用于从 Koin 获取实例的函数：`get()`、`inject()`、它们的可空变体以及 `getAll()`。

## 优先使用构造函数注入 {id="constructor-injection-first"}

仅在 Koin 无法创建该类的场景下使用本页介绍的函数：

```kotlin
// Koin 创建此类：依赖项通过构造函数传入
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator,
)

// Android 创建此类：通过 inject() 获取依赖项
class UserActivity : AppCompatActivity() {
    private val userService: UserService by inject()
}
```

具有构造函数形参的类可以通过传入伪造对象（fakes）来进行测试，无需 Koin 容器。而调用了 `get()` 的类在测试时则需要一个正在运行的容器。切勿在默认形参值中调用 `get()`（如 `class UserService(val repository: UserRepository = get())`）：应改为在模块中声明此类。

## 延迟获取与即时获取 {id="lazy-and-eager-retrieval"}

无论采用哪种风格，获取代码的形式都是相同的：

```kotlin
class UserActivity : AppCompatActivity() {

    // 延迟获取：在首次访问该属性时解析
    private val userService: UserService by inject()

    // 即时获取：在属性初始化时立即解析
    private val analytics: Analytics = get()
}
```

| 函数 | 返回值 | 解析时机 |
|----------|---------|----------|
| `by inject<T>()` | 用作属性委托的 `Lazy<T>` | 首次访问时 |
| `get<T>()` | `T` | 立即 |

对于属性，请使用 `by inject()`。这样即使在 Koin 尚未准备妥当之前，类也可以被创建（例如 `Activity` 字段会在 `onCreate()` 之前初始化），而且从未被使用过的实例永远不会被创建。当在函数体内需要立即使用该值时，请使用 `get()`。

`inject()` 接收一个 `mode` 形参，其类型为 Kotlin 的 `LazyThreadSafetyMode`。在 JVM 上默认值为 `SYNCHRONIZED`。

## `get()` 与 `inject()` 的可用范围 {id="where-get-and-inject-are-available"}

你可以在以下位置调用 `get()` 和 `by inject()`：

- Android 类：`Activity`、`Fragment`、`Service` 以及其他 `ComponentCallbacks`，无需实现额外接口。参见 [Android 入口点](/docs/reference/koin-android/entry-points)。
- 任何实现了 `KoinComponent` 的类。参见 [KoinComponent](/docs/reference/koin-core/koin-component)。
- `Koin` 实例：`KoinPlatform.getKoin().get<UserService>()` 使用全局容器，而 `koinApp.koin.get<UserService>()` 则使用隔离容器。
- 在定义内部（Classic DSL）：`get()`、`inject()`、`getOrNull()`、`injectOrNull()` 和 `getAll()` 从当前作用域进行解析。

平台 API 遵循相同的规则，但使用了各自的专属名称：

- Compose：`koinInject()` 和 `koinViewModel()`。参见 [Koin for Compose](/docs/reference/koin-compose/compose)。
- Android ViewModel：`by viewModel()` 和 `by activityViewModel()`。参见 [Android ViewModel](/docs/reference/koin-android/viewmodel)。
- Ktor：在 `Application`、`Route` 以及 `ApplicationCall` 中使用 `by inject()`。参见 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 可选依赖项 {id="optional-dependencies"}

当某个定义可能不存在时，请使用可空变体。它们会返回 `null`，而不会抛出 `NoDefinitionFoundException`：

```kotlin
val koin = KoinPlatform.getKoin()

val tracker: Tracker? = koin.getOrNull()
val crashReporter: CrashReporter? by koin.injectOrNull()
```

`getOrNull()` 和 `injectOrNull()` 存在于 `Koin`、`Scope` 以及定义内部。`KoinComponent` 接口仅提供 `get()` 和 `inject()`：在其中请调用 `getKoin().getOrNull<T>()`。

对于构造函数形参，将其声明为可空（`tracker: Tracker?`），当不存在对应定义时，Koin 会传入 `null`。参见[构造函数形参](/docs/reference/koin-core/definitions#constructor-parameters)。

如果 Koin 本身可能尚未启动（例如在某个库中），`KoinPlatform.getKoinOrNull()` 会返回 `null` 而不是抛出异常。

## 某个类型的所有实例 {id="all-instances-of-a-type"}

`getAll<T>()` 返回所有定义中绑定到类型 `T` 的每个实例：

```kotlin
val koin = KoinPlatform.getKoin()

val interceptors: List<Interceptor> = koin.getAll()
```

该列表包含主类型或绑定类型为 `T` 的每个定义（无论是否带有限定符）。如果没有匹配项，列表为空。对于构造函数形参，声明 `List<Interceptor>` 形参也具有相同的效果。集合模式在[高级模式](/docs/reference/koin-core/advanced-patterns)中介绍。

## 调用站点的限定符与形参 {id="qualifiers-and-parameters-at-the-call-site"}

每个获取函数均可接收限定符和形参代码块：

```kotlin
val localDb: Database by inject(named("local"))

val presenter: UserPresenter = get { parametersOf(userId) }

val detail: DetailPresenter = get(named("compact")) { parametersOf(itemId) }
```

- 限定符（Qualifier）：在相同类型的多个定义中选取一个。参见[限定符](/docs/reference/koin-core/qualifiers)。
- 形参（Parameters）：仅调用方知晓的值，用于传递给定义。参见[注入形参](/docs/reference/koin-core/injection-parameters)。

使用 `by inject()` 时，形参代码块在首次访问时执行，因此它可以读取在构造后设置的属性。

## 当解析失败时 {id="when-resolution-fails"}

当没有与类型及限定符匹配的定义时，`get()` 会抛出 `NoDefinitionFoundException`。使用 `by inject()` 时，异常会在首次访问该属性时抛出，而不是在声明该属性的位置。借助编译器插件，`get()` 和 `inject()` 调用还会在构建时根据启动调用的依赖关系图进行检查。

有关常见错误以及如何解读 Koin 的提示信息，参见[故障排除](/docs/reference/koin-core/troubleshooting)。

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：构造函数注入以及形参的解析方式。
- [KoinComponent](/docs/reference/koin-core/koin-component)：让任意类具备访问 `get()` 和 `inject()` 的能力。
- [Android 入口点](/docs/reference/koin-android/entry-points)：在 Activity、Fragment、Service、Receiver 和 View 中进行注入。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()` 与其他 Compose API。
- [作用域](/docs/reference/koin-core/scopes)：从作用域而非根容器中获取实例。