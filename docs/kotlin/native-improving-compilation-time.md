[//]: # (title: 提高编译时间的技巧)

<show-structure depth="1"/>

Kotlin/Native 编译器不断接收改进其性能的更新。通过使用最新版本的 Kotlin/Native 编译器和正确配置的构建环境，您可以显著提高具有 Kotlin/Native 目标的项目的编译时间。

请阅读下文，了解我们关于如何加速 Kotlin/Native 编译过程的技巧。

## 一般建议 {id="general-recommendations"}

### 使用最新版本的 Kotlin {id="use-the-latest-version-of-kotlin"}

这样，您始终可以获得最新的性能改进。最新的 Kotlin 版本是 %kotlinVersion%。

### 避免创建巨型类 {id="avoid-creating-huge-classes"}

尽量避免创建在执行期间需要长时间编译和加载的巨型类。

### 在构建之间保留下载和缓存的组件 {id="preserve-downloaded-and-cached-components-between-builds"}

在编译项目时，Kotlin/Native 会下载所需的组件并将工作的部分结果缓存到 `$USER_HOME/.konan` 目录中。编译器会在后续编译中使用此目录，从而缩短完成编译所需的时间。

在容器（如 Docker）中或使用持续集成系统进行构建时，编译器可能必须为每次构建从头开始创建 `~/.konan` 目录。为了避免此步骤，请配置您的环境以在构建之间保留 `~/.konan`。例如，使用 `konan.data.dir` Gradle 属性重新定义其位置。

或者，您可以使用 `-Xkonan-data-dir` 编译器选项，通过 `cinterop` 和 `konanc` 工具配置该目录的自定义路径。

## Gradle 配置 {id="gradle-configuration"}

由于需要下载依赖项、构建缓存并执行额外步骤，使用 Gradle 进行的首次编译通常比后续编译耗时更长。您应该至少构建两次项目，以获得实际编译时间的准确读数。

以下是关于配置 Gradle 以获得更好编译性能的一些建议。

### 增加 Gradle 堆大小 {id="increase-gradle-heap-size"}

要增加 [Gradle 堆大小](https://docs.gradle.org/current/userguide/performance.html#adjust_the_daemons_heap_size)，请将 `org.gradle.jvmargs=-Xmx3g` 添加到您的 `gradle.properties` 文件中。

如果您使用 [并行构建](https://docs.gradle.org/current/userguide/performance.html#parallel_execution)，您可能需要使用 `org.gradle.workers.max` 属性或 `--max-workers` 命令行选项选择合适的工作线程数量。默认值为 CPU 处理器数。

### 仅构建必要的二进制文件 {id="build-only-necessary-binaries"}

除非确实需要，否则不要运行构建整个项目的 Gradle 任务，例如 `build` 或 `assemble`。这些任务会多次构建相同的代码，从而增加编译时间。在典型情况下（例如从 IntelliJ IDEA 运行测试或从 Xcode 启动应用），Kotlin 工具会避免执行不必要的任务。

如果您遇到非典型情况或构建配置，您可能需要自行选择任务：

* `linkDebug*`。要在开发过程中运行代码，您通常只需要一个二进制文件，因此运行相应的 `linkDebug*` 任务就足够了。
* `embedAndSignAppleFrameworkForXcode`。由于 iOS 模拟器和设备具有不同的处理器架构，将 Kotlin/Native 二进制文件作为通用 (fat) 框架分发是一种常见做法。

  然而，在本地开发期间，仅为您正在使用的平台构建 `.framework` 文件速度更快。要构建特定平台的框架，请使用 [embedAndSignAppleFrameworkForXcode](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html#connect-the-framework-to-your-project) 任务。

### 仅为必要的目标构建 {id="build-only-for-necessary-targets"}

与上述建议类似，不要一次性为所有原生平台构建二进制文件。例如，编译 [XCFramework](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks)（使用 `*XCFramework` 任务）会为所有目标构建相同的代码，这比为单个目标构建耗时成倍增加。

如果您确实需要在设置中使用 XCFramework，可以减少目标的数量。例如，如果您不在基于 Intel 的 Mac 上的 iOS 模拟器上运行此项目，则不需要 `iosX64`。

> 不同目标的二进制文件使用 `linkDebug*$Target` 和 `linkRelease*$Target` Gradle 任务构建。您可以在构建日志中查找已执行的任务，或者通过运行带有 `--scan` 选项的 Gradle 构建在 [Gradle build scan](https://docs.gradle.org/current/userguide/build_scans.html) 中查看。
>
{style="tip"}

### 不要构建不必要的 release 二进制文件 {id="don-t-build-unnecessary-release-binaries"}

Kotlin/Native 支持两种构建模式：[debug 和 release](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#declare-binaries)。Release 模式经过高度优化，这非常耗时：release 二进制文件的编译时间比 debug 二进制文件多出一个数量级。

除了实际发布外，在典型的开发周期中，所有这些优化可能都是不必要的。如果您在开发过程中使用了名称中包含 `Release` 的任务，请考虑将其替换为 `Debug`。同样，您可以运行 `assembleSharedDebugXCFramework`，而不是运行 `assembleXCFramework`。

> Release 二进制文件使用 `linkRelease*` Gradle 任务构建。您可以在构建日志中查找这些任务，或者通过运行带有 `--scan` 选项的 Gradle 构建在 [Gradle build scan](https://docs.gradle.org/current/userguide/build_scans.html) 中查看。
>
{style="tip"}

### 为 release 二进制文件启用缓存 {id="enable-caches-for-release-binaries"}
<primary-label ref="experimental-opt-in"/>

默认情况下，Kotlin/Native 在链接时优化 (LTO) 模式下编译 release 二进制文件：所有模块都会一起编译和优化。这使得 release 二进制文件在运行时的速度更快，但会显著增加编译时间。

如果您希望优先考虑更快的编译速度而非某些编译器优化，可以在 release 模式下启用缓存。要启用缓存，请将以下两个选项添加到您的 `gradle.properties` 文件中：

```properties
# 允许编译器在 release 模式下使用缓存
kotlin.native.binary.enableReleaseBinaryCache=true
# 使 Kotlin Gradle 插件使用 `-Xauto-cache-from` 及相关选项调用编译器
kotlin.internal.native.enableReleaseBinaryCache=true
```

> 该功能正在积极开发中，因此运行时性能仍有改进空间。性能改进计划在即将发布的 Kotlin 版本中推出。
> 
{style="warning"}

### 减小 release 二进制文件的大小 {id="reduce-the-size-of-release-binaries"}
<primary-label ref="experimental-opt-in"/>

要减小 release 二进制文件的大小并提高构建时间，请尝试 [启用二进制选项](native-binary-options.md#how-to-enable) `smallBinary`。

它会有效地将 `-Oz` 设置为编译器在 LLVM 编译阶段的默认优化参数。该选项仍处于 [实验性](components-stability.md#stability-levels-explained) 阶段，在某些情况下可能会影响运行时性能。

### 不要使用传递导出 {id="don-t-use-transitive-export"}

在许多情况下，使用 [`transitiveExport = true`](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries) 会禁用无效代码消除，因此编译器必须处理大量未使用的代码。这会增加编译时间。相反，应显式使用 `export` 方法来导出所需的项目和依赖项。

### 不要过度导出模块 {id="don-t-export-modules-too-much"}

尽量避免不必要的 [模块导出](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#export-dependencies-to-binaries)。每个导出的模块都会对编译时间和二进制文件大小产生负面影响。

### 使用 Gradle 构建缓存 {id="use-gradle-build-caching"}

启用 Gradle [构建缓存](https://docs.gradle.org/current/userguide/build_cache.html) 功能：

* **本地构建缓存**。对于本地缓存，请将 `org.gradle.caching=true` 添加到您的 `gradle.properties` 文件中，或在命令行中使用 `--build-cache` 选项运行构建。
* **远程构建缓存**。了解如何为持续集成环境 [配置远程构建缓存](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_configure_remote)。

### 使用 Gradle 配置缓存 {id="use-gradle-configuration-cache"}

Gradle [配置缓存](https://docs.gradle.org/current/userguide/configuration_cache.html) 通过缓存配置阶段的结果来提高构建性能。它还允许在单个项目中并行执行相互独立的任务，并隐式启用 `org.gradle.parallel` 属性，允许跨不同项目的任务 [并行执行](https://docs.gradle.org/current/userguide/performance.html#sec:enable_parallel_execution)。

要使用 Gradle 配置缓存，请将 `org.gradle.configuration-cache=true` 属性添加到您的 `gradle.properties` 文件中。

> 配置缓存还允许并行运行 `link*` 任务，这可能会使机器负载过重，特别是在具有多个 CPU 核心的情况下。此问题将在 [KT-70915](https://youtrack.jetbrains.com/issue/KT-70915) 中修复。
>
{style="note"}

### 启用之前禁用的功能 {id="enable-previously-disabled-features"}

您过去可能为了规避构建问题而禁用了一些 Kotlin/Native 功能。例如：

* `kotlin.native.disableCompilerDaemon=true` 禁用了 [Gradle daemon](https://docs.gradle.org/current/userguide/gradle_daemon.html)。
* `disableNativeCache` 禁用了 [编译缓存](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#binaries)。

最初需要这些变通方案的问题可能已经得到修复。如果您的 `gradle.properties` 文件或 Gradle 构建文件中包含这些行，请将其移除并检查构建是否可以成功完成。

### 尝试 klib 工件的增量编译 {id="try-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>

使用增量编译，如果项目模块生成的 `klib` 工件只有一部分发生变化，则只有 `klib` 的一部分会被进一步重新编译为二进制文件。

此功能处于 [Beta](components-stability.md#stability-levels-explained) 阶段。要启用它，请将以下选项添加到您的 `gradle.properties` 文件中：

```properties
kotlin.incremental.native=true
```

如果您遇到任何问题，请在 [YouTrack 中创建问题](https://kotl.in/issue)。

## Windows 配置 {id="windows-configuration"}

Windows 安全中心可能会减慢 Kotlin/Native 编译器的速度。您可以通过将 `.konan` 目录（默认位于 `%\USERPROFILE%`）添加到 Windows 安全中心排除项中来避免这种情况。了解如何 [向 Windows 安全中心添加排除项](https://support.microsoft.com/en-us/windows/add-an-exclusion-to-windows-security-811816c0-4dfd-af4a-47e4-c301afe13b26)。

## LLVM 配置 {id="llvm-configuration"}
<primary-label ref="advanced"/>

如果上述技巧对提高编译时间没有帮助，请考虑 [自定义 LLVM 后端](native-llvm-passes.md)。