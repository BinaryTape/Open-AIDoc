[//]: # (title: 初めての Kotlin Notebook の作成)

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE に同梱されなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で利用可能です。
>
> 詳細は[ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

<tldr>
   <p>これは <strong>Kotlin Notebook を使い始める</strong> チュートリアルの第 2 部です。続行する前に、前のステップを完了していることを確認してください。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第 1 ステップ"/> <a href="kotlin-notebook-set-up-env.md">環境のセットアップ</a><br/>
      <img src="icon-2.svg" width="20" alt="第 2 ステップ"/> <strong>Kotlin Notebook を作成する</strong><br/>
      <img src="icon-3-todo.svg" width="20" alt="第 3 ステップ"/> Kotlin Notebook に依存関係を追加する<br/>
  </p>
</tldr>

[Kotlin Notebook](kotlin-notebook-overview.md) の使用を開始するには、主に 3 つの方法があります：

* [Kotlin Notebook を含む新しいプロジェクトを作成する](#create-a-new-project) 
* [既存のプロジェクトに Kotlin Notebook を追加する](#add-a-new-kotlin-notebook-to-your-project)
* [スクラッチ Kotlin Notebook を作成する](#create-a-scratch-kotlin-notebook)

## 新規プロジェクトの作成 

Kotlin Notebook を含む新しいプロジェクトを作成するには：

1. IntelliJ IDEA のウェルカム画面で、左側のパネルから **Kotlin Notebook** | **New Notebook** を選択します。
2. 新しいノートブックの **Name**（名前）を入力し、**Type**（タイプ） | **In Folder** を選択します。
   * **Scratch:** プロジェクトに追加せずにスクラッチノートブックを作成する場合のオプションです。
   * **In Folder:** プロジェクト内にノートブックを作成する場合のオプションです。プロジェクトの場所を指定する必要があります。
3. **Create** をクリックします。

![IntelliJ IDEA から新しい Kotlin Notebook を作成する](create-notebook-welcome.png){width=700}

新しいプロジェクト内に新しい Kotlin Notebook が作成されます。

あるいは、空のプロジェクトを作成してから [Kotlin Notebook を追加](#add-a-new-kotlin-notebook-to-your-project) することもできます：

1. IntelliJ IDEA で、**File | New | Project** を選択します。
2. 左側のパネルで **New Project** を選択します。 
3. 新しいプロジェクトに名前を付け、必要に応じて場所を変更します。

   > **Create Git repository** チェックボックスを選択すると、新しいプロジェクトをバージョン管理下に置くことができます。これは後からいつでも行うことができます。
   > 
   {style="tip"}

4. **Language** リストから **Kotlin** を選択します。

   ![新しい Kotlin Notebook プロジェクトの作成](new-notebook-project.png){width=700}

5. **IntelliJ** ビルドシステムを選択します。
6. **JDK** リストから、プロジェクトで使用する [JDK](https://www.oracle.com/java/technologies/downloads/) を選択します。
7. **Add sample code** オプションを有効にして、サンプルの `"Hello World!"` アプリケーションを含むファイルを作成します。

   > **Generate code with onboarding tips** オプションを有効にして、サンプルコードに役立つ追加のコメントを追加することもできます。
   > 
   {style="tip"}

8. **Create** をクリックします。

プロジェクトが作成されたら、新しい Kotlin Notebook を追加します（次のセクションを参照）。

## プロジェクトに新しい Kotlin Notebook を追加する

既存のプロジェクトに新しい Kotlin Notebook を追加するには：

1. **File | New | Kotlin Notebook** を選択するか、フォルダを右クリックして **New | Kotlin Notebook** を選択します。

   ![新しい Kotlin Notebook の作成](new-notebook.png){width=700}

2. 新しいノートブックの名前（例：**first-notebook**）を設定します。
3. **Enter** キーを押します。Kotlin Notebook **first-notebook.ipynb** を含む新しいタブが開きます。

## スクラッチ Kotlin Notebook を作成する

スクラッチファイルとして Kotlin Notebook を作成することもできます。[スクラッチファイル](https://www.jetbrains.com/help/idea/scratches.html#create-scratch-file)を使用すると、新しいプロジェクトを作成したり既存のプロジェクトを変更したりすることなく、小さなコードをテストできます。

スクラッチ Kotlin Notebook を作成するには：

1. **File | New | Scratch File** をクリックします。
2. **New Scratch File** リストから **Kotlin Notebook** を選択します。

   ![スクラッチノートブック](kotlin-notebook-scratch-file.png){width=400}

## 基本操作を行う

1. 新しい Kotlin Notebook のコードセルに次のコードを入力します：

   ```kotlin
   println("Hello, this is a Kotlin Notebook!")
   ```

2. コードセルを実行するには、**Run Cell and Select Below** ![Run Cell and Select Below](run-cell-and-select-below.png){width=30}{type="joined"} ボタンをクリックするか、**Shift** + **Return** キーを押します。
3. **Add Markdown Cell** ボタンをクリックして、Markdown セルを追加します。
4. セルに `# Example operations` と入力し、コードセルと同じ方法で実行してレンダリングします。
5. 新しいコードセルに `10 + 10` と入力して実行します。
6. コードセルで変数を定義します。例：`val a = 100`。

   > 変数を定義したコードセルを一度実行すると、それらの変数は他のすべてのコードセルからアクセス可能になります。
   >
   {style="tip"}

7. 新しいコードセルを作成し、`println(a * a)` を追加します。
8. **Run All** ![Run all button](run-all-button.png){width=30}{type="joined"} ボタンを使用して、ノートブック内のすべてのコードセルと Markdown セルを実行します。

   ![最初のノートブック](first-notebook.png){width=700}

おめでとうございます！初めての Kotlin Notebook を作成し、試すことができました。

## 次のステップ

チュートリアルの次のパートでは、Kotlin Notebook に依存関係を追加する方法を学びます。

**[次の章に進む](kotlin-notebook-add-dependencies.md)**