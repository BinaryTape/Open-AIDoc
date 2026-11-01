[//]: # (title: 测试 Compose Multiplatform UI)

Compose Multiplatform 中的 UI 测试使用与 Jetpack Compose 测试 API 相同的查找器、断言、操作和匹配器来实现。如果您对它们还不熟悉，在继续阅读本文之前，请先阅读 [Jetpack Compose 指南](https://developer.android.com/jetpack/compose/testing)。

> 该 API 处于[实验性 (Experimental)](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels) 阶段。
> 未来可能会发生变更。
>
{style="warning"}

## Compose Multiplatform 测试与 Jetpack Compose 的区别 {id="how-compose-multiplatform-testing-is-different-from-jetpack-compose"}

Compose Multiplatform 通用测试 API 不依赖 JUnit 的 `TestRule` 类。相反，您需要调用 `runComposeUiTest` 函数，并在 `ComposeUiTest` 接收者上调用测试函数。

不过，基于 JUnit 的 API 适用于[桌面目标](compose-desktop-ui-testing.md)。

## 使用 Compose Multiplatform 编写并运行测试 {id="writing-and-running-tests-with-compose-multiplatform"}

首先，为测试添加源集，并将必要的依赖项添加到模块中。然后，编写并运行示例测试，并尝试对其进行自定义。

### 创建测试源集并将测试库添加到依赖项 {id="create-the-test-source-set-and-add-the-testing-library-to-dependencies"}

为了提供具体的示例，本页中的说明遵循由 [Kotlin Multiplatform 向导](https://kmp.jetbrains.com/) 生成的项目结构。
如果要将测试添加到现有项目中，您可能需要将路径和命令中的 `shared` 替换为您正在测试的模块名称。

当您在 Kotlin Multiplatform 向导中勾选 **Include tests** 选项时，它会生成测试的基本结构，包括 `*Test` 源集。

设置 UI 测试库：
在 `shared/build.gradle.kts` 文件中，将 UI 测试库添加到 `commonTest` 源集的依赖项中。

```kotlin
kotlin {
    //...
    sourceSets {
        // 添加通用测试依赖项
        commonTest.dependencies {
            //...
            implementation("org.jetbrains.compose.ui:ui-test:%org.jetbrains.compose%")
        }

        // 添加桌面测试依赖项
        jvmTest.dependencies { 
            implementation(compose.desktop.currentOs)
        }
    }
}
```

如果需要为 Android 运行插桩（模拟器）测试，请按如下方式修改 Gradle 配置：
   
1. 在 `shared/build.gradle.kts` 文件中，将以下代码添加到 `androidLibrary {}` 块中，以配置插桩测试源集依赖通用测试源集。

   ```kotlin
   kotlin {
       //...
       androidLibrary {
           withDeviceTestBuilder { 
               sourceSetTreeName = "test"
           }
       } 
   }
   ```
   
2. 在 `androidApp/build.gradle.kts` 文件中，将以下代码添加到 `android.defaultConfig {}` 块中，以配置 Android 测试插桩运行程序：

   ```kotlin
   android {
       //...
       defaultConfig {
           //...
           testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
       }
   }
   ```

3. 在 `androidApp/build.gradle.kts` 文件中，在根 `dependencies {}` 块中添加所需的依赖项：

    ```kotlin
    dependencies { 
        androidTestImplementation("androidx.compose.ui:ui-test-junit4-android:%androidx.compose%")
        debugImplementation("androidx.compose.ui:ui-test-manifest:%androidx.compose%")
    }
    ```
4. 在主菜单中选择 **Build | Sync Project with Gradle Files**，或点击构建脚本编辑器中的 Gradle 刷新按钮。

5. 记得为插桩测试创建 `shared/src/androidDeviceTest` 源集。
   即使大部分测试都在 `commonTest` 中，`androidDeviceTest` 目录也应至少包含指向测试将使用的通用 activity 的 `AndroidManifest.xml` 文件：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
        <application>
            <activity
                    android:name="androidx.activity.ComponentActivity"
                    android:exported="true">
                <intent-filter>
                    <action android:name="android.intent.action.MAIN" />
                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
        </application>
    </manifest>
    ```
    {collapsible="true" collapsed-title-line-number="5"}

现在，您可以开始编写并运行 Compose Multiplatform UI 的通用测试了。

### 编写并运行通用测试 {id="write-and-run-common-tests"}

在 `shared/src/commonTest/kotlin/<package>` 目录下，创建一个名为 `ExampleTest.kt` 的文件，并将以下代码复制到其中：

```kotlin
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.v2.runComposeUiTest
import kotlin.test.Test

class ExampleTest {

    @OptIn(ExperimentalTestApi::class)
    @Test
    fun myTest() = runComposeUiTest {
        // 声明模拟 UI 以演示 API 调用
        //
        // 替换为您自己的声明以测试您项目的代码
        setContent {
            var text by remember { mutableStateOf("Hello") }
            Text(
                text = text,
                modifier = Modifier.testTag("text")
            )
            Button(
                onClick = { text = "Compose" },
                modifier = Modifier.testTag("button")
            ) {
                Text("Click me")
            }
        }

        // 使用 Compose Multiplatform 测试 API 的断言与操作测试所声明的 UI
        onNodeWithTag("text").assertTextEquals("Hello")
        onNodeWithTag("button").performClick()
        onNodeWithTag("text").assertTextEquals("Compose")
    }
}
```

运行测试：

<Tabs>
<TabItem title="iOS Simulator">

有两种方式：
* 在 IntelliJ IDEA 中，您可以点击 `myTest()` 函数旁装订区域中的绿色运行图标，选择 **Run | ExampleTest.myTest**，然后选择该测试的 iOS 目标。
* 在终端中运行以下命令：

   ```shell
   ./gradlew :shared:iosSimulatorArm64Test
   ```

</TabItem>
<TabItem title="Android Emulator">

在终端中运行以下命令：

```shell
./gradlew :shared:connectedAndroidTest
```

目前，您无法使用 `android (local)` 测试配置运行通用 Compose Multiplatform 测试，因此 Android Studio 等环境中的装订区域图标将无法发挥作用。

</TabItem>
<TabItem title="Desktop">

有两种方式：
* 点击 `myTest()` 函数旁装订区域中的绿色运行图标，选择 **Run | ExampleTest.myTest**，然后选择 JVM 目标。
* 在终端中运行以下命令：

   ```shell
   ./gradlew :shared:jvmTest
   ```

</TabItem>
<TabItem title="Wasm (headless browser)">

在终端中运行以下命令：

```shell
./gradlew :shared:wasmJsTest
```

</TabItem>
</Tabs>

## 后续步骤 {id="what-s-next"}

现在您已经掌握了 Compose Multiplatform UI 测试的基础知识，您可能希望查看更多与测试相关的资源：
* 有关 Kotlin 多平台项目中测试的总体概述，请参阅[了解基本项目结构](multiplatform-discover-project.md#integration-with-tests)和[测试您的多平台应用](multiplatform-run-tests.md)教程。
* 有关为桌面目标设置和运行基于 JUnit 测试的详细信息，请参阅[使用 JUnit 测试 Compose Multiplatform UI](compose-desktop-ui-testing.md)。
* 有关本地化测试，请参阅[在不同平台上测试区域设置](compose-localization-tests.md#testing-locales-on-different-platforms)。
* Android Studio 文档中的[测试您的应用](https://developer.android.com/studio/test)文章涵盖了 Android Studio 中更高级的测试（包括自动化）。