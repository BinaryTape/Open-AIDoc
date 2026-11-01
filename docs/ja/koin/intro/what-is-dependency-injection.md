---
title: 依存性の注入（DI）とは？
---

# 依存性の注入（DI）とは？

依存性の注入（Dependency Injection: DI）は、オブジェクトが自身で必要なオブジェクトを生成するのではなく、外部から受け取るようにするデザインパターンです。このページでは、特定のフレームワークを前提とせずにこのパターンについて解説し、その後KoinのようなDIコンテナがどのように活用されるかを示します。すでにDIについて理解している場合は、[Core Concepts](/docs/intro/core-concepts) に進んでください。

## 依存関係とは？ {id="what-is-a-dependency"}

依存関係（依存オブジェクト）とは、あるオブジェクトが処理を行うために必要とするオブジェクトのことです。例えば、`Car`（車）が走行するには `Engine`（エンジン）が必要です。

### 依存性の注入を用いない場合 {id="without-dependency-injection"}

```kotlin
class Engine {
    fun start() {
        println("Engine starting...")
    }
}

class Car {
    private val engine = Engine() // Car自身がエンジンを生成している

    fun drive() {
        engine.start()
        println("Car is driving")
    }
}
```

これは正しく動作しますが、以下のような問題点（コスト）があります：

- **密結合**: `Car` が特定の `Engine` 実装に固定されてしまいます。
- **テストが困難**: `Car` をテスト用のフェイクエンジンでテストすることができません。
- **変更が困難**: 電気エンジンに切り替えるには、`Car` 自体を修正する必要があります。
- **ライフサイクルの管理場所が不適切**: `Engine` がいつ生成され、いくつ存在するかを `Car` が決定してしまいます。

### 依存性の注入を用いる場合 {id="with-dependency-injection"}

```kotlin
class Car(private val engine: Engine) {
    fun drive() {
        engine.start()
        println("Car is driving")
    }
}

val gasolineCar = Car(GasEngine())
val electricCar = Car(ElectricEngine())
```

`Car` は `Engine` がどのように構築されるかを知る必要がなくなりました。テスト時のフェイクを含め、あらゆる実装を渡すことができ、コンストラクタを見れば `Car` が何を必要としているかが一目でわかります。

## 依存関係を提供する方法 {id="ways-to-provide-dependencies"}

### コンストラクタ注入（Constructor injection） {id="constructor-injection"}

依存関係をコンストラクタのパラメータとして渡します：

```kotlin
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient,
) {
    fun getUser(id: String): User =
        database.query(id) ?: apiClient.fetchUser(id)
}
```

依存関係が明示的かつ必須になり、不変（`val`）にできます。このクラスはフレームワークなしで生成およびテストが可能です。原則としてこのアプローチを使用します。

### フィールド注入（Field injection） {id="field-injection"}

オブジェクトが作成された後に、プロパティへ依存関係を割り当てます。これはAndroidの `Activity` のように、フレームワークがオブジェクトを生成し、コンストラクタを制御できない場合に必要な手法です：

```kotlin
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel() // 初回アクセス時にKoinによって注入される
}
```

これは、上記のようなフレームワークのエントリポイントでのみ使用してください。それより下層のコンポーネントでは、コンストラクタ注入を使用します。

### メソッド注入（Method injection） {id="method-injection"}

依存関係をそれを必要とするメソッドに渡します：

```kotlin
class ReportGenerator {
    fun generateReport(data: DataSource) {
        ...
    }
}
```

これは、呼び出しごとに変化する依存関係や、特定のメソッドだけが使用する依存関係に適しています。

## 手動DIと自動DI {id="manual-and-automated-dependency-injection"}

### 手動でのオブジェクトグラフ構築 {id="wiring-by-hand"}

ライブラリを一切使わずに、オブジェクトグラフ（依存関係の構造）を自前で構築してDIを適用することも可能です：

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = Database()
        val apiClient = ApiClient()
        val userRepository = UserRepository(database, apiClient)
        val authRepository = AuthRepository(database, apiClient)
        val userService = UserService(userRepository, authRepository)
        val viewModel = UserViewModel(userService)
    }
}
```

アプリが成長するにつれて、このコードは多くの場所で重複し、コンストラクタが変更されるたびに更新が必要になります。また、各オブジェクトの生存期間を制御することも困難です。

### 手作りのコンテナ {id="a-container-written-by-hand"}

次のステップとして一般的なのは、生成処理を一元化するコンテナオブジェクトを作成することです：

```kotlin
object AppContainer {
    private val database by lazy { Database() }
    private val apiClient by lazy { ApiClient() }

    val userRepository by lazy { UserRepository(database, apiClient) }
    val authRepository by lazy { AuthRepository(database, apiClient) }

    fun createUserViewModel() = UserViewModel(
        UserService(userRepository, authRepository)
    )
}

class MainActivity : AppCompatActivity() {
    private val viewModel = AppContainer.createUserViewModel()
}
```

これにより重複は解消されますが、依然としてすべてのコンストラクタ呼び出しを手作業で記述および維持する必要があり、「単一インスタンス」や「都度新しいインスタンス」以上のライフサイクル（画面ごと、セッションごとのインスタンスなど）を扱うには、さらに多くのコードを手動で記述する必要があります。

### DIコンテナ {id="a-di-container"}

DIライブラリはコンテナの役割を自動化します。どのクラスが存在し、どのくらいの期間生存するかを宣言するだけで、ライブラリがオブジェクトグラフを構築します。Koinを使用した場合：

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    single<AuthRepository>()
    single<UserService>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Singleton
class UserRepository(private val database: Database, private val apiClient: ApiClient)

@Singleton
class UserService(private val userRepository: UserRepository, private val authRepository: AuthRepository)

@KoinViewModel
class UserViewModel(private val userService: UserService) : ViewModel()

// Database、ApiClient、AuthRepository も同様にアノテーションを付与

@Module
@ComponentScan("com.example.app")
class AppModule
```

**Constructor / Classic DSL**
```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::ApiClient)
    singleOf(::UserRepository)
    singleOf(::AuthRepository)
    singleOf(::UserService)
    viewModelOf(::UserViewModel)
}
```

その後、Activityはオブジェクトグラフのトップレベルの要素を要求します：

```kotlin
class MainActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

コンテナは `UserViewModel` とその配下にあるすべてのオブジェクトを生成し、アプリ全体で1つの `Database` を保持しながら、画面ごとに新しい `UserViewModel` を提供します。[Core Concepts](/docs/intro/core-concepts) でこれらの要素について解説しています。

## DIライブラリがグラフを構築する仕組み {id="how-di-libraries-build-the-graph"}

DIライブラリによって、いつ、どのようにグラフを構築するかが異なります：

| アプローチ | 仕組み | 例 |
|------------|--------|----|
| リフレクション | 実行時にコンストラクタを読み取り、リフレクションによって呼び出す | Guice, Spring |
| アノテーションプロセッシング | ビルド時にファクトリのソースコードを生成する | Dagger, Hilt |
| コンパイラプラグイン | コンパイラ内部でコードを書き換え、ビルド時にグラフを検証する | Koin Compiler Plugin |
| ランタイムDSL | ファクトリをKotlinラムダとして記述し、コンテナが実行時に実行する | Koin Classic DSL |

Koinはいずれの場合でもランタイムコンテナを維持します。Compiler Pluginは、その上に配線処理とビルド時チェックを追加します。これが実際に何を意味するのかについては、[What is Koin?](/docs/intro/what-is-koin) を参照してください。

## サービスロケータと依存性の注入 {id="service-locator-and-dependency-injection"}

この2つのパターンはよく混同されます。

**サービスロケータ（Service Locator）** では、クラス自身がレジストリに対して依存関係を要求します：

```kotlin
class UserService : KoinComponent {
    private val repository: UserRepository by inject() // コンテナから引き出す（pull）
}
```

**依存性の注入（Dependency Injection）** では、依存関係が外部からクラスに渡されます：

```kotlin
class UserService(
    private val repository: UserRepository // 外部から注入される（push）
)
```

| 観点 | サービスロケータ | 依存性の注入 |
|------|------------------|--------------|
| 依存関係の可視性 | クラスの内部に隠蔽される | コンストラクタで明示される |
| テスト | コンテナ、またはそのテスト用バージョンが必要 | コンストラクタにフェイクを渡すだけでよい |
| 結合度 | クラスがコンテナに依存する | クラスはそのパラメータのみに依存する |
| Koinでの表現 | `get()`, `by inject()`, `KoinComponent` | モジュールによって解決されるコンストラクタパラメータ |
| 適した用途 | 自身でインスタンス化しないフレームワークのクラス | ビジネスロジック、リポジトリ、サービス |

Koinは両方をサポートしています。自身で作成するクラスには依存性の注入を使用し、フレームワークがオブジェクトを生成する場所（`Activity`、`Fragment`、Ktorのルートなど）でのみサービスロケータスタイルを使用してください：

```kotlin
// 非推奨: 依存関係が隠蔽され、テストにKoinが必要になる
class UserService : KoinComponent {
    private val repository: UserRepository = get()
}

// 推奨: 依存関係が明示的
class UserService(private val repository: UserRepository)
```

## DIのメリット {id="what-you-gain"}

### テスタビリティ（テスト容易性） {id="testability"}

```kotlin
class UserService(private val repository: UserRepository)

@Test
fun getUser() {
    val repository = mockk<UserRepository>()
    every { repository.findUser("123") } returns testUser

    val service = UserService(repository)

    assertEquals(testUser, service.getUser("123"))
}
```

依存関係を受け取るクラスは、コンストラクタを呼び出すだけでテストできます。コンテナは不要です。

### 実装の差し替えやすさ {id="swappable-implementations"}

```kotlin
val appModule = module {
    single<EmailService> { SmtpEmailService() }
}

val testModule = module {
    single<EmailService> { FakeEmailService() }
}
```

利用側は `EmailService` に依存します。どちらの実装を受け取るかは、モジュールという1箇所で決定されます。

### 設定の一元管理 {id="central-configuration"}

```kotlin
startKoin {
    modules(dataModule, domainModule, presentationModule)
}
```

オブジェクトグラフ全体がコードのあちこちに分散することなく、通常はレイヤーや機能ごとに分かれたいくつかのモジュールによって一元的に記述されます。

### ライフサイクル管理 {id="lifecycle-management"}

```kotlin
val appModule = module {
    single<Database>()     // アプリ全体で1つのインスタンス
    factory<Presenter>()   // リクエストごとに新しいインスタンス

    scope<UserSession> {
        scoped<CartRepository>() // セッションごとに1つのインスタンス
    }
}
```

コンテナが各オブジェクトの生存期間を決定するため、クラス自身が依存関係のライフサイクルを管理する必要がなくなります。[Scopes](/docs/reference/koin-core/scopes) を参照してください。

## 関連情報 {id="related"}

- [What is Koin?](/docs/intro/what-is-koin): KoinがどのようにDIコンテナを実装しているか。
- [Core Concepts](/docs/intro/core-concepts): Koinにおける定義、モジュール、インジェクション、スコープ。
- [Retrieving Dependencies](/docs/reference/koin-core/injection): `get()` と `inject()` の詳細。
- [Injecting in Tests](/docs/reference/koin-test/testing): Koinを使用したコードのテスト。