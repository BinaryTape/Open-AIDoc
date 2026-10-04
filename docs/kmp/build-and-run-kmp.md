[//]: # (title: 构建并运行 Kotlin Multiplatform 应用程序)

Kotlin Multiplatform (KMP) 使用 Gradle 作为其构建系统。
适用于 IntelliJ IDEA 和 Android Studio 的 [KMP IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)
提供了进一步的支持，能够自动创建定制的运行配置、处理 Compose Hot Reload 集成等。

## 构建并运行 KMP 应用程序 {id="build-and-run-kmp-applications"}

要构建您的 KMP 应用，只需 Gradle 和 Java。
然而，IntelliJ IDEA 和 Android Studio 为 KMP 开发提供了许多便利性功能，
涵盖从管理环境到编写构建脚本以及多平台代码的方方面面。

您可以使用同一个 IDE 在任何受支持的平台上运行应用程序：

* Android 应用运行在可用的 Android 虚拟设备（Android Virtual Devices）上。
* iOS 应用运行在 Device Hub 中可用的 iOS 模拟器上
  （您需要一台装有 Xcode 的 macOS 计算机才能在 Apple 目标平台上运行应用）。
* 桌面应用运行在系统 JVM 上。
* Web 应用在默认浏览器中运行。

KMP IDE 插件提供的运行配置比通用的 Gradle 构建任务更高效：
它们仅触发相应目标的构建，而默认的 Gradle 构建任务始终会构建所有目标的调试版（Debug）和发布版（Release）。

### 在 Android 模拟器上运行应用程序 {id="run-your-application-on-android-emulator"}

默认运行配置会自动建议可用 Android 虚拟设备的列表。
如果没有可用设备，或者您想模拟其他设备，可以使用 Android 设备管理器进行配置
（在 IntelliJ IDEA 中，选择 **View | Tool Windows | Device Manager**，
或参考 [Android Studio 指南](https://developer.android.com/studio/run/managing-avds)）。

> Android Studio 中的设备管理器通常提供更广泛的可用设备集，
> 但创建设备后，该设备在系统范围均可用——包括 IntelliJ IDEA 中的运行配置。
>
{style="tip"}

设备创建完成后，便会立即在运行配置中可用。

1. 在运行配置列表中，选择 **androidApp**。
2. 选择您的 Android 虚拟设备，然后点击 **Run**：

![在 Android 上运行 Compose Multiplatform 应用](compose-run-android.png){width=352}

IDE 会运行该应用；如果所选虚拟设备处于关机状态，则会自动启动它。

### 在真实 Android 设备上运行 {id="run-on-a-real-android-device"}

要使硬件 Android 设备在 KMP 运行配置中可用，请[对其进行配置并连接到您的计算机](https://developer.android.com/studio/run/device)。

配置正确后，它将与虚拟设备一起显示在可用设备列表中。

### 在 iOS 模拟器上运行应用程序 {id="run-your-application-on-ios-simulator"}

如果尚未在初始设置过程中启动过 Xcode，请在运行 iOS 应用之前启动它。
安装 iOS 平台支持：
在 Xcode 中，检查 **Xcode | Settings | Components**，确保至少安装了一个 iOS 模拟器。

在 Kotlin Multiplatform IDE 中，在运行配置列表中选择 iOS 条目，
并从旁边的列表中选择模拟设备，
然后点击 **Run**：

![在 iOS 上运行 Compose Multiplatform 应用](compose-run-ios.png){width=405}

#### 在真实 iOS 设备上运行 {initial-collapse-state="collapsed" collapsible="true" id="run-on-a-real-ios-device"}

您可以在真实 iOS 设备上运行多平台应用程序。在开始之前，
您需要设置与您的 [Apple ID](https://support.apple.com/en-us/HT204316) 关联的 Team ID。

##### 设置 Team ID {id="set-your-team-id"}

若要首次为项目设置新的 Team ID，请在 Xcode 中打开项目
（**File | Open Project in Xcode**）：

1. 在左侧的 Project 导航器中，选择 **iosApp**。
2. 在 **Targets** 下选择 **iosApp**，并切换到 **Signing & Capabilities** 选项卡。
3. 在 **Team** 列表中，选择您的团队。

   如果您尚未设置团队，请使用 **Team** 列表中的 **Add an Account** 选项并按照 Xcode 中的说明操作。

4. 确保 Bundle Identifier 唯一，并且已成功分配 Signing Certificate（签名证书）。

在 Xcode 中设置团队后，即可在 IntelliJ IDEA 中设置或更改团队：

1. 编辑 **iosApp** 的运行配置：

   ![编辑 iOS 运行配置](ios-edit-configurations.png){width=450}

2. 切换到 **Options** 选项卡，并在 **Development team** 下拉菜单中进行必要的更改，然后点击 **OK**。

##### 运行应用 {id="run-the-app"}

使用线缆连接 iPhone。如果您已在 Xcode 中注册该设备，IntelliJ IDEA 应会在运行配置列表中显示它。运行对应的 `iosApp` 配置。

如果您尚未在 Xcode 中注册 iPhone，请遵循 [Apple 的建议](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/)。
简而言之，您应当：

1. 使用线缆连接 iPhone。
2. 在 iPhone 上，前往 **Settings** | **Privacy & Security** 启用开发者模式。
3. 在 Xcode 中，转到顶部菜单并选择 **Window** | **Devices and Simulators**。
4. 如果未显示 iPhone 已连接，请点击左下角的加号并选择该设备。
5. 按照屏幕上的说明完成配对流程。

在 Xcode 中注册 iPhone 后，当您选择 **iosApp** 运行配置时，它就会出现在 IntelliJ IDEA 的可用设备列表中。

### 在桌面上运行应用程序 {id="run-your-application-on-desktop"}

在运行配置列表中选择 **desktopApp [hot] 🔥** 并点击 **Run**：

![在桌面上运行 Compose Multiplatform 应用](compose-run-desktop.png){width=350}

默认情况下，应用在启动时会同时运行 [Compose Hot Reload](compose-hot-reload.md)。
这使得在手动保存包含更改的文件时，几乎能即时重新加载 UI。

### 运行 Web 应用程序 {id="run-your-web-application"}

Web 目标的默认选项包括：

* **webApp[js]**：运行 Kotlin/JS 应用程序。
* **webApp[wasmJs]**：运行 Kotlin/Wasm 应用程序。

Web 应用程序会在默认浏览器中自动打开，
并且默认可通过 [http://localhost:8080/](http://localhost:8080/) 访问。

> 如果端口 8080 不可用，构建将使用其他端口。
> 您可以在 Gradle 构建控制台中搜索 `Project is running at` 找到实际端口。
>
{style="note"}

![Compose Web 应用程序](first-compose-project-on-web.png){width=600}

#### Web 目标的兼容模式 {id="compatibility-mode-for-web-targets"}

您可以为 Web 应用程序启用兼容模式，以确保它能够开箱即用地在所有浏览器上运行。
在该模式下，现代浏览器将使用 Wasm 版本，而较旧的浏览器则回退到 JS 版本。
该模式通过针对 `js` 和 `wasmJs` 目标的交叉编译来实现。

要为 Web 应用程序启用兼容模式：

1. 通过选择 **View | Tool Windows | Gradle** 打开 Gradle 工具窗口。
2. 在 **ComposeDemo | Tasks | compose** 中，选择并运行 **composeCompatibilityBrowserDistribution** 任务。

   > Gradle JVM 至少需要 Java 11 才能成功加载任务；对于一般的 Compose Multiplatform 项目，我们建议至少使用 Java 17。
   >
   {style="note"}

   ![运行兼容性任务](web-compatibility-gradle-task.png){width=500}

   或者，您也可以在终端中从根项目目录运行以下命令：

    ```bash
    ./gradlew composeCompatibilityBrowserDistribution
    ```

Gradle 任务完成后，兼容的工件将生成在 Web 应用程序模块目录中，例如：
`webApp/build/dist/composeWebCompatibility/productionExecutable`。
您可以使用这些工件为 `js` 和 `wasmJs` 目标[发布应用程序](https://kotlinlang.org/docs/wasm-get-started.html#publish-the-application)。