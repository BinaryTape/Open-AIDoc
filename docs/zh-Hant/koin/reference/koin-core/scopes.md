---
title: Scopes
---

# Scopes

Scopes 控制相依性的生命週期。本指南涵蓋如何定義、建立與管理 scope。

## 了解 Scopes

| Scope 型別 | 生命週期 | 範例 |
|------------|-----------|---------|
| **Single** (單例) | 應用程式生命週期 | Database, ApiClient |
| **Factory** | 每次請求 | Presenter, Use Case |
| **Scoped** | 每個 scope | 與 Activity 繫結、與 Session 繫結 |

## 何時使用 Scopes

在以下情況下使用 scope：
- 執行個體的存活時間比 factory 長，但比單例短。
- 在特定內容（Activity、Fragment、Session）中共享狀態。
- 在內容結束時自動進行清理。

## 定義 Scoped 定義

### DSL

```kotlin
val appModule = module {
    // MyActivity 的 scope
    scope<MyActivity> {
        scoped<Presenter>()
        scoped<Navigator>()
    }

    // 具名 scope
    scope(named("session")) {
        scoped<SessionData>()
        scoped<UserPreferences>()
    }
}
```

### 註解 (Annotation)

| 註解 | DSL 等效項 | 用途 |
|------------|----------------|---------|
| `@Scope` | `scope<T> { }` | 指定類別所屬的 scope |
| `@Scoped` | `scoped<T>()` | 定義一個 scoped 繫結 |

一個 scoped 類別同時需要 `@Scoped` 與 `@Scope`：

```kotlin
@Scope(MyActivityScope::class)
@Scoped
class Presenter(private val repository: UserRepository)

@Scope(MyActivityScope::class)
@Scoped
class Navigator
```

或者對常見的 Android scope 使用 scope 原型 (archetype) 註解（不需要 `@Scoped`）：

```kotlin
// ViewModel scope
@ViewModelScope
class UserCache

// Activity scope
@ActivityScope
class ActivityPresenter

@ActivityRetainedScope
class RetainedPresenter

// Fragment scope
@FragmentScope
class FragmentPresenter
```

## 建立與使用 Scopes

### 手動管理 Scope

```kotlin
// 建立一個 scope
val myScope = getKoin().createScope("my_scope_id", named("session"))

// 從 scope 取得執行個體
val sessionData: SessionData = myScope.get()
val prefs: UserPreferences = myScope.get()

// 完成後關閉
myScope.close()
```

### Android Activity Scope

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    // 根據 Activity 生命週期自動建立與銷毀 Scope
    override val scope: Scope by activityScope()

    // Scoped 執行個體 - 每個 Activity 執行個體建立一個
    private val presenter: Presenter by inject()

    override fun onDestroy() {
        super.onDestroy()
        // Scope 會自動關閉
    }
}
```

### Android Fragment Scope

```kotlin
class MyFragment : Fragment(), AndroidScopeComponent {
    // 根據 Fragment 生命週期自動建立與銷毀 Scope
    override val scope: Scope by fragmentScope()

    private val presenter: Presenter by inject()
}
```

## Scope 型別

### 基於型別的 Scope

```kotlin
scope<MyActivity> {
    scoped<ActivityPresenter>()
}
```

該 scope 由型別 `MyActivity` 識別。此 scope 僅由 `MyActivity` 觸發，而 `activityScope` 則是通用型。

### 具名 Scope

```kotlin
scope(named("user_session")) {
    scoped<SessionManager>()
}
```

當 scope 未與特定型別繫結時使用。

### 基於限定詞 (Qualifier) 的 Scope

```kotlin
scope(named<MyQualifier>()) {
    scoped<ScopedService>()
}
```

## Scope 原型 (Scope Archetypes)

Koin 為常見的 Android scope 模式提供了專用 DSL。這些原型簡化了 ViewModel、Activity 和 Fragment 的 scope 定義。

### ViewModel Scope

定義與 ViewModel 生命週期繫結的相依性：

```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        scoped<UserRepository>()
        viewModel<UserViewModel>()
    }
}
```

ViewModel 會自動獲得其 scoped 相依性的存取權：

```kotlin
class UserViewModel(
    private val cache: UserCache,      // 繫結至此 ViewModel 的 scope
    private val repository: UserRepository
) : ViewModel()
```

### Activity Scope

定義與 Activity 生命週期繫結的相依性：

```kotlin
val appModule = module {
    activityScope {
        scoped<ActivityPresenter>()
        scoped<ActivityNavigator>()
    }
}
```

### Fragment Scope

定義與 Fragment 生命週期繫結的相依性：

```kotlin
val appModule = module {
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

### 比較

| 原型 | DSL | 註解 | 生命週期 |
|-----------|-----|------------|-----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel 已清除 |
| Activity | `activityScope { }` | `@ActivityScope` | Activity 已銷毀 |
| Activity Retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity 已完成 |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment 已銷毀 |

:::info
Scope 原型自 Koin 4.0+ 起提供。與為常見 Android 元件手動定義 `scope<T> { }` 相比，它們提供了更簡潔的語法。
:::

## Scope 連結 (Scope Linking)

連結 scope 以存取父層 scope 定義：

```kotlin
val appModule = module {
    // Activity scope
    scope<MainActivity> {
        scoped<ActivityData>()
    }

    // 與 Activity 連結的 Fragment scope
    scope<UserFragment> {
        scoped<FragmentPresenter>()
    }
}
```

```kotlin
class UserFragment : Fragment(), AndroidScopeComponent {
    override val scope: Scope by fragmentScope()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 連結到父層 Activity scope
        scope.linkTo((requireActivity() as AndroidScopeComponent).scope)

        // 現在可以存取 Fragment 與 Activity 的 scoped 執行個體
        val fragmentPresenter: FragmentPresenter by inject()
        val activityData: ActivityData by inject()  // 來自連結的 scope
    }
}
```

## Scope 來源 (Scope Source)

注入能感知其 scope 的相依性：

```kotlin
class Presenter(
    val scope: Scope  // 由 Koin 注入
) {
    fun clearScope() {
        scope.close()
    }
}

scope<MyActivity> {
    scoped { Presenter(get()) }  // 注入 scope
}
```

## Scope 執行個體 ID

每個 scope 執行個體都有一個唯一的 ID：

```kotlin
// 使用明確 ID 建立
val scope1 = getKoin().createScope("scope_1", named("session"))
val scope2 = getKoin().createScope("scope_2", named("session"))

// 不同的執行個體，相同的 scope 型別
scope1.get<SessionData>() !== scope2.get<SessionData>()
```

## 存取 Scoped 執行個體

### 從 Scope 內部

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    // 直接注入 scoped 執行個體
    private val presenter: Presenter by inject()
}
```

### 從 Scope 外部

```kotlin
// 取得或建立 scope
val myScope = getKoin().getOrCreateScope("my_id", named("session"))

// 取得執行個體
val session: SessionData = myScope.get()
```

### 在 Compose 中

```kotlin
@Composable
fun MyScreen() {
    // 建立與 Composable 生命週期繫結的 scope
    val scope = rememberKoinScope(named("screen_scope"))

    // 取得 scoped 執行個體
    val presenter: ScreenPresenter = scope.get()
}
```

## Scope 生命週期

### 關閉 Scopes

當 scope 關閉時：
1. 所有 scoped 執行個體都會被釋放。
2. `onClose` 回呼會被叫用。
3. Scope 變為不可用狀態。

```kotlin
val scope = getKoin().createScope("my_scope", named("session"))

// 使用 scope
val data: SessionData = scope.get()

// 完成後關閉
scope.close()  // SessionData 執行個體被釋放

// 這會拋出例外
// scope.get<SessionData>()  // 錯誤：Scope 已關閉
```

### onClose 回呼

```kotlin
scope(named("session")) {
    scoped {
        SessionData()
    } onClose {
        it?.cleanup()  // 當 scope 關閉時呼叫
    }
}
```

## 常見模式

### Session Scope

```kotlin
val appModule = module {
    scope(named("user_session")) {
        scoped { SessionManager() }
        scoped { UserPreferences(get()) }
        scoped { CartRepository(get()) }
    }
}

// 登入
fun onLogin(userId: String) {
    val sessionScope = getKoin().createScope(userId, named("user_session"))
    // Session 執行個體現在可用
}

// 登出
fun onLogout(userId: String) {
    getKoin().getScopeOrNull(userId)?.close()
    // Session 執行個體被釋放
}
```

### Feature Scope (功能作用域)

```kotlin
val appModule = module {
    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
        scoped { CheckoutPresenter(get()) }
    }
}

class CheckoutActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by lazy {
        getKoin().createScope("checkout_${hashCode()}", named("checkout"))
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.close()
    }
}
```

## 最佳實務

1. **謹慎使用單例** - 僅用於真正應用程式層級的相依性。
2. **共用狀態的 Scope** - 當多個元件需要同一個執行個體時。
3. **明確關閉 scope** - 不要依賴垃圾收集。
4. **保持 scope 專注** - 不要把所有東西都放在同一個 scope 中。
5. **使用 Android scope 元件** - 以實現自動化生命週期管理。

## 下一步

- **[Android 版 Koin](/docs/reference/koin-android/scope)** - Android 特定的 scope
- **[Compose 版 Koin](/docs/reference/koin-compose/compose-modules)** - Compose 中的 scope
- **[最佳實務](/docs/reference/koin-core/scopes)** - Scope 模式