[//]: # (title: Kotlin/Wasm コードのデバッグ)

<primary-label ref="beta"/> 

このチュートリアルでは、IntelliJ IDEA とブラウザを使用して、Kotlin/Wasm でビルドされた [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) アプリケーションをデバッグする方法を説明します。

## 始める前に {id="before-you-start"}

1. [Kotlin Multiplatform 開発のための環境をセットアップします](https://kotlinlang.org/docs/multiplatform/quickstart.html#set-up-the-environment)。
2. 手順に従って [Kotlin/Wasm をターゲットとする Kotlin Multiplatform プロジェクトを作成します](wasm-get-started.md#create-a-project)。

> IntelliJ IDEA で Kotlin/Wasm コードをデバッグするには、JavaScript Debugger プラグインがインストールされている必要があります。[プラグインの詳細とインストール方法については、こちらを参照してください。](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html#ws_js_debugging_chrome_before_you_start)
>
{style="note"}

## IntelliJ IDEA でのデバッグ {id="debug-in-intellij-idea"}

作成した Kotlin Multiplatform プロジェクトには、Kotlin/Wasm を搭載した Compose Multiplatform アプリケーションが含まれています。追加の設定を行うことなく、このアプリケーションを IntelliJ IDEA でそのままデバッグできます。

1. IntelliJ IDEA で、デバッグ対象の Kotlin ファイルを開きます。このチュートリアルでは、Kotlin Multiplatform プロジェクトの以下のディレクトリにある `Greeting.kt` ファイルを使用します。

   `WasmDemo/composeApp/src/wasmJsMain/kotlin/wasm.project.demo.wasmdemo`

2. 行番号をクリックして、検査したいコードにブレークポイントを設定します。

   ![ブレークポイントの設定](wasm-breakpoints-intellij.png){width=650}

3. 実行構成のリストから **composeApp[wasmJs]** を選択します。
4. 画面上部にあるデバッグアイコンをクリックして、デバッグモードでコードを実行します。

   ![デバッグモードでの実行](wasm-debug-run-configurations.png){width=600}

   アプリケーションが起動すると、新しいブラウザウィンドウで開きます。

   ![ブラウザでの Compose アプリ](wasm-composeapp-browser.png){width=600}

   また、IntelliJ IDEA では **Debug** パネルが自動的に開きます。

   ![Compose アプリのデバッガー](wasm-debug-pane.png){width=600}

### アプリケーションの検査 {id="inspect-your-application"}

> [ブラウザでデバッグする場合](#debug-in-your-browser)も、アプリケーションを検査する手順は同様です。
>
{style="note"}

1. アプリケーションのブラウザウィンドウで、**Click me!** ボタンをクリックしてアプリケーションを操作します。この操作によってコードの実行がトリガーされ、実行がブレークポイントに達するとデバッガーが一時停止します。

2. デバッグペインでデバッグコントロールボタンを使用し、ブレークポイントでの変数やコードの実行状態を検査します。
    * ![ステップオーバー](wasm-debug-step-over.png){width=30}{type="joined"} ステップオーバー: 現在の行を実行し、次の行で一時停止します。
    * ![ステップイン](wasm-debug-step-into.png){width=30}{type="joined"} ステップイン: 関数をより詳細に調査します。
    * ![ステップアウト](wasm-debug-step-out.png){width=30}{type="joined"} ステップアウト: 現在の関数を抜けるまでコードを実行します。

3. **Threads & Variables** ペインを確認します。これは関数呼び出しのシーケンスをトレースし、エラーの場所を特定するのに役立ちます。

   ![Threads & Variables の確認](wasm-debug-panes-intellij.png){width=700}

4. コードを変更し、アプリケーションを再度実行して動作を確認します。
5. デバッグが完了したら、ブレークポイントのある行番号をクリックしてブレークポイントを解除します。

## ブラウザでのデバッグ {id="debug-in-your-browser"}

追加の設定を行わずに、ブラウザでこの Compose Multiplatform アプリケーションをデバッグすることもできます。

開発用 Gradle タスク（`*DevRun`）を実行すると、Kotlin はソースファイルをブラウザに自動的に提供するため、ブレークポイントの設定、変数の検査、Kotlin コードのステップ実行が可能になります。

Kotlin/Wasm プロジェクトのソースをブラウザに提供する設定は、現在 Kotlin Gradle プラグインに含まれています。以前にこの設定を `build.gradle.kts` ファイルに追加していた場合は、競合を避けるために削除してください。

> このチュートリアルでは Chrome ブラウザを使用していますが、他のブラウザでも同様の手順で実行できます。詳細については、[ブラウザのバージョン](wasm-configuration.md#browser-versions)を参照してください。
>
{style="tip"}

1. 手順に従って [Compose Multiplatform アプリケーションを実行します](wasm-get-started.md#run-the-application)。

2. アプリケーションのブラウザウィンドウで右クリックし、**検証**（Inspect）操作を選択して開発者ツールを開きます。または、**F12** ショートカットを使用するか、**表示** | **開発 / 管理** | **デベロッパー ツール**（View | Developer | Developer Tools）を選択することもできます。

3. **Sources** タブに切り替え、デバッグ対象の Kotlin ファイルを選択します。このチュートリアルでは、`Greeting.kt` ファイルを使用します。

4. 行番号をクリックして、検査したいコードにブレークポイントを設定します。濃い数字が表示されている行にのみブレークポイントを設定できます（この例では 4、7、8、9 行目）。

   ![ブレークポイントの設定](wasm-breakpoints-browser.png){width=700}

5. [IntelliJ IDEA でのデバッグ](#inspect-your-application)と同様に、アプリケーションを検査します。

    ブラウザでデバッグする場合、関数呼び出しのシーケンスをトレースしてエラーを特定するためのペインは **Scope** と **Call Stack** です。

   ![コールスタックの確認](wasm-debug-scope.png){width=450}

### カスタムフォーマッターの使用 {id="use-custom-formatters"}

カスタムフォーマッター（Custom formatters）を使用すると、ブラウザで Kotlin/Wasm コードをデバッグする際に、変数の値をよりわかりやすく直感的な方法で表示および特定できます。

カスタムフォーマッターは Kotlin/Wasm の開発ビルドではデフォルトで有効になっていますが、ブラウザの開発者ツール側でもカスタムフォーマッターが有効になっていることを確認する必要があります。

* Chrome DevTools の場合、**Settings | Preferences | Console** にある **Custom formatters** チェックボックスを確認します。

  ![Chrome でカスタムフォーマッターを有効にする](wasm-custom-formatters-chrome.png){width=400}

* Firefox DevTools の場合、**Settings | Advanced settings** にある **Enable custom formatters** チェックボックスを確認します。

  ![Firefox でカスタムフォーマッターを有効にする](wasm-custom-formatters-firefox.png){width=400}

この機能は [custom formatters API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html) を使用しており、Firefox および Chromium ベースのブラウザでサポートされています。

カスタムフォーマッターはデフォルトでは Kotlin/Wasm の開発ビルドに対してのみ機能するため、本番ビルドで使用したい場合は Gradle 設定を調整する必要があります。`wasmJs {}` ブロックに以下のコンパイラオプションを追加してください。

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        // ...

        compilerOptions {
            freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
        }
    }
}
```

## フィードバックの送信 {id="leave-feedback"}

デバッグ体験に関するフィードバックをお待ちしております。

* ![Slack](slack.svg){width=25}{type="joined"} Slack: [Slack の招待を受け取り](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)、[#webassembly](https://kotlinlang.slack.com/archives/CDFP59223) チャンネルで開発者に直接フィードバックを提供してください。
* [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492) でフィードバックを送信してください。

## 次のステップ {id="what-s-next"}

* この [YouTube 動画](https://www.youtube.com/watch?v=t3FUWfJWrjU&t=2703s) で、実際の Kotlin/Wasm デバッグの様子をご覧ください。
* その他の Kotlin/Wasm サンプルもお試しください。
  * [KotlinConf アプリケーション](https://github.com/JetBrains/kotlinconf-app)
  * [Compose 画像ビューアー](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)
  * [Node.js サンプル](https://github.com/Kotlin/kotlin-wasm-nodejs-template)
  * [WASI サンプル](https://github.com/Kotlin/kotlin-wasm-wasi-template)
  * [Compose サンプル](https://github.com/Kotlin/kotlin-wasm-compose-template)