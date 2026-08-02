[//]: # (title: 针对 Kotlin Multiplatform 的 KSP)
[//]: # (description: 将 KSP 添加到 Kotlin 多平台项目)

在这里，你将学习如何在 Kotlin Multiplatform 项目中使用 Kotlin 符号处理 (KSP)。如需快速入门，请参阅[源仓库](https://github.com/google/ksp/tree/main/examples/multiplatform)中包含多个使用 KSP 的编译目标的多平台项目示例。该示例中的处理器生成了该项目使用的 `Foo` 类。

## 将 KSP 添加到多平台项目

在客户端模块（使用处理器的模块）的 `build.gradle.kts` 文件中，为每个需要进行符号处理的编译目标添加相应的 KSP 处理器依赖项：

```kotlin
dependencies {
  add("ksp<Target>", <processor>)
}
```

* `<Target>` 是你的多平台项目中使用的编译目标之一。 

  > 如需编译目标的完整列表，请参阅 [Multiplatform Gradle DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)和 [Kotlin/Native 支持的编译目标](https://kotlinlang.org/docs/native-target-support.html)。
  >
  {style="tip"}

* `<processor>` 是 Gradle 项目路径。它可以是：

  * 你项目中包含符号处理器逻辑的特定目录：

      ```kotlin
      add("kspJvm", project(":local-processor"))
      ```

  * 外部处理器，例如 Room：

      ```kotlin
      add("kspJvm", "androidx.room:room-compiler:2.6.1")
      ```

> 自 KSP 2 起，通用的 `ksp(...)` 配置已被弃用。请显式配置每个编译目标，以避免在不需要的地方运行处理器。
>
{style="warning"}

### 在单个编译目标中使用多个处理器

你可以向一个编译目标添加多个处理器：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspAndroid", project(":test-processor"))
add("kspAndroid", "androidx.room:room-compiler:2.6.1")
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspAndroid', project(':test-processor'))
add('kspAndroid', 'androidx.room:room-compiler:2.6.1')
```

</tab>
</tabs> 

### 在多个编译目标中使用同一个处理器

你可以向多个编译目标添加同一个处理器：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspIosX64", project(":test-processor"))
add("kspIosArm64", project(":test-processor"))
add("kspIosSimulatorArm64", project(":test-processor"))
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspIosX64', project(':test-processor'))
add('kspIosArm64', project(':test-processor'))
add('kspIosSimulatorArm64', project(':test-processor'))
```

</tab>
</tabs> 

如果你有许多 iOS 编译目标，可以通过循环来避免重复：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
    add(
        "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
        project(":test-processor")
    )
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
kotlin.targets.filter { it.name.startsWith("ios") }.forEach { target ->
    add(
        "ksp${target.name.replaceFirstChar { it.uppercaseChar() }}",
        project(":test-processor")
    )
}
```

</tab>
</tabs>

### 为测试编译配置 KSP

要在测试编译期间运行 KSP，请将处理器添加到相应的测试配置中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspJvmTest", project(":test-processor"))
add("kspJsTest", project(":test-processor"))
add("kspIosX64Test", project(":test-processor"))
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspJvmTest', project(':test-processor'))
add('kspJsTest', project(':test-processor'))
add('kspIosX64Test', project(':test-processor'))
```

</tab>
</tabs> 

对于 Android 主机和设备测试，KSP 会根据相应的源集名称派生配置名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
add("kspAndroidHostTest", project(":test-processor"))
add("kspAndroidDeviceTest", project(":test-processor"))
```

</tab>
<tab title="Groovy" group-key="groovy">

```Groovy
add('kspAndroidHostTest', project(':test-processor'))
add('kspAndroidDeviceTest', project(':test-processor'))
```

</tab>
</tabs>

## 查找 KSP 配置名称

KSP 会根据 Kotlin Multiplatform 源集派生配置名称。要查看模块的 KSP 配置完整列表，请运行：

```Bash
./gradlew :<your-module-name>:dependencies | grep ksp
```

查找与你的目标源集相对应的配置名称。

## 编译与处理

在多平台项目中，Kotlin 为每个编译目标和源集（例如 `main` 和 `test`）创建一个单独的[编译](https://kotlinlang.org/docs/multiplatform/multiplatform-advanced-project-structure.html#compilations)。对于配置了一个或多个 KSP 处理器的每个 Kotlin 编译任务，KSP 都会创建一个相应的符号处理任务。

[示例项目](https://github.com/google/ksp/tree/main/examples/multiplatform)定义了六个编译目标。每个编译目标都有 `main` 和 `test` 编译，从而产生以下编译和符号处理任务：

* **JVM**：`jvmMain` 和 `jvmTest`

* **JS**：`jsMain` 和 `jsTest`

* **LinuxX64**：`linuxX64Main` 和 `linuxX64Test`

* **AndroidNativeX64**：`androidNativeX64Main` 和 `androidNativeX64Test`

* **AndroidNativeArm64**：`androidNativeArm64Main` 和 `androidNativeArm64Test`

* **MingwX64**：`mingwX64Main` 和 `mingwX64Test`

在示例的 `workload/build.gradle.kts` 文件中，为以下配置声明了 KSP 依赖项：

* `kspJvm` 和 `kspJvmTest`
* `kspJs` 和 `kspJsTest`
* `kspAndroidNativeX64` 和 `kspAndroidNativeX64Test`
* `kspAndroidNativeArm64` 和 `kspAndroidNativeArm64Test`
* `kspLinuxX64`
* `kspMingwX64`

KSP 为声明了 KSP 依赖项的每个配置创建一个符号处理任务。在本示例中，该项目至少创建了 12 个 Kotlin 编译任务和 10 个符号处理任务。其余编译没有对应的 KSP 任务，因为没有为它们配置 KSP。