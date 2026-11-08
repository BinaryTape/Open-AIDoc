---
title: Navigation 3
---

# Navigation 3

本页展示了如何在 Koin 模块中声明 [Navigation 3](https://developer.android.com/guide/navigation/navigation-3) 条目并将其传递给 `NavDisplay`。每个功能模块贡献其各自的屏幕，而应用程序通过一个条目提供程序收集所有屏幕。本文假定你已了解 Navigation 3 的基础知识（返回栈、`NavDisplay`、`NavEntry`）以及 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

本页上的所有 API 均标记为 `@KoinExperimentalAPI`。

## 配置 {id="setup"}

```kotlin
// shared/build.gradle.kts，或在 Android 上的 app/build.gradle.kts
plugins {
    kotlin("plugin.serialization")
}

commonMain.dependencies {
    implementation("io.insert-koin:koin-compose-navigation3:$koin_version")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:$serialization_version")
}
```

`koin-compose-navigation3` 支持 Android、iOS、JVM 桌面端、JS 和 Wasm。

## 声明条目 {id="declaring-entries"}

路由是带有 `@Serializable` 注解的类：

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val itemId: String)
```

在模块中为每个路由声明一个 `navigation<T> { }`。该 lambda 表达式是一个接收路由的 Composable：

```kotlin
import org.koin.dsl.navigation3.navigation

val homeModule = module {
    viewModel<HomeViewModel>()

    navigation<HomeRoute> {
        HomeScreen(viewModel = koinViewModel())
    }
}

val detailModule = module {
    viewModel<DetailViewModel>()

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route.itemId) })
    }
}
```

每个 `navigation<T>` 均作为由路由类型限定的定义进行存储。该 lambda 表达式以 Koin 的 `Scope` 作为接收者运行，因此你可以在其中调用 `get<T>()` 以及诸如 `koinViewModel()` 等 Composable 函数。

## 构建条目提供程序 {id="building-the-entry-provider"}

`koinEntryProvider()` 将当前作用域的每个 `navigation<T>` 条目收集到一个供 `NavDisplay` 使用的提供程序中：

```kotlin
import org.koin.compose.navigation3.koinEntryProvider

@Composable
fun App() {
    val backStack = remember { mutableStateListOf<Any>(HomeRoute) }

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },
        entryProvider = koinEntryProvider()
    )
}
```

`koinEntryProvider<T>()` 接收返回栈的路由类型：搭配 `rememberNavBackStack()` 使用时的 `NavKey`，或者在 `NavDisplay` 指定了类型时你自己的路由类型（指定类型的 `SceneStrategy`，例如 `rememberSupportingPaneSceneStrategy<Route>()`，会使其成为 `NavDisplay<Route>`）。如果保留为 `Any`，构建将会失败并提示：`Argument type mismatch: actual type is 'Function1<Any, NavEntry<Any>>', but 'Function1<Route, NavEntry<Route>>' was expected.`。

### 在 Android Activity 中 {id="from-an-android-activity"}

在 Android 上，`ComponentCallbacks` 上的两个扩展函数可以从 Activity 或 Fragment 作用域构建提供程序：

| 函数 | 行为 |
|----------|----------|
| `entryProvider<T>()` | 延迟委托：`val provider by entryProvider<Any>()` |
| `getEntryProvider<T>()` | 立即构建提供程序 |

它们从组件的 Koin 作用域进行解析：如果组件实现了 `AndroidScopeComponent`，则为 Activity 作用域，否则为根作用域。

## 作用域内的条目 {id="entries-in-a-scope"}

当屏幕需要与特定作用域同生命周期的对象时，请在作用域内部声明条目。使用 `activityRetainedScope`，它们可以在配置更改（configuration changes）后继续存留：

```kotlin
class Navigator(start: Any) {
    val backStack = mutableStateListOf(start)
    fun goTo(route: Any) { backStack.add(route) }
    fun goBack() { backStack.removeLastOrNull() }
}

val appModule = module {
    activityRetainedScope {
        scoped { Navigator(start = ConversationList) }

        navigation<ConversationList> {
            val navigator = get<Navigator>()
            ConversationListScreen(onClick = { navigator.goTo(ConversationDetail(it)) })
        }

        navigation<ConversationDetail> { route ->
            ConversationDetailScreen(conversationId = route.id)
        }
    }
}

class MainActivity : ComponentActivity(), AndroidScopeComponent {
    override val scope: Scope by activityRetainedScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val navigator: Navigator = get()
            NavDisplay(
                backStack = navigator.backStack,
                onBack = { navigator.goBack() },
                entryProvider = getEntryProvider()
            )
        }
    }
}
```

`getEntryProvider()` 从 Activity 作用域中读取条目。在某个作用域内声明的条目仅对该作用域可见。关于 `activityRetainedScope` 的说明，请参阅 [Android 作用域](/docs/reference/koin-android/scope)。

## 条目的 ViewModel {id="viewmodels-for-an-entry"}

若要将 ViewModel 的作用域限定为其对应的条目，请向 `NavDisplay` 添加 ViewModel store 装饰器。如果不添加，`koinViewModel()` 将使用 Activity 的 store，同一路由的每个条目都会共享同一个实例：

```kotlin
NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryDecorators = listOf(
        rememberSaveableStateHolderNavEntryDecorator(),
        rememberViewModelStoreNavEntryDecorator()
    ),
    entryProvider = koinEntryProvider()
)
```

将路由或其字段作为形参传递：

**编译器插件 DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModel<DetailViewModel>()

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**注解**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

// navigation<T> 条目在 DSL 模块中声明
val detailModule = module {
    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**构造函数 / 经典 DSL**
```kotlin
class DetailViewModel(
    val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModelOf(::DetailViewModel) // route 来自 parametersOf(route)

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

## 条目元数据 {id="entry-metadata"}

`navigation<T>` 接收一个传递给 `NavEntry` 的 `metadata` 映射。可将其用于针对每个条目的转场过渡，或诸如列表-详情等场景策略：

```kotlin
val conversationModule = module {
    navigation<ConversationList>(metadata = ListDetailSceneStrategy.listPane()) {
        ConversationListScreen()
    }

    navigation<ConversationDetail>(metadata = ListDetailSceneStrategy.detailPane()) { route ->
        ConversationDetailScreen(route.id)
    }

    navigation<ModalRoute>(
        metadata = NavDisplay.transitionSpec {
            slideInVertically(initialOffsetY = { it }) togetherWith ExitTransition.KeepUntilTransitionsFinished
        }
    ) {
        ModalScreen()
    }
}
```

然后将场景策略传递给 `NavDisplay`（`sceneStrategy = rememberListDetailSceneStrategy()`）。元数据的键来自 Navigation 3 和自适应布局库，而非来自 Koin。

## 从 Navigation 2 迁移 {id="from-navigation-2"}

| Navigation 2 | 搭配 Koin 的 Navigation 3 |
|--------------|------------------------|
| `NavHost { composable(...) }` 中的字符串或类型化路由 | `@Serializable` 路由类 |
| `NavHost` 中的 `composable<Route> { ... }` | Koin 模块中的 `navigation<Route> { ... }` |
| `NavHost(navController, startDestination)` | `NavDisplay(backStack, entryProvider = koinEntryProvider())` |
| 从 `SavedStateHandle` 读取实参 | 传递给 lambda 表达式的路由对象 |

## API 汇总 {id="api-summary"}

| API | 软件包 | 用途 |
|-----|---------|---------|
| `Module.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | 在模块中声明条目 |
| `ScopeDSL.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | 在作用域中声明条目 |
| `koinEntryProvider<T>(scope)` | `org.koin.compose.navigation3` | 来自当前 Compose 作用域的条目提供程序 |
| `entryProvider<T>()`, `getEntryProvider<T>()` | `org.koin.androidx.compose.navigation3` | 来自 Activity 或 Fragment 的条目提供程序 (Android) |

## 相关内容 {id="related"}

- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 及其所有者。
- [Android 作用域](/docs/reference/koin-android/scope)：`activityRetainedScope` 与 Activity 作用域。
- [注入形参](/docs/reference/koin-core/injection-parameters)：`parametersOf` 与 `@InjectedParam`。
- [面向 Compose 的 Koin](/docs/reference/koin-compose/compose)：软件包与启动 Koin。
- [Navigation 3 方案示例](https://github.com/android/nav3-recipes)：Google 针对 Navigation 3 本身的示例。