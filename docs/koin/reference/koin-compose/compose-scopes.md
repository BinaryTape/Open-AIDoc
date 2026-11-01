---
title: Compose 中的作用域
---

# Compose 中的作用域

本页涵盖了为 UI 树的一部分打开 Koin 作用域的 Compose 函数：`KoinScope`、`KoinNavigationScope`、`UnboundKoinScope`，以及 Android 的 `KoinActivityScope` 和 `KoinFragmentScope`。在此类代码块内，`koinInject()` 和 `koinViewModel()` 会从该作用域解析依赖项。关于作用域的工作原理以及如何声明它们，在[作用域](/docs/reference/koin-core/scopes)中进行了说明。

本页上的大多数函数均标记为 `@KoinExperimentalAPI`。请使用 `@OptIn(KoinExperimentalAPI::class)` 启用。

## KoinScope {id="koinscope"}

`KoinScope` 获取或创建一个作用域，将其提供给其子项，并在 Composable 离开组合（composition）时将其关闭。

声明作用域：

**编译器插件 DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scoped<FeatureCache>()
        scoped<FeatureRepository>()
    }
}
```

**注解**
```kotlin
class FeatureScope

@Scope(FeatureScope::class)
class FeatureCache

@Scope(FeatureScope::class)
class FeatureRepository(private val cache: FeatureCache)
```

**构造函数 / 传统 DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scopedOf(::FeatureCache)
        scopedOf(::FeatureRepository)
    }
}
```

在 Compose 中打开它：

```kotlin
import org.koin.compose.scope.KoinScope

@Composable
fun FeatureScreen() {
    KoinScope<FeatureScope>(scopeID = "feature") {
        FeatureContent()
    }
}

@Composable
fun FeatureContent() {
    val repository = koinInject<FeatureRepository>() // 从 FeatureScope 解析
}
```

`KoinScope` 有三种形式：

| 形式 | 作用域 |
|------|-------|
| `KoinScope<T>(scopeID) { }` | 获取或创建具有该 ID 的作用域，由类型 `T` 限定 |
| `KoinScope(scopeID, scopeQualifier) { }` | 获取或创建具有该 ID 和限定符的作用域 |
| `KoinScope(scopeDefinition = { createScope(...) }) { }` | 由 lambda表达式 返回的作用域，该表达式在 `Koin` 实例上运行 |

当 Composable 被遗忘（离开组合）或放弃时，该作用域会被关闭。根作用域永远不会被关闭。

### 多屏幕流程 {id="multi-screen-flows"}

将 `KoinScope` 放在 `NavHost` 之上，以便在某个流程（例如结账流程）的各个屏幕之间共享作用域限定的对象：

```kotlin
@Composable
fun CheckoutFlow() {
    KoinScope<CheckoutFlowScope>(scopeID = "checkout") {
        NavHost(navController, startDestination = CartRoute) {
            composable<CartRoute> { CartScreen() }
            composable<PaymentRoute> { PaymentScreen() }
        }
    }
}

@Composable
fun PaymentScreen() {
    val state = koinInject<CheckoutState>() // 与 CartScreen 中相同的 CheckoutState
}
```

当 `CheckoutFlow` 离开组合时，作用域关闭。

:::note
在作用域中声明的 `viewModel` 仍存储在当前的 `ViewModelStoreOwner` 中。在 `NavHost` 内部，每个目标目的地都会获取自己的 ViewModel 实例。请通过 `scoped` 对象（例如 `CheckoutState`）在屏幕之间共享状态，或使用 `sharedKoinViewModel()`（参阅 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)）。
:::

## rememberKoinScope {id="rememberkoinscope"}

`rememberKoinScope(scope)` 将你创建的作用域绑定到组合中，但不会将其提供给子项。当 Composable 离开组合时，作用域会被关闭：

```kotlin
@Composable
fun FeatureScreen() {
    val koin = getKoin()
    val scope = rememberKoinScope(remember { koin.createScope<FeatureScope>("feature") })
    val repository = koinInject<FeatureRepository>(scope = scope)
}
```

## KoinNavigationScope {id="koinnavigationscope"}

`KoinNavigationScope` 为每个 Navigation Compose 目标目的地打开一个作用域。它位于 `io.insert-koin:koin-compose-viewmodel-navigation` 中。

使用 `navigationScope { }` 声明定义。它会创建一个由 `NavBackStackEntry` 限定的作用域：

```kotlin
import org.koin.module.dsl.navigationScope

val appModule = module {
    navigationScope {
        scoped<ScreenStateHolder>()
        viewModel<ScreenViewModel>()
    }
}
```

如果使用注解或构造函数 DSL，请在 DSL 模块中使用相同的 `navigationScope { }` 块（在构造函数 DSL 中使用 `scopedOf(::ScreenStateHolder)`）。该作用域没有对应的注解。

包裹每个目标目的地：

```kotlin
NavHost(navController, startDestination = ListRoute) {
    composable<ListRoute> { entry ->
        KoinNavigationScope(entry) {
            ListScreen() // 拥有专属的 ScreenStateHolder
        }
    }
    composable<DetailRoute> { entry ->
        KoinNavigationScope(entry) {
            DetailScreen() // 另一个 ScreenStateHolder
        }
    }
}
```

该作用域 ID 为 `NavBackStackEntry.id`。当目标目的地离开组合时，作用域不会被关闭，因此只要该条目保留在返回堆栈上，它就会一直存在。仅当组合被放弃时它才会被关闭。

:::warning
`KoinNavigationScope` 会在全局 Koin 实例（`KoinPlatform.getKoin()`）中创建其作用域，而不是在组合的 Koin 中。它在 `KoinIsolatedContext` 内部不起作用。
:::

## UnboundKoinScope {id="unboundkoinscope"}

`UnboundKoinScope` 提供一个由你自己管理的作用域。Koin 永远不会关闭它：

```kotlin
@OptIn(KoinDelicateAPI::class, KoinExperimentalAPI::class)
@Composable
fun SessionArea(sessionScope: Scope) {
    UnboundKoinScope(scope = sessionScope) {
        SessionContent()
    }
}
```

当作用域的生命周期不遵循 UI 树时使用它：例如登录时打开的用户会话，或由多个组合根共享的作用域。它被标记为 `@KoinDelicateAPI`：你必须自行调用 `scope.close()`，否则作用域及其对应实例将一直留在内存中。

## Android 作用域 {id="android-scopes"}

这些函数位于 `io.insert-koin:koin-androidx-compose`（`KoinActivityScope`、`KoinFragmentScope`）以及 `koin-compose` 的 Android 目标平台（`koinActivityInject`）中。Activity 或 Fragment 必须实现 `AndroidScopeComponent`。关于声明 Activity 和 Fragment 作用域的内容，请参阅 [Android 作用域](/docs/reference/koin-android/scope)。

```kotlin
class MainActivity : ComponentActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KoinActivityScope {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val presenter = koinInject<MainPresenter>() // 从 Activity 作用域解析
}
```

`KoinFragmentScope { }` 在由 Fragment 托管的 `ComposeView` 中执行相同的操作。

`koinActivityInject()` 可以在任意嵌套层级从 Activity 作用域解析依赖项，无需外层包裹代码块：

```kotlin
@Composable
fun DeepNestedScreen() {
    val session: SessionManager = koinActivityInject()
}
```

如果 `LocalActivity` 未实现 `AndroidScopeComponent`，它将执行失败。

## 对比 {id="comparison"}

| API | 作用域生命周期 | 关闭者 |
|-----|----------------|-----------|
| `KoinScope` | Composable | Koin，当 Composable 离开组合时 |
| `rememberKoinScope` | Composable | Koin，当 Composable 离开组合时 |
| `KoinNavigationScope` | 返回堆栈条目 | Koin，仅当组合被放弃时 |
| `UnboundKoinScope` | 由你管理 | 你 |
| `KoinActivityScope` | Activity | Activity 作用域 (`activityScope()`) |
| `KoinFragmentScope` | Fragment | Fragment 作用域 (`fragmentScope()`) |

## 相关内容 {id="related"}

- [作用域](/docs/reference/koin-core/scopes)：声明作用域、链接作用域、关闭作用域。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment 和 ViewModel 作用域。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：跨导航图共享 ViewModel。
- [生命周期与状态](/docs/reference/koin-compose/compose-lifecycle)：各 Compose API 释放的内容及其时机。
- [动态模块](/docs/reference/koin-compose/compose-modules)：随 Composable 一起加载模块。