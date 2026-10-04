[//]: # (title: 在本地 Swift 软件包中使用 Kotlin)

<tldr>
   这是一种本地集成方法。在以下情况下适用：<br/>

   * 拥有包含本地 SwiftPM 模块的 iOS 应用。
   * 已经在本地计算机上设置了面向 iOS 的 Kotlin Multiplatform 项目。
   * 现有的 iOS 项目采用静态链接类型。<br/>

   [选择最适合您的集成方法](multiplatform-ios-integration-overview.md)
</tldr>

在本教程中，您将学习如何使用 Swift 软件包管理器 (SwiftPM) 将 Kotlin Multiplatform 项目中的 Kotlin 框架集成到本地软件包中。

![直接集成图解](direct-integration-scheme.svg){width=700}

要设置该集成，您将在项目的构建设置中添加一个特殊脚本，该脚本使用 `embedAndSignAppleFrameworkForXcode` Gradle 任务作为预备操作 (pre-action)。为了让公共代码中所做的更改反映在 Xcode 项目中，您只需重新构建 Kotlin Multiplatform 项目即可。

与常规的直接集成方法（将脚本添加到构建阶段，并且需要重新构建 Kotlin Multiplatform 和 iOS 项目才能获取公共代码的更改）相比，通过这种方式，您可以轻松在本地 Swift 软件包中使用 Kotlin 代码。

> 如果您还不熟悉 Kotlin Multiplatform，请先了解如何[设置环境](quickstart.md)并[从头开始创建跨平台应用程序](compose-multiplatform-new-project.md)。
>
{style="tip"}

## 设置项目 {id="set-up-the-project"}

该功能从 Kotlin 2.0.0 开始提供。

> 要检查 Kotlin 版本，请导航至 Kotlin Multiplatform 项目根目录下的 `build.gradle(.kts)` 文件。您可以在文件顶部的 `plugins {}` 代码块中查看当前版本。
> 
> 或者，查看 `gradle/libs.versions.toml` 文件中的版本目录 (version catalog)。
> 
{style="tip"}

本教程假设您的项目在项目的构建阶段中使用了带有 `embedAndSignAppleFrameworkForXcode` 任务的[直接集成](multiplatform-direct-integration.md)方式。如果您是通过 CocoaPods 插件或带有 `binaryTarget` 的 Swift 软件包连接 Kotlin 框架，请先进行迁移。

### 从 SwiftPM binaryTarget 集成迁移 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-swiftpm-binarytarget-integration"}

要从包含 `binaryTarget` 的 SwiftPM 集成迁移：

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 或通过快捷键 <shortcut>Cmd + Shift + K</shortcut> 清理构建目录。
2. 在每个 `Package.swift` 文件中，移除对包含 Kotlin 框架的软件包的依赖项，以及对产物的目标依赖项。

### 从 CocoaPods 插件迁移 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-the-cocoapods-plugin"}

> 如果您在 `cocoapods {}` 代码块中对其他 Pod 存在依赖，则必须采用 CocoaPods 集成方式。目前，在多模块 SwiftPM 项目中无法同时依赖 Pod 和 Kotlin 框架。
>
{style="warning"}

要从 CocoaPods 插件迁移：

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 或快捷键 <shortcut>Cmd + Shift + K</shortcut> 清理构建目录。
2. 在包含 Podfile 的目录中，运行以下命令：

    ```none
   pod deintegrate
   ```

3. 从 `build.gradle(.kts)` 文件中移除 `cocoapods {}` 代码块。
4. 删除 `.podspec` 文件和 Podfile。

## 将框架连接到您的项目

> 目前不支持集成到 `swift build` 中。
>
{style="note"}

为了能够在本地 Swift 软件包中使用 Kotlin 代码，请将多平台项目生成的 Kotlin 框架连接到您的 Xcode 项目：

1. 在 Xcode 中，转到 **Product** | **Scheme** | **Edit scheme**，或点击顶部栏中的 scheme 图标并选择 **Edit scheme**：

   ![Edit scheme](xcode-edit-schemes.png){width=700}

2. 选择 **Build** | **Pre-actions** 项，然后点击 **+** | **New Run Script Action**：

   ![New run script action](xcode-new-run-script-action.png){width=700}

3. 调整以下脚本并将其添加为一个操作：

   ```bash
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode 
   ```

   * 在 `cd` 命令中，指定 Kotlin Multiplatform 项目根目录的路径，例如 `$SRCROOT/..`。
   * 在 `./gradlew` 命令中，指定共享模块的名称，例如 `:shared` 或 `:sharedLogic`。
  
4. 在 **Provide build settings from** 部分中选择您应用的目标 (target)：

   ![Filled run script action](xcode-filled-run-script-action.png){width=700}

5. 现在，您可以将共享模块导入本地 Swift 软件包并使用 Kotlin 代码。

   在 Xcode 中，导航至您的本地 Swift 软件包，并定义一个导入了该模块的函数，例如：

   ```Swift
   import Shared
   
   public func greetingsFromSpmLocalPackage() -> String {
       return Greeting.greet()
   }
   ```

   ![SwiftPM usage](xcode-spm-usage.png){width=700}

6. 在 iOS 项目的 `ContentView.swift` 文件中，您现在可以通过导入本地软件包来使用该函数：

   ```Swift
   import SwiftUI
   import SpmLocalPackage
   
   struct ContentView: View {
       var body: some View {
           Vstack {
               Image(systemName: "globe")
                   .imageScale(.large)
                   .foregroundStyle(.tint)
               Text(greetingsFromSpmLocalPackage())
           }
           .padding()
       }
   }
   
   #Preview {
       ContentView()
   }
   ```
   
7. 在 Xcode 中构建项目。如果一切配置正确，项目将成功构建。
   
还有几个因素值得考虑： 

* 如果您使用的是与默认的 `Debug` 或 `Release` 不同的自定义构建配置，请在 **Build Settings** 选项卡上的 **User-Defined** 下添加 `KOTLIN_FRAMEWORK_BUILD_TYPE` 设置，并将其设为 `Debug` 或 `Release`。
* 如果您遇到脚本沙盒错误，请通过双击项目名称打开 iOS 项目设置，然后在 **Build Settings** 选项卡上的 **Build Options** 下禁用 **User Script Sandboxing**。

## 后续步骤 {id="what-s-next"}

* [选择您的集成方法](multiplatform-ios-integration-overview.md)
* [了解如何设置 Swift 软件包导出](multiplatform-spm-export.md)