[//]: # (title: Maven)

Maven は、Kotlin のみのプロジェクトや Kotlin と Java が混在するプロジェクトの管理、およびビルドプロセスの自動化を支援するビルドシステムです。
JVM ベースのプロジェクトで動作し、必要な依存関係のダウンロード、コードのコンパイル、パッケージングを行います。
基本事項や詳細については、[Maven](https://maven.apache.org/) の Web サイトをご覧ください。

Kotlin Maven プロジェクトを扱う際の一般的なワークフローは以下のとおりです。

1. [Java または Kotlin プロジェクトの設定](maven-configure-project.md)
2. [リポジトリの宣言](maven-set-dependencies.md#declare-repositories)
3. [プロジェクトの依存関係の設定](maven-set-dependencies.md)
4. [Kotlin コンパイラの設定](maven-kotlin-compiler.md)
5. [アプリケーションのパッケージング](maven-compile-package.md)

使用を開始するには、以下のステップバイステップのチュートリアルに従うこともできます。

* [Kotlin を使用するための Java プロジェクトの設定](mixing-java-kotlin-intellij.md)
* [Kotlin と JUnit を使用した Java Maven プロジェクトのテスト](jvm-test-using-junit.md)

> Kotlin/Java 混在プロジェクト向けに Maven と Gradle の両方のビルドファイルがあらかじめ設定された、公開[サンプルプロジェクト](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)を確認できます。
>
{style="tip"}

## 次のステップ {id="what-s-next"}

* [`power-assert` プラグイン](power-assert.md#maven)を使用して**デバッグ体験を向上させる**。
* [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/) を使用して**テストカバレッジを測定し、レポートを生成する**。
* [kapt プラグイン](kapt.md#set-up-in-maven)を使用して**アノテーション処理を設定する**。
* [Dokka ドキュメンテーションエンジン](dokka-maven.md)を使用して**ドキュメントを生成する**。
  混在言語プロジェクトをサポートしており、標準の Javadoc を含む複数の形式で出力を生成できます。
* [`kotlin-osgi-bundle`](kotlin-osgi.md#maven) を追加して **OSGi サポートを有効にする**。
* マルチモジュールビルド、テスト、パッケージング、公開に関する一般的な質問への回答を、[Kotlin バックエンド開発の FAQ](jvm-backend-faq.md) で**確認する**。