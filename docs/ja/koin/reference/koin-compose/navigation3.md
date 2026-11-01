---
title: Navigation 3
---

# Navigation 3

このページでは、Koinモジュール内で[Navigation 3](https://developer.android.com/guide/navigation/navigation-3)のエントリを宣言し、それらを`NavDisplay`に渡す方法を説明します。各機能モジュールがそれぞれの画面を提供し、アプリはそれらすべてを1つのエントリープロバイダーで収集します。このドキュメントは、Navigation 3の基本（バックスタック、`NavDisplay`、`NavEntry`）および[ComposeにおけるViewModel](/docs/reference/koin-compose/compose-viewmodel)を理解していることを前提としています。

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

`koin-compose-navigation3`は、Android、iOS、JVMデスクトップ、JS、Wasmをターゲットとしています。

## エントリの宣言 {id="declaring-entries"}

ルート（Route）は`@Serializable`クラスです：

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val itemId: String)
```

モジュール内でルートごとに1つの`navigation<T> { }`を宣言します。ラムダはルートを受け取るComposableです：

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

各`navigation<T>`は、ルートタイプによって修飾された定義として保存されます。ラムダはレシーバーとしてKoinの`Scope`を使用して実行されるため、その中で`get<T>()`や、`koinViewModel()`などのComposable関数を呼び出すことができます。

## エントリープロバイダーの構築 {id="building-the-entry-provider"}

`koinEntryProvider()`は、現在のスコープのすべての`navigation<T>`エントリを`NavDisplay`用の1つのプロバイダーに収集します：

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

`rememberNavBackStack()`を使用する場合、ルートは`NavKey`を実装します。バックスタックの型と一致させるには`koinEntryProvider<NavKey>()`を使用してください。

### Android Activityからの利用 {id="from-an-android-activity"}

Androidでは、`ComponentCallbacks`の2つの拡張関数を使用してActivityまたはFragmentのスコープからプロバイダーを構築します：

| 関数 | 動作 |
|----------|----------|
| `entryProvider<T>()` | 遅延デリゲート：`val provider by entryProvider<Any>()` |
| `getEntryProvider<T>()` | プロバイダーを即座に構築 |

これらはコンポーネントのKoinスコープから解決されます。`AndroidScopeComponent`を実装している場合はActivityスコープから、そうでない場合はルートスコープから解決されます。

## スコープ内のエントリ {id="entries-in-a-scope"}

画面がそのスコープと一緒に存続するオブジェクトを必要とする場合は、スコープ内でエントリを宣言します。`activityRetainedScope`を使用すると、設定変更（Configuration Changes）をまたいで存続します：

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

`getEntryProvider()`はActivityスコープからエントリを読み込みます。スコープ内で宣言されたエントリは、そのスコープからのみ参照可能です。`activityRetainedScope`については、[Androidスコープ](/docs/reference/koin-android/scope)で説明されています。

## エントリ用のViewModel {id="viewmodels-for-an-entry"}

ViewModelをエントリにスコープ設定するには、ViewModel storeデコレーターを`NavDisplay`に追加します。これがない場合、`koinViewModel()`はActivityのストアを使用し、同じルートのすべてのエントリが1つのインスタンスを共有することになります：

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

ルートまたはそのフィールドをパラメータとして渡します：

**コンパイラプラグインDSL**
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

**アノテーション**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

// navigation<T>エントリはDSLモジュールで宣言されます
val detailModule = module {
    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

**コンストラクタ / クラシックDSL**
```kotlin
class DetailViewModel(
    val route: DetailRoute,
    private val repository: ItemRepository
) : ViewModel()

val detailModule = module {
    viewModelOf(::DetailViewModel) // routeはparametersOf(route)から提供されます

    navigation<DetailRoute> { route ->
        DetailScreen(viewModel = koinViewModel { parametersOf(route) })
    }
}
```

## エントリのメタデータ {id="entry-metadata"}

`navigation<T>`は、`NavEntry`に渡される`metadata`マップを受け取ります。エントリごとのトランジション（遷移）や、リスト/詳細などのシーン戦略（Scene strategies）に使用します：

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

その後、シーン戦略を`NavDisplay`に渡します（`sceneStrategy = rememberListDetailSceneStrategy()`）。メタデータのキーはKoinからではなく、Navigation 3およびAdaptiveライブラリから提供されます。

## Navigation 2からの変更点 {id="from-navigation-2"}

| Navigation 2 | Koinを使用したNavigation 3 |
|--------------|------------------------|
| `NavHost { composable(...) }`内の文字列または型付きルート | `@Serializable`なルートクラス |
| `NavHost`内の`composable<Route> { ... }` | Koinモジュール内の`navigation<Route> { ... }` |
| `NavHost(navController, startDestination)` | `NavDisplay(backStack, entryProvider = koinEntryProvider())` |
| `SavedStateHandle`から読み取る引数 | ラムダに渡されるルートオブジェクト |

## API概要 {id="api-summary"}

| API | パッケージ | 目的 |
|-----|---------|---------|
| `Module.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | モジュール内でエントリを宣言する |
| `ScopeDSL.navigation<T>(metadata) { }` | `org.koin.dsl.navigation3` | スコープ内でエントリを宣言する |
| `koinEntryProvider<T>(scope)` | `org.koin.compose.navigation3` | 現在のComposeスコープからエントリープロバイダーを取得する |
| `entryProvider<T>()`, `getEntryProvider<T>()` | `org.koin.androidx.compose.navigation3` | ActivityまたはFragmentからエントリープロバイダーを取得する（Android） |

## 関連情報 {id="related"}

- [ComposeにおけるViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()`とそのオーナー。
- [Androidスコープ](/docs/reference/koin-android/scope): `activityRetainedScope`とActivityスコープ。
- [注入パラメータ](/docs/reference/koin-core/injection-parameters): `parametersOf`と`@InjectedParam`。
- [Koin for Compose](/docs/reference/koin-compose/compose): パッケージとKoinの開始。
- [Navigation 3 recipes](https://github.com/android/nav3-recipes): Navigation 3自体のGoogle公式サンプル。