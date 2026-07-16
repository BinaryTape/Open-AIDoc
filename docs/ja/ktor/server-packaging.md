[//]: # (title: アプリケーション配布物の作成)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle プラグイン](https://github.com/ktorio/ktor-build-plugins)は、コードの依存関係や生成された起動スクリプトを含むアプリケーションのパッケージ化機能を提供する Gradle の [Application プラグイン](https://docs.gradle.org/current/userguide/application_plugin.html)を自動的に適用します。
このトピックでは、Ktor アプリケーションをパッケージ化して実行する方法について説明します。

## Ktor プラグインの設定 {id="configure-plugin"}
アプリケーションの配布物を作成するには、まず Ktor プラグインを適用する必要があります。
1. `build.gradle.kts` ファイルを開き、`plugins` ブロックにプラグインを追加します。
   ```kotlin
   plugins {
       id("io.ktor.plugin") version "3.4.0"
   }
   ```

2. [メインアプリケーションクラス](server-dependencies.topic#create-entry-point)が設定されていることを確認します。
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## アプリケーションのパッケージ化 {id="package"}
Application プラグインは、アプリケーションをパッケージ化するためのさまざまな方法を提供しています。例えば、`installDist` タスクは、すべてのランタイム依存関係と起動スクリプトを含めてアプリケーションをインストールします。完全な配布アーカイブを作成するには、`distZip` タスクや `distTar` タスクを使用できます。

このトピックでは、`installDist` を使用します。
1. ターミナルを開きます。
2. オペレーティングシステムに応じて、次のいずれかの方法で `installDist` タスクを実行します。
   
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./gradlew installDist"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="gradlew.bat installDist"></code-block>
   </TabItem>
   </Tabs>

   Application プラグインは、`build/install/<project_name>` フォルダにアプリケーションのイメージを作成します。

## アプリケーションの実行 {id="run"}
[パッケージ化されたアプリケーション](#package)を実行するには：
1. ターミナルで `build/install/<project_name>/bin` フォルダに移動します。
2. オペレーティングシステムに応じて、`<project_name>` または `<project_name>.bat` 実行ファイルを実行します。例：

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"></code-block>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 次のメッセージが表示されるまで待ちます。
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   ブラウザでリンクを開き、実行中のアプリケーションを確認します。

   <img src="ktor_idea_new_project_browser.png" alt="Ktor app in a browser" width="430"/>