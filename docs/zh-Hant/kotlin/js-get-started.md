[//]: # (title: 開始使用 Kotlin/JS)

本教學展示如何使用 Kotlin/JavaScript (Kotlin/JS) 為瀏覽器建立 Web 應用程式。
若要建立您的應用程式，請選擇最符合您工作流程的工具：

* **[IntelliJ IDEA](#在-intellij-idea-中建立您的應用程式)**：從版本控制複製專案範本並在 IntelliJ IDEA 中進行開發。
* **[Gradle 建置系統](#使用-gradle-建立您的應用程式)**：手動建立專案的建置檔案，以深入了解底層設定的運作方式。

> 除了以瀏覽器為目標平台外，使用 Kotlin/JS 您還可以編譯至其他環境。
> 如需詳細資訊，請參閱[執行環境](js-project-setup.md#execution-environments)。
> 
{style="tip"}

## 在 IntelliJ IDEA 中建立您的應用程式 {id="create-your-application-in-intellij-idea"}

若要建立 Kotlin/JS Web 應用程式，您可以使用 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。

### 設定環境 {id="set-up-the-environment"}

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。
2. 安裝 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)（請勿與 Kotlin Multiplatform Gradle 外掛程式混淆）。

### 建立您的專案 {id="create-your-project"}

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project from Version Control**。
2. 輸入 [Kotlin/JS 範本專案](https://github.com/Kotlin/kmp-js-wizard)的 URL：

   ```text
   https://github.com/Kotlin/kmp-js-wizard
   ```   
   
3. 點擊 **Clone**。

### 設定您的專案 {id="configure-your-project"}

1. 開啟 `kmp-js-wizard/gradle/libs.versions.toml` 檔案。它包含專案相依性的版本目錄。
2. 確保 Kotlin 版本與 Kotlin Multiplatform Gradle 外掛程式的版本相符，這是建立以 Kotlin/JS 為目標的 Web 應用程式所必需的：

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   
   [plugins]
   kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
   ```

3. 同步 Gradle 檔案（如果您更新了 `libs.versions.toml` 檔案）。點擊建置檔案中出現的 **Load Gradle Changes** 圖示。

   ![Load the Gradle changes 按鈕](load-gradle-changes.png){width=300}

   或者，點擊 Gradle 工具視窗中的重新整理按鈕。

如需有關多平台專案 Gradle 設定的更多資訊，
請參閱 [Multiplatform Gradle DSL 參考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 建置並執行應用程式 {id="build-and-run-the-application"}

1. 開啟 `src/jsMain/kotlin/Main.kt` 檔案。

   * `src/jsMain/kotlin/` 目錄包含專案中 JavaScript 目標的主要 Kotlin 原始碼檔案。
   * `Main.kt` 檔案包含使用 [`kotlinx.browser`](https://github.com/Kotlin/kotlinx-browser) API 在瀏覽器頁面上轉譯 "Hello, Kotlin/JS!" 的程式碼。

2. 點擊 `main()` 函式中的 **Run** 圖示以執行程式碼。

   ![執行應用程式](js-run-gutter.png){width=500}

Web 應用程式將在您的瀏覽器中自動開啟。
或者，在執行完成後，您也可以在瀏覽器中開啟以下 URL：

```text
   http://localhost:8080/
```

您可以看到該 Web 應用程式：

![應用程式輸出](js-output-gutter-1.png){width=600}

首次執行應用程式後，IntelliJ IDEA 會在頂端列建立其對應的執行配置
(**jsMain [js]**)：

![Gradle 執行配置](js-run-config.png){width=500}

> 在擁有 Ultimate 訂閱的 IntelliJ IDEA 中，
> 您可以使用 [JS 偵錯工具](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html)
> 直接從 IDE 偵錯程式碼。
> 
> {style="tip"}

### 啟用持續建置 {id="enable-continuous-build"}

每當您進行變更時，Gradle 可以自動重新建置您的專案：

1. 在執行配置清單中選取 **jsMain [js]**，然後點擊 **More Actions** | **Edit**。

    ![Gradle 編輯執行配置](js-edit-run-config.png){width=500}

2. 在 **Run/Debug Configurations** 對話方塊中，於 **Run** 欄位內輸入 `jsBrowserDevelopmentRun --continuous`。

    ![持續執行配置](js-continuous-run-config.png){width=500}

3. 點擊 **OK**。

現在，當您執行應用程式並進行任何變更時，
每當您儲存（<shortcut>Ctrl + S</shortcut>/<shortcut>Cmd + S</shortcut>）或變更類別檔案時，
Gradle 都會自動對專案執行累加建置並對瀏覽器進行熱重新載入（hot-reload）。

### 修改應用程式 {id="modify-the-application"}

修改應用程式以新增計算單字中字母數量功能。

#### 新增 input 元素 {id="add-an-input-element"}

1. 在 `src/jsMain/kotlin/Main.kt` 檔案中，
   透過[擴充函式](extensions.md#extension-functions)新增一個 [HTML input 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input)以讀取使用者輸入：

   ```kotlin
   // 取代 Element.appendMessage() 函式
   fun Element.appendInput() {
       val input = document.createElement("input")
       appendChild(input)
   }
   ```

2. 在 `main()` 中呼叫 `appendInput()` 函式。它會在頁面上顯示一個 input 元素：

   ```kotlin
   fun main() {
       // 取代 document.body!!.appendMessage(message)
       document.body?.appendInput()
   }
   ```

3. [再次執行應用程式](#建置並執行應用程式)。

    您的應用程式外觀如下：

   ![包含 input 元素的應用程式](js-added-input-element.png){width=600}

#### 新增 input 事件處理 {id="add-an-input-event-handling"}

1. 在 `appendInput()` 函式內新增接聽程式以讀取輸入值並對變更做出反應：

    ```kotlin
   // 取代目前的 appendInput() 函式
    fun Element.appendInput(onChange: (String) -> Unit = {}) {
        val input = document.createElement("input").apply {
            addEventListener("change") { event ->
                onChange(event.target.unsafeCast<HTMLInputElement>().value)
            }
        }
        appendChild(input)
    }
    ```

2. 依照 IDE 的建議匯入 `HTMLInputElement` 相依性。

   ![匯入相依性](js-import-dependency.png){width=600}

3. 在 `main()` 中呼叫 `onChange` 回呼。它會讀取並處理輸入值：

    ```kotlin
    fun main() {
        // 取代 document.body?.appendInput()
        document.body?.appendInput(onChange = { println(it) })
    }
   ```

#### 新增 output 元素

1. 透過定義建立段落的[擴充函式](extensions.md#extension-functions)來新增用於顯示輸出的文字元素：

   ```kotlin
    fun Element.appendTextContainer(): Element {
        return document.createElement("p").also(::appendChild)
    }
   ```
   
2. 在 `main()` 中呼叫 `appendTextContainer()` 函式。它會建立輸出元素：

   ```kotlin
    fun main() {
        // 為我們的輸出建立文字容器
        // 取代 val message = Message(topic = "Kotlin/JS", content = "Hello!")
        val output = document.body?.appendTextContainer()
   
        // 讀取輸入值
        document.body?.appendInput(onChange = { println(it) })
    }
   ```
   
#### 處理輸入以計算字母數量 {id="process-the-input-to-count-the-letters"}

透過移除空白字元並顯示包含字母數量的輸出來處理輸入。

在 `main()` 函式內的 `appendInput()` 函式中新增以下程式碼：

```kotlin
fun main() {
    // 為我們的輸出建立文字容器
    val output = document.body?.appendTextContainer()

    // 讀取輸入值
    // 取代目前的 appendInput() 函式
    document.body?.appendInput(onChange = { name ->
        name.replace(" ", "").let {
            output?.textContent = "Your name contains ${it.length} letters"
        }
    })
}
```

在上述程式碼中：

* [`replace()` 函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html)會移除名字中的空格。
* [`let{}` 作用域函式](scope-functions.md#let)會在物件上下文內執行該函式。
* [字串範本](strings.md#string-templates) (`${it.length}`)
  透過在前面加上錢字號 (`$`) 並用花括號 (`{}`) 包裹，將單字的長度插入字串中。
  而 `it` 則是 [Lambda 參數](coding-conventions.md#lambda-parameters)的預設名稱。

#### 執行應用程式 {id="run-the-application"}

1. [執行應用程式](#建置並執行應用程式)。
2. 輸入您的名字。
3. 按下 <shortcut>Enter</shortcut>。

您可以看到結果：

![應用程式輸出](js-output-gutter-2.png){width=600}

#### 處理輸入以計算不重複字母數量 {id="process-the-input-to-count-unique-letters"}

作為額外練習，讓我們處理輸入以計算並顯示單字中不重複字母的數量：

1. 在 `src/jsMain/kotlin/Main.kt` 檔案中，為 `String` 新增 `.countDistinctCharacters()` [擴充函式](extensions.md#extension-functions)：

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

   在上述程式碼中：

   * [`.lowercase()` 函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html)將名字轉換為小寫。
   * [`toList()` 函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html)將輸入字串轉換為字元清單。
   * [`distinct()` 函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html)僅選取單字中不重複的字元。
   * [`count()` 函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)計算不重複字元的數量。

2. 在 `main()` 中呼叫 `.countDistinctCharacters()` 函式。它會計算您名字中不重複字母的數量：

   ```kotlin
    fun main() {
        // 為我們的輸出建立文字容器
        val output = document.body?.appendTextContainer()
   
        // 讀取輸入值
        document.body?.appendInput(onChange = { name ->
            name.replace(" ", "").let {
                // 印出不重複字母的數量
                // 取代 output?.textContent = "Your name contains ${it.length} letters"
                output?.textContent = "Your name contains ${it.countDistinctCharacters()} unique letters"
            }
        })
   }
   ```

3. 依照步驟[執行應用程式並輸入您的名字](#執行應用程式)。

您可以看到結果：

![應用程式輸出](js-output-gutter-3.png){width=600}

## 使用 Gradle 建立您的應用程式 {id="create-your-application-using-gradle"}

在本節中，您可以了解如何使用 [Gradle](https://gradle.org) 手動建立 Kotlin/JS 應用程式。

Gradle 是 Kotlin/JS 和 Kotlin Multiplatform 專案的預設建構系統。
它也常廣泛用於 Java、Android 和其他生態系統中。

### 建立專案檔案 {id="create-project-files"}

1. 請確保使用與 Kotlin Gradle 外掛程式 (KGP) 相容的 Gradle 版本。
   詳情請參閱[相容性表格](gradle-configure-project.md#apply-the-plugin)。
2. 使用檔案管理員、命令列或任何偏好的工具為您的專案建立一個空目錄。
3. 在專案目錄中，建立具有以下內容的 `build.gradle.kts` 檔案：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // 使用 browser() 在瀏覽器中執行，或使用 nodejs() 在 Node.js 中執行
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // 使用 browser() 在瀏覽器中執行，或使用 nodejs() 在 Node.js 中執行
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   </tabs>

   > 您可以使用不同的[執行環境](js-project-setup.md#execution-environments)，
   > 例如 `browser()` 或 `nodejs()`。
   > 每個環境定義了程式碼執行的位置，並決定了 Gradle 如何在專案中產生任務名稱。
   >
   > {style="note"}

4. 在專案目錄中，建立一個空的 `settings.gradle.kts` 檔案。
5. 在專案目錄中，建立 `src/jsMain/kotlin` 目錄。
6. 在 `src/jsMain/kotlin` 目錄中，新增具有以下內容的 `hello.kt` 檔案：

   ```kotlin
   fun main() {
       println("Hello, Kotlin/JS!")
   }
   ```

   按照慣例，所有原始碼都位於 `src/<target name>[Main|Test]/kotlin` 目錄中：
   * `Main` 是原始碼的位置。
   * `Test` 是測試的位置。
   * `<target name>` 對應於目標平台（在此情況下為 `js`）。

**對於 `browser` 環境**

> 如果您使用的是 `browser` 環境，請遵循後續步驟。
> 如果您使用的是 `nodejs` 環境，
> 請前往[建置並執行專案](#建置並執行專案)章節。
> 
> {style="note"}

1. 在專案目錄中，建立 `src/jsMain/resources` 目錄。
2. 在 `src/jsMain/resources` 目錄中，建立具有以下內容的 `index.html` 檔案：

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Application title</title>
   </head>
   <body>
       <script src="$NAME_OF_YOUR_PROJECT_DIRECTORY.js"></script>
   </body>
   </html>
   ```

3. 將 `<$NAME_OF_YOUR_PROJECT_DIRECTORY>` 占位符號替換為您的專案目錄名稱。

### 建置並執行專案 {id="build-and-run-the-project"}

若要建置專案，請從專案根目錄執行以下指令：

```bash
# 對於瀏覽器
gradle jsBrowserDevelopmentRun

# 或

# 對於 Node.js
gradle jsNodeDevelopmentRun 
```

如果您使用的是 `browser` 環境，
您會看到瀏覽器開啟 `index.html` 檔案並在瀏覽器主控台中輸出 `"Hello, Kotlin/JS!"`。
您可以使用 <shortcut>Ctrl + Shift + J</shortcut>/<shortcut>Cmd + Option + J</shortcut> 指令開啟主控台。

![應用程式輸出](js-output-gutter-4.png){width=600}

如果您使用的是 `nodejs` 環境，您會看到終端輸出 `"Hello, Kotlin/JS!"`。

![應用程式輸出](js-output-gutter-5.png){width=500}

### 在 IDE 中開啟專案 {id="open-the-project-in-an-ide"}

您可以在任何支援 Gradle 的 IDE 中開啟您的專案。

如果您使用 IntelliJ IDEA：

1. 選取 **File** | **Open**。
2. 找到專案目錄。
3. 點擊 **Open**。

IntelliJ IDEA 會自動偵測它是否為 Kotlin/JS 專案。
如果您在專案中遇到問題，
IntelliJ IDEA 會在 **Build** 窗格中顯示錯誤訊息。

## 後續步驟 {id="what-s-next"}

<!-- * Complete the [Create a multiplatform app targeting Web](native-app-with-c-and-libcurl.md) tutorial that explains how
  to share your Kotlin code with a JavaScript/TypeScript application.]: -->

* [設定您的 Kotlin/JS 專案](js-project-setup.md)。
* 了解如何[偵錯 Kotlin/JS 應用程式](js-debugging.md)。
* 了解如何[使用 Kotlin/JS 編寫與執行測試](js-running-tests.md)。
* 了解如何[為真實世界的 Kotlin/JS 專案編寫 Gradle 建置指令碼](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* 進一步閱讀關於 [Gradle 建置系統](gradle.md)。