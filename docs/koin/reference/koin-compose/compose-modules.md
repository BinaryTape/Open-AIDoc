---
title: 动态模块
---

# 动态模块

本页面介绍了 `rememberKoinModules`，它会在 Composable 进入组合时加载 Koin 模块，并可以在其离开组合时将其卸载。使用它可仅在某个特性的屏幕显示时才加载其定义。你应该了解如何声明[模块](/docs/reference/koin-core/modules)。

`rememberKoinModules` 位于 `io.insert-koin:koin-compose` 中，并被标记为 `@KoinExperimentalAPI`。

## rememberKoinModules {id="rememberkoinmodules"}

```kotlin
import org.koin.compose.module.rememberKoinModules

val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}

@OptIn(KoinExperimentalAPI::class)
@Composable
fun CheckoutScreen() {
    rememberKoinModules(unloadOnForgotten = true) { listOf(checkoutModule) }

    val viewModel = koinViewModel<CheckoutViewModel>()
}
```

该 lambda 会返回要加载的模块。在首次组合 `CheckoutScreen` 时，Koin 会将它们加载到该组合的 Koin 实例中。重组（Recomposition）不会再次加载它们。

请在需要其定义的 `koinInject()` 或 `koinViewModel()` 调用之前调用 `rememberKoinModules`。

## 卸载 {id="unloading"}

默认情况下，在 Composable 离开组合后，模块仍会保持已加载状态。有三个形参可控制卸载：

| 形参 | 默认值 | 效果 |
|-----------|---------|--------|
| `unloadOnForgotten` | `unloadModules` | 当 Composable 离开组合时卸载 |
| `unloadOnAbandoned` | `unloadModules` | 如果组合被废弃则卸载 |
| `unloadModules` | `false` | 上述两个形参的默认值 |

```kotlin
// 在两种情况下均卸载
rememberKoinModules(unloadModules = true) { listOf(checkoutModule) }
```

卸载会移除这些定义并丢弃它们的 `single` 实例。仍然持有该实例引用的代码仍会保留它，但 Koin 将无法再解析该类型。请勿卸载另一个屏幕仍在使用的模块。

## 按导航目标加载 {id="loading-per-destination"}

在导航目标中调用 `rememberKoinModules`，以便在用户导航到某个特性时加载它：

```kotlin
NavHost(navController, startDestination = HomeRoute) {
    composable<HomeRoute> {
        HomeScreen()
    }
    composable<CheckoutRoute> {
        rememberKoinModules(unloadOnForgotten = true) { listOf(checkoutModule) }
        CheckoutScreen()
    }
}
```

## 模块风格 {id="module-styles"}

**编译器插件 DSL**
```kotlin
val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}
```

**注解**
`rememberKoinModules` 接收 `Module` 值。带有 `@Module` 注解的类在启动时通过 `@KoinApplication` 加载（参见[模块](/docs/reference/koin-core/modules)）。若要按需加载某个特性，请使用 DSL 声明其模块。

**构造函数 / 经典 DSL**
```kotlin
val checkoutModule = module {
    factoryOf(::CheckoutRepository)
    viewModelOf(::CheckoutViewModel)
}
```

## 限制 {id="limits"}

- **主线程**：模块在组合期间同步加载。庞大的模块会增加该帧的耗时。若要在启动时于后台加载模块，请参阅[惰性模块](/docs/reference/koin-core/lazy-modules)。
- **重写**：后加载的模块会覆盖先前相同类型的定义（参见[定义](/docs/reference/koin-core/definitions)）。卸载该模块不会恢复先前的定义。
- **预览**：`rememberKoinModules` 需要正在运行的 Koin 实例。对于预览，请使用 `KoinApplicationPreview`（参见 [Compose 测试](/docs/reference/koin-compose/compose-testing)）。

## 相关内容 {id="related"}

- [模块](/docs/reference/koin-core/modules)：声明和组合模块。
- [惰性模块](/docs/reference/koin-core/lazy-modules)：在启动时于后台加载模块。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：在 Compose 外部加载和卸载模块。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：绑定到 Composable 的实例。
- [生命周期与状态](/docs/reference/koin-compose/compose-lifecycle)：各 Compose API 释放的内容及其释放时机。