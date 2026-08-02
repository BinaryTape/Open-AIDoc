[//]: # (title: Compose Multiplatform 應用程式中的 Liquid Glass)
<show-structure depth="1"/>

<web-summary>關於透過將導航遷移到原生 SwiftUI，在 Compose Multiplatform 應用程式中採用 iOS 26 Liquid Glass 的逐步教學。</web-summary>

[Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass) 是 Apple 在 iOS 26 中推出的視覺設計系統，為 UI 元素帶來了類似玻璃的半透明感與流動性。
若要在 Compose Multiplatform 應用程式中採用它，您需要一個原生的 SwiftUI 外殼，因為 Liquid Glass 效果是系統透過原生的 `TabView`、`NavigationStack` 以及工具列 API 進行渲染的。
若 SwiftUI 不符合您的專案需求，請參閱[替代方法](#alternative-approaches)。

本教學將引導您 **將 iOS 應用程式從完全由 Compose 驅動的導航遷移到原生 SwiftUI 導航**，並套用 iOS 26 Liquid Glass 風格，同時保留 Compose 負責渲染每個畫面的內容。
當應用程式使用原生的 `TabView` 與 `NavigationStack` 檢視時，系統會自動套用 Liquid Glass 效果，因此您不需要撰寫任何特定於 Liquid Glass 的程式碼。

我們將以官方的 [KotlinConf 應用程式](https://apps.apple.com/us/app/kotlinconf/id1299196584)作為範例。

> 您需要安裝 Xcode 26 或更新版本，以及 iOS 26 SDK。
>
{style="note"}

* [`main` 分支](https://github.com/JetBrains/kotlinconf-app/tree/main) — 初始狀態，具有完全在 Compose 中實作的自訂佈景主題。
* [`lg-nav` 分支](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav) — 最終狀態，採用 Liquid Glass 設計。

![共用 UI](ios-kotlinconf-no-liquid-glass.png){ width="250" style="inline"}
![具有 Liquid Glass 的原生 iOS UI](ios-kotlinconf-liquid-glass.png){ width="250" style="inline"}

複製此存儲庫並切換至任一分支以跟隨教學，或並排比較它們：
[`main...lg-nav`](https://github.com/JetBrains/kotlinconf-app/compare/main...lg-nav)。

為求簡化，我們將遷移應用程式的雙標籤頁版本（**Schedule** 與 **Info**），但此模式可擴展至任何數量的標籤頁。

## 遷移計畫

在具有完全共用 UI 程式碼的 Compose Multiplatform 設定中，單一 `ComposeUIViewController` 負責整個 iOS UI：標籤頁、導航堆疊、返回手勢與畫面內容。
Compose Multiplatform 在 iOS 上的導航轉換設計旨在提供原生感，但某些平台級特性（例如 iOS 26 的 Liquid Glass 標籤列樣式）僅能透過原生 iOS 組件取得。

解決方案是將導航交給原生 iOS，讓系統渲染標籤列與導航堆疊，而 Compose 則繼續渲染每個畫面的內容。

**之前：**

```
ContentView
  └── ComposeView (Compose Multiplatform)
```

**之後：**

```
ContentView
  └── TabView  (Liquid Glass, iOS 26)
        ├── Tab: Schedule
        │     └── NavigationStack
        │           ├── NativeNavComposeView  ← Compose 標籤頁根目錄
        │           └── DetailComposeView     ← Compose 詳細資料畫面，每個目的地一個
        └── Tab: Info
              └── NavigationStack
                    ├── NativeNavComposeView  ← Compose 標籤頁根目錄
                    └── DetailComposeView     ← Compose 詳細資料畫面，每個目的地一個
```

以下是新設定中導航的流向：

* SwiftUI 為每個標籤頁建立一個包含 `NavigationStack` 的 `TabView`。
* Compose 仍渲染每個畫面的內容，但不再管理返回堆疊。
* 當使用者從 Compose 畫面觸發導航（例如點擊清單列）時，事件會透過 `onNavigate` 轉發至 Swift。
* Swift 協調器將路由推入其 `NavigationStack` 中，進而建立一個託管單一 Compose 畫面的新 `UIViewController`。

此遷移涉及共用的 Compose Multiplatform 程式碼與原生的 iOS 程式碼。
在共用的 Kotlin 程式碼中：

* [為路由新增標題元資料](#add-title-metadata-to-routes)，以便 SwiftUI 在不呼叫 Kotlin 的情況下渲染導航列標題與返回堆疊項目。
* [為 iOS 入口點新增導航回呼](#add-navigation-callbacks-to-the-ios-entry-point)，讓 iOS 層可以控制哪個標籤頁處於活動狀態並對導航事件作出回應。
* [在 Compose 層級攔截導航](#intercept-navigation-at-the-compose-level)，將詳細資料路由轉發至 Swift，而不是由 Compose 處理。
  本教學展示了 Navigation 3 的實作 — 若您使用不同的導航程式庫，請調整此步驟。
* [為 iOS 建置獨立的畫面轉譯器](#build-a-standalone-screen-renderer-for-ios)，以便 SwiftUI 能在完整的 `App()` 之外單獨渲染任何詳細資料路由。
* [隱藏 Compose 內建的導航 UI](#hide-compose-s-built-in-navigation-ui)，在由 SwiftUI 主導時，讓使用者不會看到重複的標題列與返回按鈕。
* [公開新的 iOS 入口點](#expose-new-ios-entry-points)，用於建立根視圖控制器與個別畫面視圖控制器。

在原生 iOS 程式碼（Swift）中：

* [建置 SwiftUI 導航層](#build-the-swiftui-navigation-layer)，使用原生的 `TabView` 與 `NavigationStack` 檢視，以及嵌入 Compose 畫面的橋接器。

## 為路由新增標題元資料

在 iOS 上，每個目的地都有一個顯示在導航列中的標題，也會出現在長按返回按鈕時顯示的返回堆疊中。
我們將標題直接儲存在路由物件上，使每個路由都能自我描述，讓 Swift 無需與 Kotlin 進行來回通訊即可讀取標題。

1. 在 `navigation/Routes.kt` 檔案中，為 `AppRoute` 新增 `title` 與 `subtitle` 屬性：

    ```kotlin
    @Serializable
    sealed interface AppRoute {
        val title: String? get() = null
        val subtitle: String? get() = null
    }
    ```

2. 在作為詳細資料畫面出現的路由中覆寫 `title`（以及適用的 `subtitle`）。
   對於已經攜帶資料的路由，將其新增為選用參數：

    ```kotlin
    @Serializable
    data class SessionScreen(
        val sessionId: SessionId,
        override val title: String? = null,
    ) : AppRoute
    ```

3. 原本為 `data object` 的路由也需要標題，但 `data object` 無法攜帶個別執行個體的標題狀態。
   請將它們轉換為 `data class`：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            data object SettingsScreen : AppRoute"/>
        <code-block lang="kotlin" code="            data class SettingsScreen(override val title: String = &quot;&quot;) : AppRoute"/>
    </compare>

   如需完整的更新路由定義集，請參閱 [`Routes.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/Routes.kt)。

4. 在 `NavHost.kt` 檔案中的呼叫點傳遞在地化標題。
   由於 `stringResource` 是一個 `@Composable` 函式，請在入口作用域內解析它並在點擊回呼中擷取它，而不是在回呼本身內部解析：

    ```kotlin
    entry<InfoScreen> {
        val settingsTitle = stringResource(Res.string.settings_title)
        InfoScreen(
            onSettings = { navigator.add(SettingsScreen(settingsTitle)) },
            // ...
        )
    }
    ```

## 為 iOS 入口點新增導航回呼

`App()` 是 iOS 呼叫的 Kotlin 入口點。為了讓 Swift 驅動導航，它需要一種方式來執行三件事：

* 透過新的 `topLevelRoute` 參數在應用程式啟動時選擇起始標籤頁。
* 透過 `onNavigate` 回呼對來自 Compose 的導航推入（例如點擊清單項目時）作出回應。
* 透過 `onActivate` 回呼對從 Compose 發起的標籤頁切換作出回應。

新的回呼是選用的且預設為 `null`，因此 Android、桌面與 Web 目標不受影響。

在 `App.kt` 檔案中，相應地更新 `App()` 的簽章：

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

如需完整實作，請參閱 [`App.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/App.kt)。

## 在 Compose 層級攔截導航

現在 `App()` 已公開導航回呼，`NavHost` 需要使用它們。
每當詳細資料路由出現在 Compose 的返回堆疊時，將其交給 Swift 並立即從 Compose 中移除。
這樣一來，Compose 僅在從 Swift 呼叫時才渲染詳細資料畫面。

需要設定兩個流程：

* 詳細資料推入 → Swift。每當非根路由進入返回堆疊時，透過 `onNavigate` 將其轉發，並將其從 Compose 的返回堆疊中移除，使 SwiftUI 的 `NavigationStack` 成為單一事實來源。
* 標籤頁切換 → Swift。當 Compose 內部變更最上層路由時，透過 `onActivate` 通知 Swift，使 SwiftUI `TabView` 的選取狀態保持同步。

此步驟特定於 Navigation 3 程式庫。
同樣的攔截模式適用於任何 Compose 導航程式庫，但具體的 API（返回堆疊存取、目前目的地觀察）會有所不同。

在 `navigation/NavHost.kt` 中，為 `NavHost()` 函式新增參數與兩個攔截效果：

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
    // 將詳細資料路由轉發給 Swift 並從 Compose 的堆疊中移除
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
    // 當使用者在 Compose 內部切換標籤頁時通知 Swift
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

如需完整檔案，請參閱 [`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt)。

## 為 iOS 建置獨立的畫面轉譯器

當 SwiftUI 擁有 `NavigationStack` 時，Compose 只需要渲染每個畫面的內容。
`NavHost` 是為了管理返回堆疊、轉換與生命週期而組建的，因此我們需要一個更簡單的入口點來渲染單一路由。

### 新增扁平的畫面轉譯器

`ScreenContent` 就是那個更簡單的入口點：一個扁平的 `when` 運算式，將單一詳細資料路由對應到其可組合項，且自身不帶導航狀態。
標籤頁根目錄仍由完整的 `App()` / `NavHost` 處理。
SwiftUI 會為每個目的地建立一個個別的視圖控制器，每個控制器都託管一個單一的 `ScreenContent` 呼叫。

將以下內容新增至 `navigation/NavHost.kt`：

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
        // 所有其他詳細資料路由
        else -> {}
    }
}
```

標題不會出現在此函式中：它們已在[為路由新增標題元資料](#add-title-metadata-to-routes)步驟中附加到路由物件，因此 Swift 端在配置其導航列時可以直接從每個路由中讀取它們。

### 向 Compose 指示 SwiftUI 擁有導航

`ScreenContent` 在 SwiftUI 渲染導航列與返回按鈕的內容中執行。
自行繪製標題列或返回按鈕的 Compose 畫面必須跳過這些部分。

為了避免在 Composition 樹中發生重複，請使用一個 `CompositionLocal`，讓每個畫面都能在不依賴 iOS 特定程式碼的情況下讀取它。

在 `NavHost.kt` 檔案中，於 `NavHost()` 函式之前宣告 `LocalUseNativeNavigation` 為 `CompositionLocal`：

```kotlin
val LocalUseNativeNavigation = staticCompositionLocalOf { false }
```

### 為 iOS 包裝轉譯器

`ScreenContent` 會渲染路由，但它需要一個包裝器來設定與 `App()` 通常設定相同的佈景主題、相依注入以及應用程式範圍的 `CompositionLocal` 值。

新增 `SingleScreenApp` 包裝器。它鏡像了 `App()` 的設定，並額外將 `LocalUseNativeNavigation` 設定為 `true`，讓每個畫面自動隱藏其由 Compose 渲染的標題列與返回按鈕。

在 `iosMain` 原始碼集中建立 `SingleScreenApp.kt` 檔案：

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
    // 設定佈景主題與旗標
    CompositionLocalProvider(
        LocalUseNativeNavigation provides true,
        LocalFlags provides flags,
        LocalAppGraph provides appGraph,
        // 其他提供者
    ) {
        KotlinConfTheme(colors = colors) {
            Box(Modifier.fillMaxSize().background(KotlinConfTheme.colors.mainBackground)) {
                ScreenContent(route, onNavigate, onGoBack, onSet, onActivate)
            }
        }
    }
}
```

### 將旗標套用於標籤頁根目錄

標籤頁根目錄仍透過常規的 `NavHost` 處理，因此它們也需要遵循 `LocalUseNativeNavigation` 的值。
請根據原生導航回呼是否處於活動狀態來提供該值。
當它們處於活動狀態時，直接渲染導航內容並跳過 `NavScaffold`（Compose 的底部列）：

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

如需完整實作，請參閱 [`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt)
與 [`SingleScreenApp.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/SingleScreenApp.kt)。

## 隱藏 Compose 內建的導航 UI

在 SwiftUI 渲染導航 UI 的地方設定了 `LocalUseNativeNavigation` 後，個別畫面現在需要讀取它並隱藏自己的標題列與返回按鈕。
否則，使用者會看到兩個疊加的標題列與兩個衝突的返回按鈕。

在 `BaseScreens.kt` 中，更新 `ScreenWithTitle()` 函式以讀取 `LocalUseNativeNavigation`，並在值為 `true` 時跳過標題列及其分隔線：

```kotlin
val useNativeNavigation = LocalUseNativeNavigation.current

if (!useNativeNavigation) {
    MainHeaderTitleBar(...)
    HorizontalDivider(...)
}
```

對任何其他自行繪製返回按鈕或頁首的畫面套用相同的模式。

如需完整實作，請參閱 [`BaseScreens.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/BaseScreens.kt)。

## 公開新的 iOS 入口點

若要從 SwiftUI 組建新的導航結構，請公開三個 Kotlin 入口點：
兩個 `MainViewController` 的多載與一個 `ScreenViewController`。
在 `iosMain/main.ios.kt` 中新增這三個函式：

* 不含回呼的 `MainViewController`，用作 iOS 26 之前的備援。Liquid Glass API 需要 iOS 26，因此 SwiftUI 在舊版本上應回退到原本的完整 Compose 設定。若沒有此多載，Swift 中的 `#available` 分支將無法編譯。

    ```kotlin
    // iOS 26 之前的備援：完整 Compose 導航，無原生回呼
    @Suppress("unused")
    fun MainViewController(topLevelRoute: TopLevelRoute): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing },
    ) {
        App(appGraph, topLevelRoute)
    }
    ```

* 包含回呼的 `MainViewController`，由 SwiftUI 為每個標籤頁根目錄呼叫。
  Compose 執行完整的 `App()` 與 `NavHost`，但導航事件會轉發給 SwiftUI，而不是在內部處理。
  簽章包含 `onGoBack` 與 `onSet` 以與 `ScreenViewController` 保持 API 對稱，儘管在此多載中並未用到它們。

    ```kotlin
    // 標籤頁根目錄：Compose 執行 NavHost 但將導航事件交給 SwiftUI
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
  
* `ScreenViewController`，由 SwiftUI 為每個詳細資料畫面呼叫。透過 `SingleScreenApp` 渲染單一路由，此程式會將 `LocalUseNativeNavigation` 設定為 `true`，從而隱藏 Compose 內建的標題列與返回按鈕。

    ```kotlin
    // 詳細資料畫面：渲染單一畫面並將 LocalUseNativeNavigation = true
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

如需完整實作，請參閱 [`main.ios.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/main.ios.kt)。

### 替代方案：跳過 SwiftUI 並從 Kotlin 驅動 UIKit {collapsible="true"}

上述入口點是專為 SwiftUI `TabView` 與 `NavigationStack` 設計的。
在底層，SwiftUI 使用 `UITabBarController` 與 `UINavigationController` 來實作這些視圖，而 iOS 26 上的 Liquid Glass 會套用於原生的標籤列與導航列，無論您是在 SwiftUI 中宣告它們，還是在 UIKit 中配置它們。

如果您是從頭開始建立新的 iOS 入口點，或者您尚未有需要保留的 SwiftUI App 與 `ContentView`，您可以完全跳過 SwiftUI 層並直接從 Kotlin 驅動 UIKit。
此方法可避免 `RouteWrapper` 識別因應措施、從 Kotlin 回呼映射的 `@Observable` 路徑狀態，以及本教學中 SwiftUI 外殼所需的 `UIViewControllerRepresentable` 包裝器。
導航狀態僅存在於一個地方，而不是在 Swift 與 Kotlin 之間重複。

若要取得原生導航列與共用的 Compose 畫面內容，請在 `commonMain` 中將導航合約宣告為 `expect class` 協調器，並在各個平台提供 `actual` 實作。

本教學的 SwiftUI 外殼是宣告式的：您描述 `TabView` 與 `NavigationStack`，並由 SwiftUI 管理堆疊。
UIKit 協調器方法是命令式的：您擁有 `UINavigationController` 並自行呼叫 `push` 與 `pop`。

```
SceneDelegate
  └── UIWindow.rootViewController = UITabBarController
        ├── UINavigationController (Schedule)
        │     ├── ComposeUIViewController  ← 標籤頁根目錄
        │     └── ComposeUIViewController  ← 詳細資料，在 Kotlin 中推入
        └── UINavigationController (Info)
              └── ...
```

本教學中的 SwiftUI 組件與 UIKit 協調器的對應如下：

* SwiftUI `TabView` 與 `NavigationStack` → `UITabBarController` 與 `UINavigationController`
* `TabNavigationCoordinator` 與 `RouteWrapper` → Kotlin `actual` 協調器 `push` 與 `pop`
* `NativeNavComposeView` 與 `DetailComposeView` → 協調器內部的 `ComposeUIViewController { Screen(...) }`
* `ContentView` SwiftUI 外殼 → `SceneDelegate` 設定 `window.rootViewController`

```kotlin
// commonMain
expect class ScheduleCoordinator() {
    fun navigateToDetail(route: AppRoute)
    fun navigateBack()
    @Composable fun Content()
}
```

在 `iosMain` 中的 `actual` 實作會呼叫 `UINavigationController` 上的 `push` 與 `pop`，並將 `showTopBar` 設定為 `false`。
在 iOS 上，從 `SceneDelegate` 建立協調器，並將標籤列控制器設定為視窗的根視圖控制器。
您不需要 SwiftUI `App` 或 `ContentView` 包裝器。

您可以透過兩種方式分配 Kotlin 與 Swift 之間的工作：

* **全部在 Kotlin `iosMain` 中**：使用 UIKit 互通性在 `actual` 協調器中連接 `UITabBarController`、`UINavigationController` 與 `ComposeUIViewController`。
* **Kotlin 負責畫面工廠，Swift 負責組裝**：從 `iosMain` 公開傳回包含導航閉包之 `ComposeUIViewController` 執行個體的 `MainViewController` 與 `ScreenViewController`，並在原生 Swift 中組建標籤列與導航堆疊。當 iOS 導航程式碼應保留在 Swift 中，而畫面內容保持為共用的 Compose 時，此選項運作良好。

這兩個選項都能為您提供相同的扁平 UIKit 階層，而無需 SwiftUI 或 `UIViewControllerRepresentable`。
請根據您的團隊偏好協調器邏輯所在的位置進行選擇。

有關在 `UITabBarController` 內部使用 Compose 的詳細資訊，請參閱 [與 UIKit 框架整合](compose-uikit-integration.md)。

## 建置 SwiftUI 導航層

這是遷移的 iOS 端。先前步驟中所有的 Kotlin 變更都是為了此處發生的事情做準備：一個帶有各標籤頁 `NavigationStack` 的 SwiftUI `TabView`，這些堆疊將 Compose 檢視作為其目的地。
若要建置此結構，請完成以下步驟：

1. [讓 Kotlin 路由在 `NavigationStack` 中可用](#make-kotlin-routes-usable-in-navigationstack)
2. [追蹤標籤頁與導航狀態](#track-tab-and-navigation-state)
3. [將 Compose 畫面嵌入為 SwiftUI 檢視](#embed-compose-screens-as-swiftui-views)
4. [在每個標籤頁內設定導航](#set-up-navigation-within-each-tab)
5. [建置標籤列](#build-the-tab-bar)
6. [在較舊的 iOS 版本上備援](#fall-back-on-older-ios-versions)

請注意，此章節中的程式碼均未直接套用 Liquid Glass 效果。
iOS 26 會為原生的 `TabView` 與 `NavigationStack` 檢視自動渲染 Liquid Glass，因此使用它們就足以啟用此效果。

### 讓 Kotlin 路由在 `NavigationStack` 中可用

`NavigationStack` 要求其路徑元素必須符合 `Hashable` 與 `Identifiable` 協定。
為了滿足 Kotlin 密封介面的要求，請將 `AppRoute` 包裝在 Swift `struct` 中。
將以下內容新增至 `ContentView.swift` 檔案：

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

兩次推入相同的路由必須建立兩個不同的堆疊項目，以符合預期的導航行為。
為了實現這一點，識別是基於 UUID 而非路由的值。

### 追蹤標籤頁與導航狀態

每個標籤頁都有自己的導航堆疊，應用程式會追蹤目前選取的是哪個標籤頁。
新增兩個 `@Observable` 類別來處理此問題：

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

`AppNavigationCoordinator` 針對本教學中使用的雙標籤頁版本進行了簡化。
如需完整版本，請參閱 [`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/b451d80301c50097d4cf5050d865829b49d07c8e/app/iosApp/iosApp/ContentView.swift)。

### 將 Compose 畫面嵌入為 SwiftUI 檢視

兩個 `UIViewControllerRepresentable` 型別將來自[公開新的 iOS 入口點](#expose-new-ios-entry-points)步驟的 Kotlin 入口點連接到 SwiftUI：
一個用於標籤頁根目錄，一個用於詳細資料畫面。

`NativeNavComposeView` 託管標籤頁根目錄（Compose 的 `NavHost`）並轉發其導航事件：

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

`DetailComposeView` 託管單一詳細資料畫面，每個 `NavigationStack` 目的地都有一個執行個體：

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

### 在每個標籤頁內設定導航

在標籤頁層級，`NavigationStack` 使用 Compose 標籤頁內容作為其根檢視，並將詳細資料畫面渲染為目的地。

請注意，即使同時套用了 `.navigationBarHidden(true)`，也必須在標籤頁根目錄上設定 `.navigationTitle(title)`。
iOS 26 會讀取此值來為懸浮標籤列中的標籤頁命名，如果遺漏此值，標籤將會是空白的。

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

### 建置標籤列

最上層容器是一個 `TabView`，每個最上層路由都有一個 `Tab`。
`.tabBarMinimizeBehavior(.automatic)` 修飾符使標籤列能夠懸浮並在捲動時最小化。
若無此修飾符，標籤列將固定在底部。
`.tint(Color(.accent))` 修飾符將應用程式的強調色套用於選取的標籤頁。

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

`Color(.accent)` 會解析為 Xcode 專案資產目錄中的 `AccentColor` 資產。
您可以透過 Xcode 的資產目錄編輯器來定義它
（請參閱 [指定應用程式的配色方案](https://developer.apple.com/documentation/xcode/specifying-your-apps-color-scheme)）
或建立 `Assets.xcassets/AccentColor.colorset/Contents.json`。若選擇 JSON 選項，
您可以將範例專案中的 [`Contents.json`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/Assets.xcassets/AccentColor.colorset/Contents.json)
作為起點，並將組件值替換為您自己的顏色。

有兩個標籤頁時，應用程式轉譯如下：

![雙標籤頁](ios-kotlinconf-two-tabs.png){ width="250" style="block"}

半透明感、深度與懸浮標籤列皆由 iOS 26 套用 — 無需額外的樣式程式碼。

### 在較舊的 iOS 版本上備援

Liquid Glass 與新的 `TabView` API 僅限 iOS 26。
在舊版本上，應用程式會回退到之前的 Compose 驅動設定。
`ComposeView` 是圍繞無回呼 `MainViewController` 多載的 SwiftUI 包裝器：

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

參閱完整檔案：[`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/ContentView.swift)。

## 替代方法

本教學中的遷移偏好原生 SwiftUI 導航，這讓您能開箱即用地獲得 Liquid Glass 與其他系統行為。
若此方法不適合您的專案，請考慮以下替代方案之一：

* **從 Kotlin 協調 UIKit 導航**。在 `commonMain` 中將導航合約宣告為 `expect class` 協調器，並在每個平台上提供 `actual` 實作，以命令式方式驅動 `UITabBarController` 與 `UINavigationController`。您無需 SwiftUI 外殼即可獲得 Liquid Glass 與單一的導航狀態來源，但您需要撰寫 UIKit 互通程式碼。
  詳情請參閱[跳過 SwiftUI 並從 Kotlin 驅動 UIKit](#alternative-skip-swiftui-and-drive-uikit-from-kotlin)。
* **具有原生互通控制項的 Compose 驅動導航**。保留 Compose 中的導航，但嵌入原生 UI 控制項（如 `UITabBar` 與 `UINavigationBar`），包括 Liquid Glass 樣式。缺點是原生疊加層與 Compose 內容之間存在一些互通性限制。
* **具有第三方適應性 UI 解決方案的 Compose 驅動導航**。使用如 [Calf](https://klibs.io/project/MohamedRejeb/Calf) 等程式庫來渲染對應用程式執行平台原生的適應性 UI 組件。
  此方法降低了自行處理平台差異的複雜性，並能開箱即用地提供 iOS 上的 Liquid Glass 等原生行為。
* **僅 Compose 導航並模擬 Liquid Glass 效果**。完全在 Compose 中渲染，並以視覺方式模擬 Liquid Glass，例如使用 [AndroidLiquidGlass](https://klibs.io/project/Kyant0/AndroidLiquidGlass) 或 [Liquid](https://klibs.io/project/FletchMcKee/liquid) 等程式庫。
  此方法將所有 UI 保留在 Compose 側，視覺效果雖然相似，但與系統 Liquid Glass 並不完全相同。

## 下一步

* 查看已套用 Liquid Glass 效果的 [官方 KotlinConf 應用程式](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav)。
* 參閱 [採用 Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)，這是 Apple 對新材質的概述與採用檢查表。
* 參考 [與 SwiftUI 框架整合](compose-swiftui-integration.md)，獲取有關在 SwiftUI 內部使用 Compose Multiplatform 以及在 Compose Multiplatform 應用程式中嵌入 SwiftUI 的官方指南。