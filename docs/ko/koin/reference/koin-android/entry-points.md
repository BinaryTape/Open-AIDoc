---
title: Android 진입점
---

# Android 진입점

Android는 컴포넌트(Activity, Fragment, Service, BroadcastReceiver)를 직접 생성하므로, Koin이 이 컴포넌트들에 생성자 주입(constructor injection)을 사용할 수 없습니다. 이러한 클래스들은 진입점(entry points) 역할을 합니다. 즉, 이들이 Koin에 필요한 의존성을 요청하면 그 하위의 모든 항목은 생성자 주입을 사용하게 됩니다. 이 페이지에서는 각 Android 컴포넌트에서 이를 수행하는 방법을 설명합니다. Koin이 이미 시작되었고([Android에서 Koin 시작하기](/docs/reference/koin-android/start) 참조) 정의(definition)가 선언되어 있다고([Definitions](/docs/reference/koin-core/definitions) 참조) 가정합니다.

주입 코드는 정의를 선언할 때 어떤 스타일을 사용하든 동일합니다.

## 컴포넌트 한눈에 보기 {id="components-at-a-glance"}

| 컴포넌트 | 주입 방법 | 내장 Koin 확장 기능 제공 여부 |
|-----------|---------------|--------------------------|
| `Application` | `startKoin` 이후 `by inject()` | 예 |
| `Activity` | `by inject()`, `get()`, `by viewModel()` | 예 |
| `Fragment` | `by inject()`, `get()`, `by viewModel()`, `by activityViewModel()` | 예 |
| `Service` | `by inject()`, `get()` | 예 |
| `ContentProvider` | `by inject()`, 타이밍 제약 있음 | 예 |
| `BroadcastReceiver` | `KoinComponent` 구현 | 아니요 |
| 커스텀 `View` | `KoinComponent` 구현, 또는 외부에서 데이터 전달 | 아니요 |

Koin은 모든 Android `ComponentCallbacks` 클래스(`Application`, `Activity`, `Fragment`, `Service`, `ContentProvider`)에 `inject()`와 `get()`을 추가합니다. 프레임워크가 생성하는 다른 클래스(리시버, XML로부터 인플레이트된 View)는 동일한 함수를 사용하기 위해 [`KoinComponent`](/docs/reference/koin-core/koin-component)를 구현합니다. 직접 작성한 클래스(리포지토리, 유스케이스, ViewModel)는 이를 구현할 필요가 없으며, 항상 생성자를 통해 의존성을 전달받습니다.

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

`by viewModel()`은 `by inject()`와 다릅니다. Android `ViewModelStore`를 거치기 때문에 화면 회전 시에도 인스턴스가 유지됩니다. 모든 ViewModel에는 이 방식을 사용하세요. 자세한 내용은 [Android ViewModel](/docs/reference/koin-android/viewmodel)을 참조하세요.

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

`by viewModel()`은 Fragment가 소유하는 ViewModel을 제공합니다. `by activityViewModel()`은 호스트 Activity가 소유하며, 해당 Activity 및 그 하위의 다른 Fragment들과 공유되는 ViewModel을 제공합니다.

생성자 주입을 사용하여 Fragment를 생성하려면 [Fragment Factory](/docs/reference/koin-android/fragment-factory)를 참조하세요.

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

Service는 오랫동안 유지될 수 있습니다. `onDestroy()`에서 보유하고 있는 리소스를 해제하세요. Service의 수명 주기와 정확히 일치해야 하는 인스턴스의 경우 `ScopeService`를 상속하세요([Android Scopes](/docs/reference/koin-android/scope#service-scope) 참조). 지연된 백그라운드 작업의 경우에는 Worker에서 생성자 주입을 지원하는 [WorkManager](/docs/reference/koin-android/workmanager)를 사용하는 것이 좋습니다.

## BroadcastReceiver {id="broadcastreceiver"}

Android는 빈 생성자를 사용하여 리시버를 직접 생성하며, `BroadcastReceiver`에는 Koin 확장 기능이 없습니다. 진입점으로 만들기 위해 `KoinComponent`를 구현하세요:

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

매니페스트에 선언된 리시버와 런타임에 등록된 리시버 모두 `onReceive()` 시점에 Koin이 준비되어 있습니다. Android는 브로드캐스트를 전달하기 전에 `Application`을 생성하고 `startKoin`을 실행하기 때문입니다.

`onReceive()`는 메인 스레드에서 실행되며, 시스템이 리시버 차단(ANR)으로 간주하기 전까지 약 10초의 시간이 주어집니다. 작업을 짧게 유지하고, 오래 걸리는 작업은 WorkManager에 위임하세요:

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

이 코드는 모듈에 `single { WorkManager.getInstance(androidContext()) }`와 같은 `WorkManager` 정의가 등록되어 있다고 가정합니다.

## ContentProvider {id="contentprovider"}

`ContentProvider`에는 Koin 확장 기능이 있지만, Android는 `Application.onCreate()`보다 먼저 이를 생성합니다. 이 시점에는 아직 `startKoin`이 실행되지 않았습니다.

```kotlin
class UserContentProvider : ContentProvider() {

    private val repository: UserRepository by inject()

    override fun onCreate(): Boolean {
        // 아직 Koin이 시작되지 않았으므로 여기서 repository에 접근하지 마세요.
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

`by inject()`는 지연(lazy) 초기화되므로 `Application.onCreate()` 이후인 첫 번째 `query()` 호출 시 인스턴스가 확인(resolve)됩니다. `onCreate()`에서 `get()`을 호출하거나 `repository`를 읽으려고 하면 "KoinApplication has not been started" 오류와 함께 실패합니다.

ContentProvider 자체의 `onCreate()`에서 Koin이 필요하다면, Koin이 그보다 먼저 시작되어야 합니다. 한 번만 실행되도록 보호 조치를 취한 후 해당 위치에서 Koin을 시작하고, `Application`에서 `startKoin`을 제거하세요:

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
동일한 프로세스에서 `startKoin`을 두 번 호출하면 `KoinApplicationAlreadyStartedException`과 함께 실패합니다. ContentProvider에서 Koin을 시작하는 경우, `Application` 클래스에서 다시 시작해서는 안 됩니다.
:::

## 커스텀 View {id="custom-view"}

View는 데이터를 가져오는 것이 아니라 표시하는 역할을 해야 합니다. 대부분의 View에는 주입이 필요하지 않습니다. Activity나 Fragment가 ViewModel을 주입받아 View에 데이터를 전달합니다.

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

XML에서 인플레이트된 View에 공유 헬퍼(렌더러, 이미지 로더 등)가 필요한 경우, Android가 View의 생성자를 호출하므로 Koin이 헬퍼를 직접 주입해 줄 수 없습니다. 이때는 `KoinComponent`를 구현하세요:

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

Android Studio 레이아웃 미리보기에서는 Koin이 시작되지 않습니다. `isInEditMode`가 `true`일 때는 의존성을 확인하지 마세요.

## Application 클래스 {id="application-class"}

`Application` 클래스에도 Koin 확장 기능이 있습니다. `startKoin` 이후에 사용하세요:

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

## 지연(lazy) 주입과 즉시(eager) 주입 {id="lazy-or-eager"}

```kotlin
class UserActivity : AppCompatActivity() {

    // 지연(lazy): 처음 접근할 때 확인됨
    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 즉시(eager): 지금 바로 확인됨
        val analytics: Analytics = get()
    }
}
```

| 함수 | 인스턴스 확인 시점 | 주 사용 대상 |
|----------|----------|------------|
| `by inject()` | 프로퍼티에 처음 접근할 때 | 프로퍼티: 실제로 사용하기 전까지는 아무것도 생성되지 않음 |
| `get()` | 호출될 때 | 함수 내부의 로컬 변수 |

프로퍼티 초기화 식에서 `get()`을 사용하면 Android가 Activity 또는 Fragment를 생성할 때(`onCreate()` 이전) 실행되며, 화면에서 해당 인스턴스를 전혀 사용하지 않더라도 인스턴스가 생성됩니다. 프로퍼티에는 `by inject()`를 사용하는 것이 좋습니다. 지연 위임 프로퍼티는 기본적으로 스레드 안전(thread-safe)합니다(`LazyThreadSafetyMode.SYNCHRONIZED`). 프로퍼티를 메인 스레드에서만 읽는다면 `inject(mode = LazyThreadSafetyMode.NONE)`을 전달할 수 있습니다.

모든 플랫폼에서 `inject()`와 `get()`이 동작하는 방식은 [Injection](/docs/reference/koin-core/injection)에 설명되어 있습니다.

## 호출부에서의 파라미터 및 한정자(qualifier) {id="parameters-and-qualifiers-at-the-call-site"}

두 함수 모두 [한정자(qualifier)](/docs/reference/koin-core/qualifiers)와 [주입 파라미터(injected parameters)](/docs/reference/koin-core/injection-parameters)를 전달받을 수 있습니다:

```kotlin
class UserDetailActivity : AppCompatActivity() {

    private val userId: String by lazy { intent.getStringExtra("USER_ID").orEmpty() }

    private val presenter: UserDetailPresenter by inject { parametersOf(userId) }
    private val localDatabase: Database by inject(named("local"))
}
```

파라미터 람다는 프로퍼티를 처음 읽을 때 실행됩니다. 이는 `onCreate()` 이후에 발생하므로 그 안에서 `intent`를 읽어도 안전합니다.

## 관련 내용 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel): `by viewModel()`, `activityViewModel()` 및 내비게이션 그래프 ViewModel.
- [Android Scopes](/docs/reference/koin-android/scope): Activity, Fragment 또는 Service에 바인딩된 인스턴스.
- [Injection](/docs/reference/koin-core/injection): 모든 플랫폼에서의 `inject()`, `get()`, nullable 및 지연(lazy) 주입.
- [KoinComponent](/docs/reference/koin-core/koin-component): Android 컴포넌트 외부에서 사용하는 시기와 방법.
- [WorkManager](/docs/reference/koin-android/workmanager): Worker에서의 생성자 주입.