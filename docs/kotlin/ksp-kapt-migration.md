[//]: # (title: 从 kapt 迁移到 KSP)

<web-summary>了解如何将 Kotlin 项目中的注解处理器从 kapt 迁移到 KSP。</web-summary>

本指南介绍如何将注解处理器从 [Kotlin 注解处理工具 (kapt)](kapt.md) 迁移到 [Kotlin Symbol Processing (KSP)](ksp-overview.md)。迁移后，你的项目可以充分利用 Kotlin 的语言功能并提升构建性能。

kapt 允许你在 Kotlin 中使用 Java 注解处理器。它会将 Kotlin 源代码转换为 Java“存根 (stub)”，然后在这些存根上运行注解处理器。但是，该过程开销很大，会显著增加构建时间，并且在转换过程中会丢失某些 Kotlin 特有的功能。

相比之下，KSP 是专为 Kotlin 设计的 kapt 替代方案。KSP 通过直接分析 Kotlin 源代码并公开诸如为 null 性 (nullability) 等特定于 Kotlin 的信息，从而减少构建时间。

## 开始之前 {id="before-you-start"}

检查项目中的处理器是否支持 KSP。请参阅[支持的库](ksp-overview.md#supported-libraries)列表或查阅其相关文档。

> KSP 与 kapt 可以并行运行，因此你可以分阶段迁移项目，一次迁移一个库或模块。
>
{style="note"}

## 将 KSP 插件添加到你的项目 {id="add-the-ksp-plugin-to-your-project"}

在项目级 `build.gradle(.kts)` 文件的 `plugins {}` 块中添加 KSP 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    id("com.google.devtools.ksp") version "%kspVersion%" apply false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    id 'com.google.devtools.ksp' version '%kspVersion%' apply false
}
```

</tab>
</tabs>

> 要查找 KSP 的最新版本，请查看 GitHub [Releases](https://github.com/google/ksp/releases)。
>
{style="tip"}

## 在模块中将 kapt 替换为 KSP {id="replace-kapt-with-ksp-in-your-modules"}

找到使用了所需迁移处理器的模块。在该模块的 `build.gradle(.kts)` 文件中：

1. 将 KSP 插件添加到 `plugins {}` 块中：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        id("com.google.devtools.ksp")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'com.google.devtools.ksp'
    }
    ```

    </tab>
    </tabs>

2. 在 `dependencies {}` 块中，将 `kapt` 替换为 `ksp`：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    dependencies {
        implementation("com.google.dagger:dagger:2.48")

        // 替换 kapt("com.google.dagger:dagger-compiler:2.48")
        ksp("com.google.dagger:dagger-compiler:2.48")
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    dependencies {
        implementation 'com.google.dagger:dagger:2.48'

        // 替换 kapt 'com.google.dagger:dagger-compiler:2.48'
        ksp 'com.google.dagger:dagger-compiler:2.48'
    }
    ```

    </tab>
    </tabs>

对于大多数库来说，仅做此替换就足够了。请查看各库的文档，以确认是否需要进行任何其他更改。

## 移除 kapt 插件 {id="remove-the-kapt-plugin"}

将所有处理器迁移到 KSP 后，你便可以安全地从所有 `build.gradle(.kts)` 文件中移除 kapt 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts

plugins {
    // 移除 kapt 插件声明：
    id("org.jetbrains.kotlin.kapt")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle

plugins {
    // 移除 kapt 插件声明：
    id 'org.jetbrains.kotlin.kapt'
}
```

</tab>
</tabs>

删除任何遗留的 kapt 配置，例如 `kapt {}` 块（如果存在）。

## 另请参阅 {id="see-also"}

* 了解如何使用 KSP API [创建自己的处理器](ksp-quickstart.md#create-your-own-processor)。
* 在 [Java 注解处理到 KSP 参考指南](ksp-reference.md)中查找与 Java 注解处理 API 等效的 KSP API。
* 在 [Kotlin Symbol Processing API](ksp-overview.md) 概述中了解 KSP 在编译期间的工作原理。
* 探索 KSP 仓库中的[示例项目](https://github.com/google/ksp/tree/main/examples)。