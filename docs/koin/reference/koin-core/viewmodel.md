---
title: ViewModel
---

# ViewModel

本页面介绍了如何在支持 AndroidX ViewModel 的各个平台（Android、iOS、桌面端、Web）上的 Koin 模块中声明 ViewModel。本文假设你已了解[定义](/docs/reference/koin-core/definitions)。要获取 ViewModel，请参阅具体平台页面：在 Activity 或 Fragment 中使用 `by viewModel()` 请参阅 [Android ViewModel](/docs/reference/koin-android/viewmodel)；使用 `koinViewModel()` 请参阅 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

## 依赖项 {id="dependencies"}

声明 DSL 位于 `koin-core-viewmodel` 中，这是一个多平台构件：

```kotlin
// build.gradle.kts, commonMain
implementation("io.insert-koin:koin-core-viewmodel")
```

注入 API 随平台构件提供：`io.insert-koin:koin-android`（其中包含 `koin-core-viewmodel`）和 `io.insert-koin:koin-compose-viewmodel`。版本由 BOM 统一管理：参见 [Gradle 设置](/docs/setup/gradle)。

## 声明 ViewModel {id="declaring-a-viewmodel"}

**编译器插件 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.viewModel

class UserViewModel(private val repository: UserRepository) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**注解**
```kotlin
import org.koin.core.annotation.KoinViewModel

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

使用编译器插件时，`@KoinViewModel` 位于 `org.koin.core.annotation` 中，并可在公共代码中生效。KSP 处理器则使用 `org.koin.android.annotation.KoinViewModel`。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.viewModelOf
import org.koin.core.module.dsl.viewModel

val appModule = module {
    viewModelOf(::UserViewModel)

    // 或者显式编写构造函数调用
    viewModel { UserViewModel(get()) }
}
```

`viewModel` 定义类似于 `factory`，在每次请求时都会创建一个新实例。平台层的 `ViewModelStore`（Activity、Fragment、导航条目）会保留该实例，因此在 Android 上的配置发生变更时，相同的所有者会取回相同的 ViewModel。请勿将 ViewModel 声明为 `single`：否则它将被所有屏幕共享且永远不会被清除。

## 传递参数 {id="passing-parameters"}

ViewModel 通常需要仅在运行时才知道的值（例如条目 ID）。将构造函数形参标记为注入参数：

**编译器插件 DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()

val appModule = module {
    viewModel<DetailViewModel>()
}
```

**注解**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()
```

**构造函数 / 经典 DSL**
```kotlin
val appModule = module {
    viewModel { params ->
        DetailViewModel(itemId = params.get(), repository = get())
    }
}
```

`viewModelOf(::DetailViewModel)` 同样适用：它会根据调用方传入的值，按类型读取形参。

无论采用何种声明风格，调用方均通过 `parametersOf` 传递该值：

```kotlin
// Android
val viewModel: DetailViewModel by viewModel { parametersOf("item_123") }

// Compose
val viewModel = koinViewModel<DetailViewModel> { parametersOf("item_123") }
```

形参只会在创建 ViewModel 时读取一次。如果同一个所有者使用另一个值再次发起请求，获取到的仍是现有实例。关于形参的更多信息，请参阅[注入参数](/docs/reference/koin-core/injection-parameters)。

## SavedStateHandle {id="savedstatehandle"}

在构造函数中添加 `SavedStateHandle` 形参。Koin 会直接从 ViewModel 的 `CreationExtras` 中创建它，无需额外声明：

**编译器插件 DSL**
```kotlin
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}

val appModule = module {
    viewModel<ProfileViewModel>()
}
```

**注解**
```kotlin
@KoinViewModel
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}
```

**构造函数 / 经典 DSL**
```kotlin
val appModule = module {
    viewModelOf(::ProfileViewModel)

    // 或者：由 get() 解析 SavedStateHandle
    viewModel { ProfileViewModel(get(), get()) }
}
```

在 Android 上，导航实参和 Activity extras 都保存在 `SavedStateHandle` 中。请仅在构造函数中注入它。如果 ViewModel 的所有者没有 `SavedStateRegistryOwner`，Koin 将抛出错误："Koin could not create a SavedStateHandle: the ViewModel's CreationExtras has no SavedStateRegistryOwner."。

## ViewModel 作用域 {id="viewmodel-scope"}

ViewModel 可以拥有一个[作用域](/docs/reference/koin-core/scopes)：依赖项随它一同创建，并在其被清除时一同释放。使用 `viewModelScope` 原型声明它们：

**编译器插件 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }
}
```

**注解**
```kotlin
@ViewModelScope
class UserCache

@KoinViewModel
@ViewModelScope
class UserViewModel(private val cache: UserCache) : ViewModel()
```

**构造函数 / 经典 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }
}
```

在启动时需启用该选项，否则 ViewModel 将无法获得作用域：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

`viewModelScope` 和 `viewModelScopeFactory()` 需要显式选择加入（Opt-in）`@KoinViewModelScopeApi` 与 `@KoinExperimentalAPI`。在构造函数中接收作用域依赖项的 ViewModel 必须在 `viewModelScope { }` 内声明。每个 ViewModel 实例都会获得专属的 `UserCache`，并在 ViewModel 被清除时关闭。

## 限制 {id="limits"}

- **每个所有者仅限一个实例**：一旦该所有者的 ViewModel 实例已经存在，注入的参数将被忽略。若需要第二个实例，请使用不同的键或所有者。
- **不能使用 `single` ViewModel**：单例 ViewModel 永远不会被清除，并且会导致其依赖项泄漏。
- **实验性 ViewModel 作用域**：`viewModelScope` 被标记为实验性功能，未来可能会发生变更。

## 相关内容 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel)：`by viewModel()`、`activityViewModel()`、导航图 ViewModels。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 和导航 ViewModels。
- [注入参数](/docs/reference/koin-core/injection-parameters)：`parametersOf` 与 `@InjectedParam`。
- [作用域](/docs/reference/koin-core/scopes)：作用域原型与作用域生命周期。
- [定义](/docs/reference/koin-core/definitions)：其他定义类型。