---
title: "@Monitor"
---

# @Monitor

`@Monitor` 用于将类或函数标记以进行跟踪。在构建期，Koin 编译器插件会将每个受监控的函数包装在 Kotzilla SDK 跟踪调用中，从而使其执行时间和错误显示在 Kotzilla 平台中。本页面介绍了该注解在有无 Kotzilla SDK 时的作用。前提是已配置好 [Koin 编译器插件](/docs/setup/compiler-plugin)。

## 无 Kotzilla 时的内置监控 {id="built-in-monitoring-without-kotzilla"}

Koin 在运行时查看运行状态的内置方式是记录器。它会将模块加载和实例创建输出到控制台或 Logcat。请参阅[日志记录](/docs/reference/koin-core/starting-koin#logging)。

`@Monitor` 本身不会添加任何内容。如果编译类路径中没有 Kotzilla SDK，编译器插件会保持受监控的函数不变，并在每次编译时报告一条警告：

```
KOIN-M001: @Monitor: Kotzilla SDK not found on classpath - monitoring disabled
```

代码的编译和运行方式与未添加该注解时完全相同。你可以将 `@Monitor` 保留在共享代码中，并仅在需要跟踪的构建中添加 SDK。

## 为类或函数添加注解 {id="annotating-a-class-or-a-function"}

`@Monitor` 位于 `org.koin.core.annotation` 中，与其他 Koin 注解并列。将其放在类上可跟踪其所有 public 函数，或者将其直接放在单个函数上：

```kotlin
import org.koin.core.annotation.Monitor

@Monitor
class UserService(private val userRepository: UserRepository) {

    fun findUser(id: String): User? = userRepository.findById(id)

    suspend fun createUser(userData: UserData): User = userRepository.save(userData)

    private fun audit(user: User) { ... } // private: 不会被跟踪
}

class SyncService(private val api: ApiService) {

    @Monitor
    suspend fun sync() { ... }
}
```

无论通过何种风格声明类（注解或任何 DSL 形式，如编译器插件、构造函数或经典 DSL），该注解的工作方式都相同。ViewModel 也可以被监控：

```kotlin
@Monitor
class DetailViewModel(private val repository: Repository) : ViewModel() {
    fun loadData(id: String): StateFlow<Data> = repository.getData(id)
}
```

## 编译器插件生成的内容 {id="what-the-compiler-plugin-generates"}

当类路径中存在 Kotzilla SDK 时，编译器插件会重写每个受监控函数的主体。`UserService` 类中的 `findUser` 编译后的效果如同你编写了以下代码：

```kotlin
fun findUser(id: String): User? =
    KotzillaCore.getDefaultInstance().trace("UserService.findUser") {
        userRepository.findById(id)
    }
```

规则：

- **标签**：`ClassName.functionName`，顶层函数则为函数名称。
- **挂起函数**：使用 `suspendTrace` 而非 `trace` 进行包装。
- **类级 `@Monitor`**：仅跟踪 public 函数。private、protected 和 internal 函数、构造函数以及默认属性访问器均不会被跟踪。
- **无需代理，无需 `allOpen`**：直接在原地重写函数体。类仍保持为 final，Koin 照常创建它。

在构建期间，插件会报告每个受监控的类：

```
@Monitor: UserService - tracing enabled (2 functions)
```

该消息默认是一条警告。如果你的构建使用了 `allWarningsAsErrors`，请在 `koinCompiler { }` 代码块中设置 `logSeverity = "info"`：请参阅[编译器插件选项](/docs/reference/koin-annotations/options)。

## 配合 Kotzilla SDK 使用 {id="with-the-kotzilla-sdk"}

`@Monitor` 在两个阶段需要 Kotzilla SDK：

- **构建期**：类 `io.kotzilla.sdk.KotzillaCore` 必须位于编译类路径上。通过 `io.kotzilla:kotzilla-core` 引入的 `io.kotzilla:kotzilla-sdk` 依赖项会提供该类。
- **运行时**：必须在 Koin 配置中启动 SDK，以便记录并发送跟踪。

两者均属于[生产监控](/docs/tooling/production-monitoring)中所述的标准 Kotzilla 配置的一部分。SDK 运行后，对受监控函数的每次调用都会记录其耗时以及抛出的错误（如果有）。你可以在 Kotzilla 控制台中查看它们。

:::warning
生成的代码会调用 `KotzillaCore.getDefaultInstance()`。请在应用启动时、任何受监控函数运行之前启动 Kotzilla SDK。
:::

## 配合 Koin Annotations (KSP) 使用 {id="with-koin-annotations-ksp"}

使用 KSP 处理器（`koin-ksp-compiler`，Koin Annotations 2.2.0 及更高版本）时，`@Monitor` 的工作方式有所不同。KSP 无法重写函数体，因此它会生成一个名为 `<ClassName>Proxy` 的子类，通过跟踪调用重写每个 public 函数，并且 Koin 定义会使用此代理。这会带来两个后果：

- **Open 类**：受监控的类必须为 open。使用 `annotation("org.koin.core.annotation.Monitor")` 配置 `allOpen` Gradle 插件。
- **仅限定义**：仅属于 Koin 定义的类才会被代理。

编译器插件取代了这一机制。请参阅[从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。

## 局限性 {id="limits"}

- **无传递跟踪**：仅跟踪带有注解的类或函数。注入到受监控类中的依赖项不会被跟踪，除非它们也带有 `@Monitor`。
- **无本地数据**：没有 Kotzilla SDK 则不会记录任何内容。对于本地调试，请使用 [Koin 记录器](/docs/reference/koin-core/starting-koin#logging)。
- **开销**：每个受监控的调用都会经过一次跟踪调用。建议仅对需要度量的函数添加注解，而不是对每个类都添加。

## 相关内容 {id="related"}

- [生产监控](/docs/tooling/production-monitoring)：配置用于记录跟踪的 Kotzilla SDK。
- [生产与工具](/docs/tooling)：针对不同需求选用相应工具。
- [启动 Koin](/docs/reference/koin-core/starting-koin#logging)：用于本地调试的 Koin 记录器。
- [编译器插件选项](/docs/reference/koin-annotations/options)：`logSeverity` 及其他插件设置。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有 Koin 注解清单。