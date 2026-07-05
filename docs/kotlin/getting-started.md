[//]: # (title: Kotlin 入门)

<tldr>
<p>最新 Kotlin 版本：<b> <a href="%kotlinLatestWhatsnew%">%kotlinVersion%</a></b></p>
</tldr>

Kotlin 是一种现代编程语言，具有简洁、跨平台以及与 Java 和其他语言互操作的特性。

刚接触 Kotlin？参加我们的导览，直接在浏览器中学习基础知识。

<a href="kotlin-tour-welcome.md"><img src="start-kotlin-tour.svg" width="700" alt="开始 Kotlin 导览" style="block"/></a>

## 安装 Kotlin

每个 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 版本中都包含 Kotlin。
下载并安装其中一个 IDE 即可开始使用 Kotlin。

## 选择你的 Kotlin 使用场景
 
<tabs>

<tab id="console" title="控制台">

在这里，你将学习如何使用 Kotlin 开发控制台应用程序并创建单元测试。

1. **[使用 IntelliJ IDEA 项目向导创建一个基础 JVM 应用程序](jvm-get-started.md)。**

2. **[编写你的第一个单元测试](jvm-test-using-junit.md)。**

</tab>

<tab id="backend" title="后端">

在这里，你将学习如何使用 Kotlin 进行服务器端开发后端应用程序。

* **将 Kotlin 引入你的 Java 项目：**

  * [配置 Java 项目以支持 Kotlin](mixing-java-kotlin-intellij.md)
  * [为你的 Java Maven 项目添加 Kotlin 测试](jvm-test-using-junit.md)

* **使用 Kotlin 从头开始创建后端应用：**

  * [使用 Spring Boot 创建 RESTful Web 服务](jvm-get-started-spring-boot.md)
  * [使用 Ktor 创建 HTTP API](https://ktor.io/docs/creating-http-apis.html)

</tab>

<tab id="cross-platform-mobile" title="跨平台">

在这里，你将学习如何使用 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 开发跨平台应用程序。

1. **[为跨平台开发设置环境](https://kotlinlang.org/docs/multiplatform/quickstart.html)。**

2. **创建你的第一个 iOS 和 Android 应用程序：**

   * 从头开始创建跨平台应用程序，并且：
     * [在保持 UI 原生的同时共享业务逻辑](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
     * [共享业务逻辑和 UI](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)
   * [使你现有的 Android 应用程序在 iOS 上运行](https://kotlinlang.org/docs/multiplatform/multiplatform-integrate-in-existing-app.html)
   * [使用 Ktor 和 SQLdelight 创建跨平台应用程序](https://kotlinlang.org/docs/multiplatform/multiplatform-ktor-sqldelight.html)

3. **浏览 [示例项目](https://kotlinlang.org/docs/multiplatform/multiplatform-samples.html)**。

</tab>

<tab id="android" title="Android">

要开始将 Kotlin 用于 Android 开发，请阅读 [Google 关于在 Android 上开始使用 Kotlin 的建议](https://developer.android.com/kotlin/get-started)。

</tab>

<tab id="data-analysis" title="数据分析">

从构建数据流水线到将机器学习模型投入生产，Kotlin 是处理数据并充分发挥其价值的绝佳选择。

1. **探索并实验你的数据：**

   * [DataFrame](https://kotlin.github.io/dataframe/overview.html) – 一个用于数据分析和操作的库。
   * [Kandy](https://kotlin.github.io/kandy/welcome.html) – 一个用于数据可视化的绘图工具。

2. **在 Twitter 上关注 Kotlin 数据分析账号：** [KotlinForData](http://twitter.com/KotlinForData)。

</tab>

</tabs>

## 获取支持

如果你遇到任何困难或问题，请在 ![Slack](slack.svg){width=25}{type="joined"} Slack 中寻求帮助：[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，或在我们的 [问题跟踪器](https://youtrack.jetbrains.com/issues/KT) 中报告问题。

如果此页面有任何缺失或令人困惑之处，请 [分享你的反馈](https://surveys.hotjar.com/d82e82b0-00d9-44a7-b793-0611bf6189df)。