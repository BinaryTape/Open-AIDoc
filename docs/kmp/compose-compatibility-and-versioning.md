[//]: # (title: 兼容性与版本)

Compose Multiplatform 的发布独立于 Kotlin 和 Jetpack Compose。本页面包含有关 Compose Multiplatform 发布版本、Compose 发布周期以及组件兼容性的信息。
有关受支持的 IDE 版本的详细信息，请参阅[推荐的 IDE 与代码编辑器](recommended-ides.md)。

由于 Compose Multiplatform 构建于 Kotlin Multiplatform 之上，它也会受到 [Kotlin Multiplatform 兼容性指南](multiplatform-compatibility-guide.md)中列出的 Kotlin Multiplatform Gradle 插件、Gradle、Android Gradle Plugin 和 Xcode 版本兼容性的影响。

## 支持的平台 {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose% 支持以下平台：

| 平台 | 最低版本                                                                                             |
|------|------------------------------------------------------------------------------------------------------|
| Android  | Android 5.0（API 级别 21）                                                                           |
| iOS      | iOS 14                                                                                               |
| macOS    | macOS 13 arm64                                                                                       |
| Windows  | Windows 10 (x86-64, arm64)                                                                           |
| Linux    | Ubuntu 20.04 (x86-64, arm64)                                                                         |
| Web      | 支持 [WasmGC 的浏览器](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions)         |

> 所有 Compose Multiplatform 发布版本仅支持 64 位平台。
> 
{style="note"}

## Kotlin 兼容性 {id="kotlin-compatibility"}

最新的 Compose Multiplatform 始终与最新版本的 Kotlin 兼容。
无需手动统一它们的版本。
请注意，使用任一产品的 EAP 版本仍可能存在不稳定情况。

Compose Multiplatform 要求应用的 Compose Compiler Gradle 插件版本与 Kotlin Multiplatform 插件版本一致。
详情请参阅[迁移 Compose Multiplatform 项目](compose-compiler.md#migrating-a-compose-multiplatform-project)。

从 Compose Multiplatform 1.8.0 开始，该 UI 框架已完全过渡到 K2 编译器。
若要使用最新的 Compose Multiplatform 发布版本：

 * 在项目中至少使用 Kotlin 2.1.0，
 * 仅在基于 Compose Multiplatform 的库针对至少 Kotlin 2.1.0 编译时，才依赖这些库，
 * 针对支持快速演进的平台（例如 iOS 和 Web）的项目，升级到 Kotlin **2.2.20**。
 
作为在所有依赖项更新完成之前解决向后兼容性问题的临时通融方案，您可以在 Gradle 构建文件中使用 [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL 关闭 Gradle 缓存。
这将确保与较旧版本库的兼容性，但会增加编译时间。

## Compose Multiplatform 桌面端发布版本的限制 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

由于 [Skia](https://skia.org/) 绑定中使用的内存管理机制，Compose Multiplatform 桌面端仅支持 JDK 11 或更高版本。

此外：
* 由于 [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html) 的限制，打包原生分发包仅支持 JDK 17 或更高版本。
* OpenJDK 11.0.12 在 macOS 上切换键盘布局时存在一个已知[问题](https://github.com/JetBrains/compose-multiplatform/issues/940)。
  此问题在 OpenJDK 11.0.15 中不可复现。

## Jetpack Compose 和 Compose Multiplatform 的发布周期 {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform 与 Google 开发的 Android 版 [Jetpack Compose](https://developer.android.com/jetpack/compose) 共享大量代码。我们将 Compose Multiplatform 的发布周期与 Jetpack Compose 的发布周期保持一致，以便通用代码得到充分测试和稳定。

当 Jetpack Compose 发布新版本时，我们会：

1. 将该发布提交（commit）作为下一个 [Compose Multiplatform](https://github.com/JetBrains/androidx) 版本的基础。
2. 添加对新平台功能的支持。
3. 稳定所有平台。
4. 发布 Compose Multiplatform 的新版本。

Compose Multiplatform 发布与 Jetpack Compose 发布之间的间隔通常为 1 到 3 个月。

### Compose Multiplatform 的开发版本 {id="development-versions-of-compose-multiplatform"}

Compose Multiplatform 编译器插件的开发版本（例如 `1.8.2+dev2544`）没有固定的构建计划，用于在正式发布之间测试更新。

这些构建版本无法在 [Maven Central](https://central.sonatype.com/) 中获取。
若要访问它们，请将以下行添加到仓库列表中：

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 使用的 Jetpack Compose 构件 {id="jetpack-compose-artifacts-used"}

当您为 Android 构建应用程序时，Compose Multiplatform 会使用 Google 发布的构件。

下表列出了各个 Compose Multiplatform 版本所使用的 Jetpack Compose 构件版本：

| Compose Multiplatform 版本                                                        | Jetpack Compose 版本    |
|-----------------------------------------------------------------------------------|-------------------------|
| [1.12.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.2) | 1.12.1                  |
| [1.11.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.11.1) | 1.11.2                  |
| [1.10.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.3) | 1.10.5                  |
| [1.9.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.3)   | 1.9.4                   |
| [1.8.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.8.2)   | 1.8.2                   |
| [1.7.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.3)   | 1.7.6                   |
| [1.7.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.1)   | 1.7.5                   |
| [1.7.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.0)   | 1.7.1                   |
| [1.6.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.11) | 1.6.7                   |
| [1.6.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.10) | 1.6.7                   |
| [1.6.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.2)   | 1.6.4                   |
| [1.6.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.1)   | 1.6.3                   |
| [1.6.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.0)   | 1.6.1                   |
| [1.5.12](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.12) | 1.5.4                   |
| [1.5.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.11) | 1.5.4                   |
| [1.5.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.10) | 1.5.4                   |
| [1.5.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.1)   | 1.5.0                   |
| [1.5.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.0)   | 1.5.0                   |
| [1.4.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.3)   | 1.4.3                   |
| [1.4.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.1)   | 1.4.3                   |
| [1.4.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.0)   | 1.4.0                   |
| [1.3.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.1)   | 1.3.3                   |
| [1.3.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.0)   | 1.3.3                   |
| [1.2.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.1)   | 1.2.1                   |
| [1.2.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.0)   | 1.2.1                   |
| [1.1.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.1)   | 1.1.0                   |
| [1.1.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.0)   | 1.1.0                   |
| [1.0.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.1)   | 1.1.0-beta02            |
| [1.0.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.0)   | 1.1.0-beta02            |