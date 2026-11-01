---
title: KSP 处理器设置（已弃用）
---

# KSP 处理器设置（已弃用）

本文档记录了 `koin-ksp-compiler` 的 Gradle 设置，该 KSP 处理器曾用于读取 Koin 注解。保留此页面是为了供仍在使用它的项目参考。新项目请使用 [Koin 编译器插件](/docs/setup/compiler-plugin)。

:::warning
`koin-ksp-compiler` 已弃用，并将在未来的 Koin 版本中移除。注解本身并未弃用：`koin-annotations` 是 Koin 主项目的一部分，并由 Koin 编译器插件进行处理。发生变化的仅仅是处理器。请参阅[从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。
:::

## 何时保留 KSP 处理器 {id="when-to-keep-the-ksp-processor"}

仅在以下情况下短期保留它：

- **Kotlin 版本**：您的项目暂时无法升级到 Kotlin 2.3.20 或更高版本（编译器插件的要求）。
- **正在迁移中**：在切换构建方式之前您需要先行发布产品。

与编译器插件相比，KSP 处理器会生成可见的源文件，需要为每个 Kotlin 多平台目标单独配置 KSP，并使用生成的扩展（例如 `AppModule().module`）来启动 Koin。

## Gradle 设置 {id="gradle-setup"}

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

使用 KSP 时，`koin-annotations` 和 `koin-ksp-compiler` 使用的是 Koin Annotations 版本（`$koin_ksp_version`），而非 Koin 版本。使用编译器插件时，`koin-annotations` 则遵循 Koin 的版本。

### 版本兼容性 {id="version-compatibility"}

| Koin Annotations | KSP | Kotlin |
|------------------|-----|--------|
| 1.4 | 1.9 | 1.9 |
| 2.0 | 2.0 | 2.0 |
| 2.1, 2.2 | 2.1, 2.2 | 2.1, 2.2 |
| 2.3 | 2.3 | 独立 |

## 使用生成的模块启动 Koin {id="starting-koin-with-generated-modules"}

KSP 会为每个 `@Module` 类生成一个 `.module` 扩展：

```kotlin
import org.koin.ksp.generated.*

@Single
class MyComponent

@Module
@ComponentScan
class MyModule

fun main() {
    startKoin {
        modules(MyModule().module)
    }
}
```

## 编译时检查 {id="compile-time-check"}

KSP 处理器自带配置检查，可以通过 KSP 参数开启：

```kotlin
// build.gradle.kts
ksp {
    arg("KOIN_CONFIG_CHECK", "true")
}
```

编译器插件则将其替换为对完整图以及每个 `get()` 调用站点的检查。请参阅[编译时安全](/docs/reference/koin-compiler/compile-safety)。

## Kotlin 多平台 {id="kotlin-multiplatform"}

KSP 需要为每个目标配置一次：

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
    add("kspAndroid", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosX64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
    add("kspIosSimulatorArm64", "io.insert-koin:koin-ksp-compiler:$koin_ksp_version")
}
```

使用编译器插件时，您只需应用一次插件并将 `koin-annotations` 添加到 `commonMain` 中即可。

## 迁移到编译器插件 {id="moving-to-the-compiler-plugin"}

迁移过程会完整保留您已添加注解的类。您需要移除 KSP 和 `koin-ksp-compiler`，应用编译器插件，删除生成的源代码，并将 `modules(MyModule().module)` 替换为 `startKoin<MyApp>()`。分步指南请参阅[从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)。

如果遇到困难，请在 [Kotlin Slack #koin 频道](https://kotlinlang.slack.com/messages/koin/)提问，或在 [InsertKoinIO/koin-annotations](https://github.com/InsertKoinIO/koin-annotations) 上提交问题。

## 相关内容 {id="related"}

- [从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)：分步迁移指南。
- [编译器插件设置](/docs/setup/compiler-plugin)：安装替代方案。
- [选择您的风格](/docs/intro/choosing-your-style)：注解与其他风格。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：所有注解的详细参考。