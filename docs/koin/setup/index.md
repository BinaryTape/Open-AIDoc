---
title: 配置
---

# 配置

本节说明了使用 Koin 时需要向 Gradle 构建中添加的内容。请在下方选择你的平台，然后按照 [Gradle 配置](/docs/setup/gradle)中对应的链接章节进行操作。如果你尚未选择声明样式，请先阅读[选择你的样式](/docs/intro/choosing-your-style)：该内容决定了你是否还需要编译器插件。

## 需要安装的内容 {id="what-to-install"}

| 平台 | 构件 | 配置 |
|----------|-----------|-------|
| Kotlin/JVM | `koin-core` | [Kotlin/JVM](/docs/setup/gradle#kotlin) |
| Android | `koin-android` | [Android](/docs/setup/gradle#android) |
| 带有 Jetpack Compose 的 Android | `koin-android`, `koin-compose`, `koin-compose-viewmodel` | [Jetpack Compose](/docs/setup/gradle#compose-android) |
| Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [Compose Multiplatform](/docs/setup/gradle#compose) |
| Kotlin Multiplatform | `commonMain` 中的 `koin-core` | [Kotlin Multiplatform](/docs/setup/gradle#kotlin-multiplatform) |
| Ktor | `koin-ktor`, `koin-logger-slf4j` | [Ktor](/docs/setup/gradle#ktor) |
| 测试 | `koin-test`、`koin-test-junit4` 或 `koin-test-junit5` | [测试](/docs/setup/gradle#testing) |

## 推荐配置 {id="recommended-setup"}

对于新项目：

1. **Koin BOM**：导入 `io.insert-koin:koin-bom` 并声明不带版本的 Koin 构件，以确保它们始终匹配。请参阅 [Gradle 配置](/docs/setup/gradle)。
2. **Koin 编译器插件**：应用 Gradle 插件 `io.insert-koin.compiler.plugin` 以获取编译器插件 DSL 或注解，并获得编译时检查。它需要 Kotlin 2.3.20 或更高版本。请参阅[编译器插件配置](/docs/setup/compiler-plugin)。

如果你仅使用 Constructor 或 Classic DSL，则执行步骤 1 就足够了。但仍推荐执行步骤 2：它会为这些定义添加编译时检查。

:::warning
KSP 处理器 `koin-ksp-compiler` 已弃用。其配置仅在 [KSP 处理器配置](/docs/setup/annotations-ksp)中针对现有项目保留。新项目请使用编译器插件。
:::

## 版本 {id="versions"}

| 组件 | 当前版本 | Kotlin |
|-----------|-----------------|----------|
| Koin（所有库，包括 `koin-annotations`） | 4.2.2 | 使用 2.3.20 构建 |
| Koin 编译器插件 | 1.2.1 | 已在 2.3.20、2.4.0、2.4.10、2.4.20 上验证（需要 Koin 4.2.0+） |

最新发布的版本：

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin 编译器插件: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

较旧的 Koin 系列：

| Koin | Kotlin | 编译器插件 |
|------|--------|-----------------|
| 4.2.x | 2.3.20+ | 是 |
| 4.1.x | 2.1+ | 否，仅限 KSP 处理器 |
| 4.0.x | 1.9+ | 否，仅限 KSP 处理器 |
| 3.5.x | 1.8+ | 否 |

版本之间的变更及升级方法请参阅[发布版本](/docs/support/releases)。

## 相关内容 {id="related"}

- [Gradle 配置](/docs/setup/gradle)：BOM 及所有 Koin 构件。
- [编译器插件配置](/docs/setup/compiler-plugin)：安装与配置插件。
- [选择你的样式](/docs/intro/choosing-your-style)：不同样式所需的内容。
- [教程](/docs/quickstart/kotlin)：各平台上的第一个应用程序。
- [发布版本](/docs/support/releases)：版本与升级说明。