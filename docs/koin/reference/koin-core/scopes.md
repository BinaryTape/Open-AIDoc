---
title: 作用域
---

# 作用域

作用域控制依赖项的生命周期。本指南介绍如何定义、创建和管理作用域。

## 理解作用域

| 作用域类型 | 生命周期 | 示例 |
|------------|-----------|---------|
| **Single** (单例) | 应用存续期 | 数据库、ApiClient |
| **Factory** | 每次请求 | Presenter、用例 |
| **Scoped** | 每个作用域 | Activity 绑定、会话绑定 |

## 何时使用作用域

在以下情况下请使用作用域：
- 实例的存续时间比 `factory` 长，但比单例短
- 在特定上下文（Activity、Fragment、会话）中共享状态
- 在上下文结束时自动进行清理

## 定义作用域定义

### DSL

```kotlin
val appModule = module {
    // MyActivity 的作用域
    scope<MyActivity> {
        scoped<Presenter>()
        scoped<Navigator>()
    }

    // 命名作用域
    scope(named("session")) {
        scoped<SessionData>()
        scoped<UserPreferences>()
    }
}
```

### 注解

| 注解 | DSL 等效项 | 用途 |
|------------|----------------|---------|
| `@Scope` | `scope<T> { }` | 指定类所属的作用域 |
| `@Scoped` | `scoped<T>()` | 定义一个作用域绑定 |

一个作用域类需要同时具备 `@Scoped` 和 `@Scope`：

```kotlin
@Scope(MyActivityScope::class)
@Scoped
class Presenter(private val repository: UserRepository)

@Scope(MyActivityScope::class)
@Scoped
class Navigator
```

或者对通用的 Android 作用域使用作用域原型注解（无需 `@Scoped`）：

```kotlin
// ViewModel 作用域
@ViewModelScope
class UserCache

// Activity 作用域
@ActivityScope
class ActivityPresenter

@ActivityRetainedScope
class RetainedPresenter

// Fragment 作用域
@FragmentScope
class FragmentPresenter
```

## 创建和使用作用域

### 手动作用域管理

```kotlin
// 创建一个作用域
val myScope = getKoin().createScope("my_scope_id", named("session"))

// 从作用域获取实例
val sessionData: SessionData = myScope.get()
val prefs: UserPreferences = myScope.get()

// 完成后关闭
myScope.close()
```

### Android Activity 作用域

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    // 基于 Activity 生命周期自动创建和销毁作用域
    override val scope: Scope by activityScope()

    // 作用域实例 - 每个 Activity 实例创建一个
    private val presenter: Presenter by inject()

    override fun onDestroy() {
        super.onDestroy()
        // 作用域会自动关闭
    }
}
```

### Android Fragment 作用域

```kotlin
class MyFragment : Fragment(), AndroidScopeComponent {
    // 基于 Fragment 生命周期自动创建和销毁作用域
    override val scope: Scope by fragmentScope()

    private val presenter: Presenter by inject()
}
```

## 作用域类型

### 基于类型的作用域

```kotlin
scope<MyActivity> {
    scoped<ActivityPresenter>()
}
```

该作用域由类型 `MyActivity` 标识。此作用域仅由 `MyActivity` 触发，而 `activityScope` 是通用的。

### 命名作用域

```kotlin
scope(named("user_session")) {
    scoped<SessionManager>()
}
```

当作用域未绑定到特定类型时使用。

### 基于限定符的作用域

```kotlin
scope(named<MyQualifier>()) {
    scoped<ScopedService>()
}
```

## 作用域原型

Koin 为通用的 Android 作用域模式提供了专用的 DSL。这些原型简化了 ViewModel、Activity 和 Fragment 的作用域定义。

### ViewModel 作用域

定义绑定到 ViewModel 生命周期的依赖项：

```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        scoped<UserRepository>()
        viewModel<UserViewModel>()
    }
}
```

ViewModel 会自动获得对其作用域依赖项的访问权限：

```kotlin
class UserViewModel(
    private val cache: UserCache,      // 作用域绑定到此 ViewModel
    private val repository: UserRepository
) : ViewModel()
```

### Activity 作用域

定义绑定到 Activity 生命周期的依赖项：

```kotlin
val appModule = module {
    activityScope {
        scoped<ActivityPresenter>()
        scoped<ActivityNavigator>()
    }
}
```

### Fragment 作用域

定义绑定到 Fragment 生命周期的依赖项：

```kotlin
val appModule = module {
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

### 对比

| 原型 | DSL | 注解 | 生命周期 |
|-----------|-----|------------|-----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel 已清除 |
| Activity | `activityScope { }` | `@ActivityScope` | Activity 已销毁 |
| Activity Retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity 已完成 |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment 已销毁 |

:::info
作用域原型在 Koin 4.0+ 中可用。相比于为通用的 Android 组件手动定义 `scope<T> { }`，它们提供了更整洁的语法。
:::

## 作用域链接

链接作用域以访问父作用域定义：

```kotlin
val appModule = module {
    // Activity 作用域
    scope<MainActivity> {
        scoped<ActivityData>()
    }

    // 链接到 Activity 的 Fragment 作用域
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

        // 链接到父 Activity 作用域
        scope.linkTo((requireActivity() as AndroidScopeComponent).scope)

        // 现在可以访问 Fragment 和 Activity 作用域下的实例
        val fragmentPresenter: FragmentPresenter by inject()
        val activityData: ActivityData by inject()  // 来自链接的作用域
    }
}
```

## 作用域源

注入感知其所属作用域的依赖项：

```kotlin
class Presenter(
    val scope: Scope  // 由 Koin 注入
) {
    fun clearScope() {
        scope.close()
    }
}

scope<MyActivity> {
    scoped { Presenter(get()) }  // 注入作用域
}
```

## 作用域实例 ID

每个作用域实例都有一个唯一的 ID：

```kotlin
// 使用显式 ID 创建
val scope1 = getKoin().createScope("scope_1", named("session"))
val scope2 = getKoin().createScope("scope_2", named("session"))

// 不同的实例，相同的作用域类型
scope1.get<SessionData>() !== scope2.get<SessionData>()
```

## 访问作用域实例

### 从作用域内部

```kotlin
class MyActivity : AppCompatActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    // 直接注入作用域实例
    private val presenter: Presenter by inject()
}
```

### 从作用域外部

```kotlin
// 获取或创建作用域
val myScope = getKoin().getOrCreateScope("my_id", named("session"))

// 获取实例
val session: SessionData = myScope.get()
```

### 在 Compose 中

```kotlin
@Composable
fun MyScreen() {
    // 创建绑定到 Composable 生命周期的作用域
    val scope = rememberKoinScope(named("screen_scope"))

    // 获取作用域实例
    val presenter: ScreenPresenter = scope.get()
}
```

## 作用域生命周期

### 关闭作用域

当作用域关闭时：
1. 所有作用域实例都会被释放
2. `onClose` 回调被触发
3. 作用域变得不可用

```kotlin
val scope = getKoin().createScope("my_scope", named("session"))

// 使用作用域
val data: SessionData = scope.get()

// 完成后关闭
scope.close()  // SessionData 实例已释放

// 这将抛出异常
// scope.get<SessionData>()  // 错误：作用域已关闭
```

### onClose 回调

```kotlin
scope(named("session")) {
    scoped {
        SessionData()
    } onClose {
        it?.cleanup()  // 当作用域关闭时调用
    }
}
```

## 常见模式

### 会话作用域

```kotlin
val appModule = module {
    scope(named("user_session")) {
        scoped { SessionManager() }
        scoped { UserPreferences(get()) }
        scoped { CartRepository(get()) }
    }
}

// 登录
fun onLogin(userId: String) {
    val sessionScope = getKoin().createScope(userId, named("user_session"))
    // 会话实例现在可用
}

// 登出
fun onLogout(userId: String) {
    getKoin().getScopeOrNull(userId)?.close()
    // 会话实例已释放
}
```

### 功能作用域

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

## 最佳做法

1. **谨慎使用单例** - 仅用于真正应用级的依赖项
2. **对共享状态进行作用域限定** - 当多个组件需要同一个实例时
3. **显式关闭作用域** - 不要依赖垃圾回收
4. **保持作用域职责专注** - 不要把所有内容都放入一个作用域
5. **使用 Android 作用域组件** - 以实现自动生命周期管理

## 后续步骤

- **[Android 版 Koin](/docs/reference/koin-android/scope)** - Android 特定作用域
- **[Compose 版 Koin](/docs/reference/koin-compose/compose-modules)** - Compose 中的作用域
- **[最佳做法](/docs/reference/koin-core/scopes)** - 作用域模式