---
title: KSP 注解设置（已弃用）
---

# KSP 注解设置

:::warning
**已弃用**：基于 KSP 的注解处理方式已弃用。请为所有新项目迁移到 [Koin 编译器插件](/docs/setup/compiler-plugin)。
:::

:::info
**您的注解保持不变** - 仅构建设置发生变化。请参阅下方的[迁移指南](#migration-to-compiler-plugin)。
:::

## 为什么迁移？

| 维度 | KSP 注解 | 编译器插件 |
|--------|-----------------|-----------------|
| **生成的文件** | 在 build/ 中可见 | 无 |
| **构建速度** | ⚠️ 更慢 | 更快 |
| **KMP 设置** | ⚠️ 复杂 | 简单 |
| **未来支持** | ⚠️ 已弃用 | ✅ 活跃开发中 |
| **您的代码** | ⚠️ 使用生成的扩展 | 使用 Kotlin 编译器插件专用 API |

## 何时使用 KSP（临时）

仅在以下情况下使用 KSP：
- 停留在 Kotlin 1.x（建议升级）
- 处于迁移中期且尚无法切换
- 有特定的 KSP 要求

## 当前 KSP 设置（参考）

如果必须使用 KSP，设置如下：

### Gradle 设置

```kotlin
// build.gradle.kts
plugins {
    id("com.google.devtools.ksp") version "$ksp_version"
}

dependencies {
    implementation(platform("io.insert-koin:koin-bom:$koin_version"))
    implementation("io.insert-koin:koin-core")
    implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
    ksp("io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

### 版本兼容性

| Koin Annotations | KSP 版本 | Kotlin 版本 |
|------------------|-------------|----------------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1/2.2 | 2.1/2.2 | 2.1/2.2 |
| 2.3 | 2.3 | 独立 |

### 基本用法

```kotlin
@Single
class MyComponent

@Module
class MyModule

// 导入生成的扩展
import org.koin.ksp.generated.*

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

### KSP 选项

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")  // 启用编译时验证
}
```

:::note
这一基于 KSP 的编译时检查将被 **Koin 编译器插件** 中的原生编译时安全性所取代。请参阅[编译器插件](/docs/setup/compiler-plugin)。
:::

### KMP 设置（复杂）

```kotlin
// shared/build.gradle.kts
plugins {
    id("com.google.devtools.ksp")
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("io.insert-koin:koin-core:$koin_version")
            implementation("io.insert-koin:koin-annotations:$koin_ksp_version")
        }
    }
}

dependencies {
    // 需要针对每个平台的 KSP 配置
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

## 迁移到 Koin 编译器插件

### 第 1 步：更新 Kotlin

确保您使用的是 Kotlin 2.3.20+：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1" // 或更高版本
}
```

### 第 2 步：移除 KSP

移除 KSP 插件和依赖项：

```kotlin
// 移除这些：
plugins {
    // id("com.google.devtools.ksp")  // 移除
}

dependencies {
    // ksp("io.insert-koin:koin-ksp-compiler:...")  // 移除
}
```

### 第 3 步：添加编译器插件

请参阅**[编译器插件设置指南](/docs/setup/compiler-plugin)**了解详细说明。

### 第 4 步：保留您的代码

**您的注解完全保持不变 👍**

```kotlin
// 这部分代码不需要更改！
@Singleton
class MyService(val repository: MyRepository)

@Factory
class MyRepository

@KoinViewModel
class MyViewModel(val service: MyService)

@Module
@ComponentScan("com.myapp")
class AppModule
```

### 第 5 步：更新 Koin 启动

使用编译器插件后，**不再使用生成的代码**。将生成的扩展替换为类型化 API：

**之前 (KSP)：**
```kotlin
import org.koin.ksp.generated.*

startKoin {
    modules(AppModule().module)  // 使用生成的扩展
}
```

**之后（编译器插件）：**
```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 使用类型化 API - 无需生成代码！
startKoin<MyApp>()

// 或者配合配置使用
startKoin<MyApp> {
    androidContext(this@MyApplication)
}
```

可用的类型化 API：
- `startKoin<T>()` - 使用应用程序 T 全局启动 Koin
- `koinApplication<T>()` - 使用 T 创建独立的 KoinApplication
- `koinConfiguration<T>()` - 从 T 创建 KoinConfiguration（适用于 Compose KoinApplication、Ktor 等）

其中 `T` 是一个带有 `@KoinApplication` 注解的类。

### 第 6 步：清理

删除生成的文件：

```bash
rm -rf build/generated/ksp
```

重新构建您的项目。

### 保持不变的内容

| 注解 | 状态 |
|------------|--------|
| `@Singleton` / `@Single` | ✅ 相同 |
| `@Factory` | ✅ 相同 |
| `@Scoped` | ✅ 相同 |
| `@KoinViewModel` | ✅ 相同 |
| `@KoinWorker` | ✅ 相同 |
| `@Named` | ✅ 相同 |
| `@InjectedParam` | ✅ 相同 |
| `@Property` | ✅ 相同 |
| `@Module` | ✅ 相同 |
| `@ComponentScan` | ✅ 相同 |
| `@Configuration` | ✅ 相同 |

### 发生变化的内容

| 维度 | KSP | 编译器插件 |
|--------|-----|-----------------|
| 构建插件 | `com.google.devtools.ksp` | `io.insert-koin.compiler.plugin` |
| 依赖项 | `ksp()` 配置 | 无需 |
| 生成的文件 | 在 `build/` 中可见 | 无 |
| Koin 启动 | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| KMP 设置 | 每个平台的 KSP | 仅需插件 |

## 时间表

:::warning
KSP 注解将在未来的 Koin 版本中移除。我们建议尽快迁移。
:::

## 帮助

如果您在迁移过程中遇到问题：
- 检查 [故障排除](/docs/reference/koin-core/troubleshooting)
- 在 [Slack](https://kotlinlang.slack.com/messages/koin/) 上提问
- 在 [GitHub](https://github.com/InsertKoinIO/koin) 上提交问题

## 下一步

- **[迁移指南](/docs/migration/from-ksp-to-compiler-plugin)** - 逐步迁移到编译器插件
- **[编译器插件设置](/docs/setup/compiler-plugin)** - 完整的设置指南