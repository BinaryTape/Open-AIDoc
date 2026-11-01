---
title: 基本概念
---

# 基本概念

このページでは、ひとつの小さなサンプルをステップバイステップで構築しながら、他のすべてのページのベースとなる概念（定義、モジュール、Koinコンテナ、インジェクション、スコープ、クォリファイア、コンパイル時チェック）について解説します。各セクションは簡潔にまとめられており、詳細を説明するページへのリンクが含まれています。なお、依存性の注入（Dependency Injection）についての知識があることを前提としています（[依存性の注入とは？](/docs/intro/what-is-dependency-injection) を参照）。

コードサンプルは、「Compiler Plugin DSL」、「Annotations」、「Constructor / Classic DSL」の3つのタブで提供されています。好みのスタイルを選択してください。この選択はすべてのページに共通して適用されます。どのスタイルを使用すべきか迷った場合は、[スタイルの選択](/docs/intro/choosing-your-style) をお読みください。

## サンプル {id="the-example"}

3つの純粋なKotlinクラスです。それぞれがコンストラクタで必要な依存関係を受け取り、Koinについては何も知りません：

```kotlin
class ApiService

class UserRepository(private val api: ApiService)

class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Koinの役割は、手動で依存関係の配線（ワイヤリング）を書くことなく、`ApiService` を作成してそれを `UserRepository` に渡し、さらにそれを `UserViewModel` に渡すことです。

## 定義（Definition） {id="definition"}

**定義（definition）**は、Koinに対して特定の型のインスタンスをどのように作成し、そのインスタンスをどのくらいの期間保持するかを伝えます：

**Compiler Plugin DSL**
```kotlin
single<ApiService>()
single<UserRepository>()
viewModel<UserViewModel>()
```

**Annotations**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepository(private val api: ApiService)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**Constructor / Classic DSL**
```kotlin
singleOf(::ApiService)
singleOf(::UserRepository)
viewModelOf(::UserViewModel)
```

キーワードによってライフタイム（生存期間）が設定されます。`single` はコンテナ全体で単一のインスタンスを保持します。`factory` はリクエストごとに新しいインスタンスを作成します。`viewModel` はViewModelのライフサイクルに従います。Koinは `UserRepository` のコンストラクタを読み取り、`ApiService` が必要であることを認識して、コンテナからそれを解決します。

詳細: [定義](/docs/reference/koin-core/definitions)

## モジュール（Module） {id="module"}

**モジュール（module）**は定義をグループ化します。通常、機能やレイヤーごとに1つのモジュールを作成します：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

**Annotations**
```kotlin
@Module
@ComponentScan("com.example.app")
class AppModule
```

`@ComponentScan` は、パッケージ `com.example.app` とそのサブパッケージ内にあるすべてのアノテーション付きクラスを収集します。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepository)
    viewModelOf(::UserViewModel)
}
```

モジュールは単なる宣言にすぎません。Koinが起動し、誰かがインスタンスを要求するまでは何も作成されません。モジュールには他のモジュールを含めることができるため、大規模なアプリは小さなモジュールのツリー構造になります。

詳細: [モジュール](/docs/reference/koin-core/modules)

## Koinコンテナ {id="the-koin-container"}

`startKoin` は**コンテナ**（`KoinApplication`）を作成し、そこにモジュールをロードします。アプリのエントリポイントで1回だけ呼び出します：

**Compiler Plugin DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

**Constructor / Classic DSL**
```kotlin
fun main() {
    startKoin {
        modules(appModule)
    }
}
```

Androidでは `Application.onCreate()` 内で呼び出し、`androidContext(this)` でAndroidコンテキストを渡します。コンテナは定義とこれまでに作成されたインスタンスを保持します。`stopKoin()` を呼び出すとコンテナが閉じられ、すべての `single` が解放されます。

詳細: [Koinの起動](/docs/reference/koin-core/starting-koin)、および [AndroidでのKoinの起動](/docs/reference/koin-android/start)

## インジェクション（Injection） {id="injection"}

オブジェクトが依存関係を取得する方法には2つあります。

**コンストラクタインジェクション（Constructor injection）**：依存関係はコンストラクタのパラメータとなり、Koinがオブジェクトを作成する際にそれを渡します。このサンプルの `UserRepository` と `UserViewModel` はすでにこれを使用しています。これがデフォルトの方法です。クラスは純粋なKotlinのままであり、フェイク（モック）を渡してコンストラクタを呼び出すことでテストできます。

**コンテナからの取得（Retrieving from the container）**：一部のクラスは、Koinではなくフレームワークによって作成されます（Androidの `Activity`、Composable、Ktorのルートなど）。これらは `get()`（即時）または `inject()`（初回アクセス時の遅延初期化）を使ってコンテナに問い合わせます：

```kotlin
import org.koin.androidx.viewmodel.ext.android.viewModel

class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    ...
}
```

コンテナからの取得方法はどのスタイルでも同じです。この取得処理はこれらのエントリポイントに限定し、それ以降の階層ではすべてコンストラクタインジェクションを使用するようにしてください。

詳細: [依存関係の取得](/docs/reference/koin-core/injection)、[Androidエントリポイント](/docs/reference/koin-android/entry-points)、[Compose向けKoin](/docs/reference/koin-compose/compose)

## グラフ（The graph） {id="the-graph"}

これらをまとめると、コンテナは次のようなグラフを保持します：

```text
startKoin
  └── appModule
        ├── single     ApiService
        ├── single     UserRepository  ── needs ── ApiService
        └── viewModel  UserViewModel   ── needs ── UserRepository

UserActivity ── by viewModel() ──> UserViewModel
```

`UserActivity` が `UserViewModel` を要求すると、Koinは `ApiService` を（1回だけ）作成し、次に `UserRepository` を（1回だけ）作成し、最後にActivityのViewModelライフサイクルにバインドされた `UserViewModel` を作成します。

## スコープ（Scope） {id="scope"}

`single` はコンテナが存在する限り存続し、`factory` は呼び出し元が保持している間のみ存続します。**スコープ（scope）**はその中間をカバーするもので、ユーザーセッション、画面、リクエストなど、特定のライフサイクルに合わせて存続するインスタンスを扱います。

例えば、ユーザーがログインしている間だけ `CartRepository` が存在すべきだとします：

**Compiler Plugin DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scoped<CartRepository>()
    }
}
```

**Annotations**
```kotlin
class UserSession

@Scope(UserSession::class)
@Scoped
class CartRepository(private val api: ApiService)
```

**Constructor / Classic DSL**
```kotlin
class UserSession
class CartRepository(private val api: ApiService)

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::CartRepository)
    }
}
```

セッション開始時にスコープを開き、セッション終了時にそれを閉じます：

```kotlin
// KoinComponentの内部
val sessionScope = getKoin().createScope<UserSession>("session-42")
val cart: CartRepository = sessionScope.get()

sessionScope.close() // CartRepositoryを解放
```

スコープ付きの定義は、ルートコンテナの定義（ここでは `ApiService`）を利用できます。Androidでは、KoinがActivity、Fragment、ViewModel向けの定義済みスコープを提供しているため、手動でスコープを作成することはほとんどありません。

詳細: [スコープ](/docs/reference/koin-core/scopes)、および [Androidスコープ](/docs/reference/koin-android/scope)

## クォリファイア（Qualifier） {id="qualifier"}

Koinは型によって定義を検索します。2つの定義が同じ型を提供する場合は、**クォリファイア（qualifier）**を使ってそれぞれに名前を付与します：

**Compiler Plugin DSL**
```kotlin
interface NetworkClient

@Named("auth")
class AuthClient : NetworkClient

@Named("public")
class PublicClient : NetworkClient

class UserRepository(@Named("auth") private val client: NetworkClient)

val networkModule = module {
    single<AuthClient>() bind NetworkClient::class
    single<PublicClient>() bind NetworkClient::class
    single<UserRepository>()
}
```

**Annotations**
```kotlin
@Singleton
@Named("auth")
class AuthClient : NetworkClient

@Singleton
@Named("public")
class PublicClient : NetworkClient

@Singleton
class UserRepository(@Named("auth") private val client: NetworkClient)
```

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single<NetworkClient>(named("auth")) { AuthClient() }
    single<NetworkClient>(named("public")) { PublicClient() }
    single { UserRepository(get(named("auth"))) }
}
```

詳細: [クォリファイア](/docs/reference/koin-core/qualifiers)

## コンパイル時チェック {id="compile-time-checks"}

Compiler Pluginを使用しない場合、定義の不足はコードの実行時に発覚します（`get()` が `NoDefinitionFoundException` をスローします）。[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) を使用すると、同じミスでもビルド時に失敗するようになります。もし `appModule` から `single<ApiService>()` を削除すると、コンパイルは次のように停止します：

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

プラグインは、各エントリポイント（`startKoin`、`@KoinApplication`、Ktorの `install(Koin)`）およびすべての `get()`、`inject()`、`koinViewModel()` の呼び出しにおいて、グラフ全体をチェックします。プラグインを使用せずにConstructor DSLまたはClassic DSLを使用する場合は、ユニットテスト内で `verify()` を使用することで同様のチェックを行えます。

詳細: [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)、[Koin設定の検証](/docs/reference/koin-test/verify)

## 関連情報 {id="related"}

- [スタイルの選択](/docs/intro/choosing-your-style): どの宣言スタイルを使用するか。
- [セットアップ](/docs/setup): KoinとCompiler Pluginをビルドに追加する。
- [チュートリアル](/docs/quickstart/kotlin): これらの概念を使って完全なアプリを構築する。
- [定義](/docs/reference/koin-core/definitions): 各定義タイプの詳細。
- [スコープ](/docs/reference/koin-core/scopes): singleやfactory以外のライフサイクル。