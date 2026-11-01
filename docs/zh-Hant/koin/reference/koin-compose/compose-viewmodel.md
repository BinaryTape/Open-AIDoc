---
title: Compose 中的 ViewModel
---

# Compose 中的 ViewModel

本頁涵蓋用於取得 ViewModel 的 Compose 函式：`koinViewModel()`、`sharedKoinViewModel()` 以及 `koinActivityViewModel()`。在模組中宣告帶有參數、`SavedStateHandle` 或 ViewModel 作用域的 ViewModel，在每個平台上都完全相同：請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

本頁中的所有函式均位於 `io.insert-koin:koin-compose-viewmodel` 中，但 `sharedKoinViewModel()` 除外，它位於 `io.insert-koin:koin-compose-viewmodel-navigation` 中。有關軟件包資訊，請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)。

## koinViewModel {id="koinviewmodel"}

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val state by viewModel.state.collectAsState()
    // ...
}
```

`koinViewModel()` 會從目前的 `ViewModelStoreOwner`（`LocalViewModelStoreOwner`）取得 ViewModel，並在第一次使用 Koin 建立它。該執行個體的生命週期與該 owner 相同：Activity、Fragment 或導覽目的地。

將其宣告為預設參數可保持 Composable 的可測試性：測試或預覽可以傳入自訂的執行個體。

`koinViewModel()` 是一個 Composable 函式。請在 Composable 的主體中呼叫它，而不要在像是 `onClick` 這類回呼中呼叫。

### 參數 {id="parameters"}

| 參數 | 預設值 | 用途 |
|-----------|---------|-----|
| `qualifier` | `null` | 選擇[具名](/docs/reference/koin-core/qualifiers) ViewModel 定義 |
| `viewModelStoreOwner` | `LocalViewModelStoreOwner.current` | 將 ViewModel 儲存在另一個 owner 中 |
| `key` | `null` | 在同一個 owner 中保留同一個類別的多個執行個體 |
| `extras` | owner 的 Extras | 用於建置 `SavedStateHandle` 的 `CreationExtras` |
| `scope` | `currentKoinScope()` | 用於解析 ViewModel 的 Koin 作用域 |
| `parameters` | `null` | 回傳[注入參數](/docs/reference/koin-core/injection-parameters)的 Lambda |

### 傳遞參數 {id="passing-parameters"}

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel> { parametersOf(itemId) }
}
```

參數僅在建立 ViewModel 時使用。如果同一個 owner 已經持有 `DetailViewModel`，即使傳入不同的 `itemId`，你仍會取得該既有的執行個體。當一個 owner 必須為每個值持有一個 ViewModel 時，請新增 `key`：

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel>(key = itemId) {
        parametersOf(itemId)
    }
}
```

在使用 Navigation Compose 時，每個目的地都有自己的 owner，因此你不需要為返回堆疊上的畫面設定 `key`。

## 搭配 Navigation Compose {id="with-navigation-compose"}

在 `composable { }` 目的地內部，目前的 `ViewModelStoreOwner` 即為 `NavBackStackEntry`。`koinViewModel()` 會為每個目的地建立一個 ViewModel，並在該目的地從堆疊中彈出時清除。其 `SavedStateHandle` 會保存導覽引數：

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

Koin 會為你注入 `SavedStateHandle`：將其宣告為建構函式參數即可。宣告方面請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

:::warning
`koinNavViewModel()` 在 `koin-compose-viewmodel-navigation` 與 `koin-androidx-compose-navigation` 中皆已被棄用。請改用 `koinViewModel()` 並傳入相同的參數：導覽引數會以相同的方式傳遞至 `SavedStateHandle`。
:::

### 在導覽圖中共享 ViewModel {id="sharing-a-viewmodel-in-a-navigation-graph"}

`sharedKoinViewModel()` 會將 ViewModel 儲存在父導覽圖的返回堆疊項目（back stack entry）中。該導覽圖中的每個目的地都會取得相同的執行個體：

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

預設情況下，父導覽圖為 `destination.parent?.route`。傳入 `navGraphRoute` 則可指定另一個導覽圖。如果目的地沒有父導覽圖，`sharedKoinViewModel()` 會備援採用 `koinViewModel()`。

## Activity 範圍的 ViewModel (Android) {id="activity-wide-viewmodel-android"}

`koinActivityViewModel()` 會將 ViewModel 儲存在目前的 `ComponentActivity` 中。該 Activity 中的每個 Composable 無論處於哪個導覽目的地，都會取得相同的執行個體：

```kotlin
import org.koin.compose.viewmodel.koinActivityViewModel

@Composable
fun CartBadge() {
    val cart = koinActivityViewModel<CartViewModel>()
}

@Composable
fun CartScreen() {
    val cart = koinActivityViewModel<CartViewModel>() // 與 CartBadge 中的執行個體相同
}
```

它僅適用於 Android，且如果 `LocalActivity` 不是 `ComponentActivity` 則會失敗。它接受與 `koinViewModel()` 相同的 `qualifier`、`key`、`scope` 和 `parameters` 引數。

## 具作用域的相依性 {id="scoped-dependencies"}

ViewModel 可以為其相依性擁有一個作用域（`viewModelScope { }` 或 `@ViewModelScope`）。Compose 端沒有任何改變：`koinViewModel()` 會建立 ViewModel 及其作用域。宣告方式請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

## API 摘要 {id="api-summary"}

| API | 執行個體的 Owner | 軟件包 |
|-----|-----------------------|---------|
| `koinViewModel()` | `LocalViewModelStoreOwner`（Activity、Fragment、目的地） | `koin-compose-viewmodel` |
| `NavBackStackEntry.sharedKoinViewModel()` | 父導覽圖項目 | `koin-compose-viewmodel-navigation` |
| `koinActivityViewModel()` | 目前的 `ComponentActivity` (Android) | `koin-compose-viewmodel` |
| `koinNavViewModel()` | 已棄用，請改用 `koinViewModel()` | `koin-compose-viewmodel-navigation` |

## 相關內容 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel)：宣告 ViewModel、參數、`SavedStateHandle`、ViewModel 作用域。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：在 Activity 與 Fragment 中使用 `by viewModel()`。
- [Navigation 3](/docs/reference/koin-compose/navigation3)：搭配 Navigation 3 項目的 ViewModel。
- [Lifecycle and State](/docs/reference/koin-compose/compose-lifecycle)：Compose 中各項目的生命週期。
- [Compose Testing](/docs/reference/koin-compose/compose-testing)：測試使用 `koinViewModel()` 的 Composable。