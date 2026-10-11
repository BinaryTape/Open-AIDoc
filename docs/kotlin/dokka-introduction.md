[//]: # (title: 简介)

Dokka 是适用于 Kotlin 的 API 文档引擎。

正如 Kotlin 本身一样，Dokka 也支持混合语言项目。它能够解析 Kotlin 的 [KDoc 注释](https://kotlinlang.org/docs/kotlin-doc.html#kdoc-syntax) 和 Java 的 [Javadoc 注释](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html)。

Dokka 可以生成多种格式的文档，包括其自带的现代化 [HTML 格式](dokka-html.md)、Java 的 [Javadoc HTML](dokka-javadoc.md)，以及 Markdown 的 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 和 [Jekyll](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-jekyll/README.md) 风格。

以下是一些使用 Dokka 构建其 API 参考文档的库：

* [kotlinx.coroutines](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Bitmovin](https://cdn.bitmovin.com/player/android/3/docs/index.html)
* [Hexagon](https://hexagontk.com/stable/api/)
* [Ktor](https://api.ktor.io/)
* [OkHttp](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/)

你可以通过 [Gradle](dokka-gradle.md)、[Maven](dokka-maven.md) 或[命令行](dokka-cli.md)运行 Dokka。它还具有[高度可扩展的插件特性](dokka-plugins.md)。

请参阅[开始使用 Dokka](dokka-get-started.md)，迈出使用 Dokka 的第一步。

## 社区 {id="community"}

Dokka 在 [Kotlin 社区 Slack](https://kotl.in/slack) 中拥有专属的 `#dokka` 频道，你可以在那里讨论 Dokka、其插件及插件开发相关的话题，也可以与维护者取得联系。