---
title: 什么是 Koin？
---

# 什么是 Koin？

Koin 是面向 Kotlin 的依赖注入框架。本文将介绍其工作原理、优缺点（开销与收益），以及该项目的组织方式。如果您还不熟悉依赖注入，请先阅读[什么是依赖注入？](/docs/intro/what-is-dependency-injection)。

## Koin 的工作原理 {id="how-koin-works"}

您可以在模块中声明类，启动一次 Koin，并在需要的地方请求实例：

```kotlin
class ApiService
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin {
        modules(appModule)
    }
}
```

两个部分协同工作：

- **运行时容器**：`startKoin` 会将您的模块加载到容器中。每个定义都是一个用于构建某种类型的 Kotlin 函数。当有代码请求 `UserRepository` 时，Koin 会运行该函数，从容器中解析其构造函数形参，并根据定义类型（`single`、`factory`、`scoped`）保留或丢弃该实例。Koin 不通过反射构建对象。
- **编译时检查（可选）**：[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) 是一个 Kotlin 编译器插件。它通过读取构造函数来生成装配逻辑，然后在构建时检查所组装的图中的每个依赖项是否均已声明。缺失定义将表现为构建错误，而不会导致运行时崩溃。

[核心概念](/docs/intro/core-concepts)通过一个完整的示例讲解了模块、定义、作用域以及注入。

## 运行时模型的开销与收益 {id="what-the-runtime-model-costs-and-gives"}

由于依赖图存在于运行时容器中，Koin 可以在应用程序运行期间对其进行更改：

- **动态模块**：在启动后使用 `loadKoinModules()` 和 `unloadKoinModules()` 加载与卸载模块，适用于功能特性开关或按需加载的功能。请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。
- **延迟加载模块**：在后台加载部分依赖图，以减少启动开销。请参阅[延迟加载模块](/docs/reference/koin-core/lazy-modules)。
- **运行时创建的作用域**：为会话、屏幕或请求开启和关闭作用域。请参阅[作用域](/docs/reference/koin-core/scopes)。
- **无生成源文件**：无需向版本库提交生成代码，也无需为每个 Kotlin Multiplatform 目标单独配置。

但该模型也有一些您应当了解的开销：

- **启动开销**：模块在 Koin 启动时进行注册，且每次查找都要经过容器。对大多数应用程序来说这微不足道，但及早求值定义（`createdAtStart`）会在启动 Koin 的线程上运行。
- **未搭配插件时的运行时错误**：若使用构造函数 DSL 或经典 DSL 且未使用插件，只有在代码运行时才会发现缺失的定义。您可以在单元测试中通过 [`verify()`](/docs/reference/koin-test/verify) 捕获它，或通过编译器插件在构建时捕获。
- **编译时检查的局限性**：插件会验证在 Koin 入口点（例如 `startKoin`）组装的图。之后通过 `loadKoinModules()` 加载的模块无法在构建时完成验证，而没有入口点的库模块只有在应用程序组装它时才会接受检查。请参阅[编译时安全性](/docs/reference/koin-compiler/compile-safety)。
- **Kotlin 版本耦合**：编译器插件依赖编译器内部实现，因此每个插件版本都针对一系列特定的 Kotlin 版本进行过验证。请参阅[编译器插件配置](/docs/setup/compiler-plugin)。

## 构造函数注入与服务定位器 {id="constructor-injection-and-service-locator"}

您的类通过构造函数接收其依赖项。Koin 仅在无法自行创建对象的入口点处检索实例：

```kotlin
// Koin 创建这些对象：依赖项通过构造函数传入
class UserRepository(private val api: UserApi)
class UserViewModel(private val repository: UserRepository) : ViewModel()

// Android 创建 Activity：它从 Koin 检索其 ViewModel
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

依赖项在签名中清晰可见，您无需 Koin 即可测试 `UserRepository` 和 `UserViewModel`。诸如 `by inject()`、`by viewModel()` 或 `koinInject()` 等检索函数属于入口点：例如 `Activity`、`Fragment`、根 Composable、`main()`、Ktor 路由或测试。[什么是依赖注入？](/docs/intro/what-is-dependency-injection)对比了这两种模式，而[检索依赖项](/docs/reference/koin-core/injection)涵盖了 `get()` 和 `inject()` 的用法。

## 两种风格，同一个容器 {id="two-styles-one-container"}

| 风格 | 示例 | 所需配置 |
|-------|---------|-------|
| 编译器插件 DSL | `single<UserRepository>()` | Koin Compiler Plugin |
| 注解 | `@Singleton class UserRepository(...)` | Koin Compiler Plugin、`koin-annotations` |
| 构造函数 DSL | `singleOf(::UserRepository)` | 无需额外配置（插件可增加编译时检查） |
| 经典 DSL | `single { UserRepository(get()) }` | 无需额外配置（插件可增加编译时检查） |

注解是一种风格；编译器插件 DSL、构造函数 DSL 和经典 DSL 则是另一种风格（即 Koin DSL）的三种形式。它们都会在同一个容器中生成相同的定义。每个项目选择一种风格即可。[选择您的风格](/docs/intro/choosing-your-style)对它们进行了对比，并给出了默认推荐。

## 注解的状态 {id="annotations-status"}

`koin-annotations` 库（`@Singleton`、`@Factory`、`@KoinViewModel`、`@Module`、`@ComponentScan`）是 Koin 主项目的一部分：位于同一仓库、采用同一版本、使用同一 BOM。它并未被弃用。已被弃用的是此前用于读取这些注解的 KSP 处理器 `koin-ksp-compiler`。Koin Compiler Plugin 取代了它，且沿用相同的注解。请参阅[从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。

## 支持的平台 {id="platforms"}

Koin 是一个 Kotlin Multiplatform 库。核心库可在所有 Kotlin 目标平台上运行，集成库则增添了平台专有 API：

| 平台 | 主要构件 | 入门指南 |
|----------|---------------|------------|
| Kotlin/JVM | `koin-core` | [Kotlin 教程](/docs/quickstart/kotlin) |
| Android | `koin-android` | [在 Android 上启动 Koin](/docs/reference/koin-android/start) |
| Jetpack Compose、Compose Multiplatform | `koin-compose`、`koin-compose-viewmodel` | [适用于 Compose 的 Koin](/docs/reference/koin-compose/compose) |
| Kotlin Multiplatform（iOS、桌面端、Web、原生） | `koin-core` | [Kotlin Multiplatform 配置](/docs/reference/koin-core/kmp-setup) |
| Ktor 服务器 | `koin-ktor` | [适用于 Ktor 的 Koin](/docs/reference/koin-ktor/ktor) |

完整的构件列表请参见 [Gradle 配置](/docs/setup/gradle)。

## Koin 项目 {id="the-koin-project"}

Koin 基于 Apache 2.0 许可证开源。它包含以下组成部分：

- **Koin 库**：包括核心库（core）、Android、Compose、Ktor、测试（test）以及注解（annotations），全部在同一个版本号下发布。源码：[InsertKoinIO/koin](https://github.com/InsertKoinIO/koin)。
- **Koin 编译器插件**：Kotlin 编译器插件及其 Gradle 插件，拥有独立的版本号。源码：[InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin)。
- **Koin IDE 插件**：在 Android Studio 和 IntelliJ IDEA 中提供导航和检查功能。请参阅 [IDE 插件](/docs/tooling/ide-plugin)。
- **示例**：各个教程对应的可运行的应用程序，位于 [InsertKoinIO/koin-getting-started](https://github.com/InsertKoinIO/koin-getting-started)。

如果您熟悉 Hilt 或 Dagger，[Koin 与 Hilt 对比](/docs/intro/koin-vs-hilt)比较了这两种方案。

## 相关内容 {id="related"}

- [核心概念](/docs/intro/core-concepts)：心智模型，通过一个示例逐步构建讲解。
- [选择您的风格](/docs/intro/choosing-your-style)：应使用哪种声明风格。
- [Koin 编译器插件](/docs/intro/koin-compiler-plugin)：构建时的工作机制。
- [配置指南](/docs/setup)：将 Koin 添加到您的项目中。
- [教程](/docs/quickstart/kotlin)：构建您的第一个应用程序。