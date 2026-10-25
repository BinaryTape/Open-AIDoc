[//]: # (title: Kotlin Toolchain を使用した Kotlin Multiplatform アプリケーションの作成とビルド)

[Kotlin Toolchain](https://kotlin-toolchain.org/) は、Kotlin プロジェクトの作成、ビルド、テスト、
および実行を行うための JetBrains 製ツールです。
CLI と宣言的な設定を提供するため、ターミナル、IDE、
または AI 支援開発ツールから作業できます。

このページでは、Kotlin Toolchain を使用して Kotlin Multiplatform プロジェクトをゼロからセットアップする手順を説明します。

> Kotlin Toolchain は[アルファ版](supported-platforms.md#general-kotlin-stability-levels)です。
> ぜひ Kotlin Multiplatform プロジェクトでお試しください。
> フィードバックは [YouTrack](https://youtrack.jetbrains.com/issues/KTC) にお寄せいただけると幸いです。
>
{style="note"}

## 前提条件 {id="prerequisites"}

### Kotlin Toolchain CLI のインストール {id="toolchain-script-install"}

[SDKMAN!](https://sdkman.io/) を使用して Kotlin Toolchain CLI をインストールできます。

```shell
sdk install kotlintoolchain
```

または、インストーラースクリプト経由でインストールします。

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh

# ターミナルを再起動するか、このコマンドを実行して
# 'kotlin' を利用可能にしてください
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
と必要な SDK をインストールします。

モジュールのビルドまたは実行が実際に必要になった際、
Kotlin Toolchain CLI に Xcode のセットアップ手順が表示されます。

## プロジェクトの作成 {id="create-a-project"}

Kotlin Toolchain を使用して新しいプロジェクトを生成するには:

1. プロジェクトディレクトリを作成したいディレクトリに移動します。
2. 次のコマンドを実行します。

   ```shell
   kotlin new
   ```

3. プロジェクトパスの入力を求められたら、ディレクトリ名を入力します（例: `ktc-kmp`）。
4. テンプレートの選択肢が表示されたら、**Compose Multiplatform application** を選択します。
5. **Enter** キーを押して、デフォルトのターゲット選択を確定します。
6. アプリを識別するためにプロジェクト全体で使用されるプロジェクト ID を入力します（ディレクトリ名に基づいてデフォルト値が生成されます）。
   この ID は、Kotlin のパッケージ名、Android の名前空間およびアプリケーション ID、iOS のバンドル ID に使用されます。

Kotlin Toolchain は、設定ファイル、ソースコード、ラッパースクリプトを含むプロジェクトを生成します。
デフォルトでは、Git リポジトリも初期化されます。

生成されたプロジェクトには、各プラットフォーム向けのエントリポイントを持ついくつかの `*App` モジュールと、共通コードを含む `shared` モジュールが含まれます。
各モジュールは全体の `project.yaml` ファイルにリストされており、それぞれの `module.yaml` ファイルで設定されます。
すべてのアプリケーションモジュールは、例えば次のように `shared` モジュールに明示的に依存します。

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

各モジュールの基本構造は [KMP ソースセットモデル](multiplatform-discover-project.md#source-sets) に従いますが、
例えば `androidMain` の代わりに `src@android` のようになります。

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

3. `-m`（`--module`）オプションを使用して、モジュールを直接実行することもできます（例）:

    ```shell
    # デスクトップ JVM アプリをビルドして実行
    kotlin run -m desktopApp
    ```

## IntelliJ IDEA または Android Studio でプロジェクトを開発する {id="work-on-a-project-in-intellij-idea-or-android-studio"}

IntelliJ IDEA または Android Studio でプロジェクトの編集や実行を行うことができます。
Android Studio で Kotlin Toolchain のすべての機能を利用するには、最新の安定バージョンである [Android Studio Rabbit](https://developer.android.com/studio/releases) を使用してください。

IDE が Kotlin Toolchain および Kotlin Multiplatform プロジェクトを認識できるように、以下のプラグインをインストールしてください。

* [Kotlin Multiplatform プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform):
  KMP プロジェクトを適切にサポートするために必要です。
* [Kotlin Toolchain プラグイン](https://plugins.jetbrains.com/plugin/31850-kotlin-toolchain):
  IDE が Kotlin Toolchain プロジェクトの構造を認識し、実行構成の生成などを行うのに役立ちます。

### IDE から直接プロジェクトを作成する {id="create-a-project-directly-in-the-ide"}

Kotlin Multiplatform プラグインと Kotlin Toolchain プラグインがインストールされていれば、
IDE から直接新しいプロジェクトを作成することもできます。

1. IntelliJ IDEA または Android Studio を開きます。
2. **File** | **New** | **Project** を選択します。
3. **Kotlin Multiplatform** を選択し、**Build system** の切り替えで **Kotlin Toolchain** を選択します。
4. 残りのプロジェクト詳細を入力し、**Create** をクリックします。

プロジェクトが作成されてインポートされると、IDE は宣言されたすべてのモジュールの実行構成を自動的に登録するため、
IDE のツールバーから対応するアプリケーションを実行できます。

## アプリケーションの公開 {id="publish-the-applications"}

アプリの動作に問題がなければ、アプリケーションを公開できます。

アーティファクトの生成に関する完全な手順については、Kotlin Toolchain ドキュメントを参照してください。

* [Android アプリの公開](https://kotlin-toolchain.org/latest/user-guide/product-types/android-app/#publishing)
* [iOS アプリの公開](https://kotlin-toolchain.org/latest/user-guide/product-types/ios-app/#publishing)

JVM アプリや Wasm アプリをパッケージ化することもできますが、これらのターゲット向けの公開はまだ完全にはサポートされていません。

## 次のステップ {id="what-s-next"}

* Kotlin Toolchain の詳細やその目的については、[製品 FAQ](https://kotlin-toolchain.org/dev/faq/) をご確認ください。
* [ゼロから始めるチュートリアル](https://kotlin-toolchain.org/dev/getting-started/tutorial/) では、
  Kotlin Toolchain の "Hello, World!" を作成し、複雑なテンプレート構成を持つマルチプラットフォームプロジェクトへと
  段階的に発展させる方法を紹介しています。
* Kotlin Toolchain について詳しく学ぶには、[ユーザーガイド](https://kotlin-toolchain.org/latest/user-guide/) をご確認ください。