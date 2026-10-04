[//]: # (title: 多平台项目结构的高级概念)

本文介绍了 Kotlin 多平台项目结构的高级概念，以及它们如何映射到 Gradle 实现。如果您需要处理 Gradle 构建的底层抽象（配置、任务、发布等），或者正在为 Kotlin 多平台构建开发 Gradle 插件，这些信息将会很有帮助。

在以下情况下，本页面会对您有所帮助：

* 需要在 Kotlin 未为其创建源集的一组目标之间共享代码。
* 想要为 Kotlin 多平台构建开发 Gradle 插件，或者需要处理 Gradle 构建的底层抽象，例如配置、任务、发布等。

> 在深入了解高级概念之前，我们建议先学习[多平台项目结构的基础知识](multiplatform-discover-project.md)。
>
{style="tip"}

理解多平台项目中的依赖管理，关键之一在于区分 Gradle 风格的项目或库依赖与 Kotlin 特有的源集之间的 `dependsOn` 关系：

* `dependsOn` 是通用源集与平台特定源集之间的一种关系，用于支持[源集层次结构](#dependson-and-source-set-hierarchies)以及在多平台项目中通用地共享代码。对于默认源集，该层次结构是自动管理的，但在某些特殊情况下，您可能需要对其进行修改。
* 库和项目依赖大体上像往常一样运作，但要在多平台项目中妥善管理它们，您应该了解 [Gradle 依赖是如何被解析](#dependencies-on-other-libraries-or-projects)为用于编译的细粒度 **源集 → 源集** 依赖的。

## dependsOn 与源集层次结构 {id="dependson-and-source-set-hierarchies"}

通常，您处理的是*依赖*，而不是 *`dependsOn`* 关系。但是，探究 `dependsOn` 对于理解 Kotlin 多平台项目的底层工作原理至关重要。

`dependsOn` 是两个 Kotlin 源集之间特有的 Kotlin 关系。这可以是通用源集与平台特定源集之间的连接，例如当 `jvmMain` 源集依赖于 `commonMain`、`iosArm64Main` 依赖于 `iosMain` 等等。

以 Kotlin 源集 `A` 和 `B` 的常规示例为例。表达式 `A.dependsOn(B)` 指示 Kotlin：

1. `A` 可以观察到来自 `B` 的 API，包括 internal 声明。
2. `A` 可以为 `B` 中的 expected 声明提供 actual 实现。这是充要条件，因为当且仅当 `A` 直接或间接 `A.dependsOn(B)` 时，`A` 才能为 `B` 提供 `actual` 实现。
3. `B` 除了编译到自身的目标之外，还应编译到 `A` 所编译到的所有目标。
4. `A` 继承 `B` 的所有常规依赖。

`dependsOn` 关系创建了一种树状结构，称为源集层次结构。以下是一个典型的移动端开发项目示例，包含 `android`、`iosArm64`（iPhone 设备）以及 `iosSimulatorArm64`（适用于搭载 Apple 芯片的 Mac 的 iPhone 模拟器）：

![DependsOn 树状结构](dependson-tree-diagram.svg){width=700}

箭头表示 `dependsOn` 关系。
这些关系在编译平台二进制文件期间得以保留。Kotlin 正是通过这种方式得知 `iosMain` 应该能看到来自 `commonMain` 的 API，但看不到来自 `iosArm64Main` 的 API：

![编译期间的 DependsOn 关系](dependson-relations-diagram.svg){width=700}

`dependsOn` 关系通过 `KotlinSourceSet.dependsOn(KotlinSourceSet)` 调用进行配置，例如：

```kotlin
kotlin {
    // 目标声明
    sourceSets {
        // 配置 dependsOn 关系的示例
        iosArm64Main.dependsOn(commonMain)
    }
}
```

* 此示例展示了如何在构建脚本中定义 `dependsOn` 关系。但是，Kotlin Gradle 插件默认会创建源集并建立这些关系，因此您无需手动执行此操作。
* 在构建脚本中，`dependsOn` 关系的声明与 `dependencies {}` 块是分开的。这是因为 `dependsOn` 不是常规依赖；相反，它是 Kotlin 源集之间的一种特定关系，用于在不同目标之间共享代码。

您不能使用 `dependsOn` 来声明对已发布的库或其他 Gradle 项目的常规依赖。例如，您无法将 `commonMain` 设置为依赖于 `kotlinx-coroutines-core` 库的 `commonMain`，也无法调用 `commonTest.dependsOn(commonMain)`。

### 声明自定义源集 {id="declaring-custom-source-sets"}

在某些情况下，您可能需要在项目中拥有自定义的中间源集。
假设有一个编译到 JVM、JS 和 Linux 的项目，并且您只想在 JVM 和 JS 之间共享某些源码。
在这种情况下，您应该为这对目标找到一个特定的源集，正如[多平台项目结构的基础知识](multiplatform-discover-project.md)中所述。

Kotlin 不会自动创建这样的源集。这意味着您应该使用 `by creating` 结构手动创建它：

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        // 创建名为 "jvmAndJs" 的源集
        val jvmAndJsMain by creating {
            // …
        }
    }
}
```

但是，Kotlin 仍然不知道如何处理或编译此源集。如果绘制一张图表，该源集将处于孤立状态，并且没有任何目标标签：

![缺失 dependsOn 关系](missing-dependson-diagram.svg){width=700}

要解决此问题，可以通过添加若干 `dependsOn` 关系将 `jvmAndJsMain` 纳入层次结构中：

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        val jvmAndJsMain by creating {
            // 不要忘记添加对 commonMain 的 dependsOn
            dependsOn(commonMain.get())
        }

        jvmMain {
            dependsOn(jvmAndJsMain)
        }

        jsMain {
            dependsOn(jvmAndJsMain)
        }
    }
}
```

在这里，`jvmMain.dependsOn(jvmAndJsMain)` 将 JVM 目标添加到 `jvmAndJsMain`，而 `jsMain.dependsOn(jvmAndJsMain)` 将 JS 目标添加到 `jvmAndJsMain`。

最终的项目结构如下所示：

![最终的项目结构](final-structure-diagram.svg){width=700}

> 手动配置 `dependsOn` 关系会停用默认层次结构模板的自动应用。有关此类情况以及如何处理的更多信息，请参阅[其他配置](multiplatform-hierarchy.md#additional-configuration)。
>
{style="note"}

## 对其他库或项目的依赖 {id="dependencies-on-other-libraries-or-projects"}

在多平台项目中，您可以对已发布的库或另一个 Gradle 项目设置常规依赖。

Kotlin 多平台通常以典型的 Gradle 方式声明依赖项。与 Gradle 类似，您可以：

* 在构建脚本中使用 `dependencies {}` 块。
* 为依赖项选择合适的作用域，例如 `implementation` 或 `api`。
* 引用依赖项：如果它已发布在仓库中，可以通过指定其坐标（例如 `"com.google.guava:guava:32.1.2-jre"`）来引用；如果是同一构建中的 Gradle 项目，可以通过指定其路径（例如 `project(":utils:concurrency")`）来引用。

多平台项目中的依赖配置具有一些特殊之处。每个 Kotlin 源集都有自己的 `dependencies {}` 块。这允许您在平台特定源集中声明平台特定的依赖项：

```kotlin
kotlin {
    // 目标声明
    sourceSets {
        jvmMain.dependencies {
            // 这是 jvmMain 的依赖，因此可以添加特定于 JVM 的依赖项
            implementation("com.google.guava:guava:32.1.2-jre")
        }
    }
}
```

通用依赖要稍微复杂一些。假设一个多平台项目声明了对多平台库（例如 `kotlinx.coroutines`）的依赖：

```kotlin
kotlin {
    android()     // Android
    iosArm64()          // iPhone 设备 
    iosSimulatorArm64() // 适用于搭载 Apple 芯片的 Mac 的 iPhone 模拟器

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
```

依赖解析中有三个重要概念：

1. 多平台依赖会沿着 `dependsOn` 结构向下传递。当您向 `commonMain` 添加依赖时，它会自动添加到直接或间接对 `commonMain` 声明了 `dependsOn` 关系的所有源集中。

   在这种情况下，该依赖确实被自动添加到了所有的 `*Main` 源集中：`iosMain`、`jvmMain`、`iosSimulatorArm64Main` 和 `iosArm64Main`。所有这些源集都从 `commonMain` 源集继承了 `kotlin-coroutines-core` 依赖，因此您无需手动将它复制并粘贴到每个源集中：

   ![多平台依赖的传递](dependency-propagation-diagram.svg){width=700}

   > 传递机制允许您通过选择特定的源集，来指定接收所声明依赖的作用域。例如，如果您希望在 iOS 上使用 `kotlinx.coroutines` 而不在 Android 上使用，则可以仅将此依赖项添加到 `iosMain` 中。
   >
   {style="tip"}

2. 上文中的*源集 → 多平台库*依赖（例如 `commonMain` 对 `org.jetbrians.kotlinx:kotlinx-coroutines-core:1.7.3`）代表依赖解析的中间状态。解析的最终状态始终表示为*源集 → 源集*依赖。

   > 最终的*源集 → 源集*依赖不是 `dependsOn` 关系。
   >
   {style="note"}

   为了推导出细粒度的*源集 → 源集*依赖，Kotlin 会读取与每个多平台库一起发布的源集结构。完成此步骤后，每个库在内部将不再作为一个整体呈现，而是作为其源集的集合来呈现。请参见以下关于 `kotlinx-coroutines-core` 的示例：

   ![源集结构的序列化](structure-serialization-diagram.svg){width=700}

3. Kotlin 获取每个依赖关系，并将其解析为来自依赖项的源集集合。该集合中的每个依赖源集必须具有*兼容的目标*。如果某个依赖源集编译的目标*至少包含*使用方源集所编译的目标，则认为该依赖源集具有兼容的目标。

   以示例项目中的 `commonMain` 编译到 `android`、`iosArm64` 和 `iosSimulatorArm64` 为例：

    * 首先，它解析出对 `kotlinx-coroutines-core.commonMain` 的依赖。这是因为 `kotlinx-coroutines-core` 会编译到所有可能的 Kotlin 目标。因此，其 `commonMain` 也会编译到所有可能的目标，包括所要求的 `android`、`iosArm64` 和 `iosSimulatorArm64`。
    * 其次，`commonMain` 依赖于 `kotlinx-coroutines-core.concurrentMain`。由于 `kotlinx-coroutines-core` 中的 `concurrentMain` 编译到除 JS 之外的所有目标，因此它与使用方项目的 `commonMain` 的目标相匹配。

   然而，来自协程库的 `iosArm64Main` 等源集与使用方的 `commonMain` 不兼容。即使 `iosArm64Main` 编译到了 `commonMain` 的其中一个目标（即 `iosArm64`），它也不会编译到 `android` 或 `iosSimulatorArm64`。

   依赖解析的结果直接影响 `kotlinx-coroutines-core` 中的哪些代码可见：

   ![通用代码中特定于 JVM 的 API 报错](dependency-resolution-error.png){width=700}

### 跨源集对齐通用依赖的版本 {id="aligning-versions-of-common-dependencies-across-source-sets"}

在 Kotlin 多平台项目中，通用源集会被多次编译以生成 klib，并作为每个已配置[编译](multiplatform-configure-compilations.md)的一部分。为了生成一致的二进制文件，每次编译通用代码时都应针对相同版本的多平台依赖进行编译。Kotlin Gradle 插件有助于对齐这些依赖项，确保每个源集的有效依赖版本保持一致。

在上面的示例中，假设您想将 `androidx.navigation:navigation-compose:2.7.7` 依赖项添加到 `androidMain` 源集中。您的项目为 `commonMain` 源集显式声明了 `kotlinx-coroutines-core:1.7.3` 依赖项，但版本为 2.7.7 的 Compose Navigation 库需要 Kotlin 协程 1.8.0 或更高版本。

由于 `commonMain` 和 `androidMain` 是一起编译的，Kotlin Gradle 插件会在两个版本的协程库之间做出选择，并将 `kotlinx-coroutines-core:1.8.0` 应用到 `commonMain` 源集。但是为了使通用代码在所有配置的目标中都能一致地编译，iOS 源集也需要限制为相同的依赖版本。因此 Gradle 也会将 `kotlinx.coroutines-*:1.8.0` 依赖传递给 `iosMain` 源集。

![*Main 源集之间的依赖项对齐](multiplatform-source-set-dependency-alignment.svg){width=700}

依赖项会在 `*Main` 源集与 [`*Test` 源集](multiplatform-discover-project.md#integration-with-tests)之间分别进行对齐。`*Test` 源集的 Gradle 配置包含了 `*Main` 源集的所有依赖项，反之则不然。因此，您可以使用更新版本的库来测试项目，而不会影响主代码。

例如，您的 `*Main` 源集中包含 Kotlin 协程 1.7.3 依赖项，该依赖项被传递到项目中的每个源集。但是，在 `iosTest` 源集中，您决定将版本升级到 1.8.0 以测试库的新版本。根据相同的算法，该依赖项将传递到整个 `*Test` 源集树中，因此每个 `*Test` 源集都将使用 `kotlinx.coroutines-*:1.8.0` 依赖项进行编译。

![测试源集独立于主源集解析依赖项](test-main-source-set-dependency-alignment.svg)

## 编译 {id="compilations"}

与单平台项目相反，Kotlin 多平台项目需要多次启动编译器才能构建所有构建工件。每一次启动编译器都是一次 *Kotlin 编译*。

例如，前面提到的在 Kotlin 编译期间为 iPhone 设备生成二进制文件的方式如下：

![针对 iOS 的 Kotlin 编译](ios-compilation-diagram.svg){width=700}

Kotlin 编译按目标分组。默认情况下，Kotlin 为每个目标创建两个编译：用于生产源码的 `main` 编译，以及用于测试源码的 `test` 编译。

在构建脚本中访问编译的方式类似。首先选择一个 Kotlin 目标，然后访问其内部的 `compilations` 容器，最后根据名称选择所需的编译：

```kotlin
kotlin {
    // 声明并配置 JVM 目标
    jvm {
        val mainCompilation: KotlinJvmCompilation = compilations.getByName("main")
    }
}
```