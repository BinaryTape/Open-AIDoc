[//]: # (title: 让 Android 应用程序在 iOS 上运行 – 教程)

<secondary-label ref="Android Studio"/>

本教程展示如何将现有的 Android 应用程序改造为跨平台应用，使其能够同时在 Android 和 iOS 上运行。
你将能够在同一个地方一次性为 Android 和 iOS 编写代码。

本教程使用了一个[示例 Android 应用程序](https://github.com/Kotlin/kmp-integration-sample)，其中包含用于输入用户名和密码的单个屏幕。凭据会经过验证并保存到内存数据库中。

为了让你的应用程序能够同时在 iOS 和 Android 上运行，
首先需要将部分代码移至共享模块，以实现跨平台。
之后，你将在 Android 应用程序中使用跨平台代码，并在新的 iOS 应用程序中复用相同的代码。

> 如果你还不熟悉 Kotlin Multiplatform，请先了解如何[从头开始创建跨平台应用程序](quickstart.md)。
>
{style="tip"}

## 准备开发环境 {id="prepare-an-environment-for-development"}

1. 按照快速入门中的说明，[配置用于 Kotlin Multiplatform 开发的环境](quickstart.md#set-up-the-environment)。

   > 你需要一台搭载 macOS 的 Mac 来完成本教程中的某些步骤（例如运行 iOS 应用程序）。
   > 这是 Apple 的硬性要求。
   >
   {style="note"}

2. 在 Android Studio 中，从版本控制创建新项目：

   ```text
   https://github.com/Kotlin/kmp-integration-sample
   ```

   `master` 分支包含项目的初始状态——一个简单的 Android 应用程序。
   要查看包含 iOS 应用程序和共享模块的最终状态，请切换到 `final` 分支。
   
3. 切换到 **Project** 视图：

   ![Project 视图](switch-to-project.png){width="513"}

## 实现代码跨平台 {id="make-your-code-cross-platform"}

要实现代码跨平台，请遵循以下步骤：

1. [确定哪些代码需要跨平台](#decide-what-code-to-make-cross-platform)
2. [为跨平台代码创建共享模块](#create-a-shared-module-for-cross-platform-code)
3. [测试代码共享](#add-code-to-the-shared-module)
4. [为 Android 应用程序添加对共享模块的依赖](#add-a-dependency-on-the-shared-module-to-your-android-application)
5. [将业务逻辑改造为跨平台](#make-the-business-logic-cross-platform)
6. [在 Android 上运行跨平台应用程序](#run-your-cross-platform-application-on-android)

### 确定哪些代码需要跨平台 {id="decide-what-code-to-make-cross-platform"}

确定 Android 应用程序中的哪些代码适合与 iOS 共享，哪些代码应保留为原生实现。一个简单的原则是：
尽可能多地共享希望复用的内容。业务逻辑在 Android 和 iOS 上通常是相同的，
因此非常适合复用。

在示例 Android 应用程序中，业务逻辑存储在 `com.jetbrains.simplelogin.androidapp.data` 软件包中。
你未来的 iOS 应用程序也将使用相同的逻辑，因此也应该将其改造为跨平台代码。

![要共享的业务逻辑](business-logic-to-share.png){width=366}

### 为跨平台代码创建共享模块 {id="create-a-shared-module-for-cross-platform-code"}

供 iOS 和 Android 共同使用的跨平台代码将存储在一个共享模块中。
Android Studio 和 IntelliJ IDEA 都提供了用于创建 Kotlin Multiplatform 共享模块的向导。

创建一个共享模块，以同时连接现有的 Android 应用程序和未来的 iOS 应用程序：

1. 在 Android Studio 中，从主菜单中选择 **File** | **New** | **New Module**。
2. 在模板列表中，选择 **Kotlin Multiplatform Shared Module**。
   保持模块名称为 `shared` 不变，并输入软件包名称：
   
   ```text
   com.jetbrains.simplelogin.shared
   ```
   
3. 点击 **Finish**。向导将创建共享模块，相应修改构建脚本，并启动 Gradle 同步。
4. 等待同步完成。
   你将在 `shared` 目录中看到以下文件结构：

   ![shared 目录内部的最终文件结构](shared-directory-structure.png){width="341"}

   如果希望更好地了解生成项目的布局，
   请参阅 [Kotlin Multiplatform 项目结构基础](multiplatform-discover-project.md)。

5. 将 `shared/build.gradle.kts` 中的 `kotlin.android {}` 代码块替换为以下 `androidLibrary {}` 代码块，
   因为 `shared` 模块将作为 Android 应用程序的库使用：

    ```kotlin
    import org.jetbrains.kotlin.gradle.dsl.JvmTarget

    kotlin {
        androidLibrary {
            namespace = "com.jetbrains.simplelogin.shared"
            compileSdk = libs.versions.android.compileSdk.get().toInt()
            compilerOptions {
                jvmTarget = JvmTarget.JVM_11
            }
        
            androidResources {
                enable = true
            }
        
            withHostTestBuilder {
            }
        
            withDeviceTestBuilder {
                sourceSetTreeName = "test"
            }.configure {
                instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
            }
        }
        //...
    }
    ```
   
### 向共享模块添加代码 {id="add-code-to-the-shared-module"}

现在你已经拥有了一个共享模块，
接下来在 `shared/src/commonMain/kotlin/com.jetbrains.simplelogin.shared` 目录中添加一些需要共享的通用代码：

1. 使用以下代码创建一个新的 `Greeting` 类：

    ```kotlin
    package com.jetbrains.simplelogin.shared

    class Greeting {
        private val platform = getPlatform()

        fun greet(): String {
            return "Hello, ${platform.name}!"
        }
    }
    ```

2. 将现有文件中的代码替换为以下内容：

     * 在 `commonMain/Platform.kt` 中：

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         interface Platform {
             val name: String
         }
        
         expect fun getPlatform(): Platform
         ```
     
     * 在 `androidMain/Platform.android.kt` 中：

         ```kotlin
         package com.jetbrains.simplelogin.shared
         
         import android.os.Build

         class AndroidPlatform : Platform {
             override val name: String = "Android ${Build.VERSION.SDK_INT}"
         }

         actual fun getPlatform(): Platform = AndroidPlatform()
         ```
     * 在 `iosMain/Platform.ios.kt` 中：

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         import platform.UIKit.UIDevice

         class IOSPlatform: Platform {
             override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
         }

         actual fun getPlatform(): Platform = IOSPlatform()
         ```

现在你拥有了一个通用的 `getPlatform()` 函数，该函数会返回一个平台特定的对象，其中包含作为属性的平台名称。

### 为 Android 应用程序添加对共享模块的依赖 {id="add-a-dependency-on-the-shared-module-to-your-android-application"}

要在 Android 应用程序中使用跨平台代码，请将共享模块连接到该应用程序，将业务逻辑代码移至该模块中，并将这些代码改造为跨平台代码。

1. 在 `app/build.gradle.kts` 文件中添加对共享模块的依赖：

    ```kotlin
    dependencies {
        // ...
        implementation(project(":shared"))
    }
    ```

2. 按照 IDE 的提示同步 Gradle 文件，或者使用 **File** | **Sync Project with Gradle Files** 菜单项。
3. 在 `app/src/main/java/` 目录中，打开 `com.jetbrains.simplelogin.androidapp.ui.login` 软件包中的 `LoginActivity.kt` 文件。
4. 为了确保共享模块已成功连接到你的应用程序，可以在 `onCreate()` 方法中添加 `Log.i()` 调用，将 `greet()` 函数的结果写入日志：

    ```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        Log.i("Login Activity", "Hello from shared module: " + (Greeting().greet()))
   
        // ...
    }
    ```
5. 按照 IDE 的提示导入缺失的类。
6. 在工具栏中，点击运行配置下拉菜单旁边的调试图标：

   ![从列表中选择要调试的应用](app-list-android.png){width="300"}

7. 在 **Logcat** 工具窗口中，在日志中搜索“Hello”，即可看到来自共享模块的问候语：

   ![来自共享模块的问候语](shared-module-greeting.png){width="700"}

### 将业务逻辑改造为跨平台 {id="make-the-business-logic-cross-platform"}

现在你可以将业务逻辑代码提取到 Kotlin Multiplatform 共享模块的 `commonMain` 源集中。
这样便能同时在 Android 和 iOS 中使用该代码。

1. 将业务逻辑代码从 `app` 目录中的 `com.jetbrains.simplelogin.androidapp.data` 移动到 `shared/src/commonMain` 目录下的 `com.jetbrains.simplelogin.shared` 软件包中。

   ![拖放包含业务逻辑代码的软件包](moving-business-logic.png){width=300}

2. 当 Android Studio 询问你想执行什么操作时，选择移动软件包，然后确认重构。

   ![重构业务逻辑软件包](refactor-business-logic-package.png){width=300}

3. 忽略所有关于平台相关代码的警告，点击 **Refactor Anyway**。

   ![关于平台相关代码的警告](warnings-android-specific-code.png){width=450}

4. 通过将其替换为跨平台 Kotlin 代码，或使用 [expect 与 actual 声明](multiplatform-connect-to-apis.md)连接到 Android 特定 API，从而移除 Android 特定代码。详情请参阅以下部分：

   #### 用跨平台代码替换 Android 特定代码 {initial-collapse-state="collapsed" collapsible="true" id="replace-android-specific-code-with-cross-platform-code"}
   
   为了让代码在 Android 和 iOS 上都能良好运行，请尽可能在移动后的 `data` 目录中将所有 JVM 依赖项替换为 Kotlin 依赖项。

   1. 在 `LoginDataValidator` 类中，将来自 `android.utils` 软件包的 `Patterns` 类替换为用于电子邮件验证的 Kotlin 正则表达式：
   
       ```kotlin
       // Before
       private fun isEmailValid(email: String) = Patterns.EMAIL_ADDRESS.matcher(email).matches()
       ```
   
       ```kotlin
       // After
       private fun isEmailValid(email: String) = emailRegex.matches(email)
       
       companion object {
           private val emailRegex = 
               ("[a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}" +
                   "\\@" +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}" +
                   "(" +
                   "\\." +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}" +
                   ")+").toRegex()
       }
       ```
   
   2. 移除 `Patterns` 类的导入指令：
   
       ```kotlin
       import android.util.Patterns
       ```

   3. 在 `LoginDataSource` 类中，将 `login()` 函数中的 `IOException` 替换为 `RuntimeException`。
      `IOException` 在 Kotlin/JVM 中不可用。

          ```kotlin
          // Before
          return Result.Error(IOException("Error logging in", e))
          ```

          ```kotlin
          // After
          return Result.Error(RuntimeException("Error logging in", e))
          ```

   4. 同样移除 `IOException` 的导入指令：

       ```kotlin
       import java.io.IOException
       ```

   #### 实现平台特定的 UUID 生成 {initial-collapse-state="collapsed" collapsible="true" id="implement-platform-specific-uuid-generation"}
   
   在 `LoginDataSource` 类中，`fakeUser` 的通用唯一标识符 (UUID) 是使用 `java.util.UUID` 类生成的，该类在 iOS 上不可用。
   
   ```kotlin
   val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
   ```
   
   尽管 Kotlin 标准库提供了[用于生成 UUID 的类](https://kotlinlang.org/docs/uuids.html)，
   但在这里我们依然使用平台特定的功能，以便进行实践练习。
   
   在共享代码中为 `randomUUID()` 函数提供 `expect` 声明，并在相应源集中为各个平台（Android 和 iOS）提供对应的 `actual` 实现。
   你可以详细了解如何[连接到平台特定 API](multiplatform-connect-to-apis.md)。
   
   1. 将 `login()` 函数中的 `java.util.UUID.randomUUID()` 调用更改为 `randomUUID()` 调用，你将针对各个平台分别实现该调用：
   
       ```kotlin
       val fakeUser = LoggedInUser(randomUUID(), "Jane Doe")
       ```
   
   2. 在 `shared/src/commonMain` 目录的 `com.jetbrains.simplelogin.shared` 软件包中创建 `Utils.kt` 文件，并提供 `expect` 声明：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       expect fun randomUUID(): String
       ```
   
   3. 在 `shared/src/androidMain` 目录的 `com.jetbrains.simplelogin.shared` 软件包中创建 `Utils.android.kt` 文件，并提供 Android 中 `randomUUID()` 的 `actual` 实现：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import java.util.*
      
       actual fun randomUUID() = UUID.randomUUID().toString()
       ```
   
   4. 在 `shared/src/iosMain` 目录的 `com.jetbrains.simplelogin.shared` 软件包中创建 `Utils.ios.kt` 文件，并提供 iOS 中 `randomUUID()` 的 `actual` 实现：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import platform.Foundation.NSUUID
      
       actual fun randomUUID(): String = NSUUID().UUIDString()
       ```
   
   5. 在 `shared/src/commonMain` 目录的 `LoginDataSource.kt` 文件中导入 `randomUUID` 函数：
   
      ```kotlin
      import com.jetbrains.simplelogin.shared.randomUUID
      ```
   
现在，Kotlin 将针对 Android 和 iOS 分别使用平台特定的 UUID 实现。

### 在 Android 上运行跨平台应用程序 {id="run-your-cross-platform-application-on-android"}

运行 `app` 运行配置，确保 Android 应用能够像以前一样正常工作。

![Android 登录应用程序](android-login.png){width=300}

## 让跨平台应用程序在 iOS 上运行 {id="make-your-cross-platform-application-work-on-ios"}

将 Android 应用程序改造为跨平台后，你就可以创建一个 iOS 应用程序并在其中复用共享的业务逻辑。

1. [在 Xcode 中创建 iOS 项目](#create-an-ios-project-in-xcode)
2. [配置 iOS 项目以使用 KMP 框架](#configure-the-ios-project-to-use-a-kmp-framework)
3. [在 Android Studio 中设置 iOS 运行配置](#set-up-an-ios-run-configuration-in-android-studio)
4. [在 iOS 项目中使用共享模块](#use-the-shared-module-in-the-ios-project)

### 在 Xcode 中创建 iOS 项目 {id="create-an-ios-project-in-xcode"}

1. 在 Xcode 中，点击 **File** | **New** | **Project**。
2. 在对话框中，切换到 **iOS** 选项卡：

   ![iOS 项目模板](ios-project-wizard-1.png){width=700}

3. 选择 **App** 模板，然后点击 **Next**。

4. 将产品名称指定为“simpleLoginIOS”，然后点击 **Next**。

   ![iOS 项目设置](ios-project-wizard-2.png){width=700}

5. 选择存放跨平台应用程序的目录作为项目的位置，例如 `kmp-integration-sample`。

    在 Android Studio 中，你将获得以下结构：
    
    ![Android Studio 中的 iOS 项目](ios-project-in-as.png){width=194}

6. 为了与跨平台项目的其他顶级目录保持一致，
   关闭 Xcode 并将 `simpleLoginIOS` 目录重命名为 `iosApp`。

   > 如果在 Xcode 打开的状态下重命名文件夹，你将会收到警告，并且可能会损坏项目。
   >
   {style="warning"}

   ![Android Studio 中重命名后的 iOS 项目目录](ios-directory-renamed-in-as.png){width=194}

### 配置 iOS 项目以使用 KMP 框架 {id="configure-the-ios-project-to-use-a-kmp-framework"}

你可以直接设置 iOS 应用与 Kotlin Multiplatform 构建的框架之间的集成。

> 该方法的替代方案（SwiftPM 和 CocoaPods）请参阅 [iOS 集成方法概览](multiplatform-ios-integration-overview.md)。
> 
{style="note"}

1. 在 Android Studio 中，右键点击 `iosApp/simpleLoginIOS.xcodeproj` 目录，然后选择 **Open In** | **Open In Associated Application** 以在 Xcode 中打开 iOS 项目。
2. 在 Xcode 中，点击 **Project** 导航器中的项目名称以打开 iOS 项目设置。

3. 在左侧的 **Targets** 部分中，选择 **simpleLoginIOS**，然后点击 **Build Phases** 选项卡。

4. 点击 **+** 图标并选择 **New Run Script Phase**。

    ![添加运行脚本阶段](xcode-run-script-phase-1.png){width=700}

5. 在运行脚本字段中粘贴以下脚本：

    ```bash
    if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
        echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
        exit 0
    fi
    cd "$SRCROOT/.."
    ./gradlew :shared:embedAndSignAppleFrameworkForXcode
    ```

6. 禁用 **Based on dependency analysis** 选项。
   这可确保 Xcode 在每次构建期间都运行该脚本，并且不会每次都就缺失输出依赖项发出警告。

   ![添加脚本](xcode-run-script-phase-2.png){width=700}

7. 将 **Run Script** 阶段向上移动，置于 **Compile Sources** 阶段之前：

   ![移动 Run Script 阶段](xcode-run-script-phase-3.png){width=700}

8. 在 **Build Settings** 选项卡上，禁用 **Build Options** 下的 **User Script Sandboxing** 选项：

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 如果你有不同于默认 `Debug` 或 `Release` 的自定义构建配置，请在 **Build Settings** 选项卡上的 **User-Defined** 下添加 `KOTLIN_FRAMEWORK_BUILD_TYPE` 设置，并将其值设为 `Debug` 或 `Release`。
   >
   {style="note"}

9. 在 **Info** 选项卡上，添加自定义的 `CADisableMinimumFrameDurationOnPhone` 属性并将其设置为 `YES`，
   以在 iOS 上启用高刷新率。

10. 在 **Signing & Capabilities** 选项卡上，选择你的开发团队（如果尚未创建，请创建一个）。
    这将允许对 KMP 模块生成的 `shared` 框架进行签名。

    在此处，你还应确保 **Bundle Identifier** 设置为唯一值，否则 Xcode 可能会构建失败。

11. 在 Xcode 中构建项目（主菜单中的 **Product** | **Build**）。
    如果一切配置无误，项目应当能构建成功（你可以安全地忽略“build phase will be run during every build”警告）。
   
    > 如果在禁用 **User Script Sandboxing** 选项之前构建过项目，构建可能会失败：
    > Gradle daemon 进程可能已被沙箱化，需要重启。
    > 在再次构建项目之前，可以通过在项目目录（在本例中为 `kmp-integration-sample`）下运行以下命令来停止它：
    > 
    > ```shell
    > ./gradlew --stop
    > ```
    > 
    {style="note"}

### 在 Android Studio 中设置 iOS 运行配置 {id="set-up-an-ios-run-configuration-in-android-studio"}

确保 Xcode 配置正确后，返回 Android Studio：

1. 在主菜单中选择 **File | Sync Project with Gradle Files**。Android Studio 会自动生成一个名为 **simpleLoginIOS** 的运行配置。

   Android Studio 会自动生成一个名为 **simpleLoginIOS** 的运行配置，并将 `iosApp` 目录标记为链接的 Xcode 项目。

2. 在运行配置列表中，选择 **simpleLoginIOS**。
   选择一个 iOS 模拟器，然后点击 **Run** 以检查 iOS 运行配置是否正常工作。

   ![运行配置列表中的 iOS 运行配置](ios-run-configuration-simplelogin.png)

### 在 iOS 项目中使用共享模块 {id="use-the-shared-module-in-the-ios-project"}

`shared/build.gradle.kts` 文件将每个 iOS 目标的 `binaries.framework.baseName` 属性定义为 `sharedKit`。
这是 Kotlin Multiplatform 构建给 iOS 应用使用的框架名称。

为了测试集成情况，在 Swift 代码中添加对通用代码的调用：

1. 在 Android Studio 中，打开 `iosApp/simpleloginIOS/ContentView.swift` 文件并导入该框架：

   ```swift
   import sharedKit
   ```

2. 为了检查是否已正确连接，请更新 `ContentView` 结构的代码，以使用来自 `shared` 模块的 `greet()` 函数：

   ```swift
   struct ContentView: View {
       var body: some View {
           Text(Greeting().greet())
           .padding()
       }
   }
   ```

3. 使用 Android Studio 的 iOS 运行配置运行应用以查看结果：

   ![来自共享模块的问候语](xcode-iphone-hello.png){width=300}

4. 再次更新 `ContentView.swift` 文件中的代码，使用共享模块中的业务逻辑来呈现应用程序 UI：

   ```kotlin
   
   ```

5. 在 `simpleLoginIOSApp.swift` 文件中，导入 `sharedKit` 模块并为 `ContentView()` 函数指定实参：

    ```swift
    import SwiftUI
    import sharedKit
    
    @main
    struct SimpleLoginIOSApp: App {
        var body: some Scene {
            WindowGroup {
                ContentView(viewModel: .init(loginRepository: LoginRepository(dataSource: LoginDataSource()), loginValidator: LoginDataValidator()))
            }
        }
    }
    ```

6. 再次运行 iOS 运行配置，即可看到 iOS 应用显示了登录表单。
7. 输入“Jane”作为用户名，输入“password”作为密码。
8. 正如你[之前设置的集成](#configure-the-ios-project-to-use-a-kmp-framework)一样，
    iOS 应用会使用通用代码验证输入：

   ![简单登录应用程序](xcode-iphone-login.png){width=300}

## 尽享成果 – 仅需更新一次逻辑 {id="enjoy-the-results-update-the-logic-only-once"}

现在你的应用程序已经是跨平台的了。你可以在 `shared` 模块中更新业务逻辑，并在 Android 和 iOS 上同时看到结果。

1. 修改用户密码的验证逻辑：“password”不应作为一个有效选项。
    为此，请更新 `LoginDataValidator` 类的 `checkPassword()` 函数
    （要快速找到它，请连续按两次 <shortcut>Shift</shortcut>，粘贴该类的名称，然后切换到 **Classes** 选项卡）：

   ```kotlin
   package com.jetbrains.simplelogin.shared.data
   
   class LoginDataValidator {
   //...
       fun checkPassword(password: String): Result {
           return when {
               password.length < 5 -> Result.Error("Password must be >5 characters")
               password.lowercase() == "password" -> Result.Error("Password shouldn't be \"password\"")
               else -> Result.Success
           }
       }
   //...
   }
   ```

2. 从 Android Studio 中同时运行 iOS 和 Android 应用程序以查看更改
   （点击红色警告三角形时会显示 iOS 错误消息）：

   ![Android 与 iOS 应用程序密码错误](android-iphone-password-error.png){width=600}

你可以查看[本教程的最终代码](https://github.com/Kotlin/kmp-integration-sample/tree/final)。

## 还能共享什么？ {id="what-else-to-share"}

你已经共享了应用程序的业务逻辑，但也可以决定共享应用程序的其他层。
例如，[Android](https://github.com/Kotlin/kmp-integration-sample/blob/final/app/src/main/java/com/jetbrains/simplelogin/androidapp/ui/login/LoginViewModel.kt) 和 [iOS 应用程序](https://github.com/Kotlin/kmp-integration-sample/blob/final/iosApp/SimpleLoginIOS/ContentView.swift#L84)的 `ViewModel` 类代码几乎相同，
如果你的移动应用程序应当具有相同的表现层，你也可以将其共享。

## 后续步骤 {id="what-s-next"}

将 Android 应用程序改造为跨平台后，你可以继续探索：

* [添加对多平台库的依赖](multiplatform-add-dependencies.md)
* [添加 Android 依赖项](multiplatform-android-dependencies.md)
* [添加 iOS 依赖项](multiplatform-ios-dependencies.md)

你可以使用 Compose Multiplatform 跨所有平台创建统一的 UI：

* [了解 Compose Multiplatform 和 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md)
* [探索适用于 Compose Multiplatform 的可用资源](compose-multiplatform-resources.md)
* [创建具有共享逻辑与 UI 的应用](compose-multiplatform-new-project.md)

你还可以查看社区资源：

* [视频：如何将 Android 项目迁移到 Kotlin Multiplatform](https://www.youtube.com/watch?v=vb-Pt8SdfEE&t=1s)
* [视频：让 Kotlin JVM 代码为 Kotlin Multiplatform 做好准备的 3 种方法](https://www.youtube.com/watch?v=X6ckI1JWjqo)