---
title: 在 Android 上启动 Koin
---

# 在 Android 上启动 Koin

本页介绍如何在 Android 应用中启动 Koin：`Application` 类、Android `Context`、Logcat 日志记录器、来自 assets 的属性、启动后加载模块以及 AndroidX App Startup。本文假设你的构建配置中已包含 `io.insert-koin:koin-android` 依赖项（请参阅 [Gradle 设置](/docs/setup/gradle)）。关于 `startKoin` 在各平台上的作用，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 在 Application 类中启动 Koin {id="start-koin-in-your-application-class"}

在 `Application.onCreate()` 中启动一次 Koin：

**编译器插件 DSL**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`appModule` 是使用编译器插件 DSL（`single<UserRepository>()`、`viewModel<UserViewModel>()`）声明的 `module { }`。

**注解**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.annotation.KoinApplication
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin<MainApplication> {
            androidLogger()
            androidContext(this@MainApplication)
        }
    }
}
```

`startKoin<MainApplication>()` 会加载每个带有 `@Configuration` 标记的 `@Module` 类。你无需自行列出模块。若要显式选取模块，请使用 `@KoinApplication(modules = [AppModule::class])`。模块发现机制在[模块](/docs/reference/koin-core/modules)中进行了说明。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

在 `AndroidManifest.xml` 中的 `<application>` 标记上使用 `android:name=".MainApplication"` 注册该类，否则 Android 绝不会运行它。

`androidContext()` 将 `Application` 实例添加到 Koin 中，同时绑定到 `Application` 和 `Context`。请在任何需要 `Context` 的选项（如 `androidFileProperties()` 或 `workManagerFactory()`）之前调用它。

## 定义中的 Android Context {id="android-context-in-definitions"}

需要 `Context` 的类在其构造函数中声明它即可。不需要限定符：Koin 会将 `Context` 解析为传递给 `androidContext()` 的实例。

**编译器插件 DSL**
```kotlin
class PreferencesStore(private val context: Context)
class NotificationHelper(private val application: Application)

val androidModule = module {
    single<PreferencesStore>()
    single<NotificationHelper>()
}
```

**注解**
```kotlin
@Singleton
class PreferencesStore(private val context: Context)

@Singleton
class NotificationHelper(private val application: Application)
```

**构造函数 / 经典 DSL**
```kotlin
val androidModule = module {
    singleOf(::PreferencesStore)
    singleOf(::NotificationHelper)
}
```

在 lambda 表达式定义中，使用 `androidContext()` 和 `androidApplication()` 读取它们：`single { PreferencesStore(androidContext()) }`。

| 函数 | 返回值 | 失败情况 |
|----------|---------|------------|
| `androidContext()` | 最近的 `Context`：`Application`，或 Activity 作用域中的 Activity | 启动时未提供 `androidContext()`（`MissingAndroidContextException`） |
| `androidApplication()` | 始终为 `Application` 实例 | 未向 `androidContext()` 提供 `Application` |

两个函数都是来自 `org.koin.android.ext.koin` 的 `get<Context>()` 和 `get<Application>()` 的快捷方式。

### 你会获取到哪个 Context {id="which-context-you-get"}

在 `single` 或从根作用域解析的任何定义中，`Context` 为 `Application`。对于生命周期与应用相同长的对象，这是安全的。

在从 Activity 作用域解析的定义中，`Context` 会优先解析为 Activity，因为该 Activity 是该作用域的来源。具有作用域的 presenter 就是通过这种方式获取 Activity 的。请参阅 [Android 作用域](/docs/reference/koin-android/scope)。

### Activity 上下文 {id="activity-context"}

不要将 `Activity` 声明为 `single` 的依赖项：单例会在 Activity 销毁后仍保持其存活，从而导致 Activity 泄漏。当类需要 Activity（屏幕度量、对话框）时，请在 Activity 中创建它、将 Activity 作为[注入形参](/docs/reference/koin-core/injection-parameters)传递，或在 Activity 作用域中声明它：

```kotlin
class ScreenMetrics(private val activity: Activity) {
    fun screenWidth(): Int = activity.resources.displayMetrics.widthPixels
}

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val metrics = ScreenMetrics(this)
    }
}
```

### 同一 Android 类型的多个实例 {id="several-instances-of-the-same-android-type"}

当两个定义共享相同类型时（例如两个 `SharedPreferences` 文件），使用[限定符](/docs/reference/koin-core/qualifiers)来区分它们：

**编译器插件 DSL**
```kotlin
val preferencesModule = module {
    single(named("settings")) {
        androidContext().getSharedPreferences("settings", Context.MODE_PRIVATE)
    }
    single(named("session")) {
        androidContext().getSharedPreferences("session", Context.MODE_PRIVATE)
    }
}
```

**注解**
```kotlin
@Module
class PreferencesModule {

    @Singleton
    @Named("settings")
    fun settings(context: Context): SharedPreferences =
        context.getSharedPreferences("settings", Context.MODE_PRIVATE)

    @Singleton
    @Named("session")
    fun session(context: Context): SharedPreferences =
        context.getSharedPreferences("session", Context.MODE_PRIVATE)
}
```

**构造函数 / 经典 DSL**
```kotlin
val preferencesModule = module {
    single(named("settings")) {
        androidContext().getSharedPreferences("settings", Context.MODE_PRIVATE)
    }
    single(named("session")) {
        androidContext().getSharedPreferences("session", Context.MODE_PRIVATE)
    }
}
```

## 日志记录 {id="logging"}

`androidLogger()` 将 Koin 日志发送到 Logcat。默认级别为 `Level.INFO`：

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

`Level.DEBUG` 会记录每次解析及其持续时间，这有助于调试缺失的定义。它也会降低解析速度，因此请仅在调试构建中保留它：`androidLogger(if (BuildConfig.DEBUG) Level.DEBUG else Level.ERROR)`。其他日志记录器列在[启动 Koin](/docs/reference/koin-core/starting-koin)中。

## 来自 assets 的属性 {id="properties-from-assets"}

`androidFileProperties()` 从 `src/main/assets` 中的文件加载 Koin 属性。默认文件名为 `koin.properties`：

```kotlin
startKoin {
    androidContext(this@MainApplication)
    androidFileProperties()                  // assets/koin.properties
    // androidFileProperties("app.properties")
    modules(appModule)
}
```

它通过 `Context` 读取文件，因此请在 `androidContext()` 之后调用它。如果文件缺失，Koin 会记录该日志并继续运行。要在定义中读取属性，请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 启动后加载模块 {id="loading-modules-after-start"}

`loadKoinModules()` 和 `unloadKoinModules()` 在应用运行时添加或移除模块。在 Android 上，这适用于仅在少数几个屏幕中使用的功能：

```kotlin
private val premiumModules = lazy { loadKoinModules(premiumModule) }

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        premiumModules.value
        super.onCreate(savedInstanceState)
    }
}
```

- 在 `super.onCreate()` 之前加载：这样系统恢复的 Fragment 就可以找到它们的依赖项。
- 每个进程加载一次：再次加载同一模块将重新注册其定义，记录一条覆盖警告，并且如果 Koin 在 `allowOverride(false)` 下运行则会失败。
- 谨慎卸载：`unloadKoinModules(premiumModule)` 会丢弃模块定义及其实例。仅在不再需要该功能时卸载，切勿在配置变更时卸载；如果稍后再次加载它，请自行跟踪已加载状态。

## 延迟模块 {id="lazy-modules"}

在大型应用中，在 `Application.onCreate()` 中加载每个模块会增加主线程的启动时间。`lazyModules()` 会在后台线程上加载使用 `lazyModule { }` 标记的模块，而首屏所需的模块则使用 `modules()` 加载。配置、等待完成以及限制条件请参阅[延迟模块](/docs/reference/koin-core/lazy-modules)。

## 使用 AndroidX App Startup 启动 {id="start-with-androidx-app-startup"}

[AndroidX App Startup](https://developer.android.com/topic/libraries/app-startup) 在 `Application.onCreate()` 之前通过单个 ContentProvider 运行初始化程序。`io.insert-koin:koin-androidx-startup` 构件将 Koin 作为这些初始化程序之一来启动。在你的 `Application` 中实现 `KoinStartup` 并从 `onKoinStartup()` 返回配置：

**编译器插件 DSL**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.dsl.koinConfiguration

@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }
}
```

**注解**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.plugin.module.dsl.koinConfiguration

@KoinApplication
@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration<MainApplication> {
        androidContext(this@MainApplication)
    }
}
```

**构造函数 / 经典 DSL**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.dsl.koinConfiguration

@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }
}
```

`KoinStartup` 取代了 `onCreate()` 中的 `startKoin` 调用：不要同时调用两者。包名为 `org.koin.androix.startup`（采用此拼写），且该 API 标记为 `@KoinExperimentalAPI`。

如果另一个初始化程序需要 Koin，请让它依赖 `KoinInitializer`。App Startup 本身会创建初始化程序，因此初始化程序是一个入口点：它实现 `KoinComponent` 来检索其依赖项。

```kotlin
class CrashTrackerInitializer : Initializer<Unit>, KoinComponent {

    private val crashTracker: CrashTracker by inject()

    override fun create(context: Context) {
        crashTracker.configure(context)
    }

    override fun dependencies(): List<Class<out Initializer<*>>> =
        listOf(KoinInitializer::class.java)
}
```

:::warning
`KoinStartup` 仍然在应用启动期间运行在主线程上。它不会让 Koin 启动得更快。仅使用它来编排 Koin 与其他 App Startup 初始化程序的顺序。要将模块加载移出主线程，请使用[延迟模块](/docs/reference/koin-core/lazy-modules)。
:::

## 在 Application 类之外启动 Koin {id="starting-koin-outside-the-application-class"}

只要每个进程运行一次且在首次注入之前运行，你就可以从另一个类调用 `startKoin`。请传递 application context，而不是 Activity：

```kotlin
startKoin {
    androidContext(context.applicationContext)
    modules(appModule)
}
```

`startKoin` 会注册一个全局实例。自带 Koin 设置的库或 SDK 不应使用它，因为这会与宿主应用发生冲突：请改用隔离的上下文（请参阅[上下文隔离](/docs/reference/koin-core/context-isolation)）。

## 相关内容 {id="related"}

- [启动 Koin](/docs/reference/koin-core/starting-koin)：各平台上的 `startKoin` 选项、日志记录器和属性。
- [Android 入口点](/docs/reference/koin-android/entry-points)：在 Activity、Fragment、Service 和其他组件中注入。
- [Android 作用域](/docs/reference/koin-android/scope)：将实例绑定到 Activity 或 Fragment 生命周期。
- [模块](/docs/reference/koin-core/modules)：组织定义并使用 `@Configuration` 发现机制。
- [延迟模块](/docs/reference/koin-core/lazy-modules)：在后台加载模块。
- [多模块应用](/docs/reference/koin-android/multi-module)：跨 Gradle 模块组织 Koin 模块。