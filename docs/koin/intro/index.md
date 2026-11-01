---
title: 欢迎
---

# 欢迎

Koin 是一个面向 Kotlin 的依赖注入框架。您可以在模块中声明类该如何构建，Koin 会在运行时创建并装配这些实例，并且可选的 Koin 编译器插件可以在构建时检查整个依赖图。它可在 Android、Compose、Kotlin Multiplatform、Ktor 以及任何 Kotlin/JVM 应用程序上运行。

本页是文档导航图。以下各节说明了其解答的问题以及入门途径。

```kotlin
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin { modules(appModule) }
}
```

## 我想要…… {id="i-want-to"}

- 首先理解依赖注入：[什么是依赖注入？](/docs/intro/what-is-dependency-injection)
- 五分钟了解 Koin 的工作原理：[核心概念](/docs/intro/core-concepts)
- 在 DSL 和注解之间做出选择：[选择您的风格](/docs/intro/choosing-your-style)
- 将 Koin 添加到我的 Gradle 构建中：[Gradle 设置](/docs/setup/gradle)
- 在 Composable 中注入 ViewModel：[Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)
- 在 Activity、Fragment 或 Service 中进行注入：[Android 入口点](/docs/reference/koin-android/entry-points)
- 装配 Retrofit、Room 或 OkHttp：[Android 库集成](/docs/reference/koin-android/binding-patterns)
- 在 Android 和 iOS 之间共享模块：[KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)
- 向定义传递运行时值（例如 ID）：[注入形参](/docs/reference/koin-core/injection-parameters)
- 测试我的 Koin 配置：[验证您的 Koin 配置](/docs/reference/koin-test/verify)与[编译时安全](/docs/reference/koin-compiler/compile-safety)
- 修复“No definition found”错误：[故障排除](/docs/reference/koin-core/troubleshooting)
- 从 Hilt 迁移：[从 Hilt 迁移](/docs/reference/koin-android/hilt-migration)
- 将注解从 KSP 迁移至编译器插件：[从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)
- 查看 Koin 在生产环境中的运行表现：[生产监控](/docs/tooling/production-monitoring)

## 导航指南 {id="where-to-go"}

### 新手入门 {id="get-started"}

什么是 Koin？它如何工作？我应该使用哪种风格？

- [什么是 Koin？](/docs/intro/what-is-koin)：Koin 是什么以及其如何工作，包括运行时与编译时。
- [核心概念](/docs/intro/core-concepts)：定义、模块、容器、注入、作用域。
- [选择您的风格](/docs/intro/choosing-your-style)：注解或 DSL（编译器插件、构造函数或经典 DSL）。
- [Koin 编译器插件](/docs/intro/koin-compiler-plugin)：该插件在构建时执行的操作。

### 设置 {id="setup"}

我需要向构建中添加什么？

- [设置](/docs/setup)：各平台需要安装的内容。
- [Gradle 设置](/docs/setup/gradle)：BOM 与各个 Koin 构件。
- [编译器插件设置](/docs/setup/compiler-plugin)：安装并配置 Gradle 插件。

### 教程 {id="tutorials"}

如何使用 Koin 逐步构建第一个应用程序？

- [Kotlin](/docs/quickstart/kotlin)：纯 Kotlin 应用程序。
- [Android - ViewModel](/docs/quickstart/android-viewmodel) 和 [Android - Jetpack Compose](/docs/quickstart/android-compose)。
- [Compose Multiplatform](/docs/quickstart/cmp)：Android 和 iOS 上的共享 UI。
- [Ktor](/docs/quickstart/ktor)：服务器端应用程序。

### 核心 {id="core"}

如何在任何平台上声明、组织和获取依赖项？

- [启动 Koin](/docs/reference/koin-core/starting-koin)：`startKoin`、日志记录、属性。
- [模块](/docs/reference/koin-core/modules)与[定义](/docs/reference/koin-core/definitions)：声明 Koin 构建的内容。
- [作用域](/docs/reference/koin-core/scopes)：与生命周期绑定的实例。
- [故障排除](/docs/reference/koin-core/troubleshooting)：错误及其解读方式。

### 平台 {id="platforms"}

如何将 Koin 与特定平台或框架结合使用？

- Android：[在 Android 上启动 Koin](/docs/reference/koin-android/start)、[Android ViewModel](/docs/reference/koin-android/viewmodel)、[多模块 Android 应用](/docs/reference/koin-android/multi-module)。
- Compose：[面向 Compose 的 Koin](/docs/reference/koin-compose/compose)、[Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)、[Navigation 3](/docs/reference/koin-compose/navigation3)。
- Kotlin Multiplatform：[KMP 设置](/docs/reference/koin-core/kmp-setup)、[共享模式](/docs/reference/koin-core/kmp-shared-modules)。
- Ktor：[面向 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)、[请求作用域](/docs/reference/koin-ktor/ktor-scopes)。

### 测试 {id="testing"}

如何测试使用 Koin 的代码，以及测试配置本身？

- [在测试中进行注入](/docs/reference/koin-test/testing)：`KoinTest`、使用测试替身（fake）替换定义。
- [验证您的 Koin 配置](/docs/reference/koin-test/verify)：在单元测试中检查模块。
- [Android 插桩测试](/docs/reference/koin-android/instrumented-testing)与[测试 Composable](/docs/reference/koin-compose/compose-testing)。

### 生产与工具 {id="production-tooling"}

哪些工具可以帮助我编写、检查和运行 Koin 应用程序？

- [工具](/docs/tooling)：Koin 周边工具概览。
- [IDE 插件](/docs/tooling/ide-plugin)：Android Studio 和 IntelliJ IDEA 中的导航与检查。
- [Monitor](/docs/tooling/monitor) 与[生产监控](/docs/tooling/production-monitoring)：查看 Koin 在运行时的行为。

### 迁移 {id="migration"}

我正在使用其他框架或较旧的 Koin 配置，该如何迁移？

- [Koin 与 Hilt 对比](/docs/intro/koin-vs-hilt)：两者的比较。
- [从 Hilt 迁移](/docs/reference/koin-android/hilt-migration)：分步指南。
- [JSR-330 兼容性](/docs/reference/koin-android/jsr330)：保留来自 `javax.inject` 的 `@Inject` 和 `@Singleton`。
- [从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)：将注解迁移到编译器插件。

### 参考指南 {id="reference"}

有哪些关键字、注解和选项？

- [DSL 参考](/docs/reference/koin-core/dsl)：所有 DSL 关键字。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有注解及其形参。
- [编译器插件选项](/docs/reference/koin-annotations/options)：该插件的所有 Gradle 选项。

### 支持 {id="support"}

我应该使用哪个版本？有哪些变更？在哪里可以获得帮助？

- [版本发布](/docs/support/releases)：版本、变更与升级说明。
- [API 稳定性](/docs/support/api-stability)：稳定（stable）、实验性（experimental）和内部（internal）的含义。
- [支持](/docs/support)：路线图、社区以及支持选项。

## 相关内容 {id="related"}

- [什么是 Koin？](/docs/intro/what-is-koin)：如果您刚接触 Koin，建议阅读的下一页。
- [核心概念](/docs/intro/core-concepts)：其他所有页面背后的心智模型。
- [设置](/docs/setup)：为您的平台安装 Koin。