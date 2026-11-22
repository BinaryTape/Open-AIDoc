[//]: # (title: Kotlin Toolchain を使用して Kotlin Multiplatform アプリケーションを作成および公開する)

[Kotlin Toolchain](https://kotlin-toolchain.org/) は、Kotlin プロジェクトのビルド、テスト、実行、公開を行うための JetBrains 製ツールです。
CLI と宣言的な設定を提供するため、ターミナル、IDE、または AI 支援開発ツールから作業できます。
Kotlin Toolchain を使用すると、コーディングエージェントは最小限のセットアップと設定だけで、新規プロジェクトから公開アプリまで進めることができます。

[Kotlin AI スキルの公式リポジトリ](https://github.com/Kotlin/kotlin-agent-skills/tree/main) には、Kotlin Toolchain 専用のスキルが含まれています。

このページでは、Kotlin Toolchain を使用して Kotlin Multiplatform プロジェクトをゼロからセットアップする手順を説明します。

また、エージェントに次のように依頼するだけでも可能です：

```text
Create a new Kotlin Multiplatform app for Android, iOS, desktop, and web with the Kotlin Toolchain CLI (https://kotlin-toolchain.org/latest).
```

> Kotlin Toolchain は [Alpha](supported-platforms.md#general-kotlin-stability-levels) 版です。
> Kotlin Multiplatform プロジェクトでぜひお試しください。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KTC) や [専用の Slack チャンネル](https://kotlinlang.slack.com/archives/C062WG3A7T8) までお寄せください。
>
{style="note"}

## 前提条件 {id="prerequisites"}

### Kotlin Toolchain CLI のインストール {id="toolchain-script-install"}

エージェント自身で Kotlin Toolchain をインストールすることもできますが、インストーラースクリプトを使用して手動でインストールすることも可能です。

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

インストーラースクリプトは Kotlin Toolchain CLI をダウンロードして `~/.local/bin` に配置し、`PATH` に追加します。
`sudo` コマンドは不要です。

`kotlin --version` を実行して、CLI が利用可能であることを確認してください。

### iOS アプリのビルド {id="building-ios-apps"}

Kotlin Toolchain を使用すると、Xcode を開くことなく、CLI や IDE から直接アプリのビルド、実行、公開など、iOS 開発ワークフローの大部分を処理できます。

Xcode が必要な場合、Kotlin Toolchain はインストールの要求とセットアップ方法の説明を表示します。
推奨される方法は、[App Store](https://apps.apple.com/us/app/xcode/id497799835) から Xcode をインストールすることです。

Xcode のインストールは、Kotlin Toolchain に iOS ビルド用の CLI を提供するため、および一部のプロジェクト固有のワークフローで必要となります。

## プロジェクトの作成 {id="create-a-project"}

Kotlin Toolchain を使用して新しいプロジェクトを生成するには、次のようにします。

1. Kotlin Toolchain でプロジェクトを作成したいディレクトリ（例: **Projects**）に移動します。
2. 次のコマンドを実行します：

   ```shell
   kotlin new
   ```

3. プロジェクトのパスを求められたら、ディレクトリ名（例: `ktc-kmp`）を入力します。
4. テンプレート一覧で、**Kotlin Multiplatform application** を選択します。
5. **スペース** キーを使用してターゲットプラットフォームの選択または選択解除を行います。**Enter** キーを押して確定します。

   > 最終的なアプリのターゲットが Android と iOS のみであっても、デスクトップターゲットの追加を検討してください。
   > これにより、開発やイテレーションループが高速化され、アプリを再起動することなく UI の変更を確認できる [Compose Hot Reload](compose-hot-reload.md) がサポートされます。
   >
   {style="tip"}

6. プロジェクト ID を入力するか、空白のままにしてディレクトリ名に基づいたデフォルト ID を生成します。

   この ID は、Kotlin のパッケージ名、Android のネームスペースおよびアプリケーション ID、iOS のバンドル ID など、アプリを識別するためにプロジェクト全体で使用されます。

7. AI エージェント設定のインストールを確認します。これにより、一般的な推奨事項と MCP サーバー設定を含むプロジェクト固有の AGENTS.md が作成されます。
8. **スペース** キーを使用して、使用する AI エージェントを選択します。**Enter** キーを押して確定します。

Kotlin Toolchain は、設定ファイル、ソースコード、ラッパースクリプトを含むプロジェクトを生成します。
デフォルトでは、Git リポジトリも初期化されます。

生成されたプロジェクトには、各プラットフォーム向けのアプリケーションエントリポイントを持ついくつかの `*App` モジュールと、共通コードを持つ `shared` モジュールが含まれます。各モジュールは全体の `project.yaml` ファイルにリストされており、それぞれの `module.yaml` ファイルで設定されます。
各アプリケーションモジュールは、`shared` モジュールに明示的に依存しています。例えば、Android モジュールの場合：

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # 共有モジュールの依存関係
  - //shared
  # Android 固有の依存関係
  - $libs.androidx.activity.compose
  - $compose.preview
  - $compose.uiTooling

settings:
  compose: enabled
  android:
    namespace: org.example.ktckmp
    applicationId: org.example.ktckmp
```

各モジュールの基本構造は [KMP ソースセットモデル](multiplatform-discover-project.md#source-sets) に従っていますが、たとえば `androidMain` の代わりに `src@android` が使用されます。

## プロジェクトの実行 {id="run-the-project"}

プロジェクトを実行するには：

1. プロジェクトディレクトリ（上記の例では `ktc-kmp`）に移動します。
2. `kotlin run` を実行して、実行可能なアプリケーションの一覧を表示します。
   利用可能なモジュールは、プロジェクト生成時に選択したターゲットプラットフォームに対応しています：

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. `-m`（`--module`）オプションを使用してモジュールを直接実行することもできます。例：

    ```shell
    # デスクトップ JVM アプリをビルドして実行
    kotlin run -m desktopApp
    ```

## アプリケーションの公開 {id="publish-the-applications"}

アプリの動作に問題がなければ、アプリケーションを公開できます。

### iOS の場合 {id="for-ios"}

Kotlin Toolchain を使用すると、[TestFlight](https://developer.apple.com/testflight/) への公開に向けたセットアッププロセスを効率化できます。
iOS アプリを公開するには、次を実行します：

```shell
kotlin publish testflight
```

このコマンドを実行すると、詳細な手順を案内するウィザードが起動します。これにより、最小限の手作業で [App Store Connect](https://appstoreconnect.apple.com/login) の API キーを使用した公開プロセスのセットアップを進めることができます。
以降のリリースでは、同じコマンドで自動的に公開が行われます。

手動でのセットアップおよび公開の手順については、[Kotlin Toolchain ドキュメント](https://kotlin-toolchain.org/latest/user-guide/publishing/ios-application) を参照してください。

### Android の場合 {id="for-android"}

Android アプリのセットアップと公開については、[Kotlin Toolchain ドキュメント](https://kotlin-toolchain.org/latest/user-guide/publishing/android-application) の手順に従ってください。

### その他のターゲットプラットフォーム {id="other-target-platforms"}

[JVM アプリ](https://kotlin-toolchain.org/latest/user-guide/product-types/jvm-app/#packaging) や [Wasm アプリ](https://kotlin-toolchain.org/latest/user-guide/product-types/wasm-js-app/#packaging) をパッケージ化することもできますが、これらのプラットフォームへの公開はまだ完全にはサポートされていません。

## IntelliJ IDEA または Android Studio でのプロジェクトの作業 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

IntelliJ IDEA または Android Studio でプロジェクトの作業や実行を行うことができます。

> Android Studio で Kotlin Toolchain の全機能を利用するには、[最新の安定版](https://developer.android.com/studio/releases)（Android Studio Rabbit 以降）を使用してください。
>
{style="tip"}

[Kotlin Multiplatform プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) をインストールして、Kotlin Multiplatform プロジェクトに対する IDE サポートのほか、Kotlin Toolchain のプロジェクト構造や実行構成（Run Configuration）のサポートを追加してください。

### IDE で直接プロジェクトを作成する {id="create-a-project-directly-in-the-ide"}

Kotlin Multiplatform プラグインと Kotlin Toolchain プラグインをインストールすると、IDE から直接新しいプロジェクトを作成することもできます。

1. IntelliJ IDEA または Android Studio を開きます。
2. **File** | **New** | **Project** を選択します。
3. **Kotlin Multiplatform** を選択し、**Build system** の切り替えで **Kotlin Toolchain** を選択します。
4. 残りのプロジェクト詳細を入力し、**Create** をクリックします。

プロジェクトが作成されてインポートされると、IDE は宣言されたすべてのモジュールに対して実行構成を自動的に登録するため、IDE ツールバーから対応するアプリケーションを実行できます。

## 次のステップ {id="what-s-next"}

* Kotlin Toolchain の概要や目的についての詳細は、[プロダクト FAQ](https://kotlin-toolchain.org/latest/faq/) をご確認ください。
* [ゼロからのチュートリアル](https://kotlin-toolchain.org/latest/getting-started/tutorial/) では、Kotlin Toolchain の「Hello, World!」を作成し、複雑なテンプレート設定を備えたマルチプラットフォームプロジェクトへと段階的に発展させる方法を紹介しています。
* Kotlin Toolchain について詳しく知りたい場合は、[ユーザーガイド](https://kotlin-toolchain.org/latest/user-guide/) をご確認ください。