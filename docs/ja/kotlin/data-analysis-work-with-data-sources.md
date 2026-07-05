[//]: # (title: ファイルからデータを取得する)
[//]: # (description: Kotlin DataFrame を使用して、CSV、JSON、SQL、Excel、Apache Arrow ファイルなどのファイルからデータを読み込む方法を学びます。)

[Kotlin DataFrame ライブラリ](https://kotlin.github.io/dataframe/home.html)を使用すると、非構造化データと構造化データの両方を扱うことができます。
データの変換には、[`.add()`](https://kotlin.github.io/dataframe/adddf.html)、[`.split()`](https://kotlin.github.io/dataframe/split.html)、[`.convert()`](https://kotlin.github.io/dataframe/convert.html)、[`.parse()`](https://kotlin.github.io/dataframe/parse.html) などのメソッドを使用できます。
さらに、このツールセットを使用すると、CSV、JSON、XLS、Parquet、Apache Arrow など、さまざまな構造化ファイル形式からデータを取得し、操作することができます。
サポートされているすべての形式については、[DataFrame のドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。

このガイドでは、複数の例を通して、データの取得、精製、および処理の方法を学ぶことができます。

## 始める前に

> IntelliJ IDEA 2026.2 以降、Kotlin Notebook は IDE にバンドルされなくなり、JetBrains による公式サポートも終了します。
> ソースコードは引き続き [GitHub](https://github.com/Kotlin/kotlin-notebook) で公開されます。
>
> 詳細は[ブログ記事](https://blog.jetbrains.com/idea/2026/06/kotlin-notebook-sunset/)をご覧ください。
>
{style="note"}

このチュートリアルに従うには：

1. **File** | **New** | **Kotlin Notebook** を選択します。
2. Kotlin DataFrame をインポートします：

   ```kotlin
   %use dataframe
   ```

   DataFrame ライブラリとその API をノートブックで確実に利用できるようにするために、他のコードセルを実行する前に `%use dataframe` の行を含むコードセルを実行してください。

このチュートリアルに従うために、DataFrame を [Gradle](https://kotlin.github.io/dataframe/setupgradle.html) または [Maven](https://kotlin.github.io/dataframe/setupmaven.html) の依存関係として使用することもできます。

## データの取得

ファイルからデータを取得するには、`DataFrame.read()` 関数を使用します。

```kotlin
val movies = DataFrame.read("movies.csv")
```

`DataFrame.read()` 関数は、ファイルの拡張子と内容に基づいて入力形式を自動的に検出します。

また、DataFrame ライブラリが入力データを読み込む方法を制御するために、追加の引数を渡すこともできます。例えば、次のコードは CSV ファイルにカスタム区切り文字（`;`）を指定しています：

```kotlin
val movies = DataFrame.read("movies.csv", delimiter = ';')
```

> 追加のファイル形式やさまざまな読み込み関数の包括的な概要については、[Kotlin DataFrame ライブラリのドキュメント](https://kotlin.github.io/dataframe/read.html)を参照してください。
> 
{style="tip"}

## データの表示

データを取得したら、それを表示できます。最も簡単な方法は、データを変数に保存してから、その変数を返すことです：

```kotlin
val jsonDf = DataFrame.read("jsonFile.json")
jsonDf
```

このコードは、ファイルからのデータをインタラクティブなテーブルとして表示します：

![データの表示](display-data.png){width=700}

このビューを使用して、値の検査、列名の確認、データセットの状態の把握を簡単に行うことができます。

## データ構造の検査

データの構造やスキーマを把握するには、DataFrame 変数に対して [`.schema()`](https://kotlin.github.io/dataframe/schema.html) 関数を使用します。

例えば、`jsonDf.schema()` を実行して、JSON データセット内の各列の型をリスト表示します：

![スキーマの例](schema-data-analysis.png){width=700}

Kotlin Notebook では、オートコンプリート機能も使用できます。これにより、DataFrame のプロパティに素早くアクセスし、操作することができます。データを読み込んだ後、DataFrame 変数の後にドット（`.`）を入力するだけで、利用可能な列とその型の一覧が表示されます。

![利用可能なプロパティ](auto-completion-data-analysis.png){width=700}

## データの精製

Kotlin DataFrame は、データセットを精製するためのさまざまな操作を提供しています。例えば、[グルーピング](https://kotlin.github.io/dataframe/group.html)、[フィルタリング](https://kotlin.github.io/dataframe/filter.html)、[更新](https://kotlin.github.io/dataframe/update.html)、[新しい列の追加](https://kotlin.github.io/dataframe/add.html)などがあります。これらの関数はデータ分析に不可欠であり、データを効果的に整理、クリーンアップ、変換することができます。

例として、`movies.csv` データセットを見てみましょう。このデータセットでは、映画のタイトルと同じセルに公開年が保存されています。目標は、分析しやすくするためにこのデータセットを精製することです：

1. **データの読み込み**

   `.read()` 関数を使用して、ファイルを `DataFrame` に読み込みます：

   ```kotlin
   val movies = DataFrame.read("movies.csv")
   ```

2. **列の追加** 

   `title` 列から公開年を抽出するために、新しい `year` 列を追加します：

   ```kotlin
   val moviesWithYear = movies
       .add("year") { 
           "\\d{4}".toRegex()
               .findAll(title)
               .lastOrNull()
               ?.value
               ?.toInt()
               ?: -1
       }
   
   moviesWithYear
   ```

3. **値の更新**

   映画のタイトルから公開年を削除するために、`title` 列を更新します：

   ```kotlin
   val moviesTitle = moviesWithYear
       .update("title") {
           "\\s*\\(\\d{4}\\)\\s*$".toRegex().replace(title, "") 
   }
   
   moviesTitle
   ```

   このコードにより、映画のタイトルが 1 つの列に保持され、公開年が別の列に移動します。

4. **行のフィルタリング**

   特定のデータに焦点を当てるには、`.filter()` 関数を使用します。例えば、1986 年より後に公開された映画のみを保持するには、次を実行します：

   ```kotlin
   val newMovies = moviesTitle.filter { 
       year >= 1996 
   }
   
   newMovies
   ```

5. **列の削除**

   不要な列を削除するには、`.remove()` 関数を使用します：

   ```kotlin
   val refinedMovies = newMovies.remove { 
       movieID 
   }
   
   refinedMovies
   ```

比較のために、精製前のデータセットを以下に示します：

![元のデータセット](original-dataset.png){width=700}

精製後のデータセット：

![データ精製の結果](refined-data.png){width=700}

> 追加のユースケースや詳細な例については、[Kotlin DataFrame の例](https://github.com/Kotlin/dataframe/tree/master/examples)を参照してください。
> 
{style="tip"}

## データの書き出し

データを精製した後、簡単にエクスポートできます。

この目的のために、さまざまな [`.write()`](https://kotlin.github.io/dataframe/write.html) 関数を利用できます。CSV、JSON、XLS、XLSX、Apache Arrow、さらには HTML テーブルなど、複数の形式での保存をサポートしています。
サポートされているすべての形式については、[DataFrame のドキュメント](https://kotlin.github.io/dataframe/data-sources.html)を参照してください。
これは、知見を共有したり、レポートを作成したり、さらなる分析のためにデータを利用可能にしたりするのに特に役立ちます。

例えば、結果を次のように保存してみましょう：

* [`.writeJson()`](https://kotlin.github.io/dataframe/write.html#writing-to-json) 関数を使用した JSON ファイル：

  ```kotlin
  refinedMovies.writeJson("movies.json")
  ```
* [`.writeCsv()`](https://kotlin.github.io/dataframe/write.html#writing-to-csv) 関数を使用した CSV ファイル： 

  ```kotlin
  refinedMovies.writeCsv("movies.csv")
  ```

* `.writeArrowIPC()` および `.writeArrowFeather()` 関数を使用した [Apache Arrow ファイル](https://kotlin.github.io/dataframe/write.html#writing-to-apache-arrow-formats)：

  ```kotlin
  refinedMovies.writeArrowIPC("movies.arrow")
  refinedMovies.writeArrowFeather("movies.feather")
  ```

また、[`.toStandaloneHTML()`](https://kotlin.github.io/dataframe/tohtml.html) 関数を使用して、ブラウザでスタンドアロンの HTML テーブルを開くこともできます：

```kotlin
refinedMoviesDf
    .toStandaloneHTML(DisplayConfiguration(rowsLimit = null))
    .openInBrowser()
```

## 次のステップ

* [Kandy ライブラリ](https://kotlin.github.io/kandy/examples.html)を使用したデータの可視化を探索する
* [Kandy を使用したデータの可視化](data-analysis-visualization.md)でデータの可視化に関する追加情報を見つける
* Kotlin でのデータサイエンスと分析に利用可能なツールとリソースの広範な概要については、[データ分析用の Kotlin および Java ライブラリ](data-analysis-libraries.md)を参照してください。