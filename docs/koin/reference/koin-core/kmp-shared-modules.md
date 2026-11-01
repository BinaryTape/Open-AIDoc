---
title: KMP 共享模式
---

# KMP 共享模式

本页介绍了如何在 Kotlin Multiplatform 项目中声明因平台而异的定义：带有 `expect`/`actual` 的平台模块、`expect`/`actual` 类，以及针对每个平台具有一个实现的接口。本文假设您的项目已按照 [KMP 设置](/docs/reference/koin-core/kmp-setup)完成配置。有关 `expect`/`actual` 的 Kotlin 规则，请参阅 [Kotlin 文档](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)。

## 组织共享模块 {id="organizing-shared-modules"}

将所有不依赖于特定平台的内容放入 `commonMain` 模块中（可按层或按功能划分），并通过 `includes()` 进行组装：

```kotlin
// commonMain
val dataModule = module {
    single<ApiClient>()
    single<UserRepository>()
}

val domainModule = module {
    factory<GetUserUseCase>()
}

val appModule = module {
    includes(dataModule, domainModule, platformModule())
}
```

模块组合在[模块](/docs/reference/koin-core/modules)中进行了说明。本页的其余部分将讨论 `platformModule()`：即因平台而异的部分。

## 平台模块 {id="platform-module"}

在 `commonMain` 中使用 `expect` 声明模块，并在每个平台上编写对应的 `actual`。每个平台模块声明其自身的类：

**Compiler Plugin DSL**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
class AndroidComponent(private val context: Context) : PlatformComponent {
    override fun getInfo() = "Android ${context.packageName}"
}

actual fun platformModule(): Module = module {
    single<AndroidComponent>() bind PlatformComponent::class
}
```

```kotlin
// iosMain
class IOSComponent : PlatformComponent {
    override fun getInfo() = "iOS"
}

actual fun platformModule(): Module = module {
    single<IOSComponent>() bind PlatformComponent::class
}
```

**Annotations**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

@Module
expect class PlatformModule
```

```kotlin
// androidMain
@Module
@ComponentScan
actual class PlatformModule

@Singleton
class AndroidComponent(private val context: Context) : PlatformComponent {
    override fun getInfo() = "Android ${context.packageName}"
}
```

```kotlin
// iosMain
@Module
@ComponentScan
actual class PlatformModule

@Singleton
class IOSComponent : PlatformComponent {
    override fun getInfo() = "iOS"
}
```

每个 `actual` 模块会扫描其自身的源集，因此它仅能查找到该平台的类。`@Singleton` 会将该类与其超类型绑定，因此 `PlatformComponent` 会解析为具体的平台类。可在公共模块中使用 `@Module(includes = [PlatformModule::class])` 包含 `PlatformModule`。

**Constructor / Classic DSL**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::AndroidComponent) bind PlatformComponent::class
}
```

```kotlin
// iosMain
actual fun platformModule(): Module = module {
    singleOf(::IOSComponent) bind PlatformComponent::class
}
```

当各平台的实现需要不同的构造函数形参时，请使用此模式。通用代码仅依赖于 `PlatformComponent` 接口，并且各平台可以自由注入自身所需的内容（此处为 Android 上的 `Context`）。在 Android 上，一旦在启动时设置了 `androidContext()`，即可解析 `Context`（请参阅 [KMP 设置](/docs/reference/koin-core/kmp-setup)）。

### 平台库 {id="platform-libraries"}

平台驱动程序和引擎（SQLDelight、Ktor 客户端引擎、设置）是通过函数调用构建的。可以在平台模块中通过 lambda 声明它们：

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<SqlDriver> { AndroidSqliteDriver(AppDatabase.Schema, androidContext(), "app.db") }
    single<HttpClientEngine> { OkHttp.create() }
}

// iosMain
actual fun platformModule(): Module = module {
    single<SqlDriver> { NativeSqliteDriver(AppDatabase.Schema, "app.db") }
    single<HttpClientEngine> { Darwin.create() }
}
```

随后通用模块无需感知具体平台即可基于它们构建：`single { AppDatabase(get()) }`、`single { HttpClient(get<HttpClientEngine>()) }`。有关声明非自有类的其他方式，请参阅[定义](/docs/reference/koin-core/definitions)。

## expect/actual 类 {id="expect-actual-class"}

当类在每个平台上具有相同的构造函数时，可以在通用代码中声明一次，并让每个平台分别实现它：

**Compiler Plugin DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    single<NativeComponent>()
}
```

```kotlin
// androidMain
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "Android NativeComponent"
}

// iosMain
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "iOS NativeComponent"
}
```

**Annotations**
```kotlin
// commonMain
@Module
@ComponentScan
class NativeComponentModule

@Singleton
expect class NativeComponent() {
    fun getInfo(): String
}
```

```kotlin
// androidMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "Android NativeComponent"
}

// iosMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "iOS NativeComponent"
}
```

您还可以通过通用 `@Module` 类的提供程序函数来声明 `expect` 类：

```kotlin
// commonMain
@Module
class NativeModule {
    @Factory
    fun nativeComponent(): NativeComponent = NativeComponent()
}
```

**Constructor / Classic DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    singleOf(::NativeComponent)
}
```

其 `actual` 类与其他标签页中的相同。

`expect` 类对所有平台具有统一的构造函数契约。如果某个平台需要其他依赖项（例如 Android 的 `Context`），则无法单独为该平台添加该依赖项。此时应改用带有接口的[平台模块](#platform-module)模式，或者使用平台包装器（请参阅 [KMP 平台集成](/docs/reference/koin-mp/kmp)）。

## 仅存在于单一平台上的组件 {id="components-on-one-platform-only"}

平台模块可以声明仅存在于某一个平台上而其他平台不存在的类。其他平台保留空模块即可：

**Compiler Plugin DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<NotificationHelper>()
}

// iosMain
actual fun platformModule(): Module = module { }
```

**Annotations**
```kotlin
// androidMain
@Module
@ComponentScan("com.example.app.android")
actual class PlatformModule

// iosMain: 无需声明
@Module
actual class PlatformModule
```

**Constructor / Classic DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::NotificationHelper)
}

// iosMain
actual fun platformModule(): Module = module { }
```

随后仅有 Android 代码可以使用 `NotificationHelper`。通用代码无法引用它，因为该类在 `commonMain` 中并不存在。

## 选择模式 {id="choosing-a-pattern"}

| 场景 | 模式 |
|-----------|---------|
| 每个平台上构造函数相同 | `expect`/`actual` 类 |
| 每个平台的构造函数形参不同 | 通用代码中定义接口，平台模块中实现 |
| 通过函数构建的平台库（驱动程序、引擎） | 平台模块中的 Lambda |
| 仅存在于单一平台上的类 | 平台模块，在其他平台上为空 |
| 共享代码需要 Android `Context` | 平台包装器，请参阅 [KMP 平台集成](/docs/reference/koin-mp/kmp) |

## 限制 {id="limits"}

- **手动装配**：如果提供程序函数接收 Koin `Scope` 并自行调用 `scope.get()`，则该调用是动态的，不受[编译期安全](/docs/reference/koin-compiler/compile-safety)保障。建议优先使用构造函数形参。
- **测试**：共享模块可以在 `commonTest` 中进行测试。请参阅[测试](/docs/reference/koin-test/testing)。

## 相关内容 {id="related"}

- [KMP 设置](/docs/reference/koin-core/kmp-setup)：依赖项以及共享的 `initKoin` 函数。
- [KMP 平台集成](/docs/reference/koin-mp/kmp)：共享代码中的 Android Context、Swift 互操作、桌面和 Web。
- [模块](/docs/reference/koin-core/modules)：`includes()`、`@Module`、`@ComponentScan`、`@Configuration`。
- [定义](/docs/reference/koin-core/definitions)：绑定、提供程序函数、非自有的类。
- [ViewModel](/docs/reference/koin-core/viewmodel)：在 `commonMain` 中声明的 ViewModel。