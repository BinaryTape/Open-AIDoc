---
title: Android 入口点
---

# Android 入口点

Android 会自行创建其组件（Activity、Fragment、Service、BroadcastReceiver），因此 Koin 无法对它们使用构造函数注入。这些类是入口点：它们向 Koin 请求其依赖项，而它们之下的所有内容均使用构造函数注入。本页面展示了如何在各个 Android 组件中实现这一点。此处假设 Koin 已启动（请参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)），并且你的定义已声明（请参阅[定义](/docs/reference/koin-core/definitions)）。

无论使用哪种风格声明定义，注入代码都是相同的。

## 组件速览 {id="components-at-a-glance"}

| 组件 | 如何注入 | 内置 Koin 扩展 |
|-----------|---------------|--------------------------|
| `Application` | `by inject()`，在 `startKoin` 之后 | 是 |
| `Activity` | `by inject()`、`get()`、`by viewModel()` | 是 |
| `Fragment` | `by inject()`、`get()`、`by viewModel()`、`by activityViewModel()` | 是 |
| `Service` | `by inject()`、`get()` | 是 |
| `ContentProvider` | `by inject()`，具有时序限制 | 是 |
| `BroadcastReceiver` | 实现 `KoinComponent` | 否 |
| 自定义 `View` | 实现 `KoinComponent`，或传入数据 | 否 |

Koin 为每个 Android `ComponentCallbacks` 类都添加了 `inject()` 和 `get()`：`Application`、`Activity`、`Fragment`、`Service` 以及 `ContentProvider`。由框架创建的其他类（接收器、从 XML 加载扩充的 View）则实现 [`KoinComponent`](/docs/reference/koin-core/koin-component) 以获取相同的函数。你自己的类（仓库、用例、ViewModel）则无需这样做：它们通过构造函数接收依赖项。

## Activity {id="activity"}

```kotlin
import org.koin.android.ext.android.inject
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserActivity : AppCompatActivity() {

    private val presenter: UserPresenter by inject()
    private val viewModel: UserViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        presenter.loadUser()
    }
}
```

`by viewModel()` 与 `by inject()` 不同：它通过 Android 的 `ViewModelStore` 进行处理，因此实例在屏幕旋转后依然能够存活。请为所有 ViewModel 使用该方式。请参阅 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

## Fragment {id="fragment"}

```kotlin
import org.koin.android.ext.android.inject
import org.koin.androidx.viewmodel.ext.android.activityViewModel
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserFragment : Fragment() {

    private val presenter: UserPresenter by inject()
    private val viewModel: UserDetailViewModel by viewModel()
    private val sharedViewModel: UserViewModel by activityViewModel()
}
```

`by viewModel()` 提供由 Fragment 所有的 ViewModel。`by activityViewModel()` 提供由宿主 Activity 所有的 ViewModel，并与该 Activity 及其其他 Fragment 共享。

如需改用构造函数注入来创建 Fragment，请参阅 [Fragment 工厂](/docs/reference/koin-android/fragment-factory)。

## Service {id="service"}

```kotlin
class MusicPlayerService : Service() {

    private val player: MusicPlayer by inject()
    private val repository: MusicRepository by inject()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.getStringExtra("SONG_ID")?.let { songId ->
            player.play(repository.getSong(songId))
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        player.release()
        super.onDestroy()
    }
}
```

Service 的生命周期可能很长。请在 `onDestroy()` 中释放其持有的内容。对于生命周期应与 Service 完全一致的实例，可继承 `ScopeService`（请参阅 [Android 作用域](/docs/reference/koin-android/scope#service-scope)）。对于延迟后台任务，建议优先使用 [WorkManager](/docs/reference/koin-android/workmanager)，它支持在 Worker 中使用构造函数注入。

## BroadcastReceiver {id="broadcastreceiver"}

Android 会自行使用无参构造函数创建接收器，且 `BroadcastReceiver` 没有内置的 Koin 扩展。实现 `KoinComponent` 即可将其作为入口点：

```kotlin
class BootReceiver : BroadcastReceiver(), KoinComponent {

    private val scheduler: SyncScheduler by inject()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            scheduler.scheduleSync()
        }
    }
}
```

无论是在清单中声明的接收器，还是在运行时注册的接收器，Koin 在 `onReceive()` 中均已就绪：因为 Android 在分发广播之前就会创建 `Application` 并运行 `startKoin`。

`onReceive()` 运行在主线程上，并且大约有 10 秒的时间，之后系统便会认为该接收器处于阻塞状态。请保持逻辑简短，并将耗时工作移交给 WorkManager：

```kotlin
class AlarmReceiver : BroadcastReceiver(), KoinComponent {

    private val workManager: WorkManager by inject()

    override fun onReceive(context: Context, intent: Intent) {
        val request = OneTimeWorkRequestBuilder<AlarmWorker>()
            .setInputData(workDataOf("alarm_id" to intent.getIntExtra("ID", -1)))
            .build()
        workManager.enqueue(request)
    }
}
```

此处假设你的模块中包含 `WorkManager` 定义，例如 `single { WorkManager.getInstance(androidContext()) }`。

## ContentProvider {id="contentprovider"}

`ContentProvider` 拥有 Koin 扩展，但 Android 会在 `Application.onCreate()` 之前创建它。此时 `startKoin` 尚未运行。

```kotlin
class UserContentProvider : ContentProvider() {

    private val repository: UserRepository by inject()

    override fun onCreate(): Boolean {
        // Koin 尚未启动：请勿在此处访问 repository
        return true
    }

    override fun query(
        uri: Uri,
        projection: Array<out String>?,
        selection: String?,
        selectionArgs: Array<out String>?,
        sortOrder: String?,
    ): Cursor? = repository.query(uri)

    ...
}
```

`by inject()` 是延迟初始化的，因此实例会在首次调用 `query()` 时（即 `Application.onCreate()` 之后）被解析。如果在 `onCreate()` 中调用 `get()` 或读取 `repository`，则会失败并抛出 "KoinApplication has not been started"。

如果 Provider 需要在其自身的 `onCreate()` 中使用 Koin，则 Koin 必须在此之前启动。你可以在此处启动 Koin 并设置防重保护确保其仅运行一次，同时从 `Application` 中移除 `startKoin`：

```kotlin
override fun onCreate(): Boolean {
    val appContext = context?.applicationContext ?: return false
    if (GlobalContext.getOrNull() == null) {
        startKoin {
            androidContext(appContext)
            modules(appModule)
        }
    }
    return true
}
```

:::warning
在同一进程中两次调用 `startKoin` 会失败并抛出 `KoinApplicationAlreadyStartedException`。如果你在 ContentProvider 中启动了 Koin，则 `Application` 类中切勿再次启动它。
:::

## 自定义 View {id="custom-view"}

View 应当用于显示数据，而不是获取数据。大多数 View 都不需要注入：由 Activity 或 Fragment 注入 ViewModel 并将数据传递给 View。

```kotlin
class ChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {

    fun setData(data: ChartData) {
        ...
        invalidate()
    }
}
```

当从 XML 加载扩充的 View 需要共享帮助程序（如渲染器、图像加载器）时，Android 会调用其构造函数，因此 Koin 无法将帮助程序传入。此时可实现 `KoinComponent`：

```kotlin
class AvatarView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : AppCompatImageView(context, attrs), KoinComponent {

    private val imageLoader: ImageLoader by inject()

    fun load(url: String) {
        if (!isInEditMode) imageLoader.load(url, this)
    }
}
```

在 Android Studio 布局预览中 Koin 并未启动。当 `isInEditMode` 为 true 时，不要解析依赖项。

## Application 类 {id="application-class"}

`Application` 类也具有 Koin 扩展。请在 `startKoin` 之后使用它们：

```kotlin
class MainApplication : Application() {

    private val crashReporter: CrashReporter by inject()

    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
        crashReporter.install()
    }
}
```

## 延迟注入还是即时注入 {id="lazy-or-eager"}

```kotlin
class UserActivity : AppCompatActivity() {

    // 延迟：首次访问时解析
    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 即时：立即解析
        val analytics: Analytics = get()
    }
}
```

| 函数 | 解析时机 | 适用场景 |
|----------|----------|------------|
| `by inject()` | 首次访问属性时 | 属性：在使用之前不会创建任何内容 |
| `get()` | 被调用时 | 函数内部的局部变量 |

属性初始化器中的 `get()` 会在 Android 构建 Activity 或 Fragment 时（早于 `onCreate()`）运行，并且即使该界面从未使用它，也会创建该实例。对于属性，建议优先使用 `by inject()`。延迟委托默认是线程安全的 (`LazyThreadSafetyMode.SYNCHRONIZED`)；如果属性仅在主线程上读取，可传入 `inject(mode = LazyThreadSafetyMode.NONE)`。

有关 `inject()` 和 `get()` 在各个平台上的工作原理，请参阅[注入](/docs/reference/koin-core/injection)。

## 调用站点的参数与限定符 {id="parameters-and-qualifiers-at-the-call-site"}

这两个函数均可接收[限定符](/docs/reference/koin-core/qualifiers)和[注入形参](/docs/reference/koin-core/injection-parameters)：

```kotlin
class UserDetailActivity : AppCompatActivity() {

    private val userId: String by lazy { intent.getStringExtra("USER_ID").orEmpty() }

    private val presenter: UserDetailPresenter by inject { parametersOf(userId) }
    private val localDatabase: Database by inject(named("local"))
}
```

形参 lambda 表达式会在属性首次被读取时运行。在其中读取 `intent` 是安全的，因为此时已经处于 `onCreate()` 之后。

## 相关内容 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel)：`by viewModel()`、`activityViewModel()` 以及导航图 ViewModel。
- [Android 作用域](/docs/reference/koin-android/scope)：绑定到 Activity、Fragment 或 Service 的实例。
- [注入](/docs/reference/koin-core/injection)：各个平台上的 `inject()`、`get()`、可空与延迟注入。
- [KoinComponent](/docs/reference/koin-core/koin-component)：在 Android 组件之外何时以及如何使用它。
- [WorkManager](/docs/reference/koin-android/workmanager)：在 Worker 中使用构造函数注入。