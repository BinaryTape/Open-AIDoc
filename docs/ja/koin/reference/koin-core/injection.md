---
title: インジェクション
---

# インジェクション

ほとんどのクラスはコンストラクタ経由で依存関係を受け取り、Koinがそれらを提供（注入）します（[Constructor parameters](/docs/reference/koin-core/definitions#constructor-parameters) を参照）。しかし、Androidの `Activity`、`main()` 関数、フレームワークによって生成されるクラスなど、それができないコードもあります。このページでは、そうしたコード内でKoinからインスタンスを取得するための関数（`get()`、`inject()`、それらのnull許容バリアント、および `getAll()`）について解説します。

## コンストラクタインジェクションを優先する {id="constructor-injection-first"}

このページで紹介する関数は、Koinがクラスを生成できない場合にのみ使用してください:

```kotlin
// Koinがこのクラスを生成: 依存関係はコンストラクタ経由で渡される
class UserService(
    private val repository: UserRepository,
    private val validator: UserValidator,
)

// Androidがこのクラスを生成: inject() で依存関係を取得する
class UserActivity : AppCompatActivity() {
    private val userService: UserService by inject()
}
```

コンストラクタパラメータを持つクラスは、Koinコンテナがなくてもフェイク（モック）を渡すことでテストできます。一方、`get()` を呼び出すクラスは、テスト時に実行中のコンテナが必要です。デフォルト引数の値で `get()` を呼び出すこと（`class UserService(val repository: UserRepository = get())`）は絶対に避けてください。代わりにモジュール内でクラスを宣言してください。

## 遅延取得と即時取得 {id="lazy-and-eager-retrieval"}

どのスタイルでも取得コードは同様です:

```kotlin
class UserActivity : AppCompatActivity() {

    // 遅延 (lazy): プロパティへの初回アクセス時に解決される
    private val userService: UserService by inject()

    // 即時 (eager): プロパティの初期化時に即座に解決される
    private val analytics: Analytics = get()
}
```

| 関数 | 戻り値 | 解決タイミング |
|----------|---------|----------|
| `by inject<T>()` | プロパティデリゲートとして使用される `Lazy<T>` | 初回アクセス時 |
| `get<T>()` | `T` | 即時 |

プロパティには `by inject()` を使用してください。これにより、Koinの準備が完全に整う前にクラスが生成された場合でも対応でき（`Activity` のフィールドは `onCreate()` の前に初期化されます）、一度も使用されないインスタンスは生成されずに済みます。関数スコープ内などで今すぐ値が必要な場合は `get()` を使用してください。

`inject()` は `mode` パラメータ（Kotlinの `LazyThreadSafetyMode`）を受け取ります。JVMでのデフォルトは `SYNCHRONIZED` です。

## get() と inject() が利用可能な場所 {id="where-get-and-inject-are-available"}

`get()` や `by inject()` は以下から呼び出すことができます:

- Androidクラス: 特別なインターフェースを実装することなく、`Activity`、`Fragment`、`Service`、その他の `ComponentCallbacks` から利用可能です。[Android Entry Points](/docs/reference/koin-android/entry-points) を参照してください。
- `KoinComponent` を実装した任意のクラス。[KoinComponent](/docs/reference/koin-core/koin-component) を参照してください。
- `Koin` インスタンス: `KoinPlatform.getKoin().get<UserService>()` はグローバルコンテナを使用し、`koinApp.koin.get<UserService>()` は独立したコンテナを使用します。
- 定義の内部（Classic DSL）: `get()`、`inject()`、`getOrNull()`、`injectOrNull()`、`getAll()` は現在のスコープから解決されます。

プラットフォーム固有のAPIも独自の名称で同じルールに従います:

- Compose: `koinInject()` および `koinViewModel()`。[Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。
- Android ViewModel: `by viewModel()` および `by activityViewModel()`。[Android ViewModel](/docs/reference/koin-android/viewmodel) を参照してください。
- Ktor: `Application`、`Route`、`ApplicationCall` 内での `by inject()`。[Koin for Ktor](/docs/reference/koin-ktor/ktor) を参照してください。

## オプショナルな依存関係 {id="optional-dependencies"}

定義が存在しない可能性がある場合は、null許容バリアントを使用します。これらは `NoDefinitionFoundException` をスローする代わりに `null` を返します:

```kotlin
val koin = KoinPlatform.getKoin()

val tracker: Tracker? = koin.getOrNull()
val crashReporter: CrashReporter? by koin.injectOrNull()
```

`getOrNull()` と `injectOrNull()` は、`Koin`、`Scope`、および定義の内部に存在します。`KoinComponent` インターフェースは `get()` と `inject()` のみを提供しているため、そこでは `getKoin().getOrNull<T>()` を呼び出してください。

コンストラクタパラメータの場合は、null許容（`tracker: Tracker?`）として宣言すると、定義が存在しない場合にKoinが `null` を渡します。[Constructor parameters](/docs/reference/koin-core/definitions#constructor-parameters) を参照してください。

ライブラリ内などでKoin自体が開始されていない可能性がある場合、`KoinPlatform.getKoinOrNull()` は例外をスローする代わりに `null` を返します。

## 特定の型のすべてのインスタンス {id="all-instances-of-a-type"}

`getAll<T>()` は、すべての定義にわたって型 `T` にバインドされているすべてのインスタンスを返します:

```kotlin
val koin = KoinPlatform.getKoin()

val interceptors: List<Interceptor> = koin.getAll()
```

このリストには、クオリファイアの有無にかかわらず、メインの型またはバインドされた型が `T` である各定義が含まれます。該当するものがない場合は空のリストになります。コンストラクタパラメータの場合も、`List<Interceptor>` パラメータを使用することで同様に機能します。コレクションのパターンについては、[Advanced Patterns](/docs/reference/koin-core/advanced-patterns) で扱っています。

## 呼び出し側でのクオリファイアとパラメータ {id="qualifiers-and-parameters-at-the-call-site"}

すべての取得関数は、クオリファイアとパラメータブロックを受け取ることができます:

```kotlin
val localDb: Database by inject(named("local"))

val presenter: UserPresenter = get { parametersOf(userId) }

val detail: DetailPresenter = get(named("compact")) { parametersOf(itemId) }
```

- クオリファイア (Qualifier): 同じ型の複数の定義の中から1つを選択します。[Qualifiers](/docs/reference/koin-core/qualifiers) を参照してください。
- パラメータ (Parameters): 呼び出し元だけが知っている値であり、定義に渡されます。[Injected Parameters](/docs/reference/koin-core/injection-parameters) を参照してください。

`by inject()` の場合、パラメータブロックは初回アクセス時に実行されるため、インスタンス生成後に設定されたプロパティを読み取ることができます。

## 解決に失敗した場合 {id="when-resolution-fails"}

型とクオリファイアに一致する定義がない場合、`get()` は `NoDefinitionFoundException` をスローします。`by inject()` の場合、例外はプロパティを宣言した場所ではなく、プロパティへの初回アクセス時に発生します。Compiler Plugin を使用している場合、`get()` および `inject()` の呼び出しはビルド時に start 呼び出しのグラフと照合してチェックされます。

よくあるエラーやKoinのメッセージの読み方については、[Troubleshooting](/docs/reference/koin-core/troubleshooting) を参照してください。

## 関連ドキュメント {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): コンストラクタインジェクションとパラメータの解決方法。
- [KoinComponent](/docs/reference/koin-core/koin-component): 任意のクラスに `get()` や `inject()` へのアクセス権を付与する。
- [Android Entry Points](/docs/reference/koin-android/entry-points): Activity、Fragment、Service、Receiver、View でのインジェクション。
- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()` およびその他のCompose API。
- [Scopes](/docs/reference/koin-core/scopes): ルートコンテナの代わりにスコープからインスタンスを取得する。