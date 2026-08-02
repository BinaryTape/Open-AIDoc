[//]: # (title: 向 KMP 模块添加 Swift 软件包作为依赖项)
<primary-label ref="alpha"/>

<tldr>
   <p>Swift 软件包管理器 (SwiftPM) 扮演着与 CocoaPods 相同的角色：它可以让您透明地协调 iOS 应用的原生 iOS 依赖项。</p>
   <p>在这里，您可以学习如何在 KMP 项目中设置 SwiftPM 依赖项，以及在必要时如何将 KMP 配置从 CocoaPods 迁移到 SwiftPM。</p>
</tldr>

> 此功能目前处于 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 阶段。
> 请在专门的 Kotlin Slack 频道中分享您遇到的任何问题或反馈：[#kmp-swift-package-manager](https://kotlinlang.slack.com/archives/C09TW68099C)
>
{style="note"}

带有 SwiftPM 导入集成的 Kotlin Gradle 插件允许您使用为 Apple 目标声明的 SwiftPM 依赖项，从 Objective-C 和 Swift 代码中导入 Objective-C API。

对于传递依赖项（依赖于那些使用 SwiftPM 导入的项目的项目），Kotlin Gradle 插件会自动从 SwiftPM 依赖项中提供必要的机器码。例如，在运行 Kotlin/Native 测试或链接框架时，您不需要进行任何额外配置。

> 目前尚不支持将使用 SwiftPM 导入的 KMP 模块本身作为 Swift 软件包[导出](multiplatform-spm-export.md)，且可能无法正常工作。
> 有关更多详细信息，请参阅此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-84420)，并让我们了解您的用例。
>
{style="note"}

要配置您的项目：

1. [设置您的开发环境](#set-the-kotlin-multiplatform-gradle-plugin-version)
2. [向您的 KMP 模块添加并使用 SwiftPM 依赖项](#add-and-use-swiftpm-dependencies)

## 设置 Kotlin 多平台 Gradle 插件版本

要试用 SwiftPM 导入功能，请确保您使用的是 Kotlin 多平台 Gradle 插件的 **%kotlinEapVersion%** 版本。
`gradle/libs.versions.toml` 文件的示例：

```toml
[versions]
kotlin = "%kotlinEapVersion%"

[plugins]
kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
```

## 添加并使用 SwiftPM 依赖项

> 有关运行示例，请参阅我们的示例项目。
> 在 `master` 分支上，每个项目都使用 CocoaPods 构建，而 `spm_import` 分支则使用 SwiftPM：
> 
> * [SwiftUI 和 Firebase 示例应用](https://github.com/Kotlin/kmp-with-cocoapods-firebase-sample/tree/spm_import)
> * [Compose Multiplatform iOS 示例应用](https://github.com/Kotlin/kmp-with-cocoapods-compose-sample/tree/spm_import)
>
{type="tip"}

### 配置构建

可以在声明 Apple 目标的 `build.gradle.kts` 文件的 `swiftPMDependencies {}` 块中添加特定的 SwiftPM 依赖项。
例如，对于 Firebase：

```kotlin
kotlin {
    iosArm64()
    iosSimulatorArm64()

    swiftPMDependencies {
        // 将 FirebaseAnalytics 导入您的 Kotlin 代码
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.5.0"),
            products = listOf(product("FirebaseAnalytics")),
        )
        // swift-protobuf 是 Firebase 的传递依赖项，
        // 只有在您想使用特定版本时
        // 才需要包含它
        swiftPackage(
            url = url("https://github.com/apple/swift-protobuf.git"),
            version = exact("1.32.0"),
            products = listOf(),
        )
    }
}
```

SwiftPM 集成基于导入 Clang 模块。
默认情况下，导入机制会自动发现指定 Swift 软件包中的 Clang 模块，并使所有可用模块对 Kotlin 代码可见——这类似于 API 可见性在 Swift 和 Objective-C 中的工作方式。
<!-- TODO link to where it is explained? -->

要禁用默认行为和自动模块发现，请将 `discoverClangModulesImplicitly` 设置为 `false`。
当禁用模块发现时，SwiftPM 导入将使用产品名称作为 Clang 模块名称。

要导入名称与产品名称不同的 Clang 模块，请使用 `importedClangModules` 参数，例如：

```kotlin
kotlin {
    swiftPMDependencies {
        // 如果 'discoverClangModulesImplicitly' 设置为 'true'，
        // 下面的 'importedClangModules' 参数将被忽略
        discoverClangModulesImplicitly = false

        // 导入的软件包、它们的产品和 Clang 模块
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.5.0"),
            products = listOf(
                product("FirebaseAnalytics"),
                product("FirebaseFirestore")
            ),
            importedClangModules = listOf(
                "FirebaseAnalytics", 
                // FirebaseFirestore 的 Objective-C API 位于
                // 'FirebaseFirestoreInternal' Clang 模块中
                "FirebaseFirestoreInternal"
            ),
        )
    }
}
```

### 设置平台约束

某些 SwiftPM 依赖项可能无法在构建脚本中的所有目标上编译或提供有效的 API。
例如，Google Maps SDK 目前仅支持 iOS 目标。

如果您的项目仅针对 iOS，则不需要显式声明平台。
但是，一旦您添加了另一个目标（例如 macOS），您就需要为每个依赖项指定平台约束。

为了确保依赖项仅应用于相关的编译，请在 `product` 规范的 `platforms` 参数中指定正确的目标：

```kotlin
kotlin {
    iosArm64()
    iosSimulatorArm64()
    macosArm64()

    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/googlemaps/ios-maps-sdk.git"),
            version = exact("10.3.0"),
            products = listOf(
                product(
                    "GoogleMaps", 
                    platforms = setOf(
                        // `GoogleMaps` 软件包将仅对
                        // iOS 编译可见
                        iOS()
                    )
                )
            )
        ) 
    }
}
```

### 运行 SwiftPM 集成任务

SwiftPM 导入工具会生成一个中间软件包，以跟踪当前的 SwiftPM 依赖项列表。
当您第一次向项目添加 SwiftPM 依赖项时，需要将 Xcode 项目与生成的软件包链接。

为此，请在项目目录中使用以下命令运行特定的 Gradle 任务：

```shell
XCODEPROJ_PATH='/path/to/project/iosApp/iosApp.xcodeproj' ./gradlew :kotlin-library:integrateLinkagePackage
```

该命令将生成 SwiftPM 软件包并在 Xcode 项目中执行必要的更改。
请务必将生成的软件包以及更新后的 Xcode 项目提交到您的仓库。

在初始集成之后，每当您更改 SwiftPM 依赖项集或其版本时，合成软件包都将自动更新。

### 使用导入的 API

导入的 Objective-C API 包含在以 `swiftPMImport` 前缀开头，并以项目及其组的 Gradle 名称结尾的命名空间中。

例如，Kotlin 构建脚本如下指定组名：

```kotlin
// subproject/build.gradle.kts
group = "groupName"
```

在这里，`groupName` 是项目的 Gradle 组名，`subproject` 是项目名称。
现在，您可以在该模块的 `iosMain` 源集中导入 Firebase API，例如：

```kotlin
// subproject/src/iosMain/kotlin/useFirebaseAnalytics.kt
import swiftPMImport.groupName.subproject.FIRAnalytics
import swiftPMImport.groupName.subproject.FIRApp
```

## 生成的 `Package.resolved` 文件

为了使依赖于 Swift 软件包的构建更加稳定，SwiftPM 导入工具引入了一种使用 `Package.resolved` 文件的锁定机制。这些文件会在初始软件包解析期间为每个子项目生成。

默认情况下，这些文件会合并到一个 `Package.resolved` 文件中，该文件位于 `.swiftpm-locks/default/swiftImport` 目录下的合成软件包内。
然后使用此共享锁定文件来构建项目，以确保所有子项目都使用相同版本的 Swift 软件包。
您可以通过[对子项目进行分组或将其从同步中排除](#customize-aggregation-of-swift-package-versions)来自定义锁定文件合并行为。

您应该将锁定文件提交到您的仓库，以确保所有构建都使用相同的依赖项。
为了简化文件管理，您可以将整个 `.swiftpm-locks` 目录提交到您的仓库。
虽然只有 `Package.resolved` 文件对依赖项同步至关重要，但保留整个目录可以加快第一次构建期间的解析速度。

当您在构建脚本中更改 SwiftPM 依赖项集或版本时，锁定文件会自动更新。
您也可以[手动强制更新锁定文件](#force-an-update-of-the-lock-file)。

### 自定义 Swift 软件包版本的聚合

除了对所有子项目使用 `default` 组之外，您还可以定义自定义组，以便为每个组生成单独的 `Package.resolved` 锁定文件。

合并行为由 `swiftDependencies {}` 块中的 `packageResolvedSynchronization` 选项控制：

```kotlin
kotlin {
    swiftDependencies {
        // 当未为 `packageResolvedSynchronization` 设置值时，
        // 子项目将被分配一个默认组标识符，
        // 就像这样设置一样：
        // packageResolvedSynchronization = identifier("default")
    }
}
```

To customize the merge behavior, assign a non-default group identifier to each subproject.
在以下示例中，子项目 `one` 和 `two` 使用相同的 `custom` 软件包版本集，而子项目 `three` 使用默认集合：

<Tabs>
<TabItem title="子项目 &quot;one&quot;">

```kotlin
// one/build.gradle.kts

kotlin {
    swiftDependencies {
        packageResolvedSynchronization = identifier("custom"),
        ...
    }
}
```
</TabItem>

<TabItem title="子项目 &quot;two&quot;">

```kotlin
// two/build.gradle.kts

kotlin {
    swiftDependencies {
        packageResolvedSynchronization = identifier("custom"),
        ...
    }
}
```

</TabItem>

<TabItem title="子项目 &quot;three&quot;">

```kotlin
// three/build.gradle.kts

kotlin {
    swiftDependencies {
        // 使用默认标识符，就像设置了以下内容一样：
        // packageResolvedSynchronization = identifier("default")
        ...
    }
}
```

</TabItem>

</Tabs>

如果您想完全禁用某个子项目的同步机制，请使用 `noSynchronization()` 调用而不是 `identifier()`：

```kotlin
kotlin {
    swiftDependencies { 
        // 此子项目的 Package.resolved 文件
        // 不会与任何其他文件合并
        packageResolvedSynchronization = noSynchronization()
    }
}
```

禁用同步的子项目将拥有自己的 `Package.resolved` 锁定文件，该文件位于子项目目录中 `build.gradle.kts` 文件的旁边。

与默认同步一样，自定义子项目的所有 `Package.resolved` 文件都应提交到您的仓库。

### 强制更新锁定文件

如果您想手动强制更新锁定文件：

1. 删除每个需要更新锁定文件的子项目的 `build` 目录。
2. 移除现有的 `Package.resolved` 文件：
   * 对于没有特定同步配置的子项目，删除 `.swiftpm-locks/default/` 目录。
   * 对于具有[自定义同步组](#customize-aggregation-of-swift-package-versions)的子项目，找到并删除 `.swiftpm-locks/<group-name>/` 目录。
   * 对于设置了 `noSynchronization()` 的子项目，找到并删除子项目目录中的 `Package.resolved` 文件。
3. 再次运行依赖项解析任务：`./gradlew :yourModuleName:fetchSyntheticImportProjectPackages`。

## 其他导入选项

### 导入本地 Swift 软件包

SwiftPM 导入机制还允许从本地文件系统导入 Swift 软件包。

让我们考虑一个具有以下清单的 Swift 软件包，它位于 `/path/to/ExamplePackage` 目录中：

```swift
// /path/to/ExamplePackage/Package.swift
let package = Package(
  name: "ExamplePackage",
  platforms: [.iOS("15.0")],
  products: [
    .library(name: "ExamplePackage", targets: ["ExamplePackage"]),
  ],
  dependencies: [
    .package(url: "https://github.com/grpc/grpc-swift.git", exact: "1.27.0",),
  ],
  targets: [
    // 此目标可以用带 @objc API 的 Swift 实现，也可以用 Objective-C 实现
    .target(name: "ExamplePackage", dependencies: [.product(name: "GRPC", package: "grpc-swift")]),
  ]
)
```
{collapsible="true" collapsed-title-line-number="3"}

要在您的 Kotlin 构建脚本中导入它，请使用 `localSwiftPackage` API：

```kotlin
// <projectDir>/shared/build.gradle.kts
kotlin {
    swiftPMDependencies {
        localSwiftPackage(
            directory = project.layout.projectDirectory.dir("/path/to/ExamplePackage/"),
            products = listOf("ExamplePackage")
        )
    }
}
```

同步 Gradle 文件以执行 SwiftPM 导入，然后在您的 Kotlin 代码中使用导入的 API：

```kotlin
// /path/to/shared/src/appleMain/kotlin/useExamplePackage.kt

@OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
fun useExamplePackage() {
    // 如果 Swift 软件包成功导入，
    // IDE 会为该类建议正确的导入
    HelloFromExamplePackage().hello()
}
```

### 特定部署版本

如果您的依赖项需要更高的[部署版本](https://developer.apple.com/documentation/packagedescription/supportedplatform)，请在 `*MinimumDeploymentTarget` 参数中指定它。例如，对于 iOS：

```kotlin
kotlin {
    swiftPMDependencies {
        iosMinimumDeploymentTarget.set("16.0")
    }
}
```

### Swift 软件包的位置和版本

与 `Package.swift` 清单文件类似，您可以在 `swiftPackage()` 调用中指定 Swift 软件包的位置和版本。两者都有几个互斥的选项。 

要设置位置，您可以使用 URL 或 [SwiftPM 注册表 ID](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/usingswiftpackageregistry)：

```kotlin
swiftPackage(
    // 选项 1，URL 字符串
    // 指向软件包的 Git 仓库
    url = url("https://github.com/firebase/firebase-ios-sdk.git")

    // 选项 2，Swift 软件包注册表 ID
    // 请参阅上面链接的有关使用软件包注册表的 Apple 文档
    repository = id("...")
)
```

要指定版本，请使用以下 Gradle 风格和 Git 风格的版本规范：

```kotlin
swiftPackage(
    // 类似于 Gradle 的 'require' 版本约束，
    // 从指定版本开始
    version = from("1.0")

    // 类似于 Gradle 的 'strict' 版本约束，
    // 与指定版本完全匹配
    version = exact("2.0")

    // Git 特定的版本规范，
    // 匹配指定的分支或修订
    version = branch("master")
    // 或者
    version = revision("e74b07278b926c9ec6f9643455ea00d1ce04a021")
)
```

## 动态 Kotlin/Native 框架的已知限制

目前，SwiftPM 导入集成并不支持生成动态 Kotlin/Native 框架时可能出现的所有边缘情况。您可能会在 Xcode 构建期间遇到问题，或者在运行时看到警告，例如：

* `Undefined symbols for architecture ...: "...", referenced from: ld: symbol(s) not found ...`
* `dyld: Symbol not found: ...`
* `objc[...]: Class _Foo is implemented in both /path/to/Shared and /path/to/Bar. This may cause spurious casting failures and mysterious crashes. One of the duplicates must be removed or renamed.`

这些问题的一般解决方法是通过将 `isStatic` 属性设置为 `true` 来更改框架的链接模式：

```kotlin
// shared/build.gradle.kts
kotlin {
    listOf(
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "Shared"

            // 将此属性设置为 "true"
            isStatic = true
        }
    }
}
```

如果您遇到了这些问题中的任何一个，需要保持 `isStatic=false`，或者更改此属性无助于解决构建失败，请在我们的 Slack 频道中告知我们。获取[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#kmp-swift-package-manager](https://kotlinlang.slack.com/archives/C09TW68099C)。

## 下一步？

详细了解[在 KMP 项目中从 CocoaPods 切换到 SwiftPM 依赖项](multiplatform-cocoapods-spm-migration.md)。