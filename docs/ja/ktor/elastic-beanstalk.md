[//]: # (title: AWS Elastic Beanstalk)

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

このチュートリアルでは、Ktorアプリケーションを準備し、AWS Elastic Beanstalkにデプロイする方法を説明します。[Ktorサーバーを作成する](server-create-and-configure.topic)方法に応じて、以下のいずれかの初期プロジェクトを使用できます。
* [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server)
* [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)

> Javaアプリケーションのデプロイについての詳細は、[Elastic Beanstalkのドキュメント](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Java.html)を参照してください。

## 前提条件 {id="prerequisites"}
このチュートリアルを開始する前に、AWSアカウントを作成する必要があります。

## サンプルアプリケーションのクローン {id="clone"}
サンプルアプリケーションを開くには、以下の手順に従います。

1. Ktorドキュメントのリポジトリをクローンし、[codeSnippets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) プロジェクトを開きます。
2. [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) または [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) サンプルを開きます。これらのサンプルは、コード内または設定ファイルを使用して [Ktorサーバーを作成および設定する](server-create-and-configure.topic)ための、異なるアプローチを示しています。これらのプロジェクトをデプロイする際の唯一の違いは、着信リクエストをリッスンするために使用する [ポートの指定方法](#port) です。

## アプリケーションの準備 {id="prepare-app"}

### ステップ 1: ポートを設定する {id="port"}

まず、着信リクエストをリッスンするために使用するポートを指定する必要があります。Elastic Beanstalkは、ポート 5000 でアプリケーションにリクエストを転送します。オプションで、`PORT` 環境変数を設定することでデフォルトのポートをオーバーライドできます。[Ktorサーバーを設定する](server-create-and-configure.topic)方法に応じて、以下のいずれかの方法でポートを設定できます。
* コードでサーバー設定を指定する [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) サンプルを選択した場合は、`System.getenv` を使用して環境変数の値を取得するか、環境変数が指定されていない場合はデフォルトの _5000_ の値を使用できます。`src/main/kotlin/com/example` フォルダにある `Application.kt` ファイルを開き、以下に示すように `embeddedServer` 関数の `port` パラメータ値を変更します。
   ```kotlin
   fun main() {
      embeddedServer(Netty, port = (System.getenv("PORT")?:"5000").toInt()) {
      // ...
      }.start(wait = true)
   }
    ```

* `application.conf` ファイルでサーバー設定を指定する [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) サンプルを選択した場合は、`${ENV}` 構文を使用して `port` パラメータに環境変数を割り当てることができます。`src/main/resources` にある `application.conf` ファイルを開き、以下のように更新します。
   ```
   ktor {
       deployment {
           port = 5000
           port = ${?PORT}
       }
   }
   ```

### ステップ 2: Ktorプラグインを適用する {id="configure-ktor-plugin"}
このチュートリアルでは、[fat JAR](server-fatjar.md) を使用してアプリケーションを Elastic Beanstalk にデプロイする方法を示します。fat JARを生成するには、Ktorプラグインを適用する必要があります。`build.gradle.kts` ファイルを開き、`plugins` ブロックにプラグインを追加します。
```groovy
plugins {
    id("io.ktor.plugin") version "3.4.3"
}
```

次に、[メインアプリケーションクラス](server-dependencies.topic#create-entry-point)が設定されていることを確認してください。
```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

## Fat JAR のビルド {id="build"}
Fat JARをビルドするには、ターミナルを開き、[Ktorプラグイン](#configure-ktor-plugin)によって提供される `buildFatJar` タスクを実行します。

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :aws-elastic-beanstalk:buildFatJar"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :aws-elastic-beanstalk:buildFatJar"></code-block>
</TabItem>
</Tabs>

このビルドが完了すると、`build/libs` ディレクトリに `aws-elastic-beanstalk-all.jar` ファイルが確認できるはずです。

## アプリケーションのデプロイ {id="deploy-app"}
アプリケーションをデプロイするには、[AWS マネジメントコンソール](https://aws.amazon.com/console/)にサインインし、以下の手順に従います。
1. **AWS サービス**グループの **Elastic Beanstalk** サービスを開きます。
2. 開いたページで、**アプリケーションの作成 (Create Application)** をクリックします。
3. 以下のアプリケーション設定を指定します。
   * **アプリケーション名 (Application name)**: アプリケーション名を指定します (例: _Sample Ktor app_)。
   * **プラットフォーム (Platform)**: リストから **Java** を選択します。
   * **プラットフォームブランチ (Platform branch)**: **Corretto 11 running on 64bit Amazon Linux 2** を選択します。
   * **アプリケーションコード (Application code)**: **コードのアップロード (Upload your code)** を選択します。
   * **ソースコードのオリジン (Source code origin)**: **ローカルファイル (Local file)** を選択します。次に、**ファイルの選択 (Choose file)** ボタンをクリックし、[前のステップ](#build)で生成した Fat JAR を選択します。ファイルがアップロードされるまで待ちます。
4. **アプリケーションの作成 (Create application)** ボタンをクリックし、Beanstalk が環境を作成してアプリケーションを公開するまで数分待ちます。
   ```
   INFO    Instance deployment completed successfully.
   INFO    Application available at Samplektorapp-env.eba-bnye2kpu.us-east-2.elasticbeanstalk.com.
   INFO    Successfully launched environment: Samplektorapp-env
   ```
   {style="block"}