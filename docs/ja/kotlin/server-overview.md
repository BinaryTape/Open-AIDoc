[//]: # (title: Kotlin によるバックエンド開発)

<web-summary>Spring、Ktor、その他のバックエンドフレームワークを使用し、Kotlin でサーバーアプリケーションを構築する</web-summary>

Kotlin はサーバーサイドアプリケーションの開発に最適です。Kotlin を使用することで、既存の Java ベースのテクノロジースタックとの完全な互換性を維持しながら、簡潔で表現力豊かなコードを作成できます。

## はじめる {id="get-started"}

Kotlin は、Java から Kotlin への大規模なコードベースの段階的な移行をサポートしています。プロジェクトの他の部分を Java のままにしておきながら、テストコードや新しい本番コードを Kotlin で書き始めることができます。

Java プロジェクトを Kotlin で動作するように構成し、IntelliJ IDEA に含まれる自動 Java-to-Kotlin コンバーターを活用してください。

<a href="mixing-java-kotlin-intellij.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Java プロジェクトに Kotlin を導入する</a>

## フレームワークを探す {id="explore-frameworks"}

Kotlin はすべての Java ベースのフレームワークと完全な互換性があるため、使い慣れたテクノロジースタックを使用しながら Kotlin の構文の恩恵を受けることができます。優れた IDE サポートに加えて、Kotlin はフレームワーク固有のツールも提供しており、例えば IntelliJ IDEA Ultimate では Spring や Ktor のサポートが利用できます。

### Spring {id="spring"}

[Spring](https://spring.io) は、Kotlin の言語機能を活用して、より簡潔な API を提供しています。[オンラインプロジェクトジェネレーター](https://start.spring.io/#!language=kotlin)を使用すると、Kotlin の新しいプロジェクトを素早く生成できます。

<a href="jvm-get-started-spring-boot.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Spring Boot と Kotlin をはじめる</a>

### Ktor {id="ktor"}

[Ktor](https://github.com/kotlin/ktor) は、Kotlin で Web アプリケーションを作成するための JetBrains 製フレームワークです。高いスケーラビリティのためにコルーチンを使用し、使いやすく慣用的な（idiomatic）API を提供します。

<a href="https://ktor.io/docs/server-create-a-new-project.html" as="button" mode="rock" icon="arrow-right" icon-position="right">新しい Ktor プロジェクトを作成する</a>

### その他のフレームワーク {id="other-frameworks"}

以下は、Kotlin 向けのバックエンドフレームワークのその他の例です。

| フレームワーク | 説明 |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Quarkus](https://quarkus.io/guides/kotlin)            | Kotlin に対するファーストクラスのサポートを提供するオープンソースフレームワーク。Quarkus はゼロから Kubernetes 向けに構築されており、増え続ける数百の最高峰ライブラリを活用することで、まとまりのあるフルスタックフレームワークを提供します。 |
| [Vert.x](https://vertx.io)                             | JVM 上でリアクティブ Web アプリケーションを構築するためのフレームワーク。Vert.x は、[Kotlin コルーチンの統合](https://vertx.io/docs/vertx-lang-kotlin-coroutines/kotlin/)を含む、Kotlin 向けの[専用サポート](https://github.com/vert-x3/vertx-lang-kotlin)を提供しています。 |
| [kotlinx.html](https://github.com/kotlin/kotlinx.html) | Web アプリケーションで HTML を構築するために使用できる DSL。JSP や FreeMarker などの従来のテンプレートシステムの代替として機能します。 |
| [Micronaut](https://micronaut.io/)                     | モジュール化され、テストが容易なマイクロサービスおよびサーバーレスアプリケーションを構築するための、モダンな JVM ベースのフルスタックフレームワーク。ウェビナー「[Micronaut for microservices with Kotlin](https://micronaut.io/2020/12/03/webinar-micronaut-for-microservices-with-kotlin/)」を視聴し、Micronaut フレームワークで [Kotlin の拡張関数](extensions.md#extension-functions)を使用する方法を示す詳細な[ガイド](https://guides.micronaut.io/latest/micronaut-kotlin-extension-fns.html)をご確認ください。 |
| [http4k](https://http4k.org/)                          | 純粋な Kotlin で書かれた、フットプリントが小さい Kotlin HTTP アプリケーション用の関数型ツールキット。http4k は、完全に構成されたプロジェクトテンプレートを生成するための [CLI 対応ツールボックス](https://toolbox.http4k.org)と、選択したバックエンド、モジュール、ビルドツールを使用して動作する http4k アプリケーションをブートストラップするための Web ベースの[プロジェクトウィザード](https://toolbox.http4k.org/project)を提供しています。 |
| [Javalin](https://javalin.io)                          | WebSockets、HTTP2、非同期リクエストをサポートする、Kotlin および Java 向けの非常に軽量な Web フレームワーク。 |

## アプリケーションのデプロイ {id="deploy-your-applications"}

Kotlin アプリケーションは、Amazon Web Services（AWS）、Google Cloud Platform（GCP）など、Java Web アプリケーションをサポートする任意のホストにデプロイできます。

* **AWS** は、そのサービスと対話するための専用の [SDK for Kotlin](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/home.html) を提供しています。サーバーレスデプロイについては、[Kotlin 用の AWS Lambda コードサンプル](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/kotlin_lambda_code_examples.html)を参照してください。
* **Ktor** を使用すると、Kotlin アプリケーションをさまざまなクラウドプロバイダーに公開できます。たとえば、Ktor のチュートリアルに従って、[Google App Engine](https://ktor.io/docs/google-app-engine.html) やその他のサービスへのデプロイについて詳しく学ぶことができます。
* **Spring** アプリケーションも、主要なクラウドプロバイダーのほとんどに対応しています。Spring Boot アプリケーションをクラウドにデプロイする方法については、[公式 Spring ドキュメント](https://docs.spring.io/spring-boot/how-to/deployment/cloud.html)を参照してください。

## コミュニティに参加する {id="join-the-community"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: [招待を受け取り](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)、[#spring](https://kotlinlang.slack.com/archives/C0B8ZTWE4) および [#server](https://kotlinlang.slack.com/archives/C0B8RC352) チャンネルに参加する
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**: ["kotlin"](https://stackoverflow.com/questions/tagged/kotlin)、["spring-kotlin"](https://stackoverflow.com/questions/tagged/spring-kotlin)、または ["ktor"](https://stackoverflow.com/questions/tagged/ktor) タグを購読する
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube チャンネル**: チャンネル登録して、[Kotlin with Spring](https://www.youtube.com/playlist?list=PLlFc5cFwUnmxOJL0GSSZ1Vot4KL2Vwe7x) に関する動画を視聴する

## 次のステップ {id="next-steps"}

* [Kotlin と JUnit を使用して Java Maven プロジェクトをテストする方法を学ぶ](jvm-test-using-junit.md)
* [Ktor を使用して非同期サーバーアプリケーションを構築する方法を学ぶ](https://ktor.io/docs/server-create-a-new-project.html)
* [Kotlin バックエンド開発に関する FAQ でよくある質問の回答を見つける](jvm-backend-faq.md)