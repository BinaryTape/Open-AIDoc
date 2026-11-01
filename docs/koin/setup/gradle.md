---
title: Gradle 设置
---

# Gradle 设置

本页列出了每个平台以及所有已发布的 Koin 构件的 Gradle 依赖项。示例使用 Kotlin DSL (`build.gradle.kts`) 和版本目录（version catalog）。要添加编译时检查和编译器插件 DSL，另请参阅[编译器插件设置](/docs/setup/compiler-plugin)。

## 版本 {id="versions"}

包括 `koin-annotations` 在内的所有 Koin 库共用一个版本。当前的稳定版本为 4.2.2。

- Koin：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)

所有构件均可在 [Maven Central](https://central.sonatype.com/search?q=io.insert-koin) 的 `io.insert-koin` 分组下找到。版本历史和升级说明请参阅[发布版本](/docs/support/releases)。

## Koin BOM {id="koin-bom"}

Koin BOM（物料清单，bill of materials）将所有 Koin 库固定为相同的版本。你只需声明一次 BOM 版本，之后即可在不指定版本的情况下添加各个 Koin 库。更新 BOM 时，所有 Koin 库会同步升级。

在 `gradle/libs.versions.toml` 中：

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-bom = { module = "io.insert-koin:koin-bom", version.ref = "koin" }
koin-core = { module = "io.insert-koin:koin-core" }
koin-android = { module = "io.insert-koin:koin-android" }
koin-compose = { module = "io.insert-koin:koin-compose" }
koin-compose-viewmodel = { module = "io.insert-koin:koin-compose-viewmodel" }
koin-compose-viewmodel-navigation = { module = "io.insert-koin:koin-compose-viewmodel-navigation" }
koin-ktor = { module = "io.insert-koin:koin-ktor" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j" }
koin-annotations = { module = "io.insert-koin:koin-annotations" }
koin-test = { module = "io.insert-koin:koin-test" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4" }
```

在模块的 `build.gradle.kts` 中：

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

不使用版本目录：

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:4.2.2"))
    implementation("io.insert-koin:koin-android")
    testImplementation("io.insert-koin:koin-test-junit4")
}
```

直接在某个依赖项上指定的版本仅会覆盖该依赖项本身的 BOM 配置。除非你需要某个库的新版本中的修复，否则请尽量避免这样做。

### 不使用 BOM {id="without-the-bom"}

你也可以为每个库单独指定版本。[Koin 示例](https://github.com/InsertKoinIO/koin-getting-started)即采用这种方式，这在 Kotlin Multiplatform 源集中也同样适用：

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
```

请让所有 Koin 库保持单一的 `koin` 版本：不支持混合使用不同版本。

## Kotlin/JVM {#kotlin}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.core)
}
```

然后在 `main` 中启动 Koin。请参阅[启动 Koin](/docs/reference/koin-core/starting-koin)与 [Kotlin 教程](/docs/quickstart/kotlin)。

## Android {#android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

`koin-android` 包含 `koin-core` 和 ViewModel 支持。请在你的 `Application` 类中启动 Koin：参阅[在 Android 上启动 Koin](/docs/reference/koin-android/start)。

可选的 Android 库：

| 构件 | 作用 |
|----------|------|
| `koin-androidx-workmanager` | WorkManager worker：参阅 [WorkManager](/docs/reference/koin-android/workmanager) |
| `koin-androidx-navigation` | 作用域限定为导航图 (Fragments) 的 ViewModel |
| `koin-androidx-startup` | 通过 AndroidX App Startup 启动 Koin |
| `koin-android-compat` | 用于从 Java 类中进行注入的 Java 帮助程序 |
| `koin-dagger-bridge` | 在迁移期间从 Koin 中使用 Dagger 组件 |

## 结合 Jetpack Compose 的 Android {#compose-android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
    implementation(libs.koin.compose)
    implementation(libs.koin.compose.viewmodel)
}
```

`koin-androidx-compose` 是一个仅限 Android 的构件，可以通过单个依赖项同时引入 `koin-compose` 和 `koin-compose-viewmodel`。两种配置方式均可正常工作。

对于导航，请添加以下构件之一：

| 构件 | 导航库 |
|----------|--------------------|
| `koin-androidx-compose-navigation` | Navigation Compose 2，仅限 Android |
| `koin-compose-viewmodel-navigation` | Navigation Compose 2，多平台 |
| `koin-compose-navigation3` | Navigation 3：参阅 [Navigation 3](/docs/reference/koin-compose/navigation3) |

有关 API 详情，请参阅 [Koin for Compose](/docs/reference/koin-compose/compose)。

## Compose Multiplatform {#compose}

在共享模块中，将 Compose 库添加到 `commonMain` 中。在多平台源集中，请使用包含版本的目录条目（参阅[不使用 BOM](#without-the-bom)）：

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.compose)
            implementation(libs.koin.compose.viewmodel)
            implementation(libs.koin.compose.viewmodel.navigation) // 如果使用 Navigation Compose
        }
    }
}
```

在 Android 平台上，`koin-compose` 会自动引入 `koin-android`，因此你无需额外添加。请参阅 [Compose Multiplatform 教程](/docs/quickstart/cmp)。

## Kotlin Multiplatform {#kotlin-multiplatform}

在共享模块的 `build.gradle.kts` 中，使用包含版本的目录条目（参阅[不使用 BOM](#without-the-bom)）：

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
        }
        androidMain.dependencies {
            implementation(libs.koin.android)
        }
        commonTest.dependencies {
            implementation(libs.koin.test)
        }
    }
}
```

`koin-core` 支持 JVM、Android、Apple 目标（iOS、macOS、tvOS、watchOS）、Linux、Windows、JS 和 Wasm (`wasmJs`)。项目结构和平台特定定义请参阅 [Kotlin Multiplatform 设置](/docs/reference/koin-core/kmp-setup)。

## Ktor {#ktor}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
}
```

在你的 Ktor 应用程序中安装 Koin 插件：参阅 [Koin for Ktor](/docs/reference/koin-ktor/ktor)。

## 测试 {#testing}

```kotlin
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4) // 或 koin-test-junit5
}
```

对于 Android 插桩测试，请将 `koin-android-test` 添加到 `androidTestImplementation` 中。请参阅[在测试中注入](/docs/reference/koin-test/testing)和 [Android 插桩测试](/docs/reference/koin-android/instrumented-testing)。

## 所有构件 {id="all-artifacts"}

| 构件 | 平台 | 描述 |
|----------|-----------|-------------|
| `koin-bom` | 所有 | 下方所有构件的物料清单 (BOM) |
| `koin-core` | 所有 | 容器、DSL、作用域、编译器插件 DSL |
| `koin-core-coroutines` | 所有 | 惰性加载模块与后台加载 |
| `koin-core-viewmodel` | 所有 | 面向 Android 和 Compose Multiplatform 的 ViewModel 定义 |
| `koin-annotations` | 所有 | 适用于编译器插件的注解 (`@Singleton`, `@Module`, `@Named`, ...) |
| `koin-android` | Android | Android 上下文、Activity 和 Fragment API、ViewModel |
| `koin-android-compat` | Android | Java 兼容性帮助程序 |
| `koin-androidx-navigation` | Android | 导航图作用域限定的 ViewModel |
| `koin-androidx-workmanager` | Android | WorkManager 集成 |
| `koin-androidx-startup` | Android | AndroidX App Startup 集成 |
| `koin-dagger-bridge` | Android | 从 Koin 中访问 Dagger 组件 |
| `koin-compose` | 所有 Compose 目标 | `koinInject()`、`KoinApplication` 和 Compose 上下文 |
| `koin-compose-viewmodel` | 所有 Compose 目标 | `koinViewModel()` |
| `koin-compose-viewmodel-navigation` | 所有 Compose 目标 | 作用域限定为 Navigation Compose 返回堆栈条目的 ViewModel |
| `koin-compose-navigation3` | 所有 Compose 目标 | Navigation 3 集成 |
| `koin-androidx-compose` | Android | 适用于 Android 的 `koin-compose` 和 `koin-compose-viewmodel` 捆绑包 |
| `koin-androidx-compose-navigation` | Android | 适用于 Android 的 Navigation Compose 2 |
| `koin-ktor` | JVM, JS, Wasm, iOS, macOS (Ktor 服务器目标) | Ktor 服务器插件 |
| `koin-logger-slf4j` | JVM | SLF4J 日志记录器 |
| `koin-test` | 所有 | 测试 API：`KoinTest`、`verify()` |
| `koin-test-coroutines` | JVM | 惰性加载模块的验证 |
| `koin-test-junit4` | JVM | JUnit 4 规则 |
| `koin-test-junit5` | JVM | JUnit 5 扩展程序 |
| `koin-android-test` | Android | 插桩测试帮助程序 |

Koin 编译器插件是 Gradle 插件，而不是库：它拥有自己的版本。请参阅[编译器插件设置](/docs/setup/compiler-plugin)。

## 相关内容 {id="related"}

- [编译器插件设置](/docs/setup/compiler-plugin)：添加编译器插件与编译时检查。
- [设置](/docs/setup)：各平台需要安装的内容。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：依赖项配置就绪后启动容器。
- [教程](/docs/quickstart/kotlin)：在每个平台上构建你的第一个应用。
- [发布版本](/docs/support/releases)：版本及升级说明。