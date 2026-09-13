[//]: # (title: Kotlin/Native 支持的目标和主机)

本文档描述了 Kotlin/Native 编译器支持哪些目标和主机。

> 我们可以根据实际情况调整支持的目标和主机列表、层级数量及其功能。
>
{style="tip"}

## 目标层级 {id="target-tiers"}

Kotlin/Native 编译器支持许多不同的目标，但对它们的支持程度各不相同。
为了明确这些级别，我们根据编译器对这些目标的支持程度将它们分为几个层级。

层级表格包含以下列：

* **Gradle 目标名称** 是在 Kotlin 多平台 Gradle 插件中用于启用该目标的 [目标名称](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)。
* **目标三元组** 是根据 `<architecture>-<vendor>-<system>-<abi>` 结构确定的目标名称，这是 [编译器常用的](https://clang.llvm.org/docs/CrossCompilation.html#target-triple) 命名方式。
* **运行测试** 表示该目标是否允许用户在 Gradle 和 IDE 中开箱即用运行测试（不要与为目标本身运行的 持续集成 (CI) 测试混淆）。
  
  这仅在特定目标的原生主机上可用。例如，你只能在 macOS ARM64 主机上运行 `macosArm64` 和 `iosArm64` 测试。

### 第 1 层级 {id="tier-1"}

* 该目标在 持续集成 (CI) 上定期进行测试，以确保能够编译和运行。
* 我们提供 [编译器发布版本之间的源代码和二进制兼容性](https://youtrack.jetbrains.com/issue/KT-42293)。

| Gradle 目标名称 | 目标三元组 | 运行测试 | 描述 |
|-------------------------|-------------------------------|---------------|---------------------------------------------------------------|
| 仅限 Apple macOS 主机： |                               |               |                                                               |
| `macosArm64`            | `aarch64-apple-macos`         | ✅            | Apple 芯片 平台上的 Apple macOS 12.0 及更高版本 |
| `iosSimulatorArm64`     | `aarch64-apple-ios-simulator` | ✅            | Apple 芯片 平台上的 Apple iOS 模拟器 15.0 及更高版本 |
| `iosArm64`              | `aarch64-apple-ios`           |               | ARM64 平台上的 Apple iOS 和 iPadOS 15.0 及更高版本 |

### 第 2 层级 {id="tier-2"}

* 该目标在 持续集成 (CI) 上定期进行测试，以确保能够编译，但可能不会自动测试其运行能力。
* 我们正尽最大努力提供 [编译器发布版本之间的源代码和二进制兼容性](https://youtrack.jetbrains.com/issue/KT-42293)。

| Gradle 目标名称 | 目标三元组 | 运行测试 | 描述 |
|-------------------------|-----------------------------------|---------------|------------------------------------------------------------------|
| `linuxX64`              | `x86_64-unknown-linux-gnu`        | ✅            | x86_64 平台上的 Linux |
| `linuxArm64`            | `aarch64-unknown-linux-gnu`       |               | ARM64 平台上的 Linux |
| 仅限 Apple macOS 主机： |                                   |               |                                                                  |
| `watchosSimulatorArm64` | `aarch64-apple-watchos-simulator` | ✅            | Apple 芯片 平台上的 Apple watchOS 模拟器 8.0 及更高版本 |
| `watchosArm64`          | `arm64_32-apple-watchos`          |               | 带有 ILP32 的 ARM64 平台上的 Apple watchOS 8.0 及更高版本 |
| `tvosSimulatorArm64`    | `aarch64-apple-tvos-simulator`    | ✅            | Apple 芯片 平台上的 Apple tvOS 模拟器 15.0 及更高版本 |
| `tvosArm64`             | `aarch64-apple-tvos`              |               | ARM64 平台上的 Apple tvOS 15.0 及更高版本 |

### 第 3 层级 {id="tier-3"}

* 不保证该目标在 持续集成 (CI) 上进行测试。
* 我们无法承诺不同编译器发布版本之间的源代码和二进制兼容性，尽管针对这些目标的此类更改非常罕见。

> 第 3 层级目标不在活跃开发中，可能会出现破坏性问题。
> 请谨慎使用。
> 
{style="warning"}

| Gradle 目标名称 | 目标三元组 | 运行测试 | 描述 |
|-------------------------|----------------------------------|---------------|------------------------------------------------------------------------------------------|
| `androidNativeArm32`    | `arm-unknown-linux-androideabi`  |               | ARM32 平台上的 [Android NDK](https://developer.android.com/ndk) |
| `androidNativeArm64`    | `aarch64-unknown-linux-android`  |               | ARM64 平台上的 [Android NDK](https://developer.android.com/ndk) |
| `androidNativeX86`      | `i686-unknown-linux-android`     |               | x86 平台上的 [Android NDK](https://developer.android.com/ndk) |
| `androidNativeX64`      | `x86_64-unknown-linux-android`   |               | x86_64 平台上的 [Android NDK](https://developer.android.com/ndk) |
| `mingwX64`              | `x86_64-pc-windows-gnu`          | ✅            | 使用 [MinGW](https://www.mingw-w64.org) 兼容层的 64 位 Windows 10 及更高版本 |
| 仅限 Apple macOS 主机： |                                  |               |                                                                                          |
| `watchosDeviceArm64`    | `aarch64-apple-watchos`          |               | ARM64 平台上的 Apple watchOS 8.0 及更高版本 |
| `iosX64`                | `x86_64-apple-ios-simulator`     |               | x86-64 平台上的 Apple iOS 模拟器 15.0 及更高版本 |

### 已弃用的目标 {id="deprecated-targets"}

以下目标已被弃用，并计划移除：

| 目标 | 开始弃用版本 | 描述 |
|-----------------|-------------------|----------------------------------------------------|
| `watchosArm32`  | Kotlin 2.4.20     | ARM32 平台上的 Apple watchOS 设备 |
| `macosX64`      | Kotlin 2.3.20     | x86_64 平台上的 Apple macOS |
| `watchosX64`    | Kotlin 2.3.20     | x86_64 平台上的 Apple watchOS 64 位模拟器 | 
| `tvosX64`       | Kotlin 2.3.20     | x86_64 平台上的 Apple tvOS 模拟器 | 
| `linuxArm32Hfp` | Kotlin 1.8.20     | ARM32 平台上的 Linux |

### 支持较低的 Apple 目标版本 {id="supporting-lower-apple-target-versions"}

目前，Apple 目标的默认最低支持版本为：

* iOS 和 tvOS 为 15.0。
* macOS 为 12.0。
* watchOS 为 8.0。

如果你的项目需要支持低于默认值的版本，请在构建文件中使用 `freeCompilerArgs` 选项：

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### 对于库作者 {id="for-library-authors"}

我们不建议库作者测试比 Kotlin/Native 编译器更多的目标或提供比其更严格的保证。在考虑支持原生目标时，你可以采用以下方法：

* 支持第 1、2 和 3 层级的所有目标。
* 定期测试支持开箱即用运行测试的第 1 和 2 层级目标。

Kotlin 团队在官方 Kotlin 库中也使用了这种方法，例如 [kotlinx.coroutines](coroutines-guide.md) 和 [kotlinx.serialization](serialization.md)。

## 主机 {id="hosts"}

Kotlin/Native 编译器支持以下主机：

| 主机操作系统 | 构建最终二进制文件 | 生成 `.klib` 构件 |
|----------------------------------------------------|------------------------------------------------|------------------------------------------------------------------------|
| 搭载 Apple 芯片 (ARM64) 的 macOS | 任何受支持的目标 | 任何受支持的目标 |
| 搭载 Intel 芯片 (x86_64) 的 macOS | 任何受支持的目标 | 任何受支持的目标 |
| 采用 x86_64 架构的 Linux | 任何受支持的目标（Apple 目标除外） | 任何受支持的目标，Apple 目标仅限不带 cinterop 依赖项的情况 |
| 采用 x86_64 架构的 Windows (MinGW 工具链) | 任何受支持的目标（Apple 目标除外） | 任何受支持的目标，Apple 目标仅限不带 cinterop 依赖项的情况 |

### 构建最终二进制文件 {id="building-final-binaries"}

要生成最终二进制文件，你只能在 *受支持的主机* 上为 [受支持的目标](#target-tiers) 进行编译。例如，你不能在 FreeBSD 或运行在 ARM64 架构上的 Linux 机器上进行编译。

在 Linux 和 Windows 上构建 Apple 目标的最终二进制文件也是不可能的。

### 生成 `.klib` 构件 {id="producing-klib-artifacts"}

通常，Kotlin/Native 允许任何 *受支持的主机* 为受支持的目标生成 `.klib` 构件。

然而，在 Linux 和 Windows 上为 Apple 目标生成构件仍然存在一些限制。如果你的项目使用了 [cinterop 依赖项](native-c-interop.md)（包括 [CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)），你必须使用 macOS 主机。

例如，只有在没有 cinterop 依赖项的情况下，你才能在运行于 x86_64 架构的 Windows 机器上为 `macosArm64` 目标生成 `.klib`。

## 下一步 {id="what-s-next"}

* [构建最终原生二进制文件](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)
* [针对 Apple 目标的编译](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html#compilation-for-apple-targets)