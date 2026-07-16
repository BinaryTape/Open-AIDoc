[//]: # (title: 更新用户界面)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中学习——这两个 IDE 共享相同的核心功能和 Kotlin 多平台支持。</p>
    <br/>
    <p>这是**创建具有共享逻辑和原生 UI 的 Kotlin 多平台应用**教程的第二部分。在继续之前，请确保您已完成之前的步骤。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/multiplatform-create-first-app" summary="本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中学习——这两个 IDE 共享相同的核心功能和 Kotlin 多平台支持。这是创建具有共享逻辑和原生 UI 的 Kotlin 多平台应用教程的第一部分。创建您的 Kotlin 多平台应用 更新用户界面 添加依赖项 共享更多逻辑 完成您的项目">创建您的 Kotlin 多平台应用</Links><br/>
       <img src="icon-2.svg" width="20" alt="第二步"/> <strong>更新用户界面</strong><br/>
       <img src="icon-3-todo.svg" width="20" alt="第三步"/> 添加依赖项<br/>       
       <img src="icon-4-todo.svg" width="20" alt="第四步"/> 共享更多逻辑<br/>
       <img src="icon-5-todo.svg" width="20" alt="第五步"/> 完成您的项目<br/>
    </p>
</tldr>

要构建用户界面，您将针对项目的 Android 部分使用 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 工具包，针对 iOS 部分使用 [SwiftUI](https://developer.apple.com/xcode/swiftui/)。
这两者都是声明式 UI 框架，您会看到 UI 实现上的相似之处。在这两种情况下，您都将数据存储在 `phrases` 变量中，随后对其进行迭代以生成 `Text` 项列表。

## 更新 Android 部分

`composeApp` 模块包含一个 Android 应用程序，定义了其主 Activity 和 UI 视图，并像使用常规 Android 库一样使用 `shared` 模块。该应用程序的 UI 使用了 Compose Multiplatform 框架。

进行一些更改并观察它们如何反映在 UI 中：

1. 导航到 `composeApp/src/androidMain/.../greetingkmp` 目录下的 `App.kt` 文件。
2. 找到 `Greeting` 类调用。选中 `greet()` 函数，右键点击它，然后选择 **转到** | **声明或用法**。
   您将看到它就是您在前面的步骤中编辑的 `shared` 模块中的同一个类。
3. 在 `Greeting.kt` 文件中，更新 `Greeting` 类，使 `greet()` 函数返回一个字符串列表：

   ```kotlin
   class Greeting {
   
       private val platform: Platform = getPlatform()
   
       fun greet(): `List<String>` = buildList {
           add(if (Random.nextBoolean()) "Hi!" else "Hello!")
           add("Guess what this is! > ${platform.name.reversed()}!")
       }
   }
   ```

4. 返回 `App.kt` 文件并更新 `App()` 实现：

   ```kotlin
   @Composable
   @Preview
   fun App() {
       MaterialTheme {
           val greeting = remember { Greeting().greet() }
   
           Column(
               modifier = Modifier
                   .padding(all = 10.dp)
                   .safeContentPadding()
                   .fillMaxSize(),
               verticalArrangement = Arrangement.spacedBy(8.dp),
           ) {
               greeting.forEach { greeting ->
                   Text(greeting)
                   HorizontalDivider()
               }
           }
       }
   }
   ```

   此处 `Column` 可组合项显示了每个 `Text` 项，并在其周围添加了内边距，在项之间添加了间距。

5. 按照 IntelliJ IDEA 的建议导入缺失的依赖项。
6. 现在您可以运行 Android 应用，查看它是如何显示字符串列表的：

   ![更新后的 Android 多平台应用 UI](first-multiplatform-project-on-android-2.png){width=300}

## 处理 iOS 模块

`iosApp` 目录构建为一个 iOS 应用程序。它依赖并使用 `shared` 模块作为 iOS 框架。该应用的 UI 是使用 Swift 编写的。

实现与 Android 应用相同的更改：

1. 在 IntelliJ IDEA 的 **项目**工具窗口中，找到项目根目录下的 `iosApp/iosApp` 文件夹。
2. 打开 `iosApp/ContentView.swift` 文件，右键点击 `Greeting().greet()` 调用，然后选择 **转到** | **定义**。

    您将看到 `shared` 模块中定义的 Kotlin 函数的 Objective-C 声明。从 Objective-C/Swift 使用时，Kotlin 类型会表示为 Objective-C 类型。在这里，`greet()` 函数在 Kotlin 中返回 `List<String>`，而在 Swift 中则被视为返回 `NSArray<NSString>`。有关类型映射的更多信息，请参阅[与 Swift/Objective-C 的互操作性](https://kotlinlang.org/docs/native-objc-interop.html)。

3. 更新 SwiftUI 代码，以与 Android 应用相同的方式显示项目列表：

    ```Swift
    struct ContentView: View {
       let phrases = Greeting().greet()
    
       var body: some View {
           List(phrases, id: \.self) {
               Text($0)
           }
       }
    }
    ```

    * `greet()` 调用的结果存储在 `phrases` 变量中（Swift 中的 `let` 与 Kotlin 的 `val` 类似）。
    * `List` 函数生成 `Text` 项列表。

4. 启动 iOS 运行配置以查看更改：

    ![更新后的 iOS 多平台应用 UI](first-multiplatform-project-on-ios-2.png){width=300}

## 可能的问题与解决方案

### Xcode 报告调用共享框架的代码中存在错误

如果您正在使用 Xcode，您的 Xcode 项目可能仍在使用旧版本的框架。
要解决此问题，请返回 IntelliJ IDEA 并重新构建项目或启动 iOS 运行配置。

### Xcode 在导入共享框架时报告错误

如果您正在使用 Xcode，它可能需要清除缓存的二进制文件：尝试通过在主菜单中选择 **Product | Clean Build Folder** 来重置环境。

## 下一步

在本教程的下一部分中，您将学习依赖项并添加第三方库以扩展项目的功能。

**[继续下一部分](multiplatform-dependencies.md)**

## 获取帮助

* **Kotlin Slack**。获取[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 频道。
* **Kotlin 问题跟踪器**。[报告新问题](https://youtrack.jetbrains.com/newIssue?project=KT)。