[//]: # (title: 向项目添加依赖项)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中学习——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。</p>
    <br/>   
    <p>这是<strong>使用共享逻辑和原生 UI 创建 Kotlin Multiplatform 应用</strong>教程的第三部分。在继续之前，请确保您已完成之前的步骤。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/multiplatform-create-first-app" summary="本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中学习——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。这是使用共享逻辑和原生 UI 创建 Kotlin Multiplatform 应用教程的第一部分。创建您的 Kotlin Multiplatform 应用、更新用户界面、添加依赖项、共享更多逻辑、完成您的项目">创建您的 Kotlin Multiplatform 应用</Links><br/>
        <img src="icon-2-done.svg" width="20" alt="第二步"/> <Links href="/kmp/multiplatform-update-ui" summary="本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中学习——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。这是使用共享逻辑和原生 UI 创建 Kotlin Multiplatform 应用教程的第二部分。在继续之前，请确保您已完成之前的步骤。创建您的 Kotlin Multiplatform 应用、更新用户界面、添加依赖项、共享更多逻辑、完成您的项目">更新用户界面</Links><br/>
        <img src="icon-3.svg" width="20" alt="第三步"/> <strong>添加依赖项</strong><br/>
        <img src="icon-4-todo.svg" width="20" alt="第四步"/> 共享更多逻辑<br/>
        <img src="icon-5-todo.svg" width="20" alt="第五步"/> 完成您的项目<br/>
    </p>
</tldr>

您已经创建了第一个跨平台 Kotlin Multiplatform 项目！现在让我们学习如何向第三方库添加依赖项，这对于构建成功的跨平台应用程序至关重要。

## 依赖项类型

在 Kotlin Multiplatform 项目中，您可以使用两种类型的依赖项：

*   **多平台依赖项**。这些是支持多个目标平台的多平台库，可以在公共源集 `commonMain` 中使用。

    许多现代 Android 库已经提供了多平台支持，例如 [Koin](https://insert-koin.io/)、[Apollo](https://www.apollographql.com/) 和 [Okio](https://square.github.io/okio/)。您可以在 [klibs.io](https://klibs.io/) 上找到更多多平台库，这是由 JetBrains 提供的一项用于发现 Kotlin Multiplatform 库的实验性搜索服务。

*   **原生依赖项**。这些是来自相关生态系统的常规库。在原生项目中，您通常在 Android 中使用 Gradle，在 iOS 中使用 CocoaPods 或其他依赖管理器来处理它们。 
  
    在处理共享模块时，如果您想使用平台 API（如安全存储），通常仍需要原生依赖项。您可以将原生依赖项添加到原生源集 `androidMain` 和 `iosMain` 中。

对于这两种类型的依赖项，您都可以使用本地和外部仓库。

## 添加多平台依赖项

> 如果您有开发 Android 应用的经验，添加多平台依赖项与在普通 Android 项目中添加 Gradle 依赖项类似。唯一的区别是您需要指定源集。
>
{style="tip"}

让我们回到应用中，让问候语更具节日气氛。除了设备信息，再添加一个函数来显示距离元旦还有多少天。`kotlinx-datetime` 库具有完整的多平台支持，是在共享代码中处理日期的最便捷方式。

1. 打开位于 `shared` 目录下的 `build.gradle.kts` 文件。
2. 向 `commonMain` 源集依赖项添加以下依赖项和 Kotlin 时间的选择性加入（opt-in）：

    ```kotlin
    kotlin {
        //... 
        sourceSets {
            all { languageSettings.optIn("kotlin.time.ExperimentalTime") }
   
            commonMain.dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            } 
        }
    }
    ```

3. 选择 **Build | Sync Project with Gradle Files** 菜单项，或点击构建脚本编辑器中的 **Sync Gradle Changes** 按钮来同步 Gradle 文件： ![同步 Gradle 文件](gradle-sync.png){width=50}
4. 右键点击 `shared/src/commonMain/.../greetingkmp` 目录，选择 **New | Kotlin Class/File** 以创建一个新文件 `NewYear.kt`。
5. 使用 `datetime` 的日期算术逻辑，更新该文件以添加一个计算从今天到元旦的天数的短函数：
   
   ```kotlin
   fun daysUntilNewYear(): Int {
       val today = Clock.System.todayIn(TimeZone.currentSystemDefault())
       val closestNewYear = LocalDate(today.year + 1, 1, 1)
       return today.daysUntil(closestNewYear)
   }
   
   fun daysPhrase(): String = "There are only ${daysUntilNewYear()} days left until New Year! 🎆"
   ```
6. 根据 IDE 的建议添加所有必需的导入。确保您从 `kotlin.time` 软件包导入了 `Clock` 类。
7. 在 `Greeting.kt` 文件中，更新 `Greeting` 类以查看结果：
    
    ```kotlin
    class Greeting {
        private val platform: Platform = getPlatform()
   
        fun greet(): `List<String>` = buildList {
            add(if (Random.nextBoolean()) "Hi!" else "Hello!")
            add("Guess what this is! > ${platform.name.reversed()}!")
            add(daysPhrase())
        }
    }
    ```

8. 要查看结果，请在 IntelliJ IDEA 中重新运行您的 **composeApp** 和 **iosApp** 运行配置：

![更新后的带有外部依赖项的移动多平台应用](first-multiplatform-project-3.png){width=500}

## 下一步

在教程的下一部分，您将向项目添加更多依赖项和更复杂的逻辑。

**[继续下一步](multiplatform-upgrade-app.md)**

### 另请参阅

*   了解如何处理各种多平台依赖项：[Kotlin 库、Kotlin Multiplatform 库和其他多平台项目](multiplatform-add-dependencies.md)。
*   了解如何[添加 Android 依赖项](multiplatform-android-dependencies.md)以及[在使用或不使用 CocoaPods 的情况下添加 iOS 依赖项](multiplatform-ios-dependencies.md)，以便在特定平台的源集中使用。
*   查看示例项目中[如何使用 Android 和 iOS 库](multiplatform-samples.md)的示例。

## 获取帮助

*   **Kotlin Slack**。获取[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 频道。
*   **Kotlin 问题跟踪器**。[报告新问题](https://youtrack.jetbrains.com/newIssue?project=KT)。