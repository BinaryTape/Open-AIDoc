---
title: Navigation 3
---

# Navigation 3

このページでは、Koinモジュール内で[Navigation 3](https://developer.android.com/guide/navigation/navigation-3)のエントリを宣言し、それらを`NavDisplay`に渡す方法を説明します。各機能モジュールがそれぞれの画面を提供し、アプリはそれらすべてを単一のエントリプロバイダーで収集します。なお、Navigation 3の基本（バックスタック、`NavDisplay`、`NavEntry`）および[ComposeにおけるViewModel](/docs/reference/koin-compose/compose-viewmodel)について理解していることを前提としています。

このページのすべてのAPIには`@KoinExperimentalAPI`のマークが付けられています。

## セットアップ {id="setup"}

```kotlin
// shared/build.gradle.kts、またはAndroidのapp/build.gradle.kts
plugins {
    kotlin("plugin.serialization")
}

commonMain.dependencies {
    implementation("io.insert-koin:koin-compose-navigation3:$koin_version")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:$serialization_version")
}
```

`koin-compose-navigation3`はAndroid、iOS、JVMデスクトップ、JS、Wasmをターゲットとしています。

## エントリの宣言 {id="declaring-entries"}

ルートは`@Serializable`なクラスです。

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val itemId: String)
```

モジュール内でルートごとに1つの`navigation<T> { }`を宣言します。ラムダはルートを受け取るComposableです。

```kotlin
import org.koin.dsl.navigation3.navigation

val homeModule = module {
    viewModel<HomeViewModel>()

    navigation<HomeRoute> {
        HomeScreen(viewModel = koinViewModel())
    }
}

val detailModule = module {
    viewModel<DetailViewModel>()

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route.itemId) })
    }
}
```

各`navigation<T>`はルート型によって修飾された定義として保存されます。ラムダはKoinの`Scope`をレシーバーとして実行されるため、その中で`get<T>()`を呼び出したり、`koinViewModel()`などのComposable関数を呼び出したりできます。

## エントリプロバイダーの構築 {id="building-the-entry-provider"}

`koinEntryProvider()`は、現在のスコープのすべての`navigation<T>`エントリを収集し、`NavDisplay`用の1つのプロバイダーにまとめます。

```kotlin
import org.koin.compose.navigation3.koinEntryProvider

@Composable
fun App() {
    val backStack = remember { mutableStateListOf<Any>(HomeRoute) }

    NavDisplay(
        backStack = backStack,
        onBack = { backStack.removeLastOrNull() },
        entryProvider = koinEntryProvider()
    )
}
```

`koinEntryProvider<T>()`はバックスタックのルート型を受け取ります。これは`rememberNavBackStack()`を使用する場合は`NavKey`であり、`NavDisplay`が型指定されている場合は独自のルート型になります（`rememberSupportingPaneSceneStrategy<Route>()`のような型指定された`SceneStrategy`を使用すると、`NavDisplay<Route>`になります）。`Any`のままにすると、ビルドは`Argument type mismatch: actual type is 'Function1<Any, NavEntry<Any>>', but 'Function1<Route, NavEntry<Route>>' was expected.`というエラーで失敗します。

### Android Activityからの利用 {id="from-an-android-activity"}

Androidでは、`ComponentCallbacks`の2つの拡張関数によって、ActivityまたはFragmentのスコープからプロバイダーを構築できます。

| 関数 | 動作 |
|----------|----------|
| `entryProvider<T>()` | 遅延デリゲート: `val provider by entryProvider<Any>()` |
| `getEntryProvider<T>()` | プロバイダーを即座に構築 |

これらはコンポーネントのKoinスコープから解決されます。`AndroidScopeComponent`を実装している場合はActivityスコープから、そうでない場合はルートスコープから解決されます。

## スコープ内のエントリ {id="entries-in-a-scope"}

画面がそのスコープとともに生存するオブジェクトを必要とする場合は、スコープ内でエントリを宣言します。`activityRetainedScope`を使用すると、これらは構成変更（Configuration change）をまたいで維持されます。

```kotlin
class Navigator(start: Any) {
    val backStack = mutableStateListOf(start)
    fun goTo(route: Any) { backStack.add(route) }
    fun goBack() { backStack.removeLastOrNull() }
}

val appModule = module {
    activityRetainedScope {
        scoped { Navigator(start = ConversationList) }

        navigation<ConversationList> {
            val navigator = get<Navigator>()
            ConversationListScreen(onClick = { navigator.goTo(ConversationDetail(it)) })
        }

        navigation<ConversationDetail> { route ->
            ConversationDetailScreen(conversationId = route.id)
        }
    }
}

class MainActivity : ComponentActivity(), AndroidScopeComponent {
    override val scope: Scope by activityRetainedScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val navigator: Navigator = get()
            NavDisplay(
                backStack = navigator.backStack,
                onBack = { navigator.goBack() },
                entryProvider = getEntryProvider()
            )
        }
    }
}
```

`getEntryProvider()`はActivityスコープからエントリを読み取ります。スコープ内で宣言されたエントリは、そのスコープからのみ参照可能です。`activityRetainedScope`の詳細については、[Android Scopes](/docs/reference/koin-android/scope)を参照してください。

## エントリ用のViewModel {id="viewmodels-for-an-entry"}

ViewModelのスコープをそのエントリに限定するには、`NavDisplay`にViewModel storeデコレーターを追加します。これがない場合、`koinViewModel()`はActivityのストアを使用するため、同じルートのすべてのエントリで1つのインスタンスが共有されます。

```kotlin
NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryDecorators = listOf(
        rememberSaveableStateHolderNavEntryDecorator(),
        rememberViewModelStoreNavEntryDecorator()
    ),
    entryProvider = koinEntryProvider()
)
```

ルート、またはそのフィールドをパラメータとして渡します。

**Compiler Plugin DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModel<DetailViewModel>()

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**Annotations**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

// navigation<T> エントリはDSLモジュールで宣言します
val detailModule = module {
    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**Constructor / Classic DSL**
```kotlin
class DetailViewModel(
    val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModelOf(::DetailViewModel) // routeはparametersOf(route)から渡されます

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

## エントリのメタデータ {id="entry-metadata"}

`navigation<T>`は`metadata`マップを受け取り、それが`NavEntry`に渡されます。エントリごとの画面遷移（トランジション）や、リスト/詳細などのシーン戦略（Scene strategy）に使用します。

```kotlin
val conversationModule = module {
    navigation<ConversationList>(metadata = ListDetailSceneStrategy.listPane()) {
        ConversationListScreen()
    }

    navigation<ConversationDetail>(metadata = ListDetailSceneStrategy.detailPane()) { route ->
        ConversationDetailScreen(route.id)
    }

    navigation<ModalRoute>(
        metadata = NavDisplay.transitionSpec {
            slideInVertically(initialOffsetY = { it }) togetherWith ExitTransition.KeepUntilTransitionsFinished
        }
    ) {
        ModalScreen()
    }
}
```

その後、シーン戦略を`NavDisplay`に渡します（`sceneStrategy = rememberListDetailSceneStrategy()`）。メタデータのキーはKoinからではなく、Navigation 3やAdaptiveライブラリによって提供されるものです。

## Navigation 2からの移行 {id="from-navigation-2"}

| Navigation 2 | Koinを使用したNavigation 3 |
|--------------|------------------------|
| `NavHost { composable(...) }` 内の文字列または型指定されたルート | `@Serializable` なルートクラス |
| `NavHost` 内の `composable<Route> { ... }` | Koinモジュール内の `navigation<Route> { ... }` |
| `NavHost(navController, startDestination)` | `NavDisplay(backStack, entryProvider = koinEntryProvider())` |
| `SavedStateHandle` から引数を読み取り | ラムダに渡されるルートオブジェクト |

## APIサマリー {id="api-summary"}

| API | パッケージ | 目的 |
|-----|---------|---------|
| `Module.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | モジュール内でエントリを宣言 |
| `ScopeDSL.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | スコープ内でエントリを宣言 |
| `koinEntryProvider<T>(scope)` | `org.koin.compose.navigation3` | 現在のComposeスコープからのエントリプロバイダー |
| `entryProvider<T>()`, `getEntryProvider<T>()` | `org.koin.androidx.compose.navigation3` | ActivityまたはFragmentからのエントリプロバイダー（Android） |

## 関連情報 {id="related"}

- [ComposeにおけるViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` とそのオーナー。
- [Androidスコープ](/docs/reference/koin-android/scope): `activityRetainedScope` とActivityスコープ。
- [注入パラメータ](/docs/reference/koin-core/injection-parameters): `parametersOf` と `@InjectedParam`。
- [Koin for Compose](/docs/reference/koin-compose/compose): パッケージとKoinの開始。
- [Navigation 3 recipes](https://github.com/android/nav3-recipes): GoogleによるNavigation 3自体のサンプル。