[//]: # (title: Compose Multiplatform アプリの作成)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>このチュートリアルでは IntelliJ IDEA を使用しますが、Android Studio でも同様に進めることができます。どちらの IDE もコア機能と Kotlin Multiplatform サポートは共通です。</p>
    <br/>
    <p>これは、<strong>共有ロジックと UI を使用した Compose Multiplatform アプリの作成</strong>チュートリアルの第 1 パートです。</p>
    <p><img src="icon-1.svg" width="20" alt="First step"/> <strong>Compose Multiplatform アプリの作成</strong><br/>
        <img src="icon-2-todo.svg" width="20" alt="Second step"/> コンポーザブルコードの確認 <br/>
        <img src="icon-3-todo.svg" width="20" alt="Third step"/> プロジェクトの修正 <br/>      
        <img src="icon-4-todo.svg" width="20" alt="Fourth step"/> 独自のアプリケーションの作成 <br/>
    </p>
</tldr>

ここでは、IntelliJ IDEA を使用して最初の Compose Multiplatform アプリケーションを作成し、実行する方法を学びます。

[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) UI フレームワークを使用すると、Kotlin Multiplatform のコード共有機能をアプリケーションロジック以外にも拡張できます。ユーザーインターフェースを一度実装すれば、Compose Multiplatform がサポートするすべてのプラットフォームで利用できます。

このチュートリアルでは、Android、iOS、デスクトップ、および Web で動作するサンプルアプリケーションを構築します。ユーザーインターフェースの作成には Compose Multiplatform フレームワークを使用し、コンポーザブル関数、テーマ、レイアウト、イベント、モディファイアといった基本について学びます。

このチュートリアルを進める上での留意点：
* Compose Multiplatform、Android、または iOS の以前の経験は必要ありません。開始前に [Kotlin の基礎](https://kotlinlang.org/docs/getting-started.html)に慣れておくことをお勧めします。
* このチュートリアルを完了するには、IntelliJ IDEA のみが必要です。これにより、Android とデスクトップでのマルチプラットフォーム開発を試すことができます。iOS については、Xcode がインストールされた macOS マシンが必要です。これは iOS 開発における一般的な制限です。
* 必要に応じて、興味のある特定のプラットフォームのみを選択し、それ以外を省略することも可能です。

## プロジェクトの作成

1. [クイックスタート](quickstart.md)に従って、[Kotlin Multiplatform 開発のための環境構築](quickstart.md#set-up-the-environment)を完了させてください。
2. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
3. 左側のパネルで **Kotlin Multiplatform** を選択します。

    > Kotlin Multiplatform IDE プラグインを使用していない場合は、[KMP Web ウィザード](https://kmp.jetbrains.com/?android=true&ios=true&iosui=compose&desktop=true&web=true&includeTests=true)を使用して同じプロジェクトを生成できます。
    >
    {style="note"}

4. **New Project** ウィンドウで以下のフィールドを指定します：

    * **Name**: ComposeDemo
    * **Project ID**（パッケージ名として使用）: compose.project.demo

5. **Android**、**iOS**、**Desktop**、**Web** ターゲットを選択します。
    iOS と Web で **Share UI** オプションが選択されていることを確認してください。
6. すべてのフィールドとターゲットを指定したら、**Create**（Web ウィザードの場合は **Download**）をクリックします。

   ![Compose Multiplatform プロジェクトの作成](create-compose-multiplatform-project.png){width=800}

## プロジェクト構造の確認

IntelliJ IDEA で `ComposeDemo` フォルダに移動します。
ウィザードで iOS を選択しなかった場合、名前が "ios" または "apple" で始まるフォルダは作成されません。

> IDE がプロジェクト内の Android Gradle plugin (AGP) を最新バージョンにアップグレードするよう自動的に提案することがあります。Kotlin Multiplatform は最新の AGP バージョンと互換性がない場合があるため、アップグレードは推奨しません（[互換性テーブル](https://kotlinlang.org/docs/multiplatform-compatibility-guide.html#version-compatibility)を参照してください）。
>
{style="note"}

プロジェクトには以下のモジュールが含まれています：

* **shared** は、Android、デスクトップ、iOS、および Web アプリケーション間で共有されるロジック（すべてのプラットフォームで使用するコード）を含む Kotlin Multiplatform モジュールです。ビルドプロセスの自動化を支援するビルドシステムとして [Gradle](https://kotlinlang.org/docs/gradle.html) を使用しています。
* **androidApp** は、Android アプリケーションとしてビルドされるモジュールです。
* **iosApp** は、iOS アプリケーションとしてビルドされる Xcode プロジェクトです。これは共有モジュールに依存し、iOS フレームワークとして使用します。
* **desktopApp** は、デスクトップ JVM アプリケーションとしてビルドされるモジュールです。`shared` モジュールに依存します。
* **webApp** は、Kotlin/JS および Kotlin/Wasm の両方の Web アプリケーションとしてビルドされるモジュールです。

![Compose Multiplatform プロジェクト構造](compose-project-structure.png){width=400}

**shared** モジュールには、以下のソースセットが含まれています：`androidMain`、`commonMain`、`iosMain`、`jsMain`、`jvmMain`、`wasmJsMain`（テストを含めるように選択した場合は `-Test` ソースセットも含まれます）。

「ソースセット（source set）」は、論理的にグループ化された多数のファイルを指す Gradle の概念であり、各グループは独自の依存関係を持ちます。Kotlin Multiplatform では、異なるソースセットが通常異なるプラットフォームをターゲットにします。

`commonMain` ソースセットは共通の Kotlin コードを使用し、プラットフォーム固有のソースセットは各ターゲットに固有の Kotlin コードを使用します：

* `jvmMain` はデスクトップターゲット用のソースファイルを含み、Kotlin/JVM を使用します。
* `androidMain` は Android ソースファイルを含み、Kotlin/JVM をターゲットにします。
* `iosMain` は iOS 用の Kotlin コードを含み、Kotlin/Native をターゲットにします。
* `jsMain` は JavaScript 固有の Kotlin コードを含み、Kotlin/JS をターゲットにします。
* `wasmJsMain` は Wasm 固有の Kotlin コードを含み、Kotlin/Wasm をターゲットにします。

このように、`shared` モジュールが Android ライブラリとしてビルドされるとき、共通の Kotlin コードは Kotlin/JVM として扱われます。iOS フレームワークとしてビルドされるときは、共通の Kotlin コードは Kotlin/Native として扱われます。
共有モジュールが Web アプリとしてビルドされるときは、共通の Kotlin コードは必要に応じて Kotlin/Wasm または Kotlin/JS として扱うことができます。

![Common Kotlin, Kotlin/JVM, and Kotlin/Native](module-structure.svg){width=700}

一般的に、プラットフォーム間で同じように動作すべき機能を一度だけ実装するメリットを活かすため、可能な限り共通コード（common code）として実装を記述してください。
プラットフォーム固有のソースセットには、理想的にはプラットフォーム固有の API 呼び出しや UX フローのみを含めるようにします。

`shared/src/commonMain/kotlin` ディレクトリにある `App.kt` ファイルを開きます。ここには、最小限ですが完全な Compose Multiplatform UI を実装する `App()` 関数が含まれています：

```kotlin
@Composable
@Preview
fun App() {
    MaterialTheme {
        var showContent by remember { mutableStateOf(false) }
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Button(onClick = { showContent = !showContent }) {
                Text("Click me!")
            }
            AnimatedVisibility(showContent) {
                val greeting = remember { Greeting().greet() }
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Image(painterResource(Res.drawable.compose_multiplatform), null)
                    Text("Compose: $greeting")
                }
            }
        }
    }
}
```
{id="common-app-composable"}

それでは、サポートされているすべてのプラットフォームでアプリケーションを実行してみましょう。

## アプリケーションの実行

Android、iOS、デスクトップ、および Web でアプリケーションを実行できます。実行する順序に決まりはありませんので、最も慣れているプラットフォームから始めてください。

> 提供されている「実行構成（run configuration）」は、一般的な Gradle の build タスクよりも効率的です。
> デフォルトの Gradle タスクはすべてのターゲットのデバッグバージョンとリリースバージョンをビルドしますが、実行構成は対応するターゲットのビルドのみをトリガーします。
>
{style="tip"}

### Android でアプリケーションを実行する

1. 実行構成のリストで **androidApp** を選択します。
2. Android 仮想デバイスを選択し、**Run** をクリックします。IDE が、選択した仮想デバイス（電源がオフの場合は起動してから）でアプリを実行します。

![Android で Compose Multiplatform アプリを実行](compose-run-android.png){width=352}

![Android での最初の Compose Multiplatform アプリ](first-compose-project-on-android-1.png){width=352}

<snippet id="run_android_other_devices">

#### 別の Android シミュレートデバイスで実行する {initial-collapse-state="collapsed" collapsible="true"}

[Android Emulator を構成し、別のシミュレートデバイスでアプリケーションを実行する](https://developer.android.com/studio/run/emulator#runningapp)方法については、こちらをご覧ください。

#### 実機の Android デバイスで実行する {initial-collapse-state="collapsed" collapsible="true"}

[ハードウェアデバイスを構成して接続し、そのデバイスでアプリケーションを実行する](https://developer.android.com/studio/run/device)方法については、こちらをご覧ください。

</snippet>

### iOS でアプリケーションを実行する

初期セットアップの一環として Xcode を起動していない場合は、iOS アプリを実行する前に起動してください。

IntelliJ IDEA で実行構成のリストから **iosApp** を選択し、実行構成の隣にあるシミュレートデバイスを選択して **Run** をクリックします。

![iOS で Compose Multiplatform アプリを実行](compose-run-ios.png){width=405}

![iOS での最初の Compose Multiplatform アプリ](first-compose-project-on-ios-1.png){width=411}

<snippet id="run_ios_other_devices">

#### 実機の iOS デバイスで実行する {initial-collapse-state="collapsed" collapsible="true"}

実機の iOS デバイスでマルチプラットフォームアプリケーションを実行できます。開始する前に、[Apple ID](https://support.apple.com/en-us/HT204316) に関連付けられたチーム ID を設定する必要があります。

##### チーム ID を設定する

プロジェクトで初めてチーム ID を設定するには、Xcode でプロジェクトを開きます（**File | Open Project in Xcode**）：

1. 左側のプロジェクトナビゲーターで **iosApp** を選択します。
2. **Targets** の下の **iosApp** を選択し、**Signing & Capabilities** タブに切り替えます。
3. **Team** リストで自分のチームを選択します。

   チームをまだ設定していない場合は、**Team** リストの **Add an Account** オプションを使用して、Xcode の指示に従ってください。

4. Bundle Identifier が一意であること、および Signing Certificate が正常に割り当てられていることを確認してください。

Xcode でチームを設定した後は、IntelliJ IDEA でチームを設定または変更できます：

1. **iosApp** の実行構成を編集します：

   ![iOS 実行構成の編集](ios-edit-configurations.png){width=450}

2. **Options** タブに切り替え、**Development team** ドロップダウンで必要な変更を行い、**OK** をクリックします。

##### アプリを実行する

iPhone をケーブルで接続します。すでにデバイスを Xcode に登録している場合、IntelliJ IDEA の実行構成リストに表示されるはずです。対応する `iosApp` 構成を実行します。

iPhone をまだ Xcode に登録していない場合は、[Apple の推奨事項](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/)に従ってください。
簡単に言うと、以下の手順が必要です：

1. iPhone をケーブルで接続します。
2. iPhone の **設定** | **プライバシーとセキュリティ** でデベロッパモードを有効にします。
3. Xcode の上部メニューで **Window** | **Devices and Simulators** を選択します。
4. iPhone が接続済みとして表示されない場合は、左下のプラス記号をクリックして選択します。
5. 画面の指示に従ってペアリングプロセスを完了します。

Xcode に iPhone を登録したら、IntelliJ IDEA で **iosApp** 実行構成を選択したときに、利用可能なデバイスのリストに表示されるようになります。

</snippet>

### デスクトップでアプリケーションを実行する

実行構成のリストで **desktopApp [hot] 🔥** を選択し、**Run** をクリックします。
デフォルトでは、実行構成は [Compose Hot Reload](compose-hot-reload.md) が動作した状態で、独自の OS ウィンドウでデスクトップアプリを起動します：

![デスクトップで Compose Multiplatform アプリを実行](compose-run-desktop.png){width=350}

![デスクトップでの最初の Compose Multiplatform アプリ](first-compose-project-on-desktop-1.png){width=500}

### Web アプリケーションを実行する

1. 実行構成のリストで以下を選択します：

   * **webApp[js]**: Kotlin/JS アプリケーションを実行する場合。
   * **webApp[wasmJs]**: Kotlin/Wasm アプリケーションを実行する場合。

2. **Run** をクリックします。

Web アプリケーションがデフォルトのブラウザで自動的に開き、デフォルトでは `http://localhost:8080/` で利用可能になります。

> 8080 ポートが使用できない場合、ポート番号が異なることがあります。
> 実際のポート番号は、Gradle ビルドコンソールで "Project is running at" というフレーズを検索することで確認できます。
>
{style="tip"}

![Compose Web アプリケーション](first-compose-project-on-web.png){width=600}

#### Web ターゲットの互換モード

Web アプリケーションに対して互換モードを有効にすることで、すべてのブラウザですぐに動作するようにできます。
このモードでは、モダンなブラウザは Wasm バージョンを使用し、古いブラウザは JS バージョンにフォールバックします。
このモードは、`js` と `wasmJs` の両方のターゲットに対するクロスコンパイルによって実現されます。

Web アプリケーションの互換モードを有効にするには：

1. **View | Tool Windows | Gradle** を選択して Gradle ツールウィンドウを開きます。
2. **ComposeDemo | Tasks | compose** で、**composeCompatibilityBrowserDistribution** タスクを選択して実行します。

   > タスクを正常にロードするには、Gradle JVM として少なくとも Java 11 が必要です。また、Compose Multiplatform プロジェクト全般において、少なくとも JetBrains Runtime 17 を使用することを推奨します。
   >
   {style="note"}

   ![互換タスクの実行](web-compatibility-gradle-task.png){width=500}

   または、`ComposeDemo` ルートディレクトリからターミナルで以下のコマンドを実行することもできます：

    ```bash
    ./gradlew composeCompatibilityBrowserDistribution
    ```

Gradle タスクが完了すると、互換性のあるアーティファクトが `composeApp/build/dist/composeWebCompatibility/productionExecutable` ディレクトリに生成されます。
これらのアーティファクトを使用して、`js` と `wasmJs` の両方のターゲットで動作する[アプリケーションを公開](https://kotlinlang.org/docs/wasm-get-started.html#publish-the-application)できます。

## 次のステップ

チュートリアルの次のパートでは、コンポーザブル関数を実装し、各プラットフォームでアプリケーションを起動する方法を学びます。

**[次のパートへ進む](compose-multiplatform-explore-composables.md)**

## ヘルプを得る

* **Kotlin Slack**: [招待](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)を受けて、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) チャンネルに参加してください。
* **Kotlin 課題トラッカー**: [新しい課題を報告](https://youtrack.jetbrains.com/newIssue?project=KT)してください。