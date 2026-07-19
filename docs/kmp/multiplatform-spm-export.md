[//]: # (title: Swift 软件包导出设置)

<tldr>
   这是一种远程集成方法。它适用于以下情况：<br/>

   * 您希望将最终应用程序的代码库与通用代码库分开。
   * 您已经在本地机器上设置了一个针对 iOS 的 Kotlin Multiplatform 项目。
   * 您在 iOS 项目中使用 Swift 软件包管理器处理依赖项。<br/>

   [选择最适合您的集成方法](multiplatform-ios-integration-overview.md)
</tldr>

您可以将针对 Apple 目标的 Kotlin/Native 输出设置为供 Swift 软件包管理器 (SwiftPM) 依赖项使用。

假设有一个包含 iOS 目标的 Kotlin Multiplatform 项目。您可能希望让开发原生 Swift 项目的 iOS 开发者可以将此 iOS 二进制文件作为依赖项使用。利用 Kotlin Multiplatform 工具，您可以提供一个能够与他们的 Xcode 项目无缝集成的构件。

本教程展示了如何使用 Kotlin Gradle 插件构建 [XCFramework](multiplatform-build-native-binaries.md#build-xcframeworks) 来实现这一点。

## 设置远程集成

为了使您的框架可供使用，您需要上传两个文件：

* 包含 XCFramework 的 ZIP 归档。您需要将其上传到具有直接访问权限的便捷文件存储中（例如：创建一个附带归档文件的 GitHub release，使用 Amazon S3 或 Maven）。
  选择最易于集成到您的工作流中的选项。
* 描述软件包的 `Package.swift` 文件。您需要将其推送到一个单独的 Git 仓库。

#### 项目配置选项 {initial-collapse-state="collapsed" collapsible="true"}

在本教程中，您将 XCFramework 作为二进制文件存储在首选的文件存储中，并将 `Package.swift` 文件存储在单独的 Git 仓库中。

但是，您可以以不同的方式配置项目。请考虑以下组织 Git 仓库的选项：

* 将 `Package.swift` 文件和应打包到 XCFramework 中的代码存储在不同的 Git 仓库中。
  这允许独立于文件所描述的项目对 Swift 清单进行版本控制。这是推荐的方法：它允许扩展，并且通常更易于维护。
* 将 `Package.swift` 文件放在 Kotlin Multiplatform 代码旁边。这是一种更直接的方法，但请记住，在这种情况下，Swift 软件包和代码将使用相同的版本控制。SwiftPM 使用 Git 标签对软件包进行版本控制，这可能会与您项目中使用的标签冲突。
* 将 `Package.swift` 文件存储在使用者项目的仓库中。这有助于避免版本控制和维护问题。
  但是，这种方法可能会导致使用者项目的多仓库 SwiftPM 设置和进一步自动化出现问题：

  * 在多软件包项目中，只有一个使用者软件包可以依赖外部模块（以避免项目内的依赖项冲突）。因此，所有依赖于您的 Kotlin Multiplatform 模块的逻辑都应封装在一个特定的使用者软件包中。
  * 如果您使用自动化的 CI 流程发布 Kotlin Multiplatform 项目，则该流程需要包括将更新后的 `Package.swift` 文件发布到使用者仓库。这可能会导致使用者仓库的冲突更新，因此 CI 中的此类阶段可能难以维护。

### 配置您的多平台项目

在以下示例中，Kotlin Multiplatform 项目的共享代码存储在本地的 `shared` 模块中。
如果您的项目结构不同，请将代码和路径示例中的 "shared" 替换为您的模块名称。

要设置 XCFramework 的发布：

1. 使用 iOS 目标列表中的 `XCFramework` 调用来更新您的 `shared/build.gradle.kts` 配置文件：

   ```kotlin
   import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework
   
   kotlin {
       // 其他 Kotlin Multiplatform 目标
       // ...
       // 在使用者项目中导入的模块名称
       val xcframeworkName = "Shared"
       val xcf = XCFramework(xcframeworkName)
   
       listOf(
           iosArm64(),
           iosSimulatorArm64(),
       ).forEach { 
           it.binaries.framework {
               baseName = xcframeworkName
               
               // 指定 CFBundleIdentifier 以唯一标识框架
               binaryOption("bundleId", "org.example.${xcframeworkName}")
               xcf.add(this)
               isStatic = true
           }
       }
       //...
   }
   ```
   
2. 运行 Gradle 任务以创建框架：
   
   ```shell
   ./gradlew :shared:assembleSharedXCFramework
   ```
  
   生成的框架将在您的项目目录中创建为 `shared/build/XCFrameworks/release/Shared.xcframework` 文件夹。

   > 如果您的项目使用 SwiftPM 依赖项，从 Kotlin %kotlinEapVersion% 开始，
   > 该任务还会在 XCFramework 旁边生成一组与 SwiftPM 相关的文件。
   > 正如[下文](#准备-xcframework-和-swift-软件包清单)所述，
   > 您可以将生成的 `Package.swift` 随框架一起分发，而无需从头编写清单。
   >
   {style="note"} 

3. 如果您有多个想要导出的包含共享代码的模块（例如，一个共享逻辑模块和一个共享 UI 模块），
   请[将它们组合成一个新的模块](#将多个模块导出为-xcframework)并改为分发该伞形模块。

### 准备 XCFramework 和 Swift 软件包清单

1. 将 `Shared.xcframework` 文件夹压缩为 ZIP 文件，并计算生成的归档文件的校验和，例如：
   
   `swift package compute-checksum Shared.xcframework.zip`

2. 将 ZIP 文件上传到您选择的文件存储中。该文件应能通过直接链接访问。例如，以下是使用 GitHub 中的 release 实现此操作的方法：
   
   <deflist collapsible="true">
       <def title="上传到 GitHub release">
           <list type="decimal">
               <li>转到 <a href="https://github.com">GitHub</a> 并登录您的帐户。</li>
               <li>导航到要创建 release 的仓库。</li>
               <li>在右侧的 <b>Releases</b> 部分，点击 <b>Create a new release</b> 链接。</li>
               <li>填写 release 信息，添加或创建一个新标签，指定 release 标题并撰写描述。</li>
               <li>
                   <p>通过底部的 <b>Attach binaries by dropping them here or selecting them</b> 字段上传包含 XCFramework 的 ZIP 文件：</p>
                   <img src="github-release-description.png" alt="填写 release 信息" width="700"/>
               </li>
               <li>点击 <b>Publish release</b>。</li>
               <li>
                   <p>在 release 的 <b>Assets</b> 部分下，右键点击 ZIP 文件，并在浏览器中选择 <b>Copy link address</b> 或类似选项：</p>
                   <img src="github-release-link.png" alt="复制上传文件的链接" width="500"/>
               </li>
         </list>
       </def>
   </deflist>

3. [推荐] 检查链接是否有效以及文件是否可以下载。在终端中运行以下命令：

    ```none
    curl <指向已上传 XCFramework ZIP 文件的可下载链接>
    ```

4. 如果您的项目使用 SwiftPM 依赖项，从 Kotlin %kotlinEapVersion% 开始，
   `assembleSharedXCFramework` Gradle 任务会在 XCFramework 旁边生成一个 `Package.swift` 文件。

   如果情况并非如此，您可以手动创建一个 `Package.swift` 文件，使用以下模板：

   ```Swift
   // swift-tools-version:5.3
   import PackageDescription
    
   let package = Package(
      name: "Shared",
      platforms: [
        .iOS(.v14),
      ],
      products: [
         .library(name: "Shared", targets: ["Shared"])
      ],
      targets: [
         .binaryTarget(
            name: "Shared",
            url: "<指向已上传 XCFramework ZIP 文件的链接>",
            checksum:"<为该 ZIP 文件计算的校验和>")
      ]
   )
   ```
   
5. 指定缺失的字段：
   * 在 `url` 字段中，指定指向包含 XCFramework 的 ZIP 归档的链接。
   * 在 `checksum` 字段中，指定之前为该 ZIP 文件计算的校验和。

6. [推荐] 要验证生成的清单，您可以在包含 `Package.swift` 文件的目录中运行以下 shell 命令：

    ```shell
    swift package reset && swift package show-dependencies --format json
    ```
    
    输出将描述发现的任何错误，或者如果清单正确，则显示成功的下载和解析结果。

7. 将 `Package.swift` 文件推送到您的远程仓库。确保创建并推送一个包含软件包语义版本的 Git 标签。

### 添加软件包依赖项

现在这两个文件都已可以访问，您可以将对所创建软件包的依赖项添加到现有的客户端 iOS 项目中，或创建一个新项目。要添加软件包依赖项：

1. 在 Xcode 中，选择 **File | Add Package Dependencies**。
2. 在搜索字段中，输入包含 `Package.swift` 文件的 Git 仓库的 URL：

   ![指定包含软件包文件的仓库](multiplatform-spm-url.png)

3. 点击 **Add package** 按钮，然后为软件包选择产品和相应的目标。

   > 如果您正在制作 Swift 软件包，对话框会有所不同。在这种情况下，点击 **Copy package** 按钮。这会将一个 `.package` 行放入您的剪贴板。将此行粘贴到您自己的 `Package.swift` 文件的 [Package.Dependency](https://developer.apple.com/documentation/packagedescription/package/dependency) 块中，并将必要的产品添加到相应的 `Target.Dependency` 块中。
   >
   {style="tip"}

### 检查您的设置

要检查所有设置是否正确，请在 Xcode 中测试导入：

1. 在您的项目中，导航到您的 UI 视图文件，例如 `ContentView.swift`。
2. 将代码替换为以下片段：
   
    ```Swift
    import SwiftUI
    import Shared
    
    struct ContentView: View {
        var body: some View {
            VStack {
                Image(systemName: "globe")
                    .imageScale(.large)
                    .foregroundStyle(.tint)
                Text("Hello, world! \(Shared.Platform_iosKt.getPlatform().name)")
            }
            .padding()
        }
    }
    
    #Preview {
        ContentView()
    }
    ```
   
    在这里，您导入了 `Shared` XCFramework，然后使用它在 `Text` 字段中获取平台名称。

3. 确保预览已更新为新文本。

## 将多个模块导出为 XCFramework

要将来自多个 Kotlin Multiplatform 模块的代码作为 iOS 二进制文件提供，请将这些模块组合在一个伞形模块中。然后，构建并导出该伞形模块的 XCFramework。

例如，您有 `network` 和 `database` 模块，将它们组合在 `together` 模块中：

1. 在 `together/build.gradle.kts` 文件中，指定依赖项和框架配置：

    ```kotlin
    kotlin {
        val frameworkName = "together"
        val xcf = XCFramework(frameworkName)
    
        listOf(
            iosArm64(),
            iosSimulatorArm64()
        ).forEach { iosTarget ->
            // 与上述示例相同，
            // 增加了对依赖项的 export 调用
            iosTarget.binaries.framework {
                export(projects.network)
                export(projects.database)
    
                baseName = frameworkName
                xcf.add(this)
            }
        }
    
        // 依赖项设置为 "api"（而非 "implementation"）以导出底层模块
        sourceSets {
            commonMain.dependencies {
                api(projects.network)
                api(projects.database)
            }
        }
    }
    ```

2. 每个包含的模块都应配置其 iOS 目标，例如：

    ```kotlin
    kotlin {
        android {
            //...
        }
        
        iosArm64()
        iosSimulatorArm64()
        
        //...
    }
    ```

3. 在 `together` 文件夹内创建一个空的 Kotlin 文件，例如 `together/src/commonMain/kotlin/Together.kt`。这是一个变通方法，因为如果导出的模块不包含任何源代码，目前 Gradle 脚本无法组装框架。

4. 运行组装框架的 Gradle 任务：

    ```shell
    ./gradlew :together:assembleTogetherReleaseXCFramework
    ```

5. 按照[上一节](#准备-xcframework-和-swift-软件包清单)中的步骤准备 `together.xcframework`：将其归档、计算校验和、将归档后的 XCFramework 上传到文件存储、创建并推送 `Package.swift` 文件。

现在，您可以将依赖项导入 Xcode 项目。添加 `import together` 指令后，您应该可以在 Swift 代码中导入来自 `network` 和 `database` 模块的类。