---
title: 注入
---

# 注入

大部分的類別都會透過建構函式接收其相依性，並由 Koin 進行填入（請參閱 [Constructor parameters](/docs/reference/koin-core/definitions#constructor-parameters)）。但有些程式碼無法做到這點：例如 Android 的 `Activity`、`main()` 函式，或是由架構所建立的類別。本頁面涵蓋了在這些程式碼中從 Koin 擷取執行個體的函式：`get()`、`inject()`、它們的可為 null 變體，以及 `getAll()`。

## 優先使用建構函式注入 {id="constructor-injection-first"}

僅在 Koin 無法建立該類別的情況下，才使用本頁面介紹的函式：

```kotlin
// Koin 建立此類別：相依性透過建構函式傳入
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator,
)

// Android 建立此類別：使用 inject() 擷取相依性
class UserActivity : AppCompatActivity() {
    private val userService: UserService by inject()
}
```

具有建構函式參數的類別可以透過傳入假物件 (fake) 進行測試，而無需 Koin 容器。但在測試中呼叫 `get()` 的類別則需要一個執行中的容器。切勿在預設參數值中呼叫 `get()`（例如 `class UserService(val repository: UserRepository = get())`）：請改為在模組中宣告該類別。

## 延遲與即時擷取 {id="lazy-and-eager-retrieval"}

在任何風格中，擷取程式碼的方式都相同：

```kotlin
class UserActivity : AppCompatActivity() {

    // lazy: 首次存取該屬性時解析
    private val userService: UserService by inject()

    // eager: 當屬性初始化時立即解析
    private val analytics: Analytics = get()
}
```

| 函式 | 回傳 | 解析時機 |
|----------|---------|----------|
| `by inject<T>()` | 作為屬性委託使用的 `Lazy<T>` | 首次存取時 |
| `get<T>()` | `T` | 立即 |

對於屬性，請使用 `by inject()`。類別可以在 Koin 準備好所有項目之前就被建立（例如 `Activity` 欄位在 `onCreate()` 之前就被初始化），且從未使用的執行個體永遠不會被建立。當你在函式主體內需要立即取得該值時，請使用 `get()`。

`inject()` 接受一個 `mode` 參數，即 Kotlin 的 `LazyThreadSafetyMode`。在 JVM 上預設為 `SYNCHRONIZED`。

## get() 與 inject() 的可用位置 {id="where-get-and-inject-are-available"}

你可以從以下位置呼叫 `get()` 和 `by inject()`：

- Android 類別：`Activity`、`Fragment`、`Service` 以及其他 `ComponentCallbacks`，無需額外的介面。請參閱 [Android Entry Points](/docs/reference/koin-android/entry-points)。
- 任何實作了 `KoinComponent` 的類別。請參閱 [KoinComponent](/docs/reference/koin-core/koin-component)。
- `Koin` 執行個體：`KoinPlatform.getKoin().get<UserService>()` 使用全域容器，而 `koinApp.koin.get<UserService>()` 則使用隔離的容器。
- 在定義內部 (Classic DSL)：`get()`、`inject()`、`getOrNull()`、`injectOrNull()` 和 `getAll()` 會從當前作用域解析。

平台 API 遵循相同的規則，但使用各自的專用名稱：

- Compose：`koinInject()` 與 `koinViewModel()`。請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)。
- Android ViewModel：`by viewModel()` 與 `by activityViewModel()`。請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)。
- Ktor：在 `Application`、`Route` 與 `ApplicationCall` 中使用 `by inject()`。請參閱 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 可選相依性 {id="optional-dependencies"}

當某個定義可能缺失時，請使用可為 null 的變體。它們會回傳 `null`，而不會拋出 `NoDefinitionFoundException`：

```kotlin
val koin = KoinPlatform.getKoin()

val tracker: Tracker? = koin.getOrNull()
val crashReporter: CrashReporter? by koin.injectOrNull()
```

`getOrNull()` 和 `injectOrNull()` 存在於 `Koin`、`Scope` 以及定義內部。`KoinComponent` 介面僅提供 `get()` 和 `inject()`：在該處請呼叫 `getKoin().getOrNull<T>()`。

對於建構函式參數，請將其宣告為可為 null（`tracker: Tracker?`），當不存在任何定義時，Koin 會傳入 `null`。請參閱 [Constructor parameters](/docs/reference/koin-core/definitions#constructor-parameters)。

如果 Koin 本身可能尚未啟動（例如在程式庫中），`KoinPlatform.getKoinOrNull()` 會回傳 `null`，而不會拋出例外。

## 特定型別的所有執行個體 {id="all-instances-of-a-type"}

`getAll<T>()` 會回傳跨所有定義中綁定到型別 `T` 的每一個執行個體：

```kotlin
val koin = KoinPlatform.getKoin()

val interceptors: List<Interceptor> = koin.getAll()
```

該清單包含主要型別或綁定型別為 `T` 的每個定義（無論是否有限定詞）。當沒有符合項目時，清單為空。對於建構函式參數，`List<Interceptor>` 參數也有相同效果。集合模式已在 [Advanced Patterns](/docs/reference/koin-core/advanced-patterns) 中說明。

## 呼叫點的限定詞與參數 {id="qualifiers-and-parameters-at-the-call-site"}

每個擷取函式都可以接收限定詞與參數區塊：

```kotlin
val localDb: Database by inject(named("local"))

val presenter: UserPresenter = get { parametersOf(userId) }

val detail: DetailPresenter = get(named("compact")) { parametersOf(itemId) }
```

- 限定詞 (Qualifier)：在相同型別的多個定義中挑選一個。請參閱 [Qualifiers](/docs/reference/koin-core/qualifiers)。
- 參數 (Parameters)：僅呼叫端知道的值，傳遞給該定義。請參閱 [Injected Parameters](/docs/reference/koin-core/injection-parameters)。

使用 `by inject()` 時，參數區塊會在首次存取時執行，因此它可以讀取在建構完成後才設定的屬性。

## 當解析失敗時 {id="when-resolution-fails"}

當沒有任何定義符合型別與限定詞時，`get()` 會拋出 `NoDefinitionFoundException`。使用 `by inject()` 時，例外會在首次存取該屬性時發生，而不是在你宣告它的地方。搭配編譯器外掛程式 (Compiler Plugin) 時，`get()` 與 `inject()` 的呼叫也會在建置期根據啟動呼叫的依賴圖進行檢查。

如需常見錯誤以及如何解讀 Koin 訊息的說明，請參閱 [Troubleshooting](/docs/reference/koin-core/troubleshooting)。

## 相關內容 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions)：建構函式注入以及參數如何解析。
- [KoinComponent](/docs/reference/koin-core/koin-component)：讓任何類別都能存取 `get()` 和 `inject()`。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：在 Activity、Fragment、Service、Receiver 和 View 中注入。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`koinInject()` 及其他 Compose API。
- [Scopes](/docs/reference/koin-core/scopes)：從作用域而非根容器中擷取執行個體。