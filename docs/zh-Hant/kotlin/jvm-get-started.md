[//]: # (title: 建立主控台應用程式 – 教學)

<web-summary>在 IntelliJ IDEA 中建立 Kotlin 主控台應用程式，並使用 Kotlin 編譯器執行它。</web-summary>

本教學示範如何使用 IntelliJ IDEA 建立主控台應用程式。

若要開始，請先下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。

## 建立專案 {id="create-a-project"}

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
2. 在左側清單中，選取 **Kotlin**。
3. 為新專案命名，並在必要時變更其位置。

   > 選取 **Create Git repository** 核取方塊以將新專案置於版本控制之下。你之後隨時都可以再執行此操作。
   >
   {style="tip"}
   
   ![建立主控台應用程式](jvm-new-project.png){width=700}

4. 選取 **IntelliJ** 建置系統。這是一個原生建置器，不需要下載額外的構件。

   如果你想建立更複雜、需要進一步配置的專案，請選取 Maven 或 Gradle。對於 Gradle，請為建置指令碼選擇一種語言：Kotlin 或 Groovy。
5. 從 **JDK** 清單中，選取你想在專案中使用的 [JDK](https://www.oracle.com/java/technologies/downloads/)。
   * 如果 JDK 已安裝在你的電腦上，但尚未在 IDE 中定義，請選取 **Add JDK** 並指定 JDK 根目錄的路徑。
   * 如果你的電腦上沒有所需的 JDK，請選取 **Download JDK**。

6. 啟用 **Add sample code** 選項以建立包含範例 `"Hello World!"` 應用程式的檔案。

    > 你也可以啟用 **Generate code with onboarding tips** 選項，為你的範例程式碼新增一些有用的額外註解。
    >
    {style="tip"}

7. 點擊 **Create**。

    > 如果你選擇了 Gradle 建置系統，你的專案中會包含一個建置指令碼檔案：`build.gradle(.kts)`。它包含主控台應用程式所需的 `kotlin("jvm")` 外掛程式與相依性。請確認你使用的是最新版本的外掛程式：
    > 
    > <tabs group="build-script">
    > <tab title="Kotlin" group-key="kotlin">
    > 
    > ```kotlin
    > plugins {
    >     kotlin("jvm") version "%kotlinVersion%"
    >     application
    > }
    > ```
    > 
    > </tab>
    > <tab title="Groovy" group-key="groovy">
    > 
    > ```groovy
    > plugins {
    >     id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    >     id 'application'
    > }
    > ```
    > 
    > </tab>
    > </tabs>
    > 
    {style="note"}

## 建立應用程式 {id="create-an-application"}

1. 開啟位於 `src/main/kotlin` 中的 `Main.kt` 檔案。  
   `src` 目錄包含 Kotlin 原始碼檔案與資源。`Main.kt` 檔案包含將列印 `Hello, Kotlin!` 以及數行迴圈反覆運算變數值的範例程式碼。

   ![包含 main 函式的 Main.kt](jvm-main-kt-initial.png){width=700}

2. 修改程式碼，使其詢問你的名字並向你打招呼 `Hello`：

   * 建立輸入提示，並將 [`readln()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln.html) 函式傳回的值指派給 `name` 變數。
   * 讓我們使用字串範本取代字串連接，直接在文字輸出中的變數名稱前加上錢字號 `$`，例如：`$name`。
   
   ```kotlin
   fun main() {
       println("What's your name?")
       val name = readln()
       println("Hello, $name!")
   
       // ...
   }
   ```

## 執行應用程式 {id="run-the-application"}

現在應用程式已準備好執行。最簡單的方法是點擊邊欄中的綠色 **Run** 圖示，然後選取 **Run 'MainKt'**。

![執行主控台應用程式](jvm-run-app.png){width=350}

你可以在 **Run** 工具視窗中查看結果。

![Kotlin 執行輸出](jvm-output-1.png){width=600}
   
輸入你的名字並接受來自應用程式的問候！

![Kotlin 執行輸出](jvm-output-2.png){width=600}

恭喜！你剛執行了你的第一個 Kotlin 應用程式。

## 下一步？ {id="what-s-next"}

建立此應用程式後，你可以開始深入探索 Kotlin 語法：

* 參加 [Kotlin 導覽](kotlin-tour-welcome.md) 
* 為 IDEA 安裝 [JetBrains Academy 外掛程式](https://plugins.jetbrains.com/plugin/10081-jetbrains-academy) 並完成來自 [Kotlin Koans 課程](https://plugins.jetbrains.com/plugin/10081-jetbrains-academy/docs/learner-start-guide.html?section=Kotlin%20Koans)的練習