---
title: Compose における ViewModel
---

# Compose における ViewModel

このページでは、ViewModel を取得する Compose 関数（`koinViewModel()`、`sharedKoinViewModel()`、`koinActivityViewModel()`）について説明します。モジュール内での ViewModel の宣言、パラメータ、`SavedStateHandle`、または ViewModel スコープの扱いは、すべてのプラットフォームで共通です。[ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。

このページのすべての関数は `io.insert-koin:koin-compose-viewmodel` に含まれていますが、`sharedKoinViewModel()` のみ `io.insert-koin:koin-compose-viewmodel-navigation` に含まれています。パッケージについては [Koin for Compose](/docs/reference/koin-compose/compose) を参照してください。

## koinViewModel {id="koinviewmodel"}

```kotlin
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun UserScreen(viewModel: UserViewModel = koinViewModel()) {
    val state by viewModel.state.collectAsState()
    // ...
}
```

`koinViewModel()` は、現在の `ViewModelStoreOwner`（`LocalViewModelStoreOwner`）から ViewModel を取得し、初回時に Koin を使ってインスタンスを作成します。このインスタンスは、そのオーナー（Activity、Fragment、またはナビゲーションデスティネーション）と同じ期間生存します。

これをデフォルト引数として宣言しておくことで、Composable のテスト容易性を維持できます。テストやプレビューでは独自のインスタンスを渡すことができます。

`koinViewModel()` は Composable 関数です。`onClick` などのコールバック内ではなく、Composable の関数本体で呼び出してください。

### パラメータ {id="parameters"}

| パラメータ | デフォルト | 用途 |
|-----------|---------|-----|
| `qualifier` | `null` | 名前付き（[named](/docs/reference/koin-core/qualifiers)）ViewModel 定義を選択する |
| `viewModelStoreOwner` | `LocalViewModelStoreOwner.current` | ViewModel を別のオーナーに保存する |
| `key` | `null` | 1つのオーナー内で同じクラスの複数のインスタンスを保持する |
| `extras` | オーナーの Extras | `SavedStateHandle` の構築に使用される `CreationExtras` |
| `scope` | `currentKoinScope()` | ViewModel の解決に使用される Koin スコープ |
| `parameters` | `null` | [注入されるパラメータ](/docs/reference/koin-core/injection-parameters) を返すラムダ |

### パラメータの受け渡し {id="passing-parameters"}

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel> { parametersOf(itemId) }
}
```

パラメータは ViewModel の作成時のみ使用されます。同じオーナーがすでに `DetailViewModel` を保持している場合、異なる `itemId` を指定してもその既存のインスタンスが返されます。1つのオーナーが値ごとに1つの ViewModel を保持する必要がある場合は、`key` を追加します。

```kotlin
@Composable
fun DetailScreen(itemId: String) {
    val viewModel = koinViewModel<DetailViewModel>(key = itemId) {
        parametersOf(itemId)
    }
}
```

Navigation Compose を使用する場合、各デスティネーションが独自のオーナーを持つため、バックスタック上の画面に対して `key` を指定する必要はありません。

## Navigation Compose との併用 {id="with-navigation-compose"}

`composable { }` デスティネーション内では、現在の `ViewModelStoreOwner` は `NavBackStackEntry` になります。`koinViewModel()` はデスティネーションごとに1つの ViewModel を作成し、デスティネーションがバックスタックからポップされたときにクリアされます。その `SavedStateHandle` にはナビゲーション引数が保持されます。

```kotlin
@Serializable
data class DetailRoute(val itemId: String)

class DetailViewModel(handle: SavedStateHandle) : ViewModel() {
    val itemId: String = handle.toRoute<DetailRoute>().itemId
}

NavHost(navController, startDestination = HomeRoute) {
    composable<DetailRoute> {
        DetailScreen(viewModel = koinViewModel())
    }
}
```

Koin は自動的に `SavedStateHandle` を注入します。コンストラクタパラメータとして宣言してください。宣言側については [ViewModel](/docs/reference/koin-core/viewmodel) を参照してください。

:::warning
`koinNavViewModel()` は、`koin-compose-viewmodel-navigation` と `koin-androidx-compose-navigation` の両方で非推奨（deprecated）になりました。同じパラメータを指定して `koinViewModel()` に置き換えてください。ナビゲーション引数は同様の方法で `SavedStateHandle` に届きます。
:::

### ナビゲーショングラフ内での ViewModel の共有 {id="sharing-a-viewmodel-in-a-navigation-graph"}

`sharedKoinViewModel()` は、親グラフのバックスタックエントリに ViewModel を保存します。そのグラフのすべてのデスティネーションが同じインスタンスを取得します。

```kotlin
import org.koin.compose.viewmodel.sharedKoinViewModel

navigation<BookGraph>(startDestination = BookList) {
    composable<BookList> { entry ->
        val shared = entry.sharedKoinViewModel<BookSharedViewModel>(navController)
        BookListScreen(shared)
    }
    composable<BookDetail> { entry ->
        val shared = entry.sharedKoinViewModel<BookSharedViewModel>(navController)
        BookDetailScreen(shared)
    }
}
```

親グラフはデフォルトで `destination.parent?.route` です。別のグラフを対象にするには `navGraphRoute` を渡します。デスティネーションに親グラフがない場合、`sharedKoinViewModel()` は `koinViewModel()` にフォールバックします。

## Activity 全体での ViewModel（Android） {id="activity-wide-viewmodel-android"}

`koinActivityViewModel()` は、現在の `ComponentActivity` に ViewModel を保存します。その Activity のすべての Composable は、どのナビゲーションデスティネーションにあるかに関係なく、同じインスタンスを取得します。

```kotlin
import org.koin.compose.viewmodel.koinActivityViewModel

@Composable
fun CartBadge() {
    val cart = koinActivityViewModel<CartViewModel>()
}

@Composable
fun CartScreen() {
    val cart = koinActivityViewModel<CartViewModel>() // CartBadge と同じインスタンス
}
```

これは Android でのみ利用可能で、`LocalActivity` が `ComponentActivity` でない場合は失敗します。`koinViewModel()` と同じ `qualifier`、`key`、`scope`、`parameters` 引数を受け取ります。

## スコープ付き依存関係 {id="scoped-dependencies"}

ViewModel は、その依存関係のためのスコープ（`viewModelScope { }` または `@ViewModelScope`）を持つことができます。Compose 側では何も変更はありません。`koinViewModel()` が ViewModel とそのスコープを作成します。宣言方法については [ViewModel](/docs/reference/koin-core/viewmodel) に記載されています。

## API の概要 {id="api-summary"}

| API | インスタンスのオーナー | パッケージ |
|-----|-----------------------|---------|
| `koinViewModel()` | `LocalViewModelStoreOwner`（Activity、Fragment、デスティネーション） | `koin-compose-viewmodel` |
| `NavBackStackEntry.sharedKoinViewModel()` | 親ナビゲーショングラフのエントリ | `koin-compose-viewmodel-navigation` |
| `koinActivityViewModel()` | 現在の `ComponentActivity`（Android） | `koin-compose-viewmodel` |
| `koinNavViewModel()` | 非推奨。`koinViewModel()` を使用 | `koin-compose-viewmodel-navigation` |

## 関連情報 {id="related"}

- [ViewModel](/docs/reference/koin-core/viewmodel): ViewModel の宣言、パラメータ、`SavedStateHandle`、ViewModel スコープ。
- [Android ViewModel](/docs/reference/koin-android/viewmodel): Activity および Fragment での `by viewModel()`。
- [Navigation 3](/docs/reference/koin-compose/navigation3): Navigation 3 エントリでの ViewModel。
- [Lifecycle and State](/docs/reference/koin-compose/compose-lifecycle): Compose における各要素のライフサイクルと生存期間。
- [Compose Testing](/docs/reference/koin-compose/compose-testing): `koinViewModel()` を使用する Composable のテスト。