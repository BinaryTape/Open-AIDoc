---
title: 設定の検証
---

# 設定の検証

このページでは、Koin の設定を実行せずに検証するテスト API である `verify()` と、非推奨となった `checkModules()` について解説します。また、これらが Koin Compiler Plugin のコンパイル時チェックとどのように関連しているかを説明し、引き続きテストが必要かどうかを判断できるようにします。事前に [Koin を使用したユニットテスト](/docs/reference/koin-test/testing) の書き方を把握しておくことを推奨します。

## verify() はまだ必要ですか？ {id="do-you-still-need-verify"}

[Koin Compiler Plugin](/docs/reference/koin-compiler/compile-safety) は、不足している定義、クオリファイアの不一致、スコープエラー、`get()` / `inject()` の呼び出し箇所など、ビルド時に依存関係グラフ全体をチェックします。プラグインがプロジェクトをカバーしている場合、`verify()` によるテストを追加するメリットはないため、削除しても問題ありません。

以下のような場合は、引き続き `verify()` が必要です。

- Compiler Plugin を使用していない場合：プラグインなしで Constructor DSL または Classic DSL を使用しているプロジェクト。（アノテーション用の非推奨の KSP プロセッサには、独自の `KOIN_CONFIG_CHECK` オプションがあります。）
- ビルド時にグラフが特定できない場合：プラグインは `if` / `when` や可変長引数（varargs）で構築されたモジュールリストを解決できません。この場合、`KOIN-W003` を報告し、そのエントリーポイントのチェックをスキップします。
- ライブラリモジュール：独自の `startKoin` / `@KoinApplication` を持たないライブラリや機能モジュール（feature module）は、アプリがそれを組み込むまで依存関係の欠落チェックが行われません。ライブラリ内に `verify()` テストを用意することで、単体でチェックできます。
- 遅延モジュール（Lazy modules）：グラフの一部を[遅延モジュール](/docs/reference/koin-core/lazy-modules)でロードしており、設定全体に対して1つのテストを実行したい場合（[通常モジュールと遅延モジュールの併用](#modules-and-lazy-modules-together)を参照）。

## verify() {id="verify"}

`verify()` は `Module` の拡張関数であり、`koin-test` の JVM 環境で利用できます。各定義のクラスのコンストラクタを読み取り、すべてのパラメータの型に対応する定義がそのモジュールまたはインクルードされたモジュール内に存在するかをチェックします。定義を実行することはなく、モックも不要です。

```kotlin
val appModule = module {
    includes(dataModule, networkModule)
    viewModel<UserViewModel>()
}
```

```kotlin
import org.koin.test.verify.verify

class AppModuleCheck {

    @Test
    fun checkKoinModule() {
        appModule.verify()
    }
}
```

依存関係が不足している場合、`verify()` は `MissingKoinDefinitionException` をスローし、修正案を出力します。2つのコンストラクタ間に循環依存がある場合は、`CircularInjectionException` をスローします。

`includes()` でリンクされていない複数のモジュールをチェックするには、`listOf(dataModule, uiModule).verifyAll()` を使用します。

### verify() が合格と判定する条件 {id="what-verify-accepts"}

コンストラクタパラメータは、以下のいずれかに該当する場合にチェックを通過します。

- 宣言済み（Declared）：モジュールツリー内にその型の定義が存在する。
- オプショナル（Optional）：パラメータにデフォルト値がある。定義が存在しない場合、`verify()` は警告を出力します。
- ラップされている（Wrapped）：`T` が宣言されている `Lazy<T>` または `List<T>` である。
- ホワイトリスト登録済み（Whitelisted）：その型が `extraTypes` に含まれているか、基本型（`String`、`Int`、`Long`、`Double`）である。
- インジェクトまたは外部提供（Injected or provided）：パラメータに `@InjectedParam` または `@Provided` アノテーションが付与されているか、`injections` で宣言されている。

`verify()` はコンストラクタのみを読み取ります。クオリファイア、プロパティ、または定義ラムダ内に記述された `get()` の呼び出しはチェックしません。

### 実行時に提供される型 {id="types-provided-at-runtime"}

フレームワークのオブジェクトやプラットフォームによって生成される値など、一部の型はモジュール内で宣言されません。これらは `extraTypes` に追加します。

```kotlin
appModule.verify(
    extraTypes = listOf(HttpClientEngine::class, Clock::class)
)
```

Android では、`koin-android-test` の `androidVerify()` を使用してください。`Context`、`Activity`、`Fragment`、`Application`、`SavedStateHandle`、および `WorkerParameters` が自動的に追加されます。

```kotlin
import org.koin.android.test.verify.androidVerify

@Test
fun checkKoinModule() {
    appModule.androidVerify()
}
```

### インジェクトされるパラメータ {id="injected-parameters"}

`parametersOf()` で渡されるパラメータには定義が存在しないため、`verify()` は不足していると報告します。これらは `injections` で宣言します。

```kotlin
class UserPresenter(val userId: String, val repository: UserRepository)

val presenterModule = module {
    factory { (userId: String) -> UserPresenter(userId, get()) }
}

@Test
fun checkKoinModule() {
    presenterModule.verify(
        injections = injectedParameters(
            definition<UserPresenter>(String::class)
        )
    )
}
```

または、コンストラクタパラメータにアノテーションを付与します。`@InjectedParam` は `parametersOf()` で渡される値を表し、`@Provided` は Koin モジュール外から提供される型を表します。

```kotlin
class UserPresenter(@InjectedParam val userId: String, val repository: UserRepository)

class SyncWorker(@Provided val params: WorkerParameters, val repository: UserRepository)
```

どちらのアノテーションも `koin-core-annotations` で提供されており、Compiler Plugin が読み取るものと同じです（[注入パラメータ](/docs/reference/koin-core/injection-parameters)を参照）。

### 通常モジュールと遅延モジュールの併用 {id="modules-and-lazy-modules-together"}

`koin-test-coroutines` は `ModuleConfiguration` に対する `verify()` を追加します。これにより、通常のモジュールと[遅延モジュール](/docs/reference/koin-core/lazy-modules)を1つのグラフとしてチェックできます。

```kotlin
val configuration = moduleConfiguration {
    modules(coreModule)
    lazyModules(featureModule)
}

@Test
fun checkConfiguration() {
    configuration.verify()
}
```

`moduleConfiguration` およびこの `verify()` は実験的（`@KoinExperimentalAPI`）です。

## checkModules()（非推奨） {id="checkmodules-deprecated"}

:::warning
`checkModules()`、`checkKoinModules()`、およびそれらの DSL は非推奨です。`verify()` または Compiler Plugin への移行を行ってください。
:::

`verify()` とは異なり、`checkModules()` はモジュールを開始してすべての定義をインスタンス化するため、実行時に解決されるすべての値を用意する必要があります。古いプロジェクトで見かけることがあるかもしれません。

```kotlin
@Test
fun checkAllModules() {
    koinApplication {
        modules(appModule)
        checkModules {
            withInstance<Context>()
            withParameter<UserPresenter> { "user-1" }
            withProperty("api_url", "http://localhost")
        }
    }
}

// または
@Test
fun checkAllModules() {
    checkKoinModules(listOf(appModule))
}
```

チェック用 DSL：

- `withInstance(value)`: グラフに `value` を追加します。`withInstance<T>()` は `T` のモックを追加し、`MockProviderRule` が必要になります（[declareMock によるモック](/docs/reference/koin-test/testing#mocking-with-declaremock)を参照）。
- `withParameter<T> { value }`: `T` を生成するために使用されるインジェクトパラメータを指定します。複数ある場合は `withParameters<T> { parametersOf(a, b) }` を使用します。
- `withProperty(key, value)`: Koin プロパティを追加します。
- `withScopeLink(scope, targetScope)`: チェックのために2つのスコープを[リンク](/docs/reference/koin-core/scopes)します。

`verify()` への移行手順：フレームワークの型に対する `withInstance` を削除し（`extraTypes` または `androidVerify()` を使用）、`withParameter` を `injections` または `@InjectedParam` に置き換えます。

## 関連情報 {id="related"}

- [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety): Compiler Plugin がビルド時にチェックする内容。
- [ユニットテスト](/docs/reference/koin-test/testing): テストでの Koin の起動、定義のオーバーライドとモック。
- [注入パラメータ](/docs/reference/koin-core/injection-parameters): `parametersOf` と `@InjectedParam`。
- [遅延モジュール](/docs/reference/koin-core/lazy-modules): バックグラウンドでグラフの一部をロードする。
- [トラブルシューティング](/docs/reference/koin-core/troubleshooting): `NoDefinitionFoundException` などのランタイムエラー。