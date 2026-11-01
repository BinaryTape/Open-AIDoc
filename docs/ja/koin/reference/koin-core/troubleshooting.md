---
title: トラブルシューティング
---

# トラブルシューティング

このページでは、Koinが報告するエラー、その原因、およびそれらの修正方法を一覧で示します。また、問題がユーザーに届く前に発見するためのツールや、これらのエラーを引き起こすパターンについても解説します。エラーメッセージはKoinが出力する通りの内容で記載されているため、スタックトレースのテキストでページ内を検索できます。

## 問題を早期に発見する {id="find-problems-early"}

Koinには、設定エラーを検出するための3つの方法が用意されており、検出タイミングの早い順に以下のようになっています。

- **コンパイル時**: [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)を使用すると、依存関係の欠落や循環依存が存在する場合にビルドが失敗します。エラーには定義、パラメータ、モジュール名が示されます。すべてのチェック項目とエラーコードについては、[コンパイル時の安全性（Compile-Time Safety）](/docs/reference/koin-compiler/compile-safety)を参照してください。
- **IDE内**: [Koin IDE plugin](/docs/tooling/ide-plugin)は、コードを書いている最中に、各定義がどこで宣言され、どこで使用されているか、そして何が不足しているかを表示します。
- **テスト内**: Compiler Pluginを使用しない場合は、JVMユニットテスト内でモジュールに対して `verify()` を呼び出します。これにより、各コンストラクタパラメータに対応する定義が存在するかどうかがチェックされます。[設定の検証（Verify your configuration）](/docs/reference/koin-test/verify)を参照してください。

```kotlin
class ModuleCheckTest {

    @Test
    fun checkKoinModules() {
        appModule.verify()
    }
}
```

## ロギング {id="logging"}

Koinはデフォルトでは何もログ出力しません（`EmptyLogger`）。ロギングを有効にすると、各定義のロードや各インスタンスの解決を確認できます。

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

| レベル | 表示される内容 |
|-------|--------------|
| `Level.DEBUG` | Koinが検索したスコープを含む、すべての解決処理。失敗原因の把握に使用します |
| `Level.INFO` | `Started 42 definitions in 1.2 ms` などの起動概要。`printLogger()` のデフォルトです |
| `Level.WARNING` | ある定義が別の定義をオーバーライドしている場合などの警告 |
| `Level.ERROR` | エラーのみ |
| `Level.NONE` | 出力なし |

Androidでは、`androidLogger(Level.DEBUG)` を使用してLogcatに出力します。ロガーのオプションについては、[Koinの起動（Starting Koin）](/docs/reference/koin-core/starting-koin)を参照してください。

`Level.DEBUG` は解決処理を低速化させます。リリースビルドではなく、デバッグセッションでのみ使用してください。

## ランタイムエラー {id="runtime-errors"}

### No definition found {id="no-definition-found"}

```
NoDefinitionFoundException: No definition found for type 'com.example.UserRepository' on scope '['_root_']'.
Check or add definition for type 'com.example.UserRepository' in scope '_root_'.
```

ロードされたモジュールのいずれにも宣言されていない型が要求されました。以下の順序で確認してください。

- **モジュールがロードされていない**: 定義は存在するが、そのモジュールが `modules(...)` や `includes(...)` に含まれていない。
- **修飾子の欠落**: 定義に修飾子（Qualifier）が付けられているのにリクエスト側で指定されていない、あるいはその逆。その場合、メッセージに `and qualifier '...'` が含まれます。[修飾子（Qualifiers）](/docs/reference/koin-core/qualifiers)を参照してください。
- **インターフェースがバインドされていない**: 定義では `UserRepositoryImpl` を宣言しているが、リクエストでは `UserRepository` を要求している。インターフェースをバインドしてください。[定義（Definitions）](/docs/reference/koin-core/definitions#interface-binding)を参照してください。
- **スコープの誤り**: 定義が特定のスコープ内で `scoped` として宣言されているが、リクエストが別のスコープまたはルートから行われている。メッセージには検索されたスコープが一覧表示されます。[スコープ（Scopes）](/docs/reference/koin-core/scopes)を参照してください。

`SavedStateHandle` の場合、ViewModelの `CreationExtras` によって提供されるというメッセージが表示されます。`koinViewModel()` または `by viewModel()` を使用してViewModelを解決し、コンストラクタパラメータとして `SavedStateHandle` を受け取るようにしてください。[ViewModel](/docs/reference/koin-core/viewmodel)を参照してください。

### Could not create instance {id="could-not-create-instance"}

```
InstanceCreationException: Could not create instance for '[Singleton: 'com.example.UserRepository']'
```

Koinは定義を見つけましたが、インスタンスの作成時に例外がスローされました。真の原因は、スタックトレース内のネストされた例外（`Caused by:`）にあります。多くの場合、コンストラクタパラメータの1つに対する `NoDefinitionFoundException` か、コンストラクタ自体によってスローされた例外です。

### Already existing definition {id="already-existing-definition"}

```
DefinitionOverrideException: Already existing definition for [Singleton: 'com.example.ApiService'] at com.example.ApiService::_root_
```

2つのモジュールが同じ型と同じ修飾子を宣言しており、オーバーライドが無効（`allowOverride(false)`）になっています。重複を削除するか、[修飾子](/docs/reference/koin-core/qualifiers)を付与するか、意図した側の定義に `.override()` を付けてマークしてください。[定義（Definitions）](/docs/reference/koin-core/definitions#overriding-a-definition)を参照してください。

### スコープエラー {id="scope-errors"}

| メッセージ | 例外 | 原因 |
|---------|-----------|-------|
| `Scope 'user_session' is closed` | `ClosedScopeException` | スコープがすでにクローズされているにもかかわらず、何かがそのスコープからインスタンスを取得しようとしています。多くの場合、画面のライフサイクルを超えて生存しているコールバックやコルーチンが原因です |
| `No scope found for id 'user_session'` | `ScopeNotCreatedException` | `createScope(id, ...)` の前に `getScope(id)` が呼び出されました。`getOrCreateScope` を使用するか、先にスコープを作成してください |
| `Scope with id 'user_session' is already created` | `ScopeAlreadyCreatedException` | 同じIDで `createScope` が2回呼び出されました |
| `No value for scope 'user_session' in [Scoped: ...]` | `MissingScopeValueException` | `declare()` で宣言されたスコープ付きの値が、このスコープに提供されていませんでした |
| `Activity should implement AndroidScopeComponent` | `IllegalStateException` | スコープを持たないActivityでAndroidスコープAPIが使用されました。[Androidスコープ](/docs/reference/koin-android/scope)を参照してください |

スコープのライフサイクルについては、[スコープ（Scopes）](/docs/reference/koin-core/scopes)を参照してください。

### 注入パラメータ（Injected parameters） {id="injected-parameters"}

| メッセージ | 例外 | 原因 |
|---------|-----------|-------|
| `Can't get injected parameter #0 from DefinitionParameters[] for type 'kotlin.String'` | `NoParameterFoundException` | 呼び出し側が `parametersOf(...)` で渡していないパラメータを定義側が読み取ろうとしました |
| `No value found for type 'kotlin.String'` | `DefinitionParameterException` | `params.get<T>()` でその型のパラメータが見つかりませんでした |

[注入パラメータ（Injected Parameters）](/docs/reference/koin-core/injection-parameters)を参照してください。

### 起動およびプロパティ {id="start-and-properties"}

| メッセージ | 例外 | 原因 |
|---------|-----------|-------|
| `KoinApplication has not been started` | `IllegalStateException` | `startKoin` の呼び出し前に、グローバルコンテキスト（`KoinComponent`、`by inject()`）が使用されました。Androidの場合、`Application` クラスがマニフェストに宣言されているか確認してください |
| `A Koin Application has already been started` | `KoinApplicationAlreadyStartedException` | `startKoin` が2回呼び出されました。テストでは、各テストの後に `stopKoin()` を呼び出してください |
| `Can't resolve Context instance. Please use androidContext() function in your KoinApplication configuration.` | `MissingAndroidContextException` | 定義が `androidContext()` を使用しているにもかかわらず、`startKoin` に `androidContext(this)` が指定されていません |
| `Property 'api_url' not found` | `MissingPropertyException` | 該当するプロパティが存在せず、デフォルト値も指定されていない状態で `getProperty("api_url")` が呼び出されました |
| `No properties found for file '/koin.properties'` | `NoPropertyFileFoundException` | `fileProperties()` が対象ファイルを見つけられませんでした |

### Compiler Pluginが適用されていない {id="compiler-plugin-not-applied"}

```
NotImplementedError: Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.
```

コードではCompiler Plugin DSL（`single<T>()`、`factory<T>()`、`startKoin<T>()`）が使用されていますが、このGradleモジュールにプラグインが適用されていません。[Compiler Pluginのセットアップ](/docs/setup/compiler-plugin)を参照してください。

## 循環依存 {id="circular-dependencies"}

循環依存は、2つのクラスがそれぞれのコンストラクタで相互に必要とし合う場合に発生します。

```kotlin
class SessionManager(private val authService: AuthService)
class AuthService(private val sessionManager: SessionManager)
```

Compiler Pluginを使用している場合、ビルドは失敗します。

```
[Koin][KOIN-D004] Circular dependency detected:
  com.example.AuthService → com.example.SessionManager → com.example.AuthService
  Break with Lazy<T> injection or refactor to remove the cycle.
```

`verify()` を使用している場合、テストは `Circular injection between ... Fix your Koin configuration!` で失敗します。

これらのチェックがない場合、Koinは循環を検出できません。各クラスが互いを解決し続けてコールスタックがオーバーフローし、アプリは `StackOverflowError` でクラッシュします。

### Lazyで循環を解消する {id="break-the-cycle-with-lazy"}

一方をLazyにして、コンストラクタの実行時ではなく初回使用時に解決されるようにします。

**Compiler Plugin DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single<SessionManager>()
    single<AuthService>()
}
```

**アノテーション**
```kotlin
@Singleton
class SessionManager(private val authService: AuthService)

@Singleton
class AuthService(private val sessionManager: Lazy<SessionManager>)
```

**コンストラクタ / クラシックDSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single { SessionManager(get()) }
    single { AuthService(inject()) }
}
```

`AuthService` は、コンストラクタや `init` ブロック内で `sessionManager.value` を読み取ってはなりません。そうすると循環が再発します。

### 循環を取り除く {id="remove-the-cycle"}

Lazyパラメータは問題を隠蔽しますが、結合度は維持されたままです。ほとんどの循環依存は、両方のクラスが共通の責務を共有していることを意味します。その責務を両方が依存する第3のクラスに移動するか、一方のクラスが必要とするものだけを公開するインターフェースに依存するようにリファクタリングしてください。

```kotlin
class TokenStore

class SessionManager(private val tokenStore: TokenStore)
class AuthService(private val tokenStore: TokenStore)
```

## エラーの原因となるパターン {id="patterns-that-cause-errors"}

**メソッド内での解決**: クラスの本体内部で `get()` や `KoinComponent` を呼び出すと、その依存関係が見えなくなります。Compiler Pluginでそれらをチェックできず、定義の欠落はメソッドが実行されたときに初めて失敗します。コンストラクタパラメータを優先してください。これらが必要となるケースについては、[KoinComponent](/docs/reference/koin-core/koin-component)を参照してください。

```kotlin
// 隠れた依存関係、遅延して解決される
class UserViewModel : ViewModel(), KoinComponent {
    fun loadUser() {
        val repository = get<UserRepository>()
    }
}

// 可視化された依存関係、ビルド時にチェックされる
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**依存関係を独自に作成する**: クラス内で `private val api = ApiService()` のようにインスタンス化すると、Koinをバイパスしてしまいます。そのクラスはフェイク（Fake）を使用したテストができなくなり、依存関係もチェックされません。

**異なる型に対する修飾子（Qualifier）**: 修飾子が必要となるのは、複数の定義が同じ型を提供する場合のみです。`UserRepository` と `OrderRepository` はすでに異なる型です。

**定義内での重い処理**: 定義はオブジェクトを作成するべきであり、ロジックを実行するべきではありません。`single { }` ラムダ内の副作用は予測できないタイミング（初回使用時）で実行され、`createdAtStart` の場合はメインスレッドで実行されます。処理はクラス内にとどめるか、起動時の処理を[Lazy Modules](/docs/reference/koin-core/lazy-modules)に移行してください。

**アプリ全体で1つのモジュール**: 1つの巨大なモジュールは、テストでオーバーライドしたり遅延ロードしたりするのが困難です。機能やレイヤーごとに分割してください。[モジュール（Modules）](/docs/reference/koin-core/modules)を参照してください。

**クローズ後も保持されるスコープ付きインスタンス**: `single` や静的フィールドにスコープ付きインスタンスの参照が保存されていると、スコープがクローズされた後も生存し続け、その後の呼び出しで `ClosedScopeException` が発生する可能性があります。スコープ付きインスタンスは、同じスコープまたはより生存期間の短いオブジェクトにのみ注入してください。

:::tip
起動時の低速な解決、決してクローズされないスコープ、稀なパスでのクラッシュなど、一部の問題は実機でのみ発生します。実際のユーザーセッションでこれらを確認するには、[本番環境のモニタリング（Production Monitoring）](/docs/tooling/production-monitoring)を参照してください。
:::

## 関連情報 {id="related"}

- [コンパイル時の安全性（Compile-Time Safety）](/docs/reference/koin-compiler/compile-safety): すべてのビルド時チェックとそのエラーコード。
- [設定の検証（Verify your configuration）](/docs/reference/koin-test/verify): Compiler Pluginを使用せずにテスト内でモジュールをチェックする。
- [Koinの起動（Starting Koin）](/docs/reference/koin-core/starting-koin): ロガーおよび起動オプション。
- [スコープ（Scopes）](/docs/reference/koin-core/scopes): スコープのライフサイクルとクローズ。
- [IDEプラグイン（IDE Plugin）](/docs/tooling/ide-plugin): コーディング中に依存関係グラフを確認する。