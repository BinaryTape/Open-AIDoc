[//]: # (title: Compose Multiplatform 应用中的 Liquid Glass)
<show-structure depth="1"/>

<web-summary>关于在 Compose Multiplatform 应用中采用 iOS 26 Liquid Glass 的分步教程，通过将导航迁移到原生 SwiftUI 实现。</web-summary>

[Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass) 是 Apple 在 iOS 26 中引入的视觉设计系统，为 UI 元素带来了玻璃般的半透明感和流动感。
要在 Compose Multiplatform 应用中采用它，您需要一个原生的 SwiftUI 外壳，因为 Liquid Glass 效果是由系统通过原生 `TabView`、`NavigationStack` 和工具栏 API 渲染的。
如果 SwiftUI 不适合您的项目，请参阅[替代方案](#alternative-approaches)。

本教程将引导您**将 iOS 应用从完全由 Compose 驱动的导航迁移到原生 SwiftUI 导航**，并采用 iOS 26 Liquid Glass 样式，同时保持由 Compose 负责渲染每个页面的内容。
当应用使用原生 `TabView` 和 `NavigationStack` 视图时，系统会自动应用 Liquid Glass 效果，因此您无需编写任何特定于 Liquid Glass 的代码。

我们将使用官方的 [KotlinConf 应用](https://apps.apple.com/us/app/kotlinconf/id1299196584)作为示例。

> 您需要使用包含 iOS 26 SDK 的 Xcode 26 或更高版本。
>
{style="note"}

* [`main` 分支](https://github.com/JetBrains/kotlinconf-app/tree/main) — 初始状态，带有完全在 Compose 中实现的自定义主题。
* [`lg-nav` 分支](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav) — 最终状态，带有 Liquid Glass 设计。

![共享 UI](ios-kotlinconf-no-liquid-glass.png){ width="250" style="inline"}
![带 Liquid Glass 的原生 iOS UI](ios-kotlinconf-liquid-glass.png){ width="250" style="inline"}

克隆该仓库并检出任一分支以进行后续操作，或者并排对比它们：
[`main...lg-nav`](https://github.com/JetBrains/kotlinconf-app/compare/main...lg-nav)。

为了简单起见，我们将迁移该应用的两个选项卡版本（**Schedule** 和 **Info**），但同样的模式可以扩展到任意数量的选项卡。

## 迁移计划

在完全共享 UI 代码的 Compose Multiplatform 设置中，单个 `ComposeUIViewController` 负责整个 iOS UI：选项卡、导航堆栈、返回手势和页面内容。
Compose Multiplatform 在 iOS 上的导航过渡旨在提供原生感，但某些平台级功能（例如 iOS 26 的 Liquid Glass 选项卡栏样式）仅通过原生 iOS 组件提供。

解决方案是将导航移交给原生 iOS，让系统渲染选项卡栏和导航堆栈，而 Compose 继续渲染每个页面的内容。

**迁移前：**

```
ContentView
  └── ComposeView (Compose Multiplatform)
```

**迁移后：**

```
ContentView
  └── TabView  (Liquid Glass, iOS 26)
        ├── 选项卡: Schedule
        │     └── NavigationStack
        │           ├── NativeNavComposeView  ← Compose 选项卡根视图
        │           └── DetailComposeView     ← Compose 详情页面，每个目的地一个
        └── 选项卡: Info
              └── NavigationStack
                    ├── NativeNavComposeView  ← Compose 选项卡根视图
                    └── DetailComposeView     ← Compose 详情页面，每个目的地一个
```

以下是新设置中的导航流：

* SwiftUI 创建一个 `TabView`，其中包含每个选项卡的 `NavigationStack`。
* Compose 仍然渲染每个页面的内容，但不再管理回退堆栈。
* 当用户从 Compose 页面触发导航时（例如，点击列表行），该事件将通过 `onNavigate` 转发到 Swift。
* Swift 协调器将路由推送到其 `NavigationStack` 中，从而创建一个托管单个 Compose 页面的新 `UIViewController`。

迁移涉及共享的 Compose Multiplatform 代码和原生的 iOS 代码。
在共享的 Kotlin 代码中：

* [为路由添加标题元数据](#add-title-metadata-to-routes)，以便 SwiftUI 可以渲染导航栏标题和回退堆栈条目，而无需回调 Kotlin。
* [为 iOS 入口点添加导航回调](#add-navigation-callbacks-to-the-ios-entry-point)，以便 iOS 层可以控制哪个选项卡处于活动状态并响应导航事件。
* [在 Compose 层级拦截导航](#intercept-navigation-at-the-compose-level)，以便将详情路由转发到 Swift，而不是由 Compose 处理。
  本教程展示了 Navigation 3 的实现方式 —— 如果您使用不同的导航库，请调整此步骤。
* [为 iOS 构建独立的页面渲染器](#build-a-standalone-screen-renderer-for-ios)，以便 SwiftUI 可以在完整的 `App()` 之外独立渲染任何详情路由。
* [隐藏 Compose 内置的导航 UI](#hide-compose-s-built-in-navigation-ui)，当由 SwiftUI 负责导航时，用户不会看到重复的标题栏和返回按钮。
* [暴露新的 iOS 入口点](#expose-new-ios-entry-points)，用于创建根视图控制器和单个页面视图控制器。

在原生 iOS 代码 (Swift) 中：

* [构建 SwiftUI 导航层](#build-the-swiftui-navigation-layer)，使用原生的 `TabView` 和 `NavigationStack` 视图，以及嵌入 Compose 页面的桥接。

## 为路由添加标题元数据

在 iOS 上，每个目的地都有一个显示在导航栏中的标题，以及长按返回按钮时显示的回退堆栈中的标题。
我们将标题直接存储在路由对象上，这样每个路由都是自描述的，Swift 可以在不往返调用 Kotlin 的情况下读取标题。

1. 在 `navigation/Routes.kt` 文件中，为 `AppRoute` 添加 `title` 和 `subtitle` 属性：

    ```kotlin
    @Serializable
    sealed interface AppRoute {
        val title: String? get() = null
        val subtitle: String? get() = null
    }
    ```

2. 在作为详情页面显示的路由上重写 `title`（以及有用的 `subtitle`）。对于已经携带数据的路由，将其添加为可选形参：

    ```kotlin
    @Serializable
    data class SessionScreen(
        val sessionId: SessionId,
        override val title: String? = null,
    ) : AppRoute
    ```

3. 曾是 `data object` 的路由也需要标题，但 `data object` 无法携带每个实例的标题状态。将它们转换为 `data class`：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            data object SettingsScreen : AppRoute"/>
        <code-block lang="kotlin" code="            data class SettingsScreen(override val title: String = &quot;&quot;) : AppRoute"/>
    </compare>

   有关更新后的路由定义的完整集合，请参阅 [`Routes.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/Routes.kt)。

4. 在 `NavHost.kt` 文件的调用处传递本地化标题。由于 `stringResource` 是一个 `@Composable` 函数，请在入口作用域内解析它并在点击回调中捕获它，而不是在回调内部：

    ```kotlin
    entry<InfoScreen> {
        val settingsTitle = stringResource(Res.string.settings_title)
        InfoScreen(
            onSettings = { navigator.add(SettingsScreen(settingsTitle)) },
            // ...
        )
    }
    ```

## 为 iOS 入口点添加导航回调

`App()` 是 iOS 调用的 Kotlin 入口点。为了让 Swift 驱动导航，它需要一种方式来完成三件事：

* 在应用启动时通过新的 `topLevelRoute` 形参选择起始选项卡。
* 通过 `onNavigate` 回调响应来自 Compose 的导航推送（例如，当点击列表项时）。
* 通过 `onActivate` 回调响应从 Compose 发起的选项卡切换。

新的回调是可选的，默认为 `null`，因此 Android、桌面和 Web 目标不受影响。

在 `App.kt` 文件中，相应地更新 `App()` 的签名：

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

有关完整实现，请参阅 [`App.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/App.kt)。

## 在 Compose 层级拦截导航

现在 `App()` 暴露了导航回调，`NavHost` 需要使用它们。每当详情路由出现在 Compose 的回退堆栈上时，将其移交给 Swift 并立即将其从 Compose 中移除。这样，Compose 仅在从 Swift 调用时才渲染详情页面。

需要设置两个流：

* 详情推送 → Swift。每当非根路由进入回退堆栈时，通过 `onNavigate` 将其转发，并将其从 Compose 的回退堆栈中移除，使 SwiftUI 的 `NavigationStack` 成为单一事实来源。
* 选项卡切换 → Swift。当顶级路由从 Compose 内部发生更改时，通过 `onActivate` 通知 Swift，以便 SwiftUI 的 `TabView` 选定项保持同步。

此步骤特定于 Navigation 3 库。同样的拦截模式适用于任何 Compose 导航库，但具体的 API（回退堆栈访问、当前目的地观察）会有所不同。

在 `navigation/NavHost.kt` 中，将新参数和两个拦截效应添加到 `NavHost()` 函数中：

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
    // 将详情路由转发到 Swift 并将其从 Compose 堆栈中移除
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
    // 当用户从 Compose 内部切换选项卡时通知 Swift
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

有关完整文件，请参阅 [`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt)。

## 为 iOS 构建独立的页面渲染器

当 SwiftUI 拥有 `NavigationStack` 时，Compose 只需要渲染每个页面的内容。`NavHost` 专为管理回退堆栈、过渡和生命周期而设计，因此我们需要一个更简单的入口点来渲染单个路由。

### 添加扁平的页面渲染器

`ScreenContent` 就是那个更简单的入口点：一个扁平的 `when` 表达式，它将单个详情路由映射到其 Composable，自身不具有导航状态。选项卡根路由仍然由完整的 `App()` / `NavHost` 处理。SwiftUI 为每个目的地创建一个单独的视图控制器，每个控制器托管一个 `ScreenContent` 调用。

将以下内容添加到 `navigation/NavHost.kt`：

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
        // 所有其他详情路由
        else -> {}
    }
}
```

标题不会出现在此函数中：它们在[为路由添加标题元数据](#add-title-metadata-to-routes)步骤中已附加到路由对象，因此 Swift 端在配置其导航栏时可以直接从每个路由中读取它们。

### 向 Compose 发出信号，表明 SwiftUI 拥有导航

`ScreenContent` 运行在 SwiftUI 渲染导航栏和返回按钮的上下文中。绘制自己标题栏或返回按钮的 Compose 页面必须跳过它们。

为了避免在组合树内部出现重复，请使用一个 `CompositionLocal`，这样每个页面都可以在不依赖 iOS 特定代码的情况下读取它。

在 `NavHost.kt` 文件中的 `NavHost()` 函数之前声明 `LocalUseNativeNavigation` 作为 `CompositionLocal`：

```kotlin
val LocalUseNativeNavigation = staticCompositionLocalOf { false }
```

### 为 iOS 包装渲染器

`ScreenContent` 渲染一个路由，但它需要一个包装器来设置相同的主题、依赖注入和应用级 `CompositionLocal` 值，而这些通常由 `App()` 设置。

添加 `SingleScreenApp` 包装器。它镜像了 `App()` 的设置，并额外将 `LocalUseNativeNavigation` 设置为 `true`，以便每个页面自动隐藏其 Compose 渲染的标题栏和返回按钮。

在 `iosMain` 源集中，创建 `SingleScreenApp.kt` 文件：

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
    // 设置主题和标志
    CompositionLocalProvider(
        LocalUseNativeNavigation provides true,
        LocalFlags provides flags,
        LocalAppGraph provides appGraph,
        // 其他提供程序
    ) {
        KotlinConfTheme(colors = colors) {
            Box(Modifier.fillMaxSize().background(KotlinConfTheme.colors.mainBackground)) {
                ScreenContent(route, onNavigate, onGoBack, onSet, onActivate)
            }
        }
    }
}
```

### 将标志应用于选项卡根路由

选项卡根路由仍然通过常规的 `NavHost` 进行，因此它们也需要遵循 `LocalUseNativeNavigation` 的值。根据原生导航回调是否处于活动状态来提供它。当它们处于活动状态时，直接渲染导航内容并跳过 `NavScaffold`（Compose 底部栏）：

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

有关完整实现，请参阅 [`NavHost.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/navigation/NavHost.kt)
和 [`SingleScreenApp.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/SingleScreenApp.kt)。

## 隐藏 Compose 内置的导航 UI

在 SwiftUI 渲染导航 UI 的任何地方设置了 `LocalUseNativeNavigation` 之后，各个页面现在需要读取它并隐藏自己的标题栏和返回按钮。否则，用户会看到两个标题栏堆叠在一起，以及两个竞争的返回按钮。

在 `BaseScreens.kt` 中，更新 `ScreenWithTitle()` 函数以读取 `LocalUseNativeNavigation`，并在其为 `true` 时跳过标题栏及其分隔符：

```kotlin
val useNativeNavigation = LocalUseNativeNavigation.current

if (!useNativeNavigation) {
    MainHeaderTitleBar(...)
    HorizontalDivider(...)
}
```

将相同的模式应用于绘制自己返回按钮或页眉的任何其他页面。

有关完整实现，请参阅 [`BaseScreens.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/commonMain/kotlin/org/jetbrains/kotlinconf/BaseScreens.kt)。

## 暴露新的 iOS 入口点

为了从 SwiftUI 构建新的导航结构，暴露三个 Kotlin 入口点：`MainViewController` 的两个重载和一个 `ScreenViewController`。在 `iosMain/main.ios.kt` 中，添加这三个函数：

* 不带回调的 `MainViewController`，用作 iOS 26 之前的回退。Liquid Glass API 需要 iOS 26，因此在旧版本上 SwiftUI 应该回退到原始的全 Compose 设置。如果没有这个重载，Swift 中的 `#available` 分支将无法编译。

    ```kotlin
    // iOS 26 之前的回退：全 Compose 导航，无原生回调
    @Suppress("unused")
    fun MainViewController(topLevelRoute: TopLevelRoute): UIViewController = ComposeUIViewController(
        configure = { onFocusBehavior = OnFocusBehavior.DoNothing },
    ) {
        App(appGraph, topLevelRoute)
    }
    ```

* 带有回调的 `MainViewController`，由 SwiftUI 为每个选项卡根路由调用。Compose 运行完整的 `App()` 和 `NavHost`，但导航事件被转发到 SwiftUI，而不是在内部处理。签名中包含 `onGoBack` 和 `onSet` 以与 `ScreenViewController` 保持 API 对称，尽管在此重载中未使用它们。

    ```kotlin
    // 选项卡根路由：Compose 运行 NavHost，但将导航事件交给 SwiftUI
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
  
* `ScreenViewController`，由 SwiftUI 为每个详情页面调用。通过 `SingleScreenApp` 渲染单个路由，它将 `LocalUseNativeNavigation` 设置为 `true`，从而隐藏 Compose 内置的标题栏和返回按钮。

    ```kotlin
    // 详情页面：渲染单个页面并设置 LocalUseNativeNavigation = true
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

有关完整实现，请参阅 [`main.ios.kt`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/shared/src/iosMain/kotlin/org/jetbrains/kotlinconf/main.ios.kt)。

### 替代方案：跳过 SwiftUI 并从 Kotlin 驱动 UIKit {collapsible="true"}

上述入口点是为 SwiftUI 的 `TabView` 和 `NavigationStack` 设计的。在底层，SwiftUI 使用 `UITabBarController` 和 `UINavigationController` 来实现这些视图，而 iOS 26 上的 Liquid Glass 会应用于原生的选项卡栏和导航栏，无论您是在 SwiftUI 中声明它们还是在 UIKit 中配置它们。

如果您是从头开始构建新的 iOS 入口点，或者还没有需要保留的 SwiftUI App 和 `ContentView`，您可以完全跳过 SwiftUI 层并直接从 Kotlin 驱动 UIKit。这种方法避免了本教程中的 SwiftUI 外壳所需的 `RouteWrapper` 标识变通方案、从 Kotlin 回调镜像的 `@Observable` 路径状态以及 `UIViewControllerRepresentable` 包装器。导航状态位于一处，而不是在 Swift 和 Kotlin 之间重复。

要获得原生导航栏和共享的 Compose 页面内容，请在 `commonMain` 中将导航契约声明为 `expect class` 协调器，并在每个平台上提供 `actual` 实现。

本教程的 SwiftUI 外壳是声明式的：您描述一个 `TabView` 和 `NavigationStack`，由 SwiftUI 管理堆栈。UIKit 协调器方法是命令式的：您拥有一个 `UINavigationController` 并亲自调用 `push` 和 `pop`。

```
SceneDelegate
  └── UIWindow.rootViewController = UITabBarController
        ├── UINavigationController (Schedule)
        │     ├── ComposeUIViewController  ← 选项卡根页面
        │     └── ComposeUIViewController  ← 详情页面，在 Kotlin 中推送
        └── UINavigationController (Info)
              └── ...
```

本教程中的 SwiftUI 部件与 UIKit 协调器的映射如下：

* SwiftUI `TabView` 和 `NavigationStack` → `UITabBarController` 和 `UINavigationController`
* `TabNavigationCoordinator` 和 `RouteWrapper` → Kotlin `actual` 协调器的 `push` 和 `pop`
* `NativeNavComposeView` 和 `DetailComposeView` → 协调器内部的 `ComposeUIViewController { Screen(...) }`
* `ContentView` SwiftUI 外壳 → `SceneDelegate` 设置 `window.rootViewController`

```kotlin
// commonMain
expect class ScheduleCoordinator() {
    fun navigateToDetail(route: AppRoute)
    fun navigateBack()
    @Composable fun Content()
}
```

`iosMain` 中的 `actual` 实现会在 `UINavigationController` 上调用 `push` 和 `pop` 并设置 `showTopBar` 为 `false`。在 iOS 上，从 `SceneDelegate` 创建协调器，并将选项卡栏控制器设置为窗口的根视图控制器。您不需要 SwiftUI `App` 或 `ContentView` 包装器。

您可以通过两种方式在 Kotlin 和 Swift 之间拆分工作：

* **全部在 Kotlin `iosMain` 中**：使用 UIKit 互操作在 `actual` 协调器中连接 `UITabBarController`、`UINavigationController` 和 `ComposeUIViewController`。
* **Kotlin 负责页面工厂，Swift 负责组装**：从 `iosMain` 暴露 `MainViewController` 和 `ScreenViewController`，它们返回带有导航闭包的 `ComposeUIViewController` 实例，并在原生 Swift 中构建选项卡栏和导航堆栈。当 iOS 导航代码应留在 Swift 中而页面内容保持共享 Compose 时，此选项效果很好。

这两个选项都能为您提供相同的扁平 UIKit 层次结构，而无需 SwiftUI 或 `UIViewControllerRepresentable`。请根据您的团队偏好协调器逻辑存放的位置进行选择。

有关在 `UITabBarController` 中使用 Compose 的详细信息，请参阅[与 UIKit 框架集成](compose-uikit-integration.md)。

## 构建 SwiftUI 导航层

这是迁移的 iOS 端。前面步骤中的所有 Kotlin 更改都为这里发生的事情做好了准备：一个带有每个选项卡 `NavigationStack` 的 SwiftUI `TabView`，这些堆栈将 Compose 视图托管为目的地。要构建它，请完成以下操作：

1. [使 Kotlin 路由在 `NavigationStack` 中可用](#make-kotlin-routes-usable-in-navigationstack)
2. [跟踪选项卡和导航状态](#track-tab-and-navigation-state)
3. [将 Compose 页面嵌入为 SwiftUI 视图](#embed-compose-screens-as-swiftui-views)
4. [在每个选项卡中设置导航](#set-up-navigation-within-each-tab)
5. [构建选项卡栏](#build-the-tab-bar)
6. [在旧版 iOS 版本上回退](#fall-back-on-older-ios-versions)

请注意，本节中的代码均未直接应用 Liquid Glass 效果。iOS 26 会自动为原生的 `TabView` 和 `NavigationStack` 视图渲染 Liquid Glass，因此使用它们就足以启用它。

### 使 Kotlin 路由在 `NavigationStack` 中可用

`NavigationStack` 要求其路径元素遵循 `Hashable` 和 `Identifiable` 协议。为了让 Kotlin 密封接口满足这一要求，请将 `AppRoute` 包装在 Swift `struct` 中。将以下内容添加到 `ContentView.swift` 文件：

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

两次推送相同的路由必须创建两个不同的堆栈条目，以匹配预期的导航行为。为了实现这一点，标识是基于 UUID 而不是路由的值。

### 跟踪选项卡和导航状态

每个选项卡都有自己的导航堆栈，应用会跟踪当前选定的选项卡。添加两个 `@Observable` 类来处理此问题：

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

本教程中使用的两选项卡版本的 `AppNavigationCoordinator` 经过了简化。有关完整版本，请参阅 [`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/b451d80301c50097d4cf5050d865829b49d07c8e/app/iosApp/iosApp/ContentView.swift)。

### 将 Compose 页面嵌入为 SwiftUI 视图

两个 `UIViewControllerRepresentable` 类型将[暴露新的 iOS 入口点](#expose-new-ios-entry-points)步骤中的 Kotlin 入口点连接到 SwiftUI：一个用于选项卡根路由，一个用于详情页面。

`NativeNavComposeView` 托管一个选项卡根路由（Compose 的 `NavHost`）并转发其导航事件：

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

`DetailComposeView` 托管单个详情页面，每个 `NavigationStack` 目的地一个实例：

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

### 在每个选项卡中设置导航

在选项卡层级，`NavigationStack` 使用 Compose 选项卡内容作为其根视图，并将详情页面渲染为目的地。

请注意，即使应用了 `.navigationBarHidden(true)`，也必须在选项卡根视图上设置 `.navigationTitle(title)`。iOS 26 会读取此值来为悬浮选项卡栏中的选项卡添加标签，如果缺失，标签将为空白。

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

### 构建选项卡栏

顶级容器是一个 `TabView`，每个顶级路由对应一个 `Tab`。`.tabBarMinimizeBehavior(.automatic)` 修饰符使选项卡栏悬浮并在滚动时最小化。如果没有它，选项卡栏将固定在底部。`.tint(Color(.accent))` 修饰符将应用的强调色应用于选定的选项卡。

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

`Color(.accent)` 解析为 Xcode 项目资源目录中的 `AccentColor` 资源。您可以点击 Xcode 资源目录编辑器进行定义（参阅 [Specifying your app's color scheme](https://developer.apple.com/documentation/xcode/specifying-your-apps-color-scheme)），或通过创建 `Assets.xcassets/AccentColor.colorset/Contents.json` 进行定义。对于 JSON 选项，您可以使用示例项目中的 [`Contents.json`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/Assets.xcassets/AccentColor.colorset/Contents.json) 作为起点，并用您自己的颜色替换组件值。

带有两个选项卡的应用渲染效果如下：

![两个选项卡](ios-kotlinconf-two-tabs.png){ width="250" style="block"}

半透明效果、深度感和悬浮选项卡栏均由 iOS 26 应用 —— 无需额外的样式代码。

### 在旧版 iOS 版本上回退

Liquid Glass 和新的 `TabView` API 仅支持 iOS 26。在旧版本上，应用会回退到之前的 Compose 驱动设置。`ComposeView` 是围绕无回调 `MainViewController` 重载的 SwiftUI 包装器：

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

查看完整文件：[`ContentView.swift`](https://github.com/JetBrains/kotlinconf-app/blob/3982334f1c3712fb959f0d20b563d6c8b81e9bbd/app/iosApp/iosApp/ContentView.swift)。

## 替代方案

本教程中的迁移偏向于使用原生 SwiftUI 导航，这可以让您开箱即用地获得 Liquid Glass 和其他系统行为。如果这种方法不适合您的项目，请考虑以下替代方案之一：

* **从 Kotlin 协调 UIKit 导航**。在 `commonMain` 中将导航契约声明为 `expect class` 协调器，并在每个平台上提供 `actual` 实现，以命令式方式驱动 `UITabBarController` 和 `UINavigationController`。您可以在没有 SwiftUI 外壳的情况下获得 Liquid Glass 和单一的导航状态来源，但您需要编写 UIKit 互操作代码。请参阅[跳过 SwiftUI 并从 Kotlin 驱动 UIKit](#alternative-skip-swiftui-and-drive-uikit-from-kotlin)了解详情。
* **带有原生互操作控制的 Compose 驱动导航**。在 Compose 中保留导航，但嵌入原生的 UI 控件（如 `UITabBar` 和 `UINavigationBar`），包括 Liquid Glass 样式。权衡之处在于原生叠加层与 Compose 内容之间存在一些互操作限制。
* **带有第三方自适应 UI 解决方案的 Compose 驱动导航**。使用像 [Calf](https://klibs.io/project/MohamedRejeb/Calf) 这样的库来渲染原生于应用运行平台的自适应 UI 组件。这种方法降低了自行处理平台差异的复杂性，并提供了开箱即用的 iOS 原生行为（如 Liquid Glass）。
* **带有模拟 Liquid Glass 效果的纯 Compose 导航**。在 Compose 中渲染所有内容并视觉上模拟 Liquid Glass，例如使用 [AndroidLiquidGlass](https://klibs.io/project/Kyant0/AndroidLiquidGlass) 或 [Liquid](https://klibs.io/project/FletchMcKee/liquid) 等库。这种方法将所有 UI 保留在 Compose 侧，效果在视觉上相似，但与系统 Liquid Glass 不完全相同。

## 下一步

* 查看应用了 Liquid Glass 效果的[官方 KotlinConf 应用程序](https://github.com/JetBrains/kotlinconf-app/tree/lg-nav)。
* 参阅 [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)，Apple 对新材质的概述和采用核对清单。
* 参考 [与 SwiftUI 框架集成](compose-swiftui-integration.md) 以获取在 SwiftUI 中使用 Compose Multiplatform 以及在 Compose Multiplatform 应用中嵌入 SwiftUI 的官方指导。