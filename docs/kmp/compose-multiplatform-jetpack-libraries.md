# 多平台 Jetpack 库如何打包

Compose Multiplatform 将 Jetpack Compose 及其相关 AndroidX 库的全部功能带到了除 Android 以外的其他平台。
正如 [Android 开发者网站](https://developer.android.com/kotlin/multiplatform)上所示，许多 Jetpack 库（如 `androidx.annotation`）由 Android 团队以完全多平台的形式发布，并可以在 KMP 项目中原样使用。
其他库（如 Compose 本身、Navigation、Lifecycle 和 ViewModel）则需要额外的支持才能在公共代码中工作。

JetBrains 的 Compose Multiplatform 团队为这些库生产除 Android 以外平台的构件，然后将它们与原始 Android 构件一起发布在单个组 ID (group ID) 下。
这样，当您向公共源集添加此类多平台依赖项时，应用的 Android 分发版本将使用 Android 构件。
与此同时，其他目标的分发版本将使用为相应平台构建的构件。

以下是该流程的简述：

![](androidx-cmp-artifacts.svg)

例如，“iOS 的 Navigation 构件”是指以下多平台构件的集合：
* `org.jetbrains.androidx.navigation.navigation-compose-uikitarm64`
* `org.jetbrains.androidx.navigation.navigation-compose-uikitsimarm64`
* `org.jetbrains.androidx.navigation.navigation-common-iosarm64`
* `org.jetbrains.androidx.navigation.navigation-runtime-iossimulatorarm64`
* 依此类推。

所有这些构件，连同其他平台的构件以及对原始 Android 库 (`androidx.navigation.navigation-compose`) 的引用，作为一个组发布。它们可以通过统一的 `org.jetbrains.androidx.navigation.navigation-compose` 依赖项进行访问。
Compose Multiplatform Gradle 插件处理平台特定构件到分发版本的映射。

通过这种方法，使用该依赖项的 Kotlin Multiplatform (KMP) 项目生成的 Android 应用会使用原始的 Android Navigation 库。
而 iOS 应用则使用由 JetBrains 构建的相应 iOS 库。

## 适用于多平台项目的 Compose 软件包

在基础 Compose 库中，最核心的 `androidx.compose.runtime` 是完全多平台的。
  （[此前使用的](whats-new-compose-190.md#multiplatform-targets-in-androidx-compose-runtime-runtime) `org.jetbrains.compose.runtime` 构件现在充当别名。）
此外，Compose Multiplatform 还实现了：
   * `androidx.compose.ui` 和 `androidx.compose.foundation` 的多平台版本，在 Compose Multiplatform 项目中作为 `org.jetbrains.compose.ui` 和 `org.jetbrains.compose.foundation` 提供。
   * `androidx.compose.material3` 和 `androidx.compose.material` 的多平台版本，也以类似方式打包（`org.jetbrains.compose.material3` 和 `org.jetbrains.compose.material`）。
     与其他库不同，Material 3 库不与 Compose Multiplatform 版本耦合。
     因此，您可以提供直接依赖项，而不是使用 `material3` 别名。例如，您可能会使用 EAP 版本。
   * 作为独立构件的 Material 3 adaptive 库 (`org.jetbrains.compose.material3.adaptive:adaptive*`)

## 其他多平台库

构建 Compose 应用所需的某些功能超出了 AndroidX 的范围，因此 JetBrains 将其实现为随 Compose Multiplatform 捆绑的多平台库，例如：

* Compose Multiplatform Gradle 插件，它可以：
    * 提供用于配置 Compose Multiplatform 项目的 Gradle DSL。
    * 帮助为桌面和 Web 目标创建分发包。
    * 支持多平台资源库，使资源能正确地用于每个目标。
* `org.jetbrains.compose.components.resources`，提供对 [跨平台资源](compose-multiplatform-resources.md) 的支持。
* `org.jetbrains.compose.components.uiToolingPreview`，支持在 IntelliJ IDEA 和 Android Studio 中对公共代码进行 Compose UI 预览。
* `org.jetbrains.compose.components.animatedimage`，支持显示动画图像。
* `org.jetbrains.compose.components.splitpane`，实现了类似于 Swing 的 [JSplitPane](https://docs.oracle.com/javase/8/docs/api/javax/swing/JSplitPane.html) 的功能。