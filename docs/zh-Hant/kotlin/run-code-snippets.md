[//]: # (title: 執行程式碼片段)

Kotlin 程式碼通常組織在專案中，您可以在 IDE、文字編輯器或其他工具中進行處理。但是，如果您想快速查看某個函式的運作方式或尋找運算式的值，則無需建立新專案並進行組建。請查看這三種在不同環境中立即執行 Kotlin 程式碼的便捷方法：

*   IDE 中的 [暫存檔 (scratch file)](#ide-scratches-and-worksheets)。
*   瀏覽器中的 [Kotlin Playground](#browser-kotlin-playground)。
*   命令列中的 [ki shell](#command-line-ki-shell)。

## IDE：暫存檔 {id="ide-scratches-and-worksheets"}

IntelliJ IDEA 和 Android Studio 支援 Kotlin [暫存檔 (scratch file)](https://www.jetbrains.com/help/idea/kotlin-repl.html#efb8fb32)。

_暫存檔_ (或簡稱為 _scratches_) 讓您可以在與專案相同的 IDE 視窗中建立程式碼草稿，並即時執行。暫存檔不與專案綁定；您可以從作業系統上的任何 IntelliJ IDEA 視窗存取並執行所有暫存檔。

要建立 Kotlin 暫存檔，請點擊 **File** | **New** | **Scratch File** 並選擇 **Kotlin** 類型。

暫存檔支援語法高亮顯示、自動補全和其他 IntelliJ IDEA 程式碼編輯功能。無需宣告 `main()` 函式 —— 您編寫的所有程式碼都會被執行，就像在 `main()` 的主體中一樣。

在暫存檔中完成程式碼編寫後，點擊 **Run**。執行結果將顯示在程式碼對應的行。

![執行暫存檔](scratch-run.png){width=700}

### 互動模式

IDE 可以自動執行暫存檔中的程式碼。要在停止輸入後立即獲得執行結果，請開啟 **Interactive mode**。

![暫存檔互動模式](scratch-interactive.png){width=700}

### 使用模組

您可以在暫存檔中使用 Kotlin 專案中的類別或函式。

要在暫存檔中使用專案中的類別或函式，請像往常一樣使用 `import` 陳述式將它們匯入暫存檔。然後編寫您的程式碼，並在 **Use classpath of module** 清單中選擇適當的模組後執行。

暫存檔會使用已連線模組的編譯版本。因此，如果您修改了模組的原始碼檔案，變更將在您重新組建模組時傳播到暫存檔。要在每次執行暫存檔前自動重新組建模組，請選擇 **Make module before Run**。

![暫存檔選擇模組](scratch-select-module.png){width=700}

## 瀏覽器：Kotlin Playground

[Kotlin Playground](https://play.kotlinlang.org/) 是一款線上應用程式，用於在瀏覽器中編寫、執行和分享 Kotlin 程式碼。

### 編寫與編輯程式碼

在 Playground 的編輯器區域中，您可以像在原始碼檔案中一樣編寫程式碼：
* 以任意順序新增您自己的類別、函式和頂層宣告。
* 在 `main()` 函式的主體中編寫可執行部分。

與典型的 Kotlin 專案一樣，Playground 中的 `main()` 函式可以帶有 `args` 參數，也可以不帶任何參數。要在執行時傳遞程式引數，請將其填寫在 **Program arguments** 欄位中。

![Playground：程式碼補全](playground-completion.png){width=700}

Playground 會在您輸入時醒目提示程式碼並顯示程式碼補全選項。它會自動從標準庫和 [`kotlinx.coroutines`](coroutines-overview.md) 匯入宣告。

### 選擇執行環境

Playground 提供了自訂執行環境的方法：
* 多個 Kotlin 版本，包括可用的 [未來版本預覽](eap.md)。
* 多種執行程式碼的後端：JVM、JS (舊版或 [IR 編譯器](js-ir-compiler.md)，或 Canvas) 或 JUnit。

![Playground：環境設定](playground-env-setup.png){width=700}

對於 JS 後端，您還可以查看產生的 JS 程式碼。

![Playground：產生的 JS](playground-generated-js.png){width=700}

### 線上分享程式碼

使用 Playground 與他人分享您的程式碼 —— 點擊 **Copy link** 並將其傳送給任何您想展示程式碼的人。

您還可以將 Playground 的程式碼片段嵌入到其他網站中，甚至使其可執行。點擊 **Share code** 將您的範例嵌入到任何網頁或 [Medium](https://medium.com/) 文章中。

![Playground：分享程式碼](playground-share.png){width=700}

## 命令列：ki shell

[ki shell](https://github.com/Kotlin/kotlin-interactive-shell) (_Kotlin Interactive Shell_) 是一款用於在終端執行 Kotlin 程式碼的命令列工具。它適用於 Linux、macOS 和 Windows。

ki shell 提供基礎的程式碼求值能力，以及以下進階特性：
* 程式碼補全
* 型別檢查
* 外部相依性
* 程式碼片段的貼上模式
* 指令指令碼支援

欲了解更多詳細資訊，請參閱 [ki shell GitHub 存儲庫](https://github.com/Kotlin/kotlin-interactive-shell)。

### 安裝並執行 ki shell

要安裝 ki shell，請從 [GitHub](https://github.com/Kotlin/kotlin-interactive-shell) 下載最新版本，並在您選擇的目錄中解壓縮。

在 macOS 上，您也可以透過執行以下指令，使用 Homebrew 安裝 ki shell：

```shell
brew install ki
```

要啟動 ki shell，在 Linux 和 macOS 上執行 `bin/ki.sh` (如果使用 Homebrew 安裝，只需輸入 `ki`)，或在 Windows 上執行 `bin\ki.bat`。

shell 執行後，您可以立即在終端中開始編寫 Kotlin 程式碼。輸入 `:help` (或 `:h`) 即可查看 ki shell 中可用的指令。

### 程式碼補全與醒目提示

當您按下 **Tab** 鍵時，ki shell 會顯示程式碼補全選項。它還會在您輸入時提供語法高亮顯示。您可以透過輸入 `:syntax off` 停用此功能。

![ki shell 醒目提示與補全](ki-shell-highlight-completion.png){width=700}

當您按下 **Enter** 鍵時，ki shell 會對輸入的行進行求值並列印結果。運算式的值會以自動產生的變數名稱 (如 `res*`) 列印。之後您可以在執行的程式碼中使用這些變數。如果輸入的結構不完整 (例如，只有 `if` 條件而沒有主體)，shell 會顯示三個點並等待剩餘部分。

![ki shell 結果](ki-shell-results.png){width=700}

### 檢查運算式的型別

對於複雜的運算式或您不熟悉的 API，ki shell 提供了 `:type` (或 `:t`) 指令，用於顯示運算式的型別：

![ki shell 型別](ki-shell-type.png){width=700}

### 載入程式碼

如果您需要的程式碼儲存在其他地方，有兩種方法可以將其載入並在 ki shell 中使用：
* 使用 `:load` (或 `:l`) 指令載入原始碼檔案。
* 使用 `:paste` (或 `:p`) 指令在貼上模式下複製並貼上程式碼片段。

![ki shell 載入檔案](ki-shell-load.png){width=700}

`ls` 指令會顯示可用的符號 (變數和函式)。

### 新增外部相依性

除了標準庫，ki shell 還支援外部相依性。這讓您無需建立整個專案即可在其中嘗試第三方程式庫。

要在 ki shell 中新增第三方程式庫，請使用 `:dependsOn` 指令。預設情況下，ki shell 使用 Maven Central，但如果您使用 `:repository` 指令連接其他存儲庫，也可以使用它們：

![ki shell 外部相依性](ki-shell-dependency.png){width=700}