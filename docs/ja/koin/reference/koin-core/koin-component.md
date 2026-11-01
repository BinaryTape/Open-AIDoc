---
title: KoinComponent
---

# KoinComponent

`KoinComponent` は、クラスが Koin コンテナにアクセスできるようにし、`get()` や `by inject()` を呼び出せるようにするためのインターフェースです。このページでは、いつそれが必要になるか、どのように使用するか、そしてなぜコンストラクタインジェクションが推奨されるのかについて説明します。インスタンス取得関数自体については、[Injection](/docs/reference/koin-core/injection) を参照してください。

## KoinComponent を使用するタイミング {id="when-to-use-koincomponent"}

Koin によって生成されず、かつ独自の Koin 拡張機能を持たないクラスには `KoinComponent` を使用します。

- エントリーポイント：`main()` クラス、CLI コマンド、フレームワークやリフレクションによって作成されるクラス。
- Koin 拡張を持たない Android クラス：`BroadcastReceiver`、`ContentProvider`、カスタム `View`。[Android Entry Points](/docs/reference/koin-android/entry-points) を参照してください。
- コンストラクタを直接制御できないコールバックやリスナー。
- まだコンストラクタインジェクションに移行できないレガシーコード。

次のようなものには不要です：

- モジュールで宣言されているクラス：リポジトリ、サービス、ユースケース、ViewModel。Koin がそれらの依存関係をコンストラクタ経由で渡します。
- `Activity`、`Fragment`、`Service`：Koin Android がこれらに対して直接 `by inject()` や `by viewModel()` を提供します。
- Composable：`koinInject()` を使用してください。[Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。

## KoinComponent の使用方法 {id="use-koincomponent"}

インターフェースを実装し、`get()` または `by inject()` を呼び出します。

```kotlin
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import org.koin.core.component.inject

class SyncCommand : KoinComponent {

    // 遅延（lazy）：初回アクセス時に解決
    private val syncService: SyncService by inject()

    // 即時（eager）：SyncCommand の作成時に解決
    private val logger: Logger = get()

    fun run() {
        logger.info("Starting sync")
        syncService.sync()
    }
}

fun main() {
    startKoin {
        modules(appModule)
    }
    SyncCommand().run()
}
```

コードの書き方はどのスタイルでも同じです。`KoinComponent` はインスタンスを取得するだけなので、定義はどのスタイルで宣言されていても構いません。

`get()` と `inject()` は拡張関数です。`org.koin.core.component` からインポートしてください。他のすべての取得関数と同様に、これらは修飾子（qualifier）とパラメータブロックを受け取ることができます（[Injection](/docs/reference/koin-core/injection#qualifiers-and-parameters-at-the-call-site) を参照）。

`KoinComponent` 自体には、`Koin` インスタンスを返す関数 `getKoin()` が 1 つあります。その他のすべての操作にはこれを使用します：

```kotlin
class FeatureLoader : KoinComponent {

    fun optionalTracker(): Tracker? = getKoin().getOrNull()

    fun apiUrl(): String = getKoin().getProperty("server_url", "https://api.example.com")

    fun allPlugins(): List<Plugin> = getKoin().getAll()
}
```

Null 許容の取得と `getAll()` については [Injection](/docs/reference/koin-core/injection) で解説しています。プロパティについては [Starting Koin](/docs/reference/koin-core/starting-koin#properties) で解説しています。

### カスタム Android View {id="custom-android-view"}

カスタム `View` はレイアウトインフレーターによって生成されるため、Koin からコンストラクタパラメータを渡すことができません。このような場合に `KoinComponent` が適しています：

```kotlin
class ChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs), KoinComponent {

    private val formatter: ChartFormatter by inject()

    fun setData(points: List<DataPoint>) {
        val formatted = formatter.format(points)
        // 描画処理
    }
}
```

`View` では `by inject()` を使用してください。レイアウトエディタは Koin コンテナが実行されていない状態で View を生成するため、即時解決の `get()` を使うと失敗してしまいます。

## KoinComponent が使用するコンテナ {id="which-container-koincomponent-uses"}

デフォルトでは、`getKoin()` は `startKoin` で起動されたグローバルコンテナを返します。まだ `startKoin` が呼び出されていない場合、`get()` は `IllegalStateException`（"KoinApplication has not been started"）をスローします。

独自の隔離されたコンテナを実行するライブラリや SDK では、`getKoin()` をオーバーライドしてそのコンテナを返します：

```kotlin
object SdkKoinContext {
    val koinApp = koinApplication { modules(sdkModule) }
}

abstract class SdkComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koinApp.koin
}

class SdkClient : SdkComponent() {
    private val api: SdkApi by inject() // SDK のコンテナから解決される
}
```

完全なパターンは [Context Isolation](/docs/reference/koin-core/context-isolation) に記載されています。

スコープを保持するクラスの場合は、代わりに `KoinScopeComponent` を実装してください。そうすることで、`get()` と `inject()` はそのスコープから解決されるようになります。[Scopes](/docs/reference/koin-core/scopes) を参照してください。

## コンストラクタインジェクションが推奨される理由 {id="why-constructor-injection-is-preferred"}

同じクラスの 2 つのバージョンを比較してみましょう：

**Compiler Plugin DSL**
```kotlin
// Koin に依存しており、依存関係がクラス本体内に隠れている
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// プレーンな Kotlin クラスであり、依存関係がコンストラクタで見えている
class UserService(private val repository: UserRepository)

val appModule = module {
    single<UserRepository>()
    single<UserService>()
}
```

**Annotations**
```kotlin
// Koin に依存しており、依存関係がクラス本体内に隠れている
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// プレーンな Kotlin クラスであり、依存関係がコンストラクタで見えている
@Singleton
class UserService(private val repository: UserRepository)
```

**Constructor / Classic DSL**
```kotlin
// Koin に依存しており、依存関係がクラス本体内に隠れている
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// プレーンな Kotlin クラスであり、依存関係がコンストラクタで見えている
class UserService(private val repository: UserRepository)

val appModule = module {
    singleOf(::UserRepository)
    singleOf(::UserService)
}
```

コンストラクタバージョンには、次の 4 つの優れた点があります：

- 依存関係の可視性：クラスが必要とするものがコンストラクタに列挙されます。`KoinComponent` では、クラス本体を読み解く必要があります。
- Koin なしでのテスト：`UserService(FakeUserRepository())` を直接インスタンス化できます。`KoinComponent` バージョンでは、フェイク定義を含む実行中のコンテナが必要です。
- ビルド時のチェック：Compiler Plugin が、宣言されたクラスのコンストラクタ依存関係をグラフと照らし合わせて検証します。
- フレームワークとの密結合の排除：Koin がなくてもクラスをコンパイルして実行できるため、共有コードやライブラリにとって重要です。

`KoinComponent` は境界（エッジ）部分にとどめておきましょう。1 つのエントリーポイントが最上位のオブジェクトを取得し、それより下のすべてのレイヤーではコンストラクタインジェクションを使用します：

```kotlin
class SyncCommand : KoinComponent {
    private val syncService: SyncService by inject()
}

class SyncService(private val repository: UserRepository, private val api: ApiClient)
class UserRepository(private val database: Database)
```

## KoinComponent のテスト {id="testing-a-koincomponent"}

`KoinComponent` を実装するクラスはグローバルコンテナから読み取るため、テストでは必要な定義を使って Koin を起動し、テスト後に停止する必要があります：

```kotlin
class SyncCommandTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<SyncService> { FakeSyncService() }
            single<Logger> { TestLogger() }
        })
    }

    @Test
    fun `run calls sync`() {
        SyncCommand().run()
        // FakeSyncService に対するアサーション
    }
}
```

`KoinTestRule` は各テストの前に Koin を起動し、テスト後に停止します。ルール、モック、モジュール検証については [Testing](/docs/reference/koin-test/testing) で解説しています。

## 関連情報 {id="related"}

- [Injection](/docs/reference/koin-core/injection)：`get()`、`inject()`、Null 許容の取得、および `getAll()`。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：どの Android クラスに `KoinComponent` が必要で、どのクラスに不要か。
- [Context Isolation](/docs/reference/koin-core/context-isolation)：`KoinComponent` が隔離されたコンテナを指すようにする。
- [Scopes](/docs/reference/koin-core/scopes)：スコープを保持するクラス向けの `KoinScopeComponent`。
- [Testing](/docs/reference/koin-test/testing)：Koin を使用するクラスのテスト。