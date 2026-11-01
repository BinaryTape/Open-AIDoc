---
title: Composable のテスト
---

# Composable のテスト

このページでは、Koin を使用してテストする際の Compose 固有の内容について説明します。具体的には、`KoinApplicationPreview` を使用したプレビュー、`ComposeTestRule` を使用した UI テスト、およびマルチプラットフォーム UI テストを扱います。ここでは、`koinInject()` や `koinViewModel()` を使用して Composable にインジェクションする方法をすでに理解していることを前提としています（[Koin for Compose](/docs/reference/koin-compose/compose) を参照）。テストのセットアップ、オーバーライド、および `declareMock` については、[ユニットテスト](/docs/reference/koin-test/testing) で説明されています。

## KoinApplicationPreview を使用したプレビュー {id="previews-with-koinapplicationpreview"}

プレビューでは `Application` クラスが実行されないため、Koin コンテナが存在しません。`KoinApplicationPreview` はプレビュー用のコンテナを作成します。

```kotlin
import org.koin.compose.KoinApplicationPreview

val previewModule = module {
    single<UserRepository> { FakeUserRepository(sampleUsers) }
    viewModel { UserViewModel(get()) }
}

@Preview
@Composable
fun UserScreenPreview() {
    KoinApplicationPreview(application = { modules(previewModule) }) {
        UserScreen()
    }
}
```

`KoinApplicationPreview` は、`startKoin` によって起動されるグローバルなコンテナではなく、`koinApplication` を使用してローカルなコンテナを作成します。各プレビューは独自のインスタンスを取得するため、Android Studio は複数のプレビューを並行してレンダリングできます。

`single<UserRepository> { FakeUserRepository(sampleUsers) }` のようなラムダ定義は、どのスタイルでも機能します。`application` ラムダは `startKoin { }` 内に記述できるあらゆるものを受け付けるため、本番用モジュールを読み込んでプレビューに必要なものだけをオーバーライドすることもできます。

複数の状態をプレビューするには、各プレビューに異なるフェイク（Fake）を持つモジュールを提供します。

```kotlin
@Preview(name = "Error")
@Composable
fun UserScreenErrorPreview() {
    KoinApplicationPreview(application = {
        modules(previewModule, module {
            single<UserRepository> { FailingUserRepository() }
        })
    }) {
        UserScreen()
    }
}
```

同じ関数に複数の `@Preview` アノテーションが付けられている場合（ライトモードとダークモード、フォントスケールなど）、それらは同じモジュールを共有します。

## ComposeTestRule を使用した UI テスト {id="ui-tests-with-composetestrule"}

composition から Koin インスタンスが提供されていない場合、`koinInject()` と `koinViewModel()` はグローバルコンテキストから解決します。`KoinTestRule` で Koin を起動し、コンテンツを設定します。

```kotlin
class UserScreenTest : KoinTest {

    @get:Rule(order = 0)
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { FakeUserRepository(sampleUsers) }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule(order = 1)
    val composeTestRule = createComposeRule()

    @Test
    fun displaysUserList() {
        composeTestRule.setContent {
            UserScreen()
        }

        composeTestRule.onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

テスト対象の Composable に `KoinApplication(configuration = ...)` が含まれている場合、ルールによって開始されたコンテナにアタッチされ、自身の設定は無視されます。テストモジュールが使用されます。

`KoinContext { }` は非推奨（deprecated）であり、不要です。テストコンテンツをこれでラップしないでください。

Android では、これらのテストはインストルメンテーションテスト（または Robolectric を使用）として実行されます。グラフに `Context` が必要な場合は、[Android のインストルメンテーションテスト](/docs/reference/koin-android/instrumented-testing#restart-koin-with-a-test-rule) で示されているように、ルール内に `androidContext(...)` を追加します。

### フェイクとモック {id="fakes-and-mocks"}

フェイクを使用して、画面をそれぞれの状態へと駆動します。

```kotlin
class UserScreenStatesTest : KoinTest {

    private val fakeRepository = FakeUserRepository()

    @get:Rule(order = 0)
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<UserRepository> { fakeRepository }
            viewModel { UserViewModel(get()) }
        })
    }

    @get:Rule(order = 1)
    val composeTestRule = createComposeRule()

    @Test
    fun showsErrorMessage() {
        fakeRepository.shouldFail = true

        composeTestRule.setContent { UserScreen() }

        composeTestRule.waitUntil(timeoutMillis = 5_000) {
            composeTestRule.onAllNodesWithText("Network error")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
}
```

`setContent` の前にフェイクを変更してください。ViewModel は最初の composition 時に作成され、そこからデータを読み込みます。

代わりにモックライブラリを使用する場合は、`setContent` の前に `declareMock<UserRepository> { ... }` を呼び出します（[declareMock によるモック](/docs/reference/koin-test/testing#mocking-with-declaremock) を参照）。

### 分離されたコンテキストを使用する画面 {id="screens-using-an-isolated-context"}

画面が `KoinIsolatedContext` から Koin インスタンスを取得している場合（[分離されたコンテキスト](/docs/reference/koin-compose/isolated-context) を参照）、テストはグローバルコンテキストを必要としません。テストコンテナを構築し、同様の方法で提供します。

```kotlin
@Test
fun sdkScreenUsesTestContainer() {
    val testKoin = koinApplication {
        modules(module { single<SdkApi> { FakeSdkApi() } })
    }

    composeTestRule.setContent {
        KoinIsolatedContext(context = testKoin) {
            SdkScreen()
        }
    }

    composeTestRule.onNodeWithText("Connected").assertIsDisplayed()
    testKoin.close()
}
```

グローバルな状態が関与しないため、これらのテストは並行して実行できます。

## マルチプラットフォーム UI テスト {id="multiplatform-ui-tests"}

`commonTest` では JUnit ルールが使用できません。Compose Multiplatform テストライブラリの `runComposeUiTest` を使用し、`kotlin.test` のアノテーションで Koin を開始および停止します。

```kotlin
// commonTest
@OptIn(ExperimentalTestApi::class)
class UserScreenCommonTest : KoinTest {

    @BeforeTest
    fun before() {
        startKoin {
            modules(module {
                single<UserRepository> { FakeUserRepository(sampleUsers) }
                viewModel { UserViewModel(get()) }
            })
        }
    }

    @AfterTest
    fun after() {
        stopKoin()
    }

    @Test
    fun displaysUserList() = runComposeUiTest {
        setContent { UserScreen() }

        onNodeWithText("Alice").assertIsDisplayed()
    }
}
```

`KoinTest`、`startKoin`、および `declareMock` はマルチプラットフォーム対応です。`KoinTestRule` と `MockProviderRule` は JVM 専用です。[Compose Multiplatform テストガイド](https://kotlinlang.org/docs/multiplatform/compose-test.html) で説明されているようにテストの依存関係を設定し、`commonTest` に `io.insert-koin:koin-test` を追加します。

## 注意点（Pitfalls） {id="pitfalls"}

- ルールの順序: コンテンツが設定される前に Koin が起動している必要があります。`createAndroidComposeRule<MainActivity>()` を使用する場合、Activity はルールによって起動されるため、`KoinTestRule` の `order` をより低く設定してください。
- ViewModel がすでに作成されている場合: 以前の composition で作成された ViewModel は、その依存関係を保持し続けます。`setContent` の前にフェイクまたはモックを変更してください。
- プレビューコンテナはローカル: グローバルコンテキストを読み取るコード（`KoinPlatform.getKoin()`、Compose 外部の `KoinComponent`）からは、`KoinApplicationPreview` コンテナは見えません。

## 関連情報 {id="related"}

- [ユニットテスト](/docs/reference/koin-test/testing): `KoinTestRule`、オーバーライド、および `declareMock`。
- [Android のインストルメンテーションテスト](/docs/reference/koin-android/instrumented-testing): テスト用 Application、Activity とのルールの順序。
- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()` および `KoinApplication`。
- [Compose における ViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` がどのように ViewModel を作成し保持するか。
- [分離されたコンテキスト](/docs/reference/koin-compose/isolated-context): SDK およびライブラリ向けの `KoinIsolatedContext`。