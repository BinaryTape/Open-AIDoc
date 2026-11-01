---
title: DSL 参考
---

# DSL 参考

本页以表格形式列出了所有 Koin DSL 关键字，附带需导入的软件包以及解释其用法的页面链接。其中涵盖了三种 DSL 形式：编译器插件 DSL（Compiler Plugin DSL）、构造函数 DSL（Constructor DSL，构造函数引用）和经典 DSL（Classic DSL，lambda）。关于注解，请参阅[注解参考](/docs/reference/koin-annotations/annotations-inventory)。

## DSL 风格 {id="dsl-styles"}

| 风格 | 示例 | 导入 |
|-------|---------|--------|
| 编译器插件 DSL | `single<UserRepository>()` | `org.koin.plugin.module.dsl.*` |
| 构造函数 DSL | `singleOf(::UserRepository)` | `org.koin.core.module.dsl.*` |
| 经典 DSL | `single { UserRepository(get()) }` | `org.koin.dsl.*` |

编译器插件 DSL 需要使用 [Koin 编译器插件](/docs/setup/compiler-plugin)。该插件会读取构造函数、生成 `get()` 调用并在构建时检查依赖图。如果没有该插件，类似 `single<T>()` 的调用会在运行时抛出异常：`Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.`。

构造函数引用形式（`singleOf(::T)`）在应用了编译器插件时也会被检查。手写的 lambda 则不会：插件仅跟踪它提供的类型，而不跟踪 lambda 体内部的操作。要选择适合的风格，请参阅[选择您的风格](/docs/intro/choosing-your-style)。

## 应用程序 DSL {id="application-dsl"}

用于创建和启动 Koin 容器的函数。请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

| 函数 | 软件包 | 功能说明 |
|----------|---------|--------------|
| `startKoin { }` | `org.koin.core.context` | 创建一个 `KoinApplication` 并将其注册到全局上下文中。如果已经启动了一个，则抛出 `KoinApplicationAlreadyStartedException` |
| `startKoin<T>()` | `org.koin.plugin.module.dsl` | 编译器插件：使用 `@KoinApplication` 类 `T` 的模块启动 Koin |
| `koinApplication { }` | `org.koin.dsl` | 创建一个独立的 `KoinApplication`，不进行全局注册。请参阅[上下文隔离](/docs/reference/koin-core/context-isolation) |
| `koinApplication<T>()` | `org.koin.plugin.module.dsl` | 编译器插件：使用 `T` 的模块创建独立应用程序 |
| `koinConfiguration { }` | `org.koin.dsl` | 声明一个可复用的 `KoinConfiguration`，而不启动 Koin |
| `koinConfiguration<T>()` | `org.koin.plugin.module.dsl` | 编译器插件：使用 `T` 的模块创建配置 |
| `stopKoin()` | `org.koin.core.context` | 关闭全局容器及其所有实例 |
| `loadKoinModules(module)` | `org.koin.core.context` | 将模块加载到已启动的全局容器中 |
| `unloadKoinModules(module)` | `org.koin.core.context` | 卸载模块并丢弃它们的实例 |

### 在 `startKoin { }` 和 `koinApplication { }` 内部 {id="inside-startkoin-and-koinapplication"}

| 函数 | 功能说明 |
|----------|--------------|
| `modules(...)` | 加载模块：单个 `Module`、可变参数（vararg）或 `List<Module>` |
| `modules(UserModule::class, ...)` | 编译器插件：加载从 `@Module` 类生成的模块 |
| `module<UserModule>()` | 编译器插件：加载从单个 `@Module` 类生成的模块 |
| `withConfiguration<T>()` | 编译器插件：将 `@KoinApplication` 类 `T` 的模块添加到现有应用程序中 |
| `includes(configuration)` | 应用一个或多个 `KoinConfiguration` 或 `KoinAppDeclaration` 块 |
| `printLogger(level)` | 输出日志到标准输出。默认级别为 `Level.INFO` |
| `logger(logger)` | 使用自定义的 `Logger` 实现。默认为 `EmptyLogger`（无输出） |
| `properties(map)` | 从 `Map<String, Any>` 中加载属性 |
| `fileProperties(fileName)` | 仅限 JVM。从文件中加载属性，默认为 `/koin.properties` |
| `environmentProperties()` | 仅限 JVM。加载系统属性和环境变量 |
| `allowOverride(Boolean)` | 允许或禁止重写定义。默认为 `true`。请参阅[定义](/docs/reference/koin-core/definitions#overriding-a-definition) |
| `createEagerInstances()` | 创建 `createdAtStart` 定义。`startKoin` 和 `koinApplication` 已自动调用此方法 |
| `options(...)` | 设置 Koin 选项，例如 `viewModelScopeFactory()`。请参阅 [ViewModel](/docs/reference/koin-core/viewmodel) |
| `lazyModules(...)` | 在后台加载延迟模块 (`koin-core-coroutines`)。请参阅[延迟模块](/docs/reference/koin-core/lazy-modules) |

`modules(A::class)`、`module<T>()` 和 `withConfiguration<T>()` 适用于普通的 `startKoin { }` 或 `koinApplication { }`，不能放在 `startKoin<T> { }` 内部。

平台扩展程序向该块中添加了更多函数：

| 函数 | 工件 | 参见 |
|----------|----------|-----|
| `androidContext(context)`、`androidLogger(level)`、`androidFileProperties()` | `koin-android` | [Android 启动](/docs/reference/koin-android/start) |
| `fragmentFactory()` | `koin-android` | [Fragment 工厂](/docs/reference/koin-android/fragment-factory) |
| `workManagerFactory()` | `koin-androidx-workmanager` | [WorkManager](/docs/reference/koin-android/workmanager) |
| `slf4jLogger(level)` | `koin-logger-slf4j` | [Ktor](/docs/reference/koin-ktor/ktor) |

## 模块 DSL {id="module-dsl"}

请参阅[模块](/docs/reference/koin-core/modules)和[延迟模块](/docs/reference/koin-core/lazy-modules)。

| 函数 | 软件包 | 功能说明 |
|----------|---------|--------------|
| `module { }` | `org.koin.dsl` | 声明一个模块 |
| `module(createdAtStart = true) { }` | `org.koin.dsl` | 模块中的每个 `single` 都会在启动时创建 |
| `lazyModule { }` | `org.koin.dsl` | 声明一个稍后在后台加载的模块 (`koin-core-coroutines`) |
| `includes(otherModule, ...)` | `org.koin.dsl` | 包含其他模块，可以是可变参数或 `Collection<Module>` |
| `moduleA + moduleB` | `org.koin.dsl` | 构建一个 `List<Module>` |

## 定义 {id="definitions"}

每个关键字创建的内容在[定义](/docs/reference/koin-core/definitions)中有详细解释。

| 定义 | 编译器插件 DSL | 构造函数 DSL | 经典 DSL |
|------------|---------------------|-----------------|-------------|
| Single | `single<T>()` | `singleOf(::T)` | `single { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| Scoped（在作用域块中） | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker (Android) | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |
| Fragment (Android) | 不可用 | `fragmentOf(::T)` | `fragment { T(get()) }` |
| 函数或构建器 | `single { create(::buildT) }` | `singleOf(::buildT)` | `single { buildT(get()) }` |

软件包：

| 关键字 | 编译器插件 DSL | 构造函数 / 经典 DSL |
|----------|---------------------|---------------------------|
| `single`、`factory`、`scoped`、`create` | `org.koin.plugin.module.dsl` | `org.koin.dsl` (lambda)、`org.koin.core.module.dsl` (`singleOf`、`factoryOf`、`scopedOf`、`new`) |
| `viewModel`、`viewModelOf`（工件 `koin-core-viewmodel`） | `org.koin.plugin.module.dsl` | `org.koin.core.module.dsl` |
| `worker`、`workerOf`（工件 `koin-androidx-workmanager`） | `org.koin.plugin.module.dsl` | `org.koin.androidx.workmanager.dsl` |
| `fragment`、`fragmentOf`（工件 `koin-android`） | | `org.koin.androidx.fragment.dsl` |

`org.koin.androidx.viewmodel.dsl` 和 `org.koin.compose.viewmodel.dsl` 中的 `viewModel` 和 `viewModelOf` 已弃用：请从 `org.koin.core.module.dsl` 导入它们。

`create(::buildT)` 必须是其 lambda 中的唯一指令。否则，编译器插件会报错：`create(::buildT) must be the only instruction in the lambda.`。请参阅[定义](/docs/reference/koin-core/definitions#classes-you-dont-own)。

### Lambda 形参 {id="lambda-parameters"}

Lambda 定义具有以下签名：

| 关键字 | 形参 |
|---------|------------|
| `single(qualifier, createdAtStart) { }` | `qualifier: Qualifier? = null`, `createdAtStart: Boolean = false` |
| `factory(qualifier) { }` | `qualifier: Qualifier? = null` |
| `scoped(qualifier) { }` | `qualifier: Qualifier? = null` |
| `viewModel(qualifier) { }` | `qualifier: Qualifier? = null` |
| `worker(qualifier) { }` | `qualifier: Qualifier = named<T>()` |

### 在定义 lambda 内部 {id="inside-a-definition-lambda"}

该 lambda 运行时带有 `Scope` 接收者和 `ParametersHolder` 实参（`params`）：

| 函数 | 返回值 | 参见 |
|----------|---------|-----|
| `get<T>()`、`get<T>(qualifier)` | 实例。如果缺少则抛出 `NoDefinitionFoundException` | [注入](/docs/reference/koin-core/injection) |
| `getOrNull<T>()` | 实例或 `null` | [注入](/docs/reference/koin-core/injection) |
| `inject<T>()` | `Lazy<T>` | [注入](/docs/reference/koin-core/injection) |
| `getAll<T>()` | 绑定到 `T` 的所有实例 | [高级模式](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `getProperty(key)`、`getProperty(key, default)`、`getPropertyOrNull(key)` | 一个 Koin 属性 | [启动 Koin](/docs/reference/koin-core/starting-koin) |
| `params.get<T>()`、`(id) -> ...` 析构 | 一个注入的形参 | [注入形参](/docs/reference/koin-core/injection-parameters) |
| `new(::T)` | 新建 `T`，并通过 `get()` 解析每个构造函数形参 | |
| `create(::T)` | 编译器插件：功能相同，但带有构建时检查 | [定义](/docs/reference/koin-core/definitions#classes-you-dont-own) |
| `getSource<T>()` | 作用域源对象 | [作用域](/docs/reference/koin-core/scopes) |
| `androidContext()`、`androidApplication()` | Android `Context` 或 `Application` | [Android 启动](/docs/reference/koin-android/start) |

## 定义选项 {id="definition-options"}

选项应用在定义之后，可以使用中缀运算符或在 `withOptions { }` 块中进行配置。它们适用于每个定义关键字。

| 选项 | 形式 | 功能说明 | 参见 |
|--------|------|--------------|-----|
| `bind` | `single<T>() bind I::class` | 添加次要类型 | [定义](/docs/reference/koin-core/definitions#interface-binding) |
| `binds` | `single<T>() binds arrayOf(I::class, J::class)` | 添加多个次要类型 | [定义](/docs/reference/koin-core/definitions#interface-binding) |
| `onClose` | `single<T>() onClose { it?.close() }` | 实例释放时的回调 | [定义](/docs/reference/koin-core/definitions#release-callback) |
| `withOptions { }` | `single<T>() withOptions { ... }` | 打开下面的选项块 | |
| `.override()` | `single<T> { ... }.override()` | 在设置了 `allowOverride(false)` 时，标记允许重写 | [定义](/docs/reference/koin-core/definitions#overriding-a-definition) |

在 `withOptions { }` 中，或在 `singleOf(::T) { }`、`factoryOf`、`scopedOf` 和 `viewModelOf` 的尾随块中：

| 选项 | 功能说明 |
|--------|--------------|
| `named("name")` | 字符串限定符。请参阅[限定符](/docs/reference/koin-core/qualifiers) |
| `named<Type>()` | 类型限定符 |
| `bind<I>()` | 添加次要类型 |
| `binds(listOf(I::class, J::class))` | 添加多个次要类型 |
| `createdAtStart()` | 在 Koin 启动时创建该 `single` |
| `onClose { }` | 释放回调 |

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() withOptions {
        named("local")
        bind<UserRepository>()
        createdAtStart()
    }

    // Constructor DSL
    singleOf(::UserRepositoryImpl) {
        named("local")
        bind<UserRepository>()
    }
}
```

## 作用域 DSL {id="scope-dsl"}

作用域块对生命周期与该作用域相同的定义进行分组。请参阅[作用域](/docs/reference/koin-core/scopes)。

| 函数 | 软件包 | 功能说明 |
|----------|---------|--------------|
| `scope<T> { }` | `Module` 成员 | 由类型 `T` 标识的作用域，通常为作用域源的类型 |
| `scope(named("session")) { }` | `Module` 成员 | 由限定符标识的作用域 |

在作用域块内部：

| 定义 | 编译器插件 DSL | 构造函数 DSL | 经典 DSL |
|------------|---------------------|-----------------|-------------|
| Scoped | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker (Android) | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionCache>()
        factory<SessionPresenter>()
    }
}
```

### 作用域原型（Archetype） {id="scope-archetypes"}

原型是针对某种作用域源类型而非单个类的作用域块。该种类的每个源都会获得这些定义。

| 函数 | 工件 | 作用域归属 | 参见 |
|----------|----------|----------|-----|
| `viewModelScope { }` | `koin-core-viewmodel` | 每个 ViewModel | [ViewModel](/docs/reference/koin-core/viewmodel) |
| `activityScope { }` | `koin-android` | 每个 Activity | [Android 作用域](/docs/reference/koin-android/scope) |
| `activityRetainedScope { }` | `koin-android` | 每个 Activity，在配置更改时保持不销毁 | [Android 作用域](/docs/reference/koin-android/scope) |
| `fragmentScope { }` | `koin-android` | 每个 Fragment | [Android 作用域](/docs/reference/koin-android/scope) |
| `navigationScope { }` | `koin-compose-viewmodel-navigation` | 每个导航目标 (`NavBackStackEntry`) | [Compose 作用域](/docs/reference/koin-compose/compose-scopes) |
| `requestScope { }` | `koin-ktor` | 每个 Ktor 调用 | [Ktor 作用域](/docs/reference/koin-ktor/ktor-scopes) |

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：每种定义类型的作用及使用时机。
- [模块](/docs/reference/koin-core/modules)：组织和组合模块。
- [作用域](/docs/reference/koin-core/scopes)：作用域生命周期、链接和关闭。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：与本页对应的注解版本。
- [编译器插件设置](/docs/setup/compiler-plugin)：安装编译器插件 DSL 所需的插件。