[//]: # (title: 将 Kotlin Multiplatform 项目从 CocoaPods 切换到 SwiftPM 依赖项)
<primary-label ref="Experimental"/>

<tldr>

* 要从 CocoaPods Gradle 插件切换到 SwiftPM，你首先需要重新配置你的 Xcode 项目。
* 查看这些示例项目，它们在 `main` 分支中使用 CocoaPods，在 `spm-import` 分支中使用 SwiftPM：
  * [Firebase 示例](https://github.com/Kotlin/kmp-with-cocoapods-multitarget-xcode-sample)
  * [Compose Multiplatform 示例](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/)

</tldr>

如果你有一个包含 CocoaPods 依赖项的 KMP 模块，并希望使用 [SwiftPM 导入](multiplatform-spm-import.md)切换到 Swift 软件包，请按照以下步骤操作：

1. [更新你的构建脚本以包含 SwiftPM 依赖项及相应的配置](#update-your-build-script)
2. [借助 SwiftPM 导入工具的帮助重新配置你的 Xcode 项目以使用直接集成](#reconfigure-your-xcode-project)
3. [根据你的项目结构，完全或部分禁用 CocoaPods 集成](#remove-the-cocoapods-kmp-integration)

> 你可以使用我们[准备好的技能](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)将 CocoaPods 到 SwiftPM 的迁移工作交给选定的 AI 代理 (agent)。
> 请记住，AI 处理结果并不完全可预测。
>
{style="note"}

## 更新你的构建脚本

要更新你的构建，请按照 SwiftPM 导入页面上的说明进行操作：

1. [将 Kotlin Multiplatform Gradle 插件版本更改为 **%kotlinEapVersion%**](multiplatform-spm-import.md#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [在不禁用 CocoaPods 插件或移除 CocoaPods 依赖项的情况下，指定必要的 SwiftPM 依赖项](multiplatform-spm-import.md#add-and-use-swiftpm-dependencies)

例如，如果你正在使用 `FirebaseAnalytics` pod：

1. 确保你已设置 Kotlin Multiplatform Gradle 插件以使用版本 **%kotlinEapVersion%**。 
2. 将 `FirebaseAnalytics` Swift 软件包添加到 `swiftPMDependencies {}` 块中：

   ```kotlin
   // projectDir/sharedLogic/build.gradle.kts
   kotlin {
       swiftPMDependencies {
          swiftPackage(
              url = url("https://github.com/firebase/firebase-ios-sdk.git"),
              version = from("12.5.0"),
              products = listOf(product("FirebaseAnalytics")),
          )
       }

       cocoapods {
           // ...

           pod("FirebaseAnalytics") {
           version = "12.5.0"
           // ...
           }
       }
   }
   ```

3. 运行 **Sync Project with Gradle Files**（使用 Gradle 文件同步项目）操作以从 Swift 软件包导入 API。
4. 更新你的代码以使用从 Swift 软件包导入的 API。
   如果 pod 和相应的 Swift 软件包提供完全相同的 API，你只需要更新 Kotlin 导入指令，例如：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            import cocoapods.FirebaseAnalytics.FIRAnalytics"></code-block>
        <code-block lang="kotlin" code="            import swiftPMImport.org.example.package.FIRAnalytics"></code-block>
    </compare>

5. 如果你在构建脚本中使用了 `cocoapods.framework {}` 块，
   请将该配置移至 `binaries.framework {}` 块，例如：

   <compare type="left-right">
   <code-block lang="kotlin" code="   kotlin {&#10;       iosArm64()&#10;       iosSimulatorArm64()&#10;       iosX64()&#10;&#10;       cocoapods {&#10;           framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   <code-block lang="kotlin" code="   kotlin {&#10;       listOf(&#10;           iosArm64(),&#10;           iosSimulatorArm64(),&#10;           iosX64(),&#10;       ).forEach { iosTarget -&gt;&#10;           iosTarget.binaries.framework {&#10;               baseName = &quot;Shared&quot;&#10;               isStatic = true&#10;           }&#10;       }&#10;   }"></code-block>
   </compare>

## 重新配置你的 Xcode 项目

如果你正在使用 CocoaPods Gradle 插件 (`kotlin("native.cocoapods")`)，
在切换到 SwiftPM 之前，你需要重新配置你的 Xcode 项目以使用[直接集成](multiplatform-direct-integration.md)。
SwiftPM 导入工具可以生成 shell 命令，以对你的 `.xcodeproj` 文件进行必要的更改。

1. 在 Xcode 中打开项目（在 IntelliJ IDEA 中，选择 **File** | **Open Project in Xcode**）。
2. 在 Xcode 中构建项目 (**Product** | **Build**)。构建应该会失败，但构建错误中包含必要的命令。
3. 要在 Xcode 中查看构建错误，请选择 **View** | **Navigators** | **Report**，然后在顶部的筛选器中选择 **Errors Only**。
   该命令如下所示，并包含指向你项目的正确路径：

   ```text
   XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' GRADLE_PROJECT_PATH=':kotlin-library' '/path/to/project/gradlew' -p '/path/to/project' ':kotlin-library:integrateEmbedAndSign' ':kotlin-library:integrateLinkagePackage'
   ```

   > 你也可以不打开 Xcode，直接通过从终端构建项目来生成相同的命令。
   > 在 `/path/to/project/iosApp` 目录中运行以下命令：
   > 
   > ```shell
   > xcodebuild -scheme "$(echo -n *.xcworkspace | python3 -c 'import sys, json; from subprocess import check_output; print(list(set(json.loads(check_output(["xcodebuild", "-workspace", sys.stdin.readline(), "-list", "-json"]))["workspace"]["schemes"]) - set(json.loads(check_output(["xcodebuild", "-project", "Pods/Pods.xcodeproj", "-list", "-json"]))["project"]["schemes"]))[0])')" -workspace *.xcworkspace -destination 'generic/platform=iOS Simulator' ARCHS=arm64 | grep -A5 'What went wrong'
   > ```
   {style="note"}

    末尾的 `grep` 调用会找到特定的错误消息以及你需要运行的命令。

4. 在 `/path/to/project/iosApp` 目录中，在终端里运行生成的命令。
   它会修改 `iosApp` 项目c的 `.xcodeproj` 文件，以便在构建期间触发 `embedAndSignAppleFrameworkForXcode` 任务，
   这会将 Kotlin Multiplatform 编译阶段插入到你的 iOS 构建中。
5. 在 IntelliJ IDEA 中，选择 **Tools** | **Swift Package Manager** | **Resolve Dependencies** 以解析你在 `build.gradle.kts` 文件中声明的 SwiftPM 依赖项。

现在 iOS 应用已使用 SwiftPM 依赖项。你可以禁用 CocoaPods 插件并反集成 (deintegrate) 该 pod。

## 移除 CocoaPods KMP 集成

如果你已经用 Swift 软件包替换了所有 CocoaPods 依赖项，现在可以通过在 `/path/to/project/iosApp` 目录中运行以下命令来反集成该 pod：

```shell
pod deintegrate
```

如果你想继续将 CocoaPods 用于与 SwiftPM 依赖项不交叉的依赖项，
请编辑你的 `Podfile` 以仅删除提及 KMP 模块的那一行，然后运行 `pod install`。例如：

```shell
target 'iosApp' do
    # 这里 'sharedLogic' 是共享代码模块的名称。
    # 删除这一行并再次运行 'pod install'。
    pod 'sharedLogic', :path => '../sharedLogic'
    ...
end
```

最后，从你的 Gradle 构建配置中移除对 CocoaPods 的提及：

1. 从共享代码模块的 `build.gradle.kts` 文件中删除整个 `cocoapods {}` 块，
   因为现在所有依赖项都由 SwiftPM 导入工具管理。
2. 如果你的项目不再依赖 CocoaPods，请从根目录的 `build.gradle.kts` 文件和共享模块的 `build.gradle.kts` 文件的 `plugins {}` 块中删除对 CocoaPods Gradle 插件的引用。