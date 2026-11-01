---
title: Androidインストルメンテーションテスト
---

# Androidインストルメンテーションテスト

インストルメンテーションテスト（Instrumented test）は、デバイスまたはエミュレータ上で、実際の本番用`Application`の内部で実行されます。テストが開始される時点でKoinはすでに`Application.onCreate()`によって起動されているため、本番用の定義をテスト用の定義にどのように置き換えるかが課題となります。このガイドでは、そのためのセットアップ方法と、Activity、Fragment、スコープのテストについて説明します。一般的なテクニック（`KoinTest`、`KoinTestRule`、`declareMock`）については、[単体テスト（Unit Testing）](/docs/reference/koin-test/testing)で説明されています。

## 依存関係 {id="dependencies"}

```kotlin
dependencies {
    androidTestImplementation("io.insert-koin:koin-test-junit4")
}
```

`koin-test-junit4`は`koin-test`を取り込みます。バージョンはKoin BOMから提供されます。[Gradleのセットアップ](/docs/setup/gradle)を参照してください。

## セットアップの選択 {id="choose-a-setup"}

| セットアップ | Koinの起動元 | 使用するケース |
|-------|--------------------|-------------|
| [テスト用Application](#use-a-test-application) | テスト用の`Application`クラス | すべてのテストで同じテスト設定を共有する場合 |
| [テストルール](#restart-koin-with-a-test-rule) | 各テスト前の`KoinTestRule` | テストクラスごとに固有のモジュールが必要な場合 |
| [オーバーライドのロード](#load-overrides-into-the-running-container) | 本番用の`Application` | 一部の定義のみを置き換える場合 |

## テスト用Applicationの使用 {id="use-a-test-application"}

`androidTest`内に、本番用モジュールに加えてテスト用モジュールを含めてKoinを起動する`Application`を作成します。テストモジュールは最後にロードされるため、その定義が本番用の定義を置き換えます。

**コンパイラプラグインDSL**
```kotlin
// src/androidTest 内
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@TestApplication)
            modules(appModule, instrumentedTestModule)
        }
    }
}
```

**アノテーション**
```kotlin
// src/androidTest 内
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp> {
            androidContext(this@TestApplication)
            modules(instrumentedTestModule)
        }
    }
}
```

`startKoin<MyApp>`は、まず`@KoinApplication`クラスのモジュールをロードし、次にラムダ内で宣言されたモジュールをロードします。

**コンストラクタ / クラシックDSL**
```kotlin
// src/androidTest 内
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@TestApplication)
            modules(appModule, instrumentedTestModule)
        }
    }
}
```

```kotlin
val instrumentedTestModule = module {
    single<ApiService> { FakeApiService() }
}
```

`single<ApiService> { FakeApiService() }`のようなラムダ定義は、どのスタイルでも機能します。

この`Application`を使用してテストを実行するには、カスタムの[AndroidJUnitRunner](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner)を作成します。

```kotlin
class InstrumentationTestRunner : AndroidJUnitRunner() {
    override fun newApplication(
        classLoader: ClassLoader?,
        className: String?,
        context: Context?
    ): Application {
        return super.newApplication(classLoader, TestApplication::class.java.name, context)
    }
}
```

これを`build.gradle.kts`に登録します。

```kotlin
android {
    defaultConfig {
        testInstrumentationRunner = "com.example.app.InstrumentationTestRunner"
    }
}
```

## テストルールによるKoinの再起動 {id="restart-koin-with-a-test-rule"}

`KoinTestRule`は実行中のKoinコンテナを閉じ、各テストの前に新しいコンテナを起動し、テスト後に停止します。このコンテナを起動するのは`Application`ではないため、Androidコンテキストは手動で渡す必要があります。

```kotlin
import androidx.test.core.app.ApplicationProvider
import org.koin.android.ext.koin.androidContext
import org.koin.test.KoinTestRule

@RunWith(AndroidJUnit4::class)
class LoginActivityTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        androidContext(ApplicationProvider.getApplicationContext())
        modules(appModule, loginTestModule)
    }
}
```

アノテーションを使用する場合は、[単体テスト](/docs/reference/koin-test/testing#junit-4-kointestrule)と同様に、`modules(appModule)`の代わりに`withConfiguration<MyApp>()`を使用します。

プロセスの開始時に、本番用の`Application`によって`startKoin`が1回実行されます。ルールはそのコンテナを置き換えるため、`Application`の`onCreate()`内で解決されたものはすべて、閉じられた古いコンテナのインスタンスを保持することになります。もし`Application`が起動時に依存関係を解決する場合は、それを行わない[テスト用Application](#use-a-test-application)の使用を推奨します。

## 実行中のコンテナへのオーバーライドのロード {id="load-overrides-into-the-running-container"}

本番用`Application`を維持したまま一部の定義のみを変更するには、テスト対象の画面が起動する前に、実行中のコンテナにテストモジュールをロードします。

```kotlin
@RunWith(AndroidJUnit4::class)
class ProfileFragmentTest : KoinTest {

    private val profileTestModule = module {
        single<UserRepository> { FakeUserRepository() }
    }

    @Before
    fun before() {
        loadKoinModules(profileTestModule)
    }
}
```

これは最も軽量なセットアップですが、最も多くの落とし穴が存在します。

- リセットされない: オーバーライドはプロセス内の以降のすべてのテストに残ります。
- アンロードは削除であり、復元ではない: `unloadKoinModules(profileTestModule)`は`UserRepository`の定義を削除します。本番用の定義が復元されるわけではありません。
- 作成されたインスタンスは保持される: すでに本番用`UserRepository`を受け取った`single`インスタンスは、それを保持し続けます。

テストごとにクリーンなグラフが必要な場合は、代わりに[テストルール](#restart-koin-with-a-test-rule)を使用してください。

## モックとフェイク {id="mocks-and-fakes"}

`declareMock`は、単体テストと同様にインストルメンテーションテストでも機能します。`KoinTest`を実装し、`MockProviderRule`を登録します（[declareMockによるモック](/docs/reference/koin-test/testing#mocking-with-declaremock)を参照）。MockKを使用する場合は、デバイス上で`io.mockk:mockk-android`アーティファクトを使用してください。

デバイス上では、多くの場合フェイク（Fake）を使用する方がシンプルです。モックライブラリを必要とせず、本物のクラスのように動作します。フェイクはテストモジュールで宣言します。Roomの場合は、各テストが空の状態で開始されるようにインメモリデータベースを使用します。

```kotlin
val testDatabaseModule = module {
    single {
        Room.inMemoryDatabaseBuilder(androidContext(), AppDatabase::class.java).build()
    }
    single { get<AppDatabase>().userDao() }
}
```

## ActivityおよびFragmentのテスト {id="activity-and-fragment-tests"}

ActivityやFragmentは、`by inject()`や`by viewModel()`を使用して依存関係を解決します（[エントリーポイント](/docs/reference/koin-android/entry-points)を参照）。テストでは、テストコンテナが保持しているものを受け取るため、Koinが設定された後に起動してください。

```kotlin
@RunWith(AndroidJUnit4::class)
class LoginActivityTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        androidContext(ApplicationProvider.getApplicationContext())
        modules(appModule, module {
            single<AuthService> { FakeAuthService(acceptedEmail = "user@example.com") }
        })
    }

    @Test
    fun successfulLoginShowsWelcomeMessage() {
        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withId(R.id.email)).perform(typeText("user@example.com"))
            onView(withId(R.id.loginButton)).perform(click())

            onView(withId(R.id.successMessage)).check(matches(isDisplayed()))
        }
    }
}
```

Fragmentの場合も同様に、`androidx.fragment:fragment-testing`の`launchFragmentInContainer<ProfileFragment>()`を使用してテストできます。`LoginActivity`が`by viewModel()`で取得する`LoginViewModel`は、`FakeAuthService`を使用してKoinによって生成されます。

実行中のコンポーネントからViewModelや依存関係を読み取るには、`scenario.onActivity { activity -> ... }`を使用し、その中でアクセスします。そのブロックの外では、Activityがまだ存在していない可能性があります。

## スコープ {id="scopes"}

[Androidスコープ](/docs/reference/koin-android/scope)は、そのActivityまたはFragmentが生存している間のみ存在します。コンポーネントを経由してテストしてください。

```kotlin
val checkoutTestModule = module {
    activityScope {
        scoped { CheckoutState() }
    }
}

@Test
fun fragmentSharesTheActivityScope() {
    ActivityScenario.launch(CheckoutActivity::class.java).use { scenario ->
        scenario.onActivity { activity ->
            val activityState = activity.scope.get<CheckoutState>()

            activity.supportFragmentManager.commitNow {
                replace(R.id.container, PaymentFragment())
            }
            val fragment = activity.supportFragmentManager
                .findFragmentById(R.id.container) as PaymentFragment

            assertSame(activityState, fragment.scope.get<CheckoutState>())
        }
    }
}
```

`activity.scope`および`fragment.scope`は、コンポーネントが`AndroidScopeComponent`を実装している場合に使用できます（例: `ScopeActivity`や`ScopeFragment`）。Activityが作成される前、または破棄された後に`scope.get()`を呼び出すと失敗します。スコープがまだ存在しないか、すでに閉じられているためです。

Androidコンポーネントに関連付けられていないスコープの場合は、JVM単体テストで十分です。[単体テスト](/docs/reference/koin-test/testing#test-scoped-definitions)を参照してください。

## マルチモジュールアプリ {id="multi-module-apps"}

[マルチモジュールアプリ](/docs/reference/koin-android/multi-module)では、テスト対象の機能モジュールとそれが必要とするコアモジュールをロードし、最後にテスト用のオーバーライドをロードします。

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    androidContext(ApplicationProvider.getApplicationContext())
    modules(
        networkModule,
        databaseModule,
        loginModule,
        homeModule,
        module { single<ApiService> { FakeApiService() } }
    )
}
```

複数の機能で使用されるフェイクやテストモジュールを配置するには、共有の`androidTest`ソースセットまたは`:core:testing` Gradleモジュールが適しています。

アプリの一部のみをロードした場合、アプリ全体で提供される依存関係が定義で見つからない可能性があります。[コンパイラプラグイン](/docs/reference/koin-compiler/compile-safety)はビルド時に本番用のグラフをチェックしますが、テストモジュールはチェックしません。テスト設定をチェックするには、JVMテストで[verify()](/docs/reference/koin-test/verify)を使用してください。

## Espressoとルールの順序 {id="espresso-and-rule-order"}

`ActivityScenarioRule`は、テストメソッドが実行される前にActivityを起動します。これが`KoinTestRule`の前に実行されると、Activityは誤ったコンテナから依存関係を解決してしまいます。順序を明示的に指定してください。

```kotlin
@RunWith(AndroidJUnit4::class)
@LargeTest
class CheckoutFlowTest {

    @get:Rule(order = 0)
    val koinTestRule = KoinTestRule.create {
        androidContext(ApplicationProvider.getApplicationContext())
        modules(appModule, module {
            single<CartRepository> { FakeCartRepository() }
            single<PaymentService> { FakePaymentService() }
        })
    }

    @get:Rule(order = 1)
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun completeCheckout() {
        onView(withId(R.id.cartButton)).perform(click())
        onView(withId(R.id.checkoutButton)).perform(click())
        onView(withId(R.id.completeOrderButton)).perform(click())

        onView(withId(R.id.confirmationMessage)).check(matches(isDisplayed()))
    }
}
```

`@get:Rule(order = ...)`にはJUnit 4.13以降が必要です。古いバージョンの場合は、`RuleChain.outerRule(koinTestRule).around(activityRule)`を使用してください。

## Compose UIテスト {id="compose-ui-tests"}

Compose画面については、[Composableのテスト](/docs/reference/koin-compose/compose-testing)を参照してください。

## テスト間の分離 {id="isolation-between-tests"}

単体では成功するものの、まとめて実行すると失敗するテストは、通常Koinを介して状態を共有してしまっています。

- テストごとに再起動する: `KoinTestRule`は、新しい`single`インスタンスを持つ新しいコンテナをテストごとに提供します。
- フェイクをリセットする: [テスト用Application](#use-a-test-application)を使用する場合、コンテナは実行全体を通して生存します。`single`として宣言されたフェイクはテスト間でデータを保持するため、`reset()`メソッドを用意して`@Before`で呼び出してください。
- オーバーライドを累積させない: `loadKoinModules`でロードされたモジュールはロードされたままになります（[実行中のコンテナへのオーバーライドのロード](#load-overrides-into-the-running-container)を参照）。

```kotlin
@RunWith(AndroidJUnit4::class)
class UserListTest : KoinTest {

    private val fakeRepository: FakeUserRepository by inject()

    @Before
    fun before() {
        fakeRepository.reset()
    }
}
```

`by inject<FakeUserRepository>()`は、テストモジュールがフェイクを自身の型にもバインドしている場合にのみ機能します: `single { FakeUserRepository() } bind UserRepository::class`

## トラブルシューティング {id="troubleshooting"}

### KoinApplicationAlreadyStartedException {id="koinapplicationalreadystartedexception"}

コンテナの実行中に2回目の`startKoin`呼び出しが実行されました。インストルメンテーションテストでは、`Application`がすでにKoinを起動しています。実行中のコンテナを最初に閉じる`KoinTestRule`を使用するか、[テスト用Application](#use-a-test-application)を使用してください。`@Before`で`startKoin`を呼び出さないでください。

### テスト定義が使用されない {id="the-test-definition-is-not-used"}

- ロード順序: テストモジュールは、同じ型を宣言している本番モジュールの後にロードする必要があります。
- オーバーライドが無効化されている: Koinが`allowOverride(false)`で起動されている場合は、テスト定義に`.override()`をマークしてください（[定義](/docs/reference/koin-core/definitions#overriding-a-definition)を参照）。
- インスタンスがすでに作成されている: オーバーライドの前に作成された`single`インスタンスは、古い依存関係を保持し続けます。テストルールを使用してKoinを再起動してください。
- ルールの順序: Koinが設定される前にActivityが起動されました（[Espressoとルールの順序](#espresso-and-rule-order)を参照）。

### スコープ定義に対するNoDefinitionFoundException {id="nodefinitionfoundexception-for-a-scoped-definition"}

解決時にスコープが開いていませんでした。スコープ定義は、Activityが生存している間に`scenario.onActivity { }`の内部で解決し、定義が正しいスコープ（`activityScope`、`fragmentScope`）で宣言されていることを確認してください。

## 関連情報 {id="related"}

- [単体テスト](/docs/reference/koin-test/testing): `KoinTest`、`KoinTestRule`、`declareMock`、およびオーバーライド。
- [Composableのテスト](/docs/reference/koin-compose/compose-testing): Compose UIテストとプレビュー。
- [設定の検証](/docs/reference/koin-test/verify): `verify()`と`androidVerify()`。
- [Androidスコープ](/docs/reference/koin-android/scope): Activity、Fragment、およびViewModelのスコープ。
- [AndroidでのKoinの開始](/docs/reference/koin-android/start): `Application`での`startKoin`。