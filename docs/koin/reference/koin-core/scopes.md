---
title: 作用域
---

# 作用域

作用域（Scope）是一个容器，用于存放生命周期长于 `factory` 但短于 `single` 的实例。本页涵盖声明作用域与作用域定义、创建和关闭作用域实例、链接作用域以及作用域原型。本文假定你已了解[定义](/docs/reference/koin-core/definitions)。

基于本页构建的平台 API 包括：[Android 作用域](/docs/reference/koin-android/scope)（`ScopeActivity`、`AndroidScopeComponent`、`activityScope()`）、[Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)以及 [Ktor 请求作用域](/docs/reference/koin-ktor/ktor-scopes)。

## 作用域的工作原理 {id="how-scopes-work"}

作用域由两部分组成：

- **作用域声明**：模块中的一个区块，由限定符（类型或名称）标识。它列出了属于该作用域的定义。
- **作用域实例**：在运行时根据声明创建，具有唯一的作用域 ID。每个作用域实例都会持有自身对应每个 `scoped` 定义的独立副本，直到你将其关闭。

| 定义 | 实例 |
|------------|----------|
| `single` | 整个容器共用一个 |
| `factory` | 每次请求都创建一个新实例 |
| `scoped` | 每个作用域实例一个，在作用域实例关闭时释放 |

当多个对象必须在有限时间内（登录会话、结账流程、某个界面）共享同一个实例，且该实例在之后必须被丢弃时，请使用作用域。

## 声明作用域 {id="declaring-a-scope"}

**编译器插件 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val sessionModule = module {
    // 由类型标识的作用域
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
        factory<CheckoutPresenter>()
    }

    // 由名称标识的作用域
    scope(named("checkout")) {
        scoped<CheckoutNavigator>()
    }
}
```

**注解**
使用 `@Scope` 标记类以指明它所属的作用域，并使用 `@Scoped` 将其声明为作用域定义。两者都需要：

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(private val sessionData: SessionData)

// 由名称标识的作用域
@Scope(name = "checkout")
@Scoped
class CheckoutNavigator
```

`@Scope(UserSession::class)` 与 `scope<UserSession> { }` 效果相同，而 `@Scope(name = "checkout")` 与 `scope(named("checkout")) { }` 效果相同。这两个注解也适用于 `@Module` 类中的函数。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
        factoryOf(::CheckoutPresenter)
    }

    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
    }
}
```

作用域区块内的 `factory` 会在每次请求时创建一个新实例，但它可以依赖该作用域的作用域实例。

当作用域绑定到特定类（`UserSession`、`MainActivity`）时，请使用类型作为作用域限定符。当没有合适的类时，请使用名称。`scope(named<MyQualifier>())` 则接受类型限定符。

## 创建和关闭作用域 {id="creating-and-closing-a-scope"}

通过 `Koin` 实例创建作用域实例，传入一个 ID 和作用域限定符。这发生在生命周期开始和结束的地方，通常是在入口点（登录和退出屏幕、请求处理程序）：

```kotlin
val koin = KoinPlatform.getKoin()

// 登录时
val scope = koin.createScope<UserSession>(userId)
val cart: CartRepository = scope.get()

// 退出登录时
koin.getScopeOrNull(userId)?.close()
```

作用域类本身（`CartRepository`、`SessionData`）与任何其他定义一样，使用构造函数注入。

| 函数 | 行为 |
|----------|----------|
| `createScope<T>(scopeId)` | 为类型限定符 `T` 创建作用域实例 |
| `createScope(scopeId, qualifier)` | 为任意限定符创建作用域实例，例如 `named("checkout")` |
| `getOrCreateScope(scopeId, qualifier)` | 返回具有该 ID 的已打开作用域，若不存在则创建 |
| `getScope(scopeId)` | 返回已打开的作用域。如果不存在，则抛出 `ScopeNotCreatedException`（"No scope found for id '...'"） |
| `getScopeOrNull(scopeId)` | 返回已打开的作用域，或 `null` |
| `deleteScope(scopeId)` | 从注册表中移除该作用域实例 |

作用域 ID 在处于打开状态的作用域中必须是唯一的。同一声明的两个作用域实例持有不同的实例：

```kotlin
val first = getKoin().createScope<UserSession>("user_1")
val second = getKoin().createScope<UserSession>("user_2")

first.get<SessionData>() !== second.get<SessionData>() // true
```

当调用 `scope.close()` 时：

1. Koin 调用每个作用域实例的 `onClose` 回调，然后释放它们。
2. 该作用域从注册表中移除。
3. 后续对其执行的任何 `get()` 都会抛出 `ClosedScopeException`（"Scope '...' is closed"）。如果不确定，可以检查 `scope.closed`。

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionData>() onClose { it?.clear() }
    }
}
```

若要在作用域本身关闭时运行代码，可通过 `scope.registerCallback()` 注册一个 `ScopeCallback`。

:::warning
手动创建的作用域会一直保持打开状态，直到你将其关闭。它所持有的每个实例都会保留在内存中。请在其生命周期结束时（退出登录、流程结束）将其关闭。在 Android 上，`activityScope()` 和 `fragmentScope()` 会代你关闭作用域：参见 [Android 作用域](/docs/reference/koin-android/scope)。
:::

## 作用域组件 {id="scope-components"}

拥有作用域生命周期的类可以实现 `KoinScopeComponent`。之后其 `get()` 和 `inject()` 调用将从该作用域中解析依赖项。这是一种仅适用于作用域所有者的高级模式：作用域内部的定义仍然通过构造函数接收其依赖项。

```kotlin
class UserSession : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }

    // 从 UserSession 作用域解析
    val cart: CartRepository by inject()

    fun close() {
        scope.close()
    }
}
```

`createScope(this)` 使用类类型作为作用域限定符，使用由类名和哈希码构建的 ID，并将 `this` 作为作用域源。`newScope()` 和 `getOrCreateScope()` 是用于相同目的的惰性委托：`override val scope by newScope()`。

## 作用域内部解析 {id="resolution-inside-a-scope"}

在作用域实例中，Koin 按以下顺序查找定义：

1. 该作用域的定义（或其原型的定义，见下文）。
2. 作用域源。
3. 链接的作用域（按顺序）。包含所有 `single` 和 `factory` 定义的根作用域始终最后链接。

因此，作用域类可以依赖单例以及同一作用域中的其他作用域类：

**编译器插件 DSL**
```kotlin
class CartRepository(
    private val api: ApiService,        // single，来自根作用域
    private val sessionData: SessionData // scoped，来自同一作用域
)

val sessionModule = module {
    single<ApiService>()
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
    }
}
```

**注解**
```kotlin
@Singleton
class ApiService

@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(
    private val api: ApiService,         // single，来自根作用域
    private val sessionData: SessionData // scoped，来自同一作用域
)
```

**构造函数 / 经典 DSL**
```kotlin
val sessionModule = module {
    singleOf(::ApiService)
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
    }
}
```

反之则不行：`single` 不能依赖 `scoped` 定义，且从根作用域调用 `get<SessionData>()` 会因 `NoDefinitionFoundException` 失败。请从作用域实例中解析作用域实例。

### 作用域源 {id="scope-source"}

作用域源是创建作用域的对象，作为 `source` 传入 `createScope(scopeId, qualifier, source)` 中。作用域定义可以像任何其他依赖项一样按类型请求它：

```kotlin
class SessionLogger(private val session: UserSession)

val sessionModule = module {
    scope<UserSession> {
        scoped<SessionLogger>() // 接收创建该作用域的 UserSession
    }
}
```

源仅针对不带限定符的请求进行解析，并在作用域关闭时释放。

### 注入作用域 {id="injecting-the-scope"}

作用域定义可以接收 `Scope` 本身作为构造函数形参，以便稍后解析更多实例或将其关闭。

### 在 Koin 外部创建的实例 {id="instances-created-outside-koin"}

`scope.declare(instance)` 将你已有的对象添加到某个作用域实例中，无需在模块中进行定义：

```kotlin
val scope = getKoin().createScope<UserSession>(userId)
scope.declare(UserProfile(userId, name))
```

## 从另一个作用域解析 {id="resolving-from-another-scope"}

### 链接作用域 {id="linking-scopes"}

`linkTo` 会将另一个作用域添加到解析链中。链接的作用域会在当前作用域之后进行搜索：

```kotlin
val sessionScope = getKoin().createScope<UserSession>(userId)
val checkoutScope = getKoin().createScope("checkout_$userId", named("checkout"))

checkoutScope.linkTo(sessionScope)

// 首先从 checkoutScope 解析，然后是 sessionScope，最后是 root
val cart: CartRepository = checkoutScope.get()
```

`unlink(scope)` 会移除链接。根作用域不能链接到任何内容。

### 指向作用域 ID {id="pointing-at-a-scope-id"}

使用注解时，`@ScopeId` 可以从具有指定 ID 或指定类型的作用域实例中解析一个构造函数形参：

```kotlin
@Factory
class OrderSummary(
    @ScopeId(name = "checkout_main") val navigator: CheckoutNavigator
)

@Factory
class CartBadge(
    @ScopeId(UserSession::class) val cart: CartRepository
)
```

`@ScopeId(name = "checkout_main")` 与 DSL 中的 `getScope("checkout_main").get<CheckoutNavigator>()` 相同。若使用类型，则作用域 ID 为完全限定类名（`"com.example.UserSession"`）。在解析该定义时，必须存在具有此 ID 的作用域实例，否则 `getScope()` 会抛出 `ScopeNotCreatedException`。

## 作用域原型 {id="scope-archetypes"}

通过类型声明的作用域（`scope<MainActivity>`）仅适用于该类型。**作用域原型**（Scope Archetype）是一种通用作用域声明，由同一种类的每个组件共享：每个 ViewModel、每个 Activity、每个 Fragment。你只需声明一次定义，每个组件都会获取自己的作用域实例。

**编译器插件 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }

    // 仅限 Android，koin-android
    activityScope {
        scoped<ActivityPresenter>()
    }
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

**注解**
原型注解替代了 `@Scope` 和 `@Scoped`：

```kotlin
import org.koin.core.annotation.ViewModelScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ViewModelScope
class UserCache(private val api: ApiService)

@ActivityScope
class ActivityPresenter

@FragmentScope
class FragmentPresenter
```

原型注解也适用于 `@Module` 类中的函数。

**构造函数 / 经典 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }

    // 仅限 Android，koin-android
    activityScope {
        scopedOf(::ActivityPresenter)
    }
    fragmentScope {
        scopedOf(::FragmentPresenter)
    }
}
```

| 原型 | DSL | 注解 | 关闭时机 | 平台 |
|-----------|-----|------------|-------------|----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel 被清理时 | 全部 (`koin-core-viewmodel`) |
| Activity | `activityScope { }` | `@ActivityScope` | Activity 被销毁时 | Android |
| Activity retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity 完成时（在配置更改后仍然存留） | Android |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment 被销毁时 | Android |

原型仅声明定义。组件在运行时打开其作用域实例：对于 Android，使用 [Android 作用域](/docs/reference/koin-android/scope) 中描述的 `activityScope()` 和 `fragmentScope()` 委托。

ViewModel 原型需要在启动时提供 `viewModelScopeFactory()` 选项，以便 Koin 为每个 ViewModel 创建一个作用域。它被标记为 `@KoinViewModelScopeApi` 和 `@KoinExperimentalAPI`：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

在其构造函数中接收作用域依赖项的 ViewModel 必须在 `viewModelScope { }` 内声明。有关 ViewModel 的详细信息，请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

:::tip
从未关闭的作用域会使其持有的实例保持存活。若要在真实用户会话中查看打开的作用域和泄漏的实例，请参阅[生产环境监控](/docs/tooling/production-monitoring)。
:::

## 限制 {id="limits"}

- **手动生命周期**：在原型和平台帮助程序之外，你需要自行创建和关闭作用域。Koin 不会检测遗漏的 `close()` 调用。
- **无法从根作用域访问**：`single` 定义和根作用域无法访问 `scoped` 定义。
- **关闭即终止**：已关闭的作用域实例无法重新打开。请使用新的 ID 创建一个新实例。
- **唯一 ID**：使用已打开作用域的 ID 创建作用域会失败。如果作用域可能已经存在，请使用 `getOrCreateScope`。

## 相关内容 {id="related"}

- [Android 作用域](/docs/reference/koin-android/scope)：`ScopeActivity`、`AndroidScopeComponent`、`activityScope()` 和 `fragmentScope()`。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：`KoinScope`、`rememberKoinScope` 和导航作用域。
- [Ktor 请求作用域](/docs/reference/koin-ktor/ktor-scopes)：每个 HTTP 请求一个作用域。
- [ViewModel](/docs/reference/koin-core/viewmodel)：ViewModel 声明和 ViewModel 作用域。
- [定义](/docs/reference/koin-core/definitions)：`single`、`factory`、`scoped` 和 `onClose`。
- [DSL 参考](/docs/reference/koin-core/dsl)：每个作用域 DSL 关键字。