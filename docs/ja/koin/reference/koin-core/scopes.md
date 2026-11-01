---
title: スコープ
---

# スコープ

スコープは、`factory` よりも長く、`single` よりも短い生存期間を持つインスタンスのコンテナです。このページでは、スコープとスコープ付き定義（scoped definition）の宣言、スコープインスタンスの作成とクローズ、スコープのリンク、およびスコープアーキタイプについて解説します。[定義 (definitions)](/docs/reference/koin-core/definitions) について理解していることを前提としています。

プラットフォームAPIは本ページの内容をベースに構築されています: [Android Scopes](/docs/reference/koin-android/scope) (`ScopeActivity`、`AndroidScopeComponent`、`activityScope()`)、[Scopes in Compose](/docs/reference/koin-compose/compose-scopes)、および [Ktor Request Scopes](/docs/reference/koin-ktor/ktor-scopes)。

## スコープの仕組み {id="how-scopes-work"}

スコープには2つの要素があります:

- **スコープ宣言**: モジュール内のセクションで、クォリファイア（型または名前）によって識別されます。そのスコープに属する定義をリストアップします。
- **スコープインスタンス**: 宣言からランタイムに作成され、一意のスコープIDを持ちます。各スコープインスタンスは、クローズするまで独自の `scoped` 定義のコピーを保持します。

| 定義 | インスタンス |
|------------|----------|
| `single` | コンテナ全体で1つ |
| `factory` | リクエストごとに新しいインスタンス |
| `scoped` | スコープインスタンスごとに1つ、スコープインスタンスがクローズされると解放 |

限られた期間（ログインセッション、チェックアウトフロー、画面など）だけ複数のオブジェクトが同じインスタンスを共有し、その後そのインスタンスを破棄する必要がある場合にスコープを使用します。

## スコープの宣言 {id="declaring-a-scope"}

**コンパイラプラグイン DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val sessionModule = module {
    // scope identified by a type
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
        factory<CheckoutPresenter>()
    }

    // scope identified by a name
    scope(named("checkout")) {
        scoped<CheckoutNavigator>()
    }
}
```

**アノテーション**
クラスにどのスコープに属するかを指定する `@Scope` と、スコープ付き定義として宣言する `@Scoped` を付与します。両方のアノテーションが必要です:

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(private val sessionData: SessionData)

// scope identified by a name
@Scope(name = "checkout")
@Scoped
class CheckoutNavigator
```

`@Scope(UserSession::class)` は `scope<UserSession> { }` と同じであり、`@Scope(name = "checkout")` は `scope(named("checkout")) { }` と同じです。どちらのアノテーションも `@Module` クラス内の関数に対しても使用できます。

**コンストラクタ / クラシック DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val sessionModule = module {
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
        factoryOf(::CheckoutPresenter)
    }

    scope(named("checkout")) {
        scoped { CheckoutNavigator() }
    }
}
```

スコープセクション内の `factory` はリクエストごとに新しいインスタンスを作成しますが、そのスコープのスコープ付きインスタンスに依存することができます。

スコープが1つのクラス（`UserSession`、`MainActivity`）に紐づく場合は、スコープクォリファイアとして型を使用します。適切なクラスがない場合は名前を使用します。`scope(named<MyQualifier>())` は型クォリファイアを受け取ります。

## スコープの作成とクローズ {id="creating-and-closing-a-scope"}

IDとスコープクォリファイアを指定して、`Koin` インスタンスからスコープインスタンスを作成します。これは、ライフサイクルが開始および終了する場所（通常はログイン/ログアウト画面やリクエストハンドラなどのエントリポイント）で実行します:

```kotlin
val koin = KoinPlatform.getKoin()

// ログイン時
val scope = koin.createScope<UserSession>(userId)
val cart: CartRepository = scope.get()

// ログアウト時
koin.getScopeOrNull(userId)?.close()
```

スコープ付きクラス自体（`CartRepository`、`SessionData`）は、他の定義と同様にコンストラクタインジェクションを使用します。

| 関数 | 動作 |
|----------|----------|
| `createScope<T>(scopeId)` | 型クォリファイア `T` のスコープインスタンスを作成する |
| `createScope(scopeId, qualifier)` | 任意のクォリファイア（例: `named("checkout")`）に対するスコープインスタンスを作成する |
| `getOrCreateScope(scopeId, qualifier)` | 指定したIDのアクティブなスコープを返すか、存在しない場合は作成する |
| `getScope(scopeId)` | アクティブなスコープを返す。存在しない場合は `ScopeNotCreatedException` ("No scope found for id '...'") をスローする |
| `getScopeOrNull(scopeId)` | アクティブなスコープを返す。存在しない場合は `null` を返す |
| `deleteScope(scopeId)` | スコープインスタンスをレジストリから削除する |

スコープIDは、アクティブなスコープ間で一意である必要があります。同じ宣言から作成された2つのスコープインスタンスは、異なるインスタンスを保持します:

```kotlin
val first = getKoin().createScope<UserSession>("user_1")
val second = getKoin().createScope<UserSession>("user_2")

first.get<SessionData>() !== second.get<SessionData>() // true
```

`scope.close()` を呼び出すと:

1. Koinは各スコープ付きインスタンスの `onClose` コールバックを呼び出し、それらを解放します。
2. スコープがレジストリから削除されます。
3. その後、そのスコープに対して `get()` を呼び出すと `ClosedScopeException` ("Scope '...' is closed") がスローされます。不明な場合は `scope.closed` で確認してください。

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionData>() onClose { it?.clear() }
    }
}
```

スコープ自体がクローズするときにコードを実行するには、`scope.registerCallback()` で `ScopeCallback` を登録します。

:::warning
手動で作成したスコープは、クローズするまでアクティブなままになります。保持しているすべてのインスタンスはメモリ上に残ります。ライフサイクルの終了時（ログアウト、フローの終了）には必ずクローズしてください。Androidでは、`activityScope()` や `fragmentScope()` がスコープのクローズを自動的に行います。詳細は [Android Scopes](/docs/reference/koin-android/scope) を参照してください。
:::

## スコープコンポーネント {id="scope-components"}

スコープのライフサイクルを管理するクラスは、`KoinScopeComponent` を実装できます。その場合、そのクラスの `get()` および `inject()` の呼び出しは自身のスコープから解決されます。これはスコープオーナー専用の高度なパターンです。スコープ内の定義は引き続きコンストラクタ経由で依存関係を受け取ります。

```kotlin
class UserSession : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }

    // UserSession スコープから解決される
    val cart: CartRepository by inject()

    fun close() {
        scope.close()
    }
}
```

`createScope(this)` は、クラスの型をスコープクォリファイアとして使用し、クラス名とハッシュコードから生成されたID、および `this` をスコープソースとして使用します。`newScope()` と `getOrCreateScope()` は同様の目的を持つ lazy デリゲートです: `override val scope by newScope()`。

## スコープ内での解決 {id="resolution-inside-a-scope"}

スコープインスタンスから定義を検索する際、Koinは次の順序で検索します:

1. そのスコープ（またはそのアーキタイプ。下記参照）の定義。
2. スコープソース。
3. リンクされたスコープ（順番通り）。すべての `single` および `factory` 定義を含むルートスコープは、常に最後にリンクされます。

そのため、スコープ付きクラスはシングルトンや、同じスコープ内の他のスコープ付きクラスに依存できます:

**コンパイラプラグイン DSL**
```kotlin
class CartRepository(
    private val api: ApiService,        // single、ルートスコープから
    private val sessionData: SessionData // scoped、同じスコープから
)

val sessionModule = module {
    single<ApiService>()
    scope<UserSession> {
        scoped<SessionData>()
        scoped<CartRepository>()
    }
}
```

**アノテーション**
```kotlin
@Singleton
class ApiService

@Scope(UserSession::class)
@Scoped
class SessionData

@Scope(UserSession::class)
@Scoped
class CartRepository(
    private val api: ApiService,         // single、ルートスコープから
    private val sessionData: SessionData // scoped、同じスコープから
)
```

**コンストラクタ / クラシック DSL**
```kotlin
val sessionModule = module {
    singleOf(::ApiService)
    scope<UserSession> {
        scopedOf(::SessionData)
        scopedOf(::CartRepository)
    }
}
```

逆は機能しません: `single` は `scoped` 定義に依存できず、ルートスコープから `get<SessionData>()` を呼び出すと `NoDefinitionFoundException` で失敗します。スコープ付きインスタンスは、そのスコープインスタンスから解決してください。

### スコープソース {id="scope-source"}

スコープソースとは、`createScope(scopeId, qualifier, source)` で `source` として渡される、スコープを作成したオブジェクトのことです。スコープ付き定義は、他の依存関係と同様に型を指定してこれを要求できます:

```kotlin
class SessionLogger(private val session: UserSession)

val sessionModule = module {
    scope<UserSession> {
        scoped<SessionLogger>() // スコープを作成した UserSession を受け取る
    }
}
```

ソースはクォリファイアのないリクエストに対してのみ解決され、スコープがクローズされると解放されます。

### スコープ自体の注入 {id="injecting-the-scope"}

スコープ付き定義は、後から追加のインスタンスを解決したり、スコープをクローズしたりするために、コンストラクタパラメータとして `Scope` 自体を受け取ることができます。

### Koin外で作成されたインスタンス {id="instances-created-outside-koin"}

`scope.declare(instance)` を使用すると、モジュール内に定義を用意することなく、既存のオブジェクトを特定のスコープインスタンスに追加できます:

```kotlin
val scope = getKoin().createScope<UserSession>(userId)
scope.declare(UserProfile(userId, name))
```

## 他のスコープからの解決 {id="resolving-from-another-scope"}

### スコープのリンク {id="linking-scopes"}

`linkTo` は、解決チェーンに別のスコープを追加します。リンクされたスコープは、現在のスコープの後に検索されます:

```kotlin
val sessionScope = getKoin().createScope<UserSession>(userId)
val checkoutScope = getKoin().createScope("checkout_$userId", named("checkout"))

checkoutScope.linkTo(sessionScope)

// checkoutScope、sessionScope、ルートスコープの順で解決される
val cart: CartRepository = checkoutScope.get()
```

`unlink(scope)` はリンクを解除します。ルートスコープは何もリンクできません。

### スコープIDの指定 {id="pointing-at-a-scope-id"}

アノテーションを使用する場合、`@ScopeId` は指定したIDまたは指定した型のスコープインスタンスから特定のコンストラクタパラメータを解決します:

```kotlin
@Factory
class OrderSummary(
    @ScopeId(name = "checkout_main") val navigator: CheckoutNavigator
)

@Factory
class CartBadge(
    @ScopeId(UserSession::class) val cart: CartRepository
)
```

`@ScopeId(name = "checkout_main")` は、DSLにおける `getScope("checkout_main").get<CheckoutNavigator>()` と同じです。型を指定した場合、スコープIDには完全修飾クラス名（`"com.example.UserSession"`）が使用されます。定義の解決時にそのIDを持つスコープインスタンスが存在していなければならず、存在しない場合は `getScope()` が `ScopeNotCreatedException` をスローします。

## スコープアーキタイプ {id="scope-archetypes"}

型で宣言されたスコープ（`scope<MainActivity>`）は、その型にのみ適用されます。**スコープアーキタイプ (scope archetype)** は、特定の種類のすべてのコンポーネント（すべてのViewModel、すべてのActivity、すべてのFragmentなど）で共有される汎用的なスコープ宣言です。定義は一度だけ宣言すればよく、コンポーネントごとに固有のスコープインスタンスが作成されます。

**コンパイラプラグイン DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }

    // Android専用、koin-android
    activityScope {
        scoped<ActivityPresenter>()
    }
    fragmentScope {
        scoped<FragmentPresenter>()
    }
}
```

**アノテーション**
アーキタイプアノテーションは、`@Scope` および `@Scoped` を置き換えます:

```kotlin
import org.koin.core.annotation.ViewModelScope
import org.koin.android.annotation.ActivityScope
import org.koin.android.annotation.FragmentScope

@ViewModelScope
class UserCache(private val api: ApiService)

@ActivityScope
class ActivityPresenter

@FragmentScope
class FragmentPresenter
```

アーキタイプアノテーションは、`@Module` クラス内の関数に対しても機能します。

**コンストラクタ / クラシック DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }

    // Android専用、koin-android
    activityScope {
        scopedOf(::ActivityPresenter)
    }
    fragmentScope {
        scopedOf(::FragmentPresenter)
    }
}
```

| アーキタイプ | DSL | アノテーション | クローズされるタイミング | プラットフォーム |
|-----------|-----|------------|-------------|----------|
| ViewModel | `viewModelScope { }` | `@ViewModelScope` | ViewModel が破棄（クリア）されたとき | すべて (`koin-core-viewmodel`) |
| Activity | `activityScope { }` | `@ActivityScope` | Activity が破棄されたとき | Android |
| Activity retained | `activityRetainedScope { }` | `@ActivityRetainedScope` | Activity が終了したとき（設定変更を越えて維持される） | Android |
| Fragment | `fragmentScope { }` | `@FragmentScope` | Fragment が破棄されたとき | Android |

アーキタイプは定義の宣言のみを行います。コンポーネントはランタイムにスコープインスタンスを開始します。Androidの場合、[Android Scopes](/docs/reference/koin-android/scope) で説明されている `activityScope()` および `fragmentScope()` デリゲートを使用します。

ViewModelアーキタイプは、Koinが各ViewModelに対してスコープを作成できるように、起動時に `viewModelScopeFactory()` オプションを設定する必要があります。これは `@KoinViewModelScopeApi` および `@KoinExperimentalAPI` としてマークされています:

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

コンストラクタでスコープ付き依存関係を受け取るViewModelは、`viewModelScope { }` の内部で宣言する必要があります。ViewModelの詳細については [ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。

:::tip
クローズされないスコープは、そのインスタンスを存続させ続けます。実際のユーザーセッション内で開かれたままのスコープやリークしたインスタンスを確認するには、[プロダクション監視 (Production Monitoring)](/docs/tooling/production-monitoring) を参照してください。
:::

## 制限事項 {id="limits"}

- **手動ライフサイクル**: アーキタイプやプラットフォームのヘルパーを使用しない場合、スコープの作成とクローズは手動で行う必要があります。Koinは `close()` の呼び出し忘れを検出しません。
- **ルートからのアクセス不可**: `single` 定義およびルートスコープからは、`scoped` 定義を参照できません。
- **クローズ後は再利用不可**: クローズされたスコープインスタンスを再び開くことはできません。新しいIDで新しいインスタンスを作成してください。
- **一意のID**: すでにアクティブなスコープと同じIDでスコープを作成しようとすると失敗します。スコープが既に存在する可能性がある場合は、`getOrCreateScope` を使用してください。

## 関連ドキュメント {id="related"}

- [Android Scopes](/docs/reference/koin-android/scope): `ScopeActivity`、`AndroidScopeComponent`、`activityScope()`、および `fragmentScope()`。
- [Scopes in Compose](/docs/reference/koin-compose/compose-scopes): `KoinScope`、`rememberKoinScope`、およびナビゲーションスコープ。
- [Ktor Request Scopes](/docs/reference/koin-ktor/ktor-scopes): HTTPリクエストごとのスコープ。
- [ViewModel](/docs/reference/koin-core/viewmodel): ViewModel の宣言と ViewModel スコープ。
- [Definitions](/docs/reference/koin-core/definitions): `single`、`factory`、`scoped`、および `onClose`。
- [DSL Reference](/docs/reference/koin-core/dsl): スコープに関連するすべてのDSLキーワード。