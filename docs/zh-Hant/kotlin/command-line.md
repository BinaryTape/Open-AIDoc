[//]: # (title: Kotlin 命令列編譯器)

每個 Kotlin 版本都附帶一個獨立版本的編譯器。您可以手動下載最新版本，或透過封裝管理員下載。

> 安裝命令列編譯器並非使用 Kotlin 的必要步驟。
> 通常的做法是使用官方支援 Kotlin 的 IDE 或程式碼編輯器來撰寫 Kotlin 應用程式，
> 例如 [IntelliJ IDEA](https://www.jetbrains.com/idea/) 或 [Android Studio](https://developer.android.com/studio)。
> 他們開箱即用地提供了完整的 Kotlin 支援。
> 
> 了解如何[在 IDE 中開始使用 Kotlin](getting-started.md)。
> 
{style="note"}

## 安裝編譯器

### 手動安裝

若要手動安裝 Kotlin 編譯器：

1. 從 [GitHub Releases](%kotlinLatestUrl%) 下載最新版本 (`kotlin-compiler-%kotlinVersion%.zip`)。
2. 將獨立編譯器解壓縮到一個目錄中，並可以選擇將 `kotlinc/bin` 目錄新增至系統路徑。
`bin` 目錄包含在 Windows、macOS 和 Linux 上編譯和執行 Kotlin 所需的指令碼。

> 如果您想在 Windows 上使用 Kotlin 命令列編譯器，我們建議手動安裝。
> 
{style="note"}

### SDKMAN!

在基於 UNIX 的系統（如 macOS、Linux、Cygwin、FreeBSD 和 Solaris）上安裝 Kotlin 的更簡單方法是
[SDKMAN!](https://sdkman.io)。它也可以在 Bash 和 ZSH shell 中運作。[了解如何安裝 SDKMAN!](https://sdkman.io/install)。

若要透過 SDKMAN! 安裝 Kotlin 編譯器，請在終端機中執行以下指令：

```bash
sdk install kotlin
```

### Homebrew

或者，在 macOS 上，您可以透過 [Homebrew](https://brew.sh/) 安裝編譯器：

```bash
brew update
brew install kotlin
```

### Snap 封裝

如果您在 Ubuntu 16.04 或更高版本上使用 [Snap](https://snapcraft.io/)，可以從命令列安裝編譯器：

```bash
sudo snap install --classic kotlin
```

## 建立並執行應用程式

1. 在 Kotlin 中建立一個顯示 `"Hello, World!"` 的簡單主控台 JVM 應用程式。 
   在程式碼編輯器中，建立一個名為 `hello.kt` 的新檔案，並包含以下程式碼：

   ```kotlin
   fun main() {
       println("Hello, World!")
   }
   ```

2. 使用 Kotlin 編譯器編譯應用程式：

   ```bash
   kotlinc hello.kt -include-runtime -d hello.jar
   ```

   * `-d` 選項表示產生的類別檔案的輸出路徑，可以是目錄或 **.jar** 檔案。
   * `-include-runtime` 選項透過在產生的 **.jar** 檔案中包含 Kotlin 執行階段程式庫，使其成為自包含且可執行的檔案。

   若要查看所有可用選項，請執行：

   ```bash
   kotlinc -help
   ```

3. 執行應用程式：

   ```bash
   java -jar hello.jar
   ```

> 若要編譯 Kotlin/Native 應用程式，請使用 [Kotlin/Native 編譯器](native-get-started.md#using-the-command-line-compiler)。
> 
{style="note"}

## 編譯程式庫

如果您正在開發供其他 Kotlin 應用程式使用的程式庫，可以在不包含 Kotlin 執行階段的情況下建置 **.jar** 檔案：

```bash
kotlinc hello.kt -d hello.jar
```

由於以此方式編譯的二進位檔案相依於 Kotlin 執行階段，因此您應確保在每次使用編譯後的程式庫時，classpath 中都存在該執行階段。

您也可以使用 `kotlinr` 指令碼來執行 Kotlin 編譯器產生的二進位檔案：

```bash
kotlinr -classpath hello.jar HelloKt
```

`HelloKt` 是 Kotlin 編譯器為名為 `hello.kt` 的檔案產生的主類別名稱。

> 若要編譯 Kotlin/Native 程式庫，請使用 [Kotlin/Native 編譯器](native-libraries.md#using-kotlin-native-compiler)。
>
{style="note"}

## 執行 REPL

使用 [`-Xrepl` 編譯器選項](compiler-reference.md#xrepl) 執行編譯器即可獲得互動式 shell。在此 shell 中，您可以輸入任何有效的 Kotlin 程式碼並查看結果。

## 執行指令碼

您可以將 Kotlin 作為指令碼語言使用。
Kotlin 指令碼是帶有頂層可執行程式碼的 Kotlin 原始碼檔案 (`.kts`)。

```kotlin
import java.io.File

// 獲取傳入的路徑，例如 "-d some/path" 或使用目前路徑。
val path = if (args.contains("-d")) args[1 + args.indexOf("-d")]
           else "."

val folders = File(path).listFiles { file -> file.isDirectory() }
folders?.forEach { folder -> println(folder) }
```

若要執行指令碼，請將 `-script` 選項連同對應的指令碼檔案傳遞給編譯器：

```bash
kotlinc -script list_folders.kts -- -d <path_to_folder_to_inspect>
```

Kotlin 為指令碼自訂提供實驗性支援，例如新增外部屬性、提供靜態或動態相依性等等。
自訂是由所謂的「指令碼定義」所定義的 —— 這些是帶有適當支援程式碼且加註標記的 Kotlin 類別。
指令碼副檔名用於選取適當的定義。
進一步了解 [Kotlin 自訂指令碼](custom-script-deps-tutorial.md)。

當編譯 classpath 中包含適當的 jar 檔案時，會自動偵測並套用準備妥當的指令碼定義。或者，您可以透過將 `-script-templates` 選項傳遞給編譯器來手動指定定義：

```bash
kotlinc -script-templates org.example.CustomScriptDefinition -script custom.script1.kts
```

如需其他詳細資訊，請參閱 [KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md)。

## 下一步

[建立基於 Kotlin/JVM 的主控台應用程式](jvm-get-started.md)。