[//]: # (title: Kotlinをはじめよう)

<tldr>
<p>Kotlinの最新リリース:<b> <a href="%kotlinLatestWhatsnew%">%kotlinVersion%</a></b></p>
</tldr>

Kotlinは、簡潔でマルチプラットフォームに対応し、Javaや他の言語との相互運用性を備えたモダンな言語です。

Kotlinが初めてですか？ブラウザ上で直接基本を学べるツアーに参加しましょう。

<a href="kotlin-tour-welcome.md"><img src="start-kotlin-tour.svg" width="700" alt="Kotlinツアーを開始する" style="block"/></a>

## Kotlinのインストール

Kotlinは、各[IntelliJ IDEA](https://www.jetbrains.com/idea/download/)および[Android Studio](https://developer.android.com/studio)のリリースに含まれています。
Kotlinを使い始めるには、これらのIDEのいずれかをダウンロードしてインストールしてください。

## Kotlinのユースケースを選択する
 
<tabs>

<tab id="console" title="コンソール">

ここでは、コンソールアプリケーションの開発方法と、Kotlinでのユニットテストの作成方法を学びます。

1. **[IntelliJ IDEAプロジェクトウィザードで基本的なJVMアプリケーションを作成する](jvm-get-started.md)**。

2. **[初めてのユニットテストを作成する](jvm-test-using-junit.md)**。

</tab>

<tab id="backend" title="バックエンド">

ここでは、Kotlinを使用したサーバーサイドのバックエンドアプリケーションの開発方法を学びます。

* **JavaプロジェクトへのKotlinの導入:**

  * [Kotlinと連携するようにJavaプロジェクトを構成する](mixing-java-kotlin-intellij.md)
  * [Java MavenプロジェクトにKotlinのテストを追加する](jvm-test-using-junit.md)

* **Kotlinでバックエンドアプリを一から作成する:**

  * [Spring BootでRESTful Webサービスを作成する](jvm-get-started-spring-boot.md)
  * [KtorでHTTP APIを作成する](https://ktor.io/docs/creating-http-apis.html)

</tab>

<tab id="cross-platform-mobile" title="クロスプラットフォーム">

ここでは、[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html)を使用してクロスプラットフォームアプリケーションを開発する方法を学びます。

1. **[クロスプラットフォーム開発のための環境構築](https://kotlinlang.org/docs/multiplatform/quickstart.html)**。

2. **iOSおよびAndroid向けの初めてのアプリケーションを作成する:**

   * クロスプラットフォームアプリケーションを一から作成する:
     * [UIをネイティブに保ちながらビジネスロジックを共有する](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
     * [ビジネスロジックとUIの両方を共有する](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)
   * [既存のAndroidアプリケーションをiOSで動作させる](https://kotlinlang.org/docs/multiplatform/multiplatform-integrate-in-existing-app.html)
   * [KtorとSQLdelightを使用してクロスプラットフォームアプリケーションを作成する](https://kotlinlang.org/docs/multiplatform/multiplatform-ktor-sqldelight.html)

3. **[サンプルプロジェクト](https://kotlinlang.org/docs/multiplatform/multiplatform-samples.html)を探索する**。

</tab>

<tab id="android" title="Android">

Android開発でKotlinを使い始めるには、Googleの[AndroidでのKotlinの開始方法に関する推奨事項](https://developer.android.com/kotlin/get-started)をお読みください。

</tab>

<tab id="data-analysis" title="データ分析">

データパイプラインの構築から機械学習モデルのプロダクション化まで、Kotlinはデータを扱い、その能力を最大限に引き出すための優れた選択肢です。

1. **データの探索と実験:**

   * [DataFrame](https://kotlin.github.io/dataframe/overview.html) – データ分析と操作のためのライブラリ。
   * [Kandy](https://kotlin.github.io/kandy/welcome.html) – データ可視化のためのプロットツール。

2. **TwitterでKotlin for Data Analysisをフォローする:** [KotlinForData](http://twitter.com/KotlinForData)。

</tab>

</tabs>

## サポートを受ける

困ったことや問題が発生した場合は、![Slack](slack.svg){width=25}{type="joined"} Slackで助けを求めるか（[招待を受ける](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）、[課題トラッカー](https://youtrack.jetbrains.com/issues/KT)で問題を報告してください。

このページに不足している点や分かりにくい点がある場合は、[フィードバックを共有](https://surveys.hotjar.com/d82e82b0-00d9-44a7-b793-0611bf6189df)してください。