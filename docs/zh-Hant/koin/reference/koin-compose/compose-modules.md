---
title: 動態模組
---

# 動態模組

本頁面介紹 `rememberKoinModules`，它會在 Composable 進入組合（composition）時載入 Koin 模組，並可在其離開時將其卸載。使用它可以僅在特定功能的畫面顯示時才載入該功能的定義。您應事先了解如何宣告[模組](/docs/reference/koin-core/modules)。

`rememberKoinModules` 位於 `io.insert-koin:koin-compose`，並標記為 `@KoinExperimentalAPI`。

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

Lambda 會傳回要載入的模組。Koin 在首次組合 `CheckoutScreen` 時，會將它們載入到該組合的 Koin 執行個體中。重組（Recomposition）不會再次載入它們。

請在呼叫需要其定義的 `koinInject()` 或 `koinViewModel()` 之前呼叫 `rememberKoinModules`。

## 卸載 {id="unloading"}

預設情況下，在 Composable 離開組合後，模組仍會保持載入狀態。有三個參數可以控制卸載：

| 參數 | 預設值 | 效果 |
|-----------|---------|--------|
| `unloadOnForgotten` | `unloadModules` | 當 Composable 離開組合時卸載 |
| `unloadOnAbandoned` | `unloadModules` | 若組合被放棄時卸載 |
| `unloadModules` | `false` | 上述兩個參數的預設值 |

```kotlin
// 兩種情況下皆卸載
rememberKoinModules(unloadModules = true) { listOf(checkoutModule) }
```

卸載會移除定義並捨棄其 `single` 執行個體。仍然持有該執行個體參照的程式碼會保留該參照，但 Koin 無法再解析該型別。請勿卸載其他畫面仍在使用的模組。

## 依目的地載入 {id="loading-per-destination"}

在導覽目的地（navigation destination）中呼叫 `rememberKoinModules`，以便在使用者導覽至該處時載入功能：

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

## 模組樣式 {id="module-styles"}

**編譯器外掛程式 DSL**
```kotlin
val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}
```

**註解**
`rememberKoinModules` 接受 `Module` 值。帶有 `@Module` 註解的類別會在啟動時透過 `@KoinApplication` 載入（請參閱[模組](/docs/reference/koin-core/modules)）。若要隨需載入某個功能，請使用 DSL 宣告其模組。

**建構函式 / 傳統 DSL**
```kotlin
val checkoutModule = module {
    factoryOf(::CheckoutRepository)
    viewModelOf(::CheckoutViewModel)
}
```

## 限制 {id="limits"}

- **主執行緒**：模組是在組合期間同步載入的。龐大的模組會增加該幀的耗時。若要在啟動時於背景載入模組，請參閱 [Lazy Modules](/docs/reference/koin-core/lazy-modules)。
- **覆寫**：較晚載入的模組會覆寫先前相同型別的定義（請參閱[定義](/docs/reference/koin-core/definitions)）。將其卸載並不會還原先前的定義。
- **預覽**：`rememberKoinModules` 需要一個正在執行的 Koin 執行個體。對於預覽，請使用 `KoinApplicationPreview`（請參閱 [Compose 測試](/docs/reference/koin-compose/compose-testing)）。

## 相關內容 {id="related"}

- [模組](/docs/reference/koin-core/modules)：宣告與組合模組。
- [Lazy Modules](/docs/reference/koin-core/lazy-modules)：在啟動時於背景載入模組。
- [啟動 Koin](/docs/reference/koin-core/starting-koin)：在 Compose 外部載入與卸載模組。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：繫結至 Composable 的執行個體。
- [生命週期與狀態](/docs/reference/koin-compose/compose-lifecycle)：各個 Compose API 釋放的內容及其釋放時機。