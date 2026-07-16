[//]: # (title: 更新带有 Android 应用的多平台项目以使用 AGP 9)
<show-structure for="chapter,procedure" depth="3"/>

当与 Android Gradle 插件 (AGP) 9.0 或更高版本配合使用时，
Kotlin Multiplatform Gradle 插件将不再兼容 `com.android.application` 和 `com.android.library` 插件。

要更新您的项目：
* 如果您的 Android 入口点目前在共享代码模块中实现，
  请将其提取到单独的模块中，以避免 Gradle 插件冲突。
* 迁移您的共享代码模块，以使用专门为多平台项目构建的新 [Android-KMP 库插件](https://developer.android.com/kotlin/multiplatform/plugin)。

<video src="https://www.youtube.com/v/m0Cq6J-V_RY" title="将 Kotlin 项目迁移到 Android Gradle 插件 9.0"/>

> Android Studio 从 Otter 3 Feature Drop 2025.2.3 开始支持 AGP 9.0.0。
> IntelliJ IDEA 对 AGP 9.0.0 的支持预计将在 2026 年第一季度提供。
> 
{style="note"}

## 迁移到 Android-KMP 库插件

以前，要在多平台模块中配置 Android 目标，您需要将
KMP 插件 (`org.jetbrains.kotlin.multiplatform`) 
与 
Android 应用程序插件 (`com.android.application`) 或 Android 库插件 (`com.android.library`) 配合使用。

在 AGP 9.0 中，这些插件不再与 KMP 兼容，
因此您需要迁移到专门为 KMP 构建的新 Android-KMP 库插件。

### 如何迁移

有关库的迁移步骤，请参阅 [Android 文档中的指南](https://developer.android.com/kotlin/multiplatform/plugin#migrate)。

要迁移 Android 应用项目，您需要将 Android 入口点和共享代码放在配置正确的独立模块中。
以下是迁移示例应用的通用教程，您可以在其中了解：
* [如何将 Android 应用入口点提取到单独的模块中](#android-app)
* [如何更新共享模块的配置](#configure-the-shared-module-to-use-the-android-kmp-library-plugin)

> 您可以利用我们[准备好的技能](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-agp9-migration/SKILL.md)，将迁移工作交给您选择的 AI 代理。
> 请记住，AI 处理结果并非完全可预测。
>
{style="note"}

### 在 AGP 10 之前启用旧版 API

要让您的项目在短期内与 AGP 9.0 配合工作，您可以手动启用已弃用的 API。
为此，在项目的 `gradle.properties` 文件中，添加以下属性：
`android.enableLegacyVariantApi=true`。

旧版 API 将在 [AGP 10 中被完全移除](https://developer.android.com/build/releases/gradle-plugin-roadmap#agp-10)，
AGP 10 可能会在 2026 年下半年发布。
请确保在此之前完成迁移。

## 示例应用的迁移

您将为迁移准备的示例项目是一个 Compose Multiplatform 应用，它是
[创建您自己的应用程序](compose-multiplatform-new-project.md)
教程的成果。
* 包含需要更新的应用示例位于示例仓库的 [main](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main) 
  分支。
* 应用的最终状态（已隔离 `androidApp`）可在 [new-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/new-project-structure) 
  分支中获得。
  该分支还包含其他平台隔离应用模块的示例。

<!-- When the new structure is implemented in the wizard, this is going to change: 
     following the tutorial will bring you to the new structure already.
     So when the update hits we update with the following:

The sample with an example of older structure is in the [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure)
branch of the sample repository. -->

该示例包含一个包含所有共享代码和 KMP 入口点的单个 Gradle 模块 (`composeApp`)，
以及包含 iOS 特定代码和配置的 `iosApp` 项目。

为了准备 AGP 9.0 迁移，您将：

* 将 [Android 应用入口点提取](#android-app)到单独的 `androidApp` 模块中。
* [重新配置包含共享代码的模块](#configure-the-shared-module-to-use-the-android-kmp-library-plugin) (`composeApp`) 以使用 Android-KMP 库插件。

### Android 应用入口点模块 {id="android-app"}

#### 创建并配置 Android 应用模块

要创建 Android 应用模块 (`androidApp`)：

1. 在项目根目录下创建 `androidApp` 目录。
2. 在该目录下，创建一个空的 `build.gradle.kts` 文件和 `src` 目录。
3. 通过在 `settings.gradle.kts` 文件末尾添加以下行，将新模块添加到项目设置中：

    ```kotlin
    include(":androidApp")
    ```
4. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 为 Android 应用配置构建脚本

为新模块配置 Gradle 构建脚本：

1. 在 `gradle/libs.versions.toml` 文件中，将 Kotlin Android Gradle 插件添加到您的版本目录中：

    ```text
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

3. 确保所有这些插件都已在**根** `build.gradle.kts` 文件中列出：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要添加必要的依赖项，请从 `composeApp` 构建脚本的 `androidMain.dependencies {}` 块中复制现有的依赖项，并添加对 `composeApp` 模块本身的依赖项。
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

5. 将 `composeApp/build.gradle.kts` 文件中包含 Android 特定配置的整个 `android {}` 块复制到 `androidApp/build.gradle.kts` 文件中。 

6. 将 `composeApp/build.gradle.kts` 文件的 `androidTarget {}` 块中的编译器选项复制到
   `androidApp/build.gradle.kts` 文件的 `target {}` 块中：

    ```kotlin
    target {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }
    ```

   > 如果在 `composeApp` 构建脚本中还设置了任何其他插件或属性，
   > 请确保也将这些迁移到 `androidApp` 构建脚本中。
   >
   {style="note"}

7. 将 `composeApp` 模块的配置从 Android 应用程序更改为 Android 库，
   因为这实际上是它现在的角色。在 `composeApp/build.gradle.kts` 中：
   * 更改对 Gradle 插件的引用：

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"></code-block>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"></code-block>
       </compare>
   
    * 从 `android.defaultConfig {}` 块中移除应用程序属性行：

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"></code-block>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"></code-block>
       </compare>
   
8. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。

#### 移动代码并运行 Android 应用

1. 将 `composeApp/src/androidMain` 目录移动到 `androidApp/src/` 目录中，
   但请记住应保持跨平台的代码：
   
   * 入口点代码（例如本示例中的 `MainActivity.kt`）必须位于 `androidApp` 模块中，以便正确构建 Android 应用。
   * 所有 [expected 和 actual 声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
     必须保留在公共模块（在本示例中为 `composeApp`）的源集中，以便对所有平台可用。
     当您设置 `androidApp` 对 `composeApp` 的依赖关系后，这些声明在入口点代码中也将可用。
   
2. 将 `androidApp/src/androidMain` 目录重命名为 `main`。
3. 如果一切配置正确，`androidApp/src/main/.../MainActivity.kt` 文件中的导入将正常工作且代码可以编译。
4. 当您使用 IntelliJ IDEA 或 Android Studio 时，IDE 会识别新模块并自动创建一个新的运行配置 **androidApp**。
   如果未发生这种情况，请手动修改 **composeApp** Android 运行配置：
   1. 在运行配置下拉列表中，选择 **Edit Configurations**。
   2. 在 **Android** 类别中找到 **composeApp** 配置。
   3. 在 **General | Module** 字段中，将 `demo.composeApp` 更改为 `demo.androidApp`。
5. 启动新的运行配置以确保应用按预期运行。
6. 如果一切运行正常，在 `composeApp/build.gradle.kts` 文件中移除 `kotlin.sourceSets.androidMain.dependencies {}` 块。

您已将 Android 入口点提取到单独的模块中。
现在更新公共代码模块以使用新的 Android-KMP 库插件。 

### 配置共享模块以使用 Android-KMP 库插件

为了简单地提取 Android 入口点，您为共享的 `composeApp` 模块应用了 `com.android.library` 插件。
现在迁移到新的多平台库插件：

1. 在 `gradle/libs.versions.toml` 中，
   将 Android-KMP 库插件添加到您的版本目录中：

    ```text
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. 在 `composeApp/build.gradle.kts` 文件中，将旧的 Android 库插件替换为新插件：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            alias(libs.plugins.androidLibrary)"></code-block>
        <code-block lang="kotlin" code="            alias(libs.plugins.androidMultiplatformLibrary)"></code-block>
    </compare>
3. 在根 `build.gradle.kts` 文件中，添加以下行以避免在应用插件时发生冲突：

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. 在 `composeApp/build.gradle.kts` 文件中，添加 `kotlin.androidLibrary {}` 块来代替 `kotlin.androidTarget {}` 块：

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. 从 `composeApp/build.gradle.kts` 文件中移除 `android {}` 块，因为它现在已被 `kotlin.androidLibrary {}` 配置取代。
6. 在 `dependencies {}` 块中，将 `debugImplementation(libs.compose.uiTooling)` 行替换为
   `androidRuntimeClasspath(libs.compose.uiTooling)`，因为新的 Android KMP 库插件不
   支持构建变体。
7. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击编辑器中的 Gradle 刷新按钮。
8. 检查 Android 应用是否按预期运行。

### 更新 Android Gradle 插件版本

当您的所有代码都能在新的配置下工作时：

1. 如果您按照说明进行操作，您应该已经有了针对新应用模块的可用运行配置。
      您可以删除与 `composeApp` 模块关联的过时运行配置。
2. 在 `gradle/libs.versions.toml` 文件中，将 AGP 更新为 9.* 版本，例如：

    ```text
    [versions]
    agp = "9.0.0"
    ```
3. 将 `gradle/wrapper/gradle-wrapper.properties` 文件中的 Gradle 版本更新为至少 9.1.0：

    ```text
    distributionUrl=https\://services.gradle.org/distributions/gradle-9.1.0-bin.zip
    ```
4. 从 `androidApp/build.gradle.kts` 文件中移除此行，因为 [Kotlin 支持已内置于 AGP 9.0](https://developer.android.com/build/migrate-to-built-in-kotlin)，
   不再需要应用 Kotlin Android 插件：

    ```kotlin
    alias(libs.plugins.kotlinAndroid)
    ```
5. 在 `composeApp/build.gradle.kts` 文件中更新 `kotlin.androidLibrary {}` 块中的命名空间，
   使其不与应用的命名空间冲突。例如：

    ```kotlin
    kotlin {
        androidLibrary {
            namespace = "compose.project.demo.composedemolibrary"
            // ...
    ```
   
6. 在构建脚本编辑器中选择 **Build | Sync Project with Gradle Files**，或点击 Gradle 刷新按钮。

7. 检查您的应用是否可以使用新的 AGP 版本构建并运行。

恭喜！您已成功升级项目以兼容 AGP 9.0。

<!-- Commented out for now
## 下一步

查看[推荐的项目结构](multiplatform-project-recommended-structure.md)，
它遵循为您可能拥有的任何应用目标分离入口点的逻辑。 -->