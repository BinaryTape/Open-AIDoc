---
title: Koin vs Hilt
---

# Koin vs Hilt

本ページでは、一方を知っており、もう一方を理解したいと考えている Android 開発者向けに、Koin と Hilt（および Hilt のベースとなっている Dagger）を比較します。各フレームワークがどのように依存関係グラフを構築するのか、コードはどのようになるのか、そしてそれぞれの強みがどこにあるのかを網羅しています。プロジェクトを Hilt から Koin に移行するには、[Hilt からの移行](/docs/reference/koin-android/hilt-migration) を参照してください。

以下の Koin のサンプルでは、Hilt に最も近いためアノテーションを使用しています。同様の定義は Koin DSL を使用して記述することも可能です（[スタイルの選択](/docs/intro/choosing-your-style) を参照）。

## グラフの構築方法 {id="how-each-one-builds-the-graph"}

**Hilt** は、アノテーション処理（KSP または kapt）を使用して、ビルド時に依存関係グラフを Java ソースコードとして生成します。すべてのバインディング、コンポーネント、スコープは、アプリのコンパイル時に認識されます。実行時、アプリはルックアップ処理を行わず、生成されたファクトリを直接呼び出します。

**Koin** は、実行時のコンテナ内にグラフを保持します。定義は Koin の起動時に登録され、インスタンスは要求された際に型によって解決されます。[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) を使用すると、`startKoin` で組み立てられたグラフがビルド時にもチェックされ、プラグインがコンストラクタの配線（wiring）コードを生成します。プラグインを使用しない場合、欠落している定義は実行時または [検証テスト（verification test）](/docs/reference/koin-test/verify) で検出されます。

この違いが、以下のトレードオフの大部分を説明しています。

## 概要比較 {id="at-a-glance"}

| 観点 | Koin | Hilt |
|------|------|------|
| グラフの構築 | 実行時（Compiler Plugin を使用してビルド時にチェック） | ビルド時（コード生成） |
| バインディング欠落の検出 | Compiler Plugin 使用時はビルド時、それ以外は実行時またはテスト時 | 常にビルド時 |
| ビルドツール | Kotlin コンパイラプラグイン（Constructor DSL または Classic DSL ではオプション） | KSP または kapt、Hilt Gradle プラグイン |
| プラットフォーム | Kotlin Multiplatform: Android、iOS、デスクトップ、Web、JVM サーバー | Android（Dagger 単体なら JVM で動作） |
| 言語 | Kotlin | Java および Kotlin |
| 実行時のモジュールのロード／アンロード | 可能（`loadKoinModules`、`unloadKoinModules`、遅延モジュール） | 不可 |
| コンポーネント階層 | ルートコンテナと宣言したスコープ（Android のスコープアーキタイプを含む） | 標準コンポーネント（`SingletonComponent`、`ActivityComponent` など）の固定階層 |
| Android エントリポイント | 任意の Activity または Fragment で `by inject()`、`by viewModel()` | 各クラスに `@AndroidEntryPoint` を付与 |
| Jetpack との統合 | Koin ライブラリを介した ViewModel、WorkManager、Navigation、Compose | AndroidX Hilt ライブラリを介した ViewModel、WorkManager、Navigation、Compose |

## Hilt の強み {id="where-hilt-is-stronger"}

- **ビルド時の完全なグラフ**: Hilt はグラフ全体を生成するため、すべてのモジュールとスコープについて、ビルドごとにすべてのバインディングが検証されます。Koin Compiler Plugin はエントリポイントでグラフを検証しますが、実行時にロードされるモジュールやライブラリモジュール単体は検証対象外となります。
- **実行時のルックアップなし**: 生成されたファクトリが直接呼び出されます。Koin はコンテナを介して各リクエストを解決するため、解決ごとにルックアップのコストが発生し、起動時にも登録処理が必要になります。
- **Java のサポート**: Dagger と Hilt は Java のコードベースでも動作します。Koin の API は Kotlin 向けに設計されています。
- **エコシステムとガイダンス**: Hilt は公式の Android ガイドで文書化されている DI ライブラリであり、多くの AndroidX ライブラリやサンプルで Hilt の統合が最優先で提供されます。
- **詳細なエラー表示**: Dagger のエラーでは、エントリポイントから欠落しているバインディングまでの完全なパスが表示されます。

## Koin の強み {id="where-koin-is-stronger"}

- **Kotlin Multiplatform**: 同じモジュールが Android、iOS、デスクトップ、Web、Ktor サーバー上で動作します。Hilt は Android 専用です。
- **実行時の柔軟性**: 起動後にモジュールをロード、アンロード、またはバックグラウンドでロードできるため、機能フラグ（feature flags）、ダイナミック機能（dynamic features）、プラグインアーキテクチャに適しています。
- **セットアップが少ない**: アノテーションプロセッサや生成されたソースコード、`@AndroidEntryPoint` は不要です。Constructor DSL または Classic DSL を使用する場合、ビルドプラグインはオプションです。
- **宣言コードが少ない**: コンストラクタに `@Inject` を付ける必要がなく、個別の `@Binds` モジュールなしでインターフェースがその実装にバインドされます。
- **スタイルの選択が可能**: DSL またはアノテーションを選択でき、これらを混在させることも可能です。

## コードの比較 {id="code-side-by-side"}

### 依存関係を持つクラス {id="a-class-with-dependencies"}

Koin:

```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

Koin は、`UserRepositoryImpl` が `UserRepository` を実装しているため、自動的にそれにバインドします。

Hilt:

```kotlin
@Singleton
class UserRepositoryImpl @Inject constructor(private val api: ApiService) : UserRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

### サードパーティのクラス {id="third-party-classes"}

Koin:

```kotlin
@Module
class NetworkModule {
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Provides
    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

両者はよく似ています。Koin はモジュールがコンポーネントに関連付けられていないため `@InstallIn` を必要とせず、関数に `@Singleton` を付けるだけで定義が宣言されるため `@Provides` も不要です。

### ViewModel {id="viewmodel"}

Koin:

```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// Activity または Fragment
val viewModel: UserViewModel by viewModel()

// Compose
val viewModel: UserViewModel = koinViewModel()
```

Hilt:

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// @AndroidEntryPoint が付与された Activity または Fragment
val viewModel: UserViewModel by viewModels()

// Compose
val viewModel: UserViewModel = hiltViewModel()
```

### 複数の Gradle モジュール {id="several-gradle-modules"}

Koin:

```kotlin
// feature-auth
@Module
@ComponentScan
@Configuration
class AuthModule

// app
@KoinApplication
class MyApp
```

Hilt:

```kotlin
// feature-auth
@Module
@InstallIn(SingletonComponent::class)
class AuthModule { ... }

// app
@HiltAndroidApp
class MyApp : Application()
```

どちらもクラスパス上の機能モジュールを検出します。Koin は `@Configuration` を通じて、Hilt は `@InstallIn` を通じて検出します。Koin では、`@ComponentScan` がパッケージ内のすべてのアノテーション付きクラスも収集するため、機能モジュールでプロバイダ関数が必要ないことがよくあります。

## 概念の対応関係 {id="concept-mapping"}

| Hilt | Koin |
|------|------|
| `@HiltAndroidApp` | `startKoin<MyApp>()` を伴う `@KoinApplication`、または `startKoin { }` |
| `@AndroidEntryPoint` | 不要: 任意の Activity や Fragment で `by inject()` および `by viewModel()` が機能 |
| `@Inject constructor` | 不要: コンストラクタは Compiler Plugin によって読み取られます |
| `@Binds` | アノテーションでは自動、DSL では `bind` |
| `@Provides` | 関数への `@Singleton` または `@Factory`、あるいは DSL の定義 |
| `@InstallIn(SingletonComponent::class)` | `@Configuration` |
| `@HiltViewModel` | `@KoinViewModel` |
| `@Named` | `@Named` |
| `@ActivityScoped`、`@ViewModelScoped` | `@ActivityScope`、`@ViewModelScope` |
| `@AssistedInject` | `@InjectedParam` |

完全な対応表、段階的なプロセス、移行中に両方のフレームワークを共存させて実行する方法については、移行ガイドの [Hilt からの移行](/docs/reference/koin-android/hilt-migration) を参照してください。

## 関連情報 {id="related"}

- [Hilt からの移行](/docs/reference/koin-android/hilt-migration): プロジェクトを段階的に移行する手順。
- [JSR-330 の互換性](/docs/reference/koin-android/jsr330): `javax.inject` アノテーションを維持する方法。
- [Koin とは？](/docs/intro/what-is-koin): Koin のランタイムおよびコンパイル時のモデル。
- [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety): Koin がビルド時にチェックする内容。
- [スタイルの選択](/docs/intro/choosing-your-style): DSL またはアノテーション。