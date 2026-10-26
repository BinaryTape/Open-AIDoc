[//]: # (title: 构建最终原生二进制文件)

默认情况下，Kotlin/Native 目标会被编译为 `*.klib` 库工件，该工件可被 Kotlin/Native 本身用作依赖项，但不能作为原生库执行或使用。

要声明最终原生二进制文件（例如可执行文件或共享库），请使用原生目标的 `binaries` 属性。该属性表示除默认的 `*.klib` 工件之外，为此目标构建的原生二进制文件集合，并提供了一组用于声明和配置它们的方法。

> `kotlin-multiplatform` 插件默认不会创建任何生产环境二进制文件。默认唯一可用的二进制文件是用于从 `test` 编译运行单元测试的调试测试可执行文件。
>
{style="note"}

Kotlin/Native 编译器生成的二进制文件可能包含第三方代码、数据或派生作品。这意味着如果您分发经 Kotlin/Native 编译的最终二进制文件，应始终在二进制分发包中包含必要的[许可证文件](https://kotlinlang.org/docs/native-binary-licenses.html)。

## 声明二进制文件 {id="declare-binaries"}

使用以下工厂方法来声明 `binaries` 集合中的元素。

| 工厂方法 | 二进制文件类型 | 适用于 |
|----------------|-----------------------|--------------------------------------------|
| `executable`   | 生产可执行文件 | 所有原生目标 |
| `test`         | 测试可执行文件 | 所有原生目标 |
| `sharedLib`    | 共享原生库 | 所有原生目标 |
| `staticLib`    | 静态原生库 | 所有原生目标 |
| `framework`    | Objective-C 框架 | 仅限 macOS、iOS、watchOS 和 tvOS 目标 |

最简版本不需要任何额外参数，会为每种构建类型创建一个二进制文件。目前支持两种构建类型：

* `DEBUG` – 生成未经优化的二进制文件，包含在使用[调试器工具](https://kotlinlang.org/docs/native-debugging.html)时非常有用的额外元数据
* `RELEASE` – 生成不包含调试信息的优化二进制文件

以下代码段将创建两个可执行二进制文件：debug 和 release：

```kotlin
kotlin {
    linuxX64 { // 改为定义你的目标。
        binaries {
            executable {
                // 二进制文件配置。
            }
        }
    }
}
```

如果不需要[额外配置](multiplatform-dsl-reference.md#native-targets)，可以省略 lambda 表达式：

```kotlin
binaries {
    executable()
}
```

你可以指定为哪些构建类型创建二进制文件。在以下示例中，仅创建 `debug` 可执行文件：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable(listOf(DEBUG)) {
        // 二进制文件配置。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable([DEBUG]) {
        // 二进制文件配置。
    }
}
```

</TabItem>
</Tabs>

你也可以声明具有自定义名称的二进制文件：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("foo", listOf(DEBUG)) {
        // 二进制文件配置。
    }

    // 可以省略构建类型列表
    //（在此情况下，将使用所有可用的构建类型）。
    executable("bar") {
        // 二进制文件配置。
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('foo', [DEBUG]) {
        // 二进制文件配置。
    }

    // 可以省略构建类型列表
    //（在此情况下，将使用所有可用的构建类型）。
    executable('bar') {
        // 二进制文件配置。
    }
}
```

</TabItem>
</Tabs>

第一个实参用于设置名称前缀，这也是二进制文件的默认名称。例如，在 Windows 上该代码会生成 `foo.exe` 和 `bar.exe` 文件。你还可以使用名称前缀在[构建脚本中访问二进制文件](#access-binaries)。

## 访问二进制文件 {id="access-binaries"}

你可以访问二进制文件以[对其进行配置](multiplatform-dsl-reference.md#native-targets)或获取其属性（例如输出文件的路径）。

你可以通过二进制文件的唯一名称来获取它。该名称基于名称前缀（如果已指定）、构建类型和二进制文件类型，遵循以下模式：`<可选名称前缀><构建类型><二进制文件类型>`，例如 `releaseFramework` 或 `testDebugExecutable`。

> 静态库和共享库分别带有 static 和 shared 后缀，例如 `fooDebugStatic` 或 `barReleaseShared`。
>
{style="note"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 如果不存在该二进制文件则失败。
binaries["fooDebugExecutable"]
binaries.getByName("fooDebugExecutable")

// 如果不存在该二进制文件则返回 null。
binaries.findByName("fooDebugExecutable")
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 如果不存在该二进制文件则失败。
binaries['fooDebugExecutable']
binaries.fooDebugExecutable
binaries.getByName('fooDebugExecutable')

// 如果不存在该二进制文件则返回 null。
binaries.findByName('fooDebugExecutable')
```

</TabItem>
</Tabs>

或者，你也可以使用类型化 getter 通过名称前缀和构建类型来访问二进制文件。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
// 如果不存在该二进制文件则失败。
binaries.getExecutable("foo", DEBUG)
binaries.getExecutable(DEBUG)          // 如果未设置名称前缀，则跳过第一个实参。
binaries.getExecutable("bar", "DEBUG") // 构建类型也可以使用字符串。

// 其他二进制文件类型也有类似的 getter：
// getFramework、getStaticLib 与 getSharedLib。

// 如果不存在该二进制文件则返回 null。
binaries.findExecutable("foo", DEBUG)

// 其他二进制文件类型也有类似的 getter：
// findFramework、findStaticLib 与 findSharedLib。
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
// 如果不存在该二进制文件则失败。
binaries.getExecutable('foo', DEBUG)
binaries.getExecutable(DEBUG)          // 如果未设置名称前缀，则跳过第一个实参。
binaries.getExecutable('bar', 'DEBUG') // 构建类型也可以使用字符串。

// 其他二进制文件类型也有类似的 getter：
// getFramework、getStaticLib 与 getSharedLib。

// 如果不存在该二进制文件则返回 null。
binaries.findExecutable('foo', DEBUG)

// 其他二进制文件类型也有类似的 getter：
// findFramework、findStaticLib 与 findSharedLib。
```

</TabItem>
</Tabs>

## 将依赖项导出到二进制文件 {id="export-dependencies-to-binaries"}

在构建 Objective-C 框架或原生库（共享库或静态库）时，你可能不仅需要打包当前项目的类，还需要打包其依赖项的类。请使用 `export` 方法指定要导出到二进制文件的依赖项。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 将被导出。
            api(project(":dependency"))
            api("org.example:exported-library:1.0")
            // 不会被导出。
            api("org.example:not-exported-library:1.0")
        }
    }
    macosArm64("macos").binaries {
        framework {
            export(project(":dependency"))
            export("org.example:exported-library:1.0")
        }
        sharedLib {
            // 可以将不同的依赖项集合导出到不同的二进制文件中。
            export(project(':dependency'))
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    //...
    sourceSets {
        macosMain.dependencies {
            // 将被导出。
            api project(':dependency')
            api 'org.example:exported-library:1.0'
            // 不会被导出。
            api 'org.example:not-exported-library:1.0'
        }
    }
    macosArm64("macos").binaries {
        framework {
            export project(':dependency')
            export 'org.example:exported-library:1.0'
        }
        sharedLib {
            // 可以将不同的依赖项集合导出到不同的二进制文件中。
            export project(':dependency')
        }
    }
}
```

</TabItem>
</Tabs>

例如，你在 Kotlin 中实现了多个模块，并希望从 Swift 中访问它们。在 Swift 应用程序中使用多个 Kotlin/Native 框架会受到限制，但你可以创建一个 umbrella 框架并将所有这些模块导出到其中。

> 只能导出相应源集的 [`api` 依赖项](https://kotlinlang.org/docs/gradle-configure-project.html#dependency-types)。
>
{style="note"}

导出依赖项时，会将其所有 API 包含在框架 API 中。编译器会将该依赖项中的代码添加到框架中，即使你只使用了其中的一小部分。这将对导出的依赖项（以及在某种程度上对其依赖项）禁用无效代码消除。

默认情况下，导出以非传递方式工作。这意味着如果你导出了依赖于库 `bar` 的库 `foo`，则只有 `foo` 的方法会被添加到输出框架中。

你可以使用 `transitiveExport` 选项更改此行为。如果设置为 `true`，则库 `bar` 的声明也会被导出。

> 不建议使用 `transitiveExport`：它会将导出依赖项的所有传递依赖项都添加到框架中。这可能会增加编译时间并增大二进制文件体积。
>
> 在大多数情况下，无需将所有这些依赖项都添加到框架 API 中。请仅对需要从 Swift 或 Objective-C 代码中直接访问的依赖项显式使用 `export`。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    framework {
        export(project(":dependency"))
        // 传递导出。
        transitiveExport = true
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
binaries {
    framework {
        export project(':dependency')
        // 传递导出。
        transitiveExport = true
    }
}
```

</TabItem>
</Tabs>

## 构建通用框架 {id="build-universal-frameworks"}

默认情况下，Kotlin/Native 生成的 Objective-C 框架仅支持单一平台。不过，你可以使用 [`lipo` 工具](https://llvm.org/docs/CommandGuide/llvm-lipo.html)将此类框架合并为单个通用（fat）二进制文件。此操作对于 32 位和 64 位 iOS 框架尤其有用。在这种情况下，你可以在 32 位和 64 位设备上使用生成的通用框架。

> fat 框架必须与初始框架具有相同的基本名称（base name）。否则将会报错。
>
{style="warning"}

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 创建并配置目标。
    val watchos32 = watchosArm32("watchos32")
    val watchos64 = watchosArm64("watchos64")
    configure(listOf(watchos32, watchos64)) {
        binaries.framework {
            baseName = "MyFramework"
        }
    }
    // 创建构建 fat 框架的任务。
    tasks.register<FatFrameworkTask>("debugFatFramework") {
        // fat 框架必须与初始框架具有相同的基本名称。
        baseName = "MyFramework"
        // 默认目标目录为 "<build directory>/fat-framework"。
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // 指定要合并的框架。
        from(
            watchos32.binaries.getFramework("DEBUG"),
            watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.FatFrameworkTask

kotlin {
    // 创建并配置目标。
    targets {
        watchosArm32("watchos32")
        watchosArm64("watchos64")
        configure([watchos32, watchos64]) {
            binaries.framework {
                baseName = "MyFramework"
            }
        }
    }
    // 创建构建 fat 框架的任务。
    tasks.register("debugFatFramework", FatFrameworkTask) {
        // fat 框架必须与初始框架具有相同的基本名称。
        baseName = "MyFramework"
        // 默认目标目录为 "<build directory>/fat-framework"。
        destinationDirProperty.set(layout.buildDirectory.dir("fat-framework/debug"))
        // 指定要合并的框架。
        from(
            targets.watchos32.binaries.getFramework("DEBUG"),
            targets.watchos64.binaries.getFramework("DEBUG")
        )
    }
}
```

</TabItem>
</Tabs>

## 构建 XCFramework {id="build-xcframeworks"}

所有 Kotlin Multiplatform 项目都可以使用 XCFramework 作为输出，将所有目标平台和架构的逻辑聚合到单个 bundle 中。与[通用 (fat) 框架](#build-universal-frameworks)不同，在将应用程序发布到 App Store 之前，你不需要移除所有不必要的架构。

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework

plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}

kotlin {
    val xcf = XCFramework()
    val iosTargets = listOf(iosArm64(), iosSimulatorArm64())
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = "shared"
            xcf.add(this)
        }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFrameworkConfig

plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}

kotlin {
    def xcf = new XCFrameworkConfig(project)
    def iosTargets = [iosArm64(), iosSimulatorArm64()]
    
    iosTargets.forEach {
        it.binaries.framework {
            baseName = 'shared'
            xcf.add(it)
        }
    }
}
```

</TabItem>
</Tabs>

当你声明 XCFramework 时，Kotlin Gradle 插件将注册几个 Gradle 任务：

* `assembleXCFramework`
* `assemble<Framework name>DebugXCFramework`
* `assemble<Framework name>ReleaseXCFramework`

<a id="build-frameworks"></a>

如果你在项目中使用了 [CocoaPods 集成](multiplatform-cocoapods-overview.md)，则可以使用 Kotlin CocoaPods Gradle 插件来构建 XCFramework。它包含以下任务，用于针对所有已注册目标构建 XCFramework 并生成 podspec 文件：

* `podPublishReleaseXCFramework`，生成 release XCFramework 以及 podspec 文件。
* `podPublishDebugXCFramework`，生成 debug XCFramework 以及 podspec 文件。
* `podPublishXCFramework`，生成 debug 和 release XCFramework 以及 podspec 文件。

这有助于你通过 CocoaPods 将项目中共享的部分与移动应用分开分发。你还可以使用 XCFramework 发布到私有或公共 podspec 仓库。

> 如果 Kotlin 框架是针对不同版本的 Kotlin 构建的，则不建议将其发布到公共仓库。这样做可能会导致最终用户的项目中出现冲突。
>
{style="warning"}

## 自定义 Info.plist 文件 {id="customize-the-info-plist-file"}

生成框架时，Kotlin/Native 编译器会生成信息属性列表文件 `Info.plist`。你可以通过相应的二进制文件选项自定义其属性：

| 属性 | 二进制文件选项 |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

要启用该功能，请传递 `-Xbinary=$option=$value` 编译器标志，或为特定框架设置 `binaryOption("option", "value")` Gradle DSL：

```kotlin
binaries {
    framework {
        binaryOption("bundleId", "com.example.app")
        binaryOption("bundleVersion", "2")
    }
}
```