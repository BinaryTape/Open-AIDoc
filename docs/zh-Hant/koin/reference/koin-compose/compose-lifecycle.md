---
title: 生命週期與狀態
---

# 生命週期與狀態

本頁說明使用 Koin 注入的物件在 Compose 生命週期中的行為表現：重組（recomposition）時會發生什麼事、當 Composable 離開組合（composition）時各個 Koin API 會釋放什麼，以及應該在哪裡放置注入呼叫。本篇假設你已了解 `koinInject()` 與 `koinViewModel()`（請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)）以及 [Compose 生命週期](https://developer.android.com/develop/ui/compose/lifecycle)。

## 重組 (Recomposition) {id="recomposition"}

`koinInject()` 只會解析相依性一次，並使用 `remember` 保留它，並以限定詞（qualifier）、作用域（scope）和參數作為鍵值：

```kotlin
@Composable
fun UserScreen(userId: String) {
    val repository = koinInject<UserRepository>() // 僅解析一次
    val presenter = koinInject<UserPresenter> { parametersOf(userId) } // 當 userId 變更時會再次解析
}
```

在鍵值相同的重組中，你會取得相同的物件。當鍵值變更（例如新的 `userId`）時，Koin 會重新解析。對於 `single`，這會傳回同一個執行個體。對於 `factory`，則會建立一個新的執行個體。

`koinViewModel()` 不使用 `remember`：ViewModel 儲存在 `ViewModelStoreOwner` 中，並能在重組與 Android 設定變更後繼續存活。其參數僅在建立時使用（請參閱 [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)）。

兩者都是 Composable 函式，因此不能在 `remember { }`、`LaunchedEffect` 或 `onClick` Lambda 內部呼叫。請在 Composable 主體中呼叫它們，並在 Lambda 內使用其結果：

```kotlin
@Composable
fun SaveButton() {
    val repository = koinInject<UserRepository>()

    Button(onClick = { repository.save() }) {
        Text("Save")
    }
}
```

## 釋放內容與時機 {id="what-is-released-and-when"}

| API | 在重組時 | 當 Composable 離開組合時 |
|-----|------------------|--------------------------------------------|
| `koinInject()` | 若鍵值未變更則為相同物件 | 捨棄參照。Koin 會保留 `single` 或 `scoped` 執行個體 |
| `koinViewModel()` | 相同 ViewModel | 不釋放任何內容。ViewModel 會隨其 `ViewModelStoreOwner` 一起清除 |
| `KoinApplication` | 相同 Koin 執行個體 | Koin 保持執行。僅在組合被放棄時才會停止 |
| `KoinScope`, `rememberKoinScope` | 相同作用域 | 關閉作用域 |
| `KoinNavigationScope` | 相同作用域 | 保留作用域。僅在組合被放棄時才會關閉 |
| `UnboundKoinScope` | 相同作用域 | 不做任何事。由你自行關閉作用域 |
| `rememberKoinModules` | 模組僅載入一次 | 僅在你設定了 `unloadOnForgotten` 時才會卸載模組 |

詳細資訊：[Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)、[動態模組](/docs/reference/koin-compose/compose-modules)。

## 注入的位置 {id="where-to-inject"}

在畫面（screen）層級進行注入，並將純資料和 Lambda 向下傳遞。這樣一來，子 Composable 就不會相依於 Koin，且預覽與測試也不需要 Koin 執行個體：

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

避免在 `LazyColumn` 項目內部使用 `koinInject()`：每個項目都會執行自己的解析與 `remember`。請在父層注入一次，並傳遞該物件或 Lambda。

### 作為參數傳遞還是進行注入？ {id="pass-as-a-parameter-or-inject"}

| 作為參數傳遞 | 使用 Koin 注入 |
|---------------------|------------------|
| 會變更的值：ID、搜尋查詢、選取項目 | 長期存活的服務：repository、use case |
| 導覽引數 | 基礎結構：資料庫、HTTP 用戶端 |
| 父層已擁有的資料 | ViewModel |

```kotlin
@Composable
fun UserProfile(
    userId: String,                              // 會變更：作為參數傳遞
    repository: UserRepository = koinInject()   // 服務：進行注入
) {
    var user by remember { mutableStateOf<User?>(null) }

    LaunchedEffect(userId) {
        user = repository.getUser(userId)
    }

    user?.let { ProfileContent(it) }
}
```

## 注入的物件與穩定性 {id="injected-objects-and-stability"}

Koin 不會改變 Compose 看待型別的方式。型別為 `UserRepository` 或 `UserViewModel` 的 Composable 參數，與任何其他類別一樣，會根據 Compose 編譯器規則被判定為穩定（stable）或不穩定（unstable）。如果跳過重組（skipping）對某個 Composable 很重要，請傳遞穩定值（狀態、基本型別、Lambda）給它，而不是注入的物件。

## 副作用 {id="side-effects"}

注入的物件是標準的 Kotlin 物件：可以像其他任何值一樣在 `LaunchedEffect`、`DisposableEffect` 或 `SideEffect` 中使用它們。請先在 Composable 主體中解析它們：

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

## 相關內容 {id="related"}

- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()` 與啟動 Koin。
- [ViewModel in Compose](/docs/reference/koin-compose/compose-viewmodel)：ViewModel 擁有者與參數。
- [Scopes in Compose](/docs/reference/koin-compose/compose-scopes)：繫結至 UI 樹的作用域。
- [Dynamic Modules](/docs/reference/koin-compose/compose-modules)：隨 Composable 載入與卸載模組。
- [Compose Testing](/docs/reference/koin-compose/compose-testing)：預覽與 UI 測試。