[//]: # (title: 创建您的第一个 Kotlin Notebook)

> 从 IntelliJ IDEA 2026.2 开始，Kotlin Notebook 将不再随 IDE 捆绑提供，也不再由 JetBrains 官方支持。
> 源代码将继续在 [GitHub](https://github.com/Kotlin/kotlin-notebook) 上提供。
>
> 要了解更多信息，请参阅 [博客文章](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)。
>
{style="note"}

<tldr>
   <p>这是 <strong>Kotlin Notebook 入门</strong>教程的第二部分。在继续之前，请确保您已完成上一步。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="kotlin-notebook-set-up-env.md">设置环境</a><br/>
      <img src="icon-2.svg" width="20" alt="第二步"/> <strong>创建 Kotlin Notebook</strong><br/>
      <img src="icon-3-todo.svg" width="20" alt="第三步"/> 向 Kotlin Notebook 添加依赖项<br/>
  </p>
</tldr>

您可以通过以下三种主要方式开始使用 [Kotlin Notebook](kotlin-notebook-overview.md)：

* [创建包含 Kotlin Notebook 的新项目](#create-a-new-project) 
* [向现有项目添加 Kotlin Notebook](#add-a-new-kotlin-notebook-to-your-project)
* [创建临时 Kotlin Notebook](#create-a-scratch-kotlin-notebook)

## 创建新项目 

要创建一个包含 Kotlin Notebook 的新项目：

1. 在 IntelliJ IDEA 的欢迎界面中，从左侧面板选择 **Kotlin Notebook** | **New Notebook**。
2. 为您的新笔记本输入 **Name**（名称），并在 **Type**（类型）中选择 **In Folder**。
   * **Scratch：** 此选项用于创建临时笔记本，而无需将其添加到项目中。
   * **In Folder：** 此选项用于在项目内创建笔记本。您必须指定项目的位置。
3. 点击 **Create**。

![从 IntelliJ IDEA 创建新的 Kotlin Notebook](create-notebook-welcome.png){width=700}

您的新 Kotlin Notebook 将在一个新项目中创建。

或者，先创建一个空项目，然后[添加 Kotlin Notebook](#add-a-new-kotlin-notebook-to-your-project)：

1. 在 IntelliJ IDEA 中，选择 **File | New | Project**。
2. 在左侧面板中，选择 **New Project**。 
3. 为新项目命名，并根据需要更改其位置。

   > 勾选 **Create Git repository** 复选框以将新项目置于版本控制之下。 
   > 您以后随时可以执行此操作。
   > 
   {style="tip"}

4. 从 **Language** 列表中选择 **Kotlin**。

   ![创建新的 Kotlin Notebook 项目](new-notebook-project.png){width=700}

5. 选择 **IntelliJ** 构建系统。
6. 从 **JDK** 列表中选择您要在项目中使用的 [JDK](https://www.oracle.com/java/technologies/downloads/)。
7. 启用 **Add sample code** 选项以创建一个包含示例 `"Hello World!"` 应用程序的文件。

   > 您还可以启用 **Generate code with onboarding tips** 选项，在示例代码中添加一些额外的有用注释。
   > 
   {style="tip"}

8. 点击 **Create**。

项目创建完成后，添加一个新的 Kotlin Notebook（参见下一部分）。

## 向现有项目添加新的 Kotlin Notebook

要向现有项目添加新的 Kotlin Notebook： 

1. 选择 **File | New | Kotlin Notebook**，或右键点击文件夹并选择 **New | Kotlin Notebook**。

   ![创建新的 Kotlin Notebook](new-notebook.png){width=700}

2. 设置新笔记本的名称，例如 **first-notebook**。
3. 按 **Enter** 键。此时会打开一个带有 Kotlin Notebook **first-notebook.ipynb** 的新选项卡。

## 创建临时 Kotlin Notebook

您还可以将 Kotlin Notebook 创建为临时文件。[临时文件](https://www.jetbrains.com/help/idea/scratches.html#create-scratch-file)允许您测试一小段代码，而无需创建新项目或修改现有项目。

要创建临时 Kotlin Notebook：

1. 点击 **File | New | Scratch File**。
2. 从 **New Scratch File** 列表中选择 **Kotlin Notebook**。

   ![临时笔记本](kotlin-notebook-scratch-file.png){width=400}

## 执行基本操作

1. 在新的 Kotlin Notebook 中，在代码单元中输入以下代码：

   ```kotlin
   println("Hello, this is a Kotlin Notebook!")
   ```

2. 要运行代码单元，点击 **Run Cell and Select Below** ![运行单元并选择下方](run-cell-and-select-below.png){width=30}{type="joined"} 按钮或按 **Shift** + **回车**。
3. 点击 **Add Markdown Cell** 按钮添加一个 Markdown 单元。
4. 在单元中输入 `# Example operations`，并以运行代码单元的相同方式运行它以进行渲染。
5. 在一个新的代码单元中，输入 `10 + 10` 并运行它。
6. 在代码单元中定义一个变量。例如 `val a = 100`。

   > 一旦运行了带有定义变量的代码单元，这些变量就可以在所有其他代码单元中访问。
   >
   {style="tip"}

7. 创建一个新的代码单元并添加 `println(a * a)`。
8. 使用 **Run All** ![全部运行按钮](run-all-button.png){width=30}{type="joined"} 按钮运行笔记本中的所有代码和 Markdown 单元。

   ![第一个笔记本](first-notebook.png){width=700}

恭喜！您刚刚创建并试用了您的第一个 Kotlin Notebook。

## 下一步

在本教程的下一部分中，您将学习如何向 Kotlin Notebook 添加依赖项。

**[前往下一章](kotlin-notebook-add-dependencies.md)**