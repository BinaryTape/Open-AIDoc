[//]: # (title: Ktor アプリケーションを AWS Elastic Beanstalk にデプロイする)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>初期プロジェクト</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a> または 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>最終プロジェクト</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/aws-elastic-beanstalk">aws-elastic-beanstalk</a>
</p>
</tldr>

このチュートリアルでは、Ktor アプリケーションを準備し、Amazon Web Services (AWS) Elastic Beanstalk にデプロイする方法を学びます。
[Ktor サーバーの作成](server-create-and-configure.topic)方法に応じて、以下のいずれかの初期プロジェクトを使用できます。
* [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server)
* [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)

> AWS Elastic Beanstalk への Java アプリケーションのデプロイについての詳細は、[Elastic Beanstalk のドキュメント](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Java.html)を参照してください。
>
{style="tip"}

## 前提条件 {id="prerequisites"}

このチュートリアルを開始する前に、AWS アカウントを作成する必要があります。

## サンプルアプリケーションのクローン {id="clone"}
サンプルアプリケーションを開くには、以下の手順に従います。

1. Ktor ドキュメントリポジトリをクローンし、[codeSnippets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) プロジェクトを開きます。
2. [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) または [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) サンプルを開きます。これらのサンプルは、コード内または設定ファイルを使用する、[Ktor サーバーの作成と設定](server-create-and-configure.topic)の異なるアプローチを示しています。これらのプロジェクトのデプロイにおける唯一の違いは、受信リクエストをリッスンするために使用する[ポートの指定方法](#port)です。

## アプリケーションの準備 {id="prepare-app"}

### ステップ 1: ポートの設定 {id="port"}

まず、受信リクエストをリッスンするために使用するポートを指定する必要があります。Elastic Beanstalk はポート 5000 でアプリケーションにリクエストを転送します。必要に応じて、`PORT` 環境変数を設定することでデフォルトのポートをオーバーライドできます。[Ktor サーバーの設定](server-create-and-configure.topic)方法に応じて、次のいずれかの方法でポートを設定できます。
* コード内でサーバー設定を指定する [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) サンプルを選択した場合、`System.getenv` を使用して環境変数の値を取得するか、環境変数が指定されていない場合はデフォルト値の _5000_ を使用できます。`src/main/kotlin/com/example` フォルダにある `Application.kt` ファイルを開き、以下のように `embeddedServer` 関数の `port` パラメーター値を変更します。
   ```kotlin
   fun main() {
      embeddedServer(Netty, port = (System.getenv("PORT")?:"5000").toInt()) {
      // ...
      }.start(wait = true)
   }
    ```

* `application.conf` ファイルでサーバー設定を指定する [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) サンプルを選択した場合、`${ENV}` 構文を使用して `port` パラメーターに環境変数を割り当てることができます。`src/main/resources` にある `application.conf` ファイルを開き、以下のように更新します。
   ```
   ktor {
       deployment {
           port = 5000
           port = ${?PORT}
       }
   }
   ```

### ステップ 2: Ktor プラグインの適用 {id="configure-ktor-plugin"}

このチュートリアルでは、[fat JAR](server-fatjar.md) を使用して AWS Elastic Beanstalk にアプリケーションをデプロイする方法を示します。fat JAR を生成するには、Ktor プラグインを適用する必要があります。

<Path>build.gradle.kts</Path> ファイルを開き、`plugins {}` ブロックにプラグインを追加します。
```groovy
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

<note>
    上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
    Ktor バージョンカタログ</a>を使用しています。
</note>

次に、[メインアプリケーションクラス](server-dependencies.topic#create-entry-point)が設定されていることを確認します。
```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

## Fat JAR のビルド {id="build"}

Fat JAR をビルドするには、ターミナルを開き、[Ktor プラグイン](#configure-ktor-plugin)によって提供される `buildFatJar` タスクを実行します。

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :aws-elastic-beanstalk:buildFatJar"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :aws-elastic-beanstalk:buildFatJar"/>
</TabItem>
</Tabs>

このビルドが完了すると、<Path>build/libs</Path> ディレクトリに `aws-elastic-beanstalk-all.jar` ファイルが生成されます。

## アプリケーションのデプロイ {id="deploy-app"}
アプリケーションをデプロイするには、[AWS マネジメントコンソール](https://aws.amazon.com/console/)にサインインし、以下の手順に従います。
1. **AWS サービス**グループにある **Elastic Beanstalk** サービスを開きます。
2. 開いたページで、**Create Application** をクリックします。
3. 以下のアプリケーション設定を指定します。
   * **Application name**: アプリケーション名を指定します（例: _Sample Ktor app_）。
   * **Platform**: リストから _Java_ を選択します。
   * **Platform branch**: _Corretto 11 running on 64bit Amazon Linux 2_ を選択します。
   * **Application code**: _Upload your code_ を選択します。
   * **Source code origin**: _Local file_ を選択します。次に、**Choose file** ボタンをクリックし、[前のステップ](#build)で生成された Fat JAR を選択します。ファイルのアップロードが完了するまで待ちます。
4. **Create application** ボタンをクリックし、Beanstalk が環境を作成してアプリケーションを公開するまで数分待ちます。
   ```
   INFO    Instance deployment completed successfully.
   INFO    Application available at Samplektorapp-env.eba-bnye2kpu.us-east-2.elasticbeanstalk.com.
   INFO    Successfully launched environment: Samplektorapp-env
   ```
   {style="block"}