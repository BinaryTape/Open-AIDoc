---
title: 注解参考
---

# 注解参考

本页列出了所有 Koin 注解及其所在软件包、可放置的位置、形参和一个示例。每个条目均链接到解释相应概念的页面。如需配置注解，请参阅[编译器插件设置](/docs/setup/compiler-plugin)。若要对比注解与 DSL，请参阅[选择你的风格](/docs/intro/choosing-your-style)。

这些注解来自 `io.insert-koin:koin-annotations` 构件（版本与 Koin 相同）。Koin 编译器插件在构建时读取它们并生成相应定义。大部分注解位于 `org.koin.core.annotation` 中，仅限 Android 使用的注解位于 `org.koin.android.annotation` 中。

## 速览 {id="at-a-glance"}

| 注解 | 软件包 | 声明内容 |
|------------|---------|----------|
| [`@Singleton` / `@Single`](#singleton--single) | `org.koin.core.annotation` | 一个 `single` 定义 |
| [`@Factory`](#factory) | `org.koin.core.annotation` | 一个 `factory` 定义 |
| [`@Scoped`](#scoped) | `org.koin.core.annotation` | 一个 `scoped` 定义 |
| [`@KoinViewModel`](#koinviewmodel) | `org.koin.core.annotation` | 一个 `viewModel` 定义 |
| [`@KoinWorker`](#koinworker) | `org.koin.android.annotation` | 一个 WorkManager `worker` 定义 |
| [`@Scope`](#scope) | `org.koin.core.annotation` | 定义所属的作用域 |
| [`@ViewModelScope`](#viewmodelscope) | `org.koin.core.annotation` | ViewModel 作用域中的定义 |
| [`@ActivityScope`](#activityscope) | `org.koin.android.annotation` | Activity 作用域中的定义 |
| [`@ActivityRetainedScope`](#activityretainedscope) | `org.koin.android.annotation` | retained Activity 作用域中的定义 |
| [`@FragmentScope`](#fragmentscope) | `org.koin.android.annotation` | Fragment 作用域中的定义 |
| [`@ScopeId`](#scopeid) | `org.koin.core.annotation` | 从给定作用域解析的形参 |
| [`@Named`](#named) | `org.koin.core.annotation` | 字符串限定符 |
| [`@Qualifier`](#qualifier) | `org.koin.core.annotation` | 类型或字符串限定符 |
| [`@InjectedParam`](#injectedparam) | `org.koin.core.annotation` | 由调用方传入的形参 |
| [`@Property`](#property) | `org.koin.core.annotation` | 从 Koin 属性中读取的形参 |
| [`@PropertyValue`](#propertyvalue) | `org.koin.core.annotation` | 属性的默认值 |
| [`@Provided`](#provided) | `org.koin.core.annotation` | 在受检图之外提供的类型 |
| [`@Module`](#module) | `org.koin.core.annotation` | 一个模块类 |
| [`@ComponentScan`](#componentscan) | `org.koin.core.annotation` | 用于扫描定义的软件包 |
| [`@Configuration`](#configuration) | `org.koin.core.annotation` | 模块的配置标签 |
| [`@KoinApplication`](#koinapplication) | `org.koin.core.annotation` | 应用程序入口点 |
| [`@Monitor`](#monitor) | `org.koin.core.annotation` | 由 Kotzilla SDK 跟踪的函数 |

## 定义 {id="definitions"}

定义注解可置于类上（由 Koin 调用其构造函数）或函数上（由 Koin 调用顶层函数或 `@Module` 类内部的函数）。构造函数与函数形参均从容器中解析。关于每种形参类型的解析方式，请参阅：[定义](/docs/reference/koin-core/definitions#constructor-parameters)。

当 `binds` 为空时，定义将绑定到其自身类及所有超类型。在 `binds` 中列出具体类型可仅绑定这些类型。

### @Singleton / @Single {id="singleton-single"}

目标：`CLASS`、`FUNCTION`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要绑定的类型。为空时绑定所有超类型 |
| `createdAtStart` | `Boolean` | `false` | 在 Koin 启动时创建实例 |

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

`@Singleton` 和 `@Single` 是等效的；推荐使用 JSR-330 名称 `@Singleton`。在容器的整个生命周期中只保留一个实例。相关概念：[定义](/docs/reference/koin-core/definitions)。

### @Factory {id="factory"}

目标：`CLASS`、`FUNCTION`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要绑定的类型。为空时绑定所有超类型 |

```kotlin
@Factory
class UserPresenter(private val repository: UserRepository)
```

每次请求都会创建一个新实例。相关概念：[定义](/docs/reference/koin-core/definitions)。

### @Scoped {id="scoped"}

目标：`CLASS`、`FUNCTION`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要绑定的类型。为空时绑定所有超类型 |

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionCache(private val repository: UserRepository)
```

每个作用域对应一个实例，并在作用域关闭时释放。配合 `@Scope` 或作用域原型（`@ViewModelScope`、`@ActivityScope` 等）一起使用。相关概念：[作用域](/docs/reference/koin-core/scopes)。

### @KoinViewModel {id="koinviewmodel"}

目标：`CLASS`、`FUNCTION`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要绑定的类型。为空时绑定所有超类型 |

```kotlin
@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

适用于 Android 和 Compose Multiplatform 目标。类路径中需要引入 `io.insert-koin:koin-core-viewmodel`（否则构建将因 `KOIN-A001` 失败）。相关概念：[ViewModel](/docs/reference/koin-core/viewmodel)。

:::note
使用编译器插件时，`@KoinViewModel` 位于 `org.koin.core.annotation` 中。KSP 处理器此前使用的是 `org.koin.android.annotation.KoinViewModel`：迁移时请更新导入（参阅[从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)）。
:::

### @KoinWorker {id="koinworker"}

软件包：`org.koin.android.annotation`（仅限 Android）。目标：`CLASS`、`FUNCTION`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 要绑定的类型 |

```kotlin
@KoinWorker
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository,
) : CoroutineWorker(context, params)
```

需要依赖 `io.insert-koin:koin-android-workmanager`（否则构建将因 `KOIN-A002` 失败）。相关概念：[WorkManager](/docs/reference/koin-android/workmanager)。

## 作用域 {id="scopes"}

### @Scope {id="scope"}

目标：`CLASS`、`FUNCTION`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 作用域类型 |
| `name` | `String` | `""` | 作用域名称，用于替代类型 |

```kotlin
@Scope(UserSession::class)
class SessionCache(private val repository: UserRepository)

@Scope(name = "checkout")
class CheckoutState
```

将定义放入给定的作用域中。单独使用时，`@Scope` 会声明一个 `scoped` 定义。添加 `@Scoped`、`@Factory` 或 `@KoinViewModel` 可选择其他类型或设置 `binds`。相关概念：[作用域](/docs/reference/koin-core/scopes)。

### @ViewModelScope {id="viewmodelscope"}

目标：`CLASS`、`FUNCTION`。无形参。

```kotlin
@ViewModelScope
class UserSessionCache(private val repository: UserRepository)
```

在 ViewModel 的作用域中声明一个 scoped 定义，该定义随 ViewModel 一起创建，并在 ViewModel 被清除时关闭。相关概念：[作用域](/docs/reference/koin-core/scopes)。

### @ActivityScope {id="activityscope"}

软件包：`org.koin.android.annotation`（仅限 Android）。目标：`CLASS`、`FUNCTION`。无形参。

```kotlin
@ActivityScope
class ScreenTracker(private val analytics: Analytics)
```

在 Activity 作用域中声明一个 scoped 定义。该 Activity 必须提供相应作用域（参阅 [Android 作用域](/docs/reference/koin-android/scope)）。

### @ActivityRetainedScope {id="activityretainedscope"}

软件包：`org.koin.android.annotation`（仅限 Android）。目标：`CLASS`、`FUNCTION`。无形参。

```kotlin
@ActivityRetainedScope
class FormState
```

在 retained Activity 作用域中声明一个 scoped 定义，该作用域在配置更改后仍然有效。参阅 [Android 作用域](/docs/reference/koin-android/scope)。

### @FragmentScope {id="fragmentscope"}

软件包：`org.koin.android.annotation`（仅限 Android）。目标：`CLASS`、`FUNCTION`。无形参。

```kotlin
@FragmentScope
class ListAdapterFactory
```

在 Fragment 作用域中声明一个 scoped 定义。参阅 [Android 作用域](/docs/reference/koin-android/scope)。

### @ScopeId {id="scopeid"}

目标：`VALUE_PARAMETER`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 作用域类型。作用域 ID 为该类的完整类名 |
| `name` | `String` | `""` | 作用域 ID |

```kotlin
@Factory
class ProfileService(@ScopeId(name = "user_session") val session: UserSession)
```

从具有该 ID 的作用域（而非当前作用域）解析形参（生成的代码形如 `getScope("user_session").get()`）。由于该作用域仅在运行时存在，编译时安全性检查不会对其进行校验。相关概念：[作用域](/docs/reference/koin-core/scopes)。

## 限定符 {id="qualifiers"}

### @Named {id="named"}

目标：`CLASS`、`FUNCTION`、`VALUE_PARAMETER`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `String` | `""` | 字符串限定符 |
| `type` | `KClass<*>` | `Unit::class` | 类型限定符。使用编译器插件时，请改用 `@Qualifier(Type::class)` |

```kotlin
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
class UserRepository(@Named("local") private val database: Database)
```

定义处和形参处使用相同的字符串即可将它们关联起来。`jakarta.inject.Named` 和 `javax.inject.Named` 的读取方式相同。相关概念：[限定符](/docs/reference/koin-core/qualifiers)。

### @Qualifier {id="qualifier"}

目标：`CLASS`、`FUNCTION`、`VALUE_PARAMETER`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 类型限定符 |
| `name` | `String` | `""` | 字符串限定符 |

```kotlin
@Singleton
@Qualifier(Remote::class)
class RemoteDataSource : DataSource

@Singleton
class UserRepository(@Qualifier(Remote::class) private val source: DataSource)
```

`@Qualifier` 还用于标记自定义限定符注解。所有带有 `@Qualifier` 或 `@Named`（以及 `jakarta.inject.Qualifier`、`javax.inject.Qualifier`）注解的注解类都会变成限定符：

```kotlin
@Qualifier
annotation class IoDispatcher

@Singleton
@IoDispatcher
fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
```

没有实参的自定义限定符是以该注解类作为类型限定符。带有字符串或枚举实参（`@Dispatcher(AppDispatchers.IO)`）时，该实参值即为限定符。相关概念：[限定符](/docs/reference/koin-core/qualifiers)。

## 形参 {id="parameters"}

### @InjectedParam {id="injectedparam"}

目标：`VALUE_PARAMETER`。无形参。

```kotlin
@Factory
class UserPresenter(@InjectedParam val userId: String, private val repository: UserRepository)

// 调用方
val presenter: UserPresenter = get { parametersOf("user-42") }
```

该值来自调用站点的 `parametersOf(...)`，而非来自容器。编译时安全性会检查调用站点传入的值数量和类型是否正确（`KOIN-D005`、`KOIN-D006`）。相关概念：[注入形参](/docs/reference/koin-core/injection-parameters)。

### @Property {id="property"}

目标：`VALUE_PARAMETER`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `String` | 必填 | 属性键 |

```kotlin
@Factory
class ApiClient(@Property("api_url") val url: String)
```

使用 `getProperty("api_url")` 解析该形参。如果存在具有相同键的 `@PropertyValue`，则将其作为回退值。如果没有回退值，构建时会显示警告 `KOIN-P001`，且必须在启动时设置该属性。相关概念：[属性](/docs/reference/koin-core/starting-koin#properties)。

### @PropertyValue {id="propertyvalue"}

目标：`FIELD`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `String` | 必填 | 属性键 |

```kotlin
@PropertyValue("api_url")
val defaultApiUrl = "https://api.example.com"

@Factory
class ApiClient(@Property("api_url") val url: String)
```

声明未设置该属性时使用的默认值（生成的代码形如 `getProperty("api_url", defaultApiUrl)`）。

### @Provided {id="provided"}

目标：`CLASS`、`FUNCTION`、`VALUE_PARAMETER`。无形参。

```kotlin
@Singleton
class AnalyticsService(@Provided val firebase: FirebaseAnalytics)
```

告知编译时安全性检查：该类型在运行时可用，无需其可见的声明（平台对象、SDK、稍后加载的模块）。置于类上时，将跳过该类型的所有使用处。置于形参上时，仅跳过该形参。运行时解析不受影响。常见的 Android 类型（`Context`、`Activity`、`Fragment`、`SavedStateHandle`、`WorkerParameters` 等）不需要此注解。相关概念：[编译时安全性](/docs/reference/koin-compiler/compile-safety#external-types-provided)。

## 模块与应用程序 {id="modules-and-application"}

### @Module {id="module"}

目标：`CLASS`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `includes` | `Array<KClass<*>>` | `[]` | 要包含的其他 `@Module` 类 |
| `createdAtStart` | `Boolean` | `false` | 在 Koin 启动时创建该模块的 `single` 定义 |

```kotlin
@Module(includes = [NetworkModule::class])
class DataModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()
}
```

对定义进行分组：包含类内部带注解的函数，以及由 `@ComponentScan` 发现的带注解的类。相关概念：[模块](/docs/reference/koin-core/modules)。

### @ComponentScan {id="componentscan"}

目标：`CLASS`、`FIELD`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 为空 | 要扫描的软件包。为空时扫描带注解的类所在的软件包 |

```kotlin
@Module
@ComponentScan("com.myapp.data", "com.myapp.domain")
class AppModule
```

跨 Gradle 模块将给定软件包及其子包中所有带注解的类和顶层函数添加到该模块中。相关概念：[模块](/docs/reference/koin-core/modules)。

:::note
编译器插件按包名及其子包进行匹配。不支持 KSP 处理器的通配符模式（`com.example.**`、`com.*.service`）：请改为明确列出各个软件包。
:::

### @Configuration {id="configuration"}

目标：`CLASS`、`FIELD`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 为空 | 配置标签。为空表示 `"default"` |

```kotlin
@Module
@ComponentScan
@Configuration
class CoreModule            // 标签 "default"

@Module
@Configuration("default", "test")
class FakeDataModule        // 标签 "default" 和 "test"
```

`@KoinApplication` 会加载带有其任一配置标签的所有模块（包括来自其他 Gradle 模块的模块），无需逐一列出。`@Configuration("default")` 与 `@Configuration` 等效。相关概念：[模块](/docs/reference/koin-core/modules)。

### @KoinApplication {id="koinapplication"}

目标：`CLASS`

| 形参 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `configurations` | `Array<String>` | `[]` | 要加载的配置标签。为空时加载 `"default"` |
| `modules` | `Array<KClass<*>>` | `[Unit::class]`（无） | 额外要加载的 `@Module` 类 |

```kotlin
@KoinApplication(modules = [AppModule::class])
object MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

标记入口点。使用 `startKoin<MyApp>()`、`koinApplication<MyApp>()` 或 `koinConfiguration<MyApp>()`（软件包 `org.koin.plugin.module.dsl`）启动它。编译时安全性在此处检查完整的依赖图。来自 `@Configuration` 的模块会先加载，然后按顺序加载 `modules` 列表，因此显式列表在发生重写时胜出。相关概念：[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 监视 {id="monitoring"}

### @Monitor {id="monitor"}

目标：`CLASS`、`FUNCTION`。无形参。

```kotlin
@Monitor
class UserService(private val repository: UserRepository) {
    fun findUser(id: String): User? = repository.findById(id)
}
```

编译器插件使用 Kotzilla SDK 跟踪包装函数体（或该类的所有公共函数）。它需要类路径中包含 Kotzilla SDK（`io.kotzilla:kotzilla-core`）。若缺少该依赖项，构建时会显示警告 `KOIN-M001`，且不会跟踪任何内容。配置和收集的数据说明：[Monitor](/docs/tooling/monitor)。

## JSR-330 注解 {id="jsr-330-annotations"}

编译器插件还支持读取 `jakarta.inject` 和 `javax.inject` 注解：`@Singleton`、`@Named`、`@Inject` 和 `@Qualifier`。参阅 [JSR-330](/docs/reference/koin-android/jsr330)。

## 已移除的注解 {id="removed-annotations"}

`@ExternalDefinition`、`@MetaDefinition`、`@MetaModule` 和 `@MetaApplication`（软件包 `org.koin.meta.annotations`）曾由 KSP 处理器生成供其内部使用。编译器插件不再使用它们，且你永远不需要手动编写它们。

## 相关内容 {id="related"}

- [定义](/docs/reference/koin-core/definitions)：定义类型、绑定、构造函数形参。
- [模块](/docs/reference/koin-core/modules)：实战中的 `@Module`、`@ComponentScan` 与 `@Configuration`。
- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：插件从这些注解中检查的内容。
- [编译器插件选项](/docs/reference/koin-annotations/options)：插件的 Gradle 选项。
- [DSL 参考](/docs/reference/koin-core/dsl)：各个注解对应的 DSL 等效写法。