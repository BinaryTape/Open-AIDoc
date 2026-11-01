---
title: 从 KSP 迁移到编译器插件
---

# 从 KSP 迁移到编译器插件

本指南介绍如何将 Koin Annotations 项目从 KSP 处理器（`koin-ksp-compiler`）迁移到 Koin 编译器插件。带有注解的类保持不变：只需调整 Gradle 构建配置、启动 Koin 的方式以及少量导入。有关编译器插件是什么以及其工作原理，请参阅 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)。

## 变更内容 {id="what-changes"}

| 方面 | KSP 处理器 | 编译器插件 |
|--------|---------------|-----------------|
| 处理流程 | KSP，编译前的独立步骤 | 在 Kotlin K2 编译器内部 |
| 生成的文件 | 在 `build/generated/ksp` 中可见 | 无，代码直接在编译器中生成 |
| KMP 设置 | 每个目标一个 KSP 配置 | 所有目标共用一个插件 |
| `koin-annotations` 版本 | 独立版本（`koin-ksp`） | 与 `koin-core` 相同的版本 |
| 启动 Koin | `modules(AppModule().module)` | `startKoin<MyApp>()` |
| 编译时检查 | `KOIN_CONFIG_CHECK` 选项 | 默认开启，检查完整图及调用站点 |
| 状态 | 已弃用 | 积极开发中 |

## 要求 {id="requirements"}

- Kotlin 2.3.20 或更高版本（K2 编译器）。
- Gradle 8 或更高版本。
- Koin 4.2 或更高版本。

## 第 1 步：更新 Kotlin {id="step-1-update-kotlin"}

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20"
}
```

## 第 2 步：更新版本目录 {id="step-2-update-the-version-catalog"}

迁移前（KSP）：

```toml
[versions]
koin = "4.0.0"
koin-ksp = "2.0.0"
ksp = "2.0.0-1.0.22"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin-ksp" }
koin-ksp-compiler = { module = "io.insert-koin:koin-ksp-compiler", version.ref = "koin-ksp" }

[plugins]
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

迁移后（编译器插件）：

```toml
[versions]
koin = "4.2.0"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

`koin-annotations` 现已成为 Koin 主项目的一部分，并采用与 `koin-core` 相同的版本。请在 [Compiler Plugin Setup](/docs/setup/compiler-plugin) 中查看最新的插件版本。

## 第 3 步：更新构建配置 {id="step-3-update-the-build-configuration"}

迁移前（KSP）：

```kotlin
plugins {
    alias(libs.plugins.ksp)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
    ksp(libs.koin.ksp.compiler)
}

ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

迁移后（编译器插件）：

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}

// 可选
koinCompiler {
    userLogs = true // 记录检测到的组件
}
```

移除 `ksp { }` 代码块：编译时检查默认开启。所有插件选项均在 [Compiler Plugin Options](/docs/reference/koin-annotations/options) 中列出。

### Kotlin Multiplatform {id="kotlin-multiplatform"}

使用 KSP 时，每个目标都需要独立的处理器配置：

```kotlin
dependencies {
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

使用编译器插件时，只需在共享模块中应用一次插件，并移除所有 `ksp...` 条目：

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
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

## 第 4 步：更新 Koin 的启动方式 {id="step-4-update-how-koin-starts"}

KSP 会为每个 `@Module` 类生成一个 `.module` 扩展。编译器插件则没有此类扩展：你需要声明一个 `@KoinApplication` 类，并通过类型化 API 启动它。

迁移前（KSP）：

```kotlin
import org.koin.ksp.generated.*

@Module
@ComponentScan("com.myapp")
class AppModule

fun main() {
    startKoin {
        modules(AppModule().module)
    }
}
```

迁移后（编译器插件）：

```kotlin
import org.koin.plugin.module.dsl.startKoin

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

在 Android 上，可以在 lambda表达式中传递常规选项：

```kotlin
@KoinApplication(modules = [AppModule::class])
class MyApp

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp> {
            androidContext(this@MyApplication)
        }
    }
}
```

其他类型化 API 包括在已有 `startKoin { }` 或测试规则内部使用的 `koinApplication<T>()`、`koinConfiguration<T>()` 和 `withConfiguration<T>()`。如需加载单个模块类，可以在普通的 `startKoin { }` 中使用 `module<AppModule>()`。请参阅 [Starting Koin](/docs/reference/koin-core/starting-koin)。

## 第 5 步：更新导入 {id="step-5-update-imports"}

`@KoinViewModel` 已移至核心注解软件包：

```kotlin
// 迁移前（KSP）
import org.koin.android.annotation.KoinViewModel

// 迁移后（编译器插件）
import org.koin.core.annotation.KoinViewModel
```

移除所有 `import org.koin.ksp.generated.*`。

## 第 6 步：清理并重新构建 {id="step-6-clean-and-rebuild"}

删除 KSP 生成的文件，然后重新构建：

```bash
rm -rf build/generated/ksp
./gradlew clean build
```

首次构建将运行完整的编译时检查。如果存在此前 KSP 未报告的缺失定义，现在会导致构建失败：有关错误信息和 `@Provided` 的详细信息，请参阅 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)。

## 保持不变的部分 {id="what-stays-the-same"}

带有注解的类保持不变：

```kotlin
@Singleton
class UserRepository(private val database: Database)

@Factory
class GetUserUseCase(private val repository: UserRepository)

@KoinViewModel
class UserViewModel(private val useCase: GetUserUseCase) : ViewModel()
```

所有注解均在 [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory) 中列出。

## 迁移后可用的新特性 {id="what-you-can-use-after-migrating"}

以下功能需要编译器插件支持：

- 顶层函数：`@Singleton fun database(): Database` 可以像类一样被 `@ComponentScan` 发现（请参阅 [Definitions](/docs/reference/koin-core/definitions#classes-you-dont-own)）。
- 模块发现：在任何 Gradle 模块中标记为 `@Configuration` 的模块都可以由 `@KoinApplication` 自动加载，而无需显式列出它们。
- 配置标签：`@Configuration("test")` 搭配 `@KoinApplication(configurations = ["test"])` 仅加载带有该标签的模块（请参阅 [Modules](/docs/reference/koin-core/modules)）。
- 编译器插件 DSL：如果你还拥有 DSL 模块，可以将它们切换到编译器插件 DSL：

| 构造函数 / 经典 DSL | 编译器插件 DSL |
|---------------------------|---------------------|
| `singleOf(::MyService)` | `single<MyService>()` |
| `factoryOf(::MyRepository)` | `factory<MyRepository>()` |
| `viewModelOf(::MyViewModel)` | `viewModel<MyViewModel>()` |
| `scopedOf(::MyScoped)` | `scoped<MyScoped>()` |
| `workerOf(::MyWorker)` | `worker<MyWorker>()` |
| `single { build(get()) }` | `single { create(::build) }` |

编译器插件 DSL 位于 `org.koin.plugin.module.dsl`。构造函数 DSL 仍保留在 `org.koin.core.module.dsl`，经典 DSL 仍保留在 `org.koin.dsl`。两者均可继续使用，并会由插件进行检查：无需对其进行迁移。

## 故障排除 {id="troubleshooting"}

### 移除 KSP 后构建失败 {id="the-build-fails-after-removing-ksp"}

过时的生成代码仍存在于类路径中。运行 `./gradlew clean`，删除 `build/generated/ksp`，清除 IDE 缓存，然后重新构建。

### 未检测到带有注解的类 {id="annotated-classes-are-not-detected"}

开启插件日志以查看找到了哪些类：

```kotlin
koinCompiler {
    userLogs = true
}
```

检查 `@ComponentScan` 中的软件包是否与你的类所在的软件包相匹配。

### 运行时缺少依赖项 {id="a-dependency-is-missing-at-runtime"}

- 检查该模块是否已在 `@KoinApplication(modules = [...])` 中列出，或标记为 `@Configuration`。
- 检查 `@ComponentScan` 的软件包路径。
- 对于在 Koin 外部创建的类型，请将其标记为 `@Provided`（请参阅 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)）。

## 核对清单 {id="checklist"}

- [ ] 将 Kotlin 更新至 2.3.20 或更高版本
- [ ] 将 Koin 更新至 4.2.0 或更高版本
- [ ] 移除 KSP 插件
- [ ] 移除 `koin-ksp-compiler` 依赖项以及 `ksp { }` 代码块
- [ ] 为 `koin-annotations` 使用 Koin 主版本（`io.insert-koin:koin-annotations:$koin_version`）
- [ ] 应用 Koin 编译器插件（`io.insert-koin.compiler.plugin`）
- [ ] 将 `@KoinViewModel` 的导入更改为 `org.koin.core.annotation`
- [ ] 创建 `@KoinApplication` 类并将 `modules(X().module)` 替换为 `startKoin<MyApp>()`
- [ ] 移除 `import org.koin.ksp.generated.*`
- [ ] 可选：将 DSL 模块切换到 `org.koin.plugin.module.dsl.*` 和 `single<X>()`
- [ ] 清理并重新构建（`rm -rf build/generated/ksp && ./gradlew clean build`）

## 相关内容 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：安装插件并选择其版本。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：插件检查的内容及其错误代码。
- [Starting Koin](/docs/reference/koin-core/starting-koin)：`startKoin<T>()` 以及其他类型化 API。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options)：所有 Gradle 选项。
- [KSP Processor Setup](/docs/setup/annotations-ksp)：已弃用的 KSP 设置，仅供参考。