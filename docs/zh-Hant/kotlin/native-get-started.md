[//]: # (title: 開始使用 Kotlin/Native)

在本教學中，你將學習如何建立 Kotlin/Native 應用程式。選擇最適合你的工具，並透過以下方式建立你的應用程式：

* **[IDE](#in-ide)**。在此處，你可以從版本控制系統複製專案樣板，並在 IntelliJ IDEA 中使用它。
* **[Gradle 建構系統](#using-gradle)**。若要進一步了解底層運作原理，可以手動為你的專案建立組建檔案。
* **[命令列工具](#using-the-command-line-compiler)**。你可以使用作為標準 Kotlin 發行版本一部分提供的 Kotlin/Native 編譯器，並直接在命令列工具中建立應用程式。

  主控台編譯看似簡單直接，但對於包含數百個檔案和庫的較大專案來說，擴展性並不佳。對於此類專案，我們建議使用 IDE 或建構系統。

使用 Kotlin/Native，你可以針對[不同目標](native-target-support.md)進行編譯，包括 Linux、macOS 和 Windows。
雖然可以進行跨平台編譯（即使用一個平台編譯另一個平台的目標），但在本教學中，你的目標將與編譯所在的平台相同。

> 如果你使用 Mac 並且想要為 macOS 或其他 Apple 目標建立並執行應用程式，你還需要先安裝 [Xcode Command Line Tools](https://developer.apple.com/download/)、啟動它並接受授權條款。
>
{style="note"}

## 在 IDE 中 {id="in-ide"}

在本節中，你將學習如何使用 IntelliJ IDEA 建立 Kotlin/Native 應用程式。

### 建立專案 {id="create-the-project"}

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。
2. 在 IntelliJ IDEA 中選取 **File** | **New** | **Project from Version Control**，並使用以下 URL 複製[專案樣板](https://github.com/Kotlin/kmp-native-wizard)：

   ```none
   https://github.com/Kotlin/kmp-native-wizard
   ```   

3. 開啟 `gradle/libs.versions.toml` 檔案，它是專案相依性的版本目錄。要建立 Kotlin/Native 應用程式，你需要 Kotlin Multiplatform Gradle 外掛程式，其版本與 Kotlin 相同。請確保使用最新的 Kotlin 版本：

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   ```

4. 依照提示重新載入 Gradle 檔案：

   ![載入 Gradle 變更按鈕](load-gradle-changes.png){width=295}

有關這些設定的更多資訊，請參閱 [Multiplatform Gradle DSL 參考指南](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 建置並執行應用程式 {id="build-and-run-the-application"}

開啟 `src/nativeMain/kotlin/` 目錄中的 `Main.kt` 檔案：

* `src` 目錄包含 Kotlin 原始碼檔案。
* `Main.kt` 檔案包含使用 [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 函式印出 "Hello, Kotlin/Native!" 的程式碼。

點擊邊欄中的綠色圖示來執行程式碼：

![執行應用程式](native-run-gutter.png){width=450}

IntelliJ IDEA 會使用 Gradle 任務執行程式碼，並在 **Run** 標籤頁中輸出結果：

![應用程式輸出](native-output-gutter-1.png){width=450}

首次執行後，IDE 會在頂部建立對應的執行配置：

![Gradle 執行配置](native-run-config.png){width=500}

> 擁有 Ultimate 訂閱的 IntelliJ IDEA 使用者可以安裝 [Native Debugging Support](https://plugins.jetbrains.com/plugin/12775-native-debugging-support) 外掛程式，該外掛程式允許對編譯後原生可執行檔進行偵錯，並自動為匯入的 Kotlin/Native 專案建立執行配置。

你可以[設定 IntelliJ IDEA](https://www.jetbrains.com/help/idea/compiling-applications.html#auto-build) 以自動建置專案：

1. 前往 **Settings | Build, Execution, Deployment | Compiler**。
2. 在 **Compiler** 頁面中，選取 **Build project automatically**。
3. 套用變更。

現在，當你修改類別檔案或儲存檔案（<shortcut>Ctrl + S</shortcut>/<shortcut>Cmd + S</shortcut>）時，IntelliJ IDEA 都會自動對專案執行累加建置。

### 更新應用程式 {id="update-the-application"}

讓我們為你的應用程式新增一項功能，使其能夠計算你名字中的字母數量：

1. 在 `Main.kt` 檔案中，新增讀取輸入的程式碼。使用 [`readln()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln.html) 函式讀取輸入值並將其指派給 `name` 變數：

   ```kotlin
   fun main() {
       // 讀取輸入值。
       println("Hello, enter your name:")
       val name = readln()
   }
   ```

2. 若要使用 Gradle 執行此應用程式，請在 `build.gradle.kts` 檔案中指定 `System.in` 作為輸入來源，並載入 Gradle 變更：

   ```kotlin
   kotlin {
       //...
       targets.withType<KotlinNativeTarget>().configureEach {
           binaries {
               executable {
                   entryPoint = "main"
                   runTaskProvider?.configure { standardInput = System.`in` }
               }
           }
       }
       //...
   }
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="runTaskProvider?.configure { standardInput = System.`in` }"}

3. 去除空白字元並計算字母數量：

   * 使用 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html) 函式移除名字中的空格。
   * 使用作用域函式 [`let`](scope-functions.md#let) 在物件內容中執行該函式。
   * 使用[字串範本](strings.md#string-templates)，透過加上錢字號 `$` 並以花括號包覆（`${it.length}`），將你的名字長度插入到字串中。`it` 是 [Lambda 參數](coding-conventions.md#lambda-parameters)的預設名稱。

   ```kotlin
   fun main() {
       // 讀取輸入值。
       println("Hello, enter your name:")
       val name = readln()
       // 計算名字中的字母數量。
       name.replace(" ", "").let {
           println("Your name contains ${it.length} letters")
       }
   }
   ```

4. 執行應用程式。
5. 輸入你的名字並查看結果：

   ![應用程式輸出](native-output-gutter-2.png){width=500}

現在讓我們只計算你名字中不重複的字母：

1. 在 `Main.kt` 檔案中，為 `String` 宣告新的[擴充函式](extensions.md#extension-functions) `.countDistinctCharacters()`：

   * 使用 [`.lowercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html) 函式將名字轉換為小寫。
   * 使用 [`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html) 函式將輸入字串轉換為字元清單。
   * 使用 [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) 函式僅選取名字中不重複的字元。
   * 使用 [`count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函式計算不重複字元的數量。

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

2. 使用 `.countDistinctCharacters()` 函式計算名字中不重複的字母數量：

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()

   fun main() {
       // 讀取輸入值。
       println("Hello, enter your name:")
       val name = readln()
       // 計算名字中的字母數量。
       name.replace(" ", "").let {
           println("Your name contains ${it.length} letters")
           // 印出不重複字母的數量。
           println("Your name contains ${it.countDistinctCharacters()} unique letters")
       }
   }
   ```

3. 執行應用程式。
4. 輸入你的名字並查看結果：

   ![應用程式輸出](native-output-gutter-3.png){width=500}

## 使用 Gradle {id="using-gradle"}

在本節中，你將學習如何使用 [Gradle](https://gradle.org) 手動建立 Kotlin/Native 應用程式。它是 Kotlin/Native 和 Kotlin Multiplatform 專案的預設建構系統，也廣泛應用於 Java、Android 和其他生態系統中。

建置 Kotlin/Native 專案時，Kotlin Gradle 外掛程式會下載以下構件：

* Kotlin/Native 主套裝，其中包括 `konanc`、`cinterop` 和 `jsinterop` 等不同工具。預設情況下，Kotlin/Native 套裝會作為一般的 Gradle 相依性從 [Maven Central](https://repo1.maven.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/) 存儲庫下載。
* `konanc` 本身所需的相依性，例如 `llvm`。它們會使用自訂邏輯從 JetBrains CDN 下載。

你可以在 Gradle 組建指令碼的 `repositories {}` 區塊中變更主要套裝的下載來源。

### 建立專案檔案 {id="create-project-files"}

1. 開始之前，請先安裝相容版本的 [Gradle](https://gradle.org/install/)。請參閱[相容性表格](gradle-configure-project.md#apply-the-plugin)以檢查 Kotlin Gradle 外掛程式 (KGP) 與可用 Gradle 版本的相容性。
2. 建立一個空的專案目錄。在其中建立具有以下內容的 `build.gradle(.kts)` 檔案：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       // 指定下載主套裝的來源
       // 預設使用 Maven Central
       mavenCentral()
   }

   kotlin {
       macosArm64()    // 在 macOS 上
       // linuxArm64() // 在 Linux 上
       // mingwX64()   // 在 Windows 上
   
       targets.withType<KotlinNativeTarget>().configureEach {
           binaries {
               executable()
           }
       }
   }

   tasks.withType<Wrapper> {
       gradleVersion = "%gradleVersion%"
       distributionType = Wrapper.DistributionType.BIN
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       // 指定下載主套裝的來源
       // 預設使用 Maven Central
       mavenCentral()
   }

   kotlin {
       macosArm64()    // 在 macOS 上
       // linuxArm64() // 在 Linux 上
       // mingwX64()   // 在 Windows 上
   
       targets.withType(KotlinNativeTarget).configureEach {
           binaries {
               executable()
           }
       }
   }

   wrapper {
       gradleVersion = '%gradleVersion%'
       distributionType = 'BIN'
   }
   ```

   </tab>
   </tabs>

   你可以使用不同的[目標名稱](native-target-support.md)（例如 `macosArm64`、`iosArm64`、`linuxArm64` 和 `mingwX64`）來定義編譯程式碼的目標平台。目標名稱會用於產生專案中的原始碼路徑和任務名稱。

3. 在專案目錄中建立一個空的 `settings.gradle(.kts)` 檔案。
4. 建立 `src/nativeMain/kotlin` 目錄，並在其中放置具有以下內容的 `hello.kt` 檔案：

   ```kotlin
   fun main() {
       println("Hello, Kotlin/Native!")
   }
   ```

按照慣例，所有原始碼都位於 `src/<平台名稱>[Main|Test]/kotlin` 目錄中，其中 `Main` 用於原始碼，`Test` 用於測試。在此例中，`<平台名稱>` 為 `native`。

### 建置並執行專案 {id="build-and-run-the-project"}

1. 在專案根目錄中，針對你的目標執行 `<yourTargetName>Binaries` 組建指令，例如：

   ```bash
   ./gradlew macosArm64Binaries
   ```

   此指令會建立 `build/bin/<yourTargetName>` 目錄，其中包含兩個子目錄：`debugExecutable` 和 `releaseExecutable`。它們包含對應的二進位檔案。

   預設情況下，二進位檔案的名稱與專案目錄相同。

2. 若要執行專案，請針對你的目標執行 `build/bin/<yourTargetName>/debugExecutable/<專案名稱>.kexe` 指令，例如：

   ```bash
   build/bin/macosArm64/DebugExecutable/hello.kexe
   ```

終端將印出 "Hello, Kotlin/Native!"。

### 在 IDE 中開啟專案 {id="open-the-project-in-ide"}

現在，你可以在任何支援 Gradle 的 IDE 中開啟專案。如果你使用 IntelliJ IDEA：

1. 選取 **File** | **Open**。
2. 選取專案目錄並點擊 **Open**。
   IntelliJ IDEA 會自動偵測它是否為 Kotlin/Native 專案。

如果在專案中遇到問題，IntelliJ IDEA 會在 **Build** 標籤頁中顯示錯誤訊息。

## 使用命令列編譯器 {id="using-the-command-line-compiler"}

在本節中，你將學習如何使用命令列工具中的 Kotlin 編譯器建立 Kotlin/Native 應用程式。

### 下載並安裝編譯器 {id="download-and-install-the-compiler"}

若要安裝編譯器：

1. 前往 Kotlin 的 [GitHub 發行版本](%kotlinLatestUrl%)頁面並向下滾動到 **Assets** 區段。
2. 尋找名稱中包含 `kotlin-native` 的檔案，並下載適合你作業系統的版本，例如 `kotlin-native-prebuilt-linux-x86_64-%kotlinVersion%.tar.gz`。
3. 將封存檔解包至你選擇的目錄。
4. 開啟你的 shell 設定檔，並將編譯器的 `/bin` 目錄路徑新增至 `PATH` 環境變數：

   ```bash
   export PATH="/<path to the compiler>/kotlin-native/bin:$PATH"
   ```

> 雖然編譯器的輸出沒有相依性或虛擬機需求，但編譯器本身需要 Java 1.8 或更高版本的執行階段環境。它受 [JDK 8 (JAVA SE 8) 或更新版本](https://www.oracle.com/java/technologies/downloads/)的支援。
>
{style="note"}

### 建立程式 {id="create-the-program"}

選擇一個工作目錄並建立名為 `hello.kt` 的檔案。使用以下程式碼更新它：

```kotlin
fun main() {
    println("Hello, Kotlin/Native!")
}
```

### 從主控台編譯程式碼 {id="compile-the-code-from-the-console"}

若要編譯應用程式，請使用下載的編譯器執行以下指令：

```bash
kotlinc-native hello.kt -o hello
```

`-o` 選項的值指定了輸出檔案的名稱，因此此呼叫會在 macOS 和 Linux 上產生 `hello.kexe` 二進位檔案（在 Windows 上產生 `hello.exe`）。

有關可用選項的完整清單，請參閱 [Kotlin 編譯器選項](compiler-reference.md)。

### 執行程式 {id="run-the-program"}

若要執行程式，請在命令列工具中巡覽至包含二進位檔案的目錄，並執行以下指令：

<tabs>
<tab title="macOS and Linux">

```none
./hello.kexe
```

</tab>
<tab title="Windows">

```none
./hello.exe
```

</tab>
</tabs>

應用程式會將 "Hello, Kotlin/Native" 印出至標準輸出。

## 接續步驟 {id="what-s-next"}

* 完成[使用 C Interop 和 libcurl 建立應用程式](native-app-with-c-and-libcurl.md)教學，該教學介紹了如何建立原生 HTTP 用戶端並與 C 程式庫進行互通。
* 學習如何[為實際的 Kotlin/Native 專案撰寫 Gradle 組建指令碼](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* 在[文件](gradle.md)中閱讀更多關於 Gradle 建構系統的資訊。