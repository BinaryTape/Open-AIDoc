---
title: 作用域
---

# 作用域

作用域（scope）是用於存放執行個體的容器，其生命週期比 `factory` 長，但比 `single` 短。本頁面涵蓋宣告作用域與作用域定義、建立與關閉作用域執行個體、連結作用域以及作用域原型（scope archetypes）。本篇內容預設你已了解[定義（definitions）](/docs/reference/koin-core/definitions)。

以下平台 API 皆以此頁面為基礎：[Android 作用域](/docs/reference/koin-android/scope)（`ScopeActivity`、`AndroidScopeComponent`、`activityScope()`）、[Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)以及 [Ktor 請求作用域](/docs/reference/koin-ktor/ktor-scopes)。

## 作用域的運作方式 {id="how-scopes-work"}

作用域包含兩個部分：

- **作用域宣告（Scope declaration）**：模組中的一個區塊，透過限定詞（型別或名稱）來識別。它列出了屬於該作用域的定義。
- **作用域執行個體（Scope instance）**：在執行期根據宣告建立，具有唯一的作用域 ID。每個作用域執行個體都會持有自己專屬的各個 `scoped` 定義副本，直到你將其關閉為止。

| 定義 | 執行個體 |
|------------|----------|
| `single` | 整個容器共用一個 |
| `factory` | 每次請求建立一個新的 |
| `scoped` | 每個作用域執行個體各有一個，在作用域執行個體關閉時釋放 |

當多個物件必須在有限的時間內（例如登入工作階段、結帳流程、特定畫面）共用同一個執行個體，且該執行個體在此時間結束後必須被捨棄時，請使用作用域。

## 宣告作用域 {id="declaring-a-scope"}

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val sessionModule = module {
    // scope identified by a type
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
        factory<CheckoutPresenter>()
    }

    // scope identified by a name
    scope(named("checkout")) {
        scoped<CheckoutNavigator>()
    }
}
```

**註解**
使用 `@Scope` 標記類別以指定其所屬的作用域，並使用 `@Scoped` 將其宣告為作用域定義。兩者都需要：

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(private val sessionData: SessionData)

// scope identified by a name
@Scope(name = "checkout")
@Scoped
class CheckoutNavigator
```

`@Scope(UserSession::class)` 等同於 `scope<UserSession> { }`，而 `@Scope(name = "checkout")` 則等同於 `scope(named("checkout")) { }`。這兩種註解也適用於 `@Module` 類別中的函式。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
        factoryOf(::CheckoutPresenter)
    }

    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
    }
}
```

在作用域區塊內的 `factory` 會在每次請求時建立新的執行個體，但它可以相依於該作用域的作用域執行個體。

當作用域與某個類別綁定時（例如 `UserSession`、`MainActivity`），請使用型別作為作用域限定詞。如果沒有合適的類別，請使用名稱。`scope(named<MyQualifier>())` 則接受型別限定詞。

## 建立與關閉作用域 {id="creating-and-closing-a-scope"}

從 `Koin` 執行個體建立作用域執行個體，並提供 ID 與作用域限定詞。這通常發生在生命週期的開始與結束處，特別是入口點（例如登入與登出畫面、請求處理常式）：

```kotlin
val koin = KoinPlatform.getKoin()

// on login
val scope = koin.createScope<UserSession>(userId)
val cart: CartRepository = scope.get()

// on logout
koin.getScopeOrNull(userId)?.close()
```

作用域類別本身（`CartRepository`、`SessionData`）與其他定義一樣，使用建構函式注入。

| 函式 | 行為 |
|----------|----------|
| `createScope<T>(scopeId)` | 為型別限定詞 `T` 建立作用域執行個體 |
| `createScope(scopeId, qualifier)` | 為任何限定詞建立作用域執行個體，例如 `named("checkout")` |
| `getOrCreateScope(scopeId, qualifier)` | 回傳具有此 ID 的已開啟作用域，若不存在則建立它 |
| `getScope(scopeId)` | 回傳已開啟的作用域。若不存在則擲出 `ScopeNotCreatedException`（"No scope found for id '...'"） |
| `getScopeOrNull(scopeId)` | 回傳已開啟的作用域，或回傳 `null` |
| `deleteScope(scopeId)` | 從註冊表中移除作用域執行個體 |

作用域 ID 在所有開啟的作用域中必須是唯一的。同一個宣告的兩個作用域執行個體會持有不同的執行個體：

```kotlin
val first = getKoin().createScope<UserSession>("user_1")
val second = getKoin().createScope<UserSession>("user_2")

first.get<SessionData>() !== second.get<SessionData>() // true
```

當你呼叫 `scope.close()` 時：

1. Koin 會呼叫每個作用域執行個體的 `onClose` 回呼，然後將其釋放。
2. 作用域會從註冊表中移除。
3. 後續對其進行的任何 `get()` 呼叫都會擲出 `ClosedScopeException`（"Scope '...' is closed"）。若不確定，可檢查 `scope.closed`。

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionData>() onClose { it?.clear() }
    }
}
```

若要在作用域本身關閉時執行程式碼，請使用 `scope.registerCallback()` 註冊 `ScopeCallback`。

:::warning
手動建立的作用域會一直保持開啟，直到你將其關閉為止。它所持有的每個執行個體都會保留在記憶體中。請在其生命週期結束時（登出、流程結束）將其關閉。在 Android 上，`activityScope()` 和 `fragmentScope()` 會為你關閉作用域：請參閱 [Android 作用域](/docs/reference/koin-android/scope)。
:::

## 作用域元件 {id="scope-components"}

擁有作用域生命週期的類別可以實作 `KoinScopeComponent`。這樣一來，其 `get()` 和 `inject()` 呼叫將會從其作用域中解析。這是僅適用於作用域擁有者的高階模式：作用域內部的定義仍透過建構函式接收其相依性。

```kotlin
class UserSession : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }

    // resolved from the UserSession scope
    val cart: CartRepository by inject()

    fun close() {
        scope.close()
    }
}
```

`createScope(this)` 使用類別型別作為作用域限定詞、使用由類別名稱與雜湊碼建構的 ID，並以 `this` 作為作用域來源。`newScope()` 與 `getOrCreateScope()` 是達到相同目的的延遲委託：`override val scope by newScope()`。

## 作用域內的解析 {id="resolution-inside-a-scope"}

從作用域執行個體中，Koin 會依下列順序尋找定義：

1. 該作用域的定義（或其原型的定義，見下文）。
2. 作用域來源。
3. 已連結的作用域（依序排列）。包含所有 `single` 和 `factory` 定義的根作用域一律排在最後連結。

因此，具有作用域的類別可以相依於單例以及同一個作用域中的其他作用域類別：

**Compiler Plugin DSL**
```kotlin
class CartRepository(
    private val api: ApiService,        // single, from the root scope
    private val sessionData: SessionData // scoped, from the same scope
)

val sessionModule = module {
    single<ApiService>()
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
    }
}
```

**註解**
```kotlin
@Singleton
class ApiService

@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(
    private val api: ApiService,         // single, from the root scope
    private val sessionData: SessionData // scoped, from the same scope
)
```

**Constructor / Classic DSL**
```kotlin
val sessionModule = module {
    singleOf(::ApiService)
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
    }
}
```

反之則不行：`single` 無法相依於 `scoped` 定義，且從根作用域呼叫 `get<SessionData>()` 會因 `NoDefinitionFoundException` 而失敗。請務必從其對應的作用域執行個體解析作用域執行個體。

### 作用域來源 {id="scope-source"}

作用域來源是建立該作用域的物件，在 `createScope(scopeId, qualifier, source)` 中以 `source` 傳入。作用域定義可以像要求其他相依性一樣，透過型別來索取它：

```kotlin
class SessionLogger(private val session: UserSession)

val sessionModule = module {
    scope<UserSession> {
        scoped<SessionLogger>() // receives the UserSession that created the scope
    }
}
```

來源僅針對未指定限定詞的請求進行解析，並在作用域關閉時釋放。

### 注入作用域 {id="injecting-the-scope"}

作用域定義可以接收 `Scope` 本身作為建構函式參數，以便稍後解析更多執行個體或將其關閉。

### 在 Koin 外部建立的執行個體 {id="instances-created-outside-koin"}

`scope.declare(instance)` 可將你既有的物件新增至某個作用域執行個體中，無需在模組中提供定義：

```kotlin
val scope = getKoin().createScope<UserSession>(userId)
scope.declare(UserProfile(userId, name))
```

## 從另一個作用域解析 {id="resolving-from-another-scope"}

### 連結作用域 {id="linking-scopes"}

`linkTo` 會將另一個作用域新增至解析鏈中。被連結的作用域會在目前作用域之後被搜尋：

```kotlin
val sessionScope = getKoin().createScope<UserSession>(userId)
val checkoutScope = getKoin().createScope("checkout_$userId", named("checkout"))

checkoutScope.linkTo(sessionScope)

// resolved from checkoutScope first, then sessionScope, then root
val cart: CartRepository = checkoutScope.get()
```

`unlink(scope)` 會移除連結。根作用域無法連結至任何項目。

### 指向作用域 ID {id="pointing-at-a-scope-id"}

使用註解時，`@ScopeId` 可以從指定 ID 或指定型別的作用域執行個體中解析某個建構函式參數：

```kotlin
@Factory
class OrderSummary(
    @ScopeId(name = "checkout_main") val navigator: CheckoutNavigator
)

@Factory
class CartBadge(
    @ScopeId(UserSession::class) val cart: CartRepository
)
```

`@ScopeId(name = "checkout_main")` 等同於 DSL 中的 `getScope("checkout_main").get<CheckoutNavigator>()`。使用型別時，作用域 ID 為完全限定類名（`"com.example.UserSession"`）。在解析定義時，具有此 ID 的作用域執行個體必須已經存在，否則 `getScope()` 會擲出 `ScopeNotCreatedException`。

## 作用域原型 {id="scope-archetypes"}

使用型別宣告的作用域（`scope<MainActivity>`）僅適用於該型別。**作用域原型（scope archetype）** 是一種通用的作用域宣告，由同種類的所有元件（每個 ViewModel、每個 Activity、每個 Fragment）共用。你只需宣告一次定義，每個元件都會獲得各自的作用域執行個體。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }

    // Android only, koin-android
    activityScope {
        scoped<ActivityPresenter>()
    }
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

**註解**
原型註解可取代 `@Scope` 與 `@Scoped`：

```kotlin
import org.koin.core.annotation.ViewModelScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ViewModelScope
class UserCache(private val api: ApiService)

@ActivityScope
class ActivityPresenter

@FragmentScope
class FragmentPresenter
```

原型註解也適用於 `@Module` 類別中的函式。

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }

    // Android only, koin-android
    activityScope {
        scopedOf(::ActivityPresenter)
    }
    fragmentScope {
        scopedOf(::FragmentPresenter)
    }
}
```

| 原型 | DSL | 註解 | 關閉時機 | 平台 |
|-----------|-----|------------|-------------|----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel 被清除時 | 全部（`koin-core-viewmodel`） |
| Activity | `activityScope { }` | `@ActivityScope` | Activity 被銷毀時 | Android |
| Activity retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity 結束時（在組態變更時仍保留） | Android |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment 被銷毀時 | Android |

原型僅用於宣告定義。元件會在執行期開啟其作用域執行個體：以 Android 為例，是透過 [Android 作用域](/docs/reference/koin-android/scope) 中介紹的 `activityScope()` 和 `fragmentScope()` 委託來開啟。

ViewModel 原型需要在啟動時提供 `viewModelScopeFactory()` 選項，這樣 Koin 才會為每個 ViewModel 建立作用域。它被標記為 `@KoinViewModelScopeApi` 與 `@KoinExperimentalAPI`：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

在建構函式中接收作用域相依性的 ViewModel，必須宣告在 `viewModelScope { }` 內部。關於 ViewModel 的詳細資訊請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

:::tip
從未關閉的作用域會使其持有的執行個體一直保持存活。若要在真實使用者工作階段中檢視開啟的作用域以及洩漏的執行個體，請參閱[生產環境監控](/docs/tooling/production-monitoring)。
:::

## 限制 {id="limits"}

- **手動生命週期**：在原型與平台幫助程式之外，你必須自行建立與關閉作用域。Koin 不會偵測是否遺漏呼叫 `close()`。
- **無法從根存取**：`single` 定義與根作用域無法看到 `scoped` 定義。
- **關閉即結束**：已關閉的作用域執行個體無法重新開啟。請使用新的 ID 建立一個新的作用域執行個體。
- **唯一 ID**：使用已開啟作用域的 ID 建立作用域將會失敗。若作用域可能已存在，請使用 `getOrCreateScope`。

## 相關內容 {id="related"}

- [Android 作用域](/docs/reference/koin-android/scope)：`ScopeActivity`、`AndroidScopeComponent`、`activityScope()` 與 `fragmentScope()`。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：`KoinScope`、`rememberKoinScope` 與導覽作用域。
- [Ktor 請求作用域](/docs/reference/koin-ktor/ktor-scopes)：每個 HTTP 請求一個作用域。
- [ViewModel](/docs/reference/koin-core/viewmodel)：ViewModel 宣告與 ViewModel 作用域。
- [定義](/docs/reference/koin-core/definitions)：`single`、`factory`、`scoped` 與 `onClose`。
- [DSL 參考](/docs/reference/koin-core/dsl)：每個作用域 DSL 關鍵字。