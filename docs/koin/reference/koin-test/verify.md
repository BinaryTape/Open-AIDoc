---
title: 验证配置
---

# 验证配置

本页介绍 `verify()`（无需运行即可检查 Koin 配置的测试 API）以及已弃用的 `checkModules()`。此外，本文还会说明这两者与 Koin 编译器插件（Koin Compiler Plugin）的编译时检查之间的关系，以便你了解是否仍然需要它们。你应该已经了解如何编写[使用 Koin 的单元测试](/docs/reference/koin-test/testing)。

## 你是否仍然需要 verify()？ {id="do-you-still-need-verify"}

[Koin 编译器插件](/docs/reference/koin-compiler/compile-safety)会在构建时检查完整的依赖图：缺失的定义、限定符不匹配、作用域错误以及 `get()` / `inject()` 调用站点。当它覆盖你的项目时，`verify()` 测试不会带来任何额外收益，你可以直接将其删除。

在以下情况下，你仍然需要 `verify()`：

- 未使用编译器插件：你的项目在不使用该插件的情况下使用 Constructor DSL 或 Classic DSL。（已弃用的注解版 KSP 处理程序拥有自己的 `KOIN_CONFIG_CHECK` 选项。）
- 依赖图在构建时未知：该插件无法解析使用 `if` / `when` 或可变实参（varargs）构建的模块列表。它会报告 `KOIN-W003` 并跳过对该入口点的检查。
- 库模块：没有自己的 `startKoin` / `@KoinApplication` 的库或特性模块，在被应用组装之前不会进行缺失依赖检查。库中的 `verify()` 测试可以独立对其进行检查。
- 延迟模块：你使用[延迟模块](/docs/reference/koin-core/lazy-modules)加载部分依赖图，并希望针对完整配置运行一个测试（参见[同时使用模块与延迟模块](#modules-and-lazy-modules-together)）。

## verify() {id="verify"}

`verify()` 是 `Module` 上的一个扩展，在 `koin-test` 的 JVM 平台上可用。它会读取每个定义类的构造函数，并检查每个形参类型在当前模块或其包含的模块中是否都有对应的定义。它不会运行任何定义，也不需要任何 mock。

```kotlin
val appModule = module {
    includes(dataModule, networkModule)
    viewModel<UserViewModel>()
}
```

```kotlin
import org.koin.test.verify.verify

class AppModuleCheck {

    @Test
    fun checkKoinModule() {
        appModule.verify()
    }
}
```

如果缺失依赖，`verify()` 会抛出 `MissingKoinDefinitionException` 并输出修复建议。如果两个构造函数之间存在循环依赖，它会抛出 `CircularInjectionException`。

要检查多个未通过 `includes()` 链接的模块，请使用 `listOf(dataModule, uiModule).verifyAll()`。

### verify() 接受的内容 {id="what-verify-accepts"}

构造函数形参在满足以下条件时会通过检查：

- 已声明：模块树中存在该类型的定义。
- 可选：形参具有默认值。如果不存在定义，`verify()` 会输出一条警告。
- 已包装：类型为 `Lazy<T>` 或 `List<T>`，且其 `T` 已声明。
- 白名单：其类型包含在 `extraTypes` 中，或者是基本类型（`String`、`Int`、`Long`、`Double`）。
- 注入或提供：形参带有 `@InjectedParam` 或 `@Provided` 注解，或者通过 `injections` 进行了声明。

`verify()` 仅读取构造函数。它不会检查限定符、属性或写在定义 lambda 表达式内部的 `get()` 调用。

### 运行时提供的类型 {id="types-provided-at-runtime"}

某些类型永远不会在模块中声明：例如框架对象或由平台创建的值。可以将它们添加到 `extraTypes` 中：

```kotlin
appModule.verify(
    extraTypes = listOf(HttpClientEngine::class, Clock::class)
)
```

在 Android 上，可以使用来自 `koin-android-test` 的 `androidVerify()`。它会为你自动添加 `Context`、`Activity`、`Fragment`、`Application`、`SavedStateHandle` 和 `WorkerParameters`：

```kotlin
import org.koin.android.test.verify.androidVerify

@Test
fun checkKoinModule() {
    appModule.androidVerify()
}
```

### 注入的形参 {id="injected-parameters"}

通过 `parametersOf()` 传递的形参没有定义，因此 `verify()` 会将其报告为缺失。可以通过 `injections` 声明它：

```kotlin
class UserPresenter(val userId: String, val repository: UserRepository)

val presenterModule = module {
    factory { (userId: String) -> UserPresenter(userId, get()) }
}

@Test
fun checkKoinModule() {
    presenterModule.verify(
        injections = injectedParameters(
            definition<UserPresenter>(String::class)
        )
    )
}
```

或者为构造函数形参添加注解。`@InjectedParam` 用于标记通过 `parametersOf()` 传递的值，`@Provided` 用于标记在 Koin 模块外部提供的类型：

```kotlin
class UserPresenter(@InjectedParam val userId: String, val repository: UserRepository)

class SyncWorker(@Provided val params: WorkerParameters, val repository: UserRepository)
```

这两个注解都来自 `koin-core-annotations`，并且与编译器插件读取的注解相同（参见[注入的形参](/docs/reference/koin-core/injection-parameters)）。

### 同时使用模块与延迟模块 {id="modules-and-lazy-modules-together"}

`koin-test-coroutines` 在 `ModuleConfiguration` 上添加了 `verify()`，可将常规模块和[延迟模块](/docs/reference/koin-core/lazy-modules)作为一个整体依赖图进行检查：

```kotlin
val configuration = moduleConfiguration {
    modules(coreModule)
    lazyModules(featureModule)
}

@Test
fun checkConfiguration() {
    configuration.verify()
}
```

`moduleConfiguration` 以及该 `verify()` 是实验性功能（`@KoinExperimentalAPI`）。

## checkModules()（已弃用） {id="checkmodules-deprecated"}

:::warning
`checkModules()`、`checkKoinModules()` 及其 DSL 已弃用。请迁移到 `verify()` 或编译器插件。
:::

与 `verify()` 不同，`checkModules()` 会启动模块并创建每个定义，因此它需要为运行时解析的所有内容提供值。你可能会在较旧的项目中看到它：

```kotlin
@Test
fun checkAllModules() {
    koinApplication {
        modules(appModule)
        checkModules {
            withInstance<Context>()
            withParameter<UserPresenter> { "user-1" }
            withProperty("api_url", "http://localhost")
        }
    }
}

// or
@Test
fun checkAllModules() {
    checkKoinModules(listOf(appModule))
}
```

检查 DSL：

- `withInstance(value)`：将 `value` 添加到依赖图中。`withInstance<T>()` 会添加 `T` 的 mock，并且需要 `MockProviderRule`（参见[使用 declareMock 进行 Mock](/docs/reference/koin-test/testing#mocking-with-declaremock)）。
- `withParameter<T> { value }`：用于创建 `T` 的注入形参。多个形参请使用 `withParameters<T> { parametersOf(a, b) }`。
- `withProperty(key, value)`：添加一个 Koin 属性。
- `withScopeLink(scope, targetScope)`：为检查[链接](/docs/reference/koin-core/scopes)两个作用域。

迁移到 `verify()` 的方法：针对框架类型移除 `withInstance`（使用 `extraTypes` 或 `androidVerify()`），并将 `withParameter` 替换为 `injections` 或 `@InjectedParam`。

## 相关内容 {id="related"}

- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：编译器插件在构建时检查的内容。
- [单元测试](/docs/reference/koin-test/testing)：在测试中启动 Koin、重写和 mock 定义。
- [注入的形参](/docs/reference/koin-core/injection-parameters)：`parametersOf` 与 `@InjectedParam`。
- [延迟模块](/docs/reference/koin-core/lazy-modules)：在后台加载部分依赖图。
- [故障排除](/docs/reference/koin-core/troubleshooting)：例如 `NoDefinitionFoundException` 等运行时错误。