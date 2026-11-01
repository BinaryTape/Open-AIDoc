[//]: # (title: 常见问题解答)

<web-summary>Kotlin 是一门由 JetBrains 开发的简洁的多平台编程语言。</web-summary>

### 什么是 Kotlin？ {id="what-is-kotlin"}

Kotlin 是一门开源的静态类型编程语言，目标平台包括 JVM、Android、JavaScript、Wasm 和 Native。
它由 [JetBrains](https://www.jetbrains.com) 开发。该项目始于 2010 年，并在非常早期就已开源。
首个官方 1.0 版本于 2016 年 2 月发布。

### Kotlin 的当前版本是什么？ {id="what-is-the-current-version-of-kotlin"}

当前发布的版本是 %kotlinVersion%，发布于 %kotlinReleaseDate%。  
你可以在 [GitHub 上](https://github.com/jetbrains/kotlin)找到更多信息。

### Kotlin 是免费的吗？ {id="is-kotlin-free"}

是的。Kotlin 过去是免费的，现在是免费的，未来也将保持免费。它在 Apache 2.0 许可证下进行开发，源代码可在 [GitHub 上](https://github.com/jetbrains/kotlin)获取。

### Kotlin 是面向对象语言还是函数式语言？ {id="is-kotlin-an-object-oriented-language-or-a-functional-one"}

Kotlin 同时具备面向对象和函数式构造。你可以按 OO（面向对象）或 FP（函数式编程）风格使用它，也可以将两者结合。
由于对高阶函数、函数类型以及 lambda 表达式等功能提供了一等支持，如果你正在进行或探索函数式编程，Kotlin 是极佳的选择。

### 相比 Java 编程语言，Kotlin 能为我带来哪些优势？ {id="what-advantages-does-kotlin-give-me-over-the-java-programming-language"}

Kotlin 更加简洁。粗略估计表明，代码行数大约可以减少 40%。
它也更具类型安全性——例如，对不可空类型的支持降低了应用程序出现 NPE（空指针异常）的几率。
智能转换、高阶函数、扩展函数以及带接收者的 lambda 表达式等其他功能，不仅赋予了编写富有表现力代码的能力，也促进了 DSL 的创建。
 
### Kotlin 与 Java 编程语言兼容吗？ {id="is-kotlin-compatible-with-the-java-programming-language"}

是的。Kotlin 与 Java 编程语言 100% 互操作，并且 JetBrains 将重点放在了确保现有代码库能够与 Kotlin 良好交互上。你可以轻松地[从 Java 调用 Kotlin 代码](java-to-kotlin-interop.md)，以及[从 Kotlin 调用 Java 代码](java-interop.md)。这使得采纳 Kotlin 变得更加容易且风险更低。此外，[IDE 中还内置了自动 Java 到 Kotlin 转换器](mixing-java-kotlin-intellij.md#convert-java-files-to-kotlin)，可简化现有代码的迁移。

### 我可以用 Kotlin 做什么？ {id="what-can-i-use-kotlin-for"}

Kotlin 可用于任何类型的开发，无论是后端、客户端 Web、Android 还是多平台库。
随着 Kotlin/Native 目前正在积极开发中，对嵌入式系统、macOS 以及 iOS 等其他平台的支持也逐步完善。
人们正在将 Kotlin 用于移动端和服务器端应用程序、使用 JavaScript 或 JavaFX 的客户端以及数据科学等诸多领域，这里仅列举了几种可能。

### 我可以使用 Kotlin 进行 Android 开发吗？ {id="can-i-use-kotlin-for-android-development"}

是的。Kotlin 在 Android 上作为一等语言受支持。已有数百款应用程序在 Android 上使用 Kotlin，例如 Basecamp、Pinterest 等。有关更多信息，请查阅 [Android 开发资源](android-overview.md)。

### 我可以使用 Kotlin 进行后端开发吗？ {id="can-i-use-kotlin-for-backend-development"}

是的。Kotlin 与 JVM 100% 兼容，因此你可以使用任何现有框架，例如 Spring Boot、vert.x 或 JSF。此外，还有专门用 Kotlin 编写的框架，例如 [Ktor](https://github.com/kotlin/ktor)。有关更多信息，请查阅[后端开发概述](server-overview.md)。

### 我可以使用 Kotlin 进行 Web 开发吗？ {id="can-i-use-kotlin-for-web-development"}

是的。对于后端 Web 开发，Kotlin 可以很好地与 [Ktor](https://ktor.io/) 和 [Spring](https://spring.io/) 等框架配合使用，使你能够高效构建服务器端应用程序。此外，你还可以将 Kotlin/Wasm 用于客户端 Web 开发。
了解如何[开始使用 Kotlin/Wasm](wasm-get-started.md)。

### 我可以使用 Kotlin 进行桌面开发吗？ {id="can-i-use-kotlin-for-desktop-development"}

是的。你可以使用任何 Java UI 框架，例如 JavaFX、Swing 或其他框架。
此外，还有专门针对 Kotlin 的框架，例如 [TornadoFX](https://github.com/edvin/tornadofx)。

### 我可以使用 Kotlin 进行原生开发吗？ {id="can-i-use-kotlin-for-native-development"}

是的。Kotlin/Native 作为 Kotlin 的一部分提供。它将 Kotlin 编译为无需虚拟机即可运行的原生代码。
你可以在主流桌面平台、移动平台乃至部分物联网 (IoT) 设备上体验它。
有关更多信息，请查阅 [Kotlin/Native 文档](native-overview.md)。

### 哪些 IDE 支持 Kotlin？ {id="what-ides-support-kotlin"}

借助由 JetBrains 开发的官方 Kotlin 插件，Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/kotlin/get-started) 中享有开箱即用的完整支持。
你还可以安装官方的 [Visual Studio Code 的 Kotlin by JetBrains 扩展程序](kotlin-lsp.md#kotlin-in-visual-studio-code)，该扩展程序由 Kotlin Language Server 驱动，目前处于 [Alpha](components-stability.md#stability-levels-explained) 阶段。

其他 IDE 和代码编辑器仅提供由 Kotlin 社区支持的插件。

你还可以尝试使用 [Kotlin Playground](https://play.kotlinlang.org)，直接在浏览器中编写、运行和分享 Kotlin 代码。
此外，还提供了[命令行编译器](command-line.md)，为编译和运行应用程序提供了简单直接的支持。
  
### 哪些构建工具支持 Kotlin？ {id="what-build-tools-support-kotlin"}

在 JVM 方面，主流构建工具包括 [Gradle](gradle.md) 和 [Maven](maven.md)。
也有一些针对客户端 JavaScript 的构建工具可用。

### Kotlin 会编译成什么？ {id="what-does-kotlin-compile-down-to"}

面向 JVM 时，Kotlin 会生成与 Java 兼容的字节码。

面向 JavaScript 时，Kotlin 可以根据配置的目标生成 ES5、ES2015 或 ES2020 代码。
生成的代码兼容包括 AMD 和 CommonJS 在内的模块系统。

面向原生平台时，Kotlin 将生成特定于平台的代码（通过 LLVM）。

### Kotlin 支持哪些版本的 JVM？ {id="which-versions-of-jvm-does-kotlin-target"}

Kotlin 允许你选择执行时使用的 JVM 版本。默认情况下，Kotlin/JVM 编译器生成与 Java 8 兼容的字节码。
如果你希望利用较新 Java 版本中的优化功能，可以显式指定 9 到 26 之间的目标 Java 版本。请注意，在这种情况下，生成的字节码可能无法在更低版本上运行。
从 [Kotlin 1.5](whatsnew15.md#new-default-jvm-target-1-8) 开始，编译器不再支持生成与 8 以下 Java 版本兼容的字节码。

### Kotlin 难学吗？ {id="is-kotlin-hard"}

Kotlin 受到 Java、C#、JavaScript、Scala 和 Groovy 等现有语言的启发。我们努力确保 Kotlin 易于学习，以便人们可以在几天内快速入门并阅读和编写 Kotlin 代码。
学习惯用 Kotlin 并使用其更多高级功能可能需要更长一些的时间，但总体而言，它并不是一门复杂的语言。  
有关更多信息，请查看[我们的学习材料](learning-materials-overview.md)。
 
### 哪些公司在使用 Kotlin？ {id="what-companies-are-using-kotlin"}
 
使用 Kotlin 的公司多得难以一一列举，但一些公开声明使用 Kotlin 的知名公司（通过博文、GitHub 仓库或演讲等方式）包括 [Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、[Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI) 和 [Basecamp](https://signalvnoise.com/svn3/using-kotlin-to-make-android-apis-fun-again/)。
 
### 谁在开发 Kotlin？ {id="who-develops-kotlin"}

Kotlin 由 [JetBrains（当前团队规模超过 100 人）](https://www.jetbrains.com/)的工程师团队开发。
首席语言设计师是 Michail Zarečenskij。除了核心团队外，在 GitHub 上还有超过 250 位外部贡献者。

### 我在哪里可以了解关于 Kotlin 的更多信息？ {id="where-can-i-learn-more-about-kotlin"}

最好的起点是[我们的官方网站](https://kotlinlang.org)。
要开始使用 Kotlin，你可以安装一款[官方 IDE](kotlin-ide.md) 或[在线体验](https://play.kotlinlang.org)。

### 有关于 Kotlin 的书籍吗？ {id="are-there-any-books-on-kotlin"}

市面上有不少关于 Kotlin 的书籍。其中一些我们已经审阅过并推荐作为入门读物，它们列在[书籍](books.md)页面上。有关更多书籍，请参阅由社区在 [kotlin.link](https://kotlin.link/) 上维护的列表。

### 有关于 Kotlin 的在线课程吗？ {id="are-any-online-courses-available-for-kotlin"}

你可以通过 JetBrains Academy 的 [Kotlin Core 学习路径](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)一边创建可运行的应用程序，一边学习 Kotlin 的所有核心基础知识。

你还可以参加以下其他课程：
* Kevin Jones 的 [Pluralsight 课程：Kotlin 快速入门 (Getting Started with Kotlin)](https://www.pluralsight.com/courses/kotlin-getting-started)
* Hadi Hariri 的 [O'Reilly 课程：Kotlin 编程导论 (Introduction to Kotlin Programming)](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/)

你也可以查看我们 [YouTube 频道](https://www.youtube.com/c/Kotlin)上的其他教程和内容。

### Kotlin 有社区吗？ {id="does-kotlin-have-a-community"}

是的！Kotlin 拥有非常活跃的社区。Kotlin 开发者活跃在 [Kotlin 论坛](https://discuss.kotlinlang.org)、[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin) 上，更活跃的交流则发生在 [Kotlin Slack](https://slack.kotlinlang.org)（截至 2020 年 4 月已有近 30,000 名成员）。

### 有 Kotlin 相关的活动吗？ {id="are-there-kotlin-events"}
 
是的！现在有许多专门围绕 Kotlin 建立的用户组和聚会。你可以在[官方网站上找到列表](https://kotlinlang.org/user-groups/user-group-list.html)。
此外，世界各地还有由社区组织的 [Kotlin 之夜 (Kotlin Nights)](kotlin-night-guidelines.md) 活动。

### 有 Kotlin 大会吗？ {id="is-there-a-kotlin-conference"}

是的！[KotlinConf](https://kotlinconf.com/) 是由 JetBrains 主办的年度大会，汇集了来自世界各地的开发者、爱好者和专家，分享他们在 Kotlin 方面的知识与经验。

除了技术演讲和工作坊外，KotlinConf 还提供交流联谊的机会、社区互动以及社交活动，与会者可以在活动中与 Kotlin 同好建立联系并交流想法。
它是促进 Kotlin 生态系统内部协作和社区建设的平台。

世界各地的各类会议上也常常涵盖 Kotlin 主题。你可以在[官方网站上找到即将举行的演讲列表](https://kotlinlang.org/community/talks.html?time=upcoming)。

### Kotlin 在社交媒体上有账号吗？ {id="is-kotlin-on-social-media"}

是的。 
欢迎订阅 [Kotlin YouTube 频道](https://www.youtube.com/c/Kotlin)，并在 [Twitter 上](https://twitter.com/kotlin)或 [Bluesky 上](https://bsky.app/profile/kotlinlang.org)关注 Kotlin。

### 还有其他 Kotlin 在线资源吗？ {id="any-other-online-kotlin-resources"}

官网上有大量[在线资源](https://kotlinlang.org/community/)，包括由社区成员整理的 [Kotlin 文摘 (Kotlin Digests)](https://kotlin.link)、[新闻通讯](http://kotlinweekly.net)、[播客](https://talkingkotlin.com)等。

### 我在哪里可以获取高清的 Kotlin 徽标？ {id="where-can-i-get-an-hd-kotlin-logo"}

可以在[此处](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)下载徽标。
使用徽标时，请遵循归档文件内的 `guidelines.pdf` 中的简要规则以及 [Kotlin 品牌使用准则](https://kotlinfoundation.org/guidelines/)。

有关更多信息，请查阅关于 [Kotlin 品牌资产](kotlin-brand-assets.md)的页面。