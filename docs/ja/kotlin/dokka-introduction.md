[//]: # (title: はじめに)

Dokka は、Kotlin 向けの API ドキュメント生成エンジンです。

Kotlin 自体と同様に、Dokka は複数言語が混在するプロジェクトをサポートしています。Kotlin の
[KDoc コメント](https://kotlinlang.org/docs/kotlin-doc.html#kdoc-syntax) と Java の 
[Javadoc コメント](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html) を解釈できます。

Dokka は、独自のモダンな [HTML 形式](dokka-html.md)、Java の [Javadoc HTML](dokka-javadoc.md)、ならびに
Markdown の [GFM](https://github.com/Kotlin/dokka/blob/master/dokka-subprojects/plugin-gfm/README.md) や 
[Jekyll](https://github.com/Kotlin/dokka/blob/master/dokka-subprojects/plugin-jekyll/README.md) フレーバーなど、複数の形式でドキュメントを生成できます。

以下は、API リファレンスドキュメントに Dokka を使用しているライブラリの一部です。

* [kotlinx.coroutines](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Bitmovin](https://cdn.bitmovin.com/player/android/3/docs/index.html)
* [Hexagon](https://hexagontk.com/stable/api/)
* [Ktor](https://api.ktor.io/)
* [OkHttp](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/)

Dokka は、[Gradle](dokka-gradle.md)、[Maven](dokka-maven.md)、または[コマンドライン](dokka-cli.md)から実行できます。また、
[プラグインによる高い拡張性](dokka-plugins.md)も備えています。

Dokka を使い始める第一歩として、[Dokka を使い始める](dokka-get-started.md) をご覧ください。

## コミュニティ {id="community"}

Dokka には [Kotlin Community Slack](https://kotl.in/slack) 内に専用の `#dokka` チャンネルがあり、
Dokka やそのプラグイン、それらの開発方法についてチャットしたり、メンテナーと連絡を取ったりすることができます。