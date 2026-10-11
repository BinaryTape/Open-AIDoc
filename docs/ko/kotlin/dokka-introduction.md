[//]: # (title: 소개)

Dokka는 Kotlin용 API 문서화 엔진입니다.

Kotlin 자체와 마찬가지로 Dokka는 다중 언어 프로젝트를 지원합니다. Kotlin의 [KDoc 주석](https://kotlinlang.org/docs/kotlin-doc.html#kdoc-syntax)과 Java의 [Javadoc 주석](https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html)을 모두 인식합니다.

Dokka는 자체의 최신 [HTML 형식](dokka-html.md), Java의 [Javadoc HTML](dokka-javadoc.md), 그리고 Markdown의 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 및 [Jekyll](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-jekyll/README.md) 버전을 포함하여 다양한 형식으로 문서를 생성할 수 있습니다.

다음은 API 레퍼런스 문서 제작에 Dokka를 사용하는 대표적인 라이브러리입니다.

* [kotlinx.coroutines](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Bitmovin](https://cdn.bitmovin.com/player/android/3/docs/index.html)
* [Hexagon](https://hexagontk.com/stable/api/)
* [Ktor](https://api.ktor.io/)
* [OkHttp](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/)

Dokka는 [Gradle](dokka-gradle.md), [Maven](dokka-maven.md) 또는 [명령줄(command line)](dokka-cli.md)에서 실행할 수 있습니다. 또한 [플러그인 확장성](dokka-plugins.md)도 뛰어납니다.

Dokka 사용의 첫걸음을 내딛으려면 [Dokka 시작하기](dokka-get-started.md)를 참고하세요.

## 커뮤니티 {id="community"}

[Kotlin 커뮤니티 Slack](https://kotl.in/slack)에는 전용 `#dokka` 채널이 개설되어 있어 Dokka와 플러그인, 그리고 플러그인 개발 방법에 대해 이야기를 나누고 메인테이너와 소통할 수 있습니다.