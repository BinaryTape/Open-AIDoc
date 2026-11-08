---
title: Navigation 3
---

# Navigation 3

本頁面介紹如何在 Koin 模組中宣告 [Navigation 3](https://developer.android.com/guide/navigation/navigation-3) 項目 (entries) 並將它們傳遞給 `NavDisplay`。每個功能模組各自提供自己的畫面，而應用程式則透過單一 entry provider 收集所有畫面。本頁假設您已了解 Navigation 3 的基本概念（返回堆疊 (back stack)、`NavDisplay`、`NavEntry`）以及 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

本頁面中的所有 API 均標記為 `@KoinExperimentalAPI`。

## 設定 {id="setup"}

```kotlin
// shared/build.gradle.kts，或 Android 上的 app/build.gradle.kts
plugins {
    kotlin("plugin.serialization")
}

commonMain.dependencies {
    implementation("io.insert-koin:koin-compose-navigation3:$koin_version")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:$serialization_version")
}
```

`koin-compose-navigation3` 支援 Android、iOS、JVM 桌面版、JS 與 Wasm。

## 宣告項目 (entries) {id="declaring-entries"}

Route 為標有 `@Serializable` 的類別：

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val itemId: String)
```

在您的模組中為每個 route 宣告一個 `navigation<T> { }`。該 Lambda 是一個接收該 route 的 Composable：

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

每個 `navigation<T>` 都儲存為由 route 型別限定的定義。此 Lambda 以 Koin `Scope` 作為接收者 (receiver) 執行，因此您可以在其中呼叫 `get<T>()` 以及 Composable 函式（例如 `koinViewModel()`）。

## 建置 entry provider {id="building-the-entry-provider"}

`koinEntryProvider()` 會將目前作用域中的每個 `navigation<T>` 項目收集至單一 provider 中供 `NavDisplay` 使用：

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

`koinEntryProvider<T>()` 接收您返回堆疊 (back stack) 的 route 型別：配合 `rememberNavBackStack()` 使用 `NavKey`，或當 `NavDisplay` 具有明確型別時使用您自訂的 route 型別（具型別的 `SceneStrategy`，例如 `rememberSupportingPaneSceneStrategy<Route>()`，會使其成為 `NavDisplay<Route>`）。若保留為 `Any`，組建將會失敗並顯示：`Argument type mismatch: actual type is 'Function1<Any, NavEntry<Any>>', but 'Function1<Route, NavEntry<Route>>' was expected.`。

### 從 Android Activity 中使用 {id="from-an-android-activity"}

在 Android 上，`ComponentCallbacks` 上的兩個擴充函式可從 Activity 或 Fragment 作用域建置 provider：

| 函式 | 行為 |
|----------|----------|
| `entryProvider<T>()` | 延遲委派 (lazy delegate)：`val provider by entryProvider<Any>()` |
| `getEntryProvider<T>()` | 立即建置 provider |

它們會從該元件的 Koin 作用域進行解析：若實作了 `AndroidScopeComponent` 則為 Activity 作用域，否則為根 (root) 作用域。

## 作用域中的項目 (entries) {id="entries-in-a-scope"}

當畫面需要與特定作用域生命週期相同的物件時，請在該作用域內宣告項目。使用 `activityRetainedScope`，它們能在組態變更 (configuration changes) 後保留下來：

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

`getEntryProvider()` 會從 Activity 作用域讀取項目。在某個作用域內宣告的項目僅對該作用域可見。`activityRetainedScope` 的詳細說明請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

## 針對項目的 ViewModel {id="viewmodels-for-an-entry"}

若要將 ViewModel 的作用域限定於其對應的項目，請將 ViewModel store 裝飾器新增至 `NavDisplay`。若未新增，`koinViewModel()` 將會使用 Activity 的 store，且相同 route 的每個項目都會共用同一個執行個體：

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

將 route 或其欄位作為參數傳遞：

**編譯器外掛程式 DSL**
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

**註解 (Annotations)**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

// navigation<T> 項目是在 DSL 模組中宣告的
val detailModule = module {
    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**建構函式 / 傳統 DSL**
```kotlin
class DetailViewModel(
    val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModelOf(::DetailViewModel) // route 來自 parametersOf(route)

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

## 項目中繼資料 (Entry metadata) {id="entry-metadata"}

`navigation<T>` 接收一個會傳遞給 `NavEntry` 的 `metadata` map。可用於個別項目的轉場動畫或場景策略 (scene strategies)，例如清單-詳細資訊 (list-detail)：

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

接著將場景策略傳遞給 `NavDisplay`（`sceneStrategy = rememberListDetailSceneStrategy()`）。中繼資料的鍵值來自 Navigation 3 與 adaptive 程式庫，而非來自 Koin。

## 從 Navigation 2 遷移 {id="from-navigation-2"}

| Navigation 2 | 搭配 Koin 的 Navigation 3 |
|--------------|------------------------|
| `NavHost { composable(...) }` 中的字串或具型別 route | 標有 `@Serializable` 的 route 類別 |
| `NavHost` 中的 `composable<Route> { ... }` | Koin 模組中的 `navigation<Route> { ... }` |
| `NavHost(navController, startDestination)` | `NavDisplay(backStack, entryProvider = koinEntryProvider())` |
| 從 `SavedStateHandle` 讀取引數 | 傳遞給 Lambda 的 Route 物件 |

## API 摘要 {id="api-summary"}

| API | 套件 | 用途 |
|-----|---------|---------|
| `Module.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | 在模組中宣告項目 |
| `ScopeDSL.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | 在作用域中宣告項目 |
| `koinEntryProvider<T>(scope)` | `org.koin.compose.navigation3` | 來自目前 Compose 作用域的 entry provider |
| `entryProvider<T>()`、`getEntryProvider<T>()` | `org.koin.androidx.compose.navigation3` | 來自 Activity 或 Fragment 的 entry provider (Android) |

## 相關主題 {id="related"}

- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 及其擁有者。
- [Android 作用域](/docs/reference/koin-android/scope)：`activityRetainedScope` 與 Activity 作用域。
- [注入參數](/docs/reference/koin-core/injection-parameters)：`parametersOf` 與 `@InjectedParam`。
- [Koin for Compose](/docs/reference/koin-compose/compose)：套件與啟動 Koin。
- [Navigation 3 recipes](https://github.com/android/nav3-recipes)：Google 針對 Navigation 3 本身提供的範例。