---
title: 生命周期与状态
---

# 生命周期与状态

本页介绍使用 Koin 注入的对象在 Compose 生命周期中的表现：重组时会发生什么、当 Composable 离开组合时各个 Koin API 会释放什么，以及应该在何处放置注入调用。本文假定你已了解 `koinInject()` 和 `koinViewModel()`（请参阅 [Koin for Compose](/docs/reference/koin-compose/compose)）以及 [Compose 生命周期](https://developer.android.com/develop/ui/compose/lifecycle)。

## 重组 {id="recomposition"}

`koinInject()` 会解析依赖项一次，并通过 `remember` 将其保留，以限定符、作用域和形参作为键（key）：

```kotlin
@Composable
fun UserScreen(userId: String) {
    val repository = koinInject<UserRepository>() // 解析一次
    val presenter = koinInject<UserPresenter> { parametersOf(userId) } // userId 发生变化时重新解析
}
```

在使用相同键进行重组时，你将获得相同的对象。当键发生变化时（例如新的 `userId`），Koin 会重新进行解析。对于 `single`，将返回相同的实例。对于 `factory`，则会创建一个新实例。

`koinViewModel()` 不使用 `remember`：ViewModel 存储在 `ViewModelStoreOwner` 中，并在重组和 Android 配置更改时保持存活。其形参仅在创建时使用（请参阅 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)）。

两者都是 Composable 函数，因此无法在 `remember { }`、`LaunchedEffect` 或 `onClick` lambda 表达式内部调用。请在 Composable 主体中调用它们，并在 lambda 表达式内部使用解析得到的结果：

```kotlin
@Composable
fun SaveButton() {
    val repository = koinInject<UserRepository>()

    Button(onClick = { repository.save() }) {
        Text("Save")
    }
}
```

## 释放的内容与时机 {id="what-is-released-and-when"}

| API | 在重组时 | 当 Composable 离开组合时 |
|-----|------------------|--------------------------------------------|
| `koinInject()` | 如果键未更改则返回相同对象 | 引用被丢弃。Koin 保留 `single` 或 `scoped` 实例 |
| `koinViewModel()` | 相同的 ViewModel | 无。ViewModel 会随其 `ViewModelStoreOwner` 一起清除 |
| `KoinApplication` | 相同的 Koin 实例 | Koin 保持运行。仅在组合被放弃时停止 |
| `KoinScope`, `rememberKoinScope` | 相同的作用域 | 作用域关闭 |
| `KoinNavigationScope` | 相同的作用域 | 作用域保留。仅在组合被放弃时关闭 |
| `UnboundKoinScope` | 相同的作用域 | 无。由你手动关闭作用域 |
| `rememberKoinModules` | 模块加载一次 | 仅当你设置了 `unloadOnForgotten` 时卸载模块 |

详细信息：[Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)、[动态模块](/docs/reference/koin-compose/compose-modules)。

## 在何处进行注入 {id="where-to-inject"}

在屏幕层级进行注入，并将普通数据和 lambda 表达式向下传递。这样子 Composable 就不需要依赖 Koin，且预览和测试也不需要 Koin 实例：

```kotlin
@Composable
fun UserListScreen(viewModel: UserListViewModel = koinViewModel()) {
    val users by viewModel.users.collectAsState()
    UserList(users = users, onDelete = viewModel::delete)
}

@Composable
fun UserList(users: List<User>, onDelete: (User) -> Unit) {
    LazyColumn {
        items(users) { user -> UserCard(user, onDelete) }
    }
}
```

避免在 `LazyColumn` 项内部使用 `koinInject()`：每个项都会执行自己的解析与 `remember`。应在父级中注入一次，并传递该对象或 lambda 表达式。

### 作为形参传递还是进行注入？ {id="pass-as-a-parameter-or-inject"}

| 作为形参传递 | 使用 Koin 注入 |
|---------------------|------------------|
| 会发生变化的值：ID、搜索查询、选中的项 | 长生命周期的服务：仓库、用例 |
| 导航实参 | 基础架构：数据库、HTTP 客户端 |
| 父级已持有的数据 | ViewModel |

```kotlin
@Composable
fun UserProfile(
    userId: String,                              // 会发生变化：作为形参传递
    repository: UserRepository = koinInject()   // 服务：进行注入
) {
    var user by remember { mutableStateOf<User?>(null) }

    LaunchedEffect(userId) {
        user = repository.getUser(userId)
    }

    user?.let { ProfileContent(it) }
}
```

## 注入的对象与稳定性 {id="injected-objects-and-stability"}

Koin 不会改变 Compose 对类型的识别方式。类型为 `UserRepository` 或 `UserViewModel` 的 Composable 形参根据 Compose 编译器规则被判定为稳定（stable）或不稳定（unstable），就像其他任何类一样。如果跳过（skipping）机制对某个 Composable 很重要，请向其传递稳定值（状态、基本类型、lambda 表达式），而不是注入的对象。

## 副作用 {id="side-effects"}

注入的对象是普通的 Kotlin 对象：可以像其他任何值一样在 `LaunchedEffect`、`DisposableEffect` 或 `SideEffect` 中使用它们。请先在 Composable 主体中解析它们：

```kotlin
@Composable
fun EventScreen() {
    val eventBus = koinInject<EventBus>()

    DisposableEffect(eventBus) {
        val listener = eventBus.subscribe { event -> /* ... */ }
        onDispose { eventBus.unsubscribe(listener) }
    }
}
```

## 相关内容 {id="related"}

- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()` 与启动 Koin。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：ViewModel 所有者与形参。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：绑定到 UI 树的作用域。
- [动态模块](/docs/reference/koin-compose/compose-modules)：随 Composable 加载和卸载模块。
- [Compose 测试](/docs/reference/koin-compose/compose-testing)：预览与 UI 测试。