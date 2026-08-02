[//]: # (title: Kotlin Multiplatform クイックスタート)

<web-summary>JetBrains は、IntelliJ IDEA および Android Studio 向けに公式の Kotlin IDE サポートを提供しています。</web-summary>

このチュートリアルでは、Compose Multiplatform UI を使用したシンプルな Kotlin Multiplatform アプリを作成して実行する方法を説明します。

## 環境のセットアップ

まずは IDE と必要なプラグインの準備から始めましょう。

1. IDE を選択してインストールします。Kotlin Multiplatform は IntelliJ IDEA と Android Studio で完全にサポートされています。
    
    IDE のインストールには [JetBrains Toolbox App](https://www.jetbrains.com/toolbox/app/) を使用することをお勧めします。
    [Early Access Program](https://www.jetbrains.com/resources/eap/) (EAP) や Nightly リリースを含む、複数の製品やバージョンを管理できます。

    スタンドアロンでインストールする場合は、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) または [Android Studio](https://developer.android.com/studio) のインストーラーをダウンロードしてください。

    Kotlin Multiplatform に必要なプラグインには、少なくとも **IntelliJ IDEA 2025.2.2** または **Android Studio Otter 2025.2.1** 以降が必要です。

2. [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) をインストールします。
    
   IDE プラグインをインストールすると、IDE にまだ備わっていない必要な依存関係もすべてインストールされます。
    
3. `ANDROID_HOME` 環境変数が設定されていない場合は、システムがそれを認識できるように構成します。

    <Tabs>
    <TabItem title= "Bash または Zsh">
   
    次のコマンドを `.profile` または `.zprofile` に追加します。
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell または CMD">

    PowerShell の場合は、次のコマンドで永続的な環境変数を追加できます（詳細は [PowerShell ドキュメント](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables) を参照してください）。

    ```shell
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', '<path to the SDK>', 'Machine')
    ```

    CMD の場合は、[`setx`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setx) コマンドを使用します。
    
    ```shell
    setx ANDROID_HOME "<path to the SDK>"
    ```
    </TabItem>
    </Tabs>

4. iOS アプリケーションを作成するには、[Xcode](https://apps.apple.com/us/app/xcode/id497799835) がインストールされた macOS ホストが必要です。
    IDE はバックグラウンドで Xcode を実行して iOS フレームワークをビルドします。

    KMP プロジェクトでの作業を開始する前に、少なくとも一度は Xcode を起動して初期セットアップを完了させてください。

    > Xcode が更新されるたびに、手動で起動して更新されたツールをダウンロードする必要があります。
    > Kotlin Multiplatform IDE プラグインはプリフライトチェックを行い、Xcode が動作可能な状態でない場合にアラートを表示します。
    >
    {style="note"}

## プロジェクトの作成

<Tabs>
<TabItem title= "IntelliJ IDEA">

IDE ウィザードを使用して、新しい KMP プロジェクトを作成します。

1. メインメニューで **File** | **New** | **Project** を選択します。
2. 左側のリストで **Kotlin Multiplatform** を選択します。
3. 必要に応じて、プロジェクトの名前、場所、その他の基本属性を設定します。
4. プロジェクトの JDK として [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) (JBR) のバージョンを選択することをお勧めします。JBR は、特にデスクトップ KMP アプリの互換性を向上させるための重要な修正を提供しています。
   適切なバージョンの JBR はすべての IntelliJ IDEA ディストリビューションに含まれているため、追加のセットアップは不要です。
5. 完全なデモを作成するには、利用可能なすべてのプラットフォーム（Android、iOS、デスクトップ、ウェブ、サーバー）を選択します。
   対応するターゲットの UI フレームワークとして Compose Multiplatform を使用するために、**Share UI** オプションが利用可能な場所では選択されたままにします。

   > デスクトップターゲットには [Compose Hot Reload](compose-hot-reload.md) 機能が自動的に含まれており、コードの変更を保存するとすぐに UI の変更を確認できます。
   > デスクトップアプリを作る予定がない場合でも、UI コードの作成をスピードアップするためにプロジェクトにデスクトップターゲットを追加することをお勧めします。
   > 
   {style="note"}

6. プラットフォームの選択が終わったら、**Create** ボタンをクリックし、IDE がプロジェクトを生成してインポートするのを待ちます。

![デフォルト設定で Android、iOS、デスクトップ、ウェブプラットフォームが選択された IntelliJ IDEA ウィザード](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

IDE ウィザードを使用して、新しい KMP プロジェクトを作成します。

1. メインメニューで **File** | **New** | **New project** を選択します。
2. デフォルトの **Phone and Tablet** テンプレートカテゴリから **Kotlin Multiplatform** を選択します。

    ![Android Studio での新しいプロジェクトの最初のステップ](as-wizard-1.png){width="400"}

3. 必要に応じてプロジェクトの名前、場所、その他の基本属性を設定し、**Next** をクリックします。
4. 完全なデモを作成するには、利用可能なすべてのプラットフォーム（Android、iOS、デスクトップ、ウェブ、サーバー）を選択します。
   対応するターゲットの UI フレームワークとして Compose Multiplatform を使用するために、**Share UI** オプションが利用可能な場所では選択されたままにします。

   > デスクトップターゲットには [Compose Hot Reload](compose-hot-reload.md) 機能が自動的に含まれており、コードの変更を保存するとすぐに UI の変更を確認できます。
   > デスクトップアプリを作る予定がない場合でも、UI コードの作成をスピードアップするためにプロジェクトにデスクトップターゲットを追加することをお勧めします。
   >
   {style="note"}

5. プラットフォームの選択が終わったら、**Finish** ボタンをクリックし、IDE がプロジェクトを生成してインポートするのを待ちます。

![Android、iOS、デスクトップ、ウェブプラットフォームが選択された Android Studio ウィザードの最後のステップ](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

## プリフライトチェックの確認

**Project Environment Preflight Checks** ツールウィンドウを開くことで、プロジェクトのセットアップにおいて環境上の問題がないか確認できます。
右側のサイドバーまたは下部バーにあるプリフライトチェックアイコンをクリックしてください。 ![飛行機のアイコンが付いたプロジェクト環境プリフライトチェックアイコン](ide-preflight-checks.png){width="20"}

このツールウィンドウでは、これらのチェックに関連するメッセージの確認、再実行、または設定の変更が可能です。

プリフライトチェックのコマンドは、**Search Everywhere** ダイアログからも利用できます。
<shortcut>Shift</shortcut> キーを 2 回押し、"preflight" という単語を含むコマンドを検索してください。

![「preflight」と入力された Search Everywhere メニュー](double-shift-preflight-checks.png){width=600}

## サンプルアプリの実行

IDE ウィザードで作成されたプロジェクトには、iOS、Android、デスクトップ、およびウェブアプリケーション用の実行構成 (run configurations) と、サーバーアプリを実行するための Gradle タスクが含まれています。
各プラットフォームの特定の Gradle コマンドは以下の通りです。

<Tabs>
<TabItem title="Android">

Android アプリを実行するには、**androidApp** 実行構成を開始します。

![Android 実行構成がハイライトされたドロップダウン](run-android-configuration.png){width=250}

Android 実行構成を手動で作成するには、実行構成テンプレートとして **Android App** を選択し、モジュール **[プロジェクト名].androidApp** を選択します。

デフォルトでは、最初に使用可能な仮想デバイスで実行されます。

![仮想デバイスで実行された Android アプリ](run-android-app.png){width=300}

</TabItem>
<TabItem title="iOS">

> iOS アプリをビルドするには macOS ホストと Xcode のインストールが必要です。
>
{style="note"}

プロジェクトで iOS ターゲットを選択し、Xcode がインストールされた macOS マシンをセットアップしている場合は、**iosApp** 実行構成を選択してシミュレートされたデバイスを選択できます。

![iOS 実行構成がハイライトされたドロップダウン](run-ios-configuration.png){width=250}

iOS アプリを実行すると、バックグラウンドで Xcode を使用してビルドされ、iOS シミュレーターで起動します。
初回ビルド時には、コンパイル用のネイティブ依存関係が収集され、以降の実行のためにビルドがウォームアップされます。

![仮想デバイスで実行された iOS アプリ](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

デスクトップアプリのデフォルトの実行構成は、**desktopApp [hot] 🔥** として作成されます。

![デフォルトのデスクトップ実行構成がハイライトされたドロップダウン](run-desktop-configuration.png){width=250}

ホットリロード（Hot Reload）を使用したデスクトップ実行構成を手動で作成するには、**Gradle** 実行構成テンプレートを選択し、**[アプリ名]:desktopApp** Gradle プロジェクトを指すようにして、次のコマンドを指定します。

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

この構成により、JVM デスクトップアプリを実行できます。

![仮想デバイスで実行された JVM アプリ](run-desktop-app.png){width=600}

</TabItem>
<TabItem title="Web">

ウェブアプリのデフォルトの実行構成は、**webApp [wasmJs]** として作成されます。

![デフォルトの Wasm 実行構成がハイライトされたドロップダウン](run-wasm-configuration.png){width=250}

ウェブ実行構成を手動で作成するには、**Gradle** 実行構成テンプレートを選択し、**[アプリ名]:webApp** Gradle プロジェクトを指すようにして、次のコマンドを指定します。

```shell
wasmJsBrowserDevelopmentRun
```

この構成を実行すると、IDE は Kotlin/Wasm アプリをビルドし、デフォルトのブラウザで開きます。

![仮想デバイスで実行されたウェブアプリ](run-wasm-app.png){width=600}

</TabItem>
</Tabs>

## トラブルシューティング

### Java と JDK

Java に関する一般的な問題：

* 一部のツールが実行用の Java バージョンを見つけられないか、誤ったバージョンを使用することがあります。
  これを解決するには：
    * `JAVA_HOME` 環境変数を、適切な JDK がインストールされているディレクトリに設定します。
  
      > クラスの再定義をサポートする OpenJDK のフォークである [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) を使用することをお勧めします。
      >
      {style="note"}
  
    * JDK に含まれるツールをターミナルで使用できるように、`JAVA_HOME` 内の `bin` フォルダへのパスを `PATH` 変数に追加します。
* Android Studio で Gradle JDK に関する問題が発生した場合は、正しく構成されているか確認してください。
  **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle** を選択します。

### Android ツール

JDK と同様に、`adb` などの Android ツールの起動に問題がある場合は、`ANDROID_HOME/tools`、`ANDROID_HOME/tools/bin`、および `ANDROID_HOME/platform-tools` へのパスが `PATH` 環境変数に追加されていることを確認してください。

### Xcode

iOS の実行構成で実行する仮想デバイスがないと報告されたり、プリフライトチェックが失敗したりする場合は、Xcode を起動して iOS シミュレーターの更新がないか確認してください。

### ヘルプを得る

* **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受け取り、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin Multiplatform Tooling イシュートラッカー**: [新しい問題を報告](https://youtrack.jetbrains.com/newIssue?project=KMT)してください。

## 次のステップ

KMP プロジェクトの構造と共有コードの記述について詳しく学びましょう：
* Compose Multiplatform を使用した共有 UI コードの操作に関するチュートリアルシリーズ：[Compose Multiplatform アプリの作成](compose-multiplatform-create-first-app.md)
* ネイティブ UI を持つプロジェクトでの共有コードの操作に関するチュートリアルシリーズ：[Kotlin Multiplatform アプリの作成](multiplatform-create-first-app.md)
* Kotlin Multiplatform ドキュメントを詳しく調べる：
  * [プロジェクトの構成](multiplatform-project-configuration.md)
  * [マルチプラットフォーム依存関係の操作](https://kotlinlang.org/docs/multiplatform-add-dependencies.html)
* Compose Multiplatform UI フレームワーク、その基本、およびプラットフォーム固有の機能について学ぶ：
    [Compose Multiplatform と Jetpack Compose の関係](compose-multiplatform-and-jetpack-compose.md).

KMP 用に既に書かれたコードを探す：
* JetBrains 公式サンプルや、KMP の機能を示す厳選されたプロジェクトリストが掲載されている [Samples](multiplatform-samples.md) ページ。
* GitHub トピック：
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform)：Kotlin Multiplatform で実装されたプロジェクト。
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample)：KMP で書かれたサンプルプロジェクトのリスト。
* [klibs.io](https://klibs.io) – KMP ライブラリの検索プラットフォーム。OkHttp、Ktor、Coil、Koin、SQLDelight など、これまでに 2000 以上のライブラリがインデックスされています。