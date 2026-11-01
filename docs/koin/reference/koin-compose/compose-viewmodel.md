---
title: Compose 中的 ViewModel
---

# Compose 中的 ViewModel

本页介绍了用于检索 ViewModel 的 Compose 函数：`koinViewModel()`、`sharedKoinViewModel()` 和 `koinActivityViewModel()`。在模块中声明 ViewModel（包含形参、`SavedStateHandle` 或 ViewModel 作用域）在各个平台上都是相同的：请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

本页中的所有函数均位于 `io.insert-koin:koin-compose-viewmodel` 中，但 `sharedKoinViewModel()` 除外，它位于 `io.insert-koin:koin-compose-viewmodel-navigation` 中。关于各个软件包，请参阅 [Koin for Compose](/docs/reference/koin-compose/compose)。

## koinViewModel {id="koinviewmodel"}

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val state by viewModel.state.collectAsState()
    // ...
}
```

`koinViewModel()` 从当前的 `ViewModelStoreOwner`（`LocalViewModelStoreOwner`）获取 ViewModel，并在首次调用时通过 Koin 创建它。该实例的存活时间与其所有者相同：可以是一个 Activity、Fragment 或导航目的地。

将其声明为默认形参可保持 Composable 的可测试性：测试或预览可以传入自定义的实例。

`koinViewModel()` 是一个 Composable 函数。请在 Composable 的函数体中调用它，而不要在诸如 `onClick` 等回调中调用。

### 形参 {id="parameters"}

| 形参 | 默认值 | 用途 |
|-----------|---------|-----|
| `qualifier` | `null` | 选取[已命名的](/docs/reference/koin-core/qualifiers) ViewModel 定义 |
| `viewModelStoreOwner` | `LocalViewModelStoreOwner.current` | 将 ViewModel 存储在另一个所有者中 |
| `key` | `null` | 在同一个所有者中保留相同类的多个实例 |
| `extras` | 所有者的 Extras | 用于构建 `SavedStateHandle` 的 `CreationExtras` |
| `scope` | `currentKoinScope()` | 用于解析 ViewModel 的 Koin 作用域 |
| `parameters` | `null` | 返回[注入参数](/docs/reference/koin-core/injection-parameters)的 Lambda 表达式 |

### 传递参数 {id="passing-parameters"}

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel> { parametersOf(itemId) }
}
```

形参仅在创建 ViewModel 时使用。如果同一个所有者已经持有 `DetailViewModel`，则即使 `itemId` 不同，你也会获取到已有实例。当一个所有者必须为每个值保留一个 ViewModel 时，请添加 `key`：

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel>(key = itemId) {
        parametersOf(itemId)
    }
}
```

在 Navigation Compose 中，每个目的地都有自己的所有者，因此返回堆栈上的屏幕不需要 `key`。

## 与 Navigation Compose 配合使用 {id="with-navigation-compose"}

在 `composable { }` 目的地内，当前的 `ViewModelStoreOwner` 是 `NavBackStackEntry`。`koinViewModel()` 会为每个目的地创建一个 ViewModel，并在目的地出栈时将其清理。它的 `SavedStateHandle` 保存了导航实参：

```kotlin
@Serializable
data class DetailRoute(val itemId: String)

class DetailViewModel(handle: SavedStateHandle) : ViewModel() {
    val itemId: String = handle.toRoute<DetailRoute>().itemId
}

NavHost(navController, startDestination = HomeRoute) {
    composable<DetailRoute> {
        DetailScreen(viewModel = koinViewModel())
    }
}
```

Koin 会为你注入 `SavedStateHandle`：只需将其声明为构造函数形参即可。有关声明端的信息，请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)。

:::warning
`koinNavViewModel()` 在 `koin-compose-viewmodel-navigation` 和 `koin-androidx-compose-navigation` 中均已弃用。请将其替换为具有相同形参的 `koinViewModel()`：导航实参会以相同方式传递至 `SavedStateHandle`。
:::

### 在导航图中共享 ViewModel {id="sharing-a-viewmodel-in-a-navigation-graph"}

`sharedKoinViewModel()` 将 ViewModel 存储在父图的返回堆栈条目中。该导航图的每个目的地都会获取到相同的实例：

```kotlin
import org.koin.compose.viewmodel.sharedKoinViewModel

navigation<BookGraph>(startDestination = BookList) {
    composable<BookList> { entry ->
        val shared = entry.sharedKoinViewModel<BookSharedViewModel>(navController)
        BookListScreen(shared)
    }
    composable<BookDetail> { entry ->
        val shared = entry.sharedKoinViewModel<BookSharedViewModel>(navController)
        BookDetailScreen(shared)
    }
}
```

默认情况下，父图为 `destination.parent?.route`。传入 `navGraphRoute` 可以指定其他图。如果目的地没有父图，`sharedKoinViewModel()` 会回退到 `koinViewModel()`。

## Activity 范围的 ViewModel (Android) {id="activity-wide-viewmodel-android"}

`koinActivityViewModel()` 将 ViewModel 存储在当前的 `ComponentActivity` 中。无论处于哪个导航目的地，该 Activity 的每个 Composable 都会获取到相同的实例：

```kotlin
import org.koin.compose.viewmodel.koinActivityViewModel

@Composable
fun CartBadge() {
    val cart = koinActivityViewModel<CartViewModel>()
}

@Composable
fun CartScreen() {
    val cart = koinActivityViewModel<CartViewModel>() // 与 CartBadge 中的实例相同
}
```

该函数仅在 Android 上可用，如果 `LocalActivity` 不是 `ComponentActivity` 则会失败。它接受与 `koinViewModel()` 相同的 `qualifier`、`key`、`scope` 和 `parameters` 实参。

## 作用域限定的依赖项 {id="scoped-dependencies"}

ViewModel 可以为其依赖项拥有专属作用域（`viewModelScope { }` 或 `@ViewModelScope`）。在 Compose 端无需进行任何更改：`koinViewModel()` 会创建 ViewModel 及其作用域。相关声明在 [ViewModel](/docs/reference/koin-core/viewmodel) 中有详细说明。

## API 概述 {id="api-summary"}

| API | 实例的所有者 | 软件包 |
|-----|-----------------------|---------|
| `koinViewModel()` | `LocalViewModelStoreOwner`（Activity、Fragment、目的地） | `koin-compose-viewmodel` |
| `NavBackStackEntry.sharedKoinViewModel()` | 父导航图条目 | `koin-compose-viewmodel-navigation` |
| `koinActivityViewModel()` | 当前 `ComponentActivity`（Android） | `koin-compose-viewmodel` |
| `koinNavViewModel()` | 已弃用，请使用 `koinViewModel()` | `koin-compose-viewmodel-navigation` |

## 相关内容 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel)：声明 ViewModel、形参、`SavedStateHandle`、ViewModel 作用域。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：在 Activity 和 Fragment 中使用 `by viewModel()`。
- [Navigation 3](/docs/reference/koin-compose/navigation3)：结合 Navigation 3 条目的 ViewModel。
- [生命周期与状态](/docs/reference/koin-compose/compose-lifecycle)：Compose 中各部分的存活周期。
- [Compose 测试](/docs/reference/koin-compose/compose-testing)：测试使用 `koinViewModel()` 的 Composable。