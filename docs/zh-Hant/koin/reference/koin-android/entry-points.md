---
title: Android 入口點
---

# Android 入口點

Android 會自行建立其組件（Activity、Fragment、Service、BroadcastReceiver），因此 Koin 無法對它們使用建構函式注入。這些類別是入口點：它們向 Koin 請求其相依性，而在它們之下的所有內容均使用建構函式注入。本頁面展示如何在各個 Android 組件中實現這項操作。本篇假設 Koin 已經啟動（請參閱[在 Android 上啟動 Koin](/docs/reference/koin-android/start)），且你的定義已經宣告（請參閱[定義](/docs/reference/koin-core/definitions)）。

無論你使用哪種風格宣告定義，注入程式碼都是相同的。

## 組件一覽 {id="components-at-a-glance"}

| 組件 | 如何注入 | 內建 Koin 擴充函式 |
|-----------|---------------|--------------------------|
| `Application` | `by inject()`，在 `startKoin` 之後 | 是 |
| `Activity` | `by inject()`、`get()`、`by viewModel()` | 是 |
| `Fragment` | `by inject()`、`get()`、`by viewModel()`、`by activityViewModel()` | 是 |
| `Service` | `by inject()`、`get()` | 是 |
| `ContentProvider` | `by inject()`，有時間限制 | 是 |
| `BroadcastReceiver` | 實作 `KoinComponent` | 否 |
| 自訂 `View` | 實作 `KoinComponent`，或將資料傳入 | 否 |

Koin 為每個 Android 的 `ComponentCallbacks` 類別添加了 `inject()` 和 `get()`：`Application`、`Activity`、`Fragment`、`Service` 和 `ContentProvider`。其他由架構建立的類別（receiver、從 XML 擴展的 View）則實作 [`KoinComponent`](/docs/reference/koin-core/koin-component) 來取得相同的功能。你自己定義的類別（repository、use case、ViewModel）則絕不需要這樣做：它們透過建構函式接收相依性。

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

`by viewModel()` 與 `by inject()` 不同：它會透過 Android 的 `ViewModelStore` 處理，因此執行個體能夠在螢幕旋轉時保留。請為所有的 ViewModel 使用此方式。請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)。

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

`by viewModel()` 會提供由該 Fragment 所擁有的 ViewModel。`by activityViewModel()` 則會提供由宿主 Activity 所擁有的 ViewModel，並與該 Activity 及其其他 Fragment 共享。

若要改用建構函式注入來建立 Fragment，請參閱 [Fragment Factory](/docs/reference/koin-android/fragment-factory)。

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

Service 的存活時間可能很長。請在 `onDestroy()` 中釋放其所持有的資源。對於生命週期應與 Service 完全相同的執行個體，請繼承 `ScopeService`（請參閱 [Android 作用域](/docs/reference/koin-android/scope#service-scope)）。對於延遲的背景工作，建議優先使用 [WorkManager](/docs/reference/koin-android/workmanager)，它支援在 Worker 中使用建構函式注入。

## BroadcastReceiver {id="broadcastreceiver"}

Android 會自行建立 receiver（使用無參數建構函式），且 `BroadcastReceiver` 沒有提供 Koin 擴充函式。實作 `KoinComponent` 可使其成為入口點：

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

無論是在資訊清單（manifest）中宣告的 receiver，還是在執行階段註冊的 receiver，Koin 在 `onReceive()` 中都已就緒：Android 在傳遞廣播之前，會先建立 `Application` 並執行 `startKoin`。

`onReceive()` 在主執行緒上執行，且在系統判定該 receiver 阻塞之前大約有 10 秒的時間。請保持其簡短，並將耗時的工作交給 WorkManager：

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

這假設在你的模組中已有 `WorkManager` 定義，例如 `single { WorkManager.getInstance(androidContext()) }`。

## ContentProvider {id="contentprovider"}

`ContentProvider` 擁有 Koin 擴充函式，但 Android 會在 `Application.onCreate()` 之前建立它。此時 `startKoin` 尚未執行。

```kotlin
class UserContentProvider : ContentProvider() {

    private val repository: UserRepository by inject()

    override fun onCreate(): Boolean {
        // Koin 尚未啟動：請勿在此處存取 repository
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

`by inject()` 是延遲載入的，因此該執行個體會在 `Application.onCreate()` 之後的第一次 `query()` 呼叫時被解析。若在 `onCreate()` 中呼叫 `get()` 或讀取 `repository`，會失敗並顯示「KoinApplication has not been started」。

如果該 provider 在其自身的 `onCreate()` 中就需要 Koin，則 Koin 必須在此之前啟動。請在該處啟動 Koin（設置防護以確保僅執行一次），並從你的 `Application` 中移除 `startKoin`：

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
在同一個處理程序中呼叫兩次 `startKoin` 會失敗並擲出 `KoinApplicationAlreadyStartedException`。如果你是從 ContentProvider 啟動 Koin，則 `Application` 類別絕不能再次啟動它。
:::

## 自訂 View {id="custom-view"}

View 應該用於顯示資料，而不是擷取資料。大多數 View 不需要注入：由 Activity 或 Fragment 注入 ViewModel 並將資料傳遞給 View。

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

當從 XML 擴展的 View 需要共享的幫助程式（如渲染器、圖片載入器）時，Android 會呼叫其建構函式，因此 Koin 無法直接將該幫助程式傳入。請實作 `KoinComponent`：

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

在 Android Studio 的版面配置預覽中，Koin 並未啟動。當 `isInEditMode` 為 true 時，請勿解析相依性。

## Application 類別 {id="application-class"}

`Application` 類別也擁有 Koin 擴充函式。請在 `startKoin` 之後使用它們：

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

## 延遲解析或立即解析 {id="lazy-or-eager"}

```kotlin
class UserActivity : AppCompatActivity() {

    // 延遲解析：首次存取時才解析
    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 立即解析：此時立即解析
        val analytics: Analytics = get()
    }
}
```

| 函式 | 解析時機 | 適用情境 |
|----------|----------|------------|
| `by inject()` | 首次存取該屬性時 | 屬性：在存取之前不會建立任何內容 |
| `get()` | 呼叫時 | 函式內部的區域值 |

在屬性初始設定式中使用 `get()` 會在 Android 建構 Activity 或 Fragment 時（即 `onCreate()` 之前）執行，而且即使畫面從未使用它，也會建立該執行個體。對於屬性，建議優先使用 `by inject()`。延遲委託預設為安全執行緒（`LazyThreadSafetyMode.SYNCHRONIZED`）；當該屬性僅在主執行緒上讀取時，可傳入 `inject(mode = LazyThreadSafetyMode.NONE)`。

有關 `inject()` 和 `get()` 在各平台上的運作方式，請參閱[注入](/docs/reference/koin-core/injection)。

## 呼叫點的參數與限定詞 {id="parameters-and-qualifiers-at-the-call-site"}

這兩個函式都接受[限定詞](/docs/reference/koin-core/qualifiers)和[注入參數](/docs/reference/koin-core/injection-parameters)：

```kotlin
class UserDetailActivity : AppCompatActivity() {

    private val userId: String by lazy { intent.getStringExtra("USER_ID").orEmpty() }

    private val presenter: UserDetailPresenter by inject { parametersOf(userId) }
    private val localDatabase: Database by inject(named("local"))
}
```

參數 Lambda 會在首次讀取該屬性時執行。在該處讀取 `intent` 是安全的，因為它發生在 `onCreate()` 之後。

## 相關內容 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel)：`by viewModel()`、`activityViewModel()` 以及導覽圖 ViewModel。
- [Android 作用域](/docs/reference/koin-android/scope)：繫結至 Activity、Fragment 或 Service 的執行個體。
- [注入](/docs/reference/koin-core/injection)：所有平台上的 `inject()`、`get()`、可為 null 和延遲注入。
- [KoinComponent](/docs/reference/koin-core/koin-component)：何時以及如何在 Android 組件之外使用它。
- [WorkManager](/docs/reference/koin-android/workmanager)：Worker 中的建構函式注入。