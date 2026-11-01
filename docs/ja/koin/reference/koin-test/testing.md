---
title: ユニットテスト
---

# ユニットテスト

このガイドでは、Koin を使用して JVM ユニットテストを作成する方法を説明します。テストごとのコンテナの起動と停止、インスタンスの取得、定義のオーバーライド、依存関係のモックへの置き換えなどを扱います。本ガイドはあらゆるテスト手法のリファレンスとなります。各プラットフォームのページ（[Android 計測テスト](/docs/reference/koin-android/instrumented-testing)、[Compose](/docs/reference/koin-compose/compose-testing)、[Ktor](/docs/reference/koin-ktor/ktor-testing)）では、それらに特有の事項のみをカバーしています。[Koin の起動方法](/docs/reference/koin-core/starting-koin)および[定義](/docs/reference/koin-core/definitions)の宣言方法を理解している必要があります。

## 依存関係 {id="dependencies"}

テストの依存関係に `koin-test` と、使用する JUnit バージョンのアーティファクトを追加します。

```kotlin
dependencies {
    testImplementation("io.insert-koin:koin-test")
    // いずれかを選択
    testImplementation("io.insert-koin:koin-test-junit4")
    testImplementation("io.insert-koin:koin-test-junit5")
}
```

バージョンは Koin BOM から取得されます。[Gradle のセットアップ](/docs/setup/gradle)を参照してください。`koin-test` はモックライブラリに依存していないため、Mockito、MockK、またはその他の任意のライブラリをプラグインとして組み込めます（[declareMock によるモック作成](#mocking-with-declaremock)を参照）。

## KoinTest {id="kointest"}

テストクラスに `KoinTest` を実装します。これによりクラスが [KoinComponent](/docs/reference/koin-core/koin-component) になるため、テスト内で直接 `get()` や `by inject()` を使用できるようになります。

```kotlin
import org.koin.test.KoinTest
import org.koin.test.get
import org.koin.test.inject

class UserServiceTest : KoinTest {

    // 初回アクセス時に解決される
    private val userService: UserService by inject()

    @Test
    fun `finds a known user`() {
        startKoin { modules(appModule) }

        val repository = get<UserRepository>()

        assertNotNull(userService.findUser("alice"))
        assertSame(repository, userService.repository)

        stopKoin()
    }
}
```

`KoinTest` は、`startKoin` によって作成されるグローバルな Koin コンテキストで動作します。`Application` クラスが Koin を起動する Android 計測テストには適用されません。[Android 計測テスト](/docs/reference/koin-android/instrumented-testing)を参照してください。

## テストごとの Koin の起動と停止 {id="start-and-stop-koin-for-each-test"}

各テストは独自のコンテナを起動し、終了時に停止する必要があります。コンテナが実行されたままになっていると、次の `startKoin` が `KoinApplicationAlreadyStartedException` で失敗し、テスト間でインスタンスがリークしてしまいます。

アプリと同じ設定を読み込みます。

**コンパイラプラグイン DSL**
```kotlin
class UserServiceTest : KoinTest {

    @Before
    fun before() {
        startKoin { modules(appModule) }
    }

    @After
    fun after() {
        stopKoin()
    }
}
```

**アノテーション**
型付けされた API を使用して、アプリの `@KoinApplication` クラスを起動します。

```kotlin
import org.koin.plugin.module.dsl.startKoin

class UserServiceTest : KoinTest {

    @Before
    fun before() {
        startKoin<MyApp>()
    }

    @After
    fun after() {
        stopKoin()
    }
}
```

一部のモジュールのみを読み込むには、通常の `startKoin { }` 内で `module<DataModule>()` または `modules(DataModule::class, CacheModule::class)` を使用します。

**コンストラクタ / クラシック DSL**
```kotlin
class UserServiceTest : KoinTest {

    @Before
    fun before() {
        startKoin { modules(appModule) }
    }

    @After
    fun after() {
        stopKoin()
    }
}
```

`@After` を記述せずに Koin を停止するには、`AutoCloseKoinTest` を継承するか、`ClosingKoinTest` を実装します。どちらも各テストの後に `stopKoin()` を呼び出します。JUnit 5 バージョンは `org.koin.test.junit5` に配置されています。

以下の JUnit ルールおよび機能拡張（extension）を使用すると、起動と停止が自動化され、より短く記述できます。

## JUnit 4: KoinTestRule {id="junit-4-kointestrule"}

`KoinTestRule`（`koin-test-junit4` から提供）は、各テストの前に Koin を起動し、後に停止します。

```kotlin
import org.koin.test.KoinTestRule

class UserServiceTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        printLogger()
        modules(appModule)
    }

    private val userService: UserService by inject()

    @Test
    fun `finds a known user`() {
        assertNotNull(userService.findUser("alice"))
    }
}
```

ラムダ式は通常の `KoinApplication` 宣言です。`startKoin { }` に記述するすべてのものがここで動作します。アノテーションを使用している場合は、`withConfiguration<MyApp>()` でアプリを読み込みます。

```kotlin
import org.koin.plugin.module.dsl.withConfiguration

@get:Rule
val koinTestRule = KoinTestRule.create {
    withConfiguration<MyApp>()
}
```

テストの開始時に Koin コンテナがすでに実行されている場合、ルールはまずそれを閉じます。起動されたインスタンスは `koinTestRule.koin` として利用可能です。

## JUnit 5: KoinTestExtension {id="junit-5-kointestextension"}

`KoinTestExtension`（`koin-test-junit5` から提供）は、JUnit 5 に対しても同様のことを行います。`@JvmField` と `@RegisterExtension` を使って登録します。

```kotlin
import org.koin.test.junit5.KoinTestExtension

class UserServiceTest : KoinTest {

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(appModule)
    }

    private val userService: UserService by inject()

    @Test
    fun `finds a known user`() {
        assertNotNull(userService.findUser("alice"))
    }
}
```

また、このエクステンションはテスト関数のパラメータとして `Koin` インスタンスを渡すこともできます。

```kotlin
@Test
fun `resolves from the test container`(koin: Koin) {
    assertNotNull(koin.get<UserRepository>())
}
```

## テスト用の定義のオーバーライド {id="override-definitions-for-a-test"}

本番環境の定義を置き換えるには、本番モジュールの後にテストモジュールをロードします。最後にロードされたモジュールが優先されます。

```kotlin
val testModule = module {
    single<ApiService> { FakeApiService() }
}

@get:Rule
val koinTestRule = KoinTestRule.create {
    modules(appModule, testModule)
}
```

`single<ApiService> { FakeApiService() }` のようなラムダ定義はすべてのスタイルで機能するため、アプリがコンパイラプラグイン DSL やアノテーションを使用していても、この方法でテストモジュールを記述できます。

アプリが `allowOverride(false)` で Koin を起動している場合は、各テスト定義に `.override()` を指定してください。オーバーライドのルールは[定義](/docs/reference/koin-core/definitions#overriding-a-definition)で説明されています。

## declareMock によるモック作成 {id="mocking-with-declaremock"}

`declareMock<T>()` は `T` のモックを作成し、既存の定義の代わりに実行中のコンテナに登録して、それを返します。これ以降、`T` に依存するすべての定義はモックを受け取ります。

Koin 自体はモックを作成しません。まずモックプロバイダを登録します。

```kotlin
// JUnit 4, Mockito
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    Mockito.mock(clazz.java)
}

// JUnit 4, MockK
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    mockkClass(clazz)
}

// JUnit 5
@JvmField
@RegisterExtension
val mockProvider = MockProviderExtension.create { clazz ->
    mockkClass(clazz)
}
```

次に、オプションのスタブブロックを付けてテスト内でモックを宣言します。

```kotlin
import org.koin.test.mock.declareMock

class UserServiceTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(appModule)
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz -> mockkClass(clazz) }

    private val userService: UserService by inject()

    @Test
    fun `returns the user from the repository`() {
        val repository = declareMock<UserRepository> {
            every { findUser("alice") } returns User("alice")
        }

        assertEquals("alice", userService.findUser("alice")?.name)
        verify { repository.findUser("alice") }
    }
}
```

`declareMock` は定義と同じオプションを受け取ります。

- `qualifier`: [修飾子付き（qualified）](/docs/reference/koin-core/qualifiers)の定義を置き換えます（例: `declareMock<Database>(named("local"))`）。
- `secondaryTypes`: モックを他の型にもバインドします（例: `declareMock<UserRepositoryImpl>(secondaryTypes = listOf(UserRepository::class))`）。

モックはルートスコープ内の単一インスタンスとして保持されます。スコープ内の定義をモック化するには、そのスコープに対して `declareMock` を呼び出します（`scope.declareMock<CartState>()`）。

:::warning
モックは、それを使用するクラスが最初に解決される前に宣言してください。すでに作成されている `single` は、受け取った依存関係を保持し続けます。
:::

## declare によるインスタンスの宣言 {id="declare-an-instance-with-declare"}

モックの代わりに実際の実装や手動で作成したインスタンスが必要な場合は、`declare` を使用して実行中のコンテナに登録します。

```kotlin
import org.koin.test.mock.declare

@Test
fun `uses a fixed clock`() {
    declare<Clock> { FixedClock(at = "2026-01-01T00:00:00Z") }

    assertEquals(2026, get<ReportService>().currentYear())
}
```

`declare` はその型の既存の定義をオーバーライドし、`qualifier` を受け取り、宣言されたインスタンスを返します。グローバルコンテキストを使用するため、Koin が起動した後に呼び出してください。

## スコープ付き定義のテスト {id="test-scoped-definitions"}

スコープを独自に作成し、そこから解決してから閉じます。

```kotlin
@Test
fun `cart state lives in its scope`() {
    val scope = getKoin().createScope<CheckoutSession>("checkout-1")

    val state = scope.get<CartState>()
    assertSame(state, scope.get<CartState>())

    scope.close()
}
```

スコープ API については、[スコープ](/docs/reference/koin-core/scopes)を参照してください。Android では、Activity や Fragment にバインドされたスコープはコンポーネント自体とともにテストされます。[Android 計測テスト](/docs/reference/koin-android/instrumented-testing#scopes)を参照してください。

## 設定のチェック {id="check-your-configuration"}

ユニットテストは振る舞いを検証します。すべての定義のすべての依存関係が宣言されていることを確認するには、ビルド時に [Koin コンパイラプラグイン](/docs/reference/koin-compiler/compile-safety) を使用するか、`verify()` テスト API を使用します。[設定の検証](/docs/reference/koin-test/verify)を参照してください。

## 制限事項 {id="limits"}

- グローバルコンテキスト: `startKoin`、`KoinTestRule`、`KoinTestExtension` はすべて単一のグローバルコンテキストを使用します。Koin を起動するテストは、同一 JVM 内で並列実行できません。並列テストには、[分離されたコンテキスト（isolated context）](/docs/reference/koin-core/context-isolation)を使用してください。`getKoin()` をオーバーライドしない限り、`KoinTest` の `get()` および `inject()` はグローバルコンテキストを読み取ります。
- モックプロバイダ: `MockProviderRule` または `MockProviderExtension` が登録されていない場合、`declareMock` は失敗します。
- オーバーライドはテスト全体で有効: テストモジュール、`declareMock`、または `declare` で置き換えられた定義は、Koin が停止したときにのみリセットされます。

## 関連情報 {id="related"}

- [設定の検証](/docs/reference/koin-test/verify): `verify()` とコンパイル時の安全性との関係。
- [Android 計測テスト](/docs/reference/koin-android/instrumented-testing): `Application` が Koin を起動するテスト。
- [Composable のテスト](/docs/reference/koin-compose/compose-testing): Compose UI テストとプレビュー。
- [Ktor のテスト](/docs/reference/koin-ktor/ktor-testing): Koin を使用した `testApplication`。
- [コンテキストの分離](/docs/reference/koin-core/context-isolation): ライブラリおよび並列テスト用のプライベート Koin コンテナ。
- [JUnit テスト クイックスタート](/docs/quickstart/junit-test): 完全なサンプルプロジェクト。