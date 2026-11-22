[//]: # (title: Kotlin 多平台中的 KSP)

<web-summary>了解如何在 Kotlin 多平台项目中配合使用 KSP。</web-summary>

本指南介绍了如何在 Kotlin 多平台（Kotlin Multiplatform）项目中使用 Kotlin 符号处理（Kotlin Symbol Processing，KSP）。
要快速上手，请参阅[多平台示例项目](https://github.com/google/ksp/tree/main/examples/multiplatform)。
该项目在多个目标中使用了 KSP，其处理器会生成一个供该项目使用的 `Foo` 类。

## 为多平台项目添加 KSP {id="add-ksp-to-a-multiplatform-project"}

要将 KSP 添加到客户端模块（使用处理器的模块）：

1. 打开该模块的 `build.gradle(.kts)` 文件。
2. 将 KSP 插件添加到 `plugins {}` 块中：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    // build.gradle.kts

    plugins {
        kotlin("multiplatform") version "%kotlinVersion%"
        id("com.google.devtools.ksp") version "%kspVersion%"
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    // build.gradle

    plugins {
        id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
        id 'com.google.devtools.ksp' version '%kspVersion%'
    }
    ```

    </tab>
    </tabs>

3. 为每个需要符号处理的目标添加处理器依赖项：

    ```kotlin
    dependencies {
        add("ksp<Target>", <processor>)
    }
    ```

    * `<Target>` 是多平台项目中使用的某个目标的名称，首字母大写。例如，对于 `iosArm64` 目标，使用 `kspIosArm64` 配置。

      > 有关目标的完整列表，请参阅[多平台 Gradle DSL 参考文档](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)和 [Kotlin/Native 支持的目标与主机](native-target-support.md)。
      >
      {style="tip"}

    * `<processor>` 是处理器依赖项。它可以是：

      * 项目中包含符号处理器逻辑的模块：

        ```kotlin
        add("kspJvm", project(":local-processor"))
        ```

      * 外部处理器，例如 Room：

        ```kotlin
        add("kspJvm", "androidx.room3:room3-compiler:3.0.3")
        ```

<anchor name="avoid-the-ksp-configuration-on-ksp-1-0-1"/>

> 自 KSP 2.3.12 起，通配型 `ksp(...)` 配置在多平台项目中会导致构建错误。早期版本会将其报告为已弃用。请显式配置每个目标，以避免在不需要的地方运行处理器。
>
{style="warning"}

### 在单个目标中使用多个处理器 {id="use-multiple-processors-in-a-single-target"}

你可以向同一个目标添加多个处理器：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspAndroid", project(":test-processor"))
    add("kspAndroid", "androidx.room3:room3-compiler:3.0.3")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspAndroid', project(':test-processor'))
    add('kspAndroid', 'androidx.room3:room3-compiler:3.0.3')
}
```

</tab>
</tabs>

### 在多个目标中使用同一个处理器 {id="use-the-same-processor-in-multiple-targets"}

你可以将同一个处理器添加到多个目标：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspIosX64", project(":test-processor"))
    add("kspIosArm64", project(":test-processor"))
    add("kspIosSimulatorArm64", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspIosX64', project(':test-processor'))
    add('kspIosArm64', project(':test-processor'))
    add('kspIosSimulatorArm64', project(':test-processor'))
}
```

</tab>
</tabs>

如果拥有多个 iOS 目标，你可以使用循环来避免重复：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
        add(
            "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
            project(":test-processor")
        )
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    kotlin.targets.findAll { it.name.startsWith('ios') }.each { target ->
        add("ksp${target.name.capitalize()}", project(':test-processor'))
    }
}
```

</tab>
</tabs>

### 为测试编译配置 KSP {id="configure-ksp-for-test-compilations"}

要在测试编译期间运行 KSP，请将处理器添加到对应的测试配置中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspJvmTest", project(":test-processor"))
    add("kspJsTest", project(":test-processor"))
    add("kspIosX64Test", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspJvmTest', project(':test-processor'))
    add('kspJsTest', project(':test-processor'))
    add('kspIosX64Test', project(':test-processor'))
}
```

</tab>
</tabs>

对于 Android 主机和设备测试，KSP 会从对应的源集名称派生出配置名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    add("kspAndroidHostTest", project(":test-processor"))
    add("kspAndroidDeviceTest", project(":test-processor"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    add('kspAndroidHostTest', project(':test-processor'))
    add('kspAndroidDeviceTest', project(':test-processor'))
}
```

</tab>
</tabs>

## 查找 KSP 配置名称 {id="find-ksp-configuration-names"}

KSP 会从 Kotlin 多平台源集中派生配置名称。要查看模块的完整 KSP 配置列表，请运行：

```bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

查找与你的目标源集相对应的配置名称。

## 编译与处理 {id="compilation-and-processing"}

在多平台项目中，Kotlin 会为每个目标创建单独的[编译](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)（例如 `main` 和 `test`）。对于配置了一个或多个处理器的每个 Kotlin 编译任务，KSP 都会创建对应的符号处理任务。

[示例项目](https://github.com/google/ksp/tree/main/examples/multiplatform)定义了六个目标。每个目标都有 `main` 和 `test` 编译，生成以下编译和符号处理任务：

* **JVM**：`jvmMain` 和 `jvmTest`
* **JS**：`jsMain` 和 `jsTest`
* **LinuxX64**：`linuxX64Main` 和 `linuxX64Test`
* **AndroidNativeX64**：`androidNativeX64Main` 和 `androidNativeX64Test`
* **AndroidNativeArm64**：`androidNativeArm64Main` 和 `androidNativeArm64Test`
* **MingwX64**：`mingwX64Main` 和 `mingwX64Test`

在该示例的 `workload/build.gradle.kts` 文件中，为以下配置声明了 KSP 依赖项：

* `kspJvm` 和 `kspJvmTest`
* `kspJs` 和 `kspJsTest`
* `kspAndroidNativeX64` 和 `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` 和 `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP 会为每个声明了 KSP 依赖项的配置创建一个符号处理任务。在此示例中，项目至少包含 12 个 Kotlin 编译任务和 10 个符号处理任务。其余编译由于未配置 KSP，因此没有对应的 KSP 任务。

## 另请参阅 {id="see-also"}

* KSP 仓库中的[多平台示例项目](https://github.com/google/ksp/tree/main/examples/multiplatform)。
* [从命令行运行 KSP](ksp-command-line.md#main-class)时各个平台的入口点列表。