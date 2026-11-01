---
title: 核心概念
---

# 核心概念

本页通过逐步构建一个小示例，解释贯穿所有其他页面的核心理念：定义、模块、Koin 容器、受限标识符、作用域、限定符以及编译时检查。每个章节都很简短，并链接到包含详细内容的页面。本文假设你已了解什么是 SQL 注入（请参阅[什么是 SQL 注入？](/docs/intro/what-is-dependency-injection)）。

代码示例分为三个标签页：Compiler Plugin DSL、Annotations、Constructor / Classic DSL。选择适合你的风格，该选择将适用于所有页面。如果你不确定该使用哪种风格，请阅读[选择你的风格](/docs/intro/choosing-your-style)。

## 示例 {id="the-example"}

三个普通的 Kotlin 类。每个类都在其构造函数中接收所需的依赖项，并且对 Koin 一无所知：

```kotlin
class ApiService

class UserRepository(private val api: ApiService)

class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Koin 的工作就是创建 `ApiService`，将其传递给 `UserRepository`，再将其传递给 `UserViewModel`，无需你手动编写装配代码。

## 定义 {id="definition"}

**定义**会告诉 Koin 如何创建某个类型以及该实例的保留时间：

**Compiler Plugin DSL**
```kotlin
single<ApiService>()
single<UserRepository>()
viewModel<UserViewModel>()
```

**Annotations**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepository(private val api: ApiService)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
singleOf(::ApiService)
singleOf(::UserRepository)
viewModelOf(::UserViewModel)
```

关键字用于设置生命周期。`single` 在整个容器中只保留一个实例。`factory` 在每次请求时都会创建一个新实例。`viewModel` 遵循 ViewModel 生命周期。Koin 读取 `UserRepository` 的构造函数，发现它需要一个 `ApiService`，并从容器中解析它。

详情：[定义](/docs/reference/koin-core/definitions)。

## 模块 {id="module"}

**模块**用于对定义进行分组。通常每个功能或每个层对应一个模块：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Module
@ComponentScan("com.example.app")
class AppModule
```

`@ComponentScan` 会收集 `com.example.app` 软件包及其子包中所有带有注解的类。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepository)
    viewModelOf(::UserViewModel)
}
```

模块只是一种描述。在 Koin 启动并且有人请求实例之前，不会创建任何内容。模块可以包含其他模块，因此大型应用是由小型模块构成的树。

详情：[模块](/docs/reference/koin-core/modules)。

## Koin 容器 {id="the-koin-container"}

`startKoin` 会创建**容器**（一个 `KoinApplication`）并将你的模块加载到其中。你在应用的入口点调用它一次：

**Compiler Plugin DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

**Constructor / Classic DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

在 Android 上，你在 `Application.onCreate()` 中调用它，并通过 `androidContext(this)` 传递 Android 上下文。容器持有已有的定义以及到目前为止创建的实例。`stopKoin()` 会关闭容器并释放所有的 `single`。

详情：[启动 Koin](/docs/reference/koin-core/starting-koin) 和 [在 Android 上启动 Koin](/docs/reference/koin-android/start)。

## 受限标识符 {id="injection"}

对象获取其依赖项的方式有两种。

**构造函数受限标识符**：依赖项是一个构造函数形参，Koin 在创建对象时会将其传入。本示例中的 `UserRepository` 和 `UserViewModel` 已经采用了这种方式。这是默认做法：类保持为普通的 Kotlin 类，并且你可以通过使用伪造对象调用构造函数来进行单元测试。

**从容器中检索**：某些类是由框架创建的，而不是由 Koin 创建的（例如 Android 的 `Activity`、Composable、Ktor 路由）。它们通过 `get()`（立即）或 `inject()`（延迟，首次访问时）向容器请求：

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    ...
}
```

检索在每种风格中都是相同的。将其保留在这些入口点：它们之下的所有内容均使用构造函数受限标识符。

详情：[检索依赖项](/docs/reference/koin-core/injection)、[Android 入口点](/docs/reference/koin-android/entry-points)、[适用于 Compose 的 Koin](/docs/reference/koin-compose/compose)。

## 图 {id="the-graph"}

综合起来，容器持有以下依赖图：

```text
startKoin
  └── appModule
        ├── single     ApiService
        ├── single     UserRepository  ── needs ── ApiService
        └── viewModel  UserViewModel   ── needs ── UserRepository

UserActivity ── by viewModel() ──> UserViewModel
```

当 `UserActivity` 请求 `UserViewModel` 时，Koin 会先创建 `ApiService`（一次），然后创建 `UserRepository`（一次），最后创建与 Activity 的 ViewModel 生命周期绑定的 `UserViewModel`。

## 作用域 {id="scope"}

`single` 的存活时间与容器相同，`factory` 的存活时间取决于调用者保留它的时间。**作用域**涵盖了介于两者之间的场景：存活时间与某些其他事物相同的实例，例如用户会话、屏幕或请求。

假设 `CartRepository` 应该仅在用户登录期间存在：

**Compiler Plugin DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scoped<CartRepository>()
    }
}
```

**Annotations**
```kotlin
class UserSession

@Scope(UserSession::class)
@Scoped
class CartRepository(private val api: ApiService)
```

**Constructor / Classic DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::CartRepository)
    }
}
```

你在会话开始时打开该作用域，并在会话结束时将其关闭：

```kotlin
// inside a KoinComponent
val sessionScope = getKoin().createScope<UserSession>("session-42")
val cart: CartRepository = sessionScope.get()

sessionScope.close() // releases CartRepository
```

作用域定义可以使用来自根容器的定义（此处为 `ApiService`）。在 Android 上，Koin 为 Activity、Fragment 和 ViewModel 提供了开箱即用的作用域，因此你很少需要手动创建作用域。

详情：[作用域](/docs/reference/koin-core/scopes) 和 [Android 作用域](/docs/reference/koin-android/scope)。

## 限定符 {id="qualifier"}

Koin 通过类型查找定义。当两个定义提供相同的类型时，**限定符**会为每个定义指定一个名称：

**Compiler Plugin DSL**
```kotlin
interface NetworkClient

@Named("auth")
class AuthClient : NetworkClient

@Named("public")
class PublicClient : NetworkClient

class UserRepository(@Named("auth") private val client: NetworkClient)

val networkModule = module {
    single<AuthClient>() bind NetworkClient::class
    single<PublicClient>() bind NetworkClient::class
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Singleton
@Named("auth")
class AuthClient : NetworkClient

@Singleton
@Named("public")
class PublicClient : NetworkClient

@Singleton
class UserRepository(@Named("auth") private val client: NetworkClient)
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single<NetworkClient>(named("auth")) { AuthClient() }
    single<NetworkClient>(named("public")) { PublicClient() }
    single { UserRepository(get(named("auth"))) }
}
```

详情：[限定符](/docs/reference/koin-core/qualifiers)。

## 编译时检查 {id="compile-time-checks"}

若不使用编译器插件，缺失定义的情况只会在代码运行时暴露：`get()` 会抛出 `NoDefinitionFoundException`。而使用 [Koin 编译器插件](/docs/intro/koin-compiler-plugin)时，同样的错误会导致构建失败。如果从 `appModule` 中移除 `single<ApiService>()`，编译将中断并显示：

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

该插件会在每个入口点（`startKoin`、`@KoinApplication`、Ktor 的 `install(Koin)`）以及每次调用 `get()`、`inject()` 或 `koinViewModel()` 时检查完整图。如果不使用插件并采用 Constructor 或 Classic DSL，你可以在单元测试中通过 `verify()` 获得类似的检查。

详情：[编译时安全性](/docs/reference/koin-compiler/compile-safety)、[验证你的 Koin 配置](/docs/reference/koin-test/verify)。

## 相关内容 {id="related"}

- [选择你的风格](/docs/intro/choosing-your-style)：使用哪种声明风格。
- [设置](/docs/setup)：将 Koin 和编译器插件添加到你的构建中。
- [教程](/docs/quickstart/kotlin)：利用这些概念构建一个完整的应用。
- [定义](/docs/reference/koin-core/definitions)：详细了解每种定义类型。
- [作用域](/docs/reference/koin-core/scopes)：除 single 和 factory 之外的生命周期。