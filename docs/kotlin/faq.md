[//]: # (title: 常见问题解答)

<web-summary>Kotlin 是由 JetBrains 开发的一种简洁的多平台编程语言。</web-summary>

### 什么是 Kotlin？ {id="what-is-kotlin"}

Kotlin 是一种开源的静态类型编程语言，目标平台包括 JVM、Android、JavaScript、Wasm 和 Native。
它由 [JetBrains](https://www.jetbrains.com) 开发。该项目始于 2010 年，并且很早以前就已开源。
第一个正式的 1.0 版本发布于 2016 年 2 月。 

### Kotlin 的当前版本是多少？ {id="what-is-the-current-version-of-kotlin"}

当前发布的版本是 %kotlinVersion%，发布日期为 %kotlinReleaseDate%。  
您可以在 [GitHub 上](https://github.com/jetbrains/kotlin)找到更多信息。

### Kotlin 免费吗？ {id="is-kotlin-free"}

是的。Kotlin 免费，一直免费，并且将保持免费。它是在 Apache 2.0 许可证下开发的，源代码可在 [GitHub 上](https://github.com/jetbrains/kotlin)获取。

### Kotlin 是面向对象的语言还是函数式语言？ {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin 同时具有面向对象和函数式构造。您可以以 OO（面向对象）和 FP（函数式）风格使用它，或者将两者结合。
凭借对高阶函数、函数类型和 lambda表达式等功能的一等支持，如果您正在进行或探索函数式编程，Kotlin 是一个绝佳的选择。

### 与 Java 编程语言相比，Kotlin 有哪些优势？ {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin 更加简洁。据粗略估计，代码行数减少了约 40%。
它也更加类型安全——例如，对非空类型的支持使得应用程序更不容易出现 NPE（空指针异常）。
其他功能包括智能转换、高阶函数、扩展函数和带接收者的 lambda表达式，这些功能提供了编写更具表达力代码的能力，并有助于创建 DSL（领域专用语言）。
 
### Kotlin 是否与 Java 编程语言兼容？ {id="is-kotlin-compatible-with-the-java-programming-language"}

是的。Kotlin 与 Java 编程语言 100% 互操作，我们非常重视确保您现有的代码库可以与 Kotlin 正确交互。您可以轻松地[从 Java 调用 Kotlin 代码](java-to-kotlin-interop.md)以及[从 Kotlin 调用 Java 代码](java-interop.md)。这使得采用 Kotlin 变得更加容易且风险更低。IDE 中还内置了自动化的 [Java 到 Kotlin 转换器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)，可简化现有代码的迁移。

### 我可以使用 Kotlin 做什么？ {id="what-can-i-use-kotlin-for"}

Kotlin 可用于任何类型的开发，无论是后端、客户端 Web、Android 还是多平台库。
随着 Kotlin/Native 正在开发中，还支持嵌入式系统、macOS 和 iOS 等其他平台。
人们正在将 Kotlin 用于移动和服务器端应用程序、使用 JavaScript 或 JavaFX 的客户端以及数据科学等，这里仅举几例。

### 我可以使用 Kotlin 进行 Android 开发吗？ {id="can-i-use-kotlin-for-android-development"}

是的。Kotlin 在 Android 上被支持为一等语言。已有数百个应用程序在 Android 中使用 Kotlin，例如 Basecamp、Pinterest 等。要了解更多信息，请参阅 [Android 开发资源](android-overview.md)。

### 我可以使用 Kotlin 进行后端开发吗？ {id="can-i-use-kotlin-for-backend-development"}

是的。Kotlin 与 JVM 100% 兼容，因此您可以使用任何现有框架，例如 Spring Boot、vert.x 或 JSF。此外，还有专门用 Kotlin 编写的框架，例如 [Ktor](https://github.com/kotlin/ktor)。
要了解更多信息，请参阅[后端开发概览](server-overview.md)。

### 我可以使用 Kotlin 进行 Web 开发吗？ {id="can-i-use-kotlin-for-web-development"}

是的。对于后端 Web 开发，Kotlin 与 [Ktor](https://ktor.io/) 和 [Spring](https://spring.io/) 等框架配合良好，使您能够高效地构建服务器端应用程序。此外，您还可以将 Kotlin/Wasm 用于客户端 Web 开发。
了解如何[开始使用 Kotlin/Wasm](wasm-get-started.md)。

### 我可以使用 Kotlin 进行桌面开发吗？ {id="can-i-use-kotlin-for-desktop-development"}

是的。您可以使用任何 Java UI 框架，例如 JavaFx、Swing 或其他。 
此外，还有 Kotlin 专用的框架，例如 [TornadoFX](https://github.com/edvin/tornadofx)。 

### 我可以使用 Kotlin 进行原生开发吗？ {id="can-i-use-kotlin-for-native-development"}

是的。Kotlin/Native 作为 Kotlin 的一部分提供。它将 Kotlin 编译为无需虚拟机即可运行的原生代码。
您可以在流行的桌面和移动平台甚至某些物联网 (IoT) 设备上试用它。
要了解更多信息，请参阅 [Kotlin/Native 文档](native-overview.md)。

### 哪些 IDE 支持 Kotlin？ {id="what-ides-support-kotlin"}

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/kotlin/get-started) 中具有完整的开箱即用支持，配备由 JetBrains 开发的官方 Kotlin 插件。
您还可以安装官方的 [Visual Studio Code Kotlin by JetBrains 扩展程序](kotlin-lsp.md#kotlin-in-visual-studio-code)，该扩展程序由处于 [Alpha](components-stability.md#stability-levels-explained) 阶段的 Kotlin Language Server 提供支持。

其他 IDE 和代码编辑器仅具有 Kotlin 社区支持的插件。

您也可以尝试使用 [Kotlin Playground](https://play.kotlinlang.org) 在浏览器中编写、运行和分享 Kotlin 代码。
此外，还提供[命令行编译器](command-line.md)，它为编译和运行应用程序提供了直接支持。
  
### 哪些构建工具支持 Kotlin？ {id="what-build-tools-support-kotlin"}

在 JVM 方面，主要构建工具包括 [Gradle](gradle.md) 和 [Maven](maven.md)。
还有一些针对客户端 JavaScript 的构建工具可用。 

### Kotlin 会编译成什么？ {id="what-does-kotlin-compile-down-to"}

针对 JVM 时，Kotlin 会生成与 Java 兼容的字节码。

针对 JavaScript 时，Kotlin 可以根据配置的目标生成 ES5、ES2015 或 ES2020 代码。
生成的代码与模块系统（包括 AMD 和 CommonJS）兼容。 

针对原生时，Kotlin 将生成特定于平台的代码（通过 LLVM）。 

### Kotlin 针对哪些版本的 JVM？ {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin 允许您选择用于执行的 JVM 版本。默认情况下，Kotlin/JVM 编译器生成与 Java 8 兼容的字节码。
如果您想利用更新版本 Java 中的优化，可以显式指定 9 到 26 的目标 Java 版本。请注意，在这种情况下，生成的字节码可能无法在较低版本上运行。
从 [Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8) 开始，编译器不支持生成与 Java 8 以下版本兼容的字节码。

### Kotlin 难学吗？ {id="is-kotlin-hard"}

Kotlin 受到 Java、C#、JavaScript、Scala 和 Groovy 等现有语言的启发。我们努力确保 Kotlin 易于学习，以便人们可以在几天内轻松上手，阅读和编写 Kotlin 代码。
学习惯用 (idiomatic) 的 Kotlin 并使用其一些更高级的功能可能需要更长的时间，但总的来说，它不是一种复杂的语言。  
要了解更多信息，请参阅我们的[学习材料](learning-materials-overview.md)。
 
### 哪些公司在使用 Kotlin？ {id="what-companies-are-using-kotlin"}
 
使用 Kotlin 的公司太多，无法一一列举，但一些公开宣布使用 Kotlin 的知名公司（通过博客文章、GitHub 仓库或演讲）包括 [Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、[Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI) 和 [Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/)。
 
### 谁在开发 Kotlin？ {id="who-develops-kotlin"}

Kotlin 由 [JetBrains (目前团队规模超过 100 人)](https://www.jetbrains.com/) 的工程师团队开发。
首席语言设计师是 Michail Zarečenskij。除了核心团队外，GitHub 上还有超过 250 名外部贡献者。 

### 在哪里可以了解更多关于 Kotlin 的信息？ {id="where-can-i-learn-more-about-kotlin"}

最好的起点是[我们的网站](https://kotlinlang.org)。
要开始使用 Kotlin，您可以安装其中一个[官方 IDE](kotlin-ide.md) 或[在线试用](https://play.kotlinlang.org)。

### 有关于 Kotlin 的书籍吗？ {id="are-there-any-books-on-kotlin"}

有很多关于 Kotlin 的书籍。其中一些我们已经审阅过，并可以推荐作为入门。它们列在[书籍](books.md)页面上。有关更多书籍，请参阅由社区维护的列表：[kotlin.link](https://kotlin.link/)。 

### 有针对 Kotlin 的在线课程吗？ {id="are-any-online-courses-available-for-kotlin"}

您可以在通过 JetBrains Academy 的 [Kotlin Core 轨道](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)创建实际应用的同时，学习所有 Kotlin 核心知识。

您可以参加的其他几门课程：
* [Pluralsight 课程：Kotlin 快速入门 (Getting Started with Kotlin)](https://www.pluralsight.com/courses/kotlin-getting-started)，作者 Kevin Jones
* [O'Reilly 课程：Kotlin 编程简介 (Introduction to Kotlin Programming)](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/)，作者 Hadi Hariri

您还可以查看我们 [YouTube 频道](https://www.youtube.com/c/Kotlin)上的其他教程和内容。

### Kotlin 有社区吗？ {id="does-kotlin-have-a-community"}

是的！Kotlin 有一个非常活跃的社区。Kotlin 开发者聚集在 [Kotlin 论坛](https://discuss.kotlinlang.org)、[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin)，以及更活跃的 [Kotlin Slack](https://slack.kotlinlang.org)（截至 2020 年 4 月，成员接近 30,000 名）。 

### 有 Kotlin 活动吗？ {id="are-there-kotlin-events"}
 
是的！现在有许多专门关注 Kotlin 的用户组和聚会 (Meetup)。您可以在[网站上找到列表](https://kotlinlang.org/user-groups/user-group-list.html)。
此外，世界各地还有社区组织的 [Kotlin Nights](https://kotlinlang.org/community/events.html) 活动。

### 有 Kotlin 会议吗？ {id="is-there-a-kotlin-conference"}

是的！[KotlinConf](https://kotlinconf.com/) 是由 JetBrains 主办的年度会议，它汇集了来自世界各地的开发者、爱好者和专家，分享他们在 Kotlin 方面的知识和经验。

除了技术演讲和研讨会，KotlinConf 还提供社交机会、社区互动和社交活动，与会者可以在这些活动中与其他 Kotliner 建立联系并交流想法。
它是促进 Kotlin 生态系统内协作和社区建设的平台。

全球各地的不同会议也涵盖了 Kotlin。您可以在[网站上找到即将举行的演讲列表](https://kotlinlang.org/community/talks.html?time=upcoming)。

### Kotlin 有社交媒体账号吗？ {id="is-kotlin-on-social-media"}

是的。 
请订阅 [Kotlin YouTube 频道](https://www.youtube.com/c/Kotlin)并在 [Twitter](https://twitter.com/kotlin) 或 [Bluesky](https://bsky.app/profile/kotlinlang.org) 上关注 Kotlin。

### 还有其他在线 Kotlin 资源吗？ {id="any-other-online-kotlin-resources"}

该网站有一系列[在线资源](https://kotlinlang.org/community/)，包括由社区成员提供的 [Kotlin Digests](https://kotlin.link)、[新闻通讯](http://kotlinweekly.net)、[播客](https://talkingkotlin.com)等。

### 从哪里可以获得高清 Kotlin 徽标？ {id="where-can-i-get-an-hd-kotlin-logo"}

徽标可以在[此处](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)下载。
在使用徽标时，请遵守存档内 `guidelines.pdf` 中的简单规则以及 [Kotlin 品牌使用指南](https://kotlinfoundation.org/guidelines/)。

要了解更多信息，请查看关于 [Kotlin 品牌资产](kotlin-brand-assets.md)的页面。