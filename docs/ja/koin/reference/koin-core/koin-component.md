---
title: Koinコンポーネント
---

`KoinComponent` は、モジュール定義の外側でKoinコンテナからインスタンスを取得するためのAPIを提供します。これは、AndroidのActivityやフレームワークのクラスなど、コンストラクタインジェクションを使用できないクラスで役立ちます。

## KoinComponentとは？

`KoinComponent` は、あらゆるクラスにKoinコンテナAPIへのアクセス権を与えるインターフェースです。コンストラクタインジェクションを必要とせずに、インスタンスを取得するための関数を提供します。

:::info
**可能な限りコンストラクタインジェクションを優先してください。** `KoinComponent` は、モジュール内で宣言できないクラス（フレームワークのクラス、UIコンポーネントなど）に対してのみ使用してください。コンストラクタインジェクションの方が明確でテストがしやすく、コードをKoinに結合させずに済みます。
:::

## 基本的な使い方

### Koinコンポーネントの作成

クラスに `KoinComponent` インターフェースを実装（タグ付け）します。

```kotlin
class MyService

val myModule = module {
    single { MyService() }
}
```

```kotlin
// Koinの開始
fun main() {
    startKoin {
        modules(myModule)
    }

    // Koinを使用するコンポーネントを作成
    MyComponent()
}
```

```kotlin
class MyComponent : KoinComponent {
    // 遅延評価 - 最初にアクセスされた時にインスタンスが取得される
    val myService: MyService by inject()

    // または

    // 即時評価 - インスタンスがすぐに取得される
    val myService: MyService = get()
}
```

### 利用可能な関数

`KoinComponent` を実装すると、以下にアクセスできるようになります。

| 関数 | 説明 |
|----------|-------------|
| `get<T>()` | インスタンスを即時取得する |
| `by inject<T>()` | インスタンスを遅延取得する（委譲） |
| `getProperty()` | 設定プロパティを取得する |
| `setProperty()` | 設定プロパティを設定する |
| `getKoin()` | Koinインスタンスにアクセスする |

## インスタンスの取得

### 即時取得 vs 遅延取得

**`get()` による即時取得:**
```kotlin
class MyComponent : KoinComponent {
    // インスタンスは構築時にすぐ取得される
    val service: MyService = get()

    init {
        service.doSomething()  // すでに利用可能
    }
}
```

**`by inject()` による遅延取得:**
```kotlin
class MyComponent : KoinComponent {
    // インスタンスは最初にアクセスされた時にのみ取得される
    val service: MyService by inject()

    fun doWork() {
        service.doSomething()  // ここで初めて取得される
    }
}
```

:::note
常に必要とは限らないプロパティには `by inject()` を使用してください。これにより、最初のアクセスまでインスタンスの作成を遅らせることができます。
:::

### 使い分け

| `get()` を使う場合 | `by inject()` を使う場合 |
|-------------|-------------------|
| `init` ブロック内ですぐにインスタンスが必要 | プロパティが使用されない可能性がある |
| シンプルで直接的なアクセス | 遅延初期化を行いたい |
| 関数内でオブジェクトを構築する | クラスプロパティを宣言する |

## クオリファイア（Qualifiers）

クオリファイアを使用して、名前付き定義を取得します。

```kotlin
module {
    single(named("local")) { LocalDatabase() }
    single(named("remote")) { RemoteDatabase() }
}
```

```kotlin
class DataManager : KoinComponent {
    val localDb: Database = get(named("local"))
    val remoteDb: Database = get(named("remote"))

    // または遅延取得
    val localDb: Database by inject(named("local"))
}
```

### クオリファイアの種類

**文字列クオリファイア:**
```kotlin
val service = get<ApiService>(named("production"))
```

**型クオリファイア:**
```kotlin
val service = get<ApiService>(named<ProductionService>())
```

**Enumクオリファイア:**
```kotlin
enum class Environment { DEV, PROD }

val service = get<ApiService>(named(Environment.PROD))
```

## インジェクションパラメータ

インスタンス取得時に実行時パラメータを渡します。

```kotlin
module {
    factory { (userId: String, sessionId: String) ->
        UserSession(userId, sessionId)
    }
}
```

```kotlin
class LoginController : KoinComponent {
    fun login(userId: String) {
        val session: UserSession = get { parametersOf(userId, "session-123") }
        session.start()
    }
}
```

**遅延インジェクションの場合:**
```kotlin
class ProfileScreen : KoinComponent {
    private val userId = "user-456"

    // パラメータは最初にアクセスされた時に評価される
    val userSession: UserSession by inject { parametersOf(userId, "profile-session") }
}
```

## プロパティ

コンポーネントからKoinプロパティへのアクセスと変更を行います。

### プロパティの取得

```kotlin
class ApiClientFactory : KoinComponent {
    val apiUrl: String = getProperty("server_url")
    val apiKey: String = getProperty("api_key", "default-key")  // デフォルト値付き
    val timeout: Int = getProperty("timeout", "30").toInt()
}
```

### プロパティの設定

```kotlin
class ConfigManager : KoinComponent {
    fun updateServerUrl(url: String) {
        setProperty("server_url", url)
    }

    fun enableDebugMode() {
        setProperty("debug_mode", "true")
    }
}
```

### プロパティのライフサイクル

`setProperty()` で設定されたプロパティは以下の通りです。
- すべてのコンポーネントから利用可能
- Koinインスタンスの存続期間中保持される
- `stopKoin()` が呼び出されるとリセットされる

## Koinインスタンスへのアクセス

`Koin` コンテナに直接アクセスします。

```kotlin
class AdvancedComponent : KoinComponent {
    fun performComplexOperation() {
        val koin = getKoin()

        // スコープへのアクセス
        val scope = koin.createScope<MyActivity>()

        // 定義が存在するかチェック
        val hasService = koin.getOrNull<MyService>() != null

        // 特定の型のすべてのインスタンスを取得
        val allServices = koin.getAll<Service>()
    }
}
```

## 実践的な例

### Android Activity（推奨されるアプローチ）

:::info
AndroidのActivityでは **KoinComponentは不要** です。Koin Android拡張機能を使用してください。
:::

```kotlin
// ✅ 推奨 - KoinComponentは不要
class MainActivity : AppCompatActivity() {
    private val userRepository: UserRepository by inject()
    private val viewModel: MainViewModel by viewModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Koin Android拡張機能経由で依存関係が利用可能
        val user = userRepository.getCurrentUser()
    }
}
```

比較のための古い方法（非推奨）:
```kotlin
// ❌ 不要 - ActivityにおいてKoinComponentは冗長
class MainActivity : AppCompatActivity(), KoinComponent {
    private val userRepository: UserRepository by inject()
    // ...
}
```

### Android Fragment（推奨されるアプローチ）

```kotlin
// ✅ 推奨 - KoinComponentは不要
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModel()
    private val userRepository: UserRepository by inject()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel.loadUser()
    }
}
```

### カスタムAndroid View（KoinComponentが必要）

```kotlin
// ✅ ここではKoinComponentが適切
class CustomChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr), KoinComponent {

    private val dataFormatter: ChartDataFormatter by inject()
    private val colorScheme: ColorScheme by inject()

    fun setData(data: List<DataPoint>) {
        val formatted = dataFormatter.format(data)
        // チャートの描画処理...
    }
}
```

### コンソールアプリケーション

```kotlin
class ConsoleApp : KoinComponent {
    private val logger: Logger by inject()
    private val dataProcessor: DataProcessor by inject()

    fun run() {
        logger.info("Starting application")
        dataProcessor.process()
        logger.info("Application finished")
    }
}

fun main() {
    startKoin {
        modules(appModule)
    }

    ConsoleApp().run()

    stopKoin()
}
```

### Kotlinマルチプラットフォームの共通コード

```kotlin
// プラットフォーム間で動作する共通コード
class FeatureManager : KoinComponent {
    private val api: ApiClient by inject()
    private val cache: Cache by inject()

    suspend fun loadFeatures(): `List<Feature>` {
        return cache.get() ?: api.fetchFeatures().also { cache.set(it) }
    }
}
```

## KoinComponentを使用すべきケース

### 適したユースケース

以下のような場合に `KoinComponent` を使用します。

- **カスタムUIコンポーネント** - カスタムView、ウィジェット（Activity/Fragmentは除きます。下の注記を参照してください）
- **エントリポイント** - Main関数、Applicationクラス
- **コールバック** - コンストラクタインジェクションを使用できないリスナーやハンドラー
- **レガシーコード** - DIを使用するようにリファクタリングできないクラス
- **Android以外のプラットフォーム** - JVM、Native、JSアプリケーション

:::note
**Android開発者の方へ:** Activity、Fragment、Serviceには専用のKoin拡張機能があり、**KoinComponentを実装する必要はありません**。インターフェースを実装せずに、直接 `by inject()` や `by viewModel()` を使用してください。詳細は [Android Injection](/docs/reference/koin-android/get-instances) を参照してください。
:::

### 使用を避けるべきケース

以下の場合は `KoinComponent` を使用しないでください。

- **Android Activity/Fragment/Service** - 代わりにKoin Android拡張機能を使用してください
- **ビジネスロジック** - 代わりにコンストラクタインジェクションを使用してください
- **データ層** - リポジトリ、データソース
- **ドメイン層** - ユースケース、ドメインモデル
- **新規コード** - モジュール内で宣言し、コンストラクタインジェクションを使用することを優先してください

## ベストプラクティス

### コンストラクタインジェクションを優先する

```kotlin
// ❌ 回避 - ビジネスロジックにKoinComponentを使用している
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
    private val validator: UserValidator by inject()

    fun createUser(name: String) { /* ... */ }
}

// ✅ 推奨 - コンストラクタインジェクション
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator
) {
    fun createUser(name: String) { /* ... */ }
}

// モジュールで宣言
module {
    single { UserRepository() }
    single { UserValidator() }
    single { UserService(get(), get()) }
}
```

### オプションの依存関係には遅延インジェクションを使用する

```kotlin
class FeatureController : KoinComponent {
    // すべてのコードパスで使用されるとは限らない
    private val analyticsService: AnalyticsService by inject()

    fun performAction(trackAnalytics: Boolean) {
        doWork()

        // Analyticsが必要な場合にのみ取得される
        if (trackAnalytics) {
            analyticsService.track("action_performed")
        }
    }
}
```

### KoinComponentのスコープを制限する

```kotlin
// ❌ 良くない例 - 非常に多くのコンポーネントが直接Koinを使用している
class RepositoryA : KoinComponent {
    val db: Database by inject()
}

class RepositoryB : KoinComponent {
    val db: Database by inject()
}

class ServiceA : KoinComponent {
    val repoA: RepositoryA by inject()
}

// ✅ 改善例 - エントリポイントは1つにし、他はコンストラクタインジェクションを使用する
class AppController : KoinComponent {
    private val serviceA: ServiceA = get()
    private val serviceB: ServiceB = get()
}

class ServiceA(private val repoA: RepositoryA)
class ServiceB(private val repoB: RepositoryB)
class RepositoryA(private val db: Database)
class RepositoryB(private val db: Database)
```

### getPropertyを多用しない

```kotlin
// ❌ 回避 - あらゆる場所でプロパティを取得している
class FeatureA : KoinComponent {
    val apiUrl = getProperty("api_url")
}

class FeatureB : KoinComponent {
    val apiUrl = getProperty("api_url")
}

// ✅ 改善例 - 設定を一箇所にまとめる
class AppConfig(
    val apiUrl: String,
    val apiKey: String,
    val timeout: Int
)

module {
    single {
        AppConfig(
            apiUrl = getProperty("api_url"),
            apiKey = getProperty("api_key"),
            timeout = getProperty("timeout", "30").toInt()
        )
    }

    single { ApiClient(get<AppConfig>().apiUrl) }
}
```

## テスト

コンポーネントをテストする際、Koinの設定をオーバーライドできます。

```kotlin
class MyComponent : KoinComponent {
    val service: MyService by inject()

    fun doWork() = service.execute()
}

@Test
fun testComponent() {
    // テスト用Koinインスタンスのセットアップ
    startKoin {
        modules(module {
            single<MyService> { MockMyService() }
        })
    }

    val component = MyComponent()
    val result = component.doWork()

    assertEquals("mock result", result)

    // クリーンアップ
    stopKoin()
}
```

## 関連項目

- [Koinの開始](/docs/reference/koin-core/start-koin) - Koinの初期化
- [定義](/docs/reference/koin-core/definitions) - 定義の作成
- [インジェクションパラメータ](/docs/reference/koin-core/injection-parameters) - 実行時パラメータ
- [Androidでのインジェクション](/docs/reference/koin-android/get-instances) - Android特有のインジェクション