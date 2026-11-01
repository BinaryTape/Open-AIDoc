---
title: Hiltからの移行
---

# Hiltからの移行

このガイドでは、Gradle、`Application` クラス、モジュール、バインディング、ViewModel、エントリーポイント、クォリファイア、Compose、テストと、ステップごとにAndroidアプリをDagger HiltからKoinへと移行します。各Koinサンプルには3つのKoinスタイルが用意されています。どれを選ぶべきか迷った場合は、[Choosing your style](/docs/intro/choosing-your-style)（スタイルの選択）をお読みください。2つのフレームワークの比較については、[Koin vs Hilt](/docs/intro/koin-vs-hilt) を参照してください。

:::note
実際のアプリでの完全な移行事例については、[Migrating Now in Android to Koin](https://blog.insert-koin.io/migrating-now-in-android-to-koin-annotations-2-3-67d252dbb97d) をお読みください。30個のGradleモジュールを持つGoogleのサンプルアプリをHiltからKoin Annotationsへと移行した事例です。
:::

## 概念のマッピング {id="concept-mapping"}

| Hilt | Compiler Plugin DSL | Annotations | Constructor / Classic DSL |
|------|---------------------|-------------|-------------|
| `@HiltAndroidApp` | `Application.onCreate()` 内の `startKoin { }` | `@KoinApplication` + `startKoin<T>()` | `Application.onCreate()` 内の `startKoin { }` |
| `@AndroidEntryPoint` | 不要: `by inject()`, `by viewModel()` | 不要 | 不要 |
| `@Inject constructor` | `single<T>()` / `factory<T>()` | クラスに `@Singleton` / `@Factory` | `singleOf(::T)` / `factoryOf(::T)` |
| `@Module` + `@InstallIn` | `module { }` | `@Module` + `@ComponentScan` | `module { }` |
| `@Provides` | `single { create(::fn) }` | 関数に `@Singleton` / `@Factory` | `single { ... }` |
| `@Binds` | `bind Interface::class` | 自動（スーパータイプ）または `binds = [...]` | `bind Interface::class` |
| `@Singleton` | `single` | `@Singleton` / `@Single` | `single` |
| `@HiltViewModel` | `viewModel<T>()` | `@KoinViewModel` | `viewModelOf(::T)` |
| `@HiltWorker` | `worker<T>()` | `@KoinWorker` | `workerOf(::T)` |
| `@Named`, カスタム `@Qualifier` | `named("x")`, パラメータに `@Named` | `@Named`, カスタム `@Qualifier` | `named("x")` |
| `@ApplicationContext` | `Context` パラメータ（`androidContext()` により提供） | 同様 | `androidContext()` |
| `@AssistedInject` | 注入パラメータ（Injected parameters） | `@InjectedParam` | 注入パラメータ（Injected parameters） |
| 自作クラス内の `@Inject` フィールド | コンストラクタパラメータ | コンストラクタパラメータ | コンストラクタパラメータ |
| `@EntryPoint`（Hiltが注入できないフレームワーククラス） | そのエントリーポイントでのみ `KoinComponent` | 同様 | 同様 |
| `@HiltAndroidTest` | `KoinTestRule` | `KoinTestRule` | `KoinTestRule` |

### スコープのマッピング {id="scope-mapping"}

| Hilt | Koin DSL | Annotations | ライフタイム |
|------|----------|-------------|----------|
| `@Singleton` (`SingletonComponent`) | `single` | `@Singleton` | アプリケーション |
| `@ActivityRetainedScoped` | `activityRetainedScope { }` | `@ActivityRetainedScope` | 構成変更（Configuration changes）をまたいで生存 |
| `@ViewModelScoped` | `viewModelScope { }` | `@ViewModelScope` | ViewModel |
| `@ActivityScoped` | `activityScope { }` | `@ActivityScope` | Activity |
| `@FragmentScoped` | `fragmentScope { }` | `@FragmentScope` | Fragment |

スコープDSLとアノテーションの詳細は、[Android Scopes](/docs/reference/koin-android/scope) で解説されています。

## ステップ 1: Gradle {id="step-1-gradle"}

Hiltプラグイン、`hilt-android`、および `hilt-compiler`（kaptまたはKSP）を削除します。その後、Koinを追加します:

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-android")
    implementation("io.insert-koin:koin-androidx-compose") // Composeを使用する場合
}
```

Compiler Plugin DSLまたはアノテーションを使用する場合は、[Koin Compiler Plugin](/docs/setup/compiler-plugin) も適用してください。これはKotlinコンパイラ内で動作し、KoinにおけるkaptやKSPの代わりとなります。アーティファクトの完全な一覧は [Gradle Setup](/docs/setup/gradle) にあります。

## ステップ 2: Application クラス {id="step-2-application-class"}

Hilt:

```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

Koin:

**Compiler Plugin DSL**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApplication> {
            androidLogger()
            androidContext(this@MyApplication)
        }
    }
}
```

`@KoinApplication` は、`@Configuration` がタグ付けされたすべてのモジュールを読み込みます。モジュールを明示的に指定する場合は、`@KoinApplication(modules = [AppModule::class])` を使用します。

**Constructor / Classic DSL**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidLogger()
            androidContext(this@MyApplication)
            modules(appModule)
        }
    }
}
```

`androidContext()` は、すべての定義で `Context` を利用できるようにします。[Starting Koin on Android](/docs/reference/koin-android/start) を参照してください。

## ステップ 3: モジュールと @Provides {id="step-3-modules-and-provides"}

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Provides
    @Singleton
    fun provideApiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(client)
            .build()
            .create(ApiService::class.java)
}
```

Koin:

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun okHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

fun apiService(client: OkHttpClient): ApiService =
    Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .client(client)
        .build()
        .create(ApiService::class.java)

val networkModule = module {
    single { create(::okHttpClient) }
    single { create(::apiService) }
}
```

**Annotations**
```kotlin
@Module
class NetworkModule {

    @Singleton
    fun okHttpClient(): OkHttpClient = OkHttpClient.Builder().build()

    @Singleton
    fun apiService(client: OkHttpClient): ApiService =
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(client)
            .build()
            .create(ApiService::class.java)
}
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single { OkHttpClient.Builder().build() }
    single {
        Retrofit.Builder()
            .baseUrl("https://api.example.com")
            .client(get())
            .build()
            .create(ApiService::class.java)
    }
}
```

`@InstallIn` は存在しません。定義のライフタイムは、インストールされるコンポーネントからではなく、その定義の型（`single`、`factory`、`scoped`）によって決まります。`@Inject constructor` を持つクラスは、`single<T>()` / `factory<T>()`、クラスへのアノテーション、または `singleOf(::T)` に置き換わります。ライブラリオブジェクトの詳細は [Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own) を参照してください。

## ステップ 4: インターフェースのバインディング {id="step-4-interface-bindings"}

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

Koin:

**Compiler Plugin DSL**
```kotlin
val dataModule = module {
    single<UserRepositoryImpl>() bind UserRepository::class
}
```

**Annotations**
```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

クラスはそのすべてのスーパータイプにバインドされます。一部のみをバインドする場合は、`@Singleton(binds = [UserRepository::class])` を使用します。

**Constructor / Classic DSL**
```kotlin
val dataModule = module {
    singleOf(::UserRepositoryImpl) bind UserRepository::class
}
```

## ステップ 5: ViewModel {id="step-5-viewmodels"}

Hilt:

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

Koin:

**Compiler Plugin DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

val appModule = module {
    viewModelOf(::UserViewModel)
}
```

KoinはViewModelの定義に `SavedStateHandle` を提供します。ActivityやFragmentでは、`by viewModels()` を `by viewModel()` に置き換えてください。Composeでは、`hiltViewModel()` を `koinViewModel()` に置き換えます。[Android ViewModel](/docs/reference/koin-android/viewmodel) を参照してください。

## ステップ 6: Activity、Fragment、その他のエントリーポイント {id="step-6-activities-fragments-and-other-entry-points"}

Hilt:

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var analytics: Analytics
}
```

Koin:

```kotlin
class MainActivity : ComponentActivity() {
    private val analytics: Analytics by inject()
}
```

`@AndroidEntryPoint` を削除します。フレームワークによって生成されるActivity、Fragment、その他のAndroidコンポーネントでは、`@Inject lateinit var` のフィールドは `by inject()`（遅延）または `get()`（即時）に置き換わります。これはどのスタイルでも同様です。ServiceやBroadcastReceiverなどの他のコンポーネントについては、[Entry Points](/docs/reference/koin-android/entry-points) で解説されています。

自身で作成したクラス（リポジトリ、サービス、ユースケース、ViewModel）では、`@Inject` フィールドをコンストラクタパラメータに移動し、[ステップ 3](#step-3-modules-and-provides) のようにクラスを宣言します。これらのクラスが `get()` や `by inject()` を呼び出すことはありません:

```kotlin
// Hilt: 自作クラスでのフィールドインジェクション
class SyncService @Inject constructor() {
    @Inject lateinit var repository: UserRepository
}

// Koin: コンストラクタインジェクション
class SyncService(private val repository: UserRepository)
```

Hiltの `@EntryPoint` は、`ContentProvider` やライブラリのコールバックなど、Hiltが注入できないフレームワーククラスのために存在します。そのようなエントリーポイントでのみ [KoinComponent](/docs/reference/koin-core/koin-component) を実装し、`by inject()` を呼び出します。アプリクラス内の `@Inject` フィールドを置き換えるために `KoinComponent` を使用しないでください。

## ステップ 7: クォリファイア {id="step-7-qualifiers"}

Hilt:

```kotlin
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Provides
@IoDispatcher
fun provideIoDispatcher(): CoroutineDispatcher = Dispatchers.IO

class SyncRepository @Inject constructor(
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
)
```

Koin:

**Compiler Plugin DSL**
```kotlin
import org.koin.core.annotation.Named

class SyncRepository(
    @Named("io") private val dispatcher: CoroutineDispatcher,
)

val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single<SyncRepository>()
}
```

**Annotations**
既存のクォリファイアアノテーションをそのまま保持できます。Koinは `@Qualifier`（Koin独自、`jakarta.inject`、または `javax.inject`）が付与されたカスタムアノテーションを読み取ります:

```kotlin
import javax.inject.Qualifier

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Module
class DispatcherModule {
    @Singleton
    @IoDispatcher
    fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
}

@Singleton
class SyncRepository(
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
)
```

**Constructor / Classic DSL**
```kotlin
val dispatcherModule = module {
    single<CoroutineDispatcher>(named("io")) { Dispatchers.IO }
    single { SyncRepository(get(named("io"))) }
}
```

型クォリファイア（`named<IoDispatcher>()`）やすべてのオプションについては、[Qualifiers](/docs/reference/koin-core/qualifiers) に記載されています。Hiltの `@ApplicationContext` に対応するクォリファイアは不要です。`Context` パラメータは `androidContext()` に渡されたコンテキストを受け取ります。

## ステップ 8: Compose {id="step-8-compose"}

HiltではComposableからViewModel以外の依存関係にアクセスするためにエントリーポイントが必要ですが、Koinでは直接解決できます:

```kotlin
@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val analytics: Analytics = koinInject()
}
```

[Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。

## ステップ 9: テスト {id="step-9-tests"}

Hilt:

```kotlin
@HiltAndroidTest
class UserRepositoryTest {
    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject lateinit var repository: UserRepository

    @Before
    fun init() = hiltRule.inject()
}
```

Koin:

```kotlin
class UserRepositoryTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule, testModule)
    }

    private val repository: UserRepository by inject()
}
```

Hiltの `@TestInstallIn` や `@UninstallModules` は、本番モジュールの後に読み込まれるテストモジュールに置き換わります。`HiltTestApplication` とHiltテストランナーを削除してください。[Unit Testing](/docs/reference/koin-test/testing) および [Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing) を参照してください。

## @Inject を使用した段階的な移行 {id="migrate-gradually-with-inject"}

アノテーションを使用する場合、Compiler PluginはJSR-330アノテーションを読み取ります。`@ComponentScan` の対象パッケージ内では、`@Inject constructor` を持つクラスはファクトリになり、`@Singleton`（`jakarta.inject` または `javax.inject`）が付与されたクラスはシングルになります。これらのクラスを変更せずに維持したまま、Gradleモジュール単位で段階的に移行できます。[JSR-330 Annotations](/docs/reference/koin-android/jsr330) を参照してください。

## マルチモジュールプロジェクト {id="multi-module-projects"}

各Gradleモジュールは独自のKoinモジュールを宣言し、アプリモジュールが `startKoin` 内ですべてを読み込みます。設定すべきコンポーネント階層はなく、モジュール間アクセス用の `@EntryPoint` も不要です。`:feature:home` 内の定義は、アプリによって読み込まれた任意の定義を使用できます。

アノテーションを使用する場合、各機能モジュールクラスに `@Module`、`@ComponentScan`、`@Configuration` を付与します。アプリモジュールの `@KoinApplication` は、明示的に列挙することなくそれらを自動検出します。

モジュールの構成、可視性、機能モジュールについては、[Multi-Module Apps](/docs/reference/koin-android/multi-module) で解説されています。

## よくあるパターン {id="common-patterns"}

### アシステッドインジェクション（Assisted injection） {id="assisted-injection"}

Hiltの `@AssistedInject` と `@AssistedFactory` は、注入パラメータ（Injected parameters）に置き換わります。呼び出し元が実行時の値を渡します:

**Compiler Plugin DSL**
```kotlin
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel<UserDetailViewModel>()
}
```

**Annotations**
```kotlin
@KoinViewModel
class UserDetailViewModel(
    @InjectedParam private val userId: String,
    private val repository: UserRepository,
) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
class UserDetailViewModel(
    private val userId: String,
    private val repository: UserRepository,
) : ViewModel()

val appModule = module {
    viewModel { (userId: String) -> UserDetailViewModel(userId, get()) }
}
```

```kotlin
val viewModel: UserDetailViewModel by viewModel { parametersOf("user-42") }
```

[Injected Parameters](/docs/reference/koin-core/injection-parameters) を参照してください。

### Lazy と Provider {id="lazy-and-provider"}

- `dagger.Lazy<T>`: Kotlinの `Lazy<T>` コンストラクタパラメータを使用するか、Androidエントリーポイントで `by inject()` を使用します（[Injection](/docs/reference/koin-core/injection) を参照）。
- `Provider<T>`: 自作クラスからの呼び出しごとに新しいインスタンスを生成するには、[Advanced Patterns](/docs/reference/koin-core/advanced-patterns) のプロバイダパターンを使用します。

### WorkManager {id="workmanager"}

`@HiltWorker` ワーカーは `worker` 定義に置き換わり、`HiltWorkerFactory` は `startKoin` 内の `workManagerFactory()` に置き換わります。[WorkManager](/docs/reference/koin-android/workmanager) を参照してください。

## チェックリスト {id="checklist"}

- [ ] Gradle: Hiltプラグイン、`hilt-android`、`hilt-compiler` を削除する。Koinを追加し、使用する場合は Compiler Plugin も追加する。他に必要がなければkaptを削除する。
- [ ] Application: `@HiltAndroidApp` を削除し、`onCreate()` で `androidContext()` を指定してKoinを開始（`startKoin`）する。
- [ ] モジュール: `@Module` / `@InstallIn` / `@Provides` / `@Binds` をKoinモジュールに変換する。
- [ ] ViewModel: `@HiltViewModel` を削除し、ViewModelを宣言して、`by viewModel()` / `koinViewModel()` を使用する。
- [ ] エントリーポイント: `@AndroidEntryPoint` を削除し、Androidコンポーネントでは `by inject()` を使用する。自作クラスの `@Inject` フィールドはコンストラクタパラメータに移動する。Koinが生成できないフレームワーククラスでのみ `@EntryPoint` を `KoinComponent` に置き換える。
- [ ] クォリファイア: カスタム `@Qualifier` アノテーションを維持する（アノテーションスタイル）、または `named()` に切り替える。
- [ ] ワーカー: `@HiltWorker` と `HiltWorkerFactory` を置き換える。
- [ ] テスト: `@HiltAndroidTest`、`HiltAndroidRule`、Hiltテストランナーを削除し、`KoinTestRule` を使用する。
- [ ] ビルド: Compiler Plugin を使用している場合、ビルドが成功すればグラフが完全であることを意味する。使用していない場合は、[verify()](/docs/reference/koin-test/verify) テストを追加する。
- [ ] 実行: アプリとテストスイートを実行する。

## トラブルシューティング {id="troubleshooting"}

### NoDefinitionFoundException {id="nodefinitionfoundexception"}

リクエストされた型の定義がKoin内に見つかりません。その定義を宣言しているモジュールが `startKoin` で読み込まれているか（または `@Configuration` で検出されているか）、およびリクエストされた型が宣言またはバインドされた型と一致しているかを確認してください。`@Inject constructor` のみを持っていてHiltによって注入されていたクラスも、`@ComponentScan` がJSR-330アノテーション経由で検出しない限り、Koinの定義が必要です。

### 同一の型に対して2つの定義がある場合に誤ったインスタンスが返される {id="wrong-instance-with-two-definitions-of-the-same-type"}

Hiltではクォリファイアの指定漏れはビルドエラーになります。Koinでは、`allowOverride(false)` を指定してKoinを開始しない限り、最後に読み込まれた定義が優先されます。両方の定義と注入ポイントに [クォリファイア](/docs/reference/koin-core/qualifiers) を追加してください。

### 循環依存 {id="circular-dependency"}

2つのクラスが相互に依存しています。循環を解消するようにリファクタリングするか、片方を `Lazy<T>` パラメータにして遅延初期化してください。Compiler Pluginはビルド時に循環依存を報告します。詳細は [Troubleshooting](/docs/reference/koin-core/troubleshooting) を参照してください。

## 関連情報 {id="related"}

- [Koin vs Hilt](/docs/intro/koin-vs-hilt): 2つのフレームワークの違い。
- [JSR-330 Annotations](/docs/reference/koin-android/jsr330): 移行中に `@Inject` と `@Singleton` を維持する方法。
- [Starting Koin on Android](/docs/reference/koin-android/start): `startKoin`、`androidContext()`、ロギングについて。
- [Android Scopes](/docs/reference/koin-android/scope): Activity、Fragment、ViewModelのスコープ。
- [Unit Testing](/docs/reference/koin-test/testing): Hiltテストルールの置き換え。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): Compiler Plugin が検証する内容。