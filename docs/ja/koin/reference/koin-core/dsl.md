---
title: DSL リファレンス
---

# DSL リファレンス

このページでは、すべてのKoin DSLキーワードを表形式でリストアップし、インポートするパッケージと解説ページへのリンクを掲載しています。Compiler Plugin DSL、Constructor DSL（コンストラクタ参照）、Classic DSL（ラムダ）の3つのDSL形式を網羅しています。アノテーションについては、[Annotations Reference](/docs/reference/koin-annotations/annotations-inventory)を参照してください。

## DSL スタイル {id="dsl-styles"}

| スタイル | 例 | インポート |
|-------|---------|--------|
| Compiler Plugin DSL | `single<UserRepository>()` | `org.koin.plugin.module.dsl.*` |
| Constructor DSL | `singleOf(::UserRepository)` | `org.koin.core.module.dsl.*` |
| Classic DSL | `single { UserRepository(get()) }` | `org.koin.dsl.*` |

Compiler Plugin DSLには[Koin Compiler Plugin](/docs/setup/compiler-plugin)が必要です。プラグインはコンストラクタを読み取り、`get()`の呼び出しを生成して、ビルド時にグラフをチェックします。プラグインがない場合、`single<T>()`のような呼び出しは実行時に次のような例外をスローします：`Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.`

コンストラクタ参照の形式（`singleOf(::T)`）も、Compiler Pluginが適用されている場合はチェックされます。手書きのラムダはチェックされません。プラグインはラムダ本体の処理ではなく、それが提供する型のみを追跡します。スタイルの選択については、[Choosing your style](/docs/intro/choosing-your-style)を参照してください。

## Application DSL {id="application-dsl"}

Koinコンテナを作成して起動する関数です。[Starting Koin](/docs/reference/koin-core/starting-koin)を参照してください。

| 関数 | パッケージ | 説明 |
|----------|---------|--------------|
| `startKoin { }` | `org.koin.core.context` | `KoinApplication`を作成し、グローバルコンテキストに登録します。すでに起動している場合は`KoinApplicationAlreadyStartedException`をスローします |
| `startKoin<T>()` | `org.koin.plugin.module.dsl` | Compiler Plugin: `@KoinApplication`クラス`T`のモジュールを使用してKoinを起動します |
| `koinApplication { }` | `org.koin.dsl` | グローバルに登録されないスタンドアロンの`KoinApplication`を作成します。[Context Isolation](/docs/reference/koin-core/context-isolation)を参照してください |
| `koinApplication<T>()` | `org.koin.plugin.module.dsl` | Compiler Plugin: `T`のモジュールを持つスタンドアロンアプリケーションを作成します |
| `koinConfiguration { }` | `org.koin.dsl` | Koinを起動せずに再利用可能な`KoinConfiguration`を宣言します |
| `koinConfiguration<T>()` | `org.koin.plugin.module.dsl` | Compiler Plugin: `T`のモジュールを持つ設定を作成します |
| `stopKoin()` | `org.koin.core.context` | グローバルコンテナとそのすべてのインスタンスをクローズします |
| `loadKoinModules(module)` | `org.koin.core.context` | 起動しているグローバルコンテナにモジュールをロードします |
| `unloadKoinModules(module)` | `org.koin.core.context` | モジュールをアンロードし、そのインスタンスを破棄します |

### `startKoin { }` および `koinApplication { }` の内部 {id="inside-startkoin-and-koinapplication"}

| 関数 | 説明 |
|----------|--------------|
| `modules(...)` | モジュールをロードします: 単一の`Module`、可変長引数、または`List<Module>` |
| `modules(UserModule::class, ...)` | Compiler Plugin: `@Module`クラスから生成されたモジュールをロードします |
| `module<UserModule>()` | Compiler Plugin: 単一の`@Module`クラスから生成されたモジュールをロードします |
| `withConfiguration<T>()` | Compiler Plugin: 既存のアプリケーションに`@KoinApplication`クラス`T`のモジュールを追加します |
| `includes(configuration)` | 1つ以上の`KoinConfiguration`または`KoinAppDeclaration`ブロックを適用します |
| `printLogger(level)` | 標準出力にログを出力します。デフォルトレベルは`Level.INFO`です |
| `logger(logger)` | 独自の`Logger`実装を使用します。デフォルトは`EmptyLogger`（出力なし）です |
| `properties(map)` | `Map<String, Any>`からプロパティをロードします |
| `fileProperties(fileName)` | JVMのみ。ファイルからプロパティをロードします（デフォルトは`/koin.properties`） |
| `environmentProperties()` | JVMのみ。システムプロパティと環境変数をロードします |
| `allowOverride(Boolean)` | 定義のオーバーライドを許可または禁止します。デフォルトは`true`です。[Definitions](/docs/reference/koin-core/definitions#overriding-a-definition)を参照してください |
| `createEagerInstances()` | `createdAtStart`定義を作成します。`startKoin`と`koinApplication`はすでにこれを呼び出しています |
| `options(...)` | `viewModelScopeFactory()`などのKoinオプションを設定します。[ViewModel](/docs/reference/koin-core/viewmodel)を参照してください |
| `lazyModules(...)` | バックグラウンドで遅延モジュールをロードします（`koin-core-coroutines`）。[Lazy Modules](/docs/reference/koin-core/lazy-modules)を参照してください |

`modules(A::class)`、`module<T>()`、`withConfiguration<T>()`は、`startKoin<T> { }`の内部ではなく、通常の`startKoin { }`または`koinApplication { }`内に配置します。

プラットフォーム拡張機能により、このブロックにさらに多くの関数が追加されます：

| 関数 | アーティファクト | 参照 |
|----------|----------|-----|
| `androidContext(context)`, `androidLogger(level)`, `androidFileProperties()` | `koin-android` | [Android Start](/docs/reference/koin-android/start) |
| `fragmentFactory()` | `koin-android` | [Fragment Factory](/docs/reference/koin-android/fragment-factory) |
| `workManagerFactory()` | `koin-androidx-workmanager` | [WorkManager](/docs/reference/koin-android/workmanager) |
| `slf4jLogger(level)` | `koin-logger-slf4j` | [Ktor](/docs/reference/koin-ktor/ktor) |

## Module DSL {id="module-dsl"}

[Modules](/docs/reference/koin-core/modules)および[Lazy Modules](/docs/reference/koin-core/lazy-modules)を参照してください。

| 関数 | パッケージ | 説明 |
|----------|---------|--------------|
| `module { }` | `org.koin.dsl` | モジュールを宣言します |
| `module(createdAtStart = true) { }` | `org.koin.dsl` | モジュールのすべての`single`が起動時に作成されます |
| `lazyModule { }` | `org.koin.dsl` | 後からバックグラウンドでロードされるモジュールを宣言します（`koin-core-coroutines`） |
| `includes(otherModule, ...)` | `org.koin.dsl` | 他のモジュールを可変長引数または`Collection<Module>`としてインクルードします |
| `moduleA + moduleB` | `org.koin.dsl` | `List<Module>`を構築します |

## 定義（Definitions） {id="definitions"}

各キーワードが何を作成するかについては、[Definitions](/docs/reference/koin-core/definitions)で解説されています。

| 定義 | Compiler Plugin DSL | Constructor DSL | Classic DSL |
|------------|---------------------|-----------------|-------------|
| Single | `single<T>()` | `singleOf(::T)` | `single { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| Scoped（スコープブロック内） | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker（Android） | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |
| Fragment（Android） | 利用不可 | `fragmentOf(::T)` | `fragment { T(get()) }` |
| 関数またはビルダー | `single { create(::buildT) }` | `singleOf(::buildT)` | `single { buildT(get()) }` |

パッケージ：

| キーワード | Compiler Plugin DSL | Constructor / Classic DSL |
|----------|---------------------|---------------------------|
| `single`, `factory`, `scoped`, `create` | `org.koin.plugin.module.dsl` | `org.koin.dsl`（ラムダ）、`org.koin.core.module.dsl`（`singleOf`、`factoryOf`、`scopedOf`、`new`） |
| `viewModel`, `viewModelOf`（アーティファクト `koin-core-viewmodel`） | `org.koin.plugin.module.dsl` | `org.koin.core.module.dsl` |
| `worker`, `workerOf`（アーティファクト `koin-androidx-workmanager`） | `org.koin.plugin.module.dsl` | `org.koin.androidx.workmanager.dsl` |
| `fragment`, `fragmentOf`（アーティファクト `koin-android`） | | `org.koin.androidx.fragment.dsl` |

`org.koin.androidx.viewmodel.dsl`および`org.koin.compose.viewmodel.dsl`の`viewModel`と`viewModelOf`は非推奨（deprecated）です。`org.koin.core.module.dsl`からインポートしてください。

`create(::buildT)`は、ラムダ内の唯一の命令である必要があります。そうでない場合、Compiler Pluginは`create(::buildT) must be the only instruction in the lambda.`と報告します。[Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own)を参照してください。

### ラムダパラメータ {id="lambda-parameters"}

ラムダ定義は以下のシグネチャを持ちます：

| キーワード | パラメータ |
|---------|------------|
| `single(qualifier, createdAtStart) { }` | `qualifier: Qualifier? = null`, `createdAtStart: Boolean = false` |
| `factory(qualifier) { }` | `qualifier: Qualifier? = null` |
| `scoped(qualifier) { }` | `qualifier: Qualifier? = null` |
| `viewModel(qualifier) { }` | `qualifier: Qualifier? = null` |
| `worker(qualifier) { }` | `qualifier: Qualifier = named<T>()` |

### 定義ラムダの内部 {id="inside-a-definition-lambda"}

ラムダは`Scope`レシーバと`ParametersHolder`引数（`params`）を持って実行されます：

| 関数 | 戻り値 | 参照 |
|----------|---------|-----|
| `get<T>()`, `get<T>(qualifier)` | インスタンス。見つからない場合は`NoDefinitionFoundException`をスロー | [Injection](/docs/reference/koin-core/injection) |
| `getOrNull<T>()` | インスタンスまたは`null` | [Injection](/docs/reference/koin-core/injection) |
| `inject<T>()` | `Lazy<T>` | [Injection](/docs/reference/koin-core/injection) |
| `getAll<T>()` | `T`にバインドされたすべてのインスタンス | [Advanced Patterns](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `getProperty(key)`, `getProperty(key, default)`, `getPropertyOrNull(key)` | Koinプロパティ | [Starting Koin](/docs/reference/koin-core/starting-koin) |
| `params.get<T>()`, `(id) -> ...` 分解宣言 | 注入されたパラメータ | [Injected Parameters](/docs/reference/koin-core/injection-parameters) |
| `new(::T)` | すべてのコンストラクタパラメータが`get()`によって解決された新しい`T` | |
| `create(::T)` | Compiler Plugin: 上記と同じで、ビルド時チェック付き | [Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own) |
| `getSource<T>()` | スコープのソースオブジェクト | [Scopes](/docs/reference/koin-core/scopes) |
| `androidContext()`, `androidApplication()` | Androidの`Context`または`Application` | [Android Start](/docs/reference/koin-android/start) |

## 定義のオプション {id="definition-options"}

オプションは、中置演算子を使用するか`withOptions { }`ブロック内で定義の後に適用します。すべての定義キーワードで機能します。

| オプション | 形式 | 説明 | 参照 |
|--------|------|--------------|-----|
| `bind` | `single<T>() bind I::class` | セカンダリ型を追加します | [Definitions](/docs/reference/koin-core/definitions#interface-binding) |
| `binds` | `single<T>() binds arrayOf(I::class, J::class)` | 複数のセカンダリ型を追加します | [Definitions](/docs/reference/koin-core/definitions#interface-binding) |
| `onClose` | `single<T>() onClose { it?.close() }` | インスタンス解放時のコールバック | [Definitions](/docs/reference/koin-core/definitions#release-callback) |
| `withOptions { }` | `single<T>() withOptions { ... }` | 以下のオプションブロックを開きます | |
| `.override()` | `single<T> { ... }.override()` | `allowOverride(false)`が設定されている場合に、許可されたオーバーライドとしてマークします | [Definitions](/docs/reference/koin-core/definitions#overriding-a-definition) |

`withOptions { }`内、または`singleOf(::T) { }`、`factoryOf`、`scopedOf`、`viewModelOf`の末尾ブロック内：

| オプション | 説明 |
|--------|--------------|
| `named("name")` | 文字列修飾子。[Qualifiers](/docs/reference/koin-core/qualifiers)を参照 |
| `named<Type>()` | 型修飾子 |
| `bind<I>()` | セカンダリ型を追加します |
| `binds(listOf(I::class, J::class))` | 複数のセカンダリ型を追加します |
| `createdAtStart()` | Koin起動時に`single`を作成します |
| `onClose { }` | 解放時のコールバック |

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() withOptions {
        named("local")
        bind<UserRepository>()
        createdAtStart()
    }

    // Constructor DSL
    singleOf(::UserRepositoryImpl) {
        named("local")
        bind<UserRepository>()
    }
}
```

## Scope DSL {id="scope-dsl"}

スコープブロックは、スコープと同じ生存期間を持つ定義をグループ化します。[Scopes](/docs/reference/koin-core/scopes)を参照してください。

| 関数 | パッケージ | 説明 |
|----------|---------|--------------|
| `scope<T> { }` | `Module`メンバー | 型`T`によって識別されるスコープ（通常はスコープソースの型） |
| `scope(named("session")) { }` | `Module`メンバー | 修飾子によって識別されるスコープ |

スコープブロック内：

| 定義 | Compiler Plugin DSL | Constructor DSL | Classic DSL |
|------------|---------------------|-----------------|-------------|
| Scoped | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker（Android） | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionCache>()
        factory<SessionPresenter>()
    }
}
```

### スコープアーキタイプ {id="scope-archetypes"}

アーキタイプは、単一のクラスではなく、特定タイプのスコープソース向けのスコープブロックです。その種類のすべてのソースがその定義を受け取ります。

| 関数 | アーティファクト | 対象スコープ | 参照 |
|----------|----------|----------|-----|
| `viewModelScope { }` | `koin-core-viewmodel` | 各ViewModel | [ViewModel](/docs/reference/koin-core/viewmodel) |
| `activityScope { }` | `koin-android` | 各Activity | [Android Scopes](/docs/reference/koin-android/scope) |
| `activityRetainedScope { }` | `koin-android` | 各Activity（構成変更をまたいで保持） | [Android Scopes](/docs/reference/koin-android/scope) |
| `fragmentScope { }` | `koin-android` | 各Fragment | [Android Scopes](/docs/reference/koin-android/scope) |
| `navigationScope { }` | `koin-compose-viewmodel-navigation` | 各ナビゲーションデスティネーション（`NavBackStackEntry`） | [Compose Scopes](/docs/reference/koin-compose/compose-scopes) |
| `requestScope { }` | `koin-ktor` | 各Ktor呼び出し | [Ktor Scopes](/docs/reference/koin-ktor/ktor-scopes) |

## 関連情報 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): 各定義タイプの役割と使用すべきタイミング。
- [Modules](/docs/reference/koin-core/modules): モジュールの整理と構成。
- [Scopes](/docs/reference/koin-core/scopes): スコープのライフサイクル、リンク、およびクローズ。
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): このページに対応するアノテーションのリファレンス。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin): Compiler Plugin DSLに必要なプラグインのセットアップ。