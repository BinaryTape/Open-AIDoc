[//]: # (title: アプリケーションディストリビューションの作成)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>Code example</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradleプラグイン](https://github.com/ktorio/ktor-build-plugins)は、Gradleの[Applicationプラグイン](https://docs.gradle.org/current/userguide/application_plugin.html)を自動的に適用します。これにより、コードの依存関係や生成された起動スクリプトを含むアプリケーションのパッケージング機能が提供されます。

このトピックでは、Ktorアプリケーションをパッケージ化して実行する方法について学びます。

## Ktorプラグインの設定 {id="configure-plugin"}

アプリケーションディストリビューションを作成するには、まずKtorプラグインを適用する必要があります。
1. <Path>build.gradle.kts</Path> ファイルを開き、`plugins {}` ブロックにプラグインを追加します:
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
   </note>

2. [メインアプリケーションクラス](server-dependencies.topic#create-entry-point)が設定されていることを確認します:
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## アプリケーションのパッケージング {id="package"}

Applicationプラグインは、アプリケーションをパッケージ化するためのさまざまな方法を提供します。例えば、`installDist` タスクは、すべてのランタイム依存関係と起動スクリプトを含めてアプリケーションをインストールします。完全なディストリビューションアーカイブを作成するには、`distZip` および `distTar` タスクを使用できます。

すべてのランタイム依存関係と起動スクリプトを含めてアプリケーションをインストールするには、新しいターミナルウィンドウを開いて `installDist` タスクを実行します:
   
<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew installDist"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat installDist"/>
</TabItem>
</Tabs>

Applicationプラグインによって、<Path>build/install/<project_name></Path> フォルダ内にアプリケーションのイメージが作成されます。 

## アプリケーションの実行 {id="run"}

[パッケージ化されたアプリケーション](#package)を実行するには、以下の手順に従います:

1. ターミナルで <Path>build/install/<project_name>/bin</Path> フォルダに移動します。
2. オペレーティングシステムに応じて、`<project_name>` または `<project_name>.bat` 実行可能ファイルを実行します（例）:

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 次のメッセージが表示されるまで待ちます:
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   ブラウザでリンクを開き、実行中のアプリケーションを確認します:

   <img src="ktor_idea_new_project_browser.png" alt="Ktor app in a browser" width="430"/>