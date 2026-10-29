[//]: # (title: Gradle 最佳实践)

[Gradle](https://docs.gradle.org/current/userguide/userguide.html) 是许多 Kotlin 项目用于自动执行和管理构建过程的构建系统。

充分利用 Gradle 的优势至关重要，这可以帮助您减少管理和等待构建的时间，从而将更多时间花在编码上。在此，我们提供了一套最佳实践，分为两个关键领域：**组织**和**优化**您的项目。

## 组织 {id="organize"}

本节侧重于构建 Gradle 项目的结构，以提高清晰度、可维护性和可扩展性。

### 使用 Kotlin DSL {id="use-kotlin-dsl"}

使用 Kotlin DSL 代替传统的 Groovy DSL。您可以避免学习另一种语言，并获得严格类型带来的好处。严格类型允许 IDE 为重构和自动补全提供更好的支持，从而提高开发效率。

在 [Gradle 的 Kotlin DSL 入门指南](https://docs.gradle.org/current/userguide/kotlin_dsl.html)中查找更多信息。

阅读 Gradle 关于 Kotlin DSL 成为 Gradle 构建默认设置的[博客](https://blog.gradle.org/kotlin-dsl-is-now-the-default-for-new-gradle-builds)。

### 使用版本编目 {id="use-a-version-catalog"}

在 `libs.versions.toml` 文件中使用版本编目（version catalog）来集中进行依赖项管理。这使您能够在多个项目之间一致地定义和重用版本、库和插件。

```toml
[versions]
kotlinxCoroutines = "%coroutinesVersion%"

[libraries]
kotlinxCoroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinxCoroutines" }
```

在 `build.gradle.kts` 文件中添加以下依赖项：

```kotlin
dependencies {
    implementation(libs.kotlinxCoroutines)
}
```

在 Gradle 关于 [依赖项管理基础知识](https://docs.gradle.org/current/userguide/dependency_management_basics.html#version_catalog) 的文档中了解更多信息。

### 使用约定插件 {id="use-convention-plugins"}

<primary-label ref="advanced"/>

使用约定插件来封装和重用跨多个构建文件的公共构建逻辑。将共享配置移入插件有助于简化构建脚本并使其模块化。

虽然初始设置可能比较耗时，但一旦完成，维护和添加新的构建逻辑就会变得非常容易。

在 Gradle 关于 [约定插件](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins) 的文档中了解更多信息。

## 优化 {id="optimize"}

本节提供了提高 Gradle 构建性能和效率的策略。

### 使用本地构建缓存 {id="use-local-build-cache"}

使用本地构建缓存，通过重用其他构建产出的输出来节省时间。构建缓存可以从您之前创建的任何早期构建中检索输出。

在 Gradle 关于 [构建缓存](https://docs.gradle.org/current/userguide/build_cache.html) 的文档中了解更多信息。

### 使用配置缓存 {id="use-configuration-cache"}

> 配置缓存尚不支持所有 Gradle 核心插件。有关最新信息，请参阅 Gradle 的[受支持插件列表](https://docs.gradle.org/current/userguide/configuration_cache_status.html#config_cache:plugins:core)。
>
{style="note"}

使用配置缓存，通过缓存配置阶段的结果并在后续构建中重用，可以显著提高构建性能。如果 Gradle 检测到构建配置或相关依赖项没有变化，它将跳过配置阶段。

配置缓存还可以实现在单个项目内并行执行独立任务，这可以进一步提高构建性能。此外，它会隐式启用 `org.gradle.parallel` 属性，允许不同项目之间的任务[并行执行](https://docs.gradle.org/current/userguide/performance.html#sec:enable_parallel_execution)。

在 [Gradle 文档](https://docs.gradle.org/current/userguide/configuration_cache.html)中了解有关配置缓存的更多信息。

### 缩短多目标的构建时间 {id="improve-build-times-for-multiple-targets"}

当您的多平台项目包含多个目标时，`build` 和 `assemble` 等任务可能会为每个目标多次编译相同的代码，从而导致构建时间变长。

如果您正在积极开发和测试特定平台，请改为运行相应的 `linkDebug*` 任务。

有关更多信息，请参阅[提高编译时间的技巧](native-improving-compilation-time.md#gradle-configuration)。

### 从 kapt 迁移到 KSP {id="migrate-from-kapt-to-ksp"}

如果您使用的库依赖于 [kapt](kapt.md) 编译器插件，请检查是否可以切换到使用 [Kotlin 符号处理 (KSP) API](ksp-overview.md)。KSP API 通过减少注解处理时间来提高构建性能。KSP 比 kapt 更快、更高效，因为它直接处理源代码而不生成中间 Java 存根。

有关迁移步骤的指导，请参阅[迁移指南](ksp-kapt-migration.md)。

### 使用模块化 {id="use-modularization"}

<primary-label ref="advanced"/>

> 模块化仅对中大型项目有益。对于基于微服务架构的项目，它并不提供优势。
>
{style="note"}

使用模块化的项目结构可以提高构建速度并实现更轻松的并行开发。将您的项目结构划分为一个根项目和一个或多个子项目。如果更改仅影响其中一个子项目，Gradle 将仅重新构建该特定的子项目。

```none
.
└── root-project/
    ├── settings.gradle.kts
    ├── app subproject/
    │   └── build.gradle.kts
    └── lib subproject/
        └── build.gradle.kts
```

在 Gradle 关于 [使用 Gradle 构建项目结构](https://docs.gradle.org/current/userguide/multi_project_builds.html) 的文档中了解更多信息。

### 设置 CI/CD {id="set-up-ci-cd"}
<primary-label ref="advanced"/>

通过使用增量构建和缓存依赖项，设置 CI/CD 过程可以显著减少构建时间。添加持久存储或使用远程构建缓存以获得这些好处。这个过程不必耗时，因为一些供应商（如 [GitHub](https://github.com/features/actions)）几乎可以提供开箱即用的此类服务。

探索 Gradle 社区指南关于[在持续集成系统中使用 Gradle](https://cookbook.gradle.org/ci/) 的内容。

### 使用远程构建缓存 {id="use-remote-build-cache"}
<primary-label ref="advanced"/>

与[本地构建缓存](#use-local-build-cache)类似，远程构建缓存通过重用其他构建的输出帮助您节省时间。它可以从任何人已经运行过的任何早期构建中检索任务输出，而不仅仅是最后一次构建。

远程构建缓存使用缓存服务器在构建之间共享任务输出。例如，在带有 CI/CD 服务器的开发环境中，服务器上的所有构建都会填充远程缓存。当您检出主分支以开始新功能开发时，可以立即使用增量构建。

请记住，缓慢的网络连接可能会使传输缓存结果的速度比在本地运行任务更慢。

在 Gradle 关于 [构建缓存](https://docs.gradle.org/current/userguide/build_cache.html) 的文档中了解更多信息。