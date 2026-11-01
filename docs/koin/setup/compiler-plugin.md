---
title: 编译器插件设置
---

# 编译器插件设置

本页面介绍了如何安装 Koin 编译器插件（Koin Compiler Plugin）——即编译器插件 DSL 和注解背后的 Kotlin 编译器插件。内容涵盖单模块、多模块以及 Kotlin Multiplatform 构建、主要选项和配置问题。要了解该插件的功能，请阅读 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)。Koin 库本身列在 [Gradle Setup](/docs/setup/gradle) 中。

## 要求 {id="requirements"}

- Kotlin 2.3.20 或更高版本（K2 编译器）。
- Koin 4.2.0 或更高版本。
- Gradle 8 或更高版本。

当前版本：

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

该插件拥有独立于 Koin 的版本号。`koin-annotations` 则遵循 Koin 的版本。

## 安装 {id="install"}

### 1. 声明插件 {id="1-declare-the-plugin"}

在 `gradle/libs.versions.toml` 中：

```toml
[versions]
koin = "4.2.2"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

如果你使用了 [Koin BOM](/docs/setup/gradle#koin-bom)，请从库依赖中移除 `version.ref`。该插件不属于 BOM 的一部分，并保留其自身版本。

### 2. 插件仓库 {id="2-plugin-repositories"}

该插件已发布至 Maven Central 和 Gradle Plugin Portal。在 `settings.gradle.kts` 中配置：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 3. 应用插件 {id="3-apply-the-plugin"}

在每个声明了 Koin 定义的 Gradle 模块的 `build.gradle.kts` 中：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)          // 或 koin-android、koin-ktor ……
    implementation(libs.koin.annotations)   // 用于注解，以及 DSL 风格中的 @Named 或 @InjectedParam
}
```

编译器插件 DSL（`single<T>()`、`factory<T>()`、`viewModel<T>()`）随 Koin 库一起提供，位于 `org.koin.plugin.module.dsl` 包中。仅当你使用注解（包括 DSL 风格中的形参注解）时，才需要引入 `koin-annotations`。

:::tip
`@KoinViewModel` 和 `@KoinWorker` 需要在类路径中包含其运行时库：`koin-core-viewmodel`（已包含在 `koin-android` 和 `koin-compose-viewmodel` 中）以及 `koin-androidx-workmanager`。如果缺失其中任何一个，构建将失败并抛出指出具体构件名称的错误。
:::

### 4. 检查是否正常工作 {id="4-check-that-it-works"}

为单次构建开启插件日志：

```kotlin
koinCompiler {
    userLogs = true
}
```

构建输出中会列出插件检测到的每个定义。确认无误后请将其再次关闭。然后按照 [Starting Koin](/docs/reference/koin-core/starting-koin) 中的说明启动 Koin，使用 `startKoin { }`，或者对于注解使用 `startKoin<MyApp>()`。

## 多模块项目 {id="multi-module-projects"}

在每个声明了定义的 Gradle 模块中应用该插件，而不仅仅是在 app 模块中：

```kotlin
// feature/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.android)
    implementation(libs.koin.annotations)
}
```

每个通过该插件编译的模块都会携带关于其定义的元数据。app 模块会在调用 `startKoin` 时读取这些元数据以检查完整的依赖图。没有使用该插件的库模块对这些检查是不可见的。有关如何在各个 Gradle 模块之间组装模块（`includes`、`@Configuration`），请参阅 [Modules](/docs/reference/koin-core/modules) 和 [Multi-Module Android Apps](/docs/reference/koin-android/multi-module)。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

只需在 shared 模块上应用一次该插件，并将库添加到 `commonMain` 中。无需针对每个目标进行单独配置：

```kotlin
// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

有关项目结构，请参阅 [Kotlin Multiplatform Setup](/docs/reference/koin-core/kmp-setup)。

## 选项 {id="options"}

`koinCompiler` 块用于配置该插件。默认设置适用于大多数项目：

```kotlin
koinCompiler {
    compileSafety = true      // 在构建时验证依赖图
    skipDefaultValues = true  // 使用 Kotlin 默认值而非注入
    userLogs = false          // 记录检测到的定义
}
```

包括 `strictSafety`、`unsafeDslChecks`、`logSeverity` 和 `debugLogs` 在内的每个选项都在 [Compiler Plugin Options](/docs/reference/koin-annotations/options) 中进行了说明。

## Kotlin 版本兼容性 {id="kotlin-version-compatibility"}

每个插件发布版本都会在一组 Kotlin 版本上进行验证：

| Kotlin | Koin Compiler Plugin |
|--------|----------------------|
| 2.3.20, 2.4.0, 2.4.10 | 1.2.0+ |
| 2.4.20 | 1.2.1+ |

对于不在列表中的 Kotlin 版本，插件会输出一条警告信息，构建将继续进行。

:::warning
在 Kotlin 2.4.20 上，插件 1.2.0 在 IR 生成期间会失败并抛出 `NoSuchMethodError`。请使用 1.2.1 或更高版本。
:::

## 故障排除 {id="troubleshooting"}

### 未找到插件 {id="plugin-not-found"}

Gradle 无法解析 `io.insert-koin.compiler.plugin`。请检查 `settings.gradle.kts` 的 `pluginManagement.repositories` 中是否包含了 `mavenCentral()` 和 `gradlePluginPortal()`。

### 运行时出现 NotImplementedError {id="notimplementederror-at-runtime"}

`single<T>()`、`factory<T>()` 和 `create(::T)` 是由插件负责替换的占位符。如果未将插件应用到包含它们的 Gradle 模块，代码仍可正常编译，但在创建模块时会抛出 `NotImplementedError`。请将插件应用到该模块。

### 错误的导入 {id="wrong-imports"}

编译器插件 DSL 与构造函数 DSL 在不同的包中包含同名函数：

```kotlin
// 编译器插件 DSL
import org.koin.plugin.module.dsl.*

// 构造函数 DSL：singleOf、factoryOf、viewModelOf
import org.koin.core.module.dsl.*

// 两者皆有
import org.koin.dsl.module
```

### 重构后出现过时的结果 {id="stale-results-after-a-refactor"}

与其他 Kotlin IR 插件（例如 Compose 编译器）类似，Koin 编译器插件在增量编译时可能会产生过时的结果。常见症状：

- 出现了本不应出现的编译安全错误，或者在移除某个定义后没有显示预期的错误。
- 重构后在运行时抛出 `NoSuchMethodError` 或 `ClassNotFoundException`。

通常发生在以下变更之后：

- 更改类上的注解（如将 `@Singleton` 改为 `@Factory`，添加或移除 `@Named`）。
- 在 `@ComponentScan` 扫描的包之间移动类。
- 更改模块的 `includes` 或 `@Configuration` 标签。
- 在其他模块所依赖的库模块中添加或移除定义。

执行清理构建：`./gradlew clean build`，或者在 Android Studio 中依次点击 Build > Clean Project，然后点击 Build > Rebuild Project。

对于 `module { }` lambda 表达式内部的变更，插件会为包含入口点（`startKoin`、`koinApplication`、`@KoinApplication`）的模块开启 `strictSafety`。它会在每次构建这些模块时重新执行全图检查。参见 [`strictSafety`](/docs/reference/koin-annotations/options)。

### 跨模块报告依赖项缺失 {id="missing-dependency-reported-across-modules"}

如果插件报告了某个库模块确实声明了的依赖项缺失：

1. 同时将该插件应用到该库模块。如果没有插件，库将不会携带任何元数据。
2. 确保在构建使用该库的模块之前，该库已被构建。`implementation(project(":lib"))` 通常可以确保这一点。
3. 首次向库中添加插件后，请执行清理构建。
4. 使用插件 1.2.1 或更高版本。早期版本会遗漏相隔两个或更多 `implementation` 层级的定义，并且会跨模块合并 `@Named` 提供者。如果你之前因为虚假的 `KOIN-D001` 错误而关闭了 `compileSafety`，请重新将其开启。

## 迁移到编译器插件 {id="moving-to-the-compiler-plugin"}

- **从构造函数 DSL 或传统 DSL 迁移**：应用该插件。现有的 `singleOf(::T)` 定义和 `get()` 调用无需修改即可在构建时接受检查。随后你可以逐模块将其替换为 `single<T>()`。请参阅 [Choosing your style](/docs/intro/choosing-your-style)。
- **从 KSP 处理程序迁移**：移除 KSP 和 `koin-ksp-compiler`，应用该插件，并将生成的 `.module` 扩展替换为 `startKoin<MyApp>()`。你的注解保持不变。请参阅 [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin)。

## 相关内容 {id="related"}

- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)：插件的功能及其工作原理。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options)：所有 Gradle 选项。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：所有检查与错误代码。
- [Gradle Setup](/docs/setup/gradle)：Koin 库和 BOM。
- [Starting Koin](/docs/reference/koin-core/starting-koin)：类型化的启动 API（如 `startKoin<MyApp>()`）。