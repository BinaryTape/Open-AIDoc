[//]: # (title: 推荐的 Kotlin Multiplatform 项目结构)
<show-structure for="chapter,procedure" depth="3"/>

[基础](multiplatform-discover-project.md)与[进阶](multiplatform-advanced-project-structure.md)项目结构概念的概述应能让您对源集和依赖项管理有所了解。
那么组织源集并依赖这些依赖项的模块又是怎样的呢？

> 本文重点讨论 KMP 项目。
> 有关模块化决策的一般性了解，请参阅 [Android 模块化简介](https://developer.android.com/topic/modularization)。

## 最佳模块结构 {id="optimal-module-structure"}

最佳模块结构可能会因您的目标和所需 Target 而异。
您可以分析具有不同配置和 Target 组合的 KMP IDE 插件向导的输出，了解我们默认是如何组织项目的。

通用方法可概括如下：
* 各应用的入口点应包含在独立的模块中，每个模块分别依赖于所需的共享代码模块。
* 共享代码通常分为业务逻辑和 UI，其策略是避免不必要的依赖项：
  * 如果 KMP 项目生成的所有应用都使用共享 UI 代码以及共享业务逻辑，那么用单个 `shared` 模块存放所有共享代码就足够了。
  * 如果任何一个应用的 UI 是使用原生代码编写的（例如，您使用纯 Swift 实现了 iOS UI），将 UI 代码与业务逻辑分离是合理的做法，以避免在不需要的地方引入 Compose Multiplatform 依赖项。因此，您可以拥有一个 `sharedLogic` 模块和一个 `sharedUI` 模块，并根据需要将它们作为依赖项添加到入口点模块中。
* 如果您的项目包含需要与客户端应用共享逻辑的服务器端代码，推荐的组织结构如下：
  * 包含如上所述组织好的入口点模块和客户端通用代码模块的 `app` 文件夹。
  * 包含服务器特定代码的 `server` 模块。
  * 用于服务器和客户端之间共享代码（如模型和验证）的 `core` 模块。

如果您的项目使用了较旧的结构（应用入口点和共享代码包含在单个模块中），您可以按照以下指南将入口点提取到独立的模块中。

> 如果您打算使用 Android Gradle 插件 9 或更高版本，则必须将 Android 应用入口点与通用代码分离。
> 详情请参阅我们的 [AGP 9 迁移文章](multiplatform-project-agp-9-migration.md)。
> 
{style="note"}

## 为应用入口点创建独立模块 {id="creating-separate-modules-for-app-entry-points"}

我们用于演示向推荐结构过渡的示例项目是一个较旧的 Compose Multiplatform 示例，可在示例仓库的 [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) 分支中找到。

该示例包含一个包含所有共享代码和 KMP 入口点的单个 Gradle 模块（`composeApp`），以及包含 iOS 项目代码和配置的 `iosApp` 文件夹。

要将入口点提取到专属模块中，您需要创建该模块、移动代码，并对新模块和通用代码模块进行相应的配置调整。

### Android 应用入口点模块 {id="android-app"}

#### 创建并配置 Android 应用模块 {id="create-and-configure-the-android-app-module"}

要创建 Android 应用模块（`androidApp`）：

1. 在项目根目录下创建 `androidApp` 目录。
2. 在该目录下创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 在 `settings.gradle.kts` 文件的末尾添加此行，将新模块添加到项目设置中：

    ```kotlin
    include(":androidApp")
    ```
4. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 配置 Android 应用的构建脚本 {id="configure-the-build-script-for-the-android-app"}

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

3. 确保**根** `build.gradle.kts` 文件中提及了所有这些插件：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要添加必要的依赖项，请从 `composeApp` 构建脚本的 `androidMain.dependencies {}` 块中复制现有依赖项，并添加对 `composeApp` 模块本身的依赖。在此示例中，结果应如下所示：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.composeApp)
           implementation(libs.androidx.activity.compose)
           implementation(libs.compose.uiToolingPreview)
       }
   }
   ```

5. 将包含 Android 特定配置的完整 `android {}` 块从 `composeApp/build.gradle.kts` 文件复制到 `androidApp/build.gradle.kts` 文件。

6. 将编译器选项从 `composeApp/build.gradle.kts` 文件的 `androidTarget {}` 块复制到 `androidApp/build.gradle.kts` 文件的 `target {}` 块：

    ```kotlin
    kotlin {
        target {
            compilerOptions {
                jvmTarget.set(JvmTarget.JVM_11)
            }
        }
    }
    ```

   > 如果在 `composeApp` 构建脚本中设置了任何其他插件或属性，请务必也将它们迁移到 `androidApp` 构建脚本中。
   >
   {style="note"}

7. 将 `composeApp` 模块的配置从 Android application 更改为 Android library，因为这正是它实际转变后的形态。在 `composeApp/build.gradle.kts` 中：
   * 更改对 Gradle 插件的引用：

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"/>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"/>
       </compare>

    * 从 `android.defaultConfig {}` 块中移除 application 属性行：

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"/>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"/>
       </compare>

8. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 移动代码并运行 Android 应用 {id="move-the-code-and-run-the-android-app"}

1. 将 `composeApp/src/androidMain` 目录移动到 `androidApp/src/` 目录下，但请牢记应保持跨平台的代码：

   * 入口点代码（例如我们示例中的 `MainActivity.kt`）必须位于 `androidApp` 模块中，才能正确构建 Android 应用。
   * 所有[预期声明和实际声明 (expected and actual declarations)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)必须保留在通用模块（本例中为 `composeApp`）的源集中，以便对所有平台可用。当您设置 `androidApp` 对 `composeApp` 的依赖后，这些声明在入口点代码中也将可用。

2. 将 `androidApp/src/androidMain` 目录重命名为 `main`。
3. 如果一切配置正确，`androidApp/src/main/.../MainActivity.kt` 文件中的导入即可正常工作且代码能够成功编译。
4. 当您使用 IntelliJ IDEA 或 Android Studio 时，IDE 会识别新模块并自动创建新的运行配置 **androidApp**。如果未自动创建，请手动修改 **composeApp** Android 运行配置：
   1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
   2. 在 **Android** 类别下找到 **composeApp** 配置。
   3. 在 **General | Module** 字段中，将 `demo.composeApp` 更改为 `demo.androidApp`。
5. 启动新的运行配置以确保应用按预期运行。
6. 如果一切运行正常，请在 `composeApp/build.gradle.kts` 文件中移除 `kotlin.sourceSets.androidMain.dependencies {}` 块。

您已将 Android 入口点提取到独立模块中。
现在更新通用代码模块以使用新的 Android-KMP 库插件。

### 桌面 JVM 应用 {id="desktop-jvm-app"}

#### 创建并配置桌面应用模块 {id="create-and-configure-the-desktop-app-module"}

要创建桌面应用模块（`desktopApp`）：

1. 在项目根目录下创建 `desktopApp` 目录。
2. 在该目录下创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 在 `settings.gradle.kts` 文件中添加此行，将新模块添加到项目设置中：

    ```kotlin
    include(":desktopApp")
    ```

#### 配置桌面应用的构建脚本 {id="configure-the-build-script-for-the-desktop-app"}

为了让桌面应用构建脚本正常工作：

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

3. 确保**根** `build.gradle.kts` 文件中提及了所有这些插件：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要添加对其他模块的必要依赖项，请从 `composeApp` 构建脚本的 `commonMain.dependencies {}` 和 `jvmMain.dependencies {}` 块中复制现有依赖项。在此示例中，最终结果应如下所示：

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

5. 将包含桌面特定配置的 `compose.desktop {}` 块从 `composeApp/build.gradle.kts` 文件复制到 `desktopApp/build.gradle.kts` 文件：

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

1. 在 `desktopApp/src` 目录下创建一个新的 `main` 目录。
2. 将 `composeApp/src/jvmMain/kotlin` 目录移动到 `desktopApp/src/main/` 目录下：包坐标必须与 `compose.desktop {}` 配置保持一致，这一点非常重要。
3. 如果一切配置正确，`desktopApp/src/main/.../main.kt` 文件中的导入即可正常工作且代码能够成功编译。
4. 要运行桌面应用，请修改 **composeApp [jvm]** 运行配置：
   1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
   2. 在 **Gradle** 类别下找到 **composeApp [jvm]** 配置。
   3. 在 **Gradle project** 字段中，将 `ComposeDemo:composeApp` 更改为 `ComposeDemo:desktopApp`。
5. 启动更新后的配置以确保应用按预期运行。
6. 如果一切运行正常：
   * 删除 `composeApp/src/jvmMain` 目录。
   * 在 `composeApp/build.gradle.kts` 文件中，移除与桌面相关的代码：
       * `compose.desktop {}` 块，
       * Kotlin `sourceSets {}` 块中的 `jvmMain.dependencies {}` 块，
       * `kotlin {}` 块中的 `jvm()` target 声明。

### Web 应用 {id="web-app"}

#### 创建并配置 Web 应用模块 {id="create-and-configure-the-web-app-module"}

要创建 Web 应用模块（`webApp`）：

1. 在项目根目录下创建 `webApp` 目录。
2. 在该目录下创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 在 `settings.gradle.kts` 文件末尾添加此行，将新模块添加到项目设置中：

    ```kotlin
    include(":webApp")
    ```

#### 配置 Web 应用的构建脚本 {id="configure-the-build-script-for-the-web-app"}

为了让 Web 应用构建脚本正常工作：

1. 在 `webApp/build.gradle.kts` 文件中，指定共享 UI 模块所需的插件：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. 确保**根** `build.gradle.kts` 文件中提及了所有这些插件：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. 将 JavaScript 和 Wasm target 声明从 `composeApp/build.gradle.kts` 文件复制到 `webApp/build.gradle.kts` 文件的 `kotlin {}` 块中：

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
   如果一切配置正确，`webApp/src/webMain/.../main.kt` 文件中的导入即可正常工作且代码能够成功编译。
2. 在 `webApp/src/webMain/resources/index.html` 文件中更新脚本名称：从 `composeApp.js` 改为 `webApp.js`。
3. 要运行 Web 应用，请修改 **composeApp [wasmJs]** 运行配置：
    1. 在运行配置下拉菜单中，选择 **Edit Configurations**。
    2. 在 **Gradle** 类别下找到 **composeApp [wasmJs]** 配置。
    3. 在 **Gradle project** 字段中，将 `ComposeDemo:composeApp` 更改为 `ComposeDemo:webApp`。
4. 对 **composeApp [js]** 重复相同的操作，以便也能运行 JavaScript 版本。
5. 启动运行配置以确保应用按预期运行。
6. 如果一切运行正常：
    * 删除 `composeApp/src/webMain` 目录。
    * 在 `composeApp/build.gradle.kts` 文件中，移除与 Web 相关的代码：
        * Kotlin `sourceSets {}` 块中的 `webMain.dependencies {}` 块，
        * `kotlin {}` 块中的 `js {}` 和 `wasmJs {}` target 声明。

### 配置共享模块 {id="configure-the-shared-module"}

在该示例应用中，UI 和业务逻辑代码都进行了共享，因此只需要单个共享模块来容纳所有通用代码：您可以直接将 `composeApp` 重用为通用代码模块。

[//]: # (TODO 有关其他项目配置及其处理方法的概述，请参阅我们关于新推荐项目结构的博文 [链接])

在 Gradle 配置中，唯一与入口点模块连接无关但需要调整的内容是新的 Android Library Gradle 插件。
该新插件专为多平台项目构建，并且是使用 AGP 9 及更高版本所必需的。

以下是所需的更改：

1. 在 `gradle/libs.versions.toml` 中，将 Android-KMP 库插件添加到版本目录中：

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
3. 在根 `build.gradle.kts` 文件中添加以下行，以避免在应用插件时发生冲突：

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
6. 移除 `androidMain` 依赖项（因为所有代码已移至应用模块）：删除 `kotlin.sourceSets.androidMain.dependencies {}` 块。
7. 检查 Android 应用是否按预期运行。

### （可选）分离共享逻辑与共享 UI {collapsible="true" id="optional-separate-shared-logic-and-shared-ui"}

如果项目中的某些 Target 实现了原生 UI，将通用代码分离为 `sharedLogic` 和 `sharedUI` 模块可能是一个好方法，这样具有原生 UI 的应用模块在使用共享代码时就无需依赖 Compose Multiplatform。

以下是基于同一示例应用实现此操作的方法示例。

#### 创建共享逻辑模块 {id="create-a-shared-logic-module"}

在实际创建模块之前，您需要确定哪些属于业务逻辑，即哪些代码同时独立于 UI 和平台。
在此示例中，唯一符合条件的是 `currentTimeAt()` 函数，它会返回特定地点和时区的准确时间。
相比之下，`Country` 数据类依赖于 Compose Multiplatform 的 `DrawableResource`，无法与 UI 代码分离。

> 如果您的项目已经具有一个 `shared` 模块（例如因为您没有共享所有 UI 代码），那么您可以使用此模块来代替 `sharedLogic`。
> 将其重命名以便更清晰地区分共享逻辑与 UI 也是不错的做法。
> 
{style="note"}

将对应代码隔离在 `sharedLogic` 模块中：

1. 在项目根目录下创建 `sharedLogic` 目录。
2. 在该目录下创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 在 `settings.gradle.kts` 文件末尾添加此行，将新模块添加到项目中：

    ```kotlin
    include(":sharedLogic")
    ```
4. 配置新模块的 Gradle 构建脚本。

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
    3. 确保**根** `build.gradle.kts` 文件中提及了这些插件：

       ```kotlin
       plugins {
         alias(libs.plugins.androidMultiplatformLibrary) apply false
         alias(libs.plugins.kotlinMultiplatform) apply false
         // ...
       }
       ```
    4. 在 `sharedLogic/build.gradle.kts` 文件中，指定本例中通用模块应支持的 Target：

        ```kotlin
        kotlin {
            // 无需配置 iOS framework，因为 sharedLogic
            // 不会导出为 framework，只有 'sharedUI' 会导出。
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
    6. 按照为 `composeApp` 声明的方式，为通用（common）和 JavaScript 源集添加所需的时间依赖项：

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

5. 移动开头所确定的业务逻辑代码：
    1. 在 `sharedLogic/src` 下创建 `commonMain/kotlin` 目录。
    2. 在 `commonMain/kotlin` 下创建 `CurrentTime.kt` 文件。
    3. 将 `currentTimeAt` 函数从原来的 `App.kt` 移动到 `CurrentTime.kt`。
6. 使该函数在其新位置上对 `App()` 可组合项可用。
   为此，请在 `composeApp/build.gradle.kts` 文件中声明 `composeApp` 与 `sharedLogic` 之间的依赖关系：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再次运行 **Build | Sync Project with Gradle Files** 以应用更改。
8. 在 `composeApp/commonMain/.../App.kt` 文件中导入 `currentTimeAt()` 函数以修复代码。
9. 运行应用程序以确保新模块正常工作。

您已成功将共享逻辑隔离到独立模块中并实现了跨平台使用。
下一步：创建共享 UI 模块。

#### 创建共享 UI 模块 {id="create-a-shared-ui-module"}

在 `sharedUI` 模块中提取实现通用 UI 元素的共享代码：

1. 在项目根目录下创建 `sharedUI` 目录。
2. 在该目录下创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 在 `settings.gradle.kts` 文件末尾添加此行，将新模块添加到项目中：

    ```kotlin
    include(":sharedUI")
    ```
4. 配置新模块的 Gradle 构建脚本：

    1. 如果您尚未在 `sharedLogic` 模块中执行此操作，请在 `gradle/libs.versions.toml` 中将 Android-KMP 库插件添加到版本目录中：

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

    3. 确保**根** `build.gradle.kts` 文件中提及了所有这些插件：

        ```kotlin
        plugins {
            alias(libs.plugins.androidMultiplatformLibrary) apply false
            alias(libs.plugins.composeMultiplatform) apply false
            alias(libs.plugins.composeCompiler) apply false
            alias(libs.plugins.kotlinMultiplatform) apply false
            // ...
        }
        ```

    4. 在 `kotlin {}` 块中，指定本例中共享 UI 模块应支持的 Target：

        ```kotlin
        kotlin {
            listOf(
                iosArm64(),
                iosSimulatorArm64()
            ).forEach { iosTarget ->
                iosTarget.binaries.framework {
                    // 这是您将在 Swift 代码中导入的
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

    6. 按照为 `composeApp` 声明的方式，为共享 UI 添加所需的依赖项：

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
5. 在 `sharedUI/src` 下创建新的 `commonMain/kotlin` 目录。
6. 将资源文件移动到 `sharedUI` 模块：应将 `composeApp/commonMain/composeResources` 的整个目录迁移到 `sharedUI/commonMain/composeResources`。
7. 在 `sharedUI/src/commonMain/kotlin` 目录下创建一个新的 `App.kt` 文件。
8. 将原 `composeApp/src/commonMain/.../App.kt` 的全部内容复制到新的 `App.kt` 文件中。
9. 暂时注释掉旧 `App.kt` 文件中的所有代码。
   这样可以在彻底删除旧代码之前测试共享 UI 模块是否正常工作。
10. 新的 `App.kt` 文件应该可以按预期工作，除了资源导入，因为它们现在位于不同的包中。
    使用正确的路径重新导入 `Res` 对象和所有可绘制资源，例如：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"/>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"/>
    </compare>
11. 要使新的 `App()` 可组合项对依赖它的应用模块中的入口点可用，请将依赖项添加到对应的 `build.gradle.kts` 文件中：

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
12. 运行应用以检查新模块能否正常为应用入口点提供共享 UI 代码。
13. 移除 `composeApp/src/commonMain/.../App.kt` 文件。

您已成功将跨平台 UI 代码移动到了专用模块中。

### 更新 iOS 集成 {id="update-the-ios-integration"}

由于 iOS 应用入口点不是作为独立的 Gradle 模块构建的，因此您可以将源代码嵌入到任何模块中。
在此示例中，您可以将其保留在 `shared` 中：

1. 将 `composeApp/src/iosMain` 目录移动到 `shared/src` 目录下。
2. 配置 Xcode 项目以使用由 `shared` 模块生成的 framework：
    1. 选择 **File | Open Project in Xcode** 菜单项。
    2. 在 **Project navigator** 工具窗口中点击 **iosApp** 项目，然后选择 **Build Phases** 标签页。
    3. 找到 **Compile Kotlin Framework** 阶段。
    4. 找到以 `./gradlew` 开头的行，并将 `composeApp` 替换为 `sharedUi`：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. 请注意，`ContentView.swift` 文件中的导入需要保持不变，因为它匹配的是 iOS target 的 Gradle 配置中的 `baseName` 参数，而不是模块的实际名称。
       如果您更改了 `shared/build.gradle.kts` 文件中的 framework 名称，则需要相应地更改导入指令。

3. 从 Xcode 运行应用，或者在 IntelliJ IDEA 中使用 **iosApp** 运行配置运行

<!-- ## What's next -->