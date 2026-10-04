[//]: # (title: Kotlin Multiplatform クイックスタート)

<web-summary>JetBrains は IntelliJ IDEA および Android Studio 向けに公式の Kotlin IDE サポートを提供しています。</web-summary>

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

このチュートリアルでは、Compose Multiplatform UI を備えたシンプルな Kotlin Multiplatform アプリをビルドして実行する方法を学びます。

## ビルドツールの選択 {id="choose-a-build-tool"}

このクイックスタートでは、IDE 内で新規 Kotlin Multiplatform プロジェクトを作成および実行するために Gradle を使用します。
Gradle は、新規プロジェクトとすでに Gradle を使用しているプロジェクトの両方をサポートしています。
このクイックスタートは、プロジェクトに Kotlin Multiplatform を導入したい Gradle ユーザー、または単に使い慣れた環境を使用したい Gradle ユーザー向けに設計されています。

新規プロジェクトの場合は、JetBrains が Kotlin Multiplatform を念頭に置いて作成したツールである Kotlin Toolchain を試すこともできます。
CLI とわかりやすい設定フォーマットが用意されており、AI ワークフローにも適しています。

<Links href="/kmp/kotlin-toolchain" summary="undefined">Kotlin Toolchain を使用して KMP を始める</Links>

## 環境のセットアップ {id="set-up-the-environment"}

IntelliJ IDEA または Android Studio、`ANDROID_HOME` 変数、および Xcode をセットアップします:

1. IDE の選択とインストール: KMP は IntelliJ IDEA と Android Studio で完全にサポートされています。
    
    IDE のインストールには [JetBrains Toolbox アプリ](https://www.jetbrains.com/toolbox/app/) を使用することをお勧めします。
    スタンドアロンインストールの場合は、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) または [Android Studio](https://developer.android.com/studio) のインストーラーをダウンロードしてください。

    最適な結果を得るために、最新の安定バージョンを使用してください。

2. Kotlin Multiplatform IDE プラグインをインストールします。
   プラグインマーケットプレイス（**Settings | Plugins | Marketplace**）で見つけるか、[プラグインの Web ページ](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) からインストールできます。
    
3. `ANDROID_HOME` 環境変数が設定されていない場合は、システムが認識できるように設定します:

    <Tabs>
    <TabItem title= "Bash or Zsh">
   
    `.profile` または `.zprofile` に次のコマンドを追加します:
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell or CMD">

    PowerShell の場合は、次のコマンドを使用して永続的な環境変数を追加できます
    （詳細は [PowerShell ドキュメント](https://learn.microsoft.com/ja-jp/powershell/module/microsoft.powershell.core/about/about_environment_variables) を参照してください）:

    ```shell
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', '<path to the SDK>', 'Machine')
    ```

    CMD の場合は、[`setx`](https://learn.microsoft.com/ja-jp/windows-server/administration/windows-commands/setx) コマンドを使用します:
    
    ```shell
    setx ANDROID_HOME "<path to the SDK>"
    ```
    </TabItem>
    </Tabs>

4. iOS アプリケーションを作成するには、[Xcode](https://apps.apple.com/jp/app/xcode/id497799835) がインストールされた macOS マシンが必要です。
    IDE はバックグラウンドで Xcode を実行して iOS フレームワークをビルドします。

    KMP プロジェクトの作業を開始する前に、初期セットアップを実行するために Xcode を少なくとも 1 回は起動してください。

    > Xcode が更新されるたびに手動で起動し、更新されたツール類をダウンロードする必要があります。
    > Kotlin Multiplatform IDE プラグインはプリフライトチェック（preflight checks）を実行し、Xcode が正しく設定されていない場合に警告を表示します。
    >
    {style="note"}

## プロジェクトの作成 {id="create-a-project"}

<Tabs>
<TabItem title= "IntelliJ IDEA">

Kotlin Multiplatform ジェネレーターを使用してプロジェクトを作成します:

1. メインメニューで **File** | **New** | **Project** を選択します。
2. 左側のリストで **Kotlin Multiplatform** を選択します。
   **Name** と **Location** を適切に設定します。
   **Project ID** は名前に基づいて自動生成されます。
3. このページの残りの部分では **Gradle** プロジェクトについて説明します。続行するには、**Build system** の切り替えで Gradle が選択されていることを確認してください。
4. サポートされているすべてのプラットフォームを試すには、Android、iOS、Desktop、Web、および Server を選択します。
   **UI implementation** オプションでは、対応するターゲットの UI フレームワークとして Compose Multiplatform を使用するために、**Share UI** を選択したままにします。

   > デスクトップターゲットには自動的に [Compose Hot Reload](compose-hot-reload.md) 機能が含まれており、コードの変更を保存するとすぐに UI の変更を確認できます。
   > デスクトップアプリの作成を予定していない場合でも、UI コードのイテレーションを高速化するためにプロジェクトにデスクトップターゲットを追加すると便利です。
   > 
   {style="note"}

5. **Create** ボタンをクリックし、IDE がプロジェクトを生成してインポートするのを待ちます。

![デフォルト設定で Android、iOS、desktop、web プラットフォームが選択された IntelliJ IDEA ウィザード](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

ウィザードを使用して新規プロジェクトを作成します:

1. メインメニューで **File** | **New** | **New project** を選択します。
2. デフォルトの **Phone and Tablet** テンプレートカテゴリで **Kotlin Multiplatform** を選択します。

    ![Android Studio での新規プロジェクトの最初のステップ](as-wizard-1.png){width="400"}

3. 必要に応じてプロジェクト名、パッケージ名、保存場所を設定し、**Next** をクリックします。
   **Build configuration language** は Kotlin DSL のままにしておきます。
4. 完全なデモを作成するには、利用可能なすべてのプラットフォーム（Android、iOS、Desktop、Web、Server）を選択します。
   利用可能な場所では **Share UI** オプションを選択したままにして、対応するターゲットの UI フレームワークとして Compose Multiplatform を使用します。

   > デスクトップターゲットには自動的に [Compose Hot Reload](compose-hot-reload.md) 機能が含まれており、コードの変更を保存するとすぐに UI の変更を確認できます。
   > デスクトップアプリの作成を予定していない場合でも、UI コードのイテレーションを高速化するためにプロジェクトにデスクトップターゲットを追加すると便利です。
   >
   {style="note"}

5. **Finish** ボタンをクリックし、IDE がプロジェクトを生成してインポートするのを待ちます。

![Android、iOS、desktop、web プラットフォームが選択された Android Studio ウィザードの最後のステップ](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

プラットフォーム間で共有されているコードは `shared` モジュールにあります。
`Platform.kt` ファイルには、プラットフォーム名を取得するための [`expect`](multiplatform-expect-actual.md) 宣言が含まれています。

異なるプラットフォーム向けのアプリを実行すると、ネイティブ呼び出しによって提供される異なるプラットフォーム名が表示されつつ、同じ UI レイアウトを確認できます。

## プリフライトチェックの確認 {id="consult-the-preflight-checks"}

プロジェクトのセットアップに環境の問題がないことを確認するには、
**Project Environment Preflight Checks** ツールウィンドウを開きます。
右サイドバーまたは下部バーにあるプリフライトチェックアイコン ![飛行機アイコンの Project Environment Preflight Checks アイコン](ide-preflight-checks.png){width="20"} をクリックしてください。

このツールウィンドウでは、どのチェックに合格したかを確認したり、再実行したり、設定を変更したりできます。
通常、このウィンドウは問題が検出されたときに自動的に開き、それ以外の場合は非表示のままになります。

プリフライトチェックのコマンドは、**Search Everywhere** ダイアログでも利用できます。
<shortcut>Shift</shortcut> を 2 回押し、"preflight" という単語を含むコマンドを検索してください:

!["preflight" と入力された Search Everywhere メニュー](double-shift-preflight-checks.png){width=600}

## 生成されたプロジェクト内のモジュール {id="modules-in-the-generated-project"}

Kotlin Multiplatform ウィザードで選択したプラットフォームのセットに応じて、IDE がプロジェクトをインポートした後に以下のモジュールが表示されます:

* **androidApp** は、Android アプリケーションをビルドするモジュールです。
* **desktopApp** は、デスクトップ JVM アプリケーションをビルドするモジュールです。
* **iosApp** は、iOS アプリケーションをビルドする Xcode プロジェクトです。**shared** モジュールに依存し、それを iOS フレームワークとして使用します。
* **shared** は、Android、デスクトップ、iOS、および Web アプリケーションの共通コードを含む Kotlin Multiplatform モジュールです。
* **webApp** は、Kotlin/JS と Kotlin/Wasm の両方の Web アプリケーションをビルドするモジュールです。
* **server** および **core** モジュールは、サーバープラットフォーム用にのみ作成されます:
  **core** はサーバーアプリとクライアントアプリ間で共有されるコードを保持します。
  **server** はエンドポイントを設定します。

  > サーバープラットフォームが選択されている場合、IDE はアプリケーションのエントリポイントを `app` ディレクトリ配下にグループ化します。
  > それ以外の場合、アプリモジュールはプロジェクトのルートに作成されます。
  >
  {style="tip"} 

`shared` モジュールはターゲットごとにコンパイルされます。
たとえば、Android アプリのビルド時には Kotlin/JVM モジュールとして扱われ、iOS アプリのビルド時には Kotlin/Native として扱われます。

## サンプルアプリの実行 {id="run-the-sample-apps"}

IDE ウィザードによって作成されたプロジェクトには、iOS、Android、デスクトップ、Web アプリケーション用に生成された実行構成（run configurations）と、サーバーアプリを実行するための Gradle タスクが含まれています。

実行構成を開始するには、IDE の右上にあるドロップダウンメニューを見つけて **Run** ボタンをクリックします:

<Tabs>
<TabItem title="Android">

Android アプリを実行するには、**androidApp** 実行構成を開始します:

![Android 実行構成がハイライトされたドロップダウン](run-android-configuration.png){width=250}

デフォルトでは、利用可能な最初の仮想デバイス上で実行されます:

![仮想デバイス上で実行された Android アプリ](run-android-app.png){width=300}

Android 実行構成を手動で作成するには（**Run | Edit Configurations**）、実行構成テンプレートとして **Android App** を選択し、モジュールとして **[project name].androidApp** を選択します。

</TabItem>
<TabItem title="iOS">

> iOS アプリをビルドするには、Xcode がインストールされた macOS マシンが必要です。
>
{style="note"}

**iosApp** 実行構成とシミュレートされたデバイス（Simulator）を選択します:

![iOS 実行構成がハイライトされたドロップダウン](run-ios-configuration.png){width=250}

この実行構成はバックグラウンドで Xcode を使用して iOS アプリをビルドし、iOS Simulator を使用して起動します。
初回のビルドではネイティブの依存関係が収集され、ビルドデータがキャッシュされるため、その後の実行が高速になります:

![仮想デバイス上で実行された iOS アプリ](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

デスクトップアプリのデフォルトの実行構成は **desktopApp [hot] 🔥** として作成されます:

![デフォルトのデスクトップ実行構成がハイライトされたドロップダウン](run-desktop-configuration.png){width=250}

この構成を使用すると、JVM デスクトップアプリを実行できます:

![JVM アプリ](run-desktop-app.png){width=600}

Hot Reload を使用するデスクトップ実行構成を手動で作成するには（**Run | Edit Configurations**）、**Gradle** 実行構成テンプレートを選択し、次のコマンドを指定して **[app name]:desktopApp** Gradle プロジェクトを指定します:

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

</TabItem>
<TabItem title="Web">

デフォルトでは、Web 用に 2 つの実行構成（**webApp [wasmJs]** と **webApp [js]**）が作成されます。
どちらも同じアプリを実行しますが、それぞれ Kotlin/Wasm または Kotlin/JS でビルドされます:

![デフォルトの Wasm 実行構成がハイライトされたドロップダウン](run-wasm-configuration.png){width=250}

この構成を実行すると、IDE は Kotlin/Wasm アプリをビルドし、デフォルトのブラウザで開きます:

![ブラウザ内の Web アプリ](run-wasm-app.png){width=600}

Web 実行構成を手動で作成するには、**Gradle** 実行構成テンプレートを選択し、`wasmJsBrowserDevelopmentRun` タスクを指定して **[app name]:webApp** Gradle プロジェクトを指定します（Kotlin/JS バージョンの場合は `jsBrowserDevelopmentRun`）。

</TabItem>
</Tabs>

## トラブルシューティング {id="troubleshooting"}

Kotlin Multiplatform のセットアップに関する問題は、通常、Java、Android SDK、または Xcode が正しく設定されていない場合に発生します。

### Java と JDK {id="java-and-jdk"}

Java の設定に関連する最も一般的な問題は次のとおりです:

* 一部のツールが Java のインストールを見つけられないか、誤ったバージョンを使用することがあります。
  これを解決するには、適切な JDK がインストールされているディレクトリに `JAVA_HOME` 環境変数を設定し（[JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) の使用をお勧めします）、`JAVA_HOME` 内の `bin` フォルダへのパスを `PATH` 変数に追加します。
* Android Studio で Gradle JDK に関する問題が発生した場合は、正しく設定されていることを確認してください:
  **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle** を選択します。

### Android ツール {id="android-tools"}

`adb` などの Android ツールの起動で問題が発生した場合は、`ANDROID_HOME/tools`、`ANDROID_HOME/tools/bin`、および `ANDROID_HOME/platform-tools` へのパスが `PATH` 環境変数に追加されていることを確認してください。

### Xcode {id="xcode"}

iOS 実行構成で実行対象の仮想デバイスがないと報告されたり、プリフライトチェックが失敗したりした場合は、Xcode を起動して iOS SDK のアップデートを確認してください。

### サポートを受ける {id="get-help"}

* **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) を受け取り、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin Multiplatform Tooling イシュートラッカー**: [新しい問題を報告する](https://youtrack.jetbrains.com/newIssue?project=KMT)。

## 次のステップ {id="what-s-next"}

KMP プロジェクトの構造と共有コードの記述についての詳細を学びましょう:

* [完全に共有されたコード: タイムゾーン選択アプリ](compose-multiplatform-new-project.md): Compose Multiplatform を使用して共有 UI コードを操作する方法を学ぶ初級レベルのチュートリアル。
* [ネイティブ UI: REST API リクエストの共有ロジック](multiplatform-upgrade-app.md): ネイティブ UI コードを含むマルチプラットフォームプロジェクトで共有コードを操作する方法を学ぶ初級レベルのチュートリアル。

特定の Kotlin Multiplatform ユースケースをさらに詳しく掘り下げましょう:

* [マルチプラットフォームの依存関係の操作](multiplatform-add-dependencies.md)
* [マルチプラットフォーム成果物を中心としたコードと成果物の整理](multiplatform-project-configuration.md)
* Compose Multiplatform UI フレームワークと Compose エコシステムにおけるその位置付けについて学ぶ: [Compose Multiplatform と Jetpack Compose の関係](compose-multiplatform-and-jetpack-compose.md)

KMP 向けに作成済みのコードを見つける:

* [サンプル](multiplatform-samples.md): JetBrains 公式のサンプルと、KMP の機能を紹介する厳選されたプロジェクトリスト。
* GitHub Topics:
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform): Kotlin Multiplatform で実装されたプロジェクト。
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample): KMP で記述されたサンプルプロジェクトのリスト。
* [klibs.io](https://klibs.io): KMP ライブラリの検索プラットフォーム。
  GitHub のプロジェクトや Maven Central のアーティファクトをインデックス化し、検索結果の細かなフィルタリングを可能にし、[AI ワークフローのサポート](https://klibs.io/ai) を提供します。