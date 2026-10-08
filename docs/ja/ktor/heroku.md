[//]: # (title: Heroku)

<show-structure for="chapter" depth="2"/>

<link-summary>KtorアプリケーションをHerokuにデプロイするための準備とデプロイ方法について学びます。</link-summary>

このチュートリアルでは、KtorアプリケーションをHerokuにデプロイするための準備とデプロイ方法について説明します。

## 前提条件 {id="prerequisites"}

このチュートリアルを開始する前に、以下の前提条件が満たされていることを確認してください。
* Herokuアカウントを持っていること。
* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) がマシンにインストールされていること。

## サンプルアプリケーションの作成 {id="create-sample-app"}

[Ktorプロジェクトの作成、オープン、実行](server-create-a-new-project.topic)の説明に従って、サンプルアプリケーションを作成します。

> Ktorには[サーバーを作成および構成する](server-create-and-configure.topic)ための2つのアプローチ（コード内での設定、または設定ファイルの使用）があることに注意してください。デプロイにおける唯一の違いは、着信リクエストを待機するために使用される[ポートの指定方法](#port)です。
> 
{style="note"}

## アプリケーションの準備 {id="prepare-app"}

### ステップ1：ポートの構成 {id="port"}

まず、着信リクエストを待機するために使用するポートを指定する必要があります。Herokuは `PORT` 環境変数を使用するため、この変数の値を使用するようにアプリケーションを構成する必要があります。[Ktorサーバーを構成する](server-create-and-configure.topic)方法に応じて、以下のいずれかを行ってください。
* サーバーの構成がコード内で指定されている場合は、`System.getenv` を使用して環境変数の値を取得できます。`<Path>src/main/kotlin/com/example</Path>` フォルダにある `<Path>Application.kt</Path>` ファイルを開き、以下に示すように `embeddedServer()` 関数の `port` パラメータの値を変更します。

   ```kotlin
   fun main() {
      embeddedServer(Netty, port = System.getenv("PORT")?.toIntOrNull() ?: 8080) {
          // ...
      }.start(wait = true)
   }
    ```

* サーバーの構成が `<Path>application.conf</Path>` ファイルで指定されている場合は、`${ENV}` 構文を使用して環境変数を `port` パラメータに割り当てることができます。`<Path>src/main/resources</Path>` にある `<Path>application.conf</Path>` ファイルを開き、以下のように更新します。

   ```
   ktor {
       deployment {
           port = 8080
           port = ${?PORT}
       }
   }
   ```

### ステップ2：stageタスクの追加 {id="stage"}

`<Path>build.gradle.kts</Path>` ファイルを開き、カスタム `stage` タスクを追加します。Herokuは `stage` タスクを使用して、Herokuのプラットフォームで実行される実行ファイルを作成します。

```kotlin
tasks {
    create("stage").dependsOn("installDist")
}
``` 

> `installDist` タスクはGradleの [applicationプラグイン](https://docs.gradle.org/current/userguide/application_plugin.html) に含まれており、サンプルプロジェクトにはすでに追加されています。
>
{style="note"}

### ステップ3：Procfileの作成 {id="procfile"}

プロジェクトのルートに [Procfile](https://devcenter.heroku.com/articles/procfile) を作成し、以下の内容を追加します。

```
web: ./build/install/ktor-get-started-sample/bin/ktor-get-started-sample
```

このファイルは、[`stage`](#stage) タスクによって生成されたアプリケーションの実行ファイルへのパスを指定し、Herokuがアプリケーションを開始できるようにします。
`ktor-get-started-sample` をプロジェクト名に置き換える必要がある場合があります。

### ステップ4：Javaバージョンの指定（オプション） {id="java-version"}

デフォルトでは、Herokuはアプリケーションの実行にJava 25を使用します。Ktorアプリケーションが別のJavaバージョンでコンパイルされている場合は、デプロイの失敗を避けるために明示的に指定する必要があります。

Javaバージョンを指定するには、プロジェクトのルートフォルダに以下の内容で `<Path>system.properties</Path>` ファイルを作成します。

```bash
java.runtime.version=21
```

`21` を希望のJavaバージョンに置き換えてください。

> 詳細については、[Javaバージョンの指定に関するHerokuのドキュメント](https://devcenter.heroku.com/articles/java-support#specifying-a-java-version)を参照してください。
>
{style="tip"}

## アプリケーションのデプロイ {id="deploy-app"}

Gitを使用してHerokuにアプリケーションをデプロイするには、新しいターミナルウィンドウを開き、以下の手順に従います。

1. [前のセクション](#prepare-app)で行った変更をローカルにコミットします。
   ```Bash
   git add .
   git commit -m "Prepare app for deploying"
   ```
2. Heroku CLIにログインします。
   ```Bash
   heroku login
   ```
3. `heroku create` コマンドを使用してHerokuアプリケーションを作成します。
   `ktor-sample-heroku` をアプリケーションの名前に置き換えてください。
   ```Bash
   heroku create ktor-sample-heroku
   ```
   このコマンドは2つのことを行います。
   * [Webダッシュボード](https://dashboard.heroku.com/apps/)で利用可能な新しいHerokuアプリケーションを作成します。
   * ローカルリポジトリに `heroku` という名前の新しいGitリモートを追加します。

4. アプリケーションをデプロイするには、変更を `heroku main` にプッシュします。
   ```Bash
   git push heroku main
   ```
5. Herokuがアプリケーションをビルドして公開するまで待ちます。完了すると、次のような出力が表示されます。
   ```bash
   ...
   remote: https://ktor-sample-heroku.herokuapp.com/ deployed to Heroku
   remote:
   remote: Verifying deploy... done.
   ```
