[//]: # (title: Kotlin Toolchain を使用した Kotlin Multiplatform アプリケーションの作成とビルド)

[Kotlin Toolchain](https://kotlin-toolchain.org/) は、Kotlin プロジェクトの作成、ビルド、テスト、
および実行を行うための JetBrains 製ツールです。
CLI と宣言的な設定を提供するため、ターミナル、IDE、
または AI 支援開発ツールから作業を行うことができます。

このページでは、Kotlin Toolchain を使用して Kotlin Multiplatform プロジェクトをゼロからセットアップする手順を説明します。

> Kotlin Toolchain は [Alpha](supported-platforms.md#general-kotlin-stability-levels) 版です。
> Kotlin Multiplatform プロジェクトでぜひお試しください。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KTC)
> および[専用 Slack チャンネル](https://kotlinlang.slack.com/archives/C062WG3A7T8)にてお待ちしております。
>
{style="note"}

## 前提条件 {id="prerequisites"}

### Kotlin Toolchain CLI のインストール {id="toolchain-script-install"}

Kotlin Toolchain CLI は [SDKMAN!](https://sdkman.io/) を使用してインストールできます。

```shell
sdk install kotlintoolchain
```

または、インストーラースクリプト経由でインストールします。

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh

# ターミナルを再起動するか、このコマンドを実行して
# 'kotlin' コマンドを使用可能にします
exec $SHELL
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

`kotlin --version` を実行して、CLI が利用可能であることを確認します。

### iOS アプリのビルド {id="building-ios-apps"}

iOS アプリケーションをビルドおよび実行するには、[Xcode](https://apps.apple.com/us/app/xcode/id497799835)
と必要な SDK をインストールしてください。

モジュールのビルドや実行に実際に Xcode が必要になった際、
Kotlin Toolchain CLI に Xcode のセットアップ手順が表示されます。

## プロジェクトの作成 {id="create-a-project"}

Kotlin Toolchain を使用して新しいプロジェクトを生成するには:

1. プロジェクトディレクトリを作成したいディレクトリに移動します。
2. 次のコマンドを実行します。

   ```shell
   kotlin new
   ```

3. プロジェクトパスの入力を求められたら、ディレクトリ名（例: `ktc-kmp`）を入力します。
4. テンプレートの選択肢が表示されたら、**Compose Multiplatform application** を選択します。
5. **Enter** を押して、デフォルトのターゲット選択を確定します。
6. アプリを識別するためにプロジェクト全体で使用されるプロジェクト ID を入力します（ディレクトリ名に基づいてデフォルト値が生成されます）。
   この ID は、Kotlin パッケージ名、Android の名前空間（namespace）とアプリケーション ID、および iOS のバンドル ID に使用されます。

Kotlin Toolchain が設定ファイル、ソースコード、ラッパースクリプトを含むプロジェクトを生成します。
デフォルトでは、Git リポジトリも初期化されます。

生成されたプロジェクトには、プラットフォームごとのアプリケーションエントリポイントを持つ複数の `*App` モジュールと、共通コードを持つ `shared` モジュールが含まれます。
各モジュールは全体の `project.yaml` ファイルにリストされ、それぞれの `module.yaml` ファイルで設定されます。
すべてのアプリケーションモジュールは、次のように明示的に shared モジュールに依存しています。

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # shared モジュールへの依存関係
  - //shared
  # Android 固有の依存関係
  - $libs.androidx.activity.compose

settings:
  compose: enabled
  android:
    namespace: org.example.toolchainfirst
    applicationId: org.example.toolchainfirst
```

各モジュールの基本構造は [KMP ソースセットモデル](multiplatform-discover-project.md#source-sets) に従っていますが、たとえば `androidMain` の代わりに `src@android` のようになります。

## プロジェクトの実行 {id="run-the-project"}

プロジェクトを実行するには:

1. プロジェクトディレクトリ（上記の例では `ktc-kmp`）に移動します。
2. `kotlin run` を実行して、実行可能なアプリケーションのリストを表示します。
   利用可能なモジュールは、プロジェクト生成時に選択したターゲットに対応しています。

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. `-m`（`--module`）オプションを使用して、モジュールを直接実行することもできます。次に例を示します。

    ```shell
    # デスクトップ JVM アプリをビルドして実行
    kotlin run -m desktopApp
    ```

## IntelliJ IDEA または Android Studio でのプロジェクトの作業 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

IntelliJ IDEA または Android Studio でプロジェクトの編集や実行を行うことができます。
Android Studio で Kotlin Toolchain の全機能を利用するには、最新の安定バージョンである [Android Studio Rabbit](https://developer.android.com/studio/releases) を使用してください。

IDE に Kotlin Toolchain および Kotlin Multiplatform プロジェクトを認識させるには、次のプラグインをインストールしてください。

* [Kotlin Multiplatform プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform):
  KMP プロジェクトを適切にサポートするために必要です。
* [Kotlin Toolchain プラグイン](https://plugins.jetbrains.com/plugin/31850-kotlin-toolchain):
  IDE が Kotlin Toolchain プロジェクトの構造を認識し、実行構成などを生成するのを支援します。

### IDE で直接プロジェクトを作成する {id="create-a-project-directly-in-the-ide"}

Kotlin Multiplatform プラグインと Kotlin Toolchain プラグインがインストールされていれば、
IDE 内で直接新しいプロジェクトを作成することもできます。

1. IntelliJ IDEA または Android Studio を開きます。
2. **File** | **New** | **Project** を選択します。
3. **Kotlin Multiplatform** を選択し、**Build system** の切り替えで **Kotlin Toolchain** を選択します。
4. 残りのプロジェクトの詳細を入力し、**Create** をクリックします。

プロジェクトが作成されてインポートされると、IDE は宣言されているすべてのモジュールの実行構成を自動的に登録するため、IDE のツールバーから対応するアプリケーションを実行できるようになります。

## アプリケーションの公開 {id="publish-the-applications"}

アプリの動作に問題がなければ、アプリケーションを公開（パブリッシュ）できます。

アーティファクトの生成に関する詳細な手順については、Kotlin Toolchain ドキュメントを参照してください。

* [Android アプリの公開](https://kotlin-toolchain.org/latest/user-guide/product-types/android-app/#publishing)
* [iOS アプリの公開](https://kotlin-toolchain.org/latest/user-guide/product-types/ios-app/#publishing)

JVM アプリや Wasm アプリをパッケージ化することもできますが、これらのターゲット向けの公開はまだ完全にはサポートされていません。

## 次のステップ {id="what-s-next"}

* Kotlin Toolchain の概要や目的についての詳細は、[製品 FAQ](https://kotlin-toolchain.org/dev/faq/) をご確認ください。
* [ゼロからのチュートリアル](https://kotlin-toolchain.org/dev/getting-started/tutorial/) では、
  Kotlin Toolchain の "Hello, World!" を作成し、複雑なテンプレート設定を備えたマルチプラットフォームプロジェクトへと徐々に変換していく方法を紹介しています。
* Kotlin Toolchain の詳細については、[ユーザーガイド](https://kotlin-toolchain.org/latest/user-guide/) をご確認ください。