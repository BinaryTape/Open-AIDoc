---
title: 注入參數
---

# 注入參數

某些物件需要只有呼叫端才知道的值，例如使用者 ID 或目前的畫面。注入參數讓呼叫端在向 Koin 請求執行個體時傳遞這些值。本頁面涵蓋如何在定義中宣告參數、如何傳遞參數，以及 Koin 如何將值與參數進行配對。此處假設你已經了解如何宣告定義（請參閱[定義](/docs/reference/koin-core/definitions)）。

## 宣告與傳遞參數 {id="declare-and-pass-a-parameter"}

標記哪些建構函式參數來自呼叫端。其他參數則一如往常從容器中解析：

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.InjectedParam

class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)

val appModule = module {
    single<UserRepository>()
    factory<UserPresenter>()
}
```

`@InjectedParam` 來自 `koin-annotations` 構件。它會告訴編譯器外掛程式 `userId` 不是一個定義，因此建置期檢查不會將其回報為遺失。

**Annotations**
```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)
```

`@InjectedParam` 也適用於提供者函式的參數。

**Constructor / Classic DSL**
定義的 Lambda 運算式會以 `params` 接收這些參數：

```kotlin
val appModule = module {
    singleOf(::UserRepository)
    factory { params -> UserPresenter(userId = params.get(), repository = get()) }
}
```

呼叫端使用 `parametersOf()` 傳遞值，其順序與參數相同：

```kotlin
import org.koin.core.parameter.parametersOf

val presenter: UserPresenter = get { parametersOf("user-42") }

// or lazily
val presenter: UserPresenter by inject { parametersOf("user-42") }
```

參數區塊是一個 Lambda 運算式，因此這些值是在建立執行個體時被讀取的。使用 `by inject()` 時，這會發生在首次存取時。

注入參數專為 `factory` 定義而設計。`single` 只會建立一次：只會使用第一次傳遞的值，之後傳入的值都會被忽略。

每個平台 API 都接受相同的區塊：在 Compose 中使用 `koinInject { parametersOf(userId) }`（請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)），在 ViewModel 中使用 `by viewModel { parametersOf(userId) }` 或 `koinViewModel { parametersOf(userId) }`（請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)）。

## 多個參數 {id="several-parameters"}

**Compiler Plugin DSL**
```kotlin
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)

val appModule = module {
    factory<OrderPresenter>()
}
```

**Annotations**
```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)
```

**Constructor / Classic DSL**
在 Lambda 運算式中解構參數：

```kotlin
val appModule = module {
    factory { (userId: String, orderId: Long) ->
        OrderPresenter(userId, orderId, get())
    }
}
```

或者透過索引讀取，使用 `params[i]` 或 `params.get<T>(i)`：

```kotlin
val appModule = module {
    factory { params -> OrderPresenter(params[0], params[1], get()) }
}
```

解構最多限制為五個值，且宣告的型別不會與呼叫端傳遞的內容進行比對檢查。如果順序錯誤，在執行階段的轉換將會失敗。

```kotlin
val presenter: OrderPresenter = get { parametersOf("user-42", 1001L) }
```

## Koin 如何配對值 {id="how-koin-matches-values"}

`params.get<T>()` 和產生的程式碼會依據以下規則尋找每個值：

- Koin 首先查看目前位置的值。如果它具有所請求的型別，Koin 會傳回該值並移至下一個位置。
- 否則，Koin 會傳回所請求型別的第一個值，不論其位置為何。
- 當未傳遞該型別的值時，`params.getOrNull<T>()` 會傳回 `null`。而 `get<T>()` 則會拋出 `DefinitionParameterException`。

在實務上，請依建構函式的順序傳遞值：`parametersOf("user-42", 1001L)` 會先填入 `userId`，再填入 `orderId`；兩個 `String` 參數會依序接收兩個 `String` 值。

如果你只需要單一行為，可以使用其他函式來建構參數：

| 函式 | 配對方式 |
|----------|----------|
| `parametersOf(...)` | 優先考慮位置，其次是型別（預設值，參見上述規則） |
| `parameterArrayOf(...)` | 僅考慮位置。目前位置的值必須具有所請求的型別 |
| `parameterSetOf(...)` | 僅考慮型別。每次呼叫 `get<T>()` 都會傳回該型別的第一個值 |

```kotlin
val byIndex = parameterArrayOf(1, 2, 3)
byIndex.get<Int>() // 1
byIndex.get<Int>() // 2

val byType = parameterSetOf("a_string", 42)
byType.get<Int>()    // 42
byType.get<Int>()    // 42
```

## 從參數解析的值 {id="values-resolved-from-parameters"}

當 Koin 使用參數建立執行個體時，定義內部一般的 `get()` 會在檢查容器之前先檢查傳遞的值。即使是未標記的參數仍然可以接收傳遞的值：

```kotlin
val appModule = module {
    factory { UserPresenter(userId = get(), repository = get()) }
}

get<UserPresenter> { parametersOf("user-42") } // userId = "user-42"
```

這對更深層的相依性也同樣有效：如果 `UserPresenter` 需要一個依賴畫面名稱的 `Tracker`，為 presenter 傳遞的值也可以傳遞到 `Tracker` 定義中。

無論如何，建議優先使用 `@InjectedParam` 或 `params.get()`：它們明確指出了值的來源，並且編譯器外掛程式可以檢查相依圖的其餘部分。

:::warning
如果傳遞的值與所請求定義的型別相同，Koin 會直接傳回該值，且永遠不會執行該定義。`get<String> { parametersOf("x") }` 會傳回 `"x"`。當這類參數可能與定義的型別發生衝突時，請將它們包裝在專屬的型別中（例如 value class）。
:::

帶限定詞的請求（例如 `get(named("local"))`）永遠不會從參數中取得值。參數不帶有限定詞。

## 相關主題 {id="related"}

- [注入](/docs/reference/koin-core/injection)：傳遞參數的 `get()` 與 `inject()`。
- [定義](/docs/reference/koin-core/definitions#constructor-parameters)：其他建構函式參數是如何被解析的。
- [ViewModel](/docs/reference/koin-core/viewmodel)：ViewModel 的參數與 `SavedStateHandle`。
- [限定詞](/docs/reference/koin-core/qualifiers)：在定義之間做選擇，而非傳遞值。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：`@InjectedParam` 及其他參數註解。