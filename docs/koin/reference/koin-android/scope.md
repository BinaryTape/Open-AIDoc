---
title: Android 作用域
---

# Android 作用域

Android 作用域让实例的存活时间与某个组件（Activity、Fragment、Service 或 ViewModel）保持一致，并在该组件关闭时将其一并关闭。本页涵盖了 Android 作用域 API：作用域原型（scope archetypes）、`ScopeActivity`、`ScopeFragment`、`AndroidScopeComponent`、保留（retained）作用域以及 Service 作用域。关于作用域的概念、`scoped`、链接（linking）以及关闭的常规说明，请参阅[作用域](/docs/reference/koin-core/scopes)。

## 作用域生命周期 {id="scope-lifetimes"}

| 作用域 | 开启时机 | 关闭时机 | 屏幕旋转后存活 |
|-------|--------|--------|-------------------|
| `activityScope` | 在 Activity 中首次访问时 | Activity 的 `ON_DESTROY` | 否 |
| `activityRetainedScope` | 在 Activity 中首次访问时 | Activity 结束（由 ViewModel 支持） | 是 |
| `fragmentScope` | 在 Fragment 中首次访问时 | Fragment 的 `ON_DESTROY` | 否 |
| Service 作用域 | `Service.onCreate()` | `Service.onDestroy()` | 不适用 |
| `viewModelScope` | ViewModel 创建时 | ViewModel 被清理时 | 是 |

`single` 的生命周期与应用程序相同，因此它是所有这些作用域的外层级别。

## 声明作用域定义 {id="declaring-scoped-definitions"}

Android 为每种组件类型提供了一个作用域原型。原型是一种作用域声明，每个具有作用域的 Activity（或 Fragment）都可以使用它，因此你无需为每个类单独编写作用域：

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

若要将定义限制在特定的 Activity 类，请改用基于类型的作用域（在 DSL 中使用 `scope<UserActivity> { }`，在注解中使用带有 `@Scoped` 的 `@Scope(UserActivity::class)`）。Koin 会优先在基于类型的作用域中查找，然后再在原型中查找。基于类型的作用域在[作用域](/docs/reference/koin-core/scopes)中进行了说明。

## Activity 作用域 {id="activity-scope"}

继承 `ScopeActivity`，或者实现 `AndroidScopeComponent` 并通过 `activityScope()` 创建作用域：

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

拥有作用域后，Activity 中的 `inject()`、`get()` 和 `viewModel()` 会优先从 Activity 作用域进行解析，然后再从根作用域进行解析。该作用域会在 Activity 的 `ON_DESTROY` 生命周期事件发生时关闭，因此在你的 `onDestroy()` 代码运行时，它就已经关闭了。

Activity 是其作用域的源对象。处于该作用域内的定义可以请求 `Activity` 或 `Context`，并接收当前的 Activity 实例：

```kotlin
@ActivityScope
class ScreenNavigator(private val activity: Activity) {
    fun openSettings() = activity.startActivity(Intent(activity, SettingsActivity::class.java))
}
```

`activityScope()`（委托函数，位于 `org.koin.androidx.scope`）和 `activityScope { }`（模块 DSL，位于 `org.koin.androidx.scope.dsl`）同名。当编译器选取错误时，请检查导入语句。

### 保留的 Activity 作用域 {id="retained-activity-scope"}

`activityRetainedScope()` 可以在配置变更期间保持相同的作用域。Koin 会将其存储在 Activity 的 ViewModel 中，并在该 ViewModel 被清理时（即 Activity 结束时）关闭它：

```kotlin
import org.koin.androidx.scope.RetainedScopeActivity

class FormActivity : RetainedScopeActivity() {

    private val formState: FormState by inject()
}
```

或者，配合 `AndroidScopeComponent` 使用：`override val scope: Scope by activityRetainedScope()`。

保留作用域中的定义生命周期长于 Activity 实例。它们不得保留对 Activity、其 View 或 Fragment 的引用。保留作用域没有源对象：其中的 `Context` 会解析为 `Application`。

## Fragment 作用域 {id="fragment-scope"}

继承 `ScopeFragment`，或者通过 `fragmentScope()` 实现 `AndroidScopeComponent`：

```kotlin
import org.koin.androidx.scope.ScopeFragment

class DetailFragment : ScopeFragment() {

    private val presenter: DetailPresenter by inject()

    // 从父 Activity 作用域解析
    private val navigator: ScreenNavigator by inject()
}
```

```kotlin
import org.koin.androidx.scope.fragmentScope

class DetailFragment : Fragment(), AndroidScopeComponent {

    override val scope: Scope by fragmentScope()
}
```

Fragment 作用域已链接到宿主 Activity 作用域，因此它可以感知到 Activity 作用域内的实例。这仅在宿主 Activity 拥有作用域（`ScopeActivity` 或 `AndroidScopeComponent`）时才有效；否则该链接会被跳过并且 Koin 会记录日志。传入 `fragmentScope(useParentActivityScope = false)` 可以主动跳过该链接。

:::warning
Fragment 作用域遵循 Fragment 生命周期（`ON_DESTROY`），而非视图（view）生命周期。持有 View 或绑定的作用域实例会在 `onDestroyView()` 之后继续保留它，直到 Fragment 被销毁。请在 `onDestroyView()` 中释放 View 引用。
:::

## Service 作用域 {id="service-scope"}

继承 `ScopeService`。其作用域在 `onCreate()` 中开启，并在 `onDestroy()` 中关闭。Service 没有作用域原型：需要为 Service 类声明基于类型的作用域。

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

如果你的 Service 无法继承 `ScopeService`，请实现 `AndroidScopeComponent` 并使用 `override val scope: Scope by serviceScope()`，然后在 `onDestroy()` 中调用 `destroyServiceScope()`。

## ViewModel 作用域 {id="viewmodel-scope"}

ViewModel 作用域容纳的实例存活时间与某个 ViewModel 完全一致。可以通过 `viewModelScope { }` 或 `@ViewModelScope` 来声明它们。然后启用 `viewModelScopeFactory()` 选项让 Koin 为每个 ViewModel 创建作用域，或者继承 `ScopeViewModel`：

```kotlin
import org.koin.core.option.viewModelScopeFactory

startKoin {
    androidContext(this@MainApplication)
    options(viewModelScopeFactory())
    modules(appModule)
}
```

声明方式、该选项以及 `ScopeViewModel` 均在[作用域](/docs/reference/koin-core/scopes)中进行了说明。在 Android 上，照常使用 `by viewModel()` 获取 ViewModel（参见 [Android ViewModel](/docs/reference/koin-android/viewmodel)）。

不要在 `activityScope` 中使用 `scoped` 声明 ViewModel：这样你会得到一个不受 `ViewModelStore` 管理的普通对象，并且会在每次屏幕旋转时重新创建。请使用 `viewModel` 声明它，并通过 `by viewModel()` 获取。

## 在作用域关闭之前进行清理 {id="cleaning-up-before-the-scope-closes"}

在 `AndroidScopeComponent` 中重写 `onCloseScope()`。Koin 会在关闭 Activity 或 Fragment 作用域之前调用它，此时作用域内的实例仍然可用：

```kotlin
class UserActivity : ScopeActivity() {

    override fun onCloseScope() {
        get<ScreenNavigator>().clear()
    }
}
```

保留作用域或 Service 作用域不会调用 `onCloseScope()`。对于与单个定义绑定的清理操作，请在定义上使用 `onClose { }`（参见[定义](/docs/reference/koin-core/definitions#release-callback)）。

## 限制 {id="limits"}

- 必需具有作用域：注入了作用域定义的类必须拥有作用域（`ScopeActivity`、`ScopeFragment`、`ScopeService` 或 `AndroidScopeComponent`）。如果没有，`inject()` 会从根作用域进行解析，并抛出 `NoDefinitionFoundException` 异常失败。
- 主线程：请从主线程创建 Activity 和 Fragment 作用域（属性委托在 `onCreate()` 中或之后读取）。
- 自定义作用域：使用 `getKoin().createScope()` 自行创建的作用域未绑定到任何生命周期。需要自行关闭它。

:::tip
若要查看真实用户会话中的作用域生命周期和泄漏实例，请参阅[生产环境监控](/docs/tooling/production-monitoring)。
:::

## 相关内容 {id="related"}

- [作用域](/docs/reference/koin-core/scopes)：作用域概念、链接、`@Scope` 与 ViewModel 作用域。
- [Android ViewModel](/docs/reference/koin-android/viewmodel)：结合 Activity 和 Fragment 作用域的 ViewModel。
- [Android 入口点](/docs/reference/koin-android/entry-points)：在 Android 组件中进行注入。
- [Fragment 工厂](/docs/reference/koin-android/fragment-factory)：从 Activity 作用域创建 Fragment。
- [Android 最佳实践](/docs/reference/koin-android/best-practices)：避免 Context 与 Activity 泄漏。