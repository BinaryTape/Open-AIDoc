[//]: # (title: Compose Hot Reload)

Compose Hot Reload は、Compose Multiplatform プロジェクトの開発中に UI の変更を可視化し、素早く試行錯誤するのに役立ちます。
テストデータを使って隔離されたコンポーネントを表示するのに役立つ標準的な [Compose プレビュー](compose-previews.md)とは異なり、Compose Hot Reload はコードの変更を実行中のアプリケーションへ直接適用します。

バンドルされている Compose Hot Reload Gradle プラグインには、Kotlin 2.1.20 以上、および Java 21 以前と互換性のある JVM ターゲットが必要です。
Compose Hot Reload のすべての機能を利用するには、IntelliJ IDEA バージョン 2025.2.2 以降および Android Studio Otter 2025.2.1 以降で利用可能な [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)をインストールすることを推奨します。

他のターゲットのサポートも検討中ですが、現時点でもデスクトップアプリをサンドボックスとして使用することで、開発フローを中断することなく共通コード（common code）の UI の変更をすばやく試すことができます。

<img src="KotlinConf-hot-reload.animated.gif" alt="Compose Hot Reload" width="600" preview-src="KotlinConf-hot-reload.png"/>

## プロジェクトに Compose Hot Reload を追加する {id="add-compose-hot-reload-to-your-project"}

Compose Hot Reload は、以下の2つの方法で追加できます:

* [IntelliJ IDEA または Android Studio で新規プロジェクトを一から作成する](#from-scratch)
* [既存のプロジェクトに Gradle プラグインを追加する](#to-an-existing-project)

### 新規作成する場合 {id="from-scratch"}

このセクションでは、IntelliJ IDEA および Android Studio でデスクトップターゲットを含むマルチプラットフォームプロジェクトを作成する手順を説明します。プロジェクトが作成されると、Compose Hot Reload が自動的に追加されます。

1. [クイックスタート](quickstart.md)にある手順に従い、[Kotlin Multiplatform 開発用の環境をセットアップ](quickstart.md#set-up-the-environment)します。
2. IDE で **File** | **New** | **Project** を選択します。
3. 左側のパネルで **Kotlin Multiplatform** を選択します。
4. **New Project** ウィンドウで **Name**、**Group**、**Artifact** フィールドを指定します。
5. **Desktop** ターゲットを選択し、**Create** をクリックします。
   ![デスクトップターゲットを含むマルチプラットフォームプロジェクトの作成](create-desktop-project.png){width=600 style="block"}

### 既存のプロジェクトに追加する場合 {id="to-an-existing-project"}

Compose Multiplatform 1.10.0 以降、Compose Hot Reload プラグインは[バンドル](whats-new-compose-110.md#compose-hot-reload-integration)されており、**デスクトップターゲット**を含むすべてのプロジェクトでデフォルトで有効になっています。

プロジェクトにすでにデスクトップターゲットが含まれている場合は、Compose Multiplatform バージョン 1.10.0 以降にアップグレードすることで、Compose Hot Reload 機能を設定不要ですぐに利用できます。

デフォルトで有効になっていますが、特定の古いバージョンを使用するために Compose Hot Reload プラグインを明示的に宣言することも可能です。

#### Compose Multiplatform の以前のバージョン {initial-collapse-state="collapsed" collapsible="true" id="earlier-versions-of-compose-multiplatform"}

1.10.0 より前の Compose Multiplatform バージョンを使用しているマルチプラットフォームプロジェクトでは、デスクトップターゲットを設定した上で、Compose Hot Reload プラグインを明示的に追加する必要があります。
以下の手順では、[クイックスタート](quickstart.md)チュートリアルのプロジェクトを例として参照しています。

1. デスクトップターゲットを導入します: `desktopApp` ディレクトリを作成し、`main()` 関数を定義して、`actual` 実装を提供します。
   プロジェクトにすでにデスクトップターゲットが含まれている場合は、このステップをスキップできます。
   参考として、[JVM エントリポイントの追加](migrate-from-android.md#optional-add-a-jvm-entry-point) のサンプルを参照してください。
 
2. バージョンカタログを Compose Hot Reload の最新バージョンで更新します（[Releases](https://github.com/JetBrains/compose-hot-reload/releases) を参照）。
   `gradle/libs.versions.toml` に以下のコードを追加します:
   ```toml
   composeHotReload = { id = "org.jetbrains.compose.hot-reload", version.ref = "composeHotReload"}
   ```

   > バージョンカタログを使用してプロジェクト全体の依存関係を一元管理する方法の詳細については、[Gradle のベストプラクティス](https://kotlinlang.org/gradle-best-practices.html)を参照してください。

3. 親プロジェクトの `build.gradle.kts`（`ComposeDemo/build.gradle.kts`）で、`plugins {}` ブロックに以下のコードを追加します:
   ```kotlin
   plugins {
       alias(libs.plugins.composeHotReload) apply false
   }
   ```
   これにより、Compose Hot Reload プラグインが各サブプロジェクトで複数回読み込まれるのを防ぎます。

4. マルチプラットフォームアプリケーションを含むサブプロジェクトの `build.gradle.kts`（`ComposeDemo/sharedUI/build.gradle.kts`）で、`plugins {}` ブロックに以下のコードを追加します:
   ```kotlin
   plugins { 
       alias(libs.plugins.composeHotReload)
   }
   ```

5. プロジェクトは、強化されたクラス再定義をサポートする OpenJDK のフォークである [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)（JBR）上で実行する必要があります。
   Compose Hot Reload は、互換性のある JBR をプロジェクト用に自動的にプロビジョニングできます。

   > 最新の JetBrains Runtime は Java 21 のみをサポートしています:
   > Java 22 以降とのみ互換性があるプロジェクトに Compose Hot Reload を追加すると、
   > プロジェクトの実行時にリンケージエラーが発生します。
   > 
   {style="warning"}

   自動プロビジョニングを許可するには、`settings.gradle.kts` ファイルに以下の Gradle プラグインを追加します:

   ```kotlin
   plugins {
       id("org.gradle.toolchains.foojay-resolver-convention") version "%foojayResolverConventionVersion%"
   }
   ```

6. **Sync Gradle Changes** ボタンをクリックして Gradle ファイルを同期します: ![Gradle ファイルを同期](gradle-sync.png){width=50}

## Compose Hot Reload を使用する {id="use-compose-hot-reload"}

1. `desktopApp` ソースセット内の `main.kt` ファイルを開き、`main()` 関数を更新します:
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
   `alwaysOnTop` 変数を `true` に設定することで、生成されたデスクトップアプリがすべてのウィンドウの最前面に表示され続けるため、コードを編集してリアルタイムで変更を確認しやすくなります。

2. `App.kt` ファイルを開き、`Button` コンポーザブルを更新します:
   ```kotlin
   Button(onClick = { showContent = !showContent }) {
       Column {
           Text(Greeting().greet())
       }
   }
   ```
   これで、ボタンのテキストが `greet()` 関数によって制御されるようになります。

3. `Greeting.kt` ファイルを開き、`greet()` 関数を更新します:
   ```kotlin
    fun greet(): String {
        return "Hello!"
    }
   ```

4. `main.kt` ファイルを開き、ガターにある **Run** アイコンをクリックします。
   **Run 'desktopApp' with Compose Hot Reload** を選択します。

   ![ガターから Compose Hot Reload を実行](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}

   ![デスクトップアプリでの最初の Compose Hot Reload](compose-hot-reload-hello.png){width=500 border-effect="line"}

5. `greet()` 関数から返される文字列を更新し、すべてのファイルを保存（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）すると、デスクトップアプリが自動的に更新されるのを確認できます。

   ![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

   あるいは、割り当てられたショートカットキーを押すか、**Reload UI** ボタンをクリックして明示的にリロードをトリガーすることもできます。
   トリガーの挙動は **Settings | Tools | Compose Hot Reload** ページで変更できます。

おめでとうございます！Compose Hot Reload の動作を確認できました。これで、変更のたびにデスクトップの実行構成を再起動することなく、テキスト、画像、フォーマット、UI 構造などの変更を自由に試すことができます。

## AI エージェント用の MCP サーバー {id="mcp-server-for-ai-agents"}
<primary-label ref="Experimental"/>

Compose Multiplatform 1.12.0 以降、Compose Hot Reload には組み込みの [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーが含まれています。
MCP サーバーを使用すると、AI コーディングエージェントが実行中の Compose アプリケーションと連携できるようになります: Compose Hot Reload のトリガー、レンダリングされた UI の確認、セマンティック構造のインスペクション、ユーザー入力のシミュレーション、ランタイムログの読み取りが可能です。
複数のウィンドウを持つアプリケーションの場合、エージェントはウィンドウを一覧表示して任意のウィンドウを対象にできます。

これにより、Compose コードを編集する際の AI エージェントのフィードバックループが完結します。
編集のたびにユーザーが手動で結果を確認する必要がなくなり、エージェントが自律的にコードをイテレーションして各変更を検証できるようになります。

### AI エージェントを接続する {id="connect-an-ai-agent"}

AI エージェントを接続するには、`hotMcpServer` Gradle タスクを実行するように MCP クライアントを設定します。
例えば、`.mcp.json` では以下のように記述します:

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

Gradle はすべてのサブプロジェクトを横断してタスクを検索し、短縮名である `hotMcpServer` を `hotMcpServerJvm` や `hotMcpServerDesktop` などのターゲット固有のバリアントに一致させます。

モジュールで複数の JVM ターゲットを定義している場合は、曖昧さを避けるために完全修飾タスク名（`:<module>:hotMcpServer<Target>`）を指定してください（例: `:app:hotMcpServerDesktop` や `:composeApp:hotMcpServerJvm`）。

### 利用可能な MCP ツール {id="available-mcp-tools"}

MCP サーバーは、エージェントが呼び出すことのできる以下のような各種ツールを公開しています:

* `reload` — プロジェクトを再コンパイルし、変更されたクラスをホットリロードします。
* `take_screenshot` — アプリケーションウィンドウの現在の状態をキャプチャします。
* `get_semantic_tree` — エージェントが UI 構造を理解できるように、Compose の[セマンティックツリー](compose-accessibility.md#semantic-properties)を返します。
* `get_logs` — 実行時例外を含む、実行中アプリケーションからの直近のログ出力を返します。
* `click`、`type_text`、`scroll` — ユーザー入力をシミュレートしてインタラクティブなフローをテストします。

MCP ツールとそのパラメータの完全なリストについては、[Compose Hot Reload README](https://github.com/JetBrains/compose-hot-reload#mcp-server-for-ai-agents) を参照してください。

## ヘルプの利用 {id="get-help"}

Compose Hot Reload の使用中に問題が発生した場合は、[GitHub イシューを作成](https://github.com/JetBrains/compose-hot-reload/issues)してお知らせください。