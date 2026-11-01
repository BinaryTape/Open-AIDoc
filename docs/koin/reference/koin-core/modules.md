---
title: 模块
---

# 模块

模块用于按功能或按层次对相关的定义进行分组。本页面介绍如何声明模块、组合模块、扫描包以查找带注解的类、跨 Gradle 模块发现模块，以及模块的加载顺序。有关模块内部的定义，请参阅[定义](/docs/reference/koin-core/definitions)。

## 声明模块 {id="declare-a-module"}

**编译器插件 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val networkModule = module {
    single<ApiClient>()
    single<TokenManager>()
}

val dataModule = module {
    single<Database>()
    single<UserRepository>()
}
```

**注解**
```kotlin
@Module
@ComponentScan("com.myapp.network")
class NetworkModule

@Module
@ComponentScan("com.myapp.data")
class DataModule
```

`@Module` 类会收集由 `@ComponentScan` 发现的带注解类，以及在其内部声明的提供者函数（请参阅[非自有的类](/docs/reference/koin-core/definitions#classes-you-dont-own)）。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val networkModule = module {
    singleOf(::ApiClient)
    singleOf(::TokenManager)
}

val dataModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
}
```

一个定义可以依赖于来自另一个模块的定义。Koin 会跨所有已加载的模块进行解析，因此 `dataModule` 中的 `UserRepository` 可以使用 `networkModule` 中的 `ApiClient`，而无需在模块之间进行任何导入。但两个模块都必须已被加载，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 使用 `includes()` 组合模块 {id="module-composition-with-includes"}

模块可以包含其他模块。加载父模块即可加载整棵树：

**编译器插件 DSL**
```kotlin
val networkModule = module {
    single<ApiClient>()
}

val storageModule = module {
    single<Database>()
}

val dataModule = module {
    includes(networkModule, storageModule)
    single<UserRepository>()
}

startKoin {
    modules(dataModule)
}
```

**注解**
```kotlin
@Module
class NetworkModule

@Module
class StorageModule

@Module(includes = [NetworkModule::class, StorageModule::class])
@ComponentScan("com.myapp.data")
class DataModule

@KoinApplication(modules = [DataModule::class])
class MyApp
```

**构造函数 / 经典 DSL**
```kotlin
val networkModule = module {
    singleOf(::ApiClient)
}

val storageModule = module {
    singleOf(::Database)
}

val dataModule = module {
    includes(networkModule, storageModule)
    singleOf(::UserRepository)
}

startKoin {
    modules(dataModule)
}
```

相比在 `startKoin` 中传入冗长的扁平列表，更推荐使用带有单个根模块的 `includes()` 树形结构。这样模块的结构就可以契合代码的结构，且启动调用也保持简洁。

即使多个父模块包含了同一个模块，Koin 也会将树展开并仅加载每个模块一次：

```kotlin
val commonModule = module {
    single<Logger>()
}

val featureAModule = module {
    includes(commonModule)
    single<FeatureA>()
}

val featureBModule = module {
    includes(commonModule)
    single<FeatureB>()
}

val appModule = module {
    includes(featureAModule, featureBModule) // commonModule 仅加载一次
}
```

### 多模块项目中的可见性 {id="visibility-in-multi-module-projects"}

在 Gradle 多模块项目中，建议为每个功能公开一个公共模块，其余模块保持 `private` 或 `internal`：

```kotlin
// Gradle 模块 "feature-user"
private val userDataModule = module {
    single<UserDao>()
    single<UserCache>()
}

val userFeatureModule = module {
    includes(userDataModule)
    viewModel<UserViewModel>()
}
```

应用模块只需加载 `userFeatureModule`，并且永远不会感知到其内部模块。有关拆分为 Gradle 模块的 Android 应用完整布局，请参阅[多模块应用](/docs/reference/koin-android/multi-module)。

## 使用 @ComponentScan 扫描包 {id="scan-packages-with-componentscan"}

`@ComponentScan` 仅适用于注解方式。它会收集某个包及其子包中的所有带注解类和顶层函数：

```kotlin
@Module
@ComponentScan
class AppModule // 扫描 AppModule 所在的包

@Module
@ComponentScan("com.myapp.features")
class FeatureModule

@Module
@ComponentScan("com.myapp.data", "com.myapp.network")
class InfraModule
```

如果不提供任何值，它将扫描被注解类所在的包。该扫描可以跨越 Gradle 模块：来自同一包中其他 Gradle 模块的类也会被发现。

对于 DSL 风格，你需要自行在模块中列出每个定义。如果想混合使用两者，只需在启动代码块中将 DSL 模块与带注解的模块一起包含即可（请参阅[使用 @KoinApplication 进行类型化启动](/docs/reference/koin-core/starting-koin#typed-startup-with-koinapplication)）。

## 使用 @Configuration 实现自动发现 {id="auto-discovery-with-configuration"}

`@Configuration` 用于标记 `@Module`，以便 `@KoinApplication` 无需显式列出即可发现它。该模块可以位于类路径上的任何 Gradle 模块中：

```kotlin
// Gradle 模块 "feature-user"
@Module
@Configuration
@ComponentScan("com.myapp.feature.user")
class UserFeatureModule

// Gradle 模块 "app"
@KoinApplication
class MyApp

fun main() {
    startKoin<MyApp>() // 加载 UserFeatureModule
}
```

这样添加功能就只需添加 Gradle 依赖项即可：无需更改应用的模块列表。代价是加载的模块列表不再集中记录在一处。如果你希望显式指定，可以在 `@KoinApplication(modules = [...])` 中列出这些模块。

`@Configuration` 支持标签，因此你可以针对不同环境或渠道（flavor）加载不同的模块。相关规则见[配置标签](/docs/reference/koin-core/starting-koin#configuration-labels)。

`@Configuration` 仅适用于注解，并且需要配合使用类型化启动（`startKoin<MyApp>()`）的 `@KoinApplication`。

## 加载顺序与覆盖 {id="load-order-and-overrides"}

当两个已加载的模块声明了相同的类型时，后加载的模块优先。在 DSL 启动代码块中，这取决于 `modules(...)` 的顺序：

```kotlin
startKoin {
    modules(productionModule, debugModule) // debugModule 的 ApiService 胜出
}
```

使用 `@KoinApplication` 时，编译器插件按以下顺序构建模块列表：

1. 它发现的 `@Configuration` 模块（来自你的代码和依赖项）。
2. 在 `@KoinApplication(modules = [...])` 中列出的模块，按声明顺序加载。

因此，你的应用模块会覆盖库的默认配置：

```kotlin
// 在库中
@Module
@Configuration
class CoreModule {
    @Singleton
    fun feature(): Feature = DefaultFeature()
}

// 在应用中
@Module
class AppModule {
    @Singleton
    fun feature(): Feature = AppFeature()
}

@KoinApplication(modules = [AppModule::class])
class MyApp // get<Feature>() 返回 AppFeature
```

在显式列表中，`modules = [A::class, B::class, C::class]` 会依次加载 A、B、C，且每个模块的 `includes` 保持与其归组在一起。既被显式列出又被 `@Configuration` 发现的模块只会被加载一次，位置取决于它在显式列表中的位置。如需控制多个 `@Configuration` 模块之间的顺序，请显式列出它们。

若要在启动时对意外的覆盖直接报错，请使用 `allowOverride(false)`。有关覆盖单个定义的规则，请参阅[覆盖定义](/docs/reference/koin-core/definitions#overriding-a-definition)。

## 预加载模块 {id="eager-modules"}

可以标记整个模块，使其在 Koin 启动时创建其所有的 `single` 定义：

**编译器插件 DSL**
```kotlin
val coreModule = module(createdAtStart = true) {
    single<ConfigManager>()
    single<CrashReporter>()
}
```

**注解**
```kotlin
@Module(createdAtStart = true)
@ComponentScan("com.myapp.core")
class CoreModule
```

**构造函数 / 经典 DSL**
```kotlin
val coreModule = module(createdAtStart = true) {
    singleOf(::ConfigManager)
    singleOf(::CrashReporter)
}
```

每个预加载定义都会增加启动时间。有关单个定义的标志及其开销，请参阅[预加载创建](/docs/reference/koin-core/definitions#eager-creation)。

## 参数化模块 {id="parameterized-modules"}

DSL 模块是一个值，因此可以通过函数传入实参来构建它：

**编译器插件 DSL**
```kotlin
fun loggingModule(debug: Boolean) = module {
    if (debug) {
        single<DebugLogger>() bind Logger::class
    } else {
        single<ReleaseLogger>() bind Logger::class
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

**注解**
`@Module` 类不接受实参。对于这种情况，请使用 DSL 模块，或者为每个变体定义一个 `@Module` 并通过[配置标签](/docs/reference/koin-core/starting-koin#configuration-labels)进行选择。

**构造函数 / 经典 DSL**
```kotlin
fun loggingModule(debug: Boolean) = module {
    single<Logger> {
        if (debug) DebugLogger() else ReleaseLogger()
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

同样的思路也可用于替换实现：保持 `repositoryModule` 不变，并根据需要在其旁边加载 `localDatasourceModule` 或 `remoteDatasourceModule`，两者各自声明一个 `Datasource`。条件模块列表是在运行时解析的，因此编译器插件无法在构建时验证所有组合。

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：模块内部包含的内容。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：加载模块、类型化启动以及配置标签。
- [惰性模块](/docs/reference/koin-core/lazy-modules)：在后台加载模块。
- [KMP 共享模块](/docs/reference/koin-core/kmp-shared-modules)：在平台之间共享模块。
- [多模块应用](/docs/reference/koin-android/multi-module)：在 Android 上跨 Gradle 模块组织模块。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：`@Module`、`@ComponentScan` 和 `@Configuration` 的所有参数。