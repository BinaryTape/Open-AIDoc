[//]: # (title: Compose Hot Reload)

Compose Hot Reload は、Compose Multiplatform プロジェクトでの作業中に UI の変更を視覚化し、試行錯誤するのに役立ちます。
テストデータを使用して個別のコンポーネントを表示するのに役立つ標準的な [Compose プレビュー](compose-previews.md)とは異なり、Compose Hot Reload はコードの変更を実行中のアプリケーションに直接適用します。

同梱されている Compose Hot Reload Gradle プラグインは、Kotlin 2.1.20 以上、および Java 21 以前と互換性のある JVM ターゲットを必要とします。
Compose Hot Reload の全機能を使用するには、[Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)をインストールすることをお勧めします。これは、IntelliJ IDEA バージョン 2025.2.2 以降、および Android Studio Otter 2025.2.1 以降で利用可能です。

他のターゲットへのサポート追加を検討中ですが、現時点でもデスクトップアプリをサンドボックスとして使用し、作業の流れを中断することなく共通コード（common code）内の UI 変更を素早く試すことができます。

<img src="KotlinConf-hot-reload.animated.gif" alt="Compose Hot Reload" width="600" preview-src="KotlinConf-hot-reload.png"/>

## プロジェクトへの Compose Hot Reload の追加

Compose Hot Reload は、次の 2 つの方法で追加できます。

* [IntelliJ IDEA または Android Studio でプロジェクトを新規作成する](#from-scratch)
* [既存のプロジェクトに Gradle プラグインを追加する](#to-an-existing-project)

### 新規作成する場合

このセクションでは、IntelliJ IDEA および Android Studio でデスクトップターゲットを含むマルチプラットフォームプロジェクトを作成する手順を説明します。プロジェクトが作成されると、Compose Hot Reload が自動的に追加されます。

1. [クイックスタート](quickstart.md)の[「Kotlin Multiplatform 開発のための環境構築」](quickstart.md#set-up-the-environment)の手順を完了します。
2. IDE で、**File** | **New** | **Project** を選択します。
3. 左側のパネルで **Kotlin Multiplatform** を選択します。
4. **New Project** ウィンドウで **Name**、**Group**、**Artifact** フィールドを指定します。
5. **Desktop** ターゲットを選択し、**Create** をクリックします。
   ![Create multiplatform project with desktop target](create-desktop-project.png){width=600 style="block"}

### 既存のプロジェクトに追加する場合

Compose Multiplatform 1.10.0 以降、Compose Hot Reload プラグインは[同梱](whats-new-compose-110.md#compose-hot-reload-integration)されており、**デスクトップターゲット**を含むすべてのプロジェクトでデフォルトで有効になっています。

プロジェクトにすでにデスクトップターゲットが含まれている場合は、Compose Multiplatform バージョン 1.10.0 以降にアップグレードするだけで、Compose Hot Reload の機能を設定不要で（out-of-the-box）使用できます。

デフォルトで有効になっていますが、特定の古いバージョンを使用するために Compose Hot Reload プラグインを明示的に宣言することも可能です。

#### 以前のバージョンの Compose Multiplatform {initial-collapse-state="collapsed" collapsible="true"}

1.10.0 より前のバージョンの Compose Multiplatform を使用しているマルチプラットフォームプロジェクトでは、デスクトップターゲットが設定されている必要があり、その上で Compose Hot Reload プラグインを明示的に追加する必要があります。以下の手順は、[「共有ロジックと UI を備えたアプリの作成」](compose-multiplatform-create-first-app.md)チュートリアルのプロジェクトを参考にしています。

1. デスクトップターゲットを導入します。`desktopApp` ディレクトリを作成し、`main()` 関数を定義し、`actual` 実装を提供します。
   プロジェクトにすでにデスクトップターゲットが含まれている場合は、このステップをスキップできます。
   参考として、[「JVM エントリポイントの追加」](migrate-from-android.md#optional-add-a-jvm-entry-point)のサンプルを参照してください。
 
2. バージョンカタログを Compose Hot Reload の最新バージョンで更新します（[リリースページ](https://github.com/JetBrains/compose-hot-reload/releases)を参照）。
   `gradle/libs.versions.toml` に以下のコードを追加します。
   ```toml
   composeHotReload = { id = "org.jetbrains.compose.hot-reload", version.ref = "composeHotReload"}
   ```

   > プロジェクト全体の依存関係を中央管理するためのバージョンカタログの使用方法については、[Gradle のベストプラクティス](https://kotlinlang.org/gradle-best-practices.html)（英語）を参照してください。

3. 親プロジェクトの `build.gradle.kts` (`ComposeDemo/build.gradle.kts`) の `plugins {}` ブロックに、以下のコードを追加します。
   ```kotlin
   plugins {
       alias(libs.plugins.composeHotReload) apply false
   }
   ```
   これにより、各サブプロジェクトで Compose Hot Reload プラグインが複数回ロードされるのを防ぎます。

4. マルチプラットフォームアプリケーションを含むサブプロジェクトの `build.gradle.kts` (`ComposeDemo/sharedUI/build.gradle.kts`) の `plugins {}` ブロックに、以下のコードを追加します。
   ```kotlin
   plugins { 
       alias(libs.plugins.composeHotReload)
   }
   ```

5. プロジェクトは、拡張されたクラス再定義をサポートする OpenJDK フォークである [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) (JBR) 上で実行する必要があります。
   Compose Hot Reload は、プロジェクトに互換性のある JBR を自動的にプロビジョニングできます。

   > 最新の JetBrains Runtime は Java 21 のみをサポートしています。
   > Java 22 以降にのみ互換性のあるプロジェクトに Compose Hot Reload を追加した場合、
   > プロジェクトを実行するとリンケージエラーが発生します。
   > 
   {style="warning"}

   自動プロビジョニングを許可するには、`settings.gradle.kts` ファイルに以下の Gradle プラグインを追加します。

   ```kotlin
   plugins {
       id("org.gradle.toolchains.foojay-resolver-convention") version "%foojayResolverConventionVersion%"
   }
   ```

6. **Sync Gradle Changes** ボタンをクリックして、Gradle ファイルを同期します： ![Synchronize Gradle files](gradle-sync.png){width=50}

## Compose Hot Reload の使用

1. `desktopApp` ソースセットで `main.kt` ファイルを開き、`main()` 関数を更新します。
   ```kotlin
   fun main() = application {
       Window(
           onCloseRequest = ::exitApplication,
           alwaysOnTop = true,
           title = "composedemo",
       ) {
           App()
       }
   }
   ```
   `alwaysOnTop` 変数を `true` に設定することで、生成されたデスクトップアプリがすべてのウィンドウの最前面に表示されるようになり、コードを編集して変更をリアルタイムで確認しやすくなります。

2. `App.kt` ファイルを開き、`Button` コンポーザブルを更新します。
   ```kotlin
   Button(onClick = { showContent = !showContent }) {
       Column {
           Text(Greeting().greet())
       }
   }
   ```
   これで、ボタンのテキストが `greet()` 関数によって制御されるようになります。

3. `Greeting.kt` ファイルを開き、`greet()` 関数を更新します。
   ```kotlin
    fun greet(): String {
        return "Hello!"
    }
   ```

4.  `main.kt` ファイルを開き、ガターにある **Run** アイコンをクリックします。
    **Run 'desktopApp' with Compose Hot Reload** を選択します。

    ![Run Compose Hot Reload from gutter](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}

    ![First Compose Hot Reload on desktop app](compose-hot-reload-hello.png){width=500 border-effect="line"}

5. `greet()` 関数から返される文字列を更新し、すべてのファイルを保存（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）して、デスクトップアプリが自動的に更新されるのを確認します。

   ![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

   あるいは、割り当てられたショートカットキーを押すか、**Reload UI** ボタンをクリックして、明示的にリロードをトリガーすることもできます。
   トリガーの動作は、**Settings | Tools | Compose Hot Reload** ページで変更できます。

おめでとうございます！Compose Hot Reload の動作を確認できました。これで、変更のたびにデスクトップの実行構成を再起動することなく、テキスト、画像、フォーマット、UI 構造などの変更を試すことができます。

## AI エージェント用 MCP サーバー
<primary-label ref="Experimental"/>

[//]: # (TODO update version for stable release)

Compose Multiplatform 1.2.0-beta01 以降、Compose Hot Reload には組み込みの [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーが含まれています。
MCP サーバーを使用すると、AI コーディングエージェントが実行中の Compose アプリケーションと対話できるようになります。具体的には、Compose Hot Reload のトリガー、レンダリングされた UI の確認、セマンティック構造の検査、ユーザー入力のシミュレート、および実行時ログの読み取りが可能です。
複数のウィンドウを持つアプリケーションの場合、エージェントはウィンドウを一覧表示し、そのいずれかをターゲットに指定できます。

これにより、Compose コードの編集時における AI エージェントのフィードバックループが完結します。
編集のたびに手動で結果を確認する必要はなく、エージェントが自律的にコードを反復処理し、各変更を検証できます。

### AI エージェントの接続

AI エージェントを Compose アプリケーションと対話させるには、以下の手順に従います。

1. Gradle タスクを使用して、アプリケーションと一緒に MCP サーバーを起動します。
    ```shell
    ./gradlew :composeApp:hotMcpServerJvm
    ```
   タスク名は標準的な命名規則 `hotMcpServer<TargetName>` に従います。
   たとえば、`desktop` という名前のカスタム JVM ターゲットの場合、タスクは `:composeApp:hotMcpServerDesktop` になります。
2. AI エージェントの MCP クライアント設定で Gradle タスクを指定します。たとえば、`.mcp.json` では以下のようになります。
    ```json
    {
      "mcpServers": {
        "compose-hot-reload": {
          "command": "./gradlew",
          "args": [
            "--no-daemon",
            "--quiet",
            "--console=plain",
            "hotMcpServer"
          ]
        }
      }
    }
    ```

### 利用可能な MCP ツール

MCP サーバーは、エージェントが呼び出すことができる一連のツールを公開しています。これには以下が含まれます。

* `reload` — プロジェクトを再コンパイルし、変更されたクラスをホットリロードします。
* `take_screenshot` — アプリケーションウィンドウの現在の状態をキャプチャします。
* `get_semantic_tree` — Compose の[セマンティックツリー](compose-accessibility.md#semantic-properties)を返し、エージェントが UI 構造を理解できるようにします。
* `get_logs` — 実行中のアプリケーションからの最近のログ出力（実行時例外を含む）を返します。
* `click`、`type_text`、`scroll` — ユーザー入力をシミュレートし、インタラクティブなフローをテストします。

MCP ツールとそのパラメータの完全なリストについては、[Compose Hot Reload の README](https://github.com/JetBrains/compose-hot-reload#mcp-server-for-ai-agents) を参照してください。

## ヘルプを得る

Compose Hot Reload の使用中に問題が発生した場合は、[GitHub イシューを作成](https://github.com/JetBrains/compose-hot-reload/issues)してお知らせください。