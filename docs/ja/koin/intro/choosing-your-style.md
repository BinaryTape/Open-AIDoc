---
title: スタイルの選択
---

# スタイルの選択

Koinには定義（definition）を宣言するための2つのスタイルがあり、どちらも同じコンテナに登録されます。クラスに**アノテーション**を付与する方法と、`module { }` ブロック内で **Koin DSL** を使用する方法です。DSLには3つの形式があります。Compiler Plugin DSL（`single<T>()`）、Constructor DSL（`singleOf(::T)`）、そしてClassic DSL（`single { T(get()) }`）です。スタイルの選択によって変わるのはモジュールの記述方法であり、実行時におけるKoinの動作は変わりません。このページでは、各スタイル、その要件とトレードオフを紹介し、推奨されるデフォルトスタイルを提案します。なお、本書は定義とモジュールについて理解していることを前提としています（[Core Concepts](/docs/intro/core-concepts) を参照）。

## 各スタイルの比較 {id="the-styles-side-by-side"}

同じモジュールを各スタイルで記述した例：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepositoryImpl>() bind UserRepository::class
    viewModel<UserViewModel>()
}
```

型名を指定するだけです。[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) がそのコンストラクタを読み取り、ワイヤリング（依存関係の解決コード）を生成します。

**アノテーション**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.example.app")
class AppModule
```

各クラスにアノテーションを付与します。`@ComponentScan` がそれらをモジュールへとまとめ、Compiler Plugin がワイヤリングを生成します。インターフェースは自動的にバインドされます。

**Constructor / Classic DSL**
コンストラクタ参照を使用するConstructor DSL：

```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    viewModelOf(::UserViewModel)
}
```

手動でコンストラクタ呼び出しを記述するClassic DSL：

```kotlin
val appModule = module {
    single { ApiService() }
    single<UserRepository> { UserRepositoryImpl(get()) }
    viewModel { UserViewModel(get()) }
}
```

どちらの形式もコンパイラプラグインなしで動作します。プラグインを適用すると、これらもビルド時にチェックされます。

## 要件 {id="requirements"}

| | Compiler Plugin DSL | アノテーション | Constructor / Classic DSL |
|---|---|---|---|
| Koinバージョン | 4.2.0+ | 4.2.0+ | すべて |
| Kotlinバージョン | 2.3.20+ (K2) | 2.3.20+ (K2) | ご使用のKoinバージョンがサポートする任意のバージョン |
| Gradleプラグイン | `io.insert-koin.compiler.plugin`（必須） | `io.insert-koin.compiler.plugin`（必須） | 任意：コンパイル時チェックを追加 |
| 追加の依存関係 | パラメータアノテーション（`@Named`、`@InjectedParam`）を使用する場合のみ `koin-annotations` | `koin-annotations` | なし |
| インポート | `org.koin.plugin.module.dsl.*` | `org.koin.core.annotation.*` | `org.koin.core.module.dsl.*`（Constructor）、`org.koin.dsl.*`（Classic） |

Compiler Pluginの各リリースは、特定のKotlinバージョンのリストで検証されています。プラグイン1.2.1はKotlin 2.3.20、2.4.0、2.4.10、2.4.20で検証済みです。導入手順については [Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照してください。

:::warning
Compiler Plugin DSLの関数（`single<T>()`、`factory<T>()`、`create(::T)`）はスタブです。Gradleプラグインが適用されていない場合、コードはコンパイルされますが、実行時に `NotImplementedError` をスローします。これらを使用するすべてのGradleモジュールにプラグインを適用してください。
:::

## トレードオフ {id="tradeoffs"}

### Compiler Plugin DSL {id="compiler-plugin-dsl"}

- **コンパイル時チェック**: 依存関係グラフ全体およびすべての `get()` 呼び出し箇所がビルド時に検証されます。
- **ワイヤリングコードが不要**: `get()` やコンストラクタ参照の記述が不要です。コンストラクタパラメータを追加してもモジュールを変更する必要はありません。
- **明示的なモジュール定義**: モジュールのすべての定義を1箇所で確認でき、その周囲でKotlinコード（条件分岐やループなど）を使用できます。
- **パラメータアノテーション**: クオリファイアやインジェクトされるパラメータはクラス側で宣言されるため（`@Named`、`@InjectedParam`）、クラスが `koin-annotations` に依存します。
- **Kotlinとの密結合**: 最新のK2コンパイラが必要であり、Kotlinの新しいリリースには新しいプラグインのリリースが必要になる場合があります。

### アノテーション {id="annotations"}

- **コンパイル時チェック**: Compiler Plugin DSLと同様です。
- **クラスのすぐそばに定義がある**: ライフタイムやバインディングがクラス定義の場所で確認できます。Hilt、Dagger、Springの経験があるチームには馴染みやすいモデルです。
- **自動バインディング**: `binds` を明示的に指定しない限り、クラスはそのすべてのスーパータイプに自動的にバインドされます。
- **スキャン設定**: 定義はパッケージ単位で検出されます。適切なパッケージを指定した `@Module` と `@ComponentScan` が必要であり、複数のGradleモジュールにまたがってモジュールを統合するには `@Configuration` や `@KoinApplication` が必要です。スキャン対象外のパッケージにあるクラスはモジュールに含まれません。コンパイル時チェックは、他の定義がそれを必要としている場合にのみエラーを報告します。
- **機能の差異**: `onClose` コールバックなど、一部のオプションはDSLでのみ利用可能です。それらの定義はDSLモジュールで記述する必要があります。
- **Kotlinとの密結合**: Compiler Plugin DSLと同様です。

### Constructor DSL および Classic DSL {id="constructor-dsl-and-classic-dsl"}

- **どこでも動作**: コンパイラプラグインは任意であり、Koin自体の制約以外のKotlinバージョンの制限はありません。
- **プラグインによるコンパイル時チェック**: Compiler Plugin 1.2.0以降、プラグインを適用すると `singleOf(::T)`、`factoryOf(::T)`、`scopedOf(::T)`、`viewModelOf(::T)` が `single<T>()` と同様にチェックされ、手書きのラムダ式も `get()` の呼び出しを通じてチェックされます。既存のモジュールを書き直すことなくコンパイル時チェックを導入できます。
- **完全な制御（Classic DSL）**: ラムダ式は通常のKotlinコードであるため、ビルダーの呼び出し、設定の読み込み、実行時の実装の選択などが自由に行えます。
- **プラグインなしでの実行時エラー**: 定義の不足はコードの実行時に検出されます。ユニットテストで [`verify()`](/docs/reference/koin-test/verify) を使用することで、より早い段階で問題を検出できます。
- **メンテナンスが必要なワイヤリング**: `single { UserRepository(get(), get()) }` は、コンストラクタの変更に応じて手動で更新する必要があります。`singleOf(::UserRepository)` は自動で追従しますが、nullable、lazy、またはクオリファイア付きのパラメータには明示的な呼び出しが必要です。

## どちらを選ぶべきか {id="which-one-to-pick"}

プロジェクトとしてアノテーションかDSLかのどちらか一方のスタイルを選択し、明確に定めてください。

Kotlin 2.3.20以降を使用する新規プロジェクトには、**Compiler Plugin DSL** の使用を推奨します。コンパイル時チェックが可能になり、クラスからDIのコードを排除しつつ、モジュールを明示的なKotlinコードとして維持できます。チームがHiltやDaggerのようにクラス上で定義を宣言することを好む場合は、**アノテーション**を使用してください。同様のチェックが行われ、JSR-330と互換性があります（`@Inject`、`@Singleton`、`@Named`）。

最新のKotlinバージョンを使用できない場合や、ユーザーにコンパイラプラグインを要求できないライブラリを構築する場合、あるいは既存のモジュールが正常に動作しており変更したくない場合は、**Constructor DSL または Classic DSL** を使い続けてください。コードを書き直さずにコンパイル時チェックを得るには、Compiler Plugin を適用します。定義にカスタムロジックが必要な箇所では、Classic DSL のラムダ式を使用してください。

## スタイルの混在 {id="mixing-styles"}

すべてのスタイルは同一の定義を生成するため、1つのプロジェクトで複数のスタイルを併用できます。ただし、プロジェクトごとに1つのスタイルに統一することをお勧めします。アノテーションとDSLを混在させる場合は、モジュール単位でスタイルを統一してください。一般的なケース：

- **1つのモジュール内でのCompiler Plugin DSLとClassic DSLの併用**: 大半の定義には `single<T>()` を記述し、カスタムロジックが必要な箇所にのみラムダ式を使用します。どちらもDSLの形式であるため、これはスタイルの混在とはみなされません。
- **アノテーションを基本とし、一部のDSLモジュールを併用**: `@KoinApplication` クラスを起点とし、設定ブロック内でDSLモジュールを追加します。
- **DSLでの開始時にアノテーション付きモジュールを読み込む**: 通常の `startKoin` 内で `@Module` クラスを読み込みます。

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.startKoin

// アノテーション付きアプリケーションにDSLモジュールを追加
startKoin<MyApp> {
    modules(legacyModule)
}

// DSLアプリケーションにアノテーション付きモジュールを追加
startKoin {
    modules(appModule)
    module<NetworkModule>()
}
```

`@Module(includes = [...])` および `@KoinApplication(modules = [...])` には `@Module` クラスのみを指定でき、DSLの `module { }` 値は指定できません。ルールの詳細については、[Modules](/docs/reference/koin-core/modules) および [Starting Koin](/docs/reference/koin-core/starting-koin) を参照してください。

## KSPプロセッサは非推奨です {id="the-ksp-processor-is-deprecated"}

Compiler Plugin以前は、アノテーションはKSPプロセッサである `koin-ksp-compiler` によって処理されていました。このプロセッサは非推奨（deprecated）となり、将来のKoinバージョンで削除される予定です。アノテーション自体は非推奨ではありません。`koin-annotations` はKoinのメインプロジェクトの一部であり、各Koinバージョンとともに提供されています。現在KSPを使用している場合、アノテーションが付与されたクラスはそのままで、ビルド設定と開始コードのみを変更します。詳細については [Migrating from KSP to the Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。

## 各ページのタブ表示 {id="tabs-on-every-page"}

本ドキュメントのコードサンプルでは、「Compiler Plugin DSL」、「Annotations」、「Constructor / Classic DSL」の同じ3つのタブを使用しています。タブを選択すると、その選択内容がブラウザに保存され、すべてのページに適用されます。Activityでの `by inject()` のように、すべてのスタイルで共通のサンプルは、タブなしで一度だけ表示されます。

## 関連情報 {id="related"}

- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): プラグインの仕組みと検証対象について。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin): Gradleプラグインの導入方法。
- [Definitions](/docs/reference/koin-core/definitions): 各スタイルにおけるすべての定義タイプ。
- [DSL Reference](/docs/reference/koin-core/dsl) および [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): すべてのキーワードとアノテーション。
- [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin): `koin-ksp-compiler` からの移行。