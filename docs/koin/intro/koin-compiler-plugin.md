---
title: Koin 编译器插件
---

# Koin 编译器插件

Koin 编译器插件（Koin Compiler Plugin）是一个运行在 Kotlin 编译器 (K2) 内部的 Kotlin 编译器插件。它负责为你定义的依赖编写构造函数装配代码，并在构建期检查依赖图。它同时为 Compiler Plugin DSL 和注解提供支持。本页将说明它的功能与实现原理。如需安装，请参阅[编译器插件安装](/docs/setup/compiler-plugin)。若要将其与 Constructor DSL 和 Classic DSL 进行对比，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

## 它对你的代码做了什么 {id="what-it-does-to-your-code"}

你只需编写类型，插件负责编写构造函数调用：

**Compiler Plugin DSL**
```kotlin
class UserRepository(private val api: ApiService, private val cache: UserCache)

val appModule = module {
    single<UserRepository>()
}
```

**注解**
```kotlin
@Singleton
class UserRepository(private val api: ApiService, private val cache: UserCache)
```

**Constructor / Classic DSL**
Classic DSL 不需要该插件：装配代码由你自行编写。Constructor DSL (`singleOf(::T)`) 同样也不需要它。

```kotlin
val appModule = module {
    single { UserRepository(get(), get()) }
}
```

如果应用了该插件，它仍会在构建期检查这些 `get()` 调用和 `singleOf(::T)` 定义。

在编译期间，插件会将 `single<UserRepository>()`（或带有 `@Singleton` 的类）替换为等效的以下代码：

```kotlin
single { UserRepository(get(), get()) }
```

生成的代码与 Classic DSL 所使用的运行时代码完全相同。在运行时没有任何变化：定义会被放入同一个容器中，并且 Koin 会以相同的方式解析它们。各个形参类型均会得到妥善处理：可空类型使用 `getOrNull()`，`Lazy<T>` 使用 `inject()`，`List<T>` 使用 `getAll()`，而带有注解的形参（`@Named`、`@InjectedParam`、`@Property`）则使用对应的调用。完整对照表请参阅[定义](/docs/reference/koin-core/definitions#constructor-parameters)。

在 DSL 风格中，由模块指明类在哪里注册，而类形参上的注解则指明它们如何被解析：

```kotlin
class UserPresenter(
    @InjectedParam val userId: String,
    @Named("remote") val api: ApiService,
    val repository: UserRepository,
)

val appModule = module {
    factory<UserPresenter>()
}
```

## 工作原理 {id="how-it-works"}

该插件挂钩到 Kotlin K2 编译器的两个阶段：

```text
Kotlin 源代码
     │
     ▼
  FIR (前端)       查找 @Module、@ComponentScan、@Configuration 并声明
                   生成的模块属性与跨模块提示 (cross-module hints)
     │
     ▼
  IR (后端)        1. 收集带注解的定义并填充模块
                   2. 重写 DSL 调用：single<T>() 变为 single { T(get()) }
                   3. 在入口点 (startKoin, @KoinApplication) 处组装
                      完整依赖图并进行验证
                   4. 验证 get()、inject()、koinViewModel() 调用站点
     │
     ▼
  字节码 (JVM, Android, Native, JS, Wasm)
```

你的项目中不会生成任何源文件。为了能够跨 Gradle 模块感知定义，插件会向每个编译后的模块中添加微小的合成标记函数（“hints”）。下游模块读取这些标记函数，即可找到其依赖项中声明的定义。这就是为什么每个声明了 Koin 定义的 Gradle 模块都必须应用该插件。

## 验证内容 {id="what-it-validates"}

插件会在各个 Koin 入口点验证依赖图：`startKoin`、`koinApplication`、`@KoinApplication`、`KoinApplication.withConfiguration<T>()` 以及 Ktor 的 `install(Koin) {}`。对于每个定义，它都会检查每个非空构造函数形参是否都具有匹配的定义，且具备正确的限定符并处于可达的作用域内。它还会检查每一个 `get<T>()`、`inject<T>()` 和 `koinViewModel<T>()` 调用。

缺失依赖项将导致构建失败：

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

完整的检查列表、错误代码以及 `@Provided` 逃生通道请参阅[编译期安全性](/docs/reference/koin-compiler/compile-safety)。

## 限制 {id="limits"}

- **运行时加载的模块**：后续通过 `loadKoinModules()` 添加的模块不在插件所能感知的依赖图中。它们提供的类型必须标记为 `@Provided`。
- **单独的库模块**：没有 Koin 入口点的 Gradle 模块不会单独进行验证。它会在应用程序模块对其进行组装时进行检查。
- **增量编译**：与其他 IR 编译器插件一样，某些更改（在被扫描的包之间移动类、更改限定符）可能会残留过时的结果。执行一次全新构建（clean build）即可解决此类问题。详情请参阅[编译器插件安装](/docs/setup/compiler-plugin)。
- **Kotlin 版本**：该插件使用了在 Kotlin 各版本间可能会发生变化的编译器 API。每个插件版本均在一系列 Kotlin 版本上经过验证，使用其他版本将会打印警告。

## 环境要求 {id="requirements"}

- Kotlin 2.3.20 或更高版本（K2 编译器）。插件 1.2.1 版已在 Kotlin 2.3.20、2.4.0、2.4.10 和 2.4.20 上完成验证。
- Koin 4.2.0 或更高版本。
- Gradle 插件 `io.insert-koin.compiler.plugin`，需应用在每个声明了定义的 Gradle 模块中。

Compiler Plugin DSL 位于 `org.koin.plugin.module.dsl` 包中，随 `koin-core` 一起分发。Classic DSL 保留在 `org.koin.dsl` 中，Constructor DSL 保留在 `org.koin.core.module.dsl` 中。

该插件取代了已弃用的 KSP 处理器 `koin-ksp-compiler`，并支持相同的注解。请参阅[从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)。源代码位于 GitHub：[InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin)。

## 相关内容 {id="related"}

- [编译器插件安装](/docs/setup/compiler-plugin)：安装和配置插件。
- [选择你的风格](/docs/intro/choosing-your-style)：注解或 DSL（Compiler Plugin、Constructor 或 Classic DSL）。
- [编译期安全性](/docs/reference/koin-compiler/compile-safety)：各项检查与错误代码。
- [编译器插件选项](/docs/reference/koin-annotations/options)：各项 Gradle 配置选项。
- [定义](/docs/reference/koin-core/definitions)：构造函数形参的解析方式。