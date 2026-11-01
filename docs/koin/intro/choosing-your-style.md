---
title: 选择你的风格
---

# 选择你的风格

Koin 提供了两种声明定义（definition）的风格，两者填充的是同一个容器：在你的类上使用**注解**，或者在 `module { }` 代码块中使用 **Koin DSL**。DSL 包含三种形式：编译器插件 DSL（`single<T>()`）、构造函数 DSL（`singleOf(::T)`）以及传统 DSL（`single { T(get()) }`）。风格的选择仅会改变你编写模块的方式，并不会改变 Koin 在运行时的运作机制。本页面展示了每种风格、它们的要求与权衡，并给出了默认推荐方案。我们假设你已经了解什么是定义和模块（参见[核心概念](/docs/intro/core-concepts)）。

## 各种风格的直观对比 {id="the-styles-side-by-side"}

以下是使用每种风格编写的同一个模块：

**编译器插件 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepositoryImpl>() bind UserRepository::class
    viewModel<UserViewModel>()
}
```

你只需指定类型。[Koin 编译器插件](/docs/intro/koin-compiler-plugin)会读取其构造函数并生成装配代码。

**注解**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.example.app")
class AppModule
```

你只需为每个类添加注解。`@ComponentScan` 会将它们收集到一个模块中，然后编译器插件生成装配代码。接口会自动进行绑定。

**构造函数 / 传统 DSL**
构造函数 DSL，使用构造函数引用：

```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    viewModelOf(::UserViewModel)
}
```

传统 DSL，手动编写构造函数调用：

```kotlin
val appModule = module {
    single { ApiService() }
    single<UserRepository> { UserRepositoryImpl(get()) }
    viewModel { UserViewModel(get()) }
}
```

这两种形式均可在没有编译器插件的情况下工作。当应用了该插件后，它们在构建期同样会接受检查。

## 要求 {id="requirements"}

| | 编译器插件 DSL | 注解 | 构造函数 / 传统 DSL |
|---|---|---|---|
| Koin 版本 | 4.2.0+ | 4.2.0+ | 任意 |
| Kotlin 版本 | 2.3.20+ (K2) | 2.3.20+ (K2) | 你的 Koin 版本所支持的任意版本 |
| Gradle 插件 | `io.insert-koin.compiler.plugin`（必需） | `io.insert-koin.compiler.plugin`（必需） | 可选：添加编译期检查 |
| 额外依赖 | 仅参数注解需要 `koin-annotations`（`@Named`、`@InjectedParam`） | `koin-annotations` | 无 |
| 导入项 | `org.koin.plugin.module.dsl.*` | `org.koin.core.annotation.*` | `org.koin.core.module.dsl.*`（构造函数），`org.koin.dsl.*`（传统） |

每个编译器插件版本都会在一系列 Kotlin 版本上进行验证。插件 1.2.1 已在 Kotlin 2.3.20、2.4.0、2.4.10 和 2.4.20 上完成验证。安装步骤请参见[编译器插件设置](/docs/setup/compiler-plugin)。

:::warning
编译器插件 DSL 函数（`single<T>()`、`factory<T>()`、`create(::T)`）均为存根。若未应用 Gradle 插件，代码虽能编译，但运行时会抛出 `NotImplementedError`。请在每个使用它们的 Gradle 模块中应用该插件。
:::

## 权衡 {id="tradeoffs"}

### 编译器插件 DSL {id="compiler-plugin-dsl"}

- **编译期检查**：整个依赖图以及每个 `get()` 调用站点都会在构建期进行验证。
- **无需装配代码**：没有 `get()`，没有构造函数引用。添加构造函数参数无需修改模块代码。
- **显式模块**：你可以在一处看到模块的所有定义，并且可以在它们周围使用 Kotlin 代码（条件判断、循环）。
- **参数注解**：限定符和注入参数声明在类上（`@Named`、`@InjectedParam`），因此该类需要依赖 `koin-annotations`。
- **Kotlin 耦合**：你需要较新的 K2 编译器，且每次 Kotlin 发布新版本可能都需要对应发布新的插件版本。

### 注解 {id="annotations"}

- **编译期检查**：与编译器插件 DSL 相同。
- **定义紧邻类**：生命周期和绑定关系在编写类的地方一目了然。对于来自 Hilt、Dagger 或 Spring 的团队来说，这种模式非常熟悉。
- **自动绑定**：类会自动绑定到其所有的超类型，除非你显式列出了 `binds`。
- **扫描配置**：定义是通过软件包来查找的。你需要配置带有正确软件包路径的 `@Module` 和 `@ComponentScan`，并使用 `@Configuration` 或 `@KoinApplication` 跨 Gradle 模块组装各个模块。位于扫描软件包之外的类不会成为模块的一部分。仅当有其他定义需要它时，编译期检查才会报错。
- **功能空白**：某些选项仅在 DSL 中可用，例如 `onClose` 回调。你必须在 DSL 模块中编写这些定义。
- **Kotlin 耦合**：与编译器插件 DSL 相同。

### 构造函数 DSL 与传统 DSL {id="constructor-dsl-and-classic-dsl"}

- **随处可用**：编译器插件是可选的，除 Koin 本身的要求外没有其他 Kotlin 版本限制。
- **配合插件进行编译期检查**：自编译器插件 1.2.0 起，应用插件后会像检查 `single<T>()` 一样检查 `singleOf(::T)`、`factoryOf(::T)`、`scopedOf(::T)` 和 `viewModelOf(::T)`，并通过手写 lambda 的 `get()` 调用对其进行检查。现有模块无需重写即可获得编译期检查能力。
- **完全控制（传统 DSL）**：lambda 是纯粹的 Kotlin 代码，因此你可以在运行时调用构建器、读取配置或选择具体实现。
- **没有插件时的运行时错误**：缺失的定义会在代码运行时才被发现。可在单元测试中使用 [`verify()`](/docs/reference/koin-test/verify) 尽早捕获此类错误。
- **需要维护装配代码**：`single { UserRepository(get(), get()) }` 必须手动跟随构造函数的变更进行修改。`singleOf(::UserRepository)` 会自动跟随变更，但对于可空、延迟加载（lazy）或带有限定符的形参，仍需要显式调用。

## 该选择哪一种 {id="which-one-to-pick"}

为项目选定一种风格并明确规范：注解风格或 DSL 风格。

对于使用 Kotlin 2.3.20 或更高版本的新项目，推荐使用**编译器插件 DSL**。它能提供编译期检查，使你的类与依赖注入解耦，并保持模块为显式的 Kotlin 代码。如果你的团队更倾向于直接在类上声明定义（类似于 Hilt 或 Dagger），请使用**注解**：它们拥有相同的检查机制，并且兼容 JSR-330（`@Inject`、`@Singleton`、`@Named`）。

在以下情况下，请保留**构造函数或传统 DSL**：你无法使用较新的 Kotlin 版本；你正在构建一个不得强制要求使用者引入编译器插件的库；或者现有模块运行良好且你不想对其进行改动。你可以直接应用编译器插件，无需重写即可为它们添加编译期检查。凡是定义需要自定义逻辑的地方，均可使用传统 DSL 的 lambda。

## 混用风格 {id="mixing-styles"}

所有风格生成的定义都是完全相同的，因此一个项目可以同时使用多种风格。但建议每个项目优先保持单一风格。如果你同时混用注解和 DSL，请确保每个模块内部保持单一风格。常见场景包括：

- **在一个模块中混用编译器插件 DSL 与传统 DSL**：大多数定义使用 `single<T>()`，在需要自定义逻辑的地方使用 lambda。这两者都是 DSL 的形式，因此这不属于混用风格。
- **以注解为主，辅以少数 DSL 模块**：从你的 `@KoinApplication` 类开始，在配置块中添加 DSL 模块。
- **以 DSL 启动，配合注解模块**：将 `@Module` 类加载到常规的 `startKoin` 中。

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.startKoin

// 基于注解的应用程序，外加 DSL 模块
startKoin<MyApp> {
    modules(legacyModule)
}

// 基于 DSL 的应用程序，外加注解模块
startKoin {
    modules(appModule)
    module<NetworkModule>()
}
```

`@Module(includes = [...])` 和 `@KoinApplication(modules = [...])` 仅接受 `@Module` 类，不接受 DSL 的 `module { }` 值。有关完整规则，请参阅[模块](/docs/reference/koin-core/modules)和[启动 Koin](/docs/reference/koin-core/starting-koin)。

## KSP 处理器已被弃用 {id="the-ksp-processor-is-deprecated"}

在编译器插件推出之前，注解是由 KSP 处理器 `koin-ksp-compiler` 进行处理的。该处理器已被弃用，并将在未来的 Koin 版本中移除。注解本身并未被弃用：`koin-annotations` 是 Koin 主项目的一部分，随每个 Koin 版本一同发布。如果你目前正在使用 KSP，你的注解类无需更改，仅需修改构建配置和启动代码。详情请参见[从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。

## 页面中的选项卡 {id="tabs-on-every-page"}

本文档中的代码示例均使用相同的三个选项卡：编译器插件 DSL、注解、构造函数 / 传统 DSL。当你选择某个选项卡时，该选择会保存在你的浏览器中并应用到所有页面。在所有风格中写法完全相同的示例（例如在 Activity 中使用 `by inject()`），将直接显示一次，不提供选项卡。

## 相关内容 {id="related"}

- [Koin 编译器插件](/docs/intro/koin-compiler-plugin)：插件的运作原理以及它验证的内容。
- [编译器插件设置](/docs/setup/compiler-plugin)：安装 Gradle 插件。
- [定义](/docs/reference/koin-core/definitions)：每种风格下的所有定义类型。
- [DSL 参考](/docs/reference/koin-core/dsl)与[注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有关键字和注解。
- [从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)：从 `koin-ksp-compiler` 迁移。