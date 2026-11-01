---
title: ダイナミックモジュール
---

# ダイナミックモジュール

このページでは、Composable がコンポジションに入ったときに Koin モジュールを読み込み、離れたときにアンロードできる `rememberKoinModules` について解説します。これを使用すると、特定の画面が表示されたときにのみ、その機能の定義を読み込むことができます。事前に[モジュール](/docs/reference/koin-core/modules)の宣言方法を理解しておく必要があります。

`rememberKoinModules` は `io.insert-koin:koin-compose` に含まれており、`@KoinExperimentalAPI` が付与されています。

## rememberKoinModules {id="rememberkoinmodules"}

```kotlin
import org.koin.compose.module.rememberKoinModules

val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}

@OptIn(KoinExperimentalAPI::class)
@Composable
fun CheckoutScreen() {
    rememberKoinModules(unloadOnForgotten = true) { listOf(checkoutModule) }

    val viewModel = koinViewModel<CheckoutViewModel>()
}
```

ラムダは読み込むモジュールを返します。Koin は `CheckoutScreen` が初めてコンポーズされたときに、それらをコンポジションの Koin インスタンスに読み込みます。リコンポジション時に再度読み込まれることはありません。

その定義を必要とする `koinInject()` や `koinViewModel()` の呼び出しよりも前に、`rememberKoinModules` を呼び出してください。

## アンロード {id="unloading"}

デフォルトでは、Composable がコンポジションを離れた後もモジュールは読み込まれたままになります。3つのパラメータでアンロードを制御できます。

| パラメータ | デフォルト値 | 効果 |
|-----------|---------|--------|
| `unloadOnForgotten` | `unloadModules` | Composable がコンポジションを離れたときにアンロードする |
| `unloadOnAbandoned` | `unloadModules` | コンポジションが破棄された場合にアンロードする |
| `unloadModules` | `false` | 上記両パラメータのデフォルト値 |

```kotlin
// 両方のケースでアンロードする
rememberKoinModules(unloadModules = true) { listOf(checkoutModule) }
```

アンロードを行うと、定義が削除され、その `single` インスタンスも破棄されます。インスタンスへの参照をまだ保持しているコードはそのまま参照を保持しますが、Koin はその型をそれ以上解決できなくなります。他の画面でまだ使用されているモジュールはアンロードしないでください。

## デスティネーションごとの読み込み {id="loading-per-destination"}

ユーザーが特定の機能に遷移したときにそれを読み込むには、ナビゲーションのデスティネーション内で `rememberKoinModules` を呼び出します。

```kotlin
NavHost(navController, startDestination = HomeRoute) {
    composable<HomeRoute> {
        HomeScreen()
    }
    composable<CheckoutRoute> {
        rememberKoinModules(unloadOnForgotten = true) { listOf(checkoutModule) }
        CheckoutScreen()
    }
}
```

## モジュールの記述スタイル {id="module-styles"}

**Compiler Plugin DSL**
```kotlin
val checkoutModule = module {
    factory<CheckoutRepository>()
    viewModel<CheckoutViewModel>()
}
```

**アノテーション**
`rememberKoinModules` は `Module` の値を受け取ります。アノテーションが付与された `@Module` クラスは、`@KoinApplication` 経由で起動時に読み込まれます（[モジュール](/docs/reference/koin-core/modules)を参照）。機能をオンデマンドで読み込むには、DSL を使用してモジュールを宣言してください。

**Constructor / Classic DSL**
```kotlin
val checkoutModule = module {
    factoryOf(::CheckoutRepository)
    viewModelOf(::CheckoutViewModel)
}
```

## 制限事項 {id="limits"}

- **メインスレッド**: モジュールはコンポジション中に同期的に読み込まれます。大規模なモジュールは、そのフレームの処理時間を増加させます。起動時にバックグラウンドでモジュールを読み込むには、[Lazy モジュール](/docs/reference/koin-core/lazy-modules)を参照してください。
- **オーバーライド**: 後から読み込まれたモジュールは、同じ型の以前の定義を上書きします（[定義](/docs/reference/koin-core/definitions)を参照）。それをアンロードしても、以前の定義は復元されません。
- **プレビュー**: `rememberKoinModules` には実行中の Koin インスタンスが必要です。プレビューで使用する場合は、`KoinApplicationPreview` を使用してください（[Compose テスト](/docs/reference/koin-compose/compose-testing)を参照）。

## 関連情報 {id="related"}

- [モジュール](/docs/reference/koin-core/modules): モジュールの宣言と合成。
- [Lazy モジュール](/docs/reference/koin-core/lazy-modules): 起動時にバックグラウンドでモジュールを読み込む。
- [Koin の起動](/docs/reference/koin-core/starting-koin): Compose の外部でモジュールを読み込みおよびアンロードする。
- [Compose におけるスコープ](/docs/reference/koin-compose/compose-scopes): Composable にバインドされたインスタンス。
- [ライフサイクルと状態](/docs/reference/koin-compose/compose-lifecycle): 各 Compose API が何をいつ解放するか。