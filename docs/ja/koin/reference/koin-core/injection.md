---
title: 依存関係の取得
---

# 依存関係の取得

このガイドでは、さまざまなコンテキストで Koin から依存関係を取得する方法について説明します。

## アプローチ

| アプローチ | 使用場面 | 例 |
|----------|-------------|---------|
| **コンストラクタ注入 (Constructor Injection)** | ビジネスロジック、サービス、リポジトリ | `class MyService(val repo: Repository)` |
| **関数注入 (Function Injection)** | ファクトリ関数、ビルダー | `fun createHttpClient(val ds: DataSource): HttpClient` |
| **フィールド注入 (Field Injection)** | Android フレームワークのクラス、エントリポイント | `val viewModel: MyViewModel by viewModel()` |

:::info
**ベストプラクティス：** テストのしやすさを向上させるため、コンストラクタ注入または関数注入を優先してください。フィールド注入は、クラスの生成を制御できない場合（Activity や Fragment など）にのみ使用してください。
:::

## コンストラクタ注入（推奨）

依存関係はコンストラクタで宣言され、Koin によって解決されます：

```kotlin
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient
)

class UserViewModel(
    private val repository: UserRepository
) : ViewModel()
```

```kotlin
val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

Koin はすべてのコンストラクタパラメータを自動的に解決します。

## 関数注入

カスタムの生成ロジックが必要な場合は、関数を使用してインスタンスを作成します：

### コンパイラプラグイン DSL

```kotlin
fun createHttpClient(dataSource: DataSource): HttpClient {
    return HttpClient {
        install(ContentNegotiation) { json() }
        defaultRequest { url(dataSource.baseUrl) }
    }
}

val appModule = module {
    single<DataSource>()
    single { create(::createHttpClient) }
}
```

### アノテーション

```kotlin
@Module
class NetworkModule {

    @Singleton
    fun createHttpClient(dataSource: DataSource): HttpClient {
        return HttpClient {
            install(ContentNegotiation) { json() }
            defaultRequest { url(dataSource.baseUrl) }
        }
    }
}
```

関数注入は以下のような場合に便利です：
- 制御できない外部ライブラリのインスタンスを作成する場合
- 複雑な初期化ロジックが必要な場合
- ビルダーや DSL を構成する必要がある場合

## フィールド注入

### `by inject()` による遅延注入

最初にアクセスされたときにインスタンスを作成します：

```kotlin
class MyActivity : AppCompatActivity() {
    // 遅延注入 - 初回アクセス時に作成される
    private val viewModel: UserViewModel by viewModel()
    private val service: MyService by inject()
}
```

### `get()` による即時注入

インスタンスを即座に作成します：

```kotlin
class MyActivity : AppCompatActivity() {
    // 即時注入 - 即座に作成される
    private val service: MyService = get()
}
```

### 比較

| メソッド | 作成タイミング | スレッドセーフティ |
|--------|--------------|---------------|
| `by inject()` | 初回アクセス時 | スレッドセーフな遅延初期化 |
| `get()` | 即座 | 直接呼び出し |

## KoinComponent

依存関係を注入する必要があるが、Android コンポーネントではないクラスの場合：

```kotlin
class MyHelper : KoinComponent {
    private val service: MyService by inject()
    private val database: Database = get()

    fun doSomething() {
        service.process(database.query())
    }
}
```

:::warning
ビジネスロジッククラスでの `KoinComponent` の使用は避けてください。Koin への密結合が生じます。代わりにコンストラクタ注入を優先してください。
:::

## プラットフォーム固有の注入

### Android

Activity や Fragment には組み込みのサポートがあります：

```kotlin
class MainActivity : AppCompatActivity() {
    // ViewModel の注入
    private val viewModel: UserViewModel by viewModel()

    // 通常の注入
    private val analytics: AnalyticsService by inject()
}

class UserFragment : Fragment() {
    // Fragment 自身の ViewModel
    private val viewModel: UserViewModel by viewModel()

    // Activity と共有される ViewModel
    private val sharedVM: SharedViewModel by activityViewModels()
}
```

### Compose

```kotlin
@Composable
fun UserScreen() {
    // ViewModel を注入
    val viewModel: UserViewModel = koinViewModel()

    // 任意の依存関係を注入
    val analytics: AnalyticsService = koinInject()

    // Activity スコープの ViewModel
    val sharedVM: SharedViewModel = koinActivityViewModel()
}
```

### Ktor

```kotlin
fun Route.userRoutes() {
    val repository: UserRepository by inject()

    get("/users") {
        call.respond(repository.getAll())
    }
}
```

## クオリファイアによる注入

同じ型の定義が複数ある場合は、クオリファイア (Qualifier) を使用してそれらを区別します。

### 文字列クオリファイア (String Qualifier)

| DSL | アノテーション |
|-----|------------|
| `named("local")` | `@Named("local")` |

```kotlin
// DSL
val module = module {
    single<Database>(named("local")) { LocalDatabase() }
    single<Database>(named("remote")) { RemoteDatabase() }
}

// 注入
private val localDb: Database by inject(named("local"))
private val remoteDb: Database by inject(named("remote"))
```

```kotlin
// アノテーション
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
@Named("remote")
class RemoteDatabase : Database
```

### 型クオリファイア (Type Qualifier)

コンパイル時の安全性を確保するために、型（クラス、オブジェクト、または列挙型）をクオリファイアとして使用します：

| DSL | アノテーション |
|-----|------------|
| `named<LocalDb>()` | `@Qualifier(LocalDb::class)` |

```kotlin
// クオリファイア型の定義
object LocalDb
object RemoteDb

// DSL
val module = module {
    single<Database>(named<LocalDb>()) { LocalDatabase() }
    single<Database>(named<RemoteDb>()) { RemoteDatabase() }
}

// 注入
private val localDb: Database by inject(named<LocalDb>())
private val remoteDb: Database by inject(named<RemoteDb>())
```

```kotlin
// アノテーション
@Singleton
@Qualifier(LocalDb::class)
class LocalDatabase : Database

@Singleton
@Qualifier(RemoteDb::class)
class RemoteDatabase : Database
```

### Compose での使用

```kotlin
@Composable
fun MyScreen() {
    // 文字列クオリファイアを使用
    val localDb: Database = koinInject(named("local"))

    // 型クオリファイアを使用
    val remoteDb: Database = koinInject(named<RemoteDb>())
}
```

## パラメータを伴う注入

注入時にパラメータを渡します：

### 定義

```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository
)

// または DSL を使用
factory<UserPresenter>()
```

### 注入

```kotlin
// by inject()
private val presenter: UserPresenter by inject { parametersOf("user123") }

// get()
val presenter: UserPresenter = get { parametersOf("user123") }
```

### Compose での使用

```kotlin
@Composable
fun UserScreen(userId: String) {
    val presenter: UserPresenter = koinInject { parametersOf(userId) }
}
```

### 複数のパラメータ

```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: String,
    val repository: OrderRepository
)

val presenter = get<OrderPresenter> { parametersOf("user123", "order456") }
```

## Koin への直接アクセス

必要に応じて Koin インスタンスに直接アクセスします：

```kotlin
// GlobalContext から取得
val koin = KoinPlatform.getKoin()
val service: MyService = koin.get()

// KoinComponent 内で取得
class MyClass : KoinComponent {
    fun doSomething() {
        val service: MyService = getKoin().get()
    }
}
```

## Null 許容の注入 (Nullable Injection)

オプションの依存関係の場合：

```kotlin
// 見つからない場合は null を返す
val optional: MyService? = getKoinOrNull()?.getOrNull()

// KoinComponent 内
class MyClass : KoinComponent {
    private val optional: MyService? = getOrNull()
}
```

## さまざまなコンテキストでの注入

### ViewModel 内

```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // コンストラクタ注入 - KoinComponent は不要
}
```

### Service 内

```kotlin
class MyService : Service() {
    private val repository: UserRepository by inject()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        repository.doSomething()
        return START_STICKY
    }
}
```

### BroadcastReceiver 内

```kotlin
class MyReceiver : BroadcastReceiver(), KoinComponent {
    private val service: NotificationService by inject()

    override fun onReceive(context: Context, intent: Intent) {
        service.handleNotification(intent)
    }
}
```

### WorkManager Worker 内

```kotlin
class MyWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository  // Koin によって注入される
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        repository.syncData()
        return Result.success()
    }
}

// モジュール
val workerModule = module {
    worker<MyWorker>()
}
```

## ベストプラクティス

### 推奨 (DO): ビジネスロジックにはコンストラクタ注入を使用する

```kotlin
// 良い例 - Koin なしでテスト可能
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(data: UserData) = validator.validate(data).let {
        repository.save(it)
    }
}

// Koin なしでのテスト
@Test
fun testCreateUser() {
    val mockRepo = mockk<UserRepository>()
    val mockValidator = mockk<UserValidator>()
    val service = UserService(mockRepo, mockValidator)
    // 直接テストする
}
```

### 推奨 (DO): フレームワーククラスにはフィールド注入を使用する

```kotlin
// 良い例 - Activity の生成は Android によって制御される
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

### 非推奨 (DON'T): ビジネスロジックで KoinComponent を使用する

```kotlin
// 悪い例 - Koin への密結合
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 良い例 - コンストラクタ注入
class UserService(private val repository: UserRepository)
```

### 非推奨 (DON'T): コンストラクタ内で get() を使用する

```kotlin
// 悪い例 - コンストラクタ内でのサイドエフェクト
class MyService(
    private val repo: UserRepository = get()  // これは避けてください！
)

// 良い例 - Koin に注入させる
class MyService(private val repo: UserRepository)
```

## 次のステップ

- **[スコープ (Scopes)](/docs/reference/koin-core/scopes)** - 依存関係のライフサイクル管理
- **[Android 向け Koin](/docs/reference/koin-android/start)** - Android 特有の注入
- **[Compose 向け Koin](/docs/reference/koin-compose/compose)** - Compose での注入