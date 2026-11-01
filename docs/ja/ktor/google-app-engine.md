[//]: # (title: Ktor アプリを Google App Engine にデプロイする)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>初期プロジェクト</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>完成版プロジェクト</control>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard">google-appengine-standard</a>
</p>
</tldr>

<web-summary>
このチュートリアルでは、Ktor プロジェクトを準備して Google App Engine スタンダード環境にデプロイする方法を説明します。
</web-summary>

<link-summary>
プロジェクトを Google App Engine スタンダード環境にデプロイする方法を学びます。
</link-summary>

このチュートリアルでは、Ktor プロジェクトを準備して Google App Engine スタンダード環境にデプロイする方法を学びます。
本チュートリアルでは、[engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) サンプルプロジェクトを出発点として使用します。

## 前提条件 {id="prerequisites"}

このチュートリアルを開始する前に、以下の手順を完了してください。
* [Google Cloud Platform](https://console.cloud.google.com/) に登録します。
* [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) をインストールして初期化します。
* 次のコマンドを使用して、Java 用の App Engine 拡張機能をインストールします。
   ```Bash
   gcloud components install app-engine-java
   ```

## サンプルアプリケーションのクローン {id="clone"}

サンプルアプリケーションを開くには、以下の手順に従います。

1. Ktor ドキュメントのリポジトリをクローンし、[`codeSnippets`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) プロジェクトを開きます。
2. [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) モジュールを開きます。
   > Ktor は[サーバーの作成と設定](server-create-and-configure.topic)に関して、コード内で行うアプローチと設定ファイルで行うアプローチの2通りを提供しています。このチュートリアルにおけるデプロイ手順は、どちらのアプローチでも同じです。
   >
   {style="note"}

## アプリケーションの準備 {id="prepare-app"}

### ステップ 1: Shadow プラグインの適用 {id="configure-shadow-plugin"}

このチュートリアルでは、[fat JAR](server-fatjar.md) を使用してアプリケーションを Google App Engine にデプロイする方法を説明します。fat JAR を生成するには、Shadow プラグインを適用する必要があります。

まず、<Path>gradle/libs.versions.toml</Path> ファイルを開き、Shadow プラグインのバージョンとそのエイリアスを定義します。

```toml
[versions]
shadow = "8.3.10"

[plugins]
shadow = { id = "com.gradleup.shadow", version.ref = "shadow" }
```

次に、<Path>build.gradle.kts</Path> ファイルを開き、`plugins` ブロックにプラグインを追加します。
```kotlin
plugins {
    alias(libs.plugins.shadow)
}
```

### ステップ 2: App Engine プラグインの設定 {id="configure-app-engine-plugin"}

[Google App Engine Gradle プラグイン](https://github.com/GoogleCloudPlatform/app-gradle-plugin)は、Google App Engine アプリケーションのビルドおよびデプロイを行うタスクを提供します。このプラグインを使用するには、以下の手順に従います。

1. <Path>settings.gradle.kt</Path> ファイルを開き、以下のコードを使用して Central Maven リポジトリからプラグインを参照します。
   ```kotlin
   pluginManagement {
       repositories {
           if (!providers.gradleProperty("build_snapshot_train").orNull.isNullOrEmpty()) {
               mavenLocal()
               maven("https://redirector.kotlinlang.org/maven/dev")
           }
           gradlePluginPortal()
           mavenCentral()
           maven("https://redirector.kotlinlang.org/maven/ktor-eap")
       }
       resolutionStrategy {
           eachPlugin {
               if (requested.id.id.startsWith("com.google.cloud.tools.appengine")) {
                   useModule("com.google.cloud.tools:appengine-gradle-plugin:${requested.version}")
   ```

2. <Path>build.gradle.kts</Path> ファイルを開き、`plugins` ブロックでプラグインを適用します。
   ```kotlin
   plugins {
       alias(libs.plugins.appengine)
   }
   ```

3. 同じ <Path>build.gradle.kts</Path> ファイル内で、以下の設定を含む `appengine` ブロックを追加します。
   ```kotlin
   import com.google.cloud.tools.gradle.appengine.appyaml.AppEngineAppYamlExtension
   configure<AppEngineAppYamlExtension> {
       stage {
           setArtifact("build/libs/${project.name}-all.jar")
       }
       deploy {
           version = "GCLOUD_CONFIG"
           projectId = "GCLOUD_CONFIG"
       }
   }
   ```

### ステップ 3: App Engine 設定の構成 {id="configure-app-engine-settings"}

アプリケーション用の App Engine の設定は、[<Path>app.yaml</Path>](https://cloud.google.com/appengine/docs/standard/python/config/appref) ファイルで行います。
1. <Path>src/main</Path> 内に <Path>appengine</Path> ディレクトリを作成します。
2. このディレクトリ内に <Path>app.yaml</Path> ファイルを作成し、次のコンテンツを追加します。
   ```yaml
   runtime: java21
   entrypoint: 'java -jar google-appengine-standard-all.jar'
   
   ```

   `google-appengine-standard` をお使いのプロジェクト名に置き換えてください。

   `entrypoint` オプションには、アプリケーション用に生成された fat JAR を実行するためのコマンドを指定します。

   > サポートされている設定オプションの詳細については、[Google App Engine のドキュメント](https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=java)を参照してください。
   >
   {style="tip"}

## アプリケーションのデプロイ {id="deploy-app"}

アプリケーションをデプロイするには、新しいターミナルウィンドウを開き、以下の手順に従います。

1. まず、アプリケーションリソースを保持する最上位コンテナである Google Cloud プロジェクトを作成します。例えば、以下のコマンドは `ktor-sample-app-engine` という名前のプロジェクトを作成します。
   ```Bash
   gcloud projects create ktor-sample-app-engine --set-as-default
   ```
   
2. Cloud プロジェクト用の App Engine アプリケーションを作成します。
   ```Bash
   gcloud app create
   ```

3. アプリケーションをデプロイするには、`appengineDeploy` Gradle タスクを実行します。
   ```Bash
   ./gradlew appengineDeploy
   ```
4. Google Cloud がアプリケーションをビルドして公開するまで待ちます。
   ```
   ...done.
   Deployed service [default] to [https://ktor-sample-app-engine.ew.r.appspot.com]
   ```
   {style="block"}
   > ビルド中に `Cloud Build has not been used in project` エラーが発生した場合は、エラーレポートに記載された手順に従って有効化してください。
   >
   {style="note"}

   > 完全なコード例については、[google-appengine-standard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard) を参照してください。
   > 
   {style="tip"}