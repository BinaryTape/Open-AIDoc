---
title: Koin vs Hilt
---

# Koin vs Hilt

本页面向熟悉其中一种框架并希望了解另一种的 Android 开发者，对 Koin 与 Hilt（以及 Hilt 所基于的 Dagger）进行了对比。内容涵盖各框架如何构建依赖图、代码结构对比以及各自的优势所在。若要将项目从 Hilt 迁移到 Koin，请参阅[从 Hilt 迁移](/docs/reference/koin-android/hilt-migration)。

下文中的 Koin 示例使用了注解，因为这种方式最接近 Hilt。同样的定义也可以使用 Koin DSL 编写（请参阅[选择你的风格](/docs/intro/choosing-your-style)）。

## 各自如何构建依赖图 {id="how-each-one-builds-the-graph"}

**Hilt** 在构建时通过注解处理（KSP 或 kapt）生成 Java 源代码形式的依赖图。在应用编译时，每个绑定、组件和作用域均已确定。在运行时，应用会直接调用生成的工厂，无需进行查找。

**Koin** 将依赖图保存在运行时容器中。定义在 Koin 启动时注册，实例在被请求时按类型进行解析。通过 [Koin 编译器插件](/docs/intro/koin-compiler-plugin)，在 `startKoin` 时装配的依赖图也会在构建时进行检查，并且插件会生成构造函数的装配代码。若未使用该插件，缺失的定义将在运行时或在[验证测试](/docs/reference/koin-test/verify)中被发现。

这种差异解释了下文中的大部分权衡取舍。

## 一览表 {id="at-a-glance"}

| 切面 | Koin | Hilt |
|--------|------|------|
| 构建依赖图的时机 | 运行时构建，使用编译器插件在构建时检查 | 构建时通过生成代码构建 |
| 缺失绑定的检测时机 | 使用编译器插件在构建时检测，否则在运行时或测试中检测 | 始终在构建时检测 |
| 构建工具链 | Kotlin 编译器插件，使用构造函数或经典 DSL 时可选 | KSP 或 kapt，Hilt Gradle 插件 |
| 支持平台 | Kotlin Multiplatform：Android、iOS、桌面、Web、JVM 服务器 | Android（仅 Dagger 可在 JVM 上运行） |
| 支持语言 | Kotlin | Java 与 Kotlin |
| 在运行时加载或卸载模块 | 支持（`loadKoinModules`、`unloadKoinModules`、惰性模块） | 不支持 |
| 组件层次结构 | 根容器加上你声明的作用域，并提供 Android 作用域原型 | 标准组件的固定层次结构（`SingletonComponent`、`ActivityComponent` 等） |
| Android 入口点 | 在任意 Activity 或 Fragment 中使用 `by inject()`、`by viewModel()` | 在每个类上使用 `@AndroidEntryPoint` |
| Jetpack 集成 | 通过 Koin 库集成 ViewModel、WorkManager、Navigation、Compose | 通过 AndroidX Hilt 库集成 ViewModel、WorkManager、Navigation、Compose |

## Hilt 的优势所在 {id="where-hilt-is-stronger"}

- **构建时拥有完整的图**：Hilt 会生成完整的依赖图，因此每次构建都会对每个模块和作用域中的每个绑定进行验证。Koin 编译器插件仅在入口点验证依赖图，而对于在运行时加载的模块以及独立的库模块，则不在其检查范围内。
- **无运行时查找**：直接调用生成的工厂。Koin 则通过其容器解析每个请求，每次解析都会产生查找开销，且在启动时需要进行注册操作。
- **Java 支持**：Dagger 和 Hilt 适用于 Java 代码库。Koin 的 API 是专为 Kotlin 设计的。
- **生态系统与官方指导**：Hilt 是 Android 官方指南中记录的依赖注入库，许多 AndroidX 库和示例均优先提供 Hilt 集成。
- **详细的错误信息**：Dagger 错误会显示从入口点到缺失绑定的完整路径。

## Koin 的优势所在 {id="where-koin-is-stronger"}

- **Kotlin Multiplatform**：相同的模块可运行在 Android、iOS、桌面、Web 和 Ktor 服务器上。而 Hilt 仅支持 Android。
- **运行时灵活性**：模块可以在启动后进行加载、卸载或在后台加载，非常适合功能开关（feature flags）、动态功能（dynamic features）和插件架构。
- **配置更少**：无需注解处理器，无需生成源文件，无需 `@AndroidEntryPoint`。使用构造函数 DSL 或经典 DSL 时，构建插件是可选的。
- **声明代码更少**：构造函数无需标注 `@Inject`，且接口可以直接绑定到其实现，无需单独的 `@Binds` 模块。
- **自由选择风格**：可使用 DSL 或注解，两者亦可混用。

## 代码对比 {id="code-side-by-side"}

### 包含依赖项的类 {id="a-class-with-dependencies"}

Koin：

```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

Koin 会将 `UserRepositoryImpl` 绑定到 `UserRepository`，因为前者实现了后者。

Hilt：

```kotlin
@Singleton
class UserRepositoryImpl @Inject constructor(private val api: ApiService) : UserRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

### 第三方类 {id="third-party-classes"}

Koin：

```kotlin
@Module
class NetworkModule {
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

Hilt：

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Provides
    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

两者非常接近。Koin 不需要 `@InstallIn`，因为模块并未绑定到特定组件；它也不需要 `@Provides`，因为函数上的 `@Singleton` 本身就已经声明了定义。

### ViewModel {id="viewmodel"}

Koin：

```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// Activity 或 Fragment
val viewModel: UserViewModel by viewModel()

// Compose
val viewModel: UserViewModel = koinViewModel()
```

Hilt：

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// 使用 @AndroidEntryPoint 注解的 Activity 或 Fragment
val viewModel: UserViewModel by viewModels()

// Compose
val viewModel: UserViewModel = hiltViewModel()
```

### 多个 Gradle 模块 {id="several-gradle-modules"}

Koin：

```kotlin
// feature-auth
@Module
@ComponentScan
@Configuration
class AuthModule

// app
@KoinApplication
class MyApp
```

Hilt：

```kotlin
// feature-auth
@Module
@InstallIn(SingletonComponent::class)
class AuthModule { ... }

// app
@HiltAndroidApp
class MyApp : Application()
```

两者都会在类路径（classpath）上发现特性模块：Koin 通过 `@Configuration`，Hilt 通过 `@InstallIn`。在 Koin 中，`@ComponentScan` 还会收集该包下所有带注解的类，因此特性模块通常不需要提供者函数。

## 概念映射 {id="concept-mapping"}

| Hilt | Koin |
|------|------|
| `@HiltAndroidApp` | 搭配 `startKoin<MyApp>()` 使用的 `@KoinApplication`，或 `startKoin { }` |
| `@AndroidEntryPoint` | 不需要：`by inject()` 和 `by viewModel()` 适用于任意 Activity 或 Fragment |
| `@Inject constructor` | 不需要：构造函数由编译器插件读取 |
| `@Binds` | 注解方式自动处理，DSL 中为 `bind` |
| `@Provides` | 函数上的 `@Singleton` 或 `@Factory`，或 DSL 定义 |
| `@InstallIn(SingletonComponent::class)` | `@Configuration` |
| `@HiltViewModel` | `@KoinViewModel` |
| `@Named` | `@Named` |
| `@ActivityScoped`, `@ViewModelScoped` | `@ActivityScope`, `@ViewModelScope` |
| `@AssistedInject` | `@InjectedParam` |

迁移指南提供了完整的映射、分步流程以及在迁移期间如何并行运行这两个框架的方法：请参阅[从 Hilt 迁移](/docs/reference/koin-android/hilt-migration)。

## 相关内容 {id="related"}

- [从 Hilt 迁移](/docs/reference/koin-android/hilt-migration)：分步迁移项目。
- [JSR-330 兼容性](/docs/reference/koin-android/jsr330)：保留 `javax.inject` 注解。
- [什么是 Koin？](/docs/intro/what-is-koin)：Koin 的运行时与编译时模型。
- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：Koin 在构建时检查的内容。
- [选择你的风格](/docs/intro/choosing-your-style)：DSL 还是注解。