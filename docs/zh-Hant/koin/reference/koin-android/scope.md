---
title: Android 作用域
---

# Android 作用域

Android 作用域能讓執行個體在與單一組建（Activity、Fragment、Service 或 ViewModel）相同的存續期間內保持存活，並隨之一同關閉。本頁面介紹 Android 作用域 API：作用域原型（scope archetypes）、`ScopeActivity`、`ScopeFragment`、`AndroidScopeComponent`、保留作用域（retained scopes）以及 Service 作用域。關於作用域是什麼、`scoped`、連結與一般性關閉等概念，已在 [Scopes](/docs/reference/koin-core/scopes) 中說明。

## 作用域生命週期 {id="scope-lifetimes"}

| 作用域 | 開啟時機 | 關閉時機 | 螢幕旋轉後保留 |
|-------|--------|--------|-------------------|
| `activityScope` | 首次在 Activity 中存取時 | Activity `ON_DESTROY` | 否 |
| `activityRetainedScope` | 首次在 Activity 中存取時 | Activity 結束（由 ViewModel 支援） | 是 |
| `fragmentScope` | 首次在 Fragment 中存取時 | Fragment `ON_DESTROY` | 否 |
| Service 作用域 | `Service.onCreate()` | `Service.onDestroy()` | 不適用 |
| `viewModelScope` | ViewModel 建立時 | ViewModel 被清除時 | 是 |

`single` 的存續時間與應用程式相同，因此它是所有這些作用域的最外層。

## 宣告作用域定義 {id="declaring-scoped-definitions"}

每種組建類型在 Android 中都有一個作用域原型。原型是一種作用域宣告，任何具備作用域的 Activity（或 Fragment）都可以使用它，因此你不需要為每個類別各寫一個作用域：

**Compiler Plugin DSL**
```kotlin
import org.koin.androidx.scope.dsl.activityRetainedScope
import org.koin.androidx.scope.dsl.activityScope
import org.koin.androidx.scope.dsl.fragmentScope

val screenModule = module {
    activityScope {
        scoped<ScreenNavigator>()
    }
    activityRetainedScope {
        scoped<FormState>()
    }
    fragmentScope {
        scoped<DetailPresenter>()
    }
}
```

**Annotations**
```kotlin
import org.koin.android.annotation.ActivityRetainedScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ActivityScope
class ScreenNavigator(private val activity: Activity)

@ActivityRetainedScope
class FormState

@FragmentScope
class DetailPresenter(private val repository: UserRepository)
```

**Constructor / Classic DSL**
```kotlin
import org.koin.androidx.scope.dsl.activityRetainedScope
import org.koin.androidx.scope.dsl.activityScope
import org.koin.androidx.scope.dsl.fragmentScope

val screenModule = module {
    activityScope {
        scopedOf(::ScreenNavigator)
    }
    activityRetainedScope {
        scopedOf(::FormState)
    }
    fragmentScope {
        scopedOf(::DetailPresenter)
    }
}
```

若要將定義限制在單一 Activity 類別，請改為宣告基於型別的作用域（在 DSL 中使用 `scope<UserActivity> { }`，在註解中使用 `@Scope(UserActivity::class)` 搭配 `@Scoped`）。Koin 會先在基於型別的作用域中尋找，接著才在原型中尋找。基於型別的作用域在 [Scopes](/docs/reference/koin-core/scopes) 中有詳細說明。

## Activity 作用域 {id="activity-scope"}

繼承 `ScopeActivity`，或是實作 `AndroidScopeComponent` 並透過 `activityScope()` 建立作用域：

```kotlin
import org.koin.androidx.scope.ScopeActivity

class UserActivity : ScopeActivity() {

    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.android.scope.AndroidScopeComponent
import org.koin.androidx.scope.activityScope

class UserActivity : AppCompatActivity(), AndroidScopeComponent {

    override val scope: Scope by activityScope()

    private val navigator: ScreenNavigator by inject()
}
```

在具有作用域的情況下，Activity 中的 `inject()`、`get()` 和 `viewModel()` 會優先從 Activity 作用域解析，接著才從根作用域解析。該作用域會在 Activity 的 `ON_DESTROY` 生命週期事件發生時關閉，因此當你的 `onDestroy()` 程式碼執行時，它已經關閉了。

Activity 是其作用域的來源。作用域內的定義可以要求 `Activity` 或 `Context`，並接收目前的 Activity：

```kotlin
@ActivityScope
class ScreenNavigator(private val activity: Activity) {
    fun openSettings() = activity.startActivity(Intent(activity, SettingsActivity::class.java))
}
```

`activityScope()`（委託屬性，位於 `org.koin.androidx.scope`）與 `activityScope { }`（模組 DSL，位於 `org.koin.androidx.scope.dsl`）同名。當編譯器選錯時，請檢查匯入陳述式（import）。

### 保留 Activity 作用域 {id="retained-activity-scope"}

`activityRetainedScope()` 能在設定變更（configuration changes）跨越時保持同一個作用域。Koin 會將其存儲在 Activity 的 ViewModel 中，並在該 ViewModel 被清除（即 Activity 結束時）將其關閉：

```kotlin
import org.koin.androidx.scope.RetainedScopeActivity

class FormActivity : RetainedScopeActivity() {

    private val formState: FormState by inject()
}
```

或者搭配 `AndroidScopeComponent`：`override val scope: Scope by activityRetainedScope()`。

保留作用域中的定義其存續期長於 Activity 執行個體。它們絕對不能保留對 Activity、其 View 或 Fragment 的參照。保留作用域沒有來源：其中的 `Context` 會解析為 `Application`。

## Fragment 作用域 {id="fragment-scope"}

繼承 `ScopeFragment`，或是搭配 `fragmentScope()` 實作 `AndroidScopeComponent`：

```kotlin
import org.koin.androidx.scope.ScopeFragment

class DetailFragment : ScopeFragment() {

    private val presenter: DetailPresenter by inject()

    // 從父 Activity 作用域解析
    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.androidx.scope.fragmentScope

class DetailFragment : Fragment(), AndroidScopeComponent {

    override val scope: Scope by fragmentScope()
}
```

Fragment 作用域已連結至宿主 Activity 作用域，因此它可以看到 Activity 作用域中的執行個體。這僅在宿主 Activity 擁有作用域（`ScopeActivity` 或 `AndroidScopeComponent`）時才有效；否則將略過該連結且 Koin 會輸出記錄。傳入 `fragmentScope(useParentActivityScope = false)` 則可特意略過該連結。

:::warning
Fragment 作用域遵循 Fragment 的生命週期（`ON_DESTROY`），而非檢視生命週期。持有 View 或資料繫結的作用域執行個體會在 `onDestroyView()` 之後繼續保留它，直到 Fragment 被銷毀為止。請在 `onDestroyView()` 中釋放 View 參照。
:::

## Service 作用域 {id="service-scope"}

繼承 `ScopeService`。其作用域會在 `onCreate()` 中開啟，並在 `onDestroy()` 中關閉。Service 沒有原型：請為 Service 類別宣告基於型別的作用域。

**Compiler Plugin DSL**
```kotlin
val playerModule = module {
    scope<MusicService> {
        scoped<PlaybackSession>()
    }
}
```

**Annotations**
```kotlin
@Scope(MusicService::class)
@Scoped
class PlaybackSession
```

**Constructor / Classic DSL**
```kotlin
val playerModule = module {
    scope<MusicService> {
        scopedOf(::PlaybackSession)
    }
}
```

```kotlin
import org.koin.android.scope.ScopeService

class MusicService : ScopeService() {

    private val session: PlaybackSession by inject()

    override fun onBind(intent: Intent?): IBinder? = null
}
```

如果你的 Service 無法繼承 `ScopeService`，請實作 `AndroidScopeComponent` 並宣告 `override val scope: Scope by serviceScope()`，然後在 `onDestroy()` 中呼叫 `destroyServiceScope()`。

## ViewModel 作用域 {id="viewmodel-scope"}

ViewModel 作用域持有的執行個體，其存續時間與單一 ViewModel 完全相同。可以使用 `viewModelScope { }` 或 `@ViewModelScope` 宣告它們。然後啟用 `viewModelScopeFactory()` 選項，讓 Koin 為每個 ViewModel 建立作用域，或是繼承 `ScopeViewModel`：

```kotlin
import org.koin.core.option.viewModelScopeFactory

startKoin {
    androidContext(this@MainApplication)
    options(viewModelScopeFactory())
    modules(appModule)
}
```

宣告方式、選項以及 `ScopeViewModel` 已在 [Scopes](/docs/reference/koin-core/scopes) 中說明。在 Android 上，照常使用 `by viewModel()` 擷取 ViewModel（請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)）。

請勿在 `activityScope` 中使用 `scoped` 宣告 ViewModel：這樣只會得到一個不由 `ViewModelStore` 管理的一般物件，且每次螢幕旋轉時都會重新建立。請使用 `viewModel` 宣告它，並透過 `by viewModel()` 來擷取。

## 在作用域關閉前進行清理 {id="cleaning-up-before-the-scope-closes"}

在 `AndroidScopeComponent` 中覆寫 `onCloseScope()`。Koin 會在關閉 Activity 或 Fragment 作用域之前呼叫它，此時作用域執行個體仍然可用：

```kotlin
class UserActivity : ScopeActivity() {

    override fun onCloseScope() {
        get<ScreenNavigator>().clear()
    }
}
```

保留作用域或 Service 作用域不會呼叫 `onCloseScope()`。若要進行綁定到單一定義的清理作業，請在該定義上使用 `onClose { }`（請參閱 [Definitions](/docs/reference/koin-core/definitions#release-callback)）。

## 限制 {id="limits"}

- 需要作用域：注入作用域定義的類別必須擁有作用域（`ScopeActivity`、`ScopeFragment`、`ScopeService` 或 `AndroidScopeComponent`）。若沒有，`inject()` 會從根作用域解析，並因 `NoDefinitionFoundException` 而失敗。
- 主執行緒：請從主執行緒建立 Activity 和 Fragment 作用域（屬性委託會在 `onCreate()` 中或之後讀取）。
- 自訂作用域：自行使用 `getKoin().createScope()` 建立的作用域未綁定任何生命週期。請自行將其關閉。

:::tip
若要在實際使用者工作階段中檢視作用域生命週期與洩漏的執行個體，請參閱 [Production Monitoring](/docs/tooling/production-monitoring)。
:::

## 相關內容 {id="related"}

- [Scopes](/docs/reference/koin-core/scopes)：作用域概念、連結、`@Scope` 與 ViewModel 作用域。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：搭配 Activity 與 Fragment 作用域的 ViewModel。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：在 Android 組建中進行注入。
- [Fragment Factory](/docs/reference/koin-android/fragment-factory)：從 Activity 作用域建立 Fragment。
- [Android Best Practices](/docs/reference/koin-android/best-practices)：避免 Context 與 Activity 記憶體洩漏。