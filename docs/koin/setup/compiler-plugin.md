---
title: 编译器插件设置
---

# Koin 编译器插件设置

**Koin 编译器插件**是所有新 Kotlin 2.x 项目的推荐方式。它提供了自动装配、编译时安全和更简洁的 DSL 语法。

## 什么是编译器插件？

Koin 编译器插件是一个**原生 Kotlin 编译器插件 (K2)**，它可以：

- 自动检测构造函数依赖项
- 提供编译时分析
- 同时支持 DSL 和注解
- 不生成可见文件

有关功能和优势的详细信息，请参阅 [Koin 编译器插件简介](/docs/setup/compiler-plugin)。

## 要求

- **Kotlin 2.3+**（K2 编译器）
- **Gradle 8.x+**

## 安装

### 步骤 1：将 Koin 添加到版本目录 (Version Catalog)

首先，检查最新版本：
- Koin：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin 编译器插件：[![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

然后，在您的 `gradle/libs.versions.toml` 中：

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### 步骤 2：配置设置

在您的 `settings.gradle.kts` 中：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 步骤 3：应用插件

在您的模块级 `build.gradle.kts` 中：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)  // 用于注解支持
}
```

## 完整示例

### gradle/libs.versions.toml

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### settings.gradle.kts

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

## 使用编译器插件

### DSL 风格

从编译器插件软件包导入：

```kotlin
import org.koin.plugin.module.dsl.*
import org.koin.dsl.module

val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

:::info
编译器插件 DSL 位于软件包 **`org.koin.plugin.module.dsl`** 中。传统的 DSL 仍保留在 `org.koin.dsl` 中。
:::

### 注解风格

在您的类上使用注解：

```kotlin
@Singleton
class Database

@Singleton
class ApiClient

@Singleton
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient
)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule
```

### 使用注解启动 Koin

使用编译器插件时，请使用类型化 API 来启动 Koin —— **无需生成代码**：

```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 使用类型化 API 启动 Koin
startKoin<MyApp>()

// 或者进行额外配置
startKoin<MyApp> {
    androidContext(this@MyApplication)
    printLogger()
}
```

**可用的类型化 API：**

| API | 说明 |
|-----|-------------|
| `startKoin<T>()` | 使用应用程序 T 全局启动 Koin |
| `startKoin<T> { }` | 使用应用程序 T 和配置代码块启动 Koin |
| `koinApplication<T>()` | 使用 T 创建隔离的 KoinApplication |
| `koinConfiguration<T>()` | 从 T 创建 KoinConfiguration（用于 Compose KoinApplication、Ktor 等） |

其中 `T` 是一个带有 `@KoinApplication` 注解的类。

## 配置选项

在您的 `build.gradle.kts` 中配置编译器插件：

```kotlin
koinCompiler {
    userLogs = true
    debugLogs = false
    dslSafetyChecks = true
}
```

### 可用选项

| 选项 | 说明 | 默认值 |
|--------|-------------|---------|
| `userLogs` | 启用组件检测和 DSL/注解处理的日志 | `false` |
| `debugLogs` | 启用插件内部处理的详细调试日志 | `false` |
| `dslSafetyChecks` | 验证 lambda 表达式内部的 `create()` 调用是否为唯一指令 | `true` |

:::tip
在开发期间将 `userLogs = true` 设置为 true，以查看插件检测并处理了哪些组件。
:::

## 编译时安全（即将推出）

Koin 编译器插件将提供**编译时依赖项验证** —— 验证您的所有依赖项是否可以在构建时解析，而不是在运行时失败。

:::note 正在开发中
DSL 和注解的编译时安全目前正在开发中。这将用原生 Kotlin 编译器集成取代基于 KSP 的 `KOIN_CONFIG_CHECK` 选项。
:::

## 多模块项目

对于具有多个 Gradle 模块的项目：

### 库模块

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
// feature/src/main/kotlin/FeatureModule.kt
@Module
@ComponentScan("com.myapp.feature")
class FeatureModule
```

### 应用模块

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/src/main/kotlin/MyModule.kt
@Module
@Configuration
class MyModule

// app/src/main/kotlin/MyApp.kt
@KoinApplication
class MyApp

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp>()
    }
}
```

对主应用程序类使用 `@KoinApplication`，并配合类型化启动 API 使用。

## Kotlin 多平台

编译器插件适用于 KMP 项目：

```kotlin
// shared/build.gradle.kts
plugins {
    id("org.jetbrains.kotlin.multiplatform")
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

## 故障排除

### 未找到插件

确保该插件已包含在您的插件库中：

```kotlin
// settings.gradle.kts
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### Kotlin 版本不匹配

编译器插件需要 Kotlin 2.3.20+。检查您的 Kotlin 版本：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1"  // 需要 2.3.20+
}
```

### 导入错误

确保您从正确的软件包导入：

```kotlin
// 编译器插件 DSL
import org.koin.plugin.module.dsl.*

// 传统 DSL
import org.koin.dsl.*
```

## 迁移

### 从传统 DSL 迁移

1. 添加编译器插件
2. 将导入更新为 `org.koin.plugin.module.dsl.*`
3. 将 `single { Class(get() ...) }` 或 `singleOf(::Class)` 替换为 `single<Class>()`

请参阅[从 DSL 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。

### 从 KSP 注解迁移

1. 移除 KSP 插件和依赖项
2. 添加 Koin 编译器插件
3. 将 `startKoin { modules(...) }` 更新为 `startKoin<MyApp>()`
4. **您的注解保持不变！**

请参阅**[从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)**完整指南。

## 后续步骤

- **[DSL 参考](/docs/reference/koin-core/modules)** —— 完整的 DSL 文档
- **[注解参考](/docs/reference/koin-annotations/modules)** —— 完整的注解文档
- **[启动 Koin](/docs/reference/koin-core/starting-koin)** —— 配置您的应用程序