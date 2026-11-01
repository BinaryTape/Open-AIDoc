---
title: ライフサイクルと状態
---

# ライフサイクルと状態

このページでは、Koinで注入（インジェクト）されたオブジェクトがComposeのライフサイクル内でどのように動作するかを解説します。再コンポジション（recomposition）時に何が起こるのか、Composableがコンポジション（composition）から離脱したときに各Koin APIは何を解放するのか、そして注入呼び出しをどこに配置すべきかについて説明します。本ページは、`koinInject()` と `koinViewModel()`（[Koin for Compose](/docs/reference/koin-compose/compose) を参照）および [Composeのライフサイクル](https://developer.android.com/develop/ui/compose/lifecycle) を理解していることを前提としています。

## 再コンポジション {id="recomposition"}

`koinInject()` は依存関係を1度だけ解決し、qualifier（修飾子）、スコープ、パラメータをキーとして `remember` で保持します。

```kotlin
@Composable
fun UserScreen(userId: String) {
    val repository = koinInject<UserRepository>() // 1度だけ解決される
    val presenter = koinInject<UserPresenter> { parametersOf(userId) } // userIdが変更されたときに再度解決される
}
```

同じキーでの再コンポジションでは、同じオブジェクトが取得されます。キーが変更された場合（新しい `userId` など）、Koinは再度解決を行います。`single` の場合は同じインスタンスが返されます。`factory` の場合は新しいインスタンスが作成されます。

`koinViewModel()` は `remember` を使用しません。ViewModelは `ViewModelStoreOwner` に保存され、再コンポジションやAndroidの設定変更（Configuration changes）をまたいで生存します。そのパラメータは作成時にのみ使用されます（[ComposeにおけるViewModel](/docs/reference/koin-compose/compose-viewmodel) を参照）。

どちらもComposable関数のため、`remember { }`、`LaunchedEffect`、または `onClick` ラムダの内部から呼び出すことはできません。Composableの本体で呼び出し、その結果をラムダ内で使用してください。

```kotlin
@Composable
fun SaveButton() {
    val repository = koinInject<UserRepository>()

    Button(onClick = { repository.save() }) {
        Text("Save")
    }
}
```

## 何が、いつ解放されるか {id="what-is-released-and-when"}

| API | 再コンポジション時 | Composableがコンポジションから離脱したとき |
|-----|------------------|--------------------------------------------|
| `koinInject()` | キーが変更されていない場合は同じオブジェクト | 参照が破棄される。Koinは `single` または `scoped` インスタンスを保持 |
| `koinViewModel()` | 同じViewModel | 何もしない。ViewModelはその `ViewModelStoreOwner` とともにクリアされる |
| `KoinApplication` | 同じKoinインスタンス | Koinは実行を継続。コンポジションが破棄（abandoned）された場合にのみ停止 |
| `KoinScope`, `rememberKoinScope` | 同じスコープ | スコープがクローズされる |
| `KoinNavigationScope` | 同じスコープ | スコープは保持される。コンポジションが破棄された場合にのみクローズ |
| `UnboundKoinScope` | 同じスコープ | 何もしない。自身でスコープをクローズする |
| `rememberKoinModules` | モジュールは1度だけロードされる | `unloadOnForgotten` を設定した場合にのみモジュールがアンロードされる |

詳細: [Composeにおけるスコープ](/docs/reference/koin-compose/compose-scopes)、[動的モジュール](/docs/reference/koin-compose/compose-modules)。

## どこで注入するか {id="where-to-inject"}

画面レベル（Screen level）で注入し、プレーンなデータやラムダを下位に渡します。これにより、子ComposableはKoinに依存しなくなり、プレビューやテストでKoinインスタンスが不要になります。

```kotlin
@Composable
fun UserListScreen(viewModel: UserListViewModel = koinViewModel()) {
    val users by viewModel.users.collectAsState()
    UserList(users = users, onDelete = viewModel::delete)
}

@Composable
fun UserList(users: List<User>, onDelete: (User) -> Unit) {
    LazyColumn {
        items(users) { user -> UserCard(user, onDelete) }
    }
}
```

`LazyColumn` のアイテム内で `koinInject()` を使用することは避けてください。各アイテムが独自の解決と `remember` を実行してしまいます。親で1度だけ注入し、そのオブジェクトまたはラムダを渡すようにしてください。

### パラメータとして渡すか、注入するか？ {id="pass-as-a-parameter-or-inject"}

| パラメータとして渡すもの | Koinで注入するもの |
|---------------------|------------------|
| 変化する値: ID、検索クエリ、選択項目 | 長寿命のサービス: リポジトリ、ユースケース |
| ナビゲーション引数 | インフラストラクチャ: データベース、HTTPクライアント |
| 親がすでに持っているデータ | ViewModel |

```kotlin
@Composable
fun UserProfile(
    userId: String,                              // 変化するもの: パラメータとして渡す
    repository: UserRepository = koinInject()   // サービス: 注入する
) {
    var user by remember { mutableStateOf<User?>(null) }

    LaunchedEffect(userId) {
        user = repository.getUser(userId)
    }

    user?.let { ProfileContent(it) }
}
```

## 注入されたオブジェクトと安定性 {id="injected-objects-and-stability"}

Koinは、Composeが型を認識する方法（安定性判定）を変更しません。`UserRepository` や `UserViewModel` 型のComposableパラメータは、他のクラスと同様にComposeコンパイラのルールに従って安定（stable）または不安定（unstable）と判定されます。Composableでスキップ（skipping）が重要な場合は、注入されたオブジェクトの代わりに安定した値（State、プリミティブ型、ラムダ）を渡してください。

## 副作用（Side effects） {id="side-effects"}

注入されたオブジェクトは通常のKotlinオブジェクトです。他の値と同様に `LaunchedEffect`、`DisposableEffect`、または `SideEffect` で使用できます。まずComposableの本体で解決してください。

```kotlin
@Composable
fun EventScreen() {
    val eventBus = koinInject<EventBus>()

    DisposableEffect(eventBus) {
        val listener = eventBus.subscribe { event -> /* ... */ }
        onDispose { eventBus.unsubscribe(listener) }
    }
}
```

## 関連情報 {id="related"}

- [Koin for Compose](/docs/reference/koin-compose/compose): `koinInject()` とKoinの起動。
- [ComposeにおけるViewModel](/docs/reference/koin-compose/compose-viewmodel): ViewModelのオーナーとパラメータ。
- [Composeにおけるスコープ](/docs/reference/koin-compose/compose-scopes): UIツリーにバインドされたスコープ。
- [動的モジュール](/docs/reference/koin-compose/compose-modules): Composableに応じたモジュールのロードとアンロード。
- [Composeのテスト](/docs/reference/koin-compose/compose-testing): プレビューとUIテスト。