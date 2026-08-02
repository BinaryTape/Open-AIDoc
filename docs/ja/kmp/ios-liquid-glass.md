[//]: # (title: Compose Multiplatform アプリでの Liquid Glass の活用)
<show-structure depth="1"/>

<web-summary>ナビゲーションをネイティブの SwiftUI に移行することで、Compose Multiplatform アプリに iOS 26 の Liquid Glass を導入するためのステップバイステップのチュートリアルです。</web-summary>

[Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass) は、iOS 26 で導入された Apple のビジュアルデザインシステムであり、UI 要素にガラスのような半透明感と流動性をもたらします。
Compose Multiplatform アプリでこれを採用するには、ネイティブの SwiftUI シェルが必要です。これは、Liquid Glass 効果がネイティブの `TabView`、`NavigationStack`、およびツールバー API を通じてシステムによってレンダリングされるためです。
SwiftUI がプロジェクトに適さない場合は、[代替アプローチ](#alternative-approaches)を参照してください。

このチュートリアルでは、各画面のコンテンツのレンダリングは Compose に任せたまま、**iOS アプリを完全に Compose 主導のナビゲーションから iOS 26 の Liquid Glass スタイリングを適用したネイティブの SwiftUI ナビゲーションへと移行する**手順を説明します。
アプリがネイティブの `TabView` および `NavigationStack` ビューを使用すると、システムが自動的に Liquid Glass 効果を適用するため、Liquid Glass 専用のコードを記述する必要はありません。

例として、公式の [KotlinConf アプリ](https://apps.apple.com/us/app/kotlinconf/id1299196584)を使用します。

> Xcode 26 以降と iOS 26 SDK が必要です。
>
{style="note"}

* [`main` ブランチ](https://github.com/JetBrains/kotlinconf-app/tree/main) — 開始状態。完全に Compose で実装されたカスタムテーマを使用しています。
* [`lg-nav` ブランチ](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav) — 最終状態。Liquid Glass デザインが適用されています。

![Shared UI](ios-kotlinconf-no-liquid-glass.png){ width="250" style="inline"}
![Native iOS UI with Liquid Glass](ios-kotlinconf-liquid-glass.png){ width="250" style="inline"}

リポジトリをクローンして、いずれかのブランチをチェックアウトして進めるか、またはそれらを並べて比較してください: 
[`main...lg-nav`](https://github.com/JetBrains/kotlinconf-app/compare/main...lg-nav) 

簡略化のため、アプリの 2 つのタブ（**Schedule** と **Info**）のバージョンを移行しますが、同じパターンを任意の数のタブに拡張できます。

## 移行プラン

UI コードが完全に共有されている Compose Multiplatform の構成では、単一の `ComposeUIViewController` が iOS の UI 全体（タブ、ナビゲーションスタック、戻るジェスチャ、画面コンテンツ）を担当します。
Compose Multiplatform の iOS 上でのナビゲーション遷移はネイティブのように感じられるよう設計されていますが、iOS 26 の Liquid Glass タブバースタイリングのような一部のプラットフォームレベルの機能は、ネイティブの iOS コンポーネントを通じてのみ利用可能です。

解決策は、ネイティブの iOS にタブバーとナビゲーションスタックを所有させつつ、Compose が各画面のコンテンツをレンダリングし続けるようにすることです。

**移行前:**

```
ContentView
  └── ComposeView (Compose Multiplatform)
```

**移行後:**

```
ContentView
  └── TabView  (Liquid Glass, iOS 26)
        ├── タブ: Schedule
        │     └── NavigationStack
        │           ├── NativeNavComposeView  ← Compose タブルート
        │           └── DetailComposeView     ← Compose 詳細画面、遷移先ごとに1つ
        └── タブ: Info
              └── NavigationStack
                    ├── NativeNavComposeView  ← Compose タブルート
                    └── DetailComposeView     ← Compose 詳細画面、遷移先ごとに1つ
```

新しい構成でのナビゲーションフローは以下の通りです。

* SwiftUI が、各タブに `NavigationStack` を含む `TabView` を作成します。
* Compose は引き続き各画面のコンテンツをレンダリングしますが、バックスタックは管理しなくなります。
* ユーザーが Compose 画面からナビゲーションをトリガー（例：リストの行をタップ）すると、イベントは `onNavigate` を介して Swift に転送されます。
* Swift のコーディネーターはルートを自身の `NavigationStack` にプッシュし、それによって単一の Compose 画面をホストする新しい `UIViewController` が作成されます。

移行作業は、共有の Compose Multiplatform コードとネイティブの iOS コードの両方に及びます。
共有 Kotlin コードでは以下の作業を行います。

* [ルートにタイトルのメタデータを追加する](#add-title-metadata-to-routes): SwiftUI が Kotlin 側を呼び出さずにナビゲーションバーのタイトルとバックスタックのエントリをレンダリングできるようにします。
* [iOS エントリポイントにナビゲーションコールバックを追加する](#add-navigation-callbacks-to-the-ios-entry-point): iOS レイヤーがどのタブをアクティブにするかを制御し、ナビゲーションイベントに応答できるようにします。
* [Compose レベルでナビゲーションをインターセプトする](#intercept-navigation-at-the-compose-level): 詳細ルートが Compose で処理されるのではなく、Swift に転送されるようにします。このチュートリアルでは Navigation 3 の実装を示しますが、別のナビゲーションライブラリを使用している場合はこのステップを調整してください。
* [iOS 用のスタンドアロン画面レンダラーを構築する](#build-a-standalone-screen-renderer-for-ios): SwiftUI が完全な `App()` の外側で、任意の詳細ルートを単独でレンダリングできるようにします。
* [Compose 内蔵のナビゲーション UI を非表示にする](#hide-compose-s-built-in-navigation-ui): SwiftUI が制御しているときにユーザーに重複したタイトルバーや戻るボタンが表示されないようにします。
* [新しい iOS エントリポイントを公開する](#expose-new-ios-entry-points): ルートビューコントローラーと個別の画面ビューコントローラーを作成するための関数を公開します。

ネイティブ iOS コード (Swift) では以下の作業を行います。

* [SwiftUI ナビゲーションレイヤーを構築する](#build-the-swiftui-navigation-layer): ネイティブの `TabView` および `NavigationStack` ビュー、および Compose 画面を埋め込むブリッジを作成します。

## ルートにタイトルのメタデータを追加する

iOS では、各遷移先にはナビゲーションバーに表示されるタイトルがあり、戻るボタンを長押ししたときに表示されるバックスタックにもタイトルが表示されます。
タイトルをルートオブジェクトに直接保存することで、各ルートが自己記述的になり、Swift が Kotlin へのラウンドトリップなしでタイトルを読み取れるようにします。

1. `navigation/Routes.kt` ファイルで、`AppRoute` に `title` と `subtitle` プロパティを追加します。

    ```kotlin
    @Serializable
    sealed interface AppRoute {
        val title: String? get() = null
        val subtitle: String? get() = null
    }
    ```

2. 詳細画面として表示されるルートで `title`（および必要に応じて `subtitle`）をオーバーライドします。すでにデータを持っているルートの場合は、オプションパラメータとして追加します。

    ```kotlin
    @Serializable
    data class SessionScreen(
        val sessionId: SessionId,
        override val title: String? = null,
    ) : AppRoute
    ```

3. `data object` だったルートにもタイトルが必要ですが、`data object` はインスタンスごとのタイトルの状態を持つことができません。これらを `data class` に変換します。

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            data object SettingsScreen : AppRoute"/>
        <code-block lang="kotlin" code="            data class SettingsScreen(override val title: String = &quot;&quot;) : AppRoute"/>
    </compare>

   更新されたルート定義の完全なセットについては、[`Routes.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/Routes.kt) を参照してください。

4. `NavHost.kt` ファイルの呼び出し箇所で、ローカライズされたタイトルを渡します。
   `stringResource` は `@Composable` 関数であるため、エントリスコープ内で解決し、コールバック内ではなくクリックコールバックでキャプチャします。

    ```kotlin
    entry<InfoScreen> {
        val settingsTitle = stringResource(Res.string.settings_title)
        InfoScreen(
            onSettings = { navigator.add(SettingsScreen(settingsTitle)) },
            // ...
        )
    }
    ```

## iOS エントリポイントにナビゲーションコールバックを追加する

`App()` は iOS が呼び出す Kotlin のエントリポイントです。Swift でナビゲーションを制御できるようにするには、次の 3 つのことを行う方法が必要です。

* アプリ起動時に、新しい `topLevelRoute` パラメータを介して開始タブを選択する。
* Compose からのナビゲーションプッシュ（例：リストアイテムがタップされたとき）に対し、`onNavigate` コールバックを介して反応する。
* Compose 内で開始されたタブの切り替えに対し、`onActivate` コールバックを介して反応する。

新しいコールバックはオプションであり、デフォルトは `null` であるため、Android、デスクトップ、および Web ターゲットには影響しません。

`App.kt` ファイルで、`App()` のシグネチャを適宜更新します。

```kotlin
@Composable
fun App(
    appGraph: AppGraph,
    topLevelRoute: TopLevelRoute,
    onThemeChange: ((isDarkTheme: Boolean) -> Unit)? = null,
    onNavigate: ((AppRoute) -> Unit)? = null,
    onActivate: ((TopLevelRoute) -> Unit)? = null,
) {
    // ...
    val startRoute: AppRoute = remember {
        if (isOnboardingComplete) topLevelRoute else StartPrivacyNoticeScreen
    }
    NavHost(startRoute, isDarkTheme, onThemeChange, onNavigate, onActivate)
}
```

完全な実装については、[`App.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/App.kt) を参照してください。

## Compose レベルでナビゲーションをインターセプトする

`App()` がナビゲーションコールバックを公開したので、`NavHost` はそれらを使用する必要があります。
詳細ルートが Compose のバックスタックに現れるたびに、それを Swift に渡し、すぐに Compose から削除します。これにより、Compose は Swift から呼び出されたときにのみ詳細画面をレンダリングするようになります。

2 つのフローを設定する必要があります。

* 詳細画面への遷移（プッシュ） → Swift へ。ルート以外のルートがバックスタックに配置されるたびに、それを `onNavigate` を介して転送し、Compose のバックスタックから削除します。これにより、SwiftUI の `NavigationStack` が唯一の「信頼できる情報源 (Source of Truth)」となります。
* タブの切り替え → Swift へ。Compose 内からトップレベルルートが変更されたとき、Swift に `onActivate` を介して通知し、SwiftUI の `TabView` の選択状態が同期されるようにします。

このステップは Navigation 3 ライブラリに特有のものです。
同じインターセプトパターンはどの Compose ナビゲーションライブラリにも適用できますが、正確な API（バックスタックへのアクセス、現在の遷移先の監視）は異なります。

`navigation/NavHost.kt` で、新しいパラメータと 2 つのインターセプトエフェクトを `NavHost()` 関数に追加します。

```kotlin
import androidx.compose.runtime.snapshotFlow

@Composable
internal fun NavHost(
    startRoute: AppRoute,
    isDarkTheme: Boolean,
    onThemeChange: ((Boolean) -> Unit)?,
    onNavigate: ((AppRoute) -> Unit)? = null,
    onActivate: ((TopLevelRoute) -> Unit)? = null,
) {
    // 詳細ルートを Swift に転送し、Compose のスタックから削除します
    if (onNavigate != null) {
        LaunchedEffect(navState) {
            snapshotFlow { navState.currentBackstack.toList() }.collect { backstack ->
                val detailRoutes = backstack.drop(1)
                if (detailRoutes.isNotEmpty()) {
                    detailRoutes.forEach { onNavigate(it) }
                    navState.currentBackstack.removeRange(1, navState.currentBackstack.size)
                }
            }
        }
    }
    // ユーザーが Compose 内からタブを切り替えたときに Swift に通知します
    if (onActivate != null) {
        LaunchedEffect(navState) {
            snapshotFlow { navState.topLevelRoute }.collect { route ->
                if (route != null) onActivate(route)
            }
        }
    }
    // ...
}
```

ファイル全体については、[`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt) を参照してください。

## iOS 用のスタンドアロン画面レンダラーを構築する

SwiftUI が `NavigationStack` を所有している場合、Compose は各画面のコンテンツのみをレンダリングする必要があります。
`NavHost` はバックスタック、遷移、およびライフサイクルの管理用に構築されているため、単一のルートをレンダリングするためのよりシンプルなエントリポイントが必要です。

### フラットな画面レンダラーの追加

`ScreenContent` はそのシンプルなエントリポイントです。単一の詳細ルートをその Composable にマップするフラットな `when` 式であり、自身ではナビゲーション状態を持ちません。タブルートは引き続き完全な `App()` / `NavHost` によって処理されます。
SwiftUI は、遷移先ごとに個別のビューコントローラーを作成し、それぞれが単一の `ScreenContent` 呼び出しをホストします。

`navigation/NavHost.kt` に以下を追加します。

```kotlin
@Composable
fun ScreenContent(
    route: AppRoute,
    onNavigate: (AppRoute) -> Unit,
    onBack: () -> Unit,
    onSet: (AppRoute) -> Unit,
    onActivate: (TopLevelRoute) -> Unit,
) {
    val uriHandler = LocalUriHandler.current
    when (route) {
        is SessionScreen -> SessionScreen(
            sessionId = route.sessionId,
            onBack = onBack,
            onSpeaker = { speakerId -> onNavigate(SpeakerDetailScreen(speakerId)) },
            // ...
        )
        is SpeakerDetailScreen -> SpeakerDetailScreen(
            speakerId = route.speakerId,
            onBack = onBack,
            onSession = { sessionId -> onNavigate(SessionScreen(sessionId)) },
        )
        is SettingsScreen -> SettingsScreen(onBack = onBack)
        is AboutAppScreen -> AboutAppScreen(
            onBack = onBack,
            onLicenses = { onNavigate(LicensesScreen) },
            // ...
        )
        // その他すべての詳細ルート
        else -> {}
    }
}
```

この関数にタイトルは表示されません。タイトルは [ルートにタイトルのメタデータを追加する](#add-title-metadata-to-routes) のステップでルートオブジェクトにアタッチされているため、Swift 側でナビゲーションバーを設定する際に各ルートから直接読み取ることができます。

### SwiftUI がナビゲーションを所有していることを Compose に通知する

`ScreenContent` は、SwiftUI がナビゲーションバーと戻るボタンをレンダリングするコンテキストで実行されます。独自のタイトルバーや戻るボタンを描画する Compose 画面は、それらをスキップする必要があります。

コンポジションツリー内での重複を避けるために、iOS 固有のコードに依存せずに各画面が読み取ることができる `CompositionLocal` を使用します。

`NavHost.kt` ファイルの `NavHost()` 関数の前に、`LocalUseNativeNavigation` を `CompositionLocal` として宣言します。

```kotlin
val LocalUseNativeNavigation = staticCompositionLocalOf { false }
```

### iOS 用のレンダラーをラップする

`ScreenContent` はルートをレンダリングしますが、`App()` が通常設定するのと同じテーマ、依存関係注入、およびアプリ全体の `CompositionLocal` 値を設定するラッパーが必要です。

`SingleScreenApp` ラッパーを追加します。これは `App()` からのセットアップをミラーリングし、さらに `LocalUseNativeNavigation` を `true` に設定します。これにより、各画面は Compose でレンダリングされたタイトルバーと戻るボタンを自動的に非表示にします。

`iosMain` ソースセットに `SingleScreenApp.kt` ファイルを作成します。

```kotlin
@Composable
internal fun SingleScreenApp(
    appGraph: AppGraph,
    route: AppRoute,
    onNavigate: (AppRoute) -> Unit,
    onGoBack: () -> Unit,
    onSet: (AppRoute) -> Unit,
    onActivate: (TopLevelRoute) -> Unit,
) {
    // テーマとフラグの設定
    CompositionLocalProvider(
        LocalUseNativeNavigation provides true,
        LocalFlags provides flags,
        LocalAppGraph provides appGraph,
        // その他のプロバイダー
    ) {
        KotlinConfTheme(colors = colors) {
            Box(Modifier.fillMaxSize().background(KotlinConfTheme.colors.mainBackground)) {
                ScreenContent(route, onNavigate, onGoBack, onSet, onActivate)
            }
        }
    }
}
```

### フラグをタブルートに適用する

タブルートは依然として通常の `NavHost` を経由するため、これらも `LocalUseNativeNavigation` の値を尊重する必要があります。
ネイティブのナビゲーションコールバックがアクティブかどうかに基づいてこれを提供します。
それらがアクティブな場合は、ナビゲーションコンテンツを直接レンダリングし、`NavScaffold`（Compose のボトムバー）をスキップします。

```kotlin
val useNativeNavigation = onNavigate != null

CompositionLocalProvider(LocalUseNativeNavigation provides useNativeNavigation) {
    Box(
        // ...
    ) {
        val content = @Composable {
            NavDisplay(
                entries = navState.toDecoratedEntries(entryProvider),
                onBack = navigator::goBack,
            )
        }
        if (useNativeNavigation) {
            content()
        } else {
            NavScaffold(
                navState = navState,
                navigator = navigator,
                showGoldenKodee = showGoldenKodee,
                content = content,
            )
        }
    }
}
```

完全な実装については、[`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt) および [`SingleScreenApp.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/SingleScreenApp.kt) を参照してください。

## Compose 内蔵のナビゲーション UI を非表示にする

SwiftUI がナビゲーション UI をレンダリングする場所で `LocalUseNativeNavigation` が設定されるようになったため、個別の画面でそれを読み取り、独自のタイトルバーと戻るボタンを非表示にする必要があります。そうしないと、2 つのタイトルバーが重なり、2 つの競合する戻るボタンがユーザーに表示されてしまいます。

`BaseScreens.kt` で、`ScreenWithTitle()` 関数を更新して `LocalUseNativeNavigation` を読み取り、それが `true` の場合はタイトルバーとそのディバイダーをスキップするようにします。

```kotlin
val useNativeNavigation = LocalUseNativeNavigation.current

if (!useNativeNavigation) {
    MainHeaderTitleBar(...)
    HorizontalDivider(...)
}
```

独自の戻るボタンやヘッダーを描画する他の画面にも同じパターンを適用します。

完全な実装については、[`BaseScreens.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/BaseScreens.kt) を参照してください。

## 新しい iOS エントリポイントを公開する

SwiftUI から新しいナビゲーション構造を構築するために、3 つの Kotlin エントリポイントを公開します。`MainViewController` の 2 つのオーバーロードと、1 つの `ScreenViewController` です。
`iosMain/main.ios.kt` に、これら 3 つの関数を追加します。

* コールバックなしの `MainViewController`。iOS 26 未満のフォールバックとして使用されます。Liquid Glass API は iOS 26 を必要とするため、古いバージョンでは SwiftUI は元のフル Compose セットアップにフォールバックする必要があります。このオーバーロードがないと、Swift の `#available` ブランチがコンパイルされません。

    ```kotlin
    // iOS 26 未満のフォールバック: 完全な Compose ナビゲーション、ネイティブコールバックなし
    @Suppress("unused")
    fun MainViewController(topLevelRoute: TopLevelRoute): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing },
    ) {
        App(appGraph, topLevelRoute)
    }
    ```

* コールバックありの `MainViewController`。各タブのルートに対して SwiftUI から呼び出されます。
  Compose は完全な `App()` と `NavHost` を実行しますが、ナビゲーションイベントは内部で処理されるのではなく SwiftUI に転送されます。
  このオーバーロードでは使用されませんが、`ScreenViewController` との API 対称性のためにシグネチャには `onGoBack` と `onSet` が含まれています。

    ```kotlin
    // タブルート: Compose は NavHost を実行するが、ナビゲーションイベントを SwiftUI に渡す
    @Suppress("unused")
    fun MainViewController(
        topLevelRoute: TopLevelRoute,
        onNavigate: (AppRoute) -> Unit,
        onGoBack: () -> Unit,
        onSet: (AppRoute) -> Unit,
        onActivate: (TopLevelRoute) -> Unit,
    ): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing }
    ) {
        App(appGraph, topLevelRoute, onNavigate = onNavigate, onActivate = onActivate)
    }
    ```
  
* `ScreenViewController`。各詳細画面に対して SwiftUI から呼び出されます。`SingleScreenApp` を介して単一のルートをレンダリングします。これは `LocalUseNativeNavigation` を `true` に設定するため、Compose 内蔵のタイトルバーと戻るボタンは非表示になります。

    ```kotlin
    // 詳細画面: LocalUseNativeNavigation = true で単一の画面をレンダリング
    @Suppress("unused")
    fun ScreenViewController(
        route: AppRoute,
        onNavigate: (AppRoute) -> Unit,
        onGoBack: () -> Unit,
        onSet: (AppRoute) -> Unit,
        onActivate: (TopLevelRoute) -> Unit,
    ): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing }
    ) {
        SingleScreenApp(appGraph, route, onNavigate, onGoBack, onSet, onActivate)
    }
    ```

完全な実装については、[`main.ios.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/main.ios.kt) を参照してください。

### 代替案: SwiftUI をスキップして Kotlin から UIKit を駆動する {collapsible="true"}

上記のエントリポイントは、SwiftUI の `TabView` および `NavigationStack` 用に設計されています。
内部的には、SwiftUI は `UITabBarController` と `UINavigationController` を使用してこれらのビューを実装しており、iOS 26 の Liquid Glass は、SwiftUI で宣言するか UIKit で構成するかに関わらず、ネイティブのタブバーおよびナビゲーションバーに適用されます。

新しい iOS エントリポイントをゼロから作成する場合、または維持すべき SwiftUI アプリや `ContentView` がまだない場合は、SwiftUI レイヤーを完全にスキップして Kotlin から直接 UIKit を駆動できます。
このアプローチでは、このチュートリアルの SwiftUI シェルが必要とする `RouteWrapper` の同一性に関する回避策、Kotlin コールバックからミラーリングされた `@Observable` パス状態、および `UIViewControllerRepresentable` ラッパーを回避できます。
ナビゲーション状態は Swift と Kotlin に重複することなく、1 か所に保持されます。

ネイティブのナビゲーションバーと共有の Compose 画面コンテンツを取得するには、`commonMain` でナビゲーションコントラクトを `expect class` コーディネーターとして宣言し、各プラットフォームで `actual` 実装を行います。

このチュートリアルの SwiftUI シェルは宣言的です。`TabView` と `NavigationStack` を記述すると、SwiftUI がスタックを管理します。
UIKit コーディネーターのアプローチは命令的です。`UINavigationController` を所有し、自分自身で `push` および `pop` を呼び出します。

```
SceneDelegate
  └── UIWindow.rootViewController = UITabBarController
        ├── UINavigationController (Schedule)
        │     ├── ComposeUIViewController  ← タブルート
        │     └── ComposeUIViewController  ← 詳細、Kotlin 内でプッシュされる
        └── UINavigationController (Info)
              └── ...
```

このチュートリアルの SwiftUI 部分は、UIKit コーディネーターに次のように対応します。

* SwiftUI `TabView` および `NavigationStack` → `UITabBarController` および `UINavigationController`
* `TabNavigationCoordinator` および `RouteWrapper` → Kotlin の `actual` コーディネーターの `push` および `pop`
* `NativeNavComposeView` および `DetailComposeView` → コーディネーター内の `ComposeUIViewController { Screen(...) }`
* `ContentView` SwiftUI シェル → `SceneDelegate` が `window.rootViewController` を設定

```kotlin
// commonMain
expect class ScheduleCoordinator() {
    fun navigateToDetail(route: AppRoute)
    fun navigateBack()
    @Composable fun Content()
}
```

`iosMain` での `actual` 実装は、`UINavigationController` の `push` と `pop` を呼び出し、`showTopBar` を `false` に設定します。
iOS では、`SceneDelegate` からコーディネーターを作成し、タブバーコントローラーをウィンドウのルートビューコントローラーとして設定します。SwiftUI の `App` や `ContentView` ラッパーは必要ありません。

Kotlin と Swift の間で作業を分担する方法は 2 つあります。

* **すべて Kotlin の `iosMain` で行う**: UIKit の相互運用機能を使用して、`actual` コーディネーター内で `UITabBarController`、`UINavigationController`、および `ComposeUIViewController` を接続します。
* **画面ファクトリは Kotlin、組み立ては Swift で行う**: `iosMain` から `MainViewController` と `ScreenViewController` を公開し、ナビゲーションクロージャを持つ `ComposeUIViewController` インスタンスを返します。そして、ネイティブ Swift でタブバーとナビゲーションスタックを構築します。このオプションは、画面コンテンツを Compose で共有したまま、iOS のナビゲーションコードを Swift に留めておきたい場合に適しています。

どちらのオプションでも、SwiftUI や `UIViewControllerRepresentable` を使用せずに、同様のフラットな UIKit 階層が得られます。コーディネーターロジックをどこに置きたいかに基づいて選択してください。

`UITabBarController` 内で Compose を使用する方法の詳細については、[UIKit フレームワークとの統合](compose-uikit-integration.md) を参照してください。

## SwiftUI ナビゲーションレイヤーを構築する

ここからは移行の iOS 側の作業です。これまでのステップでの Kotlin の変更はすべて、ここで行われることへの準備です。つまり、Compose ビューを遷移先としてホストする、タブごとの `NavigationStack` を備えた SwiftUI の `TabView` を作成します。
これを構築するために、以下の手順を完了してください。

1. [Kotlin のルートを `NavigationStack` で使用可能にする](#make-kotlin-routes-usable-in-navigationstack)
2. [タブとナビゲーションの状態を追跡する](#track-tab-and-navigation-state)
3. [Compose 画面を SwiftUI ビューとして埋め込む](#embed-compose-screens-as-swiftui-views)
4. [各タブ内のナビゲーションを設定する](#set-up-navigation-within-each-tab)
5. [タブバーを構築する](#build-the-tab-bar)
6. [古い iOS バージョンでのフォールバック](#fall-back-on-older-ios-versions)

このセクションのコードには、Liquid Glass 効果を直接適用するものは含まれていないことに注意してください。
iOS 26 は、ネイティブの `TabView` および `NavigationStack` ビューに対して Liquid Glass を自動的にレンダリングするため、それらを使用するだけで有効になります。

### Kotlin のルートを `NavigationStack` で使用可能にする

`NavigationStack` では、パス要素が `Hashable` かつ `Identifiable` である必要があります。
Kotlin の sealed interface でこれを満たすために、`AppRoute` を Swift の `struct` でラップします。
`ContentView.swift` ファイルに以下を追加します。

```swift
@available(iOS 26.0, *)
struct RouteWrapper: Hashable, Identifiable {
    let id = UUID()
    let route: AppRoute

    static func ==(lhs: RouteWrapper, rhs: RouteWrapper) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
```

同じルートを 2 回プッシュした場合、期待されるナビゲーション動作と一致するように、2 つの個別のスタックエントリを作成する必要があります。これを実現するために、識別（Identity）はルートの値ではなく UUID に基づいています。

### タブとナビゲーションの状態を追跡する

各タブは独自のナビゲーションスタックを持ち、アプリは現在どのタブが選択されているかを追跡します。これを処理するために 2 つの `@Observable` クラスを追加します。

```swift
@available(iOS 26.0, *)
@Observable
class TabNavigationCoordinator {
    var path: [RouteWrapper] = []

    func push(_ route: AppRoute) {
        path.append(RouteWrapper(route: route))
    }

    func pop() {
        if !path.isEmpty {
            path.removeLast()
        }
    }

    func popToRoot() {
        path.removeAll()
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Observable class TabNavigationCoordinator { "}

```swift
@available(iOS 26.0, *)
@Observable
class AppNavigationCoordinator {
    enum AppTab {
        case schedule, info
    }

    var selectedTab: AppTab = .schedule
    let scheduleCoordinator = TabNavigationCoordinator()
    let infoCoordinator = TabNavigationCoordinator()

    func activateTab(for route: TopLevelRoute) {
        if route is ScheduleScreen {
            selectedTab = .schedule
        } else if route is InfoScreen {
            selectedTab = .info
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Observable class AppNavigationCoordinator { "}

`AppNavigationCoordinator` は、このチュートリアルで使用する 2 タブバージョン用に簡略化されています。完全なバージョンについては [`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/b451d80301c50097d4cf5050d865829b49d07c8e/app/iosApp/iosApp/ContentView.swift) を参照してください。

### Compose 画面を SwiftUI ビューとして埋め込む

2 つの `UIViewControllerRepresentable` タイプが、[新しい iOS エントリポイントを公開する](#expose-new-ios-entry-points) のステップで作成した Kotlin のエントリポイントを SwiftUI に接続します。1 つはタブルート用、もう 1 つは詳細画面用です。

`NativeNavComposeView` はタブルート（Compose の `NavHost`）をホストし、そのナビゲーションイベントを転送します。

```swift
@available(iOS 26.0, *)
struct NativeNavComposeView: UIViewControllerRepresentable {
    let topLevelRoute: TopLevelRoute
    let coordinator: TabNavigationCoordinator
    let appCoordinator: AppNavigationCoordinator

    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController(
            topLevelRoute: topLevelRoute,
            onNavigate: { route in self.coordinator.push(route) },
            onGoBack: { self.coordinator.pop() },
            onSet: { route in
                self.coordinator.popToRoot()
                if let topLevel = route as? TopLevelRoute {
                    self.appCoordinator.activateTab(for: topLevel)
                } else {
                    self.coordinator.push(route)
                }
            },
            onActivate: { route in self.appCoordinator.activateTab(for: route) }
        )
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

`DetailComposeView` は単一の詳細画面をホストし、`NavigationStack` の遷移先ごとに 1 つのインスタンスが作成されます。

```swift
@available(iOS 26.0, *)
struct DetailComposeView: UIViewControllerRepresentable {
    let route: AppRoute
    let coordinator: TabNavigationCoordinator
    let appCoordinator: AppNavigationCoordinator

    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.ScreenViewController(
            route: route,
            onNavigate: { newRoute in self.coordinator.push(newRoute) },
            onGoBack: { self.coordinator.pop() },
            onSet: { route in
                self.coordinator.popToRoot()
                if let topLevel = route as? TopLevelRoute {
                    self.appCoordinator.activateTab(for: topLevel)
                } else {
                    self.coordinator.push(route)
                }
            },
            onActivate: { route in self.appCoordinator.activateTab(for: route) }
        )
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

### 各タブ内のナビゲーションを設定する

タブレベルでは、`NavigationStack` が Compose のタブコンテンツをルートとして使用し、詳細画面を遷移先としてレンダリングします。

`.navigationBarHidden(true)` が適用されている場合でも、タブルートに `.navigationTitle(title)` を設定する必要があることに注意してください。iOS 26 はこの値を読み取ってフローティングタブバーのタブにラベルを付けます。これが欠落していると、ラベルが空白になります。

```swift
@available(iOS 26.0, *)
struct TabContentView: View {
    let topLevelRoute: TopLevelRoute
    let coordinator: TabNavigationCoordinator
    let appCoordinator: AppNavigationCoordinator
    let title: String

    var body: some View {
        NavigationStack(path: Binding(
            get: { coordinator.path },
            set: { coordinator.path = $0 }
        )) {
            NativeNavComposeView(
                topLevelRoute: topLevelRoute,
                coordinator: coordinator,
                appCoordinator: appCoordinator
            )
                .ignoresSafeArea(.all)
                .navigationTitle(title)
                .navigationBarHidden(true)
                .navigationDestination(for: RouteWrapper.self) { wrapper in
                    DetailComposeView(
                        route: wrapper.route,
                        coordinator: coordinator,
                        appCoordinator: appCoordinator
                    )
                        .ignoresSafeArea(.all)
                        .navigationTitle(wrapper.route.title ?? "")
                        .navigationSubtitle(wrapper.route.subtitle ?? "")
                        .toolbarTitleDisplayMode(.inline)
                }
        }
    }
}
```

### タブバーを構築する

トップレベルのコンテナは `TabView` で、トップレベルルートごとに 1 つの `Tab` を持ちます。
`.tabBarMinimizeBehavior(.automatic)` モディファイアにより、タブバーが浮遊し、スクロール時に最小化されます。これがない場合、タブバーは下部に固定されたままになります。
`.tint(Color(.accent))` モディファイアは、選択されたタブにアプリのアクセントカラーを適用します。

```swift
@available(iOS 26.0, *)
struct NativeNavContentView: View {
    @State private var appCoordinator = AppNavigationCoordinator()

    var body: some View {
        TabView(selection: Binding(
            get: { appCoordinator.selectedTab },
            set: { appCoordinator.selectedTab = $0 }
        )) {
            Tab(String(localized: "Schedule"), systemImage: "clock",
                value: AppNavigationCoordinator.AppTab.schedule) {
                TabContentView(topLevelRoute: ScheduleScreen(),
                               coordinator: appCoordinator.scheduleCoordinator,
                               appCoordinator: appCoordinator, title: String(localized: "Schedule"))
            }
            Tab(String(localized: "Info"), systemImage: "info.circle",
                value: AppNavigationCoordinator.AppTab.info) {
                TabContentView(topLevelRoute: InfoScreen(),
                               coordinator: appCoordinator.infoCoordinator,
                               appCoordinator: appCoordinator, title: String(localized: "Info"))
            }
        }
        .tabBarMinimizeBehavior(.automatic) 
        .tint(Color(.accent))
    }
}
```

`Color(.accent)` は、Xcode プロジェクトのアセットカタログにある `AccentColor` アセットに解決されます。
これは、Xcode のアセットカタログエディター（[Specifying your app's color scheme](https://developer.apple.com/documentation/xcode/specifying-your-apps-color-scheme) を参照）で定義するか、`Assets.xcassets/AccentColor.colorset/Contents.json` を作成して定義できます。JSON オプションの場合、サンプルプロジェクトの [`Contents.json`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/Assets.xcassets/AccentColor.colorset/Contents.json) を出発点として使用し、コンポーネントの値を独自のカラーに置き換えることができます。

2 つのタブがある場合、アプリは次のように表示されます。

![Two tabs](ios-kotlinconf-two-tabs.png){ width="250" style="block"}

半透明感、奥行き、フローティングタブバーはすべて iOS 26 によって適用されます。追加のスタイリングコードは必要ありません。

### 古い iOS バージョンでのフォールバック

Liquid Glass と新しい `TabView` API は iOS 26 専用です。
古いバージョンでは、アプリは以前の Compose 主導のセットアップにフォールバックします。
`ComposeView` は、コールバックなしの `MainViewController` オーバーロードをラップする SwiftUI ラッパーです。

```swift
struct ContentView: View {
    var body: some View {
        if #available(iOS 26.0, *) {
            NativeNavContentView()
        } else {
            ComposeView(topLevelRoute: ScheduleScreen())
                .ignoresSafeArea(.all)
        }
    }
}
```

完全なファイルを参照してください: [`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/ContentView.swift)。

## 代替アプローチ

このチュートリアルでの移行方法はネイティブの SwiftUI ナビゲーションを優先しており、これにより Liquid Glass やその他のシステム動作をすぐに利用できます。このアプローチがプロジェクトに合わない場合は、以下の代替案を検討してください。

* **Kotlin から調整された UIKit ナビゲーション**。`commonMain` でナビゲーションコントラクトを `expect class` コーディネーターとして宣言し、各プラットフォームで `UITabBarController` や `UINavigationController` を命令的に駆動する `actual` 実装を行います。SwiftUI シェルなしで Liquid Glass と単一のナビゲーション状態ソースを取得できますが、UIKit 相互運用コードを書く必要があります。[SwiftUI をスキップして Kotlin から UIKit を駆動する](#alternative-skip-swiftui-and-drive-uikit-from-kotlin) の詳細を参照してください。
* **ネイティブの相互運用コントロールを使用した Compose 主導のナビゲーション**。ナビゲーションは Compose に残したまま、Liquid Glass スタイリングを含む `UITabBar` や `UINavigationBar` などのネイティブ UI コントロールを埋め込みます。トレードオフは、ネイティブオーバーレイと Compose コンテンツ間の相互運用に関するいくつかの制限です。
* **アダプティブ UI のためのサードパーティ製ソリューションを使用した Compose 主導のナビゲーション**。[Calf](https://klibs.io/project/MohamedRejeb/Calf) のようなライブラリを使用して、アプリが動作しているプラットフォームにネイティブなアダプティブ UI コンポーネントをレンダリングします。このアプローチにより、プラットフォーム間の差異をご自身で処理する複雑さが軽減され、iOS での Liquid Glass のようなネイティブな動作がそのまま提供されます。
* **Liquid Glass 効果を模倣した Compose のみのナビゲーション**。すべてを Compose でレンダリングし、Liquid Glass を視覚的に近似させます。例えば、[AndroidLiquidGlass](https://klibs.io/project/Kyant0/AndroidLiquidGlass) や [Liquid](https://klibs.io/project/FletchMcKee/liquid) といったライブラリを使用します。このアプローチでは、すべての UI が Compose 側に保持され、効果は視覚的に似ていますが、システムの Liquid Glass と同一ではありません。

## 次のステップ

* Liquid Glass 効果が適用された [公式 KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav) を確認してください。
* Apple による新しいマテリアルの概要と採用チェックリストである [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass) を参照してください。
* SwiftUI 内で Compose Multiplatform を使用し、Compose Multiplatform アプリ内に SwiftUI を埋め込むための公式ガイダンスについては、[SwiftUI フレームワークとの統合](compose-swiftui-integration.md) を参照してください。