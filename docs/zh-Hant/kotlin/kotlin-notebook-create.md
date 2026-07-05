[//]: # (title: 建立您的第一個 Kotlin Notebook)

> 從 IntelliJ IDEA 2026.2 開始，Kotlin Notebook 將不再與 IDE 隨附提供，也不再由 JetBrains 官方提供支援。
> 原始碼將繼續在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 若要了解更多資訊，請參閱 [部落格文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

<tldr>
   <p>這是 <strong>Kotlin Notebook 快速入門</strong>教學的第二部分。在繼續之前，請確保您已完成上一個步驟。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="kotlin-notebook-set-up-env.md">設定環境</a><br/>
      <img src="icon-2.svg" width="20" alt="第二步"/> <strong>建立 Kotlin Notebook</strong><br/>
      <img src="icon-3-todo.svg" width="20" alt="第三步"/> 將相依性新增至 Kotlin Notebook<br/>
  </p>
</tldr>

您可以透過以下三種主要方式開始使用您的 [Kotlin Notebook](kotlin-notebook-overview.md)：

* [建立包含 Kotlin Notebook 的新專案](#create-a-new-project) 
* [將 Kotlin Notebook 新增至現有專案](#add-a-new-kotlin-notebook-to-your-project)
* [建立暫存 Kotlin Notebook](#create-a-scratch-kotlin-notebook)

## 建立新專案 

若要建立一個包含 Kotlin Notebook 的新專案：

1. 在 IntelliJ IDEA 的歡迎畫面中，從左側面板選擇 **Kotlin Notebook** | **New Notebook**。
2. 為您的新筆記本輸入 **Name**，並選擇 **Type** | **In Folder**。
   * **Scratch：** 此選項用於建立暫存筆記本，而不將其新增至專案。
   * **In Folder：** 此選項用於在專案內建立筆記本。您必須指定專案的位置。
3. 點擊 **Create**。

![從 IntelliJ IDEA 建立新的 Kotlin Notebook](create-notebook-welcome.png){width=700}

您的新 Kotlin Notebook 已在一個新專案中建立完成。

或者，您可以先建立一個空專案，然後再[將 Kotlin Notebook 新增至您的專案](#add-a-new-kotlin-notebook-to-your-project)：

1. 在 IntelliJ IDEA 中，選擇 **File | New | Project**。
2. 在左側面板中，選擇 **New Project**。 
3. 為新專案命名，並在必要時更改其位置。

   > 選取 **Create Git repository** 核取方塊，將新專案納入版本控制。 
   > 您之後隨時可以執行此操作。
   > 
   {style="tip"}

4. 從 **Language** 清單中，選擇 **Kotlin**。

   ![建立新的 Kotlin Notebook 專案](new-notebook-project.png){width=700}

5. 選擇 **IntelliJ** 建置系統。
6. 從 **JDK** 清單中，選擇您想在專案中使用的 [JDK](https://www.oracle.com/java/technologies/downloads/)。
7. 啟用 **Add sample code** 選項，以建立一個包含範例 `"Hello World!"` 應用程式的檔案。

   > 您也可以啟用 **Generate code with onboarding tips** 選項，在範例程式碼中加入一些額外的實用註解。
   > 
   {style="tip"}

8. 點擊 **Create**。

專案建立完成後，請新增一個新的 Kotlin Notebook（請參閱下一節）。

## 將新的 Kotlin Notebook 新增至您的專案

若要將新的 Kotlin Notebook 新增至現有專案： 

1. 選擇 **File | New | Kotlin Notebook**，或在資料夾上點擊右鍵並選擇 **New | Kotlin Notebook**。

   ![建立新的 Kotlin Notebook](new-notebook.png){width=700}

2. 設定新筆記本的名稱，例如 **first-notebook**。
3. 按下 **Enter 鍵**。隨即會開啟一個帶有 Kotlin Notebook **first-notebook.ipynb** 的新索引標籤。

## 建立暫存 Kotlin Notebook

您也可以將 Kotlin Notebook 建立為暫存檔。[暫存檔](https://www.jetbrains.com/help/idea/scratches.html#create-scratch-file) 讓您可以在不建立新專案或修改現有專案的情況下，測試小段程式碼。

若要建立暫存 Kotlin Notebook：

1. 點擊 **File | New | Scratch File**。
2. 從 **New Scratch File** 清單中選擇 **Kotlin Notebook**。

   ![暫存筆記本](kotlin-notebook-scratch-file.png){width=400}

## 執行基本操作

1. 在新的 Kotlin Notebook 中，在程式碼資料格中輸入以下程式碼：

   ```kotlin
   println("Hello, this is a Kotlin Notebook!")
   ```

2. 若要執行程式碼資料格，請點擊 **Run Cell and Select Below** ![執行資料格並選取下方](run-cell-and-select-below.png){width=30}{type="joined"} 按鈕，或按下 **Shift 鍵** + **Return 鍵**。
3. 點擊 **Add Markdown Cell** 按鈕來新增 Markdown 資料格。
4. 在資料格中輸入 `# Example operations`，並以執行程式碼資料格的相同方式執行它以進行渲染。
5. 在新的程式碼資料格中，輸入 `10 + 10` 並執行。
6. 在程式碼資料格中定義一個變數。例如 `val a = 100`。

   > 一旦您執行了定義變數的程式碼資料格，這些變數就可以在所有其他程式碼資料格中存取。
   >
   {style="tip"}

7. 建立一個新的程式碼資料格並加入 `println(a * a)`。
8. 使用 **Run All** ![全部執行按鈕](run-all-button.png){width=30}{type="joined"} 按鈕執行筆記本中所有的程式碼和 Markdown 資料格。

   ![第一個筆記本](first-notebook.png){width=700}

恭喜！您剛剛建立並試用了您的第一個 Kotlin Notebook。

## 下一步

在教學的下一部分中，您將學習如何將相依性新增至 Kotlin Notebook。

**[繼續閱讀下一章節](kotlin-notebook-add-dependencies.md)**