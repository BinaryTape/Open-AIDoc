[//]: # (title: はじめに)

Dokkaは、Kotlin向けのAPIドキュメンテーションエンジンです。

Kotlin本体と同様に、Dokkaは複数言語が混在するプロジェクトをサポートしています。Kotlinの[KDocコメント](https://kotlinlang.org/docs/kotlin-doc.html#kdoc-syntax)およびJavaの[Javadocコメント](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html)を解釈できます。

Dokkaは、独自のモダンな[HTML形式](dokka-html.md)、Javaの[Javadoc HTML](dokka-javadoc.md)、ならびにMarkdownのフレーバーである[GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md)や[Jekyll](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-jekyll/README.md)など、複数の形式でドキュメントを生成できます。

以下は、APIリファレンスドキュメントの生成にDokkaを使用しているライブラリの一部です。

* [kotlinx.coroutines](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Bitmovin](https://cdn.bitmovin.com/player/android/3/docs/index.html)
* [Hexagon](https://hexagontk.com/stable/api/)
* [Ktor](https://api.ktor.io/)
* [OkHttp](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/)

Dokkaは、[Gradle](dokka-gradle.md)、[Maven](dokka-maven.md)、または[コマンドライン](dokka-cli.md)から実行できます。また、[プラグインによる高い拡張性](dokka-plugins.md)も備えています。

Dokkaを使い始めるための第一歩については、[Dokka入門](dokka-get-started.md)を参照してください。

## コミュニティ {id="community"}

[Kotlin Community Slack](https://kotl.in/slack)には専用の`#dokka`チャンネルがあり、Dokkaやそのプラグイン、プラグインの開発方法について話し合ったり、メンテナと連絡を取ったりすることができます。