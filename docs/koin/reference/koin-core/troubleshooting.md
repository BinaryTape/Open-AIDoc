---
title: 故障排除
---

# 故障排除

本页列出了 Koin 报告的错误、其产生的原因以及修复方法。此外还介绍了在问题波及用户之前发现问题的工具，以及导致这些错误的代码模式。文中的错误信息均按 Koin 实际输出的内容引用，因此你可以在页面中直接搜索堆栈跟踪中的文本。

## 尽早发现问题 {id="find-problems-early"}

Koin 为你提供了三种发现配置错误的方式，按发现时间从早到晚依次为：

- **编译时**：借助 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)，缺失依赖项或循环依赖会导致构建失败。错误信息会指明具体的定义、形参和模块。有关各项检查和错误代码的详细信息，请参阅[编译时安全](/docs/reference/koin-compiler/compile-safety)。
- **在 IDE 中**：在编写代码时，[Koin IDE 插件](/docs/tooling/ide-plugin)会显示每个定义的声明位置、使用位置以及缺失的内容。
- **在测试中**：如果不使用 Compiler Plugin，可以在 JVM 单元测试中对模块调用 `verify()`。它会检查每个构造函数形参是否都具有对应的定义。请参阅[验证你的配置](/docs/reference/koin-test/verify)。

```kotlin
class ModuleCheckTest {

    @Test
    fun checkKoinModules() {
        appModule.verify()
    }
}
```

## 日志记录 {id="logging"}

Koin 默认不记录任何日志（`EmptyLogger`）。开启日志记录以查看每个定义的加载以及每个实例的解析：

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

| 级别 | 显示内容 |
|-------|--------------|
| `Level.DEBUG` | 每次解析的详细信息，包含 Koin 搜索过的作用域。可用于排查失败原因 |
| `Level.INFO` | 启动摘要，例如 `Started 42 definitions in 1.2 ms`。这是 `printLogger()` 的默认级别 |
| `Level.WARNING` | 警告信息，例如某个定义重写了另一个定义 |
| `Level.ERROR` | 仅错误信息 |
| `Level.NONE` | 无 |

在 Android 上，使用 `androidLogger(Level.DEBUG)` 写入 Logcat。有关记录器选项，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

`Level.DEBUG` 会降低解析速度。请仅在调试会话中使用，避免用于发布构建。

## 运行时错误 {id="runtime-errors"}

### 未找到定义 (No definition found) {id="no-definition-found"}

```
NoDefinitionFoundException: No definition found for type 'com.example.UserRepository' on scope '['_root_']'.
Check or add definition for type 'com.example.UserRepository' in scope '_root_'.
```

Koin 请求获取某个类型，但没有任何已加载的模块声明该类型。请按以下顺序排查：

- **模块未加载**：定义存在，但其所在模块未包含在 `modules(...)` 或 `includes(...)` 中。
- **缺少限定符**：定义包含限定符而请求中没有，或者反之亦然。此时错误信息会包含 `and qualifier '...'`。请参阅[限定符](/docs/reference/koin-core/qualifiers)。
- **未绑定接口**：定义声明了 `UserRepositoryImpl`，但请求需要的是 `UserRepository`。请绑定该接口，详见[定义](/docs/reference/koin-core/definitions#interface-binding)。
- **作用域错误**：定义被 `scoped` 限定在某个作用域内，而请求来自其他作用域或根作用域。错误信息会列出搜索过的作用域。请参阅[作用域](/docs/reference/koin-core/scopes)。

对于 `SavedStateHandle`，错误信息则会提示其由 ViewModel 的 `CreationExtras` 提供。请使用 `koinViewModel()` 或 `by viewModel()` 解析 ViewModel，并将 `SavedStateHandle` 作为构造函数形参传入。请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

### 无法创建实例 (Could not create instance) {id="could-not-create-instance"}

```
InstanceCreationException: Could not create instance for '[Singleton: 'com.example.UserRepository']'
```

Koin 找到了对应的定义，但在创建实例时抛出了异常。根本原因在于堆栈跟踪中的嵌套异常（`Caused by:`）。通常是因为某个构造函数形参抛出了 `NoDefinitionFoundException`，或者构造函数本身抛出了异常。

### 已存在定义 (Already existing definition) {id="already-existing-definition"}

```
DefinitionOverrideException: Already existing definition for [Singleton: 'com.example.ApiService'] at com.example.ApiService::_root_
```

两个模块声明了相同的类型和限定符，且已关闭重写功能（`allowOverride(false)`）。请移除重复项、为其指定[限定符](/docs/reference/koin-core/qualifiers)，或者使用 `.override()` 标记需要保留的定义。请参阅[定义](/docs/reference/koin-core/definitions#overriding-a-definition)。

### 作用域错误 (Scope errors) {id="scope-errors"}

| 消息 | 异常 | 原因 |
|---------|-----------|-------|
| `Scope 'user_session' is closed` | `ClosedScopeException` | 作用域已关闭，但仍有调用在向其请求实例。通常是由于回调或协程的生命周期超出了屏幕的生命周期 |
| `No scope found for id 'user_session'` | `ScopeNotCreatedException` | 在调用 `createScope(id, ...)` 之前调用了 `getScope(id)`。请改用 `getOrCreateScope` 或先创建作用域 |
| `Scope with id 'user_session' is already created` | `ScopeAlreadyCreatedException` | 使用相同的 ID 调用了两次 `createScope` |
| `No value for scope 'user_session' in [Scoped: ...]` | `MissingScopeValueException` | 通过 `declare()` 声明的作用域值未提供给该作用域 |
| `Activity should implement AndroidScopeComponent` | `IllegalStateException` | 在没有作用域的 Activity 中使用了 Android 作用域 API。请参阅 [Android 作用域](/docs/reference/koin-android/scope) |

有关作用域生命周期的详细信息，请参阅[作用域](/docs/reference/koin-core/scopes)。

### 注入形参 (Injected parameters) {id="injected-parameters"}

| 消息 | 异常 | 原因 |
|---------|-----------|-------|
| `Can't get injected parameter #0 from DefinitionParameters[] for type 'kotlin.String'` | `NoParameterFoundException` | 定义读取了一个形参，但调用方未通过 `parametersOf(...)` 传入该实参 |
| `No value found for type 'kotlin.String'` | `DefinitionParameterException` | `params.get<T>()` 未找到该类型的形参 |

请参阅[注入形参](/docs/reference/koin-core/injection-parameters)。

### 启动与属性 (Start and properties) {id="start-and-properties"}

| 消息 | 异常 | 原因 |
|---------|-----------|-------|
| `KoinApplication has not been started` | `IllegalStateException` | 在 `startKoin` 之前，代码使用了全局上下文（`KoinComponent`、`by inject()`）。在 Android 上，请检查是否在清单中声明了你的 `Application` 类 |
| `A Koin Application has already been started` | `KoinApplicationAlreadyStartedException` | `startKoin` 被调用了两次。在测试中，每次测试后请调用 `stopKoin()` |
| `Can't resolve Context instance. Please use androidContext() function in your KoinApplication configuration.` | `MissingAndroidContextException` | 某个定义使用了 `androidContext()`，但 `startKoin` 中缺少 `androidContext(this)` |
| `Property 'api_url' not found` | `MissingPropertyException` | 调用了 `getProperty("api_url")`，但该属性不存在且未提供默认值 |
| `No properties found for file '/koin.properties'` | `NoPropertyFileFoundException` | `fileProperties()` 未找到该文件 |

### 未应用 Compiler Plugin (Compiler Plugin not applied) {id="compiler-plugin-not-applied"}

```
NotImplementedError: Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.
```

代码使用了 Compiler Plugin DSL（`single<T>()`、`factory<T>()`、`startKoin<T>()`），但该 Gradle 模块尚未应用该插件。请参阅 [Compiler Plugin 配置](/docs/setup/compiler-plugin)。

## 循环依赖 {id="circular-dependencies"}

当两个类的构造函数互相依赖彼此创建时，就会发生循环依赖：

```kotlin
class SessionManager(private val authService: AuthService)
class AuthService(private val sessionManager: SessionManager)
```

使用 Compiler Plugin 时，构建将失败：

```
[Koin][KOIN-D004] Circular dependency detected:
  com.example.AuthService → com.example.SessionManager → com.example.AuthService
  Break with Lazy<T> injection or refactor to remove the cycle.
```

使用 `verify()` 时，测试会失败并提示 `Circular injection between ... Fix your Koin configuration!`。

如果不进行这些检查，Koin 将无法检测到循环依赖。两个类会反复互相解析，直至调用堆栈溢出，应用崩溃并抛出 `StackOverflowError`。

### 使用 Lazy 打破循环依赖 {id="break-the-cycle-with-lazy"}

将其中一方设为延迟加载，使其在首次使用时才进行解析，而不是在构造期间：

**Compiler Plugin DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single<SessionManager>()
    single<AuthService>()
}
```

**注解**
```kotlin
@Singleton
class SessionManager(private val authService: AuthService)

@Singleton
class AuthService(private val sessionManager: Lazy<SessionManager>)
```

**构造函数 / 经典 DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single { SessionManager(get()) }
    single { AuthService(inject()) }
}
```

`AuthService` 绝不能在其构造函数或 `init` 代码块中读取 `sessionManager.value`，否则循环依赖仍会发生。

### 消除循环依赖 {id="remove-the-cycle"}

使用延迟加载形参只是掩盖了问题，依然保留了耦合。大多数循环依赖意味着这两个类共用了某种职责。应将其移至两个类都依赖的第三个类中，或者让其中一方依赖一个仅公开其所需内容的接口。

```kotlin
class TokenStore

class SessionManager(private val tokenStore: TokenStore)
class AuthService(private val tokenStore: TokenStore)
```

## 导致错误的代码模式 {id="patterns-that-cause-errors"}

**在方法内部解析**：在类体内部调用 `get()` 或使用 `KoinComponent` 会隐藏其依赖关系。Compiler Plugin 无法检查这些依赖，缺失定义的情况只有在方法运行时才会暴露。建议优先使用构造函数形参。有关需要使用该特性的场景，请参阅 [KoinComponent](/docs/reference/koin-core/koin-component)。

```kotlin
// 隐式依赖，延迟解析
class UserViewModel : ViewModel(), KoinComponent {
    fun loadUser() {
        val repository = get<UserRepository>()
    }
}

// 显式依赖，在构建时检查
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**自行创建依赖项**：在类内部直接使用 `private val api = ApiService()` 会绕过 Koin。这样将导致该类无法使用测试替身进行测试，并且其依赖项也无法得到检查。

**为不同类型添加限定符**：仅当多个定义提供相同类型时，才需要使用限定符。`UserRepository` 和 `OrderRepository` 本就属于不同类型，无需限定符。

**在定义内部执行业务逻辑**：定义应当仅用于创建对象，而不应执行业务逻辑。`single { }` lambda 中的副作用操作会在无法预料的时间点（首次使用时）执行；若设置了 `createdAtStart`，则会在主线程上执行。请将此类逻辑保留在类内部，或者将启动任务移至[延迟模块 (Lazy Modules)](/docs/reference/koin-core/lazy-modules)。

**整个应用共用一个模块**：单个庞大的模块在测试中难以重写，也难以进行延迟加载。请按功能或架构分层拆分模块。请参阅[模块](/docs/reference/koin-core/modules)。

**作用域关闭后仍保留作用域实例**：如果在 `single` 或静态字段中保存了作用域实例的引用，会导致该实例在作用域关闭后依然存活，后续的调用可能会触发 `ClosedScopeException`。请仅将作用域实例注入到生命周期相同或更短的对象中。

:::tip
某些问题仅在真机上才会显现：启动时解析缓慢、作用域从未关闭、罕见路径下的崩溃等。若要在真实用户会话中观察这些问题，请参阅[生产环境监控](/docs/tooling/production-monitoring)。
:::

## 相关内容 {id="related"}

- [编译时安全](/docs/reference/koin-compiler/compile-safety)：各项构建时检查及其错误代码。
- [验证你的配置](/docs/reference/koin-test/verify)：在不使用 Compiler Plugin 的情况下通过测试检查模块。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：记录器与启动选项。
- [作用域](/docs/reference/koin-core/scopes)：作用域生命周期与关闭。
- [IDE 插件](/docs/tooling/ide-plugin)：在编写代码时直观查看依赖关系图。