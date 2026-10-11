[//]: # (title: 簡介)

Dokka 是適用於 Kotlin 的 API 文件引擎。

就像 Kotlin 本身一樣，Dokka 支援混合語言專案。它能理解 Kotlin 的 [KDoc 註解](https://kotlinlang.org/docs/kotlin-doc.html#kdoc-syntax) 以及 Java 的 [Javadoc 註解](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html)。

Dokka 可以產生多種格式的文件，包括其自有的現代化 [HTML 格式](dokka-html.md)、Java 的 [Javadoc HTML](dokka-javadoc.md)，以及 Markdown 的 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 與 [Jekyll](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-jekyll/README.md) 風格。

以下是一些使用 Dokka 來產生其 API 參考文件的程式庫：

* [kotlinx.coroutines](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Bitmovin](https://cdn.bitmovin.com/player/android/3/docs/index.html)
* [Hexagon](https://hexagontk.com/stable/api/)
* [Ktor](https://api.ktor.io/)
* [OkHttp](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/)

你可以使用 [Gradle](dokka-gradle.md)、[Maven](dokka-maven.md) 或從[命令列](dokka-cli.md)執行 Dokka。它也[具備高度可外掛性](dokka-plugins.md)。

請參閱[開始使用 Dokka](dokka-get-started.md) 來邁出使用 Dokka 的第一步。

## 社群 {id="community"}

Dokka 在 [Kotlin 社群 Slack](https://kotl.in/slack) 中設有專屬的 `#dokka` 頻道，你可以在那裡交流 Dokka、其外掛程式以及如何開發外掛程式，也可以與維護者取得聯繫。