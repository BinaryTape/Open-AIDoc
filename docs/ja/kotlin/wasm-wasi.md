[//]: # (title: Kotlin/Wasm と WASI を使ってみる)

<primary-label ref="beta"/> 

このチュートリアルでは、[WebAssembly System Interface (WASI)](https://wasi.dev/) を使用して、さまざまな WebAssembly 仮想マシンでシンプルな [Kotlin/Wasm](wasm-overview.md) アプリケーションを実行する方法を説明します。

[Node.js](https://nodejs.org/en)、[Wasmtime](https://docs.wasmtime.dev)、[Deno](https://deno.com/)、および [WasmEdge](https://wasmedge.org/) 仮想マシンで実行されるアプリケーションの例を紹介します。出力は、標準の WASI API を使用するシンプルなアプリケーションです。

現在、Kotlin/Wasm は Preview 1 としても知られる WASI 0.1 をサポートしています。WASI 0.2 のサポートは将来のリリースで計画されています。[WASI 0.2 サポートに関する最新情報については、この YouTrack イシューをフォローしてください](https://youtrack.jetbrains.com/issue/KT-64568)。 

[`wasmWasi`](wasm-overview.md#kotlin-wasm-and-wasi) ターゲットは、[デフォルトで新しい例外処理プロポーザル (exception handling proposal) を使用します](wasm-configuration.md#exception-handling-proposal)。これにより、最新の WebAssembly ランタイムとの互換性が向上します。

> Kotlin/Wasm ツールチェーンは、Node.js タスク (`wasmWasiNode*`) および Wasmtime タスク (`wasmWasiWasmtime*`) を標準で提供しています。Deno や WasmEdge を利用するものなど、プロジェクト内のその他のタスクバリアントは、カスタムタスクとして含まれています。
>
{style="tip"}

## 始める前に {id="before-you-start"}

1. 最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/) をダウンロードしてインストールします。

2. IntelliJ IDEA で **File | New | Project from Version Control** を選択して、[Kotlin/Wasm WASI テンプレートリポジトリ](https://github.com/Kotlin/kotlin-wasm-wasi-template)をクローンします。

   コマンドラインからクローンすることもできます：
   
   ```bash
   git clone git@github.com:Kotlin/kotlin-wasm-wasi-template.git
   ```

## アプリケーションの実行 {id="run-the-application"}

1. **View** | **Tool Windows** | **Gradle** を選択して、**Gradle** ツールウィンドウを開きます。 
   
   プロジェクトがロードされると、**Gradle** ツールウィンドウの **kotlin-wasm-wasi-example** の下に Gradle タスクが表示されます。

   > タスクを正常にロードするには、Gradle JVM として少なくとも Java 11 が必要です。
   >
   {style="note"}

2. **kotlin-wasm-wasi-example** | **Tasks** | **kotlin node** から、以下のいずれかの Gradle タスクを選択して実行します：

   * **wasmWasiNodeDevelopmentRun**: アプリケーションを Node.js で実行します。
   * **wasmWasiWasmtimeDevelopmentRun**: アプリケーションを Wasmtime で実行します。
   * **wasmWasiDenoDevelopmentRun**: アプリケーションを Deno で実行します。
   * **wasmWasiWasmEdgeDevelopmentRun**: アプリケーションを WasmEdge で実行します。

     > Windows プラットフォームで Deno を使用する場合は、`deno.exe` がインストールされていることを確認してください。詳細については、[Deno のインストールドキュメント](https://docs.deno.com/runtime/manual/getting_started/installation)を参照してください。
     >
     {style="tip"}

   ![Kotlin/Wasm and WASI tasks](wasm-wasi-gradle-task.png){width=600}
   
または、`kotlin-wasm-wasi-template` ルートディレクトリのターミナルから、以下のいずれかのコマンドを実行します：

* アプリケーションを Node.js で実行する場合：

  ```bash
  ./gradlew wasmWasiNodeDevelopmentRun
  ```

* アプリケーションを Wasmtime で実行する場合：

  ```bash
  ./gradlew wasmWasiWasmtimeDevelopmentRun
  ```

* アプリケーションを Deno で実行する場合：

  ```bash
  ./gradlew wasmWasiDenoDevelopmentRun
  ```

* アプリケーションを WasmEdge で実行する場合：

  ```bash
  ./gradlew wasmWasiWasmEdgeDevelopmentRun
  ```

アプリケーションが正常にビルドされると、ターミナルにメッセージが表示されます：

![Kotlin/Wasm and WASI app](wasm-wasi-app-terminal.png){width=600}

## アプリケーションのテスト {id="test-the-application"}

また、Kotlin/Wasm アプリケーションがさまざまな仮想マシンで正しく動作するかテストすることもできます。

Gradle ツールウィンドウの **kotlin-wasm-wasi-example** | **Tasks** | **verification** から、以下のいずれかの Gradle タスクを実行します：

* **wasmWasiNodeTest**: Node.js でアプリケーションをテストします。
* **wasmWasiWasmtimeTest**: Wasmtime でアプリケーションをテストします。
* **wasmWasiDenoTest**: Deno でアプリケーションをテストします。
* **wasmWasiWasmEdgeTest**: WasmEdge でアプリケーションをテストします。

![Kotlin/Wasm and WASI test tasks](wasm-wasi-testing-task.png){width=600}

または、`kotlin-wasm-wasi-template` ルートディレクトリのターミナルから、以下のいずれかのコマンドを実行します：
    
* アプリケーションを Node.js でテストする場合：

  ```bash
  ./gradlew wasmWasiNodeTest
  ```

* アプリケーションを Wasmtime でテストする場合：

  ```bash
  ./gradlew wasmWasiWasmtimeTest
  ```
   
* アプリケーションを Deno でテストする場合：
   
  ```bash
  ./gradlew wasmWasiDenoTest
  ```

* アプリケーションを WasmEdge でテストする場合：

  ```bash
  ./gradlew wasmWasiWasmEdgeTest
  ```

## 次のステップ {id="what-s-next"}

Kotlin Slack の Kotlin/Wasm コミュニティに参加しましょう：

<a href="https://slack-chats.kotlinlang.org/c/webassembly" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin/Wasm コミュニティに参加する</a>

他の Kotlin/Wasm の例も試してみてください：

* [Compose image viewer](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)
* [Node.js example](https://github.com/Kotlin/kotlin-wasm-nodejs-template)
* [Compose example](https://github.com/Kotlin/kotlin-wasm-compose-template)