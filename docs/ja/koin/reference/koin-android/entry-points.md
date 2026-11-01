---
title: Android エントリーポイント
---

# Android エントリーポイント

Android はそのコンポーネント（Activity、Fragment、Service、BroadcastReceiver）を自身で生成するため、Koin はそれらに対してコンストラクタインジェクションを使用できません。これらのクラスはエントリーポイント（Entry Point）となります。つまり、自身で Koin に依存関係を要求し、その配下にあるすべてのものはコンストラクタインジェクションを使用します。このページでは、各 Android コンポーネントでこれを行う方法を説明します。Koin が起動済みであり（[Android での Koin の開始](/docs/reference/koin-android/start) を参照）、定義が宣言されている（[定義](/docs/reference/koin-core/definitions) を参照）ことを前提としています。

定義を宣言する際にどのスタイルを使用しても、インジェクションのコードは同じです。

## コンポーネント一覧 {id="components-at-a-glance"}

| コンポーネント | インジェクション方法 | 組み込みの Koin 拡張機能 |
|---|---|---|
| `Application` | `startKoin` 後に `by inject()` | あり |
| `Activity` | `by inject()`、`get()`、`by viewModel()` | あり |
| `Fragment` | `by inject()`、`get()`、`by viewModel()`、`by activityViewModel()` | あり |
| `Service` | `by inject()`、`get()` | あり |
| `ContentProvider` | タイミングの制限付きで `by inject()` | あり |
| `BroadcastReceiver` | `KoinComponent` を実装 | なし |
| カスタム `View` | `KoinComponent` を実装、またはデータを渡す | なし |

Koin は、Android のすべての `ComponentCallbacks` クラス（`Application`、`Activity`、`Fragment`、`Service`、`ContentProvider`）に `inject()` と `get()` を追加します。フレームワークによって生成されるその他のクラス（レシーバー、XML からインフレートされた View）は、[`KoinComponent`](/docs/reference/koin-core/koin-component) を実装することで同じ関数を取得します。自身で作成したクラス（リポジトリ、ユースケース、ViewModel）でこれを実装することは決してありません。それらはコンストラクタを通じて依存関係を受け取ります。

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

`by viewModel()` は `by inject()` と同じではありません。Android の `ViewModelStore` を経由するため、インスタンスは画面回転（Configuration changes）を生き残ります。すべての ViewModel にこれを使用してください。[Android ViewModel](/docs/reference/koin-android/viewmodel) を参照してください。

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

`by viewModel()` は Fragment が所有する ViewModel を提供します。`by activityViewModel()` はホスト Activity が所有する ViewModel を提供し、Activity およびその配下の他の Fragment と共有されます。

代わりにコンストラクタインジェクションを使用して Fragment を生成する方法については、[Fragment Factory](/docs/reference/koin-android/fragment-factory) を参照してください。

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

Service は長期間生存する可能性があります。Service が保持しているものは `onDestroy()` で解放してください。Service と全く同じ期間生存させるべきインスタンスについては、`ScopeService` を継承してください（[Android スコープ](/docs/reference/koin-android/scope#service-scope) を参照）。遅延バックグラウンド処理には、Worker 内でコンストラクタインジェクションをサポートしている [WorkManager](/docs/reference/koin-android/workmanager) の使用をお勧めします。

## BroadcastReceiver {id="broadcastreceiver"}

Android は空のコンストラクタを使用してレシーバー自体を生成し、`BroadcastReceiver` には Koin 拡張機能がありません。エントリーポイントにするには `KoinComponent` を実装します：

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

マニフェストで宣言されたレシーバーでも、実行時に登録されたレシーバーでも、`onReceive()` 内で Koin は準備完了状態になっています。Android はブロードキャストを配信する前に `Application` を生成し、`startKoin` を実行するためです。

`onReceive()` はメインスレッドで実行され、システムがレシーバーのブロック（応答停止）とみなすまでに約 10 秒の猶予があります。処理は短く抑え、長時間の処理は WorkManager に渡してください：

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

これは、モジュール内に例えば `single { WorkManager.getInstance(androidContext()) }` のような `WorkManager` 定義があることを前提としています。

## ContentProvider {id="contentprovider"}

`ContentProvider` には Koin 拡張機能がありますが、Android はそれを `Application.onCreate()` の前に生成します。その時点ではまだ `startKoin` が実行されていません。

```kotlin
class UserContentProvider : ContentProvider() {

    private val repository: UserRepository by inject()

    override fun onCreate(): Boolean {
        // Koin はまだ開始されていません：ここでは repository にアクセスしないでください
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

`by inject()` は遅延初期化（lazy）されるため、インスタンスは `Application.onCreate()` の後、最初の `query()` で解決されます。`onCreate()` 内で `get()` を呼び出したり `repository` を読み取ったりすると、「KoinApplication has not been started」というエラーで失敗します。

プロバイダ自身の `onCreate()` 内で Koin を必要とする場合は、それより前に Koin を開始する必要があります。1 回だけ実行されるようにガードした上でそこで Koin を開始し、`Application` からは `startKoin` を削除してください：

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
同一プロセス内で `startKoin` を 2 回呼び出すと、`KoinApplicationAlreadyStartedException` で失敗します。ContentProvider から Koin を開始した場合、`Application` クラスで再度開始してはなりません。
:::

## カスタム View {id="custom-view"}

View はデータを取得するのではなく、表示するべきです。ほとんどの View にインジェクションは不要です。Activity や Fragment が ViewModel をインジェクトし、そのデータを View に渡します。

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

XML からインフレートされた View が共有ヘルパー（レンダラー、画像ローダーなど）を必要とする場合、Android がそのコンストラクタを呼び出すため、Koin はそのヘルパーを渡すことができません。その場合は `KoinComponent` を実装します：

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

Android Studio のレイアウトプレビュー内では Koin は開始されません。`isInEditMode` が true のときは依存関係を解決しないでください。

## Application クラス {id="application-class"}

`Application` クラスにも Koin 拡張機能があります。`startKoin` の後に使用してください：

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

## 遅延（Lazy）か即時（Eager）か {id="lazy-or-eager"}

```kotlin
class UserActivity : AppCompatActivity() {

    // lazy: 初回アクセス時に解決
    private val presenter: UserPresenter by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // eager: この時点で解決
        val analytics: Analytics = get()
    }
}
```

| 関数 | 解決タイミング | 用途 |
|---|---|---|
| `by inject()` | プロパティへの初回アクセス時 | プロパティ：使用するまで何も生成されません |
| `get()` | 呼び出し時 | 関数内のローカル変数 |

プロパティの初期化子内での `get()` は、Android が Activity や Fragment を構築する際、`onCreate()` の前に実行され、画面でそれがまったく使用されない場合でもインスタンスを生成してしまいます。プロパティには `by inject()` を推奨します。lazy デリゲートはデフォルトでスレッドセーフ（`LazyThreadSafetyMode.SYNCHRONIZED`）です。プロパティがメインスレッドでのみ読み取られる場合は、`inject(mode = LazyThreadSafetyMode.NONE)` を渡してください。

あらゆるプラットフォームで `inject()` と `get()` がどのように動作するかについては、[インジェクション](/docs/reference/koin-core/injection) で説明されています。

## 呼び出し側でのパラメータと修飾子（Qualifiers） {id="parameters-and-qualifiers-at-the-call-site"}

どちらの関数も [修飾子（Qualifier）](/docs/reference/koin-core/qualifiers) と [インジェクションパラメータ](/docs/reference/koin-core/injection-parameters) を受け取ることができます：

```kotlin
class UserDetailActivity : AppCompatActivity() {

    private val userId: String by lazy { intent.getStringExtra("USER_ID").orEmpty() }

    private val presenter: UserDetailPresenter by inject { parametersOf(userId) }
    private val localDatabase: Database by inject(named("local"))
}
```

パラメータのラムダは、プロパティが最初に読み取られたときに実行されます。これは `onCreate()` の後に発生するため、そこで `intent` を読み取るのは安全です。

## 関連情報 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel)：`by viewModel()`、`activityViewModel()`、およびナビゲーショングラフ ViewModel。
- [Android スコープ](/docs/reference/koin-android/scope)：Activity、Fragment、Service にバインドされたインスタンス。
- [インジェクション](/docs/reference/koin-core/injection)：すべてのプラットフォームでの `inject()`、`get()`、nullable および遅延インジェクション。
- [KoinComponent](/docs/reference/koin-core/koin-component)：Android コンポーネント以外でいつ、どのように使用するか。
- [WorkManager](/docs/reference/koin-android/workmanager)：Worker におけるコンストラクタインジェクション。