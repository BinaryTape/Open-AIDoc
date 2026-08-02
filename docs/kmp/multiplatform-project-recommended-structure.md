[//]: # (title: 推荐的 Kotlin Multiplatform 项目结构)
<show-structure for="chapter,procedure" depth="3"/>

对[基础](multiplatform-discover-project.md)与[进阶](multiplatform-advanced-project-structure.md)项目结构概念的概览应该已经让你对源集和依赖项管理有了深入的理解。那么，用于组织源集并依赖这些依赖项的模块又该如何处理呢？

> 本文专门讨论 Kotlin Multiplatform (KMP) 项目。
> 关于模块化决策的一般性理解，请参阅 [Android 模块化简介](https://developer.android.com/topic/modularization)。

## 最佳模块结构

最佳模块结构可能会根据你的目标和必要的平台目标而有所不同。
你可以分析具有不同配置和目标集的 KMP IDE 插件向导的输出，以查看我们默认如何组织项目。

通用方法可以概括如下：
* 应用程序的入口点应包含在独立的模块中，每个模块都依赖于必要的共享代码模块。
* 共享代码通常分为业务逻辑和 UI，其策略是避免不必要的依赖项：
  * 如果由 KMP 项目产生的所有应用都同时使用共享 UI 代码和共享业务逻辑，那么为所有共享代码设置一个单独的 `shared` 模块就足够了。
  * 如果你任何一个应用的 UI 是使用原生代码编写的（例如，你使用纯 Swift 实现了 iOS UI），那么将 UI 代码与业务逻辑分离是有意义的，以避免在不需要的地方引入 Compose Multiplatform 依赖项。
    因此，你可以拥有 `sharedLogic` 和 `sharedUI` 模块，并根据需要将它们作为依赖项添加到入口点模块中。
* 如果你的项目包含应与客户端应用共享逻辑的服务器端代码，推荐的结构方式为：
  * 一个 `app` 文件夹，其中包含入口点模块和按上述方式组织的客户端通用代码模块。
  * 一个 `server` 模块，包含服务器特定的代码。
  * 一个 `core` 模块，用于在服务器和客户端之间共享代码，例如模型和校验。

如果你的项目使用的是旧结构，即应用入口点和共享代码包含在单个模块中，你可以按照下面的指南将入口点提取到独立的模块中。

> 如果你打算使用 Android Gradle Plugin 9 或更高版本，则必须将 Android 应用入口点与通用代码分离。
> 详情请参阅我们的 [AGP 9 迁移文章](multiplatform-project-agp-9-migration.md)。
> 
{style="note"}

## 为应用入口点创建独立模块

我们将用来演示向推荐结构过渡的示例项目是一个旧的 Compose Multiplatform 示例，可以在示例仓库的 [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) 分支中找到。

该示例由一个 Gradle 模块 (`composeApp`) 组成，其中包含所有共享代码和 KMP 入口点，以及包含 iOS 项目代码和配置的 `iosApp` 文件夹。

要将入口点提取到其自己的模块中，你需要创建该模块、移动代码，并相应地调整新模块和通用代码模块的配置。

undefined

### 桌面 JVM 应用

#### 创建并配置桌面应用模块

要创建桌面应用模块 (`desktopApp`)：

1. 在项目根目录下创建 `desktopApp` 目录。
2. 在该目录内，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在 `settings.gradle.kts` 文件中添加此行，将新模块添加到项目设置中：

    ```kotlin
    include(":desktopApp")
    ```

#### 为桌面应用配置构建脚本

要使桌面应用构建脚本生效：

1. 在 `gradle/libs.versions.toml` 文件中，将 Kotlin JVM Gradle 插件添加到你的版本编目中：

    ```toml
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```

2. 在 `desktopApp/build.gradle.kts` 文件中，指定共享 UI 模块所需的插件：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinJvm)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. 确保所有这些插件都在**根** `build.gradle.kts` 文件中提及：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要添加对其他模块的必要依赖项，请从 `composeApp` 构建脚本的 `commonMain.dependencies {}` 和 `jvmMain.dependencies {}` 块中复制现有依赖项。在本示例中，最终结果应如下所示：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.sharedLogic)
           implementation(projects.sharedUI)
           implementation(compose.desktop.currentOs)
           implementation(libs.kotlinx.coroutinesSwing)
       }
   }
   ```

5. 将 `composeApp/build.gradle.kts` 文件中带有桌面特定配置的 `compose.desktop {}` 块复制到 `desktopApp/build.gradle.kts` 文件中：

    ```kotlin
    compose.desktop {
        application {
            mainClass = "compose.project.demo.MainKt"

            nativeDistributions {
                targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
                packageName = "compose.project.demo"
                packageVersion = "1.0.0"
            }
        }
    }
    ```
6. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 移动代码并运行桌面应用

配置完成后，将桌面应用的代码移动到新目录：

1. 在 `desktopApp/src` 目录中，创建一个新的 `main` 目录。
2. 将 `composeApp/src/jvmMain/kotlin` 目录移动到 `desktopApp/src/main/` 目录中：
   确保软件包坐标与 `compose.desktop {}` 配置保持一致非常重要。
3. 如果一切配置正确，`desktopApp/src/main/.../main.kt` 文件中的导入将生效且代码可以编译。
4. 要运行你的桌面应用，请修改 **composeApp [jvm]** 运行配置：
   1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
   2. 在 **Gradle** 类别中找到 **composeApp [jvm]** 配置。
   3. 在 **Gradle project** 字段中，将 `ComposeDemo:composeApp` 更改为 `ComposeDemo:desktopApp`。
5. 启动更新后的配置以确保应用按预期运行。
6. 如果一切运行正常：
   * 删除 `composeApp/src/jvmMain` 目录。
   * 在 `composeApp/build.gradle.kts` 文件中，移除桌面相关的代码：
       * `compose.desktop {}` 块，
       * Kotlin `sourceSets {}` 块内部的 `jvmMain.dependencies {}` 块，
       * `kotlin {}` 块内部的 `jvm()` 目标声明。

### Web 应用

#### 创建并配置 Web 应用模块

要创建 Web 应用模块 (`webApp`)：

1. 在项目根目录下创建 `webApp` 目录。
2. 在该目录内，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在 `settings.gradle.kts` 文件的末尾添加此行，将新模块添加到项目设置中：

    ```kotlin
    include(":webApp")
    ```

#### 为 Web 应用配置构建脚本

要使 Web 应用构建脚本生效：

1. 在 `webApp/build.gradle.kts` 文件中，指定共享 UI 模块所需的插件：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. 确保所有这些插件都在**根** `build.gradle.kts` 文件中提及：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. 将 JavaScript 和 Wasm 目标声明从 `composeApp/build.gradle.kts` 文件复制到 `webApp/build.gradle.kts` 文件的 `kotlin {}` 块中：

    ```kotlin
    kotlin {
        js {
            browser()
            binaries.executable()
        }

        @OptIn(ExperimentalWasmDsl::class)
        wasmJs {
            browser()
            binaries.executable()
        }
    }
    ```

4. 添加对其他模块的必要依赖项：

   ```kotlin
   kotlin {
       sourceSets {
           commonMain.dependencies { 
               implementation(projects.sharedLogic)
               // 提供必要的入口点 API
               implementation(compose.ui)
           }
       }
   }
   ```

5. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 移动代码并运行 Web 应用

配置完成后，将 Web 应用的代码移动到新目录：

1. 将整个 `composeApp/src/webMain` 目录移动到 `webApp/src` 目录中。
   如果一切配置正确，`webApp/src/webMain/.../main.kt` 文件中的导入将生效且代码可以编译。
2. 在 `webApp/src/webMain/resources/index.html` 文件中更新脚本名称：将 `composeApp.js` 更改为 `webApp.js`。
3. 要运行你的 Web 应用，请修改 **composeApp [wasmJs]** 运行配置：
    1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
    2. 在 **Gradle** 类别中找到 **composeApp [wasmJs]** 配置。
    3. 在 **Gradle project** 字段中，将 `ComposeDemo:composeApp` 更改为 `ComposeDemo:webApp`。
4. 对 **composeApp [js]** 重复此操作，以便也能够运行 JavaScript 版本。
5. 启动运行配置以确保应用按预期运行。
6. 如果一切运行正常：
    * 删除 `composeApp/src/webMain` 目录。
    * 在 `composeApp/build.gradle.kts` 文件中，移除 Web 相关的代码：
        * Kotlin `sourceSets {}` 块内部的 `webMain.dependencies {}` 块，
        * `kotlin {}` 块内部的 `js {}` 和 `wasmJs {}` 目标声明。

### 配置共享模块

在示例应用中，UI 和业务逻辑代码都是共享的，因此它只需要一个共享模块来保存所有通用代码：你可以直接将 `composeApp` 改用作通用代码模块。

[//]: # (TODO 有关其他项目配置及其处理方式的概述，请参阅我们关于新推荐项目结构的博客文章 [link])

在 Gradle 配置中，唯一需要调整的且与入口点模块连接无关的内容是新的 Android Library Gradle 插件。
该新插件专为多平台项目构建，是使用 AGP 9 及更高版本所必需的。

以下是必要的更改：

1. 在 `gradle/libs.versions.toml` 中，将 Android-KMP 库插件添加到你的版本编目中：

    ```toml
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. 在 `composeApp/build.gradle.kts` 文件中，添加共享 UI 模块所需的插件：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinMultiplatform)
       alias(libs.plugins.androidMultiplatformLibrary)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```
3. 在根 `build.gradle.kts` 文件中，添加以下行以避免应用插件时发生冲突：

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. 在 `composeApp/build.gradle.kts` 文件中，添加 `kotlin.androidLibrary {}` 块来代替 `kotlin.androidTarget {}` 块：

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget = JvmTarget.JVM_11
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. 从 `composeApp/build.gradle.kts` 文件中移除根 `android {}` 块。
6. 移除 `androidMain` 依赖项，因为所有代码都已移动到应用模块：
   删除 `kotlin.sourceSets.androidMain.dependencies {}` 块。
7. 检查 Android 应用是否按预期运行。

### (可选) 分离共享逻辑和共享 UI {collapsible="true"}

如果项目中的某些目标实现了原生 UI，那么将通用代码分离到 `sharedLogic` 和 `sharedUI` 模块可能是个好主意，这样具有原生 UI 的应用模块就不需要依赖 Compose Multiplatform 即可使用共享代码。

下面是一个基于相同示例应用的实现方法示例。

#### 创建共享逻辑模块

在实际创建模块之前，你需要决定什么是业务逻辑，即哪些代码是 UI 无关且平台无关的。
在这个例子中，唯一的候选者是 `currentTimeAt()` 函数，它返回特定位置和时区的准确时间。
相比之下，`Country` 数据类依赖于来自 Compose Multiplatform 的 `DrawableResource`，无法与 UI 代码分离。

> 如果你的项目已经有一个 `shared` 模块（例如，因为你没有共享所有 UI 代码），那么你可以使用该模块而不是 `sharedLogic`。
> 将其重命名以更清晰地将共享逻辑与 UI 区分开来可能会更好。
> 
{style="note"}

将相应的代码隔离到 `sharedLogic` 模块中：

1. 在项目根目录下创建 `sharedLogic` 目录。
2. 在该目录内，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在文件末尾添加此行，将新模块添加到 `settings.gradle.kts` 中：

    ```kotlin
    include(":sharedLogic")
    ```
4. 为新模块配置 Gradle 构建脚本。

    1. 在 `gradle/libs.versions.toml` 文件中，将 Android-KMP 库插件添加到你的版本编目中：

        ```toml
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. 在 `sharedLogic/build.gradle.kts` 文件中，指定共享逻辑模块所需的插件：

       ```kotlin
       plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
       }
       ```
    3. 确保在**根** `build.gradle.kts` 文件中提及这些插件：

       ```kotlin
       plugins {
         alias(libs.plugins.androidMultiplatformLibrary) apply false
         alias(libs.plugins.kotlinMultiplatform) apply false
         // ...
       }
       ```
    4. 在 `sharedLogic/build.gradle.kts` 文件中，指定该通用模块在本示例中应支持的目标：

        ```kotlin
        kotlin {
            // 不需要 iOS 框架配置，因为 sharedLogic
            // 不会作为框架导出，只有 'sharedUI' 会。
            iosArm64()
            iosSimulatorArm64()
     
            jvm()
     
            js {
                browser()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
            }
        }
        ```
    5. 对于 Android，在 `kotlin {}` 块中添加 `androidLibrary {}` 配置，而不是 `androidTarget {}` 块：

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedLogic"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
        
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
            }
        }
        ```
    6. 以与 `composeApp` 声明相同的方式，为通用源集和 JavaScript 源集添加必要的时间依赖项：

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "2.22.0"))
                }
            }
        }
        ```
    7. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

5. 移动开头确定的业务逻辑代码：
    1. 在 `sharedLogic/src` 中创建一个 `commonMain/kotlin` 目录。
    2. 在 `commonMain/kotlin` 中，创建 `CurrentTime.kt` 文件。
    3. 将 `currentTimeAt` 函数从原来的 `App.kt` 移动到 `CurrentTime.kt`。
6. 使该函数在新位置可供 `App()` Composable 函数使用。
   为此，请在 `composeApp/build.gradle.kts` 文件中声明 `composeApp` 与 `sharedLogic` 之间的依赖关系：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再次运行 **Build | Sync Project with Gradle Files** 以应用更改。
8. 在 `composeApp/commonMain/.../App.kt` 文件中，导入 `currentTimeAt()` 函数以修复代码。
9. 运行应用程序以确保你的新模块功能正常。

你已成功将共享逻辑隔离到独立模块中并实现了跨平台使用。
下一步：创建共享 UI 模块。

#### 创建共享 UI 模块

在 `sharedUI` 模块中提取实现通用 UI 元素的共享代码：

1. 在项目根目录下创建 `sharedUI` 目录。
2. 在该目录内，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在文件末尾添加此行，将新模块添加到 `settings.gradle.kts` 中：

    ```kotlin
    include(":sharedUI")
    ```
4. 为新模块配置 Gradle 构建脚本：

    1. 如果你尚未为 `sharedLogic` 模块执行此操作，请在 `gradle/libs.versions.toml` 中将 Android-KMP 库插件添加到你的版本编目中：

        ```toml
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. 在 `sharedUI/build.gradle.kts` 文件中，指定共享 UI 模块所需的插件：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

    3. 确保在**根** `build.gradle.kts` 文件中提及所有这些插件：

        ```kotlin
        plugins {
            alias(libs.plugins.androidMultiplatformLibrary) apply false
            alias(libs.plugins.composeMultiplatform) apply false
            alias(libs.plugins.composeCompiler) apply false
            alias(libs.plugins.kotlinMultiplatform) apply false
            // ...
        }
        ```

    4. 在 `kotlin {}` 块中，指定共享 UI 模块在此示例中应支持的目标：

        ```kotlin
        kotlin {
            listOf(
                iosArm64(),
                iosSimulatorArm64()
            ).forEach { iosTarget ->
                iosTarget.binaries.framework {
                    // 这是你将在 Swift 代码中
                    // 导入的 iOS 框架的名称。
                    baseName = "sharedUI"
                    isStatic = true
                }
            }
     
            jvm()
     
            js {
                browser()
                binaries.executable()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
                binaries.executable()
            }
        }
        ```

    5. 对于 Android，在 `kotlin {}` 块中添加 `androidLibrary {}` 配置，而不是 `androidTarget {}` 块：

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedUI"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
         
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
       
                // 允许在 Android 应用中使用 Compose Multiplatform 资源
                androidResources {
                    enable = true
                }
            }
        }
        ```

    6. 以与 `composeApp` 相同的方式为共享 UI 添加必要的依赖项：

       ```kotlin
       kotlin {
           sourceSets {
               commonMain.dependencies { 
                   implementation(projects.sharedLogic)
                   implementation(compose.runtime)
                   implementation(compose.foundation)
                   implementation(compose.material3)
                   implementation(compose.ui)
                   implementation(compose.components.resources)
                   implementation(compose.components.uiToolingPreview)
                   implementation(libs.androidx.lifecycle.viewmodelCompose)
                   implementation(libs.androidx.lifecycle.runtimeCompose)
                   implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
               }
           }
       }
       ```
    7. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。
5. 在 `sharedUI/src` 内部创建一个新的 `commonMain/kotlin` 目录。
6. 将资源文件移动到 `sharedUI` 模块：应将 `composeApp/commonMain/composeResources` 的整个目录迁移到 `sharedUI/commonMain/composeResources`。
7. 在 `sharedUI/src/commonMain/kotlin` 目录中，创建一个新的 `App.kt` 文件。
8. 将原 `composeApp/src/commonMain/.../App.kt` 的全部内容复制到新的 `App.kt` 文件中。
9. 暂时注释掉旧 `App.kt` 文件中的所有代码。
   这将允许你在完全删除旧代码之前测试共享 UI 模块是否正常工作。
10. 新的 `App.kt` 文件应按预期工作，除了资源导入，资源现在位于不同的软件包中。
    重新导入 `Res` 对象和所有具有正确路径的可绘制资源，例如：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"/>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"/>
    </compare>
11. 为了让依赖它的应用模块入口点可以使用新的 `App()` Composable 函数，请在相应的 `build.gradle.kts` 文件中添加依赖项：

    ```kotlin
    kotlin {
        sourceSets {
            commonMain.dependencies {
                implementation(projects.sharedUI)
                // ...
            }
        }
    }
    ```
12. 运行你的应用程序，检查新模块是否能正常为应用程序入口点提供共享 UI 代码。
13. 移除 `composeApp/src/commonMain/.../App.kt` 文件。

你已成功将跨平台 UI 代码移动到专用模块中。

### 更新 iOS 集成

由于 iOS 应用入口点不是作为独立的 Gradle 模块构建的，因此你可以将源代码嵌入到任何模块中。
在此示例中，你可以将其留在 `shared` 内部：

1. 将 `composeApp/src/iosMain` 目录移动到 `shared/src` 目录中。
2. 配置 Xcode 项目以使用 `shared` 模块生成的框架：
    1. 选择 **File | Open Project in Xcode** 菜单项。
    2. 在 **Project navigator** 工具窗口中点击 **iosApp** 项目，然后选择 **Build Phases** 选项卡。
    3. 找到 **Compile Kotlin Framework** 阶段。
    4. 找到以 `./gradlew` 开头的行，并将 `composeApp` 替换为 `sharedUi`：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. 请注意，`ContentView.swift` 文件中的导入需要保持不变，因为它匹配的是 iOS 目标的 Gradle 配置中的 `baseName` 参数，而不是模块的实际名称。
       如果你更改了 `shared/build.gradle.kts` 文件中的框架名称，则需要相应地更改导入指令。

3. 从 Xcode 运行应用，或使用 IntelliJ IDEA 中的 **iosApp** 运行配置运行。

<!-- ## 下一步 -->