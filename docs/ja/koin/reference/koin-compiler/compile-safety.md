---
title: コンパイル時の安全性
---

# コンパイル時の安全性

Koin Compiler Pluginは、コードのコンパイル時に依存関係グラフをチェックします。定義の不足、修飾子（qualifier）の誤り、循環依存などがある場合、実行時にクラッシュするのではなく、該当するファイルと行番号を示してビルドを失敗させます。このページでは、チェックされる内容、詳細な診断情報、およびプラグインがチェックできないケースについて説明します。なお、プラグインがインストールされていることを前提としています（[Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照）。

コンパイル時の安全性チェックは、デフォルトで有効になっています（`compileSafety = true`、[Compiler Plugin Options](/docs/reference/koin-annotations/options) を参照）。

## チェックが実行される場所 {id="where-the-checks-run"}

プラグインは2つのレベルでチェックを行います。

**フルグラフ**: 各Koinエントリーポイントにおいて、プラグインはソースコードおよび依存関係のJARからエントリーポイントがロードするすべてのモジュールを組み立て、その完全なグラフに対してすべての定義をチェックします。

**呼び出し箇所（Call sites）**: すべての `get<T>()`、`inject<T>()`、`koinInject<T>()`、`koinViewModel<T>()`、`by viewModel()` および同様の呼び出しがチェックされます。すなわち、組み立てられたグラフ内に `T` が存在している必要があります。機能モジュール（feature module）が呼び出しを行っているもののフルグラフを参照できない場合、プラグインはコンパイルされたモジュール内にヒントを残します。アプリモジュールは依存関係からこれらのヒントを読み取り、自身のコンパイル時にそれらをチェックします。

認識されるエントリーポイント:

| エントリーポイント | 例 |
|-------------|---------|
| `startKoin` | `startKoin<MyApp>()`, `startKoin { modules(appModule) }` |
| `koinApplication` | `koinApplication { modules(appModule) }` |
| `koinConfiguration` | `koinConfiguration<MyApp>()` |
| `@KoinApplication` | `@KoinApplication object MyApp` |
| `withConfiguration<T>()` | `startKoin { withConfiguration<MyApp>() }` |
| Ktor `install(Koin)` | `install(Koin) { modules(appModule) }` |

`modules(...)` は、プラグインが追跡可能なリスト（`listOf(...)`、`+`、`.toList()`、トップレベルの `val`、または `List<Module>` を返す関数）を受け付けます。

```kotlin
val dataModules = listOf(databaseModule, networkModule)
fun featureModules(): List<Module> = listOf(loginModule, profileModule)

startKoin {
    modules(dataModules + featureModules())
}
```

関数として宣言されたモジュール（`fun dataModule(): Module = module { ... }`）は、トップレベルの `val` と同様に追跡されます。

:::note
自身のエントリーポイントを持たないGradleモジュール（ライブラリやほとんどの機能モジュール）は、自身のコンパイル時には依存関係不足に関する診断を受けません。単独でチェックされるモジュールは、アプリがそれをどのように接続（ワイヤリング）するかを知ることができないためです。その定義は、アプリモジュールがグラフを組み立てるときにチェックされます。プラグインはビルド出力に次のように表示します。

```
[Koin] compile-safety validation skipped — no Koin entry point in this compilation.
```
:::

## チェック対象 {id="what-is-checked"}

| ケース | 結果 |
|------|--------|
| 非null許容パラメータで、定義が存在しない | エラー |
| null許容パラメータ（`T?`）で、定義が存在しない | OK（`getOrNull()` で解決） |
| デフォルト値を持つパラメータで、定義が存在しない | OK（Kotlinのデフォルト値を使用、`skipDefaultValues = true` の場合） |
| デフォルト値と修飾子（`@Named`）を持つパラメータ | エラー（修飾子によって解決が強制される） |
| `@InjectedParam` パラメータ | OK（実行時に `parametersOf()` で渡される） |
| `@Property("key")` パラメータ | OK（`@PropertyValue("key")` のデフォルト値が存在しない場合は警告） |
| `List<T>` パラメータ | OK（一致するものがない場合、`getAll()` は空のリストを返す） |
| `Lazy<T>` で、`T` の定義が存在しない | エラー（内部の型がチェックされる） |
| `@Named("x")` パラメータで、その修飾子を持つ定義が存在しない | エラー（その型が別の修飾子で存在する場合はヒントを表示） |
| 別のスコープで宣言されたスコープ依存関係 | エラー |
| 循環依存（AがBを必要とし、BがAを必要とする） | エラー |
| `@Provided` の型またはパラメータ | OK（グラフの外部から提供される） |
| `@ScopeId` パラメータ | OK（実行時に名前付きスコープから解決される） |
| `Scope` パラメータ | OK（現在のスコープが渡される） |
| Androidフレームワークの型（`Context`, `SavedStateHandle`, ...） | OK（組み込みリスト） |
| `T` の定義がない状態での `get<T>()` / `inject<T>()` | エラー |
| `T` に `@InjectedParam` があるにもかかわらず `parametersOf()` を伴わない `get<T>()` | エラー |
| 引数の数または型が誤っている `parametersOf(...)` | エラー |

各パラメータ型がどのように解決されるかに関するルールについては、[Definitions](/docs/reference/koin-core/definitions#constructor-parameters) を参照してください。

## 宣言スタイルごとのチェック {id="checks-per-declaration-style"}

あらゆるスタイルやDSL形式が同じグラフに対してチェックされます。これらは1つのプロジェクト内に混在させることができます。DSL定義がアノテーション付きクラスに依存することも、その逆も可能です。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>()
    single<UserRepository>()      // チェック対象: Database が存在すること
    viewModel<UserViewModel>()    // チェック対象: UserRepository が存在すること
}
```

プラグインはコンストラクタを読み取り、解決呼び出しを生成してすべてのパラメータをチェックします。`create(::function)` も同様に関数のパラメータに対してチェックされます。

```kotlin
fun buildUserRepository(db: Database): UserRepository = UserRepository(db)

val appModule = module {
    single { create(::buildUserRepository) }    // チェック対象: Database が存在すること
}
```

**アノテーション**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val db: Database)    // チェック対象: Database が存在すること

@KoinViewModel
class UserViewModel(private val repo: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
object MyApp
```

`startKoin<MyApp>()` がエントリーポイントとなります。プラグインは `@ComponentScan` によって見つかったすべての定義をチェックします。アノテーションが付与されたトップレベル関数も、クラスと同様にチェックされます。

```kotlin
@Factory
fun provideCache(db: Database): CacheService = RedisCache(db)    // チェック対象: Database が存在すること
```

`@Configuration` でタグ付けされたモジュールは、Gradleモジュールをまたいでそのラベルを要求する `@KoinApplication` と共に組み立てられ、一括してチェックされます。

**コンストラクタ / クラシックDSL**
コンストラクタ参照は、Compiler Plugin DSLと同様にチェックされます。

```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)        // チェック対象: Database が存在すること
    viewModelOf(::UserViewModel)      // チェック対象: UserRepository が存在すること
    scope<UserSession> {
        scopedOf(::SessionCache)
    }
}
```

`singleOf`、`factoryOf`、`scopedOf`、`viewModelOf`、および `new(::T)` は実行時の動作をそのまま維持します。プラグインはチェックを追加するだけであり、コードを書き換えることはありません。

独自に記述したラムダの場合、プラグインはコンストラクタを読み取りません。通常の呼び出し箇所と同様に、ラムダ内の `get()`、`inject()`、`getOrNull()` の呼び出しをチェックします。

```kotlin
val appModule = module {
    single { UserRepository(get()) }  // チェック対象: get() の呼び出しに Database が必要
}
```

:::warning
Compiler Plugin 1.2.0以降、`singleOf`、`factoryOf`、`scopedOf`、`viewModelOf` がチェックされるようになりました。これらの関数で依存関係が不足していたコードはコンパイルできなくなります。以前のビルドでは実行時クラッシュが隠蔽されていました。
:::

## 診断情報 {id="diagnostics"}

すべての診断情報には固定のコードがあり、`[Koin][CODE]` の形式で出力されます。コードまたはメッセージの最初の行で検索できます。

### 依存関係の不足 (KOIN-D001) {id="missing-dependency-koin-d001"}

定義のパラメータに対する定義がグラフ内に存在しません。

```
[Koin][KOIN-D001] Missing dependency: com.myapp.Database
  required by: com.myapp.UserRepository (parameter 'db')
  in module: com.myapp.AppModule
```

DSL定義の場合、`required by:` は `dsl:` で始まります。その型が別の修飾子で存在する場合は、ヒントが続きます。

```
[Koin][KOIN-D001] Missing dependency: com.myapp.NetworkClient qualified with @Named("http")
  required by: com.myapp.ApiService (parameter 'client')
  in module: com.myapp.AppModule
  Hint: Found similar binding: com.myapp.NetworkClient (no qualifier)
```

解決策: 不足している定義を宣言する、それを宣言しているモジュールを `modules()` または `includes()` に追加する、あるいは修飾子を修正する（[Qualifiers](/docs/reference/koin-core/qualifiers) を参照）。

### 呼び出し箇所における定義の不足 (KOIN-D002, KOIN-D003) {id="missing-definition-at-a-call-site-koin-d002-koin-d003"}

`get<T>()`、`inject<T>()`、または `koinViewModel<T>()` の呼び出しが、ロードされたどのモジュールにも宣言されていない型を要求しています。

```
[Koin][KOIN-D002] Missing definition: com.myapp.Tracker
  resolved by: get<Tracker>()
  No matching definition found in any loaded module.
  Check your declaration with Annotation or DSL.
```

`KOIN-D003` は依存関係モジュール内で行われた呼び出しに対する同様のエラーで、アプリモジュールのコンパイル時に報告されます。2行目には `required by a call site in a dependency module` と表示されます。

### 循環依存 (KOIN-D004) {id="circular-dependency-koin-d004"}

```
[Koin][KOIN-D004] Circular dependency detected:
  com.myapp.A → com.myapp.B → com.myapp.A
  Break with Lazy<T> injection or refactor to remove the cycle.
```

`Lazy<T>`、null許容型、`List<T>`、`@InjectedParam`、`@Provided`、`@Property`、`@ScopeId`、またはデフォルト値を持つパラメータは、循環のエッジ（結びつき）としてカウントされません。いずれか1つのパラメータを `Lazy<T>` に変更することで循環を解消できます。解消方法の詳細については、[Troubleshooting](/docs/reference/koin-core/troubleshooting) を参照してください。

### 注入パラメータ (KOIN-D005, KOIN-D006) {id="injected-parameters-koin-d005-koin-d006"}

定義が `@InjectedParam` パラメータを宣言しているにもかかわらず、呼び出し箇所でそれらが渡されていません。

```
[Koin][KOIN-D006] com.myapp.Greeter requires 1 injected param(s) but get<Greeter>() has no parametersOf(...) at the call site.
  Expected @InjectedParam slots: name: kotlin.String
  Pass them via parametersOf(...) inside the trailing lambda.
```

`KOIN-D005` は、引数の数や型が一致しない `parametersOf(...)` を報告します（`Mismatched parametersOf(...) for ...`）。どちらのチェックも、呼び出しにプラグインが読み取れる `parametersOf(...)` が含まれている場合にのみ実行されます。[Injected Parameters](/docs/reference/koin-core/injection-parameters) を参照してください。

### サポートされていない suspend バインディング (KOIN-D007) {id="unsupported-suspend-binding-koin-d007"}

suspend 関数型を継承している型の定義は、Koinが実行時に解決できないため拒否されます。

```kotlin
fun interface SetUsernameUseCase : suspend (String) -> Unit

@Factory
fun provideSetUsernameUseCase(repository: UserRepository): SetUsernameUseCase =
    SetUsernameUseCase(repository::setUsername)
```

```
[Koin][KOIN-D007] Unsupported binding: com.myapp.SetUsernameUseCase extends kotlin.coroutines.SuspendFunction1
  Suspend function injection is not yet supported by Koin runtime.
  Remove the @Single / @Factory / @Scoped registration, or refactor the binding type to not extend a suspend function.
  Tracked at https://github.com/InsertKoinIO/koin-compiler-plugin/issues/16
```

解決策: `suspend` メソッドを持つ通常のインターフェース、またはクラスを使用してください。

### すべてのコード一覧 {id="all-codes"}

| コード | 重要度 | メッセージの開始部分 |
|------|----------|---------------------|
| `KOIN-D001` | Error | `Missing dependency:` |
| `KOIN-D002` | Error | `Missing definition:`（このモジュール内の呼び出し箇所） |
| `KOIN-D003` | Error | `Missing definition:`（依存関係モジュール内の呼び出し箇所） |
| `KOIN-D004` | Error | `Circular dependency detected:` |
| `KOIN-D005` | Error | `Mismatched parametersOf(...) for` |
| `KOIN-D006` | Error | `<Type> requires N injected param(s) but` |
| `KOIN-D007` | Error | `Unsupported binding:` |
| `KOIN-D008` | Error | `Module id collision:`（2つのモジュール名が同じヒント名にエンコードされた場合: 一方の名前を変更してください） |
| `KOIN-W001` | Warning | `Module '<name>' is not loaded at startKoin` |
| `KOIN-W003` | Warning | `Graph not verifiable at compile time:` |
| `KOIN-W004` | Warning | `Custom @Configuration label '<label>' requested by` |
| `KOIN-W005` | Warning | `Definition '<name>' in dependency module` |
| `KOIN-W006` | Warning | `<definition>'s bind(...) argument could not be resolved` |
| `KOIN-A001` | Error | `@KoinViewModel definition '<name>' cannot be generated`（`io.insert-koin:koin-core-viewmodel` を追加してください） |
| `KOIN-A002` | Error | `@KoinWorker definition '<name>' cannot be generated`（`io.insert-koin:koin-android-workmanager` を追加してください） |
| `KOIN-A003` | Error | `Cannot generate <Module>.module()`（`io.insert-koin:koin-core` を追加してください） |
| `KOIN-S001` | Error | `create(::<Type>) must be the only instruction in the lambda`（[unsafeDslChecks](/docs/reference/koin-annotations/options#unsafedslchecks) を参照） |
| `KOIN-P001` | Warning | `Missing @PropertyValue default:` |
| `KOIN-M001` | Warning | `@Monitor: Kotzilla SDK not found on classpath` |

警告（Warning）は、プラグインがチェックできなかった内容を示しています。`KOIN-W003`、`KOIN-W004`、`KOIN-W005` については [制限事項](#limits) で説明しています。`KOIN-W006` は、`bind`/`binds` の引数がリテラルの `X::class`（またはそのリテラル配列/リスト）ではないことを意味します。リテラルを使用してください。

## 外部の型: `@Provided` {id="external-types-provided"}

一部の型は、Koinの宣言の外部からグラフに入り込みます（プラットフォームのオブジェクト、SDKインスタンス、実行時に手動で追加された定義など）。これらを `@Provided` でマークすることで、プラグインが不足として報告しないようにします。

```kotlin
// クラスに付与: この型のすべての使用がスキップされます
@Provided
class FirebaseAnalytics

// パラメータに付与: このパラメータのみがスキップされます
@Singleton
class PaymentProcessor(@Provided val gateway: PaymentGateway)
```

`@Provided`（`org.koin.core.annotation`）はあらゆる宣言スタイルで機能します。定義がDSLモジュール内にある場合でも、クラスまたはコンストラクタパラメータにアノテーションを付与できます。これはコンパイル時のチェックのみを変更します。実行時には通常通り `get()` で型が解決されるため、誰も宣言していなければ失敗します。パラメータ形式を使用することをお勧めします。クラスに付与すると、その型が使用されているすべての箇所でチェックが無効化されてしまうためです。

以下の型は、`@Provided` がなくても常に受け入れられます。

- `android.content.Context`
- `android.app.Application`
- `android.app.Activity`
- `androidx.activity.ComponentActivity`
- `androidx.fragment.app.Fragment`
- `androidx.lifecycle.SavedStateHandle`
- `androidx.work.WorkerParameters`

### 実行時にロードされるモジュール {id="modules-loaded-at-runtime"}

`startKoin` の後に `loadKoinModules(...)` でロードされるモジュールは、プラグインが組み立てるグラフには含まれません。プラグインはその呼び出しがいつ実行されるか、あるいは実行されるかどうかを知ることができません。このようなモジュールからのみ提供される型には、`@Provided` を付ける必要があります。

```kotlin
val featureModule = module { single<Repository>() }   // 後からロードされる
val appModule = module { single<Service>() }          // Service(@Provided val repo: Repository)

startKoin { modules(appModule) }
loadKoinModules(featureModule)
```

プラグインは実行時にロードされるモジュールを到達不能として `KOIN-W001` で報告します。これを `modules()` に追加するとオンデマンドロードの目的が失われてしまうため、この警告は無視して構いません（`allWarningsAsErrors` が有効な場合のみビルドが失敗します）。

## 特殊なパラメータ {id="special-parameters"}

**Scope**: `org.koin.core.scope.Scope` 型のパラメータは現在のスコープを受け取ります。コードがそのスコープから動的に型を解決するため、チェックは行われません。

```kotlin
@Scoped
class ScopedService(val scope: Scope) {
    fun load() = scope.get<SomeDependency>()
}
```

**@ScopeId**: パラメータは別のスコープから名前（`@ScopeId(name = "user_session")`）または型（`@ScopeId(UserSessionScope::class)`、スコープIDは完全修飾クラス名）によって解決されます。そのスコープは実行時にのみ存在するため、チェックは行われません。[Scopes](/docs/reference/koin-core/scopes) を参照してください。

**@Property**: パラメータはKoinプロパティを読み取ります。`@PropertyValue("key")` のデフォルト値が宣言されていない場合、ビルド時に警告が出力され、起動時にプロパティを設定する必要があります。

```kotlin
@PropertyValue("api.timeout")
val defaultTimeout = 30

@Factory
class ApiClient(@Property("api.timeout") val timeout: Int)    // OK

@Factory
class Other(@Property("missing.key") val value: String)
// [Koin][KOIN-P001] Missing @PropertyValue default: "missing.key" ...
```

**デフォルト値**: `skipDefaultValues = true`（デフォルト）の場合、Kotlinのデフォルト値を持つパラメータはそのデフォルト値を使用し、チェックされません。[skipDefaultValues](/docs/reference/koin-annotations/options#skipdefaultvalues) を参照してください。

## ジェネリック型 {id="generic-types"}

Koinは型消去されたクラスに基づいて定義を解決します。型引数は検索キーの一部にはなりません。プラグインも同じルールに従います。`get<Box<Int>>()` は任意の `Box` 定義に対してチェックされ、`single<Box<A>>()` と `single<Box<B>>()` は同一の定義とみなされるため、後者が前者を上書きします。

1つのジェネリック型のインスタンスを複数保持するには、`named<T>()` を使用して型引数から派生した型修飾子をそれぞれに付与します。このパターンについては [Advanced Patterns](/docs/reference/koin-core/advanced-patterns) で説明されています。

## インクリメンタルビルド {id="incremental-builds"}

フルグラフチェックは、集約モジュール（エントリーポイントを持つモジュール）がコンパイルされる際に実行されます。Kotlinのインクリメンタルコンパイルでは、他の場所（例えば `module { }` のラムダ本体内）を変更した後に、そのモジュールのコンパイルがスキップされることがあります。プラグインはエントリーポイントを検出したモジュールで `strictSafety` を有効にし、ビルドごとにチェックが実行されるようにします。詳細および回避策については [strictSafety](/docs/reference/koin-annotations/options#strictsafety) を参照してください。

## 制限事項 {id="limits"}

- **動的なモジュールリスト**: `modules(if (debug) a else b)`、`modules(*list)`、または実行時に構築されたリストは追跡できません。プラグインは `KOIN-W003` を報告し、そのエントリーポイントに対するフルグラフチェックをスキップします。チェックを維持するには、モジュールを直接渡してください。
- **手書きのラムダと循環**: `single { A(get()) }` のようなラムダは循環チェックにエッジを追加しないため、手書きのラムダを通る循環依存は検出されません。循環が懸念される箇所では、`single<T>()`、`singleOf(::T)`、または `create(::T)` を使用してください。
- **カスタム設定ラベル**: `"default"` 以外のラベルでタグ付けされたモジュールは、最大で1ホップ離れた `implementation` 依存関係までしか検出されません（`KOIN-W004`）。直接の依存関係を追加するか、`@KoinApplication(modules = [...])` にモジュールをリストしてください。
- **遠く離れた関数定義**: 2ホップ以上離れた `implementation` 依存関係モジュール内にある `@Module` 関数定義や修飾されたトップレベル関数は、チェック時に参照できません（`KOIN-W005`）。実行時には引き続き動作します。チェック対象に含めるには、直接の依存関係を追加してください。
- **実行時にロードされるモジュール**: [実行時にロードされるモジュール](#modules-loaded-at-runtime) を参照してください。

## verify() および checkModules() の置き換え {id="replacing-verify-and-checkmodules"}

コンパイル時の安全性を有効にすると、`verify()` や `checkModules()` のテストで検証していた内容が毎回のコンパイル時にビルドによってチェックされるようになります。プラグインによって完全にチェックされるグラフについては、それらのテストを削除できます。プラグインが検証不可として報告するグラフ（`KOIN-W003`）や、実行時にロードされるモジュールを使用するグラフについては、テストを残しておいてください。[Verifying modules](/docs/reference/koin-test/verify) を参照してください。

## 関連情報 {id="related"}

- [Compiler Plugin Options](/docs/reference/koin-annotations/options): `compileSafety`、`strictSafety`、`skipDefaultValues`、およびその他のオプション。
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): プラグインの機能とその仕組み。
- [Definitions](/docs/reference/koin-core/definitions): コンストラクタパラメータの解決方法。
- [Troubleshooting](/docs/reference/koin-core/troubleshooting): 実行時エラー、ロガー、および循環依存。
- [IDE Plugin](/docs/tooling/ide-plugin): IDE内でのグラフの可視化と定義へのナビゲーション。
- [Playground apps](https://github.com/InsertKoinIO/koin-compiler-plugin/tree/main/playground-apps): アノテーション（`app-annotations/`）およびDSL（`app-dsl/`）を使用したサンプルアプリ。