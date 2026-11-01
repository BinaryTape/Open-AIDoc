---
title: Koin Compiler Plugin
---

# Koin Compiler Plugin

Koin Compiler Pluginは、Kotlinコンパイラ（K2）の内部で動作するKotlinコンパイラプラグインです。定義のためのコンストラクタワイヤリングを記述し、ビルド時に依存関係グラフをチェックします。このプラグインは、Compiler Plugin DSLとアノテーションの両方を支えています。このページでは、本プラグインの機能とその仕組みについて説明します。インストール方法については [Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照してください。Constructor DSLやClassic DSLとの比較については [Choosing your style](/docs/intro/choosing-your-style) を参照してください。

## コードに対して何を行うか {id="what-it-does-to-your-code"}

開発者が型を記述すると、プラグインがコンストラクタ呼び出しを記述します。

**Compiler Plugin DSL**
```kotlin
class UserRepository(private val api: ApiService, private val cache: UserCache)

val appModule = module {
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Singleton
class UserRepository(private val api: ApiService, private val cache: UserCache)
```

**Constructor / Classic DSL**
Classic DSLにはプラグインは不要です。ワイヤリングは開発者自身が記述します。Constructor DSL（`singleOf(::T)`）にもプラグインは不要です。

```kotlin
val appModule = module {
    single { UserRepository(get(), get()) }
}
```

プラグインが適用されている場合でも、これらの `get()` 呼び出しや `singleOf(::T)` 定義はビルド時に検証されます。

コンパイル中、プラグインは `single<UserRepository>()`（または `@Singleton` クラス）を以下と同等のコードに置き換えます。

```kotlin
single { UserRepository(get(), get()) }
```

生成されるコードは、Classic DSLが使用するランタイムコードと同じです。ランタイムでの動作には何も変更はありません。定義は同じコンテナに配置され、Koinは同じ方法で解決します。各パラメータ型は個別に処理されます。null許容型には `getOrNull()`、`Lazy<T>` には `inject()`、`List<T>` には `getAll()` が使用され、アノテーション付きのパラメータ（`@Named`、`@InjectedParam`、`@Property`）には対応する呼び出しが使用されます。完全な対応表は [Definitions](/docs/reference/koin-core/definitions#constructor-parameters) に記載されています。

DSLスタイルでは、モジュールがクラスの登録先を指定し、クラスのパラメータに付与されたアノテーションがそれらの解決方法を指定します。

```kotlin
class UserPresenter(
    @InjectedParam val userId: String,
    @Named("remote") val api: ApiService,
    val repository: UserRepository,
)

val appModule = module {
    factory<UserPresenter>()
}
```

## 動作の仕組み {id="how-it-works"}

プラグインは、Kotlin K2コンパイラの2つのフェーズにフックします。

```text
Kotlin sources
     │
     ▼
  FIR (frontend)   finds @Module, @ComponentScan, @Configuration and declares
                   the generated module properties and cross-module hints
     │
     ▼
  IR (backend)     1. collects annotated definitions and fills the modules
                   2. rewrites DSL calls: single<T>() becomes single { T(get()) }
                   3. at entry points (startKoin, @KoinApplication), assembles
                      the full graph and validates it
                   4. validates get(), inject(), koinViewModel() call sites
     │
     ▼
  Bytecode (JVM, Android, Native, JS, Wasm)
```

プロジェクト内にソースファイルが生成されることはありません。Gradleモジュール間をまたいで確認できるようにするため、プラグインはコンパイルされた各モジュールに小さな合成マーカー関数（"hints"）を追加します。下流のモジュールはこれらを読み取り、依存関係で宣言された定義を見つけ出します。そのため、Koinの定義を宣言するすべてのGradleモジュールでプラグインを適用する必要があります。

## 何を検証するか {id="what-it-validates"}

プラグインは、各Koinエントリポイント（`startKoin`、`koinApplication`、`@KoinApplication`、`KoinApplication.withConfiguration<T>()`、およびKtorの `install(Koin) {}`）でグラフを検証します。各定義について、null非許容のコンストラクタパラメータごとに、適切な修飾子（qualifier）を持ち到達可能なスコープ内にある一致する定義が存在するかどうかをチェックします。また、すべての `get<T>()`、`inject<T>()`、`koinViewModel<T>()` の呼び出しもチェックします。

依存関係が欠落している場合、ビルドは失敗します。

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

チェックの完全なリスト、エラーコード、および `@Provided` による回避策については、[Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。

## 制限事項 {id="limits"}

- **ランタイムにロードされるモジュール**: `loadKoinModules()` を使用して後から追加されるモジュールは、プラグインが認識するグラフの一部にはなりません。それらのモジュールが提供する型には `@Provided` を付与する必要があります。
- **ライブラリモジュール単体**: Koinエントリポイントを持たないGradleモジュールは、単体では検証されません。アプリモジュールがそれをアセンブルする際にチェックされます。
- **インクリメンタルコンパイル**: 他のIRコンパイラプラグインと同様に、一部の変更（スキャン対象パッケージ間でのクラス移動、修飾子の変更など）によって古い結果が残る場合があります。クリーンビルドを行うことでこれらは解消されます。詳細については [Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照してください。
- **Kotlinバージョン**: プラグインはKotlinのリリース間で変更されるコンパイラAPIを使用します。各プラグインリリースは検証済みKotlinバージョンのリストでテストされており、その他のバージョンでは警告が表示されます。

## 要件 {id="requirements"}

- Kotlin 2.3.20 以降（K2コンパイラ）。プラグイン 1.2.1 は Kotlin 2.3.20、2.4.0、2.4.10、2.4.20 で検証されています。
- Koin 4.2.0 以降。
- Gradleプラグイン `io.insert-koin.compiler.plugin`（定義を宣言するすべてのGradleモジュールに適用）。

Compiler Plugin DSLは、`koin-core` に同梱されているパッケージ `org.koin.plugin.module.dsl` に配置されています。Classic DSLは `org.koin.dsl` に、Constructor DSLは `org.koin.core.module.dsl` に引き続き配置されます。

このプラグインは非推奨となったKSPプロセッサ `koin-ksp-compiler` を置き換えるものであり、同じアノテーションを使用します。[Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。ソースはGitHubで公開されています: [InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin)。

## 関連項目 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin): プラグインのインストールと設定。
- [Choosing your style](/docs/intro/choosing-your-style): アノテーションまたはDSL（Compiler Plugin DSL、Constructor DSL、Classic DSL）。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): すべてのチェック項目とエラーコード。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): すべてのGradleオプション。
- [Definitions](/docs/reference/koin-core/definitions): コンストラクタパラメータの解決方法。