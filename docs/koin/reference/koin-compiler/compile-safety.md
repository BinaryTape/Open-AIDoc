---
title: 编译时安全性
---

# 编译时安全性

Koin 编译器插件会在代码编译时检查依赖项图。缺失的定义、错误的限定符或循环依赖会导致构建失败，并指出对应的文件和行号，而不是在运行时发生崩溃。本页介绍了检查的内容、具体的诊断信息以及插件无法检查的情况。本文假设你已安装该插件（请参阅[编译器插件安装](/docs/setup/compiler-plugin)）。

编译时安全性默认处于启用状态（`compileSafety = true`，请参阅[编译器插件选项](/docs/reference/koin-annotations/options)）。

## 检查运行的位置 {id="where-the-checks-run"}

插件在两个层面上进行检查。

**完整图**：在每个 Koin 入口点处，插件会从你的源代码和依赖项 JAR 中装配该入口点加载的所有模块，并根据该完整图检查每个定义。

**调用站点**：检查每一个 `get<T>()`、`inject<T>()`、`koinInject<T>()`、`koinViewModel<T>()`、`by viewModel()` 及类似的调用：`T` 必须存在于已装配的图中。如果某个特性模块发起了调用但无法看到完整图，插件会在已编译的模块中留下提示。app 模块会在编译时从其依赖项中读取这些提示并进行检查。

可识别的入口点：

| 入口点 | 示例 |
|-------------|---------|
| `startKoin` | `startKoin<MyApp>()`、`startKoin { modules(appModule) }` |
| `koinApplication` | `koinApplication { modules(appModule) }` |
| `koinConfiguration` | `koinConfiguration<MyApp>()` |
| `@KoinApplication` | `@KoinApplication object MyApp` |
| `withConfiguration<T>()` | `startKoin { withConfiguration<MyApp>() }` |
| Ktor `install(Koin)` | `install(Koin) { modules(appModule) }` |

`modules(...)` 接受插件能够追踪的列表：`listOf(...)`、`+`、`.toList()`、顶级 `val`，或返回 `List<Module>` 的函数：

```kotlin
val dataModules = listOf(databaseModule, networkModule)
fun featureModules(): List<Module> = listOf(loginModule, profileModule)

startKoin {
    modules(dataModules + featureModules())
}
```

声明为函数的模块（`fun dataModule(): Module = module { ... }`）会像顶级 `val` 一样被追踪。

:::note
自身没有入口点的 Gradle 模块（库、大多数特性模块）在自身编译期间不会收到依赖缺失相关的诊断信息。单独检查的模块无法获知应用将如何对其进行装配。其定义会在 app 模块装配图时进行检查。插件会在构建输出中提示：

```
[Koin] compile-safety validation skipped — no Koin entry point in this compilation.
```
:::

## 检查的内容 {id="what-is-checked"}

| 情况 | 结果 |
|------|--------|
| 非可空形参，无定义 | 错误 |
| 可空形参 (`T?`)，无定义 | 正常，通过 `getOrNull()` 解析 |
| 带默认值的形参，无定义 | 正常，使用 Kotlin 默认值（使用 `skipDefaultValues = true`） |
| 带默认值和限定符 (`@Named`) 的形参 | 错误，限定符强制进行解析 |
| `@InjectedParam` 形参 | 正常，在运行时通过 `parametersOf()` 传递 |
| `@Property("key")` 形参 | 正常。如果不存在 `@PropertyValue("key")` 默认值，则发出警告 |
| `List<T>` 形参 | 正常，若无匹配项则 `getAll()` 返回空列表 |
| `Lazy<T>`，无 `T` 的定义 | 错误，检查内部类型 |
| `@Named("x")` 形参，没有带该限定符的定义 | 错误，若该类型存在带其他限定符的定义则给出提示 |
| 在另一个作用域中声明的作用域依赖项 | 错误 |
| 循环依赖（A 需要 B，B 需要 A） | 错误 |
| `@Provided` 类型或形参 | 正常，在图外部提供 |
| `@ScopeId` 形参 | 正常，在运行时从命名作用域中解析 |
| `Scope` 形参 | 正常，传入当前作用域 |
| Android 框架类型（`Context`、`SavedStateHandle` 等） | 正常，内置列表 |
| `get<T>()` / `inject<T>()` 且无 `T` 的定义 | 错误 |
| 当 `T` 带有 `@InjectedParam` 时，`get<T>()` 未携带 `parametersOf()` | 错误 |
| `parametersOf(...)` 实参数量或类型不正确 | 错误 |

每个形参类型的解析规则详见[定义](/docs/reference/koin-core/definitions#constructor-parameters)。

## 按声明风格划分的检查 {id="checks-per-declaration-style"}

每种风格和 DSL 形式都会针对同一个图进行检查。它们可以共存于同一个项目中：DSL 定义可以依赖注解类，反之亦然。

**编译器插件 DSL**
```kotlin
val appModule = module {
    single<Database>()
    single<UserRepository>()      // 已检查：Database 存在
    viewModel<UserViewModel>()    // 已检查：UserRepository 存在
}
```

插件读取构造函数后，生成解析调用并检查每个形参。`create(::function)` 以相同的方式针对函数形参进行检查：

```kotlin
fun buildUserRepository(db: Database): UserRepository = UserRepository(db)

val appModule = module {
    single { create(::buildUserRepository) }    // 已检查：Database 存在
}
```

**注解**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val db: Database)    // 已检查：Database 存在

@KoinViewModel
class UserViewModel(private val repo: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
object MyApp
```

`startKoin<MyApp>()` 是入口点：插件会检查通过 `@ComponentScan` 找到的每一个定义。带有注解的顶级函数会像类一样被检查：

```kotlin
@Factory
fun provideCache(db: Database): CacheService = RedisCache(db)    // 已检查：Database 存在
```

带有 `@Configuration` 标签的模块会与请求其标签的 `@KoinApplication` 一同装配（跨 Gradle 模块），并一起进行检查。

**构造函数 / 经典 DSL**
构造函数引用会像编译器插件 DSL 一样被检查：

```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)        // 已检查：Database 存在
    viewModelOf(::UserViewModel)      // 已检查：UserRepository 存在
    scope<UserSession> {
        scopedOf(::SessionCache)
    }
}
```

`singleOf`、`factoryOf`、`scopedOf`、`viewModelOf` 和 `new(::T)` 保留其运行时行为。插件只是添加了检查，并没有重写它们。

对于自行编写的 lambda，插件不会读取构造函数。它会像检查任何调用站点一样，检查 lambda 内部的 `get()`、`inject()` 和 `getOrNull()` 调用：

```kotlin
val appModule = module {
    single { UserRepository(get()) }  // 已检查：get() 调用需要 Database
}
```

:::warning
自编译器插件 1.2.0 起，`singleOf`、`factoryOf`、`scopedOf` 和 `viewModelOf` 均会进行检查。依赖这些函数中缺失依赖项的代码将不再能够编译。以前的构建掩盖了运行时的崩溃。
:::

## 诊断信息 {id="diagnostics"}

每个诊断信息都有一个固定的代码，输出格式为 `[Koin][CODE]`。你可以搜索该代码或消息的第一行。

### 缺失依赖项 (KOIN-D001) {id="missing-dependency-koin-d001"}

定义形参在图中没有对应的定义：

```
[Koin][KOIN-D001] Missing dependency: com.myapp.Database
  required by: com.myapp.UserRepository (parameter 'db')
  in module: com.myapp.AppModule
```

对于 DSL 定义，`required by:` 以 `dsl:` 开头。当该类型存在带有其他限定符的定义时，会附带提示：

```
[Koin][KOIN-D001] Missing dependency: com.myapp.NetworkClient qualified with @Named("http")
  required by: com.myapp.ApiService (parameter 'client')
  in module: com.myapp.AppModule
  Hint: Found similar binding: com.myapp.NetworkClient (no qualifier)
```

解决办法：声明缺失的定义，将声明该定义的模块添加到 `modules()` 或 `includes()` 中，或者修正限定符（请参阅[限定符](/docs/reference/koin-core/qualifiers)）。

### 调用站点缺失定义 (KOIN-D002, KOIN-D003) {id="missing-definition-at-a-call-site-koin-d002-koin-d003"}

`get<T>()`、`inject<T>()` 或 `koinViewModel<T>()` 调用所请求的类型在任何已加载的模块中均未声明：

```
[Koin][KOIN-D002] Missing definition: com.myapp.Tracker
  resolved by: get<Tracker>()
  No matching definition found in any loaded module.
  Check your declaration with Annotation or DSL.
```

`KOIN-D003` 是在依赖模块中发起的调用发生相同错误时的报错，会在编译 app 模块时报告。其第二行显示为 `required by a call site in a dependency module`。

### 循环依赖 (KOIN-D004) {id="circular-dependency-koin-d004"}

```
[Koin][KOIN-D004] Circular dependency detected:
  com.myapp.A → com.myapp.B → com.myapp.A
  Break with Lazy<T> injection or refactor to remove the cycle.
```

`Lazy<T>`、可空、`List<T>`、`@InjectedParam`、`@Provided`、`@Property`、`@ScopeId` 或带默认值的形参在循环检查中不计为依赖边。将其中一个形参更改为 `Lazy<T>` 可以打破循环。有关消除循环的方法，请参阅[故障排除](/docs/reference/koin-core/troubleshooting)。

### 注入形参 (KOIN-D005, KOIN-D006) {id="injected-parameters-koin-d005-koin-d006"}

定义声明了 `@InjectedParam` 形参，而调用站点未传入它们：

```
[Koin][KOIN-D006] com.myapp.Greeter requires 1 injected param(s) but get<Greeter>() has no parametersOf(...) at the call site.
  Expected @InjectedParam slots: name: kotlin.String
  Pass them via parametersOf(...) inside the trailing lambda.
```

`KOIN-D005` 报告实参数量或类型不匹配的 `parametersOf(...)`（`Mismatched parametersOf(...) for ...`）。这两项检查仅在调用中包含插件可读取的 `parametersOf(...)` 时才会运行。请参阅[注入形参](/docs/reference/koin-core/injection-parameters)。

### 不支持的挂起绑定 (KOIN-D007) {id="unsupported-suspend-binding-koin-d007"}

类型扩展自挂起函数类型的定义会被拒绝，因为 Koin 无法在运行时解析它：

```kotlin
fun interface SetUsernameUseCase : suspend (String) -> Unit

@Factory
fun provideSetUsernameUseCase(repository: UserRepository): SetUsernameUseCase =
    SetUsernameUseCase(repository::setUsername)
```

```
[Koin][KOIN-D007] Unsupported binding: com.myapp.SetUsernameUseCase extends kotlin.coroutines.SuspendFunction1
  Suspend function injection is not yet supported by Koin runtime.
  Remove the @Single / @Factory / @Scoped registration, or refactor the binding type to not extend a suspend function.
  Tracked at https://github.com/InsertKoinIO/koin-compiler-plugin/issues/16
```

修复方式：使用带有 `suspend` 方法的普通接口，或者使用类。

### 所有代码 {id="all-codes"}

| 代码 | 严重级别 | 消息起始内容 |
|------|----------|---------------------|
| `KOIN-D001` | 错误 | `Missing dependency:` |
| `KOIN-D002` | 错误 | `Missing definition:`（当前模块中的调用站点） |
| `KOIN-D003` | 错误 | `Missing definition:`（依赖模块中的调用站点） |
| `KOIN-D004` | 错误 | `Circular dependency detected:` |
| `KOIN-D005` | 错误 | `Mismatched parametersOf(...) for` |
| `KOIN-D006` | 错误 | `<Type> requires N injected param(s) but` |
| `KOIN-D007` | 错误 | `Unsupported binding:` |
| `KOIN-D008` | 错误 | `Module id collision:`（两个模块名称编码为相同的提示名称：请重命名其中一个） |
| `KOIN-W001` | 警告 | `Module '<name>' is not loaded at startKoin` |
| `KOIN-W003` | 警告 | `Graph not verifiable at compile time:` |
| `KOIN-W004` | 警告 | `Custom @Configuration label '<label>' requested by` |
| `KOIN-W005` | 警告 | `Definition '<name>' in dependency module` |
| `KOIN-W006` | 警告 | `<definition>'s bind(...) argument could not be resolved` |
| `KOIN-A001` | 错误 | `@KoinViewModel definition '<name>' cannot be generated`（添加 `io.insert-koin:koin-core-viewmodel`） |
| `KOIN-A002` | 错误 | `@KoinWorker definition '<name>' cannot be generated`（添加 `io.insert-koin:koin-android-workmanager`） |
| `KOIN-A003` | 错误 | `Cannot generate <Module>.module()`（添加 `io.insert-koin:koin-core`） |
| `KOIN-S001` | 错误 | `create(::<Type>) must be the only instruction in the lambda`（请参阅 [unsafeDslChecks](/docs/reference/koin-annotations/options#unsafedslchecks)） |
| `KOIN-P001` | 警告 | `Missing @PropertyValue default:` |
| `KOIN-M001` | 警告 | `@Monitor: Kotzilla SDK not found on classpath` |

警告描述了插件无法检查的内容。`KOIN-W003`、`KOIN-W004` 和 `KOIN-W005` 在[局限性](#limits)中进行了说明。`KOIN-W006` 表示 `bind`/`binds` 实参不是字面量 `X::class`（或字面量数组/列表）：请使用字面量。

## 外部类型：`@Provided` {id="external-types-provided"}

某些类型是从 Koin 声明之外进入图的：例如平台对象、SDK 实例、或者在运行时手动添加的定义。请使用 `@Provided` 标记它们，以便插件不会将其报告为缺失：

```kotlin
// 标注在类上：跳过该类型的所有使用
@Provided
class FirebaseAnalytics

// 标注在形参上：仅跳过此形参
@Singleton
class PaymentProcessor(@Provided val gateway: PaymentGateway)
```

`@Provided`（`org.koin.core.annotation`）适用于所有声明风格：即使定义位于 DSL 模块中，也可以注解该类或构造函数形参。它仅会改变编译时检查。在运行时，该类型仍会使用 `get()` 进行解析，如果未在任何地方声明，依然会失败。推荐使用形参形式：标注在类上时，会关闭对该类型所有用法的检查。

以下类型无需 `@Provided` 即可直接接受：

- `android.content.Context`
- `android.app.Application`
- `android.app.Activity`
- `androidx.activity.ComponentActivity`
- `androidx.fragment.app.Fragment`
- `androidx.lifecycle.SavedStateHandle`
- `androidx.work.WorkerParameters`

### 运行时加载的模块 {id="modules-loaded-at-runtime"}

在 `startKoin` 之后通过 `loadKoinModules(...)` 加载的模块不属于插件装配的图的一部分。插件无法获知该调用何时执行，或者是否会执行。仅来源于此类模块的类型必须标记为 `@Provided`：

```kotlin
val featureModule = module { single<Repository>() }   // 稍后加载
val appModule = module { single<Service>() }          // Service(@Provided val repo: Repository)

startKoin { modules(appModule) }
loadKoinModules(featureModule)
```

插件仍会通过 `KOIN-W001` 将运行时加载的模块报告为不可达。如果将其添加到 `modules()` 会违背按需加载的初衷，因此你可以忽略此警告（仅在开启 `allWarningsAsErrors` 时会导致构建失败）。

## 特殊形参 {id="special-parameters"}

**Scope**：`org.koin.core.scope.Scope` 类型的形参会接收当前作用域。不对其进行检查，因为代码会从其中动态解析类型。

```kotlin
@Scoped
class ScopedService(val scope: Scope) {
    fun load() = scope.get<SomeDependency>()
}
```

**@ScopeId**：通过名称（`@ScopeId(name = "user_session")`）或类型（`@ScopeId(UserSessionScope::class)`，作用域 ID 为完整类名）从另一个作用域解析形参。不对其进行检查，因为该作用域仅在运行时存在。请参阅[作用域](/docs/reference/koin-core/scopes)。

**@Property**：形参读取 Koin 属性。如果未声明 `@PropertyValue("key")` 默认值，构建将收到警告，且该属性必须在启动时设置：

```kotlin
@PropertyValue("api.timeout")
val defaultTimeout = 30

@Factory
class ApiClient(@Property("api.timeout") val timeout: Int)    // 正常

@Factory
class Other(@Property("missing.key") val value: String)
// [Koin][KOIN-P001] Missing @PropertyValue default: "missing.key" ...
```

**默认值**：在 `skipDefaultValues = true`（默认值）的情况下，带有 Kotlin 默认值的形参会直接使用默认值，并且不会被检查。请参阅 [skipDefaultValues](/docs/reference/koin-annotations/options#skipdefaultvalues)。

## 泛型类型 {id="generic-types"}

Koin 基于类型擦除后的类来解析定义：类型实参不作为查找键的一部分。插件遵循相同的规则。`get<Box<Int>>()` 会匹配任意 `Box` 定义进行检查，且 `single<Box<A>>()` 和 `single<Box<B>>()` 属于同一个定义，因此后者会覆盖前者。

若要保留同一个泛型类型的多个实例，可以使用 `named<T>()` 为每个实例赋予从其类型实参派生而来的类型限定符。该模式在[高级模式](/docs/reference/koin-core/advanced-patterns)中进行了说明。

## 增量构建 {id="incremental-builds"}

完整图检查会在聚合模块（带有入口点的模块）编译时运行。当其他位置发生更改时（例如在 `module { }` lambda 体内部），Kotlin 增量编译可能会跳过该模块。插件会在其检测到入口点的模块中启用 `strictSafety`，从而确保每次构建都运行检查。详细信息与应急开关请参阅：[strictSafety](/docs/reference/koin-annotations/options#strictsafety)。

## 局限性 {id="limits"}

- **动态模块列表**：无法追踪 `modules(if (debug) a else b)`、`modules(*list)` 或在运行时构建的列表。插件会报告 `KOIN-W003` 并跳过该入口点的完整图检查。请直接传入模块以保留检查。
- **手写 lambda 与循环依赖**：`single { A(get()) }` lambda 不会为循环检查添加边，因此无法检测通过手写 lambda 形成的循环依赖。在需要关注循环依赖的地方，请使用 `single<T>()`、`singleOf(::T)` 或 `create(::T)`。
- **自定义配置标签**：带有除 `"default"` 以外标签的模块最多只能在相距一个 `implementation` 依赖的范围内被发现（`KOIN-W004`）。请添加直接依赖，或在 `@KoinApplication(modules = [...])` 中列出该模块。
- **深层函数定义**：相距两个或更多 `implementation` 跳数的模块中的 `@Module` 函数定义或带限定符的顶级函数对检查不可见（`KOIN-W005`）。它在运行时仍然有效。添加直接依赖即可对其进行检查。
- **运行时加载的模块**：请参阅[运行时加载的模块](#modules-loaded-at-runtime)。

## 替代 verify() 和 checkModules() {id="replacing-verify-and-checkmodules"}

在开启编译时安全性的情况下，构建会在每次编译时执行 `verify()` 和 `checkModules()` 测试所检查的内容。对于插件能够完全检查的图，你可以移除这些测试。对于插件报告为无法验证的图（`KOIN-W003`）或使用了运行时加载模块的图，请保留这些测试。请参阅[验证模块](/docs/reference/koin-test/verify)。

## 相关内容 {id="related"}

- [编译器插件选项](/docs/reference/koin-annotations/options)：`compileSafety`、`strictSafety`、`skipDefaultValues` 及其他选项。
- [Koin 编译器插件](/docs/intro/koin-compiler-plugin)：插件的功能和工作原理。
- [定义](/docs/reference/koin-core/definitions)：构造函数形参的解析方式。
- [故障排除](/docs/reference/koin-core/troubleshooting)：运行时错误、记录器与循环依赖。
- [IDE 插件](/docs/tooling/ide-plugin)：在 IDE 中查看图并导航定义。
- [Playground 应用](https://github.com/InsertKoinIO/koin-compiler-plugin/tree/main/playground-apps)：包含注解示例（`app-annotations/`）和 DSL 示例（`app-dsl/`）的示例应用。