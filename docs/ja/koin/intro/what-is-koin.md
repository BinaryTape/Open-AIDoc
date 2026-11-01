---
title: Koinとは？
---

# Koinとは？

KoinはKotlin向けの依存性注入（Dependency Injection）フレームワークです。このページでは、Koinの仕組み、導入によるメリットとコスト、そしてプロジェクトの構成について説明します。依存性注入について初めて学ぶ場合は、まず[依存性注入とは？](/docs/intro/what-is-dependency-injection)をご覧ください。

## Koinの仕組み {id="how-koin-works"}

モジュール内でクラスを定義し、Koinを一度起動すれば、必要な場所でインスタンスを要求できます。

```kotlin
class ApiService
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin {
        modules(appModule)
    }
}
```

2つの要素が連携して動作します。

- **ランタイムコンテナ**: `startKoin` はモジュールをコンテナに読み込みます。各定義は、1つの型を構築するKotlin関数です。何かが `UserRepository` を要求すると、Koinはその関数を実行し、コンテナからコンストラクタパラメータを解決し、定義タイプ（`single`、`factory`、`scoped`）に応じてインスタンスを保持または破棄します。Koinはリフレクションによってオブジェクトを構築しません。
- **コンパイル時チェック（オプション）**: [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) はKotlinコンパイラプラグインです。コンストラクタを読み取って依存関係の配線を生成し、組み立てられたグラフのすべての依存関係が宣言されているかをビルド時にチェックします。定義の欠落はクラッシュではなくビルドエラーになります。

[コアコンセプト](/docs/intro/core-concepts) では、1つの実行例を使ってモジュール、定義、スコープ、インジェクションについて解説しています。

## ランタイムモデルのメリットとコスト {id="what-the-runtime-model-costs-and-gives"}

グラフがランタイムコンテナ内に存在するため、Koinはアプリの実行中にグラフを変更できます。

- **動的モジュール**: 機能フラグ（feature flags）やオンデマンド機能のために、`loadKoinModules()` や `unloadKoinModules()` を使って起動後にモジュールを読み込み・アンロードできます。[Koinの起動](/docs/reference/koin-core/starting-koin) を参照してください。
- **遅延モジュール**: 起動時の処理負荷を軽減するために、グラフの一部をバックグラウンドで読み込みます。[遅延モジュール](/docs/reference/koin-core/lazy-modules) を参照してください。
- **ランタイムで作成されるスコープ**: セッション、画面、リクエストに応じてスコープを作成および破棄できます。[スコープ](/docs/reference/koin-core/scopes) を参照してください。
- **ソースコード生成なし**: コミットすべきファイルはなく、Kotlin Multiplatformのターゲットごとに設定するものもありません。

一方で、知っておくべきコストもあります。

- **起動時の処理**: モジュールはKoinの起動時に登録され、すべての検索はコンテナを経由します。ほとんどのアプリではわずかな負荷ですが、先行生成定義（`createdAtStart`）はKoinを起動したスレッド上で実行されます。
- **プラグインを使用しない場合のランタイムエラー**: プラグインを使用せずConstructor DSLまたはClassic DSLを使う場合、定義の欠落はコードの実行時にしか検出されません。これは [`verify()`](/docs/reference/koin-test/verify) を使用したユニットテスト、またはCompiler Pluginを使用してビルド時に検出できます。
- **コンパイル時チェックの限界**: プラグインは `startKoin` などのKoinエントリポイントで組み立てられたグラフを検証します。`loadKoinModules()` で後から読み込まれるモジュールはビルド時に検証できず、エントリポイントを持たないライブラリモジュールはアプリがそれを組み立てる際にのみチェックされます。[コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety) を参照してください。
- **Kotlinバージョンとの結合**: Compiler Pluginはコンパイラの内部実装に依存するため、プラグインの各リリースは指定されたKotlinバージョンのリストで検証されます。[Compiler Pluginのセットアップ](/docs/setup/compiler-plugin) を参照してください。

## コンストラクタインジェクションとサービスロケータ {id="constructor-injection-and-service-locator"}

クラスはコンストラクタを通じて依存関係を受け取ります。Koinがインスタンスを取得するのは、エントリポイントなど、自身でオブジェクトを作成できない場所のみです。

```kotlin
// Koinがこれらを作成: 依存関係はコンストラクタを通じて渡されます
class UserRepository(private val api: UserApi)
class UserViewModel(private val repository: UserRepository) : ViewModel()

// AndroidがActivityを作成: KoinからViewModelを取得します
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

依存関係はシグネチャで確認でき、Koinなしで `UserRepository` や `UserViewModel` をテストできます。`by inject()`、`by viewModel()`、`koinInject()` などの取得関数は、`Activity`、`Fragment`、ルートComposable、`main()`、Ktorルート、テストなどのエントリポイントに属します。[依存性注入とは？](/docs/intro/what-is-dependency-injection) ではこれら2つのパターンを比較しており、[依存関係の取得](/docs/reference/koin-core/injection) では `get()` と `inject()` について扱っています。

## 2つのスタイル、1つのコンテナ {id="two-styles-one-container"}

| スタイル | 例 | 必要なもの |
|-------|---------|-------|
| Compiler Plugin DSL | `single<UserRepository>()` | Koin Compiler Plugin |
| アノテーション | `@Singleton class UserRepository(...)` | Koin Compiler Plugin、`koin-annotations` |
| Constructor DSL | `singleOf(::UserRepository)` | 特になし（プラグインでコンパイル時チェックを追加可能） |
| Classic DSL | `single { UserRepository(get()) }` | 特になし（プラグインでコンパイル時チェックを追加可能） |

アノテーションは1つのスタイルであり、Compiler Plugin DSL、Constructor DSL、Classic DSLはもう1つのスタイルであるKoin DSLの3つの形式です。どれも同じコンテナ内に同じ定義を生成します。プロジェクトごとに1つのスタイルを選択してください。[スタイルの選択](/docs/intro/choosing-your-style) では、各スタイルの比較とデフォルトの推奨事項を解説しています。

## アノテーションの状況 {id="annotations-status"}

`koin-annotations` ライブラリ（`@Singleton`、`@Factory`、`@KoinViewModel`、`@Module`、`@ComponentScan`）は、メインのKoinプロジェクトの一部です（同一リポジトリ、同一バージョン、同一BOM）。これは非推奨（deprecated）ではありません。非推奨となったのは、かつてこれらのアノテーションを読み取っていたKSPプロセッサである `koin-ksp-compiler` です。同じアノテーションのまま、Koin Compiler Pluginがこれを置き換えます。[KSPからCompiler Pluginへの移行](/docs/migration/from-ksp-to-compiler-plugin) を参照してください。

## プラットフォーム {id="platforms"}

KoinはKotlin Multiplatformライブラリです。コア部分はすべてのKotlinターゲットで動作し、統合ライブラリによってプラットフォームAPIが追加されます。

| プラットフォーム | メインアーティファクト | ここから始める |
|----------|---------------|------------|
| Kotlin/JVM | `koin-core` | [Kotlinチュートリアル](/docs/quickstart/kotlin) |
| Android | `koin-android` | [AndroidでKoinを始める](/docs/reference/koin-android/start) |
| Jetpack Compose、Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [Compose向けKoin](/docs/reference/koin-compose/compose) |
| Kotlin Multiplatform（iOS、デスクトップ、Web、Native） | `koin-core` | [Kotlin Multiplatformのセットアップ](/docs/reference/koin-core/kmp-setup) |
| Ktorサーバー | `koin-ktor` | [Ktor向けKoin](/docs/reference/koin-ktor/ktor) |

アーティファクトの完全な一覧は [Gradleのセットアップ](/docs/setup/gradle) にあります。

## Koinプロジェクト {id="the-koin-project"}

KoinはApache 2.0ライセンスのオープンソースです。以下で構成されています。

- **Koinライブラリ**: core、Android、Compose、Ktor、test、annotations。これらすべてが1つのバージョンでリリースされます。ソース: [InsertKoinIO/koin](https://github.com/InsertKoinIO/koin)
- **Koin Compiler Plugin**: 独自のバージョンを持つKotlinコンパイラプラグインおよびそのGradleプラグイン。ソース: [InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin)
- **Koin IDE Plugin**: Android StudioおよびIntelliJ IDEAでのナビゲーションとチェック機能。[IDE Plugin](/docs/tooling/ide-plugin) を参照してください。
- **サンプル**: 各チュートリアル向けの実行可能なアプリ。[InsertKoinIO/koin-getting-started](https://github.com/InsertKoinIO/koin-getting-started)

HiltやDaggerをご存知の方は、[KoinとHiltの比較](/docs/intro/koin-vs-hilt) で2つのアプローチの違いを確認できます。

## 関連情報 {id="related"}

- [コアコンセプト](/docs/intro/core-concepts): 1つのサンプルを段階的に構築しながらメンタルモデルを理解します。
- [スタイルの選択](/docs/intro/choosing-your-style): どの宣言スタイルを使用すべきかについて。
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): ビルド時に何が行われるかについて。
- [セットアップ](/docs/setup): プロジェクトにKoinを追加する手順。
- [チュートリアル](/docs/quickstart/kotlin): 最初のアプリを作成します。