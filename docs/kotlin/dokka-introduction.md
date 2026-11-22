[//]: # (title: 简介)

Dokka 是 Kotlin 的 API 文档引擎。

就像 Kotlin 本身一样，Dokka 支持多语言混合项目。它能够理解 Kotlin 的 [KDoc 注释](https://kotlinlang.org/docs/kotlin-doc.html#kdoc-syntax)与 Java 的 [Javadoc 注释](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html)。

Dokka 可以生成多种格式的文档，包括其自带的现代 [HTML 格式](dokka-html.md)、Java 的 [Javadoc HTML](dokka-javadoc.md)，以及 Markdown 的 [GFM](https://github.com/Kotlin/dokka/blob/master/dokka-subprojects/plugin-gfm/README.md) 和 [Jekyll](https://github.com/Kotlin/dokka/blob/master/dokka-subprojects/plugin-jekyll/README.md) 风格。

以下是一些使用 Dokka 生成 API 参考文档的库：

* [kotlinx.coroutines](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Bitmovin](https://cdn.bitmovin.com/player/android/3/docs/index.html)
* [Hexagon](https://hexagontk.com/stable/api/)
* [Ktor](https://api.ktor.io/)
* [OkHttp](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/)

你可以通过 [Gradle](dokka-gradle.md)、[Maven](dokka-maven.md) 或[命令行](dokka-cli.md)运行 Dokka。它还具有[高度可插拔性](dokka-plugins.md)。

请参阅 [Dokka 入门](dokka-get-started.md)，迈出使用 Dokka 的第一步。

## 社区 {id="community"}

Dokka 在 [Kotlin Community Slack](https://kotl.in/slack) 中设有专门的 `#dokka` 频道，你可以在那里交流探讨 Dokka、其插件及插件开发相关内容，并与维护者取得联系。