[//]: # (title: 開始使用 Kotlin/Wasm 與 WASI)

<primary-label ref="beta"/> 

本教學示範如何使用 [WebAssembly System Interface (WASI)](https://wasi.dev/) 在各種 WebAssembly 虛擬機上執行簡單的 [Kotlin/Wasm](wasm-overview.md) 應用程式。

您可以找到在 [Node.js](https://nodejs.org/en)、[Wasmtime](https://docs.wasmtime.dev)、[Deno](https://deno.com/) 以及 [WasmEdge](https://wasmedge.org/) 虛擬機上執行的應用程式範例。輸出結果是一個使用標準 WASI API 的簡單應用程式。

目前 Kotlin/Wasm 支援 WASI 0.1，也稱為 Preview 1。對 WASI 0.2 的支援預計在未來的版本中提供。[追蹤此 YouTrack 問題以獲取關於 WASI 0.2 支援的更新資訊](https://youtrack.jetbrains.com/issue/KT-64568)。 

[`wasmWasi`](wasm-overview.md#kotlin-wasm-and-wasi) 目標 [預設使用新的例外處理提案](wasm-configuration.md#exception-handling-proposal)，確保與現代 WebAssembly 執行環境有更好的相容性。

> Kotlin/Wasm 工具鏈開箱即提供 Node.js 任務 (`wasmWasiNode*`) 與 Wasmtime (`wasmWasiWasmtime*`)。
> 專案中的其他任務變體，例如使用 Deno 或 WasmEdge 的任務，則作為自訂任務包含在內。
>
{style="tip"}

## 開始之前 {id="before-you-start"}

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。

2. 透過在 IntelliJ IDEA 中選擇 **File | New | Project from Version Control** 來複製 [Kotlin/Wasm WASI 範本存儲庫](https://github.com/Kotlin/kotlin-wasm-wasi-template)。

   您也可以從命令列複製：
   
   ```bash
   git clone git@github.com:Kotlin/kotlin-wasm-wasi-template.git
   ```

## 執行應用程式 {id="run-the-application"}

1. 透過選擇 **View** | **Tool Windows** | **Gradle** 來開啟 **Gradle** 工具視窗。 
   
   當專案載入後，您可以在 **Gradle** 工具視窗中的 **kotlin-wasm-wasi-example** 下找到 Gradle 任務。

   > 您至少需要 Java 11 作為您的 Gradle JVM，任務才能成功載入。
   >
   {style="note"}

2. 從 **kotlin-wasm-wasi-example** | **Tasks** | **kotlin node** 中，選擇並執行下列其中一個 Gradle 任務：

   * **wasmWasiNodeDevelopmentRun**：在 Node.js 中執行應用程式。
   * **wasmWasiWasmtimeDevelopmentRun**：在 Wasmtime 中執行應用程式。
   * **wasmWasiDenoDevelopmentRun**：在 Deno 中執行應用程式。
   * **wasmWasiWasmEdgeDevelopmentRun**：在 WasmEdge 中執行應用程式。

     > 在 Windows 平台上使用 Deno 時，請確保已安裝 `deno.exe`。更多資訊請參閱 [Deno 的安裝文件](https://docs.deno.com/runtime/manual/getting_started/installation)。
     >
     {style="tip"}

   ![Kotlin/Wasm 與 WASI 任務](wasm-wasi-gradle-task.png){width=600}
   
或者，在終端中從 `kotlin-wasm-wasi-template` 根目錄執行下列其中一個指令：

* 在 Node.js 中執行應用程式：

  ```bash
  ./gradlew wasmWasiNodeDevelopmentRun
  ```

* 在 Wasmtime 中執行應用程式：

  ```bash
  ./gradlew wasmWasiWasmtimeDevelopmentRun
  ```

* 在 Deno 中執行應用程式：

  ```bash
  ./gradlew wasmWasiDenoDevelopmentRun
  ```

* 在 WasmEdge 中執行應用程式：

  ```bash
  ./gradlew wasmWasiWasmEdgeDevelopmentRun
  ```

當您的應用程式組建成功時，終端將顯示一條訊息：

![Kotlin/Wasm 與 WASI 應用程式](wasm-wasi-app-terminal.png){width=600}

## 測試應用程式 {id="test-the-application"}

您也可以測試 Kotlin/Wasm 應用程式在各個虛擬機上是否正常運作。

在 Gradle 工具視窗中，從 **kotlin-wasm-wasi-example** | **Tasks** | **verification** 執行下列其中一個 Gradle 任務：

* **wasmWasiNodeTest**：在 Node.js 中測試應用程式。
* **wasmWasiWasmtimeTest**：在 Wasmtime 中測試應用程式。
* **wasmWasiDenoTest**：在 Deno 中測試應用程式。
* **wasmWasiWasmEdgeTest**：在 WasmEdge 中測試應用程式。

![Kotlin/Wasm 與 WASI 測試任務](wasm-wasi-testing-task.png){width=600}

或者，在終端中從 `kotlin-wasm-wasi-template` 根目錄執行下列其中一個指令：
    
* 在 Node.js 中測試應用程式：

  ```bash
  ./gradlew wasmWasiNodeTest
  ```

* 在 Wasmtime 中測試應用程式：

  ```bash
  ./gradlew wasmWasiWasmtimeTest
  ```
   
* 在 Deno 中測試應用程式：
   
  ```bash
  ./gradlew wasmWasiDenoTest
  ```

* 在 WasmEdge 中測試應用程式：

  ```bash
  ./gradlew wasmWasiWasmEdgeTest
  ```

## 下一步？ {id="what-s-next"}

在 Kotlin Slack 加入 Kotlin/Wasm 社群：

<a href="https://slack-chats.kotlinlang.org/c/webassembly" as="button" mode="rock" icon="arrow-right" icon-position="right">加入 Kotlin/Wasm 社群</a>

嘗試更多 Kotlin/Wasm 範例：

* [Compose 圖片檢視器](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)
* [Node.js 範例](https://github.com/Kotlin/kotlin-wasm-nodejs-template)
* [Compose 範例](https://github.com/Kotlin/kotlin-wasm-compose-template)