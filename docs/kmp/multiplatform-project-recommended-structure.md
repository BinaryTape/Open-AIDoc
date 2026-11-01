[//]: # (title: 推荐的 Kotlin Multiplatform 项目结构)
<show-structure for="chapter,procedure" depth="3"/>

对[基础](multiplatform-discover-project.md)和[高级](multiplatform-advanced-project-structure.md)项目结构概念的概述应该能让你了解源集与依赖项管理。
那么，组织这些源集并依赖这些依赖项的模块又是怎样的呢？

> 本文专门讨论 KMP 项目。
> 有关模块化决策的常规理解，请参阅 [Android 模块化简介](https://developer.android.com/topic/modularization)。

## 最佳模块结构 {id="optimal-module-structure"}

最佳模块结构可能会根据你的目标和所需的目标平台而有所不同。
你可以通过分析使用不同配置和目标平台集的 KMP IDE 插件向导输出，来了解我们默认情况下是如何组织项目的。

常规方法可以概述如下：
* 应用的入口点应包含在单独的模块中，每个模块都依赖于所需的共享代码模块。
* 共享代码通常分为业务逻辑和 UI，其策略是避免不必要的依赖项：
  * 如果 KMP 项目生成的所有应用都使用共享的 UI 代码以及共享的业务逻辑，
    那么一个包含所有共享代码的单个 `shared` 模块就足够了。
  * 如果其中任何一个应用的 UI 是使用原生代码编写的（例如，你使用纯 Swift 实现了 iOS UI），
    那么将 UI 代码与业务逻辑分离是有意义的，以避免在不需要的地方引入 Compose Multiplatform 依赖项。
    因此，你可以拥有一个 `sharedLogic` 和一个 `sharedUI` 模块，并根据需要将它们作为依赖项添加到入口点模块中。
* 如果你的项目包含应与客户端应用共享逻辑的服务器端代码，推荐的结构组织方式为：
  * 一个包含按上述方式组织的入口点模块和客户端通用代码模块的 `app` 文件夹。
  * 一个包含服务器特定代码的 `server` 模块。
  * 一个用于服务器和客户端之间共享代码（例如模型和验证）的 `core` 模块。

如果你的项目使用的是较旧的结构，即应用入口点和共享代码包含在单个模块中，
你可以按照以下指南将入口点提取到单独的模块中。

> 如果你打算使用 Android Gradle 插件 9 或更高版本，则必须将 Android 应用入口点与通用代码分开。
> 有关详细信息，请参阅我们的 [AGP 9 迁移指南](multiplatform-project-agp-9-migration.md)。
> 
{style="note"}

## 为应用入口点创建单独的模块 {id="creating-separate-modules-for-app-entry-points"}

我们将用来演示如何过渡到推荐结构的示例项目是一个较旧的 Compose Multiplatform 示例，
可以在示例仓库的 [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure)
分支中找到。

该示例包含一个包含所有共享代码和 KMP 入口点的单个 Gradle 模块（`composeApp`），
以及包含 iOS 项目代码和配置的 `iosApp` 文件夹。

要将入口点提取到其自己的模块中，你需要创建该模块、移动代码，并相应地调整新模块和通用代码模块的配置。

### Android 应用入口点模块 {id="android-app"}

#### 创建并配置 Android 应用模块 {id="create-and-configure-the-android-app-module"}

要创建 Android 应用模块（`androidApp`）：

1. 在项目根目录下创建 `androidApp` 目录。
2. 在该目录下，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在文件末尾添加以下行，将新模块添加到 `settings.gradle.kts` 文件中的项目设置中：

    ```kotlin
    include(":androidApp")
    ```
4. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 为 Android 应用配置构建脚本 {id="configure-the-build-script-for-the-android-app"}

为新模块配置 Gradle 构建脚本：

1. 在 `gradle/libs.versions.toml` 文件中，将 Kotlin Android Gradle 插件添加到版本目录（version catalog）中：

    ```toml
    [plugins]
    kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
    ```

2. 在 `androidApp/build.gradle.kts` 文件中，指定 Android 应用模块所需的插件：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinAndroid)
       alias(libs.plugins.androidApplication)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. 确保所有这些插件都已在**根** `build.gradle.kts` 文件中声明：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要添加必要的依赖项，请从 `composeApp` 构建脚本的 `androidMain.dependencies {}` 代码块中复制现有依赖项，
   并添加对 `composeApp` 模块本身的依赖项。
   在此示例中，结果应如下所示：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.composeApp)
           implementation(libs.androidx.activity.compose)
           implementation(libs.compose.uiToolingPreview)
       }
   }
   ```

5. 将带有 Android 特定配置的整个 `android {}` 代码块从 `composeApp/build.gradle.kts`
   文件复制到 `androidApp/build.gradle.kts` 文件。

6. 将编译器选项从 `composeApp/build.gradle.kts` 文件的 `androidTarget {}` 代码块复制到 
   `androidApp/build.gradle.kts` 文件的 `target {}` 代码块中：

    ```kotlin
    kotlin {
        target {
            compilerOptions {
                jvmTarget.set(JvmTarget.JVM_11)
            }
        }
    }
    ```

   > 如果在 `composeApp` 构建脚本中还设置了任何其他插件或属性，
   > 请确保也将它们迁移到 `androidApp` 构建脚本中。
   >
   {style="note"}

7. 将 `composeApp` 模块的配置从 Android 应用程序更改为 Android 库，
   因为它实际上变成了库。在 `composeApp/build.gradle.kts` 中：
   * 更改对 Gradle 插件的引用：

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"/>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"/>
       </compare>

    * 从 `android.defaultConfig {}` 代码块中移除 application 属性行：

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"/>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"/>
       </compare>

8. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 移动代码并运行 Android 应用 {id="move-the-code-and-run-the-android-app"}

1. 将 `composeApp/src/androidMain` 目录移动到 `androidApp/src/` 目录下，
   但请牢记应该保持跨平台的代码：

   * 入口点代码（例如我们示例中的 `MainActivity.kt`）必须位于 `androidApp` 模块中才能正确构建 Android 应用。
   * 所有[期望声明与实际声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
     都必须保留在通用模块（在我们的示例中为 `composeApp`）的源集中，以便对所有平台可用。
     当你设置了 `androidApp` 对 `composeApp` 的依赖项后，这些声明在入口点代码中也将可用。

2. 将 `androidApp/src/androidMain` 目录重命名为 `main`。
3. 如果一切配置正确，`androidApp/src/main/.../MainActivity.kt` 文件中的导入应该能正常工作，
   并且代码能够编译。
4. 使用 IntelliJ IDEA 或 Android Studio 时，IDE 会识别新模块并自动创建一个新的运行配置 **androidApp**。
   如果没有发生这种情况，请手动修改 **composeApp** Android 运行配置：
   1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
   2. 在 **Android** 类别中找到 **composeApp** 配置。
   3. 在 **General | Module** 字段中，将 `demo.composeApp` 更改为 `demo.androidApp`。
5. 启动新的运行配置，确保应用按预期运行。
6. 如果一切正常，请在 `composeApp/build.gradle.kts` 文件中移除 `kotlin.sourceSets.androidMain.dependencies {}` 代码块。

你已将 Android 入口点提取到了单独的模块中。
现在更新通用代码模块以使用新的 Android-KMP 库插件。

### 桌面 JVM 应用 {id="desktop-jvm-app"}

#### 创建并配置桌面应用模块 {id="create-and-configure-the-desktop-app-module"}

要创建桌面应用模块（`desktopApp`）：

1. 在项目根目录下创建 `desktopApp` 目录。
2. 在该目录下，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过添加以下行，将新模块添加到 `settings.gradle.kts` 文件中的项目设置中：

    ```kotlin
    include(":desktopApp")
    ```

#### 为桌面应用配置构建脚本 {id="configure-the-build-script-for-the-desktop-app"}

要使桌面应用构建脚本正常工作：

1. 在 `gradle/libs.versions.toml` 文件中，将 Kotlin JVM Gradle 插件添加到版本目录中：

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

3. 确保所有这些插件都已在**根** `build.gradle.kts` 文件中声明：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要添加对其他模块的必要依赖项，请从 `composeApp` 构建脚本的
   `commonMain.dependencies {}` 和 `jvmMain.dependencies {}` 代码块中复制现有依赖项。
   在此示例中，最终结果应如下所示：

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

5. 将带有桌面特定配置的 `compose.desktop {}` 代码块从 `composeApp/build.gradle.kts`
   文件复制到 `desktopApp/build.gradle.kts` 文件：

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

#### 移动代码并运行桌面应用 {id="move-the-code-and-run-the-desktop-app"}

配置完成后，将桌面应用的代码移动到新目录：

1. 在 `desktopApp/src` 目录下，创建一个新的 `main` 目录。
2. 将 `composeApp/src/jvmMain/kotlin` 目录移动到 `desktopApp/src/main/` 目录下：
   包坐标与 `compose.desktop {}` 配置保持一致非常重要。
3. 如果一切配置正确，`desktopApp/src/main/.../main.kt` 文件中的导入应该能正常工作，
   并且代码能够编译。
4. 要运行桌面应用，请修改 **composeApp [jvm]** 运行配置：
   1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
   2. 在 **Gradle** 类别中找到 **composeApp [jvm]** 配置。
   3. 在 **Gradle project** 字段中，将 `ComposeDemo:composeApp` 更改为 `ComposeDemo:desktopApp`。
5. 启动更新后的配置，确保应用按预期运行。
6. 如果一切正常：
   * 删除 `composeApp/src/jvmMain` 目录。
   * 在 `composeApp/build.gradle.kts` 文件中，移除与桌面相关的代码：
       * `compose.desktop {}` 代码块，
       * Kotlin `sourceSets {}` 代码块内的 `jvmMain.dependencies {}` 代码块，
       * `kotlin {}` 代码块内的 `jvm()` 目标声明。

### Web 应用 {id="web-app"}

#### 创建并配置 Web 应用模块 {id="create-and-configure-the-web-app-module"}

要创建 Web 应用模块（`webApp`）：

1. 在项目根目录下创建 `webApp` 目录。
2. 在该目录下，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在文件末尾添加以下行，将新模块添加到 `settings.gradle.kts` 文件中的项目设置中：

    ```kotlin
    include(":webApp")
    ```

#### 为 Web 应用配置构建脚本 {id="configure-the-build-script-for-the-web-app"}

要使 Web 应用构建脚本正常工作：

1. 在 `webApp/build.gradle.kts` 文件中，指定共享 UI 模块所需的插件：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. 确保所有这些插件都已在**根** `build.gradle.kts` 文件中声明：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. 将 JavaScript 和 Wasm 目标平台声明从 `composeApp/build.gradle.kts` 文件复制到
   `webApp/build.gradle.kts` 文件的 `kotlin {}` 代码块中：

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

#### 移动代码并运行 Web 应用 {id="move-the-code-and-run-the-web-app"}

配置完成后，将 Web 应用的代码移动到新目录：

1. 将整个 `composeApp/src/webMain` 目录移动到 `webApp/src` 目录下。
   如果一切配置正确，`webApp/src/webMain/.../main.kt` 文件中的导入应该能正常工作，
   并且代码能够编译。
2. 在 `webApp/src/webMain/resources/index.html` 文件中更新脚本名称：从 `composeApp.js` 改为 `webApp.js`。
3. 要运行 Web 应用，请修改 **composeApp [wasmJs]** 运行配置：
    1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
    2. 在 **Gradle** 类别中找到 **composeApp [wasmJs]** 配置。
    3. 在 **Gradle project** 字段中，将 `ComposeDemo:composeApp` 更改为 `ComposeDemo:webApp`。
4. 对 **composeApp [js]** 重复此操作，以便也能够运行 JavaScript 版本。
5. 启动运行配置，确保应用按预期运行。
6. 如果一切正常：
    * 删除 `composeApp/src/webMain` 目录。
    * 在 `composeApp/build.gradle.kts` 文件中，移除与 Web 相关的代码：
        * Kotlin `sourceSets {}` 代码块内的 `webMain.dependencies {}` 代码块，
        * `kotlin {}` 代码块内的 `js {}` 和 `wasmJs {}` 目标声明。

### 配置共享模块 {id="configure-the-shared-module"}

在示例应用中，UI 和业务逻辑代码都是共享的，因此它只需要一个单独的共享模块来存放所有通用代码：你可以直接将 `composeApp` 改用为通用代码模块。

[//]: # (TODO 有关其他项目配置及处理方式的概述，请参阅我们关于新推荐项目结构的博文 [link])

在 Gradle 配置中，唯一与入口点模块连接无关且需要调整的内容是新的 Android Library Gradle 插件。
这个新插件专门为多平台项目构建，并且是使用 AGP 9 及更高版本所必需的。

以下是必要的更改：

1. 在 `gradle/libs.versions.toml` 中，
   将 Android-KMP 库插件添加到版本目录中：

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
4. 在 `composeApp/build.gradle.kts` 文件中，添加 `kotlin.androidLibrary {}` 代码块来替代 `kotlin.androidTarget {}` 代码块：

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
5. 从 `composeApp/build.gradle.kts` 文件中移除根 `android {}` 代码块。
6. 移除 `androidMain` 依赖项，因为所有代码都已移动到应用模块：
   删除 `kotlin.sourceSets.androidMain.dependencies {}` 代码块。
7. 检查 Android 应用是否按预期运行。

### （可选）分离共享逻辑与共享 UI {collapsible="true" id="optional-separate-shared-logic-and-shared-ui"}

如果项目中的某些目标平台实现了原生 UI，将通用代码分离为 `sharedLogic` 和 `sharedUI` 模块可能是一个好主意，这样具有原生 UI 的应用模块在使用共享代码时就不需要依赖 Compose Multiplatform。

下面是一个基于同一个示例应用的处理方法示例。

#### 创建共享逻辑模块 {id="create-a-shared-logic-module"}

在实际创建模块之前，你需要确定什么是业务逻辑，哪些代码既独立于 UI 又独立于平台。
在此示例中，唯一的候选是 `currentTimeAt()` 函数，它返回指定地点和时区的精确时间。
相比之下，`Country` 数据类依赖于 Compose Multiplatform 的 `DrawableResource`，无法与 UI 代码分离。

> 如果你的项目已经有一个 `shared` 模块（例如，因为你没有共享所有 UI 代码），
> 那么你可以使用该模块来代替 `sharedLogic`。
> 将其重命名以更清楚地区分共享逻辑与 UI 可能会更好。
> 
{style="note"}

在 `sharedLogic` 模块中隔离相应代码：

1. 在项目根目录下创建 `sharedLogic` 目录。
2. 在该目录下，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在文件末尾添加以下行，将新模块添加到 `settings.gradle.kts`：

    ```kotlin
    include(":sharedLogic")
    ```
4. 为新模块配置 Gradle 构建脚本。

    1. 在 `gradle/libs.versions.toml` 文件中，将 Android-KMP 库插件添加到版本目录中：

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
    3. 确保这些插件已在**根** `build.gradle.kts` 文件中声明：

       ```kotlin
       plugins {
         alias(libs.plugins.androidMultiplatformLibrary) apply false
         alias(libs.plugins.kotlinMultiplatform) apply false
         // ...
       }
       ```
    4. 在 `sharedLogic/build.gradle.kts` 文件中，指定通用模块在此示例中应支持的目标平台：

        ```kotlin
        kotlin {
            // 无需配置 iOS framework，因为 sharedLogic
            // 不会作为 framework 导出，只有 'sharedUI' 会导出。
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
    5. 对于 Android，在 `kotlin {}` 代码块中添加 `androidLibrary {}` 配置以替代 `androidTarget {}` 代码块：

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
    6. 按照为 `composeApp` 声明的方式，为通用和 JavaScript 源集添加必要的时间依赖项：

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
                }
            }
        }
        ```
    7. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

5. 移动开篇所确定的业务逻辑代码：
    1. 在 `sharedLogic/src` 下创建 `commonMain/kotlin` 目录。
    2. 在 `commonMain/kotlin` 内创建 `CurrentTime.kt` 文件。
    3. 将 `currentTimeAt` 函数从原来的 `App.kt` 移动到 `CurrentTime.kt`。
6. 使该函数在其新位置对 `App()` 可组合项（composable）可用。
   为此，请在 `composeApp/build.gradle.kts` 文件中声明 `composeApp` 与 `sharedLogic` 之间的依赖关系：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再次运行 **Build | Sync Project with Gradle Files** 以应用更改。
8. 在 `composeApp/commonMain/.../App.kt` 文件中导入 `currentTimeAt()` 函数以修复代码。
9. 运行应用程序以确保你的新模块正常工作。

你已成功将共享逻辑隔离到单独的模块中并在跨平台中使用。
下一步：创建共享 UI 模块。

#### 创建共享 UI 模块 {id="create-a-shared-ui-module"}

在 `sharedUI` 模块中提取实现通用 UI 元素的共享代码：

1. 在项目根目录下创建 `sharedUI` 目录。
2. 在该目录下，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在文件末尾添加以下行，将新模块添加到 `settings.gradle.kts`：

    ```kotlin
    include(":sharedUI")
    ```
4. 为新模块配置 Gradle 构建脚本：

    1. 如果尚未在 `sharedLogic` 模块中执行此操作，请在 `gradle/libs.versions.toml` 中将 Android-KMP 库插件添加到版本目录中：

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

    3. 确保所有这些插件都已在**根** `build.gradle.kts` 文件中声明：

        ```kotlin
        plugins {
            alias(libs.plugins.androidMultiplatformLibrary) apply false
            alias(libs.plugins.composeMultiplatform) apply false
            alias(libs.plugins.composeCompiler) apply false
            alias(libs.plugins.kotlinMultiplatform) apply false
            // ...
        }
        ```

    4. 在 `kotlin {}` 代码块中，指定共享 UI 模块在此示例中应支持的目标平台：

        ```kotlin
        kotlin {
            listOf(
                iosArm64(),
                iosSimulatorArm64()
            ).forEach { iosTarget ->
                iosTarget.binaries.framework {
                    // 这是你打算在 Swift 代码中导入的
                    // iOS framework 的名称。
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

    5. 对于 Android，在 `kotlin {}` 代码块中添加 `androidLibrary {}` 配置以替代 `androidTarget {}` 代码块：

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

    6. 按照为 `composeApp` 声明的方式，为共享 UI 添加必要的依赖项：

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
5. 在 `sharedUI/src` 内创建一个新的 `commonMain/kotlin` 目录。
6. 将资源文件移动到 `sharedUI` 模块：整个 `composeApp/commonMain/composeResources` 目录应
   重新定位到 `sharedUI/commonMain/composeResources`。
7. 在 `sharedUI/src/commonMain/kotlin` 目录下，创建一个新的 `App.kt` 文件。
8. 将原始 `composeApp/src/commonMain/.../App.kt` 的全部内容复制到新的 `App.kt` 文件中。
9. 临时注释掉旧 `App.kt` 文件中的所有代码。
   这将允许你在完全删除旧代码之前测试共享 UI 模块是否正常工作。
10. 新的 `App.kt` 文件应按预期工作，除了资源导入，因为它们现在位于不同的包中。
    使用正确的路径重新导入 `Res` 对象和所有可绘制资源（drawable resources），例如：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"/>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"/>
    </compare>
11. 要使依赖于它的应用模块的入口点可以使用新的 `App()` 可组合项，
    请将依赖项添加到相应的 `build.gradle.kts` 文件中：

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
12. 运行你的各个应用，检查新模块是否能够正常为应用入口点提供共享 UI 代码。
13. 删除 `composeApp/src/commonMain/.../App.kt` 文件。

你已成功将跨平台 UI 代码移动到了专用模块中。

### 更新 iOS 集成 {id="update-the-ios-integration"}

由于 iOS 应用入口点不是作为单独的 Gradle 模块构建的，因此你可以将源代码嵌入到任何模块中。
在此示例中，你可以将其保留在 `shared` 内：

1. 将 `composeApp/src/iosMain` 目录移动到 `shared/src` 目录中。
2. 配置 Xcode 项目以使用 `shared` 模块生成的 framework：
    1. 选择 **File | Open Project in Xcode** 菜单项。
    2. 点击 **Project navigator** 工具窗口中的 **iosApp** 项目，然后选择 **Build Phases** 标签页。
    3. 找到 **Compile Kotlin Framework** 阶段。
    4. 找到以 `./gradlew` 开头的行，并将 `composeApp` 替换为 `sharedUi`：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. 请注意，`ContentView.swift` 文件中的导入需要保持不变，因为它匹配的是 iOS 目标的 Gradle 配置中的 `baseName` 形参，
       而不是模块的实际名称。
       如果你在 `shared/build.gradle.kts` 文件中更改了 framework 名称，则需要相应地更改导入指令。

3. 从 Xcode 运行应用，或使用 IntelliJ IDEA 中的 **iosApp** 运行配置运行。

<!-- ## What's next -->