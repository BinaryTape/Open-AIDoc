[//]: # (title: 源集层次结构)

Kotlin Multiplatform 项目支持分层的源集结构。
这意味着你可以组织中间源集的层次结构，在部分（而非全部）[受支持的目标](multiplatform-dsl-reference.md#targets)之间共享公共代码。使用中间源集有助于你：

* 为某些目标提供特定的 API。例如，一个库可以在针对 Kotlin/Native 目标的中间源集中添加平台专用的 Native API，而不会对 Kotlin/JVM 目标公开。
* 使用针对某些目标的特定 API。例如，你可以充分利用 Kotlin Multiplatform 库为构成中间源集的某些目标所提供的丰富 API。
* 在项目中使用平台相关库。例如，你可以从中间 iOS 源集中访问特定于 iOS 的依赖项。

Kotlin 工具链可确保每个源集只能访问对其编译的所有目标均可用的 API。这可以防止出现例如使用特定于 Windows 的 API 然后将其编译到 macOS，从而导致链接错误或运行时未定义行为的情况。

设置源集层次结构的推荐方式是使用[默认层次结构模板](#default-hierarchy-template)。
该模板涵盖了最常见的用例。如果你有更高级的项目，可以[手动进行配置](#manual-configuration)。
这是一种更底层的做法：它更加灵活，但需要更多的精力与知识积累。

## 默认层次结构模板 {id="default-hierarchy-template"}

Kotlin Gradle 插件内置了默认的[层次结构模板](#see-the-full-hierarchy-template)。
它包含针对一些常见用例预定义的中间源集。
该插件会根据项目中指定的目标自动设置这些源集。

考虑在包含共享代码的项目模块中的以下 `build.gradle(.kts)` 文件：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()
}
```

</TabItem>
</Tabs>

当你在代码中声明 `android`、`iosArm64` 和 `iosSimulatorArm64` 目标时，Kotlin Gradle 插件会从模板中找到合适的共享源集并为你创建它们。生成的层次结构如下所示：

![使用默认层次结构模板的示例](default-hierarchy-example.svg)

彩色源集实际上已创建并存在于项目中，而来自默认模板的灰色源集则被忽略。例如，Kotlin Gradle 插件并未创建 `watchos` 源集，因为项目中没有 watchOS 目标。

如果你添加一个 watchOS 目标（例如 `watchosArm64`），则会创建 `watchos` 源集，并且来自 `apple`、`native` 和 `common` 源集的代码也会编译到 `watchosArm64`。

Kotlin Gradle 插件为默认层次结构模板中的所有源集都提供了类型安全且静态的访问器，因此与[手动配置](#manual-configuration)相比，你可以直接引用它们，而无需使用 `by getting` 或 `by creating` 构造。

如果你尝试在共享模块的 `build.gradle(.kts)` 文件中访问源集而未先声明对应的目标，你将看到一条警告：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
        // Warning: accessing source set without declaring the target
        linuxX64Main { }
    }
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
kotlin {
    android()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
        // Warning: accessing source set without declaring the target
        linuxX64Main { }
    }
}
```

</TabItem>
</Tabs>

> 在此示例中，`apple` 和 `native` 源集仅编译到 `iosArm64` 和 `iosSimulatorArm64` 目标。
> 尽管名称如此，它们仍有权访问完整的 iOS API。
> 对于像 `native` 这样的源集，这可能有些违背直觉，因为你可能会认为在此源集中只能访问对所有原生（Native）目标通用的 API。此行为未来可能会发生更改。
>
{style="note"}

### 额外配置 {id="additional-configuration"}

你可能需要对默认层次结构模板进行调整。如果你之前曾通过 `dependsOn` 调用[手动](#manual-configuration)引入过中间源集，这会取消默认层次结构模板的应用并导致以下警告：

```none
The Default Kotlin Hierarchy Template was not applied to '<project-name>':
Explicit .dependsOn() edges were configured for the following source sets:
[<... names of the source sets with manually configured dependsOn-edges...>]

Consider removing dependsOn-calls or disabling the default template by adding
    'kotlin.mpp.applyDefaultHierarchyTemplate=false'
to your gradle.properties

Learn more about hierarchy templates: https://kotl.in/hierarchy-template
```

要解决此问题，请通过以下方式之一配置你的项目：

* [使用默认层次结构模板替换手动配置](#replacing-a-manual-configuration)
* [在默认层次结构模板中创建额外的源集](#creating-additional-source-sets)
* [修改由默认层次结构模板创建的源集](#modifying-source-sets)

#### 替换手动配置 {id="replacing-a-manual-configuration"}

**情况**。你所有的中间源集目前都已被默认层次结构模板覆盖。

**解决方案**。在共享模块的 `build.gradle(.kts)` 文件中，移除所有手动的 `dependsOn()` 调用以及使用 `by creating` 构造的源集。要查看所有默认源集的列表，请参阅[完整的层次结构模板](#see-the-full-hierarchy-template)。

#### 创建额外的源集 {id="creating-additional-source-sets"}

**情况**。你想要添加默认层次结构模板尚未提供的源集，例如在 macOS 与 JVM 目标之间的源集。

**解决方案**：

1. 在共享模块的 `build.gradle(.kts)` 文件中，通过显式调用 `applyDefaultHierarchyTemplate()` 重新应用该模板。
2. 使用 `dependsOn()` [手动](#manual-configuration)配置额外的源集：

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">

    ```kotlin
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // 再次应用默认层次结构。例如，它将创建 iosMain 源集：
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 创建额外的 jvmAndMacos 源集：
            val jvmAndMacos by creating {
                dependsOn(commonMain.get())
            }
    
            macosArm64Main.get().dependsOn(jvmAndMacos)
            jvmMain.get().dependsOn(jvmAndMacos)
        }
    }
    ```

    </TabItem>
    <TabItem title="Groovy" group-key="groovy">

    ```groovy
    kotlin {
        jvm()
        macosArm64()
        iosArm64()
        iosSimulatorArm64()
    
        // 再次应用默认层次结构。例如，它将创建 iosMain 源集：
        applyDefaultHierarchyTemplate()
    
        sourceSets {
            // 创建额外的 jvmAndMacos 源集：
            jvmAndMacos {
                dependsOn(commonMain.get())
            }
            macosArm64Main {
                dependsOn(jvmAndMacos.get())
            }
            jvmMain {
                dependsOn(jvmAndMacos.get())
            }
        } 
    }
    ```

    </TabItem>
    </Tabs>

#### 修改源集 {id="modifying-source-sets"}

**情况**。你已经拥有与模板生成的源集同名的源集，但在你的项目中它们是在不同的目标集合之间共享的。例如，`nativeMain` 源集仅在桌面特定目标（`linuxX64`、`mingwX64` 和 `macosArm64`）之间共享。

**解决方案**。目前无法直接修改模板源集之间的默认 `dependsOn` 关系。同样重要的是，源集（例如 `nativeMain`）的实现和含义在所有项目中应当保持一致。

但是，你仍然可以执行以下操作之一：

* 根据你的目的寻找不同的源集，无论是在默认层次结构模板中还是手动创建的源集。
* 通过在 `gradle.properties` 文件中添加 `kotlin.mpp.applyDefaultHierarchyTemplate=false` 完全停用该模板，并手动配置所有源集。

> 我们目前正在开发用于创建自定义层次结构模板的 API。这对于层次结构配置与默认模板有显著差异的项目非常有用。
>
> 该 API 尚未就绪，但如果你渴望尝试，可以查看 `applyHierarchyTemplate {}` 块以及 `KotlinHierarchyTemplate.default` 的声明作为示例。请记住，此 API 仍在开发中。它可能尚未经过充分测试，并可能在后续版本中发生变化。
>
{style="tip"}

#### 查看完整的层次结构模板 {initial-collapse-state="collapsed" collapsible="true" id="see-the-full-hierarchy-template"}

当你声明项目编译的目标时，插件会根据指定的目标从模板中挑选共享源集并在项目中创建它们。

![默认层次结构模板](full-template-hierarchy.svg)

> 此示例仅显示项目的生产部分，省略了 `Main` 后缀（例如，使用 `common` 代替 `commonMain`）。但是，对于 `*Test` 源集也是完全一样的。
>
{style="tip"}

## 手动配置 {id="manual-configuration"}

你可以在源集结构中手动引入中间源集。它将保存多个目标之间的共享代码。

例如，如果你想在原生 Linux、Windows 和 macOS 目标（`linuxX64`、`mingwX64` 和 `macosArm64`）之间共享代码，操作步骤如下：

1. 在共享模块的 `build.gradle(.kts)` 文件中，添加中间源集 `myDesktopMain`，用于保存这些目标的共享逻辑。
2. 使用 `dependsOn` 关系建立源集层次结构。将 `commonMain` 与 `myDesktopMain` 相连，然后将 `myDesktopMain` 与每个目标源集相连：

    <Tabs group="build-script">
    <TabItem title="Kotlin" group-key="kotlin">
    
    ```kotlin
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            val myDesktopMain by creating {
                dependsOn(commonMain.get())
            }
    
            linuxX64Main.get().dependsOn(myDesktopMain)
            mingwX64Main.get().dependsOn(myDesktopMain)
            macosArm64Main.get().dependsOn(myDesktopMain)
        }
    }
    ```
    
    </TabItem>
    <TabItem title="Groovy" group-key="groovy">
    
    ```groovy
    kotlin {
        linuxX64()
        mingwX64()
        macosArm64()
    
        sourceSets {
            myDesktopMain {
                dependsOn(commonMain.get())
            }
            linuxX64Main {
                dependsOn(myDesktopMain)
            }
            mingwX64Main {
                dependsOn(myDesktopMain)
            }
            macosArm64Main {
                dependsOn(myDesktopMain)
            }
        }
    }
    ```
    
    </TabItem>
    </Tabs>

生成的层次结构如下所示：

![手动配置的层次结构](manual-hierarchical-structure.svg)

你可以针对以下目标组合使用共享源集：

* JVM 或 Android + Web + Native
* JVM 或 Android + Native
* Web + Native
* JVM 或 Android + Web
* Native

Kotlin 目前不支持针对以下组合共享源集：

* 多个 JVM 目标
* JVM + Android 目标
* 多个 JS 目标

如果你需要从共享 Native 源集中访问特定于平台的 API，IntelliJ IDEA 将帮助你检测可在共享 Native 代码中使用的通用声明。对于其他情况，请使用 Kotlin 的[预期声明与实际声明 (expected and actual declarations)](multiplatform-expect-actual.md) 机制。