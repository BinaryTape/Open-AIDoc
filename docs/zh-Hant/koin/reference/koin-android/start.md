---
title: 在 Android 上啟動 Koin
---

# 在 Android 上啟動 Koin

本頁面說明如何在 Android 應用程式中啟動 Koin：包括 `Application` 類別、Android `Context`、Logcat 記錄器、來自 assets 的屬性、啟動後載入模組，以及 AndroidX App Startup。本文假設您的組建中已包含 `io.insert-koin:koin-android` 相依項（請參閱 [Gradle 設定](/docs/setup/gradle)）。關於 `startKoin` 在各平台上的具體行為，請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 在 Application 類別中啟動 Koin {id="start-koin-in-your-application-class"}

在 `Application.onCreate()` 中啟動一次 Koin：

**編譯器外掛程式 DSL**
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

`appModule` 是一個使用編譯器外掛程式 DSL 所宣告的 `module { }`（如 `single<UserRepository>()`、`viewModel<UserViewModel>()`）。

**註解**
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

`startKoin<MainApplication>()` 會載入所有標記有 `@Configuration` 的 `@Module` 類別。您不需要自行列出模組。若要明確挑選模組，請使用 `@KoinApplication(modules = [AppModule::class])`。模組探索機制的詳細說明請參閱[模組](/docs/reference/koin-core/modules)。

**建構函式 / 傳統 DSL**
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

請在 `AndroidManifest.xml` 的 `<application>` 標籤中透過 `android:name=".MainApplication"` 註冊該類別，否則 Android 永遠不會執行它。

`androidContext()` 會將 `Application` 執行個體新增至 Koin，並同時繫結至 `Application` 與 `Context`。請在任何需要 `Context` 的選項之前呼叫它，例如 `androidFileProperties()` 或 `workManagerFactory()`。

## 定義中的 Android Context {id="android-context-in-definitions"}

需要 `Context` 的類別可以直接在其建構函式中宣告它。不需要任何限定詞：Koin 會將 `Context` 解析為傳遞給 `androidContext()` 的執行個體。

**編譯器外掛程式 DSL**
```kotlin
class PreferencesStore(private val context: Context)
class NotificationHelper(private val application: Application)

val androidModule = module {
    single<PreferencesStore>()
    single<NotificationHelper>()
}
```

**註解**
```kotlin
@Singleton
class PreferencesStore(private val context: Context)

@Singleton
class NotificationHelper(private val application: Application)
```

**建構函式 / 傳統 DSL**
```kotlin
val androidModule = module {
    singleOf(::PreferencesStore)
    singleOf(::NotificationHelper)
}
```

在 Lambda 定義中，可以使用 `androidContext()` 和 `androidApplication()` 來讀取它們：`single { PreferencesStore(androidContext()) }`。

| 函式 | 傳回值 | 失敗情況 |
|----------|---------|------------|
| `androidContext()` | 最接近的 `Context`：在 Activity 作用域中為 `Application` 或 Activity | 啟動時未提供 `androidContext()`（`MissingAndroidContextException`） |
| `androidApplication()` | 一律為 `Application` 執行個體 | 未將 `Application` 傳遞給 `androidContext()` |

這兩個函式都是 `org.koin.android.ext.koin` 中 `get<Context>()` 和 `get<Application>()` 的捷徑。

### 您取得的是哪一個 Context {id="which-context-you-get"}

在 `single` 或任何從根作用域解析的定義中，`Context` 即為 `Application`。對於生命週期與應用程式相同的物件而言，這是安全的做法。

在從 Activity 作用域解析的定義中，`Context` 會優先解析為 Activity，因為 Activity 是該作用域的來源。這是有作用域限制的 Presenter 取得 Activity 的方式。請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

### Activity Context {id="activity-context"}

切勿將 `Activity` 宣告為 `single` 的相依項：單例會在 Activity 被銷毀後仍然持有它，從而導致 Activity 洩漏。當某個類別需要 Activity 時（例如螢幕指標、對話方塊），請在 Activity 中建立它、將 Activity 作為[注入參數](/docs/reference/koin-core/injection-parameters)傳入，或將其宣告在 Activity 作用域內：

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

### 同一 Android 型別的多個執行個體 {id="several-instances-of-the-same-android-type"}

當兩個定義共用同一型別時（例如兩個 `SharedPreferences` 檔案），可以使用[限定詞](/docs/reference/koin-core/qualifiers)來區分它們：

**編譯器外掛程式 DSL**
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

**註解**
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

**建構函式 / 傳統 DSL**
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

## 記錄日誌 {id="logging"}

`androidLogger()` 會將 Koin 的日誌輸出至 Logcat。預設層級為 `Level.INFO`：

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

`Level.DEBUG` 會記錄每一次的解析及其耗時，這在偵錯缺少定義的問題時非常有用。但它也會降低解析速度，因此建議僅在偵錯組建中開啟：`androidLogger(if (BuildConfig.DEBUG) Level.DEBUG else Level.ERROR)`。其他記錄器已列於[啟動 Koin](/docs/reference/koin-core/starting-koin) 中。

## 來自 assets 的屬性 {id="properties-from-assets"}

`androidFileProperties()` 會從 `src/main/assets` 中的檔案載入 Koin 屬性。預設檔案名稱為 `koin.properties`：

```kotlin
startKoin {
    androidContext(this@MainApplication)
    androidFileProperties()                  // assets/koin.properties
    // androidFileProperties("app.properties")
    modules(appModule)
}
```

它是透過 `Context` 讀取該檔案，因此必須在 `androidContext()` 之後呼叫它。如果檔案不存在，Koin 會記錄此情況並繼續執行。若要在定義中讀取屬性，請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 啟動後載入模組 {id="loading-modules-after-start"}

`loadKoinModules()` 和 `unloadKoinModules()` 可以在應用程式執行時新增或移除模組。在 Android 上，這非常適合僅在少數畫面上使用的功能：

```kotlin
private val premiumModules = lazy { loadKoinModules(premiumModule) }

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        premiumModules.value
        super.onCreate(savedInstanceState)
    }
}
```

- 在 `super.onCreate()` 之前載入：讓由系統還原的 Fragment 能找到其相依項。
- 每個處理程序僅載入一次：重複載入同一個模組會重新註冊其定義、記錄覆寫警告，且如果 Koin 以 `allowOverride(false)` 執行，則會導致失敗。
- 謹慎解除載入：`unloadKoinModules(premiumModule)` 會捨棄該模組定義及其執行個體。僅在不再需要該功能時解除載入，切勿在組態變更（configuration change）時解除載入；如果稍後會再次載入，請自行追蹤載入狀態。

## 延遲模組 {id="lazy-modules"}

在大型應用程式中，於 `Application.onCreate()` 中載入所有模組會增加主執行緒上的啟動時間。`lazyModules()` 會在背景執行緒上載入使用 `lazyModule { }` 標記的模組，而首個畫面所需的模組則透過 `modules()` 載入。設定方式、等待完成以及限制等內容請參閱[延遲模組](/docs/reference/koin-core/lazy-modules)。

## 使用 AndroidX App Startup 啟動 {id="start-with-androidx-app-startup"}

[AndroidX App Startup](https://developer.android.com/topic/libraries/app-startup) 會在 `Application.onCreate()` 之前，從單一 ContentProvider 執行初始設定式。`io.insert-koin:koin-androidx-startup` 成品可將 Koin 作為其中一個初始設定式來啟動。請在您的 `Application` 中實作 `KoinStartup`，並從 `onKoinStartup()` 傳回設定：

**編譯器外掛程式 DSL**
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

**註解**
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

**建構函式 / 傳統 DSL**
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

`KoinStartup` 取代了 `onCreate()` 中的 `startKoin` 呼叫：請勿同時呼叫兩者。套件名稱為 `org.koin.androix.startup`（此為正確拼法），且該 API 標記為 `@KoinExperimentalAPI`。

如果其他初始設定式需要 Koin，請將其設為相依於 `KoinInitializer`。App Startup 會自行建立初始設定式，因此初始設定式是一個進入點：它需實作 `KoinComponent` 來擷取其相依項。

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
`KoinStartup` 仍然是在應用程式啟動期間於主執行緒上執行。它不會讓 Koin 啟動得更快。僅在需要協調 Koin 與其他 App Startup 初始設定式的執行順序時使用它。若要將模組載入移出主執行緒，請使用[延遲模組](/docs/reference/koin-core/lazy-modules)。
:::

## 在 Application 類別之外啟動 Koin {id="starting-koin-outside-the-application-class"}

您也可以從其他類別呼叫 `startKoin`，前提是它在每個處理程序中僅執行一次，且在第一次注入之前執行。請傳入 Application Context，而非 Activity：

```kotlin
startKoin {
    androidContext(context.applicationContext)
    modules(appModule)
}
```

`startKoin` 會註冊一個全域執行個體。自帶 Koin 設定的程式庫或 SDK 不應使用它，因為這會與宿主應用程式產生衝突：此時應改用隔離的 Context（請參閱 [Context 隔離](/docs/reference/koin-core/context-isolation)）。

## 相關內容 {id="related"}

- [啟動 Koin](/docs/reference/koin-core/starting-koin)：各平台上的 `startKoin` 選項、記錄器與屬性。
- [Android 進入點](/docs/reference/koin-android/entry-points)：在 Activity、Fragment、Service 和其他元件中進行注入。
- [Android 作用域](/docs/reference/koin-android/scope)：將執行個體繫結至 Activity 或 Fragment 生命週期。
- [模組](/docs/reference/koin-core/modules)：組織定義並使用 `@Configuration` 探索機制。
- [延遲模組](/docs/reference/koin-core/lazy-modules)：在背景載入模組。
- [多模組應用程式](/docs/reference/koin-android/multi-module)：跨 Gradle 模組組織 Koin 模組。