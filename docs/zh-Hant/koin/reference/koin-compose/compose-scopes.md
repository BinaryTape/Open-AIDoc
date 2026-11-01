---
title: Compose 中的作用域
---

# Compose 中的作用域

本頁涵蓋了為部分 UI 樹開啟 Koin 作用域的 Compose 函式：`KoinScope`、`KoinNavigationScope`、`UnboundKoinScope`，以及 Android 的 `KoinActivityScope` 與 `KoinFragmentScope`。在此類區塊內，`koinInject()` 和 `koinViewModel()` 會從該作用域進行解析。關於作用域的運作方式以及如何宣告它們，請參閱[作用域](/docs/reference/koin-core/scopes)。

本頁的大多數函式皆標記為 `@KoinExperimentalAPI`。請使用 `@OptIn(KoinExperimentalAPI::class)` 選擇加入。

## KoinScope {id="koinscope"}

`KoinScope` 會取得或建立一個作用域，並將其提供給其子項，在 Composable 離開組合時將其關閉。

宣告作用域：

**編譯器外掛程式 DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scoped<FeatureCache>()
        scoped<FeatureRepository>()
    }
}
```

**註解**
```kotlin
class FeatureScope

@Scope(FeatureScope::class)
class FeatureCache

@Scope(FeatureScope::class)
class FeatureRepository(private val cache: FeatureCache)
```

**建構函式 / 傳統 DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scopedOf(::FeatureCache)
        scopedOf(::FeatureRepository)
    }
}
```

在 Compose 中開啟：

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
    val repository = koinInject<FeatureRepository>() // 從 FeatureScope 解析
}
```

`KoinScope` 有三種形式：

| 形式 | 作用域 |
|------|-------|
| `KoinScope<T>(scopeID) { }` | 取得或建立具有該 id 且由型別 `T` 限定的作用域 |
| `KoinScope(scopeID, scopeQualifier) { }` | 取得或建立具有該 id 和限定詞的作用域 |
| `KoinScope(scopeDefinition = { createScope(...) }) { }` | 由 Lambda 回傳的作用域，該 Lambda 在 `Koin` 執行個體上執行 |

當 Composable 被遺忘（離開組合）或被放棄時，該作用域會被關閉。根作用域永遠不會被關閉。

### 多畫面流程 {id="multi-screen-flows"}

將 `KoinScope` 放置在 `NavHost` 之上，以在流程的畫面之間（例如結帳流程）共用具有作用域的物件：

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
    val state = koinInject<CheckoutState>() // 與 CartScreen 中的 CheckoutState 相同
}
```

當 `CheckoutFlow` 離開組合時，該作用域會關閉。

:::note
在該作用域中宣告的 `viewModel` 仍儲存在目前的 `ViewModelStoreOwner` 中。在 `NavHost` 內，每個目的地都會取得自己的 ViewModel 執行個體。若要跨畫面共用狀態，請透過如 `CheckoutState` 等 `scoped` 物件，或使用 `sharedKoinViewModel()`（請參閱 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)）。
:::

## rememberKoinScope {id="rememberkoinscope"}

`rememberKoinScope(scope)` 將您建立的作用域繫結到組合中，但不會將其提供給子項。當 Composable 離開組合時，該作用域會被關閉：

```kotlin
@Composable
fun FeatureScreen() {
    val koin = getKoin()
    val scope = rememberKoinScope(remember { koin.createScope<FeatureScope>("feature") })
    val repository = koinInject<FeatureRepository>(scope = scope)
}
```

## KoinNavigationScope {id="koinnavigationscope"}

`KoinNavigationScope` 會為每個 Navigation Compose 目的地開啟一個作用域。它位於 `io.insert-koin:koin-compose-viewmodel-navigation` 中。

使用 `navigationScope { }` 宣告定義。它會建立一個由 `NavBackStackEntry` 限定的作用域：

```kotlin
import org.koin.module.dsl.navigationScope

val appModule = module {
    navigationScope {
        scoped<ScreenStateHolder>()
        viewModel<ScreenViewModel>()
    }
}
```

使用註解或建構函式 DSL 時，請在 DSL 模組中使用相同的 `navigationScope { }` 區塊（在建構函式 DSL 中搭配 `scopedOf(::ScreenStateHolder)`）。此作用域沒有對應的註解。

包裝每個目的地：

```kotlin
NavHost(navController, startDestination = ListRoute) {
    composable<ListRoute> { entry ->
        KoinNavigationScope(entry) {
            ListScreen() // 擁有自己的 ScreenStateHolder
        }
    }
    composable<DetailRoute> { entry ->
        KoinNavigationScope(entry) {
            DetailScreen() // 另一個 ScreenStateHolder
        }
    }
}
```

作用域 id 為 `NavBackStackEntry.id`。當目的地離開組合時，作用域不會被關閉，因此只要該項目保留在返回堆疊中，它就會繼續存活。只有在組合被放棄時，它才會被關閉。

:::warning
`KoinNavigationScope` 會在全域 Koin 執行個體（`KoinPlatform.getKoin()`）中建立其作用域，而不是在組合的 Koin 中建立。它在 `KoinIsolatedContext` 內無法運作。
:::

## UnboundKoinScope {id="unboundkoinscope"}

`UnboundKoinScope` 提供由您自行管理的作用域。Koin 永遠不會關閉它：

```kotlin
@OptIn(KoinDelicateAPI::class, KoinExperimentalAPI::class)
@Composable
fun SessionArea(sessionScope: Scope) {
    UnboundKoinScope(scope = sessionScope) {
        SessionContent()
    }
}
```

當作用域的生命週期不遵循 UI 樹時使用它：例如在登入時開啟的使用者工作階段、多個組合根共用的作用域。它被標記為 `@KoinDelicateAPI`：您必須自行呼叫 `scope.close()`，否則該作用域及其執行個體將保留在記憶體中。

## Android 作用域 {id="android-scopes"}

這些函式位於 `io.insert-koin:koin-androidx-compose`（`KoinActivityScope`、`KoinFragmentScope`）以及 `koin-compose` 的 Android 目標中（`koinActivityInject`）。Activity 或 Fragment 必須實作 `AndroidScopeComponent`。宣告 Activity 與 Fragment 作用域的說明請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

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
    val presenter = koinInject<MainPresenter>() // 從 Activity 作用域解析
}
```

`KoinFragmentScope { }` 在由 Fragment 託管的 `ComposeView` 中執行相同操作。

`koinActivityInject()` 可在任何層級深度從 Activity 作用域進行解析，不需要包裝區塊：

```kotlin
@Composable
fun DeepNestedScreen() {
    val session: SessionManager = koinActivityInject()
}
```

若 `LocalActivity` 未實作 `AndroidScopeComponent`，它將會失敗。

## 比較 {id="comparison"}

| API | 作用域生命週期 | 關閉者 |
|-----|----------------|-----------|
| `KoinScope` | Composable | Koin，當 Composable 離開組合時 |
| `rememberKoinScope` | Composable | Koin，當 Composable 離開組合時 |
| `KoinNavigationScope` | 返回堆疊項目 | Koin，僅當組合被放棄時 |
| `UnboundKoinScope` | 自行管理 | 使用者自行關閉 |
| `KoinActivityScope` | Activity | Activity 作用域（`activityScope()`） |
| `KoinFragmentScope` | Fragment | Fragment 作用域（`fragmentScope()`） |

## 相關內容 {id="related"}

- [作用域](/docs/reference/koin-core/scopes)：宣告作用域、連結它們、關閉它們。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment 與 ViewModel 作用域。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：跨導覽圖共用 ViewModel。
- [生命週期與狀態](/docs/reference/koin-compose/compose-lifecycle)：各個 Compose API 釋放的資源以及釋放的時機。
- [動態模組](/docs/reference/koin-compose/compose-modules)：透過 Composable 載入模組。