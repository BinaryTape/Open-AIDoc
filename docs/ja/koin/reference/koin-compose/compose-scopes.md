---
title: Compose におけるスコープ
---

# Compose におけるスコープ

このページでは、UI ツリーの一部に対して Koin スコープを開く Compose 関数（`KoinScope`、`KoinNavigationScope`、`UnboundKoinScope`、および Android 向けの `KoinActivityScope`、`KoinFragmentScope`）について説明します。このようなブロック内では、`koinInject()` や `koinViewModel()` はそのスコープから解決されます。スコープの仕組みや宣言方法については、[スコープ](/docs/reference/koin-core/scopes)で解説しています。

このページにあるほとんどの関数には `@KoinExperimentalAPI` のアノテーションが付いています。`@OptIn(KoinExperimentalAPI::class)` を使用してオプトインしてください。

## KoinScope {id="koinscope"}

`KoinScope` はスコープを取得または作成し、それを子要素に提供し、Composable がコンポジションから離脱したときにスコープをクローズします。

スコープを宣言します:

**コンパイラプラグイン DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scoped<FeatureCache>()
        scoped<FeatureRepository>()
    }
}
```

**アノテーション**
```kotlin
class FeatureScope

@Scope(FeatureScope::class)
class FeatureCache

@Scope(FeatureScope::class)
class FeatureRepository(private val cache: FeatureCache)
```

**コンストラクタ / クラシック DSL**
```kotlin
class FeatureScope

val featureModule = module {
    scope<FeatureScope> {
        scopedOf(::FeatureCache)
        scopedOf(::FeatureRepository)
    }
}
```

Compose 内でスコープを開きます:

```kotlin
import org.koin.compose.scope.KoinScope

@Composable
fun FeatureScreen() {
    KoinScope<FeatureScope>(scopeID = "feature") {
        FeatureContent()
    }
}

@Composable
fun FeatureContent() {
    val repository = koinInject<FeatureRepository>() // FeatureScope から解決される
}
```

`KoinScope` には 3 つの形式があります:

| 形式 | スコープ |
|------|-------|
| `KoinScope<T>(scopeID) { }` | その ID を持ち、型 `T` で修飾されたスコープを取得または作成する |
| `KoinScope(scopeID, scopeQualifier) { }` | その ID と修飾子を持つスコープを取得または作成する |
| `KoinScope(scopeDefinition = { createScope(...) }) { }` | `Koin` インスタンス上で実行されるラムダによって返されるスコープ |

スコープは、Composable が忘れられた（コンポジションから離脱した）場合、または破棄（abandon）された場合にクローズされます。ルートスコープがクローズされることはありません。

### 複数画面のフロー {id="multi-screen-flows"}

チェックアウトなどのフローの画面間でスコープ付きオブジェクトを共有するには、`NavHost` の上に `KoinScope` を配置します:

```kotlin
@Composable
fun CheckoutFlow() {
    KoinScope<CheckoutFlowScope>(scopeID = "checkout") {
        NavHost(navController, startDestination = CartRoute) {
            composable<CartRoute> { CartScreen() }
            composable<PaymentRoute> { PaymentScreen() }
        }
    }
}

@Composable
fun PaymentScreen() {
    val state = koinInject<CheckoutState>() // CartScreen と同じ CheckoutState
}
```

`CheckoutFlow` がコンポジションから離脱すると、スコープはクローズされます。

:::note
スコープ内で宣言された `viewModel` は、引き続き現在の `ViewModelStoreOwner` に保存されます。`NavHost` 内では、各デスティネーションが独自の ViewModel インスタンスを取得します。画面間で状態を共有するには、`CheckoutState` などの `scoped` オブジェクトを使用するか、`sharedKoinViewModel()` を使用してください（[Compose における ViewModel](/docs/reference/koin-compose/compose-viewmodel) を参照）。
:::

## rememberKoinScope {id="rememberkoinscope"}

`rememberKoinScope(scope)` は、作成したスコープを子要素に提供することなく、コンポジションにバインドします。スコープは Composable がコンポジションから離脱したときにクローズされます:

```kotlin
@Composable
fun FeatureScreen() {
    val koin = getKoin()
    val scope = rememberKoinScope(remember { koin.createScope<FeatureScope>("feature") })
    val repository = koinInject<FeatureRepository>(scope = scope)
}
```

## KoinNavigationScope {id="koinnavigationscope"}

`KoinNavigationScope` は、Navigation Compose のデスティネーションごとに 1 つのスコープを開きます。これは `io.insert-koin:koin-compose-viewmodel-navigation` に含まれています。

`navigationScope { }` を使用して定義を宣言します。これにより、`NavBackStackEntry` で修飾されたスコープが作成されます:

```kotlin
import org.koin.module.dsl.navigationScope

val appModule = module {
    navigationScope {
        scoped<ScreenStateHolder>()
        viewModel<ScreenViewModel>()
    }
}
```

アノテーションやコンストラクタ DSL を使用する場合は、DSL モジュール内で同じ `navigationScope { }` ブロックを使用します（コンストラクタ DSL では `scopedOf(::ScreenStateHolder)` を使用）。このスコープ用のアノテーションはありません。

各デスティネーションをラップします:

```kotlin
NavHost(navController, startDestination = ListRoute) {
    composable<ListRoute> { entry ->
        KoinNavigationScope(entry) {
            ListScreen() // 独自の ScreenStateHolder
        }
    }
    composable<DetailRoute> { entry ->
        KoinNavigationScope(entry) {
            DetailScreen() // 別の ScreenStateHolder
        }
    }
}
```

スコープ ID は `NavBackStackEntry.id` です。デスティネーションがコンポジションから離脱してもスコープはクローズされないため、エントリがバックスタックに残っている間は存続します。コンポジションが破棄（abandon）された場合にのみクローズされます。

:::warning
`KoinNavigationScope` は、コンポジションの Koin ではなく、グローバルの Koin インスタンス（`KoinPlatform.getKoin()`）内にスコープを作成します。そのため、`KoinIsolatedContext` 内では動作しません。
:::

## UnboundKoinScope {id="unboundkoinscope"}

`UnboundKoinScope` は、独自に管理するスコープを提供します。Koin がこれをクローズすることはありません:

```kotlin
@OptIn(KoinDelicateAPI::class, KoinExperimentalAPI::class)
@Composable
fun SessionArea(sessionScope: Scope) {
    UnboundKoinScope(scope = sessionScope) {
        SessionContent()
    }
}
```

スコープのライフタイムが UI ツリーに従わない場合（ログイン時に開かれるユーザーセッション、複数のコンポジションルートで共有されるスコープなど）に使用します。これには `@KoinDelicateAPI` のマークが付いています。手動で `scope.close()` を呼び出さない限り、スコープとそのインスタンスがメモリ上に残り続けます。

## Android のスコープ {id="android-scopes"}

これらの関数は `io.insert-koin:koin-androidx-compose`（`KoinActivityScope`、`KoinFragmentScope`）および `koin-compose` の Android ターゲット（`koinActivityInject`）に含まれています。Activity または Fragment は `AndroidScopeComponent` を実装している必要があります。Activity および Fragment スコープの宣言については、[Android のスコープ](/docs/reference/koin-android/scope)で解説しています。

```kotlin
class MainActivity : ComponentActivity(), AndroidScopeComponent {
    override val scope: Scope by activityScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KoinActivityScope {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val presenter = koinInject<MainPresenter>() // Activity スコープから解決される
}
```

`KoinFragmentScope { }` は、Fragment がホストする `ComposeView` 内で同様の動作をします。

`koinActivityInject()` は、ラッピングブロックなしで、任意の深さから Activity スコープを解決します:

```kotlin
@Composable
fun DeepNestedScreen() {
    val session: SessionManager = koinActivityInject()
}
```

`LocalActivity` が `AndroidScopeComponent` を実装していない場合、これは失敗します。

## 比較 {id="comparison"}

| API | スコープのライフタイム | クローズを行う主体 |
|-----|----------------|-----------|
| `KoinScope` | Composable | Koin（Composable がコンポジションから離脱したとき） |
| `rememberKoinScope` | Composable | Koin（Composable がコンポジションから離脱したとき） |
| `KoinNavigationScope` | バックスタックエントリ | Koin（コンポジションが破棄された場合のみ） |
| `UnboundKoinScope` | ユーザー自身 | ユーザー |
| `KoinActivityScope` | Activity | Activity スコープ（`activityScope()`） |
| `KoinFragmentScope` | Fragment | Fragment スコープ（`fragmentScope()`） |

## 関連ドキュメント {id="related"}

- [スコープ](/docs/reference/koin-core/scopes): スコープの宣言、リンク、クローズ。
- [Android のスコープ](/docs/reference/koin-android/scope): Activity、Fragment、ViewModel のスコープ。
- [Compose における ViewModel](/docs/reference/koin-compose/compose-viewmodel): ナビゲーショングラフ全体での ViewModel の共有。
- [ライフサイクルと状態](/docs/reference/koin-compose/compose-lifecycle): 各 Compose API が何をいつ解放するか。
- [動的モジュール](/docs/reference/koin-compose/compose-modules): Composable と共にモジュールをロードする。